<template>
  <div v-if="(userProfile === 'admin' || (userProfile === 'super' && pageAllowed))">
    <div class="row col full-width q-pa-lg">
      <q-card
        flat
        bordered
        class="full-width"
      >
        <q-card-section class="text-h6 text-bold">
          {{ $t('sessao.title') }}
          <div class="absolute-top-right q-pa-sm">
            <q-btn flat class="btn-outline q-mr-sm attention-button"
              color="primary"
              :icon="isCompactView ? 'mdi-view-grid' : 'mdi-view-list'"
              :label="isCompactView ? $t('sessao.normalView') : $t('sessao.compactView')"
              @click="toggleView"
            />
            <q-btn flat class="btn-outline"
              color="primary"
              icon="add"
              :label="$t('sessao.addChannel')"
              @click="whatsappSelecionado = {}; modalWhatsapp = true"
            />
          </div>
        </q-card-section>
      </q-card>
    </div>
    <div class="row full-width q-py-lg q-px-md ">
      <template v-for="item in canais" :key="item.id">
        <q-card
          flat
          bordered
          :class="[
            isCompactView ? 'col-xs-12 col-sm-6 col-md-4 col-lg-3 q-ma-sm' : 'col-xs-12 col-sm-5 col-md-4 col-lg-3 q-ma-md',
            isCompactView ? 'compact-card' : ''
          ]"
        >
          <q-item :class="{'q-pa-sm': isCompactView}">
            <q-item-section avatar>
              <q-avatar>
                <q-icon
                  :size="isCompactView ? '30px' : '40px'"
                  :name="`img:${item.type}-logo.png`"
                />
              </q-avatar>
            </q-item-section>
            <q-item-section>
              <q-item-label :class="{'text-subtitle1': isCompactView, 'text-h6': !isCompactView}" class="text-bold">{{ item.name }}</q-item-label>
              <q-item-label :class="{'text-caption': isCompactView, 'text-h6 text-caption': !isCompactView}">
                #{{ item.id }} - {{ item.type }}
              </q-item-label>
            </q-item-section>
            <q-item-section v-if="item.isDefault">
                <q-icon color="primary" :class="{'text-subtitle1': isCompactView, 'text-h6': !isCompactView}" name="mdi-checkbox-multiple-marked-circle-outline">
                  <q-tooltip>
                    {{ $t('sessao.defaultConnection') }}
                  </q-tooltip>
                </q-icon>
              </q-item-section>
              <q-item-section side v-if="isCompactView">
                <div class="row items-center no-wrap" style="flex-wrap: wrap; justify-content: space-between;">
                  <q-btn
                    round
                    flat
                    dense
                    icon="edit"
                    @click="handleOpenModalWhatsapp(item)"
                    v-if="isAdmin">
                    <q-tooltip>
                      {{ $t('sessao.editChannel') }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn-dropdown
                    round
                    flat
                    dense
                    icon="settings"
                    class="q-ml-sm"
                  >
                    <q-list>
                      <q-item clickable v-if="item.type.includes('hub')" @click="setWebhookAgain(item)">
                        <q-item-section avatar>
                          <q-icon name="refresh" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('sessao.revalidateWebhook') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item clickable v-if="item.type.includes('evo')" @click="setEvoWebhookAgain(item)">
                        <q-item-section avatar>
                          <q-icon name="refresh" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('sessao.revalidateConnection') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item clickable v-if="item.type === 'zapi'" @click="setZapiWebhookAgain(item)">
                        <q-item-section avatar>
                          <q-icon name="refresh" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('sessao.revalidateConnection') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item clickable v-if="item.type === 'uazapi'" @click="setUazapiWebhookAgain(item)">
                        <q-item-section avatar>
                          <q-icon name="refresh" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('sessao.revalidateConnection') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item clickable v-if="item.type.includes('meow')" @click="setMeowWebhookAgain(item)">
                        <q-item-section avatar>
                          <q-icon name="refresh" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('sessao.revalidateConnection') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item clickable v-if="item.type === 'waba'" @click="setWabaWebhookAgain(item)">
                        <q-item-section avatar>
                          <q-icon name="refresh" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('sessao.revalidateWebhook') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item clickable v-if="item.type === 'waba'" @click="setWabaCoexWebhookAgain(item)">
                        <q-item-section avatar>
                          <q-icon name="settings_phone" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('sessao.revalidateCoexWebhook') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <!-- <q-item clickable v-if="item.type === 'instagram'" @click="setInstagramWebhookAgain(item)">
                        <q-item-section avatar>
                          <q-icon name="refresh" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('sessao.revalidateWebhook') }}</q-item-label>
                        </q-item-section>
                      </q-item> -->
                      <!-- <q-item clickable v-if="item.type === 'messenger'" @click="setMessengerWebhookAgain(item)">
                        <q-item-section avatar>
                          <q-icon name="refresh" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('sessao.revalidateWebhook') }}</q-item-label>
                        </q-item-section>
                      </q-item> -->
                      <q-item clickable @click="deleteWhatsapp(item)" :disable="!isAdmin">
                        <q-item-section avatar>
                          <q-icon name="mdi-delete" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('sessao.deleteTooltip') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item clickable @click="setDefault(item)" :disable="!isAdmin">
                        <q-item-section avatar>
                          <q-icon name="mdi-checkbox-multiple-marked-circle-outline" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('sessao.defaultTooltip') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item clickable @click="closeAllOpen(item)" :disable="!isAdmin">
                        <q-item-section avatar>
                          <q-icon name="mdi-progress-close" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('sessao.closeOpenTickets') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item clickable @click="closeAllPending(item)" :disable="!isAdmin">
                        <q-item-section avatar>
                          <q-icon name="mdi-progress-clock" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('sessao.closePendingTickets') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item clickable @click="syncOldMessagesWhatsapp(item)" :disable="!isAdmin" v-if="item.type === 'whatsapp'">
                        <q-item-section avatar>
                          <q-icon name="mdi-sync" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('sessao.syncMessages') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                  <q-icon
                    v-if="item.wavoipToken && ['whatsapp', 'baileys', 'meow', 'evo', 'uazapi', 'zapi'].includes(item.type)"
                    name="mdi-phone-in-talk"
                    color="primary"
                    size="1.5em"
                    class="q-ml-sm cursor-pointer"
                    @click="abrirModalWavoipTokens(item)"
                  >
                      <q-tooltip content-class="text-bold" :delay="300">
                      {{ $t('wavoip.tokensModal.viewTokensTooltip') }}
                    </q-tooltip>
                  </q-icon>
                  <!-- <q-btn-dropdown
                    round
                    flat
                    dense
                    icon="mdi-robot"
                    class="q-ml-sm"
                  >
                    <q-list>
                      <q-item>
                        <q-card-section>
                          <div class="text-bold q-mb-xs">{{ $t('sessao.chatbot') }}</div>
                          <q-select
                            outlined
                            dense
                            style="min-width: 200px;"
                            :label="$t('sessao.chatbot')"
                            v-model="item.chatFlowId"
                            :options="listaChatFlow"
                            map-options
                            emit-value
                            option-value="id"
                            option-label="name"
                            clearable
                            @update:model-value="handleSaveWhatsApp(item)"
                          />
                        </q-card-section>
                      </q-item>
                      <q-item style="margin-top: -30px;">
                        <q-card-section>
                          <div class="text-bold q-mb-xs">{{ $t('sessao.queue') }}</div>
                          <q-select
                            outlined
                            dense
                            style="min-width: 200px;"
                            :label="$t('sessao.queue')"
                            v-model="item.queueId"
                            :options="listaFila"
                            map-options
                            emit-value
                            option-value="id"
                            option-label="queue"
                            clearable
                            @update:model-value="handleSaveWhatsApp(item)"
                          >
                            <q-tooltip>
                              {{ $t('sessao.noQueueTooltip') }}
                            </q-tooltip>
                          </q-select>
                        </q-card-section>
                      </q-item>
                      <q-item style="margin-top: -30px;">
                        <q-card-section>
                          <div class="text-bold q-mb-xs">{{ $t('sessao.user') }}</div>
                          <q-select
                            outlined
                            dense
                            style="min-width: 200px;"
                            :label="$t('sessao.user')"
                            v-model="item.userId"
                            :options="listaUsuario"
                            map-options
                            emit-value
                            option-value="id"
                            option-label="name"
                            clearable
                            @update:model-value="handleSaveWhatsApp(item)"
                          >
                            <q-tooltip>
                              {{ $t('sessao.noUserTooltip') }}
                            </q-tooltip>
                          </q-select>
                        </q-card-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown> -->
                </div>
              </q-item-section>
            <template v-if="!isCompactView">
              <q-item-section v-if="item.isDefault">
                <q-icon color="primary" :class="{'text-subtitle1': isCompactView, 'text-h6': !isCompactView}" name="mdi-checkbox-multiple-marked-circle-outline">
                  <q-tooltip>
                    {{ $t('sessao.defaultConnection') }}
                  </q-tooltip>
                </q-icon>
              </q-item-section>
              <q-item-section side>
                <div class="row items-center no-wrap" style="flex-wrap: wrap; justify-content: space-between;">
                  <q-btn
                    round
                    flat
                    dense
                    icon="edit"
                    @click="handleOpenModalWhatsapp(item)"
                    v-if="isAdmin">
                    <q-tooltip>
                      {{ $t('sessao.editChannel') }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    round
                    flat
                    dense
                    icon="refresh"
                    class="q-ml-sm"
                    @click="setWebhookAgain(item)"
                    v-if="item.type.includes('hub')"
                  >
                    <q-tooltip>
                      {{ $t('sessao.revalidateWebhook') }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    round
                    flat
                    dense
                    icon="refresh"
                    class="q-ml-sm"
                    @click="setEvoWebhookAgain(item)"
                    v-if="item.type.includes('evo')"
                  >
                    <q-tooltip>
                      {{ $t('sessao.revalidateConnection') }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    round
                    flat
                    dense
                    icon="refresh"
                    class="q-ml-sm"
                    @click="setMeowWebhookAgain(item)"
                    v-if="item.type.includes('meow')"
                  >
                    <q-tooltip>
                      {{ $t('sessao.revalidateConnection') }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    round
                    flat
                    dense
                    icon="refresh"
                    class="q-ml-sm"
                    @click="setZapiWebhookAgain(item)"
                    v-if="item.type === 'zapi'"
                  >
                    <q-tooltip>
                      {{ $t('sessao.revalidateConnection') }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    round
                    flat
                    dense
                    icon="refresh"
                    class="q-ml-sm"
                    @click="setUazapiWebhookAgain(item)"
                    v-if="item.type === 'uazapi'"
                  >
                    <q-tooltip>
                      {{ $t('sessao.revalidateConnection') }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    round
                    flat
                    dense
                    icon="refresh"
                    class="q-ml-sm"
                    @click="setWabaWebhookAgain(item)"
                    v-if="item.type === 'waba'"
                  >
                    <q-tooltip>
                      {{ $t('sessao.revalidateWebhook') }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    round
                    flat
                    dense
                    icon="settings_phone"
                    class="q-ml-sm"
                    @click="setWabaCoexWebhookAgain(item)"
                    v-if="item.type === 'waba'"
                  >
                    <q-tooltip>
                      {{ $t('sessao.revalidateCoexWebhook') }}
                    </q-tooltip>
                  </q-btn>
                  <!-- <q-btn
                    round
                    flat
                    dense
                    icon="refresh"
                    class="q-ml-sm"
                    @click="setInstagramWebhookAgain(item)"
                    v-if="item.type === 'instagram'"
                  >
                    <q-tooltip>
                      {{ $t('sessao.revalidateWebhook') }}
                    </q-tooltip>
                  </q-btn> -->
                  <!-- <q-btn
                    round
                    flat
                    dense
                    icon="refresh"
                    class="q-ml-sm"
                    @click="setMessengerWebhookAgain(item)"
                    v-if="item.type === 'messenger'"
                  >
                    <q-tooltip>
                      {{ $t('sessao.revalidateWebhook') }}
                    </q-tooltip>
                  </q-btn> -->
                </div>
              </q-item-section>
            </template>
          </q-item>
          <q-separator />
          <q-card-section :class="{'q-pa-sm': isCompactView}">
            <ItemStatusChannel :item="item" :compact="isCompactView" />
            <!-- <template v-if="item.type === 'messenger'">
              <div :class="{'text-caption': isCompactView, 'text-body2': !isCompactView}" class="text-bold q-mt-sm">
                <span> {{ $t('sessao.page') }} </span>
                {{ item.fbObject && item.fbObject.name || $t('sessao.noPageConfigured') }}
              </div>
            </template> -->
          </q-card-section>
          <template v-if="isCompactView">
            <q-card-actions
              class="q-gutter-md q-pa-md q-pt-none"
              align="center"
            >
              <template v-if="item.type !== 'messenger'">
                <q-btn
                  v-if="(item.type == 'whatsapp' || item.type == 'baileys' || item.type == 'meow' || item.type == 'evo' || item.type == 'zapi' || item.type == 'uazapi') && item.status == 'qrcode'"
                  color="primary"
                  :label="$t('sessao.qrCode')"
                  @click="handleOpenQrModal(item, 'btn-qrCode')"
                  icon-right="mdi-qrcode-scan"
                  :disable="!isAdmin"
                />

                <div
                  v-if="item.status == 'DISCONNECTED'"
                  class="q-gutter-sm"
                >
                  <q-btn
                    v-if="(item.type == 'whatsapp' && item.type == 'baileys' || item.type == 'meow' || item.type == 'evo' || item.type == 'zapi' || item.type == 'uazapi') && item.status == 'qrcode'"
                    color="positive"
                    :label="$t('sessao.connect')"
                    @click="handleStartWhatsAppSession(item.id)"
                  />
                  <q-btn
                    v-if="(item.type != 'whatsapp' && item.type != 'baileys' && item.type != 'meow' && item.type != 'evo' && item.type != 'zapi' && item.type != 'uazapi')"
                    color="positive"
                    :label="$t('sessao.connect')"
                    @click="handleStartWhatsAppSession(item.id)"
                  />
                  <q-btn
                    v-if="(item.status == 'DISCONNECTED' && item.type == 'whatsapp') || (item.status == 'DISCONNECTED' && item.type == 'baileys') || (item.status == 'DISCONNECTED' && item.type == 'meow') || (item.status == 'DISCONNECTED' && item.type == 'evo') || (item.status == 'DISCONNECTED' && item.type == 'zapi') || (item.status == 'DISCONNECTED' && item.type == 'uazapi')"
                    color="primary"
                    :label="$t('sessao.newQrCode')"
                    @click="handleRequestNewQrCode(item, 'btn-qrCode')"
                    icon-right="mdi-qrcode-scan"
                    :disable="!isAdmin"
                  />
                </div>

                <div
                  v-if="item.status == 'OPENING'"
                  class="row items-center q-gutter-sm flex flex-inline"
                >
                  <div class="text-bold">
                    {{ $t('sessao.connecting') }}
                  </div>
                  <q-spinner-radio
                    color="positive"
                    size="2em"
                  />
                  <q-separator
                    vertical
                    spaced=""
                  />
                </div>

                <q-btn
                  v-if="['OPENING', 'CONNECTED', 'PAIRING', 'TIMEOUT'].includes(item.status) && !item.type.includes('hub') && item.type !== 'instagram' && item.type !== 'messenger'"
                  color="negative"
                  :label="$t('sessao.disconnect')"
                  @click="handleDisconectWhatsSession(item.id)"
                  :disable="!isAdmin"
                  class="q-mx-sm"
                />
              </template>
              <!-- <template v-if="item.type === 'messenger'">
                <VFacebookLogin
                  :app-id="cFbAppId"
                  @sdk-init="handleSdkInit"
                  @login="login => fbLogin(login, item)"
                  @logout="logout => fbLogout(item)"
                  :login-options="FBLoginOptions"
                  version="v12.0"
                >
                  <template v-slot:login>
                    {{ item.status === 'CONNECTED' ? $t('sessao.edit') : $t('sessao.connect') }}
                  </template>
                  <template v-slot:logout>
                    {{ item.status === 'DISCONNECTED' ? $t('sessao.connect') : $t('sessao.edit') }}
                  </template>
                </VFacebookLogin>
              </template> -->
            </q-card-actions>
          </template>
          <!-- <template v-if="!isCompactView">
            <q-card-section>
              <q-select
                outlined
                dense
                :label="$t('sessao.chatbot')"
                v-model="item.chatFlowId"
                :options="listaChatFlow"
                map-options
                emit-value
                option-value="id"
                option-label="name"
                clearable
                @update:model-value="handleSaveWhatsApp(item)"
              />
            </q-card-section>
            <q-card-section>
              <q-select
                outlined
                dense
                :label="$t('sessao.queue')"
                v-model="item.queueId"
                :options="listaFila"
                map-options
                emit-value
                option-value="id"
                option-label="queue"
                clearable
                @update:model-value="handleSaveWhatsApp(item)"
              >
                <q-tooltip>
                  {{ $t('sessao.noQueueTooltip') }}
                </q-tooltip>
              </q-select>
            </q-card-section>
            <q-card-section>
              <q-select
                outlined
                dense
                :label="$t('sessao.user')"
                v-model="item.userId"
                :options="listaUsuario"
                map-options
                emit-value
                option-value="id"
                option-label="name"
                clearable
                @update:model-value="handleSaveWhatsApp(item)"
              >
                <q-tooltip>
                  {{ $t('sessao.noUserTooltip') }}
                </q-tooltip>
              </q-select>
            </q-card-section>
          </template> -->
          <q-separator v-if="!isCompactView"/>
          <template v-if="!isCompactView">
            <q-card-actions
              style="margin-top: 2px;"
              class="q-gutter-md q-pa-md q-pt-none"
              align="center"
            >
              <template v-if="item.type !== 'messenger'">
                <q-btn
                  v-if="(item.type == 'whatsapp' || item.type == 'baileys' || item.type == 'meow' || item.type == 'evo' || item.type == 'zapi' || item.type == 'uazapi') && item.status == 'qrcode'"
                  color="primary"
                  :label="$t('sessao.qrCode')"
                  @click="handleOpenQrModal(item, 'btn-qrCode')"
                  icon-right="mdi-qrcode-scan"
                  :disable="!isAdmin"
                />

                <div
                  v-if="item.status == 'DISCONNECTED'"
                  class="q-gutter-sm"
                >
                  <q-btn
                    v-if="(item.type == 'whatsapp' && item.type == 'baileys' || item.type == 'meow' || item.type == 'evo' || item.type == 'zapi' || item.type == 'uazapi') && item.status == 'qrcode'"
                    color="positive"
                    :label="$t('sessao.connect')"
                    @click="handleStartWhatsAppSession(item.id)"
                  />
                  <q-btn
                    v-if="(item.type != 'whatsapp' && item.type != 'baileys' && item.type != 'meow' && item.type != 'evo' && item.type != 'zapi' && item.type != 'uazapi')"
                    color="positive"
                    :label="$t('sessao.connect')"
                    @click="handleStartWhatsAppSession(item.id)"
                  />
                  <q-btn
                    v-if="(item.status == 'DISCONNECTED' && item.type == 'whatsapp') || (item.status == 'DISCONNECTED' && item.type == 'baileys') || (item.status == 'DISCONNECTED' && item.type == 'meow') || (item.status == 'DISCONNECTED' && item.type == 'evo') || (item.status == 'DISCONNECTED' && item.type == 'zapi') || (item.status == 'DISCONNECTED' && item.type == 'uazapi')"
                    color="primary"
                    :label="$t('sessao.newQrCode')"
                    @click="handleRequestNewQrCode(item, 'btn-qrCode')"
                    icon-right="mdi-qrcode-scan"
                    :disable="!isAdmin"
                  />
                </div>

                <div
                  v-if="item.status == 'OPENING'"
                  class="row items-center q-gutter-sm flex flex-inline"
                >
                  <div class="text-bold">
                    {{ $t('sessao.connecting') }}
                  </div>
                  <q-spinner-radio
                    color="positive"
                    size="2em"
                  />
                  <q-separator
                    vertical
                    spaced=""
                  />
                </div>

                <q-btn
                  v-if="['OPENING', 'CONNECTED', 'PAIRING', 'TIMEOUT'].includes(item.status) && !item.type.includes('hub')"
                  color="negative"
                  :label="$t('sessao.disconnect')"
                  @click="handleDisconectWhatsSession(item.id)"
                  :disable="!isAdmin"
                  class="q-mx-sm"
                />
              </template>

              <!-- <template v-if="item.type === 'messenger'">
                <VFacebookLogin
                  :app-id="cFbAppId"
                  @sdk-init="handleSdkInit"
                  @login="login => fbLogin(login, item)"
                  @logout="logout => fbLogout(item)"
                  :login-options="FBLoginOptions"
                  version="v12.0"
                >
                  <template v-slot:login>
                    {{ item.status === 'CONNECTED' ? $t('sessao.edit') : $t('sessao.connect') }}
                  </template>
                  <template v-slot:logout>
                    {{ item.status === 'DISCONNECTED' ? $t('sessao.connect') : $t('sessao.edit') }}
                  </template>
                </VFacebookLogin>
              </template> -->
              <q-btn
                color="negative"
                icon="mdi-delete"
                @click="deleteWhatsapp(item)"
                :disable="!isAdmin"
                dense
                round
                flat
                class="absolute-bottom-right"
              >
                <q-tooltip>
                  {{ $t('sessao.deleteTooltip') }}
                </q-tooltip>
              </q-btn>
              <q-btn
                style="margin-right: 30px"
                color="primary"
                icon="mdi-checkbox-multiple-marked-circle-outline"
                @click="setDefault(item)"
                :disable="!isAdmin"
                dense
                round
                flat
                class="absolute-bottom-right"
              >
                <q-tooltip>
                  {{ $t('sessao.defaultTooltip') }}
                </q-tooltip>
              </q-btn>
              <q-btn
                
                style="margin-right: 60px"
                color="primary"
                icon="mdi-progress-close"
                @click="closeAllOpen(item)"
                :disable="!isAdmin"
                dense
                round
                flat
                class="absolute-bottom-right"
              >
                <q-tooltip>
                  {{ $t('sessao.closeOpenTickets') }}
                </q-tooltip>
              </q-btn>
              <q-btn
                
                style="margin-right: 90px"
                color="primary"
                icon="mdi-progress-clock"
                @click="closeAllPending(item)"
                :disable="!isAdmin"
                dense
                round
                flat
                class="absolute-bottom-right"
              >
                <q-tooltip>
                  {{ $t('sessao.closePendingTickets') }}
                </q-tooltip>
              </q-btn>
              <template v-if="item.type === 'whatsapp'">
                <q-btn
                  color="positive"
                  icon="mdi-sync"
                  @click="syncOldMessagesWhatsapp(item)"
                  :disable="!isAdmin"
                  dense
                  round
                  flat
                  class="absolute-bottom-left"
                >
                  <q-tooltip>
                    {{ $t('sessao.syncMessages') }}
                  </q-tooltip>
                </q-btn>
              </template>
            </q-card-actions>
          </template>
        </q-card>
      </template>
    </div>
    <ModalQrCode
      v-model:abrirModalQR="abrirModalQR"
      :channel="cDadosWhatsappSelecionado"
      @gerar-novo-qrcode="v => handleRequestNewQrCode(v, 'btn-qrCode')"
    />
    <ModalWhatsapp
      v-model:modalWhatsapp="modalWhatsapp"
      v-model:whatsAppEdit="whatsappSelecionado"
      @recarregar-lista="listarWhatsapps"
      @setup-webhook="handleSetupWebhook"
    />
    
    <q-dialog v-model="modalWavoipTokens" persistent>
      <q-card style="min-width: 500px; max-width: 600px">
        <q-card-section>
          <div class="text-h6" style="color: #1976d2;">
            <q-icon name="mdi-phone-in-talk" class="q-mr-sm" style="color: #1976d2;" />
            {{ $t('wavoip.tokensModal.title', { name: currentWavoipItem?.name }) }}
          </div>
        </q-card-section>
        <q-card-section>
          <q-banner v-if="currentWavoipItem" style="background-color: #fff3cd; color: #856404;" class="q-mb-md">
            <template v-slot:avatar>
              <q-icon name="mdi-information" style="color: #856404;" />
            </template>
            <div class="text-weight-bold q-mb-xs" style="color: #856404;">{{ $t('wavoip.tokensModal.importantInfo') }}</div>
            <!-- <div v-if="currentWavoipItem.type === 'baileys'" class="text-caption" style="color: #856404;">
              • {{ $t('wavoip.tokensModal.baileysInfo') }}
            </div> -->
            <div class="text-caption" style="color: #856404;">
              • {{ $t('wavoip.tokensModal.otherApiInfo', { type: currentWavoipItem.type }) }}:
              <ul class="q-mt-xs q-ml-md">
                <li>{{ $t('wavoip.tokensModal.systemQrCode') }}</li>
                <li>{{ $t('wavoip.tokensModal.wavoipQrCode') }}</li>
              </ul>
            </div>
            <div class="text-caption q-mt-xs" style="color: #856404;" v-html="$t('wavoip.tokensModal.note')"></div>
          </q-banner>
          <div v-if="currentWavoipItem">
            <div v-for="(token, index) in formatWavoipTokens(currentWavoipItem.wavoipToken)" :key="index" class="q-mb-md">
              <q-card flat bordered>
                <q-card-section>
                  <div class="row items-center q-mb-sm">
                    <div class="col">
                      <div class="text-weight-bold">{{ $t('wavoip.tokensModal.tokenLabel', { index: index + 1 }) }}</div>
                      <div class="text-caption text-grey-7">{{ token }}</div>
                    </div>
                    <div class="col-auto">
                      <q-spinner
                        v-if="loadingWavoipStatuses[token]"
                        size="1.5em"
                        style="color: #1976d2;"
                      />
                      <q-icon
                        v-else-if="wavoipTokenStatuses[token]"
                        :name="wavoipTokenStatuses[token] === 'open' ? 'mdi-check-circle' : 'mdi-alert-circle'"
                        :style="{ color: wavoipTokenStatuses[token] === 'open' ? '#4caf50' : '#f44336' }"
                        size="2em"
                      />
                    </div>
                  </div>
                  
                  <div v-if="wavoipTokenStatuses[token] && wavoipTokenStatuses[token] !== 'open'" class="q-mt-sm">
                    <q-banner style="background-color: #f44336; color: #ffffff;">
                      <template v-slot:avatar>
                        <q-icon name="mdi-alert" style="color: #ffffff;" />
                      </template>
                      <div class="text-weight-bold q-mb-xs" style="color: #ffffff;">{{ $t('wavoip.tokensModal.disconnected') }}</div>
                      <div class="text-caption" style="color: #ffffff;">
                        <span v-html="$t('wavoip.tokensModal.disconnectedMessage')"></span>
                        <span v-if="currentWavoipItem.type !== 'baileys'" class="q-mt-xs block">
                          <span v-html="$t('wavoip.tokensModal.rememberSystemQr')"></span>
                        </span>
                      </div>
                      <template v-slot:action>
                        <q-btn
                          flat
                          dense
                          style="color: #ffffff;"
                          icon="mdi-qrcode"
                          :label="$t('wavoip.tokensModal.openQrCodeButton')"
                          @click="abrirQrCodeWavoip(token)"
                        />
                      </template>
                    </q-banner>
                  </div>
                  
                  <div v-else-if="wavoipTokenStatuses[token] === 'open'" class="q-mt-sm">
                    <q-banner style="background-color: #4caf50; color: #ffffff;">
                      <template v-slot:avatar>
                        <q-icon name="mdi-check-circle" style="color: #ffffff;" />
                      </template>
                      <div class="text-weight-bold" style="color: #ffffff;">{{ $t('wavoip.tokensModal.connected') }}</div>
                      <div class="text-caption" style="color: #ffffff;">{{ $t('wavoip.tokensModal.connectedMessage') }}</div>
                    </q-banner>
                  </div>
                  
                  <div v-else class="q-mt-sm text-grey-6 text-caption">
                    {{ $t('wavoip.tokensModal.checkStatusMessage') }}
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            :label="$t('wavoip.tokensModal.updateStatus')"
            style="color: #1976d2;"
            icon="mdi-refresh"
            @click="buscarStatusWavoipTokens(currentWavoipItem)"
            :loading="Object.values(loadingWavoipStatuses).some(loading => loading)"
          />
          <q-btn
            flat
            :label="$t('wavoip.tokensModal.close')"
            style="color: #f44336;"
            v-close-popup
            @click="fecharModalWavoipTokens"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
    
    <q-inner-loading :showing="loading">
      <q-spinner-gears
        size="50px"
        color="primary"
      />
    </q-inner-loading>
  </div>
  <div v-else>
    <q-banner class="bg-red text-white" inline-actions>
      <q-icon name="warning" />
      <span>{{ $t('common.accessDenied') }}</span>
    </q-banner>
  </div>
</template>

<script>
import bus from 'src/utils/eventBus'
import { FecharTodosPendente, FecharTodosAbertos, DefinirPadrao, DeletarWhatsapp, DeleteWhatsappSession, StartWhatsappSession, ListarWhatsapps, RequestNewQrCode, UpdateWhatsapp } from 'src/service/sessoesWhatsapp.js'
import { SyncOldMessagesWbot, AtualizarMensagensSyncTime } from 'src/service/tickets.js'
import { format, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt-BR/index'
import ModalQrCode from './ModalQrCode.vue'
import { mapGetters } from 'vuex'
import ModalWhatsapp from './ModalWhatsapp.vue'
import ItemStatusChannel from './ItemStatusChannel.vue'
import VFacebookLogin from 'src/components/FacebookLogin.vue'
import { FetchFacebookPages, LogoutFacebookPages } from 'src/service/facebook.js'
import { ListarChatFlow } from 'src/service/chatFlow.js'
import { ListarUsuarios } from 'src/service/user.js'
import { ListarFilas } from 'src/service/filas.js'
import { MostrarCores } from 'src/service/empresas.js';
import { SetarWebhook } from 'src/service/hub.js'
import { QRCodeMeow, ValidarWebhookMeow } from 'src/service/meow.js'
import { QRCodeEvo, ValidarWebhook } from 'src/service/evo.js'
import { QRCodeZapi, ValidarWebhookZapi } from 'src/service/zapi.js'
import { QRCodeUazapi, ValidarWebhookUazapi } from 'src/service/uazapi.js'
import { OverrideCallbackUrl, OverrideCallbackCoexUrl } from 'src/service/waba.js'
import { OverrideCallbackUrlInstagram } from 'src/service/instagram.js'
import { OverrideCallbackUrlMessenger } from 'src/service/messenger.js'
import { ListarTenantPorId } from 'src/service/tenants.js'
const userLogado = JSON.parse(localStorage.getItem('usuario'))

export default {
  name: 'IndexSessoesWhatsapp',
  components: {
    ModalQrCode,
    ModalWhatsapp,
    ItemStatusChannel,
    VFacebookLogin
  },
  data () {
    return {
      pageAllowed: true,
      colors: {},
      userProfile: 'user',
      loading: false,
      userLogado,
      isAdmin: false,
      abrirModalQR: false,
      modalWhatsapp: false,
      whatsappSelecionado: {},
      listaChatFlow: [],
      listaFila: [],
      listaUsuario: [],
      whatsAppId: null,
      canais: [],
      objStatus: {
        qrcode: ''
      },
      savingItems: new Set(), // Set de IDs sendo salvos no momento
      pendingUpdates: new Map(), // Cache de atualizações pendentes
      wavoipTokenStatuses: {}, // Armazena o status de cada token wavoip
      loadingWavoipStatuses: {}, // Controla o loading de cada token
      modalWavoipTokens: false, // Controla a abertura do modal de tokens Wavoip
      currentWavoipItem: null, // Item atual sendo visualizado no modal
      columns: [
        {
          name: 'name',
          label: 'Nome',
          field: 'name',
          align: 'left'
        },
        {
          name: 'status',
          label: 'Status',
          field: 'status',
          align: 'center'
        },
        {
          name: 'session',
          label: 'Sessão',
          field: 'status',
          align: 'center'
        },
        {
          name: 'number',
          label: 'Número',
          field: 'number',
          align: 'center'
        },
        {
          name: 'updatedAt',
          label: 'Última Atualização',
          field: 'updatedAt',
          align: 'center',
          format: d => this.formatarData(d, 'dd/MM/yyyy HH:mm')
        },
        {
          name: 'isDefault',
          label: 'Padrão',
          field: 'isDefault',
          align: 'center'
        },
        {
          name: 'acoes',
          label: 'Ações',
          field: 'acoes',
          align: 'center'
        }
      ],
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
      isCompactView: true,
      // Sistema de gerenciamento de memória
      timers: [],
    }
  },
  watch: {
    whatsapps: {
      handler (newVal) {
        // Aplica atualizações pendentes antes de sincronizar
        const updatedCanais = JSON.parse(JSON.stringify(newVal))
        
        // Aplica atualizações pendentes que ainda não foram salvas
        this.pendingUpdates.forEach((update, id) => {
          // Só aplica se o item não estiver sendo salvo no momento
          if (!this.savingItems.has(id)) {
            const index = updatedCanais.findIndex(c => c.id === id)
            if (index !== -1) {
              Object.assign(updatedCanais[index], update)
            }
          }
        })
        
        this.canais = updatedCanais
        
        // Atualizar currentWavoipItem se o modal estiver aberto
        if (this.modalWavoipTokens && this.currentWavoipItem) {
          const updatedItem = updatedCanais.find(c => c.id === this.currentWavoipItem.id)
          if (updatedItem) {
            this.currentWavoipItem = updatedItem
          }
        }
      },
      deep: true
    }
  },
  computed: {
    ...mapGetters(['whatsapps']),
    cFbAppId () {
      return process.env.FACEBOOK_APP_ID
    },
    cDadosWhatsappSelecionado () {
      const { id } = this.whatsappSelecionado
      return this.whatsapps.find(w => w.id === id)
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
    formatWavoipTokens(wavoipToken) {
      if (!wavoipToken) return []
      // Se for string, pode ser separada por vírgula ou ser um único token
      if (typeof wavoipToken === 'string') {
        return wavoipToken.split(',').map(token => token.trim()).filter(token => token)
      }
      // Se for array, retornar diretamente
      if (Array.isArray(wavoipToken)) {
        return wavoipToken.filter(token => token)
      }
      return [String(wavoipToken)]
    },
    abrirModalWavoipTokens(item) {
      this.currentWavoipItem = item
      this.modalWavoipTokens = true
      // Buscar status automaticamente ao abrir o modal
      this.buscarStatusWavoipTokens(item)
    },
    fecharModalWavoipTokens() {
      this.modalWavoipTokens = false
      this.currentWavoipItem = null
    },
    abrirQrCodeWavoip(token) {
      const url = `https://devices.wavoip.com/${token}/whatsapp/qr-image`
      window.open(url, '_blank', 'width=600,height=700')
    },
    async buscarStatusWavoipTokens(item) {
      if (!item || !item.wavoipToken) return
      
      const tokens = this.formatWavoipTokens(item.wavoipToken)
      
      for (const token of tokens) {
        // Marcar como carregando
        this.loadingWavoipStatuses[token] = true
        
        try {
          const response = await fetch(`https://devices.wavoip.com/${token}/whatsapp/all_info`)
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          const data = await response.json()
          // Extrair o status (pode estar em diferentes propriedades dependendo da resposta)
          // Tentar diferentes caminhos comuns na resposta
          const status = data?.result?.status ||
                        data?.status || 
                        data?.state || 
                        data?.connection_status || 
                        data?.connectionState ||
                        data?.whatsapp?.status ||
                        data?.whatsapp?.state ||
                        (data?.whatsapp && typeof data.whatsapp === 'object' ? Object.values(data.whatsapp)[0]?.status : null) ||
                        'unknown'
          
          // Normalizar o status para comparação (lowercase)
          const normalizedStatus = String(status).toLowerCase().trim()
          
          // Armazenar o status
          this.wavoipTokenStatuses[token] = normalizedStatus
        } catch (error) {
          console.error(`Erro ao buscar status do token ${token}:`, error)
          this.wavoipTokenStatuses[token] = 'error'
        } finally {
          this.loadingWavoipStatuses[token] = false
        }
      }
    },
    async setWebhookAgain(data){
      try{
        await SetarWebhook(data)
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('sessao.processStarted'),
        });
        window.location.reload();
      } catch(e){
        this.$notificarErro(e)
      }
    },
    async setEvoWebhookAgain(data){
      try{
        await ValidarWebhook(data)
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('sessao.processStarted'),
        });
        window.location.reload();
      } catch(e){
        this.$notificarErro(e)
      }
    },
    async setZapiWebhookAgain(data){
      try{
        await ValidarWebhookZapi(data)
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('sessao.processStarted'),
        });
        window.location.reload();
      } catch(e){
        this.$notificarErro(e)
      }
    },
    async setUazapiWebhookAgain(data){
      try{
        await ValidarWebhookUazapi(data)
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('sessao.processStarted'),
        });
        window.location.reload();
      } catch(e){
        this.$notificarErro(e)
      }
    },
    async setMeowWebhookAgain(data){
      try{
        await ValidarWebhookMeow(data)
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('sessao.processStarted'),
        });
        window.location.reload();
      } catch(e){
        this.$notificarErro(e)
      }
    },
    async setWabaWebhookAgain(data){
      try{
        // Buscar o metaToken do tenant
        const { data: tenantData } = await ListarTenantPorId(this.userLogado.tenantId)
        const metaToken = tenantData[0]?.metaToken

        if (!metaToken) {
          this.$q.notify({
            type: 'negative',
            message: 'Meta Token não encontrado. Configure o token na seção de configurações.',
            timeout: 5000
          })
          return
        }

        // Montar a URL do webhook
        const baseUrl = `${process.env.URL_API}/metaWebhook`
        const callbackUrl = `${baseUrl}/${this.userLogado.tenantId}`

        // Preparar dados para o webhook
        const requestData = {
          wabaId: data.wabaId,
          wabaVersion: data.wabaVersion || 'v24.0',
          wabaToken: data.bmToken,
          overrideCallbackUri: callbackUrl,
          verifyToken: metaToken
        }

        await OverrideCallbackUrl(requestData)
        
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('sessao.processStarted') || 'Webhook revalidado com sucesso!',
        });
        window.location.reload();
      } catch(e){
        this.$notificarErro(e)
      }
    },
    async setWabaCoexWebhookAgain(data){
      try{
        // Buscar o metaToken do tenant
        const { data: tenantData } = await ListarTenantPorId(this.userLogado.tenantId)
        const metaToken = tenantData[0]?.metaToken

        if (!metaToken) {
          this.$q.notify({
            type: 'negative',
            message: this.$t('sessao.metaTokenNotFound') || 'Meta Token não encontrado. Configure o token na seção de configurações.',
            timeout: 5000
          })
          return
        }

        if (!data.tokenAPI) {
          this.$q.notify({
            type: 'negative',
            message: this.$t('sessao.phoneNumberIdNotFound') || 'ID do número de telefone não encontrado.',
            timeout: 5000
          })
          return
        }

        // Montar a URL do webhook
        const baseUrl = `${process.env.URL_API}/metaWebhook`
        const callbackUrl = `${baseUrl}/${this.userLogado.tenantId}`

        // Preparar dados para o webhook COEX
        const requestData = {
          businessPhoneNumberId: data.tokenAPI,
          wabaVersion: data.wabaVersion || 'v24.0',
          wabaToken: data.bmToken,
          overrideCallbackUri: callbackUrl,
          verifyToken: metaToken
        }

        await OverrideCallbackCoexUrl(requestData)
        
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('sessao.coexWebhookRevalidated') || 'Webhook COEX revalidado com sucesso!',
        });
        window.location.reload();
      } catch(e){
        this.$notificarErro(e)
      }
    },
    async setInstagramWebhookAgain(data){
      try{
        // Buscar o metaToken do tenant
        const { data: tenantData } = await ListarTenantPorId(this.userLogado.tenantId)
        const metaToken = tenantData[0]?.metaToken

        if (!metaToken) {
          this.$q.notify({
            type: 'negative',
            message: 'Meta Token não encontrado. Configure o token na seção de configurações.',
            timeout: 5000
          })
          return
        }

        // Montar a URL do webhook
        const baseUrl = `${process.env.URL_API}/instagramWebhook`
        const callbackUrl = `${baseUrl}/${this.userLogado.tenantId}`

        // Preparar dados para o webhook
        const requestData = {
          wabaId: data.wabaId,
          wabaVersion: data.wabaVersion || 'v24.0',
          wabaToken: data.bmToken,
          overrideCallbackUri: callbackUrl,
          verifyToken: metaToken
        }

        await OverrideCallbackUrlInstagram(requestData)
        
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('sessao.processStarted') || 'Webhook revalidado com sucesso!',
        });
        window.location.reload();
      } catch(e){
        this.$notificarErro(e)
      }
    },
    async setMessengerWebhookAgain(data){
      try{
        // Buscar o metaToken do tenant
        const { data: tenantData } = await ListarTenantPorId(this.userLogado.tenantId)
        const metaToken = tenantData[0]?.metaToken

        if (!metaToken) {
          this.$q.notify({
            type: 'negative',
            message: 'Meta Token não encontrado. Configure o token na seção de configurações.',
            timeout: 5000
          })
          return
        }

        // Montar a URL do webhook
        const baseUrl = `${process.env.URL_API}/messengerWebhook`
        const callbackUrl = `${baseUrl}/${this.userLogado.tenantId}`

        // Preparar dados para o webhook
        const requestData = {
          wabaId: data.fbPageId || data.wabaId,
          wabaVersion: data.wabaVersion || 'v24.0',
          wabaToken: data.bmToken,
          overrideCallbackUri: callbackUrl,
          verifyToken: metaToken
        }

        await OverrideCallbackUrlMessenger(requestData)
        
        this.$q.notify({
          color: 'positive',
          position: 'top',
          message: this.$t('sessao.processStarted') || 'Webhook revalidado com sucesso!',
        });
        window.location.reload();
      } catch(e){
        this.$notificarErro(e)
      }
    },
    async loadColors() {
      try {
        const response = await MostrarCores();
        if (response.status === 200) {
          const companyData = response.data[0];
          const colorsArray = companyData.systemColors;

          this.colors = (Array.isArray(colorsArray) ? colorsArray : []).reduce((acc, colorObj = {}) => {
            const rawLabel =
              (typeof colorObj.label === 'string' && colorObj.label) ||
              (typeof colorObj.name === 'string' && colorObj.name) ||
              (typeof colorObj.key === 'string' && colorObj.key) ||
              ''

            if (!rawLabel) return acc
            const key = rawLabel.toLowerCase().trim()
            const value =
              colorObj.value ??
              (rawLabel in colorObj ? colorObj[rawLabel] : undefined) ??
              colorObj.hex ??
              colorObj.color ??
              null

            if (typeof value === 'string' && value) {
              acc[key] = value
            }
            return acc
          }, {})

          

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
    formatarData (data, formato) {
      return format(parseISO(data), formato, { locale: pt })
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
    handleOpenQrModal (channel) {
      this.whatsappSelecionado = channel
      this.abrirModalQR = true
    },
    handleOpenModalWhatsapp (whatsapp) {
      this.whatsappSelecionado = whatsapp
      this.modalWhatsapp = true
    },
    async setDefault(whatsapp){
      const data = {
        isDefault: true
      }
      await DefinirPadrao(whatsapp.id, data)
      await this.listarWhatsapps()
    },
    async closeAllOpen(whatsapp){
      this.$q.dialog({
        title: this.$t('sessao.closeOpenTicketsPrompt'),
        message: this.$t('common.attention'),
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
          message: this.$t('sessao.processStarted'),
        });
        try{
          await FecharTodosAbertos(whatsapp.id)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: this.$t('sessao.closingOpenTickets'),
          });
          const timerId = setTimeout(() => {
            window.location.reload();
          }, 1500);
          this.addTimer(timerId);
        } catch(e){
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: `${this.$t('sessao.actionError')} ${e.data.error}`,
          });
        }        
      })
    },
    async atualizarMensagens(item) {
      console.log('item', item.tenantId)
      try {
        const response = await AtualizarMensagensSyncTime(item.tenantId);
        console.log('Mensagens atualizadas:', response.data);
      } catch (error) {
        console.error('Erro ao atualizar mensagens:', error);
      }
    },
    async closeAllPending(whatsapp){
      this.$q.dialog({
        title: this.$t('sessao.closePendingTicketsPrompt'),
        message: this.$t('common.attention'),
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
          message: this.$t('sessao.processStarted'),
        });
        try{
          await FecharTodosPendente(whatsapp.id)
          this.$q.notify({
            color: 'positive',
            position: 'top',
            message: this.$t('sessao.closingPendingTickets'),
          });
          const timerId = setTimeout(() => {
            window.location.reload();
          }, 1500);
          this.addTimer(timerId);
        } catch(e){
          this.$q.notify({
            color: 'negative',
            position: 'top',
            message: `${this.$t('sessao.actionError')} ${e.data.error}`,
          });
        }        
      })
    },
    async handleDisconectWhatsSession (whatsAppId) {
      this.$q.dialog({
        title: this.$t('sessao.disconnectPrompt'),
        // message: 'Mensagens antigas não serão apagadas no whatsapp.',
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
      }).onOk(() => {
        this.loading = true
        DeleteWhatsappSession(whatsAppId).then(() => {
          const whatsapp = this.whatsapps.find(w => w.id === whatsAppId)
          this.$store.commit('UPDATE_WHATSAPPS', {
            ...whatsapp,
            status: 'DISCONNECTED'
          })
        }).finally(f => {
          this.loading = false
        })
      })
    },
    async handleStartWhatsAppSession (whatsAppId) {
      try {
        await StartWhatsappSession(whatsAppId)
        const data = this.whatsapps.find(w => w.id === whatsAppId)
        if(data.type === 'waba' || data.type === 'telegram' || data.type === 'instagram' || data.type === 'messenger'){
          window.location.reload();
        }
      } catch (error) {
        console.error(error)
      }
    },
    async handleRequestNewQrCode (channel, origem) {
      if (channel.type === 'telegram' && !channel.tokenTelegram) {
        this.$notificarErro(this.$t('sessao.tokenRequiredTelegram'))
      }
      if (channel.type === 'meow') {
        await QRCodeMeow(channel)
        this.loading = false
        const timerId = setTimeout(() => {
          window.location.reload();
        }, 1000);
        this.addTimer(timerId);
        return
      }
      if (channel.type === 'evo') {
        await QRCodeEvo(channel)
        this.loading = false
        const timerId = setTimeout(() => {
          window.location.reload();
        }, 1000);
        this.addTimer(timerId);
        return
      }
      if (channel.type === 'zapi') {
        await QRCodeZapi(channel)
        this.loading = false
        const timerId = setTimeout(() => {
          window.location.reload();
        }, 1000);
        this.addTimer(timerId);
        return
      }
      if (channel.type === 'uazapi') {
        await QRCodeUazapi(channel)
        this.loading = false
        const timerId = setTimeout(() => {
          window.location.reload();
        }, 1000);
        this.addTimer(timerId);
        return
      }
      this.loading = true
      try {
        await RequestNewQrCode({ id: channel.id, isQrcode: true })
        const timerId = setTimeout(() => {
          this.handleOpenQrModal(channel)
        }, 2000)
        this.addTimer(timerId);
      } catch (error) {
        console.error(error)
      }
      this.loading = false
      const timerId = setTimeout(() => {
        window.location.reload();
      }, 1000);
      this.addTimer(timerId);
    },
    async listarWhatsapps () {
      const { data } = await ListarWhatsapps()
      this.$store.commit('LOAD_WHATSAPPS', data)
    },
    handleSetupWebhook(channel) {
      // Aguardar 300ms após a criação do canal antes de configurar o webhook
      const timerId = setTimeout(async () => {
        try {
          // Buscar o canal completo da lista atualizada para garantir que temos todos os dados
          await this.listarWhatsapps()
          const fullChannel = this.whatsapps.find(w => 
            w.id === channel.id || 
            (w.type === channel.type && w.tokenAPI === channel.tokenAPI && w.wabaId === channel.wabaId)
          )
          
          if (fullChannel) {
            if (channel.type === 'zapi') {
              this.setZapiWebhookAgain(fullChannel)
            } else if (channel.type === 'uazapi') {
              this.setUazapiWebhookAgain(fullChannel)
            }
          }
        } catch (error) {
          console.error('Erro ao configurar webhook automaticamente:', error)
        }
      }, 300)
      this.addTimer(timerId)
    },
    async deleteWhatsapp (whatsapp) {
      this.$q.dialog({
        title: this.$t('sessao.deleteChannelPrompt'),
        message: this.$t('sessao.deleteChannelMessage'),
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
      }).onOk(() => {
        this.loading = true
        DeletarWhatsapp(whatsapp.id).then(r => {
          this.$store.commit('DELETE_WHATSAPPS', whatsapp.id)
        }).finally(f => {
          this.loading = false
        })
      })
    },
    async syncOldMessagesWhatsapp (whatsappId) {
      let value = 1;
      this.$q.dialog({
        title: this.$t('sessao.syncPrompt'),
        message: this.$t('sessao.syncWarningPrompt'),
        prompt: {
          model: value,
          type: 'number',
          label: this.$t('sessao.syncMessagesPrompt'),
          hint: this.$t('sessao.syncMessagesHint'),
          inputProps: {
            min: 0,
            step: 1,
          },
        },
        ok: {
          label: this.$t('common.yes'),
          color: 'primary',
          push: true
        },
        cancel: {
          label: this.$t('common.no'),
          color: 'negative',
          push: true
        },
        persistent: true
      }).onOk((value) => {
        const data = {
          whatsappId: whatsappId.id,
          limit: value,
          tenantId: whatsappId.tenantId
        };
        if (value !== null && value > 0) {
          this.$q.notify({
            type: 'positive',
            progress: true,
            position: 'top',
            message: this.$t('sessao.syncingMessages', { limit: value }),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
          this.loading = true
          SyncOldMessagesWbot(data).then(r => {
            // this.$store.commit('SYNC_WHATSAPP', whatsappId)
          }).finally(f => {
            this.loading = false
          })
        } else {
          this.$q.notify({
            type: 'error',
            progress: true,
            position: 'top',
            message: this.$t('sessao.invalidValue'),
            actions: [{
              icon: 'close',
              round: true,
              color: 'white'
            }]
          })
        }
      })
    },
    async listarChatFlow () {
      const { data } = await ListarChatFlow()
      this.listaChatFlow = data.chatFlow
    },
    async listarFila () {
      const { data } = await ListarFilas()
      this.listaFila = data.filter(item => item.isActive)
    },
    async listarUsuario () {
      const { data } = await ListarUsuarios()
      this.listaUsuario = data.users.filter(user => user.profile !== 'superadmin')
    },
    async handleSaveWhatsApp (whatsapp) {
      const itemId = whatsapp.id
      
      // Evita múltiplas chamadas simultâneas para o mesmo item
      if (this.savingItems.has(itemId)) {
        return
      }
      
      this.savingItems.add(itemId)
      
      try {
        // Captura os valores atuais antes de qualquer sincronização
        const currentValues = {
          chatFlowId: whatsapp.chatFlowId ?? null,
          queueId: whatsapp.queueId ?? null,
          userId: whatsapp.userId ?? null
        }
        
        // Armazena a atualização pendente imediatamente
        this.pendingUpdates.set(itemId, currentValues)
        
        // Busca o objeto atual da store para garantir que temos os dados mais recentes
        const currentWhatsapp = this.whatsapps.find(w => w.id === itemId)
        
        // Cria payload apenas com campos necessários, mesclando dados atuais da store
        const whatsappToSave = currentWhatsapp 
          ? { ...currentWhatsapp, ...currentValues }
          : { id: itemId, ...currentValues }
        
        // Remove campos que não devem ser enviados ou são undefined
        Object.keys(whatsappToSave).forEach(key => {
          if (whatsappToSave[key] === undefined) {
            delete whatsappToSave[key]
          }
        })
        
        await UpdateWhatsapp(itemId, whatsappToSave)
        
        // Recarrega os dados para garantir sincronização
        await this.listarWhatsapps()
        
        // Remove da fila de atualizações pendentes após salvar com sucesso
        this.pendingUpdates.delete(itemId)
        
        this.$q.notify({
          type: 'positive',
          progress: true,
          position: 'top',
          message: this.$t('sessao.whatsappSaved', { action: whatsapp.id ? this.$t('common.edited') : this.$t('common.created') }),
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      } catch (error) {
        // Remove da fila em caso de erro
        this.pendingUpdates.delete(itemId)
        console.error('Erro ao salvar WhatsApp:', error)
        this.$q.notify({
          type: 'error',
          progress: true,
          position: 'top',
          message: this.$t('sessao.whatsappSaveError'),
          actions: [{
            icon: 'close',
            round: true,
            color: 'white'
          }]
        })
      } finally {
        // Aguarda um pequeno delay antes de permitir novo save do mesmo item
        setTimeout(() => {
          this.savingItems.delete(itemId)
        }, 500)
      }
    },
    handleUpdateSession(session) {
      // Atualiza apenas a sessão específica na store
      // O watcher de whatsapps já atualiza canais automaticamente
      this.$store.commit('UPDATE_SESSION', session);
      // Não precisa recarregar a página - a atualização é reativa
    },
    toggleView() {
      this.isCompactView = !this.isCompactView;
    }
  },
  beforeUnmount() {
    this._offUpdateSession && this._offUpdateSession()
    // Limpeza completa de memória
    this.cleanupMemory();
    // Limpa atualizações pendentes
    this.pendingUpdates.clear();
  },
  mounted () {
    this.isAdmin = localStorage.getItem('profile')
    const menuPermissions = JSON.parse(localStorage.getItem('menuPermissions'))
    this.pageAllowed = menuPermissions?.sessoes === true;
    this.listarWhatsapps()
    this.listarChatFlow()
    this.listarFila()
    this.listarUsuario()
    this.userProfile = localStorage.getItem('profile')
    this._offUpdateSession = bus.on('UPDATE_SESSION', this.handleUpdateSession)
    const storedColors = localStorage.getItem('storedColors');
    if (storedColors) {
      let list = []
      try {
        const parsed = JSON.parse(storedColors)
        list = Array.isArray(parsed) ? parsed : (Array.isArray(parsed?.colors) ? parsed.colors : [])
      } catch (_) { list = [] }

      const colors = list.reduce((acc, colorObj = {}) => {
        const rawLabel =
          (typeof colorObj.label === 'string' && colorObj.label) ||
          (typeof colorObj.name === 'string' && colorObj.name) ||
          (typeof colorObj.key === 'string' && colorObj.key) ||
          ''

        if (!rawLabel) return acc
        const key = rawLabel.toLowerCase().trim()
        const value =
          colorObj.value ??
          (rawLabel in colorObj ? colorObj[rawLabel] : undefined) ??
          colorObj.hex ??
          colorObj.color ??
          null

        if (typeof value === 'string' && value) acc[key] = value
        return acc
      }, {})

      const root = document.documentElement;
      Object.keys(colors).forEach(key => {
        root.style.setProperty(`--q-${key}`, colors[key]);
      });
    } else {
      console.warn('Nenhuma cor armazenada no localStorage');
    }
    const button = this.$el.querySelector('.btn-outline');
    if (button) {
      button.classList.add('attention');
      const timerId = setTimeout(() => {
        button.classList.remove('attention');
      }, 3000); // Remove a animação após 3 segundos
      this.addTimer(timerId);
    }
  }
}
</script>

<style scoped lang="scss">
.sessao-container {
  min-height: 100vh;
  padding: 2rem 1rem;
  background: linear-gradient(120deg, rgba(var(--q-primary-rgb),0.07) 0%, rgba(var(--q-secondary-rgb),0.07) 100%);
  animation: fadeIn 0.7s;
}

.q-card {
  border-radius: 18px;
  background: rgba(255,255,255,0.88);
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  backdrop-filter: blur(8px);
  transition: box-shadow 0.2s;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(0,0,0,0.04);
  &:hover {
    box-shadow: 0 8px 32px rgba(0,0,0,0.13);
  }

  &.compact-card {
    border-radius: 12px;
    margin-bottom: 0.5rem;
    
    .q-card-section {
      padding: 8px;
    }

    .q-item {
      min-height: 48px;
    }

    .q-btn {
      min-width: 28px;
      min-height: 28px;
    }

    .q-card-actions {
      padding: 4px;
    }
  }
}

.q-card-section {
  border-radius: 12px 12px 0 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--q-primary);
  background: transparent;
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

.q-select, .q-input {
  border-radius: 10px;
  background: rgba(255,255,255,0.7);
  transition: background 0.2s;
  margin-bottom: 0.7rem;
  &:hover {
    background: rgba(255,255,255,0.9);
  }
}

.q-separator {
  margin: 0.5rem 0;
}

body.body--dark {
  .q-card {
    background: rgba(30,30,30,0.96);
    box-shadow: 0 4px 24px rgba(0,0,0,0.18);
    border: 1px solid rgba(255,255,255,0.08);
  }
  .q-card-section {
    color: var(--q-primary);
  }
  .q-select, .q-input {
    background: rgba(255,255,255,0.08);
    &:hover {
      background: rgba(255,255,255,0.13);
    }
  }
}

@media (max-width: 900px) {
  .q-card {
    margin-bottom: 1rem;
  }
}

@media (max-width: 600px) {
  .sessao-container {
    padding: 0.5rem 0.2rem;
  }
  .q-card {
    border-radius: 12px;
    padding: 0.5rem;
  }
  .q-card-section {
    padding: 1rem !important;
    font-size: 1rem;
  }
  .q-btn {
    font-size: 0.85rem;
    padding: 0.15rem 0.5rem;
  }
  .absolute-top-right.q-pa-sm {
    position: static !important;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    margin-top: 8px;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.attention-button {
  animation: shrink 1s ease-in-out 2;
}

@keyframes shrink {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(1.1);
  }
}

.q-btn.attention {
  animation: none;
}
</style>
