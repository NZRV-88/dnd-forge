import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import cors from 'cors';

// Импортируем маршруты
import { handleDemo } from '../server/routes/demo';
import { handleNameGenerator } from '../server/routes/name-generator';
import { handleAdvancedNameGenerator } from '../server/routes/advanced-name-generator';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Маршруты
app.get('/api/ping', (req, res) => {
    res.json({ message: 'pong' });
});

app.get('/api/demo', handleDemo);
app.post('/api/name-generator', handleNameGenerator);
app.post('/api/advanced-name-generator', handleAdvancedNameGenerator);

export default (req: VercelRequest, res: VercelResponse) => {
    app(req, res);
};
