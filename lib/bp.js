//Benchpress Facade
function BenchPress (locals) {
    // Left benchmarkSteps on global for backwards-compatibility
  this.steps = window.benchmarkSteps = [];
  this._window = locals && locals.win? locals.win : window;
}

BenchPress.prototype.setFakeWindow = function(win) {
  bp._window = win;
};

var bp = window.bp = new BenchPress();
