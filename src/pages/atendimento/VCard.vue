<template>
  <div style="min-width: 250px;">
    <div class="row">
      <div class="col-3">
        <!-- Se selectedContact.profilePicUrl existir, mostra esta imagem -->
        <q-avatar v-if="selectedContact.profilePicUrl && selectedContact.profilePicUrl !== 'null' && selectedContact.profilePicUrl !== 'undefined'" class="bg-grey">
          <q-img :src="selectedContact.profilePicUrl" />
        </q-avatar>
        
        <!-- Se selectedContact.profilePicUrl não existir, mas pictureUrl existir, mostra esta imagem -->
        <q-avatar v-else-if="pictureUrl" class="bg-grey">
          <q-img :src="pictureUrl" />
        </q-avatar>

        <!-- Se nem selectedContact.profilePicUrl nem pictureUrl existirem, mostra o ícone -->
        <q-icon v-else size="50px" name="mdi-account-circle" color="grey-8" />
      </div>
      <div class="col-9">
        <q-item-label class="q-mb-md text-primary" style="margin-top: 1rem;">{{ selectedContact.name }}</q-item-label>
      </div>
    </div>
    <hr />
    <q-btn v-if="isWhatsAppConnected" full-width color="primary " style="width: 100%;margin-top: 0.5rem" icon="mdi-whatsapp" @click="handleSaveTicket(selectedContact, 'whatsapp')"
      :disabled="!selectedContact.number">
    <!-- <q-btn full-width color="primary " style="width: 100%;margin-top: 0.5rem" icon="mdi-whatsapp" @click="handleNewChat(selectedContact)"> -->
      <span style="margin-left: 10px;">WWebJS</span>
    </q-btn>
    <q-btn v-if="isBaileysConnected" full-width color="primary " style="width: 100%;margin-top: 0.5rem" icon="mdi-whatsapp" @click="handleSaveTicket(selectedContact, 'baileys')"
      :disabled="!selectedContact.number">
    <!-- <q-btn full-width color="primary " style="width: 100%;margin-top: 0.5rem" icon="mdi-whatsapp" @click="handleNewChat(selectedContact)"> -->
      <span style="margin-left: 10px;">Baileys</span>
    </q-btn>
    <q-btn v-if="isEvoConnected" full-width color="primary " style="width: 100%;margin-top: 0.5rem" icon="mdi-whatsapp" @click="handleSaveTicket(selectedContact, 'evo')"
      :disabled="!selectedContact.number">
    <!-- <q-btn full-width color="primary " style="width: 100%;margin-top: 0.5rem" icon="mdi-whatsapp" @click="handleNewChat(selectedContact)"> -->
      <span style="margin-left: 10px;">Evo</span>
    </q-btn>
    <q-btn v-if="isZapiConnected" full-width color="primary " style="width: 100%;margin-top: 0.5rem" icon="mdi-whatsapp" @click="handleSaveTicket(selectedContact, 'zapi')"
      :disabled="!selectedContact.number">
    <!-- <q-btn full-width color="primary " style="width: 100%;margin-top: 0.5rem" icon="mdi-whatsapp" @click="handleNewChat(selectedContact)"> -->
      <span style="margin-left: 10px;">Zapi</span>
    </q-btn>
    <q-btn v-if="isUazapiConnected" full-width color="primary " style="width: 100%;margin-top: 0.5rem" icon="mdi-whatsapp" @click="handleSaveTicket(selectedContact, 'uazapi')"
      :disabled="!selectedContact.number">
    <!-- <q-btn full-width color="primary " style="width: 100%;margin-top: 0.5rem" icon="mdi-whatsapp" @click="handleNewChat(selectedContact)"> -->
      <span style="margin-left: 10px;">Uazapi</span>
    </q-btn>
    <q-btn v-if="isMeowConnected" full-width color="primary " style="width: 100%;margin-top: 0.5rem" icon="mdi-whatsapp" @click="handleSaveTicket(selectedContact, 'meow')"
      :disabled="!selectedContact.number">
    <!-- <q-btn full-width color="primary " style="width: 100%;margin-top: 0.5rem" icon="mdi-whatsapp" @click="handleNewChat(selectedContact)"> -->
      <span style="margin-left: 10px;">Meow</span>
    </q-btn>
    <q-btn v-if="isWabaConnected" full-width color="primary " style="width: 100%;margin-top: 0.5rem" icon="mdi-whatsapp" @click="handleSaveTicket(selectedContact, 'waba')"
      :disabled="!selectedContact.number">
    <!-- <q-btn full-width color="primary " style="width: 100%;margin-top: 0.5rem" icon="mdi-whatsapp" @click="handleNewChat(selectedContact)"> -->
      <span style="margin-left: 10px;">WABA</span>
    </q-btn>
    <!-- <q-btn full-width color="primary " style="width: 100%;margin-top: 0.5rem" icon="mdi-book-account-outline" @click="$q.screen.lt.md ? (modalNovoTicket = true) : $router.push({ name: 'chat-contatos' })"
      :disabled="!selectedContact.number">
      <span style="margin-left: 10px;">Contatos</span>
    </q-btn> -->
  </div>
