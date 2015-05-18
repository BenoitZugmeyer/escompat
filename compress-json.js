"use strict";

function shouldHoist(value) {
  return typeof value === "object" && value || typeof value === "string";
}

function getObjectKeys(object) {
  return Object.keys(object).sort();
}

function countValues(self, value) {
  if (!self.shouldHoist(value)) return;

  let entry = self.map.get(value);
  if (!entry) {
    let entry = { count: 1, id: self.map.size };
    self.map.set(value, entry);

    if (value && typeof value === "object") {
      let keys = getObjectKeys(value);
      if (keys.length > 0) {
        let keysKey = keys.join(",");
        let objectKeysEntry = self.objectKeys.get(keysKey);
        if (!objectKeysEntry) {
          objectKeysEntry = {
            count: 1,
            id: self.objectKeys.size,
            keys,
          };
          self.objectKeys.set(keysKey, objectKeysEntry);
        }
        else {
          objectKeysEntry.count += 1;
        }
        entry.keys = objectKeysEntry;
      }
      for (let key in value) {
        countValues(self, value[key]);
      }
    }
  }
  else {
    entry.count += 1;
  }
}

function compress(self, object) {
  let entry = self.map.get(object);

  let result;

  if (entry) {
    result = "o" + entry.id;

    if (entry.compressed) return result;

    entry.compressed = true;
  }

  let compressed;

  if (Array.isArray(object)) {
    compressed = "[";
    for (let child of object) {
      compressed += compress(self, child) + ",";
    }
    compressed += "]";
  }
  else if (typeof object === "object" && object) {
    if (entry && entry.keys && entry.keys.count > 1) {
      let keysId = "s" + entry.keys.id;
      if (!entry.keys.declared) {
        self.declarations.push("var " + keysId + "=" + compress(self, entry.keys.keys));
        entry.keys.declared = true;

      }
      var compressedValues = entry.keys.keys.map(function (key) {
        return compress(self, object[key]);
      });
      compressed = "mapObject(" + keysId + "," + compressedValues.join(",") + ")";
    }
    else {
      compressed = "{";
      for (let key in object) {
        compressed += JSON.stringify(key) + ":" + compress(self, object[key]) + ",";
      }
      compressed += "}";
    }
  }
  else {
    compressed = JSON.stringify(object) || "null";
  }

  if (!entry || entry.count === 1) {
    return compressed;
  }

  self.declarations.push("var " + result + "=" + compressed);
  return result;
}

module.exports = function (object) {
  let self = {
    declarations: [],
    objectKeys: new Map(),
    map: new Map(),
    shouldHoist,
  };
  countValues(self, object);
  let compressed = compress(self, object);
  let mapObject =
    "function mapObject(keys) {" +
    "  var o = {};" +
    "  for (var i = 1; i < arguments.length; i++) {" +
    "    o[keys[i - 1]] = arguments[i];" +
    "  }" +
    "  return o;" +
    "}";
  return mapObject + self.declarations.join("\n") + "\nmodule.exports = " + compressed;
};

if (process.env.NODE_ENV === "tests") {
  var a = {};
  console.log(module.exports([a, a]));
}
