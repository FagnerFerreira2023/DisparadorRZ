<template>
  <div class="q-pa-md">
    <transition-group appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
      <div v-for="(mensagem, index) in mensagens" :key="`mensagem-${index}`">
        <hr 
          v-if="isNewTicket(index)" 
          :key="'ticket-' + index"
          class="hr-text q-mt-lg q-mb-md"
          :data-content="'Ticket #' + mensagem?.ticketId +  (' - ' + mensagem.ticket?.user?.name || ' - ') + ' - ' + (mensagem.ticket ? formatarData(mensagem.ticket?.createdAt) : '') "

        />
        <hr
          v-if="isLineDate"
          :key="'hr-' + index"
          class="hr-text q-mt-lg q-mb-md"
          :data-content="formatarData(mensagem.createdAt)"
          v-show="index === 0 || formatarData(mensagem.createdAt) !== formatarData(mensagens[index - 1].createdAt)"
        />
        <template v-if="mensagens.length && index === mensagens.length - 1">
          <div :key="`ref-${mensagem.createdAt}`" ref="lastMessageRef" id="lastMessageRef" style="float: 'left'; background: 'black'; clear: 'both'"></div>
        </template>
        <div :key="`chat-message-${mensagem.id}`" :id="`chat-message-${mensagem.id}`"></div>
        <q-chat-message
          :key="mensagem.id"
          :data-message-id="mensagem.id"
          :stamp="formatarStampComFila(mensagem)"
          :sent="mensagem.fromMe"
          class="text-weight-medium"
          :bg-color="mensagem.fromMe ? 'grey-2' : $q.dark.isActive ? 'blue-2' : 'blue-1'"
          :class="{ pulseIdentications: identificarMensagem == `chat-message-${mensagem.id}` }"
        >
          <!-- :bg-color="mensagem.fromMe ? 'grey-2' : 'secondary' " -->
          <div style="min-width: 100px; max-width: 350px" :style="mensagem.isDeleted ? 'color: rgba(0, 0, 0, 0.36) !important;' : ''">
            <q-checkbox
              v-if="ativarMultiEncaminhamento && usuarioDados?.restrictedUser !== 'enabled'"
              :key="`cheked-chat-message-${mensagem.id}`"
              :class="{
                'absolute-top-right checkbox-encaminhar-right': !mensagem.fromMe,
                'absolute-top-left checkbox-encaminhar-left': mensagem.fromMe,
              }"
              :ref="`box-chat-message-${mensagem.id}`"
              :model-value="isMensagemSelecionada(mensagem)"
              @update:model-value="(value) => verificarEncaminharMensagem(mensagem, value)"
            />
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
                <div class="row col" v-if="mensagem.isDeleted">
                  <!-- <q-chip color="red-3" icon="mdi-trash-can-outline"> Envio cancelado: {{ formatarData(mensagem.updatedAt, 'dd/MM/yyyy') }} </q-chip> -->
                  <q-chip color="red-3" icon="mdi-trash-can-outline">
                    {{ $t('atendimentoMensagemChat.labels.enviadoCancelado', { data: formatarData(mensagem.updatedAt, 'dd/MM/yyyy') }) }}
                  </q-chip>
                </div>
                <div class="row col">
                  <q-chip color="blue-1" icon="mdi-calendar-import">
                    {{ $t('atendimentoMensagemChat.labels.criadoEm', { data: formatarData(mensagem.createdAt, 'dd/MM/yyyy HH:mm') }) }}
                  </q-chip>
                  <!-- <q-chip color="blue-1" icon="mdi-calendar-import"> Criado em: {{ formatarData(mensagem.createdAt, 'dd/MM/yyyy HH:mm') }} </q-chip> -->
                </div>
                <div class="row col">
                  <q-chip color="blue-1" icon="mdi-calendar-start">
                    {{ $t('atendimentoMensagemChat.labels.programadoPara', { data: formatarData(mensagem.scheduleDate, 'dd/MM/yyyy HH:mm') }) }}
                  </q-chip>
                  <!-- <q-chip color="blue-1" icon="mdi-calendar-start"> Programado para: {{ formatarData(mensagem.scheduleDate, 'dd/MM/yyyy HH:mm') }} </q-chip> -->
                </div>
              </q-tooltip>
            </q-icon>
            <q-icon
              @click="forcarMensagemIndividual(mensagem)"
              color="red"
              class="q-ma-xs cursor-pointer"
              name="mdi-clock-alert-outline"
              size="18px"
              v-if="mensagem.isDelayed"
            >
              <q-tooltip content-class="bg-secondary text-grey-8">
                <div class="row col">{{ $t('atendimentoMensagemChat.labels.mensagemNaoEntregue') }}</div>
              </q-tooltip>
            </q-icon>
            <div v-if="mensagem.isDeleted" class="text-italic">
              {{ $t('atendimentoMensagemChat.labels.mensagemApagada', { data: formatarData(mensagem.updatedAt, 'dd/MM/yyyy') }) }}
            </div>
            <!-- <div v-if="mensagem.isDeleted" class="text-italic">
              Mensagem apagada em {{ formatarData(mensagem.updatedAt, 'dd/MM/yyyy') }}.
            </div> -->
            <div v-if="isGroupLabel(mensagem)" class="q-mb-sm" style="display: flex; color: rgb(59 23 251); font-weight: 500">
              {{ isGroupLabel(mensagem) }}
            </div>
            <div v-if="mensagem.quotedMsg" :class="{ textContentItem: !mensagem.isDeleted, textContentItemDeleted: mensagem.isDeleted }">
              <MensagemRespondida
                style="max-width: 240px; max-height: 150px"
                class="row justify-center"
                @mensagem-respondida:focar-mensagem="focarMensagem"
                :mensagem="mensagem.quotedMsg"
              />
            </div>
            <!-- <q-btn v-if="!mensagem.isDeleted && isShowOptions" class="absolute-top-right mostar-btn-opcoes-chat" dense flat ripple round icon="mdi-chevron-down"> -->
            <q-btn v-if="!mensagem.isDeleted && isShowOptions" class="absolute-top-right" dense flat ripple round icon="mdi-chevron-down">  
              <q-menu square auto-close anchor="bottom left" self="top left">
                <q-list style="min-width: 100px">
                  <q-item :disable="!['whatsapp', 'telegram', 'baileys', 'evo', 'meow', 'waba', 'uazapi', 'zapi'].includes(ticketFocado.channel)" clickable @click="citarMensagem(mensagem)"  v-if="(ticketFocado.channel === 'whatsapp' || ticketFocado.channel === 'baileys' || ticketFocado.channel === 'evo' || ticketFocado.channel === 'meow' || ticketFocado.channel === 'waba' || ticketFocado.channel === 'uazapi' || ticketFocado.channel === 'zapi') && (mensagem.mediaType !== 'notes' && mensagem.mediaType !== 'transcription' && mensagem.mediaType !== 'transfer') ">
                    <q-item-section>{{ $t('common.reply') }}</q-item-section>
                    <q-tooltip v-if="!['whatsapp', 'telegram', 'baileys'].includes(ticketFocado.channel)"> Disponível apenas para WhatsApp, Telegram e Baileys </q-tooltip>
                  </q-item>
                  <q-item clickable @click="encaminharMensagem(mensagem)" v-if="usuarioDados?.restrictedUser !== 'enabled' && mensagem.mediaType !== 'button' && mensagem.mediaType !== 'list' && mensagem.mediaType !== 'templates' && mensagem.mediaType !== 'vcard' && mensagem.mediaType !== 'contactMessage' && mensagem.mediaType !== 'contactsArrayMessage' && mensagem.mediaType !== 'location' && mensagem.mediaType !== 'locationMessage' && mensagem.mediaType !== 'liveLocationMessage' && mensagem.mediaType !== 'location_request' && mensagem.mediaType !== 'cta_url' && mensagem.mediaType !== 'reply_buttons'" >
                    <q-item-section>{{ $t('common.forward') }}</q-item-section>
                  </q-item>
                  <q-item clickable @click="marcarMensagensParaEncaminhar(mensagem)" v-if="usuarioDados?.restrictedUser !== 'enabled' && mensagem.mediaType !== 'button' && mensagem.mediaType !== 'list' && mensagem.mediaType !== 'templates' && mensagem.mediaType !== 'vcard' && mensagem.mediaType !== 'contactMessage' && mensagem.mediaType !== 'contactsArrayMessage' && mensagem.mediaType !== 'location' && mensagem.mediaType !== 'locationMessage' && mensagem.mediaType !== 'liveLocationMessage' && mensagem.mediaType !== 'location_request' && mensagem.mediaType !== 'cta_url' && mensagem.mediaType !== 'reply_buttons' ">
                    <q-item-section>{{ $t('common.markToForward') }}</q-item-section>
                  </q-item>
                  <q-item clickable @click="encaminharParaOutroCanal(mensagem)" v-if="usuarioDados?.restrictedUser !== 'enabled' && mensagem.mediaType !== 'button' && mensagem.mediaType !== 'list' && mensagem.mediaType !== 'templates' && mensagem.mediaType !== 'vcard' && mensagem.mediaType !== 'contactMessage' && mensagem.mediaType !== 'contactsArrayMessage' && mensagem.mediaType !== 'location' && mensagem.mediaType !== 'locationMessage' && mensagem.mediaType !== 'liveLocationMessage' && mensagem.mediaType !== 'location_request' && mensagem.mediaType !== 'cta_url' && mensagem.mediaType !== 'reply_buttons'" >
                    <q-item-section>
                      <q-item-label>{{ $t('common.forwardToOtherChannel') || 'Encaminhar para Outro Canal' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item clickable @click="encaminharParaChatPrivado(mensagem)" v-if="mensagem.mediaType !== 'button' && mensagem.mediaType !== 'list' && mensagem.mediaType !== 'templates' && mensagem.mediaType !== 'vcard' && mensagem.mediaType !== 'contactMessage' && mensagem.mediaType !== 'contactsArrayMessage' && mensagem.mediaType !== 'location' && mensagem.mediaType !== 'locationMessage' && mensagem.mediaType !== 'liveLocationMessage' && mensagem.mediaType !== 'location_request' && mensagem.mediaType !== 'cta_url' && mensagem.mediaType !== 'reply_buttons'" >
                    <q-item-section>
                      <q-item-label>{{ $t('common.forwardToPrivateChat') || 'Encaminhar para Chat Privado' }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-item :disable="!['whatsapp', 'telegram', 'baileys', 'waba', 'meow', 'evo', 'uazapi', 'zapi'].includes(ticketFocado.channel)" clickable @click="mensagemReacao = mensagem; modalEmojiOpen = true" v-if="(mensagem.mediaType !== 'notes' && mensagem.mediaType !== 'transcription') && (ticketFocado.channel === 'whatsapp' || ticketFocado.channel === 'baileys' || ticketFocado.channel === 'waba' || ticketFocado.channel === 'meow' || ticketFocado.channel === 'evo' || ticketFocado.channel === 'uazapi' || ticketFocado.channel === 'zapi' || ticketFocado.channel === 'instagram')">
                    <q-item-section>{{ $t('common.react') }}</q-item-section>
                  </q-item>
                  <q-item :disable="!['whatsapp', 'telegram', 'baileys', 'meow', 'evo', 'uazapi', 'zapi'].includes(ticketFocado.channel)" clickable @click="abrirModalEdicao(mensagem)" v-if="(mensagem.mediaType === 'chat' || mensagem.mediaType === 'extendedTextMessage' || mensagem.mediaType === 'conversartion' ) && (ticketFocado.channel === 'whatsapp' || ticketFocado.channel === 'baileys' || ticketFocado.channel === 'meow' || ticketFocado.channel === 'evo' || ticketFocado.channel === 'uazapi' || ticketFocado.channel === 'zapi') && !mensagem.scheduleDate && mensagem.fromMe">
                    <q-item-section>{{ $t('common.edit') }}</q-item-section>
                  </q-item>
                  <q-item :disable="!['whatsapp', 'telegram', 'baileys', 'waba', 'evo', 'meow', 'uazapi', 'zapi', 'instagram', 'messenger'].includes(ticketFocado.channel)" clickable @click="baixarAudio(mensagem)" v-if="(mensagem.mediaType === 'audio' || mensagem.mediaType === 'audioMessage')">
                    <q-item-section>{{ $t('common.download') }}</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item @click="deletarMensagem(mensagem)" clickable v-if="mensagem.fromMe && (mensagem.mediaType !== 'notes' && mensagem.mediaType !== 'transcription' && mensagem.mediaType !== 'transfer')" :disable="isDesactivatDelete(mensagem) || (ticketFocado.channel === 'messenger' || ticketFocado.channel === 'waba' || ticketFocado.channel === 'instagram')">
                    <q-item-section>
                      <q-item-label>{{ $t('common.delete2') }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
            <q-icon v-if="mensagem.fromMe" class="absolute-bottom-right q-pr-xs q-pb-xs" :name="ackIcons[mensagem.ack]" size="1.2em" :color="mensagem.ack >= 3 ? 'blue-12' : ''" />
            <!-- <template v-if="mensagem.mediaType === 'audio'">
              <div style="width: 330px; heigth: 300px">
                <audio class="q-mt-md full-width" controls ref="audioMessage" controlsList="nodownload noplaybackrate volume novolume">
                  <source :src="mensagem.mediaUrl" type="audio/ogg" />
                </audio>
              </div>
            </template> -->
            <div class="contact-container">
              <q-avatar size="30px" class="q-mr-sm">
                <img
                  v-if="!mensagem.fromMe && mensagem.contact?.profilePicUrl && mensagem.contact.profilePicUrl !== 'null' && mensagem.contact.profilePicUrl !== 'undefined'"
                  class="blur-effect"
                  :src="mensagem.contact.profilePicUrl"
                  @error="hideImage"
                  alt="Avatar"
                />
                <img
                  v-else
                  src="nopicture.png"
                  @error="hideImage"
                  alt="Avatar padrão"
                />
              </q-avatar>
              <span class="contact-name" v-if="mensagem.fromMe">
                {{ mensagem.user?.name || $t('atendimentoMensagemChat.system') }}
              </span>
              <span class="contact-name" v-if="!mensagem.fromMe">
                {{ mensagem.contact?.name || mensagem.contact?.number || $t('atendimentoMensagemChat.noName') }}
              </span>
            </div>
            <template v-if="mensagem.mediaType === 'audio' && mensagem.mediaUrl">
              <div style="width: 330px; height: 100%" v-if="audioModulo === 'enabled'">
                <AudioMessage :audioSrc="mensagem.mediaUrl" />
              </div>
              <div style="width: 330px; height: 100%" v-else>
                <audio class="q-mt-md full-width"
                  controls
                  ref="audioMessage"
                  controlsList="download playbackrate volume">
                  <source :src="getAudioSource(mensagem.mediaUrl)" type="audio/mp3" />
                </audio>
              </div>
            </template>
            <template v-if="mensagem.mediaType === 'audioMessage' && mensagem.mediaUrl">
              <div style="width: 330px; height: 100%" v-if="audioModulo === 'enabled'">
                <AudioMessage :audioSrc="mensagem.mediaUrl" />
              </div>
              <div style="width: 330px; height: 100%" v-else>
                <audio class="q-mt-md full-width"
                  controls
                  ref="audioMessage"
                  controlsList="download playbackrate volume">
                  <source :src="mensagem.mediaUrl" type="audio/mp3" />
                </audio>
              </div>
            </template>
            <template v-if="['vcard', 'contactMessage', 'contactsArrayMessage'].includes(mensagem.mediaType)">
              <VCard :vcard=" mensagem.body " :oldTicket=" ticketFocado " />
              <q-btn full-width color="primary " style="width: 100%;margin-top: 0.5rem" icon="mdi-download-outline"  type="a"
                download="vCard"
                :href="`data:text/x-vcard;charset=utf-8;base64,${returnCardContato(mensagem.body)}`">
                <span style="margin-left: 10px;">{{ $t('common.download2') }}</span>
              </q-btn>
            </template>
            <template v-if="mensagem.mediaType === 'sticker'">
              <!-- @click="buscarImageCors(mensagem.mediaUrl)" -->
              <q-img
                v-if="mensagem.mediaUrl"
                @click="urlMedia = mensagem.mediaUrl; abrirModalImagem = true"
                :src="mensagem.mediaUrl"
                spinner-color="primary"
                height="100px"
                width="100px"
                class="q-mt-md"
                style="cursor: pointer"
              />
              <VueEasyLightbox moveDisabled :visible="abrirModalImagem" :imgs="urlMedia" :index="mensagem.ticketId || 1" @hide="abrirModalImagem = false" />
            </template>
            <template v-if="['location', 'locationMessage', 'liveLocationMessage'].includes(mensagem.mediaType)">
              <!-- @click="buscarImageCors(mensagem.mediaUrl)" -->
              <q-img
                @click="openLinkInNewPage(mensagem.body)"
                src="/location.jpg"
                spinner-color="primary"
                height="150px"
                width="330px"
                class="q-mt-md"
                style="cursor: pointer"
              />
              <VueEasyLightbox moveDisabled :visible="abrirModalImagem" :imgs="urlMedia" :index="mensagem.ticketId || 1" @hide="abrirModalImagem = false" />
            </template>
            
            <!-- Template para location_request -->
            <template v-if="mensagem.mediaType === 'location_request'">
              <div class="location-request-container q-mt-md">
                <div class="location-request-icon">
                  <q-icon name="mdi-map-marker" size="48px" color="primary" />
                </div>
                <div class="location-request-text q-mt-sm q-mb-md">
                  <div class="text-center text-grey-8">
                    {{ mensagem.body || 'Solicitação de localização' }}
                  </div>
                </div>
                <div class="text-center">
                  <q-btn
                    color="primary"
                    icon="mdi-map-marker"
                    :label="$t('inputMensagem.novo.sendLocation') || 'Enviar Localização'"
                    @click="enviarLocalizacao(mensagem)"
                    class="location-request-btn"
                    size="md"
                    rounded
                  />
                </div>
              </div>
            </template>
            
            <!-- Template para cta_url -->
            <template v-if="mensagem.mediaType === 'cta_url'">
              <div class="cta-url-container q-mt-md">
                <!-- Header com ícone e título -->
                <div class="cta-url-header">
                  <div class="cta-url-icon">
                    <q-icon name="mdi-link-variant" size="32px" color="white" />
                  </div>
                  <div class="cta-url-title">
                    <div class="cta-url-title-text">Call to Action URL</div>
                    <div class="cta-url-subtitle">Clique no botão para acessar o link</div>
                  </div>
                </div>
                
                <!-- Conteúdo da mensagem -->
                <div class="cta-url-content" v-if="mensagem.body">
                  <div class="cta-url-message" v-html="formatarMensagemCTAURL(mensagem.body)"></div>
                </div>
                
                <!-- Botão de ação -->
                <div class="cta-url-actions">
                  <q-btn
                    color="primary"
                    icon="mdi-link-variant"
                    label="Acessar Link"
                    @click="abrirCTALink(mensagem)"
                    class="cta-url-btn"
                    size="md"
                    rounded
                    unelevated
                  />
                </div>
              </div>
            </template>
            <template v-if="(mensagem.mediaType === 'media' && mensagem.mediaUrl)">
              <q-img
                v-if="mensagem.mediaUrl"
                @click="urlMedia = mensagem.mediaUrl; abrirModalImagem = true"
                :src="mensagem.mediaUrl"
                spinner-color="primary"
                height="150px"
                width="330px"
                class="q-mt-md"
                style="cursor: pointer"
              />
              <VueEasyLightbox v-if="mensagem.mediaUrl" moveDisabled :visible="abrirModalImagem" :imgs="urlMedia" :index="mensagem.ticketId || 1" @hide="abrirModalImagem = false" />
            </template>
            <template v-if="(mensagem.mediaType === 'imageMessage' || (mensagem.mediaUrl && mensagem.mediaType === 'image' && !mensagem.mediaUrl.includes('.webp'))) && !mensagem.isSticker">
              <!-- @click="buscarImageCors(mensagem.mediaUrl)" -->
              <q-img
                v-if="mensagem.mediaUrl"
                @click="urlMedia = mensagem.mediaUrl; abrirModalImagem = true"
                :src="mensagem.mediaUrl"
                spinner-color="primary"
                height="150px"
                width="330px"
                class="q-mt-md"
                style="cursor: pointer"
              />
              <VueEasyLightbox v-if="mensagem.mediaUrl" moveDisabled :visible="abrirModalImagem" :imgs="urlMedia" :index="mensagem.ticketId || 1" @hide="abrirModalImagem = false" />
            </template>
            <template v-if="mensagem.mediaUrl && mensagem.mediaType === 'image' && mensagem.mediaUrl.includes('.webp')">
              <!-- @click="buscarImageCors(mensagem.mediaUrl)" -->
              <q-img
                v-if="mensagem.mediaUrl"
                @click="urlMedia = mensagem.mediaUrl; abrirModalImagem = true"
                :src="mensagem.mediaUrl"
                spinner-color="primary"
                height="100px"
                width="100px"
                class="q-mt-md"
                style="cursor: pointer"
              />
              <VueEasyLightbox v-if="mensagem.mediaUrl" moveDisabled :visible="abrirModalImagem" :imgs="urlMedia" :index="mensagem.ticketId || 1" @hide="abrirModalImagem = false" />
            </template>
            <template v-if="mensagem.mediaUrl &&  (mensagem.mediaType === 'image' || mensagem.mediaType === 'stickerMessage') && !mensagem.mediaUrl.includes('.webp') && mensagem.isSticker">
              <!-- @click="buscarImageCors(mensagem.mediaUrl)" -->
              <q-img
                v-if="mensagem.mediaUrl"
                @click="urlMedia = mensagem.mediaUrl; abrirModalImagem = true"
                :src="mensagem.mediaUrl"
                spinner-color="primary"
                height="100px"
                width="100px"
                class="q-mt-md"
                style="cursor: pointer"
              />
              <VueEasyLightbox v-if="mensagem.mediaUrl" moveDisabled :visible="abrirModalImagem" :imgs="urlMedia" :index="mensagem.ticketId || 1" @hide="abrirModalImagem = false" />
            </template>
            <template v-if="mensagem.mediaType === 'video' || (mensagem.mediaType === 'videoMessage' && !mensagem.body.endsWith('.gif'))">
              <video
                v-if="mensagem.mediaUrl"
                :src="mensagem.mediaUrl"
                controls
                class="q-mt-md"
                style="object-fit: cover; width: 330px; height: 150px; border-top-left-radius: 8px; border-top-right-radius: 8px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px"
              ></video>
            </template>
            <template v-if="mensagem.mediaType === 'videoMessage' && mensagem.body.endsWith('.gif')">
              <img
                v-if="mensagem.mediaUrl"
                :src="mensagem.mediaUrl"
                class="q-mt-md"
                style="object-fit: cover; width: 330px; height: 150px; border-top-left-radius: 8px; border-top-right-radius: 8px; border-bottom-left-radius: 8px; border-bottom-right-radius: 8px"
              />
            </template>
            <template v-if="mensagem.mediaType === 'interactive'">
              <div style="margin-top:20px" v-html="formatarMensagemRespostaBotaoWhatsapp(mensagem.body)"></div>
            </template>
            <template v-if="mensagem.mediaType === 'interactive_nfm_reply'">
              <div style="margin-top:20px" v-html="formatarMensagemRespostaNfmWhatsapp(mensagem.body)"></div>
            </template>
            <template v-if="mensagem.mediaType === 'button' || mensagem.mediaType === 'reply_buttons'">
              <div style="margin-top:20px" v-html="formatarBotaoWhatsapp(mensagem.body)"></div>
            </template>
            <template v-if="mensagem.mediaType === 'list'">
              <div style="margin-top:20px" v-html="formatarMensagemDeLista(mensagem.body)"></div>
            </template>
            <template v-if="mensagem.mediaType === 'notes'" style="margin-top:20px">
              <div style="margin-top:20px" v-html="formatarNotas(mensagem.body)"></div>
            </template>
            <template v-if="mensagem.mediaType === 'transfer'" style="margin-top:20px">
              <div style="margin-top:20px" v-html="formatarTransferencia(mensagem.body)"></div>
            </template>
            <template v-if="mensagem.mediaType === 'transcription'" style="margin-top:20px">
              <div style="margin-top:20px" v-html="formatarTranscricao(mensagem.body)"></div>
            </template>
            <template v-if="mensagem.mediaType === 'templates'">
              <div v-html="formatarTemplates(mensagem.body)"></div>
            </template>
            <template v-if="mensagem.mediaType === 'order'">
              <div v-html="formatarOrder(mensagem.body)"></div>
            </template>
            <template v-if="mensagem.mediaType === 'orderMessage'">
              <div v-html="formatarOrderMessage(mensagem.body)"></div>
            </template>
            <template v-if="mensagem.mediaType === 'templateMessage'">
              <div v-html="formatarTemplateBaileys(mensagem.body)"></div>
            </template>
            <template v-if="mensagem.mediaType === 'adsMessage'">
              <div v-html="formatarAdsMessage(mensagem.body)"></div>
            </template>
            <template v-if="mensagem.mediaType === 'productMessage'">
              <div v-html="formatarProductMessage(mensagem.body)"></div>
            </template>
            <!-- <template v-if="mensagem.mediaType === 'button' && !mensagem.fromMe">
              <div style="margin-top:20px" v-html="formatarBotao(mensagem.body)"></div>
            </template> -->
            <template v-if="mensagem.mediaUrl && !['media', 'audio', 'audioMessage', 'vcard', 'contactMessage', 'contactsArrayMessage', 'liveLocationMessage', 'locationMessage', 'location_request', 'image', 'imageMessage', 'video', 'videoMessage', 'sticker', 'location', 'interactive_nfm_reply', 'interactive', 'button', 'reply_buttons', 'list', 'button_reply', 'sticker', 'notes', 'transcription', 'transfer', 'templateMessage', 'adsMessage', 'productMessage', 'order', 'orderMessage'].includes(mensagem.mediaType)">
              <div class="text-center full-width hide-scrollbar no-scroll">
                <q-icon :name="getFileIcon(mensagem.mediaUrl)" size="64px" :color="getFileIconColor(mensagem.mediaUrl)" class="q-mb-xs" />
                <div class="ellipsis q-mb-sm" style="max-width: 290px; margin: 0 auto;">{{ mensagem.mediaName }}</div>
                <q-btn
                  color="primary"
                  :class="['q-mt-sm', 'text-center', 'btn-rounded', 'ellipsis', $q.dark.isActive ? 'text-white' : 'text-primary']"
                  no-wrap
                  no-caps
                  stack
                  dense
                  @click="downloadFile(mensagem.mediaUrl, mensagem.mediaName || 'arquivo')"
                  :disable="mensagem.mediaUrl.includes('nullextension')"
                >
                  <q-tooltip v-if="mensagem.mediaUrl && !mensagem.mediaUrl.includes('nullextension')" content-class="text-bold">
                    {{$t('common.download2')}}: {{ mensagem.mediaName }}
                    {{ mensagem.body }}
                  </q-tooltip>
                  <q-tooltip v-if="mensagem.mediaUrl && mensagem.mediaUrl.includes('nullextension')" content-class="text-bold">
                    {{ mensagem.mediaName }}
                    {{ mensagem.body }}
                  </q-tooltip>
                  <div class="row items-center q-ma-xs">
                    <div class="ellipsis col-grow q-pr-sm" style="max-width: 290px">
                      {{ formatarMensagemWhatsapp(mensagem.body || mensagem.mediaName) }}
                    </div>
                    <q-icon name="mdi-download" />
                  </div>
                </q-btn>
              </div>
              <div v-if="mensagem.body && !mensagem.edition" v-html="formatarMensagemWhatsapp(mensagem.body)"></div>
            </template>
            <template v-if="mensagem.mediaUrl && ['media', 'image', 'video', 'imageMessage', 'videoMessage'].includes(mensagem.mediaType)" style="margin-top:20px">
              <div class="text-center full-width hide-scrollbar no-scroll">
                <q-btn
                  color="primary"
                  :class="['q-mt-sm', 'text-center', 'btn-rounded', 'ellipsis', $q.dark.isActive ? 'text-white' : 'text-primary']"
                  no-wrap
                  no-caps
                  stack
                  dense
                  @click="downloadFile(mensagem.mediaUrl, mensagem.mediaName || 'arquivo')"
                >
                  <q-tooltip v-if="mensagem.mediaUrl" content-class="text-bold">
                    {{$t('common.download2')}}: {{ mensagem.mediaName }}
                    {{ mensagem.body }}
                  </q-tooltip>
                  <div class="row items-center q-ma-xs">
                    <div class="ellipsis col-grow q-pr-sm" style="max-width: 290px">
                      {{ formatarMensagemWhatsapp(mensagem.body || mensagem.mediaName) }}
                    </div>
                    <q-icon name="mdi-download" />
                  </div>
                </q-btn>
              </div>
            </template>
            <div
              style="margin-top:20px"
              v-if="!['vcard', 'contactMessage', 'contactsArrayMessage','application', 'documentMessage', 'audio', 'button', 'reply_buttons', 'list', 'location', 'locationMessage', 'liveLocationMessage', 'location_request', 'cta_url', 'interactive', 'interactive_nfm_reply', 'button_reply', 'sticker', 'notes', 'templates', 'transcription', 'transfer', 'templateMessage', 'adsMessage', 'productMessage', 'order', 'orderMessage'].includes(mensagem.mediaType)"
              :class="{ 'q-mt-sm': mensagem.mediaType !== 'chat' }"
              class="q-message-container row items-end no-wrap"
            >
              <div v-if="mensagem.body && !mensagem.edition" v-html="formatarMensagemWhatsapp(mensagem.body)"></div>
            </div>
            <div v-if="mensagem.edition">
              <div v-html="formatarMensagemWhatsapp(mensagem.edition)"></div>
              <div v-if="mensagem.edition" class="reaction-container q-mt-xs">
                {{$t('common.edited')}}: {{ mensagem.body }}
              </div>
            </div>
            <div v-if="mensagem.reaction || mensagem.reactionFromMe" class="reaction-container q-mt-xs">
              {{ mensagem.reaction }} {{ mensagem.reactionFromMe }}
            </div>
            <div v-if="mensagem.syncTime" class="reaction-container q-mt-xs">
              {{$t('common.sync')}}: {{ mensagem.syncTime }}
            </div>
          </div>
        </q-chat-message>
      </div>
    </transition-group>
    <q-dialog v-model="abrirModalIframe">
      <q-card>
        <q-card-section>
          <iframe :src="urlIframe" width="100%" height="500px" frameborder="0"></iframe>
        </q-card-section>
        <q-card-actions>
          <q-btn flat :label="$t('common.close')" color="primary" @click="abrirModalIframe = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="modalEmojiOpen" :maximized="$q.screen.lt.sm" :position="$q.screen.gt.xs ? 'standard' : 'bottom'">
      <q-card class="emoji-picker-modal" :style="$q.screen.gt.xs ? 'min-width: 500px; max-width: 600px; max-height: 85vh;' : 'width: 100%; max-height: 85vh;'">
        <q-card-section class="q-pa-none" style="overflow: hidden;">
          <VEmojiPicker
            style="width: 40vw"
            :showSearch="false"
            :emojisByRow="calculateEmojisByRow()"
            :columns="calculateEmojisByRow()"
            :labelSearch="$t('common.search')"
            lang="pt-BR"
            @select="onInsertSelectEmoji"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
    <q-dialog v-model="modalEdicao">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ $t('atendimentoMensagemChat.labels.editarMensagem') }}</div>
        </q-card-section>

        <q-card-section v-if="mensagemEdicao">
          <q-input
            type="textarea"
            filled
            v-model="mensagemEdicao.body"
            :label="$t('common.message')"
            autogrow
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="primary" @click="modalEdicao = false" />
          <q-btn flat :label="$t('common.save')" color="primary" @click="salvarEdicao()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
// const userId = +localStorage.getItem('userId')
// import { CriarTicket } from 'src/service/tickets'
// import { mapGetters } from 'vuex'
import mixinCommon from './mixinCommon.js'
import axios from 'axios'
import VueEasyLightbox from 'vue-easy-lightbox'
import MensagemRespondida from './MensagemRespondida.vue'
import AudioMessage from './AudioMessage.vue'
const downloadImageCors = axios.create({
  baseURL: process.env.URL_API,
  timeout: 20000,
  headers: {
    responseType: 'blob',
  },
})
import { DeletarMensagem, SendReactionMessage, SendEditMessage } from 'src/service/tickets.js'
import { ForcarMensagemIndividual } from 'src/service/sessoesWhatsapp.js'
import { EnviarReacaoMeow, EnviarEdicaoMeow } from 'src/service/meow.js'
import { EnviarReacaoEvo, EnviarEdicaoEvo } from 'src/service/evo.js'
import { EnviarReacaoUazapi, EnviarEdicaoUazapi } from 'src/service/uazapi.js'
import { EnviarReacaoZapi, EnviarEdicaoZapi } from 'src/service/zapi.js'
import { uid } from 'quasar'
import { EnviarReacaoWaba } from 'src/service/waba.js'
import { EnviarReacaoInstagram } from 'src/service/instagram.js'
import { EnviarReacaoMessenger } from 'src/service/messenger.js'
import VCard from './VCard.vue'
import { VEmojiPicker } from 'src/components/VEmojiPicker.js';
import { Base64 } from 'js-base64'
import bus from 'src/utils/eventBus'
export default {
  name: 'MensagemChat',
  mixins: [mixinCommon],
  props: {
    mensagens: {
      type: Array,
      default: () => [],
    },
    mensagensParaEncaminhar: {
      type: Array,
      default: () => [],
    },
    size: {
      type: [String, Number],
      default: '5',
    },
    isLineDate: {
      type: Boolean,
      default: true,
    },
    isShowOptions: {
      type: Boolean,
      default: true,
    },
    ativarMultiEncaminhamento: {
      type: Boolean,
      default: false,
    },
    replyingMessage: {
      type: Object,
      default: () => {},
    },
  },
  // computed: {
  //   ...mapGetters(['whatsapps'])
  // },
  data() {
    return {
      audioModulo: null,
      modalEmojiOpen: false,
      // emojis: ['😀', '😂', '❤️', '😍', '😢', '👍', '👎'],
      mensagemReacao: null,
      modalEdicao: false,
      mensagemOriginal: null, 
      mensagemEdicao: { body: '' },
      abrirModalIframe: false,
      urlIframe: '',
      abrirModalImagem: false,
      urlMedia: '',
      identificarMensagem: null,
      usuarioDados: null,
      ackIcons: {
        // Se ACK == 3 ou 4 entao color green
        0: 'mdi-clock-outline',
        1: 'mdi-check',
        2: 'mdi-check-all',
        3: 'mdi-check-all',
        4: 'mdi-check-all',
      },
      // Sistema de gerenciamento de memória
      timers: [],
      eventListeners: [],
    }
  },
  components: {
    AudioMessage,
    VueEasyLightbox,
    MensagemRespondida,
    VCard,
    VEmojiPicker
  },
  methods: {
    // Sistema de gerenciamento de memória
    addTimer(timerId) {
      this.timers.push(timerId);
    },
    addEventListener(element, event, handler, options = {}) {
      element.addEventListener(event, handler, options);
      this.eventListeners.push({ element, event, handler, options });
    },
    clearAllTimers() {
      this.timers.forEach(timerId => {
        clearTimeout(timerId);
        clearInterval(timerId);
      });
      this.timers = [];
    },
    removeAllEventListeners() {
      this.eventListeners.forEach(({ element, event, handler, options }) => {
        element.removeEventListener(event, handler, options);
      });
      this.eventListeners = [];
    },
    cleanupMemory() {
      this.clearAllTimers();
      this.removeAllEventListeners();
    },
    hideImage(event) {
      // Fallback para imagem padrão quando a URL do perfil falhar
      const fallbackSrc = 'nopicture.png';
      if (event && event.target) {
        // evita loop infinito caso o fallback também falhe
        if (!event.target.dataset.fallbackApplied) {
          event.target.dataset.fallbackApplied = 'true';
          event.target.src = fallbackSrc;
          event.target.style.display = '';
        } else {
          // Como último recurso, mantém o container visível
          event.target.style.display = '';
        }
      }
    },
    isNewTicket(index) {
      if (index === 0) return true;
      return this.mensagens[index].ticketId !== this.mensagens[index - 1].ticketId;
    },
    async forcarMensagemIndividual(mensagem){
      this.$q.dialog({
        title: this.$t('atendimentoMensagemChat.dialogs.reenviarTitulo'),
        message: this.$t('atendimentoMensagemChat.dialogs.reenviarMensagem'),
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
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('atendimentoMensagemChat.notifications.processoIniciado'),
        });
        this.loading = true;
        try{
          await ForcarMensagemIndividual(mensagem)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: this.$t('atendimentoMensagemChat.notifications.tentandoEnviar'),
          });
          this.loading = false;
        } catch(e){
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: `${this.$t('atendimentoMensagemChat.notifications.erroEnvio')} ${e.data.error}`,
          });
          this.loading = false;
        }
      })

    },
    async baixarAudio(mensagem) {
      await this.downloadFile(mensagem.mediaUrl, 'audio.mp3');
    },
    
    async downloadFile(fileUrl, fileName) {
      try {
        // Em dev, roteia via proxy para evitar CORS
        const buildProxiedUrl = (u) => {
          try {
            const parsed = new URL(u)
            const path = parsed.pathname + (parsed.search || '')
            // Se estivermos usando proxy (URL_API relativa), prefixa com URL_API
            if ((process.env.URL_API || '').startsWith('/')) {
              return `${process.env.URL_API}${path}`
            }
            return u
          } catch (e) {
            // Se já for relativo
            if (u.startsWith('/public/')) {
              return `${process.env.URL_API}${u}`
            }
            return u
          }
        }
        const url = buildProxiedUrl(fileUrl)

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Origin': window.location.origin,
            'X-Requested-With': 'XMLHttpRequest'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Obter o blob do arquivo
        const blob = await response.blob();
        
        // Criar URL do blob
        const urlBlob = window.URL.createObjectURL(blob);
        
        // Criar link para download
        const link = document.createElement('a');
        link.href = urlBlob;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        
        // Limpar
        document.body.removeChild(link);
        window.URL.revokeObjectURL(urlBlob);
        
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('common.downloadSuccess') || 'Download iniciado com sucesso!',
        });
      } catch (error) {
        console.error('Erro ao baixar arquivo:', error);
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: this.$t('common.downloadError') || 'Erro ao baixar arquivo',
        });
      }
    },
    openLinkInNewPage(url) {
      window.open(url, '_blank');
    },
    
    enviarLocalizacao(mensagem) {
      // Emitir evento para o componente pai lidar com o envio de localização
      this.$emit('mensagem-chat:solicitar-localizacao', mensagem);
      
      // Notificar o usuário
      this.$q.notify({
        color: 'info',
        position: 'top',
        message: this.$t('common.locationRequested') || 'Solicitação de localização enviada',
        icon: 'mdi-map-marker'
      });
    },
    
    abrirCTALink(mensagem) {
      try {
        // Extrair a URL do botão do body da mensagem
        const body = mensagem.body || '';
        const urlMatch = body.match(/🌐 \*\*URL do Botão:\*\* (https?:\/\/[^\s\n]+)/);
        
        if (urlMatch && urlMatch[1]) {
          const url = urlMatch[1];
          window.open(url, '_blank');
          
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: 'Link aberto em nova aba',
            icon: 'mdi-link-variant'
          });
        } else {
          // Se não conseguir extrair a URL, mostrar notificação de erro
          this.$q.notify({
            color: 'warning',
            position: 'top',
            message: 'URL não encontrada na mensagem',
            icon: 'mdi-alert'
          });
        }
      } catch (error) {
        console.error('Erro ao abrir CTA link:', error);
        this.$q.notify({
          color: 'negative',
          position: 'top',
          message: 'Erro ao abrir link',
          icon: 'mdi-alert-circle'
        });
      }
    },
    
    formatarMensagemCTAURL(body) {
      try {
        if (!body) return '';
        
        // Extrair informações específicas do CTA URL
        const mensagemMatch = body.match(/📝 \*\*Mensagem:\*\* (.+?)(?=\n🔘|$)/);
        const botaoMatch = body.match(/🔘 \*\*Texto do Botão:\*\* (.+?)(?=\n🌐|$)/);
        const urlMatch = body.match(/🌐 \*\*URL do Botão:\*\* (.+?)(?=\n📋|$)/);
        const footerMatch = body.match(/📋 \*\*Rodapé:\*\* (.+?)(?=\n📌|$)/);
        const headerMatch = body.match(/📌 \*\*Cabeçalho:\*\* (.+?)(?=\n📝|$)/);
        const headerTextMatch = body.match(/📝 \*\*Texto do Cabeçalho:\*\* (.+?)(?=\n🔗|$)/);
        const headerLinkMatch = body.match(/🔗 \*\*Link do Cabeçalho:\*\* (.+?)(?=\n🆔|$)/);
        const headerIdMatch = body.match(/🆔 \*\*ID do Cabeçalho:\*\* (.+?)(?=\n|$)/);
        
        let html = '';
        
        // Mensagem principal
        if (mensagemMatch && mensagemMatch[1] && mensagemMatch[1].trim() !== 'N/A') {
          html += `<div class="cta-url-message-main">
                      <div class="cta-url-message-label">Mensagem:</div>
                      <div class="cta-url-message-text">${mensagemMatch[1].trim()}</div>
                    </div>`;
        }
        
        // Botão
        if (botaoMatch && botaoMatch[1] && botaoMatch[1].trim() !== 'N/A') {
          html += `<div class="cta-url-button-info">
                      <div class="cta-url-message-label">Botão:</div>
                      <div class="cta-url-message-text">${botaoMatch[1].trim()}</div>
                    </div>`;
        }
        
        // URL
        if (urlMatch && urlMatch[1] && urlMatch[1].trim() !== 'N/A') {
          html += `<div class="cta-url-url-info">
                      <div class="cta-url-message-label">URL:</div>
                      <div class="cta-url-url-text">${urlMatch[1].trim()}</div>
                    </div>`;
        }
        
        // Footer
        if (footerMatch && footerMatch[1] && footerMatch[1].trim() !== 'N/A') {
          html += `<div class="cta-url-footer-info">
                      <div class="cta-url-message-label">Rodapé:</div>
                      <div class="cta-url-message-text">${footerMatch[1].trim()}</div>
                    </div>`;
        }
        
        // Header (se existir)
        if (headerMatch && headerMatch[1] && headerMatch[1].trim() !== 'N/A') {
          html += `<div class="cta-url-header-info">
                      <div class="cta-url-message-label">Cabeçalho:</div>
                      <div class="cta-url-header-details">`;
          
          if (headerMatch[1].trim() !== 'N/A') {
            html += `<div class="cta-url-header-type">${headerMatch[1].trim()}</div>`;
          }
          
          if (headerTextMatch && headerTextMatch[1] && headerTextMatch[1].trim() !== 'N/A') {
            html += `<div class="cta-url-header-text">${headerTextMatch[1].trim()}</div>`;
          }
          
          if (headerLinkMatch && headerLinkMatch[1] && headerLinkMatch[1].trim() !== 'N/A') {
            html += `<div class="cta-url-header-link">
                        <a href="${headerLinkMatch[1].trim()}" target="_blank" class="cta-url-link">
                          Ver imagem
                        </a>
                      </div>`;
          }
          
          if (headerIdMatch && headerIdMatch[1] && headerIdMatch[1].trim() !== 'N/A') {
            html += `<div class="cta-url-header-id">ID: ${headerIdMatch[1].trim()}</div>`;
          }
          
          html += `</div></div>`;
        }
        
        return html || '<div class="cta-url-no-content">Nenhuma informação disponível</div>';
        
      } catch (error) {
        console.error('Erro ao formatar mensagem CTA URL:', error);
        return `<div class="cta-url-error">Erro ao processar mensagem</div>`;
      }
    },
    getAudioSource(url) {
      try {
        const newUrl = url.replace('.ogg', '.mp3');
        return newUrl;
      } catch (error) {
        return url;
      }
    },
    abrirModalEdicao(mensagem) {
      this.mensagemOriginal = mensagem; 
      this.mensagemEdicao = {
        ...mensagem
      };
      this.modalEdicao = true;
    },
    async salvarEdicao() {
      await this.editarMensagem(this.mensagemOriginal, this.mensagemEdicao.body);
      this.modalEdicao = false;
    },
    async editarMensagem(mensagem, novaMensagem) {
      if(this.ticketFocado.channel !== 'meow' && this.ticketFocado.channel !== 'evo' && this.ticketFocado.channel !== 'uazapi' && this.ticketFocado.channel !== 'zapi'){
        if(mensagem){
          const editData = {
            messageId: mensagem.messageId,
            ticketId: mensagem.ticketId,
            body: mensagem.body,
            newBody: novaMensagem
          }
          await SendEditMessage(editData)
        }
      } else if(this.ticketFocado.channel === 'meow'){
        if(mensagem){
          const editData = {
            ticketId: mensagem.ticketId,
            newText: novaMensagem,
            messageId: mensagem.messageId,
            whatsapp: this.ticketFocado.whatsapp
          }
          await EnviarEdicaoMeow(mensagem.ticketId, editData)
        }
      } else if(this.ticketFocado.channel === 'evo'){
        if(mensagem){
          const editData = {
            ticketId: mensagem.ticketId,
            newText: novaMensagem,
            messageId: mensagem.messageId,
            whatsapp: this.ticketFocado.whatsapp
          }
          await EnviarEdicaoEvo(mensagem.ticketId, editData)
        }
      } else if(this.ticketFocado.channel === 'zapi'){
        if(mensagem){
          const editData = {
            ticketId: mensagem.ticketId,
            newText: novaMensagem,
            messageId: mensagem.messageId,
            whatsapp: this.ticketFocado.whatsapp
          }
          await EnviarEdicaoZapi(mensagem.ticketId, editData)
        }
      }
      if(this.ticketFocado.channel === 'uazapi'){
        if(mensagem){
          const editData = {
            ticketId: mensagem.ticketId,
            newText: novaMensagem,
            messageId: mensagem.messageId,
            whatsapp: this.ticketFocado.whatsapp
          }
          await EnviarEdicaoUazapi(mensagem.ticketId, editData)
        }
      }
      // if(mensagem){
      //   const editData = {
      //     messageId: mensagem.messageId,
      //     ticketId: mensagem.ticketId,
      //     body: mensagem.body,
      //     newBody: novaMensagem
      //   }
      //   await SendEditMessage(editData)
      // }
    },
    onResize() {
      this.$forceUpdate();
    },
    calculateEmojisByRow() {
      const screenWidth = window.innerWidth;
      if (screenWidth < 600) {
        return 5;
      } else if (screenWidth >= 600 && screenWidth < 1200) {
        return 10;
      } else {
        return 20;
      }
    },
    onInsertSelectEmoji(emoji) {
      if (this.mensagemReacao) {
        const reactionData = {
          messageId: this.mensagemReacao.messageId,
          ticketId: this.mensagemReacao.ticketId,
          reaction: emoji.data,
        };
        this.selectEmoji(reactionData.reaction, this.mensagemReacao);
      } else {
        console.error(this.$t('atendimentoMensagemChat.errors.selecaoReacao'));
      }
      this.modalEmojiOpen = false;
    },
    async selectEmoji(emoji, mensagem) {
      if(this.ticketFocado.channel === 'waba'){
        const reactionData = {
          read: 1,
          fromMe: true,
          quotedMsg: null,     
          from: this.ticketFocado.contact.number,
          tokenApi: this.ticketFocado.whatsapp.tokenAPI,
          ticketId: this.ticketFocado.id,
          idFront: uid(),
          emojiReaction: emoji,
          messageId: mensagem.messageId
        }
        await EnviarReacaoWaba(reactionData);
        this.mensagem = null;
        return;
      }
      if(this.ticketFocado.channel === 'instagram'){
        const reactionData = {
          read: 1,
          fromMe: true,
          quotedMsg: null,     
          from: this.ticketFocado.contact.number,
          tokenApi: this.ticketFocado.whatsapp.tokenAPI || this.ticketFocado.whatsapp.fbPageId,
          ticketId: this.ticketFocado.id,
          idFront: uid(),
          emojiReaction: emoji,
          messageId: mensagem.messageId
        }
        await EnviarReacaoInstagram(reactionData);
        this.mensagem = null;
        return;
      }
      if(this.ticketFocado.channel === 'messenger'){
        const reactionData = {
          read: 1,
          fromMe: true,
          quotedMsg: null,     
          from: this.ticketFocado.contact.messengerId || this.ticketFocado.contact.number,
          tokenApi: this.ticketFocado.whatsapp.tokenAPI || this.ticketFocado.whatsapp.fbPageId,
          ticketId: this.ticketFocado.id,
          idFront: uid(),
          emojiReaction: emoji,
          messageId: mensagem.messageId
        }
        await EnviarReacaoMessenger(reactionData);
        this.mensagem = null;
        return;
      }
      if(this.ticketFocado.channel === 'meow'){
        const reactionData = {
          ticketId: mensagem.ticketId,
          reaction: emoji,
          messageId: mensagem.messageId,
          whatsapp: this.ticketFocado.whatsapp
        }
        await EnviarReacaoMeow(mensagem.ticketId, reactionData);
        this.mensagem = null;
        return;
      }
      if(this.ticketFocado.channel === 'evo'){
        const reactionData = {
          ticketId: mensagem.ticketId,
          reaction: emoji,
          messageId: mensagem.messageId,
          whatsapp: this.ticketFocado.whatsapp
        }
        await EnviarReacaoEvo(mensagem.ticketId, reactionData);
        this.mensagem = null;
        return;
      }
      if(this.ticketFocado.channel === 'uazapi'){
        const reactionData = {
          ticketId: mensagem.ticketId,
          reaction: emoji,
          messageId: mensagem.messageId,
          whatsapp: this.ticketFocado.whatsapp
        }
        await EnviarReacaoUazapi(mensagem.ticketId, reactionData);
        this.mensagem = null;
        return;
      }
      if(this.ticketFocado.channel === 'zapi'){
        const reactionData = {
          ticketId: mensagem.ticketId,
          reaction: emoji,
          messageId: mensagem.messageId,
          whatsapp: this.ticketFocado.whatsapp
        }
        await EnviarReacaoZapi(mensagem.ticketId, reactionData);
        this.mensagem = null;
        return;
      }
      if (mensagem && this.ticketFocado.channel !== 'waba' && this.ticketFocado.channel !== 'meow') {
        const reactionData = {
          messageId: mensagem.messageId,
          ticketId: mensagem.ticketId,
          reaction: emoji,
        };
        await SendReactionMessage(reactionData);
        this.mensagem = null;
      } else {
        console.error(this.$t('atendimentoMensagemChat.notifications.reacaoSucesso'));
      }
      this.modalEmojiOpen = false;
    },
    isMensagemSelecionada(mensagem) {
      return this.mensagensParaEncaminhar.some((m) => m.id === mensagem.id)
    },
    verificarEncaminharMensagem(mensagem, value) {
      const mensagens = [...this.mensagensParaEncaminhar]
      
      if (value) {
        // Adicionar mensagem se não estiver no limite
        if (this.mensagensParaEncaminhar.length > 9) {
          this.$notificarErro(this.$t('atendimentoMensagemChat.errors.maximoMensagens'))
          return
        }
        const msgIdx = mensagens.findIndex((m) => m.id === mensagem.id)
        if (msgIdx === -1) {
          mensagens.push(mensagem)
        }
      } else {
        // Remover mensagem
        const msgIdx = mensagens.findIndex((m) => m.id === mensagem.id)
        if (msgIdx !== -1) {
          mensagens.splice(msgIdx, 1)
        }
      }
      
      this.$emit('update:mensagensParaEncaminhar', mensagens)
    },
    marcarMensagensParaEncaminhar(mensagem) {
      this.$emit('update:mensagensParaEncaminhar', [])
      this.$emit('update:ativarMultiEncaminhamento', !this.ativarMultiEncaminhamento)
      // this.verificarEncaminharMensagem(mensagem)
    },
    isPDF(url) {
      if (!url) return false;
      const allowedExtensions = ['pdf', 'txt', 'xml'];
      const split = url.split('.');
      const ext = split[split.length - 1].toLowerCase();
      return allowedExtensions.includes(ext);
    },
    isGroupLabel(mensagem) {
      try {
        return this.ticketFocado.isGroup ? mensagem.contact.name : ''
      } catch (error) {
        return ''
      }
    },
    // cUrlMediaCors () {
    //   return this.urlMedia
    // },
    formatarStampComFila(mensagem) {
      const hora = this.dataInWords(mensagem.createdAt);
      if (mensagem.queue && mensagem.queue.queue) {
        return `${hora} - ${mensagem.queue.queue}`;
      }
      return hora;
    },
    returnCardContato(str) {
      // return btoa(str)
      return Base64.encode(str)
    },
    isDesactivatDelete(msg) {
      // if (msg) {
      //   return (differenceInMinutes(new Date(), new Date(+msg.timestamp)) > 5)
      // }
      return false
    },
    async buscarImageCors(imageUrl) {
      this.loading = true
      try {
        const { data, headers } = await downloadImageCors.get(imageUrl, {
          responseType: 'blob',
        })
        const url = window.URL.createObjectURL(new Blob([data], { type: headers['content-type'] }))
        this.urlMedia = url
        this.abrirModalImagem = true
      } catch (error) {
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
      this.loading = false
    },
    citarMensagem(mensagem) {
      this.$emit('update:replyingMessage', mensagem)
      bus.emit('mensagem-chat:focar-input-mensagem', mensagem)
    },
    encaminharMensagem(mensagem) {
      this.$emit('mensagem-chat:encaminhar-mensagem', mensagem)
    },
    encaminharParaChatPrivado(mensagem) {
      this.$emit('mensagem-chat:encaminhar-chat-privado', mensagem)
    },
    encaminharParaOutroCanal(mensagem) {
      this.$emit('mensagem-chat:encaminhar-outro-canal', mensagem)
    },
    deletarMensagem(mensagem) {
      if (this.isDesactivatDelete(mensagem)) {
        this.$notificarErro(this.$t('atendimentoMensagemChat.errors.apagarMensagem'));
      }
      // const diffHoursDate = differenceInHours(
      //   new Date(),
      //   parseJSON(mensagem.createdAt)
      // )
      // if (diffHoursDate > 2) {
      //   // throw new AppError("No delete message afeter 2h sended");
      // }
      this.$q
        .dialog({
          title: this.$t('atendimentoMensagemChat.dialogs.deletarTitulo'),
          message: this.$t('atendimentoMensagemChat.dialogs.deletarMensagem'),
          cancel: {
            label: this.$t('common.no'),
            color: 'primary',
            push: true,
          },
          ok: {
            label: this.$t('common.yes'),
            color: 'negative',
            push: true,
          },
          persistent: true,
        })
        .onOk(() => {
          this.loading = true
          DeletarMensagem(mensagem)
            .then((res) => {
              this.loading = false
              mensagem.isDeleted = true
            })
            .catch((error) => {
              this.loading = false
              console.error(error)
              this.$notificarErro(this.$t('common.notifications.error'), error);
            })
        })
        .onCancel(() => {})
    },
    async focarMensagem(mensagem) {
      const id = `chat-message-${mensagem.id}`;
      this.identificarMensagem = id;

      const mensagemExiste = () => this.mensagens.some(msg => msg.id === mensagem.id);

      if (mensagemExiste()) {
        this.scrollParaMensagem(id);
        return;
      }
      this.$q.notify({
        color: "warning",
        position: "top",
        message: this.$t('common.rollTop'),
        icon: "search",
      });

      let tentativasRestantes = 10;

      const tentarScrollParaTopo = async () => {
        if (mensagemExiste()) {
          this.scrollParaMensagem(id);
          return;
        }

        if (tentativasRestantes <= 0) {;
          this.$q.notify({
            color: "negative",
            position: "top",
            message: this.$t('common.rollTop.messageNotFound'),
            icon: "error",
          });
          return;
        }

        this.$emit("mensagem-chat:rolar-para-topo");

        tentativasRestantes--;

        const timerId = setTimeout(tentarScrollParaTopo, 500);
        this.addTimer(timerId);
      };

      tentarScrollParaTopo();

    },
    scrollParaMensagem(id) {
      this.$nextTick(() => {
        const timerId = setTimeout(() => {
          const elem = document.getElementById(id);
          if (elem) {
            elem.scrollIntoView({ behavior: "smooth", block: "center" });
          } else {
            console.warn(`Elemento ${id} não encontrado!`);
          }
        }, 100);
        this.addTimer(timerId);
      });

      const timerId2 = setTimeout(() => {
        this.identificarMensagem = null;
      }, 5000);
      this.addTimer(timerId2);
    },
    delay(ms) {
      return new Promise(resolve => {
        const timerId = setTimeout(resolve, ms);
        this.addTimer(timerId);
      });
    },
    getFileIcon(fileUrl) {
      if (!fileUrl) return 'mdi-file';
      const ext = fileUrl.split('.').pop().toLowerCase();
      switch (ext) {
        case 'pdf':
          return 'mdi-file-pdf-box';
        case 'doc':
        case 'docx':
          return 'mdi-file-word-box';
        case 'xls':
        case 'xlsx':
          return 'mdi-file-excel-box';
        case 'ppt':
        case 'pptx':
          return 'mdi-file-powerpoint-box';
        case 'txt':
          return 'mdi-file-document-outline';
        case 'nullextension':
          return 'mdi-alert-outline';
        default:
          return 'mdi-file';
      }
    },
    getFileIconColor(fileUrl) {
      if (!fileUrl) return 'grey-7';
      const ext = fileUrl.split('.').pop().toLowerCase();
      switch (ext) {
        case 'pdf':
          return 'red-7';
        case 'doc':
        case 'docx':
          return 'blue-7';
        case 'xls':
        case 'xlsx':
          return 'green-7';
        case 'ppt':
        case 'pptx':
          return 'orange-7';
        case 'txt':
          return 'grey-7';
        default:
          return 'blue-4';
      }
    },
    forceUpdateFormatting() {
      // Força a atualização da formatação para garantir que os links sejam renderizados corretamente
      this.$forceUpdate();
    },
  },
  watch: {
    mensagens: {
      handler() {
        // Garantir que a formatação seja aplicada quando as mensagens mudarem
        this.$nextTick(() => {
          this.forceUpdateFormatting()
        })
      },
      deep: true
    }
  },
  mounted() {
    this.scrollToBottom()
    this.addEventListener(window, 'resize', this.onResize);
    this.userProfile = localStorage.getItem('profile')
    this.audioModulo = localStorage.getItem('audioModule') || 'disabled'
    
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
    
    // Garantir que a formatação seja aplicada corretamente após a renderização inicial
    this.$nextTick(() => {
      this.forceUpdateFormatting()
    })
    
    // this.$refs.audioMessage.forEach(element => {
    //   element.playbackRate = 2
    // })
  },
  beforeUnmount() {
    // Limpeza completa de memória
    this.cleanupMemory();
  },
  unmounted() {
    // Garantir que todos os recursos sejam limpos
    this.cleanupMemory();
  },
}
</script>

