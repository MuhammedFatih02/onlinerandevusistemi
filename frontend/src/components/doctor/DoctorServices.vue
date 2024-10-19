<template>
  <div class="min-h-screen bg-gradient-to-r from-blue-50 to-white">
    <!-- Başlık -->
    <header class="py-10 bg-white shadow-md">
      <h1 class="text-center text-5xl font-extrabold text-gray-800">
        Doktor Hizmetleri Yönetim Paneli
      </h1>
    </header>

    <!-- Hizmetler Bölümü -->
    <section class="container mx-auto py-12 px-6 md:px-12">
      <h2 class="text-3xl font-bold text-gray-700 mb-8 text-center">
        Mevcut Hizmetler
      </h2>

      <div class="bg-white shadow-lg rounded-lg p-8">
        <!-- Tablo Başlıkları -->
        <table class="table-auto w-full text-left">
          <thead>
            <tr
              class="bg-gradient-to-r from-blue-200 to-indigo-300 text-gray-700"
            >
              <th class="py-4 px-6 font-semibold">Adı</th>
              <th class="py-4 px-6 font-semibold">Açıklama</th>
              <th class="py-4 px-6 font-semibold">Süre</th>
              <th class="py-4 px-6 font-semibold">Fiyat</th>
              <th class="py-4 px-6 font-semibold">Durum</th>
              <th class="py-4 px-6 font-semibold text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody class="text-gray-600">
            <tr
              v-for="service in services"
              :key="service._id"
              class="hover:bg-gray-100 transition duration-300 ease-in-out"
            >
              <td class="py-4 px-6">{{ service.name }}</td>
              <td class="py-4 px-6">{{ service.description }}</td>
              <td class="py-4 px-6">{{ service.duration }} dakika</td>
              <td class="py-4 px-6">{{ service.price }} ₺</td>
              <td class="py-4 px-6">
                {{ service.isActive ? "Aktif" : "Pasif" }}
              </td>
              <td class="py-4 px-6 text-right">
                <button
                  @click="editService(service)"
                  class="text-blue-500 hover:text-blue-700 font-semibold"
                >
                  Düzenle
                </button>
                <button
                  @click="deleteService(service._id)"
                  class="ml-4 text-red-500 hover:text-red-700 font-semibold"
                >
                  Sil
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="services.length === 0" class="text-center text-gray-500 mt-6">
        Henüz hizmet eklenmemiş.
      </div>
    </section>

    <!-- Form Bölümü -->
    <section class="container mx-auto py-12 px-6 md:px-12">
      <div class="bg-white shadow-lg rounded-lg p-8 max-w-lg mx-auto">
        <h2
          v-if="currentService"
          class="text-2xl font-bold text-gray-700 mb-6 text-center"
        >
          Servis Düzenle
        </h2>
        <h2 v-else class="text-2xl font-bold text-gray-700 mb-6 text-center">
          Yeni Servis Ekle
        </h2>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Hizmet Adı -->
          <div>
            <label for="name" class="block text-gray-600 font-medium mb-2"
              >Hizmet Adı</label
            >
            <div class="relative">
              <input
                v-model="form.name"
                type="text"
                id="name"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Hizmet adı giriniz"
                required
              />
              <div
                v-if="errors.name"
                class="absolute right-4 top-3 text-red-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <p v-if="errors.name" class="text-red-600 text-sm mt-2">
              {{ errors.name }}
            </p>
          </div>

          <!-- Açıklama -->
          <div>
            <label
              for="description"
              class="block text-gray-600 font-medium mb-2"
              >Açıklama</label
            >
            <div class="relative">
              <textarea
                v-model="form.description"
                id="description"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Hizmet açıklaması"
                required
              ></textarea>
              <div
                v-if="errors.description"
                class="absolute right-4 top-3 text-red-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <p v-if="errors.description" class="text-red-600 text-sm mt-2">
              {{ errors.description }}
            </p>
          </div>

          <!-- Süre ve Fiyat -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="duration" class="block text-gray-600 font-medium mb-2"
                >Süre (dakika)</label
              >
              <div class="relative">
                <input
                  v-model="form.duration"
                  type="number"
                  id="duration"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Süre giriniz"
                  required
                />
                <div
                  v-if="errors.duration"
                  class="absolute right-4 top-3 text-red-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
              <p v-if="errors.duration" class="text-red-600 text-sm mt-2">
                {{ errors.duration }}
              </p>
            </div>

            <div>
              <label for="price" class="block text-gray-600 font-medium mb-2"
                >Fiyat (₺)</label
              >
              <div class="relative">
                <input
                  v-model="form.price"
                  type="number"
                  id="price"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Fiyat giriniz"
                  required
                />
                <div
                  v-if="errors.price"
                  class="absolute right-4 top-3 text-red-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              </div>
              <p v-if="errors.price" class="text-red-600 text-sm mt-2">
                {{ errors.price }}
              </p>
            </div>
          </div>

          <!-- Aktif Durumu -->
          <div class="flex items-center">
            <input
              v-model="form.isActive"
              type="checkbox"
              id="isActive"
              class="h-6 w-6 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="isActive" class="ml-3 text-gray-600">Aktif mi?</label>
          </div>

          <!-- Gönder Butonu -->
          <button
            type="submit"
            class="w-full py-4 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-700 transition-all duration-300"
          >
            {{ currentService ? "Güncelle" : "Ekle" }}
          </button>
        </form>
      </div>
    </section>
  </div>
