<template>
  <div
    class="doctor-details-container bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8"
  >
    <div v-if="doctor" class="max-w-7xl mx-auto">
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <!-- Doktor Bilgileri -->
        <div class="p-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div
            class="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8"
          >
            <img
              :src="doctor.profileImage || defaultProfileImage"
              :alt="`${doctor.user.firstName} ${doctor.user.lastName}`"
              class="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md"
            />
            <div class="text-center md:text-left">
              <h2 class="text-3xl font-bold">
                Dr. {{ doctor.user.firstName }} {{ doctor.user.lastName }}
              </h2>
              <p class="text-xl font-semibold mt-2">
                {{ doctor.specialty }}
              </p>
              <div
                class="flex items-center justify-center md:justify-start mt-3 text-blue-100"
              >
                <i class="fas fa-user-md mr-2"></i>
                <span>{{ doctor.experience }} yıl deneyim</span>
              </div>
              <button
                @click="toggleFavorite"
                :class="[
                  'mt-4 px-6 py-2 rounded-full text-sm font-medium transition-all duration-300',
                  isFavorite
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-white text-blue-600 hover:bg-blue-50',
                ]"
              >
                <i
                  :class="[
                    'mr-2',
                    isFavorite ? 'fas fa-heart' : 'far fa-heart',
                  ]"
                ></i>
                {{ isFavorite ? "Favorilerden Çıkar" : "Favorilere Ekle" }}
              </button>
            </div>
          </div>
        </div>

        <!-- Üstteki Tab Paneli -->
        <div class="tabs flex space-x-4 justify-center py-4 bg-blue-100">
          <a
            v-for="tab in tabs"
            :key="tab"
            href="#"
            @click.prevent="scrollToSection(tab)"
            :class="[
              'py-2 px-4 font-semibold',
              activeTab === tab
                ? 'text-blue-600 underline'
                : 'text-gray-600 hover:text-blue-600',
            ]"
          >
            {{ tab }}
          </a>
        </div>

        <!-- Tab Paneli ve Schedule -->
        <div class="p-8 flex flex-col md:flex-row">
          <!-- Sol Taraf Tab Paneli -->
          <div class="w-full md:w-2/3 md:pr-4">
            <!-- Hakkında Expansion Panel (Sürekli açık) -->
            <div
              ref="aboutSection"
              class="expansion-panel mb-4 bg-blue-50 p-4 rounded-lg shadow-md"
            >
              <h3 class="text-xl font-semibold text-blue-600 mb-2">Hakkında</h3>
              <doctorAbout :doctor="doctor" />
            </div>

            <!-- Hizmetler Expansion Panel (Sürekli açık) -->
            <div
              ref="servicesSection"
              class="expansion-panel mb-4 bg-blue-50 p-4 rounded-lg shadow-md"
            >
              <h3 class="text-xl font-semibold text-blue-600 mb-2">
                Hizmetler
              </h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div
                  v-for="service in activeServices"
                  :key="service._id"
                  class="p-4 rounded-lg bg-white text-center text-gray-700 font-medium transition-all duration-300 hover:shadow-md"
                >
                  <i class="fas fa-check-circle text-green-500 mr-2"></i>
                  {{ service.name }}
                </div>
              </div>
            </div>

            <!-- Yorumlar Expansion Panel (Sürekli açık) -->
            <div
              ref="reviewsSection"
              class="expansion-panel mb-4 bg-blue-50 p-4 rounded-lg shadow-md"
            >
              <h3 class="text-xl font-semibold text-blue-600 mb-2">Yorumlar</h3>
              <Reviews :reviews="doctorReviews" />
            </div>

            <!-- Adres Expansion Panel (Sürekli açık) -->
            <div
              ref="addressSection"
              class="expansion-panel mb-4 bg-blue-50 p-4 rounded-lg shadow-md"
            >
              <h3 class="text-xl font-semibold text-blue-600 mb-2">Adres</h3>
              <Address :doctor="doctor" />
            </div>
          </div>

          <!-- Sağ Taraf Schedule (Takvim) -->
          <div class="w-full md:w-1/3">
            <AboutAndSchedule :doctor="doctor" />
          </div>
        </div>
      </div>
    </div>

    <!-- Yükleniyor Durumu -->
    <div
      v-else-if="userStore.isLoading"
      class="flex items-center justify-center h-64"
    >
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"
      ></div>
      <span class="ml-4 text-lg text-gray-600">Yükleniyor...</span>
    </div>

    <!-- Doktor Bulunamadı -->
    <div v-else class="text-center py-12 bg-white rounded-xl shadow-md">
      <i class="fas fa-user-md text-6xl text-gray-400 mb-4"></i>
      <p class="text-2xl font-semibold text-gray-700 mb-2">
        Doktor bulunamadı.
      </p>
      <p class="text-gray-600">
        Lütfen daha sonra tekrar deneyin veya başka bir doktor arayın.
      </p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import AboutAndSchedule from "@/components/user/doctorDetails/Schedule.vue";
