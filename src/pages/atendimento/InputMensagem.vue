<template>
  <div @drop.prevent="handleFileDrop" @dragover.prevent>
    <div class="drop-area" @drop="handleFileDrop" @dragover="handleDragOver" @dragleave="handleDragLeave">


      <div class="row q-col-gutter-md" v-if="isScheduleDate && !useExternalSchedule">
        <div class="col-xs-12 col-md-6">
          <q-select :options="schedule.options" v-model="schedule.selected" map-options outlined @update:model-value="onSelectSchedule" />
        </div>
        <div class="col-xs-12 col-md-6">
          <div class="row q-col-gutter-sm">
            <div class="col-7">
              <q-input
                outlined
                stack-label
                :label="$t('inputMensagem.labels.dataHoraAgenda')"
                :model-value="formatDateDMY(scheduleDateDate)"
                readonly
                :disable="schedule.selected.value !== 'custom'"
              >
                <template #append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="scheduleDateDate" mask="YYYY-MM-DD" />
                    </q-popup-proxy>
                    <q-tooltip v-if="scheduleDate" class="text-bold">
                      {{ `${formatDateDMY(scheduleDateDate)} ${scheduleDateTime}` }}
                    </q-tooltip>
                  </q-icon>
                </template>
              </q-input>
            </div>
            <div class="col-5">
              <q-input
                outlined
                stack-label
                label="Hora"
                :model-value="scheduleDateTime"
                readonly
                :disable="schedule.selected.value !== 'custom'"
              >
                <template #append>
                  <q-icon name="schedule" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-time v-model="scheduleDateTime" format24h />
                    </q-popup-proxy>
                    <q-tooltip v-if="scheduleDate" class="text-bold">
                      {{ `${formatDateDMY(scheduleDateDate)} ${scheduleDateTime}` }}
                    </q-tooltip>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>
        </div>
      </div>

      <div class="q-py-md row bg-white justify-start items-center text-grey-9 relative-position">
        <template v-if="!isRecordingAudio">
           <!-- Visualização Desktop -->
           <div v-if="$q.screen.width > 500" class="desktop-view full-width row items-center">
            <!-- Botões principais -->
            <div class="row items-center">
              <!-- Botão de Envio de Arquivo -->
              <q-btn v-if="desabilitarInputWebchat"
                flat
                dense
                @click="abrirEnvioArquivo"
                icon="mdi-file-multiple"
                :disable="cDisableActions || desabilitarInput || desabilitarEnvioWabaAgendamento"
                class="bg-padrao btn-rounded q-mx-xs"
                :color="$q.dark.isActive ? 'white' : ''"
              >
                <q-tooltip content-class="text-bold"> {{ $t('inputMensagem.labels.enviarArquivo') }} </q-tooltip>
              </q-btn>       
              <!-- Botão de Envio de Anexo -->
              <q-btn v-if="desabilitarInputWebchat && !isScheduleDate && !ticketFocado?.channel?.includes('hub') && ticketFocado.channel !== 'instagram'"
                flat
                dense
                @click="abrirDialogAnexo"
                icon="mdi-file"
                :disable="cDisableActions || desabilitarInput"
                class="bg-padrao btn-rounded q-mx-xs"
                :color="$q.dark.isActive ? 'white' : ''"
              >
                <q-tooltip content-class="text-bold"> {{ $t('inputMensagem.labels.enviarArquivoCaption') }} </q-tooltip>
              </q-btn>
              <!-- Botão de Envio de Emoji -->
              <q-btn flat dense icon="mdi-emoticon-happy-outline" :disable="cDisableActions || desabilitarInput || desabilitarEnvioWabaAgendamento" class="bg-padrao btn-rounded q-mx-xs" :color="$q.dark.isActive ? 'white' : ''">
                <q-tooltip content-class="text-bold"> {{ $t('inputMensagem.labels.enviarEmoji') }}  </q-tooltip>
                <q-menu anchor="top right" self="bottom middle" :offset="[5, 40]">
                  <VEmojiPicker style="width: 40vw" :showSearch="false" :emojisByRow="calculateEmojisByRow()" :labelSearch="$t('common.search')" lang="pt-BR" @select="onInsertSelectEmoji" />
                </q-menu>
              </q-btn>
              <!-- Botão de Envio de Figurinha -->
              <q-btn v-if="desabilitarInputWebchat && (ticketFocado.channel === 'whatsapp' || ticketFocado.channel === 'baileys' || ticketFocado.channel === 'meow' || ticketFocado.channel === 'evo' || ticketFocado.channel === 'zapi' || ticketFocado.channel === 'uazapi' || ticketFocado.channel === 'instagram' || ticketFocado.channel === 'waba')"
                flat
                dense
                @click="abrirEnvioSticker"
                icon="mdi-sticker-outline"
                :disable="cDisableActions || desabilitarInput || desabilitarEnvioWabaAgendamento"
                class="bg-padrao btn-rounded q-mx-xs"
                :color="$q.dark.isActive ? 'white' : ''"
              >
                <q-tooltip content-class="text-bold"> {{ $t('inputMensagem.labels.enviarFigurinha') }} </q-tooltip>
              </q-btn>
              <!-- Botões adicionais em um menu dropdown -->
              <q-btn-dropdown :disable="cDisableActions" v-if="!isScheduleDate || ticketFocado.channel === 'waba' || ticketFocado.channel === 'instagram'" flat dense icon="mdi-dots-vertical" class="bg-padrao btn-rounded q-mx-xs" :color="$q.dark.isActive ? 'white' : ''">
                <q-list>
                  <!-- Botão de Envio de Video -->
                  <q-item v-if="desabilitarInputWebchat && !isScheduleDate" clickable v-close-popup @click="handlSendLinkVideo" :disable="cDisableActions || desabilitarInput || desabilitarEnvioWabaAgendamento">
                    <q-item-section avatar><q-icon name="mdi-message-video" /></q-item-section>
                    <q-item-section>{{ $t('inputMensagem.labels.enviarLinkVideo') }}</q-item-section>
                  </q-item>
                  <!-- Botão de Envio de Arquivo da Galeria -->
                  <q-item v-if="desabilitarInputWebchat && !isScheduleDate && !ticketFocado?.channel?.includes('hub')" clickable v-close-popup @click="abrirDialogGaleria" :disable="cDisableActions || desabilitarInput || desabilitarEnvioWabaAgendamento">
                    <q-item-section avatar><q-icon name="mdi-folder-image" /></q-item-section>
                    <q-item-section>{{ $t('inputMensagem.labels.enviarArquivoGaleria') }}</q-item-section>
                  </q-item>
                  <!-- Botão marcação fantasma -->
                  <q-item v-if="ticketFocado.isGroup && !isScheduleDate && ticketFocado.channel !== 'meow' && ticketFocado.channel !== 'evo' && ticketFocado.channel !== 'zapi' && ticketFocado.channel !== 'uazapi'" clickable v-close-popup @click="mostrarModal" :disable="cDisableActions || desabilitarInput || desabilitarEnvioWabaAgendamento">
                    <q-item-section avatar><q-icon name="mdi-ghost" /></q-item-section>
                    <q-item-section>{{ $t('inputMensagem.labels.enviarMarcacaoFantasma') }}</q-item-section>
                  </q-item>
                  <!-- Botão de Envio de Marcacao Usuario -->
                  <q-item v-if="ticketFocado.isGroup && !isScheduleDate && ticketFocado.channel !== 'meow' && ticketFocado.channel !== 'zapi' && ticketFocado.channel !== 'uazapi'" clickable v-close-popup @click="mostrarModalUsuario" :disable="cDisableActions || desabilitarInput || desabilitarEnvioWabaAgendamento">
                    <q-item-section avatar><q-icon name="mdi-at" /></q-item-section>
                    <q-item-section>{{ $t('inputMensagem.labels.enviarMarcacao') }}</q-item-section>
                  </q-item>
                  <!-- Botão de Manipulação de Grupo -->
                  <q-item v-if="ticketFocado.isGroup && !isScheduleDate" clickable v-close-popup @click="mostrarModalGrupo" :disable="cDisableActions || desabilitarInput || desabilitarEnvioWabaAgendamento">
                    <q-item-section avatar><q-icon name="mdi-account-group" /></q-item-section>
                    <q-item-section>{{ $t('inputMensagem.labels.manipularGrupo') }}</q-item-section>
                  </q-item>
                </q-list>
                <!-- Botão de Envio de Contato -->
                <q-item v-if="desabilitarInputWebchat && !isScheduleDate && ['whatsapp', 'baileys', 'meow', 'evo', 'waba', 'zapi', 'uazapi'].includes(ticketFocado.channel)" clickable v-close-popup @click="abrirDialogVcard" icon="mdi-card-account-phone" :disable="desabilitarInput || desabilitarEnvioWabaAgendamento">
                    <q-item-section avatar><q-icon name="mdi-card-account-phone" /></q-item-section>
                    <q-item-section>{{ $t('inputMensagem.labels.enviarContato') }}</q-item-section>
                  </q-item>
                <!-- Botão de Envio de Localização -->
                <q-item v-if="desabilitarInputWebchat && !isScheduleDate && ['whatsapp', 'baileys', 'meow', 'evo', 'zapi', 'uazapi'].includes(ticketFocado.channel)" clickable v-close-popup @click="abrirDialogLocation" icon="mdi-map-marker" :disable="desabilitarInput || desabilitarEnvioWabaAgendamento">
                    <q-item-section avatar><q-icon name="mdi-map-marker" /></q-item-section>
                    <q-item-section>{{ $t('inputMensagem.novo.enviarLocalizacao') }}</q-item-section>
                  </q-item>
                <!-- Botão de Envio de Botao -->
                <q-item v-if="ticketFocado.channel === 'waba'" clickable v-close-popup @click="mostrarModalBotao" :disable="desabilitarInput || desabilitarEnvioWabaAgendamento">
                    <q-item-section avatar><q-icon name="mdi-gesture-tap-hold" /></q-item-section>
                    <q-item-section>{{ $t('inputMensagem.labels.enviarBotoes') }}</q-item-section>
                  </q-item>
                  <!-- Botão de Envio de Lista -->
                  <q-item v-if="ticketFocado.channel === 'waba'" clickable v-close-popup @click="mostrarModalLista" :disable="desabilitarInput || desabilitarEnvioWabaAgendamento">
                    <q-item-section avatar><q-icon name="mdi-format-list-text" /></q-item-section>
                    <q-item-section>{{ $t('inputMensagem.labels.enviarListas') }}</q-item-section>
                  </q-item>
                  <!-- Botão de Envio de Template -->
                  <q-item v-if="ticketFocado.channel === 'waba'" clickable v-close-popup @click="buscarTemplateWaba()">
                    <q-item-section avatar><q-icon name="mdi-message-cog-outline" /></q-item-section>
                    <q-item-section>{{ $t('inputMensagem.labels.templates') }}</q-item-section>
                  </q-item>
                  <!-- Botão de Envio de CTA URL -->
                  <q-item v-if="ticketFocado.channel === 'waba'" clickable v-close-popup @click="mostrarModalCTAURL" :disable="desabilitarInput || desabilitarEnvioWabaAgendamento">
                    <q-item-section avatar><q-icon name="mdi-link-variant" /></q-item-section>
                    <q-item-section>{{ $t('inputMensagem.novo.enviarCTAURL') }}</q-item-section>
                  </q-item>
                  <!-- Botão de Envio de Reply Buttons -->
                  <q-item v-if="ticketFocado.channel === 'waba'" clickable v-close-popup @click="mostrarModalReplyButtons" :disable="desabilitarInput || desabilitarEnvioWabaAgendamento">
                    <q-item-section avatar><q-icon name="mdi-reply-all" /></q-item-section>
                    <q-item-section>{{ $t('inputMensagem.novo.enviarReplyButtons') }}</q-item-section>
                  </q-item>
                  <!-- Botão de Envio de Endereço -->
                  <q-item v-if="ticketFocado.channel === 'waba'" clickable v-close-popup @click="mostrarModalAddress" :disable="desabilitarInput || desabilitarEnvioWabaAgendamento">
                    <q-item-section avatar><q-icon name="mdi-map-marker" /></q-item-section>
                    <q-item-section>{{ $t('inputMensagem.novo.enviarAddress') }}</q-item-section>
                  </q-item>
                  <!-- Botão de Envio de Solicitação de Localização -->
                  <q-item v-if="ticketFocado.channel === 'waba'" clickable v-close-popup @click="mostrarModalLocationRequest" :disable="desabilitarInput || desabilitarEnvioWabaAgendamento">
                    <q-item-section avatar><q-icon name="mdi-crosshairs-gps" /></q-item-section>
                    <q-item-section>{{ $t('inputMensagem.novo.enviarLocationRequest') }}</q-item-section>
                  </q-item>
                  <!-- Botão de Envio de Localização -->
                  <q-item v-if="ticketFocado.channel === 'waba'" clickable v-close-popup @click="mostrarModalLocation" :disable="desabilitarInput || desabilitarEnvioWabaAgendamento">
                    <q-item-section avatar><q-icon name="mdi-map" /></q-item-section>
                    <q-item-section>{{ $t('inputMensagem.novo.enviarLocation') }}</q-item-section>
                  </q-item>
                  <!-- Botão de Envio de Flow -->
                  <q-item v-if="ticketFocado.channel === 'waba'" clickable v-close-popup @click="mostrarModalFlow" :disable="desabilitarInput || desabilitarEnvioWabaAgendamento">
                    <q-item-section avatar><q-icon name="mdi-file-tree" /></q-item-section>
                    <q-item-section>{{ $t('inputMensagem.novo.enviarFlow') }}</q-item-section>
                  </q-item>
                  <!-- Botão de Envio de Template Hub -->
                  <q-item v-if="ticketFocado.channel === 'hub_whatsapp_business_account'" clickable v-close-popup @click="buscarTemplateWabaHub()">
                    <q-item-section avatar><q-icon name="mdi-message-cog-outline" /></q-item-section>
                    <q-item-section>{{ $t('inputMensagem.labels.templates') }}</q-item-section>
                  </q-item>
                  <!-- Botão de Envio com Agente Humano (Instagram e Messenger) -->
                  <q-item v-if="(ticketFocado.channel === 'instagram' || ticketFocado.channel === 'messenger') && desabilitarInput && mostrarBotaoHumanAgent" clickable v-close-popup @click="abrirModalHumanAgent">
                    <q-item-section avatar><q-icon name="mdi-account-tie" /></q-item-section>
                    <q-item-section>{{ $t('inputMensagem.labels.enviarAgenteHumano') || 'Enviar com Agente Humano' }}</q-item-section>
                  </q-item>
                  <!-- Botão de Envio de Template Messenger (quando janela fechada) -->
                  <q-item v-if="ticketFocado.channel === 'messenger' && desabilitarInput" clickable v-close-popup @click="buscarTemplateMessenger()" :disabled=true>
                    <q-item-section avatar><q-icon name="mdi-message-cog-outline" /></q-item-section>
                    <q-item-section>{{ $t('inputMensagem.labels.templates') || 'Templates' }}</q-item-section>
                  </q-item>
                  
              </q-btn-dropdown>
              <!-- Botão de Envio de Assinatura -->
              <q-toggle keep-color v-model="sign" dense @update:model-value="handleSign" class="q-mx-sm q-ml-xs" :color="sign ? 'positive' : 'black'" type="toggle" v-if="userProfile === 'admin'">
                <q-tooltip>
                  {{ sign ? $t('inputMensagem.labels.desativarAssinatura') : $t('inputMensagem.labels.ativarAssinatura') }}
                </q-tooltip>
              </q-toggle>
              <!-- Botão de Envio de Assinatura -->
              <q-toggle keep-color v-model="sign" dense @update:model-value="handleSign" class="q-mx-sm q-ml-xs" :color="sign ? 'positive' : 'black'" type="toggle" v-if="assinaturaAtiva === 'disabled' && userProfile !== 'admin'">
                <q-tooltip>
                  {{ sign ? $t('inputMensagem.labels.desativarAssinatura') : $t('inputMensagem.labels.ativarAssinatura') }}
                </q-tooltip>
              </q-toggle>
              <!-- Botão de Remover Midia Mensagem Rapida -->
              <q-btn v-if="mensagemRapidaSetada"
                flat
                dense
                icon="mdi-cancel"
                class="bg-padrao btn-rounded q-mx-xs"
                :color="$q.dark.isActive ? 'red' : 'red'"
                @click="removerMediaMensagemRapida"
              >
                <q-tooltip content-class="text-bold"> {{ $t('inputMensagem.labels.removerMidiaMensagemRapida') }} </q-tooltip>
              </q-btn>
            </div>

            <!-- Input de mensagem -->
            <q-input
              hide-bottom-space
              :loading="loading"
              :disable="cDisableActions || desabilitarInput || desabilitarEnvioWabaAgendamento"
              ref="inputEnvioMensagem"
              id="inputEnvioMensagem"
              type="textarea"
              @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarMensagem() : '')"
              v-show="!cMostrarEnvioArquivo"
              class="col-grow q-mx-xs text-grey-10 inputEnvioMensagem"
              bg-color="grey-2"
              color="grey-7"
              :placeholder="$t('inputMensagem.labels.digiteMensagem')"
              input-style="max-height: 30vh"
              autogrow
              rounded
              dense
              outlined
              v-model="textChat"
              :value="textChat"
              @paste="handleInputPaste"
            >
              <template v-slot:prepend v-if="$q.screen.width < 500">
                <q-btn flat icon="mdi-emoticon-happy-outline" :disable="cDisableActions || desabilitarInput || desabilitarEnvioWabaAgendamento" dense round :color="$q.dark.isActive ? 'white' : ''">
                  <q-tooltip content-class="text-bold"> {{ $t('inputMensagem.labels.emoji') }} </q-tooltip>
                  <q-menu anchor="top right" self="bottom middle" :offset="[5, 40]">
                    <VEmojiPicker style="width: 40vw" :showSearch="false" :emojisByRow="calculateEmojisByRow()" :labelSearch="$t('common.search')" lang="pt-BR" @select="onInsertSelectEmoji" />
                  </q-menu>
                </q-btn>
              </template>
              <template v-slot:append>
                <q-btn v-if="!isScheduleDate && !ticketFocado?.channel?.includes('hub') && desabilitarInputWebchat" dense flat round icon="mdi-message-flash-outline" @click="visualizarMensagensRapidas = true">
                  <q-tooltip content-class="text-bold"> {{ $t('inputMensagem.labels.mensagemRapida') }} </q-tooltip>
                </q-btn>
                <q-btn 
                  v-if="(textChat.trim().length > 0 && !isScheduleDate && !ticketFocado?.channel?.includes('hub') && desabilitarInputWebchat) && chatgptAtivo === 'enabled'" 
                  dense 
                  flat 
                  round 
                  icon="mdi-pencil-outline"
                  :loading="reescrevendoTexto"
                  :disable="cDisableActions || desabilitarInput || reescrevendoTexto"
                  @click="toggleMenuReescrita"
                  class="q-mr-xs"
                >
                  <q-tooltip content-class="text-bold">{{ $t('rewriteIa.title') }}</q-tooltip>
                  <q-menu 
                    persistent 
                    anchor="top middle" 
                    self="bottom middle" 
                    :offset="[0, 10]"
                    auto-close
                  >
                    <q-list style="min-width: 180px">
                      <q-item-label header class="text-grey-7 text-weight-medium">
                        {{ $t('rewriteIa.estilos') }}
                      </q-item-label>
                      <q-separator />
                      
                      <q-item 
                        clickable 
                        v-close-popup 
                        @click="reescreverTexto('profissional')"
                        class="q-py-sm"
                      >
                        <q-item-section avatar>
                          <q-icon name="mdi-tie" color="blue-7" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('rewriteIa.pro') }}</q-item-label>
                          <q-item-label caption>{{ $t('rewriteIa.prodesc') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      
                      <q-item 
                        clickable 
                        v-close-popup 
                        @click="reescreverTexto('simpatico')"
                        class="q-py-sm"
                      >
                        <q-item-section avatar>
                          <q-icon name="mdi-emoticon-happy" color="green-7" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('rewriteIa.simp') }}</q-item-label>
                          <q-item-label caption>{{ $t('rewriteIa.simpdesc') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      
                      <q-item 
                        clickable 
                        v-close-popup 
                        @click="reescreverTexto('marketing')"
                        class="q-py-sm"
                      >
                        <q-item-section avatar>
                          <q-icon name="mdi-bullhorn" color="orange-7" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('rewriteIa.marketing') }}</q-item-label>
                          <q-item-label caption>{{ $t('rewriteIa.marketingdesc') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      
                      <q-item 
                        clickable 
                        v-close-popup 
                        @click="reescreverTexto('ortografia')"
                        class="q-py-sm"
                      >
                        <q-item-section avatar>
                          <q-icon name="mdi-spellcheck" color="purple-7" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('rewriteIa.ortografia') }}</q-item-label>
                          <q-item-label caption>{{ $t('rewriteIa.ortografiadesc') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </template>
              <template v-slot:hint>
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 5]" v-if="textChat.length > 0">
                  {{ textChat.length }} {{ $t('rewriteIa.caracteres') }}
                </q-tooltip>
              </template>
            </q-input>

            <!-- tamanho maximo por arquivo de 10mb -->
            <!-- Botão de Envio de Arquivo -->
            <q-file
              :loading="loading"
              :disable="cDisableActions || desabilitarInput || desabilitarEnvioWabaAgendamento"
              ref="PickerFileMessage"
              id="PickerFileMessage"
              v-show="cMostrarEnvioArquivo"
              v-model="arquivos"
              class="col-grow q-mx-xs PickerFileMessage"
              bg-color="blue-grey-1"
              input-style="max-height: 30vh"
              outlined
              use-chips
              multiple
              autogrow
              dense
              rounded
              append
              :max-files="5"
              :max-file-size="maxFileSizeComputed"
              :max-total-size="maxTotalSizeComputed"
              :accept="acceptComputed"
              @rejected="onRejectedFiles"
              @update:model-value="handleFilesUpdate"
            />
            <!-- Botão de Envio de Mensagem -->
            <q-btn v-if="textChat || cMostrarEnvioArquivo || removeMedia"
              ref="btnEnviarMensagem"
              @click="enviarMensagem"
              :disabled="ticketFocado.status !== 'open' || loading || desabilitarEnvioWabaAgendamento"
              flat
              icon="mdi-send"
              class="bg-padrao btn-rounded q-mx-xs"
              :color="$q.dark.isActive ? 'white' : ''"
            >
              <q-tooltip content-class=" text-bold"> {{ $t('inputMensagem.labels.enviarMensagem') }} </q-tooltip>
            </q-btn>
            <!-- Botão de Envio de Audio -->
            <q-btn v-if="!textChat && !cMostrarEnvioArquivo && !isRecordingAudio && pluginAudio === 'disabled' && desabilitarInputWebchat"
              @click="handleStartRecordingAudio"
              :disabled="cDisableActions || desabilitarInput || desabilitarEnvioWabaAgendamento"
              flat
              icon="mdi-microphone"
              class="bg-padrao btn-rounded q-mx-xs"
              :color="$q.dark.isActive ? 'white' : ''"
            >
              <q-tooltip content-class="text-bold"> {{ $t('inputMensagem.labels.enviarAudio') }} </q-tooltip>
            </q-btn>
            <!-- Botão de Envio de Audio -->
            <q-btn v-if="!textChat && !cMostrarEnvioArquivo && !isRecordingAudio && pluginAudio === 'enabled' && desabilitarInputWebchat" 
              :disabled="cDisableActions || desabilitarInput || desabilitarEnvioWabaAgendamento"
              @click="startRecording" 
              icon="mdi-microphone" 
              flat 
              class="bg-padrao btn-rounded q-mx-xs"
              :color="$q.dark.isActive ? 'white' : ''"
              >
              <q-tooltip>{{ $t('inputMensagem.labels.enviarAudio') }}</q-tooltip>
            </q-btn>
            <!-- Botão de Gravação de Video -->
            <!-- <q-btn
              v-if="!textChat && !cMostrarEnvioArquivo && !isRecordingAudio && (ticketFocado.channel === 'whatsapp' || ticketFocado.channel === 'baileys')"
              @click="abrirModalGravacaoVideo"
              :disabled="cDisableActions || desabilitarInput"
              flat
              icon="mdi-video"
              class="bg-padrao btn-rounded q-mx-xs"
              :color="$q.dark.isActive ? 'white' : ''"
            >
              <q-tooltip content-class="text-bold"> Gravar Vídeo  </q-tooltip>
            </q-btn> -->

          </div>
          <!-- Visualização Mobile -->
          <div v-else class="mobile-view full-width row items-center">
            <!-- Botões em um menu dropdown -->
            <q-btn-dropdown :disable="cDisableActions"  v-if="!isScheduleDate || ticketFocado.channel === 'waba' || ticketFocado.channel === 'instagram'" flat dense icon="mdi-dots-vertical" class="bg-padrao btn-rounded q-mx-xs" :color="$q.dark.isActive ? 'white' : ''">
              <q-list>
                <!-- Botão de Envio de Arquivo -->
                <q-item v-if="desabilitarInputWebchat" clickable v-close-popup @click="abrirEnvioArquivo" icon="mdi-file-multiple" :disable="desabilitarEnvioWabaAgendamento">
                  <q-item-section avatar><q-icon name="mdi-file-multiple" /></q-item-section>
                  <q-item-section>{{ $t('inputMensagem.labels.enviarArquivo') }}</q-item-section>
                </q-item>
                <!-- Botão de Envio de Anexo -->
                <q-item v-if="desabilitarInputWebchat && !isScheduleDate && !ticketFocado?.channel?.includes('hub') && ticketFocado.channel !== 'instagram'" clickable v-close-popup @click="abrirDialogAnexo" icon="mdi-file" :disable="desabilitarEnvioWabaAgendamento">
                  <q-item-section avatar><q-icon name="mdi-file" /></q-item-section>
                  <q-item-section>{{ $t('inputMensagem.labels.enviarArquivoCaption') }}</q-item-section>
                </q-item>
                <!-- Botão de Envio de Arquivo da Galeria -->
                <q-item v-if="desabilitarInputWebchat && !isScheduleDate && !ticketFocado?.channel?.includes('hub')" clickable v-close-popup @click="abrirDialogGaleria" icon="mdi-folder-image" :disable="desabilitarEnvioWabaAgendamento">
                  <q-item-section avatar><q-icon name="mdi-folder-image" /></q-item-section>
                  <q-item-section>{{ $t('inputMensagem.labels.enviarArquivoGaleria') }}</q-item-section>
                </q-item>
                <!-- Botão de Envio de Figurinha -->
                <q-item v-if="desabilitarInputWebchat && (ticketFocado.channel === 'whatsapp' || ticketFocado.channel === 'baileys' || ticketFocado.channel === 'meow' || ticketFocado.channel === 'evo' || ticketFocado.channel === 'zapi' || ticketFocado.channel === 'uazapi' || ticketFocado.channel === 'waba' || ticketFocado.channel === 'instagram')" clickable v-close-popup @click="abrirEnvioSticker" icon="mdi-sticker-outline" :disable="desabilitarEnvioWabaAgendamento">
                  <q-item-section avatar><q-icon name="mdi-sticker-outline" /></q-item-section>
                  <q-item-section>{{ $t('inputMensagem.labels.enviarFigurinha') }}</q-item-section>
                </q-item>
                 <!-- Botão de Envio de Video -->
                 <q-item v-if="desabilitarInputWebchat && !isScheduleDate" clickable v-close-popup @click="handlSendLinkVideo" icon="mdi-message-video">
                  <q-item-section avatar><q-icon name="mdi-message-video" /></q-item-section>
                  <q-item-section>{{ $t('inputMensagem.labels.enviarLinkVideo') }}</q-item-section>
                </q-item>
                <!-- Botão de Envio de Contato -->
                <q-item v-if="desabilitarInputWebchat && !isScheduleDate && ['whatsapp', 'baileys', 'meow', 'evo', 'waba', 'zapi', 'uazapi'].includes(ticketFocado.channel)" clickable v-close-popup @click="abrirDialogVcard" icon="mdi-card-account-phone" :disable="desabilitarInput || desabilitarEnvioWabaAgendamento">
                  <q-item-section avatar><q-icon name="mdi-card-account-phone" /></q-item-section>
                  <q-item-section>{{ $t('inputMensagem.labels.enviarContato') }}</q-item-section>
                </q-item>
                <!-- Botão de Envio de Localização -->
                <q-item v-if="desabilitarInputWebchat && !isScheduleDate && ['whatsapp', 'baileys', 'meow', 'evo', 'zapi', 'uazapi'].includes(ticketFocado.channel)" clickable v-close-popup @click="abrirDialogLocation" icon="mdi-map-marker" :disable="desabilitarInput || desabilitarEnvioWabaAgendamento">
                  <q-item-section avatar><q-icon name="mdi-map-marker" /></q-item-section>
                  <q-item-section>{{ $t('inputMensagem.novo.enviarLocalizacao') }}</q-item-section>
                </q-item>
                <!-- Botão marcação fantasma -->
                <q-item v-if="ticketFocado.isGroup && !isScheduleDate && ticketFocado.channel !== 'meow' && ticketFocado.channel !== 'evo' && ticketFocado.channel !== 'zapi' && ticketFocado.channel !== 'uazapi'" clickable v-close-popup @click="mostrarModal" :disable="cDisableActions || desabilitarInput">
                  <q-item-section avatar><q-icon name="mdi-ghost" /></q-item-section>
                  <q-item-section>{{ $t('inputMensagem.labels.enviarMarcacaoFantasma') }}</q-item-section>
                </q-item>
                <!-- Botão de Envio de Marcacao Usuario -->
                <q-item v-if="ticketFocado.isGroup && !isScheduleDate && ticketFocado.channel !== 'meow' && ticketFocado.channel !== 'zapi' && ticketFocado.channel !== 'uazapi'" clickable v-close-popup @click="mostrarModalUsuario" :disable="cDisableActions || desabilitarInput">
                  <q-item-section avatar><q-icon name="mdi-at" /></q-item-section>
                  <q-item-section>{{ $t('inputMensagem.labels.enviarMarcacao') }}</q-item-section>
                </q-item>
                <!-- Botão de Manipulação de Grupo -->
                <q-item v-if="ticketFocado.isGroup && !isScheduleDate" clickable v-close-popup @click="mostrarModalGrupo" :disable="cDisableActions || desabilitarInput">
                  <q-item-section avatar><q-icon name="mdi-account-group" /></q-item-section>
                  <q-item-section>{{ $t('inputMensagem.labels.manipularGrupo') }}</q-item-section>
                </q-item>
              </q-list>
              <!-- Botão de Envio de Botao -->
              <q-item v-if="ticketFocado.channel === 'waba'" clickable v-close-popup @click="mostrarModalBotao" :disable="desabilitarInput || desabilitarEnvioWabaAgendamento">
                  <q-item-section avatar><q-icon name="mdi-gesture-tap-hold" /></q-item-section>
                  <q-item-section>{{ $t('inputMensagem.labels.enviarBotoes') }}</q-item-section>
                </q-item>
                <!-- Botão de Envio de Lista -->
                <q-item v-if="ticketFocado.channel === 'waba'" clickable v-close-popup @click="mostrarModalLista" :disable="desabilitarInput || desabilitarEnvioWabaAgendamento">
                  <q-item-section avatar><q-icon name="mdi-format-list-text" /></q-item-section>
                  <q-item-section>{{ $t('inputMensagem.labels.enviarListas') }}</q-item-section>
                </q-item>
                <!-- Botão de Envio de Template -->
                <q-item v-if="ticketFocado.channel === 'waba'" clickable v-close-popup @click="buscarTemplateWaba()">
                  <q-item-section avatar><q-icon name="mdi-message-cog-outline" /></q-item-section>
                  <q-item-section>{{ $t('inputMensagem.labels.templates') }}</q-item-section>
                </q-item>
                <!-- Botão de Envio de CTA URL -->
                <q-item v-if="ticketFocado.channel === 'waba'" clickable v-close-popup @click="mostrarModalCTAURL" :disable="desabilitarInput || desabilitarEnvioWabaAgendamento">
                  <q-item-section avatar><q-icon name="mdi-link-variant" /></q-item-section>
                  <q-item-section>{{ $t('inputMensagem.novo.enviarCTAURL') }}</q-item-section>
                </q-item>
                <!-- Botão de Envio de Reply Buttons -->
                <q-item v-if="ticketFocado.channel === 'waba'" clickable v-close-popup @click="mostrarModalReplyButtons" :disable="desabilitarInput || desabilitarEnvioWabaAgendamento">
                  <q-item-section avatar><q-icon name="mdi-reply-all" /></q-item-section>
                  <q-item-section>{{ $t('inputMensagem.novo.enviarReplyButtons') }}</q-item-section>
                </q-item>
                <!-- Botão de Envio de Endereço -->
                <q-item v-if="ticketFocado.channel === 'waba'" clickable v-close-popup @click="mostrarModalAddress" :disable="desabilitarInput || desabilitarEnvioWabaAgendamento">
                  <q-item-section avatar><q-icon name="mdi-map-marker" /></q-item-section>
                  <q-item-section>{{ $t('inputMensagem.novo.enviarAddress') }}</q-item-section>
                </q-item>
                <!-- Botão de Envio de Solicitação de Localização -->
                <q-item v-if="ticketFocado.channel === 'waba'" clickable v-close-popup @click="mostrarModalLocationRequest" :disable="desabilitarInput || desabilitarEnvioWabaAgendamento">
                  <q-item-section avatar><q-icon name="mdi-crosshairs-gps" /></q-item-section>
                  <q-item-section>{{ $t('inputMensagem.novo.enviarLocationRequest') }}</q-item-section>
                </q-item>
                <!-- Botão de Envio de Localização -->
                <q-item v-if="ticketFocado.channel === 'waba'" clickable v-close-popup @click="mostrarModalLocation" :disable="desabilitarInput || desabilitarEnvioWabaAgendamento">
                  <q-item-section avatar><q-icon name="mdi-map" /></q-item-section>
                  <q-item-section>{{ $t('inputMensagem.novo.enviarLocation') }}</q-item-section>
                </q-item>
                <!-- Botão de Envio de Flow -->
                <q-item v-if="ticketFocado.channel === 'waba'" clickable v-close-popup @click="mostrarModalFlow" :disable="desabilitarInput || desabilitarEnvioWabaAgendamento">
                  <q-item-section avatar><q-icon name="mdi-file-tree" /></q-item-section>
                  <q-item-section>{{ $t('inputMensagem.novo.enviarFlow') }}</q-item-section>
                </q-item>
                <!-- Botão de Envio de Template Hub -->
                <q-item v-if="ticketFocado.channel === 'hub_whatsapp_business_account'" clickable v-close-popup @click="buscarTemplateWabaHub()">
                  <q-item-section avatar><q-icon name="mdi-message-cog-outline" /></q-item-section>
                  <q-item-section>{{ $t('inputMensagem.labels.templates') }}</q-item-section>
                </q-item>
                <!-- Botão de Envio com Agente Humano (Instagram e Messenger) -->
                <q-item v-if="(ticketFocado.channel === 'instagram' || ticketFocado.channel === 'messenger') && desabilitarInput && mostrarBotaoHumanAgent" clickable v-close-popup @click="abrirModalHumanAgent">
                  <q-item-section avatar><q-icon name="mdi-account-tie" /></q-item-section>
                  <q-item-section>{{ $t('inputMensagem.labels.enviarAgenteHumano') || 'Enviar com Agente Humano' }}</q-item-section>
                </q-item>
                <!-- Botão de Envio de Template Messenger (quando janela fechada) -->
                <q-item v-if="ticketFocado.channel === 'messenger' && desabilitarInput" clickable v-close-popup @click="buscarTemplateMessenger()" :disabled=true>
                  <q-item-section avatar><q-icon name="mdi-message-cog-outline" /></q-item-section>
                  <q-item-section>{{ $t('inputMensagem.labels.templates') || 'Templates' }}</q-item-section>
                </q-item>
                
            </q-btn-dropdown>
            <!-- Botão de Envio de Assinatura -->
            <q-toggle keep-color v-model="sign" dense @update:model-value="handleSign" class="q-mx-sm q-ml-xs" :color="sign ? 'positive' : 'black'" type="toggle" v-if="userProfile === 'admin'">
              <q-tooltip>
                {{ sign ? $t('inputMensagem.labels.desativarAssinatura') : $t('inputMensagem.labels.ativarAssinatura') }}
              </q-tooltip>
            </q-toggle>
            <!-- Botão de Envio de Assinatura -->
            <q-toggle keep-color v-model="sign" dense @update:model-value="handleSign" class="q-mx-sm q-ml-xs" :color="sign ? 'positive' : 'black'" type="toggle" v-if="assinaturaAtiva === 'disabled' && userProfile !== 'admin'">
              <q-tooltip>
                {{ sign ? $t('inputMensagem.labels.desativarAssinatura') : $t('inputMensagem.labels.ativarAssinatura') }}
              </q-tooltip>
            </q-toggle>
            <!-- Botão de Remover Midia Mensagem Rapida -->
            <q-btn v-if="mensagemRapidaSetada"
              flat
              dense
              icon="mdi-cancel"
              class="bg-padrao btn-rounded q-mx-xs"
              :color="$q.dark.isActive ? 'red' : 'red'"
              @click="removerMediaMensagemRapida"
            >
              <q-tooltip content-class="text-bold"> {{ $t('inputMensagem.labels.removerMidiaMensagemRapida') }} </q-tooltip>
            </q-btn>


            <!-- Input de mensagem -->
            <q-input
              hide-bottom-space
              :loading="loading"
              :disable="cDisableActions || desabilitarInput || desabilitarEnvioWabaAgendamento"
              ref="inputEnvioMensagem"
              id="inputEnvioMensagem"
              type="textarea"
              @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarMensagem() : '')"
              v-show="!cMostrarEnvioArquivo"
              class="col-grow q-mx-xs text-grey-10 inputEnvioMensagem"
              bg-color="grey-2"
              color="grey-7"
              :placeholder="$t('inputMensagem.labels.digiteMensagem')"
              input-style="max-height: 30vh"
              autogrow
              rounded
              dense
              outlined
              v-model="textChat"
              :value="textChat"
              @paste="handleInputPaste"
            >
              <template v-slot:prepend v-if="$q.screen.width < 500">
                <q-btn flat icon="mdi-emoticon-happy-outline" :disable="cDisableActions || desabilitarInput || desabilitarEnvioWabaAgendamento" dense round :color="$q.dark.isActive ? 'white' : ''">
                  <q-tooltip content-class="text-bold"> {{ $t('inputMensagem.labels.emoji') }} </q-tooltip>
                  <q-menu anchor="top right" self="bottom middle" :offset="[5, 40]">
                    <VEmojiPicker style="width: 40vw" :showSearch="false" :emojisByRow="calculateEmojisByRow()" :labelSearch="$t('common.search')" lang="pt-BR" @select="onInsertSelectEmoji" />
                  </q-menu>
                </q-btn>
              </template>
              <template v-slot:append>
                <q-btn v-if="!isScheduleDate && !ticketFocado?.channel?.includes('hub') && desabilitarInputWebchat" dense flat round icon="mdi-message-flash-outline" @click="visualizarMensagensRapidas = true">
                  <q-tooltip content-class="text-bold"> {{ $t('inputMensagem.labels.mensagemRapida') }} </q-tooltip>
                </q-btn>
                <q-btn 
                  v-if="(textChat.trim().length > 0 && !isScheduleDate && !ticketFocado?.channel?.includes('hub') && desabilitarInputWebchat) && chatgptAtivo === 'enabled'" 
                  dense 
                  flat 
                  round 
                  icon="mdi-pencil-outline"
                  :loading="reescrevendoTexto"
                  :disable="cDisableActions || desabilitarInput || reescrevendoTexto"
                  @click="toggleMenuReescrita"
                  class="q-mr-xs"
                >
                  <q-tooltip content-class="text-bold">{{ $t('rewriteIa.title') }}</q-tooltip>
                  <q-menu 
                    persistent 
                    anchor="top middle" 
                    self="bottom middle" 
                    :offset="[0, 10]"
                    auto-close
                  >
                    <q-list style="min-width: 180px">
                      <q-item-label header class="text-grey-7 text-weight-medium">
                        {{ $t('rewriteIa.estilos') }}
                      </q-item-label>
                      <q-separator />
                      
                      <q-item 
                        clickable 
                        v-close-popup 
                        @click="reescreverTexto('profissional')"
                        class="q-py-sm"
                      >
                        <q-item-section avatar>
                          <q-icon name="mdi-tie" color="blue-7" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('rewriteIa.pro') }}</q-item-label>
                          <q-item-label caption>{{ $t('rewriteIa.prodesc') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      
                      <q-item 
                        clickable 
                        v-close-popup 
                        @click="reescreverTexto('simpatico')"
                        class="q-py-sm"
                      >
                        <q-item-section avatar>
                          <q-icon name="mdi-emoticon-happy" color="green-7" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('rewriteIa.simp') }}</q-item-label>
                          <q-item-label caption>{{ $t('rewriteIa.simpdesc') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      
                      <q-item 
                        clickable 
                        v-close-popup 
                        @click="reescreverTexto('marketing')"
                        class="q-py-sm"
                      >
                        <q-item-section avatar>
                          <q-icon name="mdi-bullhorn" color="orange-7" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('rewriteIa.marketing') }}</q-item-label>
                          <q-item-label caption>{{ $t('rewriteIa.marketingdesc') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      
                      <q-item 
                        clickable 
                        v-close-popup 
                        @click="reescreverTexto('ortografia')"
                        class="q-py-sm"
                      >
                        <q-item-section avatar>
                          <q-icon name="mdi-spellcheck" color="purple-7" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('rewriteIa.ortografia') }}</q-item-label>
                          <q-item-label caption>{{ $t('rewriteIa.ortografiadesc') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </template>
              <template v-slot:hint>
                <q-tooltip anchor="top middle" self="bottom middle" :offset="[0, 5]" v-if="textChat.length > 0">
                  {{ textChat.length }} {{ $t('rewriteIa.caracteres') }}
                </q-tooltip>
              </template>
            </q-input>

            <!-- tamanho maximo por arquivo de 10mb -->
            <!-- Botão de Envio de Arquivo -->
            <q-file
              :loading="loading"
              :disable="cDisableActions || desabilitarInput || desabilitarEnvioWabaAgendamento"
              ref="PickerFileMessage"
              id="PickerFileMessage"
              v-show="cMostrarEnvioArquivo"
              v-model="arquivos"
              class="col-grow q-mx-xs PickerFileMessage"
              bg-color="blue-grey-1"
              input-style="max-height: 30vh"
              outlined
              use-chips
              multiple
              autogrow
              dense
              rounded
              append
              :max-files="5"
              :max-file-size="maxFileSizeComputed"
              :max-total-size="maxTotalSizeComputed"
              :accept="acceptComputed"
              @rejected="onRejectedFiles"
              @update:model-value="handleFilesUpdate"
            />
            <!-- Botão de Envio de Mensagem -->
            <q-btn v-if="textChat || cMostrarEnvioArquivo || removeMedia"
              ref="btnEnviarMensagem"
              @click="enviarMensagem"
              :disabled="ticketFocado.status !== 'open' || loading || desabilitarEnvioWabaAgendamento"
              flat
              icon="mdi-send"
              class="bg-padrao btn-rounded q-mx-xs"
              :color="$q.dark.isActive ? 'white' : ''"
            >
              <q-tooltip content-class=" text-bold"> {{ $t('inputMensagem.labels.enviarMensagem') }} </q-tooltip>
            </q-btn>
            <!-- Botão de Envio de Audio -->
            <q-btn v-if="!textChat && !cMostrarEnvioArquivo && !isRecordingAudio && pluginAudio === 'disabled' && desabilitarInputWebchat"
              @click="handleStartRecordingAudio"
              :disabled="cDisableActions || desabilitarInput || desabilitarEnvioWabaAgendamento"
              flat
              icon="mdi-microphone"
              class="bg-padrao btn-rounded q-mx-xs"
              :color="$q.dark.isActive ? 'white' : ''"
            >
              <q-tooltip content-class="text-bold"> {{ $t('inputMensagem.labels.enviarAudio') }} </q-tooltip>
            </q-btn>
            <!-- Botão de Envio de Audio -->
            <q-btn v-if="!textChat && !cMostrarEnvioArquivo && !isRecordingAudio && pluginAudio === 'enabled' && desabilitarInputWebchat" 
              :disabled="cDisableActions || desabilitarInput || desabilitarEnvioWabaAgendamento"
              @click="startRecording" 
              icon="mdi-microphone" 
              flat 
              class="bg-padrao btn-rounded q-mx-xs"
              :color="$q.dark.isActive ? 'white' : ''"
              >
              <q-tooltip>{{ $t('inputMensagem.labels.enviarAudio') }}</q-tooltip>
            </q-btn>
            <!-- Botão de Gravação de Video -->
            <!-- <q-btn
              v-if="!textChat && !cMostrarEnvioArquivo && !isRecordingAudio && (ticketFocado.channel === 'whatsapp' || ticketFocado.channel === 'baileys')"
              @click="abrirModalGravacaoVideo"
              :disabled="cDisableActions || desabilitarInput"
              flat
              icon="mdi-video"
              class="bg-padrao btn-rounded q-mx-xs"
              :color="$q.dark.isActive ? 'white' : ''"
            >
              <q-tooltip content-class="text-bold"> Gravar Vídeo  </q-tooltip>
            </q-btn> -->

          </div>

        </template>
        <template v-else>
          <div class="full-width items-center row justify-end">
            <q-skeleton animation="pulse-y" class="col-grow q-mx-md" type="text" />
            <div style="width: 200px" class="flex flex-center items-center" v-if="isRecordingAudio && ticketFocado.channel !== 'waba' && ticketFocado.channel !== 'instagram' && desabilitarInputWebchat">
              <q-btn v-if="pluginAudio === 'enabled'" flat icon="mdi-close" color="negative" @click="cancelRecording" class="bg-padrao btn-rounded q-mx-xs" />
                <RecordingTimer v-if="pluginAudio === 'enabled'" class="text-bold" :class="{ 'text-white': $q.dark.isActive }" />
              <q-btn v-if="pluginAudio === 'enabled'" flat icon="mdi-send-circle-outline" color="positive" @click="stopRecordings" class="bg-padrao btn-rounded q-mx-xs" />
              <q-btn v-if="pluginAudio === 'disabled'" flat icon="mdi-close" color="negative" @click="handleCancelRecordingAudio" class="bg-padrao btn-rounded q-mx-xs" />
              <RecordingTimer v-if="pluginAudio === 'disabled'" class="text-bold" :class="{ 'text-white': $q.dark.isActive }" />
              <q-btn v-if="pluginAudio === 'disabled'" flat icon="mdi-send-circle-outline" color="positive" @click="handleStopRecordingAudio" class="bg-padrao btn-rounded q-mx-xs" />
            </div>
            <div style="width: 200px" class="flex flex-center items-center" v-if="isRecordingAudio && (ticketFocado.channel === 'waba' || ticketFocado.channel === 'instagram') && desabilitarInputWebchat">
              <q-btn v-if="pluginAudio === 'enabled'" flat icon="mdi-close" color="negative" @click="cancelRecording" class="bg-padrao btn-rounded q-mx-xs" />
              <RecordingTimer v-if="pluginAudio === 'enabled'" class="text-bold" :class="{ 'text-white': $q.dark.isActive }" />
              <q-btn v-if="pluginAudio === 'enabled'" flat icon="mdi-send-circle-outline" color="positive" @click="stopRecordings" class="bg-padrao btn-rounded q-mx-xs" />
              <q-btn v-if="pluginAudio === 'disabled'" flat icon="mdi-close" color="negative" @click="handleCancelRecordingAudio" class="bg-padrao btn-rounded q-mx-xs" />
              <RecordingTimer v-if="pluginAudio === 'disabled'" class="text-bold" :class="{ 'text-white': $q.dark.isActive }" />
              <q-btn v-if="pluginAudio === 'disabled'" flat icon="mdi-send-circle-outline" color="positive" @click="handleStopRecordingAudioWaba" class="bg-padrao btn-rounded q-mx-xs" />
            </div>
          </div>
        </template>
      </div>

      <!-- Modal de Visualização de Imagem -->
      <q-dialog v-model="abrirModalPreviewImagem" position="right" @hide="hideModalPreviewImagem" @show="showModalPreviewImagem">
        <q-card style="height: 90vh; min-width: 60vw; max-width: 60vw" class="q-pa-md">
          <q-card-section>
            <div class="text-h6">
              {{ urlMediaPreview.title }}
              <q-btn class="float-right" icon="close" color="negative" round outline @click="hideModalPreviewImagem" />
            </div>
          </q-card-section>
          <q-card-section>
            <q-img :src="urlMediaPreview.src" spinner-color="white" class="img-responsive mdi-image-auto-adjust q-uploader__file--img" style="height: 60vh; min-width: 55vw; max-width: 55vw" />
          </q-card-section>
          <q-card-actions align="center">
            <q-btn ref="qbtnPasteEnvioMensagem" :label="$t('common.send')" color="primary" v-close-popup @click="enviarMensagem" @keypress.enter.exact="enviarMensagem()" />
          </q-card-actions>
          <span class="row col text-caption text-blue-grey-10">* Send: Enter</span>
          <span class="row col text-caption text-blue-grey-10">** Cancel: ESC</span>
        </q-card>
      </q-dialog>

      <!-- Modal de Envio de Mensagem de Marcacao Fantasma -->
      <q-dialog v-model="modalVisivel" position="standard" @hide="fecharModal">
        <q-card :style="{
          minWidth: $q.screen.lt.sm ? '90vw' : '500px',
          maxWidth: $q.screen.lt.sm ? '98vw' : '600px',
          width: $q.screen.lt.sm ? '98vw' : 'auto'
        }">
          <q-card-section class="q-pa-md">
            <div class="q-gutter-sm row items-center">
            <q-input
            v-model="mensagemMarcacaoFantasma"
            ref="inputEnvioMensagemFantasma"
            id="inputEnvioMensagemFantasma"
            class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemFantasma"
            :label="$t('inputMensagem.labels.mensagemMarcacaoFantasma')"
            filled
            outlined
            dense
            type="textarea"
            bg-color="grey-2"
            color="grey-7"
            :placeholder="$t('inputMensagem.labels.digiteMensagem')"
            input-style="max-height: 30vh"
            hide-bottom-space
            autogrow
            @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarMensagemMarcacaoFantasma() : '')"
            />
            <div class="col-12 q-mt-md">
              <q-toggle 
                keep-color 
                v-model="signGhost" 
                dense 
                :color="signGhost ? 'positive' : 'black'" 
                type="toggle"
              >
                <q-tooltip>
                  {{ signGhost ? $t('inputMensagem.labels.desativarAssinatura') : $t('inputMensagem.labels.ativarAssinatura') }}
                </q-tooltip>
              </q-toggle>
              <span class="q-ml-sm">{{ $t('inputMensagem.labels.assinatura') }}</span>
            </div>
            <q-btn v-if="$q.screen.width > 500" flat dense icon="mdi-emoticon-happy-outline" :disable="cDisableActions || desabilitarInput" class="bg-padrao btn-rounded q-mx-xs" :color="$q.dark.isActive ? 'white' : ''">
              <q-tooltip content-class="text-bold"> Emoji </q-tooltip>
              <q-menu anchor="top right" self="bottom middle" :offset="[5, 40]">
                <VEmojiPicker style="width: 40vw" :showSearch="false" :emojisByRow="calculateEmojisByRow()" :labelSearch="$t('common.search')" lang="pt-BR" @select="onInsertSelectEmojiGhost" />
              </q-menu>
            </q-btn>
          </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              :label="$t('common.send')"
              color="primary"
              @click="enviarMensagemMarcacaoFantasma"
            />
            <q-btn
              :label="$t('common.cancel')"
              color="negative"
              @click="fecharModal"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Modal de Envio de Mensagem de Marcacao Usuario -->
      <q-dialog v-model="modalVisivelUsuario" position="standard" @hide="fecharModalUsuario">
        <q-card :style="{
          minWidth: $q.screen.lt.sm ? '90vw' : '500px',
          maxWidth: $q.screen.lt.sm ? '98vw' : '600px',
          width: $q.screen.lt.sm ? '98vw' : 'auto'
        }">
          <q-card-section class="q-pa-md">
            <div class="q-gutter-sm row items-center">
              <div class="col-12">
                <q-input
                  v-model="mensagemMarcacaoUsuario"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.mensagemMarcacao')"
                  filled
                  outlined
                  dense
                  type="textarea"
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  autogrow
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarMensagemMarcacaoUsuario() : '')"
                />
              </div>
              <div class="col-12 q-mt-md">
                <q-select
                  v-model="selectedParticipants"
                  :options="participantsList"
                  :label="$t('inputMensagem.labels.selecioneParticipantes')"
                  dense
                  outlined
                  multiple
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.selecioneParticipantes')"
                  @update:model-value="handleSelectAllOption"
                />
              </div>
              <div class="col-12 q-mt-md">
                <q-toggle 
                  keep-color 
                  v-model="signMention" 
                  dense 
                  :color="signMention ? 'positive' : 'black'" 
                  type="toggle"
                >
                  <q-tooltip>
                    {{ signMention ? $t('inputMensagem.labels.desativarAssinatura') : $t('inputMensagem.labels.ativarAssinatura') }}
                  </q-tooltip>
                </q-toggle>
                <span class="q-ml-sm">{{ $t('inputMensagem.labels.assinatura') }}</span>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn v-if="$q.screen.width > 500" flat dense icon="mdi-emoticon-happy-outline" :disable="cDisableActions || desabilitarInput" class="bg-padrao btn-rounded q-mx-xs" :color="$q.dark.isActive ? 'white' : ''">
              <q-tooltip content-class="text-bold"> Emoji </q-tooltip>
              <q-menu anchor="top right" self="bottom middle" :offset="[5, 40]">
                <VEmojiPicker style="width: 40vw" :showSearch="false" :emojisByRow="calculateEmojisByRow()" :labelSearch="$t('common.search')" lang="pt-BR" @select="onInsertSelectEmojiMention" />
              </q-menu>
            </q-btn>
            <q-btn
              :label="$t('common.send')"
              color="primary"
              :disable="loading"
              @click="enviarMensagemMarcacaoUsuario"
            />
            <q-btn
              :label="$t('common.cancel')"
              color="negative"
              @click="fecharModalUsuario"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Modal de Envio de Mensagem de Botao -->
      <q-dialog v-model="modalVisivelBotao" position="standard" @hide="fecharModalBotao">
        <q-card :style="{
          minWidth: $q.screen.lt.sm ? '90vw' : '500px',
          maxWidth: $q.screen.lt.sm ? '98vw' : '600px',
          width: $q.screen.lt.sm ? '98vw' : 'auto'
        }">
          <q-card-section class="q-pa-md">
            <div class="q-gutter-sm row items-center">
              <div class="col-12">
                <q-input
                  v-model="mensagemBotao"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('common.message')"
                  filled
                  outlined
                  dense
                  type="textarea"
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  autogrow
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarBotoes() : '')"
                  :rules="[validaMensagem]"
                />
                <q-input
                  v-model="botao1"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.botao1')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarBotoes() : '')"
                  :rules="[validaBotao]"
                />
                <q-input
                  v-model="botao2"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.botao2')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarBotoes() : '')"
                  :rules="[validaBotao]"
                />
                <q-input
                  v-model="botao3"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.botao3')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarBotoes() : '')"
                  :rules="[validaBotao]"
                />
                <div class="col-12 q-mt-md">
                  <q-toggle 
                    keep-color 
                    v-model="signButtons" 
                    dense 
                    :color="signButtons ? 'positive' : 'black'" 
                    type="toggle"
                  >
                    <q-tooltip>
                      {{ signButtons ? $t('inputMensagem.labels.desativarAssinatura') : $t('inputMensagem.labels.ativarAssinatura') }}
                    </q-tooltip>
                  </q-toggle>
                  <span class="q-ml-sm">{{ $t('inputMensagem.labels.assinatura') }}</span>
                </div>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              :label="$t('common.send')"
              color="primary"
              @click="enviarBotoes"
            />
            <q-btn
              :label="$t('common.cancel')"
              color="negative"
              @click="fecharModalBotao"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Modal de Envio de Mensagem de Lista -->
      <q-dialog v-model="modalVisivelLista" position="standard" @hide="fecharModalLista">
        <q-card :style="{
          minWidth: $q.screen.lt.sm ? '90vw' : '500px',
          maxWidth: $q.screen.lt.sm ? '98vw' : '600px',
          width: $q.screen.lt.sm ? '98vw' : 'auto'
        }">
          <q-card-section class="q-pa-md">
            <div class="q-gutter-sm row items-center">
              <div class="col-12">
                <q-input
                  v-model="header"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.header')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
                <q-input
                  v-model="mensagemLista"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('common.message')"
                  filled
                  outlined
                  dense
                  type="textarea"
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  autogrow
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                /> 
                <q-input
                  v-model="button_text"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.botao')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
                <q-input
                  v-model="sectionTitle"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.title')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
                <q-input
                  v-model="footer"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.footer')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
                <hr style="border: 1px solid grey; margin: 10px auto; width: 90%;">
                <q-input
                  v-model="rowTitle1"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.title1')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
                <q-input
                  v-model="rowDescription1"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.description1')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
                <hr style="border: 1px solid grey; margin: 10px auto; width: 90%;">
                <q-input
                  v-model="rowTitle2"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.title2')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
                <q-input
                  v-model="rowDescription2"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.description2')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
                <hr style="border: 1px solid grey; margin: 10px auto; width: 90%;">
                <q-input
                  v-model="rowTitle3"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.title3')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
                <q-input
                  v-model="rowDescription3"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.description3')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
                <hr style="border: 1px solid grey; margin: 10px auto; width: 90%;">
                <q-input
                  v-model="rowTitle4"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.title4')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
                <q-input
                  v-model="rowDescription4"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.description4')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
                <hr style="border: 1px solid grey; margin: 10px auto; width: 90%;">
                <q-input
                  v-model="rowTitle5"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.title5')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
                <q-input
                  v-model="rowDescription5"
                  ref="inputEnvioMensagemUsuario"
                  id="inputEnvioMensagemUsuario"
                  class="col-grow q-mx-xs text-grey-10 inputEnvioMensagemUsuario"
                  :label="$t('inputMensagem.labels.description5')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.labels.digiteMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  style="margin: 10px;"
                  @keydown.exact.enter.prevent="() => (textChat.trim().length ? enviarListas() : '')"
                />
                <div class="col-12 q-mt-md">
                  <q-toggle 
                    keep-color 
                    v-model="signLists" 
                    dense 
                    :color="signLists ? 'positive' : 'black'" 
                    type="toggle"
                  >
                    <q-tooltip>
                      {{ signLists ? $t('inputMensagem.labels.desativarAssinatura') : $t('inputMensagem.labels.ativarAssinatura') }}
                    </q-tooltip>
                  </q-toggle>
                  <span class="q-ml-sm">{{ $t('inputMensagem.labels.assinatura') }}</span>
                </div>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              :label="$t('common.send')"
              color="primary"
              @click="enviarListas"
            />
            <q-btn
              :label="$t('common.cancel')"
              color="negative"
              @click="fecharModalLista"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Modal de Envio de CTA URL -->
      <q-dialog v-model="modalVisivelCTAURL" position="standard" @hide="fecharModalCTAURL">
      <q-card :style="{
        minWidth: $q.screen.lt.sm ? '90vw' : '500px',
        maxWidth: $q.screen.lt.sm ? '98vw' : '600px',
        width: $q.screen.lt.sm ? '98vw' : 'auto'
      }">
        <q-card-section class="q-pa-md">
          <div class="q-gutter-sm row items-center">
            <div class="col-12">
              <!-- Tipo de Header -->
              <q-select
                v-model="headerTypeCTAURL"
                :options="[
                  { label: $t('inputMensagem.novo.texto'), value: 'text' },
                  { label: $t('inputMensagem.novo.imagem'), value: 'image' },
                  { label: $t('inputMensagem.novo.video'), value: 'video' },
                  { label: $t('inputMensagem.novo.documento'), value: 'document' }
                ]"
                :label="$t('inputMensagem.novo.tipoDeHeader')"
                filled
                outlined
                dense
                bg-color="grey-2"
                color="grey-7"
                style="margin: 10px;"
              />
              
              <!-- Header Text -->
              <q-input
                v-if="headerTypeCTAURL === 'text'"
                v-model="headerTextCTAURL"
                :label="$t('inputMensagem.novo.textoDoHeader')"
                filled
                outlined
                dense
                bg-color="grey-2"
                color="grey-7"
                style="margin: 10px;"
              />
              
              <!-- Header Media -->
              <q-input
                v-if="headerTypeCTAURL !== 'text'"
                v-model="headerLinkCTAURL"
                :label="`${headerTypeCTAURL === 'image' ? $t('inputMensagem.novo.imagem') : headerTypeCTAURL === 'video' ? $t('inputMensagem.novo.video') : $t('inputMensagem.novo.documento')}`"
                filled
                outlined
                dense
                bg-color="grey-2"
                color="grey-7"
                style="margin: 10px;"
              />
              
              <!-- Mensagem -->
              <q-input
                v-model="mensagemCTAURL"
                :label="$t('inputMensagem.novo.mensagem')"
                filled
                outlined
                dense
                type="textarea"
                bg-color="grey-2"
                color="grey-7"
                :placeholder="$t('inputMensagem.novo.digiteSuaMensagem')"
                input-style="max-height: 30vh"
                hide-bottom-space
                autogrow
                style="margin: 10px;"
              />
              
              <!-- Texto do Botão -->
              <q-input
                v-model="buttonTextCTAURL"
                :label="$t('inputMensagem.novo.textoDoBotao')"
                filled
                outlined
                dense
                bg-color="grey-2"
                color="grey-7"
                :placeholder="$t('inputMensagem.novo.exemploTextoDoBotao')"
                style="margin: 10px;"
              />
              
              <!-- URL do Botão -->
              <q-input
                v-model="buttonURLCTAURL"
                :label="$t('inputMensagem.novo.urlDoBotao')"
                filled
                outlined
                dense
                bg-color="grey-2"
                color="grey-7"
                :placeholder="$t('inputMensagem.novo.exemploUrlDoBotao')"
                style="margin: 10px;"
              />
              
              <!-- Footer -->
              <q-input
                v-model="footerCTAURL"
                :label="$t('inputMensagem.novo.footeropt')"
                filled
                outlined
                dense
                bg-color="grey-2"
                color="grey-7"
                :placeholder="$t('inputMensagem.novo.textoDoFooter')"
                style="margin: 10px;"
              />
              
              <!-- Assinatura -->
              <div class="col-12 q-mt-md">
                <q-toggle 
                  keep-color 
                  v-model="signCTAURL" 
                  dense 
                  :color="signCTAURL ? 'positive' : 'black'" 
                  type="toggle"
                >
                  <q-tooltip>
                    {{ signCTAURL ? $t('inputMensagem.labels.desativarAssinatura') : $t('inputMensagem.labels.ativarAssinatura') }}
                  </q-tooltip>
                </q-toggle>
                <span class="q-ml-sm">{{ $t('inputMensagem.labels.assinatura') }}</span>
              </div>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            :label="$t('common.send')"
            color="primary"
            @click="enviarCTAURL"
          />
          <q-btn
            :label="$t('common.cancel')"
            color="negative"
            @click="fecharModalCTAURL"
          />
        </q-card-actions>
      </q-card>
      </q-dialog>

      <!-- Modal de Envio de Flow -->
      <q-dialog v-model="modalVisivelFlow" position="standard" @hide="fecharModalFlow">
        <q-card :style="{
          minWidth: $q.screen.lt.sm ? '90vw' : '500px',
          maxWidth: $q.screen.lt.sm ? '98vw' : '600px',
          width: $q.screen.lt.sm ? '98vw' : 'auto'
        }">
          <q-card-section class="q-pa-md">
            <div class="q-gutter-sm row items-center">
              <div class="col-12">
                <!-- Tipo de Header -->
                <q-select
                  v-model="headerTypeFlow"
                  :options="[
                    { label: $t('inputMensagem.novo.texto'), value: 'text' },
                    { label: $t('inputMensagem.novo.imagem'), value: 'image' },
                    { label: $t('inputMensagem.novo.video'), value: 'video' },
                    { label: $t('inputMensagem.novo.documento'), value: 'document' }
                  ]"
                  :label="$t('inputMensagem.novo.tipoDeHeader')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  style="margin: 10px;"
                />
                
                <!-- Header Text -->
                <q-input
                  v-if="headerTypeFlow === 'text'"
                  v-model="headerTextFlow"
                  :label="$t('inputMensagem.novo.textoDoHeader')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  style="margin: 10px;"
                />
                
                <!-- Header Media -->
                <q-input
                  v-if="headerTypeFlow !== 'text'"
                  v-model="headerLinkFlow"
                  :label="`${headerTypeFlow === 'image' ? $t('inputMensagem.novo.imagem') : headerTypeFlow === 'video' ? $t('inputMensagem.novo.video') : $t('inputMensagem.novo.documento')}`"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  style="margin: 10px;"
                />
                
                <!-- Mensagem -->
                <q-input
                  v-model="mensagemFlow"
                  :label="$t('inputMensagem.novo.mensagem')"
                  filled
                  outlined
                  dense
                  type="textarea"
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.novo.digiteSuaMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  autogrow
                  style="margin: 10px;"
                />
                
                <!-- Footer -->
                <q-input
                  v-model="footerFlow"
                  :label="$t('inputMensagem.novo.footeropt')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.novo.textoDoFooter')"
                  style="margin: 10px;"
                />
                
                <!-- Flow ID ou Nome -->
                <q-input
                  v-model="flowId"
                  :label="$t('inputMensagem.novo.flowIdopt')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.novo.idDoFlow')"
                  style="margin: 10px;"
                />
                
                <q-input
                  v-model="flowName"
                  :label="$t('inputMensagem.novo.flowNameopt')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.novo.nomeDoFlow')"
                  style="margin: 10px;"
                />
                
                <!-- Flow CTA -->
                <q-input
                  v-model="flowCta"
                  :label="$t('inputMensagem.novo.flowCtaopt')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.novo.textoDoCta')"
                  style="margin: 10px;"
                />
                
                <!-- Flow Token -->
                <q-input
                  v-model="flowToken"
                  :label="$t('inputMensagem.novo.flowTokenopt')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.novo.tokenDoFlow')"
                  style="margin: 10px;"
                />
                
                <!-- Flow Action -->
                <q-select
                  v-model="flowAction"
                  :options="[
                    { label: $t('inputMensagem.novo.navegar'), value: 'navigate' },
                    { label: $t('inputMensagem.novo.trocaDeDados'), value: 'data_exchange' }
                  ]"
                  :label="$t('inputMensagem.novo.flowAction')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  style="margin: 10px;"
                />
                
                <!-- Flow Action Payload -->
                <q-input
                  v-model="flowActionPayload"
                  :label="$t('inputMensagem.novo.flowActionPayloadopt')"
                  filled
                  outlined
                  dense
                  type="textarea"
                  bg-color="grey-2"
                  color="grey-7"
                  placeholder='{"screen": "tela1", "data": {}}'
                  style="margin: 10px;"
                />
                
                <!-- Assinatura -->
                <div class="col-12 q-mt-md">
                  <q-toggle 
                    keep-color 
                    v-model="signFlow" 
                    dense 
                    :color="signFlow ? 'positive' : 'black'" 
                    type="toggle"
                  >
                    <q-tooltip>
                      {{ signFlow ? $t('inputMensagem.labels.desativarAssinatura') : $t('inputMensagem.labels.ativarAssinatura') }}
                    </q-tooltip>
                  </q-toggle>
                  <span class="q-ml-sm">{{ $t('inputMensagem.labels.assinatura') }}</span>
                </div>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              :label="$t('common.send')"
              color="primary"
              @click="enviarFlow"
            />
            <q-btn
              :label="$t('common.cancel')"
              color="negative"
              @click="fecharModalFlow"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Modal de Envio de Reply Buttons -->
      <q-dialog v-model="modalVisivelReplyButtons" position="standard" @hide="fecharModalReplyButtons">
        <q-card :style="{
          minWidth: $q.screen.lt.sm ? '90vw' : '500px',
          maxWidth: $q.screen.lt.sm ? '98vw' : '600px',
          width: $q.screen.lt.sm ? '98vw' : 'auto'
        }">
          <q-card-section class="q-pa-md">
            <div class="q-gutter-sm row items-center">
              <div class="col-12">
                <!-- Tipo de Header -->
                <q-select
                  v-model="headerTypeReplyButtons"
                  :options="[
                    { label: $t('inputMensagem.novo.texto'), value: 'text' },
                    { label: $t('inputMensagem.novo.imagem'), value: 'image' },
                    { label: $t('inputMensagem.novo.video'), value: 'video' },
                    { label: $t('inputMensagem.novo.documento'), value: 'document' }
                  ]"
                  :label="$t('inputMensagem.novo.tipoDeHeader')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  style="margin: 10px;"
                />
                
                <!-- Header Text -->
                <q-input
                  v-if="headerTypeReplyButtons === 'text'"
                  v-model="headerTextReplyButtons"
                  :label="$t('inputMensagem.novo.textoDoHeader')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  style="margin: 10px;"
                />
                
                <!-- Header Media -->
                <q-input
                  v-if="headerTypeReplyButtons !== 'text'"
                  v-model="headerLinkReplyButtons"
                  :label="`${headerTypeReplyButtons === 'image' ? $t('inputMensagem.novo.imagem') : headerTypeReplyButtons === 'video' ? $t('inputMensagem.novo.video') : $t('inputMensagem.novo.documento')}`"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  style="margin: 10px;"
                />
                
                <!-- Mensagem -->
                <q-input
                  v-model="mensagemReplyButtons"
                  :label="$t('inputMensagem.novo.mensagem')"
                  filled
                  outlined
                  dense
                  type="textarea"
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.novo.digiteSuaMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  autogrow
                  style="margin: 10px;"
                />
                
                <!-- Footer -->
                <q-input
                  v-model="footerReplyButtons"
                  :label="$t('inputMensagem.novo.footeropt')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.novo.textoDoFooter')"
                  style="margin: 10px;"
                />
                
                <!-- Botões -->
                <div v-for="(button, index) in buttonsReplyButtons" :key="index" class="q-mb-md">
                  <div class="text-subtitle2 q-mb-sm">Botão {{ index + 1 }}</div>
                  <q-input
                    v-model="button.title"
                    :label="`${$t('inputMensagem.novo.tituloDoBotao')} ${index + 1}`"
                    filled
                    outlined
                    dense
                    bg-color="grey-2"
                    color="grey-7"
                    :placeholder="$t('inputMensagem.novo.tituloDoBotao')"
                    style="margin: 10px;"
                  />
                </div>
                
                <!-- Assinatura -->
                <div class="col-12 q-mt-md">
                  <q-toggle 
                    keep-color 
                    v-model="signReplyButtons" 
                    dense 
                    :color="signReplyButtons ? 'positive' : 'black'" 
                    type="toggle"
                  >
                    <q-tooltip>
                      {{ signReplyButtons ? $t('inputMensagem.labels.desativarAssinatura') : $t('inputMensagem.labels.ativarAssinatura') }}
                    </q-tooltip>
                  </q-toggle>
                  <span class="q-ml-sm">{{ $t('inputMensagem.labels.assinatura') }}</span>
                </div>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              :label="$t('common.send')"
              color="primary"
              @click="enviarReplyButtons"
            />
            <q-btn
              :label="$t('common.cancel')"
              color="negative"
              @click="fecharModalReplyButtons"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Modal de Envio de Endereço -->
      <q-dialog v-model="modalVisivelAddress" position="standard" @hide="fecharModalAddress">
        <q-card :style="{
          minWidth: $q.screen.lt.sm ? '90vw' : '500px',
          maxWidth: $q.screen.lt.sm ? '98vw' : '600px',
          width: $q.screen.lt.sm ? '98vw' : 'auto'
        }">
          <q-card-section class="q-pa-md">
            <div class="q-gutter-sm row items-center">
              <div class="col-12">
                <!-- Rua 1 -->
                <q-input
                  v-model="street1"
                  :label="$t('inputMensagem.novo.rua1opt')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.novo.enderecoPrincipal')"
                  style="margin: 10px;"
                />
                
                <!-- Rua 2 -->
                <q-input
                  v-model="street2"
                  :label="$t('inputMensagem.novo.rua2opt')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.novo.complemento')"
                  style="margin: 10px;"
                />
                
                <!-- Cidade -->
                <q-input
                  v-model="city"
                  :label="$t('inputMensagem.novo.cidadeopt')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.novo.nomeDaCidade')"
                  style="margin: 10px;"
                />
                
                <!-- Estado -->
                <q-input
                  v-model="state"
                  :label="$t('inputMensagem.novo.estadoopt')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.novo.nomeDoEstado')"
                  style="margin: 10px;"
                />
                
                <!-- CEP -->
                <q-input
                  v-model="zip"
                  :label="$t('inputMensagem.novo.cepopt')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.novo.cep')"
                  style="margin: 10px;"
                />
                
                <!-- País -->
                <q-input
                  v-model="country"
                  :label="$t('inputMensagem.novo.paisopt')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.novo.nomeDoPais')"
                  style="margin: 10px;"
                />
                
                <!-- Tipo de Endereço -->
                <q-select
                  v-model="addressType"
                  :options="[
                    { label: $t('inputMensagem.novo.casa'), value: 'HOME' },
                    { label: $t('inputMensagem.novo.trabalho'), value: 'WORK' }
                  ]"
                  :label="$t('inputMensagem.novo.tipoDeEndereco')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  style="margin: 10px;"
                />
                
                <!-- Assinatura -->
                <div class="col-12 q-mt-md">
                  <q-toggle 
                    keep-color 
                    v-model="signAddress" 
                    dense 
                    :color="signAddress ? 'positive' : 'black'" 
                    type="toggle"
                  >
                    <q-tooltip>
                      {{ signAddress ? $t('inputMensagem.labels.desativarAssinatura') : $t('inputMensagem.labels.ativarAssinatura') }}
                    </q-tooltip>
                  </q-toggle>
                  <span class="q-ml-sm">{{ $t('inputMensagem.labels.assinatura') }}</span>
                </div>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              :label="$t('common.send')"
              color="primary"
              @click="enviarAddress"
            />
            <q-btn
              :label="$t('common.cancel')"
              color="negative"
              @click="fecharModalAddress"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Modal de Envio de Solicitação de Localização -->
      <q-dialog v-model="modalVisivelLocationRequest" position="standard" @hide="fecharModalLocationRequest">
        <q-card :style="{
          minWidth: $q.screen.lt.sm ? '90vw' : '500px',
          maxWidth: $q.screen.lt.sm ? '98vw' : '600px',
          width: $q.screen.lt.sm ? '98vw' : 'auto'
        }">
          <q-card-section class="q-pa-md">
            <div class="q-gutter-sm row items-center">
              <div class="col-12">
                <!-- Mensagem -->
                <q-input
                  v-model="mensagemLocationRequest"
                  :label="$t('inputMensagem.novo.mensagem')"
                  filled
                  outlined
                  dense
                  type="textarea"
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.novo.digiteSuaMensagem')"
                  input-style="max-height: 30vh"
                  hide-bottom-space
                  autogrow
                  style="margin: 10px;"
                />
                

                
                <!-- Assinatura -->
                <div class="col-12 q-mt-md">
                  <q-toggle 
                    keep-color 
                    v-model="signLocationRequest" 
                    dense 
                    :color="signLocationRequest ? 'positive' : 'black'" 
                    type="toggle"
                  >
                    <q-tooltip>
                      {{ signLocationRequest ? $t('inputMensagem.labels.desativarAssinatura') : $t('inputMensagem.labels.ativarAssinatura') }}
                    </q-tooltip>
                  </q-toggle>
                  <span class="q-ml-sm">{{ $t('inputMensagem.labels.assinatura') }}</span>
                </div>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              :label="$t('common.send')"
              color="primary"
              @click="enviarLocationRequest"
            />
            <q-btn
              :label="$t('common.cancel')"
              color="negative"
              @click="fecharModalLocationRequest"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Modal de Envio de Localização -->
      <q-dialog v-model="modalVisivelLocation" position="standard" @hide="fecharModalLocation">
        <q-card :style="{
          minWidth: $q.screen.lt.sm ? '90vw' : '500px',
          maxWidth: $q.screen.lt.sm ? '98vw' : '600px',
          width: $q.screen.lt.sm ? '98vw' : 'auto'
        }">
          <q-card-section class="q-pa-md">
            <div class="q-gutter-sm row items-center">
              <div class="col-12">
                <!-- Latitude -->
                <q-input
                  v-model="latitude"
                  :label="$t('inputMensagem.novo.latitudeopt')"
                  filled
                  outlined
                  dense
                  type="number"
                  step="any"
                  bg-color="grey-2"
                  color="grey-7"
                  placeholder="-23.5505"
                  style="margin: 10px;"
                />
                
                <!-- Longitude -->
                <q-input
                  v-model="longitude"
                  :label="$t('inputMensagem.novo.longitudeopt')"
                  filled
                  outlined
                  dense
                  type="number"
                  step="any"
                  bg-color="grey-2"
                  color="grey-7"
                  placeholder="-46.6333"
                  style="margin: 10px;"
                />
                
                <!-- Nome da Localização -->
                <q-input
                  v-model="locationName"
                  :label="$t('inputMensagem.novo.nomeDaLocalizacaoopt')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.novo.exemploNomeDaLocalizacao')"
                  style="margin: 10px;"
                />
                
                <!-- Endereço -->
                <q-input
                  v-model="locationAddress"
                  :label="$t('inputMensagem.novo.enderecoopt')"
                  filled
                  outlined
                  dense
                  type="textarea"
                  bg-color="grey-2"
                  color="grey-7"
                  :placeholder="$t('inputMensagem.novo.enderecoCompleto')"
                  style="margin: 10px;"
                />
                
                <!-- Assinatura -->
                <div class="col-12 q-mt-md">
                  <q-toggle 
                    keep-color 
                    v-model="signLocation" 
                    dense 
                    :color="signLocation ? 'positive' : 'black'" 
                    type="toggle"
                  >
                    <q-tooltip>
                      {{ signLocation ? $t('inputMensagem.labels.desativarAssinatura') : $t('inputMensagem.labels.ativarAssinatura') }}
                    </q-tooltip>
                  </q-toggle>
                  <span class="q-ml-sm">{{ $t('inputMensagem.labels.assinatura') }}</span>
                </div>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              :label="$t('common.send')"
              color="primary"
              @click="enviarLocationWaba"
            />
            <q-btn
              :label="$t('common.cancel')"
              color="negative"
              @click="fecharModalLocation"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Modal de Envio de Template -->
      <!-- <q-dialog v-model="modalVisivelTemplate" position="standard" @hide="fecharModalTemplate">
        <q-card :style="{
          minWidth: $q.screen.lt.sm ? '90vw' : '800px',
          maxWidth: $q.screen.lt.sm ? '98vw' : '1000px',
          width: $q.screen.lt.sm ? '98vw' : 'auto'
        }">
          <q-card-section class="q-pa-md">
            <div class="row q-col-gutter-md">
              <div :class="$q.screen.lt.sm ? 'col-12 q-mb-md' : 'col-6'">
                <div class="text-subtitle1" align="middle">Seleção de Template</div>
                <q-select
                  v-model="selectedTemplate"
                  :options="templates.map(template => ({ label: `${template.name} (ID: ${template.id}, Lang: ${template.language})`, value: template }))"
                  :label="$t('inputMensagem.labels.templateChoose')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  style="margin: 10px;"
                  @update:model-value="handleTemplateSelection"
                />
                <div v-if="selectedTemplateComponents.length > 0">
                  <div v-for="(input, index) in selectedTemplateComponents" :key="index">
                    <q-input
                      v-model="input.value"
                      :label="input.label"
                      filled
                      outlined
                      dense
                      bg-color="grey-2"
                      color="grey-7"
                      style="margin: 10px;"
                    />
                  </div>
                </div>
              </div>

              <div :class="$q.screen.lt.sm ? 'col-12' : 'col-6 column items-center justify-start'">
                <div class="text-subtitle1 q-mb-sm text-center">Preview</div>
                <div class="mobile-mockup q-mx-auto">
                  <div class="mobile-notch"></div>
                  <div class="mobile-screen">
                    <div class="preview-header" v-if="previewData.headerType">
                      <span v-if="previewData.headerType === 'TEXT'">{{ previewHeaderContent }}</span>
                      <q-icon v-if="previewData.headerType === 'IMAGE'" name="image" size="xl" color="grey-7"/>
                      <q-icon v-if="previewData.headerType === 'VIDEO'" name="movie" size="xl" color="grey-7"/>
                      <q-icon v-if="previewData.headerType === 'DOCUMENT'" name="description" size="xl" color="grey-7"/>
                      <span v-if="previewData.headerType !== 'TEXT'" class="text-caption text-grey block">
                        {{ previewHeaderContent }}
                      </span>
                    </div>
                    <div class="preview-body" v-html="previewBodyContent"></div>
                    <div class="preview-footer">{{ previewFooterContent }}</div>
                    <div class="preview-buttons" v-if="previewButtonType !== 'NONE'">
                      <div v-if="previewButtonType === 'QUICK_REPLY'">
                        <q-chip v-for="(button, index) in previewQuickReplyButtons" :key="`prev-qr-${index}`" clickable color="blue-1" text-color="blue-8" icon="reply" class="q-ma-xs">
                          {{ button.text || `Botão ${index + 1}` }}
                        </q-chip>
                      </div>
                      <div v-if="previewButtonType === 'FLOW'">
                        <q-chip v-for="(button, index) in previewFlowButtons" :key="`prev-qr-${index}`" clickable color="blue-1" text-color="blue-8" icon="reply" class="q-ma-xs">
                          {{ button.text || `Botão ${index + 1}` }}
                        </q-chip>
                      </div>
                      <div v-if="previewButtonType === 'CATALOG'">
                        <q-chip v-for="(button, index) in previewCatalogButtons" :key="`prev-qr-${index}`" clickable color="blue-1" text-color="blue-8" icon="reply" class="q-ma-xs">
                          {{ button.text || `Botão ${index + 1}` }}
                        </q-chip>
                      </div>
                      <div v-if="previewButtonType === 'CALL_TO_ACTION'">
                        <q-btn
                          v-for="(button, index) in previewActionButtons"
                          :key="`prev-cta-${index}`"
                          :icon="button.type === 'PHONE_NUMBER' ? 'call' : 'link'"
                          :label="button.text || `Ação ${index + 1}`"
                          no-caps flat dense
                          class="full-width q-mb-xs preview-cta-button"
                          align="left"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              :label="$t('common.send')"
              color="primary"
              :disabled="!selectedTemplate"
              @click="enviarTemplateSelecionado"
            />
            <q-btn
              :label="$t('common.cancel')"
              color="negative"
              @click="fecharModalTemplate"
            />
          </q-card-actions>
        </q-card>
      </q-dialog> -->

      <q-dialog v-model="modalVisivelTemplate" position="standard" @hide="fecharModalTemplate" class="dialog-template-preview">
        <q-card style="min-width: 80vw; max-width: 95vw; max-height: 85vh; overflow-y: auto;">
          <q-card-section class="q-pa-md">
            <div class="row q-col-gutter-md">

              <div class="col-12 col-md-6">
                <div class="text-subtitle1" align="middle">{{ $t('inputMensagem.labels.templateChoose') }}</div>
                <q-select
                  v-model="selectedTemplate"
                  :options="templates.map(template => ({ label: `${template.name} (ID: ${template.id}, Lang: ${template.language})`, value: template }))"
                  :label="$t('inputMensagem.labels.templateChoose')"
                  filled outlined dense bg-color="grey-2" color="grey-7"
                  style="margin: 10px;"
                  @update:model-value="handleTemplateSelection"
                />
                <div v-if="selectedTemplateComponents.length > 0">
                  <div v-for="(input, index) in selectedTemplateComponents" :key="index">
                    <q-input
                      v-model="input.value"
                      :label="input.label"
                      filled outlined dense bg-color="grey-2" color="grey-7"
                      style="margin: 10px;"
                      :type="(input.key.startsWith('variable_') || input.key.startsWith('named_variable_')) ? 'text' : 'textarea'"
                      :autogrow="!(input.key.startsWith('variable_') || input.key.startsWith('named_variable_'))"
                      @keydown.enter.prevent="(input.key.startsWith('variable_') || input.key.startsWith('named_variable_')) ? $event.preventDefault() : null"
                    />
                  </div>
                </div>
              </div>

              <div class="col-12 col-md-6">
                <div class="text-subtitle1 q-mb-sm text-center">Preview</div>
                <div class="mobile-mockup q-mx-auto">
                  <div class="mobile-notch"></div>
                  <div class="mobile-screen">

                    <div
                      class="preview-message-bubble"
                      :class="{ 'bubble-max-width': shouldMaximizeBubbleWidth }"
                    >
                        <div class="preview-header" v-if="previewData.headerType">
                            <q-icon
                                v-if="previewData.headerType === 'IMAGE' && !getPreviewHeaderMediaUrl()"
                                name="image" size="xl" color="grey-7" class="preview-header-icon"
                            />
                            <q-img
                                v-if="previewData.headerType === 'IMAGE' && getPreviewHeaderMediaUrl()"
                                :src="getPreviewHeaderMediaUrl()" spinner-color="primary" contain
                                style="max-height: 160px;" class="preview-header-image"
                            > <template v-slot:error> <div class="absolute-full flex flex-center bg-negative text-white text-caption q-pa-xs"> Falha ao carregar imagem </div> </template> </q-img>
                            <q-icon
                                v-if="previewData.headerType === 'VIDEO'"
                                name="movie" size="xl" color="grey-7" class="preview-header-icon"
                            />
                            <q-icon
                                v-if="previewData.headerType === 'DOCUMENT'"
                                name="description" size="xl" color="grey-7" class="preview-header-icon"
                            />
                            <div v-if="previewData.headerType === 'TEXT'" v-html="previewHeaderContent" class="preview-header-text"></div>
                            <div v-if="previewData.headerType === 'VIDEO' || previewData.headerType === 'DOCUMENT'" class="preview-header-caption">
                                {{ getPreviewHeaderMediaUrl() || 'URL/Handle não disponível' }}
                            </div>
                        </div>

                        <div class="preview-body" v-if="previewBodyContent" v-html="previewBodyContent"></div>

                        <div class="preview-footer" v-if="previewFooterContent">
                            {{ previewFooterContent }}
                        </div>

                        <div class="preview-buttons" v-if="previewButtonType !== 'NONE'">
                            <div v-if="previewButtonType === 'QUICK_REPLY'" class="preview-quick-reply-buttons">
                                <q-chip dense v-for="(button, index) in previewQuickReplyButtons" :key="`prev-qr-${index}`" clickable color="blue-1" text-color="blue-8" icon="reply" size="sm" class="q-ma-xs">
                                    {{ button.text || `Botão ${index + 1}` }} </q-chip>
                            </div>
                            <div v-if="previewButtonType === 'CALL_TO_ACTION'" class="preview-action-buttons">
                                <q-btn v-for="(button, index) in previewActionButtons" :key="`prev-cta-${index}`" :icon="button.type === 'PHONE_NUMBER' ? 'call' : 'link'" :label="button.text || `Ação ${index + 1}`" no-caps flat dense size="sm" class="full-width q-my-xs preview-cta-button" align="center" />
                            </div>
                            <div v-if="previewButtonType === 'FLOW'">
                              <q-chip v-for="(button, index) in previewFlowButtons" :key="`prev-qr-${index}`" clickable color="blue-1" text-color="blue-8" icon="reply" class="q-ma-xs">
                                {{ button.text || `Botão ${index + 1}` }}
                              </q-chip>
                            </div>
                            <div v-if="previewButtonType === 'CATALOG'">
                              <q-chip v-for="(button, index) in previewCatalogButtons" :key="`prev-qr-${index}`" clickable color="blue-1" text-color="blue-8" icon="reply" class="q-ma-xs">
                                {{ button.text || `Botão ${index + 1}` }}
                              </q-chip>
                            </div>
                        </div>

                    </div> 
                  </div> 
                </div> 
              </div> 
            </div> 
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              :label="$t('common.send')"
              color="primary"
              :disabled="!selectedTemplate"
              @click="enviarTemplateSelecionado"
            />
            <q-btn
              :label="$t('common.sendMarketing')"
              color="primary"
              :disabled="!selectedTemplate"
              @click="enviarTemplateSelecionadoMarketing"
            />
            <q-btn
              :label="$t('common.cancel')"
              color="negative"
              @click="fecharModalTemplate"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Modal de Envio de Template Messenger -->
      <q-dialog v-model="modalVisivelTemplateMessenger" position="standard" @hide="fecharModalTemplateMessenger">
        <q-card :style="{
          minWidth: $q.screen.lt.sm ? '90vw' : '500px',
          maxWidth: $q.screen.lt.sm ? '98vw' : '600px',
          width: $q.screen.lt.sm ? '98vw' : 'auto'
        }">
          <q-card-section class="q-pa-md">
            <div class="text-h6">{{ $t('inputMensagem.labels.templates') || 'Templates Messenger' }}</div>
            <div class="text-caption text-grey q-mt-sm">
              {{ $t('inputMensagem.labels.selectTemplateMessenger') || 'Selecione um template para enviar' }}
            </div>
          </q-card-section>

          <q-card-section class="q-pa-md">
            <q-select
              v-model="selectedTemplateCategoryMessenger"
              :options="[
                { label: $t('inputMensagem.labels.marketing') || 'Marketing', value: 'MARKETING' },
                { label: $t('inputMensagem.labels.utility') || 'Utility', value: 'UTILITY' }
              ]"
              :label="$t('inputMensagem.labels.templateCategory') || 'Categoria do Template'"
              filled
              outlined
              dense
              bg-color="grey-2"
              color="grey-7"
              class="q-mb-md"
            />
            
            <q-select
              v-if="selectedTemplateCategoryMessenger === 'MARKETING'"
              v-model="selectedTemplateMessenger"
              :options="templatesMessenger.map(template => ({ 
                label: `${template.topic_title || $t('inputMensagem.labels.noTitle')} (${$t('inputMensagem.labels.status')}: ${template.user_token_status || 'N/A'})`, 
                value: template 
              }))"
              :label="$t('inputMensagem.labels.templateChoose') || 'Escolher Template'"
              filled
              outlined
              dense
              bg-color="grey-2"
              color="grey-7"
            />
            
            <q-input
              v-if="selectedTemplateCategoryMessenger === 'UTILITY'"
              v-model="selectedTemplateMessenger"
              :label="$t('inputMensagem.labels.templateName') || 'Nome do Template'"
              filled
              outlined
              dense
              bg-color="grey-2"
              color="grey-7"
              :placeholder="$t('inputMensagem.labels.enterTemplateName') || 'Digite o nome do template utility'"
            />
            
            <div v-if="selectedTemplateMessenger && selectedTemplateCategoryMessenger === 'MARKETING'" class="q-mt-md">
              <q-card flat bordered class="q-pa-sm">
                <div class="text-caption text-grey">
                  <div><strong>{{ $t('inputMensagem.labels.token') || 'Token' }}:</strong> {{ selectedTemplateMessenger.notification_messages_token?.substring(0, 30) }}...</div>
                  <div><strong>{{ $t('inputMensagem.labels.status') || 'Status' }}:</strong> {{ selectedTemplateMessenger.user_token_status || 'N/A' }}</div>
                  <div v-if="selectedTemplateMessenger.next_eligible_time">
                    <strong>{{ $t('inputMensagem.labels.nextSend') || 'Próximo envio' }}:</strong> {{ new Date(selectedTemplateMessenger.next_eligible_time * 1000).toLocaleString() }}
                  </div>
                </div>
              </q-card>
            </div>
            
            <div v-if="selectedTemplateCategoryMessenger === 'UTILITY'" class="q-mt-sm">
              <q-card flat bordered class="q-pa-sm bg-blue-1">
                <div class="text-caption text-grey">
                  <q-icon name="info" color="info" class="q-mr-xs" />
                  {{ $t('inputMensagem.labels.utilityTemplateInfo') || 'Templates utility são enviados dentro da janela de 24 horas após a última mensagem do usuário.' }}
                </div>
              </q-card>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-pa-md">
            <q-btn
              flat
              :label="$t('inputMensagem.labels.cancel') || 'Cancelar'"
              color="negative"
              @click="fecharModalTemplateMessenger"
            />
            <q-btn
              :label="$t('inputMensagem.labels.send') || 'Enviar'"
              color="primary"
              @click="enviarTemplateMessenger"
              :disabled="!selectedTemplateMessenger || (selectedTemplateCategoryMessenger === 'UTILITY' && !selectedTemplateMessenger.trim())"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Modal de Envio de Template Hub -->
      <q-dialog v-model="modalVisivelTemplateHub" position="standard" @hide="fecharModalTemplateHub">
        <q-card :style="{
          minWidth: $q.screen.lt.sm ? '90vw' : '500px',
          maxWidth: $q.screen.lt.sm ? '98vw' : '600px',
          width: $q.screen.lt.sm ? '98vw' : 'auto'
        }">
          <q-card-section class="q-pa-md">
            <div class="q-gutter-sm row items-center">
              <div class="col-12">
                <q-select
                  v-model="selectedTemplateHub"
                  :options="templatesHub.map(template => ({ label: `${template.name} (ID: ${template.id}, Lang: ${template.language})`, value: template }))"
                  :label="$t('inputMensagem.labels.templateChoose')"
                  filled
                  outlined
                  dense
                  bg-color="grey-2"
                  color="grey-7"
                  style="margin: 10px;"
                  @update:model-value="handleTemplateSelectionHub"
                />
              </div>
              <div class="col-12" v-if="selectedTemplateComponentsHub.length > 0">
                <div v-for="(input, index) in selectedTemplateComponentsHub" :key="index">
                  <q-input
                    v-model="input.value"
                    :label="input.label"
                    filled
                    outlined
                    dense
                    bg-color="grey-2"
                    color="grey-7"
                    style="margin: 10px;"
                    :type="(input.key.startsWith('variable_') || input.key.startsWith('named_variable_')) ? 'text' : 'textarea'"
                    :autogrow="!(input.key.startsWith('variable_') || input.key.startsWith('named_variable_'))"
                    @keydown.enter.prevent="(input.key.startsWith('variable_') || input.key.startsWith('named_variable_')) ? $event.preventDefault() : null"
                  />
                </div>
              </div>
            </div>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              :label="$t('common.send')"
              color="primary"
              :disabled="!selectedTemplateHub"
              @click="enviarTemplateSelecionadoHub"
            />
            <q-btn
              :label="$t('common.cancel')"
              color="negative"
              @click="fecharModalTemplateHub"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Modal de Gravação de Video -->
      <q-dialog v-model="modalGravacaoVideoVisivel" @hide="fecharModalGravacaoVideo">
        <q-card class="q-pa-sm" :style="{
          minWidth: $q.screen.lt.sm ? '90vw' : '500px',
          maxWidth: $q.screen.lt.sm ? '98vw' : '600px',
          width: $q.screen.lt.sm ? '98vw' : '500px',
          maxHeight: '95vh',
        }">
          <q-card-section>
            <div class="q-pa-xs">
                <video ref="videoPreview" autoplay style="width: 100%; height: auto; max-height: 300px;"></video>
            </div>
          </q-card-section>
          <q-card-actions align="center" class="q-mb-sm">
            <q-btn v-if="!isRecordingVideo" @click="handleStartRecordingVideo" 
            :label="$t('inputMensagem.labels.startRecord')"
            color="primary" class="full-width q-mb-xs" />
            <q-btn v-if="isRecordingVideo" @click="handleStopRecordingVideo" 
            :label="$t('inputMensagem.labels.sendRecord')"
            color="primary" class="full-width q-mb-xs" />
            <q-btn @click="fecharModalGravacaoVideo" :label="$t('common.cancel')" color="negative" class="full-width" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Modal de Envio de Anexo -->
      <q-dialog v-model="dialogAnexo" persistent>
        <q-card :style="{
          minWidth: $q.screen.lt.sm ? '90vw' : '500px',
          maxWidth: $q.screen.lt.sm ? '98vw' : '600px',
          width: $q.screen.lt.sm ? '98vw' : 'auto'
        }">
          <q-card-section class="row items-center">
            <div class="text-h6">{{ $t('inputMensagem.labels.anexarArquivo') }}</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section>
            <div class="q-gutter-md">
              <q-file
                v-model="arquivoAnexo"
                :label="$t('inputMensagem.labels.selecioneArquivo')"
                outlined
                @update:model-value="handleArquivoSelecionado"
                :accept="acceptComputed"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>

              <q-input
                v-model="captionAnexo"
                :label="$t('inputMensagem.labels.caption')"
                outlined
                type="textarea"
                autogrow
              />

              <div class="q-mt-md">
                <q-toggle 
                  keep-color 
                  v-model="signAttachment" 
                  dense 
                  :color="signAttachment ? 'positive' : 'black'" 
                  type="toggle"
                >
                  <q-tooltip>
                    {{ signAttachment ? $t('inputMensagem.labels.desativarAssinatura') : $t('inputMensagem.labels.ativarAssinatura') }}
                  </q-tooltip>
                </q-toggle>
                <span class="q-ml-sm">{{ $t('inputMensagem.labels.assinatura') }}</span>
              </div>

              <!-- Preview do arquivo -->
              <div v-if="previewUrl" class="q-mt-md">
                <div class="text-subtitle2 q-mb-sm">{{ $t('inputMensagem.labels.preview') }}</div>
                <div class="preview-container" style="max-width: 100%; overflow-x: auto;">
                  <!-- Preview de imagem -->
                  <q-img
                    v-if="isImage"
                    :src="previewUrl"
                    style="max-height: 200px; max-width: 100%;"
                    contain
                  />
                  <!-- Preview de vídeo -->
                  <video
                    v-else-if="isVideo"
                    :src="previewUrl"
                    controls
                    style="max-height: 200px; max-width: 100%;"
                  />
                  <!-- Preview de PDF -->
                  <div v-else-if="isPdf" class="pdf-preview">
                    <q-icon name="picture_as_pdf" size="4rem" color="red" />
                    <div class="text-caption">{{ arquivoAnexo?.name }}</div>
                  </div>
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              :label="$t('common.cancel')"
              color="negative"
              v-close-popup
            />
            <q-btn
              :label="$t('common.send')"
              color="primary"
              :disable="!arquivoAnexo || loading"
              @click="enviarAnexo"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Dialog de Galeria -->
      <q-dialog v-model="dialogGaleria" persistent>
        <q-card :style="{
          minWidth: $q.screen.lt.sm ? '90vw' : '700px',
          maxWidth: $q.screen.lt.sm ? '98vw' : '900px',
          width: $q.screen.lt.sm ? '98vw' : 'auto'
        }">
          <q-card-section class="row items-center">
            <div class="text-h6">{{ $t('inputMensagem.labels.selecionarArquivoGaleria') }}</div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section>
            <div class="q-gutter-md">
              <!-- Filtros e busca -->
              <div class="row q-col-gutter-sm">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="galeriaSearchParam"
                    :placeholder="$t('galeria.search')"
                    outlined
                    dense
                    @keyup.enter="buscarArquivosGaleria(true)"
                  >
                    <template v-slot:append>
                      <q-icon name="search" />
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="galeriaFileTypeFilter"
                    :options="galeriaFileTypeOptions"
                    :label="$t('galeria.filterByType')"
                    outlined
                    dense
                    clearable
                    @update:model-value="buscarArquivosGaleria(true)"
                  />
                </div>
              </div>

              <!-- Lista de arquivos da galeria -->
              <div class="galeria-grid" style="max-height: 400px; overflow-y: auto;">
                <q-inner-loading :showing="galeriaLoading" />
                <div v-if="!galeriaLoading && arquivosGaleria.length === 0" class="text-center q-pa-md text-grey-7">
                  {{ $t('galeria.noFiles') }}
                </div>
                <div v-else class="row q-col-gutter-sm">
                  <div
                    v-for="arquivo in arquivosGaleria"
                    :key="arquivo.id"
                    class="col-6 col-md-3"
                  >
                    <q-card
                      :class="{ 'galeria-item-selected': arquivoSelecionadoGaleria?.id === arquivo.id }"
                      class="cursor-pointer galeria-item"
                      @click="selecionarArquivoGaleria(arquivo)"
                    >
                      <q-card-section class="q-pa-xs">
                        <div v-if="arquivo.fileType === 'image'" class="galeria-thumbnail">
                          <q-img
                            :src="arquivo.mediaUrl"
                            :alt="arquivo.originalName"
                            style="height: 100px; width: 100%"
                            fit="cover"
                          />
                        </div>
                        <div v-else class="galeria-thumbnail text-center q-pa-md">
                          <q-icon
                            :name="getFileTypeIcon(arquivo.fileType)"
                            size="48px"
                            :color="getFileTypeColor(arquivo.fileType)"
                          />
                        </div>
                        <div class="text-caption text-center q-mt-xs" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                          {{ arquivo.originalName }}
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>

              <!-- Paginação -->
              <div v-if="galeriaHasMore" class="row justify-center q-mt-md">
                <q-btn
                  flat
                  :label="$t('galeria.loadMore')"
                  @click="carregarMaisArquivosGaleria"
                  :loading="galeriaLoading"
                />
              </div>

              <!-- Preview do arquivo selecionado -->
              <div v-if="arquivoSelecionadoGaleria" class="q-mt-md">
                <q-separator class="q-mb-md" />
                <div class="text-subtitle2 q-mb-sm">{{ $t('inputMensagem.labels.arquivoSelecionado') }}</div>
                <div class="row items-center q-gutter-sm">
                  <q-icon
                    :name="getFileTypeIcon(arquivoSelecionadoGaleria.fileType)"
                    size="32px"
                    :color="getFileTypeColor(arquivoSelecionadoGaleria.fileType)"
                  />
                  <div class="col">
                    <div class="text-body2">{{ arquivoSelecionadoGaleria.originalName }}</div>
                    <div class="text-caption text-grey-7">{{ formatFileSize(arquivoSelecionadoGaleria.fileSize) }}</div>
                  </div>
                </div>
              </div>

              <q-input
                v-model="captionGaleria"
                :label="$t('inputMensagem.labels.caption')"
                outlined
                type="textarea"
                autogrow
                class="q-mt-md"
              />

              <div class="q-mt-md">
                <q-toggle 
                  keep-color 
                  v-model="signAttachmentGaleria" 
                  dense 
                  :color="signAttachmentGaleria ? 'positive' : 'black'" 
                  type="toggle"
                >
                  <q-tooltip>
                    {{ signAttachmentGaleria ? $t('inputMensagem.labels.desativarAssinatura') : $t('inputMensagem.labels.ativarAssinatura') }}
                  </q-tooltip>
                </q-toggle>
                <span class="q-ml-sm">{{ $t('inputMensagem.labels.assinatura') }}</span>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              :label="$t('common.cancel')"
              color="negative"
              v-close-popup
              @click="fecharDialogGaleria"
            />
            <q-btn
              :label="$t('common.send')"
              color="primary"
              :disable="!arquivoSelecionadoGaleria || loading"
              @click="enviarArquivoGaleria"
              :loading="loading"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- <template>
        <div>
          <button @click="handleStartRecordingVideo">Start Video Recording</button>
          <button @click="handleStopRecordingVideo" v-if="isRecordingVideo">Stop Video Recording</button>
          <video ref="videoPreview" autoplay></video>
        </div>
      </template> -->

      <q-dialog v-model="dialogVcard" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">{{ $t('inputMensagem.labels.enviarContato') }}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input
              v-model="vcardData.fullName"
              :label="$t('inputMensagem.labels.nomeContato')"
              :rules="[val => !!val || $t('inputMensagem.novo.camposObrigatorios')]"
              outlined
              dense
            />
            <vue-phone-number-input
              v-model="vcardData.phoneNumber"
              :label="$t('inputMensagem.labels.telefoneContato')"
              :default-country-code="'BR'"
              :preferred-countries="['BR', 'US', 'PT', 'ES']"
              :only-countries="[]"
              :enabled-flags="true"
              :enabled-country-code="true"
              :enabled-phone-number="true"
              :valid-color="'#28a745'"
              :error-color="'#dc3545'"
              :input-options="{
                showDialCodeInSelection: true,
                showDialCodeInList: true,
                showFlags: true,
                mode: 'international'
              }"
              @update="onPhoneUpdate"
              class="q-mt-sm"
            />
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat :label="$t('common.cancel')" v-close-popup />
            <q-btn flat :label="$t('common.send')" @click="enviarVcard" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Modal de Envio de Localização -->
      <q-dialog v-model="dialogLocation" persistent>
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">{{ $t('inputMensagem.novo.enviarLocalizacao') }}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input
              v-model="locationData.latitude"
              :label="$t('inputMensagem.novo.latitude')"
              type="number"
              step="any"
              :rules="[val => !!val || $t('inputMensagem.novo.camposObrigatorios')]"
              outlined
              dense
            />
            <q-input
              v-model="locationData.longitude"
              :label="$t('inputMensagem.novo.longitude')"
              type="number"
              step="any"
              :rules="[val => !!val || $t('inputMensagem.novo.camposObrigatorios')]"
              outlined
              dense
              class="q-mt-sm"
            />
            <q-input
              v-model="locationData.name"
              :label="$t('inputMensagem.novo.nomeLocal')"
              outlined
              dense
              class="q-mt-sm"
            />
            <q-input
              v-model="locationData.address"
              :label="$t('inputMensagem.novo.enderecoLocal')"
              outlined
              dense
              class="q-mt-sm"
            />
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat :label="$t('common.cancel')" v-close-popup />
            <q-btn flat :label="$t('common.send')" @click="enviarLocation" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Modal de Envio com Agente Humano -->
      <q-dialog v-model="modalVisivelHumanAgent" position="standard" @hide="fecharModalHumanAgent">
        <q-card :style="{
          minWidth: $q.screen.lt.sm ? '90vw' : '500px',
          maxWidth: $q.screen.lt.sm ? '98vw' : '600px',
          width: $q.screen.lt.sm ? '98vw' : 'auto'
        }">
          <q-card-section class="q-pa-md">
            <div class="text-h6">{{ $t('inputMensagem.labels.enviarAgenteHumano') || 'Enviar com Agente Humano' }}</div>
            <div class="text-caption text-grey-7 q-mt-xs">
              {{ $t('inputMensagem.labels.descricaoAgenteHumano') || 'Esta mensagem será enviada com a tag HUMAN_AGENT, permitindo enviar mensagens mesmo fora da janela de 24 horas (dentro de 7 dias).' }}
            </div>
          </q-card-section>
          <q-card-section class="q-pt-none">
            <q-input
              v-model="mensagemHumanAgent"
              ref="inputEnvioMensagemHumanAgent"
              id="inputEnvioMensagemHumanAgent"
              class="col-grow text-grey-10"
              :label="$t('inputMensagem.labels.mensagem') || 'Mensagem'"
              filled
              outlined
              dense
              type="textarea"
              bg-color="grey-2"
              color="grey-7"
              :placeholder="$t('inputMensagem.labels.digiteMensagem')"
              input-style="max-height: 30vh"
              hide-bottom-space
              autogrow
              @keydown.exact.enter.prevent="() => (mensagemHumanAgent.trim().length ? enviarMensagemHumanAgent() : '')"
            />
          </q-card-section>
          <q-card-actions align="right">
            <q-btn
              :label="$t('common.cancel')"
              color="negative"
              @click="fecharModalHumanAgent"
            />
            <q-btn
              :label="$t('common.send')"
              color="primary"
              :disable="!mensagemHumanAgent.trim() || loading"
              :loading="loading"
              @click="enviarMensagemHumanAgent"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Modal de Manipulação de Grupos -->
      <q-dialog v-model="modalVisivelGrupo" position="standard" @hide="fecharModalGrupo">
        <q-card :style="{
          minWidth: $q.screen.lt.sm ? '90vw' : '600px',
          maxWidth: $q.screen.lt.sm ? '98vw' : '800px',
        }">
          <q-card-section>
            <div class="text-h6">{{ $t('inputMensagem.labels.manipularGrupo') }}</div>
            <div class="text-subtitle2">{{ $t('inputMensagem.labels.grupoSelecionado') }}: {{ ticketFocado?.contact?.name || ticketFocado?.contact?.number }}</div>
          </q-card-section>

          <q-card-section>
            <div class="row q-col-gutter-md">
              <!-- Alterar Título -->
              <div class="col-12">
                <q-toggle
                  v-model="grupoOptions.alterarTitulo"
                  :label="$t('inputMensagem.grupo.alterarTitulo')"
                  dense
                />
                <q-input
                  v-if="grupoOptions.alterarTitulo"
                  v-model="grupoData.novoTitulo"
                  :label="$t('inputMensagem.grupo.novoTitulo')"
                  dense
                  outlined
                  class="q-mt-sm"
                />
              </div>

              <!-- Alterar Descrição -->
              <div class="col-12">
                <q-toggle
                  v-model="grupoOptions.alterarDescricao"
                  :label="$t('inputMensagem.grupo.alterarDescricao')"
                  dense
                />
                <q-input
                  v-if="grupoOptions.alterarDescricao"
                  v-model="grupoData.novaDescricao"
                  :label="$t('inputMensagem.grupo.novaDescricao')"
                  type="textarea"
                  dense
                  outlined
                  class="q-mt-sm"
                />
              </div>

              <!-- Alterar Imagem URL -->
              <div class="col-12">
                <q-toggle
                  v-model="grupoOptions.alterarImagemUrl"
                  :label="$t('inputMensagem.grupo.alterarImagemUrl')"
                  dense
                />
                <q-input
                  v-if="grupoOptions.alterarImagemUrl"
                  v-model="grupoData.novaImagemUrl"
                  :label="$t('inputMensagem.grupo.novaImagemUrl')"
                  dense
                  outlined
                  class="q-mt-sm"
                />
              </div>

              <!-- Alterar Imagem Upload -->
              <div class="col-12">
                <q-toggle
                  v-model="grupoOptions.alterarImagemUpload"
                  :label="$t('inputMensagem.grupo.alterarImagemUpload')"
                  dense
                />
                <q-file
                  v-if="grupoOptions.alterarImagemUpload"
                  v-model="grupoData.novaImagemArquivo"
                  :label="$t('inputMensagem.grupo.novaImagemArquivo')"
                  accept="image/*"
                  dense
                  outlined
                  class="q-mt-sm"
                />
              </div>

              <!-- Alterar Permissão -->
              <div class="col-12">
                <q-toggle
                  v-model="grupoOptions.alterarPermissao"
                  :label="$t('inputMensagem.grupo.alterarPermissao')"
                  dense
                />
                <q-toggle
                  v-if="grupoOptions.alterarPermissao"
                  v-model="grupoData.novaPermissao"
                  :label="$t('inputMensagem.grupo.adminOnly')"
                  color="primary"
                  class="q-mt-sm"
                />
              </div>

              <!-- Listar Participantes -->
              <div class="col-12">
                <q-btn
                  :label="$t('inputMensagem.grupo.listarParticipantes')"
                  @click="listarParticipantesGrupo"
                  color="info"
                  outline
                  :loading="loadingParticipantes"
                />
                <div v-if="participantesGrupo.length > 0" class="q-mt-md">
                  <div class="text-subtitle2">{{ $t('inputMensagem.grupo.participantes') }}:</div>
                  <q-list dense>
                    <q-item v-for="participante in participantesGrupo" :key="participante">
                      <q-item-section>{{ participante }}</q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </div>

              <!-- Gerenciar Usuários -->
              <div class="col-12">
                <div class="text-subtitle2 q-mb-sm">{{ $t('inputMensagem.grupo.gerenciarUsuarios') }}</div>
                
                <!-- Promover a Admin -->
                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <q-toggle
                      v-model="grupoOptions.promoverAdmin"
                      :label="$t('inputMensagem.grupo.promoverAdmin')"
                      dense
                    />
                  </div>
                  <div class="col-6">
                    <q-toggle
                      v-model="grupoOptions.demoverAdmin"
                      :label="$t('inputMensagem.grupo.demoverAdmin')"
                      dense
                    />
                  </div>
                </div>

                <!-- Adicionar/Remover Participantes -->
                <div class="row q-col-gutter-sm q-mt-sm">
                  <div class="col-6">
                    <q-toggle
                      v-model="grupoOptions.adicionarParticipante"
                      :label="$t('inputMensagem.grupo.adicionarParticipante')"
                      dense
                    />
                  </div>
                  <div class="col-6">
                    <q-toggle
                      v-model="grupoOptions.removerParticipante"
                      :label="$t('inputMensagem.grupo.removerParticipante')"
                      dense
                    />
                  </div>
                </div>

                <!-- Input para números dos participantes -->
                <div v-if="grupoOptions.promoverAdmin || grupoOptions.demoverAdmin || grupoOptions.adicionarParticipante || grupoOptions.removerParticipante" class="q-mt-md">
                  <q-input
                    v-model="grupoData.numerosParticipantes"
                    :label="$t('inputMensagem.grupo.numerosParticipantes')"
                    type="textarea"
                    dense
                    outlined
                    hint="Separe os números por vírgula"
                  />
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              :label="$t('common.cancel')"
              color="negative"
              @click="fecharModalGrupo"
            />
            <q-btn
              :label="$t('inputMensagem.grupo.executar')"
              color="primary"
              @click="executarAcoesGrupo"
              :loading="loadingGrupo"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Modal de Mensagens Rápidas - Abre automaticamente com tecla / -->
      <div 
        v-if="!isScheduleDate && (textChat.startsWith('/') || visualizarMensagensRapidas)"
        class="quick-messages-overlay"
        :style="{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 9998,
          pointerEvents: visualizarMensagensRapidas ? 'auto' : 'none',
          backgroundColor: $q.dark.isActive ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)'
        }"
        @click="visualizarMensagensRapidas = false; textChat = textChat.replace(/^\/.*$/, '')"
      >
        <div 
          class="quick-messages-modal"
          :class="{ 'q-dark': $q.dark.isActive }"
          style="position: absolute; bottom: 80px; left: 50%; transform: translateX(-50%); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-height: 400px; overflow-y: auto; pointer-events: auto; min-width: 200px;"
          @click.stop
        >
          <q-list class="no-shadow no-box-shadow" separator>
            <q-item v-for="(resposta, index) in cMensagensRapidas" :key="`${resposta.key}-${resposta.userId || index}`" clickable @click="mensagemRapidaSelecionada(resposta)">
              <q-item-section>
                <q-item-label caption lines="2" class="text-bold">
                  {{ resposta.key }}
                </q-item-label>
                <q-item-label caption lines="2">
                  {{ resposta.message }}
                </q-item-label>
                <q-item-label caption lines="2">
                  {{ $t('inputMensagem.labels.arquivo') + (resposta.media ? resposta.media : $t('inputMensagem.labels.semMidia')) }}
                </q-item-label>
                <q-item-label caption lines="2">
                  {{ $t('inputMensagem.labels.voz') + (resposta.voice === 'enabled' ? $t('inputMensagem.labels.sim') : $t('inputMensagem.labels.nao')) }}
                </q-item-label>
                <q-item-label caption lines="2">
                  User ID: {{ resposta.userId }} 
                </q-item-label>
              </q-item-section>
              <q-tooltip>
                {{ resposta.message }}
              </q-tooltip>
            </q-item>
          </q-list>
        </div>
      </div>

    </div>

  </div>
</template>

<script>
import MicRecorder from 'mic-recorder-to-mp3'
const usuario = JSON.parse(localStorage.getItem('usuario'))
const Mp3Recorder = new MicRecorder({ bitRate: 128 })
import { LocalStorage, uid } from 'quasar'
import mixinCommon from './mixinCommon.js'
import { EnviarMensagemTexto, EditarMensagemText } from 'src/service/tickets.js'
import { SendTypingIndicator, SendRecordingIndicator, SendPausedIndicator } from 'src/service/tickets.js'
import { VEmojiPicker } from 'src/components/VEmojiPicker.js'
import { mapGetters } from 'vuex'
import RecordingTimer from './RecordingTimer.vue'
import { add, format } from 'date-fns'
import eventBus from 'src/utils/eventBus.js'
import { defineComponent } from 'vue'
import { BuscarConfiguracao } from 'src/service/configuracoes.js'
import { SendGhostMessage, SendMentionMessage, SendMentionAllMessage, ListParticipants, NoRedis, EnviarBotao, EnviarVcard, EnviarLocalizacao } from 'src/service/tickets.js'
import { ListarGrupo, ListarParticipantes, MudarDescricao, MudarTitulo, MudarFotoUrl, MudarFotoArquivo, MudarPermissao, PromoverUsuario, DemoverUsuario, AdicionarUsuario, RemoverUsuario } from 'src/service/grupo.js'
import { Texto } from 'src/service/massa.js'
import { EnviarStickerWaba, EnviarTextoWaba, EnviarArquivoWaba, EnviarBotaoWaba, EnviarArquivoUrlWaba, BuscarTemplates, EnviarTemplateComponenteWaba, EnviarTemplateMarketingComponenteWaba, EnviarListaWaba, EnviarCTAURLWaba, EnviarFlowWaba, EnviarReplyButtonsWaba, EnviarAddressWaba, EnviarLocationRequestWaba, EnviarLocationWaba } from 'src/service/waba.js'
import { EnviarTextoInstagram, EnviarArquivoInstagram, EnviarStickerInstagram, EnviarArquivoUrlInstagram, EnviarHumanAgentInstagram } from 'src/service/instagram.js'
import { EnviarTextoMessenger, EnviarArquivoMessenger, EnviarStickerMessenger, EnviarArquivoUrlMessenger, EnviarHumanAgentMessenger, BuscarTemplatesMessenger, EnviarTemplateMarketingMessenger, EnviarTemplateUtilityMessenger } from 'src/service/messenger.js'
import { EnviarMensagemHub, ListarTemplate, EnviarTemplate } from 'src/service/hub.js'
import { EnviarMensagemMeow } from 'src/service/meow.js'
import { EnviarMensagemEvo } from 'src/service/evo.js'
import { EnviarMensagemZapi } from 'src/service/zapi.js'
import { EnviarMensagemUazapi } from 'src/service/uazapi.js'
import { EnviarMensagemWebChat } from 'src/service/webchat.js'
import { ListarTenantPorId } from 'src/service/tenants.js'
import { ListarGaleria } from 'src/service/galeria.js'
import lamejs from '@breezystack/lamejs';
import VuePhoneNumberInput from 'src/components/PhoneNumberInput.js'

export default defineComponent({
  name: 'InputMensagem',
  mixins: [mixinCommon],
  props: {
    replyingMessage: {
      type: Object,
      default: null,
    },
    isScheduleDate: {
      type: Boolean,
      default: false,
    },
    useExternalSchedule: {
      type: Boolean,
      default: false,
    },
    externalScheduleDate: {
      type: String,
      default: null,
    },
    mensagens: {
      type: Array,
      default: () => [],
    },
    mensagensRapidas: {
      type: Array,
      default: () => [],
    },
    editMessage: {
      type: Object,
      default: null,
    },
  },
  components: {
    VEmojiPicker,
    RecordingTimer,
    VuePhoneNumberInput,
  },
  data() {
    return {
      chatgptAtivo: 'disabled',
      mostrarMenuReescrita: false,
      reescrevendoTexto: false,
      textoOriginalBackup: '',
      textoAlteradoPorReescrita: false,
      wavesurfer: null,
      recorder: null,
      hasRecording: false,
      isPlaying: false,
      recordingTime: '00:00',
      modalGravacaoVideoVisivel: false,
      isRecordingVideo: false,
      isCancelled: false,
      mediaRecorder: null,
      audioChunks: [],
      videoChunks: [],
      // forbiddenWords: ['palavra 1', 'palavra 2'],
      schedule: {
        selected: { label: this.$t('atendimentoInputScript.customSchedule'), value: 'custom', func: null },
        options: [
          { label: this.$t('atendimentoInputScript.customSchedule'), value: 'custom', func: null },
          { label: this.$t('atendimentoInputScript.in30Minutes'), value: '30_mins', func: () => add(new Date(), { minutes: 30 }) },
          { label: this.$t('atendimentoInputScript.tomorrow'), value: 'tomorrow', func: () => add(new Date(), { days: 1 }) },
          { label: this.$t('atendimentoInputScript.nextWeeks'), value: 'next_week', func: () => add(new Date(), { weeks: 1 }) },
        ],
      },
      modalVisivelTemplate: false,
      templates: [],
      cacheStatus: {
        ultimaAtualizacao: null,
        tempoRestante: 0,
        usandoCache: false
      },
      selectedTemplate: null, // Mantém o objeto { label, value } selecionado no q-select
      selectedTemplateComponents: [], // Mantém para os inputs das variáveis/parâmetros
      modalVisivelTemplateMessenger: false,
      templatesMessenger: [],
      selectedTemplateMessenger: null,
      selectedTemplateCategoryMessenger: 'MARKETING', // MARKETING ou UTILITY
      // --- NOVAS VARIÁVEIS PARA O PREVIEW DETALHADO ---
      previewData: {
          headerType: null,
          headerText: '',
          headerFormat: null, // IMAGE, VIDEO, DOCUMENT, TEXT
          headerSourceInfo: '', // Nome do arquivo ou texto do header
          bodyText: '',
          footerText: '',
          buttonType: 'NONE', // NONE, QUICK_REPLY, CALL_TO_ACTION
          buttons: [], // Array com detalhes dos botões para o preview
      },
      // mensagemPreview: '',
      usuario,
      semRedis: 'disabled',
      pluginAudio: 'disabled',
      janelaConversa: 'disabled',
      gptEnabled: false,
      loading: false,
      accept: '.mkv, .ofx, .cdr, .key, .ai, .eps, .csv, .rar, .kml, .psd, .txt, .xml, .jpg, .png, .pdf, .doc, .docx, .mp4, .xls, .xlsx, .jpeg, .zip, .ppt, .ogg, .mp3, .pptx, image/*, .mpeg, .pfx, .p2k',
      abrirFilePicker: false,
      abrirModalPreviewImagem: false,
      isRecordingAudio: false,
      urlMediaPreview: {
        title: '',
        src: '',
      },
      visualizarMensagensRapidas: false,
      arquivos: [],
      textChat: '',
      sign: true,
      scheduleDate: null,
      modalVisivel: false,
      modalVisivelUsuario: false,
      modalVisivelBotao: false,
      modalVisivelLista: false,
      modalVisivelHumanAgent: false,
      mensagemHumanAgent: '',
      // ===== NOVOS MODAIS PARA NOVOS TIPOS DE MENSAGEM =====
      modalVisivelCTAURL: false,
      modalVisivelFlow: false,
      modalVisivelReplyButtons: false,
      modalVisivelAddress: false,
      modalVisivelLocationRequest: false,
      modalVisivelLocation: false,
      // ===== FIM DOS NOVOS MODAIS =====
      mensagemMarcacaoFantasma: '',
      mensagemMarcacaoUsuario: '',
      mensagemBotao: '',
      mensagemLista: '',
      botao1: '',
      botao2: '',
      botao3: '',
      header: '',
      footer: '',
      sectionTitle: '',
      rowTitle1: '',
      rowDescription1: '',
      rowTitle2: '',
      rowDescription2: '',
      rowTitle3: '',
      rowDescription3: '',
      rowTitle4: '',
      rowDescription4: '',
      rowTitle5: '',
      rowDescription5: '',
      button_text: '',
      // sections: [],
      // ===== NOVAS VARIÁVEIS PARA NOVOS TIPOS DE MENSAGEM =====
      // CTA URL
      mensagemCTAURL: '',
      buttonTextCTAURL: '',
      buttonURLCTAURL: '',
      headerCTAURL: '',
      footerCTAURL: '',
      headerTypeCTAURL: 'text',
      headerTextCTAURL: '',
      headerLinkCTAURL: '',
      // Flow
      mensagemFlow: '',
      headerFlow: '',
      footerFlow: '',
      flowId: '',
      flowName: '',
      flowCta: '',
      flowToken: '',
      flowAction: 'navigate',
      flowActionPayload: '',
      headerTypeFlow: 'text',
      headerTextFlow: '',
      headerLinkFlow: '',
      // Reply Buttons
      mensagemReplyButtons: '',
      headerReplyButtons: '',
      footerReplyButtons: '',
      buttonsReplyButtons: [{ id: '1', title: '' }, { id: '2', title: '' }, { id: '3', title: '' }],
      headerTypeReplyButtons: 'text',
      headerTextReplyButtons: '',
      headerLinkReplyButtons: '',
      // Address
      street1: '',
      street2: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      addressType: 'HOME',
      // Location Request
      mensagemLocationRequest: '',
      // Location
      latitude: '',
      longitude: '',
      locationName: '',
      locationAddress: '',
      // ===== FIM DAS NOVAS VARIÁVEIS =====
      participantes: '',
      participantsInput: '',
      selectedParticipants: [],
      participantsList: [],
      assinaturaAtiva: null,
      userProfile: 'user',
      mensagemRapidaMedia: '',
      mensagemRapidaSetada: false,
      mensagemRapidaVoz: '',
      modalVisivelTemplate: false,
      modalVisivelTemplateHub: false,
      templateSelecionado: null, // template selecionado atualmente
      templatesHub: [],
      selectedTemplateHub: null,
      selectedTemplateComponentsHub: [],
      sticker: false,
      removeMedia: false,
      openWindow: false,
      dialogAnexo: false,
      arquivoAnexo: null,
      captionAnexo: '',
      previewUrl: null,
      isImage: false,
      isVideo: false,
      isPdf: false,
      dialogVcard: false,
      vcardData: {
        fullName: '',
        phoneNumber: '',
      },
      formatInternational: '',
      dialogLocation: false,
      locationData: {
        latitude: '',
        longitude: '',
        name: '',
        address: '',
      },
      signMention: true, // Nova variável para controlar assinatura no modal de marcação
      signGhost: true, // Nova variável para controlar assinatura no modal de marcação fantasma
      signAttachment: true, // Nova variável para controlar assinatura no modal de anexo
      signButtons: true, // Nova variável para controlar assinatura no modal de botões
      dialogGaleria: false,
      arquivosGaleria: [],
      arquivoSelecionadoGaleria: null,
      captionGaleria: '',
      galeriaSearchParam: '',
      galeriaFileTypeFilter: null,
      galeriaPage: 1,
      galeriaHasMore: false,
      galeriaLoading: false,
      signAttachmentGaleria: true, // Variável para controlar assinatura no envio da galeria
      signLists: true, // Nova variável para controlar assinatura no modal de listas
      // ===== NOVAS VARIÁVEIS DE ASSINATURA PARA NOVOS TIPOS =====
      signCTAURL: true, // Assinatura para CTA URL
      signFlow: true, // Assinatura para Flow
      signReplyButtons: true, // Assinatura para Reply Buttons
      signAddress: true, // Assinatura para Address
      signLocationRequest: true, // Assinatura para Location Request
      signLocation: true, // Assinatura para Location
      // ===== FIM DAS NOVAS VARIÁVEIS DE ASSINATURA =====
      // Sistema de gerenciamento de memória
      timers: [],
      eventListeners: [],
      rootListeners: [],
      // Sistema de typing indicator
      typingTimer: null,
      isTyping: false,
      lastTypingTime: 0,
      typingTicketId: null, // Rastreia qual ticket está enviando typing
      typingSupported: null,
      // Sistema de recording indicator
      isRecording: false,
      lastRecordingTime: 0,
      // ===== MODAL DE MANIPULAÇÃO DE GRUPOS =====
      modalVisivelGrupo: false,
      grupoOptions: {
        alterarTitulo: false,
        alterarDescricao: false,
        alterarImagemUrl: false,
        alterarImagemUpload: false,
        alterarPermissao: false,
        promoverAdmin: false,
        demoverAdmin: false,
        adicionarParticipante: false,
        removerParticipante: false
      },
      grupoData: {
        novoTitulo: '',
        novaDescricao: '',
        novaImagemUrl: '',
        novaImagemArquivo: null,
        novaPermissao: false,
        numerosParticipantes: ''
      },
      participantesGrupo: [],
      loadingParticipantes: false,
      loadingGrupo: false,
      // ===== FIM DO MODAL DE GRUPOS =====
    }
  },
  computed: {
    ...mapGetters(['ticketFocado']),
    cMostrarEnvioArquivo() {
      return this.arquivos.length > 0
    },
    // Parte de data (YYYY-MM-DD)
    scheduleDateDate: {
      get () {
        try {
          const s = String(this.scheduleDate || '')
          const [d] = s.split(' ')
          return d || ''
        } catch (_) { return '' }
      },
      set (val) {
        const date = String(val || '')
        const time = this.scheduleDateTime || '00:00'
        if (date) this.scheduleDate = `${date} ${time}`
      }
    },
    // Parte de hora (HH:mm)
    scheduleDateTime: {
      get () {
        try {
          const s = String(this.scheduleDate || '')
          const parts = s.split(' ')
          return parts[1] ? parts[1].slice(0,5) : '00:00'
        } catch (_) { return '00:00' }
      },
      set (val) {
        const time = String(val || '00:00').slice(0,5)
        const date = this.scheduleDateDate || ''
        if (date) this.scheduleDate = `${date} ${time}`
      }
    },
    cDisableActions() {
      return this.isRecordingAudio || this.ticketFocado.status !== 'open'
    },
    cMensagensRapidas() {
      let search = this.textChat?.toLowerCase()
      if (search && search.trim().startsWith('/')) {
        search = search.replace('/', '')
      }
      return !search ? this.mensagensRapidas : this.mensagensRapidas.filter((r) => r.key.toLowerCase().indexOf(search) !== -1)
      // return this.mensagensRapidas
    },
    desabilitarInputWebchat() {
      if (this.ticketFocado.channel === 'webchat') {
        return true;
      }
      return true;
    },
    desabilitarInput() {
      if (this.ticketFocado.channel !== 'waba' && !this.ticketFocado.channel.includes('hub') && this.ticketFocado.channel !== 'webmail' && this.ticketFocado.channel !== 'instagram' && this.ticketFocado.channel !== 'messenger' ) {
        return false;
      }
      else if(this.ticketFocado.channel === 'webmail') {
        return true;
      }
      else if (this.ticketFocado.channel === 'hub_email') {
        return true;
      }
      const agora = new Date();
      const ultimaMensagem = new Date(Number(this.ticketFocado.lastMessageReceived));
      const diferencaEmHoras = (agora.getTime() - ultimaMensagem.getTime()) / (1000 * 60 * 60);
      this.openWindow = diferencaEmHoras > 24;
      return diferencaEmHoras > 24
      // const diferenca = diferencaEmHoras > 24
      //return !diferenca && !this.ticketFocado.answered;
    },
    mostrarBotaoHumanAgent() {
      // Só mostra se for Instagram ou Messenger, input desabilitado e última mensagem dentro de 7 dias
      if ((this.ticketFocado.channel !== 'instagram' && this.ticketFocado.channel !== 'messenger') || !this.desabilitarInput) {
        return false;
      }
      if (!this.ticketFocado.lastMessageReceived) {
        return false;
      }
      const agora = new Date();
      const ultimaMensagem = new Date(Number(this.ticketFocado.lastMessageReceived));
      const diferencaEmDias = (agora.getTime() - ultimaMensagem.getTime()) / (1000 * 60 * 60 * 24);
      return diferencaEmDias <= 7;
    },
    galeriaFileTypeOptions() {
      return [
        { label: this.$t('galeria.types.image'), value: 'image' },
        { label: this.$t('galeria.types.pdf'), value: 'pdf' },
        { label: this.$t('galeria.types.video'), value: 'video' },
        { label: this.$t('galeria.types.audio'), value: 'audio' },
        { label: this.$t('galeria.types.document'), value: 'document' },
        { label: this.$t('galeria.types.archive'), value: 'archive' },
        { label: this.$t('galeria.types.other'), value: 'other' }
      ];
    },
    // --- NOVAS COMPUTED PROPERTIES PARA O PREVIEW ---
    previewHeaderContent() {
      // Retorna o texto do header ou o nome do arquivo/formato
      if (!this.previewData?.headerText) {
        return this.previewData.headerSourceInfo || '';
      }

      let previewText = this.previewData.headerText;
      // Escapa HTML básico
      previewText = previewText.replace(/</g, "&lt;").replace(/>/g, "&gt;");

      // Detecta variáveis {{n}} no texto original do header
      const regex = /\{\{(\d+)\}\}/g;
      const headerVariables = [...new Set([...previewText.matchAll(regex)].map(match => match[1]))];

      // Substitui cada variável pelo valor do input correspondente
      headerVariables.forEach(varNum => {
        // Encontra o input correspondente pela chave - usa 'header_variable_' para variáveis do header
        const inputComp = this.selectedTemplateComponents.find(comp => comp.key === `header_variable_${varNum}`);
        const currentValue = inputComp?.value; // Pega o valor atual

        const placeholderRegex = new RegExp(`\\{\\{${varNum}\\}\\}`, 'g');
        let replacement = '';
         if (currentValue) {
           replacement = `<span class="preview-variable">${currentValue.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>`;
        } else {
           replacement = `<span class="preview-variable-missing">{{${varNum}}}</span>`;
        }
        previewText = previewText.replace(placeholderRegex, replacement);
      });

      return previewText.replace(/\n/g, '<br>');
    },
    shouldMaximizeBubbleWidth() {
      // Retorna true se o header do template selecionado for mídia
      return ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(this.previewData?.headerFormat);
    },
    previewBodyContent() {
      // Processa o texto do corpo e usa v-html no template
      if (!this.previewData?.bodyText) {
        return '';
      }

      let previewText = this.previewData.bodyText;
      // Escapa HTML básico
      previewText = previewText.replace(/</g, "&lt;").replace(/>/g, "&gt;");

      // Detecta variáveis {{n}} no texto original do corpo
      const regex = /\{\{(\d+)\}\}/g;
      const bodyVariables = [...new Set([...previewText.matchAll(regex)].map(match => match[1]))];

      // Substitui cada variável pelo valor do input correspondente
      bodyVariables.forEach(varNum => {
        // Encontra o input correspondente pela chave - CORRIGIDO: usa 'variable_' em vez de 'body_variable_'
        const inputComp = this.selectedTemplateComponents.find(comp => comp.key === `variable_${varNum}`);
        const currentValue = inputComp?.value; // Pega o valor atual

        const placeholderRegex = new RegExp(`\\{\\{${varNum}\\}\\}`, 'g');
        let replacement = '';
         if (currentValue) {
           replacement = `<span class="preview-variable">${currentValue.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>`;
        } else {
           replacement = `<span class="preview-variable-missing">{{${varNum}}}</span>`;
        }
        previewText = previewText.replace(placeholderRegex, replacement);
      });

      // --- Processa outras variáveis (Ex: botão URL) ---
      // Encontra o input da variável da URL do botão, se existir
      const buttonUrlVarInput = this.selectedTemplateComponents.find(comp => comp.key.startsWith('button_url_var_'));
      const buttonUrlVarValue = buttonUrlVarInput?.value;

      // Substitui {{1}} na *previewData.buttons* (se necessário mostrar no preview)
      // Esta parte afeta os dados usados para renderizar os botões,
      // não diretamente o previewBodyContent, a menos que você exiba a URL do botão no corpo.
      // Se você só precisa do valor para enviar, esta parte do preview pode não ser necessária.
      // Exemplo (se quisesse modificar a URL do botão no objeto de preview):
      // this.previewData.buttons = this.previewData.buttons.map(btn => {
      //    if (btn.type === 'URL' && btn.urlOriginal && btn.urlOriginal.includes('{{1}}')) { // Assume que você guardou a url original
      //       return {
      //           ...btn,
      //           value: btn.urlOriginal.replace('{{1}}', buttonUrlVarValue || '{{1}}') // Atualiza o 'value' ou 'url' no objeto do botão
      //       };
      //    }
      //    return btn;
      // });


      return previewText.replace(/\n/g, '<br>');
    },
    previewFooterContent() {
        return this.previewData.footerText;
    },
    previewButtonType() {
        return this.previewData.buttonType;
    },
    previewQuickReplyButtons() {
        return this.previewData.buttonType === 'QUICK_REPLY' ? this.previewData.buttons : [];
    },
    previewActionButtons() {
        return this.previewData.buttonType === 'CALL_TO_ACTION' ? this.previewData.buttons : [];
    },
    previewFlowButtons() {
        return this.previewData.buttonType === 'FLOW' ? this.previewData.buttons : [];
    },
    previewCatalogButtons() {
        return this.previewData.buttonType === 'CATALOG' ? this.previewData.buttons : [];
    },
    // --- FIM DAS NOVAS COMPUTED PROPERTIES ---
    mensagemPreview: {
      get() {
        if (!this.templateSelecionado) return '';

        let mensagem = '';

        // Encontra o componente BODY para obter o texto original
        const bodyComponent = this.templateSelecionado.components.find(c => c.type === 'BODY');
        if (bodyComponent && bodyComponent.text) {
          mensagem = bodyComponent.text;

          // Substitui as variáveis pelos valores digitados
          this.selectedTemplateComponents.forEach(input => {
            if (
                (!input.value || !input.value.includes('header_')) &&
                (!input.label || !input.label.includes('URL Header'))
            ) {
              const valor = input.value || `{{${input.label}}}`;
              mensagem = mensagem.replace(/{{\d+}}/, valor);
            }   
          });
        }

        // Remove espaços e quebras de linha no início e no final da mensagem
        mensagem = mensagem.trim();

        return mensagem;
      },
      set(value) {
        // O setter é necessário apenas para evitar o aviso do Vue
        // Não precisamos fazer nada aqui pois o valor é calculado
      }
    },
    // Validação específica para canal WABA
    isWabaChannel() {
      return this.ticketFocado?.channel === 'waba'
    },
    isInstagramChannel() {
      return this.ticketFocado?.channel === 'instagram' || this.ticketFocado?.channel === 'hub_instagram'
    },
    isMessengerChannel() {
      return this.ticketFocado?.channel === 'messenger' || this.ticketFocado?.channel === 'hub_facebook'
    },
    // Desabilita todos os botões e inputs de envio quando for waba no modal de agendamento
    desabilitarEnvioWabaAgendamento() {
      return this.isScheduleDate && (this.ticketFocado?.channel === 'waba' || this.ticketFocado?.channel === 'instagram' || this.ticketFocado?.channel === 'messenger')
    },
    // Tipos aceitos para WABA conforme especificação oficial
    acceptWaba() {
      // Audio: .aac, .amr, .mp3, .m4a, .ogg
      // Document: .txt, .xls, .xlsx, .doc, .docx, .ppt, .pptx, .pdf
      // Image: .jpeg, .png
      // Sticker: .webp
      // Video: .3gp, .mp4
      return '.aac,.amr,.mp3,.m4a,.ogg,.txt,.xls,.xlsx,.doc,.docx,.ppt,.pptx,.pdf,.jpeg,.png,.webp,.3gp,.mp4'
    },
    // Tipos aceitos para Instagram conforme especificação oficial
    acceptInstagram() {
      // Audio: .aac, .m4a, .wav, .mp4 (máx 25MB)
      // Image: .png, .jpeg (máx 8MB)
      // Video: .mp4, .ogg, .avi, .mov, .webm (máx 25MB)
      return '.aac,.m4a,.wav,.mp4,.png,.jpeg,.jpg,.ogg,.avi,.mov,.webm'
    },
    // Tipos aceitos para Messenger conforme especificação oficial
    // Referência: https://developers.facebook.com/docs/messenger-platform/reference/attachment-upload-api
    acceptMessenger() {
      // Image: .png, .jpeg (máx 8MB após encoding)
      // Video: .mp4 (máx 25MB após encoding, timeout 75s)
      // Audio: .mp3, .aac, .m4a, .wav (máx 25MB após encoding, timeout 10s)
      // File: qualquer tipo (máx 25MB após encoding, timeout 10s)
      return '.png,.jpeg,.jpg,.mp4,.mp3,.aac,.m4a,.wav,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt'
    },
    // Accept computado - retorna WABA se for canal WABA, Instagram se for Instagram, Messenger se for Messenger, senão retorna o padrão
    acceptComputed() {
      if (this.isWabaChannel) {
        return this.acceptWaba
      }
      if (this.isInstagramChannel) {
        return this.acceptInstagram
      }
      if (this.isMessengerChannel) {
        return this.acceptMessenger
      }
      return this.accept
    },
    // Tamanho máximo por arquivo - para WABA, o limite padrão do q-file será ajustado via validação customizada
    maxFileSizeComputed() {
      // Para WABA, mantemos um limite alto no q-file e validamos individualmente por tipo
      // Para outros canais, mantém o padrão
      return 2147483648 // 2GB - validaremos individualmente para WABA
    },
    maxTotalSizeComputed() {
      return 2147483648 // 2GB - validaremos individualmente para WABA
    }
  },
  methods: {
    formatDateDMY (val) {
      if (!val) return ''
      try {
        const [y,m,d] = String(val).split('-')
        if (y && m && d) return `${d.padStart(2,'0')}/${m.padStart(2,'0')}/${y}`
        const dt = new Date(val)
        if (!isNaN(dt)) {
          const dd = String(dt.getDate()).padStart(2,'0')
          const mm = String(dt.getMonth()+1).padStart(2,'0')
          const yy = String(dt.getFullYear())
          return `${dd}/${mm}/${yy}`
        }
        return String(val)
      } catch (_) { return String(val) }
    },
    toggleMenuReescrita() {
      this.mostrarMenuReescrita = !this.mostrarMenuReescrita;
    },
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
      this.rootListeners.forEach(({ event, handler }) => {
        eventBus.off(event, handler);
      });
      this.rootListeners = [];
      
      // Limpa o typing timer
      if (this.typingTimer) {
        clearTimeout(this.typingTimer);
        this.typingTimer = null;
      }
      this.isTyping = false;
    },
    async reescreverTexto(estilo) {
      if (!this.textChat.trim()) {
        this.$q.notify({
          type: 'warning',
          message: this.$t('rewriteIa.warning1'),
          position: 'top'
        });
        return;
      }

      if (!this.ticketFocado.whatsapp.chatgptApiKey){
        this.$q.notify({
          type: 'negative',
          message: this.$t('rewriteIa.warning2'),
          position: 'top'
        });
        return
      }
      
      this.textoOriginalBackup = this.textChat;
      this.reescrevendoTexto = true;
      
      try {
        // Chamada para API de IA (OpenAI)
        const textoReescrito = await this.chamarAPIReescrita(this.textChat, estilo);
        
        // Atualiza o input com o texto reescrito
        this.textoAlteradoPorReescrita = true;
        this.textChat = textoReescrito;
        
        // Notificação de sucesso
        this.$q.notify({
          type: 'positive',
          message: `${this.$t('rewriteIa.warning3')} ${this.getNomeEstilo(estilo)}`,
          position: 'top',
          actions: [
            {
              label: this.$t('rewriteIa.desfazer'),
              color: 'white',
              handler: () => this.desfazerReescrita()
            }
          ]
        });
        
      } catch (error) {
        console.error('Erro ao reescrever texto:', error);
        this.$q.notify({
          type: 'negative',
          message: this.$t('rewriteIa.error1'),
          position: 'top'
        });
      } finally {
        this.reescrevendoTexto = false;
        this.mostrarMenuReescrita = false;
      }
    },
    async chamarAPIReescrita(texto, estilo) {
      try {
        const promptMap = {
          'profissional': this.$t('rewriteIa.systemContent.profissional'), 
          'simpatico': this.$t('rewriteIa.systemContent.simpatico'), 
          'marketing': this.$t('rewriteIa.systemContent.marketing'), 
          'ortografia': this.$t('rewriteIa.systemContent.ortografia')
        };
        //const systemContent = `Reescreva o texto abaixo em tom ${promptMap[estilo]}. Mantenha o conteúdo, apenas ajuste estilo e ortografia. Em casos de tom Simpaticos utilize emojis com moderação e em casos de marketing use negrito e italico em moto whatsapp e emojis.`;
        const systemContent = this.$t('rewriteIa.systemContent', { estilo: promptMap[estilo] });
        
        if (!this.ticketFocado.whatsapp.chatgptApiKey){
          this.$q.notify({
            type: 'negative',
            message: this.$t('rewriteIa.warning2'),
            position: 'top'
          });
          return
        }
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.ticketFocado.whatsapp.chatgptApiKey}`
          },
          body: JSON.stringify({
            model: this.ticketFocado.whatsapp.chatgptModel || 'gpt-3.5-turbo',
            messages: [
              { role: 'system', content: systemContent },
              { role: 'user',  content: texto }
            ]
          })
        });
        console.log('res', res)
        const data = await res.json();
        if (data.choices && data.choices.length > 0) {
          return data.choices[0].message.content.trim();
        } else {
          throw new Error('Resposta inválida da API da OpenAI');
        }
      } catch (error) {
        console.error('Erro ao chamar a API da OpenAI:', error);
        throw error;
      }
    },
    desfazerReescrita() {
      if (this.textoOriginalBackup) {
        this.textChat = this.textoOriginalBackup;
        this.textoOriginalBackup = '';
        this.textoAlteradoPorReescrita = false;
        this.$q.notify({
          type: 'info',
          message: this.$t('rewriteIa.warning4'),
          position: 'top'
        });
      }
    },
    getNomeEstilo(estilo) {
      const nomes = {
        'profissional': this.$t('rewriteIa.pro'),
        'simpatico': this.$t('rewriteIa.simp'),
        'marketing': this.$t('rewriteIa.marketing'),
        'ortografia': this.$t('rewriteIa.ortografia')
      };
      return nomes[estilo] || estilo;
    },
    async checkMicrophonePermission() {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: {
        channelCount: 1,
        sampleRate: 44100,
        sampleSize: 16
      } });
      } catch (error) {
        this.$q.notify({
          message: this.$t("atendimentoInputScript.micPermissionDenied"),
          type: 'negative',
        });
        console.error("Erro: Permissão do microfone negada.", error);
        return
      }
    },
    async startRecording() {
        localStorage.setItem('recording', true);
        try {
          await this.checkMicrophonePermission();

          const stream = await navigator.mediaDevices.getUserMedia({ audio: {
            channelCount: 1,
            sampleRate: 44100,
            sampleSize: 16
          } });

          this.mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

          this.audioChunks = [];
          this.isRecordingAudio = true;

          // Inicia o indicador de recording (gravação de áudio) imediatamente após iniciar a gravação
          if (this.ticketFocado && this.ticketFocado.id) {
            this.startRecordingIndicator('recording');
          }

          this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
              this.audioChunks.push(event.data);
            }
          };

          this.mediaRecorder.onstop = async () => {

            if (this.isCancelled) {
              console.log("Gravação cancelada. Nenhum áudio será processado.");
              this.isCancelled = false;
              return;
            }

            const audioBlob = new Blob(this.audioChunks, { type: "audio/webm" });
            const wavBlob = await this.convertToWav(audioBlob);
            const mp3Blob = await this.convertToMp3(wavBlob);
            
            if(this.ticketFocado.channel === 'waba' || this.ticketFocado.channel === 'instagram') {
              this.uploadAudioWaba(mp3Blob);
            } else {
              this.uploadAudio(mp3Blob);
            }
            localStorage.setItem('recording', false);
            if (this.mediaRecorder && this.mediaRecorder.stream) {
              this.mediaRecorder.stream.getTracks().forEach(track => {
                track.stop();
              });
            }
            this.mediaRecorder = null;
            this.audioChunks = [];
          };

          this.mediaRecorder.start();
        } catch (error) {
          console.error("Erro ao iniciar gravação:", error);
          localStorage.setItem('recording', false);
        }
    },
    stopRecordings() {
      if (this.mediaRecorder && this.isRecordingAudio) {
        this.isRecordingAudio = false;
        localStorage.setItem('recording', false);
        
        // Para o indicador de recording
        this.stopRecordingIndicator();
        
        this.mediaRecorder.stop();
      }
    },
    cancelRecording() {
      if (this.mediaRecorder) {
        this.isCancelled = true;
        this.mediaRecorder.stop();
        this.isRecordingAudio = false;
        localStorage.setItem('recording', false);
        
        // Para o indicador de recording
        this.stopRecordingIndicator();
        
        this.audioChunks = [];
      }
    },
    async uploadAudio(mp3Blob) {
      this.loading = true
      try {
        const formData = new FormData();
        const filename = `${new Date().getTime()}.mp3`;
        formData.append("medias", mp3Blob, filename);
        formData.append("body", filename);
        formData.append("fromMe", true);

        const ticketId = this.ticketFocado.id;

        if (this.isScheduleDate) {
          formData.append('scheduleDate', this.scheduleDate)
        }

        if (this.semRedis === "enabled") {
          if (!this.isScheduleDate && ["whatsapp", "baileys"].includes(this.ticketFocado.channel)) {
            formData.append("whatsappId", this.ticketFocado.whatsappId);
            formData.append("number", this.ticketFocado.contact.number);
            formData.append("whatsappType", this.ticketFocado.channel);
            formData.append("message", null);
            formData.append("file", false);
            formData.append("isSticker", false);
            formData.append("voice", true);
            formData.append("ticket", JSON.stringify(this.ticketFocado));
            formData.append("group", this.ticketFocado.isGroup);
            await NoRedis(formData);
          } else if (this.isScheduleDate && ['whatsapp', 'baileys'].includes(this.ticketFocado.channel)){
            await EnviarMensagemTexto(ticketId, formData)
          } else {
            if (this.ticketFocado.channel.includes("hub")) {
              await EnviarMensagemHub(ticketId, formData);
            } 
            else if (this.ticketFocado.channel.includes("meow")) {
              await EnviarMensagemMeow(ticketId, formData);
            } 
            else if (this.ticketFocado.channel.includes("evo")) {
              await EnviarMensagemEvo(ticketId, formData);
            } 
            else if (this.ticketFocado.channel === "zapi") {
              await EnviarMensagemZapi(ticketId, formData);
            }
            else if (this.ticketFocado.channel === "uazapi") {
              await EnviarMensagemUazapi(ticketId, formData);
            }
            else if (this.ticketFocado.channel.includes("webchat")) {
              await EnviarMensagemWebChat(ticketId, formData);
            }
            else {
              await EnviarMensagemTexto(ticketId, formData);
            }
          }
        } else if (this.semRedis === "disabled") {
          if (this.ticketFocado.channel.includes("hub")) {
            await EnviarMensagemHub(ticketId, formData);
          } 
          else if (this.ticketFocado.channel.includes("meow")) {
            await EnviarMensagemMeow(ticketId, formData);
          } 
          else if (this.ticketFocado.channel.includes("webchat")) {
              await EnviarMensagemWebChat(ticketId, formData);
          }
          else if (this.ticketFocado.channel.includes("evo")) {
            await EnviarMensagemEvo(ticketId, formData);
          } else if (this.ticketFocado.channel === "zapi") {
            await EnviarMensagemZapi(ticketId, formData);
          } else if (this.ticketFocado.channel === "uazapi") {
            await EnviarMensagemUazapi(ticketId, formData);
          } else {
            await EnviarMensagemTexto(ticketId, formData);
          }
        }

        console.log("Áudio enviado com sucesso!");
        this.loading = false
        this.arquivos = []
        this.textChat = ''
        this.$emit('update:replyingMessage', null)
        this.abrirFilePicker = false
        this.abrirModalPreviewImagem = false
        this.isRecordingAudio = false
        localStorage.setItem('recording', false);
        const timerId = setTimeout(() => {
          this.scrollToBottom()
        }, 300)
        this.addTimer(timerId)
      } catch (error) {
        this.isRecordingAudio = false
        localStorage.setItem('recording', false);
        this.loading = false
        console.error("Erro ao enviar áudio:", error);
        this.loading = false
      }
    },
    async uploadAudioWaba(mp3Blob) {
      this.loading = true
      try {
        const formData = new FormData();
        const filename = `${new Date().getTime()}.mp3`;
        formData.append("medias", mp3Blob, filename);
        formData.append("body", filename);
        formData.append("fromMe", true);
        formData.append('idFront', uid())
        formData.append('tokenApi', this.ticketFocado.whatsapp.tokenAPI)
        formData.append('from', this.ticketFocado.contact.number)
        formData.append('ticketId', this.ticketFocado.id)
        if (this.isScheduleDate) {
          formData.append('scheduleDate', this.scheduleDate)
        }
        if(this.ticketFocado.channel === 'waba') {
          await EnviarArquivoWaba(formData)
        } else if(this.ticketFocado.channel === 'instagram') {
          await EnviarArquivoInstagram(formData)
        }
        this.arquivos = []
        this.textChat = ''
        this.$emit('update:replyingMessage', null)
        this.abrirFilePicker = false
        this.abrirModalPreviewImagem = false
        this.isRecordingAudio = false
        localStorage.setItem('recording', false);
        this.loading = false
        const timerId = setTimeout(() => {
          this.scrollToBottom()
        }, 300)
        this.addTimer(timerId)
      } catch (error) {
        this.isRecordingAudio = false
        localStorage.setItem('recording', false);
        this.loading = false
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async convertToWav(blob) {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const numChannels = audioBuffer.numberOfChannels;
      const sampleRate = audioBuffer.sampleRate; 
      const length = audioBuffer.length * numChannels * 2;

      const wavBuffer = new ArrayBuffer(44 + length);
      const view = new DataView(wavBuffer);

      const writeString = (offset, string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      writeString(0, "RIFF");
      view.setUint32(4, 36 + length, true);
      writeString(8, "WAVE");
      writeString(12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * numChannels * 2, true);
      view.setUint16(32, numChannels * 2, true);
      view.setUint16(34, 16, true);
      writeString(36, "data");
      view.setUint32(40, length, true);

      let offset = 44;
      for (let i = 0; i < audioBuffer.length; i++) {
        for (let channel = 0; channel < numChannels; channel++) {
          const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
          view.setInt16(offset, sample * 0x7fff, true);
          offset += 2;
        }
      }

      return new Blob([wavBuffer], { type: "audio/wav" });
    },
    async convertToMp3(wavBlob) {
      const arrayBuffer = await wavBlob.arrayBuffer();
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

      const sampleRate = audioBuffer.sampleRate;
      // const sampleRate = 44100;
      const numChannels = audioBuffer.numberOfChannels;

      let samples = new Float32Array(audioBuffer.length * numChannels);
      let sampleIndex = 0;
      for (let channel = 0; channel < numChannels; channel++) {
        let channelData = audioBuffer.getChannelData(channel);
        for (let i = 0; i < channelData.length; i++) {
          samples[sampleIndex++] = channelData[i];
        }
      }

      let pcmSamples = new Int16Array(samples.length);
      for (let i = 0; i < samples.length; i++) {
        pcmSamples[i] = Math.max(-32768, Math.min(32767, samples[i] * 32768));
      }

      const mp3encoder = new lamejs.Mp3Encoder(numChannels, sampleRate, 128);
      const mp3Data = [];

      for (let i = 0; i < pcmSamples.length; i += 1152) {
        const sampleChunk = pcmSamples.subarray(i, i + 1152);
        const mp3buf = mp3encoder.encodeBuffer(sampleChunk);
        if (mp3buf.length > 0) mp3Data.push(mp3buf);
      }

      const finalChunk = mp3encoder.flush();
      if (finalChunk.length > 0) mp3Data.push(finalChunk);

      return new Blob(mp3Data, { type: "audio/mp3" });
    },
    abrirModalGravacaoVideo() {
        this.modalGravacaoVideoVisivel = true;
    },
    fecharModalGravacaoVideo() {
        this.modalGravacaoVideoVisivel = false;
        if (this.isRecordingVideo) {
            this.handleCancelRecordingVideo();
        }
    },
    async handleStartRecordingVideo() {
      try {
        // Inicia a gravação
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        this.stream = stream; // Armazena o stream para liberar depois
        this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        this.videoChunks = [];

        // Coleta pedaços do vídeo
        this.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.videoChunks.push(event.data);
            }
        };

        // Finaliza a gravação e envia o vídeo
        this.mediaRecorder.onstop = async () => {
            if (this.cancelRecording) {
                // Se o usuário cancelou, não envia o vídeo
                this.cleanupVideoRecording();
                return;
            }

            const videoBlob = new Blob(this.videoChunks, { type: 'video/webm' });
            const formData = new FormData();
            const filename = `${new Date().getTime()}.webm`;
            formData.append('medias', videoBlob, filename);
            formData.append('body', filename);
            formData.append('fromMe', true);

            const ticketId = this.ticketFocado.id;
            if (this.ticketFocado.channel.includes('hub')) {
                await EnviarMensagemHub(ticketId, formData);
            } if (this.ticketFocado.channel.includes('meow')) {
                await EnviarMensagemMeow(ticketId, formData);
            if (this.ticketFocado.channel.includes("webchat")) {
              await EnviarMensagemWebChat(ticketId, formData);
            }
            } if (this.ticketFocado.channel.includes('evo')) {
                await EnviarMensagemEvo(ticketId, formData);
            } else if (this.ticketFocado.channel === "zapi") {
              await EnviarMensagemZapi(ticketId, formData);
            } else if (this.ticketFocado.channel === "uazapi") {
              await EnviarMensagemUazapi(ticketId, formData);
            } else if (!this.ticketFocado.channel.includes('hub') && !this.ticketFocado.channel.includes('meow')) {
                await EnviarMensagemTexto(ticketId, formData);
            }

            // Limpeza e reset do vídeo
            this.cleanupVideoRecording();
        };

        // Inicia a gravação e a visualização
        this.mediaRecorder.start();
        this.isRecordingVideo = true;
        this.$refs.videoPreview.srcObject = stream;
        this.cancelRecording = false; // Reset de estado
      } catch (error) {
        this.isRecordingVideo = false;
        console.error('Error starting video recording:', error);
      }
    },
    async handleStopRecordingVideo() {
      if (this.mediaRecorder) {
        this.mediaRecorder.stop();
        this.isRecordingVideo = false;
      }
    },
    handleCancelRecordingVideo() {
      if (this.mediaRecorder) {
        this.cancelRecording = true;
        this.mediaRecorder.stop();
        this.isRecordingVideo = false;
      }
    },
    cleanupVideoRecording() {
        // Limpeza e reset do vídeo
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        this.$refs.videoPreview.srcObject = null;
        this.videoChunks = [];
        this.stream = null;
        this.mediaRecorder = null;
        this.isRecordingVideo = false;
    },
    async enviarBotao(){
      const message = this.prepararMensagemTexto()
      const data = {
        whatsappId: this.ticketFocado.whatsappId,
        whatsappType: this.ticketFocado.channel,
        number: this.ticketFocado.contact.number,
        message: message, 
        sticker: false, 
        voice: false, 
        ticket: this.ticketFocado,
        group: this.ticketFocado.isGroup
      }
      console.log(data)
      const response = await EnviarBotao(data)
      console.log(response)
    },
    handleFileDrop(event) {
      const files = event.dataTransfer.files;
      if (files.length) {
        this.textChat = '';
        this.arquivos = [files[0]];
        this.abrirModalPreviewImagem = true;
        this.urlMediaPreview = {
          title: this.$t('atendimentoInputScript.previewTitle', { contactName: this.ticketFocado?.contact?.name }),
          src: this.openFilePreviewDD(files[0]),
        };
        this.$refs.inputEnvioMensagem.focus();
      }
    },
    handleDragOver(event) {
      event.preventDefault();
      event.currentTarget.classList.add('dragover');
    },
    handleDragLeave(event) {
      event.currentTarget.classList.remove('dragover');
    },
    openFilePreviewDD(file) {
      const urlImg = window.URL.createObjectURL(file);
      return urlImg;
    },
    abrirModalTemplate() {
      this.modalVisivelTemplate = true;
    },
    abrirModalTemplateHub() {
      this.modalVisivelTemplateHub = true;
    },
    fecharModalTemplate() {
      // Limpa o objeto templateSelecionado
      this.templateSelecionado = null;
      // Caso precise limpar também a mensagemPreview:
      // this.mensagemPreview = '';
      this.modalVisivelTemplate = false;
      this.selectedTemplate = null;
      this.selectedTemplateComponents = [];
    },
    fecharModalTemplateHub() {
      this.modalVisivelTemplateHub = false;
      this.selectedTemplateHub = null;
      this.selectedTemplateComponentsHub = [];
    },
    async buscarTemplateMessenger() {
      // bloquear até validar o endpoint de templates do Messenger
      return;
      try {
        if (!this.ticketFocado?.whatsapp?.id) {
          this.$q.notify({
            type: 'negative',
            message: this.$t('inputMensagem.labels.whatsappNotFound') || 'Canal WhatsApp não encontrado',
            timeout: 3000
          })
          return
        }

        const whatsappId = this.ticketFocado.whatsapp.id
        
        // Verificar cache no localStorage
        const cacheKey = `templates_messenger_cache_${whatsappId}`
        const cachedData = localStorage.getItem(cacheKey)
        
        if (cachedData) {
          const { templates, timestamp } = JSON.parse(cachedData)
          const now = Date.now()
          const fiveMinutes = 5 * 60 * 1000 // 5 minutos
          
          if (now - timestamp < fiveMinutes) {
            this.templatesMessenger = templates
            this.modalVisivelTemplateMessenger = true
            return
          }
        }
        
        // Buscar templates da API
        const response = await BuscarTemplatesMessenger(whatsappId)
        this.templatesMessenger = response.data.data || []
        
        // Salvar no cache
        const cacheData = {
          templates: this.templatesMessenger,
          timestamp: Date.now()
        }
        localStorage.setItem(cacheKey, JSON.stringify(cacheData))
        
        this.modalVisivelTemplateMessenger = true
      } catch (error) {
        console.error('Erro ao buscar templates Messenger:', error)
        this.$q.notify({
          type: 'negative',
          message: error.response?.data?.error || this.$t('inputMensagem.labels.errorLoadingTemplates') || 'Erro ao carregar templates',
          timeout: 5000
        })
      }
    },
    async enviarTemplateMessenger() {
      try {
        if (!this.selectedTemplateMessenger) {
          this.$q.notify({
            type: 'warning',
            message: this.$t('inputMensagem.labels.selectTemplate') || 'Selecione um template',
            timeout: 3000
          })
          return
        }

        if (!this.ticketFocado?.whatsapp?.fbPageId) {
          this.$q.notify({
            type: 'negative',
            message: this.$t('inputMensagem.labels.pageIdNotFound') || 'Page ID não encontrado',
            timeout: 3000
          })
          return
        }

        this.loading = true

        const data = {
          tokenApi: this.ticketFocado.whatsapp.fbPageId,
          from: this.ticketFocado.contact.messengerId || this.ticketFocado.contact.number,
          ticketId: this.ticketFocado.id,
          templateName: this.selectedTemplateCategoryMessenger === 'MARKETING' 
            ? (this.selectedTemplateMessenger.topic_title || 'template_messenger')
            : (typeof this.selectedTemplateMessenger === 'string' ? this.selectedTemplateMessenger : 'template_messenger'),
          components: []
        }

        if (this.selectedTemplateCategoryMessenger === 'MARKETING') {
          // Para templates de marketing, precisamos do notificationMessagesToken
          const notificationMessagesToken = this.selectedTemplateMessenger.notification_messages_token
          
          if (!notificationMessagesToken) {
            this.$q.notify({
              type: 'negative',
              message: this.$t('inputMensagem.labels.tokenNotFound') || 'Token de notificação não encontrado',
              timeout: 3000
            })
            this.loading = false
            return
          }

          data.notificationMessagesToken = notificationMessagesToken
          await EnviarTemplateMarketingMessenger(data)
        } else {
          // Para templates de utility, não precisamos do notificationMessagesToken
          await EnviarTemplateUtilityMessenger(data)
        }

        this.$q.notify({
          type: 'positive',
          message: this.$t('inputMensagem.labels.templateSent') || 'Template enviado com sucesso',
          timeout: 3000
        })

        this.fecharModalTemplateMessenger()
        this.loading = false
      } catch (error) {
        console.error('Erro ao enviar template Messenger:', error)
        this.$q.notify({
          type: 'negative',
          message: error.response?.data?.error || this.$t('inputMensagem.labels.errorSendingTemplate') || 'Erro ao enviar template',
          timeout: 5000
        })
        this.loading = false
      }
    },
    fecharModalTemplateMessenger() {
      this.modalVisivelTemplateMessenger = false
      this.selectedTemplateMessenger = null
      this.selectedTemplateCategoryMessenger = 'MARKETING'
      this.templatesMessenger = []
    },
    getPreviewHeaderMediaUrl() {
      if (!this.previewData || !this.previewData.headerFormat) {
        return ''; 
      }

      if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(this.previewData.headerFormat)) {

        const expectedInputKey = `header_media_${this.previewData.headerFormat.toLowerCase()}`;
        const userInputField = this.selectedTemplateComponents.find(comp => comp.key === expectedInputKey);

        if (userInputField && typeof userInputField.value === 'string' && userInputField.value.trim() !== '') {
          return userInputField.value;
        }

        if (this.previewData.headerSourceInfo) {
          const placeholderRegex = /^\[(IMAGE|VIDEO|DOCUMENT)\]$/; // Regex para placeholders como "[IMAGE]"
          if (this.previewData.headerSourceInfo.startsWith('http') || 
              (this.previewData.headerSourceInfo && !placeholderRegex.test(this.previewData.headerSourceInfo))) {
            return this.previewData.headerSourceInfo;
          }
        }
      }
      
      return ''; 
    },
    handleTemplateSelectionHub(templateWrapper) {
      this.selectedTemplateComponentsHub = [];
      
      const template = templateWrapper.value;

      if (template && template.components) {
        template.components.forEach(component => {
          if (component.type === 'HEADER') {
            if (component.format === 'VIDEO' || component.format === 'IMAGE' || component.format === 'DOCUMENT') {
              this.selectedTemplateComponentsHub.push({
                label: `URL Header (${component.format.toLowerCase()})`,
                value: '',
                key: `header_${component.format.toLowerCase()}`
              });
            } 
          }


          if (component.type === 'BODY') {
            if (template.parameter_format === 'NAMED' && component.example?.body_text_named_params) {
              // return
              // Novo formato NAMED
              component.example.body_text_named_params.forEach(param => {
                this.selectedTemplateComponentsHub.push({
                  label: `Valor da variável ${param.param_name}`,
                  value: '',
                  key: `named_variable_${param.param_name}`
                });
              });
            } else {
              const variableMatches = component.text.match(/{{\d+}}/g);
              if (variableMatches) {
                variableMatches.forEach(variable => {
                  const variableNumber = variable.replace(/{{|}}/g, '');
                  this.selectedTemplateComponentsHub.push({
                    label: `Value ${variableNumber}`,
                    value: '',
                    key: `variable_${variableNumber}`
                  });
                });
              }
            }
          }
        });
      }
    },
    // --- NOVA FUNÇÃO PARA PARSEAR DETALHES DO TEMPLATE PARA O PREVIEW ---
    parseSelectedTemplateForPreview(templateObject) {
      const components = templateObject?.components || [];
      const parsed = {
        headerType: null,
        headerText: '',
        headerFormat: null,
        headerSourceInfo: '', // Para nome do arquivo ou texto
        bodyText: '',
        footerText: '',
        buttonType: 'NONE',
        buttons: [],
      };

      if (!Array.isArray(components)) return parsed;
      // console.log(components)

      // Parse Header
      const header = components.find(c => c.type === 'HEADER');
      if (header) {
        parsed.headerFormat = header.format;
        if (header.format === 'TEXT') {
          parsed.headerType = 'TEXT'; // Simplificado para preview
          parsed.headerText = header.text || '';
          parsed.headerSourceInfo = header.text || '';
        } else if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(header.format)) {
          parsed.headerType = header.format; // Simplificado
          // No preview, não temos o arquivo, usamos o formato como info
          parsed.headerSourceInfo = `[${header.format}]`;
          // Poderíamos tentar pegar um exemplo, se existisse
          // parsed.headerSourceInfo = header.example?.header_handle?.[0] || header.example?.header_url?.[0] || `[${header.format}]`;
        }
      }

      // Parse Body
      const body = components.find(c => c.type === 'BODY');
      if (body) {
        parsed.bodyText = body.text || '';
      }

      // Parse Footer
      const footer = components.find(c => c.type === 'FOOTER');
      if (footer) {
        parsed.footerText = footer.text || '';
      }

      // Parse Buttons
      const buttonsComp = components.find(c => c.type === 'BUTTONS');
      if (buttonsComp && buttonsComp.buttons?.length > 0) {
        const firstButtonType = buttonsComp.buttons[0].type;
        if (firstButtonType === 'QUICK_REPLY') {
          parsed.buttonType = 'QUICK_REPLY';
          parsed.buttons = buttonsComp.buttons.map(b => ({ text: b.text || '' }));
        } else if (firstButtonType === 'PHONE_NUMBER' || firstButtonType === 'URL') {
          parsed.buttonType = 'CALL_TO_ACTION';
          parsed.buttons = buttonsComp.buttons.map(b => ({
            type: b.type, // PHONE_NUMBER ou URL
            text: b.text || ''
          }));
        } else if (firstButtonType === 'FLOW') {
          parsed.buttonType = 'FLOW';
          parsed.buttons = buttonsComp.buttons.map(b => ({
            type: 'button',
            sub_type: 'flow',
            index: b.flow_id?.toString(),
            parameters: []
          }));
        } else if (firstButtonType === 'CATALOG') {
          parsed.buttonType = 'CATALOG';
          parsed.buttons = buttonsComp.buttons.map(b => ({
            type: 'button',
            sub_type: 'catalog',
            index: b.flow_id?.toString(),
            parameters: []
          }));
        }
      }
      // console.log("Preview data parsed:", parsed);
      return parsed;
    },
    // --- MÉTODO handleTemplateSelection MODIFICADO ---
    handleTemplateSelection(templateWrapper) {
      this.selectedTemplateComponents = []; // Limpa inputs de variáveis
      this.previewData = this.parseSelectedTemplateForPreview(null); // Limpa preview
      this.mensagemPreview = ''; // Limpa preview antigo

      if (!templateWrapper || !templateWrapper.value) {
        this.selectedTemplate = null; // Garante que selectedTemplate seja nulo se nada for selecionado
        return;
      }

      const template = templateWrapper.value; // O objeto template real
      this.selectedTemplate = templateWrapper; // Mantém o wrapper para o q-select
      this.previewData = this.parseSelectedTemplateForPreview(template); // Parseia para o novo preview

      // Lógica existente para gerar os INPUTS de variáveis/parâmetros:
      if (template && template.components) {
        template.components.forEach(component => {
          if (component.type === 'HEADER' && ['VIDEO', 'IMAGE', 'DOCUMENT'].includes(component.format)) {
            // Input para URL/Handle do Header
            this.selectedTemplateComponents.push({
              label: `URL/Handle Header (${component.format.toLowerCase()})`, // Label mais claro
              value: '', // Começa vazio
              key: `header_${component.format.toLowerCase()}`
            });
          } else if (component.type === 'HEADER' && component.format === 'TEXT') {
            // Lógica para variáveis numéricas {{n}} no HEADER
            const variableMatches = component.text.match(/{{\d+}}/g);
            if (variableMatches) {
              variableMatches.forEach(variable => {
                const variableNumber = variable.replace(/{{|}}/g, '');
                // Garante que não haja duplicatas pela key
                if (!this.selectedTemplateComponents.some(c => c.key === `header_variable_${variableNumber}`)) {
                  this.selectedTemplateComponents.push({
                    label: `Valor Variável Header {{${variableNumber}}}`,
                    value: '',
                    key: `header_variable_${variableNumber}`
                  });
                }
              });
            }
          } else if (component.type === 'BODY') {
            // Lógica para variáveis numéricas {{n}}
            const variableMatches = component.text.match(/{{\d+}}/g);
            if (variableMatches) {
              variableMatches.forEach(variable => {
                const variableNumber = variable.replace(/{{|}}/g, '');
                // Garante que não haja duplicatas pela key
                if (!this.selectedTemplateComponents.some(c => c.key === `variable_${variableNumber}`)) {
                  this.selectedTemplateComponents.push({
                    label: `Valor Variável {{${variableNumber}}}`,
                    value: '',
                    key: `variable_${variableNumber}`
                  });
                }
              });
            }
            // Lógica para parâmetros nomeados (se aplicável, baseado na sua lógica anterior)
            // Ajuste a condição se necessário
            if (template.parameter_format === 'NAMED' && component.example?.body_text_named_params) {
                  component.example.body_text_named_params.forEach(param => {
                      if (!this.selectedTemplateComponents.some(c => c.key === `named_variable_${param.param_name}`)) {
                          this.selectedTemplateComponents.push({
                              label: `Valor Parâmetro ${param.param_name}`,
                              value: '',
                              key: `named_variable_${param.param_name}`
                          });
                      }
                  });
            }
          } else if (component.type === 'BUTTONS' && component.buttons) {
              // Lógica para parâmetros de botões (ex: URL dinâmica)
              component.buttons.forEach((button, index) => {
                if (button.type === 'URL' && button.url.includes('{{1}}')) { // Exemplo: botão de URL com variável
                      if (!this.selectedTemplateComponents.some(c => c.key === `button_url_${index + 1}`)) {
                          this.selectedTemplateComponents.push({
                              label: `Valor Variável URL Botão ${index + 1}`,
                              value: '',
                              key: `button_url_${index + 1}`
                          });
                      }
                }
                // Adicionar lógica para outros tipos de parâmetros de botão se necessário
              });
          }
        });
      }
      // Trigger manual do update do preview antigo (será removido)
      this.$forceUpdate(); // Força atualização para garantir que computed properties recalculquem
      // A linha abaixo pode ser removida se mensagemPreview não for mais usada
      this.mensagemPreview = this.calcularMensagemPreview();
    },
    // Função para calcular o preview antigo (pode ser removida ou adaptada)
    calcularMensagemPreview() {
        if (!this.selectedTemplate || !this.selectedTemplate.value) return '';
        const bodyComponent = this.selectedTemplate.value.components.find(c => c.type === 'BODY');
        let mensagem = bodyComponent?.text || '';
        this.selectedTemplateComponents.forEach(input => {
          if(input.key.startsWith('variable_')) {
              const variableNumber = input.key.replace('variable_', '');
              mensagem = mensagem.replace(`{{${variableNumber}}}`, input.value || `{{${variableNumber}}}`);
          } else if (input.key.startsWith('named_variable_')) {
              // Lógica para substituir parâmetros nomeados se necessário
          }
          // Adicionar substituição para botões se houver
        });
        return mensagem.trim();
    },
    async enviarTemplateSelecionado() {

      const campoVazio = this.selectedTemplateComponents.some(input =>
        (input.key.startsWith('variable_') || input.key.startsWith('named_variable_')) &&
        (!input.value || input.value.toString().trim() === '')
      );
      if (campoVazio) {
        this.$q.notify({
          type: 'negative',
          message: this.$t('inputMensagem.labels.campoVazio')
        });
        return;
      }

      if (!this.selectedTemplate) {
        return;
      }

      const payload = {
        from: this.ticketFocado.contact.number,
        phone_number_id: this.ticketFocado.whatsapp.tokenAPI,
        ticketId: this.ticketFocado.id,
        idFront: uid(),
        language: this.selectedTemplate.value.language,
        templateName: this.selectedTemplate.value.name,
        components: [],
        read: 1,
        fromMe: true,
        mediaUrl: '',
        body: JSON.stringify(this.selectedTemplate.value.components),
        scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
        quotedMsg: this.replyingMessage,     
        tokenApi: this.ticketFocado.whatsapp.tokenAPI,
        mediaType: 'templates',
        sendType: 'templates',
      };

      this.selectedTemplateComponents.forEach(input => {
        // Verifica se há variáveis do header antes de processar headers simples
        const hasHeaderVariables = this.selectedTemplateComponents.some(comp => 
          comp.key.startsWith('header_variable') && comp.value
        );

        if (input.key.startsWith('header') && !hasHeaderVariables) {
          let format = '';
          if (input.key === 'header_video') format = 'VIDEO';
          if (input.key === 'header_image') format = 'IMAGE';
          if (input.key === 'header_document') format = 'DOCUMENT';
          if (input.key === 'header_text') format = 'TEXT';

          // Só cria o componente se o format for válido
          if (format) {
            payload.components.push({
              type: 'HEADER',
              format: format,
              value: input.value
            });
          }
        } else if (input.key.startsWith('header_variable')) {
          // Processa variáveis do header
          const variableNumber = input.key.replace('header_variable_', '');
          if (!payload.components.some(component => component.type === 'HEADER')) {
            payload.components.push({
              type: 'HEADER',
              format: 'TEXT',
              variables: []
            });
          }
          const headerComponent = payload.components.find(component => component.type === 'HEADER');
          // Garante que o format seja TEXT para variáveis
          headerComponent.format = 'TEXT';
          // Garante que o array tenha o tamanho adequado
          while (headerComponent.variables.length < variableNumber) {
            headerComponent.variables.push('');
          }
          headerComponent.variables[variableNumber - 1] = input.value;
        } else if (input.key.startsWith('variable')) {
          const variableNumber = input.key.replace('variable_', '');
          if (!payload.components.some(component => component.type === 'BODY')) {
            payload.components.push({
              type: 'BODY',
              variables: []
            });
          }
          const bodyComponent = payload.components.find(component => component.type === 'BODY');
          // Garante que o array tenha o tamanho adequado
          while (bodyComponent.variables.length < variableNumber) {
            bodyComponent.variables.push('');
          }
          bodyComponent.variables[variableNumber - 1] = input.value;
        } else if (input.key.startsWith('named_variable')) {
          const variableName = input.key.replace('named_variable_', '');
          const bodyComponent = payload.components.find(c => c.type === 'BODY') || { type: 'BODY', parameters: [] };
          if(variableName === 'nome'){
            bodyComponent.parameters.push({
              type: 'text',
              text: input.value || '',
              name: 'name'
          })
          } if(variableName === 'texto'){
              bodyComponent.parameters.push({
                type: 'text',
                text: input.value || '',
                name: 'text'
            })
          } if(variableName === 'number'){
              bodyComponent.parameters.push({
                type: 'text',
                text: input.value || '',
                name: 'number'
            })
          }

          if (!payload.components.some(c => c.type === 'BODY')) {
              payload.components.push(bodyComponent);
          }
        // } else if (input.key.startsWith('button_')) {
        }  else if (input.key.includes('button_')) {
          // Obtendo o índice do botão
          // const buttonIndex = parseInt(input.key.replace('button_', '')) - 1;
          const buttonIndex = parseInt(input.key.replace('button_url_', '').replace('button_', '')) - 1;

          // Obtendo o tipo do botão dinamicamente do template selecionado
          const selectedButton = this.selectedTemplate.value.components
            .find(c => c.type === 'BUTTONS')?.buttons?.[buttonIndex];

          if (selectedButton) {
            const subType = selectedButton.type === 'COPY_CODE' ? 'copy_code' : 
                          selectedButton.type === 'URL' ? 'url' : 
                          selectedButton.type === 'FLOW' ? 'flow' :
                          selectedButton.type === 'CATALOG' ? 'catalog' : 'quick_reply';

            if (!payload.components.some(c => c.type === 'BUTTONS')) {
              payload.components.push({
                type: 'BUTTONS',
                buttons: []
              });
            }

            const buttonsComponent = payload.components.find(c => c.type === 'BUTTONS');

            if (selectedButton.type === 'FLOW') {
              buttonsComponent.buttons.push({
                type: 'button',
                sub_type: 'flow',
                index: buttonIndex?.toString(),
                parameters: []
              });
            } else if (selectedButton.type === 'CATALOG') {
              buttonsComponent.buttons.push({
                type: 'button',
                sub_type: 'catalog',
                index: buttonIndex?.toString(),
                parameters: []
              });
            } else {
              buttonsComponent.buttons.push({
                type: selectedButton.type,
                sub_type: subType,
                index: buttonIndex,
                parameters: [
                  {
                    type: selectedButton.type === 'URL' ? 'text' : 'text',
                    text: input.value || ''
                  }
                ]
              });
            }
          }
        }

      });

      // console.log(payload);
      // console.log("::: Z-PRO ::: ZDG ::: Frontend - Components being sent:", JSON.stringify(payload.components));

      try {
        const response = await EnviarTemplateComponenteWaba({ ...payload, dataJson: JSON.stringify(payload.components) });
        console.log('socket ON: Template sucess:', response.data);
        this.fecharModalTemplate();
      } catch (error) {
        console.error('Template error:', error);
      }
      // if (this.selectedTemplate) {
      //   const message = {
          // read: 1,
          // fromMe: true,
          // mediaUrl: '',
          // body: JSON.stringify(this.selectedTemplate.value.components),
          // scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
          // quotedMsg: this.replyingMessage,     
          // from: this.ticketFocado.contact.number,
          // tokenApi: this.ticketFocado.whatsapp.tokenAPI,
          // // tokenApi: this.ticketFocado.channel.tokenApi,
          // ticketId: this.ticketFocado.id,
          // idFront: uid(),
          // mediaType: 'templates',
          // sendType: 'templates',
          // language: this.selectedTemplate.value.language,
      //     templateName: this.selectedTemplate.value.name
      //   }
      //   await EnviarTemplateWaba(message)
      //   console.log('Enviando template:', this.selectedTemplate);
      //   this.fecharModalTemplate();
      // }
    },
    async enviarTemplateSelecionadoMarketing() {
      const campoVazio = this.selectedTemplateComponents.some(input =>
        (input.key.startsWith('variable_') || input.key.startsWith('named_variable_')) &&
        (!input.value || input.value.toString().trim() === '')
      );
      if (campoVazio) {
        this.$q.notify({
          type: 'negative',
          message: this.$t('inputMensagem.labels.campoVazio')
        });
        return;
      }

      if (!this.selectedTemplate) {
        return;
      }

      const payload = {
        from: this.ticketFocado.contact.number,
        phone_number_id: this.ticketFocado.whatsapp.tokenAPI,
        ticketId: this.ticketFocado.id,
        idFront: uid(),
        language: this.selectedTemplate.value.language,
        templateName: this.selectedTemplate.value.name,
        components: [],
        read: 1,
        fromMe: true,
        mediaUrl: '',
        body: JSON.stringify(this.selectedTemplate.value.components),
        scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
        quotedMsg: this.replyingMessage,     
        tokenApi: this.ticketFocado.whatsapp.tokenAPI,
        mediaType: 'templates',
        sendType: 'templates',
      };

      this.selectedTemplateComponents.forEach(input => {
        // Verifica se há variáveis do header antes de processar headers simples
        const hasHeaderVariables = this.selectedTemplateComponents.some(comp => 
          comp.key.startsWith('header_variable') && comp.value
        );

        if (input.key.startsWith('header') && !hasHeaderVariables) {
          let format = '';
          if (input.key === 'header_video') format = 'VIDEO';
          if (input.key === 'header_image') format = 'IMAGE';
          if (input.key === 'header_document') format = 'DOCUMENT';
          if (input.key === 'header_text') format = 'TEXT';

          // Só cria o componente se o format for válido
          if (format) {
            payload.components.push({
              type: 'HEADER',
              format: format,
              value: input.value
            });
          }
        } else if (input.key.startsWith('header_variable')) {
          // Processa variáveis do header
          const variableNumber = input.key.replace('header_variable_', '');
          if (!payload.components.some(component => component.type === 'HEADER')) {
            payload.components.push({
              type: 'HEADER',
              format: 'TEXT',
              variables: []
            });
          }
          const headerComponent = payload.components.find(component => component.type === 'HEADER');
          // Garante que o format seja TEXT para variáveis
          headerComponent.format = 'TEXT';
          // Garante que o array tenha o tamanho adequado
          while (headerComponent.variables.length < variableNumber) {
            headerComponent.variables.push('');
          }
          headerComponent.variables[variableNumber - 1] = input.value;
        } else if (input.key.startsWith('variable')) {
          const variableNumber = input.key.replace('variable_', '');
          if (!payload.components.some(component => component.type === 'BODY')) {
            payload.components.push({
              type: 'BODY',
              variables: []
            });
          }
          const bodyComponent = payload.components.find(component => component.type === 'BODY');
          // Garante que o array tenha o tamanho adequado
          while (bodyComponent.variables.length < variableNumber) {
            bodyComponent.variables.push('');
          }
          bodyComponent.variables[variableNumber - 1] = input.value;
        } else if (input.key.startsWith('named_variable')) {
          const variableName = input.key.replace('named_variable_', '');
          const bodyComponent = payload.components.find(c => c.type === 'BODY') || { type: 'BODY', parameters: [] };
          if(variableName === 'nome'){
            bodyComponent.parameters.push({
              type: 'text',
              text: input.value || '',
              name: 'name'
          })
          } if(variableName === 'texto'){
              bodyComponent.parameters.push({
                type: 'text',
                text: input.value || '',
                name: 'text'
            })
          } if(variableName === 'number'){
              bodyComponent.parameters.push({
                type: 'text',
                text: input.value || '',
                name: 'number'
            })
          }

          if (!payload.components.some(c => c.type === 'BODY')) {
              payload.components.push(bodyComponent);
          }
        // } else if (input.key.startsWith('button_')) {
        }  else if (input.key.includes('button_')) {
          // Obtendo o índice do botão
          // const buttonIndex = parseInt(input.key.replace('button_', '')) - 1;
          const buttonIndex = parseInt(input.key.replace('button_url_', '').replace('button_', '')) - 1;

          // Obtendo o tipo do botão dinamicamente do template selecionado
          const selectedButton = this.selectedTemplate.value.components
            .find(c => c.type === 'BUTTONS')?.buttons?.[buttonIndex];

          if (selectedButton) {
            const subType = selectedButton.type === 'COPY_CODE' ? 'copy_code' : 
                          selectedButton.type === 'URL' ? 'url' : 
                          selectedButton.type === 'FLOW' ? 'flow' :
                          selectedButton.type === 'CATALOG' ? 'catalog' : 'quick_reply';

            if (!payload.components.some(c => c.type === 'BUTTONS')) {
              payload.components.push({
                type: 'BUTTONS',
                buttons: []
              });
            }

            const buttonsComponent = payload.components.find(c => c.type === 'BUTTONS');

            if (selectedButton.type === 'FLOW') {
              buttonsComponent.buttons.push({
                type: 'button',
                sub_type: 'flow',
                index: buttonIndex?.toString(),
                parameters: []
              });
            } else if (selectedButton.type === 'CATALOG') {
              buttonsComponent.buttons.push({
                type: 'button',
                sub_type: 'catalog',
                index: buttonIndex?.toString(),
                parameters: []
              });
            } else {
              buttonsComponent.buttons.push({
                type: selectedButton.type,
                sub_type: subType,
                index: buttonIndex,
                parameters: [
                  {
                    type: selectedButton.type === 'URL' ? 'text' : 'text',
                    text: input.value || ''
                  }
                ]
              });
            }
          }
        }

      });

      // console.log(payload);
      // console.log("::: Z-PRO ::: ZDG ::: Frontend - Components being sent:", JSON.stringify(payload.components));

      try {
        const response = await EnviarTemplateMarketingComponenteWaba({ ...payload, dataJson: JSON.stringify(payload.components) });
        console.log('socket ON: Template sucess:', response.data);
        this.fecharModalTemplate();
      } catch (error) {
        console.error('Template error:', error);
      }
      // if (this.selectedTemplate) {
      //   const message = {
          // read: 1,
          // fromMe: true,
          // mediaUrl: '',
          // body: JSON.stringify(this.selectedTemplate.value.components),
          // scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
          // quotedMsg: this.replyingMessage,     
          // from: this.ticketFocado.contact.number,
          // tokenApi: this.ticketFocado.whatsapp.tokenAPI,
          // // tokenApi: this.ticketFocado.channel.tokenApi,
          // ticketId: this.ticketFocado.id,
          // idFront: uid(),
          // mediaType: 'templates',
          // sendType: 'templates',
          // language: this.selectedTemplate.value.language,
      //     templateName: this.selectedTemplate.value.name
      //   }
      //   await EnviarTemplateWaba(message)
      //   console.log('Enviando template:', this.selectedTemplate);
      //   this.fecharModalTemplate();
      // }
      },
    async enviarTemplateSelecionadoHub() {
      if (!this.selectedTemplateHub) {
        return;
      }

      const payload = {
        whatsappId: this.ticketFocado.whatsappId,
        recipientNumber: this.ticketFocado.contact.number,
        templateName: this.selectedTemplateHub.value.name,
        language: this.selectedTemplateHub.value.language,
        components: [],
        ticketId: this.ticketFocado.id,
        scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
        quotedMsg: this.replyingMessage,
        userId: this.ticketFocado.userId,
        body: JSON.stringify(this.selectedTemplateHub.value.components),
        read: 1,
        fromMe: true,
        mediaUrl: '',
        mediaType: 'templates',
        sendType: 'templates',
      };

      // if(!this.selectedTemplateComponentsHub){
        try {
          const response = await EnviarTemplate(payload);
          console.log('Template enviado com sucesso:', response.data);
          this.fecharModalTemplateHub();
        } catch (error) {
          console.error('Erro ao enviar template:', error);
        }
      // }

      // else {
      //   // this.selectedTemplateComponentsHub.forEach(input => {
      //   //   if (input.key.startsWith('header')) {
      //   //     payload.components.push({ 
      //   //       type: "HEADER",
      //   //       parameters: [
      //   //         {
      //   //           type: "image",
      //   //           image: {
      //   //             link: input.value // URL da imagem
      //   //           }
      //   //         }
      //   //       ]
      //   //     });
      //   //   } else if (input.key.startsWith('named_variable')) {
      //   //     const variableName = input.key.replace('named_variable_', '');
      //   //     const bodyComponent = payload.components.find(c => c.type === 'BODY') || { type: 'BODY', parameters: [] };

      //   //     bodyComponent.parameters.push({
      //   //       type: "text",
      //   //       text: input.value || '',
      //   //       name: variableName // Nome do parâmetro
      //   //     });

      //   //     if (!payload.components.some(c => c.type === 'BODY')) {
      //   //       payload.components.push(bodyComponent);
      //   //     }
      //   //   } else if (input.key.startsWith('variable')) {
      //   //     const bodyComponent = payload.components.find(c => c.type === 'BODY') || { type: 'BODY', parameters: [] };

      //   //     bodyComponent.parameters.push({
      //   //       type: "text",
      //   //       text: input.value
      //   //     });

      //   //     if (!payload.components.some(c => c.type === 'BODY')) {
      //   //       payload.components.push(bodyComponent);
      //   //     }
      //   //   }
      //   // });

      //   this.selectedTemplateComponentsHub.forEach(input => {
      //     if (input.key.startsWith('header')) {
      //       let format = '';
      //       if (input.key === 'header_video') format = 'VIDEO';
      //       if (input.key === 'header_image') format = 'IMAGE';
      //       if (input.key === 'header_document') format = 'DOCUMENT';
      //       if (input.key === 'header_text') format = 'TEXT';

      //       payload.components.push({
      //         type: 'HEADER',
      //         format: format,
      //         value: input.value
      //       });
      //     } else if (input.key.startsWith('variable')) {
      //       const variableNumber = input.key.replace('variable_', '');
      //       if (!payload.components.some(component => component.type === 'BODY')) {
      //         payload.components.push({
      //           type: 'BODY',
      //           variables: []
      //         });
      //       }
      //       const bodyComponent = payload.components.find(component => component.type === 'BODY');
      //       bodyComponent.variables[variableNumber - 1] = input.value;
      //     } else if (input.key.startsWith('named_variable')) {
      //       const variableName = input.key.replace('named_variable_', '');
      //       const bodyComponent = payload.components.find(c => c.type === 'BODY') || { type: 'BODY', parameters: [] };
      //       if(variableName === 'nome'){
      //         bodyComponent.parameters.push({
      //           type: 'text',
      //           text: input.value || '',
      //           name: 'name'
      //       })
      //       } if(variableName === 'texto'){
      //           bodyComponent.parameters.push({
      //             type: 'text',
      //             text: input.value || '',
      //             name: 'text'
      //         })
      //       } if(variableName === 'number'){
      //           bodyComponent.parameters.push({
      //             type: 'text',
      //             text: input.value || '',
      //             name: 'number'
      //         })
      //       }

      //       if (!payload.components.some(c => c.type === 'BODY')) {
      //           payload.components.push(bodyComponent);
      //       }
      //     }
      //   });

      //   console.log('Payload final:', payload);
      //   try {
      //     const response = await EnviarTemplateComComponente(payload);
      //     console.log('Template enviado com sucesso:', response.data);
      //     this.fecharModalTemplate();
      //   } catch (error) {
      //     console.error('Erro ao enviar template:', error);
      //   }
      // }
      
      this.fecharModalTemplateHub();
    },
    async buscarTemplateWabaHub(){
      const whatsappId = this.ticketFocado.whatsappId
      const response = await ListarTemplate({ whatsappId })
      // this.templatesHub = response.data.data;
      this.templatesHub = response.data.data.filter(template => {
        // Verifica se há um HEADER inválido (VIDEO, IMAGE, DOCUMENT)
        const temHeaderInvalido = template.components.some(component => 
          component.type === 'HEADER' && ['VIDEO', 'IMAGE', 'DOCUMENT'].includes(component.format)
        );

        if (temHeaderInvalido) {
          return false; // Remove templates com HEADER de mídia
        }

        // Verifica se há variáveis {{ }} em qualquer parte do JSON do template
        const contemVariaveis = JSON.stringify(template).match(/{{.*?}}/g);
        
        return !contemVariaveis; // Remove templates que contenham {{ }} em qualquer parte
      });
      console.log(this.templatesHub)
      this.abrirModalTemplateHub()
    },
    async buscarTemplateWaba(){
      const tokenApi = this.ticketFocado.whatsapp.tokenAPI
      
      // Verificar cache no localStorage
      const cacheKey = `templates_cache_${tokenApi}`
      const cachedData = localStorage.getItem(cacheKey)
      
      if (cachedData) {
        const { templates, timestamp } = JSON.parse(cachedData)
        const now = Date.now()
        const fiveMinutes = 5 * 60 * 1000 // 5 minutos em millisegundos
        
        // Se o cache ainda é válido (menos de 5 minutos), usar dados em cache
        if (now - timestamp < fiveMinutes) {
          console.log('Usando templates do cache')
          // Ordenar templates por ordem alfabética
          const templatesOrdenados = templates.sort((a, b) => {
            const nameA = a.name ? a.name.toLowerCase() : '';
            const nameB = b.name ? b.name.toLowerCase() : '';
            return nameA.localeCompare(nameB);
          });
          this.templates = templatesOrdenados
          this.cacheStatus = {
            ultimaAtualizacao: new Date(timestamp).toLocaleString('pt-BR'),
            tempoRestante: Math.ceil((fiveMinutes - (now - timestamp)) / 1000),
            usandoCache: true
          }
          this.abrirModalTemplate()
          return
        }
      }
      
      // Se não há cache válido, fazer chamada à API
      console.log('Buscando templates da API')
      const response = await BuscarTemplates(tokenApi)
      
      // Filtrar templates aprovados e ordenar por ordem alfabética
      const templatesAprovados = response.data.data
        .filter(template => template.status === 'APPROVED')
        .sort((a, b) => {
          const nameA = a.name ? a.name.toLowerCase() : '';
          const nameB = b.name ? b.name.toLowerCase() : '';
          return nameA.localeCompare(nameB);
        });
      
      // Salvar no cache com timestamp
      const cacheData = {
        templates: templatesAprovados,
        timestamp: Date.now()
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheData))
      
      this.templates = templatesAprovados
      this.cacheStatus = {
        ultimaAtualizacao: new Date().toLocaleString('pt-BR'),
        tempoRestante: 300, // 5 minutos em segundos
        usandoCache: false
      }
      this.abrirModalTemplate()
    },
    
    // Métodos para gerenciar cache de templates
    limparCacheTemplates() {
      // Limpar todos os caches de templates
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('templates_cache_')) {
          localStorage.removeItem(key)
        }
      })
      console.log('Cache de templates limpo')
    },
    
    limparCacheTemplateEspecifico(tokenApi) {
      // Limpar cache de um token específico
      const cacheKey = `templates_cache_${tokenApi}`
      localStorage.removeItem(cacheKey)
      console.log(`Cache de templates limpo para token: ${tokenApi}`)
    },
    
    verificarStatusCache(tokenApi) {
      // Verificar status do cache para um token específico
      const cacheKey = `templates_cache_${tokenApi}`
      const cachedData = localStorage.getItem(cacheKey)
      
      if (!cachedData) {
        return { existe: false, valido: false, tempoRestante: 0 }
      }
      
      const { timestamp } = JSON.parse(cachedData)
      const now = Date.now()
      const fiveMinutes = 5 * 60 * 1000
      const tempoRestante = Math.max(0, fiveMinutes - (now - timestamp))
      const valido = tempoRestante > 0
      
      return {
        existe: true,
        valido,
        tempoRestante: Math.ceil(tempoRestante / 1000) // em segundos
      }
    },
    
    async forcarAtualizacaoTemplates() {
      // Força atualização ignorando o cache
      const tokenApi = this.ticketFocado.whatsapp.tokenAPI
      this.limparCacheTemplateEspecifico(tokenApi)
      await this.buscarTemplateWaba()
    },
    
    formatLabel(participant) {
      return `${participant.userId}`;
    },
    handleSelectAllOption(value) {
      if (value.includes('todos')) {
        this.selectedParticipants = this.participantsList.map(item => item.userId);
      }
    },
    async listarConfiguracoes() {
      const configuracoes = JSON.parse(localStorage.getItem('configuracoes'));
      const signedConfig = configuracoes?.find(c => c.key === 'signed');
      this.assinaturaAtiva = signedConfig?.value;
    },
    fecharModal() {
      this.modalVisivel = false;
      this.mensagemMarcacaoFantasma = '';
      this.signGhost = true; // Resetar assinatura para ativada por padrão
    },
    fecharModalUsuario() {
      this.modalVisivelUsuario = false;
      this.mensagemMarcacaoUsuario = '';
      this.selectedParticipants = [];
      this.signMention = true; // Resetar assinatura para ativada por padrão
    },
    fecharModalBotao(){
      this.textChat = ''
      this.mensagemBotao = ''
      this.botao1 = ''
      this.botao2 = ''
      this.botao3 = ''
      this.isRecordingAudio = false
      localStorage.setItem('recording', false);
      this.loading = false
      this.modalVisivelBotao = false;
      this.signButtons = true; // Resetar assinatura para ativada por padrão
    },
    fecharModalLista(){
      this.mensagemLista = ''
      this.header = ''
      this.footer = ''
      this.sectionTitle = ''
      this.rowTitle1 = ''
      this.rowDescription1 = ''
      this.rowTitle2 = ''
      this.rowDescription2 = ''
      this.rowTitle3 = ''
      this.rowDescription3 = ''
      this.rowTitle4 = ''
      this.rowDescription4 = ''
      this.rowTitle5 = ''
      this.rowDescription5 = ''
      this.button_text = ''
      this.textChat = ''
      this.modalVisivelLista = false;
      this.signLists = true; // Resetar assinatura para ativada por padrão
    },
    // ===== NOVOS MÉTODOS PARA FECHAR MODAIS =====
    fecharModalCTAURL(){
      this.mensagemCTAURL = ''
      this.buttonTextCTAURL = ''
      this.buttonURLCTAURL = ''
      this.headerCTAURL = ''
      this.footerCTAURL = ''
      this.headerTypeCTAURL = 'text'
      this.headerTextCTAURL = ''
      this.headerLinkCTAURL = ''
      this.modalVisivelCTAURL = false;
      this.signCTAURL = true;
    },
    fecharModalFlow(){
      this.mensagemFlow = ''
      this.headerFlow = ''
      this.footerFlow = ''
      this.flowId = ''
      this.flowName = ''
      this.flowCta = ''
      this.flowToken = ''
      this.flowAction = 'navigate'
      this.flowActionPayload = ''
      this.headerTypeFlow = 'text'
      this.headerTextFlow = ''
      this.headerLinkFlow = ''
      this.modalVisivelFlow = false;
      this.signFlow = true;
    },
    fecharModalReplyButtons(){
      this.mensagemReplyButtons = ''
      this.headerReplyButtons = ''
      this.footerReplyButtons = ''
      this.buttonsReplyButtons = [{ id: '1', title: '' }, { id: '2', title: '' }, { id: '3', title: '' }]
      this.headerTypeReplyButtons = 'text'
      this.headerTextReplyButtons = ''
      this.headerLinkReplyButtons = ''
      this.modalVisivelReplyButtons = false;
      this.signReplyButtons = true;
    },
    fecharModalAddress(){
      this.street1 = ''
      this.street2 = ''
      this.city = ''
      this.state = ''
      this.zip = ''
      this.country = ''
      this.addressType = 'HOME'
      this.modalVisivelAddress = false;
      this.signAddress = true;
    },
    fecharModalLocationRequest(){
      this.mensagemLocationRequest = ''
      this.modalVisivelLocationRequest = false;
      this.signLocationRequest = true;
    },
    fecharModalLocation(){
      this.latitude = ''
      this.longitude = ''
      this.locationName = ''
      this.locationAddress = ''
      this.modalVisivelLocation = false;
      this.signLocation = true;
    },
    // ===== FIM DOS NOVOS MÉTODOS =====
    mostrarModal() {
      this.modalVisivel = true;
    },
    mostrarModalUsuario() {
      this.modalVisivelUsuario = true;
      this.listParticipantes();
    },
    mostrarModalBotao() {
      this.modalVisivelBotao = true;
    },
    abrirModalHumanAgent() {
      this.modalVisivelHumanAgent = true;
      this.mensagemHumanAgent = '';
      this.$nextTick(() => {
        if (this.$refs.inputEnvioMensagemHumanAgent) {
          this.$refs.inputEnvioMensagemHumanAgent.focus();
        }
      });
    },
    fecharModalHumanAgent() {
      this.modalVisivelHumanAgent = false;
      this.mensagemHumanAgent = '';
    },
    async enviarMensagemHumanAgent() {
      if (!this.mensagemHumanAgent.trim()) {
        this.$q.notify({
          type: 'negative',
          message: this.$t('inputMensagem.labels.mensagemObrigatoria') || 'Mensagem é obrigatória'
        });
        return;
      }

      if (this.ticketFocado.channel !== 'instagram' && this.ticketFocado.channel !== 'messenger') {
        this.$q.notify({
          type: 'negative',
          message: 'Esta funcionalidade é apenas para Instagram e Messenger'
        });
        return;
      }

      this.loading = true;
      try {
        let mensagem = this.mensagemHumanAgent.trim();
        const username = localStorage.getItem('username');
        if (username && this.sign) {
          mensagem = `*${username}*:\n ${mensagem}`;
        }

        const isInstagram = this.ticketFocado.channel === 'instagram';
        const isMessenger = this.ticketFocado.channel === 'messenger';

        const data = {
          read: 1,
          fromMe: true,
          mediaUrl: '',
          body: mensagem,
          scheduleDate: null,
          quotedMsg: this.replyingMessage,
          from: isInstagram 
            ? (this.ticketFocado.contact.instagramPK?.toString() || this.ticketFocado.contact.number)
            : isMessenger
            ? (this.ticketFocado.contact.messengerId?.toString() || this.ticketFocado.contact.number)
            : this.ticketFocado.contact.number,
          tokenApi: this.ticketFocado.whatsapp.tokenAPI || this.ticketFocado.whatsapp.fbPageId,
          ticketId: this.ticketFocado.id,
          idFront: uid()
        };

        if (isInstagram) {
          await EnviarHumanAgentInstagram(data);
        } else if (isMessenger) {
          await EnviarHumanAgentMessenger(data);
        }

        this.$q.notify({
          type: 'positive',
          message: this.$t('inputMensagem.labels.mensagemEnviada') || 'Mensagem enviada com sucesso!',
          position: 'top'
        });

        this.fecharModalHumanAgent();
        this.$emit('update:replyingMessage', null);
        
        setTimeout(() => {
          this.scrollToBottom();
        }, 300);
      } catch (error) {
        this.$notificarErro(this.$t('common.notifications.error'), error);
      } finally {
        this.loading = false;
      }
    },
    mostrarModalLista() {
      this.modalVisivelLista = true;
    },
    // ===== NOVOS MÉTODOS PARA ABRIR MODAIS =====
    mostrarModalCTAURL() {
      this.modalVisivelCTAURL = true;
    },
    mostrarModalFlow() {
      this.modalVisivelFlow = true;
    },
    mostrarModalReplyButtons() {
      this.modalVisivelReplyButtons = true;
    },
    mostrarModalAddress() {
      this.modalVisivelAddress = true;
    },
    mostrarModalLocationRequest() {
      this.modalVisivelLocationRequest = true;
    },
    mostrarModalLocation() {
      this.modalVisivelLocation = true;
    },
    // ===== FIM DOS NOVOS MÉTODOS =====
    async listParticipantes() {
      if (this.ticketFocado.status === 'undefined' || this.ticketFocado.status === 'closed' || this.ticketFocado.channel === 'meow') return;
      if (!this.ticketFocado.isGroup) return;
      const data = {
        ticket: this.ticketFocado.contact.number,
        channel: this.ticketFocado.channel,
        whatsappId: this.ticketFocado.whatsappId,
        wabaId: this.ticketFocado.whatsapp.wabaId
      };
      const list = await ListParticipants(data);
      console.log('list', list)
      this.participantsList = list.data.participants.map(participant => ({
        value: participant.userId,
        label: `${participant.userId} - ${participant.name}`
      }));


      this.participantsList.unshift({
        value: 'todos',
        label: this.$t("atendimentoInputScript.selectAll"),
      });
    },
    async enviarMensagemMarcacaoFantasma() {
      // Aplicar assinatura se estiver ativada
      let mensagemComAssinatura = this.mensagemMarcacaoFantasma;
      const username = localStorage.getItem('username');
      if (username && this.signGhost) {
        mensagemComAssinatura = `*${username}*:\n ${mensagemComAssinatura}`;
      }
      
      const data = {
        body: mensagemComAssinatura,
        ticket: this.ticketFocado,
        channel: this.ticketFocado.channel,
        whatsappId: this.ticketFocado.whatsappId,
      };
      await SendGhostMessage(data)
        .then(() => {
            this.fecharModal();
            this.$q.notify({
              message: this.$t("atendimentoInputScript.ghostMessageSuccess"),
              type: 'positive',
            });
            this.mensagemMarcacaoFantasma = '';
          })
          .catch((error) => {
            this.$q.notify({
              message: this.$t("atendimentoInputScript.ghostMessageError", { error }),
              type: 'negative',
            });
          });
    },
    async enviarMensagemMarcacaoUsuario() {
      this.loading = true
      // const participants = this.participantsInput.split(',').map(participant => participant.trim());
      const participants = this.selectedParticipants;
      const hasSelectAll = participants.find(participant => participant.value === 'todos');
      
      // Aplicar assinatura se estiver ativada
      let mensagemComAssinatura = this.mensagemMarcacaoUsuario;
      const username = localStorage.getItem('username');
      if (username && this.signMention) {
        mensagemComAssinatura = `*${username}*:\n ${mensagemComAssinatura}`;
      }
      
      if (hasSelectAll) {
        const data = {
        body: mensagemComAssinatura,
        ticket: this.ticketFocado,
        whatsappId: this.ticketFocado.whatsappId,
        channel: this.ticketFocado.channel,
        wabaId: this.ticketFocado.whatsapp.wabaId
      };
      await SendMentionAllMessage(data)
        .then(() => {
            this.fecharModalUsuario();
            this.$q.notify({
              message: this.$t("atendimentoInputScript.mentionAllSuccess"),
              type: 'positive',
            });
            this.mensagemMarcacaoUsuario = '';
        })
        .catch((error) => {
            console.log(error)
            this.$q.notify({
              message: this.$t("atendimentoInputScript.mentionAllError"),
              type: 'negative',
            });
        });
      }
      else {
      const participantValues = this.selectedParticipants.map(participant => participant.value);
      const data = {
        body: mensagemComAssinatura,
        ticket: this.ticketFocado,
        channel: this.ticketFocado.channel,
        whatsappId: this.ticketFocado.whatsappId,
        wabaId: this.ticketFocado.whatsapp.wabaId,
        participants: participantValues
      };
      await SendMentionMessage(data)
        .then(() => {
            this.fecharModalUsuario();
            this.$q.notify({
              message: this.$t("atendimentoInputScript.mentionAllSuccess"),
              type: 'positive',
            });
            this.mensagemMarcacaoUsuario = '';
        })
        .catch((error) => {
            console.log(error)
            this.$q.notify({
              message: this.$t("atendimentoInputScript.mentionAllError"),
              type: 'negative',
            });
        });
      }
      this.loading = false
    },
    setScheduleDate(date) {
      this.scheduleDate = date
    },
    setMensagem(str) {
      this.textChat = str
    },
    onSelectSchedule(newValue) {
      if (!newValue.func) {
        this.scheduleDate = null
        return
      }
      const date = newValue.func()
      this.scheduleDate = format(date, 'yyyy-MM-dd HH:mm')
    },
    openFilePreview(event) {
      const data = event.clipboardData.files[0]
      const urlImg = window.URL.createObjectURL(data)
      return urlImg
    },
    handleInputDrop(evt) {
      const allowed = this.acceptComputed.split(',').map((a) => a.trim())
      this.textChat = ''
      const droppedFiles = [...evt.dataTransfer.files].filter((file) => {
        const ext = file.name.split('.').pop()
        const extensionPattern = allowed.map((ext) => ext.replace(/\./g, '\\.').replace(/\*/g, '.*')).join('|')
        const regex = new RegExp(`^(${extensionPattern})$`, 'i')
        return regex.test(file.type) || regex.test('.' + ext)
      })

      // Se for WABA, valida os arquivos antes de adicionar
      if (this.isWabaChannel && droppedFiles.length > 0) {
        const validFiles = droppedFiles.filter(f => this.validateFileWabaSingle(f))
        if (validFiles.length > 0) {
          this.arquivos = [...this.arquivos, ...validFiles]
        }
        // validateFilesWaba mostrará notificações de erro se houver arquivos inválidos
        if (droppedFiles.length !== validFiles.length) {
          this.validateFilesWaba(droppedFiles.filter(f => !this.validateFileWabaSingle(f)))
        }
      } else if (this.isInstagramChannel && droppedFiles.length > 0) {
        // Se for Instagram, valida os arquivos antes de adicionar
        const validFiles = droppedFiles.filter(f => this.validateFileInstagramSingle(f))
        if (validFiles.length > 0) {
          this.arquivos = [...this.arquivos, ...validFiles]
        }
        // validateFilesInstagram mostrará notificações de erro se houver arquivos inválidos
        if (droppedFiles.length !== validFiles.length) {
          this.validateFilesInstagram(droppedFiles.filter(f => !this.validateFileInstagramSingle(f)))
        }
      } else if (this.isMessengerChannel && droppedFiles.length > 0) {
        // Se for Messenger, valida os arquivos antes de adicionar
        const validFiles = droppedFiles.filter(f => this.validateFileMessengerSingle(f))
        if (validFiles.length > 0) {
          this.arquivos = [...this.arquivos, ...validFiles]
        }
        // validateFilesMessenger mostrará notificações de erro se houver arquivos inválidos
        if (droppedFiles.length !== validFiles.length) {
          this.validateFilesMessenger(droppedFiles.filter(f => !this.validateFileMessengerSingle(f)))
        }
      } else {
        this.arquivos = [
          ...this.arquivos,
          ...droppedFiles
        ]
      }

      if (!this.arquivos.length) {
        this.$q.notify({
          message: this.$t('atendimentoInputScript.invalidFile'),
          caption: this.$t('atendimentoInputScript.allowedFormats', { formats: allowed.join(', ') }),
          type: 'negative',
        })
        return
      }
      this.$refs.inputEnvioMensagem.focus()
    },
    handleInputPaste(e) {
      if (!this.ticketFocado?.id) return
      if (e.clipboardData.files[0]) {
        const pastedFile = e.clipboardData.files[0]
        
        // Se for WABA, valida o arquivo antes de adicionar
        if (this.isWabaChannel && !this.validateFileWabaSingle(pastedFile)) {
          this.validateFilesWaba([pastedFile])
          return
        }
        
        // Se for Instagram, valida o arquivo antes de adicionar
        if (this.isInstagramChannel && !this.validateFileInstagramSingle(pastedFile)) {
          this.validateFilesInstagram([pastedFile])
          return
        }
        
        // Se for Messenger, valida o arquivo antes de adicionar
        if (this.isMessengerChannel && !this.validateFileMessengerSingle(pastedFile)) {
          this.validateFilesMessenger([pastedFile])
          return
        }
        
        this.textChat = ''
        this.arquivos = [pastedFile]
        this.abrirModalPreviewImagem = true
        this.urlMediaPreview = {
          title: this.$t("atendimentoInputScript.previewTitle", {
            contactName: this.ticketFocado?.contact?.name || this.$t("common.unknown"),
          }),
          src: this.openFilePreview(e),
        }
        
        // Inicia o indicador de composing (colando arquivo)
        // this.startTypingIndicator('composing');
        
        this.$refs.inputEnvioMensagem.focus()
      }
    },
    removerMediaMensagemRapida(){
      this.removeMedia = false
      this.mensagemRapidaMedia = ''
      this.mensagemRapidaVoz = ''
      this.mensagemRapidaSetada = false
    },
    mensagemRapidaSelecionada(mensagem) {
      if(mensagem.message !== 'null'){
        this.textChat = mensagem.message
      }
      if(this.mensagemRapidaMedia !== null){
        this.mensagemRapidaMedia = mensagem.media
        this.removeMedia = true
      }
      if(this.mensagemRapidaVoz !== null){
        this.mensagemRapidaVoz = mensagem.voice
        this.removeMedia = true
      }
      if(this.mensagemRapidaMedia !== null){
        this.mensagemRapidaSetada = true
        this.removeMedia = true
      }
      // Fechar o modal após seleção
      this.visualizarMensagensRapidas = false
      
      // Inicia o indicador de composing (selecionando mensagem rápida)
      // if (this.ticketFocado && this.ticketFocado.id) {
      //   this.startTypingIndicator('composing');
      // }
      
      const timerId = setTimeout(() => {
        this.$refs.inputEnvioMensagem.focus()
      }, 300)
      this.addTimer(timerId)
    },
    onInsertSelectEmoji(emoji) {
      const self = this
      const inputComp = this.$refs.inputEnvioMensagem
      const tArea = (inputComp && typeof inputComp.getNativeElement === 'function'
        ? inputComp.getNativeElement()
        : (inputComp && (inputComp.$refs && (inputComp.$refs.input || inputComp.$refs.textarea)))
      ) || (inputComp && inputComp.$el && inputComp.$el.querySelector && inputComp.$el.querySelector('textarea, input'))

      if (!emoji || !emoji.data) {
        return
      }

      if (!tArea) {
        // fallback: sem acesso ao elemento nativo, apenas concatena
        this.textChat = (this.textChat || '') + emoji.data
        return
      }

      // get cursor's position:
      const startPos = tArea.selectionStart
      const endPos = tArea.selectionEnd
      const cursorPos = startPos
      const tmpStr = tArea.value

      // insert:
      self.txtContent = this.textChat
      self.txtContent = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)
      this.textChat = self.txtContent

      // move cursor:
      const timerId = setTimeout(() => {
        try { tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length } catch (e) { /* ignore */ }
      }, 10)
      this.addTimer(timerId)
    },
    onInsertSelectEmojiGhost(emoji) {
      const inputComp = this.$refs.inputEnvioMensagemFantasma
      const tArea = (inputComp && typeof inputComp.getNativeElement === 'function'
        ? inputComp.getNativeElement()
        : (inputComp && (inputComp.$refs && (inputComp.$refs.input || inputComp.$refs.textarea)))
      ) || (inputComp && inputComp.$el && inputComp.$el.querySelector && inputComp.$el.querySelector('textarea, input'))

      if (!emoji || !emoji.data) {
        return
      }

      if (!tArea) {
        this.mensagemMarcacaoFantasma = (this.mensagemMarcacaoFantasma || '') + emoji.data
        return
      }

      const tmpStr = tArea.value
      const startPos = tArea.selectionStart
      const endPos = tArea.selectionEnd
      const cursorPos = startPos

      this.mensagemMarcacaoFantasma = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)

      const timerId = setTimeout(() => {
        try { tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length } catch (e) { /* ignore */ }
      }, 10)
      this.addTimer(timerId)
    },
    onInsertSelectEmojiMention(emoji) {
      const inputComp = this.$refs.inputEnvioMensagemUsuario
      const tArea = (inputComp && typeof inputComp.getNativeElement === 'function'
        ? inputComp.getNativeElement()
        : (inputComp && (inputComp.$refs && (inputComp.$refs.input || inputComp.$refs.textarea)))
      ) || (inputComp && inputComp.$el && inputComp.$el.querySelector && inputComp.$el.querySelector('textarea, input'))

      if (!emoji || !emoji.data) {
        return
      }

      if (!tArea) {
        this.mensagemMarcacaoUsuario = (this.mensagemMarcacaoUsuario || '') + emoji.data
        return
      }

      const tmpStr = tArea.value
      const startPos = tArea.selectionStart
      const endPos = tArea.selectionEnd
      const cursorPos = startPos

      this.mensagemMarcacaoUsuario = tmpStr.substring(0, startPos) + emoji.data + tmpStr.substring(endPos, tmpStr.length)

      const timerId = setTimeout(() => {
        try { tArea.selectionStart = tArea.selectionEnd = cursorPos + emoji.data.length } catch (e) { /* ignore */ }
      }, 10)
      this.addTimer(timerId)
    },
    abrirEnvioArquivo(event) {
      try {
        if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
        this.$q.notify({
          message: 'Browser does not support multiple file',
          type: 'negative'
        });
        return;
      }
        this.textChat = ''
        this.sticker = false;
        this.abrirFilePicker = true
        this.$refs.PickerFileMessage.pickFiles(event)
      } catch (error) {
        this.$q.notify({
          message: 'Browser does not support multiple file',
          type: 'negative'
        });
        return;
      }
    },
    abrirEnvioSticker(event) {
      this.textChat = ''
      this.abrirFilePicker = true
      this.sticker = true
      this.$refs.PickerFileMessage.pickFiles(event)
    },
    async handleStartRecordingAudio() {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        await Mp3Recorder.start();
        this.isRecordingAudio = true;
        localStorage.setItem('recording', true);
        
        // Inicia o indicador de recording (gravação de áudio) imediatamente após iniciar a gravação
        if (this.ticketFocado && this.ticketFocado.id) {
          this.startRecordingIndicator('recording');
        }
      } catch (error) {
        this.isRecordingAudio = false;
        localStorage.setItem('recording', false);
        console.error('Erro ao iniciar a gravação:', error);
      }
    },
    async handleStopRecordingAudio() {
      this.loading = true
      this.isRecordingAudio = false
      localStorage.setItem('recording', false);

      // Para o indicador de recording
      this.stopRecordingIndicator();

      try {
        const [buffer, blob] = await Mp3Recorder.stop().getMp3()
        if (blob.size < 10000) {
          this.loading = false
          this.isRecordingAudio = false
          localStorage.setItem('recording', false);
          return
        }

        const formData = new FormData()
        const filename = `${new Date().getTime()}.mp3`
        formData.append('medias', blob, filename)
        formData.append('body', filename)
        formData.append('fromMe', true)

        const ticketId = this.ticketFocado.id

        if (this.isScheduleDate) {
          formData.append('scheduleDate', this.scheduleDate)
        } 
        //else if(!this.isScheduleDate){
        if (this.semRedis === 'enabled'){
          if(!this.isScheduleDate && ['whatsapp', 'baileys'].includes(this.ticketFocado.channel)){
            formData.append('whatsappId', this.ticketFocado.whatsappId);
            formData.append('number', this.ticketFocado.contact.number);
            formData.append('whatsappType', this.ticketFocado.channel);
            formData.append('message', null); 
            formData.append('file', false);
            formData.append('isSticker', false);
            formData.append('voice', true);
            formData.append('ticket', JSON.stringify(this.ticketFocado)); 
            formData.append('group', this.ticketFocado.isGroup); 
            await NoRedis(formData)
          } else if (this.isScheduleDate && ['whatsapp', 'baileys'].includes(this.ticketFocado.channel)){
            await EnviarMensagemTexto(ticketId, formData)
          } else {
            if (this.ticketFocado.channel.includes("hub")) {
              await EnviarMensagemHub(ticketId, formData);
            } 
            else if (this.ticketFocado.channel.includes("meow")) {
              await EnviarMensagemMeow(ticketId, formData);
            } 
            else if (this.ticketFocado.channel.includes("evo")) {
              await EnviarMensagemEvo(ticketId, formData);
            } 
            else if (this.ticketFocado.channel === "zapi") {
              await EnviarMensagemZapi(ticketId, formData);
            }
            else if (this.ticketFocado.channel === "uazapi") {
              await EnviarMensagemUazapi(ticketId, formData);
            }
            else if (this.ticketFocado.channel.includes("webchat")) {
              await EnviarMensagemWebChat(ticketId, formData);
            }
            else {
              await EnviarMensagemTexto(ticketId, formData);
            }
          }
        } else if (this.semRedis === 'disabled'){
            if(this.ticketFocado.channel.includes('hub')){
            await EnviarMensagemHub(ticketId, formData)
          } else if (this.ticketFocado.channel.includes('meow')){
            await EnviarMensagemMeow(ticketId, formData);
          } else if (this.ticketFocado.channel.includes("webchat")) {
              await EnviarMensagemWebChat(ticketId, formData);
          } else if (this.ticketFocado.channel.includes('evo')){
            await EnviarMensagemEvo(ticketId, formData);
          } else if (this.ticketFocado.channel === "zapi") {
            await EnviarMensagemZapi(ticketId, formData);
          } else if (this.ticketFocado.channel === "uazapi") {
            await EnviarMensagemUazapi(ticketId, formData);
          } else {
            await EnviarMensagemTexto(ticketId, formData)
          }
        }

        if (this.mediaRecorder && this.mediaRecorder.stream) {
          this.mediaRecorder.stream.getTracks().forEach(track => {
            track.stop();
          });
        }
        this.mediaRecorder = null;
        this.audioChunks = [];
        
        this.arquivos = []
        this.textChat = ''
        this.$emit('update:replyingMessage', null)
        this.abrirFilePicker = false
        this.abrirModalPreviewImagem = false
        this.isRecordingAudio = false
        localStorage.setItem('recording', false);
        this.loading = false
        const timerId = setTimeout(() => {
          this.scrollToBottom()
        }, 300)
        this.addTimer(timerId)
      } catch (error) {
        this.isRecordingAudio = false
        localStorage.setItem('recording', false);
        this.loading = false
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    async handleStopRecordingAudioWaba() {
      this.loading = true
      this.isRecordingAudio = false
      localStorage.setItem('recording', false);
      
      // Para o indicador de recording
      this.stopRecordingIndicator();
      
      try {
        const [, blob] = await Mp3Recorder.stop().getMp3()
        if (blob.size < 10000) {
          this.loading = false
          this.isRecordingAudio = false
          localStorage.setItem('recording', false);
          return
        }

        const formData = new FormData()
        const filename = `${new Date().getTime()}.mp3`
        // formData.append('medias', blob, filename)
        // formData.append('body', filename)
        // formData.append('fromMe', true)
        // if (this.isScheduleDate) {
        //   formData.append('scheduleDate', this.scheduleDate)
        // }
        // const ticketId = this.ticketFocado.id

        formData.append('fromMe', true)
        formData.append('medias', blob, filename)
        formData.append('body', filename)
        formData.append('idFront', uid())
        formData.append('tokenApi', this.ticketFocado.whatsapp.tokenAPI)
        formData.append('from', this.ticketFocado.contact.number)
        formData.append('ticketId', this.ticketFocado.id)
        if (this.isScheduleDate) {
          formData.append('scheduleDate', this.scheduleDate)
        }

        if(this.ticketFocado.channel === 'waba') {
          await EnviarArquivoWaba(formData)
        } else if(this.ticketFocado.channel === 'instagram') {
          await EnviarArquivoInstagram(formData)
        }
        this.arquivos = []
        this.textChat = ''
        this.$emit('update:replyingMessage', null)
        this.abrirFilePicker = false
        this.abrirModalPreviewImagem = false
        this.isRecordingAudio = false
        localStorage.setItem('recording', false);
        this.loading = false
        const timerId = setTimeout(() => {
          this.scrollToBottom()
        }, 300)
        this.addTimer(timerId)
      } catch (error) {
        this.isRecordingAudio = false
        localStorage.setItem('recording', false);
        this.loading = false
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
      this.stopRecordingIndicator();
    },
    async handleCancelRecordingAudio() {
      try {
        await Mp3Recorder.stop().getMp3()
        this.isRecordingAudio = false
        localStorage.setItem('recording', false);
        this.loading = false
        
        this.stopRecordingIndicator();
        
      } catch (error) {
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
    },
    prepararUploadMedia() {
      if (!this.arquivos.length) {
        throw new Error(this.$t("atendimentoInputScript.noFilesToSend"));
      }
      const formDatas = this.arquivos.map(media => {
        const formData = new FormData()
        const normalizedFileName = media.name.replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
        formData.append('fromMe', true)
        formData.append('medias', media, normalizedFileName)
        formData.append('body', media.name)
        formData.append('idFront', uid())
        formData.append('isSticker', this.sticker)
        // formData.append('quotedMsg', this.replyingMessage?.messageId)
        if (this.isScheduleDate) {
          formData.append('scheduleDate', this.scheduleDate)
        }
        return formData
      })
      return formDatas
    },
    prepararUploadMediaWABA() {
      if (!this.arquivos.length) {
        throw new Error(this.$t("atendimentoInputScript.noFilesToSend"));
      }
      const formDatas = this.arquivos.map(media => {
        const formData = new FormData()
        const normalizedFileName = media.name.replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
        formData.append('fromMe', true)
        formData.append('medias', media, normalizedFileName)
        formData.append('body', media.name)
        formData.append('idFront', uid())
        formData.append('tokenApi', this.ticketFocado.whatsapp.tokenAPI)
        formData.append('from', this.ticketFocado.contact.number)
        formData.append('ticketId', this.ticketFocado.id)
        formData.append('quotedMsg', this.replyingMessage?.messageId)
        if (this.isScheduleDate) {
          formData.append('scheduleDate', this.scheduleDate)
        }
        return formData
      })
      return formDatas
    },
    prepararUploadMediaInstagram() {
      if (!this.arquivos.length) {
        throw new Error(this.$t("atendimentoInputScript.noFilesToSend"));
      }
      const formDatas = this.arquivos.map(media => {
        const formData = new FormData()
        const normalizedFileName = media.name.replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
        formData.append('fromMe', true)
        formData.append('medias', media, normalizedFileName)
        formData.append('body', media.name)
        formData.append('idFront', uid())
        formData.append('tokenApi', this.ticketFocado.whatsapp.tokenAPI || this.ticketFocado.whatsapp.fbPageId)
        formData.append('from', this.ticketFocado.contact.number)
        formData.append('ticketId', this.ticketFocado.id)
        formData.append('quotedMsg', this.replyingMessage?.messageId)
        if (this.isScheduleDate) {
          formData.append('scheduleDate', this.scheduleDate)
        }
        return formData
      })
      return formDatas
    },
    prepararUploadMediaMessenger() {
      if (!this.arquivos.length) {
        throw new Error(this.$t("atendimentoInputScript.noFilesToSend"));
      }
      const formDatas = this.arquivos.map(media => {
        const formData = new FormData()
        const normalizedFileName = media.name.replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
        formData.append('fromMe', true)
        formData.append('medias', media, normalizedFileName)
        formData.append('body', media.name)
        formData.append('idFront', uid())
        formData.append('tokenApi', this.ticketFocado.whatsapp.tokenAPI || this.ticketFocado.whatsapp.fbPageId)
        formData.append('from', this.ticketFocado.contact.number)
        formData.append('ticketId', this.ticketFocado.id)
        formData.append('quotedMsg', this.replyingMessage?.messageId)
        if (this.isScheduleDate) {
          formData.append('scheduleDate', this.scheduleDate)
        }
        return formData
      })
      return formDatas
    },
    prepararMensagemTexto() {
      if (this.textChat.trim() === '' && !this.removeMedia) {
        throw new Error(this.$t("atendimentoInputScript.emptyMessageError"));
      }
      if (this.textChat.trim() && this.textChat.trim().startsWith('/')) {
        let search = this.textChat.trim().toLowerCase()
        search = search.replace('/', '')
        const mensagemRapida = this.cMensagensRapidas.find((m) => m.key.toLowerCase() === search)
        if (mensagemRapida?.message) {
          this.textChat = mensagemRapida.message
        } else {
          const error =
            this.cMensagensRapidas.length > 1
            ? this.$t("atendimentoInputScript.multipleQuickMessagesError")
            : this.$t("atendimentoInputScript.noQuickMessageFoundError");
          this.$notificarErro(error)
          this.loading = false
          throw new Error(error)
        }
      }
      let mensagem = this.textChat.trim()
      const username = localStorage.getItem('username')
      if (username && this.sign) {
        mensagem = `*${username}*:\n ${mensagem}`
      }

      // Remover palavras proibidas
      // const palavrasSuprimidas = [];

      // this.forbiddenWords.forEach(word => {
      //   const regex = new RegExp(word, 'gi');
      //   if (mensagem.match(regex)) {
      //       palavrasSuprimidas.push(word);
      //       mensagem = mensagem.replace(regex, '');
      //   }
      // })

      // if(palavrasSuprimidas.length > 0){
      //   console.log(palavrasSuprimidas)
      //   alert('Palavras suprimidas: ' + palavrasSuprimidas.join(', '));
      // }
      
      const message = {
        read: 1,
        fromMe: true,
        mediaUrl: '',
        body: mensagem,
        scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
        quotedMsg: this.replyingMessage,
        idFront: uid(),
      }
      if (this.isScheduleDate) {
        message.scheduleDate = this.scheduleDate
      }
      return message
    },
    prepararMensagemTextoWABA() {
      if (this.textChat.trim() === '') {
        throw new Error(this.$t("atendimentoInputScript.emptyMessageError"));
      }
      if (this.textChat.trim() && this.textChat.trim().startsWith('/')) {
        let search = this.textChat.trim().toLowerCase()
        search = search.replace('/', '')
        const mensagemRapida = this.cMensagensRapidas.find((m) => m.key.toLowerCase() === search)
        if (mensagemRapida?.message) {
          this.textChat = mensagemRapida.message
        } else {
          const error =
            this.cMensagensRapidas.length > 1
              ? this.$t("atendimentoInputScript.multipleQuickMessagesError")
              : this.$t("atendimentoInputScript.noQuickMessageFoundError");
          this.$notificarErro(error)
          this.loading = false
          throw new Error(error)
        }
      }
      let mensagem = this.textChat.trim()
      const username = localStorage.getItem('username')
      if (username && this.sign) {
        mensagem = `*${username}*:\n ${mensagem}`
      }
      
      // Remover palavras proibidas
      // const palavrasSuprimidas = [];

      // this.forbiddenWords.forEach(word => {
      //   const regex = new RegExp(word, 'gi');
      //   if (mensagem.match(regex)) {
      //       palavrasSuprimidas.push(word);
      //       mensagem = mensagem.replace(regex, '');
      //   }
      // })

      // if(palavrasSuprimidas.length > 0){
      //   console.log(palavrasSuprimidas)
      //   alert('Palavras suprimidas: ' + palavrasSuprimidas.join(', '));
      // }

      const message = {
        read: 1,
        fromMe: true,
        mediaUrl: '',
        body: mensagem,
        scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
        quotedMsg: this.replyingMessage,     
        from: this.ticketFocado.contact.number,
        tokenApi: this.ticketFocado.whatsapp.tokenAPI,
        // tokenApi: this.ticketFocado.channel.tokenApi,
        ticketId: this.ticketFocado.id,
        idFront: uid(),
      }
      if (this.isScheduleDate) {
        message.scheduleDate = this.scheduleDate
      }
      return message
    },
    prepararMensagemTextoInstagram() {
      if (this.textChat.trim() === '') {
        throw new Error(this.$t("atendimentoInputScript.emptyMessageError"));
      }
      if (this.textChat.trim() && this.textChat.trim().startsWith('/')) {
        let search = this.textChat.trim().toLowerCase()
        search = search.replace('/', '')
        const mensagemRapida = this.cMensagensRapidas.find((m) => m.key.toLowerCase() === search)
        if (mensagemRapida?.message) {
          this.textChat = mensagemRapida.message
        } else {
          const error =
            this.cMensagensRapidas.length > 1
              ? this.$t("atendimentoInputScript.multipleQuickMessagesError")
              : this.$t("atendimentoInputScript.noQuickMessageFoundError");
          this.$notificarErro(error)
          this.loading = false
          throw new Error(error)
        }
      }
      let mensagem = this.textChat.trim()
      const username = localStorage.getItem('username')
      if (username && this.sign) {
        mensagem = `*${username}*:\n ${mensagem}`
      }
      
      // Remover palavras proibidas
      // const palavrasSuprimidas = [];

      // this.forbiddenWords.forEach(word => {
      //   const regex = new RegExp(word, 'gi');
      //   if (mensagem.match(regex)) {
      //       palavrasSuprimidas.push(word);
      //       mensagem = mensagem.replace(regex, '');
      //   }
      // })

      // if(palavrasSuprimidas.length > 0){
      //   console.log(palavrasSuprimidas)
      //   alert('Palavras suprimidas: ' + palavrasSuprimidas.join(', '));
      // }

      const message = {
        read: 1,
        fromMe: true,
        mediaUrl: '',
        body: mensagem,
        scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
        quotedMsg: this.replyingMessage,     
        from: this.ticketFocado.contact.number,
        tokenApi: this.ticketFocado.whatsapp.tokenAPI || this.ticketFocado.whatsapp.fbPageId,
        // tokenApi: this.ticketFocado.channel.tokenApi,
        ticketId: this.ticketFocado.id,
        idFront: uid(),
      }
      if (this.isScheduleDate) {
        message.scheduleDate = this.scheduleDate
      }
      return message
    },
    prepararMensagemTextoMessenger() {
      if (this.textChat.trim() === '') {
        throw new Error(this.$t("atendimentoInputScript.emptyMessageError"));
      }
      if (this.textChat.trim() && this.textChat.trim().startsWith('/')) {
        let search = this.textChat.trim().toLowerCase()
        search = search.replace('/', '')
        const mensagemRapida = this.cMensagensRapidas.find((m) => m.key.toLowerCase() === search)
        if (mensagemRapida?.message) {
          this.textChat = mensagemRapida.message
        } else {
          const error =
            this.cMensagensRapidas.length > 1
              ? this.$t("atendimentoInputScript.multipleQuickMessagesError")
              : this.$t("atendimentoInputScript.noQuickMessageFoundError");
          this.$notificarErro(error)
          this.loading = false
          throw new Error(error)
        }
      }
      let mensagem = this.textChat.trim()
      const username = localStorage.getItem('username')
      if (username && this.sign) {
        mensagem = `*${username}*:\n ${mensagem}`
      }
      
      // Remover palavras proibidas
      // const palavrasSuprimidas = [];

      // this.forbiddenWords.forEach(word => {
      //   const regex = new RegExp(word, 'gi');
      //   if (mensagem.match(regex)) {
      //       palavrasSuprimidas.push(word);
      //       mensagem = mensagem.replace(regex, '');
      //   }
      // })

      // if(palavrasSuprimidas.length > 0){
      //   console.log(palavrasSuprimidas)
      //   alert('Palavras suprimidas: ' + palavrasSuprimidas.join(', '));
      // }

      const message = {
        read: 1,
        fromMe: true,
        mediaUrl: '',
        body: mensagem,
        scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
        quotedMsg: this.replyingMessage,     
        from: this.ticketFocado.contact.number,
        tokenApi: this.ticketFocado.whatsapp.tokenAPI || this.ticketFocado.whatsapp.fbPageId,
        // tokenApi: this.ticketFocado.channel.tokenApi,
        ticketId: this.ticketFocado.id,
        idFront: uid(),
      }
      if (this.isScheduleDate) {
        message.scheduleDate = this.scheduleDate
      }
      return message
    },
    validaMensagem(val) {
      return val.length >= 1 && val.length <= 60 || this.$t('atendimentoInputScript.messageValidationError');
    },
    validaBotao(val) {
      return val.length <= 20 || this.$t('atendimentoInputScript.buttonValidationError');
    },
    async enviarBotoes(){
      if (this.validaMensagem(this.mensagemBotao) !== true) {
        this.$q.notify({
          message: this.$t('atendimentoInputScript.messageValidationError'),
          color: 'negative',
        });
        return;
      }

      const botoes = [this.botao1, this.botao2, this.botao3];
      if (botoes.some((botao) => this.validaBotao(botao) !== true)) {
        this.$q.notify({
          message: this.$t('atendimentoInputScript.buttonValidationError'),
          color: 'negative',
        });
        return;
      }

      if (new Set(botoes).size !== botoes.length) {
        this.$q.notify({
          message: this.$t('atendimentoInputScript.duplicateButtonError'),
          color: 'negative',
        });
        return;
      }
      this.loading = true
      try{
        let mensagem = this.mensagemBotao.trim()
        const username = localStorage.getItem('username')
        if (username && this.signButtons) {
          mensagem = `*${username}*:\n ${mensagem}`
        }
        const message = {
          read: 1,
          fromMe: true,
          mediaUrl: '',
          body:  mensagem || '',
          button1: this.botao1,
          button2: this.botao2,
          button3: this.botao3,
          scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
          quotedMsg: this.replyingMessage,     
          from: this.ticketFocado.contact.number,
          tokenApi: this.ticketFocado.whatsapp.tokenAPI,
          // tokenApi: this.ticketFocado.channel.tokenApi,
          ticketId: this.ticketFocado.id,
          idFront: uid(),
        }
        if (this.body === "" || this.botao1 === "") {
          this.$q.notify({
            html: true,
            message: this.$t('atendimentoInputScript.dataMessage'),
            type: 'warning',
            progress: true,
            position: 'top',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          return;
        }
        await EnviarBotaoWaba(message)
        this.$emit('update:replyingMessage', null)
        this.abrirFilePicker = false
        this.abrirModalPreviewImagem = false
        this.modalVisivelBotao = false
        const timerId = setTimeout(() => {
          this.scrollToBottom()
        }, 300)
        this.addTimer(timerId)
      } catch (error) {
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } finally {
        this.textChat = ''
        this.botao1 = ''
        this.botao2 = ''
        this.botao3 = ''
        this.isRecordingAudio = false
        localStorage.setItem('recording', false);
        this.loading = false
        const timerId = setTimeout(() => {
          this.$refs.inputEnvioMensagem?.focus()
        }, 300)
        this.addTimer(timerId)
        return;
      }
    },
    async enviarListas(){
      this.loading = true
      try{
        let mensagem = this.mensagemLista.trim()
        const username = localStorage.getItem('username')
        if (username && this.signLists) {
          mensagem = `*${username}*:\n ${mensagem}`
        }
        const message = {
          read: 1,
          fromMe: true,
          mediaUrl: '',
          body: mensagem || '',
          header: this.header || '',
          footer: this.footer || '',
          button_text: this. button_text || '',
          // sections: [this.sectionTitle, this.rowTitle1, this.rowDescription1, this.rowTitle2, this.rowDescription2, this.rowTitle3, this.rowDescription3, this.rowTitle4, this.rowDescription4, this.rowTitle5, this.rowDescription5],
          sectionTitle: this.sectionTitle,
          rowTitle1: this.rowTitle1 || '',
          rowDescription1: this.rowDescription1 || '',
          rowTitle2: this.rowTitle2 || '',
          rowDescription2: this.rowDescription2 || '',
          rowTitle3: this.rowTitle3 || '',
          rowDescription3: this.rowDescription3 || '',
          rowTitle4: this.rowTitle4 || '',
          rowDescription4: this.rowDescription4 || '',
          rowTitle5: this.rowTitle5 || '',
          rowDescription5: this.rowDescription5 || '',
          scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
          quotedMsg: this.replyingMessage,     
          from: this.ticketFocado.contact.number,
          tokenApi: this.ticketFocado.whatsapp.tokenAPI,
          // tokenApi: this.ticketFocado.channel.tokenApi,
          ticketId: this.ticketFocado.id,
          idFront: uid(),
        }
        if (this.body === "" || this.header === "" || this.footer === ""  || this.button_text === "" ) {
          this.$q.notify({
            html: true,
            message: this.$t('atendimentoInputScript.dataMessage'),
            type: 'warning',
            progress: true,
            position: 'top',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          return;
        }
        await EnviarListaWaba(message)
        this.$emit('update:replyingMessage', null)
        this.abrirFilePicker = false
        this.abrirModalPreviewImagem = false
        this.modalVisivelLista = false
        const timerId = setTimeout(() => {
          this.scrollToBottom()
        }, 300)
        this.addTimer(timerId)
      } catch (error) {
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } finally {
        this.mensagemLista = ''
        this.header = ''
        this.footer = ''
        this.sectionTitle = ''
        this.rowTitle1 = ''
        this.rowDescription1 = ''
        this.rowTitle2 = ''
        this.rowDescription2 = ''
        this.rowTitle3 = ''
        this.rowDescription3 = ''
        this.rowTitle4 = ''
        this.rowDescription4 = ''
        this.rowTitle5 = ''
        this.rowDescription5 = ''
        this.button_text = ''
        this.textChat = ''
        this.isRecordingAudio = false
        localStorage.setItem('recording', false);
        this.loading = false
        const timerId = setTimeout(() => {
          this.$refs.inputEnvioMensagem?.focus()
        }, 300)
        this.addTimer(timerId)
        return;
      }
    },
    async enviarCTAURL(){
      this.loading = true
      try{
        let mensagem = this.mensagemCTAURL.trim()
        const username = localStorage.getItem('username')
        if (username && this.signCTAURL) {
          mensagem = `*${username}*:\n ${mensagem}`
        }
        
        const header = this.headerTypeCTAURL === 'text' ? 
          { type: 'text', text: this.headerTextCTAURL } : 
          { type: this.headerTypeCTAURL, link: this.headerLinkCTAURL }

        const message = {
          read: 1,
          fromMe: true,
          body: mensagem || '',
          buttonText: this.buttonTextCTAURL || '',
          buttonURL: this.buttonURLCTAURL || '',
          footer: this.footerCTAURL || '',
          header: this.headerTextCTAURL || this.headerLinkCTAURL ? header : undefined,
          scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
          quotedMsg: this.replyingMessage,     
          from: this.ticketFocado.contact.number,
          tokenApi: this.ticketFocado.whatsapp.tokenAPI,
          ticketId: this.ticketFocado.id,
          idFront: uid(),
        }
        
        if (!this.mensagemCTAURL || !this.buttonTextCTAURL || !this.buttonURLCTAURL) {
          this.$q.notify({
            html: true,
            message: this.$t('atendimentoInputScript.dataMessage'),
            type: 'warning',
            progress: true,
            position: 'top',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          return;
        }
        
        await EnviarCTAURLWaba(message)
        this.$emit('update:replyingMessage', null)
        this.modalVisivelCTAURL = false
        const timerId = setTimeout(() => {
          this.scrollToBottom()
        }, 300)
        this.addTimer(timerId)
      } catch (error) {
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } finally {
        this.loading = false
        const timerId = setTimeout(() => {
          this.$refs.inputEnvioMensagem?.focus()
        }, 300)
        this.addTimer(timerId)
        return;
      }
    },
    async enviarFlow(){
      this.loading = true
      try{
        let mensagem = this.mensagemFlow.trim()
        const username = localStorage.getItem('username')
        if (username && this.signFlow) {
          mensagem = `*${username}*:\n ${mensagem}`
        }
        
        const header = this.headerTypeFlow === 'text' ? 
          { type: 'text', text: this.headerTextFlow } : 
          { type: this.headerTypeFlow, link: this.headerLinkFlow }

        const message = {
          read: 1,
          fromMe: true,
          body: mensagem || '',
          footer: this.footerFlow || '',
          header: this.headerTextFlow || this.headerLinkFlow ? header : undefined,
          flowId: this.flowId || undefined,
          flowName: this.flowName || undefined,
          flowCta: this.flowCta || '',
          flowToken: this.flowToken || undefined,
          flowAction: this.flowAction || 'navigate',
          flowActionPayload: this.flowActionPayload ? JSON.parse(this.flowActionPayload) : undefined,
          scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
          quotedMsg: this.replyingMessage,     
          from: this.ticketFocado.contact.number,
          tokenApi: this.ticketFocado.whatsapp.tokenAPI,
          ticketId: this.ticketFocado.id,
          idFront: uid(),
        }
        
        if (!this.mensagemFlow || !this.flowCta || (!this.flowId && !this.flowName)) {
          this.$q.notify({
            html: true,
            message: this.$t('atendimentoInputScript.dataMessage'),
            type: 'warning',
            progress: true,
            position: 'top',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          return;
        }
        
        await EnviarFlowWaba(message)
        this.$emit('update:replyingMessage', null)
        this.modalVisivelFlow = false
        const timerId = setTimeout(() => {
          this.scrollToBottom()
        }, 300)
        this.addTimer(timerId)
      } catch (error) {
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } finally {
        this.loading = false
        const timerId = setTimeout(() => {
          this.$refs.inputEnvioMensagem?.focus()
        }, 300)
        this.addTimer(timerId)
        return;
      }
    },
    async enviarReplyButtons(){
      this.loading = true
      try{
        let mensagem = this.mensagemReplyButtons.trim()
        const username = localStorage.getItem('username')
        if (username && this.signReplyButtons) {
          mensagem = `*${username}*:\n ${mensagem}`
        }
        
        const header = this.headerTypeReplyButtons === 'text' ? 
          { type: 'text', text: this.headerTextReplyButtons } : 
          { type: this.headerTypeReplyButtons, link: this.headerLinkReplyButtons }

        const buttons = this.buttonsReplyButtons.filter(btn => btn.title.trim())

        const message = {
          read: 1,
          fromMe: true,
          body: mensagem || '',
          footer: this.footerReplyButtons || '',
          header: this.headerTextReplyButtons || this.headerLinkReplyButtons ? header : undefined,
          buttons: buttons,
          scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
          quotedMsg: this.replyingMessage,     
          from: this.ticketFocado.contact.number,
          tokenApi: this.ticketFocado.whatsapp.tokenAPI,
          ticketId: this.ticketFocado.id,
          idFront: uid(),
        }
        
        if (!this.mensagemReplyButtons || buttons.length === 0) {
          this.$q.notify({
            html: true,
            message: this.$t('atendimentoInputScript.dataMessage'),
            type: 'warning',
            progress: true,
            position: 'top',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          return;
        }
        
        await EnviarReplyButtonsWaba(message)
        this.$emit('update:replyingMessage', null)
        this.modalVisivelReplyButtons = false
        const timerId = setTimeout(() => {
          this.scrollToBottom()
        }, 300)
        this.addTimer(timerId)
      } catch (error) {
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } finally {
        this.loading = false
        const timerId = setTimeout(() => {
          this.$refs.inputEnvioMensagem?.focus()
        }, 300)
        this.addTimer(timerId)
        return;
      }
    },
    async enviarAddress(){
      this.loading = true
      try{
        const username = localStorage.getItem('username')
        let mensagem = this.$t('inputMensagem.novo.enderecoEnviado')
        if (username && this.signAddress) {
          mensagem = `*${username}*:\n ${mensagem}`
        }

        const message = {
          read: 1,
          fromMe: true,
          addressData: {
            street_1: this.street1 || '',
            street_2: this.street2 || '',
            city: this.city || '',
            state: this.state || '',
            zip: this.zip || '',
            country: this.country || '',
            type: this.addressType || 'HOME'
          },
          scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
          quotedMsg: this.replyingMessage,     
          from: this.ticketFocado.contact.number,
          tokenApi: this.ticketFocado.whatsapp.tokenAPI,
          ticketId: this.ticketFocado.id,
          idFront: uid(),
        }
        
        if (!this.street1 || !this.city || !this.state || !this.zip || !this.country) {
          this.$q.notify({
            html: true,
            message: this.$t('atendimentoInputScript.dataMessage'),
            type: 'warning',
            progress: true,
            position: 'top',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          return;
        }
        
        await EnviarAddressWaba(message)
        this.$emit('update:replyingMessage', null)
        this.modalVisivelAddress = false
        const timerId = setTimeout(() => {
          this.scrollToBottom()
        }, 300)
        this.addTimer(timerId)
      } catch (error) {
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } finally {
        this.loading = false
        const timerId = setTimeout(() => {
          this.$refs.inputEnvioMensagem?.focus()
        }, 300)
        this.addTimer(timerId)
        return;
      }
    },
    async enviarLocationRequest(){
      this.loading = true
      try{
        let mensagem = this.mensagemLocationRequest.trim()
        const username = localStorage.getItem('username')
        if (username && this.signLocationRequest) {
          mensagem = `*${username}*:\n ${mensagem}`
        }

        const message = {
          read: 1,
          fromMe: true,
          body: mensagem || '',
          scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
          quotedMsg: this.replyingMessage,     
          from: this.ticketFocado.contact.number,
          tokenApi: this.ticketFocado.whatsapp.tokenAPI,
          ticketId: this.ticketFocado.id,
          idFront: uid(),
        }
        
        if (!this.mensagemLocationRequest) {
          this.$q.notify({
            html: true,
            message: this.$t('atendimentoInputScript.dataMessage'),
            type: 'warning',
            progress: true,
            position: 'top',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          return;
        }
        
        await EnviarLocationRequestWaba(message)
        this.$emit('update:replyingMessage', null)
        this.modalVisivelLocationRequest = false
        const timerId = setTimeout(() => {
          this.scrollToBottom()
        }, 300)
        this.addTimer(timerId)
      } catch (error) {
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } finally {
        this.loading = false
        const timerId = setTimeout(() => {
          this.$refs.inputEnvioMensagem?.focus()
        }, 300)
        this.addTimer(timerId)
        return;
      }
    },
    async enviarLocationWaba(){
      console.log('enviarLocation')
      this.loading = true
      try{
        const username = localStorage.getItem('username')
        let mensagem = this.$t('inputMensagem.novo.localizacaoEnviada')
        if (username && this.signLocation) {
          mensagem = `*${username}*:\n ${mensagem}`
        }

        const message = {
          read: 1,
          fromMe: true,
          latitude: parseFloat(this.latitude) || 0,
          longitude: parseFloat(this.longitude) || 0,
          name: this.locationName || undefined,
          address: this.locationAddress || undefined,
          scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
          quotedMsg: this.replyingMessage,     
          from: this.ticketFocado.contact.number,
          tokenApi: this.ticketFocado.whatsapp.tokenAPI,
          ticketId: this.ticketFocado.id,
          idFront: uid(),
        }
        
        if (!this.latitude || !this.longitude) {
          this.$q.notify({
            html: true,
            message: this.$t('atendimentoInputScript.dataMessage'),
            type: 'warning',
            progress: true,
            position: 'top',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          return;
        }
        
        await EnviarLocationWaba(message)
        this.$emit('update:replyingMessage', null)
        this.modalVisivelLocation = false
        const timerId = setTimeout(() => {
          this.scrollToBottom()
        }, 300)
        this.addTimer(timerId)
      } catch (error) {
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } finally {
        this.loading = false
        const timerId = setTimeout(() => {
          this.$refs.inputEnvioMensagem?.focus()
        }, 300)
        this.addTimer(timerId)
        return;
      }
    },
    async enviarMensagem() {
      if(this.loading){
        this.$q.notify({
          message: this.$t("atendimentoInputScript.pendingMessageSended"),
          type: 'positive',
        });
        return
      }
      if(this.ticketFocado.channel.includes('hub')){
        this.loading = true
        const ticketId = this.ticketFocado.id
        try{
          if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'disabled' && this.mensagemRapidaSetada){
            const data = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: this.mensagemRapidaMedia,
              scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
              quotedMsg: this.replyingMessage,     
              from: this.ticketFocado.contact.number,
              tokenApi: this.ticketFocado.whatsapp.tokenAPI,
              // tokenApi: this.ticketFocado.channel.tokenApi,
              ticketId: this.ticketFocado.id,
              mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/fastreply/${this.mensagemRapidaMedia}`,
              mediaDescription: this.mensagemRapidaMedia,
              idFront: uid()
            };
            await EnviarMensagemHub(ticketId, data)
            this.mensagemRapidaSetada = false
          } if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'enabled' && this.mensagemRapidaSetada){
            const data = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: this.mensagemRapidaMedia,
              scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
              quotedMsg: this.replyingMessage,     
              from: this.ticketFocado.contact.number,
              tokenApi: this.ticketFocado.whatsapp.tokenAPI,
              // tokenApi: this.ticketFocado.channel.tokenApi,
              ticketId: this.ticketFocado.id,
              mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/fastreply/${this.mensagemRapidaMedia}`,
              mediaDescription: this.mensagemRapidaMedia,
              idFront: uid()
            };
            await EnviarMensagemHub(ticketId, data)
            this.mensagemRapidaSetada = false
          }
          if(this.cMostrarEnvioArquivo){
            const formDatas = this.prepararUploadMedia()
            for (const formData of formDatas) {
              if(!this.sticker) {
                await EnviarMensagemHub(ticketId, formData)
                this.sticker = false
              } // else if(this.sticker) {
              //   await EnviarStickerWaba(formData)
              //   this.sticker = false
              // }
            }
          }
          else {
            const data = this.prepararMensagemTexto()
            await EnviarMensagemHub(ticketId, data)
          }
          this.arquivos = []
          this.textChat = ''
          this.mensagemRapidaMedia = ''
          this.mensagemRapidaVoz = ''
          this.$emit('update:replyingMessage', null)
          this.abrirFilePicker = false
          this.abrirModalPreviewImagem = false
          const timerId = setTimeout(() => {
            this.scrollToBottom()
          }, 300)
          this.addTimer(timerId)
        } catch (error) {
          this.$notificarErro(this.$t('common.notifications.error'), error)
        } finally {
          this.removeMedia = false
          this.isRecordingAudio = false
          localStorage.setItem('recording', false);
          this.loading = false
          const timerId = setTimeout(() => {
            this.$refs.inputEnvioMensagem?.focus()
          }, 300)
          this.addTimer(timerId)
          return;
        }
      }
      if(this.ticketFocado.channel.includes('meow')){
        this.loading = true
        const ticketId = this.ticketFocado.id
        try{
          if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'disabled' && this.mensagemRapidaSetada){
            const data = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: this.mensagemRapidaMedia,
              scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
              quotedMsg: this.replyingMessage,     
              from: this.ticketFocado.contact.number,
              tokenApi: this.ticketFocado.whatsapp.tokenAPI,
              // tokenApi: this.ticketFocado.channel.tokenApi,
              ticketId: this.ticketFocado.id,
              mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/fastreply/${this.mensagemRapidaMedia}`,
              mediaDescription: this.mensagemRapidaMedia,
              idFront: uid()
            };
            await EnviarMensagemMeow(ticketId, data)
            this.mensagemRapidaSetada = false
          } if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'enabled' && this.mensagemRapidaSetada){
            const data = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: this.mensagemRapidaMedia,
              scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
              quotedMsg: this.replyingMessage,     
              from: this.ticketFocado.contact.number,
              tokenApi: this.ticketFocado.whatsapp.tokenAPI,
              // tokenApi: this.ticketFocado.channel.tokenApi,
              ticketId: this.ticketFocado.id,
              mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/fastreply/${this.mensagemRapidaMedia}`,
              mediaDescription: this.mensagemRapidaMedia,
              idFront: uid()
            };
            await EnviarMensagemMeow(ticketId, data)
            this.mensagemRapidaSetada = false
          }
          if(this.cMostrarEnvioArquivo){
            const formDatas = this.prepararUploadMedia()
            for (const formData of formDatas) {
              if(!this.sticker) {
                await EnviarMensagemMeow(ticketId, formData)
                this.sticker = false
              } else if(this.sticker) {
                await EnviarMensagemMeow(ticketId, formData)
                this.sticker = false
              }
            }
          }
          else {
            const data = this.prepararMensagemTexto()
            await EnviarMensagemMeow(ticketId, data)
          }
          this.arquivos = []
          this.textChat = ''
          this.mensagemRapidaMedia = ''
          this.mensagemRapidaVoz = ''
          this.$emit('update:replyingMessage', null)
          this.abrirFilePicker = false
          this.abrirModalPreviewImagem = false
          const timerId = setTimeout(() => {
            this.scrollToBottom()
          }, 300)
          this.addTimer(timerId)
        } catch (error) {
          this.$notificarErro(this.$t('common.notifications.error'), error)
        } finally {
          this.removeMedia = false
          this.isRecordingAudio = false
          localStorage.setItem('recording', false);
          this.loading = false
          const timerId = setTimeout(() => {
            this.$refs.inputEnvioMensagem?.focus()
          }, 300)
          this.addTimer(timerId)
          return;
        }
      }
      if(this.ticketFocado.channel.includes('evo')){
        this.loading = true
        const ticketId = this.ticketFocado.id
        try{
          if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'disabled' && this.mensagemRapidaSetada){
            const data = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: this.mensagemRapidaMedia,
              scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
              quotedMsg: this.replyingMessage,     
              from: this.ticketFocado.contact.number,
              tokenApi: this.ticketFocado.whatsapp.tokenAPI,
              // tokenApi: this.ticketFocado.channel.tokenApi,
              ticketId: this.ticketFocado.id,
              mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/fastreply/${this.mensagemRapidaMedia}`,
              mediaDescription: this.mensagemRapidaMedia,
              idFront: uid()
            };
            await EnviarMensagemEvo(ticketId, data)
            this.mensagemRapidaSetada = false
          } if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'enabled' && this.mensagemRapidaSetada){
            const data = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: this.mensagemRapidaMedia,
              scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
              quotedMsg: this.replyingMessage,     
              from: this.ticketFocado.contact.number,
              tokenApi: this.ticketFocado.whatsapp.tokenAPI,
              // tokenApi: this.ticketFocado.channel.tokenApi,
              ticketId: this.ticketFocado.id,
              mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/fastreply/${this.mensagemRapidaMedia}`,
              mediaDescription: this.mensagemRapidaMedia,
              idFront: uid()
            };
            await EnviarMensagemEvo(ticketId, data)
            this.mensagemRapidaSetada = false
          }
          if(this.cMostrarEnvioArquivo){
            const formDatas = this.prepararUploadMedia()
            for (const formData of formDatas) {
              if(!this.sticker) {
                await EnviarMensagemEvo(ticketId, formData)
                this.sticker = false
              } else if(this.sticker) {
                await EnviarMensagemEvo(ticketId, formData)
                this.sticker = false
              }
            }
          }
          else {
            const data = this.prepararMensagemTexto()
            await EnviarMensagemEvo(ticketId, data)
          }
          this.arquivos = []
          this.textChat = ''
          this.mensagemRapidaMedia = ''
          this.mensagemRapidaVoz = ''
          this.$emit('update:replyingMessage', null)
          this.abrirFilePicker = false
          this.abrirModalPreviewImagem = false
          const timerId = setTimeout(() => {
            this.scrollToBottom()
          }, 300)
          this.addTimer(timerId)
        } catch (error) {
          this.$notificarErro(this.$t('common.notifications.error'), error)
        } finally {
          this.removeMedia = false
          this.isRecordingAudio = false
          localStorage.setItem('recording', false);
          this.loading = false
          const timerId = setTimeout(() => {
            this.$refs.inputEnvioMensagem?.focus()
          }, 300)
          this.addTimer(timerId)
          return;
        }
      }
      if(this.ticketFocado.channel === 'uazapi'){
        this.loading = true
        const ticketId = this.ticketFocado.id
        try{
          if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'disabled' && this.mensagemRapidaSetada){
            const data = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: this.mensagemRapidaMedia,
              scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
              quotedMsg: this.replyingMessage,     
              from: this.ticketFocado.contact.number,
              tokenApi: this.ticketFocado.whatsapp.tokenAPI,
              // tokenApi: this.ticketFocado.channel.tokenApi,
              ticketId: this.ticketFocado.id,
              mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/fastreply/${this.mensagemRapidaMedia}`,
              mediaDescription: this.mensagemRapidaMedia,
              idFront: uid()
            };
            await EnviarMensagemUazapi(ticketId, data)
            this.mensagemRapidaSetada = false
          } if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'enabled' && this.mensagemRapidaSetada){
            const data = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: this.mensagemRapidaMedia,
              scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
              quotedMsg: this.replyingMessage,     
              from: this.ticketFocado.contact.number,
              tokenApi: this.ticketFocado.whatsapp.tokenAPI,
              // tokenApi: this.ticketFocado.channel.tokenApi,
              ticketId: this.ticketFocado.id,
              mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/fastreply/${this.mensagemRapidaMedia}`,
              mediaDescription: this.mensagemRapidaMedia,
              idFront: uid()
            };
            await EnviarMensagemUazapi(ticketId, data)
            this.mensagemRapidaSetada = false
          }
          if(this.cMostrarEnvioArquivo){
            const formDatas = this.prepararUploadMedia()
            for (const formData of formDatas) {
              if(!this.sticker) {
                await EnviarMensagemUazapi(ticketId, formData)
                this.sticker = false
              } else if(this.sticker) {
                await EnviarMensagemUazapi(ticketId, formData)
                this.sticker = false
              }
            }
          }
          else {
            const data = this.prepararMensagemTexto()
            await EnviarMensagemUazapi(ticketId, data)
          }
          this.arquivos = []
          this.textChat = ''
          this.mensagemRapidaMedia = ''
          this.mensagemRapidaVoz = ''
          this.$emit('update:replyingMessage', null)
          this.abrirFilePicker = false
          this.abrirModalPreviewImagem = false
          const timerId = setTimeout(() => {
            this.scrollToBottom()
          }, 300)
          this.addTimer(timerId)
        } catch (error) {
          this.$notificarErro(this.$t('common.notifications.error'), error)
        } finally {
          this.removeMedia = false
          this.isRecordingAudio = false
          localStorage.setItem('recording', false);
          this.loading = false
          const timerId = setTimeout(() => {
            this.$refs.inputEnvioMensagem?.focus()
          }, 300)
          this.addTimer(timerId)
          return;
        }
      }
      if(this.ticketFocado.channel === 'zapi'){
        this.loading = true
        const ticketId = this.ticketFocado.id
        try{
          if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'disabled' && this.mensagemRapidaSetada){
            const data = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: this.mensagemRapidaMedia,
              scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
              quotedMsg: this.replyingMessage,     
              from: this.ticketFocado.contact.number,
              tokenApi: this.ticketFocado.whatsapp.tokenAPI,
              // tokenApi: this.ticketFocado.channel.tokenApi,
              ticketId: this.ticketFocado.id,
              mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/fastreply/${this.mensagemRapidaMedia}`,
              mediaDescription: this.mensagemRapidaMedia,
              idFront: uid()
            };
            await EnviarMensagemZapi(ticketId, data)
            this.mensagemRapidaSetada = false
          } if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'enabled' && this.mensagemRapidaSetada){
            const data = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: this.mensagemRapidaMedia,
              scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
              quotedMsg: this.replyingMessage,     
              from: this.ticketFocado.contact.number,
              tokenApi: this.ticketFocado.whatsapp.tokenAPI,
              // tokenApi: this.ticketFocado.channel.tokenApi,
              ticketId: this.ticketFocado.id,
              mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/fastreply/${this.mensagemRapidaMedia}`,
              mediaDescription: this.mensagemRapidaMedia,
              idFront: uid()
            };
            await EnviarMensagemZapi(ticketId, data)
            this.mensagemRapidaSetada = false
          }
          if(this.cMostrarEnvioArquivo){
            const formDatas = this.prepararUploadMedia()
            for (const formData of formDatas) {
              if(!this.sticker) {
                await EnviarMensagemZapi(ticketId, formData)
                this.sticker = false
              } else if(this.sticker) {
                await EnviarMensagemZapi(ticketId, formData)
                this.sticker = false
              }
            }
          }
          else {
            const data = this.prepararMensagemTexto()
            await EnviarMensagemZapi(ticketId, data)
          }
          this.arquivos = []
          this.textChat = ''
          this.mensagemRapidaMedia = ''
          this.mensagemRapidaVoz = ''
          this.$emit('update:replyingMessage', null)
          this.abrirFilePicker = false
          this.abrirModalPreviewImagem = false
          const timerId = setTimeout(() => {
            this.scrollToBottom()
          }, 300)
          this.addTimer(timerId)
        } catch (error) {
          this.$notificarErro(this.$t('common.notifications.error'), error)
        } finally {
          this.removeMedia = false
          this.isRecordingAudio = false
          localStorage.setItem('recording', false);
          this.loading = false
          const timerId = setTimeout(() => {
            this.$refs.inputEnvioMensagem?.focus()
          }, 300)
          this.addTimer(timerId)
          return;
        }
      }
      if(this.ticketFocado.channel === 'webchat'){
        this.loading = true
        const ticketId = this.ticketFocado.id
        try{
          if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'disabled' && this.mensagemRapidaSetada){
            const data = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: this.mensagemRapidaMedia,
              scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
              quotedMsg: this.replyingMessage,     
              from: this.ticketFocado.contact.number,
              tokenApi: this.ticketFocado.whatsapp.tokenAPI,
              // tokenApi: this.ticketFocado.channel.tokenApi,
              ticketId: this.ticketFocado.id,
              mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/fastreply/${this.mensagemRapidaMedia}`,
              mediaDescription: this.mensagemRapidaMedia,
              idFront: uid()
            };
            await EnviarMensagemWebChat(ticketId, data)
            this.mensagemRapidaSetada = false
          } if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'enabled' && this.mensagemRapidaSetada){
            const data = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: this.mensagemRapidaMedia,
              scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
              quotedMsg: this.replyingMessage,     
              from: this.ticketFocado.contact.number,
              tokenApi: this.ticketFocado.whatsapp.tokenAPI,
              // tokenApi: this.ticketFocado.channel.tokenApi,
              ticketId: this.ticketFocado.id,
              mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/fastreply/${this.mensagemRapidaMedia}`,
              mediaDescription: this.mensagemRapidaMedia,
              idFront: uid()
            };
            await EnviarMensagemWebChat(ticketId, data)
            this.mensagemRapidaSetada = false
          }
          if(this.cMostrarEnvioArquivo){
            const formDatas = this.prepararUploadMedia()
            for (const formData of formDatas) {
              if(!this.sticker) {
                await EnviarMensagemWebChat(ticketId, formData)
                this.sticker = false
              } else if(this.sticker) {
                await EnviarMensagemWebChat(ticketId, formData)
                this.sticker = false
              }
            }
          } else {
            const data = this.prepararMensagemTexto()
            await EnviarMensagemWebChat(ticketId, data)
          }
          this.arquivos = []
          this.textChat = ''
          this.mensagemRapidaMedia = ''
          this.mensagemRapidaVoz = ''
          this.$emit('update:replyingMessage', null)
          this.abrirFilePicker = false
          this.abrirModalPreviewImagem = false
          const timerId = setTimeout(() => {
            this.scrollToBottom()
          }, 300)
          this.addTimer(timerId)
        } catch(e){
          this.$notificarErro(this.$t('common.notifications.error'), e)
        }
        finally {
          this.removeMedia = false
          this.isRecordingAudio = false
          localStorage.setItem('recording', false);
          this.loading = false
          const timerId = setTimeout(() => {
            this.$refs.inputEnvioMensagem?.focus()
          }, 300)
          this.addTimer(timerId)
          return;
        }
      }
      if(this.ticketFocado.channel === 'waba'){
        this.loading = true
        try{
          if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'disabled' && this.mensagemRapidaSetada){
            const data = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: this.mensagemRapidaMedia,
              scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
              quotedMsg: this.replyingMessage,     
              from: this.ticketFocado.contact.number,
              tokenApi: this.ticketFocado.whatsapp.tokenAPI,
              // tokenApi: this.ticketFocado.channel.tokenApi,
              ticketId: this.ticketFocado.id,
              mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/fastreply/${this.mensagemRapidaMedia}`,
              mediaDescription: this.mensagemRapidaMedia,
              idFront: uid()
            };
            await EnviarArquivoUrlWaba(data)
            this.mensagemRapidaSetada = false
          } if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'enabled' && this.mensagemRapidaSetada){
            const data = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: this.mensagemRapidaMedia,
              scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
              quotedMsg: this.replyingMessage,     
              from: this.ticketFocado.contact.number,
              tokenApi: this.ticketFocado.whatsapp.tokenAPI,
              // tokenApi: this.ticketFocado.channel.tokenApi,
              ticketId: this.ticketFocado.id,
              mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/fastreply/${this.mensagemRapidaMedia}`,
              mediaDescription: this.mensagemRapidaMedia,
              idFront: uid()
            };
            await EnviarArquivoUrlWaba(data)
            this.mensagemRapidaSetada = false
          }
          if(this.cMostrarEnvioArquivo){
            const formDatas = this.prepararUploadMediaWABA()
            for (const formData of formDatas) {
              if(!this.sticker) {
                await EnviarArquivoWaba(formData)
                this.sticker = false
              } else if(this.sticker) {
                await EnviarStickerWaba(formData)
                this.sticker = false
              }
            }
          }
          else {
            const data = this.prepararMensagemTextoWABA()
            await EnviarTextoWaba(data)
          }
          this.arquivos = []
          this.textChat = ''
          this.mensagemRapidaMedia = ''
          this.mensagemRapidaVoz = ''
          this.$emit('update:replyingMessage', null)
          this.abrirFilePicker = false
          this.abrirModalPreviewImagem = false
          setTimeout(() => {
            this.scrollToBottom()
          }, 300)
        } catch (error) {
          this.$notificarErro(this.$t('common.notifications.error'), error)
        } finally {
          this.removeMedia = false
          this.isRecordingAudio = false
          localStorage.setItem('recording', false);
          this.loading = false
          setTimeout(() => {
            this.$refs.inputEnvioMensagem?.focus()
          }, 300)
          return;
        }
      }
      if(this.ticketFocado.channel === 'instagram'){
        this.loading = true
        try{
          if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'disabled' && this.mensagemRapidaSetada){
            const data = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: this.mensagemRapidaMedia,
              scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
              quotedMsg: this.replyingMessage,     
              from: this.ticketFocado.contact.number,
              tokenApi: this.ticketFocado.whatsapp.tokenAPI,
              // tokenApi: this.ticketFocado.channel.tokenApi,
              ticketId: this.ticketFocado.id,
              mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/fastreply/${this.mensagemRapidaMedia}`,
              mediaDescription: this.mensagemRapidaMedia,
              idFront: uid()
            };
            await EnviarArquivoUrlInstagram(data)
            this.mensagemRapidaSetada = false
          } if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'enabled' && this.mensagemRapidaSetada){
            const data = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: this.mensagemRapidaMedia,
              scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
              quotedMsg: this.replyingMessage,     
              from: this.ticketFocado.contact.number,
              tokenApi: this.ticketFocado.whatsapp.tokenAPI,
              // tokenApi: this.ticketFocado.channel.tokenApi,
              ticketId: this.ticketFocado.id,
              mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/fastreply/${this.mensagemRapidaMedia}`,
              mediaDescription: this.mensagemRapidaMedia,
              idFront: uid()
            };
            await EnviarArquivoUrlInstagram(data)
            this.mensagemRapidaSetada = false
          }
          if(this.cMostrarEnvioArquivo){
            const formDatas = this.prepararUploadMediaInstagram()
            for (const formData of formDatas) {
              if(!this.sticker) {
                await EnviarArquivoInstagram(formData)
                this.sticker = false
              } else if(this.sticker) {
                await EnviarStickerInstagram(formData)
                this.sticker = false
              }
            }
          }
          else {
            const data = this.prepararMensagemTextoInstagram()
            await EnviarTextoInstagram(data)
          }
          this.arquivos = []
          this.textChat = ''
          this.mensagemRapidaMedia = ''
          this.mensagemRapidaVoz = ''
          this.$emit('update:replyingMessage', null)
          this.abrirFilePicker = false
          this.abrirModalPreviewImagem = false
          setTimeout(() => {
            this.scrollToBottom()
          }, 300)
        } catch (error) {
          this.$notificarErro(this.$t('common.notifications.error'), error)
        } finally {
          this.removeMedia = false
          this.isRecordingAudio = false
          localStorage.setItem('recording', false);
          this.loading = false
          setTimeout(() => {
            this.$refs.inputEnvioMensagem?.focus()
          }, 300)
          return;
        }
      }
      if(this.ticketFocado.channel === 'messenger'){
        this.loading = true
        try{
          if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'disabled' && this.mensagemRapidaSetada){
            const data = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: this.mensagemRapidaMedia,
              scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
              quotedMsg: this.replyingMessage,     
              from: this.ticketFocado.contact.number,
              tokenApi: this.ticketFocado.whatsapp.tokenAPI,
              // tokenApi: this.ticketFocado.channel.tokenApi,
              ticketId: this.ticketFocado.id,
              mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/fastreply/${this.mensagemRapidaMedia}`,
              mediaDescription: this.mensagemRapidaMedia,
              idFront: uid()
            };
            await EnviarArquivoUrlMessenger(data)
            this.mensagemRapidaSetada = false
          } if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'enabled' && this.mensagemRapidaSetada){
            const data = {
              read: 1,
              fromMe: true,
              mediaUrl: '',
              body: this.mensagemRapidaMedia,
              scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
              quotedMsg: this.replyingMessage,     
              from: this.ticketFocado.contact.number,
              tokenApi: this.ticketFocado.whatsapp.tokenAPI,
              // tokenApi: this.ticketFocado.channel.tokenApi,
              ticketId: this.ticketFocado.id,
              mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/fastreply/${this.mensagemRapidaMedia}`,
              mediaDescription: this.mensagemRapidaMedia,
              idFront: uid()
            };
            await EnviarArquivoUrlMessenger(data)
            this.mensagemRapidaSetada = false
          }
          if(this.cMostrarEnvioArquivo){
            const formDatas = this.prepararUploadMediaMessenger()
            for (const formData of formDatas) {
              if(!this.sticker) {
                await EnviarArquivoMessenger(formData)
                this.sticker = false
              } else if(this.sticker) {
                await EnviarStickerMessenger(formData)
                this.sticker = false
              }
            }
          }
          else {
            const data = this.prepararMensagemTextoMessenger()
            await EnviarTextoMessenger(data)
          }
          this.arquivos = []
          this.textChat = ''
          this.mensagemRapidaMedia = ''
          this.mensagemRapidaVoz = ''
          this.$emit('update:replyingMessage', null)
          this.abrirFilePicker = false
          this.abrirModalPreviewImagem = false
          setTimeout(() => {
            this.scrollToBottom()
          }, 300)
        } catch (error) {
          this.$notificarErro(this.$t('common.notifications.error'), error)
        } finally {
          this.removeMedia = false
          this.isRecordingAudio = false
          localStorage.setItem('recording', false);
          this.loading = false
          setTimeout(() => {
            this.$refs.inputEnvioMensagem?.focus()
          }, 300)
          return;
        }
      }
      if (this.isScheduleDate && !this.scheduleDate) {
        this.$notificarErro(this.$t('atendimentoInputScript.scheduleError'))
        return
      }
      this.loading = true
      const ticketId = this.ticketFocado.id
      try {
        if (!this.cMostrarEnvioArquivo) {
          const message = this.prepararMensagemTexto()
          if (this.editMessage) {
            const { data } = await EditarMensagemText(this.editMessage.id, message)
            this.$emit('onEditMessage', data)
          } else {
            if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'disabled' && this.mensagemRapidaSetada){
              const data = {
                ticketId: this.ticketFocado.id,
                whatsappId: this.ticketFocado.whatsappId,
                whatsappType: this.ticketFocado.channel,
                arrayNumbers: [this.ticketFocado.contact.number],
                min: 1,
                max: 2,
                groups: this.ticketFocado.contact.isGroup,
                media: true,
                mediaUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/fastreply/${this.mensagemRapidaMedia}`,
                mediaDescription: ''
              };
              await Texto(data)
              this.mensagemRapidaSetada = false
            } if(this.mensagemRapidaMedia && this.mensagemRapidaVoz === 'enabled' && this.mensagemRapidaSetada){
              const data = {
                ticketId: this.ticketFocado.id,
                whatsappId: this.ticketFocado.whatsappId,
                whatsappType: this.ticketFocado.channel,
                arrayNumbers: [this.ticketFocado.contact.number],
                min: 1,
                max: 2,
                groups: this.ticketFocado.contact.isGroup,
                voice: true,
                voiceUrl: `${process.env.URL_API}/public/${this.usuario.tenantId}/fastreply/${this.mensagemRapidaMedia}`,
              }
              await Texto(data)
              this.mensagemRapidaSetada = false
            }
            //if(!this.removeMedia){
              const message = this.prepararMensagemTexto()
              if (this.semRedis === 'enabled'){
                if(!message.scheduleDate && (this.ticketFocado.channel === 'whatsapp' || this.ticketFocado.channel === 'baileys') ){
                  const data = {
                    whatsappId: this.ticketFocado.whatsappId,
                    whatsappType: this.ticketFocado.channel,
                    number: this.ticketFocado.contact.number,
                    message: message, 
                    sticker: false, 
                    voice: false, 
                    ticket: this.ticketFocado,
                    group: this.ticketFocado.isGroup,
                    quotedMsg: this.replyingMessage
                  }
                  await NoRedis(data)
                } else if(message.scheduleDate || (this.ticketFocado.channel !== 'whatsapp' && this.ticketFocado.channel !== 'baileys')){
                  await EnviarMensagemTexto(ticketId, message)
                }
              } if (this.semRedis === 'disabled'){
                await EnviarMensagemTexto(ticketId, message)
              }
            //}
          }
        } else {
          const formDatas = this.prepararUploadMedia()
          for (const formData of formDatas) {
            const sched = formData.get('scheduleDate')
            if (this.semRedis === 'enabled'){
              if (!sched && (this.ticketFocado.channel === 'whatsapp' || this.ticketFocado.channel === 'baileys')){
                formData.append('whatsappId', this.ticketFocado.whatsappId);
                formData.append('whatsappType', this.ticketFocado.channel);
                formData.append('number', this.ticketFocado.contact.number);
                formData.append('message', null); 
                formData.append('file', true);
                formData.append('voice', false);
                formData.append('group', this.ticketFocado.isGroup);
                formData.append('ticket', JSON.stringify(this.ticketFocado)); 
                await NoRedis(formData)
              } else if(sched || (this.ticketFocado.channel !== 'whatsapp' && this.ticketFocado.channel !== 'baileys')){
                await EnviarMensagemTexto(ticketId, formData)
              }
            } else if (this.semRedis === 'disabled'){
              await EnviarMensagemTexto(ticketId, formData)
            }
          }
        }
        this.arquivos = []
        this.textChat = ''
        this.mensagemRapidaMedia = ''
        this.mensagemRapidaVoz = ''
        this.$emit('update:replyingMessage', null)
        this.abrirFilePicker = false
        this.abrirModalPreviewImagem = false
        setTimeout(() => {
          this.scrollToBottom()
        }, 300)
      } catch (error) {
        this.$notificarErro(this.$t('common.notifications.error'), error)
      } finally {
        this.visualizarMensagensRapidas = false
        this.removeMedia = false
        this.isRecordingAudio = false
        this.loading = false
        setTimeout(() => {
          this.$refs.inputEnvioMensagem?.focus()
        }, 300)
      }
    },
    async enviarAnexo() {

      if (!this.arquivoAnexo) {
        this.$q.notify({
          message: this.$t('inputMensagem.labels.selecioneArquivo'),
          type: 'negative',
        });
        return;
      }

      // Aplicar assinatura no caption se estiver ativada
      let captionComAssinatura = this.captionAnexo;
      const username = localStorage.getItem('username');
      if (username && this.signAttachment && this.captionAnexo) {
        captionComAssinatura = `*${username}*:\n ${this.captionAnexo}`;
      }

      if(this.ticketFocado.channel === 'waba'){
        const formData = new FormData()
        const normalizedFileName = this.arquivoAnexo.name.replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
        formData.append('fromMe', true)
        formData.append('medias', this.arquivoAnexo, normalizedFileName)
        formData.append('body', this.arquivoAnexo.name)
        formData.append('idFront', uid())
        formData.append('tokenApi', this.ticketFocado.whatsapp.tokenAPI)
        formData.append('from', this.ticketFocado.contact.number)
        formData.append('ticketId', this.ticketFocado.id)
        formData.append('quotedMsg', this.replyingMessage?.messageId)
        formData.append('caption', captionComAssinatura)
        if (this.isScheduleDate) {
          formData.append('scheduleDate', this.scheduleDate)
        }
        this.loading = true
        try {
          await EnviarArquivoWaba(formData)

          this.$q.notify({
            message: this.$t('inputMensagem.labels.anexoEnviado'),
            type: 'positive',
          });

          this.dialogAnexo = false;
          this.arquivoAnexo = null;
          this.captionAnexo = '';
          this.previewUrl = null;
          this.isImage = false;
          this.isVideo = false;
          this.isPdf = false;
          this.arquivos = []
          this.textChat = ''
          this.mensagemRapidaMedia = ''
          this.mensagemRapidaVoz = ''
          this.$emit('update:replyingMessage', null)
          this.abrirFilePicker = false
          this.abrirModalPreviewImagem = false
          this.loading = false
          this.signAttachment = true; // Resetar assinatura para ativada por padrão
          setTimeout(() => {
            this.scrollToBottom()
          }, 300)
        } catch (error) {
          this.loading = false
          this.$q.notify({
            message: this.$t('inputMensagem.labels.erroAnexar'),
            type: 'negative',
          });
        }

        return
      }

      if(this.ticketFocado.channel === 'instagram'){
        const formData = new FormData()
        const normalizedFileName = this.arquivoAnexo.name.replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
        formData.append('fromMe', true)
        formData.append('medias', this.arquivoAnexo, normalizedFileName)
        formData.append('body', this.arquivoAnexo.name)
        formData.append('idFront', uid())
        formData.append('tokenApi', this.ticketFocado.whatsapp.tokenAPI)
        formData.append('from', this.ticketFocado.contact.number)
        formData.append('ticketId', this.ticketFocado.id)
        formData.append('quotedMsg', this.replyingMessage?.messageId)
        formData.append('caption', captionComAssinatura)
        if (this.isScheduleDate) {
          formData.append('scheduleDate', this.scheduleDate)
        }
        this.loading = true
        try {
          await EnviarArquivoInstagram(formData)

          this.$q.notify({
            message: this.$t('inputMensagem.labels.anexoEnviado'),
            type: 'positive',
          });

          this.dialogAnexo = false;
          this.arquivoAnexo = null;
          this.captionAnexo = '';
          this.previewUrl = null;
          this.isImage = false;
          this.isVideo = false;
          this.isPdf = false;
          this.arquivos = []
          this.textChat = ''
          this.mensagemRapidaMedia = ''
          this.mensagemRapidaVoz = ''
          this.$emit('update:replyingMessage', null)
          this.abrirFilePicker = false
          this.abrirModalPreviewImagem = false
          this.loading = false
          this.signAttachment = true; // Resetar assinatura para ativada por padrão
          setTimeout(() => {
            this.scrollToBottom()
          }, 300)
        } catch (error) {
          this.loading = false
          this.$q.notify({
            message: this.$t('inputMensagem.labels.erroAnexar'),
            type: 'negative',
          });
        }

        return
      }

      if(this.ticketFocado.channel === 'whatsapp' 
      || this.ticketFocado.channel === 'baileys' 
      || this.ticketFocado.channel === 'evo'
      || this.ticketFocado.channel === 'meow'
      || this.ticketFocado.channel === 'hub'
      || this.ticketFocado.channel === 'webchat'
      || this.ticketFocado.channel === 'uazapi'
      || this.ticketFocado.channel === 'zapi'
      ){
        const formData = new FormData();
        const normalizedFileName = this.arquivoAnexo.name.replace(/\s+/g, '_').replace(/[^\w.-]/g, '');
        formData.append('fromMe', true)
        formData.append('medias', this.arquivoAnexo, normalizedFileName)
        formData.append('body', this.arquivoAnexo.name)
        formData.append('idFront', uid())
        formData.append('isSticker', false)
        formData.append('caption', captionComAssinatura);
        formData.append('whatsappId', this.ticketFocado.whatsappId);
        formData.append('whatsappType', this.ticketFocado.channel);
        formData.append('number', this.ticketFocado.contact.number);
        formData.append('message', null); 
        formData.append('file', true);
        formData.append('voice', false);
        formData.append('group', this.ticketFocado.isGroup);
        formData.append('ticket', JSON.stringify(this.ticketFocado)); 
        if (this.isScheduleDate) {
          formData.append('scheduleDate', this.scheduleDate)
        }
        this.loading = true
        try {
          const ticketId = this.ticketFocado.id
          if(this.ticketFocado.channel === 'evo'){
            await EnviarMensagemEvo(ticketId, formData)
          } else if(this.ticketFocado.channel === 'meow'){
            await EnviarMensagemMeow(ticketId, formData)
          } else if(this.ticketFocado.channel === 'zapi'){
            await EnviarMensagemZapi(ticketId, formData)
          } else if(this.ticketFocado.channel === 'uazapi'){
            await EnviarMensagemUazapi(ticketId, formData)
          } else if(this.ticketFocado.channel === 'hub'){
            await EnviarMensagemHub(ticketId, formData)
          } else if(this.ticketFocado.channel === 'webchat'){
            await EnviarMensagemWebChat(ticketId, formData)
          } else {
            await NoRedis(formData)
          }

          this.$q.notify({
            message: this.$t('inputMensagem.labels.anexoEnviado'),
            type: 'positive',
          });

          this.dialogAnexo = false;
          this.arquivoAnexo = null;
          this.captionAnexo = '';
          this.previewUrl = null;
          this.isImage = false;
          this.isVideo = false;
          this.isPdf = false;
          this.arquivos = []
          this.textChat = ''
          this.mensagemRapidaMedia = ''
          this.mensagemRapidaVoz = ''
          this.$emit('update:replyingMessage', null)
          this.abrirFilePicker = false
          this.abrirModalPreviewImagem = false
          this.loading = false
          this.signAttachment = true; // Resetar assinatura para ativada por padrão
          setTimeout(() => {
            this.scrollToBottom()
          }, 300)
        } catch (error) {
          this.loading = false
          this.$q.notify({
            message: this.$t('inputMensagem.labels.erroAnexar'),
            type: 'negative',
          });
        }
      }

    },
    async handlSendLinkVideo() {
      const link = `https://meet.jit.si/${uid()}/${uid()}`
      let mensagem = link
      const username = localStorage.getItem('username')
      if (username && this.sign) {
        mensagem = `*${username}*:\n ${mensagem}`
      }
      const message = {
        read: 1,
        fromMe: true,
        mediaUrl: '',
        body: mensagem,
        scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
        quotedMsg: this.replyingMessage,
        idFront: uid(),
      }

      this.loading = true
      const ticketId = this.ticketFocado.id
      try {
        if(this.ticketFocado.channel !== 'waba'){
          if (this.semRedis === 'enabled'){
            if(!message.scheduleDate && (this.ticketFocado.channel === 'whatsapp' || this.ticketFocado.channel === 'baileys') ){
              const data = {
                whatsappId: this.ticketFocado.whatsappId,
                whatsappType: this.ticketFocado.channel,
                number: this.ticketFocado.contact.number,
                message: message, 
                sticker: false, 
                voice: false, 
                ticket: this.ticketFocado,
                group: this.ticketFocado.isGroup
              }
              await NoRedis(data)
            } else if(message.scheduleDate || (this.ticketFocado.channel !== 'whatsapp' && this.ticketFocado.channel !== 'baileys')){
              await EnviarMensagemTexto(ticketId, message)
            }
          } else if (this.semRedis === 'disabled'){
              await EnviarMensagemTexto(ticketId, message)
          }
        } else if (this.ticketFocado.channel === 'waba'){
          const message = {
            read: 1,
            fromMe: true,
            mediaUrl: '',
            body: mensagem,
            scheduleDate: this.isScheduleDate ? this.scheduleDate : null,
            quotedMsg: this.replyingMessage,     
            from: this.ticketFocado.contact.number,
            tokenApi: this.ticketFocado.whatsapp.tokenAPI,
            // tokenApi: this.ticketFocado.channel.tokenApi,
            ticketId: this.ticketFocado.id,
            idFront: uid(),
          }
          if (this.isScheduleDate) {
            message.scheduleDate = this.scheduleDate
          }
          await EnviarTextoWaba(message)
        }
        setTimeout(() => {
          this.scrollToBottom()
        }, 200)
        setTimeout(() => {
          window.open(link, '_blank')
        }, 800)
      } catch (error) {
        this.loading = false
        this.$notificarErro(this.$t('common.notifications.error'), error)
      }
      this.loading = false
    },
    handlerInputMensagem(v) {
      this.textChat = v.target.value
    },
    showModalPreviewImagem() {
      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.qbtnPasteEnvioMensagem.$el.focus()
        }, 20)
      })
    },
    hideModalPreviewImagem() {
      this.arquivos = []
      this.urlMediaPreview = {}
      this.abrirModalPreviewImagem = false
    },
    onRejectedFiles(rejectedEntries) {
      // Se for canal WABA e houver entradas rejeitadas, valida com mensagem específica
      if (this.isWabaChannel && rejectedEntries && rejectedEntries.length > 0) {
        const reasons = []
        rejectedEntries.forEach(entry => {
          if (entry.failedPropValidation === 'max-file-size') {
            reasons.push(this.$t('inputMensagem.wabaErrors.fileSizeExceeded', { fileName: entry.file?.name || '' }) || `Arquivo ${entry.file?.name || ''} excede o tamanho máximo permitido`)
          } else if (entry.failedPropValidation === 'accept') {
            reasons.push(this.$t('inputMensagem.wabaErrors.invalidFileType', { fileName: entry.file?.name || '' }) || `Tipo de arquivo não suportado: ${entry.file?.name || ''}`)
          }
        })
        
        this.$q.notify({
          html: true,
          message: this.$t('inputMensagem.wabaErrors.title') || 'Erro ao enviar arquivo(s) para WABA<br>' +
            '<ul>' +
            reasons.map(r => `<li>${r}</li>`).join('') +
            '</ul>',
          type: 'negative',
          progress: true,
          position: 'top',
          actions: [
            {
              icon: 'close',
              round: true,
              color: 'white',
            },
          ],
        })
        return
      }
      
      this.$q.notify({
        html: true,
        message: `${this.$t('inputMensagemAgendamento.error')} <br>
        <ul>
          <li>${this.$t('inputMensagemAgendamento.checkFiles')} </li>
        </ul>`,
        type: 'negative',
        progress: true,
        position: 'top',
        actions: [
          {
            icon: 'close',
            round: true,
            color: 'white',
          },
        ],
      })
    },
    // Handler para atualização de arquivos - chama validação apropriada baseada no canal
    handleFilesUpdate(files) {
      if (this.isWabaChannel) {
        this.validateFilesWaba(files)
      } else if (this.isInstagramChannel) {
        this.validateFilesInstagram(files)
      } else if (this.isMessengerChannel) {
        this.validateFilesMessenger(files)
      }
      // Para outros canais, não faz validação customizada
    },
    // Validação específica para arquivos WABA conforme especificação oficial
    validateFilesWaba(files) {
      if (!this.isWabaChannel || !files || files.length === 0) {
        return
      }

      const errors = []
      const validFiles = []
      
      // Definições de tipos e tamanhos máximos para WABA
      const wabaLimits = {
        // Audio - Max 16 MB
        'audio/aac': 16 * 1024 * 1024,
        'audio/amr': 16 * 1024 * 1024,
        'audio/mpeg': 16 * 1024 * 1024, // MP3
        'audio/mp4': 16 * 1024 * 1024, // M4A
        'audio/ogg': 16 * 1024 * 1024,
        // Document - Max 100 MB
        'text/plain': 100 * 1024 * 1024, // TXT
        'application/vnd.ms-excel': 100 * 1024 * 1024, // XLS
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 100 * 1024 * 1024, // XLSX
        'application/msword': 100 * 1024 * 1024, // DOC
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 100 * 1024 * 1024, // DOCX
        'application/vnd.ms-powerpoint': 100 * 1024 * 1024, // PPT
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 100 * 1024 * 1024, // PPTX
        'application/pdf': 100 * 1024 * 1024,
        // Image - Max 5 MB
        'image/jpeg': 5 * 1024 * 1024,
        'image/png': 5 * 1024 * 1024,
        // Sticker - Max 500 KB (animated) ou 100 KB (static) - vamos usar 500 KB como limite geral
        'image/webp': 500 * 1024,
        // Video - Max 16 MB
        'video/3gpp': 16 * 1024 * 1024,
        'video/mp4': 16 * 1024 * 1024,
      }

      // Mapeamento de extensões para tipos MIME
      const extensionToMime = {
        // Audio
        'aac': 'audio/aac',
        'amr': 'audio/amr',
        'mp3': 'audio/mpeg',
        'm4a': 'audio/mp4',
        'ogg': 'audio/ogg',
        // Document
        'txt': 'text/plain',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'pdf': 'application/pdf',
        // Image
        'jpeg': 'image/jpeg',
        'jpg': 'image/jpeg',
        'png': 'image/png',
        // Sticker
        'webp': 'image/webp',
        // Video
        '3gp': 'video/3gpp',
        'mp4': 'video/mp4',
      }

      Array.from(files).forEach(file => {
        const ext = file.name.split('.').pop()?.toLowerCase()
        const mimeType = file.type || extensionToMime[ext]
        const maxSize = wabaLimits[mimeType]

        // Verifica se o tipo é suportado
        if (!maxSize) {
          errors.push({
            fileName: file.name,
            reason: this.$t('inputMensagem.wabaErrors.invalidFileType') || `Tipo de arquivo não suportado para WABA: ${file.name}`
          })
          return
        }

        // Verifica o tamanho
        if (file.size > maxSize) {
          const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
          const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1)
          errors.push({
            fileName: file.name,
            reason: this.$t('inputMensagem.wabaErrors.fileSizeExceededDetail', { 
              fileName: file.name, 
              maxSize: maxSizeMB, 
              fileSize: fileSizeMB 
            }) || `${file.name} excede o tamanho máximo permitido (${maxSizeMB} MB). Arquivo: ${fileSizeMB} MB`
          })
          return
        }

        validFiles.push(file)
      })

      // Se houver erros, mostra notificação e remove arquivos inválidos da lista
      if (errors.length > 0) {
        this.$q.notify({
          html: true,
          message: (this.$t('inputMensagem.wabaErrors.title') || 'Erro ao validar arquivo(s) para WABA') + '<br>' +
            '<ul>' +
            errors.map(e => `<li>${e.reason}</li>`).join('') +
            '</ul>',
          type: 'negative',
          progress: true,
          position: 'top',
          timeout: 5000,
          actions: [
            {
              icon: 'close',
              round: true,
              color: 'white',
            },
          ],
        })

        // Remove apenas os arquivos inválidos, mantendo os válidos já existentes e os novos válidos
        this.$nextTick(() => {
          const invalidFileNames = errors.map(e => e.fileName)
          this.arquivos = Array.isArray(this.arquivos)
            ? this.arquivos.filter(f => !invalidFileNames.includes(f.name))
            : []
        })
      }
    },
    // Método auxiliar para validar um único arquivo WABA (retorna true se válido)
    validateFileWabaSingle(file) {
      if (!this.isWabaChannel || !file) {
        return true // Se não for WABA, deixa o validador padrão lidar
      }

      const wabaLimits = {
        'audio/aac': 16 * 1024 * 1024,
        'audio/amr': 16 * 1024 * 1024,
        'audio/mpeg': 16 * 1024 * 1024,
        'audio/mp4': 16 * 1024 * 1024,
        'audio/ogg': 16 * 1024 * 1024,
        'text/plain': 100 * 1024 * 1024,
        'application/vnd.ms-excel': 100 * 1024 * 1024,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 100 * 1024 * 1024,
        'application/msword': 100 * 1024 * 1024,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 100 * 1024 * 1024,
        'application/vnd.ms-powerpoint': 100 * 1024 * 1024,
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 100 * 1024 * 1024,
        'application/pdf': 100 * 1024 * 1024,
        'image/jpeg': 5 * 1024 * 1024,
        'image/png': 5 * 1024 * 1024,
        'image/webp': 500 * 1024,
        'video/3gpp': 16 * 1024 * 1024,
        'video/mp4': 16 * 1024 * 1024,
      }

      const extensionToMime = {
        'aac': 'audio/aac',
        'amr': 'audio/amr',
        'mp3': 'audio/mpeg',
        'm4a': 'audio/mp4',
        'ogg': 'audio/ogg',
        'txt': 'text/plain',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'pdf': 'application/pdf',
        'jpeg': 'image/jpeg',
        'jpg': 'image/jpeg',
        'png': 'image/png',
        'webp': 'image/webp',
        '3gp': 'video/3gpp',
        'mp4': 'video/mp4',
      }

      const ext = file.name.split('.').pop()?.toLowerCase()
      const mimeType = file.type || extensionToMime[ext]
      const maxSize = wabaLimits[mimeType]

      if (!maxSize) {
        return false
      }

      return file.size <= maxSize
    },
    // Validação específica para arquivos Instagram conforme especificação oficial
    validateFilesInstagram(files) {
      if (!this.isInstagramChannel || !files || files.length === 0) {
        return
      }

      const errors = []
      const validFiles = []
      
      // Definições de tipos e tamanhos máximos para Instagram
      const instagramLimits = {
        // Audio - Max 25 MB
        'audio/aac': 25 * 1024 * 1024,
        'audio/mp4': 25 * 1024 * 1024, // M4A
        'audio/x-m4a': 25 * 1024 * 1024,
        'audio/m4a': 25 * 1024 * 1024,
        'audio/wav': 25 * 1024 * 1024,
        'audio/x-wav': 25 * 1024 * 1024,
        'audio/wave': 25 * 1024 * 1024,
        // Image - Max 8 MB
        'image/jpeg': 8 * 1024 * 1024,
        'image/png': 8 * 1024 * 1024,
        // Video - Max 25 MB
        'video/mp4': 25 * 1024 * 1024,
        'video/ogg': 25 * 1024 * 1024,
        'video/ogv': 25 * 1024 * 1024,
        'video/x-msvideo': 25 * 1024 * 1024, // AVI
        'video/avi': 25 * 1024 * 1024,
        'video/quicktime': 25 * 1024 * 1024, // MOV
        'video/webm': 25 * 1024 * 1024,
      }

      // Mapeamento de extensões para tipos MIME
      const extensionToMime = {
        // Audio
        'aac': 'audio/aac',
        'm4a': 'audio/mp4',
        'wav': 'audio/wav',
        'mp4': 'audio/mp4', // Pode ser áudio ou vídeo, será determinado pelo tipo
        // Image
        'jpeg': 'image/jpeg',
        'jpg': 'image/jpeg',
        'png': 'image/png',
        // Video
        'ogg': 'video/ogg',
        'ogv': 'video/ogg',
        'avi': 'video/x-msvideo',
        'mov': 'video/quicktime',
        'webm': 'video/webm',
      }

      Array.from(files).forEach(file => {
        const ext = file.name.split('.').pop()?.toLowerCase()
        let mimeType = file.type || extensionToMime[ext]
        
        // Se for mp4, verificar se é vídeo ou áudio pelo tipo do arquivo
        if (ext === 'mp4' && !mimeType) {
          mimeType = file.type || 'video/mp4' // Default para vídeo
        }
        
        const maxSize = instagramLimits[mimeType]

        // Verifica se o tipo é suportado
        if (!maxSize) {
          errors.push({
            fileName: file.name,
            reason: this.$t('inputMensagem.instagramErrors.invalidFileType') || `Tipo de arquivo não suportado para Instagram: ${file.name}`
          })
          return
        }

        // Verifica o tamanho
        if (file.size > maxSize) {
          const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
          const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1)
          errors.push({
            fileName: file.name,
            reason: this.$t('inputMensagem.instagramErrors.fileSizeExceededDetail', { 
              fileName: file.name, 
              maxSize: maxSizeMB, 
              fileSize: fileSizeMB 
            }) || `${file.name} excede o tamanho máximo permitido (${maxSizeMB} MB). Arquivo: ${fileSizeMB} MB`
          })
          return
        }

        validFiles.push(file)
      })

      // Se houver erros, mostra notificação e remove arquivos inválidos da lista
      if (errors.length > 0) {
        this.$q.notify({
          html: true,
          message: (this.$t('inputMensagem.instagramErrors.title') || 'Erro ao validar arquivo(s) para Instagram') + '<br>' +
            '<ul>' +
            errors.map(e => `<li>${e.reason}</li>`).join('') +
            '</ul>',
          type: 'negative',
          progress: true,
          position: 'top',
          timeout: 5000,
          actions: [
            {
              icon: 'close',
              round: true,
              color: 'white',
            },
          ],
        })

        // Remove apenas os arquivos inválidos, mantendo os válidos já existentes e os novos válidos
        this.$nextTick(() => {
          const invalidFileNames = errors.map(e => e.fileName)
          this.arquivos = Array.isArray(this.arquivos)
            ? this.arquivos.filter(f => !invalidFileNames.includes(f.name))
            : []
        })
      }
    },
    // Método auxiliar para validar um único arquivo Instagram (retorna true se válido)
    validateFileInstagramSingle(file) {
      if (!this.isInstagramChannel || !file) {
        return true // Se não for Instagram, deixa o validador padrão lidar
      }

      const instagramLimits = {
        'audio/aac': 25 * 1024 * 1024,
        'audio/mp4': 25 * 1024 * 1024,
        'audio/x-m4a': 25 * 1024 * 1024,
        'audio/m4a': 25 * 1024 * 1024,
        'audio/wav': 25 * 1024 * 1024,
        'audio/x-wav': 25 * 1024 * 1024,
        'audio/wave': 25 * 1024 * 1024,
        'image/jpeg': 8 * 1024 * 1024,
        'image/png': 8 * 1024 * 1024,
        'video/mp4': 25 * 1024 * 1024,
        'video/ogg': 25 * 1024 * 1024,
        'video/ogv': 25 * 1024 * 1024,
        'video/x-msvideo': 25 * 1024 * 1024,
        'video/avi': 25 * 1024 * 1024,
        'video/quicktime': 25 * 1024 * 1024,
        'video/webm': 25 * 1024 * 1024,
      }

      const extensionToMime = {
        'aac': 'audio/aac',
        'm4a': 'audio/mp4',
        'wav': 'audio/wav',
        'mp4': 'video/mp4', // Default para vídeo, mas pode ser áudio também
        'jpeg': 'image/jpeg',
        'jpg': 'image/jpeg',
        'png': 'image/png',
        'ogg': 'video/ogg',
        'ogv': 'video/ogg',
        'avi': 'video/x-msvideo',
        'mov': 'video/quicktime',
        'webm': 'video/webm',
      }

      const ext = file.name.split('.').pop()?.toLowerCase()
      let mimeType = file.type || extensionToMime[ext]
      
      // Se for mp4, verificar se é vídeo ou áudio pelo tipo do arquivo
      if (ext === 'mp4' && !mimeType) {
        mimeType = file.type || 'video/mp4' // Default para vídeo
      }
      
      const maxSize = instagramLimits[mimeType]

      if (!maxSize) {
        return false
      }

      return file.size <= maxSize
    },
    // Validação específica para arquivos Messenger conforme especificação oficial
    validateFilesMessenger(files) {
      if (!this.isMessengerChannel || !files || files.length === 0) {
        return
      }

      const errors = []
      const validFiles = []
      
      // Definições de tipos e tamanhos máximos para Messenger
      // Referência: https://developers.facebook.com/docs/messenger-platform/reference/attachment-upload-api
      const messengerLimits = {
        // Image - Max 8 MB
        'image/jpeg': 8 * 1024 * 1024,
        'image/png': 8 * 1024 * 1024,
        // Video - Max 25 MB
        'video/mp4': 25 * 1024 * 1024,
        // Audio - Max 25 MB
        'audio/mp3': 25 * 1024 * 1024,
        'audio/mpeg': 25 * 1024 * 1024,
        'audio/aac': 25 * 1024 * 1024,
        'audio/mp4': 25 * 1024 * 1024, // M4A
        'audio/x-m4a': 25 * 1024 * 1024,
        'audio/m4a': 25 * 1024 * 1024,
        'audio/wav': 25 * 1024 * 1024,
        'audio/x-wav': 25 * 1024 * 1024,
        'audio/wave': 25 * 1024 * 1024,
        // File - Max 25 MB
        'application/pdf': 25 * 1024 * 1024,
        'application/msword': 25 * 1024 * 1024, // DOC
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 25 * 1024 * 1024, // DOCX
        'application/vnd.ms-excel': 25 * 1024 * 1024, // XLS
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 25 * 1024 * 1024, // XLSX
        'application/vnd.ms-powerpoint': 25 * 1024 * 1024, // PPT
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 25 * 1024 * 1024, // PPTX
        'text/plain': 25 * 1024 * 1024, // TXT
      }

      // Mapeamento de extensões para tipos MIME
      const extensionToMime = {
        // Image
        'jpeg': 'image/jpeg',
        'jpg': 'image/jpeg',
        'png': 'image/png',
        // Video
        'mp4': 'video/mp4',
        // Audio
        'mp3': 'audio/mpeg',
        'aac': 'audio/aac',
        'm4a': 'audio/mp4',
        'wav': 'audio/wav',
        // File
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'txt': 'text/plain',
      }

      Array.from(files).forEach(file => {
        const ext = file.name.split('.').pop()?.toLowerCase()
        let mimeType = file.type || extensionToMime[ext]
        
        // Se for mp4, verificar se é vídeo ou áudio pelo tipo do arquivo
        if (ext === 'mp4' && !mimeType) {
          mimeType = file.type || 'video/mp4' // Default para vídeo
        }
        
        const maxSize = messengerLimits[mimeType]

        // Verifica se o tipo é suportado
        if (!maxSize) {
          errors.push({
            fileName: file.name,
            reason: this.$t('inputMensagem.messengerErrors.invalidFileType') || `Tipo de arquivo não suportado para Messenger: ${file.name}`
          })
          return
        }

        // Verifica o tamanho
        if (file.size > maxSize) {
          const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1)
          const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1)
          errors.push({
            fileName: file.name,
            reason: this.$t('inputMensagem.messengerErrors.fileSizeExceededDetail', { 
              fileName: file.name, 
              maxSize: maxSizeMB, 
              fileSize: fileSizeMB 
            }) || `${file.name} excede o tamanho máximo permitido (${maxSizeMB} MB). Arquivo: ${fileSizeMB} MB`
          })
          return
        }

        validFiles.push(file)
      })

      // Se houver erros, mostra notificação e remove arquivos inválidos da lista
      if (errors.length > 0) {
        this.$q.notify({
          html: true,
          message: (this.$t('inputMensagem.messengerErrors.title') || 'Erro ao validar arquivo(s) para Messenger') + '<br>' +
            '<ul>' +
            errors.map(e => `<li>${e.reason}</li>`).join('') +
            '</ul>',
          type: 'negative',
          progress: true,
          position: 'top',
          timeout: 5000,
          actions: [
            {
              icon: 'close',
              round: true,
              color: 'white',
            },
          ],
        })

        // Remove apenas os arquivos inválidos, mantendo os válidos já existentes e os novos válidos
        this.$nextTick(() => {
          const invalidFileNames = errors.map(e => e.fileName)
          this.arquivos = Array.isArray(this.arquivos)
            ? this.arquivos.filter(f => !invalidFileNames.includes(f.name))
            : []
        })
      }
    },
    // Método auxiliar para validar um único arquivo Messenger (retorna true se válido)
    validateFileMessengerSingle(file) {
      if (!this.isMessengerChannel || !file) {
        return true // Se não for Messenger, deixa o validador padrão lidar
      }

      const messengerLimits = {
        'image/jpeg': 8 * 1024 * 1024,
        'image/png': 8 * 1024 * 1024,
        'video/mp4': 25 * 1024 * 1024,
        'audio/mp3': 25 * 1024 * 1024,
        'audio/mpeg': 25 * 1024 * 1024,
        'audio/aac': 25 * 1024 * 1024,
        'audio/mp4': 25 * 1024 * 1024,
        'audio/x-m4a': 25 * 1024 * 1024,
        'audio/m4a': 25 * 1024 * 1024,
        'audio/wav': 25 * 1024 * 1024,
        'audio/x-wav': 25 * 1024 * 1024,
        'audio/wave': 25 * 1024 * 1024,
        'application/pdf': 25 * 1024 * 1024,
        'application/msword': 25 * 1024 * 1024,
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 25 * 1024 * 1024,
        'application/vnd.ms-excel': 25 * 1024 * 1024,
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 25 * 1024 * 1024,
        'application/vnd.ms-powerpoint': 25 * 1024 * 1024,
        'application/vnd.openxmlformats-officedocument.presentationml.presentation': 25 * 1024 * 1024,
        'text/plain': 25 * 1024 * 1024,
      }

      const extensionToMime = {
        'jpeg': 'image/jpeg',
        'jpg': 'image/jpeg',
        'png': 'image/png',
        'mp4': 'video/mp4', // Default para vídeo, mas pode ser áudio também
        'mp3': 'audio/mpeg',
        'aac': 'audio/aac',
        'm4a': 'audio/mp4',
        'wav': 'audio/wav',
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'ppt': 'application/vnd.ms-powerpoint',
        'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'txt': 'text/plain',
      }

      const ext = file.name.split('.').pop()?.toLowerCase()
      let mimeType = file.type || extensionToMime[ext]
      
      // Se for mp4, verificar se é vídeo ou áudio pelo tipo do arquivo
      if (ext === 'mp4' && !mimeType) {
        mimeType = file.type || 'video/mp4' // Default para vídeo
      }
      
      const maxSize = messengerLimits[mimeType]

      if (!maxSize) {
        return false
      }

      return file.size <= maxSize
    },
    handleSign(state) {
      this.sign = state
      LocalStorage.set('sign', this.sign)
    },
    async findGPTInfo() {
      if (this.isScheduleDate) return
      try {
        const { data } = await BuscarConfiguracao('chatgpt')
        this.gptEnabled = data.value === 'enabled'
      } catch {

      }
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
    async listTenantPorId(){
      const { data } = await ListarTenantPorId(this.usuario.tenantId)
      this.pluginAudio = data[0]?.audioPlugin
      this.semRedis = data[0]?.noRedis
      this.janelaConversa = data[0]?.forceOpenChatWindow
      // console.log('socket ON: FAST MESSAGING:', this.semRedis,'- PLUGIN AUDIO BETA:', this.pluginAudio)
    },
    handleArquivoSelecionado(file) {
      this.arquivoAnexo = file;
      this.previewUrl = URL.createObjectURL(file);
      this.isImage = file.type.startsWith('image/');
      this.isVideo = file.type.startsWith('video/');
      this.isPdf = file.type === 'application/pdf';
      
      // Inicia o indicador de composing (anexando arquivo)
      // if (this.ticketFocado && this.ticketFocado.id) {
      //   this.startTypingIndicator('composing');
      // }
    },
    abrirDialogAnexo() {
      this.dialogAnexo = true;
      this.arquivoAnexo = null;
      this.captionAnexo = '';
      this.previewUrl = null;
      this.isImage = false;
      this.isVideo = false;
      this.isPdf = false;
    },
    async abrirDialogGaleria() {
      this.dialogGaleria = true;
      this.arquivoSelecionadoGaleria = null;
      this.captionGaleria = '';
      this.galeriaSearchParam = '';
      this.galeriaFileTypeFilter = null;
      this.galeriaPage = 1;
      await this.buscarArquivosGaleria(true);
    },
    fecharDialogGaleria() {
      this.dialogGaleria = false;
      this.arquivoSelecionadoGaleria = null;
      this.captionGaleria = '';
      this.galeriaSearchParam = '';
      this.galeriaFileTypeFilter = null;
      this.arquivosGaleria = [];
      this.galeriaPage = 1;
      this.galeriaHasMore = false;
      this.signAttachmentGaleria = true; // Resetar assinatura para ativada por padrão
    },
    async buscarArquivosGaleria(resetPage = false) {
      // Se resetPage for true, resetar a página para 1 (usado quando filtro muda)
      if (resetPage) {
        this.galeriaPage = 1;
      }
      
      this.galeriaLoading = true;
      try {
        const params = {
          pageNumber: this.galeriaPage,
          searchParam: this.galeriaSearchParam || undefined,
          fileType: this.galeriaFileTypeFilter?.value || undefined
        };
        const { data } = await ListarGaleria(params);
        if (this.galeriaPage === 1) {
          this.arquivosGaleria = data.galleries || [];
        } else {
          this.arquivosGaleria = [...this.arquivosGaleria, ...(data.galleries || [])];
        }
        this.galeriaHasMore = data.hasMore || false;
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: this.$t('galeria.loadError')
        });
      } finally {
        this.galeriaLoading = false;
      }
    },
    async carregarMaisArquivosGaleria() {
      this.galeriaPage += 1;
      await this.buscarArquivosGaleria(false);
    },
    selecionarArquivoGaleria(arquivo) {
      this.arquivoSelecionadoGaleria = arquivo;
    },
    getFileTypeIcon(fileType) {
      const icons = {
        image: 'mdi-image',
        pdf: 'mdi-file-pdf-box',
        video: 'mdi-video',
        audio: 'mdi-music',
        document: 'mdi-file-document',
        archive: 'mdi-folder-zip',
        other: 'mdi-file'
      };
      return icons[fileType] || 'mdi-file';
    },
    getFileTypeColor(fileType) {
      const colors = {
        image: 'blue',
        pdf: 'red',
        video: 'purple',
        audio: 'orange',
        document: 'green',
        archive: 'grey',
        other: 'grey-7'
      };
      return colors[fileType] || 'grey-7';
    },
    formatFileSize(bytes) {
      if (!bytes) return '-';
      if (bytes < 1024) return bytes + ' B';
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
      if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
      return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
    },
    async enviarArquivoGaleria() {
      if (!this.arquivoSelecionadoGaleria) {
        this.$q.notify({
          message: this.$t('inputMensagem.labels.selecioneArquivo'),
          type: 'negative',
        });
        return;
      }

      this.loading = true;

      try {
        // Baixar o arquivo da galeria
        const response = await fetch(this.arquivoSelecionadoGaleria.mediaUrl);
        const blob = await response.blob();
        
        // Criar um File object a partir do blob
        const file = new File([blob], this.arquivoSelecionadoGaleria.originalName, {
          type: this.arquivoSelecionadoGaleria.mimeType
        });

        // Validar arquivo para WABA se for canal WABA - ANTES de tentar enviar
        if (this.isWabaChannel && !this.validateFileWabaSingle(file)) {
          this.loading = false;
          const allowedExtensions = this.acceptWaba.split(',').map(e => e.replace('.', ''));
          
          // Construir mensagem completa com nome do arquivo e extensões permitidas
          const message = this.$t('inputMensagem.wabaErrors.invalidFileTypeWithExtensions', { 
            fileName: file.name,
            extensions: allowedExtensions.join(', ')
          });
          
          this.$q.notify({
            message: message,
            type: 'negative',
            position: 'top',
            timeout: 8000,
            actions: [
              {
                icon: 'close',
                round: true,
                color: 'white',
              },
            ],
          });
          return;
        }
        
        // Validar arquivo para Instagram se for canal Instagram - ANTES de tentar enviar
        if (this.isInstagramChannel && !this.validateFileInstagramSingle(file)) {
          this.loading = false;
          const allowedExtensions = this.acceptInstagram.split(',').map(e => e.replace('.', ''));
          
          // Construir mensagem completa com nome do arquivo e extensões permitidas
          const message = this.$t('inputMensagem.instagramErrors.invalidFileTypeWithExtensions', { 
            fileName: file.name,
            extensions: allowedExtensions.join(', ')
          }) || `Tipo de arquivo não suportado para Instagram: ${file.name}. Extensões permitidas: ${allowedExtensions.join(', ')}`;
          
          this.$q.notify({
            message: message,
            type: 'negative',
            position: 'top',
            timeout: 8000,
            actions: [
              {
                icon: 'close',
                round: true,
                color: 'white',
              },
            ],
          });
          return;
        }

        // Usar o mesmo método de envio de anexo
        this.arquivoAnexo = file;
        this.captionAnexo = this.captionGaleria;
        this.signAttachment = this.signAttachmentGaleria;

        await this.enviarAnexo();

        // Limpar dados da galeria
        this.fecharDialogGaleria();
      } catch (error) {
        this.loading = false;
        // Se for WABA e tiver arquivo selecionado, pode ser erro de validação
        // Mas a validação já foi feita antes, então se chegou aqui é outro tipo de erro
        this.$q.notify({
          message: this.$t('inputMensagem.labels.erroAnexar'),
          type: 'negative',
        });
      }
    },
    abrirDialogVcard() {
      this.dialogVcard = true;
      this.vcardData = {
        fullName: '',
        phoneNumber: '',
      };
      this.formatInternational = ''
    },

    abrirDialogLocation() {
      this.dialogLocation = true;
    },

    async enviarLocation() {
      try {
        if (!this.locationData.latitude || !this.locationData.longitude) {
          this.$q.notify({
            type: 'negative',
            message: this.$t('inputMensagem.novo.camposObrigatorios')
          });
          return;
        }

        const payload = {
          latitude: parseFloat(this.locationData.latitude),
          longitude: parseFloat(this.locationData.longitude),
          name: this.locationData.name || undefined,
          address: this.locationData.address || undefined
        };

        await EnviarLocalizacao(this.ticketFocado.id, payload)
        
        this.dialogLocation = false;
        this.locationData = {
          latitude: '',
          longitude: '',
          name: '',
          address: '',
        };

        this.$q.notify({
          type: 'positive',
          message: this.$t('inputMensagem.novo.localizacaoEnviada'),
          position: 'top',
          progress: true
        });
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: this.$t('inputMensagem.novo.erroEnviarLocalizacao'),
          position: 'top',
          progress: true
        });
      }
    },

    async enviarVcard() {
      try {
        if (!this.vcardData.fullName || !this.vcardData.phoneNumber || !this.formatInternational) {
          this.$q.notify({
            type: 'negative',
            message: this.$t('inputMensagem.novo.camposObrigatorios')
          });
          return;
        }

        const payload = {
          fullName: this.vcardData.fullName,
          phoneNumber: this.formatInternational,
          wuid: this.vcardData.phoneNumber.replace(/\D/g, '')
        };

        await EnviarVcard(this.ticketFocado.id, { contact: [payload] })
        
        this.dialogVcard = false;
        this.vcardData = {
          fullName: '',
          phoneNumber: '',
        };
        this.formatInternational = ''

        this.$q.notify({
          type: 'positive',
          message: this.$t('inputMensagem.success.vcardEnviado'),
          position: 'top',
          progress: true
        });
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: this.$t('inputMensagem.error.erroEnviarVcard'),
          position: 'top',
          progress: true
        });
      }
    },
    onPhoneUpdate(value) {
       // Wrapper envia objeto: { raw, countryCode, formatInternational }
       if (value && typeof value === 'object') {
         this.formatInternational = value.formatInternational || ''
       } else {
         // fallback: manter vazio (validação impedirá envio)
         this.formatInternational = ''
       }
    },

    // Sistema de typing indicator
    startTypingIndicator(state = 'composing') {
      if (!this.ticketFocado || !this.ticketFocado.id) {
        return;
      }

      // Se já está digitando para outro ticket, para primeiro
      if (this.isTyping && this.typingTicketId !== this.ticketFocado.id) {
        this.stopTypingIndicator();
      }

      if (this.isTyping && this.typingTicketId === this.ticketFocado.id) {
        return;
      }

      if (this.ticketFocado.whatsapp?.type === 'whatsapp' || 
          this.ticketFocado.whatsapp?.type === 'baileys' || 
          this.ticketFocado.channel === 'evo' || 
          this.ticketFocado.channel === 'meow') {
        if (this.typingTimer) {
          clearTimeout(this.typingTimer);
        }

        this.isTyping = true;
        this.typingTicketId = this.ticketFocado.id;
        this.lastTypingTime = Date.now();

        SendTypingIndicator(this.ticketFocado.id, { state, ticket: this.ticketFocado })
          .then(() => {
            // this.typingTimer = setTimeout(() => {
            //   this.stopTypingIndicator();
            // }, 3000);
          })
          .catch(error => {
            console.error('Erro ao enviar typing indicator:', error);
            this.isTyping = false;
            this.typingTicketId = null;
          });
      }
    },
    
    
    stopTypingIndicator() {
      // if (!this.isTyping) {
      //   return;
      // }

      if (this.typingTimer) {
        clearTimeout(this.typingTimer);
        this.typingTimer = null;
      }

      // Guarda o ID do ticket que estava digitando antes de resetar
      const ticketIdQueEstavaDigitando = this.typingTicketId;
      const ticketQueEstavaDigitando = this.ticketFocado;
      
      this.isTyping = false;
      this.typingTicketId = null;
      
      // Envia paused indicator quando para de digitar
      // Usa o ticket que estava digitando (pode ser diferente do ticketFocado atual se mudou de ticket)
      if (ticketIdQueEstavaDigitando && ticketQueEstavaDigitando && ticketQueEstavaDigitando.id && 
          (ticketQueEstavaDigitando.whatsapp?.type === 'whatsapp' || 
           ticketQueEstavaDigitando.whatsapp?.type === 'baileys' || 
           ticketQueEstavaDigitando.whatsapp?.type === 'evo' || 
           ticketQueEstavaDigitando.whatsapp?.type === 'meow' ||
           ticketQueEstavaDigitando.channel === 'evo' || 
           ticketQueEstavaDigitando.channel === 'meow')){
        // Envia pause diretamente para o ticket que estava digitando
        SendPausedIndicator(ticketIdQueEstavaDigitando, {state: 'paused', ticket: ticketQueEstavaDigitando})
          .catch(error => {
            console.error('Erro ao enviar paused indicator:', error);
          });
      }
    },

    handleTypingInput() {
      if (!this.ticketFocado || !this.ticketFocado.id) {
        return;
      }

      if (this.typingTimer) {
        clearTimeout(this.typingTimer);
      }

      if((this.ticketFocado.whatsapp.type === 'whatsapp' || 
      this.ticketFocado.whatsapp.type === 'baileys' || 
      this.ticketFocado.channel === 'evo' || 
      this.ticketFocado.channel === 'meow')){
        this.startTypingIndicator('composing');
      }

      this.typingTimer = setTimeout(() => {
        this.stopTypingIndicator();
      }, 3000);
    },
    // Sistema de recording indicator
    startRecordingIndicator(state = 'recording') {
      if (this.isRecording) {
        return;
      }

      if (this.ticketFocado && this.ticketFocado.id &&
      (this.ticketFocado.whatsapp.type === 'whatsapp' || 
      this.ticketFocado.whatsapp.type === 'baileys' || 
      this.ticketFocado.channel === 'evo' || 
      this.ticketFocado.channel === 'meow')
      ) {
        this.isRecording = true;
        this.lastRecordingTime = Date.now();

        SendRecordingIndicator(this.ticketFocado.id, {state, ticket: this.ticketFocado})
          .then(() => {
            // console.log('Recording indicator iniciado');
          })
          .catch(error => {
            console.error('Erro ao enviar recording indicator:', error);
            this.isRecording = false;
          });
      }
    },
    
    // Sistema de paused indicator
    startPausedIndicator(state = 'paused') {
      if (!this.ticketFocado || !this.ticketFocado.id) {
        return;
      }
      
      const channelType = this.ticketFocado.whatsapp?.type || this.ticketFocado.channel;
      const isSupportedChannel = channelType === 'whatsapp' || 
                                 channelType === 'baileys' || 
                                 channelType === 'evo' || 
                                 channelType === 'meow';
      
      if (isSupportedChannel) {
        SendPausedIndicator(this.ticketFocado.id, {state, ticket: this.ticketFocado})
          .catch(error => {
            console.error('Erro ao enviar paused indicator:', error);
          });
      }
    },
    
    stopRecordingIndicator() {
      if (!this.isRecording) {
        return;
      }

      this.isRecording = false;
      
      // Envia paused indicator para parar o recording
      if (this.ticketFocado && this.ticketFocado.id && 
          (this.ticketFocado.whatsapp?.type === 'whatsapp' || 
           this.ticketFocado.whatsapp?.type === 'baileys' || 
           this.ticketFocado.whatsapp?.type === 'evo' || 
           this.ticketFocado.whatsapp?.type === 'meow' ||
           this.ticketFocado.channel === 'evo' || 
           this.ticketFocado.channel === 'meow')){
        this.startPausedIndicator('paused');
      }
    },
    // ===== MÉTODOS DO MODAL DE GRUPOS =====
    mostrarModalGrupo() {
      this.modalVisivelGrupo = true;
    },
    fecharModalGrupo() {
      this.modalVisivelGrupo = false;
      this.resetarDadosGrupo();
    },
    resetarDadosGrupo() {
      this.grupoOptions = {
        alterarTitulo: false,
        alterarDescricao: false,
        alterarImagemUrl: false,
        alterarImagemUpload: false,
        alterarPermissao: false,
        promoverAdmin: false,
        demoverAdmin: false,
        adicionarParticipante: false,
        removerParticipante: false
      };
      this.grupoData = {
        novoTitulo: '',
        novaDescricao: '',
        novaImagemUrl: '',
        novaImagemArquivo: null,
        novaPermissao: false,
        numerosParticipantes: ''
      };
      this.participantesGrupo = [];
    },
    async listarParticipantesGrupo() {
      if (!this.ticketFocado?.isGroup) return;
      
      this.loadingParticipantes = true;
      try {
        const data = {
          whatsappId: this.ticketFocado.whatsappId,
          groupIds: [this.ticketFocado.contact.number + '@g.us']
        };
        const response = await ListarParticipantes(data);
        if (response.data && response.data.length > 0) {
          this.participantesGrupo = response.data[0].participants || [];
        }
      } catch (error) {
        console.error('Erro ao listar participantes:', error);
        this.$q.notify({
          type: 'negative',
          message: 'Erro ao listar participantes do grupo'
        });
      } finally {
        this.loadingParticipantes = false;
      }
    },
    async executarAcoesGrupo() {
      if (!this.ticketFocado?.isGroup) return;
      
      this.loadingGrupo = true;
      try {
        const groupId = this.ticketFocado.contact.number + '@g.us';
        const whatsappId = this.ticketFocado.whatsappId;
        
        // Alterar título
        if (this.grupoOptions.alterarTitulo && this.grupoData.novoTitulo) {
          await this.alterarTituloGrupo(groupId, whatsappId);
        }
        
        // Alterar descrição
        if (this.grupoOptions.alterarDescricao && this.grupoData.novaDescricao) {
          await this.alterarDescricaoGrupo(groupId, whatsappId);
        }
        
        // Alterar imagem URL
        if (this.grupoOptions.alterarImagemUrl && this.grupoData.novaImagemUrl) {
          await this.alterarImagemUrlGrupo(groupId, whatsappId);
        }
        
        // Alterar imagem upload
        if (this.grupoOptions.alterarImagemUpload && this.grupoData.novaImagemArquivo) {
          await this.alterarImagemArquivoGrupo(groupId, whatsappId);
        }
        
        // Alterar permissão
        if (this.grupoOptions.alterarPermissao) {
          await this.alterarPermissaoGrupo(groupId, whatsappId);
        }
        
        // Promover admin
        if (this.grupoOptions.promoverAdmin && this.grupoData.numerosParticipantes) {
          await this.promoverAdminGrupo(groupId, whatsappId);
        }
        
        // Demover admin
        if (this.grupoOptions.demoverAdmin && this.grupoData.numerosParticipantes) {
          await this.demoverAdminGrupo(groupId, whatsappId);
        }
        
        // Adicionar participante
        if (this.grupoOptions.adicionarParticipante && this.grupoData.numerosParticipantes) {
          await this.adicionarParticipanteGrupo(groupId, whatsappId);
        }
        
        // Remover participante
        if (this.grupoOptions.removerParticipante && this.grupoData.numerosParticipantes) {
          await this.removerParticipanteGrupo(groupId, whatsappId);
        }
        
        this.$q.notify({
          type: 'positive',
          message: 'Ações do grupo executadas com sucesso!'
        });
        
        this.fecharModalGrupo();
        
      } catch (error) {
        console.error('Erro ao executar ações do grupo:', error);
        this.$q.notify({
          type: 'negative',
          message: 'Erro ao executar ações do grupo'
        });
      } finally {
        this.loadingGrupo = false;
      }
    },
    async alterarTituloGrupo(groupId, whatsappId) {
      const data = {
        whatsappId: whatsappId,
        groupIds: [groupId],
        title: this.grupoData.novoTitulo
      };
      await MudarTitulo(data);
    },
    async alterarDescricaoGrupo(groupId, whatsappId) {
      const data = {
        whatsappId: whatsappId,
        groupIds: [groupId],
        description: this.grupoData.novaDescricao
      };
      await MudarDescricao(data);
    },
    async alterarImagemUrlGrupo(groupId, whatsappId) {
      const data = {
        whatsappId: whatsappId,
        groupIds: [groupId],
        picture: this.grupoData.novaImagemUrl
      };
      await MudarFotoUrl(data);
    },
    async alterarImagemArquivoGrupo(groupId, whatsappId) {
      const formData = new FormData();
      formData.append('whatsappId', whatsappId);
      formData.append('arrayGroupIds', groupId);
      if (this.grupoData.novaImagemArquivo) {
        formData.append('medias', this.grupoData.novaImagemArquivo, this.grupoData.novaImagemArquivo.name);
      }
      await MudarFotoArquivo(formData);
    },
    async alterarPermissaoGrupo(groupId, whatsappId) {
      const data = {
        whatsappId: whatsappId,
        groupIds: [groupId],
        adminsOnly: this.grupoData.novaPermissao
      };
      await MudarPermissao(data);
    },
    async promoverAdminGrupo(groupId, whatsappId) {
      const numbers = this.grupoData.numerosParticipantes.split(',').map(num => num.trim());
      const data = {
        whatsappId: whatsappId,
        groupIds: [groupId],
        participants: numbers
      };
      await PromoverUsuario(data);
    },
    async demoverAdminGrupo(groupId, whatsappId) {
      const numbers = this.grupoData.numerosParticipantes.split(',').map(num => num.trim());
      const data = {
        whatsappId: whatsappId,
        groupIds: [groupId],
        participants: numbers
      };
      await DemoverUsuario(data);
    },
    async adicionarParticipanteGrupo(groupId, whatsappId) {
      const numbers = this.grupoData.numerosParticipantes.split(',').map(num => num.trim());
      const data = {
        whatsappId: whatsappId,
        groupIds: [groupId],
        participants: numbers
      };
      await AdicionarUsuario(data);
    },
    async removerParticipanteGrupo(groupId, whatsappId) {
      const numbers = this.grupoData.numerosParticipantes.split(',').map(num => num.trim());
      const data = {
        whatsappId: whatsappId,
        groupIds: [groupId],
        participants: numbers
      };
      await RemoverUsuario(data);
    },
    // ===== FIM DOS MÉTODOS DO MODAL DE GRUPOS =====

  },
  watch: {
    externalScheduleDate: {
      handler (v) {
        if (this.useExternalSchedule) {
          this.scheduleDate = v || null
        }
      },
      immediate: true
    },
    textChat: {
      handler(newVal, oldVal) {
        if (newVal && newVal !== oldVal && newVal.trim() !== '') {
          this.handleTypingInput();
        } else if ((newVal === '' || newVal.trim() === '') && oldVal && oldVal.trim() !== '') {
          // Se o texto foi limpo (tinha conteúdo antes), para o typing indicator imediatamente
          // Mas só se ainda estiver digitando (isTyping = true) para evitar chamadas desnecessárias
          if (this.isTyping) {
            if (this.typingTimer) {
              clearTimeout(this.typingTimer);
              this.typingTimer = null;
            }
            this.stopTypingIndicator();
          }
        }
      },
      immediate: false
    },
    isRecordingAudio: {
      handler(newVal, oldVal) {
        if (newVal) {
          // Quando isRecordingAudio for true, enviar gravando
          this.startRecordingIndicator('recording');
        } else {
          // Quando isRecordingAudio for false, parar
          this.stopRecordingIndicator();
        }
      },
      immediate: false
    },
    loading: {
      handler(newVal) {
        // Emitir evento quando o estado de loading mudar
        eventBus.emit('input-mensagem:loading-changed', newVal);
      },
      immediate: false
    },
    ticketFocado: {
      handler(newTicket, oldTicket) {
        // Limpar o input quando mudar de ticket
        if (!newTicket || !newTicket.id) {
          return;
        }
        
        const newTicketId = newTicket.id;
        const ticketAnteriorId = oldTicket && oldTicket.id ? oldTicket.id : null;
        
        // Se mudou de ticket, limpar o input e parar typing indicator
        if (ticketAnteriorId !== newTicketId && ticketAnteriorId !== null) {
          // PRIMEIRO: Limpa timers e estados para parar qualquer envio de typing
          if (this.typingTimer) {
            clearTimeout(this.typingTimer);
            this.typingTimer = null;
          }
          
          // SEGUNDO: Se estava digitando no ticket anterior, para o typing indicator
          if (this.isTyping && this.typingTicketId === ticketAnteriorId) {
            // Envia pause para o ticket anterior antes de resetar
            if (oldTicket && oldTicket.id && 
                (oldTicket.whatsapp?.type === 'whatsapp' || 
                 oldTicket.whatsapp?.type === 'baileys' || 
                 oldTicket.whatsapp?.type === 'evo' || 
                 oldTicket.whatsapp?.type === 'meow' ||
                 oldTicket.channel === 'evo' || 
                 oldTicket.channel === 'meow')) {
              // Envia pause para o ticket anterior
              SendPausedIndicator(oldTicket.id, {state: 'paused', ticket: oldTicket})
                .catch(error => {
                  console.error('Erro ao enviar paused indicator ao mudar ticket:', error);
                });
            }
          }
          
          // TERCEIRO: Reseta estados de typing
          this.isTyping = false;
          this.typingTicketId = null;
          
          // QUARTO: Limpa o input após parar tudo
          this.textChat = '';
        }
      },
      immediate: false
    }
  },
  beforeMount() {
    this.listarConfiguracoes()
  },
  async mounted() {
    this.addEventListener(window, 'resize', this.onResize);
    const focusHandler = () => this.$refs.inputEnvioMensagem.focus();
    eventBus.on('mensagem-chat:focar-input-mensagem', focusHandler);
    this.rootListeners.push({ event: 'mensagem-chat:focar-input-mensagem', handler: focusHandler });

    const self = this
    this.addEventListener(window, 'paste', self.handleInputPaste)
    if (![null, undefined].includes(LocalStorage.getItem('sign'))) {
      this.handleSign(LocalStorage.getItem('sign'))
    }
    this.chatgptAtivo = localStorage.getItem('chatgptAtivo') || 'disabled'
    // this.findGPTInfo()
    // await this.listParticipantes()
    this.userProfile = localStorage.getItem('profile')
    await this.listTenantPorId();
  },
  beforeUnmount() {
    // Se estava digitando, envia pause antes de desmontar
    // Usa o typingTicketId para buscar o ticket do store se ticketFocado não estiver disponível
    if (this.typingTicketId) {
      let ticketParaPause = this.ticketFocado;
      
      // Se ticketFocado não está disponível, busca do store
      if (!ticketParaPause || !ticketParaPause.id || ticketParaPause.id !== this.typingTicketId) {
        const tickets = this.$store.getters.tickets || [];
        ticketParaPause = tickets.find(t => t.id === this.typingTicketId);
      }
      
      // Valida se o ticket tem todas as informações necessárias
      if (ticketParaPause && 
          ticketParaPause.id && 
          ticketParaPause.contact && 
          ticketParaPause.contact.number &&
          ticketParaPause.whatsapp && 
          ticketParaPause.whatsapp.id) {
        const channelType = ticketParaPause.whatsapp?.type || ticketParaPause.channel;
        const isSupportedChannel = channelType === 'whatsapp' || 
                                   channelType === 'baileys' || 
                                   channelType === 'evo' || 
                                   channelType === 'meow';
        
        if (isSupportedChannel) {
          SendPausedIndicator(this.typingTicketId, {state: 'paused', ticket: ticketParaPause})
            .catch(error => {
              // Ignora erros esperados (WhatsApp não inicializado, ticket inválido, etc.)
              const status = error?.response?.status || error?.status;
              const message = error?.response?.data?.message || error?.message || '';
              
              // Só loga erros inesperados (não relacionados a WhatsApp não inicializado ou dados faltando)
              if (status !== 400 && !message.includes('ERR_WAPP_NOT_INITIALIZED') && !message.includes('missing')) {
                console.error('Erro ao enviar pause antes de desmontar:', error);
              }
            });
        }
      }
    }
    
    // Limpa timers
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = null;
    }
    
    // Limpeza completa de memória
    this.cleanupMemory();
  },
  unmounted() {
    // Garantir que todos os recursos sejam limpos
    this.cleanupMemory();
  },
})
</script>

<style lang="scss" scoped>

.preview-card {
  border: 0px;
  max-height: 600px;
  overflow-y: auto;
}

.modal {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}

.input-group {
  margin-bottom: 10px;
}

.input-group label {
  display: block;
  margin-bottom: 5px;
}

.input-group input {
  width: 100%;
  padding: 5px;
  box-sizing: border-box;
}

@media (max-width: 850px) {
  .inputEnvioMensagem,
  .PickerFileMessage {
    width: 150px;
    min-width: 120px;
  }
}

@supports (-webkit-touch-callout: none) {
  .PickerFileMessage {
    width: auto !important;
    min-width: 120px;
  }
}

@media (min-width: 851px), (max-width: 1360px) {
  .inputEnvioMensagem,
  .PickerFileMessage {
    width: 200px !important;
  }
}

.emoji-picker {
  width: 100%;
}

@media (min-width: 600px) {
  .emoji-picker {
    width: 50vw;
  }
}

.mobile-mockup {
  width: 280px;
  height: 560px;
  border: 2px solid black;
  border-radius: 25px;
  background-color: #f0f0f0;
  padding: 10px;
  box-shadow: 3px 3px 10px rgba(0,0,0,0.2);
  position: relative;
  box-sizing: border-box;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
}

.mobile-notch {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 13px;
  background-color: black;
  border-radius: 0 0 8px 8px;
  z-index: 2;
  flex-shrink: 0;
}

.mobile-screen {
  width: 100%;
  height: 100%;
  background-color: #e5ddd5;
  border-radius: 15px;
  overflow: hidden;
  position: relative;
  padding-top: 25px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.mockup-preview-container {
  padding: 12px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  align-items: flex-end;
}

.mockup-preview-title {
  text-align: center;
  font-weight: bold;
  margin-bottom: 8px;
  color: #444;
  font-size: 0.8em;
  flex-shrink: 0;
}

.mockup-preview-card {
  background-color: #dcf8c6;
  border: 1px solid #c5e3a5;
  border-radius: 8px;
  padding: 8px 12px;
  overflow-y: auto;
  max-height: 75vh;
  max-width: 80%;
  width: fit-content;
  align-self: flex-end;
  box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
  margin-top: 5px;
  color: #303030;
}

.mockup-preview-content {
  white-space: pre-line;
  word-wrap: break-word;
  font-size: 0.8em;
  line-height: 1.4;
  text-align: left;
}

.preview-body {
  background-color: #ffffff;
  padding: 8px 12px;
  border-radius: 8px;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  margin: 0 5px 8px 5px;
  align-self: flex-start;
  max-width: 90%;
  word-wrap: break-word;
  white-space: pre-wrap;
  overflow-y: auto;
  color: #303030;
}

:deep(.body--dark) {
  .mobile-mockup {
    background-color: var(--q-color-dark-page, $grey-9);
    border-color: $grey-7;
    box-shadow: 0 4px 15px rgba(255, 255, 255, 0.1);
  }

  .mobile-screen {
    background-color: var(--q-color-dark, $dark);
  }

  .mockup-preview-title {
    color: var(--q-color-dark-text, $grey-5);
  }

  .mockup-preview-card {
    background-color: #056162;
    border-color: #0a7d7a;
    color: var(--q-color-light, $grey-1);
    box-shadow: 1px 1px 2px rgba(255, 255, 255, 0.05);
  }
}

.preview-container {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
  min-height: 200px;
}

.pdf-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  text-align: center;
}

.desktop-view {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mobile-view {
  display: flex;
  align-items: center;
  gap: 4px;
}

.galeria-item {
  transition: all 0.2s ease;
}

.galeria-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.galeria-item-selected {
  border: 2px solid $primary !important;
  background-color: $blue-1 !important;
}

.galeria-thumbnail {
  border-radius: 4px;
  overflow: hidden;
}

@media (max-width: 500px) {
  .inputEnvioMensagem {
    width: 100%;
  }
}

// Estilos para o overlay de mensagens rápidas
.quick-messages-overlay {
  background-color: rgba(0, 0, 0, 0.3) !important;
  
  .q-dark & {
    background-color: rgba(0, 0, 0, 0.5) !important;
  }
}

// Estilos para o modal de mensagens rápidas
.quick-messages-modal {
  background: white;
  
  &.q-dark {
    background: #424242;
    color: white;
    
    .q-item {
      color: white;
      
      .q-item__label {
        color: white;
      }
    }
  }
}

</style>

<style lang="sass" scoped>
// Variáveis
$breakpoint-dialog-stack: 992px
$primary-color: #007bff

.preview-card
  border: 0px
  max-height: 600px 
  overflow-y: auto 

.modal
  background: #fff
  padding: 20px
  border-radius: 8px
  box-shadow: 0 2px 10px rgba(0,0,0,0.1)
  position: fixed
  top: 50%
  left: 50%
  transform: translate(-50%, -50%)
  z-index: 1000

.input-group
  margin-bottom: 10px

.input-group label
  display: block
  margin-bottom: 5px

.input-group input
  width: 100%
  padding: 5px
  box-sizing: border-box


@media (max-width: 850px)
  .inputEnvioMensagem,
  .PickerFileMessage
    width: 150px

@media (min-width: 851px), (max-width: 1360px)
  .inputEnvioMensagem,
  .PickerFileMessage
    width: 200px !important

.emoji-picker
  width: 100%
    
// Estilo para o Card DENTRO do Dialog (Manter/Ajustar)
.dialog-template-preview // Classe no q-dialog
  .q-card // Estilo para o card
    min-width: 80vw
    max-width: 95vw
    max-height: 85vh
    overflow-y: auto

// --- Mockup Geral ---
.mobile-mockup
  width: 280px
  height: 550px
  border: 1px solid #ccc
  border-radius: 25px
  background-color: #f7f7f7
  padding: 10px
  box-shadow: 2px 2px 8px rgba(0,0,0,0.15)
  position: relative
  box-sizing: border-box
  margin-top: 10px
  display: flex
  flex-direction: column

.mobile-notch
  position: absolute
  top: 10px
  left: 50%
  transform: translateX(-50%)
  width: 70px
  height: 12px
  background-color: #333
  border-radius: 0 0 6px 6px
  z-index: 2
  flex-shrink: 0

.mobile-screen
  width: 100%
  height: 100%
  background-color: #e5ddd5
  border-radius: 15px
  overflow: hidden
  position: relative
  padding-top: 25px
  display: flex
  flex-direction: column
  box-sizing: border-box
  align-items: flex-start
  padding: 10px

// --- Balão de Mensagem Único ---
.preview-message-bubble
  background-color: #ffffff
  padding: 0
  border-radius: 8px
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.1)
  margin-TOP: 5px
  margin-bottom: 8px
  max-width: 90% // Largura padrão
  word-wrap: break-word
  display: flex
  flex-direction: column
  height: auto
  min-height: fit-content
  flex-grow: 0
  flex-shrink: 0

  // Classe para largura máxima com mídia
  &.bubble-max-width
    max-width: 95%
    width: 95%

  > div
    margin-bottom: 0 !important // Remove margem interna

// --- Componentes Dentro do Balão ---
.preview-header
  padding: 0
  border-bottom: 1px solid #f0f0f0
  flex-shrink: 0
  border-radius: 8px 8px 0 0
  overflow: hidden
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center
  min-height: 60px
  text-align: center

  .preview-header-icon // Ícones
    color: #a0a0a0
    margin: 15px 0

  .preview-header-image // Imagem
    display: block
    max-width: 100%

  .preview-header-text // Texto Header
    padding: 8px 12px
    font-weight: 600
    white-space: pre-wrap
    width: 100%
    align-self: flex-start

  .preview-header-caption // Legenda Mídia
    padding: 4px 8px
    background-color: rgba(0,0,0,0.05)
    border-radius: 4px
    font-size: 0.65em
    color: #555
    margin-top: 5px
    width: 95%
    word-break: break-all
    align-self: center

.preview-body
  padding: 8px 12px
  font-size: 0.8em
  line-height: 1.4
  white-space: pre-wrap
  overflow-y: auto
  min-height: 30px
  width: 100%

.preview-footer
  padding: 4px 12px
  font-size: 0.65em
  color: #8696a0 // Cinza WA
  text-align: right
  flex-shrink: 0
  margin-top: 4px
  width: 100%

.preview-buttons
  padding: 0
  border-top: 1px solid #f0f0f0
  flex-shrink: 0
  background-color: #fff
  border-radius: 0 0 8px 8px
  width: 100%

  .preview-quick-reply-buttons, .preview-action-buttons
      padding: 4px
      display: flex
      flex-wrap: wrap
      justify-content: center

  .preview-cta-button
    background-color: #fff
    border: 1px solid #d1d7db
    color: #007bff
    font-weight: 500
    border-radius: 25px
    margin: 4px !important
    text-transform: none
    box-shadow: none
    flex-grow: 1
    padding: 4px 10px

    .q-icon
      color: #007bff
      font-size: 1em
      margin-right: 4px

  .q-chip // Botões rápidos
    margin: 4px !important
    background-color: rgba(0, 122, 255, 0.1)
    color: #007AFF
    border: 1px solid rgba(0, 122, 255, 0.2)
    font-weight: 500
    .q-icon
      color: #007AFF

// Estilos para variáveis (manter)
\:deep(.preview-variable)
  background-color: #fff9c4
  padding: 1px 3px
  border-radius: 3px
  font-weight: 500
  border: 1px dashed #fbc02d
  color: #5f5f5f

\:deep(.preview-variable-missing)
  background-color: #ffebee
  padding: 1px 3px
  border-radius: 3px
  font-weight: 500
  border: 1px dashed #e57373
  color: #c62828

// Adaptações para Modo Escuro (converter de SCSS para SASS)
\:deep(.body--dark)
  .mobile-mockup
    background-color: #2a2a2a
    border-color: #555
  .mobile-notch
    background-color: #111
  .mobile-screen
    background-color: #121212
  .preview-message-bubble
    background-color: #262d31
    box-shadow: 0 1px 1px rgba(255, 255, 255, 0.05)
  .preview-header
    border-bottom-color: #3a3a3a
    .preview-header-icon
      color: #aeaeae
    .preview-header-text
      color: #e0e0e0
    .preview-header-caption
      background-color: #333
      color: #aaa
  .preview-body
    color: #f5f5f5
  .preview-footer
    color: #9e9e9e
  .preview-buttons
    border-top-color: #3a3a3a
    background-color: #262d31
    .preview-cta-button
      background-color: #424242
      border-color: #616161
      color: #90caf9
      .q-icon
        color: #90caf9
    .q-chip
      background-color: rgba(144, 202, 249, 0.15)
      border-color: rgba(144, 202, 249, 0.3)
      color: #90caf9
      .q-icon
        color: #90caf9
  \:deep(.preview-variable) // :deep aninhado
    background-color: #3a3a00
    border-color: #a09500
    color: #f0e68c
  \:deep(.preview-variable-missing)
    background-color: #4d0000
    border-color: #b71c1c
    color: #ffcdd2

</style>