</template>

<script>
import { useServiceStore } from "@/stores/serviceStore";
import { reactive, toRefs } from "vue";

export default {
  setup() {
    const serviceStore = useServiceStore();
    const form = reactive({
      name: "",
      description: "",
      duration: null,
      price: null,
      isActive: true,
    });

    const errors = reactive({
      name: "",
      description: "",
      duration: "",
      price: "",
    });

    const validateForm = () => {
      let isValid = true;
      errors.name = "";
      errors.description = "";
      errors.duration = "";
      errors.price = "";

      if (!form.name || form.name.length < 3) {
        errors.name = "Hizmet adı en az 3 karakter olmalıdır.";
        isValid = false;
      }

      if (!form.description || form.description.length < 10) {
        errors.description = "Açıklama en az 10 karakter olmalıdır.";
        isValid = false;
      }

      if (!form.duration || form.duration <= 0) {
        errors.duration = "Süre pozitif bir sayı olmalıdır.";
        isValid = false;
      }

      if (!form.price || form.price <= 0) {
        errors.price = "Fiyat pozitif bir sayı olmalıdır.";
        isValid = false;
      }

      return isValid;
    };

    const handleSubmit = async () => {
      if (!validateForm()) return;

      if (currentService.value) {
        await serviceStore.updateService(currentService.value._id, form);
      } else {
        await serviceStore.createService(form);
      }
      resetForm();
      await serviceStore.fetchServices();
    };

    const resetForm = () => {
      form.name = "";
      form.description = "";
      form.duration = null;
      form.price = null;
      form.isActive = true;
      serviceStore.currentService = null;
    };

    const { services, currentService, loading, error } = toRefs(serviceStore);

    const editService = (service) => {
      form.name = service.name;
      form.description = service.description;
      form.duration = service.duration;
      form.price = service.price;
      form.isActive = service.isActive;
      serviceStore.currentService = service;
    };

    const deleteService = async (id) => {
      await serviceStore.deleteService(id);
      await serviceStore.fetchServices();
    };

    serviceStore.fetchServices();

    return {
      services,
      currentService,
      loading,
      error,
      form,
      errors,
      handleSubmit,
      editService,
      deleteService,
    };
  },
};
</script>

<style scoped>
/* Tailwind CSS kullanarak responsive premium bir tasarım yapıldı */
</style>
