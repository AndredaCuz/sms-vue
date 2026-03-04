<template>
  <aside class="sidebar" :class="{ 'sidebar--collapsed': collapsed, 'sidebar--mobile-open': mobileOpen }">
    
    <!-- Logo -->
    <div class="sidebar-logo">
      <router-link :to="isAdmin ? '/admin/dashboard' : '/dashboard'" class="logo-link">
        <div class="logo-icon">
          <i class="fas fa-message"></i>
        </div>
        <span class="logo-text">DEV SMS</span>
      </router-link>
      <button class="collapse-btn" @click="toggleCollapse" v-if="!isMobile">
        <i class="fas" :class="collapsed ? 'fa-chevron-right' : 'fa-chevron-left'"></i>
      </button>
    </div>

    <!-- Nav -->
    <nav class="sidebar-nav">

      <!-- ADMIN MENU -->
      <template v-if="isAdmin">
        <!-- Admin Principal -->
        <div class="nav-group">
          <span class="nav-group-label">Admin</span>
          <router-link to="/admin/dashboard" class="nav-item" active-class="nav-item--active" @click="closeMobile">
            <div class="nav-icon"><i class="fas fa-gauge-high"></i></div>
            <span class="nav-label">Dashboard</span>
          </router-link>
        </div>

        <!-- Gerenciamento -->
        <div class="nav-group">
          <span class="nav-group-label">Gerenciamento</span>
          <router-link to="/lista_empresa" class="nav-item" active-class="nav-item--active" @click="closeMobile">
            <div class="nav-icon"><i class="fas fa-building"></i></div>
            <span class="nav-label">Empresas</span>
          </router-link>
          <router-link to="/lista_planos" class="nav-item" active-class="nav-item--active" @click="closeMobile">
            <div class="nav-icon"><i class="fas fa-box"></i></div>
            <span class="nav-label">Planos</span>
          </router-link>
          <router-link to="/listar_voucher" class="nav-item" active-class="nav-item--active" @click="closeMobile">
            <div class="nav-icon"><i class="fas fa-ticket-alt"></i></div>
            <span class="nav-label">Vouchers</span>
          </router-link>
        </div>
      </template>

      <!-- USUARIO COMUM MENU -->
      <template v-else>
        <!-- Principal -->
        <div class="nav-group">
          <span class="nav-group-label">Principal</span>
          <router-link to="/dashboard" class="nav-item" active-class="nav-item--active" @click="closeMobile">
            <div class="nav-icon"><i class="fas fa-gauge-high"></i></div>
            <span class="nav-label">Dashboard</span>
          </router-link>
        </div>

        <!-- SMS -->
        <div class="nav-group">
          <span class="nav-group-label">SMS</span>
          <router-link to="/criar_campanhas" class="nav-item" active-class="nav-item--active" @click="closeMobile">
            <div class="nav-icon"><i class="fas fa-paper-plane"></i></div>
            <span class="nav-label">Enviar SMS</span>
            <span class="nav-badge nav-badge--new">Novo</span>
          </router-link>
          <router-link to="/lista_campanhas" class="nav-item" active-class="nav-item--active" @click="closeMobile">
            <div class="nav-icon"><i class="fas fa-bullhorn"></i></div>
            <span class="nav-label">Campanhas</span>
          </router-link>
          <router-link to="/historicosms" class="nav-item" active-class="nav-item--active" @click="closeMobile">
            <div class="nav-icon"><i class="fas fa-clock-rotate-left"></i></div>
            <span class="nav-label">Histórico</span>
          </router-link>
          <router-link to="/lista_template" class="nav-item" active-class="nav-item--active" @click="closeMobile">
            <div class="nav-icon"><i class="fas fa-file-lines"></i></div>
            <span class="nav-label">Templates</span>
          </router-link>
        </div>

        <!-- Contactos -->
        <div class="nav-group">
          <span class="nav-group-label">Contactos</span>
          <router-link to="/meucontatos" class="nav-item" active-class="nav-item--active" @click="closeMobile">
            <div class="nav-icon"><i class="fas fa-address-book"></i></div>
            <span class="nav-label">Meus Contactos</span>
          </router-link>
          <router-link to="/categorias" class="nav-item" active-class="nav-item--active" @click="closeMobile">
            <div class="nav-icon"><i class="fas fa-tags"></i></div>
            <span class="nav-label">Categorias</span>
          </router-link>
          <router-link to="/lista_black" class="nav-item" active-class="nav-item--active" @click="closeMobile">
            <div class="nav-icon"><i class="fas fa-ban"></i></div>
            <span class="nav-label">Lista Negra</span>
          </router-link>
        </div>

        <!-- Conta -->
        <div class="nav-group">
          <span class="nav-group-label">Conta</span>
          <router-link to="/credito" class="nav-item" active-class="nav-item--active" @click="closeMobile">
            <div class="nav-icon"><i class="fas fa-credit-card"></i></div>
            <span class="nav-label">Assinaturas</span>
          </router-link>
          <router-link to="/verplanos" class="nav-item" active-class="nav-item--active" @click="closeMobile">
            <div class="nav-icon"><i class="fas fa-box-open"></i></div>
            <span class="nav-label">Ver Planos</span>
          </router-link>
          <router-link to="/hist_consumo" class="nav-item" active-class="nav-item--active" @click="closeMobile">
            <div class="nav-icon"><i class="fas fa-chart-pie"></i></div>
            <span class="nav-label">Consumo</span>
          </router-link>
          <router-link to="/perfil" class="nav-item" active-class="nav-item--active" @click="closeMobile">
            <div class="nav-icon"><i class="fas fa-user-circle"></i></div>
            <span class="nav-label">Perfil</span>
          </router-link>
        </div>
      </template>

    </nav>

    <!-- SMS Credits pill (bottom) - Only for regular users -->
    <div class="sidebar-credits" v-if="!collapsed && !isAdmin">
      <div class="credits-inner">
        <div class="credits-icon"><i class="fas fa-sms"></i></div>
        <div class="credits-info">
          <div class="credits-num">{{ formattedCredits }}</div>
          <div class="credits-lbl">SMS disponíveis</div>
        </div>
      </div>
      <div class="credits-bar-bg">
        <div class="credits-bar-fill" :style="{ width: usagePct + '%' }"></div>
      </div>
    </div>

    <!-- Collapsed credits (just icon) - Only for regular users -->
    <div class="sidebar-credits-mini" v-else-if="!isAdmin">
      <div class="cred-mini-icon" title="SMS disponíveis">
        <i class="fas fa-sms"></i>
        <span class="cred-mini-num">{{ shortCredits }}</span>
      </div>
    </div>

  </aside>

  <!-- Mobile overlay -->
  <div class="sidebar-overlay" v-if="mobileOpen" @click="closeMobile"></div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Sidebar',
  emits: ['collapse-change'],

  data() {
    return {
      collapsed: false,
      mobileOpen: false,
      isMobile: false,
      smsCredits: null,
      smsTotal: null,
      isAdmin: false,
    };
  },

  computed: {
    formattedCredits() {
      if (this.smsCredits === null) return '—';
      return this.smsCredits.toLocaleString('pt-AO');
    },
    shortCredits() {
      if (this.smsCredits === null) return '—';
      if (this.smsCredits >= 1000) return (this.smsCredits / 1000).toFixed(1) + 'k';
      return this.smsCredits;
    },
    usagePct() {
      if (!this.smsTotal || !this.smsCredits) return 0;
      return Math.max(0, Math.min(100, ((this.smsTotal - this.smsCredits) / this.smsTotal) * 100));
    },
  },

  methods: {
    toggleCollapse() {
      this.collapsed = !this.collapsed;
      this.$emit('collapse-change', this.collapsed);
      localStorage.setItem('sidebar_collapsed', this.collapsed);
      window.dispatchEvent(new CustomEvent('sidebar-collapse', { detail: { collapsed: this.collapsed } }));
    },
    openMobile() {
      this.mobileOpen = true;
    },
    closeMobile() {
      this.mobileOpen = false;
    },
    checkMobile() {
      this.isMobile = window.innerWidth <= 768;
      if (this.isMobile) this.collapsed = false;
    },
    checkIfAdmin() {
      const userType = localStorage.getItem('user_type');
      const userData = localStorage.getItem('user_data');
      
      // Verificar se é admin por user_type
      if (userType === 'admin') {
        this.isAdmin = true;
      } 
      // Ou verificar se o user_data tem role: admin
      else if (userData) {
        try {
          const user = JSON.parse(userData);
          this.isAdmin = user.role === 'admin' || user.type === 'admin';
        } catch (e) {
          this.isAdmin = false;
        }
      } else {
        this.isAdmin = false;
      }
    },
    async fetchCredits() {
      // Não buscar créditos para admin
      if (this.isAdmin) return;

      const token = localStorage.getItem('auth_token');
      if (!token) return;
      try {
        const res = await axios.get('https://api.devsms.online/api/v1/subscription/balance', {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
        });
        const d = res.data.data || {};
        this.smsCredits = d.sms_available ?? 0;
        this.smsTotal   = d.sms_total ?? d.sms_available ?? 1;
      } catch (e) {
        this.smsCredits = 0;
      }
    },
  },

  mounted() {
    this.checkIfAdmin();
    this.checkMobile();
    window.addEventListener('resize', this.checkMobile);
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved === 'true' && !this.isMobile) {
      this.collapsed = true;
      this.$nextTick(() => {
        window.dispatchEvent(new CustomEvent('sidebar-collapse', { detail: { collapsed: this.collapsed } }));
      });
    }
    this.fetchCredits();
    window.addEventListener('sidebar-open', this.openMobile);
    window.addEventListener('credits-updated', (e) => {
      if (e.detail?.credits !== undefined) this.smsCredits = e.detail.credits;
    });
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.checkMobile);
    window.removeEventListener('sidebar-open', this.openMobile);
  },
};
</script>

