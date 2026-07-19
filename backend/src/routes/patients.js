import express from 'express';
import { searchPatients } from '../controllers/patientController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/search', searchPatients);

export default router;
