<template>
  <div id="user-layout">
    <Header />
    <br />
    <router-view></router-view>
    <Footer />
  </div>
</template>

<script>
import Header from "@/components/user/header.vue";
import Footer from "@/components/user/Footer.vue";

export default {
  name: "UserLayout",
  components: {
    Header,
    Footer,
  },
};
</script>

<style>
/* User-specific styles can be added here */
</style>