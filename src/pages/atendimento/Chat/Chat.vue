<template>
  <div class="bg-white no-scroll hide-scrollbar overflow-hidden" :style="style">
    <InforCabecalhoChat
      @updateTicket:resolver="atualizarStatusTicket('closed')"
      @updateTicket:retornar="atualizarStatusTicket('pending')"
      @updateTicket:reabrir="atualizarStatusTicket('open')"
      @abrir:modalAgendamentoMensagem="onClickOpenAgendamentoMensagem()"
    />

    <q-scroll-area ref="scrollContainer" class="scroll-y" :style="cStyleScroll" @scroll="scrollArea">
      <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
        <q-infinite-scroll v-if="cMessages.length" reverse :offset="100" @load="onLoadMoreQInfinite">
          <template v-slot:loading>
            <div class="row justify-center q-my-sm">
              <q-spinner color="primary" size="2em" />
            </div>
          </template>
        </q-infinite-scroll>
      </transition>
      <MensagemChat
        v-model:replyingMessage="replyingMessage"
        :mensagens="cMessages"
        v-if="cMessages.length && ticketFocado.id"
        @mensagem-chat:encaminhar-mensagem="abrirModalEncaminharMensagem"
        @mensagem-chat:encaminhar-chat-privado="abrirModalEncaminharChatPrivado"
        @mensagem-chat:encaminhar-outro-canal="abrirModalEncaminharOutroCanal"
        @mensagem-chat:rolar-para-topo="scrollToTop"
        v-model:ativarMultiEncaminhamento="ativarMultiEncaminhamento"
        v-model:mensagensParaEncaminhar="mensagensParaEncaminhar"
      />
      <div id="inicioListaMensagensChat"></div>
    </q-scroll-area>
    <div
      class="absolute-center items-center"
      :class="{
        'row col text-center q-col-gutter-lg': !$q.screen.xs,
        'full-width text-center': $q.screen.xs,
      }"
      v-if="!ticketFocado.id"
    >
      <q-icon
        style="margin-left: 30vw"
        size="6em"
        color="grey-6"
        name="mdi-emoticon-wink-outline"
        class="row col text-center"
        :class="{
          'row col text-center q-mr-lg': !$q.screen.xs,
          'full-width text-center center-block': $q.screen.xs,
        }"
      >
      </q-icon>
      <h1
        class="text-grey-6 row col justify-center"
        :class="{
          'full-width': $q.screen.xs,
        }"
      >
      {{ $t("atendimentoChat.selectTicket") }}
      </h1>
    </div>
    <div v-if="cMessages.length" class="relative-position">
      <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
        <div v-if="scrollIcon">
          <q-btn class="vac-icon-scroll" color="white" text-color="black" icon="mdi-arrow-down" round push ripple dense @click="scrollToBottom" />
        </div>
      </transition>
    </div>

    <q-footer class="bg-white">
      <q-separator class="bg-grey-4" />
      <q-list
        v-if="replyingMessage"
        :style="`border-top: 1px solid #; max-height: 140px; width: 100%;`"
        style="max-height: 100px"
        class="q-pa-none q-py-md text-black row items-center col justify-center full-width"
        :class="{
          'bg-grey-1': !$q.dark.isActive,
          'bg-grey-10': $q.dark.isActive,
        }"
      >
        <q-item
          class="q-card--bordered q-pb-sm btn-rounded"
          :style="`
            width: 460px;
            min-width: 460px;
            max-width: 460px;
            max-height: 110px;
          `"
          :class="{
            'bg-blue-1': !replyingMessage.fromMe && !$q.dark.isActive,
            'bg-blue-2 text-black': !replyingMessage.fromMe && $q.dark.isActive,
            'bg-grey-2 text-black': replyingMessage.fromMe,
          }"
        >
          <q-item-section>
            <q-item-label v-if="!replyingMessage.fromMe" :class="{ 'text-black': $q.dark.isActive }" caption>
              <!-- {{ replyingMessage.contact && replyingMessage.contact.name }} -->
              {{ replyingMessage.contact && replyingMessage.contact.name.length > 10 
                ? replyingMessage.contact.name.substring(0, 10) + '...' 
                : replyingMessage.contact.name }}
            </q-item-label>
            <q-item-label lines="4" v-html="formatarMensagemWhatsapp(replyingMessage.body)"> </q-item-label>
          </q-item-section>
          <q-btn @click="replyingMessage = null" dense flat round icon="close" class="float-right absolute-top-right z-max" :disabled="loading || ticketFocado.status !== 'open'" />
        </q-item>
      </q-list>

      <q-banner class="text-grey-8" v-if="mensagensParaEncaminhar.length > 0">
        <span class="text-bold text-h5">
          {{ $t('atendimentoChat.forwardMessages', { count: mensagensParaEncaminhar.length }) }}
        </span>
        <!-- <span class="text-bold text-h5"> {{ mensagensParaEncaminhar.length }} de 10 mensagens</span>
        selecionadas para serem encaminhadas. -->
        <q-separator class="bg-grey-4" />
        <q-select
          dense
          class="q-my-md"
          ref="selectAutoCompleteContato"
          autofocus
          outlined
          rounded
          hide-dropdown-icon
          :loading="loading"
          v-model="contatoSelecionado"
          :options="contatos"
          input-debounce="700"
          @filter="localizarContato"
          use-input
          hide-selected
          fill-input
          clearable
          option-label="name"
          option-value="id"
          :label="$t('atendimentoChat.forwardHint')"
          :hint="$t('atendimentoChat.forwardLimit')"
        >
          <template v-slot:option="scope">
            <q-item v-bind="scope.itemProps" v-on="scope.itemEvents || {}" v-if="scope.opt.name">
              <q-item-section>
                <q-item-label> {{ scope.opt.name }}</q-item-label>
                <q-item-label caption>{{ scope.opt.number }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
        </q-select>
        <template v-slot:action>
          <q-btn class="bg-padrao q-px-sm" flat color="negative" :label="$t('common.cancel')" @click="cancelarMultiEncaminhamento" />
          <q-btn class="bg-padrao q-px-sm" flat color="positive" :label="$t('common.send')" icon="mdi-send" @click="confirmarEncaminhamentoMensagem(mensagensParaEncaminhar)" />
        </template>
      </q-banner>

      <InputMensagem v-if="!mensagensParaEncaminhar.length" :mensagensRapidas="mensagensRapidas" v-model:replyingMessage="replyingMessage" :mensagens="cMessages" />
      <q-resize-observer @resize="onResizeInputMensagem" />
    </q-footer>

    <q-dialog v-model="modalEncaminhamentoMensagem" persistent @hide="limparModalEncaminhamento">
      <q-card :style="$q.screen.width < 770 ? `min-width: 98vw; max-width: 98vw` : 'min-width: 50vw; max-width: 50vw'">
        <q-card-section>
          <div class="text-h6">
            {{ $t("atendimentoChat.forwardMessage") }}
            <q-btn flat class="bg-padrao btn-rounded float-right" color="negative" icon="close" v-close-popup />
          </div>
        </q-card-section>
        <q-separator inset />
        <q-card-section>
          <MensagemChat :isShowOptions="false" v-model:replyingMessage="replyingMessage" :mensagens="[mensagemEncaminhamento]" />
        </q-card-section>
        <q-card-section>
          <q-select
            class="q-px-lg"
            ref="selectAutoCompleteContato"
            autofocus
            outlined
            rounded
            hide-dropdown-icon
            :loading="loading"
            v-model="contatoSelecionado"
            :options="contatos"
            input-debounce="700"
            @filter="localizarContato"
            use-input
            hide-selected
            fill-input
            clearable
            option-label="name"
            option-value="id"
            :label="$t('common.search')"
            :hint="$t('atendimentoChat.forwardHint')"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" v-on="scope.itemEvents || {}" v-if="scope.opt.name">
                <q-item-section>
                  <q-item-label> {{ scope.opt.name }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.number }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn class="bg-padrao q-px-sm" flat color="positive" :label="$t('common.send')" icon="mdi-send" @click="confirmarEncaminhamentoMensagem([mensagemEncaminhamento])" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal para encaminhar para outro canal -->
    <q-dialog v-model="modalEncaminharOutroCanal" persistent @hide="limparModalOutroCanal">
      <q-card :style="$q.screen.width < 770 ? `min-width: 98vw; max-width: 98vw` : 'min-width: 50vw; max-width: 50vw'">
        <q-card-section>
          <div class="text-h6">
            {{ $t("atendimentoChat.forwardToOtherChannel") || 'Encaminhar para Outro Canal' }}
            <q-btn flat class="bg-padrao btn-rounded float-right" color="negative" icon="close" v-close-popup />
          </div>
        </q-card-section>
        <q-separator inset />
        <q-card-section>
          <MensagemChat :isShowOptions="false" v-model:replyingMessage="replyingMessage" :mensagens="[mensagemEncaminharOutroCanal]" />
        </q-card-section>
        <q-card-section>
          <q-select
            class="q-px-lg q-mb-md"
            ref="selectCanalDestino"
            outlined
            rounded
            v-model="canalSelecionado"
            :options="canaisDisponiveis"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            :label="$t('atendimentoChat.selectDestinationChannel') || 'Selecione o canal destino'"
            :hint="$t('atendimentoChat.selectDestinationChannelHint') || 'Escolha o canal para onde a mensagem será encaminhada'"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" v-on="scope.itemEvents || {}">
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.type }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
          <q-select
            class="q-px-lg"
            ref="selectAutoCompleteContatoOutroCanal"
            outlined
            rounded
            hide-dropdown-icon
            :loading="loadingOutroCanal"
            v-model="contatoSelecionadoOutroCanal"
            :options="contatos"
            input-debounce="700"
            @filter="localizarContato"
            use-input
            hide-selected
            fill-input
            clearable
            option-label="name"
            option-value="id"
            :label="$t('common.search')"
            :hint="$t('atendimentoChat.forwardHint')"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" v-on="scope.itemEvents || {}" v-if="scope.opt.name">
                <q-item-section>
                  <q-item-label> {{ scope.opt.name }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.number }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn class="bg-padrao q-px-sm" flat color="negative" :label="$t('common.cancel')" @click="limparModalOutroCanal" />
          <q-btn class="bg-padrao q-px-sm" flat color="positive" :label="$t('common.send')" icon="mdi-send" @click="confirmarEncaminharOutroCanal" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal para encaminhar ao chat privado -->
    <q-dialog v-model="modalEncaminharChatPrivado" persistent @hide="limparModalChatPrivado">
      <q-card :style="$q.screen.width < 770 ? `min-width: 98vw; max-width: 98vw` : 'min-width: 50vw; max-width: 50vw'">
        <q-card-section>
          <div class="text-h6">
            {{ $t("atendimentoChat.forwardToPrivateChat") || 'Encaminhar para Chat Privado' }}
            <q-btn flat class="bg-padrao btn-rounded float-right" color="negative" icon="close" v-close-popup />
          </div>
        </q-card-section>
        <q-separator inset />
        <q-card-section>
          <MensagemChat :isShowOptions="false" v-model:replyingMessage="replyingMessage" :mensagens="[mensagemEncaminharChatPrivado]" />
        </q-card-section>
        <q-card-section>
          <q-select
            class="q-px-lg"
            ref="selectUsuarioChatPrivado"
            autofocus
            outlined
            rounded
            hide-dropdown-icon
            :loading="loadingChatPrivado"
            v-model="usuarioChatPrivadoSelecionado"
            :options="usuariosChatPrivado"
            input-debounce="700"
            @filter="localizarUsuarioChatPrivado"
            use-input
            hide-selected
            fill-input
            clearable
            option-label="name"
            option-value="id"
            :label="$t('atendimentoChat.selectPrivateChatUser') || 'Selecione um usuário'"
            :hint="$t('atendimentoChat.selectPrivateChatUserHint') || 'Digite para buscar um usuário'"
          >
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps" v-on="scope.itemEvents || {}" v-if="scope.opt.name">
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white">
                    {{ scope.opt.name?.charAt(0) }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label> {{ scope.opt.name }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.email }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </q-card-section>
        <q-card-actions align="right" class="q-pa-md">
          <q-btn class="bg-padrao q-px-sm" flat color="negative" :label="$t('common.cancel')" @click="limparModalChatPrivado" />
          <q-btn class="bg-padrao q-px-sm" flat color="positive" :label="$t('common.send')" icon="mdi-send" @click="confirmarEncaminharChatPrivado" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import mixinCommon from '../mixinCommon.js'
import InforCabecalhoChat from '../InforCabecalhoChat.vue'
import DialogAgendamentoMensagem from './DialogAgendamentoMensagem.vue'
// import parser from 'vdata-parser'
import MensagemChat from '../MensagemChat.vue'
import InputMensagem from '../InputMensagem.vue'
import mixinAtualizarStatusTicket from '../mixinAtualizarStatusTicket.js'
import mixinSockets from '../mixinSockets.js'
import { ListarContatos } from 'src/service/contatos.js'
import { EncaminharMensagem, EncaminharMensagemParaOutroCanal } from 'src/service/tickets.js'
import { ListarUsuariosChatPrivado } from 'src/service/user.js'
import { enviarMensagemPrivada } from 'src/service/chatPrivado.js'
import { mapGetters } from 'vuex'
import whatsBackground from 'src/assets/wa-background.png'
import whatsBackgroundDark from 'src/assets/wa-background-dark.jpg'
import eventBus from 'src/utils/eventBus.js'

export default {
  name: 'Chat',
  mixins: [mixinCommon, mixinAtualizarStatusTicket, mixinSockets],
  props: {
    mensagensRapidas: Array,
  },
  components: {
    InforCabecalhoChat,
    MensagemChat,
    InputMensagem,
    
  },
  data() {
    return {
      scrollIcon: false,
      loading: false,
      exibirContato: false,
      heigthInputMensagem: 0,
      params: {
        ticketId: null,
        pageNumber: 1,
      },
      agendamentoMensagem: {
        scheduleDate: '',
      },
      replyingMessage: null,
      // Preserva a mensagem selecionada para resposta entre atualizações
      preservedReplyingMessage: null,
      modalEncaminhamentoMensagem: false,
      mensagemEncaminhamento: {},
      mensagensParaEncaminhar: [],
      ativarMultiEncaminhamento: false,
      contatoSelecionado: {
        id: '',
        name: '',
      },
      contatos: [],
      // Modal e dados para encaminhamento ao chat privado
      modalEncaminharChatPrivado: false,
      mensagemEncaminharChatPrivado: {},
      usuarioChatPrivadoSelecionado: null,
      usuariosChatPrivado: [],
      loadingChatPrivado: false,
      // Modal e dados para encaminhamento para outro canal
      modalEncaminharOutroCanal: false,
      mensagemEncaminharOutroCanal: {},
      contatoSelecionadoOutroCanal: null,
      canalSelecionado: null,
      loadingOutroCanal: false,
      // Sistema de gerenciamento de memória
      timers: [],
    }
  },
  computed: {
    ...mapGetters(['whatsapps']),
    cMessages() {
      // Preserva a seleção de resposta quando mensagens são atualizadas
      if (this.preservedReplyingMessage && !this.replyingMessage) {
        this.$nextTick(() => {
          this.replyingMessage = this.preservedReplyingMessage
        })
      }
      return this.mensagensTicket
    },
    canaisDisponiveis() {
      if (!this.whatsapps || !Array.isArray(this.whatsapps)) return []
      return this.whatsapps
        .filter(w => {
          const isConnected = (w.status === 'CONNECTED' || w.status === 'OPENING')
          const isNotDeleted = !w.isDeleted
          const type = w.type?.toLowerCase() || ''
          const isNotExcluded = !type.includes('telegram') && !type.includes('hub') && !type.includes('webchat') && !type.includes('webmail')
          return isConnected && isNotDeleted && isNotExcluded
        })
        .map(w => ({
          label: `${w.name} (${w.type})`,
          value: w.id,
          type: w.type,
          id: w.id
        }))
    },
    style() {
      return {
        backgroundImage: this.$q.dark.isActive ? `url(${whatsBackgroundDark}) !important` : `url(${whatsBackground}) !important`,
        // backgroundRepeat: 'no-repeat !important',
        backgroundPosition: 'center !important',
        // backgroundSize: '50% !important',
      }
    },
    cStyleScroll() {
      const loading = 0 // this.loading ? 72 : 0
      const add = this.heigthInputMensagem + loading
      return `min-height: calc(100vh - ${62 + add}px); height: calc(100vh - ${62 + add}px); width: 100%`
    },
  },
  watch: {
    // Limpa seleção somente quando trocar de ticket
    ticketFocado: {
      handler(newTicket, oldTicket) {
        if (oldTicket && newTicket && oldTicket.id !== newTicket.id) {
          this.replyingMessage = null
          this.preservedReplyingMessage = null
        }
      },
      deep: true
    },
    // Mantém uma cópia sempre sincronizada
    replyingMessage: {
      handler(newVal) {
        this.preservedReplyingMessage = newVal
      },
      deep: true
    },
    // Ao atualizar a lista de mensagens, restaura a seleção se necessário
    mensagensTicket: {
      handler() {
        if (this.preservedReplyingMessage && !this.replyingMessage) {
          this.$nextTick(() => {
            this.replyingMessage = this.preservedReplyingMessage
          })
        }
      },
      deep: true
    }
  },
  methods: {
    // Sistema de gerenciamento de memória
    addTimer(timerId) {
      this.timers.push(timerId);
    },
    // Adicionar este método dentro de methods: { ... } em Chat.vue
    handlerNotifications(data) {
      // Se a notificação não for para o ticket que está em foco, não faz nada.
      if (this.ticketFocado.id !== data.ticket.id) {
        return;
      }

      const profilePicUrl = data.ticket.contact.profilePicUrl;
      const validIcon = (profilePicUrl && profilePicUrl !== 'null' && profilePicUrl !== 'undefined') ? profilePicUrl : undefined;
      const options = {
        body: `${data.body} - ${this.formatarData(new Date(), 'HH:mm')}`,
        icon: validIcon,
        tag: data.ticket.id,
        renotify: true,
      }

      const notification = new Notification(
        `Mensagem de ${data.ticket.contact.name}`,
        options
      )

      notification.onclick = (e) => {
        e.preventDefault()
        window.focus()
      }
    },
    clearAllTimers() {
      this.timers.forEach(timerId => {
        clearTimeout(timerId);
        clearInterval(timerId);
      });
      this.timers = [];
    },
    cleanupMemory() {
      this.clearAllTimers();
    },
    scrollToTop() {
      this.$nextTick(() => {
        const timerId = setTimeout(() => {
          const scrollArea = this.$refs.scrollContainer;
          if (scrollArea && typeof scrollArea.setScrollPosition === 'function') {
            // Quasar v2 signature: setScrollPosition(axis, offset, duration)
            try {
              scrollArea.setScrollPosition('vertical', 0, 10)
            } catch (e) {
              // Fallback for legacy signature
              scrollArea.setScrollPosition(0, 10)
            }
          }
        }, 100);
        this.addTimer(timerId);
      });
    },
    onClickOpenAgendamentoMensagem() {
      this.$q.dialog({
        component: DialogAgendamentoMensagem,
        componentProps: {
          mensagensRapidas: this.mensagensRapidas,
          replyingMessage: this.replyingMessage
        }
      })
    },
    async onResizeInputMensagem(size) {
      this.heigthInputMensagem = size.height
    },
    async onLoadMoreQInfinite(index, done) {
      if (this.loading) return done()

      if (!this.hasMore || !this.ticketFocado?.id) {
        return done()
      }

      try {
        this.loading = true
        this.params.ticketId = this.ticketFocado.id
        this.params.pageNumber += 1
        await this.$store.dispatch('LocalizarMensagensTicket', this.params)
      } catch (error) {
        // no-op
      }
      this.loading = false
      done()
    },
    scrollArea(e) {
      this.hideOptions = true
      const timerId = setTimeout(() => {
        if (!e) return
        this.scrollIcon = e.verticalSize - (e.verticalPosition + e.verticalContainerSize) > 2000 // e.verticalPercentage < 0.8
      }, 200)
      this.addTimer(timerId);
    },
    scrollToBottom() {
      document.getElementById('inicioListaMensagensChat').scrollIntoView()
    },
    abrirModalEncaminharMensagem(msg) {
      // Limpar seleção anterior para evitar usar contato de encaminhamento anterior
      this.contatoSelecionado = {
        id: '',
        name: '',
      }
      this.mensagemEncaminhamento = msg
      this.modalEncaminhamentoMensagem = true
    },
    limparModalEncaminhamento() {
      this.mensagemEncaminhamento = {}
      this.contatoSelecionado = {
        id: '',
        name: '',
      }
      this.contatos = []
    },
    async localizarContato(search, update, abort) {
      if (search.length < 2) {
        if (this.contatos.length)
          update(() => {
            this.contatos = [...this.contatos]
          })
        abort()
        return
      }
      this.loading = true
      const { data } = await ListarContatos({
        searchParam: search,
      })

      update(() => {
        if (data.contacts.length) {
          this.contatos = data.contacts
        } else {
          this.contatos = [{}]
          // this.$refs.selectAutoCompleteContato.toggleOption({}, true)
        }
      })
      this.loading = false
    },
    cancelarMultiEncaminhamento() {
      this.mensagensParaEncaminhar = []
      this.ativarMultiEncaminhamento = false
      this.contatoSelecionado = {
        id: '',
        name: '',
      }
      this.contatos = []
    },
    confirmarEncaminhamentoMensagem(data) {
      if (!this.contatoSelecionado.id) {
        this.$notificarErro(this.$t('atendimentoChat.contactNotSelected'));
        return
      }
      // Salvar o contato selecionado antes de limpar para garantir que use o correto
      const contatoParaEncaminhar = { ...this.contatoSelecionado }
      
      EncaminharMensagem(data, contatoParaEncaminhar)
        .then((r) => {
          this.$notificarSucesso(this.$t('atendimentoChat.messageSent'));
          // this.$notificarSucesso(`Mensagem encaminhada para ${contatoParaEncaminhar.name} | Número: ${contatoParaEncaminhar.number}`)
          this.mensagensParaEncaminhar = []
          this.ativarMultiEncaminhamento = false
          // Limpar o contato selecionado após enviar com sucesso
          this.contatoSelecionado = {
            id: '',
            name: '',
          }
          // Fechar o modal se estiver aberto
          if (this.modalEncaminhamentoMensagem) {
            this.modalEncaminhamentoMensagem = false
            this.limparModalEncaminhamento()
          }
        })
        .catch((e) => {
          this.$notificarErro(this.$t('atendimentoChat.messageFailed'))
        })
    },
    abrirModalEncaminharChatPrivado(mensagem) {
      this.mensagemEncaminharChatPrivado = mensagem
      this.usuarioChatPrivadoSelecionado = null
      this.usuariosChatPrivado = []
      this.modalEncaminharChatPrivado = true
      // Carregar lista inicial de usuários
      this.localizarUsuarioChatPrivado('', () => {}, () => {})
    },
    limparModalChatPrivado() {
      this.mensagemEncaminharChatPrivado = {}
      this.usuarioChatPrivadoSelecionado = null
      this.usuariosChatPrivado = []
      this.modalEncaminharChatPrivado = false
    },
    async localizarUsuarioChatPrivado(search, update, abort) {
      if (search.length < 1) {
        // Se não houver busca, carrega lista inicial
        try {
          this.loadingChatPrivado = true
          const { data } = await ListarUsuariosChatPrivado()
          const usuario = JSON.parse(localStorage.getItem('usuario'))
          // Filtra o próprio usuário e superadmin
          const usuariosFiltrados = (data.users || []).filter(u => 
            u.id !== usuario.userId && u.profile !== 'superadmin'
          )
          update(() => {
            this.usuariosChatPrivado = usuariosFiltrados
          })
        } catch (error) {
          console.error('Erro ao carregar usuários do chat privado:', error)
          update(() => {
            this.usuariosChatPrivado = []
          })
        } finally {
          this.loadingChatPrivado = false
        }
        return
      }

      this.loadingChatPrivado = true
      try {
        const { data } = await ListarUsuariosChatPrivado({ searchParam: search })
        const usuario = JSON.parse(localStorage.getItem('usuario'))
        // Filtra o próprio usuário e superadmin
        const usuariosFiltrados = (data.users || []).filter(u => 
          u.id !== usuario.userId && u.profile !== 'superadmin'
        )
        update(() => {
          if (usuariosFiltrados.length) {
            this.usuariosChatPrivado = usuariosFiltrados
          } else {
            this.usuariosChatPrivado = []
          }
        })
      } catch (error) {
        console.error('Erro ao buscar usuários:', error)
        update(() => {
          this.usuariosChatPrivado = []
        })
      } finally {
        this.loadingChatPrivado = false
      }
    },
    async confirmarEncaminharChatPrivado() {
      if (!this.usuarioChatPrivadoSelecionado || !this.usuarioChatPrivadoSelecionado.id) {
        this.$notificarErro(this.$t('atendimentoChat.userNotSelected') || 'Selecione um usuário');
        return
      }

      if (!this.mensagemEncaminharChatPrivado || !this.mensagemEncaminharChatPrivado.id) {
        this.$notificarErro(this.$t('atendimentoChat.messageNotSelected') || 'Mensagem não encontrada');
        return
      }

      try {
        this.loadingChatPrivado = true
        const usuario = JSON.parse(localStorage.getItem('usuario'))
        const date = new Date()
        const mensagem = this.mensagemEncaminharChatPrivado

        // Se a mensagem tiver mídia, enviar duas mensagens: texto primeiro, depois mídia
        if (mensagem.mediaUrl && !mensagem.mediaUrl.includes('nullextension')) {
          // 1. Enviar primeira mensagem com informações do ticket (apenas texto)
          const textoInfoTicket = this.formatarCabecalhoTicket()
          if (textoInfoTicket) {
            const mensagemTexto = {
              text: textoInfoTicket,
              timestamp: date.getTime(),
              sender: usuario.userId,
              receiverId: this.usuarioChatPrivadoSelecionado.id,
              tenantId: usuario.tenantId,
              mediaType: 'chat',
              read: false,
              isGroup: false
            }
            await enviarMensagemPrivada(mensagemTexto)
            // Pequeno delay para garantir ordem
            await new Promise(resolve => setTimeout(resolve, 100))
          }

          // 2. Construir URL da mídia (com proxy se necessário)
          const buildProxiedUrl = (u) => {
            try {
              const parsed = new URL(u)
              const path = parsed.pathname + (parsed.search || '')
              if ((process.env.URL_API || '').startsWith('/')) {
                return `${process.env.URL_API}${path}`
              }
              return u
            } catch (e) {
              if (u.startsWith('/public/')) {
                return `${process.env.URL_API}${u}`
              }
              return u
            }
          }
          const mediaUrl = buildProxiedUrl(mensagem.mediaUrl)

          // 3. Fazer download da mídia
          const response = await fetch(mediaUrl, {
            method: 'GET',
            headers: {
              'Origin': window.location.origin,
              'X-Requested-With': 'XMLHttpRequest'
            },
            credentials: 'include'
          })

          if (!response.ok) {
            throw new Error(`Erro ao baixar mídia: ${response.status}`)
          }

          const blob = await response.blob()
          
          // 4. Determinar tipo de mídia e extensão
          let mediaType = 'media'
          let extension = 'file'
          
          if (['image', 'imageMessage', 'sticker'].includes(mensagem.mediaType)) {
            mediaType = 'image'
            extension = mensagem.mediaName?.split('.').pop() || 'jpg'
          } else if (['video', 'videoMessage'].includes(mensagem.mediaType)) {
            mediaType = 'video'
            extension = mensagem.mediaName?.split('.').pop() || 'mp4'
          } else if (['audio', 'audioMessage'].includes(mensagem.mediaType)) {
            mediaType = 'audio'
            extension = mensagem.mediaName?.split('.').pop() || 'mp3'
          } else {
            extension = mensagem.mediaName?.split('.').pop() || 'file'
          }

          // 5. Criar File object
          const fileName = mensagem.mediaName || `arquivo_${Date.now()}.${extension}`
          const file = new File([blob], fileName, { type: blob.type })

          // 6. Preparar FormData para envio da mídia (segunda mensagem)
          const formData = new FormData()
          const uniqueId = `${Date.now()}_media`
          
          formData.append('id', uniqueId)
          formData.append('medias', file)
          // Para a mídia, usar apenas o nome do arquivo ou texto vazio
          const textoMensagem = mensagem.body || mensagem.text || ''
          formData.append('text', textoMensagem.trim() || fileName)
          formData.append('read', false)
          formData.append('isGroup', false)
          formData.append('tenantId', usuario.tenantId)
          formData.append('receiverId', this.usuarioChatPrivadoSelecionado.id)
          formData.append('sender', usuario.userId)
          formData.append('timestamp', date.getTime() + 1) // Timestamp ligeiramente posterior

          await enviarMensagemPrivada(formData)
        } else {
          // Enviar como mensagem de texto simples
          const mensagemData = {
            text: this.formatarTextoMensagemParaChatPrivado(mensagem),
            timestamp: date.getTime(),
            sender: usuario.userId,
            receiverId: this.usuarioChatPrivadoSelecionado.id,
            tenantId: usuario.tenantId,
            mediaType: 'chat',
            read: false,
            isGroup: false
          }

          await enviarMensagemPrivada(mensagemData)
        }
        
        this.$notificarSucesso(
          this.$t('atendimentoChat.messageSentToPrivateChat') || 
          `Mensagem encaminhada para ${this.usuarioChatPrivadoSelecionado.name}`
        )
        
        this.limparModalChatPrivado()
      } catch (error) {
        console.error('Erro ao encaminhar mensagem para chat privado:', error)
        this.$notificarErro(
          this.$t('atendimentoChat.messageFailed') || 
          'Erro ao encaminhar mensagem',
          error
        )
      } finally {
        this.loadingChatPrivado = false
      }
    },
    formatarCabecalhoTicket() {
      let texto = ''
      
      // Adiciona informação sobre o ticket se disponível
      if (this.ticketFocado && this.ticketFocado.id) {
        texto += `📎 Mensagem encaminhada do Ticket #${this.ticketFocado.id}\n`
        if (this.ticketFocado.contact && this.ticketFocado.contact.name) {
          texto += `👤 Contato: ${this.ticketFocado.contact.name}`
        }
      }

      return texto
    },
    formatarTextoMensagemParaChatPrivado(mensagem) {
      let texto = ''
      
      // Adiciona informação sobre o ticket se disponível
      if (this.ticketFocado && this.ticketFocado.id) {
        texto += `📎 Mensagem encaminhada do Ticket #${this.ticketFocado.id}\n`
        if (this.ticketFocado.contact && this.ticketFocado.contact.name) {
          texto += `👤 Contato: ${this.ticketFocado.contact.name}\n`
        }
        texto += '\n'
      }

      // Adiciona o corpo da mensagem (remove formatação HTML se houver)
      let corpoMensagem = ''
      if (mensagem.body) {
        corpoMensagem = mensagem.body
      } else if (mensagem.text) {
        corpoMensagem = mensagem.text
      }
      
      // Remove tags HTML básicas para manter apenas texto
      corpoMensagem = corpoMensagem
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/?[^>]+(>|$)/g, '')
        .trim()
      
      texto += corpoMensagem

      return texto
    },
    abrirModalEncaminharOutroCanal(mensagem) {
      this.mensagemEncaminharOutroCanal = mensagem
      this.contatoSelecionadoOutroCanal = null
      this.canalSelecionado = null
      this.modalEncaminharOutroCanal = true
    },
    limparModalOutroCanal() {
      this.mensagemEncaminharOutroCanal = {}
      this.contatoSelecionadoOutroCanal = null
      this.canalSelecionado = null
      this.modalEncaminharOutroCanal = false
    },
    async confirmarEncaminharOutroCanal() {
      if (!this.canalSelecionado) {
        this.$notificarErro(this.$t('atendimentoChat.channelNotSelected') || 'Selecione um canal');
        return
      }

      if (!this.contatoSelecionadoOutroCanal || !this.contatoSelecionadoOutroCanal.id) {
        this.$notificarErro(this.$t('atendimentoChat.contactNotSelected'));
        return
      }

      if (!this.mensagemEncaminharOutroCanal || !this.mensagemEncaminharOutroCanal.id) {
        this.$notificarErro(this.$t('atendimentoChat.messageNotSelected') || 'Mensagem não encontrada');
        return
      }

      try {
        this.loadingOutroCanal = true
        
        // Encontrar o canal selecionado para obter o tipo
        const canalEscolhido = this.canaisDisponiveis.find(c => c.value === this.canalSelecionado)
        if (!canalEscolhido) {
          this.$notificarErro(this.$t('atendimentoChat.channelNotFound') || 'Canal não encontrado');
          return
        }

        await EncaminharMensagemParaOutroCanal(
          [this.mensagemEncaminharOutroCanal],
          this.contatoSelecionadoOutroCanal,
          canalEscolhido.type,
          this.canalSelecionado
        )
        
        this.$notificarSucesso(
          this.$t('atendimentoChat.messageSentToOtherChannel') || 
          `Mensagem encaminhada para ${this.contatoSelecionadoOutroCanal.name} no canal ${canalEscolhido.label}`
        )
        
        this.limparModalOutroCanal()
      } catch (error) {
        console.error('Erro ao encaminhar mensagem para outro canal:', error)
        this.$notificarErro(
          this.$t('atendimentoChat.messageFailed') || 
          'Erro ao encaminhar mensagem',
          error
        )
      } finally {
        this.loadingOutroCanal = false
      }
    },
  },
  beforeUnmount() {
    // Limpeza completa de memória
    this.cleanupMemory();
    if (this.rootListeners) {
      this.rootListeners.forEach(({ event, handler }) => {
        eventBus.off(event, handler);
      });
      this.rootListeners = [];
    }
  },
  created() {
    this.__offScroll = eventBus.on('scrollToBottomMessageChat', this.scrollToBottom)
    this.socketTicket()
  },
  mounted() {
    this.socketMessagesList()
    eventBus.on('handlerNotifications', this.handlerNotifications);
    if (!this.rootListeners) this.rootListeners = [];
    this.rootListeners.push({ event: 'handlerNotifications', handler: this.handlerNotifications });
  },
  unmounted() {
    try { this.__offScroll && this.__offScroll() } catch (e) {}
  },
}
</script>

