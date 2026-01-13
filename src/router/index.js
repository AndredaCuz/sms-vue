// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'

// Views
import Home from '../views/Home.vue'
import Login from '../views/autenticacao/login.vue'
import Dashboard from '../views/Dashboard.vue'
import Register from '../views/autenticacao/register.vue'
import Meucontatos from '../views/clientes/meucontatos.vue'
import Criarcontato from '../views/clientes/criarcontato.vue'
import Atualizar from '../views/clientes/Atualizar.vue'
import Enviarsms from '../views/Enviarsms.vue'
import Admpainel from '../views/empresa_adm/admpainel.vue'
import Credito from '../views/credito.vue'
import Gerir from '../views/adm/Gerir.vue'
import Historicosms from '../views/Historicosms.vue'
import Verplanos from '../views/verplanos.vue'
import Categorias from '../views/Categorias.vue'
import Lista_template from '../views/template/lista_template.vue'
import Criar from '../views/template/Criar.vue'
import Listar_campanhas from '../views/campanhas/Listar_campanhas.vue'
import Criar_campanhas from '../views/campanhas/Criar_campanhas.vue'
import Lista_empresa from '../views/empresa_adm/Lista_empresa.vue'
import Criar_empresa from '../views/empresa_adm/Criar_empresa.vue'
import Lista_planos from '../views/empresa_adm/Lista_planos.vue'
import Atualizar_planos from '../views/empresa_adm/Atualizar_planos.vue'
import Lista_black from '../views/blacklist/Lista_black.vue'
import Criar_black from '../views/blacklist/Criar_black.vue'

// Sistema de autenticação
const auth = {
  isAuthenticated() {
    const token = localStorage.getItem('auth_token')
    const isValid = !!token && token !== 'null' && token !== 'undefined' && token.trim().length > 0
    console.log('🔐 isAuthenticated:', isValid)
    return isValid
  },
  
  getUser() {
    try {
      const userData = localStorage.getItem('user_data')
      return userData ? JSON.parse(userData) : null
    } catch (e) {
      console.error('Erro ao obter dados do usuário:', e)
      return null
    }
  },
  
  isAdmin() {
    const userType = localStorage.getItem('user_type')
    console.log('🔍 user_type no localStorage:', userType)
    
    if (userType === 'admin') {
      console.log('✅ É admin pelo user_type')
      return true
    }
    
    const user = this.getUser()
    if (!user) {
      console.log('❌ Sem dados de usuário')
      return false
    }
    
    const userRole = user.role || user.tipo || user.user_type || user.level || user.type || user.is_admin
    console.log('🔍 userRole nos dados:', userRole)
    
    const isAdminRole = userRole === 'admin' || 
                        userRole === 'administrator' || 
                        userRole === 'Admin' ||
                        userRole === 'super_admin' ||
                        userRole === 'Super Admin' ||
                        userRole === true ||
                        userRole === 1
    
    console.log('🔍 É admin pelo role:', isAdminRole)
    return isAdminRole
  },
  
  logout() {
    console.log('🚪 Fazendo logout...')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    localStorage.removeItem('user_type')
    localStorage.removeItem('remember_email')
    
    window.dispatchEvent(new CustomEvent('auth-changed'))
  }
}

window.auth = auth

