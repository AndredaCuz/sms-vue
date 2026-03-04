<template>
  <AppLayout>
    <div class="contacts-page fade-in">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">
            <i class="fas fa-address-book"></i> Contatos
          </h1>
          <p class="page-description">Gerencie seus contatos e clientes</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-outline" @click="showImportModal = true">
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
          <div class="stat-icon" :style="{ background: stat.color }">
            <i :class="stat.icon"></i>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <!-- Filtros e Pesquisa -->
      <div class="card mb-3">
        <div class="card-body">
          <div class="grid grid-4">
            <div class="form-group mb-0">
              <div class="search-input-wrapper">
                <i class="fas fa-search search-icon"></i>
                <input 
                  type="text" 
                  v-model="filtros.busca" 
                  class="form-control search-input" 
                  placeholder="Buscar por nome, telefone ou email..."
                  @input="onSearchInput"
                >
                <button 
                  v-if="filtros.busca" 
                  class="search-clear" 
                  @click="clearSearch"
                  title="Limpar pesquisa"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <div class="form-group mb-0">
              <select v-model="filtros.categoria" class="form-control form-select" @change="aplicarFiltros">
                <option value="">Todas as Categorias</option>
                <option v-for="cat in categorias" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <div class="form-group mb-0">
              <select v-model="filtros.status" class="form-control form-select" @change="aplicarFiltros">
                <option value="">Todos os Status</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select>
            </div>

            <div class="filter-buttons">
              <button type="button" class="btn btn-primary" style="flex:1" @click="aplicarFiltros">
                <i class="fas fa-search"></i> Pesquisar
              </button>
              <button type="button" class="btn btn-ghost" @click="resetFiltros" title="Limpar filtros">
                <i class="fas fa-redo"></i>
              </button>
            </div>
          </div>

          <div v-if="temFiltrosAtivos" class="active-filters">
            <span class="active-filters-label">
              <i class="fas fa-filter"></i> Filtros ativos:
            </span>
            <span v-if="filtros.busca" class="filter-tag">
              Busca: "{{ filtros.busca }}"
              <button @click="clearSearch"><i class="fas fa-times"></i></button>
            </span>
            <span v-if="filtros.categoria" class="filter-tag">
              Categoria: {{ categoriaNome }}
              <button @click="filtros.categoria = ''; aplicarFiltros()"><i class="fas fa-times"></i></button>
            </span>
            <span v-if="filtros.status" class="filter-tag">
              Status: {{ filtros.status === 'active' ? 'Ativo' : 'Inativo' }}
              <button @click="filtros.status = ''; aplicarFiltros()"><i class="fas fa-times"></i></button>
            </span>
            <button class="btn-clear-all" @click="resetFiltros">Limpar todos</button>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <div class="spinner"></div>
        <p>Carregando contatos...</p>
      </div>

      <!-- Lista de Contatos -->
      <div v-else class="card">
        <div class="card-header">
          <h3 class="card-title">
            <i class="fas fa-list"></i> Lista de Contatos
          </h3>
          <div class="card-header-actions">
            <span class="contacts-count">
              <i class="fas fa-users"></i> 
              {{ pagination.total }} 
              {{ temFiltrosAtivos ? 'resultado(s) encontrado(s)' : 'contatos' }}
            </span>
            <button class="btn btn-ghost btn-sm" @click="showImportModal = true">
              <i class="fas fa-download"></i> Importar Excel
            </button>
          </div>
        </div>

        <div class="card-body">
          <div v-if="contatos.length === 0" class="empty-state">
            <i :class="temFiltrosAtivos ? 'fas fa-search' : 'fas fa-inbox'"></i>
            <h3>{{ temFiltrosAtivos ? 'Nenhum resultado encontrado' : 'Nenhum contato encontrado' }}</h3>
            <p>{{ temFiltrosAtivos ? 'Tente ajustar os filtros de pesquisa' : 'Adicione um novo contato para começar' }}</p>
            <button v-if="temFiltrosAtivos" class="btn btn-primary" @click="resetFiltros">
              <i class="fas fa-redo"></i> Limpar Filtros
            </button>
            <router-link v-else :to="{ name: 'Criarcontato' }" class="btn btn-primary">
              <i class="fas fa-plus"></i> Adicionar Contato
            </router-link>
          </div>

          <div v-else class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th><input type="checkbox" v-model="selectAll" @change="toggleSelectAll"></th>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>Email</th>
                  <th>Categorias</th>
                  <th>Dívida</th>
                  <th>Status</th>
                  <th>SMS Recebidos</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="contato in contatos" :key="contato.id">
                  <td>
                    <input type="checkbox" v-model="contatosSelecionados" :value="contato.id">
                  </td>
                  <td>
                    <div class="contact-name">
                      <div class="avatar" :style="{ background: contato.category?.color || '#2563eb' }">
                        {{ getInitials(contato.name) }}
                      </div>
                      <div class="contact-info">
                        <div class="name">{{ contato.name }}</div>
                        <div v-if="contato.custom_fields?.endereco" class="location">
                          <i class="fas fa-map-marker-alt"></i> {{ contato.custom_fields.endereco }}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <a :href="`tel:${contato.phone}`" class="phone-link">
                      <i class="fas fa-phone"></i> {{ formatPhone(contato.phone) }}
                    </a>
                    <span v-if="contato.has_valid_phone" class="verified-badge" title="Telefone Verificado">
                      <i class="fas fa-check-circle"></i>
                    </span>
                  </td>
                  <td>
                    <a v-if="contato.email" :href="`mailto:${contato.email}`" class="email-link">
                      <i class="fas fa-envelope"></i> {{ contato.email }}
                    </a>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <!-- Mostra categoria principal + extras -->
                    <div class="categories-cell">
                      <span 
                        v-if="contato.category" 
                        class="badge-category" 
                        :style="{ background: contato.category.color + '20', color: contato.category.color, borderColor: contato.category.color }"
                      >
                        <i class="fas fa-star" style="font-size: 0.6rem; margin-right: 2px;"></i>
                        {{ contato.category.name }}
                      </span>
                      <span 
                        v-for="cat in (contato.extra_categories || [])" 
                        :key="cat.id"
                        class="badge-category badge-category-extra"
                        :style="{ background: cat.color + '15', color: cat.color, borderColor: cat.color }"
                      >
                        {{ cat.name }}
                      </span>
                      <span v-if="!contato.category && (!contato.extra_categories || !contato.extra_categories.length)" class="text-muted">-</span>
                    </div>
                  </td>
                  <td>
                    <span v-if="parseFloat(contato.debt_amount) > 0" class="debt-amount">
                      {{ formatCurrency(contato.debt_amount) }}
                    </span>
                    <span v-else class="text-muted">-</span>
                  </td>
                  <td>
                    <span :class="['badge', contato.status === 'active' ? 'badge-success' : 'badge-warning']">
                      <i class="fas fa-circle status-dot"></i>
                      {{ contato.status === 'active' ? 'Ativo' : 'Inativo' }}
                    </span>
                    <span v-if="contato.opt_out" class="opt-out-badge" title="Cancelou inscrição">
                      <i class="fas fa-ban"></i>
                    </span>
                  </td>
                  <td>
                    <div class="sms-count">
                      <i class="fas fa-sms"></i> {{ contato.total_sms_received }}
                    </div>
                    <div v-if="contato.last_sms_sent_at" class="last-sms">
                      Último: {{ formatDate(contato.last_sms_sent_at) }}
                    </div>
                  </td>
                  <td class="actions">
                    <button class="btn btn-ghost btn-sm" @click="verDetalhes(contato)" title="Ver Detalhes">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-ghost btn-sm" @click="editarContato(contato.id)" title="Editar">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-ghost btn-sm" @click="abrirModalGerenciarCategorias(contato)" title="Gerenciar Categorias">
                      <i class="fas fa-tags"></i>
                    </button>
                    <button class="btn btn-ghost btn-sm" @click="abrirModalSMS([contato.id], contato.name)" title="Enviar SMS">
                      <i class="fas fa-paper-plane"></i>
                    </button>
                    <button class="btn btn-ghost btn-sm" @click="abrirModalBloquear(contato)" title="Adicionar à Blacklist">
                      <i class="fas fa-ban"></i>
                    </button>
                    <button class="btn btn-ghost btn-sm" @click="excluirContato(contato.id)" title="Excluir">
                      <i class="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Paginação -->
          <div v-if="pagination.total > pagination.per_page" class="pagination">
            <button class="btn btn-ghost btn-sm" :disabled="!pagination.prev_page_url" @click="changePage(pagination.current_page - 1)">
              <i class="fas fa-chevron-left"></i> Anterior
            </button>
            <div class="pagination-info">
              Página {{ pagination.current_page }} de {{ pagination.last_page }}
              ({{ pagination.from }}-{{ pagination.to }} de {{ pagination.total }})
            </div>
            <button class="btn btn-ghost btn-sm" :disabled="!pagination.next_page_url" @click="changePage(pagination.current_page + 1)">
              Próximo <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Ações em Lote -->
      <div v-if="contatosSelecionados.length > 0" class="batch-actions">
        <div class="batch-info">
          <i class="fas fa-check-square"></i>
          <strong>{{ contatosSelecionados.length }} contatos selecionados</strong>
        </div>
        <div class="batch-buttons">
          <button class="btn btn-accent btn-sm" @click="abrirModalSMSLote">
            <i class="fas fa-paper-plane"></i> Enviar SMS
          </button>
          <button class="btn btn-primary btn-sm" @click="abrirModalAlterarCategoriaLote">
            <i class="fas fa-tag"></i> Alterar Categoria Principal
          </button>
          <button class="btn btn-danger btn-sm" @click="excluirLote">
            <i class="fas fa-trash"></i> Excluir
          </button>
        </div>
      </div>

      <!-- ===== MODAL GERENCIAR CATEGORIAS (MÚLTIPLAS CATEGORIAS) ===== -->
      <div v-if="showModalGerenciarCategorias" class="modal-overlay" @click="closeModalGerenciarCategorias">
        <div class="modal-content modal-categoria" @click.stop>
          <div class="modal-header">
            <div class="modal-header-info">
              <div class="modal-header-avatar" :style="{ background: contatoParaCategoria?.category?.color || '#2563eb' }">
                {{ getInitials(contatoParaCategoria?.name || '') }}
              </div>
              <div>
                <h2 class="modal-title">
                  <i class="fas fa-tags"></i> Gerenciar Categorias
                </h2>
                <p class="modal-subtitle-contact">{{ contatoParaCategoria?.name }}</p>
                <p class="modal-subtitle-phone">
                  <i class="fas fa-phone"></i> {{ formatPhone(contatoParaCategoria?.phone) }}
                </p>
              </div>
            </div>
            <button class="modal-close" @click="closeModalGerenciarCategorias">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <!-- CATEGORIA PRINCIPAL -->
            <div class="categoria-section">
              <div class="categoria-section-header">
                <i class="fas fa-star" style="color: #f59e0b;"></i>
                <span>Categoria Principal</span>
                <span class="categoria-hint">Define a cor do avatar e aparece em destaque</span>
              </div>
              
              <div class="categorias-grid">
                <!-- Sem categoria -->
                <label 
                  class="categoria-card categoria-card-none"
                  :class="{ 'categoria-card-selected': !formCategorias.categoria_principal }"
                >
                  <input type="radio" :value="null" v-model="formCategorias.categoria_principal" name="categoriaPrincipal" />
                  <div class="categoria-card-color categoria-none-color">
                    <i class="fas fa-ban"></i>
                  </div>
                  <div class="categoria-card-body">
                    <span class="categoria-card-name">Sem Categoria Principal</span>
                  </div>
                  <i class="fas fa-check-circle categoria-check"></i>
                </label>

                <label 
                  v-for="cat in categorias" 
                  :key="'primary-' + cat.id"
                  class="categoria-card"
                  :class="{ 'categoria-card-selected': formCategorias.categoria_principal === cat.id }"
                >
                  <input type="radio" :value="cat.id" v-model="formCategorias.categoria_principal" name="categoriaPrincipal" />
                  <div class="categoria-card-color" :style="{ background: cat.color }"></div>
                  <div class="categoria-card-body">
                    <span class="categoria-card-name">{{ cat.name }}</span>
                    <span class="categoria-card-count" v-if="cat.clients_count !== undefined">
                      <i class="fas fa-users"></i> {{ cat.clients_count }}
                    </span>
                  </div>
                  <i class="fas fa-check-circle categoria-check"></i>
                </label>
              </div>
            </div>

            <!-- CATEGORIAS ADICIONAIS -->
            <div class="categoria-section">
              <div class="categoria-section-header">
                <i class="fas fa-layer-group" style="color: #6366f1;"></i>
                <span>Categorias Adicionais</span>
                <span class="categoria-hint">Selecione múltiplas categorias para este contato</span>
              </div>

              <div class="categorias-grid">
                <label 
                  v-for="cat in categorias" 
                  :key="'extra-' + cat.id"
                  class="categoria-card"
                  :class="{ 
                    'categoria-card-selected': formCategorias.categorias_extra.includes(cat.id),
                    'categoria-card-disabled': formCategorias.categoria_principal === cat.id
                  }"
                >
                  <input 
                    type="checkbox" 
                    :value="cat.id" 
                    v-model="formCategorias.categorias_extra"
                    :disabled="formCategorias.categoria_principal === cat.id"
                  />
                  <div class="categoria-card-color" :style="{ background: cat.color }"></div>
                  <div class="categoria-card-body">
                    <span class="categoria-card-name">{{ cat.name }}</span>
                    <span class="categoria-card-count" v-if="cat.clients_count !== undefined">
                      <i class="fas fa-users"></i> {{ cat.clients_count }}
                    </span>
                  </div>
                  <i class="fas fa-check-square categoria-check" style="color: #6366f1;"></i>
                  <span v-if="formCategorias.categoria_principal === cat.id" class="categoria-badge-principal">
                    Principal
                  </span>
                </label>
              </div>
            </div>

            <!-- RESUMO DAS CATEGORIAS SELECIONADAS -->
            <div 
              v-if="formCategorias.categoria_principal || formCategorias.categorias_extra.length > 0" 
              class="categoria-resumo"
            >
              <i class="fas fa-tags"></i>
              <div>
                <strong>Categorias selecionadas:</strong>
                <div class="resumo-tags">
                  <span 
                    v-if="getCategoriaById(formCategorias.categoria_principal)"
                    class="resumo-tag resumo-tag-primary"
                    :style="{ 
                      background: getCategoriaById(formCategorias.categoria_principal)?.color + '25', 
                      borderColor: getCategoriaById(formCategorias.categoria_principal)?.color, 
                      color: getCategoriaById(formCategorias.categoria_principal)?.color 
                    }"
                  >
                    <i class="fas fa-star"></i> {{ getCategoriaById(formCategorias.categoria_principal)?.name }}
                  </span>
                  <span 
                    v-for="catId in formCategorias.categorias_extra" 
                    :key="catId"
                    class="resumo-tag"
                    :style="{ 
                      background: getCategoriaById(catId)?.color + '20', 
                      borderColor: getCategoriaById(catId)?.color, 
                      color: getCategoriaById(catId)?.color 
                    }"
                  >
                    {{ getCategoriaById(catId)?.name }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Ações rápidas -->
            <div class="categoria-acoes-rapidas">
              <button type="button" class="btn-link" @click="limparTodasCategorias">
                <i class="fas fa-times-circle"></i> Remover todas as categorias
              </button>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-ghost" @click="closeModalGerenciarCategorias" :disabled="salvandoCategorias">
              <i class="fas fa-times"></i> Cancelar
            </button>
            <button class="btn btn-primary" @click="salvarCategorias" :disabled="salvandoCategorias">
              <i class="fas fa-spinner fa-spin" v-if="salvandoCategorias"></i>
              <i class="fas fa-check" v-else></i>
              {{ salvandoCategorias ? 'Salvando...' : 'Salvar Categorias' }}
            </button>
          </div>
        </div>
      </div>

      <!-- ===== MODAL ALTERAR CATEGORIA PRINCIPAL (Lote) ===== -->
      <div v-if="showModalAlterarCategoriaLote" class="modal-overlay" @click="closeModalAlterarCategoriaLote">
        <div class="modal-content" @click.stop style="max-width: 400px;">
          <div class="modal-header">
            <h2 class="modal-title"><i class="fas fa-tag"></i> Alterar Categoria Principal - Lote</h2>
            <button class="modal-close" @click="closeModalAlterarCategoriaLote"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body">
            <p style="margin-bottom: 1rem; color: var(--gray-600);">
              Você está alterando a categoria principal de <strong>{{ contatosSelecionados.length }} contatos</strong>.
            </p>
            <div class="form-group">
              <label class="form-label"><i class="fas fa-folder"></i> Selecione a nova categoria principal</label>
              <select v-model="formLote.categoria_id" class="form-control form-select">
                <option value="">Sem Categoria Principal</option>
                <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="closeModalAlterarCategoriaLote"><i class="fas fa-times"></i> Cancelar</button>
            <button class="btn btn-primary" @click="salvarAlteracaoCategoriaLote" :disabled="alterandoCategoria">
              <i class="fas fa-spinner fa-spin" v-if="alterandoCategoria"></i>
              <i class="fas fa-check" v-else></i>
              {{ alterandoCategoria ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </div>

      <!-- ===== MODAL BLOQUEAR CONTATO ===== -->
      <div v-if="showModalBloquear" class="modal-overlay" @click="closeModalBloquear">
        <div class="modal-content" @click.stop style="max-width: 500px;">
          <div class="modal-header">
            <h2 class="modal-title"><i class="fas fa-ban"></i> Adicionar à Blacklist</h2>
            <button class="modal-close" @click="closeModalBloquear"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label"><i class="fas fa-user"></i> Contato</label>
              <div style="padding: 1rem; background: var(--gray-50); border-radius: 8px; margin-bottom: 1rem;">
                <strong>{{ contatoParaBloquear?.name }}</strong><br>
                <small style="color: var(--gray-600);">{{ contatoParaBloquear?.phone }}</small>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label required"><i class="fas fa-exclamation-triangle"></i> Motivo do Bloqueio</label>
              <select v-model="formBloquear.reason" class="form-control form-select" required>
                <option value="">Selecione um motivo</option>
                <option value="spam">Spam / Reclamação de Spam</option>
                <option value="opt_out">Solicitação de Cancelamento (Opt-out)</option>
                <option value="invalid">Número Inválido</option>
                <option value="complaint">Reclamação do Cliente</option>
                <option value="fraud">Suspeita de Fraude</option>
                <option value="legal">Questões Legais</option>
                <option value="other">Outro Motivo</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label"><i class="fas fa-sticky-note"></i> Observações</label>
              <textarea v-model="formBloquear.notes" class="form-control" rows="3" placeholder="Adicione detalhes adicionais..."></textarea>
            </div>
            <div class="alert-warning">
              <i class="fas fa-exclamation-circle"></i>
              <div>
                <strong>Atenção!</strong>
                <p>Este contato não receberá mais SMS de nenhuma campanha.</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="closeModalBloquear" :disabled="bloqueandoContato"><i class="fas fa-times"></i> Cancelar</button>
            <button class="btn btn-danger" @click="salvarBloquear" :disabled="bloqueandoContato || !formBloquear.reason">
              <i class="fas fa-spinner fa-spin" v-if="bloqueandoContato"></i>
              <i class="fas fa-ban" v-else></i>
              {{ bloqueandoContato ? 'Bloqueando...' : 'Adicionar à Blacklist' }}
            </button>
          </div>
        </div>
      </div>

      <!-- ===== MODAL ENVIAR SMS ===== -->
      <div v-if="showSMSModal" class="modal-overlay" @click="fecharModalSMS">
        <div class="modal-content sms-modal" @click.stop>
          <div class="sms-modal-header">
            <div class="sms-modal-header-icon"><i class="fas fa-paper-plane"></i></div>
            <div>
              <h2 class="sms-modal-title">Enviar SMS</h2>
              <p class="sms-modal-subtitle">
                <i class="fas fa-users"></i>
                {{ smsForm.clientIds.length }} {{ smsForm.clientIds.length === 1 ? 'destinatário' : 'destinatários' }}
                <span v-if="smsForm.clientIds.length === 1 && smsDestinatarioNome"> — {{ smsDestinatarioNome }}</span>
              </p>
            </div>
            <button class="modal-close" @click="fecharModalSMS"><i class="fas fa-times"></i></button>
          </div>
          <div class="sms-modal-body">
            <div class="sms-form-group">
              <label class="sms-form-label"><i class="fas fa-signature"></i> Nome da Campanha <span class="required">*</span></label>
              <input v-model="smsForm.name" type="text" class="sms-form-input" placeholder="Ex: Promoção de Natal..." required />
            </div>
            <div class="sms-form-group">
              <label class="sms-form-label"><i class="fas fa-comment-dots"></i> Mensagem <span class="required">*</span></label>
              <textarea v-model="smsForm.message" class="sms-form-input sms-textarea" rows="5" placeholder="Digite a mensagem SMS..." required></textarea>
            </div>
            <div class="sms-form-group">
              <label class="sms-form-label"><i class="fas fa-clock"></i> Tipo de Envio</label>
              <div class="sms-type-cards">
                <label class="sms-type-card" :class="{ 'sms-type-selected': smsForm.type === 'instant' }">
                  <input type="radio" value="instant" v-model="smsForm.type" name="smsType" />
                  <div class="sms-type-icon"><i class="fas fa-bolt"></i></div>
                  <div class="sms-type-info"><strong>Instantâneo</strong><small>Enviar agora</small></div>
                  <i class="fas fa-check-circle sms-check"></i>
                </label>
                <label class="sms-type-card" :class="{ 'sms-type-selected': smsForm.type === 'scheduled' }">
                  <input type="radio" value="scheduled" v-model="smsForm.type" name="smsType" />
                  <div class="sms-type-icon"><i class="fas fa-calendar-alt"></i></div>
                  <div class="sms-type-info"><strong>Agendado</strong><small>Escolher data/hora</small></div>
                  <i class="fas fa-check-circle sms-check"></i>
                </label>
              </div>
            </div>
            <div v-if="smsForm.type === 'scheduled'" class="sms-form-group sms-scheduled-box">
              <label class="sms-form-label"><i class="fas fa-calendar-check"></i> Data e Hora do Envio <span class="required">*</span></label>
              <input type="datetime-local" v-model="smsForm.scheduledAt" class="sms-form-input" :min="dataHoraMinima" required />
              <small class="sms-hint"><i class="fas fa-info-circle"></i> O SMS será enviado automaticamente na data e hora selecionadas</small>
            </div>
            <div v-if="smsResult" class="sms-result" :class="smsResult.type">
              <i :class="smsResult.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
              <div><strong>{{ smsResult.title }}</strong><p>{{ smsResult.message }}</p></div>
            </div>
          </div>
          <div class="sms-modal-footer">
            <button class="btn btn-ghost" @click="fecharModalSMS" :disabled="smsEnviando"><i class="fas fa-times"></i> Cancelar</button>
            <button class="btn btn-accent" @click="enviarSMSModal" :disabled="smsEnviando || !smsForm.name.trim() || !smsForm.message.trim() || (smsForm.type === 'scheduled' && !smsForm.scheduledAt)">
              <i :class="smsEnviando ? 'fas fa-spinner fa-spin' : 'fas fa-paper-plane'"></i>
              {{ smsEnviando ? 'Enviando...' : (smsForm.type === 'instant' ? 'Enviar Agora' : 'Agendar Envio') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Importação Excel -->
      <div v-if="showImportModal" class="modal-overlay" @click="closeImportModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title"><i class="fas fa-file-import"></i> Importar Contatos do Excel</h2>
            <button class="modal-close" @click="closeImportModal"><i class="fas fa-times"></i></button>
          </div>
          <div class="modal-body">
            <div class="import-instructions">
              <h4><i class="fas fa-info-circle"></i> Instruções</h4>
              <ul>
                <li>O arquivo deve estar no formato <strong>.xlsx</strong> ou <strong>.xls</strong></li>
                <li>A primeira linha deve conter os cabeçalhos das colunas</li>
                <li>Colunas obrigatórias: <strong>nome</strong> e <strong>telefone</strong></li>
                <li>Colunas opcionais: email, endereço, dívida, etc.</li>
              </ul>
            </div>
            <div class="form-group">
              <label class="form-label"><i class="fas fa-tag"></i> Categoria Principal <span class="required">*</span></label>
              <select v-model="importData.category_id" class="form-control form-select" required>
                <option value="">Selecione uma categoria</option>
                <option v-for="cat in categorias" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label"><i class="fas fa-file-excel"></i> Arquivo Excel <span class="required">*</span></label>
              <div class="file-upload-area" @dragover.prevent @drop.prevent="handleFileDrop">
                <input type="file" ref="fileInput" @change="handleFileSelect" accept=".xlsx,.xls" class="file-input" id="excel-file">
                <label for="excel-file" class="file-upload-label">
                  <div v-if="!importData.file" class="upload-placeholder">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <p><strong>Clique para selecionar</strong> ou arraste o arquivo aqui</p>
                    <small>Formatos aceitos: .xlsx, .xls</small>
                  </div>
                  <div v-else class="file-selected">
                    <i class="fas fa-file-excel"></i>
                    <div class="file-info">
                      <p class="file-name">{{ importData.file.name }}</p>
                      <p class="file-size">{{ formatFileSize(importData.file.size) }}</p>
                    </div>
                    <button type="button" class="btn-remove-file" @click.prevent="removeFile"><i class="fas fa-times"></i></button>
                  </div>
                </label>
              </div>
            </div>
            <div v-if="importProgress.uploading" class="progress-container">
              <div class="progress-bar"><div class="progress-fill" :style="{ width: importProgress.percent + '%' }"></div></div>
              <p class="progress-text">{{ importProgress.message }}</p>
            </div>
            <div v-if="importResult" class="import-result" :class="importResult.type">
              <i :class="importResult.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
              <div class="result-content"><h4>{{ importResult.title }}</h4><p>{{ importResult.message }}</p></div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="closeImportModal" :disabled="importProgress.uploading"><i class="fas fa-times"></i> Cancelar</button>
            <button class="btn btn-accent" @click="importarExcel" :disabled="!importData.file || !importData.category_id || importProgress.uploading">
              <i :class="importProgress.uploading ? 'fas fa-spinner fa-spin' : 'fas fa-upload'"></i>
              {{ importProgress.uploading ? 'Importando...' : 'Importar Contatos' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Modal de Detalhes do Contato -->
      <div v-if="showModal" class="modal-overlay" @click="closeModal">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2 class="modal-title"><i class="fas fa-user"></i> Detalhes do Contato</h2>
            <button class="modal-close" @click="closeModal"><i class="fas fa-times"></i></button>
          </div>
          <div v-if="contatoSelecionado" class="modal-body">
            <div class="detail-section">
              <div class="detail-avatar" :style="{ background: contatoSelecionado.category?.color || '#2563eb' }">
                {{ getInitials(contatoSelecionado.name) }}
              </div>
              <h3>{{ contatoSelecionado.name }}</h3>
            </div>
            <div class="detail-grid">
              <div class="detail-item">
                <i class="fas fa-phone"></i>
                <div><div class="detail-label">Telefone</div><div class="detail-value">{{ formatPhone(contatoSelecionado.phone) }}</div></div>
              </div>
              <div class="detail-item" v-if="contatoSelecionado.email">
                <i class="fas fa-envelope"></i>
                <div><div class="detail-label">Email</div><div class="detail-value">{{ contatoSelecionado.email }}</div></div>
              </div>
              <div class="detail-item">
                <i class="fas fa-tags"></i>
                <div>
                  <div class="detail-label">Categorias</div>
                  <div class="detail-value">
                    <div v-if="contatoSelecionado.category" class="detail-category principal">
                      <span class="badge" :style="{ background: contatoSelecionado.category.color + '20', color: contatoSelecionado.category.color }">
                        <i class="fas fa-star"></i> {{ contatoSelecionado.category.name }}
                      </span>
                    </div>
                    <div v-if="contatoSelecionado.extra_categories?.length" class="detail-categories-extra">
                      <span v-for="cat in contatoSelecionado.extra_categories" :key="cat.id" class="badge" 
                        :style="{ background: cat.color + '15', color: cat.color }">
                        {{ cat.name }}
                      </span>
                    </div>
                    <span v-if="!contatoSelecionado.category && !contatoSelecionado.extra_categories?.length" class="text-muted">Sem categorias</span>
                  </div>
                </div>
              </div>
              <div class="detail-item">
                <i class="fas fa-circle-info"></i>
                <div><div class="detail-label">Status</div><div class="detail-value">{{ contatoSelecionado.status === 'active' ? 'Ativo' : 'Inativo' }}</div></div>
              </div>
            </div>
            <div class="detail-dates">
              <div><i class="fas fa-calendar-plus"></i> Criado em: {{ formatDateTime(contatoSelecionado.created_at) }}</div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="closeModal"><i class="fas fa-times"></i> Fechar</button>
            <button class="btn btn-primary" @click="editarContato(contatoSelecionado.id)"><i class="fas fa-edit"></i> Editar</button>
          </div>
        </div>
      </div>

    </div>
  </AppLayout>
</template>

<script>
import axios from 'axios';
import AppLayout from '../../components/AppLayout.vue';

export default {
  name: 'ContactsPage',
  components: { AppLayout },

  data() {
    return {
      isLoading: true,
      contatos: [],
      categorias: [],
      contatosSelecionados: [],
      selectAll: false,
      showModal: false,
      showImportModal: false,
      contatoSelecionado: null,

      filtros: { busca: '', categoria: '', status: '' },
      searchTimer: null,

      pagination: {
        current_page: 1, per_page: 15, total: 0, last_page: 1,
        from: 0, to: 0, next_page_url: null, prev_page_url: null
      },

      importData: { file: null, category_id: '' },
      importProgress: { uploading: false, percent: 0, message: '' },
      importResult: null,

      // MODAL GERENCIAR CATEGORIAS (Múltiplas categorias)
      showModalGerenciarCategorias: false,
      salvandoCategorias: false,
      contatoParaCategoria: null,
      formCategorias: {
        contato_id: null,
        categoria_principal: null,
        categorias_extra: []
      },

      // MODAL ALTERAR CATEGORIA PRINCIPAL (Lote)
      showModalAlterarCategoriaLote: false,
      alterandoCategoria: false,
      formLote: {
        categoria_id: null
      },

      // MODAL BLOQUEAR
      showModalBloquear: false,
      bloqueandoContato: false,
      contatoParaBloquear: null,
      formBloquear: { reason: '', notes: '' },

      // MODAL SMS
      showSMSModal: false,
      smsEnviando: false,
      smsDestinatarioNome: '',
      smsResult: null,
      smsForm: { name: '', message: '', type: 'instant', scheduledAt: '', clientIds: [] }
    };
  },

  computed: {
    temFiltrosAtivos() {
      return !!(this.filtros.busca || this.filtros.categoria || this.filtros.status);
    },
    categoriaNome() {
      const cat = this.categorias.find(c => c.id === parseInt(this.filtros.categoria));
      return cat ? cat.name : '';
    },
    dataHoraMinima() {
      const agora = new Date();
      agora.setMinutes(agora.getMinutes() + 5);
      return agora.toISOString().slice(0, 16);
    },
    stats() {
      const total = this.pagination.total;
      const ativos = this.contatos.filter(c => c.status === 'active').length;
      const inativos = this.contatos.filter(c => c.status === 'inactive').length;
      const comDivida = this.contatos.filter(c => parseFloat(c.debt_amount) > 0).length;
      return [
        { label: 'Total de Contatos', value: total, icon: 'fas fa-users', color: 'linear-gradient(135deg, #3B82F6, #2563EB)' },
        { label: 'Ativos', value: ativos, icon: 'fas fa-user-check', color: 'linear-gradient(135deg, #10B981, #059669)' },
        { label: 'Inativos', value: inativos, icon: 'fas fa-user-clock', color: 'linear-gradient(135deg, #F59E0B, #D97706)' },
        { label: 'Com Dívida', value: comDivida, icon: 'fas fa-money-bill-wave', color: 'linear-gradient(135deg, #EF4444, #DC2626)' }
      ];
    }
  },

  methods: {
    getCategoriaById(id) {
      if (!id) return null;
      return this.categorias.find(c => c.id === id) || null;
    },

    // ===== MODAL GERENCIAR CATEGORIAS (Múltiplas categorias) =====
    abrirModalGerenciarCategorias(contato) {
      this.contatoParaCategoria = contato;
      this.formCategorias = {
        contato_id: contato.id,
        categoria_principal: contato.category_id || null,
        categorias_extra: (contato.extra_categories || []).map(c => c.id)
      };
      this.showModalGerenciarCategorias = true;
    },

    closeModalGerenciarCategorias() {
      if (this.salvandoCategorias) return;
      this.showModalGerenciarCategorias = false;
      this.contatoParaCategoria = null;
      this.formCategorias = {
        contato_id: null,
        categoria_principal: null,
        categorias_extra: []
      };
    },

    limparTodasCategorias() {
      if (confirm('Remover todas as categorias deste contato?')) {
        this.formCategorias.categoria_principal = null;
        this.formCategorias.categorias_extra = [];
      }
    },

    async salvarCategorias() {
      if (this.salvandoCategorias || !this.formCategorias.contato_id) return;
      
      this.salvandoCategorias = true;
      const token = localStorage.getItem('auth_token');

      try {
        const payload = {
          category_id: this.formCategorias.categoria_principal || null,
          extra_category_ids: this.formCategorias.categorias_extra
        };

        await axios.put(
          `https://api.devsms.online/api/v1/clients/${this.formCategorias.contato_id}`,
          payload,
          { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }
        );

        // Atualizar o contato na lista local
        const contatoIndex = this.contatos.findIndex(c => c.id === this.formCategorias.contato_id);
        if (contatoIndex !== -1) {
          // Buscar os dados atualizados do contato
          const response = await axios.get(
            `https://api.devsms.online/api/v1/clients/${this.formCategorias.contato_id}`,
            { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }
          );
          
          if (response.data && response.data.data) {
            this.contatos[contatoIndex] = response.data.data;
          }
        }

        alert('✅ Categorias atualizadas com sucesso!');
        this.closeModalGerenciarCategorias();
        
      } catch (error) {
        console.error('Erro ao salvar categorias:', error);
        alert('Erro ao salvar categorias. Por favor, tente novamente.');
      } finally {
        this.salvandoCategorias = false;
      }
    },

    // ===== MODAL ALTERAR CATEGORIA PRINCIPAL (Lote) =====
    abrirModalAlterarCategoriaLote() {
      this.formLote.categoria_id = '';
      this.showModalAlterarCategoriaLote = true;
    },

    closeModalAlterarCategoriaLote() {
      this.showModalAlterarCategoriaLote = false;
      this.formLote.categoria_id = null;
    },

    async salvarAlteracaoCategoriaLote() {
      if (this.alterandoCategoria || !this.contatosSelecionados.length) return;
      
      this.alterandoCategoria = true;
      const token = localStorage.getItem('auth_token');

      try {
        await Promise.all(
          this.contatosSelecionados.map(id =>
            axios.put(
              `https://api.devsms.online/api/v1/clients/${id}`,
              { category_id: this.formLote.categoria_id || null },
              { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }
            )
          )
        );

        alert('✅ Categoria principal alterada para todos os contatos selecionados!');
        this.closeModalAlterarCategoriaLote();
        this.contatosSelecionados = [];
        this.selectAll = false;
        this.fetchClients(this.pagination.current_page);
        
      } catch (error) {
        console.error('Erro ao alterar categoria em lote:', error);
        alert('Erro ao alterar categoria. Por favor, tente novamente.');
      } finally {
        this.alterandoCategoria = false;
      }
    },

    // MODAL BLOQUEAR
    abrirModalBloquear(contato) {
      this.contatoParaBloquear = contato;
      this.formBloquear = { reason: '', notes: '' };
      this.showModalBloquear = true;
    },
    
    closeModalBloquear() {
      this.showModalBloquear = false;
      this.contatoParaBloquear = null;
      this.formBloquear = { reason: '', notes: '' };
    },
    
    async salvarBloquear() {
      if (this.bloqueandoContato || !this.formBloquear.reason) return;
      
      this.bloqueandoContato = true;
      const token = localStorage.getItem('auth_token');
      
      try {
        await axios.post('https://api.devsms.online/api/v1/blacklist',
          { 
            phone: this.contatoParaBloquear.phone, 
            reason: this.formBloquear.reason, 
            notes: this.formBloquear.notes || null 
          },
          { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }
        );
        
        alert('✅ Contato adicionado à blacklist com sucesso!');
        this.closeModalBloquear();
        this.fetchClients(this.pagination.current_page);
        
      } catch (error) {
        console.error('Erro ao adicionar à blacklist:', error);
        alert(error.response?.data?.message || 'Erro ao adicionar contato à blacklist.');
      } finally {
        this.bloqueandoContato = false;
      }
    },

    // MODAL SMS
    abrirModalSMS(clientIds, nome = '') {
      this.smsForm = { 
        name: '', 
        message: '', 
        type: 'instant', 
        scheduledAt: '', 
        clientIds: [...clientIds] 
      };
      this.smsDestinatarioNome = nome;
      this.smsResult = null;
      this.smsEnviando = false;
      this.showSMSModal = true;
    },
    
    abrirModalSMSLote() { 
      this.abrirModalSMS([...this.contatosSelecionados]); 
    },
    
    fecharModalSMS() {
      if (this.smsEnviando) return;
      this.showSMSModal = false;
      this.smsResult = null;
    },
    
    async enviarSMSModal() {
      if (this.smsEnviando) return;
      
      if (!this.smsForm.name.trim()) { 
        alert('Por favor, informe o nome da campanha.'); 
        return; 
      }
      if (!this.smsForm.message.trim()) { 
        alert('Por favor, escreva a mensagem.'); 
        return; 
      }
      if (this.smsForm.type === 'scheduled' && !this.smsForm.scheduledAt) { 
        alert('Por favor, selecione a data e hora do envio.'); 
        return; 
      }
      
      this.smsEnviando = true;
      this.smsResult = null;
      const token = localStorage.getItem('auth_token');
      
      try {
        const payload = { 
          name: this.smsForm.name, 
          message_body: this.smsForm.message, 
          type: this.smsForm.type, 
          target_type: 'selected', 
          client_ids: this.smsForm.clientIds 
        };
        
        if (this.smsForm.type === 'scheduled') {
          payload.scheduled_at = this.smsForm.scheduledAt;
        }
        
        const response = await axios.post('https://api.devsms.online/api/v1/campaigns', payload,
          { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'application/json' } }
        );
        
        const campanhaId = response.data.data?.id || response.data?.id;
        
        if (this.smsForm.type === 'instant' && campanhaId) {
          await axios.post(`https://api.devsms.online/api/v1/campaigns/${campanhaId}/send`, {},
            { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }
          );
        }
        
        this.smsResult = {
          type: 'success',
          title: this.smsForm.type === 'instant' ? 'SMS enviado com sucesso!' : 'SMS agendado com sucesso!',
          message: this.smsForm.type === 'instant'
            ? `A mensagem foi enviada para ${this.smsForm.clientIds.length} destinatário(s).`
            : `O envio foi agendado para ${new Date(this.smsForm.scheduledAt).toLocaleString('pt-AO')}.`
        };
        
        setTimeout(() => { 
          this.contatosSelecionados = []; 
          this.selectAll = false; 
          this.fecharModalSMS(); 
        }, 2000);
        
      } catch (error) {
        this.smsResult = { 
          type: 'error', 
          title: 'Erro ao enviar SMS', 
          message: error.response?.data?.message || 'Ocorreu um erro.' 
        };
      } finally {
        this.smsEnviando = false;
      }
    },

    // ===== CONTATOS =====
    async fetchClients(page = 1) {
      this.isLoading = true;
      const token = localStorage.getItem('auth_token');
      
      try {
        const params = { page, per_page: this.pagination.per_page };
        if (this.filtros.busca.trim()) params.search = this.filtros.busca.trim();
        if (this.filtros.categoria) params.category_id = this.filtros.categoria;
        if (this.filtros.status) params.status = this.filtros.status;
        
        const response = await axios.get('https://api.devsms.online/api/v1/clients', {
          params,
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        
        const data = response.data.data;
        this.contatos = data.data;
        this.pagination = {
          current_page: data.current_page, 
          per_page: data.per_page, 
          total: data.total,
          last_page: data.last_page, 
          from: data.from, 
          to: data.to,
          next_page_url: data.next_page_url, 
          prev_page_url: data.prev_page_url
        };
        
      } catch (error) {
        console.error('Erro ao buscar contatos:', error);
        if (error.response?.status === 401) { 
          localStorage.removeItem('auth_token'); 
          this.$router.push('/login'); 
        } else {
          alert('Erro ao carregar contatos.');
        }
      } finally {
        this.isLoading = false;
      }
    },

    async fetchCategorias() {
      const token = localStorage.getItem('auth_token');
      try {
        const response = await axios.get('https://api.devsms.online/api/v1/categories', {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        this.categorias = response.data.data || response.data || [];
      } catch (error) {
        console.warn('Não foi possível carregar categorias:', error);
      }
    },

    onSearchInput() {
      clearTimeout(this.searchTimer);
      this.searchTimer = setTimeout(() => { this.aplicarFiltros(); }, 500);
    },
    
    aplicarFiltros() { 
      this.selectAll = false; 
      this.contatosSelecionados = []; 
      this.fetchClients(1); 
    },
    
    clearSearch() { 
      this.filtros.busca = ''; 
      this.aplicarFiltros(); 
    },
    
    resetFiltros() {
      clearTimeout(this.searchTimer);
      this.filtros = { busca: '', categoria: '', status: '' };
      this.selectAll = false;
      this.contatosSelecionados = [];
      this.fetchClients(1);
    },
    
    changePage(page) {
      if (page >= 1 && page <= this.pagination.last_page) {
        this.fetchClients(page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    
    toggleSelectAll() { 
      this.contatosSelecionados = this.selectAll ? this.contatos.map(c => c.id) : []; 
    },
    
    verDetalhes(contato) { 
      this.contatoSelecionado = contato; 
      this.showModal = true; 
    },
    
    closeModal() { 
      this.showModal = false; 
      this.contatoSelecionado = null; 
    },
    
    editarContato(id) { 
      this.$router.push({ name: 'Atualizar', params: { id } }); 
    },

    async excluirContato(id) {
      if (!confirm('Tem certeza que deseja excluir este contato?')) return;
      const token = localStorage.getItem('auth_token');
      try {
        await axios.delete(`https://api.devsms.online/api/v1/clients/${id}`, 
          { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }
        );
        alert('Contato excluído com sucesso!');
        this.fetchClients(this.pagination.current_page);
      } catch (error) { 
        alert('Erro ao excluir contato.'); 
      }
    },

    async excluirLote() {
      if (!confirm(`Deseja excluir ${this.contatosSelecionados.length} contatos selecionados?`)) return;
      const token = localStorage.getItem('auth_token');
      try {
        await Promise.all(this.contatosSelecionados.map(id =>
          axios.delete(`https://api.devsms.online/api/v1/clients/${id}`, 
            { headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' } }
          )
        ));
        alert('Contatos excluídos com sucesso!');
        this.contatosSelecionados = [];
        this.selectAll = false;
        this.fetchClients(this.pagination.current_page);
      } catch (error) { 
        alert('Erro ao excluir alguns contatos.'); 
      }
    },

    // ===== IMPORTAÇÃO =====
    handleFileSelect(event) { 
      const file = event.target.files[0]; 
      if (file) { 
        this.importData.file = file; 
        this.importResult = null; 
      } 
    },
    
    handleFileDrop(event) {
      const file = event.dataTransfer.files[0];
      if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) { 
        this.importData.file = file; 
        this.importResult = null; 
      } else {
        alert('Por favor, selecione um arquivo Excel (.xlsx ou .xls)');
      }
    },
    
    removeFile() { 
      this.importData.file = null; 
      if (this.$refs.fileInput) this.$refs.fileInput.value = ''; 
    },
    
    async importarExcel() {
      if (!this.importData.file || !this.importData.category_id) { 
        alert('Por favor, selecione um arquivo e uma categoria'); 
        return; 
      }
      
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('file', this.importData.file);
      formData.append('category_id', this.importData.category_id);
      
      this.importProgress = { uploading: true, percent: 0, message: 'Enviando arquivo...' };
      this.importResult = null;
      
      try {
        const response = await axios.post('https://api.devsms.online/api/v1/clients/import', formData, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json', 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (e) => { 
            const p = Math.round((e.loaded * 100) / e.total); 
            this.importProgress.percent = p; 
            this.importProgress.message = `Enviando arquivo... ${p}%`; 
          }
        });
        
        if (response.data.success) {
          this.importResult = { 
            type: 'success', 
            title: 'Importação concluída!', 
            message: response.data.message || 'Os contatos foram importados com sucesso.' 
          };
          setTimeout(() => { 
            this.fetchClients(); 
            this.fetchCategorias(); 
          }, 2000);
        }
      } catch (error) {
        this.importResult = { 
          type: 'error', 
          title: 'Erro na importação', 
          message: error.response?.data?.message || 'Ocorreu um erro ao importar.' 
        };
      } finally {
        this.importProgress.uploading = false;
        this.importProgress.percent = 100;
      }
    },
    
    closeImportModal() {
      this.showImportModal = false;
      this.importData = { file: null, category_id: '' };
      this.importProgress = { uploading: false, percent: 0, message: '' };
      this.importResult = null;
      if (this.$refs.fileInput) this.$refs.fileInput.value = '';
    },

    // ===== FORMATAÇÃO =====
    formatFileSize(bytes) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024; 
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
    },
    
    getInitials(name) {
      if (!name) return '??';
      const parts = name.split(' ');
      if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      return name.substring(0, 2).toUpperCase();
    },
    
    formatPhone(phone) { 
      if (!phone) return '-'; 
      return phone.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3'); 
    },
    
    formatCurrency(amount) { 
      return new Intl.NumberFormat('pt-AO', { 
        style: 'currency', 
        currency: 'AOA', 
        minimumFractionDigits: 0 
      }).format(amount); 
    },
    
    formatDate(dateString) { 
      if (!dateString) return '-'; 
      return new Intl.DateTimeFormat('pt-AO', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }).format(new Date(dateString)); 
    },
    
    formatDateTime(dateString) { 
      if (!dateString) return '-'; 
      return new Intl.DateTimeFormat('pt-AO', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }).format(new Date(dateString)); 
    }
  },

  mounted() {
    this.fetchClients();
    this.fetchCategorias();
  },
  
  beforeUnmount() {
    clearTimeout(this.searchTimer);
  }
};
</script>




<style scoped>
:root {
  --primary: #3b82f6; --success: #10b981; --warning: #f59e0b; --danger: #ef4444;
  --gray-50: #f9fafb; --gray-100: #f3f4f6; --gray-200: #e5e7eb; --gray-300: #d1d5db;
  --gray-400: #9ca3af; --gray-500: #6b7280; --gray-600: #4b5563; --gray-700: #374151; --gray-800: #1f2937;
}
.contacts-page { padding: 2rem; max-width: 1400px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
.page-title { font-size: 2rem; font-weight: 700; color: var(--gray-800); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.75rem; }
.page-description { color: var(--gray-600); font-size: 1rem; }
.header-actions { display: flex; gap: 1rem; }
.grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
.stat-card { background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,.08); display: flex; align-items: center; gap: 1rem; transition: transform .2s ease; }
.stat-card:hover { transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,0,0,.12); }
.stat-icon { width: 60px; height: 60px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; color: white; flex-shrink: 0; }
.stat-value { font-size: 1.75rem; font-weight: 700; color: var(--gray-800); line-height: 1; margin-bottom: 0.25rem; }
.stat-label { color: var(--gray-600); font-size: 0.875rem; }
.card { background: white; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
.card-header { padding: 1.5rem; border-bottom: 1px solid var(--gray-200); display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 1.25rem; font-weight: 700; color: var(--gray-800); display: flex; align-items: center; gap: 0.5rem; margin: 0; }
.card-header-actions { display: flex; align-items: center; gap: 1rem; }
.contacts-count { color: var(--gray-600); font-size: 0.938rem; display: flex; align-items: center; gap: 0.5rem; }
.card-body { padding: 1.5rem; }
.search-input-wrapper { position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 0.875rem; color: var(--gray-400); pointer-events: none; z-index: 1; }
.search-input { padding-left: 2.5rem !important; padding-right: 2.5rem !important; }
.search-clear { position: absolute; right: 0.75rem; background: none; border: none; color: var(--gray-400); cursor: pointer; padding: 0.25rem; border-radius: 4px; display: flex; align-items: center; justify-content: center; }
.active-filters { display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem; margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--gray-200); }
.active-filters-label { font-size: 0.813rem; font-weight: 600; color: var(--gray-600); display: flex; align-items: center; gap: 0.375rem; }
.filter-tag { display: inline-flex; align-items: center; gap: 0.375rem; background: rgba(59,130,246,.1); color: #2563eb; font-size: 0.813rem; font-weight: 600; padding: 0.25rem 0.5rem 0.25rem 0.75rem; border-radius: 20px; border: 1px solid rgba(59,130,246,.3); }
.filter-tag button { background: none; border: none; cursor: pointer; color: #2563eb; display: flex; align-items: center; padding: 0; font-size: 0.75rem; }
.btn-clear-all { background: none; border: 1px solid var(--gray-300); color: var(--gray-600); font-size: 0.813rem; font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 20px; cursor: pointer; margin-left: auto; }
.form-group { margin-bottom: 1rem; }
.form-control { width: 100%; padding: 0.625rem 1rem; border: 1px solid var(--gray-300); border-radius: 8px; font-size: 0.938rem; box-sizing: border-box; }
.form-control:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(59,130,246,.1); }
.form-select { background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right 0.75rem center; background-size: 16px 12px; padding-right: 2.5rem; }
.mb-0 { margin-bottom: 0 !important; } .mb-3 { margin-bottom: 1.5rem; } .mb-4 { margin-bottom: 2rem; }
.filter-buttons { display: flex; gap: 0.5rem; }
.loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; gap: 1rem; }
.spinner { width: 50px; height: 50px; border: 4px solid var(--gray-200); border-top-color: var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.empty-state { text-align: center; padding: 4rem 2rem; }
.empty-state i { font-size: 4rem; color: var(--gray-300); margin-bottom: 1rem; }
.empty-state h3 { font-size: 1.5rem; font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem; }
.empty-state p { color: var(--gray-600); margin-bottom: 2rem; }
.table-responsive { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; }
.table thead { background: var(--gray-50); }
.table th { padding: 1rem; text-align: left; font-weight: 600; color: var(--gray-700); font-size: 0.875rem; border-bottom: 2px solid var(--gray-200); white-space: nowrap; }
.table td { padding: 1rem; border-bottom: 1px solid var(--gray-200); font-size: 0.938rem; vertical-align: middle; }
.table tbody tr:hover { background: var(--gray-50); }
.contact-name { display: flex; align-items: center; gap: 0.75rem; }
.avatar { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.875rem; flex-shrink: 0; }
.contact-info .name { font-weight: 600; color: var(--gray-800); margin-bottom: 0.125rem; }
.contact-info .location { font-size: 0.813rem; color: var(--gray-600); display: flex; align-items: center; gap: 0.25rem; }
.phone-link { color: var(--primary); text-decoration: none; display: inline-flex; align-items: center; gap: 0.375rem; }
.verified-badge { color: var(--success); margin-left: 0.375rem; }
.email-link { color: var(--gray-700); text-decoration: none; display: inline-flex; align-items: center; gap: 0.375rem; font-size: 0.875rem; }
.text-muted { color: var(--gray-400); }

/* Múltiplas categorias */
.categories-cell { display: flex; flex-wrap: wrap; gap: 0.3rem; max-width: 200px; }
.badge-category { padding: 0.2rem 0.55rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; border: 1px solid; display: inline-block; white-space: nowrap; }
.badge-category-extra { font-size: 0.7rem; opacity: 0.8; }

.debt-amount { color: var(--danger); font-weight: 600; }
.badge { padding: 0.375rem 0.75rem; border-radius: 20px; font-size: 0.813rem; font-weight: 600; display: inline-flex; align-items: center; gap: 0.375rem; }
.badge-success { background: rgba(16,185,129,.1); color: var(--success); }
.badge-warning { background: rgba(245,158,11,.1); color: var(--warning); }
.status-dot { font-size: 0.5rem; }
.opt-out-badge { color: var(--danger); margin-left: 0.375rem; }
.sms-count { display: flex; align-items: center; gap: 0.375rem; color: var(--gray-700); font-weight: 600; margin-bottom: 0.125rem; }
.last-sms { font-size: 0.75rem; color: var(--gray-500); }
.actions { white-space: nowrap; }
.actions button { margin-right: 0.25rem; }
.pagination { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--gray-200); }
.pagination-info { color: var(--gray-600); font-size: 0.938rem; }
.batch-actions { position: fixed; bottom: 2rem; right: 2rem; background: white; padding: 1.5rem; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,.2); display: flex; flex-direction: column; gap: 1rem; z-index: 100; min-width: 300px; animation: slideUp .3s ease; }
.batch-info { display: flex; align-items: center; gap: 0.5rem; color: var(--gray-800); }
.batch-info i { color: var(--primary); font-size: 1.25rem; }
.batch-buttons { display: flex; gap: 0.5rem; flex-wrap: wrap; }

/* ALERT */
.alert-warning { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 1rem; display: flex; gap: 0.75rem; margin-top: 1rem; }
.alert-warning i { color: #f59e0b; font-size: 1.25rem; flex-shrink: 0; }
.alert-warning strong { color: #92400e; display: block; margin-bottom: 0.25rem; }
.alert-warning p { color: #78350f; margin: 0; font-size: 0.875rem; }

/* ==========================================
   MODAL GERENCIAR CATEGORIAS
   ========================================== */
.modal-categoria { max-width: 700px !important; }

.modal-header-info { display: flex; align-items: center; gap: 1rem; flex: 1; }
.modal-header-avatar { width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1rem; flex-shrink: 0; }
.modal-subtitle-contact { color: var(--gray-500); font-size: 0.875rem; margin: 0.2rem 0 0; }

.categoria-section { margin-bottom: 1.75rem; }

.categoria-section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.625rem;
  border-bottom: 2px solid var(--gray-100);
}
.categoria-section-header > span:first-of-type { font-weight: 700; color: var(--gray-800); font-size: 0.938rem; }
.categoria-hint { font-size: 0.75rem; color: var(--gray-400); margin-left: auto; }

.categorias-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.625rem; }

.categoria-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 0.875rem;
  border: 2px solid var(--gray-200);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
  user-select: none;
}
.categoria-card input { position: absolute; opacity: 0; pointer-events: none; }
.categoria-card:hover { border-color: #93c5fd; background: #eff6ff; transform: translateY(-1px); box-shadow: 0 3px 8px rgba(0,0,0,.07); }
.categoria-card-selected { border-color: #3b82f6 !important; background: rgba(59,130,246,.06) !important; }

.categoria-card-color { width: 28px; height: 28px; border-radius: 7px; flex-shrink: 0; }
.categoria-none-color { background: var(--gray-200); display: flex; align-items: center; justify-content: center; color: var(--gray-400); font-size: 0.75rem; }

.categoria-card-body { flex: 1; display: flex; flex-direction: column; gap: 0.125rem; min-width: 0; }
.categoria-card-name { font-size: 0.813rem; font-weight: 600; color: var(--gray-700); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.categoria-card-count { font-size: 0.7rem; color: var(--gray-400); display: flex; align-items: center; gap: 0.2rem; }

.categoria-check { font-size: 0.9rem; opacity: 0; transition: opacity 0.2s; flex-shrink: 0; color: #3b82f6; }
.categoria-card-selected .categoria-check { opacity: 1; }

.categorias-empty { text-align: center; padding: 1.5rem; color: var(--gray-400); font-size: 0.875rem; background: var(--gray-50); border-radius: 8px; border: 1px dashed var(--gray-200); display: flex; align-items: center; justify-content: center; gap: 0.5rem; }

.categoria-resumo { display: flex; gap: 0.875rem; align-items: flex-start; padding: 1rem 1.25rem; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; margin-top: 0.5rem; }
.categoria-resumo > i { color: #3b82f6; font-size: 1rem; margin-top: 0.125rem; flex-shrink: 0; }
.categoria-resumo > div > strong { font-size: 0.875rem; color: #1d4ed8; display: block; margin-bottom: 0.625rem; }
.resumo-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.resumo-tag { padding: 0.25rem 0.7rem; border-radius: 20px; font-size: 0.813rem; font-weight: 600; border: 1px solid; }
.resumo-tag-primary i { margin-right: 0.25rem; font-size: 0.7rem; }

/* SMS MODAL */
.sms-modal { max-width: 540px !important; }
.sms-modal-header { display: flex; align-items: center; gap: 1rem; padding: 1.75rem 2rem; border-bottom: 1px solid var(--gray-200); background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%); }
.sms-modal-header-icon { width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #3B82F6, #2563EB); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.25rem; flex-shrink: 0; }
.sms-modal-title { font-size: 1.375rem; font-weight: 700; color: var(--gray-800); margin: 0 0 0.25rem; }
.sms-modal-subtitle { font-size: 0.875rem; color: var(--gray-600); margin: 0; display: flex; align-items: center; gap: 0.375rem; }
.sms-modal-body { padding: 1.75rem 2rem; display: flex; flex-direction: column; gap: 1.25rem; }
.sms-form-group { display: flex; flex-direction: column; gap: 0.5rem; }
.sms-form-label { font-size: 0.875rem; font-weight: 600; color: var(--gray-700); display: flex; align-items: center; gap: 0.4rem; }
.required { color: #ef4444; }
.sms-form-input { width: 100%; padding: 0.75rem 1rem; border: 2px solid var(--gray-200); border-radius: 10px; font-size: 0.938rem; box-sizing: border-box; font-family: inherit; }
.sms-form-input:focus { outline: none; border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,.12); }
.sms-textarea { resize: vertical; min-height: 110px; line-height: 1.6; }
.sms-type-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.sms-type-card { position: relative; display: flex; align-items: center; gap: 0.875rem; padding: 1rem 1.125rem; border: 2px solid var(--gray-200); border-radius: 10px; cursor: pointer; transition: all .2s; background: white; }
.sms-type-card input { position: absolute; opacity: 0; pointer-events: none; }
.sms-type-card:hover { border-color: #93c5fd; background: #eff6ff; }
.sms-type-selected { border-color: #3B82F6 !important; background: #eff6ff !important; }
.sms-type-icon { width: 38px; height: 38px; border-radius: 8px; background: linear-gradient(135deg, #3B82F6, #2563EB); color: white; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; }
.sms-type-info { display: flex; flex-direction: column; gap: 0.125rem; flex: 1; }
.sms-type-info strong { font-size: 0.9rem; font-weight: 700; color: var(--gray-800); }
.sms-type-info small { font-size: 0.75rem; color: var(--gray-500); }
.sms-check { color: #3B82F6; font-size: 1rem; opacity: 0; transition: opacity .2s; }
.sms-type-selected .sms-check { opacity: 1; }
.sms-scheduled-box { padding: 1.125rem; background: #eff6ff; border: 2px solid #93c5fd; border-radius: 10px; }
.sms-hint { font-size: 0.813rem; color: var(--gray-500); display: flex; align-items: center; gap: 0.35rem; margin-top: 0.375rem; }
.sms-result { display: flex; align-items: flex-start; gap: 0.875rem; padding: 1rem 1.25rem; border-radius: 10px; font-size: 0.9rem; }
.sms-result.success { background: #f0fdf4; border: 1px solid #86efac; color: #166534; }
.sms-result.error { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
.sms-result i { font-size: 1.25rem; flex-shrink: 0; margin-top: 0.125rem; }
.sms-result strong { display: block; font-weight: 700; margin-bottom: 0.25rem; }
.sms-result p { margin: 0; }
.sms-modal-footer { display: flex; justify-content: flex-end; gap: 0.875rem; padding: 1.25rem 2rem; border-top: 1px solid var(--gray-200); background: var(--gray-50); }

/* MODAIS */
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,.6); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; animation: fadeIn .2s ease; }
.modal-content { background: white; border-radius: 20px; max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,.3); animation: slideUp .3s ease; }
.modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid var(--gray-200); display: flex; justify-content: space-between; align-items: center; }
.modal-title { font-size: 1.375rem; font-weight: 700; color: var(--gray-800); display: flex; align-items: center; gap: 0.5rem; margin: 0; }
.modal-close { width: 36px; height: 36px; border: none; background: var(--gray-100); color: var(--gray-600); border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.125rem; transition: all .2s; flex-shrink: 0; }
.modal-close:hover { background: var(--gray-200); color: var(--gray-800); }
.modal-body { padding: 2rem; }
.modal-footer { padding: 1.5rem 2rem; border-top: 1px solid var(--gray-200); display: flex; justify-content: flex-end; gap: 1rem; }
.form-label { display: block; font-weight: 600; color: var(--gray-700); margin-bottom: 0.5rem; }
.form-text { display: block; font-size: 0.813rem; color: var(--gray-500); margin-top: 0.375rem; }

/* IMPORTAÇÃO */
.import-instructions { background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; }
.import-instructions h4 { font-size: 1rem; font-weight: 700; color: #0369a1; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem; }
.import-instructions ul { margin: 0; padding-left: 1.5rem; color: #075985; }
.import-instructions li { margin-bottom: 0.5rem; line-height: 1.6; }
.file-upload-area { position: relative; }
.file-input { position: absolute; width: .1px; height: .1px; opacity: 0; overflow: hidden; z-index: -1; }
.file-upload-label { display: block; border: 2px dashed var(--gray-300); border-radius: 12px; padding: 2rem; text-align: center; cursor: pointer; }
.file-upload-label:hover { border-color: var(--primary); }
.upload-placeholder i { font-size: 3rem; color: var(--gray-400); margin-bottom: 1rem; }
.upload-placeholder p { color: var(--gray-700); margin-bottom: 0.5rem; }
.upload-placeholder small { color: var(--gray-500); font-size: 0.813rem; }
.file-selected { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: #f0fdf4; border: 2px solid #86efac; border-radius: 12px; }
.file-selected i { font-size: 2.5rem; color: #16a34a; }
.file-info { flex: 1; text-align: left; }
.file-name { font-weight: 600; color: var(--gray-800); margin-bottom: 0.25rem; }
.file-size { font-size: 0.875rem; color: var(--gray-600); margin: 0; }
.btn-remove-file { width: 32px; height: 32px; border-radius: 50%; border: none; background: rgba(239,68,68,.1); color: #dc2626; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.progress-container { margin-top: 1.5rem; padding: 1.5rem; background: var(--gray-50); border-radius: 12px; }
.progress-bar { width: 100%; height: 8px; background: var(--gray-200); border-radius: 9999px; overflow: hidden; margin-bottom: 0.75rem; }
.progress-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #2563eb); transition: width .3s; border-radius: 9999px; }
.progress-text { text-align: center; color: var(--gray-700); font-weight: 600; margin: 0; }
.import-result { margin-top: 1.5rem; padding: 1.5rem; border-radius: 12px; display: flex; gap: 1rem; align-items: flex-start; }
.import-result.success { background: #f0fdf4; border: 1px solid #86efac; }
.import-result.error { background: #fef2f2; border: 1px solid #fecaca; }
.import-result i { font-size: 1.5rem; margin-top: 0.25rem; }
.import-result.success i { color: #16a34a; }
.import-result.error i { color: #dc2626; }
.result-content h4 { margin: 0 0 0.5rem; }
.result-content p { margin: 0; color: var(--gray-700); }

/* DETALHES */
.detail-section { text-align: center; margin-bottom: 2rem; }
.detail-avatar { width: 80px; height: 80px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 1.75rem; margin: 0 auto 1rem; }
.detail-section h3 { font-size: 1.5rem; font-weight: 700; color: var(--gray-800); margin: 0; }
.detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
.detail-item { display: flex; align-items: flex-start; gap: 0.75rem; }
.detail-item > i { color: var(--primary); font-size: 1.25rem; margin-top: 0.125rem; }
.detail-label { font-size: 0.813rem; color: var(--gray-600); margin-bottom: 0.25rem; }
.detail-value { font-size: 1rem; font-weight: 600; color: var(--gray-800); }
.detail-dates { padding-top: 1.5rem; border-top: 1px solid var(--gray-200); font-size: 0.875rem; color: var(--gray-600); }
.detail-dates i { margin-right: 0.375rem; color: var(--primary); }

.btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1.25rem; border-radius: 8px; font-weight: 600; font-size: 0.938rem; border: none; cursor: pointer; transition: all .2s; text-decoration: none; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: var(--primary); color: white; }
.btn-primary:hover:not(:disabled) { background: #2563eb; transform: translateY(-1px); }
.btn-accent { background: linear-gradient(135deg, #3B82F6, #2563EB); color: white; }
.btn-accent:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(59,130,246,.4); }
.btn-ghost { background: transparent; color: var(--gray-600); border: 1px solid var(--gray-300); }
.btn-ghost:hover:not(:disabled) { background: var(--gray-100); color: var(--gray-800); }
.btn-outline { background: transparent; color: var(--primary); border: 1px solid var(--primary); }
.btn-outline:hover { background: rgba(59,130,246,.05); }
.btn-danger { background: var(--danger); color: white; }
.btn-danger:hover:not(:disabled) { background: #dc2626; }
.btn-sm { padding: 0.375rem 0.75rem; font-size: 0.875rem; }
.fade-in { animation: fadeIn .4s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@media (max-width: 768px) {
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .contacts-page { padding: 1rem; }
  .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
  .sms-type-cards { grid-template-columns: 1fr; }
  .categorias-grid { grid-template-columns: repeat(2, 1fr); }
}

.categoria-card-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--gray-50);
}

.categoria-card-disabled:hover {
  transform: none;
  border-color: var(--gray-200);
}

.categoria-badge-principal {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #f59e0b;
  color: white;
  font-size: 0.6rem;
  padding: 2px 6px;
  border-radius: 12px;
  font-weight: 600;
  z-index: 2;
}

.categoria-acoes-rapidas {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gray-200);
  display: flex;
  justify-content: center;
}

.btn-link {
  background: none;
  border: none;
  color: var(--gray-500);
  font-size: 0.875rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-link:hover {
  color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
}

.modal-subtitle-phone {
  font-size: 0.813rem;
  color: var(--gray-600);
  margin: 0.25rem 0 0 0;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.detail-category {
  margin-bottom: 0.5rem;
}

.detail-categories-extra {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.detail-categories-extra .badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
}

/* Melhorias na visualização de categorias na tabela */
.categories-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  max-width: 250px;
}

.badge-category {
  padding: 0.2rem 0.55rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid;
  display: inline-flex;
  align-items: center;
  white-space: nowrap;
}

.badge-category i {
  font-size: 0.6rem;
  margin-right: 0.2rem;
}

.badge-category-extra {
  font-size: 0.7rem;
  opacity: 0.9;
}
</style>