<template>
  <div class="status-card">
    <q-item>
      <q-item-section avatar>
        <q-icon v-if="item.status == 'qrcode'"
          color="primary"
          name="mdi-crop-free"
          size="2.5em" />
        <q-icon v-if="item.status == 'DISCONNECTED'"
          color="negative"
          size="2.5em"
          name="mdi-wifi-alert" />
        <q-icon name="mdi-wifi-arrow-up-down"
          color="positive"
          size="2.5em"
          v-if="item.status == 'CONNECTED'" />
        <q-icon v-if="['PAIRING', 'TIMEOUT'].includes(item.status)"
          color="negative"
          size="2.5em"
          name="mdi-wifi-strength-1-alert" />
        <q-spinner v-if="item.status == 'OPENING'"
          color="green-7"
          size="3em"
          :thickness="2" />
      </q-item-section>
      <q-item-section>
        <q-item-label v-if="item.status == 'qrcode'">
          <span class="text-weight-medium"> {{ $t('sessaoItemStatus.waitingQrCode') }} </span>
          <span class="row col"> {{ $t('sessaoItemStatus.clickQrCodeButton') }} </span>
        </q-item-label>
        <q-item-label v-if="item.status == 'DISCONNECTED'">
          <span class="text-weight-medium"> {{ $t('sessaoItemStatus.disconnectedError') }} </span>
          <span class="row col"
            v-if="item.type === 'whatsapp' || item.type === 'baileys'"> 
            {{ $t('sessaoItemStatus.whatsappDisconnected') }} 
          </span>  
          <span class="row col"
            v-if="item.type === 'waba'"> 
            {{ $t('sessaoItemStatus.wabaDisconnected') }} 
          </span>
          <span class="row col"
            v-if="item.type === 'telegram'"> 
            {{ $t('sessaoItemStatus.telegramDisconnected') }} 
          </span>
          <span class="row col"
            v-if="item.type === 'instagram'"> 
            {{ $t('sessaoItemStatus.instagramDisconnected') }} 
          </span>
          <span class="row col"
            v-if="item.type === 'messenger'"> 
            {{ $t('sessaoItemStatus.messengerDisconnected') }} 
          </span>
        </q-item-label>
        <q-item-label v-if="item.status == 'CONNECTED' && (item.type === 'meow' || item.type === 'evo' || item.type === 'webchat' || item.type === 'zapi' || item.type === 'uazapi')">  
          <span class="text-weight-medium blur-effect connection-info"> {{ $t('sessaoItemStatus.connectionEstablished') }}: {{ item.number}} || {{item.wabaId}}</span>
        </q-item-label>
        <q-item-label v-if="item.status == 'CONNECTED' && (item.type === 'waba' || item.type === 'instagram' || item.type === 'messenger')">  
          <span class="text-weight-medium blur-effect connection-info"> {{ $t('sessaoItemStatus.connectionEstablished') }}: {{item.tokenAPI}}</span>
        </q-item-label>
        <q-item-label v-if="item.status == 'CONNECTED' && item.type === 'telegram'">  
          <span class="text-weight-medium blur-effect connection-info"> {{ $t('sessaoItemStatus.connectionEstablished') }}: {{item.name}}</span>
        </q-item-label>
        <q-item-label v-if="item.status == 'CONNECTED' && item.type === 'whatsapp' || item.type === 'baileys' || item.type.includes('hub')">  
          <span class="text-weight-medium blur-effect connection-info">
            {{ $t('sessaoItemStatus.connectionEstablished') }}: 
            <template v-if="item.number" >{{ item.number }}</template>
            <template v-else>{{ $t('sessaoItemStatus.noDataLoading') }}</template>
          </span>
        </q-item-label>
        <q-item-label v-if="item.status == 'CONNECTED' && item.type === 'whatsapp' || item.type === 'baileys' || item.type === 'waba' || item.type === 'instagram' || item.type === 'messenger' || item.type === 'meow' || item.type === 'evo' || item.type === 'zapi' || item.type === 'uazapi'">
          <template v-if="item.profilePic !== 'disabled' && !item?.profilePic?.includes('nopicture.png')">
            <img @error="handleImageError(item)" class="blur-effect" :src="item.profilePic" alt="Perfil" style="width: 30px; height: 30px; object-fit: cover; border-radius: 50%; vertical-align: middle; margin-right: 5px;">
          </template>
          <template v-else>
            <span class="mdi mdi-whatsapp" style="font-size: 30px; height: 30px; width: 30px; border-radius: 50%; vertical-align: middle; margin-right: 5px;"></span>
          </template>
          <span class="text-weight-medium">
            <template v-if="item.phone && (item.phone.pushname || item.phone.name)">{{ item.phone.pushname || item.phone.name || item.phone.phone }}</template>
            <!-- <template v-else>Carregando dados...</template> -->
          </span>
        </q-item-label>
        <q-item-label class="blur-effect" v-if="item.status == 'CONNECTED' && item.type.includes('hub')">
          <template v-if="item.profilePic !== 'disabled' && !item.profilePic.includes('nopicture.png')">
            <img @error="handleImageError(item)" class="blur-effect" :src="item.profilePic" alt="Perfil" style="width: 30px; height: 30px; object-fit: cover; border-radius: 50%; vertical-align: middle; margin-right: 5px;">
          </template>
          <template v-else>
            <q-icon
              style="font-size: 30px; height: 30px; width: 30px; border-radius: 50%; vertical-align: middle; margin-right: 5px;"
              :name="`img:${item.type}-logo.png`"
            />
          </template>
          <span class="text-weight-medium">
            <template v-if="item.phone && (item.phone.pushname || item.phone.name)">{{ item.phone.pushname || item.phone.name || item.phone.phone }}</template>
            <!-- <template v-else>Carregando dados...</template> -->
          </span>
        </q-item-label>
        <!-- <q-item-label v-if="item.status == 'CONNECTED' && item.type === 'whatsapp'">  
          <span class="text-weight-medium"> Conexão estabelecida: {{item.number}}</span>
        </q-item-label>
        <q-item-label v-if="item.status == 'CONNECTED' && item.type === 'whatsapp'">
          <img :src="item.profilePic" alt="Perfil" style="width: 30px; height: 30px; object-fit: cover; border-radius: 50%; vertical-align: middle; margin-right: 5px;">
          <span class="text-weight-medium"> {{item.phone.pushname}}</span>
        </q-item-label> -->
        <q-item-label v-if="['PAIRING', 'TIMEOUT'].includes(item.status)">
          <span class="text-weight-medium"> {{ $t('sessaoItemStatus.lostConnection') }} </span>
          <span class="row col"> {{ $t('sessaoItemStatus.checkPhoneConnection') }} </span>
          <!-- <span class="text-weight-medium"> A conexão com o celular foi perdida </span>
          <span class="row col"> Certifique-se de que seu celular esteja conectado à internet e o WhatsApp esteja
            aberto, ou clique no botão 'Desconectar' para obter um novo QR Code </span> -->
        </q-item-label>
        <q-item-label v-if="item.status == 'OPENING'">
          <span class="text-weight-medium"> {{ $t('sessaoItemStatus.establishingConnection') }} </span>
          <span class="row col"> {{ $t('sessaoItemStatus.mightTakeTime') }} </span>
          <!-- <span class="text-weight-medium"> Estabelecendo conexão. </span>
          <span class="row col"> Isso poderá demorar um pouco... </span> -->
        </q-item-label>
        <q-item-label caption>
          {{ $t('sessaoItemStatus.lastUpdate') }}: {{ formatarData(item.updatedAt, 'dd/MM/yyyy HH:mm') }}
        </q-item-label>
        <!-- Ícones de configuração: ChatFlow, Queue e User -->
        <q-item-label v-if="item.status == 'CONNECTED' && (item.type === 'whatsapp' || item.type === 'baileys' || item.type === 'waba' || item.type === 'instagram' || item.type === 'messenger' || item.type === 'meow' || item.type === 'evo' || item.type === 'zapi' || item.type === 'uazapi' || item.type.includes('hub')) && (item.chatFlowId || item.queueId || item.userId)" style="margin-top: 6px;">
          <span style="display: inline-flex; align-items: center; gap: 8px;">
            <q-icon 
              v-if="item.chatFlowId" 
              name="mdi-robot" 
              size="18px" 
              color="primary">
              <q-tooltip>ChatFlow ID: {{ item.chatFlowId }}</q-tooltip>
            </q-icon>
            <q-icon 
              v-if="item.queueId" 
              name="mdi-format-list-bulleted" 
              size="18px" 
              color="secondary">
              <q-tooltip>Queue ID: {{ item.queueId }}</q-tooltip>
            </q-icon>
            <q-icon 
              v-if="item.userId" 
              name="mdi-account" 
              size="18px" 
              color="positive">
              <q-tooltip>User ID: {{ item.userId }}</q-tooltip>
            </q-icon>
          </span>
        </q-item-label>
      </q-item-section>
    </q-item>
  </div>
