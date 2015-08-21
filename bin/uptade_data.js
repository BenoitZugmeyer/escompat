/*eslint-env node*/

import fs from "fs";
import os from "os";
import vm from "vm";
import url from "url";
import path from "path";
import https from "https";
import compress from "./_compress_object";

const baseURL = "https://raw.githubusercontent.com/kangax/compat-table/gh-pages/";
const files = [
  "data-es5.js",
  "data-es6.js",
  "data-es7.js",
  "data-esintl.js",
  "data-non-standard.js",
];

function print(str) {
  process.stdout.write(str + "\n");
}

function printErr(str) {
  process.stderr.write(str + "\n");
}

function read(response) {
  return new Promise((resolve, reject) => {
    let body = [];
    response.on("error", reject);
    response.on("data", (data) => body.push(data));
    response.on("end", () => resolve(Buffer.concat(body)));
  });
}

function downloadFile(fileURL) {
  return new Promise((resolve, reject) => {
    let request = https.request(fileURL, resolve);
    request.on("error", reject);
    request.end();
  });
}

function evalFile(name, body) {
  let module = { exports: {} };
  let sandbox = {
    exports: module.exports,
    module,
    require(name) {
      if (name !== "object.assign") {
        throw new Error(`In ${name}, tried to import ${name}. No can do.`);
      }
      return { shim() {} };
    },
    Object: {
      assign: Object.assign,
    },
  };

  try {
    vm.runInNewContext(body, sandbox);
  }
  catch (e) {
    throw new Error(`Error while evaluating ${name}: ${e.message}`);
  }
  return module.exports;
}

class Context {

  constructor({ browserIdMap, notesMap, group, parent, name }) {
    this._notes = notesMap || parent._notes;
    this._browserIds = browserIdMap || parent._browserIds;
    this._group = group || parent._group;
    this._parent = parent;
    this._name = name || group.name;
  }

  child(name) {
    return new this.constructor({ parent: this, name });
  }

  toString() {
    let names = [];
    let context = this;
    while (context) {
      names.unshift(context._name);
      context = context._parent;
    }
    return names.join(" / ");
  }

  getBrowserId(version) {
    return this._browserIds.get(version);
  }

  getNote(id) {
    if (!this._notes.has(id)) this.error(`Unknown note ${id}`);
    return this._notes.get(id);
  }

  get group() {
    return this._group;
  }

  error(text) {
    throw new Error(`${this}: ${text}`);
  }

}

function formatFile(fileData) {
  let group = {
    name: fileData.name,
    versions: [],
  };

  let browserIdMap = new Map();

  for (let browserId in fileData.browsers) {
    let browser = fileData.browsers[browserId];
    let versions = getVersions(browser);
    for (let version of versions) {
      browserIdMap.set(version, browserId);
      group.versions.push(version);
    }
  }

  sortVersions(group.versions);

  let notesMap = collectNotes(fileData);

  notesMap.set("flagged", "This feature is behind a flag");
  notesMap.set("strict_only", "Works in strict mode only");

  let context = new Context({ browserIdMap, notesMap, group });

  return fileData.tests.map((featureData) => formatFeature(context, featureData));
}

function readFileFromCache(tempFile) {
  return new Promise((resolve, reject) => {
    fs.stat(tempFile, (error, stats) => {
      if (error) return reject(error);
      if (stats.mtime < Date.now() - 3600e3) {
        return reject(new Error("Cache expired"));
      }
      resolve(fs.createReadStream(tempFile));
    });
  });
}

function cacheFile(tempFile, body) {
  return new Promise((resolve, reject) => {
    fs.writeFile(tempFile, body, (error) => {
      if (error) return reject(error);
      resolve();
    });
  });
}

function processFile(file) {
  let fileURL = url.resolve(baseURL, file);
  let cacheTempFile = path.resolve(os.tmpdir(), "escompat_" + path.basename(fileURL));

  let bodyPromise = readFileFromCache(cacheTempFile)
  .catch((e) => {
    printErr(`Cache miss: ${e.message}`);
    return downloadFile(fileURL);
  })
  .then(read);

  return Promise.all([
    bodyPromise.then((body) => cacheFile(cacheTempFile, body)),
    bodyPromise.then((body) => evalFile(fileURL, body)).then(formatFile),
  ])
  .then((r) => r[1]);
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
    runtime: runtimes.v8,
    link: "https://nodejs.org/",
  },

  operalegacy: {
    name: "Opera (legacy)",
    type: "browser",
    runtime: runtimes.other,
    link: "http://www.opera.com/",
  },

  opera: {
    name: "Opera",
    type: "browser",
    runtime: runtimes.v8,
    link: "http://www.opera.com/",
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
  },

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

function sortVersions(versions) {
  function firstNumbers(version) {
    return /\d*(?:\.\d*)*/.exec(version)[0].split(".").map(Number);
  }

  function compareVersionNumbers(av, bv) {
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

  versions.sort((va, vb) => {
    let nameA = va.project.name.toLowerCase();
    let nameB = vb.project.name.toLowerCase();

    return (
      nameA === nameB ? compareVersionNumbers(va.number, vb.number) :
      nameA > nameB ? 1 :
        -1
    );
  });
}

function getVersions(browser) {
  let short = cleanShort(browser.short);
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

    let number = match ? match[2] : null;

    if (project === projects.opera && parseInt(number, 10) < 15) {
      project = projects.operalegacy;
    }

    result.push({
      project,
      number,
      obsolete: Boolean(browser.obsolete),
      unstable: Boolean(browser.unstable),
    });

    previousProject = project;
  }

  return result;
}

