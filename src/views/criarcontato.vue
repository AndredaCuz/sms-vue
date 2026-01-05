<template>
  <div class="contacts-page fade-in">

    <!-- Header -->
    <div class="page-header">
      <router-link :to="{ name: 'Meucontatos' }" class="btn btn-ghost btn-sm">
        <i class="fas fa-arrow-left"></i>
      </router-link>
      <div>
        <h1 class="page-title">Adicionar Novo Contato</h1>
        <p class="page-subtitle">Preencha as informações do contato abaixo</p>
      </div>
    </div>

    <div class="grid grid-3 gap-6">

      <!-- COLUNA PRINCIPAL -->
      <div class="col-span-2">
        <form @submit.prevent="salvarContato">

          <!-- Informações Pessoais -->
          <div class="card">
            <h3 class="card-title">
              <i class="fas fa-user"></i> Informações Pessoais
            </h3>

            <div class="grid grid-2">
              <input v-model="form.nome" class="form-control" placeholder="Nome completo" required />
              <input type="date" v-model="form.data_nascimento" class="form-control" />
              <input v-model="form.telefone" class="form-control" placeholder="Telefone principal"
                     @input="mascaraTelefone('telefone')" required />
              <input v-model="form.telefone_alternativo" class="form-control"
                     placeholder="Telefone alternativo"
                     @input="mascaraTelefone('telefone_alternativo')" />
              <input type="email" v-model="form.email" class="form-control" placeholder="Email" />

              <select v-model="form.genero" class="form-control">
                <option value="">Gênero</option>
                <option value="masculino">Masculino</option>
                <option value="feminino">Feminino</option>
                <option value="outro">Outro</option>
              </select>
            </div>
          </div>

          <!-- Informações Profissionais -->
          <div class="card">
            <h3 class="card-title">
              <i class="fas fa-briefcase"></i> Informações Profissionais
            </h3>

            <div class="grid grid-2">
              <input v-model="form.cargo" class="form-control" placeholder="Cargo" />
              <select v-model="form.departamento" class="form-control">
                <option value="">Departamento</option>
                <option value="vendas">Vendas</option>
                <option value="rh">RH</option>
                <option value="ti">TI</option>
                <option value="financeiro">Financeiro</option>
              </select>
              <input type="date" v-model="form.data_admissao" class="form-control" />
              <input v-model="form.numero_funcionario" class="form-control" placeholder="Nº Funcionário" />
            </div>
          </div>

          <!-- Endereço -->
          <div class="card">
            <h3 class="card-title">
              <i class="fas fa-map-marker-alt"></i> Endereço
            </h3>

            <textarea v-model="form.endereco" class="form-control" rows="2"
                      placeholder="Endereço completo"></textarea>

            <div class="grid grid-2">
              <input v-model="form.cidade" class="form-control" placeholder="Cidade" />
              <select v-model="form.provincia" class="form-control">
                <option value="">Província</option>
                <option value="luanda">Luanda</option>
                <option value="benguela">Benguela</option>
                <option value="huambo">Huambo</option>
              </select>
            </div>
          </div>

          <!-- Observações -->
          <div class="card">
            <h3 class="card-title">
              <i class="fas fa-sticky-note"></i> Observações
            </h3>
            <textarea v-model="form.observacoes" class="form-control" rows="3"></textarea>
          </div>

          <!-- Botões -->
          <div class="flex justify-end gap-4 mt-4">
            <router-link  class="btn btn-outline">
              Cancelar
            </router-link>
            <button class="btn btn-accent" type="submit">
              Salvar Contato
            </button>
          </div>
        </form>
      </div>

      <!-- COLUNA LATERAL -->
      <div>

        <!-- Grupos -->
        <div class="card">
          <h3 class="card-title">
            <i class="fas fa-users"></i> Grupos
          </h3>

          <label v-for="g in grupos" :key="g.id" class="flex gap-2">
            <input type="checkbox" :value="g.id" v-model="form.grupos" />
            {{ g.nome }}
          </label>
        </div>

        <!-- Foto -->
        <div class="card text-center">
          <h3 class="card-title">
            <i class="fas fa-camera"></i> Foto
          </h3>

          <img v-if="previewFoto" :src="previewFoto" class="avatar-preview" />
          <input type="file" @change="previewImagem" />
        </div>

      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "CriarContato",

  data() {
    return {
      // FORMULÁRIO SEMPRE DEFINIDO
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

      // GRUPOS FIXOS (FRONT)
      grupos: [
        { id: 1, nome: "Vendedores" },
        { id: 2, nome: "RH" },
        { id: 3, nome: "Motoristas" },
        { id: 4, nome: "Gerência" },
      ],

      // PREVIEW DA FOTO
      previewFoto: null,
    };
  },

  methods: {
    salvarContato() {
      // 👉 FRONT ONLY (simulação)
      console.log("Contato:", this.form);

      alert("✅ Contato salvo (simulação frontend)");
      this.$router.push({ name: "Meucontatos" });
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
  },
};
</script>

<style>
.form-control:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

label:has(input[type="checkbox"]):hover,
label:has(input[type="radio"]):hover {
    background: var(--gray-50);
}
</style>