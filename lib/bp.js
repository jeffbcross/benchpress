//Benchpress Facade
var bp = window.bp = {
  // Left benchmarkSteps on global for backwards-compatibility
  steps: window.benchmarkSteps = []
};

bp._window = window;

bp.setFakeWindow = function(win) {
  bp._window = win;
};
