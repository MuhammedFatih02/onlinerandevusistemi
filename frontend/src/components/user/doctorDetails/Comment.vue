<template>
  <div
    class="bg-white shadow-md rounded-lg p-6 max-w-3xl mx-auto my-8 hover:shadow-lg transition-shadow duration-300"
  >
    <h2 class="text-2xl font-semibold text-gray-800 mb-6">
      <i class="fas fa-comments mr-2 text-blue-600"></i>Yorumlar ve
      Değerlendirmeler
    </h2>

    <!-- Yorum Formu (Sadece hastalar için) -->
    <div v-if="userStore.isPatient" class="mb-8">
      <form @submit.prevent="submitComment" class="space-y-4">
        <div class="flex items-center">
          <label for="rating" class="mr-2 text-sm font-medium text-gray-700"
            >Değerlendirme:</label
          >
          <div class="flex">
            <div v-for="star in 5" :key="star">
              <button
                type="button"
                @click="rating = star"
                :class="[
                  'text-2xl focus:outline-none transition-colors duration-200',
                  rating >= star
                    ? 'text-yellow-400'
                    : 'text-gray-300 hover:text-yellow-200',
                ]"
              >
                <span class="sr-only">{{ star }} yıldız</span>
                ★
              </button>
            </div>
          </div>
        </div>

        <div>
          <textarea
            v-model="commentText"
            rows="3"
            class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            placeholder="Yorumunuzu buraya yazın..."
          ></textarea>
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
            :disabled="loading"
          >
            {{ loading ? "Gönderiliyor..." : "Gönder" }}
          </button>
        </div>
      </form>
    </div>

    <!-- Yorum Listesi -->
    <div class="space-y-6">
      <div
        v-for="comment in comments"
        :key="comment._id"
        :class="[
          'p-4 rounded-lg border transition-all duration-200',
          comment.patient._id === userStore.user?._id
            ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
            : 'bg-gray-50 border-gray-200 hover:bg-gray-100',
        ]"
      >
        <div class="flex justify-between items-start mb-2">
          <div>
            <h4 class="text-md font-semibold text-gray-800">
              {{ comment.patient.firstName }} {{ comment.patient.lastName }}
            </h4>
            <div class="flex items-center mt-1">
              <span class="text-yellow-400 mr-1">★</span>
              <span class="text-sm text-gray-600">{{ comment.rating }}/5</span>
            </div>
          </div>
          <span class="text-xs text-gray-500">{{
            formatDate(comment.createdAt)
          }}</span>
        </div>

        <!-- Yorum Metni -->
        <p
          v-if="editingCommentId !== comment._id"
          class="text-gray-700 text-sm mb-2"
        >
          {{ comment.text }}
        </p>

        <!-- Güncelleme Formu -->
        <div v-else class="mb-2">
          <textarea
            v-model="editCommentText"
            rows="3"
            class="w-full px-3 py-2 text-sm text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          ></textarea>
          <div class="flex justify-end space-x-2 mt-2">
            <button
              @click="cancelEdit"
              class="px-3 py-1 text-xs border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              İptal
            </button>
            <button
              @click="updateComment(comment._id)"
              class="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
            >
              Güncelle
            </button>
          </div>
        </div>

        <!-- Doktor Yanıtı -->
        <div
          v-if="comment.doctorResponse"
          class="mt-3 p-3 bg-green-50 rounded-md border border-green-200"
        >
          <p class="text-sm font-semibold text-green-800 mb-1">
            Doktor Yanıtı:
          </p>
          <p class="text-sm text-gray-700">{{ comment.doctorResponse }}</p>
        </div>

        <!-- Düzenleme Butonu -->
        <div
          v-if="
            comment.patient._id === userStore.user?._id &&
            editingCommentId !== comment._id
          "
          class="mt-2 flex justify-end"
        >
          <button
            @click="startEdit(comment)"
            class="text-xs text-blue-600 hover:text-blue-800 focus:outline-none transition-colors duration-200"
          >
            Düzenle
          </button>
        </div>
      </div>
    </div>

    <!-- Hata Mesajı -->
    <div
      v-if="error"
      class="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm animate-pulse"
    >
      <p class="font-bold">Hata</p>
      <p>{{ error }}</p>
    </div>

    <!-- Başarı Mesajı -->
    <div
      v-if="success"
      class="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm animate-pulse"
    >
      <p class="font-bold">Başarılı!</p>
      <p>{{ successMessage }}</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from "vue";
import { useCommentStore } from "@/stores/commentStore";
import { useUserStore } from "@/stores/userStore";
import { useRoute } from "vue-router";

export default {
  name: "EnhancedCommentComponent",
  setup() {
    const commentStore = useCommentStore();
    const userStore = useUserStore();
    const route = useRoute();

    const rating = ref(0);
    const commentText = ref("");
    const loading = ref(false);
    const error = ref(null);
    const success = ref(false);
    const successMessage = ref("");
    const editingCommentId = ref(null);
    const editCommentText = ref("");

    const doctorId = computed(() => route.params.id);
    const comments = computed(() => commentStore.comments);

    onMounted(async () => {
      try {
        await commentStore.fetchComments({ doctorId: doctorId.value });
      } catch (err) {
        error.value = "Yorumlar yüklenirken bir hata oluştu.";
      }
    });

    const submitComment = async () => {
      if (rating.value === 0 || !commentText.value.trim()) {
        error.value = "Lütfen bir değerlendirme ve yorum ekleyin.";
        return;
      }

      loading.value = true;
      error.value = null;
      success.value = false;

      try {
        await commentStore.addComment({
          doctorId: doctorId.value,
          text: commentText.value,
          rating: rating.value,
        });
        success.value = true;
        successMessage.value =
          "Yorumunuz başarıyla gönderildi. Teşekkür ederiz!";
        rating.value = 0;
        commentText.value = "";
        await commentStore.fetchComments({ doctorId: doctorId.value });
      } catch (err) {
        error.value = err.message || "Yorum gönderilirken bir hata oluştu.";
      } finally {
        loading.value = false;
      }
    };

    const startEdit = (comment) => {
      editingCommentId.value = comment._id;
      editCommentText.value = comment.text;
    };

    const cancelEdit = () => {
      editingCommentId.value = null;
      editCommentText.value = "";
    };

    const updateComment = async (commentId) => {
      loading.value = true;
      error.value = null;
      success.value = false;

      try {
        await commentStore.updateComment({
          commentId,
          text: editCommentText.value,
          rating: rating.value,
        });
        success.value = true;
        successMessage.value = "Yorumunuz başarıyla güncellendi.";
        editingCommentId.value = null;
        await commentStore.fetchComments({ doctorId: doctorId.value });
      } catch (err) {
        error.value = err.message || "Yorum güncellenirken bir hata oluştu.";
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (dateString) => {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString("tr-TR", options);
    };

    return {
      rating,
      commentText,
      loading,
      error,
      success,
      successMessage,
      comments,
      submitComment,
      userStore,
      editingCommentId,
      editCommentText,
      startEdit,
      cancelEdit,
      updateComment,
      formatDate,
    };
  },
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap");

div {
  font-family: "Roboto", sans-serif;
}

h2,
h4 {
  font-family: "Inter", sans-serif;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}
</style>