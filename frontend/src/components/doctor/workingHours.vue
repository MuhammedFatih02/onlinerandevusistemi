<template>
  <div>
    <doctorNavbar />
    <div
      class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 font-sans"
    >
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Başlık -->
        <div
          class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-lg shadow-lg mb-6 flex items-center justify-between"
        >
          <h2 class="text-3xl font-extrabold text-white">
            <i class="fas fa-calendar-check mr-2"></i>
            Çalışma Saatlerini ve Özel Müsaitlikleri Yönet
          </h2>
          <i class="fas fa-user-md text-white text-2xl"></i>
        </div>

        <!-- Çalışma Saatleri -->
        <div
          class="bg-white shadow-2xl rounded-lg p-6 mb-8 transition-transform duration-300 ease-in-out transform hover:scale-105"
        >
          <h3 class="text-2xl font-bold text-gray-800 mb-4">
            <i class="fas fa-clock text-blue-500"></i> Çalışma Saatleri
          </h3>
          <div
            v-if="doctorProfile && workingHours"
            class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            <div
              v-for="(hours, day) in workingDays"
              :key="day"
              class="bg-gray-50 p-4 rounded-md shadow-lg hover:shadow-xl transition duration-300"
            >
              <span class="font-semibold text-gray-700 block capitalize">
                <i class="fas fa-calendar-day mr-1 text-blue-400"></i>
                {{ day }}:
              </span>
              <span v-if="hours" class="text-gray-900">{{ hours }}</span>
              <span v-else class="text-gray-500">Çalışma yok</span>
              <button
                @click="toggleEdit(day)"
                class="text-blue-600 hover:text-blue-800 mt-2 flex items-center"
              >
                <i class="fas fa-edit mr-1"></i> Güncelle
              </button>

              <!-- Güncelleme Formu -->
              <div v-if="editDay === day" class="mt-2">
                <input
                  v-model="workingHours[day]"
                  type="text"
                  placeholder="09:00-17:00"
                  class="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <button
                  @click="updateWorkingHours(day)"
                  class="mt-2 bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600 transition duration-300"
                >
                  <i class="fas fa-save mr-1"></i> Kaydet
                </button>
              </div>
            </div>
          </div>
          <div v-else>
            <p class="text-gray-500 animate-pulse">
              <i class="fas fa-spinner fa-spin"></i> Çalışma saatleri
              yükleniyor...
            </p>
          </div>
        </div>

        <!-- Özel Müsaitlik Ekleme -->
        <div
          class="bg-white shadow-2xl rounded-lg p-6 mb-8 transition-transform duration-300 ease-in-out transform hover:scale-105"
        >
          <h3 class="text-2xl font-bold text-gray-800 mb-4">
            <i class="fas fa-calendar-plus text-green-500"></i> Özel Müsaitlik
            Ekle
          </h3>
          <form @submit.prevent="addAvailability" class="space-y-4">
            <div class="flex flex-col space-y-2">
              <label class="text-gray-700 font-semibold">Tarih:</label>
              <input
                type="date"
                v-model="newAvailability.date"
                class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col space-y-2">
                <label class="text-gray-700 font-semibold"
                  >Başlangıç Saati:</label
                >
                <input
                  type="time"
                  v-model="newAvailability.startTime"
                  class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div class="flex flex-col space-y-2">
                <label class="text-gray-700 font-semibold">Bitiş Saati:</label>
                <input
                  type="time"
                  v-model="newAvailability.endTime"
                  class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div class="flex flex-col space-y-2">
              <label class="text-gray-700 font-semibold"
                >Müsaitlik Durumu:</label
              >
              <select
                v-model="newAvailability.isAvailable"
                class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                required
              >
                <option :value="true">Müsait</option>
                <option :value="false">Müsait Değil</option>
              </select>
            </div>

            <div class="flex flex-col space-y-2">
              <label class="text-gray-700 font-semibold"
                >Sebep (Opsiyonel):</label
              >
              <textarea
                v-model="newAvailability.reason"
                class="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <button
              type="submit"
              class="w-full bg-blue-600 text-white py-2 rounded-md shadow-md hover:bg-blue-700 transition duration-300"
            >
              <i class="fas fa-plus mr-1"></i> Özel Müsaitlik Ekle
            </button>
          </form>
        </div>

        <!-- Özel Müsaitlik Listesi -->
        <div class="bg-white shadow-2xl rounded-lg p-6">
          <h3 class="text-2xl font-bold text-gray-800 mb-4">
            <i class="fas fa-calendar-check text-purple-500"></i> Özel
            Müsaitlikler
          </h3>
          <ul
            v-if="appointmentStore.specialAvailabilities.length > 0"
            class="space-y-4"
          >
            <li
              v-for="availability in appointmentStore.specialAvailabilities"
              :key="availability._id"
              class="p-4 bg-gray-50 shadow-md rounded-lg"
            >
              <p><strong>Tarih:</strong> {{ formatDate(availability.date) }}</p>
              <p v-if="availability.startTime && availability.endTime">
                <strong>Saat Aralığı:</strong> {{ availability.startTime }} -
                {{ availability.endTime }}
              </p>
              <p>
                <strong>Durum:</strong>
                {{ availability.isAvailable ? "Müsait" : "Müsait Değil" }}
              </p>
              <p v-if="availability.reason">
                <strong>Sebep:</strong> {{ availability.reason }}
              </p>
            </li>
          </ul>
          <p v-else>Henüz özel müsaitlik bulunmuyor.</p>
        </div>
      </div>
    </div>
  </div>
