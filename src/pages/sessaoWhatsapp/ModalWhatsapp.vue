<template>
  <div>
    <q-dialog
      :model-value="modalWhatsapp"
      @update:model-value="v => $emit('update:modalWhatsapp', v)"
      @hide="fecharModal"
      @show="abrirModal"
      persistent
    >
      <q-card class="q-pa-md"
        style="width: 500px">
        <q-card-section>
          <div class="text-h6">
            <q-icon size="50px"
              class="q-mr-md"
              :name="whatsapp.type ? `img:${whatsapp.type}-logo.png` : 'mdi-alert'" /> {{ whatsapp.id ? $t('sessaoModalWhatsapp.editChannel')  :
                $t('sessaoModalWhatsapp.createChannel')
              }}
          </div>
        </q-card-section>
        <q-card-section>
          <div class="row">
            <div class="col-12 q-my-sm">
              <q-select :disable="!!whatsapp.id"
                v-model="whatsapp.type"
                :options="filteredOptionsWhatsappsTypes"
                :label="$t('sessaoModalWhatsapp.type')"
                emit-value
                map-options
                filled />
            </div>
            <div class="col-12 q-my-sm" v-if="(whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'meow') && whatsapp.status !== 'CONNECTED'">
              <q-checkbox v-model="showPairingCode" 
               :label="$t('sessaoModalWhatsapp.pairingCode')"
              />
            </div>
            <div class="col-12 q-my-sm" v-if="showPairingCode && (whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'meow')">
              <q-input v-model="whatsapp.wppUser" type="number" 
              :label="$t('sessaoModalWhatsapp.exactNumber')"
              filled />
            </div>
            <div class="col-12"
              style="margin-bottom: 20px; margin-top: 10px;"
              v-if="whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'evo'  || whatsapp.type === 'meow' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi'">
              <div class="q-tabs row items-center">
                <div class="q-tab" :class="{ 'q-tab--active': activeTab === 'tab1' }" @click="activeTab = 'tab1'" :style="{ backgroundColor: $q.dark.isActive ? '#363636' : '#f2f2f2', borderRadius: '10px 10px 0 0', textTransform: 'capitalize' }">{{ $t('sessaoModalWhatsapp.informationTab') }}</div>
                <div class="q-tab" :class="{ 'q-tab--active': activeTab === 'tab2' }" @click="activeTab = 'tab2'" :style="{ backgroundColor: $q.dark.isActive ? '#464646' : '#e2e2e2', borderRadius: '10px 10px 0 0', textTransform: 'capitalize' }">{{ $t('sessaoModalWhatsapp.recommendationsTab') }}</div>
              </div>
              
              <div v-if="activeTab === 'tab1'" class="q-pa-md" :style="{ backgroundColor: $q.dark.isActive ? '#363636' : '#f2f2f2' }">
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[0]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[1]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[2]') }}</li>
              </div>
              
              <div v-if="activeTab === 'tab2'" class="q-pa-md" :style="{ backgroundColor: $q.dark.isActive ? '#464646' : '#e2e2e2' }">
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[3]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[4]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[5]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[6]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[7]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[8]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[9]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[10]') }}</li>
                <!-- Conteúdo da segunda aba aqui -->
              </div>
            </div>
            <!-- <div class="col-12"
              style="margin-bottom: 20px; margin-top: 10px;"
              v-if="whatsapp.type === 'instagram'">
              <div class="q-tabs row items-center">
                <div class="q-tab" :class="{ 'q-tab--active': activeTab === 'tab1' }" @click="activeTab = 'tab1'" :style="{ backgroundColor: $q.dark.isActive ? '#363636' : '#f2f2f2', borderRadius: '10px 10px 0 0', textTransform: 'capitalize' }">{{ $t('sessaoModalWhatsapp.informationTab') }}</div>
                <div class="q-tab" :class="{ 'q-tab--active': activeTab === 'tab2' }" @click="activeTab = 'tab2'" :style="{ backgroundColor: $q.dark.isActive ? '#464646' : '#e2e2e2', borderRadius: '10px 10px 0 0', textTransform: 'capitalize' }">{{ $t('sessaoModalWhatsapp.recommendationsTab') }}</div>
              </div>
              
              <div v-if="activeTab === 'tab1'" class="q-pa-md" :style="{ backgroundColor: $q.dark.isActive ? '#363636' : '#f2f2f2' }">
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[7]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[8]') }}</li>
              </div>
              
              <div v-if="activeTab === 'tab2'" class="q-pa-md" :style="{ backgroundColor: $q.dark.isActive ? '#464646' : '#e2e2e2' }">
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[9]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wppWarning[10]') }}</li>
              </div>
            </div> -->
            <div class="col-12"
              style="margin-bottom: 20px; margin-top: 10px;"
              v-if="whatsapp.type === 'waba'">
              <div class="q-tabs row items-center">
                <div class="q-tab" :class="{ 'q-tab--active': activeTab === 'tab1' }" @click="activeTab = 'tab1'" :style="{ backgroundColor: $q.dark.isActive ? '#363636' : '#f2f2f2', borderRadius: '10px 10px 0 0', textTransform: 'capitalize' }">Informações</div>
                
              </div>
              
              <div v-if="activeTab === 'tab1'" class="q-pa-md" :style="{ backgroundColor: $q.dark.isActive ? '#363636' : '#f2f2f2' }">
                <li>{{ $t('sessaoModalWhatsapp.wabaAdvantages[0]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wabaAdvantages[1]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wabaAdvantages[2]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wabaAdvantages[3]') }}</li>
                <li>{{ $t('sessaoModalWhatsapp.wabaAdvantages[4]') }}</li>
              </div>
              
            </div>
            <div class="col-12 section primary-gradient">
              <c-input outlined
                label="Nome"
                v-model="whatsapp.name"
                :disable="whatsapp.id && ['evo'].includes(whatsapp.type)"
                :validator="v$.whatsapp.name"
                @blur="v$.whatsapp.name.$touch" />
                <p style="font-size: 10px;margin-top: 10px" v-if="whatsapp.type === 'evo'">
                  {{ $t('sessaoModalWhatsapp.attentionEvo') }}
                </p>
            </div>
            <div class="col-12 section primary-gradient" v-if="whatsapp.type !== 'webmail'">
              <div class="col-12 q-my-sm">
                <div class="text-bold q-mb-xs">{{ $t('sessao.chatbot') }}</div>
                <q-select
                  outlined
                  dense
                  :label="$t('sessao.chatbot')"
                  v-model="whatsapp.chatFlowId"
                  :options="listaChatFlow"
                  map-options
                  emit-value
                  option-value="id"
                  option-label="name"
                  clearable
                  filled
                />
              </div>
              <div class="col-12 q-my-sm">
                <div class="text-bold q-mb-xs">{{ $t('sessao.queue') }}</div>
                <q-select
                  outlined
                  dense
                  :label="$t('sessao.queue')"
                  v-model="whatsapp.queueId"
                  :options="filas"
                  map-options
                  emit-value
                  option-value="id"
                  option-label="queue"
                  clearable
                  filled
                >
                  <q-tooltip>
                    {{ $t('sessao.noQueueTooltip') }}
                  </q-tooltip>
                </q-select>
              </div>
              <div class="col-12 q-my-sm">
                <div class="text-bold q-mb-xs">{{ $t('sessao.user') }}</div>
                <q-select
                  outlined
                  dense
                  :label="$t('sessao.user')"
                  v-model="whatsapp.userId"
                  :options="listaUsuario"
                  map-options
                  emit-value
                  option-value="id"
                  option-label="name"
                  clearable
                  filled
                >
                  <q-tooltip>
                    {{ $t('sessao.noUserTooltip') }}
                  </q-tooltip>
                </q-select>
              </div>
            </div>
            <div class="col-12 q-my-sm" v-if="whatsapp.type === 'hub'">
              <q-select v-model="selectedHubOption"
                :options="hubOptions"
                :label="$t('sessaoModalWhatsapp.selectHub')"
                filled />
            </div>
            <div class="col-12 section primary-gradient" v-if="whatsapp.type === 'baileys'">
              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>{{ $t('sessaoModalWhatsapp.importMessage') }}</q-item-label>
                  <q-item-label caption> {{ $t('sessaoModalWhatsapp.importMessageCaption') }} </q-item-label>
                </q-item-section>

                <q-item-section avatar>
                  <q-toggle
                    v-model="whatsapp.importMessages"
                    checked-icon="check"
                    keep-color
                    :color="whatsapp.importMessages ? 'green' : 'negative'"
                    size="md"
                    unchecked-icon="clear"
                />
                </q-item-section>
              </q-item>
              <div v-if="whatsapp.importMessages">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.importGroupMessage') }}</q-item-label>
                  </q-item-section>
                  <q-item-section avatar>
                    <q-toggle
                        v-model="whatsapp.importOldMessagesGroups"
                        checked-icon="check"
                        keep-color
                        :color="whatsapp.importOldMessagesGroups ? 'green' : 'negative'"
                        size="md"
                        unchecked-icon="clear"
                    />
                  </q-item-section>
                </q-item>
                
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.finalizeTicket') }}</q-item-label>
                  </q-item-section>
                  <q-item-section avatar>
                    <q-toggle
                        v-model="whatsapp.closedTicketsPostImported"
                        checked-icon="check"
                        keep-color
                        :color="whatsapp.closedTicketsPostImported ? 'green' : 'negative'"
                        size="md"
                        unchecked-icon="clear"
                    />
                  </q-item-section>
                </q-item>

                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.dateHourSync') }}</q-item-label>
                  </q-item-section>
                  <q-item-section>
                    <q-popup-proxy ref="qDateProxy1" transition-show="scale" transition-hide="scale" cover>
                      <q-date v-model="whatsapp.importStartDate" mask="YYYY-MM-DD" @update:model-value="handleStartDateChange">
                        <q-popup-proxy ref="qTimeProxy1" v-model="showTime1" transition-show="scale" transition-hide="scale" cover>
                          <q-time v-model="whatsapp.importStartTime" format24h @update:model-value="handleStartTimeChange">
                            <div class="row items-center justify-end q-pa-sm">
                              <q-btn flat label="OK" color="primary" @click="confirmStartDateTime" />
                            </div>
                          </q-time>
                        </q-popup-proxy>
                      </q-date>
                    </q-popup-proxy>
                    <q-input v-model="displayStartDate" readonly
                      @focus="$refs.qDateProxy1.show()" :label="$t('sessaoModalWhatsapp.dateHourSync') " filled />
                  </q-item-section>
                </q-item>

                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.dateHourEndSync') }}</q-item-label>
                  </q-item-section>
                  <q-item-section>
                    <q-popup-proxy ref="qDateProxy2" transition-show="scale" transition-hide="scale" cover>
                      <q-date v-model="whatsapp.importEndDate" mask="YYYY-MM-DD" @update:model-value="handleEndDateChange">
                        <q-popup-proxy ref="qTimeProxy2" v-model="showTime2" transition-show="scale" transition-hide="scale" cover>
                          <q-time v-model="whatsapp.importEndTime" format24h @update:model-value="handleEndTimeChange">
                            <div class="row items-center justify-end q-pa-sm">
                              <q-btn flat :label="$t('sessaoModalWhatsapp.ok')" color="primary" @click="confirmEndDateTime" />
                            </div>
                          </q-time>
                        </q-popup-proxy>
                      </q-date>
                    </q-popup-proxy>
                    <q-input v-model="displayEndDate" readonly
                      @focus="$refs.qDateProxy2.show()" :label="$t('sessaoModalWhatsapp.dateHourEndSync')" filled />
                  </q-item-section>
                </q-item>


                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.queueImport') }}</q-item-label>
                  </q-item-section>
                  <q-item-section>
                    <q-select v-model="whatsapp.messageQueue" :options="filas" option-value="id" option-label="queue" label="Selecione a Fila" filled />
                  </q-item-section>
                </q-item>
                <q-banner style="margin-top: 10px" class="bg-yellow text-black" inline-actions>
                  <div class="text-h6">{{ $t('sessaoModalWhatsapp.attention') }}</div>
                  <p>{{ $t('sessaoModalWhatsapp.qrCodeWarning1') }}</p>
                  <p>{{ $t('sessaoModalWhatsapp.qrCodeWarning2') }}</p>
                </q-banner>
              </div>
            </div>
            <template v-if="whatsapp.type === 'messenger'">
              <VFacebookLogin :app-id="cFbAppId"
                @sdk-init="handleSdkInit"
                @login="fbLogin"
                :login-options="FBLoginOptions"
                version="v12.0" />
            </template>
            <div class="section primary-gradient col-12" v-if="whatsapp.type === 'telegram'">
              <div class="col-12 q-mt-md"
                v-if="whatsapp.type === 'telegram'">
                <c-input outlined class="blur-effect"
                  :label="$t('sessaoModalWhatsapp.tokenTelegram')"
                  v-model="whatsapp.tokenTelegram" />
              </div>
            </div>
            <div class="col-12 section primary-gradient" v-if="whatsapp.type === 'waba'">
              <div class="text-h8" v-if="whatsapp.type === 'waba'" style="margin-top: 20px;">WABA</div>
              <div class="col-12 q-mt-md"
                v-if="whatsapp.type === 'waba'">
                <c-input outlined class="blur-effect"
                  :label="$t('sessaoModalWhatsapp.numberId')"
                  v-model="whatsapp.tokenAPI" />
              </div>
              <div class="col-12 q-mt-md"
                v-if="whatsapp.type === 'waba'">
                <c-input outlined class="blur-effect"
                  :label="$t('sessaoModalWhatsapp.bmId')"
                  v-model="whatsapp.wabaId" />
              </div>
              <div class="col-12 q-mt-md"
                v-if="whatsapp.type === 'waba'">
                <c-input outlined class="blur-effect"
                  :label="$t('sessaoModalWhatsapp.tokenWaba')"
                  v-model="whatsapp.bmToken" />
              </div>
              <div class="col-12 q-mt-md"
                v-if="whatsapp.type === 'waba'">
                <c-input outlined class="blur-effect"
                  :label="$t('sessaoModalWhatsapp.apiVersion')"
                  v-model="whatsapp.wabaVersion" />
              </div>
            </div>
            <div class="col-12 section primary-gradient" v-if="whatsapp.type === 'instagram'">
              <div class="text-h8" v-if="whatsapp.type === 'instagram'" style="margin-top: 20px;">Instagram</div>
              <div class="col-12 q-mt-md"
                v-if="whatsapp.type === 'instagram'">
                <c-input outlined class="blur-effect"
                  :label="$t('sessaoModalWhatsapp.instagramId')"
                  v-model="whatsapp.tokenAPI" />
              </div>
              <div class="col-12 q-mt-md"
                v-if="whatsapp.type === 'instagram'">
                <c-input outlined class="blur-effect"
                  :label="$t('sessaoModalWhatsapp.tokenInstagram')"
                  v-model="whatsapp.bmToken" />
              </div>
              <div class="col-12 q-mt-md"
                v-if="whatsapp.type === 'instagram'">
                <c-input outlined class="blur-effect"
                  :label="$t('sessaoModalWhatsapp.tokenWaba')"
                  v-model="whatsapp.wabaId" />
              </div>
              <div class="col-12 q-mt-md"
                v-if="whatsapp.type === 'instagram'">
                <c-input outlined class="blur-effect"
                  :label="$t('sessaoModalWhatsapp.apiVersion')"
                  v-model="whatsapp.wabaVersion" />
              </div>
            </div>
            <div class="col-12 section primary-gradient" v-if="whatsapp.type === 'messenger'">
              <div class="text-h8" v-if="whatsapp.type === 'messenger'" style="margin-top: 20px;">Messenger</div>
              <div class="col-12 q-mt-md"
                v-if="whatsapp.type === 'messenger'">
                <c-input outlined class="blur-effect"
                  :label="$t('sessaoModalWhatsapp.messengerPageId')"
                  v-model="whatsapp.tokenAPI" />
              </div>
              <div class="col-12 q-mt-md"
                v-if="whatsapp.type === 'messenger'">
                <c-input outlined class="blur-effect"
                  :label="$t('sessaoModalWhatsapp.tokenWaba')"
                  v-model="whatsapp.bmToken" />
              </div>
              <div class="col-12 q-mt-md"
                v-if="whatsapp.type === 'messenger'">
                <c-input outlined class="blur-effect"
                  :label="$t('sessaoModalWhatsapp.apiVersion')"
                  v-model="whatsapp.wabaVersion" />
              </div>
            </div>
            <div class="col-12 section primary-gradient" v-if="whatsapp.type === 'zapi' || whatsapp.type === 'uazapi'">
              <div class="text-h8" v-if="whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger'" style="margin-top: 20px;">API</div>
              <div class="col-12 q-mt-md"
                v-if="whatsapp.type === 'zapi' || whatsapp.type === 'uazapi'">
                <c-input outlined class="blur-effect"
                  :label="$t('sessaoModalWhatsapp.tokenNumber')"
                  v-model="whatsapp.tokenAPI" />
              </div>
              <div class="col-12 q-mt-md"
                v-if="whatsapp.type === 'zapi' || whatsapp.type === 'uazapi'">
                <c-input outlined class="blur-effect"
                  :label="$t('sessaoModalWhatsapp.idNumber')"
                  v-model="whatsapp.wabaId" />
              </div>
            </div>
            <!-- <div class="q-mt-md row full-width justify-center"
              v-if="whatsapp.type === 'instagram'">
              <div class="col">
                <fieldset class="full-width q-pa-md">
                  <legend>{{ $t('sessaoModalWhatsapp.igData') }}</legend>
                  <div class="col-12 q-mb-md"
                    v-if="whatsapp.type === 'instagram'">
                    <c-input outlined
                      :label="$t('sessaoModalWhatsapp.user')"
                      v-model="whatsapp.instagramUser"
                      hint="Seu usuário do Instagram (sem @)" />
                  </div>
                  <div v-if="whatsapp.type === 'instagram' && !isEdit"
                    class="text-center">
                    <q-btn flat
                      color="info"
                      class="bg-padrao"
                      icon="edit"
                      label="New passaword"
                      @click="isEdit = !isEdit">
                      <q-tooltip>
                        Change Password
                      </q-tooltip>
                    </q-btn>
                  </div>
                  <div class="col-12"
                    v-if="whatsapp.type === 'instagram' && isEdit">
                    <c-input filled
                      label="Senha"
                      :type="isPwd ? 'password' : 'text'"
                      v-model="whatsapp.instagramKey"
                      hint="Senha utilizada para logar no Instagram"
                      placeholder="*************"
                      :disable="!isEdit">
                      <template v-slot:after>
                        <q-btn class="bg-padrao"
                          round
                          flat
                          color="negative"
                          icon="mdi-close"
                          @click="isEdit = !isEdit">
                          <q-tooltip>
                            Cancelar alteração de senha
                          </q-tooltip>

                        </q-btn>
                      </template>
                      <template v-slot:append>
                        <q-icon :name="isPwd ? 'visibility_off' : 'visibility'"
                          class="cursor-pointer"
                          @click="isPwd = !isPwd" />
                      </template>
                    </c-input>
                  </div>
                </fieldset>

              </div>

            </div> -->
          </div>

          <!-- Configuração SMTP para WebMail -->
          <div class="q-mt-md row full-width justify-center"
            v-if="whatsapp.type === 'webmail'">
            <div class="col">
              <fieldset class="full-width q-pa-md">
                <legend>{{ $t('sessaoModalWhatsapp.novo.configuracaoSmtp') }}</legend>
                <div class="col-12 q-mb-md">
                  <c-input outlined
                    :label="$t('sessaoModalWhatsapp.novo.servidorSmtp')"
                    v-model="whatsapp.smtpConfig.host"
                    :hint="$t('sessaoModalWhatsapp.novo.exemploSmtp')" />
                </div>
                <div class="col-12 q-mb-md">
                  <c-input outlined
                    :label="$t('sessaoModalWhatsapp.novo.porta')"
                    type="number"
                    v-model="whatsapp.smtpConfig.port"
                    :hint="$t('sessaoModalWhatsapp.novo.exemploPorta')" />
                </div>
                <div class="col-12 q-mb-md">
                  <q-item tag="label" v-ripple>
                    <q-item-section>
                      <q-item-label>{{ $t('sessaoModalWhatsapp.novo.conexaoSegura') }}</q-item-label>
                      <q-item-label caption>{{ $t('sessaoModalWhatsapp.novo.habilitarConexaoSegura') }}</q-item-label>
                    </q-item-section>
                    <q-item-section avatar>
                      <q-toggle
                        v-model="whatsapp.smtpConfig.secure"
                        checked-icon="check"
                        keep-color
                        :color="whatsapp.smtpConfig.secure ? 'green' : 'negative'"
                        size="md"
                        unchecked-icon="clear"
                      />
                    </q-item-section>
                  </q-item>
                </div>
                <div class="col-12 q-mb-md">
                  <c-input outlined
                    :label="$t('sessaoModalWhatsapp.novo.usuarioEmail')"
                    v-model="whatsapp.smtpConfig.auth.user"
                    :hint="$t('sessaoModalWhatsapp.novo.seuEmailAutenticacao')" />
                </div>
                <div class="col-12 q-mb-md">
                  <c-input outlined
                    :label="$t('sessaoModalWhatsapp.novo.senha')"
                    :type="isPwd ? 'password' : 'text'"
                    v-model="whatsapp.smtpConfig.auth.pass"
                    :hint="$t('sessaoModalWhatsapp.novo.senhaAplicativo')" >
                    <template v-slot:append>
                      <q-icon
                        :name="isPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isPwd = !isPwd"
                      />
                    </template>
                  </c-input>
                </div>
                <div class="col-12 q-mb-md">
                  <c-input outlined
                    :label="$t('sessaoModalWhatsapp.novo.emailRemetente')"
                    v-model="whatsapp.smtpConfig.from"
                    :hint="$t('sessaoModalWhatsapp.novo.emailRemetenteHint')" />
                </div>
                <div class="col-12 q-mb-md">
                  <c-input outlined
                    :label="$t('sessaoModalWhatsapp.novo.emailResposta')"
                    v-model="whatsapp.smtpConfig.replyTo"
                    :hint="$t('sessaoModalWhatsapp.novo.emailRespostaHint')" />
                </div>

                <!-- Configuração OAuth2 para Gmail -->
                <div v-if="isGmailProvider" class="q-mb-md">
                  <q-separator class="q-my-md" />
                  <div class="text-subtitle2 q-mb-sm text-primary">
                    <q-icon name="security" class="q-mr-sm" />
                    {{ $t('sessaoModalWhatsapp.novo.configuracaoOAuth2') }}
                  </div>
                  
                  <div class="col-12 q-mb-md">
                    <c-input outlined
                      :label="$t('sessaoModalWhatsapp.novo.clientIdOAuth2')"
                      v-model="whatsapp.smtpConfig.oauth2.client_id"
                      :hint="$t('sessaoModalWhatsapp.novo.clientIdOAuth2Hint')"
                      :placeholder="$t('sessaoModalWhatsapp.novo.exemploClientIdOAuth2')" />
                  </div>
                  
                  <div class="col-12 q-mb-md">
                    <c-input outlined
                      :label="$t('sessaoModalWhatsapp.novo.clientSecretOAuth2')"
                      :type="isOAuth2Secret ? 'password' : 'text'"
                      v-model="whatsapp.smtpConfig.oauth2.client_secret"
                      :hint="$t('sessaoModalWhatsapp.novo.clientSecretOAuth2Hint')">
                      <template v-slot:append>
                        <q-icon
                          :name="isOAuth2Secret ? 'visibility_off' : 'visibility'"
                          class="cursor-pointer"
                          @click="isOAuth2Secret = !isOAuth2Secret"
                        />
                      </template>
                    </c-input>
                  </div>
                  
                  <div class="col-12 q-mb-md">
                    <c-input outlined
                      :label="$t('sessaoModalWhatsapp.novo.redirectUri')"
                      v-model="whatsapp.smtpConfig.oauth2.redirect_uri"
                      :hint="$t('sessaoModalWhatsapp.novo.redirectUriHint')"
                      :placeholder="$t('sessaoModalWhatsapp.novo.exemploRedirectUri')" />
                  </div>
                  
                  <q-banner class="bg-blue-1 text-blue-9 q-mb-md">
                    <template v-slot:avatar>
                      <q-icon name="info" color="blue" />
                    </template>
                    <strong>{{ $t('sessaoModalWhatsapp.novo.comoObterCredenciaisOAuth2') }}</strong>
                    <ol class="q-mt-sm">
                      <li>{{ $t('sessaoModalWhatsapp.novo.acessarGoogleCloudConsole') }}</li>
                      <li>{{ $t('sessaoModalWhatsapp.novo.criarProjeto') }}</li>
                      <li>{{ $t('sessaoModalWhatsapp.novo.habilitarGmailAPI') }}</li>
                      <li>{{ $t('sessaoModalWhatsapp.novo.criarCredenciaisOAuth2') }}</li>
                      <li>{{ $t('sessaoModalWhatsapp.novo.configureUrlsAutorizadas') }}</li>
                    </ol>
                  </q-banner>
                </div>

                <!-- Botão de Autenticação OAuth2 para Gmail -->
                <div v-if="isGmailProvider" class="q-mb-md">
                  <q-banner class="bg-blue-1 text-blue-9 q-mb-md">
                    <template v-slot:avatar>
                      <q-icon name="info" color="blue" />
                    </template>
                    <strong>{{ $t('sessaoModalWhatsapp.novo.gmailOAuth2') }}</strong> {{ $t('sessaoModalWhatsapp.novo.gmailOAuth2Hint') }}
                    <template v-slot:action>
                      <q-btn 
                        flat 
                        color="blue" 
                        :label="$t('sessaoModalWhatsapp.novo.configurarOAuth2')" 
                        @click="configureGmailOAuth2Method"
                        :loading="whatsapp.oauth2Loading"
                      />
                    </template>
                  </q-banner>
                  
                  <div v-if="whatsapp.smtpConfig.oauth2?.access_token" class="q-mb-md">
                    <q-banner class="bg-green-1 text-green-9">
                      <template v-slot:avatar>
                        <q-icon name="check_circle" color="green" />
                      </template>
                      <strong>{{ $t('sessaoModalWhatsapp.novo.oAuth2Configurado') }}</strong> {{ $t('sessaoModalWhatsapp.novo.oAuth2ConfiguradoHint') }}
                      <div class="q-mt-sm text-caption">
                        <strong>{{ $t('sessaoModalWhatsapp.novo.status') }}</strong> {{ $t('sessaoModalWhatsapp.novo.statusHint') }}
                      </div>
                    </q-banner>
                  </div>
                </div>

                <!-- Status da Conexão -->
                <div class="q-mb-md">
                  <q-banner :class="connectionStatusClass" class="q-mb-md">
                    <template v-slot:avatar>
                      <q-icon :name="connectionStatusIcon" />
                    </template>
                    <strong>{{ $t('sessaoModalWhatsapp.novo.statusDaConexao') }}</strong> {{ connectionStatusText }}
                    <div class="q-mt-sm text-caption">
                      <strong>{{ $t('sessaoModalWhatsapp.novo.protocoloAtivo') }}</strong> {{ connectionStatus.workingProtocol?.toUpperCase() || 'NENHUM' }}
                    </div>
                    <div v-if="connectionStatus.errorDetails" class="q-mt-sm text-caption">
                      <strong>{{ $t('sessaoModalWhatsapp.novo.detalhes') }}</strong> {{ connectionStatus.errorDetails }}
                    </div>
                  </q-banner>
                </div>

                <!-- Configuração POP3 Manual (Opcional) -->
                <!-- 
                <div class="q-mb-md">
                  <q-checkbox 
                    v-model="showPop3Config" 
                    label="Configurar POP3 manualmente (opcional)"
                  />
                </div>
                
                <div v-if="showPop3Config" class="q-mb-md">
                  <c-input
                    v-model="whatsapp.smtpConfig.pop3.host"
                    label="Servidor POP3"
                    placeholder="Ex: pop.gmail.com"
                  />
                  
                  <c-input
                    v-model="whatsapp.smtpConfig.pop3.port"
                    label="Porta POP3"
                    type="number"
                    placeholder="Ex: 995"
                  />
                  
                  <q-toggle
                    v-model="whatsapp.smtpConfig.pop3.tls"
                    label="Conexão TLS POP3"
                    color="primary"
                  />
                </div>
                -->

                <!-- Botões de teste -->
                <div class="col-12 q-mt-md">
                  <div class="row q-gutter-sm">
                    <q-btn
                      color="primary"
                      :label="$t('sessaoModalWhatsapp.novo.testarSmtp')"
                      @click="testSmtpConnectionMethod"
                      :loading="whatsapp.smtpTestLoading"
                      icon="send"
                    />
                    <!-- 
                    <q-btn
                      color="secondary"
                      label="Testar IMAP"
                      @click="testImapConnectionMethod"
                      :loading="whatsapp.imapTestLoading"
                      icon="inbox"
                    />
                    <q-btn
                      color="info"
                      label="Testar POP3"
                      @click="testPop3ConnectionMethod"
                      :loading="whatsapp.pop3TestLoading"
                      icon="download"
                    />
                    -->
                    <q-btn
                      color="warning"
                      :label="$t('sessaoModalWhatsapp.novo.verificarStatus')"
                      @click="checkConnectionStatusMethod"
                      :loading="whatsapp.statusCheckLoading"
                      icon="info"
                    />
                  </div>
                </div>
              </fieldset>
            </div>
          </div>

          <!-- Configuração IMAP (Recebimento de Emails) -->
          <!-- 
          <div v-if="whatsapp.type === 'webmail'" class="q-mt-md">
            <fieldset class="q-pa-md" style="border: 1px solid #ccc; border-radius: 8px;">
              <legend class="q-px-sm" style="font-weight: bold; color: #1976d2;">Configuração IMAP (Recebimento de Emails)</legend>
              
              <div v-if="isGmailProvider" class="q-mb-md">
                <q-banner class="bg-blue-1 text-blue-9 q-mb-md">
                  <template v-slot:avatar>
                    <q-icon name="info" color="blue" />
                  </template>
                  <strong>Gmail OAuth2:</strong> O Gmail exige autenticação OAuth2 para aplicações de terceiros.
                  <template v-slot:action>
                    <q-btn 
                      flat 
                      color="blue" 
                      label="Configurar OAuth2" 
                      @click="configureGmailOAuth2Method"
                      :loading="whatsapp.oauth2Loading"
                    />
                  </template>
                </q-banner>
                
                <div v-if="whatsapp.smtpConfig.oauth2?.access_token" class="q-mb-md">
                  <q-banner class="bg-green-1 text-green-9">
                    <template v-slot:avatar>
                      <q-icon name="check_circle" color="green" />
                    </template>
                    <strong>OAuth2 Configurado:</strong> Autenticação OAuth2 ativa para Gmail.
                    <div class="q-mt-sm text-caption">
                      <strong>Status:</strong> Autenticado e funcionando
                    </div>
                  </q-banner>
                </div>
              </div>
              
              <c-input
                v-model="whatsapp.smtpConfig.imap.host"
                label="Servidor IMAP"
                placeholder="Ex: imap.gmail.com"
                :rules="[val => !!val || 'Servidor IMAP é obrigatório']"
              />
              
              <c-input
                v-model="whatsapp.smtpConfig.imap.port"
                label="Porta IMAP"
                type="number"
                placeholder="Ex: 993"
                :rules="[val => !!val || 'Porta IMAP é obrigatória']"
              />
              
              <q-toggle
                v-model="whatsapp.smtpConfig.imap.tls"
                label="Conexão TLS IMAP"
                color="primary"
              />
            </fieldset>
          </div>
          -->

          <div class="row q-my-md">
            <div class="section primary-gradient col-12" v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram'  || whatsapp.type.includes('hub') || whatsapp.type === 'webchat' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi')">
              <div class="text-h8" v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat') " style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.chatGptConfig.title') }}</div>
              <div class="col-12 " v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat') ">
                <label class="text-caption">ChatGPT API Key:</label>
                <input ref="apiKey"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder="$t('sessaoModalWhatsapp.chatGptConfig.apiKey')"
                  dense
                  outlined
                  v-model="whatsapp.chatgptApiKey" />
              </div>
              <div class="col-12" v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat') ">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.chatGptConfig.organizationKey') }}</label>
                <input ref="orgKey"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder="$t('sessaoModalWhatsapp.chatGptConfig.organizationKey')"
                  dense
                  outlined
                  v-model="whatsapp.chatgptOrganizationId" />
              </div>
              <div class="col-12" v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat') ">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.chatGptConfig.stopWord') }}</label>
                <input ref="sairGpt"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.chatGptConfig.stopWord')"
                  dense
                  outlined
                  v-model="whatsapp.chatgptOff" />
              </div>
              <div class="col-12" v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat') ">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.chatGptConfig.prompt') }}</label>
                <textarea ref="inputPrompt"
                  style="min-height: 15vh; max-height: 15vh;"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.chatGptConfig.prompt')"
                  autogrow
                  dense
                  outlined
                  v-model="whatsapp.chatgptPrompt" />
              </div>
              <label v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat') " class="text-caption">{{ $t('sessaoModalWhatsapp.chatGptConfig.resetPrompt') }}</label>
              <q-btn round
                flat
                dense
                @click="limparGpts()"
                v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat') "
                >
                <q-icon size="2em"
                  name="mdi-restore" />
                <q-tooltip>
                  {{ $t('sessaoModalWhatsapp.chatGptConfig.resetHistory') }}
                </q-tooltip>
              </q-btn>
              <div class="col-12" v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo'|| whatsapp.type === 'zapi' || whatsapp.type === 'uazapi'  || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat') ">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.chatGptConfig.assistantOption') }}</label>
                <input ref="inputAssistant"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.chatGptConfig.assistantId')"
                  dense
                  outlined
                  v-model="whatsapp.assistantId" />
              </div>
              <label v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat') " class="text-caption">Ao usar o Assistente o Prompt será desconsiderado</label>
              <q-btn round
                flat
                dense
                @click="assistenteNulo()"
                v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat') "
                >
                <q-icon size="2em"
                  name="mdi-restore" />
                <q-tooltip>
                  {{ $t('sessaoModalWhatsapp.chatGptConfig.removeAssistant') }}
                </q-tooltip>
              </q-btn>
              <div class="col-12 " v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat') ">
                <label class="text-caption">ChatGPT Model:</label>
                <input ref="model"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.chatGptConfig.model')"
                  dense
                  outlined
                  v-model="whatsapp.chatgptModel" />
              </div>
              <div class="col-12 " v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat') ">
                <label class="text-caption">ChatGPT Voice Model:</label>
                <input ref="model"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.chatGptConfig.voiceModel')"
                  dense
                  outlined
                  v-model="whatsapp.chatgptVoiceModel" />
              </div>
              <div class="col-12 " v-if="chatgptAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat') ">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.chatGptConfig.chatgptVoice') }}</q-item-label>
                    <q-item-label caption> {{ $t('sessaoModalWhatsapp.chatGptConfig.chatgptVoice') }} </q-item-label>
                  </q-item-section>

                <q-item-section avatar>
                  <q-toggle
                      v-model="whatsapp.chatgptVoice"
                      false-value="disabled"
                      true-value="enabled"
                      checked-icon="check"
                      keep-color
                      :color="whatsapp.chatgptVoice === 'enabled' ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                  />
                  </q-item-section>
                </q-item>
              </div>
            </div>

            <div class="section primary-gradient col-12" v-if="typebotAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
              <div class="text-h8" v-if="typebotAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat'  ) " style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.typeConfig.title') }}</div>
              <div class="col-12" v-if="typebotAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.typeConfig.url') }}:</label>
                <input ref="inputAssistant"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder="$t('sessaoModalWhatsapp.typeConfig.url')"
                  dense
                  outlined
                  v-model="whatsapp.typebotUrl" />
              </div>
              <div class="col-12" v-if="typebotAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.typeConfig.name') }}:</label>
                <input ref="inputAssistant"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder="$t('sessaoModalWhatsapp.typeConfig.name') "
                  dense
                  outlined
                  v-model="whatsapp.typebotName" />
              </div>
              <div class="col-12" v-if="typebotAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.typeConfig.restartWord') }}:</label>
                <input ref="inputAssistant"
                  class="q-pa-sm bg-white full-width"
                  :placeholder=" $t('sessaoModalWhatsapp.typeConfig.restartWord')"
                  dense
                  outlined
                  v-model="whatsapp.typebotRestart" />
              </div>
              <div class="col-12" v-if="typebotAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.typeConfig.stopWord') }}:</label>
                <input ref="inputAssistant"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.typeConfig.stopWord')"
                  dense
                  outlined
                  v-model="whatsapp.typebotOff" />     
              </div>

              <div class="col-12" v-if="typebotAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.typeConfig.unknowMessage') }}:</label>
                <input ref="inputAssistant"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.typeConfig.unknowMessage') "
                  dense
                  outlined
                  v-model="whatsapp.typebotUnknowMessage" />     
              </div>

              <div class="col-12" v-if="typebotAtivo === 'enabled' && (whatsapp.type === 'waba' || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.typeConfig.buttonChoose') }}:</label>
                <input ref="inputAssistant"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.typeConfig.buttonChoose') "
                  dense
                  outlined
                  v-model="whatsapp.typebotButtonChoiceMessage" />     
              </div>
              
              <div class="col-12" v-if="typebotAtivo === 'enabled' && (whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'webchat')">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.typeConfig.buttons') }}</q-item-label>
                    <q-item-label caption> {{ $t('sessaoModalWhatsapp.typeConfig.buttonWarning') }} </q-item-label>
                  </q-item-section>

                <q-item-section avatar>
                  <q-toggle
                      v-model="whatsapp.isButton"
                      false-value="disabled"
                      true-value="enabled"
                      checked-icon="check"
                      keep-color
                      :color="whatsapp.isButton === 'enabled' ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                  />
                  </q-item-section>
                </q-item>
              </div>
            </div>

            <div class="section primary-gradient col-12" v-if="difyAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
              <div class="text-h8" v-if="difyAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat' ) " style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.difyConfig.title') }}</div>
              <div class="col-12" v-if="difyAtivo === 'enabled' && (whatsapp.type === 'whatsapp'  || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.difyConfig.key') }}</label>
                <input ref="inputAssistant"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder="$t('sessaoModalWhatsapp.difyConfig.key')"
                  dense
                  outlined
                  v-model="whatsapp.difyKey" />
              </div>
              <div class="col-12" v-if="difyAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.difyConfig.url') }}</label>
                <input ref="inputAssistant"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder="$t('sessaoModalWhatsapp.difyConfig.url')"
                  dense
                  outlined
                  v-model="whatsapp.difyUrl" />
              </div>
              <div class="col-12" v-if="difyAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">Tipo do Dify:</label>
                <q-select ref="inputAssistant"
                  class="q-pa-sm bg-white full-width blur-effect"
                  placeholder="Selecione o tipo do Dify"
                  dense
                  outlined
                  v-model="whatsapp.difyType"
                  :options="[
                    { label: $t('sessaoModalWhatsapp.difyConfig.typeOptions.agent'), value: 'agent' },
                    { label: $t('sessaoModalWhatsapp.difyConfig.typeOptions.textGenerator'), value: 'textGenerator' },
                    { label: $t('sessaoModalWhatsapp.difyConfig.typeOptions.chatBot'), value: 'chatBot' },
                    { label: $t('sessaoModalWhatsapp.difyConfig.typeOptions.workflow'), value: 'workflow' }
                  ]"
                  emit-value
                  map-options />
              </div>
              <div class="col-12" v-if="difyAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.difyConfig.restartWord') }}</label>
                <input ref="inputAssistant"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.difyConfig.restartWord')"
                  dense
                  outlined
                  v-model="whatsapp.difyRestart" />
              </div>
              <div class="col-12" v-if="difyAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba'|| whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.difyConfig.stopWord') }}</label>
                <input ref="inputAssistant"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.difyConfig.stopWord')"
                  dense
                  outlined
                  v-model="whatsapp.difyOff" />     
              </div>
              
            </div>

            <div class="section primary-gradient col-12" v-if="n8nAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
              <div class="text-h8" v-if="n8nAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat') " style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.n8nConfig.title') }}</div>
              <div class="col-12" v-if="n8nAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat') ">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.n8nConfig.url') }}:</label>
                <input ref="n8nUrl"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder=" $t('sessaoModalWhatsapp.n8nConfig.url')"
                  dense
                  outlined
                  v-model="whatsapp.n8nUrl" />
              </div>
              <!-- <div class="col-12" v-if="n8nAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'waba')">
                <label class="text-caption">URL do N8N:</label>
                <input ref="inputAssistant"
                  class="q-pa-sm bg-white full-width blur-effect"
                  placeholder="Digite a URL do N8N"
                  dense
                  outlined
                  v-model="whatsapp.n8nUrl" />
              </div> -->
            </div>

            <div class="section primary-gradient col-12" v-if="ollamaAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
              <div class="text-h8" v-if="ollamaAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat') " style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.ollamaConfig.title') }}</div>
              <div class="col-12" v-if="ollamaAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.ollamaConfig.url') }}:</label>
                <input ref="ollamaUrl"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder="$t('sessaoModalWhatsapp.ollamaConfig.url')"
                  dense
                  outlined
                  v-model="whatsapp.ollamaUrl" />
              </div>
              <div class="col-12" v-if="ollamaAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.ollamaConfig.model') }}:</label>
                <input ref="ollamaModel"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.ollamaConfig.model') "
                  dense
                  outlined
                  v-model="whatsapp.ollamaModel" />
              </div>
              <div class="col-12" v-if="ollamaAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.ollamaConfig.prompt') }}:</label>
                <textarea  ref="ollamaPrompt"
                style="min-height: 15vh; max-height: 15vh;"
                  class="q-pa-sm bg-white full-width"
                  autogrow
                  :placeholder="$t('sessaoModalWhatsapp.ollamaConfig.prompt') "
                  dense
                  outlined
                  v-model="whatsapp.ollamaPrompt" />
              </div>
              <div class="col-12" v-if="ollamaAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.ollamaConfig.stopWord') }}:</label>
                <input ref="ollamaOff"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.ollamaConfig.stopWord')"
                  dense
                  outlined
                  v-model="whatsapp.ollamaOff" />     
              </div>
              
            </div>

            <div class="section primary-gradient col-12" v-if="lmAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
              <div class="text-h8" v-if="lmAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat') " style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.lmConfig.title') }}</div>
              <div class="col-12" v-if="lmAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.lmConfig.url') }}:</label>
                <input ref="lmUrl"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder="$t('sessaoModalWhatsapp.lmConfig.url')"
                  dense
                  outlined
                  v-model="whatsapp.lmUrl" />
              </div>
              <div class="col-12" v-if="lmAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.lmConfig.model') }}:</label>
                <input ref="lmModel"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.lmConfig.model') "
                  dense
                  outlined
                  v-model="whatsapp.lmModel" />
              </div>
              <div class="col-12" v-if="lmAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.lmConfig.prompt') }}:</label>
                <textarea ref="lmPrompt"
                style="min-height: 15vh; max-height: 15vh;"
                  class="q-pa-sm bg-white full-width"
                  autogrow
                  :placeholder="$t('sessaoModalWhatsapp.lmConfig.prompt') "
                  dense
                  outlined
                  v-model="whatsapp.lmPrompt" />
              </div>
              <div class="col-12" v-if="lmAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.lmConfig.stopWord') }}:</label>
                <input ref="lmOff"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.lmConfig.stopWord')"
                  dense
                  outlined
                  v-model="whatsapp.lmOff" />     
              </div>
              
            </div>

            <div class="section primary-gradient col-12" v-if="grokAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
              <div class="text-h8" v-if="grokAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat') " style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.grokConfig.title') }}</div>
              <div class="col-12" v-if="grokAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.grokConfig.url') }}:</label>
                <input ref="grokUrl"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder="$t('sessaoModalWhatsapp.grokConfig.url')"
                  dense
                  outlined
                  v-model="whatsapp.grokUrl" />
              </div>
              <div class="col-12" v-if="grokAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.grokConfig.model') }}:</label>
                <input ref="grokModel"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.grokConfig.model') "
                  dense
                  outlined
                  v-model="whatsapp.grokModel" />
              </div>
              <div class="col-12" v-if="grokAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.grokConfig.prompt') }}:</label>
                <textarea ref="grokPrompt"
                  style="min-height: 15vh; max-height: 15vh;"
                  class="q-pa-sm bg-white full-width"
                  autogrow
                  :placeholder="$t('sessaoModalWhatsapp.grokConfig.prompt') "
                  dense
                  outlined
                  v-model="whatsapp.grokPrompt" />
              </div>
              <div class="col-12" v-if="grokAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.grokConfig.stopWord') }}:</label>
                <input ref="grokOff"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.grokConfig.stopWord')"
                  dense
                  outlined
                  v-model="whatsapp.grokOff" />     
              </div>
              
            </div>

            <div class="section primary-gradient col-12" v-if="geminiAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
              <div class="text-h8" v-if="geminiAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat') " style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.geminiConfig.title') }}</div>
              <div class="col-12" v-if="geminiAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.geminiConfig.url') }}:</label>
                <input ref="geminiUrl"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder="$t('sessaoModalWhatsapp.geminiConfig.url')"
                  dense
                  outlined
                  v-model="whatsapp.geminiUrl" />
              </div>
              <div class="col-12" v-if="geminiAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.geminiConfig.model') }}:</label>
                <input ref="geminiModel"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.geminiConfig.model') "
                  dense
                  outlined
                  v-model="whatsapp.geminiModel" />
              </div>
              <div class="col-12" v-if="geminiAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.geminiConfig.prompt') }}:</label>
                <textarea ref="geminiPrompt"
                  style="min-height: 15vh; max-height: 15vh;"
                  class="q-pa-sm bg-white full-width"
                  autogrow
                  :placeholder="$t('sessaoModalWhatsapp.geminiConfig.prompt') "
                  dense
                  outlined
                  v-model="whatsapp.geminiPrompt" />
              </div>
              <div class="col-12" v-if="geminiAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.geminiConfig.stopWord') }}:</label>
                <input ref="geminiOff"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.geminiConfig.stopWord')"
                  dense
                  outlined
                  v-model="whatsapp.geminiOff" />     
              </div>
              
            </div>

            <div class="section primary-gradient col-12" v-if="deepseekAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
              <div class="text-h8" v-if="deepseekAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat' ) " style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.deepseekConfig.title') }}</div>
              <div class="col-12" v-if="deepseekAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat' )">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.deepseekConfig.url') }}:</label>
                <input ref="deepseekUrl"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder="$t('sessaoModalWhatsapp.deepseekConfig.url')"
                  dense
                  outlined
                  v-model="whatsapp.deepseekUrl" />
              </div>
              <div class="col-12" v-if="deepseekAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat' )">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.deepseekConfig.model') }}:</label>
                <input ref="deepseekModel"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.deepseekConfig.model') "
                  dense
                  outlined
                  v-model="whatsapp.deepseekModel" />
              </div>
              <div class="col-12" v-if="deepseekAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat' )">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.deepseekConfig.prompt') }}:</label>
                <textarea ref="deepseekPrompt"
                  style="min-height: 15vh; max-height: 15vh;"
                  class="q-pa-sm bg-white full-width"
                  autogrow
                  :placeholder="$t('sessaoModalWhatsapp.deepseekConfig.prompt') "
                  dense
                  outlined
                  v-model="whatsapp.deepseekPrompt" />
              </div>
              <div class="col-12" v-if="deepseekAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat' )">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.deepseekConfig.stopWord') }}:</label>
                <input ref="deepseekOff"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.deepseekConfig.stopWord')"
                  dense
                  outlined
                  v-model="whatsapp.deepseekOff" />     
              </div>
              
            </div>

            <div class="section primary-gradient col-12" v-if="qwenAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
              <div class="text-h8" v-if="qwenAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat' ) " style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.qwenConfig.title') }}</div>
              <div class="col-12" v-if="qwenAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat' )">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.qwenConfig.url') }}:</label>
                <input ref="qwenUrl"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder="$t('sessaoModalWhatsapp.qwenConfig.url')"
                  dense
                  outlined
                  v-model="whatsapp.qwenUrl" />
              </div>
              <div class="col-12" v-if="qwenAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat' )">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.qwenConfig.model') }}:</label>
                <input ref="qwenModel"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.qwenConfig.model') "
                  dense
                  outlined
                  v-model="whatsapp.qwenModel" />
              </div>
              <div class="col-12" v-if="qwenAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat' )">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.qwenConfig.prompt') }}:</label>
                <textarea ref="qwenPrompt"
                  style="min-height: 15vh; max-height: 15vh;"
                  class="q-pa-sm bg-white full-width"
                  autogrow
                  :placeholder="$t('sessaoModalWhatsapp.qwenConfig.prompt') "
                  dense
                  outlined
                  v-model="whatsapp.qwenPrompt" />
              </div>
              <div class="col-12" v-if="qwenAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat' )">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.qwenConfig.stopWord') }}:</label>
                <input ref="qwenOff"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.qwenConfig.stopWord')"
                  dense
                  outlined
                  v-model="whatsapp.qwenOff" />     
              </div>
              
            </div>

            <div class="section primary-gradient col-12" v-if="claudeAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
              <div class="text-h8" v-if="claudeAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat') " style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.claudeConfig.title') }}</div>
              <div class="col-12" v-if="claudeAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.claudeConfig.url') }}:</label>
                <input ref="claudeUrl"
                  class="q-pa-sm bg-white full-width blur-effect"
                  :placeholder="$t('sessaoModalWhatsapp.claudeConfig.url')"
                  dense
                  outlined
                  v-model="whatsapp.claudeUrl" />
              </div>
              <div class="col-12" v-if="claudeAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.claudeConfig.model') }}:</label>
                <input ref="claudeModel"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.claudeConfig.model') "
                  dense
                  outlined
                  v-model="whatsapp.claudeModel" />
              </div>
              <div class="col-12" v-if="claudeAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.claudeConfig.prompt') }}:</label>
                <textarea ref="claudePrompt"
                  style="min-height: 15vh; max-height: 15vh;"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.claudeConfig.prompt') "
                  dense
                  outlined
                  v-model="whatsapp.claudePrompt" />
              </div>
              <div class="col-12" v-if="claudeAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'messenger' || whatsapp.type === 'telegram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat')">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.claudeConfig.stopWord') }}:</label>
                <input ref="claudeOff"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.claudeConfig.stopWord')"
                  dense
                  outlined
                  v-model="whatsapp.claudeOff" />     
              </div>
              
            </div>

            <div class="section primary-gradient" v-if="dialogflowAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys')">
              <div class="text-h8" v-if="dialogflowAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys') " style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.dialogConfig.title') }}</div>
              <div class="col-12" v-if="dialogflowAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys') ">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.dialogConfig.projectId') }}:</label>
                <input ref="projectId"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.dialogConfig.projectId')"
                  dense
                  outlined
                  v-model="whatsapp.dialogflowProjectId" />
              </div>
              <div class="col-12" v-if="dialogflowAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys') ">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.dialogConfig.lang') }}:</label>
                <input ref="lang"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.dialogConfig.lang')"
                  dense
                  outlined
                  v-model="whatsapp.dialogflowLanguage" />
              </div>
              <div class="col-12" v-if="dialogflowAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys') ">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.dialogConfig.stopWord') }}</label>
                <input ref="sairDialog"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.dialogConfig.stopWord') "
                  dense
                  outlined
                  v-model="whatsapp.dialogflowOff" />
              </div>
              <div class="col-12" v-if="dialogflowAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys') ">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.dialogConfig.jsonFile') }}</label>
                <input ref="jsonNameDialog"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.dialogConfig.jsonFile')"
                  dense
                  outlined
                  v-model="whatsapp.dialogflowJsonFilename" />
              </div>
              <div class="col-12" v-if="dialogflowAtivo === 'enabled' && (whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys') ">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.dialogConfig.jsonContent') }}</label>
                <textarea ref="jsonDialog"
                  style="min-height: 15vh; max-height: 15vh;"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.dialogConfig.jsonContent')"
                  autogrow
                  dense
                  outlined
                  v-model="whatsapp.dialogflowJson" />
              </div>
            </div>

            <div class="section primary-gradient" v-if="whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat'">
              <div class="text-h8" style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.farewell') }}</div>
              <div class="col-12">
                <label class="text-caption">{{ $t('sessaoModalWhatsapp.farewellMessage') }}:</label>
                <textarea ref="inputFarewellMessage"
                  style="min-height: 15vh; max-height: 15vh;"
                  class="q-pa-sm bg-white full-width"
                  :placeholder="$t('sessaoModalWhatsapp.typeMessage')"
                  autogrow
                  dense
                  outlined
                  v-model="whatsapp.farewellMessage" />
              </div>
              <q-btn round
                flat
                dense>
                <q-icon size="2em"
                  name="mdi-variable" />
                <q-tooltip>
                  {{ $t('sessaoModalWhatsapp.variables') }}
                </q-tooltip>
                <q-menu touch-position>
                  <q-list dense
                    style="min-width: 100px">
                    <q-item v-for="variavel in variaveis"
                      :key="variavel.label"
                      clickable
                      @click="onInsertSelectVariable(variavel.value)"
                      v-close-popup>
                      <q-item-section>{{ variavel.label }}</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </div>

            <div class="section primary-gradient" v-if="whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat'">
            <div >
              <div class="col-12" v-if="whatsapp.type === 'whatsapp' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'baileys' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat'">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.enable.autoEvaluation') }}</q-item-label>
                    <q-item-label caption> 
                      {{ $t('sessaoModalWhatsapp.enable.autoEvaluation2') }}
                    </q-item-label>
                  </q-item-section>

                <q-item-section avatar>
                  <q-toggle
                      v-model="whatsapp.sendEvaluation"
                      false-value="disabled"
                      true-value="enabled"
                      checked-icon="check"
                      keep-color
                      :color="whatsapp.sendEvaluation === 'enabled' ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                  />
                  </q-item-section>
                </q-item>
              </div>
            </div>

            <div>
              <div class="col-12" v-if="whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat'">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.enable.transcribeAudio') }}</q-item-label>
                    <q-item-label caption> {{ $t('sessaoModalWhatsapp.enable.transcribeAudio2') }}. </q-item-label>
                  </q-item-section>

                <q-item-section avatar>
                  <q-toggle
                      v-model="whatsapp.transcribeAudio"
                      false-value="disabled"
                      true-value="enabled"
                      checked-icon="check"
                      keep-color
                      :color="whatsapp.transcribeAudio === 'enabled' ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                  />
                  </q-item-section>
                </q-item>
              </div>

            </div>

            <div class="col-12" v-if="whatsapp.transcribeAudio === 'enabled'">
              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>{{ $t('sessaoModalWhatsapp.enable.transcribeAudio3') }}</q-item-label>
                  <q-item-label caption>{{ $t('sessaoModalWhatsapp.enable.transcribeAudio4') }}</q-item-label>
                </q-item-section>

                <q-item-section>
                  <q-input
                    v-model="whatsapp.transcribeAudioJson"
                    :label="$t('sessaoModalWhatsapp.enable.transcribeAudio5')"
                    type="textarea"
                    autogrow
                    hint="Valid Json"
                    lazy-rules
                    :rules="[val => {
                      try {
                        JSON.parse(val);
                        return true;
                      } catch {
                        return 'Invalid Json';
                      }
                    }]"
                  />
                </q-item-section>
              </q-item>
            </div>

            <div class="col-12" v-if="whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'waba' || whatsapp.type === 'instagram' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type.includes('hub') || whatsapp.type === 'webchat'">
              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>{{ $t('sessaoModalWhatsapp.enable.autoDistribution') }}</q-item-label>
                  <q-item-label caption> 
                    {{ $t('sessaoModalWhatsapp.enable.autoDistribution2') }}. 
                  </q-item-label>
                </q-item-section>

              <q-item-section avatar>
                <q-toggle
                    v-model="whatsapp.selfDistribute"
                    false-value="disabled"
                    true-value="enabled"
                    checked-icon="check"
                    keep-color
                    :color="whatsapp.selfDistribute === 'enabled' ? 'green' : 'negative'"
                    size="md"
                    unchecked-icon="clear"
                />
                </q-item-section>
              </q-item>
            </div>

            <div class="col-12" v-if="whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi'">
              <q-item tag="label" v-ripple>
                <q-item-section>
                  <q-item-label>{{ $t('sessaoModalWhatsapp.enable.destroyMessage') }}</q-item-label>
                  <q-item-label caption> {{ $t('sessaoModalWhatsapp.enable.destroyMessage2') }}. </q-item-label>
                </q-item-section>

              <q-item-section avatar>
                <q-toggle
                    v-model="whatsapp.destroyMessage"
                    false-value="disabled"
                    true-value="enabled"
                    checked-icon="check"
                    keep-color
                    :color="whatsapp.destroyMessage === 'enabled' ? 'green' : 'negative'"
                    size="md"
                    unchecked-icon="clear"
                />
                </q-item-section>
              </q-item>
            </div>

            <div>
              <div class="col-12" v-if="whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'waba' || whatsapp.type === 'instagram'">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.enable.birthdayMessage') }}</q-item-label>
                    <q-item-label caption> 
                      {{ $t('sessaoModalWhatsapp.enable.birthdayMessage2') }}. 
                    </q-item-label>
                  </q-item-section>

                <q-item-section avatar>
                  <q-toggle
                      v-model="whatsapp.birthdayDate"
                      false-value="disabled"
                      true-value="enabled"
                      checked-icon="check"
                      keep-color
                      :color="whatsapp.birthdayDate === 'enabled' ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                  />
                  </q-item-section>
                </q-item>
              </div>
            </div>

            <div 
            :style="{ backgroundColor: $q.dark.isActive ? '#363636' : '#f2f2f2', borderRadius: '10px', padding: '10px' }"
            
            v-if="whatsapp.birthdayDate === 'enabled'"
            >
              <div class="col-12">
                <div class="text-h8">{{ $t('sessaoModalWhatsapp.enable.birthdayMessage3') }}</div>
                <div class="col-12">
                  <label class="text-caption">{{ $t('sessaoModalWhatsapp.enable.birthdayMessage4') }}</label>
                  <textarea ref="inputbirthdayDateMessage"
                    style="min-height: 15vh; max-height: 15vh;"
                    class="q-pa-sm bg-white full-width"
                    :placeholder="$t('sessaoModalWhatsapp.typeMessage')"
                    autogrow
                    dense
                    outlined
                    v-model="whatsapp.birthdayDateMessage" />
                </div>
                <q-btn round
                  v-if="whatsapp.type !== 'waba' && whatsapp.type !== 'instagram'"
                  flat
                  dense>
                  <q-icon size="2em"
                    name="mdi-variable" />
                  <q-tooltip>
                    {{ $t('sessaoModalWhatsapp.variables') }}
                  </q-tooltip>
                  <q-menu touch-position>
                    <q-list dense
                      style="min-width: 100px">
                      <q-item v-for="variavel in variaveisAniversario"
                        :key="variavel.label"
                        clickable
                        @click="onInsertSelectVariableBirthday(variavel.value)"
                        v-close-popup>
                        <q-item-section>{{ variavel.label }}</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>

              <div style="margin-top:15px" class="col-12" v-if="whatsapp.birthdayDate === 'enabled'">
                <div class="col-12">
                  <label class="text-caption">{{ $t('sessaoModalWhatsapp.enable.birthdayMessage5') }}:</label>
                  <p>{{ this.whatsapp?.birthdayDateFileName?.slice(0, 20) }}...</p>
                  <q-file 
                    dense 
                    outlined 
                    v-model="whatsapp.bDateFileName" 
                    :label="$t('sessaoModalWhatsapp.enable.birthdayMessage6')"
                    filled 
                    />
                </div>
              </div>

              <div class="col-12" v-if="whatsapp.birthdayDate === 'enabled'" style="margin-top:15px; margin-bottom: 10px;">
                <div class="col-12">
                  <label class="text-caption">
                    {{ $t('sessaoModalWhatsapp.enable.birthdayMessage7') }}: 
                  </label>
                  <q-input
                    v-model="whatsapp.birthdayDateHour"
                    :placeholder="$t('sessaoModalWhatsapp.enable.birthdayMessage8') "
                    outlined
                    dense
                    readonly
                    @click="showTimeModal = true"
                  />
                </div>
              </div>
            </div>

            <div>
              <div class="col-12">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.enable.ignoreBussinesHours') }}</q-item-label>
                    <q-item-label caption>{{ $t('sessaoModalWhatsapp.enable.ignoreBussinesHours2') }}</q-item-label>
                  </q-item-section>

                <q-item-section avatar>
                  <q-toggle
                      v-model="whatsapp.ignoreBussinesHours"
                      false-value="disabled"
                      true-value="enabled"
                      checked-icon="check"
                      keep-color
                      :color="whatsapp.ignoreBussinesHours === 'enabled' ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                  />
                  </q-item-section>
                </q-item>
              </div>
            </div>

            <div>
              <div class="col-12">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.enable.externalIntegration') }}</q-item-label>
                    <q-item-label caption>{{ $t('sessaoModalWhatsapp.enable.externalIntegration2') }} .</q-item-label>
                  </q-item-section>

                <q-item-section avatar>
                  <q-toggle
                      v-model="whatsapp.disableExternalIntegration"
                      false-value="disabled"
                      true-value="enabled"
                      checked-icon="check"
                      keep-color
                      :color="whatsapp.disableExternalIntegration === 'enabled' ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                  />
                  </q-item-section>
                </q-item>
              </div>
            </div>

            <div>
              <div class="col-12">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.enable.waitProcessExternalInteraction') }}</q-item-label>
                    <q-item-label caption>{{ $t('sessaoModalWhatsapp.enable.waitProcessExternalInteraction2') }} .</q-item-label>
                  </q-item-section>

                <q-item-section avatar>
                  <q-toggle
                      v-model="whatsapp.waitProcessExternalInteraction"
                      false-value="disabled"
                      true-value="enabled"
                      checked-icon="check"
                      keep-color
                      :color="whatsapp.waitProcessExternalInteraction === 'enabled' ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                  />
                  </q-item-section>
                </q-item>
              </div>
            </div>

            <div>
              <div class="col-12">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.enable.webPush') }}</q-item-label>
                    <q-item-label caption>{{ $t('sessaoModalWhatsapp.enable.webPush2') }} .</q-item-label>
                  </q-item-section>

                <q-item-section avatar>
                  <q-toggle
                      v-model="whatsapp.webPush"
                      false-value="disabled"
                      true-value="enabled"
                      checked-icon="check"
                      keep-color
                      :color="whatsapp.webPush === 'enabled' ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                  />
                  </q-item-section>
                </q-item>
              </div>
            </div>

            <div v-if="whatsapp.type !== 'waba' && whatsapp.type !== 'instagram'">
              <div class="col-12">
                <q-item tag="label" v-ripple>
                  <q-item-section>
                    <q-item-label>{{ $t('sessaoModalWhatsapp.enable.contingency') }}</q-item-label>
                    <q-item-label caption>{{ $t('sessaoModalWhatsapp.enable.contingency2') }}</q-item-label>
                  </q-item-section>

                <q-item-section avatar>
                  <q-toggle
                      v-model="whatsapp.isActive"
                      checked-icon="check"
                      keep-color
                      :color="whatsapp.isActive ? 'green' : 'negative'"
                      size="md"
                      unchecked-icon="clear"
                  />
                  </q-item-section>
                </q-item>
              </div>
            </div>
          </div>

          <div class="section primary-gradient col-12" v-if="whatsapp.type !== 'webmail'">
            <div class="text-h8" style="margin-top: 20px;">{{ $t('sessaoModalWhatsapp.automaticClosure') }}</div>
            <div class="col-12 q-my-sm">
              <q-input v-model="whatsapp.closeKeyWord" type="text" label="Palavra chave" filled />
            </div>
            <p style="font-size: 12px">{{ $t('sessaoModalWhatsapp.automaticClosure2') }}.</p>
          </div>

          <div class="section primary-gradient col-12" v-if="['whatsapp', 'baileys', 'meow', 'evo', 'uazapi', 'zapi'].includes(whatsapp.type)">
            <div class="text-h8" style="margin-top: 20px;" v-if="['whatsapp', 'baileys', 'meow', 'evo', 'uazapi', 'zapi'].includes(whatsapp.type)">Wavoip</div>
            <div class="col-12 q-my-sm" v-if="['whatsapp', 'baileys', 'meow', 'evo', 'uazapi', 'zapi'].includes(whatsapp.type)">
              <q-input class="blur-effect" v-model="whatsapp.wavoipToken" type="text" label="Wavoip" filled />
            </div>
            <p style="font-size: 12px">{{ $t('sessaoModalWhatsapp.wavoipWarn') }}</p>
          </div>

          <div class="section primary-gradient col-12" v-if="((whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'uazapi') && whatsapp.status !== 'CONNECTED' && whatsapp.type !== 'waba')">
            <div class="text-h8" style="margin-top: 20px;" v-if="((whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'uazapi') && whatsapp.status !== 'CONNECTED')">{{ $t('sessaoModalWhatsapp.additionalSettings.title') }}</div>
            <div class="col-12 q-my-sm" v-if="((whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'uazapi') && whatsapp.status !== 'CONNECTED')">
              <q-checkbox v-model="showProxy" :label="$t('sessaoModalWhatsapp.additionalSettings.proxy.useProxy')" />
            </div>
            <div class="col-12 q-my-sm" v-if="showProxy && ((whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'uazapi') && whatsapp.status !== 'CONNECTED')">
              <q-input v-model="whatsapp.proxyUrl" type="text" :label="$t('sessaoModalWhatsapp.additionalSettings.proxy.proxyUrl')" filled />
            </div>
            <div class="col-12 q-my-sm" v-if="showProxy && ((whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'uazapi') && whatsapp.status !== 'CONNECTED')">
              <q-input v-model="whatsapp.proxyUser" type="text" :label="$t('sessaoModalWhatsapp.additionalSettings.proxy.proxyUser')"  filled />
            </div>
            <div class="col-12 q-my-sm" v-if="showProxy && ((whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'uazapi') && whatsapp.status !== 'CONNECTED')">
              <q-input v-model="whatsapp.proxyPass" type="text" :label="$t('sessaoModalWhatsapp.additionalSettings.proxy.proxyPass')" filled />
            </div>
            <!-- <div class="col-12 q-my-sm" v-if="((whatsapp.type === 'whatsapp') && whatsapp.status !== 'CONNECTED')">
              <q-checkbox v-model="showWebVersion" label="Usar Versão Web Fixada" />
            </div>
            <div class="col-12 q-my-sm" v-if="showWebVersion && ((whatsapp.type === 'whatsapp') && whatsapp.status !== 'CONNECTED')">
              <q-input v-model="whatsapp.webversion" type="text" label="Versão WEB" filled />
            </div>
            <div class="col-12 q-my-sm" v-if="showWebVersion && ((whatsapp.type === 'whatsapp') && whatsapp.status !== 'CONNECTED')">
              <q-input v-model="whatsapp.remotePath" type="text" label="Caminho Remoto" filled />
            </div> -->
          </div>

          </div>
          
        </q-card-section>
        <q-card-actions align="center"
        class="q-mt-lg">
          <div v-if="loading" >{{ $t('sessaoModalWhatsapp.waiting') }}</div>
            <div v-if="loading" class="loading-bar">
            <div class="bar"></div>
          </div>
        </q-card-actions>
        <q-card-actions align="center"
          class="q-mt-lg">
          <q-btn
            v-if="whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'meow' || whatsapp.type === 'waba' || whatsapp.type === 'instagram'"
            :label="$t('sessaoModalWhatsapp.transferChannel')"
            color="primary"
            class="q-px-md q-mr-lg"
            @click="openChannelTransferModal" />
          <q-btn
            :label="$t('common.out')"
            class="q-px-md"
            color="negative"
            v-close-popup />
          <q-btn
            :disable="loading"
            :label="$t('common.save')"
            color="primary"
            class="q-px-md"
            @click="handleSaveWhatsApp(whatsapp)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="channelTransferModal" persistent>
      <q-card class="q-pa-md" style="width: 400px">
        <q-card-section>
          <div class="text-h6">{{ $t('sessaoModalWhatsapp.selectNewChannel') }}</div>
          <p style="font-size: 14px; margin-top: 10px">{{ $t('sessaoModalWhatsapp.selectNewChannel2') }}</p>
          <p style="font-size: 14px">{{ $t('sessaoModalWhatsapp.selectNewChannel1') }}</p>
          <p style="font-size: 14px">{{ $t('sessaoModalWhatsapp.selectNewChannel3') }}</p>
        </q-card-section>
        <q-card-section>
          <q-select v-model="newChannel"
            :options="channelTransferOptions"
            :label="$t('sessaoModalWhatsapp.newChannel')"
            filled />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn color="negative" flat :label="$t('common.cancel')" v-close-popup />
          <q-btn color="primary" :label="$t('common.confirm')" @click="handleChannelTransfer" :loading="transferLoading" :disable="transferLoading" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showTimeModal" persistent>
      <q-card style="width: 300px; max-width: 80vw;">
        <q-card-section class="row items-center q-pa-sm">
          <div class="text-h6">{{ $t('sessaoModalWhatsapp.timeSelection') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense @click="showTimeModal = false" />
        </q-card-section>

        <q-card-section class="q-pa-sm">
          <q-time
            v-model="tempTime"
            format24h
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat :label="$t('common.cancel')" color="negative" @click="showTimeModal = false" />
          <q-btn flat :label="$t('common.confirm')" color="primary" @click="confirmTime" />
        </q-card-actions>
      </q-card>
    </q-dialog>


  </div>

  
</template>

<script>
import bus from 'src/utils/eventBus'
import useVuelidate from '@vuelidate/core'
import { required, minLength, maxLength } from '@vuelidate/validators'
import { UpdateWhatsapp, CriarWhatsapp, DeletarWhatsapp, GetWhatSession } from 'src/service/sessoesWhatsapp.js'
import cInput from 'src/components/cInput.vue'
import VFacebookLogin from 'src/components/FacebookLogin.vue'
import { copyToClipboard, Notify } from 'quasar'
import { ListarConfiguracoes } from 'src/service/configuracoes.js'
import { ListarHub, AdicionarHub } from 'src/service/hub.js'
import { LimpartHistoricoGpt, MudarCanalTickets } from 'src/service/tickets.js'
import { VerificarTelefone } from 'src/service/waba.js'
import { mapGetters } from 'vuex';
import { ListarFilas } from 'src/service/filas.js'
import { MostrarCores } from 'src/service/empresas.js';
import { ListarTenantPorId } from 'src/service/tenants.js'
import { ListarChatFlow } from 'src/service/chatFlow.js'
import { ListarUsuarios } from 'src/service/user.js'
import { ListarProvedoresGlobaisPublicos } from 'src/service/provedorglobal.js'
import { format } from 'date-fns'
import { startGmailOAuth2, handleGmailOAuth2Callback } from 'src/service/gmailOAuth2.js'
import { 
  testImapConnection as testImapConnectionService, 
  testSmtpConnection as testSmtpConnectionService,
  testPop3Connection as testPop3ConnectionService,
  getEmailConnectionStatus as getEmailConnectionStatusService
} from 'src/service/wbotEmail'
const usuario = JSON.parse(localStorage.getItem('usuario'))

export default {
  components: { cInput, VFacebookLogin },
  name: 'ModalWhatsapp',
  setup () {
    const v$ = useVuelidate()
    return { v$ }
  },
  emits: ['update:modalWhatsapp', 'update:whatsAppEdit', 'recarregar-lista', 'setup-webhook'],
  props: {
    modalWhatsapp: {
      type: Boolean,
      default: false
    },
    whatsAppId: {
      type: Number,
      default: null
    },
    whatsAppEdit: {
      type: Object,
      default: () => { }
    }
  },
  data () {
    return {
      loading: false,
      transferLoading: false,
      showTimeModal: false, 
      tempTime: "12:00",
      displayStartDate: '',
      displayEndDate: '',
      esconderNaoOficial: false,
      allowedChannels: [],
      meowHost: null,
      evolutionHost: null,
      zapiHost: null,
      uazapiHost: null,
      hubOptions: [],
      selectedHubOption: null,
      colors: {},
      filas: [],
      listaChatFlow: [],
      listaUsuario: [],
      channelTransferModal: false,
      newChannel: '',
      activeTab: 'tab1',
      showPairingCode: false,
      showProxy: false,
      showWebVersion: false,
      isPwd: true,
      isEdit: false,
      difyAtivo: 'disabled',
      n8nAtivo: 'disabled',
      chatgptAtivo: 'disabled',
      typebotAtivo: 'disabled',
      lmAtivo: 'disabled',
      grokAtivo: 'disabled',
      geminiAtivo: 'disabled',
      qwenAtivo: 'disabled',
      claudeAtivo: 'disabled',
      deepseekAtivo: 'disabled',
      ollamaAtivo: 'disabled',
      dialogflowAtivo: 'disabled',
      whatsapp: {
        name: '',
        wppUser: '',
        wppPass: '',
        proxyUrl: null,
        proxyUser: null,
        proxyPass: null,
        wavoipToken: null,
        closeKeyWord: null,
        webversion: null,
        remotePath: null,
        isDefault: false,
        tokenTelegram: '',
        instagramUser: '',
        instagramKey: '',
        tokenAPI: '',
        wabaId: '',
        bmToken: '',
        wabaVersion: '20.0',
        type: 'waba',
        farewellMessage: '',
        wabaBSP: '360',
        chatFlowId: null,
        queueId: null,
        userId: null,
        chatgptPrompt: '',
        chatgptModel: '',
        chatgptVoiceModel: '',
        chatgptApiKey: '',
        chatgptOrganizationId: '',
        chatgptOff: '',
        assistantId: '',
        typebotRestart: '',
        importMessages: false,
        importOldMessagesGroups: false,
        importGroupMessages: false,
        closedTicketsPostImported: false,
        queueIdImportMessages: '',
        importOldMessages: null,
        importRecentMessages: null,
        queueIdImportMessages: null,
        importStartDate: null,
        importStartTime: null,
        importEndDate: null,
        importEndTime: null,
        importStartDateTime: null,
        importEndDateTime: null,
        messageQueue: '',
        isButton: 'disabled',
        chatgptVoice: 'disabled',
        selfDistribute: 'disabled',
        destroyMessage: 'disabled',
        n8nUrl: '',
        typebotOff: '',
        typebotUnknowMessage: '',
        typebotButtonChoiceMessage: '',
        lmModel: '',
        lmPrompt: '',
        lmUrl: '',
        lmOff: '',
        grokModel: '',
        grokPrompt: '',
        grokUrl: '',
        grokOff: '',
        geminiModel: '',
        geminiPrompt: '',
        geminiUrl: '',
        geminiOff: '',
        deepseekModel: '',
        deepseekPrompt: '',
        deepseekUrl: '',
        deepseekOff: '',
        qwenModel: '',
        qwenPrompt: '',
        qwenUrl: '',
        qwenOff: '',
        claudeModel: '',
        claudePrompt: '',
        claudeUrl: '',
        claudeOff: '',
        ollamaModel: '',
        ollamaPrompt: '',
        ollamaUrl: '',
        ollamaOff: '',
        typebotName: '',
        typebotUrl: '',
        difyKey: '',
        difyUrl: '',
        difyType: '',
        difyOff: '',
        difyRestart: '',
        dialogflowJsonFilename: '',
        dialogflowProjectId: '',
        dialogflowLanguage: '',
        dialogflowOff: '',
        dialogflowJson: '',
        wordlist: 'disabled',
        sendEvaluation: 'disabled',
        transcribeAudio: 'disabled',
        birthdayDate: 'disabled',
        ignoreBussinesHours: 'disabled',
        disableExternalIntegration: 'disabled',
        waitProcessExternalInteraction: 'enabled',
        webPush: 'disabled',
        isActive: true,
        birthdayDateMessage: '',
        bDateFileName: null,
        birthdayDateHour: '',
        transcribeAudioJson: '',
        smtpConfig: {
          host: 'smtp.gmail.com',    // ← CORREÇÃO: host padrão para Gmail
          port: 465,                  // ← CORREÇÃO: porta padrão para Gmail
          secure: true,               // ← CORREÇÃO: SSL habilitado para Gmail
          auth: {
            user: '',
            pass: ''
          },
          from: '',
          replyTo: '',
          imap: {
            host: 'imap.gmail.com',  // ← CORREÇÃO: host padrão para Gmail
            port: 993,                // ← CORREÇÃO: porta padrão para Gmail
            tls: true                 // ← CORREÇÃO: TLS habilitado para Gmail
          },
          pop3: {
            host: 'pop.gmail.com',   // ← NOVO: host padrão POP3 para Gmail
            port: 995,                // ← NOVO: porta padrão POP3 para Gmail
            tls: true                 // ← NOVO: TLS habilitado POP3 para Gmail
          },
          oauth2: {
            client_id: '',
            client_secret: '',
            redirect_uri: '',
            access_token: '',
            refresh_token: '',
            expires_in: 0,
            token_type: '',
            scope: '',
            provider: 'gmail'
          }
        },
        // OAuth2 properties
        oauth2Code: ''
      },
      // OAuth2 loading states
      oauth2Loading: false,
      smtpTestLoading: false,
      imapTestLoading: false,
      pop3TestLoading: false,
      statusCheckLoading: false,
      showPop3Config: false,
      connectionStatus: {
        imap: false,
        pop3: false,
        workingProtocol: 'none',
        lastTest: null,
        errorDetails: null
      },
      showTime1: false,
      showTime2: false,
      optionsWhatsappsTypes: [
        { label: 'WhatsApp Official (WABA)', value: 'waba' },
        { label: 'WhatsApp Baileys (QRCode)', value: 'baileys' },
        { label: 'WhatsApp WebJs (QRCode)', value: 'whatsapp' },
        { label: 'WhatsApp Meow (QRCode)', value: 'meow' },
        { label: 'WhatsApp Evolution 2 (QRCode)', value: 'evo' },
        { label: 'Z-API (QRCode)', value: 'zapi' },
        { label: 'Uazapi (QRCode)', value: 'uazapi' },
        { label: 'Telegram', value: 'telegram' },
        { label: 'Hub Notificame', value: 'hub' },
        { label: 'WebChat', value: 'webchat' },
        { label: 'WebMail', value: 'webmail' },
        // { label: 'Instagram', value: 'instagram' },
        // { label: 'Messenger (em breve)', value: 'messenger' }
      ],
      // variáveis i18n movidas para computed para evitar warnings e normalizar arrays
      // variaveis: [
      //   { label: 'Nome', value: '{{name}}' },
      //   { label: 'Saudação', value: '{{greeting}}' },
      //   { label: 'Protocolo', value: '{{protocol}}' },
      //   { label: 'E-mail (se existir)', value: '{{email}}' },
      //   { label: 'Telefone', value: '{{phoneNumber}}' },
      //   { label: 'Kanban (se existir)', value: '{{kanban}}' },
      //   { label: 'Atendente (se em atendimento)', value: '{{user}}' },
      //   { label: 'E-mail Atendente (se em atendimento)', value: '{{userEmail}}' },
      //   { label: 'Primeiro Nome (se existir)', value: '{{firstName}}' },
      //   { label: 'Sobrenome (se existir)', value: '{{lastName}}' },
      //   { label: 'Empresa (se existir)', value: '{{businessName}}' }
      // ],
      // variaveisAniversario: [
      //   { label: 'Nome', value: '{{name}}' },
      //   { label: 'Saudação', value: '{{greeting}}' },
      //   { label: 'E-mail (se existir)', value: '{{email}}' },
      //   { label: 'Telefone', value: '{{phoneNumber}}' },
      //   { label: 'Primeiro Nome (se existir)', value: '{{firstName}}' },
      //   { label: 'Sobrenome (se existir)', value: '{{lastName}}' },
      //   { label: 'Empresa (se existir)', value: '{{businessName}}' }
      // ],
      FB: {},
      FBscope: {},
      FBLoginOptions: {
        scope:
          'pages_manage_metadata,pages_messaging,instagram_basic,pages_show_list,pages_read_engagement,instagram_manage_messages'
      },
      FBPageList: [],
      fbSelectedPage: { name: null, id: null },
      fbPageName: '',
      fbUserToken: '',
      // Sistema de gerenciamento de memória
      timers: [],
      isOAuth2Secret: true
    }
  },
  validations: {
    whatsapp: {
      name: { required, minLength: minLength(3), maxLength: maxLength(50) },
      isDefault: {}
    }
  },
  computed: {
    variaveis() {
      return this.getI18nArray('sessaoModalWhatsapp.variaveis')
    },
    variaveisAniversario() {
      return this.getI18nArray('sessaoModalWhatsapp.variaveisAniversario')
    },
    ...mapGetters(['whatsapps']),
    filteredOptionsWhatsappsTypes() {
      return this.optionsWhatsappsTypes.filter(option => {
        // Verifica se o canal está permitido pelo tenant
        if (this.allowedChannels.length > 0 && !this.allowedChannels.includes(option.value)) {
          return false;
        }
        if (option.value === 'meow' && !this.meowHost) {
          return false;
        }
        if (option.value === 'evo' && !this.evolutionHost) {
          return false;
        }
        if (option.value === 'zapi' && !this.zapiHost) {
          return false;
        }
        if (option.value === 'uazapi' && !this.uazapiHost) {
          return false;
        }
        if (this.esconderNaoOficial && ['baileys', 'whatsapp', 'meow', 'evo', 'zapi', 'uazapi'].includes(option.value)) {
          return false;
        }
        return true;
      });
    },
    channelOptions() {
      return this.whatsapps.map(whatsapp => ({
        label: whatsapp.name,
        id: whatsapp.id,
        type: whatsapp.type
      }));
    },
    channelTransferOptions() {
      return this.whatsapps
      .filter(whatsapp => whatsapp.type === 'whatsapp' || whatsapp.type === 'baileys' || whatsapp.type === 'meow' || whatsapp.type === 'evo' || whatsapp.type === 'zapi' || whatsapp.type === 'uazapi' || whatsapp.type === 'waba' )
      .map(whatsapp => ({
        label: whatsapp.name,
        id: whatsapp.id,
        type: whatsapp.type
      }));
    },
    cFbAppId () {
      return process.env.FACEBOOK_APP_ID
    },
    cBaseUrlIntegração () {
      return this.whatsapp.UrlMessengerWebHook
    },
    formattedStartDate() {
      if (this.whatsapp.importStartDateTime) {
        const formatted = this.formatDateTime(this.whatsapp.importStartDateTime);
        return formatted;
      }
      return '';
    },
    formattedEndDate() {
      if (this.whatsapp.importEndDateTime) {
        const formatted = this.formatDateTime(this.whatsapp.importEndDateTime);
        return formatted;
      }
      return '';
    },
    // Verifica se é provedor Gmail
    isGmailProvider() {
      return this.whatsapp.smtpConfig?.host === 'smtp.gmail.com' || 
             this.whatsapp.smtpConfig?.imap?.host === 'imap.gmail.com';
    },
    
    // Status da conexão de email
    connectionStatusClass() {
      if (this.connectionStatus.workingProtocol === 'none') return 'bg-red-1 text-red-9';
      if (this.connectionStatus.workingProtocol === 'imap') return 'bg-green-1 text-green-9';
      if (this.connectionStatus.workingProtocol === 'pop3') return 'bg-blue-1 text-blue-9';
      return 'bg-orange-1 text-orange-9';
    },
    
    connectionStatusIcon() {
      if (this.connectionStatus.workingProtocol === 'none') return 'error';
      if (this.connectionStatus.workingProtocol === 'imap') return 'check_circle';
      if (this.connectionStatus.workingProtocol === 'pop3') return 'info';
      return 'help';
    },
    
    connectionStatusText() {
      if (this.connectionStatus.workingProtocol === 'none') return 'Nenhuma conexão funcionando';
      if (this.connectionStatus.workingProtocol === 'imap') return 'IMAP funcionando';
      if (this.connectionStatus.workingProtocol === 'pop3') return 'POP3 funcionando (fallback)';
      return 'Status desconhecido';
    }
  },
  watch: {
    'whatsapp.type'(newType) {
      if (newType === 'hub') {
        this.listarHubOptions();
      }
    },
  },
  methods: {
    getI18nArray(path) {
      try {
        const composer = (this.$i18n && this.$i18n.global) ? this.$i18n.global : this.$i18n
        const raw = composer && typeof composer.tm === 'function' ? composer.tm(path) : this.$t(path)
        if (Array.isArray(raw)) return raw
        if (raw && typeof raw === 'object') {
          return Object.entries(raw)
            .sort((a, b) => Number(a[0]) - Number(b[0]))
            .map(([, v]) => v)
        }
      } catch (e) { /* ignore */ }
      return []
    },
    onTimeChange(value) {
      const [hour] = value.split(":");
      this.tempTime = `${hour}:00`;
    },
    confirmTime() {
      const [hour] = this.tempTime.split(":");
      this.whatsapp.birthdayDateHour = `${hour}:00`;
      this.showTimeModal = false;
      console.log("Horário confirmado:", this.whatsapp.birthdayDateHour);
    },
    async listTenantPorId(){
      const { data } = await ListarTenantPorId(usuario.tenantId)
      this.esconderNaoOficial = data[0]?.hideUnoficial || false
      
      // Buscar provedores do tenant
      const tenantMeowHost = data[0]?.wuzapiHost || null
      const tenantEvolutionHost = data[0]?.evoHost || null
      const tenantZapiHost = data[0]?.zapiHost || null
      const tenantUazapiHost = data[0]?.uazapiHost || null
      
      // Buscar provedores globais
      try {
        const { data: globalProviders } = await ListarProvedoresGlobaisPublicos({ status: 'active' })
        
        // Mapear provedores globais por tipo (wuzapi no backend = meow no frontend)
        const globalMeowHost = globalProviders.find(p => p.type === 'wuzapi')?.host || null
        const globalEvolutionHost = globalProviders.find(p => p.type === 'evo')?.host || null
        const globalZapiHost = globalProviders.find(p => p.type === 'zapi')?.host || null
        const globalUazapiHost = globalProviders.find(p => p.type === 'uazapi')?.host || null
        
        // Usar provedor do tenant se tiver, caso contrário usar o global
        this.meowHost = tenantMeowHost || globalMeowHost
        this.evolutionHost = tenantEvolutionHost || globalEvolutionHost
        this.zapiHost = tenantZapiHost || globalZapiHost
        this.uazapiHost = tenantUazapiHost || globalUazapiHost
      } catch (error) {
        console.error('Erro ao buscar provedores globais:', error)
        // Em caso de erro, usar apenas os do tenant
        this.meowHost = tenantMeowHost
        this.evolutionHost = tenantEvolutionHost
        this.zapiHost = tenantZapiHost
        this.uazapiHost = tenantUazapiHost
      }
      
      this.allowedChannels = data[0]?.allowedChannels || []
    },
    async listarHubOptions() {
      try {
        const response = await ListarHub();
        this.hubOptions = response.data
        .filter(hub => hub.channel === 'facebook' 
        || hub.channel === 'instagram' 
        || hub.channel === 'webchat'
        || hub.channel === 'email' )
        .map(hub => ({
          label: hub.name,
          value: hub
        }));
      } catch (error) {
        console.error('Erro ao listar Hubs:', error);
      }
    },
    async loadColors() {
      try {
        const response = await MostrarCores();
        if (response.status === 200) {
          const companyData = response.data[0];
          const colorsArray = companyData.systemColors;

          

          this.colors = colorsArray.reduce((acc, colorObj) => {
            const key = colorObj.label.toLowerCase();
            acc[key] = colorObj[key];  // Use the correct key here
            return acc;
          }, {});

          

          const root = document.documentElement;
          root.style.setProperty("--q-neutral", this.colors.neutral);
          root.style.setProperty("--q-primary", this.colors.primary);
          root.style.setProperty("--q-secondary", this.colors.secondary);
          root.style.setProperty("--q-accent", this.colors.accent);
          root.style.setProperty("--q-warning", this.colors.warning);
          root.style.setProperty("--q-negative", this.colors.negative);
          root.style.setProperty("--q-positive", this.colors.positive);
          root.style.setProperty("--q-light", this.colors.light);

          

        } else {
          console.error('Erro ao carregar as cores');
        }
      } catch (error) {
        console.error('Erro ao carregar as cores:', error);
      }
    },
    async listarFilas () {
      try {
        const { data } = await ListarFilas();
        this.filas = data.filter(item => item.isActive).map(fila => ({
          id: fila.id,
          queue: fila.queue
        }));
      } catch (error) {
        console.error('Erro ao listar filas:', error);
      }
    },
    async listarChatFlow () {
      try {
        const { data } = await ListarChatFlow();
        this.listaChatFlow = data.chatFlow || [];
      } catch (error) {
        console.error('Erro ao listar chat flows:', error);
      }
    },
    async listarUsuario () {
      try {
        const { data } = await ListarUsuarios();
        this.listaUsuario = (data.users || []).filter(user => user.profile !== 'superadmin');
      } catch (error) {
        console.error('Erro ao listar usuários:', error);
      }
    },
    combineDateTime(date, time) {
      if (date && time) {
        return `${date} ${time}`;
      }
      return '';
    },
    formatDateTime(dateTime) {
      if (!dateTime) return '';
      try {
        // Verifica se a data está no formato UTC/ISO
        if (dateTime.includes('T') || dateTime.includes('Z')) {
          const date = new Date(dateTime);
          return format(date, 'dd/MM/yyyy HH:mm');
        }
        // Formato atual: YYYY-MM-DD HH:mm
        const [date, time] = dateTime.split(' ');
        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year} ${time}`;
      } catch (error) {
        console.error('Erro ao formatar data:', error);
        return dateTime;
      }
    },
    updateStartDateTime() {
      if (this.whatsapp.importStartDate && this.whatsapp.importStartTime) {
        const dateStr = this.whatsapp.importStartDate;
        const timeStr = this.whatsapp.importStartTime;
        const combinedStr = `${dateStr} ${timeStr}`;
        this.whatsapp.importStartDateTime = format(new Date(combinedStr), 'yyyy-MM-dd HH:mm');
        this.displayStartDate = this.formatDateTime(this.whatsapp.importStartDateTime);
      }
    },
    updateEndDateTime() {
      if (this.whatsapp.importEndDate && this.whatsapp.importEndTime) {
        const dateStr = this.whatsapp.importEndDate;
        const timeStr = this.whatsapp.importEndTime;
        const combinedStr = `${dateStr} ${timeStr}`;
        this.whatsapp.importEndDateTime = format(new Date(combinedStr), 'yyyy-MM-dd HH:mm');
        this.displayEndDate = this.formatDateTime(this.whatsapp.importEndDateTime);
      }
    },
    confirmStartDateTime() {
      this.updateStartDateTime();
      this.showTime1 = false;
      this.$refs.qDateProxy1.hide();
    },
    confirmEndDateTime() {
      this.updateEndDateTime();
      this.showTime2 = false;
      this.$refs.qDateProxy2.hide();
    },
    openChannelTransferModal() {
      this.channelTransferModal = true;
    },
    async handleChannelTransfer() {
      this.$q.dialog({
        title: this.$t('common.attention'),
        message: this.$t('sessaoModalWhatsapp.attentionMessage'),
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
        if(!this.newChannel) {
          this.transferLoading = false; // Reset loading antes do return
          this.$q.notify({
            type: 'negative',
            message: this.$t('sessaoModalWhatsapp.noChannelSelected')
          });
          return
        }

        this.transferLoading = true;
        const transferNotification = this.$q.notify({
          type: 'info',
          message: this.$t('sessaoModalWhatsapp.transferringChannels'),
          position: 'top',
          timeout: 3000
        });

        const data = {
          whatsappId: this.whatsapp.id,
          newWhatsappId: this.newChannel.id,
          channel: this.whatsapp.type,
          newChannel: this.newChannel.type,
          tenantId: this.whatsapp.tenantId
        };
        try {
          const response = await MudarCanalTickets(data);
          
          // Verificar se há mais tickets para processar
          if (response.hasMore) {
            // Mostrar aviso sobre processamento no servidor
            this.$q.notify({
              type: 'info',
              message: `Volume alto detectado: ${response.estimatedTotal} tickets. O processo continuará no servidor.`,
              position: 'top',
              timeout: 3000
            });
            
            // Processar em lotes automaticamente
            let currentOffset = response.tickets.length;
            let totalProcessed = response.totalProcessed || 0;
            let hasMore = response.hasMore;
            
            const progressNotification = this.$q.notify({
              type: 'info',
              message: `Processando tickets... ${totalProcessed} processados`,
              position: 'top',
              timeout: 0, // Não expira
              actions: [{ icon: 'close', round: true, color: 'white' }]
            });

            while (hasMore) {
              const batchData = {
                ...data,
                processAll: false,
                limit: 100,
                offset: currentOffset
              };
              
              const batchResponse = await MudarCanalTickets(batchData);
              
              totalProcessed += batchResponse.totalProcessed || batchResponse.tickets.length;
              hasMore = batchResponse.hasMore;
              currentOffset += batchResponse.tickets.length;
              
              // Atualizar notificação de progresso
              progressNotification({
                message: `Processando tickets... ${totalProcessed} processados`
              });
            }
            
            // Fechar notificação de progresso
            progressNotification.dismiss();
            
            this.$q.notify({
              type: 'positive',
              message: `${this.$t('sessaoModalWhatsapp.newChannelSuccess')} - ${totalProcessed} tickets processados`
            });
          } else {
            // Processamento normal (volume baixo)
            this.$q.notify({
              type: 'positive',
              message: this.$t('sessaoModalWhatsapp.newChannelSuccess')
            });
          }
          
          this.channelTransferModal = false;
          this.newChannel = ''
          this.fecharModal();
        } catch (error) {
          console.log(error);
          this.$q.notify({
            type: 'negative',
            message: this.$t('sessaoModalWhatsapp.connectionError')
          });
        } finally {
          this.transferLoading = false; // Desativa o loading
          // console.log('transferNotification');
          // Remove a notificação de transferência se ela ainda existir
          if (transferNotification && typeof transferNotification.dismiss === 'function') {
            transferNotification.dismiss();
          }
        }
      });
    },
    handleSdkInit ({ FB }) {
      this.FB = FB
      // try login

      // this.FBscope = scope
    },
    async fbLogout (whatsapp) {
      console.info('fbLogout')
      await LogoutFacebookPages(whatsapp)
    },
    fbLogin (login, channel) {
      if (login?.status === 'connected') {
        this.fbFetchPages(
          login.authResponse.accessToken,
          login.authResponse.userID,
          channel
        )
        console.info('fbLogin in connected')
      } else if (login?.status === 'not_authorized') {
        // The person is logged into Facebook, but not your app.
        console.info('fbLogin in not_authorized')
      } else {
        // The person is not logged into Facebook, so we're not sure if
        // they are logged into this app or not.
        console.info('fbLogin in not logged')
      }
    },
    async fbFetchPages (_token, _accountId, channel) {
      try {
        const response = await FetchFacebookPages({
          whatsapp: channel,
          userToken: _token,
          accountId: _accountId
        })
        const {
          data: { data }
        } = response
        this.FBPageList = data.page_details
        this.fbUserToken = data.user_access_token
      } catch (error) {
        // Ignore error
      }
    },
    async assistenteNulo(){
      this.whatsapp.assistantId = null;
      const data = {
        ...this.whatsAppEdit,
        assistantId: null
      }
      await UpdateWhatsapp(this.whatsAppEdit.id, data)
    },
    async limparGpts(){
      const { data } = await LimpartHistoricoGpt()
    },
    async listarConfiguracoes() {
      const { data } = await ListarConfiguracoes()
      const difyConfig = data.find(config => config.key === 'dify')
      this.difyAtivo = difyConfig?.value
      const n8nConfig = data.find(config => config.key === 'n8n')
      this.n8nAtivo = n8nConfig?.value
      const chatgptConfig = data.find(config => config.key === 'chatgpt')
      this.chatgptAtivo = chatgptConfig?.value
      const typebotConfig = data.find(config => config.key === 'typebot')
      this.typebotAtivo = typebotConfig?.value
      const dialogflowConfig = data.find(config => config.key === 'dialogflow')
      this.dialogflowAtivo = dialogflowConfig?.value
      const lmConfig = data.find(config => config.key === 'lm')
      this.lmAtivo = lmConfig?.value
      const grokConfig = data.find(config => config.key === 'grok')
      this.grokAtivo = grokConfig?.value
      const geminiConfig = data.find(config => config.key === 'gemini')
      this.geminiAtivo = geminiConfig?.value
      const qwenConfig = data.find(config => config.key === 'qwen')
      this.qwenAtivo = qwenConfig?.value
      const claudeConfig = data.find(config => config.key === 'claude')
      this.claudeAtivo = claudeConfig?.value
      const deepseekConfig = data.find(config => config.key === 'deepseek')
      this.deepseekAtivo = deepseekConfig?.value
      const ollamaConfig = data.find(config => config.key === 'ollama')
      this.ollamaAtivo = ollamaConfig?.value
    },
    copy (text) {
      copyToClipboard(text)
        .then(this.$notificarSucesso(this.$t('sessaoModalWhatsapp.integrationUrlCopied')))
        .catch()
    },
    onInsertSelectVariable (variable) {
      const self = this
      var tArea = this.$refs.inputFarewellMessage
      // get cursor's position:
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      // filter:
      if (!variable) {
        return
      }
      // insert:
      self.txtContent = this.whatsapp.farewellMessage
      self.txtContent = tmpStr.substring(0, startPos) + variable + tmpStr.substring(endPos, tmpStr.length)
      this.whatsapp.farewellMessage = self.txtContent
      // move cursor:
      const timerId = setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + 1
      }, 10)
      this.addTimer(timerId);
    },
    onInsertSelectVariableBirthday (variable) {
      const self = this
      var tArea = this.$refs.inputbirthdayDateMessage
      // get cursor's position:
      var startPos = tArea.selectionStart,
        endPos = tArea.selectionEnd,
        cursorPos = startPos,
        tmpStr = tArea.value
      // filter:
      if (!variable) {
        return
      }
      // insert:
      self.txtContent = this.whatsapp.birthdayDateMessage
      self.txtContent = tmpStr.substring(0, startPos) + variable + tmpStr.substring(endPos, tmpStr.length)
      this.whatsapp.birthdayDateMessage = self.txtContent
      // move cursor:
      const timerId2 = setTimeout(() => {
        tArea.selectionStart = tArea.selectionEnd = cursorPos + 1
      }, 10)
      this.addTimer(timerId2);
    },
    fecharModal () {
      // Reset de todas as variáveis de loading
      this.loading = false
      this.transferLoading = false
      this.oauth2Loading = false
      this.smtpTestLoading = false
      this.imapTestLoading = false
      this.pop3TestLoading = false
      this.statusCheckLoading = false
      
      this.whatsapp = {
        name: '',
        wppUser: '',
        wppPass: '',
        proxyUrl: null,
        proxyUser: null,
        proxyPass: null,
        wavoipToken: null,
        closeKeyWord: null,
        webversion: null,
        remotePath: null,
        isDefault: false,
        tokenTelegram: '',
        instagramUser: '',
        instagramKey: '',
        tokenAPI: '',
        wabaId: '',
        bmToken: '',
        wabaVersion: '20.0',
        type: 'waba',
        farewellMessage: '',
        wabaBSP: '360',
        chatFlowId: null,
        queueId: null,
        userId: null,
        chatgptPrompt: '',
        chatgptModel: '',
        chatgptVoiceModel: '',
        chatgptApiKey: '',
        chatgptOrganizationId: '',
        chatgptOff: '',
        assistantId: '',
        typebotRestart: '',
        importMessages: false,
        importOldMessagesGroups: false,
        importGroupMessages: false,
        closedTicketsPostImported: false,
        importOldMessages: null,
        importRecentMessages: null,
        queueIdImportMessages: null,
        importStartDate: null,
        importStartTime: null,
        importEndDate: null,
        importEndTime: null,
        importStartDateTime: null,
        importEndDateTime: null,
        messageQueue: '',
        isButton: 'disabled',
        chatgptVoice: 'disabled',
        selfDistribute: 'disabled',
        destroyMessage: 'disabled',
        n8nUrl: '',
        typebotOff: '',
        typebotUnknowMessage: '',
        typebotButtonChoiceMessage: '',
        typebotName: '',
        typebotUrl: '',
        lmOff: '',
        lmModel: '',
        lmPrompt: '',
        lmUrl: '',
        grokModel: '',
        grokPrompt: '',
        grokUrl: '',
        grokOff: '',
        geminiModel: '',
        geminiPrompt: '',
        geminiUrl: '',
        geminiOff: '',
        deepseekModel: '',
        deepseekPrompt: '',
        deepseekUrl: '',
        deepseekOff: '',
        qwenModel: '',
        qwenPrompt: '',
        qwenUrl: '',
        qwenOff: '',
        claudeModel: '',
        claudePrompt: '',
        claudeUrl: '',
        claudeOff: '',
        ollamaOff: '',
        ollamaModel: '',
        ollamaPrompt: '',
        ollamaUrl: '',
        dialogflowJsonFilename: '',
        dialogflowProjectId: '',
        dialogflowLanguage: '',
        dialogflowOff: '',
        dialogflowJson: '',
        wordlist: 'disabled',
        sendEvaluation: 'disabled',
        transcribeAudio: 'disabled',
        transcribeAudioJson: '',
        birthdayDate: 'disabled',
        ignoreBussinesHours: 'disabled',
        disableExternalIntegration: 'disabled',
        waitProcessExternalInteraction: 'enabled',
        webPush: 'disabled',
        isActive: true,
        birthdayDateMessage: '',
        bDateFileName: null,
        birthdayDateHour: '',
        difyKey: '',
        difyUrl: '',
        difyType: '',
        difyOff: '',
        difyRestart: '',
        wavoipToken: null,
        closeKeyWord: null,
        smtpConfig: {
          host: 'smtp.gmail.com',    // ← CORREÇÃO: host padrão para Gmail
          port: 465,                  // ← CORREÇÃO: porta padrão para Gmail
          secure: true,               // ← CORREÇÃO: SSL habilitado para Gmail
          auth: {
            user: '',
            pass: ''
          },
          from: '',
          replyTo: '',
          imap: {
            host: 'imap.gmail.com',  // ← CORREÇÃO: host padrão para Gmail
            port: 993,                // ← CORREÇÃO: porta padrão para Gmail
            tls: true                 // ← CORREÇÃO: TLS habilitado para Gmail
          },
          pop3: {
            host: 'pop.gmail.com',   // ← NOVO: host padrão POP3 para Gmail
            port: 995,                // ← NOVO: porta padrão POP3 para Gmail
            tls: true                 // ← NOVO: TLS habilitado POP3 para Gmail
          },
          oauth2: {
            client_id: '',
            client_secret: '',
            redirect_uri: '',
            access_token: '',
            refresh_token: '',
            expires_in: 0,
            token_type: '',
            scope: '',
            provider: 'gmail'
          }
        },
        // OAuth2 properties
        oauth2Code: ''
        // name: '',
        // isDefault: false,
        // wppUser: '',
        // proxyUrl: null,
        // proxyUser: null,
        // proxyPass: null,
        // webversion: null,
        // remotePath: null,
      }
      this.showPairingCode = false
      this.showProxy = false
      this.showWebVersion = false
      this.newChannel = ''
      this.$emit('update:whatsAppEdit', {})
      this.$emit('update:modalWhatsapp', false)
    },
    abrirModal () {
      // Reset de todas as variáveis de loading ao abrir o modal
      this.loading = false
      this.transferLoading = false
      this.oauth2Loading = false
      this.smtpTestLoading = false
      this.imapTestLoading = false
      this.pop3TestLoading = false
      this.statusCheckLoading = false
      
      if (this.whatsAppEdit.id) {
        this.whatsapp = { ...this.whatsAppEdit }
        
        // Garantir que o objeto smtpConfig seja inicializado
        if (!this.whatsapp.smtpConfig) {
          this.whatsapp.smtpConfig = {};
        }
        
        // Garantir que o objeto pop3 seja inicializado
        if (!this.whatsapp.smtpConfig.pop3) {
          this.whatsapp.smtpConfig.pop3 = {
            host: 'pop.gmail.com',
            port: 995,
            tls: true
          };
        }
        
        // Garantir que o objeto oauth2 seja inicializado E preserve dados existentes
        if (!this.whatsapp.smtpConfig.oauth2) {
          this.whatsapp.smtpConfig.oauth2 = {
            client_id: '',
            client_secret: '',
            redirect_uri: '',
            access_token: '',
            refresh_token: '',
            expires_in: 0,
            token_type: '',
            scope: '',
            provider: 'gmail'
          };
        } else {

          // Garantir que campos obrigatórios não sejam undefined
          if (this.whatsapp.smtpConfig.oauth2.access_token === undefined) {
            this.whatsapp.smtpConfig.oauth2.access_token = '';
          }
          if (this.whatsapp.smtpConfig.oauth2.refresh_token === undefined) {
            this.whatsapp.smtpConfig.oauth2.refresh_token = '';
          }
          if (this.whatsapp.smtpConfig.oauth2.expires_in === undefined) {
            this.whatsapp.smtpConfig.oauth2.expires_in = 0;
          }
          if (this.whatsapp.smtpConfig.oauth2.token_type === undefined) {
            this.whatsapp.smtpConfig.oauth2.token_type = '';
          }
          if (this.whatsapp.smtpConfig.oauth2.scope === undefined) {
            this.whatsapp.smtpConfig.oauth2.scope = '';
          }
          if (this.whatsapp.smtpConfig.oauth2.provider === undefined) {
            this.whatsapp.smtpConfig.oauth2.provider = 'gmail';
          }
        }
        
        if (this.whatsapp.proxyUrl) {
          this.showProxy = true;
        } 
        if (!this.whatsapp.proxyUrl){
          this.showProxy = false;
        }
        if (this.whatsapp.webversion) {
          this.showWebVersion = true;
        } 
        if (!this.whatsapp.webversion){
          this.showWebVersion = false;
        }
        if(this.whatsapp.wppUser){
          this.showPairingCode = true
        }
        if(this.whatsapp.queueIdImportMessages){
          this.whatsapp.messageQueue = this.whatsapp.queueIdImportMessages
        }
        if(this.whatsapp.importOldMessages){
          this.whatsapp.importStartDateTime = this.whatsapp.importOldMessages
        }
        if(this.whatsapp.importRecentMessages){
          this.whatsapp.importEndDateTime = this.whatsapp.importRecentMessages
        }
        
        // Converter transcribeAudioJson de objeto para string JSON se necessário
        if (this.whatsapp.transcribeAudioJson && typeof this.whatsapp.transcribeAudioJson === 'object') {
          try {
            this.whatsapp.transcribeAudioJson = JSON.stringify(this.whatsapp.transcribeAudioJson, null, 2);
          } catch (error) {
            console.error('Erro ao converter transcribeAudioJson para string:', error);
            this.whatsapp.transcribeAudioJson = '';
          }
        } else if (!this.whatsapp.transcribeAudioJson) {
          this.whatsapp.transcribeAudioJson = '';
        }
        
        // Verificar status da conexão de email se for webmail
        if (this.whatsapp.type === 'webmail' && this.whatsapp.id) {
          this.checkConnectionStatusMethod();
        }
      }
    },
    async handleSaveWhatsApp (whatsapp) {
      this.loading = true
      this.v$.whatsapp.$touch()
      if(this.whatsapp.birthdayDateHour === '' || !this.whatsapp.birthdayDateHour){
        this.whatsapp.birthdayDateHour === null
      }
      
      // Converter transcribeAudioJson de string para objeto antes de salvar (se necessário)
      if (whatsapp.transcribeAudioJson && typeof whatsapp.transcribeAudioJson === 'string') {
        const trimmed = whatsapp.transcribeAudioJson.trim();
        if (trimmed !== '') {
          try {
            whatsapp.transcribeAudioJson = JSON.parse(trimmed);
          } catch (error) {
            console.error('Erro ao converter transcribeAudioJson para objeto:', error);
            // Se não for JSON válido, manter como null
            whatsapp.transcribeAudioJson = null;
          }
        } else {
          whatsapp.transcribeAudioJson = null;
        }
      } else if (!whatsapp.transcribeAudioJson || (typeof whatsapp.transcribeAudioJson === 'object' && Object.keys(whatsapp.transcribeAudioJson).length === 0)) {
        whatsapp.transcribeAudioJson = null;
      }
      
      // Para webmail, recarregar dados atuais do smtpConfig antes de salvar
      if (whatsapp.type === 'webmail' && this.whatsAppEdit.id) {
        try {
          const whatsappAtualizado = await GetWhatSession(this.whatsAppEdit.id);
          if (whatsappAtualizado.data && whatsappAtualizado.data.smtpConfig && whatsappAtualizado.data.smtpConfig.oauth2) {
            // Preservar os dados do modal e apenas atualizar os campos de autenticação OAuth2
            if (whatsappAtualizado.data.smtpConfig.oauth2.access_token) {
              this.whatsapp.smtpConfig.oauth2.access_token = whatsappAtualizado.data.smtpConfig.oauth2.access_token;
            }
            if (whatsappAtualizado.data.smtpConfig.oauth2.refresh_token) {
              this.whatsapp.smtpConfig.oauth2.refresh_token = whatsappAtualizado.data.smtpConfig.oauth2.refresh_token;
            }
            if (whatsappAtualizado.data.smtpConfig.oauth2.expires_in) {
              this.whatsapp.smtpConfig.oauth2.expires_in = whatsappAtualizado.data.smtpConfig.oauth2.expires_in;
            }
            if (whatsappAtualizado.data.smtpConfig.oauth2.token_type) {
              this.whatsapp.smtpConfig.oauth2.token_type = whatsappAtualizado.data.smtpConfig.oauth2.token_type;
            }
            if (whatsappAtualizado.data.smtpConfig.oauth2.scope) {
              this.whatsapp.smtpConfig.oauth2.scope = whatsappAtualizado.data.smtpConfig.oauth2.scope;
            }
          }
        } catch (error) {
          console.error('Erro ao recarregar dados de autenticação OAuth2 do webmail:', error);
        }
      }
      
      if(whatsapp.type !== 'hub'){
        if (this.v$.whatsapp.$error) {
          this.loading = false // Reset loading antes do return
          return this.$q.notify({
            type: 'warning',
            progress: true,
            position: 'top',
            message: this.$t('sessaoModalWhatsapp.checkErrors'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
        if (!whatsapp.proxyUrl) {
          whatsapp.proxyUrl = null;
          whatsapp.proxyUser = null;
          whatsapp.proxyPass = null;
          whatsapp.webversion = null;
          whatsapp.remotePath = null;
        }
        try {
          if (this.whatsAppEdit.id) {
            if (this.whatsapp.messageQueue && this.whatsapp.messageQueue.id) {
              whatsapp.queueIdImportMessages = this.whatsapp.messageQueue.id;
            }

            if (this.whatsapp.importStartDateTime) {
              whatsapp.importOldMessages = this.formatDateTime(this.whatsapp.importStartDateTime);
            }

            if (this.whatsapp.importEndDateTime) {
              whatsapp.importRecentMessages = this.formatDateTime(this.whatsapp.importEndDateTime);
            }

            await UpdateWhatsapp(this.whatsAppEdit.id, whatsapp)

            if(whatsapp.type === "waba"){
              try {
                const data = {
                  tokenAPI: this.whatsapp.tokenAPI,
                  wabaId: this.whatsapp.wabaId,
                  bmToken: this.whatsapp.bmToken,
                  wabaVersion: this.whatsapp.wabaVersion
                }
                const response = await VerificarTelefone(data);
                console.log('Waba response: ', response)
              } catch (error) {
                console.log('Waba error: ', error)
                if (error.response && error.response.status === 400) {
                  this.$q.notify({
                    type: 'warning',
                    progress: true,
                    position: 'top',
                    message: this.$t('sessaoModalWhatsapp.wabaError'),
                    actions: [{ icon: 'close', round: true, color: 'white' }]
                  });
                } else {
                  this.$q.notify({
                    type: 'warning',
                    progress: true,
                    position: 'top',
                    message: this.$t('sessaoModalWhatsapp.wabaError'),
                    actions: [{ icon: 'close', round: true, color: 'white' }]
                  });
                  return
                }
              }
            }

          } else {
            const payload = {
              ...this.whatsapp
            };

            if (this.whatsapp.type === 'evo' || this.whatsapp.type === 'zapi' || this.whatsapp.type === 'uazapi') {
              const filteredValue = this.whatsapp.name.replace(/[^a-zA-Z0-9]/g, '');
              payload.name = filteredValue;
            }

            if (this.whatsapp.messageQueue && this.whatsapp.messageQueue.id) {
              payload.queueIdImportMessages = this.whatsapp.messageQueue.id;
            }

            if (this.whatsapp.importStartDateTime) {
              payload.importOldMessages = this.formatDateTime(this.whatsapp.importStartDateTime);
            }

            if (this.whatsapp.importEndDateTime) {
              payload.importRecentMessages = this.formatDateTime(this.whatsapp.importEndDateTime);
            }

            const response = await CriarWhatsapp(payload)
            const createdWhatsapp = response?.data || response?.data?.whatsapp || payload

            // Se for zapi ou uazapi e tiver tokenAPI e wabaId preenchidos, emitir evento para configurar webhook
            if ((whatsapp.type === 'zapi' || whatsapp.type === 'uazapi') && 
                whatsapp.tokenAPI && whatsapp.wabaId) {
              this.$emit('setup-webhook', {
                type: whatsapp.type,
                id: createdWhatsapp?.id,
                tokenAPI: whatsapp.tokenAPI,
                wabaId: whatsapp.wabaId,
                name: whatsapp.name,
                ...createdWhatsapp
              })
            }

            if(whatsapp.type === "waba"){
              try {
                const data = {
                  tokenAPI: this.whatsapp.tokenAPI,
                  wabaId: this.whatsapp.wabaId,
                  bmToken: this.whatsapp.bmToken,
                  wabaVersion: this.whatsapp.wabaVersion
                }
                const response = await VerificarTelefone(data);
                console.log('Waba response: ', response)
              } catch (error) {
                console.log('Waba error: ', error)
                if (error.response && error.response.status === 400) {
                  this.$q.notify({
                    type: 'warning',
                    progress: true,
                    position: 'top',
                    message: this.$t('sessaoModalWhatsapp.wabaError'),
                    actions: [{ icon: 'close', round: true, color: 'white' }]
                  });
                } else {
                  this.$q.notify({
                    type: 'warning',
                    progress: true,
                    position: 'top',
                    message: this.$t('sessaoModalWhatsapp.wabaError'),
                    actions: [{ icon: 'close', round: true, color: 'white' }]
                  });
                  return
                }
              }
            }      

          }
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: `${this.$t('sessaoModalWhatsapp.whatsappSaved')} ${this.whatsAppEdit.id ? this.$t('sessaoModalWhatsapp.edited') : this.$t('sessaoModalWhatsapp.created')} ${this.$t('sessaoModalWhatsapp.sucess')}!`,
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.$emit('recarregar-lista')
          this.fecharModal()
        } catch (error) {
          console.error(error, error.data.error === 'ERR_NO_PERMISSION_CONNECTIONS_LIMIT')
          if (error.data.error === 'ERR_NO_PERMISSION_CONNECTIONS_LIMIT') {
            Notify.create({
              type: 'negative',
              message: this.$t('sessaoModalWhatsapp.conectLimit'),
              caption: 'ERR_NO_PERMISSION_CONNECTIONS_LIMIT',
              position: 'top',
              progress: true
            })
          } else {
            console.error(error)
            return this.$q.notify({
              type: 'error',
              progress: true,
              position: 'top',
              message: this.$t('sessaoModalWhatsapp.saveError'),
              actions: [{
                icon: 'close',
                round: true,
                color: 'white'
              }]
            })
          }
        }
      } else if(whatsapp.type === 'hub'){
        if (this.v$.whatsapp.$error) {
          this.loading = false // Reset loading antes do return
          return this.$q.notify({
            type: 'warning',
            progress: true,
            position: 'top',
            message: 'Ops! Verifique os erros...',
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
        if (!this.selectedHubOption) {
          this.loading = false // Reset loading antes do return
          return this.$q.notify({
            type: 'warning',
            message: 'Por favor, selecione um Hub antes de continuar.',
            position: 'top',
            actions: [{ icon: 'close', round: true, color: 'white' }]
          });
        }
        const selectedHub = this.selectedHubOption.value;
        const data = {
          name: this.whatsapp.name,
          status: 'CONNECTED',
          isDefault: false,
          type: 'hub_' + selectedHub.channel,
          wabaId: selectedHub.id, 
          number: selectedHub.id,
          profilePic: selectedHub.profile_pic,
          phone: selectedHub
        };

        const payload = {
          channels: [data]
        };
        
        try {
          const response = await AdicionarHub(payload);
          console.log(response);
          this.$q.notify({
            type: 'positive',
            message: 'Hub adicionado com sucesso!',
            position: 'top'
          });
          this.$emit('recarregar-lista')
          this.fecharModal();

        } catch (error) {
          console.error('Erro ao adicionar o Hub:', error);
          this.loading = false // Reset loading em caso de erro
          this.$q.notify({
            type: 'negative',
            message: 'Erro ao adicionar o Hub. Por favor, tente novamente.',
            position: 'top'
          });
        }
      }
      if(whatsapp?.bDateFileName){
        const formData = new FormData();
        formData.append("medias", whatsapp.bDateFileName);
        formData.append("type", whatsapp.type);
        if (this.whatsAppEdit.id) {
          await UpdateWhatsapp(this.whatsAppEdit.id, formData)
        }
      }
      this.loading = false
    },
    handleStartDateChange() {
      this.showTime1 = true;
      // Atualiza a data formatada mesmo sem horário definido
      if (this.whatsapp.importStartDate) {
        this.whatsapp.importStartDateTime = this.whatsapp.importStartDate + ' 00:00';
        this.displayStartDate = this.formatDateTime(this.whatsapp.importStartDateTime);
      }
    },
    handleStartTimeChange() {
      this.updateStartDateTime();
    },
    handleEndDateChange() {
      this.showTime2 = true;
      // Atualiza a data formatada mesmo sem horário definido
      if (this.whatsapp.importEndDate) {
        this.whatsapp.importEndDateTime = this.whatsapp.importEndDate + ' 23:59';
        this.displayEndDate = this.formatDateTime(this.whatsapp.importEndDateTime);
      }
    },
    handleEndTimeChange() {
      this.updateEndDateTime();
    },
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
    // Configurar OAuth2 para Gmail
    async configureGmailOAuth2Method() {
      try {
        this.whatsapp.oauth2Loading = true;
        
        // Verificar se tem WhatsApp ID
        if (!this.whatsapp.id) {
          throw new Error('WhatsApp ID não encontrado. Salve o WhatsApp primeiro.');
        }
        
        // Verificar se tem configuração OAuth2 básica
        if (!this.whatsapp.smtpConfig.oauth2?.client_id || !this.whatsapp.smtpConfig.oauth2?.client_secret) {
          throw new Error('Configure o Client ID e Client Secret OAuth2 primeiro.');
        }
        
        // Iniciar fluxo OAuth2
        const response = await startGmailOAuth2(this.whatsapp.id);
        
        if (response.data.success && response.data.authUrl) {
          // Abrir URL de autorização em nova aba
          window.open(response.data.authUrl, '_blank', 'width=600,height=700');
          
          // Mostrar instruções para o usuário
          this.$q.notify({
            type: 'info',
            message: this.$t('sessaoModalWhatsapp.novo.abraUrlAutorizacao'),
            position: 'top',
            timeout: 10000
          });
          
          // Aguardar callback (em produção, usar WebSocket ou polling)
          this.waitForOAuth2CallbackMethod();
        }
      } catch (error) {
        console.error('Erro ao configurar OAuth2:', error);
        this.$q.notify({
          type: 'negative',
          message: this.$t('sessaoModalWhatsapp.novo.errorConfigurarOAuth2') + (error.response?.data?.message || error.message),
          position: 'top'
        });
      } finally {
        this.whatsapp.oauth2Loading = false;
      }
    },
    
    // Aguardar callback OAuth2
    async waitForOAuth2CallbackMethod() {
      // Em produção, implementar WebSocket ou polling
      // Por enquanto, mostrar instruções manuais
      this.$q.dialog({
        title: this.$t('sessaoModalWhatsapp.novo.configuracaoOAuth2'),
        message: `
          <div class="q-pa-md">
            <p><strong>Passos para completar a configuração OAuth2:</strong></p>
            <ol>
              <li>Acesse a URL de autorização que foi aberta</li>
              <li>Faça login na sua conta Google</li>
              <li>Autorize o acesso ao Gmail</li>
              <li>Copie o código de autorização</li>
              <li>Cole o código no campo abaixo</li>
            </ol>
            <q-input
              v-model="whatsapp.oauth2Code"
              label="Código de Autorização"
              placeholder="Cole o código aqui"
              class="q-mt-md"
            />
          </div>
        `,
        html: true,
        ok: {
          label: this.$t('sessaoModalWhatsapp.novo.completarConfiguracao'),
          color: 'primary'
        },
        cancel: {
          label: this.$t('sessaoModalWhatsapp.novo.cancelar'),
          color: 'negative'
        }
      }).onOk(async () => {
        if (this.whatsapp.oauth2Code) {
          await this.completeOAuth2SetupMethod(this.whatsapp.oauth2Code);
        }
      });
    },
    
    // Completar configuração OAuth2
    async completeOAuth2SetupMethod(code) {
      try {
        this.whatsapp.oauth2Loading = true;
        
        // Verificar se tem WhatsApp ID
        if (!this.whatsapp.id) {
          throw new Error('WhatsApp ID não encontrado. Salve o WhatsApp primeiro.');
        }

        // Completar callback OAuth2
        const response = await handleGmailOAuth2Callback(code, this.whatsapp.id);
        
        if (response.data.success && response.data.tokens) {
          // Salvar tokens no WhatsApp
          if (!this.whatsapp.smtpConfig.oauth2) {
            this.whatsapp.smtpConfig.oauth2 = {};
          }
          
          this.whatsapp.smtpConfig.oauth2.access_token = response.data.tokens.access_token;
          this.whatsapp.smtpConfig.oauth2.refresh_token = response.data.tokens.refresh_token;
          this.whatsapp.smtpConfig.oauth2.expires_in = response.data.tokens.expires_in;
          
          this.$q.notify({
            type: 'positive',
            message: 'OAuth2 configurado com sucesso!',
            position: 'top'
          });
          
          // Limpar código temporário
          this.whatsapp.oauth2Code = '';
        }
      } catch (error) {
        console.error('Erro ao completar OAuth2:', error);
        this.$q.notify({
          type: 'negative',
          message: this.$t('sessaoModalWhatsapp.novo.errorCompletarOAuth2') + (error.response?.data?.message || error.message),
          position: 'top'
        });
      } finally {
        this.whatsapp.oauth2Loading = false;
      }
    },
    

    
    // Testar conexão SMTP
    async testSmtpConnectionMethod() {
      try {
        this.whatsapp.smtpTestLoading = true;
        
        // Validar se temos um WhatsApp ID (para edição) ou se é novo
        if (!this.whatsapp.id) {
          this.$q.notify({
            type: 'warning',
            message: this.$t('sessaoModalWhatsapp.novo.salveWhatsAppPrimeiro'),
            position: 'top'
          });
          return;
        }
        
        const response = await testSmtpConnectionService(this.whatsapp.id);
        
        if (response.data.success) {
          this.$q.notify({
            type: 'positive',
            message: this.$t('sessaoModalWhatsapp.novo.conexaoSmtpTestadaComSucesso'),
            position: 'top'
          });
        } else {
          this.$q.notify({
            type: 'negative',
            message: this.$t('sessaoModalWhatsapp.novo.falhaNoTesteSmtp') + (response.data.message || 'Erro desconhecido'),
            position: 'top'
          });
        }
      } catch (error) {
        console.error('Erro ao testar SMTP:', error);
        this.$q.notify({
          type: 'negative',
          message: this.$t('sessaoModalWhatsapp.novo.erroAoTestarSmtp') + (error.response?.data?.message || error.message),
          position: 'top'
        });
      } finally {
        this.whatsapp.smtpTestLoading = false;
      }
    },
    
    // Testar conexão IMAP
    async testImapConnectionMethod() {
      try {
        this.whatsapp.imapTestLoading = true;
        
        // Validar se temos um WhatsApp ID (para edição) ou se é novo
        if (!this.whatsapp.id) {
          this.$q.notify({
            type: 'warning',
            message: 'Salve o WhatsApp primeiro para testar a conexão IMAP',
            position: 'top'
          });
          return;
        }
        
        const response = await testImapConnectionService(this.whatsapp.id);
        
        if (response.data.success) {
          this.$q.notify({
            type: 'positive',
            message: 'Conexão IMAP testada com sucesso!',
            position: 'top'
          });
        } else {
          this.$q.notify({
            type: 'negative',
            message: 'Falha no teste IMAP: ' + (response.data.message || 'Erro desconhecido'),
            position: 'top'
          });
        }
      } catch (error) {
        console.error('Erro ao testar IMAP:', error);
        this.$q.notify({
          type: 'negative',
          message: 'Erro ao testar IMAP: ' + (error.response?.data?.message || error.message),
          position: 'top'
        });
      } finally {
        this.whatsapp.imapTestLoading = false;
      }
    },
    
    // Testar conexão POP3
    async testPop3ConnectionMethod() {
      try {
        this.whatsapp.pop3TestLoading = true;
        
        // Validar se temos um WhatsApp ID (para edição) ou se é novo
        if (!this.whatsapp.id) {
          this.$q.notify({
            type: 'warning',
            message: 'Salve o WhatsApp primeiro para testar a conexão POP3',
            position: 'top'
          });
          return;
        }
        
        const response = await testPop3ConnectionService(this.whatsapp.id);
        
        if (response.data.success) {
          this.$q.notify({
            type: 'positive',
            message: 'Conexão POP3 testada com sucesso!',
            position: 'top'
          });
        } else {
          this.$q.notify({
            type: 'negative',
            message: 'Falha no teste POP3: ' + (response.data.message || 'Erro desconhecido'),
            position: 'top'
          });
        }
      } catch (error) {
        console.error('Erro ao testar POP3:', error);
        this.$q.notify({
          type: 'negative',
          message: 'Erro ao testar POP3: ' + (error.response?.data?.message || error.message),
          position: 'top'
        });
      } finally {
        this.whatsapp.pop3TestLoading = false;
      }
    },
    
    // Verificar status da conexão
    async checkConnectionStatusMethod() {
      try {
        this.whatsapp.statusCheckLoading = true;
        
        // Validar se temos um WhatsApp ID (para edição) ou se é novo
        if (!this.whatsapp.id) {
          this.$q.notify({
            type: 'warning',
            message: this.$t('sessaoModalWhatsapp.novo.salveWhatsAppPrimeiro'),
            position: 'top'
          });
          return;
        }
        
        const response = await getEmailConnectionStatusService(this.whatsapp.id);
        
        if (response.data.success) {
          this.connectionStatus = response.data.data;
          this.$q.notify({
            type: 'positive',
            message: this.$t('sessaoModalWhatsapp.novo.statusDaConexaoAtualizado'),
            position: 'top'
          });
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
        this.$q.notify({
          type: 'negative',
          message: this.$t('sessaoModalWhatsapp.novo.erroAoVerificarStatus') + (error.response?.data?.message || error.message),
          position: 'top'
        });
      } finally {
        this.whatsapp.statusCheckLoading = false;
      }
    }
  },
  unmounted() {
    this.v$.whatsapp.$reset()
  },
  async mounted() {
    this.listarFilas()
    this.listarChatFlow()
    this.listarUsuario()
    await this.listarConfiguracoes()
    const storedColors = localStorage.getItem('storedColors');
    if (storedColors) {
      const colors = JSON.parse(storedColors).reduce((acc, colorObj) => {
        const key = colorObj.label.toLowerCase();
        acc[key] = colorObj[key];
        return acc;
      }, {});

      const root = document.documentElement;
      Object.keys(colors).forEach(key => {
        root.style.setProperty(`--q-${key}`, colors[key]);
      });
    } else {
      console.warn('Nenhuma cor armazenada no localStorage');
    }
    // this.loadColors()
    await this.listTenantPorId()
    // await this.listarHubOptions()
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

.loading-bar {
  width: 100%;
  height: 4px;
  background-color: #ccc;
  position: relative;

  .bar {
    width: 0;
    height: 100%;
    background-color: #007bff;
    position: absolute;
    top: 0;
    left: 0;
    animation: loadingAnimation 1s infinite;
  }
}

@keyframes loadingAnimation {
  0% {
    width: 0;
  }
  100% {
    width: 100%;
  }
}

.modal {
  padding: 20px;
}

.section {
  margin-bottom: 20px;
  padding: 15px;
  border-radius: 5px;
  outline: 1px dotted ;
}

.actions {
  display: flex;
  justify-content: space-between;
}

.blur-effect {
  filter: blur(0px)   
}

.q-btn {
  border-radius: 7px;
  min-width: 22px;
  min-height: 22px;
  padding: 0.08rem 0.38rem;
  font-size: 0.78rem;
  transition: box-shadow 0.2s, background 0.2s;
  box-shadow: 0 1px 2px rgba(0,0,0,0.06);
  &:hover {
    box-shadow: 0 3px 8px rgba(0,0,0,0.11);
    background: rgba(var(--q-primary-rgb), 0.09);
  }
}

.q-card {
  background: rgba(255,255,255,0.92) !important;
  border-radius: 20px !important;
  box-shadow: 0 6px 32px rgba(0,0,0,0.13) !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(0,0,0,0.06) !important;
  transition: box-shadow 0.2s, background 0.2s;
}

.cursor-pointer {
  cursor: pointer;
}
body.body--dark .q-card {
  background: rgba(30,30,30,0.98) !important;
  box-shadow: 0 6px 32px rgba(0,0,0,0.22) !important;
  border: 1px solid rgba(255,255,255,0.10) !important;
}
@media (max-width: 600px) {
  .q-card {
    width: 98vw !important;
    min-width: unset !important;
    padding: 0.5rem !important;
    border-radius: 12px !important;
  }
}
</style>
