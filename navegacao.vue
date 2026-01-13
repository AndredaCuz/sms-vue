<template>
  <nav class="navbar">
    <div class="navbar-container">
      <!-- Logo e Brand -->
      <div class="navbar-brand">
        <button class="menu-toggle" @click="toggleSidebar" v-if="showMenuToggle">
          <i class="fas fa-bars"></i>
        </button>
        <router-link to="/dashboard" class="brand-logo">
          <i class="fas fa-message" style="font-size: 1.5rem; color: var(--primary);"></i>
          <span class="brand-name">SMS Manager</span>
        </router-link>
      </div>

      <!-- Search Bar (opcional) -->
      <div class="navbar-search" v-if="showSearch">
        <i class="fas fa-search"></i>
        <input 
          type="text" 
          placeholder="Pesquisar contatos, grupos..." 
          v-model="searchQuery"
          @input="handleSearch"
        />
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="navbar-loading">
        <i class="fas fa-spinner fa-spin"></i>
      </div>

      <!-- Actions -->
      <div class="navbar-actions" v-else>
        <!-- Créditos -->
        <div class="credits-display">
          <i class="fas fa-wallet"></i>
          <span class="credits-amount">{{ formattedCredits }}</span>
          <span class="credits-label">créditos</span>
        </div>

        <!-- Notificações -->
        <div class="navbar-item dropdown" ref="notificationDropdown">
          <button class="icon-button" @click="toggleNotifications">
            <i class="fas fa-bell"></i>
            <span class="notification-badge" v-if="unreadNotifications > 0">
              {{ unreadNotifications }}
            </span>
          </button>
          
          <!-- Dropdown Notificações -->
          <div class="dropdown-menu" v-show="showNotifications">
            <div class="dropdown-header">
              <h4>Notificações</h4>
              <button class="text-button" @click="markAllAsRead">
                Marcar todas como lidas
              </button>
            </div>
            <div class="notifications-list">
              <div 
                v-for="notification in notifications" 
                :key="notification.id"
                class="notification-item"
                :class="{ 'unread': !notification.read }"
                @click="handleNotificationClick(notification)"
              >
                <div class="notification-icon" :style="{ background: notification.bgColor }">
                  <i :class="notification.icon" :style="{ color: notification.iconColor }"></i>
                </div>
                <div class="notification-content">
                  <div class="notification-title">{{ notification.title }}</div>
                  <div class="notification-message">{{ notification.message }}</div>
                  <div class="notification-time">{{ notification.time }}</div>
                </div>
              </div>
            </div>
            <div class="dropdown-footer">
              <router-link to="/notificacoes" class="text-button">
                Ver todas as notificações
              </router-link>
            </div>
          </div>
        </div>

        <!-- Perfil do Usuário -->
        <div class="navbar-item dropdown" ref="profileDropdown">
          <button class="profile-button" @click="toggleProfile">
            <img :src="userAvatar" :alt="userName" class="profile-avatar" />
            <span class="profile-name">{{ userName }}</span>
            <i class="fas fa-chevron-down"></i>
          </button>

          <!-- Dropdown Perfil -->
          <div class="dropdown-menu dropdown-menu-right" v-show="showProfile">
            <div class="profile-info">
              <img :src="userAvatar" :alt="userName" class="profile-avatar-large" />
              <div>
                <div class="profile-name-large">{{ userName }}</div>
                <div class="profile-email">{{ userEmail }}</div>
                <div class="profile-role" v-if="userRole">{{ userRole }}</div>
              </div>
            </div>
            <div class="dropdown-divider"></div>
            <router-link to="/perfil" class="dropdown-item" @click="showProfile = false">
              <i class="fas fa-user"></i>
              Meu Perfil
            </router-link>
            <router-link to="/configuracoes" class="dropdown-item" @click="showProfile = false">
              <i class="fas fa-cog"></i>
              Configurações
            </router-link>
            <router-link to="/lista_empresa" class="dropdown-item" @click="showProfile = false">
              <i class="fas fa-wallet"></i>
              Empresa Adm
            </router-link>
            <div class="dropdown-divider"></div>
            <router-link to="/ajuda" class="dropdown-item" @click="showProfile = false">
              <i class="fas fa-question-circle"></i>
              Ajuda & Suporte
            </router-link>
            <button class="dropdown-item" @click="handleLogout" :disabled="isLoggingOut">
              <i :class="isLoggingOut ? 'fas fa-spinner fa-spin' : 'fas fa-sign-out-alt'"></i>
              {{ isLoggingOut ? 'Saindo...' : 'Sair' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Navbar',
  props: {
    showSearch: {
      type: Boolean,
      default: true
    },
    showMenuToggle: {
      type: Boolean,
      default: true
    }
  },
  emits: ['toggle-sidebar', 'search'],
  data() {
    return {
      showNotifications: false,
      showProfile: false,
      searchQuery: '',
      isLoading: true,
      isLoggingOut: false,
      
      // Dados do usuário
      user: null,
      credits: 0,
      unreadNotifications: 3,
      
      // Notificações (temporário - pode vir da API depois)
      notifications: [
        {
          id: 1,
          title: 'SMS Enviado',
          message: '150 mensagens enviadas para o grupo "Vendedores"',
          time: 'Há 2 horas',
          icon: 'fas fa-paper-plane',
          iconColor: '#10B981',
          bgColor: 'rgba(16, 185, 129, 0.1)',
          read: false
        },
        {
          id: 2,
          title: 'Novos Contatos',
          message: '25 contatos importados via Excel',
          time: 'Há 5 horas',
          icon: 'fas fa-user-plus',
          iconColor: '#3B82F6',
          bgColor: 'rgba(59, 130, 246, 0.1)',
          read: false
        },
        {
          id: 3,
          title: 'Créditos Baixos',
          message: 'Você tem apenas 420 créditos restantes',
          time: 'Há 1 dia',
          icon: 'fas fa-exclamation-triangle',
          iconColor: '#F59E0B',
          bgColor: 'rgba(245, 158, 11, 0.1)',
          read: false
        }
      ]
    };
  },
  computed: {
    userName() {
      if (!this.user) return 'Usuário';
      return this.user.name || this.user.admin_name || this.user.company_name || 'Usuário';
    },
    userEmail() {
      if (!this.user) return '';
      return this.user.email || this.user.admin_email || this.user.company_email || '';
    },
    userAvatar() {
      if (!this.user) {
        return 'https://ui-avatars.com/api/?name=User&background=F59E0B&color=fff&size=128';
      }
      
      // Se tiver avatar customizado na API
      if (this.user.avatar) {
        return this.user.avatar;
      }
      
      // Gerar avatar com iniciais
      const name = this.userName.replace(/[^a-zA-Z\s]/g, '');
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=F59E0B&color=fff&size=128`;
    },
    userRole() {
      if (!this.user) return '';
      
      const userType = localStorage.getItem('user_type');
      if (userType === 'admin') {
        return 'Administrador';
      } else if (userType === 'company') {
        return 'Empresa';
      }
      
      return this.user.role || '';
    },
    formattedCredits() {
      if (!this.credits && this.credits !== 0) return '0';
      return this.credits.toLocaleString('pt-AO');
    }
  },
  methods: {
    async fetchUserData() {
      this.isLoading = true;
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        console.error('Token não encontrado');
        this.isLoading = false;
        
        // Não redirecionar imediatamente, dar tempo para o login completar
        setTimeout(() => {
          const tokenCheck = localStorage.getItem('auth_token');
          if (!tokenCheck && this.$route.path !== '/login' && this.$route.path !== '/register') {
            this.$router.push('/login');
          }
        }, 1000);
        return;
      }

      try {
        const response = await axios.get('https://api.devsms.online/api/v1/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        this.user = response.data.user || response.data.data || response.data;
        
        // Extrair créditos se disponível
        this.credits = this.user.credits || this.user.balance || this.user.sms_credits || 0;
        
        console.log('Dados do usuário carregados:', this.user);
        
      } catch (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        
        if (error.response) {
          if (error.response.status === 401 || error.response.status === 403) {
            // Token inválido ou expirado
            console.log('Token inválido, limpando sessão');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_type');
            localStorage.removeItem('user_data');
            
            // Redirecionar apenas se não estiver na tela de login
            if (this.$route.path !== '/login' && this.$route.path !== '/register') {
              setTimeout(() => {
                this.$router.push('/login');
              }, 500);
            }
          } else {
            console.error('Erro da API:', error.response.data);
            
            // Tentar usar dados do localStorage como fallback
            const userData = localStorage.getItem('user_data');
            if (userData) {
              try {
                this.user = JSON.parse(userData);
                console.log('Usando dados do cache:', this.user);
              } catch (e) {
                console.error('Erro ao parsear dados do cache');
              }
            }
          }
        }
      } finally {
        this.isLoading = false;
      }
    },
    
    async handleLogout() {
      if (this.isLoggingOut) return;
      
      // Confirmar logout
      if (!confirm('Tem certeza que deseja sair?')) {
        return;
      }
      
      this.isLoggingOut = true;
      const token = localStorage.getItem('auth_token');

      try {
        // Chamar API de logout (corrigindo o endpoint - logout não logut)
        await axios.post('https://api.devsms.online/api/v1/auth/logout', {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        
        console.log('Logout realizado com sucesso');
        
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
        // Mesmo com erro, vamos limpar os dados locais
      } finally {
        // Limpar dados locais
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_type');
        localStorage.removeItem('user_data');
        
        // Redirecionar para login
        this.$router.push('/login');
        
        this.isLoggingOut = false;
      }
    },
    
    toggleSidebar() {
      this.$emit('toggle-sidebar');
    },
    
    toggleNotifications() {
      this.showNotifications = !this.showNotifications;
      this.showProfile = false;
    },
    
    toggleProfile() {
      this.showProfile = !this.showProfile;
      this.showNotifications = false;
    },
    
    handleSearch() {
      this.$emit('search', this.searchQuery);
    },
    
    markAllAsRead() {
      this.notifications.forEach(n => n.read = true);
      this.unreadNotifications = 0;
    },
    
    handleNotificationClick(notification) {
      notification.read = true;
      this.unreadNotifications = this.notifications.filter(n => !n.read).length;
      // Adicione navegação ou ação específica aqui
    },
    
    handleClickOutside(event) {
      if (this.$refs.notificationDropdown && !this.$refs.notificationDropdown.contains(event.target)) {
        this.showNotifications = false;
      }
      if (this.$refs.profileDropdown && !this.$refs.profileDropdown.contains(event.target)) {
        this.showProfile = false;
      }
    }
  },
  mounted() {
    // Buscar dados do usuário ao montar o componente
    this.fetchUserData();
    
    // Adicionar listener para fechar dropdowns ao clicar fora
    document.addEventListener('click', this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }
};
</script>

<style scoped>
.navbar {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  height: 70px;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.navbar-container {
  max-width: 100%;
  height: 100%;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6B7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s;
}

.menu-toggle:hover {
  background: #F3F4F6;
  color: #F59E0B;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  transition: transform 0.2s;
}

.brand-logo:hover {
  transform: scale(1.05);
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F2937;
  white-space: nowrap;
}

.navbar-search {
  flex: 1;
  max-width: 500px;
  position: relative;
}

.navbar-search i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9CA3AF;
}

.navbar-search input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  font-size: 0.938rem;
  transition: all 0.2s;
}

.navbar-search input:focus {
  outline: none;
  border-color: #F59E0B;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.navbar-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #9CA3AF;
  font-size: 1.25rem;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-shrink: 0;
}

.credits-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #10B981, #059669);
  border-radius: 10px;
  color: white;
  font-weight: 600;
}

.credits-display i {
  font-size: 1.125rem;
}

.credits-amount {
  font-size: 1.125rem;
}

.credits-label {
  font-size: 0.813rem;
  opacity: 0.9;
}

.navbar-item {
  position: relative;
}

.icon-button {
  position: relative;
  background: none;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #6B7280;
  font-size: 1.25rem;
}

.icon-button:hover {
  background: #F3F4F6;
  color: #F59E0B;
}

.notification-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #EF4444;
  color: white;
  font-size: 0.688rem;
  font-weight: 700;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.profile-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: none;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.profile-button:hover {
  background: #F3F4F6;
}

.profile-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.profile-avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  object-fit: cover;
}

.profile-name {
  font-weight: 600;
  color: #1F2937;
  font-size: 0.938rem;
}

.profile-button i {
  color: #9CA3AF;
  font-size: 0.75rem;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  min-width: 320px;
  z-index: 1001;
  overflow: hidden;
}

.dropdown-menu-right {
  left: auto;
  right: 0;
}

.dropdown-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #E5E7EB;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dropdown-header h4 {
  font-size: 1rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
}

.text-button {
  background: none;
  border: none;
  color: #F59E0B;
  font-size: 0.813rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-decoration: none;
}

.text-button:hover {
  color: #D97706;
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: background 0.2s;
  border-left: 3px solid transparent;
}

.notification-item:hover {
  background: #F9FAFB;
}

.notification-item.unread {
  background: rgba(245, 158, 11, 0.05);
  border-left-color: #F59E0B;
}

.notification-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  color: #1F2937;
  font-size: 0.938rem;
  margin-bottom: 0.25rem;
}

.notification-message {
  color: #6B7280;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.notification-time {
  color: #9CA3AF;
  font-size: 0.813rem;
}

.dropdown-footer {
  padding: 0.75rem 1.25rem;
  border-top: 1px solid #E5E7EB;
  text-align: center;
}

.profile-info {
  padding: 1.25rem;
  display: flex;
  gap: 1rem;
  align-items: center;
}

.profile-avatar-large {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  object-fit: cover;
}

.profile-name-large {
  font-weight: 700;
  color: #1F2937;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.profile-email {
  color: #6B7280;
  font-size: 0.875rem;
  margin-bottom: 0.125rem;
}

.profile-role {
  color: #F59E0B;
  font-size: 0.813rem;
  font-weight: 600;
  margin-top: 0.25rem;
}

.dropdown-divider {
  height: 1px;
  background: #E5E7EB;
  margin: 0.5rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  color: #4B5563;
  text-decoration: none;
  font-size: 0.938rem;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
}

.dropdown-item:hover:not(:disabled) {
  background: #F3F4F6;
  color: #F59E0B;
}

.dropdown-item:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dropdown-item i {
  width: 20px;
  font-size: 1rem;
}

/* Responsivo */
@media (max-width: 1024px) {
  .navbar-search {
    max-width: 300px;
  }
  
  .credits-label {
    display: none;
  }
  
  .profile-name {
    display: none;
  }
}

@media (max-width: 768px) {
  .navbar-container {
    padding: 0 1rem;
    gap: 1rem;
  }
  
  .menu-toggle {
    display: flex;
  }
  
  .navbar-search {
    display: none;
  }
  
  .brand-name {
    display: none;
  }
  
  .credits-display {
    padding: 0.5rem 0.75rem;
    gap: 0.375rem;
  }
  
  .credits-amount {
    font-size: 1rem;
  }
  
  .navbar-actions {
    gap: 0.5rem;
  }
}
</style>