<template>
  <AppLayout>

  <div class="categories-page fade-in">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">
            <i class="fas fa-tags"></i>
            Minhas Categorias
          </h1>
          <p class="page-subtitle">
            Gerencie as categorias dos seus contatos
          </p>
        </div>
      </div>
      <div class="header-actions">
        <button @click="abrirModalCriar" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          Nova Categoria
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Carregando categorias...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="categorias.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-tags"></i>
      </div>
      <h3>Nenhuma categoria encontrada</h3>
      <p>Crie sua primeira categoria para organizar seus contatos</p>
      <button @click="abrirModalCriar" class="btn btn-primary">
        <i class="fas fa-plus"></i>
        Criar Primeira Categoria
      </button>
    </div>

    <!-- Lista de Categorias -->
    <div v-else class="categories-grid">
      <div 
        v-for="categoria in categorias" 
        :key="categoria.id"
        class="category-card"
      >
        <div class="category-header" :style="{ background: categoria.color }">
          <div class="category-badge">
            <i class="fas fa-tag"></i>
          </div>
        </div>

        <div class="category-body">
          <h3 class="category-name">{{ categoria.name }}</h3>
          <p class="category-description">
            {{ categoria.description || 'Sem descrição' }}
          </p>

          <div class="category-stats">
            <div class="stat-item">
              <i class="fas fa-users"></i>
              <span>{{ categoria.clients_count || 0 }} cliente{{ categoria.clients_count !== 1 ? 's' : '' }}</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-calendar"></i>
              <span>{{ formatarData(categoria.created_at) }}</span>
            </div>
          </div>
        </div>

        <div class="category-actions">
          <button @click="abrirModalVisualizarContatos(categoria)" class="btn-action btn-view">
            <i class="fas fa-eye"></i>
            Visualizar
          </button>
          <button @click="editarCategoria(categoria)" class="btn-action btn-edit">
            <i class="fas fa-edit"></i>
            Editar
          </button>
          <button @click="excluirCategoria(categoria)" class="btn-action btn-delete">
            <i class="fas fa-trash"></i>
            Excluir
          </button>
        </div>
      </div>
    </div>

    <!-- ===== MODAL VISUALIZAR CONTATOS ===== -->
    <div v-if="mostrarModalVisualizarContatos" class="modal-overlay" @click="fecharModalVisualizarContatos">
      <div class="modal-content modal-large" @click.stop>
        <div class="modal-header">
          <div class="modal-header-info">
            <div class="modal-header-color" :style="{ background: categoriaSelecionada?.color }"></div>
            <div>
              <h2>{{ categoriaSelecionada?.name }}</h2>
              <p class="modal-subtitle">
                <i class="fas fa-users"></i> 
                {{ paginationContatos.total }} contato{{ paginationContatos.total !== 1 ? 's' : '' }}
              </p>
            </div>
          </div>
          <button @click="fecharModalVisualizarContatos" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <!-- Abas -->
          <div class="tabs">
            <button 
              class="tab-button" 
              :class="{ active: abaAtiva === 'contatos' }"
              @click="abaAtiva = 'contatos'"
            >
              <i class="fas fa-users"></i> Contatos
            </button>
            <button 
              class="tab-button" 
              :class="{ active: abaAtiva === 'criar' }"
              @click="abaAtiva = 'criar'"
            >
              <i class="fas fa-user-plus"></i> Criar Contato
            </button>
          </div>

          <!-- Aba Contatos -->
          <div v-if="abaAtiva === 'contatos'" class="tab-content">
            <!-- Barra de pesquisa -->
            <div class="search-bar">
              <div class="search-input-wrapper">
                <i class="fas fa-search search-icon"></i>
                <input 
                  type="text" 
                  v-model="filtrosContatos.busca" 
                  class="form-input search-input" 
                  placeholder="Buscar por nome ou telefone..."
                  @input="onSearchContatosInput"
                >
                <button 
                  v-if="filtrosContatos.busca" 
                  class="search-clear" 
                  @click="limparBuscaContatos"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <!-- Loading -->
            <div v-if="carregandoContatos" class="loading-state-small">
              <div class="spinner-small"></div>
              <p>Carregando contatos...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="contatosDaCategoria.length === 0" class="empty-state-small">
              <i class="fas fa-inbox"></i>
              <h4>Nenhum contato encontrado</h4>
              <p v-if="filtrosContatos.busca">Tente buscar com outros termos</p>
              <p v-else>Adicione contatos ou crie um novo</p>
            </div>

            <!-- Lista de Contatos -->
            <div v-else class="contacts-list">
              <div v-for="contato in contatosDaCategoria" :key="contato.id" class="contact-item">
                <div class="contact-avatar" :style="{ background: categoriaSelecionada?.color }">
                  {{ getInitials(contato.name) }}
                </div>
                <div class="contact-info">
                  <h4>{{ contato.name }}</h4>
                  <p class="contact-phone">
                    <i class="fas fa-phone"></i> {{ formatPhone(contato.phone) }}
                  </p>
                  <p v-if="contato.email" class="contact-email">
                    <i class="fas fa-envelope"></i> {{ contato.email }}
                  </p>
                </div>
                <div class="contact-status">
                  <span :class="['status-badge', contato.status === 'active' ? 'active' : 'inactive']">
                    <i class="fas fa-circle"></i>
                    {{ contato.status === 'active' ? 'Ativo' : 'Inativo' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Paginação -->
            <div v-if="paginationContatos.total > paginationContatos.per_page" class="pagination">
              <button 
                class="btn-pagination" 
                :disabled="paginationContatos.current_page === 1"
                @click="mudarPaginaContatos(paginationContatos.current_page - 1)"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              
              <span class="pagination-info">
                Página {{ paginationContatos.current_page }} de {{ paginationContatos.last_page }}
              </span>
              
              <button 
                class="btn-pagination" 
                :disabled="paginationContatos.current_page === paginationContatos.last_page"
                @click="mudarPaginaContatos(paginationContatos.current_page + 1)"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <!-- Aba Criar Contato -->
          <div v-if="abaAtiva === 'criar'" class="tab-content">
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-user"></i> Nome *
              </label>
              <input 
                v-model="novoContato.name"
                type="text"
                class="form-input"
                placeholder="Digite o nome do contato..."
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-phone"></i> Telefone *
              </label>
              <input 
                v-model="novoContato.phone"
                type="text"
                class="form-input"
                placeholder="Ex: 923456789"
                maxlength="9"
                @input="formatarTelefoneCriar"
                required
              />
              <small class="form-hint">Digite apenas 9 dígitos</small>
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-envelope"></i> Email
              </label>
              <input 
                v-model="novoContato.email"
                type="email"
                class="form-input"
                placeholder="seu@email.com"
              />
            </div>

            <div v-if="erroAoCriar" class="alert-error">
              <i class="fas fa-exclamation-circle"></i>
              {{ erroAoCriar }}
            </div>

            <div v-if="sucessoCriar" class="alert-success">
              <i class="fas fa-check-circle"></i>
              Contato criado com sucesso!
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-ghost" @click="fecharModalVisualizarContatos">
            <i class="fas fa-times"></i> Fechar
          </button>
          <button 
            v-if="abaAtiva === 'criar'"
            class="btn btn-primary" 
            @click="criarNovoContato"
            :disabled="criandoContato || !novoContato.name || !novoContato.phone"
          >
            <i class="fas fa-spinner fa-spin" v-if="criandoContato"></i>
            <i class="fas fa-plus" v-else></i>
            {{ criandoContato ? 'Criando...' : 'Criar Contato' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Criar/Editar -->
    <div v-if="mostrarModal" class="modal-overlay" @click="fecharModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>
            <i class="fas fa-tag"></i>
            {{ modoEdicao ? 'Editar Categoria' : 'Nova Categoria' }}
          </h2>
          <button @click="fecharModal" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form @submit.prevent="salvarCategoria">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-signature"></i> Nome da Categoria *
              </label>
              <input 
                v-model="form.name" 
                class="form-input" 
                placeholder="Ex: VIP, Premium, Bronze..." 
                required 
              />
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-align-left"></i> Descrição
              </label>
              <textarea 
                v-model="form.description" 
                class="form-input" 
                rows="3"
                placeholder="Descreva esta categoria..."
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-palette"></i> Cor da Categoria *
              </label>
              <div class="color-picker-wrapper">
                <input 
                  type="color" 
                  v-model="form.color" 
                  class="color-input"
                  required 
                />
                <input 
                  type="text" 
                  v-model="form.color" 
                  class="form-input color-text"
                  placeholder="#000000"
                  pattern="^#[0-9A-Fa-f]{6}$"
                  required 
                />
              </div>
              <div class="color-preview-large" :style="{ background: form.color }">
                <span>Preview da Cor</span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" @click="fecharModal" class="btn btn-cancel">
              <i class="fas fa-times"></i> Cancelar
            </button>
            <button type="submit" class="btn btn-save" :disabled="isSubmitting">
              <i class="fas fa-spinner fa-spin" v-if="isSubmitting"></i>
              <i class="fas fa-check" v-else></i>
              {{ isSubmitting ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  </AppLayout>
</template>

<script>
import axios from 'axios';
import AppLayout from '../components/AppLayout.vue';

export default {
  name: 'MinhasCategorias',
  
  components: {
    AppLayout
  },

  data() {
    return {
      isLoading: true,
      isSubmitting: false,
      mostrarModal: false,
      mostrarModalVisualizarContatos: false,
      modoEdicao: false,
      categorias: [],
      
      form: {
        id: null,
        name: '',
        description: '',
        color: '#6366f1',
        company_id: null
      },

      // Modal Visualizar Contatos
      categoriaSelecionada: null,
      abaAtiva: 'contatos',
      contatosDaCategoria: [],
      carregandoContatos: false,
      
      // Paginação e filtros para contatos da categoria
      paginationContatos: {
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
        from: 0,
        to: 0
      },
      filtrosContatos: {
        busca: ''
      },
      searchTimerContatos: null,

      // Criar novo contato
      novoContato: {
        name: '',
        phone: '',
        email: ''
      },
      criandoContato: false,
      erroAoCriar: '',
      sucessoCriar: false
    };
  },

  methods: {
    async fetchCategorias() {
      this.isLoading = true;
      const token = localStorage.getItem('auth_token');

      try {
        const response = await axios.get('https://api.devsms.online/api/v1/categories', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        this.categorias = response.data.data || response.data || [];
        console.log('✅ Categorias carregadas:', this.categorias.length);

      } catch (error) {
        console.error('❌ Erro ao buscar categorias:', error);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          this.$router.push('/login');
        } else {
          alert('Erro ao carregar categorias.');
        }
      } finally {
        this.isLoading = false;
      }
    },

    // ===== MODAL VISUALIZAR CONTATOS =====
    async abrirModalVisualizarContatos(categoria) {
      this.categoriaSelecionada = categoria;
      this.abaAtiva = 'contatos';
      this.novoContato = { name: '', phone: '', email: '' };
      this.erroAoCriar = '';
      this.sucessoCriar = false;
      this.filtrosContatos.busca = '';
      this.paginationContatos.current_page = 1;
      this.mostrarModalVisualizarContatos = true;
      await this.carregarContatosDaCategoria();
    },

    fecharModalVisualizarContatos() {
      this.mostrarModalVisualizarContatos = false;
      this.categoriaSelecionada = null;
      this.contatosDaCategoria = [];
      clearTimeout(this.searchTimerContatos);
    },

    async carregarContatosDaCategoria() {
      if (!this.categoriaSelecionada) return;
      
      this.carregandoContatos = true;
      const token = localStorage.getItem('auth_token');

      try {
        // Usando o mesmo endpoint da listagem de contatos, mas com filtro de categoria
        const params = {
          page: this.paginationContatos.current_page,
          per_page: this.paginationContatos.per_page,
          category_id: this.categoriaSelecionada.id
        };

        if (this.filtrosContatos.busca.trim()) {
          params.search = this.filtrosContatos.busca.trim();
        }

        const response = await axios.get('https://api.devsms.online/api/v1/clients', {
          params,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        // Mesma lógica da listagem principal
        const data = response.data.data;
        
        if (data && data.data) {
          this.contatosDaCategoria = data.data;
          this.paginationContatos = {
            current_page: data.current_page || 1,
            per_page: data.per_page || 10,
            total: data.total || 0,
            last_page: data.last_page || 1,
            from: data.from || 0,
            to: data.to || 0
          };
        } else if (Array.isArray(response.data)) {
          this.contatosDaCategoria = response.data;
          this.paginationContatos.total = response.data.length;
        } else if (response.data && Array.isArray(response.data.data)) {
          this.contatosDaCategoria = response.data.data;
          this.paginationContatos.total = response.data.data.length;
        }

        console.log('✅ Contatos carregados:', this.contatosDaCategoria.length);

      } catch (error) {
        console.error('Erro ao carregar contatos da categoria:', error);
        this.contatosDaCategoria = [];
        this.paginationContatos.total = 0;
      } finally {
        this.carregandoContatos = false;
      }
    },

    onSearchContatosInput() {
      clearTimeout(this.searchTimerContatos);
      this.searchTimerContatos = setTimeout(() => {
        this.paginationContatos.current_page = 1;
        this.carregarContatosDaCategoria();
      }, 500);
    },

    limparBuscaContatos() {
      this.filtrosContatos.busca = '';
      this.paginationContatos.current_page = 1;
      this.carregarContatosDaCategoria();
    },

    mudarPaginaContatos(page) {
      if (page >= 1 && page <= this.paginationContatos.last_page) {
        this.paginationContatos.current_page = page;
        this.carregarContatosDaCategoria();
      }
    },

    async criarNovoContato() {
      if (!this.novoContato.name || !this.novoContato.phone) {
        this.erroAoCriar = 'Nome e Telefone são obrigatórios';
        return;
      }

      if (this.novoContato.phone.length !== 9) {
        this.erroAoCriar = 'Telefone deve ter 9 dígitos';
        return;
      }

      this.criandoContato = true;
      this.erroAoCriar = '';
      this.sucessoCriar = false;
      const token = localStorage.getItem('auth_token');

      try {
        const payload = {
          name: this.novoContato.name,
          phone: this.novoContato.phone,
          email: this.novoContato.email || null,
          category_id: this.categoriaSelecionada.id
        };

        await axios.post(
          'https://api.devsms.online/api/v1/clients',
          payload,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        this.sucessoCriar = true;
        this.novoContato = { name: '', phone: '', email: '' };

        // Recarregar contatos após criar
        setTimeout(() => {
          this.carregarContatosDaCategoria();
          // Voltar para a aba de contatos
          this.abaAtiva = 'contatos';
        }, 1500);

      } catch (error) {
        console.error('❌ Erro ao criar contato:', error);
        this.erroAoCriar = error.response?.data?.message || 'Erro ao criar contato';
      } finally {
        this.criandoContato = false;
      }
    },

    formatarTelefoneCriar() {
      let valor = this.novoContato.phone.replace(/\D/g, '');
      if (valor.length > 9) {
        valor = valor.substring(0, 9);
      }
      this.novoContato.phone = valor;
    },

    // ===== MODAL CRIAR/EDITAR =====
    abrirModalCriar() {
      this.modoEdicao = false;
      this.form = {
        id: null,
        name: '',
        description: '',
        color: '#6366f1',
        company_id: this.getCompanyId()
      };
      this.mostrarModal = true;
    },

    editarCategoria(categoria) {
      this.modoEdicao = true;
      this.form = {
        id: categoria.id,
        name: categoria.name,
        description: categoria.description || '',
        color: categoria.color,
        company_id: categoria.company_id
      };
      this.mostrarModal = true;
    },

    fecharModal() {
      this.mostrarModal = false;
      this.form = {
        id: null,
        name: '',
        description: '',
        color: '#6366f1',
        company_id: null
      };
    },

    async salvarCategoria() {
      if (this.isSubmitting) return;

      if (!this.form.name.trim()) {
        alert('Por favor, informe o nome da categoria.');
        return;
      }

      this.isSubmitting = true;
      const token = localStorage.getItem('auth_token');

      try {
        const payload = {
          name: this.form.name,
          description: this.form.description || null,
          color: this.form.color,
          company_id: this.getCompanyId()
        };

        if (this.modoEdicao) {
          await axios.put(
            `https://api.devsms.online/api/v1/categories/${this.form.id}`,
            payload,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            }
          );
          alert('✅ Categoria atualizada com sucesso!');
        } else {
          await axios.post(
            'https://api.devsms.online/api/v1/categories',
            payload,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              }
            }
          );
          alert('✅ Categoria criada com sucesso!');
        }

        this.fecharModal();
        this.fetchCategorias();

      } catch (error) {
        console.error('❌ Erro ao salvar categoria:', error);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          this.$router.push('/login');
        } else if (error.response?.data?.message) {
          alert('Erro: ' + error.response.data.message);
        } else {
          alert('Erro ao salvar categoria.');
        }
      } finally {
        this.isSubmitting = false;
      }
    },

    async excluirCategoria(categoria) {
      if (!confirm(`Tem certeza que deseja excluir a categoria "${categoria.name}"?\n\nEsta ação não pode ser desfeita.`)) {
        return;
      }

      const token = localStorage.getItem('auth_token');

      try {
        await axios.delete(
          `https://api.devsms.online/api/v1/categories/${categoria.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        alert('✅ Categoria excluída com sucesso!');
        this.fetchCategorias();

      } catch (error) {
        console.error('❌ Erro ao excluir categoria:', error);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          this.$router.push('/login');
        } else if (error.response?.data?.message) {
          alert('Erro: ' + error.response.data.message);
        } else {
          alert('Erro ao excluir categoria.');
        }
      }
    },

    getCompanyId() {
      const user = JSON.parse(localStorage.getItem('user_data') || '{}');
      return user.company_id || 1;
    },

    formatarData(data) {
      if (!data) return '-';
      const date = new Date(data);
      return date.toLocaleDateString('pt-BR');
    },

    getInitials(name) {
      if (!name) return '??';
      const parts = name.split(' ');
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      return name.substring(0, 2).toUpperCase();
    },

    formatPhone(phone) {
      if (!phone) return '-';
      return phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
    }
  },

  mounted() {
    this.fetchCategorias();
  },

  beforeUnmount() {
    clearTimeout(this.searchTimerContatos);
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
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-900: #111827;
}

.categories-page {
  padding: 2rem;
  max-width: 1400px;
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
  color: var(--gray-900);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-subtitle {
  color: var(--gray-600);
  margin: 0.5rem 0 0 0;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.category-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.category-header {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.category-badge {
  width: 60px;
  height: 60px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--gray-700);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.category-body {
  padding: 1.5rem;
}

.category-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 0.5rem 0;
}

.category-description {
  color: var(--gray-600);
  font-size: 0.875rem;
  margin: 0 0 1rem 0;
  line-height: 1.5;
}

.category-stats {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: var(--gray-50);
  border-radius: 8px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-700);
  font-size: 0.875rem;
}

.stat-item i {
  color: var(--primary);
}

.category-actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  border-top: 1px solid var(--gray-200);
}

.btn-action {
  padding: 1rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.btn-view {
  color: var(--primary);
  border-right: 1px solid var(--gray-200);
}

.btn-view:hover {
  background: rgba(99, 102, 241, 0.1);
}

.btn-edit {
  color: var(--warning);
  border-right: 1px solid var(--gray-200);
}

.btn-edit:hover {
  background: rgba(245, 158, 11, 0.1);
}

.btn-delete {
  color: var(--danger);
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-content.modal-large {
  max-width: 700px;
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.modal-header-color {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  flex-shrink: 0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--gray-900);
}

.modal-subtitle {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin: 0.5rem 0 0 0;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.btn-close {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: var(--gray-100);
  color: var(--gray-700);
  cursor: pointer;
  transition: all 0.3s;
}

.btn-close:hover {
  background: var(--gray-200);
}

.modal-body {
  padding: 2rem;
  max-height: calc(90vh - 200px);
  overflow-y: auto;
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--gray-200);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Abas */
.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid var(--gray-200);
}

.tab-button {
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--gray-600);
  font-weight: 500;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: -2px;
}

.tab-button:hover {
  color: var(--primary);
}

.tab-button.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Search */
.search-bar {
  margin-bottom: 1.5rem;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: var(--gray-400);
  pointer-events: none;
}

.search-input {
  padding-left: 2.5rem !important;
  padding-right: 2.5rem !important;
}

.search-clear {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: var(--gray-400);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-clear:hover {
  color: var(--gray-700);
}

/* Contatos */
.contacts-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--gray-50);
  border-radius: 8px;
}

.contact-avatar {
  width: 48px;
  height: 48px;
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
}

.contact-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9375rem;
  color: var(--gray-900);
  font-weight: 600;
}

.contact-phone,
.contact-email {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--gray-600);
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.contact-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 600;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
}

.status-badge.active {
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
}

.status-badge.inactive {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning);
}

/* Loading States */
.loading-state-small {
  text-align: center;
  padding: 3rem 2rem;
  background: var(--gray-50);
  border-radius: 12px;
}

.spinner-small {
  width: 40px;
  height: 40px;
  border: 3px solid var(--gray-200);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Empty States */
.empty-state-small {
  text-align: center;
  padding: 3rem 2rem;
  background: var(--gray-50);
  border-radius: 12px;
}

.empty-state-small i {
  font-size: 3rem;
  color: var(--gray-300);
  margin-bottom: 1rem;
}

.empty-state-small h4 {
  font-size: 1.125rem;
  color: var(--gray-900);
  margin: 0 0 0.5rem 0;
}

.empty-state-small p {
  color: var(--gray-600);
  margin: 0;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-200);
}

.btn-pagination {
  width: 36px;
  height: 36px;
  border: 2px solid var(--gray-200);
  background: white;
  border-radius: 8px;
  color: var(--gray-700);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-pagination:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: var(--gray-600);
  font-size: 0.875rem;
}

/* Form */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  font-size: 0.9375rem;
  transition: all 0.3s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-hint {
  font-size: 0.75rem;
  color: var(--gray-600);
  margin-top: 0.25rem;
  display: block;
}

/* Alerts */
.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #991b1b;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1rem;
}

.alert-success {
  background: #f0fdf4;
  border: 1px solid #86efac;
  color: #166534;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1rem;
}

/* Color Picker */
.color-picker-wrapper {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 1rem;
}

.color-input {
  width: 80px;
  height: 48px;
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  cursor: pointer;
  padding: 2px;
}

.color-text {
  text-transform: uppercase;
}

.color-preview-large {
  margin-top: 1rem;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

/* Buttons */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
  font-size: 0.9375rem;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: white;
  color: var(--gray-700);
  border: 2px solid var(--gray-300);
}

.btn-cancel:hover {
  background: var(--gray-50);
}

.btn-save {
  background: var(--success);
  color: white;
}

.btn-save:hover {
  background: #059669;
}

.btn-ghost {
  background: white;
  color: var(--gray-700);
  border: 2px solid var(--gray-300);
}

.btn-ghost:hover:not(:disabled) {
  background: var(--gray-50);
}

/* Loading & Empty States */
.loading-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--gray-200);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: var(--gray-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: var(--gray-400);
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--gray-900);
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: var(--gray-600);
  margin: 0 0 1.5rem 0;
}

/* Animations */
.fade-in {
  animation: fadeIn 0.5s ease-in;
}

/* Responsive */
@media (max-width: 768px) {
  .categories-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .category-actions {
    grid-template-columns: 1fr;
  }

  .btn-action {
    border-right: none !important;
    border-bottom: 1px solid var(--gray-200);
  }

  .btn-action:last-child {
    border-bottom: none;
  }

  .tabs {
    flex-direction: column;
    gap: 0.5rem;
  }

  .tab-button {
    width: 100%;
    justify-content: center;
  }
}
</style>