<template>
  <div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4"
  >
    <div
      class="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 transition-all duration-300 ease-in-out transform hover:scale-102 hover:shadow-2xl"
    >
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 font-inter">Giriş Yap</h1>
        <p class="mt-2 text-base text-gray-600 font-roboto">
          Hesabınıza erişim sağlayın
        </p>
      </div>
      <form @submit.prevent="handleLogin" class="space-y-6">
        <div class="space-y-2">
          <label
            for="email"
            class="block text-sm font-medium text-gray-700 font-inter"
            >E-posta</label
          >
          <input
            type="email"
            id="email"
            v-model="email"
            required
            class="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 font-roboto"
            placeholder="ornek@email.com"
          />
        </div>
        <div class="space-y-2">
          <label
            for="password"
            class="block text-sm font-medium text-gray-700 font-inter"
            >Şifre</label
          >
          <div class="relative">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              required
              class="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 font-roboto"
              placeholder="••••••••"
            />
            <button
              type="button"
              @click="togglePassword"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember_me"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition duration-200"
            />
            <label
              for="remember_me"
              class="ml-2 block text-sm text-gray-700 font-roboto"
              >Beni Hatırla</label
            >
          </div>
          <div class="text-sm">
            <router-link
              to="/forgot-password"
              class="font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200 font-inter"
            >
              Şifremi Unuttum?
            </router-link>
          </div>
        </div>
        <button
          type="submit"
          :disabled="isLoading"
          class="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 ease-in-out transform hover:scale-102 font-inter"
        >
          <span v-if="!isLoading">Giriş Yap</span>
          <i v-else class="fas fa-circle-notch fa-spin"></i>
        </button>
      </form>
      <p v-if="error" class="mt-4 text-red-600 text-center font-roboto">
        {{ error }}
      </p>
      <div class="mt-8">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500 font-roboto"
              >Veya şununla giriş yap</span
            >
          </div>
        </div>
        <div class="mt-6 grid grid-cols-2 gap-3">
          <a
            href="#"
            class="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition duration-200 ease-in-out transform hover:scale-102"
          >
            <i class="fab fa-google text-red-500 text-lg"></i>
          </a>
          <a
            href="#"
            class="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition duration-200 ease-in-out transform hover:scale-102"
          >
            <i class="fab fa-facebook-f text-blue-600 text-lg"></i>
          </a>
        </div>
      </div>
      <p class="mt-8 text-center text-sm text-gray-600 font-roboto">
        Hesabınız yok mu?
        <router-link
          to="/register"
          class="font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200 font-inter"
        >
          Kayıt Ol
        </router-link>
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

    const email = ref("");
    const password = ref("");
    const error = ref("");
    const showPassword = ref(false);

    const handleLogin = async () => {
      try {
        error.value = ""; // Hata mesajını sıfırla
        await userStore.login({ email: email.value, password: password.value });
        const token = userStore.token;
        if (token) {
          localStorage.setItem("token", token);
        }

        // Rol kontrolü yaparak yönlendirme
        if (userStore.isDoctor) {
          router.push("/doctor");
        } else if (userStore.isPatient) {
          router.push("/patient");
        } else {
          router.push("/profile"); // Eğer rol yoksa profile yönlendirilir
        }
      } catch (err) {
        if (err.response && err.response.data && err.response.data.message) {
          error.value = err.response.data.message;
        } else {
          error.value = err.message || "Giriş yapılırken bir hata oluştu";
        }
      }
    };

    const togglePassword = () => {
      showPassword.value = !showPassword.value;
    };

    return {
      email,
      password,
      error,
      isLoading: userStore.isLoading,
      handleLogin,
      showPassword,
      togglePassword,
    };
  },
};
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500&display=swap");

.font-inter {
  font-family: "Inter", sans-serif;
}

.font-roboto {
  font-family: "Roboto", sans-serif;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}
</style>
