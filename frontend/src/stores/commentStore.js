import { defineStore } from 'pinia';
import axios from 'axios';
const baseURL = 'http://localhost:3000/api/comments'

export const useCommentStore = defineStore('comment', {
    state: () => ({
        comments: [],
        loading: false,
        error: null,
    }),

    actions: {
        // API çağrıları için temel URL

        // Yorumları getir
        async fetchComments({ doctorId, status }) {
            this.loading = true;
            try {
                const response = await axios.get(baseURL, {
                    params: { doctorId, status },
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                this.comments = response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Yorumlar getirilirken bir hata oluştu';
            } finally {
                this.loading = false;
            }
        },

        // Yeni yorum ekle
        async addComment({ doctorId, text, rating }) {
            this.loading = true;
            console.log("baseURL", baseURL);

            try {
                const response = await axios.post(baseURL,
                    { doctorId, text, rating },
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                this.comments.push(response.data.comment);
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Yorum eklenirken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Mevcut yorumu güncelle
        async updateComment({ commentId, text, rating }) {
            this.loading = true;
            try {
                const response = await axios.put(`${baseURL}/${commentId}`,
                    { text, rating },
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                const index = this.comments.findIndex(c => c._id === commentId);
                if (index !== -1) {
                    this.comments[index] = response.data.comment;
                }
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Yorum güncellenirken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Yorum moderasyonu (admin için)
        async moderateComment({ commentId, status }) {
            this.loading = true;
            try {
                const response = await axios.put(`${baseURL}/${commentId}/moderate`,
                    { status },
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                const index = this.comments.findIndex(c => c._id === commentId);
                if (index !== -1) {
                    this.comments[index] = response.data.comment;
                }
                return response.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Yorum moderasyonu sırasında bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },

        // Doktor yanıtı ekle
        async addDoctorResponse({ commentId, response }) {
            this.loading = true;
            try {
                const apiResponse = await axios.post(`${baseURL}/${commentId}/response`,
                    { response },
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                const index = this.comments.findIndex(c => c._id === commentId);
                if (index !== -1) {
                    this.comments[index] = apiResponse.data.comment;
                }
                return apiResponse.data;
            } catch (error) {
                this.error = error.response?.data?.message || 'Doktor yanıtı eklenirken bir hata oluştu';
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});