<template>
  <navegacao/>
  
  <div class="page-container fade-in">
    
    <!-- Header Premium -->
    

    <!-- Card de Saldo Premium -->
    <div class="saldo-card-premium">
      <div class="saldo-content">
        <div class="saldo-info">
          <div class="saldo-icon">
            <i class="fas fa-wallet"></i>
          </div>
          <div>
            <div class="saldo-label">Seu Saldo Atual</div>
            <div class="saldo-valor">{{ saldo.toLocaleString('pt-AO') }}</div>
            <div class="saldo-desc">
              <i class="fas fa-sms"></i>
              Créditos SMS Disponíveis
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Título dos Pacotes -->
    <div class="section-title">
      <h2>
        <i class="fas fa-box-open"></i>
        Escolha seu Pacote
      </h2>
      <p>Ofertas especiais com até 37% de economia</p>
    </div>

    <!-- Grid de Pacotes Premium -->
    <div class="pacotes-grid">
      <div
        v-for="pacote in pacotes"
        :key="pacote.id"
        class="pacote-card-premium"
        :class="{ 'pacote-popular': pacote.popular }"
      >
        <div v-if="pacote.popular" class="badge-popular-premium">
          <i class="fas fa-star"></i>
          Mais Popular
        </div>

        <div class="pacote-header">
          <div class="pacote-icon" :class="`pacote-icon-${pacote.id}`">
            <i :class="getPacoteIcon(pacote.id)"></i>
          </div>
          <h3 class="pacote-nome">{{ pacote.nome }}</h3>
        </div>

        <div class="pacote-body">
          <div class="creditos-info">
            <div class="creditos-numero">{{ pacote.creditos.toLocaleString('pt-AO') }}</div>
            <div class="creditos-label">Créditos SMS</div>
          </div>

          <div class="preco-info">
            <div class="preco-valor">
              {{ pacote.preco.toLocaleString('pt-AO') }}
              <span class="preco-moeda">Kz</span>
            </div>
          </div>

          <div v-if="pacote.economia > 0" class="economia-badge">
            <i class="fas fa-piggy-bank"></i>
            Economize {{ pacote.economia }}%
          </div>

          <button class="btn-comprar" @click="abrirModal(pacote)">
            <i class="fas fa-shopping-cart"></i>
            Comprar Agora
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL PREMIUM -->
    <Transition name="modal">
      <div v-if="mostrarModal" class="modal-backdrop-premium" @click.self="fecharModal">
        <div class="modal-container-premium">
          
          <div class="modal-header-premium">
            <div>
              <h3 class="modal-title">Finalizar Compra</h3>
              <p class="modal-subtitle">Complete as informações abaixo</p>
            </div>
            <button class="btn-close-modal" @click="fecharModal">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="resumo-compra">
            <div class="resumo-header">
              <i class="fas fa-receipt"></i>
              Resumo do Pedido
            </div>
            <div class="resumo-body">
              <div class="resumo-item">
                <span>Pacote:</span>
                <span class="bold">{{ pacoteSelecionado.nome }}</span>
              </div>
              <div class="resumo-item">
                <span>Créditos:</span>
                <span class="highlight">{{ pacoteSelecionado.creditos?.toLocaleString('pt-AO') }} SMS</span>
              </div>
              <div class="resumo-item resumo-total">
                <span>Valor Total:</span>
                <span class="total">{{ pacoteSelecionado.preco?.toLocaleString('pt-AO') }} Kz</span>
              </div>
            </div>
          </div>

          <form @submit.prevent="enviarSolicitacao" class="modal-form">
            
            <div class="form-group-modal">
              <label><i class="fas fa-building"></i> Nome da Empresa *</label>
              <input v-model="form.nome_empresa" placeholder="Digite o nome da sua empresa" required />
            </div>

            <div class="form-group-modal">
              <label><i class="fas fa-phone"></i> Telefone de Contato *</label>
              <input v-model="form.telefone" placeholder="+244 923 456 789" @input="mascaraTelefone" required />
            </div>

            <div class="form-group-modal">
              <label><i class="fas fa-wallet"></i> Método de Pagamento *</label>
              <select v-model="form.metodo" required>
                <option value="">Escolha uma opção...</option>
                <option value="transferencia">💳 Transferência Bancária</option>
                <option value="multicaixa">🏧 Multicaixa Express</option>
                <option value="pix">📱 PIX</option>
              </select>
            </div>

            <div class="form-group-modal">
              <label><i class="fas fa-file-upload"></i> Comprovante de Pagamento *</label>
              <div class="file-upload-area" :class="{ 'file-uploaded': form.comprovante }">
                <input type="file" id="fileInput" @change="handleFile" accept="image/*,.pdf" required hidden />
                <label for="fileInput" class="file-upload-label">
                  <div v-if="!form.comprovante" class="file-placeholder">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <span>Clique para fazer upload</span>
                    <small>PNG, JPG ou PDF até 5MB</small>
                  </div>
                  <div v-else class="file-info">
                    <i class="fas fa-file-check"></i>
                    <span>{{ form.comprovante.name }}</span>
                    <button type="button" @click.prevent="removerArquivo" class="btn-remove">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </label>
              </div>
            </div>

            <div class="form-group-modal">
              <label><i class="fas fa-comment-dots"></i> Observações</label>
              <textarea v-model="form.observacoes" rows="3" placeholder="Informações adicionais..."></textarea>
            </div>

            <div class="modal-actions">
              <button type="button" class="btn-cancel" @click="fecharModal">
                <i class="fas fa-times"></i> Cancelar
              </button>
              <button type="submit" class="btn-submit" :disabled="enviando">
                <i class="fas" :class="enviando ? 'fa-spinner fa-spin' : 'fa-paper-plane'"></i>
                {{ enviando ? 'Enviando...' : 'Enviar' }}
              </button>
            </div>
          </form>

        </div>
      </div>
    </Transition>

    <Transition name="toast">
      <div v-if="mostrarToast" class="toast-success">
        <i class="fas fa-check-circle"></i>
        <div>
          <strong>Solicitação Enviada!</strong>
          <p>Entraremos em contato em breve</p>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import navegacao from '../components/navegacao.vue'

