<template>

    <navegacao/>

  <div class="enviar-sms-container fade-in">

    <!-- Page Header -->
    <div class="page-header">
      <router-link to="/dashboard" class="back-button">
        <i class="fas fa-arrow-left"></i>
      </router-link>
      <div>

      </div>
    </div>

    <!-- Modal de Sucesso -->
    <transition name="modal">
      <div v-if="mostrarSucesso" class="modal-overlay" @click="fecharModal">
        <div class="modal-success" @click.stop>
          <div class="success-icon">
            <i class="fas fa-check-circle"></i>
          </div>
          <h2>SMS Enviado com Sucesso!</h2>
          <p>{{ totalDestinatarios }} mensagens foram enviadas</p>
          <button @click="fecharModal" class="btn btn-primary">OK</button>
        </div>
      </div>
    </transition>

    <div class="content-grid">

      <!-- FORMULÁRIO -->
      <div class="card main-card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="fas fa-paper-plane"></i>
            Nova Mensagem
          </h3>
        </div>

        <div class="card-body">
          <form @submit.prevent="submitForm">

            <!-- TIPO DESTINATÁRIO -->
            <div class="form-group">
              <label class="form-label">
                Para quem deseja enviar? <span class="required">*</span>
              </label>

              <div class="tipos-grid">
                <div
                  v-for="opt in tipos"
                  :key="opt.tipo"
                  class="tipo-card"
                  :class="{ active: tipoDestinatario === opt.tipo }"
                  @click="selecionarTipo(opt.tipo)"
                >
                  <div class="tipo-icon" :style="{ background: opt.bgColor, color: opt.color }">
                    <i :class="opt.icon"></i>
                  </div>
                  <div class="tipo-label">{{ opt.label }}</div>
                  <small class="tipo-desc">{{ opt.desc }}</small>
                  <div v-if="tipoDestinatario === opt.tipo" class="tipo-check" :style="{ background: opt.color }">
                    <i class="fas fa-check"></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- CONTATOS -->
            <div v-if="tipoDestinatario === 'contatos'" class="form-group">
              <div class="label-row">
                <label class="form-label">
                  Selecionar Contatos <span class="required">*</span>
                </label>
                <button 
                  type="button" 
                  class="btn-link"
                  @click="selecionarTodosContatos"
                >
                  {{ contatosSelecionados.length === contatos.length ? 'Desmarcar' : 'Selecionar' }} Todos
                </button>
              </div>

              <input
                type="text"
                class="form-control search-input"
                placeholder="🔍 Buscar contato..."
                v-model="searchContato"
              />

              <div class="contatos-list">
                <div
                  v-for="c in contatosFiltrados"
                  :key="c.id"
                  class="contato-item"
                  :class="{ active: contatosSelecionados.includes(c.id) }"
                  @click="toggleContato(c.id)"
                >
                  <div class="contato-avatar">
                    {{ c.nome.charAt(0) }}
                  </div>
                  <div class="contato-info">
                    <div class="contato-nome">{{ c.nome }}</div>
                    <div class="contato-telefone">{{ c.telefone }}</div>
                  </div>
                  <i v-if="contatosSelecionados.includes(c.id)" class="fas fa-check-circle check-icon"></i>
                </div>
                <div v-if="contatosFiltrados.length === 0" class="empty-state">
                  Nenhum contato encontrado
                </div>
              </div>
            </div>

            <!-- GRUPOS -->
            <div v-if="tipoDestinatario === 'grupos'" class="form-group">
              <label class="form-label">
                Selecionar Grupos <span class="required">*</span>
              </label>

              <div class="grupos-grid">
                <div
                  v-for="g in grupos"
                  :key="g.id"
                  class="grupo-card"
                  :class="{ active: gruposSelecionados.some(gr => gr.id === g.id) }"
                  @click="toggleGrupo(g)"
                >
                  <div class="grupo-icon" :style="{ background: g.bgColor, color: g.color }">
                    <i class="fas fa-users"></i>
                  </div>
                  <div class="grupo-nome">{{ g.nome }}</div>
                  <small class="grupo-membros">{{ g.membros }} membros</small>
                  <div 
                    v-if="gruposSelecionados.some(gr => gr.id === g.id)" 
                    class="grupo-check"
                    :style="{ background: g.color }"
                  >
                    <i class="fas fa-check"></i>
                  </div>
                </div>
              </div>
            </div>

            <!-- TODOS -->
            <div v-if="tipoDestinatario === 'todos'" class="alert alert-warning">
              <i class="fas fa-exclamation-triangle"></i>
              <div>
                <strong>Atenção!</strong> SMS será enviado para TODOS os {{ totalTodos }} contatos cadastrados.
              </div>
            </div>

            <!-- MENSAGEM -->
            <div class="form-group">
              <label class="form-label">
                Mensagem <span class="required">*</span>
              </label>
              <textarea
                class="form-control textarea"
                rows="6"
                maxlength="480"
                placeholder="Digite sua mensagem aqui..."
                v-model="mensagem"
              ></textarea>

              <div class="mensagem-info">
                <div class="caracteres-info">
                  <div class="caracteres-count">
                    <span :class="{ warning: mensagem.length > 160 }">{{ mensagem.length }}</span> / 480 caracteres
                  </div>
                  <div class="progress-bar">
                    <div 
                      class="progress-fill" 
                      :style="{ 
                        width: progressoMensagem + '%',
                        background: mensagem.length > 160 ? '#F59E0B' : '#10B981'
                      }"
                    ></div>
                  </div>
                  <small class="text-muted">{{ caracteresRestantes }} caracteres até próximo SMS</small>
                </div>
                <div class="sms-count">
                  <i class="fas fa-sparkles"></i>
                  {{ smsPorDest }} SMS por destinatário
                </div>
              </div>
            </div>

            <!-- AGENDAR -->
            <div class="form-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="agendar" />
                <i class="fas fa-clock"></i>
                <span>Agendar envio</span>
              </label>

              <transition name="slide">
                <div v-if="agendar" class="agendamento-grid">
                  <div>
                    <label class="label-small">Data</label>
                    <input 
                      type="date" 
                      class="form-control" 
                      v-model="dataAgendamento"
                      :min="dataMinima"
                    />
                  </div>
                  <div>
                    <label class="label-small">Hora</label>
                    <input 
                      type="time" 
                      class="form-control" 
                      v-model="horaAgendamento" 
                    />
                  </div>
                </div>
              </transition>
            </div>

            <!-- BOTÕES -->
            <div class="form-actions">
              <router-link to="/dashboard" class="btn btn-outline">
                <i class="fas fa-times"></i>
                Cancelar
              </router-link>

              <button 
                type="submit" 
                class="btn btn-primary"
                :disabled="enviando"
              >
                <i v-if="!enviando" class="fas fa-paper-plane"></i>
                <div v-else class="spinner"></div>
                {{ enviando ? 'Enviando...' : (agendar ? 'Agendar Envio' : 'Enviar Agora') }}
              </button>
            </div>

          </form>
        </div>
      </div>

      <!-- SIDEBAR -->
      <div class="sidebar">

        <!-- CRÉDITOS -->
        <div class="card creditos-card">
          <div class="creditos-content">
            <small>Créditos Disponíveis</small>
            <h1 class="creditos-valor">{{ creditosDisponiveis.toLocaleString() }}</h1>
            <div class="creditos-progress">
              <div 
                class="creditos-progress-fill"
                :style="{ width: (creditosDisponiveis / 10000 * 100) + '%' }"
              ></div>
            </div>
            <button class="btn btn-white">
              <i class="fas fa-plus"></i>
              Comprar Créditos
            </button>
          </div>
        </div>

        <!-- RESUMO -->
        <div class="card resumo-card">
          <h3 class="resumo-title">Resumo do Envio</h3>
          
          <div class="resumo-item">
            <div class="resumo-label">
              <i class="fas fa-users"></i>
              Destinatários
            </div>
            <div class="resumo-valor">{{ totalDestinatarios }}</div>
          </div>

          <div class="resumo-item">
            <div class="resumo-label">
              <i class="fas fa-sparkles"></i>
              SMS por destinatário
            </div>
            <div class="resumo-valor">{{ smsPorDest }}</div>
          </div>

          <div class="resumo-divider"></div>

          <div class="resumo-item resumo-total">
            <div class="resumo-label">Total de Créditos</div>
            <div class="resumo-valor-total">{{ totalCreditos }}</div>
          </div>

          <div v-if="totalCreditos > creditosDisponiveis" class="alert alert-danger">
            <i class="fas fa-exclamation-circle"></i>
            Créditos insuficientes
          </div>
        </div>

        <!-- PREVIEW -->
        <div class="card preview-card">
          <h3 class="preview-title">Preview da Mensagem</h3>
          <div class="preview-phone">
            <div class="preview-screen">
              <div class="preview-bubble">
                {{ mensagem || 'Digite uma mensagem para visualizar...' }}
              </div>
              <div class="preview-time">
                {{ horaAtual }}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script >

    import navegacao from "../components/navegacao.vue"

