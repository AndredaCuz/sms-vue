<template>
  <navegacao/>

  <div class="contacts-page fade-in">
    <!-- Header Aprimorado -->
    <div class="page-header-enhanced">
      <div class="header-content">
        <router-link :to="{ name: 'Meucontatos' }" class="btn-back">
          <i class="fas fa-arrow-left"></i>
        </router-link>
        <div class="header-text">
          <h1 class="page-title-enhanced">Adicionar Novo Contato</h1>
          <p class="page-subtitle-enhanced">
            <i class="fas fa-info-circle"></i>
            Preencha as informações do contato abaixo
          </p>
        </div>
      </div>
      <div class="header-actions">
        <button type="button" class="btn btn-outline-sm" @click="limparFormulario">
          <i class="fas fa-redo"></i> Limpar
        </button>
      </div>
    </div>

    <div class="content-grid">
      <!-- COLUNA PRINCIPAL -->
      <div class="main-column">
        <form @submit.prevent="salvarContato">
          <!-- Informações Básicas -->
          <div class="card card-enhanced">
            <div class="card-header">
              <div class="card-icon personal">
                <i class="fas fa-user"></i>
              </div>
              <h3 class="card-title-enhanced">Informações Básicas</h3>
            </div>

            <div class="card-body">
              <div class="form-grid">
                <div class="form-group full-width">
                  <label class="form-label">
                    <i class="fas fa-user-tag"></i> Nome Completo *
                  </label>
                  <input 
                    v-model="form.name" 
                    class="form-input" 
                    placeholder="Ex: João Silva" 
                    required 
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-phone"></i> Telefone *
                  </label>
                  <input 
                    v-model="form.phone" 
                    class="form-input" 
                    placeholder="923456789"
                    @input="mascaraTelefone" 
                    required 
                  />
                  <small class="form-hint">Formato: 9 dígitos sem espaços</small>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-envelope"></i> Email
                  </label>
                  <input 
                    type="email" 
                    v-model="form.email" 
                    class="form-input" 
                    placeholder="exemplo@email.com" 
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-calendar"></i> Data de Nascimento
                  </label>
                  <input 
                    type="date" 
                    v-model="form.custom_fields.data_nascimento" 
                    class="form-input" 
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-toggle-on"></i> Status *
                  </label>
                  <select v-model="form.status" class="form-input" required>
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Endereço -->
          <div class="card card-enhanced">
            <div class="card-header">
              <div class="card-icon address">
                <i class="fas fa-map-marker-alt"></i>
              </div>
              <h3 class="card-title-enhanced">Endereço</h3>
            </div>

            <div class="card-body">
              <div class="form-group full-width">
                <label class="form-label">
                  <i class="fas fa-home"></i> Endereço Completo
                </label>
                <textarea 
                  v-model="form.custom_fields.endereco" 
                  class="form-input" 
                  rows="3"
                  placeholder="Rua, número, bairro, cidade..."
                ></textarea>
              </div>
            </div>
          </div>

          <!-- Informações Financeiras -->
          <div class="card card-enhanced">
            <div class="card-header">
              <div class="card-icon financial">
                <i class="fas fa-money-bill-wave"></i>
              </div>
              <h3 class="card-title-enhanced">Informações Financeiras</h3>
            </div>

            <div class="card-body">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-dollar-sign"></i> Valor da Dívida
                  </label>
                  <input 
                    type="number" 
                    v-model="form.debt_amount" 
                    class="form-input" 
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                  <small class="form-hint">Em Kwanzas (AOA)</small>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-calendar-alt"></i> Data Início do Contrato
                  </label>
                  <input 
                    type="date" 
                    v-model="form.contract_start_date" 
                    class="form-input" 
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-calendar-times"></i> Data Fim do Contrato
                  </label>
                  <input 
                    type="date" 
                    v-model="form.contract_end_date" 
                    class="form-input" 
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Campos Personalizados Adicionais -->
          <div class="card card-enhanced">
            <div class="card-header">
              <div class="card-icon custom">
                <i class="fas fa-sliders-h"></i>
              </div>
              <h3 class="card-title-enhanced">Campos Personalizados</h3>
            </div>

            <div class="card-body">
              <div class="custom-fields-editor">
                <div 
                  v-for="(field, index) in customFieldsList" 
                  :key="index"
                  class="custom-field-item"
                >
                  <div class="form-grid">
                    <div class="form-group">
                      <input 
                        v-model="field.key" 
                        class="form-input" 
                        placeholder="Nome do campo"
                      />
                    </div>
                    <div class="form-group" style="position: relative;">
                      <input 
                        v-model="field.value" 
                        class="form-input" 
                        placeholder="Valor"
                      />
                      <button 
                        type="button"
                        class="btn-remove-field"
                        @click="removeCustomField(index)"
                      >
                        <i class="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <button 
                  type="button" 
                  class="btn-add-field"
                  @click="addCustomField"
                >
                  <i class="fas fa-plus"></i> Adicionar Campo
                </button>
              </div>
            </div>
          </div>

          <!-- Botões de Ação -->
          <div class="form-actions">
            <router-link :to="{ name: 'Meucontatos' }" class="btn btn-cancel">
              <i class="fas fa-times"></i> Cancelar
            </router-link>
            <button class="btn btn-save" type="submit" :disabled="isSubmitting">
              <i class="fas fa-spinner fa-spin" v-if="isSubmitting"></i>
              <i class="fas fa-check" v-else></i>
              {{ isSubmitting ? 'Salvando...' : 'Salvar Contato' }}
            </button>
          </div>
        </form>
      </div>

      <!-- COLUNA LATERAL -->
      <div class="sidebar-column">
        <!-- Categoria -->
        <div class="card card-enhanced sticky-card">
          <div class="card-header">
            <div class="card-icon category">
              <i class="fas fa-tag"></i>
            </div>
            <h3 class="card-title-enhanced">Categoria</h3>
          </div>

          <div class="card-body">
            <div v-if="isLoadingCategories" class="loading-state">
              <div class="spinner-sm"></div>
              <p>Carregando categorias...</p>
            </div>

            <div v-else-if="categorias.length === 0" class="empty-state-sm">
              <i class="fas fa-inbox"></i>
              <p>Nenhuma categoria disponível</p>
            </div>

            <div v-else class="categories-list">
              <label 
                v-for="cat in categorias" 
                :key="cat.id" 
                class="category-item"
                :class="{ 'category-selected': form.category_id === cat.id }"
              >
                <input 
                  type="radio" 
                  :value="cat.id" 
                  v-model="form.category_id" 
                  name="category"
                />
                <span class="category-color" :style="{ background: cat.color }"></span>
                <span class="category-name">{{ cat.name }}</span>
                <i class="fas fa-check check-icon"></i>
              </label>
            </div>

            <div v-if="form.category_id" class="selected-info">
              <i class="fas fa-info-circle"></i>
              Categoria selecionada
            </div>
          </div>
        </div>

        <!-- Preferências de SMS -->
        <div class="card card-enhanced">
          <div class="card-header">
            <div class="card-icon sms">
              <i class="fas fa-sms"></i>
            </div>
            <h3 class="card-title-enhanced">Preferências SMS</h3>
          </div>

          <div class="card-body">
            <div class="preference-item">
              <label class="switch-label">
                <input 
                  type="checkbox" 
                  v-model="form.opt_out"
                  class="switch-input"
                />
                <span class="switch-slider"></span>
                <span class="switch-text">
                  {{ form.opt_out ? 'Cancelado' : 'Aceita SMS' }}
                </span>
              </label>
              <small class="form-hint">
                {{ form.opt_out ? 'Este contato não receberá SMS' : 'Este contato pode receber SMS' }}
              </small>
            </div>
          </div>
        </div>

        <!-- Resumo -->
        <div class="card card-enhanced">
          <div class="card-header">
            <div class="card-icon summary">
              <i class="fas fa-list-check"></i>
            </div>
            <h3 class="card-title-enhanced">Resumo</h3>
          </div>

          <div class="card-body">
            <div class="summary-list">
              <div class="summary-item">
                <i class="fas fa-user"></i>
                <span>{{ form.name || 'Nome não informado' }}</span>
              </div>
              <div class="summary-item">
                <i class="fas fa-phone"></i>
                <span>{{ form.phone || 'Telefone não informado' }}</span>
              </div>
              <div class="summary-item">
                <i class="fas fa-tag"></i>
                <span>{{ getCategoryName() || 'Sem categoria' }}</span>
              </div>
              <div class="summary-item">
                <i class="fas fa-circle" :class="form.status === 'active' ? 'text-success' : 'text-warning'"></i>
                <span>{{ form.status === 'active' ? 'Ativo' : 'Inativo' }}</span>
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
  name: 'CriarContato',

  components: {
    navegacao,
  },

  data() {
    return {
      isSubmitting: false,
      isLoadingCategories: true,
      categorias: [],
      
      form: {
        name: '',
        phone: '',
        email: '',
        category_id: null,
        status: 'active',
        debt_amount: 0,
        contract_start_date: null,
        contract_end_date: null,
        opt_out: false,
        custom_fields: {
          endereco: '',
          data_nascimento: ''
        }
      },

      customFieldsList: []
    };
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

        this.categorias = response.data.data || [];
        console.log('Categorias carregadas:', this.categorias.length);

        // Selecionar primeira categoria por padrão
        if (this.categorias.length > 0) {
          this.form.category_id = this.categorias[0].id;
        }

      } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        alert('Erro ao carregar categorias. Por favor, recarregue a página.');
      } finally {
        this.isLoadingCategories = false;
      }
    },

    async salvarContato() {
      if (this.isSubmitting) return;

      // Validações
      if (!this.form.name.trim()) {
        alert('Por favor, informe o nome do contato.');
        return;
      }

      if (!this.form.phone.trim()) {
        alert('Por favor, informe o telefone do contato.');
        return;
      }

      if (!this.form.category_id) {
        alert('Por favor, selecione uma categoria.');
        return;
      }

      this.isSubmitting = true;
      const token = localStorage.getItem('auth_token');

      try {
        // Adicionar campos personalizados da lista
        const customFields = { ...this.form.custom_fields };
        this.customFieldsList.forEach(field => {
          if (field.key && field.value) {
            customFields[field.key] = field.value;
          }
        });

        const payload = {
          name: this.form.name,
          phone: this.form.phone.replace(/\D/g, ''), // Remove caracteres não numéricos
          email: this.form.email || null,
          category_id: this.form.category_id,
          status: this.form.status,
          debt_amount: parseFloat(this.form.debt_amount) || 0,
          contract_start_date: this.form.contract_start_date || null,
          contract_end_date: this.form.contract_end_date || null,
          opt_out: this.form.opt_out,
          custom_fields: customFields
        };

        console.log('Enviando payload:', payload);

        const response = await axios.post(
          'https://api.devsms.online/api/v1/clients',
          payload,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Resposta:', response.data);

        alert('✅ Contato criado com sucesso!');
        this.$router.push({ name: 'Meucontatos' });

      } catch (error) {
        console.error('Erro ao salvar contato:', error);
        
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          this.$router.push('/login');
        } else if (error.response?.data?.message) {
          alert('Erro: ' + error.response.data.message);
        } else {
          alert('Erro ao salvar contato. Por favor, tente novamente.');
        }
      } finally {
        this.isSubmitting = false;
      }
    },

    limparFormulario() {
      if (confirm('Tem certeza que deseja limpar todos os campos?')) {
        this.form = {
          name: '',
          phone: '',
          email: '',
          category_id: this.categorias.length > 0 ? this.categorias[0].id : null,
          status: 'active',
          debt_amount: 0,
          contract_start_date: null,
          contract_end_date: null,
          opt_out: false,
          custom_fields: {
            endereco: '',
            data_nascimento: ''
          }
        };
        this.customFieldsList = [];
      }
    },

    mascaraTelefone() {
      // Remove tudo que não é dígito
      let valor = this.form.phone.replace(/\D/g, '');
      
      // Limita a 9 dígitos
      if (valor.length > 9) {
        valor = valor.substring(0, 9);
      }
      
      this.form.phone = valor;
    },

    addCustomField() {
      this.customFieldsList.push({
        key: '',
        value: ''
      });
    },

    removeCustomField(index) {
      this.customFieldsList.splice(index, 1);
    },

    getCategoryName() {
      const cat = this.categorias.find(c => c.id === this.form.category_id);
      return cat ? cat.name : '';
    }
  },

  mounted() {
    this.fetchCategorias();
  }
};
</script>

