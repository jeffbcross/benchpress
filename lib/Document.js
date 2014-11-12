(function(bp) {
function Document() {}

Document.prototype.addSampleRange = function() {
  bp.Document.sampleRange = bp.Document.container().querySelector('#sampleRange');
  if (bp.Document.sampleRange) {
    bp.Document.sampleRange.value = Math.max(bp.runner.runState.numSamples, 1);
    bp.Document.sampleRange.addEventListener('input', bp.Document.onSampleInputChanged);
  }
};

Document.prototype.onSampleInputChanged = function (evt) {
  var value = evt.target.value;
  bp.runner.runState.numSamples = parseInt(value, 10);
};

Document.prototype.container = function() {
  if (!bp.Document._container) {
    bp.Document._container = document.querySelector('#benchmarkContainer');
  }
  return bp.Document._container;
}

Document.prototype.addButton = function(reference, handler) {
  var container = bp.Document.container();
  bp.Document[reference] = container.querySelector('button.' + reference);
  if (bp.Document[reference]) {
    bp.Document[reference].addEventListener('click', handler);
  }
}

Document.prototype.addInfo = function() {
  bp.Document.infoDiv = bp.Document.container().querySelector('div.info');
  if (bp.Document.infoDiv) {
    bp.Document.infoTemplate = _.template(bp.Document.container().querySelector('#infoTemplate').innerHTML);
  }
};

Document.prototype.loadNextScript = function() {
  if (!bp.scripts) return;
  var params = bp.Utils.parseSearch(bp._window.location.search);
  var config = bp.scripts.shift();
  if (!config) return;
  if (config.id) {
    if (params[config.id]) {
      config.src = params[config.id];
    }
    bp.Document.addScriptToUI(config);
  }
  var tag = document.createElement('script');
  tag.setAttribute('src', config.src);
  tag.onload = bp.Document.loadNextScript;
  document.body.appendChild(tag);
};

Document.prototype.openTab = function (id) {
  var divs = bp.Document._container.querySelectorAll('.tab-pane');
  for (var i=0;i<divs.length;i++) {
    divs[i].style.display = 'none';
  }

  bp.Document._container.querySelector('.nav-tabs li.active').classList.remove('active');
  bp.Document._container.querySelector(id).style.display = 'block';
  bp.Document._container.querySelector('[href="' + id + '"]').parentElement.classList.add('active');
}

Document.prototype.addScriptToUI = function(config) {
  if (!bp.Document._scriptsContainer) return;
  var compiled = bp.Document._scriptTemplate(config);
  bp.Document._scriptsContainer.innerHTML += compiled;
};

//Deprecated
Document.prototype.getParams = function() {
  return bp.Utils.parseSearch(bp._window.location.search);
};

Document.prototype.addScriptsContainer = function() {
  if (!bp.Document.container()) return;
  bp.Document._scriptsContainer = bp.Document.container().querySelector('table.scripts tbody');
  bp.Document._scriptTemplate = _.template(bp.Document.container().querySelector('#scriptTemplate').innerHTML);
};

Document.prototype.onDOMContentLoaded = function() {
  if (!bp.Document.container()) return;
  bp.Document.addButton('loopBtn', bp.runner.loopBenchmark);
  bp.Document.addButton('onceBtn', bp.runner.onceBenchmark);
  bp.Document.addButton('twentyFiveBtn', bp.runner.twentyFiveBenchmark);
  bp.Document.addButton('profileBtn', bp.runner.profile);
  bp.Document.addSampleRange();
  bp.Document.addInfo();
  bp.Document.addScriptsContainer();
};

Document.prototype.writeReport = function(reportContent) {
  bp.Document.infoDiv.innerHTML = reportContent;
};

bp.document = new Document();
//Legacy Support
bp.Document = bp.document;

window.addEventListener('DOMContentLoaded', bp.document.onDOMContentLoaded);
}(bp));
