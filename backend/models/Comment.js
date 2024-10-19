import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    text: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    status: { type: String, enum: ['beklemede', 'onaylandı', 'reddedildi'], default: 'beklemede' },
    doctorResponse: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;