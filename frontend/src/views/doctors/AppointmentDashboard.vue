<template>
  <div>
    <doctorNavbar class="mb-5" />

    <div class="min-h-screen bg-gray-100 py-10">
      <div
        class="container mx-auto p-6 bg-white shadow-xl rounded-lg max-w-7xl"
      >
        <div v-if="loading" class="text-center text-blue-600">
          <i class="fas fa-spinner fa-spin fa-3x"></i>
          <p class="mt-2 text-lg font-semibold">Randevular Yükleniyor...</p>
        </div>

        <div v-else>
          <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">
            <i class="fas fa-calendar-check text-blue-500 mr-2"></i>
            Randevularım
          </h2>

          <!-- Calendar Component -->
          <Calendar :appointments="filteredAppointments" />

          <!-- Search and Filter Component -->
          <SearchFilter
            :search-term="searchTerm"
            :filter-status="filterStatus"
            @update-search="updateSearchTerm"
            @update-status="updateFilterStatus"
            class="mt-5"
          />

          <!-- Appointment List Component -->
          <AppointmentList
            :appointments="filteredAppointments"
            @update-status="updateStatus"
          />
        </div>
      </div>
    </div>
  </div>
</template>
  
  <script>
import { ref, computed, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useDoctorStore } from "@/stores/doctorStore";
import SearchFilter from "@/components/doctor/appointments/SearchFilter.vue";
import Calendar from "@/components/doctor/appointments/Calendar.vue";
import AppointmentList from "@/components/doctor/appointments/AppointmentList.vue";
import doctorNavbar from "@/components/doctor/doctorNavbar.vue";

export default {
  components: {
    SearchFilter,
    Calendar,
    AppointmentList,
    doctorNavbar,
  },
  setup() {
    const doctorStore = useDoctorStore();
    const { appointments } = storeToRefs(doctorStore);
    const loading = ref(true);
    const searchTerm = ref("");
    const filterStatus = ref("");

    // onMounted içinde verilerin eksiksiz yüklendiğini kontrol ediyoruz
    onMounted(async () => {
      try {
        await doctorStore.fetchAppointments();
      } catch (err) {
        console.error("Randevular alınırken hata oluştu:", err);
      } finally {
        loading.value = false;
      }
    });

    const updateStatus = async (appointmentId, status) => {
      try {
        await doctorStore.updateAppointmentStatus(appointmentId, status);
        alert("Randevu durumu başarıyla güncellendi!");
      } catch (err) {
        console.error("Randevu durumu güncellenirken hata oluştu:", err);
        alert("Randevu durumu güncellenirken bir hata oluştu.");
      }
    };

    const updateSearchTerm = (newSearchTerm) => {
      searchTerm.value = newSearchTerm;
    };

    const updateFilterStatus = (newFilterStatus) => {
      filterStatus.value = newFilterStatus;
    };

    const filteredAppointments = computed(() => {
      if (appointments.value.length === 0) return [];

      return appointments.value.filter((appointment) => {
        const patientName =
          `${appointment.patient.firstName} ${appointment.patient.lastName}`.toLowerCase();
        const matchesSearch = patientName.includes(
          searchTerm.value.toLowerCase()
        );
        const matchesStatus =
          filterStatus.value === "" ||
          appointment.status === filterStatus.value;
        return matchesSearch && matchesStatus;
      });
    });

    return {
      loading,
      updateStatus,
      updateSearchTerm,
      updateFilterStatus,
      filteredAppointments,
      searchTerm,
      filterStatus,
    };
  },
};
</script>
  