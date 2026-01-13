<template>
  <navegacao />
  <div class="dashboard-container fade-in">
    <!-- HEADER -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Painel Administrativo</h1>
        <p class="page-subtitle">
          Visão geral do sistema • Atualizado em {{ dataHoraAtual }}
        </p>
      </div>

      <div class="header-actions">
        <button @click="atualizarDados" class="btn btn-secondary" :disabled="carregando">
          <i class="fas fa-sync-alt" :class="{ 'fa-spin': carregando }"></i>
          Atualizar
        </button>
        <RouterLink to="/lista_empresa" class="btn btn-accent">
          <i class="fas fa-building"></i> Empresas
        </RouterLink>
        <RouterLink to="/lista_planos" class="btn btn-accent">
          <i class="fas fa-building"></i> Planos
        </RouterLink>
      </div>
    </div>

    <!-- LOADING OVERLAY -->
    <transition name="fade">
      <div v-if="carregando" class="loading-overlay">
        <div class="spinner"></div>
        <p>Carregando dados...</p>
      </div>
    </transition>

    <!-- ERROR MESSAGE -->
    <transition name="slide-down">
      <div v-if="erro" class="alert alert-danger">
        <i class="fas fa-exclamation-circle"></i>
        <div class="alert-content">
          <strong>Erro!</strong>
          {{ erro }}
        </div>
        <button @click="atualizarDados" class="alert-link">
          Tentar novamente <i class="fas fa-redo"></i>
        </button>
      </div>
    </transition>

    <!-- STATS CARDS -->
    <div class="stats-grid">
      <div 
        v-for="(stat, index) in stats" 
        :key="stat.label"
        class="stat-card"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <div class="stat-icon" :style="{ background: stat.bg }">
          <i :class="stat.icon"></i>
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
          <div v-if="stat.subtitle" class="stat-subtitle">
            {{ stat.subtitle }}
          </div>
        </div>
      </div>
    </div>

    <!-- RESUMO RÁPIDO -->
    <div class="info-cards-grid">
      <div class="info-card">
        <div class="info-card-header">
          <i class="fas fa-chart-line"></i>
          <h4>Empresas Ativas</h4>
        </div>
        <div class="info-card-body">
          <div class="big-number">{{ dashboardData.companies?.active || 0 }}</div>
          <p class="info-text">
            de {{ dashboardData.companies?.total || 0 }} empresas totais
            <span v-if="dashboardData.companies?.suspended > 0" class="text-danger">
              ({{ dashboardData.companies.suspended }} suspensas)
            </span>
          </p>
        </div>
      </div>

      <div class="info-card">
        <div class="info-card-header">
          <i class="fas fa-wallet"></i>
          <h4>Receita Total</h4>
        </div>
        <div class="info-card-body">
          <div class="big-number">{{ formatCurrency(dashboardData.revenue?.total_plans_value || 0) }}</div>
          <p class="info-text">Valor total dos planos ativos</p>
        </div>
      </div>

      <div class="info-card">
        <div class="info-card-header">
          <i class="fas fa-users"></i>
          <h4>Subscrições</h4>
        </div>
        <div class="info-card-body">
          <div class="big-number">{{ dashboardData.subscriptions?.active || 0 }}</div>
          <p class="info-text">
            ativas
            <span v-if="dashboardData.subscriptions?.expiring_soon > 0" class="text-warning">
              ({{ dashboardData.subscriptions.expiring_soon }} expiram em breve)
            </span>
          </p>
        </div>
      </div>
    </div>

    <!-- GRÁFICOS -->
    <div class="charts-grid">
      <div class="card chart-card">
        <div class="card-header">
          <div class="card-title-wrapper">
            <i class="fas fa-building"></i>
            <h3 class="card-title">Distribuição de Empresas</h3>
          </div>
          <button class="btn-icon" title="Exportar dados" @click="exportarEmpresas">
            <i class="fas fa-download"></i>
          </button>
        </div>
        <div class="chart-container">
          <canvas ref="empresasChart"></canvas>
        </div>
        <div class="card-footer">
          <span class="footer-stat">
            <strong>Total:</strong> {{ dashboardData.companies?.total || 0 }} empresas
          </span>
          <span class="footer-stat" :class="dashboardData.companies?.new_this_month > 0 ? 'success' : ''">
            <i :class="dashboardData.companies?.new_this_month > 0 ? 'fas fa-arrow-up' : 'fas fa-minus'"></i>
            {{ dashboardData.companies?.new_this_month || 0 }} este mês
          </span>
        </div>
      </div>

      <div class="card chart-card">
        <div class="card-header">
          <div class="card-title-wrapper">
            <i class="fas fa-paper-plane"></i>
            <h3 class="card-title">SMS Enviados</h3>
          </div>
          <button class="btn-icon" title="Exportar dados" @click="exportarSMS">
            <i class="fas fa-download"></i>
          </button>
        </div>
        <div class="chart-container">
          <canvas ref="smsChart"></canvas>
        </div>
        <div class="card-footer">
          <span class="footer-stat">
            <strong>Hoje:</strong> {{ dashboardData.sms?.total_sent_today || 0 }} SMS
          </span>
          <span class="footer-stat">
            <strong>Este mês:</strong> {{ dashboardData.sms?.total_sent_this_month || 0 }} SMS
          </span>
        </div>
      </div>
    </div>

    <!-- ESTATÍSTICAS ADICIONAIS -->
    <div class="info-cards-grid">
      <div class="info-card">
        <div class="info-card-header">
          <i class="fas fa-users"></i>
          <h4>Total de Clientes SMS</h4>
        </div>
        <div class="info-card-body">
          <div class="big-number">{{ dashboardData.sms?.total_clients || 0 }}</div>
          <p class="info-text">Clientes cadastrados no sistema</p>
        </div>
      </div>

      <div class="info-card">
        <div class="info-card-header">
          <i class="fas fa-bullhorn"></i>
          <h4>Campanhas SMS</h4>
        </div>
        <div class="info-card-body">
          <div class="big-number">{{ dashboardData.sms?.total_campaigns || 0 }}</div>
          <p class="info-text">Total de campanhas criadas</p>
        </div>
      </div>

      <div class="info-card">
        <div class="info-card-header">
          <i class="fas fa-clock"></i>
          <h4>Subscrições Expiradas</h4>
        </div>
        <div class="info-card-body">
          <div class="big-number">{{ dashboardData.subscriptions?.expired || 0 }}</div>
          <p class="info-text">Necessitam renovação</p>
        </div>
      </div>
    </div>

    <!-- EMPRESAS RECENTES -->
    <div class="card">
      <div class="card-header">
        <div class="card-title-wrapper">
          <i class="fas fa-building"></i>
          <h3 class="card-title">Empresas Recentes</h3>
        </div>
        <RouterLink to="/admin/empresas" class="btn btn-sm btn-secondary">
          Ver todas <i class="fas fa-arrow-right"></i>
        </RouterLink>
      </div>

      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>NIF</th>
              <th>Contato</th>
              <th>Plano</th>
              <th>Data de Registro</th>
              <th>Status</th>
              <th class="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!dashboardData.recent_companies || dashboardData.recent_companies.length === 0">
              <td colspan="7" class="text-center" style="padding: 2rem; color: #6b7280;">
                Nenhuma empresa cadastrada ainda
              </td>
            </tr>
            <tr v-for="empresa in dashboardData.recent_companies" :key="empresa.id">
              <td>
                <div class="empresa-info">
                  <div class="empresa-avatar">
                    {{ empresa.name.charAt(0).toUpperCase() }}
                  </div>
                  <div class="empresa-detalhes">
                    <strong>{{ empresa.name }}</strong>
                    <small>{{ empresa.email }}</small>
                  </div>
                </div>
              </td>
              <td>{{ empresa.nif }}</td>
              <td>{{ empresa.phone }}</td>
              <td>
                <span v-if="empresa.subscription" class="badge badge-info">
                  {{ empresa.subscription.plan.name }}
                </span>
                <span v-else class="badge badge-secondary">
                  Sem plano
                </span>
              </td>
              <td>{{ formatDate(empresa.created_at) }}</td>
              <td>
                <span
                  class="badge"
                  :class="{
                    'badge-success': empresa.status === 'active',
                    'badge-warning': empresa.status === 'pending',
                    'badge-danger': empresa.status === 'suspended',
                    'badge-secondary': empresa.status === 'inactive'
                  }"
                >
                  {{ getStatusText(empresa.status) }}
                </span>
              </td>
              <td class="text-center">
                <div class="action-buttons">
                  <button 
                    v-if="empresa.subscription"
                    @click="verSubscricao(empresa.id)"
                    class="btn-icon btn-info"
                    title="Ver subscrição"
                  >
                    <i class="fas fa-receipt"></i>
                  </button>
                  <button 
                    @click="verEmpresa(empresa.id)"
                    class="btn-icon"
                    title="Ver detalhes"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button 
                    @click="editarEmpresa(empresa.id)"
                    class="btn-icon btn-secondary"
                    title="Editar"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Chart } from 'chart.js/auto'