</template>

<script>
import bus from 'src/utils/eventBus'

import { format, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt-BR/index'
import { RemoverFotoNula } from 'src/service/sessoesWhatsapp.js'

export default {
  name: 'ItemStatusChannel',
  props: {
    item: {
      type: Object,
      default: () => { }
    }
  },
  methods: {
    async handleImageError(item) {
      // Validação mais robusta antes de chamar a API
      if(!item || !item.id || typeof item.id !== 'number' || item.id <= 0) {
        console.warn('ItemStatusChannel: handleImageError - item.id inválido:', item?.id);
        return;
      }
      try {
        await RemoverFotoNula(item.id);
      } catch (error) {
        console.error('ItemStatusChannel: Erro ao remover foto nula:', error);
        // Não propagar o erro para não quebrar a UI
      }
    },
    formatarData (data, formato) {
      return format(parseISO(data), formato, { locale: pt })
    },
  }
}
</script>

<style lang="scss" scoped>
.status-card {
  background: rgba(255,255,255,0.92);
  border-radius: 20px;
  box-shadow: 0 6px 32px rgba(0,0,0,0.13);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0,0,0,0.06);
  padding: 1rem;
  margin-bottom: 1rem;
  transition: box-shadow 0.2s;
}

.q-item {
  border-radius: 12px;
  padding: 0.5rem 0.7rem;
  transition: background 0.2s;
  &:hover {
    background: rgba(var(--q-primary-rgb),0.06);
  }
}

