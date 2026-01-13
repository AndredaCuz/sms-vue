<template>
  <navegacao/>

  <div class="companies-page fade-in">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <i class="fas fa-building"></i>
          Empresas
        </h1>
        <p class="page-subtitle">Gerencie todas as empresas cadastradas no sistema</p>
      </div>
      <div class="header-actions">
        <router-link to="/criar_empresa" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          Criar Empresa
        </router-link>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea, #764ba2);">
          <i class="fas fa-building"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ pagination.total || 0 }}</h3>
          <p class="stat-label">Total de Empresas</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #10b981, #059669);">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ totalAtivas }}</h3>
          <p class="stat-label">Empresas Ativas</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f59e0b, #d97706);">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ totalUsuarios }}</h3>
          <p class="stat-label">Total de Usuários</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #3b82f6, #2563eb);">
          <i class="fas fa-address-book"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ totalClientes }}</h3>
          <p class="stat-label">Total de Clientes</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="filters-grid">
          <div class="filter-group">
            <label>Status</label>
            <select v-model="filters.status" @change="applyFilters" class="form-control">
              <option value="">Todos</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
              <option value="suspended">Suspenso</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Buscar</label>
            <input 
              v-model="filters.search" 
              @input="debouncedSearch"
              class="form-control" 
              placeholder="Nome, email ou NIF..."
            />
          </div>

          <div class="filter-group" style="display: flex; align-items: flex-end;">
            <button @click="clearFilters" class="btn btn-outline w-100">
              <i class="fas fa-times"></i> Limpar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Carregando empresas...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="companies.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-building"></i>
      </div>
      <h3>Nenhuma empresa encontrada</h3>
      <p>{{ filters.search || filters.status ? 'Tente ajustar os filtros' : 'Crie a primeira empresa' }}</p>
      <router-link to="/admin/empresas/criar" class="btn btn-primary">
        <i class="fas fa-plus"></i>
        Criar Primeira Empresa
      </router-link>
    </div>

    <!-- Companies Table -->
    <div v-else class="card">
      <div class="card-body" style="padding: 0;">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Empresa</th>
                <th>Contato</th>
                <th>Plano</th>
                <th>Assinatura</th>
                <th>Estatísticas</th>
                <th>Status</th>
                <th class="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="company in companies" :key="company.id">
                <!-- Empresa -->
                <td>
                  <div class="company-info">
                    <div class="company-logo">
                      <img v-if="company.logo" :src="company.logo" :alt="company.name" />
                      <i v-else class="fas fa-building"></i>
                    </div>
                    <div>
                      <div class="company-name">{{ company.name }}</div>
                      <div class="company-nif">NIF: {{ company.nif }}</div>
                    </div>
                  </div>
                </td>

                <!-- Contato -->
                <td>
                  <div class="contact-info">
                    <div class="contact-item">
                      <i class="fas fa-envelope"></i>
                      {{ company.email }}
                    </div>
                    <div class="contact-item">
                      <i class="fas fa-phone"></i>
                      {{ company.phone }}
                    </div>
                  </div>
                </td>

                <!-- Plano -->
                <td>
                  <div v-if="company.subscription?.plan" class="plan-info">
                    <div class="plan-name">{{ company.subscription.plan.name }}</div>
                    <div class="plan-price">{{ formatCurrency(company.subscription.plan.price_monthly) }}/mês</div>
                  </div>
                  <span v-else class="text-muted">Sem plano</span>
                </td>

                <!-- Assinatura -->
                <td>
                  <div v-if="company.subscription" class="subscription-info">
                    <div class="sms-info">
                      <i class="fas fa-sms"></i>
                      <span>{{ company.subscription.sms_available }} / {{ company.subscription.plan?.sms_quantity || 0 }} SMS</span>
                    </div>
                    <div class="subscription-dates">
                      <i class="far fa-calendar"></i>
                      {{ formatDate(company.subscription.start_date) }} - {{ formatDate(company.subscription.end_date) }}
                    </div>
                  </div>
                  <span v-else class="text-muted">Sem assinatura</span>
                </td>

                <!-- Estatísticas -->
                <td>
                  <div class="stats-info">
                    <div class="stat-item-small">
                      <i class="fas fa-users"></i>
                      {{ company.users_count }} usuário{{ company.users_count !== 1 ? 's' : '' }}
                    </div>
                    <div class="stat-item-small">
                      <i class="fas fa-address-book"></i>
                      {{ company.clients_count }} cliente{{ company.clients_count !== 1 ? 's' : '' }}
                    </div>
                    <div class="stat-item-small">
                      <i class="fas fa-bullhorn"></i>
                      {{ company.campaigns_count }} campanha{{ company.campaigns_count !== 1 ? 's' : '' }}
                    </div>
                  </div>
                </td>

                <!-- Status -->
                <td>
                  <span class="status-badge" :class="getStatusClass(company.status)">
                    <i class="fas fa-circle"></i>
                    {{ getStatusText(company.status) }}
                  </span>
                </td>

                <!-- Ações -->
                <td class="text-center">
                  <div class="action-buttons">
                    <button 
                      @click="viewCompany(company)" 
                      class="btn-icon"
                      title="Ver detalhes"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button 
                      @click="editCompany(company)" 
                      class="btn-icon btn-edit"
                      title="Editar"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button 
                      @click="toggleStatus(company)" 
                      class="btn-icon"
                      :class="company.status === 'active' ? 'btn-warning' : 'btn-success'"
                      :title="company.status === 'active' ? 'Desativar' : 'Ativar'"
                    >
                      <i :class="company.status === 'active' ? 'fas fa-pause' : 'fas fa-play'"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="card-footer">
        <div class="pagination-info">
          Mostrando {{ pagination.from }} a {{ pagination.to }} de {{ pagination.total }} empresas
        </div>
        <div class="pagination">
          <button 
            class="btn btn-ghost btn-sm"
            :disabled="!pagination.prev_page_url"
            @click="changePage(pagination.current_page - 1)"
          >
            <i class="fas fa-chevron-left"></i> Anterior
          </button>
          
          <span class="pagination-current">
            Página {{ pagination.current_page }} de {{ pagination.last_page }}
          </span>
          
          <button 
            class="btn btn-ghost btn-sm"
            :disabled="!pagination.next_page_url"
            @click="changePage(pagination.current_page + 1)"
          >
            Próxima <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Detalhes -->
    <div v-if="showDetailsModal" class="modal-overlay" @click="closeDetailsModal">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h3>
            <i class="fas fa-building"></i>
            Detalhes da Empresa
          </h3>
          <button @click="closeDetailsModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body" v-if="selectedCompany">
          <div class="details-grid">
            <!-- Informações Básicas -->
            <div class="detail-section">
              <h4><i class="fas fa-info-circle"></i> Informações Básicas</h4>
              <div class="detail-item">
                <label>Nome:</label>
                <span>{{ selectedCompany.name }}</span>
              </div>
              <div class="detail-item">
                <label>NIF:</label>
                <span>{{ selectedCompany.nif }}</span>
              </div>
              <div class="detail-item">
                <label>Email:</label>
                <span>{{ selectedCompany.email }}</span>
              </div>
              <div class="detail-item">
                <label>Telefone:</label>
                <span>{{ selectedCompany.phone }}</span>
              </div>
              <div class="detail-item">
                <label>Endereço:</label>
                <span>{{ selectedCompany.address || 'Não informado' }}</span>
              </div>
            </div>

            <!-- Assinatura -->
            <div class="detail-section" v-if="selectedCompany.subscription || selectedCompany.detailedStats?.subscription">
              <h4><i class="fas fa-crown"></i> Assinatura</h4>
              <template v-if="selectedCompany.detailedStats?.subscription">
                <div class="detail-item">
                  <label>Plano:</label>
                  <span>{{ selectedCompany.detailedStats.subscription.plan }}</span>
                </div>
                <div class="detail-item">
                  <label>SMS Disponíveis:</label>
                  <span>{{ selectedCompany.detailedStats.subscription.sms_available }}</span>
                </div>
                <div class="detail-item">
                  <label>SMS Utilizados:</label>
                  <span>{{ selectedCompany.detailedStats.subscription.sms_used }}</span>
                </div>
                <div class="detail-item">
                  <label>Status:</label>
                  <span class="status-badge" :class="getStatusClass(selectedCompany.detailedStats.subscription.status)">
                    {{ getStatusText(selectedCompany.detailedStats.subscription.status) }}
                  </span>
                </div>
                <div class="detail-item">
                  <label>Fim da Assinatura:</label>
                  <span>{{ formatDate(selectedCompany.detailedStats.subscription.end_date) }}</span>
                </div>
              </template>
              <template v-else-if="selectedCompany.subscription">
                <div class="detail-item">
                  <label>Plano:</label>
                  <span>{{ selectedCompany.subscription.plan?.name }}</span>
                </div>
                <div class="detail-item">
                  <label>SMS Disponíveis:</label>
                  <span>{{ selectedCompany.subscription.sms_available }} / {{ selectedCompany.subscription.plan?.sms_quantity }}</span>
                </div>
                <div class="detail-item">
                  <label>SMS Utilizados:</label>
                  <span>{{ selectedCompany.subscription.sms_used }}</span>
                </div>
                <div class="detail-item">
                  <label>Status:</label>
                  <span class="status-badge" :class="getStatusClass(selectedCompany.subscription.status)">
                    {{ getStatusText(selectedCompany.subscription.status) }}
                  </span>
                </div>
                <div class="detail-item">
                  <label>Renovação Automática:</label>
                  <span>{{ selectedCompany.subscription.auto_renew ? 'Sim' : 'Não' }}</span>
                </div>
                <div class="detail-item">
                  <label>Próxima Cobrança:</label>
                  <span>{{ formatDate(selectedCompany.subscription.next_billing_date) }}</span>
                </div>
              </template>
            </div>

            <!-- Estatísticas -->
            <div class="detail-section full-width">
              <h4><i class="fas fa-chart-bar"></i> Estatísticas</h4>
              
              <!-- Estatísticas básicas (da listagem) -->
              <div v-if="!selectedCompany.detailedStats" class="stats-row">
                <div class="stat-box">
                  <i class="fas fa-users"></i>
                  <div class="stat-box-value">{{ selectedCompany.users_count }}</div>
                  <div class="stat-box-label">Usuários</div>
                </div>
                <div class="stat-box">
                  <i class="fas fa-address-book"></i>
                  <div class="stat-box-value">{{ selectedCompany.clients_count }}</div>
                  <div class="stat-box-label">Clientes</div>
                </div>
                <div class="stat-box">
                  <i class="fas fa-bullhorn"></i>
                  <div class="stat-box-value">{{ selectedCompany.campaigns_count }}</div>
                  <div class="stat-box-label">Campanhas</div>
                </div>
              </div>
              
              <!-- Estatísticas detalhadas (da API de stats) -->
              <div v-else>
                <div class="stats-row">
                  <div class="stat-box">
                    <i class="fas fa-users"></i>
                    <div class="stat-box-value">{{ selectedCompany.detailedStats.totals.users }}</div>
                    <div class="stat-box-label">Usuários</div>
                  </div>
                  <div class="stat-box">
                    <i class="fas fa-address-book"></i>
                    <div class="stat-box-value">{{ selectedCompany.detailedStats.totals.clients }}</div>
                    <div class="stat-box-label">Clientes</div>
                  </div>
                  <div class="stat-box">
                    <i class="fas fa-user-check"></i>
                    <div class="stat-box-value">{{ selectedCompany.detailedStats.totals.active_clients }}</div>
                    <div class="stat-box-label">Clientes Ativos</div>
                  </div>
                </div>
                
                <div class="stats-row" style="margin-top: 1rem;">
                  <div class="stat-box">
                    <i class="fas fa-bullhorn"></i>
                    <div class="stat-box-value">{{ selectedCompany.detailedStats.totals.campaigns }}</div>
                    <div class="stat-box-label">Campanhas</div>
                  </div>
                  <div class="stat-box">
                    <i class="fas fa-check-double"></i>
                    <div class="stat-box-value">{{ selectedCompany.detailedStats.totals.completed_campaigns }}</div>
                    <div class="stat-box-label">Concluídas</div>
                  </div>
                  <div class="stat-box">
                    <i class="fas fa-folder"></i>
                    <div class="stat-box-value">{{ selectedCompany.detailedStats.totals.categories }}</div>
                    <div class="stat-box-label">Categorias</div>
                  </div>
                </div>
                
                <div class="stats-row" style="margin-top: 1rem;">
                  <div class="stat-box">
                    <i class="fas fa-file-alt"></i>
                    <div class="stat-box-value">{{ selectedCompany.detailedStats.totals.templates }}</div>
                    <div class="stat-box-label">Templates</div>
                  </div>
                </div>

                <!-- SMS deste mês -->
                <div style="margin-top: 1.5rem;">
                  <h5 style="font-size: 1rem; font-weight: 600; color: #1f2937; margin-bottom: 1rem;">
                    <i class="fas fa-calendar-alt"></i> SMS deste mês
                  </h5>
                  <div class="stats-row">
                    <div class="stat-box">
                      <i class="fas fa-sms"></i>
                      <div class="stat-box-value">{{ selectedCompany.detailedStats.sms_this_month.total }}</div>
                      <div class="stat-box-label">Total</div>
                    </div>
                    <div class="stat-box">
                      <i class="fas fa-check"></i>
                      <div class="stat-box-value">{{ selectedCompany.detailedStats.sms_this_month.sent }}</div>
                      <div class="stat-box-label">Enviados</div>
                    </div>
                    <div class="stat-box">
                      <i class="fas fa-times"></i>
                      <div class="stat-box-value">{{ selectedCompany.detailedStats.sms_this_month.failed }}</div>
                      <div class="stat-box-label">Falhados</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button @click="closeDetailsModal" class="btn btn-outline">
            <i class="fas fa-times"></i> Fechar
          </button>
          <button @click="editCompany(selectedCompany)" class="btn btn-primary">
            <i class="fas fa-edit"></i> Editar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import navegacao from '../../components/navegacao.vue';