const saldo = ref(5420)
const mostrarModal = ref(false)
const mostrarToast = ref(false)
const enviando = ref(false)

const pacotes = ref([
  { id: 1, nome: 'BALA', creditos: 100, preco: 1500, economia: 0, popular: false },
  { id: 2, nome: 'BÁSICO', creditos: 500, preco: 6500, economia: 13, popular: false },
  { id: 3, nome: 'CANDOGUIERO', creditos: 1000, preco: 12000, economia: 20, popular: true },
  { id: 4, nome: 'PREMIUM', creditos: 2000, preco: 22000, economia: 27, popular: false },
  { id: 5, nome: 'DEV', creditos: 5000, preco: 50000, economia: 33, popular: false },
  { id: 6, nome: 'SUPER DEV', creditos: 10000, preco: 95000, economia: 37, popular: false },
])

const pacoteSelecionado = ref({ id: null, nome: '', creditos: 0, preco: 0 })
const form = ref({ nome_empresa: '', telefone: '', metodo: '', comprovante: null, observacoes: '' })

function getPacoteIcon(id) {
  const icons = ['fas fa-box', 'fas fa-cubes', 'fas fa-crown', 'fas fa-gem', 'fas fa-rocket', 'fas fa-space-shuttle']
  return icons[id - 1] || 'fas fa-box'
}

function abrirModal(pacote) {
  pacoteSelecionado.value = { ...pacote }
  mostrarModal.value = true
  document.body.style.overflow = 'hidden'
}

function fecharModal() {
  mostrarModal.value = false
  document.body.style.overflow = 'auto'
  setTimeout(() => {
    form.value = { nome_empresa: '', telefone: '', metodo: '', comprovante: null, observacoes: '' }
  }, 300)
}

function handleFile(e) {
  const file = e.target.files[0]
  if (file && file.size <= 5 * 1024 * 1024) {
    form.value.comprovante = file
  } else {
    alert('O arquivo deve ter no máximo 5MB')
  }
}

function removerArquivo() {
  form.value.comprovante = null
  document.getElementById('fileInput').value = ''
}

