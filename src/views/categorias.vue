<template>
  <navegacao/>

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

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <i class="fas fa-tags"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ categorias.length }}</h3>
          <p class="stat-label">Total de Categorias</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          <i class="fas fa-users"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ totalClientes }}</h3>
          <p class="stat-label">Total de Clientes</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          <i class="fas fa-chart-line"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ Math.round(totalClientes / categorias.length) || 0 }}</h3>
          <p class="stat-label">Média por Categoria</p>
        </div>
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
              <span>{{ categoria.clients_count }} cliente{{ categoria.clients_count !== 1 ? 's' : '' }}</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-calendar"></i>
              <span>{{ formatarData(categoria.created_at) }}</span>
            </div>
          </div>

          <div class="category-color-info">
            <span class="color-label">Cor:</span>
            <span class="color-preview" :style="{ background: categoria.color }"></span>
            <span class="color-code">{{ categoria.color }}</span>
          </div>
        </div>

        <div class="category-actions">
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

            <!-- Cores Sugeridas -->
            <div class="suggested-colors">
              <p class="colors-label">Cores Sugeridas:</p>
              <div class="colors-grid">
                <button 
                  v-for="cor in coresSugeridas" 
                  :key="cor"
                  type="button"
                  class="color-option"
                  :style="{ background: cor }"
                  :class="{ 'color-selected': form.color === cor }"
                  @click="form.color = cor"
                  :title="cor"
                >
                  <i v-if="form.color === cor" class="fas fa-check"></i>
                </button>
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
</template>

<script>
import axios from 'axios';
import navegacao from '../components/navegacao.vue';

export default {
  name: 'MinhasCategorias',
  
  components: {
    navegacao
  },

  data() {
    return {
      isLoading: true,
      isSubmitting: false,
      mostrarModal: false,
      modoEdicao: false,
      categorias: [],
      
      form: {
        id: null,
        name: '',
        description: '',
        color: '#6366f1',
        company_id: null
      },

      coresSugeridas: [
        '#FFD700', // Dourado
        '#FF6B6B', // Vermelho
        '#4ECDC4', // Turquesa
        '#45B7D1', // Azul
        '#96CEB4', // Verde
        '#FFEAA7', // Amarelo
        '#DFE6E9', // Cinza
        '#A29BFE', // Roxo
        '#FD79A8', // Rosa
        '#6C5CE7', // Roxo Escuro
        '#00B894', // Verde Esmeralda
        '#FDCB6E', // Laranja
        '#E17055', // Terracota
        '#74B9FF', // Azul Claro
        '#A29BFE', // Lavanda
        '#FF7675'  // Coral
      ]
    };
  },

  computed: {
    totalClientes() {
      return this.categorias.reduce((total, cat) => total + cat.clients_count, 0);
    }
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

        this.categorias = response.data.data || [];
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
          // Editar
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
          // Criar
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
      // Você pode obter o company_id do localStorage ou de um store Vuex
      // Por enquanto, vou retornar 1 como padrão
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.company_id || 1;
    },

    formatarData(data) {
      if (!data) return '-';
      const date = new Date(data);
      return date.toLocaleDateString('pt-BR');
    }
  },

  mounted() {
    this.fetchCategorias();
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

/* Header */
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

/* Stats */
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
  color: var(--gray-900);
  margin: 0;
}

.stat-label {
  color: var(--gray-600);
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
}

/* Categories Grid */
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

.category-color-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: var(--gray-50);
  border-radius: 8px;
}

.color-label {
  font-size: 0.875rem;
  color: var(--gray-600);
  font-weight: 500;
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  border: 2px solid white;
  box-shadow: 0 0 0 1px var(--gray-300);
}

.color-code {
  font-family: monospace;
  font-size: 0.875rem;
  color: var(--gray-700);
}

.category-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
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
}

.btn-edit {
  color: var(--primary);
  border-right: 1px solid var(--gray-200);
}

.btn-edit:hover {
  background: rgba(99, 102, 241, 0.1);
}

.btn-delete {
  color: var(--danger);
}

.btn-delete:hover {
  background: rgba(239, 68, 68, 0.1);
}

/* Modal */
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

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--gray-900);
  display: flex;
  align-items: center;
  gap: 0.75rem;
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
}

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
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

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

.suggested-colors {
  margin-top: 1.5rem;
}

.colors-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-700);
  margin-bottom: 0.75rem;
}

.colors-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.5rem;
}

.color-option {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.875rem;
}

.color-option:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.color-option.color-selected {
  border-color: var(--gray-900);
  transform: scale(1.1);
}

.modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid var(--gray-200);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
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

/* Loading & Empty States */
.loading-state,
.empty-state {
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

@keyframes spin {
  to { transform: rotate(360deg); }
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

  .colors-grid {
    grid-template-columns: repeat(6, 1fr);
  }
}
</style>