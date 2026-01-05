// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// Views
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Register from '../views/Register.vue'
import Meucontatos from '../views/Meucontatos.vue'
import Criarcontato from '../views/Criarcontato.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/register', name: 'Register', component: Register},
  { path: '/meucontatos', name: 'Meucontatos', component: Meucontatos},
  {path: '/criarcontato', name: 'Criarcontato', component: Criarcontato}
]
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
