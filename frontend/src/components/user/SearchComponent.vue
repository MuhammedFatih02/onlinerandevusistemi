<template>
  <div class="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div>
        <label
          for="city-select"
          class="block text-sm font-medium text-gray-700 mb-2"
          >Şehir</label
        >
        <div class="relative">
          <select
            id="city-select"
            v-model="selectedCity"
            class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Tüm Şehirler</option>
            <option v-for="city in cities" :key="city" :value="city">
              {{ city }}
            </option>
          </select>
          <div
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"
          >
            <i class="fas fa-chevron-down"></i>
          </div>
        </div>
      </div>

      <div>
        <label
          for="service-select"
          class="block text-sm font-medium text-gray-700 mb-2"
          >Hizmet</label
        >
        <div class="relative">
          <select
            id="service-select"
            v-model="selectedService"
            class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Tüm Hizmetler</option>
            <option
              v-for="service in services"
              :key="service._id"
              :value="service._id"
            >
              {{ service.name }}
            </option>
          </select>
          <div
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"
          >
            <i class="fas fa-chevron-down"></i>
          </div>
        </div>
      </div>
    </div>

    <button
      @click="filterDoctors"
      class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150 ease-in-out"
    >
      <i class="fas fa-search mr-2"></i> Ara
    </button>

    <div v-if="loading" class="mt-8 text-center">
      <i class="fas fa-spinner fa-spin fa-2x text-indigo-600"></i>
    </div>
    <div v-else-if="error" class="mt-8 text-center text-red-600">
      <i class="fas fa-exclamation-triangle mr-2"></i> {{ error }}
    </div>
    <div v-else-if="filteredDoctors.length > 0" class="mt-8">
      <h3 class="text-xl font-semibold mb-4 text-gray-800">
        Filtrelenmiş Doktorlar
      </h3>
      <ul class="space-y-4">
        <li
          v-for="doctor in filteredDoctors"
          :key="doctor._id"
          class="bg-gray-50 p-4 rounded-lg shadow"
        >
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center">
              <i class="fas fa-user-md text-indigo-600 mr-2"></i>
              <span class="font-bold text-lg text-gray-800">{{
                getDoctorName(doctor)
              }}</span>
            </div>
            <router-link
              :to="{ name: 'DoctorDetails', params: { id: doctor._id } }"
              class="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded-md text-sm transition duration-150 ease-in-out"
            >
              Detayları Gör
            </router-link>
          </div>
          <div class="grid grid-cols-2 gap-2 text-sm">
            <div>
              <i class="fas fa-map-marker-alt text-gray-600 mr-1"></i>
              {{ doctor.city }}
            </div>
            <div>
              <i class="fas fa-stethoscope text-gray-600 mr-1"></i>
              {{ doctor.specialization }}
            </div>
            <div>
              <i class="fas fa-briefcase text-gray-600 mr-1"></i>
              {{ doctor.experience }} yıl deneyim
            </div>
            <div class="flex items-center">
              <div class="flex">
                <div v-for="n in 5" :key="n">
                  <svg
                    :class="[
                      'w-4 h-4 fill-current',
                      n <= Math.round(doctor.averageRating || 0)
                        ? 'text-yellow-400'
                        : 'text-gray-300',
                    ]"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path
                      d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                    />
                  </svg>
                </div>
              </div>
              <span class="ml-1 text-gray-600">
                {{
                  doctor.averageRating ? doctor.averageRating.toFixed(1) : "N/A"
                }}
              </span>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <div v-else-if="!loading" class="mt-8 text-center text-gray-600">
      <i class="fas fa-search mr-2"></i> Doktor bulunamadı.
    </div>
  </div>
</template>
  
  <script>
import { defineComponent, ref, onMounted, computed } from "vue";
import { useFilterStore } from "@/stores/filterStore";
import { useServiceStore } from "@/stores/serviceStore";
import { useDoctorStore } from "@/stores/doctorStore";
import { useCommentStore } from "@/stores/commentStore";

export default defineComponent({
  name: "DoctorFilter",
  setup() {
    const filterStore = useFilterStore();
    const serviceStore = useServiceStore();
    const doctorStore = useDoctorStore();
    const commentStore = useCommentStore();

    const selectedCity = ref("");
    const selectedService = ref("");
    const cities = ref([]);

    const loading = computed(() => filterStore.loading);
    const error = computed(() => filterStore.error);
    const filteredDoctors = computed(() => filterStore.doctors);
    const services = computed(() => serviceStore.services);

    onMounted(async () => {
      await serviceStore.fetchServices();
      await fetchAllDoctors();
    });

    async function fetchAllDoctors() {
      try {
        const doctors = await doctorStore.fetchAllDoctors();
        cities.value = [
          ...new Set(doctors.map((doctor) => doctor.city)),
        ].sort();
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    }

    async function filterDoctors() {
      const filters = {};
      if (selectedCity.value) filters.city = selectedCity.value;
      if (selectedService.value) filters.serviceId = selectedService.value;

      await filterStore.fetchDoctors(filters);

      // Fetch ratings for each doctor
      for (let doctor of filterStore.doctors) {
        await fetchDoctorRating(doctor._id);
      }
    }

    function getDoctorName(doctor) {
      return `${doctor.user.firstName} ${doctor.user.lastName}`;
    }

    async function fetchDoctorRating(doctorId) {
      try {
        await commentStore.fetchComments({ doctorId });
        const comments = commentStore.comments;
        const totalRating = comments.reduce(
          (sum, comment) => sum + comment.rating,
          0
        );
        const averageRating =
          comments.length > 0 ? totalRating / comments.length : null;

        // Update the doctor's rating in the filteredDoctors array
        const doctorIndex = filterStore.doctors.findIndex(
          (d) => d._id === doctorId
        );
        if (doctorIndex !== -1) {
          filterStore.doctors[doctorIndex].averageRating = averageRating;
        }
      } catch (error) {
        console.error("Error fetching doctor rating:", error);
      }
    }

    return {
      selectedCity,
      selectedService,
      cities,
      services,
      loading,
      error,
      filteredDoctors,
      filterDoctors,
      getDoctorName,
    };
  },
});
</script>