<template>
  <div class="login-container login-page">
    <!-- Left Side -->
    <div class="login-left">
      <div class="logo">💬</div>
      <h1>Sistema de SMS em Massa</h1>
      <p>Envie mensagens de forma rápida, eficiente e automatizada para seus clientes.</p>

      <div class="features">
        <div class="feature-item">Envio em massa ilimitado</div>
        <div class="feature-item">Agendamento automático</div>
        <div class="feature-item">Relatórios detalhados</div>
        <div class="feature-item">API de integração</div>
      </div>
    </div>

    <!-- Right Side -->
    <div class="login-right">
      <div class="login-header">
        <h2>Bem-vindo de volta!</h2>
        <p>Entre com suas credenciais para acessar o sistema</p>
      </div>

      <!-- Status Message -->
      <div v-if="statusMessage" :class="['status-message', statusType]">
        {{ statusMessage }}
      </div>

      <form @submit.prevent="handleLogin">
        <!-- Email -->
        <div class="form-group">
          <label for="email">Email</label>
          <div class="input-wrapper">
            <span class="input-icon">📧</span>
            <input
              type="email"
              id="email"
              v-model="form.email"
              class="form-control"
              placeholder="seu@email.com"
              required
              autofocus
              autocomplete="username"
            />
          </div>
          <span class="error-message" :class="{ active: errors.email }">{{ errors.email }}</span>
        </div>

        <!-- Password -->
        <div class="form-group">
          <label for="password">Senha</label>
          <div class="input-wrapper">
            <span class="input-icon">🔒</span>
            <input
              type="password"
              id="password"
              v-model="form.password"
              class="form-control"
              placeholder="Digite sua senha"
              required
              autocomplete="current-password"
            />
          </div>
          <span class="error-message" :class="{ active: errors.password }">{{ errors.password }}</span>
        </div>

        <!-- Remember Me & Forgot Password -->
        <div class="remember-forgot">
          <div class="remember-me">
            <input type="checkbox" id="remember_me" v-model="form.remember" />
            <label for="remember_me">Lembrar-me</label>
          </div>
          <router-link to="/forgot-password" class="forgot-password">
            Esqueceu a senha?
          </router-link>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn-login" :disabled="isLoading">
          <span v-if="!isLoading">Entrar no Sistema</span>
          <span v-else>
            <i class="fas fa-spinner fa-spin"></i> Entrando...
          </span>
        </button>

        <!-- Register Link -->
        <div class="register-link">
          Não tem uma conta? <router-link to="/register">Criar conta agora</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Login',
  data() {
    return {
      form: {
        email: '',
        password: '',
        remember: false
      },
      errors: {
        email: '',
        password: ''
      },
      statusMessage: '',
      statusType: '',
      isLoading: false
    };
  },
  methods: {
    validateForm() {
      this.errors = {
        email: '',
        password: ''
      };

      let isValid = true;

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.form.email) {
        this.errors.email = 'Por favor, insira seu email';
        isValid = false;
      } else if (!emailRegex.test(this.form.email)) {
        this.errors.email = 'Por favor, insira um email válido';
        isValid = false;
      }

      if (!this.form.password) {
        this.errors.password = 'Por favor, insira sua senha';
        isValid = false;
      } else if (this.form.password.length < 6) {
        this.errors.password = 'A senha deve ter no mínimo 6 caracteres';
        isValid = false;
      }

      return isValid;
    },

    async handleLogin() {
      if (!this.validateForm()) {
        return;
      }

      this.isLoading = true;
      this.statusMessage = '';
      this.statusType = '';

      try {
        const response = await axios.post('https://api.devsms.online/api/v1/auth/login', {
          email: this.form.email,
          password: this.form.password
        }, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        console.log('✅ Login bem-sucedido:', response.data);

        const token = response.data.token || 
                     response.data.access_token || 
                     response.data.data?.token ||
                     response.data.data?.access_token;
        
        if (!token) {
          console.error('❌ Token não encontrado');
          this.statusMessage = 'Erro: Token de autenticação não recebido';
          this.statusType = 'error';
          this.isLoading = false;
          return;
        }

        console.log('✅ Token:', token.substring(0, 20) + '...');

        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('user_type');

        localStorage.setItem('auth_token', token);
        localStorage.setItem('user_type', 'company');
        
        const userData = response.data.user || 
                        response.data.data?.user || 
                        response.data;
        
        if (userData) {
          localStorage.setItem('user_data', JSON.stringify(userData));
        }

        if (this.form.remember) {
          localStorage.setItem('remember_email', this.form.email);
        } else {
          localStorage.removeItem('remember_email');
        }

        this.statusMessage = 'Login realizado com sucesso!';
        this.statusType = 'success';

        console.log('✅ Dados salvos. Redirecionando...');

        await new Promise(resolve => setTimeout(resolve, 100));

        console.log('🚀 Redirecionando para /dashboard');

        this.$nextTick(() => {
          this.$router.push('/dashboard').then(() => {
            console.log('✅ Redirecionamento concluído');
          }).catch(err => {
            console.error('❌ Erro no redirecionamento:', err);
            window.location.href = '/#/dashboard';
          });
        });

      } catch (error) {
        console.error('❌ Erro no login:', error);

        if (error.response) {
          if (error.response.status === 401) {
            this.statusMessage = 'Email ou senha incorretos.';
            this.statusType = 'error';
          } else if (error.response.status === 422) {
            if (error.response.data.errors) {
              this.errors = {
                email: error.response.data.errors.email?.[0] || '',
                password: error.response.data.errors.password?.[0] || ''
              };
            }
            this.statusMessage = error.response.data.message || 'Dados inválidos.';
            this.statusType = 'error';
          } else if (error.response.status === 403) {
            this.statusMessage = 'Acesso negado.';
            this.statusType = 'error';
          } else {
            this.statusMessage = error.response.data.message || 'Erro ao fazer login.';
            this.statusType = 'error';
          }
        } else if (error.request) {
          this.statusMessage = 'Erro de conexão. Verifique sua internet.';
          this.statusType = 'error';
        } else {
          this.statusMessage = 'Erro ao processar requisição.';
          this.statusType = 'error';
        }
        
        this.isLoading = false;
      }
    }
  },
  mounted() {
    if (this.$route.query.logout === 'true') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_type');
      localStorage.removeItem('user_data');
      this.statusMessage = 'Você foi desconectado com sucesso.';
      this.statusType = 'success';
    }
    
    const rememberedEmail = localStorage.getItem('remember_email');
    if (rememberedEmail) {
      this.form.email = rememberedEmail;
      this.form.remember = true;
    }
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #070708ff, #eedf09ff);
  padding: 20px;
}

