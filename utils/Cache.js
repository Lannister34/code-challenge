class Cache {
  constructor() {
    this.cache = new Map();
  }

  has(key) {
    return this.cache.has(key);
  }

  get(key) {
    return this.cache.get(key);
  }

  set(key, value) {
    this.cache.set(key, value);
    return value;
  }

  memoize(name, callback) {
    if (this.has(name)) return this.get(name);
    return this.set(name, callback());
  }

  memoizeDeep(name, entity, callback) {
    let cache = this.get(name);
    if (!cache) {
      cache = new WeakMap();
      this.set(name, cache);
    }
    if (cache.has(entity)) return cache.get(entity);
    const result = callback();
    cache.set(entity, result);
    return result;
  }

  clear() {
    this.cache.clear();
  }
}

export default Cache;
