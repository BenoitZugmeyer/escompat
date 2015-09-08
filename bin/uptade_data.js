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

let projects = [
  {
    name: "Babel",
    short: [ "Babel + core-js" ],
    type: "transpiler",
    link: "http://babeljs.io/",
  },

  {
    name: "BESEN",
    short: [],
    type: "runtime",
    runtime: runtimes.other,
    link: "https://github.com/BeRo1985/besen",
  },

  {
    name: "Chromium",
    short: [ "CH" ],
    type: "browser",
    runtime: runtimes.v8,
    link: "http://www.chromium.org/Home",
  },

  {
    name: "Closure",
    short: [],
    type: "transpiler",
    link: "https://developers.google.com/closure/compiler/",
  },

  {
    name: "Edge",
    short: [],
    type: "browser",
    runtime: runtimes.chakra,
    link: "https://www.microsoft.com/windows/browser-for-doing",
  },

  {
    name: "Echo JS",
    short: [ "EJS" ],
    type: "runtime",
    runtime: runtimes.other,
    link: "https://github.com/toshok/echojs",
  },

  {
    name: "es5-shim",
    short: [ "es5shim" ],
    type: "shim",
    link: "https://github.com/es-shims/es5-shim",
  },

  {
    name: "es6-shim",
    short: [ "es6shim" ],
    type: "shim",
    link: "https://github.com/es-shims/es6-shim",
  },

  {
    name: "es6-transpiler",
    short: [ "ES6 Transpiler" ],
    type: "transpiler",
    link: "https://github.com/termi/es6-transpiler",
  },

  {
    name: "es7-shim",
    short: [ "es7shim" ],
    type: "shim",
    link: "https://github.com/es-shims/es7-shim",
  },

  {
    name: "Firefox",
    short: [ "FF" ],
    type: "browser",
    runtime: runtimes.spiderMonkey,
    link: "https://www.mozilla.org/en-US/firefox/new/",
  },

  {
    name: "Internet Explorer",
    short: [ "IE" ],
    type: "browser",
    runtime: runtimes.chakra,
    link: "http://windows.microsoft.com/en-us/internet-explorer/browser-ie",
  },

  {
    name: "io.js",
    short: [ "io" ],
    type: "scriptable runtime",
    runtime: runtimes.v8,
    link: "https://iojs.org/",
  },

  {
    name: "Safari iOS",
    short: [ "iOS" ],
    type: "browser",
    runtime: runtimes.nitro,
    link: "https://www.apple.com/ios/",
  },

  {
    name: "JS Transform",
    short: [ "JSX" ],
    type: "transpiler",
    link: "https://github.com/facebook/jstransform",
  },

  {
    name: "Konqueror",
    short: [ "Konq", "KQ" ],
    type: "browser",
    runtime: runtimes.other,
    link: "https://konqueror.org/",
  },

  {
    name: "Node.js",
    short: [ "Node" ],
    type: "scriptable runtime",
    runtime: runtimes.v8,
    link: "https://nodejs.org/",
  },

  {
    name: "Opera",
    short: [ "OP" ],
    type: "browser",
    runtime: runtimes.v8,
    link: "http://www.opera.com/",
  },

  {
    name: "PhantomJS",
    short: [ "Phantom", "PJS" ],
    type: "scriptable runtime",
    runtime: runtimes.jsc,
    link: "http://phantomjs.org/",
  },

  {
    name: "Rhino",
    short: [ "RH" ],
    type: "scriptable runtime",
    runtime: runtimes.other,
    link: "https://github.com/mozilla/rhino",
  },

  {
    name: "Safari",
    short: [ "SF" ],
    type: "browser",
    runtime: runtimes.nitro,
    link: "https://www.apple.com/safari/",
  },

  {
    name: "Traceur",
    short: [],
    type: "transpiler",
    link: "https://github.com/google/traceur-compiler",
  },

  {
    name: "TypeScript",
    short: [ "TypeScript + core-js", "TS" ],
    type: "transpiler",
    link: "http://www.typescriptlang.org/",
  },

  {
    name: "WebKit",
    short: [ "WK" ],
    type: "runtime",
    runtime: runtimes.jsc,
    link: "https://www.webkit.org/",
  },

];

let typesOrder = [
  "browser",
  "scriptable runtime",
  "runtime",
  "transpiler",
  "shim",
];

function compareProjects(pa, pb) {
  if (pa.type !== pb.type) {
    return typesOrder.indexOf(pa.type) - typesOrder.indexOf(pb.type);
  }

  return pa.name.toLowerCase() > pb.name.toLowerCase() ? 1 : -1;
}

projects.sort(compareProjects);

function getProjectByShortName(short) {
  for (let project of projects) {
    if (project.short.includes(short) || project.name === short) return project;
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
    return compareProjects(va.project, vb.project) || compareVersionNumbers(va.number, vb.number);
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

    if (typesOrder.indexOf(project.type) < 0) {
      throw new Error(`Unknown project type ${project.type}`);
    }

    let number = match ? match[2] : null;

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
  let features = [];
  for (let arg of args) features.push(...arg);

  let result = compress({
    features,
    projects,
  });
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
        yield projectVersions;
      }
      previousProject = version.project;
      projectVersions = [ version ];
    }
    else {
      projectVersions.push(version);
    }
  }
  if (previousProject) {
    yield projectVersions;
  }
}

function formatSupport(context, version, versionRes) {
  let pass, note;

  if (typeof versionRes === "boolean") {
    pass = versionRes;
  }
  else if (typeof versionRes === "object") {
    if (typeof versionRes.val === "boolean") {
      pass = versionRes.val;
    }
    else if (versionRes.val === "flagged" || versionRes.val === "needs-polyfill-or-native") {
      if (typeof versionRes.note_id !== "string") {
        context.error(`Missing note_id for flagged version resultat`);
      }
      pass = true;
    }
    else {
      context.error(`Invalid pass type for ${JSON.stringify(versionRes)}`);
    }

    if (typeof versionRes.note_id === "string") {
      note = context.getNote(versionRes.note_id);
    }
  }
  else if (versionRes === "flagged") {
    pass = true;
    note = context.getNote("flagged");
  }
  else if (versionRes === "strict") {
    pass = true;
    note = context.getNote("strict_only");
  }
  else {
    context.error(`Invalid pass type for ${JSON.stringify(versionRes)}`);
  }

  return { pass, note, version };
}

function formatSupports(context, res) {
  if (typeof res !== "object") context.error(`res is not an object`);

  let result = [];

  for (let versions of iterVersionsByProject(context.group.versions)) {
    let previousSupport = [];

    for (let version of versions) {
      let browserId = context.getBrowserId(version);
      let versionRes = res.hasOwnProperty(browserId) ? res[browserId] : false;
      if (versionRes === null) continue; // not tested

      let support = formatSupport(context.child(browserId), version, versionRes);

      if (!previousSupport ||
          previousSupport.note !== support.note ||
          previousSupport.pass !== support.pass) {

        if (support.pass || support.note) {
          result.push(support);
        }

        previousSupport = support;
      }
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
