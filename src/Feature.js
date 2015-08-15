import Test from "./Test"

export default class Feature {

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

    this._supports = this._computeSupports();

    this._matchData = {
      name: this._data.name,
      group: this._group.name,
      browser: this.supports
        .filter((s) => s.score)
        .map((s) => s.version.name)
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

  get versions() {
    return this._group.versions;
  }

  get supports() {
    return this._supports;
  }

  _computeSupports() {
    let result = this.versions.map((version) => ({
      version,
      score: 0,
      optionalScore: 0,
      tested: true,
    }));

    for (let test of this._tests) {
      let rawResults = test.rawResults;
      let previousPass;
      let previousPassProject;

      for (let support of result) {
        let pass = rawResults[support.version.id];

        if (pass === undefined && previousPassProject === support.version.project) {
          pass = previousPass;
        }
        else {
          previousPass = pass;
          previousPassProject = support.version.project;
        }

        if (pass && typeof pass === "object") pass = pass.val;

        if (pass === true) {
          support.score += 1;
          support.optionalScore += 1;
        }
        else if (pass === null) {
          support.tested = false;
        }
        else if (typeof pass === "string") {
          support.directlyUsable = false;
          support.optionalScore += 1;
        }
      }
    }

    for (let support of result) {
      support.score /= this._tests.length;
      support.optionalScore /= this._tests.length;
    }

    let firstNumbers = (version) => /\d*(?:\.\d*)*/.exec(version)[0].split(".").map(Number);
    let compareVersions = (av, bv) => {
      av = firstNumbers(av);
      bv = firstNumbers(bv);
      let length = Math.max(av.length, bv.length);
      for (let i = 0; i < length; i++) {
        let a = av[i] || 0;
        let b = bv[i] || 0;
        if (a !== b) {
          return a - b;
        }
      }
      return 0;
    };

    result.sort((a, b) => {
      let av = a.version;
      let bv = b.version;

      if (av.project.name !== bv.project.name) {
        return av.project.name > bv.project.name ? 1 : -1;
      }

      return compareVersions(a.version.version, b.version.version);
    });

    return result;
  }

}
