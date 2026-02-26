const usuario = JSON.parse(localStorage.getItem('usuario'))
import router from 'src/router/index.js'
import eventBus from 'src/utils/eventBus.js'
import checkTicketFilter from 'src/utils/checkTicketFilter.js'
import { socketIO } from 'src/utils/socket.js'
import { ConsultarTickets } from 'src/service/tickets.js'
import { ListarUsuarios as ListarUsuariosAll, ListarUsuariosChatPrivado } from 'src/service/user.js'
import { orderBy } from 'lodash'
import { parseISO } from 'date-fns'

const socket = socketIO()

const userId = +localStorage.getItem('userId')

// Sistema de gerenciamento de memória para timers
let socketTimers = []

// Função auxiliar para gerenciar timers
function addSocketTimer(timerId) {
  socketTimers.push(timerId)
}

function cleanupSocketTimers() {
  socketTimers.forEach(timerId => {
    clearTimeout(timerId)
    clearInterval(timerId)
  })
  socketTimers = []
}

// Sistema de debounce e cache para ConsultarTickets (compartilhado entre instâncias)
let ticketsQueryDebounce = null
let ticketsQueryCache = null
let ticketsQueryCacheTime = null
let ticketsQueryPending = null

// Função otimizada de consulta de tickets com debounce e cache
async function consultarTicketsOtimizado(params, options = {}) {
  const {
    debounceDelay = 1500, // 1.5 segundos de debounce
    cacheTTL = 2000, // Cache válido por 2 segundos
    forceRefresh = false // Forçar refresh ignorando cache
  } = options;

  const cacheKey = JSON.stringify(params);
  const now = Date.now();

  // Verificar cache se não for refresh forçado
  if (!forceRefresh && ticketsQueryCache && 
      ticketsQueryCacheTime && 
      (now - ticketsQueryCacheTime) < cacheTTL &&
      JSON.stringify(ticketsQueryCache.params) === cacheKey) {
    return ticketsQueryCache.data;
  }

  // Se já há uma requisição pendente com os mesmos parâmetros, retornar a mesma promise
  if (ticketsQueryPending && 
      JSON.stringify(ticketsQueryPending.params) === cacheKey) {
    return ticketsQueryPending.promise;
  }

  // Limpar debounce anterior
  if (ticketsQueryDebounce) {
    clearTimeout(ticketsQueryDebounce);
    ticketsQueryDebounce = null;
  }

  // Criar nova promise com debounce
  const promise = new Promise((resolve, reject) => {
    ticketsQueryDebounce = setTimeout(async () => {
      try {
        const response = await ConsultarTickets(params);
        
        // Atualizar cache
        ticketsQueryCache = {
          params: JSON.parse(cacheKey),
          data: response
        };
        ticketsQueryCacheTime = Date.now();
        
        // Limpar requisição pendente
        ticketsQueryPending = null;
        ticketsQueryDebounce = null;
        
        resolve(response);
      } catch (error) {
        // Limpar requisição pendente mesmo em caso de erro
        ticketsQueryPending = null;
        ticketsQueryDebounce = null;
        reject(error);
      }
    }, debounceDelay);
  });

  // Armazenar requisição pendente
  ticketsQueryPending = {
    params: JSON.parse(cacheKey),
    promise
  };

  return promise;
}

// Função para limpar cache e debounce
function cleanupTicketsQueryCache() {
  if (ticketsQueryDebounce) {
    clearTimeout(ticketsQueryDebounce);
    ticketsQueryDebounce = null;
  }
  ticketsQueryCache = null;
  ticketsQueryCacheTime = null;
  ticketsQueryPending = null;
}

// localStorage.debug = '*'

socket.on(`tokenInvalid:${socket.id}`, () => {
  socket.disconnect()
  localStorage.removeItem('dashboardChartPanels');
  localStorage.removeItem('token')
  localStorage.removeItem('username')
  localStorage.removeItem('profile')
  localStorage.removeItem('userId')
  localStorage.removeItem('usuario')
  const timerId = setTimeout(() => { // TODO: use router instance directly
    router.push({
      name: 'login'
    })
  }, 1000)
  addSocketTimer(timerId)
})

