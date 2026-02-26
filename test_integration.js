


const API = 'http://localhost:8787';
const EMAIL = 'admin@tenant.local'; // Adjust if needed
const PASS = 'Demo@123'; // Adjust if needed

async function test() {
    console.log('[TEST] 1. Login to get Token...');
    const loginRes = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASS })
    });
    const loginData = await loginRes.json();

    if (!loginData.ok) {
        console.error('[TEST] Login failed:', loginData);
        process.exit(1);
    }

    const token = loginData.accessToken;
    console.log('[TEST] Login OK. Token obtained.');

    console.log('[TEST] 1.5. Ensuring instance "main" exists...');
    const instRes = await fetch(`${API}/v1/instances`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ instance: 'main' })
    });
    const instData = await instRes.json();
    console.log('[TEST] Instance check/create result:', instData.ok ? 'OK' : 'FAILED', instData.status || '');

    console.log('[TEST] 2. Sending Message via /api/integrations/send ...');
    const payload = {
        instance: 'main',
        to: '5513981577934', // Using support number as test target
        type: 'text', // Mapping text to menu in dispatcher
        payload: {
            text: 'Olá! Teste de integração externa RZ Sender.',
            footer: 'Enviado via API'
        }
    };

    const sendRes = await fetch(`${API}/api/integrations/send`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    const sendData = await sendRes.json();
    console.log('[TEST] Send Result:', JSON.stringify(sendData, null, 2));

    if (sendData.ok) {
        console.log('[TEST] SUCCESS! API Integration is working.');
    } else {
        console.error('[TEST] FAILED.');
    }
}

test();
