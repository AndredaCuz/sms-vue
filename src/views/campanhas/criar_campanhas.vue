<template>
  <navegacao/>

  <div class="create-campaign-page fade-in">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        
        <div class="header-text">
          <h1 class="page-title">
            <i class="fas fa-bullhorn"></i>
            {{ modoEdicao ? 'Editar Campanha' : 'Nova Campanha' }}
          </h1>
          <p class="page-subtitle">
            Configure sua campanha de SMS
          </p>
        </div>
      </div>
    </div>

    <div class="content-grid">
      <!-- COLUNA PRINCIPAL -->
      <div class="main-column">
        <form @submit.prevent="salvarCampanha">
          
          <!-- Informações Básicas -->
          <div class="card card-enhanced">
            <div class="card-header">
              <div class="card-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <i class="fas fa-info-circle"></i>
              </div>
              <h3 class="card-title">Informações Básicas</h3>
            </div>

            <div class="card-body">
              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-signature"></i> Nome da Campanha *
                </label>
                <input 
                  v-model="form.name" 
                  class="form-input" 
                  placeholder="Ex: Campanha de Boas Vindas" 
                  required 
                />
              </div>

              <div class="form-group">
                <label class="form-label">
                  <i class="fas fa-comment-dots"></i> Mensagem *
                </label>
                <textarea 
                  v-model="form.message_body" 
                  class="form-input" 
                  rows="5"
                  placeholder="Digite sua mensagem aqui..."
                  required
                  @input="contarCaracteres"
                ></textarea>
                <div class="message-info">
                  <span class="char-count" :class="{ 'text-danger': caracteresRestantes < 0 }">
                    <i class="fas fa-text-width"></i>
                    {{ form.message_body.length }} caracteres
                    <span v-if="caracteresRestantes >= 0">({{ caracteresRestantes }} restantes)</span>
                    <span v-else class="text-danger">({{ Math.abs(caracteresRestantes) }} a mais)</span>
                  </span>
                  <span class="sms-count">
                    <i class="fas fa-sms"></i>
                    {{ calcularNumeroSMS() }} SMS
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tipo de Campanha -->
          <div class="card card-enhanced">
            <div class="card-header">
              <div class="card-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                <i class="fas fa-clock"></i>
              </div>
              <h3 class="card-title">Tipo de Envio</h3>
            </div>

            <div class="card-body">
              <div class="campaign-types">
                <label 
                  class="type-card"
                  :class="{ 'type-selected': form.type === 'instant' }"
                >
                  <input 
                    type="radio" 
                    value="instant" 
                    v-model="form.type"
                    name="type"
                  />
                  <div class="type-icon">
                    <i class="fas fa-bolt"></i>
                  </div>
                  <div class="type-info">
                    <h4>Instantâneo</h4>
                    <p>Enviar imediatamente</p>
                  </div>
                  <i class="fas fa-check-circle check-icon"></i>
                </label>

                <label 
                  class="type-card"
                  :class="{ 'type-selected': form.type === 'scheduled' }"
                >
                  <input 
                    type="radio" 
                    value="scheduled" 
                    v-model="form.type"
                    name="type"
                  />
                  <div class="type-icon">
                    <i class="fas fa-calendar-alt"></i>
                  </div>
                  <div class="type-info">
                    <h4>Agendado</h4>
                    <p>Agendar para depois</p>
                  </div>
                  <i class="fas fa-check-circle check-icon"></i>
                </label>
              </div>

              <!-- Data/Hora Agendamento -->
              <div v-if="form.type === 'scheduled'" class="scheduled-section">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-calendar-check"></i> Data e Hora do Envio *
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
                    A campanha será enviada automaticamente na data e hora selecionadas
                  </small>
                </div>
              </div>
            </div>
          </div>

          <!-- Público Alvo -->
          <div class="card card-enhanced">
            <div class="card-header">
              <div class="card-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                <i class="fas fa-users"></i>
              </div>
              <h3 class="card-title">Público Alvo</h3>
            </div>

            <div class="card-body">
              <div class="target-types">
                <label 
                  class="target-card"
                  :class="{ 'target-selected': form.target_type === 'all' }"
                >
                  <input 
                    type="radio" 
                    value="all" 
                    v-model="form.target_type"
                    name="target"
                  />
                  <div class="target-icon">
                    <i class="fas fa-globe"></i>
                  </div>
                  <div class="target-info">
                    <h4>Todos os Contatos</h4>
                    <p>Enviar para todos</p>
                  </div>
                </label>

                <label 
                  class="target-card"
                  :class="{ 'target-selected': form.target_type === 'category' }"
                >
                  <input 
                    type="radio" 
                    value="category" 
                    v-model="form.target_type"
                    name="target"
                  />
                  <div class="target-icon">
                    <i class="fas fa-tag"></i>
                  </div>
                  <div class="target-info">
                    <h4>Por Categoria</h4>
                    <p>Filtrar por categoria</p>
                  </div>
                </label>

                <label 
                  class="target-card"
                  :class="{ 'target-selected': form.target_type === 'selected' }"
                >
                  <input 
                    type="radio" 
                    value="selected" 
                    v-model="form.target_type"
                    name="target"
                  />
                  <div class="target-icon">
                    <i class="fas fa-user-check"></i>
                  </div>
                  <div class="target-info">
                    <h4>Contatos Específicos</h4>
                    <p>Escolher manualmente</p>
                  </div>
                </label>
              </div>

              <!-- Selecionar Categoria -->
              <div v-if="form.target_type === 'category'" class="target-section">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-tags"></i> Selecione a Categoria *
                  </label>
                  
                  <div v-if="isLoadingCategories" class="loading-sm">
                    <div class="spinner-sm"></div>
                    <span>Carregando categorias...</span>
                  </div>

                  <div v-else-if="categorias.length === 0" class="empty-sm">
                    <i class="fas fa-inbox"></i>
                    <p>Nenhuma categoria disponível</p>
                  </div>

                  <select v-else v-model="form.target_category_id" class="form-input" required>
                    <option value="">Selecione uma categoria</option>
                    <option 
                      v-for="cat in categorias" 
                      :key="cat.id" 
                      :value="cat.id"
                    >
                      {{ cat.name }} ({{ cat.clients_count }} contatos)
                    </option>
                  </select>
                </div>
              </div>

              <!-- Selecionar Contatos -->
              <div v-if="form.target_type === 'selected'" class="target-section">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-users"></i> Selecione os Contatos *
                  </label>
                  
                  <div class="search-contacts">
                    <input 
                      v-model="buscaContato"
                      type="text"
                      class="form-input"
                      placeholder="Buscar contatos..."
                      @input="buscarContatos"
                    />
                    <i class="fas fa-search search-icon"></i>
                  </div>

                  <div v-if="isLoadingContacts" class="loading-sm">
                    <div class="spinner-sm"></div>
                    <span>Carregando contatos...</span>
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
                      <input 
                        type="checkbox" 
                        :value="contato.id"
                        v-model="form.client_ids"
                      />
                      <div class="contact-avatar">
                        {{ contato.name.charAt(0).toUpperCase() }}
                      </div>
                      <div class="contact-info">
                        <h5>{{ contato.name }}</h5>
                        <p>{{ contato.phone }}</p>
                      </div>
                      <i class="fas fa-check-circle check-icon"></i>
                    </label>
                  </div>

                  <div v-if="form.client_ids.length > 0" class="selected-count">
                    <i class="fas fa-check-circle"></i>
                    {{ form.client_ids.length }} contato(s) selecionado(s)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Botões de Ação -->
          <div class="form-actions">
           
            <button class="btn btn-save" type="submit" :disabled="isSubmitting">
              <i class="fas fa-spinner fa-spin" v-if="isSubmitting"></i>
              <i class="fas fa-paper-plane" v-else></i>
              {{ isSubmitting ? 'Criando...' : 'Criar Campanha' }}
            </button>
          </div>
        </form>
      </div>

      <!-- COLUNA LATERAL -->
      <div class="sidebar-column">
        <!-- Resumo da Campanha -->
        <div class="card card-enhanced sticky-card">
          <div class="card-header">
            <div class="card-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
              <i class="fas fa-chart-pie"></i>
            </div>
            <h3 class="card-title">Resumo da Campanha</h3>
          </div>

          <div class="card-body">
            <div class="summary-list">
              <div class="summary-item">
                <i class="fas fa-signature"></i>
                <div>
                  <span class="summary-label">Nome</span>
                  <span class="summary-value">{{ form.name || 'Não definido' }}</span>
                </div>
              </div>

              <div class="summary-item">
                <i class="fas fa-clock"></i>
                <div>
                  <span class="summary-label">Tipo de Envio</span>
                  <span class="summary-value">{{ form.type === 'instant' ? 'Instantâneo' : 'Agendado' }}</span>
                </div>
              </div>

              <div class="summary-item" v-if="form.type === 'scheduled' && form.scheduled_at">
                <i class="fas fa-calendar-check"></i>
                <div>
                  <span class="summary-label">Data/Hora</span>
                  <span class="summary-value">{{ formatarDataHora(form.scheduled_at) }}</span>
                </div>
              </div>

              <div class="summary-item">
                <i class="fas fa-bullseye"></i>
                <div>
                  <span class="summary-label">Público Alvo</span>
                  <span class="summary-value">{{ getTargetLabel() }}</span>
                </div>
              </div>

              <div class="summary-item">
                <i class="fas fa-users"></i>
                <div>
                  <span class="summary-label">Destinatários</span>
                  <span class="summary-value">{{ calcularDestinatarios() }}</span>
                </div>
              </div>

              <div class="summary-item">
                <i class="fas fa-sms"></i>
                <div>
                  <span class="summary-label">SMS por Contato</span>
                  <span class="summary-value">{{ calcularNumeroSMS() }}</span>
                </div>
              </div>

              <div class="summary-item highlight">
                <i class="fas fa-paper-plane"></i>
                <div>
                  <span class="summary-label">Total de SMS</span>
                  <span class="summary-value-big">{{ calcularTotalSMS() }}</span>
                </div>
              </div>
            </div>

            <div class="cost-estimate">
              <div class="cost-header">
                <i class="fas fa-calculator"></i>
                <span>Estimativa de Custo</span>
              </div>
              <div class="cost-value">
                {{ calcularCusto() }} Kz
              </div>
              <small class="cost-note">
                <i class="fas fa-info-circle"></i>
                Custo estimado: 2 Kz por SMS
              </small>
            </div>
          </div>
        </div>

        <!-- Dicas -->
        <div class="card card-enhanced">
          <div class="card-header">
            <div class="card-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
              <i class="fas fa-lightbulb"></i>
            </div>
            <h3 class="card-title">Dicas</h3>
          </div>

          <div class="card-body">
            <div class="tips-list">
              <div class="tip-item">
                <i class="fas fa-check-circle"></i>
                <p>Mensagens SMS suportam até 160 caracteres por mensagem</p>
              </div>
              <div class="tip-item">
                <i class="fas fa-check-circle"></i>
                <p>Personalize sua mensagem para aumentar o engajamento</p>
              </div>
              <div class="tip-item">
                <i class="fas fa-check-circle"></i>
                <p>Teste sua campanha enviando para poucos contatos primeiro</p>
              </div>
              <div class="tip-item">
                <i class="fas fa-check-circle"></i>
                <p>Evite enviar mensagens em horários inadequados</p>
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