.q-item-section[avatar] {
  display: flex;
  align-items: center;
  justify-content: center;
}

.q-icon, .mdi {
  border-radius: 50%;
  background: rgba(var(--q-primary-rgb),0.07);
  padding: 0.2rem;
  margin-right: 0.5rem;
  transition: background 0.2s, transform 0.2s;
  &:hover {
    background: rgba(var(--q-primary-rgb),0.15);
    transform: scale(1.08);
  }
}

img.blur-effect {
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  border: 2px solid rgba(var(--q-primary-rgb),0.13);
  background: #fff;
  transition: box-shadow 0.2s, border 0.2s;
}

.q-item-label {
  font-size: 1rem;
  font-weight: 500;
  color: #222;
  margin-bottom: 0.2rem;
  line-height: 1.3;
}

.q-item-label.caption {
  font-size: 0.85rem;
  color: #888;
  margin-top: 0.2rem;
}

.blur-effect {
  filter: blur(0px);
}

.connection-info {
  word-break: break-all;
  overflow-wrap: break-word;
  max-width: 100%;
  display: inline-block;
  white-space: normal;
  line-height: 1.4;
  hyphens: auto;
}

body.body--dark {
  .status-card {
    background: rgba(30,30,30,0.98);
    box-shadow: 0 6px 32px rgba(0,0,0,0.22);
    border: 1px solid rgba(255,255,255,0.10);
  }
  .q-item-label {
    color: #e0e0e0;
  }
  .q-item-label.caption {
    color: #aaa;
  }
  img.blur-effect {
    background: #222;
    border: 2px solid rgba(var(--q-primary-rgb),0.22);
  }
}

@media (max-width: 600px) {
  .status-card {
    padding: 0.5rem;
    border-radius: 10px;
  }
  .q-item {
    padding: 0.3rem 0.3rem;
  }
  .q-item-label {
    font-size: 0.95rem;
  }
  .connection-info {
    font-size: 0.9rem;
    word-break: break-word;
    overflow-wrap: anywhere;
  }
}
</style>