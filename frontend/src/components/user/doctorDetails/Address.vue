<template>
  <div class="address-component bg-white shadow-sm rounded-lg p-6 space-y-6">
    <h3 class="text-2xl font-semibold text-gray-800 font-poppins">
      Konum Bilgileri
    </h3>

    <div class="space-y-4">
      <div v-if="doctor.city" class="flex items-center text-gray-700">
        <i class="fas fa-map-marker-alt w-6 text-blue-500 text-xl"></i>
        <span class="ml-3 font-inter text-lg">{{ doctor.city }}</span>
      </div>

      <div v-if="doctor.landlinePhone" class="flex items-center text-gray-700">
        <i class="fas fa-phone-alt w-6 text-blue-500 text-xl"></i>
        <span class="ml-3 font-inter text-lg">{{ doctor.landlinePhone }}</span>
        <button
          @click="callDoctor"
          class="ml-3 px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full hover:bg-green-600 transition duration-300 ease-in-out"
        >
          Ara
        </button>
      </div>

      <div v-if="doctor.fullAddress" class="flex items-start text-gray-700">
        <i class="fas fa-home w-6 text-blue-500 text-xl mt-1"></i>
        <span class="ml-3 font-inter text-lg">{{ doctor.fullAddress }}</span>
      </div>
    </div>

    <a
      v-if="doctor.fullAddress"
      :href="mapUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-300 ease-in-out font-semibold text-lg"
    >
      <i class="fas fa-directions mr-3 text-xl"></i>
      Yol Tarifi Al
    </a>
  </div>
</template>
  
  <script>
import { computed } from "vue";

export default {
  name: "Address",
  props: {
    doctor: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const mapUrl = computed(() => {
      if (props.doctor.fullAddress) {
        return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
          props.doctor.fullAddress
        )}`;
      }
      return "#";
    });

    const callDoctor = () => {
      if (props.doctor.landlinePhone) {
        window.location.href = `tel:${props.doctor.landlinePhone}`;
      }
    };

    return {
      mapUrl,
      callDoctor,
    };
  },
};
</script>
  
  <style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600&display=swap");

.font-poppins {
  font-family: "Poppins", sans-serif;
}

.font-inter {
  font-family: "Inter", sans-serif;
}
</style>