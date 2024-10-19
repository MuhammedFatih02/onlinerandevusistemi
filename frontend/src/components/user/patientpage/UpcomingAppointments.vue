<template>
  <div class="card bg-white shadow-lg rounded-lg overflow-hidden">
    <div class="p-6">
      <h2 class="text-2xl font-semibold mb-6 text-gray-800 font-inter">
        Yaklaşan Randevular
      </h2>
      <div v-if="upcomingAppointments.length" class="space-y-4">
        <div
          v-for="appointment in upcomingAppointments"
          :key="appointment._id"
          class="flex justify-between items-center p-4 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
        >
          <div class="flex items-center space-x-4">
            <div
              class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg"
            >
              {{ getInitial(appointment.doctorId) }}
            </div>
            <div>
              <p class="font-medium text-gray-800 font-inter">
                Dr. {{ getDoctorName(appointment.doctorId) }}
              </p>
              <p class="text-sm text-gray-600 font-roboto">
                {{ getServiceName(appointment.service) }}
              </p>
            </div>
          </div>
          <div class="text-right">
            <p class="font-medium text-gray-800 font-inter">
              {{ formatDate(appointment.startTime) }}
            </p>
            <p class="text-sm text-gray-600 font-roboto">
              {{ formatTime(appointment.startTime) }}
            </p>
          </div>
        </div>
      </div>
      <p v-else class="text-gray-600 font-roboto text-center py-4">
        Yaklaşan randevunuz bulunmamaktadır.
      </p>
    </div>
  </div>
</template>
  
  <script>
import { ref, computed, onMounted } from "vue";
import { useAppointmentStore } from "@/stores/appointmentStore";
import { useDoctorStore } from "@/stores/doctorStore";
import { DateTime } from "luxon";

export default {
  name: "UpcomingAppointments",
  setup() {
    const appointmentStore = useAppointmentStore();
    const doctorStore = useDoctorStore();
    const doctorCache = ref({});

    const upcomingAppointments = computed(
      () => appointmentStore.getUpcomingAppointments
    );

    onMounted(async () => {
      await fetchDoctorInfo();
    });

    const fetchDoctorInfo = async () => {
      for (const appointment of upcomingAppointments.value) {
        if (!doctorCache.value[appointment.doctorId]) {
          try {
            const doctorProfile = await doctorStore.fetchProfile(
              appointment.doctorId
            );
            doctorCache.value[appointment.doctorId] = doctorProfile;
          } catch (error) {
            console.error("Doktor profili yüklenirken hata oluştu:", error);
          }
        }
      }
    };

    const getDoctorName = (doctorId) => {
      const doctor = doctorCache.value[doctorId];
      if (doctor?.user?.firstName && doctor?.user?.lastName) {
        return `${doctor.user.firstName} ${doctor.user.lastName}`;
      }
      return "Bilinmeyen Doktor";
    };

    const getInitial = (doctorId) => {
      const doctor = doctorCache.value[doctorId];
      if (doctor?.user?.firstName) {
        return doctor.user.firstName.charAt(0);
      }
      return "?";
    };

    const getServiceName = (service) => {
      if (typeof service === "object" && service !== null) {
        return service.name || "Bilinmeyen Hizmet";
      }
      return service || "Bilinmeyen Hizmet";
    };

    const formatDate = (dateString) => {
      return DateTime.fromISO(dateString)
        .setLocale("tr")
        .toLocaleString(DateTime.DATE_FULL);
    };

    const formatTime = (dateString) => {
      return DateTime.fromISO(dateString).toFormat("HH:mm");
    };

    return {
      upcomingAppointments,
      getDoctorName,
      getInitial,
      getServiceName,
      formatDate,
      formatTime,
    };
  },
};
</script>