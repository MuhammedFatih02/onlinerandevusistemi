<!-- HeroSection.vue -->
<template>
  <section class="bg-gradient-to-br from-blue-50 to-white">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
      <!-- Hero Content -->
      <div class="grid lg:grid-cols-2 gap-12 items-center">
        <!-- Sol Taraf - Metin İçeriği -->
        <div class="space-y-8">
          <h1
            class="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight font-inter"
          >
            Profesyonel Diş Hekiminize
            <span class="text-blue-600">Online Randevu</span> ile Ulaşın
          </h1>

          <p class="text-xl text-gray-600 font-roboto leading-relaxed">
            Türkiye'nin en kapsamlı diş hekimi randevu platformu ile size en
            uygun hekimi bulun, online randevu alın.
          </p>

          <!-- CTA Butonları -->
          <div class="flex flex-col sm:flex-row gap-4">
            <button
              class="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all shadow-md flex items-center justify-center group"
            >
              <a href="#search">Hemen Randevu Bul</a>
              <i
                class="fas fa-arrow-right ml-2 group-hover:translate-x-1 transition-transform"
              ></i>
            </button>

            <button
              class="px-8 py-4 bg-white hover:bg-gray-50 text-gray-700 rounded-lg transition-all border border-gray-200 shadow-sm flex items-center justify-center"
            >
              <i class="fas fa-phone-alt mr-2"></i>
              <span>Bizi Arayın</span>
            </button>
          </div>

          <!-- Güven Göstergeleri -->
          <div class="flex items-center gap-6 pt-4">
            <div class="flex -space-x-2">
              <img
                v-for="i in 1"
                :key="i"
                src="https://st.depositphotos.com/62628780/60674/i/600/depositphotos_606741090-stock-photo-closeup-happy-young-man-brush.jpg"
                alt="User Avatar"
                class="w-10 h-10 rounded-full border-2 border-white"
              />
            </div>
            <div class="text-sm text-gray-600">
              <strong class="text-gray-900">10.000+</strong> mutlu hasta
              <div class="flex items-center text-yellow-400">
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <i class="fas fa-star"></i>
                <span class="ml-2 text-gray-600">(4.9/5)</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sağ Taraf - Hero Görseli -->
        <div class="relative">
          <div class="relative rounded-2xl overflow-hidden shadow-2xl">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfJ0qLeUzDYMYAeLaFL947v23RaLf-zwGgUg&s"
              alt="Dental Care"
              class="w-full h-auto object-cover"
            />
            <!-- Overlay Dekoratif Element -->
            <div
              class="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-100 rounded-full opacity-50"
            ></div>
          </div>
        </div>
      </div>

      <!-- İstatistikler Bölümü -->
      <div class="mt-16 lg:mt-24">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div
            v-for="(stat, index) in statistics"
            :key="index"
            class="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            <div class="flex items-center gap-4">
              <div
                class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center"
              >
                <i :class="stat.icon + ' text-blue-600 text-xl'"></i>
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-900">
                  {{ stat.value }}
                </h3>
                <p class="text-sm text-gray-600">{{ stat.label }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "HeroSection",
  data() {
    return {
      statistics: [
        {
          value: "1000+",
          label: "Aktif Hekim",
          icon: "fas fa-user-md",
        },
        {
          value: "50.000+",
          label: "Başarılı Tedavi",
          icon: "fas fa-tooth",
        },
        {
          value: "100+",
          label: "Uzman Klinik",
          icon: "fas fa-hospital",
        },
        {
          value: "24/7",
          label: "Müşteri Desteği",
          icon: "fas fa-headset",
        },
      ],
    };
  },
};
</script>