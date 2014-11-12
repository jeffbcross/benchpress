var bp = window.bp = {
  // Left benchmarkSteps on global for backwards-compatibility
  steps: window.benchmarkSteps = [],
  Statistics: {
    //Taken from z-table where confidence is 95%
    criticalValue: 1.96
  },
  Variables: {
    variables: []
  },
  Utils: {},
  Report: {
    timesPerAction: {}
  },
  Measure: {
    characteristics: ['gcTime','testTime','garbageCount','retainedCount']
  }
};

bp._window = window;

bp.setFakeWindow = function(win) {
  bp._window = win;
};

bp.Variables._setPendingFromSearch = function() {
  if (bp.Variables._pending === undefined) {
    bp.Variables._pending = bp.Utils.
        parseSearch(bp._window.location.search).variable;
  }
};

bp.Variables._autoSelectPending = function() {
  if (bp.Variables._pending !== null && bp.Variables._pending !== undefined) {
    return bp.Variables.select(bp.Variables._pending);
    var reduced =  bp.Variables.variables.reduce(function(prev, curr) {
      prev[curr.value] = curr;
      return prev;
    }, {});
    bp.Variables.selected = reduced[bp.Variables._pending];
  }
};

bp.Variables.add = function (variable) {
  bp.Variables._setPendingFromSearch();
  bp.Variables.variables.push(variable);
  bp.Variables._autoSelectPending();
};

bp.Variables.addMany = function (varArr) {
  bp.Variables._setPendingFromSearch();
  bp.Variables.variables.push.apply(bp.Variables.variables, varArr);
  bp.Variables._autoSelectPending();
};

bp.Variables.select = function (val) {
  bp.Variables.selected = bp.Variables.variables.reduce(function(prev, curr) {
    prev[curr.value] = curr;
    return prev;
  }, {})[val];
  if (bp.Variables.selected !== undefined) bp.Variables._pending = null;
};

bp.Measure.numMilliseconds = function() {
  if (window.performance != null && typeof window.performance.now == 'function') {
    return window.performance.now();
  } else if (window.performance != null && typeof window.performance.webkitNow == 'function') {
    return window.performance.webkitNow();
  } else {
    console.log('using Date.now');
    return Date.now();
  }
};

bp.Statistics.getMean = function (sample) {
  var total = 0;
  sample.forEach(function(x) { total += x; });
  return total / sample.length;
};

bp.Statistics.calculateConfidenceInterval = function(standardDeviation, sampleSize) {
  var standardError = standardDeviation / Math.sqrt(sampleSize);
  return bp.Statistics.criticalValue * standardError;
};

bp.Statistics.calculateRelativeMarginOfError = function(marginOfError, mean) {
  /*
   * Converts absolute margin of error to a relative margin of error by
   * converting it to a percentage of the mean.
   */
  return (marginOfError / mean);
};

bp.Statistics.calculateCoefficientOfVariation = function(standardDeviation, mean) {
  return standardDeviation / mean;
};

bp.Statistics.calculateStandardDeviation = function(sample, mean) {
  var deviation = 0;
  sample.forEach(function(x) {
    deviation += Math.pow(x - mean, 2);
  });
  deviation = deviation / (sample.length -1);
  deviation = Math.sqrt(deviation);
  return deviation;
};

bp.Report.generatePartial = function(model) {
  return bp.Document.infoTemplate(model);
};

bp.Report.getTimesPerAction = function(name) {
  var tpa = bp.Report.timesPerAction[name];
  if (!tpa) {
    tpa = bp.Report.timesPerAction[name] = {
      name: name,
      nextEntry: 0
    };
    _.each(bp.Measure.characteristics, function(c) {
      tpa[c] = {
        recent: undefined,
        history: [],
        avg: {},
        min: Number.MAX_VALUE,
        max: Number.MIN_VALUE
      };
    });
  }
  return tpa;
};

bp.Report.rightSizeTimes = function(times) {
  var delta = times.length - bp.runner.runState.numSamples;
  if (delta > 0) {
    return times.slice(delta);
  }

  return times;
};

bp.Report.updateTimes = function(tpa, index, reference, recentTime) {
  var curTpa = tpa[reference];
  curTpa.recent = recentTime;
  curTpa.history[index] = recentTime;
  curTpa.history = bp.Report.rightSizeTimes(curTpa.history);
  curTpa.min = Math.min(curTpa.min, recentTime);
  curTpa.max = Math.max(curTpa.max, recentTime);
};

bp.Report.calcStats = function() {
  var report = '';
  bp.steps.forEach(function(bs) {
    var recentResult = bp.runner.runState.recentResult[bs.name],
        tpa = bp.Report.getTimesPerAction(bs.name);

    tpa.description = bs.description;
    _.each(bp.Measure.characteristics, function(c) {
      bp.Report.updateTimes(tpa, tpa.nextEntry, c, recentResult[c]);
      var mean = bp.Statistics.getMean(tpa[c].history);
      var stdDev = bp.Statistics.calculateStandardDeviation(tpa[c].history, mean);
      tpa[c].avg = {
        mean: mean,
        stdDev: stdDev,
        coefficientOfVariation: bp.Statistics.calculateCoefficientOfVariation(stdDev, mean)
      };
    });

    tpa.nextEntry++;
    tpa.nextEntry %= bp.runner.runState.numSamples;

    report += bp.Report.generatePartial(tpa);
  });
  return report;
};

bp.Utils.parseSearch = function (search) {
  var parsed = {};
  var tuples = search.replace(/^\?/, '').split('&');
  tuples.forEach(function(pair) {
    var keyVal = pair.split('=');
    parsed[keyVal[0]] = keyVal[1];
  });
  return parsed;
};




