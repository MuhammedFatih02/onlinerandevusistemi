import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import Doctor from '../models/Doctor.js';

export const register = async (req, res) => {
    try {
        const user = await User.create(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            throw new Error('Geçersiz email veya şifre');
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        // Giriş yapıldığında lastLogin alanını güncelle
        user.lastLogin = new Date();
        await user.save();

        res.json({ user, token });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) throw new Error('Kullanıcı bulunamadı');
        res.json(user);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        // phone ve insuranceInfo alanlarını içerebilecek şekilde güncelleme
        const updatedUser = await User.findByIdAndUpdate(req.user.userId, req.body, { new: true });
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const addFavoriteHekim = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            { $addToSet: { favoriteHekimler: req.params.hekimId } },
            { new: true }
        );
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const removeFavoriteHekim = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            { $pull: { favoriteHekimler: req.params.hekimId } },
            { new: true }
        );
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getAllDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find().populate('user', 'firstName lastName');
        res.json(doctors);
    } catch (error) {
        console.error('getAllDoctors Error:', error);  // Konsola daha ayrıntılı hata yazdır
        res.status(400).json({ message: error.message || 'Something went wrong' });
    }
};

export const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id).populate('user', 'firstName lastName email phone');
        if (!doctor) throw new Error('Doktor bulunamadı');
        res.json(doctor);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};

export const updateMedicalHistory = async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            req.user.userId,
            { $push: { medicalHistory: req.body.medicalHistory } },
            { new: true }
        );
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
export const addDoctorReview = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.doctorId);
        if (!doctor) throw new Error('Doktor bulunamadı');

        const newReview = {
            user: req.user.userId,
            rating: req.body.rating,
            comment: req.body.comment
        };

        doctor.reviews.push(newReview);
        doctor.averageRating = doctor.reviews.reduce((acc, review) => acc + review.rating, 0) / doctor.reviews.length;

        await doctor.save();

        // Kullanıcının yaptığı değerlendirmeyi kaydet (opsiyonel)
        await User.findByIdAndUpdate(req.user.userId, { $push: { reviews: doctor._id } });

        res.status(201).json(doctor);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const userController = {
    register,
    login,
    getProfile,
    updateProfile,
    addFavoriteHekim,
    removeFavoriteHekim,
    getAllDoctors,
    getDoctorById,
    updateMedicalHistory,
    addDoctorReview
};

export default userController;
