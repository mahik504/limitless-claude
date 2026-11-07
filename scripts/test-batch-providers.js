const http = require('http');

const models = [
  'cerebras/gpt-oss-120b',
  'nvidia/openai/gpt-oss-120b',
  'nvidia/z-ai/glm-5.2',
  'nvidia/google/gemma-4-31b-it',
  'ollama-cloud/deepseek-v4-pro:0813',
  'ollama-cloud/glm-5.3-flash',
  'ollama-cloud/kimi-k2.7-code',
  'ollama-cloud/mistral-large-3:675b',
  'ollama-cloud/qwen3.5:397b',
  'kilo-gateway/nvidia/nemotron-3-ultra-550b-a55b:free',
  'kilo-gateway/stepfun/step-3.7-flash:free',
  'kilo-gateway/poolside/laguna-s-2.1:free'
];

async function test(m) {
  return new Promise(r => {
    const payload = JSON.stringify({ model: m, messages: [{ role: 'user', content: 'Say PONG' }], max_tokens: 15 });
    const req = http.request({
      hostname: '127.0.0.1', port: 20128, path: '/v1/chat/completions', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-ant-api03-85702967f40fcc12-f121cd-a362127e', 'Content-Length': Buffer.byteLength(payload) },
      timeout: 8000
    }, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => r({ m, s: res.statusCode, d: d.slice(0, 80) }));
    });
    req.on('error', e => r({ m, s: 0, d: e.message }));
    req.on('timeout', () => { req.destroy(); r({ m, s: 0, d: 'TIMEOUT' }); });
    req.write(payload); req.end();
  });
}

async function run() {
  for (const m of models) {
    const res = await test(m);
    const mark = res.s >= 200 && res.s < 400 && !res.d.includes('error') ? '✔' : '✖';
    console.log(`${mark} [${res.s}] ${res.m} -> ${res.d.replace(/\n/g, ' ')}`);
  }
}
run();
