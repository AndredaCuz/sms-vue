<template>
  <navegacao/>
  
  <div class="page-container fade-in">
    
    <!-- Header Section -->
    <div class="page-header">
      <div>
        <h1 class="page-title">
          <i class="fas fa-file-alt"></i>
          Templates de SMS
        </h1>
        <p class="page-subtitle">Gerencie seus templates de mensagens</p>
      </div>
       <router-link :to="{ name: 'Criar' }" class="btn btn-accent">
          <i class="fas fa-plus"></i>
          Novo tempalte
        </router-link>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Carregando templates...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="templates.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-file-alt"></i>
      </div>
      <h3>Nenhum template encontrado</h3>
      <p>Comece criando seu primeiro template de SMS</p>
      <button class="btn-primary" @click="goToCreateTemplate">
        <i class="fas fa-plus"></i>
        Criar Primeiro Template
      </button>
    </div>

    <!-- Templates Grid -->
    <div v-else class="templates-grid">
      <div 
        v-for="template in templates" 
        :key="template.id" 
        class="template-card"
      >
        <div class="template-header">
          <div class="template-info">
            <h3 class="template-name">{{ template.name }}</h3>
            <div class="template-meta">
              <span class="meta-item">
                <i class="fas fa-calendar"></i>
                {{ formatDate(template.created_at) }}
              </span>
              <span class="meta-item">
                <i class="fas fa-paper-plane"></i>
                {{ template.usage_count }} envios
              </span>
            </div>
          </div>
          <div class="template-actions">
            <button 
              class="btn-icon" 
              @click="viewTemplate(template)"
              title="Visualizar"
            >
              <i class="fas fa-eye"></i>
            </button>
            <button 
              class="btn-icon" 
              @click="editTemplate(template)"
              title="Editar"
            >
              <i class="fas fa-edit"></i>
            </button>
            <button 
              class="btn-icon" 
              @click="duplicateTemplate(template)"
              title="Duplicar"
            >
              <i class="fas fa-copy"></i>
            </button>
            <button 
              class="btn-icon danger" 
              @click="confirmDeleteTemplate(template)"
              title="Excluir"
            >
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        <div class="template-body">
          <p class="template-text">{{ template.body }}</p>
        </div>

        <div class="template-footer">
          <div class="template-variables">
            <span class="variables-label">
              <i class="fas fa-code"></i>
              Variáveis:
            </span>
            <div class="variables-list">
              <span 
                v-for="variable in template.variables" 
                :key="variable"
                class="variable-tag"
              >
             {{ '{' + variable + '}' }}

              </span>
              <span v-if="template.variables.length === 0" class="no-variables">
                Nenhuma variável
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de Visualização -->
    <Transition name="modal">
      <div v-if="showViewModal" class="modal-backdrop" @click.self="closeViewModal">
        <div class="modal-container">
          
          <div class="modal-header">
            <div>
              <h3 class="modal-title">{{ selectedTemplate?.name }}</h3>
              <p class="modal-subtitle">Detalhes do template</p>
            </div>
            <button class="btn-close-modal" @click="closeViewModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="detail-section">
              <label class="detail-label">Mensagem:</label>
              <div class="message-preview">{{ selectedTemplate?.body }}</div>
            </div>

            <div class="detail-section">
              <label class="detail-label">Variáveis disponíveis:</label>
              <div class="variables-grid">
                <span 
                  v-for="variable in selectedTemplate?.variables" 
                  :key="variable"
                  class="variable-badge"
                >
                 {{ '{' + variable + '}' }}

                </span>
                <span v-if="selectedTemplate?.variables.length === 0" class="text-muted">
                  Nenhuma variável definida
                </span>
              </div>
            </div>

            <div class="detail-section">
              <label class="detail-label">Estatísticas:</label>
              <div class="stats-row">
                <div class="stat-item">
                  <i class="fas fa-paper-plane"></i>
                  <div>
                    <strong>{{ selectedTemplate?.usage_count }}</strong>
                    <span>Envios</span>
                  </div>
                </div>
                <div class="stat-item">
                  <i class="fas fa-calendar-plus"></i>
                  <div>
                    <strong>{{ formatDate(selectedTemplate?.created_at) }}</strong>
                    <span>Criado em</span>
                  </div>
                </div>
                <div class="stat-item">
                  <i class="fas fa-calendar-check"></i>
                  <div>
                    <strong>{{ formatDate(selectedTemplate?.updated_at) }}</strong>
                    <span>Atualizado em</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button class="btn-secondary" @click="closeViewModal">
                <i class="fas fa-times"></i>
                Fechar
              </button>
              <button class="btn-primary" @click="editTemplate(selectedTemplate)">
                <i class="fas fa-edit"></i>
                Editar Template
              </button>
            </div>
          </div>

        </div>
      </div>
    </Transition>

    <!-- Modal de Confirmação de Exclusão -->
    <Transition name="modal">
      <div v-if="showDeleteModal" class="modal-backdrop" @click.self="closeDeleteModal">
        <div class="modal-container modal-small">
          
          <div class="modal-header">
            <div>
              <h3 class="modal-title">Excluir Template</h3>
              <p class="modal-subtitle">Esta ação não pode ser desfeita</p>
            </div>
            <button class="btn-close-modal" @click="closeDeleteModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="warning-box">
              <i class="fas fa-exclamation-triangle"></i>
              <div>
                <p>Tem certeza que deseja excluir o template <strong>{{ templateToDelete?.name }}</strong>?</p>
                <p class="text-muted">Este template foi usado {{ templateToDelete?.usage_count }} vezes.</p>
              </div>
            </div>

            <div class="modal-actions">
              <button class="btn-secondary" @click="closeDeleteModal">
                <i class="fas fa-times"></i>
                Cancelar
              </button>
              <button 
                class="btn-danger" 
                @click="deleteTemplate"
                :disabled="isProcessing"
              >
                <i class="fas" :class="isProcessing ? 'fa-spinner fa-spin' : 'fa-trash'"></i>
                {{ isProcessing ? 'Excluindo...' : 'Excluir Template' }}
              </button>
            </div>
          </div>

        </div>
      </div>
    </Transition>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="showToast" :class="['toast-notification', toastType]">
        <i class="fas" :class="toastType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'"></i>
        <div>
          <strong>{{ toastTitle }}</strong>
          <p>{{ toastMessage }}</p>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script>
