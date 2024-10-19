import mongoose from 'mongoose';
import path from 'path';  // path modülü import edilmeli

const doctorSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    specialization: { type: String, required: true },
    experience: { type: Number, required: true },
    education: [{ type: String }],
    workingHours: {
        monday: { type: String, default: "09:00-17:00" },
        tuesday: { type: String, default: "09:00-17:00" },
        wednesday: { type: String, default: "09:00-17:00" },
        thursday: { type: String, default: "09:00-17:00" },
        friday: { type: String, default: "09:00-17:00" },
        saturday: { type: String, default: "10:00-14:00" },
        sunday: { type: String, default: null }
    },
    weeklyAvailability: [{
        date: { type: Date, required: true },
        slots: [{
            start: { type: String, required: true },
            end: { type: String, required: true },
            status: { type: String, enum: ['available', 'booked', 'unavailable'], default: 'available' }
        }]
    }],
    specialAvailability: [{
        date: { type: Date, required: true },
        startTime: { type: String },
        endTime: { type: String },
        isAvailable: { type: Boolean, required: true },
        reason: { type: String }
    }],
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    reviews: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, required: true, min: 1, max: 5 },
        comment: String,
        date: { type: Date, default: Date.now },
        doctorResponse: String
    }],
    averageRating: { type: Number, default: 0 },
    address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },

    // Yeni eklenen alanlar
    fullAddress: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    landlinePhone: {
        type: String,
        validate: {
            validator: function (v) {
                return /\d{10}/.test(v);
            },
            message: props => `${props.value} geçerli bir sabit hat numarası değil!`
        }
    },
    profilePhoto: {
        type: String,
        validate: {
            validator: function (v) {
                // Hem dosya yolu hem de URL olabilir
                return path.isAbsolute(v) || v.startsWith('./') || v.startsWith('../') || /^https?:\/\/.+/i.test(v);
            },
            message: props => `${props.value} geçerli bir dosya yolu veya URL değil!`
        }
    },
    acceptedInsuranceCompanies: [{
        type: String
    }]
}, { timestamps: true });

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
