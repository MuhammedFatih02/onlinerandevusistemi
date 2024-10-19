<template>
  <div>
    <doctorNavbar />
    <div class="doctor-patient-list bg-white min-h-screen p-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8 animate-fade-in-down">
        <i class="fas fa-users-medical mr-2 text-blue-600"></i> Randevu Alan
        Hastalar Listesi
      </h1>

      <!-- Search Bar -->
      <div class="mb-6">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Hasta ismi ile ara"
          class="w-full p-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:outline-none"
        />
      </div>

      <!-- Loading Spinner -->
      <div
        v-if="doctorStore.loading"
        class="flex justify-center items-center h-64"
      >
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"
        ></div>
      </div>

      <!-- Error Display -->
      <div
        v-else-if="doctorStore.error"
        class="bg-red-100 border-l-4 border-red-600 text-red-600 p-4 rounded-md shadow-md"
      >
        <p class="font-semibold">Hata</p>
        <p>{{ doctorStore.error }}</p>
      </div>

      <!-- No Patients Found Message -->
      <div
        v-else-if="filteredPatients.length === 0"
        class="bg-yellow-100 border-l-4 border-yellow-600 text-yellow-700 p-4 rounded-md shadow-md"
      >
        <p class="font-semibold">Bilgi</p>
        <p>Henüz randevu alan hasta bulunmamaktadır.</p>
      </div>

      <!-- Patient List -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="patient in filteredPatients"
          :key="patient.id"
          class="patient-card bg-white shadow-md hover:shadow-lg rounded-lg transition-shadow duration-300"
        >
          <div class="bg-blue-600 text-white p-4 rounded-t-lg">
            <h2 class="text-2xl font-semibold flex items-center">
              <i class="fas fa-user-circle mr-2"></i> {{ patient.firstName }}
              {{ patient.lastName }}
            </h2>
          </div>
          <div class="p-6 text-gray-600">
            <p class="mb-3">
              <i class="fas fa-envelope text-blue-600 mr-2"></i
              >{{ patient.email }}
            </p>
            <p class="mb-3">
              <i class="fas fa-phone text-blue-600 mr-2"></i>{{ patient.phone }}
            </p>
            <p class="mb-3">
              <i class="fas fa-calendar-check text-blue-600 mr-2"></i> Toplam
              Randevu: {{ patient.appointmentCount }}
            </p>
            <p>
              <i class="fas fa-clock text-blue-600 mr-2"></i> Son Randevu:
              {{ formatDate(patient.lastAppointmentDate) }}
            </p>
          </div>
          <div
            class="bg-gray-50 p-4 flex justify-between items-center rounded-b-lg"
          >
            <button
              @click="openPatientDetails(patient)"
              class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-300"
            >
              <i class="fas fa-info-circle mr-2"></i> Detaylar
            </button>
            <button
              @click="openNewAppointment(patient)"
              class="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded transition-colors duration-300"
            >
              <i class="fas fa-calendar-plus mr-2"></i> Yeni Randevu
            </button>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div
        v-if="showAppointmentModal"
        class="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50"
      >
        <div
          class="bg-white p-8 rounded-lg shadow-lg max-w-2xl w-full animate-fade-in overflow-y-auto max-h-[90vh]"
        >
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-2xl font-semibold text-gray-800">
              Randevu Oluştur
            </h2>
            <button
              @click="closeNewAppointment"
              class="text-gray-500 hover:text-gray-700"
            >
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>

          <div v-if="debugInfo" class="bg-gray-100 p-4 mb-4 rounded">
            <p>Debug Bilgisi:</p>
            <p>Doktor ID: {{ currentDoctorId }}</p>
            <p>
              Hasta: {{ selectedPatient?.firstName }}
              {{ selectedPatient?.lastName }}
            </p>
            <p>Hasta ID: {{ selectedPatientId }}</p>
          </div>
          <Schedule
            v-if="currentDoctorId"
            :providedDoctorId="currentDoctorId"
            :patient="selectedPatient"
            :patientId="selectedPatientId"
          />
          <div v-else class="text-red-600 p-4">
            Doktor bilgileri yüklenemedi. Lütfen sayfayı yenileyin.
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from "vue";
import { useDoctorStore } from "@/stores/doctorStore";
import { storeToRefs } from "pinia";
import doctorNavbar from "@/components/doctor/doctorNavbar.vue";
import Schedule from "@/components/user/doctorDetails/Schedule.vue";

