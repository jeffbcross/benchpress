(function(bp) {
function Variables() {
  this.variables = [];
}
Variables.prototype._setPendingFromSearch = function() {
  if (bp.Variables._pending === undefined) {
    bp.Variables._pending = bp.Utils.
        parseSearch(bp._window.location.search).variable;
  }
};

Variables.prototype._autoSelectPending = function() {
  if (bp.Variables._pending !== null && bp.Variables._pending !== undefined) {
    return bp.Variables.select(bp.Variables._pending);
    var reduced =  bp.Variables.variables.reduce(function(prev, curr) {
      prev[curr.value] = curr;
      return prev;
    }, {});
    bp.Variables.selected = reduced[bp.Variables._pending];
  }
};

Variables.prototype.add = function (variable) {
  bp.Variables._setPendingFromSearch();
  bp.Variables.variables.push(variable);
  bp.Variables._autoSelectPending();
};

Variables.prototype.addMany = function (varArr) {
  bp.Variables._setPendingFromSearch();
  bp.Variables.variables.push.apply(bp.Variables.variables, varArr);
  bp.Variables._autoSelectPending();
};

Variables.prototype.select = function (val) {
  bp.Variables.selected = bp.Variables.variables.reduce(function(prev, curr) {
    prev[curr.value] = curr;
    return prev;
  }, {})[val];
  if (bp.Variables.selected !== undefined) bp.Variables._pending = null;
};

bp.variables = new Variables();
//Legacy Support
bp.Variables = bp.variables;
}(bp));
