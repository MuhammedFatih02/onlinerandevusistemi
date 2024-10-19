<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-2xl font-semibold text-gray-800 mb-6">
      <i class="fas fa-history mr-2 text-blue-600"></i>Randevu Geçmişi
    </h3>
    <div v-if="loading" class="text-center py-4">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"
      ></div>
    </div>
    <div v-else-if="error" class="text-red-600 text-center py-4">
      <i class="fas fa-exclamation-circle mr-2"></i>{{ error }}
    </div>
    <div v-else>
      <div class="mb-4 flex flex-col sm:flex-row justify-between items-center">
        <div class="flex space-x-2 mb-2 sm:mb-0">
          <button
            @click="currentPage = 1"
            :disabled="currentPage === 1"
            class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition duration-300"
          >
            <i class="fas fa-angle-double-left"></i>
          </button>
          <button
            @click="currentPage--"
            :disabled="currentPage === 1"
            class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition duration-300"
          >
            <i class="fas fa-angle-left"></i>
          </button>
          <span class="px-3 py-1 bg-gray-100 rounded border border-gray-300"
            >Sayfa {{ currentPage }} / {{ totalPages }}</span
          >
          <button
            @click="currentPage++"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition duration-300"
          >
            <i class="fas fa-angle-right"></i>
          </button>
          <button
            @click="currentPage = totalPages"
            :disabled="currentPage === totalPages"
            class="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition duration-300"
          >
            <i class="fas fa-angle-double-right"></i>
          </button>
        </div>
        <select
          v-model="pageSize"
          class="px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300"
        >
          <option :value="5">5 / sayfa</option>
          <option :value="10">10 / sayfa</option>
          <option :value="20">20 / sayfa</option>
        </select>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in tableHeaders"
                :key="header.key"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {{ header.label }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="appointment in paginatedAppointments"
              :key="appointment._id"
              class="hover:bg-gray-50 transition-colors duration-200"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(appointment.startTime) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatTime(appointment.startTime) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <i class="fas fa-user-md mr-2 text-blue-500"></i>
                {{ getDoctorName(appointment.doctorId) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="getStatusClass(appointment.status)"
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  <i
                    :class="getStatusIcon(appointment.status)"
                    class="mr-1"
                  ></i>
                  {{ appointment.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  v-if="canCancel(appointment)"
                  @click="cancelAppointment(appointment._id)"
                  class="text-red-600 hover:text-red-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-md px-2 py-1"
                >
                  <i class="fas fa-times-circle mr-1"></i>İptal Et
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { useAppointmentStore } from "@/stores/appointmentStore";
import { useDoctorStore } from "@/stores/doctorStore";
import { storeToRefs } from "pinia";

export default {
  name: "AppointmentHistory",
  setup() {
    const appointmentStore = useAppointmentStore();
    const doctorStore = useDoctorStore();
    const { appointments, loading, error } = storeToRefs(appointmentStore);

    const currentPage = ref(1);
    const pageSize = ref(10);

    const tableHeaders = [
      { key: "date", label: "Tarih" },
      { key: "time", label: "Saat" },
      { key: "doctor", label: "Doktor" },
      { key: "status", label: "Durum" },
      { key: "action", label: "İşlem" },
    ];

    const totalPages = computed(() =>
      Math.ceil(appointments.value.length / pageSize.value)
    );

    const paginatedAppointments = computed(() => {
      const start = (currentPage.value - 1) * pageSize.value;
      const end = start + pageSize.value;
      return appointments.value.slice(start, end);
    });

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const formatTime = (dateString) => {
      return new Date(dateString).toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const getStatusClass = (status) => {
      switch (status) {
        case "Onaylandı":
          return "bg-green-100 text-green-800";
        case "Beklemede":
          return "bg-yellow-100 text-yellow-800";
        case "İptal Edildi":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    const getStatusIcon = (status) => {
      switch (status) {
        case "Onaylandı":
          return "fas fa-check-circle";
        case "Beklemede":
          return "fas fa-clock";
        case "İptal Edildi":
          return "fas fa-ban";
        default:
          return "fas fa-question-circle";
      }
    };

    const canCancel = (appointment) => {
      return (
        appointment.status === "Onaylandı" || appointment.status === "Beklemede"
      );
    };

    const cancelAppointment = async (appointmentId) => {
      try {
        await appointmentStore.cancelAppointment(
          appointmentId,
          "Kullanıcı tarafından iptal edildi"
        );
      } catch (error) {
        console.error("Randevu iptal edilirken hata oluştu:", error);
      }
    };

    const getDoctorName = (doctorId) => {
      return doctorStore.getDoctorName(doctorId);
    };

    onMounted(async () => {
      await Promise.all([
        appointmentStore.fetchAppointments(),
        doctorStore.fetchAllDoctors(),
      ]);
    });

    return {
      appointments,
      loading,
      error,
      tableHeaders,
      formatDate,
      formatTime,
      getStatusClass,
      getStatusIcon,
      canCancel,
      cancelAppointment,
      getDoctorName,
      currentPage,
      pageSize,
      totalPages,
      paginatedAppointments,
    };
  },
};
</script>