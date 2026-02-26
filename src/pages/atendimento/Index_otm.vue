<template>
  <div class="WAL position-relative bg-grey-3" :style="style">
    <q-layout class="WAL__layout shadow-3" container view="lHr LpR lFr">

      <q-drawer
        v-model="drawerTickets"
        @hide="drawerTickets = false"
        show-if-above
        :overlay="$q.screen.lt.md"
        persistent
        :breakpoint="769"
        bordered
        :width="$q.screen.lt.md ? $q.screen.width : 380"
        content-class="hide-scrollbar full-width"
      >
      <q-toolbar class="q-pr-none q-gutter-xs full-width" style="height: 64px">
          <q-btn-dropdown no-caps flat class="bg-padrao text-bold btn-rounded" ripple>
            <template v-slot:label>
              <!-- <div :style="{ maxWidth: $q.screen.lt.sm ? '120px' : '' }" class="ellipsis">
                {{ username }}
              </div> -->
                <div :style="{ maxWidth: $q.screen.lt.sm ? '120px' : '', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '20ch' }" class="ellipsis">
                  {{ username?.length > 13 ? username.slice(0, 13) + '...' : username }}
                </div>
            </template>
            <q-list style="min-width: 100px">
              <q-item clickable v-close-popup @click="abrirModalUsuario">
                <q-item-section>{{ $t('generalSupport.profile') }}</q-item-section>
              </q-item>
              <q-item clickable
                  v-close-popup
                  @click="clearCookies">
                  <q-item-section>{{ $t('mainLayout.cleanCookies') }}</q-item-section>
                </q-item>
              <q-item clickable v-close-popup @click="efetuarLogout">
                <q-item-section>{{ $t('generalSupport.logout') }}</q-item-section>
              </q-item>
              <q-separator />
              <q-item>
                <q-item-section>
                    <cSystemVersion  />
                  </q-item-section>
                </q-item>
            </q-list>
          </q-btn-dropdown>
          <q-space />
          <q-btn flat class="bg-padrao btn-rounded" icon="mdi-forum-outline" @click="() => $router.push({ name: 'chat-privado' })" :disable="loadingMount">
            <q-tooltip> {{ $t('generalSupport.inernalChat') }} </q-tooltip>
            <q-badge v-if="this.notificacaoInternaNaoLida > 0"
              color="red"
              floating
              class="badge-left"
            > {{ this.notificacaoInternaNaoLida }}</q-badge>
          </q-btn>
          <q-btn flat class="bg-padrao btn-rounded" icon="mdi-clipboard-list-outline" @click="tarefaEdicao = {}; modalTarefa = true" :disable="loadingMount">
            <q-tooltip> {{ $t('generalSupport.taskCreate') }} </q-tooltip>
          </q-btn>
          <q-btn style="margin-right: 5px;" flat class="bg-padrao btn-rounded" icon="mdi-home" @click="() => $router.push({ name: 'home' })" :disable="loadingMount">
            <q-tooltip> {{ $t('generalSupport.returnMenu') }} </q-tooltip>
          </q-btn>
        </q-toolbar>
        <q-linear-progress
          v-if="loadingMount"
          indeterminate
          color="primary"
          class="absolute-top"
          style="width: 100%;"
        />
        <StatusWhatsapp v-if="false" class="q-mx-sm full-width" />

        <!-- Barra de ações em massa moderna -->
        <transition name="slide-down">
          <div v-if="modoSelecaoMassa && ticketsSelecionados.size > 0" class="bulk-actions-bar">
            <div class="bulk-actions-content">
              <div class="bulk-actions-info">
                <q-icon name="mdi-checkbox-multiple-marked" size="24px" class="q-mr-sm" />
                <span class="text-weight-bold">
                  {{ ticketsSelecionados.size }} {{ ticketsSelecionados.size === 1 ? $t('generalSupport.ticketSelected') || 'ticket selecionado' : $t('generalSupport.ticketsSelected') || 'tickets selecionados' }}
                </span>
              </div>
              
              <div class="bulk-actions-buttons">
                <q-btn-dropdown
                  unelevated
                  rounded
                  color="primary"
                  icon="mdi-menu"
                  :label="$t('atendimentoInfoCabecalho.actions')"
                  class="q-mr-xs"
                  size="sm"
                >
                  <q-list>
                    <q-item 
                      clickable 
                      v-close-popup 
                      @click="abrirModalTransferirMassa"
                    >
                      <q-item-section avatar>
                        <q-icon name="mdi-transfer" color="primary" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t('atendimentoInfoCabecalho.transfer') }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    
                    <q-separator />
                    
                    <q-item 
                      clickable 
                      v-close-popup 
                      @click="abrirTicketsMassa"
                    >
                      <q-item-section avatar>
                        <q-icon name="mdi-play" color="positive" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t('atendimentoMixinAtualizar.titles.iniciar') }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    
                    <q-item 
                      clickable 
                      v-close-popup 
                      @click="retornarFilaTicketsMassa"
                    >
                      <q-item-section avatar>
                        <q-icon name="mdi-pause" color="warning" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t('atendimentoMixinAtualizar.titles.retornarFila') }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    
                    <q-separator />
                    
                    <q-item 
                      clickable 
                      v-close-popup 
                      @click="resolverTicketsMassa"
                    >
                      <q-item-section avatar>
                        <q-icon name="mdi-check-circle" color="positive" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t('atendimentoInfoCabecalho.resolve') }}</q-item-label>
                      </q-item-section>
                    </q-item>
                    
                    <q-item 
                      clickable 
                      v-close-popup 
                      @click="fecharTicketsMassa"
                    >
                      <q-item-section avatar>
                        <q-icon name="mdi-close-circle" color="negative" />
                      </q-item-section>
                      <q-item-section>
                        <q-item-label>{{ $t('atendimentoMixinAtualizar.titles.encerrarAtendimento') }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
                
                <q-btn 
                  flat
                  round
                  dense
                  icon="mdi-close"
                  @click="cancelarSelecaoMassa"
                  class="q-ml-sm"
                >
                  <q-tooltip>{{ $t('common.cancel') || 'Cancelar' }}</q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
        </transition>

        <q-toolbar class="items-center">
          <q-separator class="absolute-top" />
          <div class="full-width row items-center q-gutter-xs">
            <q-btn 
              v-if="!modoSelecaoMassa"
              flat 
              dense 
              round
              icon="mdi-checkbox-multiple-marked" 
              @click="ativarModoSelecaoMassa"
              class="q-mr-sm"
              :color="$q.dark.isActive ? 'white' : 'primary'"
            >
              <q-tooltip>{{ $t('generalSupport.selectMultiple') || 'Selecionar múltiplos' }}</q-tooltip>
            </q-btn>
            <q-btn 
              v-else
              flat 
              dense 
              round
              icon="mdi-close" 
              @click="cancelarSelecaoMassa"
              class="q-mr-sm"
              color="negative"
            >
              <q-tooltip>{{ $t('common.cancel') || 'Cancelar seleção' }}</q-tooltip>
            </q-btn>
            <q-tabs
              v-model="tabTickets"
              narrow-indicator
              dense
              :active-bg-color="$q.dark.isActive ? 'primary' : 'grey-3'"
              inline-label
              align="justify"
              :class="{
                'text-white': $q.dark.isActive,
                'text-black': !$q.dark.isActive
              }"
              class="btn-rounded"
            >
            <q-tab
              :ripple="false"
              name="private"
              icon="mdi-account-outline"
            >
            <q-badge
              v-if="contadorUniversal === 'enabled'"
              color="red"
              floating
              class="badge-left"
            > {{ privateMessages?.length }}</q-badge>
              <q-tooltip> {{ $t('generalSupport.privateChats') }}  </q-tooltip>
            </q-tab>
            <q-tab
              v-if="grupoAtivo === 'disabled'"
              :ripple="false"
              name="groups"
              icon="mdi-account-group-outline"
            >
            <q-badge
              v-if="contadorUniversal === 'enabled'"
              color="red"
              floating
              class="badge-left"
            > {{ groupMessages?.length }}</q-badge>
            <q-tooltip> {{ $t('generalSupport.groupChats') }}  </q-tooltip>
            </q-tab>
            </q-tabs>
          </div>
        </q-toolbar>

        <q-toolbar v-show="toolbarSearch" class="row q-gutter-sm q-py-sm items-center">
          <q-separator class="absolute-top" />
          <q-btn :icon="!cFiltroSelecionado ? 'mdi-filter-outline' : 'mdi-filter-plus'" flat class="bg-padrao btn-rounded" :color="cFiltroSelecionado ? 'deep-orange-9' : 'primary'" style="flex: 1; font-size: 12px">
            <q-menu content-class="shadow-10" square>
              <div class="row q-pa-sm" style="min-width: 350px; max-width: 350px;">
                <div class="q-ma-sm">
                  <div class="text-h6 q-mb-md">{{ $t('generalSupport.advancedFilter') }}</div>
                  <q-toggle
                    v-if="profile === 'admin' || (supervisorAdmin === 'disabled' && profile === 'super')" 
                    class="q-ml-lg"
                    v-model="pesquisaTickets.showAll"
                    :label="$t('generalSupport.viewTickets')"
                    :class="{ 'q-mb-lg': pesquisaTickets.showAll }"
                    @update:model-value="debounce(BuscarTicketFiltro(), 700)"
                  />
                  <q-toggle
                    v-if="(profile === 'admin' || (supervisorAdmin === 'disabled' && profile === 'super')) && pesquisaTickets.showAll"
                    class="q-ml-lg q-mt-md"
                    v-model="pesquisaTickets.includeClosed"
                    :label="$t('generalSupport.includeClosedTickets') || 'Incluir tickets fechados'"
                    @update:model-value="debounce(BuscarTicketFiltro(), 700)"
                  />
                  <q-separator class="q-mb-md" v-if="!pesquisaTickets.showAll"  />
                  <div v-if="!pesquisaTickets.showAll ">
                    <q-banner class="bg-yellow text-black q-mt-md" inline-actions>
                     {{ $t('generalSupport.advancedFilterNotice') }}
                    </q-banner>
                    <q-select
                      style="margin-top: 10px;"
                      :disable="pesquisaTickets.showAll || disableOthers('queues')"
                      square
                      dense
                      outlined
                      hide-bottom-space
                      emit-value
                      map-options
                      multiple
                      options-dense
                      use-chips
                      :label="$t('generalSupport.filterByQueues')"
                      color="primary"
                      v-model="pesquisaTickets.queuesIds"
                      :options="filasUser"
                      :input-debounce="700"
                      option-value="id"
                      option-label="queue"
                      @update:model-value="() => { updateSelectedFilter(); debounce(BuscarTicketFiltro(), 700) }"
                      input-style="width: 300px; max-width: 300px;"
                    />

                    <q-select
                      v-if="profile === 'admin' || (supervisorAdmin === 'disabled' && profile === 'super')" 
                      style="margin-top: 10px"
                      :disable="pesquisaTickets.showAll || disableOthers('whatsapp')"
                      square
                      dense
                      outlined
                      hide-bottom-space
                      emit-value
                      map-options
                      multiple
                      options-dense
                      use-chips
                      :label="$t('generalSupport.filterByConnections')"
                      color="primary"
                      v-model="pesquisaTickets.whatsappIds"
                      :options="whatsappOptions"
                      :input-debounce="700"
                      option-label="name"
                      option-value="id"
                      @update:model-value="() => { updateSelectedFilter(); debounce(BuscarTicketFiltro(), 700) }"
                      input-style="width: 300px; max-width: 300px;"
                    />

                    <q-select
                      v-if="profile === 'admin' || (supervisorAdmin === 'disabled' && profile === 'super')" 
                      style="margin-top: 10px"
                      :disable="pesquisaTickets.showAll || disableOthers('user')"
                      square
                      dense
                      outlined
                      hide-bottom-space
                      emit-value
                      map-options
                      multiple
                      options-dense
                      use-chips
                      :label="$t('generalSupport.filterByUser')"
                      color="primary"
                      v-model="pesquisaTickets.selectedUser"
                      :options="usuarios"
                      :input-debounce="700"
                      option-label="name"
                      option-value="id"
                      @update:model-value="updateSelectedFilter();debounce(BuscarTicketFiltro(), 700)"
                      input-style="width: 300px; max-width: 300px;"
                    />
                    
                    <q-select
                      v-if="profile === 'admin' || (supervisorAdmin === 'disabled' && profile === 'super')" 
                      style="margin-top: 10px"
                      square
                      dense
                      outlined
                      hide-bottom-space
                      :disable="pesquisaTickets.showAll || disableOthers('tag')"
                      v-model="selectedTag"
                      :options="etiquetas"
                      option-label="tag"
                      option-value="id"
                      :label="$t('generalSupport.filterByTags')"
                      clearable
                      @update:model-value="onTagChange"
                    />

                    <q-select
                      v-if="profile === 'admin' || (supervisorAdmin === 'disabled' && profile === 'super')" 
                      style="margin-top: 10px"
                      square
                      dense
                      outlined
                      hide-bottom-space
                      :disable="pesquisaTickets.showAll || disableOthers('kanban')"
                      v-model="selectedKanban"
                      :options="kanbans"
                      option-label="name"
                      option-value="id"
                       :label="$t('generalSupport.filterByKanban')"
                      clearable
                      @update:model-value="onKanbanChange"
                    />

                    <q-list dense class="q-my-md">
                      <q-item tag="label" v-ripple>
                        <q-item-section avatar>
                          <q-checkbox v-model="pesquisaTickets.status" val="open" color="primary" keep-color @update:model-value="() => debounce(BuscarTicketFiltro(), 700)" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('generalSupport.openTickets') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <!-- <q-item tag="label" v-ripple v-if="profile === 'admin'">
                        <q-item-section avatar>
                          <q-checkbox v-model="pesquisaTickets.showAll" color="negative" keep-color @update:model-value="debounce(BuscarTicketFiltro(), 700)" />
                          <q-checkbox v-model="pesquisaTickets.status" val="pending" color="negative" keep-color @update:model-value="() => debounce(BuscarTicketFiltro(), 700)" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>Pendentes</q-item-label>
                        </q-item-section>
                      </q-item> -->
                      <q-item tag="label" v-ripple>
                        <q-item-section avatar>
                          <q-checkbox v-model="pesquisaTickets.status" val="pending" color="negative" keep-color @update:model-value="debounce(BuscarTicketFiltro(), 700)" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('generalSupport.pendingTickets') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item tag="label" v-ripple>
                        <q-item-section avatar>
                          <q-checkbox v-model="pesquisaTickets.status" val="closed" color="positive" keep-color @update:model-value="() => debounce(BuscarTicketFiltro(), 700)" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('generalSupport.resolvedTickets') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                    <q-separator class="q-mb-md" />
                    <q-toggle v-model="pesquisaTickets.withUnreadMessages" 
                    :label="$t('generalSupport.unreadTicketsOnly')" 
                    @update:model-value="() => debounce(BuscarTicketFiltro(), 700)" />
                    <!-- <q-toggle v-model="pesquisaTickets.isNotAssignedUser" label="Somente Tickets não atribuidos (sem usuário definido)" @update:model-value="debounce(BuscarTicketFiltro(), 700)" /> -->
                  </div>
                  <q-separator class="q-my-md" spaced v-if="!pesquisaTickets.showAll" />
                  <q-btn class="float-right q-my-md" color="primary" :label="$t('common.close')" push v-close-popup />
                </div>
              </div>
            </q-menu>
            <q-tooltip> {{ $t('generalSupport.advancedFilter') }} </q-tooltip>
          </q-btn>
          <!-- <q-input v-model="pesquisaTickets.searchParam" dense outlined rounded type="search" class="col-grow" :debounce="700" @update:model-value="BuscarTicketFiltro()" style="flex: 2;">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input> -->
          <!-- <button @click="openWebphoneCall">Abrir WebphoneCall</button> -->
          <q-btn flat class="bg-padrao btn-rounded" icon="mdi-book-account-outline" @click="$q.screen.lt.md ? (modalNovoTicket = true) : $router.push({ name: 'chat-contatos' })" style="flex: 1; font-size: 12px;">
            <q-tooltip> {{ $t('generalSupport.contacts') }} </q-tooltip>
          </q-btn>
          <q-btn flat class="bg-padrao btn-rounded" icon="mdi-text-box-plus-outline" @click="loadMoreOpenTickets()" v-if="hasMoreTickets"  style="flex: 1; font-size: 12px">
            <q-tooltip> {{ $t('generalSupport.loadMore') }} </q-tooltip>
          </q-btn>
          <q-btn flat class="bg-padrao btn-rounded" :icon="!isReversed ? 'mdi-order-bool-ascending-variant' : 'mdi-order-bool-descending-variant'" @click="toggleOrder" style="flex: 1; font-size: 12px">
            <q-tooltip> {{ $t('generalSupport.reverseOrder') }}</q-tooltip>
          </q-btn>
          <!-- <q-btn flat class="bg-padrao btn-rounded" icon="mdi-phone-in-talk" @click="openWebphoneCall" style="flex: 1; font-size: 12px">
            <q-tooltip>{{ $t('generalSupport.openWavoip') }} </q-tooltip>
          </q-btn>
          <q-btn flat class="bg-padrao btn-rounded" icon="mdi-send-outline" @click="showModalMensagem = true"style="flex: 1; font-size: 12px">
            <q-tooltip> {{ $t('generalSupport.startNew') }} </q-tooltip>
          </q-btn>
          <q-btn flat class="bg-padrao btn-rounded" icon="mdi-share-variant" @click="openConvites()" style="flex: 1; font-size: 12px">
            <q-tooltip> Convites </q-tooltip>
            <q-badge v-if="convitesCount > 0" color="red" floating style="position: absolute; top: 4px; right: 4px;">
              {{ convitesCount }}
            </q-badge>
          </q-btn> -->
          <div style="position: relative; flex: 1;">
            <q-btn-dropdown
              flat
              class="bg-padrao btn-rounded"
              icon="mdi-dots-vertical"
              style="flex: 1; font-size: 12px">
              <q-list>
                <!-- <q-item clickable v-close-popup @click="openWebphoneCall">
                  <q-item-section avatar>
                    <q-icon name="mdi-phone-in-talk" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ $t('generalSupport.openWavoip') }}</q-item-label>
                  </q-item-section>
                </q-item> -->
                
                <q-item v-if="usuarioDados?.restrictedUser !== 'enabled'" clickable v-close-popup @click="showModalMensagem = true">
                  <q-item-section avatar>
                    <q-icon name="mdi-send-outline" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ $t('generalSupport.startNew') }}</q-item-label>
                  </q-item-section>
                </q-item>
                
                <q-item clickable v-close-popup @click="openConvites">
                  <q-item-section avatar>
                    <q-icon name="mdi-share-variant" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ $t('ticketCompartilhado.convites') }}</q-item-label>
                  </q-item-section>
                  <q-item-section side v-if="convitesCount > 0">
                    <q-badge color="red" floating style="position: absolute; top: 8px; right: 8px;">
                      {{ convitesCount }}
                    </q-badge>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
            <q-badge v-if="convitesCount > 0" color="red" floating style="position: absolute; top: -5px; left: -5px; width: 16px; height: 16px; border-radius: 50%; font-size: 9px; display: flex; align-items: center; justify-content: center; z-index: 10;">
              {{ convitesCount }}
            </q-badge>
          </div>
          <!-- <q-toolbar class="q-space-between q-flex items-right"> -->
          <!-- <q-btn
            v-if="hasMoreTickets"
            @click="loadMoreOpenTickets"
            class="q-ml-auto"
            style="z-index: 2;"
            icon="mdi-book-account-outline"
          >
          </q-btn> -->
        <!-- </q-toolbar> -->
          <q-separator class="absolute-bottom" />
        </q-toolbar>
        
        <q-toolbar v-show="toolbarSearch" class="row q-gutter-sm q-py-sm items-center">
          <!-- <q-separator class="absolute-top" /> -->
          <div class="relative-position" style="width: 100%; display: flex; flex: 1.95;">
            <q-badge
              v-if="pesquisaTickets.searchParam"
              color="primary"
              class="q-mb-xs"
              style="position: absolute; top: -30px; right: -20px; z-index: 1;"
            >
              {{ $t('generalSupport.looginForWarning1') }}<br> {{ $t('generalSupport.looginForWarning2') }}
            </q-badge>
            <q-input
              :placeholder="$t('generalSupport.lookingFor')"
              v-model="pesquisaTickets.searchParam"
              dense
              outlined
              rounded
              type="search"
              class="col-grow"
              :debounce="700"
              @update:model-value="BuscarTicketFiltro()"
              style="flex: 1.95;"
            >
              <template v-slot:append>
                <q-icon name="search" />
                <q-tooltip>{{ $t('generalSupport.searchTicket') }}</q-tooltip>
              </template>
            </q-input>
          </div>

          <!-- <q-input :placeholder="$t('generalSupport.lookingFor')" v-model="pesquisaTickets.searchParam" dense outlined rounded type="search" class="col-grow" :debounce="700" @update:model-value="BuscarTicketFiltro()" style="flex: 1.95;">
            <template v-slot:append>
              <q-badge v-if="pesquisaTickets.searchParam" color="primary" class="q-mr-sm">
                {{ pesquisaTickets.searchParam.length }} caracteres
              </q-badge>
              <q-icon name="search" />
              <q-tooltip> {{ $t('generalSupport.searchTicket') }} </q-tooltip>
            </template>
          </q-input> -->
          <q-btn flat class="bg-padrao btn-rounded col-3" icon="mdi-comment-search-outline" @click="abrirModal" style="flex: 0.05; min-width: 50px;">
            <q-tooltip> {{ $t('generalSupport.searchMessage') }} </q-tooltip>
          </q-btn>
          <q-separator class="absolute-bottom" />
        </q-toolbar>

        <q-toolbar v-show="toolbarSearch" class="row q-gutter-sm q-py-sm items-center" v-if="fixarConexao === 'enabled'">
          <q-toggle
            size="xl"
            keep-color
            dense
            class="text-bold q-ml-md flex flex-block"
            :icon-color="$q.dark.isActive ? 'black' : 'white'"
            :model-value="$q.dark.isActive"
            :color="$q.dark.isActive ? 'grey-3' : 'black'"
            checked-icon="mdi-white-balance-sunny"
            unchecked-icon="mdi-weather-sunny"
            @update:model-value="$setConfigsUsuario({ isDark: !$q.dark.isActive })"
          >
            <q-tooltip content-class="text-body1"> {{ $q.dark.isActive ? $t('generalSupport.deactivate') : $t('generalSupport.activate') }} {{ $t('generalSupport.toggleDarkMode') }} </q-tooltip>
          </q-toggle>
          <div class="flex flex-inline q-pt-xs">
            <q-scroll-area horizontal style="height: 40px; width: 300px">
              <template v-for="item in whatsapps" :key="item.id">
                  <q-btn rounded flat dense size="18px" class="q-mx-xs q-pa-none" :style="`opacity: ${item.status === 'CONNECTED' ? 1 : 0.2}`" :icon="`img:${item.type}-logo.png`">
                    <q-tooltip max-height="300px" :content-class="$q.dark.isActive ? 'bg-grey-9 text-white text-body1 hide-scrollbar' : 'bg-white text-grey-9 text-body1 hide-scrollbar'">
                      <ItemStatusChannel :item="item" />
                    </q-tooltip>
                  </q-btn>
              </template>
            </q-scroll-area>
          </div>
          <q-separator class="absolute-bottom" />
        </q-toolbar>

        <q-toolbar
          v-show="tabTickets === 'private'"
          class="items-center"
        >
          <div class="full-width q-py-xs">
            <q-tabs
              v-model="tabTicketsStatus"
              narrow-indicator
              dense
              align="justify"
              :active-bg-color="$q.dark.isActive ? 'primary' : 'grey-2'"
              class="text-primary btn-rounded"
            >
              <q-tab
                :ripple="false"
                name="open"
                icon="mdi-message-processing-outline"
                :label="$t('generalSupport.openTickets')"
                :class="{
                'text-white': $q.dark.isActive,
                'text-black': !$q.dark.isActive
                }"
              >
                <q-badge
                  color="red"
                  floating
                  class="badge-left"
                > {{ openTickets?.length }}</q-badge>
                <q-tooltip> {{ $t('generalSupport.privateChats') }} </q-tooltip>
              </q-tab>
              <q-tab
                :ripple="false"
                name="pending"
                icon="mdi-message-text-clock-outline"
                :label="$t('generalSupport.pendingTickets')"
                :class="{
                'text-white': $q.dark.isActive,
                'text-black': !$q.dark.isActive
                }"
              >
                <q-badge
                  color="red"
                  floating
                  class="badge-left"
                > {{ pendingTickets?.length }}</q-badge>
                <q-tooltip> {{ $t('generalSupport.privateChats') }} </q-tooltip>
              </q-tab>
              <q-tab
                v-if="chatBotLane === 'enabled'"
                :ripple="false"
                name="chatbot"
                icon="mdi-message-cog-outline"
                :label="$t('generalSupport.chatbot')"
                :class="{
                'text-white': $q.dark.isActive,
                'text-black': !$q.dark.isActive
                }"
              >
                <q-badge
                  color="red"
                  floating
                  class="badge-left"
                > {{ pendingTicketsChatBot?.length }}</q-badge>
                <q-tooltip> {{ $t('generalSupport.privateChats') }} </q-tooltip>
              </q-tab>
              <q-tab
                :ripple="false"
                name="closed"
                icon="mdi-message-text-lock-outline"
                :label="$t('generalSupport.resolvedTickets')"
                :class="{
                'text-white': $q.dark.isActive,
                'text-black': !$q.dark.isActive
                }"
              >
                <q-badge
                  color="red"
                  floating
                  class="badge-left"
                > {{ closedTickets?.length }}</q-badge>
                <q-tooltip> {{ $t('generalSupport.privateChats') }} </q-tooltip>
              </q-tab>
              
            </q-tabs>
          </div>
        </q-toolbar>

        <q-toolbar
          v-show="tabTickets === 'groups'"
          class="items-center"
        >
          <div class="full-width q-py-xs">
            <q-tabs
              v-model="tabTicketsStatus"
              narrow-indicator
              dense
              align="justify"
              :active-bg-color="$q.dark.isActive ? 'primary' : 'grey-2'"
              class="text-primary btn-rounded"
            >
              <q-tab
                :ripple="false"
                name="open"
                icon="mdi-message-processing"
                :label="$t('generalSupport.openTickets')"
                :class="{
                'text-white': $q.dark.isActive,
                'text-black': !$q.dark.isActive
                }"
              >
                <q-badge
                  color="red"
                  floating
                  class="badge-left"
                > {{ openGroupTickets?.length }}</q-badge>
                <q-tooltip> {{ $t('generalSupport.groupChats') }} </q-tooltip>
              </q-tab>
              <q-tab
                :ripple="false"
                name="pending"
                icon="mdi-message-text-clock"
                :label="$t('generalSupport.pendingTickets')"
                :class="{
                'text-white': $q.dark.isActive,
                'text-black': !$q.dark.isActive
                }"
              >
                <q-badge
                  color="red"
                  floating
                  class="badge-left"
                > {{ pendingGroupTickets?.length }}</q-badge>
                <q-tooltip> {{ $t('generalSupport.groupChats') }} </q-tooltip>
              </q-tab>
              <q-tab
                :ripple="false"
                name="closed"
                icon="mdi-message-text-lock"
                :label="$t('generalSupport.resolvedTickets')"
                :class="{
                'text-white': $q.dark.isActive,
                'text-black': !$q.dark.isActive
                }"
              >
                <q-badge
                  color="red"
                  floating
                  class="badge-left"
                > {{ closedGroupTickets?.length }}</q-badge>
                <q-tooltip> {{ $t('generalSupport.groupChats') }} </q-tooltip>
              </q-tab>
            </q-tabs>
          </div>
        </q-toolbar>
          
        <q-scroll-area
          ref="scrollAreaTickets" style="height: calc(100vh - 350px)"
          @scroll="onScroll"
        >

          <ItemTicket
            v-show="tabTickets === 'private' && tabTicketsStatus === 'open'"
            v-for="ticket in openTicketsReversed"
            :key="ticket.id"
            :ticket="ticket"
            :filas="filas"
            :modoSelecao="modoSelecaoMassa"
            :isSelecionado="ticketsSelecionados.has(ticket.id)"
            @toggle-selecao="toggleSelecaoTicket"
          />

          <ItemTicket
            v-show="tabTickets === 'private' && tabTicketsStatus === 'pending'"
            v-for="ticket in pendingTicketsReversed"
            :key="ticket.id"
            :ticket="ticket"
            :filas="filas"
            :modoSelecao="modoSelecaoMassa"
            :isSelecionado="ticketsSelecionados.has(ticket.id)"
            @toggle-selecao="toggleSelecaoTicket"
          />

          <ItemTicket
            v-show="tabTickets === 'private' && tabTicketsStatus === 'chatbot'"
            v-for="ticket in pendingTicketsChatbotReversed"
            :key="ticket.id+'bot'"
            :ticket="ticket"
            :filas="filas"
            :modoSelecao="modoSelecaoMassa"
            :isSelecionado="ticketsSelecionados.has(ticket.id)"
            @toggle-selecao="toggleSelecaoTicket"
          />

          <ItemTicket
            v-show="tabTickets === 'private' && tabTicketsStatus === 'closed'"
            v-for="ticket in closedTicketsReversed"
            :key="ticket.id"
            :ticket="ticket"
            :filas="filas"
            :modoSelecao="modoSelecaoMassa"
            :isSelecionado="ticketsSelecionados.has(ticket.id)"
            @toggle-selecao="toggleSelecaoTicket"
          />

          <ItemTicket
          v-show="tabTickets === 'groups' && tabTicketsStatus === 'open'"
            v-for="ticket in openTicketsGroupsReversed"
            :key="ticket.id"
            :ticket="ticket"
            :filas="filas"
            :modoSelecao="modoSelecaoMassa"
            :isSelecionado="ticketsSelecionados.has(ticket.id)"
            @toggle-selecao="toggleSelecaoTicket"
          />

          <ItemTicket
          v-show="tabTickets === 'groups' && tabTicketsStatus === 'pending'"
            v-for="ticket in pendingTicketsGroupsReversed"
            :key="ticket.id"
            :ticket="ticket"
            :filas="filas"
            :modoSelecao="modoSelecaoMassa"
            :isSelecionado="ticketsSelecionados.has(ticket.id)"
            @toggle-selecao="toggleSelecaoTicket"
          />

          <ItemTicket
          v-show="tabTickets === 'groups' && tabTicketsStatus === 'closed'"
            v-for="ticket in closedTicketsGroupsReversed"
            :key="ticket.id"
            :ticket="ticket"
            :filas="filas"
            :modoSelecao="modoSelecaoMassa"
            :isSelecionado="ticketsSelecionados.has(ticket.id)"
            @toggle-selecao="toggleSelecaoTicket"
          />

          <div v-if="loading">
            <div class="row justify-center q-my-md">
              <q-spinner
                color="white"
                size="3em"
                :thickness="3"
              />
            </div>
            <div class="row col justify-center q-my-sm text-white">
              {{ $t('generalSupportScript.loading') }}
            </div>
          </div>
        </q-scroll-area>

        <div class="absolute-bottom row justify-between" style="height: 50px" v-if="fixarConexao === 'disabled'">
          <q-toggle
            size="xl"
            keep-color
            dense
            class="text-bold q-ml-md flex flex-block"
            :icon-color="$q.dark.isActive ? 'black' : 'white'"
            :model-value="$q.dark.isActive"
            :color="$q.dark.isActive ? 'grey-3' : 'black'"
            checked-icon="mdi-white-balance-sunny"
            unchecked-icon="mdi-weather-sunny"
            @update:model-value="$setConfigsUsuario({ isDark: !$q.dark.isActive })"
          >
            <q-tooltip content-class="text-body1"> {{ $q.dark.isActive ? $t('generalSupport.deactivate') : $t('generalSupport.activate') }} {{ $t('generalSupport.toggleDarkMode') }}</q-tooltip>
          </q-toggle>
          <div class="flex flex-inline q-pt-xs">
            <q-scroll-area horizontal style="height: 40px; width: 300px">
              <template v-for="item in whatsapps" :key="item.id">
                  <q-btn rounded flat dense size="18px" class="q-mx-xs q-pa-none" :style="`opacity: ${item.status === 'CONNECTED' ? 1 : 0.2}`" :icon="`img:${item.type}-logo.png`">
                    <q-tooltip max-height="300px" :content-class="$q.dark.isActive ? 'bg-grey-9 text-white text-body1 hide-scrollbar' : 'bg-white text-grey-9 text-body1 hide-scrollbar'">
                      <ItemStatusChannel :item="item" />
                    </q-tooltip>
                  </q-btn>
              </template>
            </q-scroll-area>
          </div>
        </div>
      </q-drawer>

      <q-page-container>
        <router-view :mensagensRapidas="mensagensRapidas" :key="ticketFocado.id"></router-view>
      </q-page-container>
    
      <q-drawer v-if="!cRouteContatos && ticketFocado.id" v-model="drawerContact" show-if-above bordered side="right" content-class="bg-grey-1" @on-show="carregarIntegracaoStatus">
        <div class="bg-white full-width no-border-radius q-pa-sm" style="height: 60px">
          <span class="q-ml-md text-h6"> {{ $t('generalSupport.contactDetails.title') }} </span>
        </div>
        
        <q-scroll-area style="height: calc(100vh - 70px)">
          <div class="q-pa-sm bg-grey-1 contact-panel">
            <q-card class="bg-white btn-rounded" style="width: 100%" bordered flat>
              <q-card-section class="text-bold q-pa-sm">
                <div class="row items-center justify-between">
                  <q-btn flat class="btn-outline btn-small" @click="toggleDrawer" 
                  :label="$t('generalSupport.contactDetails.reduceMenu')"
                  icon="mdi-arrow-collapse-right" />
                </div>
              </q-card-section>
            </q-card>
            <q-card class="bg-white btn-rounded q-mt-sm" style="width: 100%; max-width: 100%;" bordered flat>
              <q-card-section class="text-center" style="max-width: 100%;">
                <q-avatar 
                  class="blur-effect" 
                  style="border: 1px solid #9e9e9ea1 !important; width: 100px; height: 100px; cursor: pointer;" 
                  @click="showImageModal = true">
                  <q-icon name="mdi-account" style="width: 100px; height: 100px" size="6em" color="grey-5" v-if="!ticketFocado.contact.profilePicUrl || ticketFocado.contact.profilePicUrl === 'null' || ticketFocado.contact.profilePicUrl === 'undefined'" />
                  <q-img 
                    v-if="ticketFocado.contact.profilePicUrl && ticketFocado.contact.profilePicUrl !== 'null' && ticketFocado.contact.profilePicUrl !== 'undefined'"
                    :src="ticketFocado.contact.profilePicUrl" 
                    :style="usuarioDados?.restrictedUser === 'enabled' ? 'width: 100px; height: 100px; filter: blur(8px);' : 'width: 100px; height: 100px'"
                    @error="handleImageError()"
                  >
                    <template v-slot:error>
                      <q-icon name="mdi-account" size="1.5em" color="grey-5" />
                    </template>
                  </q-img>
                  <q-badge
                    color="red"
                    text-color="white"
                    :label="ticketFocado.isGroup ? 'Grupo' : 'Privado'"
                    class="absolute-top-right"
                    style="top: -5px; right: -5px;"
                  />
                </q-avatar>
                <div class="contact-info blur-effect">
                  <div class="contact-details blur-effect">
                    <div class="contact-item">
                      <span class="contact-label">{{ $t('generalSupport.contactDetails.name') }}:</span>
                      <span class="contact-value">
                        <template v-if="usuarioDados?.restrictedUser === 'enabled'">
                          {{ (ticketFocado?.contact?.name || '').substring(0, 5) }}{{ (ticketFocado?.contact?.name || '').length > 5 ? '...' : '' }}
                        </template>
                        <template v-else>
                          {{ ticketFocado?.contact?.name || '' }}
                        </template>
                      </span>
                    </div>
                    <template v-if="usuarioDados?.restrictedUser !== 'enabled'">
                      <div class="contact-item blur-effect">
                        <span class="contact-label">{{ $t('generalSupport.contactDetails.phone') }}:</span>
                        <span class="contact-value">
                          <template v-if="(ticketFocado.contact.number && !ticketFocado.contact.number.includes('nulo') || ticketFocado.contact.hubWhatsapp)">
                            <a :href="getPhoneNumberLink(ticketFocado.contact.number || ticketFocado.contact.hubWhatsapp)">
                              {{ ticketFocado.contact.number || ticketFocado.contact.hubWhatsapp }}
                              
                            </a>
                          </template>
                        </span>
                      </div>
                      <div class="contact-item blur-effect" v-if="ticketFocado.contact.email">
                        <span class="contact-label">{{ $t('generalSupport.contactDetails.email') }}:</span>
                        <span class="contact-value">
                          <template v-if="ticketFocado.contact.email">
                            <a :href="'mailto:' + ticketFocado.contact.email">
                              {{ ticketFocado.contact.email.substring(0, 15) }}{{ ticketFocado.contact.email?.length > 15 ? '...' : '' }}
                            </a>
                          </template>
                          <template v-else>
                            {{ ticketFocado.contact.email || '' }}
                          </template>
                        </span>
                      </div>
                      <div class="contact-item blur-effect" v-if="ticketFocado.contact.cpf">
                        <span class="contact-label">{{ $t('generalSupport.contactDetails.cpf') }}:</span>
                        <span class="contact-value">
                          <template v-if="ticketFocado.contact.cpf">
                            {{ ticketFocado.contact.cpf }}
                          </template>
                          <template v-else>
                            {{ ticketFocado.contact.cpf || '' }}
                          </template>
                        </span>
                      </div>
                      <div class="contact-item blur-effect" v-if="ticketFocado.contact.birthdayDate">
                        <span class="contact-label">{{ $t('generalSupport.contactDetails.birthday') }}:</span>
                        <span class="contact-value">
                          <template v-if="ticketFocado.contact.birthdayDate">
                            {{ ticketFocado.contact.birthdayDate }}
                          </template>
                          <template v-else>
                            {{ ticketFocado.contact.birthdayDate || '' }}
                          </template>
                        </span>
                      </div>
                      <div class="contact-item blur-effect" v-if="ticketFocado.contact.firstName">
                        <span class="contact-label">{{ $t('generalSupport.contactDetails.firstName') }}:</span>
                        <span class="contact-value">
                          <template v-if="ticketFocado.contact.firstName">
                            {{ ticketFocado.contact.firstName.substring(0, 15) }}{{ ticketFocado.contact.firstName?.length > 15 ? '...' : '' }}
                          </template>
                          <template v-else>
                            {{ ticketFocado.contact.firstName || '' }}
                          </template>
                        </span>
                      </div>
                      <div class="contact-item blur-effect" v-if="ticketFocado.contact.lastName">
                        <span class="contact-label">{{ $t('generalSupport.contactDetails.lastName') }}:</span>
                        <span class="contact-value">
                          <template v-if="ticketFocado.contact.lastName">
                            {{ ticketFocado.contact.lastName.substring(0, 15) }}{{ ticketFocado.contact.lastName?.length > 15 ? '...' : '' }}
                          </template>
                          <template v-else>
                            {{ ticketFocado.contact.lastName || '' }}
                          </template>
                        </span>
                      </div>
                      <div class="contact-item blur-effect" v-if="ticketFocado.contact.businessName">
                        <span class="contact-label">{{ $t('generalSupport.contactDetails.businessName') }}:</span>
                        <span class="contact-value">
                          <template v-if="ticketFocado.contact.businessName">
                            {{ ticketFocado.contact.businessName.substring(0, 15) }}{{ ticketFocado.contact.businessName?.length > 15 ? '...' : '' }}
                          </template>
                          <template v-else>
                            {{ ticketFocado.contact.businessName || '' }}
                          </template>
                        </span>
                      </div>
                    </template>
                  </div>
                </div>
                <!-- <div class="text-caption q-mt-md blur-effect" style="font-size: 14px">
                  {{ ticketFocado?.contact?.name || '' }}
                </div>
                <div class="text-caption q-mt-sm blur-effect" style="font-size: 14px" id="number">
                  <template v-if="ticketFocado.contact.number">
                    <a :href="getPhoneNumberLink(ticketFocado.contact.number)">
                      {{ ticketFocado.contact.number }}
                    </a>
                  </template>
                </div>
                <div class="text-caption q-mt-md" style="font-size: 14px" id="email">
                  <template v-if="ticketFocado.contact.email">
                    <a :href="'mailto:' + ticketFocado.contact.email">{{ ticketFocado.contact.email }}</a>
                  </template>
                  <template v-else>
                    {{ ticketFocado.contact.email || '' }}
                  </template>
                </div>
                <div class="text-caption q-mt-md" style="font-size: 14px" id="email">
                  <template v-if="ticketFocado.contact.cpf">
                    {{ ticketFocado.contact.cpf }}
                  </template>
                  <template v-else>
                    {{ ticketFocado.contact.cpf || '' }}
                  </template>
                </div>
                <div class="text-caption q-mt-md" style="font-size: 14px" id="email">
                  <template v-if="ticketFocado.contact.birthdayDate">
                    {{ ticketFocado.contact.birthdayDate }}
                  </template>
                  <template v-else>
                    {{ ticketFocado.contact.birthdayDate || '' }}
                  </template>
                </div> -->
                <!-- <q-btn flat class="btn-outline btn-small" style="margin-right: 4px;" 
                  :label="$t('generalSupport.contactDetails.call')" 
                  @click="outcomingCall(ticketFocado)" 
                  v-if="ticketFocado.whatsapp.wavoipToken && !this.bloquearWavoip && desabilitarInputWebchat" 
                />
                <q-btn flat class="btn-outline btn-small" style="margin-right: 4px;"
                  label="Asterisk" 
                  @click="makeAsteriskCall(ticketFocado)" 
                  v-if="usuario.sipEnabled" 
                />
                <q-btn flat class="btn-outline btn-small"  
                  :label="$t('generalSupport.contactDetails.sms')" 
                  @click="abrirModalSMS(getPhoneNumberSMS(ticketFocado.contact.number))" 
                  v-if="smsAtivo && !ticketFocado.isGroup && desabilitarInputWebchat" 
                /> -->
                <q-btn flat class="btn-outline btn-small" style="margin-right: 4px;"
                  :label="$t('generalSupport.contactDetails.edit')" 
                  @click="editContact(ticketFocado.contact.id)" 
                  v-if="!ticketFocado.isGroup && desabilitarInputWebchat && usuarioDados?.restrictedUser !== 'enabled'"
                />
                <q-btn-dropdown
                  v-if="!ticketFocado.isGroup 
                  && desabilitarInputWebChat
                  && usuarioDados?.restrictedUser !== 'enabled'
                  && ((ticketFocado.whatsapp.wavoipToken && !bloquearWavoip) 
                  || usuario.sipEnabled 
                  || smsAtivo
                  || vapi)"
                  flat
                  class="btn-outline btn-small"
                  :label="$t('generalSupport.contactDetails.telephony')"
                  icon="mdi-phone"
                >
                  <q-list style="min-width: 150px">
                    <!-- <q-item
                      clickable
                      v-if="ticketFocado.whatsapp.wavoipToken && !bloquearWavoip && desabilitarInputWebchat"
                      @click="outcomingCall(ticketFocado)"
                    >
                      <q-item-section>
                        {{ $t('generalSupport.contactDetails.call') }}
                      </q-item-section>
                    </q-item> -->

                    <q-item
                      clickable
                      v-if="ticketFocado.whatsapp.wavoipToken && !bloquearWavoip && desabilitarInputWebchat"
                      @click="outcomingCallNovo(ticketFocado)"
                    >
                      <q-item-section>
                        {{ $t('generalSupport.contactDetails.call') }}
                      </q-item-section>
                    </q-item>

                    <q-item
                      clickable
                      v-if="usuario.sipEnabled"
                      @click="makeAsteriskCall(ticketFocado)"
                    >
                      <q-item-section>
                        {{ $t('generalSupport.contactDetails.asterisk') }}
                      </q-item-section>
                    </q-item>

                    <q-item
                      clickable
                      v-if="smsAtivo && !ticketFocado.isGroup && desabilitarInputWebchat"
                      @click="abrirModalSMS(getPhoneNumberSMS(ticketFocado.contact.number))"
                    >
                      <q-item-section>
                        {{ $t('generalSupport.contactDetails.sms') }}
                      </q-item-section>
                    </q-item>
                    <q-item
                      clickable
                      v-if="vapi"
                      @click="abrirModalVapi()"
                    >
                      <q-item-section>
                        {{ $t('generalSupport.contactDetails.vapi') }}
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
                <template v-if="cIsExtraInfo && usuarioDados?.restrictedUser !== 'enabled'">
                  <div class="contact-info blur-effect" style="width: 100%; max-width: 100%;">
                    <div class="contact-details blur-effect" style="width: 100%; max-width: 100%;">
                      <div class="contact-item blur-effect" v-for="(info, idx) in ticketFocado.contact.extraInfo" :key="idx" style="width: 100%; max-width: 100%; word-wrap: break-word; overflow-wrap: break-word; word-break: break-word;">
                        <span class="contact-value" style="word-wrap: break-word; overflow-wrap: break-word; white-space: normal; word-break: break-word; max-width: 100%; display: block; overflow-wrap: anywhere;">{{ info.name }}: {{ info.value }}</span>
                      </div>
                    </div>
                  </div>
                </template>
              </q-card-section>
            </q-card>
            <q-card class="bg-white btn-rounded q-mt-sm" style="width: 100%" bordered flat>
              <q-card-section class="text-bold q-pa-sm">
                <q-btn 
                  style="margin-right: 4px;"
                  icon="mdi-email-open-outline" 
                  flat 
                  class="btn-outline btn-small btn-wide" 
                  @click="atualizarLido(ticketFocado)" >
                  <q-tooltip content-class="bg-primary text-bold">
                    {{ $t('generalSupport.markasRead') }}
                  </q-tooltip>
                </q-btn>
                <q-btn 
                  style="margin-right: 4px;"
                  icon="mdi-email-outline" 
                  flat 
                  class="btn-outline btn-small btn-wide" 
                  @click="atualizarNaoLido(ticketFocado)" >
                  <q-tooltip content-class="bg-primary text-bold">
                    {{ $t('generalSupport.markasNoRead') }}
                  </q-tooltip>
                </q-btn>
                <q-btn flat class="btn-outline btn-small btn-wide" :label="$t('generalSupport.log')" icon="mdi-timeline-text-outline" @click="abrirModalLogs" />
              </q-card-section>
            </q-card>
            <q-card class="bg-white btn-rounded q-mt-sm" style="width: 100%" bordered flat v-if="(ticketFocado.channel === 'whatsapp')">
              <q-card-section class="text-bold q-pa-sm">
                <q-btn flat class="btn-outline btn-small" :label="$t('generalSupport.syncHistory')" icon="mdi-sync" @click="syncOldMessagesByUserWhatsapp(ticketFocado)" />
              </q-card-section>
            </q-card>

            <q-card class="bg-white btn-rounded q-mt-sm" style="width: 100%" bordered flat v-if="desabilitarInputWebchat">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('generalSupport.funil') }}</q-item-label>
                    <q-item-label caption>{{ $t('generalSupport.ticketFunil') }}. </q-item-label>
                  </q-item-section>
                </q-item>
              </q-card-section>
              <q-card-section class="q-pa-sm">
                <q-item>
                  <q-card-section class="text-bold q-pa-sm" style="flex: 1;">
                    <q-btn flat stack class="btn-outline btn-small btn-tile" :label="$t('common.funil')" icon="mdi-send-check" @click="abrirOpportunityForm" />
                  </q-card-section>
                  <q-card-section class="text-bold q-pa-sm" style="flex: 1;">
                    <q-btn flat stack class="btn-outline btn-small btn-tile" :label="$t('generalSupport.opportunities')" icon="mdi-timeline-text-outline" @click="abrirModalOportunidades" />
                  </q-card-section>
                </q-item>
              </q-card-section>
            </q-card>
            
            <q-card class="bg-white btn-rounded q-mt-sm" style="width: 100%" bordered flat v-if="ticketFocado.channel !== 'telegram' && desabilitarInputWebchat">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('generalSupport.protocol') }}</q-item-label>
                    <q-item-label caption>{{ $t('generalSupport.ticketProtocol') }}. </q-item-label>
                  </q-item-section>
                </q-item>
              </q-card-section>
              <q-card-section class="q-pa-sm">
                <q-item>
                  <q-card-section class="text-bold q-pa-sm" style="flex: 1;">
                    <q-btn flat stack class="btn-outline btn-small btn-tile" :label="$t('common.send')" icon="mdi-send-check" @click="sendProtocol(ticketFocado)" :disable="desabilitarInput" />
                  </q-card-section>
                  <q-card-section class="text-bold q-pa-sm" style="flex: 1;">
                    <q-btn flat stack class="btn-outline btn-small btn-tile" :label="$t('generalSupport.log')" icon="mdi-timeline-text-outline" @click="abrirModalProtocoloLogs" />
                  </q-card-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white btn-rounded q-mt-sm" style="width: 100%" bordered flat v-if="ticketFocado.channel !== 'telegram' && desabilitarInputWebchat">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('generalSupport.evaluation') }}</q-item-label>
                    <q-item-label caption>{{ $t('generalSupport.ticketEvaluation') }}. </q-item-label>
                  </q-item-section>
                </q-item>
              </q-card-section>
              <q-card-section class="q-pa-sm">
                <q-item>
                  <q-card-section class="text-bold q-pa-sm" style="flex: 1;">
                    <q-btn flat stack class="btn-outline btn-small btn-tile" :label="$t('common.send')" icon="mdi-send-check" @click="sendEvaluation(ticketFocado)" :disable="desabilitarInput" />
                  </q-card-section>
                  <q-card-section class="text-bold q-pa-sm" style="flex: 1;">
                    <q-btn flat stack class="btn-outline btn-small btn-tile" :label="$t('generalSupport.log')" icon="mdi-timeline-text-outline" @click="abrirModalAvaliacaoLogs" />
                  </q-card-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white btn-rounded q-mt-sm" style="width: 100%" bordered flat>
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('generalSupport.notes') }}</q-item-label>
                    <q-item-label caption>{{ $t('generalSupport.ticketNotes') }} </q-item-label>
                  </q-item-section>
                </q-item>
              </q-card-section>
              <q-card-section class="q-pa-sm">
                <q-item>
                  <q-card-section class="text-bold q-pa-sm" style="flex: 1;">
                    <q-btn flat stack class="btn-outline btn-small btn-tile" :label="$t('common.register')" icon="mdi-clipboard-text-multiple-outline" @click="abrirModalNota" />
                  </q-card-section>
                  <q-card-section class="text-bold q-pa-sm" style="flex: 1;">
                    <q-btn flat stack class="btn-outline btn-small btn-tile" :label="$t('generalSupport.log')" icon="mdi-timeline-text-outline" @click="abrirModalNotaLogs" />
                  </q-card-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white btn-rounded q-mt-sm" style="width: 100%" bordered flat>
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('generalSupport.extractConversations') }}</q-item-label>
                    <q-item-label caption>{{ $t('generalSupport.downloadPDF') }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-card-section>
              <q-card-section class="q-pa-sm">
                <q-item>
                  <q-card-section class="text-bold q-pa-sm" style="flex: 1;">
                    <q-btn :disable="loading" flat class="btn-outline btn-small" :label="$t('generalSupport.downloadPDF')" icon="mdi-clipboard-text-multiple-outline" @click="downloadPDF" />
                  </q-card-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`typebot-${ticketFocado.id}`" v-if="typebotAtivo === 'enabled' && !ticketFocado.isGroup && desabilitarInputWebchat">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>TypeBOT</q-item-label>
                    <q-item-label caption> {{ $t('generalSupport.typebotDescription') }}. </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-toggle
                      v-model="typebotStatus"
                      checked-icon="check"
                      keep-color
                      :color="typebotStatus ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                      @update:model-value="() => atualizarTypebot('typebotStatus')"
                    />
                  </q-item-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`dialogflow-${ticketFocado.id}`"  v-if="dialogflowAtivo === 'enabled' && (ticketFocado.channel === 'whatsapp' ) && !ticketFocado.isGroup && desabilitarInputWebchat">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>DialogFlow</q-item-label>
                    <q-item-label caption> {{ $t('generalSupport.dialogflowDescription') }}. </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-toggle
                      v-model="dialogflowStatus"
                      checked-icon="check"
                      keep-color
                      :color="dialogflowStatus ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                      @update:model-value="() => atualizarDialogflow('dialogflowStatus')"
                    />
                  </q-item-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`chatgpt-${ticketFocado.id}`"  v-if="chatgptAtivo === 'enabled' && !ticketFocado.isGroup && desabilitarInputWebchat">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>ChatGPT</q-item-label>
                    <q-item-label caption>  {{ $t('generalSupport.chatgptDescription') }}. </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-toggle
                      v-model="chatgptStatus"
                      checked-icon="check"
                      keep-color
                      :color="chatgptStatus ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                      @update:model-value="() => atualizarChatgpt('chatgptStatus')"
                    />
                  </q-item-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`n8n-${ticketFocado.id}`" v-if="n8nAtivo === 'enabled' && ticketFocado.channel !== 'telegram' && desabilitarInputWebchat">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>N8N</q-item-label>
                    <q-item-label caption> {{ $t('generalSupport.n8nDescription') }}. </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-toggle
                      v-model="n8nStatus"
                      checked-icon="check"
                      keep-color
                      :color="n8nStatus ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                      @update:model-value="() => atualizarN8N('n8nStatus')"
                    />
                  </q-item-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`dify-${ticketFocado.id}`" v-if="difyAtivo === 'enabled' && ticketFocado.channel !== 'telegram' && !ticketFocado.isGroup && desabilitarInputWebchat">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>Dify</q-item-label>
                    <q-item-label caption> {{ $t('generalSupport.difyDescription') }}. </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-toggle
                      v-model="difyStatus"
                      checked-icon="check"
                      keep-color
                      :color="difyStatus ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                      @update:model-value="() => atualizarDify('difyStatus')"
                    />
                  </q-item-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`ollama-${ticketFocado.id}`" v-if="ollamaAtivo === 'enabled' && ticketFocado.channel !== 'telegram' && !ticketFocado.isGroup && desabilitarInputWebchat">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>Ollama </q-item-label>
                    <q-item-label caption> {{ $t('generalSupport.ollamaDescription') }}. </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-toggle
                      v-model="ollamaStatus"
                      checked-icon="check"
                      keep-color
                      :color="ollamaStatus ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                      @update:model-value="() => atualizarOllama('ollamaStatus')"
                    />
                  </q-item-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`lm-${ticketFocado.id}`" v-if="lmAtivo === 'enabled' && ticketFocado.channel !== 'telegram' && !ticketFocado.isGroup && desabilitarInputWebchat">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>LM </q-item-label>
                    <q-item-label caption> {{ $t('generalSupport.lmDescription') }}. </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-toggle
                      v-model="lmStatus"
                      checked-icon="check"
                      keep-color
                      :color="lmStatus ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                      @update:model-value="() => atualizarLm('lmStatus')"
                    />
                  </q-item-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`grok-${ticketFocado.id}`" v-if="grokAtivo === 'enabled' && ticketFocado.channel !== 'telegram' && !ticketFocado.isGroup && desabilitarInputWebchat">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>Grok </q-item-label>
                    <q-item-label caption> {{ $t('generalSupport.grokDescription') }}. </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-toggle
                      v-model="grokStatus"
                      checked-icon="check"
                      keep-color
                      :color="grokStatus ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                      @update:model-value="() => atualizarGrok('grokStatus')"
                    />
                  </q-item-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`gemini-${ticketFocado.id}`" v-if="geminiAtivo === 'enabled' && ticketFocado.channel !== 'telegram' && !ticketFocado.isGroup && desabilitarInputWebchat">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>Gemini </q-item-label>
                    <q-item-label caption> {{ $t('generalSupport.geminiDescription') }}. </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-toggle
                      v-model="geminiStatus"
                      checked-icon="check"
                      keep-color
                      :color="geminiStatus ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                      @update:model-value="() => atualizarGemini('geminiStatus')"
                    />
                  </q-item-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`qwen-${ticketFocado.id}`" v-if="qwenAtivo === 'enabled' && ticketFocado.channel !== 'telegram' && !ticketFocado.isGroup && desabilitarInputWebchat">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>Qwen </q-item-label>
                    <q-item-label caption> {{ $t('generalSupport.qwenDescription') }}. </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-toggle
                      v-model="qwenStatus"
                      checked-icon="check"
                      keep-color
                      :color="qwenStatus ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                      @update:model-value="() => atualizarQwen('qwenStatus')"
                    />
                  </q-item-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`claude-${ticketFocado.id}`" v-if="claudeAtivo === 'enabled' && ticketFocado.channel !== 'telegram' && !ticketFocado.isGroup && desabilitarInputWebchat">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>Claude </q-item-label>
                    <q-item-label caption> {{ $t('generalSupport.claudeDescription') }}. </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-toggle
                      v-model="claudeStatus"
                      checked-icon="check"
                      keep-color
                      :color="claudeStatus ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                      @update:model-value="() => atualizarClaude('claudeStatus')"
                    />
                  </q-item-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`deepseek-${ticketFocado.id}`" v-if="deepseekAtivo === 'enabled' && ticketFocado.channel !== 'telegram' && !ticketFocado.isGroup && desabilitarInputWebchat">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>Deepseek </q-item-label>
                    <q-item-label caption> {{ $t('generalSupport.deepseekDescription') }}. </q-item-label>
                  </q-item-section>

                  <q-item-section avatar>
                    <q-toggle
                      v-model="deepseekStatus"
                      checked-icon="check"
                      keep-color
                      :color="deepseekStatus ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                      @update:model-value="() => atualizarDeepseek('deepseekStatus')"
                    />
                  </q-item-section>
                </q-item>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`kanban-${ticketFocado.id}`" v-if="desabilitarInputWebchat">
              <q-card-section class="text-bold q-pb-none">
                {{ $t('generalSupport.kanban') }}
                <q-separator />
              </q-card-section>
              <div class="row items-center q-mb-md" style="margin-top: 5px; margin-left: 5px; gap: 5px;">
                <q-select
                  v-model="kanbanSelecionado"
                  outlined
                  :label="$t('common.save')"
                  :options="kanbans"
                  option-value="id"
                  option-label="name"
                  emit-value
                  class="col-10"
                  @update:model-value="selecionarKanbanParaContato"
                />
                <q-btn
                  @click="limparKanban"
                  class="col-1 text-red"
                  flat
                  round
                  size="sm"
                  style="display: flex; align-items: center; justify-content: center;"
                  icon="mdi-cancel"
                >
                  <q-tooltip>
                    {{ $t('generalSupport.clearKanban') }}
                  </q-tooltip>
                </q-btn>
              </div>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`motivo-${ticketFocado.id}`" v-if="desabilitarInputWebchat">
              <q-card-section class="text-bold q-pb-none">
                {{ $t('generalSupport.reason') }}
                <q-separator />
              </q-card-section>
              <div class="row items-center q-mb-md" style="margin-top: 5px; margin-left: 5px; gap: 5px;">
                <q-select
                  v-model="motivoSelecionado"
                  outlined
                  :label="$t('common.save')"
                  :options="motivos"
                  option-value="id"
                  option-label="name"
                  emit-value
                  class="col-10"
                  @update:model-value="selecionarMotivo"
                />
                <q-btn
                  @click="limparDemanda"
                  class="col-1 text-red"
                  flat
                  round
                  size="sm"
                  style="display: flex; align-items: center; justify-content: center;"
                  icon="mdi-cancel"
                >
                  <q-tooltip>
                    {{ $t('generalSupport.clearReason') }}
                  </q-tooltip>
                </q-btn>
              </div>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`value-${ticketFocado.id}`" v-if="desabilitarInputWebchat">
              <q-card-section class="text-bold q-pb-none">
                {{ $t('generalSupport.value') }}
                <q-separator />
              </q-card-section>
              <q-input
                v-model="valorNegociado"
                type="number"
                outlined
                emit-value
                class="q-mb-md"
                :style="{ margin: '5px' }"
                @update:model-value="atualizarValorNegociado"
              />
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`block-${ticketFocado.id}`" v-if="ticketFocado.channel !== 'instagram' && ticketFocado.channel !== 'telegram' && !ticketFocado.channel.includes('hub_') && desabilitarInputWebchat">
              <q-card-section class="text-bold q-pb-none">
                {{ $t('generalSupport.blockContact') }}
                <q-separator />
                <q-toggle v-model="bloquearStatus" @update:model-value="bloquearContato" label="Bloqueado"></q-toggle>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`blockbot-${ticketFocado.id}`" v-if="desabilitarInputWebchat">
              <q-card-section class="text-bold q-pb-none">
                {{ $t('generalSupport.blockChatbot') }}
                <q-separator />
                <q-toggle v-model="bloquearStatusChatbot" @update:model-value="bloquearChatbot" label="Bloqueado"></q-toggle>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`tag-${ticketFocado.id}`">
              <q-card-section class="text-bold q-pb-none">
                {{ $t('generalSupport.tags') }}
                <q-separator />
              </q-card-section>
              <q-card-section class="q-pa-none">
                <q-select
                  square
                  borderless
                  :model-value="ticketFocado.contact.tags"
                  multiple
                  :options="etiquetas"
                  use-chips
                  option-value="id"
                  option-label="tag"
                  emit-value
                  map-options
                  dropdown-icon="add"
                  @update:model-value="tagSelecionada"
                  :loading="isUpdatingTags"
                  :disable="isUpdatingTags"
                >
                  <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
                    <q-item v-bind="itemProps" v-on="itemEvents || {}">
                      <q-item-section>
                        <q-item-label v-html="opt.tag"></q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-checkbox :model-value="selected" @update:model-value="() => toggleOption(opt)" />
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:selected-item="{ opt }">
                    <q-chip dense square color="white" text-color="primary" class="q-ma-xs row col-12 text-body1">
                      <q-icon :style="`color: ${opt.color}`" name="mdi-pound-box-outline" size="28px" class="q-mr-sm" />
                      {{ opt.tag.length > 15 ? opt.tag.substring(0, 15) + '...' : opt.tag }}
                    </q-chip>
                  </template>
                  <template v-slot:no-option="{ itemProps, itemEvents }">
                    <q-item v-bind="itemProps" v-on="itemEvents || {}">
                      <q-item-section>
                        <q-item-label class="text-negative text-bold"> {{ $t('generalSupport.noTagsAvailable') }} </q-item-label>
                        <q-item-label caption> {{ $t('generalSupport.noTagsAvailableWarning') }} </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`wallet-${ticketFocado.id}`">
              <q-card-section class="text-bold q-pb-none">
                {{ $t('generalSupport.wallets') }}
                <q-separator />
              </q-card-section>
              <q-card-section class="q-pa-none">
                <q-select
                  square
                  borderless
                  :model-value="ticketFocado.contact.wallets"
                  multiple
                  :max-values="1"
                  :options="usuarios"
                  use-chips
                  option-value="id"
                  option-label="name"
                  emit-value
                  map-options
                  dropdown-icon="add"
                  @update:model-value="carteiraDefinida"
                >
                  <template v-slot:option="{ itemProps, itemEvents, opt, selected, toggleOption }">
                    <q-item v-bind="itemProps" v-on="itemEvents || {}">
                      <q-item-section>
                        <q-item-label v-html="opt.name"></q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-checkbox :model-value="selected" @update:model-value="() => toggleOption(opt)" />
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:selected-item="{ opt }">
                    <q-chip dense square color="white" text-color="primary" class="q-ma-xs row col-12 text-body1">
                      {{ opt.name.length > 15 ? opt.name.substring(0, 15) + '...' : opt.name }}
                    </q-chip>
                  </template>
                  <template v-slot:no-option="{ itemProps, itemEvents }">
                    <q-item v-bind="itemProps" v-on="itemEvents || {}">
                      <q-item-section>
                        <q-item-label class="text-negative text-bold">{{ $t('generalSupport.noWalletsAvailable') }} </q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </q-card-section>
            </q-card>

            <q-card class="bg-white q-mt-sm btn-rounded" style="width: 100%" bordered flat :key="`schedule-${ticketFocado.id}`" v-if="ticketFocado.channel !== 'instagram' && ticketFocado.channel !== 'telegram' && desabilitarInputWebchat">
              <q-card-section class="text-bold q-pb-none">
                {{ $t('generalSupport.scheduleMessages') }}
                <q-separator />
              </q-card-section>
              <q-card-section class="q-pa-none">
                <template v-if="ticketFocado.scheduledMessages">
                  <q-list>
                    <q-item v-for="(message, idx) in ticketFocado.scheduledMessages.filter((msg) => !msg.isDeleted)" :key="idx" clickable>
                      <q-item-section>
                        <q-item-label caption>
                          <div class="row justify-between items-center no-wrap">
                            <div>
                              <strong>{{ $t('generalSupport.scheduledFor') }}:</strong>
                              <div>{{ $formatarData(message.scheduleDate, 'dd/MM/yyyy HH:mm') }}</div>
                            </div>

                            <div>
                              <div class="row q-gutter-xs no-wrap">
                                <!-- <q-btn flat round dense icon="edit" size="sm" @click="editarMensagem(message)" /> -->
                                <q-btn flat round dense icon="mdi-trash-can-outline" size="sm" @click="deletarMensagem(message)" />
                              </div>
                            </div>
                          </div>
                        </q-item-label>
                        <q-item-label caption lines="2"> <b>Msg:</b> {{ message.mediaName || message.body }} </q-item-label>
                      </q-item-section>
                      <q-tooltip :delay="500">
                        <MensagemChat :mensagens="[message]" />
                      </q-tooltip>
                    </q-item>
                  </q-list>
                </template>
              </q-card-section>
            </q-card>

            <q-card class="bg-white btn-rounded q-mt-sm" style="width: 100%" bordered flat v-if="desabilitarInputWebchat">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('generalSupport.updateLid') }}</q-item-label>
                    <q-item-label caption>{{ $t('generalSupport.updateLidNotice') }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-card-section>
              <q-card-section class="q-pa-sm">
                <q-item>
                  <q-card-section class="text-bold q-pa-sm">
                    <q-btn 
                      v-if="(ticketFocado.channel === 'baileys' || ticketFocado.channel === 'uazapi' || ticketFocado.channel === 'meow' || ticketFocado.channel === 'whatsapp')&& !ticketFocado.isGroup"
                      flat 
                      class="btn-outline btn-small" 
                      @click="atualizarLidContato"
                      :label="$t('generalSupport.updateLid')"
                      icon="mdi-refresh"
                      :loading="loadingLidUpdate"
                    />
                  </q-card-section>    
                </q-item>
                <div v-if="sanitizeLoading" class="loading-bar">
                  <div class="bar"></div>
                </div>      
              </q-card-section>
            </q-card>

            <q-card class="bg-white btn-rounded q-mt-sm" style="width: 100%" bordered flat v-if="desabilitarInputWebchat">
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('generalSupport.sanitizeContact') }}</q-item-label>
                    <q-item-label caption>{{ $t('generalSupport.contactSanitizeNotice') }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-card-section>
              <q-card-section class="q-pa-sm">
                <q-item>
                  <q-card-section class="text-bold q-pa-sm">
                    <q-btn :disable="sanitizeLoading" flat class="btn-outline btn-small" :label="$t('generalSupport.sanitizeContact')" icon="mdi-content-duplicate" @click="migrarContato" />
                  </q-card-section>    
                </q-item>
                <div v-if="sanitizeLoading" class="loading-bar">
                  <div class="bar"></div>
                </div>      
              </q-card-section>
            </q-card>

            <!-- <q-card class="bg-white btn-rounded q-mt-sm" style="width: 100%" bordered flat>
              <q-card-section class="q-pa-none">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>Forçar Grupo</q-item-label>
                    <q-item-label caption>Alterar isGroup</q-item-label>
                  </q-item-section>
                </q-item>
              </q-card-section>
              <q-card-section class="q-pa-sm">
                <q-item>
                  <q-item-section>
                    <q-toggle v-model="isGroupSelecionado" :label="isGroupSelecionado ? 'Grupo' : 'Contato'" />
                  </q-item-section>
                </q-item>
                <q-card-section class="text-bold q-pa-sm">
                  <q-btn :disable="isGroupLoading" flat class="btn-outline btn-small" 
                        :label="$t('generalSupport.sanitizeContact')" icon="mdi-content-duplicate" 
                        @click="atualizarIsGroup" />
                </q-card-section>    
                <div v-if="isGroupLoading" class="loading-bar">
                  <div class="bar"></div>
                </div>      
              </q-card-section>
            </q-card> -->

          </div>
        </q-scroll-area>
      </q-drawer>

      <BuscarMensagensGeralModal v-model="modalVisivel" />

      <ModalNovoTicket v-model:modalNovoTicket="modalNovoTicket" />
      
      <ContatoModal :contactId="selectedContactId" v-model:modalContato="modalContato" @contatoModal:contato-editado="contatoEditado" />

      <ModalUsuario :isProfile="true" v-model:modalUsuario="modalUsuario" v-model:usuarioEdicao="usuario" />

      <ModalNotaAtendimento v-model:modalNota="modalNota" v-model:notaEdicao="notaEdicao" />

      <ModalSMS v-model:modalSMS="modalSMS" v-model:smsEnvio="smsEnvio" />

      <!-- <button @click="aceitarTermos" v-if="!termoaceito && profile === 'superadmin'">Verificar Termos</button> -->
      <ModalLayout v-if="profile === 'superadmin'" :show="showModal" class="modal-top" @close="showModal = false" @aceitar="handleAcceptance"></ModalLayout>

      <ModalTarefa
        v-model:modalTarefa="modalTarefa"
      />

      <q-dialog v-model="dialogVapiVisible">
        <q-card>
          <q-card-section>
            <div class="text-h6">{{ $t('vapi.call') }}</div>
          </q-card-section>

          <q-card-section>
            <q-select
              v-model="selectedAssistantId"
              :options="assistentes?.map(a => ({ label: a.name, value: a.id })) || []"
              :label="$t('vapi.selectAssistant')"
            />
            <q-select
              v-model="selectedPhoneNumberId"
              :options="numerosDeTelefone?.map(n => ({ label: n.number, value: n.id })) || []"
              :label="$t('vapi.selectPhoneNumber')"
            />
            <q-input
              v-model="customerNumber"
              :label="$t('vapi.customerNumber')"
              type="text"
            />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat :label="$t('vapi.cancel')" v-close-popup />
            <q-btn flat :label="$t('vapi.makeCall')" @click="fazerChamada" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="showImageModal">
        <q-card v-if="usuarioDados?.restrictedUser !== 'enabled'">
          <q-card-section>
            <q-img 
              v-if="ticketFocado?.contact?.profilePicUrl && ticketFocado.contact.profilePicUrl !== 'null' && ticketFocado.contact.profilePicUrl !== 'undefined'"
              :src="ticketFocado.contact.profilePicUrl" 
              style="width: 400px; height: 400px;"
            >
              <template v-slot:error>
                <q-img 
                  src="/nopicture.png"
                  style="width: 400px; height: 400px;"
                ></q-img>
                <!-- <q-icon name="mdi-account" size="6em" color="grey-5" /> -->
              </template>
            </q-img>
            <q-icon v-else name="mdi-account" style="width: 400px; height: 400px" size="6em" color="grey-5" />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat :label="$t('common.close')" color="primary" @click="showImageModal = false" />
          </q-card-actions>
        </q-card>
        <q-card v-else> 
          <q-card-section>
            <!-- <q-icon name="mdi-account" style="width: 400px; height: 400px" size="6em" color="grey-5" v-if="!ticketFocado?.contact?.profilePicUrl" /> -->
            <q-img 
              src="/nopicture.png" 
              style="width: 400px; height: 400px;"
            >
            </q-img>
          </q-card-section>
        </q-card>
      </q-dialog>

      <q-dialog v-model="exibirModalLogs" no-backdrop-dismiss full-height position="right" @hide="logsTicket = []">
        <q-card style="width: 400px">
          <q-card-section :class="{ 'bg-grey-2': !$q.dark.isActive, 'bg-primary': $q.dark.isActive }">
            <div class="text-h6">
              {{$t('generalSupport.logsticket')}}: {{ ticketFocado.id }}
              <q-btn icon="close" color="negative" flat class="bg-padrao float-right" round v-close-popup />
            </div>
          </q-card-section>
          <q-card-section class="">
            <q-scroll-area style="height: calc(100vh - 200px)" class="full-width">
              <q-timeline color="black" style="width: 360px" class="q-pl-sm" :class="{ 'text-black': !$q.dark.isActive }">
                <template v-for="(log, idx) in logsTicket" :key="(log && log.id) || idx">
                  <div>
                    <q-timeline-entry
                      :subtitle="$formatarData(log.createdAt, 'dd/MM/yyyy HH:mm')"
                      :color="(messagesLog[log.type] && messagesLog[log.type].color) || ''"
                      :icon="(messagesLog[log.type] && messagesLog[log.type].icon) || ''"
                    >
                      <template v-slot:title>
                        <div :class="{ 'text-white': $q.dark.isActive }" style="width: calc(100% - 20px)">
                          <div class="row col text-bold text-body2">{{ (log.user && log.user.name) || 'Bot' }}:</div>
                          <div class="row col">{{ messagesLog[log.type] && messagesLog[log.type].message }}</div>
                        </div>
                      </template>
                    </q-timeline-entry>
                  </div>
                </template>
              </q-timeline>
            </q-scroll-area>
          </q-card-section>
        </q-card>
      </q-dialog>

      <q-dialog v-model="exibirModalProtocoloLogs" no-backdrop-dismiss full-height position="right" @hide="logsProtocolo = []">
        <q-card style="width: 400px">
          <q-card-section :class="{ 'bg-grey-2': !$q.dark.isActive, 'bg-primary': $q.dark.isActive }">
            <div class="text-h6">
               {{$t('generalSupport.ticketProtocols')}}: {{ ticketFocado.id }}
              <q-btn icon="close" color="negative" flat class="bg-padrao float-right" round v-close-popup />
            </div>
          </q-card-section>
          <q-card-section class="">
            <q-scroll-area style="height: calc(100vh - 200px)" class="full-width">
              <q-timeline color="black" style="width: 360px" class="q-pl-sm" :class="{ 'text-black': !$q.dark.isActive }">
                <template v-for="(log, idx) in logsProtocolo" :key="(log && log.id) || idx">
                  <div>
                    <q-timeline-entry
                      :subtitle="$formatarData(log.createdAt, 'dd/MM/yyyy HH:mm')"
                      :color="(messagesLog[log.type] && messagesLog[log.type].color) || ''"
                      :icon="(messagesLog[log.type] && messagesLog[log.type].icon) || ''"
                    >
                      <template v-slot:title>
                        <div :class="{ 'text-white': $q.dark.isActive }" style="width: calc(100% - 20px)">
                          <div class="row col text-bold text-body2">{{ (log.user && log.user.name) || 'Bot' }}:</div>
                          <div class="row col">{{ (log.protocol) || 'Protocolo não foi enviado com sucesso' }}</div>
                        </div>
                      </template>
                    </q-timeline-entry>
                  </div>
                </template>
              </q-timeline>
            </q-scroll-area>
          </q-card-section>
        </q-card>
      </q-dialog>

      <q-dialog v-model="exibirModalAvaliacaoLogs" no-backdrop-dismiss full-height position="right" @hide="logsAvaliacao = []">
        <q-card style="width: 400px">
          <q-card-section :class="{ 'bg-grey-2': !$q.dark.isActive, 'bg-primary': $q.dark.isActive }">
            <div class="text-h6">
              {{$t('generalSupport.ticketsEvaluations')}}: {{ ticketFocado.id }}
              <q-btn icon="close" color="negative" flat class="bg-padrao float-right" round v-close-popup />
            </div>
             
            <q-linear-progress :value="evaluationMedia / 5" color="primary" class="q-mt-md"></q-linear-progress>
            <div class="text-subtitle"> {{$t('generalSupport.evaluationAverage')}}: {{ evaluationMedia }}/5</div> 
          </q-card-section>
          <q-card-section class="">
            <q-scroll-area style="height: calc(100vh - 200px)" class="full-width">
              <q-timeline color="black" style="width: 360px" class="q-pl-sm" :class="{ 'text-black': !$q.dark.isActive }">
                <template v-for="(log, idx) in logsAvaliacao" :key="(log && log.id) || idx">
                  <div>
                    <q-timeline-entry
                      :subtitle="$formatarData(log.createdAt, 'dd/MM/yyyy HH:mm')"
                      :color="(messagesLog[log.type] && messagesLog[log.type].color) || ''"
                      :icon="(messagesLog[log.type] && messagesLog[log.type].icon) || ''"
                    >
                      <template v-slot:title>
                        <div :class="{ 'text-white': $q.dark.isActive }" style="width: calc(100% - 20px)">
                          <div class="row col text-bold text-body2">{{ (log.user && log.user.name) || 'Bot' }}:</div>
                          <div class="row col">
                            <template v-if="log.evaluation !== undefined && log.evaluation >= 0 && log.evaluation <= 5">
                              <template v-if="log.evaluation === 0">
                                <q-linear-progress :value="0" color="red">
                                </q-linear-progress>
                                <div class="text-subtitle">0/5</div>
                              </template>
                              <template v-else>
                                <q-linear-progress :value="log.evaluation / 5" color="primary">
                                </q-linear-progress>
                                <div class="text-subtitle">{{ log.evaluation }}/5</div>
                              </template>
                            </template>
                            <template v-else>
                              {{$t('generalSupport.evaluationNotConclusive')}}
                              </template>
                          </div>
                        </div>
                      </template>
                    </q-timeline-entry>
                  </div>
                </template>
              </q-timeline>
            </q-scroll-area>
          </q-card-section>
        </q-card>
      </q-dialog>

      <q-dialog v-model="exibirModalNotaLogs" no-backdrop-dismiss full-height position="right" @hide="logsNota = []">
        <q-card style="width: 400px">
          <q-card-section :class="{ 'bg-grey-2': !$q.dark.isActive, 'bg-primary': $q.dark.isActive }">
            <div class="text-h6">
              {{$t('generalSupport.ticketNotes')}}: {{ ticketFocado.id }}
              <q-btn icon="close" color="negative" flat class="bg-padrao float-right" round v-close-popup />
            </div>
          </q-card-section>
          <q-card-section class="">
            <q-scroll-area style="height: calc(100vh - 200px)" class="full-width">
              <q-timeline color="black" style="width: 360px" class="q-pl-sm" :class="{ 'text-black': !$q.dark.isActive }">
                <template v-for="(log, idx) in logsNota" :key="(log && log.id) || idx">
                  <div>
                    <q-timeline-entry
                      :subtitle="$formatarData(log.createdAt, 'dd/MM/yyyy HH:mm')"
                      :color="(messagesLog[log.type] && messagesLog[log.type].color) || ''"
                      :icon="(messagesLog[log.type] && messagesLog[log.type].icon) || ''"
                    >
                      <template v-slot:title>
                        <div :class="{ 'text-white': $q.dark.isActive }" style="width: calc(100% - 20px)">
                          <div class="row col text-bold text-body2">{{ (log.user && log.user.name) || 'Bot' }}:</div>
                          <div class="row col" :style="{ 'white-space': 'pre-line' }">{{ (log.notes) || 'Nota não foi registrada com sucesso' }}</div>
                        </div>
                      </template>
                      <q-btn
                        flat
                        round
                        icon="edit"
                        @click="editarNota(log)"
                      />
                      <q-btn
                        flat
                        round
                        icon="mdi-delete"
                        @click="deletarNota(log)"
                      />
                    </q-timeline-entry>
                  </div>
                </template>
              </q-timeline>
            </q-scroll-area>
          </q-card-section>
        </q-card>
      </q-dialog>

      <q-dialog v-model="showModalMensagem" @hide="resetFields">
        <q-card>
          <q-card-section>
            <div class="text-h6">{{$t('generalSupport.startNew')}}</div>
          </q-card-section>

          <q-card-section>
            <q-select
              style="margin: 1px;"
              v-model="whatsappId"
              :options="cSessionsOptions"
              label="WhatsApp ID"
              dense
              outlined
            />
            <c-input
              class="col-12 col-md-6"
              style="margin: 1px; margin-top: 5px"
              outlined
              v-model="numero" 
              mask="+#############"
              :placeholder="$t('generalSupport.placeholderNumber')"
              fill-mask
              unmasked-value
              dense
              :hint="$t('generalSupport.hintNumber')"
              :label="$t('generalSupport.number')"
            />
            <c-input
              outlined
              style="margin: 1px; margin-top: 5px"
              dense 
              v-model="mensagem" 
              :label="$t('generalSupport.message')"
              :disable="whatsappId && whatsappId.type === 'waba'"
              type="textarea"
            />
            <div v-if="whatsappId && whatsappId.type === 'waba'" class="text-caption text-warning q-mt-xs">
              <q-icon name="info" size="xs" class="q-mr-xs" />
              {{ $t('mainLayout.novo.wabaTemplate') }}
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn :label="$t('common.cancel')" class="q-px-md q-mr-sm" color="negative" @click="showModalMensagem = false" />
            <q-btn :label="$t('common.send')" class="q-px-md q-mr-sm" color="positive" @click="enviarMensagem" :loading="loadingMensagem" :disable="loadingMensagem"  />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="showOpportunityForm" @hide="resetFields">
        <OpportunityForm :ticketFocado="ticketFocado" @close="showOpportunityForm = false" />
      </q-dialog>

      <q-dialog v-model="showOpportunityFormEditar" @hide="resetFields(); carregarOportunidadesContato()">
        <OpportunityForm :oportunidade="oportunidadeSelecionada" @close="showOpportunityFormEditar = false" />
      </q-dialog>

      <q-dialog v-model="exibirModalOportunidades" no-backdrop-dismiss full-height position="right" @hide="oportunidadesContato = []">
        <q-card style="width: 400px">
          <q-card-section :class="{ 'bg-grey-2': !$q.dark.isActive, 'bg-primary': $q.dark.isActive }">
            <div class="text-h6">
              {{$t('generalSupport.opportunities')}}: {{ ticketFocado?.contact?.name || '' }}
              <q-btn icon="close" color="negative" flat class="bg-padrao float-right" round v-close-popup
              style="position: absolute; top: 8px; right: 8px; z-index: 10" />
            </div>
          </q-card-section>
          
          <!-- Filtros -->
          <q-card-section class="q-pa-sm">
            <div class="row q-col-gutter-sm">
              <div class="col-12">
                <q-select
                  v-model="filtrosOportunidades.status"
                  :options="[
                    { label: $t('funil.todos'), value: '' },
                    { label: $t('funil.aberto'), value: 'open' },
                    { label: $t('funil.ganho'), value: 'win' },
                    { label: $t('funil.perdido'), value: 'lose' }
                  ]"
                  :label="$t('funil.status')"
                  outlined
                  dense
                  emit-value
                  map-options
                  clearable
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model.number="filtrosOportunidades.valorMin"
                  type="number"
                  :label="$t('funil.valorMin')"
                  outlined
                  dense
                  clearable
                />
              </div>
              <div class="col-6">
                <q-input
                  v-model.number="filtrosOportunidades.valorMax"
                  type="number"
                  :label="$t('funil.valorMax')"
                  outlined
                  dense
                  clearable
                />
              </div>
              <div class="col-12">
                <q-btn
                  color="primary"
                  :label="$t('funil.filter')"
                  class="full-width"
                  @click="aplicarFiltrosOportunidades"
                />
              </div>
            </div>
          </q-card-section>

          <q-card-section class="">
            <q-scroll-area style="height: calc(100vh - 350px)" class="full-width">
              <q-list>
                <q-item v-for="oportunidade in oportunidadesContato" :key="oportunidade.id">
                  <q-item-section>
                    <q-item-label class="text-bold">{{ oportunidade.name }}</q-item-label>
                    <q-item-label caption>
                      {{ $t('generalSupport.value') }}: R$ {{ oportunidade.value }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ $t('generalSupport.status') }}: {{ getStatusLabel(oportunidade.statusOriginal || oportunidade.status) }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ $t('generalSupport.closingForecast') }}: {{ formatarDataUTC(oportunidade.closingForecast) }}
                    </q-item-label>
                    <q-item-label caption>
                      {{ $t('generalSupport.createdAt') }}: {{ $formatarData(oportunidade.createdAt, 'dd/MM/yyyy HH:mm') }}
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      icon="edit"
                      color="primary"
                      flat
                      round
                      size="sm"
                      @click="editarOportunidade(oportunidade)"
                      class="q-mr-xs"
                      :title="$t('funil.editar')"
                    />
                    <q-btn
                      icon="delete"
                      color="negative"
                      flat
                      round
                      size="sm"
                      @click="deletarOportunidade(oportunidade)"
                      :title="$t('funil.deletar')"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-scroll-area>
          </q-card-section>

          <!-- Paginação -->
          <q-card-section class="q-pa-sm">
            <div class="row items-center justify-between">
              <div class="col-auto">
                <q-select
                  v-model="paginacaoOportunidades.limit"
                  :options="[10, 20, 50, 100]"
                  :label="$t('funil.registrosPorPagina')"
                  dense
                  outlined
                  style="width: 120px"
                  @update:model-value="carregarOportunidadesContato"
                />
              </div>
              <div class="col-auto">
                <q-pagination
                  v-model="paginacaoOportunidades.page"
                  :max="totalPaginasOportunidades"
                  :max-pages="6"
                  boundary-numbers
                  direction-links
                  @update:model-value="carregarOportunidadesContato"
                />
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-dialog>

      <div v-if="isWebphoneVisible && usuario.sipEnabled && usuario.profile !== 'superadmin'" class="webphone-overlay"></div>
      <div :class="{ 'webphone-container': true, 'webphone-visible': isWebphoneVisible }">
        <div class="webphone-header">
          {{ $t('mainLayout.webphone') }}
          <q-btn icon="close" flat round dense @click="toggleWebphoneVisibility(false)" />
        </div>
        <div class="webphone-content" v-if="usuario.sipEnabled">
          <AsteriskWebphone :initialPhoneNumber="numeroParaLigar" @incoming-call="toggleWebphoneVisibility(true)" />
        </div>
      </div>
    </q-layout>
    <!-- <Webphone /> -->
    <WebphoneNovo />
    <!-- <WebphoneCall /> -->
    <audio ref="audioNotificationPlay" v-if="notificacaoAtivo === 'enabled'">
      <source :src="alertSound" type="audio/mp3" />
    </audio>
    <audio ref="audioNotificationPlay2">
      <source :src="alertSound2" type="audio/mp3">
    </audio>
    <q-dialog v-model="showSelectWavoipDialog">
      <q-card style="min-width: 320px; max-width: 90vw;">
        <q-card-section>
          <div class="text-h6">{{ $t('generalSupport.selectWavoip') }}</div>
        </q-card-section>
        <q-card-section>
          <q-list bordered separator>
            <q-item v-for="opt in wavoipOptions" :key="opt.value" clickable @click="selectedWavoipToken = opt.value" :active="selectedWavoipToken === opt.value">
              <q-item-section avatar>
                <q-icon :name="opt.icon" />
              </q-item-section>
              <q-item-section>{{ opt.label }}</q-item-section>
              <q-item-section side>
                <q-radio v-model="selectedWavoipToken" :val="opt.value" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="negative" @click="cancelarSelecaoWavoip" />
          <q-btn flat :label="$t('webphone.tooltips.call')" color="primary" :disable="!selectedWavoipToken" @click="confirmarSelecaoWavoip" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para seleção de Wavoip (Novo) -->
    <q-dialog v-model="showSelectWavoipDialogNovo">
      <q-card style="min-width: 320px; max-width: 90vw;">
        <q-card-section>
          <div class="text-h6">{{ $t('generalSupport.selectWavoip') }} (Novo)</div>
        </q-card-section>
        <q-card-section>
          <q-list bordered separator>
            <q-item v-for="opt in wavoipOptionsNovo" :key="opt.value" clickable @click="selectedWavoipTokenNovo = opt.value" :active="selectedWavoipTokenNovo === opt.value">
              <q-item-section avatar>
                <q-icon :name="opt.icon" />
              </q-item-section>
              <q-item-section>{{ opt.label }}</q-item-section>
              <q-item-section side>
                <q-radio v-model="selectedWavoipTokenNovo" :val="opt.value" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="negative" @click="cancelarSelecaoWavoipNovo" />
          <q-btn flat :label="$t('webphone.tooltips.call')" color="primary" :disable="!selectedWavoipTokenNovo" @click="confirmarSelecaoWavoipNovo" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal de Transferência em Massa -->
    <q-dialog v-model="modalTransferirTicketMassa"
      @hide="modalTransferirTicketMassa = false"
      persistent>
      <q-card class="q-pa-md"
        style="width: 500px">
        <q-card-section>
          <div class="text-h6">{{ $t('atendimentoInfoCabecalho.selectDestination') }}</div>
          <div class="text-caption q-mt-sm">
            {{ $t('generalSupport.transferSelectedTickets') || 'Transferir tickets selecionados' }} ({{ ticketsSelecionados.size }})
          </div>
        </q-card-section>
        <q-card-section>
          <q-select square
            outlined
            v-model="filaSelecionadaMassa"
            :options="filas"
            emit-value
            map-options
            option-value="id"
            option-label="queue"
            :label="$t('atendimentoInfoCabecalho.destinationQueue')"
            />
        </q-card-section>
        <q-card-section>
          <q-select square
            outlined
            v-model="usuarioSelecionadoMassa"
            :options="usuarios.filter(filterUsersMassa)"
            emit-value
            map-options
            option-value="id"
            option-label="name"
            :label="$t('atendimentoInfoCabecalho.destinationUser')"
            clearable
            />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            :label="$t('common.out')"
            color="negative"
            v-close-popup
            class="q-mr-lg" />
          <q-btn
            :label="$t('common.save')"
            color="primary"
            @click="confirmarTransferenciaMassa" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal de Convites -->
    <q-dialog v-model="modalConvites" persistent>
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">{{ $t('ticketCompartilhado.meusConviteCompartilhados') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div v-if="loadingConvites" class="text-center q-pa-md">
            <q-spinner-dots color="primary" size="40px" />
            <div class="q-mt-sm">{{ $t('ticketCompartilhado.carregandoConvites') }}</div>
          </div>
          
          <div v-else-if="convitesUsuario.length === 0" class="text-center q-pa-md">
            <q-icon name="mdi-share-variant" size="60px" color="grey-5" />
            <div class="text-h6 q-mt-md text-grey-6">{{ $t('ticketCompartilhado.nenhumConviteEncontrado') }}</div>
            <div class="text-caption text-grey-5">{{ $t('ticketCompartilhado.voceNaoPossuiConvitesAtivos') }}</div>
          </div>
          
          <div v-else>
            <q-list>
              <q-item v-for="convite in convitesUsuario" :key="convite.id" class="q-mb-sm">
                <q-card class="full-width" flat bordered>
                  <q-card-section>
                    <div class="row items-center justify-between">
                      <div class="col">
                        <div class="text-subtitle1 text-weight-medium">
                          Ticket #{{ convite.ticketId }}
                        </div>
                        <div class="text-caption text-grey-6 q-mt-xs">
                          {{ $t('ticketCompartilhado.compartilhadoEm') }}: {{ $formatarData(convite.createdAt, 'dd/MM/yyyy HH:mm') }}
                        </div>
                        <div class="text-caption text-grey-6">
                          {{ $t('ticketCompartilhado.usuariosComAcesso') }}: {{ convite.userIdArray ? convite.userIdArray.length : 0 }}
                        </div>
                        <div class="text-caption text-grey-6">
                          {{ $t('ticketCompartilhado.criadoPor') }}: {{ convite.createdByMe ? $t('ticketCompartilhado.voce') : $t('ticketCompartilhado.outroUsuario') }}
                        </div>
                      </div>
                      <div class="col-auto">
                        <!-- <q-btn
                          flat
                          round
                          dense
                          icon="mdi-content-copy"
                          color="primary"
                          @click="copiarLinkConvite(convite.inviteUrl)"
                        >
                          <q-tooltip content-class="bg-primary text-bold">
                            Copiar link
                          </q-tooltip>
                        </q-btn> -->
                        <q-btn
                          flat
                          round
                          dense
                          icon="mdi-open-in-new"
                          color="primary"
                          @click="abrirConvite(convite.ticket)"
                        >
                          <q-tooltip content-class="bg-secondary text-bold">
                            {{ $t('ticketCompartilhado.abrirNaMesmaTela') }}
                          </q-tooltip>
                        </q-btn>
                        <q-btn
                          v-if="convite.createdByMe"
                          flat
                          round
                          dense
                          icon="mdi-delete"
                          color="negative"
                          @click="deletarConvite(convite)"
                        >
                          <q-tooltip content-class="bg-negative text-bold">
                            {{ $t('ticketCompartilhado.deletarConvite') }}
                          </q-tooltip>
                        </q-btn>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </q-item>
            </q-list>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.close')" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import eventBus from 'src/utils/eventBus.js'
