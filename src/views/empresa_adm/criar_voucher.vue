<template>

    <navegacao/>
  <div class="criar-voucher-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <i class="fas fa-ticket-alt"></i>
            Criar Novo Voucher
          </h1>
          <p class="page-subtitle">Gere vouchers de crédito para as empresas</p>
        </div>
        <router-link to="/lista_vouchers" class="btn-back">
          <i class="fas fa-arrow-left"></i>
          Voltar para Lista
        </router-link>
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

<!-- Form Container -->
<div class="form-container">
  <form @submit.prevent="handleSubmit">
    
    <!-- Preview do Voucher -->
    <div class="voucher-preview">
      <div class="preview-header">
        <i class="fas fa-eye"></i>
        <span>Preview do Voucher</span>
      </div>
      <div class="preview-card">
        <div class="preview-ticket">
          <div class="ticket-corner top-left"></div>
          <div class="ticket-corner top-right"></div>
          <div class="ticket-corner bottom-left"></div>
          <div class="ticket-corner bottom-right"></div>
          
          <div class="ticket-content">
            <div class="ticket-icon">
              <i class="fas fa-gift"></i>
            </div>
            <div class="ticket-amount">
              {{ form.amount || '0' }}
              <span class="ticket-currency">créditos</span>
            </div>
            <div class="ticket-description">
              {{ form.description || 'Sem descrição' }}
            </div>
            <div class="ticket-expiry" v-if="form.expires_at">
              <i class="fas fa-clock"></i>
              Válido até {{ formatPreviewDate(form.expires_at) }}
            </div>
            <div class="ticket-code">
              Código será gerado automaticamente
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Formulário -->
    <div class="form-section">
      <div class="section-header">
        <i class="fas fa-edit"></i>
        <h2>Informações do Voucher</h2>
      </div>

      <div class="form-grid">
        <!-- Valor -->
        <div class="form-group">
          <label for="amount">
            Valor em Créditos <span class="required">*</span>
          </label>
          <div class="input-wrapper">
            <i class="fas fa-coins"></i>
            <input
              type="number"
              id="amount"
              v-model.number="form.amount"
              placeholder="Ex: 1000"
              required
              min="1"
              step="1"
              :disabled="isLoading"
            />
            <span class="input-suffix">créditos</span>
          </div>
          <span v-if="errors.amount" class="error-text">{{ errors.amount }}</span>
          <small class="help-text">Quantidade de créditos SMS que o voucher vale</small>
        </div>

        <!-- Data de Expiração -->
        <div class="form-group">
          <label for="expires_at">
            Data de Expiração <span class="required">*</span>
          </label>
          <div class="input-wrapper">
            <i class="fas fa-calendar-alt"></i>
            <input
              type="datetime-local"
              id="expires_at"
              v-model="form.expires_at"
              required
              :min="minDate"
              :disabled="isLoading"
            />
          </div>
          <span v-if="errors.expires_at" class="error-text">{{ errors.expires_at }}</span>
          <small class="help-text">Data e hora em que o voucher expirará</small>
        </div>

        <!-- Descrição -->
        <div class="form-group full-width">
          <label for="description">
            Descrição <span class="required">*</span>
          </label>
          <div class="input-wrapper">
            <i class="fas fa-align-left"></i>
            <textarea
              id="description"
              v-model="form.description"
              placeholder="Ex: Voucher promocional para novos clientes"
              required
              rows="4"
              :disabled="isLoading"
              maxlength="500"
            ></textarea>
          </div>
          <div class="char-counter">
            {{ form.description.length }}/500 caracteres
          </div>
          <span v-if="errors.description" class="error-text">{{ errors.description }}</span>
          <small class="help-text">Breve descrição sobre este voucher</small>
        </div>
      </div>
    </div>

    <!-- Opções Avançadas -->
    <div class="form-section">
      <div class="section-header">
        <i class="fas fa-cog"></i>
        <h2>Opções de Geração</h2>
      </div>

      <div class="form-grid">
        <!-- Quantidade de Vouchers -->
        <div class="form-group">
          <label for="quantity">
            Quantidade de Vouchers
          </label>
          <div class="input-wrapper">
            <i class="fas fa-hashtag"></i>
            <input
              type="number"
              id="quantity"
              v-model.number="quantity"
              placeholder="1"
              min="1"
              max="100"
              :disabled="isLoading"
            />
          </div>
          <small class="help-text">Gerar múltiplos vouchers de uma vez (máx: 100)</small>
        </div>

        <!-- Prefixo do Código -->
        <div class="form-group">
          <label for="code_prefix">
            Prefixo do Código (Opcional)
          </label>
          <div class="input-wrapper">
            <i class="fas fa-tag"></i>
            <input
              type="text"
              id="code_prefix"
              v-model="codePrefix"
              placeholder="Ex: PROMO"
              maxlength="10"
              :disabled="isLoading"
            />
          </div>
          <small class="help-text">Prefixo personalizado para os códigos gerados</small>
        </div>
      </div>

      <!-- Info Box -->
      <div class="info-box">
        <i class="fas fa-info-circle"></i>
        <div class="info-content">
          <strong>Como funciona a geração:</strong>
          <ul>
            <li>Os códigos são gerados automaticamente de forma única</li>
            <li>Se informar um prefixo, ele será adicionado ao início do código</li>
            <li>Cada voucher terá {{ form.amount }} créditos</li>
            <li>Todos compartilharão a mesma descrição e data de expiração</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Botões de Ação -->
    <div class="form-actions">
      <button
        type="button"
        class="btn-cancel"
        @click="handleCancel"
        :disabled="isLoading"
      >
        <i class="fas fa-times"></i>
        Cancelar
      </button>

      <button
        type="submit"
        class="btn-submit"
        :disabled="isLoading"
      >
        <i v-if="!isLoading" class="fas fa-plus-circle"></i>
        <i v-else class="fas fa-spinner fa-spin"></i>
        {{ isLoading ? 'Gerando...' : `Gerar ${quantity > 1 ? quantity + ' Vouchers' : 'Voucher'}` }}
      </button>
    </div>
  </form>
