import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/userStore'
import '../dist/output.css';
const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const userStore = useUserStore()

// Store'u başlat ve uygulamayı monte et
userStore.initializeStore().then(() => {
    app.mount('#app')
}).catch(error => {
    console.error('Failed to initialize store:', error)
    app.mount('#app') // Hata durumunda da uygulamayı başlat
})