import { mapActions } from 'vuex';
const wavoipBlock = JSON.parse(localStorage.getItem('bloquearWavoip'))
const UserQueues = JSON.parse(localStorage.getItem('queues'))
const profile = localStorage.getItem('profile')
const username = localStorage.getItem('username')
const usuario = JSON.parse(localStorage.getItem('usuario'))
import ItemStatusChannel from 'src/pages/sessaoWhatsapp/ItemStatusChannel.vue'
import ContatoModal from 'src/pages/contatos/ContatoModal.vue'
import ItemTicket from './ItemTicket.vue'
import { AtualizarTicket, AtualizarTicketNaoLido, ConsultarLogsTicket, ConsultarTickets, DeletarMensagem, AtualizarN8NTicket, AtualizarDifyTicket, AtualizarLmTicket, AtualizarGrokTicket, AtualizarGeminiTicket, AtualizarClaudeTicket, AtualizarQwenTicket, AtualizarDeepseekTicket, AtualizarOllamaTicket, AtualizarTypebotTicket, AtualizarDialogflowTicket, AtualizarChatgptTicket, EnviarMensagemTexto, AtualizarStatusTicket, AtualizarStatusTicketNull, AtualizarStatusTicketForcado, limparCacheTickets } from 'src/service/tickets.js'
import { ListarAssistentes, ListarNumerosDeTelefone, CriarChamada } from 'src/service/vapi.js'
import { mapGetters } from 'vuex'
import mixinSockets from './mixinSockets.js'
import socketInitial from 'src/layouts/socketInitial.js'
import ModalNovoTicket from './ModalNovoTicket.vue'
import ModalSMS from './ModalSMS.vue'
import { ListarFilas } from 'src/service/filas.js'
import { ListarKanbans } from 'src/service/kanban.js'
import { ListarMotivos } from 'src/service/motivos.js'
import StatusWhatsapp from 'src/components/StatusWhatsapp.vue'
import alertSound from 'src/assets/sound.mp3'
import silenceSound from 'src/assets/silence.mp3'
import { ListarWhatsapps } from 'src/service/sessoesWhatsapp.js'
import { debounce, uid } from 'quasar'
import { format } from 'date-fns'
import ModalUsuario from 'src/pages/usuarios/ModalUsuario.vue'
import { ListarConfiguracoes } from 'src/service/configuracoes.js'
import { ListarMensagensRapidas } from 'src/service/mensagensRapidas.js'
import { ListarEtiquetas } from 'src/service/etiquetas.js'
import { EditarEtiquetasContato, EditarCarteiraContato, EditarContato, ObterContato, MigrarContato, SanitizarContato, RemoverFotoNula, AtualizarLidFromContactId } from 'src/service/contatos.js'
import { CriarProtocolo, ConsultarLogsProtocolo } from 'src/service/protocolos.js'
import { CriarAvaliacao, ConsultarLogsAvaliacao } from 'src/service/avaliacoes.js'
import { ConsultarLogsNota, DeletarNota } from 'src/service/notas.js'
import { RealizarLogout } from 'src/service/login.js'
import { ListarUsuarios, DadosUsuario } from 'src/service/user.js'
import { SyncOldMessagesByUserWbot, LocalizarMensagens, ExportarMensagens, SendPausedIndicator } from 'src/service/tickets.js'
import { ListarTenantPorId, ListarTenantPorAsaas, AceitarTermos, ListarTermos, ListarTenantsPorTermos, ListarTenantsPorLicenca } from 'src/service/tenants.js'
import { EnviarTextoWaba } from 'src/service/waba.js'
import { EnviarTextoInstagram } from 'src/service/instagram.js'
import MensagemChat from './MensagemChat.vue'
import { messagesLog } from '../../utils/constants.js'
import ModalNotaAtendimento from 'src/pages/notas/ModalNotaAtendimento.vue'
import ModalLayout from './ModalLayout.vue'
import { listCountUnreadPrivateMessage, listCountUnreadGroupMessage } from 'src/service/chatPrivado.js'
import { MostrarAvaliacao } from 'src/service/empresas.js'
import ModalTarefa from 'src/pages/tarefas/ModalTarefa.vue'
import jsPDF from 'jspdf';
import { MostrarCores } from 'src/service/empresas.js';
import { EnviarMensagemHub } from 'src/service/hub.js'
import { EnviarMensagemMeow } from 'src/service/meow.js'
import { EnviarMensagemEvo } from 'src/service/evo.js'
import { EnviarMensagemUazapi } from 'src/service/uazapi.js'
import { EnviarMensagemZapi } from 'src/service/zapi.js'
import { EnviarMensagemWebChat } from 'src/service/webchat.js'
import { TextoIndividual } from 'src/service/massa.js'
import { ObterContatoPeloNumero, CriarContato } from 'src/service/contatos.js'
import { CriarTicket, VerificarTicketsAbertos } from 'src/service/tickets.js' 
import Webphone from 'src/components/webphoneComponents/Webphone.vue'
import WebphoneNovo from 'src/components/webphoneComponents/WebphoneNovo.vue'
import cSystemVersion from 'src/components/cSystemVersion.vue'
import BuscarMensagensGeralModal from './BuscarMensagensGeralModal.vue'
import alertSound2 from 'src/assets/icq.mp3'
// import WebphoneCall from 'src/components/webphoneComponents/WebphoneCall.vue'
import Cookies from 'js-cookie';
import OpportunityForm from 'src/pages/funil/OpportunityForm.vue'
import { ListarOpportunitiesByContact, DeletarOpportunity } from 'src/service/oportunidade.js'
import AsteriskWebphone from 'components/AsteriskWebphone/AsteriskWebphone.vue'
import { ListarTicketsCompartilhadosPorUsuario, DeletarTicketCompartilhado } from 'src/service/ticketcompartilhado.js'
const colorsArray = JSON.parse(localStorage.getItem('storedColors'));
const colorsObject = colorsArray?.reduce((acc, item) => {
  // Obtém o primeiro valor do objeto que não seja 'label'
  const [key, value] = Object.entries(item).find(([key]) => key !== 'label');
  acc[key] = value; // Adiciona a chave e o valor ao objeto acumulador
  return acc;
}, {});
export default {
  name: 'IndexAtendimento',
  mixins: [mixinSockets, socketInitial],
  components: {
    BuscarMensagensGeralModal,
    cSystemVersion,
    ItemTicket,
    ModalNovoTicket,
    StatusWhatsapp,
    ContatoModal,
    ModalUsuario,
    MensagemChat,
    ItemStatusChannel,
    ModalNotaAtendimento,
    ModalSMS,
    ModalLayout,
    ModalTarefa,
    Webphone,
    WebphoneNovo,
    OpportunityForm,
    AsteriskWebphone,
    // WebphoneCall
  },
  data() {
    return {
      // Propriedades para gerenciamento de memória
      timers: [],
      eventListeners: [],
      socketListeners: [],
      rootListeners: [],
      isNotViewAssignedTickets: 'disabled',
      dialogVapiVisible: false,
      modoSelecaoMassa: false,
      ticketsSelecionados: new Set(),
      modalTransferirTicketMassa: false,
      filaSelecionadaMassa: null,
      usuarioSelecionadoMassa: null,
      assistentes: [],
      numerosDeTelefone: [],
      selectedAssistantId: null,
      selectedPhoneNumberId: null,
      customerNumber: '',
      loadingMensagem: false,
      isGroupSelecionado: false,
      modalVisivel: false,
      bloquearWavoip: false,
      selectedFilter: null,
      showImageModal: false,
      selectedWhatsapp: null,
      selectedUser: null,
      selectedTag: null,
      selectedKanban: null,
      colors: colorsObject || {},
      rating: [
        { label: this.$t('rating.poor'), rating: 0 },
        { label: this.$t('rating.fair'), rating: 1 },
        { label: this.$t('rating.good'), rating: 2 },
        { label: this.$t('rating.veryGood'), rating: 3 },
        { label: this.$t('rating.excellent'), rating: 4 },
        { label: this.$t('rating.incredible'), rating: 5 },
      ],
      tarefaEdicao: {},
      modalTarefa: false,
      notify: null, 
      loadingMount: false,
      isMounted: false,
      showModal: false,
      batchSize: 30,
      hasMoreTickets: true,
      drawerContact: true,
      kanbans: [],
      motivos: [],
      kanbanStatus: '',
      kanbanSelecionado: null,
      motivoSelecionado: null,
      valorNegociado: '',
      bloquearStatus: null,
      bloquearStatusChatbot: null,
      tabTickets: 'private',
      tabTicketsStatus: 'open',
      typebotStatus: '',
      typebotAtivo: false,
      n8nStatus: '',
      difyStatus: '',
      lmStatus: '',
      grokStatus: '',
      geminiStatus: '',
      deepseekStatus: '',
      deepseekAtivo: false,
      qwenStatus: '',
      qwenAtivo: false,
      claudeStatus: '',
      claudeAtivo: false,
      difyAtivo: false,
      lmAtivo: false,
      grokAtivo: false,
      geminiAtivo: false,
      ollamaStatus: '',
      ollamaAtivo: false,
      n8nAtivo: false,
      smsAtivo: false,
      dialogflowStatus: '',
      dialogflowAtivo: false,
      chatgptStatus: '',
      chatgptAtivo: false,
      grupoAtivo: 'disabled',
      contadorUniversal: '',
      notificacaoAtivo: 'enabled',
      grupoStatus: '',
      tempoFechamento: '',
      autoFechamentoAtivo: 'disabled',
      mensagemDeEncerramento: '',
      messagesLog,
      selectedTab: 'open',
      configuracoes: [],
      debounce,
      alertSound,
      alertSound2,
      silenceSound,
      notificacaoSound: '',
      usuario,
      usuarios: [],
      username,
      modalUsuario: false,
      toolbarSearch: true,
      drawerTickets: true,
      loading: false,
      sanitizeLoading: false,
      isGroupLoading: false,
      profile,
      modalNovoTicket: false,
      modalContato: false,
      selectedContactId: null,
      filterBusca: '',
      showDialog: false,
      atendimentos: [],
      countTickets: 0,
      pesquisaTickets: {
        searchParam: '',
        pageNumber: 1,
        status: ['open', 'pending'],
        showAll: false,
        includeClosed: false,
        count: null,
        queuesIds: [],
        whatsappIds: [],
        selectedUser: [],
        withUnreadMessages: false,
        isNotAssignedUser: false,
        includeNotQueueDefined: true,
        // date: new Date(),
      },
      filas: [],
      filasUser: [],
      etiquetas: [],
      mensagensRapidas: [],
      modalEtiquestas: false,
      exibirModalOportunidades: false,
      oportunidadesContato: [],
      exibirModalLogs: false,
      logsTicket: [],
      logsProtocolo: [],
      logsNota: [],
      exibirModalProtocoloLogs: false,
      exibirModalNotaLogs: false,
      logsAvaliacao: [],
      exibirModalAvaliacaoLogs: false,
      evaluationMedia: 0,
      asyncData: [],
      modalNota: false,
      modalSMS: false,
      notaEdicao: {},
      smsEnvio: '',
      chatBotLane: null,
      vapiToken: null,
      allowPause: null,
      vapi: null,
      listarPelaUltimaMensagem: null,
      supervisorAdmin: null,
      ticketsRain: null,
      fixarConexao: null,
      termoaceito: false,
      notificacaoInternaNaoLida: '',
      whatsappId: null,
      showModalMensagem: false,
      numero: '',
      mensagem: '',
      isReversed: false,
      usuarioDados: null,
      tenantDados: null,
      showOpportunityForm: false,
      showOpportunityFormEditar: false,
      oportunidadeSelecionada: null,
      filtrosOportunidades: {
        status: '',
        valorMin: null,
        valorMax: null
      },
      paginacaoOportunidades: {
        page: 1,
        limit: 10,
        total: 0
      },
      numeroParaLigar: '',
      isUpdatingTags: false,
      showSelectWavoipDialog: false,
      wavoipOptions: [],
      selectedWavoipToken: null,
      ticketParaChamada: null,
      showSelectWavoipDialogNovo: false,
      wavoipOptionsNovo: [],
      selectedWavoipTokenNovo: null,
      ticketParaChamadaNovo: null,
      loadingLidUpdate: false,
      modalConvites: false,
      convitesUsuario: [],
      loadingConvites: false,
    }
  },
  watch: {
    'pesquisaTickets.showAll': function (newValue) {
      if (newValue) {
        // Limpar cache quando showAll mudar para evitar dados incorretos
        this.cleanupMemory();
        this.pesquisaTickets = {
          searchParam: '',
          pageNumber: 1,
          status: ['open', 'pending'],
          showAll: true,
          includeClosed: false,
          count: null,
          queuesIds: [],
          whatsappIds: [],
          selectedUser: [],
          withUnreadMessages: false,
          isNotAssignedUser: false,
          includeNotQueueDefined: true,
        };
        // this.consultarTickets()
      }
    },
    'pesquisaTickets.includeClosed': function (newValue, oldValue) {
      // Limpar cache quando includeClosed mudar para garantir dados corretos
      if (newValue !== oldValue) {
        this.cleanupMemory();
      }
    },
    'pesquisaTickets.selectedUser': {
      handler(value) {
        this.onUserChange(value);
      },
      deep: true
    },
    'pesquisaTickets.whatsappIds': {
      handler(value) {
        this.onWhatsappChange(value);
      },
      deep: true
    },
    'pesquisaTickets.queuesIds': {
      handler(value) {
        this.onQueueChange(value);
      },
      deep: true
    },
    ticketFocado: {
      handler(newVal, oldVal) {
        // Só executa se o ticket mudou e tem um ID válido
        if (newVal && newVal.id && newVal.id !== oldVal?.id) {
          this.carregarIntegracaoStatus();
        }
        try{
          this.startPausedIndicator('paused', oldVal)
        } catch(e){
          console.error('Erro ao enviar paused indicator:', e)
        }
      },
      immediate: true
    },
    logsAvaliacao: 'calcularMedia',
    notificacaoChatPrivado: {
      handler() {
        
        if (this.$route.fullPath.indexOf('atendimento-Interno') < 0 || !this.chatFocado.id || this.chatFocado.id !== this.notificacaoChatPrivado.senderId) {
          this.$store.commit('LIST_PRIVATE_NOTIFICATION', { action: 'update', data: 1 })
        }
        
        this.$nextTick(() => {
          const isRecording = JSON.parse(localStorage.getItem('recording'))
          
          if (isRecording) {
            console.log('Em gravação, som não será reproduzido')
            return
          }
          
          try {
            const audio = this.$refs.audioNotificationPlay2
            
            if (audio) {

              audio.currentTime = 0
              audio.play()
                .then(() => {
                  
                })
                .catch(error => {
                  console.error('Erro ao reproduzir som de notificação:', error)

                })
            } else {
              console.error('Elemento de áudio não encontrado no DOM')
            }
          } catch(e) {
            console.error('Erro ao acessar elemento de áudio:', e)
            console.error('Stack trace:', e.stack)
          }
        })
        
        this.listarMensagens()
      }
    },
  },
  computed: {
    ...mapGetters(['tickets', 'ticketFocado', 'mensagens', 'hasMore', 'whatsapps', 'notificacaoChatPrivado']),
    ...mapGetters({
      uiFlags: 'webphone/getUIFlags',
      callInfo: 'webphone/getCallInfo',
      inboxes: 'whatsapps',
      wavoip: 'webphone/getWavoip',
      isWebphoneVisible: 'asterisk/getWebphoneVisible'
    }),
    cSessions() {
      return this.whatsapps.filter(w => ["whatsapp", "baileys", "meow", "evo", "waba", "uazapi", "zapi"].includes(w.type) && !w.isDeleted && w.status === 'CONNECTED');
    },
    cSessionsOptions() {
      if (!this.usuarioDados || !this.tenantDados || !this.cSessions) return [];

      const isAdminOrSuper = this.usuario.profile === 'admin' || 
        (this.usuario.profile === 'super' && this.tenantDados.supervisorAdmin === 'disabled');

      if (isAdminOrSuper) {
        return this.cSessions.map(w => ({ label: w.name, value: w.id, type: w.type }));
      } else {
        return this.cSessions
          .filter(w => this.usuarioDados.whatsappAllowed.some(wa => wa.id === w.id))
          .map(w => ({ label: w.name, value: w.id, type: w.type }));
      }
    },
    // cSessionsOptions() {
    //   return this.cSessions.map(w => ({ label: w.name, value: w.id, type: w.type }))
    // },
    desabilitarInputWebChat() {
      if (this.ticketFocado.channel === 'webchat') {
        return false;
      }
      return true;
    },
    desabilitarInputWebchat() {
      if (this.ticketFocado.channel === 'webchat') {
        return true;
      }
      return true;
    },
    desabilitarInput() {
      if (this.ticketFocado.channel !== 'waba' && !this.ticketFocado.channel.includes('hub') && this.ticketFocado.channel !== 'webmail') {
        return false;
      }
      else if(this.ticketFocado.channel === 'webmail') {
        return true;
      }
      else if (this.ticketFocado.channel === 'hub_email') {
        return true;
      }
      const agora = new Date();
      const ultimaMensagem = new Date(Number(this.ticketFocado.lastMessageReceived));
      const diferencaEmHoras = (agora.getTime() - ultimaMensagem.getTime()) / (1000 * 60 * 60);
      this.openWindow = diferencaEmHoras > 24;
      return diferencaEmHoras > 24
      // const diferenca = diferencaEmHoras > 24
      //return !diferenca && !this.ticketFocado.answered;
    },
    isCallActive() {
      return this.$store.state.webphone.call.status === 'offer' || 
            this.$store.state.webphone.call.status === 'accept' || 
            this.$store.state.webphone.call.status === 'outcoming_calling';
    },
    whatsappOptions() {
      return this.whatsapps.map(whatsapp => ({
        id: whatsapp.id,
        name: whatsapp.name,
      }));
    },
    cUserQueues() {
      return UserQueues
    },
    style() {
      return {
        height: this.$q.screen.height + 'px',
      }
    },
    cToolbarSearchHeigthAjust() {
      return this.toolbarSearch ? 58 : 0
    },
    cHeigVerticalTabs() {
      return `${50 + this.cToolbarSearchHeigthAjust}px`
    },
    cRouteContatos() {
      return this.$route.name === 'chat-contatos'
    },
    cFiltroSelecionado() {
      const { queuesIds, whatsappIds, selectedUser, showAll, withUnreadMessages, isNotAssignedUser } = this.pesquisaTickets
      return !!(queuesIds?.length || whatsappIds?.length || selectedUser?.length || showAll || withUnreadMessages || isNotAssignedUser)
    },
    cIsExtraInfo() {
      return this.ticketFocado?.contact?.extraInfo?.length > 0
    },
    openTickets() {
      const filteredTickets = this.tickets.filter(ticket => ticket.status === 'open' && !ticket.isGroup)
      const groupedTickets = filteredTickets.reduce((acc, ticket) => {
        const key = `${ticket.whatsappId}_${ticket.userId}_${ticket.status}_${ticket.contactId}`;
        if (!acc[key] || acc[key].id > ticket.id) {
          acc[key] = ticket;
        }
        // console.log(`Ticket original ${acc[key].id} encontrado.`);
        return acc;
      }, {});
      // const groupedTicketIds = new Set(Object.values(groupedTickets).map(ticket => ticket.id));
      // const remainingTickets = filteredTickets.filter(ticket => !groupedTicketIds.has(ticket.id));   
      // remainingTickets.forEach(ticket => {
      //   // AtualizarStatusTicketNull(ticket.id, 'closed', ticket.userId);
      //   // console.log(`Ticket duplo #${ticket.id} encontrado.`);
      // });
      // return Object.values(groupedTickets).slice(0, this.batchSize);
      // return Object.values(groupedTickets)
      if(this.listarPelaUltimaMensagem === 'enabled'){
        return Object.values(groupedTickets).sort((a, b) => {
          const timeA = a.lastMessageAt || 0;
          const timeB = b.lastMessageAt || 0;
          return timeB - timeA;
        });
      } else {
        return Object.values(groupedTickets)
      }
    },
    pendingTickets() {
      const filteredTickets = this.tickets.filter(ticket => ticket.status === 'pending' && !ticket.isGroup)
      const groupedTickets = filteredTickets.reduce((acc, ticket) => {
        const key = `${ticket.whatsappId}_${ticket.userId}_${ticket.status}_${ticket.contactId}`;
        if (!acc[key] || acc[key].id > ticket.id) {
          acc[key] = ticket;
        }
        // console.log(`Ticket original ${acc[key].id} encontrado.`);
        return acc;
      }, {});
      const groupedTicketIds = new Set(Object.values(groupedTickets).map(ticket => ticket.id));
      const remainingTickets = filteredTickets.filter(ticket => !groupedTicketIds.has(ticket.id));      
      remainingTickets.forEach(ticket => {
        if (ticket.status === 'pending') {
          AtualizarStatusTicketNull(ticket.id, 'closed', ticket.userId);
          console.log(`Ticket duplo #${ticket.id} encontrado.`);
        }
      });
      // return this.tickets.filter(ticket => !ticket.isGroup)
      // return Object.values(groupedTickets)
      if(this.listarPelaUltimaMensagem === 'enabled'){
        return Object.values(groupedTickets).sort((a, b) => {
          const timeA = a.lastMessageAt || 0;
          const timeB = b.lastMessageAt || 0;
          return timeB - timeA;
        });
      } else {
        return Object.values(groupedTickets)
      }
    },
    pendingTicketsChatBot() {
      // return this.tickets.filter(ticket => ticket.status === 'pending' && !ticket.isGroup)
      const filteredTickets = this.tickets.filter(ticket => ticket.status === 'pending' && !ticket.isGroup && ticket.chatFlowId);
      const groupedTickets = filteredTickets.reduce((acc, ticket) => {
        const key = `${ticket.whatsappId}_${ticket.userId}_${ticket.status}_${ticket.contactId}`;
        if (!acc[key] || acc[key].id > ticket.id) {
          acc[key] = ticket;
        }
        return acc;
      }, {});
      if(this.listarPelaUltimaMensagem === 'enabled'){
      return Object.values(groupedTickets).sort((a, b) => {
        const timeA = a.lastMessageAt || 0;
        const timeB = b.lastMessageAt || 0;
          return timeB - timeA;
        });
      } else {
        return Object.values(groupedTickets)
      }
      // return Object.values(groupedTickets);
      // return Object.values(groupedTickets).slice(0, this.batchSize);
    },
    closedTickets() {
      return this.tickets.filter(ticket => ticket.status === 'closed' && !ticket.isGroup)
      // return this.tickets.filter(ticket => ticket.status === 'closed' && !ticket.isGroup).slice(0, this.batchSize);
    },
    closedGroupTickets() {
      return this.tickets.filter(ticket => ticket.status === 'closed' && ticket.isGroup)
      // return this.tickets.filter(ticket => ticket.status === 'closed' && ticket.isGroup).slice(0, this.batchSize);
    },
    openGroupTickets() {
      // return this.tickets.filter(ticket => ticket.status === 'open' && ticket.isGroup)
      const filteredTickets = this.tickets.filter(ticket => ticket.status === 'open' && ticket.isGroup);
      const groupedTickets = filteredTickets.reduce((acc, ticket) => {
        const key = `${ticket.whatsappId}_${ticket.userId}_${ticket.status}_${ticket.contactId}`;
        if (!acc[key] || acc[key].id > ticket.id) {
          acc[key] = ticket;
        }
        return acc;
      }, {});
      if(this.listarPelaUltimaMensagem === 'enabled'){
      return Object.values(groupedTickets).sort((a, b) => {
        const timeA = a.lastMessageAt || 0;
        const timeB = b.lastMessageAt || 0;
          return timeB - timeA;
        });
      } else {
        return Object.values(groupedTickets)
      }
      // return Object.values(groupedTickets);
      // return Object.values(groupedTickets).slice(0, this.batchSize);
    },
    pendingGroupTickets() {
      // return this.tickets.filter(ticket => ticket.status === 'pending' && ticket.isGroup)
      const filteredTickets = this.tickets.filter(ticket => ticket.status === 'pending' && ticket.isGroup);
      const groupedTickets = filteredTickets.reduce((acc, ticket) => {
        const key = `${ticket.whatsappId}_${ticket.userId}_${ticket.status}_${ticket.contactId}`;
        if (!acc[key] || acc[key].id > ticket.id) {
          acc[key] = ticket;
        }
        return acc;
      }, {});
      if(this.listarPelaUltimaMensagem === 'enabled'){
      return Object.values(groupedTickets).sort((a, b) => {
        const timeA = a.lastMessageAt || 0;
        const timeB = b.lastMessageAt || 0;
        return timeB - timeA;
        });
      } else {
        return Object.values(groupedTickets)
      }
      // return Object.values(groupedTickets);
      // return Object.values(groupedTickets).slice(0, this.batchSize);
    },
    privateMessages() {
      return this.tickets.filter(ticket => ticket.unreadMessages && !ticket.isGroup)
    },
    groupMessages() {
      return this.tickets.filter(ticket => ticket.unreadMessages && ticket.isGroup)
    },
    openTicketsReversed() {
      const tickets = this.openTickets;
      return this.isReversed ? [...tickets].reverse() : tickets;
    },
    pendingTicketsReversed() {
      const tickets = this.pendingTickets;
      return this.isReversed ? [...tickets].reverse() : tickets;
    },
    closedTicketsReversed() {
      const tickets = this.closedTickets;
      return this.isReversed ? [...tickets].reverse() : tickets;
    },
    openTicketsGroupsReversed() {
      const tickets = this.openGroupTickets;
      return this.isReversed ? [...tickets].reverse() : tickets;
    },
    pendingTicketsGroupsReversed() {
      const tickets = this.pendingGroupTickets;
      return this.isReversed ? [...tickets].reverse() : tickets;
    },
    closedTicketsGroupsReversed() {
      const tickets = this.closedGroupTickets;
      return this.isReversed ? [...tickets].reverse() : tickets;
    },
    pendingTicketsChatbotReversed() {
      const tickets = this.pendingTicketsChatBot;
      return this.isReversed ? [...tickets].reverse() : tickets;
    },
    totalPaginasOportunidades() {
      return Math.ceil(this.paginacaoOportunidades.total / this.paginacaoOportunidades.limit) || 1
    },
    convitesCount() {
      return this.convitesUsuario ? this.convitesUsuario.length : 0;
    },
  },
  methods: {
    ...mapActions('asterisk', ['toggleWebphoneVisibility']),
    isMensagemRapidaPublica(mensagem = {}) {
      const valor = mensagem?.isPublic ?? mensagem?.is_public ?? mensagem?.public ?? mensagem?.publico
      if (typeof valor === 'string') {
        return ['true', '1', 'enabled', 'public', 'sim'].includes(valor.toLowerCase())
      }
      return Boolean(valor)
    },
    normalizarMensagemRapida(mensagem = {}) {
      const usuarioId = this.usuario?.userId ?? null
      const candidatosDiretos = [
        mensagem?.userId,
        mensagem?.user_id,
        mensagem?.ownerId,
        mensagem?.owner_id,
        mensagem?.createdBy,
        mensagem?.created_by,
        mensagem?.usuarioId,
        mensagem?.usuario_id
      ]
      const candidatosAninhados = [
        mensagem?.user?.id,
        mensagem?.owner?.id,
        mensagem?.usuario?.id,
        mensagem?.createdByUser?.id
      ]
      const ownerId = [...candidatosDiretos, ...candidatosAninhados].find(id => id !== undefined && id !== null)

      return {
        ...mensagem,
        userId: ownerId ?? usuarioId ?? mensagem?.userId ?? null,
        isPublic: this.isMensagemRapidaPublica(mensagem)
      }
    },
    isMensagemRapidaDoUsuario(mensagem = {}) {
      if (this.isMensagemRapidaPublica(mensagem)) {
        return true
      }
      const usuarioId = this.usuario?.userId
      if (usuarioId === undefined || usuarioId === null) {
        return false
      }
      const ownerId = mensagem?.userId ?? mensagem?.user_id ?? mensagem?.ownerId ?? mensagem?.owner_id ?? mensagem?.createdBy ?? mensagem?.created_by ?? mensagem?.usuarioId ?? mensagem?.usuario_id ?? mensagem?.user?.id ?? mensagem?.owner?.id ?? mensagem?.usuario?.id ?? mensagem?.createdByUser?.id
      if (ownerId === undefined || ownerId === null) {
        return false
      }
      return String(ownerId) === String(usuarioId)
    },
    filtrarMensagensRapidasDoUsuario(mensagens) {
      if (!Array.isArray(mensagens)) {
        return []
      }
      return mensagens
        .map(mensagem => this.normalizarMensagemRapida(mensagem))
        .filter(mensagem => {
          // Excluir mensagens com user null
          // if (mensagem?.user === null || mensagem?.user === undefined) {
          //   return false
          // }
          return this.isMensagemRapidaDoUsuario(mensagem)
        })
    },
    async atualizarLidContato() {
      if (!this.ticketFocado?.contact?.id) {
        this.$q.notify({
          type: 'negative',
          message: this.$t('generalSupport.contactNotFound')
        });
        return;
      }

      this.loadingLidUpdate = true;
      try {
        const result = await AtualizarLidFromContactId(this.ticketFocado.contact.id);
        this.$q.notify({
          type: 'positive',
          message: this.$t('generalSupport.lidUpdated'),
          caption: `Message: ${result.data.result.consolidationResults.totalMessagesMigrated}, Ticket: ${result.data.result.consolidationResults.totalTicketsMigrated}, Removed: ${result.data.result.consolidationResults.totalRemoved}`
        });
      } catch (error) {
        console.error('Erro ao atualizar LID:', error);
        this.$q.notify({
          type: 'negative',
          message: this.$t('generalSupport.errorUpdatingLid')
        });
      } finally {
        this.loadingLidUpdate = false;
        setTimeout(() => {
          window.location.reload();
        }, 1000)
      }
    },
    toggleWebphone() {
      this.toggleWebphoneVisibility(true);
    },
    abrirModalVapi(){
      const number = this.ticketFocado.contact.number;
      const countryCode = number.slice(0, 2);
      const ddd = number.slice(2, 4);
      let phone = number.slice(4);

      // Se for Brasil (55) e não começar com 9, adiciona o 9
      if (countryCode === '55' && !phone.startsWith('9')) {
        phone = '9' + phone;
      }

      // Monta o número formatado
      const formatted = `+${countryCode}${ddd}${phone}`;

      this.customerNumber = formatted;
      this.dialogVapiVisible = true;
    },
    async listarAssistentes() {
      if(!this.vapiToken || this.vapiToken === '') return
      try {
        const { data } = await ListarAssistentes(this.usuario.tenantId);
        // Garantir que assistentes seja sempre um array
        if (Array.isArray(data)) {
          this.assistentes = data;
        } else if (data && Array.isArray(data.data)) {
          // Se a API retornar um objeto com propriedade 'data' que é um array
          this.assistentes = data.data;
        } else if (data && Array.isArray(data.assistants)) {
          // Se a API retornar um objeto com propriedade 'assistants' que é um array
          this.assistentes = data.assistants;
        } else {
          // Se não for nenhum dos casos acima, usar array vazio
          this.assistentes = [];
        }
      } catch (error) {
        console.error('Erro ao listar assistentes:', error);
        this.assistentes = [];
      }
    },
    async listarNumerosDeTelefone() {
      if(!this.vapiToken || this.vapiToken === '') return
      try {
        const { data } = await ListarNumerosDeTelefone(this.usuario.tenantId);
        // Garantir que numerosDeTelefone seja sempre um array
        if (Array.isArray(data)) {
          this.numerosDeTelefone = data;
        } else if (data && Array.isArray(data.data)) {
          // Se a API retornar um objeto com propriedade 'data' que é um array
          this.numerosDeTelefone = data.data;
        } else if (data && Array.isArray(data.phoneNumbers)) {
          // Se a API retornar um objeto com propriedade 'phoneNumbers' que é um array
          this.numerosDeTelefone = data.phoneNumbers;
        } else {
          // Se não for nenhum dos casos acima, usar array vazio
          this.numerosDeTelefone = [];
        }
      } catch (error) {
        console.error('Erro ao listar números de telefone:', error);
        this.numerosDeTelefone = [];
      }
    },
    async fazerChamada() {
      try {
        const customers = [{ number: this.customerNumber }];
        await CriarChamada(this.usuario.tenantId, customers, this.selectedAssistantId.value, this.selectedPhoneNumberId.value);
        this.$q.notify({ type: 'positive', message: this.$t('vapi.success') });
        this.dialogVapiVisible = false;
        this.selectedAssistantId = null;
        this.selectedPhoneNumberId = null;
        this.customerNumber = '';
      } catch (error) {
        console.error('Erro ao fazer chamada de teste:', error);
        this.$q.notify({ type: 'negative', message: this.$t('vapi.error') });
      }
    },
    async deletarOportunidade(oportunidade) {
      this.$q
        .dialog({
          title: this.$t('funil.atencao'),
          message: this.$t('funil.deletarOportunidade'),
          cancel: {
            label: this.$t('funil.nao'),
            color: 'primary',
            push: true,
          },
          ok: {
            label: this.$t('funil.sim'),
            color: 'negative',
            push: true,
          },
          persistent: true,
        })
        .onOk(() => {
          this.loading = true;
          DeletarOpportunity(oportunidade.id)
            .then(() => {
              this.loading = false;
              this.carregarOportunidadesContato();
              this.$q.notify({
                type: 'positive',
                message: this.$t('funil.oportunidadeDeletada')
              });
            })
            .catch(error => {
              this.loading = false;
              console.error(error);
              this.$q.notify({
                type: 'negative',
                message: this.$t('funil.erroAoDeletar')
              });
            });
        })
        .onCancel(() => {});
      // try {
      //   await DeletarOpportunity(oportunidade.id)
      //   this.$q.notify({
      //     color: 'positive',
      //     position: 'top',
      //     message: this.$t('generalSupportScript.messageSent') + this.numero,
      //   });
      //   this.paginacaoOportunidades.page = 1
      //   this.carregarOportunidadesContato()
      // } catch (error) {
      //   console.error(this.$t('atendimentoItemTicket.errors.erroRemoverFoto'), error);
      // }
    },
    async editarOportunidade(oportunidade) {
      // Garante que o status seja o value original, não o label
      this.oportunidadeSelecionada = {
        ...oportunidade,
        status: oportunidade.statusOriginal || oportunidade.status
      }
      this.showOpportunityFormEditar = true;
    },
    async handleImageError(){
      // console.log('this.ticketFocado.contactId', this.ticketFocado.contactId)
      if(!this.ticketFocado.contactId) return
      try {
        await RemoverFotoNula(this.ticketFocado.contactId)
      } catch (error) {
        console.error(this.$t('atendimentoItemTicket.errors.erroRemoverFoto'), error);
      }
    },
    abrirModal() {
      this.modalVisivel = true;
    },
    clearCookies() {
      localStorage.clear();
      sessionStorage.clear();
      const allCookies = Cookies.get();
      for (const cookie in allCookies) {
        Cookies.remove(cookie);
      }
      localStorage.clear();
      sessionStorage.clear();
      alert(this.$t('mainLayout.cookieWarning'));
      window.location.reload();
    },
    async limparDemanda(){  
      this.motivoSelecionado = null
      try{
        await AtualizarTicket(this.ticketFocado.id, {
          reasons: this.motivoSelecionado,
        })
      }
      catch(e){
        console.log(e)
      }
    },
    async selecionarMotivo(){
      if(!this.motivoSelecionado){
        this.motivoSelecionado = null
      }
      try{ 
        await AtualizarTicket(this.ticketFocado.id, {
        reasons: this.motivoSelecionado,
        })
      }
      catch(e){
        console.log(e)
      }
    },
    async atualizarValorNegociado(){
      if(!this.valorNegociado){
        this.valorNegociado = null
      }
      try{ 
        await AtualizarTicket(this.ticketFocado.id, {
        value: this.valorNegociado,
        })
      }
      catch(e){
        console.log(e)
      }
    },
    toggleOrder() {
      this.isReversed = !this.isReversed;
    },
    async enviarMensagem() {
      this.loadingMensagem = true;
      
      try {
        if (this.whatsappId && this.whatsappId.type === 'waba') {
          await this.enviarMensagemWaba();
        } else {
          await this.enviarMensagemNormal();
        }
      } catch (e) {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('generalSupportScript.messageSendError') + (e.data?.error || e.message),
        });
      } finally {
        this.loadingMensagem = false;
        this.closeModal();
      }
    },

    async enviarMensagemNormal() {
      const data = {
        whatsappId: this.whatsappId.value,
        whatsappType: this.whatsappId.type,
        number: this.numero,
        message: this.mensagem,
      };
      
      const response = await TextoIndividual(data);
      
      let message = this.$t('generalSupportScript.messageSent') + this.numero;
      
      if (response.data && response.data.ticketId) {
        message += `<br><strong>Ticket ID:</strong> ${response.data.ticketId}`;
        if (response.data.status) {
          message += ` | <strong>Status:</strong> ${response.data.status}`;
        }
        if (response.data.userId) {
          const userName = response.data.userName || response.data.userId;
          message += ` | <strong>Usuário:</strong> ${userName} (ID: ${response.data.userId})`;
        }
      }
      
      this.$q.notify({
        color: 'positive',
        position: 'top',
        html: true,
        message: message,
      });
    },

    async enviarMensagemWaba() {
      // Limpar mensagem para WABA
      this.mensagem = '';
      
      // Verificar se temos os dados necessários
      if (!this.usuario || !this.usuario.userId) {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('mainLayout.novo.userNotFound'),
        });
        return;
      }

      if (!this.whatsappId || !this.whatsappId.value) {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('mainLayout.novo.whatsappNotFound'),
        });
        return;
      }

      if (!this.numero) {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('mainLayout.novo.numberNotFound'),
        });
        return;
      }
      
      // 1. Verificar se contato existe
      let contato;
      const numeroLimpo = this.numero.replace(/\D/g, '');
      
      if (!numeroLimpo) {
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('mainLayout.novo.numberInvalid'),
        });
        return;
      }
      
      try {
        const { data } = await ObterContatoPeloNumero(numeroLimpo);
        contato = data;
      } catch (error) {
        // Contato não existe, criar um novo
        const novoContato = {
          name: this.numero,
          number: this.numero,
        };
        const { data } = await CriarContato(novoContato);
        contato = data;
      }

      // 2. Verificar se já tem ticket aberto
      let ticketExistente;
      try {
        if (contato.id && this.whatsappId.value) {
          const response = await VerificarTicketsAbertos(contato.id, this.whatsappId.value);
          
          // Verificar se a resposta contém um ticket válido
          if (response.data && response.data.id && response.data.contactId && response.data.status) {
            ticketExistente = response.data;
          }
        }
      } catch (error) {
        // Se o erro for 409 (Conflict), significa que já existe um ticket
        if (error.status === 409 && error.data) {
          
          // Verificar se o ticket está na propriedade 'ticket' ou se precisa fazer parse do 'error'
          if (error.data.ticket) {
            ticketExistente = error.data.ticket;
          } else if (error.data.error) {
            const ticketAtual = JSON.parse(error.data.error);
            ticketExistente = ticketAtual;
          }
        } else {
          ticketExistente = null;
        }
      }

      if (ticketExistente && ticketExistente.id) {
        if(this.isNotViewAssignedTickets === 'enabled' && this.userProfile === 'user'){
          this.$q.dialog({
            title: this.$t('common.attention'),
            message: this.$t('scriptMainLayout.contactHasOngoingTicket', { contact: contato.name }) +
            ' ' + this.$t('scriptMainLayout.adminCanAssign'),
            // message: `${contato} possui um atendimento em curso. Somente um administrador pode atribuir esse atendimento para você.`,
            ok: {
              label: this.$t('common.ok'),
              color: 'negative',
              push: true
            },
            persistent: true
          })
          this.loading = false
          return
        }
        // Se o status for pending, atualizar para open antes de rotear
        const updateData = {}
        const needsStatusUpdate = ticketExistente.status === 'pending'
        
        if (needsStatusUpdate) {
          updateData.status = 'open'
          updateData.userId = this.usuario.userId
          ticketExistente.status = 'open'
          ticketExistente.userId = this.usuario.userId
        }
        
        if (ticketExistente.whatsappId === null) {
          updateData.whatsapp = channelId
        }
        
        // Atualizar ticket se houver mudanças
        if (Object.keys(updateData).length > 0) {
          await AtualizarTicket(ticketExistente.id, updateData)
          
          // Aguardar 250ms para dar tempo de salvar no banco
          await new Promise(resolve => setTimeout(resolve, 250))
        }
        // Abrir ticket existente
        await this.$store.dispatch('AbrirChatMensagens', ticketExistente);
        this.$router.push({ name: 'chat', params: { ticketId: ticketExistente.id } });
        this.$q.notify({
          color: 'info',
          position: 'top',
          message: this.$t('mainLayout.novo.ticketCreated', { contatoName: contato.name, ticketId: ticketExistente.id }),
        });
      } else {
        // Criar novo ticket
        if (!contato.id || !this.whatsappId.value || !this.usuario.userId) {
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: this.$t('mainLayout.novo.invalidData'),
          });
          return;
        }
        
        const ticketData = {
          contactId: contato.id,
          isActiveDemand: true,
          userId: this.usuario.userId,
          channel: this.whatsappId.type, // Usar o tipo do WhatsApp selecionado (waba)
          channelId: this.whatsappId.value,
          status: 'open'
        };
        
        const { data: ticket } = await CriarTicket(ticketData);
        
        if (ticket && ticket.id) {
          await this.$store.dispatch('AbrirChatMensagens', ticket);
          this.$router.push({ name: 'chat', params: { ticketId: ticket.id } });
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: this.$t('mainLayout.novo.ticketCreated', { contatoName: contato.name, ticketId: ticket.id }),
          });
        } else {
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: 'Erro: Ticket criado mas sem ID válido.',
          });
        }
      }
    },
    closeModal() {
      this.showModalMensagem = false;
      this.resetFields();
    },
    resetFields() {
      this.numero = '';
      this.mensagem = '';
      this.whatsappId = null;
    },
    openWebphoneCall() {
      this.$store.dispatch('webphone/toggleWebphoneVisibility', true);
    },
    handleBeforeUnload(event) {
      // if(this.isCallActive){
      //   const confirmationMessage = 'Tem certeza que deseja sair da página? Suas alterações serão perdidas.';
      //   event.returnValue = confirmationMessage;
      //   return confirmationMessage;
      // }
    },
    onKanbanChange(value) {
      this.selectedKanban = value;

      if (!value) {
        localStorage.removeItem('kanbanFiltro');
        this.selectedFilter = null; 
        // this.pesquisaTickets.selectedKanban = null;
        this.pesquisaTickets = {
          searchParam: '',
          pageNumber: 1,
          status: ['open', 'pending'],
          showAll: false,
          includeClosed: false,
          count: null,
          queuesIds: [],
          whatsappIds: [],
          selectedUser: [],
          withUnreadMessages: false,
          isNotAssignedUser: false,
          includeNotQueueDefined: true,
          // date: new Date(),
        },
        // this.pesquisaTickets.selectedTag = null;
        setTimeout(() => {
          this.BuscarTicketFiltro();
        }, 500);
      } else {
        this.pesquisaTickets = {
          ...this.pesquisaTickets,
          queuesIds: [],
          whatsappIds: [],
          selectedUser:[]
        }
        this.selectedFilter = 'kanban';
        this.BuscarTicketFiltro();
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.loadMoreTickets'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        });
        setTimeout(() => {
          this.pesquisaTickets.pageNumber++
          this.consultarTickets()
        }, 500);
        // setTimeout(() => {
        //   this.pesquisaTickets.pageNumber++
        //   this.consultarTickets()
        // }, 1000);
        // setTimeout(() => {
        //   this.pesquisaTickets.pageNumber++
        //   this.consultarTickets()
        // }, 1500);
        // setTimeout(() => {
        //   this.pesquisaTickets.pageNumber++
        //   this.consultarTickets()
        // }, 2000);
      }
      this.updateSelectedFilter();
    },
    onTagChange(value) {
      this.selectedTag = value;
      
      if (!value) {
        localStorage.removeItem('tagFiltro');
        this.selectedFilter = null; 
        this.pesquisaTickets = {
          searchParam: '',
          pageNumber: 1,
          status: ['open', 'pending'],
          showAll: false,
          count: null,
          queuesIds: [],
          whatsappIds: [],
          selectedUser:[],
          withUnreadMessages: false,
          isNotAssignedUser: false,
          includeNotQueueDefined: true,
          // date: new Date(),
        },
        // this.pesquisaTickets.selectedTag = null;
        setTimeout(() => {
          this.BuscarTicketFiltro();
        }, 500);
      } else {
        this.pesquisaTickets = {
          ...this.pesquisaTickets,
          queuesIds: [],
          whatsappIds: [],
          selectedUser:[]
        }
        this.selectedFilter = 'tag';
        // console.log('this.selectedFilter tag', this.selectedFilter)
        this.BuscarTicketFiltro();
        this.$q.notify({
          type: 'positive',
          message: this.$t('common.loadMoreTickets'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        });
        setTimeout(() => {
          this.pesquisaTickets.pageNumber++
          this.consultarTickets()
        }, 500);
        // setTimeout(() => {
        //   this.pesquisaTickets.pageNumber++
        //   this.consultarTickets()
        // }, 1000);
        // setTimeout(() => {
        //   this.pesquisaTickets.pageNumber++
        //   this.consultarTickets()
        // }, 1500);
        // setTimeout(() => {
        //   this.pesquisaTickets.pageNumber++
        //   this.consultarTickets()
        // }, 2000);
      }
      this.updateSelectedFilter();
      
    },
    onUserChange(value) {
      // Limpar cache quando filtros mudam
      limparCacheTickets()
      this.updateSelectedFilter();
      // this.selectedFilter = value && value.length ? 'user' : null;
    },
    onQueueChange(value) {
      // Limpar cache quando filtros mudam
      limparCacheTickets()
      this.updateSelectedFilter();
      // this.selectedFilter = value && value.length ? 'queues' : null;
    },
    onWhatsappChange(value) {
      // Limpar cache quando filtros mudam
      limparCacheTickets()
      this.updateSelectedFilter();
      // this.selectedFilter = value && value.length ? 'whatsapp' : null;
    },
    async updateSelectedFilter() {
      if (
        (this.pesquisaTickets.selectedUser && this.pesquisaTickets.selectedUser?.length) ||
        (this.pesquisaTickets.whatsappIds && this.pesquisaTickets.whatsappIds?.length) ||
        (this.pesquisaTickets.queuesIds && this.pesquisaTickets.queuesIds?.length) ||
        (this.selectedTag) ||
        (this.selectedKanban)
      ) {
        if (this.pesquisaTickets.selectedUser?.length) {
          this.selectedFilter = 'user';
        } else if (this.pesquisaTickets.whatsappIds?.length) {
          this.selectedFilter = 'whatsapp';
        } else if (this.pesquisaTickets.queuesIds?.length) {
          this.selectedFilter = 'queues';
        } else if (this.selectedTag) {
          this.selectedFilter = 'tag';
        } else if (this.selectedKanban) {
          this.selectedFilter = 'kanban';
        }
      } else {
        this.selectedFilter = null;
      }
      // Removido: await this.consultarTickets()
      // A consulta será feita por BuscarTicketFiltro() que é chamado após esta função

    },
    // onUserChange(value) {
    //   this.selectedFilter = 'user';
    //   console.log('this.selectedFilter 2', this.selectedFilter)
    //   // if (!value) {
    //   //   localStorage.removeItem('userFiltro');
    //   //   this.selectedFilter = null; 
    //   //   this.pesquisaTickets = {
    //   //     searchParam: '',
    //   //     pageNumber: 1,
    //   //     status: ['open', 'pending'],
    //   //     showAll: false,
    //   //     count: null,
    //   //     queuesIds: [],
    //   //     whatsappIds: [],
    //   //     selectedUser:[],
    //   //     withUnreadMessages: false,
    //   //     isNotAssignedUser: false,
    //   //     includeNotQueueDefined: true,
    //   //     // date: new Date(),
    //   //   },
    //   //   // this.pesquisaTickets.selectedUser = null;
    //   //   setTimeout(() => {
    //   //     this.BuscarTicketFiltro();
    //   //   }, 500);
    //   // } else {
    //   //   this.pesquisaTickets = {
    //   //     ...this.pesquisaTickets,
    //   //     queuesIds: [],
    //   //     whatsappIds: [],
    //   //     selectedUser: []
    //   //   }
    //   //   this.selectedFilter = 'user';
    //   //   setTimeout(() => {
    //   //     this.BuscarTicketFiltro();
    //   //   }, 500);
    //   // }
    // },
    // onWhatsappChange(value) {
    //   this.selectedWhatsapp = value;

    //   if (!value) {
    //     localStorage.removeItem('whatsappIdFiltro');
    //     this.selectedFilter = null; 
    //     this.pesquisaTickets = {
    //       searchParam: '',
    //       pageNumber: 1,
    //       status: ['open', 'pending'],
    //       showAll: false,
    //       count: null,
    //       queuesIds: [],
    //       whatsappIds: [],
    //       selectedUser:[],
    //       withUnreadMessages: false,
    //       isNotAssignedUser: false,
    //       includeNotQueueDefined: true,
    //       // date: new Date(),
    //     },
    //     // this.pesquisaTickets.whatsappId = null;
    //     this.BuscarTicketFiltro();
    //   } else {
    //     this.pesquisaTickets = {
    //       ...this.pesquisaTickets,
    //       queuesIds: [],
    //       whatsappIds: [],
    //       selectedUser:[]
    //     }
    //     this.selectedFilter = 'whatsapp';
    //     this.BuscarTicketFiltro();
    //   }
    // },
    disableOthers(filter) {
      // Desabilita os outros filtros se um filtro já estiver selecionado
      return this.selectedFilter && this.selectedFilter !== filter;
    },
    async downloadPDF() {
      const doc = new jsPDF();
      const margin = 10;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = margin + 20;

      this.loading = true;
      try {
        const response = await ExportarMensagens({ ticketId: this.ticketFocado.id });
        const mensagens = response.data.messages;
        const protocolo = mensagens[0]?.ticket?.protocol || "N/A";
        const contato = mensagens[0]?.contact || {};
        const ticket = mensagens[0]?.ticket || {};

        // Cabeçalho (somente na primeira página)
        const addFirstPageHeader = () => {
          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.text(this.$t('generalSupportScript.reportTitle'), margin, margin);
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(`${this.$t('generalSupportScript.protocolLabel')}: ${protocolo}`, margin, margin + 8);
          doc.text(`${this.$t('generalSupportScript.ticketIdLabel')}: ${ticket.id || "N/A"} | ${this.$t('generalSupportScript.whatsappIdLabel')}: ${ticket.whatsappId || "N/A"} | ${this.$t('generalSupportScript.channelLabel')}: ${ticket.channel || "N/A"}`, margin, margin + 16);
          doc.line(margin, margin + 22, pageWidth - margin, margin + 22); // Linha separadora
        };

        // Rodapé
        const addFooter = () => {
          doc.setFontSize(10);
          doc.setFont("helvetica", "italic");
          doc.text(`${this.$t('generalSupportScript.footerGeneratedOn')}: ${new Date().toLocaleString()}`, margin, pageHeight - margin);
        };

        // Cabeçalho na primeira página
        addFirstPageHeader();

        // Informações do contato na primeira página
        if (contato.name) {
          yPosition += 10;
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.text(`${this.$t('generalSupportScript.nameLabel')}: ${contato.name}`, margin, yPosition);
          yPosition += 6;
          doc.text(`${this.$t('generalSupportScript.numberLabel')}: ${contato.number}`, margin, yPosition);
          yPosition += 6;

          if (contato.profilePicUrl) {
            const img = await this.fetchImage(contato.profilePicUrl);
            doc.addImage(img, "JPEG", pageWidth - 50, margin + 10, 40, 40);
          }

          yPosition += 10;
          doc.line(margin, yPosition, pageWidth - margin, yPosition); // Linha separadora
          yPosition += 10;
        }

        // Listar mensagens
        let currentPage = 1;

        mensagens.forEach((mensagem) => {
          if (yPosition > pageHeight - margin - 30) {
            addFooter(); // Adiciona rodapé na página anterior
            doc.addPage();
            currentPage += 1;
            yPosition = margin + 10; // Reinicia a posição vertical
          }

          // Estilo diferenciado para remetente
          const remetente = mensagem.fromMe ? "Eu" : mensagem.contact.name || "Contato";
          const remetenteColor = mensagem.fromMe ? [0, 102, 204] : [0, 0, 0]; // Azul para mensagens do usuário
          doc.setTextColor(...remetenteColor);
          doc.setFont("helvetica", "bold");
          doc.text(`${this.$t('generalSupportScript.messageFrom')}: ${remetente}`, margin, yPosition);
          yPosition += 8;

          // Data e Hora
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          const dataHora = new Date(mensagem.createdAt).toLocaleString("pt-BR", {
            dateStyle: "long",
            timeStyle: "short",
          });
          doc.text(`${this.$t('generalSupportScript.dateTimeLabel')}: ${dataHora}`, margin, yPosition);
          yPosition += 8;

          // UserID
          if (mensagem.userId) {
            doc.text(`${this.$t('generalSupportScript.userIdLabel')}: ${mensagem.userId}`, margin, yPosition);
            yPosition += 8;
          }

          // Corpo da mensagem
          const body = mensagem.mediaType === "templates" ? this.formatTemplate(mensagem.body) : mensagem.body;
          const lines = doc.splitTextToSize(body, pageWidth - 2 * margin);
          doc.text(lines, margin, yPosition);
          yPosition += lines?.length * 8;

          // Linha separadora
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 10;
        });

        // Adicionar rodapé na última página
        addFooter();

        // Salvar PDF
        doc.save(`${this.$t('generalSupportScript.saveFileName')}${this.ticketFocado.id}_mensagens.pdf`);
      } catch (error) {
        console.error(this.$t('generalSupportScript.errorDownloadingPDF'), error);
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } finally {
        this.loading = false;
      }
    },
    // async downloadPDF() {
    //   const doc = new jsPDF();
    //   const margin = 10;
    //   const pageWidth = doc.internal.pageSize.getWidth();
    //   const pageHeight = doc.internal.pageSize.getHeight();
    //   let yPosition = margin + 20;

    //   try {
    //     const response = await LocalizarMensagens({ ticketId: this.ticketFocado.id });
    //     const mensagens = response.data.messages;
    //     const protocolo = mensagens[0]?.ticket?.protocol || "N/A";
    //     const contato = mensagens[0]?.contact || {};
    //     const ticket = mensagens[0]?.ticket || {};

    //     // Cabeçalho (somente na primeira página)
    //     const addFirstPageHeader = () => {
    //       doc.setFontSize(14);
    //       doc.setFont("helvetica", "bold");
    //       doc.text("Relatório de Mensagens - Atendimento", margin, margin);
    //       doc.setFontSize(10);
    //       doc.setFont("helvetica", "normal");
    //       doc.text(`Protocolo: ${protocolo}`, margin, margin + 8);
    //       doc.text(`Ticket ID: ${ticket.id || "N/A"} | WhatsApp ID: ${ticket.whatsappId || "N/A"} | Canal: ${ticket.channel || "N/A"}`, margin, margin + 16);
    //       doc.line(margin, margin + 22, pageWidth - margin, margin + 22); // Linha separadora
    //     };

    //     // Rodapé
    //     const addFooter = () => {
    //       doc.setFontSize(10);
    //       doc.setFont("helvetica", "italic");
    //       doc.text(`Gerado em: ${new Date().toLocaleString()}`, margin, pageHeight - margin);
    //     };

    //     // Cabeçalho na primeira página
    //     addFirstPageHeader();

    //     // Informações do contato na primeira página
    //     if (contato.name) {
    //       yPosition += 10;
    //       doc.setFont("helvetica", "normal");
    //       doc.setFontSize(10);
    //       doc.text(`Nome: ${contato.name}`, margin, yPosition);
    //       yPosition += 6;
    //       doc.text(`Número: ${contato.number}`, margin, yPosition);
    //       yPosition += 6;

    //       if (contato.profilePicUrl) {
    //         const img = await this.fetchImage(contato.profilePicUrl);
    //         doc.addImage(img, "JPEG", pageWidth - 50, margin + 10, 40, 40);
    //       }

    //       yPosition += 10;
    //       doc.line(margin, yPosition, pageWidth - margin, yPosition); // Linha separadora
    //       yPosition += 10;
    //     }

    //     // Listar mensagens
    //     let currentPage = 1;

    //     mensagens.forEach((mensagem) => {
    //       if (yPosition > pageHeight - margin - 30) {
    //         addFooter(); // Adiciona rodapé na página anterior
    //         doc.addPage();
    //         currentPage += 1;
    //         yPosition = margin + 10; // Reinicia a posição vertical
    //       }

    //       // Estilo diferenciado para remetente
    //       const remetente = mensagem.fromMe ? "Eu" : mensagem.contact.name || "Contato";
    //       const remetenteColor = mensagem.fromMe ? [0, 102, 204] : [0, 0, 0]; // Azul para mensagens do usuário
    //       doc.setTextColor(...remetenteColor);
    //       doc.setFont("helvetica", "bold");
    //       doc.text(`Mensagem de: ${remetente}`, margin, yPosition);
    //       yPosition += 8;

    //       // Data e Hora
    //       doc.setFont("helvetica", "normal");
    //       doc.setFontSize(10);
    //       const dataHora = new Date(mensagem.createdAt).toLocaleString("pt-BR", {
    //         dateStyle: "long",
    //         timeStyle: "short",
    //       });
    //       doc.text(`Data/Hora: ${dataHora}`, margin, yPosition);
    //       yPosition += 8;

    //       // UserID
    //       if (mensagem.userId) {
    //         doc.text(`UserID: ${mensagem.userId}`, margin, yPosition);
    //         yPosition += 8;
    //       }

    //       // Corpo da mensagem
    //       const body = mensagem.mediaType === "templates" ? this.formatTemplate(mensagem.body) : mensagem.body;
    //       const lines = doc.splitTextToSize(body, pageWidth - 2 * margin);
    //       doc.text(lines, margin, yPosition);
    //       yPosition += lines.length * 8;

    //       // Linha separadora
    //       doc.setDrawColor(200, 200, 200);
    //       doc.line(margin, yPosition, pageWidth - margin, yPosition);
    //       yPosition += 10;
    //     });

    //     // Adicionar rodapé na última página
    //     addFooter();

    //     // Salvar PDF
    //     doc.save(`atendimento_${this.ticketFocado.id}_mensagens.pdf`);
    //   } catch (error) {
    //     console.error("Erro ao baixar as mensagens:", error);
    //   }
    // },
    async fetchImage(url) {
      const response = await fetch(url);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    },
    formatTemplate(template) {
      try {
        const parsedTemplate = JSON.parse(template);
        return parsedTemplate
          .map((item) => `${item.type}: ${item.text || item.format}`)
          .join("\n");
      } catch {
        return template;
      }
    },
    // async downloadPDF() {
    //   const doc = new jsPDF();

    //   try {
    //     const response = await LocalizarMensagens({ ticketId: this.ticketFocado.id });
    //     const mensagens = response.data.messages;
    //     console.log('mensagens >>>>>>>>>>>>>', mensagens)
    //     let yPosition = 10;

    //     mensagens.forEach((mensagem, index) => {
    //       if (yPosition > 280) {
    //         doc.addPage();
    //         yPosition = 10;
    //       }
          
    //       const remetente = mensagem.fromMe ? 'Eu' : mensagem.contact.name || 'Contato';
    //       doc.setFontSize(12);
    //       doc.text(`Mensagem de: ${remetente}`, 10, yPosition);
    //       yPosition += 10;
          
    //       const lines = doc.splitTextToSize(mensagem.body, 180);
    //       doc.text(lines, 10, yPosition);
    //       yPosition += lines.length * 10;
    //       yPosition += 10;
    //     });

    //     doc.save( 'atendimento_' + this.ticketFocado.id + '_mensagens.pdf');
    //   } catch (error) {
    //     console.error('Erro ao baixar as mensagens:', error);
    //   }
    // },
    async atualizarNaoLido (ticketFocado) {
      try{
        await AtualizarTicketNaoLido(ticketFocado.id, 1)
      } catch(e){
        
      }
    },
    async atualizarLido (ticketFocado) {
      try{
        await AtualizarTicketNaoLido(ticketFocado.id, 0)
      } catch(e){
        
      }
    },
    async listarMensagens() {
      try {
        const privateMessageData = await listCountUnreadPrivateMessage(this.usuario.userId);
        const groupMessageData = await listCountUnreadGroupMessage(this.usuario.userId);
        this.notificacaoInternaNaoLida = privateMessageData.data.count + groupMessageData.data.count.count
      } catch(e){

      }
    },
    async emailTenant(){
      const { data } = await ListarTenantsPorLicenca()
      const tenant = data.find(tenant => tenant.tenantId === this.usuario.tenantId);
      // const hasntLicense = tenant && (!tenant.tenantEmail);
      // if (hasntLicense && this.usuario.profile !== 'superadmin') {
      //   // this.$q.notify({
      //   //   type: 'warning',
      //   //   message: 'Solicite ao Super Administrador a validação do email.',
      //   //   progress: true,
      //   //   actions: [{ icon: 'close', round: true, color: 'white' }],
      //   // });
      // }
      const tenantWithoutLicense = data.find(tenant => !tenant.tenantLicense || tenant.tenantLicense !== 'enabled');
      if (tenantWithoutLicense  && this.usuario.profile === 'superadmin') {
        console.log(`Tenant com licença inválida: ${tenantWithoutLicense.tenantId}`);
        // this.$q.notify({
        //   type: 'negative',
        //   message: 'Solicite ao Super Administrador a validação do email ' + tenantWithoutLicense.tenantId + '.',
        //   progress: true,
        //   actions: [{ icon: 'close', round: true, color: 'white' }],
        // });
      }
    },
    async aceitarTermos(){
      const { data } = await ListarTermos(); 
      // Verifica se o usuário atual precisa aceitar os termos
      const hasFalseAcceptTerms = data && !data.acceptTerms;
      if (hasFalseAcceptTerms && this.usuario.profile !== 'superadmin') {
        this.$q.notify({
          type: 'negative',
          message: this.$t('generalSupportScript.termsAcceptanceNotification'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        });
        this.showModal = true;
      }

      // Verifica se há termos não aceitos para superadmin
      if (!data.acceptTerms && this.usuario.profile === 'superadmin') {
        console.log(`${this.$t('generalSupportScript.tenantWithFalseAcceptTermsNotification')}: ${this.usuario.tenantId}`);
        this.$q.notify({
          type: 'negative',
          message: `${this.$t('generalSupportScript.tenantWithFalseAcceptTermsNotification')} ${this.usuario.tenantId}`,
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        });
        this.showModal = true;
      }
    },
    async handleAcceptance() {
      try {
        await AceitarTermos({
          id: this.usuario.tenantId,
          acceptTerms: true,
        })
        this.$q.notify({
          type: 'positive',
          message: `${this.$t('generalSupportScript.acceptTermsSuccess')} ${process.env.URL_API}`,
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        })
        window.location.reload();
      } catch (error) {
        console.error(this.$t('generalSupportScript.errorAcceptingTerms'), error);
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } 
    },
    fecharModalNota() {
      this.exibirModalNotaLogs = false;
      // setTimeout(() => {
      //   this.exibirModalNotaLogs = true;
      // }, 2000);
    },
    editarNota (nota) {
      this.notaEdicao = { ...nota }
      this.modalNota = true
      this.fecharModalNota();
    },
    deletarNota (nota) {
      this.$q.dialog({
        title: this.$t('generalSupportScript.attentionTitle'),
        message: this.$t('generalSupportScript.deleteNoteConfirmation', { nota: nota.notes }),
        cancel: {
          label: this.$t('common.no'),
          color: 'primary',
          push: true
        },
        ok: {
          label: this.$t('common.yes'),
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(() => {
        this.loading = true
        DeletarNota(nota)
          .then(res => {
            // let newNotas = [...this.notas]
            // newNotas = newNotas.filter(f => f.id !== nota.id)

            // this.notas = [...newNotas]
            this.$q.notify({
              type: 'positive',
              progress: true,
              position: 'top',
              message: this.$t('generalSupportScript.deleteNoteSuccess', { nota: nota.notes }),
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
            this.fecharModalNota();
          })
        this.loading = false
      })
    },
    abrirModalNota() {
      this.notaEdicao = { ticketId: this.ticketFocado.id };
      this.modalNota = true;
    },
    abrirModalSMS(number) {
      this.modalSMS = true;
      this.smsEnvio = number;
    },
    async autoCloseTickets(tempo, mensagem) {
      if (this.autoFechamentoAtivo !== 'enabled') {
        return;
      }
      else if (this.autoFechamentoAtivo === 'enabled'){
        const currentTimeInSeconds = Math.floor(new Date().getTime() / 1000);
        await Promise.all(this.tickets.map(async (ticket) => {
          const lastMessageTimeInSeconds = Math.floor(ticket.lastMessageAt / 1000);
          if (currentTimeInSeconds - lastMessageTimeInSeconds > tempo && ticket.status === 'open') {
            await EnviarMensagemTexto(ticket.id, message)
            await AtualizarStatusTicket(ticket.id, 'closed', ticket.userId);
            const message = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: mensagem,
              scheduleDate: null,
              quotedMsg: null,
              idFront: uid(),
            }
            this.$q.notify({
              type: 'warning',
              message: this.$t('generalSupportScript.autoCloseWarning', { ticket: ticket, tempo: tempo }),
              position: 'top',
            })
          }
        }));
      }
    },
    calcularMedia() {
      const avaliacoesValidas = this.logsAvaliacao.filter(log => {
      return !isNaN(log.evaluation) && log.evaluation >= 0 && log.evaluation <= 5;
      })
      if (avaliacoesValidas?.length > 0) {
        const somaAvaliacoes = avaliacoesValidas.reduce((total, log) => total + Number(log.evaluation), 0);
        this.evaluationMedia = (somaAvaliacoes / avaliacoesValidas?.length).toFixed(2);
      } else {
        this.evaluationMedia = '0.00'
      }
    },
    getPhoneNumberLink(number) {
      if ((number.startsWith("55")) && (number.charAt(4) > 5)) {
        return `tel:${number.slice(0, 4)}9${number.slice(-8)}`;
      } else {
        return `tel:${number}`;
      }
    },
    getPhoneNumberSMS(number) {
      if ((number.startsWith("55")) && (number.charAt(4) > 5)) {
        return `${number.slice(0, 4)}9${number.slice(-8)}`;
      } else {
        return `${number}`;
      }
    },
    async loadMoreOpenTickets() {
      this.$q.notify({
        type: 'positive',
        message: this.$t('generalSupportScript.ticketsLoaded'),
        position: 'top',
        progress: true,
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
      try {
        this.loading = true
        this.pesquisaTickets.pageNumber++
        await this.consultarTickets()
        this.loading = false
      } catch (error) {
        this.loading = false
      }
    },
    showNotification() {
      this.$q.notify({
        type: 'warning',
        message: this.$t('generalSupportScript.ticketsLoadedTabs'),
        position: 'top',
      })
      this.loadMoreOpenTickets()
    },
    toggleDrawer() { 
      this.drawerContact = !this.drawerContact;
    },
    async syncOldMessagesByUserWhatsapp (ticketFocado) {
      let value = 1;
      this.$q.dialog({
        title: this.$t('generalSupportScript.syncOldMessagesWarning'),
        message: this.$t('generalSupportScript.syncOldMessagesHint'),
        prompt: {
          model: value,
          type: 'number',
          label: this.$t('generalSupportScript.limitMessagesLabel'),
          hint: this.$t('generalSupportScript.syncOldMessagesHint'),
          inputProps: {
            min: 0,
            step: 1,
          },
        },
        ok: {
          label: this.$t('common.yes'),
          color: 'primary',
          push: true
        },
        cancel: {
          label: this.$t('common.no'),
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk((value) => {
        const data = {
          whatsappId: ticketFocado.whatsappId,
          limit: value,
          tenantId: ticketFocado.tenantId,
          contactId: ticketFocado.isGroup
            ? ticketFocado.contact.number + "@g.us"
            : ticketFocado.contact.number + "@c.us"
        };
        if (value !== null && value > 0) {
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: this.$t('generalSupportScript.syncOldMessagesSuccess', { value: value, ticketFocado: ticketFocado }),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.loading = true
          SyncOldMessagesByUserWbot(data).then(r => {
            // this.$store.commit('SYNC_WHATSAPP', ticketFocado.whatsappId)
          }).finally(f => {
            this.loading = false
          })
        } else {
          this.$q.notify({
            type: 'warning',
            progress: true,
            position: 'top',
            message: this.$t('generalSupportScript.invalidValue'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
      })
    },
    async sendProtocol (ticketFocado) {
      this.$q.dialog({
        title: this.$t('generalSupportScript.sendProtocolConfirmation'),
        // message: 'Esse protocolo será armazenado no banco dados .',
        ok: {
          label: this.$t('common.yes'),
          color: 'primary',
          push: true
        },
        cancel: {
          label: this.$t('common.no'),
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(async () => {
        const ticketId = ticketFocado.id
        const protocol = Date.now()?.toString();
        const message = {
          read: 1,
          fromMe: true,
          mediaUrl: '',
          body: `Protocolo de atendimento: ${protocol}`,
          scheduleDate: null,
          quotedMsg: null,
          sendType: 'protocol',
          idFront: uid(),
        }
        const messageWaba = {
          read: 1,
          fromMe: true,
          mediaUrl: '',
          body: `Protocolo de atendimento: ${protocol}`,
          scheduleDate: null,
          quotedMsg: null,     
          from: ticketFocado.contact.number,
          tokenApi: ticketFocado.whatsapp.tokenAPI,
          ticketId: ticketFocado.id,
          idFront: uid(),
        }
        const messageInstagram = {
          read: 1,
          fromMe: true,
          mediaUrl: '',
          body: `Protocolo de atendimento: ${protocol}`,
          scheduleDate: null,
          quotedMsg: null,     
          from: ticketFocado.contact.number,
          tokenApi: ticketFocado.whatsapp.tokenAPI,
          ticketId: ticketFocado.id,
          idFront: uid(),
        }
        const data = {
          protocol: protocol,
          ticketId: ticketFocado.id,
          userId: ticketFocado.user.id,
          tenantId: ticketFocado.tenantId,
        };
        if (data) {
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: this.$t('generalSupportScript.protocolSent', { protocol: protocol, ticketFocado: ticketFocado }),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.loading = true
          if(ticketFocado.channel === 'whatsapp' || ticketFocado.channel === 'baileys'){
            await EnviarMensagemTexto(ticketId, message)
          }
          else if(ticketFocado.channel === 'waba'){
            await EnviarTextoWaba(messageWaba)
          }
          else if(ticketFocado.channel === 'instagram'){
            await EnviarTextoInstagram(messageInstagram)
          } 
          else if(ticketFocado.channel === 'messenger'){
            await EnviarTextoMessenger(messageMessenger)
          }
          else if(ticketFocado.channel.includes('hub')){
            await EnviarMensagemHub(ticketId, message)
          }
          else if(ticketFocado.channel.includes('meow')){
            await EnviarMensagemMeow(ticketId, message)
          }
          else if(ticketFocado.channel.includes('evo')){
            await EnviarMensagemEvo(ticketId, message)
          } else if(ticketFocado.channel === 'uazapi'){
            await EnviarMensagemUazapi(ticketId, message)
          } else if(ticketFocado.channel === 'zapi'){
            await EnviarMensagemZapi(ticketId, message)
          } else if(ticketFocado.channel.includes('webchat')){
            await EnviarMensagemWebChat(ticketId, message)
          }
          await CriarProtocolo(data).then(r => {
          }).finally(f => {
            this.loading = false
          })
        } else {
          this.$q.notify({
            type: 'warning',
            progress: true,
            position: 'top',
            message: this.$t('generalSupportScript.protocolError'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
      })
    },
    async listarAvaliacao () {
      const { data } = await MostrarAvaliacao()
      this.rating = data[0].rating
    },
    // buildRatingMessage() {
    //   return `Avalie este atendimento:\n${this.rating.map(r => `${r.rating} - ${r.label}`).join('\n')}`;
    // },
    buildRatingMessage() {
      return `${this.$t('generalSupportScript.ratingMessageTitle')}\n${this.rating.map(r => `${r.rating} - ${r.label}`).join('\n')}`;
    },
    async sendEvaluation (ticketFocado) {
      this.$q.dialog({
        title: 'Deseja enviar uma avaliação para esse atendimento? ',
        // message: 'Esse protocolo será armazenado no banco dados .',
        ok: {
          label: this.$t('common.yes'),
          color: 'primary',
          push: true
        },
        cancel: {
          label: this.$t('common.no'),
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(async () => {
        const ticketId = ticketFocado.id
        const evaluation = 'Avaliação enviada';
        const message = {
          read: 1,
          fromMe: true,
          mediaUrl: '',
          // body: `Avalie este atendimento:\n0- Ruim\n1- Regular\n2- Bom\n3-Muito Bom\n4- Excelente\n5- Incrível`,
          body: this.buildRatingMessage(),
          scheduleDate: null,
          sendType: 'evaluation',
          quotedMsg: null,
          idFront: uid(),
        }
        const messageWaba = {
          read: 1,
          fromMe: true,
          mediaUrl: '',
          // body: `Avalie este atendimento:\n0- Ruim\n1- Regular\n2- Bom\n3-Muito Bom\n4- Excelente\n5- Incrível`,
          body: this.buildRatingMessage(),
          scheduleDate: null,
          quotedMsg: null,     
          from: ticketFocado.contact.number,
          tokenApi: ticketFocado.whatsapp.tokenAPI,
          ticketId: ticketFocado.id,
          idFront: uid(),
        }
        const messageInstagram = {
          read: 1,
          fromMe: true,
          mediaUrl: '',
          // body: `Avalie este atendimento:\n0- Ruim\n1- Regular\n2- Bom\n3-Muito Bom\n4- Excelente\n5- Incrível`,
          body: this.buildRatingMessage(),
          scheduleDate: null,
          quotedMsg: null,     
          from: ticketFocado.contact.number,
          tokenApi: ticketFocado.whatsapp.tokenAPI,
          ticketId: ticketFocado.id,
          idFront: uid(),
        }
        const data = {
          evaluation: evaluation,
          attempts: 0,
          ticketId: ticketFocado.id,
          userId: ticketFocado.user.id,
          tenantId: ticketFocado.tenantId,
        };
        if (data) {
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: 'Avalição enviada para o atendimento ' + ticketFocado.id,
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.loading = true
          // if(ticketFocado.channel !== 'waba'){
          //   await EnviarMensagemTexto(ticketId, message)
          // }
          // if(ticketFocado.channel === 'waba'){
          //   await EnviarTextoWaba(messageWaba)
          // }
          if(ticketFocado.channel === 'whatsapp' || ticketFocado.channel === 'baileys'){
            await EnviarMensagemTexto(ticketId, message)
          }
          else if(ticketFocado.channel === 'waba'){
            await EnviarTextoWaba(messageWaba)
          }
          else if(ticketFocado.channel === 'instagram'){
            await EnviarTextoInstagram(messageInstagram)
          }
          else if(ticketFocado.channel === 'messenger'){
            await EnviarTextoMessenger(messageMessenger)
          }
          else if(ticketFocado.channel.includes('hub')){
            await EnviarMensagemHub(ticketId, message)
          }
          else if(ticketFocado.channel.includes('meow')){
            await EnviarMensagemMeow(ticketId, message)
          }
          else if(ticketFocado.channel.includes('evo')){
            await EnviarMensagemEvo(ticketId, message)
          } else if(ticketFocado.channel === 'zapi'){
            await EnviarMensagemZapi(ticketId, message)
          } else if(ticketFocado.channel === 'uazapi'){
            await EnviarMensagemUazapi(ticketId, message)
          } else if(ticketFocado.channel.includes('webchat')){
            await EnviarMensagemWebChat(ticketId, message)
          }
          // if(ticketFocado.channel !== 'waba' && !ticketFocado.channel.includes('hub')){
          //   await EnviarMensagemTexto(ticketId, message)
          // }
          // if(ticketFocado.channel === 'waba' && !ticketFocado.channel.includes('hub')){
          //   await EnviarTextoWaba(messageWaba)
          // }
          // if(ticketFocado.channel.includes('hub')){
          //   await EnviarMensagemHub(ticketId, message)
          // }
          await CriarAvaliacao(data).then(r => {
            // this.$store.commit('SYNC_WHATSAPP', ticketFocado.whatsappId)
          }).finally(f => {
            this.loading = false
          })
        } else {
          this.$q.notify({
            type: 'warning',
            progress: true,
            position: 'top',
            message: 'Não foi possível enviar a avaliação do atendimento.',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
      })
    },
    async atualizarDify (key) {
      const value = this.$data[key];
      try {
      await AtualizarDifyTicket(this.ticketFocado.id, value);
      this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
      })
      // await AtualizarDifyTicket(this.ticketFocado.id, value);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = !value
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async atualizarGrok (key) {
      const value = this.$data[key];
      try {
      await AtualizarGrokTicket(this.ticketFocado.id, value);
      this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
      })
      // await AtualizarGrokTicket(this.ticketFocado.id, value);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = !value
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async atualizarGemini (key) {
      const value = this.$data[key];
      try {
      await AtualizarGeminiTicket(this.ticketFocado.id, value);
      this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
      })
      // await AtualizarGeminiTicket(this.ticketFocado.id, value);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = !value
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async atualizarQwen (key) {
      const value = this.$data[key];
      try {
      await AtualizarQwenTicket(this.ticketFocado.id, value);
      this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
      })
      // await AtualizarQwenTicket(this.ticketFocado.id, value);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = !value
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async atualizarClaude (key) {
      const value = this.$data[key];
      try {
      await AtualizarClaudeTicket(this.ticketFocado.id, value);
      this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
      })
      // await AtualizarClaudeTicket(this.ticketFocado.id, value);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = !value
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async atualizarDeepseek (key) {
      const value = this.$data[key];
      try {
      await AtualizarDeepseekTicket(this.ticketFocado.id, value);
      this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
      })
      // await AtualizarDeepseekTicket(this.ticketFocado.id, value);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = !value
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async atualizarLm (key) {
      const value = this.$data[key];
      try {
      await AtualizarLmTicket(this.ticketFocado.id, value);
      this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
      })
      // await AtualizarLmTicket(this.ticketFocado.id, value);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = !value
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async atualizarOllama (key) {
      const value = this.$data[key];
      try {
      await AtualizarOllamaTicket(this.ticketFocado.id, value);
      this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
      })
      // await AtualizarOllamaTicket(this.ticketFocado.id, value);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = !value
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async atualizarN8N (key) {
      const value = this.$data[key];
      try {
      await AtualizarN8NTicket(this.ticketFocado.id, value);
      this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
      })
      // await AtualizarN8NTicket(this.ticketFocado.id, value);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = !value
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async atualizarTypebot (key) {
      const value = this.$data[key];
      try {
      await AtualizarTypebotTicket(this.ticketFocado.id, value);
      this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
      })
      // await AtualizarTypebotTicket(this.ticketFocado.id, value);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = !value
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async atualizarDialogflow (key) {
      const value = this.$data[key];
      try {
      await AtualizarDialogflowTicket(this.ticketFocado.id, value);
      this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
      })
      // await AtualizarDialogflowTicket(this.ticketFocado.id, value);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = !value
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async atualizarChatgpt (key) {
      const value = this.$data[key];
      try {
      await AtualizarChatgptTicket(this.ticketFocado.id, value);
      this.$q.notify({
          type: 'positive',
          message: this.$t('common.notifications.success'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
      })
      // await AtualizarChatgptTicket(this.ticketFocado.id, value);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$data[key] = !value
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async obterContato(key) {
      if (key === undefined) return
      try {
        const { data } = await ObterContato(key)
        return data.kanban
      } catch(err){
        console.log('Erro ao obter contato: ' + err)
      }
    },
    startPausedIndicator(state = 'paused', oldVal) {
      // Respect tenant setting: only send when allowPause is enabled
      if (this.allowPause !== 'enabled') return
      if (oldVal && oldVal.id &&
      (oldVal.whatsapp.type === 'whatsapp' || 
      oldVal.whatsapp.type === 'baileys' || 
      oldVal.whatsapp.type === 'evo' || 
      oldVal.whatsapp.type === 'meow')
      ) {
        SendPausedIndicator(oldVal.id, {state, ticket: oldVal})
          .then(() => {
           // console.log('Paused indicator enviado:', state, oldVal.id);
          })
          .catch(error => {
            console.error('Erro ao enviar paused indicator 1:', error);
          });
      }
    },
    async carregarIntegracaoStatus() {
      if (this.ticketFocado && (this.ticketFocado.typebotStatus !== undefined || this.ticketFocado.dialogflowStatus !== undefined || this.ticketFocado.chatgptStatus !== undefined || this.ticketFocado.n8nStatus !== undefined || this.ticketFocado.difyStatus !== undefined || this.ticketFocado.lmStatus !== undefined || this.ticketFocado.grokStatus !== undefined || this.ticketFocado.geminiStatus !== undefined || this.ticketFocado.deepseekStatus !== undefined || this.ticketFocado.qwenStatus !== undefined || this.ticketFocado.claudeStatus !== undefined || this.ticketFocado.ollamaStatus !== undefined)) {
        const timerId = setTimeout(async () => {
          try{
            const kanbanStatus = await this.obterContato(this.ticketFocado.contactId)
            const kanbanName = await this.listarKanbans()
            const kanbanSelecionado = kanbanName.find(kanban => kanban.id === kanbanStatus);
            this.kanbanSelecionado = kanbanSelecionado ? kanbanSelecionado.name : null;
            this.kanbanStatus = kanbanStatus
            const motivoName = await this.listarMotivos()
            const motivoSelecionado = motivoName.find(motivo => motivo.id === Number(this.ticketFocado.reasons));
            this.motivoSelecionado = motivoSelecionado ? motivoSelecionado.name : null; 
            this.valorNegociado = this.ticketFocado.value
            this.bloquearStatus = this.ticketFocado.contact.blocked
            this.bloquearStatusChatbot = this.ticketFocado.contact?.chatbotBlocked
          } catch(e){
            // console.log('Carregar integração Kanban.')
          }
          this.typebotStatus = this.ticketFocado.typebotStatus
          this.dialogflowStatus = this.ticketFocado.dialogflowStatus
          this.chatgptStatus = this.ticketFocado.chatgptStatus
          this.n8nStatus = this.ticketFocado.n8nStatus
          this.difyStatus = this.ticketFocado.difyStatus
          this.lmStatus = this.ticketFocado.lmStatus
          this.grokStatus = this.ticketFocado.grokStatus
          this.geminiStatus = this.ticketFocado.geminiStatus
          this.qwenStatus = this.ticketFocado.qwenStatus
          this.claudeStatus = this.ticketFocado.claudeStatus
          this.deepseekStatus = this.ticketFocado.deepseekStatus
          this.ollamaStatus = this.ticketFocado.ollamaStatus
        }, 300);
        this.addTimer(timerId);
      }
    },
    handlerNotifications(data) {
      const profilePicUrl = data.ticket.contact.profilePicUrl;
      const validIcon = (profilePicUrl && profilePicUrl !== 'null' && profilePicUrl !== 'undefined') ? profilePicUrl : undefined;
      const options = {
        body: `${data.body} - ${format(new Date(), 'HH:mm')}`,
        icon: validIcon,
        tag: data.ticket.id,
        renotify: true,
      }

      const notification = new Notification(this.$t('generalSupportScript.notificationMessageFrom', { data: data }), options)
      // const notification = new Notification(`Mensagem de ${data.ticket.contact.name}`, options)

      const timerId = setTimeout(() => {
        notification.close()
      }, 10000)
      this.addTimer(timerId);

      notification.onclick = (e) => {
        e.preventDefault()
        window.focus()
        this.$store.dispatch('AbrirChatMensagens', data.ticket)
        this.$router.push({ name: 'atendimento' })
        // history.push(`/tickets/${ticket.id}`);
      }

      this.$nextTick(() => {
        // utilizar refs do layout
        try{
          if (JSON.parse(localStorage.getItem('recording'))) {
            // console.log('recording', JSON.parse(localStorage.getItem('recording')))
            return
          }
          this.$refs.audioNotificationPlay.play()
        } catch(e){
        }
      })
      // document.addEventListener('click', this.playAudioOnce)
      // const audioNotification = this.$refs.audioNotificationPlay
      // if (audioNotification) {
      //   audioNotification.play()
      // }    
    },
    // playAudioOnce() {
    //   const audioNotification = this.$refs.audioNotificationPlay
    //   if (audioNotification) {
    //     audioNotification.play()
    //     document.removeEventListener('click', this.playAudioOnce)
    //   }
    // },
    async listarConfiguracoes() {
      const { data } = await ListarConfiguracoes()
      localStorage.setItem('configuracoes', JSON.stringify(data))
      const conf = data.find(c => c.key === 'NotViewAssignedTickets');
      this.isNotViewAssignedTickets = conf?.value;
      const difyConfig = data.find(config => config.key === 'dify')
      this.difyAtivo = difyConfig?.value
      const lmConfig = data.find(config => config.key === 'lm')
      this.lmAtivo = lmConfig?.value
      const grokConfig = data.find(config => config.key === 'grok')
      this.grokAtivo = grokConfig?.value
      const geminiConfig = data.find(config => config.key === 'gemini')
      this.geminiAtivo = geminiConfig?.value
      const deepseekConfig = data.find(config => config.key === 'deepseek')
      this.deepseekAtivo = deepseekConfig?.value
      const qwenConfig = data.find(config => config.key === 'qwen')
      this.qwenAtivo = qwenConfig?.value
      const claudeConfig = data.find(config => config.key === 'claude')
      this.claudeAtivo = claudeConfig?.value
      const ollamaConfig = data.find(config => config.key === 'ollama')
      this.ollamaAtivo = ollamaConfig?.value
      const n8nConfig = data.find(config => config.key === 'n8n')
      this.n8nAtivo = n8nConfig?.value
      const typebotConfig = data.find(config => config.key === 'typebot')
      this.typebotAtivo = typebotConfig?.value
      const dialogflowConfig = data.find(config => config.key === 'dialogflow')
      this.dialogflowAtivo = dialogflowConfig?.value
      const chatgptConfig = data.find(config => config.key === 'chatgpt')
      this.chatgptAtivo = chatgptConfig?.value
      localStorage.setItem('chatgptAtivo', chatgptConfig?.value)
      const local = localStorage.getItem('chatgptAtivo') || 'disabled'
      const ignoreGroupMsg = data.find(config => config.key === 'ignoreGroupMsg')
      this.grupoAtivo = ignoreGroupMsg?.value
      const universalCounter = data.find(config => config.key === 'universalCounter')
      this.contadorUniversal = universalCounter?.value
      const autoCloseTime = data.find(config => config.key === 'autoCloseTime')
      this.tempoFechamento = autoCloseTime?.value
      const autoClose = data.find(config => config.key === 'autoClose')
      this.autoFechamentoAtivo = autoClose?.value
      const autoCloseMessage = data.find(config => config.key === 'autoCloseMessage')
      this.mensagemDeEncerramento = autoCloseMessage?.value
      // await this.autoCloseTickets(this.tempoFechamento, this.mensagemDeEncerramento)
      const notificationSilenced = data.find(config => config.key === 'notificationSilenced')
      this.notificacaoAtivo = notificationSilenced?.value
    },
    onScroll(info) {
      // if (this.loading || !this.hasMore) {
      //   return;
      // }
      if (this.loading) {
        return;
      }
      if (info.verticalPercentage <= 0.85) return
      this.onLoadMore()
    },
    editContact(contactId) {
      this.selectedContactId = contactId
      this.modalContato = true
    },
    outcomingCall(ticketFocado) {
      // Filtra todos os whatsapps conectados com wavoipToken válido
      const whatsappsDisponiveis = this.whatsapps.filter(w => w.wavoipToken && w.status === 'CONNECTED');
      if (whatsappsDisponiveis.length <= 1) {
        // Só existe um, usa direto
        const token = whatsappsDisponiveis[0]?.wavoipToken || ticketFocado.whatsapp.wavoipToken;
        this.$store.dispatch('webphone/outcomingCall', {
          phone: ticketFocado.contact.number,
          contact_name: ticketFocado.contact.name,
          chat_id: ticketFocado.id,
          token: token,
          profile_picture: ticketFocado.contact.profilePicUrl || '',
          instances: [token]
        });
      } else {
        // Mais de um, abre o modal de seleção
        this.wavoipOptions = whatsappsDisponiveis.map(w => ({
          label: w.name + (w.id ? ` (#${w.id})` : ''),
          value: w.wavoipToken,
          icon: w.type ? `img:${w.type}-logo.png` : 'mdi-whatsapp',
          id: w.id
        }));
        this.selectedWavoipToken = null;
        this.ticketParaChamada = ticketFocado; // Salva o ticket para usar depois
        this.showSelectWavoipDialog = true;
      }
    },
    outcomingCallNovo(ticketFocado) {
      // Filtra todos os whatsapps conectados com wavoipToken válido
      const whatsappsDisponiveis = this.whatsapps.filter(w => w.wavoipToken && w.status === 'CONNECTED');
      if (whatsappsDisponiveis.length <= 1) {
        // Só existe um, usa direto
        const token = whatsappsDisponiveis[0]?.wavoipToken || ticketFocado.whatsapp.wavoipToken;
        this.$store.dispatch('webphone_novo/outcomingCall', {
          phone: ticketFocado.contact.number,
          contact_name: ticketFocado.contact.name,
          chat_id: ticketFocado.id,
          token: token,
          profile_picture: ticketFocado.contact.profilePicUrl || '',
          instances: [token]
        });
      } else {
        // Mais de um, abre o modal de seleção
        this.wavoipOptionsNovo = whatsappsDisponiveis.map(w => ({
          label: w.name + (w.id ? ` (#${w.id})` : ''),
          value: w.wavoipToken,
          icon: w.type ? `img:${w.type}-logo.png` : 'mdi-whatsapp',
          id: w.id
        }));
        this.selectedWavoipTokenNovo = null;
        this.ticketParaChamadaNovo = ticketFocado; // Salva o ticket para usar depois
        this.showSelectWavoipDialogNovo = true;
      }
    },
    confirmarSelecaoWavoip() {
      if (!this.selectedWavoipToken || !this.ticketParaChamada) return;
      this.$store.dispatch('webphone/outcomingCall', {
        phone: this.ticketParaChamada.contact.number,
        contact_name: this.ticketParaChamada.contact.name,
        chat_id: this.ticketParaChamada.id,
        token: this.selectedWavoipToken,
        profile_picture: this.ticketParaChamada.contact.profilePicUrl || '',
        instances: [this.selectedWavoipToken]
      });
      this.showSelectWavoipDialog = false;
      this.ticketParaChamada = null;
      this.selectedWavoipToken = null;
    },
    confirmarSelecaoWavoipNovo() {
      if (!this.selectedWavoipTokenNovo || !this.ticketParaChamadaNovo) return;
      this.$store.dispatch('webphone_novo/outcomingCall', {
        phone: this.ticketParaChamadaNovo.contact.number,
        contact_name: this.ticketParaChamadaNovo.contact.name,
        chat_id: this.ticketParaChamadaNovo.id,
        token: this.selectedWavoipTokenNovo,
        profile_picture: this.ticketParaChamadaNovo.contact.profilePicUrl || '',
        instances: [this.selectedWavoipTokenNovo]
      });
      this.showSelectWavoipDialogNovo = false;
      this.ticketParaChamadaNovo = null;
      this.selectedWavoipTokenNovo = null;
    },
    cancelarSelecaoWavoipNovo() {
      this.showSelectWavoipDialogNovo = false;
      this.ticketParaChamadaNovo = null;
      this.selectedWavoipTokenNovo = null;
    },
    cancelarSelecaoWavoip() {
      this.showSelectWavoipDialog = false;
      this.ticketParaChamada = null;
      this.selectedWavoipToken = null;
    },
    contatoEditado(contato) {
      this.$store.commit('UPDATE_TICKET_FOCADO_CONTACT', contato)
    },
    async consultarTickets (paramsInit = {}) {
      const params = {
        ...this.pesquisaTickets,
        ...paramsInit
      }
      try {
        // Usar método otimizado do mixin socketInitial (com debounce e cache)
        // forceRefresh é passado via paramsInit para garantir dados corretos quando necessário
        const response = await this.consultarTicketsOtimizado(params, {
          debounceDelay: 500, // Debounce menor para ações do usuário (500ms)
          cacheTTL: 1000, // Cache menor para garantir dados mais atualizados (1s)
          forceRefresh: paramsInit.forceRefresh || false // Forçar refresh quando necessário
        })
        const data = response?.data || response
        // console.log('data', data)
        this.countTickets = data.count
        this.$store.commit('LOAD_TICKETS', data?.tickets)
        this.$store.commit('SET_HAS_MORE', data.hasMore)
      } catch (err) {
        // Silenciar erros de timeout - não mostrar no console
        if (err?.code !== 'ECONNABORTED' && !err?.message?.includes('timeout')) {
          this.$notificarErro('Algum problema', err)
          console.error(err)
        }
      }
      // return () => clearTimeout(delayDebounceFn)
    },
    async BuscarTicketFiltro() {
      this.$store.commit('RESET_TICKETS')
      this.loading = true
      localStorage.setItem('filtrosAtendimento', JSON.stringify(this.pesquisaTickets))
      if (this.selectedWhatsapp) {
        // this.pesquisaTickets.whatsappId = this.selectedWhatsapp.id;
        localStorage.setItem('whatsappIdFiltro', this.selectedWhatsapp.id);
      }
      if (this.selectedUser) {
        // this.pesquisaTickets.whatsappId = this.selectedWhatsapp.id;
        localStorage.setItem('userFiltro', this.selectedUser.id);
      }
      if (this.selectedTag) {
        // this.pesquisaTickets.whatsappId = this.selectedWhatsapp.id;
        localStorage.setItem('tagFiltro', this.selectedTag.id);
      }
      if (this.selectedKanban) {
        // this.pesquisaTickets.whatsappId = this.selectedWhatsapp.id;
        localStorage.setItem('kanbanFiltro', this.selectedKanban.id);
      }
      this.pesquisaTickets = {
        ...this.pesquisaTickets,
        pageNumber: 1,
      }
      // Limpar cache quando filtros mudam para garantir dados corretos
      limparCacheTickets()
      await this.consultarTickets(this.pesquisaTickets)
      this.loading = false
      this.$setConfigsUsuario({ isDark: this.$q.dark.isActive })
    },
    wait(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
    },
    async onLoadMore() {
      if (!this.hasMore) {
        return
      }
      this.$q.notify({
        color: 'positive',
        position: 'top',
        progress: true,
        message: this.$t('generalSupportScript.loadMoreTicketsMessage'),
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      });
      try {
        this.loading = true
        this.pesquisaTickets.pageNumber++
        await this.consultarTickets()
        await this.wait(3000);
        this.loading = false
      } catch (error) {
        this.loading = false
      }
    },
    async listarFilas() {
      try {
        const { data } = await ListarFilas()
        this.filas = data
        localStorage.setItem('filasCadastradas', JSON.stringify(data || []))
      } catch (error) {
        // Silenciar erros de timeout - não mostrar no console
        if (error?.code !== 'ECONNABORTED' && !error?.message?.includes('timeout')) {
          console.error('Erro ao listar filas:', error)
        }
      }
    },
    async listarWhatsapps() {
      try {
        const { data } = await ListarWhatsapps()
        this.$store.commit('LOAD_WHATSAPPS', data)
      } catch (error) {
        // Silenciar erros de timeout - não mostrar no console
        if (error?.code !== 'ECONNABORTED' && !error?.message?.includes('timeout')) {
          console.error('Erro ao listar whatsapps:', error)
        }
      }
    },
    async listarEtiquetas() {
      try {
        const { data } = await ListarEtiquetas(true)
        // Ordenar etiquetas por ordem alfabética baseada no campo 'tag'
        this.etiquetas = data.sort((a, b) => {
          const tagA = a.tag ? a.tag.toLowerCase() : ''
          const tagB = b.tag ? b.tag.toLowerCase() : ''
          return tagA.localeCompare(tagB)
        })
      } catch (error) {
        // Silenciar erros de timeout - não mostrar no console
        if (error?.code !== 'ECONNABORTED' && !error?.message?.includes('timeout')) {
          console.error('Erro ao listar etiquetas:', error)
        }
      }
    },
    async listTenantPorId(){
      try {
        const { data } = await ListarTenantPorId(this.usuario.tenantId)
        this.tenantDados = data[0]
        localStorage.setItem('mostrarGruposParaTodos', JSON.stringify(data[0]?.showGroupsForAll))
        localStorage.setItem('mostrarFechadoParaTodos', JSON.stringify(data[0]?.showClosedForAll))
        localStorage.setItem('nullticket', JSON.stringify(data[0]?.nullTickets))
        localStorage.setItem('supervisorAdmin', JSON.stringify(data[0]?.supervisorAdmin))
        localStorage.setItem('ticketsRain', JSON.stringify(data[0]?.ticketsRain))
        localStorage.setItem('audioModule', data[0]?.audioModule);
        localStorage.setItem('controlFeatures', JSON.stringify(data[0]?.controlFeatures));
        localStorage.setItem('forceReason', JSON.stringify(data[0]?.forceReason) || 'disabled');
        localStorage.setItem('menuVisibility', JSON.stringify(data[0]?.menuVisibility?.[0] || {}));
        this.ticketsRain = data[0]?.ticketsRain
        this.supervisorAdmin = data[0]?.supervisorAdmin
        this.chatBotLane = data[0]?.showChatBot
        this.vapiToken = data[0]?.vapiToken
        this.allowPause = data[0]?.allowPause
        this.vapi = data[0]?.vapiToken
        localStorage.setItem('allowPause', JSON.stringify(data[0]?.allowPause) || 'disabled');
        this.listarPelaUltimaMensagem = data[0]?.listByLastMessage
        this.fixarConexao = data[0]?.fixConnections
        if(data[0]?.smsToken !=='' || data[0]?.livsonSmsToken !=='' || data[0]?.conectaSmsToken !==''){
          this.smsAtivo = true
        }
        if(data[0]?.status !== 'active'){
          try {
            this.$q.notify({
              color: 'warning',
              position: 'top',
              message: this.$t('generalSupportScript.companyInactive'),
            });
            const timerId = setTimeout(() => {
              window.location.reload();
            }, 1000)
            this.addTimer(timerId);
          } catch (error) {
            this.$notificarErro(this.$t('generalSupportScript.logoutError'), error)
          }
        } else {
          if (data[0]?.asaas === 'enabled'){
            try{
              const { data } = await ListarTenantPorAsaas(this.usuario.tenantId)
              if (data?.data?.some(item => item.status === 'OVERDUE')) {
                this.$q.notify({
                  color: 'warning',
                  position: 'top',
                  message: this.$t('generalSupportScript.contactAdmin'),
                });
                const timerId2 = setTimeout(() => {
                  window.location.reload();
                }, 1000)
                this.addTimer(timerId2);
              }
            } catch(e){
              console.log('Não foi possível listar as opções de pagamento')
            }
          }
        }
      } catch (error) {
        // Silenciar erros de timeout - não mostrar no console
        if (error?.code !== 'ECONNABORTED' && !error?.message?.includes('timeout')) {
          console.error('Erro ao buscar dados do tenant:', error)
        }
      }
    },
    ativarNotificacoesAutomaticamente() {
      if ('Notification' in window && Notification.permission === 'default') {
        this.addEventListener(document, 'click', this.solicitarPermissaoNotificacao, { once: true });
        this.addEventListener(document, 'keydown', this.solicitarPermissaoNotificacao, { once: true });
      }
    },
    solicitarPermissaoNotificacao(event) {
      Notification.requestPermission().then(() => {
        console.log('Permissão de notificação solicitada');
        this.removerListenersNotificacao();
      }).catch((error) => {
        console.error('Erro ao solicitar permissão de notificação:', error);
      });
    },
    removerListenersNotificacao() {
      console.log('Removendo listeners de notificações...');
      // Os listeners serão removidos automaticamente pelo sistema de limpeza
      // document.removeEventListener('click', this.solicitarPermissaoNotificacao);
      // document.removeEventListener('keydown', this.solicitarPermissaoNotificacao);
    },
    async abrirModalUsuario() {
      // if (!usuario.id) {
      //   await this.dadosUsuario()
      // }
      // const { data } = await DadosUsuario(userId)
      // this.usuario = data
      this.modalUsuario = true
    },
    // Métodos de seleção em massa
    ativarModoSelecaoMassa() {
      this.modoSelecaoMassa = true;
      this.ticketsSelecionados.clear();
    },
    cancelarSelecaoMassa() {
      this.modoSelecaoMassa = false;
      this.ticketsSelecionados.clear();
    },
    toggleSelecaoTicket(ticketId, selecionado) {
      if (selecionado) {
        this.ticketsSelecionados.add(ticketId);
      } else {
        this.ticketsSelecionados.delete(ticketId);
      }
      // Se não houver mais tickets selecionados, desativar modo seleção
      if (this.ticketsSelecionados.size === 0) {
        this.modoSelecaoMassa = false;
      }
    },
    obterTicketsSelecionados() {
      const todosTickets = [
        ...this.openTicketsReversed,
        ...this.pendingTicketsReversed,
        ...this.pendingTicketsChatbotReversed,
        ...this.closedTicketsReversed,
        ...this.openTicketsGroupsReversed,
        ...this.pendingTicketsGroupsReversed,
        ...this.closedTicketsGroupsReversed
      ];
      return todosTickets.filter(ticket => this.ticketsSelecionados.has(ticket.id));
    },
    async abrirTicketsMassa() {
      const tickets = this.obterTicketsSelecionados();
      if (tickets.length === 0) return;
      
      this.loading = true;
      const userId = +localStorage.getItem('userId');
      let sucesso = 0;
      let erros = 0;
      
      for (const ticket of tickets) {
        if (ticket.status === 'pending') {
          try {
            await AtualizarStatusTicket(ticket.id, 'open', userId);
            sucesso++;
          } catch (error) {
            console.error(`Erro ao abrir ticket ${ticket.id}:`, error);
            erros++;
          }
        }
      }
      
      this.loading = false;
      this.$q.notify({
        type: sucesso > 0 ? 'positive' : 'negative',
        message: `${sucesso} ticket(s) aberto(s)${erros > 0 ? `. ${erros} erro(s).` : ''}`,
        progress: true
      });
      
      this.cancelarSelecaoMassa();
    },
    async retornarFilaTicketsMassa() {
      const tickets = this.obterTicketsSelecionados();
      if (tickets.length === 0) return;
      
      this.loading = true;
      const userId = +localStorage.getItem('userId');
      let sucesso = 0;
      let erros = 0;
      
      for (const ticket of tickets) {
        if (ticket.status === 'open') {
          try {
            await AtualizarStatusTicket(ticket.id, 'pending', null);
            sucesso++;
          } catch (error) {
            console.error(`Erro ao retornar ticket ${ticket.id}:`, error);
            erros++;
          }
        }
      }
      
      this.loading = false;
      this.$q.notify({
        type: sucesso > 0 ? 'positive' : 'negative',
        message: `${sucesso} ticket(s) retornado(s) para a fila${erros > 0 ? `. ${erros} erro(s).` : ''}`,
        progress: true
      });
      
      this.cancelarSelecaoMassa();
    },
    async fecharTicketsMassa() {
      const tickets = this.obterTicketsSelecionados();
      if (tickets.length === 0) return;
      
      this.$q.dialog({
        title: this.$t('atendimentoMixinAtualizar.titles.encerrarAtendimento'),
        message: `${this.$t('atendimentoMixinAtualizar.dialogs.ticketEncerrar', { ticketId: tickets.length })} ${tickets.length} ticket(s)?`,
        cancel: {
          label: this.$t('common.no'),
          color: 'negative',
          push: true,
        },
        ok: {
          label: this.$t('common.yes'),
          color: 'primary',
          push: true,
        },
        persistent: true,
      }).onOk(async () => {
        this.loading = true;
        const userId = +localStorage.getItem('userId');
        let sucesso = 0;
        let erros = 0;
        
        for (const ticket of tickets) {
          try {
            await AtualizarStatusTicketForcado(ticket.id, 'closed', userId);
            sucesso++;
          } catch (error) {
            console.error(`Erro ao fechar ticket ${ticket.id}:`, error);
            erros++;
          }
        }
        
        this.loading = false;
        this.$q.notify({
          type: sucesso > 0 ? 'positive' : 'negative',
          message: `${sucesso} ticket(s) fechado(s)${erros > 0 ? `. ${erros} erro(s).` : ''}`,
          progress: true
        });
        
        this.cancelarSelecaoMassa();
      });
    },
    async resolverTicketsMassa() {
      const tickets = this.obterTicketsSelecionados();
      if (tickets.length === 0) return;
      
      this.loading = true;
      const userId = +localStorage.getItem('userId');
      let sucesso = 0;
      let erros = 0;
      
      for (const ticket of tickets) {
        if (ticket.status !== 'closed') {
          try {
            await AtualizarStatusTicket(ticket.id, 'closed', userId);
            sucesso++;
          } catch (error) {
            console.error(`Erro ao resolver ticket ${ticket.id}:`, error);
            erros++;
          }
        }
      }
      
      this.loading = false;
      this.$q.notify({
        type: sucesso > 0 ? 'positive' : 'negative',
        message: `${sucesso} ticket(s) resolvido(s)${erros > 0 ? `. ${erros} erro(s).` : ''}`,
        progress: true
      });
      
      this.cancelarSelecaoMassa();
    },
    abrirModalTransferirMassa() {
      this.modalTransferirTicketMassa = true;
      if (this.filas.length === 0) {
        this.listarFilas();
      }
      if (this.usuarios.length === 0) {
        this.listarUsuarios();
      }
    },
    filterUsersMassa(element, index, array) {
      const fila = this.filaSelecionadaMassa
      if (fila == null) return true
      const queues_valid = element.queues.filter(function (element, index, array) {
        return (element.id == fila)
      })
      return (queues_valid.length > 0)
    },
    async confirmarTransferenciaMassa() {
      if (!this.filaSelecionadaMassa) {
        this.$q.notify({
          type: 'warning',
          message: this.$t('atendimentoInfoCabecalho.selectDestinationQueue'),
          progress: true
        });
        return;
      }
      
      const tickets = this.obterTicketsSelecionados();
      if (tickets.length === 0) return;
      
      this.loading = true;
      let sucesso = 0;
      let erros = 0;
      
      for (const ticket of tickets) {
        try {
          await AtualizarTicket(ticket.id, {
            userId: this.usuarioSelecionadoMassa,
            queueId: this.filaSelecionadaMassa,
            status: this.usuarioSelecionadoMassa == null ? 'pending' : 'open',
            isTransference: 1
          });
          sucesso++;
        } catch (error) {
          console.error(`Erro ao transferir ticket ${ticket.id}:`, error);
          erros++;
        }
      }
      
      this.loading = false;
      this.$q.notify({
        type: sucesso > 0 ? 'positive' : 'negative',
        message: `${sucesso} ticket(s) transferido(s)${erros > 0 ? `. ${erros} erro(s).` : ''}`,
        progress: true
      });
      
      this.modalTransferirTicketMassa = false;
      this.filaSelecionadaMassa = null;
      this.usuarioSelecionadoMassa = null;
      this.cancelarSelecaoMassa();
    },
    async efetuarLogout() {
      console.log('logout - index atendimento')
      try {
        await RealizarLogout(usuario)
        localStorage.removeItem('dashboardChartPanels');
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('profile')
        localStorage.removeItem('userId')
        localStorage.removeItem('queues')
        localStorage.removeItem('usuario')
        localStorage.removeItem('filtrosAtendimento')
        localStorage.removeItem('whatsappIdFiltro')
        localStorage.removeItem('userFiltro')
        localStorage.removeItem('tagFiltro')
        localStorage.removeItem('kanbanFiltro')
        localStorage.removeItem('nullticket')
        localStorage.removeItem('supervisorAdmin')
        localStorage.removeItem('ticketsRain')
        localStorage.clear();
        sessionStorage.clear();
        this.$router.go({ name: 'login', replace: true })
      } catch (error) {
        this.$notificarErro(this.$t('generalSupportScript.logoutError'), error)
      }
    },
    copyContent(content) {
      navigator.clipboard
        .writeText(content)
        .then(() => {
          // Copiado com sucesso
          console.log('Conteúdo copiado: ', content)
        })
        .catch((error) => {
          // Ocorreu um erro ao copiar
          console.error('Erro ao copiar o conteúdo: ', error)
        })
    },
    // editarMensagem(mensagem) {
    //   const dialog = this.$q
    //     .dialog({
    //       component: () => import('./Chat/DIalogEdicaoMensagem.vue'),
    //       parent: this,
    //       mensagensRapidas: this.mensagensRapidas,
    //       replyingMessage: null,
    //       mensagem,
    //     })
    //     .onOk((updated) => {
    //       this.$store.commit('UPDATE_MESSAGE', {
    //         id: mensagem.id,
    //         ticketId: this.ticketFocado.id,
    //         ...updated,
    //       })

    //       dialog.hide()
    //     })
    // },
    deletarMensagem(mensagem) {
      this.$q
        .dialog({
          title: this.$t('generalSupportScript.deleteMessageConfirmation'),
          message: this.$t('generalSupportScript.deleteMessageWarning'),
          cancel: {
            label: this.$t('common.no'),
            color: 'primary',
            push: true,
          },
          ok: {
            label: this.$t('common.yes'),
            color: 'negative',
            push: true,
          },
          persistent: true,
        })
        .onOk(() => {
          this.loading = true
          DeletarMensagem(mensagem)
            .then((res) => {
              this.loading = false
              mensagem.isDeleted = true
            })
            .catch((error) => {
              this.loading = false
              console.error(error)
              this.$notificarErro(this.$t('generalSupportScript.deleteError'), error);
            })
        })
        .onCancel(() => {})
    },
    async tagSelecionada(tags) {
      this.$q.notify({
        type: 'positive',
        progress: true,
        position: 'bottom',
        message: this.$t('generalSupport.updatingTags'),
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
      this.debouncedTagUpdate(tags)
    },
    async carteiraDefinida(wallets) {
      const { data } = await EditarCarteiraContato(this.ticketFocado.contact.id, [...wallets])
      this.contatoEditado(data)
    },
    async listarUsuarios() {
      try {
        const { data } = await ListarUsuarios()
        this.usuarios = data?.users?.filter(user => user.profile !== 'superadmin');
      } catch (error) {
        console.error(error)
        this.$notificarErro(this.$t('generalSupportScript.loadUsersError'), error);
      }
    },
    async atualizarUsuario() {
      try {
        const { data } = await DadosUsuario(this.usuario.userId)
        this.usuarioDados = data;
        this.filasUser = data.queues
        const usuarioAtual = JSON.parse(localStorage.getItem('usuario'))
        const usuarioAtualizado = {
          ...usuarioAtual,
          sipEnabled: data?.sipEnabled,
          sipUsername: data?.sipUsername,
          sipPassword: data?.sipPassword,
          sipServer: data?.sipServer,
          sipPort: data?.sipPort,
          sipTransport: data?.sipTransport
        }
        localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado))
        this.usuario = usuarioAtualizado
      } catch (error) {
        console.error(error)
        this.$notificarErro(this.$t('generalSupportScript.loadUserError'), error);
      }
    },
    setValueMenu() {
      this.drawerTickets = !this.drawerTickets
    },
    setValueMenuContact() {
      this.drawerContact = !this.drawerContact
    },
    async abrirModalLogs() {
      const { data } = await ConsultarLogsTicket({ ticketId: this.ticketFocado.id })
      this.logsTicket = data
      this.exibirModalLogs = true
    },
    async abrirModalProtocoloLogs() {
      const { data } = await ConsultarLogsProtocolo({ ticketId: this.ticketFocado.id })
      this.logsProtocolo = data
      this.exibirModalProtocoloLogs = true
    },
    async abrirModalAvaliacaoLogs() {
      const { data } = await ConsultarLogsAvaliacao({ ticketId: this.ticketFocado.id })
      this.logsAvaliacao = data
      this.exibirModalAvaliacaoLogs = true
    },
    async abrirModalNotaLogs() {
      const { data } = await ConsultarLogsNota({ ticketId: this.ticketFocado.id })
      this.logsNota = data
      this.exibirModalNotaLogs = true
    },
    async limparKanban(){
      this.kanbanSelecionado = null
      this.kanbanStatus = null
      const contato = {
        number: this.ticketFocado.contact.number,
        kanban: this.kanbanSelecionado
      };
      try {
        const { data } = await EditarContato(this.ticketFocado.contactId, contato);
        // console.log(data);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('generalSupportScript.loadError'), error)
      }
    },
    async selecionarKanbanParaContato() {
      const contato = {
        number: this.ticketFocado.contact.number,
        kanban: this.kanbanSelecionado
      };
      try {
        const { data } = await EditarContato(this.ticketFocado.contactId, contato);
        // console.log(data);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('generalSupportScript.loadError'), error)
      }
    },
    // async atualizarIsGroup() {
    //   this.isGroupLoading = true;
    //   console.log('this.isGroupSelecionado', this.isGroupSelecionado);
    //   console.log('this.ticketFocado.contact.number', this.ticketFocado.contact.number);
    //   try {
    //     const contato = {
    //       number: this.ticketFocado.contact.number,
    //       isGroup: this.isGroupSelecionado,
    //     };
    //     const { data } = await EditarContato(this.ticketFocado.contactId, contato);
    //     console.log('data', data);
    //     // console.log(data);
    //   } catch (error) {
    //     console.error('error - AlterarConfiguracao', error);
    //     this.$notificarErro(this.$t('generalSupportScript.loadError'), error);
    //   }
    //   this.isGroupLoading = false;
    // },
    async migrarContato() {
      this.sanitizeLoading = true
      try {
        const contactId = this.ticketFocado.contact.id;
        const { data } = await SanitizarContato(contactId);
        // const { data } = await MigrarContato(contactId);

        this.notify = this.$q.notify({
          position: 'top',
          type: 'positive',
          message: this.$t('generalSupportScript.contactSanitizeSuccess'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000)
      } catch (error) {
        this.notify = this.$q.notify({
          position: 'top',
          type: 'warning',
          message: this.$t('generalSupportScript.contactSanitizeError'),
          progress: true,
          actions: [{ icon: 'close', round: true, color: 'white' }],
        });
        console.error('Erro - MigrarContato:', error);
      }
      this.sanitizeLoading = false
    },
    async bloquearContato() {
      const contato = {
        number: this.ticketFocado.contact.number,
        blocked: this.bloquearStatus
      };
      try {
        const { data } = await EditarContato(this.ticketFocado.contactId, contato);
        // console.log(data);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('generalSupportScript.loadError'), error)
      }
    },
    async bloquearChatbot() {
      const contato = {
        number: this.ticketFocado.contact.number,
        chatbotBlocked: this.bloquearStatusChatbot
      };
      try {
        const { data } = await EditarContato(this.ticketFocado.contactId, contato);
        // console.log(data);
      } catch (error) {
        console.error('error - AlterarConfiguracao', error)
        this.$notificarErro(this.$t('generalSupportScript.loadError'), error)
      }
    },
    async listarKanbans () {
      try{
        const { data } = await ListarKanbans()
        // Ordenar kanbans por ordem alfabética baseada no campo 'name'
        const kanbansOrdenados = (data.kanban || []).sort((a, b) => {
          const nameA = a?.name ? a.name.toLowerCase() : ''
          const nameB = b?.name ? b.name.toLowerCase() : ''
          return nameA.localeCompare(nameB)
        })
        this.kanbans = kanbansOrdenados
        return kanbansOrdenados
      } catch(e){
        // console.log('Listar Kanban')
      }
    },
    async listarMotivos () {
      try {
        const { data } = await ListarMotivos();
        // Ordenar motivos por ordem alfabética baseada no campo 'name'
        const motivosOrdenados = (data.reasons || []).sort((a, b) => {
          const nameA = a?.name ? a.name.toLowerCase() : ''
          const nameB = b?.name ? b.name.toLowerCase() : ''
          return nameA.localeCompare(nameB)
        })
        this.motivos = motivosOrdenados
        return motivosOrdenados
      } catch (error) {
        console.error('Erro ao listar motivos:', error);
      }
    },
    async handlePrivateMessageNotification(notification) {
      this.updateNotificationCount()
      await this.listarMensagens()
      const isRecording = this.$store.state.whatsapp.recording
      if (!isRecording && this.notificacaoAtivo === 'enabled') {
        const audioElement = this.$refs.audioNotificationPlay2
        if (audioElement) {
          try {
            await audioElement.play()
          } catch (error) {
            console.error('Erro ao reproduzir áudio:', error)
          }
        } else {
          console.log('Elemento de áudio não encontrado no DOM')
        }
      } else {
        console.log('Notificação de áudio não reproduzida. Razões:')
        console.log('- Gravação ativa:', isRecording)
        console.log('- Notificação desativada:', this.notificacaoAtivo !== 'enabled')
      }
    },
    abrirOpportunityForm() {
      if (this.ticketFocado?.contact?.id) {
        this.showOpportunityForm = true;
      }
    },
    async carregarOportunidadesContato() {
      if (!this.ticketFocado?.contact?.id) return

      try {

        const response = await ListarOpportunitiesByContact(this.ticketFocado.contact.id, {
          page: this.paginacaoOportunidades.page,
          limit: this.paginacaoOportunidades.limit,
          status: this.filtrosOportunidades.status,
          valorMin: this.filtrosOportunidades.valorMin,
          valorMax: this.filtrosOportunidades.valorMax
        });

        this.oportunidadesContato = response.data.data.map(oportunidade => ({
          ...oportunidade,
          statusOriginal: oportunidade.status
        }))
        this.paginacaoOportunidades.total = response.data.pagination.total
      } catch (error) {
        console.error('Erro ao carregar oportunidades:', error)
        this.$q.notify({
          type: 'negative',
          message: this.$t('funil.loadError')
        })
      }
    },
    aplicarFiltrosOportunidades() {
      this.paginacaoOportunidades.page = 1
      this.carregarOportunidadesContato()
    },
    formatarDataUTC(data) {
      if (!data) return '';
      const d = new Date(data);
      const dia = String(d.getUTCDate()).padStart(2, '0');
      const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
      const ano = d.getUTCFullYear();
      return `${dia}/${mes}/${ano}`;
    },
    getStatusLabel(status) {
      if (status === 'open') return this.$t('funil.aberto');
      if (status === 'win') return this.$t('funil.ganho');
      if (status === 'lose') return this.$t('funil.perdido');
      return status;
    },
    async abrirModalOportunidades() {
      try {
        this.exibirModalOportunidades = true;
        await this.carregarOportunidadesContato();
      } catch (err) {
        this.$q.notify({
          type: 'negative',
          message: this.$t('generalSupport.errorLoadingOpportunities')
        });
      }
    },
    makeAsteriskCall(ticketFocado) {
      if (!ticketFocado.contact.number) {
        this.$q.notify({
          color: 'negative',
          message: 'Número de telefone não disponível',
          icon: 'error'
        });
        return;
      }
      // Define o número antes de abrir o modal
      this.numeroParaLigar = ticketFocado.contact.number;
      // Abre o modal do AsteriskWebphone
      this.$store.dispatch('asterisk/toggleWebphoneVisibility', true);
    },
    debouncedTagUpdate(tags) {
      this.isUpdatingTags = true
      EditarEtiquetasContato(this.ticketFocado.contact.id, [...tags])
        .then(response => {
          this.contatoEditado(response)
        })
        .catch(error => {
          console.error(error)
          this.$notificarErro(this.$t('generalSupport.errorUpdatingTags'), error)
        })
        .finally(() => {
          this.isUpdatingTags = false
        })
    },
    async openConvites() {
      try {
        this.loadingConvites = true;
        this.modalConvites = true;
        
        // Buscar convites do usuário atual
        const response = await ListarTicketsCompartilhadosPorUsuario();
        this.convitesUsuario = response.data;
      } catch (error) {
        console.error('Erro ao carregar convites:', error);
        this.$q.notify({
          type: 'negative',
          message: this.$t('ticketCompartilhado.erroAoCarregarConvites'),
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        });
      } finally {
        this.loadingConvites = false;
      }
    },
    copiarLinkConvite(url) {
      if (url) {
        navigator.clipboard.writeText(url).then(() => {
          this.$q.notify({
            type: 'positive',
            message: this.$t('ticketCompartilhado.linkCopiadoParaAreaDeTransferencia'),
            progress: true,
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          });
        }).catch(err => {
          console.error('Erro ao copiar link:', err);
          this.$q.notify({
            type: 'negative',
            message: this.$t('ticketCompartilhado.naoFoiPossivelCopiarLink'),
            progress: true,
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          });
        });
      }
    },
    async abrirConvite(ticket) {
      if (ticket) {
        if (this.$q.screen.lt.md && ticket.status !== 'pending') {
          eventBus.emit('infor-cabecalo-chat:acao-menu')
        }
        if (!(ticket.status !== 'pending' && (ticket.id !== this.$store.getters.ticketFocado.id || this.$route.name !== 'chat'))) {
          return;
        }
        this.$store.commit('SET_HAS_MORE', true)
        this.$store.dispatch('AbrirChatMensagens', ticket)
        this.modalConvites = false;
      }
    },
    deletarConvite(convite) {
      this.$q.dialog({
        title: this.$t('ticketCompartilhado.confirmarExclusao'),
        message: this.$t('ticketCompartilhado.temCertezaQueDesejaDeletarOConviteDoTicket', {
          ticketId: convite.ticketId
        }),
        cancel: {
          label: this.$t('common.cancel'),
          color: 'primary',
          push: true
        },
        ok: {
          label: this.$t('common.delete'),
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk(async () => {
        try {
          await DeletarTicketCompartilhado(convite.id);
          // Recarregar a lista de convites
          const response = await ListarTicketsCompartilhadosPorUsuario();
          this.convitesUsuario = response.data;
          this.$q.notify({
            type: 'positive',
            message: this.$t('ticketCompartilhado.conviteDeletadoComSucesso')
          });
        } catch (error) {
          console.error('Erro ao deletar convite:', error);
          this.$q.notify({
            type: 'negative',
            message: this.$t('ticketCompartilhado.erroAoDeletarConvite')
          });
        }
      });
    },
    // Métodos para gerenciamento de memória (parcialmente migrados)
    addTimer(timerId) {
      this.timers.push(timerId);
    },
    
    addEventListener(element, event, handler, options = {}) {
      element.addEventListener(event, handler, options);
      this.eventListeners.push({ element, event, handler, options });
    },
    
    addSocketListener(event, handler) {
      // Assumindo que o socket está disponível via mixin
      if (this.$socket) {
        this.$socket.on(event, handler);
        this.socketListeners.push({ event, handler });
      }
    },
    
    clearAllTimers() {
      this.timers.forEach(timerId => {
        clearTimeout(timerId);
        clearInterval(timerId);
      });
      this.timers = [];
    },
    
    removeAllEventListeners() {
      this.eventListeners.forEach(({ element, event, handler, options }) => {
        element.removeEventListener(event, handler, options);
      });
      this.eventListeners = [];
    },
    
    removeAllSocketListeners() {
      this.socketListeners.forEach(({ event, handler }) => {
        if (this.$socket) {
          this.$socket.off(event, handler);
        }
      });
      this.socketListeners = [];
    },
    
    // Método para limpeza completa de memória
    cleanupMemory() {
      this.clearAllTimers();
      this.removeAllEventListeners();
      this.rootListeners.forEach(({ event, handler }) => {
        eventBus.off(event, handler);
      });
      this.rootListeners = []; // Limpar o array após remover os listeners
      this.removeAllSocketListeners();
    },
  },
  created() {
    this.debouncedTagUpdate = debounce(async (tags) => {
      if (this.ticketFocado?.id) {
        try {
          this.isUpdatingTags = true
          await EditarEtiquetasContato(this.ticketFocado.contact.id, [...tags])
        } catch (error) {
          console.error(error)
          this.$notificarErro(this.$t('generalSupport.errorUpdatingTags'), error)
        } finally {
          this.isUpdatingTags = false
        }
      }
    }, 500)
  },
  beforeMount() {
    this.$store.commit('RESET_TICKETS')
    // this.$store.commit('UPDATE_TICKET')
    this.listarFilas()
    this.listarEtiquetas()
    this.listarKanbans()
    this.listarConfiguracoes()
    const filtros = JSON.parse(localStorage.getItem('filtrosAtendimento'))
    if(profile === 'admin'){
      const pesquisaTicketsAdmin = {
        searchParam: '',
        pageNumber: 1,
        status: ['open', 'pending'],
        showAll: false,
        // showAll: false,
        count: null,
        queuesIds: [],
        whatsappIds: [],
        selectedUser:[],
        withUnreadMessages: false,
        isNotAssignedUser: false,
        includeNotQueueDefined: true,
      }
      localStorage.setItem('filtrosAtendimento', JSON.stringify(pesquisaTicketsAdmin))
    }
    if (!filtros?.pageNumber != 1 && profile !== 'admin') {
      localStorage.setItem('filtrosAtendimento', JSON.stringify(this.pesquisaTickets))
    }
    // if (!filtros?.pageNumber) {
    //   localStorage.setItem('filtrosAtendimento', JSON.stringify(this.pesquisaTickets))
    // }
  },
  async mounted() {
    const storedColors = localStorage.getItem('storedColors');
    if (storedColors) {
      let list = []
      try { const parsed = JSON.parse(storedColors); list = Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.colors) ? parsed.colors : []) } catch (_) { list = [] }
      const colors = list.reduce((acc, colorObj = {}) => {
        const key = String(colorObj.label || colorObj.name || colorObj.key || '').toLowerCase().trim();
        const val = colorObj.value ?? (key && key in colorObj ? colorObj[key] : undefined) ?? colorObj.hex ?? colorObj.color ?? null;
        if (key && typeof val === 'string') acc[key] = val
        return acc
      }, {})

      const root = document.documentElement;
      Object.keys(colors).forEach(key => {
        root.style.setProperty(`--q-${key}`, colors[key]);
      });
    } else {
      console.warn('Nenhuma cor armazenada no localStorage');
    }
    this.loadingMount = true;

    this.notify = this.$q.notify({
      position: 'top',
      type: 'positive',
      message:  this.$t('generalSupportScript.loadMessage'),
      progress: true,
      actions: [{ icon: 'close', round: true, color: 'white' }],
    });

    // if (!localStorage.getItem('reloaded')) {
    //   localStorage.setItem('reloaded', 'true');
    //   window.location.reload();
    // } else {
    //   localStorage.removeItem('reloaded');
    //   window.onbeforeunload = (event) => {
    //     if (this.isCallActive) {
    //       event.preventDefault();
    //       event.stopImmediatePropagation();
    //       event.returnValue = true;
    //     }
    //   };
    // }

    this.__offMenu = eventBus.on('infor-cabecalo-chat:acao-menu', this.setValueMenu)
    this.__offInfo = eventBus.on('update-ticket:info-contato', this.setValueMenuContact)
    this.socketTicketList();
    this.pesquisaTickets = JSON.parse(localStorage.getItem('filtrosAtendimento')) || this.pesquisaTickets;
    // this.addRootListener('handlerNotifications', this.handlerNotifications); // Linha original com erro
    eventBus.on('handlerNotifications', this.handlerNotifications)
    this.rootListeners.push({ event: 'handlerNotifications', handler: this.handlerNotifications })

    this.bloquearWavoip = wavoipBlock
    localStorage.removeItem('whatsappIdFiltro');
    localStorage.removeItem('userFiltro')
    localStorage.removeItem('tagFiltro')
    localStorage.removeItem('kanbanFiltro')

    try {
      await this.listTenantPorId();
    } catch (error) {
      // Silenciar erros de timeout
      if (error?.code !== 'ECONNABORTED' && !error?.message?.includes('timeout')) {
        console.error('Erro ao listar tenant:', error)
      }
    }
    try {
      await this.listarWhatsapps();
    } catch (error) {
      // Silenciar erros de timeout
      if (error?.code !== 'ECONNABORTED' && !error?.message?.includes('timeout')) {
        console.error('Erro ao listar whatsapps:', error)
      }
    }
    try {
      await this.consultarTickets();
    } catch (error) {
      // Silenciar erros de timeout
      if (error?.code !== 'ECONNABORTED' && !error?.message?.includes('timeout')) {
        console.error('Erro ao consultar tickets:', error)
      }
    }
    try {
      await this.listarUsuarios();
    } catch (error) {
      // Silenciar erros de timeout
      if (error?.code !== 'ECONNABORTED' && !error?.message?.includes('timeout')) {
        console.error('Erro ao listar usuários:', error)
      }
    }
    try {
      await this.atualizarUsuario();
    } catch (error) {
      // Silenciar erros de timeout
      if (error?.code !== 'ECONNABORTED' && !error?.message?.includes('timeout')) {
        console.error('Erro ao atualizar usuário:', error)
      }
    }
    try {
      const { data } = await ListarMensagensRapidas();
      // this.mensagensRapidas = data;
      this.mensagensRapidas = this.filtrarMensagensRapidasDoUsuario(data);
    } catch (error) {
      // Silenciar erros de timeout - não mostrar no console
      if (error?.code !== 'ECONNABORTED' && !error?.message?.includes('timeout')) {
        console.error('Erro ao listar mensagens rápidas:', error)
      }
    }
    
    // Carregar convites do usuário
    try {
      const response = await ListarTicketsCompartilhadosPorUsuario();
      this.convitesUsuario = response.data;
    } catch (error) {
      console.error('Erro ao carregar convites:', error);
    }
    
    if ('Notification' in window) {
      this.ativarNotificacoesAutomaticamente();
    }
    this.userProfile = localStorage.getItem('profile');

    try{
      if (this.$route?.params?.ticketId) {
        const ticketId = this.$route.params.ticketId;
        if (ticketId && this.tickets?.length > 0) {
          const ticket = this.tickets.find((t) => t.id === +ticketId);
          if (ticket) {
            if (this.$q.screen.lt.md && ticket.status !== 'pending') {
              eventBus.emit('infor-cabecalo-chat:acao-menu');
            }
            this.$store.commit('SET_HAS_MORE', true);
            this.$store.dispatch('AbrirChatMensagens', ticket);
          }
        }
      } else {
        if (this.$route.name !== 'chat-empty') {
          this.$router.push({ name: 'chat-empty' });
        }
        // this.$router.push({ name: 'chat-empty' });
      }
      this.$store.commit('UPDATE_SHOW_MENU', this.showMenu);
      this.addEventListener(window, 'beforeunload', this.handleBeforeUnload);
    } catch (error) {
      console.error('Erro ao montar o componente:', error);
    } finally {
      this.isMounted = true;
      this.loadingMount = false;
      if (this.notify) {
        this.notify();
      }
    }

    try {
      await this.aceitarTermos();
    } catch (error) {
      // Silenciar erros de timeout
      if (error?.code !== 'ECONNABORTED' && !error?.message?.includes('timeout')) {
        console.error('Erro ao aceitar termos:', error)
      }
    }
    try {
      await this.listarAvaliacao()
    } catch (error) {
      // Silenciar erros de timeout
      if (error?.code !== 'ECONNABORTED' && !error?.message?.includes('timeout')) {
        console.error('Erro ao listar avaliação:', error)
      }
    }
    try {
      await this.listarMensagens();
    } catch (error) {
      // Silenciar erros de timeout
      if (error?.code !== 'ECONNABORTED' && !error?.message?.includes('timeout')) {
        console.error('Erro ao listar mensagens:', error)
      }
    }
    try {
      await this.listarAssistentes();
    } catch (error) {
      // Silenciar erros de timeout
      if (error?.code !== 'ECONNABORTED' && !error?.message?.includes('timeout')) {
        console.error('Erro ao listar assistentes:', error)
      }
    }
    try {
      await this.listarNumerosDeTelefone();
    } catch (error) {
      // Silenciar erros de timeout
      if (error?.code !== 'ECONNABORTED' && !error?.message?.includes('timeout')) {
        console.error('Erro ao listar números de telefone:', error)
      }
    }

    // try{
    //   await this.aceitarTermos();
    //   await this.listarAvaliacao()
    //   await this.listarMensagens();
    // } catch(e){
    //   console.log(e)
    // }

    // const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions'))
    // console.log('MenuPermissions_Cache', menuPermissions)
  },
  beforeRouteLeave(to, from, next) {
    if(this.isCallActive){
      this.$q.dialog({
        title: this.$t('generalSupportScript.confirmExitTitle'),
        message: this.$t('generalSupportScript.confirmExitMessage'),
        cancel: {
          label: this.$t('common.no'),
          color: 'primary',
          push: true
        },
        ok: {
          label: this.$t('common.yes'),
          color: 'negative',
          push: true
        },
        persistent: true
      })
      .onOk(() => {
        next();
      })
      .onCancel(() => {
        next(false);
      });
      // const answer = window.confirm('Tem certeza que deseja sair da página? Suas alterações serão perdidas.');
      // if (answer) {
      //   next();
      // } else {
      //   next(false);
      // }
    } else {
      if (!this.isMounted) {
        next(false);
      } else {
        next();
      }
    }
  },
  beforeUnmount() {
    // Limpeza completa de memória usando o novo sistema
    this.cleanupMemory();
    // Limpeza específica do window
    window.onbeforeunload = null;
  },
  unmounted() {
    this.$store.commit('RESET_TICKETS')
    try { this.__offMenu && this.__offMenu(); this.__offMenu = null } catch (e) {}
    try { this.__offInfo && this.__offInfo(); this.__offInfo = null } catch (e) {}
    this.$store.commit('TICKET_FOCADO', {})
  },
}
</script>

<style lang="sass">
// Barra de ações em massa moderna
.bulk-actions-bar
  position: sticky
  top: 0
  z-index: 2000
  background: $primary
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15)
  border-bottom: 1px solid rgba(255, 255, 255, 0.1)
  
  // Efeito de profundidade usando overlay
  &::before
    content: ''
    position: absolute
    top: 0
    left: 0
    right: 0
    bottom: 0
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.15) 100%)
    pointer-events: none

.bulk-actions-content
  position: relative
  z-index: 1
  display: flex
  align-items: center
  justify-content: space-between
  padding: 12px 16px
  min-height: 56px

.bulk-actions-info
  display: flex
  align-items: center
  color: white
  font-size: 15px

.bulk-actions-buttons
  display: flex
  align-items: center
  gap: 8px

// Animações
.slide-down-enter-active
  transition: all 0.3s ease-out

.slide-down-leave-active
  transition: all 0.25s ease-in

.slide-down-enter-from
  transform: translateY(-100%)
  opacity: 0

.slide-down-leave-to
  transform: translateY(-100%)
  opacity: 0

// Responsividade
@media (max-width: 600px)
  .bulk-actions-content
    flex-direction: column
    gap: 12px
    padding: 12px

  .bulk-actions-buttons
    width: 100%
    justify-content: space-between

  .bulk-actions-info
    width: 100%
    justify-content: center

.q-separator
  margin: 0.0rem !important
  background: #f2f2f2

body.body--dark .q-separator
  background: #222

.q-banner
  border-radius: 850px
  background: rgba(var(--q-warning-rgb), 0.1) !important
  border: 1px solid rgba(var(--q-warning-rgb), 0.2)

.q-banner.bg-yellow
  background: #fffbe6 !important
  color: #222 !important
  border: 1px solid #ffe58f !important
  
.contact-info
  display: flex
  flex-direction: column
  align-items: center
  text-align: center

.contact-avatar
  margin-bottom: 1rem

.avatar-img
  border-radius: 50%
  width: 100px
  height: 100px

.contact-details
  width: 100%
  max-width: 300px

.contact-item
  display: flex
  justify-content: space-between
  margin-bottom: 0.5rem

.contact-label
  font-weight: bold

.contact-value a
  text-decoration: none
  color: inherit

.contact-actions
  margin-top: 1rem

absolute-top
  position: absolute
  top: 0

.upload-btn-wrapper
  position: relative
  overflow: hidden
  display: inline-block

  & input[type="file"]
    font-size: 100px
    position: absolute
    left: 0
    top: 0
    opacity: 0

.WAL
  width: 100%
  height: 100%
  overflow: hidden !important

  &:before
    content: ''
    height: 127px
    position: fixed
    top: 0
    width: 100%

  &__layout
    margin: 0 auto
    z-index: 4000
    height: 100%
    width: 100%
    overflow: hidden !important

  &__field.q-field--outlined .q-field__control:before
    border: none

  // Ocultar apenas a barra roxa externa, mantendo a interna
  .q-drawer
    overflow: hidden !important
    
    .q-drawer__content
      overflow: hidden !important
      
    // Manter scrollarea interna funcionando
    .q-scrollarea
      overflow: auto !important
      
    .q-scrollarea__container
      overflow: auto !important
      
    // Ocultar apenas a barra externa (roxa)
    .q-scrollarea__bar--v
      display: none !important
      
    .q-scrollarea__bar--h
      display: none !important

  .q-drawer--standard
    .WAL__drawer-close
      display: none

  // Ajustes de espaçamento dos botões outline (somente na página de Atendimento)
  // Evita que o texto fique colado na borda do botão
  .btn-outline
    padding: 4px 10px
  .btn-outline .q-btn__label
    padding: 0 8px
    white-space: nowrap

  // Melhora o espaçamento entre ícone e texto
  .btn-outline .q-btn__content
    gap: 6px
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis

  // Evita quebra específica em rótulos curtos como "Funil" e "Logs"
  .btn-outline.q-btn
    white-space: nowrap
    display: inline-flex

  // Tamanho padronizado para botões azulejados (igual ao "Enviar" do Protocolo)
  .btn-tile
    // Ocupa toda a largura da coluna e permite encolher sem encavalar
    width: 100%
    min-width: 0
    // Altura mínima para manter aparência, mas cresce se o texto quebrar
    min-height: 64px
    height: auto
    align-items: center
    justify-content: center
    white-space: normal
    
    .q-btn__content
      gap: 6px
      flex-direction: column
      white-space: normal !important
      overflow: visible
      text-align: center
    
    .q-btn__label
      white-space: normal !important
      overflow: visible
      text-overflow: unset
      line-height: 1.1

  // Garante que as colunas aceitem encolher lado a lado sem overflow
  .contact-panel .q-item > .q-card__section
    min-width: 0

  // Botões um pouco mais largos (card: Lido, Não lido, Logs)
  .btn-wide
    min-width: 64px
    padding-left: 12px
    padding-right: 12px

  // Painel do contato (lado direito): deixar conteúdos responsivos ao encolher o drawer
  .contact-panel
    .q-item
      display: flex
      flex-wrap: wrap
    
    // As duas colunas internas dos cards ficam lado a lado quando há espaço,
    // e quebram para 100% de largura quando o drawer fica estreito
    .q-item > .q-card__section
      box-sizing: border-box
      flex: 0 0 50%
      width: 50%

    @media (max-width: 420px)
      .q-item > .q-card__section
        flex: 0 0 100%
        width: 100%

  // Ajustar o raio dos cantos especificamente nos q-card-section
  .q-card__section
    border-radius: 6px

  // Reduzir o raio dos cantos dos próprios cards (como na área indicada)
  .q-card,
  .btn-rounded
    border-radius: 6px !important

@media (max-width: 850px)
  .WAL
    padding: 0
    &__layout
      width: 100%
      border-radius: 0

@media (min-width: 691px)
  .WAL
    &__drawer-open
      display: none

.conversation__summary
  margin-top: 4px

.conversation__more
  margin-top: 0!important
  font-size: 1.4rem

.tab-container
  overflow-x: auto
  font-size: 0.75rem

.tab-scroll
  white-space: nowrap
  
.badge-left
  border-radius: 50%
  
.black-icon
  color: black !important

.q-tabs__indicator
  background: transparent !important
  
.blur-effect 
  filter: blur(0px)

.loading-bar
  width: 100%
  height: 4px
  background-color: #ccc
  position: relative

// Ocultar apenas a barra roxa externa, mantendo a interna
.q-drawer.hide-scrollbar
  overflow: hidden !important
  
  .q-drawer__content
    overflow: hidden !important
    
  // Manter scrollarea interna funcionando
  .q-scrollarea
    overflow: auto !important
    
  .q-scrollarea__container
    overflow: auto !important
    
  // Ocultar apenas as barras externas (roxas)
  .q-scrollarea__bar--v
    display: none !important
    
  .q-scrollarea__bar--h
    display: none !important
    
  // Ocultar apenas scrollbars externas, manter internas
  .q-scrollarea__bar
    display: none !important

// Estilos para ItemStatusChannel dentro do tooltip
.q-tooltip .status-card
  background: transparent !important
  box-shadow: none !important
  border: none !important
  padding: 0.5rem !important
  margin: 0 !important

.q-tooltip .q-item
  padding: 0.3rem 0.5rem !important
  background: transparent !important

.q-tooltip .q-item-label
  color: inherit !important
  font-size: 0.9rem !important

.q-tooltip .q-item-label.caption
  color: inherit !important
  opacity: 0.8 !important

// Dark mode específico para tooltip
body.body--dark .q-tooltip .q-item-label
  color: #e0e0e0 !important

body.body--dark .q-tooltip .q-item-label.caption
  color: #aaa !important

// Light mode específico para tooltip
body:not(.body--dark) .q-tooltip .q-item-label
  color: #333 !important

body:not(.body--dark) .q-tooltip .q-item-label.caption
  color: #666 !important
  
.bar
    width: 0
    height: 100%
    background-color: #007bff
    position: absolute
    top: 0
    left: 0
    animation: loadingAnimation 1s infinite
  
@keyframes loadingAnimation
  0%
    width: 0
  100%
    width: 100%
</style>

<style lang="scss" scoped>
.webphone-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1999;
}

.webphone-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2000;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.15);
  min-width: 320px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.webphone-visible {
  opacity: 1;
  visibility: visible;
}

.webphone-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.webphone-content {
  padding: 16px;
}

/* Estilos do AsteriskWebphone */
.webphone-content :deep(.asterisk-webphone) {
  max-width: 280px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

.webphone-content :deep(.webphone-container) {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.webphone-content :deep(.status-indicator) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 14px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 4px;
}

.webphone-content :deep(.number-input) {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  text-align: center;
  outline: none;
}

.webphone-content :deep(.number-input:focus) {
  border-color: #1976d2;
}

.webphone-content :deep(.keypad) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.webphone-content :deep(.keypad-row) {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.webphone-content :deep(.keypad-button) {
  flex: 1;
  aspect-ratio: 1;
  border: none;
  background: none;
  font-size: 24px;
  color: #1976d2;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.webphone-content :deep(.keypad-button:hover) {
  background: #f0f0f0;
}

.webphone-content :deep(.keypad-button:active) {
  background: #e0e0e0;
  transform: scale(0.95);
}

.webphone-content :deep(.call-controls) {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-top: 16px;
}

.webphone-content :deep(.call-button),
.webphone-content :deep(.hangup-button) {
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.webphone-content :deep(.call-button) {
  background: #4caf50;
  color: white;
}

.webphone-content :deep(.hangup-button) {
  background: #f44336;
  color: white;
}

.webphone-content :deep(.call-button:hover:not(.disabled)) {
  background: #43a047;
  transform: scale(1.05);
}

.webphone-content :deep(.hangup-button:hover:not(.disabled)) {
  background: #e53935;
  transform: scale(1.05);
}

.webphone-content :deep(.call-button.disabled),
.webphone-content :deep(.hangup-button.disabled) {
  background: #e0e0e0;
  cursor: not-allowed;
  color: #9e9e9e;
}

.webphone-content :deep(.call-info) {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.webphone-content :deep(.disconnected-message) {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #f57c00;
  font-size: 14px;
  padding: 12px;
  background: #fff3e0;
  border-radius: 4px;
}
</style>
