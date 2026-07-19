import express from 'express';
import { getSlots } from '../controllers/slotController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getSlots);

export default router;
