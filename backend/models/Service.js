import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    price: { type: Number, required: true },
    doctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true } // Varsayılan olarak true
}, { timestamps: true });

const Service = mongoose.model('Service', serviceSchema);

export default Service;