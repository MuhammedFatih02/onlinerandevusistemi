import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: false }, // Yeni eklenen alan
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female',] },
    address: { type: String },
    role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },
    favoriteHekimler: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
    medicalHistory: [{ type: String }],
    allergies: [{ type: String }],
    currentMedications: [{ type: String }],
    insuranceInfo: { // Yeni eklenen alan
        provider: { type: String },
        policyNumber: { type: String }
    },
    lastLogin: { type: Date }, // Yeni eklenen alan
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }]
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;