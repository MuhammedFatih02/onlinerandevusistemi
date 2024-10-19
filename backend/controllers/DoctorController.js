import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Service from '../models/Service.js';
import logger from '../utils/logger.js';
import { DateTime, Interval } from 'luxon';
import mongoose from 'mongoose';
import { io } from '../socket.js';

const TIME_ZONE = 'Europe/Istanbul';

const toLocalTime = (date) => DateTime.fromJSDate(date).setZone(TIME_ZONE);
const toUTC = (date) => DateTime.fromJSDate(date).toUTC().toJSDate();

async function updateDailyAvailability(doctorId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        console.log(`[Log] Günlük müsaitlik güncelleme başladı. Doktor ID: ${doctorId}`);
        const doctor = await Doctor.findById(doctorId).session(session);

        if (!doctor) {
            throw new Error('Doktor bulunamadı');
        }

        const today = DateTime.now().setZone(TIME_ZONE).startOf('day');

        // Haftalık müsaitliği kontrol ediyoruz
        if (doctor.weeklyAvailability.length >= 7) {
            console.log(`[Log] Eski günler temizleniyor. Haftalık müsaitlik 7 günden fazla.`);
            doctor.weeklyAvailability.shift(); // En eski günü sil
        }

        // Yeni günü ekleyelim
        const newDay = today.plus({ days: 7 });
        const dayOfWeek = newDay.weekdayLong.toLowerCase();
        const workingHours = doctor.workingHours[dayOfWeek];

        if (workingHours) {
            const [start, end] = workingHours.split('-');
            const slots = generateTimeSlots(start, end);

            doctor.weeklyAvailability.push({
                date: newDay.toJSDate(),
                slots: slots
            });
            console.log(`[Log] Yeni slotlar eklendi: Gün: ${dayOfWeek}, Saatler: ${start} - ${end}`);
        } else {
            console.warn(`[Uyarı] Çalışma saati tanımlı değil, slot eklenmedi: ${dayOfWeek}`);
        }

        // Randevular ile çakışan slotları güncelle
        const recentAppointments = await Appointment.find({
            doctor: doctorId,
            startTime: {
                $gte: today.minus({ days: 1 }).toJSDate(),
                $lt: today.plus({ days: 7 }).toJSDate()
            },
            status: { $ne: 'iptal edildi' }
        }).session(session);

        console.log(`[Log] Güncellenmesi gereken randevular bulundu: ${recentAppointments.length} adet randevu`);

        const affectedDates = [...new Set(recentAppointments.map(app =>
            DateTime.fromJSDate(app.startTime).setZone(TIME_ZONE).startOf('day').toISODate()
        ))];

        doctor.weeklyAvailability.forEach(day => {
            const dayDate = DateTime.fromJSDate(day.date).setZone(TIME_ZONE).startOf('day');
            if (affectedDates.includes(dayDate.toISODate())) {
                console.log(`[Log] Güncellenen gün: ${dayDate.toISODate()}`);

                day.slots.forEach(slot => {
                    const slotStart = dayDate.set({
                        hour: parseInt(slot.start.split(':')[0]),
                        minute: parseInt(slot.start.split(':')[1])
                    });
                    const slotEnd = dayDate.set({
                        hour: parseInt(slot.end.split(':')[0]),
                        minute: parseInt(slot.end.split(':')[1])
                    });

                    const isBooked = recentAppointments.some(appt =>
                        Interval.fromDateTimes(
                            DateTime.fromJSDate(appt.startTime).setZone(TIME_ZONE),
                            DateTime.fromJSDate(appt.endTime).setZone(TIME_ZONE)
                        ).overlaps(Interval.fromDateTimes(slotStart, slotEnd))
                    );

                    slot.status = isBooked ? 'booked' : 'available';
                    console.log(`[Log] Slot durumu: Başlangıç: ${slot.start}, Bitiş: ${slot.end}, Durum: ${slot.status}`);
                });
            }
        });

        await doctor.save({ session });
        await session.commitTransaction();
        console.log(`[Log] Müsaitlik başarıyla güncellendi ve kaydedildi. Doktor ID: ${doctorId}`);

        // **Socket.io Entegrasyonu: Tüm kullanıcıları bilgilendir**
        io.emit('availabilityUpdated', { doctorId, availability: doctor.weeklyAvailability });

    } catch (error) {
        await session.abortTransaction();
        console.error('[Hata] Müsaitlik güncellenirken hata oluştu:', error);
        throw error;
    } finally {
        session.endSession();
    }
}

