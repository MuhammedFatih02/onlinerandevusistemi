import { DateTime, Interval } from 'luxon';
import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import Service from '../models/Service.js';
import User from '../models/User.js';
import logger from '../utils/logger.js';
import { io } from '../socket.js';

const TIME_ZONE = 'Europe/Istanbul';

const toLocalTime = (date) => DateTime.fromJSDate(date).setZone(TIME_ZONE);
const toUTC = (date) => DateTime.fromJSDate(date).toUTC().toJSDate();

const getWorkingHours = (date, doctor) => {
    logger.info(`getWorkingHours çağrıldı: Tarih: ${date}, Doktor ID: ${doctor._id}`);

    if (!date || !doctor) {
        logger.error('getWorkingHours: Geçersiz tarih veya doktor bilgisi');
        return null;
    }

    try {
        const localDate = DateTime.fromJSDate(date).setZone(TIME_ZONE);
        if (!localDate.isValid) {
            logger.error(`getWorkingHours: Geçersiz tarih: ${date}`);
            return null;
        }

        const dayOfWeek = localDate.weekdayLong.toLowerCase();
        const workingHours = doctor.workingHours[dayOfWeek] || "09:00-17:00";

        if (!doctor.workingHours[dayOfWeek]) {
            logger.warn(`Doktorun ${dayOfWeek} günü için çalışma saatleri tanımlanmamış. Varsayılan saat kullanılıyor.`);
        }

        logger.info(`Çalışma saatleri bulundu: ${workingHours}`);
        return workingHours;
    } catch (error) {
        logger.error(`getWorkingHours hatası: ${error.message}`, { error });
        return null;
    }
};

const isDoctorAvailable = async (doctor, startTime, endTime) => {
    logger.info(`isDoctorAvailable çağrıldı: Doktor ID: ${doctor._id}, Başlangıç: ${startTime.toISO()}, Bitiş: ${endTime.toISO()}`);

    try {
        const localStartTime = startTime.setZone(TIME_ZONE);
        const localEndTime = endTime.setZone(TIME_ZONE);

        const workingHours = getWorkingHours(localStartTime.toJSDate(), doctor);
        if (!workingHours) {
            logger.warn(`Doktorun çalışma saatleri bulunamadı. Varsayılan saatler kullanılacak.`);
        }

        const [workStart, workEnd] = (workingHours || "09:00-17:00").split('-');
        const workStartTime = localStartTime.set({
            hour: parseInt(workStart.split(':')[0]),
            minute: parseInt(workStart.split(':')[1]),
        });
        const workEndTime = localStartTime.set({
            hour: parseInt(workEnd.split(':')[0]),
            minute: parseInt(workEnd.split(':')[1]),
        });

        if (localStartTime < workStartTime || localEndTime > workEndTime) {
            logger.warn('Randevu zamanı çalışma saatleri dışında');
            return { available: false, reason: 'Randevu zamanı çalışma saatleri dışında' };
        }

        // Mevcut randevuları kontrol et
        const existingAppointments = await Appointment.find({
            doctor: doctor._id,
            startTime: { $lt: localEndTime.toJSDate() },
            endTime: { $gt: localStartTime.toJSDate() },
            status: { $ne: 'iptal edildi' }
        });

        for (const appointment of existingAppointments) {
            const apptStart = DateTime.fromJSDate(appointment.startTime).setZone(TIME_ZONE);
            const apptEnd = DateTime.fromJSDate(appointment.endTime).setZone(TIME_ZONE);
            if (Interval.fromDateTimes(apptStart, apptEnd).overlaps(Interval.fromDateTimes(localStartTime, localEndTime))) {
                logger.warn('Randevu zamanı mevcut bir randevu ile çakışıyor');
                return { available: false, reason: 'Randevu zamanı mevcut bir randevu ile çakışıyor' };
            }
        }

        logger.info('Doktor müsait');
        return { available: true, reason: 'Doktor müsait' };
    } catch (error) {
        logger.error(`isDoctorAvailable hatası: ${error.message}`, { error });
        return { available: false, reason: 'Doktorun müsaitliği kontrol edilirken hata oluştu.' };
    }
};
const checkAppointmentConflict = async (doctorId, startTime, endTime) => {
    logger.info(`Randevu çakışması kontrolü: Doktor ID: ${doctorId}, Başlangıç: ${startTime.toISO()}, Bitiş: ${endTime.toISO()}`);
    const conflictingAppointment = await Appointment.findOne({
        doctor: doctorId,
        $or: [
            { startTime: { $lt: endTime.toJSDate(), $gte: startTime.toJSDate() } },
            { endTime: { $gt: startTime.toJSDate(), $lte: endTime.toJSDate() } },
            { $and: [{ startTime: { $lte: startTime.toJSDate() } }, { endTime: { $gte: endTime.toJSDate() } }] }
        ],
        status: { $ne: 'iptal edildi' }
    });

    if (conflictingAppointment) {
        logger.warn(`Çakışan randevu bulundu: ${conflictingAppointment._id}`);
    } else {
        logger.info('Çakışan randevu bulunamadı');
    }

    return conflictingAppointment;
};
const updateAvailabilitySlots = (doctor) => {
    const updatedAvailability = doctor.availability.map(entry => {
        const dateSlots = [];
        const currentDate = utcToZonedTime(new Date(entry.date), TIME_ZONE);
        const workingHours = doctor.workingHours[format(currentDate, 'EEEE').toLowerCase()];
        const [startHour, endHour] = workingHours.split('-').map(time => {
            const [h, m] = time.split(':').map(Number);
            return utcToZonedTime(new Date(currentDate.setHours(h, m, 0, 0)), TIME_ZONE);
        });

        for (let time = startHour; time < endHour; time = addMinutes(time, 30)) {
            const slotStart = time;
            const slotEnd = addMinutes(time, 30);

            const isBooked = entry.slots.some(slot => {
                const bookedStart = utcToZonedTime(new Date(`${format(currentDate, 'yyyy-MM-dd')}T${slot.start}:00`), TIME_ZONE);
                const bookedEnd = utcToZonedTime(new Date(`${format(currentDate, 'yyyy-MM-dd')}T${slot.end}:00`), TIME_ZONE);

                return (slotStart < bookedEnd && slotEnd > bookedStart);
            });

            const slotStatus = isBooked ? 'dolu' : 'müsait';
            dateSlots.push({ start: format(slotStart, 'HH:mm'), end: format(slotEnd, 'HH:mm'), durum: slotStatus });
        }

        return { date: entry.date, slots: dateSlots };
    });

    doctor.availability = updatedAvailability;
    return doctor;
};

