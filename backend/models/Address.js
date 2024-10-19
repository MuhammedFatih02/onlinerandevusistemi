import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true }, // Doktor referansı
    city: { type: String, required: true },      // İl bilgisi
    district: { type: String, required: true },  // İlçe bilgisi
    addressLine: { type: String, required: true }, // Tam adres
    postalCode: { type: String, required: true },  // Posta kodu
    country: { type: String, required: true, default: 'Turkey' } // Varsayılan ülke Türkiye
}, { timestamps: true });

// Adres modeli
const Address = mongoose.model('Address', addressSchema);
export default Address;
