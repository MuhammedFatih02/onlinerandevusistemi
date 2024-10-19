<template>
  <div
    class="bg-gradient-to-br from-teal-50 to-blue-100 rounded-xl shadow-xl overflow-hidden"
  >
    <div class="p-6 bg-gradient-to-r from-teal-600 to-blue-600">
      <h2 class="text-4xl font-extrabold text-white">Randevu Takvimi</h2>
    </div>
    <div class="p-6">
      <FullCalendar :options="calendarOptions" class="fc-premium" />
    </div>

    <!-- Randevu Detay Modalı -->
    <TransitionRoot appear :show="isModalOpen" as="template">
      <Dialog as="div" @close="closeModal" class="relative z-10">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-md" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto">
          <div
            class="flex min-h-full items-center justify-center p-4 text-center"
          >
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <DialogPanel
                class="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-2xl transition-all"
              >
                <!-- Yükleme Göstergesi -->
                <div
                  v-if="isLoading"
                  class="flex justify-center items-center py-8"
                >
                  <svg
                    class="animate-spin h-8 w-8 text-teal-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                    ></circle>
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 2.261.896 4.316 2.343 5.833l1.657-1.542z"
                    ></path>
                  </svg>
                </div>

                <!-- Randevu Detayları -->
                <div v-else>
                  <DialogTitle
                    as="h3"
                    class="text-3xl font-semibold leading-6 text-gray-900 border-b pb-2 mb-4"
                  >
                    Randevu Detayları
                  </DialogTitle>
                  <div class="mt-4 space-y-4">
                    <div
                      class="flex justify-between items-center bg-gradient-to-r from-teal-50 to-blue-50 p-4 rounded-lg"
                    >
                      <span class="font-semibold text-gray-700">Hasta:</span>
                      <span class="text-gray-800"
                        >{{ selectedAppointment?.patient.firstName }}
                        {{ selectedAppointment?.patient.lastName }}</span
                      >
                    </div>
                    <div
                      class="flex justify-between items-center bg-gradient-to-r from-teal-50 to-blue-50 p-4 rounded-lg"
                    >
                      <span class="font-semibold text-gray-700">Hizmet:</span>
                      <span class="text-gray-800">{{
                        selectedAppointment?.service.name
                      }}</span>
                    </div>
                    <div
                      class="flex justify-between items-center bg-gradient-to-r from-teal-50 to-blue-50 p-4 rounded-lg"
                    >
                      <span class="font-semibold text-gray-700"
                        >Başlangıç:</span
                      >
                      <span class="text-gray-800">{{
                        formatDate(selectedAppointment?.startTime)
                      }}</span>
                    </div>
                    <div
                      class="flex justify-between items-center bg-gradient-to-r from-teal-50 to-blue-50 p-4 rounded-lg"
                    >
                      <span class="font-semibold text-gray-700">Bitiş:</span>
                      <span class="text-gray-800">{{
                        formatDate(selectedAppointment?.endTime)
                      }}</span>
                    </div>
                    <div
                      class="flex justify-between items-center bg-gradient-to-r from-teal-50 to-blue-50 p-4 rounded-lg"
                    >
                      <span class="font-semibold text-gray-700">Durum:</span>
                      <span :class="statusClass">{{
                        getStatusText(selectedAppointment?.status)
                      }}</span>
                    </div>
                  </div>

                  <div class="mt-8 flex justify-end space-x-3">
                    <button
                      type="button"
                      class="inline-flex justify-center rounded-md border border-transparent bg-teal-100 px-4 py-2 text-sm font-medium text-teal-900 hover:bg-teal-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 transition-all duration-200 transform hover:scale-105"
                      @click="editAppointment"
                    >
                      Düzenle
                    </button>
                    <button
                      type="button"
                      class="inline-flex justify-center rounded-md border border-transparent bg-red-100 px-4 py-2 text-sm font-medium text-red-900 hover:bg-red-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-all duration-200 transform hover:scale-105"
                      @click="cancelAppointment"
                    >
                      İptal Et
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import trLocale from "@fullcalendar/core/locales/tr";
import { DateTime } from "luxon";
import { useAppointmentStore } from "@/stores/appointmentStore";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";

const appointmentStore = useAppointmentStore();
const selectedAppointment = ref(null);
const isModalOpen = ref(false);
const isLoading = ref(true);

const props = defineProps({
  appointments: {
    type: Array,
    default: () => [],
  },
});

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: "timeGridWeek",
  headerToolbar: {
    left: "prev,next today",
    center: "title",
    right: "dayGridMonth,timeGridWeek,timeGridDay",
  },
  locale: trLocale,
  buttonText: {
    today: "Bugün",
    month: "Ay",
    week: "Hafta",
    day: "Gün",
  },
  slotMinTime: "09:00:00",
  slotMaxTime: "19:00:00",
  allDaySlot: false,
  slotDuration: "00:30:00",
  slotLabelFormat: {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  },
  eventTimeFormat: {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  },
  events: props.appointments.map((apt) => ({
    title: `${apt.patient.firstName} ${apt.patient.lastName}`,
    start: apt.startTime,
    end: apt.endTime,
    extendedProps: { ...apt },
    backgroundColor: statusColor(apt.status),
    borderColor: statusBorderColor(apt.status),
    textColor: "#ffffff",
    classNames: [
      "font-semibold",
      "rounded-lg",
      "shadow-md",
      "border-l-4",
      `border-l-${statusColor(apt.status)}`,
      "event-gradient",
    ],
  })),
  eventClick: handleEventClick,
  editable: true,
  droppable: true,
  eventMouseEnter: handleEventMouseEnter,
  dayHeaderFormat: { weekday: "long", day: "numeric", omitCommas: true },
  height: "auto",
  aspectRatio: 1.8,
}));

