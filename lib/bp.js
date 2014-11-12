//Benchpress Facade
function BenchPress (locals) {
  var Utils = require('./Utils.js');
  var Variables = require('./Variables');

  // Left benchmarkSteps on global for backwards-compatibility
  this.steps = window.benchmarkSteps = [];
  this._window = locals && locals.win? locals.win : window;
  this.utils = new Utils();
  this.variables = new Variables(this.utils, this._window);

  //Legacy Support
  this.Variables = this.variables;
  this.Utils = this.utils;
}

BenchPress.prototype.setFakeWindow = function(win) {
  bp._window = win;
};

var bp = window.bp = new BenchPress();