<style scoped>
/* Variáveis */
:root {
  --primary: #6366f1;
  --primary-dark: #4f46e5;
  --success: #10b981;
  --danger: #ef4444;
  --warning: #f59e0b;
  --info: #3b82f6;
  --gray-50: #f9fafb;
  --gray-100: #f3f4f6;
  --gray-200: #e5e7eb;
  --gray-300: #d1d5db;
  --gray-600: #4b5563;
  --gray-700: #374151;
  --gray-900: #111827;
}

.contacts-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* Header Aprimorado */
.page-header-enhanced {
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.page-title-enhanced {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0;
}

.page-subtitle-enhanced {
  color: var(--gray-600);
  font-size: 0.875rem;
  margin: 0.25rem 0 0 0;
}

.page-subtitle-enhanced i {
  margin-right: 0.25rem;
}

/* Grid Layout */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 2rem;
}

/* Cards Aprimorados */
.card-enhanced {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 1.5rem;
  overflow: hidden;
  transition: box-shadow 0.3s;
}

.card-enhanced:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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

.card-icon.personal { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.card-icon.professional { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.card-icon.address { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.card-icon.notes { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
.card-icon.photo { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
.card-icon.groups { background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); }

.card-title-enhanced {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--gray-900);
  margin: 0;
}

.card-body {
  padding: 1.5rem;
}

/* Formulário */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
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

.form-label i {
  color: var(--primary);
  font-size: 0.875rem;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  font-size: 0.9375rem;
  transition: all 0.3s;
  background: white;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.form-input::placeholder {
  color: var(--gray-300);
}

.form-hint {
  color: var(--gray-600);
  font-size: 0.75rem;
  margin-top: 0.25rem;
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
  transition: all 0.3s;
  cursor: pointer;
  border: none;
  font-size: 0.9375rem;
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

.btn-save:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.btn-outline-sm {
  padding: 0.5rem 1rem;
  background: white;
  border: 2px solid var(--gray-300);
  border-radius: 8px;
  color: var(--gray-700);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-outline-sm:hover {
  background: var(--gray-50);
}

/* Foto do Contato */
.sticky-card {
  position: sticky;
  top: 2rem;
}

.photo-preview {
  width: 150px;
  height: 150px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid var(--gray-200);
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 3rem;
}

.btn-upload {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--primary);
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
}

.btn-upload:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
}

.btn-remove-photo {
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  background: transparent;
  color: var(--danger);
  border: 2px solid var(--danger);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 0.875rem;
}

.btn-remove-photo:hover {
  background: var(--danger);
  color: white;
}

/* Grupos */
.groups-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.group-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 2px solid var(--gray-200);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.group-item:hover {
  background: var(--gray-50);
  border-color: var(--primary);
}

.group-item.group-selected {
  background: rgba(99, 102, 241, 0.1);
  border-color: var(--primary);
}

.group-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.group-name {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: var(--gray-700);
}

.check-icon {
  color: var(--primary);
  opacity: 0;
  transition: opacity 0.3s;
}

.group-selected .check-icon {
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
}

/* Responsivo */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .sticky-card {
    position: static;
  }
}

@media (max-width: 768px) {
  .contacts-page {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .page-header-enhanced {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}

/* Animações */
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
</style>