const checkDoctorAvailability = async (doctorId, appointmentStartTime, appointmentEndTime) => {
    logger.info(`Doktor müsaitlik kontrolü: Doktor ID: ${doctorId}, Başlangıç: ${appointmentStartTime.toISO()}, Bitiş: ${appointmentEndTime.toISO()}`);

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
        logger.error(`Doktor bulunamadı. ID: ${doctorId}`);
        return { available: false, reason: 'Doktor bulunamadı' };
    }

    logger.debug(`Bulunan doktor bilgileri: ${JSON.stringify(doctor)}`);

    const localDate = DateTime.fromJSDate(appointmentStartTime.toJSDate()).setZone(TIME_ZONE);
    const workingHours = getWorkingHours(localDate.toJSDate(), doctor);
    if (!workingHours) {
        logger.warn(`Doktor için çalışma saatleri bulunamadı: ${localDate.toFormat('yyyy-MM-dd')}`);
        return { available: false, reason: 'Doktorun o gün için çalışma saatleri tanımlanmamış' };
    }

    const workStartTime = localDate.set({ hour: parseInt(workingHours.start.split(':')[0]), minute: parseInt(workingHours.start.split(':')[1]) });
    const workEndTime = localDate.set({ hour: parseInt(workingHours.end.split(':')[0]), minute: parseInt(workingHours.end.split(':')[1]) });

    logger.debug(`Çalışma saatleri: ${workStartTime.toISO()} - ${workEndTime.toISO()}`);
    logger.debug(`Randevu saatleri: ${appointmentStartTime.toISO()} - ${appointmentEndTime.toISO()}`);

    if (appointmentStartTime < workStartTime || appointmentEndTime > workEndTime) {
        logger.warn('Randevu zamanı çalışma saatleri dışında');
        return { available: false, reason: 'Randevu zamanı çalışma saatleri dışında' };
    }

    // Mevcut randevuları kontrol et
    const existingAppointments = await Appointment.find({
        doctor: doctorId,
        startTime: {
            $gte: appointmentStartTime.toJSDate(),
            $lt: appointmentEndTime.toJSDate()
        },
        endTime: {
            $gt: appointmentStartTime.toJSDate(),
            $lte: appointmentEndTime.toJSDate()
        },
        status: { $ne: 'iptal edildi' }
    });

    for (const appointment of existingAppointments) {
        const apptStart = DateTime.fromJSDate(appointment.startTime).setZone(TIME_ZONE);
        const apptEnd = DateTime.fromJSDate(appointment.endTime).setZone(TIME_ZONE);

        if (Interval.fromDateTimes(apptStart, apptEnd).overlaps(Interval.fromDateTimes(appointmentStartTime, appointmentEndTime))) {
            logger.warn('Randevu zamanı mevcut bir randevu ile çakışıyor');
            return { available: false, reason: 'Doktor bu zaman diliminde müsait değil' };
        }
    }

    logger.info('Doktor müsait');
    return { available: true, reason: 'Müsait slot bulundu' };
};

