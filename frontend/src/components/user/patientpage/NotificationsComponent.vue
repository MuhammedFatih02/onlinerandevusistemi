<template>
  <div
    class="card bg-white shadow-md hover:shadow-lg transition-shadow duration-300"
  >
    <h2 class="text-2xl font-semibold mb-4 text-gray-800 font-inter">
      Bildirimler
    </h2>
    <ul class="space-y-3">
      <li
        v-for="notification in notifications"
        :key="notification.id"
        class="text-sm p-3 bg-gray-100 rounded-lg text-gray-600 font-roboto hover:bg-gray-200 transition-colors duration-200"
      >
        {{ notification.message }}
      </li>
    </ul>
  </div>
</template>
  
  <script>
import { ref } from "vue";

export default {
  name: "NotificationsComponent",
  setup() {
    const notifications = ref([
      {
        id: 1,
        message: "Yarın saat 14:00'de Dr. Ayşe Yılmaz ile randevunuz var.",
      },
      {
        id: 2,
        message:
          "Geçmiş olsun dileriz! Lütfen ilaçlarınızı düzenli kullanmayı unutmayın.",
      },
    ]);

    return {
      notifications,
    };
  },
};
</script>