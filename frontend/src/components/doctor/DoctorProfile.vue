<template>
  <div class="min-h-screen bg-gradient-to-r from-blue-50 to-indigo-100 py-12">
    <div
      v-if="userStore.isDoctor"
      class="container mx-auto px-4 sm:px-6 lg:px-8"
    >
      <!-- Yükleniyor Ekranı -->
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div
          class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"
        ></div>
      </div>

      <!-- Profil ve Kullanıcı Bilgileri Gösterimi -->
      <div
        v-else-if="doctorProfile && !isEditing"
        class="bg-white shadow-2xl rounded-lg overflow-hidden"
      >
        <!-- Başlık -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h2 class="text-3xl font-extrabold text-white">
            <i class="fas fa-user-md mr-2"></i> Doktor Profili
          </h2>
        </div>

        <!-- Profil İçeriği -->
        <div class="p-6 space-y-8">
          <!-- Kullanıcı Bilgileri Kartı -->
          <div class="bg-gray-50 rounded-lg p-6 shadow-inner">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">
              Kullanıcı Bilgileri
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-center">
                <span class="font-semibold text-gray-600 w-32">Ad:</span>
                <span class="text-gray-900">{{
                  doctorProfile.user.firstName
                }}</span>
              </div>
              <div class="flex items-center">
                <span class="font-semibold text-gray-600 w-32">Soyad:</span>
                <span class="text-gray-900">{{
                  doctorProfile.user.lastName
                }}</span>
              </div>
              <div class="flex items-center">
                <span class="font-semibold text-gray-600 w-32">Email:</span>
                <span class="text-gray-900">{{
                  doctorProfile.user.email
                }}</span>
              </div>
            </div>
          </div>

          <!-- Profil Fotoğrafı -->
          <div class="bg-gray-50 rounded-lg p-6 shadow-inner">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">
              Profil Fotoğrafı
            </h3>
            <div v-if="doctorProfile?.profilePhoto">
              <img
                :src="doctorProfile.profilePhoto"
                :alt="`${doctorProfile.user.firstName} ${doctorProfile.user.lastName} Profil Fotoğrafı`"
                class="h-40 w-40 rounded-full object-cover"
                crossorigin="anonymous"
              />
            </div>
            <div v-else>
              <p class="text-gray-600">Profil fotoğrafı bulunamadı.</p>
            </div>
          </div>

          <!-- Profil Bilgileri Kartı -->
          <div class="bg-gray-50 rounded-lg p-6 shadow-inner">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">
              Profil Bilgileri
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex items-center">
                <span class="font-semibold text-gray-600 w-32">Uzmanlık:</span>
                <span class="text-gray-900">{{
                  doctorProfile.specialization
                }}</span>
              </div>
              <div class="flex items-center">
                <span class="font-semibold text-gray-600 w-32">Deneyim:</span>
                <span class="text-gray-900"
                  >{{ doctorProfile.experience }} yıl</span
                >
              </div>
              <div class="flex items-center">
                <span class="font-semibold text-gray-600 w-32">Şehir:</span>
                <span class="text-gray-900">{{ doctorProfile.city }}</span>
              </div>
              <div class="flex items-center">
                <span class="font-semibold text-gray-600 w-32">Telefon:</span>
                <span class="text-gray-900">{{
                  doctorProfile.landlinePhone
                }}</span>
              </div>
              <div class="flex items-center col-span-2">
                <span class="font-semibold text-gray-600 w-32">Adres:</span>
                <span class="text-gray-900">{{
                  doctorProfile.fullAddress
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Profili Güncelle Butonu -->
        <div class="bg-gray-100 px-6 py-4 text-right">
          <button
            @click="isEditing = true"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
          >
            <i class="fas fa-edit mr-2"></i> Profili Güncelle
          </button>
        </div>
      </div>

      <!-- Güncelleme Formu -->
      <div
        v-else-if="doctorProfile && isEditing"
        class="bg-white shadow-2xl rounded-lg overflow-hidden"
      >
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <h2 class="text-3xl font-extrabold text-white">
            <i class="fas fa-user-edit mr-2"></i> Bilgileri Güncelle
          </h2>
        </div>

        <form @submit.prevent="updateProfile" class="p-6 space-y-8">
          <!-- Kullanıcı Bilgileri -->
          <div class="bg-gray-50 rounded-lg p-6 shadow-inner">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">
              Kullanıcı Bilgileri
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex flex-col">
                <label class="text-gray-700 font-semibold mb-2">Ad:</label>
                <input
                  v-model="doctorProfile.user.firstName"
                  class="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>
              <div class="flex flex-col">
                <label class="text-gray-700 font-semibold mb-2">Soyad:</label>
                <input
                  v-model="doctorProfile.user.lastName"
                  class="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          <!-- Profil Bilgileri -->
          <div class="bg-gray-50 rounded-lg p-6 shadow-inner">
            <h3 class="text-2xl font-bold text-gray-800 mb-4">
              Profil Bilgileri
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="flex flex-col">
                <label class="text-gray-700 font-semibold mb-2"
                  >Uzmanlık:</label
                >
                <input
                  v-model="doctorProfile.specialization"
                  class="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>
              <div class="flex flex-col">
                <label class="text-gray-700 font-semibold mb-2"
                  >Deneyim (yıl):</label
                >
                <input
                  v-model.number="doctorProfile.experience"
                  type="number"
                  class="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>
              <div class="flex flex-col">
                <label class="text-gray-700 font-semibold mb-2">Şehir:</label>
                <input
                  v-model="doctorProfile.city"
                  class="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>
              <div class="flex flex-col">
                <label class="text-gray-700 font-semibold mb-2">Telefon:</label>
                <input
                  v-model="doctorProfile.landlinePhone"
                  class="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  required
                />
              </div>
              <div class="flex flex-col col-span-2">
                <label class="text-gray-700 font-semibold mb-2">Adres:</label>
                <textarea
                  v-model="doctorProfile.fullAddress"
                  class="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  rows="3"
                  required
                ></textarea>
              </div>
            </div>

            <!-- Profil Fotoğrafı Güncelleme -->
            <div class="flex flex-col mt-4">
              <label class="text-gray-700 font-semibold mb-2"
                >Profil Fotoğrafı:</label
              >
              <input
                type="file"
                @change="handleFileChange"
                accept="image/*"
                class="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>
          </div>

          <!-- Güncelleme ve İptal Butonları -->
          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="isEditing = false"
              class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <i class="fas fa-times mr-2"></i> İptal
            </button>
            <button
              type="submit"
              class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <i class="fas fa-save mr-2"></i> Güncelle
            </button>
          </div>
        </form>
      </div>

      <!-- Erişim Hatası -->
      <div
        v-else
        class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md"
        role="alert"
      >
        <p class="font-bold">Hata</p>
        <p>{{ error || "Bu sayfaya erişim izniniz yok." }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useDoctorStore } from "@/stores/doctorStore";
import { useUserStore } from "@/stores/userStore";

export default {
  setup() {
    const doctorStore = useDoctorStore();
    const userStore = useUserStore();
    const { profile: doctorProfile } = storeToRefs(doctorStore);
    const loading = ref(true);
    const error = ref(null);
    const isEditing = ref(false);
    const selectedFile = ref(null);

    onMounted(async () => {
      if (userStore.isDoctor && userStore.user) {
        try {
          await doctorStore.getProfile();
        } catch (err) {
          console.error("Profil yüklenirken hata oluştu:", err);
          error.value =
            "Profil yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.";
        } finally {
          loading.value = false;
        }
      } else {
        error.value =
          "Bu sayfaya erişim izniniz yok veya kullanıcı bilgileri eksik.";
        loading.value = false;
      }
    });

    const handleFileChange = (event) => {
      selectedFile.value = event.target.files[0];
    };

    const updateProfile = async () => {
      try {
        loading.value = true;

        const formData = new FormData();
        formData.append("firstName", doctorProfile.value.user.firstName);
        formData.append("lastName", doctorProfile.value.user.lastName);
        formData.append("specialization", doctorProfile.value.specialization);
        formData.append("experience", doctorProfile.value.experience);
        formData.append("city", doctorProfile.value.city);
        formData.append("landlinePhone", doctorProfile.value.landlinePhone);
        formData.append("fullAddress", doctorProfile.value.fullAddress);

        if (selectedFile.value) {
          formData.append("profilePhoto", selectedFile.value);
        }

        await doctorStore.updateProfile(formData);
        alert("Profil başarıyla güncellendi");
        isEditing.value = false;
      } catch (err) {
        console.error("Profil güncellenirken hata oluştu:", err);
        error.value =
          "Profil güncellenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.";
      } finally {
        loading.value = false;
      }
    };

    return {
      userStore,
      doctorProfile,
      loading,
      error,
      isEditing,
      selectedFile,
      handleFileChange,
      updateProfile,
    };
  },
};
</script>