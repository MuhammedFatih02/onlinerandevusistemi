<template>
  <nav class="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <img class="h-8 w-auto" src="" alt="Logo" />
          </div>
          <div class="hidden md:block">
            <div class="ml-10 flex items-baseline space-x-4">
              <router-link
                v-for="(item, index) in navItems"
                :key="index"
                :to="item.to"
                custom
                v-slot="{ navigate, isActive }"
              >
                <a
                  @click="navigate"
                  :class="[
                    isActive ? 'bg-blue-700' : 'hover:bg-blue-700',
                    'text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out',
                  ]"
                >
                  {{ item.name }}
                </a>
              </router-link>
            </div>
          </div>
        </div>
        <div class="hidden md:block">
          <div class="ml-4 flex items-center md:ml-6">
            <div class="text-white">
              <p class="text-sm font-medium font-inter">
                Hoş geldiniz, {{ userStore.fullName }}
              </p>
              <p class="text-xs opacity-75 font-roboto">{{ greeting }}</p>
            </div>
            <div class="ml-3 relative">
              <div>
                <button
                  @click="toggleDropdown"
                  class="max-w-xs bg-blue-700 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 focus:ring-white transition-all duration-300"
                  id="user-menu"
                  aria-haspopup="true"
                >
                  <span class="sr-only">Kullanıcı menüsünü aç</span>
                  <i class="fas fa-user-circle text-white text-2xl p-2"></i>
                </button>
              </div>
              <transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div
                  v-if="isDropdownOpen"
                  class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu"
                >
                  <router-link
                    v-for="(item, index) in dropdownItems"
                    :key="index"
                    :to="item.to"
                    custom
                    v-slot="{ navigate }"
                  >
                    <a
                      @click="item.action ? item.action(navigate) : navigate()"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-all duration-300"
                      role="menuitem"
                    >
                      {{ item.name }}
                    </a>
                  </router-link>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { ref, computed } from "vue";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "vue-router";

export default {
  name: "Navbar",
  setup() {
    const userStore = useUserStore();
    const router = useRouter();
    const isDropdownOpen = ref(false);

    const greeting = computed(() => {
      const hour = new Date().getHours();
      if (hour < 12) return "Günaydın";
      if (hour < 18) return "İyi günler";
      return "İyi akşamlar";
    });

    const toggleDropdown = () => {
      isDropdownOpen.value = !isDropdownOpen.value;
    };

    const logout = (navigate) => {
      userStore.logout();
      navigate("/login"); // Örnek yönlendirme
    };

    const navItems = [
      { name: "Ana Sayfa", to: "/doctor" },
      { name: "Randevular", to: "/doctor/appointments" },
      { name: "Hastalar", to: "/doctor/patients" },
      { name: "İstatistikler", to: "/doctor/statistics" },
    ];

    const dropdownItems = [
      { name: "Profil", to: "/doctor/profile" },
      { name: "Ayarlar", to: "/doctor/settings" },
      { name: "Çıkış Yap", to: "/login", action: logout },
    ];

    return {
      userStore,
      isDropdownOpen,
      greeting,
      toggleDropdown,
      logout,
      navItems,
      dropdownItems,
    };
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500&display=swap");

.font-inter {
  font-family: "Inter", sans-serif;
}

.font-roboto {
  font-family: "Roboto", sans-serif;
}
</style>
