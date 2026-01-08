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

          <!-- Informações Pessoais -->
          <div class="card card-enhanced">
            <div class="card-header">
              <div class="card-icon personal">
                <i class="fas fa-user"></i>
              </div>
              <h3 class="card-title-enhanced">Informações Pessoais</h3>
            </div>

            <div class="card-body">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-user-tag"></i> Nome Completo *
                  </label>
                  <input 
                    v-model="form.nome" 
                    class="form-input" 
                    placeholder="Ex: João Silva" 
                    required 
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-calendar"></i> Data de Nascimento
                  </label>
                  <input 
                    type="date" 
                    v-model="form.data_nascimento" 
                    class="form-input" 
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-phone"></i> Telefone Principal *
                  </label>
                  <input 
                    v-model="form.telefone" 
                    class="form-input" 
                    placeholder="+244 923 456 789"
                    @input="mascaraTelefone('telefone')" 
                    required 
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-mobile-alt"></i> Telefone Alternativo
                  </label>
                  <input 
                    v-model="form.telefone_alternativo" 
                    class="form-input"
                    placeholder="+244 912 345 678"
                    @input="mascaraTelefone('telefone_alternativo')" 
                  />
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
                    <i class="fas fa-venus-mars"></i> Gênero
                  </label>
                  <select v-model="form.genero" class="form-input">
                    <option value="">Selecione...</option>
                    <option value="masculino">Masculino</option>
                    <option value="feminino">Feminino</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Informações Profissionais -->
          <div class="card card-enhanced">
            <div class="card-header">
              <div class="card-icon professional">
                <i class="fas fa-briefcase"></i>
              </div>
              <h3 class="card-title-enhanced">Informações Profissionais</h3>
            </div>

            <div class="card-body">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-id-badge"></i> Cargo
                  </label>
                  <input 
                    v-model="form.cargo" 
                    class="form-input" 
                    placeholder="Ex: Analista de Vendas" 
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-building"></i> Departamento
                  </label>
                  <select v-model="form.departamento" class="form-input">
                    <option value="">Selecione...</option>
                    <option value="vendas">Vendas</option>
                    <option value="rh">Recursos Humanos</option>
                    <option value="ti">Tecnologia da Informação</option>
                    <option value="financeiro">Financeiro</option>
                    <option value="marketing">Marketing</option>
                    <option value="operacoes">Operações</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-calendar-check"></i> Data de Admissão
                  </label>
                  <input 
                    type="date" 
                    v-model="form.data_admissao" 
                    class="form-input" 
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-hashtag"></i> Nº Funcionário
                  </label>
                  <input 
                    v-model="form.numero_funcionario" 
                    class="form-input" 
                    placeholder="Ex: 12345" 
                  />
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
                  v-model="form.endereco" 
                  class="form-input" 
                  rows="2"
                  placeholder="Rua, número, bairro..."
                ></textarea>
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-city"></i> Cidade
                  </label>
                  <input 
                    v-model="form.cidade" 
                    class="form-input" 
                    placeholder="Ex: Luanda" 
                  />
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-map"></i> Província
                  </label>
                  <select v-model="form.provincia" class="form-input">
                    <option value="">Selecione...</option>
                    <option value="luanda">Luanda</option>
                    <option value="benguela">Benguela</option>
                    <option value="huambo">Huambo</option>
                    <option value="cabinda">Cabinda</option>
                    <option value="huila">Huíla</option>
                    <option value="bie">Bié</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <!-- Observações -->
          <div class="card card-enhanced">
            <div class="card-header">
              <div class="card-icon notes">
                <i class="fas fa-sticky-note"></i>
              </div>
              <h3 class="card-title-enhanced">Observações</h3>
            </div>

            <div class="card-body">
              <div class="form-group full-width">
                <textarea 
                  v-model="form.observacoes" 
                  class="form-input" 
                  rows="3"
                  placeholder="Adicione notas ou informações adicionais sobre o contato..."
                ></textarea>
                <small class="form-hint">{{ form.observacoes.length }} caracteres</small>
              </div>
            </div>
          </div>

          <!-- Botões de Ação -->
          <div class="form-actions">
            <router-link to="/contatos" class="btn btn-cancel">
              <i class="fas fa-times"></i> Cancelar
            </router-link>
            <button class="btn btn-save" type="submit">
              <i class="fas fa-check"></i> Salvar Contato
            </button>
          </div>
        </form>
      </div>

      <!-- COLUNA LATERAL -->
      <div class="sidebar-column">

        <!-- Foto do Contato -->
        <div class="card card-enhanced sticky-card">
          <div class="card-header">
            <div class="card-icon photo">
              <i class="fas fa-camera"></i>
            </div>
            <h3 class="card-title-enhanced">Foto do Contato</h3>
          </div>

          <div class="card-body text-center">
            <div class="photo-preview">
              <img 
                v-if="previewFoto" 
                :src="previewFoto" 
                class="avatar-preview" 
                alt="Preview"
              />
              <div v-else class="avatar-placeholder">
                <i class="fas fa-user"></i>
              </div>
            </div>

            <label class="btn-upload">
              <i class="fas fa-upload"></i> Escolher Foto
              <input 
                type="file" 
                @change="previewImagem" 
                accept="image/*"
                hidden
              />
            </label>

            <button 
              v-if="previewFoto" 
              type="button" 
              class="btn-remove-photo"
              @click="removerFoto"
            >
              <i class="fas fa-trash"></i> Remover Foto
            </button>
          </div>
        </div>

        <!-- Grupos -->
        <div class="card card-enhanced">
          <div class="card-header">
            <div class="card-icon groups">
              <i class="fas fa-users"></i>
            </div>
            <h3 class="card-title-enhanced">Grupos</h3>
          </div>

          <div class="card-body">
            <div class="groups-list">
              <label 
                v-for="g in grupos" 
                :key="g.id" 
                class="group-item"
                :class="{ 'group-selected': form.grupos.includes(g.id) }"
              >
                <input 
                  type="checkbox" 
                  :value="g.id" 
                  v-model="form.grupos" 
                />
                <span class="group-name">
                  <i :class="g.icon"></i>
                  {{ g.nome }}
                </span>
                <i class="fas fa-check check-icon"></i>
              </label>
            </div>

            <div v-if="form.grupos.length > 0" class="selected-count">
              {{ form.grupos.length }} grupo(s) selecionado(s)
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>

 import navegacao from "../components/navegacao.vue"