<style lang="scss" scoped>

.hr-text {
  line-height: 1em;
  position: relative;
  outline: 0;
  border: 0;
  color: black;
  text-align: center;
  height: 1.5em;
  opacity: .5;
  &:before {
    content: '';
    background: linear-gradient(to right, transparent, #818078, transparent);
    position: absolute;
    left: 0;
    top: 50%;
    width: 100%;
    height: 1px;
  }
  &:after {
    content: attr(data-content);
    position: relative;
    display: inline-block;
    color: black;
    padding: 0 .5em;
    line-height: 1.5em;
    color: #818078;
    background-color: #fcfcfa;
  }
}

.pulseIdentications {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(0, 123, 255, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(0, 123, 255, 0);
  }
}

.blur-effect {
  filter: blur(0px)   
}

.contact-container {
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  max-width: 200px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.contact-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.frame-pdf {
  overflow: hidden;
}

.checkbox-encaminhar-right {
  right: -35px;
  z-index: 99999;
}

.checkbox-encaminhar-left {
  left: -35px;
  z-index: 99999;
}

.reaction-container {
  font-size: 0.75rem;
  color: #606060;
  margin-top: 8px;
  padding: 2px 4px;
  border-radius: 4px;
  background-color: #f0f0f0;
  display: inline-block;
}

.emoji-picker {
  width: 100%;
}

@media (min-width: 600px) {
  .emoji-picker {
    width: 50vw;
  }
}

.emoji-picker-modal {
  overflow: hidden;
  
  :deep(.q-card__section) {
    overflow: hidden;
    padding: 0;
  }
}

.highlight-message {
  animation: highlight 3s ease-out;
  background-color: var(--q-light) !important;
}

@keyframes highlight {
  0% {
    background-color: var(--q-light);
  }
  100% {
    background-color: transparent;
  }
}

.nfm-response {
  background-color: #f5f5f5;
  border-radius: 8px;
  padding: 12px;
  margin: 8px 0;
  
  .nfm-response-item {
    margin: 8px 0;
    line-height: 1.4;
    
    strong {
      color: #333;
      margin-right: 8px;
    }
    
    span {
      color: #666;
    }
  }
}

.product-message {
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(229,62,62,0.15) !important;
  }
  
  img {
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.05);
    }
  }
  
  a {
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 12px rgba(56,161,105,0.4) !important;
    }
  }
}

