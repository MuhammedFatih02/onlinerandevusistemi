<template>
  <div class="favorite-doctors bg-white rounded-lg shadow-md p-6">
    <h2 class="text-2xl font-semibold text-gray-800 mb-6">
      Favori Doktorlarım
    </h2>
    <div v-if="isLoading" class="loading">
      <div class="animate-pulse flex space-x-4">
        <div class="rounded-full bg-slate-200 h-10 w-10"></div>
        <div class="flex-1 space-y-6 py-1">
          <div class="h-2 bg-slate-200 rounded"></div>
          <div class="space-y-3">
            <div class="grid grid-cols-3 gap-4">
              <div class="h-2 bg-slate-200 rounded col-span-2"></div>
              <div class="h-2 bg-slate-200 rounded col-span-1"></div>
            </div>
            <div class="h-2 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
    <div
      v-else-if="favoriteHekimler.length === 0"
      class="empty-message text-center text-gray-600 italic"
    >
      Henüz favori doktorunuz bulunmamaktadır.
    </div>
    <div
      v-else
      class="doctor-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div
        v-for="doctor in favoriteHekimler"
        :key="doctor._id"
        class="doctor-card bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      >
        <img
          :src="doctor.profilePicture || defaultProfilePicture"
          :alt="getDoctorName(doctor)"
          class="doctor-image w-full h-48 object-cover"
        />
        <div class="doctor-info p-4">
          <h3 class="text-xl font-medium text-gray-700 mb-2">
            {{ getDoctorName(doctor) }}
          </h3>
          <p class="text-gray-600 mb-2">{{ doctor.specialization }}</p>
          <p v-if="doctor.experience" class="text-gray-600 mb-2">
            Deneyim: {{ doctor.experience }} yıl
          </p>
          <p
            v-if="doctor.averageRating !== undefined"
            class="text-gray-600 mb-4"
          >
            Ortalama Puan:
            <span class="text-blue-600 font-medium">{{
              doctor.averageRating.toFixed(1)
            }}</span>
          </p>
          <button
            @click="removeFavorite(doctor._id)"
            class="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition duration-300 flex items-center justify-center"
          >
            <i class="fas fa-heart-broken mr-2"></i> Favorilerden Çıkar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useUserStore } from "@/stores/userStore.js";

export default {
  name: "FavoriteDoctors",
  setup() {
    const userStore = useUserStore();
    const isLoading = ref(false);
    const defaultProfilePicture = "/path/to/default-profile-picture.jpg";

    const favoriteHekimler = computed(() => userStore.favoriteHekimler);

    const getDoctorName = (doctor) => {
      if (doctor.user && doctor.user.firstName && doctor.user.lastName) {
        return `${doctor.user.firstName} ${doctor.user.lastName}`;
      } else if (doctor.firstName && doctor.lastName) {
        return `${doctor.firstName} ${doctor.lastName}`;
      } else {
        return "İsim Bilgisi Yok";
      }
    };

    onMounted(async () => {
      isLoading.value = true;
      try {
        await userStore.getProfile();
      } catch (error) {
        console.error("Profil bilgileri alınamadı:", error);
      } finally {
        isLoading.value = false;
      }
    });

    const removeFavorite = async (doctorId) => {
      try {
        await userStore.removeFavoriteHekim(doctorId);
      } catch (error) {
        console.error("Favori doktor çıkarılamadı:", error);
      }
    };

    return {
      isLoading,
      favoriteHekimler,
      removeFavorite,
      defaultProfilePicture,
      getDoctorName,
    };
  },
};
</script>