export default {
  name: "CriarContato",

  components:{
    navegacao,
  },

  data() {
    return {
      form: {
        nome: "",
        data_nascimento: "",
        telefone: "",
        telefone_alternativo: "",
        email: "",
        genero: "",
        cargo: "",
        departamento: "",
        data_admissao: "",
        numero_funcionario: "",
        endereco: "",
        cidade: "",
        provincia: "",
        observacoes: "",
        grupos: [],
      },

      grupos: [
        { id: 1, nome: "Vendedores", icon: "fas fa-chart-line" },
        { id: 2, nome: "RH", icon: "fas fa-user-tie" },
        { id: 3, nome: "Motoristas", icon: "fas fa-car" },
        { id: 4, nome: "Gerência", icon: "fas fa-crown" },
        { id: 5, nome: "TI", icon: "fas fa-laptop-code" },
        { id: 6, nome: "Financeiro", icon: "fas fa-coins" },
      ],

      previewFoto: null,
    };
  },

  methods: {
    salvarContato() {
      console.log("Contato:", this.form);
      alert("✅ Contato salvo com sucesso!");
      this.$router.push({ name: "Meucontatos" });
    },

    limparFormulario() {
      if (confirm("Tem certeza que deseja limpar todos os campos?")) {
        this.form = {
          nome: "",
          data_nascimento: "",
          telefone: "",
          telefone_alternativo: "",
          email: "",
          genero: "",
          cargo: "",
          departamento: "",
          data_admissao: "",
          numero_funcionario: "",
          endereco: "",
          cidade: "",
          provincia: "",
          observacoes: "",
          grupos: [],
        };
        this.previewFoto = null;
      }
    },

    mascaraTelefone(campo) {
      let valor = this.form[campo].replace(/\D/g, "");

      if (valor.startsWith("244")) {
        valor = valor.substring(3);
      }

      if (valor.length > 0) {
        valor = valor.match(/.{1,3}/g)?.join(" ");
        this.form[campo] = "+244 " + valor;
      } else {
        this.form[campo] = "";
      }
    },

    previewImagem(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = e => {
        this.previewFoto = e.target.result;
      };
      reader.readAsDataURL(file);
    },

    removerFoto() {
      this.previewFoto = null;
    },
  },
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