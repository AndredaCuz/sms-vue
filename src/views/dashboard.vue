<template>
  <navegacao/>

  <div class="fade-in">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Carregando dados do dashboard...</p>
    </div>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- Stats Cards -->
      <div class="grid grid-4 mb-4">
        <div class="stat-card" v-for="(card, index) in statCards" :key="index">
          <div class="stat-icon" :style="{ background: card.bgColor, color: 'white' }">
            <i :class="card.icon"></i>
          </div>
          <div class="stat-value">{{ card.value }}</div>
          <div class="stat-label">{{ card.label }}</div>
          <div class="stat-trend" :class="card.trendClass">
            <i :class="card.trendIcon"></i>
            <span>{{ card.trendText }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions & Subscription Info -->
      <div class="grid grid-2 mb-4">
        <!-- Quick Actions -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Ações Rápidas</h3>
          </div>
          <div class="card-body">
            <div style="display: grid; gap: 1rem;">
             
<router-link to="/meucontatos" class="btn btn-primary w-100 mb-2">
  <i class="fas fa-address-book me-2"></i> Meus Contactos
</router-link>

<router-link to="/verplanos" class="btn btn-dark w-100 mb-2 text-white">
  <i class="fas fa-box-open me-2"></i> Ver Planos
</router-link>

<router-link to="/credito" class="btn btn-success w-100 mb-2">
  <i class="fas fa-credit-card me-2"></i> Assinaturas
</router-link>

<router-link to="/categorias" class="btn btn-warning w-100 mb-2">
  <i class="fas fa-tags me-2"></i> Categorias
</router-link>

<router-link to="/lista_template" class="btn btn-purple w-100 mb-2 text-white">
  <i class="fas fa-file-alt me-2"></i> Templates
</router-link>

<router-link to="/lista_black" class="btn btn-danger w-100 mb-2">
  <i class="fas fa-ban me-2"></i> Lista Negra
</router-link>
            </div>
          </div>
        </div>

        <!-- Subscription Info -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Informações da Assinatura</h3>
          </div>
          <div class="card-body">
            <div class="subscription-info">
              <div class="plan-badge">
                <i class="fas fa-crown"></i>
                {{ subscription.plan_name }}
              </div>
              
              <div class="sms-usage">
                <div class="usage-header">
                  <span>SMS Utilizados</span>
                  <span class="usage-numbers">{{ subscription.sms_used }} / {{ subscription.sms_total }}</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ 
                    width: Math.min(subscription.usage_percentage, 100) + '%',
                    background: subscription.usage_percentage > 80 ? 'var(--danger)' : 'var(--success)'
                  }"></div>
                </div>
                <div class="usage-text">
                  {{ subscription.usage_percentage }}% utilizado
                </div>
              </div>

              <div class="sms-available">
                <div class="available-box" :class="subscription.sms_available === 0 ? 'danger' : 'success'">
                  <i class="fas fa-inbox"></i>
                  <div>
                    <div class="available-number">{{ subscription.sms_available }}</div>
                    <div class="available-label">SMS Disponíveis</div>
                  </div>
                </div>
              </div>

              <div class="renewal-info">
                <i class="far fa-calendar-alt"></i>
                <span>Renovação em <strong>{{ Math.ceil(subscription.days_until_renewal) }} dias</strong></span>
              </div>

              <div class="status-badge" :class="subscription.status">
                <i class="fas fa-circle"></i> {{ getStatusText(subscription.status) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SMS Stats & Charts -->
      <div class="grid grid-2 mb-4">
        <!-- SMS deste Mês -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">SMS deste Mês</h3>
          </div>
          <div class="card-body">
            <div class="sms-month-stats">
              <div class="month-stat-item">
                <div class="month-stat-icon" style="background: var(--info-light);">
                  <i class="fas fa-paper-plane" style="color: var(--info);"></i>
                </div>
                <div>
                  <div class="month-stat-value">{{ smsThisMonth.total }}</div>
                  <div class="month-stat-label">Total Enviados</div>
                </div>
              </div>

              <div class="month-stat-item">
                <div class="month-stat-icon" style="background: var(--success-light);">
                  <i class="fas fa-check-circle" style="color: var(--success);"></i>
                </div>
                <div>
                  <div class="month-stat-value">{{ smsThisMonth.sent }}</div>
                  <div class="month-stat-label">Enviados</div>
                </div>
              </div>

              <div class="month-stat-item">
                <div class="month-stat-icon" style="background: var(--success-light);">
                  <i class="fas fa-check-double" style="color: var(--success);"></i>
                </div>
                <div>
                  <div class="month-stat-value">{{ smsThisMonth.delivered }}</div>
                  <div class="month-stat-label">Entregues</div>
                </div>
              </div>

              <div class="month-stat-item">
                <div class="month-stat-icon" style="background: var(--danger-light);">
                  <i class="fas fa-times-circle" style="color: var(--danger);"></i>
                </div>
                <div>
                  <div class="month-stat-value">{{ smsThisMonth.failed }}</div>
                  <div class="month-stat-label">Falharam</div>
                </div>
              </div>

              <div class="month-cost">
                <div class="cost-label">Custo Total</div>
                <div class="cost-value">{{ formatCurrency(smsThisMonth.total_cost) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Campanhas -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">Resumo de Campanhas</h3>
          </div>
          <div class="card-body">
            <div class="campaigns-summary">
              <div class="campaign-stat">
                <div class="campaign-number total">{{ stats.total_campaigns }}</div>
                <div class="campaign-label">Total de Campanhas</div>
              </div>

              <div class="campaigns-grid">
                <div class="campaign-box active">
                  <i class="fas fa-play-circle"></i>
                  <div class="campaign-box-number">{{ stats.active_campaigns }}</div>
                  <div class="campaign-box-label">Ativas</div>
                </div>

                <div class="campaign-box completed">
                  <i class="fas fa-check-circle"></i>
                  <div class="campaign-box-number">{{ stats.completed_campaigns }}</div>
                  <div class="campaign-box-label">Concluídas</div>
                </div>
              </div>

              <router-link to="/lista_campanhas" class="btn btn-primary w-100">
                <i class="fas fa-bullhorn"></i> Ver Todas as Campanhas
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="grid grid-3 mb-4">
        <!-- Histórico de SMS -->
        <div class="card feature-card">
          <div class="card-body text-center">
            <div class="feature-icon history">
              <i class="fas fa-history"></i>
            </div>
            <h4 class="feature-title">Histórico de SMS</h4>
            <p class="feature-description">Visualize todo o histórico de mensagens enviadas</p>
            <router-link to="/historicosms" class="btn btn-primary w-100">
              <i class="fas fa-eye"></i> Ver Histórico
            </router-link>
          </div>
        </div>

        <!-- Relatórios de Consumo -->
        <div class="card feature-card">
          <div class="card-body text-center">
            <div class="feature-icon consumption">
              <i class="fas fa-chart-pie"></i>
            </div>
            <h4 class="feature-title">Relatórios de Consumo</h4>
            <p class="feature-description">Análises detalhadas do seu consumo de SMS</p>
            <router-link to="/relatorios-consumo" class="btn btn-primary w-100">
              <i class="fas fa-chart-line"></i> Ver Relatórios
            </router-link>
          </div>
        </div>

        <!-- Resumo de Campanhas Detalhado -->
        <div class="card feature-card">
          <div class="card-body text-center">
            <div class="feature-icon campaigns">
              <i class="fas fa-bullhorn"></i>
            </div>
            <h4 class="feature-title">Análise de Campanhas</h4>
            <p class="feature-description">Métricas detalhadas de cada campanha</p>
            <router-link to="/campanhas" class="btn btn-primary w-100">
              <i class="fas fa-chart-bar"></i> Ver Análises
            </router-link>
          </div>
        </div>
      </div>

      <!-- Clientes Stats -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Estatísticas de Clientes</h3>
        </div>
        <div class="card-body">
          <div class="clients-stats">
            <div class="client-stat-box">
              <div class="client-stat-icon" style="background: var(--primary-light);">
                <i class="fas fa-users" style="color: var(--primary);"></i>
              </div>
              <div>
                <div class="client-stat-value">{{ stats.total_clients }}</div>
                <div class="client-stat-label">Total de Clientes</div>
              </div>
            </div>

            <div class="client-stat-box">
              <div class="client-stat-icon" style="background: var(--success-light);">
                <i class="fas fa-user-check" style="color: var(--success);"></i>
              </div>
              <div>
                <div class="client-stat-value">{{ stats.active_clients }}</div>
                <div class="client-stat-label">Clientes Ativos</div>
              </div>
            </div>

            <div class="client-stat-box">
              <div class="client-stat-icon" style="background: var(--warning-light);">
                <i class="fas fa-folder" style="color: var(--warning);"></i>
              </div>
              <div>
                <div class="client-stat-value">{{ stats.total_categories }}</div>
                <div class="client-stat-label">Categorias</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import navegacao from '../components/navegacao.vue';

export default {
  name: 'Dashboard',
  components: {
    navegacao
  },
  data() {
    return {
      isLoading: true,
      stats: {
        total_clients: 0,
        active_clients: 0,
        total_categories: 0,
        total_campaigns: 0,
        active_campaigns: 0,
        completed_campaigns: 0
      },
      smsThisMonth: {
        total: 0,
        sent: '0',
        delivered: '0',
        failed: '0',
        total_cost: '0.00'
      },
      subscription: {
        plan_name: 'Carregando...',
        sms_available: 0,
        sms_used: 0,
        sms_total: 0,
        usage_percentage: 0,
        days_until_renewal: 0,
        status: 'active'
      }
    };
  },
  computed: {
    statCards() {
      return [
        { 
          icon: 'fas fa-inbox', 
          value: this.subscription.sms_available.toLocaleString('pt-AO'), 
          label: 'SMS Disponíveis', 
          trendClass: this.subscription.sms_available > 0 ? 'up' : 'down', 
          trendIcon: this.subscription.sms_available > 0 ? 'fas fa-arrow-up' : 'fas fa-exclamation-triangle', 
          trendText: this.subscription.sms_available > 0 ? 'Disponível' : 'Recarregue!', 
          bgColor: 'linear-gradient(135deg, #10B981, #059669)' 
        },
        { 
          icon: 'fas fa-paper-plane', 
          value: this.smsThisMonth.total.toLocaleString('pt-AO'), 
          label: 'SMS Este Mês', 
          trendClass: 'up', 
          trendIcon:'fas fa-calendar', 
          trendText: 'Mês atual', 
          bgColor: 'linear-gradient(135deg, #3B82F6, #2563EB)' 
        },
        { 
          icon: 'fas fa-users', 
          value: this.stats.total_clients.toLocaleString('pt-AO'), 
          label: 'Total de Clientes', 
          trendClass: 'up', 
          trendIcon:'fas fa-user-check', 
          trendText: `${this.stats.active_clients} ativos`, 
          bgColor: 'linear-gradient(135deg, #F59E0B, #D97706)' 
        },
        { 
          icon: 'fas fa-bullhorn', 
          value: this.stats.total_campaigns, 
          label: 'Campanhas', 
          trendClass: '', 
          trendIcon:'fas fa-play-circle', 
          trendText: `${this.stats.active_campaigns} ativas`, 
          bgColor: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' 
        }
      ];
    }
  },
  methods: {
    async fetchDashboardData() {
      this.isLoading = true;
      const token = localStorage.getItem('auth_token');

      if (!token) {
        console.error('Token não encontrado');
        this.$router.push('/login');
        return;
      }

      try {
        const response = await axios.get('https://api.devsms.online/api/v1/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        console.log('Dados do dashboard:', response.data);

        // Extrair dados da resposta
        const data = response.data.data || response.data;

        // Atualizar stats
        if (data.stats) {
          this.stats = data.stats;
        }

        // Atualizar SMS deste mês
        if (data.sms_this_month) {
          this.smsThisMonth = data.sms_this_month;
        }

        // Atualizar assinatura
        if (data.subscription) {
          this.subscription = data.subscription;
        }

      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);

        if (error.response) {
          if (error.response.status === 401 || error.response.status === 403) {
            console.log('Token inválido, redirecionando para login');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_type');
            localStorage.removeItem('user_data');
            this.$router.push('/login');
          } else {
            console.error('Erro da API:', error.response.data);
          }
        }
      } finally {
        this.isLoading = false;
      }
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA'
      }).format(value);
    },

    getStatusText(status) {
      const statusMap = {
        'active': 'Ativo',
        'inactive': 'Inativo',
        'expired': 'Expirado',
        'suspended': 'Suspenso'
      };
      return statusMap[status] || status;
    }
  },
  mounted() {
    this.fetchDashboardData();

    // Atualizar dados a cada 5 minutos
    setInterval(() => {
      this.fetchDashboardData();
    }, 5 * 60 * 1000);
  }
};
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--gray-200);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.subscription-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.plan-badge {
  background: linear-gradient(135deg, #F59E0B, #D97706);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 700;
  font-size: 1.125rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.sms-usage {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.usage-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: var(--gray-600);
}

.usage-numbers {
  font-weight: 700;
  color: var(--gray-800);
  font-size: 1rem;
}

.progress-bar {
  height: 12px;
  background: var(--gray-200);
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--success);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.usage-text {
  font-size: 0.813rem;
  color: var(--gray-600);
  text-align: center;
}

.sms-available {
  display: flex;
  justify-content: center;
}

.available-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  border: 2px solid;
}

.available-box.success {
  background: var(--success-light);
  border-color: var(--success);
  color: var(--success);
}

.available-box.danger {
  background: var(--danger-light);
  border-color: var(--danger);
  color: var(--danger);
}

.available-box i {
  font-size: 2rem;
}

.available-number {
  font-size: 2rem;
  font-weight: 700;
}

.available-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

.renewal-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--gray-50);
  border-radius: 8px;
  font-size: 0.875rem;
  color: var(--gray-700);
  justify-content: center;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
  align-self: center;
}