export const createAppointment = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { doctorId, serviceId, startTime, endTime, patientId: requestPatientId } = req.body;
        let patientId;

        // Kullanıcı rol kontrolü ve hasta ID belirleme
        if (req.user.role === 'patient') {
            patientId = req.user.userId;
        } else if (req.user.role === 'doctor') {
            if (!requestPatientId) {
                throw new Error('Hasta ID\'si gerekli');
            }
            const patient = await User.findById(requestPatientId).session(session);
            if (!patient || patient.role !== 'patient') {
                throw new Error('Hasta bulunamadı');
            }
            patientId = requestPatientId;
        } else {
            throw new Error('Yetkisiz işlem');
        }

        logger.info(`[Backend] Randevu oluşturma isteği: Doktor: ${doctorId}, Hasta: ${patientId}, Hizmet: ${serviceId}, Başlangıç: ${startTime}`);

        const appointmentStartTime = DateTime.fromISO(startTime).setZone(TIME_ZONE);
        const appointmentEndTime = DateTime.fromISO(endTime).setZone(TIME_ZONE);

        const doctor = await Doctor.findById(doctorId).session(session);
        if (!doctor) {
            throw new Error('Doktor bulunamadı');
        }

        const latestAvailabilityCheck = await isDoctorAvailable(doctor, appointmentStartTime, appointmentEndTime);
        logger.info("[Backend] Doktor müsaitlik kontrol sonucu:", latestAvailabilityCheck);
        if (!latestAvailabilityCheck.available) {
            throw new Error(latestAvailabilityCheck.reason);
        }

        const appointment = new Appointment({
            doctor: doctorId,
            patient: patientId,
            service: serviceId,
            startTime: appointmentStartTime.toJSDate(),
            endTime: appointmentEndTime.toJSDate(),
        });

        await appointment.save({ session });
        logger.info(`[Backend] Randevu başarıyla kaydedildi: Randevu ID: ${appointment._id}`);

        // Doktorun haftalık müsaitlik bilgisini güncelle
        const weeklyAvailabilityIndex = doctor.weeklyAvailability.findIndex(
            wa => wa.date.toDateString() === appointmentStartTime.toJSDate().toDateString()
        );

        if (weeklyAvailabilityIndex !== -1) {
            const slots = doctor.weeklyAvailability[weeklyAvailabilityIndex].slots;
            const updatedSlots = slots.map(slot => {
                const slotStart = DateTime.fromFormat(slot.start, 'HH:mm', { zone: TIME_ZONE });
                const slotEnd = DateTime.fromFormat(slot.end, 'HH:mm', { zone: TIME_ZONE });
                if (Interval.fromDateTimes(slotStart, slotEnd).overlaps(Interval.fromDateTimes(appointmentStartTime, appointmentEndTime))) {
                    return { ...slot, status: 'booked' };
                }
                return slot;
            });
            doctor.weeklyAvailability[weeklyAvailabilityIndex].slots = updatedSlots;
            await doctor.save({ session });
            logger.info(`[Backend] Doktorun müsaitlik bilgisi güncellendi. Doktor ID: ${doctor._id}`);

            // Müsaitlik güncellemesi için socket olayı
            const dateStr = appointmentStartTime.toFormat('yyyy-MM-dd');
            logger.info(`[Socket] Müsaitlik güncelleme olayı gönderiliyor. Doktor ID: ${doctorId}, Tarih: ${dateStr}`);
            io.to(`doctor_${doctorId}`).emit('availabilityUpdated', {
                doctorId,
                date: dateStr,
                updatedSlots: updatedSlots
            });
        } else {
            logger.warn(`[Backend] Haftalık müsaitlik bulunamadı: ${appointmentStartTime.toFormat('yyyy-MM-dd')}`);
        }

        await session.commitTransaction();
        logger.info("[Backend] Transaction başarıyla tamamlandı.");

        // Socket.io ile gerçek zamanlı bildirimler gönder
        const appointmentData = {
            _id: appointment._id,
            doctor: doctorId,
            patient: patientId,
            service: serviceId,
            startTime: appointmentStartTime.toISO(),
            endTime: appointmentEndTime.toISO(),
            status: appointment.status
        };

        logger.info(`[Socket] Yeni randevu olayı doktora iletiliyor. Doktor ID: ${doctorId}`);
        io.to(`doctor_${doctorId}`).emit('appointmentCreated', {
            appointment: appointmentData,
            doctorId,
            date: appointmentStartTime.toFormat('yyyy-MM-dd')
        });

        logger.info(`[Socket] Yeni randevu olayı hastaya iletiliyor. Hasta ID: ${patientId}`);
        io.to(`patient_${patientId}`).emit('appointmentCreated', {
            appointment: appointmentData
        });

        res.status(201).json(appointmentData);
    } catch (error) {
        await session.abortTransaction();
        logger.error("[Backend] Transaction geri alındı. Hata:", error.message);
        res.status(500).json({ message: 'Randevu oluşturulurken bir hata oluştu. Lütfen daha sonra tekrar deneyin.' });
    } finally {
        session.endSession();
    }
};
const findSuitableSlot = async (doctor, requestedStartTime, duration) => {
    logger.info(`Uygun slot aranıyor: İstenen başlangıç zamanı: ${requestedStartTime.toISO()}, Süre: ${duration} dakika`);

    const date = requestedStartTime.startOf('day');
    const workingHours = getWorkingHours(date.toJSDate(), doctor);
    if (!workingHours) {
        logger.warn(`Doktor için çalışma saatleri bulunamadı: ${date.toFormat('yyyy-MM-dd')}`);
        return null;
    }

    const [startStr, endStr] = workingHours.split('-');
    const startTime = date.set({ hour: parseInt(startStr.split(':')[0]), minute: parseInt(startStr.split(':')[1]) });
    const endTime = date.set({ hour: parseInt(endStr.split(':')[0]), minute: parseInt(endStr.split(':')[1]) });

    logger.debug(`Çalışma saatleri: ${startTime.toISO()} - ${endTime.toISO()}`);

    const existingAppointments = await Appointment.find({
        doctor: doctor._id,
        startTime: { $gte: toUTC(startTime.toJSDate()), $lt: toUTC(endTime.toJSDate()) },
        status: { $ne: 'iptal edildi' }
    }).sort('startTime');

    let currentTime = startTime;
    while (currentTime.plus({ minutes: duration }) <= endTime) {
        const slotEnd = currentTime.plus({ minutes: duration });
        const isSlotAvailable = !existingAppointments.some(appt => {
            const apptStart = toLocalTime(appt.startTime);
            const apptEnd = toLocalTime(appt.endTime);
            return Interval.fromDateTimes(currentTime, slotEnd).overlaps(Interval.fromDateTimes(apptStart, apptEnd));
        });

        if (isSlotAvailable) {
            logger.info(`Uygun slot bulundu: ${currentTime.toISO()} - ${slotEnd.toISO()}`);
            return { start: currentTime, end: slotEnd };
        }

        currentTime = currentTime.plus({ minutes: 30 });
    }

    logger.warn('Uygun slot bulunamadı');
    return null;
};

