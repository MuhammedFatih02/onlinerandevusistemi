import express from 'express';
import { commentController } from '../controllers/commentController.js';
import { authMiddleware, rbacMiddleware } from '../middleware/index.js';

const router = express.Router();

// Yeni yorum ekleme
router.post('/', authMiddleware, rbacMiddleware(['patient']), commentController.addComment);

// Yorumları listeleme
router.get('/', commentController.getComments);

// Yorum güncelleme (hasta için)
router.put('/:commentId', authMiddleware, rbacMiddleware(['patient']), commentController.updateComment);

// Yorum moderasyonu (admin için)
router.put('/:commentId/moderate', authMiddleware, rbacMiddleware(['admin']), commentController.moderateComment);

// Doktor yanıtı ekleme
router.post('/:commentId/response', authMiddleware, rbacMiddleware(['doctor']), commentController.addDoctorResponse);

export default router;