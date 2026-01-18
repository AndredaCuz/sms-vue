<template>
  <navegacao/>

  <div class="fade-in">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">
          <i class="fas fa-chart-bar"></i> Resumo de Campanhas
        </h1>
        <p class="page-description">Análise detalhada do desempenho das suas campanhas</p>
      </div>
      <div class="header-actions">
       
        <button class="btn btn-outline" @click="refreshData">
          <i class="fas fa-sync-alt"></i> Atualizar
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card mb-4">
      <div class="card-header">
        <h3 class="card-title">
          <i class="fas fa-filter"></i> Filtros
        </h3>
      </div>
      <div class="card-body">
        <div class="filters-grid">
          <div class="filter-group">
            <label>Período</label>
            <select v-model="filters.period" class="form-control" @change="applyFilters">
              <option value="all">Todo o Período</option>
              <option value="today">Hoje</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mês</option>
              <option value="quarter">Este Trimestre</option>
              <option value="year">Este Ano</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Status</label>
            <select v-model="filters.status" class="form-control" @change="applyFilters">
              <option value="all">Todos os Status</option>
              <option value="draft">Rascunho</option>
              <option value="scheduled">Agendada</option>
              <option value="processing">Processando</option>
              <option value="completed">Concluída</option>
              <option value="failed">Falhou</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Ordenar por</label>
            <select v-model="filters.sort_by" class="form-control" @change="applyFilters">
              <option value="date">Data</option>
              <option value="recipients">Destinatários</option>
              <option value="sent">Enviados</option>
              <option value="delivered">Entregues</option>
              <option value="success_rate">Taxa de Sucesso</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Ordem</label>
            <select v-model="filters.sort_order" class="form-control" @change="applyFilters">
              <option value="desc">Decrescente</option>
              <option value="asc">Crescente</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Carregando resumo de campanhas...</p>
    </div>

    <!-- Campaign Summary -->
    <div v-else>
      <!-- Overall Stats -->
      <div class="grid grid-4 mb-4">
        <div class="stat-card-summary">
          <div class="stat-icon-large" style="background: var(--info-light); color: var(--info);">
            <i class="fas fa-bullhorn"></i>
          </div>
          <div class="stat-content-summary">
            <div class="stat-value-large">{{ formatNumber(summary.totalCampaigns) }}</div>
            <div class="stat-label-large">Total de Campanhas</div>
          </div>
        </div>

        <div class="stat-card-summary">
          <div class="stat-icon-large" style="background: var(--primary-light); color: var(--primary);">
            <i class="fas fa-users"></i>
          </div>
          <div class="stat-content-summary">
            <div class="stat-value-large">{{ formatNumber(summary.totalRecipients) }}</div>
            <div class="stat-label-large">Destinatários</div>
          </div>
        </div>

        <div class="stat-card-summary">
          <div class="stat-icon-large" style="background: var(--success-light); color: var(--success);">
            <i class="fas fa-check-double"></i>
          </div>
          <div class="stat-content-summary">
            <div class="stat-value-large">{{ formatNumber(summary.totalDelivered) }}</div>
            <div class="stat-label-large">Entregues</div>
            <div class="stat-percentage">{{ summary.deliveryRate }}% de entrega</div>
          </div>
        </div>

        <div class="stat-card-summary">
          <div class="stat-icon-large" style="background: var(--danger-light); color: var(--danger);">
            <i class="fas fa-times-circle"></i>
          </div>
          <div class="stat-content-summary">
            <div class="stat-value-large">{{ formatNumber(summary.totalFailed) }}</div>
            <div class="stat-label-large">Falhas</div>
            <div class="stat-percentage">{{ summary.failureRate }}% de falhas</div>
          </div>
        </div>
      </div>

      <!-- Status Distribution -->
      <div class="grid grid-2 mb-4">
        <!-- Status Chart -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="fas fa-chart-pie"></i> Distribuição por Status
            </h3>
          </div>
          <div class="card-body">
            <div class="chart-container">
              <canvas ref="statusChart"></canvas>
            </div>
          </div>
        </div>

        <!-- Performance Metrics -->
        <div class="card">
          <div class="card-header">
            <h3 class="card-title">
              <i class="fas fa-tachometer-alt"></i> Métricas de Performance
            </h3>
          </div>
          <div class="card-body">
            <div class="metrics-grid">
              <div class="metric-item">
                <div class="metric-label">Taxa de Entrega</div>
                <div class="metric-value" :class="getPerformanceClass(summary.deliveryRate)">
                  {{ summary.deliveryRate }}%
                </div>
                <div class="metric-bar">
                  <div class="metric-bar-fill" :style="{ width: summary.deliveryRate + '%' }"></div>
                </div>
              </div>

              <div class="metric-item">
                <div class="metric-label">Taxa de Falhas</div>
                <div class="metric-value" :class="getPerformanceClass(100 - summary.failureRate)">
                  {{ summary.failureRate }}%
                </div>
                <div class="metric-bar">
                  <div class="metric-bar-fill" :style="{ width: summary.failureRate + '%', background: 'var(--danger)' }"></div>
                </div>
              </div>

              <div class="metric-item">
                <div class="metric-label">Taxa de Abertura</div>
                <div class="metric-value" :class="getPerformanceClass(75)">
                  75%
                </div>
                <div class="metric-bar">
                  <div class="metric-bar-fill" :style="{ width: '75%', background: 'var(--warning)' }"></div>
                </div>
              </div>

              <div class="metric-item">
                <div class="metric-label">Tempo Médio de Envio</div>
                <div class="metric-value success">
                  4.2s
                </div>
                <div class="metric-bar">
                  <div class="metric-bar-fill" :style="{ width: '95%', background: 'var(--success)' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Campaigns by Status -->
      <div class="card mb-4">
        <div class="card-header">
          <h3 class="card-title">
            <i class="fas fa-list-ol"></i> Campanhas por Status
          </h3>
        </div>
        <div class="card-body" style="padding: 0;">
          <div v-if="campaignsData.length === 0" class="empty-state">
            <i class="fas fa-bullhorn"></i>
            <h3>Nenhuma campanha encontrada</h3>
            <p>Não há campanhas no período selecionado.</p>
          </div>

          <div v-else class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Quantidade</th>
                  <th>Destinatários</th>
                  <th>Enviados</th>
                  <th>Entregues</th>
                  <th>Falhas</th>
                  <th>Taxa de Sucesso</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in sortedCampaigns" :key="item.status">
                  <td>
                    <span class="status-badge-campaign" :class="getStatusClass(item.status)">
                      <i :class="getStatusIcon(item.status)"></i>
                      {{ getStatusText(item.status) }}
                    </span>
                  </td>
                  
                  <td>
                    <strong>{{ formatNumber(item.count) }}</strong>
                  </td>
                  
                  <td>
                    <div class="stat-cell">
                      <i class="fas fa-users"></i>
                      {{ formatNumber(item.total_recipients) }}
                    </div>
                  </td>
                  
                  <td>
                    <div class="stat-cell">
                      <i class="fas fa-paper-plane"></i>
                      {{ formatNumber(item.total_sent) }}
                    </div>
                  </td>
                  
                  <td>
                    <div class="stat-cell success">
                      <i class="fas fa-check-double"></i>
                      {{ formatNumber(item.total_delivered) }}
                    </div>
                  </td>
                  
                  <td>
                    <div class="stat-cell danger">
                      <i class="fas fa-times-circle"></i>
                      {{ formatNumber(item.total_failed) }}
                    </div>
                  </td>
                  
                  <td>
                    <div class="success-rate">
                      <span class="rate-value" :class="getSuccessRateClass(item)">
                        {{ calculateSuccessRate(item) }}%
                      </span>
                      <div class="rate-bar">
                        <div class="rate-bar-fill" :style="{ width: calculateSuccessRate(item) + '%' }"></div>
                      </div>
                    </div>
                  </td>
                  
                  <td>
                    <button 
                      class="btn btn-ghost btn-sm"
                      @click="viewCampaignsByStatus(item.status)"
                      title="Ver campanhas"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                    <button 
                      class="btn btn-ghost btn-sm"
                      @click="exportStatusReport(item.status)"
                      title="Exportar relatório"
                    >
                      <i class="fas fa-download"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Timeline Chart -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="fas fa-chart-line"></i> Evolução Temporal
          </h3>
        </div>
        <div class="card-body">
          <div class="chart-container">
            <canvas ref="timelineChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <!-- Campaigns Modal -->
    <div v-if="showCampaignsModal" class="modal-overlay" @click="closeCampaignsModal">
      <div class="modal-content modal-large" @click.stop>
        <div class="modal-header">
          <h3><i class="fas fa-bullhorn"></i> Campanhas - {{ selectedStatusText }}</h3>
          <button class="btn-close" @click="closeCampaignsModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="loadingCampaigns" class="loading-container-small">
            <div class="spinner-small"></div>
            <p>Carregando campanhas...</p>
          </div>
          
          <div v-else-if="statusCampaigns.length === 0" class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>Nenhuma campanha encontrada com este status</p>
          </div>
          
          <div v-else class="campaigns-list">
            <div v-for="campaign in statusCampaigns" :key="campaign.id" class="campaign-item">
              <div class="campaign-header">
                <div class="campaign-title">
                  <h4>{{ campaign.name }}</h4>
                  <span class="campaign-date">{{ formatDate(campaign.created_at) }}</span>
                </div>
                <span class="campaign-recipients">
                  <i class="fas fa-users"></i>
                  {{ formatNumber(campaign.recipients_count) }}
                </span>
              </div>
              
              <div class="campaign-stats">
                <div class="campaign-stat-item">
                  <div class="campaign-stat-label">Enviados</div>
                  <div class="campaign-stat-value">{{ formatNumber(campaign.sent_count) }}</div>
                </div>
                
                <div class="campaign-stat-item">
                  <div class="campaign-stat-label">Entregues</div>
                  <div class="campaign-stat-value success">{{ formatNumber(campaign.delivered_count) }}</div>
                </div>
                
                <div class="campaign-stat-item">
                  <div class="campaign-stat-label">Falhas</div>
                  <div class="campaign-stat-value danger">{{ formatNumber(campaign.failed_count) }}</div>
                </div>
                
                <div class="campaign-stat-item">
                  <div class="campaign-stat-label">Taxa</div>
                  <div class="campaign-stat-value" :class="getSuccessRateClass(campaign)">
                    {{ calculateCampaignSuccessRate(campaign) }}%
                  </div>
                </div>
              </div>
              
              <div class="campaign-actions">
                <button class="btn btn-ghost btn-sm" @click="viewCampaignDetails(campaign)">
                  <i class="fas fa-info-circle"></i> Detalhes
                </button>
                <button class="btn btn-ghost btn-sm">
                  <i class="fas fa-chart-bar"></i> Métricas
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import navegacao from '../../components/navegacao.vue';
import Chart from 'chart.js/auto';