</template>

<script>
const userId = +localStorage.getItem('userId')
import { CriarContatoVcard, ListarUrlFoto, ObterContatoPeloNumero } from 'src/service/contatos.js'
import { CriarTicket } from 'src/service/tickets.js'
import { mapGetters } from 'vuex'
import { ListarConfiguracoes } from 'src/service/configuracoes.js'
import { DadosUsuario } from 'src/service/user.js'
import { ListarTenantPorId } from 'src/service/tenants.js'
import eventBus from 'src/utils/eventBus.js'

export default {
  props: {
    vcard: String,
    oldTicket: {}
  },
  data() {
    return {
      isNotViewAssignedTickets: 'disabled',
      contact: '',
      numbers: [],
      selectedContact: {
        name: '',
        number: 0,
        profilePicUrl: ''
      },
      pictureUrl: ''
    }
  },
  computed: {
    ...mapGetters(['whatsapps']),
    isWhatsAppConnected() {
      return this.whatsapps.some(w => w.type === 'whatsapp' && w.status === 'CONNECTED');
    },
    isBaileysConnected() {
      return this.whatsapps.some(w => w.type === 'baileys' && w.status === 'CONNECTED');
    },
    isEvoConnected() {
      return this.whatsapps.some(w => w.type === 'evo' && w.status === 'CONNECTED');
    },
    isMeowConnected() {
      return this.whatsapps.some(w => w.type === 'meow' && w.status === 'CONNECTED');
    },
    isWabaConnected() {
      return this.whatsapps.some(w => w.type === 'waba' && w.status === 'CONNECTED');
    },
    isZapiConnected() {
      return this.whatsapps.some(w => w.type === 'zapi' && w.status === 'CONNECTED');
    },
    isUazapiConnected() {
      return this.whatsapps.some(w => w.type === 'uazapi' && w.status === 'CONNECTED');
    }
  },
  methods: {
    async fetchContact(contact, number) {
      try{
        const contactObj = {
          name: contact,
          number: number[0]?.number?.replace(/\D/g, ''),
          email: '',
        }
        const { data } = await CriarContatoVcard(contactObj)
        this.selectedContact = data
      } catch(e){
        
      }
      try {
        const contato = await ObterContatoPeloNumero(number[0]?.number?.replace(/\D/g, ''))
        if (contato){
          try{
            const fotoPerfil = await ListarUrlFoto({number: number[0]?.number?.replace(/\D/g, '')})
            if(fotoPerfil){
              this.pictureUrl = fotoPerfil.data
              this.selectedContact = contato.data
            } else {
              this.pictureUrl = ''
              this.selectedContact = contato.data
            }
          } catch(e){
            this.pictureUrl = ''
            this.selectedContact = contato.data
          }
          return
        }
      } catch (err) {
        const contactObj = {
          name: contact,
          number: number[0]?.number.replace(/\D/g, ''),
          email: '',
        }
        const { data } = await CriarContatoVcard(contactObj)
        this.selectedContact = data
      }
      try {
        const fotoPerfil = await ListarUrlFoto({number: number[0].number?.replace(/\D/g, '')})
        this.pictureUrl = fotoPerfil.data
      } catch (err) {
        this.pictureUrl = ''
        // console.error(err)
      }
    },
    async handleSaveTicket (selectedContact, channel) {
      if (!selectedContact.id) return
      const itens = []
      const channelId = null
      const response = await DadosUsuario(this.usuario.userId);
      const responseTenant = await ListarTenantPorId(this.usuario.tenantId)
      if(this.usuario.profile === 'admin' || (this.usuario.profile === 'super' && responseTenant.data[0].supervisorAdmin === 'disabled')){
        this.whatsapps.forEach(w => {
        if (w.type === channel && channel !== "hub_instagram") {
          itens.push({ label: w.name, value: w.id })
        } else if (w.type === "hub_facebook" && channel === "hub_instagram") {
          itens.push({ label: w.name, value: w.id })
        }
      })
      } else {
        const filteredWhatsapps = this.whatsapps.filter(w => 
        response.data.whatsappAllowed.some(wa => wa.id === w.id)
      );
      filteredWhatsapps.forEach(w => {
        if (w.type === channel && channel !== "hub_instagram") {
          itens.push({ label: w.name, value: w.id })
        } else if (w.type === "hub_facebook" && channel === "hub_instagram") {
          itens.push({ label: w.name, value: w.id })
        }
      })
      }
      // this.whatsapps.forEach(w => {
      //   if (w.type === channel) {
      //     itens.push({ label: w.name, value: w.id })
      //   }
      // })

      this.$q.dialog({
        title: this.$t("atendimentoVcard.contactTitle", { name: selectedContact.name }),
          message: this.$t("atendimentoVcard.selectChannelMessage"),
        options: {
          type: 'radio',
          model: channelId,
          // inline: true
          isValid: v => !!v,
          items: itens
        },
        ok: {
          push: true,
          color: 'positive',
          label: this.$t('common.start')
        },
        cancel: {
          push: true,
          label: this.$t('common.cancel'),
          color: 'negative'
        },
        persistent: true
      }).onOk(async channelId => {
        if (!channelId) return
        // this.loading = true
        try {
          const { data: ticket } = await CriarTicket({
            contactId: selectedContact.id,
            isActiveDemand: true,
            userId: userId,
            channel,
            channelId,
            status: 'open'
          })
          // await this.$store.commit('SET_HAS_MORE', true)
          await this.$store.dispatch('AbrirChatMensagens', ticket)
          this.$q.notify({
            message: this.$t("atendimentoVcard.notifyTicketStarted", {
              name: ticket.contact.name,
              ticketId: ticket.id,
            }),
            type: 'positive',
            position: 'top',
            progress: true,
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.$router.push({ name: 'chat', params: { ticketId: ticket.id } })
        } catch (error) {
          if (error.status === 409) {
            console.log('tkc >>>>>>>>>>>>> 8', error)
            if(this.isNotViewAssignedTickets === 'enabled' && this.userProfile === 'user'){
              this.$q.dialog({
                title: this.$t('common.attention'),
                message: this.$t("atendimentoVcard.adminOnlyMessage", { name: selectedContact.name }),
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
            const ticketAtual = JSON.parse(error.data.error)
            // Se o status for pending, atualizar para open antes de rotear
            const updateData = {}
            const needsStatusUpdate = ticketAtual.status === 'pending'
            
            if (needsStatusUpdate) {
              updateData.status = 'open'
              updateData.userId = userId
              ticketAtual.status = 'open'
              ticketAtual.userId = userId
            }
            
            if (ticketAtual.whatsappId === null) {
              updateData.whatsapp = channelId
            }
            
            // Atualizar ticket se houver mudanças
            if (Object.keys(updateData).length > 0) {
              await AtualizarTicket(ticketAtual.id, updateData)
              
              // Aguardar 250ms para dar tempo de salvar no banco
              await new Promise(resolve => setTimeout(resolve, 250))
            }
            this.abrirAtendimentoExistente(selectedContact, ticketAtual)
            return
          }
          this.$notificarErro(this.$t('common.notifications.error'), error)
        }
        // this.loading = false
      })
    },
    abrirAtendimentoExistente (contato, ticket) {
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
    getInfoVCard() {

      const array = this.vcard.split('\n')
      const obj = []
      let contact = ''
      for (let index = 0; index < array.length; index++) {
        const v = array[index]
        const values = v.split(':')
        for (let ind = 0; ind < values.length; ind++) {
          if (values[ind].indexOf('+') !== -1) {
            obj.push({ number: values[ind] })
          }
          if (values[ind].indexOf('FN') !== -1) {
            contact = values[ind + 1]
          }
        }
      }
      return { contact, number: obj }
    },
    async listarConfiguracoes() {
      const configuracoes = JSON.parse(localStorage.getItem('configuracoes'));
      const conf = configuracoes?.find(c => c.key === 'NotViewAssignedTickets');
      this.isNotViewAssignedTickets = conf?.value;
    }
  },
  async mounted () {
    this.usuario = JSON.parse(localStorage.getItem('usuario'))
    this.userProfile = localStorage.getItem('profile')
    this.listarConfiguracoes()
  },
  created() {
    const { contact, number } = this.getInfoVCard()
    if(contact && number){
      this.fetchContact(contact, number)
    }
  }
}
</script>

<style scoped>

</style>