export default {
  name: "EnviarSMS",

  components:{
    navegacao,
  },

  data() {
    return {
      tipoDestinatario: "contatos",
      mensagem: "",
      agendar: false,
      dataAgendamento: "",
      horaAgendamento: "",
      searchContato: "",
      enviando: false,
      mostrarSucesso: false,
 

      creditosDisponiveis: 5420,
      totalTodos: 1247,

      contatosSelecionados: [],
      gruposSelecionados: [],

      contatos: [
        { id: 1, nome: "João Silva", telefone: "+244 923 456 789" },
        { id: 2, nome: "Maria Santos", telefone: "+244 924 567 890" },
        { id: 3, nome: "Pedro Costa", telefone: "+244 925 678 901" },
        { id: 4, nome: "Ana Ferreira", telefone: "+244 926 789 012" },
        { id: 5, nome: "Carlos Mendes", telefone: "+244 927 890 123" },
        { id: 6, nome: "Beatriz Lima", telefone: "+244 928 901 234" },
      ],

      grupos: [
        { id: 1, nome: "Vendedores", membros: 150, color: "#3B82F6", bgColor: "rgba(59, 130, 246, 0.1)" },
        { id: 2, nome: "RH", membros: 87, color: "#10B981", bgColor: "rgba(16, 185, 129, 0.1)" },
        { id: 3, nome: "Marketing", membros: 45, color: "#F59E0B", bgColor: "rgba(245, 158, 11, 0.1)" },
        { id: 4, nome: "TI", membros: 32, color: "#8B5CF6", bgColor: "rgba(139, 92, 246, 0.1)" },
      ],

      tipos: [
        { 
          tipo: "contatos", 
          label: "Contatos", 
          icon: "fas fa-user-check", 
          desc: "Selecione contatos específicos",
          color: "#3B82F6",
          bgColor: "rgba(59, 130, 246, 0.1)"
        },
        { 
          tipo: "grupos", 
          label: "Grupos", 
          icon: "fas fa-users", 
          desc: "Enviar para grupos inteiros",
          color: "#10B981",
          bgColor: "rgba(16, 185, 129, 0.1)"
        },
        { 
          tipo: "todos", 
          label: "Todos", 
          icon: "fas fa-globe", 
          desc: "Broadcast para todos",
          color: "#F59E0B",
          bgColor: "rgba(245, 158, 11, 0.1)"
        },
      ],
    };
  },

  computed: {
    smsPorDest() {
      return Math.ceil(this.mensagem.length / 160) || 1;
    },

    totalDestinatarios() {
      if (this.tipoDestinatario === "contatos") {
        return this.contatosSelecionados.length;
      }
      if (this.tipoDestinatario === "grupos") {
        return this.gruposSelecionados.reduce((t, g) => t + g.membros, 0);
      }
      return this.totalTodos;
    },

    totalCreditos() {
      return this.totalDestinatarios * this.smsPorDest;
    },

    contatosFiltrados() {
      if (!this.searchContato) return this.contatos;
      const search = this.searchContato.toLowerCase();
      return this.contatos.filter(c => 
        c.nome.toLowerCase().includes(search) || 
        c.telefone.includes(search)
      );
    },

    caracteresRestantes() {
      return 160 - (this.mensagem.length % 160);
    },

    progressoMensagem() {
      return (this.mensagem.length % 160) / 160 * 100;
    },

    dataMinima() {
      return new Date().toISOString().split('T')[0];
    },

    horaAtual() {
      return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
  },

  methods: {
    selecionarTipo(tipo) {
      this.tipoDestinatario = tipo;
      this.contatosSelecionados = [];
      this.gruposSelecionados = [];
    },

    toggleContato(id) {
      const index = this.contatosSelecionados.indexOf(id);
      if (index > -1) {
        this.contatosSelecionados.splice(index, 1);
      } else {
        this.contatosSelecionados.push(id);
      }
    },

    toggleGrupo(grupo) {
      const index = this.gruposSelecionados.findIndex(g => g.id === grupo.id);
      if (index > -1) {
        this.gruposSelecionados.splice(index, 1);
      } else {
        this.gruposSelecionados.push(grupo);
      }
    },

    selecionarTodosContatos() {
      if (this.contatosSelecionados.length === this.contatos.length) {
        this.contatosSelecionados = [];
      } else {
        this.contatosSelecionados = this.contatos.map(c => c.id);
      }
    },

    async submitForm() {
      if (!this.mensagem.trim()) {
        alert("Digite uma mensagem");
        return;
      }

      if (this.totalDestinatarios === 0) {
        alert("Selecione pelo menos um destinatário");
        return;
      }

      if (this.totalCreditos > this.creditosDisponiveis) {
        alert("Créditos insuficientes para este envio");
        return;
      }

      this.enviando = true;
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.enviando = false;
      this.mostrarSucesso = true;
    },

    fecharModal() {
      this.mostrarSucesso = false;
      this.mensagem = '';
      this.contatosSelecionados = [];
      this.gruposSelecionados = [];
      this.agendar = false;
      this.dataAgendamento = '';
      this.horaAgendamento = '';
    }
  },
};
</script>

<style scoped>
/* ==================== RESET & BASE ==================== */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.enviar-sms-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* ==================== ANIMATIONS ==================== */
.fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes scaleIn {
  from { transform: scale(0); }
  to { transform: scale(1); }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ==================== HEADER ==================== */
.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-button {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 1px solid #E5E7EB;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6B7280;
  text-decoration: none;
  transition: all 0.2s;
}

.back-button:hover {
  background: #F3F4F6;
  border-color: #D1D5DB;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1F2937;
  margin: 0;
}

.page-subtitle {
  font-size: 1rem;
  color: #6B7280;
  margin: 0;
}

/* ==================== MODAL ==================== */
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
}

.modal-success {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  max-width: 400px;
  animation: slideUp 0.4s ease-out;
}

.success-icon {
  font-size: 4rem;
  color: #10B981;
  margin-bottom: 1.5rem;
  animation: scaleIn 0.5s ease-out;
}

.modal-success h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 0.5rem;
}

