<template>
  <div>
    <navegacao />
    <sidebar />

    <main class="app-layout" :class="{ 'app-layout--collapsed': sidebarCollapsed }">
      <slot />
    </main>
  </div>
</template>

<script>
import navegacao from './navegacao.vue';
import Sidebar from './sidebar.vue';

export default {
  name: 'AppLayout',
  components: { navegacao, Sidebar },

  data() {
    return {
      sidebarCollapsed: false,
    };
  },

  methods: {
    onSidebarCollapse(e) {
      this.sidebarCollapsed = e.detail.collapsed;
    },
  },

  mounted() {
    this.sidebarCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
    window.addEventListener('sidebar-collapse', this.onSidebarCollapse);
  },

  beforeUnmount() {
    window.removeEventListener('sidebar-collapse', this.onSidebarCollapse);
  },
};
</script>

<style>
/*
  🔑 REGRA DE OURO — só o AppLayout controla margin-left e padding-top.
  NUNCA colocar margin-left ou padding-top nas views/páginas.
*/
.app-layout {
  min-height: 100vh;
  padding-top: 70px;
  margin-left: 240px;
  transition: margin-left 0.28s cubic-bezier(.4, 0, .2, 1);
  box-sizing: border-box;
  background: #f5f7fa;
}

.app-layout--collapsed {
  margin-left: 68px;    /* sidebar colapsada */
}

@media (max-width: 768px) {
  .app-layout,
  .app-layout--collapsed {
    margin-left: 0;
  }

  
}

.dash-root {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 1.5rem;
  font-family: 'Segoe UI', system-ui, sans-serif;
  position: relative;

  /* Desktop: ocupa a área à direita da sidebar expandida */
  margin-left: 240px;
  padding-top: calc(70px + 1.5rem); /* navbar height + espaço */

  /* Transição suave igual à sidebar */
  transition: margin-left 0.28s cubic-bezier(.4,0,.2,1);
}

/* Quando a sidebar está colapsada, reduz o margin */
.dash-root.sidebar-collapsed {
  margin-left: 68px;
}

/* Mobile: sidebar está oculta, sem margin */
@media (max-width: 768px) {
  .dash-root,
  .dash-root.sidebar-collapsed {
    margin-left: 0;
    padding-top: calc(70px + 1rem);
    padding-left: 1rem;
    padding-right: 1rem;
  }
}

.fade-in { animation: fadeIn .4s ease both; }
@keyframes fadeIn { from{opacity:0;transform:translateY(10px);} to{opacity:1;transform:none;} }

</style>