<template>
  <AppLayout>

  <div class="blacklist-page fade-in">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <router-link :to="{ name: 'Criar_black' }" class="btn-back">
          <i class="fas fa-arrow-left"></i>
        </router-link>
        <div class="header-text">
          <h1 class="page-title">
            <i class="fas fa-ban"></i>
            {{ modoEdicao ? 'Editar Número Bloqueado' : 'Adicionar à Blacklist' }}
          </h1>
          <p class="page-subtitle">
            Bloqueie números que não devem receber mensagens
          </p>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <!-- COLUNA PRINCIPAL -->
      <div class="main-column">
        <form @submit.prevent="salvarBlacklist">
          
          <!-- Seleção de Contato ou Número Manual -->
          <div class="card">
            <div class="card-header">
              <div class="card-icon" style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);">
                <i class="fas fa-phone-slash"></i>
              </div>
              <h3 class="card-title">Selecione um Contato ou Digite o Número</h3>
            </div>

            <div class="card-body">
              <!-- Abas de Seleção -->
              <div class="tabs">
                <button 
                  type="button"
                  class="tab-button"
                  :class="{ active: tipoEntrada === 'contato' }"
                  @click="tipoEntrada = 'contato'"
                >
                  <i class="fas fa-user"></i> Selecionar Contato
                </button>
                <button 
                  type="button"
                  class="tab-button"
                  :class="{ active: tipoEntrada === 'manual' }"
                  @click="tipoEntrada = 'manual'"
                >
                  <i class="fas fa-keyboard"></i> Digitar Número
                </button>
              </div>

              <!-- Aba Selecionar Contato -->
              <div v-if="tipoEntrada === 'contato'" class="tab-content">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-search"></i> Buscar Contato
                  </label>
                  <div class="search-input-wrapper">
                    <i class="fas fa-search search-icon"></i>
                    <input 
                      v-model="buscarContato"
                      type="text"
                      class="form-input search-input"
                      placeholder="Buscar por nome, telefone ou email..."
                    />
                    <button 
                      v-if="buscarContato"
                      type="button"
                      class="search-clear"
                      @click="buscarContato = ''"
                      title="Limpar busca"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                  <small class="form-hint">
                    <i class="fas fa-info-circle"></i>
                    Digite o nome, telefone ou email do contato para buscar
                  </small>
                </div>

                <div v-if="carregandoContatos" class="loading-spinner">
                  <div class="spinner-small"></div>
                  <p>Buscando contatos...</p>
                </div>

                <div v-else-if="contatosBuscados.length === 0" class="empty-search">
                  <i class="fas fa-inbox"></i>
                  <p>{{ buscarContato ? 'Nenhum contato encontrado' : 'Digite para buscar contatos' }}</p>
                </div>

                <div v-else class="contacts-list">
                  <div 
                    v-for="contato in contatosBuscados" 
                    :key="contato.id"
                    class="contact-select-item"
                    @click="selecionarContato(contato)"
                    :class="{ selected: form.phone === contato.phone }"
                  >
                    <div class="contact-avatar" :style="{ background: contato.category?.color || '#3b82f6' }">
                      {{ getInitials(contato.name) }}
                    </div>
                    <div class="contact-info">
                      <h4>{{ contato.name }}</h4>
                      <p class="contact-phone">
                        <i class="fas fa-phone"></i> {{ formatPhone(contato.phone) }}
                      </p>
                      <p v-if="contato.email" class="contact-email">
                        <i class="fas fa-envelope"></i> {{ contato.email }}
                      </p>
                    </div>
                    <div class="contact-category">
                      <span v-if="contato.category" class="category-badge">
                        {{ contato.category.name }}
                      </span>
                      <span v-else class="no-category">Sem categoria</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Aba Digitar Número -->
              <div v-if="tipoEntrada === 'manual'" class="tab-content">
                <div class="form-group">
                  <label class="form-label required">
                    <i class="fas fa-phone"></i> Número de Telefone
                  </label>
                  <input 
                    v-model="form.phone" 
                    class="form-input" 
                    placeholder="Ex: 923456789"
                    maxlength="9"
                    @input="formatarTelefone"
                    required 
                  />
                  <small class="form-hint">
                    <i class="fas fa-info-circle"></i>
                    Digite apenas os 9 dígitos do número (sem prefixo +244)
                  </small>
                  <div v-if="form.phone && form.phone.length === 9" class="phone-preview">
                    <i class="fas fa-check-circle"></i>
                    Formato completo: +244 {{ form.phone }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Informações do Bloqueio -->
          <div class="card">
            <div class="card-header">
              <div class="card-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
                <i class="fas fa-exclamation-triangle"></i>
              </div>
              <h3 class="card-title">Informações do Bloqueio</h3>
            </div>

            <div class="card-body">
              <div class="form-group">
                <label class="form-label required">
                  <i class="fas fa-exclamation-triangle"></i> Motivo do Bloqueio
                </label>
                <select v-model="form.reason" class="form-input" required>
                  <option value="">Selecione um motivo</option>
                  <option value="spam">Spam / Reclamação de Spam</option>
                  <option value="opt_out">Solicitação de Cancelamento (Opt-out)</option>
                  <option value="invalid">Número Inválido</option>
                  <option value="complaint">Reclamação do Cliente</option>
                  <option value="fraud">Suspeita de Fraude</option>
                  <option value="legal">Questões Legais</option>
                  <option value="other">Outro Motivo</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-sticky-note"></i> Observações Adicionais
                </label>
                <textarea 
                  v-model="form.notes" 
                  class="form-input" 
                  rows="4"
                  placeholder="Adicione informações adicionais sobre este bloqueio..."
                ></textarea>
                <small class="form-hint">
                  Detalhes extras sobre o motivo do bloqueio (opcional)
                </small>
              </div>
            </div>
          </div>

          <!-- Aviso Importante -->
          <div class="card alert-card">
            <div class="card-body">
              <div class="alert-content">
                <div class="alert-icon">
                  <i class="fas fa-exclamation-circle"></i>
                </div>
                <div class="alert-text">
                  <h4>Atenção!</h4>
                  <p>Ao adicionar este número à blacklist:</p>
                  <ul>
                    <li>O número <strong>não receberá mais SMS</strong> de nenhuma campanha</li>
                    <li>Tentativas de envio para este número serão <strong>bloqueadas automaticamente</strong></li>
                    <li>Esta ação é <strong>reversível</strong> - você pode remover o número da blacklist posteriormente</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Botões de Ação -->
          <div class="form-actions">
            <router-link :to="{ name: 'Criar_black' }" class="btn btn-cancel">
              <i class="fas fa-times"></i> Cancelar
            </router-link>
            <button class="btn btn-danger" type="submit" :disabled="isSubmitting || !form.phone || !form.reason">
              <i class="fas fa-spinner fa-spin" v-if="isSubmitting"></i>
              <i class="fas fa-ban" v-else></i>
              {{ isSubmitting ? 'Bloqueando...' : 'Adicionar à Blacklist' }}
            </button>
          </div>
        </form>
      </div>

      <!-- COLUNA LATERAL -->
      <div class="sidebar-column">
        <!-- Resumo -->
        <div class="card sticky-card">
          <div class="card-header">
            <div class="card-icon" style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);">
              <i class="fas fa-clipboard-list"></i>
            </div>
            <h3 class="card-title">Resumo do Bloqueio</h3>
          </div>

          <div class="card-body">
            <div class="summary-list">
              <div class="summary-item">
                <i class="fas fa-phone"></i>
                <div>
                  <span class="summary-label">Número</span>
                  <span class="summary-value">{{ form.phone || 'Não informado' }}</span>
                </div>
              </div>

              <div class="summary-item">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                  <span class="summary-label">Motivo</span>
                  <span class="summary-value">{{ getMotivoLabel() }}</span>
                </div>
              </div>

              <div class="summary-item">
                <i class="fas fa-calendar"></i>
                <div>
                  <span class="summary-label">Data do Bloqueio</span>
                  <span class="summary-value">{{ dataAtual }}</span>
                </div>
              </div>
            </div>

            <div v-if="form.notes" class="summary-notes">
              <strong><i class="fas fa-sticky-note"></i> Observações:</strong>
              <p>{{ form.notes }}</p>
            </div>
          </div>
        </div>

        <!-- Motivos Comuns -->
        <div class="card">
          <div class="card-header">
            <div class="card-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
              <i class="fas fa-question-circle"></i>
            </div>
            <h3 class="card-title">Motivos Comuns</h3>
          </div>

          <div class="card-body">
            <div class="reasons-list">
              <div class="reason-item">
                <i class="fas fa-comment-slash"></i>
                <div>
                  <strong>Spam</strong>
                  <p>O destinatário reclamou de spam ou mensagens indesejadas</p>
                </div>
              </div>

              <div class="reason-item">
                <i class="fas fa-user-times"></i>
                <div>
                  <strong>Opt-out</strong>
                  <p>O destinatário solicitou cancelamento do recebimento de SMS</p>
                </div>
              </div>

              <div class="reason-item">
                <i class="fas fa-phone-slash"></i>
                <div>
                  <strong>Número Inválido</strong>
                  <p>Número não existe ou está incorreto</p>
                </div>
              </div>

              <div class="reason-item">
                <i class="fas fa-angry"></i>
                <div>
                  <strong>Reclamação</strong>
                  <p>Cliente apresentou reclamação formal</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dicas -->
        <div class="card">
          <div class="card-header">
            <div class="card-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
              <i class="fas fa-lightbulb"></i>
            </div>
            <h3 class="card-title">Dicas</h3>
          </div>

          <div class="card-body">
            <div class="tips-list">
              <div class="tip-item">
                <i class="fas fa-check-circle"></i>
                <p>Verifique se o número está correto antes de bloquear</p>
              </div>
              <div class="tip-item">
                <i class="fas fa-check-circle"></i>
                <p>Sempre documente o motivo do bloqueio</p>
              </div>
              <div class="tip-item">
                <i class="fas fa-check-circle"></i>
                <p>Revise a blacklist periodicamente</p>
              </div>
              <div class="tip-item">
                <i class="fas fa-check-circle"></i>
                <p>Respeite as solicitações de opt-out dos clientes</p>
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
  name: 'CriarBlacklist',
  
  components: {
    AppLayout
  },

  data() {
    return {
      isSubmitting: false,
      modoEdicao: false,
      
      tipoEntrada: 'contato',
      buscarContato: '',
      contatosBuscados: [],
      carregandoContatos: false,
      searchTimer: null,
      
      form: {
        phone: '',
        reason: '',
        notes: ''
      }
    };
  },

  computed: {
    dataAtual() {
      const hoje = new Date();
      return hoje.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    }
  },

  watch: {
    buscarContato(newVal) {
      clearTimeout(this.searchTimer);
      if (newVal.trim()) {
        this.searchTimer = setTimeout(() => {
          this.buscarContatos();
        }, 500);
      } else {
        this.contatosBuscados = [];
      }
    }
  },

  methods: {
    async buscarContatos() {
      if (!this.buscarContato.trim()) {
        this.contatosBuscados = [];
        return;
      }

      this.carregandoContatos = true;
      const token = localStorage.getItem('auth_token');

      try {
        const response = await axios.get('https://api.devsms.online/api/v1/clients', {
          params: {
            search: this.buscarContato.trim(),
            per_page: 20
          },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        this.contatosBuscados = response.data.data?.data || [];
      } catch (error) {
        console.error('Erro ao buscar contatos:', error);
        this.contatosBuscados = [];
      } finally {
        this.carregandoContatos = false;
      }
    },

    selecionarContato(contato) {
      this.form.phone = contato.phone;
      this.buscarContato = '';
      this.contatosBuscados = [];
    },

    async salvarBlacklist() {
      if (this.isSubmitting) return;

      if (!this.form.phone.trim()) {
        alert('Por favor, informe o número de telefone.');
        return;
      }

      if (this.form.phone.length !== 9) {
        alert('O número de telefone deve ter exatamente 9 dígitos.');
        return;
      }

      if (!this.form.reason) {
        alert('Por favor, selecione o motivo do bloqueio.');
        return;
      }

      this.isSubmitting = true;
      const token = localStorage.getItem('auth_token');

      try {
        const payload = {
          phone: this.form.phone.replace(/\D/g, ''),
          reason: this.form.reason,
          notes: this.form.notes.trim() || null
        };

        console.log('📤 Enviando payload:', payload);

        const response = await axios.post(
          'https://api.devsms.online/api/v1/blacklist',
          payload,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('✅ Resposta:', response.data);

        alert('✅ Número adicionado à blacklist com sucesso!');
        this.$router.push({ name: 'Blacklist' });

      } catch (error) {
        console.error('❌ Erro ao adicionar à blacklist:', error);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          this.$router.push('/login');
        } else if (error.response?.data?.message) {
          alert('Erro: ' + error.response.data.message);
        } else if (error.response?.data?.errors) {
          const errors = Object.values(error.response.data.errors).flat();
          alert('Erros de validação:\n' + errors.join('\n'));
        } else {
          alert('Erro ao adicionar número à blacklist. Por favor, tente novamente.');
        }
      } finally {
        this.isSubmitting = false;
      }
    },

    formatarTelefone() {
      let valor = this.form.phone.replace(/\D/g, '');
      if (valor.length > 9) {
        valor = valor.substring(0, 9);
      }
      this.form.phone = valor;
    },

    getMotivoLabel() {
      const motivos = {
        'spam': 'Spam / Reclamação de Spam',
        'opt_out': 'Solicitação de Cancelamento',
        'invalid': 'Número Inválido',
        'complaint': 'Reclamação do Cliente',
        'fraud': 'Suspeita de Fraude',
        'legal': 'Questões Legais',
        'other': 'Outro Motivo'
      };
      return motivos[this.form.reason] || 'Não selecionado';
    },

    getInitials(name) {
      if (!name) return '??';
      const parts = name.split(' ');
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      return name.substring(0, 2).toUpperCase();
    },

    formatPhone(phone) {
      if (!phone) return '-';
      return phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
    }
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

.blacklist-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header */
.page-header {
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-back {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--gray-100);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gray-700);
  transition: all 0.3s;
  text-decoration: none;
}

.btn-back:hover {
  background: var(--danger);
  color: white;
  transform: translateX(-2px);
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.page-subtitle {
  color: var(--gray-600);
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
}

/* Grid Layout */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
}

/* Cards */
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  overflow: hidden;
}

.alert-card {
  border: 2px solid #fef3c7;
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--gray-200);
  background: var(--gray-50);
}

