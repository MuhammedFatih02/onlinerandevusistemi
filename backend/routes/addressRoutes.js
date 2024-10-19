import express from 'express';
import { addDoctorAddress, updateDoctorAddress, deleteDoctorAddress } from '../controllers/addressController.js';
import { authMiddleware, rbacMiddleware } from '../middleware/index.js';

const router = express.Router();

// Adres ekleme (Sadece doktorlar)
router.post('/add', authMiddleware, rbacMiddleware(['doctor']), addDoctorAddress);

// Adres güncelleme (Sadece doktorlar)
router.put('/update', authMiddleware, rbacMiddleware(['doctor']), updateDoctorAddress);


router.delete('/delete/:addressId', authMiddleware, rbacMiddleware(['doctor']), deleteDoctorAddress);

export default router;