export const getAppointments = async (req, res) => {
    try {
        let appointments;
        const query = req.user.role === 'admin' ? {} :
            req.user.role === 'doctor' ? { doctor: req.user.userId } :
                { patient: req.user.userId };

        appointments = await Appointment.find(query)
            .populate('doctor', 'firstName lastName')
            .populate('patient', 'firstName lastName')
            .populate('service', 'name duration');

        // Zaman dilimini düzelt
        appointments = appointments.map(appointment => ({
            ...appointment._doc,
            startTime: DateTime.fromJSDate(appointment.startTime).setZone(TIME_ZONE).toISO(),
            endTime: DateTime.fromJSDate(appointment.endTime).setZone(TIME_ZONE).toISO()
        }));

        res.json(appointments);
    } catch (error) {
        logger.error(`Randevuları getirme hatası: ${error.message}`);
        res.status(400).json({ message: error.message });
    }
};

export const getAppointmentDetail = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('doctor', 'firstName lastName')
            .populate('patient', 'firstName lastName');

        if (!appointment) {
            return res.status(404).json({ message: 'Randevu bulunamadı' });
        }

        if (req.user.role === 'patient' && appointment.patient._id.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Bu randevuyu görüntüleme yetkiniz yok.' });
        }

        if (req.user.role === 'doctor' && appointment.doctor._id.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Bu randevuyu görüntüleme yetkiniz yok.' });
        }

        // Zaman dilimini düzelt
        const appointmentWithTimeZone = {
            ...appointment._doc,
            startTime: DateTime.fromJSDate(appointment.startTime).setZone(TIME_ZONE).toISO(),
            endTime: DateTime.fromJSDate(appointment.endTime).setZone(TIME_ZONE).toISO()
        };

        res.json(appointmentWithTimeZone);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const updateAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const { startTime, serviceId, status } = req.body;

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({ message: 'Randevu bulunamadı.' });
        }

        // Yetki kontrolü
        if (req.user.role === 'patient' && appointment.patient.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Bu randevuyu güncelleme yetkiniz yok.' });
        }

        // Geçmiş randevu kontrolü
        if (DateTime.fromJSDate(appointment.startTime).setZone(TIME_ZONE) < DateTime.now().setZone(TIME_ZONE)) {
            return res.status(400).json({ message: 'Geçmiş randevular güncellenemez.' });
        }

        let updatedService = appointment.service;
        let appointmentDuration = (await Service.findById(appointment.service)).duration;

        // Hizmet ve süre güncelleme
        if (serviceId && serviceId !== appointment.service.toString()) {
            const newService = await Service.findById(serviceId);
            if (!newService) {
                return res.status(404).json({ message: 'Yeni hizmet bulunamadı.' });
            }

            const doctor = await Doctor.findById(appointment.doctor);
            if (!doctor.services.includes(newService._id)) {
                return res.status(400).json({ message: 'Seçilen doktor bu hizmeti sunmuyor.' });
            }

            updatedService = serviceId;
            appointmentDuration = newService.duration;
        }

        // Zaman ve müsaitlik kontrolleri
        let newStartTime = DateTime.fromJSDate(appointment.startTime).setZone(TIME_ZONE);
        let newEndTime = DateTime.fromJSDate(appointment.endTime).setZone(TIME_ZONE);

        if (startTime) {
            newStartTime = DateTime.fromISO(startTime).setZone(TIME_ZONE);
            newEndTime = newStartTime.plus({ minutes: appointmentDuration });

            const doctor = await Doctor.findById(appointment.doctor);

            // Doktor çalışma saatleri kontrolü
            const workingHours = getWorkingHours(newStartTime.toJSDate(), doctor);
            const workStart = newStartTime.set({ hour: parseInt(workingHours.start.split(':')[0]), minute: parseInt(workingHours.start.split(':')[1]) });
            const workEnd = newStartTime.set({ hour: parseInt(workingHours.end.split(':')[0]), minute: parseInt(workingHours.end.split(':')[1]) });

            if (newStartTime < workStart || newEndTime > workEnd) {
                return res.status(400).json({ message: 'Randevu doktorun çalışma saatleri dışında.' });
            }

            // Özel müsaitlik kontrolü
            const specialAvailability = doctor.specialAvailability.find(
                sa => DateTime.fromJSDate(sa.date).setZone(TIME_ZONE).toISODate() === newStartTime.toISODate()
            );
            if (specialAvailability && !specialAvailability.isAvailable) {
                return res.status(400).json({ message: 'Doktor bu tarihte müsait değil.' });
            }

            const isAvailable = await checkDoctorAvailability(appointment.doctor, newStartTime.toJSDate(), newEndTime.toJSDate());
            if (!isAvailable) {
                return res.status(400).json({ message: 'Doktor bu zaman diliminde müsait değil.' });
            }

            const conflictingAppointment = await checkAppointmentConflict(
                appointment.doctor,
                newStartTime,
                newEndTime,
                appointment._id
            );
            if (conflictingAppointment) {
                return res.status(400).json({ message: 'Bu zaman diliminde başka bir randevu bulunmaktadır.' });
            }
        }

        // Durum güncelleme (sadece yetkili kullanıcılar için)
        let newStatus = appointment.status;
        if (status && req.user.role !== 'patient') {
            newStatus = status;
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            id,
            {
                service: updatedService,
                startTime: newStartTime.toJSDate(),
                endTime: newEndTime.toJSDate(),
                status: newStatus
            },
            { new: true }
        );

        // Socket.io ile gerçek zamanlı güncelleme bildirimi
        io.to(`doctor_${updatedAppointment.doctor}`).emit('appointmentUpdated', { appointment: updatedAppointment });
        io.to(`patient_${updatedAppointment.patient}`).emit('appointmentUpdated', { appointment: updatedAppointment });

        res.json(updatedAppointment);
    } catch (error) {
        console.error('Randevu güncelleme hatası:', error);
        res.status(500).json({ message: 'Randevu güncellenirken bir hata oluştu.' });
    }
};
export const cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Randevu bulunamadı.' });
        }

        // Yetki kontrolü
        if (req.user.role === 'patient' && appointment.patient.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Sadece kendi randevularınızı iptal edebilirsiniz.' });
        }

        if (req.user.role === 'doctor' && appointment.doctor.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Sadece size atanmış randevuları iptal edebilirsiniz.' });
        }

        // Geçmiş randevu kontrolü
        const appointmentStartTime = DateTime.fromJSDate(appointment.startTime).setZone(TIME_ZONE);
        if (appointmentStartTime < DateTime.now().setZone(TIME_ZONE)) {
            return res.status(400).json({ message: 'Geçmiş randevular iptal edilemez.' });
        }

        // İptal süresi kontrolü (örneğin, randevudan 24 saat öncesine kadar iptal edilebilir)
        const cancellationDeadline = appointmentStartTime.minus({ hours: 24 });
        if (DateTime.now().setZone(TIME_ZONE) > cancellationDeadline) {
            return res.status(400).json({ message: 'Randevu iptal süresi geçmiş. Lütfen kliniği arayın.' });
        }

        appointment.status = 'iptal edildi';
        appointment.cancelReason = req.body.reason || 'Sebep belirtilmedi';
        appointment.cancelledBy = req.user.role;
        appointment.cancelledAt = DateTime.now().setZone(TIME_ZONE).toJSDate();
        await appointment.save();

        const doctor = await Doctor.findById(appointment.doctor);
        if (doctor) {
            const appointmentDate = appointmentStartTime.startOf('day');

            // Özel müsaitlik kontrolü
            const specialAvailability = doctor.specialAvailability.find(sa =>
                DateTime.fromJSDate(sa.date).setZone(TIME_ZONE).hasSame(appointmentDate, 'day')
            );

            if (!specialAvailability || specialAvailability.isAvailable) {
                // Doktorun normal çalışma saatleri içindeyse müsaitlik listesine ekle
                const workingHours = getWorkingHours(appointmentDate.toJSDate(), doctor);
                if (workingHours) {
                    const workStart = appointmentDate.set({
                        hour: parseInt(workingHours.start.split(':')[0]),
                        minute: parseInt(workingHours.start.split(':')[1])
                    });
                    const workEnd = appointmentDate.set({
                        hour: parseInt(workingHours.end.split(':')[0]),
                        minute: parseInt(workingHours.end.split(':')[1])
                    });

                    if (Interval.fromDateTimes(workStart, workEnd).contains(appointmentStartTime)) {
                        let availabilityForDate = doctor.availability.find(a =>
                            DateTime.fromJSDate(a.date).setZone(TIME_ZONE).hasSame(appointmentDate, 'day')
                        );

                        if (!availabilityForDate) {
                            availabilityForDate = {
                                date: appointmentDate.toJSDate(),
                                slots: []
                            };
                            doctor.availability.push(availabilityForDate);
                        }

                        const startTime = appointmentStartTime.toFormat('HH:mm');
                        const endTime = DateTime.fromJSDate(appointment.endTime).setZone(TIME_ZONE).toFormat('HH:mm');

                        availabilityForDate.slots.push({ start: startTime, end: endTime, durum: 'müsait' });
                        availabilityForDate.slots.sort((a, b) => a.start.localeCompare(b.start));
                        await doctor.save();
                    }
                }
            }
        }

        // Hastaya bildirim gönderme (e-posta veya SMS)
        await sendCancellationNotification(appointment);

        // Socket.io ile gerçek zamanlı iptal bildirimi
        io.to(`doctor_${appointment.doctor}`).emit('appointmentCancelled', { appointmentId: appointment._id });
        io.to(`patient_${appointment.patient}`).emit('appointmentCancelled', { appointmentId: appointment._id });

        res.status(200).json({ message: 'Randevu başarıyla iptal edildi', appointment });
    } catch (error) {
        console.error('Randevu iptal hatası:', error);
        res.status(500).json({ message: 'Randevu iptal edilirken bir hata oluştu.' });
    }
};