.login-container {
  display: flex;
  max-width: 1000px;
  width: 100%;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.login-left {
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

.login-left::before {
  content: '';
  position: absolute;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  top: -50px;
  right: -50px;
}

.login-left::after {
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

.login-left h1 {
  font-size: 32px;
  margin-bottom: 15px;
  position: relative;
  z-index: 1;
}

.login-left p {
  font-size: 16px;
  line-height: 1.6;
  opacity: 0.9;
  position: relative;
  z-index: 1;
}

.features {
  margin-top: 40px;
  position: relative;
  z-index: 1;
}

.feature-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.feature-item::before {
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

.login-right {
  flex: 1;
  padding: 60px 50px;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h2 {
  color: #333;
  font-size: 28px;
  margin-bottom: 10px;
}

.login-header p {
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

.form-group {
  margin-bottom: 25px;
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
  color: #667eea;
  font-size: 18px;
  z-index: 1;
}

.form-control {
  width: 100%;
  padding: 14px 15px 14px 45px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 15px;
  transition: all 0.3s ease;
  outline: none;
}

.form-control:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.error-message {
  color: #e74c3c;
  font-size: 13px;
  margin-top: 5px;
  display: none;
}

.error-message.active {
  display: block;
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
}

.remember-me {
  display: flex;
  align-items: center;
}

.remember-me input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  cursor: pointer;
  accent-color: #667eea;
}

.remember-me label {
  color: #666;
  font-size: 14px;
  cursor: pointer;
  margin: 0;
}

.forgot-password {
  color: #667eea;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #764ba2;
}

.btn-login {
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
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.btn-login:active:not(:disabled) {
  transform: translateY(0);
}

.btn-login:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
}

.register-link a {
  color: #ff1e00ff;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.register-link a:hover {
  color: #764ba2;
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }

  .login-left {
    padding: 40px 30px;
  }

  .login-right {
    padding: 40px 30px;
  }

  .login-left h1 {
    font-size: 24px;
  }

  .logo {
    font-size: 36px;
  }
}
</style>