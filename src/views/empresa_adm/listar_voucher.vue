<template>

    <navegacao/>
  <div class="lista-vouchers-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <i class="fas fa-ticket-alt"></i>
            Vouchers de Crédito
          </h1>
          <p class="page-subtitle">Gerencie todos os vouchers do sistema</p>
        </div>
        <router-link to="/criar_voucher" class="btn-create">
          <i class="fas fa-plus"></i>
          Novo Voucher
        </router-link>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-section">
      <div class="filter-group">
        <label>Status</label>
        <select v-model="filters.status" @change="applyFilters">
          <option value="">Todos</option>
          <option value="available">Disponível</option>
          <option value="redeemed">Resgatado</option>
          <option value="expired">Expirado</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Buscar por Código</label>
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            type="text"
            v-model="filters.search"
            @input="applyFilters"
            placeholder="Digite o código..."
          />
        </div>
      </div>

      <div class="filter-stats">
        <div class="stat-item">
          <span class="stat-label">Total:</span>
          <span class="stat-value">{{ stats.total }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Disponíveis:</span>
          <span class="stat-value available">{{ stats.available }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Resgatados:</span>
          <span class="stat-value redeemed">{{ stats.redeemed }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Expirados:</span>
          <span class="stat-value expired">{{ stats.expired }}</span>
        </div>
      </div>
    </div>

    <!-- Status Message -->
    <div v-if="statusMessage" :class="['status-alert', statusType]">
      <i :class="statusType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
      <span>{{ statusMessage }}</span>
      <button @click="statusMessage = ''" class="close-alert">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-container">
      <i class="fas fa-spinner fa-spin"></i>
      <span>Carregando vouchers...</span>
    </div>

    <!-- Tabela de Vouchers -->
    <div v-else class="vouchers-table-container">
      <table class="vouchers-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Valor</th>
            <th>Descrição</th>
            <th>Status</th>
            <th>Empresa</th>
            <th>Resgatado</th>
            <th>Expira em</th>
            <th>Criado em</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="voucher in filteredVouchers"
            :key="voucher.id"
            :class="['voucher-row', getStatusClass(voucher)]"
          >
            <!-- Código -->
            <td>
              <div class="voucher-code">
                <i class="fas fa-ticket-alt"></i>
                <span class="code-text">{{ voucher.code }}</span>
                <button
                  @click="copyCode(voucher.code)"
                  class="btn-copy"
                  title="Copiar código"
                >
                  <i class="fas fa-copy"></i>
                </button>
              </div>
            </td>

            <!-- Valor -->
            <td>
              <div class="voucher-amount">
                <i class="fas fa-coins"></i>
                <span>{{ formatAmount(voucher.amount) }}</span>
              </div>
            </td>

            <!-- Descrição -->
            <td>
              <div class="voucher-description">
                {{ voucher.description || 'Sem descrição' }}
              </div>
            </td>

            <!-- Status -->
            <td>
              <span :class="['status-badge', getStatusClass(voucher)]">
                {{ getStatusText(voucher) }}
              </span>
            </td>

            <!-- Empresa Atribuída -->
            <td>
              <div class="company-info">
                <i v-if="voucher.assigned_company_id" class="fas fa-building"></i>
                <span>{{ voucher.assigned_company_id || 'Geral' }}</span>
              </div>
            </td>

            <!-- Resgatado -->
            <td>
              <div v-if="voucher.redeemed" class="redeemed-info">
                <div class="redeemed-by">
                  <i class="fas fa-user"></i>
                  <span>Empresa ID: {{ voucher.redeemed_by_company_id }}</span>
                </div>
                <div class="redeemed-date">
                  <i class="fas fa-clock"></i>
                  <span>{{ formatDate(voucher.redeemed_at) }}</span>
                </div>
              </div>
              <span v-else class="not-redeemed">
                <i class="fas fa-minus-circle"></i>
                Não resgatado
              </span>
            </td>

            <!-- Expira em -->
            <td>
              <div class="expiry-info">
                <i :class="isExpired(voucher) ? 'fas fa-exclamation-triangle' : 'fas fa-calendar-alt'"></i>
                <span :class="{ 'expired-text': isExpired(voucher) }">
                  {{ formatDate(voucher.expires_at) }}
                </span>
              </div>
            </td>

            <!-- Criado em -->
            <td>
              <div class="created-info">
                <i class="fas fa-calendar-plus"></i>
                <span>{{ formatDate(voucher.created_at) }}</span>
              </div>
            </td>

            <!-- Ações -->
            <td>
              <div class="action-buttons">
                <button
                  @click="viewDetails(voucher)"
                  class="btn-action btn-view"
                  title="Ver detalhes"
                >
                  <i class="fas fa-eye"></i>
                </button>
                <button
                  v-if="!voucher.redeemed && !isExpired(voucher)"
                  @click="deleteVoucher(voucher.id)"
                  class="btn-action btn-delete"
                  title="Excluir voucher"
                  :disabled="deletingId === voucher.id"
                >
                  <i v-if="deletingId !== voucher.id" class="fas fa-trash"></i>
                  <i v-else class="fas fa-spinner fa-spin"></i>
                </button>
              </div>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-if="filteredVouchers.length === 0">
            <td colspan="9" class="empty-state">
              <i class="fas fa-ticket-alt"></i>
              <p>Nenhum voucher encontrado</p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal de Detalhes -->
    <div v-if="showDetailsModal" class="modal-overlay" @click="closeDetailsModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>
            <i class="fas fa-ticket-alt"></i>
            Detalhes do Voucher
          </h2>
          <button @click="closeDetailsModal" class="modal-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body" v-if="selectedVoucher">
          <!-- Código do Voucher -->
          <div class="detail-section highlight-section">
            <div class="voucher-code-large">
              <span class="code-label">Código do Voucher</span>
              <div class="code-display">
                <span class="code-value">{{ selectedVoucher.code }}</span>
                <button @click="copyCode(selectedVoucher.code)" class="btn-copy-large">
                  <i class="fas fa-copy"></i>
                  Copiar
                </button>
              </div>
            </div>
          </div>

          <!-- Informações Principais -->
          <div class="detail-section">
            <h3 class="section-title">
              <i class="fas fa-info-circle"></i>
              Informações Principais
            </h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Valor</span>
                <span class="detail-value amount">{{ formatAmount(selectedVoucher.amount) }} créditos</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Status</span>
                <span :class="['detail-value', 'status-badge', getStatusClass(selectedVoucher)]">
                  {{ getStatusText(selectedVoucher) }}
                </span>
              </div>
              <div class="detail-item full-width">
                <span class="detail-label">Descrição</span>
                <span class="detail-value">{{ selectedVoucher.description || 'Sem descrição' }}</span>
              </div>
            </div>
          </div>

          <!-- Atribuição -->
          <div class="detail-section">
            <h3 class="section-title">
              <i class="fas fa-building"></i>
              Atribuição
            </h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Criado por</span>
                <span class="detail-value">Admin ID: {{ selectedVoucher.created_by }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Empresa Atribuída</span>
                <span class="detail-value">
                  {{ selectedVoucher.assigned_company_id ? `Empresa ID: ${selectedVoucher.assigned_company_id}` : 'Voucher Geral' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Resgate -->
          <div class="detail-section" v-if="selectedVoucher.redeemed">
            <h3 class="section-title">
              <i class="fas fa-check-circle"></i>
              Informações de Resgate
            </h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Resgatado por (Empresa)</span>
                <span class="detail-value">ID: {{ selectedVoucher.redeemed_by_company_id }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Resgatado por (Usuário)</span>
                <span class="detail-value">ID: {{ selectedVoucher.redeemed_by_user_id }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Data do Resgate</span>
                <span class="detail-value">{{ formatDateTime(selectedVoucher.redeemed_at) }}</span>
              </div>
            </div>
          </div>

          <!-- Datas -->
          <div class="detail-section">
            <h3 class="section-title">
              <i class="fas fa-calendar"></i>
              Datas Importantes
            </h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Criado em</span>
                <span class="detail-value">{{ formatDateTime(selectedVoucher.created_at) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Última Atualização</span>
                <span class="detail-value">{{ formatDateTime(selectedVoucher.updated_at) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Expira em</span>
                <span :class="['detail-value', { 'expired-text': isExpired(selectedVoucher) }]">
                  {{ formatDateTime(selectedVoucher.expires_at) }}
                  <span v-if="isExpired(selectedVoucher)" class="expired-badge">
                    <i class="fas fa-exclamation-triangle"></i>
                    Expirado
                  </span>
                </span>
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

import navegacao from '../../components/navegacao.vue';
export default {
  name: 'ListaVouchers',

  components:{
    navegacao
  },
  data() {
    return {
      vouchers: [],
      filteredVouchers: [],
      isLoading: true,
      statusMessage: '',
      statusType: '',
      deletingId: null,
      showDetailsModal: false,
      selectedVoucher: null,
      filters: {
        status: '',
        search: ''
      },
      stats: {
        total: 0,
        available: 0,
        redeemed: 0,
        expired: 0
      }
    };
  },
  methods: {
    async fetchVouchers() {
      this.isLoading = true;
      const token = localStorage.getItem('auth_token');

      try {
        const response = await axios.get(
          'https://api.devsms.online/api/v1/vouchers',
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        this.vouchers = response.data.data || response.data.vouchers || response.data || [];
        this.filteredVouchers = this.vouchers;
        this.calculateStats();
        
        console.log('✅ Vouchers carregados:', this.vouchers);

      } catch (error) {
        console.error('❌ Erro ao buscar vouchers:', error);
        this.statusMessage = 'Erro ao carregar vouchers';
        this.statusType = 'error';
      } finally {
        this.isLoading = false;
      }
    },

    calculateStats() {
      this.stats.total = this.vouchers.length;
      this.stats.redeemed = this.vouchers.filter(v => v.redeemed).length;
      this.stats.expired = this.vouchers.filter(v => this.isExpired(v) && !v.redeemed).length;
      this.stats.available = this.vouchers.filter(v => !v.redeemed && !this.isExpired(v)).length;
    },

    applyFilters() {
      let filtered = [...this.vouchers];

      // Filtro de status
      if (this.filters.status) {
        filtered = filtered.filter(voucher => {
          if (this.filters.status === 'available') {
            return !voucher.redeemed && !this.isExpired(voucher);
          } else if (this.filters.status === 'redeemed') {
            return voucher.redeemed;
          } else if (this.filters.status === 'expired') {
            return this.isExpired(voucher) && !voucher.redeemed;
          }
          return true;
        });
      }

      // Filtro de busca
      if (this.filters.search) {
        const searchLower = this.filters.search.toLowerCase();
        filtered = filtered.filter(voucher =>
          voucher.code.toLowerCase().includes(searchLower)
        );
      }

      this.filteredVouchers = filtered;
    },

    isExpired(voucher) {
      if (!voucher.expires_at) return false;
      return new Date(voucher.expires_at) < new Date();
    },

    getStatusClass(voucher) {
      if (voucher.redeemed) return 'redeemed';
      if (this.isExpired(voucher)) return 'expired';
      return 'available';
    },

    getStatusText(voucher) {
      if (voucher.redeemed) return 'Resgatado';
      if (this.isExpired(voucher)) return 'Expirado';
      return 'Disponível';
    },

    formatAmount(amount) {
      return Number(amount).toLocaleString('pt-AO');
    },

    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-AO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    },

    formatDateTime(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleString('pt-AO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    async copyCode(code) {
      try {
        await navigator.clipboard.writeText(code);
        this.statusMessage = 'Código copiado para a área de transferência!';
        this.statusType = 'success';
        setTimeout(() => {
          this.statusMessage = '';
        }, 2000);
      } catch (error) {
        console.error('Erro ao copiar código:', error);
      }
    },

    viewDetails(voucher) {
      this.selectedVoucher = voucher;
      this.showDetailsModal = true;
    },

    closeDetailsModal() {
      this.showDetailsModal = false;
      this.selectedVoucher = null;
    },

    async deleteVoucher(voucherId) {
      if (!confirm('Deseja realmente excluir este voucher? Esta ação não pode ser desfeita.')) {
        return;
      }

      this.deletingId = voucherId;
      const token = localStorage.getItem('auth_token');

      try {
        await axios.delete(
          `https://api.devsms.online/api/v1/vouchers/${voucherId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        this.statusMessage = 'Voucher excluído com sucesso!';
        this.statusType = 'success';

        // Remover da lista
        this.vouchers = this.vouchers.filter(v => v.id !== voucherId);
        this.applyFilters();
        this.calculateStats();

        setTimeout(() => {
          this.statusMessage = '';
        }, 3000);

      } catch (error) {
        console.error('❌ Erro ao excluir voucher:', error);
        this.statusMessage = error.response?.data?.message || 'Erro ao excluir voucher';
        this.statusType = 'error';
      } finally {
        this.deletingId = null;
      }
    }
  },
  mounted() {
    this.fetchVouchers();
  }
};
</script>

<style scoped>
.lista-vouchers-page {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-title i {
  color: #8B5CF6;
}

.page-subtitle {
  color: #6B7280;
  font-size: 1rem;
  margin: 0;
}

.btn-create {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: white;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
  transition: all 0.2s;
}

.btn-create:hover {
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
  transform: translateY(-1px);
}

.filters-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 1.5rem;
  align-items: flex-end;
  flex-wrap: wrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  font-weight: 500;
  color: #374151;
  font-size: 0.875rem;
}

.filter-group select {
  padding: 0.625rem 1rem;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 0.938rem;
  transition: all 0.2s;
}

.filter-group select:focus {
  outline: none;
  border-color: #8B5CF6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box i {
  position: absolute;
  left: 1rem;
  color: #9CA3AF;
}

.search-box input {
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.5rem;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 0.938rem;
  transition: all 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #8B5CF6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.filter-stats {
  display: flex;
  gap: 1.5rem;
  margin-left: auto;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: #6B7280;
  font-weight: 500;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1F2937;
}

.stat-value.available {
  color: #10B981;
}

.stat-value.redeemed {
  color: #3B82F6;
}

.stat-value.expired {
  color: #EF4444;
}

.status-alert {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  font-weight: 500;
}

.status-alert.success {
  background: #D1FAE5;
  color: #065F46;
  border: 1px solid #A7F3D0;
}

.status-alert.error {
  background: #FEE2E2;
  color: #991B1B;
  border: 1px solid #FECACA;
}

.close-alert {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.close-alert:hover {
  opacity: 1;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1rem;
  color: #6B7280;
}

.loading-container i {
  font-size: 3rem;
}

.vouchers-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.vouchers-table {
  width: 100%;
  border-collapse: collapse;
}

.vouchers-table thead {
  background: linear-gradient(135deg, #F9FAFB, #F3F4F6);
}

.vouchers-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
  border-bottom: 2px solid #E5E7EB;
}

.vouchers-table td {
  padding: 1rem;
  border-bottom: 1px solid #F3F4F6;
}

.voucher-row {
  transition: background 0.2s;
}

.voucher-row:hover {
  background: #F9FAFB;
}

.voucher-row.redeemed {
  background: rgba(59, 130, 246, 0.05);
}

.voucher-row.expired {
  background: rgba(239, 68, 68, 0.05);
}

.voucher-code {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.voucher-code i {
  color: #8B5CF6;
}

.code-text {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #1F2937;
}

.btn-copy {
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
}

.btn-copy:hover {
  color: #8B5CF6;
}

.voucher-amount {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #F59E0B;
}

.voucher-description {
  color: #6B7280;
  font-size: 0.875rem;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  display: inline-flex;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.813rem;
  font-weight: 600;
}

.status-badge.available {
  background: #D1FAE5;
  color: #065F46;
}

.status-badge.redeemed {
  background: #DBEAFE;
  color: #1E40AF;
}

.status-badge.expired {
  background: #FEE2E2;
  color: #991B1B;
}

.company-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4B5563;
  font-size: 0.875rem;
}

.company-info i {
  color: #9CA3AF;
}

.redeemed-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.redeemed-by,
.redeemed-date {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.813rem;
  color: #4B5563;
}

.redeemed-by i,
.redeemed-date i {
  color: #9CA3AF;
  font-size: 0.75rem;
}

.not-redeemed {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #9CA3AF;
  font-size: 0.875rem;
}

.expiry-info,
.created-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #4B5563;
}

.expiry-info i,
.created-info i {
  color: #9CA3AF;
}

.expired-text {
  color: #EF4444 !important;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}


.summary-item {
display: flex;
align-items: center;
gap: 0.5rem;
font-weight: 500;
color: #374151;
}
.summary-item i {
color: #8B5CF6;
font-size: 1.25rem;
}
.generated-codes {
background: #F9FAFB;
border-radius: 12px;
padding: 1.5rem;
margin-bottom: 1.5rem;
}
.codes-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 1rem;
}
.codes-header h3 {
font-size: 1rem;
font-weight: 600;
color: #374151;
margin: 0;
}
.btn-copy-all {
display: inline-flex;
align-items: center;
gap: 0.5rem;
padding: 0.5rem 1rem;
background: #8B5CF6;
color: white;
border: none;
border-radius: 6px;
font-size: 0.875rem;
font-weight: 500;
cursor: pointer;
transition: all 0.2s;
}
.btn-copy-all:hover {
background: #7C3AED;
}
.codes-list {
display: flex;
flex-direction: column;
gap: 0.5rem;
max-height: 300px;
overflow-y: auto;
}
.code-item {
display: flex;
align-items: center;
gap: 1rem;
padding: 0.75rem 1rem;
background: white;
border-radius: 8px;
border: 1px solid #E5E7EB;
}
.code-number {
color: #9CA3AF;
font-weight: 600;
font-size: 0.875rem;
min-width: 30px;
}
.code-value {
flex: 1;
font-family: 'Courier New', monospace;
font-weight: 600;
color: #1F2937;
font-size: 1rem;
}
.btn-copy-single {
background: none;
border: none;
color: #9CA3AF;
cursor: pointer;
padding: 0.25rem;
transition: color 0.2s;
}
.btn-copy-single:hover {
color: #8B5CF6;
}
.success-actions {
display: flex;
gap: 1rem;
justify-content: center;
}
.btn-create-another,
.btn-go-list {
display: inline-flex;
align-items: center;
gap: 0.5rem;
padding: 0.75rem 1.5rem;
border-radius: 8px;
font-weight: 600;
cursor: pointer;
transition: all 0.2s;
border: none;
}
.btn-create-another {
background: linear-gradient(135deg, #8B5CF6, #7C3AED);
color: white;
}
.btn-create-another:hover {
box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
}
.btn-go-list {
background: white;
color: #4B5563;
border: 1px solid #D1D5DB;
}
.btn-go-list:hover {
background: #F9FAFB;
}
@media (max-width: 768px) {
.criar-voucher-page {
padding: 1rem;
}
.header-content {
flex-direction: column;
align-items: flex-start;
}
.btn-back {
width: 100%;
justify-content: center;
}
.form-grid {
grid-template-columns: 1fr;
}
.form-actions,
.success-actions {
flex-direction: column;
}
.btn-cancel,
.btn-submit,
.btn-create-another,
.btn-go-list {
width: 100%;
justify-content: center;
}
}
</style>