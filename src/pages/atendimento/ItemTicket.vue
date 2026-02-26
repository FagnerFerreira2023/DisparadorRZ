<template>
  <q-list separator
    style="max-width: 370px"
    class="q-px-sm q-py-none q-pt-sm">
    <!-- :clickable="ticket.status !== 'pending' && (ticket.id !== $store.getters['ticketFocado'].id || $route.name !== 'chat')" -->
      <q-item clickable
      style="height: 125px; max-width: 100%;"
      @click="() => { if (!modoSelecao) { abrirChatContato(ticket); marcarComoLido(ticket) } }"
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
        <q-checkbox
          v-if="modoSelecao"
          v-model="selecionado"
          @update:model-value="atualizarSelecao"
          class="q-mr-sm"
          color="primary"
        />
        <q-btn flat
          @click="iniciarAtendimento(ticket)"
          push
          color="primary"
          dense
          round
          v-if="(ticket.status === 'pending' || (buscaTicket && ticket.status === 'pending')) && !modoSelecao">
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
          <!-- <q-icon size="18px"
            :name="`img:${ticket.channel}-logo.png`"
            class="absolute-top-right channel-icon" /> -->
          </q-avatar>
          <q-tooltip>
            {{ $t('atendimentoItemTicket.labels.atender') }}
          </q-tooltip>
        </q-btn>
        <q-avatar size="50px"
          v-if="ticket.status !== 'pending'"
          class="relative-position">
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
            class="blur-effect"
            :style="usuarioDados?.restrictedUser === 'enabled' ? 'filter: blur(8px);' : ''"
            onerror="this.style.display='none'"
            @error="handleImageError(ticket)">
          <q-icon size="50px"
            name="mdi-account-circle"
            color="grey-8" />
          <q-icon size="18px"
            :name="`img:${ticket.channel}-logo.png`"
            class="absolute-top-right channel-icon" />
        </q-avatar>

      </q-item-section>
      <q-item-section id="ListItemsTicket" >
        <q-item-label class="text-bold blur-effect"
          lines="1">
          <template v-if="usuarioDados?.restrictedUser === 'enabled'">
            {{ ((!ticket.name || ticket.name === '' ? (ticket?.contact?.name || ticket?.contact?.number || 'Sem Nome') : (ticket?.name || 'Sem Nome')).substring(0, 5)) }}{{ ((!ticket.name || ticket.name === '' ? (ticket?.contact?.name || ticket?.contact?.number || 'Sem Nome') : (ticket?.name || 'Sem Nome')).length > 5 ? '...' : '') }}
          </template>
          <template v-else>
            {{ !ticket.name || ticket.name === '' ? (ticket?.contact?.name || ticket?.contact?.number || 'Sem Nome') : (ticket?.name || 'Sem Nome') }}
          </template>
          <q-icon size="20px" v-if="ticket.status === 'pending' || (buscaTicket && ticket.status === 'pending')"
            :name="`img:${ticket.channel}-logo.png`" />
          <q-item-label caption style="display: block;">
            <q-badge 
            dense 
            transparent 
            square :label="dataInWords(ticket.lastMessageAt, ticket.updatedAt)" 
            :key="recalcularHora" 
            text-color="grey-10"
            color="secondary"
            />
          </q-item-label>
          <!-- <span class="absolute-top-right q-pr-xs">
            <q-badge dense
              style="font-size: .7em;"
              transparent
              square
              text-color="grey-10"
              color="secondary"
              :label="dataInWords(ticket.lastMessageAt, ticket.updatedAt)"
              :key="recalcularHora" />
          </span> -->
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
          <q-icon
            v-if="ticket.kanban"
            :key="ticket.kanban"
            name="mdi-developer-board"
            size="1.4em"
            class="q-mb-sm">
            <q-tooltip>
              {{ $t('atendimentoItemTicket.labels.kanban', { kanbanName: ticket.kanban }) }}
              <!-- Kanban:
              {{ ticket.kanban }} -->
            </q-tooltip>
          </q-icon>
          <q-chip
            v-if="mostrarHumanAgent"
            color="primary"
            dense
            square
            label="Human Agent"
            size="10px"
            class="q-mr-md text-bold" />
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
                {{ $t('atendimentoItemTicket.labels.atendimentoResolvido') }}
              </q-tooltip>
            </q-icon>
            <q-icon
              v-if="(ticket.stepAutoReplyId && ticket.autoReplyId && ticket.status === 'pending') || (ticket.chatFlowId && ticket.stepChatFlow && ticket.status === 'pending') || (ticket.chatFlowId && ticket.status === 'pending')"
              name="mdi-robot"
              color="primary"
              size="1.8em"
              class="q-mb-sm">
              <q-tooltip>
                {{ $t('atendimentoItemTicket.labels.chatbotAtendendo') }}
              </q-tooltip>
            </q-icon>
          </span>
        </q-item-label>
        <q-item-label class="row col items-center justify-between"
          caption>
          {{ $t('atendimentoItemTicket.labels.usuario', { username: ticket.username || '' }) }}
          <!-- Usuário: {{ ticket.username || '' }} -->
        </q-item-label>
        <q-item-label class="row col items-center justify-end"
          caption>
          <q-chip :color="$q.dark.isActive ? '$primary' : 'blue-2'"
            dense
            square
            :label="ticket.whatsapp && ticket.whatsapp.name"
            size="10px"
            class="q-mr-md text-bold" />
        </q-item-label>
        <!-- <span class="absolute-bottom-right" v-if="ticket.unreadMessages">
          <q-badge style="font-size: .8em; border-radius: 8px;" class="q-py-xs" dense text-color="white" color="green" :label="ticket.unreadMessages" />
        </span> -->
        </q-item-section>
        <q-item-section avatar
        class="q-px-none">
        <q-btn flat
          @click="espiarAtendimentoPainel(ticket)"
          push
          color="primary"
          dense
          round
          v-if="(!$q.screen.xs && (ticket.status === 'pending' || (buscaTicket && ticket.status === 'pending'))) && controlFeatures && !modoSelecao"
          class="q-mr-md">
          <q-dialog v-model="isTicketModalOpen" @show="scrollToBottom">
            <q-card :style="cardStyle">
              <q-card-section class="row items-center justify-between">
                <div class="text-h6">{{ $t('atendimentoItemTicket.labels.espiarAtendimento', { id: currentTicket.id }) }}</div>
                <q-btn icon="close" flat round @click="closeModal" />
              </q-card-section>
              <q-card-section>
                <MensagemChat :mensagens="currentTicket.messages" />
              </q-card-section>
            </q-card>
          </q-dialog>
          <!-- <q-badge v-if="ticket.unreadMessages"
            style="border-radius: 8px;"
            class="text-center text-bold"
            floating
            dense
            text-color="black"
            color="blue-2"
            :label="ticket.unreadMessages" /> -->
          <q-avatar>
            <q-icon size="20px"
              name="mdi-eye-outline" />
          </q-avatar>
          <q-tooltip>
             {{ $t('atendimentoItemTicket.labels.espiar')}}
          </q-tooltip>
        </q-btn>

        <q-btn flat
          @click="espiarAtendimentoPainel(ticket)"
          push
          color="primary"
          dense
          round
          v-if="($q.screen.xs && (ticket.status === 'pending' || (buscaTicket && ticket.status === 'pending'))) && controlFeatures && !modoSelecao"
          class="q-mr-md">
          <q-dialog v-model="isTicketModalOpen">
            <q-card :style="cardStyle">
              <q-card-section class="row items-center justify-between">
                <div class="text-h6">
                  {{ $t('atendimentoItemTicket.labels.espiarAtendimento', { id: currentTicket.id }) }}
                </div>
                <!-- <div class="text-h6">{{ 'Espiar Atendimento: ' + currentTicket.id}}</div> -->
                <q-btn icon="close" flat round @click="closeModal" />
              </q-card-section>
              <q-card-section>
                <MensagemChat :mensagens="currentTicket.messages" />
              </q-card-section>
            </q-card>
          </q-dialog>
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
            {{ $t('atendimentoItemTicket.labels.espiar')}}
          </q-tooltip>
        </q-btn>

        <q-btn flat
          @click="fecharTicket(ticket)"
          push
          color="primary"
          dense
          round
          v-if="(!$q.screen.xs && (ticket.status === 'open' || (buscaTicket && ticket.status === 'open'))) && controlFeatures && !modoSelecao"
          class="q-mr-md">
          <q-avatar>
            <q-icon size="20px"
              name="mdi-close-circle-outline" />
          </q-avatar>
          <q-tooltip>
            {{ $t('atendimentoItemTicket.labels.fecharTicketSemDespedida') }}
          </q-tooltip>
        </q-btn>

        <q-btn flat
          @click="fecharTicket(ticket)"
          push
          color="primary"
          dense
          round
          v-if="($q.screen.xs && (ticket.status === 'open' || (buscaTicket && ticket.status === 'open'))) && controlFeatures && !modoSelecao"
          class="q-mr-md">
          <q-avatar>
            <q-icon size="20px"
              name="mdi-close-circle-outline" />
          </q-avatar>
          <q-tooltip>
            {{ $t('atendimentoItemTicket.labels.forcarFechamento') }}
          </q-tooltip>
        </q-btn>

        <!-- <span class="absolute-bottom-right" v-if="ticket.unreadMessages">
          <q-badge style="font-size: .8em; border-radius: 8px;" class="q-py-xs" dense text-color="white" color="green" :label="ticket.unreadMessages" />
        </span> -->
      </q-item-section>
    </q-item>
    <!-- <q-separator color="grey-2"
      inset="item" /> -->
    <!-- <q-separator /> -->
  </q-list>
