<template>
  <q-list separator
    style="max-width: 370px"
    class="q-px-sm q-py-none q-pt-sm">
    <!-- :clickable="ticket.status !== 'pending' && (ticket.id !== $store.getters['ticketFocado'].id || $route.name !== 'chat')" -->
    <q-item
      style="height: 95px; max-width: 100%;"
      :style="`border-left: 6px solid ${borderColor[ticket.status]}; border-radius: 8px`"
      id="item-ticket-houve"
      class="ticketBorder q-px-sm"
      :class="{
        'ticketBorderGrey': !$q.dark.isActive,
        'ticket-active-item': ticket.id === $store.getters['ticketFocado'].id,
        'ticketNotAnswered': ticket.answered == false && ticket.isGroup == false && ticket.status == 'open'
      }">
      <q-item-section avatar
        class="q-px-none">
        <q-btn flat
          @click="iniciarAtendimento(ticket)"
          push
          color="primary"
          dense
          round
          v-if="ticket.status === 'pending' || (buscaTicket && ticket.status === 'pending')">
          <q-badge v-if="ticket.unreadMessages"
            style="border-radius: 8px;"
            class="text-center text-bold"
            floating
            dense
            text-color="white"
            color="red"
            :label="ticket.unreadMessages" />
          <q-avatar>
            <q-icon size="50px"
              name="mdi-account-arrow-right" />
          <q-icon size="18px"
            :name="`img:${ticket.channel}-logo.png`"
            class="absolute-top-right channel-icon" />
          </q-avatar>
          <q-tooltip>
            {{ $t('atendimentoItemTicketPainel.labels.atender') }}
          </q-tooltip>
        </q-btn>
        <q-avatar size="50px"
          @click="abrirChatContato(ticket)"
          v-if="ticket.status !== 'pending'"
          class="relative-position blur-effect cursor-pointer">
          <q-badge v-if="ticket.unreadMessages"
            style="border-radius: 8px; z-index: 99"
            class="text-center text-bold"
            floating
            dense
            text-color="white"
            color="red"
            :label="ticket.unreadMessages" />
          <img v-if="ticket.profilePicUrl && ticket.profilePicUrl !== 'null' && ticket.profilePicUrl !== 'undefined'"
            :src="ticket.profilePicUrl"
            :style="usuarioDados?.restrictedUser === 'enabled' ? 'filter: blur(8px);' : ''"
            onerror="this.style.display='none'"
            v-show="ticket.profilePicUrl">
          <q-icon size="50px"
            name="mdi-account-circle"
            color="grey-8" />
          <q-icon size="18px"
            :name="`img:${ticket.channel}-logo.png`"
            class="absolute-top-right channel-icon" />
          <q-tooltip>
            {{ $t('atendimentoItemTicketPainel.labels.atender') }}
          </q-tooltip>
        </q-avatar>

      </q-item-section>
      <q-item-section id="ListItemsTicket" >
        <q-item-label class="text-bold blur-effect"
          lines="1">
          <template v-if="usuarioDados?.restrictedUser === 'enabled'">
            {{ ((!ticket.name ? ticket.contact.name : ticket.name).substring(0, 5)) }}{{ ((!ticket.name ? ticket.contact.name : ticket.name).length > 5 ? '...' : '') }}
          </template>
          <template v-else>
            {{ !ticket.name ? ticket.contact.name : ticket.name }}
          </template>
          <!-- <q-icon size="20px"
            :name="`img:${ticket.channel}-logo.png`" /> -->
          <span class="absolute-top-right q-pr-xs">
            <q-badge dense
              style="font-size: .7em;"
              transparent
              square
              text-color="grey-10"
              color="secondary"
              :label="dataInWords(ticket.lastMessageAt, ticket.updatedAt)"
              :key="recalcularHora" />
          </span>
        </q-item-label>
        <q-item-label lines="1"
          caption>
          {{ ticket.lastMessage }}
        </q-item-label>
        <q-item-label lines="1"
          caption>
          #{{ ticket.id }}
          <q-icon
            v-for="tag in tagsDoTicket" 
            :key="tag.tag"
            :style="{ color: tag.color }" 
            name="mdi-tag"
            size="1.4em"
            class="q-mb-sm">
            <q-tooltip>
              {{tag && tag.tag}}
            </q-tooltip>
          </q-icon>
          <q-icon
            v-for="wallet in walletsDoTicket" 
            :key="wallet.wallet"
            name="mdi-wallet"
            size="1.4em"
            class="q-mb-sm">
            <q-tooltip>
              {{wallet.wallet}}
            </q-tooltip>
          </q-icon>
          <!-- <span class="q-ml-sm text-bold" :style="{ color: (ticket.queue || obterNomeFila(ticket)) ? 'black' : '' }"
          :color="$q.dark.isActive ? 'blue-9' : 'blue-2'"
          > -->
          <span class="q-ml-sm text-bold"
          :color="$q.dark.isActive ? 'white ' : 'black'"
          >
            {{ `${ticket.queue || obterNomeFila(ticket) || ''}` }}
          </span>
          <!-- <span class="q-ml-sm text-bold" :style="{ color: 'black' }">
            Etiquetas:
          </span> -->
          <!-- <q-chip
            v-for="tag in tagsDoTicket" 
            :color="tag.color"
            :key="tag.tag" 
            dense
            square
            :label="tag && tag.tag"
            size="10px"
            class="q-mr-md text-bold" /> -->
          <span class="absolute-bottom-right ">
            <q-icon v-if="ticket.status === 'closed'"
              name="mdi-check-circle-outline"
              color="positive"
              size="1.8em"
              class="q-mb-sm">
              <q-tooltip>
                {{ $t('atendimentoItemTicketPainel.labels.atendimentoResolvido') }}
              </q-tooltip>
            </q-icon>
            <q-icon
              v-if="(ticket.stepAutoReplyId && ticket.autoReplyId && ticket.status === 'pending') || (ticket.chatFlowId && ticket.stepChatFlow && ticket.status === 'pending')"
              name="mdi-robot"
              color="primary"
              size="1.8em"
              class="q-mb-sm">
              <q-tooltip>
                {{ $t('atendimentoItemTicketPainel.labels.chatbotAtendendo') }}
              </q-tooltip>
            </q-icon>
          </span>
        </q-item-label>
        <q-item-label class="row col items-center justify-between"
          caption>
          {{ $t('atendimentoItemTicketPainel.labels.usuario', { nomeUsuario: ticket?.user?.name || '' }) }}
          <!-- Usuário: {{ ticket.username || '' }} -->
          <q-chip :color="$q.dark.isActive ? 'blue-9' : 'blue-2'"
            v-if="ticket.whatsappId"
            dense
            square
            :label="ticket.whatsapp && ticket.whatsapp.name"
            size="10px"
            class="q-mr-md text-bold" />
        </q-item-label>
        <!-- <span class="absolute-bottom-right" v-if="ticket.unreadMessages">
          <q-badge style="font-size: .8em; border-radius: 8px;" class="q-py-xs" dense text-color="white" color="green" :label="ticket.unreadMessages" />
        </span> -->
        <q-dialog v-model="isTicketModalOpen" @show="scrollToBottom">
          <q-card :style="cardStyle">
            <q-card-section class="row items-center justify-between">
              <div class="text-h6">
                {{ $t('atendimentoItemTicketPainel.labels.espiarAtendimento', {
                idTicket: currentTicket.id
              }) }}
              </div>
              <!-- <div class="text-h6">{{ 'Espiar Atendimento: ' + currentTicket.id}}</div> -->
              <q-btn icon="close" flat round @click="isTicketModalOpen = false" />
            </q-card-section>
            <q-card-section>
              <MensagemChat :mensagens="currentTicket.messages" />
            </q-card-section>
          </q-card>
        </q-dialog>
        </q-item-section>
        <q-item-section avatar
        class="q-px-none">
        <q-btn flat
          @click="espiarAtendimentoPainel(ticket)"
          push
          color="primary"
          dense
          round
          class="q-mr-md">
          <q-badge v-if="ticket.unreadMessages"
            style="border-radius: 8px;"
            class="text-center text-bold"
            floating
            dense
            text-color="black"
            color="blue-2"
            :label="ticket.unreadMessages" />
          <q-avatar>
            <q-icon size="20px"
              name="mdi-eye-outline" />
          </q-avatar>
          <q-tooltip>
            {{ $t('atendimentoItemTicketPainel.labels.espirar') }}
          </q-tooltip>
        </q-btn>

        <span class="absolute-bottom-right" v-if="!ticket.whatsappId">
          <q-badge style="font-size: .8em; border-radius: 8px; margin: 3px" class="q-py-xs" dense text-color="white" color="red" 
          :label="$t('atendimentoItemTicketPainel.labels.canalRemovido')" 
          />
        </span>
      </q-item-section>
    </q-item>
    <q-separator color="grey-2"
      inset="item" />
    <!-- <q-separator /> -->
  </q-list>
