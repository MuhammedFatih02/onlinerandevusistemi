import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            // useNewUrlParser ve useUnifiedTopology opsiyonlarını kaldırın
        });
        console.log('MongoDB bağlantısı başarılı.');
    } catch (error) {
        console.error('MongoDB bağlantı hatası:', error.message);
        process.exit(1);
    }
};

export default connectDB;