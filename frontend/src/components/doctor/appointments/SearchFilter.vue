<template>
  <div class="mb-6 flex flex-wrap items-center justify-between">
    <div class="w-full md:w-1/3 mb-4 md:mb-0">
      <input
        v-model="localSearchTerm"
        @input="$emit('update-search', localSearchTerm)"
        placeholder="Hasta ara..."
        class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div class="w-full md:w-1/3">
      <select
        v-model="localFilterStatus"
        @change="$emit('update-status', localFilterStatus)"
        class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Tüm Durumlar</option>
        <option value="planlandı">Beklemede</option>
        <option value="completed">Tamamlandı</option>
        <option value="cancelled">İptal Edildi</option>
      </select>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    searchTerm: {
      type: String,
      default: "",
    },
    filterStatus: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      localSearchTerm: this.searchTerm,
      localFilterStatus: this.filterStatus,
    };
  },
  watch: {
    searchTerm(newVal) {
      this.localSearchTerm = newVal;
    },
    filterStatus(newVal) {
      this.localFilterStatus = newVal;
    },
  },
};
</script>