.modal-success p {
  color: #6B7280;
  margin-bottom: 2rem;
}

.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

/* ==================== LAYOUT ==================== */
.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

/* ==================== CARDS ==================== */
.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #E5E7EB;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-body {
  padding: 2rem;
}

/* ==================== FORM ==================== */
.form-group {
  margin-bottom: 2rem;
}

.form-label {
  display: block;
  font-size: 0.938rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

.required {
  color: #DC2626;
}

.form-control {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  font-size: 0.938rem;
  transition: all 0.2s;
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: #F59E0B;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

.form-control:hover {
  border-color: #D1D5DB;
}

.form-control:disabled {
  background-color: #F3F4F6;
  cursor: not-allowed;
  opacity: 0.6;
}

.textarea {
  resize: vertical;
  min-height: 120px;
  max-height: 400px;
}

/* ==================== TIPOS DESTINATÁRIO ==================== */
.tipos-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.tipo-card {
  position: relative;
  padding: 1.5rem;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  user-select: none;
}

.tipo-card:hover {
  border-color: #D1D5DB;
  transform: translateY(-2px);
}

.tipo-card.active {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.tipo-card:active {
  transform: scale(0.98);
}

.tipo-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
}

.tipo-label {
  font-size: 1rem;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 0.25rem;
}

.tipo-desc {
  font-size: 0.813rem;
  color: #6B7280;
}

.tipo-check {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
}

/* ==================== CONTATOS ==================== */
.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.btn-link {
  padding: 0.5rem 1rem;
  background: transparent;
  border: none;
  color: #3B82F6;
  font-weight: 600;
  font-size: 0.813rem;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-link:hover {
  background: rgba(59, 130, 246, 0.1);
}

.search-input {
  margin-bottom: 1rem;
}

.contatos-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  padding: 0.5rem;
}

.contatos-list::-webkit-scrollbar {
  width: 8px;
}

.contatos-list::-webkit-scrollbar-track {
  background: #F3F4F6;
  border-radius: 4px;
}

.contatos-list::-webkit-scrollbar-thumb {
  background: #D1D5DB;
  border-radius: 4px;
}

.contatos-list::-webkit-scrollbar-thumb:hover {
  background: #9CA3AF;
}

.contato-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
  user-select: none;
}

.contato-item:hover {
  background: #F9FAFB;
}

.contato-item.active {
  background: #F0FDF4;
  border-color: #10B981;
}

.contato-item:active {
  transform: scale(0.98);
}

.contato-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3B82F6, #8B5CF6);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

.contato-info {
  flex: 1;
}

.contato-nome {
  font-size: 0.938rem;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 0.125rem;
}

.contato-telefone {
  font-size: 0.813rem;
  color: #6B7280;
}

.check-icon {
  color: #10B981;
  font-size: 1.25rem;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  color: #9CA3AF;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.empty-state::before {
  content: "🔍";
  font-size: 2rem;
  opacity: 0.5;
}

/* ==================== GRUPOS ==================== */
.grupos-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.grupo-card {
  position: relative;
  padding: 1.5rem;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
  user-select: none;
}

.grupo-card:hover {
  border-color: #D1D5DB;
  transform: translateY(-2px);
}

.grupo-card.active {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.grupo-card:active {
  transform: scale(0.98);
}

/* ==================== GRUPOS (continuação) ==================== */
.grupo-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
}

.grupo-nome {
  font-size: 1rem;
  font-weight: 700;
  color: #1F2937;
  margin-bottom: 0.25rem;
}

.grupo-membros {
  font-size: 0.813rem;
  color: #6B7280;
}

.grupo-check {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.75rem;
}

/* ==================== ALERT ==================== */
.alert {
  padding: 1rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  border-width: 1px;
  border-style: solid;
}

.alert i {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.alert-warning {
  background: #FEF3C7;
  border-color: #F59E0B;
  color: #92400E;
}

.alert-danger {
  background: #FEE2E2;
  border-color: #DC2626;
  color: #991B1B;
}

.alert strong {
  font-weight: 700;
}

/* ==================== MENSAGEM INFO ==================== */
.mensagem-info {
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
}

.caracteres-info {
  flex: 1;
}

.caracteres-count {
  font-size: 0.813rem;
  color: #6B7280;
  margin-bottom: 0.5rem;
}

.caracteres-count span {
  font-weight: 700;
  color: #10B981;
}

.caracteres-count span.warning {
  color: #F59E0B;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #E5E7EB;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  transition: all 0.3s;
  border-radius: 3px;
}

.text-muted {
  font-size: 0.75rem;
  color: #9CA3AF;
}

.sms-count {
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #F59E0B, #F97316);
  color: white;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  white-space: nowrap;
}

/* ==================== AGENDAR ==================== */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
  padding: 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 10px;
  transition: all 0.2s;
  font-weight: 600;
  color: #374151;
}

.checkbox-label:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.checkbox-label input[type="checkbox"] {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #F59E0B;
}

.checkbox-label i {
  color: #F59E0B;
}

.slide-enter-active {
  animation: slideDown 0.3s ease-out;
}

.slide-leave-active {
  animation: slideUp 0.3s ease-out reverse;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    max-height: 200px;
    transform: translateY(0);
  }
}

