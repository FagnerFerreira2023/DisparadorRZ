import { format, parseISO, parseJSON } from 'date-fns'
import pt from 'date-fns/locale/pt-BR'
import { mapGetters } from 'vuex'
import eventBus from 'src/utils/eventBus.js'

export default {
  computed: {
    ...mapGetters(['mensagensTicket', 'ticketFocado', 'hasMore'])
  },
  data () {
    return {
      loading: false,
      // Sistema de gerenciamento de memória
      timers: []
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
    scrollToBottom () {
      const timerId = setTimeout(() => {
        eventBus.emit('scrollToBottomMessageChat')
      }, 200)
      this.addTimer(timerId)
    },
    dataInWordsTimeStamp (date) {
      try {
        let dateObj = null;

        // Se for número ou string numérica
        if (typeof date === 'number' || (typeof date === 'string' && /^\d+$/.test(date))) {
          let num = Number(date);
          // Se for maior que 10 dígitos, já está em milissegundos
          if (num > 1e12) {
            dateObj = new Date(num);
          } else {
            dateObj = new Date(num * 1000);
          }
          if (!isNaN(dateObj.getTime())) {
            return format(dateObj, 'HH:mm', { locale: pt });
          }
        }

        // Se for uma string JSON
        if (typeof date === 'string') {
          const parsedDate = parseJSON(date);
          if (!isNaN(parsedDate.getTime())) {
            return format(parsedDate, 'HH:mm', { locale: pt });
          }
        }

        return '--:--';
      } catch (error) {
        console.error('Erro ao formatar data:', error);
        return '--:--';
      }
    },
    dataInWords (date) {
      try {
        if (!date) return '--:--'
        const parsedDate = parseJSON(date)
        if (!parsedDate || isNaN(parsedDate.getTime())) return '--:--'
        return format(parsedDate, 'HH:mm', { locale: pt })
      } catch (error) {
        console.error('Erro ao formatar data em dataInWords:', error, date)
        return '--:--'
      }
    },
    formatarMensagemWhatsapp (body) {
      if (!body) return
      if(body.includes('ctwa_ad')){
        return this.formatarMensagemAnuncioExterno(body)
      }
      let format = body
      // Escape HTML tags
      format = format.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      function is_aplhanumeric (c) {
        var x = c.charCodeAt()
        return !!(((x >= 65 && x <= 90) || (x >= 97 && x <= 122) || (x >= 48 && x <= 57)))
      }
      function whatsappStyles (format, wildcard, opTag, clTag) {
        var indices = []
        for (var i = 0; i < format.length; i++) {
          if (format[i] === wildcard) {
            // eslint-disable-next-line no-unused-expressions
            if (indices.length % 2) { (format[i - 1] == ' ') ? null : ((typeof (format[i + 1]) == 'undefined') ? indices.push(i) : (is_aplhanumeric(format[i + 1]) ? null : indices.push(i))) } else { (typeof (format[i + 1]) == 'undefined') ? null : ((format[i + 1] == ' ') ? null : (typeof (format[i - 1]) == 'undefined') ? indices.push(i) : ((is_aplhanumeric(format[i - 1])) ? null : indices.push(i))) }
          } else {
            // eslint-disable-next-line no-unused-expressions
            (format[i].charCodeAt() == 10 && indices.length % 2) ? indices.pop() : null
          }
        }
        // eslint-disable-next-line no-unused-expressions
        (indices.length % 2) ? indices.pop() : null
        var e = 0
        indices.forEach(function (v, i) {
          var t = (i % 2) ? clTag : opTag
          v += e
          format = format.substr(0, v) + t + format.substr(v + 1)
          e += (t.length - 1)
        })
        return format
      }
      format = format.replace(/```([\s\S]+?)```/g, '<pre>$1</pre>');
      format = format.replace(/`([^`\n]+?)`/g, '<code>$1</code>');
      format = format.replace(/\*_(.+?)_\*/g, '<b><i>$1</i></b>');
      format = format.replace(/_\*(.+?)\*_/g, '<i><b>$1</b></i>');
      format = whatsappStyles(format, '_', '<i>', '</i>')
      format = whatsappStyles(format, '*', '<b>', '</b>')
      format = whatsappStyles(format, '~', '<s>', '</s>')
      format = format.replace(/\n/gi, '<br>')
      
      // Aplicar formatação de links diretamente aqui para evitar conflitos com v-linkified
      const urlRegex = /(https?:\/\/[^\s]+)/g
      format = format.replace(urlRegex, (url) => `<a href="${url}" target="_blank" rel="noopener">${url}</a>`)
      
      return format
    },
    formatarMensagemRespostaBotaoWhatsapp(body) {
      if (!body) return
      let format = body
    
      function is_alphanumeric(c) {
        var x = c.charCodeAt()
        return !!(((x >= 65 && x <= 90) || (x >= 97 && x <= 122) || (x >= 48 && x <= 57)))
      }
    
      function whatsappStyles(format, wildcard, opTag, clTag) {
        var indices = []
        try {
          for (var i = 0; i < format.length; i++) {
            if (format[i] === wildcard) {
              if (indices.length % 2) {
                (format[i - 1] == ' ') ? null : ((typeof (format[i + 1]) == 'undefined') ? indices.push(i) : (is_alphanumeric(format[i + 1]) ? null : indices.push(i)))
              } else {
                (typeof (format[i + 1]) == 'undefined') ? null : ((format[i + 1] == ' ') ? null : (typeof (format[i - 1]) == 'undefined') ? indices.push(i) : ((is_alphanumeric(format[i - 1])) ? null : indices.push(i)))
              }
            } else {
              (format[i].charCodeAt() == 10 && indices.length % 2) ? indices.pop() : null
            }
          }
          (indices.length % 2) ? indices.pop() : null
          var e = 0
          indices.forEach(function (v, i) {
            var t = (i % 2) ? clTag : opTag
            v += e
            format = format.substr(0, v) + t + format.substr(v + 1)
            e += (t.length - 1)
          })
        } catch (error) {
          console.error('Erro ao aplicar estilos do WhatsApp:', error)
        }
        return format
      }
    
      try {
        format = whatsappStyles(format, '_', '<i>', '</i>')
        format = whatsappStyles(format, '*', '<b>', '</b>')
        format = whatsappStyles(format, '~', '<s>', '</s>')
        format = format.replace(/\n/gi, '<br>')
        return `➡️ ${format}`
      } catch (error) {
        console.error('Erro ao formatar mensagem:', error)
        return body
      }
    },
    formatarMensagemRespostaNfmWhatsapp(body) {
      if (!body) return '';

      try {
        // Corrigir caso venha como string serializada
        let jsonString = body;
        if (typeof jsonString === 'string' && jsonString.startsWith('"{')) {
          jsonString = jsonString.replace(/^"|"$/g, ''); // remove aspas do início/fim
          jsonString = jsonString.replace(/\\"/g, '"');  // remove escapes
        }

        const data = JSON.parse(jsonString);
        let formattedHtml = '<div class="nfm-response">';

        Object.entries(data).forEach(([key, value]) => {
          // Ignorar campos técnicos
          if ([
            'flow_token', 'body', 'name', 'response_json', 'Sent', 'sent', 'token', 'tokenApi', 'id', 'ticketId', 'messageId', 'whatsapp', 'from', 'to', 'timestamp', 'type', 'interactive', 'context', 'quotedMsg', 'quotedMsgId', 'quotedMsgBody', 'quotedMsgType', 'quotedMsgSender', 'quotedMsgTimestamp', 'quotedMsgFromMe', 'quotedMsgMediaType', 'quotedMsgMediaUrl', 'quotedMsgMediaName', 'quotedMsgMediaSize', 'quotedMsgMediaMimeType', 'quotedMsgMediaPageCount', 'quotedMsgMediaWidth', 'quotedMsgMediaHeight', 'quotedMsgMediaDuration', 'quotedMsgMediaCaption', 'quotedMsgMediaThumbnail', 'quotedMsgMediaSticker', 'quotedMsgMediaStickerType', 'quotedMsgMediaStickerAnimated', 'quotedMsgMediaStickerPack', 'quotedMsgMediaStickerAuthor', 'quotedMsgMediaStickerPublisher', 'quotedMsgMediaStickerEmojis', 'quotedMsgMediaStickerCategories', 'quotedMsgMediaStickerIsAvatar', 'quotedMsgMediaStickerIsAnimated', 'quotedMsgMediaStickerIsVideo', 'quotedMsgMediaStickerIsGif', 'quotedMsgMediaStickerIsWebp', 'quotedMsgMediaStickerIsPng', 'quotedMsgMediaStickerIsJpg', 'quotedMsgMediaStickerIsSvg', 'quotedMsgMediaStickerIsApng', 'quotedMsgMediaStickerIsHeic', 'quotedMsgMediaStickerIsHeif', 'quotedMsgMediaStickerIsAvif', 'quotedMsgMediaStickerIsTgs', 'quotedMsgMediaStickerIsWebm', 'quotedMsgMediaStickerIsMov', 'quotedMsgMediaStickerIsMkv', 'quotedMsgMediaStickerIsGifv', 'quotedMsgMediaStickerIsLottie', 'quotedMsgMediaStickerIsJson', 'quotedMsgMediaStickerIsZip', 'quotedMsgMediaStickerIsTar', 'quotedMsgMediaStickerIsRar', 'quotedMsgMediaStickerIs7z', 'quotedMsgMediaStickerIsGz', 'quotedMsgMediaStickerIsBz2', 'quotedMsgMediaStickerIsXz', 'quotedMsgMediaStickerIsZst', 'quotedMsgMediaStickerIsLz4', 'quotedMsgMediaStickerIsLzma', 'quotedMsgMediaStickerIsLzo', 'quotedMsgMediaStickerIsLzop', 'quotedMsgMediaStickerIsLzma2', 'quotedMsgMediaStickerIsLz', 'quotedMsgMediaStickerIsLzss', 'quotedMsgMediaStickerIsLzjb', 'quotedMsgMediaStickerIsLzrw', 'quotedMsgMediaStickerIsLzvn', 'quotedMsgMediaStickerIsLz4hc', 'quotedMsgMediaStickerIsLz4f', 'quotedMsgMediaStickerIsLz4s', 'quotedMsgMediaStickerIsLz4x', 'quotedMsgMediaStickerIsLz4z', 'quotedMsgMediaStickerIsLz4a', 'quotedMsgMediaStickerIsLz4b', 'quotedMsgMediaStickerIsLz4c', 'quotedMsgMediaStickerIsLz4d', 'quotedMsgMediaStickerIsLz4e', 'quotedMsgMediaStickerIsLz4g', 'quotedMsgMediaStickerIsLz4h', 'quotedMsgMediaStickerIsLz4i', 'quotedMsgMediaStickerIsLz4j', 'quotedMsgMediaStickerIsLz4k', 'quotedMsgMediaStickerIsLz4l', 'quotedMsgMediaStickerIsLz4m', 'quotedMsgMediaStickerIsLz4n', 'quotedMsgMediaStickerIsLz4o', 'quotedMsgMediaStickerIsLz4p', 'quotedMsgMediaStickerIsLz4q', 'quotedMsgMediaStickerIsLz4r', 'quotedMsgMediaStickerIsLz4s', 'quotedMsgMediaStickerIsLz4t', 'quotedMsgMediaStickerIsLz4u', 'quotedMsgMediaStickerIsLz4v', 'quotedMsgMediaStickerIsLz4w', 'quotedMsgMediaStickerIsLz4x', 'quotedMsgMediaStickerIsLz4y', 'quotedMsgMediaStickerIsLz4z'
          ].includes(key)) return;

          // Extrair texto da pergunta
          let question = key
            .replace(/^screen_\\d+_/, '') // remove prefixo screen
            .replace(/_\\d+$/, '')        // remove sufixo numérico
            .replace(/_/g, ' ')           // troca _ por espaço
            .replace(/\b\w/g, l => l.toUpperCase()); // capitaliza

          // Se a resposta for tipo "0_Excellent", pega só o texto depois do "_"
          let answer = value;
          if (typeof value === 'string' && value.includes('_')) {
            answer = value.split('_').slice(1).join(' ');
            answer = answer.charAt(0).toUpperCase() + answer.slice(1).toLowerCase();
          }

          formattedHtml += `
            <div class="nfm-response-item">
              <strong>${question}:</strong>
              <span>${answer}</span>
            </div>
          `;
        });

        formattedHtml += '</div>';
        return formattedHtml;
      } catch (error) {
        console.error('Erro ao formatar resposta NFM:', error);
        return `➡️ ${body}`;
      }
    },
    formatarNotas(body) {
      if (!body) return;
    
      // Detectar links e transformar em âncoras HTML
      const urlRegex = /((https?:\/\/[^\s]+))/g;
      const bodyComLink = body.replace(urlRegex, '<a href="$1" target="_blank">$1</a>');
    
      return `<b>${this.$t('atendimentomixinCommon.note')} ${bodyComLink}</b> `;
    },    
    formatarTransferencia(body){
      if (!body) return
      return `<b>${this.$t('atendimentomixinCommon.transfer')} ${body} </b>`;
    },
    formatarTranscricao(body){
      if (!body) return
      return `<b>${this.$t('atendimentomixinCommon.audio')} ${body} </b>`;
    }, 
    formatarTemplates(body) {
      if (!body) return '';
      const components = JSON.parse(body);
      let headerText = '', bodyText = '', footerText = '', buttonsHtml = '';
  
      components.forEach(component => {
          if (component.type === 'HEADER') {
              if (component.format === 'TEXT') {
                  headerText = `<h2 style="font-weight: bold;">${component.text}</h2>`;
              } else if (component.format === 'VIDEO' && component.example && component.example.header_handle) {
                  headerText = `<video controls width="250">
                                  <source src="${component.example.header_handle[0]}" type="video/mp4">
                                  Your browser does not support the video tag.
                                </video>`;
              } else if (component.format === 'DOCUMENT' && component.example && component.example.header_handle) {
                  headerText = `<p><a href="${component.example.header_handle[0]}" download>Download Document</a></p>`;
              }
          } else if (component.type === 'BODY') {
              // Tratando quebras de linha no texto do corpo
              const formattedText = component.text.replace(/\n/g, '<br>');
              bodyText = `<p>${formattedText}</p>`;
          } else if (component.type === 'FOOTER') {
              footerText = `<footer style="font-size: 0.75em; color: grey;">${component.text}</footer>`;
          } else if (component.type === 'BUTTONS') {
              component.buttons.forEach(button => {
                  let buttonText = button.text ? button.text.trim() : '';
                  if (!buttonText) return; // Se o texto do botão estiver vazio ou undefined, não renderiza
                  
                  if (button.type === 'URL') {
                      buttonsHtml += `<a href="${button.url || '#'}" style="display: inline-block; margin: 5px; padding: 10px; background-color: #0084ff; color: white; text-decoration: none; border-radius: 5px;">${buttonText}</a>`;
                  } else if (button.type === 'QUICK_REPLY') {
                      buttonsHtml += `<button style="display: inline-block; margin: 5px; padding: 10px; background-color: #0084ff; color: white; border: none; border-radius: 5px;">${buttonText}</button>`;
                  } else if (button.type === 'PHONE_NUMBER') {
                      buttonsHtml += `<a href="tel:${button.phone_number || '#'}" style="display: inline-block; margin: 5px; padding: 10px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">📞 ${buttonText}</a>`;
                  } else if (button.type.toUpperCase() === 'COPY_CODE') {
                      const codeText = button.example ? button.example[0] : ''; // Evita undefined
                      if (codeText) {
                          buttonsHtml += `<button onclick="navigator.clipboard.writeText('${codeText}')" style="display: inline-block; margin: 5px; padding: 10px; background-color: #0084ff; color: white; border: none; border-radius: 5px;">
                                          ${buttonText}
                                      </button>`;
                      }
                  } else if (button.type === 'CATALOG') {
                      buttonsHtml += `<button style="display: inline-block; margin: 5px; padding: 10px; background-color: #25d366; color: white; border: none; border-radius: 5px;" title="Catálogo do WhatsApp">📋 ${buttonText}</button>`;
                  } else if (button.type === 'button' && button.sub_type === 'catalog') {
                      buttonsHtml += `<button style="display: inline-block; margin: 5px; padding: 10px; background-color: #25d366; color: white; border: none; border-radius: 5px;" title="Catálogo do WhatsApp">📋 Ver Catálogo</button>`;
                  } else if (button.type === 'button' && button.sub_type === 'flow') {
                      buttonsHtml += `<button style="display: inline-block; margin: 5px; padding: 10px; background-color: #ff6b35; color: white; border: none; border-radius: 5px;" title="Fluxo Interativo">🔄 Iniciar Fluxo</button>`;
                  } else if (button.type === 'button' && button.sub_type === 'FLOW') {
                    buttonsHtml += `<button style="display: inline-block; margin: 5px; padding: 10px; background-color: #ff6b35; color: white; border: none; border-radius: 5px;" title="Fluxo Interativo">🔄 Iniciar Fluxo</button>`;
                }
              });
          }
      });
  
      return `${headerText}${bodyText}${footerText}${buttonsHtml}`;
    },
    formatarBotaoWhatsapp(body) {
      if (!body) return
      let format = body
    
      function is_alphanumeric(c) {
        var x = c.charCodeAt()
        return !!(((x >= 65 && x <= 90) || (x >= 97 && x <= 122) || (x >= 48 && x <= 57)))
      }
    
      function whatsappStyles(format, wildcard, opTag, clTag) {
        var indices = []
        try {
          for (var i = 0; i < format.length; i++) {
            if (format[i] === wildcard) {
              if (indices.length % 2) {
                (format[i - 1] == ' ') ? null : ((typeof (format[i + 1]) == 'undefined') ? indices.push(i) : (is_alphanumeric(format[i + 1]) ? null : indices.push(i)))
              } else {
                (typeof (format[i + 1]) == 'undefined') ? null : ((format[i + 1] == ' ') ? null : (typeof (format[i - 1]) == 'undefined') ? indices.push(i) : ((is_alphanumeric(format[i - 1])) ? null : indices.push(i)))
              }
            } else {
              (format[i].charCodeAt() == 10 && indices.length % 2) ? indices.pop() : null
            }
          }
          (indices.length % 2) ? indices.pop() : null
          var e = 0
          indices.forEach(function (v, i) {
            var t = (i % 2) ? clTag : opTag
            v += e
            format = format.substr(0, v) + t + format.substr(v + 1)
            e += (t.length - 1)
          })
        } catch (error) {
          console.error('Erro ao aplicar estilos do WhatsApp:', error)
        }
        return format
      }
    
      try {
        let [tituloDescricao, ...botoes] = body.split(', Btn');
        tituloDescricao = tituloDescricao.replace('Body: ', '').replace(':', ':\n') + '\n';
        botoes = botoes.map(btn => {
          const [numero, texto] = btn.split(':');
          return `<button button style="display: inline-block; margin: 5px; padding: 10px; background-color: #0084ff; color: white; border: none; border-radius: 5px;" title=${this.$t('atendimentomixinCommon.buttonNotAvailable')}>➡️ ${texto.trim()}</button>`;
        });
        let formatado = [tituloDescricao, ...botoes].join('\n');
        formatado = whatsappStyles(formatado, '_', '<i>', '</i>')
        formatado = whatsappStyles(formatado, '*', '<b>', '</b>')
        formatado = whatsappStyles(formatado, '~', '<s>', '</s>')
        formatado = formatado.replace(/\n/gi, '<br>')
        return formatado
      } catch (error) {
        console.error('Erro ao formatar botão do WhatsApp:', error)
        return body
      }
    },
    formatarBotao(body) {
      if (!body) return
    
      try {
        // Formatando a string recebida como um botão
        const formatado = `<button style="display: inline-block; margin: 5px; padding: 10px; background-color: #0084ff; color: white; border: none; border-radius: 5px;" title=${this.$t('atendimentomixinCommon.buttonNotAvailable')}>➡️ ${body.trim()}</button>`;
        return formatado;
      } catch (error) {
          console.error('Erro ao formatar botão do WhatsApp:', error);
          return body;
      }
    },
    formatarMensagemDeLista(body) {
      if (!body) return '';
      
      try {
        const data = JSON.parse(body);
    
        let format = body
    
        function is_alphanumeric(c) {
          var x = c.charCodeAt()
          return !!(((x >= 65 && x <= 90) || (x >= 97 && x <= 122) || (x >= 48 && x <= 57)))
        }
    
        function whatsappStyles(format, wildcard, opTag, clTag) {
          var indices = []
          try {
            for (var i = 0; i < format.length; i++) {
              if (format[i] === wildcard) {
                if (indices.length % 2) {
                  (format[i - 1] == ' ') ? null : ((typeof (format[i + 1]) == 'undefined') ? indices.push(i) : (is_alphanumeric(format[i + 1]) ? null : indices.push(i)))
                } else {
                  (typeof (format[i + 1]) == 'undefined') ? null : ((format[i + 1] == ' ') ? null : (typeof (format[i - 1]) == 'undefined') ? indices.push(i) : ((is_alphanumeric(format[i - 1])) ? null : indices.push(i)))
                }
              } else {
                (format[i].charCodeAt() == 10 && indices.length % 2) ? indices.pop() : null
              }
            }
            (indices.length % 2) ? indices.pop() : null
            var e = 0
            indices.forEach(function (v, i) {
              var t = (i % 2) ? clTag : opTag
              v += e
              format = format.substr(0, v) + t + format.substr(v + 1)
              e += (t.length - 1)
            })
          } catch (error) {
            console.error('Erro ao aplicar estilos do WhatsApp:', error)
          }
          return format
        }
    
        let header = data.header ? `<h3 style="font-weight: bold;">${data.header}</h3>` : '';
        let bodyText = data.body ? `<p>${data.body.replace(/\n/g, '<br>')}</p>` : '';
        let footer = data.footer ? `<footer style="font-size: 0.75em; color: grey;">${data.footer}</footer>` : '';
        let buttonText = data.button_text ? `<button button style="display: inline-block; margin: 5px; padding: 10px; background-color: #0084ff; color: white; border: none; border-radius: 5px;" title=${this.$t('atendimentomixinCommon.buttonNotAvailable')}>➡️ ${data.button_text}</button>` : '';
    
        header = whatsappStyles(header, '_', '<i>', '</i>');
        header = whatsappStyles(header, '*', '<b>', '</b>');
        header = whatsappStyles(header, '~', '<s>', '</s>');
    
        bodyText = whatsappStyles(bodyText, '_', '<i>', '</i>');
        bodyText = whatsappStyles(bodyText, '*', '<b>', '</b>');
        bodyText = whatsappStyles(bodyText, '~', '<s>', '</s>');
    
        footer = whatsappStyles(footer, '_', '<i>', '</i>');
        footer = whatsappStyles(footer, '*', '<b>', '</b>');
        footer = whatsappStyles(footer, '~', '<s>', '</s>');
    
        buttonText = whatsappStyles(buttonText, '_', '<i>', '</i>');
        buttonText = whatsappStyles(buttonText, '*', '<b>', '</b>');
        buttonText = whatsappStyles(buttonText, '~', '<s>', '</s>');
    
        let sectionsHtml = '';
        if (data.sections && data.sections.length > 0) {
          data.sections.forEach(section => {
            if (section.rows && section.rows.length > 0) {
              sectionsHtml += '<ul>';
              section.rows.forEach(row => {
                sectionsHtml += `<li><strong>${row.title}</strong>: ${row.description}</li>`;
              });
              sectionsHtml += '</ul>';
            }
          });
        }
    
        return `${header}${bodyText}${buttonText}${sectionsHtml}${footer}`;
      } catch (error) {
        console.error('Erro ao formatar mensagem de lista:', error)
        return body
      }
    }, 
    formatarTemplateBaileys(body) {
      if (!body) return '';
    
      let headerText = '', bodyText = '', footerText = '', buttonsHtml = '';
    
      const lines = body.split('\n');
    
      lines.forEach(line => {
        line = line.trim();
    
        // Título entre asteriscos
        if (line.startsWith('*') && line.endsWith('*') && line.length > 2) {
          headerText = `<h2 style="font-weight: bold;">${line.replace(/\*/g, '')}</h2>`;
          return;
        }
    
        // Rodapé entre underlines
        if (line.startsWith('_') && line.endsWith('_') && line.length > 2) {
          footerText = `<footer style="font-size: 0.75em; color: grey;">${line.replace(/_/g, '')}</footer>`;
          return;
        }
    
        // Botões rápidos
        if (line.includes('[QuickReply]')) {
          const match = line.match(/\[QuickReply\] (.+?) \(id: (.+?)\)/);
          if (match) {
            const label = match[1].trim();
            buttonsHtml += `<button style="display: inline-block; margin: 5px; padding: 10px; background-color: #0084ff; color: white; border: none; border-radius: 5px;">${label}</button>`;
          }
          return;
        }
    
        // Botões de link
        if (line.includes('[Link]')) {
          const match = line.match(/\[Link\] (.+?) -> (.+)/);
          if (match) {
            const text = match[1].trim();
            const url = match[2].trim();
            buttonsHtml += `<a href="${url}" target="_blank" style="display: inline-block; margin: 5px; padding: 10px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px;">${text}</a>`;
          }
          return;
        }
    
        // Botões de ligação
        if (line.includes('[Ligar]')) {
          const match = line.match(/\[Ligar\] (.+?) -> (.+)/);
          if (match) {
            const text = match[1].trim();
            const phone = match[2].trim();
            buttonsHtml += `<a href="tel:${phone}" style="display: inline-block; margin: 5px; padding: 10px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 5px;">📞 ${text}</a>`;
          }
          return;
        }
    
        // Ignorar linha [Botões] (apenas título visual)
        if (line.includes('[Botões]')) return;
    
        // Conteúdo comum
        if (line.trim() !== '') {
          bodyText += `<p>${line}</p>`;
        }
      });
    
      return `${headerText}${bodyText}${footerText}${buttonsHtml}`;
    },
    formatarMensagemAnuncioExterno(body) {
      if (!body) return '';
      
      try {
        // Verificar se é uma mensagem com anúncio externo (formato antigo)
        if (!body.includes('📱 Mídia:') && !body.includes('🔗 Link:') && !body.includes('📱 App:')) {
          // Verificar se é o novo formato de anúncio
          if (body.includes('[Mídia]') || body.includes('[Thumbnail]') || body.includes('[Conversão]') || body.includes('[Mensagem de Boas-vindas]')) {
            return this.formatarNovoAnuncioExterno(body);
          }
          return this.formatarMensagemWhatsapp(body);
        }
        
        // Separar a mensagem principal das informações de mídia
        const partes = body.split('\n\n');
        let mensagemPrincipal = '';
        let infoMidia = '';
        
        if (partes.length >= 2) {
          mensagemPrincipal = partes[0];
          infoMidia = partes.slice(1).join('\n\n');
        } else {
          // Se não conseguir separar, usar todo o conteúdo
          mensagemPrincipal = body;
        }
        
        // Formatar a mensagem principal
        let html = `<div class="mensagem-anuncio-externo">`;
        html += `<div class="mensagem-principal">${this.formatarMensagemWhatsapp(mensagemPrincipal)}</div>`;
        
        // Processar informações de mídia
        if (infoMidia) {
          html += `<div class="info-midia">`;
          
          const linhas = infoMidia.split('\n');
          linhas.forEach(linha => {
            linha = linha.trim();
            if (!linha) return;
            
            if (linha.startsWith('📱 Mídia:')) {
              const tipo = linha.replace('📱 Mídia:', '').trim();
              html += `<div class="midia-card">
                        <div class="midia-icon">📱</div>
                        <div class="midia-info">
                          <div class="midia-label">Tipo de Mídia</div>
                          <div class="midia-value">${tipo}</div>
                        </div>
                      </div>`;
            } else if (linha.startsWith('🔗 Link:')) {
              const url = linha.replace('🔗 Link:', '').trim();
              html += `<div class="midia-card">
                        <div class="midia-icon">🔗</div>
                        <div class="midia-info">
                          <div class="midia-label">Link da Mídia</div>
                          <div class="midia-value">
                            <a href="${url}" target="_blank" class="midia-link">${url}</a>
                          </div>
                        </div>
                      </div>`;
            } else if (linha.startsWith('📱 App:')) {
              const app = linha.replace('📱 App:', '').trim();
              html += `<div class="midia-card">
                        <div class="midia-icon">📱</div>
                        <div class="midia-info">
                          <div class="midia-label">App de Origem</div>
                          <div class="midia-value">${app}</div>
                        </div>
                      </div>`;
            } else if (linha.startsWith('🆔 ID:')) {
              const id = linha.replace('🆔 ID:', '').trim();
              html += `<div class="midia-card">
                        <div class="midia-icon">🆔</div>
                        <div class="midia-info">
                          <div class="midia-label">ID de Rastreamento</div>
                          <div class="midia-value">${id}</div>
                        </div>
                      </div>`;
            } else if (linha.startsWith('📋 Título:')) {
              const titulo = linha.replace('📋 Título:', '').trim();
              html += `<div class="midia-card">
                        <div class="midia-icon">📋</div>
                        <div class="midia-info">
                          <div class="midia-label">Título</div>
                          <div class="midia-value">${titulo}</div>
                        </div>
                      </div>`;
            } else if (linha.startsWith('📝 Descrição:')) {
              const descricao = linha.replace('📝 Descrição:', '').trim();
              html += `<div class="midia-card">
                        <div class="midia-icon">📝</div>
                        <div class="midia-info">
                          <div class="midia-label">Descrição</div>
                          <div class="midia-value">${descricao}</div>
                        </div>
                      </div>`;
            } else if (linha.startsWith('🏢 Empresa:')) {
              const empresa = linha.replace('🏢 Empresa:', '').trim();
              html += `<div class="midia-card">
                        <div class="midia-icon">🏢</div>
                        <div class="midia-info">
                          <div class="midia-label">Empresa</div>
                          <div class="midia-value">${empresa}</div>
                        </div>
                      </div>`;
            } else if (linha.startsWith('🖼️ Thumbnail:')) {
              const thumbnail = linha.replace('🖼️ Thumbnail:', '').trim();
              html += `<div class="midia-card">
                        <div class="midia-icon">🖼️</div>
                        <div class="midia-info">
                          <div class="midia-label">Thumbnail</div>
                          <div class="midia-value">
                            <a href="${thumbnail}" target="_blank" class="midia-link">Ver imagem</a>
                          </div>
                        </div>
                      </div>`;
            }
          });
          
          html += `</div>`;
        }
        
        html += `</div>`;
        
        // Banner "Enviada via anúncio"
        html += `<div class="banner-anuncio" style="background: #f0f0f0; border-radius: 8px; padding: 4px 12px; margin: 4px 0 8px 0; max-width: 85%; text-align: center;">
                  <span style="color: #666; font-size: 11px; font-weight: 500;">Enviada via anúncio</span>
                </div>`;
        
        return html;
        
      } catch (error) {
        console.error('Erro ao formatar mensagem de anúncio externo:', error);
        return this.formatarMensagemWhatsapp(body);
      }
    },
    formatarNovoAnuncioExterno(body) {
      try {
        // Separar a mensagem principal das informações do anúncio
        const partes = body.split('\n\n');
        let mensagemPrincipal = '';
        let infoAnuncio = '';
        
        // Encontrar onde começa o anúncio (primeira linha que começa com *)
        let indiceAnuncio = -1;
        for (let i = 0; i < partes.length; i++) {
          if (partes[i].startsWith('*') && partes[i].endsWith('*')) {
            indiceAnuncio = i;
            break;
          }
        }
        
        if (indiceAnuncio >= 0) {
          mensagemPrincipal = partes.slice(0, indiceAnuncio).join('\n\n');
          infoAnuncio = partes.slice(indiceAnuncio).join('\n\n');
        } else {
          // Se não encontrar o título do anúncio, usar a primeira parte como mensagem principal
          mensagemPrincipal = partes[0];
          infoAnuncio = partes.slice(1).join('\n\n');
        }
        
        // Formatar a mensagem principal
        let html = `<div class="mensagem-anuncio-externo" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 16px; margin: 8px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">`;
        html += `<div class="mensagem-principal" style="color: white; margin-bottom: 12px; font-weight: 500;">${this.formatarMensagemWhatsapp(mensagemPrincipal)}</div>`;
        
        // Processar informações do anúncio
        if (infoAnuncio) {
          html += `<div class="info-midia" style="background: white; border-radius: 8px; padding: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">`;
          
          const linhas = infoAnuncio.split('\n');
          let tituloAnuncio = '';
          let descricaoAnuncio = '';
          let linkFonte = '';
          let linkMidia = '';
          let linkThumbnail = '';
          let infoConversao = '';
          let mensagemBoasVindas = '';
          
          linhas.forEach(linha => {
            linha = linha.trim();
            if (!linha) return;
            
            // Título do anúncio (entre asteriscos)
            if (linha.startsWith('*') && linha.endsWith('*')) {
              tituloAnuncio = linha.replace(/\*/g, '');
            }
            // Descrição do anúncio (linha após o título, sem formatação)
            else if (tituloAnuncio && !linha.startsWith('http') && !linha.startsWith('[') && !descricaoAnuncio) {
              descricaoAnuncio = linha;
            }
            // Link da fonte (URL do Instagram/Facebook)
            else if (linha.startsWith('http') && (linha.includes('instagram.com') || linha.includes('facebook.com')) && !linkFonte) {
              linkFonte = linha;
            }
            // Link da mídia
            else if (linha.startsWith('[Mídia]')) {
              linkMidia = linha.replace('[Mídia]', '').trim();
            }
            // Link do thumbnail
            else if (linha.startsWith('[Thumbnail]')) {
              linkThumbnail = linha.replace('[Thumbnail]', '').trim();
            }
            // Informações de conversão
            else if (linha.startsWith('[Conversão]')) {
              infoConversao = linha.replace('[Conversão]', '').trim();
            }
            // Mensagem de boas-vindas
            else if (linha.startsWith('[Mensagem de Boas-vindas]')) {
              mensagemBoasVindas = linha.replace('[Mensagem de Boas-vindas]', '').trim();
            }
          });
          
          // Adicionar título do anúncio
          if (tituloAnuncio) {
            html += `<div class="midia-card" style="display: flex; align-items: center; padding: 10px; margin: 8px 0; background: linear-gradient(135deg, #ff6b6b, #ee5a24); border-radius: 8px; color: white;">
                      <div class="midia-icon" style="width: 32px; height: 32px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-weight: bold; font-size: 14px;">📋</div>
                      <div class="midia-info" style="flex: 1;">
                        <div class="midia-label" style="font-size: 11px; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.5px;">Título do Anúncio</div>
                        <div class="midia-value" style="font-weight: 600; font-size: 14px;">${tituloAnuncio}</div>
                      </div>
                    </div>`;
          }
          
          // Adicionar descrição do anúncio
          if (descricaoAnuncio) {
            html += `<div class="midia-card" style="display: flex; align-items: center; padding: 10px; margin: 8px 0; background: linear-gradient(135deg, #4ecdc4, #44a08d); border-radius: 8px; color: white;">
                      <div class="midia-icon" style="width: 32px; height: 32px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-weight: bold; font-size: 14px;">📝</div>
                      <div class="midia-info" style="flex: 1;">
                        <div class="midia-label" style="font-size: 11px; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.5px;">Descrição</div>
                        <div class="midia-value" style="font-weight: 500; font-size: 13px; line-height: 1.4;">${descricaoAnuncio}</div>
                      </div>
                    </div>`;
          }
          
          // Adicionar link da fonte
          if (linkFonte) {
            html += `<div class="midia-card" style="display: flex; align-items: center; padding: 10px; margin: 8px 0; background: linear-gradient(135deg, #a8edea, #fed6e3); border-radius: 8px;">
                      <div class="midia-icon" style="width: 32px; height: 32px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; color: white; font-weight: bold; font-size: 14px;">🔗</div>
                      <div class="midia-info" style="flex: 1;">
                        <div class="midia-label" style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">Link da Fonte</div>
                        <div class="midia-value">
                          <a href="${linkFonte}" target="_blank" class="midia-link" style="color: #667eea; text-decoration: none; font-weight: 500; font-size: 12px; word-break: break-all;">${linkFonte}</a>
                        </div>
                      </div>
                    </div>`;
          }
          
          // Adicionar link da mídia
          if (linkMidia) {
            html += `<div class="midia-card" style="display: flex; align-items: center; padding: 10px; margin: 8px 0; background: linear-gradient(135deg, #ffecd2, #fcb69f); border-radius: 8px;">
                      <div class="midia-icon" style="width: 32px; height: 32px; background: linear-gradient(135deg, #ff6b6b, #ee5a24); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; color: white; font-weight: bold; font-size: 14px;">📱</div>
                      <div class="midia-info" style="flex: 1;">
                        <div class="midia-label" style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">Link da Mídia</div>
                        <div class="midia-value">
                          <a href="${linkMidia}" target="_blank" class="midia-link" style="color: #ff6b6b; text-decoration: none; font-weight: 500; font-size: 12px; word-break: break-all;">${linkMidia}</a>
                        </div>
                      </div>
                    </div>`;
          }
          
          // Adicionar link do thumbnail
          if (linkThumbnail) {
            html += `<div class="midia-card" style="display: flex; align-items: center; padding: 10px; margin: 8px 0; background: linear-gradient(135deg, #d299c2, #fef9d7); border-radius: 8px;">
                      <div class="midia-icon" style="width: 32px; height: 32px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; color: white; font-weight: bold; font-size: 14px;">🖼️</div>
                      <div class="midia-info" style="flex: 1;">
                        <div class="midia-label" style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">Thumbnail</div>
                        <div class="midia-value">
                          <a href="${linkThumbnail}" target="_blank" class="midia-link" style="color: #667eea; text-decoration: none; font-weight: 500; font-size: 12px; background: rgba(102, 126, 234, 0.1); padding: 4px 8px; border-radius: 4px;">Ver imagem</a>
                        </div>
                      </div>
                    </div>`;
          }
          
          // Adicionar informações de conversão
          if (infoConversao) {
            html += `<div class="midia-card" style="display: flex; align-items: center; padding: 10px; margin: 8px 0; background: linear-gradient(135deg, #84fab0, #8fd3f4); border-radius: 8px;">
                      <div class="midia-icon" style="width: 32px; height: 32px; background: linear-gradient(135deg, #4ecdc4, #44a08d); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; color: white; font-weight: bold; font-size: 14px;">📊</div>
                      <div class="midia-info" style="flex: 1;">
                        <div class="midia-label" style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">Informações de Conversão</div>
                        <div class="midia-value" style="font-weight: 500; font-size: 12px; color: #333;">${infoConversao}</div>
                      </div>
                    </div>`;
          }
          
          // Adicionar mensagem de boas-vindas
          if (mensagemBoasVindas) {
            html += `<div class="midia-card" style="display: flex; align-items: center; padding: 10px; margin: 8px 0; background: linear-gradient(135deg, #ff9a9e, #fecfef); border-radius: 8px;">
                      <div class="midia-icon" style="width: 32px; height: 32px; background: linear-gradient(135deg, #ff6b6b, #ee5a24); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; color: white; font-weight: bold; font-size: 14px;">👋</div>
                      <div class="midia-info" style="flex: 1;">
                        <div class="midia-label" style="font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">Mensagem de Boas-vindas</div>
                        <div class="midia-value" style="font-weight: 500; font-size: 12px; color: #333; font-style: italic;">${mensagemBoasVindas}</div>
                      </div>
                    </div>`;
          }
          
          html += `</div>`;
        }
        
        html += `</div>`;
        
        // Banner "Enviada via anúncio"
        html += `<div class="banner-anuncio" style="background: #f0f0f0; border-radius: 8px; padding: 4px 12px; margin: 4px 0 8px 0; max-width: 85%; text-align: center;">
                  <span style="color: #666; font-size: 11px; font-weight: 500;">Enviada via anúncio</span>
                </div>`;
        
        return html;
        
      } catch (error) {
        console.error('Erro ao formatar novo anúncio externo:', error);
        return this.formatarMensagemWhatsapp(body);
      }
    },
    formatarAdsMessage(body) {
      if (!body) return '';
      
      try {
        // Normalizar quebras de linha
        body = body.replace(/\\n/g, '\n');
        
        // Extrair informações antes de processar o texto
        let thumbnailUrl = null;
        let midiaUrl = null;
        let conversaoTexto = null;
        let boasVindasTexto = null;
        
        // Extrair [Thumbnail]
        const thumbnailMatch = body.match(/\[Thumbnail\]\s*(https?:\/\/[^\n]+)/i);
        if (thumbnailMatch) {
          thumbnailUrl = thumbnailMatch[1].trim();
          body = body.replace(/\[Thumbnail\]\s*https?:\/\/[^\n]+/i, '');
        }
        
        // Extrair [Mídia]
        const midiaMatch = body.match(/\[Mídia\]\s*(https?:\/\/[^\n]+)/i);
        if (midiaMatch) {
          midiaUrl = midiaMatch[1].trim();
          body = body.replace(/\[Mídia\]\s*https?:\/\/[^\n]+/i, '');
        }
        
        // Extrair [Conversão]
        const conversaoMatch = body.match(/\[Conversão\][^\n]*/i);
        if (conversaoMatch) {
          conversaoTexto = conversaoMatch[0].trim();
          body = body.replace(/\[Conversão\][^\n]*/i, '');
        }
        
        // Extrair [Mensagem de Boas-vindas]
        const boasVindasMatch = body.match(/\[Mensagem de Boas-vindas\][^\n]*/i);
        if (boasVindasMatch) {
          boasVindasTexto = boasVindasMatch[0].trim();
          body = body.replace(/\[Mensagem de Boas-vindas\][^\n]*/i, '');
        }
        
        // Limpar quebras de linha extras e normalizar
        body = body.replace(/\n\s*\n/g, '\n').trim();
        
        // Converter quebras de linha para <br>
        body = body.replace(/\n/g, '<br>');
        
        // Transformar URLs em links clicáveis
        const formatarTextoComLinks = (texto) => {
          const urlRegex = /https?:\/\/[^\s<]+/g;
          return texto.replace(urlRegex, (url) => {
            return `<a href="${url}" target="_blank" style="color: #056162; text-decoration: underline;">${url}</a>`;
          });
        };
        
        let html = `<div style="color: #000; font-size: 14px; line-height: 1.5;">${formatarTextoComLinks(body)}</div>`;
        
        // Adicionar link do vídeo
        if (midiaUrl) {
          html += `<div style="margin-top: 8px;">
                    <a href="${midiaUrl}" target="_blank" style="color: #056162; text-decoration: underline;">Assista ao vídeo</a>
                  </div>`;
        }
        
        // Adicionar thumbnail
        if (thumbnailUrl) {
          html += `<div style="margin-top: 8px;">
                     <img src="${thumbnailUrl}" alt="thumbnail" style="max-width: 100%; border-radius: 8px;">
                   </div>`;
        }
        
        // Adicionar conversão
        if (conversaoTexto) {
          html += `<div style="margin-top: 8px; color: #888; font-size: 12px;">${conversaoTexto}</div>`;
        }
        
        // Adicionar mensagem de boas-vindas
        if (boasVindasTexto) {
          html += `<div style="margin-top: 8px; color: #444; font-size: 13px;">${boasVindasTexto}</div>`;
        }
        
        // Banner "Enviada via anúncio"
        html += `<div style="background: #f0f0f0; border-radius: 8px; padding: 4px 12px; margin: 12px 0 8px 0; max-width: 85%; text-align: center;">
                  <span style="color: #666; font-size: 11px; font-weight: 500;">Enviada via anúncio</span>
                </div>`;
        
        return html;
      } catch (error) {
        console.error('Erro ao formatar mensagem de anúncio:', error);
        return this.formatarMensagemWhatsapp(body);
      }
    },
    formatarOrder(body) {
      try {
        // Processar a string formatada em vez de JSON
        let html = '<div class="order-message" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border: 2px solid #28a745; border-radius: 16px; padding: 20px; margin: 8px 0; box-shadow: 0 4px 15px rgba(0,0,0,0.1); position: relative; overflow: hidden;">';
        
        // Adicionar um pequeno indicador visual no topo
        html += '<div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #28a745, #20c997);"></div>';
        
        // Cabeçalho do pedido
        html += '<div style="display: flex; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #dee2e6;">';
        html += '<div style="background: linear-gradient(135deg, #28a745, #20c997); border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; margin-right: 15px; box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);">';
        html += '<span style="font-size: 24px; color: white;">🛒</span>';
        html += '</div>';
        html += '<div>';
        html += '<div style="font-weight: bold; font-size: 18px; color: #495057; margin-bottom: 4px; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">Pedido Recebido</div>';
        html += '<div style="font-size: 13px; color: #6c757d; font-weight: 500;">Detalhes do pedido</div>';
        html += '</div>';
        html += '</div>';

        // Converter a string formatada para HTML
        let formattedBody = body
          .replace(/\\n/g, '\n') // Primeiro converter \n literais para quebras reais
          .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #28a745; font-weight: 700;">$1</strong>') // Negrito verde
          .replace(/\*(.*?)\*/g, '<strong style="color: #495057; font-weight: 600;">$1</strong>') // Negrito normal
          .replace(/\n\n/g, '</div><div style="margin-top: 15px;">') // Quebras duplas
          .replace(/\n/g, '<br>') // Quebras simples
          .replace(/•/g, '<span style="color: #28a745; margin-right: 8px;">•</span>') // Bullets verdes
          .replace(/(💰.*?Total: )(\d+\.\d{2})( BRL)/g, '<div style="background: linear-gradient(135deg, #28a745, #20c997); color: white; border-radius: 12px; padding: 15px; text-align: center; font-weight: bold; font-size: 18px; margin-top: 15px; box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);">$1<span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 8px; margin: 0 4px;">$2</span>$3</div>'); // Total destacado com preço em destaque

        // Adicionar estilos específicos para seções
        formattedBody = formattedBody
          .replace(/(📋.*?Detalhes do Pedido:)/g, '<div style="background: rgba(40, 167, 69, 0.1); border-left: 4px solid #28a745; padding: 12px; border-radius: 0 8px 8px 0; margin: 15px 0;"><strong style="color: #28a745;">$1</strong>')
          .replace(/(📦.*?Produtos:)/g, '<div style="background: rgba(40, 167, 69, 0.1); border-left: 4px solid #28a745; padding: 12px; border-radius: 0 8px 8px 0; margin: 15px 0;"><strong style="color: #28a745;">$1</strong>');

        // Adicionar o conteúdo formatado
        html += `<div style="color: #495057; font-size: 14px; line-height: 1.6;">${formattedBody}</div>`;

        // Adicionar um footer sutil
        html += '<div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #dee2e6; text-align: center;">';
        html += '<span style="color: #6c757d; font-size: 11px; font-weight: 500;">Pedido processado automaticamente</span>';
        html += '</div>';

        html += '</div>';
        
        return html;
      } catch (error) {
        console.error('Erro ao formatar order message:', error);
        // Fallback para formatação simples
        return `<div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 12px; margin: 8px 0;">
                  <div style="font-weight: bold; color: #495057; margin-bottom: 8px;">🛒 Pedido Recebido</div>
                  <div style="color: #666; font-size: 14px; white-space: pre-line;">${body}</div>
                </div>`;
      }
    },
    formatarOrderMessage(body) {
      try {
        // Função específica para orderMessage do WhatsApp
        let html = '<div class="order-message-whatsapp" style="background: linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%); border: 2px solid #007bff; border-radius: 16px; padding: 20px; margin: 8px 0; box-shadow: 0 4px 15px rgba(0,123,255,0.1); position: relative; overflow: hidden;">';
        
        // Indicador visual no topo
        html += '<div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #007bff, #0056b3);"></div>';
        
        // Cabeçalho do pedido WhatsApp
        html += '<div style="display: flex; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #dee2e6;">';
        html += '<div style="background: linear-gradient(135deg, #007bff, #0056b3); border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; margin-right: 15px; box-shadow: 0 4px 8px rgba(0,123,255,0.3);">';
        html += '<span style="font-size: 24px; color: white;">📱</span>';
        html += '</div>';
        html += '<div>';
        html += '<div style="font-weight: bold; font-size: 18px; color: #495057; margin-bottom: 4px; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">Pedido WhatsApp</div>';
        html += '<div style="font-size: 13px; color: #6c757d; font-weight: 500;">Detalhes do pedido</div>';
        html += '</div>';
        html += '</div>';

        // Converter a string formatada para HTML
        let formattedBody = body
          .replace(/\\n/g, '\n')
          .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #007bff; font-weight: 700;">$1</strong>')
          .replace(/\*(.*?)\*/g, '<strong style="color: #495057; font-weight: 600;">$1</strong>')
          .replace(/\n\n/g, '</div><div style="margin-top: 15px;">')
          .replace(/\n/g, '<br>')
          .replace(/•/g, '<span style="color: #007bff; margin-right: 8px;">•</span>');

        // Adicionar o conteúdo formatado
        html += `<div style="color: #495057; font-size: 14px; line-height: 1.6;">${formattedBody}</div>`;

        // Footer específico para WhatsApp
        html += '<div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #dee2e6; text-align: center;">';
        html += '<span style="color: #6c757d; font-size: 11px; font-weight: 500;">Pedido recebido via WhatsApp</span>';
        html += '</div>';

        html += '</div>';
        
        return html;
      } catch (error) {
        console.error('Erro ao formatar orderMessage:', error);
        // Fallback para formatação simples
        return `<div style="background: #f0f8ff; border: 1px solid #007bff; border-radius: 8px; padding: 12px; margin: 8px 0;">
                  <div style="font-weight: bold; color: #495057; margin-bottom: 8px;">📱 Pedido WhatsApp</div>
                  <div style="color: #666; font-size: 14px; white-space: pre-line;">${body}</div>
                </div>`;
      }
    },
    formatarProductMessage(body) {
      try {
        if (!body) return '';
        
        // Separar os dados do produto (formato: data:image/png;base64, IMAGEM | TÍTULO | PREÇO | DESCRIÇÃO | URL)
        const partes = body.split(' | ');
        
        if (partes.length < 5) {
          return `<div style="background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 12px; margin: 8px 0;">
                    <div style="font-weight: bold; color: #495057; margin-bottom: 8px;">🛍️ Produto</div>
                    <div style="color: #666; font-size: 14px;">${body}</div>
                  </div>`;
        }
        
        const [imagemBase64, titulo, preco, descricao, url] = partes;
        
        // Converter preço de centavos para reais
        const precoEmReais = (parseInt(preco) / 1000).toFixed(2);
        
        // Verificar se tem imagem
        const temImagem = imagemBase64 && imagemBase64.startsWith('data:image');
        
        let html = '<div class="product-message" style="background: linear-gradient(135deg, #fff5f5 0%, #fed7d7 100%); border: 2px solid #e53e3e; border-radius: 16px; padding: 20px; margin: 8px 0; box-shadow: 0 4px 15px rgba(229,62,62,0.1); position: relative; overflow: hidden;">';
        
        // Indicador visual no topo
        html += '<div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #e53e3e, #c53030);"></div>';
        
        // Cabeçalho do produto
        html += '<div style="display: flex; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #fed7d7;">';
        html += '<div style="background: linear-gradient(135deg, #e53e3e, #c53030); border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; margin-right: 15px; box-shadow: 0 4px 8px rgba(229,62,62,0.3);">';
        html += '<span style="font-size: 24px; color: white;">🛍️</span>';
        html += '</div>';
        html += '<div>';
        html += '<div style="font-weight: bold; font-size: 18px; color: #495057; margin-bottom: 4px; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">Produto</div>';
        html += '<div style="font-size: 13px; color: #6c757d; font-weight: 500;">Detalhes do produto</div>';
        html += '</div>';
        html += '</div>';
        
        // Imagem do produto (se disponível)
        if (temImagem) {
          html += `<div style="text-align: center; margin: 20px 0;">
                    <img src="${imagemBase64}" alt="Produto" style="max-width: 200px; max-height: 150px; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); object-fit: cover;">
                  </div>`;
        }
        
        // Título do produto
        if (titulo) {
          html += `<div style="margin-bottom: 15px;">
                    <h3 style="font-weight: bold; color: #2d3748; font-size: 16px; margin: 0; text-align: center; background: linear-gradient(135deg, #e53e3e, #c53030); color: white; padding: 10px; border-radius: 8px;">
                      ${titulo}
                    </h3>
                  </div>`;
        }
        
        // Descrição do produto
        if (descricao) {
          html += `<div style="margin-bottom: 15px; padding: 15px; background: rgba(255,255,255,0.7); border-radius: 8px; border-left: 4px solid #e53e3e;">
                    <div style="font-weight: 500; color: #4a5568; font-size: 14px; line-height: 1.5;">
                      ${descricao}
                    </div>
                  </div>`;
        }
        
        // Preço do produto
        if (preco) {
          html += `<div style="text-align: center; margin: 20px 0;">
                    <div style="background: linear-gradient(135deg, #e53e3e, #c53030); color: white; border-radius: 12px; padding: 15px; display: inline-block; box-shadow: 0 4px 8px rgba(229,62,62,0.3);">
                      <div style="font-size: 12px; opacity: 0.8; margin-bottom: 5px;">Preço</div>
                      <div style="font-weight: bold; font-size: 24px;">R$ ${precoEmReais}</div>
                    </div>
                  </div>`;
        }
        
        // Botão para ver produto
        if (url) {
          html += `<div style="text-align: center; margin-top: 20px;">
                    <a href="${url}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #38a169, #2f855a); color: white; text-decoration: none; padding: 12px 24px; border-radius: 25px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 8px rgba(56,161,105,0.3); transition: all 0.3s ease;">
                      🛒 Ver Produto
                    </a>
                  </div>`;
        }
        
        // Footer
        html += '<div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #fed7d7; text-align: center;">';
        html += '<span style="color: #6c757d; font-size: 11px; font-weight: 500;">Produto do catálogo</span>';
        html += '</div>';
        
        html += '</div>';
        
        return html;
        
      } catch (error) {
        console.error('Erro ao formatar mensagem de produto:', error);
        // Fallback para formatação simples
        return `<div style="background: #fff5f5; border: 1px solid #e53e3e; border-radius: 8px; padding: 12px; margin: 8px 0;">
                  <div style="font-weight: bold; color: #495057; margin-bottom: 8px;">🛍️ Produto</div>
                  <div style="color: #666; font-size: 14px; white-space: pre-line;">${body}</div>
                </div>`;
      }
    },
    
    formatarLocationRequest(body) {
      try {
        if (!body) return '';
        
        // Formatar o texto da solicitação de localização
        let formattedBody = body
          .replace(/\\n/g, '\n')
          .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #007bff; font-weight: 700;">$1</strong>')
          .replace(/\*(.*?)\*/g, '<strong style="color: #495057; font-weight: 600;">$1</strong>')
          .replace(/\n/g, '<br>');
        
        let html = '<div class="location-request-message" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border: 2px solid #007bff; border-radius: 16px; padding: 20px; margin: 8px 0; box-shadow: 0 4px 15px rgba(0,123,255,0.1); position: relative; overflow: hidden;">';
        
        // Indicador visual no topo
        html += '<div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #007bff, #0056b3);"></div>';
        
        // Cabeçalho da solicitação
        html += '<div style="display: flex; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #dee2e6;">';
        html += '<div style="background: linear-gradient(135deg, #007bff, #0056b3); border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; margin-right: 15px; box-shadow: 0 4px 8px rgba(0,123,255,0.3);">';
        html += '<span style="font-size: 24px; color: white;">📍</span>';
        html += '</div>';
        html += '<div>';
        html += '<div style="font-weight: bold; font-size: 18px; color: #495057; margin-bottom: 4px; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">Solicitação de Localização</div>';
        html += '<div style="font-size: 13px; color: #6c757d; font-weight: 500;">Clique no botão para compartilhar</div>';
        html += '</div>';
        html += '</div>';
        
        // Conteúdo da mensagem
        html += `<div style="color: #495057; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">${formattedBody}</div>`;
        
        // Botão de envio de localização
        html += '<div style="text-align: center;">';
        html += '<button class="location-share-btn" style="display: inline-block; background: linear-gradient(135deg, #007bff, #0056b3); color: white; text-decoration: none; padding: 12px 24px; border-radius: 25px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 8px rgba(0,123,255,0.3); transition: all 0.3s ease; border: none; cursor: pointer;">';
        html += '📍 Enviar Localização';
        html += '</button>';
        html += '</div>';
        
        // Footer
        html += '<div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #dee2e6; text-align: center;">';
        html += '<span style="color: #6c757d; font-size: 11px; font-weight: 500;">Solicitação de localização</span>';
        html += '</div>';
        
        html += '</div>';
        
        return html;
        
      } catch (error) {
        console.error('Erro ao formatar solicitação de localização:', error);
        // Fallback para formatação simples
        return `<div style="background: #f8f9fa; border: 1px solid #007bff; border-radius: 8px; padding: 12px; margin: 8px 0;">
                  <div style="font-weight: bold; color: #495057; margin-bottom: 8px;">📍 Solicitação de Localização</div>
                  <div style="color: #666; font-size: 14px; white-space: pre-line;">${body}</div>
                </div>`;
      }
    },
    
    formatarCTAURL(body) {
      try {
        if (!body) return '';
        
        // Formatar o texto da mensagem CTA URL
        let formattedBody = body
          .replace(/\\n/g, '\n')
          .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #6f42c1; font-weight: 700;">$1</strong>')
          .replace(/\*(.*?)\*/g, '<strong style="color: #495057; font-weight: 600;">$1</strong>')
          .replace(/\n/g, '<br>');
        
        let html = '<div class="cta-url-message" style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border: 2px solid #6f42c1; border-radius: 16px; padding: 20px; margin: 8px 0; box-shadow: 0 4px 15px rgba(111,66,193,0.1); position: relative; overflow: hidden;">';
        
        // Indicador visual no topo
        html += '<div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #6f42c1, #5a32a3);"></div>';
        
        // Cabeçalho da mensagem CTA URL
        html += '<div style="display: flex; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #dee2e6;">';
        html += '<div style="background: linear-gradient(135deg, #6f42c1, #5a32a3); border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; margin-right: 15px; box-shadow: 0 4px 8px rgba(111,66,193,0.3);">';
        html += '<span style="font-size: 24px; color: white;">🔗</span>';
        html += '</div>';
        html += '<div>';
        html += '<div style="font-weight: bold; font-size: 18px; color: #495057; margin-bottom: 4px; text-shadow: 0 1px 2px rgba(0,0,0,0.1);">Call to Action URL</div>';
        html += '<div style="font-size: 13px; color: #6c757d; font-weight: 500;">Clique no botão para acessar o link</div>';
        html += '</div>';
        html += '</div>';
        
        // Conteúdo da mensagem
        html += `<div style="color: #495057; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">${formattedBody}</div>`;
        
        // Botão para acessar o link
        html += '<div style="text-align: center;">';
        html += '<button class="cta-url-btn" style="display: inline-block; background: linear-gradient(135deg, #6f42c1, #5a32a3); color: white; text-decoration: none; padding: 12px 24px; border-radius: 25px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 8px rgba(111,66,193,0.3); transition: all 0.3s ease; border: none; cursor: pointer;">';
        html += '🔗 Acessar Link';
        html += '</button>';
        html += '</div>';
        
        // Footer
        html += '<div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #dee2e6; text-align: center;">';
        html += '<span style="color: #6c757d; font-size: 11px; font-weight: 500;">Call to Action URL</span>';
        html += '</div>';
        
        html += '</div>';
        
        return html;
        
      } catch (error) {
        console.error('Erro ao formatar CTA URL:', error);
        // Fallback para formatação simples
        return `<div style="background: #f8f9fa; border: 1px solid #6f42c1; border-radius: 8px; padding: 12px; margin: 8px 0;">
                  <div style="font-weight: bold; color: #495057; margin-bottom: 8px;">🔗 Call to Action URL</div>
                  <div style="color: #666; font-size: 14px; white-space: pre-line;">${body}</div>
                </div>`;
      }
    },
    formatarData (data, formato = 'dd/MM/yyyy') {
      try {
        if (!data) return '--/--/----'
        const parsedDate = parseISO(data)
        if (!parsedDate || isNaN(parsedDate.getTime())) return '--/--/----'
        return format(parsedDate, formato, { locale: pt })
      } catch (error) {
        console.error('Erro ao formatar data em formatarData:', error, data)
        return '--/--/----'
      }
    }
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
