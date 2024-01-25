import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import Login from '../views/Login.vue'
import Registration from '../views/Registration.vue'
import Logout from '../views/Logout.vue'
import Account from '../views/Account.vue'
import MyBundles from '../views/MyBundles.vue'
import Download from '../views/Download.vue'
import ResetPassword from '../views/ResetPassword.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/register',
      name: 'register',
      component: Registration
    },
    {
      path: '/logout',
      name: 'logout',
      component: Logout
    },
    {
      path: '/account',
      name: 'account',
      component: Account
    },
    {
      path: '/my-files',
      name: 'my-files',
      component: MyBundles
    },
    {
      path: '/download/:link',
      name: 'Download',
      component: Download
    },
    {
      path: '/password-reset',
      name: 'passwordReset',
      component: ResetPassword
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
  ]
})

export default router
