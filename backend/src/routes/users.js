import express from 'express';
import { createUser, getUsers } from '../controllers/userController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('Super Admin'));

router.post('/', createUser);
router.get('/', getUsers);

export default router;
