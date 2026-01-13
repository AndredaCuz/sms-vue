<template>

  <navegacao/>
  <div class="editar-contato-page">
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <button @click="voltarParaLista" class="btn-back">
            <i class="fas fa-arrow-left"></i>
          </button>
          <div>
            <h1>Editar Contato</h1>
            <p>Atualize as informações do contato</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoadingContact" class="loading-container">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Carregando dados do contato...</p>
    </div>

    <!-- Status Message -->
    <div v-if="statusMessage" :class="['status-message', statusType]">
      <i :class="statusType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
      {{ statusMessage }}
    </div>

    <!-- Formulário -->
    <div v-if="!isLoadingContact" class="form-container">
      <form @submit.prevent="handleUpdateContact">
        <div class="form-grid">
          <!-- Nome -->
          <div class="form-group">
            <label for="name">
              <i class="fas fa-user"></i>
              Nome Completo *
            </label>
            <input
              type="text"
              id="name"
              v-model="form.name"
              class="form-control"
              placeholder="Digite o nome completo"
              required
            />
            <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
          </div>

          <!-- Email -->
          <div class="form-group">
            <label for="email">
              <i class="fas fa-envelope"></i>
              Email
            </label>
            <input
              type="email"
              id="email"
              v-model="form.email"
              class="form-control"
              placeholder="exemplo@email.com"
            />
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>

          <!-- Telefone -->
          <div class="form-group">
            <label for="phone">
              <i class="fas fa-phone"></i>
              Telefone *
            </label>
            <input
              type="tel"
              id="phone"
              v-model="form.phone"
              class="form-control"
              placeholder="+244 900 000 000"
              required
            />
            <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
          </div>

          <!-- Empresa -->
          <div class="form-group">
            <label for="company">
              <i class="fas fa-building"></i>
              Empresa
            </label>
            <input
              type="text"
              id="company"
              v-model="form.company"
              class="form-control"
              placeholder="Nome da empresa"
            />
          </div>

          <!-- Endereço -->
          <div class="form-group full-width">
            <label for="address">
              <i class="fas fa-map-marker-alt"></i>
              Endereço
            </label>
            <input
              type="text"
              id="address"
              v-model="form.address"
              class="form-control"
              placeholder="Rua, número, bairro"
            />
          </div>

          <!-- Categoria -->
          <div class="form-group">
            <label for="category">
              <i class="fas fa-tag"></i>
              Categoria
            </label>
            <select
              id="category"
              v-model="form.category_id"
              class="form-control"
            >
              <option value="">Selecione uma categoria</option>
              <option 
                v-for="category in categories" 
                :key="category.id" 
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>

          <!-- Status -->
          <div class="form-group">
            <label for="status">
              <i class="fas fa-toggle-on"></i>
              Status
            </label>
            <select
              id="status"
              v-model="form.status"
              class="form-control"
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>

          <!-- Notas -->
          <div class="form-group full-width">
            <label for="notes">
              <i class="fas fa-sticky-note"></i>
              Notas
            </label>
            <textarea
              id="notes"
              v-model="form.notes"
              class="form-control"
              placeholder="Observações adicionais sobre o contato"
              rows="4"
            ></textarea>
          </div>
        </div>

        <!-- Botões -->
        <div class="form-actions">
          <button 
            type="button" 
            @click="voltarParaLista" 
            class="btn-cancel"
            :disabled="isUpdating"
          >
            <i class="fas fa-times"></i>
            Cancelar
          </button>
          <button 
            type="submit" 
            class="btn-submit"
            :disabled="isUpdating"
          >
            <i :class="isUpdating ? 'fas fa-spinner fa-spin' : 'fas fa-save'"></i>
            {{ isUpdating ? 'Atualizando...' : 'Atualizar Contato' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

import navegacao from '../../components/navegacao.vue';

export default {
  name: 'EditarContato',

  components:{
    navegacao
  },
  data() {
    return {
      isLoadingContact: true,
      isUpdating: false,
      statusMessage: '',
      statusType: '',
      contactId: null,
      
      form: {
        name: '',
        email: '',
        phone: '',
        company: '',
        address: '',
        category_id: '',
        status: 'active',
        notes: ''
      },
      
      errors: {
        name: '',
        email: '',
        phone: ''
      },
      
      categories: []
    };
  },
  
  methods: {
    async loadContact() {
      this.isLoadingContact = true;
      const token = localStorage.getItem('auth_token');
      
      // Pegar ID da rota
      this.contactId = this.$route.params.id;
      
      if (!this.contactId) {
        this.statusMessage = 'ID do contato não fornecido';
        this.statusType = 'error';
        this.isLoadingContact = false;
        return;
      }

      try {
        const response = await axios.get(
          `https://api.devsms.online/api/v1/clients/${this.contactId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        const contact = response.data.data || response.data;
        
        // Preencher formulário com dados do contato
        this.form = {
          name: contact.name || '',
          email: contact.email || '',
          phone: contact.phone || '',
          company: contact.company || '',
          address: contact.address || '',
          category_id: contact.category_id || '',
          status: contact.status || 'active',
          notes: contact.notes || ''
        };

        console.log('✅ Contato carregado:', contact);
        
      } catch (error) {
        console.error('❌ Erro ao carregar contato:', error);
        
        if (error.response?.status === 404) {
          this.statusMessage = 'Contato não encontrado';
        } else {
          this.statusMessage = 'Erro ao carregar dados do contato';
        }
        this.statusType = 'error';
        
      } finally {
        this.isLoadingContact = false;
      }
    },
    
    async loadCategories() {
      const token = localStorage.getItem('auth_token');
      
      try {
        const response = await axios.get(
          'https://api.devsms.online/api/v1/categories',
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        this.categories = response.data.data || response.data;
        console.log('✅ Categorias carregadas:', this.categories);
        
      } catch (error) {
        console.error('❌ Erro ao carregar categorias:', error);
      }
    },
    
    validateForm() {
      this.errors = {
        name: '',
        email: '',
        phone: ''
      };

      let isValid = true;

      // Validação de nome
      if (!this.form.name || this.form.name.trim().length < 3) {
        this.errors.name = 'Nome deve ter no mínimo 3 caracteres';
        isValid = false;
      }

      // Validação de email (se preenchido)
      if (this.form.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.form.email)) {
          this.errors.email = 'Email inválido';
          isValid = false;
        }
      }

      // Validação de telefone
      if (!this.form.phone) {
        this.errors.phone = 'Telefone é obrigatório';
        isValid = false;
      }

      return isValid;
    },
    
    async handleUpdateContact() {
      if (!this.validateForm()) {
        this.statusMessage = 'Por favor, corrija os erros no formulário';
        this.statusType = 'error';
        return;
      }

      this.isUpdating = true;
      this.statusMessage = '';
      const token = localStorage.getItem('auth_token');

      try {
        // Preparar dados para envio (remover campos vazios)
        const updateData = {};
        Object.keys(this.form).forEach(key => {
          if (this.form[key] !== '' && this.form[key] !== null) {
            updateData[key] = this.form[key];
          }
        });

        const response = await axios.put(
          `https://api.devsms.online/api/v1/clients/${this.contactId}`,
          updateData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );

        console.log('✅ Contato atualizado:', response.data);

        this.statusMessage = 'Contato atualizado com sucesso!';
        this.statusType = 'success';

        // Redirecionar após 1.5 segundos
        setTimeout(() => {
          this.voltarParaLista();
        }, 1500);

      } catch (error) {
        console.error('❌ Erro ao atualizar contato:', error);

        if (error.response) {
          if (error.response.status === 422) {
            // Erros de validação
            const apiErrors = error.response.data.errors;
            if (apiErrors) {
              this.errors = {
                name: apiErrors.name?.[0] || '',
                email: apiErrors.email?.[0] || '',
                phone: apiErrors.phone?.[0] || ''
              };
            }
            this.statusMessage = error.response.data.message || 'Dados inválidos';
          } else if (error.response.status === 404) {
            this.statusMessage = 'Contato não encontrado';
          } else {
            this.statusMessage = error.response.data.message || 'Erro ao atualizar contato';
          }
        } else {
          this.statusMessage = 'Erro de conexão. Verifique sua internet.';
        }
        
        this.statusType = 'error';
        
      } finally {
        this.isUpdating = false;
      }
    },
    
    voltarParaLista() {
      this.$router.push('/meucontatos');
    }
  },
  
  mounted() {
    console.log('🚀 Componente Editar Contato montado');
    this.loadContact();
    this.loadCategories();
  }
};
</script>

<style scoped>
.editar-contato-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-back {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  border: none;
  background: #F3F4F6;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.125rem;
}

.btn-back:hover {
  background: #E5E7EB;
  color: #F59E0B;
}

.page-header h1 {
  font-size: 1.875rem;
  color: #1F2937;
  margin: 0 0 0.25rem 0;
}

.page-header p {
  color: #6B7280;
  margin: 0;
  font-size: 0.938rem;
}

.loading-container {
  text-align: center;
  padding: 4rem 2rem;
}

.loading-container i {
  font-size: 3rem;
  color: #F59E0B;
  margin-bottom: 1rem;
}

.loading-container p {
  color: #6B7280;
  font-size: 1.125rem;
}

.status-message {
  padding: 1rem 1.5rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
}

.status-message.success {
  background-color: #D1FAE5;
  color: #065F46;
  border: 1px solid #A7F3D0;
}

.status-message.error {
  background-color: #FEE2E2;
  color: #991B1B;
  border: 1px solid #FECACA;
}

.status-message i {
  font-size: 1.25rem;
}

.form-container {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #374151;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.938rem;
}

.form-group label i {
  color: #F59E0B;
  font-size: 1rem;
}

.form-control {
  padding: 0.75rem 1rem;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 0.938rem;
  transition: all 0.2s;
  font-family: inherit;
}

.form-control:focus {
  outline: none;
  border-color: #F59E0B;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

select.form-control {
  cursor: pointer;
}

.error-message {
  color: #DC2626;
  font-size: 0.813rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1.5rem;
  border-top: 1px solid #E5E7EB;
}

.btn-cancel,
.btn-submit {
  padding: 0.875rem 2rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.938rem;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-cancel {
  background: #F3F4F6;
  color: #6B7280;
}

.btn-cancel:hover:not(:disabled) {
  background: #E5E7EB;
}

.btn-submit {
  background: linear-gradient(135deg, #F59E0B, #D97706);
  color: white;
  box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3);
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
}

.btn-cancel:disabled,
.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .editar-contato-page {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
    justify-content: center;
  }
}
</style>