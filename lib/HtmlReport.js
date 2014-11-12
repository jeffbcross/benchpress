(function(bp) {
function Report() {
  this.timesPerAction = {};
}

Report.prototype.generatePartial = function(model) {
  return bp.Document.infoTemplate(model);
};

Report.prototype.getTimesPerAction = function(name) {
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

Report.prototype.rightSizeTimes = function(times) {
  var delta = times.length - bp.runner.runState.numSamples;
  if (delta > 0) {
    return times.slice(delta);
  }

  return times;
};

Report.prototype.updateTimes = function(tpa, index, reference, recentTime) {
  var curTpa = tpa[reference];
  curTpa.recent = recentTime;
  curTpa.history[index] = recentTime;
  curTpa.history = bp.Report.rightSizeTimes(curTpa.history);
  curTpa.min = Math.min(curTpa.min, recentTime);
  curTpa.max = Math.max(curTpa.max, recentTime);
};

Report.prototype.calcStats = function() {
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

bp.report = new Report();
//Legacy Support
bp.Report = bp.report;
}(bp));
