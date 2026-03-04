<template>
  <AppLayout>

    <!-- LOADING -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="load-ring">
        <span></span><span></span><span></span>
      </div>
      <p class="load-text">A carregar dashboard…</p>
    </div>

    <!-- CONTEÚDO -->
    <div v-else class="dash-content fade-in">

      <!-- ═══════════════════════════════════
           HERO BANNER
      ════════════════════════════════════ -->
      <div class="hero-banner">
        <div class="hero-bg">
          <div class="hero-blob hero-blob-1"></div>
          <div class="hero-blob hero-blob-2"></div>
          <div class="hero-blob hero-blob-3"></div>
          <div class="hero-grid"></div>
        </div>

        <div class="hero-body">
          <div class="hero-left">
            <div class="hero-eyebrow">
              <div class="status-dot-wrap" :class="subscription.status">
                <span class="status-dot-anim"></span>
              </div>
              {{ getStatusText(subscription.status) }}
            </div>
            <h1 class="hero-title">Bem-vindo de volta<span class="hero-wave">👋</span></h1>
            <p class="hero-sub">Aqui está o resumo da sua actividade hoje</p>

            <div class="hero-pills">
              <div class="hero-pill plan">
                <i class="fas fa-crown"></i>
                <span>{{ subscription.plan_name }}</span>
              </div>
              <div class="hero-pill sms">
                <i class="fas fa-inbox"></i>
                <span>{{ subscription.sms_available.toLocaleString('pt-AO') }} SMS disponíveis</span>
              </div>
              <div class="hero-pill renew">
                <i class="far fa-calendar-alt"></i>
                <span>Renova em {{ Math.ceil(subscription.days_until_renewal) }}d</span>
              </div>
            </div>
          </div>

          <div class="hero-right">
            <div class="hero-donut-wrap">
              <svg viewBox="0 0 140 140" class="hero-donut">
                <circle cx="70" cy="70" r="52" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="14"/>
                <circle
                  cx="70" cy="70" r="52" fill="none"
                  stroke="url(#heroGrad)" stroke-width="14" stroke-linecap="round"
                  :stroke-dasharray="heroUsedArc + ' ' + (327 - heroUsedArc)"
                  stroke-dashoffset="82"
                  style="transition: stroke-dasharray 1s ease"
                />
                <defs>
                  <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#34d399"/>
                    <stop offset="100%" stop-color="#10b981"/>
                  </linearGradient>
                </defs>
                <text x="70" y="63" text-anchor="middle" class="donut-pct">{{ subscription.usage_percentage }}%</text>
                <text x="70" y="78" text-anchor="middle" class="donut-lbl">utilizado</text>
              </svg>
              <div class="donut-caption">
                <div class="dc-line"><span class="dc-dot used"></span> Usado: {{ subscription.sms_used.toLocaleString('pt-AO') }}</div>
                <div class="dc-line"><span class="dc-dot avail"></span> Disponível: {{ subscription.sms_available.toLocaleString('pt-AO') }}</div>
              </div>
            </div>
          </div>
        </div>

        <div class="hero-prog-wrap">
          <div class="hero-prog-bar">
            <div
              class="hero-prog-fill"
              :style="{
                width: Math.min(subscription.usage_percentage, 100) + '%',
                background: subscription.usage_percentage > 80 ? 'linear-gradient(90deg,#f87171,#ef4444)' : 'linear-gradient(90deg,#34d399,#10b981)'
              }"
            ></div>
          </div>
          <span class="hero-prog-label">
            {{ subscription.sms_used.toLocaleString('pt-AO') }} de {{ subscription.sms_total.toLocaleString('pt-AO') }} SMS usados
          </span>
        </div>
      </div>

      <!-- ═══════════════════════════════════
           STAT CARDS
      ════════════════════════════════════ -->
      <div class="stat-grid">
        <div
          class="stat-card"
          v-for="(card, i) in statCards"
          :key="i"
          :style="{ '--c': card.color, 'animation-delay': (i * 0.08) + 's' }"
        >
          <div class="sc-top">
            <div class="sc-icon"><i :class="card.icon"></i></div>
            <span class="sc-badge" :class="card.badgeClass">
              <i :class="card.trendIcon"></i> {{ card.trendText }}
            </span>
          </div>
          <div class="sc-value">{{ card.value }}</div>
          <div class="sc-label">{{ card.label }}</div>
          <div class="sc-bar-bg"><div class="sc-bar-fill" :style="{ width: card.fillPct + '%' }"></div></div>
        </div>
      </div>

      <!-- ═══════════════════════════════════
           LINHA INFERIOR: SMS + Clientes
      ════════════════════════════════════ -->
      <div class="bottom-row">

        <!-- SMS este mês -->
        <div class="card">
          <div class="card-head">
            <span class="card-label"><i class="fas fa-chart-pie card-icon"></i> SMS Este Mês</span>
            <span class="month-tag">{{ currentMonth }}</span>
          </div>
          <div class="sms-body">
            <div class="sms-stat-row">
              <div class="ssb delivered">
                <i class="fas fa-check-double"></i>
                <div class="ssb-val">{{ smsThisMonth.delivered }}</div>
                <div class="ssb-lbl">Entregues</div>
              </div>
              <div class="ssb sent">
                <i class="fas fa-paper-plane"></i>
                <div class="ssb-val">{{ smsThisMonth.sent }}</div>
                <div class="ssb-lbl">Enviados</div>
              </div>
              <div class="ssb failed">
                <i class="fas fa-times-circle"></i>
                <div class="ssb-val">{{ smsThisMonth.failed }}</div>
                <div class="ssb-lbl">Falharam</div>
              </div>
            </div>

            <!-- Taxa de entrega -->
            <div class="delivery-rate">
              <div class="dr-header">
                <span class="dr-label">Taxa de Entrega</span>
                <span class="dr-pct" :class="deliveryRateClass">{{ deliveryRate }}%</span>
              </div>
              <div class="dr-bar-bg">
                <div class="dr-bar-fill" :style="{ width: deliveryRate + '%', background: deliveryRateColor }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Clientes -->
        <div class="card">
          <div class="card-head">
            <span class="card-label"><i class="fas fa-users card-icon"></i> Clientes</span>
            <router-link to="/meucontatos" class="see-all">Gerir <i class="fas fa-arrow-right"></i></router-link>
          </div>
          <div class="clients-body">
            <div class="cst-value">{{ stats.total_clients.toLocaleString('pt-AO') }}</div>
            <div class="cst-label">Total de clientes</div>
            <div class="cst-bar-bg">
              <div class="cst-bar-fill"
                :style="{ width: stats.total_clients ? Math.min((stats.active_clients/stats.total_clients)*100,100)+'%' : '0%' }"
              ></div>
            </div>
            <div class="cst-sub">{{ stats.active_clients }} activos · {{ stats.total_categories }} categorias</div>
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
  name: 'Dashboard',
  components: { AppLayout },
  data() {
    return {
      isLoading: true,
      stats: {
        total_clients: 0, active_clients: 0, total_categories: 0,
        total_campaigns: 0, active_campaigns: 0, completed_campaigns: 0
      },
      smsThisMonth: { total: 0, sent: '0', delivered: '0', failed: '0', total_cost: '0.00' },
      subscription: {
        plan_name: '—', sms_available: 0, sms_used: 0,
        sms_total: 0, usage_percentage: 0, days_until_renewal: 0, status: 'active'
      }
    };
  },
  computed: {
    currentMonth() {
      return new Date().toLocaleDateString('pt-AO', { month: 'long', year: 'numeric' });
    },
    heroUsedArc() {
      return Math.round(Math.min(this.subscription.usage_percentage, 100) / 100 * 327);
    },
    deliveryRate() {
      const total = +this.smsThisMonth.total;
      const delivered = +this.smsThisMonth.delivered;
      if (!total) return 0;
      return Math.round((delivered / total) * 100);
    },
    deliveryRateClass() {
      if (this.deliveryRate >= 90) return 'rate-great';
      if (this.deliveryRate >= 70) return 'rate-ok';
      return 'rate-bad';
    },
    deliveryRateColor() {
      if (this.deliveryRate >= 90) return 'linear-gradient(90deg,#34d399,#10b981)';
      if (this.deliveryRate >= 70) return 'linear-gradient(90deg,#fbbf24,#f59e0b)';
      return 'linear-gradient(90deg,#f87171,#ef4444)';
    },
    statCards() {
      const pct   = this.subscription.usage_percentage;
      const avail = this.subscription.sms_available;
      return [
        {
          icon: 'fas fa-inbox', color: '#10b981',
          value: avail.toLocaleString('pt-AO'), label: 'SMS Disponíveis',
          badgeClass: avail > 0 ? 'badge-up' : 'badge-down',
          trendIcon:  avail > 0 ? 'fas fa-check' : 'fas fa-exclamation-triangle',
          trendText:  avail > 0 ? 'Disponível' : 'Recarregue!',
          fillPct: 100 - Math.min(pct, 100)
        },
        {
          icon: 'fas fa-paper-plane', color: '#3b82f6',
          value: this.smsThisMonth.total.toLocaleString('pt-AO'), label: 'SMS Este Mês',
          badgeClass: 'badge-neutral', trendIcon: 'fas fa-calendar', trendText: 'Mês actual',
          fillPct: +this.smsThisMonth.total
            ? Math.min((+this.smsThisMonth.delivered / +this.smsThisMonth.total) * 100, 100) : 0
        },
        {
          icon: 'fas fa-users', color: '#f59e0b',
          value: this.stats.total_clients.toLocaleString('pt-AO'), label: 'Total Clientes',
          badgeClass: 'badge-up', trendIcon: 'fas fa-user-check',
          trendText: `${this.stats.active_clients} activos`,
          fillPct: this.stats.total_clients
            ? Math.min((this.stats.active_clients / this.stats.total_clients) * 100, 100) : 0
        },
        {
          icon: 'fas fa-bullhorn', color: '#8b5cf6',
          value: this.stats.total_campaigns, label: 'Campanhas',
          badgeClass: 'badge-neutral', trendIcon: 'fas fa-play-circle',
          trendText: `${this.stats.active_campaigns} ativas`,
          fillPct: this.stats.total_campaigns
            ? Math.min((this.stats.completed_campaigns / this.stats.total_campaigns) * 100, 100) : 0
        }
      ];
    }
  },
  methods: {
    async fetchDashboardData() {
      this.isLoading = true;
      const token = localStorage.getItem('auth_token');
      if (!token) { this.$router.push('/login'); return; }
      try {
        const { data: res } = await axios.get('https://api.devsms.online/api/v1/dashboard', {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
        });
        const d = res.data || res;
        if (d.stats)          this.stats        = d.stats;
        if (d.sms_this_month) this.smsThisMonth = d.sms_this_month;
        if (d.subscription)   this.subscription = d.subscription;
      } catch (e) {
        if ([401, 403].includes(e.response?.status)) {
          ['auth_token','user_type','user_data'].forEach(k => localStorage.removeItem(k));
          this.$router.push('/login');
        }
      } finally { this.isLoading = false; }
    },
    formatCurrency(v) {
      return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(v);
    },
    getStatusText(s) {
      return { active:'Ativo', inactive:'Inativo', expired:'Expirado', suspended:'Suspenso' }[s] ?? s;
    },
    onKey(e) { if (e.key === 'Escape') {} }
  },
  mounted() {
    this.fetchDashboardData();
    document.addEventListener('keydown', this.onKey);
    setInterval(this.fetchDashboardData, 5 * 60 * 1000);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.onKey);
  }
};
</script>

