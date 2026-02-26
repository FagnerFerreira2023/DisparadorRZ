<template>
  <div>
    <q-dialog :model-value="show" @update:model-value="onDialogUpdate" persistent>
      <q-card>
        <q-card-section>
          <div class="text-h6">Termos e Condições de Uso | Política de Privacidade</div>
        </q-card-section>
        
        <q-tabs v-model="activeTab" class="text-teal" align="left" narrow-indicator>
          <q-tab name="termos" label="Termos de Uso" :class="{ 'active-tab': activeTab === 'termos', 'inactive-tab': activeTab !== 'termos' }"/>
          <q-tab name="privacidade" label="Política de Privacidade" :class="{ 'active-tab': activeTab === 'privacidade', 'inactive-tab': activeTab !== 'privacidade' }"/>
        </q-tabs>

        <q-separator />

        <q-tab-panels v-model="activeTab" animated>
          <q-tab-panel name="termos">
            <div class="contract-content">
              <h2>Termos e Condições de Uso de Licenciamento</h2>
              <p><a target="_blank"href="https://zpro.passaportezdg.com.br/termos-e-condicoes-de-uso">Download aqui</a></p>
              <p><strong>Módulo Z-PRO</strong></p>
              <p><strong>Data de disponibilização: 22/05/2024</strong></p>
              <p><strong>Última atualização: 14/01/2026</strong></p>
              <p><strong>Versão: 3.1.x.x</strong></p>
              <p>Estes Termos e Condições de Uso (“Termos”) regulam a relação comercial e o licenciamento de uso entre a empresa BIANCA SANT ANA PEREIRA &amp; CIA LTDA, pessoa jurídica de direito privado, inscrita no CNPJ sob o nº 35.617.749/0001-67, doravante denominada “ZPRO” ou “LICENCIANTE”, e a pessoa física ou jurídica que adquire a licença, doravante denominada “CLIENTE” ou “LICENCIADO”.</p>
              <p>O objeto deste instrumento é o regramento da utilização do software de gestão e automação de atendimentos denominado “SISTEMA ZPRO”, fornecido na modalidade auto-hospedada (self-hosted).</p>
              <p>AO CONTRATAR E UTILIZAR O SISTEMA ZPRO, O CLIENTE DECLARA TER LIDO, COMPREENDIDO E ACEITO INTEGRALMENTE ESTES TERMOS.</p>
              <h2>1. CONCEITOS IMPORTANTES</h2>
              <p>Para facilitar a leitura e interpretação deste documento, adotamos as seguintes definições:</p>
              <p>Cliente (ou Licenciado): Pessoa física ou jurídica que adquire a Licença de Uso do Software ZPRO, responsável pelo pagamento, pela contratação da infraestrutura (VPS) e pela gestão dos Usuários e Clientes Finais (Tenants).</p>
              <p>Sistema ZPRO: Software desenvolvido e de propriedade exclusiva da ZPRO, fornecido sob regime de licenciamento self-hosted. Trata-se de uma solução tecnológica para centralização e gestão de multicanais de atendimento e automação.</p>
              <p>Licença de Uso Anual: Modalidade de contratação que concede ao Cliente o direito de uso do Sistema ZPRO pelo período de 12 (doze) meses, instalada na infraestrutura providenciada pelo Cliente.</p>
              <p>Modelo White-Label: Característica do Sistema ZPRO que permite ao Cliente personalizar a identidade visual e revender o acesso ao software para terceiros sob sua própria marca.</p>
              <p>Infraestrutura (VPS): Servidor Virtual Privado (Virtual Private Server) contratado e custeado diretamente pelo Cliente junto a terceiros, onde o Sistema ZPRO será instalado.</p>
              <p>Usuário: Pessoa autorizada pelo Cliente a acessar o painel do sistema (Super Admin, Admin, supervisores ou atendentes).</p>
              <p>Tenant (Cliente Final): Conta ou instância criada pelo Cliente dentro do Sistema ZPRO para revender serviços a terceiros.</p>
              <h2>2. NATUREZA E EFICÁCIA DOS TERMOS</h2>
              <p><strong>2.1.</strong> Ao adquirir a Licença de Uso, o Cliente concorda integralmente com estes Termos. A aceitação destas regras é condição indispensável para a liberação do acesso, instalação e utilização do Sistema ZPRO.</p>
              <p><strong>2.2.</strong> A realização do pagamento ou o simples início da utilização do Sistema ZPRO implica, para todos os fins de direito, na aceitação plena, inequívoca e irrevogável de todas as condições estabelecidas nestes Termos e suas futuras atualizações.</p>
              <p><strong>2.3.</strong> O Cliente reconhece que estes Termos possuem força de contrato vinculante, substituindo quaisquer acordos verbais ou trocas de mensagens anteriores.</p>
              <p><strong>2.4.</strong> Pela teoria da aparência, a ZPRO considerará válida a contratação realizada mediante o fornecimento de dados cadastrais e pagamento, declarando o Cliente que a pessoa responsável pela compra possui plenos poderes para representá-lo.</p>
              <p><strong>2.5.</strong> A ZPRO poderá alterar estes Termos a qualquer momento. O uso continuado do sistema após a publicação das alterações confirma a aceitação dos novos Termos.</p>
              <h2>3. REQUISITOS TÉCNICOS E CONDIÇÕES DE OPERAÇÃO</h2>
              <p>Para garantir a performance, segurança e estabilidade do Sistema ZPRO, o Cliente deve observar rigorosamente os seguintes requisitos técnicos.</p>
              <p>3.1. Requisitos da Estação de Trabalho (Usuário):<br/>Recomendamos que o sistema operacional e o navegador do Usuário estejam atualizados. As máquinas utilizadas para acessar o painel devem satisfazer, no mínimo:</p>
              <p>Memória (RAM): 8GB ou mais.</p>
              <p>Processador: Intel i5 ou superior (ou equivalente).</p>
              <p>Conexão: Internet rápida e estável.</p>
              <p>3.2. Requisitos do Servidor (Infraestrutura VPS):<br/>A VPS onde o sistema será instalado deverá satisfazer os seguintes requisitos mínimos obrigatórios:</p>
              <p>Memória (RAM): 16GB ou mais.</p>
              <p>Processamento: 4 vCPUs ou mais.</p>
              <p>Latência: 50ms ou menos (recomendado servidor no Brasil ou próximo).</p>
              <p>Sistema Operacional: Ubuntu 20.04 ou 22.04 LTS (limpo, sem painel).</p>
              <p>Armazenamento: SSD ou NVMe a partir de 200GB.</p>
              <p>3.3. Documentação Técnica:<br/>Os requisitos detalhados e atualizados constam no link oficial: <a href="https://zpro.passaportezdg.com.br/requisitos-de-uso." target="_blank" rel="noopener noreferrer">https://zpro.passaportezdg.com.br/requisitos-de-uso.</a></p>
              <p>3.4. Versões Suportadas:<br/>É crucial manter o sistema operacional e navegadores atualizados. As versões suportadas para conexão com a Plataforma WhatsApp são:</p>
              <p>API WhatsApp Business Account v19.0 (ou superior).</p>
              <p>WhatsApp Web v2.24xx.x (ou superior).</p>
              <p>3.5. Veracidade das Informações:<br/>O Usuário deve fornecer informações verdadeiras, exatas e atuais. A ZPRO reserva o direito de recusar o cadastro ou cancelar contas cujos Usuários adotem condutas contrárias a estes Termos ou aos valores da empresa, sem necessidade de notificação prévia ou indenização.</p>
              <p><strong>3.6.</strong> Protocolos de Conexão (API Oficial vs. Não Oficial):</p>
              <p><strong>3.6.1.</strong> Padrão Recomendado: A ZPRO foi desenvolvida para utilizar a API Oficial do WhatsApp (WABA) como padrão. A API Oficial garante maior estabilidade, segurança e suporte direto da Meta, sendo a única opção para a qual oferecemos garantia plena de funcionalidade.</p>
              <p><strong>3.6.2.</strong> APIs Não Oficiais (Riscos): Para maior flexibilidade, o sistema permite integração com APIs Não Oficiais (WWebJS, Baileys, Meow, Evolution, Uazapi, Z-API, etc). O uso dessas APIs é de total responsabilidade do Cliente, que deve estar ciente dos riscos, incluindo:</p>
              <p>Desconexões frequentes;</p>
              <p>Perda de mensagens enviadas ou recebidas;</p>
              <p>Instabilidade no funcionamento após atualizações do app WhatsApp;</p>
              <p>Possíveis bloqueios ou banimentos de contas pela Meta.</p>
              <p><strong>3.6.3.</strong> Isenção de Garantia: A ZPRO não garante a estabilidade, o desempenho ou o suporte técnico para problemas decorrentes exclusivamente do uso de APIs Não Oficiais. Ao habilitar essa conexão, o Cliente assume integralmente os riscos e isenta a ZPRO de responsabilidade por perdas ou danos.</p>
              <h2>4. DELIMITAÇÃO DE RESPONSABILIDADES E RELAÇÃO COM TERCEIROS</h2>
              <p><strong>4.1.</strong> Estes Termos disciplinam exclusivamente a relação comercial entre a ZPRO e o Cliente (Licenciado).</p>
              <p><strong>4.2.</strong> Responsabilidade sobre Equipe: O Cliente é o único responsável pela seleção, contratação, remuneração e gestão de seus funcionários (Usuários/Atendentes) que utilizam a plataforma, isentando a ZPRO de qualquer vínculo trabalhista ou solidariedade.</p>
              <p>4.3. Responsabilidade sobre o Modelo White-Label (Tenants):<br/>Considerando que o Cliente pode revender o uso do sistema (SaaS) sob marca própria:</p>
              <p><strong>4.3.1.</strong> A ZPRO atua como fornecedora de tecnologia e não possui relação com os clientes finais (Tenants) do Cliente.</p>
              <p><strong>4.3.2.</strong> O Cliente é o único responsável pelo suporte, cobrança e cumprimento legal perante seus próprios clientes. Qualquer disputa judicial iniciada por um Tenant deverá ser assumida integralmente pelo Cliente.</p>
              <h2>5. OBJETO E LICENÇA DE USO</h2>
              <p><strong>5.1.</strong> Objeto: O contrato concede ao Cliente uma Licença de Uso de Software (Direito de Uso), não exclusiva, intransferível e temporária, do Sistema ZPRO, para instalação em servidor (VPS) do Cliente.</p>
              <p><strong>5.2.</strong> Escopo: A licença permite instalar o software, configurar o White-Label, criar usuários ilimitados (conforme capacidade do servidor) e receber atualizações durante a vigência contratual.</p>
              <p>5.3. Restrições:<br/>Sob pena de cancelamento imediato e medidas judiciais, é vedado:</p>
              <ol type="a">
              <li>Copiar, vender ou distribuir o código-fonte ou o instalador do sistema.</li>
              <li>Realizar engenharia reversa ou descompilação do código fonte.</li>
              <li>Sublicenciamento e Distribuição: Vender, alugar, doar ou transferir os arquivos de instalação, o código-fonte ou a chave de licença para que terceiros realizem a instalação em infraestrutura própria (pirataria).</li>
              </ol>
              <p>Única Modalidade Permitida (SaaS): A comercialização autorizada restringe-se exclusivamente à venda do acesso ao sistema (login/senha), com o software rodando obrigatoriamente em infraestrutura gerida pelo Cliente Licenciado.</p>
              <p><strong>5.4.</strong> Natureza Self-Hosted: O Cliente declara-se ciente de que a ZPRO fornece o software, não a infraestrutura. A gestão do servidor (VPS) é de responsabilidade do Cliente.</p>
              <p>5.5. Serviço de Setup de Instalação:<br/>Além de disponibilizar o instalador automatizado e tutoriais na área de membros, caso o Cliente opte pela instalação agendada, a ZPRO realizará, uma única vez, a instalação técnica remota do software no servidor indicado pelo Cliente. A execução deste serviço está condicionada, obrigatoriamente, à entrega do ambiente nas seguintes condições:</p>
              <p><strong>5.5.1.</strong> Estado do Servidor: A VPS deve ser entregue formatada (instalação limpa), contendo apenas o Sistema Operacional instalado, sem painéis de gestão (como cPanel, Plesk, CyberPanel) e sem outros serviços rodando (Apache, Nginx ou bancos de dados pré-instalados), para evitar conflitos de porta.</p>
              <p><strong>5.5.2.</strong> Especificações Obrigatórias:</p>
              <p>Sistema Operacional: Ubuntu Server nas versões 20.04, 22.04 ou 24.04 LTS.</p>
              <p>Hardware: Mínimo de 16GB de memória RAM.</p>
              <p><strong>5.5.3.</strong> Dados para Execução: O Cliente deverá fornecer previamente à equipe técnica:</p>
              <ol type="I">
              <li>IP da VPS e senha de acesso SSH (usuário ROOT).</li>
              <li>Definição dos 02 (dois) subdomínios para a aplicação (Ex: app.dominio.com para frontend e api.dominio.com para backend), já com os apontamentos DNS (Tipo A) direcionados para o IP da VPS.</li>
              <li>E-mail de cadastro na ZPRO e número de WhatsApp para validação.</li>
              </ol>
              <p><strong>5.5.4.</strong> Método de Acesso: A instalação é realizada exclusivamente via protocolos de terminal (SSH). Não realizamos instalações via acesso remoto visual ou compartilhamento de tela (ex: AnyDesk, TeamViewer, Zoom), nem instalações em computadores locais (PC/Notebook).</p>
              <p><strong>5.5.5.</strong> Serviços Extra-Contratuais: Reinstalações, execução remota de atualizações, formatações, alterações de servidor ou migração de bancos de dados não estão cobertas pela licença. A ZPRO não se obriga a realizar estes procedimentos, sendo a sua eventual execução mera liberalidade, sujeita à disponibilidade de agenda técnica e aprovação de orçamento extra.</p>
              <p><strong>5.5.6.</strong> Prazo de Execução: O prazo para realização da instalação pela equipe técnica é de até 03 (três) dias úteis. A contagem deste prazo inicia-se exclusivamente após o envio completo e a validação bem-sucedida de todas as credenciais e requisitos técnicos necessários. Caso os dados fornecidos estejam incorretos ou o servidor apresente falhas de conexão, a solicitação entrará em pendência e o prazo será reiniciado a partir da regularização pelo Cliente.</p>
              <h2>6. PLANOS, PREÇO, PAGAMENTO E RENOVAÇÃO</h2>
              <p>6.1. Natureza da Contratação e Licença Anual:<br/>A aquisição do Sistema ZPRO é realizada através da compra de uma Licença de Uso Anual.</p>
              <p><strong>6.1.1.</strong> O valor da licença corresponde a um pagamento único referente ao ciclo de 12 (doze) meses.</p>
              <p><strong>6.1.2.</strong> Caso o Cliente opte pelo pagamento parcelado via cartão de crédito (ex: em 12 vezes), ele declara estar ciente de que não se trata de uma assinatura mensal cancelável, mas sim de uma única compra parcelada, assumindo o compromisso de quitar a integralidade das parcelas perante a operadora do cartão, independentemente da utilização efetiva do sistema durante todo o período.</p>
              <p><strong>6.2.</strong> Escopo de Uso, Domínios e Auditoria:</p>
              <p><strong>6.2.1.</strong> A licença de uso padrão do ZPRO concede o direito de instalação de múltiplas instâncias (Tenants) em subdomínios ilimitados (ex: app1.cliente.com, app2.cliente.com), desde que todos os subdomínios estejam vinculados a um mesmo domínio raiz, de titularidade do Cliente, o qual será validado pela chave de licença no momento da ativação.</p>
              <p><strong>6.2.2.</strong> Intransferibilidade: A licença é pessoal, intransferível e vinculada ao CPF/CNPJ do Cliente adquirente. É vedado o compartilhamento da chave de licença para ativação em domínios de terceiros.</p>
              <p><strong>6.2.3.</strong> Auditoria e Penalidade: A ZPRO reserva-se o direito de verificar o cumprimento destas limitações a qualquer momento (via telemetria ou auditoria). A constatação de uso indevido (instalação em domínios não autorizados ou divergentes do licenciado) acarretará a suspensão da licença e a cobrança adicional proporcional às licenças extras utilizadas irregularmente.</p>
              <p><strong>6.2.4.</strong> Condições Especiais (Multi-domínio): A critério exclusivo da ZPRO, poderão ser comercializadas licenças especiais ou oferecidos bônus promocionais que permitam a ativação em múltiplos domínios dentro de uma mesma chave. Tais condições serão válidas apenas se expressamente descritas na oferta ou fatura correspondente.</p>
              <p>6.3. Renovação da Licença:<br/>A licença possui validade de 1 ano a contar da data da compra. Para garantir a continuidade do uso, o Cliente deverá renovar a licença ao final do ciclo.</p>
              <p><strong>6.3.1.</strong> Renovação Automática (Assinatura): O Cliente poderá optar, no momento da compra ou através do painel de controle, pela ativação da Renovação Automática. Neste modelo, a cobrança da nova anuidade será realizada automaticamente no método de pagamento cadastrado, garantindo a continuidade do serviço sem interrupções.</p>
              <ol type="I">
              <li>O Cliente pode desativar a renovação automática a qualquer momento antes da data de cobrança, sem penalidades, retornando ao modelo de renovação manual.</li>
              </ol>
              <p><strong>6.3.2.</strong> Antecipação de Renovação: O Cliente poderá, a seu critério, antecipar a renovação da licença antes do vencimento. Neste caso, o novo período de 12 meses será acrescido à data final da licença vigente (somando-se ao prazo restante), limitado a um acúmulo máximo de 24 (vinte e quatro) meses de validade total da chave de licença.</p>
              <p><strong>6.3.3.</strong> Bloqueio por Falta de Renovação: Caso não ocorra a renovação (manual ou automática) até a data de vencimento, a licença será desativada automaticamente no final do ciclo anual. O bloqueio da licença impede o acesso ao painel administrativo e interrompe imediatamente o funcionamento de todas as conexões, automações e APIs, até que a regularização financeira seja efetuada.</p>
              <p><strong>6.4.</strong> Política de Cancelamento e Reembolso (Venda Anual):</p>
              <p><strong>6.4.1.</strong> Prazo de Arrependimento (7 Dias): Em conformidade com o Art. 49 do Código de Defesa do Consumidor, o Cliente poderá solicitar o cancelamento e o reembolso integral do valor pago em até 07 (sete) dias corridos após a data da compra inicial.</p>
              <p><strong>6.4.2.</strong> Irrevogabilidade após 7 Dias: Decorrido o prazo de 7 dias, a licença é considerada plenamente entregue e consumada. Não haverá reembolso, estorno ou cancelamento de parcelas vincendas (pro rata) caso o Cliente decida deixar de usar o sistema antes do fim do período de 12 meses.</p>
              <p><strong>6.4.3.</strong> O pedido de cancelamento efetuado após o prazo legal de arrependimento terá efeito apenas de não renovação para o próximo ciclo, permanecendo o sistema disponível para uso até o término da vigência já contratada e paga.</p>
              <p>6.5. Reajuste de Preços e Proteção de Valor:<br/>A ZPRO reserva-se o direito de reajustar o valor da licença para novos licenciamentos ou renovações, visando preservar o equilíbrio econômico do serviço frente a variações de mercado, inflação ou custos operacionais.</p>
              <p><strong>6.5.1.</strong> Aviso Prévio: Para Clientes com licença ativa, eventuais reajustes serão aplicados somente na data da próxima renovação. A ZPRO compromete-se a comunicar qualquer alteração de preço com antecedência mínima via e-mail ou painel administrativo.</p>
              <p><strong>6.5.2.</strong> Travamento de Preço (Price Lock): O Cliente tem a opção de garantir o valor da tabela atual e proteger-se de futuros reajustes. Para isso, basta realizar a antecipação da renovação (conforme regras do item 6.3.2), o que permite &quot;travar&quot; o preço vigente pelo período contratado, até o limite máximo de 24 (vinte e quatro) meses acumulados.</p>
              <p>6.6. Custos Variáveis de Terceiros:<br/>Os valores cobrados pela ZPRO referem-se exclusivamente à licença de software. Custos variáveis decorrentes de serviços de terceiros integrados à plataforma são de responsabilidade exclusiva do Cliente e podem sofrer alterações alheias à vontade da ZPRO, tais como:</p>
              <ol type="I">
              <li>Tarifas da Meta/WhatsApp (janelas de conversação, WABA);</li>
              <li>Consumo de APIs de Inteligência Artificial (OpenAI, Anthropic, Google, Grok, etc);</li>
              <li>Serviços de SMS, Gateways de Pagamento e Provedores de VPS.</li>
              <li>Consumo de APIs externas gerenciadas por terceiros (Hub Notificame, Uazapi, Z-API, etc);</li>
              </ol>
              <p>6.7. Inadimplência e Suspensão:<br/>Na hipótese de falha no processamento de pagamentos parcelados ou estornos indevidos (Chargeback):</p>
              <ol type="I">
              <li>A ZPRO suspenderá imediatamente o acesso à licença e ao suporte técnico.</li>
              <li>A ZPRO reserva-se o direito de recusar novas vendas a Clientes com histórico de inadimplência ou que tenham violado as regras de conduta e respeito com a equipe de suporte.</li>
              </ol>
              <h2>7. POLÍTICA DE SUPORTE TÉCNICO E SLA</h2>
              <p>Este capítulo define o escopo, canais, horários e procedimentos para o acionamento do suporte técnico.</p>
              <p>7.1. Canais e Horários:<br/>O único canal oficial para solicitação de suporte técnico é através do nosso portal de tickets.</p>
              <p>Horário de Atendimento: De Segunda a Sexta-feira, das 08h às 18h (Horário de Brasília), exceto feriados nacionais.</p>
              <p>7.2. Tempo de Resposta (SLA):<br/>Nosso prazo máximo para resposta a um novo chamado é de até 03 (três) dias úteis, contados a partir da abertura do ticket.</p>
              <p>7.3. Escopo do Suporte (O que está incluso):<br/>Nossa equipe está preparada e restrita para auxiliar com:</p>
              <ol type="I">
              <li>Esclarecimento de dúvidas sobre o funcionamento e os recursos nativos do sistema ZPRO.</li>
              <li>Investigação e correção de bugs ou falhas no código do sistema.</li>
              <li>Auxílio em configurações relacionadas exclusivamente ao software ZPRO.</li>
              </ol>
              <p>7.4. Limitações (O que NÃO está incluso):<br/>Para garantir a qualidade do atendimento, os seguintes itens estão fora do escopo do nosso suporte técnico padrão, sendo de responsabilidade do Cliente:</p>
              <ol type="I">
              <li>Configuração, gestão, manutenção ou segurança do servidor (VPS) do cliente.</li>
              <li>Suporte para ferramentas de terceiros (Typebot, N8N, SIP, Webhooks externos, etc.).</li>
              <li>Criação de fluxos de chatbot, lógicas de atendimento, implementação de automações ou consultoria de negócios/marketing.</li>
              <li>Acesso remoto à máquina do cliente (por questões de privacidade e segurança).</li>
              <li>Customizações de frontend, alterações de código ou design (CSS/HTML) de forma personalizada para o cliente.</li>
              <li>Resolução de instabilidades ou falhas em APIs Não Oficiais. O funcionamento destas conexões depende de bibliotecas de terceiros e rotas não homologadas (simulação do WhatsApp Web), estando sujeitas a bloqueios e interrupções por parte da Meta que fogem ao controle técnico da ZPRO.</li>
              <li>Suporte a ambientes locais e redes restritivas: Diagnóstico de problemas de conexão decorrentes de instalações em infraestrutura local (Localhost, servidores físicos on-premise, máquinas virtuais em PCs pessoais), bem como dificuldades relacionadas a redes sem IP público dedicado (CGNAT), túneis de conexão (Ngrok, Cloudflare Tunnel), proxies reversos customizados ou firewalls de borda corporativos que divirjam do ambiente padrão homologado (VPS Cloud com IP Público).</li>
              </ol>
              <h2>8. OBRIGAÇÕES, RESPONSABILIDADES E LIMITAÇÕES</h2>
              <p><strong>8.1.</strong> Obrigações da ZPRO: Fornecer os arquivos de instalação, realizar o setup inicial, liberar atualizações (updates) de correção/segurança e prestar suporte técnico limitado ao funcionamento do software (bugs e dúvidas operacionais).</p>
              <p><strong>8.2.</strong> Obrigações do Cliente: Contratar e manter a VPS, realizar backups periódicos (a ZPRO não tem acesso aos dados), gerenciar as integrações de terceiros e administrar os usuários.</p>
              <p>8.3. Limitações sobre Integrações de Terceiros:<br/>Conforme detalhado na Cláusula 3.6, a ZPRO não possui controle sobre serviços externos (Meta/WhatsApp, OpenAI, Gateways).</p>
              <p><strong>8.3.1.</strong> A ZPRO não será responsabilizada por indisponibilidade, mudanças de política, bloqueios ou banimentos de números aplicados por terceiros.</p>
              <p><strong>8.3.2.</strong> A indisponibilidade de serviços de terceiros não isenta o Cliente do pagamento da licença, nem gera direito a reembolso.</p>
              <p><strong>8.3.3.</strong> O Cliente declara ciência dos termos de uso do WhatsApp: <a href="https://www.whatsapp.com/legal/business-terms/" target="_blank" rel="noopener noreferrer">https://www.whatsapp.com/legal/business-terms/</a></p>
              <p><strong>8.4.</strong> Riscos Inerentes e Dependência Tecnológica:</p>
              <p><strong>8.4.1.</strong> O Cliente reconhece que o sistema está sujeito a interferências, mau funcionamento ou atrasos inerentes ao uso da internet e infraestrutura de servidores.</p>
              <p><strong>8.4.2.</strong> O Cliente declara ter conhecimento desses riscos e concorda que falhas decorrentes de fatores externos não constituem defeito do software. Nestas hipóteses, não será devida pela ZPRO qualquer indenização por prejuízos, incluindo, mas não se limitando a: danos materiais, lucros cessantes, perda de uma chance ou danos morais.</p>
              <h2>9. PROPRIEDADE INTELECTUAL</h2>
              <p>9.1. Titularidade da ZPRO:<br/>O Sistema ZPRO, seu código-fonte, arquitetura de banco de dados, logotipos (da marca ZPRO), documentações, manuais e APIs são de propriedade intelectual exclusiva da ZPRO (Licenciante).</p>
              <p><strong>9.1.1.</strong> A contratação da licença não transfere, em hipótese alguma, a titularidade ou os direitos autorais do software para o Cliente. O Cliente recebe apenas uma autorização de uso (Licença), limitada, revogável e não exclusiva.</p>
              <p><strong>9.1.2.</strong> É vedado ao Cliente remover, ocultar ou alterar os avisos de copyright ou mecanismos de validação de licença embutidos no código-fonte, exceto nas áreas explicitamente designadas para personalização visual (White-Label).</p>
              <p>9.2. Titularidade do Cliente (White-Label e Dados):<br/>Pertencem exclusivamente ao Cliente:</p>
              <ol type="I">
              <li>A marca, logotipo e identidade visual aplicados sobre a plataforma no modelo White-Label.</li>
              <li>A base de dados de contatos, históricos de conversas e informações de seus clientes finais (Tenants).</li>
              <li>A estratégia de precificação e os contratos firmados com seus próprios clientes.</li>
              </ol>
              <p>9.3. Auditoria:<br/>A ZPRO reserva-se o direito de monitorar remotamente, via telemetria do sistema, a validade da chave de licença, os subdomínios registrados e as estatísticas de logins realizados no sistema, respeitando a privacidade dos dados Cliente.</p>
              <h2>10. PRIVACIDADE E PROTEÇÃO DE DADOS (LGPD)</h2>
              <p>10.1. Papéis das Partes (Definição de Controlador e Operador):<br/>Para fins da Lei Geral de Proteção de Dados (Lei nº 13.709/2018):</p>
              <p><strong>10.1.1.</strong> ZPRO como Controladora: A ZPRO atua como Controladora apenas dos dados cadastrais do Cliente Direto (nome, e-mail, CPF/CNPJ, telefone, domínio), utilizados para faturamento, validação da licença e suporte.</p>
              <p><strong>10.1.2.</strong> Cliente como Controlador: O Cliente é o único e exclusivo Controlador dos dados pessoais de terceiros (seus clientes finais/tenants, leads e contatos) que trafegam pelo Sistema ZPRO instalado em seu servidor.</p>
              <p>10.2. Ausência de Acesso aos Dados (Modelo Self-Hosted):<br/>O Cliente reconhece que, devido à natureza auto-hospedada (self-hosted) do software:</p>
              <p><strong>10.2.1.</strong> O banco de dados fica hospedado na infraestrutura (VPS) contratada pelo Cliente, sob sua guarda e responsabilidade.</p>
              <p><strong>10.2.2.</strong> A ZPRO não possui acesso ao conteúdo das mensagens, lista de contatos ou dados sensíveis processados pelo Cliente, exceto quando o Cliente fornece voluntariamente credenciais de acesso temporário para fins de suporte técnico.</p>
              <p>10.3. Responsabilidade por Vazamentos:<br/>Compete exclusivamente ao Cliente garantir a segurança de seu servidor (VPS), aplicando firewalls, atualizações de sistema operacional e boas práticas de segurança. A ZPRO não se responsabiliza por vazamentos de dados decorrentes de invasões, falhas de segurança na VPS ou engenharia social sofrida pelo Cliente ou sua equipe.</p>
              <h2>11. DISPOSIÇÕES GERAIS</h2>
              <p>A ZPRO informa que poderá, a qualquer momento, unilateralmente, modificar/atualizar estes Termos e Condições de Uso. Caso isso aconteça, o Usuário com Plano de Assinatura vigente será notificado e a versão atualizada valerá a partir de sua publicação. A continuidade de acesso ou utilização do Z-PRO pelos Usuários, depois da divulgação, confirmará a aceitação e vigência dos novos Termos e Condições de Uso.</p>
              <p>11.1. Comunicações:<br/>Todas as comunicações, notificações e avisos serão considerados válidos quando enviados para os endereços de e-mail cadastrados pelo Cliente no momento da compra ou através de avisos no painel administrativo do sistema.</p>
              <p>11.2. Tolerância:<br/>A eventual tolerância da ZPRO em exigir o cumprimento de qualquer cláusula deste contrato não configurará novação, renúncia ou perdão de direitos, podendo a cláusula ser exigida a qualquer tempo (não aplicação do supressio).</p>
              <p>11.3. Conduta e Respeito:<br/>A ZPRO preza pelo respeito mútuo. Reserva-se o direito de suspender o suporte técnico ou, em casos extremos, rescindir a licença caso o Cliente ou seus representantes tratem a equipe de atendimento com agressividade, ofensas, racismo, assédio ou qualquer comportamento inadequado.</p>
              <p>11.4. Cessão:<br/>O Cliente não poderá ceder ou transferir este contrato a terceiros sem a prévia autorização por escrito da ZPRO. A ZPRO poderá ceder este contrato em caso de fusão, aquisição ou venda de ativos da empresa.</p>
              <p>11.5. Independência das Cláusulas:<br/>Se qualquer disposição deste contrato for considerada inválida ou inexequível por um tribunal, as demais disposições permanecerão em pleno vigor e efeito.</p>
              <h2>12. FORO E LEGISLAÇÃO APLICÁVEL</h2>
              <p><strong>12.1.</strong> Este contrato é regido pelas leis da República Federativa do Brasil, em especial pelo Código Civil e pelas Leis de Propriedade Intelectual e Software.</p>
              <p><strong>12.2.</strong> Fica eleito o foro da Comarca de Alfenas - MG como o único competente para dirimir quaisquer dúvidas ou litígios oriundos deste contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja ou venha a ser.</p>
            
            </div>
          </q-tab-panel>
          <q-tab-panel name="privacidade">
            <div class="contract-content">
              <h2><strong>Aviso de Privacidade</strong></h2>
              <p><a target="_blank"href="https://zpro.passaportezdg.com.br/aviso-de-privacidade">Download aqui</a></p>
              <p><strong>Módulo Z-PRO</strong></p>
              <p><strong>Data de disponibilização: 22/05/2024</strong></p>
              <p><strong>Versão: 3.x.x.x</strong></p>
              <p>Oi Titular!</p>
              <p>A Comunidade ZDG tem um compromisso sério com a privacidade e a proteção dos dados pessoais das pessoas impactadas pelas suas atividades. Por isso criamos este Aviso de Privacidade (o "Aviso") para informar você como coletamos, utilizamos, processamos e compartilhamos, quando estritamente necessário, dados pessoais quando você executa e utiliza o Z-PRO.</p>
              <p>O Z-PRO é um Software as a Service que permite aos seus Usuários a otimização da comunicação com leads e clientes através de uma plataforma de multiatendimento de gestão de atividades e mensagens via Plataforma WhatsApp durante o uso da licença pelo período contratado no Plano de Assinatura adquirido de acordo com os Termos e Condições de Uso do Z-PRO.</p>
              <p>Para que nossa relação seja transparente e adequada à Lei Geral de Proteção de Dados Pessoais (a "LGPD") criamos este AVISO DE PRIVACIDADE (o "Aviso") através do qual informaremos a você como coletamos, utilizamos, processamos e divulgamos suas informações e dados pessoais quando do seu acesso e uso do Z-PRO, nosso Site e nossas landing pages.</p>
              <p>Como você vai perceber, nós coletamos o mínimo possível de Dados Pessoais na prestação dos nossos serviços e optamos por não ter acesso a nenhum Dado Pessoal a que não precisamos ter efetivamente acesso para cumprimento de nossas atividades.</p>
              <p>Leia atentamente este documento e na hipótese de ter algum questionamento, querer manifestar alguma inconformidade sobre o tratamento de dados pessoais que realizamos ou desejar exercer seus direitos de titular, não utilize nosso Software as a Service, nosso Site e nossas landing pages e falem imediatamente conosco no nosso Canal de Atendimento <a href="https://comunidadezdg.com.br/fale-com-a-zdg">aqui</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>
              <p>Este Aviso de Privacidade integra de forma indissociável os Termos e Condições de Uso que definem as condições da utilização do Site, então não deixe de ler esse documento também.</p>
              <p><strong>QUAIS AS INFORMAÇÕES QUE VOCÊ ENCONTRARÁ NESTE AVISO</strong></p>
              <ol>
                  <li>CONCEITOS IMPORTANTES PARA ESTE AVISO</li>
                  <li>A QUEM SE APLICA ESTE AVISO?</li>
                  <li>PAPÉIS E RESPONSABILIDADES NO TRATAMENTO DE DADOS PESSOAIS</li>
                  <li>COMO SÃO TRATADOS OS DADOS PESSOAIS DE QUEM UTILIZA O MÓDULO Z-PRO E O NOSSO SITE</li>
                  <li>COMPARTILHAMENTO DE DADOS PESSOAIS</li>
                  <li>LINK PARA SITES/PLATAFORMAS DE TERCEIROS</li>
                  <li>COMO PROTEGEMOS SEUS DADOS</li>
                  <li>SAIBA OS SEUS DIREITOS E COMO EXERCÊ-LOS</li>
                  <li>POR QUANTO TEMPO ARMAZENAMOS SEUS DADOS?</li>
                  <li>DISPOSIÇÕES GERAIS</li>
                  <li>CANAL DE COMUNICAÇÃO</li>
              </ol>
              <p><strong>1.   CONCEITOS IMPORTANTES PARA ESTE AVISO</strong></p>
              <p>Alguns conceitos para auxiliar na compreensão deste Aviso.</p>
              <p><strong>Anonimização:</strong> Processo pelo qual os dados pessoais coletados se tornam arquivos armazenados pelo Controlador, tornando impossível a identificação da pessoa a quem tais dados se referem.</p>
              <p><strong>ANPD:</strong> Autoridade Nacional de Proteção de Dados, órgão da administração pública responsável por zelar, implementar e fiscalizar o cumprimento da LGPD em todo o território nacional.</p>
              <p><strong>Cliente:</strong> Pessoa que efetua o pagamento da licença de uso do Z-PRO e determina quem são os Usuários cadastrados no seu dashboard.</p>
              <p><strong>Controlador:</strong> O responsável pelas decisões referentes ao tratamento de dados dos titulares afetados por uma atividade.</p>
              <p><strong>Dados Pessoais:</strong> Informações que identificam uma pessoa natural, como por exemplo: e-mail, CPF, telefone e endereço.</p>
              <p><strong>Dados Pessoais Sensíveis:</strong> Dado pessoal sobre origem racial ou étnica, convicção religiosa, opinião, filiação a sindicato ou a organização de caráter religioso, filosófico ou político, dado referente à saúde ou à vida sexual, dado genético ou biométrico.</p>
              <p><strong>IP:</strong> O endereço IP é o código atribuído a um terminal de uma rede para permitir sua identificação, definido segundo parâmetros internacionais.</p>
              <p><strong>LGPD:</strong> Lei Geral de Proteção de Dados Pessoais, Lei n° 13.709/2018, que dispõe sobre o tratamento e proteção de dados.</p>
              <p><strong>Operador:</strong> Quem realiza o tratamento de dados segundo as orientações do Controlador.</p>
              <p><strong>Passaporte ZDG:</strong> Plataforma que oferece soluções de autoatendimento 24h através de chatbots, gerenciamento de atendimentos e envio de mensagens via Plataforma WhatsApp e Plataforma Telegram para o seu público-alvo.</p>
              <p><strong>Plano de Assinatura:</strong> Plano de contratação aderido por clique pelo Cliente diretamente nas Plataformas de Compras parceiras, de acordo com os seus termos de uso, avisos de privacidade e condições de compra.</p>
              <p><strong>Plataforma WhatsApp:</strong> Plataforma de propriedade da WhatsApp LLC sobre a qual poderá ser executado o Software as a Service Z-PRO, de acordo com o Plano de Assinatura contratado e os termos de uso da plataforma no link <a href="https://www.whatsapp.com/legal/">https://www.whatsapp.com/legal/</a>.</p>
              <p><strong>Plataforma Telegram:</strong> Plataforma de propriedade da Telegram Messenger Inc. sobre a qual poderá ser executado o Software as a Service Z-PRO, de acordo com o Plano de Assinatura contratado e os termos de uso da plataforma no link <a href="https://telegram.org/tos/br">https://telegram.org/tos/br</a>.</p>
              <p><strong>Site:</strong> O site do Z-PRO disponível no link <a href="https://comunidadezdg.com.br/passaporte">https://comunidadezdg.com.br/passaporte</a>.</p>
              <p><strong>Tratamento de Dados:</strong> Toda operação realizada com dados pessoais, como as que se referem à coleta, produção, recepção, classificação, utilização, acesso, reprodução, transmissão, distribuição, processamento, arquivamento, armazenamento, eliminação, avaliação ou controle da informação, modificação, comunicação, transferência, difusão ou extração.</p>
              <p><strong>Titulares:</strong> Pessoa física a quem se referem os dados pessoais objeto de Tratamento por Controladores e Operadores.</p>
              <p><strong>Usuário:</strong> Pessoa indicada pelo Cliente para utilização de licença do Z-PRO, podendo ser:</p>
              <ul>
                  <li><strong>Usuário Administrador (o "Admin"):</strong> Pessoa com visibilidade sobre as funcionalidades de gestão da equipe.</li>
                  <li><strong>Usuário Interno:</strong> Pessoa física cadastrada pelo Admin para acesso e utilização do Z-PRO.</li>
                  <li><strong>Usuário do Site:</strong> Pessoa física que utiliza o Site do Z-PRO, mas não interage com a plataforma.</li>
              </ul>
              <p><strong>Z-PRO:</strong> Módulo do Passaporte ZDG que disponibiliza um Software as a Service (SaaS) acessível no ambiente web, que proporciona a otimização de atendimento de leads e clientes do Cliente e dos Usuários na Plataforma WhatsApp e na Plataforma Telegram através de suas diversas funcionalidades.</p>

              <p><strong>2. A QUEM SE APLICA ESTE AVISO?</strong></p>
              <p>Este Aviso de Privacidade (Aviso) se aplica aos Usuários do Z-PRO e do Site.</p>
              
              <p><strong>3. PAPÉIS E RESPONSABILIDADES NO TRATAMENTO DE DADOS PESSOAIS</strong></p>
              <p>Pessoas responsáveis pelo tratamento de dados pessoais de Titulares.</p>
              <p>A BIANCA SANT ANA PEREIRA LTDA ME, pessoa jurídica de direito privado inscrita no CNPJ sob o nº 35.617.749/0001-67, com endereço na Rua Alaor Ferreira da Fonseca n. 295, bairro Jardim América, em Alfenas/MG, CEP: 37.136-132, é a responsável pelo tratamento dos dados pessoais dos Usuários do Z-PRO e do Site, agindo como Controladora desses dados.</p>
              <p>Todavia, quando um Cliente do Z-PRO usa a sua licença, ele também age como Controlador Conjunto sobre esses dados, sendo indispensável que mantenha suas próprias políticas e medidas técnicas e administrativas de controle e proteção de dados pessoais. É fundamental que o Cliente e seus Usuários, por exemplo, assumam integralmente a obrigação de inclusão das operações realizadas pelo Z-PRO nos avisos de privacidade necessários, bem como que obtenha todos os consentimentos aplicáveis, sendo responsabilidade do Cliente e de seus Usuários a manutenção do Tratamento de Dados de acordo com a legislação.</p>
              <p>Para fazer a contratação de Plano de Assinatura, o cliente deverá realizar a compra da licença de uso por tempo determinado na Plataforma de Pagamento Parceira. Essa Plataforma de Pagamento também é Controladora dos dados na medida em que processa os dados pessoais de titulares para suas devidas finalidades.</p>
              <p>A BIANCA SANT ANA PEREIRA LTDA ME não é e nem será responsável pelo Tratamento de Dados realizado por terceiros dentro ou fora do seu Software as a Service.</p>

              <p><strong>3.1. COMO SÃO TRATADOS OS DADOS PESSOAIS DE QUEM UTILIZA O MÓDULO Z-PRO E O NOSSO SITE</strong></p>
              <p>3.1.1. Dados coletados para acesso ao Z-PRO</p>
              <p>Para cadastro e criação de Usuário são coletados os seguintes dados:</p>
              <ul>
                  <li>Nome</li>
                  <li>Telefone</li>
                  <li>E-mail</li>
                  <li>IP</li>
                  <li>Senha</li>
                  <li>Aceite de Termos e Condições de Uso</li>
              </ul>
              
              <p>3.1.2. Dados coletados para comunicação com Usuários</p>
              <p>Para comunicação com o Titular são coletados os seguintes dados:</p>
              <ul>
                  <li>Nome</li>
                  <li>Telefone</li>
                  <li>E-mail</li>
              </ul>
              
              <p>3.1.3. Dados coletados quando você interage com as nossas redes sociais</p>
              <p>Coletamos os dados necessários para entrar em contato com você, como nome, e-mail e telefone. Os dados pessoais que podem ser acessados são:</p>
              <ul>
                  <li>Nome</li>
                  <li>Telefone</li>
                  <li>Foto de WhatsApp</li>
              </ul>
              
              <p>3.1.3.1 Dados coletados indiretamente e cookies</p>
              <p>A nossa empresa pode coletar indiretamente, durante a utilização do Z-PRO pelo Usuário, como endereço IP, sessão, registros de data e horário de ações, aceite de Termos e Condições de Uso, atividades no nosso Software as a Service, etc., por meio de webhooks e cookies que serão tratados em um item específico.</p>
              
              <p>3.1.3.2 Logs de aplicação</p>
              <p>São coletados os registros de acesso, conjunto de informações referentes à data e hora de uso de uma determinada aplicação de internet a partir de um determinado endereço IP, nos termos da Lei nº 12.965/2014 (Marco Civil da Internet). Esse registro somente pode ser acessado através de mandado judicial.</p>
              
              <p>3.1.3.3 Cookies</p>
              <p>No nosso Site, temos um banner de cookies que pode ser acessado sempre que você quiser acessar e setar as configurações de privacidade nas nossas atividades e mudar as configurações relacionadas ao seu consentimento sobre o que puder ser alterado.</p>
              <p>Esse banner é dividido em duas telas. Na primeira tela, você pode decidir se quer:</p>
              <ul>
                  <li>Aceitar todos os nossos cookies</li>
                  <li>Rejeitar os cookies não necessários</li>
                  <li>Configurar o seu aceite de acordo com as suas preferências.</li>
              </ul>
              <p>Se você optar por configurar o seu aceite, você consegue ver que nosso Site utiliza diversos tipos de cookies para aprimorar a sua experiência e customizar a sua navegação que podem estar divididos em 5 grandes "famílias". São elas:</p>
              <ul>
                  <li><strong>Cookies necessários:</strong> Os cookies necessários são essenciais para o funcionamento do site. Sem eles, o site não funcionaria corretamente (por exemplo, acesso a áreas seguras do site, segurança, legislação).</li>
                  <li><strong>Cookies de performance:</strong> Os cookies de desempenho permitem que o site se comporte de acordo com o visitante, ajustando-se à sua localização, idioma preferido, etc.</li>
                  <li><strong>Cookies funcionais:</strong> Os cookies funcionais ajustam o site a serviços de terceiros, como links para seu perfil em redes sociais, comentários, chatbots, etc.</li>
                  <li><strong>Cookies de marketing:</strong> Os cookies de marketing ou publicidade rastreiam a navegação dos visitantes e coletam dados para que a empresa possa fornecer anúncios mais relevantes de acordo com tal comportamento.</li>
                  <li><strong>Cookies de estatísticas:</strong> Os cookies de estatísticas ou análises traduzem as interações dos visitantes em relatórios detalhados de comportamento de maneira anônima.</li>
              </ul>
              <p>Você pode conferir como cada cookie se comporta diretamente no nosso banner.</p>
              <p>Diferentes funcionalidades de cookies trazem diferentes bases legais de tratamento de dados, motivo pelo qual o Titular pode modular a sua aceitação na tela de configurações, optando ativamente por aqueles dados que consente em coletar. Eles vêm desativados por padrão, então se você não aceitou ou rejeitou todos no botão rápido da primeira tela, poderá selecionar os que consente em aceitar nessa segunda tela.</p>
              
              <p>3.2. Da negativa de tratamento de dados de clientes</p>
              <p>O Z-PRO não tem acesso aos dados que os Usuários operam no Z-PRO.</p>
              <p>O Z-PRO não tem acesso aos dados dos contatos telefônicos dos Usuários do Z-PRO.</p>
              <p>O Z-PRO não tem acesso às conversas dos Usuários do Z-PRO.</p>
              
              <p>3.3. Finalidades e bases legais do tratamento de dados pessoais</p>
              <table>
                  <thead>
                      <tr>
                          <th>Dados Coletados</th>
                          <th>Finalidade</th>
                          <th>Base legal</th>
                      </tr>
                  </thead>
                  <tbody>
                      <tr>
                          <td>Informações de Cadastro de Cliente</td>
                          <td>Para formação do contrato e identificação do Usuário que adquire o direito de usar a Licença do Z-PRO e suas funcionalidades.</td>
                          <td>Execução de Contrato e procedimentos preliminares (art. 7º V LGPD)</td>
                      </tr>
                      <tr>
                          <td>Informações de Cadastro de Usuário</td>
                          <td>Para identificação do Usuário que adquire o direito de usar a Licença do Z-PRO e suas funcionalidades.</td>
                          <td>Execução de Contrato e procedimentos preliminares (art. 7º V LGPD)</td>
                      </tr>
                      <tr>
                          <td>Interações de Usuários com o Z-PRO em canais de comunicação e/ou atendimento.</td>
                          <td>Tornar o atendimento do Z-PRO mais eficiente e melhorar a experiência do Usuário.</td>
                          <td>Legítimo interesse (art. 7º IX LGPD)</td>
                      </tr>
                      <tr>
                          <td>Endereço IP, sessão do Usuário, registros de data e horário de ações, dispositivo/navegador, as atividades do Usuário no site.</td>
                          <td>Coletar informações para identificar e proteger os Usuários, bem como cumprir com as obrigações legais.</td>
                          <td>Obrigação legal ou regulatória do Controlador (art. 7º II LGPD) - Atender ao Marco Civil da Internet (art. 15). Legítimo interesse do Controlador (art. 7º IX LGPD)</td>
                      </tr>
                      <tr>
                          <td>Cookies necessários</td>
                          <td>Para registrar a ação de aceitação, modulação ou rejeição de cookies pelo Titular durante a navegação no Site.</td>
                          <td>Legítimo interesse do Controlador (art. 10 LGPD)</td>
                      </tr>
                      <tr>
                          <td>Cookies funcionais, estatísticos, de performance e de marketing</td>
                          <td>Para personalização da experiência do Usuário, aprimorar as nossas funcionalidades e direcionar a publicidade para Usuários de acordo com o interesse dele na SAFIE.</td>
                          <td>Consentimento (art. 7º I LGPD)</td>
                      </tr>
                  </tbody>
              </table>
              
              <p>3.4. Veracidade dos dados</p>
              <p>O Usuário é responsável pela veracidade dos seus dados pessoais. A licença de uso do Z-PRO não contempla a responsabilidade pela conferência da autenticidade de dados do Cliente/Usuário e/ou outras ações de confirmação ou validação dos dados durante a utilização do Z-PRO.</p>
              <p>A licença de uso do Z-PRO não inclui a obrigatoriedade de processamento ou Tratamento de Dados fornecidos pelo Cliente ou pelo Usuário se pender suspeita motivada para crer que a realização da atividade possa causar infração de qualquer lei aplicável, bem como sobre a utilização indevida do Z-PRO pelo Cliente/Usuário, como para fins ilegais, ilícitos ou contrários a este Aviso ou aos Termos e Condições de Uso.</p>


              <p><strong>4. COMPARTILHAMENTO DE DADOS PESSOAIS</strong></p>
              <p>O Z-PRO pode compartilhar os dados necessários para que seja possível a manutenção das suas operações de forma eficiente. Ou seja, dados poderão ser compartilhados com empresas contratadas para que as funcionalidades do Z-PRO estejam disponíveis e/ou para que forneçam uma melhor experiência para o Cliente e os Usuários.</p>
              <p>Terão acesso aos dados pessoais coletados para operação do Z-PRO, como Operadores de dados, os agentes terceirizados especializados para prestação de serviços pontuais e específicos para o nosso Software as a Service, tais como:</p>
              <ul>
                  <li>Plataforma Cloud Hetzner - servidores em nuvem - <a href="https://www.hetzner.com/legal/privacy-policy/">https://www.hetzner.com/legal/privacy-policy/</a></li>
                  <li>Plataforma WhatsApp - serviços de mensagens instantâneas - <a href="https://www.whatsapp.com/legal/">https://www.whatsapp.com/legal/</a></li>
                  <li>Plataforma Telegram - serviços de mensagens instantâneas - <a href="https://telegram.org/tos/br">https://telegram.org/tos/br</a></li>
              </ul>
              <p>No entanto, poderá ser que para utilização do Z-PRO o Cliente tenha que compartilhar dados pessoais com outros Controladores de dados, como as nossas parceiras:</p>
              <ul>
                  <li>Plataforma de Pagamento Hotmart - <a href="https://hotmart.com/pt-br/legal/privacidade-de-dados">https://hotmart.com/pt-br/legal/privacidade-de-dados</a></li>
                  <li>Plataforma de Pagamento Greenn - <a href="https://greenn.com.br/politica-de-privacidade-greenn/">https://greenn.com.br/politica-de-privacidade-greenn/</a></li>
              </ul>
              <p>Nesse caso, você precisa entender que essas plataformas poderão solicitar dados pessoais que não são armazenados no Z-PRO para cumprir suas próprias obrigações relacionadas ao Tratamento de Dados. Antes de aceitar qualquer tipo de termo ou política de privacidade, informe-se bem.</p>
              <p>Todas as nossas contratações prezam pelo tratamento seguro das informações do Cliente/Usuário.</p>
              <p>A partir do momento que esses terceiros tiverem acesso aos dados compartilhados, serão responsáveis pelo seu tratamento em segurança, estando limitados às finalidades relacionadas ao serviço contratado e devendo respeitar a Lei aplicável.</p>
              
              <p>4.1. Transferência Internacional de Dados</p>
              <p>Até o limite permitido pela LGPD, poderá haver o compartilhamento de dados fora do Brasil.</p>
              <p>Essa transferência internacional ocorre quando utilizamos serviços em nuvem para processamento ou armazenamento de dados, para que seja possível executar os nossos serviços da melhor forma em um ambiente seguro.</p>
              <p>Para isso, utiliza-se os servidores cloud da Hetzner, que implica em uma transferência internacional dos dados pessoais para o país sede deste servidor, nos Estados Unidos da América. Outros servidores da Z-PRO ficam em São Paulo/SP, no Brasil.</p>
              <p>Ao fazer isso, tomamos todas as medidas cabíveis para assegurar que os seus dados sejam tratados e compartilhados de forma segura e em conformidade com a legislação vigente e este Aviso de Privacidade.</p>
              
              <p><strong>5. LINK PARA SITES/PLATAFORMAS DE TERCEIROS</strong></p>
              <p>Nosso Site pode conter links para sites/plataformas de terceiros, como parceiros, anunciantes e redes sociais. Ao seguir um link, é importante observar que esses sites/plataformas têm seus próprios avisos e políticas de privacidade e que a nossa empresa não é responsável por esses avisos e nem pela coleta de dados realizada. Recomendamos a verificação desses avisos e políticas antes de enviar quaisquer dados pessoais a esses terceiros.</p>
              
              <p><strong>6. COMO PROTEGEMOS SEUS DADOS</strong></p>
              <p>O Z-PRO se compromete com a segurança de todos seus Usuários e por isso adota procedimentos físicos, eletrônicos e administrativos que garantem a privacidade e segurança dos seus dados, com medidas técnicas compatíveis com os padrões esperados e boas práticas de segurança da informação.</p>
              <p>Sempre que possível, não coletamos dados sobre a sua utilização do Z-PRO.</p>
              <p>Em hipótese alguma teremos acesso às suas conversas.</p>
              <p>Todas as tecnologias utilizadas e empregadas no Z-PRO respeitarão sempre a legislação vigente e os termos deste Aviso de Privacidade.</p>
              
              <p><strong>7. SAIBA OS SEUS DIREITOS E COMO EXERCÊ-LOS</strong></p>
              <p><strong>Acesso e confirmação de tratamento:</strong> Você pode solicitar o acesso à relação completa de dados coletados e tratados, bem como a confirmação do tratamento de seus dados pessoais.</p>
              <p><strong>Retirada de consentimento:</strong> Você poderá retirar a sua anuência com o Tratamento de Dados Pessoais a qualquer momento, quando esta for a base legal adequada para realização do tratamento dos seus dados pessoais.</p>
              <p><strong>Correção de dados pessoais:</strong> Você pode solicitar a correção de dados que estão incompletos, inexatos ou desatualizados.</p>
              <p><strong>Anonimização, bloqueio ou eliminação:</strong> Todos os dados coletados e tratados por nós têm como finalidade a prestação de serviços e o bom desempenho do Software as a Service. Caso você acredite que algum dado seu está sendo tratado de forma desnecessária, em excesso ou o tratamento não esteja em conformidade com a LGPD, você poderá solicitar a anonimização, bloqueio ou eliminação, caso prove que houve excesso, desnecessidade ou desconformidade com a LGPD.</p>
              <p><strong>Informação acerca do compartilhamento:</strong> Você pode solicitar informações sobre nossos parceiros e fornecedores com os quais compartilhamos os dados. Todos os nossos parceiros também estão preocupados com a segurança dos Usuários e garantem a adoção de medidas adequadas para a proteção de seus dados.</p>
              <p><strong>Decisões automatizadas:</strong> Você pode solicitar a revisão de decisões tomadas unicamente com base no tratamento automatizado de dados e os critérios utilizados nessas decisões, observados sempre os segredos comerciais e industriais da nossa empresa.</p>
              <p><strong>Portabilidade de dados:</strong> Você poderá solicitar a portabilidade dos seus dados pessoais a outro fornecedor de serviços, em atendimento ao disposto na LGPD.</p>
              <p><strong>Oposição ou objeção a Tratamento de Dados Pessoais:</strong> Se você quiser, pode objetar o tratamento de alguns Dados Pessoais que realizamos ou apresentar oposição ao tratamento por completo. Nesse caso, poderemos parar o tratamento ou explicar que temos uma base legal adequada para realizar os tratamentos questionados.</p>
              <p><strong>Registro de reclamação:</strong> Você poderá procurar a ANPD a qualquer momento, caso sinta que seus direitos foram violados.</p>
              <p>Para exercer qualquer um dos seus direitos como Titular, entre em contato através do Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>
              
              <p><strong>8. POR QUANTO TEMPO ARMAZENAMOS SEUS DADOS?</strong></p>
              <p>Os dados fornecidos pelo Cliente/Usuário serão armazenados e processados enquanto seu cadastro estiver ativo.</p>
              <p>Caso o Usuário desejar, pode solicitar a exclusão da sua conta e dos seus dados pessoais através do Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>
              <p>Diante da solicitação de exclusão ou término da finalidade de tratamento, o Usuário terá todos os seus dados deletados permanentemente, exceto os dados cuja manutenção seja obrigatória por lei ou regulamentação, ou em relação aos dados necessários para o exercício regular de direitos em processo judicial, administrativo ou arbitral.</p>
              
              <p><strong>9. DISPOSIÇÕES GERAIS</strong></p>
              <p>A qualquer momento, unilateralmente, poderemos modificar/atualizar este Aviso. Caso isso aconteça, o Titular será notificado e a versão atualizada valerá a partir de sua publicação.</p>
              <p>A continuidade de acesso ou utilização do Cliente/Usuário após divulgação da atualização confirmará a ciência e vigência do novo Aviso.</p>
              <p>Além deste Aviso de Privacidade, nós dispomos de Termos e Condições de Uso, os quais definem as condições de uso que irão disciplinar a utilização do Z-PRO. Os Termos abrangem inseparavelmente as disposições deste Aviso de Privacidade.</p>
              
              <p><strong>10. CANAL DE COMUNICAÇÃO</strong></p>
              <p>Nós disponibilizamos um canal de comunicação para oferecer suporte ao titular de dados pessoais e quaisquer questões relacionadas a esse Aviso no Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>

              <p>O Z-PRO pode compartilhar os dados necessários para que seja possível a manutenção das suas operações de forma eficiente. Ou seja, dados poderão ser compartilhados com empresas contratadas para que as funcionalidades do Z-PRO estejam disponíveis e/ou para que forneçam uma melhor experiência para o Cliente e os Usuários.</p>
              <p>Terão acesso aos dados pessoais coletados para operação do Z-PRO, como Operadores de dados, os agentes terceirizados especializados para prestação de serviços pontuais e específicos para o nosso Software as a Service, tais como:</p>
              <ul>
                  <li>Plataforma Cloud Hetzner - servidores em nuvem - <a href="https://www.hetzner.com/legal/privacy-policy/">https://www.hetzner.com/legal/privacy-policy/</a></li>
                  <li>Plataforma WhatsApp - serviços de mensagens instantâneas - <a href="https://www.whatsapp.com/legal/">https://www.whatsapp.com/legal/</a></li>
                  <li>Plataforma Telegram - serviços de mensagens instantâneas - <a href="https://telegram.org/tos/br">https://telegram.org/tos/br</a></li>
              </ul>
              <p>No entanto, poderá ser que para utilização do Z-PRO o Cliente tenha que compartilhar dados pessoais com outros Controladores de dados, como as nossas parceiras:</p>
              <ul>
                  <li>Plataforma de Pagamento Hotmart - <a href="https://hotmart.com/pt-br/legal/privacidade-de-dados">https://hotmart.com/pt-br/legal/privacidade-de-dados</a></li>
                  <li>Plataforma de Pagamento Greenn - <a href="https://greenn.com.br/politica-de-privacidade-greenn/">https://greenn.com.br/politica-de-privacidade-greenn/</a></li>
              </ul>
              <p>Nesse caso, você precisa entender que essas plataformas poderão solicitar dados pessoais que não são armazenados no Z-PRO para cumprir suas próprias obrigações relacionadas ao Tratamento de Dados. Antes de aceitar qualquer tipo de termo ou política de privacidade, informe-se bem.</p>
              <p>Todas as nossas contratações prezam pelo tratamento seguro das informações do Cliente/Usuário.</p>
              <p>A partir do momento que esses terceiros tiverem acesso aos dados compartilhados, serão responsáveis pelo seu tratamento em segurança, estando limitados às finalidades relacionadas ao serviço contratado e devendo respeitar a Lei aplicável.</p>
              
              <p>Transferência Internacional de Dados</p>
              <p>Até o limite permitido pela LGPD, poderá haver o compartilhamento de dados fora do Brasil.</p>
              <p>Essa transferência internacional ocorre quando utilizamos serviços em nuvem para processamento ou armazenamento de dados, para que seja possível executar os nossos serviços da melhor forma em um ambiente seguro.</p>
              <p>Para isso, utiliza-se os servidores cloud da Hetzner, que implica em uma transferência internacional dos dados pessoais para o país sede deste servidor, nos Estados Unidos da América. Outros servidores da Z-PRO ficam em São Paulo/SP, no Brasil.</p>
              <p>Ao fazer isso, tomamos todas as medidas cabíveis para assegurar que os seus dados sejam tratados e compartilhados de forma segura e em conformidade com a legislação vigente e este Aviso de Privacidade.</p>
              
              <p>LINK PARA SITES/PLATAFORMAS DE TERCEIROS</p>
              <p>Nosso Site pode conter links para sites/plataformas de terceiros, como parceiros, anunciantes e redes sociais. Ao seguir um link, é importante observar que esses sites/plataformas têm seus próprios avisos e políticas de privacidade e que a nossa empresa não é responsável por esses avisos e nem pela coleta de dados realizada. Recomendamos a verificação desses avisos e políticas antes de enviar quaisquer dados pessoais a esses terceiros.</p>
              
              <p>COMO PROTEGEMOS SEUS DADOS</p>
              <p>O Z-PRO se compromete com a segurança de todos seus Usuários e por isso adota procedimentos físicos, eletrônicos e administrativos que garantem a privacidade e segurança dos seus dados, com medidas técnicas compatíveis com os padrões esperados e boas práticas de segurança da informação.</p>
              <p>Sempre que possível, não coletamos dados sobre a sua utilização do Z-PRO.</p>
              <p>Em hipótese alguma teremos acesso às suas conversas.</p>
              <p>Todas as tecnologias utilizadas e empregadas no Z-PRO respeitarão sempre a legislação vigente e os termos deste Aviso de Privacidade.</p>
              
              <p>SAIBA OS SEUS DIREITOS E COMO EXERCÊ-LOS</p>
              <p><strong>Acesso e confirmação de tratamento:</strong> Você pode solicitar o acesso à relação completa de dados coletados e tratados, bem como a confirmação do tratamento de seus dados pessoais.</p>
              <p><strong>Retirada de consentimento:</strong> Você poderá retirar a sua anuência com o Tratamento de Dados Pessoais a qualquer momento, quando esta for a base legal adequada para realização do tratamento dos seus dados pessoais.</p>
              <p><strong>Correção de dados pessoais:</strong> Você pode solicitar a correção de dados que estão incompletos, inexatos ou desatualizados.</p>
              <p><strong>Anonimização, bloqueio ou eliminação:</strong> Todos os dados coletados e tratados por nós têm como finalidade a prestação de serviços e o bom desempenho do Software as a Service. Caso você acredite que algum dado seu está sendo tratado de forma desnecessária, em excesso ou o tratamento não esteja em conformidade com a LGPD, você poderá solicitar a anonimização, bloqueio ou eliminação, caso prove que houve excesso, desnecessidade ou desconformidade com a LGPD.</p>
              <p><strong>Informação acerca do compartilhamento:</strong> Você pode solicitar informações sobre nossos parceiros e fornecedores com os quais compartilhamos os dados. Todos os nossos parceiros também estão preocupados com a segurança dos Usuários e garantem a adoção de medidas adequadas para a proteção de seus dados.</p>
              <p><strong>Decisões automatizadas:</strong> Você pode solicitar a revisão de decisões tomadas unicamente com base no tratamento automatizado de dados e os critérios utilizados nessas decisões, observados sempre os segredos comerciais e industriais da nossa empresa.</p>
              <p><strong>Portabilidade de dados:</strong> Você poderá solicitar a portabilidade dos seus dados pessoais a outro fornecedor de serviços, em atendimento ao disposto na LGPD.</p>
              <p><strong>Oposição ou objeção a Tratamento de Dados Pessoais:</strong> Se você quiser, pode objetar o tratamento de alguns Dados Pessoais que realizamos ou apresentar oposição ao tratamento por completo. Nesse caso, poderemos parar o tratamento ou explicar que temos uma base legal adequada para realizar os tratamentos questionados.</p>
              <p><strong>Registro de reclamação:</strong> Você poderá procurar a ANPD a qualquer momento, caso sinta que seus direitos foram violados.</p>
              <p>Para exercer qualquer um dos seus direitos como Titular, entre em contato através do Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>
              
              <p>POR QUANTO TEMPO ARMAZENAMOS SEUS DADOS?</p>
              <p>Os dados fornecidos pelo Cliente/Usuário serão armazenados e processados enquanto seu cadastro estiver ativo.</p>
              <p>Caso o Usuário desejar, pode solicitar a exclusão da sua conta e dos seus dados pessoais através do Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>
              <p>Diante da solicitação de exclusão ou término da finalidade de tratamento, o Usuário terá todos os seus dados deletados permanentemente, exceto os dados cuja manutenção seja obrigatória por lei ou regulamentação, ou em relação aos dados necessários para o exercício regular de direitos em processo judicial, administrativo ou arbitral.</p>
              
              <p>DISPOSIÇÕES GERAIS</p>
              <p>A qualquer momento, unilateralmente, poderemos modificar/atualizar este Aviso. Caso isso aconteça, o Titular será notificado e a versão atualizada valerá a partir de sua publicação.</p>
              <p>A continuidade de acesso ou utilização do Cliente/Usuário após divulgação da atualização confirmará a ciência e vigência do novo Aviso.</p>
              <p>Além deste Aviso de Privacidade, nós dispomos de Termos e Condições de Uso, os quais definem as condições de uso que irão disciplinar a utilização do Z-PRO. Os Termos abrangem inseparavelmente as disposições deste Aviso de Privacidade.</p>
              
              <p>CANAL DE COMUNICAÇÃO</p>
              <p>Nós disponibilizamos um canal de comunicação para oferecer suporte ao titular de dados pessoais e quaisquer questões relacionadas a esse Aviso no Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>

              <p>O Z-PRO pode compartilhar os dados necessários para que seja possível a manutenção das suas operações de forma eficiente. Ou seja, dados poderão ser compartilhados com empresas contratadas para que as funcionalidades do Z-PRO estejam disponíveis e/ou para que forneçam uma melhor experiência para o Cliente e os Usuários.</p>
              <p>Terão acesso aos dados pessoais coletados para operação do Z-PRO, como Operadores de dados, os agentes terceirizados especializados para prestação de serviços pontuais e específicos para o nosso Software as a Service, tais como:</p>
              <ul>
                  <li>Plataforma Cloud Hetzner - servidores em nuvem - <a href="https://www.hetzner.com/legal/privacy-policy/">https://www.hetzner.com/legal/privacy-policy/</a></li>
                  <li>Plataforma WhatsApp - serviços de mensagens instantâneas - <a href="https://www.whatsapp.com/legal/">https://www.whatsapp.com/legal/</a></li>
                  <li>Plataforma Telegram - serviços de mensagens instantâneas - <a href="https://telegram.org/tos/br">https://telegram.org/tos/br</a></li>
              </ul>
              <p>No entanto, poderá ser que para utilização do Z-PRO o Cliente tenha que compartilhar dados pessoais com outros Controladores de dados, como as nossas parceiras:</p>
              <ul>
                  <li>Plataforma de Pagamento Hotmart - <a href="https://hotmart.com/pt-br/legal/privacidade-de-dados">https://hotmart.com/pt-br/legal/privacidade-de-dados</a></li>
                  <li>Plataforma de Pagamento Greenn - <a href="https://greenn.com.br/politica-de-privacidade-greenn/">https://greenn.com.br/politica-de-privacidade-greenn/</a></li>
              </ul>
              <p>Nesse caso, você precisa entender que essas plataformas poderão solicitar dados pessoais que não são armazenados no Z-PRO para cumprir suas próprias obrigações relacionadas ao Tratamento de Dados. Antes de aceitar qualquer tipo de termo ou política de privacidade, informe-se bem.</p>
              <p>Todas as nossas contratações prezam pelo tratamento seguro das informações do Cliente/Usuário.</p>
              <p>A partir do momento que esses terceiros tiverem acesso aos dados compartilhados, serão responsáveis pelo seu tratamento em segurança, estando limitados às finalidades relacionadas ao serviço contratado e devendo respeitar a Lei aplicável.</p>
              
              <p>Transferência Internacional de Dados</p>
              <p>Até o limite permitido pela LGPD, poderá haver o compartilhamento de dados fora do Brasil.</p>
              <p>Essa transferência internacional ocorre quando utilizamos serviços em nuvem para processamento ou armazenamento de dados, para que seja possível executar os nossos serviços da melhor forma em um ambiente seguro.</p>
              <p>Para isso, utiliza-se os servidores cloud da Hetzner, que implica em uma transferência internacional dos dados pessoais para o país sede deste servidor, nos Estados Unidos da América. Outros servidores da Z-PRO ficam em São Paulo/SP, no Brasil.</p>
              <p>Ao fazer isso, tomamos todas as medidas cabíveis para assegurar que os seus dados sejam tratados e compartilhados de forma segura e em conformidade com a legislação vigente e este Aviso de Privacidade.</p>
              
              <p>LINK PARA SITES/PLATAFORMAS DE TERCEIROS</p>
              <p>Nosso Site pode conter links para sites/plataformas de terceiros, como parceiros, anunciantes e redes sociais. Ao seguir um link, é importante observar que esses sites/plataformas têm seus próprios avisos e políticas de privacidade e que a nossa empresa não é responsável por esses avisos e nem pela coleta de dados realizada. Recomendamos a verificação desses avisos e políticas antes de enviar quaisquer dados pessoais a esses terceiros.</p>
              
              <p>COMO PROTEGEMOS SEUS DADOS</p>
              <p>O Z-PRO se compromete com a segurança de todos seus Usuários e por isso adota procedimentos físicos, eletrônicos e administrativos que garantem a privacidade e segurança dos seus dados, com medidas técnicas compatíveis com os padrões esperados e boas práticas de segurança da informação.</p>
              <p>Sempre que possível, não coletamos dados sobre a sua utilização do Z-PRO.</p>
              <p>Em hipótese alguma teremos acesso às suas conversas.</p>
              <p>Todas as tecnologias utilizadas e empregadas no Z-PRO respeitarão sempre a legislação vigente e os termos deste Aviso de Privacidade.</p>
              
              <p>SAIBA OS SEUS DIREITOS E COMO EXERCÊ-LOS</p>
              <p><strong>Acesso e confirmação de tratamento:</strong> Você pode solicitar o acesso à relação completa de dados coletados e tratados, bem como a confirmação do tratamento de seus dados pessoais.</p>
              <p><strong>Retirada de consentimento:</strong> Você poderá retirar a sua anuência com o Tratamento de Dados Pessoais a qualquer momento, quando esta for a base legal adequada para realização do tratamento dos seus dados pessoais.</p>
              <p><strong>Correção de dados pessoais:</strong> Você pode solicitar a correção de dados que estão incompletos, inexatos ou desatualizados.</p>
              <p><strong>Anonimização, bloqueio ou eliminação:</strong> Todos os dados coletados e tratados por nós têm como finalidade a prestação de serviços e o bom desempenho do Software as a Service. Caso você acredite que algum dado seu está sendo tratado de forma desnecessária, em excesso ou o tratamento não esteja em conformidade com a LGPD, você poderá solicitar a anonimização, bloqueio ou eliminação, caso prove que houve excesso, desnecessidade ou desconformidade com a LGPD.</p>
              <p><strong>Informação acerca do compartilhamento:</strong> Você pode solicitar informações sobre nossos parceiros e fornecedores com os quais compartilhamos os dados. Todos os nossos parceiros também estão preocupados com a segurança dos Usuários e garantem a adoção de medidas adequadas para a proteção de seus dados.</p>
              <p><strong>Decisões automatizadas:</strong> Você pode solicitar a revisão de decisões tomadas unicamente com base no tratamento automatizado de dados e os critérios utilizados nessas decisões, observados sempre os segredos comerciais e industriais da nossa empresa.</p>
              <p><strong>Portabilidade de dados:</strong> Você poderá solicitar a portabilidade dos seus dados pessoais a outro fornecedor de serviços, em atendimento ao disposto na LGPD.</p>
              <p><strong>Oposição ou objeção a Tratamento de Dados Pessoais:</strong> Se você quiser, pode objetar o tratamento de alguns Dados Pessoais que realizamos ou apresentar oposição ao tratamento por completo. Nesse caso, poderemos parar o tratamento ou explicar que temos uma base legal adequada para realizar os tratamentos questionados.</p>
              <p><strong>Registro de reclamação:</strong> Você poderá procurar a ANPD a qualquer momento, caso sinta que seus direitos foram violados.</p>
              <p>Para exercer qualquer um dos seus direitos como Titular, entre em contato através do Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>
              
              <p>POR QUANTO TEMPO ARMAZENAMOS SEUS DADOS?</p>
              <p>Os dados fornecidos pelo Cliente/Usuário serão armazenados e processados enquanto seu cadastro estiver ativo.</p>
              <p>Caso o Usuário desejar, pode solicitar a exclusão da sua conta e dos seus dados pessoais através do Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>
              <p>Diante da solicitação de exclusão ou término da finalidade de tratamento, o Usuário terá todos os seus dados deletados permanentemente, exceto os dados cuja manutenção seja obrigatória por lei ou regulamentação, ou em relação aos dados necessários para o exercício regular de direitos em processo judicial, administrativo ou arbitral.</p>
              
              <p>DISPOSIÇÕES GERAIS</p>
              <p>A qualquer momento, unilateralmente, poderemos modificar/atualizar este Aviso. Caso isso aconteça, o Titular será notificado e a versão atualizada valerá a partir de sua publicação.</p>
              <p>A continuidade de acesso ou utilização do Cliente/Usuário após divulgação da atualização confirmará a ciência e vigência do novo Aviso.</p>
              <p>Além deste Aviso de Privacidade, nós dispomos de Termos e Condições de Uso, os quais definem as condições de uso que irão disciplinar a utilização do Z-PRO. Os Termos abrangem inseparavelmente as disposições deste Aviso de Privacidade.</p>
              
              <p>CANAL DE COMUNICAÇÃO</p>
              <p>Nós disponibilizamos um canal de comunicação para oferecer suporte ao titular de dados pessoais e quaisquer questões relacionadas a esse Aviso no Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>

              <p>O Z-PRO pode compartilhar os dados necessários para que seja possível a manutenção das suas operações de forma eficiente. Ou seja, dados poderão ser compartilhados com empresas contratadas para que as funcionalidades do Z-PRO estejam disponíveis e/ou para que forneçam uma melhor experiência para o Cliente e os Usuários.</p>
              <p>Terão acesso aos dados pessoais coletados para operação do Z-PRO, como Operadores de dados, os agentes terceirizados especializados para prestação de serviços pontuais e específicos para o nosso Software as a Service, tais como:</p>
              <ul>
                  <li>Plataforma Cloud Hetzner - servidores em nuvem - <a href="https://www.hetzner.com/legal/privacy-policy/">https://www.hetzner.com/legal/privacy-policy/</a></li>
                  <li>Plataforma WhatsApp - serviços de mensagens instantâneas - <a href="https://www.whatsapp.com/legal/">https://www.whatsapp.com/legal/</a></li>
                  <li>Plataforma Telegram - serviços de mensagens instantâneas - <a href="https://telegram.org/tos/br">https://telegram.org/tos/br</a></li>
              </ul>
              <p>No entanto, poderá ser que para utilização do Z-PRO o Cliente tenha que compartilhar dados pessoais com outros Controladores de dados, como as nossas parceiras:</p>
              <ul>
                  <li>Plataforma de Pagamento Hotmart - <a href="https://hotmart.com/pt-br/legal/privacidade-de-dados">https://hotmart.com/pt-br/legal/privacidade-de-dados</a></li>
                  <li>Plataforma de Pagamento Greenn - <a href="https://greenn.com.br/politica-de-privacidade-greenn/">https://greenn.com.br/politica-de-privacidade-greenn/</a></li>
              </ul>
              <p>Nesse caso, você precisa entender que essas plataformas poderão solicitar dados pessoais que não são armazenados no Z-PRO para cumprir suas próprias obrigações relacionadas ao Tratamento de Dados. Antes de aceitar qualquer tipo de termo ou política de privacidade, informe-se bem.</p>
              <p>Todas as nossas contratações prezam pelo tratamento seguro das informações do Cliente/Usuário.</p>
              <p>A partir do momento que esses terceiros tiverem acesso aos dados compartilhados, serão responsáveis pelo seu tratamento em segurança, estando limitados às finalidades relacionadas ao serviço contratado e devendo respeitar a Lei aplicável.</p>
              
              <p>Transferência Internacional de Dados</p>
              <p>Até o limite permitido pela LGPD, poderá haver o compartilhamento de dados fora do Brasil.</p>
              <p>Essa transferência internacional ocorre quando utilizamos serviços em nuvem para processamento ou armazenamento de dados, para que seja possível executar os nossos serviços da melhor forma em um ambiente seguro.</p>
              <p>Para isso, utiliza-se os servidores cloud da Hetzner, que implica em uma transferência internacional dos dados pessoais para o país sede deste servidor, nos Estados Unidos da América. Outros servidores da Z-PRO ficam em São Paulo/SP, no Brasil.</p>
              <p>Ao fazer isso, tomamos todas as medidas cabíveis para assegurar que os seus dados sejam tratados e compartilhados de forma segura e em conformidade com a legislação vigente e este Aviso de Privacidade.</p>
              
              <p>LINK PARA SITES/PLATAFORMAS DE TERCEIROS</p>
              <p>Nosso Site pode conter links para sites/plataformas de terceiros, como parceiros, anunciantes e redes sociais. Ao seguir um link, é importante observar que esses sites/plataformas têm seus próprios avisos e políticas de privacidade e que a nossa empresa não é responsável por esses avisos e nem pela coleta de dados realizada. Recomendamos a verificação desses avisos e políticas antes de enviar quaisquer dados pessoais a esses terceiros.</p>
              
              <p>COMO PROTEGEMOS SEUS DADOS</p>
              <p>O Z-PRO se compromete com a segurança de todos seus Usuários e por isso adota procedimentos físicos, eletrônicos e administrativos que garantem a privacidade e segurança dos seus dados, com medidas técnicas compatíveis com os padrões esperados e boas práticas de segurança da informação.</p>
              <p>Sempre que possível, não coletamos dados sobre a sua utilização do Z-PRO.</p>
              <p>Em hipótese alguma teremos acesso às suas conversas.</p>
              <p>Todas as tecnologias utilizadas e empregadas no Z-PRO respeitarão sempre a legislação vigente e os termos deste Aviso de Privacidade.</p>
              
              <p>SAIBA OS SEUS DIREITOS E COMO EXERCÊ-LOS</p>
              <p><strong>Acesso e confirmação de tratamento:</strong> Você pode solicitar o acesso à relação completa de dados coletados e tratados, bem como a confirmação do tratamento de seus dados pessoais.</p>
              <p><strong>Retirada de consentimento:</strong> Você poderá retirar a sua anuência com o Tratamento de Dados Pessoais a qualquer momento, quando esta for a base legal adequada para realização do tratamento dos seus dados pessoais.</p>
              <p><strong>Correção de dados pessoais:</strong> Você pode solicitar a correção de dados que estão incompletos, inexatos ou desatualizados.</p>
              <p><strong>Anonimização, bloqueio ou eliminação:</strong> Todos os dados coletados e tratados por nós têm como finalidade a prestação de serviços e o bom desempenho do Software as a Service. Caso você acredite que algum dado seu está sendo tratado de forma desnecessária, em excesso ou o tratamento não esteja em conformidade com a LGPD, você poderá solicitar a anonimização, bloqueio ou eliminação, caso prove que houve excesso, desnecessidade ou desconformidade com a LGPD.</p>
              <p><strong>Informação acerca do compartilhamento:</strong> Você pode solicitar informações sobre nossos parceiros e fornecedores com os quais compartilhamos os dados. Todos os nossos parceiros também estão preocupados com a segurança dos Usuários e garantem a adoção de medidas adequadas para a proteção de seus dados.</p>
              <p><strong>Decisões automatizadas:</strong> Você pode solicitar a revisão de decisões tomadas unicamente com base no tratamento automatizado de dados e os critérios utilizados nessas decisões, observados sempre os segredos comerciais e industriais da nossa empresa.</p>
              <p><strong>Portabilidade de dados:</strong> Você poderá solicitar a portabilidade dos seus dados pessoais a outro fornecedor de serviços, em atendimento ao disposto na LGPD.</p>
              <p><strong>Oposição ou objeção a Tratamento de Dados Pessoais:</strong> Se você quiser, pode objetar o tratamento de alguns Dados Pessoais que realizamos ou apresentar oposição ao tratamento por completo. Nesse caso, poderemos parar o tratamento ou explicar que temos uma base legal adequada para realizar os tratamentos questionados.</p>
              <p><strong>Registro de reclamação:</strong> Você poderá procurar a ANPD a qualquer momento, caso sinta que seus direitos foram violados.</p>
              <p>Para exercer qualquer um dos seus direitos como Titular, entre em contato através do Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>
              
              <p>POR QUANTO TEMPO ARMAZENAMOS SEUS DADOS?</p>
              <p>Os dados fornecidos pelo Cliente/Usuário serão armazenados e processados enquanto seu cadastro estiver ativo.</p>
              <p>Caso o Usuário desejar, pode solicitar a exclusão da sua conta e dos seus dados pessoais através do Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>
              <p>Diante da solicitação de exclusão ou término da finalidade de tratamento, o Usuário terá todos os seus dados deletados permanentemente, exceto os dados cuja manutenção seja obrigatória por lei ou regulamentação, ou em relação aos dados necessários para o exercício regular de direitos em processo judicial, administrativo ou arbitral.</p>
              
              <p>DISPOSIÇÕES GERAIS</p>
              <p>A qualquer momento, unilateralmente, poderemos modificar/atualizar este Aviso. Caso isso aconteça, o Titular será notificado e a versão atualizada valerá a partir de sua publicação.</p>
              <p>A continuidade de acesso ou utilização do Cliente/Usuário após divulgação da atualização confirmará a ciência e vigência do novo Aviso.</p>
              <p>Além deste Aviso de Privacidade, nós dispomos de Termos e Condições de Uso, os quais definem as condições de uso que irão disciplinar a utilização do Z-PRO. Os Termos abrangem inseparavelmente as disposições deste Aviso de Privacidade.</p>
              
              <p>CANAL DE COMUNICAÇÃO</p>
              <p>Nós disponibilizamos um canal de comunicação para oferecer suporte ao titular de dados pessoais e quaisquer questões relacionadas a esse Aviso no Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>

              <p>O Z-PRO pode compartilhar os dados necessários para que seja possível a manutenção das suas operações de forma eficiente. Ou seja, dados poderão ser compartilhados com empresas contratadas para que as funcionalidades do Z-PRO estejam disponíveis e/ou para que forneçam uma melhor experiência para o Cliente e os Usuários.</p>
              <p>Terão acesso aos dados pessoais coletados para operação do Z-PRO, como Operadores de dados, os agentes terceirizados especializados para prestação de serviços pontuais e específicos para o nosso Software as a Service, tais como:</p>
              <ul>
                  <li>Plataforma Cloud Hetzner - servidores em nuvem - <a href="https://www.hetzner.com/legal/privacy-policy/">https://www.hetzner.com/legal/privacy-policy/</a></li>
                  <li>Plataforma WhatsApp - serviços de mensagens instantâneas - <a href="https://www.whatsapp.com/legal/">https://www.whatsapp.com/legal/</a></li>
                  <li>Plataforma Telegram - serviços de mensagens instantâneas - <a href="https://telegram.org/tos/br">https://telegram.org/tos/br</a></li>
              </ul>
              <p>No entanto, poderá ser que para utilização do Z-PRO o Cliente tenha que compartilhar dados pessoais com outros Controladores de dados, como as nossas parceiras:</p>
              <ul>
                  <li>Plataforma de Pagamento Hotmart - <a href="https://hotmart.com/pt-br/legal/privacidade-de-dados">https://hotmart.com/pt-br/legal/privacidade-de-dados</a></li>
                  <li>Plataforma de Pagamento Greenn - <a href="https://greenn.com.br/politica-de-privacidade-greenn/">https://greenn.com.br/politica-de-privacidade-greenn/</a></li>
              </ul>
              <p>Nesse caso, você precisa entender que essas plataformas poderão solicitar dados pessoais que não são armazenados no Z-PRO para cumprir suas próprias obrigações relacionadas ao Tratamento de Dados. Antes de aceitar qualquer tipo de termo ou política de privacidade, informe-se bem.</p>
              <p>Todas as nossas contratações prezam pelo tratamento seguro das informações do Cliente/Usuário.</p>
              <p>A partir do momento que esses terceiros tiverem acesso aos dados compartilhados, serão responsáveis pelo seu tratamento em segurança, estando limitados às finalidades relacionadas ao serviço contratado e devendo respeitar a Lei aplicável.</p>
              
              <p>Transferência Internacional de Dados</p>
              <p>Até o limite permitido pela LGPD, poderá haver o compartilhamento de dados fora do Brasil.</p>
              <p>Essa transferência internacional ocorre quando utilizamos serviços em nuvem para processamento ou armazenamento de dados, para que seja possível executar os nossos serviços da melhor forma em um ambiente seguro.</p>
              <p>Para isso, utiliza-se os servidores cloud da Hetzner, que implica em uma transferência internacional dos dados pessoais para o país sede deste servidor, nos Estados Unidos da América. Outros servidores da Z-PRO ficam em São Paulo/SP, no Brasil.</p>
              <p>Ao fazer isso, tomamos todas as medidas cabíveis para assegurar que os seus dados sejam tratados e compartilhados de forma segura e em conformidade com a legislação vigente e este Aviso de Privacidade.</p>
              
              <p>LINK PARA SITES/PLATAFORMAS DE TERCEIROS</p>
              <p>Nosso Site pode conter links para sites/plataformas de terceiros, como parceiros, anunciantes e redes sociais. Ao seguir um link, é importante observar que esses sites/plataformas têm seus próprios avisos e políticas de privacidade e que a nossa empresa não é responsável por esses avisos e nem pela coleta de dados realizada. Recomendamos a verificação desses avisos e políticas antes de enviar quaisquer dados pessoais a esses terceiros.</p>
              
              <p>COMO PROTEGEMOS SEUS DADOS</p>
              <p>O Z-PRO se compromete com a segurança de todos seus Usuários e por isso adota procedimentos físicos, eletrônicos e administrativos que garantem a privacidade e segurança dos seus dados, com medidas técnicas compatíveis com os padrões esperados e boas práticas de segurança da informação.</p>
              <p>Sempre que possível, não coletamos dados sobre a sua utilização do Z-PRO.</p>
              <p>Em hipótese alguma teremos acesso às suas conversas.</p>
              <p>Todas as tecnologias utilizadas e empregadas no Z-PRO respeitarão sempre a legislação vigente e os termos deste Aviso de Privacidade.</p>
              
              <p>SAIBA OS SEUS DIREITOS E COMO EXERCÊ-LOS</p>
              <p><strong>Acesso e confirmação de tratamento:</strong> Você pode solicitar o acesso à relação completa de dados coletados e tratados, bem como a confirmação do tratamento de seus dados pessoais.</p>
              <p><strong>Retirada de consentimento:</strong> Você poderá retirar a sua anuência com o Tratamento de Dados Pessoais a qualquer momento, quando esta for a base legal adequada para realização do tratamento dos seus dados pessoais.</p>
              <p><strong>Correção de dados pessoais:</strong> Você pode solicitar a correção de dados que estão incompletos, inexatos ou desatualizados.</p>
              <p><strong>Anonimização, bloqueio ou eliminação:</strong> Todos os dados coletados e tratados por nós têm como finalidade a prestação de serviços e o bom desempenho do Software as a Service. Caso você acredite que algum dado seu está sendo tratado de forma desnecessária, em excesso ou o tratamento não esteja em conformidade com a LGPD, você poderá solicitar a anonimização, bloqueio ou eliminação, caso prove que houve excesso, desnecessidade ou desconformidade com a LGPD.</p>
              <p><strong>Informação acerca do compartilhamento:</strong> Você pode solicitar informações sobre nossos parceiros e fornecedores com os quais compartilhamos os dados. Todos os nossos parceiros também estão preocupados com a segurança dos Usuários e garantem a adoção de medidas adequadas para a proteção de seus dados.</p>
              <p><strong>Decisões automatizadas:</strong> Você pode solicitar a revisão de decisões tomadas unicamente com base no tratamento automatizado de dados e os critérios utilizados nessas decisões, observados sempre os segredos comerciais e industriais da nossa empresa.</p>
              <p><strong>Portabilidade de dados:</strong> Você poderá solicitar a portabilidade dos seus dados pessoais a outro fornecedor de serviços, em atendimento ao disposto na LGPD.</p>
              <p><strong>Oposição ou objeção a Tratamento de Dados Pessoais:</strong> Se você quiser, pode objetar o tratamento de alguns Dados Pessoais que realizamos ou apresentar oposição ao tratamento por completo. Nesse caso, poderemos parar o tratamento ou explicar que temos uma base legal adequada para realizar os tratamentos questionados.</p>
              <p><strong>Registro de reclamação:</strong> Você poderá procurar a ANPD a qualquer momento, caso sinta que seus direitos foram violados.</p>
              <p>Para exercer qualquer um dos seus direitos como Titular, entre em contato através do Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>
              
              <p>POR QUANTO TEMPO ARMAZENAMOS SEUS DADOS?</p>
              <p>Os dados fornecidos pelo Cliente/Usuário serão armazenados e processados enquanto seu cadastro estiver ativo.</p>
              <p>Caso o Usuário desejar, pode solicitar a exclusão da sua conta e dos seus dados pessoais através do Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>
              <p>Diante da solicitação de exclusão ou término da finalidade de tratamento, o Usuário terá todos os seus dados deletados permanentemente, exceto os dados cuja manutenção seja obrigatória por lei ou regulamentação, ou em relação aos dados necessários para o exercício regular de direitos em processo judicial, administrativo ou arbitral.</p>
              
              <p>DISPOSIÇÕES GERAIS</p>
              <p>A qualquer momento, unilateralmente, poderemos modificar/atualizar este Aviso. Caso isso aconteça, o Titular será notificado e a versão atualizada valerá a partir de sua publicação.</p>
              <p>A continuidade de acesso ou utilização do Cliente/Usuário após divulgação da atualização confirmará a ciência e vigência do novo Aviso.</p>
              <p>Além deste Aviso de Privacidade, nós dispomos de Termos e Condições de Uso, os quais definem as condições de uso que irão disciplinar a utilização do Z-PRO. Os Termos abrangem inseparavelmente as disposições deste Aviso de Privacidade.</p>
              
              <p>CANAL DE COMUNICAÇÃO</p>
              <p>Nós disponibilizamos um canal de comunicação para oferecer suporte ao titular de dados pessoais e quaisquer questões relacionadas a esse Aviso no Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>

              <p>O Z-PRO pode compartilhar os dados necessários para que seja possível a manutenção das suas operações de forma eficiente. Ou seja, dados poderão ser compartilhados com empresas contratadas para que as funcionalidades do Z-PRO estejam disponíveis e/ou para que forneçam uma melhor experiência para o Cliente e os Usuários.</p>
              <p>Terão acesso aos dados pessoais coletados para operação do Z-PRO, como Operadores de dados, os agentes terceirizados especializados para prestação de serviços pontuais e específicos para o nosso Software as a Service, tais como:</p>
              <ul>
                  <li>Plataforma Cloud Hetzner - servidores em nuvem - <a href="https://www.hetzner.com/legal/privacy-policy/">https://www.hetzner.com/legal/privacy-policy/</a></li>
                  <li>Plataforma WhatsApp - serviços de mensagens instantâneas - <a href="https://www.whatsapp.com/legal/">https://www.whatsapp.com/legal/</a></li>
                  <li>Plataforma Telegram - serviços de mensagens instantâneas - <a href="https://telegram.org/tos/br">https://telegram.org/tos/br</a></li>
              </ul>
              <p>No entanto, poderá ser que para utilização do Z-PRO o Cliente tenha que compartilhar dados pessoais com outros Controladores de dados, como as nossas parceiras:</p>
              <ul>
                  <li>Plataforma de Pagamento Hotmart - <a href="https://hotmart.com/pt-br/legal/privacidade-de-dados">https://hotmart.com/pt-br/legal/privacidade-de-dados</a></li>
                  <li>Plataforma de Pagamento Greenn - <a href="https://greenn.com.br/politica-de-privacidade-greenn/">https://greenn.com.br/politica-de-privacidade-greenn/</a></li>
              </ul>
              <p>Nesse caso, você precisa entender que essas plataformas poderão solicitar dados pessoais que não são armazenados no Z-PRO para cumprir suas próprias obrigações relacionadas ao Tratamento de Dados. Antes de aceitar qualquer tipo de termo ou política de privacidade, informe-se bem.</p>
              <p>Todas as nossas contratações prezam pelo tratamento seguro das informações do Cliente/Usuário.</p>
              <p>A partir do momento que esses terceiros tiverem acesso aos dados compartilhados, serão responsáveis pelo seu tratamento em segurança, estando limitados às finalidades relacionadas ao serviço contratado e devendo respeitar a Lei aplicável.</p>
              
              <p>Transferência Internacional de Dados</p>
              <p>Até o limite permitido pela LGPD, poderá haver o compartilhamento de dados fora do Brasil.</p>
              <p>Essa transferência internacional ocorre quando utilizamos serviços em nuvem para processamento ou armazenamento de dados, para que seja possível executar os nossos serviços da melhor forma em um ambiente seguro.</p>
              <p>Para isso, utiliza-se os servidores cloud da Hetzner, que implica em uma transferência internacional dos dados pessoais para o país sede deste servidor, nos Estados Unidos da América. Outros servidores da Z-PRO ficam em São Paulo/SP, no Brasil.</p>
              <p>Ao fazer isso, tomamos todas as medidas cabíveis para assegurar que os seus dados sejam tratados e compartilhados de forma segura e em conformidade com a legislação vigente e este Aviso de Privacidade.</p>
              
              <p>LINK PARA SITES/PLATAFORMAS DE TERCEIROS</p>
              <p>Nosso Site pode conter links para sites/plataformas de terceiros, como parceiros, anunciantes e redes sociais. Ao seguir um link, é importante observar que esses sites/plataformas têm seus próprios avisos e políticas de privacidade e que a nossa empresa não é responsável por esses avisos e nem pela coleta de dados realizada. Recomendamos a verificação desses avisos e políticas antes de enviar quaisquer dados pessoais a esses terceiros.</p>
              
              <p>COMO PROTEGEMOS SEUS DADOS</p>
              <p>O Z-PRO se compromete com a segurança de todos seus Usuários e por isso adota procedimentos físicos, eletrônicos e administrativos que garantem a privacidade e segurança dos seus dados, com medidas técnicas compatíveis com os padrões esperados e boas práticas de segurança da informação.</p>
              <p>Sempre que possível, não coletamos dados sobre a sua utilização do Z-PRO.</p>
              <p>Em hipótese alguma teremos acesso às suas conversas.</p>
              <p>Todas as tecnologias utilizadas e empregadas no Z-PRO respeitarão sempre a legislação vigente e os termos deste Aviso de Privacidade.</p>
              
              <p>SAIBA OS SEUS DIREITOS E COMO EXERCÊ-LOS</p>
              <p><strong>Acesso e confirmação de tratamento:</strong> Você pode solicitar o acesso à relação completa de dados coletados e tratados, bem como a confirmação do tratamento de seus dados pessoais.</p>
              <p><strong>Retirada de consentimento:</strong> Você poderá retirar a sua anuência com o Tratamento de Dados Pessoais a qualquer momento, quando esta for a base legal adequada para realização do tratamento dos seus dados pessoais.</p>
              <p><strong>Correção de dados pessoais:</strong> Você pode solicitar a correção de dados que estão incompletos, inexatos ou desatualizados.</p>
              <p><strong>Anonimização, bloqueio ou eliminação:</strong> Todos os dados coletados e tratados por nós têm como finalidade a prestação de serviços e o bom desempenho do Software as a Service. Caso você acredite que algum dado seu está sendo tratado de forma desnecessária, em excesso ou o tratamento não esteja em conformidade com a LGPD, você poderá solicitar a anonimização, bloqueio ou eliminação, caso prove que houve excesso, desnecessidade ou desconformidade com a LGPD.</p>
              <p><strong>Informação acerca do compartilhamento:</strong> Você pode solicitar informações sobre nossos parceiros e fornecedores com os quais compartilhamos os dados. Todos os nossos parceiros também estão preocupados com a segurança dos Usuários e garantem a adoção de medidas adequadas para a proteção de seus dados.</p>
              <p><strong>Decisões automatizadas:</strong> Você pode solicitar a revisão de decisões tomadas unicamente com base no tratamento automatizado de dados e os critérios utilizados nessas decisões, observados sempre os segredos comerciais e industriais da nossa empresa.</p>
              <p><strong>Portabilidade de dados:</strong> Você poderá solicitar a portabilidade dos seus dados pessoais a outro fornecedor de serviços, em atendimento ao disposto na LGPD.</p>
              <p><strong>Oposição ou objeção a Tratamento de Dados Pessoais:</strong> Se você quiser, pode objetar o tratamento de alguns Dados Pessoais que realizamos ou apresentar oposição ao tratamento por completo. Nesse caso, poderemos parar o tratamento ou explicar que temos uma base legal adequada para realizar os tratamentos questionados.</p>
              <p><strong>Registro de reclamação:</strong> Você poderá procurar a ANPD a qualquer momento, caso sinta que seus direitos foram violados.</p>
              <p>Para exercer qualquer um dos seus direitos como Titular, entre em contato através do Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>
              
              <p>POR QUANTO TEMPO ARMAZENAMOS SEUS DADOS?</p>
              <p>Os dados fornecidos pelo Cliente/Usuário serão armazenados e processados enquanto seu cadastro estiver ativo.</p>
              <p>Caso o Usuário desejar, pode solicitar a exclusão da sua conta e dos seus dados pessoais através do Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>
              <p>Diante da solicitação de exclusão ou término da finalidade de tratamento, o Usuário terá todos os seus dados deletados permanentemente, exceto os dados cuja manutenção seja obrigatória por lei ou regulamentação, ou em relação aos dados necessários para o exercício regular de direitos em processo judicial, administrativo ou arbitral.</p>
              
              <p>DISPOSIÇÕES GERAIS</p>
              <p>A qualquer momento, unilateralmente, poderemos modificar/atualizar este Aviso. Caso isso aconteça, o Titular será notificado e a versão atualizada valerá a partir de sua publicação.</p>
              <p>A continuidade de acesso ou utilização do Cliente/Usuário após divulgação da atualização confirmará a ciência e vigência do novo Aviso.</p>
              <p>Além deste Aviso de Privacidade, nós dispomos de Termos e Condições de Uso, os quais definem as condições de uso que irão disciplinar a utilização do Z-PRO. Os Termos abrangem inseparavelmente as disposições deste Aviso de Privacidade.</p>
              
              <p>CANAL DE COMUNICAÇÃO</p>
              <p>Nós disponibilizamos um canal de comunicação para oferecer suporte ao titular de dados pessoais e quaisquer questões relacionadas a esse Aviso no Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>

              <p>O Z-PRO pode compartilhar os dados necessários para que seja possível a manutenção das suas operações de forma eficiente. Ou seja, dados poderão ser compartilhados com empresas contratadas para que as funcionalidades do Z-PRO estejam disponíveis e/ou para que forneçam uma melhor experiência para o Cliente e os Usuários.</p>
              <p>Terão acesso aos dados pessoais coletados para operação do Z-PRO, como Operadores de dados, os agentes terceirizados especializados para prestação de serviços pontuais e específicos para o nosso Software as a Service, tais como:</p>
              <ul>
                  <li>Plataforma Cloud Hetzner - servidores em nuvem - <a href="https://www.hetzner.com/legal/privacy-policy/">https://www.hetzner.com/legal/privacy-policy/</a></li>
                  <li>Plataforma WhatsApp - serviços de mensagens instantâneas - <a href="https://www.whatsapp.com/legal/">https://www.whatsapp.com/legal/</a></li>
                  <li>Plataforma Telegram - serviços de mensagens instantâneas - <a href="https://telegram.org/tos/br">https://telegram.org/tos/br</a></li>
              </ul>
              <p>No entanto, poderá ser que para utilização do Z-PRO o Cliente tenha que compartilhar dados pessoais com outros Controladores de dados, como as nossas parceiras:</p>
              <ul>
                  <li>Plataforma de Pagamento Hotmart - <a href="https://hotmart.com/pt-br/legal/privacidade-de-dados">https://hotmart.com/pt-br/legal/privacidade-de-dados</a></li>
                  <li>Plataforma de Pagamento Greenn - <a href="https://greenn.com.br/politica-de-privacidade-greenn/">https://greenn.com.br/politica-de-privacidade-greenn/</a></li>
              </ul>
              <p>Nesse caso, você precisa entender que essas plataformas poderão solicitar dados pessoais que não são armazenados no Z-PRO para cumprir suas próprias obrigações relacionadas ao Tratamento de Dados. Antes de aceitar qualquer tipo de termo ou política de privacidade, informe-se bem.</p>
              <p>Todas as nossas contratações prezam pelo tratamento seguro das informações do Cliente/Usuário.</p>
              <p>A partir do momento que esses terceiros tiverem acesso aos dados compartilhados, serão responsáveis pelo seu tratamento em segurança, estando limitados às finalidades relacionadas ao serviço contratado e devendo respeitar a Lei aplicável.</p>
              
              <p>Transferência Internacional de Dados</p>
              <p>Até o limite permitido pela LGPD, poderá haver o compartilhamento de dados fora do Brasil.</p>
              <p>Essa transferência internacional ocorre quando utilizamos serviços em nuvem para processamento ou armazenamento de dados, para que seja possível executar os nossos serviços da melhor forma em um ambiente seguro.</p>
              <p>Para isso, utiliza-se os servidores cloud da Hetzner, que implica em uma transferência internacional dos dados pessoais para o país sede deste servidor, nos Estados Unidos da América. Outros servidores da Z-PRO ficam em São Paulo/SP, no Brasil.</p>
              <p>Ao fazer isso, tomamos todas as medidas cabíveis para assegurar que os seus dados sejam tratados e compartilhados de forma segura e em conformidade com a legislação vigente e este Aviso de Privacidade.</p>
              
              <p>LINK PARA SITES/PLATAFORMAS DE TERCEIROS</p>
              <p>Nosso Site pode conter links para sites/plataformas de terceiros, como parceiros, anunciantes e redes sociais. Ao seguir um link, é importante observar que esses sites/plataformas têm seus próprios avisos e políticas de privacidade e que a nossa empresa não é responsável por esses avisos e nem pela coleta de dados realizada. Recomendamos a verificação desses avisos e políticas antes de enviar quaisquer dados pessoais a esses terceiros.</p>
              
              <p>COMO PROTEGEMOS SEUS DADOS</p>
              <p>O Z-PRO se compromete com a segurança de todos seus Usuários e por isso adota procedimentos físicos, eletrônicos e administrativos que garantem a privacidade e segurança dos seus dados, com medidas técnicas compatíveis com os padrões esperados e boas práticas de segurança da informação.</p>
              <p>Sempre que possível, não coletamos dados sobre a sua utilização do Z-PRO.</p>
              <p>Em hipótese alguma teremos acesso às suas conversas.</p>
              <p>Todas as tecnologias utilizadas e empregadas no Z-PRO respeitarão sempre a legislação vigente e os termos deste Aviso de Privacidade.</p>
              
              <p>SAIBA OS SEUS DIREITOS E COMO EXERCÊ-LOS</p>
              <p><strong>Acesso e confirmação de tratamento:</strong> Você pode solicitar o acesso à relação completa de dados coletados e tratados, bem como a confirmação do tratamento de seus dados pessoais.</p>
              <p><strong>Retirada de consentimento:</strong> Você poderá retirar a sua anuência com o Tratamento de Dados Pessoais a qualquer momento, quando esta for a base legal adequada para realização do tratamento dos seus dados pessoais.</p>
              <p><strong>Correção de dados pessoais:</strong> Você pode solicitar a correção de dados que estão incompletos, inexatos ou desatualizados.</p>
              <p><strong>Anonimização, bloqueio ou eliminação:</strong> Todos os dados coletados e tratados por nós têm como finalidade a prestação de serviços e o bom desempenho do Software as a Service. Caso você acredite que algum dado seu está sendo tratado de forma desnecessária, em excesso ou o tratamento não esteja em conformidade com a LGPD, você poderá solicitar a anonimização, bloqueio ou eliminação, caso prove que houve excesso, desnecessidade ou desconformidade com a LGPD.</p>
              <p><strong>Informação acerca do compartilhamento:</strong> Você pode solicitar informações sobre nossos parceiros e fornecedores com os quais compartilhamos os dados. Todos os nossos parceiros também estão preocupados com a segurança dos Usuários e garantem a adoção de medidas adequadas para a proteção de seus dados.</p>
              <p><strong>Decisões automatizadas:</strong> Você pode solicitar a revisão de decisões tomadas unicamente com base no tratamento automatizado de dados e os critérios utilizados nessas decisões, observados sempre os segredos comerciais e industriais da nossa empresa.</p>
              <p><strong>Portabilidade de dados:</strong> Você poderá solicitar a portabilidade dos seus dados pessoais a outro fornecedor de serviços, em atendimento ao disposto na LGPD.</p>
              <p><strong>Oposição ou objeção a Tratamento de Dados Pessoais:</strong> Se você quiser, pode objetar o tratamento de alguns Dados Pessoais que realizamos ou apresentar oposição ao tratamento por completo. Nesse caso, poderemos parar o tratamento ou explicar que temos uma base legal adequada para realizar os tratamentos questionados.</p>
              <p><strong>Registro de reclamação:</strong> Você poderá procurar a ANPD a qualquer momento, caso sinta que seus direitos foram violados.</p>
              <p>Para exercer qualquer um dos seus direitos como Titular, entre em contato através do Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>
              
              <p>POR QUANTO TEMPO ARMAZENAMOS SEUS DADOS?</p>
              <p>Os dados fornecidos pelo Cliente/Usuário serão armazenados e processados enquanto seu cadastro estiver ativo.</p>
              <p>Caso o Usuário desejar, pode solicitar a exclusão da sua conta e dos seus dados pessoais através do Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>
              <p>Diante da solicitação de exclusão ou término da finalidade de tratamento, o Usuário terá todos os seus dados deletados permanentemente, exceto os dados cuja manutenção seja obrigatória por lei ou regulamentação, ou em relação aos dados necessários para o exercício regular de direitos em processo judicial, administrativo ou arbitral.</p>
              
              <p>DISPOSIÇÕES GERAIS</p>
              <p>A qualquer momento, unilateralmente, poderemos modificar/atualizar este Aviso. Caso isso aconteça, o Titular será notificado e a versão atualizada valerá a partir de sua publicação.</p>
              <p>A continuidade de acesso ou utilização do Cliente/Usuário após divulgação da atualização confirmará a ciência e vigência do novo Aviso.</p>
              <p>Além deste Aviso de Privacidade, nós dispomos de Termos e Condições de Uso, os quais definem as condições de uso que irão disciplinar a utilização do Z-PRO. Os Termos abrangem inseparavelmente as disposições deste Aviso de Privacidade.</p>
              
              <p>CANAL DE COMUNICAÇÃO</p>
              <p>Nós disponibilizamos um canal de comunicação para oferecer suporte ao titular de dados pessoais e quaisquer questões relacionadas a esse Aviso no Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>

              <p>O Z-PRO pode compartilhar os dados necessários para que seja possível a manutenção das suas operações de forma eficiente. Ou seja, dados poderão ser compartilhados com empresas contratadas para que as funcionalidades do Z-PRO estejam disponíveis e/ou para que forneçam uma melhor experiência para o Cliente e os Usuários.</p>
              <p>Terão acesso aos dados pessoais coletados para operação do Z-PRO, como Operadores de dados, os agentes terceirizados especializados para prestação de serviços pontuais e específicos para o nosso Software as a Service, tais como:</p>
              <ul>
                  <li>Plataforma Cloud Hetzner - servidores em nuvem - <a href="https://www.hetzner.com/legal/privacy-policy/">https://www.hetzner.com/legal/privacy-policy/</a></li>
                  <li>Plataforma WhatsApp - serviços de mensagens instantâneas - <a href="https://www.whatsapp.com/legal/">https://www.whatsapp.com/legal/</a></li>
                  <li>Plataforma Telegram - serviços de mensagens instantâneas - <a href="https://telegram.org/tos/br">https://telegram.org/tos/br</a></li>
              </ul>
              <p>No entanto, poderá ser que para utilização do Z-PRO o Cliente tenha que compartilhar dados pessoais com outros Controladores de dados, como as nossas parceiras:</p>
              <ul>
                  <li>Plataforma de Pagamento Hotmart - <a href="https://hotmart.com/pt-br/legal/privacidade-de-dados">https://hotmart.com/pt-br/legal/privacidade-de-dados</a></li>
                  <li>Plataforma de Pagamento Greenn - <a href="https://greenn.com.br/politica-de-privacidade-greenn/">https://greenn.com.br/politica-de-privacidade-greenn/</a></li>
              </ul>
              <p>Nesse caso, você precisa entender que essas plataformas poderão solicitar dados pessoais que não são armazenados no Z-PRO para cumprir suas próprias obrigações relacionadas ao Tratamento de Dados. Antes de aceitar qualquer tipo de termo ou política de privacidade, informe-se bem.</p>
              <p>Todas as nossas contratações prezam pelo tratamento seguro das informações do Cliente/Usuário.</p>
              <p>A partir do momento que esses terceiros tiverem acesso aos dados compartilhados, serão responsáveis pelo seu tratamento em segurança, estando limitados às finalidades relacionadas ao serviço contratado e devendo respeitar a Lei aplicável.</p>
              
              <p>Transferência Internacional de Dados</p>
              <p>Até o limite permitido pela LGPD, poderá haver o compartilhamento de dados fora do Brasil.</p>
              <p>Essa transferência internacional ocorre quando utilizamos serviços em nuvem para processamento ou armazenamento de dados, para que seja possível executar os nossos serviços da melhor forma em um ambiente seguro.</p>
              <p>Para isso, utiliza-se os servidores cloud da Hetzner, que implica em uma transferência internacional dos dados pessoais para o país sede deste servidor, nos Estados Unidos da América. Outros servidores da Z-PRO ficam em São Paulo/SP, no Brasil.</p>
              <p>Ao fazer isso, tomamos todas as medidas cabíveis para assegurar que os seus dados sejam tratados e compartilhados de forma segura e em conformidade com a legislação vigente e este Aviso de Privacidade.</p>
              
              <p>LINK PARA SITES/PLATAFORMAS DE TERCEIROS</p>
              <p>Nosso Site pode conter links para sites/plataformas de terceiros, como parceiros, anunciantes e redes sociais. Ao seguir um link, é importante observar que esses sites/plataformas têm seus próprios avisos e políticas de privacidade e que a nossa empresa não é responsável por esses avisos e nem pela coleta de dados realizada. Recomendamos a verificação desses avisos e políticas antes de enviar quaisquer dados pessoais a esses terceiros.</p>
              
              <p>COMO PROTEGEMOS SEUS DADOS</p>
              <p>O Z-PRO se compromete com a segurança de todos seus Usuários e por isso adota procedimentos físicos, eletrônicos e administrativos que garantem a privacidade e segurança dos seus dados, com medidas técnicas compatíveis com os padrões esperados e boas práticas de segurança da informação.</p>
              <p>Sempre que possível, não coletamos dados sobre a sua utilização do Z-PRO.</p>
              <p>Em hipótese alguma teremos acesso às suas conversas.</p>
              <p>Todas as tecnologias utilizadas e empregadas no Z-PRO respeitarão sempre a legislação vigente e os termos deste Aviso de Privacidade.</p>
              
              <p>SAIBA OS SEUS DIREITOS E COMO EXERCÊ-LOS</p>
              <p><strong>Acesso e confirmação de tratamento:</strong> Você pode solicitar o acesso à relação completa de dados coletados e tratados, bem como a confirmação do tratamento de seus dados pessoais.</p>
              <p><strong>Retirada de consentimento:</strong> Você poderá retirar a sua anuência com o Tratamento de Dados Pessoais a qualquer momento, quando esta for a base legal adequada para realização do tratamento dos seus dados pessoais.</p>
              <p><strong>Correção de dados pessoais:</strong> Você pode solicitar a correção de dados que estão incompletos, inexatos ou desatualizados.</p>
              <p><strong>Anonimização, bloqueio ou eliminação:</strong> Todos os dados coletados e tratados por nós têm como finalidade a prestação de serviços e o bom desempenho do Software as a Service. Caso você acredite que algum dado seu está sendo tratado de forma desnecessária, em excesso ou o tratamento não esteja em conformidade com a LGPD, você poderá solicitar a anonimização, bloqueio ou eliminação, caso prove que houve excesso, desnecessidade ou desconformidade com a LGPD.</p>
              <p><strong>Informação acerca do compartilhamento:</strong> Você pode solicitar informações sobre nossos parceiros e fornecedores com os quais compartilhamos os dados. Todos os nossos parceiros também estão preocupados com a segurança dos Usuários e garantem a adoção de medidas adequadas para a proteção de seus dados.</p>
              <p><strong>Decisões automatizadas:</strong> Você pode solicitar a revisão de decisões tomadas unicamente com base no tratamento automatizado de dados e os critérios utilizados nessas decisões, observados sempre os segredos comerciais e industriais da nossa empresa.</p>
              <p><strong>Portabilidade de dados:</strong> Você poderá solicitar a portabilidade dos seus dados pessoais a outro fornecedor de serviços, em atendimento ao disposto na LGPD.</p>
              <p><strong>Oposição ou objeção a Tratamento de Dados Pessoais:</strong> Se você quiser, pode objetar o tratamento de alguns Dados Pessoais que realizamos ou apresentar oposição ao tratamento por completo. Nesse caso, poderemos parar o tratamento ou explicar que temos uma base legal adequada para realizar os tratamentos questionados.</p>
              <p><strong>Registro de reclamação:</strong> Você poderá procurar a ANPD a qualquer momento, caso sinta que seus direitos foram violados.</p>
              <p>Para exercer qualquer um dos seus direitos como Titular, entre em contato através do Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>
              
              <p>POR QUANTO TEMPO ARMAZENAMOS SEUS DADOS?</p>
              <p>Os dados fornecidos pelo Cliente/Usuário serão armazenados e processados enquanto seu cadastro estiver ativo.</p>
              <p>Caso o Usuário desejar, pode solicitar a exclusão da sua conta e dos seus dados pessoais através do Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>
              <p>Diante da solicitação de exclusão ou término da finalidade de tratamento, o Usuário terá todos os seus dados deletados permanentemente, exceto os dados cuja manutenção seja obrigatória por lei ou regulamentação, ou em relação aos dados necessários para o exercício regular de direitos em processo judicial, administrativo ou arbitral.</p>
              
              <p>DISPOSIÇÕES GERAIS</p>
              <p>A qualquer momento, unilateralmente, poderemos modificar/atualizar este Aviso. Caso isso aconteça, o Titular será notificado e a versão atualizada valerá a partir de sua publicação.</p>
              <p>A continuidade de acesso ou utilização do Cliente/Usuário após divulgação da atualização confirmará a ciência e vigência do novo Aviso.</p>
              <p>Além deste Aviso de Privacidade, nós dispomos de Termos e Condições de Uso, os quais definem as condições de uso que irão disciplinar a utilização do Z-PRO. Os Termos abrangem inseparavelmente as disposições deste Aviso de Privacidade.</p>
              
              <p>CANAL DE COMUNICAÇÃO</p>
              <p>Nós disponibilizamos um canal de comunicação para oferecer suporte ao titular de dados pessoais e quaisquer questões relacionadas a esse Aviso no Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>

              <p>O Z-PRO pode compartilhar os dados necessários para que seja possível a manutenção das suas operações de forma eficiente. Ou seja, dados poderão ser compartilhados com empresas contratadas para que as funcionalidades do Z-PRO estejam disponíveis e/ou para que forneçam uma melhor experiência para o Cliente e os Usuários.</p>
              <p>Terão acesso aos dados pessoais coletados para operação do Z-PRO, como Operadores de dados, os agentes terceirizados especializados para prestação de serviços pontuais e específicos para o nosso Software as a Service, tais como:</p>
              <ul>
                  <li>Plataforma Cloud Hetzner - servidores em nuvem - <a href="https://www.hetzner.com/legal/privacy-policy/">https://www.hetzner.com/legal/privacy-policy/</a></li>
                  <li>Plataforma WhatsApp - serviços de mensagens instantâneas - <a href="https://www.whatsapp.com/legal/">https://www.whatsapp.com/legal/</a></li>
                  <li>Plataforma Telegram - serviços de mensagens instantâneas - <a href="https://telegram.org/tos/br">https://telegram.org/tos/br</a></li>
              </ul>
              <p>No entanto, poderá ser que para utilização do Z-PRO o Cliente tenha que compartilhar dados pessoais com outros Controladores de dados, como as nossas parceiras:</p>
              <ul>
                  <li>Plataforma de Pagamento Hotmart - <a href="https://hotmart.com/pt-br/legal/privacidade-de-dados">https://hotmart.com/pt-br/legal/privacidade-de-dados</a></li>
                  <li>Plataforma de Pagamento Greenn - <a href="https://greenn.com.br/politica-de-privacidade-greenn/">https://greenn.com.br/politica-de-privacidade-greenn/</a></li>
              </ul>
              <p>Nesse caso, você precisa entender que essas plataformas poderão solicitar dados pessoais que não são armazenados no Z-PRO para cumprir suas próprias obrigações relacionadas ao Tratamento de Dados. Antes de aceitar qualquer tipo de termo ou política de privacidade, informe-se bem.</p>
              <p>Todas as nossas contratações prezam pelo tratamento seguro das informações do Cliente/Usuário.</p>
              <p>A partir do momento que esses terceiros tiverem acesso aos dados compartilhados, serão responsáveis pelo seu tratamento em segurança, estando limitados às finalidades relacionadas ao serviço contratado e devendo respeitar a Lei aplicável.</p>
              
              <p>Transferência Internacional de Dados</p>
              <p>Até o limite permitido pela LGPD, poderá haver o compartilhamento de dados fora do Brasil.</p>
              <p>Essa transferência internacional ocorre quando utilizamos serviços em nuvem para processamento ou armazenamento de dados, para que seja possível executar os nossos serviços da melhor forma em um ambiente seguro.</p>
              <p>Para isso, utiliza-se os servidores cloud da Hetzner, que implica em uma transferência internacional dos dados pessoais para o país sede deste servidor, nos Estados Unidos da América. Outros servidores da Z-PRO ficam em São Paulo/SP, no Brasil.</p>
              <p>Ao fazer isso, tomamos todas as medidas cabíveis para assegurar que os seus dados sejam tratados e compartilhados de forma segura e em conformidade com a legislação vigente e este Aviso de Privacidade.</p>
              
              <p>LINK PARA SITES/PLATAFORMAS DE TERCEIROS</p>
              <p>Nosso Site pode conter links para sites/plataformas de terceiros, como parceiros, anunciantes e redes sociais. Ao seguir um link, é importante observar que esses sites/plataformas têm seus próprios avisos e políticas de privacidade e que a nossa empresa não é responsável por esses avisos e nem pela coleta de dados realizada. Recomendamos a verificação desses avisos e políticas antes de enviar quaisquer dados pessoais a esses terceiros.</p>
              
              <p>COMO PROTEGEMOS SEUS DADOS</p>
              <p>O Z-PRO se compromete com a segurança de todos seus Usuários e por isso adota procedimentos físicos, eletrônicos e administrativos que garantem a privacidade e segurança dos seus dados, com medidas técnicas compatíveis com os padrões esperados e boas práticas de segurança da informação.</p>
              <p>Sempre que possível, não coletamos dados sobre a sua utilização do Z-PRO.</p>
              <p>Em hipótese alguma teremos acesso às suas conversas.</p>
              <p>Todas as tecnologias utilizadas e empregadas no Z-PRO respeitarão sempre a legislação vigente e os termos deste Aviso de Privacidade.</p>
              
              <p>SAIBA OS SEUS DIREITOS E COMO EXERCÊ-LOS</p>
              <p><strong>Acesso e confirmação de tratamento:</strong> Você pode solicitar o acesso à relação completa de dados coletados e tratados, bem como a confirmação do tratamento de seus dados pessoais.</p>
              <p><strong>Retirada de consentimento:</strong> Você poderá retirar a sua anuência com o Tratamento de Dados Pessoais a qualquer momento, quando esta for a base legal adequada para realização do tratamento dos seus dados pessoais.</p>
              <p><strong>Correção de dados pessoais:</strong> Você pode solicitar a correção de dados que estão incompletos, inexatos ou desatualizados.</p>
              <p><strong>Anonimização, bloqueio ou eliminação:</strong> Todos os dados coletados e tratados por nós têm como finalidade a prestação de serviços e o bom desempenho do Software as a Service. Caso você acredite que algum dado seu está sendo tratado de forma desnecessária, em excesso ou o tratamento não esteja em conformidade com a LGPD, você poderá solicitar a anonimização, bloqueio ou eliminação, caso prove que houve excesso, desnecessidade ou desconformidade com a LGPD.</p>
              <p><strong>Informação acerca do compartilhamento:</strong> Você pode solicitar informações sobre nossos parceiros e fornecedores com os quais compartilhamos os dados. Todos os nossos parceiros também estão preocupados com a segurança dos Usuários e garantem a adoção de medidas adequadas para a proteção de seus dados.</p>
              <p><strong>Decisões automatizadas:</strong> Você pode solicitar a revisão de decisões tomadas unicamente com base no tratamento automatizado de dados e os critérios utilizados nessas decisões, observados sempre os segredos comerciais e industriais da nossa empresa.</p>
              <p><strong>Portabilidade de dados:</strong> Você poderá solicitar a portabilidade dos seus dados pessoais a outro fornecedor de serviços, em atendimento ao disposto na LGPD.</p>
              <p><strong>Oposição ou objeção a Tratamento de Dados Pessoais:</strong> Se você quiser, pode objetar o tratamento de alguns Dados Pessoais que realizamos ou apresentar oposição ao tratamento por completo. Nesse caso, poderemos parar o tratamento ou explicar que temos uma base legal adequada para realizar os tratamentos questionados.</p>
              <p><strong>Registro de reclamação:</strong> Você poderá procurar a ANPD a qualquer momento, caso sinta que seus direitos foram violados.</p>
              <p>Para exercer qualquer um dos seus direitos como Titular, entre em contato através do Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>
              
              <p>POR QUANTO TEMPO ARMAZENAMOS SEUS DADOS?</p>
              <p>Os dados fornecidos pelo Cliente/Usuário serão armazenados e processados enquanto seu cadastro estiver ativo.</p>
              <p>Caso o Usuário desejar, pode solicitar a exclusão da sua conta e dos seus dados pessoais através do Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>
              <p>Diante da solicitação de exclusão ou término da finalidade de tratamento, o Usuário terá todos os seus dados deletados permanentemente, exceto os dados cuja manutenção seja obrigatória por lei ou regulamentação, ou em relação aos dados necessários para o exercício regular de direitos em processo judicial, administrativo ou arbitral.</p>
              
              <p>DISPOSIÇÕES GERAIS</p>
              <p>A qualquer momento, unilateralmente, poderemos modificar/atualizar este Aviso. Caso isso aconteça, o Titular será notificado e a versão atualizada valerá a partir de sua publicação.</p>
              <p>A continuidade de acesso ou utilização do Cliente/Usuário após divulgação da atualização confirmará a ciência e vigência do novo Aviso.</p>
              <p>Além deste Aviso de Privacidade, nós dispomos de Termos e Condições de Uso, os quais definem as condições de uso que irão disciplinar a utilização do Z-PRO. Os Termos abrangem inseparavelmente as disposições deste Aviso de Privacidade.</p>
              
              <p>CANAL DE COMUNICAÇÃO</p>
              <p>Nós disponibilizamos um canal de comunicação para oferecer suporte ao titular de dados pessoais e quaisquer questões relacionadas a esse Aviso no Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>

              <p>O Z-PRO pode compartilhar os dados necessários para que seja possível a manutenção das suas operações de forma eficiente. Ou seja, dados poderão ser compartilhados com empresas contratadas para que as funcionalidades do Z-PRO estejam disponíveis e/ou para que forneçam uma melhor experiência para o Cliente e os Usuários.</p>
              <p>Terão acesso aos dados pessoais coletados para operação do Z-PRO, como Operadores de dados, os agentes terceirizados especializados para prestação de serviços pontuais e específicos para o nosso Software as a Service, tais como:</p>
              <ul>
                  <li>Plataforma Cloud Hetzner - servidores em nuvem - <a href="https://www.hetzner.com/legal/privacy-policy/">https://www.hetzner.com/legal/privacy-policy/</a></li>
                  <li>Plataforma WhatsApp - serviços de mensagens instantâneas - <a href="https://www.whatsapp.com/legal/">https://www.whatsapp.com/legal/</a></li>
                  <li>Plataforma Telegram - serviços de mensagens instantâneas - <a href="https://telegram.org/tos/br">https://telegram.org/tos/br</a></li>
              </ul>
              <p>No entanto, poderá ser que para utilização do Z-PRO o Cliente tenha que compartilhar dados pessoais com outros Controladores de dados, como as nossas parceiras:</p>
              <ul>
                  <li>Plataforma de Pagamento Hotmart - <a href="https://hotmart.com/pt-br/legal/privacidade-de-dados">https://hotmart.com/pt-br/legal/privacidade-de-dados</a></li>
                  <li>Plataforma de Pagamento Greenn - <a href="https://greenn.com.br/politica-de-privacidade-greenn/">https://greenn.com.br/politica-de-privacidade-greenn/</a></li>
              </ul>
              <p>Nesse caso, você precisa entender que essas plataformas poderão solicitar dados pessoais que não são armazenados no Z-PRO para cumprir suas próprias obrigações relacionadas ao Tratamento de Dados. Antes de aceitar qualquer tipo de termo ou política de privacidade, informe-se bem.</p>
              <p>Todas as nossas contratações prezam pelo tratamento seguro das informações do Cliente/Usuário.</p>
              <p>A partir do momento que esses terceiros tiverem acesso aos dados compartilhados, serão responsáveis pelo seu tratamento em segurança, estando limitados às finalidades relacionadas ao serviço contratado e devendo respeitar a Lei aplicável.</p>
              
              <p>Transferência Internacional de Dados</p>
              <p>Até o limite permitido pela LGPD, poderá haver o compartilhamento de dados fora do Brasil.</p>
              <p>Essa transferência internacional ocorre quando utilizamos serviços em nuvem para processamento ou armazenamento de dados, para que seja possível executar os nossos serviços da melhor forma em um ambiente seguro.</p>
              <p>Para isso, utiliza-se os servidores cloud da Hetzner, que implica em uma transferência internacional dos dados pessoais para o país sede deste servidor, nos Estados Unidos da América. Outros servidores da Z-PRO ficam em São Paulo/SP, no Brasil.</p>
              <p>Ao fazer isso, tomamos todas as medidas cabíveis para assegurar que os seus dados sejam tratados e compartilhados de forma segura e em conformidade com a legislação vigente e este Aviso de Privacidade.</p>
              
              <p>LINK PARA SITES/PLATAFORMAS DE TERCEIROS</p>
              <p>Nosso Site pode conter links para sites/plataformas de terceiros, como parceiros, anunciantes e redes sociais. Ao seguir um link, é importante observar que esses sites/plataformas têm seus próprios avisos e políticas de privacidade e que a nossa empresa não é responsável por esses avisos e nem pela coleta de dados realizada. Recomendamos a verificação desses avisos e políticas antes de enviar quaisquer dados pessoais a esses terceiros.</p>
              
              <p>COMO PROTEGEMOS SEUS DADOS</p>
              <p>O Z-PRO se compromete com a segurança de todos seus Usuários e por isso adota procedimentos físicos, eletrônicos e administrativos que garantem a privacidade e segurança dos seus dados, com medidas técnicas compatíveis com os padrões esperados e boas práticas de segurança da informação.</p>
              <p>Sempre que possível, não coletamos dados sobre a sua utilização do Z-PRO.</p>
              <p>Em hipótese alguma teremos acesso às suas conversas.</p>
              <p>Todas as tecnologias utilizadas e empregadas no Z-PRO respeitarão sempre a legislação vigente e os termos deste Aviso de Privacidade.</p>
              
              <p>SAIBA OS SEUS DIREITOS E COMO EXERCÊ-LOS</p>
              <p><strong>Acesso e confirmação de tratamento:</strong> Você pode solicitar o acesso à relação completa de dados coletados e tratados, bem como a confirmação do tratamento de seus dados pessoais.</p>
              <p><strong>Retirada de consentimento:</strong> Você poderá retirar a sua anuência com o Tratamento de Dados Pessoais a qualquer momento, quando esta for a base legal adequada para realização do tratamento dos seus dados pessoais.</p>
              <p><strong>Correção de dados pessoais:</strong> Você pode solicitar a correção de dados que estão incompletos, inexatos ou desatualizados.</p>
              <p><strong>Anonimização, bloqueio ou eliminação:</strong> Todos os dados coletados e tratados por nós têm como finalidade a prestação de serviços e o bom desempenho do Software as a Service. Caso você acredite que algum dado seu está sendo tratado de forma desnecessária, em excesso ou o tratamento não esteja em conformidade com a LGPD, você poderá solicitar a anonimização, bloqueio ou eliminação, caso prove que houve excesso, desnecessidade ou desconformidade com a LGPD.</p>
              <p><strong>Informação acerca do compartilhamento:</strong> Você pode solicitar informações sobre nossos parceiros e fornecedores com os quais compartilhamos os dados. Todos os nossos parceiros também estão preocupados com a segurança dos Usuários e garantem a adoção de medidas adequadas para a proteção de seus dados.</p>
              <p><strong>Decisões automatizadas:</strong> Você pode solicitar a revisão de decisões tomadas unicamente com base no tratamento automatizado de dados e os critérios utilizados nessas decisões, observados sempre os segredos comerciais e industriais da nossa empresa.</p>
              <p><strong>Portabilidade de dados:</strong> Você poderá solicitar a portabilidade dos seus dados pessoais a outro fornecedor de serviços, em atendimento ao disposto na LGPD.</p>
              <p><strong>Oposição ou objeção a Tratamento de Dados Pessoais:</strong> Se você quiser, pode objetar o tratamento de alguns Dados Pessoais que realizamos ou apresentar oposição ao tratamento por completo. Nesse caso, poderemos parar o tratamento ou explicar que temos uma base legal adequada para realizar os tratamentos questionados.</p>
              <p><strong>Registro de reclamação:</strong> Você poderá procurar a ANPD a qualquer momento, caso sinta que seus direitos foram violados.</p>
              <p>Para exercer qualquer um dos seus direitos como Titular, entre em contato através do Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>
              
              <p>POR QUANTO TEMPO ARMAZENAMOS SEUS DADOS?</p>
              <p>Os dados fornecidos pelo Cliente/Usuário serão armazenados e processados enquanto seu cadastro estiver ativo.</p>
              <p>Caso o Usuário desejar, pode solicitar a exclusão da sua conta e dos seus dados pessoais através do Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>
              <p>Diante da solicitação de exclusão ou término da finalidade de tratamento, o Usuário terá todos os seus dados deletados permanentemente, exceto os dados cuja manutenção seja obrigatória por lei ou regulamentação, ou em relação aos dados necessários para o exercício regular de direitos em processo judicial, administrativo ou arbitral.</p>
              
              <p>DISPOSIÇÕES GERAIS</p>
              <p>A qualquer momento, unilateralmente, poderemos modificar/atualizar este Aviso. Caso isso aconteça, o Titular será notificado e a versão atualizada valerá a partir de sua publicação.</p>
              <p>A continuidade de acesso ou utilização do Cliente/Usuário após divulgação da atualização confirmará a ciência e vigência do novo Aviso.</p>
              <p>Além deste Aviso de Privacidade, nós dispomos de Termos e Condições de Uso, os quais definem as condições de uso que irão disciplinar a utilização do Z-PRO. Os Termos abrangem inseparavelmente as disposições deste Aviso de Privacidade.</p>
              
              <p>CANAL DE COMUNICAÇÃO</p>
              <p>Nós disponibilizamos um canal de comunicação para oferecer suporte ao titular de dados pessoais e quaisquer questões relacionadas a esse Aviso no Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>

              <p>O Z-PRO pode compartilhar os dados necessários para que seja possível a manutenção das suas operações de forma eficiente. Ou seja, dados poderão ser compartilhados com empresas contratadas para que as funcionalidades do Z-PRO estejam disponíveis e/ou para que forneçam uma melhor experiência para o Cliente e os Usuários.</p>
              <p>Terão acesso aos dados pessoais coletados para operação do Z-PRO, como Operadores de dados, os agentes terceirizados especializados para prestação de serviços pontuais e específicos para o nosso Software as a Service, tais como:</p>
              <ul>
                  <li>Plataforma Cloud Hetzner - servidores em nuvem - <a href="https://www.hetzner.com/legal/privacy-policy/">https://www.hetzner.com/legal/privacy-policy/</a></li>
                  <li>Plataforma WhatsApp - serviços de mensagens instantâneas - <a href="https://www.whatsapp.com/legal/">https://www.whatsapp.com/legal/</a></li>
                  <li>Plataforma Telegram - serviços de mensagens instantâneas - <a href="https://telegram.org/tos/br">https://telegram.org/tos/br</a></li>
              </ul>
              <p>No entanto, poderá ser que para utilização do Z-PRO o Cliente tenha que compartilhar dados pessoais com outros Controladores de dados, como as nossas parceiras:</p>
              <ul>
                  <li>Plataforma de Pagamento Hotmart - <a href="https://hotmart.com/pt-br/legal/privacidade-de-dados">https://hotmart.com/pt-br/legal/privacidade-de-dados</a></li>
                  <li>Plataforma de Pagamento Greenn - <a href="https://greenn.com.br/politica-de-privacidade-greenn/">https://greenn.com.br/politica-de-privacidade-greenn/</a></li>
              </ul>
              <p>Nesse caso, você precisa entender que essas plataformas poderão solicitar dados pessoais que não são armazenados no Z-PRO para cumprir suas próprias obrigações relacionadas ao Tratamento de Dados. Antes de aceitar qualquer tipo de termo ou política de privacidade, informe-se bem.</p>
              <p>Todas as nossas contratações prezam pelo tratamento seguro das informações do Cliente/Usuário.</p>
              <p>A partir do momento que esses terceiros tiverem acesso aos dados compartilhados, serão responsáveis pelo seu tratamento em segurança, estando limitados às finalidades relacionadas ao serviço contratado e devendo respeitar a Lei aplicável.</p>
              
              <p>Transferência Internacional de Dados</p>
              <p>Até o limite permitido pela LGPD, poderá haver o compartilhamento de dados fora do Brasil.</p>
              <p>Essa transferência internacional ocorre quando utilizamos serviços em nuvem para processamento ou armazenamento de dados, para que seja possível executar os nossos serviços da melhor forma em um ambiente seguro.</p>
              <p>Para isso, utiliza-se os servidores cloud da Hetzner, que implica em uma transferência internacional dos dados pessoais para o país sede deste servidor, nos Estados Unidos da América. Outros servidores da Z-PRO ficam em São Paulo/SP, no Brasil.</p>
              <p>Ao fazer isso, tomamos todas as medidas cabíveis para assegurar que os seus dados sejam tratados e compartilhados de forma segura e em conformidade com a legislação vigente e este Aviso de Privacidade.</p>
              
              <p>LINK PARA SITES/PLATAFORMAS DE TERCEIROS</p>
              <p>Nosso Site pode conter links para sites/plataformas de terceiros, como parceiros, anunciantes e redes sociais. Ao seguir um link, é importante observar que esses sites/plataformas têm seus próprios avisos e políticas de privacidade e que a nossa empresa não é responsável por esses avisos e nem pela coleta de dados realizada. Recomendamos a verificação desses avisos e políticas antes de enviar quaisquer dados pessoais a esses terceiros.</p>
              
              <p>COMO PROTEGEMOS SEUS DADOS</p>
              <p>O Z-PRO se compromete com a segurança de todos seus Usuários e por isso adota procedimentos físicos, eletrônicos e administrativos que garantem a privacidade e segurança dos seus dados, com medidas técnicas compatíveis com os padrões esperados e boas práticas de segurança da informação.</p>
              <p>Sempre que possível, não coletamos dados sobre a sua utilização do Z-PRO.</p>
              <p>Em hipótese alguma teremos acesso às suas conversas.</p>
              <p>Todas as tecnologias utilizadas e empregadas no Z-PRO respeitarão sempre a legislação vigente e os termos deste Aviso de Privacidade.</p>
              
              <p>SAIBA OS SEUS DIREITOS E COMO EXERCÊ-LOS</p>
              <p><strong>Acesso e confirmação de tratamento:</strong> Você pode solicitar o acesso à relação completa de dados coletados e tratados, bem como a confirmação do tratamento de seus dados pessoais.</p>
              <p><strong>Retirada de consentimento:</strong> Você poderá retirar a sua anuência com o Tratamento de Dados Pessoais a qualquer momento, quando esta for a base legal adequada para realização do tratamento dos seus dados pessoais.</p>
              <p><strong>Correção de dados pessoais:</strong> Você pode solicitar a correção de dados que estão incompletos, inexatos ou desatualizados.</p>
              <p><strong>Anonimização, bloqueio ou eliminação:</strong> Todos os dados coletados e tratados por nós têm como finalidade a prestação de serviços e o bom desempenho do Software as a Service. Caso você acredite que algum dado seu está sendo tratado de forma desnecessária, em excesso ou o tratamento não esteja em conformidade com a LGPD, você poderá solicitar a anonimização, bloqueio ou eliminação, caso prove que houve excesso, desnecessidade ou desconformidade com a LGPD.</p>
              <p><strong>Informação acerca do compartilhamento:</strong> Você pode solicitar informações sobre nossos parceiros e fornecedores com os quais compartilhamos os dados. Todos os nossos parceiros também estão preocupados com a segurança dos Usuários e garantem a adoção de medidas adequadas para a proteção de seus dados.</p>
              <p><strong>Decisões automatizadas:</strong> Você pode solicitar a revisão de decisões tomadas unicamente com base no tratamento automatizado de dados e os critérios utilizados nessas decisões, observados sempre os segredos comerciais e industriais da nossa empresa.</p>
              <p><strong>Portabilidade de dados:</strong> Você poderá solicitar a portabilidade dos seus dados pessoais a outro fornecedor de serviços, em atendimento ao disposto na LGPD.</p>
              <p><strong>Oposição ou objeção a Tratamento de Dados Pessoais:</strong> Se você quiser, pode objetar o tratamento de alguns Dados Pessoais que realizamos ou apresentar oposição ao tratamento por completo. Nesse caso, poderemos parar o tratamento ou explicar que temos uma base legal adequada para realizar os tratamentos questionados.</p>
              <p><strong>Registro de reclamação:</strong> Você poderá procurar a ANPD a qualquer momento, caso sinta que seus direitos foram violados.</p>
              <p>Para exercer qualquer um dos seus direitos como Titular, entre em contato através do Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>
              
              <p>POR QUANTO TEMPO ARMAZENAMOS SEUS DADOS?</p>
              <p>Os dados fornecidos pelo Cliente/Usuário serão armazenados e processados enquanto seu cadastro estiver ativo.</p>
              <p>Caso o Usuário desejar, pode solicitar a exclusão da sua conta e dos seus dados pessoais através do Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>
              <p>Diante da solicitação de exclusão ou término da finalidade de tratamento, o Usuário terá todos os seus dados deletados permanentemente, exceto os dados cuja manutenção seja obrigatória por lei ou regulamentação, ou em relação aos dados necessários para o exercício regular de direitos em processo judicial, administrativo ou arbitral.</p>
              
              <p>DISPOSIÇÕES GERAIS</p>
              <p>A qualquer momento, unilateralmente, poderemos modificar/atualizar este Aviso. Caso isso aconteça, o Titular será notificado e a versão atualizada valerá a partir de sua publicação.</p>
              <p>A continuidade de acesso ou utilização do Cliente/Usuário após divulgação da atualização confirmará a ciência e vigência do novo Aviso.</p>
              <p>Além deste Aviso de Privacidade, nós dispomos de Termos e Condições de Uso, os quais definem as condições de uso que irão disciplinar a utilização do Z-PRO. Os Termos abrangem inseparavelmente as disposições deste Aviso de Privacidade.</p>
              
              <p>CANAL DE COMUNICAÇÃO</p>
              <p>Nós disponibilizamos um canal de comunicação para oferecer suporte ao titular de dados pessoais e quaisquer questões relacionadas a esse Aviso no Canal de Atendimento | <a href="https://comunidadezdg.com.br/fale-com-a-zdg">https://comunidadezdg.com.br/fale-com-a-zdg</a> ou <a href="mailto:comunidadezdg@gmail.com">comunidadezdg@gmail.com</a>.</p>

            </div>
          </q-tab-panel>
        </q-tab-panels>

        <q-card-actions align="center">
          <q-btn label="Eu li e concordo com os termos de uso e política de privacidade" @click="aceitar" color="primary" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import packageEnv from 'src/../package.json'
export default {
    props: ['show'],
    data() {
      return {
        activeTab: 'termos'
      };
    },
    methods: {
        onDialogUpdate (val) {
          if (val === false) this.$emit('close')
        },
        close() {
            this.$emit('close');
        },
        aceitar() {
            this.$emit('aceitar');
        }
    },
    computed: {
        cVersion () {
            return packageEnv.version
        }
    }
}
</script>
  
<style lang="scss" scoped>
.contract-content {
  text-align: justify;
  padding: 16px;
}

.active-tab {
  background-color: var(--q-primary) !important;
  color: white !important;
}

.inactive-tab {
  background-color: #f0f0f0 !important;
  color: #333 !important;
}

.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: flex-end;
    align-items: center;
    margin-right: 20px; 
}

.modal-content {
    background: white;
    padding: 20px;
    border-radius: 5px;
    width: 67%; 
    max-height: 90%; 
    position: relative;
    display: flex;
    flex-direction: column;
    margin-right: 20px; 
}

.contract-content {
    overflow-y: scroll;
    height: 300px; 
    margin-bottom: 20px;
    border: 1px solid #ccc; 
    padding: 10px;
    text-align: left;
}

button {
    margin-top: auto; 
}
</style>
