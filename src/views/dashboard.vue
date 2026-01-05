<template>


<navegacao/>



  <div class="fade-in">
    <!-- Page Header -->
    <div style="margin-bottom: 2rem;">
     
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-4 mb-4">
      <div class="stat-card" v-for="(card, index) in statCards" :key="index">
        <div class="stat-icon" :style="{ background: card.bgColor, color: 'white' }">
          <i :class="card.icon"></i>
        </div>
        <div class="stat-value">{{ card.value }}</div>
        <div class="stat-label">{{ card.label }}</div>
        <div class="stat-trend" :class="card.trendClass">
          <i :class="card.trendIcon"></i>
          <span>{{ card.trendText }}</span>
        </div>
      </div>
    </div>

    <!-- Quick Actions & Recent Activity -->
    <div class="grid grid-2 mb-4">
      <!-- Quick Actions -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Ações Rápidas</h3>
        </div>
        <div class="card-body">
          <div style="display: grid; gap: 1rem;">
            <router-link to="/enviarsms" class="btn btn-accent btn-lg w-100">
              <i class="fas fa-paper-plane"></i> Enviar SMS
            </router-link>
            <router-link to="/meucontatos" class="btn btn-primary w-100">
              <i class="fas fa-user-plus"></i> Meus Contactos
            </router-link>
            <router-link to="/contatos/importar" class="btn btn-outline w-100">
              <i class="fas fa-file-import"></i> Importar Contatos
            </router-link>
            <router-link to="/credito" class="btn btn-success w-100">
              <i class="fas fa-shopping-cart"></i> Comprar Créditos
            </router-link>
          </div>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Atividade Recente</h3>
        </div>
        <div class="card-body" style="max-height: 400px; overflow-y: auto;">
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            <div v-for="(act, index) in recentActivities" :key="index"
                 style="display: flex; gap: 1rem; padding: 1rem; background: var(--gray-50); border-radius: 10px;">
              <div style="width: 40px; height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;"
                   :style="{ background: act.bgColor }">
                <i :class="act.icon" :style="{ color: act.iconColor }"></i>
              </div>
              <div style="flex: 1;">
                <div style="font-weight: 600; color: var(--gray-800); margin-bottom: 0.25rem;">
                  {{ act.title }}
                </div>
                <div style="font-size: 0.875rem; color: var(--gray-600); margin-bottom: 0.25rem;">
                  {{ act.description }}
                </div>
                <div style="font-size: 0.813rem; color: var(--gray-500);">
                  <i class="far fa-clock"></i> {{ act.time }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="grid grid-2 mb-4">
      <!-- Envios por Mês -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Envios dos Últimos 6 Meses</h3>
        </div>
        <div class="card-body">
          <canvas ref="enviosChart" style="max-height: 300px;"></canvas>
        </div>
      </div>

      <!-- Taxa de Entrega -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Taxa de Entrega</h3>
        </div>
        <div class="card-body" style="display:flex;align-items:center;justify-content:center;padding:2rem;">
          <div style="text-align:center;">
            <div style="width:200px;height:200px;margin:0 auto;position:relative;">
              <svg style="transform: rotate(-90deg);" width="200" height="200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="var(--gray-200)" stroke-width="20"/>
                <circle cx="100" cy="100" r="90" fill="none" stroke="var(--success)" stroke-width="20"
                        stroke-dasharray="565" stroke-dashoffset="56.5" stroke-linecap="round"/>
              </svg>
              <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);">
                <div style="font-size:3rem;font-weight:700;color:var(--primary-dark);">98%</div>
                <div style="font-size:0.875rem;color:var(--gray-600);text-transform:uppercase;letter-spacing:1px;">
                  Entregues
                </div>
              </div>
            </div>
            <div style="margin-top:2rem; display:flex; gap:2rem; justify-content:center;">
              <div>
                <div style="font-size:1.5rem; font-weight:700; color: var(--success);">27,890</div>
                <div style="font-size:0.813rem; color: var(--gray-600);">Entregues</div>
              </div>
              <div>
                <div style="font-size:1.5rem; font-weight:700; color: var(--danger);">560</div>
                <div style="font-size:0.813rem; color: var(--gray-600);">Falharam</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top Grupos -->
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h3 class="card-title">Grupos Mais Utilizados</h3>
        <router-link to="/grupos" class="btn btn-ghost btn-sm">
          Ver Todos <i class="fas fa-arrow-right"></i>
        </router-link>
      </div>
      <div class="card-body" style="padding:0;">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>Grupo</th>
                <th>Membros</th>
                <th>SMS Enviados</th>
                <th>Última Campanha</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(grupo, index) in grupos" :key="index">
                <td>
                  <div style="display:flex;align-items:center;gap:0.75rem;">
                    <div style="width:40px;height:40px; border-radius:8px; display:flex; align-items:center; justify-content:center;"
                         :style="{ background: grupo.bgColor }">
                      <i :class="grupo.icon" :style="{ color: grupo.iconColor }"></i>
                    </div>
                    <div>
                      <div style="font-weight:600;">{{ grupo.name }}</div>
                      <div style="font-size:0.813rem;color:var(--gray-600)">{{ grupo.description }}</div>
                    </div>
                  </div>
                </td>
                <td><span style="font-weight:600">{{ grupo.members }}</span> contatos</td>
                <td><span style="font-weight:600; color: var(--primary)">{{ grupo.smsSent }}</span> SMS</td>
                <td>{{ grupo.lastCampaign }}</td>
                <td>
                  <span class="badge badge-success" v-if="grupo.status === 'Ativo'">
                    <i class="fas fa-circle" style="font-size:0.5rem;"></i> {{ grupo.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Chart from 'chart.js/auto'
import navegacao from '../components/navegacao.vue'


// Dados exemplo (substitua com API real)
const statCards = ref([
  { icon: 'fas fa-wallet', value: 5420, label: 'Créditos Disponíveis', trendClass: 'up', trendIcon:'fas fa-arrow-up', trendText: '+12% este mês', bgColor: 'linear-gradient(135deg, #10B981, #059669)' },
  { icon: 'fas fa-paper-plane', value: 28450, label: 'SMS Enviados', trendClass: 'up', trendIcon:'fas fa-arrow-up', trendText: '+8.2% este mês', bgColor: 'linear-gradient(135deg, #3B82F6, #2563EB)' },
  { icon: 'fas fa-address-book', value: 1247, label: 'Total de Contatos', trendClass: 'up', trendIcon:'fas fa-arrow-up', trendText: '+5 novos', bgColor: 'linear-gradient(135deg, #F59E0B, #D97706)' },
  { icon: 'fas fa-users', value: 12, label: 'Grupos Ativos', trendClass: '', trendIcon:'fas fa-minus', trendText: 'Sem alteração', bgColor: 'linear-gradient(135deg, #8B5CF6, #7C3AED)' }
])

const recentActivities = ref([
  { title: 'SMS Enviado com Sucesso', description: '150 mensagens enviadas para o grupo "Vendedores"', time: 'Há 2 horas', icon: 'fas fa-paper-plane', iconColor: 'var(--success)', bgColor:'var(--success-light)' },
  { title: 'Novos Contatos Adicionados', description: '25 contatos importados via Excel', time: 'Há 5 horas', icon: 'fas fa-user-plus', iconColor:'var(--info)', bgColor:'var(--info-light)' },
  { title: 'Créditos Adicionados', description: '+1000 créditos SMS - Pacote Standard', time: 'Ontem às 14:30', icon:'fas fa-shopping-cart', iconColor:'var(--warning)', bgColor:'var(--warning-light)'},
  { title: 'Campanha Automática', description: 'Mensagem de aniversário enviada para 8 contatos', time:'Ontem às 09:00', icon:'fas fa-paper-plane', iconColor:'var(--success)', bgColor:'var(--success-light)'}
])

const grupos = ref([
  { name:'Vendedores', description:'Equipe de vendas', members:150, smsSent:'8,542', lastCampaign:'Há 2 horas', status:'Ativo', icon:'fas fa-briefcase', iconColor:'var(--info)', bgColor:'var(--info-light)' },
  { name:'Recursos Humanos', description:'Departamento RH', members:87, smsSent:'4,231', lastCampaign:'Há 1 dia', status:'Ativo', icon:'fas fa-users', iconColor:'var(--warning)', bgColor:'var(--warning-light)'},
  { name:'Motoristas', description:'Equipe de logística', members:64, smsSent:'3,897', lastCampaign:'Há 3 dias', status:'Ativo', icon:'fas fa-truck', iconColor:'var(--success)', bgColor:'var(--success-light)'}
])

const enviosChart = ref(null)

onMounted(() => {
  new Chart(enviosChart.value, {
    type: 'line',
    data: {
      labels: ['Jul','Ago','Set','Out','Nov','Dez'],
      datasets:[{
        label:'SMS Enviados',
        data:[3200,4100,3800,5200,4800,5600],
        borderColor:'rgb(245, 158, 11)',
        backgroundColor:'rgba(245,158,11,0.1)',
        tension:0.4,
        fill:true,
        borderWidth:3,
        pointRadius:5,
        pointHoverRadius:7
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      plugins:{ legend:{ display:false } },
      scales:{
        y:{ beginAtZero:true, grid:{ color:'rgba(0,0,0,0.05)' } },
        x:{ grid:{ display:false } }
      }
    }
  })
})
</script>


