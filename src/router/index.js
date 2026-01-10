// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// Views
import Home from '../views/Home.vue'
import Login from '../views/autenticacao/login.vue'
import Dashboard from '../views/Dashboard.vue'
import Register from '../views/autenticacao/register.vue'
import Meucontatos from '../views/clientes/meucontatos.vue'
import Criarcontato from '../views/clientes/criarcontato.vue'
import Enviarsms from '../views/Enviarsms.vue'
import Admpainel from '../views/adm/Admpainel.vue'
import Credito from '../views/credito.vue'
import Gerir from '../views/adm/Gerir.vue'
import Historicosms from '../views/Historicosms.vue'
import Verplanos from '../views/verplanos.vue'
import Categorias from '../views/Categorias.vue'
import Lista_template from '../views/template/lista_template.vue'
import Criar from '../views/template/Criar.vue'
import Listar_campanhas from '../views/campanhas/Listar_campanhas.vue'
import Criar_campanhas from '../views/campanhas/Criar_campanhas.vue'

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
{path: '/gerir', name: 'Gerir', component: Gerir},
{path: '/historicosms', name:Historicosms, component:Historicosms},
{path: '/verplanos', name:'Verplanos', component: Verplanos},
{path: '/categorias', name:'Categorias', component: Categorias},
{path: '/lista_template', name: 'Lista_template', component: Lista_template},
{path: '/criar', name: 'Criar', component: Criar},
{path: '/lista_campanhas', name:'Lista_campnhas', component: Listar_campanhas},
{path: '/criar_campanhas', name:'Criar_campanhas', component:Criar_campanhas}
]
const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
