<template>
  <div class="bg-white rounded-lg shadow-lg p-6 mb-8">
    <h2 class="text-2xl font-bold text-gray-800 mb-4">
      Kullanıcı Bilgileri Özeti
    </h2>
    <div
      v-if="isLoggedIn && user"
      class="grid grid-cols-1 md:grid-cols-2 gap-4"
    >
      <div>
        <p class="text-gray-600">
          <span class="font-semibold">Ad:</span>
          {{ user.firstName || "Bilgi yok" }}
        </p>
        <p class="text-gray-600">
          <span class="font-semibold">Soyad:</span>
          {{ user.lastName || "Bilgi yok" }}
        </p>
        <p class="text-gray-600">
          <span class="font-semibold">E-posta:</span>
          {{ user.email || "Bilgi yok" }}
        </p>
        <p class="text-gray-600">
          <span class="font-semibold">Rol:</span>
          {{ capitalizeFirstLetter(user.role) }}
        </p>
      </div>
      <div>
        <p class="text-gray-600">
          <span class="font-semibold">Hesap Oluşturma:</span>
          {{ formatDate(user.createdAt) }}
        </p>
        <p class="text-gray-600">
          <span class="font-semibold">Son Güncelleme:</span>
          {{ formatDate(user.updatedAt) }}
        </p>
        <div
          v-if="user.favoriteHekimler && user.favoriteHekimler.length > 0"
          class="mt-4"
        >
          <h3 class="text-lg font-semibold text-gray-700 mb-2">
            Favori Hekimler
          </h3>
          <ul class="list-disc list-inside">
            <li
              v-for="hekimId in user.favoriteHekimler"
              :key="hekimId"
              class="text-gray-600"
            >
              {{ hekimId }}
            </li>
          </ul>
        </div>
      </div>
    </div>
    <p v-else class="text-red-500">
      Lütfen giriş yapın veya kullanıcı bilgileri yüklenemiyor.
    </p>
  </div>
</template>

<script>
import { useUserStore } from "@/stores/userStore.js";
import { computed, onMounted, watch } from "vue";

export default {
  name: "UserInfoSummary",
  setup() {
    const userStore = useUserStore();

    const formatDate = (dateString) => {
      if (!dateString) return "Tarih bilgisi yok";
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return new Date(dateString).toLocaleDateString("tr-TR", options);
    };

    const capitalizeFirstLetter = (string) => {
      if (!string) return "Belirtilmemiş";
      return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const isLoggedIn = computed(() => userStore.isLoggedIn);
    const user = computed(() => userStore.user);

    onMounted(() => {
      console.log("UserInfoSummary bileşeni monte edildi");
    });

    watch(
      () => userStore.user,
      (newUser) => {
        console.log("Kullanıcı bilgileri güncellendi:", newUser);
      },
      { deep: true }
    );

    return {
      isLoggedIn,
      user,
      formatDate,
      capitalizeFirstLetter,
    };
  },
};
</script>