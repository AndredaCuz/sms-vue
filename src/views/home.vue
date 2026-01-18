<template>
  <div class="home-container">
    <!-- Navigation Bar -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="nav-logo">
          <div class="logo-icon">
            <i class="fas fa-paper-plane"></i>
          </div>
          <span class="logo-text">DEV<span class="logo-highlight">SMS</span></span>
        </div>
        
        <div class="nav-links">
          <a href="#recursos" class="nav-link" @click.prevent="scrollToSection('recursos')">Recursos</a>
          <a href="#como-funciona" class="nav-link" @click.prevent="scrollToSection('como-funciona')">Como Funciona</a>
          <a href="#precos" class="nav-link" @click.prevent="scrollToSection('precos')">Preços</a>
        </div>
        
        <div class="nav-actions">
          <router-link to="/login" class="btn-nav-login">
            <i class="fas fa-sign-in-alt"></i>
            Entrar
          </router-link>
          <router-link to="/register" class="btn-nav-register">
            <i class="fas fa-rocket"></i>
            Criar Conta
          </router-link>
        </div>
        
        <button class="mobile-menu-btn" @click="toggleMobileMenu">
          <i class="fas fa-bars"></i>
        </button>
      </div>
      
      <!-- Mobile Menu -->
      <div class="mobile-menu" :class="{ 'active': mobileMenuOpen }">
        <a href="#recursos" class="mobile-link" @click="scrollToSectionMobile('recursos')">Recursos</a>
        <a href="#como-funciona" class="mobile-link" @click="scrollToSectionMobile('como-funciona')">Como Funciona</a>
        <a href="#precos" class="mobile-link" @click="scrollToSectionMobile('precos')">Preços</a>
        <router-link to="/login" class="mobile-link" @click="closeMobileMenu">
          <i class="fas fa-sign-in-alt"></i> Entrar
        </router-link>
        <router-link to="/register" class="mobile-link primary" @click="closeMobileMenu">
          <i class="fas fa-rocket"></i> Criar Conta
        </router-link>
      </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-text" data-aos="fade-up">
          <div class="badge-new">
            <i class="fas fa-sparkles"></i>
            <span>Novidade: Automação de SMS disponível!</span>
          </div>
          
          <h1 class="hero-title">
            Envie SMS em massa de forma 
            <span class="gradient-text">simples e eficiente</span>
          </h1>
          
          <p class="hero-description">
            Conecte-se com seus clientes instantaneamente. Plataforma completa para gestão 
            e envio de SMS com alta taxa de entrega e preços acessíveis.
          </p>
          
          <div class="hero-actions">
            <router-link to="/register" class="btn btn-primary btn-lg btn-glow">
              <i class="fas fa-rocket"></i>
              Começar Agora - É Grátis
              <span class="btn-shine"></span>
            </router-link>
            <a href="#precos" class="btn btn-outline btn-lg" @click.prevent="scrollToSection('precos')">
              <i class="fas fa-tags"></i>
              Ver Preços
            </a>
          </div>
          
          <div class="hero-note">
            <i class="fas fa-gift"></i>
            <span>Ganhe <strong>100 créditos grátis</strong> ao criar sua conta!</span>
          </div>
          
          <div class="hero-stats">
            <div class="stat-item" v-for="(stat, index) in stats" :key="index">
              <div class="stat-icon" :style="{ background: stat.bgColor }">
                <i :class="stat.icon" :style="{ color: stat.color }"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="hero-image" data-aos="fade-left">
          <!-- Phone Mockup Principal -->
          <div class="hero-illustration">
            <div class="phone-mockup">
              <div class="phone-screen">
                <!-- SMS Bubbles com animação -->
                <div class="sms-bubble sms-1">
                  <div class="bubble-header">
                    <i class="fas fa-sms"></i>
                    <span>DEV SMS</span>
                  </div>
                  <p>Olá! Sua promoção especial aguarda você 🎉</p>
                  <div class="bubble-time">14:23</div>
                  <div class="bubble-status">
                    <i class="fas fa-check-double"></i>
                  </div>
                </div>
                <div class="sms-bubble sms-2">
                  <div class="bubble-header">
                    <i class="fas fa-sms"></i>
                    <span>DEV SMS</span>
                  </div>
                  <p>Seu código de verificação: 123456</p>
                  <div class="bubble-time">14:25</div>
                  <div class="bubble-status">
                    <i class="fas fa-check-double"></i>
                  </div>
                </div>
                <div class="sms-bubble sms-3">
                  <div class="bubble-header">
                    <i class="fas fa-sms"></i>
                    <span>DEV SMS</span>
                  </div>
                  <p>Obrigado por escolher nossos serviços! ✨</p>
                  <div class="bubble-time">14:27</div>
                  <div class="bubble-status sending">
                    <i class="fas fa-clock"></i>
                  </div>
                </div>
                
                <!-- Typing indicator -->
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              <div class="phone-notch"></div>
              
              <!-- Efeito de ondas de sinal -->
              <div class="signal-waves">
                <div class="wave wave-1"></div>
                <div class="wave wave-2"></div>
                <div class="wave wave-3"></div>
              </div>
            </div>
          </div>
          
          <!-- Floating Cards -->
          <div class="floating-card card-1">
            <div class="card-icon success">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="card-text">
              <div class="card-title">SMS Entregue</div>
              <div class="card-subtitle">150 mensagens enviadas</div>
            </div>
          </div>
          
          <div class="floating-card card-2">
            <div class="card-icon info">
              <i class="fas fa-users"></i>
            </div>
            <div class="card-text">
              <div class="card-title">1,247 Contatos</div>
              <div class="card-subtitle">+25 novos hoje</div>
            </div>
          </div>
          
          <div class="floating-card card-3">
            <div class="card-icon warning">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="card-text">
              <div class="card-title">Taxa 98%</div>
              <div class="card-subtitle">Entrega garantida</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="recursos" class="features-section" data-aos="fade-up">
      <div class="section-header">
        <h2 class="section-title">Recursos que fazem a diferença</h2>
        <p class="section-subtitle">Tudo que você precisa para gerenciar suas campanhas de SMS</p>
      </div>
      
      <div class="features-grid">
        <div 
          v-for="(feature, index) in features" 
          :key="index"
          class="feature-card"
          :data-aos="'fade-up'"
          :data-aos-delay="index * 100"
        >
          <div class="feature-icon" :style="{ background: feature.bgColor }">
            <i :class="feature.icon" :style="{ color: feature.color }"></i>
          </div>
          <h3 class="feature-title">{{ feature.title }}</h3>
          <p class="feature-description">{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section id="como-funciona" class="how-it-works" data-aos="fade-up">
      <div class="section-header">
        <h2 class="section-title">Como funciona?</h2>
        <p class="section-subtitle">Comece a enviar SMS em apenas 3 passos simples</p>
      </div>
      
      <div class="steps-container">
        <div 
          v-for="(step, index) in steps" 
          :key="index"
          class="step-card"
          :data-aos="'zoom-in'"
          :data-aos-delay="index * 150"
        >
          <div class="step-number" :style="{ background: step.color }">
            {{ index + 1 }}
          </div>
          <div class="step-icon" :style="{ background: step.bgColor, color: step.color }">
            <i :class="step.icon"></i>
          </div>
          <h3 class="step-title">{{ step.title }}</h3>
          <p class="step-description">{{ step.description }}</p>
        </div>
        
        <svg class="steps-connector" viewBox="0 0 800 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M 0 50 Q 200 20, 400 50 T 800 50" stroke="#E5E7EB" stroke-width="2" fill="none" stroke-dasharray="5,5"/>
        </svg>
      </div>
    </section>

    <!-- Pricing Section -->
    <section id="precos" class="pricing-section" data-aos="fade-up">
      <div class="section-header">
        <h2 class="section-title">Planos que cabem no seu bolso</h2>
        <p class="section-subtitle">Escolha o melhor pacote de créditos para suas necessidades</p>
      </div>
      
      <div class="pricing-grid">
        <div 
          v-for="(plan, index) in pricingPlans" 
          :key="index"
          class="pricing-card"
          :class="{ 'popular': plan.popular }"
          :data-aos="'flip-up'"
          :data-aos-delay="index * 100"
        >
          <div class="pricing-badge" v-if="plan.popular">
            <i class="fas fa-crown"></i>
            <span>Mais Popular</span>
          </div>
          
          <div class="pricing-icon" :style="{ background: plan.bgColor, color: plan.color }">
            <i :class="plan.icon"></i>
          </div>
          
          <h3 class="pricing-title">{{ plan.name }}</h3>
          <div class="pricing-price">
            <span class="currency">Kz</span>
            <span class="amount">{{ plan.price }}</span>
          </div>
          <div class="pricing-credits">{{ plan.credits }} créditos SMS</div>
          
          <ul class="pricing-features">
            <li v-for="(feat, i) in plan.features" :key="i">
              <i class="fas fa-check-circle"></i>
              <span>{{ feat }}</span>
            </li>
          </ul>
          
          <router-link to="/creditos" class="btn btn-pricing" :class="plan.popular ? 'btn-primary' : 'btn-outline'">
            <i class="fas fa-shopping-cart"></i>
            Comprar Agora
          </router-link>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section" data-aos="zoom-in">
      <div class="cta-content">
        <div class="cta-icon">
          <i class="fas fa-rocket"></i>
        </div>
        <h2 class="cta-title">Pronto para começar?</h2>
        <p class="cta-description">
          Junte-se a milhares de empresas que confiam na nossa plataforma
        </p>
        <div class="cta-actions">
          <router-link to="/register" class="btn btn-white btn-lg">
            <i class="fas fa-rocket"></i>
            Criar Conta Grátis
          </router-link>
          <router-link to="/login" class="btn btn-ghost-white btn-lg">
            <i class="fas fa-sign-in-alt"></i>
            Já tenho conta
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId)
  if (element) {
    const navbarHeight = 80 // Altura aproximada da navbar
    const elementPosition = element.getBoundingClientRect().top
    const offsetPosition = elementPosition + window.pageYOffset - navbarHeight
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    })
  }
}

