<template>
  <navegacao/>

  <div class="campaigns-page fade-in">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">
            <i class="fas fa-bullhorn"></i>
            Minhas Campanhas
          </h1>
          <p class="page-subtitle">
            Gerencie suas campanhas de SMS
          </p>
        </div>
      </div>
      <div class="header-actions">
        <select v-model="filtroStatus" @change="filtrarCampanhas" class="filter-select">
          <option value="all">Todas</option>
          <option value="completed">Concluídas</option>
          <option value="pending">Pendentes</option>
          <option value="processing">Em Processamento</option>
          <option value="failed">Falhadas</option>
        </select>
        <router-link :to="{ name: 'Criar_campanhas' }" class="btn btn-primary">
          <i class="fas fa-plus"></i>
          Nova Campanha
        </router-link>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
          <i class="fas fa-bullhorn"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ totalCampanhas }}</h3>
          <p class="stat-label">Total de Campanhas</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
          <i class="fas fa-paper-plane"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ totalEnviados }}</h3>
          <p class="stat-label">SMS Enviados</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ totalEntregues }}</h3>
          <p class="stat-label">SMS Entregues</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
          <i class="fas fa-dollar-sign"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ custoTotal }} Kz</h3>
          <p class="stat-label">Custo Total</p>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Carregando campanhas...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="campanhas.length === 0" class="empty-state">
      <div class="empty-icon">
        <i class="fas fa-bullhorn"></i>
      </div>
      <h3>Nenhuma campanha encontrada</h3>
      <p>Crie sua primeira campanha para enviar SMS em massa</p>
      <router-link :to="{ name: 'CriarCampanha' }" class="btn btn-primary">
        <i class="fas fa-plus"></i>
        Criar Primeira Campanha
      </router-link>
    </div>

    <!-- Lista de Campanhas -->
    <div v-else class="campaigns-list">
      <div 
        v-for="campanha in campanhas" 
        :key="campanha.id"
        class="campaign-card"
        :class="'status-' + campanha.status"
      >
        <!-- Header do Card -->
        <div class="campaign-header">
          <div class="campaign-info">
            <h3 class="campaign-name">
              <i class="fas fa-bullhorn"></i>
              {{ campanha.name }}
            </h3>
            <p class="campaign-user">
              <i class="fas fa-user"></i>
              Criado por: {{ campanha.user?.name || 'N/A' }}
            </p>
          </div>
          <div class="campaign-status">
            <span class="status-badge" :class="'badge-' + campanha.status">
              <i :class="getStatusIcon(campanha.status)"></i>
              {{ getStatusLabel(campanha.status) }}
            </span>
          </div>
        </div>

        <!-- Corpo do Card -->
        <div class="campaign-body">
          <div class="campaign-message">
            <p class="message-label">
              <i class="fas fa-comment-dots"></i>
              Mensagem:
            </p>
            <p class="message-text">{{ campanha.message_body }}</p>
          </div>

          <div class="campaign-details">
            <div class="detail-item">
              <i class="fas fa-layer-group"></i>
              <span>Tipo: <strong>{{ getTipoLabel(campanha.type) }}</strong></span>
            </div>
            <div class="detail-item" v-if="campanha.scheduled_at">
              <i class="fas fa-clock"></i>
              <span>Agendado: <strong>{{ formatarDataHora(campanha.scheduled_at) }}</strong></span>
            </div>
            <div class="detail-item">
              <i class="fas fa-bullseye"></i>
              <span>Alvo: <strong>{{ getTargetLabel(campanha.target_type) }}</strong></span>
            </div>
          </div>

          <!-- Estatísticas -->
          <div class="campaign-stats">
            <div class="stat-item">
              <div class="stat-icon-sm" style="background: #6366f1;">
                <i class="fas fa-users"></i>
              </div>
              <div class="stat-info">
                <p class="stat-value-sm">{{ campanha.total_recipients }}</p>
                <p class="stat-label-sm">Destinatários</p>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon-sm" style="background: #10b981;">
                <i class="fas fa-paper-plane"></i>
              </div>
              <div class="stat-info">
                <p class="stat-value-sm">{{ campanha.sent_count }}</p>
                <p class="stat-label-sm">Enviados</p>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon-sm" style="background: #3b82f6;">
                <i class="fas fa-check"></i>
              </div>
              <div class="stat-info">
                <p class="stat-value-sm">{{ campanha.delivered_count }}</p>
                <p class="stat-label-sm">Entregues</p>
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-icon-sm" style="background: #ef4444;">
                <i class="fas fa-times"></i>
              </div>
              <div class="stat-info">
                <p class="stat-value-sm">{{ campanha.failed_count }}</p>
                <p class="stat-label-sm">Falhados</p>
              </div>
            </div>
          </div>

          <!-- Progress Bar -->
          <div class="progress-section">
            <div class="progress-info">
              <span>Taxa de Entrega</span>
              <span><strong>{{ calcularTaxaEntrega(campanha) }}%</strong></span>
            </div>
            <div class="progress-bar">
              <div 
                class="progress-fill"
                :style="{ width: calcularTaxaEntrega(campanha) + '%' }"
              ></div>
            </div>
          </div>

          <!-- Datas e Custo -->
          <div class="campaign-footer">
            <div class="footer-info">
              <div class="info-item">
                <i class="fas fa-calendar-plus"></i>
                <span>Criado: {{ formatarData(campanha.created_at) }}</span>
              </div>
              <div class="info-item" v-if="campanha.started_at">
                <i class="fas fa-play-circle"></i>
                <span>Iniciado: {{ formatarDataHora(campanha.started_at) }}</span>
              </div>
              <div class="info-item" v-if="campanha.completed_at">
                <i class="fas fa-check-circle"></i>
                <span>Concluído: {{ formatarDataHora(campanha.completed_at) }}</span>
              </div>
            </div>
            <div class="cost-badge">
              <i class="fas fa-dollar-sign"></i>
              {{ campanha.total_cost }} Kz
            </div>
          </div>
        </div>

        <!-- Ações -->
        <div class="campaign-actions">
          <!-- Enviar Campanha (apenas para pending) -->
          <button 
            v-if=" campanha.status === 'draft' ||campanha.status === 'pending' || campanha.status === 'scheduled'"
            @click="enviarCampanha(campanha)" 
            class="btn-action btn-send"
          >
            <i class="fas fa-paper-plane"></i>
            Enviar Agora
          </button>

          <!-- Cancelar Campanha (apenas para processing ou scheduled) -->
          <button 
            v-if="campanha.status === 'processing' || campanha.status === 'scheduled'"
            @click="cancelarCampanha(campanha)" 
            class="btn-action btn-cancel-campaign"
          >
            <i class="fas fa-ban"></i>
            Cancelar
          </button>

          <button @click="verDestinatarios(campanha)" class="btn-action btn-recipients">
            <i class="fas fa-users"></i>
            Destinatários
          </button>
          <button @click="verEstatisticas(campanha)" class="btn-action btn-stats">
            <i class="fas fa-chart-bar"></i>
            Estatísticas
          </button>
          <button @click="duplicarCampanha(campanha)" class="btn-action btn-duplicate">
            <i class="fas fa-copy"></i>
            Duplicar
          </button>
          <button @click="excluirCampanha(campanha)" class="btn-action btn-delete">
            <i class="fas fa-trash"></i>
            Excluir
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Destinatários -->
    <div v-if="mostrarModalDestinatarios" class="modal-overlay" @click="fecharModalDestinatarios">
      <div class="modal-content modal-large" @click.stop>
        <div class="modal-header">
          <h2>
            <i class="fas fa-users"></i>
            Destinatários da Campanha
          </h2>
          <button @click="fecharModalDestinatarios" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div v-if="isLoadingDestinatarios" class="loading-state-sm">
            <div class="spinner"></div>
            <p>Carregando destinatários...</p>
          </div>

          <div v-else>
            <div class="recipients-stats">
              <div class="stat-box">
                <i class="fas fa-users"></i>
                <span>{{ destinatarios.length }} Destinatários</span>
              </div>
              <div class="stat-box sent">
                <i class="fas fa-paper-plane"></i>
                <span>{{ destinatarios.filter(d => d.status === 'sent').length }} Enviados</span>
              </div>
              <div class="stat-box delivered">
                <i class="fas fa-check-circle"></i>
                <span>{{ destinatarios.filter(d => d.status === 'delivered').length }} Entregues</span>
              </div>
              <div class="stat-box failed">
                <i class="fas fa-times-circle"></i>
                <span>{{ destinatarios.filter(d => d.status === 'failed').length }} Falhados</span>
              </div>
            </div>

            <div class="recipients-table">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Telefone</th>
                    <th>Status</th>
                    <th>Enviado Em</th>
                    <th>Erro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="dest in destinatarios" :key="dest.id">
                    <td>
                      <div class="client-info">
                        <div class="client-avatar">
                          {{ dest.client_name.charAt(0).toUpperCase() }}
                        </div>
                        <span>{{ dest.client_name }}</span>
                      </div>
                    </td>
                    <td>{{ dest.phone }}</td>
                    <td>
                      <span class="status-tag" :class="'status-' + dest.status">
                        {{ getRecipientStatusLabel(dest.status) }}
                      </span>
                    </td>
                    <td>{{ formatarDataHora(dest.sent_at) }}</td>
                    <td>
                      <span v-if="dest.error_message" class="error-msg">
                        {{ dest.error_message }}
                      </span>
                      <span v-else>-</span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div v-if="destinatarios.length === 0" class="empty-state-sm">
                <i class="fas fa-inbox"></i>
                <p>Nenhum destinatário encontrado</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Estatísticas -->
    <div v-if="mostrarModalEstatisticas" class="modal-overlay" @click="fecharModalEstatisticas">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>
            <i class="fas fa-chart-bar"></i>
            Estatísticas da Campanha
          </h2>
          <button @click="fecharModalEstatisticas" class="btn-close">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="modal-body">
          <div v-if="isLoadingEstatisticas" class="loading-state-sm">
            <div class="spinner"></div>
            <p>Carregando estatísticas...</p>
          </div>

          <div v-else-if="estatisticas">
            <div class="stats-header">
              <h3>{{ estatisticas.name }}</h3>
              <span class="status-badge" :class="'badge-' + estatisticas.status">
                {{ getStatusLabel(estatisticas.status) }}
              </span>
            </div>

            <div class="stats-grid-modal">
              <div class="stat-card-modal">
                <div class="stat-icon-modal" style="background: #6366f1;">
                  <i class="fas fa-users"></i>
                </div>
                <div class="stat-content-modal">
                  <h4>{{ estatisticas.total_recipients }}</h4>
                  <p>Total de Destinatários</p>
                </div>
              </div>

              <div class="stat-card-modal">
                <div class="stat-icon-modal" style="background: #10b981;">
                  <i class="fas fa-paper-plane"></i>
                </div>
                <div class="stat-content-modal">
                  <h4>{{ estatisticas.sent_count }}</h4>
                  <p>Mensagens Enviadas</p>
                </div>
              </div>

              <div class="stat-card-modal">
                <div class="stat-icon-modal" style="background: #3b82f6;">
                  <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-content-modal">
                  <h4>{{ estatisticas.delivered_count }}</h4>
                  <p>Mensagens Entregues</p>
                </div>
              </div>

              <div class="stat-card-modal">
                <div class="stat-icon-modal" style="background: #ef4444;">
                  <i class="fas fa-times-circle"></i>
                </div>
                <div class="stat-content-modal">
                  <h4>{{ estatisticas.failed_count }}</h4>
                  <p>Falhas no Envio</p>
                </div>
              </div>
            </div>

            <div class="success-rate">
              <div class="rate-header">
                <span>Taxa de Sucesso</span>
                <span class="rate-value">{{ estatisticas.success_rate }}%</span>
              </div>
              <div class="rate-bar">
                <div class="rate-fill" :style="{ width: estatisticas.success_rate + '%' }"></div>
              </div>
            </div>

            <div class="stats-details">
              <div class="detail-row">
                <span class="detail-label">
                  <i class="fas fa-dollar-sign"></i>
                  Custo Total
                </span>
                <span class="detail-value">{{ estatisticas.total_cost }} Kz</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">
                  <i class="fas fa-play-circle"></i>
                  Iniciado Em
                </span>
                <span class="detail-value">{{ formatarDataHora(estatisticas.started_at) }}</span>
              </div>
              <div class="detail-row" v-if="estatisticas.completed_at">
                <span class="detail-label">
                  <i class="fas fa-check-circle"></i>
                  Concluído Em
                </span>
                <span class="detail-value">{{ formatarDataHora(estatisticas.completed_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Paginação -->
    <div v-if="pagination.last_page > 1" class="pagination">
      <button 
        @click="irParaPagina(pagination.current_page - 1)"
        :disabled="pagination.current_page === 1"
        class="pagination-btn"
      >
        <i class="fas fa-chevron-left"></i>
        Anterior
      </button>

      <div class="pagination-pages">
        <button
          v-for="page in paginasVisiveis"
          :key="page"
          @click="irParaPagina(page)"
          class="pagination-page"
          :class="{ 'page-active': page === pagination.current_page }"
        >
          {{ page }}
        </button>
      </div>

      <button 
        @click="irParaPagina(pagination.current_page + 1)"
        :disabled="pagination.current_page === pagination.last_page"
        class="pagination-btn"
      >
        Próximo
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import navegacao from '../../components/navegacao.vue';

export default {
  name: 'MinhasCampanhas',
  
  components: {
    navegacao
  },

  data() {
    return {
      isLoading: true,
      isLoadingDestinatarios: false,
      isLoadingEstatisticas: false,
      campanhas: [],
      filtroStatus: 'all',
      pagination: {
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0
      },
      mostrarModalDestinatarios: false,
      mostrarModalEstatisticas: false,
      destinatarios: [],
      estatisticas: null,
      campanhaAtual: null
    };
  },

  computed: {
    totalCampanhas() {
      return this.pagination.total || 0;
    },

    totalEnviados() {
      return this.campanhas.reduce((total, c) => total + c.sent_count, 0);
    },

    totalEntregues() {
      return this.campanhas.reduce((total, c) => total + c.delivered_count, 0);
    },

    custoTotal() {
      return this.campanhas.reduce((total, c) => total + parseFloat(c.total_cost), 0).toFixed(2);
    },

    paginasVisiveis() {
      const atual = this.pagination.current_page;
      const total = this.pagination.last_page;
      const paginas = [];

      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          paginas.push(i);
        }
      } else {
        if (atual <= 4) {
          for (let i = 1; i <= 5; i++) paginas.push(i);
          paginas.push('...');
          paginas.push(total);
        } else if (atual >= total - 3) {
          paginas.push(1);
          paginas.push('...');
          for (let i = total - 4; i <= total; i++) paginas.push(i);
        } else {
          paginas.push(1);
          paginas.push('...');
          for (let i = atual - 1; i <= atual + 1; i++) paginas.push(i);
          paginas.push('...');
          paginas.push(total);
        }
      }

      return paginas;
    }
  },

  methods: {
    async fetchCampanhas(page = 1) {
      this.isLoading = true;
      const token = localStorage.getItem('auth_token');

      try {
        let url = `https://api.devsms.online/api/v1/campaigns?page=${page}`;
        
        if (this.filtroStatus !== 'all') {
          url += `&status=${this.filtroStatus}`;
        }

        const response = await axios.get(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        const data = response.data.data;
        this.campanhas = data.data || [];
        
        this.pagination = {
          current_page: data.current_page,
          last_page: data.last_page,
          per_page: data.per_page,
          total: data.total
        };

        console.log('✅ Campanhas carregadas:', this.campanhas.length);

      } catch (error) {
        console.error('❌ Erro ao buscar campanhas:', error);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          this.$router.push('/login');
        } else {
          alert('Erro ao carregar campanhas.');
        }
      } finally {
        this.isLoading = false;
      }
    },

    filtrarCampanhas() {
      this.fetchCampanhas(1);
    },

    irParaPagina(page) {
      if (page >= 1 && page <= this.pagination.last_page) {
        this.fetchCampanhas(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },

    getStatusLabel(status) {
      const labels = {
        completed: 'Concluída',
        pending: 'Pendente',
        processing: 'Processando',
        failed: 'Falhada',
        scheduled: 'Agendada'
      };
      return labels[status] || status;
    },

    getStatusIcon(status) {
      const icons = {
        completed: 'fas fa-check-circle',
        pending: 'fas fa-clock',
        processing: 'fas fa-spinner fa-spin',
        failed: 'fas fa-exclamation-circle',
        scheduled: 'fas fa-calendar-check'
      };
      return icons[status] || 'fas fa-question-circle';
    },

    getTipoLabel(tipo) {
      const tipos = {
        instant: 'Instantâneo',
        scheduled: 'Agendado'
      };
      return tipos[tipo] || tipo;
    },

    getTargetLabel(target) {
      const targets = {
        selected: 'Selecionados',
        category: 'Categoria',
        all: 'Todos'
      };
      return targets[target] || target;
    },

    calcularTaxaEntrega(campanha) {
      if (campanha.sent_count === 0) return 0;
      return Math.round((campanha.delivered_count / campanha.sent_count) * 100);
    },

    formatarData(data) {
      if (!data) return '-';
      const date = new Date(data);
      return date.toLocaleDateString('pt-BR');
    },

    formatarDataHora(data) {
      if (!data) return '-';
      const date = new Date(data);
      return date.toLocaleString('pt-BR');
    },

    verDetalhes(campanha) {
      this.$router.push({ name: 'DetalhesCampanha', params: { id: campanha.id } });
    },

    duplicarCampanha(campanha) {
      if (confirm(`Deseja duplicar a campanha "${campanha.name}"?`)) {
        this.$router.push({ 
          name: 'Criar_Campanha', 
          query: { duplicate: campanha.id } 
        });
      }
    },

    async excluirCampanha(campanha) {
      if (!confirm(`Tem certeza que deseja excluir a campanha "${campanha.name}"?\n\nEsta ação não pode ser desfeita.`)) {
        return;
      }

      const token = localStorage.getItem('auth_token');

      try {
        await axios.delete(
          `https://api.devsms.online/api/v1/campaigns/${campanha.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        alert('✅ Campanha excluída com sucesso!');
        this.fetchCampanhas(this.pagination.current_page);

      } catch (error) {
        console.error('❌ Erro ao excluir campanha:', error);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          this.$router.push('/login');
        } else {
          alert('Erro ao excluir campanha.');
        }
      }
    },

    async enviarCampanha(campanha) {
      if (!confirm(`Deseja enviar a campanha "${campanha.name}" agora?\n\nEsta ação iniciará o envio imediatamente.`)) {
        return;
      }

      const token = localStorage.getItem('auth_token');

      try {
        const response = await axios.post(
          `https://api.devsms.online/api/v1/campaigns/${campanha.id}/send`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        alert('✅ Campanha enviada com sucesso!');
        this.fetchCampanhas(this.pagination.current_page);

      } catch (error) {
        console.error('❌ Erro ao enviar campanha:', error);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          this.$router.push('/login');
        } else if (error.response?.data?.message) {
          alert('Erro: ' + error.response.data.message);
        } else {
          alert('Erro ao enviar campanha.');
        }
      }
    },

    async cancelarCampanha(campanha) {
      if (!confirm(`Deseja cancelar a campanha "${campanha.name}"?\n\nEsta ação interromperá o envio.`)) {
        return;
      }

      const token = localStorage.getItem('auth_token');

      try {
        const response = await axios.post(
          `https://api.devsms.online/api/v1/campaigns/${campanha.id}/cancel`,
          {},
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        alert('✅ Campanha cancelada com sucesso!');
        this.fetchCampanhas(this.pagination.current_page);

      } catch (error) {
        console.error('❌ Erro ao cancelar campanha:', error);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          this.$router.push('/login');
        } else if (error.response?.data?.message) {
          alert('Erro: ' + error.response.data.message);
        } else {
          alert('Erro ao cancelar campanha.');
        }
      }
    },

    async verDestinatarios(campanha) {
      this.campanhaAtual = campanha;
      this.mostrarModalDestinatarios = true;
      this.isLoadingDestinatarios = true;
      const token = localStorage.getItem('auth_token');

      try {
        const response = await axios.get(
          `https://api.devsms.online/api/v1/campaigns/${campanha.id}/recipients`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        this.destinatarios = response.data.data.data || [];
        console.log('✅ Destinatários carregados:', this.destinatarios.length);

      } catch (error) {
        console.error('❌ Erro ao buscar destinatários:', error);
        alert('Erro ao carregar destinatários.');
      } finally {
        this.isLoadingDestinatarios = false;
      }
    },

    async verEstatisticas(campanha) {
      this.campanhaAtual = campanha;
      this.mostrarModalEstatisticas = true;
      this.isLoadingEstatisticas = true;
      const token = localStorage.getItem('auth_token');

      try {
        const response = await axios.get(
          `https://api.devsms.online/api/v1/campaigns/${campanha.id}/stats`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        this.estatisticas = response.data.data;
        console.log('✅ Estatísticas carregadas:', this.estatisticas);

      } catch (error) {
        console.error('❌ Erro ao buscar estatísticas:', error);
        alert('Erro ao carregar estatísticas.');
      } finally {
        this.isLoadingEstatisticas = false;
      }
    },

    fecharModalDestinatarios() {
      this.mostrarModalDestinatarios = false;
      this.destinatarios = [];
      this.campanhaAtual = null;
    },

    fecharModalEstatisticas() {
      this.mostrarModalEstatisticas = false;
      this.estatisticas = null;
      this.campanhaAtual = null;
    },

    getRecipientStatusLabel(status) {
      const labels = {
        pending: 'Pendente',
        sent: 'Enviado',
        delivered: 'Entregue',
        failed: 'Falhado'
      };
      return labels[status] || status;
    }
  },

  mounted() {
    this.fetchCampanhas();
  }
};
</script>

<style scoped>
:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-900: #111827;
}

.campaigns-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.page-header {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-subtitle {
  color: var(--gray-600);
  margin: 0.5rem 0 0 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid var(--gray-300);
  border-radius: 8px;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-select:focus {
  outline: none;
  border-color: var(--primary);
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
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
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

.stat-label {
  color: var(--gray-600);
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
}

/* Campaigns List */
.campaigns-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.campaign-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s;
  border-left: 4px solid var(--gray-300);
}

.campaign-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.campaign-card.status-completed { border-left-color: #10b981; }
.campaign-card.status-pending { border-left-color: #f59e0b; }
.campaign-card.status-processing { border-left-color: #3b82f6; }
.campaign-card.status-failed { border-left-color: #ef4444; }

.campaign-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid var(--gray-200);
  background: var(--gray-50);
}

.campaign-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.campaign-user {
  color: var(--gray-600);
  font-size: 0.875rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-badge {
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge-completed { background: #d1fae5; color: #065f46; }
.badge-pending { background: #fef3c7; color: #92400e; }
.badge-processing { background: #dbeafe; color: #1e40af; }
.badge-failed { background: #fee2e2; color: #991b1b; }

.campaign-body {
  padding: 1.5rem;
}

.campaign-message {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: var(--gray-50);
  border-radius: 8px;
}

.message-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.message-text {
  color: var(--gray-600);
  line-height: 1.6;
  margin: 0;
}

.campaign-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-700);
  font-size: 0.875rem;
}

.detail-item i {
  color: var(--primary);
}

.campaign-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--gray-50);
  border-radius: 8px;
}

.stat-icon-sm {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
}

.stat-value-sm {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

.stat-label-sm {
  font-size: 0.75rem;
  color: var(--gray-600);
  margin: 0;
}

.progress-section {
  margin-bottom: 1.5rem;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--gray-700);
}

.progress-bar {
  height: 8px;
  background: var(--gray-200);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  transition: width 0.3s;
}

.campaign-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-200);
}

.footer-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-600);
  font-size: 0.8125rem;
}

.info-item i {
  color: var(--primary);
}

.cost-badge {
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
  border-radius: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.campaign-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  border-top: 1px solid var(--gray-200);
}

.btn-action {
  padding: 1rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  border-right: 1px solid var(--gray-200);
}

.btn-action:last-child {
  border-right: none;
}

.btn-send {
  color: #10b981;
}

.btn-send:hover { background: rgba(16, 185, 129, 0.1); }

.btn-cancel-campaign {
  color: #f59e0b;
}

.btn-cancel-campaign:hover { background: rgba(245, 158, 11, 0.1); }

.btn-recipients {
  color: #6366f1;
}

.btn-recipients:hover { background: rgba(99, 102, 241, 0.1); }

.btn-stats {
  color: #8b5cf6;
}

.btn-stats:hover { background: rgba(139, 92, 246, 0.1); }

.btn-view {
  color: var(--primary);
}

.btn-view:hover { background: rgba(99, 102, 241, 0.1); }

.btn-duplicate {
  color: var(--success);
}

.btn-duplicate:hover { background: rgba(16, 185, 129, 0.1); }

.btn-delete {
  color: var(--danger);
}

.btn-delete:hover { background: rgba(239, 68, 68, 0.1); }

/* Modais */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-large {
  max-width: 1000px;
}

.modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid var(--gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--gray-50);
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--gray-900);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-close {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: var(--gray-100);
  color: var(--gray-700);
  cursor: pointer;
  transition: all 0.3s;
}

.btn-close:hover {
  background: var(--gray-200);
}

.modal-body {
  padding: 2rem;
}

.loading-state-sm {
  text-align: center;
  padding: 3rem 2rem;
}

/* Destinatários */
.recipients-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-box {
  padding: 1rem;
  background: var(--gray-50);
  border-radius: 8px;
  border-left: 4px solid var(--gray-400);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  color: var(--gray-700);
}

.stat-box i {
  font-size: 1.25rem;
}

.stat-box.sent {
  border-left-color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
  color: #4f46e5;
}

.stat-box.delivered {
  border-left-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.stat-box.failed {
  border-left-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.recipients-table {
  overflow-x: auto;
}

.recipients-table table {
  width: 100%;
  border-collapse: collapse;
}

.recipients-table th,
.recipients-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid var(--gray-200);
}

.recipients-table th {
  background: var(--gray-50);
  font-weight: 600;
  color: var(--gray-700);
  font-size: 0.875rem;
}

.recipients-table td {
  font-size: 0.9375rem;
  color: var(--gray-600);
}

.client-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.client-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.status-tag {
  padding: 0.375rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-tag.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.status-tag.status-sent {
  background: #dbeafe;
  color: #1e40af;
}

.status-tag.status-delivered {
  background: #d1fae5;
  color: #065f46;
}

.status-tag.status-failed {
  background: #fee2e2;
  color: #991b1b;
}

.error-msg {
  color: var(--danger);
  font-size: 0.8125rem;
}

.empty-state-sm {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--gray-600);
}

.empty-state-sm i {
  font-size: 3rem;
  color: var(--gray-400);
  margin-bottom: 1rem;
}

/* Estatísticas Modal */
.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--gray-200);
}

.stats-header h3 {
  font-size: 1.25rem;
  color: var(--gray-900);
  margin: 0;
}

.stats-grid-modal {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card-modal {
  padding: 1.25rem;
  background: var(--gray-50);
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon-modal {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
}

.stat-content-modal h4 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

.stat-content-modal p {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin: 0.25rem 0 0 0;
}

.success-rate {
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--gray-50);
  border-radius: 12px;
}

.rate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-weight: 600;
  color: var(--gray-700);
}

.rate-value {
  font-size: 1.5rem;
  color: var(--primary);
}

.rate-bar {
  height: 12px;
  background: var(--gray-200);
  border-radius: 6px;
  overflow: hidden;
}

.rate-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981 0%, #059669 100%);
  transition: width 0.5s;
}

.stats-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--gray-50);
  border-radius: 8px;
}

.detail-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-700);
  font-weight: 500;
}

