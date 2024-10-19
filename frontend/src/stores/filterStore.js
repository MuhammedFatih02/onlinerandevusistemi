import { defineStore } from 'pinia';
import axios from 'axios';

export const useFilterStore = defineStore('filter', {
    state: () => ({
        doctors: [],
        services: [],
        loading: false,
        error: null
    }),

    actions: {
        async fetchDoctors(filters = {}) {
            this.loading = true
            this.error = null
            try {
                const response = await axios.get('http://localhost:3000/api/filter/doctors', { params: filters })
                this.doctors = response.data
            } catch (error) {
                this.error = error.message
            } finally {
                this.loading = false
            }
        },

        async filterServices(params) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.get('http://localhost:3000/api/filter/services', { params });
                this.services = response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Hizmetleri filtreleme sırasında bir hata oluştu';
                console.error('Error filtering services:', error);
            } finally {
                this.loading = false;
            }
        },

        async searchDoctorsByCity(city) {
            this.loading = true;
            this.error = null;
            try {
                const response = await axios.get(`http://localhost:3000/api/filter/city/${city}`);
                this.doctors = response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Şehre göre doktor arama sırasında bir hata oluştu';
                console.error('Error searching doctors by city:', error);
            } finally {
                this.loading = false;
            }
        }
    }
});