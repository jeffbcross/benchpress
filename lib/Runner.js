(function(bp) {
function Runner () {
  this.runState = {
    iterations: 0,
    numSamples: 20,
    recentResult: {}
  };
}

Runner.prototype.setIterations = function (iterations) {
  this.runState.iterations = iterations;
};

Runner.prototype.resetIterations = function() {
  this.runState.iterations = 0;
};

Runner.prototype.loopBenchmark = function () {
  if (this.runState.iterations <= -1) {
    //Time to stop looping
    this.setIterations(0);
    bp.doc.loopBtn.innerText = 'Loop';
    return;
  }
  this.setIterations(-1);
  bp.doc.loopBtn.innerText = 'Pause';
  this.runAllTests();
};

Runner.prototype.onceBenchmark = function() {
  this.setIterations(1);
  bp.doc.onceBtn.innerText = '...';
  this.runAllTests(function() {
    bp.doc.onceBtn.innerText = 'Once';
  });
};

Runner.prototype.twentyFiveBenchmark = function() {
  var twentyFiveBtn = bp.doc.twentyFiveBtn;
  this.setIterations(25);
  twentyFiveBtn.innerText = 'Looping...';
  this.runAllTests(function() {
    twentyFiveBtn.innerText = 'Loop 25x';
  }, 5);
};

Runner.prototype.runAllTests = function (done) {
  var self = this;
  if (this.runState.iterations--) {
    bp.steps.forEach(function(bs) {
      var testResults = self.runTimedTest(bs);
      self.runState.recentResult[bs.name] = testResults;
    });
    bp.Report.markup = bp.Report.calcStats();
    bp.doc.writeReport(bp.Report.markup);
    window.requestAnimationFrame(function() {
      self.runAllTests(done);
    });
  }
  else {
    bp.doc.writeReport(bp.Report.markup);
    this.resetIterations();
    done && done();
  }
};


Runner.prototype.profile = function() {
  console.profile();
  this.onceBenchmark();
  console.profileEnd();
};


Runner.prototype.runTimedTest = function (bs) {
  var startTime,
      endTime,
      startGCTime,
      endGCTime,
      retainedMemory,
      garbage,
      beforeHeap,
      afterHeap,
      finalHeap;
  if (typeof window.gc === 'function') {
    window.gc();
  }

  if (window.performance && window.performance.memory) {
    beforeHeap = performance.memory.usedJSHeapSize;
  }

  startTime = bp.measure.numMilliseconds();
  bs.fn();
  endTime = bp.measure.numMilliseconds() - startTime;

  if (window.performance && window.performance.memory) {
    afterHeap = performance.memory.usedJSHeapSize;
  }

  startGCTime = bp.measure.numMilliseconds();
  if (typeof window.gc === 'function') {
    window.gc();
  }
  endGCTime = bp.measure.numMilliseconds() - startGCTime;

  if (window.performance && window.performance.memory) {
    finalHeap = performance.memory.usedJSHeapSize;
    garbage = Math.abs(finalHeap - afterHeap);
    retainedMemory = finalHeap - beforeHeap;
  }
  return {
    testTime: endTime,
    gcTime: endGCTime || 0,
    beforeHeap: beforeHeap || 0,
    garbageCount: garbage || 0,
    retainedCount: retainedMemory || 0
  };
};

bp.runner = new Runner();
//Legacy Support
bp.Runner = bp.runner;

}(bp));
