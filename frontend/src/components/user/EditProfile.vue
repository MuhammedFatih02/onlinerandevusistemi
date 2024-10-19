<template>
  <div class="bg-white rounded-lg shadow-md p-8">
    <div v-if="isLoading" class="text-center py-4">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"
      ></div>
      <p class="text-gray-600 mt-2">Profil bilgileri yükleniyor...</p>
    </div>
    <div v-else-if="user" class="space-y-8">
      <h3 class="text-3xl font-semibold text-gray-800 mb-6 border-b pb-2">
        {{ isEditMode ? "Profili Düzenle" : "Profil Bilgileri" }}
      </h3>
      <div v-if="!isEditMode" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          v-for="(value, key) in displayUserInfo"
          :key="key"
          class="bg-gray-50 p-5 rounded-lg shadow-sm hover:shadow-md transition duration-300"
        >
          <p class="text-gray-700">
            <span class="font-semibold text-gray-900"
              >{{ labels[key] || key }}:</span
            >
            {{ formatValue(key, value) }}
          </p>
        </div>
      </div>

      <form v-else @submit.prevent="updateProfile" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="(value, key) in editableUserInfo"
            :key="key"
            class="bg-gray-50 p-4 rounded-lg"
          >
            <label
              :for="key"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              {{ labels[key] || key }}
              <span v-if="requiredFields.includes(key)" class="text-red-500">
                (Zorunlu)
              </span>
            </label>
            <input
              v-if="
                ![
                  'gender',
                  'medicalHistory',
                  'allergies',
                  'currentMedications',
                ].includes(key)
              "
              :id="key"
              v-model="form[key]"
              :type="inputTypes[key] || 'text'"
              :required="requiredFields.includes(key)"
              :class="[
                'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-300',
                { 'phone-input': key === 'phone' },
              ]"
              @input="key === 'phone' ? formatPhoneNumber($event) : null"
            />
            <select
              v-else-if="key === 'gender'"
              :id="key"
              v-model="form[key]"
              :required="requiredFields.includes(key)"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
            >
              <option value="">Seçiniz</option>
              <option value="male">Erkek</option>
              <option value="female">Kadın</option>
            </select>
            <textarea
              v-else
              :id="key"
              v-model="form[key]"
              :required="requiredFields.includes(key)"
              rows="3"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
            ></textarea>
          </div>
          <!-- Mevcut şifre alanı -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <label
              for="currentPassword"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Mevcut Şifre <span class="text-red-500">(Zorunlu)</span>
            </label>
            <div class="relative">
              <input
                id="currentPassword"
                v-model="form.currentPassword"
                :type="showCurrentPassword ? 'text' : 'password'"
                required
                placeholder="Mevcut şifrenizi girin"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
              />
              <button
                type="button"
                @click="toggleCurrentPasswordVisibility"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <i
                  :class="
                    showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'
                  "
                ></i>
              </button>
            </div>
          </div>
          <!-- Yeni şifre alanı -->
          <div class="bg-gray-50 p-4 rounded-lg">
            <label
              for="newPassword"
              class="block text-sm font-medium text-gray-700 mb-1"
            >
              Yeni Şifre
            </label>
            <div class="relative">
              <input
                id="newPassword"
                v-model="form.newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                placeholder="Yeni şifrenizi girin (opsiyonel)"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
              />
              <button
                type="button"
                @click="toggleNewPasswordVisibility"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <i
                  :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
                ></i>
              </button>
            </div>
          </div>
        </div>
        <div class="space-y-4">
          <h4 class="font-semibold text-gray-800 text-lg">Sigorta Bilgileri</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(value, key) in form.sigortaBilgileri"
              :key="key"
              class="bg-gray-50 p-4 rounded-lg"
            >
              <label
                :for="'sigorta-' + key"
                class="block text-sm font-medium text-gray-700 mb-1"
              >
                {{ labels[key] || key }}
              </label>
              <input
                :id="'sigorta-' + key"
                v-model="form.sigortaBilgileri[key]"
                type="text"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
              />
            </div>
          </div>
        </div>
      </form>

      <div class="flex space-x-4 pt-4">
        <button
          v-if="!isEditMode"
          @click="toggleEditMode"
          class="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 transition duration-300 flex items-center justify-center text-lg font-semibold"
        >
          <i class="fas fa-edit mr-2"></i> Düzenle
        </button>
        <template v-else>
          <button
            type="submit"
            @click="updateProfile"
            class="w-full bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 transition duration-300 flex items-center justify-center text-lg font-semibold"
          >
            <i class="fas fa-save mr-2"></i> Değişiklikleri Kaydet
          </button>
          <button
            type="button"
            @click="toggleEditMode"
            class="w-full bg-gray-600 text-white py-3 px-6 rounded-md hover:bg-gray-700 transition duration-300 flex items-center justify-center text-lg font-semibold"
          >
            <i class="fas fa-times mr-2"></i> İptal
          </button>
        </template>
      </div>
    </div>
    <div v-else class="text-center py-4">
      <p class="text-red-500">Profil bilgileri yüklenemedi.</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores/userStore";

