<template>
  <navegacao/>

  <div class="fade-in">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">
          <i class="fas fa-crown"></i> Planos e Assinaturas
        </h1>
        <p class="page-description">Escolha o plano ideal para o seu negócio</p>
      </div>
    </div>

    <!-- Current Plan Info -->
    <div class="current-plan-banner" v-if="currentPlan">
      <div class="banner-content">
        <div class="banner-icon">
          <i class="fas fa-info-circle"></i>
        </div>
        <div>
          <div class="banner-title">Plano Atual</div>
          <div class="banner-text">
            Você está no plano <strong>{{ currentPlan.name }}</strong>
          </div>
        </div>
      </div>
      <div class="banner-action">
        <router-link to="/dashboard" class="btn btn-ghost btn-sm">
          <i class="fas fa-chart-line"></i> Ver Dashboard
        </router-link>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Carregando planos disponíveis...</p>
    </div>

    <!-- Plans Grid -->
    <div v-else class="plans-grid">
      <div 
        v-for="plan in sortedPlans" 
        :key="plan.id"
        class="plan-card"
        :class="{ 
          'popular': isPlanPopular(plan),
          'current': isCurrentPlan(plan)
        }"
      >
        <!-- Popular Badge -->
        <div v-if="isPlanPopular(plan)" class="popular-badge">
          <i class="fas fa-star"></i> Mais Popular
        </div>

        <!-- Current Plan Badge -->
        <div v-if="isCurrentPlan(plan)" class="current-badge">
          <i class="fas fa-check-circle"></i> Plano Atual
        </div>

        <!-- Plan Header -->
        <div class="plan-header">
          <div class="plan-icon" :style="{ background: getPlanColor(plan.slug) }">
            <i :class="getPlanIcon(plan.slug)"></i>
          </div>
          <h3 class="plan-name">{{ plan.name }}</h3>
          <p class="plan-description">{{ plan.description }}</p>
        </div>

        <!-- Plan Price -->
        <div class="plan-price">
          <div class="price-amount">{{ formatPrice(plan.price_monthly) }}</div>
          <div class="price-period">por mês</div>
        </div>

        <!-- Plan Features -->
        <div class="plan-features">
          <!-- SMS Quantity -->
          <div class="feature-item">
            <i class="fas fa-sms feature-icon"></i>
            <span>
              <strong>{{ formatQuantity(plan.sms_quantity) }}</strong> SMS mensais
            </span>
          </div>

          <!-- Max Users -->
          <div class="feature-item">
            <i class="fas fa-users feature-icon"></i>
            <span>
              <strong>{{ formatQuantity(plan.max_users) }}</strong> usuários
            </span>
          </div>

          <!-- Max Clients -->
          <div class="feature-item">
            <i class="fas fa-address-book feature-icon"></i>
            <span>
              <strong>{{ formatQuantity(plan.max_clients) }}</strong> clientes
            </span>
          </div>

          <!-- Features -->
          <div class="features-divider"></div>
          
          <div 
            v-for="feature in plan.features" 
            :key="feature"
            class="feature-item"
          >
            <i class="fas fa-check-circle feature-icon success"></i>
            <span>{{ getFeatureText(feature) }}</span>
          </div>
        </div>

        <!-- Plan Action -->
        <div class="plan-action">
          <button 
            class="btn btn-ghost w-100 mb-2"
            @click="viewPlanDetails(plan)"
          >
            <i class="fas fa-info-circle"></i> Ver Detalhes
          </button>
          
          <button 
            v-if="isCurrentPlan(plan)"
            class="btn btn-outline w-100"
            disabled
          >
            <i class="fas fa-check"></i> Plano Atual
          </button>
          <button 
            v-else-if="canUpgrade(plan)"
            class="btn btn-primary w-100"
            @click="selectPlan(plan)"
          >
            <i class="fas fa-arrow-up"></i> Fazer Upgrade
          </button>
          <button 
            v-else
            class="btn btn-accent w-100"
            @click="selectPlan(plan)"
          >
            <i class="fas fa-shopping-cart"></i> Escolher Plano
          </button>
        </div>
      </div>
    </div>

    <!-- Plan Details Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <!-- Loading State -->
        <div v-if="loadingDetails" class="modal-loading">
          <div class="spinner"></div>
          <p>Carregando detalhes do plano...</p>
        </div>

        <!-- Plan Details -->
        <div v-else-if="selectedPlanDetails" class="modal-body">
          <!-- Modal Header -->
          <div class="modal-header">
            <div class="modal-icon" :style="{ background: getPlanColor(selectedPlanDetails.slug) }">
              <i :class="getPlanIcon(selectedPlanDetails.slug)"></i>
            </div>
            <h2 class="modal-title">{{ selectedPlanDetails.name }}</h2>
            <p class="modal-description">{{ selectedPlanDetails.description }}</p>
            <button class="modal-close" @click="closeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <!-- Plan Price -->
          <div class="modal-price">
            <div class="price-tag">
              <div class="price-label">Preço Mensal</div>
              <div class="price-value">{{ formatPrice(selectedPlanDetails.price_monthly) }}</div>
            </div>
          </div>

          <!-- Plan Details Grid -->
          <div class="details-grid">
            <div class="detail-card">
              <div class="detail-icon">
                <i class="fas fa-sms"></i>
              </div>
              <div class="detail-content">
                <div class="detail-label">SMS Mensais</div>
                <div class="detail-value">{{ formatQuantity(selectedPlanDetails.sms_quantity) }}</div>
              </div>
            </div>

            <div class="detail-card">
              <div class="detail-icon">
                <i class="fas fa-users"></i>
              </div>
              <div class="detail-content">
                <div class="detail-label">Usuários</div>
                <div class="detail-value">{{ formatQuantity(selectedPlanDetails.max_users) }}</div>
              </div>
            </div>

            <div class="detail-card">
              <div class="detail-icon">
                <i class="fas fa-address-book"></i>
              </div>
              <div class="detail-content">
                <div class="detail-label">Clientes</div>
                <div class="detail-value">{{ formatQuantity(selectedPlanDetails.max_clients) }}</div>
              </div>
            </div>

            <div class="detail-card">
              <div class="detail-icon">
                <i class="fas fa-sort-numeric-up"></i>
              </div>
              <div class="detail-content">
                <div class="detail-label">Ordem</div>
                <div class="detail-value">{{ selectedPlanDetails.sort_order }}</div>
              </div>
            </div>
          </div>

          <!-- Features Section -->
          <div class="modal-section">
            <h3 class="section-title">
              <i class="fas fa-star"></i> Recursos Inclusos
            </h3>
            <div class="features-list">
              <div 
                v-for="feature in selectedPlanDetails.features" 
                :key="feature"
                class="feature-badge"
              >
                <i class="fas fa-check-circle"></i>
                {{ getFeatureText(feature) }}
              </div>
            </div>
          </div>

          <!-- Status and Dates -->
          <div class="modal-section">
            <h3 class="section-title">
              <i class="fas fa-info-circle"></i> Informações Adicionais
            </h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Status:</span>
                <span :class="['status-badge', selectedPlanDetails.is_active ? 'active' : 'inactive']">
                  <i :class="selectedPlanDetails.is_active ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                  {{ selectedPlanDetails.is_active ? 'Ativo' : 'Inativo' }}
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">ID do Plano:</span>
                <span class="info-value">#{{ selectedPlanDetails.id }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Slug:</span>
                <span class="info-value">{{ selectedPlanDetails.slug }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Criado em:</span>
                <span class="info-value">{{ formatDate(selectedPlanDetails.created_at) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Atualizado em:</span>
                <span class="info-value">{{ formatDate(selectedPlanDetails.updated_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Modal Actions -->
          <div class="modal-actions">
            <button class="btn btn-ghost" @click="closeModal">
              <i class="fas fa-times"></i> Fechar
            </button>
            <button 
              v-if="!isCurrentPlan(selectedPlanDetails)"
              class="btn btn-primary"
              @click="selectPlan(selectedPlanDetails)"
            >
              <i class="fas fa-shopping-cart"></i> Escolher Este Plano
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Comparison -->
    <div class="card mt-4">
      <div class="card-header">
        <h3 class="card-title">
          <i class="fas fa-list-check"></i> Comparação de Recursos
        </h3>
      </div>
      <div class="card-body" style="padding: 0;">
        <div class="table-responsive">
          <table class="comparison-table">
            <thead>
              <tr>
                <th>Recurso</th>
                <th v-for="plan in sortedPlans" :key="plan.id">
                  {{ plan.name }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="feature-name">SMS Mensais</td>
                <td v-for="plan in sortedPlans" :key="plan.id">
                  {{ formatQuantity(plan.sms_quantity) }}
                </td>
              </tr>
              <tr>
                <td class="feature-name">Usuários</td>
                <td v-for="plan in sortedPlans" :key="plan.id">
                  {{ formatQuantity(plan.max_users) }}
                </td>
              </tr>
              <tr>
                <td class="feature-name">Clientes</td>
                <td v-for="plan in sortedPlans" :key="plan.id">
                  {{ formatQuantity(plan.max_clients) }}
                </td>
              </tr>
              <tr v-for="feature in allFeatures" :key="feature">
                <td class="feature-name">{{ getFeatureText(feature) }}</td>
                <td v-for="plan in sortedPlans" :key="plan.id">
                  <i 
                    :class="plan.features.includes(feature) ? 'fas fa-check-circle text-success' : 'fas fa-times-circle text-muted'"
                  ></i>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- FAQ Section -->
    <div class="faq-section mt-4">
      <h2 class="faq-title">
        <i class="fas fa-question-circle"></i> Perguntas Frequentes
      </h2>
      
      <div class="faq-grid">
        <div class="faq-item">
          <div class="faq-question">
            <i class="fas fa-sync"></i>
            Posso mudar de plano a qualquer momento?
          </div>
          <div class="faq-answer">
            Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. As mudanças entram em vigor imediatamente.
          </div>
        </div>

        <div class="faq-item">
          <div class="faq-question">
            <i class="fas fa-credit-card"></i>
            Quais são as formas de pagamento?
          </div>
          <div class="faq-answer">
            Aceitamos cartão de crédito, transferência bancária e pagamento via multicaixa. O pagamento é mensal e automático.
          </div>
        </div>

        <div class="faq-item">
          <div class="faq-question">
            <i class="fas fa-redo"></i>
            Existe período de teste?
          </div>
          <div class="faq-answer">
            Sim! O plano Teste Gratuito oferece 7 dias de teste sem compromisso. Não é necessário cartão de crédito.
          </div>
        </div>

        <div class="faq-item">
          <div class="faq-question">
            <i class="fas fa-mobile-alt"></i>
            O que acontece se eu ultrapassar meu limite de SMS?
          </div>
          <div class="faq-answer">
            Você pode comprar créditos adicionais ou fazer upgrade para um plano superior com mais SMS inclusos.
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
  name: 'PlansPage',
  components: {
    navegacao
  },
  data() {
    return {
      isLoading: true,
      plans: [],
      currentPlan: null,
      showModal: false,
      loadingDetails: false,
      selectedPlanDetails: null
    };
  },
  computed: {
    sortedPlans() {
      return [...this.plans].sort((a, b) => a.sort_order - b.sort_order);
    },
    allFeatures() {
      const features = new Set();
      this.plans.forEach(plan => {
        plan.features.forEach(feature => features.add(feature));
      });
      return Array.from(features);
    }
  },
  methods: {
    async fetchPlans() {
      this.isLoading = true;
      const token = localStorage.getItem('auth_token');

      try {
        const response = await axios.get('https://api.devsms.online/api/v1/plans', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        this.plans = response.data.data.filter(plan => plan.is_active);
        console.log('Planos carregados:', this.plans.length);

        // Buscar plano atual do usuário
        await this.fetchCurrentPlan();

      } catch (error) {
        console.error('Erro ao buscar planos:', error);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          this.$router.push('/login');
        }
      } finally {
        this.isLoading = false;
      }
    },

    async fetchCurrentPlan() {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await axios.get('https://api.devsms.online/api/v1/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        const subscription = response.data.data?.subscription;
        if (subscription && subscription.plan_name) {
          // Encontrar o plano correspondente
          this.currentPlan = this.plans.find(p => 
            p.name.toLowerCase() === subscription.plan_name.toLowerCase()
          );
        }
      } catch (error) {
        console.error('Erro ao buscar plano atual:', error);
      }
    },

    async viewPlanDetails(plan) {
      this.showModal = true;
      this.loadingDetails = true;
      this.selectedPlanDetails = null;

      const token = localStorage.getItem('auth_token');

      try {
        const response = await axios.get(`https://api.devsms.online/api/v1/plans/${plan.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        this.selectedPlanDetails = response.data.data;
        console.log('Detalhes do plano carregados:', this.selectedPlanDetails);

      } catch (error) {
        console.error('Erro ao buscar detalhes do plano:', error);
        alert('Erro ao carregar detalhes do plano. Por favor, tente novamente.');
        this.closeModal();
      } finally {
        this.loadingDetails = false;
      }
    },

    closeModal() {
      this.showModal = false;
      this.selectedPlanDetails = null;
      this.loadingDetails = false;
    },

    selectPlan(plan) {
      // Implementar lógica de seleção/compra do plano
      const confirmed = confirm(`Deseja ${this.currentPlan ? 'mudar para' : 'assinar'} o plano ${plan.name}?`);
      
      if (confirmed) {
        // Aqui você implementaria a integração com sistema de pagamento
        alert(`Redirecionando para pagamento do plano ${plan.name}...`);
        // this.$router.push({ name: 'Checkout', params: { planId: plan.id } });
      }
    },

    isCurrentPlan(plan) {
      return this.currentPlan && this.currentPlan.id === plan.id;
    },

    isPlanPopular(plan) {
      // Definir plano profissional como popular
      return plan.slug === 'profissional';
    },

    canUpgrade(plan) {
      if (!this.currentPlan) return false;
      return plan.sort_order > this.currentPlan.sort_order;
    },

    formatPrice(price) {
      return new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA',
        minimumFractionDigits: 0
      }).format(price);
    },

    formatQuantity(quantity) {
      if (quantity === -1 || quantity === null) return 'Ilimitado';
      return quantity.toLocaleString('pt-AO');
    },

    getPlanColor(slug) {
      const colors = {
        'teste': 'linear-gradient(135deg, #6B7280, #4B5563)',
        'basico': 'linear-gradient(135deg, #3B82F6, #2563EB)',
        'profissional': 'linear-gradient(135deg, #F59E0B, #D97706)',
        'premium-plus': 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
        'enterprise': 'linear-gradient(135deg, #10B981, #059669)'
      };
      return colors[slug] || 'linear-gradient(135deg, #667eea, #764ba2)';
    },

    getPlanIcon(slug) {
      const icons = {
        'teste': 'fas fa-vial',
        'basico': 'fas fa-rocket',
        'profissional': 'fas fa-briefcase',
        'premium-plus': 'fas fa-gem',
        'enterprise': 'fas fa-building'
      };
      return icons[slug] || 'fas fa-crown';
    },

    getFeatureText(feature) {
      const features = {
        'basic_reports': 'Relatórios Básicos',
        'advanced_reports': 'Relatórios Avançados',
        'email_support': 'Suporte por Email',
        'priority_support': 'Suporte Prioritário',
        'dedicated_support': 'Suporte Dedicado',
        'api_access': 'Acesso à API',
        'scheduling': 'Agendamento de SMS',
        'templates': 'Templates de Mensagens',
        'white_label': 'White Label',
        'custom_integration': 'Integrações Personalizadas',
        'automated_events': 'Eventos Automatizados',
        'all_features': 'Todos os Recursos'
      };
      return features[feature] || feature;
    },

    formatDate(dateString) {
      if (!dateString) return '-';
      
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('pt-AO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    }
  },
  mounted() {
    this.fetchPlans();
  }
};
</script>

<style scoped>
.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.page-description {
  color: var(--gray-600);
  font-size: 1.125rem;
}

.current-plan-banner {
  background: linear-gradient(135deg, #3B82F6, #2563EB);
  color: white;
  padding: 1.5rem 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.2);
}

.banner-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.banner-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.banner-title {
  font-size: 0.875rem;
  opacity: 0.9;
  margin-bottom: 0.25rem;
}

.banner-text {
  font-size: 1.125rem;
  font-weight: 600;
}

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

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.plan-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;
}

.plan-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.plan-card.popular {
  border-color: var(--warning);
  box-shadow: 0 10px 30px rgba(245, 158, 11, 0.2);
}

.plan-card.current {
  border-color: var(--success);
  background: linear-gradient(to bottom, rgba(16, 185, 129, 0.05), white);
}

.popular-badge {
  position: absolute;
  top: -12px;
  right: 20px;
  background: linear-gradient(135deg, var(--warning), var(--warning-dark));
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.813rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.current-badge {
  position: absolute;
  top: -12px;
  right: 20px;
  background: linear-gradient(135deg, var(--success), var(--success-dark));
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.813rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.plan-header {
  text-align: center;
  margin-bottom: 2rem;
}

.plan-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: white;
}

.plan-name {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 0.5rem;
}

.plan-description {
  color: var(--gray-600);
  font-size: 0.938rem;
  line-height: 1.5;
}

.plan-price {
  text-align: center;
  padding: 1.5rem 0;
  border-top: 1px solid var(--gray-200);
  border-bottom: 1px solid var(--gray-200);
  margin-bottom: 2rem;
}

.price-amount {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 0.25rem;
}

.price-period {
  color: var(--gray-600);
  font-size: 0.938rem;
}

.plan-features {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  color: var(--gray-700);
  font-size: 0.938rem;
}

.feature-icon {
  color: var(--primary);
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.feature-icon.success {
  color: var(--success);
}

.features-divider {
  height: 1px;
  background: var(--gray-200);
  margin: 0.5rem 0;
}

.plan-action {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
}

.comparison-table thead {
  background: var(--gray-50);
}

.comparison-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 700;
  color: var(--gray-700);
  border-bottom: 2px solid var(--gray-200);
}

.comparison-table td {
  padding: 1rem;
  border-bottom: 1px solid var(--gray-200);
  text-align: center;
}

.comparison-table td:first-child {
  text-align: left;
}

.feature-name {
  font-weight: 600;
  color: var(--gray-700);
}

.text-success {
  color: var(--success);
  font-size: 1.25rem;
}

.text-muted {
  color: var(--gray-400);
  font-size: 1.25rem;
}

.faq-section {
  margin-top: 4rem;
}

.faq-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-800);
  text-align: center;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.faq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.faq-item {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.faq-question {
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.faq-question i {
  color: var(--primary);
}

.faq-answer {
  color: var(--gray-600);
  line-height: 1.6;
  font-size: 0.938rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  gap: 1rem;
}

.modal-body {
  padding: 0;
}

.modal-header {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(to bottom, var(--gray-50), white);
  border-bottom: 1px solid var(--gray-200);
  position: relative;
}

.modal-icon {
  width: 100px;
  height: 100px;
  margin: 0 auto 1.5rem;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.modal-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 0.5rem;
}

.modal-description {
  color: var(--gray-600);
  font-size: 1rem;
  line-height: 1.5;
  max-width: 600px;
  margin: 0 auto;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border: none;
  background: var(--gray-100);
  color: var(--gray-600);
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--gray-200);
  color: var(--gray-800);
}

.modal-price {
  padding: 2rem;
  background: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
}

.price-tag {
  text-align: center;
}

.price-label {
  color: var(--gray-600);
  font-size: 0.938rem;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.price-value {
  font-size: 3rem;
  font-weight: 700;
  color: var(--primary);
  line-height: 1;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  padding: 2rem;
}

.detail-card {
  background: var(--gray-50);
  padding: 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s ease;
}

.detail-card:hover {
  background: var(--gray-100);
  transform: translateY(-2px);
}

.detail-icon {
  width: 50px;
  height: 50px;
  background: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--primary);
  flex-shrink: 0;
}

.detail-content {
  flex: 1;
  min-width: 0;
}

.detail-label {
  font-size: 0.813rem;
  color: var(--gray-600);
  margin-bottom: 0.25rem;
}

.detail-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-800);
  word-break: break-word;
}

.modal-section {
  padding: 2rem;
  border-top: 1px solid var(--gray-200);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title i {
  color: var(--primary);
}

.features-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.feature-badge {
  background: linear-gradient(135deg, var(--success), var(--success-dark));
  color: white;
  padding: 0.625rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
}

.info-grid {
  display: grid;
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--gray-50);
  border-radius: 8px;
}

.info-label {
  font-weight: 600;
  color: var(--gray-600);
  font-size: 0.938rem;
}

.info-value {
  color: var(--gray-800);
  font-size: 0.938rem;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.status-badge.active {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

.status-badge.inactive {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
}

.modal-actions {
  padding: 2rem;
  border-top: 1px solid var(--gray-200);
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.modal-actions .btn {
  min-width: 150px;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }

  .plans-grid {
    grid-template-columns: 1fr;
  }

  .current-plan-banner {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .banner-content {
    flex-direction: column;
  }

  .faq-grid {
    grid-template-columns: 1fr;
  }

  .comparison-table {
    font-size: 0.875rem;
  }

  .comparison-table th,
  .comparison-table td {
    padding: 0.75rem 0.5rem;
  }

  .modal-content {
    max-height: 95vh;
    border-radius: 20px 20px 0 0;
    margin-top: auto;
  }

  .modal-title {
    font-size: 1.5rem;
  }

  .price-value {
    font-size: 2.5rem;
  }

  .details-grid {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column-reverse;
  }

  .modal-actions .btn {
    width: 100%;
    min-width: 0;
  }
}
</style>