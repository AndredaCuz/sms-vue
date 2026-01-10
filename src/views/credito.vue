```vue
<template>
  <navegacao/>
  
  <div class="page-container fade-in">
    
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <div class="spinner"></div>
      <p>Carregando informações da assinatura...</p>
    </div>

    <div v-else>
      <!-- Card de Assinatura Atual -->
      <div class="subscription-card-premium">
        <div class="subscription-content">
          <div class="subscription-info">
            <div class="subscription-icon">
              <i class="fas fa-crown"></i>
            </div>
            <div>
              <div class="subscription-label">Sua Assinatura Atual</div>
              <div class="subscription-plan-name">{{ balanceData.plan_name || 'Nenhum Plano' }}</div>
              <div class="subscription-desc">
                <i class="fas fa-calendar-alt"></i>
                Renova em {{ Math.ceil(balanceData.days_until_renewal) }} dias
              </div>
              <div class="subscription-status">
                <span class="status-badge" :class="getStatusClass(balanceData.status)">
                  <i class="fas fa-circle"></i>
                  {{ getStatusText(balanceData.status) }}
                </span>
                <span v-if="!balanceData.can_send" class="warning-badge">
                  <i class="fas fa-exclamation-triangle"></i> Sem créditos
                </span>
              </div>
            </div>
          </div>
          <div class="subscription-actions-quick">
            <button class="btn-quick-action" @click="scrollToPlans">
              <i class="fas fa-arrow-up"></i> Fazer Upgrade
            </button>
            <button class="btn-quick-action secondary" @click="openAddCreditsModal">
              <i class="fas fa-plus-circle"></i> Adicionar Créditos
            </button>
            <button class="btn-quick-action tertiary" @click="openHistoryModal">
              <i class="fas fa-history"></i> Ver Histórico
            </button>
          </div>
        </div>
      </div>

      <!-- Stats da Assinatura -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon sms-icon">
            <i class="fas fa-sms"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ balanceData.sms_available?.toLocaleString('pt-AO') || 0 }}</div>
            <div class="stat-label">SMS Disponíveis</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon used-icon">
            <i class="fas fa-paper-plane"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ balanceData.sms_used?.toLocaleString('pt-AO') || 0 }}</div>
            <div class="stat-label">SMS Utilizados</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon total-icon">
            <i class="fas fa-inbox"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ balanceData.plan_total?.toLocaleString('pt-AO') || 0 }}</div>
            <div class="stat-label">Total do Plano</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon percentage-icon">
            <i class="fas fa-chart-pie"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ balanceData.usage_percentage || 0 }}%</div>
            <div class="stat-label">Uso do Plano</div>
          </div>
        </div>
      </div>

      <!-- Barra de Progresso -->
      <div class="progress-section">
        <div class="progress-header">
          <span>Uso de SMS</span>
          <span>{{ balanceData.sms_used }} / {{ balanceData.plan_total }}</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: Math.min(balanceData.usage_percentage, 100) + '%' }"
            :class="{ 'progress-danger': balanceData.usage_percentage > 80 }"
          ></div>
        </div>
      </div>

      <!-- Título dos Planos -->
      <div ref="plansSection" class="section-title">
        <h2>
          <i class="fas fa-box-open"></i>
          Planos Disponíveis
        </h2>
        <p>Escolha o melhor plano para seu negócio</p>
      </div>

      <!-- Grid de Planos -->
      <div class="plans-grid">
        <div
          v-for="plan in availablePlans"
          :key="plan.id"
          class="plan-card-premium"
          :class="{ 
            'plan-current': isCurrentPlan(plan),
            'plan-popular': isPlanPopular(plan)
          }"
        >
          <div v-if="isCurrentPlan(plan)" class="badge-current-premium">
            <i class="fas fa-check-circle"></i>
            Plano Atual
          </div>

          <div v-else-if="isPlanPopular(plan)" class="badge-popular-premium">
            <i class="fas fa-star"></i>
            Mais Popular
          </div>

          <div class="plan-header">
            <div class="plan-icon" :class="`plan-icon-${plan.id}`">
              <i :class="getPlanIcon(plan.slug)"></i>
            </div>
            <h3 class="plan-name">{{ plan.name }}</h3>
            <p class="plan-description">{{ plan.description }}</p>
          </div>

          <div class="plan-body">
            <div class="sms-info">
              <div class="sms-number">{{ formatQuantity(plan.sms_quantity) }}</div>
              <div class="sms-label">SMS Mensais</div>
            </div>

            <div class="price-info">
              <div class="price-value">{{ formatPrice(plan.price_monthly) }}</div>
              <div class="price-period">por mês</div>
            </div>

            <div class="features-list">
              <div class="feature-item">
                <i class="fas fa-users"></i>
                <span>{{ formatQuantity(plan.max_users) }} usuários</span>
              </div>
              <div class="feature-item">
                <i class="fas fa-address-book"></i>
                <span>{{ formatQuantity(plan.max_clients) }} clientes</span>
              </div>
              <div v-for="feature in plan.features" :key="feature" class="feature-item">
                <i class="fas fa-check-circle"></i>
                <span>{{ getFeatureText(feature) }}</span>
              </div>
            </div>

            <button 
              v-if="isCurrentPlan(plan)"
              class="btn-select-plan current-plan"
              @click="openRenewModal(plan)"
            >
              <i class="fas fa-sync"></i>
              Renovar Plano
            </button>
            <button 
              v-else-if="canUpgrade(plan)"
              class="btn-select-plan upgrade"
              @click="openUpgradeModal(plan)"
            >
              <i class="fas fa-arrow-up"></i>
              Fazer Upgrade
            </button>
            <button 
              v-else-if="canDowngrade(plan)"
              class="btn-select-plan downgrade"
              @click="openDowngradeModal(plan)"
            >
              <i class="fas fa-arrow-down"></i>
              Alterar Plano
            </button>
            <button 
              v-else
              class="btn-select-plan"
              @click="openSubscribeModal(plan)"
            >
              <i class="fas fa-shopping-cart"></i>
              Assinar Plano
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE RENOVAÇÃO -->
    <Transition name="modal">
      <div v-if="showRenewModal" class="modal-backdrop-premium" @click.self="closeRenewModal">
        <div class="modal-container-premium">
          
          <div class="modal-header-premium">
            <div>
              <h3 class="modal-title">Renovar Plano</h3>
              <p class="modal-subtitle">Renove sua assinatura e continue aproveitando</p>
            </div>
            <button class="btn-close-modal" @click="closeRenewModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="renew-plan-info">
              <div class="plan-info-card">
                <h4>{{ selectedPlan?.name }}</h4>
                <p>{{ formatQuantity(selectedPlan?.sms_quantity) }} SMS mensais</p>
                <div class="plan-price-large">{{ formatPrice(selectedPlan?.price_monthly) }}</div>
              </div>
            </div>

            <div class="payment-method-section">
              <label class="input-label">Método de Pagamento</label>
              <select v-model="paymentMethod" class="input-select">
                <option value="bank_transfer">Transferência Bancária</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="mobile_money">Mobile Money</option>
              </select>
            </div>

            <div class="payment-instructions">
              <div class="info-box">
                <i class="fas fa-info-circle"></i>
                <div>
                  <strong>Instruções de Pagamento</strong>
                  <p v-if="paymentMethod === 'bank_transfer'">
                    Após confirmar, você receberá os dados bancários para realizar a transferência.
                  </p>
                  <p v-else-if="paymentMethod === 'credit_card'">
                    Você será redirecionado para a página de pagamento seguro.
                  </p>
                  <p v-else>
                    Utilize o código USSD fornecido para completar o pagamento.
                  </p>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="closeRenewModal">
                <i class="fas fa-times"></i> Cancelar
              </button>
              <button 
                type="button" 
                class="btn-submit" 
                @click="confirmRenew"
                :disabled="isProcessing"
              >
                <i class="fas" :class="isProcessing ? 'fa-spinner fa-spin' : 'fa-check'"></i>
                {{ isProcessing ? 'Processando...' : 'Confirmar Renovação' }}
              </button>
            </div>
          </div>

        </div>
      </div>
    </Transition>

    <!-- MODAL DE ADICIONAR CRÉDITOS -->
    <Transition name="modal">
      <div v-if="showAddCreditsModal" class="modal-backdrop-premium" @click.self="closeAddCreditsModal">
        <div class="modal-container-premium">
          
          <div class="modal-header-premium">
            <div>
              <h3 class="modal-title">Adicionar Créditos</h3>
              <p class="modal-subtitle">Compre créditos adicionais de SMS</p>
            </div>
            <button class="btn-close-modal" @click="closeAddCreditsModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="credits-options">
              <button 
                v-for="option in creditOptions" 
                :key="option.value"
                class="credit-option"
                :class="{ active: creditsQuantity === option.value }"
                @click="creditsQuantity = option.value"
              >
                <div class="credit-amount">{{ option.label }}</div>
                <div class="credit-price">{{ formatPrice(option.price) }}</div>
              </button>
            </div>

            <div class="custom-quantity">
              <label class="input-label">Ou insira uma quantidade personalizada</label>
              <input 
                type="number" 
                v-model.number="creditsQuantity" 
                class="input-field"
                placeholder="Digite a quantidade"
                min="1"
              >
            </div>

            <div class="credits-description">
              <label class="input-label">Descrição (opcional)</label>
              <textarea 
                v-model="creditsDescription" 
                class="input-textarea"
                placeholder="Ex: Compra para campanha de natal"
                rows="3"
              ></textarea>
            </div>

            <div class="credits-summary">
              <div class="summary-row">
                <span>Quantidade:</span>
                <strong>{{ creditsQuantity.toLocaleString('pt-AO') }} SMS</strong>
              </div>
              <div class="summary-row total">
                <span>Total a Pagar:</span>
                <strong>{{ formatPrice(calculateCreditsPrice()) }}</strong>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="closeAddCreditsModal">
                <i class="fas fa-times"></i> Cancelar
              </button>
              <button 
                type="button" 
                class="btn-submit" 
                @click="confirmAddCredits"
                :disabled="isProcessing || creditsQuantity < 1"
              >
                <i class="fas" :class="isProcessing ? 'fa-spinner fa-spin' : 'fa-shopping-cart'"></i>
                {{ isProcessing ? 'Processando...' : 'Comprar Créditos' }}
              </button>
            </div>
          </div>

        </div>
      </div>
    </Transition>

    <!-- MODAL DE HISTÓRICO -->
    <Transition name="modal">
      <div v-if="showHistoryModal" class="modal-backdrop-premium" @click.self="closeHistoryModal">
        <div class="modal-container-premium modal-large">
          
          <div class="modal-header-premium">
            <div>
              <h3 class="modal-title">Histórico de Transações</h3>
              <p class="modal-subtitle">Veja todas as suas transações</p>
            </div>
            <button class="btn-close-modal" @click="closeHistoryModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <div v-if="isLoadingHistory" class="loading-container-small">
              <div class="spinner-small"></div>
              <p>Carregando histórico...</p>
            </div>

            <div v-else-if="transactionHistory.length === 0" class="empty-state">
              <i class="fas fa-inbox"></i>
              <p>Nenhuma transação encontrada</p>
            </div>

            <div v-else class="history-list">
              <div v-for="transaction in transactionHistory" :key="transaction.id" class="history-item">
                <div class="history-icon" :class="getTransactionIconClass(transaction.type)">
                  <i :class="getTransactionIcon(transaction.type)"></i>
                </div>
                <div class="history-content">
                  <div class="history-title">{{ transaction.description }}</div>
                  <div class="history-date">{{ formatDateTime(transaction.created_at) }}</div>
                </div>
                <div class="history-amount" :class="transaction.type">
                  {{ transaction.type === 'credit' ? '+' : '-' }}{{ transaction.quantity }} SMS
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-cancel full-width" @click="closeHistoryModal">
                <i class="fas fa-times"></i> Fechar
              </button>
            </div>
          </div>

        </div>
      </div>
    </Transition>

    <!-- MODAL DE CONFIRMAÇÃO GENÉRICO -->
    <Transition name="modal">
      <div v-if="showModal" class="modal-backdrop-premium" @click.self="closeModal">
        <div class="modal-container-premium">
          
          <div class="modal-header-premium">
            <div>
              <h3 class="modal-title">{{ modalTitle }}</h3>
              <p class="modal-subtitle">{{ modalSubtitle }}</p>
            </div>
            <button class="btn-close-modal" @click="closeModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="plan-comparison">
              <div class="comparison-item">
                <div class="comparison-label">Plano Atual</div>
                <div class="comparison-plan">
                  <div class="comparison-plan-name">{{ balanceData.plan_name }}</div>
                  <div class="comparison-plan-sms">{{ balanceData.plan_total }} SMS/mês</div>
                </div>
              </div>

              <div class="comparison-arrow">
                <i class="fas fa-arrow-right"></i>
              </div>

              <div class="comparison-item">
                <div class="comparison-label">Novo Plano</div>
                <div class="comparison-plan highlight">
                  <div class="comparison-plan-name">{{ selectedPlan?.name }}</div>
                  <div class="comparison-plan-sms">{{ formatQuantity(selectedPlan?.sms_quantity) }} SMS/mês</div>
                  <div class="comparison-plan-price">{{ formatPrice(selectedPlan?.price_monthly) }}/mês</div>
                </div>
              </div>
            </div>

            <div class="change-info">
              <div class="info-item">
                <i class="fas fa-calendar-alt"></i>
                <div>
                  <strong>Data de Vigência</strong>
                  <p>A mudança entrará em vigor imediatamente</p>
                </div>
              </div>
              <div class="info-item">
                <i class="fas fa-credit-card"></i>
                <div>
                  <strong>Próxima Renovação</strong>
                  <p>Em {{ Math.ceil(balanceData.days_until_renewal) }} dias</p>
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="closeModal">
                <i class="fas fa-times"></i> Cancelar
              </button>
              <button 
                type="button" 
                class="btn-submit" 
                @click="confirmChange"
                :disabled="isProcessing"
              >
                <i class="fas" :class="isProcessing ? 'fa-spinner fa-spin' : 'fa-check'"></i>
                {{ isProcessing ? 'Processando...' : 'Confirmar Mudança' }}
              </button>
            </div>
          </div>

        </div>
      </div>
    </Transition>

    <!-- TOAST -->
    <Transition name="toast">
      <div v-if="showToast" :class="['toast-notification', toastType]">
        <i class="fas" :class="toastType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'"></i>
        <div>
          <strong>{{ toastTitle }}</strong>
          <p>{{ toastMessage }}</p>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script>
import axios from 'axios';
import navegacao from '../components/navegacao.vue';

export default {
  name: 'SubscriptionManagement',
  components: {
    navegacao
  },
  data() {
    return {
      isLoading: true,
      isProcessing: false,
      isLoadingHistory: false,
      showModal: false,
      showRenewModal: false,
      showAddCreditsModal: false,
      showHistoryModal: false,
      showToast: false,
      toastType: 'success',
      toastTitle: '',
      toastMessage: '',
      modalTitle: '',
      modalSubtitle: '',
      actionType: '',
      paymentMethod: 'bank_transfer',
      creditsQuantity: 100,
      creditsDescription: '',
      balanceData: {
        sms_available: 0,
        sms_used: 0,
        plan_name: '',
        plan_total: 0,
        usage_percentage: 0,
        days_until_renewal: 0,
        status: 'inactive',
        can_send: false
      },
      availablePlans: [],
      selectedPlan: null,
      transactionHistory: [],
      creditOptions: [
        { label: '100 SMS', value: 100, price: 5000 },
        { label: '500 SMS', value: 500, price: 20000 },
        { label: '1000 SMS', value: 1000, price: 35000 },
        { label: '5000 SMS', value: 5000, price: 150000 }
      ]
    };
  },
  methods: {
    async initData() {
      this.isLoading = true;
      try {
        await this.fetchBalance();
        await this.fetchPlans();
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        if (error.response?.status === 401) {
          localStorage.removeItem('auth_token');
          this.$router.push('/login');
        }
      } finally {
        this.isLoading = false;
      }
    },

    async fetchBalance() {
      const token = localStorage.getItem('auth_token');

      const response = await axios.get('https://api.devsms.online/api/v1/subscription/balance', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      this.balanceData = response.data.data;
    },

    async fetchPlans() {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get('https://api.devsms.online/api/v1/plans', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      this.availablePlans = response.data.data.filter(plan => plan.is_active);
    },

    async fetchHistory() {
      this.isLoadingHistory = true;
      
      try {
        // Mock data - substituir pela API real quando disponível
        this.transactionHistory = [
          {
            id: 1,
            type: 'credit',
            description: 'Renovação de plano',
            quantity: 1000,
            created_at: '2025-01-05T10:30:00'
          },
          {
            id: 2,
            type: 'debit',
            description: 'Envio de SMS - Campanha',
            quantity: 150,
            created_at: '2025-01-08T14:20:00'
          }
        ];
      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
      } finally {
        this.isLoadingHistory = false;
      }
    },

    async confirmRenew() {
      this.isProcessing = true;

      try {
        const token = localStorage.getItem('auth_token');
        
        await axios.post('https://api.devsms.online/api/v1/subscription/renew', {
          plan_id: this.selectedPlan.id,
          payment_method: this.paymentMethod
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        this.showToastNotification('success', 'Sucesso!', 'Renovação iniciada com sucesso');
        this.closeRenewModal();
        await this.fetchBalance();

      } catch (error) {
        console.error('Erro ao renovar:', error);
        this.showToastNotification('error', 'Erro', error.response?.data?.message || 'Não foi possível processar a renovação');
      } finally {
        this.isProcessing = false;
      }
    },

    async confirmAddCredits() {
      this.isProcessing = true;

      try {
        const token = localStorage.getItem('auth_token');
        
        await axios.post('https://api.devsms.online/api/v1/subscription/add-credits', {
          quantity: this.creditsQuantity,
          description: this.creditsDescription || 'Compra adicional de créditos'
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        this.showToastNotification('success', 'Sucesso!', `${this.creditsQuantity} créditos adicionados`);
        this.closeAddCreditsModal();
        await this.fetchBalance();

      } catch (error) {
        console.error('Erro ao adicionar créditos:', error);
        this.showToastNotification('error', 'Erro', error.response?.data?.message || 'Não foi possível adicionar créditos');
      } finally {
        this.isProcessing = false;
      }
    },

    async confirmChange() {
      this.isProcessing = true;

      try {
        const token = localStorage.getItem('auth_token');
        
        await axios.put('https://api.devsms.online/api/v1/subscription/change-plan', {
          plan_id: this.selectedPlan.id
        }, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        this.showToastNotification('success', 'Sucesso!', 'Plano alterado com sucesso');
        this.closeModal();
        await this.fetchBalance();

      } catch (error) {
        console.error('Erro ao mudar plano:', error);
        this.showToastNotification('error', 'Erro', 'Não foi possível alterar o plano');
      } finally {
        this.isProcessing = false;
      }
    },

    openRenewModal(plan) {
      this.selectedPlan = plan;
      this.showRenewModal = true;
    },

    closeRenewModal() {
      this.showRenewModal = false;
      this.selectedPlan = null;
      this.paymentMethod = 'bank_transfer';
    },

    openAddCreditsModal() {
      this.creditsQuantity = 100;
      this.creditsDescription = '';
      this.showAddCreditsModal = true;
    },

    closeAddCreditsModal() {
      this.showAddCreditsModal = false;
    },

    openHistoryModal() {
      this.showHistoryModal = true;
      this.fetchHistory();
    },

    closeHistoryModal() {
      this.showHistoryModal = false;
    },

    openUpgradeModal(plan) {
      this.selectedPlan = plan;
      this.actionType = 'upgrade';
      this.modalTitle = 'Fazer Upgrade de Plano';
      this.modalSubtitle = 'Melhore sua experiência com mais recursos';
      this.showModal = true;
    },

    openDowngradeModal(plan) {
      this.selectedPlan = plan;
      this.actionType = 'downgrade';
      this.modalTitle = 'Alterar Plano';
      this.modalSubtitle = 'Confirme a mudança para o novo plano';
      this.showModal = true;
    },

    openSubscribeModal(plan) {
      this.selectedPlan = plan;
      this.actionType = 'subscribe';
      this.modalTitle = 'Assinar Novo Plano';
      this.modalSubtitle = 'Comece a usar nossos serviços agora';
      this.showModal = true;
    },

    closeModal() {
      this.showModal = false;
      this.selectedPlan = null;
      this.actionType = '';
    },

    showToastNotification(type, title, message) {
      this.toastType = type;
      this.toastTitle = title;
      this.toastMessage = message;
      this.showToast = true;
      setTimeout(() => {
        this.showToast = false;
      }, 3000);
    },

    scrollToPlans() {
      this.$refs.plansSection?.scrollIntoView({ behavior: 'smooth' });
    },

    isCurrentPlan(plan) {
      return this.balanceData.plan_name === plan.name;
    },

    isPlanPopular(plan) {
      return plan.slug === 'profissional';
    },

    canUpgrade(plan) {
      const currentPlan = this.availablePlans.find(p => p.name === this.balanceData.plan_name);
      if (!currentPlan) return true;
      return plan.sort_order > currentPlan.sort_order;
    },

    canDowngrade(plan) {
      const currentPlan = this.availablePlans.find(p => p.name === this.balanceData.plan_name);
      if (!currentPlan) return false;
      return plan.sort_order < currentPlan.sort_order;
    },

    calculateCreditsPrice() {
      return this.creditsQuantity * 50;
    },

    formatDate(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-AO', { 
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
    },

    formatDateTime(dateString) {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleString('pt-AO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },


    formatPrice(price) {
      if (!price) return 'Grátis';
      return new Intl.NumberFormat('pt-AO', {
        style: 'currency',
        currency: 'AOA',
        minimumFractionDigits: 0
      }).format(price);
    },

    formatQuantity(quantity) {
      if (quantity === -1 || quantity === null) return 'Ilimitado';
      return quantity.toLocaleString('pt-AO');
    },

    getPlanIcon(slug) {
      const icons = {
        'teste': 'fas fa-vial',
        'basico': 'fas fa-rocket',
        'profissional': 'fas fa-briefcase',
        'premium-plus': 'fas fa-gem',
        'enterprise': 'fas fa-building'
      };
      return icons[slug] || 'fas fa-crown';
    },

    getFeatureText(feature) {
      const features = {
        'basic_reports': 'Relatórios Básicos',
        'advanced_reports': 'Relatórios Avançados',
        'email_support': 'Suporte por Email',
        'priority_support': 'Suporte Prioritário',
        'dedicated_support': 'Suporte Dedicado',
        'api_access': 'Acesso à API',
        'scheduling': 'Agendamento de SMS',
        'templates': 'Templates de Mensagens',
        'white_label': 'White Label',
        'custom_integration': 'Integrações Personalizadas',
        'automated_events': 'Eventos Automatizados',
        'all_features': 'Todos os Recursos'
      };
      return features[feature] || feature;
    },

    getStatusClass(status) {
      const classes = {
        'active': 'status-active',
        'inactive': 'status-inactive',
        'expired': 'status-expired',
        'cancelled': 'status-cancelled'
      };
      return classes[status] || 'status-inactive';
    },

    getStatusText(status) {
      const texts = {
        'active': 'Ativo',
        'inactive': 'Inativo',
        'expired': 'Expirado',
        'cancelled': 'Cancelado'
      };
      return texts[status] || status;
    },

    getTransactionIcon(type) {
      return type === 'credit' ? 'fas fa-plus-circle' : 'fas fa-minus-circle';
    },

    getTransactionIconClass(type) {
      return type === 'credit' ? 'icon-credit' : 'icon-debit';
    }
  },
  mounted() {
    this.initData();
  }
};
</script>

<style scoped>
/* ... (CSS continua igual ao anterior) ... */
.page-container { 
  padding: 2rem; 
  max-width: 1400px; 
  margin: 0 auto; 
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.subscription-card-premium {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  border-radius: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
  color: white;
}

.subscription-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  flex-wrap: wrap;
}

.subscription-info {
  display: flex;
  gap: 1.5rem;
  flex: 1;
  min-width: 300px;
}

.subscription-icon {
  width: 70px;
  height: 70px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
}

.subscription-label {
  font-size: 0.875rem;
  opacity: 0.9;
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.subscription-plan-name {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
}

.subscription-desc {
  font-size: 1rem;
  opacity: 0.9;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.subscription-status {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-active {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.status-inactive, .status-expired, .status-cancelled {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.status-badge i {
  font-size: 0.5rem;
}

.auto-renew-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.subscription-actions-quick {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.btn-quick-action {
  padding: 0.75rem 1.5rem;
  border: 2px solid white;
  background: white;
  color: #667eea;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  white-space: nowrap;
}

.btn-quick-action:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-quick-action.secondary {
  background: transparent;
  color: white;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
}

.sms-icon { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.used-icon { background: linear-gradient(135deg, #f59e0b, #d97706); }
.billing-icon { background: linear-gradient(135deg, #10b981, #059669); }
.price-icon { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.section-title {
  text-align: center;
  margin-bottom: 2.5rem;
}

.section-title h2 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: #1f2937;
}

.section-title p {
  color: #6b7280;
  font-size: 1rem;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.plan-card-premium {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.4s;
  position: relative;
  border: 2px solid transparent;
}

.plan-card-premium:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.plan-current {
  border-color: #10b981;
  box-shadow: 0 8px 25px rgba(16, 185, 129, 0.3);
}

.plan-popular {
  border-color: #8b5cf6;
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
}

.badge-current-premium,
.badge-popular-premium {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  color: white;
  z-index: 1;
}

.badge-current-premium {
  background: linear-gradient(135deg, #10b981, #059669);
}

.badge-popular-premium {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.plan-header {
  padding: 2rem 2rem 1rem;
  text-align: center;
}

.plan-icon {
  width: 70px;
  height: 70px;
  margin: 0 auto 1rem;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  color: white;
}

.plan-icon-1 { background: linear-gradient(135deg, #6b7280, #4b5563); }
.plan-icon-2 { background: linear-gradient(135deg, #3b82f6, #2563eb); }
.plan-icon-3 { background: linear-gradient(135deg, #f59e0b, #d97706); }
.plan-icon-4 { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
.plan-icon-5 { background: linear-gradient(135deg, #10b981, #059669); }

.plan-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #1f2937;
}

.plan-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.plan-body {
  padding: 1.5rem 2rem 2rem;
}

.sms-info {
  text-align: center;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  border-radius: 12px;
}

.sms-number {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.sms-label {
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.price-info {
  text-align: center;
  margin-bottom: 1.5rem;
}

.price-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
}

.price-period {
  font-size: 0.875rem;
  color: #6b7280;
}

.features-list {
  margin-bottom: 1.5rem;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  color: #4b5563;
  font-size: 0.9rem;
}

.feature-item i {
  color: #10b981;
  font-size: 1rem;
  flex-shrink: 0;
}

.btn-select-plan {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-select-plan:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.btn-select-plan.current {
  background: #e5e7eb;
  color: #6b7280;
  cursor: not-allowed;
}

.btn-select-plan.upgrade {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.btn-select-plan.downgrade {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.btn-select-plan:not(.current):not(.upgrade):not(.downgrade) {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

/* MODAL STYLES */
.modal-backdrop-premium {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container-premium {
  background: white;
  border-radius: 20px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header-premium {
  padding: 2rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.modal-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.btn-close-modal {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.btn-close-modal:hover {
  background: #e5e7eb;
  color: #1f2937;
}

.modal-body {
  padding: 2rem;
}

.plan-comparison {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1.5rem;
  align-items: center;
  margin-bottom: 2rem;
}

.comparison-item {
  text-align: center;
}

.comparison-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.75rem;
}

.comparison-plan {
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
}

.comparison-plan.highlight {
  background: linear-gradient(135deg, #667eea10, #764ba210);
  border-color: #667eea;
}

.comparison-plan-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.comparison-plan-sms {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.comparison-plan-price {
  font-size: 1rem;
  font-weight: 600;
  color: #667eea;
}

.comparison-arrow {
  font-size: 1.5rem;
  color: #667eea;
}

.change-info {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.info-item {
  display: flex;
  gap: 1rem;
  padding: 1rem 0;
}

.info-item:not(:last-child) {
  border-bottom: 1px solid #e5e7eb;
}

.info-item i {
  font-size: 1.5rem;
  color: #667eea;
  width: 30px;
  text-align: center;
}

.info-item strong {
  display: block;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.info-item p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 1rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-cancel {
  background: #f3f4f6;
  color: #6b7280;
}

.btn-cancel:hover {
  background: #e5e7eb;
}

.btn-submit {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* TOAST NOTIFICATION */
.toast-notification {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  max-width: 400px;
  z-index: 2000;
}

.toast-notification i {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.toast-notification.success {
  border-left: 4px solid #10b981;
}

.toast-notification.success i {
  color: #10b981;
}

.toast-notification.error {
  border-left: 4px solid #ef4444;
}

.toast-notification.error i {
  color: #ef4444;
}

.toast-notification strong {
  display: block;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.toast-notification p {
  margin: 0;
  color: #6b7280;
  font-size: 0.875rem;
}

/* TRANSITIONS */
.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container-premium,
.modal-leave-active .modal-container-premium {
  transition: transform 0.3s;
}

.modal-enter-from .modal-container-premium,
.modal-leave-to .modal-container-premium {
  transform: scale(0.9);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s;
}

.toast-enter-from,
.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .page-container {
    padding: 1rem;
  }

  .subscription-content {
    flex-direction: column;
  }

  .subscription-plan-name {
    font-size: 2rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .plans-grid {
    grid-template-columns: 1fr;
  }

  .plan-comparison {
    grid-template-columns: 1fr;
  }

  .comparison-arrow {
    transform: rotate(90deg);
  }

  .modal-actions {
    flex-direction: column;
  }

  .toast-notification {
    right: 1rem;
    left: 1rem;
    max-width: none;
  }
}

/* Novos estilos adicionais */
.btn-quick-action.tertiary {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  border-color: white;
}

.total-icon { background: linear-gradient(135deg, #ec4899, #db2777); }
.percentage-icon { background: linear-gradient(135deg, #06b6d4, #0891b2); }

.progress-section {
  background: white;
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 3rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
}

.progress-bar {
  width: 100%;
  height: 12px;
  background: #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  border-radius: 10px;
  transition: width 0.5s ease;
}

.progress-fill.progress-danger {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.warning-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(245, 158, 11, 0.2);
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #f59e0b;
}

.btn-select-plan.current-plan {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  cursor: pointer;
}

.renew-plan-info {
  margin-bottom: 2rem;
}

.plan-info-card {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 2rem;
  border-radius: 15px;
  text-align: center;
}

.plan-info-card h4 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
}

.plan-info-card p {
  margin: 0 0 1rem 0;
  opacity: 0.9;
}

.plan-price-large {
  font-size: 2.5rem;
  font-weight: 800;
}

.payment-method-section {
  margin-bottom: 1.5rem;
}

.input-label {
  display: block;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.input-select,
.input-field,
.input-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s;
}

.input-select:focus,
.input-field:focus,
.input-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.payment-instructions {
  margin-bottom: 2rem;
}

.info-box {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
  border-radius: 10px;
}

.info-box i {
  color: #3b82f6;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.info-box strong {
  display: block;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.info-box p {
  margin: 0;
  color: #4b5563;
  font-size: 0.875rem;
}

.credits-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.credit-option {
  padding: 1.5rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.credit-option:hover {
  border-color: #667eea;
  transform: translateY(-2px);
}

.credit-option.active {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea10, #764ba210);
}

.credit-amount {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.credit-price {
  font-size: 0.875rem;
  color: #667eea;
  font-weight: 600;
}

.custom-quantity {
  margin-bottom: 1.5rem;
}

.credits-description {
  margin-bottom: 1.5rem;
}

.credits-summary {
  background: #f9fafb;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  color: #4b5563;
}

.summary-row.total {
  border-top: 2px solid #e5e7eb;
  margin-top: 0.5rem;
  padding-top: 1rem;
  font-size: 1.125rem;
}

.summary-row strong {
  color: #1f2937;
  font-weight: 700;
}

.modal-large {
  max-width: 800px;
}

.loading-container-small {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  gap: 1rem;
}

.spinner-small {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6b7280;
}

.empty-state i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.history-list {
  max-height: 500px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  transition: background 0.3s;
}

.history-item:hover {
  background: #f9fafb;
}

.history-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
}

.icon-credit {
  background: linear-gradient(135deg, #10b981, #059669);
}

.icon-debit {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.history-content {
  flex: 1;
}

.history-title {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.history-date {
  font-size: 0.875rem;
  color: #6b7280;
}

.history-amount {
  font-weight: 700;
  font-size: 1.125rem;
  white-space: nowrap;
}

.history-amount.credit {
  color: #10b981;
}

.history-amount.debit {
  color: #f59e0b;
}

.full-width {
  width: 100%;
}

@media (max-width: 768px) {
  .credits-options {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .history-item {
    flex-wrap: wrap;
  }
  
  .history-amount {
    width: 100%;
    text-align: right;
    margin-top: 0.5rem;
  }
}
</style>