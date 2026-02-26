<template>
  <q-dialog
    persistent
    :model-value="modalSMS"
    @update:model-value="$emit('update:modalSMS', $event)"
    @hide="fecharModal"
    @show="abrirModal"
  >
    <q-card
      style="width: 500px"
      class="q-pa-lg"
    >
      <q-card-section>
        <div class="text-h6">{{ $t('atendimentoModalSMS.title') }}</div>
      </q-card-section>
      <q-card-section>
        <!-- Input para a mensagem -->
        <q-input
          type="textarea"
          class="row col"
          square
          outlined
          v-model="message"
          :label="$t('atendimentoModalSMS.messageLabel')"
          autogrow
        />
        <!-- Dropdown para selecionar o serviço -->
        <q-select
          v-model="service"
          :options="services"
          outlined
          :label="$t('atendimentoModalSMS.selectServiceLabel')"
          dense
          class="q-mt-md"
        />
      </q-card-section>
      <q-card-actions
        align="right"
        class="q-mt-md"
      >
        <q-btn
          flat
          :label="$t('common.cancel')"
          color="negative"
          v-close-popup
          class="q-mr-md"
        />
        <q-btn
          flat
          :label="$t('atendimentoModalSMS.send')"
          color="primary"
          @click="handleSMS"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { EnviarSMS, EnviarSMSConecta, EnviarSMSLivson } from 'src/service/sms.js';

export default {
  name: 'ModalSMS',
  props: {
    modalSMS: {
      type: Boolean,
      default: false
    },
    smsEnvio: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      message: '',
      service: '', // Serviço selecionado
      services: [
        { label: 'Comtele', value: 'comtele' },
        { label: 'ConectaStartup', value: 'conecta' },
        { label: 'BHI', value: 'livson' }
      ]
    };
  },
  methods: {
    resetarSMS() {
      this.message = '';
      this.service = '';
    },
    fecharModal() {
      this.resetarSMS();
      this.$emit('update:modalSMS', false);
    },
    abrirModal() {
      if (this.smsEnvio.id) {
        this.sms = this.smsEnvio;
      } else {
        this.resetarSMS();
      }
    },
    async handleSMS() {
      if (!this.service) {
        this.$q.notify({
          type: 'warning',
          message: this.$t("atendimentoModalSMS.noServiceSelected"),
          position: 'top'
        });
        return;
      }

      try {
        const dados = {
          phoneNumber: this.smsEnvio,
          message: this.message
        };

        // Verifica o serviço selecionado
        if (this.service.value === 'comtele') {
          const resposta = await EnviarSMS(dados);
          this.$q.notify({
            type: 'positive',
            message: this.$t("atendimentoModalSMS.comteleSuccess"),
            position: 'top'
          });
          this.fecharModal();
        } else if (this.service.value === 'conecta') {
          const resposta = await EnviarSMSConecta(dados);
          this.$q.notify({
            type: 'positive',
            message: this.$t("atendimentoModalSMS.conectaSuccess"),
            position: 'top'
          });
          this.fecharModal();
        } else if (this.service.value === 'livson') {
          const resposta = await EnviarSMSLivson(dados);
          this.$q.notify({
            type: 'positive',
            message: this.$t("atendimentoModalSMS.livsonSuccess"),
            position: 'top'
          });
          this.fecharModal();
        }

        // this.fecharModal();
      } catch (error) {
        this.$q.notify({
          type: 'warning',
          message: this.$t("atendimentoModalSMS.errorSending", { error: error.message }),
          position: 'top'
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped></style>
