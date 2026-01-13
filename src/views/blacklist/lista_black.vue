<template>
  <navegacao/>

  <div class="fade-in">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">
          <i class="fas fa-ban"></i>
          Blacklist
        </h1>
        <p class="page-subtitle">Gerencie números bloqueados que não devem receber SMS</p>
      </div>
      <router-link to="/criar_black" class="btn btn-primary">
        <i class="fas fa-plus"></i>
        Add à Lista Negra
      </router-link>
    </div>

    <!-- Filtros e Busca -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="filters-row">
          <div class="search-box">
            <i class="fas fa-search"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              placeholder="Buscar por telefone ou motivo..."
              @input="handleSearch"
              class="search-input"
            />
          </div>

          <div class="filter-group">
            <label>Motivo:</label>
            <select v-model="filterReason" @change="applyFilters" class="filter-select">
              <option value="">Todos</option>
              <option value="client_request">Solicitação do Cliente</option>
              <option value="spam">Spam</option>
              <option value="complaint">Reclamação</option>
              <option value="invalid">Número Inválido</option>
              <option value="other">Outro</option>
            </select>
          </div>

          <button @click="clearFilters" class="btn btn-outline">
            <i class="fas fa-redo"></i>
            Limpar Filtros
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Carregando blacklist...</p>
    </div>

    <!-- Lista de Blacklist -->
    <div v-else>
      <!-- Stats -->
      <div class="stats-grid mb-4">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #EF4444, #DC2626);">
            <i class="fas fa-ban"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ pagination.total }}</div>
            <div class="stat-label">Total Bloqueados</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ getCountByReason('spam') }}</div>
            <div class="stat-label">Marcados como Spam</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #8B5CF6, #7C3AED);">
            <i class="fas fa-user-times"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ getCountByReason('client_request') }}</div>
            <div class="stat-label">Solicitação Cliente</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #10B981, #059669);">
            <i class="fas fa-phone-slash"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ getCountByReason('invalid') }}</div>
            <div class="stat-label">Números Inválidos</div>
          </div>
        </div>
      </div>

      <!-- Tabela -->
      <div class="card">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Telefone</th>
                  <th>Motivo</th>
                  <th>Observações</th>
                  <th>Data de Bloqueio</th>
                  <th class="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="blacklist.length === 0">
                  <td colspan="5" class="text-center py-5">
                    <div class="empty-state">
                      <i class="fas fa-inbox"></i>
                      <p>Nenhum número na blacklist</p>
                      <router-link to="/criar_blacklist" class="btn btn-primary">
                        Adicionar primeiro número
                      </router-link>
                    </div>
                  </td>
                </tr>
                <tr v-for="item in blacklist" :key="item.id">
                  <td>
                    <div class="phone-cell">
                      <i class="fas fa-phone"></i>
                      <strong>{{ formatPhone(item.phone) }}</strong>
                    </div>
                  </td>
                  <td>
                    <span :class="['badge', getReasonClass(item.reason)]">
                      {{ getReasonLabel(item.reason) }}
                    </span>
                  </td>
                  <td>
                    <div class="notes-cell">
                      {{ item.notes || '-' }}
                    </div>
                  </td>
                  <td>
                    <div class="date-cell">
                      <i class="far fa-calendar"></i>
                      {{ formatDate(item.created_at) }}
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="action-buttons">
                      <router-link 
                        :to="`/editar_blacklist/${item.id}`"
                        class="btn-icon btn-icon-primary"
                        title="Editar"
                      >
                        <i class="fas fa-edit"></i>
                      </router-link>
                      <button 
                        @click="confirmDelete(item)" 
                        class="btn-icon btn-icon-danger"
                        title="Remover da Blacklist"
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

      <!-- Paginação -->
      <div v-if="pagination.last_page > 1" class="pagination-container">
        <button 
          @click="goToPage(pagination.current_page - 1)" 
          :disabled="pagination.current_page === 1"
          class="btn btn-outline"
        >
          <i class="fas fa-chevron-left"></i>
          Anterior
        </button>

        <div class="pagination-info">
          Página {{ pagination.current_page }} de {{ pagination.last_page }}
          <span class="text-muted">({{ pagination.total }} registros)</span>
        </div>

        <button 
          @click="goToPage(pagination.current_page + 1)" 
          :disabled="pagination.current_page === pagination.last_page"
          class="btn btn-outline"
        >
          Próxima
          <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import navegacao from '../../components/navegacao.vue';