</template>

<script>
import { formatDistance, parseJSON } from 'date-fns'
import pt from 'date-fns/locale/pt-BR'
import mixinAtualizarStatusTicket from './mixinAtualizarStatusTicket.js'
import { outlinedAccountCircle } from '@quasar/extras/material-icons-outlined'
// import { GetColorName } from 'hex-color-to-color-name';
import { ObterContato, RemoverFotoNula } from 'src/service/contatos.js'
// import { ListarKanbans } from 'src/service/kanban'
import MensagemChat from './MensagemChat.vue'
import whatsBackground from 'src/assets/wa-background.png'
import { AtualizarTicketNaoLido, SendPausedIndicator } from 'src/service/tickets.js'
import whatsBackgroundDark from 'src/assets/wa-background-dark.jpg'
import eventBus from 'src/utils/eventBus.js'

export default {
  name: 'ItemTicket',
  mixins: [mixinAtualizarStatusTicket],
  components: {
    MensagemChat
  },
  data () {
    return {
      controlFeatures: false,
      userProfile: 'user',
      usuarioDados: null,
      selecionado: false,
      whatsBackground: whatsBackground,
      whatsBackgroundDark: whatsBackgroundDark,
      isTicketModalOpen: false,
      kanbans: [],
      currentTicket: {},
      tagsDoTicket: [],
      walletsDoTicket: [],
      // colorName: null,
      outlinedAccountCircle,
      recalcularHora: 1,
      // Sistema de gerenciamento de memória
      timers: [],
      // Cache para informações de contatos (evita múltiplas requisições)
      contatosCache: new Map(),
      cacheTTL: 1 * 60 * 1000, // 1 minuto em milissegundos
      pendingRequests: new Map(), // Requisições pendentes para evitar duplicatas
      debounceTimers: new Map(), // Timers de debounce para agrupar requisições
      DEBOUNCE_DELAY: 500, // 500ms de debounce para obterInformacoes (otimizado para reduzir carga)
      statusAbreviado: {
        open: 'A',
        pending: 'P',
        closed: 'R'
      },
      status: {
        open: this.$t('atendimentoItemTicket.status.aberto'),
        pending: this.$t('atendimentoItemTicket.status.pendente'),
        closed: this.$t('atendimentoItemTicket.status.resolvido'),
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
      isMessageSending: false, // Estado para rastrear se uma mensagem está sendo enviada
      loadingChangeHandler: null, // Handler para remover o listener do eventBus
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
    modoSelecao: {
      type: Boolean,
      default: false
    },
    isSelecionado: {
      type: Boolean,
      default: false
    },
  },
  computed: {
    cardStyle() {
      return {
        backgroundImage: this.$q.dark.isActive ? `url(${this.whatsBackgroundDark})` : `url(${this.whatsBackground})`
      };
    },
    mostrarHumanAgent() {
      // Só mostra se for Instagram ou Messenger, input desabilitado e última mensagem dentro de 7 dias
      if ((this.ticket.channel !== 'instagram' && this.ticket.channel !== 'messenger')) {
        return false;
      }
      
      // Verifica se o input estaria desabilitado (última mensagem há mais de 24 horas)
      if (this.ticket.channel === 'webmail' || this.ticket.channel === 'hub_email') {
        return false; // Para webmail e hub_email, não mostra human agent
      }
      
      if (!this.ticket.lastMessageReceived) {
        return false;
      }
      
      const agora = new Date();
      const ultimaMensagem = new Date(Number(this.ticket.lastMessageReceived));
      const diferencaEmHoras = (agora.getTime() - ultimaMensagem.getTime()) / (1000 * 60 * 60);
      
      // Input desabilitado quando última mensagem há mais de 24 horas
      if (diferencaEmHoras <= 24) {
        return false;
      }
      
      // Verifica se está dentro de 7 dias
      const diferencaEmDias = diferencaEmHoras / 24;
      return diferencaEmDias <= 7;
    },
  },
  watch: {
    isSelecionado(newValue) {
      this.selecionado = newValue;
    }
  },
  async mounted() {
    // await this.listarKanbans()
    this.userProfile = localStorage.getItem('profile')
    const featuresAllow = JSON.parse(localStorage.getItem('controlFeatures')) || 'disabled';
    if(featuresAllow === 'enabled' && this.userProfile === 'user'){
      this.controlFeatures = false;
    } else {
      this.controlFeatures = true;
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

    if (this.ticket && this.ticket.contactId) {
      const informacoes = await this.obterInformacoes(this.ticket);
      this.tagsDoTicket = informacoes.tags;
      this.walletsDoTicket = informacoes.wallets;
    }

    this.$store.subscribe(async (mutation, state) => {
      if (mutation.type === 'UPDATE_CONTACT' && mutation.payload.id === this.ticket?.contactId) {
        const informacoes = await this.obterInformacoes(this.ticket);
        this.tagsDoTicket = informacoes.tags;
        this.walletsDoTicket = informacoes.wallets;
      }
    });

    // Escutar eventos de mudança de estado de loading do InputMensagem
    this.loadingChangeHandler = (isLoading) => {
      this.isMessageSending = isLoading;
    };
    eventBus.on('input-mensagem:loading-changed', this.loadingChangeHandler);
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
    atualizarSelecao(value) {
      this.$emit('toggle-selecao', this.ticket.id, value);
    },
    async handleImageError(){
      if(!this.ticket.contactId) return
      try {
        await RemoverFotoNula(this.ticket.contactId)
      } catch (error) {
        console.error(this.$t('atendimentoItemTicket.errors.erroRemoverFoto'), error);
      }
    },
    closeModal() {
      this.isTicketModalOpen = false;
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const dialogContent = document.querySelector('.q-dialog__inner > div');
        if (dialogContent) {
          dialogContent.scrollTop = dialogContent.scrollHeight;
        }
      });
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
    // async listarKanbans(){
    //   const { data } = await ListarKanbans();
    //   this.kanbans = data.kanban;
    // },
    // getKanbanName(kanbanId) {
    //   const kanban = this.kanbans.find(k => k.id === kanbanId);
    //   return kanban ? kanban.name : '';
    // },
    async obterInformacoes(ticket) {
      try {
        if (!ticket || !ticket.contactId) {
          console.warn(this.$t('atendimentoItemTicket.errors.ticketInvalido'));
          return { tags: [], wallets: [] };
        }

        const contactId = ticket.contactId;
        const cacheKey = `contact_${contactId}`;
        
        // 1. Verificar cache primeiro (mais rápido)
        const cached = this.contatosCache.get(cacheKey);
        if (cached) {
          const now = Date.now();
          // Se o cache ainda é válido (não expirou), retornar dados em cache
          if (now - cached.timestamp < this.cacheTTL) {
            return cached.data;
          } else {
            // Cache expirado, remover
            this.contatosCache.delete(cacheKey);
          }
        }

        // 2. Verificar se já existe uma requisição pendente para este contato
        // Isso evita múltiplas requisições simultâneas para o mesmo contato
        if (this.pendingRequests.has(contactId)) {
          // Aguardar a requisição pendente
          return await this.pendingRequests.get(contactId);
        }

        // 3. Aplicar debounce para agrupar requisições próximas
        // Limpar timer anterior se existir
        if (this.debounceTimers.has(contactId)) {
          clearTimeout(this.debounceTimers.get(contactId));
        }

        // 4. Criar nova requisição com debounce e armazenar como pendente
        const requestPromise = new Promise((resolve, reject) => {
          const timerId = setTimeout(async () => {
            try {
              const contato = await ObterContato(contactId);
              let result = { tags: [], wallets: [] };
              
              if (contato && contato.data) {
                result = {
                  tags: (contato.data.tags || []).map(tag => ({ tag: tag.tag, color: tag.color })),
                  wallets: (contato.data.wallets || []).map(wallet => ({ wallet: wallet.name }))
                };
              }
              
              // Armazenar no cache
              this.contatosCache.set(cacheKey, {
                data: result,
                timestamp: Date.now()
              });
              
              // Limpar timer e requisição pendente
              this.debounceTimers.delete(contactId);
              this.pendingRequests.delete(contactId);
              
              resolve(result);
            } catch (error) {
              console.error('Erro ao obter informações do contato:', error);
              // Limpar timer e requisição pendente mesmo em caso de erro
              this.debounceTimers.delete(contactId);
              this.pendingRequests.delete(contactId);
              resolve({ tags: [], wallets: [] }); // Retornar vazio em caso de erro
            }
          }, this.DEBOUNCE_DELAY);

          // Armazenar timer
          this.debounceTimers.set(contactId, timerId);
        });

        // Armazenar a promise para que outras chamadas possam aguardar
        this.pendingRequests.set(contactId, requestPromise);
        
        return await requestPromise;
      } catch (error) {
        console.error('Erro ao obter informações do contato:', error);
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
    async marcarComoLido(ticket){
      try {
        if (ticket.status === 'open') {
          await AtualizarTicketNaoLido(ticket.id, 0)
        }
      } catch (error) {
        console.error(error);
      }
    },
    atualizarSelecao(value) {
      this.$emit('toggle-selecao', this.ticket.id, value);
    },
    async abrirChatContato (ticket) {
      // Verificar se há uma mensagem sendo enviada antes de permitir mudança de ticket
      if (this.isMessageSending) {
        this.$q.notify({
          message: this.$t('atendimentoItemTicket.notifications.aguardeEnvio') || 'Aguarde o envio da mensagem antes de mudar de ticket',
          type: 'warning',
          position: 'top',
          timeout: 3000
        });
        return;
      }

      // Envia pause para o ticket atual antes de mudar (se estiver digitando)
      const ticketAtual = this.$store.getters.ticketFocado;
      if (ticketAtual && ticketAtual.id && ticketAtual.id !== ticket.id) {
        const channelType = ticketAtual.whatsapp?.type || ticketAtual.channel;
        const isSupportedChannel = channelType === 'whatsapp' || 
                                   channelType === 'baileys' || 
                                   channelType === 'evo' || 
                                   channelType === 'meow';
        
        if (isSupportedChannel) {
          try {
            await SendPausedIndicator(ticketAtual.id, {state: 'paused', ticket: ticketAtual});
          } catch (error) {
            console.error('Erro ao enviar pause:', error);
          }
        }
      }
      
      // caso esteja em um tamanho mobile, fechar a drawer dos contatos
      if (this.$q.screen.lt.md && ticket.status !== 'pending') {
        eventBus.emit('infor-cabecalo-chat:acao-menu')
      }
      if (!(ticket.status !== 'pending' && (ticket.id !== this.$store.getters.ticketFocado.id || this.$route.name !== 'chat'))) {
        return;
      }
      this.$store.commit('SET_HAS_MORE', true)
      this.$store.dispatch('AbrirChatMensagens', ticket)
    }
  },
  created() {
  const atualizarHora = () => {
    this.recalcularHora++;
    const timerId = setTimeout(() => requestAnimationFrame(atualizarHora), 20000);
    this.addTimer(timerId);
  };
  atualizarHora();
},
beforeUnmount() {
  // Limpeza completa de memória
  this.cleanupMemory();
  // Limpar requisições pendentes
  this.pendingRequests.clear();
  // Limpar timers de debounce
  this.debounceTimers.forEach(timer => clearTimeout(timer));
  this.debounceTimers.clear();
  // Limpar cache (opcional - pode manter para reutilização entre componentes)
  // this.contatosCache.clear();
  // Remover listener do eventBus
  if (this.loadingChangeHandler) {
    eventBus.off('input-mensagem:loading-changed', this.loadingChangeHandler);
  }
}

  // created () {
  //   setInterval(() => {
  //     this.recalcularHora++
  //   }, 20000)
  // }
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

// Estilo para o scroll do dialog
.q-dialog__inner > div::-webkit-scrollbar
  width: 8px
  background-color: rgba(0, 0, 0, 0.1)

.q-dialog__inner > div::-webkit-scrollbar-thumb
  background-color: $primary
  border-radius: 4px

.q-dialog__inner > div::-webkit-scrollbar-track
  background-color: rgba(0, 0, 0, 0.05)

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

.channel-icon
  position: absolute
  top: 30px
  right: -5px
  background: white
  border-radius: 50%
  padding: 2px

</style>