.detail-label i {
  color: var(--primary);
}

.detail-value {
  font-weight: 600;
  color: var(--gray-900);
}

/* Paginação */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.pagination-btn {
  padding: 0.75rem 1.25rem;
  background: white;
  border: 2px solid var(--gray-300);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: var(--gray-700);
}

.pagination-btn:hover:not(:disabled) {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-pages {
  display: flex;
  gap: 0.5rem;
}

.pagination-page {
  width: 40px;
  height: 40px;
  border: 2px solid var(--gray-300);
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  color: var(--gray-700);
}

.pagination-page:hover {
  background: var(--gray-50);
  border-color: var(--primary);
}

.page-active {
  background: var(--primary) !important;
  color: white !important;
  border-color: var(--primary) !important;
}

/* Botões */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  border: none;
  transition: all 0.3s;
  text-decoration: none;
}

.btn-primary {
  background: var(--primary);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

/* Loading & Empty States */
.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid var(--gray-200);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: var(--gray-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  color: var(--gray-400);
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--gray-900);
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: var(--gray-600);
  margin: 0 0 1.5rem 0;
}

/* Animations */
.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .campaigns-page {
    padding: 1rem;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .filter-select,
  .btn-primary {
    width: 100%;
  }

  .campaign-header {
    flex-direction: column;
    gap: 1rem;
  }

  .campaign-stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .campaign-actions {
    grid-template-columns: 1fr;
  }

  .btn-action {
    border-right: none !important;
    border-bottom: 1px solid var(--gray-200);
  }

  .btn-action:last-child {
    border-bottom: none;
  }

  .pagination {
    flex-wrap: wrap;
  }
}
</style>