import doctorAbout from "@/components/user/doctorDetails/DoctorAbout.vue";
import Reviews from "@/components/user/doctorDetails/Comment.vue";
import Address from "@/components/user/doctorDetails/Address.vue";
import { useUserStore } from "@/stores/userStore.js";
import { useServiceStore } from "@/stores/serviceStore.js";

export default {
  name: "DoctorDetails",
  components: { AboutAndSchedule, doctorAbout, Reviews, Address },
  setup() {
    const activeTab = ref("Hakkında");
    const tabs = ["Hakkında", "Hizmetler", "Yorumlar", "Adres"];
    const userStore = useUserStore();
    const serviceStore = useServiceStore();
    const route = useRoute();
    const router = useRouter();
    const doctor = ref(null);
    const doctorReviews = ref([]); // Eksik tanım
    const defaultProfileImage = ref(
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8BPzGCWyn2cygMkNEsHf7pxzh4XCR9bsxKg&s"
    );

    const isFavorite = computed(() =>
      userStore.favoriteHekimler.includes(doctor.value?._id)
    );

    const activeServices = computed(() => serviceStore.getActiveServices);

    const aboutSection = ref(null);
    const servicesSection = ref(null);
    const reviewsSection = ref(null);
    const addressSection = ref(null);

    onMounted(async () => {
      try {
        doctor.value = await userStore.getDoctorById(route.params.id);
        doctorReviews.value = await userStore.getDoctorReviews(
          doctor.value._id
        ); // Doktorun yorumlarını al
        await serviceStore.fetchServices();
      } catch (error) {
        console.error("Doktor veya hizmetler yüklenemedi:", error);
      }
    });

    const toggleFavorite = async () => {
      if (!userStore.isLoggedIn) {
        alert("Favorilere eklemek için giriş yapmalısınız.");
        router.push("/login");
        return;
      }
      try {
        if (isFavorite.value) {
          await userStore.removeFavoriteHekim(doctor.value._id);
        } else {
          await userStore.addFavoriteHekim(doctor.value._id);
        }
        await userStore.getProfile();
      } catch (error) {
        console.error("Favori işlemi başarısız:", error);
      }
    };

    const bookAppointment = () => {
      alert("Randevu al butonuna tıkladınız.");
    };

    const scrollToSection = (tab) => {
      let sectionRef = null;
      if (tab === "Hakkında") sectionRef = aboutSection.value;
      if (tab === "Hizmetler") sectionRef = servicesSection.value;
      if (tab === "Yorumlar") sectionRef = reviewsSection.value;
      if (tab === "Adres") sectionRef = addressSection.value;

      if (sectionRef) {
        sectionRef.scrollIntoView({ behavior: "smooth" });
      }
    };

    return {
      userStore,
      doctor,
      activeServices,
      isFavorite,
      toggleFavorite,
      bookAppointment,
      defaultProfileImage,
      activeTab,
      tabs,
      scrollToSection,
      aboutSection,
      servicesSection,
      reviewsSection,
      addressSection,
    };
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap");

.doctor-details-container {
  font-family: "Inter", sans-serif;
}

.doctor-details-container h2,
.doctor-details-container h3 {
  font-family: "Poppins", sans-serif;
}

.expansion-panel {
  border: 1px solid #e0e0e0;
  overflow: hidden;
}

.expansion-panel h3 {
  cursor: pointer;
}

.tabs a {
  cursor: pointer;
}

.slide-up-fade-enter-active,
.slide-up-fade-leave-active {
  transition: all 0.5s ease;
}

.slide-up-fade-enter-from,
.slide-up-fade-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
