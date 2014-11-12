(function(bp) {
function Document() {}

Document.prototype.addSampleRange = function() {
  bp.doc.sampleRange = bp.doc.container().querySelector('#sampleRange');
  if (bp.doc.sampleRange) {
    bp.doc.sampleRange.value = Math.max(bp.runner.runState.numSamples, 1);
    bp.doc.sampleRange.addEventListener('input', bp.doc.onSampleInputChanged);
  }
};

Document.prototype.onSampleInputChanged = function (evt) {
  var value = evt.target.value;
  bp.runner.runState.numSamples = parseInt(value, 10);
};

Document.prototype.container = function() {
  if (!bp.doc._container) {
    bp.doc._container = document.querySelector('#benchmarkContainer');
  }
  return bp.doc._container;
}

Document.prototype.addButton = function(reference, handler) {
  var container = bp.doc.container();
  bp.doc[reference] = container.querySelector('button.' + reference);
  if (bp.doc[reference]) {
    bp.doc[reference].addEventListener('click', handler);
  }
}

Document.prototype.addInfo = function() {
  bp.doc.infoDiv = bp.doc.container().querySelector('div.info');
  if (bp.doc.infoDiv) {
    bp.doc.infoTemplate = _.template(bp.doc.container().querySelector('#infoTemplate').innerHTML);
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
    bp.doc.addScriptToUI(config);
  }
  var tag = document.createElement('script');
  tag.setAttribute('src', config.src);
  tag.onload = bp.doc.loadNextScript;
  document.body.appendChild(tag);
};

Document.prototype.openTab = function (id) {
  var divs = bp.doc._container.querySelectorAll('.tab-pane');
  for (var i=0;i<divs.length;i++) {
    divs[i].style.display = 'none';
  }

  bp.doc._container.querySelector('.nav-tabs li.active').classList.remove('active');
  bp.doc._container.querySelector(id).style.display = 'block';
  bp.doc._container.querySelector('[href="' + id + '"]').parentElement.classList.add('active');
}

Document.prototype.addScriptToUI = function(config) {
  if (!bp.doc._scriptsContainer) return;
  var compiled = bp.doc._scriptTemplate(config);
  bp.doc._scriptsContainer.innerHTML += compiled;
};

//Deprecated
Document.prototype.getParams = function() {
  return bp.Utils.parseSearch(bp._window.location.search);
};

Document.prototype.addScriptsContainer = function() {
  if (!bp.doc.container()) return;
  bp.doc._scriptsContainer = bp.doc.container().querySelector('table.scripts tbody');
  bp.doc._scriptTemplate = _.template(bp.doc.container().querySelector('#scriptTemplate').innerHTML);
};

Document.prototype.onDOMContentLoaded = function() {
  if (!bp.doc.container()) return;
  bp.doc.addButton('loopBtn', bp.runner.loopBenchmark);
  bp.doc.addButton('onceBtn', bp.runner.onceBenchmark);
  bp.doc.addButton('twentyFiveBtn', bp.runner.twentyFiveBenchmark);
  bp.doc.addButton('profileBtn', bp.runner.profile);
  bp.doc.addSampleRange();
  bp.doc.addInfo();
  bp.doc.addScriptsContainer();
};

Document.prototype.writeReport = function(reportContent) {
  bp.doc.infoDiv.innerHTML = reportContent;
};

bp.doc = new Document();
//Legacy Support
bp.Document = bp.doc;

window.addEventListener('DOMContentLoaded', bp.doc.onDOMContentLoaded);
}(bp));
