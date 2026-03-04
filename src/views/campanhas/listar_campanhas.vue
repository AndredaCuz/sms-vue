<template>
  <AppLayout>

  <div class="campaigns-page fade-in">

    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <i class="fas fa-bullhorn"></i>
        </div>
        <div>
          <h1 class="page-title">Minhas Campanhas</h1>
          <p class="page-subtitle">Gerencie suas campanhas de SMS</p>
        </div>
      </div>
      <div class="header-actions">
        <select v-model="filtroStatus" @change="filtrarCampanhas" class="filter-select">
          <option value="all">Todos os Status</option>
          <option value="completed">Concluídas</option>
          <option value="pending">Pendentes</option>
          <option value="processing">Em Processamento</option>
          <option value="failed">Falhadas</option>
          <option value="scheduled">Agendadas</option>
        </select>
        <router-link :to="{ name: 'Criar_campanhas' }" class="btn btn-primary">
          <i class="fas fa-plus"></i> Nova Campanha
        </router-link>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #667eea, #764ba2);">
          <i class="fas fa-bullhorn"></i>
        </div>
        <div>
          <div class="stat-value">{{ totalCampanhas }}</div>
          <div class="stat-label">Total</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b, #38f9d7);">
          <i class="fas fa-paper-plane"></i>
        </div>
        <div>
          <div class="stat-value">{{ totalEnviados }}</div>
          <div class="stat-label">Enviados</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe, #00f2fe);">
          <i class="fas fa-check-circle"></i>
        </div>
        <div>
          <div class="stat-value">{{ totalEntregues }}</div>
          <div class="stat-label">Entregues</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb, #f5576c);">
          <i class="fas fa-times-circle"></i>
        </div>
        <div>
          <div class="stat-value">{{ totalFalhados }}</div>
          <div class="stat-label">Falhados</div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner"></div>
      <p>Carregando campanhas...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="campanhas.length === 0" class="empty-state">
      <div class="empty-icon"><i class="fas fa-bullhorn"></i></div>
      <h3>Nenhuma campanha encontrada</h3>
      <p>Crie sua primeira campanha para enviar SMS</p>
      <router-link :to="{ name: 'Criar_campanhas' }" class="btn btn-primary">
        <i class="fas fa-plus"></i> Nova Campanha
      </router-link>
    </div>

    <!-- Lista compacta -->
    <div v-else class="campaigns-table-wrap">
      <table class="campaigns-table">
        <thead>
          <tr>
            <th>Campanha</th>
            <th>Tipo</th>
            <th>Alvo</th>
            <th>Progresso</th>
            <th>Status</th>
            <th>Data</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="campanha in campanhas"
            :key="campanha.id"
            class="campaign-row"
            :class="'row-' + campanha.status"
          >
            <!-- Nome + mensagem resumida -->
            <td class="td-name">
              <div class="camp-name">{{ campanha.name }}</div>
              <div class="camp-msg">{{ truncar(campanha.message_body, 55) }}</div>
            </td>

            <!-- Tipo -->
            <td>
              <span class="chip chip-type">
                <i :class="campanha.type === 'instant' ? 'fas fa-bolt' : 'fas fa-calendar-alt'"></i>
                {{ getTipoLabel(campanha.type) }}
              </span>
            </td>

            <!-- Alvo -->
            <td>
              <span class="chip chip-target">
                <i :class="getTargetIcon(campanha.target_type)"></i>
                {{ getTargetLabel(campanha.target_type) }}
              </span>
            </td>

            <!-- Progresso compacto -->
            <td class="td-progress">
              <div class="progress-row">
                <div class="progress-bar">
                  <div
                    class="progress-fill"
                    :style="{ width: calcularTaxaEntrega(campanha) + '%' }"
                  ></div>
                </div>
                <span class="progress-pct">{{ calcularTaxaEntrega(campanha) }}%</span>
              </div>
              <div class="progress-counts">
                <span><i class="fas fa-paper-plane"></i> {{ campanha.sent_count }}</span>
                <span><i class="fas fa-check"></i> {{ campanha.delivered_count }}</span>
                <span class="count-fail"><i class="fas fa-times"></i> {{ campanha.failed_count }}</span>
              </div>
            </td>

            <!-- Status badge -->
            <td>
              <span class="status-badge" :class="'badge-' + campanha.status">
                <i :class="getStatusIcon(campanha.status)"></i>
                {{ getStatusLabel(campanha.status) }}
              </span>
            </td>

            <!-- Data -->
            <td class="td-date">
              <div class="date-main">{{ formatarData(campanha.created_at) }}</div>
              <div v-if="campanha.scheduled_at" class="date-sched">
                <i class="fas fa-clock"></i> {{ formatarDataHora(campanha.scheduled_at) }}
              </div>
            </td>

            <!-- Ações -->
            <td class="td-actions">
              <!-- Enviar -->
              <button
                v-if="campanha.status === 'draft' || campanha.status === 'pending' || campanha.status === 'scheduled'"
                class="act-btn act-send"
                @click="enviarCampanha(campanha)"
                title="Enviar Agora"
              >
                <i class="fas fa-paper-plane"></i>
              </button>

              <!-- Cancelar -->
              <button
                v-if="campanha.status === 'processing' || campanha.status === 'scheduled'"
                class="act-btn act-cancel"
                @click="cancelarCampanha(campanha)"
                title="Cancelar"
              >
                <i class="fas fa-ban"></i>
              </button>

              <!-- Destinatários -->
              <button class="act-btn act-recipients" @click="verDestinatarios(campanha)" title="Destinatários">
                <i class="fas fa-users"></i>
              </button>

              <!-- Estatísticas -->
              <button class="act-btn act-stats" @click="verEstatisticas(campanha)" title="Estatísticas">
                <i class="fas fa-chart-bar"></i>
              </button>

              <!-- Excluir -->
              <button class="act-btn act-delete" @click="excluirCampanha(campanha)" title="Excluir">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Paginação -->
    <div v-if="pagination.last_page > 1" class="pagination">
      <button
        @click="irParaPagina(pagination.current_page - 1)"
        :disabled="pagination.current_page === 1"
        class="pagination-btn"
      >
        <i class="fas fa-chevron-left"></i> Anterior
      </button>
      <div class="pagination-pages">
        <button
          v-for="page in paginasVisiveis"
          :key="page"
          @click="typeof page === 'number' && irParaPagina(page)"
          class="pagination-page"
          :class="{ 'page-active': page === pagination.current_page, 'page-dots': page === '...' }"
        >{{ page }}</button>
      </div>
      <button
        @click="irParaPagina(pagination.current_page + 1)"
        :disabled="pagination.current_page === pagination.last_page"
        class="pagination-btn"
      >
        Próximo <i class="fas fa-chevron-right"></i>
      </button>
    </div>

    <!-- ══ Modal Destinatários ══ -->
    <div v-if="mostrarModalDestinatarios" class="modal-overlay" @click="fecharModalDestinatarios">
      <div class="modal-content modal-large" @click.stop>
        <div class="modal-header">
          <div class="modal-header-icon" style="background: linear-gradient(135deg, #4facfe, #00f2fe);">
            <i class="fas fa-users"></i>
          </div>
          <div>
            <h2 class="modal-title">Destinatários</h2>
            <p class="modal-subtitle">{{ campanhaAtual?.name }}</p>
          </div>
          <button @click="fecharModalDestinatarios" class="btn-close"><i class="fas fa-times"></i></button>
        </div>

        <div class="modal-body">
          <div v-if="isLoadingDestinatarios" class="loading-state-sm">
            <div class="spinner"></div>
            <p>Carregando...</p>
          </div>

          <div v-else>
            <div class="dest-stats">
              <div class="dest-stat">
                <i class="fas fa-users"></i>
                <strong>{{ destinatarios.length }}</strong>
                <span>Total</span>
              </div>
              <div class="dest-stat sent">
                <i class="fas fa-paper-plane"></i>
                <strong>{{ destinatarios.filter(d => d.status === 'sent').length }}</strong>
                <span>Enviados</span>
              </div>
              <div class="dest-stat delivered">
                <i class="fas fa-check-circle"></i>
                <strong>{{ destinatarios.filter(d => d.status === 'delivered').length }}</strong>
                <span>Entregues</span>
              </div>
              <div class="dest-stat failed">
                <i class="fas fa-times-circle"></i>
                <strong>{{ destinatarios.filter(d => d.status === 'failed').length }}</strong>
                <span>Falhados</span>
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
                        <div class="client-avatar">{{ dest.client_name.charAt(0).toUpperCase() }}</div>
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
                      <span v-if="dest.error_message" class="error-msg">{{ dest.error_message }}</span>
                      <span v-else class="text-muted">—</span>
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

    <!-- ══ Modal Estatísticas ══ -->
    <div v-if="mostrarModalEstatisticas" class="modal-overlay" @click="fecharModalEstatisticas">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="modal-header-icon" style="background: linear-gradient(135deg, #667eea, #764ba2);">
            <i class="fas fa-chart-bar"></i>
          </div>
          <div>
            <h2 class="modal-title">Estatísticas</h2>
            <p class="modal-subtitle">{{ campanhaAtual?.name }}</p>
          </div>
          <button @click="fecharModalEstatisticas" class="btn-close"><i class="fas fa-times"></i></button>
        </div>

        <div class="modal-body">
          <div v-if="isLoadingEstatisticas" class="loading-state-sm">
            <div class="spinner"></div>
            <p>Carregando...</p>
          </div>

          <div v-else-if="estatisticas">
            <div class="stats-grid-modal">
              <div class="stat-card-modal" style="--c: #6366f1">
                <div class="stat-icon-modal"><i class="fas fa-users"></i></div>
                <div>
                  <h4>{{ estatisticas.total_recipients }}</h4>
                  <p>Destinatários</p>
                </div>
              </div>
              <div class="stat-card-modal" style="--c: #10b981">
                <div class="stat-icon-modal"><i class="fas fa-paper-plane"></i></div>
                <div>
                  <h4>{{ estatisticas.sent_count }}</h4>
                  <p>Enviados</p>
                </div>
              </div>
              <div class="stat-card-modal" style="--c: #3b82f6">
                <div class="stat-icon-modal"><i class="fas fa-check-circle"></i></div>
                <div>
                  <h4>{{ estatisticas.delivered_count }}</h4>
                  <p>Entregues</p>
                </div>
              </div>
              <div class="stat-card-modal" style="--c: #ef4444">
                <div class="stat-icon-modal"><i class="fas fa-times-circle"></i></div>
                <div>
                  <h4>{{ estatisticas.failed_count }}</h4>
                  <p>Falhados</p>
                </div>
              </div>
            </div>

            <div class="success-rate">
              <div class="rate-header">
                <span>Taxa de Entrega</span>
                <span class="rate-value">{{ estatisticas.success_rate }}%</span>
              </div>
              <div class="rate-bar">
                <div class="rate-fill" :style="{ width: estatisticas.success_rate + '%' }"></div>
              </div>
            </div>

            <div class="stats-details">
              <div class="detail-row" v-if="estatisticas.started_at">
                <span class="detail-label"><i class="fas fa-play-circle"></i> Iniciado Em</span>
                <span class="detail-value">{{ formatarDataHora(estatisticas.started_at) }}</span>
              </div>
              <div class="detail-row" v-if="estatisticas.completed_at">
                <span class="detail-label"><i class="fas fa-check-circle"></i> Concluído Em</span>
                <span class="detail-value">{{ formatarDataHora(estatisticas.completed_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</AppLayout>
</template>

<script>
import axios from 'axios';


import AppLayout from '../../components/AppLayout.vue';

export default {
  name: 'MinhasCampanhas',
  components: { AppLayout },

  data() {
    return {
      isLoading: true,
      isLoadingDestinatarios: false,
      isLoadingEstatisticas: false,
      campanhas: [],
      filtroStatus: 'all',
      pagination: { current_page: 1, last_page: 1, per_page: 15, total: 0 },
      mostrarModalDestinatarios: false,
      mostrarModalEstatisticas: false,
      destinatarios: [],
      estatisticas: null,
      campanhaAtual: null
    };
  },

  computed: {
    totalCampanhas()  { return this.pagination.total || 0; },
    totalEnviados()   { return this.campanhas.reduce((t, c) => t + c.sent_count, 0); },
    totalEntregues()  { return this.campanhas.reduce((t, c) => t + c.delivered_count, 0); },
    totalFalhados()   { return this.campanhas.reduce((t, c) => t + c.failed_count, 0); },

    paginasVisiveis() {
      const atual = this.pagination.current_page;
      const total = this.pagination.last_page;
      const p = [];
      if (total <= 7) { for (let i = 1; i <= total; i++) p.push(i); }
      else if (atual <= 4) { for (let i = 1; i <= 5; i++) p.push(i); p.push('...'); p.push(total); }
      else if (atual >= total - 3) { p.push(1); p.push('...'); for (let i = total - 4; i <= total; i++) p.push(i); }
      else { p.push(1); p.push('...'); for (let i = atual - 1; i <= atual + 1; i++) p.push(i); p.push('...'); p.push(total); }
      return p;
    }
  },

  methods: {
    async fetchCampanhas(page = 1) {
      this.isLoading = true;
      const token = localStorage.getItem('auth_token');
      try {
        let url = `https://api.devsms.online/api/v1/campaigns?page=${page}`;
        if (this.filtroStatus !== 'all') url += `&status=${this.filtroStatus}`;
        const res = await axios.get(url, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } });
        const data = res.data.data;
        this.campanhas = data.data || [];
        this.pagination = { current_page: data.current_page, last_page: data.last_page, per_page: data.per_page, total: data.total };
      } catch (error) {
        if (error.response?.status === 401) { localStorage.removeItem('auth_token'); this.$router.push('/login'); }
        else alert('Erro ao carregar campanhas.');
      } finally { this.isLoading = false; }
    },

    filtrarCampanhas() { this.fetchCampanhas(1); },

    irParaPagina(page) {
      if (page >= 1 && page <= this.pagination.last_page) {
        this.fetchCampanhas(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },

    truncar(texto, max) {
      if (!texto) return '';
      return texto.length > max ? texto.substring(0, max) + '…' : texto;
    },

    getStatusLabel(s) { return { completed: 'Concluída', pending: 'Pendente', processing: 'Processando', failed: 'Falhada', scheduled: 'Agendada', draft: 'Rascunho' }[s] || s; },
    getStatusIcon(s)  { return { completed: 'fas fa-check-circle', pending: 'fas fa-clock', processing: 'fas fa-spinner fa-spin', failed: 'fas fa-exclamation-circle', scheduled: 'fas fa-calendar-check', draft: 'fas fa-edit' }[s] || 'fas fa-question-circle'; },
    getTipoLabel(t)   { return { instant: 'Instantâneo', scheduled: 'Agendado' }[t] || t; },
    getTargetLabel(t) { return { all: 'Todos', category: 'Categoria', selected: 'Específicos' }[t] || t; },
    getTargetIcon(t)  { return { all: 'fas fa-globe', category: 'fas fa-tag', selected: 'fas fa-user-check' }[t] || 'fas fa-bullseye'; },
    getRecipientStatusLabel(s) { return { pending: 'Pendente', sent: 'Enviado', delivered: 'Entregue', failed: 'Falhado' }[s] || s; },

    calcularTaxaEntrega(c) {
      if (!c.sent_count) return 0;
      return Math.round((c.delivered_count / c.sent_count) * 100);
    },

    formatarData(d)     { if (!d) return '—'; return new Date(d).toLocaleDateString('pt-AO'); },
    formatarDataHora(d) { if (!d) return '—'; return new Date(d).toLocaleString('pt-AO'); },

    async enviarCampanha(campanha) {
      if (!confirm(`Enviar "${campanha.name}" agora?`)) return;
      const token = localStorage.getItem('auth_token');
      try {
        await axios.post(`https://api.devsms.online/api/v1/campaigns/${campanha.id}/send`, {}, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } });
        alert('✅ Campanha enviada com sucesso!');
        this.fetchCampanhas(this.pagination.current_page);
      } catch (error) {
        alert('Erro: ' + (error.response?.data?.message || 'Tente novamente.'));
      }
    },

    async cancelarCampanha(campanha) {
      if (!confirm(`Cancelar "${campanha.name}"?`)) return;
      const token = localStorage.getItem('auth_token');
      try {
        await axios.post(`https://api.devsms.online/api/v1/campaigns/${campanha.id}/cancel`, {}, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } });
        alert('✅ Campanha cancelada!');
        this.fetchCampanhas(this.pagination.current_page);
      } catch (error) {
        alert('Erro: ' + (error.response?.data?.message || 'Tente novamente.'));
      }
    },

    async excluirCampanha(campanha) {
      if (!confirm(`Excluir "${campanha.name}"? Esta ação não pode ser desfeita.`)) return;
      const token = localStorage.getItem('auth_token');
      try {
        await axios.delete(`https://api.devsms.online/api/v1/campaigns/${campanha.id}`, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } });
        alert('✅ Campanha excluída!');
        this.fetchCampanhas(this.pagination.current_page);
      } catch (error) {
        alert('Erro ao excluir campanha.');
      }
    },

    async verDestinatarios(campanha) {
      this.campanhaAtual = campanha;
      this.mostrarModalDestinatarios = true;
      this.isLoadingDestinatarios = true;
      const token = localStorage.getItem('auth_token');
      try {
        const res = await axios.get(`https://api.devsms.online/api/v1/campaigns/${campanha.id}/recipients`, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } });
        this.destinatarios = res.data.data.data || [];
      } catch { alert('Erro ao carregar destinatários.'); }
      finally { this.isLoadingDestinatarios = false; }
    },

    async verEstatisticas(campanha) {
      this.campanhaAtual = campanha;
      this.mostrarModalEstatisticas = true;
      this.isLoadingEstatisticas = true;
      const token = localStorage.getItem('auth_token');
      try {
        const res = await axios.get(`https://api.devsms.online/api/v1/campaigns/${campanha.id}/stats`, { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } });
        this.estatisticas = res.data.data;
      } catch { alert('Erro ao carregar estatísticas.'); }
      finally { this.isLoadingEstatisticas = false; }
    },

    fecharModalDestinatarios() { this.mostrarModalDestinatarios = false; this.destinatarios = []; this.campanhaAtual = null; },
    fecharModalEstatisticas()  { this.mostrarModalEstatisticas = false;  this.estatisticas = null; this.campanhaAtual = null; }
  },

  mounted() { this.fetchCampanhas(); }
};
</script>

