

import express from 'express';
import bodyParser from 'body-parser';
import faceRoutes from './routes/faceRoutes.js'; 

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/api/face', faceRoutes);

export default app; 