const scrollToSectionMobile = (sectionId) => {
  closeMobileMenu()
  setTimeout(() => {
    scrollToSection(sectionId)
  }, 300) // Aguarda o menu fechar antes de rolar
}

const stats = [
  { icon: 'fas fa-paper-plane', value: '28,450', label: 'SMS Enviados', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)' },
  { icon: 'fas fa-users', value: '1,247', label: 'Contatos', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' },
  { icon: 'fas fa-check-circle', value: '98%', label: 'Taxa Entrega', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' }
]

const features = [
  {
    icon: 'fas fa-bolt',
    title: 'Envio Instantâneo',
    description: 'Entrega ultra-rápida com latência mínima para suas mensagens importantes.',
    color: '#F59E0B',
    bgColor: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))'
  },
  {
    icon: 'fas fa-shield-alt',
    title: 'Alta Confiabilidade',
    description: 'Taxa de entrega de 98% com monitoramento em tempo real.',
    color: '#10B981',
    bgColor: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05))'
  },
  {
    icon: 'fas fa-users',
    title: 'Gestão de Contatos',
    description: 'Organize seus contatos em grupos e gerencie facilmente suas listas.',
    color: '#3B82F6',
    bgColor: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))'
  },
  {
    icon: 'fas fa-robot',
    title: 'Automação Inteligente',
    description: 'Agende mensagens e crie campanhas automatizadas para datas especiais.',
    color: '#EC4899',
    bgColor: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(236, 72, 153, 0.05))'
  },
  {
    icon: 'fas fa-chart-line',
    title: 'Relatórios Detalhados',
    description: 'Acompanhe métricas e analise o desempenho de suas campanhas.',
    color: '#8B5CF6',
    bgColor: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05))'
  },
  {
    icon: 'fas fa-file-import',
    title: 'Importação Fácil',
    description: 'Importe contatos via Excel, CSV ou adicione manualmente com facilidade.',
    color: '#06B6D4',
    bgColor: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1), rgba(6, 182, 212, 0.05))'
  }
]

