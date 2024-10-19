import { defineStore } from 'pinia'
import axios from 'axios'

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null,
        token: null,
        doctors: [],
        isLoading: false,
        favorites: [],
        error: null,
        role: null
    }),

    getters: {
        isLoggedIn: (state) => {
            console.log("isLoggedIn getter çağrıldı, token:", !!state.token);
            return !!state.token;
        },
        fullName: (state) => {
            console.log("fullName getter çağrıldı, user:", state.user);
            return state.user ? `${state.user.firstName} ${state.user.lastName}` : '';
        },
        favoriteHekimler: (state) => {
            console.log("favoriteHekimler getter çağrıldı, user:", state.user);
            return state.user ? state.user.favoriteHekimler || [] : [];
        },
        isAdmin: (state) => {
            console.log("isAdmin getter çağrıldı, role:", state.role);
            return state.role === 'admin';
        },
        isDoctor: (state) => {
            console.log("isDoctor getter çağrıldı, role:", state.role);
            return state.role === 'doctor';
        },
        isPatient: (state) => {
            console.log("isPatient getter çağrıldı, role:", state.role);
            return state.role === 'patient';
        },
    },

    actions: {
        initializeStore() {
            console.log("initializeStore çağrıldı");
            const token = localStorage.getItem('token');
            if (token) {
                console.log("Token bulundu, setToken ve getProfile çağrılıyor");
                this.setToken(token);
                return this.getProfile();
            }
            console.log("Token bulunamadı");
            return Promise.resolve();
        },
        setToken(token) {
            console.log("setToken çağrıldı, token:", token);
            this.token = token;
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        },
        async register(userData) {
            console.log("register çağrıldı, userData:", userData);
            this.isLoading = true
            try {
                const response = await axios.post('http://localhost:3000/api/users/register', userData)
                console.log("Kayıt yanıtı:", response.data)
                this.user = { ...response.data }
                this.isLoading = false
                console.log("Güncellenmiş user state:", this.user);
            } catch (error) {
                this.error = error.response.data.message
                console.error("Kayıt hatası:", error.response.data)
                this.isLoading = false
                throw error
            }
        },
        async login(credentials) {
            console.log("login çağrıldı, credentials:", credentials);
            this.isLoading = true
            try {
                const response = await axios.post('http://localhost:3000/api/users/login', credentials)
                console.log("Giriş yanıtı:", response.data)
                this.user = { ...response.data.user }
                this.role = response.data.role
                this.setToken(response.data.token)
                this.isLoading = false
                console.log("Güncellenmiş user state:", this.user);
                console.log("Güncellenmiş role state:", this.role);
            } catch (error) {
                this.error = error.response?.data?.message || 'Login failed'
                console.error("Giriş hatası:", error.response?.data)
                this.isLoading = false
                throw error
            }
        },
        async getProfile() {
            console.log("getProfile çağrıldı");
            this.isLoading = true;
            try {
                console.log("Profil bilgisi yükleniyor...");
                const response = await axios.get('http://localhost:3000/api/users/profile');
                console.log("Profil bilgisi yanıtı:", response.data); // Tüm yanıtı kontrol et
                if (response.data && response.data._id) { // Kullanıcı bilgilerini burada kontrol edin
                    this.user = { ...response.data };
                    this.role = response.data.role;
                    console.log("Güncellenmiş user state:", this.user);
                    console.log("Güncellenmiş role state:", this.role);
                } else {
                    console.warn("Kullanıcı bilgisi mevcut değil:", response.data);
                }
            } catch (error) {
                this.error = error.response?.data?.message || 'Failed to get profile';
                console.error("Profil bilgisi hatası:", error.response?.data);
                // this.logout(); // Bunu geçici olarak yorumlayın
            } finally {
                this.isLoading = false;
            }
        },
        async updateProfile(profileData) {
            console.log("updateProfile çağrıldı, profileData:", profileData);
            this.isLoading = true
            try {
                const response = await axios.put('http://localhost:3000/api/users/profile', profileData)
                console.log("Profil güncelleme yanıtı:", response.data)
                this.user = { ...response.data }
                this.isLoading = false
                console.log("Güncellenmiş user state:", this.user);
            } catch (error) {
                this.error = error.response.data.message
                console.error("Profil güncelleme hatası:", error.response.data)
                this.isLoading = false
                throw error
            }
        },
        async updateInsuranceInfo(insuranceInfo) {
            console.log("updateInsuranceInfo çağrıldı, insuranceInfo:", insuranceInfo);
            this.isLoading = true
            try {
                const response = await axios.put('http://localhost:3000/api/users/insurance', { insuranceInfo })
                console.log("Sigorta bilgisi güncelleme yanıtı:", response.data)
                this.user = { ...response.data }
                this.isLoading = false
                console.log("Güncellenmiş user state:", this.user);
            } catch (error) {
                this.error = error.response.data.message
                console.error("Sigorta bilgisi güncelleme hatası:", error.response.data)
                this.isLoading = false
                throw error
            }
        },
        async updateMedicalInfo(medicalInfo) {
            console.log("updateMedicalInfo çağrıldı, medicalInfo:", medicalInfo);
            this.isLoading = true
            try {
                const response = await axios.put('http://localhost:3000/api/users/medical-info', medicalInfo)
                console.log("Tıbbi bilgi güncelleme yanıtı:", response.data)
                this.user = { ...response.data }
                this.isLoading = false
                console.log("Güncellenmiş user state:", this.user);
            } catch (error) {
                this.error = error.response.data.message
                console.error("Tıbbi bilgi güncelleme hatası:", error.response.data)
                this.isLoading = false
                throw error
            }
        },

        async addFavoriteHekim(hekimId) {
            console.log("addFavoriteHekim çağrıldı, hekimId:", hekimId);
            try {
                const response = await axios.post(`http://localhost:3000/api/users/favorite-hekimler/${hekimId}`)
                console.log("Favori hekim ekleme yanıtı:", response.data)
                this.user = { ...response.data }
                console.log("Güncellenmiş user state:", this.user);
            } catch (error) {
                this.error = error.response.data.message
                console.error("Favori hekim ekleme hatası:", error.response.data)
                throw error
            }
        },
        async removeFavoriteHekim(hekimId) {
            console.log("removeFavoriteHekim çağrıldı, hekimId:", hekimId);
            try {
                const response = await axios.delete(`http://localhost:3000/api/users/favorite-hekimler/${hekimId}`)
                console.log("Favori hekim kaldırma yanıtı:", response.data)
                this.user = { ...response.data }
                console.log("Güncellenmiş user state:", this.user);
            } catch (error) {
                this.error = error.response.data.message
                console.error("Favori hekim kaldırma hatası:", error.response.data)
                throw error
            }
        },
        async getAllDoctors() {
            console.log("getAllDoctors çağrıldı");
            this.isLoading = true
            this.error = null
            try {
                const response = await axios.get('http://localhost:3000/api/users/doctors')
                console.log("Tüm doktorlar yanıtı:", response.data)
                this.doctors = [...response.data]
                console.log("Güncellenmiş doctors state:", this.doctors);
            } catch (error) {
                this.error = error.message
                console.error('Doktorları alırken hata:', error)
            } finally {
                this.isLoading = false
            }
        },
        async getDoctorById(doctorId) {
            console.log("getDoctorById çağrıldı, doctorId:", doctorId);
            this.isLoading = true
            try {
                const response = await axios.get(`http://localhost:3000/api/users/doctors/${doctorId}`)
                console.log("Doktor bilgisi yanıtı:", response.data)
                return response.data
            } catch (error) {
                this.error = error.response.data.message
                console.error("Doktor bilgisi hatası:", error.response.data)
                this.isLoading = false
                throw error
            }
        },
        async updateMedicalHistory(medicalHistory) {
            console.log("updateMedicalHistory çağrıldı, medicalHistory:", medicalHistory);
            try {
                const response = await axios.put('http://localhost:3000/api/users/medical-history', { medicalHistory })
                console.log("Tıbbi geçmiş güncelleme yanıtı:", response.data)
                this.user = { ...response.data }
                console.log("Güncellenmiş user state:", this.user);
            } catch (error) {
                this.error = error.response.data.message
                console.error("Tıbbi geçmiş güncelleme hatası:", error.response.data)
                throw error
            }
        },
        async addDoctorReview(doctorId, reviewData) {
            console.log("addDoctorReview çağrıldı, doctorId:", doctorId, "reviewData:", reviewData);
            try {
                const response = await axios.post(`http://localhost:3000/api/users/review/${doctorId}`, reviewData)
                console.log("Doktor inceleme yanıtı:", response.data)
                return response.data
            } catch (error) {
                this.error = error.response.data.message
                console.error("Doktor inceleme hatası:", error.response.data)
                throw error
            }
        },
        logout() {
            console.log("logout çağrıldı");
            this.user = null
            this.token = null
            this.role = null
            localStorage.removeItem('token')
            delete axios.defaults.headers.common['Authorization']
            console.log("Kullanıcı çıkış yaptı, state sıfırlandı");
        },
    },
})