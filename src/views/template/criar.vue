<template>
  <navegacao/>
  
  <div class="page-container fade-in">
    
    <!-- Header -->
    <div class="page-header">
      <button class="btn-back" @click="goBack">
        <i class="fas fa-arrow-left"></i>
        Voltar
      </button>
      <h1 class="page-title">
        <i class="fas fa-file-alt"></i>
        {{ isEditMode ? 'Editar Template' : 'Criar Novo Template' }}
      </h1>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Carregando template...</p>
    </div>

    <!-- Form -->
    <div v-else class="form-container">
      
      <!-- Card Principal -->
      <div class="form-card">
        <div class="card-header">
          <h2>Informações do Template</h2>
          <p>Preencha os campos abaixo para criar seu template</p>
        </div>

        <div class="card-body">
          
          <!-- Nome do Template -->
          <div class="form-group">
            <label class="form-label required">
              <i class="fas fa-tag"></i>
              Nome do Template
            </label>
            <input 
              type="text" 
              v-model="form.name" 
              class="form-input"
              placeholder="Ex: Lembrete de Pagamento"
              maxlength="100"
            >
            <span class="form-hint">{{ form.name.length }}/100 caracteres</span>
          </div>

          <!-- Mensagem do Template -->
          <div class="form-group">
            <label class="form-label required">
              <i class="fas fa-comment-alt"></i>
              Mensagem do Template
            </label>
            <textarea 
              v-model="form.body" 
              class="form-textarea"
              placeholder="Digite a mensagem do seu template. Use {variavel} para inserir variáveis dinâmicas."
              rows="6"
              @input="detectVariables"
            ></textarea>
            <div class="char-counter">
              <span :class="{ 'text-danger': form.body.length > 160 }">
                {{ form.body.length }}/160 caracteres
              </span>
              <span class="sms-count">
                <i class="fas fa-sms"></i>
                {{ calculateSMSCount() }} SMS
              </span>
            </div>
          </div>

          <!-- Variáveis Detectadas -->
          <div class="form-group" v-if="detectedVariables.length > 0">
            <label class="form-label">
              <i class="fas fa-code"></i>
              Variáveis Detectadas
            </label>
            <div class="variables-detected">
              <div 
                v-for="(variable, index) in detectedVariables" 
                :key="index"
                class="variable-chip"
              >
                <span class="variable-name">{{ '{' + suggestion+ '}' }}</span>
                <button 
                  type="button" 
                  class="variable-remove"
                  @click="removeVariable(variable)"
                  title="Remover do template"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
            <p class="form-hint">
              <i class="fas fa-info-circle"></i>
              Estas variáveis serão substituídas pelos valores reais no momento do envio
            </p>
          </div>

          <!-- Sugestões de Variáveis -->
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-lightbulb"></i>
              Variáveis Sugeridas
            </label>
            <div class="variables-suggestions">
              <button 
                v-for="suggestion in variableSuggestions" 
                :key="suggestion"
                type="button"
                class="suggestion-btn"
                @click="insertVariable(suggestion)"
              >
                <i class="fas fa-plus"></i>
                
                  {{ '{' + suggestion+ '}' }}
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- Card de Preview -->
      <div class="preview-card">
        <div class="card-header">
          <h2>
            <i class="fas fa-eye"></i>
            Pré-visualização
          </h2>
          <p>Veja como seu template ficará</p>
        </div>

        <div class="card-body">
          <div class="phone-mockup">
            <div class="phone-header">
              <div class="phone-time">14:32</div>
              <div class="phone-icons">
                <i class="fas fa-signal"></i>
                <i class="fas fa-wifi"></i>
                <i class="fas fa-battery-three-quarters"></i>
              </div>
            </div>
            
            <div class="phone-body">
              <div class="message-bubble">
                <p>{{ previewMessage }}</p>
                <div class="message-time">Agora</div>
              </div>
            </div>
          </div>

          <!-- Estatísticas -->
          <div class="preview-stats">
            <div class="stat-item">
              <i class="fas fa-font"></i>
              <div>
                <strong>{{ form.body.length }}</strong>
                <span>Caracteres</span>
              </div>
            </div>
            <div class="stat-item">
              <i class="fas fa-sms"></i>
              <div>
                <strong>{{ calculateSMSCount() }}</strong>
                <span>SMS</span>
              </div>
            </div>
            <div class="stat-item">
              <i class="fas fa-code"></i>
              <div>
                <strong>{{ detectedVariables.length }}</strong>
                <span>Variáveis</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ações -->
      <div class="form-actions">
        <button 
          type="button" 
          class="btn-secondary" 
          @click="goBack"
        >
          <i class="fas fa-times"></i>
          Cancelar
        </button>
        <button 
          type="button" 
          class="btn-primary" 
          @click="saveTemplate"
          :disabled="!isFormValid || isProcessing"
        >
          <i class="fas" :class="isProcessing ? 'fa-spinner fa-spin' : 'fa-save'"></i>
          {{ isProcessing ? 'Salvando...' : (isEditMode ? 'Atualizar Template' : 'Criar Template') }}
        </button>
      </div>

    </div>

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
  name: 'CreateEditTemplate',
  components: {
    navegacao
  },
  data() {
    return {
      isLoading: false,
      isProcessing: false,
      isEditMode: false,
      showToast: false,
      toastType: 'success',
      toastTitle: '',
      toastMessage: '',
      form: {
        name: '',
        body: '',
        variables: []
      },
      detectedVariables: [],
      variableSuggestions: [
        'nome',
        'valor',
        'data',
        'telefone',
        'empresa',
        'produto',
        'codigo',
        'link',
        'horario',
        'endereco'
      ]
    };
  },
  computed: {
    isFormValid() {
      return this.form.name.trim() !== '' && this.form.body.trim() !== '';
    },
    previewMessage() {
      if (!this.form.body) return 'Sua mensagem aparecerá aqui...';
      
      let preview = this.form.body;
      this.detectedVariables.forEach(variable => {
        preview = preview.replace(new RegExp(`\\{${variable}\\}`, 'g'), `[${variable}]`);
      });
      
      return preview;
    }
  },
  methods: {
    async loadTemplate() {
      if (!this.isEditMode) return;

      this.isLoading = true;
      const token = localStorage.getItem('auth_token');
      const templateId = this.$route.params.id;

      try {
        const response = await axios.get(`https://api.devsms.online/api/v1/templates/${templateId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        const template = response.data.data;
        this.form.name = template.name;
        this.form.body = template.body;
        this.form.variables = template.variables || [];
        this.detectVariables();

      } catch (error) {
        console.error('Erro ao carregar template:', error);
        this.showToastNotification('error', 'Erro', 'Não foi possível carregar o template');
        this.goBack();
      } finally {
        this.isLoading = false;
      }
    },

    async saveTemplate() {
      this.isProcessing = true;
      const token = localStorage.getItem('auth_token');

      try {
        const payload = {
          name: this.form.name,
          body: this.form.body,
          variables: this.detectedVariables
        };

        if (this.isEditMode) {
          const templateId = this.$route.params.id;
          await axios.put(`https://api.devsms.online/api/v1/templates/${templateId}`, payload, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          this.showToastNotification('success', 'Sucesso!', 'Template atualizado com sucesso');
        } else {
          await axios.post('https://api.devsms.online/api/v1/templates', payload, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          });
          this.showToastNotification('success', 'Sucesso!', 'Template criado com sucesso');
        }

        setTimeout(() => {
          this.goBack();
        }, 1500);

      } catch (error) {
        console.error('Erro ao salvar template:', error);
        this.showToastNotification('error', 'Erro', error.response?.data?.message || 'Não foi possível salvar o template');
      } finally {
        this.isProcessing = false;
      }
    },

    detectVariables() {
      const regex = /\{([a-zA-Z0-9_]+)\}/g;
      const matches = [...this.form.body.matchAll(regex)];
      this.detectedVariables = [...new Set(matches.map(match => match[1]))];
    },

    insertVariable(variable) {
      const cursorPos = this.$el.querySelector('.form-textarea').selectionStart;
      const textBefore = this.form.body.substring(0, cursorPos);
      const textAfter = this.form.body.substring(cursorPos);
      
      this.form.body = textBefore + `{${variable}}` + textAfter;
      this.detectVariables();

      this.$nextTick(() => {
        const textarea = this.$el.querySelector('.form-textarea');
        const newPos = cursorPos + variable.length + 2;
        textarea.focus();
        textarea.setSelectionRange(newPos, newPos);
      });
    },

    removeVariable(variable) {
      const regex = new RegExp(`\\{${variable}\\}`, 'g');
      this.form.body = this.form.body.replace(regex, '');
      this.detectVariables();
    },

    calculateSMSCount() {
      const length = this.form.body.length;
      if (length === 0) return 0;
      if (length <= 160) return 1;
      return Math.ceil(length / 153);
    },

    goBack() {
      this.$router.push('/lista_template');
    },

    showToastNotification(type, title, message) {
      this.toastType = type;
      this.toastTitle = title;
      this.toastMessage = message;
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 3000);
    }
  },
  mounted() {
    this.isEditMode = !!this.$route.params.id;
    if (this.isEditMode) {
      this.loadTemplate();
    }
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
  margin-bottom: 2rem;
}

