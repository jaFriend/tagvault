import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import Cookies from 'cookies';
import jwt from 'jsonwebtoken';


const clerk_pem_file = process.env.CLERK_PEM_FILE;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pubKeyPath = path.join(__dirname, `../config/${clerk_pem_file}`);
const loadPublicKey = async () => {
  const pubKey = await readFile(pubKeyPath, 'utf-8');
  return pubKey;
};
const publicKey = await loadPublicKey();

const ClerkJWTAuth = (req, res, next) => {
  if (!publicKey) {
    console.error('Error: CLERK_PEM_PUBLIC_KEY is not defined in environment variables.');
    return res.status(500).json({ error: 'Server configuration error: Public key missing.' });
  }

  const cookies = new Cookies(req, res);
  const tokenSameOrigin = cookies.get('__session');
  const tokenCrossOrigin = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.split(' ')[1]
    : null;

  if (!tokenSameOrigin && !tokenCrossOrigin) {
    return res.status(401).json({ error: 'Authentication required: No session token or Authorization header found.' });
  }

  try {
    let decoded;
    const options = { algorithms: ['RS256'] };

    const permittedOrigins = [process.env.PERMITTED_ORIGIN]

    if (tokenSameOrigin) {
      decoded = jwt.verify(tokenSameOrigin, publicKey, options);
    } else if (tokenCrossOrigin) {
      decoded = jwt.verify(tokenCrossOrigin, publicKey, options);
    } else {
      return res.status(401).json({ error: 'No valid token provided for verification.' });
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp < currentTime || decoded.nbf > currentTime) {
      return res.status(401).json({ error: 'Authentication failed: Token is expired or not yet valid.' });
    }

    if (decoded.azp && !permittedOrigins.includes(decoded.azp)) {
      return res.status(403).json({ error: "Forbidden: Token's authorized party is not permitted." });
    }

    req.user = decoded.userId;

    next();

  } catch (error) {
    console.error('JWT Authentication Error:', error.message);
    return res.status(401).json({ error: `Authentication failed: ${error.message}` });
  }
};

export default ClerkJWTAuth;
