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
        <RouterLink to="/gerir" class="btn btn-accent">
          <i class="fas fa-cog"></i> Gerir Sistema
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
          <div v-if="stat.variacao" class="stat-variacao" :class="stat.variacao > 0 ? 'positiva' : 'negativa'">
            <i :class="stat.variacao > 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"></i>
            {{ Math.abs(stat.variacao) }}% vs mês anterior
          </div>
        </div>
      </div>
    </div>

    <!-- ALERT -->
    <transition name="slide-down">
      <div v-if="solicitacoesPendentes > 0" class="alert alert-warning">
        <i class="fas fa-exclamation-triangle"></i>
        <div class="alert-content">
          <strong>Atenção!</strong>
          Você tem {{ solicitacoesPendentes }} solicitações pendentes aguardando aprovação.
        </div>
        <RouterLink to="/admin/solicitacoes" class="alert-link">
          Ver solicitações <i class="fas fa-arrow-right"></i>
        </RouterLink>
      </div>
    </transition>

    <!-- RESUMO RÁPIDO -->
    <div class="info-cards-grid">
      <div class="info-card">
        <div class="info-card-header">
          <i class="fas fa-chart-line"></i>
          <h4>Taxa de Conversão</h4>
        </div>
        <div class="info-card-body">
          <div class="big-number">87.5%</div>
          <p class="info-text">Empresas aprovadas vs solicitações</p>
        </div>
      </div>

      <div class="info-card">
        <div class="info-card-header">
          <i class="fas fa-dollar-sign"></i>
          <h4>Ticket Médio</h4>
        </div>
        <div class="info-card-body">
          <div class="big-number">55.000 AOA</div>
          <p class="info-text">Valor médio por transação</p>
        </div>
      </div>

      <div class="info-card">
        <div class="info-card-header">
          <i class="fas fa-users"></i>
          <h4>Taxa de Retenção</h4>
        </div>
        <div class="info-card-body">
          <div class="big-number">92.3%</div>
          <p class="info-text">Clientes ativos nos últimos 30 dias</p>
        </div>
      </div>
    </div>

    <!-- GRÁFICOS -->
    <div class="charts-grid">
      <div class="card chart-card">
        <div class="card-header">
          <div class="card-title-wrapper">
            <i class="fas fa-money-bill-wave"></i>
            <h3 class="card-title">Receita dos Últimos 6 Meses</h3>
          </div>
          <button class="btn-icon" title="Exportar dados">
            <i class="fas fa-download"></i>
          </button>
        </div>
        <div class="chart-container">
          <canvas ref="receitaChart"></canvas>
        </div>
        <div class="card-footer">
          <span class="footer-stat">
            <strong>Total:</strong> 3.440.000 AOA
          </span>
          <span class="footer-stat success">
            <i class="fas fa-arrow-up"></i> +18.5%
          </span>
        </div>
      </div>

      <div class="card chart-card">
        <div class="card-header">
          <div class="card-title-wrapper">
            <i class="fas fa-paper-plane"></i>
            <h3 class="card-title">SMS Enviados por Mês</h3>
          </div>
          <button class="btn-icon" title="Exportar dados">
            <i class="fas fa-download"></i>
          </button>
        </div>
        <div class="chart-container">
          <canvas ref="smsChart"></canvas>
        </div>
        <div class="card-footer">
          <span class="footer-stat">
            <strong>Total:</strong> 1.330.000 SMS
          </span>
          <span class="footer-stat success">
            <i class="fas fa-arrow-up"></i> +12.3%
          </span>
        </div>
      </div>
    </div>

    <!-- SOLICITAÇÕES RECENTES -->
    <div class="card">
      <div class="card-header">
        <div class="card-title-wrapper">
          <i class="fas fa-file-invoice"></i>
          <h3 class="card-title">Solicitações Recentes</h3>
        </div>
        <RouterLink to="/admin/solicitacoes" class="btn btn-sm btn-secondary">
          Ver todas <i class="fas fa-arrow-right"></i>
        </RouterLink>
      </div>

      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Pacote</th>
              <th>Valor</th>
              <th>Data</th>
              <th>Status</th>
              <th class="text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="solicitacao in solicitacoes" :key="solicitacao.id">
              <td>
                <div class="empresa-info">
                  <div class="empresa-avatar">
                    {{ solicitacao.empresa.charAt(0) }}
                  </div>
                  <div class="empresa-detalhes">
                    <strong>{{ solicitacao.empresa }}</strong>
                    <small>{{ solicitacao.email }}</small>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge badge-info">
                  <i class="fas fa-sms"></i> {{ solicitacao.pacote }}
                </span>
              </td>
              <td><strong>{{ solicitacao.valor }}</strong></td>
              <td>{{ solicitacao.data }}</td>
              <td>
                <span
                  class="badge"
                  :class="{
                    'badge-warning': solicitacao.status === 'pendente',
                    'badge-success': solicitacao.status === 'aprovado',
                    'badge-danger': solicitacao.status === 'rejeitado'
                  }"
                >
                  {{ solicitacao.status }}
                </span>
              </td>
              <td class="text-center">
                <div class="action-buttons">
                  <button 
                    v-if="solicitacao.status === 'pendente'" 
                    @click="aprovarSolicitacao(solicitacao.id)"
                    class="btn-icon btn-success"
                    title="Aprovar"
                  >
                    <i class="fas fa-check"></i>
                  </button>
                  <button 
                    v-if="solicitacao.status === 'pendente'" 
                    @click="rejeitarSolicitacao(solicitacao.id)"
                    class="btn-icon btn-danger"
                    title="Rejeitar"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                  <button 
                    @click="verDetalhes(solicitacao.id)"
                    class="btn-icon"
                    title="Ver detalhes"
                  >
                    <i class="fas fa-eye"></i>
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
const dataHoraAtual = ref('')
const solicitacoesPendentes = ref(3)

