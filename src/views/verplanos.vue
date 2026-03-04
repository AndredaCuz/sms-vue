<template>
  <AppLayout>
    <div class="fade-in plans-wrapper">

      <!-- Page Header -->
      <div class="page-header">
        <h1 class="page-title"><i class="fas fa-crown"></i> Planos & Assinaturas</h1>
        <p class="page-description">Escolha o plano ideal para o seu negócio</p>
      </div>

      <!-- Current Plan Banner -->
      <div class="current-plan-banner" v-if="currentPlan">
        <i class="fas fa-circle-check banner-icon"></i>
        <span>Você está no plano <strong>{{ currentPlan.name }}</strong></span>
        <router-link to="/dashboard" class="btn-banner">
          <i class="fas fa-chart-line"></i> Dashboard
        </router-link>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="loading-container">
        <div class="spinner"></div>
        <p>Carregando planos...</p>
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
          <!-- Badges -->
          <div v-if="isPlanPopular(plan)" class="badge badge-popular">
            <i class="fas fa-bolt"></i> Popular
          </div>
          <div v-else-if="isCurrentPlan(plan)" class="badge badge-current">
            <i class="fas fa-check"></i> Atual
          </div>

          <!-- Header -->
          <div class="card-top">
            <div class="plan-icon" :style="{ background: getPlanColor(plan.slug) }">
              <i :class="getPlanIcon(plan.slug)"></i>
            </div>
            <div class="plan-info">
              <h3 class="plan-name">{{ plan.name }}</h3>
              <p class="plan-desc">{{ plan.description }}</p>
            </div>
          </div>

          <!-- Price -->
          <div class="plan-price">
            <span class="price-amount">{{ formatPrice(plan.price_monthly) }}</span>
            <span class="price-period">/mês</span>
          </div>

          <!-- Key Limits -->
          <div class="plan-limits">
            <div class="limit-item">
              <i class="fas fa-sms"></i>
              <span><strong>{{ formatQuantity(plan.sms_quantity) }}</strong> SMS</span>
            </div>
            <div class="limit-item">
              <i class="fas fa-users"></i>
              <span><strong>{{ formatQuantity(plan.max_users) }}</strong> usuários</span>
            </div>
            <div class="limit-item">
              <i class="fas fa-address-book"></i>
              <span><strong>{{ formatQuantity(plan.max_clients) }}</strong> clientes</span>
            </div>
          </div>

          <!-- Features Tags -->
          <div class="plan-features">
            <span v-for="feature in plan.features.slice(0, 3)" :key="feature" class="feat-tag">
              <i class="fas fa-check"></i> {{ getFeatureText(feature) }}
            </span>
            <span v-if="plan.features.length > 3" class="feat-tag feat-more">
              +{{ plan.features.length - 3 }} mais
            </span>
          </div>

          <!-- Actions -->
          <div class="plan-actions">
            <button class="btn-details" @click="viewPlanDetails(plan)">
              <i class="fas fa-info-circle"></i> Detalhes
            </button>
            <button
              v-if="isCurrentPlan(plan)"
              class="btn-plan btn-current-plan"
              disabled
            >
              <i class="fas fa-check"></i> Plano Atual
            </button>
            <button
              v-else-if="canUpgrade(plan)"
              class="btn-plan btn-upgrade"
              @click="selectPlan(plan)"
            >
              <i class="fas fa-arrow-up"></i> Upgrade
            </button>
            <button
              v-else
              class="btn-plan btn-choose"
              @click="selectPlan(plan)"
            >
              <i class="fas fa-shopping-cart"></i> Escolher
            </button>
          </div>
        </div>
      </div>

      <!-- Comparison Table -->
      <div class="card mt-4">
        <div class="card-header">
          <h3 class="card-title"><i class="fas fa-table-columns"></i> Comparação de Recursos</h3>
        </div>
        <div class="card-body" style="padding: 0;">
          <div class="table-responsive">
            <table class="comparison-table">
              <thead>
                <tr>
                  <th>Recurso</th>
                  <th v-for="plan in sortedPlans" :key="plan.id">{{ plan.name }}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="feature-name">SMS Mensais</td>
                  <td v-for="plan in sortedPlans" :key="plan.id">{{ formatQuantity(plan.sms_quantity) }}</td>
                </tr>
                <tr>
                  <td class="feature-name">Usuários</td>
                  <td v-for="plan in sortedPlans" :key="plan.id">{{ formatQuantity(plan.max_users) }}</td>
                </tr>
                <tr>
                  <td class="feature-name">Clientes</td>
                  <td v-for="plan in sortedPlans" :key="plan.id">{{ formatQuantity(plan.max_clients) }}</td>
                </tr>
                <tr v-for="feature in allFeatures" :key="feature">
                  <td class="feature-name">{{ getFeatureText(feature) }}</td>
                  <td v-for="plan in sortedPlans" :key="plan.id">
                    <i :class="plan.features.includes(feature) ? 'fas fa-check-circle text-success' : 'fas fa-times-circle text-muted'"></i>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- FAQ -->
      <div class="faq-section mt-4">
        <h2 class="faq-title"><i class="fas fa-question-circle"></i> Perguntas Frequentes</h2>
        <div class="faq-grid">
          <div class="faq-item">
            <div class="faq-question"><i class="fas fa-sync"></i> Posso mudar de plano a qualquer momento?</div>
            <div class="faq-answer">Sim! Upgrade ou downgrade a qualquer hora. Mudanças entram em vigor imediatamente.</div>
          </div>
          <div class="faq-item">
            <div class="faq-question"><i class="fas fa-credit-card"></i> Quais são as formas de pagamento?</div>
            <div class="faq-answer">Cartão de crédito, transferência bancária e multicaixa. Pagamento mensal automático.</div>
          </div>
          <div class="faq-item">
            <div class="faq-question"><i class="fas fa-redo"></i> Existe período de teste?</div>
            <div class="faq-answer">Sim! 7 dias grátis no plano Teste. Sem cartão de crédito necessário.</div>
          </div>
          <div class="faq-item">
            <div class="faq-question"><i class="fas fa-mobile-alt"></i> O que acontece se ultrapassar o limite de SMS?</div>
            <div class="faq-answer">Você pode comprar créditos adicionais ou fazer upgrade para um plano com mais SMS.</div>
          </div>
        </div>
      </div>

      <!-- Plan Details Modal -->
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div v-if="loadingDetails" class="modal-loading">
            <div class="spinner"></div>
            <p>Carregando detalhes...</p>
          </div>
          <div v-else-if="selectedPlanDetails" class="modal-body">
            <div class="modal-header">
              <div class="modal-icon" :style="{ background: getPlanColor(selectedPlanDetails.slug) }">
                <i :class="getPlanIcon(selectedPlanDetails.slug)"></i>
              </div>
              <div>
                <h2 class="modal-title">{{ selectedPlanDetails.name }}</h2>
                <p class="modal-description">{{ selectedPlanDetails.description }}</p>
              </div>
              <button class="modal-close" @click="closeModal"><i class="fas fa-times"></i></button>
            </div>

            <div class="modal-price">
              <div class="price-label">Preço Mensal</div>
              <div class="price-value">{{ formatPrice(selectedPlanDetails.price_monthly) }}</div>
            </div>

            <div class="details-grid">
              <div class="detail-card">
                <i class="fas fa-sms"></i>
                <div><div class="detail-label">SMS Mensais</div><div class="detail-value">{{ formatQuantity(selectedPlanDetails.sms_quantity) }}</div></div>
              </div>
              <div class="detail-card">
                <i class="fas fa-users"></i>
                <div><div class="detail-label">Usuários</div><div class="detail-value">{{ formatQuantity(selectedPlanDetails.max_users) }}</div></div>
              </div>
              <div class="detail-card">
                <i class="fas fa-address-book"></i>
                <div><div class="detail-label">Clientes</div><div class="detail-value">{{ formatQuantity(selectedPlanDetails.max_clients) }}</div></div>
              </div>
            </div>

            <div class="modal-section">
              <h3 class="section-title"><i class="fas fa-star"></i> Recursos Inclusos</h3>
              <div class="features-list">
                <div v-for="feature in selectedPlanDetails.features" :key="feature" class="feature-badge">
                  <i class="fas fa-check-circle"></i> {{ getFeatureText(feature) }}
                </div>
              </div>
            </div>

            <div class="modal-section">
              <h3 class="section-title"><i class="fas fa-info-circle"></i> Informações</h3>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Status</span>
                  <span :class="['status-badge', selectedPlanDetails.is_active ? 'active' : 'inactive']">
                    <i :class="selectedPlanDetails.is_active ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                    {{ selectedPlanDetails.is_active ? 'Ativo' : 'Inativo' }}
                  </span>
                </div>
                <div class="info-item">
                  <span class="info-label">ID</span>
                  <span class="info-value">#{{ selectedPlanDetails.id }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Criado em</span>
                  <span class="info-value">{{ formatDate(selectedPlanDetails.created_at) }}</span>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button class="btn btn-ghost" @click="closeModal"><i class="fas fa-times"></i> Fechar</button>
              <button v-if="!isCurrentPlan(selectedPlanDetails)" class="btn btn-primary" @click="selectPlan(selectedPlanDetails)">
                <i class="fas fa-shopping-cart"></i> Escolher Este Plano
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </AppLayout>
</template>

