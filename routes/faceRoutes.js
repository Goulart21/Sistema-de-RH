
import express from 'express';
import { someFaceRecognitionHandler } from '../controllers/faceController.js'; 

const router = express.Router();


router.post('/teste', someFaceRecognitionHandler);

export default router;
