<template>
  <navegacao/>

  <div class="fade-in">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">
          <i class="fas fa-history"></i> Histórico de SMS
        </h1>
        <p class="page-description">Visualize e gerencie todo o histórico de mensagens enviadas</p>
      </div>
      <button class="btn btn-primary" @click="exportData">
        <i class="fas fa-download"></i> Exportar Relatório
      </button>
    </div>

    <!-- Filters Card -->
    <div class="card mb-4">
      <div class="card-header">
        <h3 class="card-title">
          <i class="fas fa-filter"></i> Filtros
        </h3>
      </div>
      <div class="card-body">
        <div class="filters-grid">
          <div class="filter-group">
            <label>Data Início</label>
            <input 
              type="date" 
              v-model="filters.start_date" 
              class="form-control"
              @change="applyFilters"
            />
          </div>

          <div class="filter-group">
            <label>Data Fim</label>
            <input 
              type="date" 
              v-model="filters.end_date" 
              class="form-control"
              @change="applyFilters"
            />
          </div>

          <div class="filter-group">
            <label>Status</label>
            <select v-model="filters.status" class="form-control" @change="applyFilters">
              <option value="">Todos</option>
              <option value="sent">Enviado</option>
              <option value="delivered">Entregue</option>
              <option value="failed">Falhou</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Campanha</label>
            <input 
              type="text" 
              v-model="filters.campaign" 
              class="form-control" 
              placeholder="Nome da campanha"
              @input="debouncedFilter"
            />
          </div>

          <div class="filter-group">
            <label>Telefone</label>
            <input 
              type="text" 
              v-model="filters.phone" 
              class="form-control" 
              placeholder="Número do telefone"
              @input="debouncedFilter"
            />
          </div>

          <div class="filter-group" style="display: flex; align-items: flex-end;">
            <button class="btn btn-outline w-100" @click="clearFilters">
              <i class="fas fa-times"></i> Limpar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Summary -->
    <div class="grid grid-4 mb-4">
      <div class="stat-card-small">
        <div class="stat-icon-small" style="background: var(--info-light); color: var(--info);">
          <i class="fas fa-paper-plane"></i>
        </div>
        <div>
          <div class="stat-value-small">{{ summary.total }}</div>
          <div class="stat-label-small">Total de SMS</div>
        </div>
      </div>

      <div class="stat-card-small">
        <div class="stat-icon-small" style="background: var(--success-light); color: var(--success);">
          <i class="fas fa-check-circle"></i>
        </div>
        <div>
          <div class="stat-value-small">{{ summary.sent }}</div>
          <div class="stat-label-small">Enviados</div>
        </div>
      </div>

      <div class="stat-card-small">
        <div class="stat-icon-small" style="background: var(--success-light); color: var(--success);">
          <i class="fas fa-check-double"></i>
        </div>
        <div>
          <div class="stat-value-small">{{ summary.delivered }}</div>
          <div class="stat-label-small">Entregues</div>
        </div>
      </div>

      <div class="stat-card-small">
        <div class="stat-icon-small" style="background: var(--danger-light); color: var(--danger);">
          <i class="fas fa-times-circle"></i>
        </div>
        <div>
          <div class="stat-value-small">{{ summary.failed }}</div>
          <div class="stat-label-small">Falharam</div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Carregando histórico...</p>
    </div>

    <!-- SMS History Table -->
    <div v-else class="card">
      <div class="card-header">
        <h3 class="card-title">
          <i class="fas fa-list"></i> Registros ({{ pagination.total }})
        </h3>
        <div class="card-actions">
          <select v-model="pagination.per_page" @change="fetchHistory" class="form-control-sm">
            <option :value="10">10 por página</option>
            <option :value="25">25 por página</option>
            <option :value="50">50 por página</option>
            <option :value="100">100 por página</option>
          </select>
        </div>
      </div>

      <div class="card-body" style="padding: 0;">
        <div v-if="smsLogs.length === 0" class="empty-state">
          <i class="fas fa-inbox"></i>
          <h3>Nenhum registro encontrado</h3>
          <p>Não há mensagens SMS no período selecionado.</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Telefone</th>
                <th>Campanha</th>
                <th>Mensagem</th>
                <th>Status</th>
                <th>Custo</th>
                <th>Enviado em</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sms in smsLogs" :key="sms.id">
                <td><strong>#{{ sms.id }}</strong></td>
                
                <td>
                  <div class="client-info">
                    <div class="client-name">{{ sms.client?.name || 'N/A' }}</div>
                    <div class="client-email">{{ sms.client?.email || '' }}</div>
                  </div>
                </td>
                
                <td>
                  <div class="phone-cell">
                    <i class="fas fa-phone"></i>
                    {{ formatPhone(sms.phone) }}
                  </div>
                </td>
                
                <td>
                  <div class="campaign-info">
                    <div class="campaign-name">{{ sms.campaign?.name || 'N/A' }}</div>
                    <div class="campaign-type">
                      <span class="badge badge-info">{{ getCampaignTypeText(sms.campaign?.type) }}</span>
                    </div>
                  </div>
                </td>
                
                <td>
                  <div class="message-preview">
                    {{ truncateMessage(sms.message, 50) }}
                    <button 
                      v-if="sms.message.length > 50" 
                      class="btn-link-small"
                      @click="showMessageModal(sms)"
                    >
                      Ver mais
                    </button>
                  </div>
                </td>
                
                <td>
                  <span class="badge" :class="getStatusClass(sms.status)">
                    <i :class="getStatusIcon(sms.status)"></i>
                    {{ getStatusText(sms.status) }}
                  </span>
                </td>
                
                <td>
                  <strong class="cost-value">{{ formatCurrency(sms.cost) }}</strong>
                </td>
                
                <td>
                  <div class="date-cell">
                    <div>{{ formatDate(sms.sent_at) }}</div>
                    <div class="time-text">{{ formatTime(sms.sent_at) }}</div>
                  </div>
                </td>
                
                <td>
                  <button 
                    class="btn btn-ghost btn-sm"
                    @click="showDetailsModal(sms)"
                    title="Ver detalhes"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="smsLogs.length > 0" class="card-footer">
        <div class="pagination-info">
          Mostrando {{ pagination.from }} a {{ pagination.to }} de {{ pagination.total }} registros
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

    <!-- Details Modal -->
    <div v-if="showDetails" class="modal-overlay" @click="closeDetailsModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3><i class="fas fa-info-circle"></i> Detalhes do SMS</h3>
          <button class="btn-close" @click="closeDetailsModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="detail-grid" v-if="selectedSms">
            <div class="detail-item">
              <label>ID</label>
              <div>#{{ selectedSms.id }}</div>
            </div>

            <div class="detail-item">
              <label>Status</label>
              <div>
                <span class="badge" :class="getStatusClass(selectedSms.status)">
                  {{ getStatusText(selectedSms.status) }}
                </span>
              </div>
            </div>

            <div class="detail-item full-width">
              <label>Cliente</label>
              <div>{{ selectedSms.client?.name || 'N/A' }}</div>
            </div>

            <div class="detail-item">
              <label>Telefone</label>
              <div>{{ formatPhone(selectedSms.phone) }}</div>
            </div>

            <div class="detail-item">
              <label>Email</label>
              <div>{{ selectedSms.client?.email || 'N/A' }}</div>
            </div>

            <div class="detail-item full-width">
              <label>Campanha</label>
              <div>{{ selectedSms.campaign?.name || 'N/A' }}</div>
            </div>

            <div class="detail-item full-width">
              <label>Mensagem</label>
              <div class="message-full">{{ selectedSms.message }}</div>
            </div>

            <div class="detail-item">
              <label>Custo</label>
              <div><strong>{{ formatCurrency(selectedSms.cost) }}</strong></div>
            </div>

            <div class="detail-item">
              <label>Enviado em</label>
              <div>{{ formatDateTime(selectedSms.sent_at) }}</div>
            </div>

            <div class="detail-item" v-if="selectedSms.delivered_at">
              <label>Entregue em</label>
              <div>{{ formatDateTime(selectedSms.delivered_at) }}</div>
            </div>

            <div class="detail-item full-width" v-if="selectedSms.error_message">
              <label>Mensagem de Erro</label>
              <div class="error-message-text">{{ selectedSms.error_message }}</div>
            </div>

            <div class="detail-item full-width" v-if="selectedSms.api_response">
              <label>Resposta da API</label>
              <pre class="api-response">{{ JSON.stringify(selectedSms.api_response, null, 2) }}</pre>
            </div>
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
  name: 'SmsHistory',
  components: {
    navegacao
  },
  data() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    return {
      isLoading: true,
      smsLogs: [],
      filters: {
        start_date: firstDayOfMonth.toISOString().split('T')[0],
        end_date: today.toISOString().split('T')[0],
        status: '',
        campaign: '',
        phone: ''
      },
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 50,
        total: 0,
        from: 0,
        to: 0,
        prev_page_url: null,
        next_page_url: null
      },
      summary: {
        total: 0,
        sent: 0,
        delivered: 0,
        failed: 0
      },
      showDetails: false,
      selectedSms: null,
      debounceTimer: null
    };
  },
  methods: {
    async fetchHistory(page = 1) {
      this.isLoading = true;
      const token = localStorage.getItem('auth_token');

      if (!token) {
        this.$router.push('/login');
        return;
      }

      try {
        const params = {
          page: page,
          per_page: this.pagination.per_page,
          start_date: this.filters.start_date,
          end_date: this.filters.end_date
        };

        if (this.filters.status) params.status = this.filters.status;
        if (this.filters.campaign) params.campaign = this.filters.campaign;
        if (this.filters.phone) params.phone = this.filters.phone;

        const response = await axios.get('https://api.devsms.online/api/v1/reports/sms-logs', {
          params: params,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        const data = response.data.data;
        
        this.smsLogs = data.data || [];
        
        // Atualizar paginação
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

        // Calcular resumo
        this.calculateSummary();

        console.log('Histórico carregado:', this.smsLogs.length, 'registros');

      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          this.$router.push('/login');
        }
      } finally {
        this.isLoading = false;
      }
    },

    calculateSummary() {
      this.summary = {
        total: this.pagination.total,
        sent: this.smsLogs.filter(s => s.status === 'sent').length,
        delivered: this.smsLogs.filter(s => s.status === 'delivered').length,
        failed: this.smsLogs.filter(s => s.status === 'failed').length
      };
    },

    applyFilters() {
      this.fetchHistory(1);
    },

    debouncedFilter() {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.applyFilters();
      }, 500);
    },

    clearFilters() {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      this.filters = {
        start_date: firstDayOfMonth.toISOString().split('T')[0],
        end_date: today.toISOString().split('T')[0],
        status: '',
        campaign: '',
        phone: ''
      };
      this.fetchHistory(1);
    },

    changePage(page) {
      if (page >= 1 && page <= this.pagination.last_page) {
        this.fetchHistory(page);
      }
    },

    showDetailsModal(sms) {
      this.selectedSms = sms;
      this.showDetails = true;
    },

    closeDetailsModal() {
      this.showDetails = false;
      this.selectedSms = null;
    },

    showMessageModal(sms) {
      alert(sms.message);
    },

    exportData() {
      alert('Funcionalidade de exportação será implementada em breve!');
    },

    // Formatters
    formatPhone(phone) {
      if (!phone) return 'N/A';
      return '+244 ' + phone;
    },

    formatCurrency(value) {
      return new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA'
      }).format(value);
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-AO');
    },

    formatTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' });
    },

    formatDateTime(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleString('pt-AO');
    },

    truncateMessage(message, length) {
      if (!message) return '';
      return message.length > length ? message.substring(0, length) + '...' : message;
    },

    getStatusClass(status) {
      const classes = {
        'sent': 'badge-info',
        'delivered': 'badge-success',
        'failed': 'badge-danger'
      };
      return classes[status] || 'badge-secondary';
    },

    getStatusIcon(status) {
      const icons = {
        'sent': 'fas fa-paper-plane',
        'delivered': 'fas fa-check-double',
        'failed': 'fas fa-times-circle'
      };
      return icons[status] || 'fas fa-circle';
    },

    getStatusText(status) {
      const texts = {
        'sent': 'Enviado',
        'delivered': 'Entregue',
        'failed': 'Falhou'
      };
      return texts[status] || status;
    },

    getCampaignTypeText(type) {
      const types = {
        'instant': 'Instantânea',
        'scheduled': 'Agendada'
      };
      return types[type] || type;
    }
  },
  mounted() {
    this.fetchHistory();
  }
};
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-description {
  color: var(--gray-600);
  font-size: 1rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group label {
  display: block;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-control {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 2px solid var(--gray-300);
  border-radius: 8px;
  font-size: 0.938rem;
  transition: all 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.form-control-sm {
  padding: 0.5rem 0.75rem;
  border: 2px solid var(--gray-300);
  border-radius: 8px;
  font-size: 0.875rem;
}

.stat-card-small {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-icon-small {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-value-small {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--gray-800);
}

.stat-label-small {
  font-size: 0.875rem;
  color: var(--gray-600);
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

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--gray-500);
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
}

.client-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.client-name {
  font-weight: 600;
  color: var(--gray-800);
}

.client-email {
  font-size: 0.813rem;
  color: var(--gray-600);
}

.phone-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-700);
}

.campaign-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.campaign-name {
  font-weight: 600;
  color: var(--gray-800);
}

.message-preview {
  max-width: 300px;
  color: var(--gray-700);
}

.btn-link-small {
  background: none;
  border: none;
  color: var(--primary);
  cursor: pointer;
  font-size: 0.813rem;
  text-decoration: underline;
  padding: 0;
  margin-left: 0.5rem;
}

.btn-link-small:hover {
  color: var(--primary-dark);
}

.cost-value {
  color: var(--warning);
  font-size: 1rem;
}

.date-cell {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.time-text {
  font-size: 0.813rem;
  color: var(--gray-600);
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--gray-200);
}

.pagination-info {
  color: var(--gray-600);
  font-size: 0.875rem;
}

.pagination {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pagination-current {
  color: var(--gray-700);
  font-weight: 600;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-800);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-close {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  color: var(--gray-600);
  font-size: 1.25rem;
}

.btn-close:hover {
  background: var(--gray-100);
  color: var(--gray-800);
}

.modal-body {
  padding: 1.5rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-weight: 600;
  color: var(--gray-600);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-item > div {
  color: var(--gray-800);
  font-size: 1rem;
}

.message-full {
  background: var(--gray-50);
  padding: 1rem;
  border-radius: 8px;
  line-height: 1.6;
}

.error-message-text {
  background: var(--danger-light);
  color: var(--danger);
  padding: 1rem;
  border-radius: 8px;
  font-weight: 600;
}

.api-response {
  background: var(--gray-900);
  color: var(--gray-100);
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.813rem;
  overflow-x: auto;
  margin: 0;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .card-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .pagination {
    width: 100%;
    justify-content: space-between;
  }
}
</style>