function mascaraTelefone() {
  let valor = form.value.telefone.replace(/\D/g, '')
  if (valor.startsWith('244')) valor = valor.substring(3)
  if (valor.length > 0) {
    valor = valor.match(/.{1,3}/g)?.join(' ')
    form.value.telefone = '+244 ' + valor
  } else {
    form.value.telefone = ''
  }
}

async function enviarSolicitacao() {
  enviando.value = true
  await new Promise(resolve => setTimeout(resolve, 2000))
  enviando.value = false
  fecharModal()
  mostrarToast.value = true
  setTimeout(() => mostrarToast.value = false, 3000)
  saldo.value += pacoteSelecionado.value.creditos
}
</script>

<style scoped>
.page-container { padding: 2rem; max-width: 1400px; margin: 0 auto; }


.header-content { display: flex; align-items: center; gap: 1.5rem; }
.header-icon {
  width: 60px; height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.75rem;
}

.page-title-premium { font-size: 2rem; font-weight: 700; margin: 0; }
.page-subtitle-premium { font-size: 0.95rem; opacity: 0.95; margin: 0.5rem 0 0 0; }

.saldo-card-premium {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  border-radius: 20px;
  margin-bottom: 3rem;
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
}

.saldo-content { color: white; }
.saldo-info { display: flex; align-items: center; gap: 1.5rem; }
.saldo-icon {
  width: 70px; height: 70px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  display: flex; align-items: center; justify-content: center;
  font-size: 2rem;
}

.saldo-label { font-size: 0.875rem; opacity: 0.9; letter-spacing: 1px; text-transform: uppercase; }
.saldo-valor { font-size: 3.5rem; font-weight: 800; line-height: 1; margin: 0.5rem 0; }
.saldo-desc { font-size: 0.95rem; opacity: 0.9; }

.section-title { text-align: center; margin-bottom: 2.5rem; }
.section-title h2 {
  font-size: 2rem; font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex; align-items: center; justify-content: center; gap: 0.75rem;
}

.pacotes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.pacote-card-premium {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.4s;
  position: relative;
  border: 2px solid transparent;
}

