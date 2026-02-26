import { AtualizarStatusTicketForcado, AtualizarStatusTicket, EnviarMensagemTexto, LocalizarMensagens, AtualizarTicket, ConsultarDadosTicket, LocalizarMensagensPorContato, VerificarTicketsAbertos} from 'src/service/tickets.js'
import { EnviarTextoWaba } from 'src/service/waba.js'
import { EnviarTextoInstagram } from 'src/service/instagram.js'
import { EnviarTextoMessenger } from 'src/service/messenger.js'
import { ListarDespedidasPrivada } from 'src/service/despedidaprivada.js'
import { CriarAvaliacao, AlterarAvaliacao } from 'src/service/avaliacoes.js'
import { MostrarAvaliacao } from 'src/service/empresas.js'
import { EnviarMensagemHub } from 'src/service/hub.js'
import { EnviarMensagemMeow } from 'src/service/meow.js'
import { EnviarMensagemEvo } from 'src/service/evo.js'
import { EnviarMensagemUazapi } from 'src/service/uazapi.js'
import { EnviarMensagemZapi } from 'src/service/zapi.js'
import { EnviarMensagemWebChat } from 'src/service/webchat.js'
import { ListarMotivos } from 'src/service/motivos.js'
import { uid } from 'quasar'
import eventBus from 'src/utils/eventBus.js'
const userId = +localStorage.getItem('userId')
const forceReason = JSON.parse(localStorage.getItem('forceReason'))

