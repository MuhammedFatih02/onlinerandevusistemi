<template>
  <div class="appointment-list-container grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div
      v-for="appointment in appointments"
      :key="appointment._id"
      class="appointment-card bg-white shadow-lg rounded-xl p-6 transition-all transform hover:scale-105 hover:shadow-2xl"
    >
      <div class="header flex items-center justify-between mb-4">
        <h3 class="text-2xl font-bold text-gray-800">
          {{ appointment.patient.firstName }} {{ appointment.patient.lastName }}
        </h3>
        <span
          :class="statusBadge(appointment.status)"
          class="badge px-4 py-2 rounded-full text-sm font-semibold"
        >
          {{ statusText(appointment.status) }}
        </span>
      </div>

      <div class="appointment-details text-gray-600">
        <p class="mb-2">
          <strong>Hizmet:</strong> {{ appointment.service.name }}
        </p>
        <p class="mb-2">
          <strong>Başlangıç:</strong>
          {{ formatDateTime(appointment.startTime) }}
        </p>
        <p class="mb-2">
          <strong>Bitiş:</strong> {{ formatDateTime(appointment.endTime) }}
        </p>
      </div>

      <div class="actions mt-6 flex justify-end space-x-4">
        <button
          v-if="appointment.status !== 'completed'"
          @click="$emit('update-status', appointment._id, 'completed')"
          class="action-button bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300"
        >
          <i class="fas fa-check mr-2"></i> Tamamlandı
        </button>
        <button
          v-if="appointment.status !== 'cancelled'"
          @click="$emit('update-status', appointment._id, 'cancelled')"
          class="action-button bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full transition-all duration-300"
        >
          <i class="fas fa-times mr-2"></i> İptal Et
        </button>
      </div>
    </div>
  </div>
</template>
  
  <script>
import { DateTime } from "luxon";

export default {
  props: {
    appointments: {
      type: Array,
      default: () => [],
    },
  },
  methods: {
    formatDateTime(dateTime) {
      return DateTime.fromISO(dateTime, { zone: "Europe/Istanbul" }).toFormat(
        "dd LLL yyyy, HH:mm"
      );
    },
    statusText(status) {
      switch (status) {
        case "completed":
          return "Tamamlandı";
        case "planlandı": // 'pending' durumunu ekledik
          return "Planlandı";
        case "cancelled":
          return "İptal Edildi";
        default:
          return "Bilinmiyor";
      }
    },
    statusBadge(status) {
      switch (status) {
        case "completed":
          return "bg-green-100 text-green-800";
        case "pending": // 'pending' durumu için rozet ekledik
          return "bg-yellow-100 text-yellow-800";
        case "cancelled":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    },
  },
};
</script>
  
  <style scoped>
/* Container for the appointment list with responsive grid layout */
.appointment-list-container {
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 15px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.05);
}

/* Individual appointment card styling */
.appointment-card {
  background-color: #ffffff;
  border-radius: 12px;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

/* Header styling with patient name and status badge */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Badge styling for different appointment statuses */
.badge {
  padding: 5px 10px;
  border-radius: 50px;
}

/* Hover animation for scaling and shadow */
.appointment-card:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

/* Button styling for actions */
.action-button {
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 30px;
  display: inline-flex;
  align-items: center;
}

/* Appointment details styling */
.appointment-details p {
  margin-bottom: 10px;
  font-size: 16px;
  line-height: 1.6;
  color: #4b5563;
}
</style>
  