.pacote-card-premium:hover {
  transform: translateY(-10px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.pacote-popular {
  border-color: #8b5cf6;
  box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
}

.badge-popular-premium {
  position: absolute; top: 1rem; right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.75rem; font-weight: 600;
  display: flex; align-items: center; gap: 0.375rem;
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
  color: white;
}

.pacote-header { padding: 2rem 2rem 1rem; text-align: center; }
.pacote-icon {
  width: 70px; height: 70px;
  margin: 0 auto 1rem;
  border-radius: 15px;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.75rem;
  color: white;
}

.pacote-icon-1 { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.pacote-icon-2 { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.pacote-icon-3 { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.pacote-icon-4 { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
.pacote-icon-5 { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
.pacote-icon-6 { background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); }

.pacote-nome { font-size: 1.5rem; font-weight: 700; margin: 0; text-transform: uppercase; }
.pacote-body { padding: 0 2rem 2rem; }

.creditos-info {
  text-align: center;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 12px;
}

.creditos-numero { font-size: 2.5rem; font-weight: 800; color: #6366f1; }
.creditos-label { font-size: 0.875rem; color: #4b5563; margin-top: 0.25rem; }

.preco-info { text-align: center; margin-bottom: 1rem; }
.preco-valor { font-size: 2rem; font-weight: 800; }
.preco-moeda { font-size: 1.25rem; font-weight: 600; color: #4b5563; }

.economia-badge {
  display: inline-flex; align-items: center; gap: 0.375rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border-radius: 20px;
  font-size: 0.875rem; font-weight: 600;
  margin-bottom: 1.5rem;
}

.btn-comprar {
  width: 100%; padding: 1rem;
  border: none; border-radius: 12px;
  font-weight: 600; font-size: 1rem;
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  color: white;
  cursor: pointer;
  transition: all 0.3s;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
}

.btn-comprar:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3); }

/* MODAL */
.modal-backdrop-premium {
  position: fixed; inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex; align-items: center; justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container-premium {
  background: white;
  border-radius: 20px;
  width: 100%; max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header-premium {
  padding: 2rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: start;
}

.modal-title { font-size: 1.5rem; font-weight: 700; margin: 0; }
.modal-subtitle { color: #4b5563; font-size: 0.875rem; margin: 0.5rem 0 0 0; }

.btn-close-modal {
  width: 40px; height: 40px;
  border-radius: 10px;
  border: none;
  background: #f3f4f6;
  cursor: pointer;
  transition: all 0.3s;
  display: flex; align-items: center; justify-content: center;
}

.btn-close-modal:hover { background: #ef4444; color: white; }

.resumo-compra {
  margin: 1.5rem 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
}

.resumo-header {
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex; align-items: center; gap: 0.5rem;
  color: #374151;
}

.resumo-body { display: flex; flex-direction: column; gap: 0.75rem; }
.resumo-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.9375rem;
}

.resumo-item .bold { font-weight: 600; }
.resumo-item .highlight { color: #6366f1; font-weight: 600; }

.resumo-total {
  padding-top: 0.75rem;
  border-top: 2px solid #e5e7eb;
  margin-top: 0.5rem;
  font-weight: 600;
}

.resumo-total .total { font-size: 1.25rem; color: #10b981; }

.modal-form { padding: 0 2rem 2rem; }

.form-group-modal {
  margin-bottom: 1.5rem;
}

.form-group-modal label {
  display: flex; align-items: center; gap: 0.5rem;
  font-weight: 500; font-size: 0.875rem;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-group-modal input,
.form-group-modal select,
.form-group-modal textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9375rem;
  transition: all 0.3s;
}

.form-group-modal input:focus,
.form-group-modal select:focus,
.form-group-modal textarea:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.file-upload-area {
  border: 2px dashed #e5e7eb;
  border-radius: 10px;
  transition: all 0.3s;
}

.file-upload-area:hover { border-color: #6366f1; background: #f9fafb; }
.file-uploaded { border-color: #10b981; background: rgba(16, 185, 129, 0.05); }

.file-upload-label { cursor: pointer; display: block; }

.file-placeholder {
  padding: 2rem;
  text-align: center;
  color: #4b5563;
}

.file-placeholder i { font-size: 2rem; color: #6366f1; display: block; margin-bottom: 0.5rem; }
.file-placeholder span { display: block; font-weight: 500; margin-bottom: 0.25rem; }
.file-placeholder small { font-size: 0.75rem; color: #9ca3af; }

.file-info {
  padding: 1rem;
  display: flex; align-items: center; gap: 0.75rem;
}

.file-info i { font-size: 1.5rem; color: #10b981; }
.file-info span { flex: 1; font-weight: 500; }

.btn-remove {
  width: 32px; height: 32px;
  border-radius: 8px;
  border: none;
  background: #fee2e2;
  color: #ef4444;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-remove:hover { background: #ef4444; color: white; }

.modal-actions {
  display: flex; gap: 1rem;
  margin-top: 2rem;
}

.btn-cancel, .btn-submit {
  flex: 1;
  padding: 1rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
}

.btn-cancel {
  background: white;
  border: 2px solid #e5e7eb;
  color: #374151;
}

.btn-cancel:hover { background: #f9fafb; }

.btn-submit {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border: none;
  color: white;
}

.btn-submit:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

/* TOAST */
.toast-success {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 1rem;
  z-index: 2000;
  border-left: 4px solid #10b981;
}

.toast-success i { font-size: 1.5rem; color: #10b981; }
.toast-success strong { display: block; margin-bottom: 0.25rem; }
.toast-success p { margin: 0; font-size: 0.875rem; color: #4b5563; }

/* ANIMATIONS */
.modal-enter-active, .modal-leave-active { transition: all 0.3s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-container-premium, .modal-leave-to .modal-container-premium {
  transform: scale(0.9) translateY(20px);
}

.toast-enter-active, .toast-leave-active { transition: all 0.3s; }
.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

.fade-in { animation: fadeIn 0.5s; }
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 768px) {
  .page-container { padding: 1rem; }
  .pacotes-grid { grid-template-columns: 1fr; }
  .modal-actions { flex-direction: column; }
  .toast-success { top: 1rem; right: 1rem; left: 1rem; }
}
</style>