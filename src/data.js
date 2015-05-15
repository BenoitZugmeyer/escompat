
let Feature = require("./Feature");
let { Query } = require("./query");

class Data {

  constructor(list) {
    this._features = [];

    let browserIdRe = /^(.*?)([_\d]+(?:dev)?)?$/;
    for (let data of list) {
      data.browsers = Object.keys(data.browsers).map(browserId => {
        let browser = data.browsers[browserId];
        browser.id = browserId;
        browser.shortId = browserIdRe.exec(browserId)[1];
        browser.short = browser.short
          .replace(/-<.+?>/g, "")
          .replace(/<.+?>|&nbsp;/g, " ")
          .replace(/&lt;/g, "<");
        return browser;
      });
      for (let test of data.tests) {
        this._features.push(new Feature(data, test));
      }
    }
  }

  get all() {
    return this._features.slice();
  }

  search(query) {
    query = query && query.trim();
    if (!query) return this.all;

    query = new Query(query, {
      fields: {
        browser: { matchSpace: false },
      },
      defaultField: "name",
    });

    let scores = new Map();
    let result = [];
    this._features.forEach((feature, i) => {
      let score = feature.match(query);
      if (score) {
        score -= i / 1e5;  // to have a stable sort
        scores.set(feature, score);
        result.push(feature);
      }
    });

    result.sort((a, b) => scores.get(b) - scores.get(a));

    return result;
  }

}

module.exports = new Data([
  require("./data/data-es5"),
  require("./data/data-es6"),
  require("./data/data-es7"),
  require("./data/data-esintl"),
  require("./data/data-non-standard"),
]);