export default {
  created() {
    // Listener para logout forçado quando nova sessão é iniciada
    socket.on(`${usuario.tenantId}:forceLogout`, (data) => {
      const currentUserId = +localStorage.getItem('userId')
      if (data.userId === currentUserId) {
        socket.disconnect()
        localStorage.removeItem('dashboardChartPanels');
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('profile')
        localStorage.removeItem('userId')
        localStorage.removeItem('usuario')
        localStorage.removeItem('queues')
        localStorage.removeItem('bloquearWavoip')
        localStorage.removeItem('whatsappAllowed')
        localStorage.removeItem('filtrosAtendimento')
        
        // Mostrar notificação ao usuário
        this.$q.notify({
          message: data.message || 'Nova sessão iniciada em outro dispositivo',
          type: 'warning',
          position: 'top',
          timeout: 5000,
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
        
        const timerId = setTimeout(() => {
          Router.push({
            name: 'login'
          })
        }, 2000)
        addSocketTimer(timerId)
      }
    })

    // Listener para sessão inválida
    socket.on(`sessionInvalidated:${socket.id}`, (data) => {
      socket.disconnect()
      localStorage.removeItem('dashboardChartPanels');
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('profile')
      localStorage.removeItem('userId')
      localStorage.removeItem('usuario')
      localStorage.removeItem('queues')
      localStorage.removeItem('bloquearWavoip')
      localStorage.removeItem('whatsappAllowed')
      localStorage.removeItem('filtrosAtendimento')
      
      // Mostrar notificação ao usuário
      this.$q.notify({
        message: data.message || 'Sessão inválida. Faça login novamente.',
        type: 'negative',
        position: 'top',
        timeout: 5000,
        actions: [{
          icon: 'close',
          round: true,
          color: 'white'
        }]
      })
      
      const timerId = setTimeout(() => { // TODO: use router instance directly
        router.push({
          name: 'login'
        })
      }, 2000)
      addSocketTimer(timerId)
    })

    socket.on(`${usuario.tenantId}:msg-private-msg`, data => {
      if (data.action === 'update' && (data.data.receiverId == usuario.userId || data.data.groupId != null)) {
        this.$store.commit('PRIVATE_RECEIVED_MESSAGE', data)
      }
    })
    
    socket.on(`${usuario.tenantId}:unread-msg-private-msg`, data => {
      if (data.action === 'update' && data.data.senderId == usuario.userId) {
        this.$store.commit('UNREAD_MESSAGE_PRIVATE_RECEIVED', data)
      }
    })
    
    socket.on(`${usuario.tenantId}:msg-private-msg-notificacao`, data => {
      if (data.action === 'update' && (data.data.receiverId == usuario.userId || data.data.groupId != null)) {
        this.$store.commit('NOTIFICATION_RECEIVED_PRIVATE_MESSAGE', data)
      }
    })
    
    socket.on('verifyOnlineUsers', data => {
      this.$store.commit('LIST_USERS_PRIVATE', { action: 'updateAllUsers', data: {} })
      this.socket.emit(`${usuario.tenantId}:userVerified`, usuario)
    })

    socket.on(`${usuario.tenantId}:user-online`, data => {
      if (data.action === 'update' && data.data.userId !== usuario.userId) {
        this.$store.commit('USER_CHAT_UPDATE', data)
      }
    })
    
      socket.on(`${usuario.tenantId}:updateStatusUser`, async () => {
        try {
          const { data } = await ListarUsuariosChatPrivado()
          const users = Array.isArray(data) ? data : (data?.users || [])
          this.$store.commit('LIST_USERS_PRIVATE', { action: 'create', data: users })
        } catch (e) {
          try {
            const { data } = await ListarUsuariosAll()
            const users = Array.isArray(data) ? data : (data?.users || [])
            this.$store.commit('LIST_USERS_PRIVATE', { action: 'create', data: users.filter(u => u.profile !== 'superadmin') })
          } catch (e2) {
            console.error('Falha ao atualizar lista de usuários via socket (atendimento):', e2)
          }
        }
      })
  },
  methods: {
    scrollToBottom () {
      const timerId = setTimeout(() => {
        eventBus.emit('scrollToBottomMessageChat')
      }, 200)
      addSocketTimer(timerId)
    },
    socketMessagesList () {

    },
    socketTicket () {
      socket.on('connect', () => {
        socket.on(`${usuario.tenantId}:ticket`, data => {
          if (data.action === 'update' && data.ticket.userId === userId) {
            if (data.ticket.status === 'open' && !data.ticket.isTransference) {
              this.$store.commit('TICKET_FOCADO', data.ticket)
            }
          }
        })
      })
    },
    socketTicketList () {
      this.socketTicketListNew()
    },
    socketTicketListNew () {
      socket.on('connect', () => {

        const filtroPadrao = {
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
          includeNotQueueDefined: true
          // date: new Date(),
        }

        socket.on(`${usuario.tenantId}:ticketList`, async data => {
          const filtros = JSON.parse(localStorage.getItem('filtrosAtendimento')) || filtroPadrao;
          if(filtros.searchParam.length > 0 ) return
          if(filtros.withUnreadMessages === true ) return
          if (data.type === 'chat:create') {
            if(!data.payload) return
            if (
              !data.payload.read &&
              (data.payload.ticket.userId === userId || !data.payload.ticket.userId) &&
              data.payload.ticket.id !== this.$store.getters.ticketFocado.id
            ) {
              if (checkTicketFilter(data.payload.ticket)) {
                this.handlerNotifications(data.payload)
              }
            }
            this.$store.commit('UPDATE_MESSAGES', data.payload)
            // this.scrollToBottom()
            if (data.payload.ticket.userId === userId || (data.payload.ticket.userIdArray && data.payload.ticket.userIdArray.includes(userId))){
              this.scrollToBottom()
            }
          }

          if (data.type === 'chat:ack' || data.type === 'chat:delete') {
            this.$store.commit('UPDATE_MESSAGE_STATUS', data.payload)
          }

          if (data.type === 'chat:update') {
            this.$store.commit('UPDATE_MESSAGES', data.payload)
            // this.$store.commit('UPDATE_MESSAGE', data.payload)
          }

          if (data.type === 'ticket:update') {
            this.$store.commit('UPDATE_TICKET', data.payload)
            // this.$store.commit('UPDATE_NOTIFICATIONS', data.payload)
            try{
              if(usuario.profile === 'admin'){
                const openTickets = data.payload?.filter(ticket => ticket.status === 'open' && ticket.unreadMessages > 0)
                const openCount = openTickets?.length
                this.$store.commit('UPDATE_NOTIFICATIONS', { ...data.payload, tickets: openTickets, count: openCount })
              }
              else {
                const openTickets = data.payload?.filter(ticket => ticket.status === 'open' && ticket.userId === usuario.userId && ticket.unreadMessages > 0)
                const openCount = openTickets?.length
                this.$store.commit('UPDATE_NOTIFICATIONS', { ...data.payload, tickets: openTickets, count: openCount })
              }
            } catch(e){
              this.$store.commit('UPDATE_NOTIFICATIONS', data.payload)
            }
          }
        })

        // socket.on(`${usuario.tenantId}:ticketList`, async data => {
        //   var verify = []
        //   if (data.type === 'notification:new') {
        //     // console.log(data)
        //     // Atualiza notificações de mensagem
        //     // var data_noti = []
        //     const params = {
        //       searchParam: '',
        //       pageNumber: 1,
        //       status: ['open', 'pending'],
        //       showAll: false,
        //       includeClosed: false,
        //       count: null,
        //       queuesIds: [],
        //       whatsappIds: [],
        //       selectedUser: [],
        //       withUnreadMessages: false,
        //       isNotAssignedUser: false,
        //       includeNotQueueDefined: true
        //       // date: new Date(),
        //     }
        //     try {
        //       const response_noti = await consultarTicketsOtimizado(params)
        //       const data_noti = response_noti?.data || response_noti
        //       // this.$store.commit('UPDATE_NOTIFICATIONS_P', data_noti.data)
        //       if(this.usuario.profile === 'admin'){
        //         const pendingTickets = data_noti.tickets?.filter(ticket => ticket.status === 'pending')
        //         const pendingCount = pendingTickets?.length
        //         if(pendingCount > 0){
        //           this.$store.commit('UPDATE_NOTIFICATIONS_P', { ...data_noti, tickets: pendingTickets, count: pendingCount })
        //         }
        //       }
        //       else {
        //         const pendingTickets = data_noti.tickets?.filter(ticket => ticket.status === 'pending' && ticket.userId === this.usuario.userId)
        //         const pendingCount = pendingTickets?.length
        //         if(pendingCount > 0){
        //           this.$store.commit('UPDATE_NOTIFICATIONS_P', { ...data_noti, tickets: pendingTickets, count: pendingCount })
        //         }
        //       }
        //       verify = { data: data_noti }
        //     } catch (err) {
        //       this.$notificarErro(this.$t('common.notifications.error'), err)
        //       console.error(err)
        //     }
        //     // Faz verificação para se certificar que notificação pertence a fila do usuário
        //     var pass_noti = false
        //     if (verify?.data?.tickets) {
        //       verify.data.tickets.forEach((element) => { pass_noti = (element.id == data.payload.id ? true : pass_noti) })
        //     }
        //     // Exibe Notificação
        //     if (pass_noti) {
        //       const message = new self.Notification(this.$t('atendimentoMixinSockets.pendingCliente'), {
        //         body: this.$t('atendimentoMixinSockets.client') + data.payload.contact.name,
        //         tag: 'simple-push-demo-notification'
        //       })
        //     }
        //   }
        // })

        socket.on(`${usuario.tenantId}:contactList`, data => {
          this.$store.commit('UPDATE_CONTACT', data.payload)
        })

      })
    },
    socketDisconnect () {
      cleanupSocketTimers()
      cleanupTicketsQueryCache()
      socket.disconnect()
    }
  },
  unmounted() {
    // Limpeza de timers
    cleanupSocketTimers()
    cleanupTicketsQueryCache()
  }
}