const steps = [
  {
    icon: 'fas fa-user-plus',
    title: 'Adicione Contatos',
    description: 'Importe seus contatos ou adicione manualmente',
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.1)'
  },
  {
    icon: 'fas fa-edit',
    title: 'Escreva a Mensagem',
    description: 'Crie mensagens personalizadas e impactantes',
    color: '#10B981',
    bgColor: 'rgba(16, 185, 129, 0.1)'
  },
  {
    icon: 'fas fa-paper-plane',
    title: 'Envie!',
    description: 'Envie instantaneamente ou agende para depois',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.1)'
  }
]

const pricingPlans = [
  {
    name: 'Básico',
    price: '5.000',
    credits: '500',
    icon: 'fas fa-paper-plane',
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.1)',
    popular: false,
    features: [
      'Envio para grupos',
      'Suporte por email',
      'Relatórios básicos',
      'Validade de 30 dias'
    ]
  },
  {
    name: 'Standard',
    price: '15.000',
    credits: '2.000',
    icon: 'fas fa-crown',
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    popular: true,
    features: [
      'Tudo do Básico',
      'Automação de SMS',
      'Suporte prioritário',
      'Relatórios avançados',
      'Validade de 60 dias'
    ]
  },
  {
    name: 'Premium',
    price: '35.000',
    credits: '5.000',
    icon: 'fas fa-gem',
    color: '#8B5CF6',
    bgColor: 'rgba(139, 92, 246, 0.1)',
    popular: false,
    features: [
      'Tudo do Standard',
      'API de integração',
      'Suporte 24/7',
      'Gestor de contas dedicado',
      'Validade de 90 dias'
    ]
  }
]
</script>