import navegacao from '../../components/navegacao.vue'

// ===========================
// ESTADO
// ===========================

const carregando = ref(false)
const erro = ref('')
const dataHoraAtual = ref('')

const dashboardData = ref({
  companies: {
    total: 0,
    active: 0,
    suspended: 0,
    new_this_month: 0
  },
  subscriptions: {
    active: 0,
    expired: 0,
    expiring_soon: 0
  },
  sms: {
    total_sent_today: 0,
    total_sent_this_month: 0,
    total_clients: 0,
    total_campaigns: 0
  },
  revenue: {
    total_plans_value: 0
  },
  recent_companies: []
})

const stats = ref([
  {
    label: 'Empresas Totais',
    value: '0',
    subtitle: '',
    icon: 'fas fa-building',
    bg: 'linear-gradient(135deg, #3B82F6, #2563EB)'
  },
  {
    label: 'SMS Este Mês',
    value: '0',
    subtitle: '',
    icon: 'fas fa-paper-plane',
    bg: 'linear-gradient(135deg, #10B981, #059669)'
  },
  {
    label: 'Receita Total',
    value: '0 AOA',
    subtitle: '',
    icon: 'fas fa-wallet',
    bg: 'linear-gradient(135deg, #F59E0B, #D97706)'
  },
  {
    label: 'Subscrições Ativas',
    value: '0',
    subtitle: '',
    icon: 'fas fa-check-circle',
    bg: 'linear-gradient(135deg, #8B5CF6, #7C3AED)'
  }
])

