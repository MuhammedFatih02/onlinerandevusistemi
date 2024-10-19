import express from 'express';
import userController from '../controllers/UserController.js';
import { authMiddleware, rbacMiddleware, rateLimitMiddleware } from '../middleware/index.js';

const router = express.Router();

router.post('/register', rateLimitMiddleware, userController.register);
router.post('/login', rateLimitMiddleware, userController.login);
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.post('/favorite-hekimler/:hekimId', authMiddleware, userController.addFavoriteHekim);
router.delete('/favorite-hekimler/:hekimId', authMiddleware, userController.removeFavoriteHekim);
router.get('/doctors', userController.getAllDoctors);
router.get('/doctors/:id', authMiddleware, userController.getDoctorById);
router.put('/medical-history', authMiddleware, userController.updateMedicalHistory);
router.post('/review/:doctorId', authMiddleware, userController.addDoctorReview);

// Admin rotaları örneği
router.get('/admin/users', authMiddleware, rbacMiddleware(['admin']), (req, res) => {
    // Admin kullanıcı listesi işlemleri
});

export default router;