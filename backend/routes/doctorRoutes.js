import express from 'express';
import doctorController from '../controllers/DoctorController.js';  // Multer middleware'i de import edin
import { upload } from '../middleware/multer.js'
import { authMiddleware, rbacMiddleware, rateLimitMiddleware } from '../middleware/index.js';

const router = express.Router();

// Fotoğraf yükleme işlemi için multer middleware kullanımı
router.post('/profile/create', authMiddleware, rbacMiddleware(['doctor']), upload.single('profilePhoto'), doctorController.createDoctorProfile);
router.put('/profile/update', authMiddleware, rbacMiddleware(['doctor']), upload.single('profilePhoto'), doctorController.updateDoctorProfile);
router.get('/profile', authMiddleware, doctorController.getDoctorProfile);
router.get('/:doctorId/availability', authMiddleware, doctorController.getAvailability);
router.get('/appointments/list', authMiddleware, doctorController.getAppointments);
router.put('/appointments/update/:id', authMiddleware, rbacMiddleware(['doctor']), doctorController.updateAppointmentStatus);
router.get('/patient-history/:patientId', authMiddleware, rbacMiddleware(['doctor']), doctorController.getPatientHistory);
router.post('/review/respond/:reviewId', authMiddleware, rbacMiddleware(['doctor']), doctorController.respondToReview);
router.post('/service/add', authMiddleware, rbacMiddleware(['doctor']), doctorController.addService);
router.post('/special-availability', rbacMiddleware(['doctor', 'admin']), doctorController.addSpecialAvailability);

// Yeni eklenen rotalar
router.get('/available-slots', authMiddleware, doctorController.getAvailableSlots);
//randevu ve hasta bilgielrini alma 
router.get('/appointments',
    rateLimitMiddleware,
    authMiddleware,
    rbacMiddleware(['doctor']),
    doctorController.getDoctorAppointments
);

export default router;