// Yardımcı fonksiyon: İptal bildirimi gönderme
const sendCancellationNotification = async (appointment) => {
    try {
        const patient = await User.findById(appointment.patient);
        if (patient && patient.email) {
            // E-posta gönderme işlemi burada gerçekleştirilecek
            console.log(`${patient.email} adresine randevu iptali hakkında bildirim gönderildi.`);
            // Örnek: await sendEmail(patient.email, 'Randevu İptali', 'Randevunuz iptal edilmiştir.');
        }
        // SMS gönderme işlemi de burada eklenebilir
    } catch (error) {
        console.error('Bildirim gönderme hatası:', error);
    }
};
export const addAppointmentNote = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Randevu bulunamadı' });
        }

        if (req.user.role !== 'doctor' || appointment.doctor.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Sadece atanmış doktor not ekleyebilir.' });
        }

        const newNote = {
            text: req.body.text,
            date: DateTime.now().setZone(TIME_ZONE).toJSDate()
        };

        appointment.notes.push(newNote);
        await appointment.save();

        // Notu zaman dilimi ayarlanmış olarak döndür
        const adjustedNote = {
            ...newNote,
            date: DateTime.fromJSDate(newNote.date).setZone(TIME_ZONE).toISO()
        };

        // Socket.io ile gerçek zamanlı not ekleme bildirimi
        io.to(`doctor_${appointment.doctor}`).emit('appointmentNoteAdded', { appointmentId: appointment._id, note: adjustedNote });
        io.to(`patient_${appointment.patient}`).emit('appointmentNoteAdded', { appointmentId: appointment._id, note: adjustedNote });

        res.status(200).json(adjustedNote);
    } catch (error) {
        console.error('Not ekleme hatası:', error);
        res.status(400).json({ message: error.message });
    }
};

