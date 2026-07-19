import express from 'express';
import { getDoctors, updateSchedule, fetchSchedule } from '../controllers/doctorController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getDoctors);
router.get('/:doctorId/schedule', fetchSchedule);
router.put('/:doctorId/schedule', authorize('Super Admin'), updateSchedule);

export default router;
