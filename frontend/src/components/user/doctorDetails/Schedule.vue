<template>
  <div
    class="appointment-scheduler bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto"
  >
    <h2 class="text-2xl font-semibold text-gray-800 mb-6">
      <i class="fas fa-calendar-alt mr-2 text-blue-600"></i>Randevu Planlayıcı
    </h2>

    <!-- Hizmet seçimi -->
    <div class="mb-6">
      <label for="service" class="block text-sm font-medium text-gray-700 mb-2"
        >Hizmet Seçin</label
      >
      <div class="relative">
        <select
          id="service"
          v-model="selectedServiceId"
          @change="logServiceSelection"
          class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md transition-all duration-200"
        >
          <option value="">Hizmet seçin</option>
          <option
            v-for="service in activeServices"
            :key="service._id"
            :value="service._id"
          >
            {{ service.name }}
          </option>
        </select>
        <div
          class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none"
        >
          <i class="fas fa-chevron-down text-gray-400"></i>
        </div>
      </div>
    </div>

    <!-- Gün seçimi -->
    <div v-if="selectedServiceId" class="mb-6">
      <h3 class="text-xl font-medium text-gray-700 mb-2">Tarih Seçin</h3>
      <div v-if="availableDays.length > 0" class="grid grid-cols-4 gap-2">
        <button
          v-for="day in availableDays"
          :key="day.date"
          @click="selectDate(day.date)"
          :class="{
            'bg-blue-600 text-white': selectedDate === day.date,
            'bg-gray-100 text-gray-700 hover:bg-gray-200':
              selectedDate !== day.date,
          }"
          class="p-2 rounded-md text-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <span class="block text-xs">{{ formatDateDay(day.date) }}</span>
          <span class="block text-lg font-semibold">{{
            formatDateNumber(day.date)
          }}</span>
        </button>
      </div>
      <p v-else class="text-red-600">
        <i class="fas fa-exclamation-circle mr-1"></i>Müsait gün
        bulunmamaktadır.
      </p>
    </div>

    <!-- Saat seçimi -->
    <div v-if="selectedDate" class="mb-6">
      <h3 class="text-xl font-medium text-gray-700 mb-2">
        <i class="far fa-clock mr-2 text-blue-600"></i
        >{{ formatDate(selectedDate) }} için müsait saatler:
      </h3>
      <div v-if="selectedDateSlots.length > 0" class="grid grid-cols-3 gap-2">
        <button
          v-for="slot in selectedDateSlots"
          :key="`${slot.start}-${slot.end}`"
          @click="selectTimeSlot(slot)"
          :class="{
            'bg-blue-600 text-white': isSelectedTimeSlot(slot),
            'bg-gray-100 text-gray-700 hover:bg-gray-200':
              slot.status === 'available' && !isSelectedTimeSlot(slot),
            'bg-gray-200 text-gray-400 cursor-not-allowed':
              slot.status !== 'available',
          }"
          :disabled="slot.status !== 'available'"
          class="p-2 rounded-md text-center transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {{ formatTime(slot.start) }} - {{ formatTime(slot.end) }}
        </button>
      </div>
      <p v-else class="text-amber-600">
        <i class="fas fa-exclamation-triangle mr-1"></i>Bu tarih için müsait
        saat bulunmamaktadır.
      </p>
    </div>

    <!-- Seçilen randevu bilgisi -->
    <div
      v-if="selectedDate && selectedTimeSlot && selectedServiceId"
      class="bg-emerald-50 border border-emerald-200 rounded-md p-4 mb-6 animate-pulse"
    >
      <h4 class="text-lg font-semibold text-emerald-800 mb-2">
        <i class="far fa-calendar-check mr-2"></i>Seçilen Randevu:
      </h4>
      <p class="text-emerald-700">
        <span class="font-medium">Tarih:</span> {{ formatDate(selectedDate)
        }}<br />
        <span class="font-medium">Saat:</span>
        {{ formatTime(selectedTimeSlot.start) }} -
        {{ formatTime(selectedTimeSlot.end) }}<br />
        <span class="font-medium">Hizmet:</span> {{ getSelectedServiceName }}
      </p>
    </div>

    <!-- Randevu oluşturma butonu -->
    <button
      @click="createAppointment"
      :disabled="!canCreateAppointment"
      :class="{
        'bg-blue-600 hover:bg-blue-700': canCreateAppointment,
        'bg-gray-300 cursor-not-allowed': !canCreateAppointment,
      }"
      class="w-full text-white font-bold py-2 px-4 rounded-md transition-all duration-200 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <i class="fas fa-calendar-plus mr-2"></i>
      Randevuyu Oluştur
    </button>

    <!-- Hata mesajı -->
    <div
      v-if="error"
      class="mt-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-md animate-pulse"
      role="alert"
    >
      <p class="font-bold">Hata</p>
      <p>{{ error }}</p>
    </div>

    <!-- Bilgi mesajı -->
    <div
      v-if="infoMessage"
      class="mt-4 bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-md animate-pulse"
      role="alert"
    >
      <p class="font-bold">Bilgi</p>
      <p>{{ infoMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onBeforeUnmount } from "vue";
import { useDoctorStore } from "@/stores/doctorStore";
import { useServiceStore } from "@/stores/serviceStore";
import { useAppointmentStore } from "@/stores/appointmentStore";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { DateTime } from "luxon";
import io from "socket.io-client";

// Socket.io bağlantısı
const socket = io("http://localhost:3000");

// Props
const props = defineProps({
  providedDoctorId: {
    type: String,
    default: null,
  },
  patient: {
    type: Object,
    default: () => ({}),
  },
  patientId: {
    type: String,
    default: null,
  },
});

// Store ve route setup
const route = useRoute();
const doctorStore = useDoctorStore();
const serviceStore = useServiceStore();
const appointmentStore = useAppointmentStore();

// Reactive references
const selectedDate = ref(null);
const selectedTimeSlot = ref(null);
const selectedServiceId = ref("");
const error = ref(null);
const infoMessage = ref(null);
const propsPatientId = ref(props.patientId);

// Computed properties
const doctorId = computed(() => {
  return props.providedDoctorId || route.params.id;
});

const { availability } = storeToRefs(doctorStore);
const { services } = storeToRefs(serviceStore);

const activeServices = computed(() => {
  return serviceStore.getActiveServices;
});

const availableDays = computed(() => {
  const today = DateTime.now().startOf("day");
  return availability.value.filter((day) => {
    const dayDate = DateTime.fromISO(day.date);
    return (
      dayDate >= today && day.slots.some((slot) => slot.status === "available")
    );
  });
});

const selectedDateSlots = computed(() => {
  if (!selectedDate.value) return [];
  const selected = availability.value.find(
    (day) => day.date === selectedDate.value
  );
  return selected ? selected.slots : [];
});

const getSelectedServiceName = computed(() => {
  const selectedService = activeServices.value.find(
    (service) => service._id === selectedServiceId.value
  );
  return selectedService ? selectedService.name : "";
});

const canCreateAppointment = computed(() => {
  const canCreate =
    selectedDate.value &&
    selectedTimeSlot.value &&
    selectedServiceId.value &&
    selectedTimeSlot.value.status === "available";
  return canCreate;
});

// Methods
const selectDate = (date) => {
  selectedDate.value = date;
  selectedTimeSlot.value = null;
  error.value = null;
  infoMessage.value = null;
};

const selectTimeSlot = (slot) => {
  selectedTimeSlot.value = slot;
  error.value = null;
  infoMessage.value = null;
};

const isSelectedTimeSlot = (slot) => {
  return (
    selectedTimeSlot.value &&
    selectedTimeSlot.value.start === slot.start &&
    selectedTimeSlot.value.end === slot.end
  );
};

const formatDate = (dateString) => {
  return DateTime.fromISO(dateString).toLocaleString(DateTime.DATE_FULL);
};

const formatDateDay = (dateString) => {
  return DateTime.fromISO(dateString).toLocaleString({ weekday: "short" });
};

const formatDateNumber = (dateString) => {
  return DateTime.fromISO(dateString).toLocaleString({ day: "numeric" });
};

const formatTime = (timeString) => {
  return DateTime.fromFormat(timeString, "HH:mm").toLocaleString(
    DateTime.TIME_SIMPLE
  );
};

const fetchAvailability = async () => {
  try {
    if (!doctorId.value) {
      throw new Error("Doctor ID is not provided");
    }
    await doctorStore.fetchProfile(doctorId.value);
    await doctorStore.getAvailability(doctorId.value);

    if (
      !Array.isArray(doctorStore.availability) ||
      doctorStore.availability.length === 0
    ) {
      error.value =
        "Müsaitlik verisi bulunamadı. Lütfen daha sonra tekrar deneyin.";
    }
  } catch (err) {
    error.value =
      "Müsaitlik bilgisi alınamadı. Lütfen daha sonra tekrar deneyin.";
  }
};

const createAppointment = async () => {
  if (
    !selectedDate.value ||
    !selectedTimeSlot.value ||
    !selectedServiceId.value
  ) {
    error.value = "Lütfen tarih, saat ve hizmet seçin.";
    return;
  }

  const selectedDateObj = new Date(selectedDate.value);
  const { start: startTime, end: endTime } = selectedTimeSlot.value;

  const appointmentData = {
    doctorId: doctorId.value,
    serviceId: selectedServiceId.value,
    startTime: new Date(
      `${selectedDateObj.toDateString()} ${startTime}`
    ).toISOString(),
    endTime: new Date(
      `${selectedDateObj.toDateString()} ${endTime}`
    ).toISOString(),
    patientId: propsPatientId.value || (props.patient && props.patient._id),
  };

  try {
    await appointmentStore.createAppointment(appointmentData);
    infoMessage.value = "Randevu başarıyla oluşturuldu!";
    await fetchAvailability();
    selectedDate.value = null;
    selectedTimeSlot.value = null;
    selectedServiceId.value = "";

    setTimeout(() => {
      infoMessage.value = null;
    }, 5000);
  } catch (err) {
    error.value = "Randevu oluşturulurken bir hata oluştu: " + err.message;
  }
};

// Socket event listeners
const setupSocketListeners = () => {
  socket.on("availabilityUpdated", ({ doctorId, availability }) => {
    if (doctorId === doctorId.value) {
      doctorStore.availability = availability;
    }
  });

  socket.on("appointmentCreated", (newAppointment) => {
    fetchAvailability();
  });

  socket.on("appointmentUpdated", (updatedAppointment) => {
    fetchAvailability();
  });

  socket.on("appointmentCancelled", (cancelledAppointment) => {
    fetchAvailability();
  });
};

// Lifecycle hooks
onMounted(async () => {
  try {
    await fetchAvailability();
    await serviceStore.fetchServices();
    setupSocketListeners();
    doctorStore.setupSocketListeners(); // doctorStore'daki socket dinleyicilerini kur
    appointmentStore.setupSocketListeners(); // appointmentStore'daki socket dinleyicilerini kur
  } catch (error) {
    error.value =
      "Veriler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.";
  }
});

onBeforeUnmount(() => {
  socket.off("availabilityUpdated");
  socket.off("appointmentCreated");
  socket.off("appointmentUpdated");
  socket.off("appointmentCancelled");
  doctorStore.cleanup(); // doctorStore'daki cleanup işlemlerini çağır
});

// Watchers
watch(
  () => selectedDate.value,
  (newDate) => {
    if (newDate && doctorId.value) {
      doctorStore.getAvailableSlots(newDate, selectedServiceId.value);
    }
  }
);

watch(
  () => selectedServiceId.value,
  (newServiceId) => {
    if (selectedDate.value && newServiceId) {
      doctorStore.getAvailableSlots(selectedDate.value, newServiceId);
    }
  }
);
</script>
<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap");

.appointment-scheduler {
  font-family: "Roboto", sans-serif;
}

.appointment-scheduler h2,
.appointment-scheduler h3,
.appointment-scheduler h4 {
  font-family: "Inter", sans-serif;
}

.appointment-scheduler {
  font-family: "Inter", sans-serif;
}

.appointment-scheduler h2,
.appointment-scheduler h3 {
  font-family: "Poppins", sans-serif;
}

.appointment-scheduler {
  font-family: "Inter", sans-serif;
}

.appointment-scheduler h2,
.appointment-scheduler h3 {
  font-family: "Poppins", sans-serif;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.transition-transform {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

.hover\:scale-105:hover {
  transform: scale(1.05);
}

.focus\:outline-none:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.focus\:ring-2:focus {
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0
    var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0
    calc(2px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
    var(--tw-shadow, 0 0 #0000);
}

.focus\:ring-indigo-500:focus {
  --tw-ring-opacity: 1;
  --tw-ring-color: rgba(99, 102, 241, var(--tw-ring-opacity));
}

.focus\:ring-offset-2:focus {
  --tw-ring-offset-width: 2px;
}
</style>
