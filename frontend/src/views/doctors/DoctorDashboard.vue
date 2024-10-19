<template>
  <div class="container mx-auto p-6 bg-gray-50">
    <h1 class="text-4xl font-bold mb-6 text-gray-800">Doktor Kontrol Paneli</h1>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Profil Kartı -->
      <div
        class="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500 transition duration-300 ease-in-out hover:shadow-xl"
      >
        <div class="flex items-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-8 w-8 text-blue-500 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <h2 class="text-xl font-semibold text-gray-700">Profil</h2>
        </div>
        <p class="text-2xl font-bold mb-2 text-gray-800">{{ doctorName }}</p>
        <router-link
          to="/doctor/profile"
          class="text-blue-600 hover:text-blue-800 transition duration-300"
          >Profili Düzenle</router-link
        >
      </div>

      <!-- Bugünkü Randevular Kartı -->
      <div
        class="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500 transition duration-300 ease-in-out hover:shadow-xl"
      >
        <div class="flex items-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-8 w-8 text-green-500 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h2 class="text-xl font-semibold text-gray-700">
            Bugünkü Randevular
          </h2>
        </div>
        <p class="text-4xl font-bold mb-2 text-gray-800">
          {{ todayAppointments }}
        </p>
        <router-link
          to="/doctor/appointments"
          class="text-green-600 hover:text-green-800 transition duration-300"
          >Tüm Randevuları Gör</router-link
        >
      </div>

      <!-- Toplam Hasta Sayısı Kartı -->
      <div
        class="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-500 transition duration-300 ease-in-out hover:shadow-xl"
      >
        <div class="flex items-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-8 w-8 text-yellow-500 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h2 class="text-xl font-semibold text-gray-700">
            Toplam Hasta Sayısı
          </h2>
        </div>
        <p class="text-4xl font-bold mb-2 text-gray-800">{{ totalPatients }}</p>
        <router-link
          to="/doctor/patients"
          class="text-yellow-600 hover:text-yellow-800 transition duration-300"
          >Hasta Listesini Gör</router-link
        >
      </div>

      <!-- Sunulan Hizmetler Kartı -->
      <div
        class="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-500 transition duration-300 ease-in-out hover:shadow-xl"
      >
        <div class="flex items-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-8 w-8 text-purple-500 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          <h2 class="text-xl font-semibold text-gray-700">Sunulan Hizmetler</h2>
        </div>
        <p class="text-4xl font-bold mb-2 text-gray-800">{{ totalServices }}</p>
        <router-link
          to="/doctor/services"
          class="text-purple-600 hover:text-purple-800 transition duration-300"
          >Hizmetleri Yönet</router-link
        >
      </div>

      <!-- Çalışma Saatleri Kartı -->
      <div
        class="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500 transition duration-300 ease-in-out hover:shadow-xl"
      >
        <div class="flex items-center mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-8 w-8 text-red-500 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h2 class="text-xl font-semibold text-gray-700">Çalışma Saatleri</h2>
        </div>
        <p class="text-4xl font-bold mb-2 text-gray-800">Görüntüle</p>
        <router-link
          to="/doctor/working-hours"
          class="text-red-600 hover:text-red-800 transition duration-300"
          >Çalışma Saatlerini Yönet</router-link
        >
      </div>
    </div>

    <!-- Gelecek Randevular Tablosu -->
    <div class="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
      <h2 class="text-2xl font-bold p-6 bg-gray-100 text-gray-800">
        Gelecek Randevular
      </h2>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-200">
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
              >
                Hasta
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
              >
                Tarih
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
              >
                Saat
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
              >
                İşlem
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="appointment in upcomingAppointments"
              :key="appointment._id"
              class="border-b hover:bg-gray-50"
            >
              <td class="px-6 py-4 whitespace-nowrap text-gray-700">
                {{ appointment.patient.firstName }}
                {{ appointment.patient.lastName }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-700">
                {{ formatDate(appointment.startTime) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-700">
                {{ formatTime(appointment.startTime) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-gray-700">
                {{ appointment.service.name }}
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
import { useUserStore } from "@/stores/userStore";
import { useDoctorStore } from "@/stores/doctorStore";
import { DateTime } from "luxon";

export default {
  name: "DoctorDashboard",
  setup() {
    const userStore = useUserStore();
    const doctorStore = useDoctorStore();

    const doctorName = computed(() => userStore.fullName);
    const todayAppointments = ref(0);
    const totalPatients = ref(0);
    const totalServices = ref(0);
    const upcomingAppointments = ref([]);

    const fetchData = async () => {
      try {
        await Promise.all([
          userStore.getProfile(),
          doctorStore.fetchAppointments(),
          doctorStore.getProfile(),
        ]);

        const today = DateTime.now().startOf("day");
        const allAppointments = doctorStore.appointments;

        // Bugünkü randevuları hesapla
        todayAppointments.value = allAppointments.filter((appointment) => {
          const appointmentDate = DateTime.fromISO(appointment.startTime);
          return (
            appointmentDate >= today &&
            appointmentDate < today.plus({ days: 1 })
          );
        }).length;

        // Toplam hasta sayısını hesapla (benzersiz hasta sayısı)
        const uniquePatients = new Set(
          allAppointments.map((appointment) => appointment.patientId)
        );
        totalPatients.value = uniquePatients.size;

        // Toplam hizmet sayısını al
        totalServices.value = doctorStore.profile?.services?.length || 0;

        // Gelecek 5 randevuyu al
        upcomingAppointments.value = allAppointments
          .filter(
            (appointment) => DateTime.fromISO(appointment.startTime) > today
          )
          .sort(
            (a, b) =>
              DateTime.fromISO(a.startTime) - DateTime.fromISO(b.startTime)
          )
          .slice(0, 5);
      } catch (error) {
        console.error("Veri yüklenirken hata oluştu:", error);
      }
    };

    onMounted(fetchData);

    const formatDate = (dateString) => {
      return DateTime.fromISO(dateString).toFormat("dd.MM.yyyy");
    };

    const formatTime = (dateString) => {
      return DateTime.fromISO(dateString).toFormat("HH:mm");
    };

    return {
      doctorName,
      todayAppointments,
      totalPatients,
      totalServices,
      upcomingAppointments,
      formatDate,
      formatTime,
    };
  },
};
</script>