<style scoped>
/* ════════════════════════════
   LOADING
════════════════════════════ */
.loading-overlay {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; min-height: 60vh; gap: 1.25rem;
}
.load-ring { position: relative; width: 56px; height: 56px; }
.load-ring span {
  position: absolute; inset: 0; border-radius: 50%;
  border: 3px solid transparent; animation: spin 1.2s linear infinite;
}
.load-ring span:nth-child(1) { border-top-color: #3b82f6; }
.load-ring span:nth-child(2) { border-top-color: #10b981; animation-delay: .4s; inset: 8px; }
.load-ring span:nth-child(3) { border-top-color: #8b5cf6; animation-delay: .8s; inset: 16px; }
@keyframes spin { to { transform: rotate(360deg); } }
.load-text { color: #6b7280; font-size: .9rem; }

/* ════════════════════════════
   DASH CONTENT
════════════════════════════ */
.dash-content { display: flex; flex-direction: column; gap: 1.5rem; }

/* ════════════════════════════
   HERO BANNER
════════════════════════════ */
.hero-banner {
  position: relative;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f3460 100%);
  border-radius: 22px; overflow: hidden;
  padding: 2rem 2rem 0;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.35);
}
.hero-bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.hero-blob { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.35; }
.hero-blob-1 {
  width: 300px; height: 300px;
  background: radial-gradient(circle, #3b82f6, transparent);
  top: -80px; right: 80px;
  animation: blobFloat 8s ease-in-out infinite;
}
.hero-blob-2 {
  width: 200px; height: 200px;
  background: radial-gradient(circle, #10b981, transparent);
  bottom: 10px; left: 40%;
  animation: blobFloat 11s ease-in-out infinite reverse;
}
.hero-blob-3 {
  width: 160px; height: 160px;
  background: radial-gradient(circle, #8b5cf6, transparent);
  top: 30px; left: 20%;
  animation: blobFloat 9s ease-in-out infinite 2s;
}
@keyframes blobFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33%  { transform: translate(20px, -15px) scale(1.05); }
  66%  { transform: translate(-10px, 10px) scale(0.95); }
}
.hero-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}
.hero-body {
  position: relative; z-index: 1;
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 2rem; flex-wrap: wrap;
}
.hero-left { flex: 1; min-width: 260px; }
.hero-eyebrow {
  display: inline-flex; align-items: center; gap: .5rem;
  background: rgba(255,255,255,0.1); backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.15);
  color: rgba(255,255,255,0.85); font-size: .75rem; font-weight: 700;
  padding: .3rem .8rem; border-radius: 20px; margin-bottom: 1rem;
  letter-spacing: .04em; text-transform: uppercase;
}
.status-dot-wrap { position: relative; width: 8px; height: 8px; }
.status-dot-anim {
  position: absolute; inset: 0; border-radius: 50%;
  background: #10b981; animation: dotPulse 1.8s ease-in-out infinite;
}
.status-dot-wrap.inactive .status-dot-anim,
.status-dot-wrap.expired .status-dot-anim,
.status-dot-wrap.suspended .status-dot-anim { background: #ef4444; }
@keyframes dotPulse { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.6);} 50%{box-shadow:0 0 0 5px rgba(16,185,129,0);} }
.hero-title {
  font-size: 2rem; font-weight: 800; color: #fff;
  margin: 0 0 .4rem; letter-spacing: -.5px; line-height: 1.15;
}
.hero-wave { font-style: normal; margin-left: .3rem; }
.hero-sub { color: rgba(255,255,255,.6); font-size: .9rem; margin: 0 0 1.5rem; }
.hero-pills { display: flex; flex-wrap: wrap; gap: .6rem; }
.hero-pill {
  display: inline-flex; align-items: center; gap: .45rem;
  padding: .45rem .9rem; border-radius: 20px;
  font-size: .78rem; font-weight: 700;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.12);
}
.hero-pill.plan  { background: rgba(245,158,11,.2); color: #fbbf24; }
.hero-pill.sms   { background: rgba(16,185,129,.2); color: #6ee7b7; }
.hero-pill.renew { background: rgba(139,92,246,.2); color: #c4b5fd; }
.hero-right { flex-shrink: 0; }
.hero-donut-wrap { display: flex; flex-direction: column; align-items: center; gap: 1rem; }
.hero-donut { width: 160px; height: 160px; transform: rotate(-90deg); }
.donut-pct  { font-size: 20px; font-weight: 900; fill: #fff; }
.donut-lbl  { font-size: 8px; fill: rgba(255,255,255,.6); }
.donut-caption { display: flex; flex-direction: column; gap: .3rem; }
.dc-line { display: flex; align-items: center; gap: .4rem; font-size: .72rem; color: rgba(255,255,255,.7); }
.dc-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
.dc-dot.used  { background: #10b981; }
.dc-dot.avail { background: rgba(255,255,255,0.3); }
.hero-prog-wrap {
  position: relative; z-index: 1;
  padding: 1.5rem 0 1.25rem;
  display: flex; flex-direction: column; gap: .5rem;
}
.hero-prog-bar { height: 6px; background: rgba(255,255,255,0.12); border-radius: 6px; overflow: hidden; }
.hero-prog-fill { height: 100%; border-radius: 6px; transition: width 1s cubic-bezier(.4,0,.2,1); }
.hero-prog-label { font-size: .75rem; color: rgba(255,255,255,.5); }

/* ════════════════════════════
   STAT CARDS
════════════════════════════ */
.stat-grid {
  display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem;
}
@media (max-width: 1024px) { .stat-grid { grid-template-columns: repeat(2,1fr); } }
@media (max-width: 580px)  { .stat-grid { grid-template-columns: 1fr; } }

.stat-card {
  background: #fff; border-radius: 16px; padding: 1.2rem 1.2rem .9rem;
  box-shadow: 0 2px 16px rgba(0,0,0,.07); position: relative; overflow: hidden;
  transition: transform .2s ease, box-shadow .2s ease;
  animation: cardIn .5s ease both;
}
@keyframes cardIn {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 40px rgba(0,0,0,.12); }
.stat-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: var(--c); border-radius: 16px 16px 0 0;
}
.sc-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: .75rem; }
.sc-icon {
  width: 42px; height: 42px; border-radius: 11px;
  background: color-mix(in srgb, var(--c) 12%, white);
  color: var(--c); display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
}
.sc-badge {
  display: inline-flex; align-items: center; gap: .3rem;
  font-size: .68rem; font-weight: 700; padding: .22rem .55rem; border-radius: 20px;
}
.sc-badge.badge-up      { background: #dcfce7; color: #16a34a; }
.sc-badge.badge-down    { background: #fef2f2; color: #dc2626; }
.sc-badge.badge-neutral { background: #f3f4f6; color: #6b7280; }
.sc-value { font-size: 1.65rem; font-weight: 800; color: #111827; line-height: 1; margin-bottom: .25rem; }
.sc-label { font-size: .75rem; color: #6b7280; font-weight: 500; margin-bottom: .85rem; }
.sc-bar-bg   { height: 4px; background: #f3f4f6; border-radius: 4px; overflow: hidden; }
.sc-bar-fill { height: 100%; background: var(--c); border-radius: 4px; transition: width .6s ease; }

/* ════════════════════════════
   BOTTOM ROW
════════════════════════════ */
.bottom-row {
  display: grid; grid-template-columns: 1.4fr 1fr; gap: 1rem; align-items: start;
}
@media (max-width: 768px) { .bottom-row { grid-template-columns: 1fr; } }

/* CARD BASE */
.card { background: #fff; border-radius: 16px; box-shadow: 0 2px 16px rgba(0,0,0,.07); overflow: hidden; }
.card-head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 1.25rem .875rem; border-bottom: 1px solid #f3f4f6;
}
.card-label { font-weight: 700; color: #111827; font-size: .9rem; display: flex; align-items: center; gap: .45rem; }
.card-icon  { color: var(--primary, #3b82f6); font-size: .9rem; }
.see-all    { font-size: .78rem; color: #3b82f6; text-decoration: none; font-weight: 600; }
.see-all:hover { text-decoration: underline; }
.month-tag  { font-size: .75rem; color: #9ca3af; font-weight: 500; text-transform: capitalize; }

/* SMS ESTE MÊS */
.sms-body { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
.sms-stat-row { display: grid; grid-template-columns: repeat(3,1fr); gap: .6rem; }
.ssb {
  display: flex; flex-direction: column; align-items: center; gap: .3rem;
  padding: .85rem .4rem; border-radius: 12px; text-align: center;
}
.ssb i { font-size: 1rem; }
.ssb-val  { font-size: 1.2rem; font-weight: 800; color: #111827; line-height: 1; }
.ssb-lbl  { font-size: .65rem; color: #9ca3af; }
.ssb.delivered { background: #f0fdf4; color: #16a34a; }
.ssb.sent      { background: #eff6ff; color: #2563eb; }
.ssb.failed    { background: #fef2f2; color: #dc2626; }

/* Taxa de entrega */
.delivery-rate {
  background: #f9fafb; border-radius: 12px; padding: .875rem 1rem;
}
.dr-header {
  display: flex; justify-content: space-between; align-items: center;
  margin-bottom: .6rem;
}
.dr-label { font-size: .78rem; color: #6b7280; font-weight: 600; }
.dr-pct   { font-size: .95rem; font-weight: 800; }
.dr-pct.rate-great { color: #16a34a; }
.dr-pct.rate-ok    { color: #d97706; }
.dr-pct.rate-bad   { color: #dc2626; }
.dr-bar-bg { height: 7px; background: #e5e7eb; border-radius: 7px; overflow: hidden; }
.dr-bar-fill { height: 100%; border-radius: 7px; transition: width .8s cubic-bezier(.4,0,.2,1); }

/* CLIENTES */
.clients-body { padding: 1.25rem; }
.cst-value { font-size: 2.5rem; font-weight: 900; color: #111827; line-height: 1; margin-bottom: .2rem; }
.cst-label { font-size: .78rem; color: #9ca3af; margin-bottom: .85rem; }
.cst-bar-bg { height: 8px; background: #f3f4f6; border-radius: 8px; overflow: hidden; margin-bottom: .6rem; }
.cst-bar-fill { height: 100%; background: linear-gradient(90deg, #f59e0b, #d97706); border-radius: 8px; transition: width .8s ease; }
.cst-sub { font-size: .75rem; color: #6b7280; }

/* ════════════════════════════
   RESPONSIVE
════════════════════════════ */
@media (max-width: 768px) {
  .hero-title  { font-size: 1.5rem; }
  .hero-right  { display: none; }
  .hero-banner { padding: 1.5rem 1.5rem 0; }
}
</style>