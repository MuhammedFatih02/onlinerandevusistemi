<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-2xl font-semibold text-gray-800 mb-6">Tıbbi Geçmiş</h3>
    <div v-if="isLoading" class="text-center py-4">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"
      ></div>
    </div>
    <div v-else-if="userStore.user" class="space-y-6">
      <div v-if="!isEditMode && userStore.user.medicalHistory" class="mb-6">
        <h4 class="text-lg font-medium mb-2 text-gray-700">
          Mevcut Tıbbi Geçmiş
        </h4>
        <p
          class="text-gray-600 bg-gray-50 p-4 rounded-md border border-gray-200"
        >
          {{ formattedMedicalHistory }}
        </p>
      </div>

      <form
        v-if="isEditMode"
        @submit.prevent="updateMedicalHistory"
        class="space-y-4"
      >
        <div>
          <label
            for="medicalHistory"
            class="block text-sm font-medium text-gray-700 mb-1"
            >Tıbbi Geçmiş Güncelle</label
          >
          <textarea
            id="medicalHistory"
            v-model="newMedicalHistory"
            rows="4"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
          ></textarea>
        </div>
      </form>

      <div class="flex space-x-4">
        <button
          v-if="!isEditMode"
          @click="toggleEditMode"
          class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 flex items-center justify-center"
        >
          <i class="fas fa-edit mr-2"></i> Düzenle
        </button>
        <template v-else>
          <button
            type="submit"
            @click="updateMedicalHistory"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 flex items-center justify-center"
          >
            <i class="fas fa-save mr-2"></i> Güncelle
          </button>
          <button
            type="button"
            @click="toggleEditMode"
            class="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-300 flex items-center justify-center"
          >
            <i class="fas fa-times mr-2"></i> İptal
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useUserStore } from "@/stores/userStore";

export default {
  name: "MedicalHistory",
  setup() {
    const userStore = useUserStore();
    const isEditMode = ref(false);
    const isLoading = ref(true);
    const newMedicalHistory = ref("");

    const formattedMedicalHistory = computed(() => {
      if (!userStore.user) return "";
      if (Array.isArray(userStore.user.medicalHistory)) {
        return userStore.user.medicalHistory.join(", ");
      }
      return userStore.user.medicalHistory || "";
    });

    const toggleEditMode = () => {
      isEditMode.value = !isEditMode.value;
      if (isEditMode.value) {
        newMedicalHistory.value = userStore.user.medicalHistory || "";
      }
    };

    const updateMedicalHistory = async () => {
      try {
        await userStore.updateMedicalHistory(newMedicalHistory.value);
        toggleEditMode();
        // Başarılı güncelleme mesajı göster
      } catch (error) {
        console.error("Tıbbi geçmiş güncellenirken hata oluştu:", error);
        // Hata mesajı göster
      }
    };

    onMounted(async () => {
      try {
        await userStore.getProfile();
      } catch (error) {
        console.error("Kullanıcı profili yüklenirken hata oluştu:", error);
      } finally {
        isLoading.value = false;
      }
    });

    return {
      userStore,
      newMedicalHistory,
      updateMedicalHistory,
      isEditMode,
      toggleEditMode,
      formattedMedicalHistory,
      isLoading,
    };
  },
};
</script>