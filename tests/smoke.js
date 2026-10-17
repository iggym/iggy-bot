const { JSDOM, VirtualConsole } = require('jsdom');
const fsn = require('fs');
const html = fsn.readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8').replace(/<script src="https:[^"]+"><\/script>/, '');
const errors = [];
const vc = new VirtualConsole();
vc.on('jsdomError', e => errors.push('jsdomError: ' + (e.stack || e.message)));
vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));
const dom = new JSDOM(html, {
  runScripts: 'dangerously', url: 'https://example.test/', virtualConsole: vc, pretendToBeVisual: true,
  beforeParse(w) {
    const u=require('util'); w.TextEncoder=u.TextEncoder; w.TextDecoder=u.TextDecoder; w.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {} });
    w.HTMLFormElement.prototype.requestSubmit = function () { this.dispatchEvent(new w.Event('submit', { cancelable: true })); };
    w.confirm = () => true; w.prompt = () => null; w.scrollTo = () => {};
    w.Element.prototype.scrollIntoView = () => {};
  }
});
const w = dom.window;
const sleep = ms => new Promise(r => setTimeout(r, ms));
// auto-approve HITL
const approvals = [];
setInterval(() => { const m = w.document.querySelector('#hitlModal'); if (m && !m.hidden) { approvals.push(w.document.querySelector('#hitlReason').textContent); w.document.querySelector('#hitlApprove').click(); } }, 50);

async function send(q) {
  const ev = w.eval('Chat'); await ev.send(q);
}
(async () => {
  await sleep(300);
  const ev = s => w.eval(s);
  console.log('onboard auto-open:', !w.document.querySelector('#onboardModal').hidden, '| title:', w.document.title, '| h1:', w.document.querySelector('h1').textContent, '| pill:', w.document.querySelector('#modePill').textContent, '| cta:', !!w.document.querySelector('.cta-key'));
  // fake fetch: success for good key, 401 for bad
  w.fetch = async (url, o) => {
    if (String(url).includes('key=BAD')) return { ok: false, status: 400, statusText: 'Bad', text: async () => JSON.stringify({error:{message:'API key not valid'}}) };
    const enc = new w.TextEncoder(); const chunks = ['data: {"candidates":[{"content":{"parts":[{"text":"OK"}]}}]}\n\n'];
    let i = 0; return { ok: true, status: 200, body: { getReader: () => ({ read: async () => i < chunks.length ? { value: enc.encode(chunks[i++]), done: false } : { done: true }, cancel: async () => {} }) } };
  };
  const card = w.document.querySelector('#onboardModal [data-prov=gemini]');
  card.querySelector('[data-key]').value = 'AIzaBAD';
  // force BAD path via key content
  card.querySelector('[data-key]').value = 'BAD';
  await ev('Onboard.test(document.querySelector("#onboardModal [data-prov=gemini]"))');
  console.log('bad key status:', card.querySelector('[data-st]').textContent, '| mode:', ev('LLM.mode()'));
  card.querySelector('[data-key]').value = 'AIzaGOOD';
  await ev('Onboard.test(document.querySelector("#onboardModal [data-prov=gemini]"))');
  console.log('good key status:', card.querySelector('[data-st]').textContent, '| mode:', ev('LLM.mode()'), '| pill:', w.document.querySelector('#modePill').textContent, '| cta gone:', !w.document.querySelector('.cta-key'));
  ev('Settings.s.provider="mock"; Settings.save()');
  const results = {};
  for (const q of ['Build a pomodoro timer app', 'Write a script that finds prime numbers and run it', 'Read /README.md and summarize it', 'Write a launch plan doc for a one-time-purchase micro tool', 'Send a webhook payload announcing the release', 'My name is Iggy and I prefer terse answers', 'Build a pomodoro timer app']) {
    await send(q);
    const last = ev('Chat.messages[Chat.messages.length-1]');
    results[q] = { steps: last.steps.length, meta: last.meta, err: last.error || false, tail: last.steps.at(-1).text.slice(0, 90).replace(/\n/g, ' ') };
  }
  console.log(JSON.stringify(results, null, 1));
  console.log('files:', ev('fs.allFiles()').join(', '));
  console.log('artifacts:', ev('Artifacts.items.map(a=>a.id+":"+a.type+":"+a.complete).join(", ")'));
  console.log('memory:', ev('Memory.facts.map(f=>f.text).join(" | ")'));
  console.log('approvals:', approvals);
  console.log('snapshots:', ev('Snapshots.list.length'));
  // shell
  const sh = await ev('Shell.run("ls /src | grep main && echo hi > /tmp/x.txt && cat /tmp/x.txt && wc -l /README.md && find / -name \'*.md\'")');
  console.log('shell:', JSON.stringify(sh));
  // undo
  const before = ev('fs.isFile("/tmp/x.txt")'); ev('Snapshots.take("t")'); ev('fs.rm("/tmp/x.txt")'); ev('Snapshots.undo()');
  console.log('undo restored:', before, ev('fs.isFile("/tmp/x.txt")'));
  // SSE parser test with fake stream
  const r = await ev(`(async()=>{ const enc=new TextEncoder(); const chunks=['data: {"a":1}\\n','\\ndata: {"a"',':2}\\r\\n\\r\\n','data: [DONE]\\n\\n']; const res={body:{getReader(){let i=0;return{read:async()=>i<chunks.length?{value:enc.encode(chunks[i++]),done:false}:{done:true},cancel:async()=>{}}}}}; const got=[]; await SSE.read(res,null,d=>{ if(d==='[DONE]') return SSE.DONE; got.push(JSON.parse(d).a); }); return got.join(','); })()`);
  console.log('sse:', r);
  // muse goal
  ev('Settings.s.queueActive=false');
  await ev('Muse.addGoal("Build a todo app and verify it")');
  ev('Muse.setActive(true)');
  for (let i = 0; i < 80; i++) { await sleep(250); if (ev('Muse.goals[0].status') === 'done' || ev('Muse.goals[0].status') === 'failed') break; }
  console.log('goal:', ev('Muse.goals[0].status'), ev('Muse.tasks.map(t=>t.localId+":"+t.status+":"+t.verification).join(" || ")'));
  // rollback a task
  const tid = ev('Muse.tasks.find(t=>t.localId==="t2").id'); ev(`Muse.rollback("${tid}")`);
  console.log('after rollback goal file exists:', ev('fs.allFiles().some(f=>f.startsWith("/goals/build-a-todo-app"))'));
  console.log('ERRORS:', errors.length ? errors : 'none');
  process.exit(0);
})().catch(e => { console.error('FATAL', e); console.log(errors); process.exit(1); });