.agendamento-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #E5E7EB;
}

.label-small {
  display: block;
  font-size: 0.813rem;
  font-weight: 600;
  color: #6B7280;
  margin-bottom: 0.5rem;
}

/* ==================== BOTÕES ==================== */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #E5E7EB;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 0.938rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  font-family: inherit;
}

.btn:active {
  transform: scale(0.98);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background: white;
  border: 1px solid #E5E7EB;
  color: #6B7280;
}

.btn-outline:hover:not(:disabled) {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.btn-primary {
  background: linear-gradient(135deg, #F59E0B, #F97316);
  color: white;
  border: none;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
}

.btn-white {
  background: white;
  color: #F59E0B;
  border: 1px solid white;
  width: 100%;
  justify-content: center;
}

.btn-white:hover {
  background: #FEF3C7;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* ==================== SIDEBAR ==================== */

/* ==================== LAYOUT ==================== */
.content-grid {
  display: grid;
  grid-template-columns: minmax(0, 2.5fr) 360px;
  gap: 2rem;
  align-items: flex-start;
}

/* ==================== SIDEBAR ==================== */
.sidebar {
  position: sticky;
  top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}


/* ==================== CRÉDITOS ==================== */
.creditos-card {
  background: linear-gradient(135deg, #F59E0B, #F97316);
  color: white;
  padding: 2rem;
}

.creditos-content small {
  font-size: 0.813rem;
  opacity: 0.9;
}

.creditos-valor {
  font-size: 3rem;
  font-weight: 800;
  margin: 0.5rem 0 1rem;
}

.creditos-progress {
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.creditos-progress-fill {
  height: 100%;
  background: white;
  border-radius: 4px;
  transition: width 0.3s;
}

/* ==================== RESUMO ==================== */
.resumo-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 1.5rem 0;
  padding: 1.5rem 1.5rem 0;
}

.resumo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #F3F4F6;
}

.resumo-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #6B7280;
}

.resumo-label i {
  color: #F59E0B;
}

.resumo-valor {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1F2937;
}

.resumo-divider {
  height: 1px;
  background: #E5E7EB;
  margin: 0.5rem 1.5rem;
}

.resumo-total {
  background: #F9FAFB;
  border-bottom: none;
}

.resumo-valor-total {
  font-size: 1.5rem;
  font-weight: 800;
  color: #F59E0B;
}

.resumo-card .alert {
  margin: 1rem 1.5rem 1.5rem;
}

/* ==================== PREVIEW ==================== */
.preview-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1F2937;
  margin: 0 0 1.5rem 0;
  padding: 1.5rem 1.5rem 0;
}

.preview-phone {
  padding: 1.5rem;
}

.preview-screen {
  background: linear-gradient(135deg, #3B82F6, #8B5CF6);
  border-radius: 20px;
  padding: 1.5rem;
  min-height: 200px;
  position: relative;
}

.preview-bubble {
  background: white;
  border-radius: 16px 16px 16px 4px;
  padding: 1rem;
  font-size: 0.938rem;
  color: #1F2937;
  line-height: 1.5;
  word-wrap: break-word;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 85%;
}

.preview-time {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 0.5rem;
  text-align: left;
}

/* ==================== RESPONSIVE ==================== */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
}

@media (max-width: 768px) {
  .enviar-sms-container {
    padding: 1rem;
  }

  .page-title {
    font-size: 1.5rem;
  }

  .tipos-grid {
    grid-template-columns: 1fr;
  }

  .grupos-grid {
    grid-template-columns: 1fr;
  }

  .agendamento-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }

  .sidebar {
    grid-template-columns: 1fr;
  }

  .mensagem-info {
    flex-direction: column;
    align-items: stretch;
  }

  .sms-count {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .page-header {
    flex-direction: row;
    align-items: flex-start;
  }

  .card-body {
    padding: 1.5rem;
  }

  .creditos-valor {
    font-size: 2.5rem;
  }

  .modal-success {
    margin: 1rem;
    padding: 2rem;
  }
}
</style>