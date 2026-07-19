import express from 'express';
import { 
  createAppointment, 
  getAppointments, 
  modifyAppointment, 
  cancelAppointment, 
  setPatientArrived 
} from '../controllers/appointmentController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', authorize('Super Admin', 'Receptionist'), createAppointment);
router.get('/', getAppointments);
router.put('/:id', modifyAppointment);
router.delete('/:id', authorize('Super Admin', 'Receptionist'), cancelAppointment);
router.post('/:id/arrive', authorize('Super Admin', 'Receptionist'), setPatientArrived);

export default router;