const generateTimeSlots = (start, end) => {
    const slots = [];
    let current = DateTime.fromFormat(start, 'HH:mm', { zone: TIME_ZONE });
    const endTime = DateTime.fromFormat(end, 'HH:mm', { zone: TIME_ZONE });

    while (current < endTime) {
        const slotStart = current.toFormat('HH:mm');
        current = current.plus({ minutes: 30 });
        const slotEnd = current.toFormat('HH:mm');
        slots.push({ start: slotStart, end: slotEnd, status: 'available' });
    }

    return slots;
};

const generateWeeklySlots = (workingHours, startDate, endDate) => {
    const availability = [];
    let currentDate = new Date(startDate);

    console.log(`[Log] Haftalık slot oluşturma işlemi başladı. Başlangıç Tarihi: ${startDate}, Bitiş Tarihi: ${endDate}`);

    while (currentDate <= endDate) {
        const day = currentDate.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
        const hours = workingHours[day];

        // Çalışma saatlerini kontrol ediyoruz
        if (hours) {
            const [start, end] = hours.split('-');
            console.log(`[Log] Slotlar oluşturuluyor: Gün: ${day}, Saat Aralığı: ${start} - ${end}`);

            availability.push({
                date: new Date(currentDate.getTime()),
                slots: generateTimeSlots(start, end)
            });

        } else {
            console.warn(`[Uyarı] Çalışma saatleri tanımsız: ${day}`);
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`[Log] Haftalık slot oluşturma tamamlandı. Oluşturulan gün sayısı: ${availability.length}`);
    return availability;
};

const generateWeeklyAvailability = (workingHours, startDate, endDate) => {
    const availability = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        const day = currentDate.toLocaleString('en-US', { weekday: 'long' }).toLowerCase();
        const hours = workingHours[day];

        if (hours) {
            const [start, end] = hours.split('-');
            availability.push({
                date: new Date(currentDate.getTime()), // Burada değişiklik yapıldı
                slots: generateTimeSlots(start, end)
            });
        }

        currentDate.setDate(currentDate.getDate() + 1);
    }

    return availability;
};

export const createDoctorProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) {
            logger.error('Kullanıcı bulunamadı');
            throw new Error('Kullanıcı bulunamadı');
        }

        // Profil fotoğrafı varsa dosya yolunu ekle
        const doctorData = { ...req.body, user: user._id };
        if (req.file) {
            doctorData.profilePhoto = req.file.path;
        }

        const doctor = await Doctor.create(doctorData);
        logger.info(`Doktor profili oluşturuldu: ${doctor._id}`);

        doctor.availability = generateWeeklyAvailability(doctor.workingHours);
        await doctor.save();

        res.status(201).json(doctor);

        // **Socket.io Entegrasyonu: Yeni doktor profili oluştuğunda bilgilendir**
        io.emit('newDoctorProfile', { doctor });

    } catch (error) {
        logger.error(`createDoctorProfile hatası: ${error.message}`);
        res.status(400).json({ message: error.message });
    }
};

export const updateDoctorProfile = async (req, res) => {
    try {
        const updatedData = { ...req.body };

        if (req.file) {
            updatedData.profilePhoto = req.file.path;
        }

        const updatedDoctor = await Doctor.findOneAndUpdate(
            { user: req.user.userId },
            updatedData,
            { new: true }
        );

        if (!updatedDoctor) {
            logger.error('Doktor bulunamadı');
            return res.status(404).json({ message: 'Doktor bulunamadı' });
        }

        logger.info(`Doktor profili güncellendi: ${updatedDoctor._id}`);

        if (req.body.workingHours) {
            updatedDoctor.availability = generateWeeklyAvailability(updatedDoctor.workingHours);
            await updatedDoctor.save();
            logger.info(`Doktorun müsaitlik bilgileri güncellendi: ${updatedDoctor._id}`);
        }

        res.json(updatedDoctor);

        // **Socket.io Entegrasyonu: Doktor profili güncellenince bilgilendir**
        io.emit('doctorProfileUpdated', { doctor: updatedDoctor });

    } catch (error) {
        logger.error(`updateDoctorProfile hatası: ${error.message}`);
        res.status(400).json({ message: error.message });
    }
};

