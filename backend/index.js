import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5050;
const permitted_origin = process.env.PERMITTED_ORIGIN
import users from './routes/api/users.js';
import artifacts from './routes/api/artifacts.js';
import tags from './routes/api/tags.js';
import sasToken from './routes/api/sasToken.js'

app.use(express.json());
app.use(cors({
  origin: permitted_origin
}));

app.use('/api/users', users);
app.use('/api/artifacts', artifacts);
app.use('/api/tags', tags);
app.use('/api/sas-generate', sasToken);


app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
