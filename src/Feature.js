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
  }

  match(re) {
    return re.test(this._data.name);

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

};