export default {
  name: 'AdminCompanies',
  components: {
    navegacao
  },
  data() {
    return {
      isLoading: true,
      companies: [],
      selectedCompany: null,
      showDetailsModal: false,
      filters: {
        status: '',
        search: ''
      },
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
        from: 0,
        to: 0,
        prev_page_url: null,
        next_page_url: null
      },
      debounceTimer: null
    };
  },
  computed: {
    totalAtivas() {
      return this.companies.filter(c => c.status === 'active').length;
    },
    totalUsuarios() {
      return this.companies.reduce((sum, c) => sum + (c.users_count || 0), 0);
    },
    totalClientes() {
      return this.companies.reduce((sum, c) => sum + (c.clients_count || 0), 0);
    }
  },
  methods: {
    async fetchCompanies(page = 1) {
      this.isLoading = true;
      const token = localStorage.getItem('auth_token');

      try {
        const params = {
          page: page,
          per_page: this.pagination.per_page
        };

        if (this.filters.status) params.status = this.filters.status;
        if (this.filters.search) params.search = this.filters.search;

        const response = await axios.get('https://api.devsms.online/api/v1/admin/companies', {
          params: params,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        const data = response.data.data;
        this.companies = data.data || [];
        
        this.pagination = {
          current_page: data.current_page,
          last_page: data.last_page,
          per_page: data.per_page,
          total: data.total,
          from: data.from,
          to: data.to,
          prev_page_url: data.prev_page_url,
          next_page_url: data.next_page_url
        };

        console.log('✅ Empresas carregadas:', this.companies.length);

      } catch (error) {
        console.error('❌ Erro ao buscar empresas:', error);
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem('auth_token');
          this.$router.push('/login');
        } else {
          alert('Erro ao carregar empresas');
        }
      } finally {
        this.isLoading = false;
      }
    },

    changePage(page) {
      if (page >= 1 && page <= this.pagination.last_page) {
        this.fetchCompanies(page);
      }
    },

    applyFilters() {
      this.fetchCompanies(1);
    },

    debouncedSearch() {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.applyFilters();
      }, 500);
    },

    clearFilters() {
      this.filters = {
        status: '',
        search: ''
      };
      this.fetchCompanies(1);
    },

    async viewCompany(company) {
      this.selectedCompany = company;
      this.showDetailsModal = true;
      
      // Buscar estatísticas detalhadas da empresa
      await this.fetchCompanyStats(company.id);
    },

    async fetchCompanyStats(companyId) {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await axios.get(
          `https://api.devsms.online/api/v1/admin/companies/${companyId}/stats`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        if (response.data.success && this.selectedCompany) {
          // Atualizar os dados da empresa selecionada com as estatísticas detalhadas
          this.selectedCompany.detailedStats = response.data.data;
        }

      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      }
    },

    closeDetailsModal() {
      this.showDetailsModal = false;
      this.selectedCompany = null;
    },

    editCompany(company) {
      this.$router.push(`/admin/empresas/${company.id}/editar`);
    },

    async toggleStatus(company) {
      // Determinar o novo status baseado no status atual
      let newStatus;
      let action;
      
      if (company.status === 'active') {
        newStatus = 'inactive';
        action = 'desativar';
      } else if (company.status === 'inactive') {
        newStatus = 'active';
        action = 'ativar';
      } else if (company.status === 'suspended') {
        newStatus = 'active';
        action = 'ativar';
      }
      
      if (!confirm(`Deseja ${action} a empresa "${company.name}"?`)) {
        return;
      }

      try {
        const token = localStorage.getItem('auth_token');
        const response = await axios.patch(
          `https://api.devsms.online/api/v1/admin/companies/${company.id}/status`,
          { status: newStatus },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.data.success) {
          alert(response.data.message || `Empresa ${action === 'ativar' ? 'ativada' : 'desativada'} com sucesso!`);
          this.fetchCompanies(this.pagination.current_page);
        }

      } catch (error) {
        console.error('Erro ao alterar status:', error);
        const errorMsg = error.response?.data?.message || 'Erro ao alterar status da empresa';
        alert(errorMsg);
      }
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-AO', { day: '2-digit', month: 'short', year: 'numeric' });
    },

    formatCurrency(value) {
      if (!value) return 'Grátis';
      return new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA',
        minimumFractionDigits: 0
      }).format(value);
    },

    getStatusClass(status) {
      const classes = {
        'active': 'status-active',
        'inactive': 'status-inactive',
        'suspended': 'status-suspended'
      };
      return classes[status] || 'status-inactive';
    },

    getStatusText(status) {
      const texts = {
        'active': 'Ativo',
        'inactive': 'Inativo',
        'suspended': 'Suspenso'
      };
      return texts[status] || status;
    }
  },
  mounted() {
    this.fetchCompanies();
  }
};
</script>

