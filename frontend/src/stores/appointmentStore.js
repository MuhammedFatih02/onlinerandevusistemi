import { defineStore } from 'pinia'
import axios from 'axios'
import io from 'socket.io-client'

const BASE_URL = 'http://localhost:3000/api/appointments'
const socket = io('http://localhost:3000')

export const useAppointmentStore = defineStore('appointment', {
    state: () => ({
        appointments: [],
        currentAppointment: null,
        specialAvailabilities: [],
        loading: false,
        error: null
    }),

    getters: {
        getAppointmentById: (state) => (id) => {
            return state.appointments.find(appointment => appointment._id === id)
        },
        getUpcomingAppointments: (state) => {
            const now = new Date().toISOString();
            return state.appointments.filter(appointment => appointment.startTime > now);
        }
    },

    actions: {
        setupSocketListeners() {
            socket.on('connect', () => {
                console.log(`[Socket] Bağlantı başarıyla kuruldu. Socket ID: ${socket.id}`);
            });

            socket.on('newAppointment', (appointment) => {
                console.log(`[Socket] Yeni randevu alındı:`, appointment);
                this.appointments.push(appointment);
                console.log(`[Store] Randevular güncellendi. Toplam randevu sayısı: ${this.appointments.length}`);
            });

            socket.on('appointmentUpdated', ({ appointment }) => {
                console.log(`[Socket] Randevu güncellendi:`, appointment);
                const index = this.appointments.findIndex(a => a._id === appointment._id);
                if (index !== -1) {
                    this.appointments[index] = appointment;
                    console.log(`[Store] Randevu güncellendi. Güncel randevu:`, this.appointments[index]);
                }
            });

            socket.on('appointmentCancelled', ({ appointmentId }) => {
                console.log(`[Socket] Randevu iptal edildi. Randevu ID: ${appointmentId}`);
                const index = this.appointments.findIndex(a => a._id === appointmentId);
                if (index !== -1) {
                    this.appointments[index].status = 'iptal edildi';
                    console.log(`[Store] Randevu durumu güncellendi. Güncel durum: iptal edildi`);
                }
            });
        },

        async fetchAppointments() {
            this.loading = true
            try {
                const response = await axios.get(`${BASE_URL}/list`)
                this.appointments = response.data
                this.error = null
            } catch (error) {
                this.error = error.response?.data?.message || 'Randevular yüklenirken bir hata oluştu'
            } finally {
                this.loading = false
            }
        },

        async createAppointment(appointmentData) {
            this.loading = true;
            try {
                console.log('Creating appointment with data:', JSON.stringify(appointmentData, null, 2));
                const response = await axios.post(`${BASE_URL}/create`, appointmentData);
                console.log('Appointment creation response:', JSON.stringify(response.data, null, 2));

                const createdAppointment = response.data;

                if (appointmentData.patientId && appointmentData.patientId !== createdAppointment.patient) {
                    console.warn('Warning: Sent patientId does not match returned patient ID');
                    console.warn('Sent patientId:', appointmentData.patientId);
                    console.warn('Returned patient:', createdAppointment.patient);
                }

                this.appointments.push(createdAppointment);
                socket.emit('newAppointment', createdAppointment);
                this.error = null;
                return createdAppointment;
            } catch (error) {
                console.error('Error creating appointment:', error);
                console.error('Error response:', error.response?.data);

                if (error.response && error.response.status === 400) {
                    console.warn('Müsaitlik hatası:', error.response.data);
                }

                this.error = error.response?.data?.message || error.message || 'Randevu oluşturulurken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateAppointment(id, appointmentData) {
            this.loading = true
            try {
                const response = await axios.put(`${BASE_URL}/${id}`, appointmentData)
                const updatedAppointment = response.data
                const index = this.appointments.findIndex(appointment => appointment._id === id)
                if (index !== -1) {
                    this.appointments[index] = updatedAppointment
                }
                socket.emit('appointmentUpdated', { appointment: updatedAppointment })
                this.error = null
                return updatedAppointment
            } catch (error) {
                this.error = error.response?.data?.message || 'Randevu güncellenirken bir hata oluştu'
                throw error
            } finally {
                this.loading = false
            }
        },

        async cancelAppointment(id, reason) {
            this.loading = true
            try {
                const response = await axios.put(`${BASE_URL}/${id}/cancel`, { reason })
                const cancelledAppointment = response.data
                const index = this.appointments.findIndex(appointment => appointment._id === id)
                if (index !== -1) {
                    this.appointments[index] = cancelledAppointment
                }
                socket.emit('appointmentCancelled', { appointmentId: id })
                this.error = null
                return cancelledAppointment
            } catch (error) {
                this.error = error.response?.data?.message || 'Randevu iptal edilirken bir hata oluştu'
                throw error
            } finally {
                this.loading = false
            }
        },

        async fetchAppointmentDetails(id) {
            this.loading = true
            try {
                const response = await axios.get(`${BASE_URL}/${id}`)
                this.currentAppointment = response.data
                this.error = null
            } catch (error) {
                this.error = error.response?.data?.message || 'Randevu detayları yüklenirken bir hata oluştu'
            } finally {
                this.loading = false
            }
        },

        async addAppointmentNote(id, note) {
            this.loading = true
            try {
                const response = await axios.post(`${BASE_URL}/${id}/note`, { text: note })
                const updatedAppointment = response.data
                const index = this.appointments.findIndex(appointment => appointment._id === id)
                if (index !== -1) {
                    this.appointments[index] = updatedAppointment
                }
                if (this.currentAppointment && this.currentAppointment._id === id) {
                    this.currentAppointment = updatedAppointment
                }
                socket.emit('appointmentNoteAdded', { appointmentId: id, note })
                this.error = null
                return updatedAppointment
            } catch (error) {
                this.error = error.response?.data?.message || 'Not eklenirken bir hata oluştu'
                throw error
            } finally {
                this.loading = false
            }
        },

        async getAppointmentHistory() {
            this.loading = true
            try {
                const response = await axios.get(`${BASE_URL}/history`)
                this.appointments = response.data
                this.error = null
            } catch (error) {
                this.error = error.response?.data?.message || 'Randevu geçmişi yüklenirken bir hata oluştu'
            } finally {
                this.loading = false
            }
        },

        async addSpecialAvailability(availabilityData) {
            this.loading = true
            console.log('Sending request with data:', JSON.stringify(availabilityData, null, 2))

            try {
                const response = await axios.post(`http://localhost:3000/api/doctors/special-availability`, availabilityData)

                console.log('Received response:', JSON.stringify(response.data, null, 2))

                if (response.data && typeof response.data === 'object') {
                    if (Array.isArray(response.data)) {
                        this.specialAvailabilities = response.data
                    } else {
                        this.specialAvailabilities.push(response.data)
                    }
                } else {
                    console.error('Unexpected response format:', response.data)
                    throw new Error('Unexpected response format')
                }

                this.error = null
                return response.data
            } catch (error) {
                console.error('Error in addSpecialAvailability:', error)

                if (error.response) {
                    console.error('Error response data:', error.response.data)
                    console.error('Error response status:', error.response.status)
                    console.error('Error response headers:', error.response.headers)
                } else if (error.request) {
                    console.error('Error request:', error.request)
                } else {
                    console.error('Error message:', error.message)
                }

                this.error = error.response?.data?.message || 'Özel müsaitlik eklenirken bir hata oluştu'
                throw error
            } finally {
                this.loading = false
            }
        },
    }
})