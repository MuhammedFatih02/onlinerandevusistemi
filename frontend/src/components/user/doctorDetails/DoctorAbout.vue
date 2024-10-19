<template>
  <div
    class="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow duration-300"
  >
    <h2 class="text-2xl font-semibold text-gray-800 mb-4">
      <i class="fas fa-user-md mr-2 text-blue-600"></i>Hakkında
    </h2>
    <div v-if="profile" class="space-y-4">
      <p class="flex items-center text-gray-700">
        <i class="fas fa-user mr-3 text-blue-500"></i>
        <span class="font-medium">Ad Soyad:</span>
        <span class="ml-2">{{ fullName }}</span>
      </p>
      <p class="flex items-center text-gray-700">
        <i class="fas fa-stethoscope mr-3 text-blue-500"></i>
        <span class="font-medium">Uzmanlık:</span>
        <span class="ml-2">{{ profile.specialization }}</span>
      </p>
      <div
        v-if="profile.education && profile.education.length > 0"
        class="text-gray-700"
      >
        <p class="flex items-center font-medium mb-2">
          <i class="fas fa-graduation-cap mr-3 text-blue-500"></i>
          Eğitim:
        </p>
        <ul class="list-disc list-inside ml-6 space-y-1">
          <li
            v-for="(edu, index) in profile.education"
            :key="index"
            class="hover:text-blue-600 transition-colors duration-200"
          >
            {{ edu }}
          </li>
        </ul>
      </div>
    </div>
    <p v-else class="text-gray-600 italic animate-pulse">
      <i class="fas fa-spinner fa-spin mr-2"></i>Profil yükleniyor...
    </p>
  </div>
</template>

<script>
import { defineComponent, computed } from "vue";
import { useDoctorStore } from "@/stores/doctorStore";

export default defineComponent({
  name: "DoctorAbout",

  setup() {
    const doctorStore = useDoctorStore();

    doctorStore.getProfile();

    const profile = computed(() => doctorStore.profile);
    const fullName = computed(() => {
      if (profile.value && profile.value.user) {
        return `${profile.value.user.firstName} ${profile.value.user.lastName}`;
      }
      return "İsim bilgisi yok";
    });

    return {
      profile,
      fullName,
    };
  },
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap");

div {
  font-family: "Roboto", sans-serif;
}

h2 {
  font-family: "Inter", sans-serif;
}
</style>