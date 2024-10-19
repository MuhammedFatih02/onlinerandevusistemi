<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-8 text-center">
      Tüm Doktorlar
    </h1>

    <div
      v-if="userStore.isLoading"
      class="flex flex-col items-center justify-center"
    >
      <div
        class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"
      ></div>
      <p class="text-gray-600">Yükleniyor...</p>
    </div>

    <div
      v-else-if="userStore.error"
      class="bg-red-100 border-l-4 border-red-600 p-4 mb-4"
    >
      <p class="text-red-600">Hata: {{ userStore.error }}</p>
    </div>

    <div
      v-else-if="userStore.doctors.length === 0"
      class="text-center text-gray-600"
    >
      <p>Henüz doktor bulunmamaktadır.</p>
    </div>

    <div
      v-else
      class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <div
        v-for="doctor in userStore.doctors"
        :key="doctor._id"
        class="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg"
      >
        <img
          :src="doctor.profileImage || defaultProfileImage"
          :alt="doctor.user.firstName + ' ' + doctor.user.lastName"
          class="w-full h-48 object-cover"
        />
        <div class="p-4">
          <h2 class="text-xl font-semibold text-gray-800 mb-2">
            {{ doctor.user.firstName }} {{ doctor.user.lastName }}
          </h2>
          <p class="text-blue-600 font-medium mb-1">{{ doctor.specialty }}</p>
          <p class="text-gray-600 mb-4">{{ doctor.experience }} yıl deneyim</p>
          <button
            @click="viewDoctorDetails(doctor._id)"
            class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors duration-300"
          >
            Detayları Görüntüle
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useUserStore } from "@/stores/userStore.js";
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "DoctorsList",
  setup() {
    const userStore = useUserStore();
    const router = useRouter();
    const defaultProfileImage = ref(
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8BPzGCWyn2cygMkNEsHf7pxzh4XCR9bsxKg&s"
    );

    onMounted(() => {
      userStore.getAllDoctors();
    });

    const viewDoctorDetails = (doctorId) => {
      router.push({ name: "DoctorDetails", params: { id: doctorId } });
    };

    return {
      userStore,
      viewDoctorDetails,
      defaultProfileImage,
    };
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500&display=swap");

h1,
h2,
h3,
h4,
h5,
h6 {
  font-family: "Inter", sans-serif;
}

body {
  font-family: "Roboto", sans-serif;
}
</style>