</div>

<!-- Modal de Sucesso com Códigos Gerados -->
<div v-if="showSuccessModal" class="modal-overlay">
  <div class="modal-content success-modal" @click.stop>
    <div class="modal-header success-header">
      <h2>
        <i class="fas fa-check-circle"></i>
        Vouchers Criados com Sucesso!
      </h2>
      <button @click="closeSuccessModal" class="modal-close">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <div class="modal-body">
      <div class="success-summary">
        <div class="summary-item">
          <i class="fas fa-ticket-alt"></i>
          <span>{{ generatedCodes.length }} voucher(s) criado(s)</span>
        </div>
        <div class="summary-item">
          <i class="fas fa-coins"></i>
          <span>{{ form.amount }} créditos cada</span>
        </div>
        <div class="summary-item">
          <i class="fas fa-calendar-check"></i>
          <span>Válido até {{ formatPreviewDate(form.expires_at) }}</span>
        </div>
      </div>

      <div class="generated-codes">
        <div class="codes-header">
          <h3>Códigos Gerados</h3>
          <button @click="copyAllCodes" class="btn-copy-all">
            <i class="fas fa-copy"></i>
            Copiar Todos
          </button>
        </div>
        
        <div class="codes-list">
          <div
            v-for="(code, index) in generatedCodes"
            :key="index"
            class="code-item"
          >
            <span class="code-number">{{ index + 1 }}.</span>
            <span class="code-value">{{ code }}</span>
            <button @click="copyCode(code)" class="btn-copy-single">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="success-actions">
        <button @click="createAnother" class="btn-create-another">
          <i class="fas fa-plus"></i>
          Criar Mais Vouchers
        </button>
        <button @click="goToList" class="btn-go-list">
          <i class="fas fa-list"></i>
          Ir para Lista de Vouchers
        </button>
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
  name: 'CriarVoucher',

  components:{
    navegacao
  },
  data() {
    return {
      form: {
        amount: null,
        description: '',
        expires_at: ''
      },
      errors: {},
      statusMessage: '',
      statusType: '',
      isLoading: false,
      quantity: 1,
      codePrefix: '',
      showSuccessModal: false,
      generatedCodes: []
    };
  },
  computed: {
    minDate() {
      const now = new Date();
      now.setHours(now.getHours() + 1); // Mínimo 1 hora no futuro
      return now.toISOString().slice(0, 16);
    }
  },
  methods: {
    validateForm() {
      this.errors = {};
      let isValid = true;

      // Validar valor
      if (!this.form.amount || this.form.amount < 1) {
        this.errors.amount = 'Valor deve ser maior que zero';
        isValid = false;
      }

      // Validar descrição
      if (!this.form.description || this.form.description.trim().length < 5) {
        this.errors.description = 'Descrição deve ter pelo menos 5 caracteres';
        isValid = false;
      }

      // Validar data de expiração
      if (!this.form.expires_at) {
        this.errors.expires_at = 'Data de expiração é obrigatória';
        isValid = false;
      } else {
        const expiryDate = new Date(this.form.expires_at);
        const now = new Date();
        if (expiryDate <= now) {
          this.errors.expires_at = 'Data de expiração deve ser no futuro';
          isValid = false;
        }
      }

      return isValid;
    },

    async handleSubmit() {
      if (!this.validateForm()) {
        this.statusMessage = 'Por favor, corrija os erros no formulário';
        this.statusType = 'error';
        return;
      }

      this.isLoading = true;
      this.statusMessage = '';
      this.statusType = '';

      const token = localStorage.getItem('auth_token');
      this.generatedCodes = [];

      try {
        // Gerar múltiplos vouchers
        for (let i = 0; i < this.quantity; i++) {
          const response = await axios.post(
            'https://api.devsms.online/api/v1/vouchers',
            this.form,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            }
          );

          const voucherCode = response.data.data?.code || response.data.code;
          if (voucherCode) {
            this.generatedCodes.push(voucherCode);
          }

          console.log(`✅ Voucher ${i + 1} criado:`, response.data);
        }

        this.showSuccessModal = true;

      } catch (error) {
        console.error('❌ Erro ao criar voucher:', error);

        if (error.response && error.response.status === 422) {
          this.errors = error.response.data.errors || {};
          this.statusMessage = 'Verifique os campos marcados em vermelho';
          this.statusType = 'error';
        } else {
          this.statusMessage = error.response?.data?.message || 'Erro ao criar voucher';
          this.statusType = 'error';
        }

        this.isLoading = false;
      } finally {
        if (!this.showSuccessModal) {
          this.isLoading = false;
        }
      }
    },

    handleCancel() {
      if (confirm('Deseja realmente cancelar? Os dados não serão salvos.')) {
        this.$router.push('/lista_vouchers');
      }
    },

    formatPreviewDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-AO', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

    async copyCode(code) {
      try {
        await navigator.clipboard.writeText(code);
        this.statusMessage = 'Código copiado!';
        this.statusType = 'success';
        setTimeout(() => {
          this.statusMessage = '';
        }, 2000);
      } catch (error) {
        console.error('Erro ao copiar código:', error);
      }
    },

    async copyAllCodes() {
      try {
        const allCodes = this.generatedCodes.join('\n');
        await navigator.clipboard.writeText(allCodes);
        this.statusMessage = 'Todos os códigos foram copiados!';
        this.statusType = 'success';
        setTimeout(() => {
          this.statusMessage = '';
        }, 2000);
      } catch (error) {
        console.error('Erro ao copiar códigos:', error);
      }
    },

    closeSuccessModal() {
      this.showSuccessModal = false;
      this.$router.push('/lista_vouchers');
    },

    createAnother() {
      this.showSuccessModal = false;
      this.form = {
        amount: null,
        description: '',
        expires_at: ''
      };
      this.quantity = 1;
      this.codePrefix = '';
      this.generatedCodes = [];
      this.isLoading = false;
    },

    goToList() {
      this.$router.push('/lista_vouchers');
    }
  },
  mounted() {
    // Definir data padrão para 30 dias no futuro
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    this.form.expires_at = futureDate.toISOString().slice(0, 16);
  }
};
</script>
<style scoped>
.criar-voucher-page {
  padding: 2rem;
  max-width: 1200px;
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

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  color: #4B5563;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
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

.form-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Preview do Voucher */
.voucher-preview {
  padding: 2rem;
  background: linear-gradient(135deg, #F9FAFB, #EEF2FF);
  border-bottom: 1px solid #E5E7EB;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  color: #6B7280;
  font-weight: 500;
}

.preview-card {
  display: flex;
  justify-content: center;
}

.preview-ticket {
  position: relative;
  background: linear-gradient(135deg, #d2e908, #ed3a49);
  padding: 2rem;
  border-radius: 16px;
  color: white;
  box-shadow: 0 10px 40px rgba(139, 92, 246, 0.4);
  max-width: 400px;
  width: 100%;
}

.ticket-corner {
  position: absolute;
  width: 20px;
  height: 20px;
  background: #EEF2FF;
  border-radius: 50%;
}

.ticket-corner.top-left {
  top: -10px;
  left: -10px;
}

.ticket-corner.top-right {
  top: -10px;
  right: -10px;
}

.ticket-corner.bottom-left {
  bottom: -10px;
  left: -10px;
}

.ticket-corner.bottom-right {
  bottom: -10px;
  right: -10px;
}

.ticket-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  text-align: center;
}

.ticket-icon {
  font-size: 3rem;
  opacity: 0.9;
}

.ticket-amount {
  font-size: 3rem;
  font-weight: 700;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ticket-currency {
  font-size: 1rem;
  opacity: 0.9;
  font-weight: 500;
}

.ticket-description {
  font-size: 1rem;
  opacity: 0.9;
  max-width: 300px;
}

.ticket-expiry {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  opacity: 0.8;
}

.ticket-code {
  font-family: 'Courier New', monospace;
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed rgba(255, 255, 255, 0.3);
}

.form-section {
  padding: 2rem;
  border-bottom: 1px solid #E5E7EB;
}

.form-section:last-of-type {
  border-bottom: none;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e4e005;
}

.section-header i {
  font-size: 1.5rem;
  color: #d9ff00;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1F2937;
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.938rem;
}

.required {
  color: #EF4444;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper i {
  position: absolute;
  left: 1rem;
  color: #9CA3AF;
  font-size: 1rem;
  z-index: 1;
}

.input-wrapper input,
.input-wrapper textarea {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 0.938rem;
  transition: all 0.2s;
}

.input-wrapper textarea {
  resize: vertical;
  font-family: inherit;
}

.input-wrapper input:focus,
.input-wrapper textarea:focus {
  outline: none;
  border-color: #8B5CF6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
}

.input-wrapper input:disabled,
.input-wrapper textarea:disabled {
  background: #F3F4F6;
  cursor: not-allowed;
}

.input-suffix {
  position: absolute;
  right: 1rem;
  color: #6B7280;
  font-size: 0.875rem;
  font-weight: 500;
  pointer-events: none;
}

.error-text {
  color: #EF4444;
  font-size: 0.813rem;
  margin-top: 0.25rem;
}

.help-text {
  color: #6B7280;
  font-size: 0.813rem;
  margin-top: 0.25rem;
}

.char-counter {
  color: #9CA3AF;
  font-size: 0.75rem;
  margin-top: 0.25rem;
  text-align: right;
}

.info-box {
  background: #EEF2FF;
  border: 1px solid #C7D2FE;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.info-box i {
  color: #6366F1;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.info-content {
  flex: 1;
  color: #000000;
  font-size: 0.875rem;
}

.info-content strong {
  display: block;
  margin-bottom: 0.5rem;
}

.info-content ul {
  margin: 0;
  padding-left: 1.25rem;
}

.info-content li {
  margin-bottom: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: #F9FAFB;
}

.btn-cancel,
.btn-submit {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.938rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background: white;
  color: #4B5563;
  border: 1px solid #D1D5DB;
}

.btn-cancel:hover:not(:disabled) {
  background: #F9FAFB;
  border-color: #9CA3AF;
}

.btn-submit {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: white;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

.btn-submit:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
  transform: translateY(-1px);
}

.btn-submit:active:not(:disabled) {
  transform: translateY(0);
}

.btn-cancel:disabled,
.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Modal de Sucesso */
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
  z-index: 9999;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #E5E7EB;
}

.success-header {
  background: linear-gradient(135deg, #D1FAE5, #A7F3D0);
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.success-header h2 {
  color: #065F46;
}

.modal-header i {
  color: #10B981;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #9CA3AF;
  cursor: pointer;
  transition: color 0.2s;
  position: absolute;
  right: 1.5rem;
}

.modal-close:hover {
  color: #EF4444;
}

.modal-body {
  padding: 2rem;
}

.success-summary {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  justify-content: center;
  flex-wrap: wrap;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: #F3F4F6;
  border-radius: 8px;
  font-size: 0.875rem;
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
  margin-bottom: 2rem;
}

.codes-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.codes-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1F2937;
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
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-copy-all:hover {
  background: #7C3AED;
  transform: translateY(-1px);
}

.codes-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
}

.code-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  transition: all 0.2s;
}

.code-item:hover {
  border-color: #8B5CF6;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.15);
}

.code-number {
  font-weight: 600;
  color: #9CA3AF;
  min-width: 2rem;
}

.code-value {
  flex: 1;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #1F2937;
  font-size: 1rem;
  letter-spacing: 0.5px;
}

.btn-copy-single {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: #F3F4F6;
  color: #6B7280;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.btn-copy-single:hover {
  background: #8B5CF6;
  color: white;
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
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.938rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-create-another {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
  color: white;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.3);
}

.btn-create-another:hover {
  box-shadow: 0 4px 12px rgba(139, 92, 246, 0.4);
  transform: translateY(-1px);
}

.btn-go-list {
  background: white;
  color: #4B5563;
  border: 1px solid #D1D5DB;
}

.btn-go-list:hover {
  background: #F9FAFB;
  border-color: #9CA3AF;
}

/* Scrollbar customizado para lista de códigos */
.codes-list::-webkit-scrollbar {
  width: 6px;
}

.codes-list::-webkit-scrollbar-track {
  background: #F3F4F6;
  border-radius: 3px;
}

.codes-list::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 3px;
}

.codes-list::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}

