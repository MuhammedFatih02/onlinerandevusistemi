<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Profil</h1>

    <UserInfoSummary v-if="isProfileLoaded" class="mb-8" />

    <div
      v-if="isProfileLoaded"
      class="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg"
    >
      <div class="flex flex-wrap">
        <button
          v-for="(tab, index) in tabs"
          :key="index"
          @click="activeTab = index"
          :class="[
            'px-6 py-3 font-medium text-sm focus:outline-none transition-all',
            activeTab === index
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="p-6">
        <component :is="tabs[activeTab].component" />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import UserInfoSummary from "@/components/user/UserInfoSummary.vue";
import EditProfile from "@/components/user/EditProfile.vue";
import MedicalHistory from "@/components/user/MedicalHistory.vue";
import FavoriteDoctors from "@/components/user/FavoriteDoctors.vue";
import AppointmentHistory from "@/components/user/AppointmentHistory.vue";
import { useUserStore } from "@/stores/userStore";

export default defineComponent({
  name: "ProfilePage",
  components: {
    UserInfoSummary,
    EditProfile,
    MedicalHistory,
    FavoriteDoctors,
    AppointmentHistory,
  },
  setup() {
    const userStore = useUserStore();
    const isProfileLoaded = ref(false);
    const activeTab = ref(0);

    const tabs = [
      { label: "Profil Düzenle", component: EditProfile },
      { label: "Tıbbi Geçmiş", component: MedicalHistory },
      { label: "Favori Hekimler", component: FavoriteDoctors },
      { label: "Randevu Geçmişi", component: AppointmentHistory },
    ];

    onMounted(async () => {
      console.log("Profil bilgisi yükleniyor...");
      await userStore.getProfile();
      isProfileLoaded.value = true;
      console.log("Profil bilgisi yüklendi:", userStore.user);
    });

    return {
      isProfileLoaded,
      activeTab,
      tabs,
    };
  },
});
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

.container {
  max-width: 1280px;
}

@media (max-width: 640px) {
  .container {
    width: 100%;
  }
}

@media (min-width: 768px) {
  .container {
    max-width: 768px;
  }
}

@media (min-width: 1024px) {
  .container {
    max-width: 1024px;
  }
}

@media (min-width: 1280px) {
  .container {
    max-width: 1280px;
  }
}
</style>