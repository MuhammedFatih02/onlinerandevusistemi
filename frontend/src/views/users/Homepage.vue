<template>
  <div class="bg-gray-50 text-gray-900">
    <!-- Hero Section -->
    <section
      class="relative bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
    >
      <HeroSection />
      <div class="absolute bottom-10 w-full text-center"></div>
    </section>

    <!-- Search Component -->
    <section
      id="search"
      class="relative min-h-screen flex items-center justify-center bg-blue-50"
    >
      <div class="relative z-10 container mx-auto px-4 text-center">
        <h2 class="text-4xl font-semibold text-blue-600 mb-6">
          <i class="fas fa-tooth text-blue-500 mr-2"></i> Hemen Diş Hekimi Ara
        </h2>
        <SearchComponent />
      </div>
    </section>

    <!-- Doctors Section -->
    <section class="bg-white py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-center text-3xl font-semibold mb-12 text-indigo-700">
          <i class="fas fa-user-md text-indigo-700 mr-2"></i> En İyi Diş
          Hekimleri
        </h2>
        <Doctors />
      </div>
    </section>

    <!-- Footer -->
  </div>
</template>

<script>
import HeroSection from "@/components/user/HeroSection.vue";
import SearchComponent from "@/components/user/SearchComponent.vue";
import Doctors from "@/views/users/Doctors.vue";

export default {
  components: {
    HeroSection,
    SearchComponent,
    Doctors,
  },
};
</script>

<style scoped>
/* Özelleştirilmiş premium tipografi */
h2 {
  font-family: "Inter", sans-serif;
}
</style>