<style scoped>
:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --gray-50:  #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-900: #111827;
}

.campaigns-page {
  padding: 1.75rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* ── Header ── */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 1.25rem 1.75rem;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,.08);
  margin-bottom: 1.5rem;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(99,102,241,.3);
  flex-shrink: 0;
}

.page-title   { font-size: 1.375rem; font-weight: 700; color: var(--gray-900); margin: 0; }
.page-subtitle{ font-size: 0.813rem; color: var(--gray-600); margin: 0.15rem 0 0; }

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  flex-shrink: 0;
}

.filter-select {
  padding: 0.625rem 1rem;
  border: 2px solid var(--gray-200);
  border-radius: 9px;
  font-size: 0.875rem;
  cursor: pointer;
  color: var(--gray-700);
  transition: border-color .2s;
  background: white;
}

.filter-select:focus { outline: none; border-color: var(--primary); }

/* ── Stats ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.125rem 1.25rem;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,.07);
  display: flex;
  align-items: center;
  gap: 0.875rem;
  transition: transform .2s;
}

.stat-card:hover { transform: translateY(-2px); }

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: white;
  flex-shrink: 0;
}

.stat-value { font-size: 1.625rem; font-weight: 700; color: var(--gray-900); line-height: 1; }
.stat-label { font-size: 0.8rem; color: var(--gray-600); margin-top: 0.2rem; }

/* ── Tabela de campanhas ── */
.campaigns-table-wrap {
  background: white;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,.08);
  overflow: hidden;
}

