import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore'
import UserLayout from "@/layouts/UserLayout.vue"
import DoctorLayout from "@/layouts/DoctorLayout.vue"

// Views
import Homepage from '@/views/users/Homepage.vue'
import Profile from '@/views/users/Profile.vue'
import DoctorDetails from '@/views/users/DoctorDetails.vue'
import Login from '@/views/users/Login.vue'
import Register from '@/views/users/Register.vue'
import DoctorDashboard from '@/views/doctors/DoctorDashboard.vue'
import AppointmentDashboard from "@/views/doctors/AppointmentDashboard.vue"
import PatientPage from '@/views/users/patientPage.vue'

// Components
import DoctorServices from "@/components/doctor/DoctorServices.vue"
import Patients from '@/components/doctor/Patient.vue'
import DoctorProfile from "@/components/doctor/DoctorProfile.vue"
import workingHours from '@/components/doctor/workingHours.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: UserLayout,
      children: [
        {
          path: '',
          name: 'homepage',
          component: Homepage
        },
        {
          path: 'profile',
          name: 'profile',
          component: Profile,
          meta: { requiresAuth: true }
        },
        {
          path: 'DoctorDetails/:id',
          name: 'DoctorDetails',
          component: DoctorDetails,
          meta: { requiresAuth: true, allowPatient: true }
        },
      ]
    },
    {
      path: '/doctor',
      component: DoctorLayout,
      meta: { requiresAuth: true, requiresDoctor: true },
      children: [
        {
          path: '',
          name: 'doctorDashboard',
          component: DoctorDashboard
        },
        // Other doctor pages can be added here
      ]
    },
    {
      path: '/patient',
      component: PatientPage,
      meta: { requiresAuth: true, requiresPatient: true },
      children: [
        {
          path: '',
          name: 'patientPage',
          component: PatientPage
        },
        // Other patient pages can be added here
      ]
    },
    {
      path: '/doctor/profile',
      name: 'DoctorProfile',
      component: DoctorProfile,
      meta: { requiresAuth: true, requiresDoctor: true }
    },
    {
      path: '/doctor/appointments',
      name: 'AppointmentDashboard',
      component: AppointmentDashboard,
    },
    {
      path: '/doctor/services',
      name: 'DoctorServices',
      component: DoctorServices,
    },
    {
      path: '/doctor/patients',
      name: 'Patients',
      component: Patients,
    },
    {
      path: '/doctor/working-hours',
      name: 'workingHours',
      component: workingHours,
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { guestOnly: true }
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { guestOnly: true }
    },
  ]
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  await userStore.initializeStore()  // Kullanıcı bilgilerini yüklüyor

  // 1. Erişim doğrulama: Giriş yapılmamışsa login'e yönlendir
  if (to.matched.some(record => record.meta.requiresAuth) && !userStore.isLoggedIn) {
    next('/login')

    // 2. Eğer doktor sayfasına gidiyorsa ve kullanıcı doktor değilse anasayfaya yönlendir
  } else if (to.path.startsWith('/doctor') && !userStore.isDoctor) {
    next('/')

    // 3. Eğer hasta sayfasına gidiyorsa ve kullanıcı hasta değilse anasayfaya yönlendir
  } else if (to.path.startsWith('/patient') && !userStore.isPatient) {
    next('/')

    // 4. DoctorDetails sayfasına sadece doktorlar ve hastalar erişebilir
  } else if (to.name === 'DoctorDetails' && (userStore.isDoctor || userStore.isPatient)) {
    next()

    // 5. Eğer giriş yapılmışsa ve kullanıcı doktor ya da hasta ise:
    // - Ana sayfada veya login/register dışında bir yere gitmeye çalışıyorsa
    // - Profile, login, register ve DoctorDetails dışındaki sayfalarda ilgili kullanıcı rolüne uygun sayfaya yönlendir
  } else if (!to.path.startsWith('/doctor') && !to.path.startsWith('/patient') &&
    (userStore.isDoctor || userStore.isPatient) &&
    to.name !== 'login' && to.name !== 'register' && to.name !== 'DoctorDetails' && to.name !== 'profile') {
    if (userStore.isDoctor) {
      next('/doctor')
    } else if (userStore.isPatient) {
      next('/patient')
    }

    // 6. Eğer sadece misafirlerin erişmesi gereken bir sayfaya erişmeye çalışıyorsa ve kullanıcı giriş yapmışsa, anasayfaya yönlendir
  } else if (to.matched.some(record => record.meta.guestOnly) && userStore.isLoggedIn) {
    next('/')

    // 7. Diğer durumlarda herhangi bir engel yoksa devam et
  } else {
    next()
  }
})

export default router 