export default {
  name: 'Blacklist',
  components: {
    navegacao
  },
  data() {
    return {
      isLoading: true,
      blacklist: [],
      allBlacklist: [], // Para estatísticas
      pagination: {
        current_page: 1,
        last_page: 1,
        total: 0
      },
      searchQuery: '',
      filterReason: ''
    };
  },
  methods: {
    async fetchBlacklist(page = 1) {
      this.isLoading = true;
      const token = localStorage.getItem('auth_token');

      try {
        const params = new URLSearchParams({
          page: page
        });

        if (this.searchQuery) params.append('search', this.searchQuery);
        if (this.filterReason) params.append('reason', this.filterReason);

        const response = await axios.get(
          `https://api.devsms.online/api/v1/blacklist?${params}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        const data = response.data.data;
        this.blacklist = data.data;
        this.pagination = {
          current_page: data.current_page,
          last_page: data.last_page,
          total: data.total
        };

        // Buscar todos para estatísticas
        await this.fetchAllForStats();

      } catch (error) {
        console.error('Erro ao buscar blacklist:', error);
        this.handleError(error);
      } finally {
        this.isLoading = false;
      }
    },

    async fetchAllForStats() {
      const token = localStorage.getItem('auth_token');
      try {
        const response = await axios.get(
          'https://api.devsms.online/api/v1/blacklist?per_page=1000',
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );
        this.allBlacklist = response.data.data.data;
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      }
    },

    async confirmDelete(item) {
      const confirmed = confirm(
        `⚠️ Tem certeza que deseja remover o número ${this.formatPhone(item.phone)} da blacklist?\n\nEste número voltará a poder receber mensagens SMS.`
      );

      if (!confirmed) return;

      await this.deleteItem(item);
    },

    async deleteItem(item) {
      const token = localStorage.getItem('auth_token');

      try {
        await axios.delete(
          `https://api.devsms.online/api/v1/blacklist/${item.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        alert('✅ Número removido da blacklist com sucesso!');
        await this.fetchBlacklist(this.pagination.current_page);
        
      } catch (error) {
        console.error('Erro ao deletar:', error);
        if (error.response?.data?.message) {
          alert('Erro: ' + error.response.data.message);
        } else {
          alert('Erro ao remover da blacklist. Tente novamente.');
        }
      }
    },

    handleSearch() {
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.fetchBlacklist(1);
      }, 500);
    },

    applyFilters() {
      this.fetchBlacklist(1);
    },

    clearFilters() {
      this.searchQuery = '';
      this.filterReason = '';
      this.fetchBlacklist(1);
    },

    goToPage(page) {
      if (page >= 1 && page <= this.pagination.last_page) {
        this.fetchBlacklist(page);
      }
    },

    getCountByReason(reason) {
      return this.allBlacklist.filter(item => item.reason === reason).length;
    },

    getReasonLabel(reason) {
      const labels = {
        'client_request': 'Solicitação Cliente',
        'spam': 'Spam',
        'complaint': 'Reclamação',
        'invalid': 'Número Inválido',
        'other': 'Outro'
      };
      return labels[reason] || reason;
    },

    getReasonClass(reason) {
      const classes = {
        'client_request': 'badge-info',
        'spam': 'badge-danger',
        'complaint': 'badge-warning',
        'invalid': 'badge-secondary',
        'other': 'badge-primary'
      };
      return classes[reason] || 'badge-primary';
    },

    formatPhone(phone) {
      if (!phone) return '-';
      return phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
    },

    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-AO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    handleError(error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('auth_token');
        this.$router.push('/login');
      }
    }
  },
  mounted() {
    this.fetchBlacklist();
  }
};
</script>

<style scoped>
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

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-800);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-subtitle {
  color: var(--gray-600);
  font-size: 0.9375rem;
  margin: 0.5rem 0 0 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-800);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin-top: 0.25rem;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.card-body {
  padding: 1.5rem;
}

.mb-4 {
  margin-bottom: 2rem;
}

.filters-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  font-size: 0.9375rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-700);
  white-space: nowrap;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  font-size: 0.9375rem;
  min-width: 200px;
  background: white;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary);
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
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

.btn-outline {
  background: white;
  color: var(--gray-700);
  border: 2px solid var(--gray-300);
}

.btn-outline:hover {
  background: var(--gray-50);
  border-color: var(--gray-400);
}

.btn-outline:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
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

.table-responsive {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table thead {
  background: var(--gray-50);
  border-bottom: 2px solid var(--gray-200);
}

.table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--gray-700);
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.table tbody tr {
  border-bottom: 1px solid var(--gray-200);
  transition: all 0.2s;
}

.table tbody tr:hover {
  background: var(--gray-50);
}

.table td {
  padding: 1rem;
  vertical-align: middle;
}

.text-center {
  text-align: center;
}

.py-5 {
  padding: 3rem 0;
}

.phone-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-800);
}

.phone-cell i {
  color: var(--primary);
}

.notes-cell {
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--gray-600);
  font-size: 0.875rem;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-600);
  font-size: 0.875rem;
}

.date-cell i {
  color: var(--gray-400);
}

.badge {
  display: inline-block;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-info {
  background: #DBEAFE;
  color: #1E40AF;
}

.badge-danger {
  background: #FEE2E2;
  color: #991B1B;
}

.badge-warning {
  background: #FEF3C7;
  color: #92400E;
}

.badge-secondary {
  background: #F3F4F6;
  color: #374151;
}

.badge-primary {
  background: #EDE9FE;
  color: #5B21B6;
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
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-icon-primary {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary);
}

.btn-icon-primary:hover {
  background: var(--primary);
  color: white;
  transform: translateY(-2px);
}

.btn-icon-danger {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
}

.btn-icon-danger:hover {
  background: var(--danger);
  color: white;
  transform: translateY(-2px);
}

.empty-state {
  padding: 3rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-state i {
  font-size: 4rem;
  color: var(--gray-300);
  margin-bottom: 1rem;
}

.empty-state p {
  color: var(--gray-500);
  font-size: 1.125rem;
  margin-bottom: 1.5rem;
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.pagination-info {
  font-size: 0.9375rem;
  color: var(--gray-700);
}

.text-muted {
  color: var(--gray-500);
  font-size: 0.875rem;
  margin-left: 0.5rem;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: 100%;
  }

  .filter-group {
    width: 100%;
  }

  .filter-select {
    width: 100%;
  }

  .pagination-container {
    flex-direction: column;
    gap: 1rem;
  }

  .table {
    font-size: 0.875rem;
  }

  .table th,
  .table td {
    padding: 0.75rem 0.5rem;
  }
}
</style>