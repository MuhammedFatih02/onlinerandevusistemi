import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import bcrypt from 'bcrypt'
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.userId, { role: req.body.role }, { new: true });
        if (!user) throw new Error('User not found');
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find({}).populate('doctor', 'firstName lastName').populate('patient', 'firstName lastName');
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateSystemSettings = async (req, res) => {
    try {
        // Bu fonksiyon, sistem ayarlarını güncelleyecek şekilde implemente edilmeli
        // Örnek: const settings = await Settings.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.json({ message: 'System settings updated successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const setFeaturedDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.updateMany(
            { _id: { $in: req.body.doctorIds } },
            { $set: { isFeatured: true } }
        );
        res.json({ message: 'Featured doctors updated successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const moderateReview = async (req, res) => {
    try {
        const { doctorId, reviewId } = req.params;
        const doctor = await Doctor.findById(doctorId);
        if (!doctor) throw new Error('Doctor not found');

        const review = doctor.reviews.id(reviewId);
        if (!review) throw new Error('Review not found');

        if (req.body.action === 'remove') {
            review.remove();
        } else if (req.body.action === 'approve') {
            review.isApproved = true;
        }

        await doctor.save();
        res.json({ message: 'Review moderated successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
export const getAllUsersWithPassword = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Kullanıcı güncelleme fonksiyonu
export const updateUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const updateData = req.body;

        // Eğer şifre güncelleniyorsa, yeni şifreyi hashleme
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const adminController = {
    getAllUsers,
    updateUserRole,
    getAllAppointments,
    updateSystemSettings,
    setFeaturedDoctors,
    moderateReview,
    updateUser,
    getAllUsersWithPassword
};

export default adminController;