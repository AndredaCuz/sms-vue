<template>
  <div class="register-container">
    <div class="register-left">
      <div class="logo">💬</div>
      <h1>Comece Gratuitamente</h1>
      <p>Crie sua conta e comece a enviar mensagens SMS em massa de forma profissional e automatizada.</p>

      <div class="benefits">
        <div class="benefit-item">Teste grátis por 14 dias</div>
        <div class="benefit-item">Sem necessidade de cartão</div>
        <div class="benefit-item">Suporte técnico incluído</div>
        <div class="benefit-item">Configuração rápida</div>
        <div class="benefit-item">API completa disponível</div>
      </div>
    </div>

    <div class="register-right">
      <div class="register-header">
        <h2>Criar Conta</h2>
        <p>Preencha os dados abaixo para começar</p>
      </div>

      <!-- Status Message -->
      <div v-if="statusMessage" :class="['status-message', statusType]">{{ statusMessage }}</div>

      <form @submit.prevent="submitForm">
        <div class="form-row">
          <!-- Nome do Administrador -->
          <div class="form-group">
            <label for="admin_name">Nome do Administrador</label>
            <div class="input-wrapper">
              <span class="input-icon">👤</span>
              <input
                type="text"
                id="admin_name"
                v-model="form.admin_name"
                class="form-control"
                placeholder="Seu nome completo"
                required
                autofocus
              />
            </div>
            <span class="error-message" v-if="errors.admin_name">{{ errors.admin_name }}</span>
          </div>

          <!-- Email do Administrador -->
          <div class="form-group">
            <label for="admin_email">Email do Administrador</label>
            <div class="input-wrapper">
              <span class="input-icon">📧</span>
              <input
                type="email"
                id="admin_email"
                v-model="form.admin_email"
                class="form-control"
                placeholder="seu@email.com"
                required
              />
            </div>
            <span class="error-message" v-if="errors.admin_email">{{ errors.admin_email }}</span>
          </div>
        </div>

        <div class="form-row">
          <!-- Nome da Empresa -->
          <div class="form-group">
            <label for="company_name">Nome da Empresa</label>
            <div class="input-wrapper">
              <span class="input-icon">🏢</span>
              <input
                type="text"
                id="company_name"
                v-model="form.company_name"
                class="form-control"
                placeholder="Nome da sua empresa"
                required
              />
            </div>
            <span class="error-message" v-if="errors.company_name">{{ errors.company_name }}</span>
          </div>

          <!-- Email da Empresa -->
          <div class="form-group">
            <label for="company_email">Email da Empresa</label>
            <div class="input-wrapper">
              <span class="input-icon">📧</span>
              <input
                type="email"
                id="company_email"
                v-model="form.company_email"
                class="form-control"
                placeholder="empresa@email.com"
                required
              />
            </div>
            <span class="error-message" v-if="errors.company_email">{{ errors.company_email }}</span>
          </div>
        </div>

        <div class="form-row">
          <!-- Telefone da Empresa -->
          <div class="form-group">
            <label for="company_phone">Telefone da Empresa</label>
            <div class="input-wrapper">
              <span class="input-icon">📱</span>
              <input
                type="tel"
                id="company_phone"
                v-model="form.company_phone"
                class="form-control"
                placeholder="+244 9XX XXX XXX"
                @input="formatTelefone"
                required
              />
            </div>
            <span class="error-message" v-if="errors.company_phone">{{ errors.company_phone }}</span>
          </div>

          <!-- NIF -->
          <div class="form-group">
            <label for="nif">NIF</label>
            <div class="input-wrapper">
              <span class="input-icon">🆔</span>
              <input
                type="text"
                id="nif"
                v-model="form.nif"
                class="form-control"
                placeholder="Número de identificação fiscal"
                required
              />
            </div>
            <span class="error-message" v-if="errors.nif">{{ errors.nif }}</span>
          </div>
        </div>

        <div class="form-row">
          <!-- Senha -->
          <div class="form-group">
            <label for="password">Senha</label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input
                type="password"
                id="password"
                v-model="form.password"
                class="form-control"
                placeholder="Mínimo 8 caracteres"
                @input="checkPasswordStrength"
                required
              />
            </div>
            <div class="password-strength" :class="passwordStrengthClass">
              <div class="password-strength-bar"></div>
            </div>
            <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
          </div>

          <!-- Confirmar Senha -->
          <div class="form-group">
            <label for="password_confirmation">Confirmar Senha</label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input
                type="password"
                id="password_confirmation"
                v-model="form.password_confirmation"
                class="form-control"
                placeholder="Repita a senha"
                required
              />
            </div>
            <span class="error-message" v-if="errors.password_confirmation">{{ errors.password_confirmation }}</span>
          </div>
        </div>

        <!-- Plano -->
        <div class="form-group full-width">
          <label for="plan_id">Plano</label>
          <div class="input-wrapper">
            <span class="input-icon">📦</span>
            <select
              id="plan_id"
              v-model="form.plan_id"
              class="form-control"
              required
            >
              <option value="">Selecione um plano</option>
              <option value="1">Plano Básico - Grátis (14 dias)</option>
              <option value="2">Plano Profissional</option>
              <option value="3">Plano Empresarial</option>
            </select>
          </div>
          <span class="error-message" v-if="errors.plan_id">{{ errors.plan_id }}</span>
        </div>

        <!-- Botão -->
        <button type="submit" class="btn-register" :disabled="isLoading">
          <span v-if="!isLoading">Criar Minha Conta</span>
          <span v-else>Processando...</span>
        </button>

        <div class="login-link">
          Já possui uma conta? <router-link to="/login">Faça login aqui</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "Register",
  data() {
    return {
      form: {
        company_name: "",
        company_email: "",
        company_phone: "",
        nif: "",
        admin_name: "",
        admin_email: "",
        password: "",
        password_confirmation: "",
        plan_id: "",
      },
      errors: {},
      statusMessage: "",
      statusType: "",
      passwordStrengthClass: "",
      isLoading: false,
    };
  },
  methods: {
    formatTelefone() {
      let value = this.form.company_phone.replace(/\D/g, "");
      if (value.length > 0) {
        if (value.length <= 3) value = "+244 " + value;
        else if (value.length <= 6) value = "+244 " + value.substring(0, 3) + " " + value.substring(3);
        else if (value.length <= 9)
          value = "+244 " + value.substring(0, 3) + " " + value.substring(3, 6) + " " + value.substring(6);
        else value = "+244 " + value.substring(0, 3) + " " + value.substring(3, 6) + " " + value.substring(6, 9);
      }
      this.form.company_phone = value;
    },
    checkPasswordStrength() {
      const password = this.form.password;
      if (!password) {
        this.passwordStrengthClass = "";
        return;
      }
      let strength = 0;
      if (password.length >= 8) strength++;
      if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
      if (password.match(/[0-9]/)) strength++;
      if (password.match(/[^a-zA-Z0-9]/)) strength++;

      if (strength <= 2) this.passwordStrengthClass = "password-strength active weak";
      else if (strength === 3) this.passwordStrengthClass = "password-strength active medium";
      else this.passwordStrengthClass = "password-strength active strong";
    },
    validateForm() {
      this.errors = {};

      if (this.form.admin_name.length < 3) this.errors.admin_name = "Nome deve ter no mínimo 3 caracteres";
      if (this.form.company_name.length < 2) this.errors.company_name = "Nome da empresa deve ter no mínimo 2 caracteres";
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.form.admin_email)) this.errors.admin_email = "Por favor, insira um email válido";
      if (!emailRegex.test(this.form.company_email)) this.errors.company_email = "Por favor, insira um email válido";
      
      const telefoneNumbers = this.form.company_phone.replace(/\D/g, "");
      if (telefoneNumbers.length < 12) this.errors.company_phone = "Telefone inválido. Use +244 9XX XXX XXX";
      
      if (this.form.nif.length < 5) this.errors.nif = "NIF inválido";
      if (this.form.password.length < 8) this.errors.password = "A senha deve ter no mínimo 8 caracteres";
      if (this.form.password !== this.form.password_confirmation) 
        this.errors.password_confirmation = "As senhas não coincidem";
      if (!this.form.plan_id) this.errors.plan_id = "Por favor, selecione um plano";

      return Object.keys(this.errors).length === 0;
    },
    async submitForm() {
      if (!this.validateForm()) {
        this.statusMessage = "Por favor, corrija os erros no formulário";
        this.statusType = "error";
        return;
      }

      this.isLoading = true;
      this.statusMessage = "";
      this.errors = {};

      try {
        const response = await axios.post('https://api.devsms.online/api/v1/auth/register', this.form, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }
        });

        // Sucesso
        this.statusMessage = "Cadastro realizado com sucesso! Redirecionando...";
        this.statusType = "success";
        
        console.log('Resposta da API:', response.data);

        // Redirecionar após 2 segundos
        setTimeout(() => {
          // Aqui você pode redirecionar para o login ou dashboard
          this.$router.push('/login');
        }, 2000);

      } catch (error) {
        console.error('Erro no cadastro:', error);
        
        if (error.response) {
          // Erros de validação da API
          if (error.response.status === 422 && error.response.data.errors) {
            this.errors = error.response.data.errors;
            this.statusMessage = "Por favor, corrija os erros indicados";
            this.statusType = "error";
          } else {
            this.statusMessage = error.response.data.message || "Erro ao realizar cadastro. Tente novamente.";
            this.statusType = "error";
          }
        } else if (error.request) {
          this.statusMessage = "Erro de conexão. Verifique sua internet e tente novamente.";
          this.statusType = "error";
        } else {
          this.statusMessage = "Erro ao processar requisição. Tente novamente.";
          this.statusType = "error";
        }
      } finally {
        this.isLoading = false;
      }
    },
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.register-container {
  display: flex;
  max-width: 1100px;
  width: 100%;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.register-left {
  flex: 1;
  background: linear-gradient(135deg, #070708ff 0%, #eedf09ff 100%);
  padding: 60px 40px;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.register-left::before {
  content: '';
  position: absolute;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  top: -50px;
  right: -50px;
}

.register-left::after {
  content: '';
  position: absolute;
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  bottom: -30px;
  left: -30px;
}

.logo {
  font-size: 48px;
  margin-bottom: 20px;
  position: relative;
  z-index: 1;
}

.register-left h1 {
  font-size: 32px;
  margin-bottom: 15px;
  position: relative;
  z-index: 1;
}

.register-left p {
  font-size: 16px;
  line-height: 1.6;
  opacity: 0.9;
  position: relative;
  z-index: 1;
}

.benefits {
  margin-top: 40px;
  position: relative;
  z-index: 1;
}

.benefit-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.benefit-item::before {
  content: '✓';
  display: inline-block;
  width: 24px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  text-align: center;
  line-height: 24px;
  margin-right: 12px;
  font-weight: bold;
}

.register-right {
  flex: 1.2;
  padding: 50px 45px;
  max-height: 95vh;
  overflow-y: auto;
}

.register-right::-webkit-scrollbar {
  width: 8px;
}

.register-right::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.register-right::-webkit-scrollbar-thumb {
  background: #f30f35ff;
  border-radius: 10px;
}

.register-header {
  text-align: center;
  margin-bottom: 35px;
}

.register-header h2 {
  color: #333;
  font-size: 28px;
  margin-bottom: 10px;
}

.register-header p {
  color: #666;
  font-size: 14px;
}

.status-message {
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  text-align: center;
  font-weight: 500;
}

.status-message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.status-message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  color: #333;
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 14px;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #ece90aff;
  font-size: 18px;
  z-index: 1;
}

.form-control {
  width: 100%;
  padding: 12px 15px 12px 45px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.3s ease;
  outline: none;
}

select.form-control {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 15px center;
  background-size: 20px;
}

.form-control:focus {
  border-color: #e6e7ebff;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.error-message {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 5px;
  display: block;
}

.password-strength {
  margin-top: 8px;
  height: 4px;
  background: #ec2a2aff;
  border-radius: 2px;
  overflow: hidden;
  display: none;
}

.password-strength.active {
  display: block;
}

.password-strength-bar {
  height: 100%;
  width: 0;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.password-strength.weak .password-strength-bar {
  width: 33%;
  background: #e74c3c;
}

.password-strength.medium .password-strength-bar {
  width: 66%;
  background: #f39c12;
}

.password-strength.strong .password-strength-bar {
  width: 100%;
  background: #27ae60;
}

.btn-register {
  width: 100%;
  padding: 15px;
  background: linear-gradient(135deg, #ff0000ff 0%, #ffd900ff 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  margin-top: 10px;
}

.btn-register:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-register:active:not(:disabled) {
  transform: translateY(0);
}

.btn-register:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
}

.login-link a {
  color: #ff1e00ff;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.login-link a:hover {
  color: #764ba2;
}

@media (max-width: 968px) {
  .form-row {
    grid-template-columns: 1fr;
    gap: 0;
  }
}

@media (max-width: 768px) {
  .register-container {
    flex-direction: column;
  }

  .register-left {
    padding: 40px 30px;
  }

  .register-right {
    padding: 40px 30px;
    max-height: none;
  }

  .register-left h1 {
    font-size: 24px;
  }

  .logo {
    font-size: 36px;
  }
}
</style>