.campaigns-table {
  width: 100%;
  border-collapse: collapse;
}

.campaigns-table thead {
  background: var(--gray-50);
  border-bottom: 2px solid var(--gray-200);
}

.campaigns-table th {
  padding: 0.875rem 1rem;
  text-align: left;
  font-size: 0.775rem;
  font-weight: 700;
  color: var(--gray-600);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.campaigns-table tbody tr {
  border-bottom: 1px solid var(--gray-100);
  transition: background .15s;
}

.campaigns-table tbody tr:last-child { border-bottom: none; }
.campaigns-table tbody tr:hover { background: var(--gray-50); }

/* barra colorida lateral por status */
.campaign-row { position: relative; }
.campaign-row td:first-child { border-left: 4px solid transparent; }
.row-completed td:first-child { border-left-color: #10b981; }
.row-pending   td:first-child { border-left-color: #f59e0b; }
.row-processing td:first-child { border-left-color: #3b82f6; }
.row-failed    td:first-child { border-left-color: #ef4444; }
.row-scheduled td:first-child { border-left-color: #8b5cf6; }

.campaigns-table td { padding: 0.875rem 1rem; vertical-align: middle; }

/* Nome + preview mensagem */
.td-name { max-width: 260px; }
.camp-name { font-weight: 700; color: var(--gray-900); font-size: 0.9rem; margin-bottom: 0.2rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.camp-msg  { font-size: 0.775rem; color: var(--gray-500); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Chips */
.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.7rem;
  border-radius: 20px;
  font-size: 0.775rem;
  font-weight: 600;
  white-space: nowrap;
}

.chip-type   { background: rgba(99,102,241,.1);  color: #4f46e5; }
.chip-target { background: rgba(16,185,129,.1);  color: #059669; }

/* Progresso compacto */
.td-progress { min-width: 140px; }

.progress-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.35rem;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--gray-200);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 3px;
  transition: width .4s;
}

.progress-pct { font-size: 0.775rem; font-weight: 700; color: var(--gray-700); white-space: nowrap; }

.progress-counts {
  display: flex;
  gap: 0.75rem;
  font-size: 0.72rem;
  color: var(--gray-500);
}

.progress-counts span { display: flex; align-items: center; gap: 0.25rem; }
.progress-counts i { font-size: 0.65rem; }
.count-fail { color: #ef4444; }

/* Status badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.775rem;
  font-weight: 700;
  white-space: nowrap;
}

.badge-completed  { background: #d1fae5; color: #065f46; }
.badge-pending    { background: #fef3c7; color: #92400e; }
.badge-processing { background: #dbeafe; color: #1e40af; }
.badge-failed     { background: #fee2e2; color: #991b1b; }
.badge-scheduled  { background: #ede9fe; color: #5b21b6; }
.badge-draft      { background: var(--gray-100); color: var(--gray-600); }

/* Data */
.td-date { white-space: nowrap; }
.date-main  { font-size: 0.838rem; font-weight: 600; color: var(--gray-700); }
.date-sched { font-size: 0.72rem; color: #8b5cf6; margin-top: 0.2rem; display: flex; align-items: center; gap: 0.3rem; }

/* Ações */
.td-actions { white-space: nowrap; }

.act-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.813rem;
  transition: all .15s;
  background: var(--gray-100);
  color: var(--gray-600);
  margin-right: 0.25rem;
}

.act-btn:last-child { margin-right: 0; }

.act-send       { color: #10b981; background: rgba(16,185,129,.1); }
.act-send:hover { background: #10b981; color: white; }

.act-cancel       { color: #f59e0b; background: rgba(245,158,11,.1); }
.act-cancel:hover { background: #f59e0b; color: white; }

.act-recipients       { color: #6366f1; background: rgba(99,102,241,.1); }
.act-recipients:hover { background: #6366f1; color: white; }

.act-stats       { color: #8b5cf6; background: rgba(139,92,246,.1); }
.act-stats:hover { background: #8b5cf6; color: white; }

.act-delete       { color: #ef4444; background: rgba(239,68,68,.1); }
.act-delete:hover { background: #ef4444; color: white; }

/* ── Loading / Empty ── */
.loading-state, .empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,.08);
}

.spinner {
  width: 44px;
  height: 44px;
  border: 4px solid var(--gray-200);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-icon {
  width: 72px;
  height: 72px;
  margin: 0 auto 1.25rem;
  background: var(--gray-100);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.875rem;
  color: var(--gray-400);
}

.empty-state h3 { font-size: 1.375rem; color: var(--gray-900); margin: 0 0 0.5rem; }
.empty-state p  { color: var(--gray-600); margin: 0 0 1.5rem; }

/* ── Paginação ── */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,.08);
}

.pagination-btn {
  padding: 0.6rem 1.125rem;
  background: white;
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  cursor: pointer;
  transition: all .2s;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--gray-700);
}

.pagination-btn:hover:not(:disabled) { background: var(--primary); color: white; border-color: var(--primary); }
.pagination-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.pagination-pages { display: flex; gap: 0.375rem; }

.pagination-page {
  width: 36px;
  height: 36px;
  border: 2px solid var(--gray-200);
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all .2s;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--gray-700);
}

.pagination-page:hover:not(.page-dots) { border-color: var(--primary); color: var(--primary); }
.page-active { background: var(--primary) !important; color: white !important; border-color: var(--primary) !important; }
.page-dots   { cursor: default; border-color: transparent; }

/* ── Modais ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn .2s ease;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,.25);
  animation: slideUp .25s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

.modal-large { max-width: 960px; }

.modal-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.375rem 1.75rem;
  border-bottom: 1px solid var(--gray-200);
  background: var(--gray-50);
  position: relative;
}

.modal-header-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
  flex-shrink: 0;
}

.modal-title    { font-size: 1.25rem; font-weight: 700; color: var(--gray-900); margin: 0; }
.modal-subtitle { font-size: 0.813rem; color: var(--gray-600); margin: 0.15rem 0 0; }

.btn-close {
  position: absolute;
  top: 1.125rem;
  right: 1.25rem;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: none;
  background: var(--gray-100);
  color: var(--gray-600);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .2s;
}

.btn-close:hover { background: var(--gray-200); }

.modal-body { padding: 1.75rem; }

/* Mini stats do modal destinatários */
.dest-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.875rem;
  margin-bottom: 1.5rem;
}

.dest-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 1rem;
  background: var(--gray-50);
  border-radius: 10px;
  border-left: 4px solid var(--gray-300);
  text-align: center;
}

.dest-stat i       { font-size: 1.25rem; color: var(--gray-400); }
.dest-stat strong  { font-size: 1.5rem; font-weight: 700; color: var(--gray-900); }
.dest-stat span    { font-size: 0.75rem; color: var(--gray-600); }
.dest-stat.sent      { border-left-color: #6366f1; }
.dest-stat.sent i    { color: #6366f1; }
.dest-stat.delivered { border-left-color: #10b981; }
.dest-stat.delivered i { color: #10b981; }
.dest-stat.failed    { border-left-color: #ef4444; }
.dest-stat.failed i  { color: #ef4444; }

.loading-state-sm { text-align: center; padding: 2.5rem; }

/* Tabela de destinatários */
.recipients-table { overflow-x: auto; }
.recipients-table table { width: 100%; border-collapse: collapse; }
.recipients-table th, .recipients-table td { padding: 0.875rem 1rem; text-align: left; border-bottom: 1px solid var(--gray-200); }
.recipients-table th { background: var(--gray-50); font-weight: 700; color: var(--gray-700); font-size: 0.813rem; }
.recipients-table td { font-size: 0.875rem; color: var(--gray-700); }

.client-info { display: flex; align-items: center; gap: 0.625rem; }
.client-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem; flex-shrink: 0; }

.status-tag { padding: 0.25rem 0.625rem; border-radius: 12px; font-size: 0.75rem; font-weight: 700; }
.status-tag.status-pending   { background: #fef3c7; color: #92400e; }
.status-tag.status-sent      { background: #dbeafe; color: #1e40af; }
.status-tag.status-delivered { background: #d1fae5; color: #065f46; }
.status-tag.status-failed    { background: #fee2e2; color: #991b1b; }

.error-msg   { color: #ef4444; font-size: 0.8rem; }
.text-muted  { color: var(--gray-400); }

.empty-state-sm { text-align: center; padding: 2.5rem; color: var(--gray-600); }
.empty-state-sm i { font-size: 2.5rem; color: var(--gray-300); display: block; margin-bottom: 0.75rem; }

/* Grid stats modal estatísticas */
.stats-grid-modal {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card-modal {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.125rem;
  background: var(--gray-50);
  border-radius: 10px;
}

.stat-icon-modal {
  width: 44px;
  height: 44px;
  border-radius: 9px;
  background: var(--c, #6366f1);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
  flex-shrink: 0;
}

.stat-card-modal h4 { font-size: 1.75rem; font-weight: 700; color: var(--gray-900); margin: 0; }
.stat-card-modal p  { font-size: 0.813rem; color: var(--gray-600); margin: 0.2rem 0 0; }

.success-rate {
  margin-bottom: 1.5rem;
  padding: 1.25rem;
  background: var(--gray-50);
  border-radius: 10px;
}

.rate-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; font-weight: 600; color: var(--gray-700); }
.rate-value  { font-size: 1.375rem; color: var(--primary); font-weight: 700; }
.rate-bar    { height: 10px; background: var(--gray-200); border-radius: 5px; overflow: hidden; }
.rate-fill   { height: 100%; background: linear-gradient(90deg, #10b981, #059669); transition: width .5s; }

.stats-details { display: flex; flex-direction: column; gap: 0.75rem; }
.detail-row    { display: flex; justify-content: space-between; align-items: center; padding: 0.875rem 1rem; background: var(--gray-50); border-radius: 8px; }
.detail-label  { display: flex; align-items: center; gap: 0.5rem; color: var(--gray-700); font-weight: 500; font-size: 0.875rem; }
.detail-label i{ color: var(--primary); }
.detail-value  { font-weight: 700; color: var(--gray-900); font-size: 0.875rem; }

/* ── Botões ── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.375rem;
  border-radius: 9px;
  font-weight: 700;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all .2s;
  text-decoration: none;
}

.btn-primary { background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; box-shadow: 0 3px 10px rgba(99,102,241,.3); }
.btn-primary:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(99,102,241,.45); }

/* ── Animação ── */
.fade-in { animation: fadeIn .4s ease; }

/* ── Responsive ── */
@media (max-width: 1024px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .campaigns-table th:nth-child(3),
  .campaigns-table td:nth-child(3) { display: none; }
}

@media (max-width: 768px) {
  .campaigns-page { padding: 1rem; }
  .page-header { flex-direction: column; align-items: flex-start; }
  .header-actions { width: 100%; flex-direction: column; }
  .filter-select, .btn { width: 100%; justify-content: center; }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .dest-stats { grid-template-columns: repeat(2, 1fr); }
  .stats-grid-modal { grid-template-columns: 1fr; }

  .campaigns-table-wrap { overflow-x: auto; }
  .campaigns-table th:nth-child(2),
  .campaigns-table td:nth-child(2),
  .campaigns-table th:nth-child(6),
  .campaigns-table td:nth-child(6) { display: none; }
}
</style>