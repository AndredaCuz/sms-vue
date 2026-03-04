<template>
  <nav class="navbar" :style="{ left: navLeft }">
    <div class="navbar-container">

      <!-- Hamburger (mobile only) -->
      <button class="hamburger" @click="openSidebar">
        <i class="fas fa-bars"></i>
      </button>

      <!-- Brand (mobile only — hidden on desktop since sidebar has logo) -->
      <router-link to="/dashboard" class="brand-mobile">
        <i class="fas fa-message"></i>
        <span>DEV SMS</span>
      </router-link>

      <!-- Search -->
      <div class="navbar-search" v-if="showSearch">
        <i class="fas fa-search search-ico"></i>
        <input
          type="text"
          placeholder="Pesquisar contactos..."
          v-model="searchQuery"
          @input="onSearchInput"
          @keydown.enter="executeSearch"
          @keydown.escape="clearSearch"
          @focus="showSuggestions = true"
          @blur="onBlur"
        />
        <button v-if="searchQuery" class="search-clear" @mousedown.prevent="clearSearch">
          <i class="fas fa-times"></i>
        </button>
        <i v-if="isSearching" class="fas fa-spinner fa-spin search-spinner"></i>

        <!-- Suggestions dropdown -->
        <div class="search-drop" v-if="showSuggestions && searchQuery.length >= 2">
          <template v-if="searchResults.length > 0">
            <div class="drop-head">
              <span>Contactos encontrados</span>
              <span class="drop-count">{{ searchResults.length }}</span>
            </div>
            <div
              v-for="r in searchResults"
              :key="r.id"
              class="drop-item"
              @mousedown.prevent="goToContact(r)"
            >
              <div class="drop-avatar" :style="{ background: r.avatarColor }">{{ getInitials(r.name) }}</div>
              <div class="drop-info">
                <div class="drop-name" v-html="highlightMatch(r.name, searchQuery)"></div>
                <div class="drop-phone"><i class="fas fa-phone"></i> {{ r.phone }}</div>
              </div>
              <div v-if="r.category" class="drop-cat" :style="{ color: r.category.color }">{{ r.category.name }}</div>
            </div>
            <div class="drop-footer" @mousedown.prevent="executeSearch">
              <i class="fas fa-search"></i> Ver todos os resultados de "<strong>{{ searchQuery }}</strong>"
            </div>
          </template>
          <div v-else-if="!isSearching" class="drop-empty">
            <i class="fas fa-search"></i> Nenhum resultado para "{{ searchQuery }}"
          </div>
          <div v-if="isSearching && !searchResults.length" class="drop-loading">
            <i class="fas fa-spinner fa-spin"></i> A pesquisar...
          </div>
        </div>
      </div>

      <!-- Right side -->
      <div class="navbar-right" v-if="!isLoading">

        <!-- Credits pill -->
        <div class="credits-pill" v-if="smsCredits !== null">
          <i class="fas fa-sms"></i>
          <span class="credits-val">{{ formattedSmsCredits }}</span>
          <span class="credits-lbl">SMS</span>
        </div>

        <!-- Notifications -->
       

        <!-- Profile -->
        <div class="nav-item-wrap" ref="profileRef">
          <button class="profile-btn" @click="toggleProfile">
            <img :src="userAvatar" :alt="userName" class="p-avatar" />
            <span class="p-name">{{ userName }}</span>
            <i class="fas fa-chevron-down p-chev"></i>
          </button>

          <div class="dropdown profile-drop" v-show="showProfile">
            <div class="p-info">
              <img :src="userAvatar" :alt="userName" class="p-avatar-lg" />
              <div>
                <div class="p-name-lg">{{ userName }}</div>
                <div class="p-email">{{ userEmail }}</div>
                <div class="p-role" v-if="userRole">{{ userRole }}</div>
                <div class="p-credits" v-if="smsCredits !== null">
                  <i class="fas fa-sms"></i> {{ formattedSmsCredits }} SMS
                </div>
              </div>
            </div>
            <div class="divider"></div>
            <router-link to="/perfil"         class="d-item" @click="showProfile=false"><i class="fas fa-user"></i> Meu Perfil</router-link>
              <template v-if="isAdmin">
              <div class="divider"></div>
              <router-link to="/admpainel" class="d-item" @click="showProfile=false"><i class="fas fa-chart-line"></i> Painel Admin</router-link>
            </template>
            <div class="divider"></div>
            <router-link to="/ajuda" class="d-item" @click="showProfile=false"><i class="fas fa-question-circle"></i> Ajuda</router-link>
            <button class="d-item d-item--danger" @click="handleLogout" :disabled="isLoggingOut">
              <i :class="isLoggingOut ? 'fas fa-spinner fa-spin' : 'fas fa-sign-out-alt'"></i>
              {{ isLoggingOut ? 'Saindo...' : 'Sair' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-else class="navbar-loading">
        <i class="fas fa-spinner fa-spin"></i>
      </div>

    </div>
  </nav>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Navbar',

  props: {
    showSearch:       { type: Boolean, default: true },
    sidebarCollapsed: { type: Boolean, default: false },
  },

  data() {
    return {
      showNotif:   false,
      showProfile: false,
      isLoading:   true,
      isLoggingOut: false,
      user: null,
      smsCredits: null,
      unreadCount: 3,

      // 🔑 Estado interno da sidebar (sincronizado via evento global)
      internalCollapsed: false,

      searchQuery: '',
      showSuggestions: false,
      searchResults:   [],
      isSearching:     false,
      searchTimer:     null,

      notifications: [
        { id:1, title:'SMS Enviado',    message:'150 mensagens enviadas',    time:'Há 2h',  icon:'fas fa-paper-plane',        iconColor:'#10B981', bgColor:'rgba(16,185,129,.1)',  read:false },
        { id:2, title:'Novos Contactos',message:'25 contactos importados',   time:'Há 5h',  icon:'fas fa-user-plus',          iconColor:'#3B82F6', bgColor:'rgba(59,130,246,.1)',  read:false },
        { id:3, title:'Créditos Baixos',message:'Apenas 420 créditos restantes', time:'Há 1d', icon:'fas fa-exclamation-triangle', iconColor:'#F59E0B', bgColor:'rgba(245,158,11,.1)', read:false },
      ],
    };
  },

  computed: {
    // 🔑 navLeft agora usa internalCollapsed para ficar sempre sincronizado
    navLeft() {
      if (window.innerWidth <= 768) return '0';
      return this.internalCollapsed ? '68px' : '240px';
    },
    userName()  { if (!this.user) return 'Utilizador'; return this.user.name || this.user.admin_name || 'Utilizador'; },
    userEmail() { if (!this.user) return ''; return this.user.email || ''; },
    userAvatar() {
      if (this.user?.avatar) return this.user.avatar;
      const n = (this.userName).replace(/[^a-zA-Z\s]/g,'');
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(n)}&background=3b82f6&color=fff&size=128`;
    },
    userRole() {
      const t = localStorage.getItem('user_type');
      if (t === 'admin') return 'Administrador';
      if (t === 'company') return 'Empresa';
      return this.user?.role || '';
    },
    formattedSmsCredits() {
      if (this.smsCredits === null) return '0';
      return this.smsCredits.toLocaleString('pt-AO');
    },
    isAdmin() {
      if (localStorage.getItem('user_type') === 'admin') return true;
      const r = this.user?.role;
      return ['admin','administrator','Admin','super_admin'].includes(r) || r === true || r === 1;
    },
  },

  methods: {
    openSidebar() { window.dispatchEvent(new Event('sidebar-open')); },

    // ── Search ──
    onSearchInput() {
      clearTimeout(this.searchTimer);
      this.searchResults = [];
      if (this.searchQuery.length < 2) { this.isSearching = false; return; }
      this.isSearching = true;
      this.searchTimer = setTimeout(() => this.fetchSearch(), 400);
    },
    async fetchSearch() {
      const token = localStorage.getItem('auth_token');
      if (!token || this.searchQuery.length < 2) { this.isSearching = false; return; }
      try {
        const res = await axios.get('https://api.devsms.online/api/v1/clients', {
          params: { search: this.searchQuery.trim(), per_page: 6 },
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
        });
        const contacts = res.data.data?.data || [];
        const colors = ['#3B82F6','#10B981','#F59E0B','#8B5CF6','#EF4444','#06B6D4'];
        this.searchResults = contacts.map((c,i) => ({ ...c, avatarColor: c.category?.color || colors[i%colors.length] }));
      } catch { this.searchResults = []; }
      finally { this.isSearching = false; }
    },
    executeSearch() {
      if (!this.searchQuery.trim()) return;
      this.showSuggestions = false;
      this.$router.push({ path: '/meucontatos', query: { search: this.searchQuery.trim() } });
    },
    goToContact(c) {
      this.showSuggestions = false;
      this.searchQuery = '';
      this.$router.push({ path: '/meucontatos', query: { search: c.name } });
    },
    clearSearch() { this.searchQuery=''; this.searchResults=[]; this.showSuggestions=false; this.isSearching=false; clearTimeout(this.searchTimer); },
    onBlur() { setTimeout(() => { this.showSuggestions = false; }, 150); },
    highlightMatch(text, q) {
      if (!q || !text) return text;
      const e = q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      return text.replace(new RegExp(`(${e})`, 'gi'), '<mark>$1</mark>');
    },
    getInitials(name) {
      if (!name) return '?';
      const p = name.split(' ');
      return p.length >= 2 ? (p[0][0]+p[p.length-1][0]).toUpperCase() : name.substring(0,2).toUpperCase();
    },

    // ── User ──
    async fetchUserData() {
      this.isLoading = true;
      const token = localStorage.getItem('auth_token');
      if (!token) { this.isLoading = false; return; }
      try {
        const res = await axios.get('https://api.devsms.online/api/v1/auth/me', {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
        });
        this.user = res.data.user || res.data.data || res.data;
        await this.fetchBalance(token);
      } catch (e) {
        if ([401,403].includes(e.response?.status)) {
          ['auth_token','user_type','user_data'].forEach(k => localStorage.removeItem(k));
          this.$router.push('/login');
        }
      } finally { this.isLoading = false; }
    },
    async fetchBalance(token) {
      try {
        const res = await axios.get('https://api.devsms.online/api/v1/subscription/balance', {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
        });
        this.smsCredits = res.data.data?.sms_available ?? 0;
      } catch { this.smsCredits = 0; }
    },
    async handleLogout() {
      if (this.isLoggingOut) return;
      if (!confirm('Tem certeza que deseja sair?')) return;
      this.isLoggingOut = true;
      const token = localStorage.getItem('auth_token');
      try { await axios.post('https://api.devsms.online/api/v1/auth/logout', {}, { headers: { Authorization: `Bearer ${token}` } }); } catch {}
      finally {
        ['auth_token','user_type','user_data'].forEach(k => localStorage.removeItem(k));
        this.isLoggingOut = false;
        window.location.href = '/';
      }
    },

    toggleNotif()   { this.showNotif   = !this.showNotif;   this.showProfile = false; },
    toggleProfile() { this.showProfile = !this.showProfile; this.showNotif   = false; },
    markAllRead()   { this.notifications.forEach(n => n.read = true); this.unreadCount = 0; },
    readNotif(n)    { n.read = true; this.unreadCount = this.notifications.filter(n => !n.read).length; },

    handleClickOutside(e) {
      if (this.$refs.notifRef   && !this.$refs.notifRef.contains(e.target))   this.showNotif   = false;
      if (this.$refs.profileRef && !this.$refs.profileRef.contains(e.target)) this.showProfile = false;
    },

    // 🔑 Ouve o evento global da sidebar para sincronizar o left da navbar
    onSidebarCollapse(e) {
      this.internalCollapsed = e.detail.collapsed;
    },
  },

  mounted() {
    // Sincroniza estado inicial com localStorage
    const saved = localStorage.getItem('sidebar_collapsed');
    this.internalCollapsed = saved === 'true';

    this.fetchUserData();
    document.addEventListener('click', this.handleClickOutside);
    window.addEventListener('credits-updated', (e) => { if (e.detail?.credits !== undefined) this.smsCredits = e.detail.credits; });
    window.addEventListener('auth-changed', () => this.fetchUserData());
    // 🔑 Escuta colapso da sidebar
    window.addEventListener('sidebar-collapse', this.onSidebarCollapse);
  },
  beforeUnmount() {
    clearTimeout(this.searchTimer);
    document.removeEventListener('click', this.handleClickOutside);
    window.removeEventListener('sidebar-collapse', this.onSidebarCollapse);
  },
};
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  right: 0;
  height: 70px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  z-index: 800;
  box-shadow: 0 1px 3px rgba(0,0,0,.06);
  /* 🔑 Transição igual à sidebar para movimento sincronizado */
  transition: left 0.28s cubic-bezier(.4,0,.2,1);
}

.navbar-container {
  height: 100%;
  padding: 0 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

/* ── Hamburger (mobile) ── */
.hamburger {
  display: none;
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
  flex-shrink: 0;
}
.hamburger:hover { background: #f3f4f6; color: #111827; }

@media (max-width: 768px) {
  .hamburger { display: flex; align-items: center; justify-content: center; }
  .navbar    { left: 0 !important; }
}

/* ── Brand mobile ── */
.brand-mobile {
  display: none;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  font-weight: 800;
  color: #111827;
  font-size: 1rem;
  flex-shrink: 0;
}
.brand-mobile i { color: #3b82f6; font-size: 1.125rem; }
@media (max-width: 768px) { .brand-mobile { display: flex; } }

/* ── Search ── */
.navbar-search {
  flex: 1;
  max-width: 480px;
  position: relative;
}

.search-ico {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.navbar-search:focus-within .search-ico { color: #3b82f6; }

.navbar-search input {
  width: 100%;
  padding: 0.65rem 2.5rem 0.65rem 2.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9rem;
  background: #f9fafb;
  color: #111827;
  transition: all 0.2s;
  box-sizing: border-box;
}

.navbar-search input:focus {
  outline: none;
  border-color: #3b82f6;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(59,130,246,.1);
}

.search-clear {
  position: absolute;
  right: 2.25rem;
  top: 50%;
  transform: translateY(-50%);
  background: #e5e7eb;
  border: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.55rem;
  color: #6b7280;
  transition: all 0.2s;
}
.search-clear:hover { background: #d1d5db; }

.search-spinner {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #3b82f6;
  font-size: 0.8rem;
}

/* Dropdown */
.search-drop {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,.12);
  overflow: hidden;
  z-index: 2000;
  animation: dropIn .15s ease;
}

@keyframes dropIn { from{opacity:0;transform:translateY(-6px);} to{opacity:1;transform:none;} }

.drop-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #f9fafb;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.72rem;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.drop-count {
  background: #e5e7eb;
  padding: 0.1rem 0.45rem;
  border-radius: 10px;
  font-size: 0.65rem;
}

.drop-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f9fafb;
}
.drop-item:hover { background: #eff6ff; }

.drop-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 0.78rem;
  flex-shrink: 0;
}

.drop-info { flex: 1; min-width: 0; }
.drop-name { font-size: 0.9rem; font-weight: 600; color: #111827; }
.drop-name :deep(mark) { background: rgba(59,130,246,.15); color: #1d4ed8; border-radius: 3px; padding: 0 2px; font-weight: 700; }
.drop-phone { font-size: 0.78rem; color: #6b7280; display: flex; align-items: center; gap: 0.3rem; }
.drop-cat { font-size: 0.72rem; font-weight: 600; white-space: nowrap; }

.drop-footer {
  padding: 0.65rem 1rem;
  background: #f9fafb;
  border-top: 1px solid #f3f4f6;
  font-size: 0.838rem;
  color: #3b82f6;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  transition: background 0.15s;
}
.drop-footer:hover { background: #eff6ff; }

.drop-empty, .drop-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}
.drop-loading i { color: #3b82f6; }

/* ── Right side ── */
.navbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
  flex-shrink: 0;
}

.navbar-loading {
  margin-left: auto;
  color: #9ca3af;
  font-size: 1.125rem;
}

/* Credits pill */
.credits-pill {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.45rem 0.875rem;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  border-radius: 30px;
  color: white;
  font-size: 0.813rem;
  font-weight: 700;
  white-space: nowrap;
  transition: transform 0.2s, box-shadow 0.2s;
}
.credits-pill:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59,130,246,.35); }
.credits-val { font-size: 0.938rem; }
.credits-lbl { opacity: 0.85; font-size: 0.75rem; }

@media (max-width: 1024px) { .credits-lbl { display: none; } }

/* Icon btn (bell) */
.nav-item-wrap { position: relative; }

.icon-btn {
  position: relative;
  background: none;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  font-size: 1.125rem;
  transition: all 0.2s;
}
.icon-btn:hover { background: #f3f4f6; color: #3b82f6; }

.notif-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: #ef4444;
  color: white;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0.1rem 0.35rem;
  border-radius: 10px;
  min-width: 16px;
  text-align: center;
}

/* Profile button */
.profile-btn {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  background: none;
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s;
}
.profile-btn:hover { background: #f3f4f6; }

.p-avatar { width: 34px; height: 34px; border-radius: 8px; object-fit: cover; }
.p-name   { font-weight: 600; color: #111827; font-size: 0.9rem; }
.p-chev   { color: #9ca3af; font-size: 0.688rem; }

@media (max-width: 1024px) { .p-name, .p-chev { display: none; } }

/* Dropdown base */
.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 10px 40px rgba(0,0,0,.12);
  min-width: 300px;
  z-index: 1100;
  overflow: hidden;
  animation: dropIn .15s ease;
}

/* Notif dropdown */
.notif-drop .drop-hd {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}
.notif-drop .drop-hd h4 { margin: 0; font-size: 1rem; font-weight: 700; color: #111827; }

.notif-list { max-height: 340px; overflow-y: auto; }

.notif-item {
  display: flex;
  gap: 0.875rem;
  padding: 0.875rem 1.25rem;
  cursor: pointer;
  transition: background 0.15s;
  border-left: 3px solid transparent;
}
.notif-item:hover { background: #f9fafb; }
.notif-item.unread { background: rgba(59,130,246,.04); border-left-color: #3b82f6; }

.notif-ico {
  width: 38px;
  height: 38px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notif-body { flex: 1; }
.notif-title { font-weight: 700; color: #111827; font-size: 0.875rem; margin-bottom: 0.2rem; }
.notif-msg   { color: #6b7280; font-size: 0.813rem; margin-bottom: 0.2rem; }
.notif-time  { color: #9ca3af; font-size: 0.75rem; }

.drop-ft { padding: 0.75rem 1.25rem; border-top: 1px solid #e5e7eb; text-align: center; }

.txt-btn {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.813rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: color 0.15s;
}
.txt-btn:hover { color: #1d4ed8; }

/* Profile dropdown */
.profile-drop { min-width: 280px; }

.p-info { display: flex; gap: 0.875rem; padding: 1.25rem; align-items: center; }
.p-avatar-lg { width: 52px; height: 52px; border-radius: 12px; object-fit: cover; }
.p-name-lg  { font-weight: 700; color: #111827; font-size: 0.975rem; }
.p-email    { color: #6b7280; font-size: 0.813rem; margin-top: 0.15rem; }
.p-role     { color: #3b82f6; font-size: 0.75rem; font-weight: 700; margin-top: 0.25rem; }
.p-credits  { display: flex; align-items: center; gap: 0.35rem; color: #3b82f6; font-size: 0.75rem; font-weight: 700; margin-top: 0.35rem; background: rgba(59,130,246,.1); padding: 0.2rem 0.5rem; border-radius: 6px; width: fit-content; }

.divider { height: 1px; background: #f3f4f6; margin: 0.375rem 0; }

.d-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 1.25rem;
  color: #4b5563;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.15s;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}
.d-item:hover { background: #f3f4f6; color: #3b82f6; }
.d-item i { width: 18px; font-size: 0.938rem; }
.d-item--danger { color: #ef4444; }
.d-item--danger:hover { background: #fef2f2; color: #dc2626; }
.d-item:disabled { opacity: 0.5; cursor: not-allowed; }
</style>