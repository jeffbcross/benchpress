function MockGlobals () {
  this._window = {
    location: {
      search: '?variable=bindOnce'
    }
  }
}

module.exports = MockGlobals;