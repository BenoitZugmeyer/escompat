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
    let result = [];
    let browsers = this._feature.browsers;
    for (let browserId in browsers) {
      let browser = browsers[browserId];
      result.push({
        browser,
        pass: this._data.res[browserId] || false,
      });
    }
    return result;
  }

}

module.exports = Test;
