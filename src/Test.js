class Test {

  constructor(feature, data) {
    this._feature = feature;
    this._data = data;
  }

  get name() {
    return this._data.name;
  }

  get main() {
    return Boolean(this._data.main);
  }

  get rawResults() {
    return this._data.res;
  }

  get results() {
    return this._feature.browsers.map(browser => ({
        browser,
        pass: this._data.res[browser.id] || false,
      }));
  }

}

module.exports = Test;
