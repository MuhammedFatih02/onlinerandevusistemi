import express from 'express';
import adminController from '../controllers/adminController.js';
import { authMiddleware, rbacMiddleware } from '../middleware/index.js';

const router = express.Router();

// Tüm admin rotaları için authMiddleware ve rbacMiddleware kullanıyoruz
router.use(authMiddleware, rbacMiddleware(['admin']));

router.get('/user', adminController.getAllUsers);
router.get('/users', adminController.getAllUsersWithPassword);
router.put('/users/:userId', adminController.updateUser);
router.put('/users/:userId/role', adminController.updateUserRole);
router.get('/appointments', adminController.getAllAppointments);
router.put('/settings', adminController.updateSystemSettings);
router.post('/featured-doctors', adminController.setFeaturedDoctors);
router.put('/reviews/:doctorId/:reviewId', adminController.moderateReview);

export default router;