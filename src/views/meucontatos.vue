<template>

    <navegacao/>
  <div class="contacts-page fade-in">
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Contatos</h1>
        <p class="page-subtitle">Gerencie todos os seus contatos e funcionários</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-outline" @click="importExcel">
          <i class="fas fa-file-import"></i>
          Importar Excel
        </button>
        <router-link :to="{ name: 'Criarcontato' }" class="btn btn-accent">
          <i class="fas fa-plus"></i>
          Novo Contato
        </router-link>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-4 mb-4">
      <div v-for="stat in stats" :key="stat.label" class="stat-card">
        <div class="stat-icon" :style="{ background: stat.color, color: 'white' }">
          <i :class="stat.icon"></i>
        </div>
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>
      </div>
    </div>

    <!-- Filtros e Pesquisa -->
    <div class="card mb-3">
      <div class="card-body">
        <form @submit.prevent="filtrarContatos">
          <div class="grid grid-4">
            <div class="form-group mb-0">
              <input 
                type="text" 
                v-model="filtros.busca" 
                class="form-control" 
                placeholder="Buscar por nome, telefone ou cargo..."
              >
            </div>
            <div class="form-group mb-0">
              <select v-model="filtros.grupo" class="form-control form-select">
                <option value="">Todos os Grupos</option>
                <option value="1">Vendedores</option>
                <option value="2">Recursos Humanos</option>
                <option value="3">Motoristas</option>
                <option value="4">Gerência</option>
              </select>
            </div>
            <div class="form-group mb-0">
              <select v-model="filtros.status" class="form-control form-select">
                <option value="">Todos os Status</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>
            </div>
            <div class="filter-buttons">
              <button type="submit" class="btn btn-primary" style="flex:1">
                <i class="fas fa-search"></i> Filtrar
              </button>
              <button type="button" class="btn btn-ghost" @click="resetFiltros">
                <i class="fas fa-redo"></i>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Lista de Contatos -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Lista de Contatos</h3>
        <div class="card-header-actions">
          <span>Exibindo {{ contatosFiltrados.length }} contatos</span>
          <button class="btn btn-ghost btn-sm" @click="exportarContatos">
            <i class="fas fa-download"></i> Exportar
          </button>
        </div>
      </div>

      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" v-model="selectAll" @change="toggleSelectAll">
                </th>
                <th>Nome</th>
                <th>Telefone</th>
                <th>Cargo</th>
                <th>Grupos</th>
                <th>Status</th>
                <th>Cadastro</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="contato in contatosFiltrados" :key="contato.id">
                <td>
                  <input type="checkbox" v-model="contatosSelecionados" :value="contato.id">
                </td>
                <td>
                  <div class="contact-name">
                    <div class="avatar">{{ contato.nome.substring(0,2).toUpperCase() }}</div>
                    <div>{{ contato.nome }}</div>
                  </div>
                </td>
                <td>
                  <a :href="`tel:${contato.telefone}`" class="phone-link">
                    <i class="fas fa-phone"></i> {{ contato.telefone }}
                  </a>
                </td>
                <td>{{ contato.cargo }}</td>
                <td>
                  <span v-for="grupo in contato.grupos.split(', ')" :key="grupo" class="badge badge-primary">
                    {{ grupo }}
                  </span>
                </td>
                <td>
                  <span :class="['badge', contato.status === 'ativo' ? 'badge-success' : 'badge-warning']">
                    <i class="fas fa-circle status-dot"></i>
                    {{ contato.status === 'ativo' ? 'Ativo' : 'Inativo' }}
                  </span>
                </td>
                <td>{{ formatDate(contato.data) }}</td>
                <td class="actions">
                  <button class="btn btn-ghost btn-sm" @click="editarContato(contato.id)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-ghost btn-sm" @click="enviarSMS(contato.id)">
                    <i class="fas fa-paper-plane"></i>
                  </button>
                  <button class="btn btn-ghost btn-sm" @click="excluirContato(contato.id)">
                    <i class="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Ações em Lote -->
    <div v-if="contatosSelecionados.length > 0" class="batch-actions">
      <div><strong>{{ contatosSelecionados.length }} contatos selecionados</strong></div>
      <div class="batch-buttons">
        <button class="btn btn-accent btn-sm" @click="enviarSMSLote">
          <i class="fas fa-paper-plane"></i> Enviar SMS
        </button>
        <button class="btn btn-primary btn-sm" @click="adicionarGrupoLote">
          <i class="fas fa-users"></i> Adicionar ao Grupo
        </button>
        <button class="btn btn-danger btn-sm" @click="excluirLote">
          <i class="fas fa-trash"></i> Excluir
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import navegacao from "../components/navegacao.vue"

