<template>
  <div>
    <q-header class="bg-white text-grey-10 no-border-radius">
      <q-toolbar style="min-height: 60px; height: 60px;"
        class="no-border-radius q-pa-none ">
        <q-btn flat
          dense
          round
          icon="mdi-menu"
          v-if="$q.screen.lt.md"
          class="q-mx-xs-none q-ml-md"
          :color="$q.dark.isActive ? 'white' : ''"
          @click="emitMenuAction" />
        <q-item clickable
          v-ripple
          class="q-ma-none q-pa-none full"
          style="min-height: 60px; height: 60px; width: 300px;"
          @click="emitInfoContatoAction">
          <q-item-section avatar
            class="q-pl-sm">
            <q-btn round
              flat>
              <q-avatar class="bg-grey blur-effect">
                <q-img 
                  v-if="Value(cticket.contact, 'profilePicUrl') && Value(cticket.contact, 'profilePicUrl') !== 'null' && Value(cticket.contact, 'profilePicUrl') !== 'undefined'"
                  :src="Value(cticket.contact, 'profilePicUrl')"
                  :style="usuarioDados?.restrictedUser === 'enabled' ? 'filter: blur(8px);' : ''">
                </q-img>
                <q-icon v-else name="mdi-account-circle" size="40px" color="grey-8" />
              </q-avatar>
            </q-btn>
          </q-item-section>
          <q-item-section id="InfoCabecalhoChat">
            <q-item-label class="text-bold blur-effect">
              <template v-if="usuarioDados?.restrictedUser === 'enabled'">
                {{ (Value(cticket.contact, 'name') || '').substring(0, 5) }}{{ (Value(cticket.contact, 'name') || '').length > 5 ? '...' : '' }}
              </template>
              <template v-else>
                {{ Value(cticket.contact, 'name') }}
              </template>
              <q-skeleton v-if="!Value(cticket.contact, 'name')"
                animation="none"
                style="width: 230px" />
            </q-item-label>
            <q-item-label caption
              lines="1"
              style="margin-top: 2px !important;"
              :style="$q.screen.width < 500 ? 'max-width: 170px' : ''">
              <span v-if="Value(cticket.user, 'name')"> 
                <!-- Atribuido à: {{ Value(cticket.user, 'name') }}  -->
                {{ $t('atendimentoInfoCabecalho.assignedTo') }} {{ Value(cticket.user, 'name') }}
              </span>
              <q-skeleton v-else
                type="text"
                class="text-caption"
                animation="none"
                style="width: 150px" />
            </q-item-label>
            <q-item-label lines="1"
              style="margin-top: 0px !important;">
              <span v-if="Value(cticket.contact, 'name')"
                class=""
                style="font-size: 11px"> 
                <!-- Ticket: {{ cticket.id }} -->
                {{ $t('atendimentoInfoCabecalho.ticket') }}: {{ cticket.id }}
              </span>
            </q-item-label>
          </q-item-section>
        </q-item>
        <q-space />
        <div class="q-gutter-sm q-pr-sm"
          v-if="Value(cticket.contact, 'name')">
          <template v-if="!$q.screen.xs">
            <q-btn @click="$emit('updateTicket:reabrir')"
              flat
              dense
              autofocus
              icon="mdi-reload"
              color="primary"
              class="bg-padrao btn-rounded"
              :disable="cticket.status == 'open'">
              <q-tooltip content-class="bg-primary text-bold">
                {{ $t('atendimentoInfoCabecalho.reopenTicket') }}
              </q-tooltip>
            </q-btn>
            <q-btn @click="$emit('abrir:modalAgendamentoMensagem')"
              v-if="ticketFocado.channel !== 'telegram' && !desabilitarInputWebchat"
              flat
              dense
              icon="mdi-message-text-clock-outline"
              color="primary"
              class="bg-padrao btn-rounded"
              :disable="cticket.status == 'closed' || desabilitarInput">
              <q-tooltip content-class="bg-primary text-bold">
                {{ $t('atendimentoInfoCabecalho.scheduleMessage') }}
              </q-tooltip>
            </q-btn>
            <q-btn @click="$emit('updateTicket:retornar')"
              flat
              dense
              icon="mdi-replay"
              color="primary"
              class="bg-padrao btn-rounded"
              :disable="cticket.status == 'closed'">
              <q-tooltip content-class="bg-primary text-bold">
                {{ $t('atendimentoInfoCabecalho.returnToQueue') }}
              </q-tooltip>
            </q-btn>
            <q-btn @click="$emit('updateTicket:resolver')"
              color="primary"
              flat
              dense
              class="bg-padrao btn-rounded"
              icon="mdi-comment-check"
              :disable="cticket.status == 'closed'">
              <q-tooltip content-class="bg-primary text-bold">
                {{ $t('atendimentoInfoCabecalho.resolve') }}
              </q-tooltip>
            </q-btn>
            <q-btn @click="listarFilas"
              flat
              dense
              color="primary"
              class="bg-padrao btn-rounded"
              :disable="cticket.status == 'closed'">
              <q-icon name="mdi-transfer" size="20px" />
              <q-tooltip content-class="bg-primary text-bold">
                {{ $t('atendimentoInfoCabecalho.transfer') }}
              </q-tooltip>
            </q-btn>
            <q-btn @click="listarChatbots"
              v-if="ticketFocado.channel !== 'telegram'"
              flat
              dense
              color="primary"
              class="bg-padrao btn-rounded"
              :disable="cticket.status == 'closed' || desabilitarInput">
              <q-icon name="mdi-robot" size="20px" />
              <q-tooltip content-class="bg-primary text-bold">
                {{ $t('atendimentoInfoCabecalho.chatbot') }}
              </q-tooltip>
            </q-btn>
            <q-btn @click="listarCanais"
              v-if="ticketFocado.channel !== 'telegram' && !desabilitarInputWebchat"
              flat
              dense
              color="primary"
              class="bg-padrao btn-rounded"
              :disable="cticket.status == 'closed'">
              <q-icon name="mdi-cellphone-wireless" size="20px" />
              <q-tooltip content-class="bg-primary text-bold">
                {{ $t('atendimentoInfoCabecalho.channel') }}
              </q-tooltip>
            </q-btn>
            <q-btn @click="togglePause"
              v-if="allowPause === 'enabled'"
              flat
              dense
              color="primary"
              class="bg-padrao btn-rounded"
              :disable="cticket.status == 'closed'">
              <q-icon :name="cticket.isPaused ? 'mdi-play' : 'mdi-pause'" size="20px" />
              <q-tooltip content-class="bg-primary text-bold">
                {{ cticket.isPaused ? $t('atendimentoInfoCabecalho.resumeAttendance') : $t('atendimentoInfoCabecalho.pauseAttendance') }}
              </q-tooltip>
            </q-btn>
            <!-- <q-btn @click="reopenWebphone"
              v-if="ticketFocado.channel === 'baileys'"
              flat
              dense
              color="primary"
              class="bg-padrao btn-rounded"
              :disable="cticket.status == 'closed'">
              <q-icon name="mdi-phone-in-talk" size="20px" />
              <q-tooltip content-class="bg-primary text-bold">
                {{ $t('atendimentoInfoCabecalho.reopenCall') }}
              </q-tooltip>
            </q-btn> -->
            <q-btn @click="abrirModalCompartilhamento"
              v-if="!cticket.isGroup"
              flat
              dense
              color="primary"
              class="bg-padrao btn-rounded"
              :disable="cticket.status == 'closed'">
              <q-icon name="mdi-share-variant" size="20px" />
              <q-badge
                v-if="temConviteCompartilhamento"
                color="positive"
                floating
                rounded
                size="xs" />
              <q-tooltip content-class="bg-primary text-bold">
                {{ $t('ticketCompartilhado.compartilharTicket') }}
              </q-tooltip>
            </q-btn>
            <q-btn @click="abrirModalGrupoUsuarios"
              v-if="cticket.isGroup"
              flat
              dense
              color="primary"
              class="bg-padrao btn-rounded"
              :disable="cticket.status == 'closed'">
              <q-icon name="mdi-account-group" size="20px" />
              <q-badge
                v-if="cticket.groupUserIdArray && cticket.groupUserIdArray.length > 0"
                color="positive"
                floating
                rounded
                size="xs" />
              <q-tooltip content-class="bg-primary text-bold">
                {{ $t('atendimentoInfoCabecalho.groupUsers') }}
              </q-tooltip>
            </q-btn>
            <q-btn @click="abrirModalMidiaLinksDocs"
              v-if="!isUsuarioRestrito"
              flat
              dense
              icon="mdi-image-multiple"
              color="primary"
              class="bg-padrao btn-rounded"
              :disable="cticket.status == 'closed' || !cticket.id">
              <q-tooltip content-class="bg-primary text-bold">
                {{ $t('atendimentoInfoCabecalho.mediaLinksDocs') }}
              </q-tooltip>
            </q-btn>
            <q-btn @click="abrirModalBuscarMensagem"
              flat
              dense
              icon="mdi-magnify"
              color="primary"
              class="bg-padrao btn-rounded"
              :disable="cticket.status == 'closed' || !cticket.id">
              <q-tooltip content-class="bg-primary text-bold">
                {{ $t('atendimentoInfoCabecalho.searchInConversation') }}
              </q-tooltip>
            </q-btn>
          </template>
          <template v-else>
            <q-fab
              color="primary"
              flat
              dense
              class="bg-padrao text-bold "
              icon="keyboard_arrow_left"
              direction="down"
              padding="5px"
              :label="$t('atendimentoInfoCabecalho.actions')"
              :class="{
                'bg-black': $q.dark.isActive

              }">
              <q-fab-action @click="$emit('updateTicket:reabrir')"
                color="primary"
                flat
                class="bg-padrao q-pa-xs "
                icon="mdi-reload"
                :class="{
                  'bg-black': $q.dark.isActive

                }">
                <q-tooltip content-class="bg-primary text-bold">
                  {{ $t('atendimentoInfoCabecalho.reopenTicket') }}
                </q-tooltip>
              </q-fab-action>
              <q-fab-action @click="$emit('updateTicket:resolver')"
                :disable="cticket.status == 'closed'"
                color="primary"
                flat
                class="bg-padrao q-pa-xs "
                icon="mdi-comment-check"
                :class="{
                  'bg-black': $q.dark.isActive

                }">
                <q-tooltip content-class="bg-primary text-bold">
                  {{ $t('atendimentoInfoCabecalho.resolve') }}
                </q-tooltip>
              </q-fab-action>
              <q-fab-action @click="$emit('updateTicket:retornar')"
                flat
                icon="mdi-replay"
                color="primary"
                class="bg-padrao q-pa-xs "
                :class="{
                  'bg-black': $q.dark.isActive

                }">
                <q-tooltip content-class="bg-primary text-bold">
                  {{ $t('atendimentoInfoCabecalho.returnToQueue') }}
                </q-tooltip>
              </q-fab-action>

              <q-fab-action @click="listarFilas"
                :disable="cticket.status == 'closed'"
                flat
                color="primary"
                class="bg-padrao q-pa-xs "
                :class="{
                  'bg-black-dark': $q.dark.isActive
                }">
                <q-icon name="mdi-transfer" />
                <q-tooltip content-class="bg-primary text-bold">
                  {{ $t('atendimentoInfoCabecalho.transfer') }}
                </q-tooltip>
              </q-fab-action>
              <q-fab-action @click="listarChatbots"
                :disable="cticket.status == 'closed'"
                v-if="ticketFocado.channel !== 'telegram' && !ticketFocado.channel.includes('hub')"
                flat
                color="primary"
                class="bg-padrao q-pa-xs "
                :class="{
                  'bg-black-dark': $q.dark.isActive
                }">
                <q-icon name="mdi-robot" />
                <q-tooltip content-class="bg-primary text-bold">
                  {{ $t('atendimentoInfoCabecalho.chatbot') }}
                </q-tooltip>
              </q-fab-action>
              <q-fab-action @click="listarCanais"
                :disable="cticket.status == 'closed'"
                v-if="ticketFocado.channel !== 'telegram' && !ticketFocado.channel.includes('hub')"
                flat
                color="primary"
                class="bg-padrao q-pa-xs "
                :class="{
                  'bg-black-dark': $q.dark.isActive
                }">
                <q-icon name="mdi-cellphone-wireless" />
                <q-tooltip content-class="bg-primary text-bold">
                  {{ $t('atendimentoInfoCabecalho.channels') }}
                </q-tooltip>
              </q-fab-action>
              <q-fab-action @click="togglePause"
                v-if="allowPause === 'enabled'"
                :disable="cticket.status == 'closed'"
                flat
                color="primary"
                class="bg-padrao q-pa-xs"
                :class="{
                  'bg-black-dark': $q.dark.isActive
                }">
                <q-icon :name="cticket.isPaused ? 'mdi-play' : 'mdi-pause'" />
                <q-tooltip content-class="bg-primary text-bold">
                  {{ cticket.isPaused ? $t('atendimentoInfoCabecalho.resumeAttendance') : $t('atendimentoInfoCabecalho.pauseAttendance') }}
                </q-tooltip>
              </q-fab-action>
              <!-- <q-fab-action @click="reopenWebphone"
                :disable="cticket.status == 'closed'"
                v-if="ticketFocado.channel !== 'baileys'"
                flat
                color="primary"
                :class="['bg-padrao', 'btn-rounded', {'bg-black-dark': $q.dark.isActive}]">
                <q-icon name="mdi-phone-in-talk" />
                <q-tooltip content-class="bg-primary text-bold">
                  {{ $t('atendimentoInfoCabecalho.reopenCall') }}
                </q-tooltip>
              </q-fab-action> -->
              <q-fab-action @click="abrirModalCompartilhamento"
                v-if="!cticket.isGroup"
                :disable="cticket.status == 'closed'"
                flat
                color="primary"
                class="bg-padrao q-pa-xs"
                :class="{
                  'bg-black-dark': $q.dark.isActive
                }">
                <q-icon name="mdi-share-variant" />
                <q-badge
                  v-if="temConviteCompartilhamento"
                  color="positive"
                  floating
                  rounded
                  size="xs" />
                <q-tooltip content-class="bg-primary text-bold">
                  {{ $t('ticketCompartilhado.compartilharTicket') }}
                </q-tooltip>
              </q-fab-action>
              <q-fab-action @click="abrirModalGrupoUsuarios"
                v-if="cticket.isGroup"
                :disable="cticket.status == 'closed'"
                flat
                color="primary"
                class="bg-padrao q-pa-xs"
                :class="{
                  'bg-black-dark': $q.dark.isActive
                }">
                <q-icon name="mdi-account-group" />
                <q-badge
                  v-if="cticket.groupUserIdArray && cticket.groupUserIdArray.length > 0"
                  color="positive"
                  floating
                  rounded
                  size="xs" />
                <q-tooltip content-class="bg-primary text-bold">
                  {{ $t('atendimentoInfoCabecalho.groupUsers') }}
                </q-tooltip>
              </q-fab-action>
              <q-fab-action @click="$emit('abrir:modalAgendamentoMensagem')"
                :disable="cticket.status == 'closed'"
                v-if="this.ticketFocado.channel !== 'waba' && this.ticketFocado.channel !== 'instagram'"
                flat
                color="primary"
                class="bg-padrao q-pa-xs "
                :class="{
                  'bg-black': $q.dark.isActive

                }">
                <q-icon name="mdi-message-text-clock-outline" />
                <q-tooltip content-class="bg-primary text-bold">
                  {{ $t('atendimentoInfoCabecalho.messageScheduling') }}
                </q-tooltip>
              </q-fab-action>
              <q-fab-action @click="abrirModalBuscarMensagem"
                :disable="cticket.status == 'closed' || !cticket.id"
                flat
                color="primary"
                class="bg-padrao q-pa-xs "
                :class="{
                  'bg-black': $q.dark.isActive

                }">
                <q-icon name="mdi-magnify" />
                <q-tooltip content-class="bg-primary text-bold">
                  {{ $t('atendimentoInfoCabecalho.searchInConversation') }}
                </q-tooltip>
              </q-fab-action>
              <q-fab-action @click="abrirModalMidiaLinksDocs"
                v-if="!isUsuarioRestrito"
                :disable="cticket.status == 'closed' || !cticket.id"
                flat
                color="primary"
                class="bg-padrao q-pa-xs "
                :class="{
                  'bg-black': $q.dark.isActive

                }">
                <q-icon name="mdi-image-multiple" />
                <q-tooltip content-class="bg-primary text-bold">
                  {{ $t('atendimentoInfoCabecalho.mediaLinksDocs') }}
                </q-tooltip>
              </q-fab-action>
            </q-fab>
          </template>

          <!-- <q-btn
            round
            flat
            icon="mdi-text-box-search-outline"
          />
          <q-btn
            round
            flat
          >
            <q-icon
              name="mdi-attachment"
              class="rotate-135"
            />
          </q-btn>
          <q-btn
            round
            flat
            icon="mdi-dots-vertical"
          >
            <q-menu
              auto-close
              :offset="[110, 0]"
            >
              <q-list style="min-width: 150px">
                <q-item clickable>
                  <q-item-section>Contact data</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Block</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Select messages</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Silence</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Clear messages</q-item-section>
                </q-item>
                <q-item clickable>
                  <q-item-section>Erase messages</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn> -->
        </div>
      </q-toolbar>
      <q-separator />
    </q-header>

    <q-dialog v-model="modalTransferirTicket"
      @hide="modalTransferirTicket = false"
      persistent>
      <q-card class="q-pa-md"
        style="width: 500px">
        <q-card-section>
          <div class="text-h6">{{ $t('atendimentoInfoCabecalho.selectDestination') }}</div>
        </q-card-section>
        <q-card-section>
          <q-select square
            outlined
            v-model="filaSelecionada"
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
            v-model="usuarioSelecionado"
            :options="usuarios.filter(filterUsers)"
            emit-value
            map-options
            option-value="id"
            option-label="name"
            :label="$t('atendimentoInfoCabecalho.destinationUser')"
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
            @click="confirmarTransferenciaTicket" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="modalTransferirChatbot"
      @hide="modalTransferirChatbot = false"
      persistent>
      <q-card class="q-pa-md"
        style="width: 500px">
        <q-card-section>
          <div class="text-h6">{{ $t('atendimentoInfoCabecalho.selectDestination') }}</div>
        </q-card-section>
        <q-card-section>
          <q-select square
            outlined
            v-model="chatflowSelecionado"
            :options="chatflowOptions"
            use-input
            input-debounce="0"
            fill-input
            clearable
            @filter="filtrarChatflows"
            emit-value
            map-options
            option-value="id"
            option-label="name"
            :label="$t('atendimentoInfoCabecalho.destinationChatbot')" />
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
            @click="confirmarTransferenciaChatbot" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
    <q-dialog v-model="modalTransferirCanal"
      @hide="modalTransferirCanal = false"
      persistent>
      <q-card class="q-pa-md"
        style="width: 500px">
        <q-card-section>
          <div class="text-h6">{{ $t('atendimentoInfoCabecalho.selectDestination') }}</div>
        </q-card-section>
        <q-card-section>
          <q-select square
            outlined
            v-model="canalSelecionado"
            :options="cSessionsOptions"
            map-options
            :label="$t('atendimentoInfoCabecalho.destinationChannel')" />
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
            @click="confirmarTransferenciaCanal" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
    <q-dialog v-model="modalCompartilhamento"
      @hide="modalCompartilhamento = false"
      persistent>
      <q-card class="q-pa-md"
        style="width: 600px; max-height: 80vh;">
        <q-card-section>
          <div class="text-h6">{{ conviteEditando ? $t('ticketCompartilhado.editarCompartilhamento') : $t('ticketCompartilhado.compartilharTicket') }}</div>
          <div class="text-caption q-mt-sm">
            {{ conviteEditando ? $t('ticketCompartilhado.editeOsUsuariosQueTeraoAcessoAEsteTicket') : $t('ticketCompartilhado.selecioneOsUsuariosQueTeraoAcessoAEsteTicket') }}
          </div>
        </q-card-section>
        <q-card-section class="q-pa-none">
          <q-list>
            <q-item v-for="usuario in usuariosCompartilhamento" :key="usuario.id">
              <q-item-section avatar>
                <q-checkbox v-model="usuario.selecionado" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ usuario.name }}</q-item-label>
                <q-item-label caption>{{ usuario.email }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <!-- <q-card-section class="q-pa-none" style="margin: 10px;">
          <div v-if="linkCompartilhamento">
            <q-input 
              v-model="linkCompartilhamento" 
              label="Link de compartilhamento" 
              readonly 
              dense
              outlined>
              <template v-slot:append>
                <q-btn
                  round
                  dense
                  flat
                  icon="mdi-content-copy"
                  @click="copiarLink"
                  color="primary">
                  <q-tooltip content-class="bg-primary text-bold">
                    Copiar link
                  </q-tooltip>
                </q-btn>
              </template>
            </q-input>
          </div>
        </q-card-section> -->
        <q-card-actions align="right">
          <q-btn
            :label="$t('common.cancel')"
            color="negative"
            v-close-popup
            class="q-mr-lg" />
          <q-btn
            v-if="conviteEditando"
            :label="$t('common.delete')"
            color="warning"
            @click="deletarConvite"
            class="q-mr-lg" />
          <q-btn
            :label="conviteEditando ? $t('ticketCompartilhado.update') : $t('ticketCompartilhado.compartilhar')"
            color="primary"
            @click="confirmarCompartilhamento"
            :disable="!usuariosSelecionados.length" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="modalGrupoUsuarios"
      @hide="() => { modalGrupoUsuarios = false }"
      persistent>
      <q-card class="q-pa-md"
        style="width: 600px; max-height: 80vh;">
        <q-card-section>
          <div class="text-h6">{{ $t('atendimentoInfoCabecalho.groupUsers') }}</div>
          <div class="text-caption q-mt-sm">
            {{ $t('atendimentoInfoCabecalho.selectUsersForGroup') }}
          </div>
        </q-card-section>
        <q-card-section class="q-pa-none">
          <q-list>
            <q-item v-for="usuario in usuariosGrupo" :key="usuario.id">
              <q-item-section avatar>
                <q-checkbox v-model="usuario.selecionado" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ usuario.name }}</q-item-label>
                <q-item-label caption>{{ usuario.email }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            :label="$t('common.cancel')"
            color="negative"
            v-close-popup
            class="q-mr-lg" />
          <q-btn
            :label="$t('common.save')"
            color="primary"
            @click="confirmarGrupoUsuarios" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="modalBuscarMensagem"
      @hide="modalBuscarMensagem = false"
      persistent>
      <q-card style="width: 500px; max-width: 90vw;">
        <q-card-section>
          <div class="text-h6">{{ $t('atendimentoInfoCabecalho.searchInConversation') }}</div>
        </q-card-section>
        <q-card-section>
          <q-input
            v-model="termoBusca"
            :label="$t('atendimentoInfoCabecalho.searchPlaceholder')"
            filled
            @keyup.enter="buscarMensagensConversa"
            autofocus>
            <template v-slot:append>
              <q-icon
                v-if="termoBusca"
                name="mdi-close"
                class="cursor-pointer"
                @click="termoBusca = ''" />
            </template>
          </q-input>
        </q-card-section>
        <q-card-section
          v-if="mensagensFiltradas.length"
          class="scroll"
          style="max-height: 300px; overflow-y: auto;">
          <q-list bordered separator>
            <q-item
              v-for="(msg, index) in mensagensFiltradas"
              :key="msg.id"
              clickable
              @click="irParaMensagem(msg)">
              <q-item-section>
                <q-item-label>{{ msg.fromMe ? $t('common.you') : Value(msg.contact, 'name') || $t('common.contact') }}</q-item-label>
                <q-item-label caption lines="2">{{ msg.body }}</q-item-label>
                <q-item-label caption>{{ formatarDataMensagem(msg.createdAt) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-card-section v-else-if="buscaRealizada && !mensagensFiltradas.length" class="text-center">
          <p>{{ $t('atendimentoInfoCabecalho.noMessagesFound') }}</p>
        </q-card-section>
        <q-card-section v-if="buscando" class="text-center">
          <q-spinner-dots size="40px" color="primary" />
          <p>{{ $t('common.searching') }}...</p>
        </q-card-section>
        <q-card-actions align="right" class="q-gutter-sm">
          <q-btn
            :label="$t('buscarMensagemModal.searchButton')"
            color="primary"
            @click="buscarMensagensConversa"
            :disable="!termoBusca || buscando"
            push
            rounded
            class="text-uppercase"
          />
          <q-btn
            :label="$t('buscarMensagemModal.closeButton')"
            color="negative"
            flat
            class="text-uppercase"
            v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="modalMidiaLinksDocs"
      @hide="resetarMidiaLinksDocs">
      <q-card
        class="bg-white"
        :style="{
          minWidth: $q.screen.lt.sm ? '92vw' : '760px',
          maxWidth: $q.screen.lt.sm ? '98vw' : '980px',
          width: $q.screen.lt.sm ? '98vw' : 'auto'
        }">
        <q-card-section class="row items-center bg-grey-2 q-py-sm">
          <q-icon name="mdi-image-multiple" color="primary" class="q-mr-sm" />
          <div class="text-h6">{{ $t('atendimentoInfoCabecalho.mediaLinksDocs') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense color="negative" class="bg-padrao btn-rounded" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section class="q-pa-none">
          <q-tabs
            v-model="midiaLinksTab"
            dense
            inline-label
            narrow-indicator
            align="justify"
            class="btn-rounded q-mx-sm q-mt-sm"
            :active-bg-color="$q.dark.isActive ? 'primary' : 'grey-3'"
            :class="{ 'text-white': $q.dark.isActive, 'text-black': !$q.dark.isActive }">
            <q-tab name="media" icon="mdi-image-multiple" :label="$t('atendimentoInfoCabecalho.mediaTab')" />
            <q-tab name="links" icon="mdi-link-variant" :label="$t('atendimentoInfoCabecalho.linksTab')" />
            <q-tab name="docs" icon="mdi-file-document-outline" :label="$t('atendimentoInfoCabecalho.docsTab')" />
          </q-tabs>
          <q-separator class="q-mt-sm" />
        </q-card-section>
        <q-card-section class="q-pa-none">
          <div v-if="midiaLinksPrefetching || midiaLinksLoading || midiaLinksLoadingMore" class="midia-links-loading">
            <q-spinner-dots size="20px" color="primary" class="q-mr-sm" />
            <span class="text-caption text-grey-7">{{ $t('atendimentoInfoCabecalho.loadingMediaLinksDocs') }}</span>
          </div>
          <q-tab-panels v-model="midiaLinksTab" animated>
            <q-tab-panel name="media" class="q-pa-none">
              <q-scroll-area
                ref="midiaLinksScrollMedia"
                style="height: 60vh"
                @scroll="handleMidiaLinksScroll">
                <div class="relative-position q-pa-sm">
                  <q-inner-loading :showing="midiaLinksLoading" />
                  <div v-if="!midiaLinksLoading && !midiaLinksItens.length" class="text-center q-pa-md text-grey-7">
                    {{ $t('atendimentoInfoCabecalho.noMessagesFound') }}
                  </div>
                  <div v-else class="media-grid">
                    <div class="row q-col-gutter-sm">
                      <div v-for="item in midiaLinksItens" :key="item.key" class="col-6 col-sm-4 col-md-3">
                        <q-card
                          class="cursor-pointer media-card"
                          flat
                          bordered
                          v-ripple
                          @click="abrirMidiaPreview(item)">
                          <q-img v-if="item.isImage" :src="item.mediaUrl" ratio="1" spinner-color="primary" />
                          <div v-else-if="item.isVideo" class="media-square media-video">
                            <video
                              :src="item.mediaUrl"
                              class="media-video-element"
                              muted
                              playsinline
                              preload="metadata"
                              @loadeddata="fixarFrameVideo"
                              @play="fixarFrameVideo"
                              @error="item.videoError = true"
                            ></video>
                            <div v-if="item.videoError" class="media-fallback">
                              <q-icon :name="item.icon" size="42px" color="grey-7" />
                            </div>
                            <div v-else class="media-video-overlay">
                              <q-icon name="mdi-play-circle" size="42px" color="white" />
                            </div>
                          </div>
                          <div v-else-if="item.isAudio" class="media-square media-audio">
                            <div class="media-audio-inner">
                              <q-icon name="mdi-play" size="26px" color="grey-7" class="media-audio-play" />
                              <div class="media-audio-dot"></div>
                              <div class="media-audio-wave">
                                <span v-for="n in 24" :key="n"></span>
                              </div>
                            </div>
                          </div>
                          <div v-else class="media-square media-fallback">
                            <q-icon :name="item.icon" size="42px" color="grey-7" />
                          </div>
                          <q-card-section class="q-pa-xs">
                            <div class="text-caption ellipsis">{{ item.title }}</div>
                            <div class="text-caption text-grey-7">{{ formatarDataMensagem(item.createdAt) }}</div>
                            <div class="media-actions">
                              <q-btn
                                dense
                                flat
                                round
                                size="sm"
                                color="primary"
                                icon="mdi-download"
                                :aria-label="$t('common.download')"
                                @click.stop="baixarMidia(item)" />
                              <q-btn
                                dense
                                flat
                                round
                                size="sm"
                                color="primary"
                                icon="mdi-message-text-outline"
                                :aria-label="$t('common.message')"
                                @click.stop="irParaMensagemMidia(item)" />
                            </div>
                          </q-card-section>
                        </q-card>
                      </div>
                    </div>
                  </div>
                  <div v-if="midiaLinksHasMore && !midiaLinksLoading" class="row justify-center q-pa-md">
                    <q-btn
                      flat
                      :label="$t('galeria.loadMore')"
                      :loading="midiaLinksLoadingMore"
                      @click="carregarMidiaLinksDocs"
                    />
                  </div>
                </div>
              </q-scroll-area>
            </q-tab-panel>
            <q-tab-panel name="links" class="q-pa-none">
              <q-scroll-area
                ref="midiaLinksScrollLinks"
                style="height: 60vh"
                @scroll="handleMidiaLinksScroll">
                <div class="relative-position q-pa-sm">
                  <q-inner-loading :showing="midiaLinksLoading" />
                  <div v-if="!midiaLinksLoading && !linksItens.length" class="text-center q-pa-md text-grey-7">
                    {{ $t('atendimentoInfoCabecalho.noMessagesFound') }}
                  </div>
                  <div v-else class="links-grid">
                    <div class="q-pa-sm">
                      <q-card
                        v-for="item in linksItens"
                        :key="item.key"
                        class="link-card"
                        flat
                        bordered
                        v-ripple
                        clickable
                        @click="irParaMensagemMidia(item)">
                        <q-card-section class="row items-center no-wrap q-pa-sm">
                          <q-icon name="mdi-link-variant" color="primary" class="q-mr-sm" />
                          <div class="col">
                            <div class="text-primary link-wrap">{{ item.url }}</div>
                            <div class="text-caption text-grey-7 link-wrap">{{ item.text || item.url }}</div>
                          </div>
                          <div class="text-caption text-grey-7 q-ml-sm">{{ formatarDataMensagem(item.createdAt) }}</div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                  <div v-if="midiaLinksHasMore && !midiaLinksLoading" class="row justify-center q-pa-md">
                    <q-btn
                      flat
                      :label="$t('galeria.loadMore')"
                      :loading="midiaLinksLoadingMore"
                      @click="carregarMidiaLinksDocs"
                    />
                  </div>
                </div>
              </q-scroll-area>
            </q-tab-panel>
            <q-tab-panel name="docs" class="q-pa-none">
              <q-scroll-area
                ref="midiaLinksScrollDocs"
                style="height: 60vh"
                @scroll="handleMidiaLinksScroll">
                <div class="relative-position q-pa-sm">
                  <q-inner-loading :showing="midiaLinksLoading" />
                  <div v-if="!midiaLinksLoading && !docsItens.length" class="text-center q-pa-md text-grey-7">
                    {{ $t('atendimentoInfoCabecalho.noMessagesFound') }}
                  </div>
                  <div v-else class="docs-grid">
                    <div class="row q-col-gutter-sm">
                      <div v-for="item in docsItens" :key="item.key" class="col-12 col-sm-6 col-md-4">
                        <q-card
                          class="cursor-pointer docs-card"
                          flat
                          bordered
                          v-ripple
                          @click="abrirMidiaPreview(item)">
                          <div class="docs-card-body">
                            <div class="docs-card-icon">
                              <q-icon
                                size="28px"
                                :name="getFileIcon(item.fileName || item.url || item.title)"
                                :color="getFileIconColor(item.fileName || item.url || item.title)" />
                            </div>
                            <div class="docs-card-text">
                              <div class="docs-card-title">{{ item.title }}</div>
                              <div class="text-caption text-grey-7">{{ formatarDataMensagem(item.createdAt) }}</div>
                              <div class="media-actions">
                                <q-btn
                                  dense
                                  flat
                                  round
                                  size="sm"
                                  color="primary"
                                  icon="mdi-download"
                                  :aria-label="$t('common.download')"
                                  @click.stop="baixarMidia(item)" />
                                <q-btn
                                  dense
                                  flat
                                  round
                                  size="sm"
                                  color="primary"
                                  icon="mdi-message-text-outline"
                                  :aria-label="$t('common.message')"
                                  @click.stop="irParaMensagemMidia(item)" />
                              </div>
                            </div>
                          </div>
                        </q-card>
                      </div>
                    </div>
                  </div>
                  <div v-if="midiaLinksHasMore && !midiaLinksLoading" class="row justify-center q-pa-md">
                    <q-btn
                      flat
                      :label="$t('galeria.loadMore')"
                      :loading="midiaLinksLoadingMore"
                      @click="carregarMidiaLinksDocs"
                    />
                  </div>
                </div>
              </q-scroll-area>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="modalMidiaPreview" @hide="resetarMidiaPreview">
      <q-card
        class="bg-white midia-preview-card"
        :style="{
          minWidth: $q.screen.lt.sm ? '92vw' : '640px',
          maxWidth: $q.screen.lt.sm ? '98vw' : '880px',
          width: $q.screen.lt.sm ? '98vw' : 'auto'
        }">
        <q-card-section class="row items-center bg-grey-2 q-py-sm">
          <q-icon name="mdi-image-multiple" color="primary" class="q-mr-sm" />
          <div class="text-h6">{{ midiaPreviewItem?.title || $t('atendimentoInfoCabecalho.mediaTab') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense color="negative" class="bg-padrao btn-rounded" v-close-popup />
        </q-card-section>
        <q-separator />
        <q-card-section class="midia-preview-body">
          <div v-if="midiaPreviewItem" class="midia-preview-wrapper">
            <q-img
              v-if="midiaPreviewItem.isImage"
              :src="midiaPreviewItem.mediaUrl"
              fit="contain"
              spinner-color="primary"
              class="midia-preview-image" />
            <video
              v-else-if="midiaPreviewItem.isVideo"
              :src="midiaPreviewItem.mediaUrl"
              class="midia-preview-video"
              controls
              playsinline
              preload="metadata"></video>
            <audio
              v-else-if="midiaPreviewItem.isAudio"
              :src="midiaPreviewItem.mediaUrl"
              class="midia-preview-audio"
              controls
              preload="metadata"></audio>
            <div v-else-if="midiaPreviewItem.isDoc && isPdfArquivo(midiaPreviewItem)" class="midia-preview-doc">
              <iframe
                :src="midiaPreviewItem.mediaUrl"
                title="PDF"
                frameborder="0"></iframe>
            </div>
            <div v-else class="midia-preview-fallback">
              <q-icon name="mdi-file" size="48px" color="grey-7" />
              <div class="text-caption text-grey-7 q-mt-sm">{{ midiaPreviewItem.title }}</div>
            </div>
          </div>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" class="q-gutter-sm">
          <q-btn
            flat
            color="primary"
            icon="mdi-download"
            :label="$t('common.download')"
            @click="baixarMidia(midiaPreviewItem)" />
          <q-btn
            flat
            color="primary"
            icon="mdi-message-text-outline"
            :label="$t('common.message')"
            @click="irParaMensagemMidia(midiaPreviewItem)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
const userId = +localStorage.getItem('userId')
import { mapGetters } from 'vuex'
import { ListarUsuarios } from 'src/service/user.js'
import { ListarFilas } from 'src/service/filas.js'
import { AtualizarTicket, AtualizarChatbotTicket, AtualizarCanalTicket, EmitirNotificacaoTicket, AtualizarTicketNaoLido, IniciarPausaTicket, FinalizarPausaTicket, LocalizarMensagens } from 'src/service/tickets.js'
import { ListarChatFlow } from 'src/service/chatFlow.js'
import { CriarTicketCompartilhado, VerificarTicketCompartilhado, DeletarTicketCompartilhado, AtualizarTicketCompartilhado } from 'src/service/ticketcompartilhado.js'
import eventBus from 'src/utils/eventBus.js'
export default {
  name: 'InfoCabecalhoMensagens',
  data () {
    return {
      usuarioDados: null,
      modalTransferirTicket: false,
      modalTransferirChatbot: false,
      modalTransferirCanal: false,
      modalCompartilhamento: false,
      modalGrupoUsuarios: false,
      usuarioSelecionado: null,
      filaSelecionada: null,
      usuarios: [],
      filas: [],
      chatflows: [],
      chatflowOptions: [],
      canais: [],
      chatflowSelecionado: null,
      canalSelecionado: null,
      allowPause: null,
      usuariosCompartilhamento: [],
      usuariosGrupo: [],
      conviteEditando: null,
      linkCompartilhamento: null,
      modalBuscarMensagem: false,
      termoBusca: '',
      mensagensFiltradas: [],
      buscando: false,
      buscaRealizada: false,
      modalMidiaLinksDocs: false,
      midiaLinksTab: 'media',
      midiaLinksPage: 1,
      midiaLinksHasMore: false,
      midiaLinksLoading: false,
      midiaLinksLoadingMore: false,
      midiaLinksItens: [],
      linksItens: [],
      docsItens: [],
      midiaLinksStayAtBottom: false,
      midiaLinksPrefetchTarget: 15,
      midiaLinksPrefetchMaxPages: 500,
      midiaLinksPrefetching: false,
      midiaLinksPrefetchTab: null,
      midiaLinksPrefetchNextTab: null,
      modalMidiaPreview: false,
      midiaPreviewItem: null,
      midiaLinksSeen: {
        media: new Set(),
        links: new Set(),
        docs: new Set()
      }
    }
  },
  watch: {
    getCallInfo(newInfo) {
      this.isCallActive = ['offer', 'outcoming_calling', 'accept'].includes(newInfo.status);
    },
    ticketFocado: {
      handler(newTicket) {
        if (newTicket && newTicket.id) {
          this.verificarConviteExistente();
        }
      },
      immediate: true
    },
    midiaLinksTab(newTab) {
      if (!this.modalMidiaLinksDocs) return;
      this.precarregarMidiaLinksDocs(newTab);
    }
  },
  computed: {
    ...mapGetters(['ticketFocado', 'whatsapps', 'mensagensTicket']),
    ...mapGetters({
      uiFlags: 'webphone/getUIFlags',
      callInfo: 'webphone/getCallInfo',
      inboxes: 'whatsapps',
      wavoip: 'webphone/getWavoip',
    }),
    isCallActive() {
      // Return true only for specific statuses
      return ['offer', 'outcoming_calling', 'accept'].includes(this.callInfo.status);
    },
    cticket () {
      const infoDefault = {
        contact: { profilePicUrl: '', name: '' },
        user: { name: '' }
      }
      return Object.keys(this.ticketFocado).includes('contact') ? this.ticketFocado : infoDefault
    },
    cSessions() {
      return this.whatsapps.filter(w => ["whatsapp", "baileys", "meow", "waba", "evo", "uazapi", "zapi", "instagram"].includes(w.type) && !w.isDeleted && w.status === 'CONNECTED');
    },
    cSessionsOptions() {
      return this.cSessions.map(w => ({ label: w.name, value: w.id, channel: w.type }))
    },
    desabilitarInputWebchat() {
      if (this.ticketFocado.channel === 'webchat') {
        return true;
      }
      return false;
    },
    desabilitarInput() {
      if (this.ticketFocado.channel !== 'waba' && this.ticketFocado.channel !== 'instagram' && !this.ticketFocado.channel.includes('hub') && this.ticketFocado.channel !== 'webmail') {
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
    usuariosSelecionados() {
      return this.usuariosCompartilhamento
        .filter(usuario => usuario.selecionado)
        .map(usuario => usuario.id);
    },
    temConviteCompartilhamento() {
      return (this.linkCompartilhamento !== null && this.linkCompartilhamento !== undefined) || 
             (this.conviteEditando !== null && this.conviteEditando !== undefined);
    },
    isUsuarioRestrito() {
      return this.usuarioDados?.restrictedUser === 'enabled';
    }
  },
  methods: {
    abrirModalBuscarMensagem() {
      this.modalBuscarMensagem = true;
      this.termoBusca = '';
      this.mensagensFiltradas = [];
      this.buscaRealizada = false;
    },
    async buscarMensagensConversa() {
      if (!this.termoBusca) return;
      if (!this.ticketFocado || !this.ticketFocado.id) return;
      this.buscando = true;
      this.buscaRealizada = true;

      try {
        // Carregar todas as mensagens do ticket atual (paginadas)
        let pageNumber = 1;
        let hasMore = true;
        let safety = 0;
        while (hasMore) {
          await this.$store.dispatch('LocalizarMensagensTicket', {
            ticketId: this.ticketFocado.id,
            pageNumber
          });
          pageNumber += 1;
          hasMore = this.$store.getters.hasMore;
          safety += 1;
          if (safety > 1000) { // trava de segurança
            break;
          }
        }

        const termo = this.termoBusca.toLowerCase();
        const lista = this.mensagensTicket || [];
        const toTs = v => {
          if (!v) return 0;
          if (typeof v === 'number') return v;
          const t = new Date(v).getTime();
          return isNaN(t) ? 0 : t;
        };
        this.mensagensFiltradas = lista
          .filter(msg => {
            if (msg.body && String(msg.body).toLowerCase().includes(termo)) return true;
            if (msg.contact && msg.contact.name && String(msg.contact.name).toLowerCase().includes(termo)) return true;
            return false;
          })
          .sort((a, b) => toTs(b.createdAt) - toTs(a.createdAt));
      } catch (e) {
        console.error('Erro ao carregar histórico para busca:', e);
        this.$q && this.$q.notify && this.$q.notify({ type: 'negative', message: this.$t('common.errorOccurred') });
      } finally {
        this.buscando = false;
      }
    },
    async abrirModalMidiaLinksDocs() {
      if (this.isUsuarioRestrito) {
        if (this.$q && this.$q.notify) {
          this.$q.notify({
            type: 'negative',
            message: this.$t('common.accessDenied')
          });
        }
        return;
      }
      if (!this.ticketFocado || !this.ticketFocado.id) return;
      this.resetarMidiaLinksDocs();
      this.modalMidiaLinksDocs = true;
      await this.precarregarMidiaLinksDocs('all');
    },
    abrirMidiaPreview(item) {
      if (!item) return;
      const mediaUrl = item.mediaUrl || item.url || '';
      this.midiaPreviewItem = {
        ...item,
        mediaUrl
      };
      this.modalMidiaPreview = true;
    },
    resetarMidiaPreview() {
      this.modalMidiaPreview = false;
      this.midiaPreviewItem = null;
    },
    resetarMidiaLinksDocs() {
      this.midiaLinksTab = 'media';
      this.midiaLinksPage = 1;
      this.midiaLinksHasMore = true;
      this.midiaLinksLoading = false;
      this.midiaLinksLoadingMore = false;
      this.midiaLinksItens = [];
      this.linksItens = [];
      this.docsItens = [];
      this.midiaLinksStayAtBottom = false;
      this.midiaLinksPrefetching = false;
      this.midiaLinksPrefetchTab = null;
      this.midiaLinksPrefetchNextTab = null;
      this.midiaLinksSeen = {
        media: new Set(),
        links: new Set(),
        docs: new Set()
      };
    },
    handleMidiaLinksScroll(info) {
      let scrollPercentage = 0;
      const triggerPoint = 0.8;
      if (info && typeof info.verticalPercentage === 'number') {
        scrollPercentage = info.verticalPercentage;
      } else if (info && info.target) {
        const container = info.target;
        const maxScroll = container.scrollHeight - container.clientHeight;
        scrollPercentage = maxScroll > 0 ? container.scrollTop / maxScroll : 1;
      }
      this.midiaLinksStayAtBottom = scrollPercentage >= triggerPoint;
      if (scrollPercentage >= triggerPoint) {
        this.carregarMidiaLinksDocs();
      }
    },
    getItensCountPorAba(tab) {
      if (tab === 'links') return this.linksItens.length;
      if (tab === 'docs') return this.docsItens.length;
      return this.midiaLinksItens.length;
    },
    getPrefetchTargetPorAba(tab) {
      return this.midiaLinksPrefetchTarget;
    },
    async precarregarMidiaLinksDocs(tab = this.midiaLinksTab) {
      const targetTab = tab || 'media';
      if (this.midiaLinksPrefetching) {
        this.midiaLinksPrefetchNextTab = targetTab;
        return;
      }
      this.midiaLinksPrefetching = true;
      this.midiaLinksPrefetchTab = targetTab;
      let pagesLoaded = 0;
      const target = this.getPrefetchTargetPorAba(targetTab);

      try {
        const precisaMais = () => {
          if (!this.midiaLinksHasMore) return false;
          if (pagesLoaded >= this.midiaLinksPrefetchMaxPages) return false;
          if (targetTab === 'all') {
            return (
              this.getItensCountPorAba('media') < target ||
              this.getItensCountPorAba('links') < target ||
              this.getItensCountPorAba('docs') < target
            );
          }
          return this.getItensCountPorAba(targetTab) < target;
        };

        while (precisaMais()) {
          await this.carregarMidiaLinksDocs();
          pagesLoaded += 1;
        }
      } finally {
        this.midiaLinksPrefetching = false;
        this.midiaLinksPrefetchTab = null;
        this.$nextTick(() => {
          this.verificarAutoCargaMidiaLinks();
        });
        if (this.midiaLinksPrefetchNextTab && this.modalMidiaLinksDocs) {
          const nextTab = this.midiaLinksPrefetchNextTab;
          this.midiaLinksPrefetchNextTab = null;
          this.precarregarMidiaLinksDocs(nextTab);
        }
      }
    },
    async carregarMidiaLinksDocs() {
      if (!this.ticketFocado || !this.ticketFocado.id) return;
      if (this.midiaLinksLoading || this.midiaLinksLoadingMore) return;
      if (!this.midiaLinksHasMore && this.midiaLinksPage !== 1) return;

      const isFirstPage = this.midiaLinksPage === 1;
      if (isFirstPage) {
        this.midiaLinksLoading = true;
      } else {
        this.midiaLinksLoadingMore = true;
      }
      let addedMedia = 0;

      const pageNumber = this.midiaLinksPage;
      try {
        const { data } = await LocalizarMensagens({
          ticketId: this.ticketFocado.id,
          pageNumber,
          markAsRead: false
        });
        const messages = [...(data.messages || []), ...(data.messagesOffLine || [])];

        this.midiaLinksHasMore = !!data.hasMore;
        const beforeCount = this.midiaLinksItens.length;
        this.adicionarItensMidiaLinksDocs(messages, pageNumber);
        addedMedia = this.midiaLinksItens.length - beforeCount;
        this.midiaLinksPage += 1;
      } catch (error) {
        console.error('Erro ao carregar mídia, links e docs:', error);
        if (this.$q && this.$q.notify) {
          this.$q.notify({
            type: 'negative',
            message: this.$t('common.errorOccurred')
          });
        }
      } finally {
        this.midiaLinksLoading = false;
        this.midiaLinksLoadingMore = false;
        if (!this.midiaLinksPrefetching) {
          this.$nextTick(() => {
            this.verificarAutoCargaMidiaLinks();
          });
        }
      }
      return addedMedia;
    },
    verificarAutoCargaMidiaLinks() {
      if (this.midiaLinksPrefetching) return;
      if (!this.midiaLinksStayAtBottom) return;
      if (!this.midiaLinksHasMore) return;
      if (this.midiaLinksLoading || this.midiaLinksLoadingMore) return;
      this.carregarMidiaLinksDocs();
    },
    adicionarItensMidiaLinksDocs(mensagens, pageNumber) {
      const lista = Array.isArray(mensagens) ? mensagens : [];
      const ordenadas = [...lista].sort((a, b) => this.getMensagemTimestamp(b) - this.getMensagemTimestamp(a));
      const pageRef = pageNumber || 1;

      ordenadas.forEach(msg => {
        if (!msg) return;
        const createdAt = msg.createdAt || msg.timestamp;
        const baseId = msg.id || `${msg.ticketId || 'ticket'}-${createdAt || '0'}`;

        if (this.isDocumentoMensagem(msg)) {
          const item = this.criarItemDoc(msg, baseId, createdAt, pageRef);
          if (item && !this.midiaLinksSeen.docs.has(item.key)) {
            this.midiaLinksSeen.docs.add(item.key);
            this.docsItens.push(item);
          }
        } else if (this.isMediaMensagem(msg)) {
          const item = this.criarItemMidia(msg, baseId, createdAt, pageRef);
          if (item && !this.midiaLinksSeen.media.has(item.key)) {
            this.midiaLinksSeen.media.add(item.key);
            this.midiaLinksItens.push(item);
          }
        }

        const links = this.extrairLinks(msg.body);
        if (links.length) {
          const resumo = this.getResumoMensagem(msg);
          links.forEach((url, index) => {
            const key = `link-${baseId}-${index}-${url}`;
            if (this.midiaLinksSeen.links.has(key)) return;
            this.midiaLinksSeen.links.add(key);
            this.linksItens.push({
              key,
              url,
              text: resumo,
              createdAt,
              messageId: msg.id,
              pageNumber: pageRef
            });
          });
        }
      });
      this.ordenarItensMidiaLinksDocs();
    },
    ordenarItensMidiaLinksDocs() {
      const sortByDateDesc = (a, b) => {
        const delta = this.getItemTimestamp(b) - this.getItemTimestamp(a);
        if (delta !== 0) return delta;
        const keyA = String(a.key || a.messageId || a.url || '');
        const keyB = String(b.key || b.messageId || b.url || '');
        return keyB.localeCompare(keyA);
      };
      this.midiaLinksItens.sort(sortByDateDesc);
      this.linksItens.sort(sortByDateDesc);
      this.docsItens.sort(sortByDateDesc);
    },
    getItemTimestamp(item) {
      if (!item) return 0;
      const value = item.timestamp || item.createdAt;
      if (!value) return 0;
      if (typeof value === 'number') return value;
      const ts = new Date(value).getTime();
      return isNaN(ts) ? 0 : ts;
    },
    getMensagemTimestamp(msg) {
      if (!msg) return 0;
      const value = msg.timestamp || msg.createdAt;
      if (!value) return 0;
      if (typeof value === 'number') return value;
      const ts = new Date(value).getTime();
      return isNaN(ts) ? 0 : ts;
    },
    extrairLinks(texto) {
      if (!texto) return [];
      const matches = String(texto).match(/https?:\/\/[^\s<]+/g);
      if (!matches) return [];
      const unique = new Set();
      matches.forEach(match => {
        let url = match.trim();
        url = url.replace(/[)\].,;!?]+$/, '');
        if (url) unique.add(url);
      });
      return Array.from(unique);
    },
    getResumoMensagem(msg) {
      if (!msg) return '';
      const texto = String(msg.body || msg.mediaName || '').replace(/\s+/g, ' ').trim();
      if (!texto) return '';
      if (texto.length <= 140) return texto;
      return `${texto.slice(0, 140)}...`;
    },
    getMediaTypeNormalizado(mediaType) {
      return String(mediaType || '').toLowerCase().trim();
    },
    getMimeCategoria(mediaType) {
      const normalizado = this.getMediaTypeNormalizado(mediaType);
      if (!normalizado) return '';
      if (normalizado.includes('/')) return normalizado.split('/')[0];
      return normalizado;
    },
    getMensagemExt(msg) {
      if (!msg) return '';
      const extUrl = this.isMediaUrlValida(msg.mediaUrl) ? this.getUrlExtension(msg.mediaUrl) : '';
      if (extUrl) return extUrl;
      const nome = msg.mediaName || '';
      return this.getUrlExtension(nome);
    },
    isMediaUrlValida(url) {
      if (!url) return false;
      const value = String(url).trim().toLowerCase();
      return value !== 'null' && value !== 'undefined';
    },
    isExtValida(ext) {
      return Boolean(ext) && /^[a-z0-9]{1,10}$/.test(ext);
    },
    criarItemMidia(msg, baseId, createdAt, pageNumber) {
      if (!msg || !msg.mediaUrl) return null;
      const ext = this.getMensagemExt(msg);
      const mediaType = this.getMediaTypeNormalizado(msg.mediaType);
      const mimeCategoria = this.getMimeCategoria(mediaType);
      const isImageType = ['image', 'imagemessage', 'sticker', 'stickermessage'].includes(mediaType) || mimeCategoria === 'image';
      const isVideoType = ['video', 'videomessage'].includes(mediaType) || mimeCategoria === 'video';
      const isAudioType = ['audio', 'audiomessage'].includes(mediaType) || mimeCategoria === 'audio';
      const isImage = isImageType || this.isImagemExt(ext);
      const isVideo = isVideoType || this.isVideoExt(ext);
      const isAudio = isAudioType || this.isAudioExt(ext);
      let icon = 'mdi-file';
      if (isVideo) icon = 'mdi-play-circle-outline';
      else if (isAudio) icon = 'mdi-music-note';
      const title = msg.mediaName || msg.body || this.$t('atendimentoInfoCabecalho.mediaTab');
      return {
        key: `media-${baseId}-${msg.mediaUrl}`,
        mediaUrl: msg.mediaUrl,
        url: msg.mediaUrl,
        fileName: msg.mediaName || this.getFileNameFromUrl(msg.mediaUrl),
        title,
        createdAt,
        isImage,
        icon,
        isVideo,
        isAudio,
        videoError: false,
        messageId: msg.id,
        pageNumber
      };
    },
    criarItemDoc(msg, baseId, createdAt, pageNumber) {
      if (!msg) return null;
      const mediaUrl = this.isMediaUrlValida(msg.mediaUrl) ? msg.mediaUrl : '';
      const fallbackName = this.getFileNameFromUrl(mediaUrl);
      const title = msg.mediaName || fallbackName || msg.body || this.$t('atendimentoInfoCabecalho.docsTab');
      const keyRef = mediaUrl || msg.mediaName || msg.body || baseId;
      return {
        key: `doc-${baseId}-${keyRef}`,
        url: mediaUrl,
        mediaUrl,
        fileName: msg.mediaName || fallbackName || '',
        isDoc: true,
        title,
        createdAt,
        messageId: msg.id,
        pageNumber
      };
    },
    getUrlExtension(url) {
      if (!url) return '';
      const cleanUrl = String(url).split('?')[0].split('#')[0];
      const parts = cleanUrl.split('.');
      return parts.length > 1 ? parts.pop().toLowerCase() : '';
    },
    getFileNameFromUrl(url) {
      if (!url) return '';
      const cleanUrl = String(url).split('?')[0].split('#')[0];
      const parts = cleanUrl.split('/');
      return parts.length ? parts[parts.length - 1] : '';
    },
    isImagemExt(ext) {
      return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext);
    },
    isVideoExt(ext) {
      return ['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext);
    },
    isAudioExt(ext) {
      return ['mp3', 'ogg', 'wav', 'm4a', 'opus'].includes(ext);
    },
    isMediaMensagem(msg) {
      if (!msg || !this.isMediaUrlValida(msg.mediaUrl)) return false;
      const mediaType = this.getMediaTypeNormalizado(msg.mediaType);
      const mimeCategoria = this.getMimeCategoria(mediaType);
      const mediaTypes = new Set(['image', 'imagemessage', 'video', 'videomessage', 'audio', 'audiomessage', 'sticker', 'stickermessage']);
      if (mediaTypes.has(mediaType)) return true;
      if (['image', 'video', 'audio'].includes(mimeCategoria)) return true;
      const ext = this.getMensagemExt(msg);
      return this.isImagemExt(ext) || this.isVideoExt(ext) || this.isAudioExt(ext);
    },
    isDocumentoMensagem(msg) {
      if (!msg) return false;
      const mediaType = this.getMediaTypeNormalizado(msg.mediaType);
      const mimeCategoria = this.getMimeCategoria(mediaType);
      const ext = this.getMensagemExt(msg);
      const hasMediaUrl = this.isMediaUrlValida(msg.mediaUrl);
      const mediaNameExt = this.getUrlExtension(msg.mediaName || '');
      const mediaNameExtValida = this.isExtValida(mediaNameExt);
      const hasArquivo = hasMediaUrl || mediaNameExtValida;
      if (!hasArquivo) return false;
      const extValida = this.isExtValida(ext);
      const isTextMime = mimeCategoria === 'text' && mediaType.includes('/');
      const mediaTypeIndicaDoc = mediaType.includes('document') || mediaType === 'application' || mimeCategoria === 'application' || isTextMime;
      if (this.isImagemExt(ext) || this.isVideoExt(ext) || this.isAudioExt(ext)) return false;
      if (['image', 'video', 'audio'].includes(mimeCategoria)) return false;
      if (mediaTypeIndicaDoc) return true;
      if (!hasMediaUrl) return false;
      return extValida;
    },
    async irParaMensagemMidia(item) {
      if (!item || !item.messageId) return;
      this.resetarMidiaPreview();
      this.modalMidiaLinksDocs = false;
      await this.garantirMensagemCarregada(item.messageId, item.pageNumber);
      this.scrollParaMensagem(item.messageId);
    },
    async baixarMidia(item) {
      if (!item) return;
      const rawUrl = item.mediaUrl || item.url;
      if (!rawUrl) return;
      const fallbackName = this.getFileNameFromUrl(rawUrl) || 'media';
      const fileName = item.fileName || fallbackName;

      const buildProxiedUrl = (u) => {
        try {
          const parsed = new URL(u);
          const path = parsed.pathname + (parsed.search || '');
          if ((process.env.URL_API || '').startsWith('/')) {
            return `${process.env.URL_API}${path}`;
          }
          return u;
        } catch (e) {
          if (u.startsWith('/public/')) {
            return `${process.env.URL_API}${u}`;
          }
          return u;
        }
      };
      const url = buildProxiedUrl(rawUrl);

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Origin: window.location.origin,
            'X-Requested-With': 'XMLHttpRequest'
          },
          credentials: 'include'
        });
        if (!response.ok) throw new Error('download_failed');
        const blob = await response.blob();
        const objectUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(objectUrl);
        return;
      } catch (error) {
        const link = document.createElement('a');
        link.href = rawUrl;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
    async garantirMensagemCarregada(messageId, pageNumber) {
      if (!messageId || !this.ticketFocado || !this.ticketFocado.id) return;
      const mensagensAtuais = this.mensagensTicket || [];
      if (mensagensAtuais.some(m => m.id === messageId)) return;

      const targetPage = Math.max(1, Number(pageNumber) || 1);
      if (targetPage === 1) return;

      const pagesToTry = [targetPage, targetPage - 1, targetPage + 1]
        .filter(page => page > 1);

      for (const page of pagesToTry) {
        await this.$store.dispatch('LocalizarMensagensTicket', {
          ticketId: this.ticketFocado.id,
          pageNumber: page,
          markAsRead: false
        });
        if ((this.mensagensTicket || []).some(m => m.id === messageId)) return;
      }
    },
    scrollParaMensagem(messageId) {
      if (!messageId) return;
      this.$emit('buscar:scrollToMessage', messageId);
      this.$nextTick(() => {
        const selector = `[data-message-id="${messageId}"]`;
        const elemento = document.querySelector(selector);
        if (elemento) {
          try { elemento.scrollIntoView({ behavior: 'auto', block: 'center' }); } catch (e) {}
          elemento.classList.add('highlight-message');
          setTimeout(() => {
            elemento.classList.remove('highlight-message');
          }, 3000);
        }
      });
    },
    isPdfArquivo(item) {
      if (!item) return false;
      const ext = this.getUrlExtension(item.fileName || item.mediaUrl || item.url || '');
      return ext === 'pdf';
    },
    getFileIcon(fileUrl) {
      if (!fileUrl) return 'mdi-file';
      const ext = this.getUrlExtension(fileUrl);
      switch (ext) {
        case 'pdf':
          return 'mdi-file-pdf-box';
        case 'doc':
        case 'docx':
          return 'mdi-file-word-box';
        case 'xls':
        case 'xlsx':
          return 'mdi-file-excel-box';
        case 'ppt':
        case 'pptx':
          return 'mdi-file-powerpoint-box';
        case 'csv':
          return 'mdi-file-delimited';
        case 'zip':
        case 'rar':
        case '7z':
          return 'mdi-folder-zip';
        case 'xml':
          return 'mdi-file-code-outline';
        case 'pfx':
        case 'p2k':
          return 'mdi-file-key';
        case 'txt':
          return 'mdi-file-document-outline';
        case 'nullextension':
          return 'mdi-alert-outline';
        default:
          return 'mdi-file';
      }
    },
    getFileIconColor(fileUrl) {
      if (!fileUrl) return 'grey-7';
      const ext = this.getUrlExtension(fileUrl);
      switch (ext) {
        case 'pdf':
          return 'red-7';
        case 'doc':
        case 'docx':
          return 'blue-7';
        case 'xls':
        case 'xlsx':
        case 'csv':
          return 'green-7';
        case 'ppt':
        case 'pptx':
          return 'orange-7';
        case 'zip':
        case 'rar':
        case '7z':
          return 'orange-7';
        case 'pfx':
        case 'p2k':
          return 'grey-8';
        case 'txt':
          return 'grey-7';
        default:
          return 'blue-4';
      }
    },
    fixarFrameVideo(event) {
      const video = event && event.target ? event.target : null;
      if (!video) return;
      try {
        const duration = Number.isFinite(video.duration) ? video.duration : 0.1;
        const frameTime = Math.min(0.1, duration || 0.1);
        if (Math.abs(video.currentTime - frameTime) > 0.001) {
          video.currentTime = frameTime;
        }
        video.pause();
      } catch (error) {
        video.pause();
      }
    },
    irParaMensagem(mensagem) {
      if (!mensagem || !mensagem.id) return;
      this.scrollParaMensagem(mensagem.id);
      this.modalBuscarMensagem = false;
    },
    formatarDataMensagem(data) {
      if (!data) return '';
      const date = new Date(data);
      return date.toLocaleString();
    },
    emitMenuAction() {
      eventBus.emit('infor-cabecalo-chat:acao-menu');
    },
    emitInfoContatoAction() {
      eventBus.emit('update-ticket:info-contato');
    },
    ...mapActions('webphone', ['updateWebphoneVisible']),
    async togglePause() {
      try {
        if (this.cticket.isPaused) {
          await FinalizarPausaTicket(this.ticketFocado.id);
          // Atualiza o estado local do ticket
          this.$store.commit('TICKET_FOCADO', {
            ...this.ticketFocado,
            isPaused: false
          });
          this.$q.notify({
            type: 'positive',
            message: this.$t('atendimentoInfoCabecalho.attendanceResumed'),
            progress: true,
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          });
        } else {
          await IniciarPausaTicket(this.ticketFocado.id);
          // Atualiza o estado local do ticket
          this.$store.commit('TICKET_FOCADO', {
            ...this.ticketFocado,
            isPaused: true
          });
          this.$q.notify({
            type: 'info',
            message: this.$t('atendimentoInfoCabecalho.attendancePaused'),
            progress: true,
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          });
        }
      } catch (error) {
        console.error(error);
        this.$q.notify({
          type: 'negative',
          message: this.$t('atendimentoInfoCabecalho.pauseError'),
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        });
      }
    },
    reopenWebphone() {
      this.updateWebphoneVisible({ isOpen: true });
    },
    Value (obj, prop) {
      try {
        return obj[prop]
      } catch (error) {
        return ''
      }
    },
    filterUsers (element, index, array) {
      const fila = this.filaSelecionada
      if (fila == null) return true
      const queues_valid = element.queues.filter(function (element, index, array) {
        return (element.id == fila)
      })
      return (queues_valid.length > 0)
    },
    filtrarChatflows (val, update) {
      if (typeof update !== 'function') return

      update(() => {
        const listaBase = Array.isArray(this.chatflows) ? this.chatflows : []
        const termo = String(val || '').toLowerCase()

        if (!termo) {
          this.chatflowOptions = [...listaBase]
          return
        }

        this.chatflowOptions = listaBase.filter(chatflow => {
          const nome = String(chatflow && chatflow.name ? chatflow.name : '').toLowerCase()
          return nome.includes(termo)
        })
      })
    },
    async listarChatbots(){
      try {
        const { data } = await ListarChatFlow()
        this.chatflows = data.chatFlow.filter(chatFlow => chatFlow.isActive);
        this.chatflowOptions = [...this.chatflows]
        this.modalTransferirChatbot = true
      } catch (error) {
        console.error(error)
        this.$notificarErro(this.$t('atendimentoInfoCabecalho.loadingChatbotsError'), error)
      }
    },
    async listarCanais(){
      try {
        this.modalTransferirCanal = true
      } catch (error) {
        console.error(error)
        this.$notificarErro(this.$t('atendimentoInfoCabecalho.loadingChannelsError'), error)
      }
    },
    async confirmarTransferenciaChatbot () {
      if (!this.chatflowSelecionado) return
      try{
        await AtualizarChatbotTicket(this.ticketFocado.id, {
          chatFlowId: this.chatflowSelecionado,
        })
        this.$q.notify({
          type: 'info',
          message: this.$t('atendimentoInfoCabecalho.transferredToChatbot'),
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        this.modalTransferirChatbot = false
      } catch(e){
        console.log(this.$t('atendimentoInfoCabecalho.transferError') + e)
        this.modalTransferirChatbot = false
      }
    },
    async confirmarTransferenciaCanal () {
      if (!this.canalSelecionado) return
      console.log(this.canalSelecionado)
      try{
        await AtualizarCanalTicket(this.ticketFocado.id, {
          channel: this.canalSelecionado.channel,
          whatsappId: this.canalSelecionado.value
        })
        this.$q.notify({
          type: 'info',
          message: this.$t('atendimentoInfoCabecalho.transferredToChannel'),
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        this.modalTransferirCanal = false
      } catch(e){
        console.log(this.$t('atendimentoInfoCabecalho.transferError') + e)
        if (e.status === 409) {
          console.log('tkc >>>>>>>>>>>>> 10', e)
          this.$q.notify({
            type: 'warning',
            message: this.$t('atendimentoInfoCabecalho.checkTicketError'),
            progress: true,
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          }
        this.modalTransferirCanal = false
      }
    },
    async listarFilas () {
      try {
        const { data } = await ListarFilas()
        this.filas = data.filter(fila => fila.isActive);
        this.modalTransferirTicket = true
        this.listarUsuarios()
      } catch (error) {
        console.error(error)
        this.$notificarErro(this.$t('atendimentoInfoCabecalho.loadingQueuesError'), error)
      }
    },
    async listarUsuarios() {
      try {
        let usuarios = [];
        let hasMore = true;
        let pageNumber = 1; // Página inicial.

        while (hasMore) {
          const { data } = await ListarUsuarios({ pageNumber });

          const novosUsuarios = data.users.filter(user => user.profile !== 'superadmin');
          usuarios = [...usuarios, ...novosUsuarios];

          hasMore = data.hasMore;
          pageNumber += 1;
        }

        this.usuarios = usuarios;
        this.modalTransferirTicket = true;
      } catch (error) {
        console.error(error);
        this.$notificarErro(this.$t('atendimentoInfoCabecalho.loadingUsersError'), error);
      }
    },
    async confirmarTransferenciaTicket () {
      if (!this.filaSelecionada) return
      // if (!this.usuarioSelecionado) return
      if (this.ticketFocado.userId === this.usuarioSelecionado && this.ticketFocado.userId != null) {
        this.$q.notify({
          type: 'info',
          message: this.$t('atendimentoInfoCabecalho.alreadyAssigned'),
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        return
      }
      if (this.ticketFocado.userId === userId && userId === this.usuarioSelecionado) {
        this.$q.notify({
          type: 'info',
          message: this.$t('atendimentoInfoCabecalho.alreadyAssignedToYou'),
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        return
      }
      if (this.ticketFocado.queueId === this.filaSelecionada && this.ticketFocado.userId === this.usuarioSelecionado) {
        this.$q.notify({
          type: 'info',
          message: this.$t('atendimentoInfoCabecalho.alreadyInQueueAndUser'),
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        return
      }
      await AtualizarTicket(this.ticketFocado.id, {
        userId: this.usuarioSelecionado,
        queueId: this.filaSelecionada,
        status: this.usuarioSelecionado == null ? 'pending' : 'open',
        isTransference: 1
      })

      await AtualizarTicketNaoLido(this.ticketFocado.id, 1)

      // Emitir notificação após a transferência
      await EmitirNotificacaoTicket(this.ticketFocado.id, 'notification:new')

      this.$q.notify({
        type: 'positive',
        message: this.$t('atendimentoInfoCabecalho.transferredToQueue'),
        progress: true,
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
      this.modalTransferirTicket = false
      this.$store.commit('TICKET_FOCADO', {})
    },
    async abrirModalCompartilhamento() {
      try {
        if(!this.ticketFocado || !this.ticketFocado.id) return;
        // Verificar se já existe um convite para este ticket
        const { existe, data } = await VerificarTicketCompartilhado(this.ticketFocado.id);
        
        if (existe && data) {

          // Carregar dados do convite existente para edição
          await this.carregarUsuariosCompartilhamento(data);

        } else {
          // Se não existe, criar novo convite
          this.carregarUsuariosCompartilhamento();
        }
      } catch (error) {
        // console.error('Erro ao verificar convite:', error);
        
        // Se o erro for 404 (não encontrado), criar novo convite
        if (error.status === 404 || error.response?.status === 404) {
          this.carregarUsuariosCompartilhamento();
        } else {
          // Para outros erros, mostrar notificação
          this.$q.notify({
            type: 'negative',
            message: this.$t('ticketCompartilhado.erroAoVerificarConviteExistente'),
            progress: true,
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          });
        }
      }
    },
    
    async carregarUsuariosCompartilhamento(conviteExistente = null) {
      try {
        // Carregar usuários se ainda não foram carregados
        if (this.usuarios.length === 0) {
          await this.carregarUsuariosParaCompartilhamento();
        }
        
        // Preparar lista de usuários para compartilhamento
        this.usuariosCompartilhamento = this.usuarios
          .filter(user => user.id !== userId) // Excluir o usuário atual
          .map(user => ({
            ...user,
            selecionado: conviteExistente && this.ticketFocado.userIdArray && Array.isArray(this.ticketFocado.userIdArray) 
              ? this.ticketFocado.userIdArray.includes(user.id) 
              : false
          }));
        
        // Se estamos editando um convite existente, armazenar o ID para atualização
        if (conviteExistente) {
          this.conviteEditando = conviteExistente.id;
          this.linkCompartilhamento = conviteExistente.inviteUrl;
        } else {
          this.conviteEditando = null;
          this.linkCompartilhamento = null;
        }
        
        this.modalCompartilhamento = true;
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        this.$q.notify({
          type: 'negative',
          message: this.$t('ticketCompartilhado.erroAoCarregarUsuarios'),
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        });
      }
    },
    
    async carregarUsuariosParaCompartilhamento() {
      try {
        let usuarios = [];
        let hasMore = true;
        let pageNumber = 1; // Página inicial.

        while (hasMore) {
          const { data } = await ListarUsuarios({ pageNumber });

          const novosUsuarios = data.users.filter(user => user.profile !== 'superadmin');
          usuarios = [...usuarios, ...novosUsuarios];

          hasMore = data.hasMore;
          pageNumber += 1;
        }

        this.usuarios = usuarios;
        // NÃO definir modalTransferirTicket = true aqui
      } catch (error) {
        console.error(error);
        this.$notificarErro(this.$t('atendimentoInfoCabecalho.loadingUsersError'), error);
      }
    },
    
    async confirmarCompartilhamento() {
      if (this.usuariosSelecionados.length === 0) {
        this.$q.notify({
          type: 'warning',
          message: this.$t('ticketCompartilhado.selecionePeloMenosUmUsuarioParaCompartilhar'),
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        });
        return;
      }

      try {
        // Usar a URL atual do ticket que está sendo atendido
        const inviteUrl = window.location.href;
        
        if (this.conviteEditando) {
          // Atualizar convite existente
          await AtualizarTicketCompartilhado(this.conviteEditando, {
            inviteUrl: inviteUrl,
            ticketId: this.ticketFocado.id,
            userIdArray: this.usuariosSelecionados
          });

          this.$q.notify({
            type: 'positive',
            message: this.$t('ticketCompartilhado.conviteAtualizadoCom', { length: this.usuariosSelecionados.length }),
            progress: true,
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          });
        } else {
          // Criar novo convite
          await CriarTicketCompartilhado({
            inviteUrl: inviteUrl,
            ticketId: this.ticketFocado.id,
            userIdArray: this.usuariosSelecionados
          });

          this.$q.notify({
            type: 'positive',
            message: this.$t('ticketCompartilhado.ticketCompartilhadoCom', { length: this.usuariosSelecionados.length }),
            progress: true,
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          });
        }

        this.modalCompartilhamento = false;
        this.conviteEditando = null; // Resetar o estado de edição
      } catch (error) {
        console.error('Erro ao compartilhar ticket:', error);
        
        let errorMessage = this.$t('ticketCompartilhado.erroAoCompartilharTicket');
        if (error.response && error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        }
        
        this.$q.notify({
          type: 'negative',
          message: errorMessage,
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        });
      }
    },
    async deletarConvite() {
      try {
        await DeletarTicketCompartilhado(this.conviteEditando);
        this.$q.notify({
          type: 'info',
          message: this.$t('ticketCompartilhado.conviteDeletadoComSucesso'),
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        });
        this.modalCompartilhamento = false;
        this.conviteEditando = null;
      } catch (error) {
        console.error('Erro ao deletar convite:', error);
        this.$q.notify({
          type: 'negative',
          message: this.$t('ticketCompartilhado.erroAoDeletarConvite'),
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        });
      }
    },
    copiarLink() {
      const link = this.linkCompartilhamento;
      if (link) {
        navigator.clipboard.writeText(link).then(() => {
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
    async verificarConviteExistente() {
      try {
        if (!this.ticketFocado || !this.ticketFocado.id || !this.ticketFocade.shared) {
          this.conviteEditando = null;
          this.linkCompartilhamento = null;
          return;
        }

        const { existe, data } = await VerificarTicketCompartilhado(this.ticketFocado.id);
        if (existe && data) {
          this.conviteEditando = data.id;
          this.linkCompartilhamento = data.inviteUrl;
        } else {
          this.conviteEditando = null;
          this.linkCompartilhamento = null;
        }
      } catch (error) {
        // console.error('Erro ao verificar convite existente:', error);
        // Não mostrar notificação de erro para não incomodar o usuário
        this.conviteEditando = null;
        this.linkCompartilhamento = null;
      }
    },
    async abrirModalGrupoUsuarios() {
      try {
        if (!this.ticketFocado || !this.ticketFocado.id) return;
        
        // Carregar usuários se ainda não foram carregados
        if (this.usuarios.length === 0) {
          await this.carregarUsuariosParaCompartilhamento();
        }
        
        // Preparar lista de usuários para grupo
        this.usuariosGrupo = this.usuarios
          .filter(user => user.profile !== 'superadmin')
          .map(user => ({
            ...user,
            selecionado: this.ticketFocado.groupUserIdArray && Array.isArray(this.ticketFocado.groupUserIdArray) 
              ? this.ticketFocado.groupUserIdArray.includes(user.id) 
              : false
          }));
        
        this.modalGrupoUsuarios = true;
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        this.$q.notify({
          type: 'negative',
          message: this.$t('atendimentoInfoCabecalho.loadingUsersError'),
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        });
      }
    },
    async confirmarGrupoUsuarios() {
      try {
        const usuariosSelecionados = this.usuariosGrupo
          .filter(usuario => usuario.selecionado)
          .map(usuario => usuario.id);

        await AtualizarTicket(this.ticketFocado.id, {
          groupUserIdArray: usuariosSelecionados.length > 0 ? usuariosSelecionados : null
        });

        this.$q.notify({
          type: 'positive',
          message: this.$t('atendimentoInfoCabecalho.groupUsersUpdated'),
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        });

        this.modalGrupoUsuarios = false;
      } catch (error) {
        console.error('Erro ao atualizar usuários do grupo:', error);
        this.$q.notify({
          type: 'negative',
          message: this.$t('atendimentoInfoCabecalho.errorUpdatingGroupUsers'),
          progress: true,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        });
      }
    }
  },
  mounted(){
    this.allowPause = JSON.parse(localStorage.getItem('allowPause') || 'disabled')
    
    // Buscar restrictedUser do localStorage
    try {
      const usuario = JSON.parse(localStorage.getItem('usuario'))
      if (usuario) {
        this.usuarioDados = {
          restrictedUser: usuario.restrictedUser || null
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário do localStorage:', error)
    }
  }
}
</script>

<style lang="scss" scoped>
.media-grid {
  background: #f2f2f2;
  border-radius: 10px;
  padding: 8px;
}

.media-card {
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}

.media-square {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  min-height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
}

.media-video-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  pointer-events: none;
}

.media-video-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.25);
  pointer-events: none;
}

.media-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
  pointer-events: none;
}

.media-audio-inner {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  padding: 0 10px;
  pointer-events: none;
}

.media-audio-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #21ba45;
  flex: 0 0 auto;
}

.media-audio-wave {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
}

.media-audio-wave span {
  width: 3px;
  height: 8px;
  background: #b0b0b0;
  border-radius: 2px;
  display: inline-block;
}

.media-audio-wave span:nth-child(3n) {
  height: 14px;
}

.media-audio-wave span:nth-child(4n) {
  height: 18px;
}

.media-audio-wave span:nth-child(5n) {
  height: 10px;
}

.webphone-button-container {
  display: inline-block;
}

.activeCall {
  animation: blink 1s step-start infinite;
}

@keyframes blink {
  50% {
    opacity: 0;
  }
}

.media-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
}

.midia-links-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
}

.docs-grid {
  background: #f2f2f2;
  border-radius: 10px;
  padding: 8px;
}

.docs-card {
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}

.docs-card-body {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  min-height: 84px;
}

.docs-card-icon {
  width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.docs-card-text {
  flex: 1;
  min-width: 0;
}

.docs-card-title {
  font-size: 14px;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.links-grid {
  background: #f2f2f2;
  border-radius: 10px;
  padding: 8px;
}

.link-card {
  background: #fff;
  border-radius: 10px;
  margin-bottom: 8px;
}

.link-card:last-child {
  margin-bottom: 0;
}

.link-wrap {
  word-break: break-all;
  white-space: normal;
}

.midia-preview-card {
  border-radius: 12px;
}

.midia-preview-body {
  padding: 16px;
}

.midia-preview-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
}

.midia-preview-image {
  width: 100%;
  max-height: 70vh;
  border-radius: 10px;
}

.midia-preview-video {
  width: 100%;
  max-height: 70vh;
  border-radius: 10px;
  background: #000;
}

.midia-preview-audio {
  width: 100%;
}

.midia-preview-fallback {
  text-align: center;
}

.midia-preview-doc {
  width: 100%;
  height: 70vh;
  border-radius: 10px;
  overflow: hidden;
  background: #f5f5f5;
}

.midia-preview-doc iframe {
  width: 100%;
  height: 100%;
  border: 0;
}
</style>