const empresasChart = ref(null)
const smsChart = ref(null)

// ===========================
// MÉTODOS
// ===========================

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
    minimumFractionDigits: 2
  }).format(value)
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getStatusText = (status) => {
  const statusMap = {
    'active': 'Ativa',
    'pending': 'Pendente',
    'suspended': 'Suspensa',
    'inactive': 'Inativa'
  }
  return statusMap[status] || status
}

const atualizarDataHora = () => {
  const agora = new Date()
  const opcoes = { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  }
  dataHoraAtual.value = agora.toLocaleDateString('pt-AO', opcoes)
}

const buscarDadosAPI = async () => {
  try {
    const API_URL = 'https://api.devsms.online/api/v1/admin/dashboard'
    
    const token = localStorage.getItem('auth_token') || localStorage.getItem('token')
    
    // Verificar se há token antes de fazer a requisição
    if (!token) {
      throw new Error('Token de autenticação não encontrado. Por favor, faça login.')
    }
    
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    }
    
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: headers
      // Removido credentials: 'include' para resolver problema de CORS
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Não autorizado. Por favor, faça login novamente.')
      }
      if (response.status === 403) {
        throw new Error('Acesso negado. Você não tem permissão para acessar esta página.')
      }
      throw new Error(`Erro HTTP! Status: ${response.status}`)
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('Erro ao buscar dados da API:', error)
    throw error
  }
}