export default {
  name: "EditProfile",
  setup() {
    const userStore = useUserStore();
    const { user, isLoading } = storeToRefs(userStore);

    const isEditMode = ref(false);
    const showCurrentPassword = ref(false);
    const showNewPassword = ref(false);
    const form = ref({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      address: "",
      currentPassword: "",
      newPassword: "",
      sigortaBilgileri: {
        sigortaSirketi: "",
        policeNumarasi: "",
      },
      medicalHistory: "",
      allergies: "",
      currentMedications: "",
    });

    const labels = {
      firstName: "Ad",
      lastName: "Soyad",
      email: "E-posta",
      phone: "Telefon",
      dateOfBirth: "Doğum Tarihi",
      gender: "Cinsiyet",
      address: "Adres",
      sigortaSirketi: "Sigorta Şirketi",
      policeNumarasi: "Poliçe Numarası",
      lastLogin: "Son Giriş",
      medicalHistory: "Tıbbi Geçmiş",
      allergies: "Alerjiler",
      currentMedications: "Mevcut İlaçlar",
      createdAt: "Oluşturulma Tarihi",
    };

    const inputTypes = {
      email: "email",
      dateOfBirth: "date",
      phone: "tel",
    };

    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "currentPassword",
    ];

    const displayUserInfo = computed(() => {
      if (!user.value) return {};
      const {
        password,
        __v,
        favoriteHekimler,
        reviews,
        _id,
        role,
        updatedAt,
        ...displayInfo
      } = user.value;
      return displayInfo;
    });

    const editableUserInfo = computed(() => {
      const { createdAt, lastLogin, ...editableInfo } = displayUserInfo.value;
      return editableInfo;
    });

    const formatValue = (key, value) => {
      if (key === "dateOfBirth" || key === "lastLogin" || key === "createdAt") {
        return value
          ? new Date(value).toLocaleString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Belirtilmemiş";
      }
      if (key === "gender") {
        const genderMap = { male: "Erkek", female: "Kadın", other: "Diğer" };
        return genderMap[value] || "Belirtilmemiş";
      }
      if (Array.isArray(value)) {
        return value.join(", ") || "Belirtilmemiş";
      }
      if (typeof value === "object" && value !== null) {
        return Object.values(value).join(", ") || "Belirtilmemiş";
      }
      return value || "Belirtilmemiş";
    };

    const formatPhoneNumber = (event) => {
      let input = event.target.value.replace(/\D/g, "");
      if (input.length > 0) {
        if (input.length > 11) {
          input = input.slice(0, 10);
        }
        if (input[0] !== "0") {
          input = "0" + input;
        }
        const match = input.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/);
        if (match) {
          event.target.value = `${match[1]} (${match[2]}) ${match[3]} ${match[4]} ${match[5]}`;
        } else {
          event.target.value = input;
        }
      }
    };

    const toggleCurrentPasswordVisibility = () => {
      showCurrentPassword.value = !showCurrentPassword.value;
    };

    const toggleNewPasswordVisibility = () => {
      showNewPassword.value = !showNewPassword.value;
    };

    const isFormValid = computed(() => {
      return requiredFields.every(
        (field) => form.value[field] && form.value[field].trim() !== ""
      );
    });

    const checkRequiredFields = () => {
      const missingFields = requiredFields.filter(
        (field) => !form.value[field] || form.value[field].trim() === ""
      );
      if (missingFields.length > 0) {
        const missingFieldLabels = missingFields
          .map((field) => labels[field] || field)
          .join(", ");
        alert(`Lütfen zorunlu alanları doldurunuz: ${missingFieldLabels}`);
        return false;
      }
      return true;
    };
    watch(
      user,
      (newUser) => {
        if (newUser) {
          console.log("Kullanıcı bilgileri güncellendi:", newUser);
          form.value = {
            ...newUser,
            dateOfBirth: newUser.dateOfBirth
              ? new Date(newUser.dateOfBirth).toISOString().split("T")[0]
              : "",
            currentPassword: "",
            newPassword: "",
            medicalHistory: Array.isArray(newUser.medicalHistory)
              ? newUser.medicalHistory.join("\n")
              : "",
            allergies: Array.isArray(newUser.allergies)
              ? newUser.allergies.join("\n")
              : "",
            currentMedications: Array.isArray(newUser.currentMedications)
              ? newUser.currentMedications.join("\n")
              : "",
            sigortaBilgileri: newUser.sigortaBilgileri || {
              sigortaSirketi: "",
              policeNumarasi: "",
            },
          };
        }
      },
      { immediate: true, deep: true }
    );

    const toggleEditMode = () => {
      console.log("Düzenleme modu değiştiriliyor");
      isEditMode.value = !isEditMode.value;
      if (isEditMode.value) {
        form.value.currentPassword = ""; // Düzenleme moduna geçildiğinde mevcut şifre alanını temizle
        form.value.newPassword = ""; // Yeni şifre alanını da temizle
      }
    };

    const updateProfile = async () => {
      if (!checkRequiredFields()) {
        return;
      }

      try {
        console.log("Profil güncelleme başlatılıyor...");
        const profileData = { ...form.value };

        // Şifre değişikliği varsa, hem mevcut hem de yeni şifreyi gönder
        if (profileData.newPassword && profileData.newPassword.trim() !== "") {
          profileData.currentPassword = profileData.currentPassword.trim();
          profileData.newPassword = profileData.newPassword.trim();
        } else {
          delete profileData.currentPassword;
          delete profileData.newPassword;
        }

        profileData.medicalHistory = profileData.medicalHistory
          .split("\n")
          .filter((item) => item.trim() !== "");
        profileData.allergies = profileData.allergies
          .split("\n")
          .filter((item) => item.trim() !== "");
        profileData.currentMedications = profileData.currentMedications
          .split("\n")
          .filter((item) => item.trim() !== "");

        await userStore.updateProfile(profileData);
        console.log("Profil başarıyla güncellendi");
        isEditMode.value = false;
        alert("Profil başarıyla güncellendi.");
      } catch (error) {
        console.error("Profil güncelleme hatası:", error);
        alert("Profil güncellenirken bir hata oluştu.");
      }
    };

    onMounted(() => {
      console.log("EditProfile bileşeni monte edildi");
    });

    return {
      form,
      updateProfile,
      user,
      isLoading,
      isEditMode,
      toggleEditMode,
      displayUserInfo,
      editableUserInfo,
      labels,
      inputTypes,
      formatValue,
      requiredFields,
      formatPhoneNumber,
      isFormValid,
      showCurrentPassword,
      showNewPassword,
      toggleCurrentPasswordVisibility,
      toggleNewPasswordVisibility,
      checkRequiredFields,
    };
  },
};
</script>

<style scoped>
.phone-input {
  letter-spacing: 1px;
}
</style>