</template>

<script>
import { formatDistance, parseJSON } from 'date-fns'
import pt from 'date-fns/locale/pt-BR'
import mixinAtualizarStatusTicket from './mixinAtualizarStatusTicket.js'
import { outlinedAccountCircle } from '@quasar/extras/material-icons-outlined'
// import { GetColorName } from 'hex-color-to-color-name';
import { ObterContato } from 'src/service/contatos.js'
import MensagemChat from './MensagemChat.vue'
import Chat from './Chat/Chat.vue'
import whatsBackground from 'src/assets/wa-background.png'
import whatsBackgroundDark from 'src/assets/wa-background-dark.jpg'
import eventBus from 'src/utils/eventBus.js'

export default {
  name: 'ItemTicket',
  mixins: [mixinAtualizarStatusTicket],
  components: {
    MensagemChat,
    Chat
  },
  data () {
    return {
      usuarioDados: null,
      whatsBackground: whatsBackground,
      whatsBackgroundDark: whatsBackgroundDark,
      isTicketModalOpen: false,
      currentTicket: {},
      tagsDoTicket: [],
      walletsDoTicket: [],
      // colorName: null,
      outlinedAccountCircle,
      recalcularHora: 0,
      horaIntervalId: null, // Adicionar referência para o interval
      // Sistema de gerenciamento de memória
      timers: [],
      statusAbreviado: {
        open: 'A',
        pending: 'P',
        closed: 'R'
      },
      status: {
        open: this.$t('atendimentoItemTicketPainel.status.aberto'),
        pending: this.$t('atendimentoItemTicketPainel.status.pendente'),
        closed: this.$t('atendimentoItemTicketPainel.status.resolvido'),
      },
      color: {
        open: 'primary',
        pending: 'negative',
        closed: 'positive'
      },
      borderColor: {
        open: 'primary',
        pending: 'negative',
        closed: 'positive'
      },
    }
  },
  computed: {
    cardStyle() {
      return {
        backgroundImage: this.$q.dark.isActive ? `url(${this.whatsBackgroundDark})` : `url(${this.whatsBackground})`
      };
    }
  },
  props: {
    ticket: {
      type: Object,
      default: () => {
      }
    },
    buscaTicket: {
      type: Boolean,
      default: false
    },
    filas: {
      type: Array,
      default: () => []
    },
    etiquetas: {
      type: Array,
      default: () => []
    },
  },
  async mounted() {
    if (this.ticket && this.ticket.contactId) {
      const informacoes = await this.obterInformacoes(this.ticket);
      this.tagsDoTicket = informacoes.tags;
      this.walletsDoTicket = informacoes.wallets;
    }
    
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
  },
  methods: {
    // Sistema de gerenciamento de memória
    addTimer(timerId) {
      this.timers.push(timerId);
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
    obterNomeFila (ticket) {
      try {
        const fila = this.filas.find(f => f.id === ticket.queueId)
        if (fila) {
          return fila.queue
        }
        return ''
      } catch (error) {
        return ''
      }
    },
    async obterInformacoes(ticket) {
      try {
        if (!ticket || !ticket.contactId) {
          console.warn(this.$t('atendimentoItemTicketPainel.errors.ticketInvalido'));
          return { tags: [], wallets: [] };
        }

        const contato = await ObterContato(ticket.contactId);
        if (contato) {
          return {
            tags: contato.data.tags.map(tag => ({ tag: tag.tag, color: tag.color })),
            wallets: contato.data.wallets.map(wallet => ({ wallet: wallet.name }))
          };
        }
        return { tags: [], wallets: [] };
      } catch (error) {
        console.error(this.$t('atendimentoItemTicketPainel.errors.erroInformacoes', {
          erro: error.message,
        }));
        return { tags: [], wallets: [] };
      }
    },
    dataInWords (timestamp, updated) {
      let data = parseJSON(updated)
      if (timestamp) {
        data = new Date(Number(timestamp))
      }
      return formatDistance(data, new Date(), { locale: pt })
    },
    abrirChatContato (ticket) {
      // caso esteja em um tamanho mobile, fechar a drawer dos contatos
      if (this.$q.screen.lt.md && ticket.status !== 'pending') {
        eventBus.emit('infor-cabecalo-chat:acao-menu')
      }
      if (!(ticket.status !== 'pending' && (ticket.id !== this.$store.getters.ticketFocado.id || this.$route.name !== 'chat'))) return
      this.$store.commit('SET_HAS_MORE', true)
      this.$store.dispatch('AbrirChatMensagens', ticket)
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const dialogContent = document.querySelector('.q-dialog__inner > div');
        if (dialogContent) {
          dialogContent.scrollTop = dialogContent.scrollHeight;
        }
      });
    }
  },
  created () {
    this.horaIntervalId = setInterval(() => {
      this.recalcularHora++
    }, 20000)
    this.addTimer(this.horaIntervalId);
  },
  beforeUnmount() {
    // Limpeza completa de memória
    this.cleanupMemory();
  }
}
</script>

