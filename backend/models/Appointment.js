import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['planlandı', 'tamamlandı', 'iptal edildi'],
        default: 'planlandı'
    },
    notes: String
}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;