<template>
  <div class="q-pa-md">
    <transition-group appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
      <div v-for="(mensagem, index) in mensagens" :key="`mensagem-${index}`">
        <hr
          v-if="isLineDate"
          :key="'hr-' + index"
          class="hr-text q-mt-lg q-mb-md"
          :data-content="formatarData(mensagem.createdAt)"
          v-show="index === 0 || formatarData(mensagem.createdAt) !== formatarData(mensagens[index - 1].createdAt)"
        />
        <q-chat-message
          :key="mensagem.id"
          :stamp="dataInWords(mensagem.createdAt)"
          :sent="mensagem.fromMe"
          class="text-weight-medium"
          :bg-color="mensagem.fromMe ? 'grey-2' : $q.dark.isActive ? 'blue-2' : 'blue-1'"
        >
          <div style="min-width: 100px; max-width: 350px" :style="mensagem.isDeleted ? 'color: rgba(0, 0, 0, 0.36) !important;' : ''">
            <q-icon
              class="q-ma-xs"
              name="mdi-calendar"
              size="18px"
              :class="{
                'text-primary': mensagem.scheduleDate && mensagem.status === 'pending',
                'text-positive': !['pending', 'canceled'].includes(mensagem.status),
              }"
              v-if="mensagem.scheduleDate"
            >
              <q-tooltip content-class="bg-secondary text-grey-8">
                <div class="row col">{{ $t('atendimentoMensagemChat.labels.mensagemAgendada') }}</div>
                <div class="row col">
                  <q-chip color="blue-1" icon="mdi-calendar-import">
                    {{ $t('atendimentoMensagemChat.labels.criadoEm', { data: formatarData(mensagem.createdAt, 'dd/MM/yyyy HH:mm') }) }}
                  </q-chip>
                </div>
                <div class="row col">
                  <q-chip color="blue-1" icon="mdi-calendar-start">
                    {{ $t('atendimentoMensagemChat.labels.programadoPara', { data: formatarData(mensagem.scheduleDate, 'dd/MM/yyyy HH:mm') }) }}
                  </q-chip>
                </div>
              </q-tooltip>
            </q-icon>

            <template v-if="mensagem.mediaType === 'audio' && mensagem.mediaUrl">
              <audio class="q-mt-md full-width" controls>
                <source :src="mensagem.mediaUrl" type="audio/mp3" />
              </audio>
            </template>
            <template v-else-if="(mensagem.mediaType === 'video' || mensagem.mediaType === 'videoMessage') && mensagem.mediaUrl">
              <video :src="mensagem.mediaUrl" controls class="q-mt-md" style="object-fit: cover; width: 330px; height: 150px; border-radius: 8px"></video>
            </template>
            <template v-else-if="mensagem.mediaUrl && (mensagem.mediaType === 'image' || mensagem.mediaType === 'imageMessage')">
              <q-img :src="mensagem.mediaUrl" spinner-color="primary" height="150px" width="330px" class="q-mt-md" />
            </template>
            <div v-else v-html="formatarMensagemWhatsapp(mensagem.body)"></div>
          </div>
        </q-chat-message>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { format } from 'date-fns'

export default {
  name: 'MensagemChatEspiarContato',
  props: {
    mensagens: { type: Array, default: () => [] }
  },
  computed: {
    isLineDate () { return true }
  },
  methods: {
    formatarData (data, formato = 'dd/MM/yyyy') {
      try { return format(new Date(data), formato) } catch (e) { return '' }
    },
    dataInWords (data) {
      try { return format(new Date(data), 'dd/MM/yyyy HH:mm') } catch (e) { return '' }
    },
    formatarMensagemWhatsapp (body) {
      if (!body) return ''
      let formatTxt = String(body)
      const obj = { '*': 'b', '_': 'i', '~': 's', '```': 'pre' }
      for (const [marker, tag] of Object.entries(obj)) {
        // Escapa caracteres especiais de regex
        const escapedMarker = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const regex = new RegExp(`${escapedMarker}([^${escapedMarker}]+)${escapedMarker}`, 'g')
        formatTxt = formatTxt.replace(regex, `<${tag}>$1</${tag}>`)
      }
      const urlRegex = /(https?:\/\/[^\s]+)/g
      formatTxt = formatTxt.replace(urlRegex, (url) => `<a target=\"_blank\" rel=\"noopener noreferrer\" href=\"${url}\">${url}</a>`)
      return formatTxt.replace(/\n/g, '<br>')
    }
  }
}
</script>

<style lang="scss">
.hr-text {
  position: relative;
  border: none;
  height: 1px;
  background: #e0e0e0;
}
</style>

