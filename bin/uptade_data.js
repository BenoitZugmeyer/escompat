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

function formatFile(data) {
  let group = {
    name: data.name,
    versions: [],
  };

  for (let browserId in data.browsers) {
    let browser = data.browsers[browserId];
    let versions = getVersions(browser);
    versions.forEach((v) => v.browserId = browserId);
    group.versions.push(...versions);
  }

  sortVersions(group.versions);

  return data.tests.map((test) => formatFeature(group, test));
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

function cleanShort(short) {
  return short
    .replace(/-<.+?>/g, "")
    .replace(/(<.+?>|&nbsp;|\s)+/g, " ")
    .replace(/&lt;/g, "<")
    .trim();
}



Promise.all(files.map(processFile)).then(function (args) {
  let data = [];
  for (let arg of args) data.push(...arg);
  let result = compress(data);
  print(`${result.declarations}\nmodule.exports = ${result.body}`);
}).catch(function (e) {
  printErr(e.stack);
});

function unindent(str) {
  let indentation = str.match(/^( *)\S/m);
  if (!indentation) return str;
  return str.replace(new RegExp(indentation[1], "g"), "");
}

function formatFn(fn) {
  if (typeof fn !== "function") throw Error("fn is not a function");
  let match = String(fn).match(/^function\s*\(\)\s*\{(?:\s*\/\*)?([^]*?)(?:\*\/)?\s*}$/);
  if (!match) throw new Error(`Can't parse exec ${fn}`);
  return unindent(match[1]).trim();
}

function formatExec(exec) {
  if (typeof exec === "function") return [ { script: formatFn(exec), type: null } ];
  if (Array.isArray(exec)) {
    return exec.map((exec) => ({
      script: formatFn(exec.script),
      type: exec.type || null,
    }));
  }

  throw new Error(`exec has wrong type`);
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

function formatRes(group, res) {
  if (typeof res !== "object") throw new Error(`res is not an object`);

  let result = [];

  for (let [ project, versions ] of iterVersionsByProject(group.versions)) {
    let firstFullSupportVersion;
    let firstMixedSupportVersion;
    let firstNoSupportVersion;

    for (let version of versions.reverse()) {
      if (!res.hasOwnProperty(version.browserId)) continue;
      let versionRes = res[version.browserId];
      if (versionRes === null) continue; // not tested
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
            throw new Error(`Missing note_id for flagged version resultat`);
          }
          pass = true;
        }
        else {
          throw new Error(`Invalid pass type for ${JSON.stringify(versionRes)}`);
        }

        if (typeof versionRes.note_id === "string") {
          note = versionRes.note_id;
        }
      }
      else if (versionRes === "flagged") {
        pass = true;
        note = "flagged";
      }
      else if (versionRes === "strict") {
        pass = true;
        note = "strict_only";
      }
      else {
        throw new Error(`Invalid pass type for ${JSON.stringify(versionRes)}`);
      }

      // TODO don't ignore note if !pass
      if (!pass) {
        firstNoSupportVersion = version;
      }
      else if (note) {
        firstMixedSupportVersion = version;
      }
      else {
        firstFullSupportVersion = version;
      }
    }

    result.push({
      project,
      firstFullSupportVersion,
      firstMixedSupportVersion,
      firstNoSupportVersion,
    });
  }

  return result;
}

function formatTest(group, name, data) {
  try {
    return {
      name,
      exec: formatExec(data.exec),
      res: formatRes(group, data.res),
    };
  }
  catch (e) {
    throw new Error(`while formating "${name || "main"}" test:\n${e.message}`);
  }
}

function formatFeature(group, data) {
  let tests = [];
  if (data.res) {
    try {
      tests.push(formatTest(group, null, data));
    }
    catch (e) {
      throw new Error(`while formating feature "${group.name} - ${data.name}":\n${e.message}`);
    }
  }

  if (data.subtests) {
    for (let name in data.subtests) {
      try {
        tests.push(formatTest(group, name, data.subtests[name]));
      }
      catch (e) {
        throw new Error(`while formating feature "${group.name} - ${name}":\n${e.message}`);
      }
    }
  }

  return {
    name: data.name,
    group,
    tests,
  };
}
