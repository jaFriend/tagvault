import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5050;

import users from './routes/api/users.js';
import artifacts from './routes/api/artifacts.js';
import tags from './routes/api/tags.js';

app.use(express.json());
app.use(cors());

app.use('/api/users', users);
app.use('/api/artifacts', artifacts);
app.use('/api/tags', tags);


app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