import axios from 'axios';
import navegacao from '../../components/navegacao.vue';

export default {
  name: 'TemplatesList',
  components: {
    navegacao
  },
  data() {
    return {
      isLoading: true,
      isProcessing: false,
      showViewModal: false,
      showDeleteModal: false,
      showToast: false,
      toastType: 'success',
      toastTitle: '',
      toastMessage: '',
      templates: [],
      selectedTemplate: null,
      templateToDelete: null
    };
  },
  methods: {
    async fetchTemplates() {
      this.isLoading = true;
      const token = localStorage.getItem('auth_token');

      try {
        const response = await axios.get('https://api.devsms.online/api/v1/templates', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        this.templates = response.data.data;
        console.log('Templates carregados:', this.templates.length);

      } catch (error) {
        console.error('Erro ao buscar templates:', error);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          this.$router.push('/login');
        } else {
          this.showToastNotification('error', 'Erro', 'Não foi possível carregar os templates');
        }
      } finally {
        this.isLoading = false;
      }
    },

    async duplicateTemplate(template) {
      const confirmed = confirm(`Deseja duplicar o template "${template.name}"?`);
      
      if (!confirmed) return;

      const token = localStorage.getItem('auth_token');

      try {
        await axios.post(`https://api.devsms.online/api/v1/templates/${template.id}/duplicate`, {}, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        this.showToastNotification('success', 'Sucesso!', 'Template duplicado com sucesso');
        await this.fetchTemplates();

      } catch (error) {
        console.error('Erro ao duplicar template:', error);
        this.showToastNotification('error', 'Erro', 'Não foi possível duplicar o template');
      }
    },

    async deleteTemplate() {
      this.isProcessing = true;
      const token = localStorage.getItem('auth_token');

      try {
        await axios.delete(`https://api.devsms.online/api/v1/templates/${this.templateToDelete.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        this.showToastNotification('success', 'Sucesso!', 'Template excluído com sucesso');
        this.closeDeleteModal();
        await this.fetchTemplates();

      } catch (error) {
        console.error('Erro ao excluir template:', error);
        this.showToastNotification('error', 'Erro', 'Não foi possível excluir o template');
      } finally {
        this.isProcessing = false;
      }
    },

    viewTemplate(template) {
      this.selectedTemplate = template;
      this.showViewModal = true;
    },

    closeViewModal() {
      this.showViewModal = false;
      this.selectedTemplate = null;
    },

    editTemplate(template) {
      this.closeViewModal();
      this.$router.push(`/templates/edit/${template.id}`);
    },

    confirmDeleteTemplate(template) {
      this.templateToDelete = template;
      this.showDeleteModal = true;
    },

    closeDeleteModal() {
      this.showDeleteModal = false;
      this.templateToDelete = null;
    },

    goToCreateTemplate() {
      this.$router.push('/templates/create');
    },

    showToastNotification(type, title, message) {
      this.toastType = type;
      this.toastTitle = title;
      this.toastMessage = message;
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 3000);
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-AO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
  },
  mounted() {
    this.fetchTemplates();
  }
};
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
  flex-wrap: wrap;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 1rem;
}

.btn-primary {
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
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
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  width: 120px;
  height: 120px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #667eea20, #764ba220);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
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

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.template-card {
  background: white;
  border-radius: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
  border-color: #667eea;
}

.template-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.template-info {
  flex: 1;
  min-width: 0;
}

.template-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.5rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.template-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.meta-item i {
  font-size: 0.75rem;
}

.template-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
}

.btn-icon:hover {
  background: #667eea;
  color: white;
  transform: scale(1.1);
}

.btn-icon.danger:hover {
  background: #ef4444;
}

.template-body {
  padding: 1.5rem;
  background: #f9fafb;
}

.template-text {
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
  font-size: 0.9375rem;
}

.template-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.template-variables {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}

.variables-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.variables-list {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex: 1;
}

.variable-tag {
  padding: 0.25rem 0.75rem;
  background: #667eea;
  color: white;
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.no-variables {
  font-size: 0.875rem;
  color: #9ca3af;
  font-style: italic;
}

/* Modal Styles */
.modal-backdrop {
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
}

.modal-container {
  background: white;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-small {
  max-width: 500px;
}

.modal-header {
  padding: 2rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.modal-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.btn-close-modal {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.btn-close-modal:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.modal-body {
  padding: 2rem;
}

.detail-section {
  margin-bottom: 1.5rem;
}

.detail-label {
  display: block;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
}

.message-preview {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 10px;
  border: 2px solid #e5e7eb;
  color: #4b5563;
  line-height: 1.6;
  white-space: pre-wrap;
}

.variables-grid {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.variable-badge {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: 'Courier New', monospace;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 10px;
}

.stat-item i {
  font-size: 1.5rem;
  color: #667eea;
}

.stat-item strong {
  display: block;
  font-size: 1.125rem;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.stat-item span {
  font-size: 0.75rem;
  color: #6b7280;
}

.warning-box {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #fef2f2;
  border-left: 4px solid #ef4444;
  border-radius: 10px;
  margin-bottom: 1.5rem;
}

.warning-box i {
  color: #ef4444;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.warning-box p {
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.text-muted {
  color: #9ca3af;
  font-size: 0.875rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
}

.btn-secondary,
.btn-danger {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-secondary {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Toast */
.toast-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  max-width: 400px;
  z-index: 2000;
}

.toast-notification i {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.toast-notification.success {
  border-left: 4px solid #10b981;
}

.toast-notification.success i {
  color: #10b981;
}

.toast-notification.error {
  border-left: 4px solid #ef4444;
}

.toast-notification.error i {
  color: #ef4444;
}

.toast-notification strong {
  display: block;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.toast-notification p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

/* Transitions */
.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s;
}

.toast-enter-from,
.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-primary {
    width: 100%;
  }

  .templates-grid {
    grid-template-columns: 1fr;
  }

  .template-actions {
    flex-wrap: wrap;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }

  .modal-actions {
    flex-direction: column;
  }

  .toast-notification {
    right: 1rem;
    left: 1rem;
    max-width: none;
  }
}
</style>