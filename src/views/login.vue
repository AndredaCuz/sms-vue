<template>
  <div class="login-container">
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
      <div v-if="statusMessage" class="status-message active">{{ statusMessage }}</div>

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
          <router-link v-if="hasForgotPassword" to="/forgot-password" class="forgot-password">
            Esqueceu a senha?
          </router-link>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn-login">Entrar no Sistema</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

// Simula a mensagem de status da sessão (antes era Blade @session)
const statusMessage = ref('')

// Para controlar se a rota de "esqueceu a senha" existe
const hasForgotPassword = true

// Dados do formulário
const form = reactive({
  email: '',
  password: '',
  remember: false
})

// Erros
const errors = reactive({
  email: '',
  password: ''
})

const router = useRouter()

// Função de login
function handleLogin() {
  // Reset erros
  errors.email = ''
  errors.password = ''

  let isValid = true

  // Validação simples
  if (!form.email || !form.email.includes('@')) {
    errors.email = 'Por favor, insira um email válido'
    isValid = false
  }

  if (!form.password || form.password.length < 6) {
    errors.password = 'A senha deve ter no mínimo 6 caracteres'
    isValid = false
  }

  if (!isValid) return

  // Aqui você pode chamar API Laravel via axios/fetch
  // Exemplo simulando login:
  console.log('Login enviado', { ...form })

  // Simulando login bem-sucedido:
  statusMessage.value = 'Login realizado com sucesso!'
  setTimeout(() => {
    statusMessage.value = ''
    router.push('/dashboard')
  }, 1500)
}
</script>

<style >
/* Copiei seu CSS original, apenas retirei o corpo e html, já que o Vue monta dentro do root */
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
.btn-login:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}
.btn-login:active {
    transform: translateY(0);
}
.status-message {
    padding: 12px;
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 14px;
}
.status-message.active {
    display: block;
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
