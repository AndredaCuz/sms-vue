<template>
  <div class="fade-in">
    <!-- Header -->
    <div style="margin-bottom: 2rem;">
      <h1 class="page-title">Comprar Créditos SMS</h1>
      <p class="page-subtitle">Escolha o pacote ideal para suas necessidades</p>
    </div>

    <!-- Saldo -->
    <div class="card mb-4 saldo-card">
      <div class="card-body text-center">
        <div class="saldo-label">Seu Saldo Atual</div>
        <div class="saldo-valor">{{ saldo.toLocaleString('pt-AO') }}</div>
        <div>Créditos SMS Disponíveis</div>
      </div>
    </div>

    <!-- Pacotes -->
    <h3 style="margin-bottom: 1.5rem;">Escolha seu Pacote</h3>

    <div class="grid grid-3 mb-4">
      <div
        v-for="pacote in pacotes"
        :key="pacote.id"
        class="card pacote-card"
        :class="{ popular: pacote.popular }"
      >
        <div v-if="pacote.popular" class="badge-popular">Mais Popular</div>

        <div class="card-body text-center">
          <h3>{{ pacote.nome }}</h3>

          <div class="creditos">
            {{ pacote.creditos.toLocaleString('pt-AO') }}
          </div>

          <div class="preco">
            {{ pacote.preco.toLocaleString('pt-AO') }} Kz
          </div>

          <div v-if="pacote.economia > 0" class="badge badge-success">
            Economize {{ pacote.economia }}%
          </div>

          <button
            class="btn w-100"
            :class="pacote.popular ? 'btn-accent' : 'btn-primary'"
            @click="abrirModal(pacote)"
          >
            <i class="fas fa-shopping-cart"></i> Comprar Agora
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL -->
    <div v-if="mostrarModal" class="modal-backdrop" @click.self="fecharModal">
      <div class="card modal-card">
        <h3>Finalizar Compra</h3>

        <div class="resumo">
          <p><strong>Pacote:</strong> {{ pacoteSelecionado.nome }}</p>
          <p><strong>Créditos:</strong> {{ pacoteSelecionado.creditos }}</p>
          <p><strong>Valor:</strong> {{ pacoteSelecionado.preco }} Kz</p>
        </div>

        <form @submit.prevent="enviarSolicitacao">
          <input v-model="form.nome_empresa" placeholder="Nome da empresa" required />
          <input v-model="form.telefone" placeholder="Telefone" required />

          <select v-model="form.metodo" required>
            <option value="">Método de pagamento</option>
            <option value="transferencia">Transferência</option>
            <option value="multicaixa">Multicaixa</option>
            <option value="pix">PIX</option>
          </select>

          <input type="file" @change="handleFile" required />

          <textarea v-model="form.observacoes" placeholder="Observações"></textarea>

          <div class="acoes">
            <button type="button" class="btn btn-outline" @click="fecharModal">
              Cancelar
            </button>
            <button type="submit" class="btn btn-accent">
              Enviar Solicitação
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const saldo = ref(5420)

const pacotes = ref([
  { id: 1, nome: 'BALA', creditos: 100, preco: 1500, economia: 0, popular: false },
  { id: 2, nome: 'BÁSICO', creditos: 500, preco: 6500, economia: 13, popular: false },
  { id: 3, nome: 'CANDOGUIERO', creditos: 1000, preco: 12000, economia: 20, popular: true },
  { id: 4, nome: 'Premium', creditos: 2000, preco: 22000, economia: 27, popular: false },
  { id: 5, nome: 'DEV', creditos: 5000, preco: 50000, economia: 33, popular: false },
  { id: 6, nome: 'SUPER DEV', creditos: 10000, preco: 95000, economia: 37, popular: false },
])

const mostrarModal = ref(false)

const pacoteSelecionado = ref({
  id: null,
  nome: '',
  creditos: 0,
  preco: 0,
})

const form = ref({
  nome_empresa: '',
  telefone: '',
  metodo: '',
  comprovante: null,
  observacoes: '',
})

function abrirModal(pacote) {
  pacoteSelecionado.value = { ...pacote }
  mostrarModal.value = true
}

function fecharModal() {
  mostrarModal.value = false
  form.value = {
    nome_empresa: '',
    telefone: '',
    metodo: '',
    comprovante: null,
    observacoes: '',
  }
}

function handleFile(e) {
  form.value.comprovante = e.target.files[0]
}

function enviarSolicitacao() {
  alert('✅ Solicitação enviada com sucesso!')
  fecharModal()
}
</script>

<style scoped>
.saldo-card {
  background: linear-gradient(135deg, var(--accent), var(--accent-dark));
  color: white;
}

.saldo-label {
  letter-spacing: 2px;
  opacity: 0.9;
}

.saldo-valor {
  font-size: 3rem;
  font-weight: 700;
}

.pacote-card {
  transition: all 0.3s ease;
}
.pacote-card:hover {
  transform: translateY(-8px);
}

.popular {
  border: 3px solid var(--accent);
}

.badge-popular {
  background: var(--accent);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.6);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-card {
  width: 100%;
  max-width: 500px;
  padding: 2rem;
}

/* Animações do Modal */
@keyframes modalFadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

@keyframes modalSlideIn {
    from {
        transform: scale(0.9) translateY(20px);
        opacity: 0;
    }
    to {
        transform: scale(1) translateY(0);
        opacity: 1;
    }
}

#modalSolicitacao.show {
    opacity: 1 !important;
}

#modalSolicitacao.show .card {
    animation: modalSlideIn 0.3s ease forwards;
}

/* Hover nos inputs */
.form-control:focus {
    border-color: var(--accent) !important;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
    outline: none;
}

/* Hover no botão de fechar */
button[onclick="fecharModal()"]:hover {
    background: rgba(255,255,255,0.3) !important;
}

/* Hover no upload */
label[for="comprovante"]:hover {
    border-color: var(--accent);
    background: var(--accent-light);
}

/* Scrollbar personalizada */
#modalSolicitacao .card > div:nth-child(2)::-webkit-scrollbar {
    width: 8px;
}

#modalSolicitacao .card > div:nth-child(2)::-webkit-scrollbar-track {
    background: var(--gray-100);
    border-radius: 10px;
}

#modalSolicitacao .card > div:nth-child(2)::-webkit-scrollbar-thumb {
    background: var(--accent);
    border-radius: 10px;
}

#modalSolicitacao .card > div:nth-child(2)::-webkit-scrollbar-thumb:hover {
    background: var(--accent-dark);
}

/* Animação de loading no botão submit */
.btn-accent:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}
</style>
