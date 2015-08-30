const DONE = Object.freeze({
  done: true,
  value: undefined,
});

function VALUE(value) {
  return { done: false, value };
}

function identity(x) {
  return x;
}

function iter(value) {
  return value[Symbol.iterator]();
}

function makeIterator(next) {
  return {
    next,
    [Symbol.iterator]() {
      return this;
    },
  };
}

export function some(fn) {
  for (let value of this) if (fn(value)) return true;
  return false;
}

export function all(fn) {
  for (let value of this) if (!fn(value)) return false;
  return true;
}

export function groupBy(keyfunc=identity) {
  let iterator = iter(this);
  let currentItem;
  let targetKey, currentKey;
  targetKey = currentKey = {};

  return makeIterator(() => {

    if (currentItem && currentItem.done) return DONE;

    while (currentKey === targetKey) {
      currentItem = iterator.next();
      if (currentItem.done) return DONE;
      currentKey = keyfunc(currentItem.value);
    }

    targetKey = currentKey;

    return VALUE([

      currentKey,

      makeIterator(() => {
        if (currentItem.done || currentKey !== targetKey) return DONE;
        let result = currentItem;
        currentItem = iterator.next();
        if (!currentItem.done) {
          currentKey = keyfunc(currentItem.value);
        }
        return result;
      }),

    ]);
  });
}

export function map(fn=identity) {
  let iterator = iter(this);
  return makeIterator(() => {
    let item = iterator.next();
    return item.done ? DONE : VALUE(fn(item.value));
  });
}

export function collect() {
  if (Array.isArray(this)) return this;
  return [for (value of this) value];
}

export function filter(fn) {
  let iterator = iter(this);
  return makeIterator(() => {
    let item;

    do {
      item = iterator.next();
    } while (!item.done && !fn(item.value));

    return item;
  });
}

export function apply(fn=identity) {
  let iterator = iter(this);
  return makeIterator(() => {
    let item = iterator.next();
    return item.done ? DONE : VALUE(fn(...item.value));
  });
}

