
let Feature = require("./Feature");
let { Query } = require("./query");

let runtimes = {
  chakra: {},
  jsc: {},
  nitro: {},
  other: {},
  spiderMonkey: {},
  v8: {},
};

let projects = {

  babel: {
    name: "Babel",
    type: "transpiler",
    link: "http://babeljs.io/",
    short: "Babel + core-js",
  },

  besen: {
    name: "BESEN",
    type: "runtime",
    runtime: runtimes.other,
    link: "https://github.com/BeRo1985/besen",
  },

  chrome: {
    name: "Chromium",
    type: "browser",
    runtime: runtimes.v8,
    link: "http://www.chromium.org/Home",
    short: "CH",
  },

  closure: {
    name: "Closure",
    type: "transpiler",
    link: "https://developers.google.com/closure/compiler/",
  },

  edge: {
    name: "Edge",
    type: "browser",
    runtime: runtimes.chakra,
    link: "https://www.microsoft.com/windows/browser-for-doing",
  },

  ejs: {
    name: "Echo JS",
    type: "runtime",
    runtime: runtimes.other,
    link: "https://github.com/toshok/echojs",
  },

  es5shim: {
    name: "es5-shim",
    type: "shim",
    link: "https://github.com/es-shims/es5-shim",
  },

  es6shim: {
    name: "es6-shim",
    type: "shim",
    link: "https://github.com/es-shims/es6-shim",
  },

  es6tr: {
    name: "es6-transpiler",
    type: "transpiler",
    link: "https://github.com/termi/es6-transpiler",
    short: "ES6 Transpiler",
  },

  es7shim: {
    name: "es7-shim",
    type: "shim",
    link: "https://github.com/es-shims/es7-shim",
  },

  firefox: {
    name: "Firefox",
    type: "browser",
    runtime: runtimes.spiderMonkey,
    link: "https://www.mozilla.org/en-US/firefox/new/",
    short: "FF",
  },

  ie: {
    name: "Internet Explorer",
    type: "browser",
    runtime: runtimes.chakra,
    link: "http://windows.microsoft.com/en-us/internet-explorer/browser-ie",
  },

  iojs: {
    name: "io.js",
    type: "scriptable runtime",
    runtime: runtimes.v8,
    link: "https://iojs.org/",
    short: "io",
  },

  ios: {
    name: "Safari iOS",
    type: "browser",
    runtime: runtimes.nitro,
    link: "https://www.apple.com/ios/",
  },

  jsx: {
    name: "JS Transform",
    type: "transpiler",
    link: "https://github.com/facebook/jstransform",
  },

  konq: {
    name: "Konqueror",
    type: "browser",
    runtime: runtimes.other,
    link: "https://konqueror.org/",
    short: "KQ",
  },

  node: {
    name: "Node.js",
    type: "scriptable runtime",
    link: "https://nodejs.org/",
  },

  opera: {
    name: "Opera",
    type: "browser",
    runtime: runtimes.other,
    link: "http://www.opera.com/",
    note: "Please see Chromium results for latest versions of Opera (15+)",
    short: "OP",
  },

  phantom: {
    name: "PhantomJS",
    type: "scriptable runtime",
    runtime: runtimes.jsc,
    link: "http://phantomjs.org/",
    short: "PJS",
  },

  rhino: {
    name: "Rhino",
    type: "scriptable runtime",
    runtime: runtimes.other,
    link: "https://github.com/mozilla/rhino",
    short: "RH",
  },

  safari: {
    name: "Safari",
    type: "browser",
    runtime: runtimes.nitro,
    link: "https://www.apple.com/safari/",
    short: "SF",
  },

  tr: {
    name: "Traceur",
    type: "transpiler",
    link: "https://github.com/google/traceur-compiler",
  },

  typescript: {
    name: "TypeScript",
    type: "transpiler",
    link: "http://www.typescriptlang.org/",
  },

  webkit: {
    name: "WebKit",
    type: "runtime",
    runtime: runtimes.jsc,
    link: "https://www.webkit.org/",
    short: "WK",
  }

};

