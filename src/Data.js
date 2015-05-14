let Feature = require("./Feature");
let { Query } = require("./query");

module.exports = class Data {

  constructor(list) {
    this._features = [];

    for (let data of list) {
      for (let test of data.tests) {
        this._features.push(new Feature(data, test));
      }
    }
  }

  get all() {
    return this._features.slice();
  }

  search(query) {
    query = query.trim();
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

};
