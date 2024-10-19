// src/stores/serviceStore.js
import { defineStore } from 'pinia';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/services';

export const useServiceStore = defineStore('service', {
    state: () => ({
        services: [],
        currentService: null,
        loading: false,
        error: null,

    }),

    getters: {
        getServiceById: (state) => (id) => {
            return state.services.find(service => service._id === id);
        },
        getActiveServices: (state) => {
            return state.services.filter(service => service.isActive);
        }
    },
    actions: {
        async fetchServices() {
            this.loading = true;
            try {
                const response = await axios.get(BASE_URL);
                this.services = response.data;
                this.error = null;
            } catch (error) {
                console.error('Error fetching services:', error);
                this.error = error.response?.data?.message || 'Hizmetler yüklenirken bir hata oluştu';
            } finally {
                this.loading = false;
            }
        },
        async createService(serviceData) {
            this.loading = true;
            try {
                const response = await axios.post(`${BASE_URL}/create`, serviceData);
                this.services.push(response.data);
                this.error = null;
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Hizmet oluşturulurken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateService(id, serviceData) {
            this.loading = true;
            try {
                const response = await axios.put(`${BASE_URL}/update/${id}`, serviceData);
                const index = this.services.findIndex(service => service._id === id);
                if (index !== -1) {
                    this.services[index] = response.data;
                }
                this.error = null;
            } catch (error) {
                this.error = error.response?.data?.message || 'Hizmet güncellenirken bir hata oluştu';
            } finally {
                this.loading = false;
            }
        },

        async deleteService(id) {
            this.loading = true;
            try {
                await axios.delete(`${BASE_URL}/delete/${id}`);
                this.services = this.services.filter(service => service._id !== id);
                this.error = null;
            } catch (error) {
                this.error = error.response?.data?.message || 'Hizmet silinirken bir hata oluştu';
            } finally {
                this.loading = false;
            }
        },

        async fetchServiceDetails(id) {
            this.loading = true;
            try {
                const response = await axios.get(`${BASE_URL}/${id}`);
                console.log('Fetched service details:', JSON.stringify(response.data, null, 2));
                this.currentService = response.data;
                this.error = null;
            } catch (error) {
                console.error('Error fetching service details:', error);
                this.error = error.response?.data?.message || 'Hizmet detayları yüklenirken bir hata oluştu';
            } finally {
                this.loading = false;
            }
        }
    }
});