const atualizarDados = async () => {
  carregando.value = true
  erro.value = ''
  
  try {
    const resultado = await buscarDadosAPI()
    
    if (resultado.success && resultado.data) {
      dashboardData.value = resultado.data
      
      // Atualizar stats dinamicamente
      stats.value[0].value = dashboardData.value.companies.total.toString()
      stats.value[0].subtitle = `${dashboardData.value.companies.active} ativas, ${dashboardData.value.companies.suspended} suspensas`
      
      stats.value[1].value = dashboardData.value.sms.total_sent_this_month.toLocaleString('pt-AO')
      stats.value[1].subtitle = `${dashboardData.value.sms.total_sent_today} enviados hoje`
      
      stats.value[2].value = formatCurrency(dashboardData.value.revenue.total_plans_value)
      stats.value[2].subtitle = 'Valor total dos planos'
      
      stats.value[3].value = dashboardData.value.subscriptions.active.toString()
      stats.value[3].subtitle = dashboardData.value.subscriptions.expiring_soon > 0 
        ? `${dashboardData.value.subscriptions.expiring_soon} expiram em breve`
        : 'Nenhuma expirando'
      
      atualizarDataHora()
      criarGraficos()
    } else {
      throw new Error('Erro na resposta da API')
    }
  } catch (error) {
    console.error('Erro ao carregar dashboard:', error)
    
    // Mensagens de erro mais específicas
    if (error.message.includes('Não autorizado')) {
      erro.value = 'Sessão expirada. Por favor, faça login novamente.'
      // Opcional: redirecionar para login após 3 segundos
      setTimeout(() => {
        window.location.href = '/login'
      }, 3000)
    } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      erro.value = 'Erro de conexão. Verifique sua internet e tente novamente.'
    } else {
      erro.value = error.message || 'Erro ao carregar dados. Tente novamente.'
    }
  } finally {
    carregando.value = false
  }
}

const verEmpresa = (id) => {
  window.location.href = `/admin/empresas/${id}`
}

const editarEmpresa = (id) => {
  window.location.href = `/admin/empresas/${id}/editar`
}

const verSubscricao = (id) => {
  window.location.href = `/admin/subscricoes?empresa=${id}`
}

const exportarEmpresas = () => {
  alert('Funcionalidade de exportação será implementada em breve.')
}

const exportarSMS = () => {
  alert('Funcionalidade de exportação será implementada em breve.')
}

