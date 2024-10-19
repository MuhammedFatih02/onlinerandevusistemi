<!-- src/views/Register.vue -->
<template>
  <div class="min-h-screen bg-white flex items-center justify-center p-4">
    <div
      class="w-full max-w-md bg-white shadow-lg rounded-lg p-8 transition-all duration-300 ease-in-out transform hover:scale-105"
    >
      <div class="text-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Kayıt Ol</h2>
      </div>
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label for="firstName" class="block text-sm font-medium text-gray-700"
            >Ad:</label
          >
          <input
            type="text"
            id="firstName"
            v-model="firstName"
            required
            class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label for="lastName" class="block text-sm font-medium text-gray-700"
            >Soyad:</label
          >
          <input
            type="text"
            id="lastName"
            v-model="lastName"
            required
            class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700"
            >E-posta:</label
          >
          <input
            type="email"
            id="email"
            v-model="email"
            required
            class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700"
            >Şifre:</label
          >
          <div class="relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              required
              class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              @click="togglePassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
            >
              <i
                :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
                class="text-gray-400"
              ></i>
            </button>
          </div>
        </div>
        <div class="flex items-center">
          <input
            id="terms"
            type="checkbox"
            required
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label for="terms" class="ml-2 block text-sm text-gray-900">
            Kullanım şartlarını ve gizlilik politikasını kabul ediyorum
          </label>
        </div>
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
        >
          <span v-if="!isLoading">Kayıt Ol</span>
          <i v-else class="fas fa-spinner fa-spin"></i>
        </button>
      </form>
      <p v-if="error" class="mt-4 text-red-500 text-center">{{ error }}</p>
      <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">Veya şununla kaydol</span>
          </div>
        </div>
        <div class="mt-6 grid grid-cols-2 gap-3">
          <div>
            <a
              href="#"
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <i class="fab fa-google text-red-500"></i>
            </a>
          </div>
          <div>
            <a
              href="#"
              class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <i class="fab fa-facebook-f text-blue-600"></i>
            </a>
          </div>
        </div>
      </div>
      <p class="mt-6 text-center text-sm text-gray-600">
        Zaten hesabınız var mı?
        <router-link
          to="/login"
          class="font-medium text-blue-600 hover:text-blue-500"
          >Giriş Yap</router-link
        >
      </p>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useUserStore } from "@/stores/userStore";
import { useRouter } from "vue-router";

export default {
  setup() {
    const userStore = useUserStore();
    const router = useRouter();

    const firstName = ref("");
    const lastName = ref("");
    const email = ref("");
    const password = ref("");
    const error = ref("");
    const showPassword = ref(false);

    const handleRegister = async () => {
      try {
        await userStore.register({
          firstName: firstName.value,
          lastName: lastName.value,
          email: email.value,
          password: password.value,
        });
        router.push("/login");
      } catch (err) {
        error.value = err.message || "Kayıt olurken bir hata oluştu";
      }
    };

    const togglePassword = () => {
      showPassword.value = !showPassword.value;
    };

    return {
      firstName,
      lastName,
      email,
      password,
      error,
      isLoading: userStore.isLoading,
      handleRegister,
      showPassword,
      togglePassword,
    };
  },
};
</script>