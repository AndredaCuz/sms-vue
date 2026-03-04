<template>
  <AppLayout>
  
  
  <div class="send-sms-page fade-in">

    <!-- Header -->
    <div class="page-header">
      <div class="header-left">
        <div class="header-icon">
          <i class="fas fa-paper-plane"></i>
        </div>
        <div>
          <h1 class="page-title">Enviar SMS</h1>
          <p class="page-subtitle">Configure e envie sua mensagem SMS</p>
        </div>
      </div>
    </div>

    <!-- Grid principal -->
    <form @submit.prevent="enviarSMS">
      <div class="content-grid">

        <!-- ══════════════ COLUNA ESQUERDA ══════════════ -->
        <div class="col-left">

          <!-- Informações da mensagem -->
          <div class="card">
            <div class="card-header">
              <div class="card-icon" style="background: linear-gradient(135deg, #667eea, #764ba2);">
                <i class="fas fa-comment-dots"></i>
              </div>
              <h3 class="card-title">Mensagem</h3>
            </div>
            <div class="card-body">

              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-signature"></i> Nome da Campanha <span class="req">*</span>
                </label>
                <input
                  v-model="form.name"
                  class="form-input"
                  placeholder="Ex: Promoção de Natal..."
                  required
                />
              </div>

              <div class="form-group mb-0">
                <label class="form-label">
                  <i class="fas fa-align-left"></i> Mensagem <span class="req">*</span>
                </label>
                <textarea
                  v-model="form.message_body"
                  class="form-input form-textarea"
                  rows="8"
                  placeholder="Digite o texto do SMS aqui..."
                  required
                ></textarea>
              </div>

            </div>
          </div>

          <!-- Botões de ação fixos na base da coluna esquerda -->
          <div class="action-bar">
            <router-link :to="{ name: 'Lista_campanhas' }" class="btn btn-cancel">
              <i class="fas fa-times"></i> Cancelar
            </router-link>
            <button class="btn btn-send" type="submit" :disabled="isSubmitting">
              <i :class="isSubmitting ? 'fas fa-spinner fa-spin' : 'fas fa-paper-plane'"></i>
              {{ labelBotao }}
            </button>
          </div>

        </div>

        <!-- ══════════════ COLUNA DIREITA ══════════════ -->
        <div class="col-right">

          <!-- Tipo de Envio -->
          <div class="card">
            <div class="card-header">
              <div class="card-icon" style="background: linear-gradient(135deg, #f093fb, #f5576c);">
                <i class="fas fa-clock"></i>
              </div>
              <h3 class="card-title">Tipo de Envio</h3>
            </div>
            <div class="card-body">

              <div class="type-cards">
                <label class="type-card" :class="{ 'type-selected': form.type === 'instant' }">
                  <input type="radio" value="instant" v-model="form.type" name="type" />
                  <div class="type-card-icon instant">
                    <i class="fas fa-bolt"></i>
                  </div>
                  <div class="type-card-info">
                    <strong>Instantâneo</strong>
                    <small>Enviar agora</small>
                  </div>
                  <i class="fas fa-check-circle type-check"></i>
                </label>

                <label class="type-card" :class="{ 'type-selected': form.type === 'scheduled' }">
                  <input type="radio" value="scheduled" v-model="form.type" name="type" />
                  <div class="type-card-icon scheduled">
                    <i class="fas fa-calendar-alt"></i>
                  </div>
                  <div class="type-card-info">
                    <strong>Agendado</strong>
                    <small>Escolher data/hora</small>
                  </div>
                  <i class="fas fa-check-circle type-check"></i>
                </label>
              </div>

              <div v-if="form.type === 'scheduled'" class="scheduled-box">
                <label class="form-label">
                  <i class="fas fa-calendar-check"></i> Data e Hora <span class="req">*</span>
                </label>
                <input
                  type="datetime-local"
                  v-model="form.scheduled_at"
                  class="form-input"
                  :min="dataHoraMinima"
                  required
                />
                <small class="form-hint">
                  <i class="fas fa-info-circle"></i>
                  Envio automático na data selecionada
                </small>
              </div>

            </div>
          </div>

          <!-- Público Alvo -->
          <div class="card">
            <div class="card-header">
              <div class="card-icon" style="background: linear-gradient(135deg, #4facfe, #00f2fe);">
                <i class="fas fa-users"></i>
              </div>
              <h3 class="card-title">Público Alvo</h3>
            </div>
            <div class="card-body">

              <div class="target-cards">
                <label class="target-card" :class="{ 'target-selected': form.target_type === 'all' }">
                  <input type="radio" value="all" v-model="form.target_type" name="target" />
                  <div class="target-card-icon" style="background: linear-gradient(135deg, #43e97b, #38f9d7);">
                    <i class="fas fa-globe"></i>
                  </div>
                  <div class="target-card-info">
                    <strong>Todos</strong>
                    <small>Todos os contatos</small>
                  </div>
                  <i class="fas fa-check-circle target-check"></i>
                </label>

                <label class="target-card" :class="{ 'target-selected': form.target_type === 'category' }">
                  <input type="radio" value="category" v-model="form.target_type" name="target" />
                  <div class="target-card-icon" style="background: linear-gradient(135deg, #fa709a, #fee140);">
                    <i class="fas fa-tag"></i>
                  </div>
                  <div class="target-card-info">
                    <strong>Categoria</strong>
                    <small>Filtrar por categoria</small>
                  </div>
                  <i class="fas fa-check-circle target-check"></i>
                </label>

                <label class="target-card" :class="{ 'target-selected': form.target_type === 'selected' }">
                  <input type="radio" value="selected" v-model="form.target_type" name="target" />
                  <div class="target-card-icon" style="background: linear-gradient(135deg, #667eea, #764ba2);">
                    <i class="fas fa-user-check"></i>
                  </div>
                  <div class="target-card-info">
                    <strong>Específicos</strong>
                    <small>Escolher manualmente</small>
                  </div>
                  <i class="fas fa-check-circle target-check"></i>
                </label>
              </div>

              <!-- Selecionar Categoria -->
              <div v-if="form.target_type === 'category'" class="target-section">
                <label class="form-label">
                  <i class="fas fa-tags"></i> Categoria <span class="req">*</span>
                </label>

                <div v-if="isLoadingCategories" class="loading-sm">
                  <div class="spinner-sm"></div>
                  <span>Carregando...</span>
                </div>

                <div v-else-if="categorias.length === 0" class="empty-sm">
                  <i class="fas fa-inbox"></i>
                  <p>Nenhuma categoria disponível</p>
                </div>

                <select v-else v-model="form.target_category_id" class="form-input" required>
                  <option value="">Selecione uma categoria</option>
                  <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                    {{ cat.name }} ({{ cat.clients_count }} contatos)
                  </option>
                </select>
              </div>

              <!-- Selecionar Contatos -->
              <div v-if="form.target_type === 'selected'" class="target-section">
                <label class="form-label">
                  <i class="fas fa-users"></i> Contatos <span class="req">*</span>
                </label>

                <div class="search-wrap">
                  <i class="fas fa-search search-ico"></i>
                  <input
                    v-model="buscaContato"
                    type="text"
                    class="form-input search-input"
                    placeholder="Buscar contatos..."
                    @input="buscarContatos"
                  />
                </div>

                <div v-if="isLoadingContacts" class="loading-sm">
                  <div class="spinner-sm"></div>
                  <span>Carregando...</span>
                </div>

                <div v-else-if="contatosDisponiveis.length === 0" class="empty-sm">
                  <i class="fas fa-inbox"></i>
                  <p>Nenhum contato encontrado</p>
                </div>

                <div v-else class="contacts-list">
                  <label
                    v-for="contato in contatosDisponiveis"
                    :key="contato.id"
                    class="contact-item"
                    :class="{ 'contact-selected': form.client_ids.includes(contato.id) }"
                  >
                    <input type="checkbox" :value="contato.id" v-model="form.client_ids" />
                    <div class="contact-avatar">{{ contato.name.charAt(0).toUpperCase() }}</div>
                    <div class="contact-info">
                      <span class="contact-name">{{ contato.name }}</span>
                      <span class="contact-phone">{{ contato.phone }}</span>
                    </div>
                    <i class="fas fa-check-circle contact-check"></i>
                  </label>
                </div>

                <div v-if="form.client_ids.length > 0" class="selected-badge">
                  <i class="fas fa-check-circle"></i>
                  {{ form.client_ids.length }} selecionado(s)
                </div>
              </div>

            </div>
          </div>

        </div>
        <!-- fim col-right -->

      </div>
    </form>

  </div>
 
   </AppLayout>