</template>
  
  <script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useDoctorStore } from "@/stores/doctorStore";
import { useAppointmentStore } from "@/stores/appointmentStore";
import { useUserStore } from "@/stores/userStore";
import doctorNavbar from "@/components/doctor/doctorNavbar.vue";
import { storeToRefs } from "pinia";
const doctorStore = useDoctorStore();
const appointmentStore = useAppointmentStore();
const userStore = useUserStore();
const { profile: doctorProfile } = storeToRefs(doctorStore);
const { loading, error } = storeToRefs(appointmentStore);

const newAvailability = ref({
  date: "",
  startTime: "",
  endTime: "",
  isAvailable: true,
  reason: "",
});

const workingHours = ref(null);
const editDay = ref(null);

// Çalışma saatlerini ve özel müsaitlikleri yükle
onMounted(async () => {
  loading.value = true;
  try {
    if (userStore.isDoctor) {
      await doctorStore.getProfile();
      workingHours.value = doctorProfile.value
        ? { ...doctorProfile.value.workingHours }
        : {}; // Çalışma saatlerini ayarla
      appointmentStore.fetchSpecialAvailabilities(); // Özel müsaitlikleri yükle
      loading.value = false;
    }
  } catch (error) {
    console.error("Veriler alınırken hata:", error);
    loading.value = false;
  }
});

// Sadece çalışma günlerini filtrele
const workingDays = computed(() =>
  workingHours.value
    ? Object.fromEntries(
        Object.entries(workingHours.value).filter(([day, hours]) => hours)
      )
    : []
);

// Çalışma saatlerini güncelle
const toggleEdit = (day) => {
  editDay.value = editDay.value === day ? null : day;
};

const updateWorkingHours = async (day) => {
  try {
    await doctorStore.updateWorkingHours({ ...workingHours.value });
    alert("Çalışma saatleri başarıyla güncellendi.");
    editDay.value = null;
  } catch (error) {
    console.error("Çalışma saatleri güncellenirken hata:", error);
  }
};

// Özel müsaitlik ekleme işlemi
const addAvailability = async () => {
  try {
    await appointmentStore.addSpecialAvailability(newAvailability.value);
    alert("Özel müsaitlik başarıyla eklendi.");
    newAvailability.value = {
      date: "",
      startTime: "",
      endTime: "",
      isAvailable: true,
      reason: "",
    };
  } catch (error) {
    console.error("Özel müsaitlik eklenirken hata:", error);
  }
};

// Tarih formatı
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Özel müsaitlik değişikliklerini izleyin
watch(
  () => appointmentStore.specialAvailabilities,
  (newValue) => {
    console.log("Special availabilities updated:", newValue);
  },
  { deep: true }
);
</script>
  
