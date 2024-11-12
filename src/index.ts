import express from 'express';
import cors from 'cors';
import challengeRoutes from './routes/challenge.routes';
import { CONFIG } from './config/config';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', challengeRoutes);

app.listen(CONFIG.PORT, () => {
    console.log(`Server is running on port ${CONFIG.PORT}`);
});