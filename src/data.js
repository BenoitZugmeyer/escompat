
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

let browserProjects = {

  babel: {
    name: "Babel",
    type: "transpiler",
    link: "http://babeljs.io/",
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
  },

  phantom: {
    name: "PhantomJS",
    type: "scriptable runtime",
    runtime: runtimes.jsc,
    link: "http://phantomjs.org/"
  },

  rhino: {
    name: "Rhino",
    type: "scriptable runtime",
    runtime: runtimes.other,
    link: "https://github.com/mozilla/rhino",
  },

  safari: {
    name: "Safari",
    type: "browser",
    runtime: runtimes.nitro,
    link: "https://www.apple.com/safari/",
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
  }

};

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

        if (!browserProjects.hasOwnProperty(browser.shortId)) {
          throw new Error(`Unknown project ${browser.shortId}`);
        }

        browser.project = browserProjects[browser.shortId];
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