.status-badge.active {
  background: var(--success-light);
  color: var(--success);
}

.status-badge.inactive, .status-badge.expired, .status-badge.suspended {
  background: var(--danger-light);
  color: var(--danger);
}

.status-badge i {
  font-size: 0.5rem;
}

.sms-month-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.month-stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--gray-50);
  border-radius: 10px;
}

.month-stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.month-stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-800);
}

.month-stat-label {
  font-size: 0.875rem;
  color: var(--gray-600);
}

.month-cost {
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #F59E0B, #D97706);
  border-radius: 10px;
  text-align: center;
  color: white;
}

.cost-label {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 0.25rem;
}

.cost-value {
  font-size: 1.75rem;
  font-weight: 700;
}

.campaigns-summary {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.campaign-stat {
  text-align: center;
  padding: 1.5rem;
  background: var(--gray-50);
  border-radius: 10px;
}

.campaign-number {
  font-size: 3rem;
  font-weight: 700;
  color: var(--primary);
}

.campaign-label {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin-top: 0.5rem;
}

.campaigns-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.campaign-box {
  padding: 1.5rem;
  border-radius: 10px;
  text-align: center;
}

.campaign-box.active {
  background: var(--success-light);
  color: var(--success);
}

.campaign-box.completed {
  background: var(--info-light);
  color: var(--info);
}

.campaign-box i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.campaign-box-number {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.campaign-box-label {
  font-size: 0.875rem;
  opacity: 0.9;
}

.feature-card {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
  transition: transform 0.3s ease;
}

.feature-icon.history {
  background: linear-gradient(135deg, #3B82F6, #2563EB);
}

.feature-icon.consumption {
  background: linear-gradient(135deg, #10B981, #059669);
}

.feature-icon.campaigns {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
}

.feature-card:hover .feature-icon {
  transform: scale(1.1);
}

.feature-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 0.5rem;
}

.feature-description {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.clients-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.client-stat-box {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: var(--gray-50);
  border-radius: 10px;
}

.client-stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}

.client-stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-800);
}

.client-stat-label {
  font-size: 0.875rem;
  color: var(--gray-600);
}

@media (max-width: 768px) {
  .campaigns-grid {
    grid-template-columns: 1fr;
  }
  
  .clients-stats {
    grid-template-columns: 1fr;
  }
}

/* Se o Bootstrap não estiver funcionando bem */
.btn-primary {
  background-color: #0d6efd !important;
  border-color: #0d6efd !important;
  color: white !important;
}

.btn-dark {
  background-color: #212529 !important;
  border-color: #212529 !important;
  color: white !important;
}

.btn-success {
  background-color: #198754 !important;
  border-color: #198754 !important;
  color: white !important;
}

.btn-warning {
  background-color: #ffc107 !important;
  border-color: #ffc107 !important;
  color: #212529 !important;
}

.btn-purple {
  background-color: #6f42c1 !important;
  border-color: #6f42c1 !important;
  color: white !important;
}

.btn-purple:hover {
  background-color: #5a32a3 !important;
  border-color: #5a32a3 !important;
}

.btn-danger {
  background-color: #dc3545 !important;
  border-color: #dc3545 !important;
  color: white !important;
}

/* Estilos para todos os botões */
.w-100 {
  width: 100% !important;
}

.mb-2 {
  margin-bottom: 0.5rem !important;
}

.text-white {
  color: white !important;
}

.text-dark {
  color: #212529 !important;
}

.me-2 {
  margin-right: 0.5rem !important;
}
</style>