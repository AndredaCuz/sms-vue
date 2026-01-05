<template>

  <navegacao/>
  <div class="fade-in">

    <!-- HEADER -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Painel Administrativo</h1>
        <p class="page-subtitle">Visão geral do sistema e estatísticas gerais</p>
      </div>

      <RouterLink to="/admin/gerenciar" class="btn btn-accent">
        Gerir <i class="fas fa-cog"></i>
      </RouterLink>
    </div>

    <!-- STATS -->
    <div class="grid grid-4 mb-4">
      <div class="stat-card" v-for="s in stats" :key="s.label">
        <div class="stat-icon" :style="{ background: s.bg, color: '#fff' }">
          <i :class="s.icon"></i>
        </div>
        <div class="stat-value">{{ s.value }}</div>
        <div class="stat-label">{{ s.label }}</div>
      </div>
    </div>

    <!-- ALERT -->
    <div v-if="solicitacoesPendentes > 0" class="alert alert-warning mb-4">
      <i class="fas fa-exclamation-triangle"></i>
      <strong>Atenção!</strong>
      Você tem {{ solicitacoesPendentes }} solicitações pendentes.
      <RouterLink to="/admin/solicitacoes">Ver solicitações</RouterLink>
    </div>

    <!-- CHARTS -->
    <div class="grid grid-2 mb-4">
      <div class="card">
        <h3 class="card-title">Receita dos Últimos 6 Meses</h3>
        <canvas ref="receitaChart"></canvas>
      </div>

      <div class="card">
        <h3 class="card-title">SMS Enviados por Mês</h3>
        <canvas ref="smsChart"></canvas>
      </div>
    </div>

    <!-- SOLICITAÇÕES -->
    <div class="card">
      <h3 class="card-title">Solicitações Recentes</h3>

      <div class="solicitacao" v-for="s in solicitacoes" :key="s.empresa">
        <div>
          <strong>{{ s.empresa }}</strong><br />
          {{ s.pacote }} - {{ s.valor }}
        </div>

        <span
          class="badge"
          :class="s.status === 'pendente' ? 'badge-warning' : 'badge-success'"
        >
          {{ s.status }}
        </span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Chart } from 'chart.js/auto'
import navegacao from '../../components/navegacao.vue'

/* =========================
   DADOS MOCKADOS
========================= */

const solicitacoesPendentes = 3

const stats = [
  {
    label: 'Empresas Ativas',
    value: 47,
    icon: 'fas fa-building',
    bg: 'linear-gradient(135deg,#3B82F6,#2563EB)'
  },
  {
    label: 'SMS Enviados',
    value: '1.245.890',
    icon: 'fas fa-paper-plane',
    bg: 'linear-gradient(135deg,#10B981,#059669)'
  },
  {
    label: 'Créditos Vendidos',
    value: '458.720',
    icon: 'fas fa-wallet',
    bg: 'linear-gradient(135deg,#F59E0B,#D97706)'
  },
  {
    label: 'Solicitações Pendentes',
    value: solicitacoesPendentes,
    icon: 'fas fa-clock',
    bg: 'linear-gradient(135deg,#EF4444,#DC2626)'
  }
]

const solicitacoes = ref([
  { empresa: 'Tech Solutions Lda', pacote: '5000 SMS', valor: '50.000 AOA', status: 'pendente' },
  { empresa: 'Mega Store Angola', pacote: '2000 SMS', valor: '22.000 AOA', status: 'aprovado' },
  { empresa: 'Farmácias Central', pacote: '10000 SMS', valor: '95.000 AOA', status: 'pendente' }
])

/* =========================
   CHARTS
========================= */

const receitaChart = ref(null)
const smsChart = ref(null)

onMounted(() => {
  new Chart(receitaChart.value, {
    type: 'bar',
    data: {
      labels: ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      datasets: [{
        data: [450000, 520000, 480000, 680000, 590000, 720000],
        backgroundColor: 'rgba(16,185,129,0.8)',
        borderRadius: 8
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  })

  new Chart(smsChart.value, {
    type: 'line',
    data: {
      labels: ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
      datasets: [{
        data: [185000, 215000, 195000, 245000, 225000, 265000],
        borderColor: '#3B82F6',
        fill: true,
        tension: 0.4
      }]
    },
    options: { responsive: true, plugins: { legend: { display: false } } }
  })
})
</script>