export const getDoctorProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.user.userId })
            .populate('user', 'firstName lastName email')
            .populate('services');

        if (!doctor) {
            return res.status(404).json({ message: 'Doktor profili bulunamadı' });
        }

        // Profil fotoğrafı kontrolü yapıyoruz
        let profilePhotoUrl = null;
        if (doctor.profilePhoto) {
            profilePhotoUrl = `http://localhost:3000/${doctor.profilePhoto}`; // Profil fotoğrafı varsa URL'ini döndür
        }

        res.json({
            id: doctor._id,
            user: doctor.user,
            specialization: doctor.specialization,
            experience: doctor.experience,
            fullAddress: doctor.fullAddress,
            city: doctor.city,
            landlinePhone: doctor.landlinePhone,
            profilePhoto: profilePhotoUrl,  // Profil fotoğrafını URL olarak döndür
            services: doctor.services
        });
    } catch (error) {
        console.error('Error in getDoctorProfile:', error);
        res.status(500).json({ message: 'Sunucu hatası', error: error.message });
    }
};

export const getDoctorAppointments = async (req, res) => {
    console.log('getDoctorAppointments fonksiyonu çağrıldı');
    try {
        const userId = req.user.userId;
        console.log('User ID:', userId);

        // Önce doktor bilgisini bulalım
        const doctor = await Doctor.findOne({ user: userId });
        if (!doctor) {
            console.log('Doktor bulunamadı');
            return res.status(404).json({ message: "Doktor bulunamadı" });
        }
        console.log('Doktor ID:', doctor._id);

        // Doktorun randevularını bulma
        const appointments = await Appointment.find({ doctor: doctor._id })
            .populate('service', 'name')
            .populate('patient', 'firstName lastName email phone dateOfBirth gender')
            .lean();

        console.log('Bulunan randevu sayısı:', appointments.length);

        if (appointments.length === 0) {
            console.log('Doktora ait randevu bulunamadı');
            return res.status(200).json({ message: "Randevu bulunamadı", appointments: [] });
        }

        // Randevu bilgilerini işleme
        const appointmentsWithPatientInfo = appointments.map(appointment => ({
            _id: appointment._id,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            status: appointment.status,
            notes: appointment.notes,
            service: appointment.service,
            patient: appointment.patient,
            createdAt: appointment.createdAt,
            updatedAt: appointment.updatedAt
        }));

        console.log('İşlenmiş randevu sayısı:', appointmentsWithPatientInfo.length);

        res.status(200).json(appointmentsWithPatientInfo);
    } catch (error) {
        console.error('Randevular alınırken hata oluştu:', error);
        res.status(500).json({ message: "Randevular alınırken bir hata oluştu.", error: error.message });
    }
};
export const getAvailability = async (req, res) => {
    try {
        const doctorId = req.params.doctorId;
        logger.info(`[Backend] getAvailability çağrıldı. Doktor ID: ${doctorId}`);

        const doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            logger.error(`[Backend] Doktor bulunamadı. ID: ${doctorId}`);
            return res.status(404).json({ message: 'Doktor bulunamadı' });
        }

        const today = DateTime.now().setZone(TIME_ZONE);
        const endDate = today.plus({ days: 6 });

        // Mevcut randevuları al
        const appointments = await Appointment.find({
            doctor: doctorId,
            startTime: { $gte: today.toJSDate(), $lte: endDate.toJSDate() },
            status: { $ne: 'iptal edildi' }
        });

        logger.debug(`[Backend] Randevu verileri: ${JSON.stringify(appointments)}`);

        // Haftalık slotları oluştur
        const weeklySlots = generateWeeklySlots(doctor.workingHours, today.toJSDate(), endDate.toJSDate());

        // Özel müsaitlikleri al
        const specialAvailabilities = doctor.specialAvailability.filter(sa =>
            DateTime.fromJSDate(sa.date).setZone(TIME_ZONE) >= today &&
            DateTime.fromJSDate(sa.date).setZone(TIME_ZONE) <= endDate
        );

        // Slotların durumu
        const slotsStatus = weeklySlots.flatMap(day => {
            const dayDate = DateTime.fromJSDate(day.date).setZone(TIME_ZONE).startOf('day');

            return day.slots.map(slot => {
                const slotStart = dayDate.set({
                    hour: parseInt(slot.start.split(':')[0]),
                    minute: parseInt(slot.start.split(':')[1])
                });
                const slotEnd = dayDate.set({
                    hour: parseInt(slot.end.split(':')[0]),
                    minute: parseInt(slot.end.split(':')[1])
                });

                // Bu slot için özel bir müsaitlik var mı kontrol et
                const specialAvailability = specialAvailabilities.find(sa =>
                    DateTime.fromJSDate(sa.date).hasSame(dayDate, 'day') &&
                    (!sa.startTime || Interval.fromDateTimes(
                        dayDate.set({ hour: parseInt(sa.startTime.split(':')[0]), minute: parseInt(sa.startTime.split(':')[1]) }),
                        dayDate.set({ hour: parseInt(sa.endTime.split(':')[0]), minute: parseInt(sa.endTime.split(':')[1]) })
                    ).overlaps(Interval.fromDateTimes(slotStart, slotEnd)))
                );

                // Eğer özel müsaitlik varsa, durumu ona göre ayarla
                if (specialAvailability) {
                    return {
                        start: slot.start,
                        end: slot.end,
                        status: specialAvailability.isAvailable ? 'available' : 'unavailable',
                        date: day.date.toISOString().split('T')[0],
                        specialReason: specialAvailability.reason || null
                    };
                }

                // Mevcut randevularla çakışan bir slot var mı kontrol et
                const isBooked = appointments.some(app =>
                    Interval.fromDateTimes(
                        DateTime.fromJSDate(app.startTime).setZone(TIME_ZONE),
                        DateTime.fromJSDate(app.endTime).setZone(TIME_ZONE)
                    ).overlaps(Interval.fromDateTimes(slotStart, slotEnd))
                );

                return {
                    start: slot.start,
                    end: slot.end,
                    status: isBooked ? 'booked' : 'available',
                    date: day.date.toISOString().split('T')[0]
                };
            });
        });

        logger.debug(`[Backend] Frontend'e gönderilen veri: ${JSON.stringify(slotsStatus)}`);

        // Socket ile müsaitlik bilgisini gönder
        logger.info(`[Socket] Müsaitlik bilgisi gönderiliyor. Doktor ID: ${doctorId}`);
        io.to(`doctor_${doctorId}`).emit('availabilityFetched', { slotsStatus });

        res.json(slotsStatus);
    } catch (error) {
        logger.error(`[Backend] getAvailability hatası: ${error.message}`, { error });
        res.status(500).json({ message: error.message });
    }
};
export const getAvailableSlots = async (req, res) => {
    try {
        const { doctorId, date, serviceId } = req.query;
        const doctor = await Doctor.findById(doctorId);
        const service = await Service.findById(serviceId);

        if (!doctor || !service) {
            return res.status(404).json({ message: 'Doktor veya hizmet bulunamadı' });
        }

        const requestedDate = DateTime.fromISO(date).setZone(TIME_ZONE);
        const today = DateTime.now().setZone(TIME_ZONE);

        let availableSlots;

        if (requestedDate <= today.plus({ days: 6 })) {
            // Gelecek 7 gün içindeyse weeklyAvailability'den al
            const dayAvailability = doctor.weeklyAvailability.find(a =>
                DateTime.fromJSDate(a.date).hasSame(requestedDate, 'day')
            );

            if (!dayAvailability) {
                return res.status(404).json({ message: 'Bu gün için müsaitlik bulunamadı' });
            }

            availableSlots = dayAvailability.slots
                .filter(slot => slot.status === 'available')
                .map(slot => slot.start);
        } else {
            // Daha uzak tarihler için çalışma saatlerini kullan
            const dayOfWeek = requestedDate.weekdayLong.toLowerCase();
            const workingHours = doctor.workingHours[dayOfWeek];

            if (!workingHours) {
                return res.status(404).json({ message: 'Bu gün için çalışma saati bulunamadı' });
            }

            const [start, end] = workingHours.split('-');
            availableSlots = generateTimeSlots(start, end)
                .map(slot => slot.start);

            // Mevcut randevuları kontrol et ve çakışanları çıkar
            const appointments = await Appointment.find({
                doctor: doctorId,
                startTime: {
                    $gte: requestedDate.startOf('day').toJSDate(),
                    $lt: requestedDate.endOf('day').toJSDate()
                },
                status: { $ne: 'iptal edildi' }
            });

            availableSlots = availableSlots.filter(slot => {
                const slotStart = requestedDate.set({
                    hour: parseInt(slot.split(':')[0]),
                    minute: parseInt(slot.split(':')[1])
                });
                const slotEnd = slotStart.plus({ minutes: service.duration });

                return !appointments.some(appt =>
                    Interval.fromDateTimes(
                        DateTime.fromJSDate(appt.startTime),
                        DateTime.fromJSDate(appt.endTime)
                    ).overlaps(Interval.fromDateTimes(slotStart, slotEnd))
                );
            });
        }

        res.json(availableSlots);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


export const getAppointments = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.user.userId });
        const appointments = await Appointment.find({ doctor: doctor._id })
            .populate('patient', 'firstName lastName')
            .populate('service');
        res.json(appointments);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateAppointmentStatus = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(appointment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getPatientHistory = async (req, res) => {
    try {
        const appointments = await Appointment.find({ doctor: req.user.userId, patient: req.params.patientId })
            .sort('-date')
            .populate('patient', 'firstName lastName');
        res.json(appointments);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const respondToReview = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ user: req.user.userId });
        const review = doctor.reviews.id(req.params.reviewId);
        if (!review) throw new Error('Değerlendirme bulunamadı');
        review.doctorResponse = req.body.response;
        await doctor.save();
        res.json(review);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const addService = async (req, res) => {
    logger.info('addService fonksiyonu çağrıldı');
    try {
        let doctor = await Doctor.findOne({ user: req.user.userId });
        if (!doctor) {
            logger.error('Doktor bulunamadı');
            return res.status(404).json({ message: 'Doktor bulunamadı' });
        }

        logger.info(`Doktor bulundu: ${doctor._id}`);

        const { serviceName, description, duration, price } = req.body;
        logger.info(`Yeni hizmet bilgileri: ${JSON.stringify({ serviceName, description, duration, price })}`);

        const newService = new Service({
            name: serviceName,
            description,
            duration,
            price,
            doctors: [doctor._id],
            createdBy: req.user.userId
        });

        await newService.save();
        logger.info(`Yeni hizmet kaydedildi: ${newService._id}`);

        if (!doctor.services) {
            doctor.services = [];
        }
        doctor.services.push(newService._id);

        logger.info('Doktor kaydediliyor');
        doctor = await doctor.save();

        logger.info('Doktor başarıyla kaydedildi');

        return res.status(201).json({ message: 'Hizmet başarıyla eklendi', service: newService, doctor: doctor });
    } catch (error) {
        logger.error(`Hata oluştu: ${error.message}`);
        logger.error(error.stack);
        return res.status(400).json({ message: error.message });
    }
};
export const addSpecialAvailability = async (req, res) => {
    try {
        if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Bu işlem için yetkiniz yok.' });
        }

        const { date, startTime, endTime, isAvailable, reason } = req.body;
        let doctor = await Doctor.findOne({ user: req.user.userId });

        if (!doctor && req.user.role !== 'admin') {
            return res.status(404).json({ message: 'Doktor bulunamadı.' });
        }

        if (req.user.role === 'admin') {
            const { doctorId } = req.body;
            doctor = await Doctor.findById(doctorId);
            if (!doctor) {
                return res.status(404).json({ message: 'Doktor bulunamadı.' });
            }
        }

        if (!doctor.specialAvailability) {
            doctor.specialAvailability = [];
        }

        const specialDate = toUTC(DateTime.fromISO(date).setZone(TIME_ZONE).toJSDate());

        const availabilityEntry = {
            date: specialDate,
            isAvailable,
            reason
        };

        if (startTime && endTime) {
            availabilityEntry.startTime = startTime;
            availabilityEntry.endTime = endTime;
        }

        doctor.specialAvailability.push(availabilityEntry);

        await doctor.save();

        res.status(201).json({ message: 'Özel müsaitlik durumu eklendi.' });

        // **Socket.io Entegrasyonu: Özel müsaitlik bilgisi eklendiğinde bilgilendir**
        io.emit('specialAvailabilityAdded', { doctorId: doctor._id, specialAvailability: availabilityEntry });

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const doctorController = {
    createDoctorProfile,
    updateDoctorProfile,
    getDoctorProfile,
    getAvailability,
    getAvailableSlots,
    getAppointments,
    updateAppointmentStatus,
    getPatientHistory,
    respondToReview,
    addService,
    addSpecialAvailability,
    getDoctorAppointments
};

export default doctorController;