var di = require('di');
var Document = require('./Document');
var Measure = require('./Measure');
var Report = require('./HtmlReport');
var Runner = require('./Runner');
var Statistics = require('./Statistics');
var Utils = require('./Utils');
var Variables = require('./Variables');
var Values = require('./Values');

//Benchpress Facade
function BenchPress (doc, measure, report, runner, statistics, utils, variables, values, locals) {
  // Left benchmarkSteps on global for backwards-compatibility
  this.steps = window.benchmarkSteps = [];
  this.scripts = [];
  this._window = locals && locals.win? locals.win : window;

  this.doc = doc;
  this.measure = measure;
  this.report = report;
  this.runner = runner;
  this.statistics = statistics;
  this.utils = utils;
  this.values = values;
  this.variables = variables;

  //Legacy Support
  this.Document = this.doc;
  this.Measure = this.measure;
  this.Utils = this.utils;
  this.Runner = this.runner;
  this.Report = this.report;
  this.Statistics = this.statistics;
  this.Variables = this.variables;
}

BenchPress.prototype.setFakeWindow = function(win) {
  bp._window = win;
};

// var bp = window.bp = new BenchPress();
di.annotate(BenchPress, new di.Inject(Document, Measure, Report, Runner, Statistics, Utils, Variables, Values))
module.exports = BenchPress;