const stats = ref([
  {
    label: 'Empresas Ativas',
    value: '47',
    icon: 'fas fa-building',
    bg: 'linear-gradient(135deg, #3B82F6, #2563EB)',
    variacao: 12.5
  },
  {
    label: 'SMS Enviados',
    value: '1.245.890',
    icon: 'fas fa-paper-plane',
    bg: 'linear-gradient(135deg, #10B981, #059669)',
    variacao: 8.3
  },
  {
    label: 'Créditos Vendidos',
    value: '458.720',
    icon: 'fas fa-wallet',
    bg: 'linear-gradient(135deg, #F59E0B, #D97706)',
    variacao: 15.7
  },
  {
    label: 'Solicitações Pendentes',
    value: '3',
    icon: 'fas fa-clock',
    bg: 'linear-gradient(135deg, #EF4444, #DC2626)',
    variacao: -5.2
  }
])

const solicitacoes = ref([
  {
    id: 1,
    empresa: 'Tech Solutions Lda',
    email: 'contato@techsolutions.ao',
    pacote: '5000 SMS',
    valor: '50.000 AOA',
    data: '05/01/2026',
    status: 'pendente'
  },
  {
    id: 2,
    empresa: 'Mega Store Angola',
    email: 'admin@megastore.ao',
    pacote: '2000 SMS',
    valor: '22.000 AOA',
    data: '04/01/2026',
    status: 'aprovado'
  },
  {
    id: 3,
    empresa: 'Farmácias Central',
    email: 'ti@farmcentral.ao',
    pacote: '10000 SMS',
    valor: '95.000 AOA',
    data: '03/01/2026',
    status: 'pendente'
  },
  {
    id: 4,
    empresa: 'Supermercado Kero',
    email: 'gestao@kero.ao',
    pacote: '3000 SMS',
    valor: '32.000 AOA',
    data: '02/01/2026',
    status: 'aprovado'
  }
])

const receitaChart = ref(null)
const smsChart = ref(null)

// ===========================
// MÉTODOS
// ===========================

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

const atualizarDados = async () => {
  carregando.value = true
  await new Promise(resolve => setTimeout(resolve, 1500))
  atualizarDataHora()
  carregando.value = false
}

const aprovarSolicitacao = (id) => {
  const solicitacao = solicitacoes.value.find(s => s.id === id)
  if (solicitacao) {
    solicitacao.status = 'aprovado'
    solicitacoesPendentes.value--
    stats.value[3].value = String(solicitacoesPendentes.value)
    alert(`Solicitação de ${solicitacao.empresa} aprovada com sucesso!`)
  }
}

const rejeitarSolicitacao = (id) => {
  const solicitacao = solicitacoes.value.find(s => s.id === id)
  if (solicitacao && confirm(`Deseja realmente rejeitar a solicitação de ${solicitacao.empresa}?`)) {
    solicitacao.status = 'rejeitado'
    solicitacoesPendentes.value--
    stats.value[3].value = String(solicitacoesPendentes.value)
    alert('Solicitação rejeitada.')
  }
}

const verDetalhes = (id) => {
  alert(`Ver detalhes da solicitação #${id}`)
}

const criarGraficos = () => {
  // Configuração comum para gráficos
  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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

  // Gráfico de Receita
  new Chart(receitaChart.value, {
    type: 'bar',
    data: {
      labels: ['Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
      datasets: [{
        label: 'Receita',
        data: [450000, 520000, 480000, 680000, 590000, 720000],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderRadius: 8,
        borderWidth: 0,
        hoverBackgroundColor: 'rgba(16, 185, 129, 1)'
      }]
    },
    options: {
      ...commonOptions,
      plugins: {
        ...commonOptions.plugins,
        tooltip: {
          ...commonOptions.plugins.tooltip,
          callbacks: {
            label: (context) => 'Receita: ' + context.parsed.y.toLocaleString('pt-AO') + ' AOA'
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            callback: (value) => value.toLocaleString('pt-AO') + ' AOA'
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

  // Gráfico de SMS
  new Chart(smsChart.value, {
    type: 'line',
    data: {
      labels: ['Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
      datasets: [{
        label: 'SMS Enviados',
        data: [185000, 215000, 195000, 245000, 225000, 265000],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#3B82F6',
        pointHoverBorderColor: '#fff'
      }]
    },
    options: {
      ...commonOptions,
      plugins: {
        ...commonOptions.plugins,
        tooltip: {
          ...commonOptions.plugins.tooltip,
          callbacks: {
            label: (context) => 'SMS: ' + context.parsed.y.toLocaleString('pt-AO')
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          },
          ticks: {
            callback: (value) => value.toLocaleString('pt-AO')
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

// ===========================
// LIFECYCLE
// ===========================

onMounted(() => {
  atualizarDataHora()
  criarGraficos()
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
  margin-bottom: 0.5rem;
}

.stat-variacao {
  font-size: 0.75rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.stat-variacao.positiva {
  color: #10b981;
}

.stat-variacao.negativa {
  color: #ef4444;
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

.alert-warning {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-color: #fbbf24;
  color: #92400e;
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