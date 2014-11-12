//Benchpress Facade
function BenchPress (locals) {
  var Document = require('./Document');
  var Runner = require('./Runner');
  var Utils = require('./Utils');
  var Variables = require('./Variables');
  var Values = require('./Values');

  // Left benchmarkSteps on global for backwards-compatibility
  this.steps = window.benchmarkSteps = [];
  this.scripts = [];
  this._window = locals && locals.win? locals.win : window;
  this.values = new Values();

  //Old-Fashioned Dependency Injection
  this.utils = new Utils();
  this.runner = new Runner();
  this.doc = new Document(this.values, this.utils, this.scripts, this.runner, {win: this._window});
  this.variables = new Variables(this.utils, {win: this._window});

  //Legacy Support
  this.Variables = this.variables;
  this.Document = this.document;
  this.Utils = this.utils;
  this.Runner = this.runner;
}

BenchPress.prototype.setFakeWindow = function(win) {
  bp._window = win;
};

var bp = window.bp = new BenchPress();