export default {
  data () {
    return {
      rating: [
        { label: this.$t("atendimentoMixinAtualizar.rating.0"), rating: 0 },
        { label: this.$t("atendimentoMixinAtualizar.rating.1"), rating: 1 },
        { label: this.$t("atendimentoMixinAtualizar.rating.2"), rating: 2 },
        { label: this.$t("atendimentoMixinAtualizar.rating.3"), rating: 3 },
        { label: this.$t("atendimentoMixinAtualizar.rating.4"), rating: 4 },
        { label: this.$t("atendimentoMixinAtualizar.rating.5"), rating: 5 }
      ],
      motivos: [],
      motivoSelecionado: null,
      // Sistema de gerenciamento de memória
      timers: []
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
    iniciarAtendimento (ticket) {
      this.loading = true
      AtualizarStatusTicket(ticket.id, 'open', userId)
        .then(res => {
          this.loading = false
          // Atualizar o status do ticket localmente
          ticket.status = 'open'
          ticket.userId = userId
          
          this.$q.notify({
            message: this.$t("atendimentoMixinAtualizar.notifications.iniciarAtendimento", {
              name: ticket.name,
              id: ticket.id
            }),
            type: 'positive',
            progress: true,
            position: 'top',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          
          // Fechar drawer em mobile se necessário
          if (this.$q.screen.lt.md) {
            eventBus.emit('infor-cabecalo-chat:acao-menu')
          }
          
          this.$store.commit('TICKET_FOCADO', {})
          this.$store.commit('SET_HAS_MORE', true)
          this.$store.dispatch('AbrirChatMensagens', ticket)
          
          // Roteamento para a página do chat
          this.$router.push({ name: 'chat', params: { ticketId: ticket.id } })
        })
        .catch(error => {
          this.loading = false
          // Silenciar erros de timeout - não mostrar no console
          if (error?.code !== 'ECONNABORTED' && !error?.message?.includes('timeout')) {
            console.error(error)
            this.$notificarErro(this.$t("atendimentoMixinAtualizar.notifications.erroAtualizarStatus"), error)
          }
        })
    },
    espiarAtendimento (ticket) {
      this.loading = true
      AtualizarStatusTicket(ticket.id, 'pending')
        .then(res => {
          this.loading = false
          this.$q.notify({
            message: this.$t("atendimentoMixinAtualizar.notifications.espiarAtendimento", {
              name: ticket.name,
              id: ticket.id
            }),
            type: 'positive',
            progress: true,
            position: 'top',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.$store.commit('TICKET_FOCADO', {})
          this.$store.commit('SET_HAS_MORE', true)
          this.$store.dispatch('AbrirChatMensagens', ticket)
        })
        .catch(error => {
          this.loading = false
          // Silenciar erros de timeout - não mostrar no console
          if (error?.code !== 'ECONNABORTED' && !error?.message?.includes('timeout')) {
            console.error(error)
            this.$notificarErro(this.$t("atendimentoMixinAtualizar.notifications.erroAtualizarStatus"), error)
          }
        })
    },
    async fetchMessagesForTicket(ticket) {
      try {
        const response = await LocalizarMensagens({ ticketId: ticket.id });
        this.currentTicket = { ...ticket, messages: response.data.messages };
        this.isTicketModalOpen = true;
      } catch (error) {
        // Silenciar erros de timeout - não mostrar no console
        if (error?.code !== 'ECONNABORTED' && !error?.message?.includes('timeout')) {
          console.error('Failed to fetch messages:', error);
        }
        this.isTicketModalOpen = false;
      }
    },
    async fetchMessagesForTicketContact(ticket) {
      try {
        this.loading = true;
        
        let allMessages = [];
        let hasMore = true;
        let pageNumber = 1;
        const maxPages = 10;
        let lastResponse = null;
    
        while (hasMore && pageNumber <= maxPages) {
          const response = await LocalizarMensagensPorContato({ 
            contactId: ticket.contactId, 
            pageNumber 
          });
          
          if (response.data && response.data.messages) {
            const groupedMessages = response.data.messages;
            
            // Processar cada canal
            Object.entries(groupedMessages).forEach(([channelId, channelData]) => {
              // Processar cada ticket do canal
              Object.entries(channelData.tickets).forEach(([ticketId, ticketData]) => {
                // Adicionar mensagens online
                if (ticketData.messages) {
                  allMessages.push(...ticketData.messages.map(msg => ({
                    ...msg,
                    channelId,
                    ticketId: Number(ticketId),
                    ticket: {
                      id: Number(ticketId),
                      user: ticketData.user,
                      createdAt: ticketData.createdAt
                    }
                  })));
                }
                // Adicionar mensagens offline
                if (ticketData.messagesOffLine) {
                  allMessages.push(...ticketData.messagesOffLine.map(msg => ({
                    ...msg,
                    channelId,
                    ticketId: Number(ticketId),
                    ticket: {
                      id: Number(ticketId),
                      user: ticketData.user,
                      createdAt: ticketData.createdAt
                    }
                  })));
                }
              });
            });
    
            hasMore = response.data.hasMore;
            lastResponse = response;
          } else {
            hasMore = false;
          }
    
          pageNumber++;
        }
        
        // Ordenar mensagens por data
        allMessages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        
        // Atualizar o estado
        this.currentTicket = { 
          ...ticket, 
          messages: allMessages,
          groupedMessages: lastResponse?.data?.messages || {}
        };
    
        this.isTicketModalOpen = true;
      } catch (error) {
        // Silenciar erros de timeout - não mostrar no console
        if (error?.code !== 'ECONNABORTED' && !error?.message?.includes('timeout')) {
          console.error('Erro ao buscar mensagens:', error);
          this.$q.notify({
            type: 'negative',
            message: this.$t('chatPrivado.notifications.errorLoadMessages')
          });
        }
      } finally {
        this.loading = false;
      }
    },
    async fetchAllMessages(ticket) {
      try {
        let allMessages = [];
        let hasMore = true;
        let count = 0;
        let pageNumber = 1;
        const maxPages = 10;
    
        while (hasMore && pageNumber <= maxPages) {
          
          const response = await LocalizarMensagens({ ticketId: ticket.id, pageNumber, markAsRead: false });
    
          if (response.data && response.data.messages) {
            const messageIds = response.data.messages.map(msg => msg.id);
    
            allMessages.unshift(...response.data.messages); 
            count += response.data.messages.length;
            hasMore = response.data.hasMore;
          } else {
            hasMore = false;
          }
    
          pageNumber++;
        }
  
    
        this.currentTicket = { ...ticket, messages: allMessages };
        this.isTicketModalOpen = true;
    
      } catch (error) {
        // Silenciar erros de timeout - não mostrar no console
        if (error?.code !== 'ECONNABORTED' && !error?.message?.includes('timeout')) {
          console.error("Erro ao buscar mensagens:", error);
        }
        this.isTicketModalOpen = false;
      }
    },    
    async espiarAtendimentoTicketId (ticketId) {
      try{
        const ticket = await ConsultarDadosTicket({ id: ticketId });
        this.fetchAllMessages(ticket.data);
        this.$q.notify({
          message: this.$t("atendimentoMixinAtualizar.notifications.espiarAtendimento", {
            name: ticket.data.name || "",
            id: ticket.data.id
          }),
          type: 'positive',
          progress: true,
          position: 'top',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        });
      } catch(e){
        if (e.data.error === 'ERR_NO_TICKET_FOUND') {
          this.$q.notify({
            type: 'negative',
            message: e.data.error.message || this.$t('protocolos.ticketNotFound')
          });
        }
        console.error(this.$t("atendimentoMixinAtualizar.notifications.erroAtualizarStatus"), e);
      }
    },
    async espiarAtendimentoContactId (contactId) {
      try {
        await this.fetchMessagesForTicketContact({ contactId });
        this.$q.notify({
          message: this.$t("atendimentoMixinAtualizar.notifications.espiarAtendimento"),
          type: 'positive',
          progress: true,
          position: 'top',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        });
      } catch (error) {
        // Silenciar erros de timeout - não mostrar no console
        if (error?.code !== 'ECONNABORTED' && !error?.message?.includes('timeout')) {
          console.error('Erro ao espiar atendimento:', error);
          this.$q.notify({
            type: 'negative',
            message: this.$t('atendimentoMixinAtualizar.notifications.erroAtualizarStatus')
          });
        }
      }
    },
    async espiarAtendimentoPainel (ticket) {
      try{
        this.fetchAllMessages(ticket);
        this.$q.notify({
          message: this.$t("atendimentoMixinAtualizar.notifications.espiarAtendimento", {
            name: ticket.name || "",
            id: ticket.id
          }),
          type: 'positive',
          progress: true,
          position: 'top',
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        });
      } catch(e){
        console.error(this.$t("atendimentoMixinAtualizar.notifications.erroAtualizarStatus"), e);
      }
    },
    async buildRatingMessage() {
      try {
        const { data } = await MostrarAvaliacao()
        return `${this.$t("atendimentoMixinAtualizar.label")}:\n${data[0].rating.map(r => `${r.rating} - ${r.label}`).join('\n')}`;
      } catch (error) {
        // Silenciar erros de timeout - não mostrar no console
        if (error?.code !== 'ECONNABORTED' && !error?.message?.includes('timeout')) {
          console.error('Erro ao buscar avaliação:', error)
        }
        return `${this.$t("atendimentoMixinAtualizar.label")}:\n1 - ${this.$t("atendimentoMixinAtualizar.excellent")}\n2 - ${this.$t("atendimentoMixinAtualizar.good")}\n3 - ${this.$t("atendimentoMixinAtualizar.regular")}\n4 - ${this.$t("atendimentoMixinAtualizar.bad")}\n5 - ${this.$t("atendimentoMixinAtualizar.terrible")}`;
      }
    },
    async sendEvaluation (ticketFocado) {
      const ticketId = ticketFocado.id
      const evaluation = this.$t("atendimentoMixinAtualizar.evaluation");
      const bodyMessage = await this.buildRatingMessage()
      const message = {
        read: 1,
        fromMe: true,
        mediaUrl: '',
        body: bodyMessage,
        scheduleDate: null,
        quotedMsg: null,
        sendType: 'evaluation',
        idFront: uid(),
      }
      const messageWaba = {
        read: 1,
        fromMe: true,
        mediaUrl: '',
        body: bodyMessage,
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
          message: this.$t("atendimentoMixinAtualizar.notifications.avaliacaoEnviada", {
            id: ticketFocado.id
          }),
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
          await EnviarTextoInstagram(message)
        }
        else if(ticketFocado.channel === 'messenger'){
          await EnviarTextoMessenger(message)
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
        await CriarAvaliacao(data).then(r => {
        }).finally(f => {
          this.loading = false
        })
      } else {
        this.$q.notify({
          type: 'warning',
          progress: true,
          position: 'top',
          message: this.$t("atendimentoMixinAtualizar.notifications.avaliacaoErro"),
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      }
    },
    async listarDespedidas () {
      try {
        const { data } = await ListarDespedidasPrivada()
        this.despedidas = data.farewellPrivateMessage
      } catch (error) {
        // Silenciar erros de timeout - não mostrar no console
        if (error?.code !== 'ECONNABORTED' && !error?.message?.includes('timeout')) {
          console.error('Erro ao listar despedidas:', error)
        }
      }
    },
    async atualizarStatusTicket (status) {
      if(this.ticketFocado.status === 'closed' && (status === 'open' || status === 'pending')){
        try {
          await VerificarTicketsAbertos(this.ticketFocado.contact.id, this.ticketFocado.whatsapp.id)
        } catch (error) {
          console.log('tkc >>>>>>>>>>>> 12', error)
          if (error && error.status === 409 && error.data && error.data.ticket) {
            const ticketAtual = error.data.ticket
            this.abrirAtendimentoExistente(this.ticketFocado.contact, ticketAtual)
            return
          }
        }
      }
      if(forceReason === 'enabled' && !this.ticketFocado.reasons && this.ticketFocado.status === 'open' && status === 'closed'){
        try {
          const { data } = await ListarMotivos()
          this.motivos = Array.isArray(data.reasons) ? data.reasons : []
          if (!this.motivos.length) {
            this.$q.notify({
              type: 'negative',
              message: 'Nenhum motivo encontrado!',
              position: 'top'
            })
            return
          }
          this.$q.dialog({
            title: this.$t('common.attention'),
            message: this.$t('atendimentoMixinAtualizar.notifications.forcarDemanda'),
            options: {
              type: 'radio',
              model: null,
              items: this.motivos.map(motivo => ({
                label: motivo.name,
                value: motivo.id
              }))
            },
            persistent: true,
            ok: {
              label: this.$t('common.save'),
              color: 'primary'
            },
            cancel: {
              label: this.$t('common.cancel'),
              color: 'negative'
            }
          }).onOk(async (selectedReason) => {
            if (!selectedReason) {
              this.$q.notify({
                type: 'warning',
                message: this.$t('atendimentoMixinAtualizar.notifications.selecioneUmMotivo'),
                progress: true,
                position: 'top'
              });
              return;
            }
            try {
              this.loading = true;
              await AtualizarTicket(this.ticketFocado.id, {
                reasons: selectedReason
              });
              this.$q.notify({
                type: 'positive',
                message: this.$t('atendimentoMixinAtualizar.notifications.demandaSalva'),
                progress: true,
                position: 'top'
              });
            } catch (error) {
              this.$q.notify({
                type: 'negative',
                message: this.$t('atendimentoMixinAtualizar.notifications.erroSalvarDemanda'),
                progress: true,
                position: 'top'
              });
            } finally {
              this.loading = false;
            }
          });
          return
        } catch (error) {
          // Silenciar erros de timeout - não mostrar no console
          if (error?.code !== 'ECONNABORTED' && !error?.message?.includes('timeout')) {
            console.error('Erro ao carregar motivos:', error)
            this.$q.notify({
              type: 'negative',
              message: this.$t('atendimentoMixinAtualizar.notifications.erroCarregarMotivos'),
              progress: true,
              position: 'top',
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            });
          }
        }
      }
      const contatoName = this.ticketFocado.contact.name || ''
      const ticketId = this.ticketFocado.id
      const title = {
        open: this.$t('atendimentoMixinAtualizar.titles.iniciar'),
        pending: this.$t('atendimentoMixinAtualizar.titles.retornarFila'),
        closed: this.$t('atendimentoMixinAtualizar.titles.encerrarAtendimento')
      }
      const toast = {
        open: this.$t('atendimentoMixinAtualizar.notifications.atendimentoIniciado'),
        pending: this.$t('atendimentoMixinAtualizar.notifications.retornadoFila'),
        closed: this.$t('atendimentoMixinAtualizar.notifications.atendimentoEncerrado')
      }

      let dialogOptions = {
        title: title[status],
        message: this.$t('atendimentoMixinAtualizar.dialogs.mensagemCliente', {
          cliente: contatoName,
          ticketId
        }),
        cancel: {
          label: this.$t('common.no'),
          color: 'negative',
          push: true,
        },
        persistent: true,
      };
    
      if (status === 'closed' && this.ticketFocado.whatsapp.sendEvaluation === 'disabled') {
        await this.listarDespedidas();
        dialogOptions = {
          ...dialogOptions,
          options: {
            model: null,
            items: this.despedidas.map((despedida) => ({
              label: despedida.name + ' - ' + despedida.message.substring(0, 15) + '...',
              value: despedida.id,
            })),
          },
          ok: {
            label: this.$t('common.yes'),
            color: 'primary',
            push: true,
          },
        };
      } else {
        dialogOptions = {
          ...dialogOptions,
          ok: {
            label: this.$t('common.yes'),
            color: 'primary',
            push: true,
          },
        };
      }
      
      this.$q.dialog(dialogOptions).onOk(async (data) => {
        this.loading = true
        if (status === 'closed' && data !== null) {
          const despedidaSelecionada = this.despedidas?.find(
            (despedida) => despedida.id === data
          );
          if (despedidaSelecionada) {
            const message = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: despedidaSelecionada.message,
              scheduleDate: null,
              quotedMsg: null,
              idFront: uid(),
              sendType: 'farewell'
            }
            try{
              if(this.ticketFocado.channel !== 'waba'){
                if(this.ticketFocado.channel.includes('hub')){
                  await EnviarMensagemHub (ticketId, message)
                } else if (this.ticketFocado.channel === 'meow' ){
                  await EnviarMensagemMeow(ticketId, message);
                } else if (this.ticketFocado.channel === 'evo' ){
                  await EnviarMensagemEvo(ticketId, message);
                } else if (this.ticketFocado.channel === 'zapi' ){
                  await EnviarMensagemZapi(ticketId, message);
                } else if (this.ticketFocado.channel === 'uazapi' ){
                  await EnviarMensagemUazapi(ticketId, message);
                } else if (this.ticketFocado.channel.includes('webchat')){
                  await EnviarMensagemWebChat(ticketId, message);
                } else if (!this.ticketFocado.channel.includes('hub')){
                  await EnviarMensagemTexto(ticketId, message)
                }
                this.$q.notify({
                  type: 'positive',
                  progress: true,
                  position: 'top',
                  message: this.$t('atendimentoMixinAtualizar.notifications.mensagemDespedida'),
                  actions: [{
                    icon: 'close',
                    round: true,
                    color: 'white'
                  }]
                })
              }
              if(this.ticketFocado.channel === 'waba'){
                const data = {
                  read: 1,
                  fromMe: true,
                  mediaUrl: '',
                  body: despedidaSelecionada.message,
                  scheduleDate: null,
                  quotedMsg: null,     
                  from: this.ticketFocado.contact.number,
                  tokenApi: this.ticketFocado.whatsapp.tokenAPI,
                  ticketId: this.ticketFocado.id,
                  idFront: uid(),
                }
                await EnviarTextoWaba(data)
                this.$q.notify({
                  type: 'positive',
                  progress: true,
                  position: 'top',
                  message: this.$t('atendimentoMixinAtualizar.notifications.mensagemFechamento'),
                  actions: [{
                    icon: 'close',
                    round: true,
                    color: 'white'
                  }]
                })
              }
              if(this.ticketFocado.channel === 'instagram'){
                const data = {
                  read: 1,
                  fromMe: true,
                  mediaUrl: '',
                  body: despedidaSelecionada.message,
                  scheduleDate: null,
                  quotedMsg: null,     
                  from: this.ticketFocado.contact.number,
                  tokenApi: this.ticketFocado.whatsapp.tokenAPI,
                  ticketId: this.ticketFocado.id,
                  idFront: uid(),
                }
                await EnviarTextoInstagram(data)
                this.$q.notify({
                  type: 'positive',
                  progress: true,
                  position: 'top',
                  message: this.$t('atendimentoMixinAtualizar.notifications.mensagemFechamento'),
                  actions: [{
                    icon: 'close',
                    round: true,
                    color: 'white'
                  }]
                })
              }
              if(this.ticketFocado.channel === 'messenger'){
                const data = {
                  read: 1,
                  fromMe: true,
                  mediaUrl: '',
                  body: despedidaSelecionada.message,
                  scheduleDate: null,
                  quotedMsg: null,     
                  from: this.ticketFocado.contact.number,
                  tokenApi: this.ticketFocado.whatsapp.tokenAPI,
                  ticketId: this.ticketFocado.id,
                  idFront: uid(),
                }
                await EnviarTextoMessenger(data)
                this.$q.notify({
                  type: 'positive',
                  progress: true,
                  position: 'top',
                  message: this.$t('atendimentoMixinAtualizar.notifications.mensagemFechamento'),
                  actions: [{
                    icon: 'close',
                    round: true,
                    color: 'white'
                  }]
                })
              }
              try{
                await AtualizarTicket(this.ticketFocado.id, {
                  isFarewellMessage: true
                })
                try {
                  await AlterarAvaliacao({
                    evaluation: undefined,
                    id: this.ticketFocado.id,
                    attempts: 2,
                    ticketId: this.ticketFocado.id
                  });
                } catch (avaliacaoError) {
                  // Se a avaliação não existir (404), apenas ignora silenciosamente
                  // Não tenta criar porque evaluation é obrigatório e não temos o valor
                  if (avaliacaoError?.response?.status !== 404 && avaliacaoError?.status !== 404) {
                    // Silenciar outros erros de avaliação - não é crítico
                  }
                }
              } catch(e){
                // Silenciar erros ao atualizar ticket - não é crítico
              }
              const timerId = await new Promise(resolve => setTimeout(resolve, 5000));
              this.addTimer(timerId);
            } catch(e){
            }
          }
        }
        if(status === 'closed' && this.ticketFocado.whatsapp.sendEvaluation === 'enabled' && this.ticketFocado.status === "open" && (this.ticketFocado.channel === 'whatsapp' || this.ticketFocado.channel === 'waba' || this.ticketFocado.channel === 'baileys' || this.ticketFocado.channel === 'meow' || this.ticketFocado.channel === 'evo' || this.ticketFocado.channel.includes("hub_") || this.ticketFocado.channel === 'zapi' || this.ticketFocado.channel === 'uazapi' || this.ticketFocado.channel.includes('webchat')) && !this.ticketFocado.isGroup){
          try{
            AtualizarStatusTicket(ticketId, 'open', userId)
            await this.sendEvaluation(this.ticketFocado)
            this.loading = false
            return
          } catch(e){
            this.loading = false
          }
        }
        try {
          await AtualizarStatusTicket(ticketId, status, userId);
          this.loading = false;
          this.$q.notify({
            message: `${toast[status]} || ${contatoName} (Ticket ${ticketId})`,
            type: 'positive',
            progress: true,
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          });
          this.$store.commit('TICKET_FOCADO', {});
          if (status !== 'open') this.$router.push({ name: 'chat-empty' });
        } catch (error) {
          this.loading = false;
          
          // Tratamento específico para erro 409 (Conflito)
          if (error && error.status === 409) {
            this.$q.notify({
              message: this.$t('atendimentoMixinAtualizar.notifications.atendimentoJaIniciado'),
              type: 'warning',
              progress: true,
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            });
            console.log('tkc >>>>>>>>>>>>> 11', error)
            const ticketAtual = JSON.parse(error.data.error)
            this.abrirAtendimentoExistente(this.ticketFocado.contact, ticketAtual)
            return
          } else {
            // Para outros tipos de erro
            this.$q.notify({
              message: this.$t('atendimentoMixinAtualizar.notifications.erroAtualizarStatus'),
              type: 'negative',
              progress: true,
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            });
          }
          
          console.error('Erro ao atualizar status do ticket:', error);
          this.$notificarErro(this.$t('atendimentoMixinAtualizar.notifications.erroAtualizarStatus'), error);
        }
      })
    },
    abrirAtendimentoExistente (contato, ticket) {
      this.userProfile = localStorage.getItem('profile')
      const configuracoes = JSON.parse(localStorage.getItem('configuracoes'))
      const conf = configuracoes?.find(c => c.key === 'NotViewAssignedTickets')
      this.isNotViewAssignedTickets = conf?.value;
      if(this.isNotViewAssignedTickets === 'enabled' && this.userProfile === 'user'){
        this.$q.dialog({
          title: this.$t('common.attention'),
          message: this.$t("atendimentoVcard.adminOnlyMessage", { name: contato.name }),
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
      this.$q.dialog({
        title: this.$t('common.attention'),
        message: this.$t("atendimentoVcard.ongoingTicketMessage", {
          name: contato.name,
          ticketId: ticket.id,
          queueId: ticket.queueId || this.$t("common.noQueue"),
        }),
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
      }).onOk(async () => {
        try {
          this.abrirChatContato(ticket)
        } catch (error) {
          this.$notificarErro(
            this.$t("atendimentoVcard.ongoingTicketError"),
            error
          )
        }
      })
    },
    abrirChatContato (ticket) {
      if (this.$q.screen.lt.md && ticket.status !== 'pending') {
        eventBus.emit('infor-cabecalo-chat:acao-menu')
      }
      if (!(ticket.status !== 'pending' && (ticket.id !== this.$store.getters.ticketFocado.id || this.$route.name !== 'chat'))) return
      this.$store.commit('SET_HAS_MORE', true)
      this.$store.dispatch('AbrirChatMensagens', ticket)
    },
    async fecharTicket (ticket) {

      let dialogOptions = {
        title: this.$t('atendimentoMixinAtualizar.titles.encerrarAtendimento'),
        message: this.$t('atendimentoMixinAtualizar.dialogs.ticketEncerrar', { ticketId: ticket.id }),
        cancel: {
          label: this.$t('common.no'),
          color: 'negative',
          push: true,
        },
        persistent: true,
      };

      dialogOptions = {
        ...dialogOptions,
        ok: {
          label: this.$t('common.yes'),
          color: 'primary',
          push: true,
        },
      };
      
      this.$q.dialog(dialogOptions).onOk(async (data) => {
        AtualizarStatusTicketForcado(ticket.id, 'closed', userId)
          .then(res => {
            this.loading = false
            this.$q.notify({
              message: this.$t('atendimentoMixinAtualizar.notifications.atendimentoEncerrado', { ticketId: ticket.id }),
              type: 'positive',
              progress: true,
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
            this.$store.commit('TICKET_FOCADO', {})
          })
          .catch(error => {
            // Silenciar erros de timeout - não mostrar no console
            if (error?.code !== 'ECONNABORTED' && !error?.message?.includes('timeout')) {
              console.error(error)
              this.$notificarErro(this.$t("atendimentoMixinAtualizar.notifications.erroAtualizarStatus"), error)
            }
          })
      })
    }
  },
  
  beforeUnmount() {
    // Limpeza completa de memória
    this.cleanupMemory();
  },
  
  unmounted() {
    // Limpeza completa de memória
    this.cleanupMemory();
  }
}
