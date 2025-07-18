const KEY = "sas_cache";
const loadCache = () => { return JSON.parse(sessionStorage.getItem(KEY)) || {} }
const saveCache = (cache) => { sessionStorage.setItem(KEY, JSON.stringify(cache)) }
const sasCache = {
  get(filename) {
    const cache = loadCache();
    const item = cache[item];
    if (!item) return null;
    const now = Date.now();

    if (item.expires < now + 60 * 1000) {
      delete cache[filename];
      saveCache(cache);
      return null;
    }
    return item.url;
  },
  set(filename, url, expiresAt) {
    const cache = loadCache();
    cache[filename] = { url, expires: expiresAt };
    saveCache(cache);
  },
  clear() { sessionStorage.removeItem(KEY); },
}

export default sasCache;