<style scoped>
/* ── Variables ── */


/* ── Base ── */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 240px;
  background: #0f172a;
  display: flex;
  flex-direction: column;
  z-index: 900;
  transition: width 0.28s cubic-bezier(.4, 0, .2, 1), transform 0.3s cubic-bezier(.4, 0, .2, 1);
  overflow: hidden;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
}

.sidebar--collapsed {
  width: 68px;
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    width: 240px;
  }
  .sidebar--mobile-open {
    transform: translateX(0);
  }
}

/* ── Logo ── */
.sidebar-logo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.125rem 1rem 1.125rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  flex-shrink: 0;
  min-height: 70px;
  box-sizing: border-box;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  overflow: hidden;
}

.logo-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.logo-text {
  font-size: 1.1rem;
  font-weight: 800;
  color: white;
  letter-spacing: 0.04em;
  white-space: nowrap;
  opacity: 1;
  transition: opacity 0.2s;
}

.sidebar--collapsed .logo-text {
  opacity: 0;
  width: 0;
}

.collapse-btn {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.7rem;
  flex-shrink: 0;
  transition: all 0.2s;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.sidebar--collapsed .collapse-btn {
  margin-left: auto;
  margin-right: auto;
}

/* ── Nav ── */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0.75rem 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.1) transparent;
}