export default {
  name: 'CriarCampanha',
  
  components: {
    navegacao
  },

  data() {
    return {
      isSubmitting: false,
      isLoadingCategories: false,
      isLoadingContacts: false,
      modoEdicao: false,
      
      form: {
        name: '',
        message_body: '',
        type: 'instant', // instant ou scheduled
        scheduled_at: '',
        target_type: 'all', // all, category, selected
        target_category_id: '',
        client_ids: []
      },

      categorias: [],
      contatos: [],
      contatosDisponiveis: [],
      buscaContato: '',
      caracteresPorSMS: 160,
      custoPorSMS: 2
    };
  },

  computed: {
    caracteresRestantes() {
      return this.caracteresPorSMS - this.form.message_body.length;
    },

    dataHoraMinima() {
      const agora = new Date();
      agora.setMinutes(agora.getMinutes() + 5); // Mínimo 5 minutos no futuro
      return agora.toISOString().slice(0, 16);
    }
  },

  methods: {
    async fetchCategorias() {
      this.isLoadingCategories = true;
      const token = localStorage.getItem('auth_token');

      try {
        const response = await axios.get('https://api.devsms.online/api/v1/categories', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        // Suporta tanto dados paginados quanto diretos
        if (response.data.data && response.data.data.data) {
          this.categorias = response.data.data.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          this.categorias = response.data.data;
        } else {
          this.categorias = [];
        }

        console.log('✅ Categorias carregadas:', this.categorias.length);

      } catch (error) {
        console.error('❌ Erro ao buscar categorias:', error);
      } finally {
        this.isLoadingCategories = false;
      }
    },

    async fetchContatos() {
      this.isLoadingContacts = true;
      const token = localStorage.getItem('auth_token');

      try {
        const response = await axios.get('https://api.devsms.online/api/v1/clients', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        // Suporta dados paginados
        if (response.data.data && response.data.data.data) {
          this.contatos = response.data.data.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          this.contatos = response.data.data;
        } else {
          this.contatos = [];
        }

        this.contatosDisponiveis = this.contatos;
        console.log('✅ Contatos carregados:', this.contatos.length);

      } catch (error) {
        console.error('❌ Erro ao buscar contatos:', error);
      } finally {
        this.isLoadingContacts = false;
      }
    },

    buscarContatos() {
      const busca = this.buscaContato.toLowerCase();
      
      if (!busca) {
        this.contatosDisponiveis = this.contatos;
        return;
      }

      this.contatosDisponiveis = this.contatos.filter(contato => 
        contato.name.toLowerCase().includes(busca) ||
        contato.phone.includes(busca)
      );
    },

    async salvarCampanha() {
      if (this.isSubmitting) return;

      // Validações
      if (!this.form.name.trim()) {
        alert('Por favor, informe o nome da campanha.');
        return;
      }

      if (!this.form.message_body.trim()) {
        alert('Por favor, escreva a mensagem da campanha.');
        return;
      }

      if (this.form.type === 'scheduled' && !this.form.scheduled_at) {
        alert('Por favor, selecione a data e hora do envio.');
        return;
      }

      if (this.form.target_type === 'category' && !this.form.target_category_id) {
        alert('Por favor, selecione uma categoria.');
        return;
      }

      if (this.form.target_type === 'selected' && this.form.client_ids.length === 0) {
        alert('Por favor, selecione pelo menos um contato.');
        return;
      }

      this.isSubmitting = true;
      const token = localStorage.getItem('auth_token');

      try {
        // Montar payload baseado no tipo
        let payload = {
          name: this.form.name,
          message_body: this.form.message_body,
          type: this.form.type,
          target_type: this.form.target_type
        };

        // Adicionar scheduled_at se for agendado
        if (this.form.type === 'scheduled') {
          payload.scheduled_at = this.form.scheduled_at;
        }

        // Adicionar campos específicos do target_type
        if (this.form.target_type === 'category') {
          payload.target_category_id = this.form.target_category_id;
        } else if (this.form.target_type === 'selected') {
          payload.client_ids = this.form.client_ids;
        }

        console.log('📤 Enviando payload:', payload);

        const response = await axios.post(
          'https://api.devsms.online/api/v1/campaigns',
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

        alert('✅ Campanha criada com sucesso!');
        this.$router.push({ name: 'MinhasCampanhas' });

      } catch (error) {
        console.error('❌ Erro ao criar campanha:', error);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          this.$router.push('/login');
        } else if (error.response?.data?.message) {
          alert('Erro: ' + error.response.data.message);
        } else {
          alert('Erro ao criar campanha. Por favor, tente novamente.');
        }
      } finally {
        this.isSubmitting = false;
      }
    },

    contarCaracteres() {
      // Atualiza contador em tempo real
    },

    calcularNumeroSMS() {
      if (!this.form.message_body) return 0;
      return Math.ceil(this.form.message_body.length / this.caracteresPorSMS);
    },

    calcularDestinatarios() {
      if (this.form.target_type === 'all') {
        return this.contatos.length || 0;
      } else if (this.form.target_type === 'category') {
        const cat = this.categorias.find(c => c.id === this.form.target_category_id);
        return cat ? cat.clients_count : 0;
      } else if (this.form.target_type === 'selected') {
        return this.form.client_ids.length;
      }
      return 0;
    },

    calcularTotalSMS() {
      return this.calcularDestinatarios() * this.calcularNumeroSMS();
    },

    calcularCusto() {
      return (this.calcularTotalSMS() * this.custoPorSMS).toFixed(2);
    },

    getTargetLabel() {
      const labels = {
        all: 'Todos os Contatos',
        category: 'Por Categoria',
        selected: 'Contatos Específicos'
      };
      return labels[this.form.target_type] || 'Não definido';
    },

    formatarDataHora(dataHora) {
      if (!dataHora) return '-';
      const date = new Date(dataHora);
      return date.toLocaleString('pt-BR');
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

.create-campaign-page {
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
}

.btn-back:hover {
  background: var(--primary);
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
.card-enhanced {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  overflow: hidden;
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

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  font-size: 0.9375rem;
  transition: all 0.3s;
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
.message-info {
display: flex;
justify-content: space-between;
margin-top: 0.5rem;
font-size: 0.875rem;
}
.char-count,
.sms-count {
display: flex;
align-items: center;
gap: 0.5rem;
color: var(--gray-600);
}
.text-danger {
color: var(--danger) !important;
}
/* Tipo de Campanha */
.campaign-types {
display: grid;
grid-template-columns: repeat(2, 1fr);
gap: 1rem;
margin-bottom: 1.5rem;
}
.type-card {
padding: 1.25rem;
border: 2px solid var(--gray-200);
border-radius: 12px;
cursor: pointer;
transition: all 0.3s;
position: relative;
display: flex;
flex-direction: column;
align-items: center;
text-align: center;
gap: 0.75rem;
}
.type-card input[type="radio"] {
position: absolute;
opacity: 0;
}
.type-card:hover {
background: var(--gray-50);
border-color: var(--primary);
}
.type-selected {
background: rgba(99, 102, 241, 0.1);
border-color: var(--primary);
}
.type-icon {
width: 50px;
height: 50px;
border-radius: 50%;
background: var(--primary);
color: white;
display: flex;
align-items: center;
justify-content: center;
font-size: 1.5rem;
}
.type-info h4 {
font-size: 1rem;
font-weight: 600;
color: var(--gray-900);
margin: 0;
}
.type-info p {
font-size: 0.875rem;
color: var(--gray-600);
margin: 0.25rem 0 0 0;
}
.check-icon {
position: absolute;
top: 0.75rem;
right: 0.75rem;
color: var(--primary);
opacity: 0;
transition: opacity 0.3s;
}
.type-selected .check-icon {
opacity: 1;
}
.scheduled-section {
margin-top: 1.5rem;
padding: 1.25rem;
background: var(--gray-50);
border-radius: 8px;
border: 2px solid var(--primary);
}
/* Público Alvo */
.target-types {
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 1rem;
margin-bottom: 1.5rem;
}
.target-card {
padding: 1rem;
border: 2px solid var(--gray-200);
border-radius: 12px;
cursor: pointer;
transition: all 0.3s;
position: relative;
display: flex;
flex-direction: column;
align-items: center;
text-align: center;
gap: 0.5rem;
}
.target-card input[type="radio"] {
position: absolute;
opacity: 0;
}
.target-card:hover {
background: var(--gray-50);
border-color: var(--primary);
}
.target-selected {
background: rgba(99, 102, 241, 0.1);
border-color: var(--primary);
}
.target-icon {
width: 40px;
height: 40px;
border-radius: 50%;
background: var(--primary);
color: white;
display: flex;
align-items: center;
justify-content: center;
font-size: 1.25rem;
}
.target-info h4 {
font-size: 0.9375rem;
font-weight: 600;
color: var(--gray-900);
margin: 0;
}
.target-info p {
font-size: 0.75rem;
color: var(--gray-600);
margin: 0.25rem 0 0 0;
}
.target-section {
margin-top: 1.5rem;
padding: 1.25rem;
background: var(--gray-50);
border-radius: 8px;
border: 2px solid var(--primary);
}
/* Busca de Contatos */
.search-contacts {
position: relative;
margin-bottom: 1rem;
}
.search-icon {
position: absolute;
right: 1rem;
top: 50%;
transform: translateY(-50%);
color: var(--gray-400);
}
/* Lista de Contatos */
.contacts-list {
max-height: 400px;
overflow-y: auto;
display: flex;
flex-direction: column;
gap: 0.5rem;
margin-top: 1rem;
}
.contact-item {
display: flex;
align-items: center;
gap: 1rem;
padding: 1rem;
border: 2px solid var(--gray-200);
border-radius: 8px;
cursor: pointer;
transition: all 0.3s;
position: relative;
}
.contact-item:hover {
background: var(--gray-50);
border-color: var(--primary);
}
.contact-selected {
background: rgba(99, 102, 241, 0.1);
border-color: var(--primary);
}
.contact-item input[type="checkbox"] {
width: 18px;
height: 18px;
cursor: pointer;
}
.contact-avatar {
width: 40px;
height: 40px;
border-radius: 50%;
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
color: white;
display: flex;
align-items: center;
justify-content: center;
font-weight: 600;
}
.contact-info {
flex: 1;
}
.contact-info h5 {
font-size: 0.9375rem;
font-weight: 600;
color: var(--gray-900);
margin: 0;
}
.contact-info p {
font-size: 0.8125rem;
color: var(--gray-600);
margin: 0.25rem 0 0 0;
}
.contact-selected .check-icon {
opacity: 1;
}
.selected-count {
margin-top: 1rem;
padding: 0.75rem;
background: rgba(99, 102, 241, 0.1);
border-radius: 8px;
text-align: center;
color: var(--primary);
font-weight: 500;
font-size: 0.875rem;
display: flex;
align-items: center;
justify-content: center;
gap: 0.5rem;
}
/* Resumo */
.sticky-card {
position: sticky;
top: 2rem;
}
.summary-list {
display: flex;
flex-direction: column;
gap: 1rem;
}
.summary-item {
display: flex;
align-items: flex-start;
gap: 0.75rem;
padding: 0.75rem;
background: var(--gray-50);
border-radius: 8px;
}
.summary-item.highlight {
background: rgba(99, 102, 241, 0.1);
border: 2px solid var(--primary);
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
.summary-value-big {
font-size: 1.5rem;
color: var(--primary);
font-weight: 700;
}
.cost-estimate {
margin-top: 1.5rem;
padding: 1.25rem;
background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
border-radius: 12px;
text-align: center;
color: white;
}
.cost-header {
display: flex;
align-items: center;
justify-content: center;
gap: 0.5rem;
font-size: 0.875rem;
font-weight: 600;
margin-bottom: 0.5rem;
}
.cost-value {
font-size: 2rem;
font-weight: 700;
margin-bottom: 0.5rem;
}
.cost-note {
font-size: 0.75rem;
opacity: 0.9;
display: flex;
align-items: center;
justify-content: center;
gap: 0.25rem;
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
/* Loading States */
.loading-sm,
.empty-sm {
padding: 2rem;
text-align: center;
color: var(--gray-600);
}
.spinner-sm {
width: 30px;
height: 30px;
border: 3px solid var(--gray-200);
border-top-color: var(--primary);
border-radius: 50%;
animation: spin 1s linear infinite;
margin: 0 auto 0.75rem;
}
@keyframes spin {
to { transform: rotate(360deg); }
}
.empty-sm i {
font-size: 2rem;
color: var(--gray-400);
margin-bottom: 0.5rem;
}
/* Botões de Ação */
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
.btn-cancel {
background: white;
color: var(--gray-700);
border: 2px solid var(--gray-300);
}
.btn-cancel:hover {
background: var(--gray-50);
border-color: var(--gray-400);
}
.btn-save {
background: var(--primary);
color: white;
}
.btn-save:hover:not(:disabled) {
background: var(--primary-dark);
transform: translateY(-1px);
box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}
.btn-save:disabled {
opacity: 0.6;
cursor: not-allowed;
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
@media (max-width: 1024px) {
.content-grid {
grid-template-columns: 1fr;
}
.sticky-card {
position: static;
}
}
@media (max-width: 768px) {
.create-campaign-page {
padding: 1rem;
}
.campaign-types,
.target-types {
grid-template-columns: 1fr;
}
.form-actions {
flex-direction: column;
}
.btn {
width: 100%;
justify-content: center;
}
}
</style>