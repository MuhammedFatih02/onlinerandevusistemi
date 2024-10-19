// routes/serviceRoutes.js
import express from 'express';
import { createService, getAllServices, getServiceById, updateService, deleteService, addDoctorToService } from '../controllers/serviceController.js';
import { authMiddleware, rbacMiddleware, rateLimitMiddleware } from '../middleware/index.js';

const router = express.Router();

// Public routes
router.get('/', rateLimitMiddleware, getAllServices);
router.get('/:id', rateLimitMiddleware, getServiceById);

// Protected routes
router.use(authMiddleware); // Tüm aşağıdaki rotalar için authentication gerekli

// Admin ve doktor rotaları
router.post(
    '/create',
    rbacMiddleware(['admin', 'doctor']),
    rateLimitMiddleware,
    createService
);

router.put(
    '/update/:id',
    rbacMiddleware(['admin', 'doctor']),
    rateLimitMiddleware,
    updateService
);

router.delete(
    '/delete/:id',
    rbacMiddleware(['admin', 'doctor']),
    rateLimitMiddleware,
    deleteService
);

// Yeni eklenen rota
router.post(
    '/:id/add-doctor',
    rbacMiddleware(['admin']),
    rateLimitMiddleware,
    addDoctorToService
);

// Admin özel rotaları (örnek olarak)
router.get(
    '/admin/all',
    rbacMiddleware(['admin']),
    rateLimitMiddleware,
    (req, res) => {
        // Tüm hizmetleri getir (aktif olmayanlar dahil)
        // Bu fonksiyonu serviceController.js'de tanımlayabilirsiniz
    }
);

export default router;