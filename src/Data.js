let escapeRegExp = require("./escapeRegExp");
let Feature = require("./Feature");

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
    let re = new RegExp(escapeRegExp(query), "i");
    return this._features.filter(feature => feature.match(re));
  }

};
