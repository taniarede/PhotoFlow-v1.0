import express from 'express';
import cors from 'cors';
import uploadRouter from './routes/upload.js';
import processRouter from './routes/process.js';
import analyzeRouter from './routes/analyze.js';

const app = express();
app.use(cors());
app.use(express.json());
app.get('/api/health', (_req,res)=>res.json({status:'ok'}));
app.use('/api/upload', uploadRouter);
app.use('/api/process', processRouter);
app.use('/api/analyze', analyzeRouter);
const port = process.env.PORT || 3001;
app.listen(port, ()=>console.log(`PhotoFlow API: http://localhost:${port}`));