export default {
  name: 'CampaignsSummary',
  components: {
    navegacao
  },
  data() {
    return {
      isLoading: true,
      campaignsData: [],
      filters: {
        period: 'all',
        status: 'all',
        sort_by: 'date',
        sort_order: 'desc'
      },
      summary: {
        totalCampaigns: 0,
        totalRecipients: 0,
        totalSent: 0,
        totalDelivered: 0,
        totalFailed: 0,
        deliveryRate: 0,
        failureRate: 0
      },
      showCampaignsModal: false,
      selectedStatus: '',
      selectedStatusText: '',
      statusCampaigns: [],
      loadingCampaigns: false,
      statusChart: null,
      timelineChart: null
    };
  },
  computed: {
    sortedCampaigns() {
      return [...this.campaignsData].sort((a, b) => {
        let valueA, valueB;
        
        switch (this.filters.sort_by) {
          case 'recipients':
            valueA = parseInt(a.total_recipients);
            valueB = parseInt(b.total_recipients);
            break;
          case 'sent':
            valueA = parseInt(a.total_sent);
            valueB = parseInt(b.total_sent);
            break;
          case 'delivered':
            valueA = parseInt(a.total_delivered);
            valueB = parseInt(b.total_delivered);
            break;
          case 'success_rate':
            valueA = this.calculateSuccessRate(a);
            valueB = this.calculateSuccessRate(b);
            break;
          default:
            // Para status, ordenar por ordem específica
            const statusOrder = ['completed', 'processing', 'scheduled', 'draft', 'failed'];
            valueA = statusOrder.indexOf(a.status);
            valueB = statusOrder.indexOf(b.status);
        }
        
        if (this.filters.sort_order === 'asc') {
          return valueA - valueB;
        } else {
          return valueB - valueA;
        }
      });
    }
  },
  methods: {
    async fetchCampaignsSummary() {
      this.isLoading = true;
      const token = localStorage.getItem('auth_token');

      if (!token) {
        this.$router.push('/login');
        return;
      }

      try {
        const response = await axios.get('https://api.devsms.online/api/v1/reports/campaigns-summary', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        this.campaignsData = response.data.data || [];
        this.calculateSummary();
        
        this.$nextTick(() => {
          this.updateCharts();
        });

      } catch (error) {
        console.error('Erro ao buscar resumo de campanhas:', error);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          this.$router.push('/login');
        } else {
          // Dados de exemplo para demonstração
          this.generateMockData();
          this.calculateSummary();
          this.$nextTick(() => {
            this.updateCharts();
          });
        }
      } finally {
        this.isLoading = false;
      }
    },

    generateMockData() {
      this.campaignsData = [
        {
          status: 'completed',
          count: 5,
          total_recipients: '1250',
          total_sent: '1245',
          total_delivered: '1180',
          total_failed: '65'
        },
        {
          status: 'processing',
          count: 2,
          total_recipients: '500',
          total_sent: '500',
          total_delivered: '480',
          total_failed: '20'
        },
        {
          status: 'scheduled',
          count: 3,
          total_recipients: '750',
          total_sent: '0',
          total_delivered: '0',
          total_failed: '0'
        },
        {
          status: 'draft',
          count: 4,
          total_recipients: '900',
          total_sent: '0',
          total_delivered: '0',
          total_failed: '0'
        },
        {
          status: 'failed',
          count: 1,
          total_recipients: '250',
          total_sent: '250',
          total_delivered: '150',
          total_failed: '100'
        }
      ];
    },

    calculateSummary() {
      let totalCampaigns = 0;
      let totalRecipients = 0;
      let totalSent = 0;
      let totalDelivered = 0;
      let totalFailed = 0;

      this.campaignsData.forEach(item => {
        totalCampaigns += parseInt(item.count) || 0;
        totalRecipients += parseInt(item.total_recipients) || 0;
        totalSent += parseInt(item.total_sent) || 0;
        totalDelivered += parseInt(item.total_delivered) || 0;
        totalFailed += parseInt(item.total_failed) || 0;
      });

      const deliveryRate = totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;
      const failureRate = totalSent > 0 ? Math.round((totalFailed / totalSent) * 100) : 0;

      this.summary = {
        totalCampaigns,
        totalRecipients,
        totalSent,
        totalDelivered,
        totalFailed,
        deliveryRate,
        failureRate
      };
    },

    updateCharts() {
      // Destruir gráficos existentes
      if (this.statusChart) {
        this.statusChart.destroy();
      }
      if (this.timelineChart) {
        this.timelineChart.destroy();
      }

      // Criar Status Chart (Pizza)
      const statusCtx = this.$refs.statusChart?.getContext('2d');
      if (statusCtx) {
        const labels = this.campaignsData.map(item => this.getStatusText(item.status));
        const data = this.campaignsData.map(item => parseInt(item.count));
        const backgroundColors = this.campaignsData.map(item => this.getStatusColor(item.status));

        this.statusChart = new Chart(statusCtx, {
          type: 'pie',
          data: {
            labels: labels,
            datasets: [{
              data: data,
              backgroundColor: backgroundColors,
              borderWidth: 2,
              borderColor: 'white'
            }]
          },
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  padding: 20,
                  usePointStyle: true
                }
              },
              title: {
                display: true,
                text: 'Distribuição de Campanhas por Status',
                font: {
                  size: 14
                }
              }
            }
          }
        });
      }

      // Criar Timeline Chart (Linha)
      const timelineCtx = this.$refs.timelineChart?.getContext('2d');
      if (timelineCtx) {
        // Dados mock para timeline (pode ser substituído por API real)
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const campaignCounts = months.map(() => Math.floor(Math.random() * 10) + 1);
        const successRates = months.map(() => Math.floor(Math.random() * 30) + 70);

        this.timelineChart = new Chart(timelineCtx, {
          type: 'line',
          data: {
            labels: months,
            datasets: [
              {
                label: 'Campanhas',
                data: campaignCounts,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                yAxisID: 'y'
              },
              {
                label: 'Taxa de Sucesso (%)',
                data: successRates,
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                yAxisID: 'y1'
              }
            ]
          },
          options: {
            responsive: true,
            interaction: {
              mode: 'index',
              intersect: false
            },
            plugins: {
              title: {
                display: true,
                text: 'Evolução de Campanhas e Performance',
                font: {
                  size: 14
                }
              }
            },
            scales: {
              y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                  display: true,
                  text: 'Número de Campanhas'
                }
              },
              y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                  display: true,
                  text: 'Taxa de Sucesso (%)'
                },
                grid: {
                  drawOnChartArea: false
                }
              }
            }
          }
        });
      }
    },

    async viewCampaignsByStatus(status) {
      this.selectedStatus = status;
      this.selectedStatusText = this.getStatusText(status);
      this.showCampaignsModal = true;
      this.loadingCampaigns = true;

      try {
        // Simular carregamento de campanhas por status
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados mock - substituir por API real quando disponível
        this.statusCampaigns = Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          name: `Campanha ${this.selectedStatusText} ${i + 1}`,
          created_at: new Date(Date.now() - i * 86400000).toISOString(),
          recipients_count: Math.floor(Math.random() * 500) + 100,
          sent_count: Math.floor(Math.random() * 500) + 100,
          delivered_count: Math.floor(Math.random() * 450) + 80,
          failed_count: Math.floor(Math.random() * 50) + 5
        }));
      } catch (error) {
        console.error('Erro ao buscar campanhas:', error);
      } finally {
        this.loadingCampaigns = false;
      }
    },

    closeCampaignsModal() {
      this.showCampaignsModal = false;
      this.selectedStatus = '';
      this.selectedStatusText = '';
      this.statusCampaigns = [];
    },

    applyFilters() {
      this.fetchCampaignsSummary();
    },

    refreshData() {
      this.fetchCampaignsSummary();
    },

    exportReport() {
      const data = {
        summary: this.summary,
        campaigns: this.campaignsData,
        filters: this.filters,
        generated_at: new Date().toISOString()
      };
      
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const exportFileDefaultName = `relatorio-campanhas-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    },

    exportStatusReport(status) {
      const statusData = this.campaignsData.find(item => item.status === status);
      if (statusData) {
        const dataStr = JSON.stringify(statusData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `relatorio-${status}-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      }
    },

    viewCampaignDetails(campaign) {
      // Implementar navegação para detalhes da campanha
      alert(`Detalhes da campanha: ${campaign.name}`);
    },

    // Helper Methods
    formatNumber(num) {
      return new Intl.NumberFormat('pt-AO').format(num);
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-AO');
    },

    getStatusClass(status) {
      const classes = {
        'completed': 'status-completed',
        'processing': 'status-processing',
        'scheduled': 'status-scheduled',
        'draft': 'status-draft',
        'failed': 'status-failed'
      };
      return classes[status] || 'status-draft';
    },

    getStatusIcon(status) {
      const icons = {
        'completed': 'fas fa-check-circle',
        'processing': 'fas fa-sync-alt fa-spin',
        'scheduled': 'far fa-clock',
        'draft': 'fas fa-edit',
        'failed': 'fas fa-times-circle'
      };
      return icons[status] || 'fas fa-circle';
    },

    getStatusText(status) {
      const texts = {
        'completed': 'Concluída',
        'processing': 'Processando',
        'scheduled': 'Agendada',
        'draft': 'Rascunho',
        'failed': 'Falhou'
      };
      return texts[status] || status;
    },

    getStatusColor(status) {
      const colors = {
        'completed': 'rgb(16, 185, 129)',
        'processing': 'rgb(59, 130, 246)',
        'scheduled': 'rgb(245, 158, 11)',
        'draft': 'rgb(107, 114, 128)',
        'failed': 'rgb(239, 68, 68)'
      };
      return colors[status] || 'rgb(107, 114, 128)';
    },

    calculateSuccessRate(item) {
      const totalSent = parseInt(item.total_sent) || 0;
      const totalDelivered = parseInt(item.total_delivered) || 0;
      return totalSent > 0 ? Math.round((totalDelivered / totalSent) * 100) : 0;
    },

    calculateCampaignSuccessRate(campaign) {
      const sent = campaign.sent_count || 0;
      const delivered = campaign.delivered_count || 0;
      return sent > 0 ? Math.round((delivered / sent) * 100) : 0;
    },

    getSuccessRateClass(item) {
      const rate = this.calculateSuccessRate(item);
      if (rate >= 90) return 'success';
      if (rate >= 70) return 'warning';
      return 'danger';
    },

    getPerformanceClass(value) {
      if (value >= 90) return 'success';
      if (value >= 70) return 'warning';
      return 'danger';
    }
  },
  mounted() {
    this.fetchCampaignsSummary();
  },
  beforeUnmount() {
    if (this.statusChart) {
      this.statusChart.destroy();
    }
    if (this.timelineChart) {
      this.timelineChart.destroy();
    }
  }
};
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-800);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-description {
  color: var(--gray-600);
  font-size: 1rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group label {
  display: block;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-control {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 2px solid var(--gray-300);
  border-radius: 8px;
  font-size: 0.938rem;
  transition: all 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--gray-200);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.stat-card-summary {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.stat-card-summary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.stat-icon-large {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  flex-shrink: 0;
}

.stat-content-summary {
  flex: 1;
}

.stat-value-large {
  font-size: 2rem;
  font-weight: 800;
  color: var(--gray-800);
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label-large {
  font-size: 0.875rem;
  color: var(--gray-600);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.stat-percentage {
  font-size: 0.75rem;
  color: var(--gray-500);
  font-weight: 500;
}

.chart-container {
  height: 300px;
  position: relative;
}

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metric-label {
  font-size: 0.875rem;
  color: var(--gray-600);
  font-weight: 600;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
}

.metric-value.success {
  color: var(--success);
}

.metric-value.warning {
  color: var(--warning);
}

.metric-value.danger {
  color: var(--danger);
}

.metric-bar {
  height: 8px;
  background: var(--gray-200);
  border-radius: 4px;
  overflow: hidden;
}

.metric-bar-fill {
  height: 100%;
  background: var(--success);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.status-badge-campaign {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
}

.status-badge-campaign.status-completed {
  background: var(--success-light);
  color: var(--success);
}

.status-badge-campaign.status-processing {
  background: var(--info-light);
  color: var(--info);
}

.status-badge-campaign.status-scheduled {
  background: var(--warning-light);
  color: var(--warning);
}

.status-badge-campaign.status-draft {
  background: var(--gray-100);
  color: var(--gray-700);
}

.status-badge-campaign.status-failed {
  background: var(--danger-light);
  color: var(--danger);
}

.stat-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
}

.stat-cell.success {
  color: var(--success);
}

.stat-cell.danger {
  color: var(--danger);
}

.success-rate {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 100px;
}

.rate-value {
  font-weight: 700;
  font-size: 1rem;
}

.rate-value.success {
  color: var(--success);
}

.rate-value.warning {
  color: var(--warning);
}

.rate-value.danger {
  color: var(--danger);
}

.rate-bar {
  height: 6px;
  background: var(--gray-200);
  border-radius: 3px;
  overflow: hidden;
}

.rate-bar-fill {
  height: 100%;
  background: var(--success);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--gray-500);
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
}

.modal-overlay {
  position: fixed;
  inset: 0;
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
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-large {
  max-width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid var(--gray-200);
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-800);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-close {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s;
  color: var(--gray-600);
  font-size: 1.25rem;
}

.btn-close:hover {
  background: var(--gray-100);
  color: var(--gray-800);
}

.modal-body {
  padding: 1.5rem;
}

.loading-container-small {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.spinner-small {
  width: 40px;
  height: 40px;
  border: 3px solid var(--gray-200);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.campaigns-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.campaign-item {
  padding: 1.5rem;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  transition: all 0.3s;
}

.campaign-item:hover {
  border-color: var(--primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.campaign-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.campaign-title h4 {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--gray-800);
  margin: 0 0 0.25rem 0;
}

.campaign-date {
  font-size: 0.813rem;
  color: var(--gray-600);
}

.campaign-recipients {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--gray-100);
  border-radius: 20px;
  font-weight: 600;
  color: var(--gray-700);
}

.campaign-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.campaign-stat-item {
  text-align: center;
  padding: 1rem;
  background: var(--gray-50);
  border-radius: 8px;
}

.campaign-stat-label {
  font-size: 0.75rem;
  color: var(--gray-600);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.campaign-stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-800);
}

.campaign-stat-value.success {
  color: var(--success);
}

.campaign-stat-value.danger {
  color: var(--danger);
}

.campaign-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.grid {
  display: grid;
  gap: 1.5rem;
}

.grid-2 {
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
}

.grid-4 {
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .grid-2,
  .grid-4 {
    grid-template-columns: 1fr;
  }
  
  .campaign-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  

  .campaign-header {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>