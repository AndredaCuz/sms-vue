<template>
  <navegacao/>
  
  <div class="contacts-page fade-in">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">
          <i class="fas fa-address-book"></i> Contatos
        </h1>
        <p class="page-description">Gerencie seus contatos e clientes</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-outline" @click="importExcel">
          <i class="fas fa-file-import"></i>
          Importar Excel
        </button>
        <router-link :to="{ name: 'Criarcontato' }" class="btn btn-accent">
          <i class="fas fa-plus"></i>
          Novo Contato
        </router-link>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-4 mb-4">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="stat-icon" :style="{ background: stat.color }">
          <i :class="stat.icon"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>

    <!-- Filtros e Pesquisa -->
    <div class="card mb-3">
      <div class="card-body">
        <div class="grid grid-4">
          <div class="form-group mb-0">
            <input 
              type="text" 
              v-model="filtros.busca" 
              class="form-control" 
              placeholder="Buscar por nome, telefone ou email..."
              @input="filtrarContatos"
            >
          </div>
          <div class="form-group mb-0">
            <select v-model="filtros.categoria" class="form-control form-select" @change="filtrarContatos">
              <option value="">Todas as Categorias</option>
              <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="form-group mb-0">
            <select v-model="filtros.status" class="form-control form-select" @change="filtrarContatos">
              <option value="">Todos os Status</option>
              <option value="active">Ativos</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
          <div class="filter-buttons">
            <button type="button" class="btn btn-primary" style="flex:1" @click="fetchClients">
              <i class="fas fa-sync"></i> Atualizar
            </button>
            <button type="button" class="btn btn-ghost" @click="resetFiltros">
              <i class="fas fa-redo"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Carregando contatos...</p>
    </div>

    <!-- Lista de Contatos -->
    <div v-else class="card">
      <div class="card-header">
        <h3 class="card-title">
          <i class="fas fa-list"></i> Lista de Contatos
        </h3>
        <div class="card-header-actions">
          <span class="contacts-count">
            <i class="fas fa-users"></i> {{ pagination.total }} contatos
          </span>
          <button class="btn btn-ghost btn-sm" @click="exportarContatos">
            <i class="fas fa-download"></i> Exportar
          </button>
        </div>
      </div>

      <div class="card-body">
        <div v-if="contatosFiltrados.length === 0" class="empty-state">
          <i class="fas fa-inbox"></i>
          <h3>Nenhum contato encontrado</h3>
          <p>Tente ajustar os filtros ou adicione um novo contato</p>
          <router-link :to="{ name: 'Criarcontato' }" class="btn btn-primary">
            <i class="fas fa-plus"></i> Adicionar Contato
          </router-link>
        </div>

        <div v-else class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" v-model="selectAll" @change="toggleSelectAll">
                </th>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Email</th>
                <th>Categoria</th>
                <th>Dívida</th>
                <th>Status</th>
                <th>SMS Recebidos</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="contato in contatosFiltrados" :key="contato.id">
                <td>
                  <input type="checkbox" v-model="contatosSelecionados" :value="contato.id">
                </td>
                <td>
                  <div class="contact-name">
                    <div class="avatar" :style="{ background: contato.category?.color || '#2563eb' }">
                      {{ getInitials(contato.name) }}
                    </div>
                    <div class="contact-info">
                      <div class="name">{{ contato.name }}</div>
                      <div v-if="contato.custom_fields?.endereco" class="location">
                        <i class="fas fa-map-marker-alt"></i> {{ contato.custom_fields.endereco }}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <a :href="`tel:${contato.phone}`" class="phone-link">
                    <i class="fas fa-phone"></i> {{ formatPhone(contato.phone) }}
                  </a>
                  <span v-if="contato.has_valid_phone" class="verified-badge" title="Telefone Verificado">
                    <i class="fas fa-check-circle"></i>
                  </span>
                </td>
                <td>
                  <a v-if="contato.email" :href="`mailto:${contato.email}`" class="email-link">
                    <i class="fas fa-envelope"></i> {{ contato.email }}
                  </a>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <span 
                    v-if="contato.category" 
                    class="badge-category" 
                    :style="{ 
                      background: contato.category.color + '20',
                      color: contato.category.color,
                      borderColor: contato.category.color
                    }"
                  >
                    {{ contato.category.name }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <span v-if="parseFloat(contato.debt_amount) > 0" class="debt-amount">
                    {{ formatCurrency(contato.debt_amount) }}
                  </span>
                  <span v-else class="text-muted">-</span>
                </td>
                <td>
                  <span :class="['badge', contato.status === 'active' ? 'badge-success' : 'badge-warning']">
                    <i class="fas fa-circle status-dot"></i>
                    {{ contato.status === 'active' ? 'Ativo' : 'Inativo' }}
                  </span>
                  <span v-if="contato.opt_out" class="opt-out-badge" title="Cancelou inscrição">
                    <i class="fas fa-ban"></i>
                  </span>
                </td>
                <td>
                  <div class="sms-count">
                    <i class="fas fa-sms"></i> {{ contato.total_sms_received }}
                  </div>
                  <div v-if="contato.last_sms_sent_at" class="last-sms">
                    Último: {{ formatDate(contato.last_sms_sent_at) }}
                  </div>
                </td>
                <td class="actions">
                  <button class="btn btn-ghost btn-sm" @click="verDetalhes(contato)" title="Ver Detalhes">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button class="btn btn-ghost btn-sm" @click="editarContato(contato.id)" title="Editar">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-ghost btn-sm" @click="enviarSMS(contato)" title="Enviar SMS">
                    <i class="fas fa-paper-plane"></i>
                  </button>
                  <button class="btn btn-ghost btn-sm" @click="excluirContato(contato.id)" title="Excluir">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Paginação -->
        <div v-if="pagination.total > pagination.per_page" class="pagination">
          <button 
            class="btn btn-ghost btn-sm" 
            :disabled="!pagination.prev_page_url"
            @click="changePage(pagination.current_page - 1)"
          >
            <i class="fas fa-chevron-left"></i> Anterior
          </button>
          
          <div class="pagination-info">
            Página {{ pagination.current_page }} de {{ pagination.last_page }}
            ({{ pagination.from }}-{{ pagination.to }} de {{ pagination.total }})
          </div>
          
          <button 
            class="btn btn-ghost btn-sm" 
            :disabled="!pagination.next_page_url"
            @click="changePage(pagination.current_page + 1)"
          >
            Próximo <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Ações em Lote -->
    <div v-if="contatosSelecionados.length > 0" class="batch-actions">
      <div class="batch-info">
        <i class="fas fa-check-square"></i>
        <strong>{{ contatosSelecionados.length }} contatos selecionados</strong>
      </div>
      <div class="batch-buttons">
        <button class="btn btn-accent btn-sm" @click="enviarSMSLote">
          <i class="fas fa-paper-plane"></i> Enviar SMS
        </button>
        <button class="btn btn-primary btn-sm" @click="alterarCategoriaLote">
          <i class="fas fa-tag"></i> Alterar Categoria
        </button>
        <button class="btn btn-danger btn-sm" @click="excluirLote">
          <i class="fas fa-trash"></i> Excluir
        </button>
      </div>
    </div>

    <!-- Modal de Detalhes -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">
            <i class="fas fa-user"></i> Detalhes do Contato
          </h2>
          <button class="modal-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div v-if="contatoSelecionado" class="modal-body">
          <div class="detail-section">
            <div class="detail-avatar" :style="{ background: contatoSelecionado.category?.color || '#2563eb' }">
              {{ getInitials(contatoSelecionado.name) }}
            </div>
            <h3>{{ contatoSelecionado.name }}</h3>
          </div>

          <div class="detail-grid">
            <div class="detail-item">
              <i class="fas fa-phone"></i>
              <div>
                <div class="detail-label">Telefone</div>
                <div class="detail-value">{{ formatPhone(contatoSelecionado.phone) }}</div>
              </div>
            </div>

            <div class="detail-item" v-if="contatoSelecionado.email">
              <i class="fas fa-envelope"></i>
              <div>
                <div class="detail-label">Email</div>
                <div class="detail-value">{{ contatoSelecionado.email }}</div>
              </div>
            </div>

            <div class="detail-item" v-if="contatoSelecionado.category">
              <i class="fas fa-tag"></i>
              <div>
                <div class="detail-label">Categoria</div>
                <div class="detail-value">{{ contatoSelecionado.category.name }}</div>
              </div>
            </div>

            <div class="detail-item">
              <i class="fas fa-circle-info"></i>
              <div>
                <div class="detail-label">Status</div>
                <div class="detail-value">{{ contatoSelecionado.status === 'active' ? 'Ativo' : 'Inativo' }}</div>
              </div>
            </div>

            <div class="detail-item" v-if="parseFloat(contatoSelecionado.debt_amount) > 0">
              <i class="fas fa-money-bill"></i>
              <div>
                <div class="detail-label">Dívida</div>
                <div class="detail-value debt">{{ formatCurrency(contatoSelecionado.debt_amount) }}</div>
              </div>
            </div>

            <div class="detail-item">
              <i class="fas fa-sms"></i>
              <div>
                <div class="detail-label">SMS Recebidos</div>
                <div class="detail-value">{{ contatoSelecionado.total_sms_received }}</div>
              </div>
            </div>
          </div>

          <div v-if="contatoSelecionado.custom_fields && Object.keys(contatoSelecionado.custom_fields).length > 0" class="custom-fields">
            <h4><i class="fas fa-list"></i> Campos Personalizados</h4>
            <div class="custom-fields-grid">
              <div v-for="(value, key) in contatoSelecionado.custom_fields" :key="key" class="custom-field">
                <div class="custom-field-label">{{ formatFieldName(key) }}</div>
                <div class="custom-field-value">{{ value }}</div>
              </div>
            </div>
          </div>

          <div class="detail-dates">
            <div>
              <i class="fas fa-calendar-plus"></i>
              Criado em: {{ formatDateTime(contatoSelecionado.created_at) }}
            </div>
            <div>
              <i class="fas fa-calendar-check"></i>
              Atualizado em: {{ formatDateTime(contatoSelecionado.updated_at) }}
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-ghost" @click="closeModal">
            <i class="fas fa-times"></i> Fechar
          </button>
          <button class="btn btn-primary" @click="editarContato(contatoSelecionado.id)">
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
  name: 'ContactsPage',
  
  components: {
    navegacao
  },

  data() {
    return {
      isLoading: true,
      contatos: [],
      categorias: [],
      contatosSelecionados: [],
      selectAll: false,
      showModal: false,
      contatoSelecionado: null,
      filtros: {
        busca: '',
        categoria: '',
        status: ''
      },
      pagination: {
        current_page: 1,
        per_page: 15,
        total: 0,
        last_page: 1,
        from: 0,
        to: 0,
        next_page_url: null,
        prev_page_url: null
      }
    };
  },

  computed: {
    contatosFiltrados() {
      let filtered = [...this.contatos];
      
      // Filtro de busca
      if (this.filtros.busca) {
        const busca = this.filtros.busca.toLowerCase();
        filtered = filtered.filter(c => 
          c.name.toLowerCase().includes(busca) ||
          c.phone.includes(busca) ||
          (c.email && c.email.toLowerCase().includes(busca))
        );
      }
      
      // Filtro de categoria
      if (this.filtros.categoria) {
        filtered = filtered.filter(c => c.category_id === parseInt(this.filtros.categoria));
      }
      
      // Filtro de status
      if (this.filtros.status) {
        filtered = filtered.filter(c => c.status === this.filtros.status);
      }
      
      return filtered;
    },

    stats() {
      const total = this.pagination.total;
      const ativos = this.contatos.filter(c => c.status === 'active').length;
      const inativos = this.contatos.filter(c => c.status === 'inactive').length;
      const comDivida = this.contatos.filter(c => parseFloat(c.debt_amount) > 0).length;

      return [
        { 
          label: 'Total de Contatos', 
          value: total, 
          icon: 'fas fa-users', 
          color: 'linear-gradient(135deg, #3B82F6, #2563EB)' 
        },
        { 
          label: 'Ativos', 
          value: ativos, 
          icon: 'fas fa-user-check', 
          color: 'linear-gradient(135deg, #10B981, #059669)' 
        },
        { 
          label: 'Inativos', 
          value: inativos, 
          icon: 'fas fa-user-clock', 
          color: 'linear-gradient(135deg, #F59E0B, #D97706)' 
        },
        { 
          label: 'Com Dívida', 
          value: comDivida, 
          icon: 'fas fa-money-bill-wave', 
          color: 'linear-gradient(135deg, #EF4444, #DC2626)' 
        }
      ];
    }
  },

  methods: {
    async fetchClients(page = 1) {
      this.isLoading = true;
      const token = localStorage.getItem('auth_token');

      try {
        const response = await axios.get(
          `https://api.devsms.online/api/v1/clients?page=${page}&per_page=${this.pagination.per_page}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        const data = response.data.data;
        this.contatos = data.data;
        
        // Atualizar paginação
        this.pagination = {
          current_page: data.current_page,
          per_page: data.per_page,
          total: data.total,
          last_page: data.last_page,
          from: data.from,
          to: data.to,
          next_page_url: data.next_page_url,
          prev_page_url: data.prev_page_url
        };

        // Extrair categorias únicas
        const categoriasSet = new Map();
        this.contatos.forEach(c => {
          if (c.category) {
            categoriasSet.set(c.category.id, c.category);
          }
        });
        this.categorias = Array.from(categoriasSet.values());

        console.log('Contatos carregados:', this.contatos.length);

      } catch (error) {
        console.error('Erro ao buscar contatos:', error);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          this.$router.push('/login');
        } else {
          alert('Erro ao carregar contatos. Por favor, tente novamente.');
        }
      } finally {
        this.isLoading = false;
      }
    },

    changePage(page) {
      if (page >= 1 && page <= this.pagination.last_page) {
        this.fetchClients(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },

    toggleSelectAll() {
      this.contatosSelecionados = this.selectAll
        ? this.contatosFiltrados.map(c => c.id)
        : [];
    },

    filtrarContatos() {
      // Os filtros são aplicados automaticamente via computed
    },

    resetFiltros() {
      this.filtros = { busca: '', categoria: '', status: '' };
    },

    verDetalhes(contato) {
      this.contatoSelecionado = contato;
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.contatoSelecionado = null;
    },

    editarContato(id) {
      this.$router.push({ name: 'EditarContato', params: { id } });
    },

    enviarSMS(contato) {
      this.$router.push({ 
        name: 'EnviarSMS', 
        query: { 
          telefone: contato.phone,
          nome: contato.name
        }
      });
    },

    async excluirContato(id) {
      if (!confirm('Tem certeza que deseja excluir este contato?')) return;

      const token = localStorage.getItem('auth_token');

      try {
        await axios.delete(`https://api.devsms.online/api/v1/clients/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        alert('Contato excluído com sucesso!');
        this.fetchClients(this.pagination.current_page);
        
      } catch (error) {
        console.error('Erro ao excluir contato:', error);
        alert('Erro ao excluir contato. Por favor, tente novamente.');
      }
    },

    exportarContatos() {
      alert('Funcionalidade de exportação em desenvolvimento');
    },

    enviarSMSLote() {
      const contatos = this.contatos.filter(c => 
        this.contatosSelecionados.includes(c.id)
      );
      
      const telefones = contatos.map(c => c.phone).join(',');
      this.$router.push({ 
        name: 'EnviarSMS', 
        query: { telefones }
      });
    },

    alterarCategoriaLote() {
      alert('Funcionalidade de alteração de categoria em lote em desenvolvimento');
    },

    async excluirLote() {
      if (!confirm(`Deseja excluir ${this.contatosSelecionados.length} contatos selecionados?`)) return;

      const token = localStorage.getItem('auth_token');

      try {
        await Promise.all(
          this.contatosSelecionados.map(id =>
            axios.delete(`https://api.devsms.online/api/v1/clients/${id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
              }
            })
          )
        );

        alert('Contatos excluídos com sucesso!');
        this.contatosSelecionados = [];
        this.selectAll = false;
        this.fetchClients(this.pagination.current_page);
        
      } catch (error) {
        console.error('Erro ao excluir contatos:', error);
        alert('Erro ao excluir alguns contatos. Por favor, tente novamente.');
      }
    },

    importExcel() {
      alert('Funcionalidade de importação em desenvolvimento');
    },

    getInitials(name) {
      if (!name) return '??';
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    },

    formatPhone(phone) {
      if (!phone) return '-';
      // Formato: 939 733 535
      return phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
    },

    formatCurrency(amount) {
      return new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA',
        minimumFractionDigits: 0
      }).format(amount);
    },

    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('pt-AO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    },

    formatDateTime(dateString) {
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

    formatFieldName(key) {
      return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  },

  mounted() {
    this.fetchClients();
  }
};
</script>

<style scoped>
.contacts-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.header-actions {
  display: flex;
  gap: 1rem;
}

.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
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

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--gray-800);
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: var(--gray-600);
  font-size: 0.875rem;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-800);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.contacts-count {
  color: var(--gray-600);
  font-size: 0.938rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-control {
  width: 100%;
  padding: 0.625rem 1rem;
  border: 1px solid var(--gray-300);
  border-radius: 8px;
  font-size: 0.938rem;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.mb-0 {
  margin-bottom: 0 !important;
}

.mb-3 {
  margin-bottom: 1.5rem;
}

.mb-4 {
  margin-bottom: 2rem;
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
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
}

.empty-state i {
  font-size: 4rem;
  color: var(--gray-300);
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--gray-600);
  margin-bottom: 2rem;
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
}

.table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--gray-700);
  font-size: 0.875rem;
  border-bottom: 2px solid var(--gray-200);
  white-space: nowrap;
}

.table td {
  padding: 1rem;
  border-bottom: 1px solid var(--gray-200);
  font-size: 0.938rem;
}

.table tbody tr {
  transition: background-color 0.15s ease;
}

.table tbody tr:hover {
  background: var(--gray-50);
}

.contact-name {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.contact-info {
  flex: 1;
  min-width: 0;
}

.contact-info .name {
  font-weight: 600;
  color: var(--gray-800);
  margin-bottom: 0.125rem;
}

.contact-info .location {
  font-size: 0.813rem;
  color: var(--gray-600);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.phone-link {
  color: var(--primary);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.phone-link:hover {
  text-decoration: underline;
}

.verified-badge {
  color: var(--success);
  margin-left: 0.375rem;
  font-size: 0.875rem;
}

.email-link {
  color: var(--gray-700);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
}

.email-link:hover {
  color: var(--primary);
}

.text-muted {
  color: var(--gray-400);
}

.badge-category {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.813rem;
  font-weight: 600;
  border: 1px solid;
  display: inline-block;
}

.debt-amount {
  color: var(--danger);
  font-weight: 600;
}

.badge {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.813rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
}

.badge-success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

.badge-warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning);
}

.status-dot {
  font-size: 0.5rem;
}

.opt-out-badge {
  color: var(--danger);
  margin-left: 0.375rem;
  font-size: 0.875rem;
}

.sms-count {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--gray-700);
  font-weight: 600;
  margin-bottom: 0.125rem;
}

.last-sms {
  font-size: 0.75rem;
  color: var(--gray-500);
}

.actions {
  white-space: nowrap;
}

.actions button {
  margin-right: 0.25rem;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--gray-200);
}

.pagination-info {
  color: var(--gray-600);
  font-size: 0.938rem;
}

.batch-actions {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  z-index: 100;
  min-width: 300px;
  animation: slideUp 0.3s ease;
}

.batch-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-800);
}

.batch-info i {
  color: var(--primary);
  font-size: 1.25rem;
}

.batch-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
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

.modal-content {
  background: white;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

.modal-header {
  padding: 2rem;
  border-bottom: 1px solid var(--gray-200);
  position: relative;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-800);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-close {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
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
  font-size: 1.125rem;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: var(--gray-200);
  color: var(--gray-800);
}

.modal-body {
  padding: 2rem;
}

.detail-section {
  text-align: center;
  margin-bottom: 2rem;
}

.detail-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.75rem;
  margin: 0 auto 1rem;
}

.detail-section h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-800);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.detail-item > i {
  color: var(--primary);
  font-size: 1.25rem;
  margin-top: 0.125rem;
}

.detail-label {
  font-size: 0.813rem;
  color: var(--gray-600);
  margin-bottom: 0.25rem;
}

.detail-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--gray-800);
}

.detail-value.debt {
  color: var(--danger);
}

.custom-fields {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--gray-50);
  border-radius: 12px;
}

.custom-fields h4 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.custom-fields-grid {
  display: grid;
  gap: 1rem;
}

.custom-field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
}

.custom-field-label {
  font-size: 0.875rem;
  color: var(--gray-600);
  font-weight: 600;
}

.custom-field-value {
  font-size: 0.938rem;
  color: var(--gray-800);
}

.detail-dates {
  padding-top: 1.5rem;
  border-top: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--gray-600);
}

.detail-dates i {
  margin-right: 0.375rem;
  color: var(--primary);
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--gray-200);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

@media (max-width: 768px) {
  .contacts-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .header-actions .btn {
    width: 100%;
  }

  .grid-4 {
    grid-template-columns: 1fr;
  }

  .table {
    font-size: 0.875rem;
  }

  .table th,
  .table td {
    padding: 0.75rem 0.5rem;
  }

  .contact-name {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .batch-actions {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
    min-width: auto;
  }

  .batch-buttons {
    flex-direction: column;
  }

  .batch-buttons .btn {
    width: 100%;
  }

  .pagination {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>