.card-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: white;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-900);
  margin: 0;
}

.card-body {
  padding: 1.5rem;
}

/* Abas */
.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid var(--gray-200);
}

.tab-button {
  padding: 0.75rem 1.25rem;
  border: none;
  background: transparent;
  color: var(--gray-600);
  cursor: pointer;
  font-weight: 500;
  border-bottom: 3px solid transparent;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: -2px;
}

.tab-button:hover {
  color: var(--primary);
}

.tab-button.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Form */
.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-label.required::after {
  content: '*';
  color: var(--danger);
  margin-left: 0.25rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  font-size: 0.9375rem;
  transition: all 0.3s;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-hint {
  color: var(--gray-600);
  font-size: 0.75rem;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.875rem;
  color: var(--gray-400);
  pointer-events: none;
}

.search-input {
  padding-left: 2.5rem !important;
  padding-right: 2.5rem !important;
}

.search-clear {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: var(--gray-400);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.search-clear:hover {
  color: var(--gray-700);
}

.phone-preview {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #d1fae5;
  color: #065f46;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Contatos */
.contacts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 400px;
  overflow-y: auto;
}

.contact-select-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--gray-50);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.contact-select-item:hover {
  background: var(--gray-100);
  border-color: var(--primary);
}

.contact-select-item.selected {
  background: rgba(99, 102, 241, 0.1);
  border-color: var(--primary);
}

.contact-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  flex-shrink: 0;
}

