//Benchpress Facade
var bp = window.bp = {
  // Left benchmarkSteps on global for backwards-compatibility
  steps: window.benchmarkSteps = [],
  Utils: {}
};

bp._window = window;

bp.setFakeWindow = function(win) {
  bp._window = win;
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