export default defineComponent({
  name: "DoctorPatientList",
  components: { doctorNavbar, Schedule },

  setup() {
    const doctorStore = useDoctorStore();
    const { appointments, profile } = storeToRefs(doctorStore);

    const patients = ref([]);
    const searchQuery = ref("");
    const selectedPatient = ref(null);
    const showAppointmentModal = ref(false);
    const currentDoctorId = ref(null);
    const debugInfo = ref(true);
    const selectedPatientId = ref(null);

    const filteredPatients = computed(() => {
      return patients.value.filter((patient) => {
        const fullName =
          `${patient.firstName} ${patient.lastName}`.toLowerCase();
        return fullName.includes(searchQuery.value.toLowerCase());
      });
    });

    const setDoctorId = () => {
      if (doctorStore.profile) {
        if (doctorStore.profile.id) {
          currentDoctorId.value = doctorStore.profile.id;
          console.log(
            "[DoctorPatientList] Doktor ID ayarlandı:",
            currentDoctorId.value
          );
        } else {
          console.error("[DoctorPatientList] Doktor ID bulunamadı");
        }
      }
    };

    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const openPatientDetails = (patient) => {
      selectedPatient.value = patient;
      console.log("[DoctorPatientList] Hasta detayları açıldı:", patient);
    };

    const closePatientDetails = () => {
      selectedPatient.value = null;
      console.log("[DoctorPatientList] Hasta detayları kapatıldı");
    };

    const openNewAppointment = async (patient) => {
      selectedPatient.value = patient;
      selectedPatientId.value = patient._id;
      console.log(
        "[DoctorPatientList] Seçilen Hasta ID:",
        selectedPatientId.value
      );
      console.log(
        "[DoctorPatientList] Seçilen Hasta Bilgileri:",
        JSON.stringify(patient, null, 2)
      );

      try {
        if (!currentDoctorId.value) {
          await doctorStore.getProfile();
          setDoctorId();
        }

        if (!currentDoctorId.value) {
          throw new Error("Doktor ID alınamadı");
        }

        console.log(
          "[DoctorPatientList] Yeni Randevu açılıyor - Doktor ID:",
          currentDoctorId.value
        );
        console.log(
          "[DoctorPatientList] Debug Bilgisi: Doktor ID:",
          currentDoctorId.value,
          "Hasta:",
          `${patient.firstName} ${patient.lastName}`,
          "Hasta ID:",
          selectedPatientId.value
        );
        showAppointmentModal.value = true;
      } catch (error) {
        console.error(
          "[DoctorPatientList] Doktor profili alınırken hata:",
          error
        );
      }
    };

    const closeNewAppointment = () => {
      selectedPatient.value = null;
      selectedPatientId.value = null;
      showAppointmentModal.value = false;
      console.log("[DoctorPatientList] Yeni randevu modalı kapatıldı");
    };

    const handleAppointmentCreated = async () => {
      console.log(
        "[DoctorPatientList] Randevu oluşturuldu, hasta listesi güncelleniyor..."
      );
      await doctorStore.fetchDoctorAppointments();
      processAppointments();
      closeNewAppointment();
    };

    const processAppointments = () => {
      const patientMap = new Map();
      appointments.value.forEach((appointment) => {
        if (appointment.patient) {
          const patientId = appointment.patient._id;
          if (!patientMap.has(patientId)) {
            patientMap.set(patientId, {
              ...appointment.patient,
              appointmentCount: 1,
              lastAppointmentDate: appointment.startTime,
            });
          } else {
            const patient = patientMap.get(patientId);
            patient.appointmentCount++;
            if (
              new Date(appointment.startTime) >
              new Date(patient.lastAppointmentDate)
            ) {
              patient.lastAppointmentDate = appointment.startTime;
            }
          }
        }
      });
      patients.value = Array.from(patientMap.values());
      console.log(
        "[DoctorPatientList] İşlenmiş hasta listesi:",
        patients.value
      );
    };

    onMounted(async () => {
      console.log("[DoctorPatientList] Component mount edildi");
      try {
        await doctorStore.getProfile();
        setDoctorId();

        if (!currentDoctorId.value) {
          throw new Error("Doktor ID alınamadı");
        }

        await doctorStore.fetchDoctorAppointments();
        processAppointments();
      } catch (error) {
        console.error("[DoctorPatientList] Veriler yüklenirken hata:", error);
      }
    });

    watch(profile, (newProfile) => {
      if (newProfile) {
        setDoctorId();
        console.log(
          "[DoctorPatientList] Doktor Profili Güncellendi:",
          newProfile
        );
      }
    });

    return {
      doctorStore,
      patients,
      searchQuery,
      selectedPatient,
      filteredPatients,
      formatDate,
      openPatientDetails,
      closePatientDetails,
      openNewAppointment,
      closeNewAppointment,
      showAppointmentModal,
      currentDoctorId,
      handleAppointmentCreated,
      debugInfo,
      selectedPatientId,
    };
  },
});
</script>
<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap");

.doctor-patient-list {
  font-family: "Inter", sans-serif;
}

.patient-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.patient-card:hover {
  transform: scale(1.02);
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-down {
  animation: fadeInDown 0.4s ease-out;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

.modal {
  font-family: "Roboto", sans-serif;
}
</style>