<style scoped>
/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.home-container {
  width: 100%;
  overflow-x: hidden;
  background: #ffffff;
}

/* Navbar Styles */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  z-index: 1000;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.05);
  animation: slideDown 0.5s ease-out;
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.nav-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.nav-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s;
}

.nav-logo:hover {
  transform: scale(1.05);
}

.logo-icon {
  width: 45px;
  height: 45px;
  background: linear-gradient(135deg, #F59E0B, #DC2626);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1F2937;
  letter-spacing: -0.5px;
}

.logo-highlight {
  background: linear-gradient(135deg, #F59E0B, #DC2626);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-link {
  font-size: 1rem;
  font-weight: 600;
  color: #4B5563;
  text-decoration: none;
  transition: all 0.3s;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(135deg, #F59E0B, #DC2626);
  transition: width 0.3s;
}

.nav-link:hover {
  color: #F59E0B;
}

.nav-link:hover::after {
  width: 100%;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-nav-login {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: #4B5563;
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.3s;
}

.btn-nav-login:hover {
  background: #F3F4F6;
  color: #F59E0B;
}

.btn-nav-register {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.75rem;
  font-size: 1rem;
  font-weight: 700;
  color: white;
  background: linear-gradient(135deg, #F59E0B, #DC2626);
  text-decoration: none;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.btn-nav-register::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.btn-nav-register:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
}

.btn-nav-register:hover::before {
  left: 100%;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #1F2937;
  cursor: pointer;
  padding: 0.5rem;
}

.mobile-menu {
  display: none;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: white;
  border-top: 1px solid #E5E7EB;
}

.mobile-menu.active {
  display: flex;
}

.mobile-link {
  padding: 0.75rem 1rem;
  color: #4B5563;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.mobile-link:hover {
  background: #F3F4F6;
  color: #F59E0B;
}

.mobile-link.primary {
  background: linear-gradient(135deg, #F59E0B, #DC2626);
  color: white;
  margin-top: 0.5rem;
}

.mobile-link.primary:hover {
  transform: translateX(5px);
}

/* Hero Section */
.hero-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 8rem 2rem 4rem;
  background: linear-gradient(135deg, #FEF3C7 0%, #FED7AA 50%, #FCA5A5 100%);
  position: relative;
  overflow: hidden;
}

.hero-section::before {
  content: '';
  position: absolute;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(251, 146, 60, 0.3) 0%, transparent 70%);
  border-radius: 50%;
  top: -200px;
  right: -200px;
  animation: float 8s ease-in-out infinite;
}

.hero-section::after {
  content: '';
  position: absolute;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  bottom: -100px;
  left: -100px;
  animation: float 6s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30px) scale(1.1); }
}

.hero-content {
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-text {
  animation: fadeInUp 0.8s ease-out;
  position: relative;
  z-index: 10;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.badge-new {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #F59E0B;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: slideIn 0.6s ease-out;
  position: relative;
  z-index: 10;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  color: #1F2937;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 10;
}

.gradient-text {
  background: linear-gradient(135deg, #DC2626, #F59E0B);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: gradient 3s ease infinite;
}

.hero-description {
  font-size: 1.25rem;
  line-height: 1.7;
  color: #4B5563;
  margin-bottom: 2rem;
  position: relative;
  z-index: 10;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 10;
}

.hero-note {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  border-radius: 12px;
  font-size: 0.938rem;
  color: #4B5563;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 3rem;
  animation: pulse 2s ease-in-out infinite;
  position: relative;
  z-index: 10;
}

.hero-note i {
  color: #10B981;
  font-size: 1.125rem;
}

.hero-note strong {
  color: #10B981;
  font-weight: 700;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
  50% {
    transform: scale(1.02);
    box-shadow: 0 6px 16px rgba(16, 185, 129, 0.15);
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.3s;
  cursor: pointer;
  border: none;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

.btn-primary {
  background: linear-gradient(135deg, #F59E0B, #DC2626);
  color: white;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  position: relative;
  overflow: hidden;
}

.btn-glow {
  animation: glow 2s ease-in-out infinite;
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  }
  50% {
    box-shadow: 0 8px 24px rgba(245, 158, 11, 0.5), 0 0 30px rgba(245, 158, 11, 0.3);
  }
}

.btn-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% { left: -100%; }
  50%, 100% { left: 100%; }
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(245, 158, 11, 0.4);
}

.btn-outline {
  background: white;
  color: #F59E0B;
  border: 2px solid #F59E0B;
}

.btn-outline:hover {
  background: #F59E0B;
  color: white;
  transform: translateY(-3px);
}

.hero-stats {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  position: relative;
  z-index: 10;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.stat-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1F2937;
}

.stat-label {
  font-size: 0.875rem;
  color: #6B7280;
}

/* Hero Image */
.hero-image {
  position: relative;
  height: 600px;
  animation: fadeInRight 1s ease-out;
  z-index: 1;
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.floating-card {
  position: absolute;
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 1rem;
  animation: floatCard 3s ease-in-out infinite;
  z-index: 5;
}

@keyframes floatCard {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

.card-1 {
  top: 50px;
  left: -50px;
  animation-delay: 0s;
}

.card-2 {
  top: 200px;
  right: -30px;
  animation-delay: 0.5s;
}

.card-3 {
  bottom: 100px;
  left: 0;
  animation-delay: 1s;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.card-icon.success { background: #10B981; }
.card-icon.info { background: #3B82F6; }
.card-icon.warning { background: #F59E0B; }

.card-title {
  font-weight: 700;
  color: #1F2937;
  font-size: 1rem;
  margin-bottom: 0.25rem;
}

.card-subtitle {
  font-size: 0.875rem;
  color: #6B7280;
}

/* Phone Mockup */
.hero-illustration {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.phone-mockup {
  width: 300px;
  height: 600px;
  background: linear-gradient(135deg, #1F2937, #111827);
  border-radius: 40px;
  padding: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  position: relative;
  animation: phoneFloat 4s ease-in-out infinite;
}

@keyframes phoneFloat {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(2deg); }
}

.phone-notch {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 25px;
  background: #000;
  border-radius: 0 0 20px 20px;
  z-index: 10;
}

.phone-screen {
  width: 100%;
  height: 100%;
  background: linear-gradient(180deg, #FEF3C7, #FED7AA);
  border-radius: 32px;
  padding: 3rem 1.5rem 1.5rem;
  overflow: hidden;
}

.sms-bubble {
  background: white;
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: bubbleIn 0.5s ease-out;
}

@keyframes bubbleIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.sms-1 { animation-delay: 0.3s; }
.sms-2 { animation-delay: 0.6s; }
.sms-3 { animation-delay: 0.9s; }

.bubble-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #F59E0B;
  font-weight: 600;
  font-size: 0.875rem;
}

.sms-bubble p {
  color: #374151;
  font-size: 0.938rem;
  line-height: 1.5;
  margin-bottom: 0.5rem;
}

.bubble-time {
  font-size: 0.75rem;
  color: #9CA3AF;
  text-align: right;
}

.bubble-status {
  display: flex;
  justify-content: flex-end;
  margin-top: 0.25rem;
  color: #10B981;
  font-size: 0.875rem;
}

.bubble-status.sending {
  color: #F59E0B;
}

.typing-indicator {
  display: flex;
  gap: 0.375rem;
  padding: 1rem;
  background: white;
  border-radius: 16px;
  width: fit-content;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #9CA3AF;
  border-radius: 50%;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {
  0%, 60%, 100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.signal-waves {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 0;
  pointer-events: none;
}

.wave {
  position: absolute;
  width: 350px;
  height: 350px;
  border: 2px solid rgba(245, 158, 11, 0.3);
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: wave 3s ease-out infinite;
}

.wave-1 { animation-delay: 0s; }
.wave-2 { animation-delay: 1s; }
.wave-3 { animation-delay: 2s; }

@keyframes wave {
  0% {
    width: 300px;
    height: 300px;
    opacity: 1;
  }
  100% {
    width: 450px;
    height: 450px;
    opacity: 0;
  }
}

/* Features Section */
.features-section {
  padding: 6rem 2rem;
  background: white;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1F2937;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.125rem;
  color: #6B7280;
  max-width: 600px;
  margin: 0 auto;
}

.features-grid {
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  padding: 2rem;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 16px;
  transition: all 0.3s;
  cursor: pointer;
}

.feature-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-color: #F59E0B;
}

.feature-icon {
  width: 70px;
  height: 70px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s;
}

.feature-card:hover .feature-icon {
  transform: scale(1.1) rotate(-5deg);
}

.feature-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 1rem;
}

.feature-description {
  font-size: 1rem;
  color: #6B7280;
  line-height: 1.7;
}

/* How It Works */
.how-it-works {
  padding: 6rem 2rem;
  background: linear-gradient(180deg, #F9FAFB, #ffffff);
}

.steps-container {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
  position: relative;
}

.steps-connector {
  position: absolute;
  top: 80px;
  left: 10%;
  width: 80%;
  height: 100px;
  z-index: 0;
  pointer-events: none;
}

.step-card {
  text-align: center;
  position: relative;
  z-index: 1;
  transition: all 0.3s;
}

.step-card:hover {
  transform: scale(1.05);
}

.step-number {
  position: absolute;
  top: -15px;
  right: calc(50% - 50px);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.25rem;
  color: white;
  z-index: 2;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.step-icon {
  width: 100px;
  height: 100px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  margin: 0 auto 1.5rem;
  transition: all 0.3s;
}

.step-card:hover .step-icon {
  transform: scale(1.1) rotate(5deg);
}

.step-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 0.75rem;
}

.step-description {
  font-size: 1rem;
  color: #6B7280;
  line-height: 1.6;
}

/* Pricing Section */
.pricing-section {
  padding: 6rem 2rem;
  background: white;
}

.pricing-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.pricing-card {
  position: relative;
  padding: 2.5rem 2rem;
  background: white;
  border: 2px solid #E5E7EB;
  border-radius: 20px;
  text-align: center;
  transition: all 0.3s;
}

.pricing-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border-color: #F59E0B;
}

.pricing-card.popular {
  border-color: #F59E0B;
  box-shadow: 0 10px 30px rgba(245, 158, 11, 0.2);
  transform: scale(1.05);
}

.pricing-card.popular:hover {
  transform: scale(1.08) translateY(-10px);
}

.pricing-badge {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #F59E0B, #DC2626);
  color: white;
  border-radius: 50px;
  font-size: 0.813rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.pricing-icon {
  width: 80px;
  height: 80px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  margin: 0 auto 1.5rem;
  transition: all 0.3s;
}

.pricing-card:hover .pricing-icon {
  transform: scale(1.1) rotate(-10deg);
}

.pricing-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 1rem;
}

.pricing-price {
  margin-bottom: 0.5rem;
}

.currency {
  font-size: 1.5rem;
  font-weight: 600;
  color: #6B7280;
  vertical-align: super;
}

.amount {
  font-size: 3rem;
  font-weight: 800;
  color: #1F2937;
}

.pricing-credits {
  font-size: 1.125rem;
  color: #F59E0B;
  font-weight: 600;
  margin-bottom: 2rem;
}

.pricing-features {
  list-style: none;
  margin-bottom: 2rem;
  text-align: left;
}

.pricing-features li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  color: #4B5563;
  font-size: 1rem;
}

.pricing-features i {
  color: #10B981;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.btn-pricing {
  width: 100%;
  justify-content: center;
}

/* CTA Section */
.cta-section {
  padding: 6rem 2rem;
  background: linear-gradient(135deg, #DC2626, #F59E0B);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.cta-section::before {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  top: -200px;
  left: -200px;
  animation: float 10s ease-in-out infinite;
}

.cta-content {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.cta-icon {
  width: 100px;
  height: 100px;
  background: white;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 2rem;
  font-size: 3rem;
  color: #F59E0B;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

.cta-title {
  font-size: 3rem;
  font-weight: 800;
  color: white;
  margin-bottom: 1rem;
}

.cta-description {
  font-size: 1.25rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2.5rem;
}

.cta-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-white {
  background: white;
  color: #F59E0B;
}

.btn-white:hover {
  background: #FEF3C7;
  transform: translateY(-3px);
}

.btn-ghost-white {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.btn-ghost-white:hover {
  background: white;
  color: #F59E0B;
  transform: translateY(-3px);
}

/* Responsive */
@media (max-width: 1024px) {
  .nav-links {
    display: none;
  }
  
  .nav-actions {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .hero-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-image {
    display: none;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-stats {
    justify-content: center;
  }
  
  .steps-container {
    grid-template-columns: 1fr;
    gap: 4rem;
  }
  
  .steps-connector {
    display: none;
  }
}

@media (max-width: 768px) {
  .nav-container {
    padding: 1rem;
  }
  
  .logo-text {
    font-size: 1.25rem;
  }
  
  .logo-icon {
    width: 40px;
    height: 40px;
  }
  
  .hero-section {
    padding: 6rem 1rem 3rem;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-description {
    font-size: 1rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .cta-title {
    font-size: 2rem;
  }
  
  .pricing-grid {
    grid-template-columns: 1fr;
  }
  
  .pricing-card.popular {
    transform: scale(1);
  }
  
  .hero-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .hero-actions .btn {
    width: 100%;
  }
  
  .hero-stats {
    flex-direction: column;
    width: 100%;
  }
  
  .stat-item {
    width: 100%;
  }
}
</style>