const criarGraficos = () => {
  // Destruir gráficos existentes
  if (empresasChart.value && empresasChart.value._chart) {
    empresasChart.value._chart.destroy()
  }
  if (smsChart.value && smsChart.value._chart) {
    smsChart.value._chart.destroy()
  }

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
      }
    }
  }

  // Gráfico de Empresas
  if (empresasChart.value) {
    new Chart(empresasChart.value, {
      type: 'doughnut',
      data: {
        labels: ['Ativas', 'Suspensas', 'Novas este mês'],
        datasets: [{
          data: [
            dashboardData.value.companies?.active || 0,
            dashboardData.value.companies?.suspended || 0,
            dashboardData.value.companies?.new_this_month || 0
          ],
          backgroundColor: [
            'rgba(16, 185, 129, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(59, 130, 246, 0.8)'
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        ...commonOptions,
        plugins: {
          ...commonOptions.plugins,
          tooltip: {
            ...commonOptions.plugins.tooltip,
            callbacks: {
              label: (context) => `${context.label}: ${context.parsed} empresas`
            }
          }
        }
      }
    })
  }

  // Gráfico de SMS
  if (smsChart.value) {
    new Chart(smsChart.value, {
      type: 'bar',
      data: {
        labels: ['Hoje', 'Este Mês', 'Clientes', 'Campanhas'],
        datasets: [{
          label: 'Estatísticas SMS',
          data: [
            dashboardData.value.sms?.total_sent_today || 0,
            dashboardData.value.sms?.total_sent_this_month || 0,
            dashboardData.value.sms?.total_clients || 0,
            dashboardData.value.sms?.total_campaigns || 0
          ],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(16, 185, 129, 0.8)'
          ],
          borderRadius: 8,
          borderWidth: 0
        }]
      },
      options: {
        ...commonOptions,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    })
  }
}

// ===========================
// LIFECYCLE
// ===========================

onMounted(() => {
  atualizarDataHora()
  atualizarDados()
})
</script>

<style scoped>
/* ===========================
   ANIMAÇÕES
=========================== */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.fade-in {
  animation: fadeInUp 0.6s ease-out;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.slide-down-enter-active {
  animation: slideDown 0.4s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ===========================
   LAYOUT PRINCIPAL
=========================== */
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* ===========================
   HEADER
=========================== */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.header-content {
  flex: 1;
  min-width: 250px;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* ===========================
   LOADING
=========================== */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  color: white;
  backdrop-filter: blur(4px);
}

.spinner {
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

/* ===========================
   STATS CARDS
=========================== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
  transition: all 0.3s ease;
  animation: fadeInUp 0.5s ease-out forwards;
  opacity: 0;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
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
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
  line-height: 1.2;
}

.stat-label {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.stat-subtitle {
  color: #9ca3af;
  font-size: 0.75rem;
}

/* ===========================
   ALERT
=========================== */
.alert {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  border: 1px solid;
  margin-bottom: 2rem;
}

.alert-danger {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border-color: #ef4444;
  color: #991b1b;
}

.alert i:first-child {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
}

.alert-link {
  color: inherit;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
  padding: 0.5rem 1rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.alert-link:hover {
  background: rgba(0, 0, 0, 0.1);
  gap: 0.75rem;
}

/* ===========================
   INFO CARDS
=========================== */
.info-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.info-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.info-card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: #6b7280;
}

.info-card-header i {
  font-size: 1.25rem;
}

.info-card-header h4 {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
}

.big-number {
  font-size: 2.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.5rem;
  line-height: 1;
}

.info-text {
  color: #6b7280;
  font-size: 0.875rem;
  margin: 0;
}

.text-danger {
  color: #ef4444;
  font-weight: 600;
}

.text-warning {
  color: #f59e0b;
  font-weight: 600;
}

/* ===========================
   GRÁFICOS
=========================== */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.chart-card {
  display: flex;
  flex-direction: column;
}

.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.card-title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-title-wrapper i {
  color: #6b7280;
  font-size: 1.125rem;
}

.card-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
}

.chart-container {
  padding: 1.5rem;
  height: 320px;
  position: relative;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  font-size: 0.875rem;
  background: #f9fafb;
}

.footer-stat {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-stat.success {
  color: #10b981;
  font-weight: 600;
}

/* ===========================
   TABELA
=========================== */
.table-wrapper {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table thead {
  background: #f9fafb;
}

.data-table th {
  padding: 1rem 1.5rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  color: #6b7280;
  border-bottom: 2px solid #e5e7eb;
  white-space: nowrap;
}

.data-table td {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.data-table tbody tr {
  transition: background 0.2s;
}

.data-table tbody tr:hover {
  background: #f9fafb;
}

.empresa-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.empresa-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3B82F6, #2563EB);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.empresa-detalhes strong {
  display: block;
  color: #111827;
  font-weight: 600;
}

.empresa-detalhes small {
  display: block;
  color: #6b7280;
  font-size: 0.75rem;
  margin-top: 2px;
}

.text-center {
  text-align: center;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

/* ===========================
   BADGES
=========================== */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.badge-info {
  background: #dbeafe;
  color: #1e40af;
}

.badge-warning {
  background: #fef3c7;
  color: #92400e;
}

.badge-success {
  background: #d1fae5;
  color: #065f46;
}

.badge-danger {
  background: #fee2e2;
  color: #991b1b;
}

/* ===========================
   BOTÕES
=========================== */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-accent {
  background: linear-gradient(135deg, #3B82F6, #2563EB);
  color: white;
}

.btn-accent:hover {
  background: linear-gradient(135deg, #2563EB, #1d4ed8);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
}

.btn-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.btn-icon:hover {
  background: #f9fafb;
  color: #111827;
  border-color: #d1d5db;
}

.btn-icon.btn-success {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.btn-icon.btn-success:hover {
  background: #059669;
  border-color: #059669;
}

.btn-icon.btn-danger {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.btn-icon.btn-danger:hover {
  background: #dc2626;
  border-color: #dc2626;
}

/* ===========================
   RESPONSIVO
=========================== */
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .btn {
    flex: 1;
    justify-content: center;
  }

  .stats-grid,
  .info-cards-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .alert {
    flex-direction: column;
    text-align: center;
  }

  .alert-link {
    width: 100%;
    justify-content: center;
  }

  .data-table {
    font-size: 0.875rem;
  }

  .data-table th,
  .data-table td {
    padding: 0.75rem 0.5rem;
  }

  .empresa-info {
    flex-direction: column;
    text-align: center;
  }

  .action-buttons {
    flex-wrap: wrap;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }

  .big-number {
    font-size: 1.75rem;
  }

  .chart-container {
    height: 250px;
    padding: 1rem;
  }
}
</style>