const http = require('http');

const candidates = [
  // Antigravity (Google AI Pro subscription)
  'antigravity/claude-opus-4-6-thinking',
  'antigravity/claude-sonnet-4-6',
  'antigravity/gemini-3.5-flash-lite',
  'antigravity/gpt-oss-120b-medium',

  // GitHub Models
  'github/gpt-4o-2024-11-20',
  'github/gpt-4o-mini',

  // Kiro
  'kiro/claude-sonnet-4.5',
  'kiro/claude-haiku-4.5',
  'kiro/glm-5',
  'kiro/qwen3-coder-next',
  'kiro/minimax-m2.5',
  'kiro/minimax-m2.1',
  'kiro/deepseek-3.2',

  // Mistral
  'mistral/codestral-latest',
  'mistral/mistral-small-latest',
  'mistral/mistral-medium-3-5',

  // Groq
  'groq/openai/gpt-oss-20b',
  'groq/openai/gpt-oss-120b',

  // Cloudflare AI
  'cloudflare-ai/@cf/meta/llama-3.3-70b-instruct-fp8-fast',
  'cloudflare-ai/@cf/qwen/qwen2.5-coder-32b-instruct',
  'cloudflare-ai/@cf/deepseek-ai/deepseek-r1-distill-qwen-32b',
  'cloudflare-ai/@cf/zai-org/glm-4.7-flash',
  'cloudflare-ai/@cf/qwen/qwq-32b',
  'cloudflare-ai/@cf/meta/llama-3.2-3b-instruct',
  'cloudflare-ai/@cf/moonshotai/kimi-k2.6',
  'cloudflare-ai/@cf/google/gemma-4-26b-a4b-it',

  // OpenRouter Free
  'openrouter/openai/gpt-oss-20b:free',
  'openrouter/z-ai/glm-5.2:free',
  'openrouter/cohere/north-mini-code:free',
  'openrouter/google/gemma-4-26b-a4b-it:free',
  'openrouter/google/gemma-4-31b-it:free',
  'openrouter/nvidia/nemotron-3-super-120b-a12b:free',
  'openrouter/nvidia/nemotron-3-ultra-550b-a55b:free',
  'openrouter/nvidia/nemotron-3.5-lightning:free',
  'openrouter/liquid/lfm-2.5-2.6b:free',
  'openrouter/dots-studio/dots-3-note-preview:free',

  // Kilo-Gateway Free
  'kilo-gateway/nvidia/nemotron-3-ultra-550b-a55b:free',
  'kilo-gateway/nvidia/nemotron-3-super-120b-a12b:free',
  'kilo-gateway/cohere/north-mini-code:free',
  'kilo-gateway/nvidia/nemotron-3.5-lightning:free'
];

async function test(m) {
  return new Promise(r => {
    const payload = JSON.stringify({ model: m, messages: [{ role: 'user', content: 'Respond with PONG' }], max_tokens: 15 });
    const req = http.request({
      hostname: '127.0.0.1', port: 20128, path: '/v1/chat/completions', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer sk-ant-api03-85702967f40fcc12-f121cd-a362127e', 'Content-Length': Buffer.byteLength(payload) },
      timeout: 7000
    }, res => {
      let d = ''; res.on('data', c => d += c); res.on('end', () => r({ m, s: res.statusCode, d }));
    });
    req.on('error', e => r({ m, s: 0, d: e.message }));
    req.on('timeout', () => { req.destroy(); r({ m, s: 0, d: 'TIMEOUT' }); });
    req.write(payload); req.end();
  });
}

async function run() {
  const working = [];
  const failing = [];
  console.log(`Auditing ${candidates.length} candidate models live...`);
  for (const m of candidates) {
    const res = await test(m);
    const isOk = res.s >= 200 && res.s < 400 && !res.d.includes('error');
    if (isOk) {
      working.push(m);
      console.log(`✔ [${res.s}] ${m}`);
    } else {
      failing.push({ m, s: res.s, err: res.d.slice(0, 70).replace(/\n/g, ' ') });
      console.log(`✖ [${res.s}] ${m} -> ${failing[failing.length - 1].err}`);
    }
  }

  console.log(`\n========================================`);
  console.log(`WORKING MODELS (${working.length}/${candidates.length}):`);
  console.log(JSON.stringify(working, null, 2));
}

run();