.contact-info {
  flex: 1;
}

.contact-info h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.9375rem;
  color: var(--gray-900);
  font-weight: 600;
}

.contact-phone,
.contact-email {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--gray-600);
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.contact-category {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: right;
}

.category-badge,
.no-category {
  font-size: 0.8125rem;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
}

.category-badge {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary);
}

.no-category {
  background: var(--gray-200);
  color: var(--gray-600);
}

.loading-spinner {
  text-align: center;
  padding: 2rem;
}

.spinner-small {
  width: 32px;
  height: 32px;
  border: 3px solid var(--gray-200);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-search {
  text-align: center;
  padding: 3rem 2rem;
}

.empty-search i {
  font-size: 2rem;
  color: var(--gray-300);
  margin-bottom: 1rem;
  display: block;
}

.empty-search p {
  color: var(--gray-600);
  margin: 0;
}

/* Alert */
.alert-content {
  display: flex;
  gap: 1rem;
}

.alert-icon {
  width: 50px;
  height: 50px;
  background: #fbbf24;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.alert-text h4 {
  font-size: 1.125rem;
  color: #92400e;
  margin: 0 0 0.5rem 0;
}

.alert-text p {
  color: #78350f;
  margin: 0 0 0.75rem 0;
}

.alert-text ul {
  margin: 0;
  padding-left: 1.25rem;
  color: #78350f;
}

.alert-text li {
  margin-bottom: 0.5rem;
}

/* Sidebar */
.sticky-card {
  position: sticky;
  top: 2rem;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.summary-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--gray-50);
  border-radius: 8px;
}

