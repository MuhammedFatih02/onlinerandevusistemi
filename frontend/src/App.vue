<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useAppointmentStore } from "@/stores/appointmentStore";

const appointmentStore = useAppointmentStore();

onMounted(() => {
  appointmentStore.setupSocketListeners();
});
</script>

<style>
/* Global styles */
</style>