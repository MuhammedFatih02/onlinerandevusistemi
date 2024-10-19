import multer from 'multer'; // Multer import edilmeli
import path from 'path'; // Dosya uzantısını almak için kullanacağız

// Multer dosya yükleme ayarları
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Dosyalar uploads dizinine kaydedilecek
    },
    filename: (req, file, cb) => {
        // Dosya adını benzersiz yapmak için tarih ile birleştiriyoruz
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

export const upload = multer({ storage: storage });
