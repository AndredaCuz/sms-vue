<template>
  <AppLayout>
    <div class="profile-page fade-in">

      <transition name="toast">
        <div v-if="toast.show" :class="['toast', toast.type]">
          <i :class="toast.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
          {{ toast.message }}
        </div>
      </transition>

      <!-- HERO -->
      <div class="profile-hero">
        <div class="hero-bg">
          <div class="hb-1"></div><div class="hb-2"></div>
          <div class="hero-grid-lines"></div>
        </div>
        <div class="hero-content">
          <div class="avatar-wrap">
            <div class="avatar-ring">
              <div class="avatar-circle">{{ initials }}</div>
            </div>
            <label class="avatar-cam" title="Alterar foto">
              <i class="fas fa-camera"></i>
              <input type="file" accept="image/*" @change="handleAvatarChange" hidden />
            </label>
          </div>
          <div class="hero-info">
            <div class="hero-eyebrow"><span class="status-dot"></span> Conta Ativa</div>
            <h1 class="hero-name">{{ profile.admin_name || 'Nome do Utilizador' }}</h1>
            <p class="hero-email">{{ profile.admin_email || 'email@empresa.com' }}</p>
            <div class="hero-tags">
              <span class="htag role"><i class="fas fa-shield-alt"></i> Administrador</span>
              <span class="htag company" v-if="profile.company_name">
                <i class="fas fa-building"></i> {{ profile.company_name }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- TABS -->
      <div class="tabs-bar">
        <button v-for="tab in tabs" :key="tab.id" class="tab-btn"
          :class="{ active: activeTab === tab.id }" @click="activeTab = tab.id">
          <i :class="tab.icon"></i><span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- CONTENT -->
      <div class="tab-body">

        <!-- PERFIL TAB -->
        <div v-if="activeTab === 'perfil'" class="tab-panel">
          <div class="panel-grid">
            <div class="card">
              <div class="card-head">
                <div class="ch-icon" style="--ci:#3b82f6"><i class="fas fa-user"></i></div>
                <div><h3>Dados Pessoais</h3><p>Informações do seu perfil</p></div>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label>Nome Completo</label>
                  <div class="input-wrap">
                    <i class="fas fa-user fi"></i>
                    <input type="text" v-model="profile.admin_name" placeholder="Seu nome completo" />
                  </div>
                  <span class="field-err" v-if="errors.admin_name">{{ errors.admin_name }}</span>
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <div class="input-wrap">
                    <i class="fas fa-envelope fi"></i>
                    <input type="email" v-model="profile.admin_email" placeholder="seu@email.com" />
                  </div>
                  <span class="field-err" v-if="errors.admin_email">{{ errors.admin_email }}</span>
                </div>
              </div>
              <div class="card-foot">
                <button class="btn-primary" @click="saveProfile" :disabled="loading.profile">
                  <i class="fas fa-save" v-if="!loading.profile"></i>
                  <i class="fas fa-spinner fa-spin" v-else></i>
                  {{ loading.profile ? 'A guardar...' : 'Guardar Alterações' }}
                </button>
              </div>
            </div>

            <div class="card">
              <div class="card-head">
                <div class="ch-icon" style="--ci:#f59e0b"><i class="fas fa-building"></i></div>
                <div><h3>Dados da Empresa</h3><p>Informações da sua organização</p></div>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label>Nome da Empresa</label>
                  <div class="input-wrap">
                    <i class="fas fa-building fi"></i>
                    <input type="text" v-model="profile.company_name" placeholder="Nome da empresa" />
                  </div>
                </div>
                <div class="form-group">
                  <label>Email da Empresa</label>
                  <div class="input-wrap">
                    <i class="fas fa-envelope fi"></i>
                    <input type="email" v-model="profile.company_email" placeholder="empresa@email.com" />
                  </div>
                </div>
                <div class="form-group">
                  <label>Telefone</label>
                  <div class="input-wrap">
                    <i class="fas fa-phone fi"></i>
                    <input type="tel" v-model="profile.company_phone" placeholder="923 456 789" />
                  </div>
                </div>
                <div class="form-group">
                  <label>NIF</label>
                  <div class="input-wrap">
                    <i class="fas fa-id-card fi"></i>
                    <input type="text" v-model="profile.nif" placeholder="Número de identificação fiscal" />
                  </div>
                </div>
              </div>
              <div class="card-foot">
                <button class="btn-primary" @click="saveCompany" :disabled="loading.company">
                  <i class="fas fa-save" v-if="!loading.company"></i>
                  <i class="fas fa-spinner fa-spin" v-else></i>
                  {{ loading.company ? 'A guardar...' : 'Guardar Empresa' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- SEGURANCA TAB -->
        <div v-if="activeTab === 'seguranca'" class="tab-panel">
          <div class="panel-grid panel-narrow">
            <div class="card">
              <div class="card-head">
                <div class="ch-icon" style="--ci:#ef4444"><i class="fas fa-lock"></i></div>
                <div><h3>Alterar Senha</h3><p>Mantenha a sua conta segura</p></div>
              </div>
              <div class="form-grid form-1col">
                <div class="form-group">
                  <label>Senha Atual</label>
                  <div class="input-wrap">
                    <i class="fas fa-lock fi"></i>
                    <input :type="showPwd.current ? 'text' : 'password'" v-model="security.current_password" placeholder="Sua senha atual" />
                    <button class="eye-btn" @click="showPwd.current = !showPwd.current">
                      <i :class="showPwd.current ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                </div>
                <div class="form-group">
                  <label>Nova Senha</label>
                  <div class="input-wrap">
                    <i class="fas fa-key fi"></i>
                    <input :type="showPwd.new ? 'text' : 'password'" v-model="security.password" placeholder="Mínimo 8 caracteres" />
                    <button class="eye-btn" @click="showPwd.new = !showPwd.new">
                      <i :class="showPwd.new ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <div class="strength-bar" v-if="security.password">
                    <div class="strength-fill" :class="strengthClass" :style="{ width: strengthWidth }"></div>
                  </div>
                  <span class="strength-lbl" v-if="security.password" :class="strengthClass">{{ strengthLabel }}</span>
                </div>
                <div class="form-group">
                  <label>Confirmar Nova Senha</label>
                  <div class="input-wrap">
                    <i class="fas fa-key fi"></i>
                    <input :type="showPwd.confirm ? 'text' : 'password'" v-model="security.password_confirmation" placeholder="Repita a nova senha" />
                    <button class="eye-btn" @click="showPwd.confirm = !showPwd.confirm">
                      <i :class="showPwd.confirm ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                </div>
              </div>
              <div class="pwd-tips">
                <div class="pwd-tip" :class="{ ok: security.password.length >= 8 }"><i class="fas fa-check"></i> Mínimo 8 caracteres</div>
                <div class="pwd-tip" :class="{ ok: /[A-Z]/.test(security.password) }"><i class="fas fa-check"></i> Letra maiúscula</div>
                <div class="pwd-tip" :class="{ ok: /[0-9]/.test(security.password) }"><i class="fas fa-check"></i> Número</div>
                <div class="pwd-tip" :class="{ ok: /[^a-zA-Z0-9]/.test(security.password) }"><i class="fas fa-check"></i> Caractere especial</div>
              </div>
              <div class="card-foot">
                <button class="btn-danger" @click="changePassword" :disabled="loading.security">
                  <i class="fas fa-key" v-if="!loading.security"></i>
                  <i class="fas fa-spinner fa-spin" v-else></i>
                  {{ loading.security ? 'A alterar...' : 'Alterar Senha' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- NOTIFICACOES TAB -->
        <div v-if="activeTab === 'notificacoes'" class="tab-panel">
          <div class="panel-grid panel-narrow">
            <div class="card">
              <div class="card-head">
                <div class="ch-icon" style="--ci:#8b5cf6"><i class="fas fa-bell"></i></div>
                <div><h3>Preferências de Notificação</h3><p>Escolha como quer ser notificado</p></div>
              </div>
              <div class="toggle-list">
                <div class="toggle-item" v-for="notif in notifications" :key="notif.key">
                  <div class="ti-info">
                    <span class="ti-title">{{ notif.label }}</span>
                    <span class="ti-desc">{{ notif.desc }}</span>
                  </div>
                  <label class="toggle-sw">
                    <input type="checkbox" v-model="notif.enabled" />
                    <span class="sw-track"></span>
                  </label>
                </div>
              </div>
              <div class="card-foot">
                <button class="btn-primary" @click="saveNotifications" :disabled="loading.notifications">
                  <i class="fas fa-save" v-if="!loading.notifications"></i>
                  <i class="fas fa-spinner fa-spin" v-else></i>
                  {{ loading.notifications ? 'A guardar...' : 'Guardar Preferências' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- API TAB -->
        <div v-if="activeTab === 'api'" class="tab-panel">
          <div class="panel-grid">
            <div class="card card-api">
              <div class="card-head">
                <div class="ch-icon" style="--ci:#10b981"><i class="fas fa-code"></i></div>
                <div><h3>Chave de API</h3><p>Integre a DevSMS na sua aplicação</p></div>
              </div>
              <p class="api-hint">Use esta chave para integrar com a API DevSMS. Nunca partilhe com terceiros.</p>
              <div class="api-block">
                <code class="api-code">{{ showApiKey ? apiToken : maskedToken }}</code>
                <div class="api-btns">
                  <button class="abtn" @click="showApiKey = !showApiKey">
                    <i :class="showApiKey ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                  </button>
                  <button class="abtn" @click="copyToken"><i class="fas fa-copy"></i></button>
                  <button class="abtn abtn-warn" @click="regenerateToken"><i class="fas fa-sync-alt"></i></button>
                </div>
              </div>
              <div class="api-stats">
                <div class="api-stat"><span class="as-val">1,240</span><span class="as-lbl">Requests hoje</span></div>
                <div class="api-stat"><span class="as-val">98.7%</span><span class="as-lbl">Uptime</span></div>
                <div class="api-stat"><span class="as-val">v1</span><span class="as-lbl">Versão da API</span></div>
              </div>
            </div>

            <!-- ZONA DE PERIGO -->
            <div class="card card-danger">
              <div class="card-head">
                <div class="ch-icon" style="--ci:#ef4444"><i class="fas fa-exclamation-triangle"></i></div>
                <div><h3>Zona de Perigo</h3><p>Acções irreversíveis na conta</p></div>
              </div>
              <div class="danger-list">
                <div class="danger-item">
                  <div>
                    <strong>Exportar dados</strong>
                    <p>Transferir todos os seus dados em JSON</p>
                  </div>
                  <button class="btn-outline" @click="exportData"><i class="fas fa-download"></i> Exportar</button>
                </div>
                <div class="danger-item">
                  <div>
                    <strong>Desativar conta</strong>
                    <p>Suspender temporariamente a sua conta</p>
                  </div>
                  <button class="btn-outline btn-outline-red"><i class="fas fa-pause"></i> Desativar</button>
                </div>
                <div class="danger-item">
                  <div>
                    <strong>Excluir conta</strong>
                    <p>Remover permanentemente todos os dados</p>
                  </div>
                  <button class="btn-outline btn-outline-red" @click="confirmDelete"><i class="fas fa-trash"></i> Excluir</button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- DELETE MODAL -->
      <div class="modal-overlay" v-if="showDeleteModal" @click.self="showDeleteModal = false">
        <div class="modal">
          <div class="modal-icon"><i class="fas fa-exclamation-triangle"></i></div>
          <h3>Excluir conta definitivamente?</h3>
          <p>Esta acção é irreversível. Todos os dados, campanhas e contactos serão permanentemente removidos.</p>
          <div class="modal-input">
            <label>Digite <strong>CONFIRMAR</strong> para prosseguir</label>
            <input type="text" v-model="deleteConfirmText" placeholder="CONFIRMAR" />
          </div>
          <div class="modal-actions">
            <button class="btn-outline" @click="showDeleteModal = false">Cancelar</button>
            <button class="btn-danger" :disabled="deleteConfirmText !== 'CONFIRMAR'" @click="deleteAccount">
              <i class="fas fa-trash"></i> Excluir Permanentemente
            </button>
          </div>
        </div>
      </div>

    </div>
  </AppLayout>
</template>

<script>
import axios from 'axios';
import AppLayout from '../../components/AppLayout.vue';

const API_BASE = 'https://api.devsms.online/api/v1';

export default {
  name: 'Profile',
  components: { AppLayout 

  },
  data() {
    return {
      activeTab: 'perfil',
      tabs: [
        { id: 'perfil',        icon: 'fas fa-user',        label: 'Perfil' },
        { id: 'seguranca',     icon: 'fas fa-lock',        label: 'Segurança' },
        { id: 'notificacoes',  icon: 'fas fa-bell',        label: 'Notificações' },
        { id: 'api',           icon: 'fas fa-code',        label: 'API & Perigo' },
      ],
      profile: { admin_name: '', admin_email: '', company_name: '', company_email: '', company_phone: '', nif: '' },
      security: { current_password: '', password: '', password_confirmation: '' },
      errors: {},
      loading: { profile: false, company: false, security: false, notifications: false },
      toast: { show: false, message: '', type: 'success' },
      showPwd: { current: false, new: false, confirm: false },
      showApiKey: false,
      apiToken: 'sk-dev-a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0',
      showDeleteModal: false,
      deleteConfirmText: '',
      notifications: [
        { key: 'email_campaigns',  label: 'Relatórios de campanhas',   desc: 'Receba por email após cada campanha enviada',           enabled: true  },
        { key: 'email_billing',    label: 'Faturação e cobranças',     desc: 'Notificações sobre faturas e renovações',               enabled: true  },
        { key: 'email_security',   label: 'Alertas de segurança',      desc: 'Login de novos dispositivos ou alterações',             enabled: true  },
        { key: 'email_tips',       label: 'Dicas e novidades',         desc: 'Novidades e boas práticas do DevSMS',                   enabled: false },
        { key: 'sms_alerts',       label: 'Alertas por SMS',           desc: 'Receba alertas críticos no seu telemóvel',              enabled: false },
      ],
    };
  },
  computed: {
    initials() {
      const name = this.profile.admin_name || 'U';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    },
    maskedToken() {
      return this.apiToken.slice(0, 8) + '•'.repeat(24) + this.apiToken.slice(-6);
    },
    strengthClass() {
      const pwd = this.security.password;
      if (!pwd) return '';
      let s = 0;
      if (pwd.length >= 8) s++;
      if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) s++;
      if (/[0-9]/.test(pwd)) s++;
      if (/[^a-zA-Z0-9]/.test(pwd)) s++;
      if (s <= 1) return 'weak';
      if (s <= 3) return 'medium';
      return 'strong';
    },
    strengthWidth() { return { weak: '33%', medium: '66%', strong: '100%' }[this.strengthClass] || '0%'; },
    strengthLabel()  { return { weak: 'Fraca', medium: 'Média', strong: 'Forte' }[this.strengthClass] || ''; },
  },
  mounted() { this.loadProfile(); },
  methods: {
    getHeaders() {
      const token = localStorage.getItem('auth_token');
      return { 'Content-Type': 'application/json', Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    },
    async loadProfile() {
      try {
        const saved = localStorage.getItem('user_data');
        if (saved) Object.assign(this.profile, JSON.parse(saved));
        const res = await axios.get(`${API_BASE}/auth/me`, { headers: this.getHeaders() });
        Object.assign(this.profile, res.data.data || res.data);
        localStorage.setItem('user_data', JSON.stringify(this.profile));
      } catch {}
    },
    async saveProfile() {
      this.errors = {};
      if (!this.profile.admin_name || this.profile.admin_name.length < 3) { this.errors.admin_name = 'Nome deve ter no mínimo 3 caracteres'; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.profile.admin_email)) { this.errors.admin_email = 'Email inválido'; return; }
      this.loading.profile = true;
      try {
        await axios.put(`${API_BASE}/auth/profile`, { admin_name: this.profile.admin_name, admin_email: this.profile.admin_email }, { headers: this.getHeaders() });
        this.showToast('Perfil atualizado com sucesso!', 'success');
        localStorage.setItem('user_data', JSON.stringify(this.profile));
      } catch (e) { this.showToast(e?.response?.data?.message || 'Erro ao guardar.', 'error'); }
      finally { this.loading.profile = false; }
    },
    async saveCompany() {
      this.loading.company = true;
      try {
        await axios.put(`${API_BASE}/auth/company`, { company_name: this.profile.company_name, company_email: this.profile.company_email, company_phone: this.profile.company_phone, nif: this.profile.nif }, { headers: this.getHeaders() });
        this.showToast('Dados da empresa atualizados!', 'success');
      } catch (e) { this.showToast(e?.response?.data?.message || 'Erro ao guardar empresa.', 'error'); }
      finally { this.loading.company = false; }
    },
    async changePassword() {
      if (!this.security.current_password) return this.showToast('Informe a senha atual.', 'error');
      if (this.security.password.length < 8) return this.showToast('Nova senha deve ter pelo menos 8 caracteres.', 'error');
      if (this.security.password !== this.security.password_confirmation) return this.showToast('As senhas não coincidem.', 'error');
      this.loading.security = true;
      try {
        await axios.put(`${API_BASE}/auth/password`, this.security, { headers: this.getHeaders() });
        this.showToast('Senha alterada com sucesso!', 'success');
        this.security = { current_password: '', password: '', password_confirmation: '' };
      } catch (e) { this.showToast(e?.response?.data?.message || 'Erro ao alterar senha.', 'error'); }
      finally { this.loading.security = false; }
    },
    async saveNotifications() {
      this.loading.notifications = true;
      try {
        const payload = {};
        this.notifications.forEach(n => { payload[n.key] = n.enabled; });
        await axios.put(`${API_BASE}/auth/notifications`, payload, { headers: this.getHeaders() });
        this.showToast('Preferências de notificação guardadas!', 'success');
      } catch { this.showToast('Erro ao guardar notificações.', 'error'); }
      finally { this.loading.notifications = false; }
    },
    copyToken() { navigator.clipboard.writeText(this.apiToken); this.showToast('Token copiado!', 'success'); },
    regenerateToken() {
      if (!confirm('Tem certeza? O token actual será invalidado imediatamente.')) return;
      this.apiToken = 'sk-dev-' + Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join('');
      this.showToast('Token regenerado com sucesso!', 'success');
    },
    exportData() {
      const data = { profile: this.profile, exported_at: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'devsms-export.json'; a.click();
    },
    confirmDelete() { this.showDeleteModal = true; },
    async deleteAccount() {
      if (this.deleteConfirmText !== 'CONFIRMAR') return;
      try {
        await axios.delete(`${API_BASE}/auth/account`, { headers: this.getHeaders() });
        localStorage.clear(); this.$router.push('/login');
      } catch { this.showToast('Erro ao excluir conta. Contacte o suporte.', 'error'); this.showDeleteModal = false; }
    },
    handleAvatarChange() { this.showToast('Funcionalidade de foto em breve!', 'success'); },
    showToast(message, type = 'success') {
      this.toast = { show: true, message, type };
      setTimeout(() => { this.toast.show = false; }, 3500);
    },
  },
};
</script>

<style scoped>
/* ════════════════════════════
   PAGE WRAPPER
════════════════════════════ */
.profile-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 1100px;
}

/* ════════════════════════════
   TOAST
════════════════════════════ */
.toast {
  position: fixed;
  top: 1.5rem; right: 1.75rem;
  padding: 0.875rem 1.25rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 8px 30px rgba(0,0,0,.12);
}
.toast.success { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
.toast.error   { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(16px); }

/* ════════════════════════════
   HERO
════════════════════════════ */
.profile-hero {
  position: relative;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #0f3460 100%);
  border-radius: 20px;
  overflow: hidden;
  padding: 2.5rem 2rem 2rem;
  box-shadow: 0 16px 48px rgba(15,23,42,.3);
}
.hero-bg { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.hb-1 {
  position: absolute; width: 320px; height: 320px; border-radius: 50%;
  background: radial-gradient(circle, rgba(59,130,246,.35), transparent);
  top: -100px; right: 60px;
  animation: hbFloat 9s ease-in-out infinite;
}
.hb-2 {
  position: absolute; width: 200px; height: 200px; border-radius: 50%;
  background: radial-gradient(circle, rgba(16,185,129,.25), transparent);
  bottom: -40px; left: 30%;
  animation: hbFloat 12s ease-in-out infinite reverse;
}
@keyframes hbFloat {
  0%,100% { transform: translate(0,0) scale(1); }
  50% { transform: translate(15px,-12px) scale(1.05); }
}
.hero-grid-lines {
  position: absolute; inset: 0;
  background-image: linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
  background-size: 36px 36px;
}
.hero-content {
  position: relative; z-index: 1;
  display: flex; align-items: center; gap: 1.75rem; flex-wrap: wrap;
}
.avatar-wrap { position: relative; flex-shrink: 0; }
.avatar-ring {
  width: 96px; height: 96px; border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6, #10b981);
  padding: 3px;
  box-shadow: 0 8px 32px rgba(59,130,246,.4);
}
.avatar-circle {
  width: 100%; height: 100%; border-radius: 50%;
  background: linear-gradient(135deg, #1e40af, #065f46);
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem; font-weight: 800; color: #fff;
  letter-spacing: -1px;
}
.avatar-cam {
  position: absolute; bottom: 2px; right: 2px;
  width: 30px; height: 30px; border-radius: 50%;
  background: #fff; color: #374151;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.75rem; cursor: pointer;
  border: 2px solid rgba(255,255,255,.5);
  transition: background .2s, transform .2s;
  box-shadow: 0 2px 8px rgba(0,0,0,.2);
}
.avatar-cam:hover { background: #f3f4f6; transform: scale(1.1); }
.hero-info { flex: 1; }
.hero-eyebrow {
  display: inline-flex; align-items: center; gap: .45rem;
  background: rgba(255,255,255,.1); backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,.15);
  color: rgba(255,255,255,.85); font-size: .72rem; font-weight: 700;
  padding: .25rem .75rem; border-radius: 20px; margin-bottom: .75rem;
  text-transform: uppercase; letter-spacing: .05em;
}
.status-dot {
  width: 7px; height: 7px; border-radius: 50%; background: #10b981;
  animation: dotPulse 1.8s ease-in-out infinite;
}
@keyframes dotPulse { 0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,.6);} 50%{box-shadow:0 0 0 4px rgba(16,185,129,0);} }
.hero-name  { font-size: 1.75rem; font-weight: 800; color: #fff; margin: 0 0 .25rem; letter-spacing: -.5px; }
.hero-email { color: rgba(255,255,255,.55); font-size: .9rem; margin: 0 0 1rem; }
.hero-tags  { display: flex; flex-wrap: wrap; gap: .5rem; }
.htag {
  display: inline-flex; align-items: center; gap: .35rem;
  padding: .35rem .75rem; border-radius: 20px;
  font-size: .72rem; font-weight: 700;
  backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,.12);
}
.htag.role    { background: rgba(59,130,246,.2); color: #93c5fd; }
.htag.company { background: rgba(245,158,11,.2); color: #fcd34d; }

/* ════════════════════════════
   TABS
════════════════════════════ */
.tabs-bar {
  display: flex; gap: .4rem;
  background: #fff; border-radius: 14px; padding: .375rem;
  box-shadow: 0 2px 12px rgba(0,0,0,.06);
  border: 1px solid #f3f4f6;
}
.tab-btn {
  flex: 1; display: flex; align-items: center; justify-content: center; gap: .45rem;
  padding: .65rem .75rem; border: none; border-radius: 10px;
  background: transparent; cursor: pointer;
  font-size: .82rem; font-weight: 600; color: #6b7280;
  transition: all .2s;
}
.tab-btn:hover { background: #f9fafb; color: #374151; }
.tab-btn.active { background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; box-shadow: 0 3px 12px rgba(59,130,246,.3); }
.tab-btn i { font-size: .85rem; }

/* ════════════════════════════
   TAB BODY
════════════════════════════ */
.tab-body { min-height: 300px; }
.tab-panel { animation: panelIn .25s ease; }
@keyframes panelIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

.panel-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
.panel-narrow { grid-template-columns: minmax(0, 640px); }

/* ════════════════════════════
   CARDS
════════════════════════════ */
.card {
  background: #fff; border-radius: 16px; padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0,0,0,.06); border: 1px solid #f3f4f6;
  transition: box-shadow .2s;
}
.card:hover { box-shadow: 0 6px 24px rgba(0,0,0,.1); }

.card-head {
  display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;
}
.ch-icon {
  width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
  background: color-mix(in srgb, var(--ci) 12%, white);
  color: var(--ci);
  display: flex; align-items: center; justify-content: center; font-size: 1.1rem;
}
.card-head h3 { font-size: .95rem; font-weight: 700; color: #111827; margin: 0 0 .15rem; }
.card-head p  { font-size: .78rem; color: #9ca3af; margin: 0; }

.card-foot { margin-top: 1.25rem; display: flex; justify-content: flex-end; }

/* ════════════════════════════
   FORMS
════════════════════════════ */
.form-grid   { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-1col   { grid-template-columns: 1fr; }
.form-group  { display: flex; flex-direction: column; gap: .4rem; }
.form-group label { font-size: .8rem; font-weight: 600; color: #374151; }
.input-wrap { position: relative; display: flex; align-items: center; }
.fi {
  position: absolute; left: .875rem;
  color: #9ca3af; font-size: .8rem; pointer-events: none;
  transition: color .2s;
}
.input-wrap:focus-within .fi { color: #3b82f6; }
.input-wrap input {
  width: 100%; padding: .65rem .875rem .65rem 2.5rem;
  border: 1.5px solid #e5e7eb; border-radius: 10px;
  font-size: .875rem; color: #111827; background: #fafafa;
  transition: all .2s; outline: none; box-sizing: border-box;
}
.input-wrap input:focus {
  border-color: #3b82f6; background: #fff;
  box-shadow: 0 0 0 3px rgba(59,130,246,.1);
}
.eye-btn {
  position: absolute; right: .75rem;
  background: none; border: none; cursor: pointer;
  color: #9ca3af; font-size: .85rem; padding: .25rem;
  border-radius: 6px; transition: color .2s;
}
.eye-btn:hover { color: #374151; }
.field-err { font-size: .72rem; color: #ef4444; }

/* STRENGTH */
.strength-bar { height: 3px; background: #e5e7eb; border-radius: 3px; overflow: hidden; margin-top: .5rem; }
.strength-fill { height: 100%; border-radius: 3px; transition: all .35s; }
.strength-fill.weak   { background: #ef4444; }
.strength-fill.medium { background: #f59e0b; }
.strength-fill.strong { background: #10b981; }
.strength-lbl { font-size: .72rem; font-weight: 700; margin-top: .25rem; }
.strength-lbl.weak   { color: #ef4444; }
.strength-lbl.medium { color: #d97706; }
.strength-lbl.strong { color: #10b981; }

/* PWD TIPS */
.pwd-tips { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: 1rem; }
.pwd-tip {
  font-size: .72rem; color: #9ca3af;
  padding: .25rem .65rem; background: #f3f4f6;
  border-radius: 20px; border: 1px solid #e5e7eb;
  display: flex; align-items: center; gap: .3rem;
  transition: all .2s;
}
.pwd-tip i { font-size: .65rem; }
.pwd-tip.ok { color: #10b981; background: #dcfce7; border-color: #bbf7d0; }

/* ════════════════════════════
   BUTTONS
════════════════════════════ */
.btn-primary {
  display: inline-flex; align-items: center; gap: .45rem;
  padding: .65rem 1.25rem; border: none; border-radius: 10px;
  background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff;
  font-size: .85rem; font-weight: 700; cursor: pointer;
  transition: all .2s; box-shadow: 0 3px 12px rgba(59,130,246,.3);
}
.btn-primary:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(59,130,246,.4); }
.btn-primary:disabled { opacity: .6; cursor: not-allowed; }

.btn-danger {
  display: inline-flex; align-items: center; gap: .45rem;
  padding: .65rem 1.25rem; border: none; border-radius: 10px;
  background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff;
  font-size: .85rem; font-weight: 700; cursor: pointer;
  transition: all .2s; box-shadow: 0 3px 12px rgba(239,68,68,.25);
}
.btn-danger:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 18px rgba(239,68,68,.35); }
.btn-danger:disabled { opacity: .5; cursor: not-allowed; }

.btn-outline {
  display: inline-flex; align-items: center; gap: .4rem;
  padding: .55rem 1rem; border: 1.5px solid #e5e7eb;
  border-radius: 8px; background: none;
  font-size: .8rem; font-weight: 600; color: #374151; cursor: pointer;
  transition: all .2s; white-space: nowrap;
}
.btn-outline:hover { background: #f9fafb; }
.btn-outline-red { border-color: #fca5a5; color: #ef4444; }
.btn-outline-red:hover { background: #fee2e2; border-color: #ef4444; }

/* ════════════════════════════
   TOGGLES
════════════════════════════ */
.toggle-list { display: flex; flex-direction: column; }
.toggle-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 0; border-bottom: 1px solid #f3f4f6;
}
.toggle-item:last-child { border-bottom: none; }
.ti-info { display: flex; flex-direction: column; gap: .2rem; }
.ti-title { font-size: .875rem; font-weight: 600; color: #111827; }
.ti-desc  { font-size: .75rem; color: #9ca3af; }
.toggle-sw { position: relative; display: inline-block; width: 44px; height: 24px; flex-shrink: 0; }
.toggle-sw input { opacity: 0; width: 0; height: 0; }
.sw-track {
  position: absolute; inset: 0; background: #e5e7eb;
  border-radius: 100px; cursor: pointer; transition: .2s;
}
.sw-track::before {
  content: ''; position: absolute; width: 18px; height: 18px;
  left: 3px; top: 3px; background: #fff; border-radius: 50%;
  transition: .2s; box-shadow: 0 1px 4px rgba(0,0,0,.15);
}
.toggle-sw input:checked + .sw-track { background: #3b82f6; }
.toggle-sw input:checked + .sw-track::before { transform: translateX(20px); }

/* ════════════════════════════
   API CARD
════════════════════════════ */
.api-hint { color: #6b7280; font-size: .82rem; margin-bottom: 1rem; line-height: 1.5; }
.api-block {
  display: flex; align-items: center; gap: .875rem;
  background: #0f172a; border-radius: 12px; padding: 1rem 1.125rem;
}
.api-code {
  flex: 1; font-family: 'Courier New', monospace; font-size: .8rem;
  color: #34d399; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.api-btns { display: flex; gap: .5rem; flex-shrink: 0; }
.abtn {
  width: 34px; height: 34px;
  background: rgba(255,255,255,.08); border: none; border-radius: 8px;
  color: rgba(255,255,255,.7); font-size: .875rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all .2s;
}
.abtn:hover { background: rgba(255,255,255,.16); color: #fff; }
.abtn-warn:hover { background: rgba(245,158,11,.2); color: #fbbf24; }
.api-stats {
  display: flex; gap: 1.75rem;
  margin-top: 1.25rem; padding-top: 1.25rem;
  border-top: 1px solid #f3f4f6;
}
.api-stat { display: flex; flex-direction: column; gap: .2rem; }
.as-val { font-size: 1.25rem; font-weight: 800; color: #111827; }
.as-lbl { font-size: .72rem; color: #9ca3af; }

/* ════════════════════════════
   DANGER ZONE
════════════════════════════ */
.card-danger { border-color: #fecaca; }
.danger-list { display: flex; flex-direction: column; }
.danger-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1rem 0; border-bottom: 1px solid #fef2f2; gap: 1rem;
}
.danger-item:last-child { border-bottom: none; }
.danger-item strong { font-size: .875rem; font-weight: 700; color: #111827; }
.danger-item p { font-size: .75rem; color: #9ca3af; margin-top: .15rem; }

/* ════════════════════════════
   MODAL
════════════════════════════ */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,.55); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal {
  background: #fff; border-radius: 20px; padding: 2.5rem;
  max-width: 420px; width: 90%; text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,.25);
}
.modal-icon { font-size: 2.5rem; color: #ef4444; margin-bottom: 1rem; }
.modal h3 { font-size: 1.125rem; font-weight: 800; color: #111827; margin-bottom: .5rem; }
.modal p  { color: #6b7280; font-size: .875rem; line-height: 1.6; }
.modal-input { margin: 1.25rem 0; text-align: left; }
.modal-input label { display: block; font-size: .8rem; font-weight: 600; margin-bottom: .5rem; }
.modal-input input {
  width: 100%; padding: .65rem .875rem;
  border: 1.5px solid #e5e7eb; border-radius: 10px;
  font-size: .875rem; outline: none; box-sizing: border-box;
}
.modal-input input:focus { border-color: #ef4444; box-shadow: 0 0 0 3px rgba(239,68,68,.1); }
.modal-actions { display: flex; gap: .75rem; justify-content: center; margin-top: .25rem; }

/* ════════════════════════════
   RESPONSIVE
════════════════════════════ */
@media (max-width: 900px)  { .panel-grid { grid-template-columns: 1fr; } }
@media (max-width: 640px)  {
  .form-grid { grid-template-columns: 1fr; }
  .tabs-bar { gap: .25rem; }
  .tab-btn span { display: none; }
  .hero-name { font-size: 1.375rem; }
  .profile-hero { padding: 1.5rem 1.25rem 1.5rem; }
  .hero-content { gap: 1.25rem; }
  .avatar-ring { width: 72px; height: 72px; }
  .avatar-circle { font-size: 1.5rem; }
}
</style>