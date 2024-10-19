import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import Doctor from './../models/Doctor.js';


export const authMiddleware = async (req, res, next) => {
    console.log('authMiddleware çağrıldı');
    const token = req.header('Authorization')?.replace('Bearer ', '');

    console.log('Alınan token:', token);

    if (!token) {
        console.log('Token bulunamadı');
        return res.status(401).json({ message: 'Yetkilendirme tokeni bulunamadı' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Çözülen token:', decoded);

        // Kullanıcıyı veritabanından al ve role bilgisini ekle
        const user = await User.findById(decoded.userId);
        if (!user) {
            throw new Error('Kullanıcı bulunamadı');
        }

        req.user = {
            userId: decoded.userId,
            role: user.role,
            iat: decoded.iat,
            exp: decoded.exp
        };

        console.log('req.user atandı:', req.user);
        next();
    } catch (error) {
        console.error('Token doğrulama hatası:', error);
        res.status(401).json({ message: 'Geçersiz token' });
    }
};

export const rbacMiddleware = (allowedRoles) => {
    return async (req, res, next) => {
        console.log('rbacMiddleware çağrıldı');
        console.log('İzin verilen roller:', allowedRoles);
        console.log('Kullanıcı bilgisi:', req.user);

        try {
            const user = await User.findById(req.user.userId);
            console.log('Veritabanından bulunan kullanıcı:', user);

            if (!user) {
                console.log('Kullanıcı bulunamadı');
                throw new Error('Kullanıcı bulunamadı');
            }

            if (!allowedRoles.includes(user.role)) {
                console.log('Yetki hatası: Kullanıcı rolü', user.role);
                return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
            }
            console.log('Yetki kontrolü başarılı');
            next();
        } catch (error) {
            console.error('rbacMiddleware hatası:', error);
            res.status(401).json({ message: error.message });
        }
    };
};

export const rateLimitMiddleware = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 100 // IP başına limit
});