.location-request-container {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 2px solid #007bff;
  border-radius: 16px;
  padding: 20px;
  margin: 8px 0;
  box-shadow: 0 4px 15px rgba(0,123,255,0.1);
  position: relative;
  overflow: hidden;
  
  .location-request-icon {
    text-align: center;
    margin-bottom: 16px;
  }
  
  .location-request-text {
    font-size: 14px;
    line-height: 1.5;
    color: #495057;
  }
  
  .location-request-btn {
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,123,255,0.3) !important;
    }
  }
}

.cta-url-container {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 2px solid #6f42c1;
  border-radius: 20px;
  padding: 24px;
  margin: 12px 0;
  box-shadow: 0 8px 25px rgba(111,66,193,0.15);
  position: relative;
  overflow: hidden;
  
  // Indicador visual no topo
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #6f42c1, #8b5cf6);
  }
  
  .cta-url-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid #e9ecef;
    
    .cta-url-icon {
      background: linear-gradient(135deg, #6f42c1, #8b5cf6);
      border-radius: 50%;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 16px;
      box-shadow: 0 4px 12px rgba(111,66,193,0.3);
    }
    
    .cta-url-title {
      flex: 1;
      
      .cta-url-title-text {
        font-weight: 700;
        font-size: 18px;
        color: #2d3748;
        margin-bottom: 4px;
        text-shadow: 0 1px 2px rgba(0,0,0,0.1);
      }
      
      .cta-url-subtitle {
        font-size: 13px;
        color: #6c757d;
        font-weight: 500;
      }
    }
  }
  
  .cta-url-content {
    margin-bottom: 20px;
    
    .cta-url-message {
      .cta-url-message-main,
      .cta-url-button-info,
      .cta-url-url-info,
      .cta-url-footer-info,
      .cta-url-header-info {
        background: rgba(111,66,193,0.05);
        border-left: 4px solid #6f42c1;
        padding: 12px 16px;
        margin: 8px 0;
        border-radius: 0 8px 8px 0;
        transition: all 0.3s ease;
        
        &:hover {
          background: rgba(111,66,193,0.08);
          transform: translateX(4px);
        }
        
        .cta-url-message-label {
          font-weight: 600;
          font-size: 12px;
          color: #6f42c1;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 6px;
        }
        
        .cta-url-message-text {
          font-size: 14px;
          color: #2d3748;
          line-height: 1.5;
          font-weight: 500;
        }
        
        .cta-url-url-text {
          font-size: 13px;
          color: #6f42c1;
          font-weight: 600;
          word-break: break-all;
          background: rgba(111,66,193,0.1);
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px solid rgba(111,66,193,0.2);
        }
      }
      
      .cta-url-header-info {
        .cta-url-header-details {
          .cta-url-header-type {
            font-size: 13px;
            color: #6f42c1;
            font-weight: 600;
            background: rgba(111,66,193,0.1);
            padding: 4px 8px;
            border-radius: 4px;
            display: inline-block;
            margin-bottom: 8px;
          }
          
          .cta-url-header-text {
            font-size: 14px;
            color: #2d3748;
            margin-bottom: 8px;
          }
          
          .cta-url-header-link {
            margin-bottom: 8px;
            
            .cta-url-link {
              color: #6f42c1;
              text-decoration: none;
              font-weight: 600;
              padding: 6px 12px;
              background: rgba(111,66,193,0.1);
              border-radius: 6px;
              border: 1px solid rgba(111,66,193,0.2);
              transition: all 0.3s ease;
              
              &:hover {
                background: rgba(111,66,193,0.2);
                transform: translateY(-1px);
              }
            }
          }
          
          .cta-url-header-id {
            font-size: 12px;
            color: #6c757d;
            font-family: monospace;
            background: #f8f9fa;
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid #dee2e6;
          }
        }
      }
      
      .cta-url-no-content {
        text-align: center;
        color: #6c757d;
        font-style: italic;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px dashed #dee2e6;
      }
      
      .cta-url-error {
        text-align: center;
        color: #dc3545;
        font-weight: 600;
        padding: 20px;
        background: #f8d7da;
        border-radius: 8px;
        border: 1px solid #f5c6cb;
      }
    }
  }
  
  .cta-url-actions {
    text-align: center;
    
    .cta-url-btn {
      transition: all 0.3s ease;
      font-weight: 600;
      padding: 12px 24px;
      font-size: 14px;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(111,66,193,0.4) !important;
      }
    }
  }
}

</style>
