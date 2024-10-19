<template>
  <div
    class="card bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
  >
    <h2 class="text-2xl font-semibold mb-6 text-gray-800 font-inter">
      Randevu Filtrele
    </h2>
    <form @submit.prevent="filterAppointments">
      <div class="mb-4">
        <label
          for="service"
          class="block text-sm font-medium mb-2 text-gray-700 font-roboto"
          >Hizmet</label
        >
        <select
          id="service"
          v-model="filterData.service"
          class="w-full px-3 py-2 text-gray-600 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-roboto"
        >
          <option value="">Seçiniz</option>
          <option
            v-for="service in services"
            :key="service._id"
            :value="service._id"
          >
            {{ service.name }}
          </option>
        </select>
      </div>
      <div class="mb-6">
        <label
          for="city"
          class="block text-sm font-medium mb-2 text-gray-700 font-roboto"
          >Şehir</label
        >
        <select
          id="city"
          v-model="filterData.city"
          class="w-full px-3 py-2 text-gray-600 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 font-roboto"
        >
          <option value="">Seçiniz</option>
          <option value="istanbul">İstanbul</option>
          <option value="ankara">Ankara</option>
          <option value="izmir">İzmir</option>
        </select>
      </div>
      <button
        type="submit"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-300 font-roboto"
      >
        Randevu Ara
      </button>
    </form>
  </div>
</template>
  
  <script>
import { ref, onMounted } from "vue";
import { useServiceStore } from "@/stores/serviceStore";
import { useAppointmentStore } from "@/stores/appointmentStore";

export default {
  name: "FilterComponent",
  setup() {
    const serviceStore = useServiceStore();
    const appointmentStore = useAppointmentStore();
    const filterData = ref({ service: "", city: "" });

    onMounted(async () => {
      await serviceStore.fetchServices();
    });

    const filterAppointments = async () => {
      await appointmentStore.fetchAppointments(filterData.value);
    };

    return {
      filterData,
      services: serviceStore.services,
      filterAppointments,
    };
  },
};
</script>