<template>
  <div class="fade-in">

    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Gerenciar Empresas</h1>
        <p class="page-subtitle">
          Visualize e gerencie todas as empresas cadastradas no sistema
        </p>
      </div>

      <button class="btn btn-accent" @click="$router.push('/admin/empresas/criar')">
        <i class="fas fa-plus"></i>
        Nova Empresa
      </button>
    </div>

    <!-- Stats -->
    <div class="grid grid-4 mb-4">
      <StatCard icon="fa-building" label="Total de Empresas" :value="47" />
      <StatCard icon="fa-check-circle" label="Ativas" :value="43" color="success" />
      <StatCard icon="fa-pause-circle" label="Bloqueadas" :value="4" color="warning" />
      <StatCard icon="fa-calendar-plus" label="Novas este Mês" :value="3" color="purple" />
    </div>

    <!-- Filtros -->
    <div class="card mb-3">
      <div class="card-body">
        <div class="grid grid-4">
          <input
            v-model="filtros.busca"
            class="form-control"
            placeholder="Buscar empresa ou NIF..."
          />

          <select v-model="filtros.status" class="form-control form-select">
            <option value="">Todos os Status</option>
            <option value="ativa">Ativas</option>
            <option value="bloqueada">Bloqueadas</option>
          </select>

          <select v-model="filtros.ordem" class="form-control form-select">
            <option value="recent">Mais Recentes</option>
            <option value="oldest">Mais Antigas</option>
            <option value="name">Nome A-Z</option>
          </select>

          <div class="actions">
            <button class="btn btn-primary" @click="filtrar">
              <i class="fas fa-search"></i>
              Filtrar
            </button>
            <button class="btn btn-ghost" @click="resetarFiltros">
              <i class="fas fa-redo"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabela -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Lista de Empresas</h3>
        <span class="text-muted">
          Exibindo {{ empresasFiltradas.length }} empresas
        </span>
      </div>

      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>Empresa</th>
              <th>NIF</th>
              <th>Contato</th>
              <th>Créditos</th>
              <th>SMS</th>
              <th>Status</th>
              <th>Cadastro</th>
              <th class="text-center">Ações</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="empresa in empresasFiltradas" :key="empresa.id">
              <td class="empresa-cell">
                <div class="avatar">{{ iniciais(empresa.nome) }}</div>
                <div>
                  <strong>{{ empresa.nome }}</strong>
                  <small>{{ empresa.email }}</small>
                </div>
              </td>

              <td><strong>{{ empresa.nif }}</strong></td>
              <td>{{ empresa.telefone }}</td>

              <td class="text-success">
                {{ empresa.creditos.toLocaleString() }}
              </td>

              <td class="text-primary">
                {{ empresa.sms_enviados.toLocaleString() }}
              </td>

              <td>
                <span
                  class="badge"
                  :class="empresa.status === 'ativa' ? 'badge-success' : 'badge-danger'"
                >
                  {{ empresa.status }}
                </span>
              </td>

              <td>{{ formatarData(empresa.data) }}</td>

              <td class="actions">
                <button class="btn btn-ghost btn-sm" @click="verDetalhes(empresa.id)">
                  <i class="fas fa-eye"></i>
                </button>

                <button class="btn btn-primary btn-sm" @click="abrirModalCreditos(empresa)">
                  <i class="fas fa-wallet"></i>
                </button>

                <button
                  v-if="empresa.status === 'ativa'"
                  class="btn btn-warning btn-sm"
                  @click="bloquearEmpresa(empresa)"
                >
                  <i class="fas fa-ban"></i>
                </button>

                <button
                  v-else
                  class="btn btn-success btn-sm"
                  @click="desbloquearEmpresa(empresa)"
                >
                  <i class="fas fa-check"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Créditos -->
    <Modal v-if="modalAberto" @close="modalAberto = false">
      <template #title>Gerenciar Créditos</template>

      <div class="alert alert-info">
        Créditos atuais: <strong>{{ empresaSelecionada.creditos }}</strong>
      </div>

      <select v-model="formCreditos.acao" class="form-control form-select">
        <option value="adicionar">Adicionar</option>
        <option value="remover">Remover</option>
        <option value="definir">Definir</option>
      </select>

      <input
        type="number"
        v-model.number="formCreditos.quantidade"
        class="form-control"
        placeholder="Quantidade"
      />

      <textarea
        v-model="formCreditos.motivo"
        class="form-control"
        placeholder="Motivo"
      />

      <div class="modal-actions">
        <button class="btn btn-outline" @click="modalAberto = false">Cancelar</button>
        <button class="btn btn-accent" @click="confirmarCreditos">
          Confirmar
        </button>
      </div>
    </Modal>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const filtros = ref({
  busca: '',
  status: '',
  ordem: 'recent'
})

const empresas = ref([
  {
    id: 1,
    nome: 'Tech Solutions Lda',
    nif: '1234567890',
    email: 'contato@techsolutions.ao',
    telefone: '+244 923 456 789',
    creditos: 12450,
    sms_enviados: 45890,
    status: 'ativa',
    data: '2024-01-15'
  },
  {
    id: 4,
    nome: 'Construções SA',
    nif: '4567890123',
    email: 'contato@construcoes.ao',
    telefone: '+244 926 789 012',
    creditos: 5430,
    sms_enviados: 22180,
    status: 'bloqueada',
    data: '2024-01-25'
  }
])

const empresasFiltradas = computed(() => {
  return empresas.value.filter(e =>
    (!filtros.value.status || e.status === filtros.value.status) &&
    (!filtros.value.busca ||
      e.nome.toLowerCase().includes(filtros.value.busca.toLowerCase()))
  )
})

const modalAberto = ref(false)
const empresaSelecionada = ref({})
const formCreditos = ref({ acao: 'adicionar', quantidade: 0, motivo: '' })

function abrirModalCreditos(empresa) {
  empresaSelecionada.value = empresa
  modalAberto.value = true
}

function confirmarCreditos() {
  alert('Créditos atualizados com sucesso!')
  modalAberto.value = false
}

function verDetalhes(id) {
  window.location.href = `/admin/empresas/${id}`
}

function bloquearEmpresa(empresa) {
  empresa.status = 'bloqueada'
}

function desbloquearEmpresa(empresa) {
  empresa.status = 'ativa'
}

function iniciais(nome) {
  return nome.substring(0, 2).toUpperCase()
}

function formatarData(data) {
  return new Date(data).toLocaleDateString('pt-BR')
}

function filtrar() {}
function resetarFiltros() {
  filtros.value = { busca: '', status: '', ordem: 'recent' }
}
</script>