function *iterateTests(featureData) {
  if (featureData.res) {
    yield [ null, featureData ];
  }

  if (featureData.subtests) {
    for (let name in featureData.subtests) {
      yield [ name, featureData.subtests[name] ];
    }
  }
}

function collectNotes(fileData) {
  let result = new Map();

  for (let featureData of fileData.tests) {
    for (let [ testName, testData ] of iterateTests(featureData)) {
      for (let browserId in testData.res) {
        let testResult = testData.res[browserId];
        if (testResult && typeof testResult === "object") {
          let { note_id: id, note_html: html } = testResult;
          if (!id) {
            throw new Error(`${fileData.name}/${testName}/${browserId} no note id`);
          }
          if (html) {
            if (result.has(id) && result.get(id) !== html) {
              throw new Error(`${fileData.name} different HTML values for note ${id}`);
            }
            result.set(id, html);
          }
        }
      }
    }
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

Promise.all(files.map(processFile)).then(function (args) {
  let collectedData = [];
  for (let arg of args) collectedData.push(...arg);
  let result = compress(collectedData);
  print(`${result.declarations}\nmodule.exports = ${result.body}`);
}).catch(function (e) {
  printErr(e.stack);
});

function unindent(str) {
  let indentation = str.match(/^( *)\S/m);
  if (!indentation) return str;
  return str.replace(new RegExp(indentation[1], "g"), "");
}

function formatFn(context, fn) {
  if (typeof fn !== "function") context.error("fn is not a function");
  let match = String(fn).match(/^function\s*\(\)\s*\{(?:\s*\/\*)?([^]*?)(?:\*\/)?\s*}$/);
  if (!match) context.error(`Can't parse exec ${fn}`);
  return unindent(match[1]).trim();
}

function formatExec(context, exec) {
  if (typeof exec === "function") return [ { script: formatFn(context, exec), type: null } ];
  if (Array.isArray(exec)) {
    return exec.map((exec) => ({
      script: formatFn(context, exec.script),
      type: exec.type || null,
    }));
  }

  context.error(`exec has wrong type`);
}

function *iterVersionsByProject(versions) {
  let previousProject;
  let projectVersions;
  for (let version of versions) {
    if (!previousProject || previousProject !== version.project) {
      if (previousProject) {
        yield [ previousProject, projectVersions ];
      }
      previousProject = version.project;
      projectVersions = [ version ];
    }
    else {
      projectVersions.push(version);
    }
  }
  if (previousProject) {
    yield [ previousProject, projectVersions ];
  }
}

function formatSupports(context, res) {
  if (typeof res !== "object") context.error(`res is not an object`);

  let result = [];

  for (let [ project, versions ] of iterVersionsByProject(context.group.versions)) {
    let supports = [];
    let previousSupport = [];

    for (let version of versions) {
      let browserId = context.getBrowserId(version);
      if (!res.hasOwnProperty(browserId)) continue;
      let versionRes = res[browserId];
      if (versionRes === null) continue; // not tested

      let support = { version };

      if (typeof versionRes === "boolean") {
        support.pass = versionRes;
      }
      else if (typeof versionRes === "object") {
        if (typeof versionRes.val === "boolean") {
          support.pass = versionRes.val;
        }
        else if (versionRes.val === "flagged" || versionRes.val === "needs-polyfill-or-native") {
          if (typeof versionRes.note_id !== "string") {
            context.error(`Missing note_id for flagged version resultat`);
          }
          support.pass = true;
        }
        else {
          context.error(`Invalid pass type for ${JSON.stringify(versionRes)}`);
        }

        if (typeof versionRes.note_id === "string") {
          support.note = context.getNote(versionRes.note_id);
        }
      }
      else if (versionRes === "flagged") {
        support.pass = true;
        support.note = context.getNote("flagged");
      }
      else if (versionRes === "strict") {
        support.pass = true;
        support.note = context.getNote("strict_only");
      }
      else {
        context.error(`Invalid pass type for ${JSON.stringify(versionRes)}`);
      }

      if (!previousSupport || previousSupport.note !== support.note || previousSupport.pass !== support.pass) {
        supports.push(support);
        previousSupport = support;
      }
    }

    if (supports.length === 0) {
      printErr(`Warning: ${context}: No support for project ${project.name}`);
    }

    else {

      // result.push({
      //   project,
      //   supports,
      // });
      result.push(supports);
    }
  }

  return result;
}

function formatFeature(context, featureData) {
  context = context.child(featureData.name);
  let tests = [];

  for (let [ name, testData ] of iterateTests(featureData)) {
    let testContext = context.child(name || "main");
    tests.push({
      name,
      exec: formatExec(testContext, testData.exec),
      supports: formatSupports(testContext, testData.res),
    });
  }

  return {
    name: featureData.name,
    group: context.group,
    tests,
  };
}