/* Responsividade */
@media (max-width: 768px) {
  .criar-voucher-page {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .btn-back {
    width: 100%;
    justify-content: center;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .preview-ticket {
    padding: 1.5rem;
  }

  .ticket-amount {
    font-size: 2.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
    justify-content: center;
  }

  .success-summary {
    flex-direction: column;
  }

  .summary-item {
    width: 100%;
    justify-content: center;
  }

  .success-actions {
    flex-direction: column;
  }

  .btn-create-another,
  .btn-go-list {
    width: 100%;
    justify-content: center;
  }

  .codes-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .btn-copy-all {
    width: 100%;
    justify-content: center;
  }

  .modal-content {
    margin: 1rem;
    max-height: calc(100vh - 2rem);
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.25rem;
  }

  .page-subtitle {
    font-size: 0.875rem;
  }

  .ticket-amount {
    font-size: 2rem;
  }

  .ticket-icon {
    font-size: 2.5rem;
  }

  .form-section {
    padding: 1.5rem;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .code-value {
    font-size: 0.875rem;
  }
}

/* Animações */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

.status-alert {
  animation: fadeIn 0.3s ease-out;
}

.modal-overlay {
  animation: fadeIn 0.2s ease-out;
}

.modal-content {
  animation: slideUp 0.3s ease-out;
}

.code-item {
  animation: slideUp 0.2s ease-out;
}

.code-item:nth-child(1) { animation-delay: 0.05s; }
.code-item:nth-child(2) { animation-delay: 0.1s; }
.code-item:nth-child(3) { animation-delay: 0.15s; }
.code-item:nth-child(4) { animation-delay: 0.2s; }
.code-item:nth-child(5) { animation-delay: 0.25s; }

/* Estados de foco melhorados */
button:focus-visible,
input:focus-visible,
textarea:focus-visible {
  outline: 2px solid #8B5CF6;
  outline-offset: 2px;
}

/* Loading spinner animation */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.fa-spinner {
  animation: spin 1s linear infinite;
}
</style>