export default {
  name: "ContactsPage",

  components: {
    navegacao
  },

  data() {
    return {
      filtros: {
        busca: "",
        grupo: "",
        status: ""
      },
      contatos: [
        {
          id: 1,
          nome: "João Silva",
          telefone: "923 456-789",
          cargo: "Vendedor",
          grupos: "1,2",
          status: "ativo",
          data: "2025-01-10"
        },
        {
          id: 2,
          nome: "Maria Costa",
          telefone: "933 111-222",
          cargo: "RH",
          grupos: "2",
          status: "inativo",
          data: "2025-02-05"
        }
      ],
      contatosSelecionados: [],
      selectAll: false,
      stats: [
        { label: "Total de Contatos", value: 2, icon: "fas fa-users", color: "linear-gradient(135deg, #3B82F6, #2563EB)" },
        { label: "Ativos", value: 1, icon: "fas fa-user-check", color: "linear-gradient(135deg, #10B981, #059669)" },
        { label: "Inativos", value: 1, icon: "fas fa-clock", color: "linear-gradient(135deg, #F59E0B, #D97706)" },
        { label: "Novos este mês", value: 2, icon: "fas fa-calendar-plus", color: "linear-gradient(135deg, #8B5CF6, #7C3AED)" }
      ]
    }
  },

  computed: {
    contatosFiltrados() {
      const busca = this.filtros.busca.toLowerCase()

      return this.contatos.filter(c => {
        return (
          c.nome.toLowerCase().includes(busca) ||
          c.telefone.includes(busca) ||
          c.cargo.toLowerCase().includes(busca)
        )
      })
    }
  },

  methods: {
    toggleSelectAll() {
      this.contatosSelecionados = this.selectAll
        ? this.contatosFiltrados.map(c => c.id)
        : []
    },

    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },

    filtrarContatos() {},

    resetFiltros() {
      this.filtros = { busca: "", grupo: "", status: "" }
    },

    editarContato(id) {
      alert(`Editar contato ${id}`)
    },

    enviarSMS(id) {
      alert(`Enviar SMS para ${id}`)
    },

    excluirContato(id) {
      if (confirm("Deseja excluir este contato?")) {
        this.contatos = this.contatos.filter(c => c.id !== id)
      }
    },

    exportarContatos() {
      alert("Exportar contatos")
    },

    enviarSMSLote() {
      alert("Enviar SMS em lote")
    },

    adicionarGrupoLote() {
      alert("Adicionar grupo em lote")
    },

    excluirLote() {
      if (confirm("Excluir contatos selecionados?")) {
        this.contatos = this.contatos.filter(
          c => !this.contatosSelecionados.includes(c.id)
        )
        this.contatosSelecionados = []
      }
    },

    importExcel() {
      alert("Importar Excel")
    }
  }
}
</script>


<style scoped>
.contacts-page .page-header {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;
}
.page-header .header-actions { display:flex; gap:1rem; }
.grid-4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 1rem; }
.stat-card { padding: 1rem; border-radius: 8px; background: #fff; display: flex; flex-direction: column; align-items: center; }
.stat-icon { font-size: 1.5rem; padding: 1rem; border-radius: 50%; margin-bottom: 0.5rem; display:flex; align-items:center; justify-content:center; }
.card { background:#fff; border-radius:10px; margin-bottom:1rem; }
.card-body { padding:1rem; }
.contact-name { display:flex; align-items:center; gap:0.5rem; }
.avatar { width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:#2563eb;color:white;font-weight:600; }
.actions button { margin-right:0.25rem; }
.batch-actions { position: fixed; bottom: 2rem; right: 2rem; background:#fff; padding:1rem 1.5rem; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.15); display:flex; flex-direction:column; gap:0.5rem; }
.batch-buttons { display:flex; gap:0.5rem; margin-top:0.5rem; }
.status-dot { font-size:0.5rem; margin-right:0.25rem; }
.phone-link { color:#2563eb; text-decoration:none; }
.filter-buttons { display:flex; gap:0.5rem; }
@media(max-width: 768px){.grid-4 { grid-template-columns:1fr; }}
</style>
