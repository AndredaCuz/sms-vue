<template>
  <navegacao/>

  <div class="update-plan-page fade-in">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <router-link to="/lista_planos" class="btn-back">
          <i class="fas fa-arrow-left"></i>
        </router-link>
        <div class="header-text">
          <h1 class="page-title">
            <i class="fas fa-sync-alt"></i>
            Atualizar Plano
          </h1>
          <p class="page-subtitle">
            Atualize as informações do plano existente
          </p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Carregando dados do plano...</p>
    </div>

    <!-- Update Form -->
    <div v-else class="content-grid">
      <!-- COLUNA PRINCIPAL -->
      <div class="main-column">
        <form @submit.prevent="atualizarPlano">
          
          <!-- Informações Básicas -->
          <div class="card">
            <div class="card-header">
              <div class="card-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <i class="fas fa-info-circle"></i>
              </div>
              <h3 class="card-title">Informações Básicas</h3>
            </div>

            <div class="card-body">
              <div class="form-grid">
                <div class="form-group full-width">
                  <label class="form-label required">
                    <i class="fas fa-signature"></i> Nome do Plano
                  </label>
                  <input 
                    v-model="form.name" 
                    class="form-input" 
                    placeholder="Ex: Plano Premium, Plano Empresarial..." 
                    required 
                  />
                  <small class="form-hint">Nome que será exibido aos clientes</small>
                </div>

                <div class="form-group full-width">
                  <label class="form-label">
                    <i class="fas fa-tag"></i> Slug
                  </label>
                  <input 
                    v-model="form.slug" 
                    class="form-input" 
                    placeholder="Ex: premium, empresarial..." 
                  />
                  <small class="form-hint">Identificador único do plano (deixe vazio para gerar automaticamente)</small>
                </div>

                <div class="form-group full-width">
                  <label class="form-label">
                    <i class="fas fa-align-left"></i> Descrição
                  </label>
                  <textarea 
                    v-model="form.description" 
                    class="form-input" 
                    rows="3"
                    placeholder="Descreva os benefícios e características deste plano..."
                  ></textarea>
                  <small class="form-hint">Breve descrição do plano (opcional)</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Recursos e Limites -->
          <div class="card">
            <div class="card-header">
              <div class="card-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                <i class="fas fa-sliders-h"></i>
              </div>
              <h3 class="card-title">Recursos e Limites</h3>
            </div>

            <div class="card-body">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label required">
                    <i class="fas fa-sms"></i> Quantidade de SMS/Mês
                  </label>
                  <input 
                    type="number" 
                    v-model.number="form.sms_quantity" 
                    class="form-input" 
                    placeholder="0"
                    min="0"
                    step="1"
                    required 
                  />
                  <small class="form-hint">Total de SMS incluídos por mês</small>
                </div>

                <div class="form-group">
                  <label class="form-label required">
                    <i class="fas fa-dollar-sign"></i> Preço Mensal (Kz)
                  </label>
                  <input 
                    type="number" 
                    v-model.number="form.price_monthly" 
                    class="form-input" 
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required 
                  />
                  <small class="form-hint">Valor cobrado mensalmente</small>
                </div>

                <div class="form-group">
                  <label class="form-label required">
                    <i class="fas fa-users"></i> Máximo de Usuários
                  </label>
                  <input 
                    type="number" 
                    v-model.number="form.max_users" 
                    class="form-input" 
                    placeholder="0"
                    min="1"
                    step="1"
                    required 
                  />
                  <small class="form-hint">Número máximo de usuários permitidos</small>
                </div>

                <div class="form-group">
                  <label class="form-label required">
                    <i class="fas fa-address-book"></i> Máximo de Clientes
                  </label>
                  <input 
                    type="number" 
                    v-model.number="form.max_clients" 
                    class="form-input" 
                    placeholder="0"
                    min="1"
                    step="1"
                    required 
                  />
                  <small class="form-hint">Número máximo de clientes permitidos</small>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-sort-numeric-up"></i> Ordem de Exibição
                  </label>
                  <input 
                    type="number" 
                    v-model.number="form.sort_order" 
                    class="form-input" 
                    placeholder="0"
                    min="0"
                    step="1"
                  />
                  <small class="form-hint">Ordem em que o plano aparece na listagem</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Funcionalidades -->
          <div class="card">
            <div class="card-header">
              <div class="card-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                <i class="fas fa-check-circle"></i>
              </div>
              <h3 class="card-title">Funcionalidades Incluídas</h3>
            </div>

            <div class="card-body">
              <div class="features-editor">
                <div 
                  v-for="(feature, index) in featuresList" 
                  :key="index"
                  class="feature-item"
                >
                  <div class="feature-input-group">
                    <i class="fas fa-grip-vertical drag-handle"></i>
                    <input 
                      v-model="feature.text" 
                      class="form-input" 
                      placeholder="Ex: Envio de SMS em massa, Relatórios avançados..."
                    />
                    <button 
                      type="button"
                      class="btn-remove-feature"
                      @click="removeFeature(index)"
                      title="Remover funcionalidade"
                    >
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>

                <button 
                  type="button" 
                  class="btn-add-feature"
                  @click="addFeature"
                >
                  <i class="fas fa-plus"></i> Adicionar Funcionalidade
                </button>

                <small class="form-hint" style="display: block; margin-top: 0.75rem;">
                  <i class="fas fa-info-circle"></i>
                  Liste as funcionalidades e benefícios incluídos neste plano
                </small>
              </div>
            </div>
          </div>

          <!-- Status -->
          <div class="card">
            <div class="card-header">
              <div class="card-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                <i class="fas fa-toggle-on"></i>
              </div>
              <h3 class="card-title">Status do Plano</h3>
            </div>

            <div class="card-body">
              <div class="status-toggle">
                <label class="switch-label">
                  <input 
                    type="checkbox" 
                    v-model="form.is_active"
                    class="switch-input"
                  />
                  <span class="switch-slider"></span>
                  <span class="switch-text">
                    <span class="status-icon" :class="form.is_active ? 'active' : 'inactive'">
                      <i :class="form.is_active ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                    </span>
                    {{ form.is_active ? 'Plano Ativo' : 'Plano Inativo' }}
                  </span>
                </label>
                <small class="form-hint">
                  {{ form.is_active ? 'Este plano estará disponível para novas assinaturas' : 'Este plano não estará disponível para novas assinaturas' }}
                </small>
              </div>
            </div>
          </div>

          <!-- Botões de Ação -->
          <div class="form-actions">
            <router-link to="/lista_planos" class="btn btn-cancel">
              <i class="fas fa-times"></i> Cancelar
            </router-link>
            <button class="btn btn-save" type="submit" :disabled="isSubmitting">
              <i class="fas fa-spinner fa-spin" v-if="isSubmitting"></i>
              <i class="fas fa-sync-alt" v-else></i>
              {{ isSubmitting ? 'Atualizando...' : 'Atualizar Plano' }}
            </button>
          </div>
        </form>
      </div>

      <!-- COLUNA LATERAL -->
      <div class="sidebar-column">
        <!-- Preview do Plano -->
        <div class="card sticky-card">
          <div class="card-header">
            <div class="card-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
              <i class="fas fa-eye"></i>
            </div>
            <h3 class="card-title">Preview do Plano</h3>
          </div>

          <div class="card-body">
            <div class="plan-preview">
              <div class="plan-preview-header">
                <div class="plan-preview-icon">
                  <i class="fas fa-crown"></i>
                </div>
                <h4 class="plan-preview-name">{{ form.name || 'Nome do Plano' }}</h4>
                <p class="plan-preview-description">{{ form.description || 'Descrição do plano' }}</p>
              </div>

              <div class="plan-preview-price">
                <span class="price-currency">Kz</span>
                <span class="price-value">{{ formatPrice(form.price_monthly) }}</span>
                <span class="price-period">/mês</span>
              </div>

              <div class="plan-preview-features">
                <h5>Recursos incluídos:</h5>
                <ul>
                  <li>
                    <i class="fas fa-sms"></i>
                    <span>{{ form.sms_quantity || 0 }} SMS por mês</span>
                  </li>
                  <li>
                    <i class="fas fa-users"></i>
                    <span>Até {{ form.max_users || 0 }} usuários</span>
                  </li>
                  <li>
                    <i class="fas fa-address-book"></i>
                    <span>Até {{ form.max_clients || 0 }} clientes</span>
                  </li>
                  <li v-for="(feature, index) in featuresList.filter(f => f.text)" :key="'preview-' + index">
                    <i class="fas fa-check"></i>
                    <span>{{ feature.text }}</span>
                  </li>
                </ul>
              </div>

              <div class="plan-preview-status">
                <span class="status-badge" :class="form.is_active ? 'status-active' : 'status-inactive'">
                  <i class="fas fa-circle"></i>
                  {{ form.is_active ? 'Ativo' : 'Inativo' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Info do Plano -->
        <div class="card">
          <div class="card-header">
            <div class="card-icon" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);">
              <i class="fas fa-info-circle"></i>
            </div>
            <h3 class="card-title">Informações</h3>
          </div>

          <div class="card-body">
            <div class="info-list">
              <div class="info-item">
                <span class="info-label">ID do Plano:</span>
                <span class="info-value">#{{ $route.params.id }}</span>
              </div>
              <div class="info-item" v-if="originalData.created_at">
                <span class="info-label">Criado em:</span>
                <span class="info-value">{{ formatDate(originalData.created_at) }}</span>
              </div>
              <div class="info-item" v-if="originalData.updated_at">
                <span class="info-label">Última atualização:</span>
                <span class="info-value">{{ formatDate(originalData.updated_at) }}</span>
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
  name: 'AtualizarPlano',
  
  components: {
    navegacao
  },

  data() {
    return {
      isLoading: true,
      isSubmitting: false,
      
      form: {
        name: '',
        slug: '',
        description: '',
        sms_quantity: 0,
        price_monthly: 0,
        max_users: 1,
        max_clients: 100,
        features: [],
        is_active: true,
        sort_order: 0
      },

      originalData: {},

      featuresList: [
        { text: '' }
      ]
    };
  },

  methods: {
    async fetchPlano() {
      this.isLoading = true;
      const token = localStorage.getItem('auth_token');
      const planId = this.$route.params.id;

      console.log('🔍 Buscando plano ID:', planId);

      try {
        const response = await axios.get(
          `https://api.devsms.online/api/v1/admin/plans/${planId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            }
          }
        );

        const plano = response.data.data;
        this.originalData = plano;

        this.form = {
          name: plano.name,
          slug: plano.slug || '',
          description: plano.description || '',
          sms_quantity: plano.sms_quantity,
          price_monthly: parseFloat(plano.price_monthly),
          max_users: plano.max_users,
          max_clients: plano.max_clients,
          features: plano.features || [],
          is_active: plano.is_active === 1 || plano.is_active === true,
          sort_order: plano.sort_order || 0
        };

        // Carregar features
        if (plano.features && Array.isArray(plano.features)) {
          this.featuresList = plano.features.map(f => ({ text: f }));
        }

        if (this.featuresList.length === 0) {
          this.featuresList = [{ text: '' }];
        }

        console.log('✅ Plano carregado:', this.form);

      } catch (error) {
        console.error('❌ Erro ao buscar plano:', error);
        alert('Erro ao carregar dados do plano');
        this.$router.push('/lista_planos');
      } finally {
        this.isLoading = false;
      }
    },

    async atualizarPlano() {
      if (this.isSubmitting) return;

      // Validações
      if (!this.form.name.trim()) {
        alert('Por favor, informe o nome do plano.');
        return;
      }

      if (this.form.sms_quantity < 0) {
        alert('A quantidade de SMS não pode ser negativa.');
        return;
      }

      if (this.form.price_monthly < 0) {
        alert('O preço mensal não pode ser negativo.');
        return;
      }

      if (this.form.max_users < 1) {
        alert('O número máximo de usuários deve ser pelo menos 1.');
        return;
      }

      if (this.form.max_clients < 1) {
        alert('O número máximo de clientes deve ser pelo menos 1.');
        return;
      }

      this.isSubmitting = true;
      const token = localStorage.getItem('auth_token');
      const planId = this.$route.params.id;

      try {
        // Filtrar features vazias e preparar array
        const features = this.featuresList
          .map(f => f.text.trim())
          .filter(f => f.length > 0);

        const payload = {
          name: this.form.name.trim(),
          slug: this.form.slug.trim() || null,
          description: this.form.description.trim() || null,
          sms_quantity: parseInt(this.form.sms_quantity),
          price_monthly: parseFloat(this.form.price_monthly),
          max_users: parseInt(this.form.max_users),
          max_clients: parseInt(this.form.max_clients),
          features: features.length > 0 ? features : null,
          is_active: this.form.is_active ? 1 : 0,
          sort_order: parseInt(this.form.sort_order)
        };

        console.log('📤 Enviando atualização:', payload);

        const response = await axios.put(
          `https://api.devsms.online/api/v1/admin/plans/${planId}`,
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

        alert('✅ Plano atualizado com sucesso!');
        this.$router.push('/lista_planos');

      } catch (error) {
        console.error('❌ Erro ao atualizar plano:', error);
        console.error('❌ Detalhes:', error.response?.data);
        
        if (error.response?.status === 401 || error.response?.status === 403) {
          alert('Você não tem permissão para realizar esta ação.');
          localStorage.removeItem('auth_token');
          this.$router.push('/login');
        } else if (error.response?.data?.message) {
          alert('Erro: ' + error.response.data.message);
        } else if (error.response?.data?.errors) {
          const errors = Object.values(error.response.data.errors).flat();
          alert('Erros de validação:\n' + errors.join('\n'));
        } else {
          alert('Erro ao atualizar plano. Por favor, tente novamente.');
        }
      } finally {
        this.isSubmitting = false;
      }
    },

    addFeature() {
      this.featuresList.push({ text: '' });
    },

    removeFeature(index) {
      if (this.featuresList.length > 1) {
        this.featuresList.splice(index, 1);
      } else {
        alert('Deve haver pelo menos uma funcionalidade.');
      }
    },

    formatPrice(value) {
      if (!value || value === 0) return '0';
      return new Intl.NumberFormat('pt-AO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      }).format(value);
    },

    formatDate(dateString) {
      if (!dateString) return '-';
      
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('pt-AO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    }
  },

  mounted() {
    if (!this.$route.params.id) {
      alert('ID do plano não fornecido!');
      this.$router.push('/lista_planos');
      return;
    }
    
    this.fetchPlano();
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

.create-plan-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

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

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
}

/* Cards */
.card {
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
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
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

/* Features Editor */
.features-editor {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.feature-item {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feature-input-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.drag-handle {
  color: var(--gray-400);
  cursor: move;
  font-size: 1rem;
}

.btn-remove-feature {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: #fee2e2;
  color: var(--danger);
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-remove-feature:hover {
  background: var(--danger);
  color: white;
}

.btn-add-feature {
  padding: 0.75rem 1rem;
  border: 2px dashed var(--gray-300);
  background: transparent;
  color: var(--gray-600);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-add-feature:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: rgba(99, 102, 241, 0.05);
}

/* Status Toggle */
.status-toggle {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.switch-label {
  display: flex;
  align-items: center;
  gap: 1rem;
  cursor: pointer;
  position: relative;
}

.switch-input {
  position: absolute;
  opacity: 0;
}

.switch-slider {
  width: 52px;
  height: 28px;
  background: var(--gray-300);
  border-radius: 14px;
  position: relative;
  transition: all 0.3s;
}

.switch-slider::before {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
  background: white;
  border-radius: 50%;
  top: 3px;
  left: 3px;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.switch-input:checked + .switch-slider {
  background: var(--success);
}

.switch-input:checked + .switch-slider::before {
  transform: translateX(24px);
}

.switch-text {
  font-weight: 600;
  color: var(--gray-700);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.status-icon {
  font-size: 1.25rem;
}

.status-icon.active {
  color: var(--success);
}

.status-icon.inactive {
  color: var(--danger);
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
}

.btn {
  padding: 0.875rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  border: none;
}

.btn-cancel {
  background: var(--gray-100);
  color: var(--gray-700);
}

.btn-cancel:hover {
  background: var(--gray-200);
}

.btn-save {
  background: var(--primary);
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.3);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Preview */
.sticky-card {
  position: sticky;
  top: 2rem;
}

.plan-preview {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.plan-preview-header {
  text-align: center;
}

.plan-preview-icon {
  width: 60px;
  height: 60px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  color: white;
}

.plan-preview-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 0.5rem 0;
}

.plan-preview-description {
  font-size: 0.875rem;
  color: var(--gray-600);
  margin: 0;
  line-height: 1.5;
}

.plan-preview-price {
  text-align: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea20, #764ba220);
  border-radius: 12px;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.25rem;
}

.price-currency {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--gray-600);
}

.price-value {
  font-size: 3rem;
  font-weight: 700;
  color: var(--primary);
}

.price-period {
  font-size: 1rem;
  color: var(--gray-600);
}

.plan-preview-features h5 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--gray-700);
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.plan-preview-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.plan-preview-features li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.875rem;
  color: var(--gray-700);
}

.plan-preview-features li i {
  color: var(--success);
  font-size: 1rem;
  flex-shrink: 0;
}

.plan-preview-status {
  display: flex;
  justify-content: center;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-200);
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

.status-badge i {
  font-size: 0.625rem;
}

.status-active {
  background: #d1fae5;
  color: var(--success);
}

.status-inactive {
  background: #fee2e2;
  color: var(--danger);
}

/* Tips */
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
  font-size: 1.25rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.tip-item p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--gray-700);
  line-height: 1.5;
}

</style>