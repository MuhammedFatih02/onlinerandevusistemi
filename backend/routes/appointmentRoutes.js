import express from 'express';
import appointmentController from '../controllers/AppointmentController.js';
import { authMiddleware, rbacMiddleware } from '../middleware/index.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/create', rbacMiddleware(['patient', 'doctor']), appointmentController.createAppointment);
router.get('/list', appointmentController.getAppointments);
router.get('/:id', appointmentController.getAppointmentDetail);
router.put('/:id', appointmentController.updateAppointment);
router.put('/:id/cancel', appointmentController.cancelAppointment);
router.get('/history', appointmentController.getAppointmentHistory);
router.post('/:id/note', rbacMiddleware(['doctor']), appointmentController.addAppointmentNote);

export default router;