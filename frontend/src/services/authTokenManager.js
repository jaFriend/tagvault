let fetchTokenFunc = null;
const setTokenFetcher = (fn) => { fetchTokenFunc = fn; };
const getFreshToken = async () => {
  if (!fetchTokenFunc) throw new Error("Token fetcher not set");
  const tokenFetched = await fetchTokenFunc();
  return tokenFetched;
}
export const authTokenManager = {
  setTokenFetcher,
  getFreshToken,
};
