<template>
  <q-dialog v-model="modalOpen" persistent ref="buscarMensagensDialog">
    <q-card style="width: 500px; max-width: 90vw;">
      <q-card-section>
        <div class="text-h6">{{ $t('buscarMensagemModal.title') }}</div>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="searchTerm"
          :label="$t('buscarMensagemModal.searchPlaceholder')"
          filled
          @keyup.enter="buscarMensagens"
        />
      </q-card-section>

      <q-card-section
        class="scroll custom-scrollbar"
        style="max-height: 300px; overflow-y: auto;"
        ref="scrollContainer"
        @scroll="handleScroll"
        v-if="tickets?.length"
      >
        <q-list bordered separator>
          <q-item
            v-for="(ticketObj, index) in uniqueTickets"
            :key="`${ticketObj.ticket.id}-${ticketObj.lastMessageTimestamp || index}`"
            v-if="ticketObj.ticket.whatsappId"
            
          >
            <q-item-section>
              <q-item-label>{{ $t('buscarMensagemModal.atendimento') }}{{ ticketObj.ticket.id }}</q-item-label>
              <q-item-label caption>
                {{ $t('buscarMensagemModal.messageDate') }}{{ formatTimestamp(ticketObj.lastMessageTimestamp) }}
              </q-item-label>
              <q-item-label caption>
                {{ $t('buscarMensagemModal.channel') }} #{{ ticketObj.ticket.whatsappId }} - {{ ticketObj.ticket.channel || $t('buscarMensagemModal.unknown') }}
              </q-item-label>
              <q-item-label caption>
                {{ $t('buscarMensagemModal.status') }}{{ formatStatus(ticketObj.ticket.status) }}
              </q-item-label>
              <q-item-label caption>
                {{ $t('buscarMensagemModal.group') }}{{ formatIsGroup(ticketObj.ticket.isGroup) }}
              </q-item-label>
              <q-item-label caption>
                {{ $t('buscarMensagemModal.lastMessage') }}{{ ticketObj.ticket.lastMessage || $t('buscarMensagemModal.noMessages') }}
              </q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-btn flat
                @click="espiarAtendimentoPainel(ticketObj.ticket)"
                push
                color="primary"
                dense
                round
                class="q-mr-md">
                <q-avatar>
                  <q-icon size="20px"
                    name="mdi-eye-outline" />
                </q-avatar>
                <q-tooltip>
                  {{ $t('atendimentoItemTicketPainel.labels.espirar') }}
                </q-tooltip>
              </q-btn>
              <q-btn flat
                @click="irParaTicket(ticketObj.ticket)"
                push
                color="primary"
                dense
                round
                class="q-mr-md">
                <q-avatar>
                  <q-icon size="20px"
                    name="arrow_forward" />
                </q-avatar>
                <q-tooltip>
                  {{ $t('atendimentoItemTicketPainel.labels.atender') }} 
                </q-tooltip>
              </q-btn>
            </q-item-section>
          </q-item>
        </q-list>

        <div v-if="loadingMore" class="text-center q-pa-md">
          <q-spinner-dots size="40px" color="primary" />
          <p>{{ $t('buscarMensagemModal.loadingMoreMessages') }}</p>
        </div>
      </q-card-section>

      <q-card-section class="text-center" v-if="loading && pageNumber === 1">
        <q-spinner-dots size="40px" color="primary" />
        <p>{{ $t('buscarMensagemModal.loadingMessages') }}</p>
      </q-card-section>

      <q-card-actions align="right" class="q-gutter-sm">
        <q-btn
          :label="$t('buscarMensagemModal.searchButton')"
          color="primary"
          @click="buscarMensagens"
          :disable="loading || !searchTerm"
          push
          rounded
          class="text-uppercase"
        />
        <q-btn flat v-close-popup :label="$t('buscarMensagemModal.closeButton')" color="negative" @click="closeModal" class="text-uppercase" />
      </q-card-actions>
    </q-card>

    <q-dialog v-model="isTicketModalOpen" @show="scrollToBottom">
      <q-card :style="cardStyle">
        <q-card-section class="row items-center justify-between">
          <div class="text-h6">
            {{ $t('atendimentoItemTicketPainel.labels.espiarAtendimento', {
            idTicket: currentTicket.id
          }) }}
          </div>
          <q-btn icon="close" flat round @click="isTicketModalOpen = false" />
        </q-card-section>
        <q-card-section>
          <MensagemChat :mensagens="currentTicket.messages" />
        </q-card-section>
      </q-card>
    </q-dialog>
    
  </q-dialog>
</template>

<script>
import eventBus from 'src/utils/eventBus.js'
import { BuscarMensagensPorBody } from "src/service/tickets.js";
import MensagemChat from './MensagemChat.vue'
import Chat from './Chat/Chat.vue'
import mixinAtualizarStatusTicket from './mixinAtualizarStatusTicket.js'
import whatsBackground from 'src/assets/wa-background.png'
import whatsBackgroundDark from 'src/assets/wa-background-dark.jpg'

