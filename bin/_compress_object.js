"use strict";

const STATE_NONE = 0;
const STATE_DECLARED = 1;
const STATE_DECLARING = 2;
const MAP_OBJECT_NAME = "m";

function isObject(value) {
  return typeof value === "object" && value !== null;
}

let isArray = Array.isArray;

function shouldHoist(value) {
  return isObject(value) || typeof value === "string";
}

function countValues(value) {
  let map = new Map();
  createOrIncrementEntry(value, map, new Map());
  return map;
}

function getOrIncrementEntryKeys(value, map, entryKeysMap) {
  if (!isObject(value) || isArray(value)) return false;

  let keys = Object.keys(value).sort();
  if (keys.length === 0) return false;

  let keysKey = keys.join(","); // TODO JSONify ?
  let entryKeys = entryKeysMap.get(keysKey);
  if (!entryKeys) {
    entryKeysMap.set(keysKey, keys);
    entryKeys = keys;
  }
  createOrIncrementEntry(entryKeys, map, entryKeysMap);

  return entryKeys;
}

function createOrIncrementEntry(value, map, entryKeysMap) {
  if (!shouldHoist(value)) return;

  let entry = map.get(value);
  if (entry) {
    entry.count += 1;
  }
  else {
    let keys = getOrIncrementEntryKeys(value, map, entryKeysMap);
    map.set(value, {
      count: 1,
      id: `v${map.size}`,
      keys,
      state: STATE_NONE,
    });

    if (isObject(value)) {
      for (let key in value) {
        createOrIncrementEntry(value[key], map, entryKeysMap);
      }
    }
  }
}

function compressArray(compress, value) {
  let result = "[";
  for (let child of value) result += `${compress(child)},`;
  result += "]";
  return result;
}

function compressObject(compress, value) {
  let result = "{";
  for (let key in value) result += `${JSON.stringify(key)}:${compress(value[key])},`;
  result += "}";
  return result;
}

function compressObjectWithKeys(compress, value, keys) {
  let result = `${MAP_OBJECT_NAME}(${compress(keys)}`;
  for (let key of keys) result += `,${compress(value[key])}`;
  result += ")";
  return result;
}

function compressValue(value, map, pushReference) {
  let entry = map.get(value);

  if (entry) {
    if (entry.state === STATE_DECLARED) return entry.id;
    if (entry.state === STATE_DECLARING) throw new Error("Recursive structure");
  }

  let boundCompress = (value) => compressValue(value, map, pushReference);

  let compressed =
    isArray(value) ?
      compressArray(boundCompress, value) :
    isObject(value) ?
      entry && entry.keys && map.get(entry.keys).count > 1 ?
        compressObjectWithKeys(boundCompress, value, entry.keys) :
        compressObject(boundCompress, value) :
    JSON.stringify(value) || "null";

  if (!entry || entry.count === 1) return compressed;

  entry.state = STATE_DECLARING;
  pushReference(`${entry.id}=${compressed}`);
  entry.state = STATE_DECLARED;

  return entry.id;
}

export default function main(value) {
  let map = countValues(value);
  let references = [];
  let body = compressValue(value, map, (reference) => references.push(reference));
  let referencesText = references.length ? `var ${references.join(",")}` : "";

  let mapObject = `
function ${MAP_OBJECT_NAME}(k) {
  var o = {},
      a = arguments,
      i = 1;
  for (; i < a.length; i++) o[k[i - 1]] = a[i];
  return o;
}
  `.replace(/(\W|^)\s+/g, "$1").replace(/\s+(\W|$)/g, "$1");

  return {
    declarations: `${mapObject}${referencesText};`,
    body,
    toString() {
      return `(function(){${this.declarations}return ${this.body}}())`;
    },
  };
}
