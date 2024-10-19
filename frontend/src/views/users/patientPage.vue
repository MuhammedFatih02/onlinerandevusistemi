<template>
  <div>
    <header />
    <div
      class="dashboard-container bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen text-gray-800 font-roboto"
    >
      <main class="container mx-auto px-6 py-12">
        <h1 class="text-3xl font-bold text-gray-900 font-inter mb-8">
          Hasta Paneli
        </h1>
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div class="lg:col-span-2 space-y-8">
            <div
              class="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl"
            >
              <UpcomingAppointments />
            </div>
            <div
              class="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl"
            >
              <PreviousDoctors />
            </div>
          </div>
          <div class="space-y-8">
            <div
              class="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl"
            >
              <FilterComponent />
            </div>
            <div
              class="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl"
            >
              <NotificationsComponent />
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>
  
  <script>
import { onMounted } from "vue";
import FilterComponent from "@/components/user/SearchComponent.vue";
import NotificationsComponent from "@/components/user/patientpage/NotificationsComponent.vue";
import UpcomingAppointments from "@/components/user/patientpage/UpcomingAppointments.vue";
import PreviousDoctors from "@/components/user/patientpage/PreviousDoctors.vue";
import header from "@/components/user/header.vue";
import { useUserStore } from "@/stores/userStore";
import { useAppointmentStore } from "@/stores/appointmentStore";

export default {
  name: "DashboardLayout",
  components: {
    FilterComponent,
    NotificationsComponent,
    UpcomingAppointments,
    PreviousDoctors,
    header,
  },
  setup() {
    const userStore = useUserStore();
    const appointmentStore = useAppointmentStore();

    onMounted(async () => {
      await userStore.initializeStore();
      await appointmentStore.fetchAppointments();
    });
  },
};
</script>
  
  <style scoped>
.btn-primary {
  @apply bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-all duration-300 ease-in-out hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-opacity-50;
}

.select {
  @apply border border-gray-300 rounded-lg py-2 px-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 ease-in-out;
}
</style>