</template>

<script>
import axios from 'axios';


import AppLayout from '../../components/AppLayout.vue';

export default {
  name: 'EnviarSMS',
  components: { AppLayout },

  data() {
    return {
      isSubmitting: false,
      isLoadingCategories: false,
      isLoadingContacts: false,

      form: {
        name: '',
        message_body: '',
        type: 'instant',
        scheduled_at: '',
        target_type: 'all',
        target_category_id: '',
        client_ids: []
      },

      categorias: [],
      contatos: [],
      contatosDisponiveis: [],
      buscaContato: ''
    };
  },

  computed: {
    dataHoraMinima() {
      const agora = new Date();
      agora.setMinutes(agora.getMinutes() + 5);
      return agora.toISOString().slice(0, 16);
    },

    labelBotao() {
      if (this.isSubmitting) return this.form.type === 'instant' ? 'Enviando...' : 'Agendando...';
      return this.form.type === 'instant' ? 'Enviar Agora' : 'Agendar Envio';
    }
  },

  methods: {
    async fetchCategorias() {
      this.isLoadingCategories = true;
      const token = localStorage.getItem('auth_token');
      try {
        const res = await axios.get('https://api.devsms.online/api/v1/categories', {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        if (res.data.data?.data) this.categorias = res.data.data.data;
        else if (Array.isArray(res.data.data)) this.categorias = res.data.data;
        else this.categorias = [];
      } catch (e) { console.error(e); }
      finally { this.isLoadingCategories = false; }
    },

    async fetchContatos() {
      this.isLoadingContacts = true;
      const token = localStorage.getItem('auth_token');
      try {
        const res = await axios.get('https://api.devsms.online/api/v1/clients', {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        if (res.data.data?.data) this.contatos = res.data.data.data;
        else if (Array.isArray(res.data.data)) this.contatos = res.data.data;
        else this.contatos = [];
        this.contatosDisponiveis = this.contatos;
      } catch (e) { console.error(e); }
      finally { this.isLoadingContacts = false; }
    },

    buscarContatos() {
      const q = this.buscaContato.toLowerCase();
      this.contatosDisponiveis = q
        ? this.contatos.filter(c => c.name.toLowerCase().includes(q) || c.phone.includes(q))
        : this.contatos;
    },

    async enviarSMS() {
      if (this.isSubmitting) return;
      if (!this.form.name.trim())         { alert('Informe o nome da campanha.'); return; }
      if (!this.form.message_body.trim()) { alert('Escreva a mensagem.'); return; }
      if (this.form.type === 'scheduled' && !this.form.scheduled_at) { alert('Selecione a data e hora.'); return; }
      if (this.form.target_type === 'category' && !this.form.target_category_id) { alert('Selecione uma categoria.'); return; }
      if (this.form.target_type === 'selected' && !this.form.client_ids.length)  { alert('Selecione pelo menos um contato.'); return; }

      this.isSubmitting = true;
      const token = localStorage.getItem('auth_token');

      try {
        const payload = {
          name:         this.form.name,
          message_body: this.form.message_body,
          type:         this.form.type,
          target_type:  this.form.target_type
        };
        if (this.form.type === 'scheduled')       payload.scheduled_at       = this.form.scheduled_at;
        if (this.form.target_type === 'category') payload.target_category_id = this.form.target_category_id;
        if (this.form.target_type === 'selected') payload.client_ids         = this.form.client_ids;

        const createRes = await axios.post('https://api.devsms.online/api/v1/campaigns', payload, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' }
        });

        const campanhaId = createRes.data.data?.id || createRes.data?.id;

        if (this.form.type === 'instant' && campanhaId) {
          await axios.post(`https://api.devsms.online/api/v1/campaigns/${campanhaId}/send`, {}, {
            headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
          });
          alert('✅ SMS enviado com sucesso!');
        } else {
          alert('✅ SMS agendado com sucesso!');
        }

        this.$router.push({ name: 'Lista_campanhas' });
      } catch (error) {
        console.error(error);
        if (error.response?.status === 401) { localStorage.removeItem('auth_token'); this.$router.push('/login'); }
        else alert('Erro: ' + (error.response?.data?.message || 'Tente novamente.'));
      } finally {
        this.isSubmitting = false;
      }
    }
  },

  mounted() {
    this.fetchCategorias();
    this.fetchContatos();
  }
};
</script>

<style scoped>
:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --gray-50:  #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-400: #9ca3af;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-900: #111827;
}

/* ── Página ── */
.send-sms-page {
  padding: 1.75rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* ── Header ── */
.page-header {
  display: flex;
  align-items: center;
  background: white;
  padding: 1.25rem 1.75rem;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,.08);
  margin-bottom: 1.5rem;
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
  box-shadow: 0 4px 12px rgba(99,102,241,.35);
  flex-shrink: 0;
}

.page-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

.page-subtitle {
  font-size: 0.813rem;
  color: var(--gray-600);
  margin: 0.2rem 0 0;
}

/* ── Grid 2 colunas ── */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 1.5rem;
  align-items: start;
}

/* ── Colunas ── */
.col-left,
.col-right {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ── Cards ── */
.card {
  background: white;
  border-radius: 14px;
  box-shadow: 0 1px 4px rgba(0,0,0,.08);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.125rem 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  background: var(--gray-50);
}

.card-icon {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  color: white;
  flex-shrink: 0;
}

.card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

.card-body { padding: 1.5rem; }

/* ── Form ── */
.form-group { margin-bottom: 1.125rem; }
.mb-0 { margin-bottom: 0 !important; }

.form-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.813rem;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
}

.req { color: #ef4444; }

.form-input {
  width: 100%;
  padding: 0.7rem 1rem;
  border: 2px solid var(--gray-200);
  border-radius: 9px;
  font-size: 0.9375rem;
  color: var(--gray-900);
  background: white;
  font-family: inherit;
  transition: border-color .2s, box-shadow .2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99,102,241,.12);
}

.form-textarea {
  resize: vertical;
  min-height: 180px;
  line-height: 1.6;
}

.form-hint {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  color: var(--gray-600);
  margin-top: 0.4rem;
}

/* ── Tipo de envio ── */
.type-cards {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.type-card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  border: 2px solid var(--gray-200);
  border-radius: 10px;
  cursor: pointer;
  transition: all .2s;
  position: relative;
  background: white;
}

.type-card input[type="radio"] { position: absolute; opacity: 0; pointer-events: none; }
.type-card:hover { border-color: #6366f1; background: #f5f5ff; }
.type-selected { border-color: #6366f1 !important; background: rgba(99,102,241,.07) !important; }

.type-card-icon {
  width: 38px;
  height: 38px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  flex-shrink: 0;
}

.type-card-icon.instant   { background: linear-gradient(135deg, #f59e0b, #d97706); }
.type-card-icon.scheduled { background: linear-gradient(135deg, #6366f1, #4f46e5); }

.type-card-info { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
.type-card-info strong { font-size: 0.9rem; font-weight: 700; color: var(--gray-900); }
.type-card-info small  { font-size: 0.75rem; color: var(--gray-600); }

.type-check { color: #6366f1; font-size: 1rem; opacity: 0; transition: opacity .2s; }
.type-selected .type-check { opacity: 1; }

.scheduled-box {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(99,102,241,.05);
  border: 2px solid #6366f1;
  border-radius: 9px;
  animation: slideDown .2s ease;
}

/* ── Público alvo ── */
.target-cards {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.target-card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  border: 2px solid var(--gray-200);
  border-radius: 10px;
  cursor: pointer;
  transition: all .2s;
  position: relative;
  background: white;
}

.target-card input[type="radio"] { position: absolute; opacity: 0; pointer-events: none; }
.target-card:hover { border-color: #6366f1; background: #f5f5ff; }
.target-selected { border-color: #6366f1 !important; background: rgba(99,102,241,.07) !important; }

.target-card-icon {
  width: 38px;
  height: 38px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  flex-shrink: 0;
}

.target-card-info { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; }
.target-card-info strong { font-size: 0.9rem; font-weight: 700; color: var(--gray-900); }
.target-card-info small  { font-size: 0.75rem; color: var(--gray-600); }

.target-check { color: #6366f1; font-size: 1rem; opacity: 0; transition: opacity .2s; }
.target-selected .target-check { opacity: 1; }

.target-section {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(99,102,241,.05);
  border: 2px solid #6366f1;
  border-radius: 9px;
  animation: slideDown .2s ease;
}

/* ── Busca ── */
.search-wrap { position: relative; margin-bottom: 0.75rem; }
.search-ico {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
  pointer-events: none;
  font-size: 0.875rem;
}
.search-input { padding-left: 2.5rem !important; }

/* ── Lista de contatos ── */
.contacts-list {
  max-height: 220px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  scrollbar-width: thin;
  scrollbar-color: var(--gray-300) transparent;
}
.contacts-list::-webkit-scrollbar { width: 4px; }
.contacts-list::-webkit-scrollbar-thumb { background: var(--gray-300); border-radius: 4px; }

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.875rem;
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  cursor: pointer;
  transition: all .15s;
  position: relative;
  background: white;
}
.contact-item:hover { border-color: #6366f1; background: #f5f5ff; }
.contact-selected { border-color: #6366f1 !important; background: rgba(99,102,241,.07) !important; }
.contact-item input[type="checkbox"] { width: 15px; height: 15px; cursor: pointer; flex-shrink: 0; }

.contact-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.contact-info { flex: 1; display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; }
.contact-name  { font-size: 0.85rem; font-weight: 600; color: var(--gray-900); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.contact-phone { font-size: 0.75rem; color: var(--gray-600); }

.contact-check { color: #6366f1; font-size: 0.875rem; opacity: 0; transition: opacity .15s; flex-shrink: 0; }
.contact-selected .contact-check { opacity: 1; }

.selected-badge {
  margin-top: 0.75rem;
  padding: 0.5rem 0.875rem;
  background: rgba(99,102,241,.12);
  border-radius: 8px;
  text-align: center;
  color: #4f46e5;
  font-weight: 700;
  font-size: 0.813rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
}

/* ── Loading / Empty ── */
.loading-sm, .empty-sm { padding: 1.25rem; text-align: center; color: var(--gray-600); font-size: 0.875rem; }
.spinner-sm { width: 26px; height: 26px; border: 3px solid var(--gray-200); border-top-color: #6366f1; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 0.5rem; }
.empty-sm i { font-size: 1.75rem; color: var(--gray-400); display: block; margin-bottom: 0.4rem; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Barra de ações ── */
.action-bar {
  display: flex;
  gap: 0.875rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  border-radius: 9px;
  font-weight: 700;
  font-size: 0.938rem;
  border: none;
  cursor: pointer;
  transition: all .2s;
  text-decoration: none;
  white-space: nowrap;
}

.btn-cancel {
  background: white;
  color: var(--gray-700);
  border: 2px solid var(--gray-300);
  flex: 0 0 auto;
}
.btn-cancel:hover { background: var(--gray-100); }

.btn-send {
  flex: 1;
  justify-content: center;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  box-shadow: 0 3px 10px rgba(99,102,241,.35);
}
.btn-send:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 5px 18px rgba(99,102,241,.5); }
.btn-send:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Animações ── */
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.fade-in { animation: fadeIn .4s ease; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .content-grid { grid-template-columns: 1fr; }
  .action-bar { flex-direction: column-reverse; }
  .btn-cancel, .btn-send { width: 100%; justify-content: center; }
}

@media (max-width: 480px) {
  .send-sms-page { padding: 1rem; }
}
</style>