<template>
  <div class="bg-white shadow-lg rounded-lg overflow-hidden">
    <div class="bg-blue-600 text-white p-4">
      <h2 class="text-2xl font-semibold">Son 3 Randevunuz</h2>
    </div>
    <div v-if="lastAppointments.length" class="divide-y divide-gray-200">
      <div
        v-for="appointment in lastAppointments"
        :key="appointment._id"
        class="p-4 hover:bg-gray-50 transition-colors duration-150 ease-in-out"
      >
        <div class="flex items-center space-x-4">
          <!-- Doktorun Baş Harfi -->
          <div
            class="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-2xl font-bold text-white shadow-md"
          >
            {{ getInitial(appointment.doctor) }}
          </div>

          <!-- Doktor ve Randevu Bilgileri -->
          <div class="flex-1">
            <h3 class="text-xl font-bold text-gray-800">
              Dr. {{ getDoctorName(appointment.doctor) }}
            </h3>
            <p class="text-sm text-gray-600">
              Uzmanlık:
              {{ appointment.doctor?.specialization || "Uzmanlık bilgisi yok" }}
            </p>
            <p class="text-sm mt-2 text-gray-600">
              Randevu Tarihi: {{ formatDate(appointment.startTime) }}
            </p>
          </div>

          <!-- Randevu Durumu ve Profil Butonu -->
          <div class="text-right">
            <p
              class="inline-block px-3 py-1 rounded-full text-sm font-semibold mb-2"
              :class="{
                'bg-green-500 text-white': appointment.status === 'completed',
                'bg-yellow-500 text-gray-800': appointment.status === 'pending',
                'bg-red-500 text-white': appointment.status === 'cancelled',
              }"
            >
              {{ getStatus(appointment.status) }}
            </p>
            <button
              @click="goToDoctorProfile(appointment.doctor?._id)"
              class="block w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300"
            >
              Profili Görüntüle
            </button>
          </div>
        </div>
      </div>
    </div>

    <p v-else class="p-4 text-gray-500">Henüz randevu bulunmamaktadır.</p>
  </div>
</template>
  
  <script>
import { ref, onMounted } from "vue";
import { useAppointmentStore } from "@/stores/appointmentStore";
import { useDoctorStore } from "@/stores/doctorStore";
import { useRouter } from "vue-router";
import { DateTime } from "luxon";

export default {
  name: "PatientAppointments",
  setup() {
    const appointmentStore = useAppointmentStore();
    const doctorStore = useDoctorStore();
    const lastAppointments = ref([]);
    const router = useRouter();

    onMounted(async () => {
      try {
        await appointmentStore.fetchAppointments();
        const recentAppointments = appointmentStore.appointments.slice(0, 3);
        lastAppointments.value = await fetchDoctorInfo(recentAppointments);
      } catch (error) {
        console.error("Randevular yüklenirken hata oluştu:", error);
      }
    });

    const fetchDoctorInfo = async (appointments) => {
      return await Promise.all(
        appointments.map(async (appointment) => {
          const doctorId = appointment.doctor?._id;
          if (!doctorId) {
            console.error(
              `Doktor ID bulunamadı, randevu ID: ${appointment._id}`
            );
            return appointment;
          }

          try {
            const doctorProfile = await doctorStore.fetchProfile(doctorId);
            if (!doctorProfile) {
              console.error("Doktor profili alınamadı:", doctorId);
              return appointment;
            }
            return { ...appointment, doctor: doctorProfile };
          } catch (error) {
            console.error("Doktor profili yüklenirken hata oluştu:", error);
            return appointment;
          }
        })
      );
    };

    const formatDate = (dateString) => {
      return DateTime.fromISO(dateString)
        .setLocale("tr")
        .toLocaleString(DateTime.DATETIME_FULL);
    };

    const getStatus = (status) => {
      switch (status) {
        case "completed":
          return "Tamamlandı";
        case "planlandı":
          return "Planlandı";
        case "cancelled":
          return "İptal Edildi";
        default:
          return "Bilinmiyor";
      }
    };

    const goToDoctorProfile = (doctorId) => {
      if (!doctorId) {
        console.error("Doktor ID bulunamadı.");
        return;
      }
      // Burada rolü kontrol edebilirsiniz. Örnek:
      // const userRole = getUserRole(); // Bu fonksiyonu kendi auth sisteminize göre oluşturun
      // if (userRole === 'patient' || userRole === 'admin') {
      router.push({ name: "DoctorDetails", params: { id: doctorId } });
      // } else {
      //   console.error("Bu sayfayı görüntüleme yetkiniz yok.");
      // }
    };

    const getInitial = (doctor) => {
      if (doctor?.user?.firstName) {
        return doctor.user.firstName.charAt(0);
      } else if (doctor?.firstName) {
        return doctor.firstName.charAt(0);
      }
      return "?";
    };

    const getDoctorName = (doctor) => {
      if (doctor?.user?.firstName && doctor?.user?.lastName) {
        return `${doctor.user.firstName} ${doctor.user.lastName}`;
      } else if (doctor?.firstName && doctor?.lastName) {
        return `${doctor.firstName} ${doctor.lastName}`;
      }
      return "Bilinmeyen Doktor";
    };

    return {
      lastAppointments,
      formatDate,
      getStatus,
      goToDoctorProfile,
      getInitial,
      getDoctorName,
    };
  },
};
</script>