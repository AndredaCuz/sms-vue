<template>

    <navegacao/>
  <div class="criar-empresa-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h1 class="page-title">
            <i class="fas fa-building"></i>
            Cadastrar Nova Empresa
          </h1>
          <p class="page-subtitle">Preencha os dados da empresa e do administrador</p>
        </div>
        <router-link to="/lista_empresa" class="btn-back">
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

    <!-- Form -->
    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        
        <!-- Dados da Empresa -->
        <div class="form-section">
          <div class="section-header">
            <i class="fas fa-building"></i>
            <h2>Dados da Empresa</h2>
          </div>
          
          <div class="form-grid">
            <!-- Nome da Empresa -->
            <div class="form-group">
              <label for="name">
                Nome da Empresa <span class="required">*</span>
              </label>
              <div class="input-wrapper">
                <i class="fas fa-building"></i>
                <input
                  type="text"
                  id="name"
                  v-model="form.name"
                  placeholder="Ex: Minha Empresa LTDA"
                  required
                  :disabled="isLoading"
                />
              </div>
              <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
            </div>

            <!-- Email da Empresa -->
            <div class="form-group">
              <label for="email">
                Email da Empresa <span class="required">*</span>
              </label>
              <div class="input-wrapper">
                <i class="fas fa-envelope"></i>
                <input
                  type="email"
                  id="email"
                  v-model="form.email"
                  placeholder="empresa@example.com"
                  required
                  :disabled="isLoading"
                />
              </div>
              <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
            </div>

            <!-- Telefone -->
            <div class="form-group">
              <label for="phone">
                Telefone <span class="required">*</span>
              </label>
              <div class="input-wrapper">
                <i class="fas fa-phone"></i>
                <input
                  type="tel"
                  id="phone"
                  v-model="form.phone"
                  placeholder="923456789"
                  required
                  :disabled="isLoading"
                />
              </div>
              <span v-if="errors.phone" class="error-text">{{ errors.phone }}</span>
            </div>

            <!-- NIF -->
            <div class="form-group">
              <label for="nif">
                NIF <span class="required">*</span>
              </label>
              <div class="input-wrapper">
                <i class="fas fa-id-card"></i>
                <input
                  type="text"
                  id="nif"
                  v-model="form.nif"
                  placeholder="123456789"
                  required
                  :disabled="isLoading"
                />
              </div>
              <span v-if="errors.nif" class="error-text">{{ errors.nif }}</span>
            </div>

            <!-- Status -->
            <div class="form-group">
              <label for="status">
                Status Inicial <span class="required">*</span>
              </label>
              <div class="input-wrapper">
                <i class="fas fa-toggle-on"></i>
                <select
                  id="status"
                  v-model="form.status"
                  required
                  :disabled="isLoading"
                >
                  <option value="active">Ativo</option>
                  <option value="suspended">Suspenso</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
              <span v-if="errors.status" class="error-text">{{ errors.status }}</span>
            </div>
          </div>
        </div>

        <!-- Dados do Administrador -->
        <div class="form-section">
          <div class="section-header">
            <i class="fas fa-user-shield"></i>
            <h2>Dados do Administrador</h2>
          </div>
          
          <div class="form-grid">
            <!-- Nome do Admin -->
            <div class="form-group">
              <label for="admin_name">
                Nome do Administrador <span class="required">*</span>
              </label>
              <div class="input-wrapper">
                <i class="fas fa-user"></i>
                <input
                  type="text"
                  id="admin_name"
                  v-model="form.admin_name"
                  placeholder="João Silva"
                  required
                  :disabled="isLoading"
                />
              </div>
              <span v-if="errors.admin_name" class="error-text">{{ errors.admin_name }}</span>
            </div>

            <!-- Email do Admin -->
            <div class="form-group">
              <label for="admin_email">
                Email do Administrador <span class="required">*</span>
              </label>
              <div class="input-wrapper">
                <i class="fas fa-envelope"></i>
                <input
                  type="email"
                  id="admin_email"
                  v-model="form.admin_email"
                  placeholder="admin@example.com"
                  required
                  :disabled="isLoading"
                />
              </div>
              <span v-if="errors.admin_email" class="error-text">{{ errors.admin_email }}</span>
            </div>

            <!-- Senha do Admin -->
            <div class="form-group">
              <label for="admin_password">
                Senha do Administrador <span class="required">*</span>
              </label>
              <div class="input-wrapper">
                <i class="fas fa-lock"></i>
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="admin_password"
                  v-model="form.admin_password"
                  placeholder="Mínimo 8 caracteres"
                  required
                  minlength="8"
                  :disabled="isLoading"
                />
                <button
                  type="button"
                  class="toggle-password"
                  @click="showPassword = !showPassword"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
              <span v-if="errors.admin_password" class="error-text">{{ errors.admin_password }}</span>
              <small class="help-text">A senha deve ter no mínimo 8 caracteres</small>
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
            <i v-if="!isLoading" class="fas fa-save"></i>
            <i v-else class="fas fa-spinner fa-spin"></i>
            {{ isLoading ? 'Cadastrando...' : 'Cadastrar Empresa' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import navegacao from '../../components/navegacao.vue';

export default {
  name: 'CriarEmpresa',
  components:{
    navegacao

  },
  data() {
    return {
      form: {
        name: '',
        email: '',
        phone: '',
        nif: '',
        status: 'active',
        admin_name: '',
        admin_email: '',
        admin_password: ''
      },
      errors: {},
      statusMessage: '',
      statusType: '',
      isLoading: false,
      showPassword: false
    };
  },
  methods: {
    validateForm() {
      this.errors = {};
      let isValid = true;

      // Validar nome da empresa
      if (!this.form.name || this.form.name.trim().length < 3) {
        this.errors.name = 'Nome deve ter pelo menos 3 caracteres';
        isValid = false;
      }

      // Validar email da empresa
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.form.email)) {
        this.errors.email = 'Email inválido';
        isValid = false;
      }

      // Validar telefone
      if (!this.form.phone || this.form.phone.length < 9) {
        this.errors.phone = 'Telefone deve ter pelo menos 9 dígitos';
        isValid = false;
      }

      // Validar NIF
      if (!this.form.nif || this.form.nif.length < 9) {
        this.errors.nif = 'NIF deve ter pelo menos 9 dígitos';
        isValid = false;
      }

      // Validar nome do admin
      if (!this.form.admin_name || this.form.admin_name.trim().length < 3) {
        this.errors.admin_name = 'Nome deve ter pelo menos 3 caracteres';
        isValid = false;
      }

      // Validar email do admin
      if (!emailRegex.test(this.form.admin_email)) {
        this.errors.admin_email = 'Email inválido';
        isValid = false;
      }

      // Validar senha
      if (!this.form.admin_password || this.form.admin_password.length < 8) {
        this.errors.admin_password = 'Senha deve ter pelo menos 8 caracteres';
        isValid = false;
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

      try {
        const response = await axios.post(
          'https://api.devsms.online/api/v1/admin/companies',
          this.form,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );

        console.log('✅ Empresa criada com sucesso:', response.data);

        this.statusMessage = 'Empresa cadastrada com sucesso!';
        this.statusType = 'success';

        // Aguardar 1.5 segundos e redirecionar
        setTimeout(() => {
          this.$router.push('/lista_empresa');
        }, 1500);

      } catch (error) {
        console.error('❌ Erro ao criar empresa:', error);

        if (error.response) {
          // Erros de validação da API
          if (error.response.status === 422 && error.response.data.errors) {
            this.errors = error.response.data.errors;
            this.statusMessage = 'Verifique os campos marcados em vermelho';
            this.statusType = 'error';
          } else {
            this.statusMessage = error.response.data.message || 'Erro ao cadastrar empresa';
            this.statusType = 'error';
          }
        } else {
          this.statusMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
          this.statusType = 'error';
        }

        this.isLoading = false;
      }
    },

    handleCancel() {
      if (confirm('Deseja realmente cancelar? Os dados não serão salvos.')) {
        this.$router.push('/lista_empresa');
      }
    }
  }
};
</script>

<style scoped>
.criar-empresa-page {
  padding: 2rem;
  max-width: 1400px;
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
  color: #F59E0B;
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
  border-bottom: 2px solid #F59E0B;
}

.section-header i {
  font-size: 1.5rem;
  color: #F59E0B;
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
}

.input-wrapper input,
.input-wrapper select {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  font-size: 0.938rem;
  transition: all 0.2s;
}

.input-wrapper input:focus,
.input-wrapper select:focus {
  outline: none;
  border-color: #F59E0B;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.input-wrapper input:disabled,
.input-wrapper select:disabled {
  background: #F3F4F6;
  cursor: not-allowed;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: #F59E0B;
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
  background: linear-gradient(135deg, #F59E0B, #D97706);
  color: white;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.btn-submit:hover:not(:disabled) {
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
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

@media (max-width: 768px) {
  .criar-empresa-page {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .btn-back {
    width: 100%;
    justify-content: center;
  }

  .form-section {
    padding: 1.5rem 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
    padding: 1rem;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
    justify-content: center;
  }
}
</style>