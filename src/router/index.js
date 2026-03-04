// src/router/index.js
import { createRouter, createWebHashHistory } from 'vue-router'

// Views
import Home from '../views/Home.vue'
import Login from '../views/autenticacao/login.vue'
import Dashboard from '../views/dashboard/dashboard.vue'
import Register from '../views/autenticacao/register.vue'
import Meucontatos from '../views/clientes/meucontatos.vue'
import Criarcontato from '../views/clientes/criarcontato.vue'
import Atualizar from '../views/clientes/Atualizar.vue'
import Enviarsms from '../views/Enviarsms.vue'
import AdminDashboard from '../views/empresa_adm/admpainel.vue'
import Credito from '../views/assinatura.vue'
import Gerir from '../views/adm/Gerir.vue'
import Historicosms from '../views/dashboard/historicosms.vue'
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
import Listar_voucher from '../views/empresa_adm/Listar_voucher.vue'
import Criar_voucher from '../views/empresa_adm/Criar_voucher.vue'
import Hist_consumo from '../views/dashboard/Hist_consumo.vue'
import Resu_camapanha from '../views/dashboard/Resu_camapanha.vue'
import Perfil from '../views/autenticacao/perfil.vue'

// ✅ SISTEMA DE AUTENTICAÇÃO CORRIGIDO
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
    // ✅ VERIFICAÇÃO 1: user_type no localStorage (método mais confiável)
    const userType = localStorage.getItem('user_type')
    console.log('🔍 user_type no localStorage:', userType)
    
    if (userType === 'admin') {
      console.log('✅ É ADMIN - Confirmado pelo user_type')
      return true
    }
    
    // ✅ VERIFICAÇÃO 2: Verificar token JWT (método alternativo)
    const token = localStorage.getItem('auth_token')
    if (token && token.includes('admin')) {
      console.log('✅ É ADMIN - Detectado no token')
      return true
    }
    
    // ✅ VERIFICAÇÃO 3: Verificar dados do usuário
    const user = this.getUser()
    if (!user) {
      console.log('❌ Sem dados de usuário')
      return false
    }
    
    // Verificar múltiplos campos que podem conter o role
    const possibleAdminFields = [
      user.role,
      user.tipo,
      user.user_type,
      user.level,
      user.type,
      user.is_admin,
      user.admin,
      user.isAdmin,
      user.permission
    ]
    
    for (let field of possibleAdminFields) {
      if (field === 'admin' || 
          field === 'administrator' || 
          field === 'Admin' ||
          field === 'super_admin' ||
          field === 'Super Admin' ||
          field === true ||
          field === 1 ||
          field === '1') {
        console.log('✅ É ADMIN - Detectado em:', field)
        return true
      }
    }
    
    console.log('❌ NÃO É ADMIN')
    console.log('User data:', user)
    return false
  },
  
  logout() {
    console.log('🚪 Fazendo logout...')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_data')
    localStorage.removeItem('user_type')
    localStorage.removeItem('remember_email')
    localStorage.removeItem('sidebar_collapsed')
    
    window.dispatchEvent(new CustomEvent('auth-changed'))
  }
}

window.auth = auth

