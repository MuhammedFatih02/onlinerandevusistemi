import { defineStore } from 'pinia';
import axios from 'axios';
import { DateTime } from 'luxon';
import io from 'socket.io-client';  // Socket.io entegrasyonu

const API_BASE_URL = 'http://localhost:3000/api/doctors';
const TIME_ZONE = 'Europe/Istanbul';
const socket = io('http://localhost:3000');  // Socket.io sunucusuna bağlanıyoruz

export const useDoctorStore = defineStore('doctor', {
    state: () => ({
        profile: null,
        availability: [],  // Güncellenmiş weeklyAvailability
        appointments: [],
        services: [],
        patientHistory: {},
        reviews: [],
        availableSlots: [],  // Seçili tarihe göre available slots
        doctorCache: {},
        loading: false,
        error: null,
        selectedDate: null, // Seçili tarihi tutmak için
        logMessages: [],  // Logları tutmak için yeni bir alan
    }),

    getters: {
        isProfileComplete: (state) => !!state.profile,

        formattedAvailability: (state) => {
            return state.availability.map(day => ({
                date: day.date,
                slots: day.slots.map(slot => ({
                    start: slot.start,
                    end: slot.end,
                    status: slot.status
                }))
            }));
        },

        availabilityForDate: (state) => (date) => {
            console.log('availabilityForDate çağrıldı, tarih:', date);
            const foundAvailability = state.availability.find(a => a.date === date);
            console.log('Bulunan müsaitlik:', foundAvailability);
            return foundAvailability ? foundAvailability.slots : [];
        }
    },

    actions: {
        // Socket.io eventlerini dinleyecek olan fonksiyon
        setupSocketListeners() {
            socket.on('connect', () => {
                console.log(`[Socket] Bağlantı başarıyla kuruldu. Socket ID: ${socket.id}`);
            });

            socket.on('availabilityFetched', ({ slotsStatus }) => {
                console.log(`[Socket] Müsaitlik güncellendi. Gelen slotsStatus:`, slotsStatus);
                if (Array.isArray(slotsStatus)) {
                    this.processAvailabilityData(slotsStatus);
                } else {
                    console.error("[Socket] Geçersiz slotsStatus verisi alındı:", slotsStatus);
                    this.logMessages.push("Geçersiz slotsStatus verisi alındı.");
                }
            });

            socket.on('appointmentCreated', ({ appointment, doctorId, slotsStatus }) => {
                console.log(`[Socket] Yeni randevu oluşturuldu:`, appointment);
                if (this.profile && (this.profile._id === doctorId || this.profile._id === appointment.doctor) && Array.isArray(slotsStatus)) {
                    this.processAvailabilityData(slotsStatus);
                } else {
                    console.error("[Socket] Geçersiz slotsStatus verisi alındı:", slotsStatus);
                    this.logMessages.push("Geçersiz slotsStatus verisi alındı.");
                }
            });

            socket.on('appointmentCancelled', ({ appointmentId, doctorId, slotsStatus }) => {
                console.log(`[Socket] Randevu iptal edildi. Randevu ID: ${appointmentId}`);
                if (this.profile && this.profile._id === doctorId && Array.isArray(slotsStatus)) {
                    this.processAvailabilityData(slotsStatus);
                } else {
                    console.error("[Socket] Geçersiz slotsStatus verisi alındı:", slotsStatus);
                    this.logMessages.push("Geçersiz slotsStatus verisi alındı.");
                }
            });

            socket.on('availabilityUpdated', ({ doctorId, slotsStatus }) => {
                console.log(`[Socket] Müsaitlik güncellendi. Doktor ID: ${doctorId}`);
                if (this.profile && this.profile._id === doctorId && Array.isArray(slotsStatus)) {
                    this.processAvailabilityData(slotsStatus);
                } else {
                    console.error("[Socket] Geçersiz slotsStatus verisi alındı:", slotsStatus);
                    this.logMessages.push("Geçersiz slotsStatus verisi alındı.");
                }
            });
        },

        updateAvailabilityAfterAppointment(appointment, date) {
            const availabilityIndex = this.availability.findIndex(a => a.date === date);
            if (availabilityIndex !== -1) {
                const updatedSlots = this.availability[availabilityIndex].slots.map(slot => {
                    const slotStart = DateTime.fromFormat(slot.start, 'HH:mm', { zone: TIME_ZONE });
                    const slotEnd = DateTime.fromFormat(slot.end, 'HH:mm', { zone: TIME_ZONE });
                    const appointmentStart = DateTime.fromISO(appointment.startTime, { zone: TIME_ZONE });
                    const appointmentEnd = DateTime.fromISO(appointment.endTime, { zone: TIME_ZONE });

                    if (slotStart <= appointmentStart && slotEnd >= appointmentEnd) {
                        return { ...slot, status: 'booked' };
                    }
                    return slot;
                });

                this.availability[availabilityIndex].slots = updatedSlots;
                console.log(`[Store] Randevu sonrası güncellenmiş müsaitlik:`, this.availability[availabilityIndex]);
            }
        },

        async fetchDoctorAppointments() {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.get(`${API_BASE_URL}/appointments`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                this.appointments = response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Randevular alınırken bir hata oluştu';
            } finally {
                this.loading = false;
            }
        },

        async fetchAllDoctors() {
            try {
                const response = await axios.get(`http://localhost:3000/api/users/doctors`);
                const doctors = response.data;
                doctors.forEach(doctor => {
                    this.doctorCache[doctor._id] = `${doctor.user.firstName} ${doctor.user.lastName}`;
                });
                return doctors;
            } catch (error) {
                console.error('Error fetching all doctors:', error);
                throw error;
            }
        },

        getDoctorName(doctorId) {
            return this.doctorCache?.[doctorId] || "Bilinmeyen Doktor";
        },

        async getProfile() {
            try {
                console.log('getProfile çağrıldı');
                const response = await axios.get(`${API_BASE_URL}/profile`);
                this.profile = response.data;
                console.log('Profil bilgisi alındı:', this.profile);
            } catch (error) {
                console.error('Profil alınırken hata:', error);
                throw error;
            }
        },

        async createProfile(profileData) {
            try {
                const formData = new FormData();
                Object.keys(profileData).forEach(key => {
                    formData.append(key, profileData[key]);
                });

                const response = await axios.post(`${API_BASE_URL}/profile/create`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                this.profile = response.data;
                socket.emit('newDoctorProfile', this.profile);  // Yeni profil oluşturulduğunda event tetikle
            } catch (error) {
                console.error('Error creating doctor profile:', error);
                throw error;
            }
        },

        async updateProfile(profileData) {
            try {
                const formData = new FormData();
                Object.keys(profileData).forEach(key => {
                    formData.append(key, profileData[key]);
                });

                const response = await axios.put(`${API_BASE_URL}/profile/update`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                this.profile = response.data;
                socket.emit('doctorProfileUpdated', this.profile);  // Profil güncellendiğinde event tetikle
            } catch (error) {
                console.error('Error updating doctor profile:', error);
                throw error;
            }
        },

        async fetchProfile(doctorId) {
            try {
                console.log('fetchProfile çağrıldı, doctorId:', doctorId);
                const response = await axios.get(`http://localhost:3000/api/users/doctors/${doctorId}`);
                this.profile = response.data;
                return response.data;
            } catch (error) {
                console.error('Profil alınırken hata:', error);
                throw error;
            }
        },

        async getAvailability(doctorId) {
            console.log('[getAvailability] Başlangıç, doctorId:', doctorId);
            try {
                const availabilityResponse = await axios.get(`${API_BASE_URL}/${doctorId}/availability`);
                console.log('[getAvailability] API yanıtı alındı:', availabilityResponse.data);

                if (!Array.isArray(availabilityResponse.data)) {
                    console.error('[getAvailability] Geçersiz veri yapısı:', availabilityResponse.data);
                    throw new Error('Sunucudan geçersiz veri yapısı alındı');
                }

                this.processAvailabilityData(availabilityResponse.data);

                socket.emit('joinDoctorRoom', doctorId);
                this.setupSocketListeners();

                console.log('[getAvailability] İşlem tamamlandı');
            } catch (error) {
                console.error('[getAvailability] Hata:', error);
                throw error;
            }
        },

        // Gelen slotsStatus verisini weeklyAvailability yapısına çeviren fonksiyon
        processAvailabilityData(slotsStatus) {
            const groupedSlots = slotsStatus.reduce((acc, slot) => {
                const date = DateTime.fromISO(slot.date, { zone: TIME_ZONE }).toISODate();
                if (!acc[date]) {
                    acc[date] = [];
                }
                acc[date].push({
                    start: this.formatTime(slot.start),
                    end: this.formatTime(slot.end),
                    status: slot.status,
                    specialReason: slot.specialReason
                });
                return acc;
            }, {});

            this.availability = Object.entries(groupedSlots).map(([date, slots]) => ({
                date,
                slots
            }));
            console.log('[processAvailabilityData] İşlenmiş veri:', this.availability);
        },

        // Zamanı formatlayan yardımcı fonksiyon
        formatTime(time) {
            if (!time) return '';
            try {
                return DateTime.fromFormat(time, 'HH:mm', { zone: TIME_ZONE }).toFormat('HH:mm');
            } catch (error) {
                console.error('Zaman formatlanırken hata:', error);
                return time;
            }
        },




        async getAvailableSlots(date, serviceId) {
            console.log('getAvailableSlots çağrıldı, date:', date, 'serviceId:', serviceId);
            try {
                const response = await axios.get(`${API_BASE_URL}/available-slots`, {
                    params: {
                        date: DateTime.fromISO(date, { zone: TIME_ZONE }).toISODate(),
                        serviceId
                    }
                });
                console.log('Alınan müsait slotlar:', response.data);
                this.availableSlots = response.data;
                this.selectedDate = date; // Seçili tarihi kaydet

                // Socket'e seçili tarih bilgisini gönder
                if (this.profile) {
                    socket.emit('watchDate', {
                        doctorId: this.profile._id,
                        date: this.selectedDate
                    });
                }

            } catch (error) {
                console.error('Müsait slotlar alınırken hata:', error);
                throw error;
            }
        },

        // Slot durumunu kontrol etmek için yardımcı method
        isSlotAvailable(date, startTime) {
            const dayAvailability = this.availability.find(a => a.date === date);
            if (!dayAvailability) return false;

            const slot = dayAvailability.slots.find(s => s.start === startTime);
            return slot && slot.status === 'available';
        },

        // Component unmount olduğunda socket cleanup
        cleanup() {
            if (this.profile) {
                socket.emit('leaveDoctorRoom', this.profile._id);
                if (this.selectedDate) {
                    socket.emit('unwatchDate', {
                        doctorId: this.profile._id,
                        date: this.selectedDate
                    });
                }
            }
        },

        async fetchAppointments() {
            try {
                const response = await axios.get(`${API_BASE_URL}/appointments/list`);
                this.appointments = response.data;
            } catch (error) {
                console.error('Error fetching appointments:', error);
                throw error;
            }
        },

        async updateAppointmentStatus(appointmentId, status) {
            try {
                const response = await axios.put(`${API_BASE_URL}/appointments/update/${appointmentId}`, { status });
                const index = this.appointments.findIndex(a => a._id === appointmentId);
                if (index !== -1) {
                    this.appointments[index] = response.data;
                }
            } catch (error) {
                console.error('Error updating appointment status:', error);
                throw error;
            }
        },

        async getPatientHistory(patientId) {
            try {
                const response = await axios.get(`${API_BASE_URL}/patient-history/${patientId}`);
                this.patientHistory[patientId] = response.data;
            } catch (error) {
                console.error('Error fetching patient history:', error);
                throw error;
            }
        },

        async respondToReview(reviewId, response) {
            try {
                const responseData = await axios.post(`${API_BASE_URL}/review/respond/${reviewId}`, { response });
                const index = this.reviews.findIndex(r => r._id === reviewId);
                if (index !== -1) {
                    this.reviews[index] = responseData.data;
                }
            } catch (error) {
                console.error('Error responding to review:', error);
                throw error;
            }
        },

        async addService(serviceData) {
            try {
                const response = await axios.post(`${API_BASE_URL}/service/add`, serviceData);
                this.services.push(response.data.service);
                await this.fetchProfile();
            } catch (error) {
                console.error('Error adding service:', error);
                throw error;
            }
        },
    }
});
