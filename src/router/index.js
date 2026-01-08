// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// Views
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Register from '../views/Register.vue'
import Meucontatos from '../views/Meucontatos.vue'
import Criarcontato from '../views/Criarcontato.vue'
import Enviarsms from '../views/Enviarsms.vue'
import Admpainel from '../views/adm/Admpainel.vue'
import Credito from '../views/credito.vue'
import Gerir from '../views/adm/Gerir.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/dashboard', name: 'Dashboard', component: Dashboard },
  { path: '/register', name: 'Register', component: Register},
  { path: '/meucontatos', name: 'Meucontatos', component: Meucontatos},
  {path: '/criarcontato', name: 'Criarcontato', component: Criarcontato},
{path:'/enviarsms', name: 'Enviarsms', component: Enviarsms},
{path:'/admpainel', name: 'Admpainel', component: Admpainel},
{path: '/credito', name: 'Credito', component: Credito},
{path: '/gerir', name: 'Gerir', component: Gerir}
]
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
