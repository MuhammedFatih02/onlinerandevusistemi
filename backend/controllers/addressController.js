import Doctor from '../models/Doctor.js';
import { validationResult } from 'express-validator';

// Doktorun adres bilgilerini eklemesi
export const addDoctorAddress = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullAddress, city, landlinePhone } = req.body;

    try {
        const doctor = await Doctor.findOne({ user: req.user.userId });
        if (!doctor) {
            return res.status(404).json({ message: 'Doktor bulunamadı' });
        }

        // Eğer doktorun zaten adres bilgileri varsa, güncelleme yapılmasını öneririz
        if (doctor.fullAddress || doctor.city || doctor.landlinePhone) {
            return res.status(400).json({ message: 'Adres bilgileri zaten mevcut. Güncelleme yapmak için updateDoctorAddress endpoint\'ini kullanın.' });
        }

        doctor.fullAddress = fullAddress;
        doctor.city = city;
        doctor.landlinePhone = landlinePhone;

        await doctor.save();

        res.status(201).json({ message: 'Adres bilgileri eklendi', doctor });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
};

// Doktorun kendi adres bilgilerini görüntülemesi
export const getDoctorAddress = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.user.userId });
        if (!doctor) {
            return res.status(404).json({ message: 'Doktor bulunamadı' });
        }
        res.status(200).json({
            fullAddress: doctor.fullAddress,
            city: doctor.city,
            landlinePhone: doctor.landlinePhone
        });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
};

// Doktorun kendi adres bilgilerini güncellemesi
export const updateDoctorAddress = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullAddress, city, landlinePhone } = req.body;

    try {
        const doctor = await Doctor.findOne({ user: req.user.userId });
        if (!doctor) {
            return res.status(404).json({ message: 'Doktor bulunamadı' });
        }

        doctor.fullAddress = fullAddress || doctor.fullAddress;
        doctor.city = city || doctor.city;
        doctor.landlinePhone = landlinePhone || doctor.landlinePhone;

        await doctor.save();

        res.status(200).json({ message: 'Adres bilgileri güncellendi', doctor });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
};

// Doktorun adres bilgilerini silmesi
export const deleteDoctorAddress = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.user.userId });
        if (!doctor) {
            return res.status(404).json({ message: 'Doktor bulunamadı' });
        }

        doctor.fullAddress = undefined;
        doctor.city = undefined;
        doctor.landlinePhone = undefined;

        await doctor.save();

        res.status(200).json({ message: 'Adres bilgileri silindi' });
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
};