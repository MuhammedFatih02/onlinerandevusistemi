import Comment from '../models/Comment.js';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import leoProfanity from 'leo-profanity';

// Log fonksiyonu
const log = (message, data) => {
    console.log(`[DEBUG] ${message}:`, JSON.stringify(data, null, 2));
};

export const commentController = {
    // Yeni yorum ekleme
    async addComment(req, res) {
        try {
            const { doctorId, text, rating } = req.body;
            const patientId = req.user.userId;

            // Debugging: Hasta ve doktor ID'leri
            log('Hasta ID', patientId);
            log('Doktor ID', doctorId);

            // Hasta ve doktor arasında tamamlanmış bir randevu olup olmadığını kontrol et
            const appointment = await Appointment.findOne({
                patient: patientId,
                doctor: doctorId,
                status: 'completed'  // Veritabanında "completed" olarak kaydedilmiş durumda arama yapıyoruz
            }).sort({ startTime: -1 });

            // Debugging: Appointment query sonucu
            log('Bulunan randevu', appointment);

            if (!appointment) {
                return res.status(403).json({ message: 'Bu doktor için tamamlanmış bir randevunuz bulunmamaktadır.' });
            }

            // Bu randevu için daha önce bir yorum yapılmış mı?
            const existingComment = await Comment.findOne({
                patient: patientId,
                doctor: doctorId,
                createdAt: { $gt: appointment.startTime }
            });

            // Debugging: Daha önce yapılmış yorum
            log('Var olan yorum', existingComment);

            if (existingComment) {
                return res.status(400).json({ message: 'Bu randevu için zaten bir yorum yapmışsınız.' });
            }

            // Uygunsuz içerik kontrolü
            if (leoProfanity.check(text)) {
                return res.status(400).json({ message: 'Uygunsuz içerik tespit edildi' });
            }

            // Yorum oluşturma
            const comment = new Comment({
                appointment: appointment._id,
                patient: patientId,
                doctor: doctorId,
                text,
                rating
            });

            // Debugging: Kaydedilecek yorum
            log('Kaydedilen yorum', comment);

            await comment.save();

            res.status(201).json({ message: 'Yorum başarıyla eklendi', comment });
        } catch (error) {
            // Debugging: Hata mesajı
            log('Hata', error);
            res.status(500).json({ message: 'Yorum eklenirken bir hata oluştu', error: error.message });
        }
    },

    // Yorumları listeleme
    async getComments(req, res) {
        try {
            const { doctorId, status } = req.query;
            let query = {};

            if (doctorId) query.doctor = doctorId;
            if (status) query.status = status;

            // Debugging: Yorum sorgusu
            log('Yorum sorgusu', query);

            const comments = await Comment.find(query)
                .populate('patient', 'firstName lastName')
                .populate('doctor', 'firstName lastName');

            // Debugging: Yorum sonuçları
            log('Bulunan yorumlar', comments);

            res.json(comments);
        } catch (error) {
            // Debugging: Hata mesajı
            log('Yorumlar getirilirken hata', error);
            res.status(500).json({ message: 'Yorumlar getirilirken bir hata oluştu', error: error.message });
        }
    },

    // Yorum güncelleme (hasta için)
    async updateComment(req, res) {
        try {
            const { commentId } = req.params;
            const { text, rating } = req.body;
            const userId = req.user.userId;

            const comment = await Comment.findById(commentId);
            if (!comment) {
                return res.status(404).json({ message: 'Yorum bulunamadı' });
            }

            if (comment.patient.toString() !== userId) {
                return res.status(403).json({ message: 'Bu yorumu güncelleme yetkiniz yok' });
            }

            if (leoProfanity.check(text)) {
                return res.status(400).json({ message: 'Uygunsuz içerik tespit edildi' });
            }

            comment.text = text;
            comment.rating = rating;
            comment.updatedAt = Date.now();

            // Debugging: Güncellenen yorum
            log('Güncellenen yorum', comment);

            await comment.save();

            res.json({ message: 'Yorum başarıyla güncellendi', comment });
        } catch (error) {
            // Debugging: Hata mesajı
            log('Yorum güncellenirken hata', error);
            res.status(500).json({ message: 'Yorum güncellenirken bir hata oluştu', error: error.message });
        }
    },

    // Yorum moderasyonu (admin için)
    async moderateComment(req, res) {
        try {
            const { commentId } = req.params;
            const { status } = req.body;

            const comment = await Comment.findById(commentId);
            if (!comment) {
                return res.status(404).json({ message: 'Yorum bulunamadı' });
            }

            comment.status = status;

            // Debugging: Yorum durumu güncellemesi
            log('Yorum durumu güncellemesi', comment);

            await comment.save();

            res.json({ message: 'Yorum durumu güncellendi', comment });
        } catch (error) {
            // Debugging: Hata mesajı
            log('Yorum moderasyonu sırasında hata', error);
            res.status(500).json({ message: 'Yorum moderasyonu sırasında bir hata oluştu', error: error.message });
        }
    },

    // Doktor yanıtı ekleme
    async addDoctorResponse(req, res) {
        try {
            const { commentId } = req.params;
            const { response } = req.body;
            const user = req.user;  // Kimlik doğrulama üzerinden gelen kullanıcı bilgisi

            // Debugging: Kullanıcı bilgilerini logluyoruz
            log('Kullanıcı bilgileri', user);

            // Kullanıcının rolünü kontrol ediyoruz
            if (user.role !== 'doctor') {
                return res.status(403).json({ message: 'Bu işlemi sadece doktorlar yapabilir' });
            }

            // Yorum veritabanından bulunuyor
            const comment = await Comment.findById(commentId);

            // Debugging: Bulunan yorumun detaylarını logluyoruz
            log('Bulunan yorum', comment);

            // Eğer yorum bulunamazsa hata döndürüyoruz
            if (!comment) {
                return res.status(404).json({ message: 'Yorum bulunamadı' });
            }

            // Eğer doktor yetkilendirilmişse yanıtı ekliyoruz
            comment.doctorResponse = response;
            comment.updatedAt = Date.now();

            // Debugging: Yorum güncelleme işlemi öncesinde logluyoruz
            log('Yanıt eklenen yorum', comment);

            await comment.save();

            res.json({ message: 'Doktor yanıtı başarıyla eklendi', comment });
        } catch (error) {
            // Debugging: Hata mesajını logluyoruz
            log('Doktor yanıtı eklenirken hata', error);
            res.status(500).json({ message: 'Doktor yanıtı eklenirken bir hata oluştu', error: error.message });
        }
    }
};
