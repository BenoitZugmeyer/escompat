"use strict";
let https = require("https");
let url = require("url");
let vm = require("vm");
let assign = require("object-assign");

let baseURL = "https://raw.githubusercontent.com/kangax/compat-table/gh-pages/";
let files = [
    "data-es5.js",
    "data-es6.js",
    "data-es7.js",
    "data-esintl.js",
    "data-non-standard.js",
];

function read(response) {
  return new Promise(function (resolve, reject) {
    let body = [];
    response.on("error", reject);
    response.on("data", function (data) { body.push(data); });
    response.on("end", function () { resolve(Buffer.concat(body)); });
  });
}

function get(fileURL) {
  return new Promise(function (resolve, reject) {
    let request = https.request(fileURL, resolve);
    request.on("error", reject);
    request.end();
  });
}

function evalFile(body) {
  let module = { exports: {} };
  let sandbox = {
    exports: module.exports,
    module: module,
    require: function (name) {
      if (name !== "object-assign") {
        throw new Error("Tried to import " + name + ". No can do.");
      }
      return assign;
    },
  };

  vm.runInNewContext(body, sandbox);
  return module.exports;
}

function formatFile(data) {
  data.versions = [];
  for (let browserId in data.browsers) {
    let browser = data.browsers[browserId];
    browser.id = browserId;
    browser.short = cleanShort(browser.short);

    for (let version of getVersions(browser.short)) {
      data.versions.push(assign({
        obsolete: browser.obsolete,
        id: browserId,
      }, version));
    }
  }

  delete data.browsers;

  let features = data.tests.map(function (test) {
    return formatFeature(data, test);
  });

  return features;
}

function downloadFile(file) {
  let fileURL = url.resolve(baseURL, file);
  return get(fileURL).then(read).then(evalFile).then(formatFile);
}




let runtimes = {
  chakra: {
    name: "Chakra",
  },
  jsc: {
    name: "JavaScript Core",
  },
  nitro: {
    name: "Nitro",
  },
  other: {
    name: "Other",
  },
  spiderMonkey: {
    name: "SpiderMonkey",
  },
  v8: {
    name: "V8",
  },
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
    short: "TypeScript + core-js",
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

let compressJSON = require("./compress-json");


Promise.all(files.map(downloadFile)).then(function (args) {
  console.log(compressJSON(args));
}).catch(function (e) {
  console.log("Error: " + e.stack);
});

function formatFeature(group, data) {
  let tests = [];
  if (data.res) {
    tests.push({
      name: data.name,
      main: true,
      exec: data.exec,
      res: data.res,
    });
  }

  if (data.subtests) {
    for (let name in data.subtests) {
      tests.push({
        name,
        main: false,
        exec: data.subtests[name].exec,
        res: data.subtests[name].res,
      });
    }
  }

  return {
    group,
    data,
    tests,
    //supports: computeSupport(group.versions, tests),
  };
}

function computeSupport(versions, tests) {
  let result = versions.map(function (version) {
    return {
      version,
      score: 0,
      optionalScore: 0,
      tested: true,
    };
  });

  for (let test of tests) {
    let previousPass;
    let previousPassProject;

    for (let support of result) {
      let pass = test.res[support.version.id];

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
    support.score /= tests.length;
    support.optionalScore /= tests.length;
  }

  function firstNumbers(version) {
    return /\d*(?:\.\d*)*/.exec(version)[0].split(".").map(Number);
  }

  function compareVersions(av, bv) {
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
  }

  result.sort(function (a, b) {
    let av = a.version;
    let bv = b.version;

    if (av.project.name !== bv.project.name) {
      return av.project.name > bv.project.name ? 1 : -1;
    }

    return compareVersions(a.version.version, b.version.version);
  });

  return result;
}