<style lang="sass">
img:after
  content: ""
  vertical-align: middle
  display: inline-block
  border-radius: 50%
  font-size: 48px
  position: absolute
  top: 0
  left: 0
  width: inherit
  height: inherit
  z-index: 10
  color: transparent

.ticket-active-item
  border-radius: 0
  position: relative
  height: 100%
  background: $blue-1

#ListItemsTicket
  .q-item__label + .q-item__label
    margin-top: 1.5px

#item-ticket-houve:hover
  background: $blue-1
  transition: all .2s

.primary
  border-left: 3px solid $primary
.negative
  border-left: 3px solid $negative
.positive
  border-left: 3px solid $positive

.ticketNotAnswered
  border-left: 5px solid $warning !important

.ticketBorder
  border-left: 5px solid $grey-9

.ticketBorderGrey
  border-left: 5px solid $grey-4

.blur-effect 
  filter: blur(0px)

.channel-icon
  position: absolute
  top: -5px
  right: -5px
  background: white
  border-radius: 50%
  padding: 2px

// Estilo para o scroll do dialog
.q-dialog__inner > div::-webkit-scrollbar
  width: 8px
  background-color: rgba(0, 0, 0, 0.1)

.q-dialog__inner > div::-webkit-scrollbar-thumb
  background-color: $primary
  border-radius: 4px

.q-dialog__inner > div::-webkit-scrollbar-track
  background-color: rgba(0, 0, 0, 0.05)
</style>
