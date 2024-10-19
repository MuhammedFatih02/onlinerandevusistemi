<template>
  <div id="doctor-layout">
    <doctorNavbar class="mb-5" />
    <router-view></router-view>
  </div>
</template>

<script>
import doctorNavbar from "@/components/doctor/doctorNavbar.vue";
export default {
  name: "DoctorLayout",
  components: {
    doctorNavbar,
  },
};
</script>

<style>
/* Doctor-specific styles can be added here */
</style>