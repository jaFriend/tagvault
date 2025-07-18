let token = null;
let expiresAt = 0;
let fetchTokenFunc = null;

const setTokenFetcher = (fn) => {
  console.log(fn);
  fetchTokenFunc = fn;
};

const isValidToken = () => {
  if (!token && !expiresAt) return false;
  const now = Date.now();
  return now < expiresAt;
}

const getFreshToken = async () => {
  console.log("running")
  console.log("Is valid:" + isValidToken())
  if (isValidToken()) return token;
  if (!fetchTokenFunc) throw new Error("Token fetcher not set");
  const tokenFetched = await fetchTokenFunc();

  token = tokenFetched;
  expiresAt = Date.now() + 55_000;
  return token;
}

export const authTokenManager = {
  setTokenFetcher,
  getFreshToken,
};
