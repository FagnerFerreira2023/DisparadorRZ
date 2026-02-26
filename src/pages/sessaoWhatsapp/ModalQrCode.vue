<template>
  <q-dialog
    :model-value="abrirModalQR"
    @update:model-value="v => $emit('update:abrirModalQR', v)"
    @hide="fecharModalQrModal"
    persistent
  >
    <q-card style="bg-white">
      <q-card-section>
        <div class="text-h6 text-primary">
          {{ $t('sessaoModalQrcode.title') }}
          <q-btn round
            class="q-ml-md"
            color="negative"
            icon="mdi-close"
            @click="fecharModalQrModal" />
        </div>
      </q-card-section>
      <q-card-section 
        v-if="channel.type !== 'meow' && channel.type !== 'uazapi'"
        class="text-center"
        :style="$q.dark.isActive ? 'background: white !important' : ''">
        <QrcodeVue v-if="cQrcode"
          :value="cQrcode"
          :size="300"
          level="H" />
        <span :style="$q.dark.isActive ? 'color: black !important' : ''" v-if="cParingCode">{{ $t('sessaoModalQrcode.pairingCode') }}: {{ cParingCode }}</span>
        <span v-else-if="!cQrcode">
          {{ $t('sessaoModalQrcode.waitingQrCode') }}
        </span>
      </q-card-section>
      <q-card-section 
        v-if="channel.type === 'meow' || channel.type === 'uazapi'"
        class="text-center"
        :style="$q.dark.isActive ? 'background: white !important' : ''">
        <img :src="channel.qrcode" :size="300">
        <q-item tag="label" v-ripple @click="abrirLink" v-if="channel.type === 'meow'" :style="$q.dark.isActive ? 'color: black !important' : ''">
          <q-item-section>
            <q-item-label>{{ $t('sessaoModalQrcode.openQrCodeInNewTab') }}</q-item-label>
          </q-item-section>
          <q-tooltip content-class="bg-negative text-bold">
            {{ $t('sessaoModalQrcode.openQrCodeInNewTab') }}
          </q-tooltip>
        </q-item>
        <br>
        <span v-if="cParingCode">{{ $t('sessaoModalQrcode.pairingCode') }}: {{ cParingCode }}</span>
        <!-- <span v-else>
          Aguardando o Qr Code
        </span> -->
      </q-card-section>
      <q-card-section>
        <div class="row">{{ $t('sessaoModalQrcode.qrCodeIssue') }} </div>
        <div class="row col-12 justify-center">
          <q-btn color="primary"
            glossy
            ripple
            outline
            :label="$t('sessaoModalQrcode.newQrCode')"
            @click="solicitarQrCode"
            icon="watch_later" />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>

</template>

<script>
import bus from 'src/utils/eventBus'

import { ListarTenantPorId } from 'src/service/tenants.js'
import QrcodeVue from 'qrcode.vue'
const usuario = JSON.parse(localStorage.getItem('usuario'))

export default {
  name: 'ModalQrCode',
  emits: ['update:abrirModalQR', 'gerar-novo-qrcode'],
  data() {
    return {
      usuario,
      wuzapiHost: '',
      // Sistema de gerenciamento de memória
      timers: []
    }
  },
  components: {
    QrcodeVue
  },
  props: {
    abrirModalQR: {
      type: Boolean,
      default: false
    },
    channel: {
      type: Object,
      default: () => ({
        id: null,
        qrcode: ''
      })
    }
  },
  watch: {
    channel: {
      handler (v) {
        if (this.channel.status === 'CONNECTED') {
          this.fecharModalQrModal()
        }
      },
      deep: true
    }
  },
  computed: {
    cQrcode () {
      return this.channel.qrcode
    },
    cParingCode () {
      return this.channel.wppPass
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
    solicitarQrCode () {
      this.$emit('gerar-novo-qrcode', this.channel)
      this.fecharModalQrModal()
      const timerId = setTimeout(() => {
        window.location.reload();
      }, 1000);
      this.addTimer(timerId);
    },
    fecharModalQrModal () {
      this.$emit('update:abrirModalQR', false)
    },
    async listarTenantPorId(){
      this.loading = true; 
      const { data } = await ListarTenantPorId(this.usuario.tenantId)
      this.wuzapiHost = data[0].wuzapiHost
    },
    abrirLink() {
      const url = `${this.wuzapiHost}/login/?token=${this.channel.wabaId}`;
      window.open(url, '_blank');
    },
  },
  async mounted() {
    await this.listarTenantPorId()
    this.userProfile = localStorage.getItem('profile')
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
</script>

<style lang="scss" scoped>
.q-dialog {
  display: flex;
  align-items: center;
  justify-content: center;
}

.q-card {
  border-radius: 20px;
  background: rgba(255,255,255,0.92);
  box-shadow: 0 6px 32px rgba(0,0,0,0.13);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0,0,0,0.06);
  animation: fadeIn 0.5s;
  min-width: 340px;
  max-width: 98vw;
  transition: box-shadow 0.2s;
}

.q-card-section {
  border-radius: 12px 12px 0 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--q-primary);
  background: transparent;
  padding-bottom: 0.5rem;
}

.text-h6.text-primary {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.q-btn {
  border-radius: 8px;
  min-width: 24px;
  min-height: 24px;
  padding: 0.1rem 0.45rem;
  font-size: 0.8rem;
  transition: box-shadow 0.2s, background 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.07);
  &:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.13);
    background: rgba(var(--q-primary-rgb), 0.08);
  }
}

.q-card-section.text-center {
  background: rgba(255,255,255,0.7);
  border-radius: 12px;
  margin-bottom: 0.5rem;
}

.q-item-label {
  font-size: 1rem;
  color: #333;
}

body.body--dark {
  .q-card {
    background: rgba(30,30,30,0.98);
    box-shadow: 0 6px 32px rgba(0,0,0,0.22);
    border: 1px solid rgba(255,255,255,0.10);
  }
  .q-card-section {
    color: var(--q-primary);
  }
  .q-card-section.text-center {
    background: rgba(40,40,40,0.7);
  }
}

@media (max-width: 600px) {
  .q-card {
    min-width: 90vw;
    padding: 0.5rem;
    border-radius: 12px;
  }
  .q-card-section {
    padding: 0.7rem !important;
    font-size: 1rem;
  }
  .q-btn {
    font-size: 0.85rem;
    padding: 0.15rem 0.5rem;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.q-btn[icon="mdi-close"], .q-btn[icon="mdi-close"] {
  min-width: 10px !important;
  min-height: 10px !important;
  padding: 0.01rem 0.08rem !important;
  font-size: 0.45rem !important;
}
.q-btn[icon="mdi-close"] .q-icon {
  font-size: 0.55rem !important;
}
</style>