.btn-back {
  padding: 0.75rem 1rem;
  background: #f3f4f6;
  color: #6b7280;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.btn-back:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

.form-container {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  align-items: start;
}

.form-card,
.preview-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.card-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.card-header p {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.card-body {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
  font-size: 0.9375rem;
}

.form-label.required::after {
  content: '*';
  color: #ef4444;
  margin-left: 0.25rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s;
  font-family: inherit;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.form-hint {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: #6b7280;
}

.char-counter {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: #6b7280;
}

.text-danger {
  color: #ef4444;
  font-weight: 600;
}

.sms-count {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-weight: 600;
  color: #667eea;
}

.variables-detected {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.variable-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  font-size: 0.875rem;
}

.variable-name {
  display: flex;
  align-items: center;
}

.variable-remove {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  font-size: 0.75rem;
}

.variable-remove:hover {
  background: rgba(255, 255, 255, 0.3);
}

.variables-suggestions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.suggestion-btn {
  padding: 0.5rem 1rem;
  border: 2px solid #e5e7eb;
  background: white;
  color: #667eea;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.suggestion-btn:hover {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea10, #764ba210);
  transform: translateY(-2px);
}

.phone-mockup {
  background: #1f2937;
  border-radius: 30px;
  padding: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  margin-bottom: 1.5rem;
}

.phone-header {
  display: flex;
  justify-content: space-between;
  color: white;
  font-size: 0.75rem;
  margin-bottom: 1rem;
  padding: 0 0.5rem;
}

.phone-icons {
  display: flex;
  gap: 0.5rem;
}

.phone-body {
  background: #e5e7eb;
  border-radius: 20px;
  padding: 1.5rem;
  min-height: 200px;
}

.message-bubble {
  background: white;
  padding: 1rem;
  border-radius: 18px 18px 18px 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 85%;
}

.message-bubble p {
  margin: 0;
  color: #1f2937;
  line-height: 1.5;
  word-wrap: break-word;
}

.message-time {
  font-size: 0.6875rem;
  color: #6b7280;
  margin-top: 0.5rem;
  text-align: right;
}

.preview-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f9fafb;
  border-radius: 12px;
}

.stat-item i {
  font-size: 1.5rem;
  color: #667eea;
}

.stat-item strong {
  display: block;
  font-size: 1.25rem;
  color: #1f2937;
}

.stat-item span {
  font-size: 0.75rem;
  color: #6b7280;
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.btn-secondary,
.btn-primary {
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-primary:disabled {
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
@media (max-width: 1024px) {
  .form-container {
    grid-template-columns: 1fr;
  }

  .form-actions {
    grid-column: 1;
  }
}

@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }

  .card-body {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-secondary,
  .btn-primary {
    width: 100%;
  }

  .preview-stats {
    grid-template-columns: 1fr;
  }

  .toast-notification {
    right: 1rem;
    left: 1rem;
    max-width: none;
  }
}
</style>