function getProjectByShortName(short) {
  for (let key in projects) {
    if (projects[key].short === short || projects[key].name === short || key === short.toLowerCase()) {
      return projects[key];
    }
  }
  throw new Error(`Project with short name ${short} not found`);
}

let number = `(?:\\.?\\d+(?:\\.\\d+)*)`;
let versionNumber = new RegExp(`(?:([^0-9].*?)\\s*)?(<?${number}(?:-${number})?\\+?(?: ESR)?)$`);

function getVersions(short) {
  let result = [];

  let previousProject;
  for (let s of short.split(/\s*[,\/]\s*/)) {
    let match = versionNumber.exec(s);
    let project;

    if (!match) {
      project = getProjectByShortName(s);
    }
    else if (match[1]) {
      project = getProjectByShortName(match[1]);
    }
    else if (previousProject) {
      project = previousProject;
    }
    else {
      throw new Error(`No project found for ${s}`);
    }

    result.push({
      project,
      version: match ? match[2] : null,
    });

    previousProject = project;
  }

  return result;
}

function cleanShort(short) {
  return short
    .replace(/-<.+?>/g, "")
    .replace(/(<.+?>|&nbsp;|\s)+/g, " ")
    .replace(/&lt;/g, "<")
    .trim();
}

class Data {

  constructor(list) {
    this._features = [];

    // for (let data of list) {
    for (let i = 0; i < list.length; i++) {
      let data = list[i];

      data.versions = [];
      for (let browserId in data.browsers) {
        let browser = data.browsers[browserId];
        browser.id = browserId;
        browser.short = cleanShort(browser.short);

        // for (let version of getVersions(browser.short)) {
        let versions = getVersions(browser.short);
        for (let j = 0; j < versions.length; j++) {
          data.versions.push(Object.assign({
            obsolete: browser.obsolete,
            id: browserId,
          }, versions[j]));
        }
      }

      delete data.browsers;

      // for (let test of data.tests) {
      for (let j = 0; j < data.tests.length; j++) {
        this._features.push(new Feature(data, data.tests[j]));
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

console.profile("foo");
module.exports = new Data([
  require("./data/data-es5"),
  require("./data/data-es6"),
  require("./data/data-es7"),
  require("./data/data-esintl"),
  require("./data/data-non-standard"),
]);
console.profileEnd("foo");


if (process.env.NODE_ENV === "tests") {
  let assert = require("assert");

  assert.deepEqual(getVersions("CH 10"), [
    { project: projects.chrome, version: "10" }
  ]);

  assert.deepEqual(getVersions("CH 10, OP 15"), [
    { project: projects.chrome, version: "10" },
    { project: projects.opera, version: "15" },
  ]);

  assert.deepEqual(getVersions("CH 11+, OP 15+"), [
    { project: projects.chrome, version: "11+" },
    { project: projects.opera, version: "15+" },
  ]);

  assert.deepEqual(getVersions("WebKit"), [
    { project: projects.webkit, version: null },
  ]);

  assert.deepEqual(getVersions("SF 7.1, SF 8"), [
    { project: projects.safari, version: "7.1" },
    { project: projects.safari, version: "8" },
  ]);

  assert.deepEqual(getVersions("OP 10.50-11.10"), [
    { project: projects.opera, version: "10.50-11.10" },
  ]);

  assert.deepEqual(getVersions("FF 3.5, 3.6"), [
    { project: projects.firefox, version: "3.5" },
    { project: projects.firefox, version: "3.6" },
  ]);

  assert.deepEqual(getVersions("Node .12"), [
    { project: projects.node, version: ".12" },
  ]);

  assert.deepEqual(getVersions("iOS7"), [
    { project: projects.ios, version: "7" },
  ]);

  assert.deepEqual(getVersions("iOS 7/8"), [
    { project: projects.ios, version: "7" },
    { project: projects.ios, version: "8" },
  ]);

  assert.deepEqual(getVersions("es5-shim"), [
    { project: projects.es5shim, version: null },
  ]);

  console.log("data tests ok");
}
