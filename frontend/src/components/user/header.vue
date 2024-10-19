<template>
  <header class="bg-white shadow-md">
    <div class="container mx-auto px-4 py-3 flex items-center justify-between">
      <!-- Logo -->
      <div class="flex items-center">
        <span class="ml-2 text-xl font-semibold text-blue-600">DentaCare</span>
      </div>

      <!-- Navigation -->
      <nav class="hidden md:flex space-x-6">
        <router-link to="/" class="text-gray-600 hover:text-blue-600 transition"
          >Ana Sayfa</router-link
        >
        <router-link to="" class="text-gray-600 hover:text-blue-600 transition"
          >Hizmetler</router-link
        >
        <router-link
          to="/doctors"
          class="text-gray-600 hover:text-blue-600 transition"
          >Doktorlar</router-link
        >
        <router-link to="" class="text-gray-600 hover:text-blue-600 transition"
          >İletişim</router-link
        >
      </nav>

      <!-- Right Side Items -->
      <div class="flex items-center space-x-4">
        <!-- Login/Register Button veya Profil İkonu -->
        <div v-if="!userStore.isLoggedIn" class="flex space-x-2">
          <router-link
            to="/login"
            class="text-blue-600 hover:text-blue-700 transition"
          >
            <i class="fas fa-sign-in-alt mr-2"></i>Giriş
          </router-link>
          <router-link
            to="/register"
            class="text-blue-600 hover:text-blue-700 transition"
          >
            <i class="fas fa-user-plus mr-2"></i>Kayıt
          </router-link>
        </div>

        <!-- User Avatar (if logged in) -->
        <div v-else class="relative">
          <img
            @click="toggleProfileMenu"
            alt="User Avatar"
            class="h-10 w-10 rounded-full cursor-pointer"
          />
          <!-- Profile Dropdown Menu -->
          <div
            v-if="showProfileMenu"
            class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1"
          >
            <router-link
              to="/profile"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >Profil</router-link
            >
            <a
              href="#"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >Randevularım</a
            >
            <a
              href="#"
              @click="logout"
              class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >Çıkış Yap</a
            >
          </div>
        </div>
        <!-- Mobile Menu Button -->
        <button
          @click="toggleMobileMenu"
          class="md:hidden text-gray-500 hover:text-blue-600 transition"
        >
          <i class="fas fa-bars text-2xl"></i>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div v-if="showMobileMenu" class="md:hidden bg-white border-t">
      <router-link to="/" class="block py-2 px-4 text-sm hover:bg-gray-100"
        >Ana Sayfa</router-link
      >
      <router-link to="" class="block py-2 px-4 text-sm hover:bg-gray-100"
        >Hizmetler</router-link
      >
      <router-link to="" class="block py-2 px-4 text-sm hover:bg-gray-100"
        >Doktorlar</router-link
      >
      <router-link to="" class="block py-2 px-4 text-sm hover:bg-gray-100"
        >İletişim</router-link
      >
      <a href="#" class="block py-2 px-4 text-sm bg-red-500 text-white"
        >Acil Randevu</a
      >
    </div>
  </header>
</template>
  
<script>
import { ref } from "vue";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "vue-router";

export default {
  setup() {
    const userStore = useUserStore();
    const router = useRouter();
    const showProfileMenu = ref(false);
    const showMobileMenu = ref(false);

    const toggleProfileMenu = () => {
      showProfileMenu.value = !showProfileMenu.value;
    };

    const toggleMobileMenu = () => {
      showMobileMenu.value = !showMobileMenu.value;
    };

    const logout = async () => {
      await userStore.logout();
      router.push("/login");
    };

    return {
      userStore,
      showProfileMenu,
      showMobileMenu,
      toggleProfileMenu,
      toggleMobileMenu,
      logout,
    };
  },
};
</script>