const routes = [
  // Rotas Públicas
  { 
    path: '/', 
    name: 'Home', 
    component: Home,
    meta: { 
      requiresGuest: false,
      requiresAuth: false,
      public: true
    } 
  },
  { 
    path: '/login', 
    name: 'Login', 
    component: Login,
    // 🔧 REMOVIDO: requiresGuest para permitir acesso sempre
    meta: { requiresAuth: false }
  },
  { 
    path: '/register', 
    name: 'Register', 
    component: Register,
    // 🔧 REMOVIDO: requiresGuest para permitir acesso sempre
    meta: { requiresAuth: false }
  },
  
  // ROTAS DE EMPRESA
  { 
    path: '/dashboard', 
    name: 'Dashboard', 
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  { 
    path: '/meucontatos', 
    name: 'Meucontatos', 
    component: Meucontatos,
    meta: { requiresAuth: true }
  },
  { 
    path: '/criarcontato', 
    name: 'Criarcontato', 
    component: Criarcontato,
    meta: { requiresAuth: true }
  },
  { 
    path: '/atualizar/:id', 
    name: 'Atualizar', 
    component: Atualizar,
    meta: { requiresAuth: true }
  },
  { 
    path: '/enviarsms', 
    name: 'Enviarsms', 
    component: Enviarsms,
    meta: { requiresAuth: true }
  },
  { 
    path: '/credito', 
    name: 'Credito', 
    component: Credito,
    meta: { requiresAuth: true }
  },
  { 
    path: '/historicosms', 
    name: 'Historicosms', 
    component: Historicosms,
    meta: { requiresAuth: true }
  },
  { 
    path: '/verplanos', 
    name: 'Verplanos', 
    component: Verplanos,
    meta: { requiresAuth: true }
  },
  { 
    path: '/lista_template', 
    name: 'Lista_template', 
    component: Lista_template,
    meta: { requiresAuth: true }
  },
  { 
    path: '/criar', 
    name: 'Criar', 
    component: Criar,
    meta: { requiresAuth: true }
  },

   { 
    path: '/lista_black', 
    name: 'Lista_black', 
    component: Lista_black,
    meta: { requiresAuth: true }
  },
    { 
    path: '/criar_black', 
    name: 'Criar_black', 
    component: Criar_black,
    meta: { requiresAuth: true }
  },
  { 
    path: '/lista_campanhas', 
    name: 'Lista_campanhas', 
    component: Listar_campanhas,
    meta: { requiresAuth: true }
  },
  { 
    path: '/criar_campanhas', 
    name: 'Criar_campanhas', 
    component: Criar_campanhas,
    meta: { requiresAuth: true }
  },
  
  // ROTAS DE ADMIN
  { 
    path: '/admpainel', 
    name: 'Admpainel', 
    component: Admpainel,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { 
    path: '/gerir', 
    name: 'Gerir', 
    component: Gerir,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { 
    path: '/categorias', 
    name: 'Categorias', 
    component: Categorias,
    meta: { requiresAuth: true }
  },
  { 
    path: '/lista_empresa', 
    name: 'Lista_empresa', 
    component: Lista_empresa,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { 
    path: '/criar_empresa', 
    name: 'Criar_empresa', 
    component: Criar_empresa,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { 
    path: '/lista_planos', 
    name: 'Lista_planos', 
    component: Lista_planos,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { 
    path: '/atualizar_planos/:id', 
    name: 'Atualizar_planos', 
    component: Atualizar_planos,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  
  // Rota 404 Catch-All
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: to => {
      if (auth.isAuthenticated()) {
        return auth.isAdmin() ? '/admpainel' : '/dashboard'
      }
      return '/login'
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 🔧 GUARD DE NAVEGAÇÃO SIMPLIFICADO E CORRIGIDO
router.beforeEach((to, from, next) => {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🧭 NAVEGAÇÃO')
  console.log('De:', from.path)
  console.log('Para:', to.path)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  
  const isAuthenticated = auth.isAuthenticated()
  const isAdmin = auth.isAdmin()
  
  console.log('📊 Status:')
  console.log('- Autenticado:', isAuthenticated)
  console.log('- É Admin:', isAdmin)
  
  // 1️⃣ Rotas públicas (Home) - sempre permitir
  if (to.meta.public) {
    console.log('✅ ROTA PÚBLICA - Permitido')
    return next()
  }
  
  // 2️⃣ Rotas que NÃO requerem autenticação (Login, Register)
  if (to.meta.requiresAuth === false) {
    console.log('✅ ROTA SEM AUTENTICAÇÃO - Permitido')
    return next()
  }
  
  // 3️⃣ Rotas que REQUEREM autenticação
  if (to.meta.requiresAuth) {
    // Se não estiver autenticado, redireciona para login
    if (!isAuthenticated) {
      console.log('⛔ NÃO AUTENTICADO - Redirecionando para /login')
      return next({ 
        path: '/login', 
        query: { redirect: to.fullPath },
        replace: true 
      })
    }
    
    // Se a rota requer admin e não é admin, redireciona para dashboard
    if (to.meta.requiresAdmin && !isAdmin) {
      console.log('⛔ NÃO É ADMIN - Redirecionando para /dashboard')
      return next({ path: '/dashboard', replace: true })
    }
    
    console.log('✅ AUTENTICADO - Permitido')
    return next()
  }
  
  // 4️⃣ Qualquer outra rota
  console.log('✅ PERMITIDO')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  next()
})

router.onError((error) => {
  console.error('❌ Erro de navegação:', error)
})

export { auth }
export default router