.summary-item i {
  color: var(--primary);
  margin-top: 0.25rem;
}

.summary-item > div {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.summary-label {
  font-size: 0.75rem;
  color: var(--gray-600);
  text-transform: uppercase;
  font-weight: 500;
}

.summary-value {
  font-size: 0.9375rem;
  color: var(--gray-900);
  font-weight: 600;
}

.summary-notes {
  padding: 1rem;
  background: var(--gray-50);
  border-radius: 8px;
  border-left: 3px solid var(--primary);
}

.summary-notes strong {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gray-700);
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.summary-notes p {
  color: var(--gray-600);
  font-size: 0.875rem;
  margin: 0;
  line-height: 1.5;
}

/* Motivos */
.reasons-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reason-item {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--gray-50);
  border-radius: 8px;
}

.reason-item i {
  font-size: 1.25rem;
  color: var(--warning);
  margin-top: 0.25rem;
}

.reason-item strong {
  display: block;
  color: var(--gray-900);
  margin-bottom: 0.25rem;
  font-size: 0.9375rem;
}

.reason-item p {
  color: var(--gray-600);
  font-size: 0.8125rem;
  margin: 0;
  line-height: 1.4;
}

/* Dicas */
.tips-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.tip-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.tip-item i {
  color: var(--success);
  margin-top: 0.25rem;
}

.tip-item p {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin: 0;
  line-height: 1.5;
}

/* Botões */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

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
  font-size: 0.9375rem;
  text-decoration: none;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  background: white;
  color: var(--gray-700);
  border: 2px solid var(--gray-300);
}

.btn-cancel:hover {
  background: var(--gray-50);
  border-color: var(--gray-400);
}

.btn-danger {
  background: var(--danger);
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* Animations */
.fade-in {
  animation: fadeIn 0.5s ease-in;
}

/* Responsive */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .sticky-card {
    position: static;
  }
}

@media (max-width: 768px) {
  .blacklist-page {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .tabs {
    flex-direction: column;
    border-bottom: none;
  }

  .tab-button {
    border-bottom: none;
    border-left: 3px solid transparent;
    padding: 0.75rem 1rem;
    margin-bottom: 0;
  }

  .tab-button.active {
    border-left-color: var(--primary);
    border-bottom: none;
  }
}
</style>