export default {
  props: {
    value: Boolean
  },
  mixins: [mixinAtualizarStatusTicket],
  components: {
    MensagemChat,
    Chat
  },
  data() {
    return {
      currentTicket: {},
      whatsBackground: whatsBackground,
      whatsBackgroundDark: whatsBackgroundDark,
      isTicketModalOpen: false,
      searchTerm: "",
      tickets: [],
      loading: false,
      loadingMore: false,
      pageNumber: 1,
      hasMore: false
    };
  },
  computed: {
    cardStyle() {
      return {
        backgroundImage: this.$q.dark.isActive ? `url(${this.whatsBackgroundDark})` : `url(${this.whatsBackground})`
      };
    },
    modalOpen: {
      get() {
        return this.value;
      },
      set(val) {
        this.$emit("input", val);
      }
    },
    uniqueTickets() {
      // Remove tickets duplicados baseando-se no ID e no timestamp
      const seen = new Set();
      return this.tickets.filter(ticketObj => {
        const key = `${ticketObj.ticket.id}-${ticketObj.lastMessageTimestamp}`;
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
    }
  },
  methods: {
    scrollToBottom() {
      this.$nextTick(() => {
        const dialogContent = document.querySelector('.q-dialog__inner > div');
        if (dialogContent) {
          dialogContent.scrollTop = dialogContent.scrollHeight;
        }
      });
    },
    async buscarMensagens() {
      if (!this.searchTerm) return;
      this.loading = true;
      this.pageNumber = 1;

      try {
        const response = await BuscarMensagensPorBody({
          searchTerm: this.searchTerm,
          pageNumber: this.pageNumber
        });

        this.tickets = response.data.tickets || [];
        this.hasMore = response.data.hasMore;
      } catch (error) {
        // Silenciar erros de timeout - não mostrar no console
        if (error?.code !== 'ECONNABORTED' && !error?.message?.includes('timeout')) {
          console.error("Erro ao buscar mensagens:", error);
        }
        this.tickets = [];
      } finally {
        this.loading = false;
      }
    },
    async loadMoreTickets() {
      if (!this.hasMore || this.loadingMore) return;

      this.loadingMore = true;
      this.pageNumber++;

      try {
        const response = await BuscarMensagensPorBody({
          searchTerm: this.searchTerm,
          pageNumber: this.pageNumber
        });

        this.tickets = [...this.tickets, ...(response.data.tickets || [])];
        this.hasMore = response.data.hasMore;
      } catch (error) {
        // Silenciar erros de timeout - não mostrar no console
        if (error?.code !== 'ECONNABORTED' && !error?.message?.includes('timeout')) {
          console.error("Erro ao carregar mais mensagens:", error);
        }
      } finally {
        this.loadingMore = false;
      }
    },
    handleScroll() {
      const container = this.$refs.scrollContainer?.$el || this.$refs.scrollContainer;
      if (!container) return;

      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      const scrollPercentage = scrollTop / (scrollHeight - clientHeight);

      if (scrollPercentage >= 0.85 && !this.loadingMore && this.hasMore) {
        this.loadMoreTickets();
      }
    }
    ,
    irParaTicket(ticket) {
      // const unixTimestamp = this.convertToUnixTimestamp(Date.now());
      // this.$router.push(`/atendimento/${ticketId}?t=${unixTimestamp}`).then(() => {
      //   location.reload();
      // });
      // console.log('ItemTicket - Tentando abrir chat:', {
      //   ticketId: ticket.id,
      //   status: ticket.status,
      //   ticketFocado: this.$store.getters.ticketFocado.id,
      //   routeName: this.$route.name
      // });
      
      // caso esteja em um tamanho mobile, fechar a drawer dos contatos
      if (this.$q.screen.lt.md && ticket.status !== 'pending') {
        eventBus.emit('infor-cabecalo-chat:acao-menu')
      }
      if (!(ticket.status !== 'pending' && (ticket.id !== this.$store.getters.ticketFocado.id || this.$route.name !== 'chat'))) {
        return;
      }
      this.$store.commit('SET_HAS_MORE', true)
      this.$store.dispatch('AbrirChatMensagens', ticket)
      this.closeModal();
    },
    closeModal() {
      // Atualiza o estado local e notifica o componente pai
      try {
        this.$refs.buscarMensagensDialog && this.$refs.buscarMensagensDialog.hide && this.$refs.buscarMensagensDialog.hide()
      } catch (e) {}
      this.$emit('input', false)
      this.modalOpen = false;
      this.searchTerm = "";
      this.tickets = [];
      this.pageNumber = 1;
      this.hasMore = false;
    },
    formatTimestamp(timestamp) {
      if (!timestamp) return "Sem timestamp";
      return new Date(timestamp).toLocaleString();
    },
    convertToUnixTimestamp(timestamp) {
      if (typeof timestamp === "string") {
        return new Date(timestamp).getTime();
      }
      return timestamp;
    },
    formatStatus(status) {
      return this.$t(`buscarMensagemModal.statusMap.${status}`) || this.$t('buscarMensagemModal.unknown');
    },
    formatIsGroup(isGroup) {
      return isGroup ? this.$t('buscarMensagemModal.isGroup.yes') : this.$t('buscarMensagemModal.isGroup.no');
    }
  }
};
</script>

<style lang="scss" scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Para navegadores Firefox */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #888 #f1f1f1;
}
</style>