.sidebar-nav::-webkit-scrollbar { width: 3px; }
.sidebar-nav::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }

.nav-group {
  margin-bottom: 0.25rem;
  padding: 0 0.625rem;
}

.nav-group-label {
  display: block;
  font-size: 0.6rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.3);
  padding: 0.75rem 0.5rem 0.35rem;
  white-space: nowrap;
  overflow: hidden;
  transition: opacity 0.2s;
}

.sidebar--collapsed .nav-group-label {
  opacity: 0;
  height: 0;
  padding: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.625rem;
  border-radius: 10px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.18s;
  position: relative;
  white-space: nowrap;
  margin-bottom: 0.125rem;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.07);
  color: rgba(255, 255, 255, 0.9);
}

.nav-item--active {
  background: rgba(59, 130, 246, 0.18) !important;
  color: #60a5fa !important;
}

.nav-item--active .nav-icon {
  color: #3b82f6;
}

.nav-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.938rem;
  flex-shrink: 0;
  transition: background 0.18s;
}

.nav-item:hover .nav-icon {
  background: rgba(255, 255, 255, 0.08);
}

.nav-item--active .nav-icon {
  background: rgba(59, 130, 246, 0.2);
}

.nav-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: opacity 0.2s;
}

.sidebar--collapsed .nav-label { opacity: 0; width: 0; }
.sidebar--collapsed .nav-badge { display: none; }

.nav-badge {
  font-size: 0.58rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 10px;
  flex-shrink: 0;
}

.nav-badge--new { background: rgba(59, 130, 246, 0.25); color: #60a5fa; }

/* ── Credits (bottom) ── */
.sidebar-credits {
  padding: 0.875rem;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  flex-shrink: 0;
}

.credits-inner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.625rem;
}

.credits-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.938rem;
  flex-shrink: 0;
}

.credits-num {
  font-size: 1rem;
  font-weight: 800;
  color: white;
  line-height: 1;
}

.credits-lbl {
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 0.15rem;
}

.credits-bar-bg {
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  overflow: hidden;
}

.credits-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
  border-radius: 4px;
  transition: width 0.6s ease;
}

/* Mini credits (collapsed) */
.sidebar-credits-mini {
  padding: 0.875rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
  display: flex;
  justify-content: center;
  flex-shrink: 0;
}

.cred-mini-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  color: #60a5fa;
  font-size: 1rem;
}

.cred-mini-num {
  font-size: 0.6rem;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.5);
}

/* Mobile overlay */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(3px);
  z-index: 899;
}
</style>