<style scoped>
.companies-page {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-subtitle {
  color: #6b7280;
  margin: 0.5rem 0 0 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
}

/* Continuação dos estilos */

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-body {
  padding: 1.5rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-control {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.938rem;
  transition: all 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background: #f9fafb;
}

.table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table td {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
}

.company-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.company-logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
}

.company-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.company-logo i {
  font-size: 1.5rem;
  color: #9ca3af;
}

.company-name {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.company-nif {
  font-size: 0.813rem;
  color: #6b7280;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.contact-item i {
  color: #9ca3af;
  width: 16px;
}

.plan-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.plan-name {
  font-weight: 600;
  color: #1f2937;
}

.plan-price {
  font-size: 0.875rem;
  color: #6b7280;
}

.subscription-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sms-info,
.subscription-dates {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.sms-info i,
.subscription-dates i {
  color: #9ca3af;
  width: 16px;
}

.stats-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.stat-item-small {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.stat-item-small i {
  color: #6366f1;
  width: 16px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.813rem;
  font-weight: 600;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-inactive {
  background: #fee2e2;
  color: #991b1b;
}

.status-suspended {
  background: #fef3c7;
  color: #92400e;
}

.status-badge i {
  font-size: 0.5rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: #e5e7eb;
  color: #374151;
}

.btn-icon.btn-edit {
  color: #6366f1;
}

.btn-icon.btn-edit:hover {
  background: #eef2ff;
  color: #4f46e5;
}

.btn-icon.btn-warning {
  color: #f59e0b;
}

.btn-icon.btn-warning:hover {
  background: #fef3c7;
  color: #d97706;
}

.btn-icon.btn-success {
  color: #10b981;
}

.btn-icon.btn-success:hover {
  background: #d1fae5;
  color: #059669;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.pagination-info {
  color: #6b7280;
  font-size: 0.875rem;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pagination-current {
  font-size: 0.875rem;
  color: #4b5563;
  font-weight: 500;
}

.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.938rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-outline {
  background: white;
  color: #6b7280;
  border: 2px solid #e5e7eb;
}

.btn-outline:hover {
  background: #f9fafb;
  border-color: #d1d5db;
}

.btn-ghost {
  background: transparent;
  color: #6b7280;
  border: 1px solid #e5e7eb;
}

.btn-ghost:hover:not(:disabled) {
  background: #f9fafb;
}

.btn-ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  margin-top: 1rem;
  color: #6b7280;
  font-size: 0.938rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  width: 100px;
  height: 100px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #667eea20, #764ba220);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: #667eea;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #6b7280;
  margin: 0 0 1.5rem 0;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.3s;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-content.large {
  max-width: 900px;
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-close {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.btn-close:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.modal-body {
  padding: 2rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.detail-section {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 12px;
}

.detail-section.full-width {
  grid-column: 1 / -1;
}

.detail-section h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e5e7eb;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item label {
  font-weight: 600;
  color: #4b5563;
  font-size: 0.875rem;
}

.detail-item span {
  color: #1f2937;
  font-size: 0.875rem;
  text-align: right;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-box {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  border: 2px solid #e5e7eb;
  transition: all 0.3s;
}

.stat-box:hover {
  border-color: #6366f1;
  transform: translateY(-2px);
}

.stat-box i {
  font-size: 2rem;
  color: #6366f1;
  margin-bottom: 0.75rem;
}

.stat-box-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.stat-box-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.text-center {
  text-align: center;
}

.text-muted {
  color: #9ca3af;
  font-size: 0.875rem;
  font-style: italic;
}

.table-responsive {
  overflow-x: auto;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

.w-100 {
  width: 100%;
}

.fade-in {
  animation: fadeIn 0.5s ease-in;
}

/* Responsive */
@media (max-width: 1200px) {
  .details-grid {
    grid-template-columns: 1fr;
  }

  .detail-section.full-width {
    grid-column: 1;
  }
}

@media (max-width: 768px) {
  .companies-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .btn {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .table-responsive {
    overflow-x: scroll;
  }

  .table {
    min-width: 1000px;
  }

  .card-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .pagination {
    justify-content: space-between;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }

  .modal-content {
    margin: 0;
    max-height: 100vh;
    border-radius: 0;
  }

  .modal-content.large {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .action-buttons {
    flex-direction: column;
    gap: 0.25rem;
  }

  .btn-icon {
    width: 100%;
  }
}

/* Scrollbar customizado para o modal */
.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #6366f1;
  border-radius: 10px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #4f46e5;
}

/* Melhorias visuais adicionais */
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
}

.table tbody tr:hover {
  background: #f9fafb;
  transition: background 0.2s;
}

.btn {
  white-space: nowrap;
}

.detail-item:hover {
  background: rgba(99, 102, 241, 0.05);
  border-radius: 6px;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  transition: all 0.2s;
}
</style>