function Document(values, utils, scripts, runner, locals) {
  this._values = values;
  this._utils = utils;
  this._scripts = scripts;
  this._runner = runner;
  this._window = locals && locals.win? locals.win : window;
}

Document.prototype.addSampleRange = function() {
  this.sampleRange = this.container().querySelector('#sampleRange');
  if (this.sampleRange) {
    this.sampleRange.value = Math.max(this._values.defaultNumSamples, 1);
    this.sampleRange.addEventListener('input', this.onSampleInputChanged);
  }
};

Document.prototype.onSampleInputChanged = function (evt) {
  var value = evt.target.value;
  this._values.defaultNumSamples = parseInt(value, 10);
};

Document.prototype.container = function() {
  if (!this._container) {
    this._container = document.querySelector('#benchmarkContainer');
  }
  return this._container;
}

Document.prototype.addButton = function(reference, handler) {
  var container = this.container();
  this[reference] = container.querySelector('button.' + reference);
  if (this[reference]) {
    this[reference].addEventListener('click', handler);
  }
}

Document.prototype.addInfo = function() {
  this.infoDiv = this.container().querySelector('div.info');
  if (this.infoDiv) {
    this.infoTemplate = _.template(this.container().querySelector('#infoTemplate').innerHTML);
  }
};

Document.prototype.loadNextScript = function() {
  if (!this._scripts) return;
  var params = this._utils.parseSearch(window.location.search);
  var config = this._scripts.shift();
  if (!config) return;
  if (config.id) {
    if (params[config.id]) {
      config.src = params[config.id];
    }
    this.addScriptToUI(config);
  }
  var tag = document.createElement('script');
  tag.setAttribute('src', config.src);
  tag.onload = this.loadNextScript;
  document.body.appendChild(tag);
};

Document.prototype.openTab = function (id) {
  var divs = this._container.querySelectorAll('.tab-pane');
  for (var i=0;i<divs.length;i++) {
    divs[i].style.display = 'none';
  }

  this._container.querySelector('.nav-tabs li.active').classList.remove('active');
  this._container.querySelector(id).style.display = 'block';
  this._container.querySelector('[href="' + id + '"]').parentElement.classList.add('active');
}

Document.prototype.addScriptToUI = function(config) {
  if (!this._scriptsContainer) return;
  var compiled = this._scriptTemplate(config);
  this._scriptsContainer.innerHTML += compiled;
};

//Deprecated
Document.prototype.getParams = function() {
  return this._utils.parseSearch(this._window.location.search);
};

Document.prototype.addScriptsContainer = function() {
  if (!this.container()) return;
  this._scriptsContainer = this.container().querySelector('table.scripts tbody');
  this._scriptTemplate = _.template(this.container().querySelector('#scriptTemplate').innerHTML);
};

Document.prototype.onDOMContentLoaded = function() {
  if (!this.container()) return;
  this.addButton('loopBtn', this._runner.loopBenchmark);
  this.addButton('onceBtn', this._runner.onceBenchmark);
  this.addButton('twentyFiveBtn', this._runner.twentyFiveBenchmark);
  this.addButton('profileBtn', this._runner.profile);
  this.addSampleRange();
  this.addInfo();
  this.addScriptsContainer();
};

Document.prototype.writeReport = function(reportContent) {
  this.infoDiv.innerHTML = reportContent;
};

if (window) window.addEventListener('DOMContentLoaded', this.onDOMContentLoaded);

module.exports = Document;