<script>
import axios from 'axios';
import AppLayout from '../components/AppLayout.vue';

export default {
  name: 'PlansPage',
  components: { AppLayout },
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
      this.plans.forEach(plan => plan.features.forEach(f => features.add(f)));
      return Array.from(features);
    }
  },
  methods: {
    async fetchPlans() {
      this.isLoading = true;
      const token = localStorage.getItem('auth_token');
      try {
        const response = await axios.get('https://api.devsms.online/api/v1/plans', {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        this.plans = response.data.data.filter(plan => plan.is_active);
        await this.fetchCurrentPlan();
      } catch (error) {
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
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        const subscription = response.data.data?.subscription;
        if (subscription?.plan_name) {
          this.currentPlan = this.plans.find(p => p.name.toLowerCase() === subscription.plan_name.toLowerCase());
        }
      } catch (error) { console.error(error); }
    },
    async viewPlanDetails(plan) {
      this.showModal = true;
      this.loadingDetails = true;
      this.selectedPlanDetails = null;
      const token = localStorage.getItem('auth_token');
      try {
        const response = await axios.get(`https://api.devsms.online/api/v1/plans/${plan.id}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        this.selectedPlanDetails = response.data.data;
      } catch (error) {
        alert('Erro ao carregar detalhes do plano.');
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
      const confirmed = confirm(`Deseja ${this.currentPlan ? 'mudar para' : 'assinar'} o plano ${plan.name}?`);
      if (confirmed) alert(`Redirecionando para pagamento do plano ${plan.name}...`);
    },
    isCurrentPlan(plan) { return this.currentPlan && this.currentPlan.id === plan.id; },
    isPlanPopular(plan) { return plan.slug === 'profissional'; },
    canUpgrade(plan) {
      if (!this.currentPlan) return false;
      return plan.sort_order > this.currentPlan.sort_order;
    },
    formatPrice(price) {
      return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', minimumFractionDigits: 0 }).format(price);
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
        'email_support': 'Suporte Email',
        'priority_support': 'Suporte Prioritário',
        'dedicated_support': 'Suporte Dedicado',
        'api_access': 'Acesso à API',
        'scheduling': 'Agendamento SMS',
        'templates': 'Templates',
        'white_label': 'White Label',
        'custom_integration': 'Integrações',
        'automated_events': 'Eventos Auto.',
        'all_features': 'Todos os Recursos'
      };
      return features[feature] || feature;
    },
    formatDate(dateString) {
      if (!dateString) return '-';
      return new Intl.DateTimeFormat('pt-AO', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateString));
    }
  },
  mounted() { this.fetchPlans(); }
};
</script>

<style scoped>
/* ===== LAYOUT ===== */
.plans-wrapper {
  max-width: 1200px;
}

.page-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.page-title i { color: var(--warning); }

.page-description {
  color: var(--gray-500);
  font-size: 0.938rem;
}

/* ===== BANNER ===== */
.current-plan-banner {
  background: linear-gradient(135deg, #3B82F6, #2563EB);
  color: white;
  padding: 0.875rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.938rem;
  box-shadow: 0 4px 16px rgba(59,130,246,0.25);
}

.banner-icon { font-size: 1.125rem; opacity: 0.9; }

.current-plan-banner span { flex: 1; }

.btn-banner {
  background: rgba(255,255,255,0.2);
  color: white;
  border: 1px solid rgba(255,255,255,0.3);
  padding: 0.375rem 0.875rem;
  border-radius: 8px;
  font-size: 0.813rem;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: background 0.2s;
  white-space: nowrap;
}
.btn-banner:hover { background: rgba(255,255,255,0.3); }

/* ===== SPINNER ===== */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 1rem;
  color: var(--gray-500);
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid var(--gray-200);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ===== PLANS GRID ===== */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

/* ===== PLAN CARD ===== */
.plan-card {
  background: white;
  border-radius: 14px;
  padding: 1.25rem;
  box-shadow: 0 1px 6px rgba(0,0,0,0.07);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.plan-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

.plan-card.popular {
  border-color: #F59E0B;
  box-shadow: 0 4px 20px rgba(245,158,11,0.18);
}

.plan-card.current {
  border-color: #10B981;
  background: linear-gradient(to bottom, rgba(16,185,129,0.04), white);
}

/* ===== BADGES ===== */
.badge {
  position: absolute;
  top: -10px;
  right: 14px;
  padding: 0.25rem 0.625rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: white;
}

.badge-popular {
  background: linear-gradient(135deg, #F59E0B, #D97706);
  box-shadow: 0 2px 8px rgba(245,158,11,0.35);
}

.badge-current {
  background: linear-gradient(135deg, #10B981, #059669);
  box-shadow: 0 2px 8px rgba(16,185,129,0.35);
}

/* ===== CARD TOP ===== */
.card-top {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.plan-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 3px 10px rgba(0,0,0,0.15);
}

.plan-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gray-800);
  margin: 0 0 0.15rem;
  line-height: 1.2;
}

.plan-desc {
  font-size: 0.75rem;
  color: var(--gray-500);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ===== PRICE ===== */
.plan-price {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  padding: 0.75rem 0;
  border-top: 1px solid var(--gray-100);
  border-bottom: 1px solid var(--gray-100);
}

.price-amount {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--gray-800);
}

.price-period {
  font-size: 0.813rem;
  color: var(--gray-500);
}

/* ===== LIMITS ===== */
.plan-limits {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.limit-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.813rem;
  color: var(--gray-600);
}

.limit-item i {
  width: 16px;
  text-align: center;
  color: var(--primary);
  font-size: 0.75rem;
}

.limit-item strong {
  color: var(--gray-800);
}

/* ===== FEATURE TAGS ===== */
.plan-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  flex: 1;
}

.feat-tag {
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
  color: var(--gray-600);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
}

.feat-tag i { color: #10B981; font-size: 0.625rem; }

.feat-more {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
}
.feat-more i { color: white; }

/* ===== ACTIONS ===== */
.plan-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: auto;
}

.btn-details {
  flex: 0 0 auto;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--gray-200);
  background: white;
  color: var(--gray-600);
  border-radius: 8px;
  font-size: 0.813rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  white-space: nowrap;
}
.btn-details:hover { background: var(--gray-50); border-color: var(--gray-300); color: var(--gray-800); }

.btn-plan {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 0.813rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
}

.btn-upgrade {
  background: linear-gradient(135deg, var(--primary), #2563EB);
  color: white;
  box-shadow: 0 2px 8px rgba(59,130,246,0.3);
}
.btn-upgrade:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59,130,246,0.4); }

.btn-choose {
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
  box-shadow: 0 2px 8px rgba(16,185,129,0.3);
}
.btn-choose:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(16,185,129,0.4); }

.btn-current-plan {
  background: var(--gray-100);
  color: var(--gray-500);
  cursor: not-allowed;
}

/* ===== COMPARISON TABLE ===== */
.comparison-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.comparison-table thead { background: var(--gray-50); }
.comparison-table th {
  padding: 0.875rem 1rem;
  text-align: left;
  font-weight: 700;
  color: var(--gray-700);
  border-bottom: 2px solid var(--gray-200);
}
.comparison-table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--gray-100);
  text-align: center;
  color: var(--gray-600);
}
.comparison-table td:first-child { text-align: left; }
.feature-name { font-weight: 600; color: var(--gray-700); }
.text-success { color: #10B981; font-size: 1rem; }
.text-muted { color: var(--gray-300); font-size: 1rem; }

/* ===== FAQ ===== */
.faq-section { margin-top: 2.5rem; }

.faq-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--gray-800);
  text-align: center;
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.faq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1rem;
}

.faq-item {
  background: white;
  padding: 1.25rem;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.06);
  border-left: 3px solid var(--primary);
}

.faq-question {
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 0.625rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.938rem;
}
.faq-question i { color: var(--primary); flex-shrink: 0; }

.faq-answer {
  color: var(--gray-600);
  line-height: 1.6;
  font-size: 0.875rem;
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal-content {
  background: white;
  border-radius: 18px;
  max-width: 680px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
  animation: slideUp 0.25s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 2rem;
  gap: 1rem;
  color: var(--gray-500);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-100);
  position: relative;
}

.modal-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--gray-800);
  margin: 0 0 0.25rem;
}

.modal-description {
  color: var(--gray-500);
  font-size: 0.875rem;
  margin: 0;
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border: none;
  background: var(--gray-100);
  color: var(--gray-600);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.2s;
}
.modal-close:hover { background: var(--gray-200); color: var(--gray-800); }

.modal-price {
  padding: 1.25rem 1.5rem;
  background: var(--gray-50);
  border-bottom: 1px solid var(--gray-100);
}
.price-label { font-size: 0.75rem; color: var(--gray-500); text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 0.25rem; }
.price-value { font-size: 2rem; font-weight: 700; color: var(--primary); }

.details-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
}

.detail-card {
  background: var(--gray-50);
  padding: 1rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.detail-card i { font-size: 1.25rem; color: var(--primary); }
.detail-label { font-size: 0.75rem; color: var(--gray-500); }
.detail-value { font-size: 1rem; font-weight: 700; color: var(--gray-800); }

.modal-section {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--gray-100);
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.section-title i { color: var(--primary); }

.features-list { display: flex; flex-wrap: wrap; gap: 0.5rem; }

.feature-badge {
  background: linear-gradient(135deg, #10B981, #059669);
  color: white;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.813rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.info-grid { display: flex; flex-direction: column; gap: 0.5rem; }
.info-item { display: flex; justify-content: space-between; align-items: center; padding: 0.625rem 0.875rem; background: var(--gray-50); border-radius: 8px; font-size: 0.875rem; }
.info-label { font-weight: 600; color: var(--gray-600); }
.info-value { color: var(--gray-800); }

.status-badge {
  padding: 0.25rem 0.625rem;
  border-radius: 20px;
  font-size: 0.813rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}
.status-badge.active { background: rgba(16,185,129,0.1); color: #10B981; }
.status-badge.inactive { background: rgba(239,68,68,0.1); color: #EF4444; }

.modal-actions {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--gray-100);
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .plans-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
  .details-grid { grid-template-columns: 1fr; }
  .modal-content { border-radius: 18px 18px 0 0; margin-top: auto; max-height: 95vh; }
  .modal-actions { flex-direction: column-reverse; }
  .modal-actions .btn { width: 100%; }
  .faq-grid { grid-template-columns: 1fr; }
}

@media (max-width: 480px) {
  .plans-grid { grid-template-columns: 1fr; }
}
</style>