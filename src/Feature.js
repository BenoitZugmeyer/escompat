let Test = require("./Test");

module.exports = class Feature {

  constructor(group, data) {
    this._group = group;
    this._data = data;
    this._tests = [];
    if (data.res) {
      this._tests.push(new Test(this, {
        name: data.name,
        main: true,
        exec: data.exec,
        res: data.res,
      }));
    }

    if (data.subtests) {
      for (let name in data.subtests) {
        this._tests.push(new Test(this, {
          name,
          main: false,
          exec: data.subtests[name].exec,
          res: data.subtests[name].res,
        }));
      }
    }

    this._matchData = {
      name: this._data.name,
      group: this._group.name,
      browser: this.supports
        .filter(s => s.score)
        .map(s => s.browser.full.split(",").map(b => b.replace(/\s+/g, "")).join(" "))
        .join(" "),
    };
  }

  match(query) {
    return query.match(this._matchData);
  }

  get tests() {
    return this._tests.slice();
  }

  get group() {
    return this._group.name;
  }

  get name() {
    return this._data.name;
  }

  get browsers() {
    return this._group.browsers;
  }

  get supports() {
    let result = this.browsers.map(browser => ({
      browser,
      score: 0,
      optionalScore: 0,
      tested: true,
    }));

    for (let test of this._tests) {
      let rawResults = test.rawResults;
      let previousPass;
      let previousPassShortId;

      result.forEach(r => {
        let pass = rawResults[r.browser.id];

        if (pass === undefined && previousPassShortId === r.browser.shortId) {
          pass = previousPass;
        }
        else {
          previousPass = pass;
          previousPassShortId = r.browser.shortId;
        }

        if (pass && typeof pass === "object") pass = pass.val;

        if (pass === true) {
          r.score += 1;
          r.optionalScore += 1;
        }
        else if (pass === null) {
          r.tested = false;
        }
        else if (typeof pass === "string") {
          r.directlyUsable = false;
          r.optionalScore += 1;
        }
      });
    }

    for (let r of result) {
      r.score /= this._tests.length;
      r.optionalScore /= this._tests.length;
    }

    return result;
  }

};
