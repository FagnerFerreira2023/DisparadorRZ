(function () {
  const API = '';

  // --- AUTHENTICATION HELPERS ---

  function getAccessToken() {
    return localStorage.getItem('rz_access_token');
  }

  function getRefreshToken() {
    return localStorage.getItem('rz_refresh_token');
  }

  function getUser() {
    try {
      return JSON.parse(localStorage.getItem('rz_user'));
    } catch {
      return null;
    }
  }

  async function refreshToken() {
    const rt = getRefreshToken();
    if (!rt) return false;

    try {
      const res = await fetch(`${API}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt })
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        localStorage.setItem('rz_access_token', data.accessToken);
        return true;
      }
    } catch (err) {
      console.error('Refresh token error:', err);
    }
    return false;
  }

  function logout() {
    localStorage.removeItem('rz_access_token');
    localStorage.removeItem('rz_refresh_token');
    localStorage.removeItem('rz_user');
    window.location.href = '/login.html';
  }

  // Wrapper for fetch to handle auth and refresh
  async function apiFetch(url, options = {}) {
    let token = getAccessToken();
    if (!token) {
      logout();
      return;
    }

    options.headers = options.headers || {};
    options.headers['Authorization'] = `Bearer ${token}`;
    options.headers['Content-Type'] = 'application/json';

    let response = await fetch(`${API}${url}`, options);

    if (response.status === 401) {
      // Try refresh
      const refreshed = await refreshToken();
      if (refreshed) {
        token = getAccessToken();
        options.headers['Authorization'] = `Bearer ${token}`;
        response = await fetch(`${API}${url}`, options);
      } else {
        logout();
        return;
      }
    }

    return response;
  }

  // Check login on start
  const user = getUser();
  if (!user || !getAccessToken()) {
    window.location.href = '/login.html';
    return;
  }

  // Populate UI with user info
  function initUI() {
    const userProfile = document.getElementById('userProfile');
    const userNameEl = document.getElementById('userName');
    const tenantBadge = document.getElementById('tenantBadge');
    const tenantNameEl = document.getElementById('tenantName');
    const logoutBtn = document.getElementById('btnLogout');

    if (userProfile && user) {
      userNameEl.textContent = user.name;
      userProfile.classList.remove('hidden');
    }

    if (tenantBadge && user.tenantId) {
      // In a real app, we might fetch tenant info, but let's use the ID for now or a placeholder
      tenantNameEl.textContent = user.tenantId.substring(0, 8); // Simple ID preview
      tenantBadge.classList.remove('hidden');

      // Fetch full me info to get tenant name
      apiFetch('/auth/me').then(res => res.json()).then(data => {
        if (data.ok && data.tenant) {
          tenantNameEl.textContent = data.tenant.name;
        }
      });
    }

    logoutBtn.addEventListener('click', logout);
  }

  // --- EXISTING LOGIC ADAPTED ---

  function show(el, visible) {
    if (el) el.classList.toggle('hidden', !visible);
  }

  // --- MODAL HELPERS ---
  function setupModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return null;
    const closeBtns = modal.querySelectorAll('[data-close]');
    closeBtns.forEach(b => b.onclick = () => modal.classList.remove('active'));
    window.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
    return {
      show: () => modal.classList.add('active'),
      hide: () => modal.classList.remove('active'),
      element: modal
    };
  }

  // Tabs
  document.querySelectorAll('.tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
      document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(tab.getAttribute('data-tab'));
      if (target) target.classList.add('active');
    });
  });

  // Tipo de disparo
  const dispatchForms = {
    menu: document.getElementById('formMenu'),
    buttons: document.getElementById('formButtons'),
    interactive: document.getElementById('formInteractive'),
    list: document.getElementById('formList'),
    poll: document.getElementById('formPoll'),
    carousel: document.getElementById('formCarousel'),
  };

  const dispatchTypeSelect = document.getElementById('dispatchType');
  if (dispatchTypeSelect) {
    dispatchTypeSelect.addEventListener('change', () => {
      const type = dispatchTypeSelect.value;
      Object.values(dispatchForms).forEach((f) => f && f.classList.add('hidden'));
      if (dispatchForms[type]) dispatchForms[type].classList.remove('hidden');
      if (type === 'list' && !document.getElementById('listSectionsList').querySelector('.block-section')) addListSection();
      if (type === 'carousel' && !document.getElementById('carouselCardsList').querySelector('.block-section')) addCarouselCard();
    });
    if (dispatchForms.menu) dispatchForms.menu.classList.remove('hidden');
  }

  let connectingInstanceName = null;

  // --- Conexões: listar salvas e conectar ao clicar ---
  function renderSavedList(saved, instances = []) {
    const ul = document.getElementById('savedList');
    if (!ul) return;

    const connectedNames = new Set(
      (instances || [])
        .filter((instance) => instance.status === 'connected')
        .map((instance) => instance.instance)
    );

    if (!saved || saved.length === 0) {
      ul.innerHTML = '<li class="text-muted">Nenhuma conexão salva. Conecte uma vez por nome e ela aparecerá aqui.</li>';
      return;
    }

    ul.innerHTML = saved
      .map(
        (name) => {
          const isConnected = connectedNames.has(name);
          return `<li class="saved-item-row">
            <span class="instance-name">${name}</span>
            <div class="saved-item-actions">
              ${isConnected
                ? '<span class="badge connected">Conectado</span>'
                : `<button type="button" class="btn btn-primary btn-connect-saved" data-connect-name="${name}">Conectar</button>`}
              <button type="button" class="btn btn-small btn-danger" data-delete-saved-name="${name}" title="Excluir sessão salva (será necessário novo QR para conectar)">Deletar</button>
            </div>
          </li>`
        }
      )
      .join('');

    ul.querySelectorAll('[data-connect-name]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-connect-name');
        const select = document.getElementById('connectInstanceSelect');
        const nameInput = document.getElementById('instanceName');
        const nameRow = document.getElementById('connectNewNameRow');

        if (select) select.value = name;
        if (nameInput) nameInput.value = name;
        if (nameRow) nameRow.style.display = 'none';
        doConnect(name);
      });
    });

    ul.querySelectorAll('[data-delete-saved-name]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const name = btn.getAttribute('data-delete-saved-name');
        if (!name || !confirm(`Excluir a conexão salva "${name}"? Será necessário escanear o QR de novo para conectar.`)) return;
        try {
          const res = await apiFetch(`/v1/instances/${encodeURIComponent(name)}/logout`, {
            method: 'POST'
          });
          const data = await res.json();
          if (data.ok) refreshInstanceList();
        } catch (_) {
          refreshInstanceList();
        }
      });
    });
  }

  async function doConnect(name) {
    connectingInstanceName = name;
    const statusEl = document.getElementById('connectStatus');
    const qrContainer = document.getElementById('qrContainer');
    const qrImage = document.getElementById('qrImage');

    show(statusEl, false);

    try {
      const res = await apiFetch('/v1/instances', {
        method: 'POST',
        body: JSON.stringify({ instance: name }),
      });
      const data = await res.json();

      if (!res.ok) {
        statusEl.textContent = data.error || 'Erro ao conectar';
        statusEl.className = 'status error';
        show(statusEl, true);
        connectingInstanceName = null;
        return;
      }

      if (data.qr) {
        qrImage.src = data.qr;
        show(qrContainer, true);
        statusEl.textContent = 'Escaneie o QR no WhatsApp.';
        statusEl.className = 'status success';
      } else if (data.status === 'connected') {
        show(qrContainer, false);
        statusEl.textContent = 'Conectado.';
        statusEl.className = 'status success';
        connectingInstanceName = null;
      } else {
        statusEl.textContent = 'Aguardando QR...';
        statusEl.className = 'status';
        show(qrContainer, false);
      }
      show(statusEl, true);
      refreshInstanceList();
    } catch (e) {
      statusEl.textContent = e.message || 'Erro de rede';
      statusEl.className = 'status error';
      show(statusEl, true);
      connectingInstanceName = null;
    }
  }

  const connectInstanceSelect = document.getElementById('connectInstanceSelect');
  const connectNewNameRow = document.getElementById('connectNewNameRow');

  if (connectInstanceSelect) {
    connectInstanceSelect.addEventListener('change', () => {
      const isNew = connectInstanceSelect.value === '';
      connectNewNameRow.style.display = isNew ? '' : 'none';
    });
  }

  const btnConnect = document.getElementById('btnConnect');
  if (btnConnect) {
    btnConnect.addEventListener('click', () => {
      const selected = connectInstanceSelect.value;
      const name = selected ? selected : (document.getElementById('instanceName').value.trim() || 'main');
      doConnect(name);
    });
  }

  function renderInstanceList(list) {
    const ul = document.getElementById('instanceList');
    if (!ul) return;

    if (!list.length) {
      ul.innerHTML = '<li>Nenhuma instância ativa.</li>';
      return;
    }

    ul.innerHTML = list
      .map(
        (i) =>
          `<li class="instance-row">
            <span class="instance-name">${i.instance}</span>
            <span class="badge ${i.status}">${i.status}</span>
            <div class="instance-actions">
              ${i.status === 'qr' ? `<button type="button" class="btn btn-small btn-ghost" data-action="qr" data-name="${i.instance}">Ver QR</button>` : ''}
              ${i.status === 'connected' ? `<button type="button" class="btn btn-small btn-ghost" data-action="disconnect" data-name="${i.instance}">Desconectar</button>` : ''}
              <button type="button" class="btn btn-small btn-ghost" data-action="logout" data-name="${i.instance}" title="Novo QR na próxima conexão">Novo QR</button>
              <button type="button" class="btn btn-small btn-danger" data-action="delete" data-name="${i.instance}">Deletar</button>
            </div>
          </li>`
      )
      .join('');

    ul.querySelectorAll('[data-action]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const action = btn.getAttribute('data-action');
        const name = btn.getAttribute('data-name');
        if (!name) return;

        const base = `/v1/instances/${encodeURIComponent(name)}`;
        try {
          if (action === 'qr') {
            const res = await apiFetch(`${base}/qr`);
            const data = await res.json();
            if (data.qr) {
              document.getElementById('qrImage').src = data.qr;
              document.getElementById('instanceName').value = name;
              show(document.getElementById('qrContainer'), true);
              show(document.getElementById('connectStatus'), false);
            }
          } else if (action === 'disconnect') {
            await apiFetch(`${base}/disconnect`, { method: 'POST' });
            refreshInstanceList();
          } else if (action === 'logout') {
            await apiFetch(`${base}/logout`, { method: 'POST' });
            refreshInstanceList();
          } else if (action === 'delete') {
            await apiFetch(base, { method: 'DELETE' });
            refreshInstanceList();
          }
        } catch (_) { }
      });
    });
  }

  function updateConnectSelect(saved) {
    const sel = document.getElementById('connectInstanceSelect');
    if (!sel) return;

    const current = sel.value;
    sel.innerHTML = '<option value="">— Nova conexão —</option>' +
      (saved || []).map((n) => `<option value="${n}" ${n === current ? 'selected' : ''}>${n}</option>`).join('');

    if (connectNewNameRow) {
      connectNewNameRow.style.display = sel.value === '' ? '' : 'none';
    }
  }

  async function refreshInstanceList() {
    const statusEl = document.getElementById('connectStatus');
    const qrContainer = document.getElementById('qrContainer');
    const qrImage = document.getElementById('qrImage');

    try {
      const res = await apiFetch('/v1/instances');
      if (!res) return;

      const data = await res.json();

      if (data.saved) {
        renderSavedList(data.saved, data.instances || []);
        updateConnectSelect(data.saved);
      } else {
        renderSavedList([], data.instances || []);
        updateConnectSelect([]);
      }

      if (data.instances) {
        renderInstanceList(data.instances);
        const sel = document.getElementById('dispatchInstance');
        if (sel) {
          const current = sel.value;
          const names = [...new Set([...data.instances.map((i) => i.instance), ...(data.saved || [])])];
          sel.innerHTML = names.map((n) => `<option value="${n}" ${n === current ? 'selected' : ''}>${n}</option>`).join('');
          if (!names.includes(current)) sel.selectedIndex = 0;
        }

        if (connectingInstanceName) {
          const inst = data.instances.find((i) => i.instance === connectingInstanceName);
          if (inst) {
            if (inst.status === 'qr') {
              try {
                const qrRes = await apiFetch(`/v1/instances/${encodeURIComponent(connectingInstanceName)}/qr`);
                const qrData = await qrRes.json();
                if (qrData.qr) {
                  qrImage.src = qrData.qr;
                  show(qrContainer, true);
                  statusEl.textContent = 'Escaneie o QR no WhatsApp.';
                  statusEl.className = 'status success';
                  show(statusEl, true);
                }
              } catch (_) { }
            } else if (inst.status === 'connected') {
              show(qrContainer, false);
              statusEl.textContent = 'Conectado.';
              statusEl.className = 'status success';
              show(statusEl, true);
              connectingInstanceName = null;
            } else if (inst.status === 'disconnected') {
              statusEl.textContent = 'Desconectado. Clique em Conectar novamente.';
              statusEl.className = 'status error';
              show(statusEl, true);
            }
          }
        }
      }
    } catch (_) {
      renderSavedList([], []);
      renderInstanceList([]);
      updateConnectSelect([]);
    }
  }

  // Polling
  setInterval(() => {
    const panel = document.getElementById('conexoes');
    if (panel && panel.classList.contains('active')) {
      refreshInstanceList();
    }
  }, 3000);

  // --- Dynamic Rows ---
  function addRow(containerId, html, removeClass) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const div = document.createElement('div');
    div.className = removeClass || 'item-row';
    div.innerHTML = html + (removeClass ? '' : ' <button type="button" class="btn btn-small btn-ghost btn-remove">Remover</button>');
    const removeBtn = div.querySelector('.btn-remove');
    if (removeBtn) removeBtn.addEventListener('click', () => div.remove());
    container.appendChild(div);
  }

  function addMenuOption() { addRow('menuOptionsList', '<input type="text" placeholder="Texto da opção" data-field="opt">'); }
  function addButtonRow() { addRow('buttonsList', '<input type="text" placeholder="ID do botão" data-field="id"><input type="text" placeholder="Texto do botão" data-field="text">'); }
  function addInteractiveRow() {
    addRow('interactiveList', `<select data-field="type"><option value="url">URL</option><option value="copy">Copiar</option><option value="call">Ligar</option></select><input type="text" placeholder="Texto do botão" data-field="text"><input type="text" placeholder="URL / Código / Telefone" data-field="extra">`);
  }
  function addPollOption() { addRow('pollOptionsList', '<input type="text" placeholder="Opção" data-field="opt">'); }

  function addListSection() {
    const container = document.getElementById('listSectionsList');
    if (!container) return;
    const block = document.createElement('div');
    block.className = 'block-section';
    block.innerHTML = `<div class="block-title">Seção</div><input type="text" class="section-title" placeholder="Título da seção"><div class="sub-list section-rows"></div><button type="button" class="btn btn-small btn-ghost add-row-in-section">+ Adicionar item</button><button type="button" class="btn btn-small btn-danger btn-remove-block">Remover seção</button>`;
    block.querySelector('.add-row-in-section').addEventListener('click', () => {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `<input type="text" placeholder="ID" data-field="id"><input type="text" placeholder="Título" data-field="title"><input type="text" placeholder="Descrição" data-field="desc"><button type="button" class="btn btn-small btn-ghost btn-remove">Remover</button>`;
      row.querySelector('.btn-remove').onclick = () => row.remove();
      block.querySelector('.section-rows').appendChild(row);
    });
    block.querySelector('.btn-remove-block').onclick = () => block.remove();
    container.appendChild(block);
  }

  function addCarouselCard() {
    const container = document.getElementById('carouselCardsList');
    if (!container) return;
    const block = document.createElement('div');
    block.className = 'block-section';
    block.innerHTML = `<div class="block-title">Card</div><div class="form-row"><input type="text" placeholder="Título" data-field="title"></div><div class="form-row"><input type="text" placeholder="Corpo" data-field="body"></div><div class="form-row"><input type="text" placeholder="Rodapé" data-field="footer"></div><div class="form-row"><input type="text" placeholder="URL imagem" data-field="imageUrl"></div><div class="sub-list card-buttons"></div><button type="button" class="btn btn-small btn-ghost add-card-btn">+ Botão</button><button type="button" class="btn btn-small btn-danger btn-remove-block">Remover card</button>`;
    block.querySelector('.add-card-btn').onclick = () => {
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `<input type="text" placeholder="ID" data-field="id"><input type="text" placeholder="Texto" data-field="text"><button type="button" class="btn btn-small btn-ghost btn-remove">Remover</button>`;
      row.querySelector('.btn-remove').onclick = () => row.remove();
      block.querySelector('.card-buttons').appendChild(row);
    };
    block.querySelector('.btn-remove-block').onclick = () => block.remove();
    container.appendChild(block);
  }

  document.querySelectorAll('.add-item').forEach(btn => {
    btn.onclick = () => {
      const fid = btn.getAttribute('data-for');
      if (fid === 'menuOptions') addMenuOption();
      else if (fid === 'buttons') addButtonRow();
      else if (fid === 'interactive') addInteractiveRow();
      else if (fid === 'listSections') addListSection();
      else if (fid === 'pollOptions') addPollOption();
      else if (fid === 'carouselCards') addCarouselCard();
    };
  });

  // Initial rows
  if (document.getElementById('conexoes')) {
    addMenuOption(); addButtonRow(); addInteractiveRow(); addPollOption();
  }

  function normalizePhone(phone) {
    let clean = String(phone || '').replace(/\D/g, '');
    if (clean.startsWith('0')) clean = clean.replace(/^0+/, '');
    if (clean && !clean.startsWith('55')) clean = `55${clean}`;
    return clean;
  }

  function validatePhone(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 20;
  }

  function dedupe(items) {
    const seen = new Set();
    const unique = [];
    for (const item of items) {
      if (!seen.has(item)) {
        seen.add(item);
        unique.push(item);
      }
    }
    return unique;
  }

  function dedupeRecipients(recipients) {
    const byPhone = new Map();
    let duplicatesRemoved = 0;

    for (const recipient of recipients) {
      const existing = byPhone.get(recipient.to);
      if (!existing) {
        byPhone.set(recipient.to, recipient);
        continue;
      }

      duplicatesRemoved++;
      byPhone.set(recipient.to, {
        to: recipient.to,
        var1: existing.var1 || recipient.var1 || '',
        var2: existing.var2 || recipient.var2 || '',
      });
    }

    return {
      recipients: Array.from(byPhone.values()),
      duplicatesRemoved,
    };
  }

  function formatRecipientLine(recipient) {
    const parts = [recipient.to];
    if (recipient.var1) parts.push(String(recipient.var1).trim());
    if (recipient.var2) parts.push(String(recipient.var2).trim());
    return parts.join(',');
  }

  function applyTemplateVarsInPayload(value, vars) {
    if (typeof value === 'string') {
      const normalizedVars = Object.fromEntries(
        Object.entries(vars || {}).map(([key, val]) => [String(key).toLowerCase(), String(val ?? '')])
      );

      return value.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_full, key) => {
        const lookup = String(key || '').toLowerCase();
        return normalizedVars[lookup] ?? '';
      });
    }

    if (Array.isArray(value)) {
      return value.map((item) => applyTemplateVarsInPayload(item, vars));
    }

    if (value && typeof value === 'object') {
      const result = {};
      Object.entries(value).forEach(([key, item]) => {
        result[key] = applyTemplateVarsInPayload(item, vars);
      });
      return result;
    }

    return value;
  }

  function parseRecipientLines(rawText) {
    const lines = String(rawText || '')
      .replace(/\r/g, '')
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const recipients = [];
    let invalidCount = 0;

    const pushRecipient = (rawPhone, var1 = '', var2 = '') => {
      const to = normalizePhone(rawPhone);
      if (!validatePhone(to)) {
        invalidCount++;
        return;
      }
      recipients.push({ to, var1: String(var1 || '').trim(), var2: String(var2 || '').trim() });
    };

    for (const line of lines) {
      const bareTokens = line
        .split(/[;,]/)
        .map((token) => token.trim())
        .filter(Boolean);

      const allBareNumbers = bareTokens.length > 1 && bareTokens.every((token) => token.replace(/\D/g, '').length >= 8);
      if (allBareNumbers) {
        bareTokens.forEach((token) => pushRecipient(token));
        continue;
      }

      const delimiter = line.includes(';') ? ';' : ',';
      const columns = splitCsvLine(line, delimiter);
      const rawPhone = columns[0] || '';
      const var1 = columns[1] || '';
      const var2 = columns[2] || '';

      if (!rawPhone) {
        invalidCount++;
        continue;
      }

      pushRecipient(rawPhone, var1, var2);
    }

    const deduped = dedupeRecipients(recipients);
    return {
      recipients: deduped.recipients,
      invalidCount,
      duplicatesRemoved: deduped.duplicatesRemoved,
    };
  }

  function splitCsvLine(line, delimiter) {
    const cells = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const next = line[i + 1];

      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === delimiter && !inQuotes) {
        cells.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    cells.push(current.trim());
    return cells;
  }

  function parseCsvDestinatarios(csvContent) {
    const rowsRaw = String(csvContent || '')
      .replace(/^\uFEFF/, '')
      .replace(/\r/g, '')
      .split('\n')
      .filter((line) => line.trim().length > 0);

    if (!rowsRaw.length) {
      return { recipients: [], invalidCount: 0, duplicatesRemoved: 0 };
    }

    const delimiterScore = {
      ',': rowsRaw[0].split(',').length,
      ';': rowsRaw[0].split(';').length,
      '\t': rowsRaw[0].split('\t').length,
    };

    const delimiter = Object.entries(delimiterScore)
      .sort((a, b) => b[1] - a[1])[0][0];

    const rows = rowsRaw.map((line) => splitCsvLine(line, delimiter));
    const headerCandidates = ['numero', 'telefone', 'phone', 'whatsapp'];

    const firstRowNormalized = rows[0].map((cell) => cell.trim().toLowerCase());
    const phoneColumnIndex = firstRowNormalized.findIndex((cell) => headerCandidates.includes(cell));
    const hasHeader = phoneColumnIndex >= 0;
    const startIndex = hasHeader ? 1 : 0;

    let var1ColumnIndex = -1;
    let var2ColumnIndex = -1;

    if (hasHeader) {
      const var1Candidates = ['var1', 'nome', 'name'];
      const var2Candidates = ['var2', 'sobrenome', 'lastname', 'extra'];
      var1ColumnIndex = firstRowNormalized.findIndex((cell, index) => index !== phoneColumnIndex && var1Candidates.includes(cell));
      var2ColumnIndex = firstRowNormalized.findIndex((cell, index) => index !== phoneColumnIndex && var2Candidates.includes(cell));

      const otherIndexes = firstRowNormalized
        .map((_, index) => index)
        .filter((index) => index !== phoneColumnIndex);

      if (var1ColumnIndex < 0 && otherIndexes.length > 0) var1ColumnIndex = otherIndexes[0];
      if (var2ColumnIndex < 0 && otherIndexes.length > 1) var2ColumnIndex = otherIndexes[1];
    }

    const extracted = [];
    let invalidCount = 0;

    const looksLikePhone = (value) => String(value || '').replace(/\D/g, '').length >= 8;

    for (let rowIndex = startIndex; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      if (!row || !row.length) continue;

      let rawValue = '';
      if (hasHeader) {
        rawValue = row[phoneColumnIndex] || '';
      } else {
        rawValue = row[0] || '';
        if (!looksLikePhone(rawValue)) {
          const fallback = row.find((cell) => looksLikePhone(cell));
          if (fallback) rawValue = fallback;
        }
      }

      if (!rawValue || !looksLikePhone(rawValue)) continue;

      const normalized = normalizePhone(rawValue);
      if (!validatePhone(normalized)) {
        invalidCount++;
        continue;
      }

      let var1 = '';
      let var2 = '';

      if (hasHeader) {
        if (var1ColumnIndex >= 0) var1 = row[var1ColumnIndex] || '';
        if (var2ColumnIndex >= 0) var2 = row[var2ColumnIndex] || '';
      } else {
        var1 = row[1] || '';
        var2 = row[2] || '';
      }

      extracted.push({
        to: normalized,
        var1: String(var1 || '').trim(),
        var2: String(var2 || '').trim(),
      });
    }

    const deduped = dedupeRecipients(extracted);

    return {
      recipients: deduped.recipients,
      invalidCount,
      duplicatesRemoved: deduped.duplicatesRemoved,
    };
  }

  function showDispatchCsvFeedback(message, type) {
    const feedbackEl = document.getElementById('dispatchCsvFeedback');
    if (!feedbackEl) return;
    feedbackEl.textContent = message;
    feedbackEl.classList.remove('hidden', 'success', 'error', 'info');
    feedbackEl.classList.add(type || 'info');
  }

  function askCsvImportMode() {
    return new Promise((resolve) => {
      const modalApi = setupModal('modalCsvImportChoice');
      const modalEl = document.getElementById('modalCsvImportChoice');
      const btnReplace = document.getElementById('btnCsvReplace');
      const btnAppend = document.getElementById('btnCsvAppend');
      const btnCancel = document.getElementById('btnCsvCancel');

      if (!modalApi || !modalEl || !btnReplace || !btnAppend || !btnCancel) {
        const fallback = window.confirm('Substituir a lista atual?\nOK = Substituir | Cancelar = Adicionar ao final');
        resolve(fallback ? 'replace' : 'append');
        return;
      }

      let resolved = false;
      const finish = (choice) => {
        if (resolved) return;
        resolved = true;
        modalApi.hide();
        resolve(choice);
      };

      btnReplace.onclick = () => finish('replace');
      btnAppend.onclick = () => finish('append');
      btnCancel.onclick = () => finish('cancel');

      modalEl.querySelectorAll('[data-close]').forEach((btn) => {
        btn.onclick = () => finish('cancel');
      });

      modalApi.show();
    });
  }

  function downloadCsvModel() {
    const content = [
      'telefone,nome',
      '5511999999999,João',
      '5511988887777,Maria',
    ].join('\n');

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'modelo-destinatarios.csv';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  }

  async function handleCsvImport(file) {
    if (!file) return;

    const textarea = document.getElementById('dispatchTo');
    if (!textarea) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const parsed = parseCsvDestinatarios(reader.result || '');
      if (!parsed.recipients.length && parsed.invalidCount === 0) {
        showDispatchCsvFeedback('Nenhum número encontrado no CSV.', 'error');
        return;
      }

      const existingParsed = parseRecipientLines(textarea.value);
      const existingRecipients = existingParsed.recipients;
      const existingLines = existingRecipients.map((recipient) => formatRecipientLine(recipient));

      let mode = 'replace';
      if (existingLines.length > 0) {
        mode = await askCsvImportMode();
      }

      if (mode === 'cancel') {
        showDispatchCsvFeedback('Importação cancelada.', 'info');
        return;
      }

      let finalLines = [];
      let importedCount = 0;
      let duplicatesRemovedTotal = parsed.duplicatesRemoved;

      if (mode === 'append') {
        const existingByPhone = new Set(existingRecipients.map((recipient) => recipient.to));
        const newRecipients = parsed.recipients.filter((recipient) => !existingByPhone.has(recipient.to));
        duplicatesRemovedTotal += parsed.recipients.length - newRecipients.length;
        finalLines = [...existingLines, ...newRecipients.map((recipient) => formatRecipientLine(recipient))];
        importedCount = newRecipients.length;
      } else {
        finalLines = parsed.recipients.map((recipient) => formatRecipientLine(recipient));
        importedCount = parsed.recipients.length;
      }

      textarea.value = finalLines.join('\n');

      showDispatchCsvFeedback(
        `${importedCount} números importados • ${parsed.invalidCount} inválidos • ${duplicatesRemovedTotal} duplicados removidos`,
        parsed.invalidCount > 0 ? 'error' : 'success'
      );
    };

    reader.onerror = () => {
      showDispatchCsvFeedback('Erro ao ler arquivo CSV.', 'error');
    };

    reader.readAsText(file, 'utf-8');
  }

  const csvInputEl = document.getElementById('dispatchCsvInput');
  const btnImportCsv = document.getElementById('btnImportCsvRecipients');
  const btnDownloadModel = document.getElementById('btnDownloadCsvModel');

  if (btnImportCsv && csvInputEl) {
    btnImportCsv.addEventListener('click', () => {
      csvInputEl.value = '';
      csvInputEl.click();
    });

    csvInputEl.addEventListener('change', async (event) => {
      const file = event.target?.files?.[0];
      await handleCsvImport(file);
    });
  }

  if (btnDownloadModel) {
    btnDownloadModel.addEventListener('click', downloadCsvModel);
  }

  // --- Send Logic ---
  async function handleSend() {
    const btnSend = document.getElementById('btnSend');
    const resultEl = document.getElementById('sendResult');
    const rawTo = document.getElementById('dispatchTo').value.trim();
    if (!rawTo) return;

    const recipientsParsed = parseRecipientLines(rawTo);
    const recipients = recipientsParsed.recipients;
    if (!recipients.length) {
      resultEl.textContent = 'Informe números válidos.';
      resultEl.className = 'result error';
      show(resultEl, true);
      return;
    }

    const type = document.getElementById('dispatchType').value;
    let url, body;
    const inst = document.getElementById('dispatchInstance').value;

    if (type === 'menu') {
      url = '/v1/messages/send_menu';
      const opts = [];
      document.querySelectorAll('#menuOptionsList input[data-field="opt"]').forEach(i => { if (i.value) opts.push(i.value); });
      body = {
        instance: inst, title: document.getElementById('menuTitle').value,
        text: document.getElementById('menuText').value, options: opts, footer: document.getElementById('menuFooter').value
      };
    } else if (type === 'buttons') {
      url = '/v1/messages/send_buttons_helpers';
      const btns = [];
      document.querySelectorAll('#buttonsList .item-row').forEach(r => {
        const id = r.querySelector('[data-field="id"]')?.value;
        const txt = r.querySelector('[data-field="text"]')?.value;
        if (id && txt) btns.push({ id, text: txt });
      });
      body = { instance: inst, text: document.getElementById('buttonsText').value, buttons: btns, footer: document.getElementById('buttonsFooter').value };
    } else if (type === 'interactive') {
      url = '/v1/messages/send_interactive_helpers';
      const btns = [];
      document.querySelectorAll('#interactiveList .item-row').forEach(r => {
        const t = r.querySelector('[data-field="type"]').value;
        const tx = r.querySelector('[data-field="text"]').value;
        const ex = r.querySelector('[data-field="extra"]').value;
        if (tx && ex) {
          const b = { type: t, text: tx };
          if (t === 'url') b.url = ex; else if (t === 'copy') b.copyCode = ex; else if (t === 'call') b.phoneNumber = ex;
          btns.push(b);
        }
      });
      body = { instance: inst, text: document.getElementById('interactiveText').value, buttons: btns, footer: document.getElementById('interactiveFooter').value };
    } else if (type === 'list') {
      url = '/v1/messages/send_list_helpers';
      const secs = [];
      document.querySelectorAll('#listSectionsList .block-section').forEach(b => {
        const rws = [];
        b.querySelectorAll('.section-rows .item-row').forEach(r => {
          const id = r.querySelector('[data-field="id"]').value;
          const tl = r.querySelector('[data-field="title"]').value;
          if (id && tl) rws.push({ id, title: tl, description: r.querySelector('[data-field="desc"]').value });
        });
        if (rws.length) secs.push({ title: b.querySelector('.section-title').value, rows: rws });
      });
      body = { instance: inst, text: document.getElementById('listText').value, buttonText: document.getElementById('listButtonText').value, sections: secs, footer: document.getElementById('listFooter').value };
    } else if (type === 'poll') {
      url = '/v1/messages/send_poll';
      const opts = [];
      document.querySelectorAll('#pollOptionsList input[data-field="opt"]').forEach(i => { if (i.value) opts.push(i.value); });
      body = { instance: inst, name: document.getElementById('pollName').value, options: opts, selectableCount: parseInt(document.getElementById('pollSelectable').value) };
    } else if (type === 'carousel') {
      url = '/v1/messages/send_carousel_helpers';
      const crds = [];
      document.querySelectorAll('#carouselCardsList .block-section').forEach(b => {
        const btns = [];
        b.querySelectorAll('.card-buttons .item-row').forEach(r => {
          const id = r.querySelector('[data-field="id"]').value;
          const tx = r.querySelector('[data-field="text"]').value;
          if (id && tx) btns.push({ id, text: tx });
        });
        crds.push({
          title: b.querySelector('[data-field="title"]').value,
          body: b.querySelector('[data-field="body"]').value,
          footer: b.querySelector('[data-field="footer"]').value,
          imageUrl: b.querySelector('[data-field="imageUrl"]').value,
          buttons: btns
        });
      });
      body = { instance: inst, text: document.getElementById('carouselText').value, footer: document.getElementById('carouselFooter').value, cards: crds };
    }

    const min = parseInt(document.getElementById('dispatchDelayMin').value) || 2;
    const max = parseInt(document.getElementById('dispatchDelayMax').value) || 5;

    btnSend.disabled = true;
    show(resultEl, true);
    resultEl.className = 'result';
    let sent = 0, failed = 0;

    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      const to = recipient.to;
      const personalizedBody = applyTemplateVarsInPayload(body, {
        var1: recipient.var1 || '',
        var2: recipient.var2 || '',
      });
      personalizedBody.to = to;
      resultEl.textContent = `Enviando ${i + 1}/${recipients.length}...`;
      try {
        const res = await apiFetch(url, { method: 'POST', body: JSON.stringify(personalizedBody) });
        if (res && res.ok) sent++; else failed++;
      } catch (_) { failed++; }

      if (i < recipients.length - 1) {
        const wait = (min + Math.random() * (max - min)) * 1000;
        await new Promise(r => setTimeout(r, wait));
      }
    }
    resultEl.textContent = `Concluído: ${sent} OK, ${failed} falhas.`;
    resultEl.className = failed === 0 ? 'result success' : 'result error';
    btnSend.disabled = false;
  }

  const btnSend = document.getElementById('btnSend');
  if (btnSend) btnSend.onclick = handleSend;

  const btnRefresh = document.getElementById('btnRefreshList');
  if (btnRefresh) btnRefresh.onclick = refreshInstanceList;

  // Final Init
  initUI();
  refreshInstanceList();

  // --- ADMIN LOGIC ---
  // --- ROLE VISIBILITY & INIT ---
  function initRoles() {
    if (user.role === 'superadmin') {
      show(document.getElementById('tabAdmin'), true);
      initAdmin();
      show(document.getElementById('tabTenants'), true);
      initTenantManagement();
      show(document.getElementById('tabOtp'), true);
      initOtpConfig();
      show(document.getElementById('tabCredentials'), true);
      initCredentialsTab();
    }

    if (user.role === 'admin_tenant' || user.role === 'superadmin') {
      show(document.getElementById('tabUsers'), true);
      initTenantUsers();
      show(document.getElementById('tabDocs'), true);
      initApiPlayground();
      initDocsDownload();
    }
  }

  function getApiDocsMarkdown() {
    const baseUrl = window.location.origin;
    return `# RZ Sender - API Super Admin

## Credenciais

- Base URL: ${baseUrl}
- Header obrigatório: Authorization: Bearer <TOKEN_JWT>
- Content-Type: application/json

## 1) Criar tenant

Endpoint: POST /admin/tenants

\`\`\`json
{
  "name": "Empresa XPTO",
  "instance_limit": 3,
  "daily_send_limit": 1000
}
\`\`\`

## 2) Criar instância (superadmin com tenantId)

Endpoint: POST /v1/instances

\`\`\`json
{
  "tenantId": "UUID_DO_TENANT",
  "instance": "main"
}
\`\`\`

## 3) Consultar QR

Endpoint: GET /v1/instances/:name/qr

## 4) Envios suportados

- POST /v1/messages/send_text
- POST /v1/messages/send_image
- POST /v1/messages/send_video
- POST /v1/messages/send_menu
- POST /v1/messages/send_buttons_helpers
- POST /v1/messages/send_interactive_helpers
- POST /v1/messages/send_list_helpers
- POST /v1/messages/send_poll
- POST /v1/messages/send_carousel_helpers

## 5) Endpoint unificado para sistemas externos

- POST /api/integrations/send
- GET /api/integrations/instances

## Exemplo endpoint unificado

\`\`\`json
{
  "instance": "main",
  "to": "5511999999999",
  "type": "image",
  "payload": {
    "imageUrl": "https://seu-cdn.com/arquivo.jpg",
    "caption": "Teste via integração"
  }
}
\`\`\`
`;
  }

  function initDocsDownload() {
    const btn = document.getElementById('btnDownloadApiDocs');
    if (!btn || btn.dataset.bound === 'true') return;
    btn.dataset.bound = 'true';

    btn.addEventListener('click', () => {
      const content = getApiDocsMarkdown();
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rz-sender-api-superadmin-${new Date().toISOString().slice(0, 10)}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  function initCredentialsTab() {
    const tab = document.getElementById('tabCredentials');
    const baseUrlInput = document.getElementById('credBaseUrl');
    const tokenInput = document.getElementById('credToken');
    const tenantHint = document.getElementById('credTenantHint');
    const btnCopyBaseUrl = document.getElementById('btnCopyBaseUrl');
    const btnCopyToken = document.getElementById('btnCopyToken');
    const statusEl = document.getElementById('credCopyStatus');

    if (!tab || !baseUrlInput || !tokenInput || !tenantHint) return;

    const hydrate = () => {
      baseUrlInput.value = window.location.origin;
      tokenInput.value = getAccessToken() || '';
      tenantHint.value = [
        'Super Admin pode operar tenant específico enviando tenantId no body/query.',
        'Exemplo create instance:',
        '{ "tenantId": "UUID_DO_TENANT", "instance": "main" }',
        'Exemplo list instances:',
        '/v1/instances?tenantId=UUID_DO_TENANT'
      ].join('\n');
    };

    tab.addEventListener('click', hydrate);
    hydrate();

    const showCopyFeedback = (message, ok = true) => {
      if (!statusEl) return;
      statusEl.textContent = message;
      statusEl.className = ok ? 'status success' : 'status error';
      show(statusEl, true);
      setTimeout(() => show(statusEl, false), 2000);
    };

    if (btnCopyBaseUrl) {
      btnCopyBaseUrl.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(baseUrlInput.value);
          showCopyFeedback('URL base copiada.');
        } catch (_) {
          showCopyFeedback('Falha ao copiar URL base.', false);
        }
      });
    }

    if (btnCopyToken) {
      btnCopyToken.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(tokenInput.value);
          showCopyFeedback('Token copiado.');
        } catch (_) {
          showCopyFeedback('Falha ao copiar token.', false);
        }
      });
    }
  }

  // --- OTP CONFIG LOGIC ---
  function initOtpConfig() {
    const tab = document.getElementById('tabOtp');
    const form = document.getElementById('formOtpConfig');
    if (!tab || !form) return;

    tab.addEventListener('click', () => {
      refreshOtpConfig();
    });

    form.onsubmit = async (e) => {
      e.preventDefault();
      const statusEl = document.getElementById('otpSaveStatus');
      const payload = {
        url: document.getElementById('otpUrl').value,
        token: document.getElementById('otpToken').value,
        template: document.getElementById('otpTemplate').value,
        channels: {
          whatsapp: document.getElementById('otpChannelWhatsApp').checked,
          email: document.getElementById('otpChannelEmail').checked,
          sms: document.getElementById('otpChannelSms').checked,
        },
        smtpHost: document.getElementById('smtpHost').value,
        smtpPort: parseInt(document.getElementById('smtpPort').value || '587', 10),
        smtpSecure: document.getElementById('smtpSecure').value === 'true',
        smtpUser: document.getElementById('smtpUser').value,
        smtpPass: document.getElementById('smtpPass').value,
        smtpFrom: document.getElementById('smtpFrom').value,
        smsUrl: document.getElementById('smsUrl').value,
        smsAuthKey: document.getElementById('smsAuthKey').value,
        smsSender: document.getElementById('smsSender').value,
      };

      try {
        const res = await apiFetch('/admin/otp-config', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.ok) {
          statusEl.textContent = 'Configuração salva com sucesso!';
          statusEl.className = 'status success';
        } else {
          statusEl.textContent = 'Erro ao salvar: ' + data.error;
          statusEl.className = 'status error';
        }
        show(statusEl, true);
        setTimeout(() => show(statusEl, false), 3000);
      } catch (err) {
        statusEl.textContent = 'Erro de rede.';
        statusEl.className = 'status error';
        show(statusEl, true);
      }
    };
  }

  async function refreshOtpConfig() {
    try {
      const res = await apiFetch('/admin/otp-config');
      const data = await res.json();
      if (data.ok && data.config) {
        document.getElementById('otpUrl').value = data.config.url || '';
        document.getElementById('otpToken').value = data.config.token || '';
        document.getElementById('otpTemplate').value = data.config.template || '';
        document.getElementById('otpChannelWhatsApp').checked = data.config.channels?.whatsapp !== false;
        document.getElementById('otpChannelEmail').checked = data.config.channels?.email === true;
        document.getElementById('otpChannelSms').checked = data.config.channels?.sms === true;

        document.getElementById('smtpHost').value = data.config.smtp?.host || '';
        document.getElementById('smtpPort').value = data.config.smtp?.port || 587;
        document.getElementById('smtpSecure').value = String(data.config.smtp?.secure === true);
        document.getElementById('smtpUser').value = data.config.smtp?.user || '';
        document.getElementById('smtpPass').value = data.config.smtp?.pass || '';
        document.getElementById('smtpFrom').value = data.config.smtp?.from || '';

        document.getElementById('smsUrl').value = data.config.sms?.url || 'https://sms.comtele.com.br/api/v2/send';
        document.getElementById('smsAuthKey').value = data.config.sms?.authKey || '';
        document.getElementById('smsSender').value = data.config.sms?.sender || 'RZSender';
      }
    } catch (_) { }
  }

  // --- ADMIN LOGIC ---
  function initAdmin() {
    const modal = setupModal('modalNewTenant');
    const form = document.getElementById('formNewTenant');
    const tabAdmin = document.getElementById('tabAdmin');
    const btnNewTenant = document.getElementById('btnNewTenant');
    const btnNewUser = document.getElementById('btnNewUser');

    if (!tabAdmin) return;

    tabAdmin.addEventListener('click', () => {
      refreshAdminMetrics();
      refreshTenantList();
      refreshAdminUserList();
    });

    if (btnNewTenant && form && modal) {
      btnNewTenant.addEventListener('click', () => {
      form.reset();
      modal.show();
      });
    }

    refreshAdminMetrics();
    refreshTenantList();
    refreshAdminUserList();

    if (!form) return;

    form.onsubmit = async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('tName').value,
        instance_limit: parseInt(document.getElementById('tLimit').value),
        daily_send_limit: parseInt(document.getElementById('tSendLimit').value)
      };

      const res = await apiFetch('/admin/tenants', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.ok) {
        modal.hide();
        refreshTenantList();
      } else {
        alert('Erro: ' + data.error);
      }
    };

    // User creation logic for Superadmin might still use prompt for tenant_id or we can just let them use the other tab.
    // For now, let's keep it simple or use a temporary prompt if needed, but the Tenant Admin modal is better.
    if (!btnNewUser) return;

    btnNewUser.addEventListener('click', async () => {
      const email = prompt('Email do Usuário:');
      if (!email) return;
      const name = prompt('Nome do Usuário:');
      if (!name) return;
      const password = prompt('Senha inicial:');
      if (!password) return;
      const tenantId = prompt('ID do Tenant (UUID) ou deixe vazio para Superadmin:');
      const role = tenantId ? (prompt('Role (admin_tenant / user_tenant):') || 'user_tenant') : 'superadmin';

      apiFetch('/admin/users', {
        method: 'POST',
        body: JSON.stringify({ tenant_id: tenantId || null, email, name, password, role })
      }).then(res => res.json()).then(data => {
        if (data.ok) refreshAdminUserList();
        else alert('Erro: ' + data.error);
      });
    });
  }

  async function refreshAdminMetrics() {
    try {
      const res = await apiFetch('/admin/metrics');
      const data = await res.json();
      if (data.ok) {
        document.getElementById('metricTenants').textContent = data.metrics.tenants;
        document.getElementById('metricUsers').textContent = data.metrics.users;
      }
    } catch (_) { }
  }

  async function refreshAdminUserList() {
    try {
      const res = await apiFetch('/admin/users');
      const data = await res.json();
      if (data.ok) {
        const tbody = document.getElementById('adminUserList');
        tbody.innerHTML = data.users.map(u => `
          <tr>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${u.tenant_name || 'SYSTEM'}</td>
            <td><code>${u.role}</code></td>
            <td><span class="status-${u.status}">${u.status}</span></td>
          </tr>
        `).join('');
      }
    } catch (_) { }
  }

  async function refreshTenantList() {
    try {
      const res = await apiFetch('/admin/tenants');
      const data = await res.json();
      if (data.ok) {
        const tbody = document.getElementById('tenantList');
        if (!tbody) return;
        tbody.innerHTML = data.tenants.map(t => `
          <tr>
            <td>${t.name}</td>
            <td><code>${t.slug || '-'}</code></td>
            <td>${t.instance_limit}</td>
            <td>${t.daily_send_limit}</td>
            <td><span class="status-${t.status}">${t.status}</span></td>
          </tr>
        `).join('');
      }
    } catch (_) { }
  }

  // --- TENANT MANAGEMENT LOGIC ---
  function loadTenants() {
    const list = document.getElementById('tenantList');
    if (!list) return;

    apiFetch('/admin/tenants').then(res => res.json()).then(data => {
      if (data.ok) {
        list.innerHTML = data.tenants.map(t => `
          <tr>
            <td>${t.name} <br> <small class="text-muted">${t.slug}</small></td>
            <td>${t.instance_limit}</td>
            <td>${t.daily_send_limit || '∞'}</td>
            <td><span class="badge badge-accent">${t.last_otp || '-'}</span></td>
            <td>${t.due_date ? new Date(t.due_date).toLocaleDateString() : '∞'}</td>
            <td><span class="badge ${t.status === 'active' ? 'badge-success' : 'badge-danger'}">${t.status}</span></td>
            <td>
              <button class="btn btn-small btn-secondary" onclick="openEditTenant('${t.id}', '${t.name}', '${t.status}', ${t.instance_limit}, ${t.daily_send_limit}, '${t.due_date || ''}')">
                <i class="fas fa-edit"></i> Editar
              </button>
            </td>
          </tr>
        `).join('');
      }
    });
  }

  // Global functions for inline usage
  window.openEditTenant = (id, name, status, instLimit, dailyLimit, dueDate) => {
    const modal = document.getElementById('modalEditTenant');
    document.getElementById('editTenantId').value = id;
    document.getElementById('editTenantName').value = name;
    document.getElementById('editTenantStatus').value = status;
    document.getElementById('editTenantInstLimit').value = instLimit;
    document.getElementById('editTenantDailyLimit').value = dailyLimit;

    // Format date for input type="date"
    let dateVal = '';
    if (dueDate && dueDate !== 'null' && dueDate !== 'undefined') {
      try { dateVal = new Date(dueDate).toISOString().split('T')[0]; } catch (e) { }
    }
    document.getElementById('editTenantDueDate').value = dateVal;

    modal.classList.add('active');

    // Setup close
    const close = modal.querySelector('.close');
    close.onclick = () => modal.classList.remove('active');
  };

  window.deleteTenant = async () => {
    const id = document.getElementById('editTenantId').value;
    if (!confirm('ATENÇÃO: Isso apagará TODOS os dados, instâncias e usuários desta empresa. Continuar?')) return;

    const res = await apiFetch(`/admin/tenants/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.ok) {
      alert('Empresa excluída com sucesso!');
      document.getElementById('modalEditTenant').classList.remove('active');
      loadTenants(); // Reload list
    } else {
      alert('Erro ao excluir: ' + data.error);
    }
  };

  const formEdit = document.getElementById('formEditTenant');
  if (formEdit) {
    formEdit.onsubmit = async (e) => {
      e.preventDefault();
      const id = document.getElementById('editTenantId').value;
      const body = {
        name: document.getElementById('editTenantName').value,
        status: document.getElementById('editTenantStatus').value,
        instance_limit: parseInt(document.getElementById('editTenantInstLimit').value),
        daily_send_limit: parseInt(document.getElementById('editTenantDailyLimit').value),
        due_date: document.getElementById('editTenantDueDate').value || null
      };

      const res = await apiFetch(`/admin/tenants/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (data.ok) {
        alert('Empresa atualizada!');
        document.getElementById('modalEditTenant').classList.remove('active');
        loadTenants();
      } else {
        alert('Erro ao atualizar: ' + data.error);
      }
    };
  }

  // --- TENANT USERS LOGIC ---
  function initTenantUsers() {
    const tab = document.getElementById('tabUsers');
    if (!tab) return;
    const modal = setupModal('modalNewUser');
    const form = document.getElementById('formNewUser');

    tab.addEventListener('click', () => {
      refreshTenantUserList();
    });

    const btnNew = document.getElementById('btnNewTenantUser');
    if (btnNew) {
      btnNew.addEventListener('click', () => {
        form.reset();
        modal.show();
      });
    }

    form.onsubmit = async (e) => {
      e.preventDefault();
      const payload = {
        name: document.getElementById('uName').value,
        email: document.getElementById('uEmail').value,
        password: document.getElementById('uPass').value,
        role: document.getElementById('uRole').value
      };

      const res = await apiFetch('/v1/users', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.ok) {
        modal.hide();
        refreshTenantUserList();
      } else {
        alert('Erro: ' + (data.error === 'email_already_exists' ? 'E-mail em uso.' : data.error));
      }
    };
  }

  async function refreshTenantUserList() {
    try {
      const tbody = document.getElementById('tenantUserList');
      if (!tbody) return;

      const endpoint = user.role === 'superadmin' ? '/admin/users' : '/v1/users';
      const res = await apiFetch(endpoint);
      const data = await res.json();

      if (!data.ok) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Erro ao carregar usuários</td></tr>';
        return;
      }

      const users = data.users || [];
      tbody.innerHTML = users.map(u => `
        <tr>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td><code>${u.role}</code></td>
          <td><span class="status-${u.status}">${u.status}</span></td>
        </tr>
      `).join('');

      if (!users.length) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Nenhum usuário encontrado</td></tr>';
      }
    } catch (_) { }
  }

  // --- TENANT MANAGEMENT (SUPERADMIN) ---
  function initTenantManagement() {
    const tabTenants = document.getElementById('tabTenants');
    if (!tabTenants) return;

    const btnCreateNew = document.getElementById('btnCreateNewTenant');
    const modal = document.getElementById('modalTenant');
    const form = document.getElementById('formTenant');
    const btnDelete = document.getElementById('btnDeleteTenantModal');

    // Refresh list when tab is clicked
    tabTenants.addEventListener('click', () => {
      refreshTenantsList();
    });

    // Open modal for new tenant
    if (btnCreateNew) {
      btnCreateNew.addEventListener('click', () => {
        document.getElementById('modalTenantTitle').textContent = 'Novo Tenant';
        form.reset();
        document.getElementById('tenantFormId').value = '';
        btnDelete.style.display = 'none';
        modal.classList.add('active');
      });
    }

    // Form submission
    form.onsubmit = async (e) => {
      e.preventDefault();
      const tenantId = document.getElementById('tenantFormId').value;
      const payload = {
        name: document.getElementById('tenantFormName').value,
        status: document.getElementById('tenantFormStatus').value,
        instance_limit: parseInt(document.getElementById('tenantFormInstanceLimit').value),
        daily_send_limit: parseInt(document.getElementById('tenantFormDailyLimit').value)
      };

      try {
        let res;
        if (tenantId) {
          // Update
          res = await apiFetch(`/admin/tenants/${tenantId}`, {
            method: 'PATCH',
            body: JSON.stringify(payload)
          });
        } else {
          // Create
          res = await apiFetch('/admin/tenants', {
            method: 'POST',
            body: JSON.stringify(payload)
          });
        }

        const data = await res.json();
        if (data.ok) {
          modal.classList.remove('active');
          refreshTenantsList();
        } else {
          alert('Erro: ' + (data.error || 'Desconhecido'));
        }
      } catch (err) {
        alert('Erro de rede: ' + err.message);
      }
    };

    // Delete button
    if (btnDelete) {
      btnDelete.addEventListener('click', async () => {
        const tenantId = document.getElementById('tenantFormId').value;
        if (!tenantId) return;
        
        if (!confirm('Tem certeza? Isso apagará o tenant, todos seus usuários, instâncias e dados.')) return;

        try {
          const res = await apiFetch(`/admin/tenants/${tenantId}`, {
            method: 'DELETE'
          });
          const data = await res.json();
          if (data.ok) {
            modal.classList.remove('active');
            refreshTenantsList();
          } else {
            alert('Erro ao deletar: ' + (data.error || 'Desconhecido'));
          }
        } catch (err) {
          alert('Erro de rede: ' + err.message);
        }
      });
    }

    // Close modal
    const closeBtn = modal.querySelector('.close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
      });
    }
  }

  async function refreshTenantsList() {
    try {
      const res = await apiFetch('/admin/tenants');
      const data = await res.json();

      if (data.ok && data.tenants) {
        const tbody = document.getElementById('tenantsTableBody');
        if (tbody) {
          tbody.innerHTML = data.tenants.map(tenant => `
            <tr>
              <td><strong>${tenant.name}</strong></td>
              <td><span class="badge ${tenant.status === 'active' ? 'badge-success' : 'badge-danger'}">${tenant.status}</span></td>
              <td>${tenant.instance_limit}</td>
              <td>${tenant.daily_send_limit === 0 ? '∞' : tenant.daily_send_limit}</td>
              <td><code>${tenant.last_otp || '-'}</code></td>
              <td>${new Date(tenant.created_at).toLocaleDateString('pt-BR')}</td>
              <td>
                <button type="button" class="btn btn-small btn-secondary" onclick="openEditTenantModal('${tenant.id}', '${tenant.name}', '${tenant.status}', ${tenant.instance_limit}, ${tenant.daily_send_limit})">
                  ✏️ Editar
                </button>
              </td>
            </tr>
          `).join('');
        }
      } else {
        document.getElementById('tenantsTableBody').innerHTML = '<tr><td colspan="7" class="text-center">Nenhum tenant encontrado</td></tr>';
      }
    } catch (err) {
      console.error('Erro ao carregar tenants:', err);
      document.getElementById('tenantsTableBody').innerHTML = '<tr><td colspan="7" class="text-center text-error">Erro ao carregar dados</td></tr>';
    }
  }

  // Global function for inline onclick
  window.openEditTenantModal = (id, name, status, instanceLimit, dailyLimit) => {
    const modal = document.getElementById('modalTenant');
    const form = document.getElementById('formTenant');
    const btnDelete = document.getElementById('btnDeleteTenantModal');

    document.getElementById('modalTenantTitle').textContent = `Editar: ${name}`;
    document.getElementById('tenantFormId').value = id;
    document.getElementById('tenantFormName').value = name;
    document.getElementById('tenantFormStatus').value = status;
    document.getElementById('tenantFormInstanceLimit').value = instanceLimit;
    document.getElementById('tenantFormDailyLimit').value = dailyLimit;
    
    btnDelete.style.display = 'block';
    modal.classList.add('active');
  };

  // --- API PLAYGROUND LOGIC ---
  function initApiPlayground() {
    const pgType = document.getElementById('pgType');
    const pgFields = document.getElementById('pgFields');
    const pgCurlOutput = document.getElementById('pgCurlOutput');
    const pgJsonOutput = document.getElementById('pgJsonOutput');
    const btnCopy = document.getElementById('btnCopyPG');
    const btnSend = document.getElementById('btnSendPG');
    const sendStatus = document.getElementById('pgSendStatus');
    const previewText = document.getElementById('pgPreviewText');
    const previewFooter = document.getElementById('pgPreviewFooter');
    const previewButtons = document.getElementById('pgPreviewButtons');

    const getPayload = () => {
      const type = pgType.value;
      const instance = document.getElementById('pgInstance').value || 'nome_instancia';
      const to = document.getElementById('pgTo').value || '5511999999999';
      const body = { instance, to };

      if (type === 'send_text') {
        body.text = document.getElementById('pgText').value;
        const f = document.getElementById('pgFooter').value;
        if (f) body.footer = f;
      } else if (type === 'send_menu') {
        body.title = document.getElementById('pgTitle').value;
        body.text = document.getElementById('pgText').value;
        body.options = document.getElementById('pgOptions').value.split(';').map(s => s.trim()).filter(Boolean);
        body.footer = document.getElementById('pgFooter').value;
      } else if (type === 'send_buttons_helpers') {
        body.text = document.getElementById('pgText').value;
        body.buttons = document.getElementById('pgButtons').value.split(';').map((s, i) => ({ id: `id_${i}`, text: s.trim() })).filter(b => b.text);
        body.footer = document.getElementById('pgFooter').value;
      } else if (type === 'send_interactive_helpers') {
        body.text = document.getElementById('pgText').value;
        body.buttons = [];

        [document.getElementById('pgBtn1').value, document.getElementById('pgBtn2').value].forEach(val => {
          if (!val) return;
          const parts = val.split('|');
          if (parts.length < 3) return;
          const buttonType = parts[0].trim().toLowerCase();
          const text = parts[1].trim();
          const value = parts[2].trim();

          if (buttonType === 'url') body.buttons.push({ type: 'url', text, url: value });
          else if (buttonType === 'call') body.buttons.push({ type: 'call', text, phoneNumber: value });
          else if (buttonType === 'copy') body.buttons.push({ type: 'copy', text, copyCode: value });
        });

        body.footer = document.getElementById('pgFooter').value;
      } else if (type === 'send_list_helpers') {
        body.text = document.getElementById('pgText').value;
        body.buttonText = document.getElementById('pgBtnText').value;
        const rows = document.getElementById('pgRows').value.split('\n').map(r => {
          const [title, description] = r.split('|');
          if (!title) return null;
          return { title: title.trim(), description: description?.trim(), id: title.trim().toLowerCase().replace(/\s/g, '_') };
        }).filter(Boolean);
        body.sections = [{ title: 'Opções', rows }];
        body.footer = document.getElementById('pgFooter').value;
      } else if (type === 'send_poll') {
        body.name = document.getElementById('pgName').value;
        body.options = document.getElementById('pgOptions').value.split(';').map(s => s.trim()).filter(Boolean);
        body.selectableCount = parseInt(document.getElementById('pgCount').value) || 1;
      }

      return body;
    };

    const renderPreview = (type, body) => {
      if (!previewText || !previewFooter || !previewButtons) return;

      if (type === 'send_poll') {
        previewText.textContent = body.name || 'Enquete';
      } else if (type === 'send_menu') {
        const opts = (body.options || []).map((opt, idx) => `${idx + 1}. ${opt}`).join('\n');
        previewText.textContent = `${body.title || ''}\n${body.text || ''}${opts ? `\n\n${opts}` : ''}`.trim();
      } else {
        previewText.textContent = body.text || 'Mensagem de preview';
      }

      previewFooter.textContent = body.footer || '';
      previewButtons.innerHTML = '';

      if (type === 'send_buttons_helpers' || type === 'send_interactive_helpers') {
        (body.buttons || []).forEach((button) => {
          const el = document.createElement('div');
          el.className = 'pg-phone-btn';
          el.textContent = button.text || button.id || 'Botão';
          previewButtons.appendChild(el);
        });
      }

      if (type === 'send_list_helpers' && body.buttonText) {
        const el = document.createElement('div');
        el.className = 'pg-phone-btn';
        el.textContent = body.buttonText;
        previewButtons.appendChild(el);
      }

      if (type === 'send_poll') {
        (body.options || []).forEach((option) => {
          const el = document.createElement('div');
          el.className = 'pg-phone-btn';
          el.textContent = option;
          previewButtons.appendChild(el);
        });
      }
    };

    // Populate instances
    const refreshPGInstances = () => {
      apiFetch('/v1/instances').then(res => res.json()).then(data => {
        if (data.ok) {
          const select = document.getElementById('pgInstance');
          if (data.instances.length === 0) {
            select.innerHTML = '<option value="">Nenhuma instância conectada</option>';
          } else {
            select.innerHTML = data.instances.map(i => `<option value="${i.instance}">${i.instance}</option>`).join('');
          }
          updateOutput();
        }
      }).catch(() => { });
    };

    document.getElementById('tabDocs').addEventListener('click', refreshPGInstances);

    const updateFields = () => {
      const type = pgType.value;
      let html = '';
      if (type === 'send_text') {
        html = `
          <div class="form-group"><label>Texto da Mensagem</label><textarea id="pgText" class="form-control" rows="4">Olá! Esta é uma mensagem de teste.</textarea></div>
          <div class="form-group"><label>Rodapé (Opcional)</label><input type="text" id="pgFooter" class="form-control" placeholder="Enviado por RZ Sender"></div>
        `;
      } else if (type === 'send_menu') {
        html = `
          <div class="form-group"><label>Título do Menu</label><input type="text" id="pgTitle" class="form-control" value="Menu Principal"></div>
          <div class="form-group"><label>Texto do Corpo</label><textarea id="pgText" class="form-control">Escolha uma opção abaixo:</textarea></div>
          <div class="form-group"><label>Opções (ponto e vírgula)</label><input type="text" id="pgOptions" class="form-control" value="Falar com Suporte;Ver Planos;Financeiro"></div>
          <div class="form-group"><label>Rodapé</label><input type="text" id="pgFooter" class="form-control" value="RZ Sender"></div>
        `;
      } else if (type === 'send_buttons_helpers') {
        html = `
          <div class="form-group"><label>Texto</label><textarea id="pgText" class="form-control">Deseja continuar?</textarea></div>
          <div class="form-group"><label>Botões (ponto e vírgula, máx 3)</label><input type="text" id="pgButtons" class="form-control" value="Sim;Não;Talvez"></div>
          <div class="form-group"><label>Rodapé</label><input type="text" id="pgFooter" class="form-control" value="RZ Sender"></div>
        `;
      } else if (type === 'send_interactive_helpers') {
        html = `
          <div class="form-group"><label>Texto</label><textarea id="pgText" class="form-control">Visite nosso site:</textarea></div>
          <div class="form-group"><label>Botão 1 (Url/Call/Copy|Texto|Valor)</label><input type="text" id="pgBtn1" class="form-control" value="url|Acessar Site|https://google.com"></div>
          <div class="form-group"><label>Botão 2 (Opcional)</label><input type="text" id="pgBtn2" class="form-control" value="call|Ligar Agora|5511999999999"></div>
          <div class="form-group"><label>Rodapé</label><input type="text" id="pgFooter" class="form-control" value="RZ Sender"></div>
          <small class="text-muted">Formatos: url|Texto|Link, call|Texto|Fone, copy|Texto|Código</small>
        `;
      } else if (type === 'send_list_helpers') {
        html = `
          <div class="form-group"><label>Texto</label><textarea id="pgText" class="form-control">Escolha seu plano:</textarea></div>
          <div class="form-group"><label>Texto do Botão</label><input type="text" id="pgBtnText" class="form-control" value="Ver Planos"></div>
          <div class="form-group"><label>Itens (Nome|Desc;Nome2|Desc2)</label><textarea id="pgRows" class="form-control">Plano Pro|Acesso total\nPlano Free|Acesso limitado</textarea></div>
          <div class="form-group"><label>Rodapé</label><input type="text" id="pgFooter" class="form-control" value="RZ Sender"></div>
        `;
      } else if (type === 'send_poll') {
        html = `
          <div class="form-group"><label>Pergunta</label><input type="text" id="pgName" class="form-control" value="Qual sua cor favorita?"></div>
          <div class="form-group"><label>Opções (ponto e vírgula)</label><input type="text" id="pgOptions" class="form-control" value="Azul;Verde;Vermelho"></div>
          <div class="form-group"><label>Qtd. Selecionável</label><input type="number" id="pgCount" class="form-control" value="1" min="1"></div>
        `;
      }
      pgFields.innerHTML = html;

      // Add listeners to new fields
      pgFields.querySelectorAll('input, textarea, select').forEach(el => {
        el.addEventListener('input', updateOutput);
      });
      updateOutput();
    };

    const updateOutput = () => {
      try {
        const type = pgType.value;
        const body = getPayload();

        renderPreview(type, body);

        const jsonStr = JSON.stringify(body, null, 2);
        const url = `${window.location.origin}/v1/messages/${type}`;
        const token = getAccessToken() || 'SEU_TOKEN_AQUI';

        const curl = `curl -X POST "${url}" \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json" \\
  -d '${jsonStr}'`;

        pgCurlOutput.textContent = curl;
        pgJsonOutput.textContent = jsonStr;
      } catch (e) { console.error(e); }
    };

    pgType.addEventListener('change', updateFields);
    document.getElementById('pgInstance').addEventListener('change', updateOutput);
    document.getElementById('pgTo').addEventListener('input', updateOutput);

    btnCopy.addEventListener('click', () => {
      navigator.clipboard.writeText(pgCurlOutput.textContent);
      const oldText = btnCopy.innerHTML;
      btnCopy.innerHTML = '<i class="fas fa-check"></i> Copiado!';
      setTimeout(() => btnCopy.innerHTML = oldText, 2000);
    });

    if (btnSend) {
      btnSend.addEventListener('click', async () => {
        try {
          const type = pgType.value;
          const body = getPayload();

          btnSend.disabled = true;
          sendStatus.textContent = 'Enviando teste...';
          sendStatus.className = 'status';
          show(sendStatus, true);

          const response = await apiFetch(`/v1/messages/${type}`, {
            method: 'POST',
            body: JSON.stringify(body),
          });

          const data = response ? await response.json() : null;
          if (response && response.ok && data?.ok) {
            sendStatus.textContent = 'Mensagem enviada com sucesso.';
            sendStatus.className = 'status success';
          } else {
            sendStatus.textContent = `Falha no envio: ${data?.error || 'erro_desconhecido'}`;
            sendStatus.className = 'status error';
          }
        } catch (err) {
          sendStatus.textContent = `Falha no envio: ${err.message || 'erro_de_rede'}`;
          sendStatus.className = 'status error';
        } finally {
          btnSend.disabled = false;
        }
      });
    }

    updateFields();
  }

  initRoles();
})();
