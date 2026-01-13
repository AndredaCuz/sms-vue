<template>
  <navegacao/>

  <div class="planos-admin-page fade-in">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">
            <i class="fas fa-crown"></i> Gerenciamento de Planos
          </h1>
          <p class="page-subtitle">
            Gerencie todos os planos de assinatura da plataforma
          </p>
        </div>
        <div class="header-actions">
          <router-link to="/admin/planos/criar" class="btn btn-primary">
            <i class="fas fa-plus"></i> Criar Novo Plano
          </router-link>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea, #764ba2);">
          <i class="fas fa-layer-group"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Total de Planos</div>
          <div class="stat-value">{{ plans.length }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Planos Ativos</div>
          <div class="stat-value">{{ activePlansCount }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #ef4444, #dc2626);">
          <i class="fas fa-times-circle"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Planos Inativos</div>
          <div class="stat-value">{{ inactivePlansCount }}</div>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
          <i class="fas fa-dollar-sign"></i>
        </div>
        <div class="stat-content">
          <div class="stat-label">Receita Potencial</div>
          <div class="stat-value">{{ formatPrice(totalRevenue) }}</div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-card">
      <div class="filters-content">
        <div class="filter-group">
          <label class="filter-label">
            <i class="fas fa-search"></i> Buscar
          </label>
          <input 
            v-model="searchQuery" 
            type="text" 
            class="filter-input" 
            placeholder="Buscar por nome ou descrição..."
          />
        </div>

        <div class="filter-group">
          <label class="filter-label">
            <i class="fas fa-filter"></i> Status
          </label>
          <select v-model="filterStatus" class="filter-select">
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
          </select>
        </div>

        <div class="filter-group">
          <label class="filter-label">
            <i class="fas fa-sort"></i> Ordenar por
          </label>
          <select v-model="sortBy" class="filter-select">
            <option value="sort_order">Ordem</option>
            <option value="name">Nome</option>
            <option value="price">Preço</option>
            <option value="created_at">Data de Criação</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Carregando planos...</p>
    </div>

    <!-- Plans Table -->
    <div v-else-if="filteredPlans.length > 0" class="card">
      <div class="card-body" style="padding: 0;">
        <div class="table-responsive">
          <table class="plans-table">
            <thead>
              <tr>
                <th style="width: 50px;">
                  <input type="checkbox" @change="toggleAllPlans" />
                </th>
                <th>Plano</th>
                <th>SMS/Mês</th>
                <th>Preço</th>
                <th>Usuários</th>
                <th>Clientes</th>
                <th>Status</th>
                <th>Ordem</th>
                <th style="width: 200px;">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="plan in filteredPlans" :key="plan.id" :class="{ 'inactive-row': !plan.is_active }">
                <td>
                  <input type="checkbox" v-model="selectedPlans" :value="plan.id" />
                </td>
                <td>
                  <div class="plan-info">
                    <div class="plan-icon-small" :style="{ background: getPlanColor(plan.slug) }">
                      <i :class="getPlanIcon(plan.slug)"></i>
                    </div>
                    <div>
                      <div class="plan-name-small">{{ plan.name }}</div>
                      <div class="plan-description-small">{{ truncateText(plan.description, 50) }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge badge-info">
                    <i class="fas fa-sms"></i> {{ formatQuantity(plan.sms_quantity) }}
                  </span>
                </td>
                <td>
                  <strong>{{ formatPrice(plan.price_monthly) }}</strong>
                </td>
                <td>
                  <span class="badge badge-secondary">
                    <i class="fas fa-users"></i> {{ formatQuantity(plan.max_users) }}
                  </span>
                </td>
                <td>
                  <span class="badge badge-secondary">
                    <i class="fas fa-address-book"></i> {{ formatQuantity(plan.max_clients) }}
                  </span>
                </td>
                <td>
                  <button 
                    @click="togglePlanStatus(plan)" 
                    class="status-toggle"
                    :class="plan.is_active ? 'active' : 'inactive'"
                    :disabled="plan.isToggling"
                  >
                    <i v-if="plan.isToggling" class="fas fa-spinner fa-spin"></i>
                    <i v-else :class="plan.is_active ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                    {{ plan.is_active ? 'Ativo' : 'Inativo' }}
                  </button>
                </td>
                <td>
                  <span class="sort-badge">{{ plan.sort_order }}</span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button 
                      @click="viewPlanDetails(plan)" 
                      class="btn-action btn-info"
                      title="Ver Detalhes"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <router-link 
                      :to="`/atualizar_planos/${plan.id}`" 
                      class="btn-action btn-success"
                      title="Atualizar Plano"
                    >
                      <i class="fas fa-sync-alt"></i>
                    </router-link>
                    <button 
                      @click="confirmDeletePlan(plan)" 
                      class="btn-action btn-danger"
                      title="Excluir"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-inbox"></i>
      </div>
      <h3>Nenhum plano encontrado</h3>
      <p>{{ searchQuery ? 'Tente ajustar os filtros de busca' : 'Crie seu primeiro plano para começar' }}</p>
      <router-link v-if="!searchQuery" to="/admin/planos/criar" class="btn btn-primary">
        <i class="fas fa-plus"></i> Criar Primeiro Plano
      </router-link>
    </div>

    <!-- Plan Details Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content modal-large" @click.stop>
        <div v-if="loadingDetails" class="modal-loading">
          <div class="spinner"></div>
          <p>Carregando detalhes...</p>
        </div>

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

          <!-- Plan Details Grid -->
          <div class="details-section">
            <div class="details-grid">
              <div class="detail-card">
                <div class="detail-icon">
                  <i class="fas fa-hashtag"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">ID</div>
                  <div class="detail-value">#{{ selectedPlanDetails.id }}</div>
                </div>
              </div>

              <div class="detail-card">
                <div class="detail-icon">
                  <i class="fas fa-tag"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">Slug</div>
                  <div class="detail-value">{{ selectedPlanDetails.slug }}</div>
                </div>
              </div>

              <div class="detail-card">
                <div class="detail-icon">
                  <i class="fas fa-dollar-sign"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">Preço Mensal</div>
                  <div class="detail-value">{{ formatPrice(selectedPlanDetails.price_monthly) }}</div>
                </div>
              </div>

              <div class="detail-card">
                <div class="detail-icon">
                  <i class="fas fa-sms"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">SMS por Mês</div>
                  <div class="detail-value">{{ formatQuantity(selectedPlanDetails.sms_quantity) }}</div>
                </div>
              </div>

              <div class="detail-card">
                <div class="detail-icon">
                  <i class="fas fa-users"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">Máx. Usuários</div>
                  <div class="detail-value">{{ formatQuantity(selectedPlanDetails.max_users) }}</div>
                </div>
              </div>

              <div class="detail-card">
                <div class="detail-icon">
                  <i class="fas fa-address-book"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">Máx. Clientes</div>
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

              <div class="detail-card">
                <div class="detail-icon">
                  <i :class="selectedPlanDetails.is_active ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                </div>
                <div class="detail-content">
                  <div class="detail-label">Status</div>
                  <div class="detail-value">
                    <span :class="['status-badge', selectedPlanDetails.is_active ? 'active' : 'inactive']">
                      {{ selectedPlanDetails.is_active ? 'Ativo' : 'Inativo' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Features -->
          <div class="details-section">
            <h3 class="section-title">
              <i class="fas fa-star"></i> Funcionalidades
            </h3>
            <div class="features-list">
              <div v-for="feature in selectedPlanDetails.features" :key="feature" class="feature-badge">
                <i class="fas fa-check-circle"></i>
                {{ getFeatureText(feature) }}
              </div>
            </div>
          </div>

          <!-- Dates -->
          <div class="details-section">
            <h3 class="section-title">
              <i class="fas fa-calendar"></i> Datas
            </h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Criado em:</span>
                <span class="info-value">{{ formatDate(selectedPlanDetails.created_at) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Última atualização:</span>
                <span class="info-value">{{ formatDate(selectedPlanDetails.updated_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="modal-actions">
            <button class="btn btn-ghost" @click="closeModal">
              <i class="fas fa-times"></i> Fechar
            </button>
            <router-link :to="`/admin/planos/editar/${selectedPlanDetails.id}`" class="btn btn-primary">
              <i class="fas fa-edit"></i> Editar Plano
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import navegacao from '../../components/navegacao.vue';

export default {
  name: 'ListaPlanosAdmin',
  components: {
    navegacao
  },
  data() {
    return {
      isLoading: true,
      plans: [],
      selectedPlans: [],
      searchQuery: '',
      filterStatus: 'all',
      sortBy: 'sort_order',
      showModal: false,
      loadingDetails: false,
      selectedPlanDetails: null
    };
  },
  computed: {
    filteredPlans() {
      let filtered = [...this.plans];

      // Filtro de busca
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filtered = filtered.filter(plan => 
          plan.name.toLowerCase().includes(query) ||
          (plan.description && plan.description.toLowerCase().includes(query))
        );
      }

      // Filtro de status
      if (this.filterStatus === 'active') {
        filtered = filtered.filter(plan => plan.is_active);
      } else if (this.filterStatus === 'inactive') {
        filtered = filtered.filter(plan => !plan.is_active);
      }

      // Ordenação
      filtered.sort((a, b) => {
        switch (this.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'price':
            return parseFloat(b.price_monthly) - parseFloat(a.price_monthly);
          case 'created_at':
            return new Date(b.created_at) - new Date(a.created_at);
          case 'sort_order':
          default:
            return a.sort_order - b.sort_order;
        }
      });

      return filtered;
    },
    activePlansCount() {
      return this.plans.filter(p => p.is_active).length;
    },
    inactivePlansCount() {
      return this.plans.filter(p => !p.is_active).length;
    },
    totalRevenue() {
      return this.plans.reduce((sum, plan) => sum + parseFloat(plan.price_monthly), 0);
    }
  },
  methods: {
    async fetchPlans() {
      this.isLoading = true;
      const token = localStorage.getItem('auth_token');

      try {
        const response = await axios.get('https://api.devsms.online/api/v1/admin/plans', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        this.plans = response.data.data.map(plan => ({
          ...plan,
          isToggling: false
        }));

        console.log('✅ Planos carregados:', this.plans.length);

      } catch (error) {
        console.error('❌ Erro ao buscar planos:', error);
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          alert('Você não tem permissão para acessar esta página.');
          localStorage.removeItem('auth_token');
          this.$router.push('/login');
        } else {
          alert('Erro ao carregar planos. Por favor, recarregue a página.');
        }
      } finally {
        this.isLoading = false;
      }
    },

    async togglePlanStatus(plan) {
      if (plan.isToggling) return;

      const action = plan.is_active ? 'desativar' : 'ativar';
      const confirmed = confirm(`Tem certeza que deseja ${action} o plano "${plan.name}"?`);
      
      if (!confirmed) return;

      plan.isToggling = true;
      const token = localStorage.getItem('auth_token');

      console.log('🔍 Alternando status do plano:', plan.id);

      try {
        const response = await axios.patch(
          `https://api.devsms.online/api/v1/admin/plans/${plan.id}/toggle`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        // Atualizar o plano na lista
        const updatedPlan = response.data.data;
        const index = this.plans.findIndex(p => p.id === plan.id);
        if (index !== -1) {
          this.plans[index] = { ...updatedPlan, isToggling: false };
        }

        const message = updatedPlan.is_active ? '✅ Plano ativado com sucesso!' : '✅ Plano desativado com sucesso!';
        alert(message);

      } catch (error) {
        console.error('❌ Erro ao alterar status do plano:', error);
        console.error('❌ Detalhes do erro:', error.response?.data);
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          alert('Você não tem permissão para realizar esta ação.');
        } else if (error.response?.data?.message) {
          alert('Erro: ' + error.response.data.message);
        } else {
          alert('Erro ao alterar status do plano. Por favor, tente novamente.');
        }
      } finally {
        plan.isToggling = false;
      }
    },

    async viewPlanDetails(plan) {
      this.showModal = true;
      this.loadingDetails = true;
      this.selectedPlanDetails = null;

      const token = localStorage.getItem('auth_token');

      try {
        const response = await axios.get(
          `https://api.devsms.online/api/v1/admin/plans/${plan.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        this.selectedPlanDetails = response.data.data;

      } catch (error) {
        console.error('❌ Erro ao buscar detalhes do plano:', error);
        alert('Erro ao carregar detalhes do plano.');
        this.closeModal();
      } finally {
        this.loadingDetails = false;
      }
    },

    async confirmDeletePlan(plan) {
      const confirmed = confirm(
        `⚠️ ATENÇÃO!\n\nVocê está prestes a EXCLUIR permanentemente o plano "${plan.name}".\n\nEsta ação NÃO pode ser desfeita!\n\nDeseja continuar?`
      );

      if (!confirmed) return;

      const doubleConfirm = confirm(`Digite "EXCLUIR" para confirmar:\n\nEsta é a última confirmação!`);
      
      if (!doubleConfirm) return;

      const token = localStorage.getItem('auth_token');

      try {
        await axios.delete(
          `https://api.devsms.online/api/v1/admin/plans/${plan.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        alert('✅ Plano excluído com sucesso!');
        
        // Remover da lista
        this.plans = this.plans.filter(p => p.id !== plan.id);

      } catch (error) {
        console.error('❌ Erro ao excluir plano:', error);
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          alert('Você não tem permissão para realizar esta ação.');
        } else if (error.response?.data?.message) {
          alert('Erro: ' + error.response.data.message);
        } else {
          alert('Erro ao excluir plano. Por favor, tente novamente.');
        }
      }
    },

    closeModal() {
      this.showModal = false;
      this.selectedPlanDetails = null;
      this.loadingDetails = false;
    },

    toggleAllPlans() {
      if (this.selectedPlans.length === this.filteredPlans.length) {
        this.selectedPlans = [];
      } else {
        this.selectedPlans = this.filteredPlans.map(p => p.id);
      }
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
    },

    truncateText(text, maxLength) {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
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
    }
  },
  mounted() {
    this.fetchPlans();
  }
};
</script>

<style scoped>
:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-800: #1f2937;
  --gray-900: #111827;
}

.planos-admin-page {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Header */
.page-header {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-subtitle {
  color: var(--gray-600);
  font-size: 0.938rem;
  margin: 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  color: white;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-900);
}

/* Filters */
.filters-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
}

.filters-content {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1.5rem;
  align-items: end;
}

@media (max-width: 768px) {
  .filters-content {
    grid-template-columns: 1fr;
  }
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-input,
.filter-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  font-size: 0.9375rem;
  transition: all 0.3s;
  font-family: inherit;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* Loading */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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

/* Card */
.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-body {
  padding: 1.5rem;
}

/* Table */
.table-responsive {
  overflow-x: auto;
}

.plans-table {
  width: 100%;
  border-collapse: collapse;
}

.plans-table thead {
  background: var(--gray-50);
  border-bottom: 2px solid var(--gray-200);
}

.plans-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--gray-700);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.plans-table tbody tr {
  border-bottom: 1px solid var(--gray-200);
  transition: all 0.2s;
}

.plans-table tbody tr:hover {
  background: var(--gray-50);
}

.plans-table tbody tr.inactive-row {
  opacity: 0.6;
}

.plans-table td {
  padding: 1rem;
  vertical-align: middle;
}

/* Plan Info in Table */
.plan-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.plan-icon-small {
  width: 45px;
  height: 45px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.plan-name-small {
  font-weight: 600;
  color: var(--gray-900);
  font-size: 0.938rem;
  margin-bottom: 0.25rem;
}

.plan-description-small {
  font-size: 0.813rem;
  color: var(--gray-600);
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.813rem;
  font-weight: 600;
}

.badge-info {
  background: rgba(59, 130, 246, 0.1);
  color: var(--info);
}

.badge-secondary {
  background: var(--gray-100);
  color: var(--gray-700);
}

.sort-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 35px;
  height: 35px;
  background: var(--gray-100);
  color: var(--gray-700);
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.938rem;
}

/* Status Toggle */
.status-toggle {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 20px;
  font-size: 0.813rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-toggle.active {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

.status-toggle.active:hover {
  background: rgba(16, 185, 129, 0.2);
}

.status-toggle.inactive {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
}

.status-toggle.inactive:hover {
  background: rgba(239, 68, 68, 0.2);
}

.status-toggle:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.938rem;
  text-decoration: none;
}

.btn-action.btn-info {
  background: rgba(59, 130, 246, 0.1);
  color: var(--info);
}

.btn-action.btn-info:hover {
  background: var(--info);
  color: white;
  transform: translateY(-2px);
}

.btn-action.btn-success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

.btn-action.btn-success:hover {
  background: var(--success);
  color: white;
  transform: translateY(-2px);
}

.btn-action.btn-warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning);
}

.btn-action.btn-warning:hover {
  background: var(--warning);
  color: white;
  transform: translateY(-2px);
}

.btn-action.btn-danger {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
}

.btn-action.btn-danger:hover {
  background: var(--danger);
  color: white;
  transform: translateY(-2px);
}

/* Empty State */
.empty-state {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  padding: 4rem 2rem;
  text-align: center;
}

.empty-icon {
  width: 100px;
  height: 100px;
  margin: 0 auto 1.5rem;
  background: var(--gray-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: var(--gray-400);
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--gray-600);
  margin-bottom: 1.5rem;
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  justify-content: center;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-ghost {
  background: var(--gray-100);
  color: var(--gray-700);
}

.btn-ghost:hover {
  background: var(--gray-200);
}

/* Modal */
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

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: 900px;
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
  color: var(--gray-900);
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
  transition: all 0.2s;
}

.modal-close:hover {
  background: var(--gray-200);
  color: var(--gray-800);
}

/* Details Section */
.details-section {
  padding: 2rem;
  border-top: 1px solid var(--gray-200);
}

.details-section:first-of-type {
  border-top: none;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.detail-card {
  background: var(--gray-50);
  padding: 1.25rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.2s;
}

.detail-card:hover {
  background: var(--gray-100);
  transform: translateY(-2px);
}

.detail-icon {
  width: 45px;
  height: 45px;
  background: white;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: var(--primary);
  flex-shrink: 0;
}

.detail-content {
  flex: 1;
  min-width: 0;
}

.detail-label {
  font-size: 0.75rem;
  color: var(--gray-600);
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gray-900);
  word-break: break-word;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section-title i {
  color: var(--primary);
}

/* Features List */
.features-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.feature-badge {
  background: linear-gradient(135deg, var(--success), #059669);
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

/* Info Grid */
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
  color: var(--gray-900);
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

/* Modal Actions */
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

/* Responsive */
@media (max-width: 1024px) {
  .plans-table {
    font-size: 0.875rem;
  }

  .plans-table th,
  .plans-table td {
    padding: 0.75rem;
  }
}

@media (max-width: 768px) {
  .planos-admin-page {
    padding: 1rem;
  }

  .page-header {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .table-responsive {
    overflow-x: scroll;
  }

  .plans-table {
    min-width: 900px;
  }

  .modal-content {
    max-height: 95vh;
    border-radius: 20px 20px 0 0;
    margin-top: auto;
  }

  .modal-title {
    font-size: 1.5rem;
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