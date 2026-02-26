<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card
      :style="{
        fontFamily: 'Inter, sans-serif',
        width: '900px',
        minWidth: '400px',
        maxWidth: '85vw',
        borderRadius: '8px',
      }"
      class="q-pa-lg"
    >
      <div class="column q-gutter-sm no-wrap">
        <div>
          <div class="row">
            <div class="col-xs-12 text-primary text-weight-bold text-20">{{ $t('atendimentoChatdialogAgendamentoMensagem.title') }}</div>
            <q-btn style="top: 10px; right: 15px" class="absolute" color="primary" round icon="close" flat v-close-popup 
            :aria-label="$t('atendimentoChatdialogAgendamentoMensagem.close')"
            />
          </div>
        </div>

        <div>
          <InputMensagem
            isScheduleDate
            :mensagensRapidas="mensagensRapidas"
            v-model:replyingMessage="replyingMessageLocal"
          />
        </div>
      </div>
    </q-card>
  </q-dialog>
 </template>

<script>
import { defineComponent } from 'vue'
import { useDialogPluginComponent } from 'quasar'
import InputMensagem from '../InputMensagem.vue'

export default defineComponent({
  name: 'DialogAgendamentoMensagem',
  props: {
    ...useDialogPluginComponent.props,
    mensagensRapidas: { type: Array, default: () => [] },
    replyingMessage: { type: Object, default: null }
  },
  emits: [
    ...useDialogPluginComponent.emits
  ],
  components: {
    InputMensagem,
  },
  data () {
    return {
      replyingMessageLocal: null
    }
  },
  mounted () {
    // Inicializa o v-model local a partir da prop (evita mutação direta de prop)
    this.replyingMessageLocal = this.replyingMessage || null
  },
  methods: { },
  setup (props, { emit }) {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } = useDialogPluginComponent(emit)
    return { dialogRef, onDialogHide, onDialogOK, onDialogCancel }
  }
})
</script>