export const getAppointmentHistory = async (req, res) => {
    try {
        let appointments;
        const query = req.user.role === 'admin' ? {} :
            req.user.role === 'doctor' ? { doctor: req.user.userId } :
                { patient: req.user.userId };

        query.status = { $in: ['completed', 'cancelled'] };

        appointments = await Appointment.find(query)
            .populate('doctor', 'firstName lastName')
            .populate('patient', 'firstName lastName')
            .populate('service', 'name duration');

        // Zaman dilimini düzelt ve tarihleri ISO formatına çevir
        appointments = appointments.map(appointment => ({
            ...appointment._doc,
            startTime: DateTime.fromJSDate(appointment.startTime).setZone(TIME_ZONE).toISO(),
            endTime: DateTime.fromJSDate(appointment.endTime).setZone(TIME_ZONE).toISO(),
            cancelledAt: appointment.cancelledAt ?
                DateTime.fromJSDate(appointment.cancelledAt).setZone(TIME_ZONE).toISO() :
                null,
            notes: appointment.notes.map(note => ({
                ...note,
                date: DateTime.fromJSDate(note.date).setZone(TIME_ZONE).toISO()
            }))
        }));

        res.json(appointments);
    } catch (error) {
        console.error('Randevu geçmişi getirme hatası:', error);
        res.status(400).json({ message: error.message });
    }
};
const appointmentController = {
    createAppointment,
    getAppointments,
    getAppointmentDetail,
    updateAppointment,
    cancelAppointment,
    getAppointmentHistory,
    addAppointmentNote,
};

export default appointmentController;