<style lang="scss">
audio {
  height: 40px;
  width: 264px;
}

.mostar-btn-opcoes-chat {
  display: none;
  transition: width 2s transform 2s;
}

.q-message-text:hover .mostar-btn-opcoes-chat {
  display: block;
  float: right;
  position: absolute;
  z-index: 999;
}

.hr-text {
  line-height: 1em;
  position: relative;
  outline: 0;
  border: 0;
  color: black;
  text-align: center;
  height: 1.5em;
  opacity: 0.8;

  &:before {
    content: '';
    // use the linear-gradient for the fading effect
    // use a solid background color for a solid bar
    background: linear-gradient(to right, transparent, #818078, transparent);
    position: absolute;
    left: 0;
    top: 50%;
    width: 100%;
    height: 1px;
  }

  &:after {
    content: attr(data-content);
    position: relative;
    display: inline-block;
    color: black;
    font-size: 16px;
    font-weight: 600;
    padding: 0 0.5em;
    line-height: 1.5em;
    background-color: $grey;
    border-radius: 15px;
  }
}

.textContentItem {
  overflow-wrap: break-word;
  // padding: 3px 80px 6px 6px;
}

.textContentItemDeleted {
  font-style: italic;
  color: rgba(0, 0, 0, 0.36);
  overflow-wrap: break-word;
  // padding: 3px 80px 6px 6px;
}

.replyginContactMsgSideColor {
  flex: none;
  width: 4px;
  background-color: #35cd96;
}

.replyginSelfMsgSideColor {
  flex: none;
  width: 4px;
  background-color: #6bcbef;
}

.replyginMsgBody {
  padding: 10;
  height: auto;
  display: block;
  white-space: pre-wrap;
  overflow: hidden;
}

.messageContactName {
  display: flex;
  color: #6bcbef;
  font-weight: 500;
}

.vac-icon-scroll {
  position: absolute;
  bottom: 20px;
  right: 20px;
  box-shadow: 0 1px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14), 0 1px 2px 0 rgba(0, 0, 0, 0.12);
  display: flex;
  cursor: pointer;
  z-index: 99;
}

// /* CSS Logilcs */
// #message-box {
//   &:empty ~ #submit-button {
//     display: none;
//   } /*when textbox empty show microhpone*/
//   &:not(:empty) ~ #voice-button {
//     display: none;
//   } /*when textbox with texy show submit button*/
// }

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter,
.fade-leave-to

/* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
