module.exports = class Feature {

  constructor(group, data) {
    this._group = group;
    this._data = data;
  }

  match(re) {
    return re.test(this._data.name);
  }

  get group() {
    return this._group;
  }

  get name() {
    return this._data.name;
  }

};