function statusColor(status) {
  const colors = {
    completed: "emerald-500",
    pending: "amber-500",
    cancelled: "rose-500",
    planned: "sky-500",
    default: "slate-500",
  };
  return colors[status] || colors.default;
}

function statusBorderColor(status) {
  const colors = {
    completed: "emerald-600",
    pending: "amber-600",
    cancelled: "rose-600",
    planned: "sky-600",
    default: "slate-600",
  };
  return colors[status] || colors.default;
}

function handleEventClick(info) {
  isLoading.value = true;
  selectedAppointment.value = info.event.extendedProps;

  // Simulate API call
  setTimeout(() => {
    isLoading.value = false;
  }, 1000); // Simulating a delay of 1 second before loading details

  isModalOpen.value = true;
}

function handleEventMouseEnter(info) {
  const tooltip = document.createElement("div");
  tooltip.classList.add(
    "bg-white",
    "text-gray-800",
    "p-4",
    "rounded-lg",
    "shadow-lg",
    "text-sm",
    "z-50",
    "border",
    "border-gray-200",
    "transform",
    "transition",
    "duration-300",
    "ease-out",
    "hover:scale-105"
  );
  tooltip.style.opacity = "0";
  tooltip.style.transition = "opacity 0.3s ease";

  tooltip.innerHTML = `
    <div class="font-semibold mb-2 text-lg">${info.event.title}</div>
    <div class="mb-1"><strong>Başlangıç:</strong> ${formatDate(
      info.event.start
    )}</div>
    <div class="mb-1"><strong>Hizmet:</strong> ${
      info.event.extendedProps.service.name
    }</div>
    <div><strong>Durum:</strong> <span class="font-semibold ${
      statusClass.value
    }">${getStatusText(info.event.extendedProps.status)}</span></div>
  `;
  document.body.appendChild(tooltip);

  const updateTooltipPosition = (event) => {
    tooltip.style.position = "absolute";
    tooltip.style.top = `${event.pageY + 10}px`;
    tooltip.style.left = `${event.pageX + 10}px`;
    tooltip.style.opacity = "1";
  };

  info.el.addEventListener("mousemove", updateTooltipPosition);
  info.el.addEventListener("mouseleave", () => {
    tooltip.style.opacity = "0";
    setTimeout(() => tooltip.remove(), 300);
    info.el.removeEventListener("mousemove", updateTooltipPosition);
  });
}

function closeModal() {
  isModalOpen.value = false;
}

function formatDate(date) {
  return DateTime.fromISO(date)
    .setLocale("tr")
    .toLocaleString(DateTime.DATETIME_SHORT);
}

function getStatusText(status) {
  const statusTexts = {
    completed: "Tamamlandı",
    pending: "Beklemede",
    cancelled: "İptal Edildi",
    planned: "Planlandı",
    default: "Belirsiz",
  };
  return statusTexts[status] || statusTexts.default;
}

const statusClass = computed(() => {
  const classes = {
    completed: "text-emerald-600",
    pending: "text-amber-600",
    cancelled: "text-rose-600",
    planned: "text-sky-600",
    default: "text-slate-600",
  };
  return classes[selectedAppointment.value?.status] || classes.default;
});

async function editAppointment() {
  try {
    await appointmentStore.updateAppointment(
      selectedAppointment.value._id,
      selectedAppointment.value
    );
    closeModal();
  } catch (error) {
    console.error("Randevu güncellenirken bir hata oluştu:", error);
  }
}

async function cancelAppointment() {
  if (confirm("Bu randevuyu iptal etmek istediğinizden emin misiniz?")) {
    try {
      await appointmentStore.cancelAppointment(
        selectedAppointment.value._id,
        "Kullanıcı tarafından iptal edildi"
      );
      closeModal();
    } catch (error) {
      console.error("Randevu iptal edilirken bir hata oluştu:", error);
    }
  }
}
</script>

<style>
.fc-premium .fc-toolbar-title {
  @apply text-3xl font-bold text-gray-800;
}

.fc-premium .fc-button {
  @apply bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out shadow-md;
}

.fc-premium .fc-day-today {
  @apply bg-teal-50;
}

.fc-premium .fc-timegrid-slot {
  @apply h-16;
}

.fc-premium .fc-timegrid-axis {
  @apply pr-4;
}

.fc-premium .fc-timegrid-event {
  @apply rounded-lg shadow-md overflow-hidden;
}

.fc-premium .fc-timegrid-event .fc-event-main {
  @apply p-2;
}

.fc-premium .fc-timegrid-event .fc-event-time {
  @apply text-sm font-semibold;
}

.fc-premium .fc-timegrid-event .fc-event-title {
  @apply text-sm mt-1;
}

.fc-premium .fc-col-header-cell {
  @apply py-4 font-bold capitalize bg-gray-100;
}

.fc-premium .fc-day-today .fc-col-header-cell-cushion {
  @apply text-teal-600;
}

.fc-premium .fc-timegrid-axis-cushion {
  @apply font-semibold text-gray-600;
}

.fc-premium .fc-timegrid-slot-label-cushion {
  @apply font-medium text-gray-500;
}

.fc-premium .fc-theme-standard td,
.fc-premium .fc-theme-standard th {
  @apply border-gray-200;
}

.fc-premium .fc-scrollgrid {
  @apply rounded-lg overflow-hidden shadow-lg;
}
</style>