// ✅ ROTAS DEFINIDAS CORRETAMENTE
const routes = [
  // ROTAS PÚBLICAS
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
    meta: { requiresAuth: false }
  },
  { 
    path: '/register', 
    name: 'Register', 
    component: Register,
    meta: { requiresAuth: false }
  },
  
  // ═══════════════════════════════════════
  // ROTAS DE EMPRESA (USUÁRIO COMUM)
  // ═══════════════════════════════════════
  { 
    path: '/dashboard', 
    name: 'Dashboard', 
    component: Dashboard,
    meta: { requiresAuth: true, requiresAdmin: false }
  },
  { 
    path: '/perfil', 
    name: 'Perfil', 
    component: Perfil,
    meta: { requiresAuth: true, requiresAdmin: false }
  },
  { 
    path: '/meucontatos', 
    name: 'Meucontatos', 
    component: Meucontatos,
    meta: { requiresAuth: true, requiresAdmin: false }
  },
  { 
    path: '/criarcontato', 
    name: 'Criarcontato', 
    component: Criarcontato,
    meta: { requiresAuth: true, requiresAdmin: false }
  },
  { 
    path: '/atualizar/:id', 
    name: 'Atualizar', 
    component: Atualizar,
    meta: { requiresAuth: true, requiresAdmin: false }
  },
  { 
    path: '/enviarsms', 
    name: 'Enviarsms', 
    component: Enviarsms,
    meta: { requiresAuth: true, requiresAdmin: false }
  },
  { 
    path: '/crear_campanhas', 
    name: 'Criar_campanhas', 
    component: Criar_campanhas,
    meta: { requiresAuth: true, requiresAdmin: false }
  },
  { 
    path: '/lista_campanhas', 
    name: 'Lista_campanhas', 
    component: Listar_campanhas,
    meta: { requiresAuth: true, requiresAdmin: false }
  },
  { 
    path: '/credito', 
    name: 'Credito', 
    component: Credito,
    meta: { requiresAuth: true, requiresAdmin: false }
  },
  { 
    path: '/historicosms', 
    name: 'Historicosms', 
    component: Historicosms,
    meta: { requiresAuth: true, requiresAdmin: false }
  },
  { 
    path: '/hist_consumo', 
    name: 'Hist_consumo', 
    component: Hist_consumo,
    meta: { requiresAuth: true, requiresAdmin: false }
  },
  { 
    path: '/resu_campanha', 
    name: 'Resu_campanha', 
    component: Resu_camapanha,
    meta: { requiresAuth: true, requiresAdmin: false }
  },
  { 
    path: '/verplanos', 
    name: 'Verplanos', 
    component: Verplanos,
    meta: { requiresAuth: true, requiresAdmin: false }
  },
  { 
    path: '/lista_template', 
    name: 'Lista_template', 
    component: Lista_template,
    meta: { requiresAuth: true, requiresAdmin: false }
  },
  { 
    path: '/criar', 
    name: 'Criar', 
    component: Criar,
    meta: { requiresAuth: true, requiresAdmin: false }
  },
  { 
    path: '/lista_black', 
    name: 'Lista_black', 
    component: Lista_black,
    meta: { requiresAuth: true, requiresAdmin: false }
  },
  { 
    path: '/criar_black', 
    name: 'Criar_black', 
    component: Criar_black,
    meta: { requiresAuth: true, requiresAdmin: false }
  },
  { 
    path: '/categorias', 
    name: 'Categorias', 
    component: Categorias,
    meta: { requiresAuth: true, requiresAdmin: false }
  },
  
  // ═══════════════════════════════════════
  // ROTAS DE ADMIN (APENAS PARA ADMINISTRADORES)
  // ═══════════════════════════════════════
  { 
    path: '/admin/dashboard', 
    name: 'AdminDashboard', 
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { 
    path: '/admpainel', 
    name: 'Admpainel', 
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { 
    path: '/gerir', 
    name: 'Gerir', 
    component: Gerir,
    meta: { requiresAuth: true, requiresAdmin: true }
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
  { 
    path: '/listar_voucher', 
    name: 'Listar_voucher', 
    component: Listar_voucher,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  { 
    path: '/criar_voucher', 
    name: 'Criar_voucher', 
    component: Criar_voucher,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  
  // ═══════════════════════════════════════
  // ROTA 404 CATCH-ALL
  // ═══════════════════════════════════════
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: to => {
      if (auth.isAuthenticated()) {
        return auth.isAdmin() ? '/admin/dashboard' : '/dashboard'
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

// ✅ GUARD DE NAVEGAÇÃO CORRIGIDO
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
  console.log('- user_type:', localStorage.getItem('user_type'))
  
  // 1️⃣ Rotas públicas - sempre permitir
  if (to.meta.public) {
    console.log('✅ ROTA PÚBLICA - Permitido')
    return next()
  }
  
  // 2️⃣ Rotas que NÃO requerem autenticação
  if (to.meta.requiresAuth === false) {
    console.log('✅ ROTA SEM AUTENTICAÇÃO - Permitido')
    return next()
  }
  
  // 3️⃣ Rotas que REQUEREM autenticação
  if (to.meta.requiresAuth === true) {
    // Se não estiver autenticado, redireciona para login
    if (!isAuthenticated) {
      console.log('⛔ NÃO AUTENTICADO - Redirecionando para /login')
      return next({ 
        path: '/login', 
        query: { redirect: to.fullPath },
        replace: true 
      })
    }
    
    // Se a rota requer admin e NÃO é admin
    if (to.meta.requiresAdmin === true && !isAdmin) {
      console.log('⛔ ROTA REQUER ADMIN MAS USUÁRIO NÃO É ADMIN')
      console.log('Redirecionando para /dashboard')
      return next({ path: '/dashboard', replace: true })
    }
    
    // Se a rota requer que NÃO seja admin mas o usuário é admin
    if (to.meta.requiresAdmin === false && isAdmin) {
      console.log('⛔ ROTA É PARA USUÁRIO COMUM MAS VOCÊ É ADMIN')
      console.log('Redirecionando para /admin/dashboard')
      return next({ path: '/admin/dashboard', replace: true })
    }
    
    console.log('✅ AUTENTICADO E AUTORIZADO - Permitido')
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