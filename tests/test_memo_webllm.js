const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function setup(){
    const context=vm.createContext({setTimeout,clearTimeout});
    vm.runInContext(fs.readFileSync('static/memo_webllm.js','utf8'),context);
    return {context,Client:vm.runInContext('MemoWebLLMClient',context)};
}
const cue=text=>({text,original:text,image:true});
const reply=(story='{{0}} splashes {{1}}.',explanation='{{0}} pours over {{1}}.')=>JSON.stringify({story,explanation});
function fakeWorker(){return {messages:[],terminated:false,postMessage(message){this.messages.push(message);},
    reply(value){this.onmessage({data:{id:this.messages.at(-1).id,type:'result',value}});},
    terminate(){this.terminated=true;}};}
const gpu={requestAdapter:async()=>({features:new Set(['shader-f16'])})};
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('strict placeholders preserve order, repeated cues and safe literal rendering',()=>{
    const {context:c}=setup();
    const plan=c.memoAIParse(reply(),[cue('cat'),cue('<img onerror=alert(1)>')]);
    assert.deepEqual(Array.from(plan.parts.filter(p=>p.kind==='cue'),p=>p.text),['cat','<img onerror=alert(1)>']);
    for(const text of [reply('{{1}} then {{0}}.'),reply('{{0}} then {{0}}.'),reply('{{0}}.'),reply('{{0}} {{1}} {{2}}'),reply('{{00}} {{1}}'),reply('{{0}} {{1}} {{oops}}'),'not JSON'])
        assert.throws(()=>c.memoAIParse(text,[cue('cat'),cue('cat')]));
    assert.equal(c.memoAIParse(reply(),[cue('cat'),cue('cat')]).parts.filter(p=>p.kind==='cue').length,2);
});
test('unsupported devices and invalid inputs never start a worker',async()=>{
    const {Client}=setup();let created=0;
    const client=new Client('/worker.js',{secure:false,gpu,workerFactory(){created++;}});
    await assert.rejects(client.generate([cue('cat')]),/WebGPU/);
    await assert.rejects(client.generate(Array(13).fill(cue('cat'))),/1–12/);
    assert.equal(created,0);
});
test('lazy worker loads once, reports progress and separates annotated groups',async()=>{
    const {Client}=setup();const worker=fakeWorker();let created=0;const progress=[];
    const client=new Client('/worker.js',{gpu,secure:true,workerFactory(){created++;return worker;}});
    assert.equal(created,0);
    const generation=client.generate([cue('juice'),cue('cat'),{text:'[Q]',image:false},cue('boy')],v=>progress.push(v));
    await tick();
    assert.equal(worker.messages[0].type,'load');
    assert.match(worker.messages[0].payload.model,/q4f16/);
    worker.onmessage({data:{id:worker.messages[0].id,type:'progress',text:'Loading weights'}});
    worker.reply(true);await tick();
    assert.equal(worker.messages[1].type,'generate');
    assert.equal(JSON.parse(worker.messages[1].payload.messages[1].content).images.length,2);
    worker.reply(reply());await tick();
    assert.equal(JSON.parse(worker.messages[2].payload.messages[1].content).images.length,1);
    worker.reply(reply('{{0}} takes a bow.','Imagine {{0}} bowing.'));
    const plan=await generation;
    assert.ok(plan.parts.some(p=>p.kind==='annotation'&&p.text.includes('[Q]')));
    assert.deepEqual(Array.from(plan.parts.filter(p=>p.kind==='cue'),p=>p.text),['juice','cat','boy']);
    assert.ok(progress.includes('Loading weights'));
    assert.equal(client.ready,true);
    await client.load();assert.equal(created,1);
    client.stop();assert.equal(worker.terminated,true);
});
test('stop cancels loading, rejects in-flight work, and ignores late results',async()=>{
    const {Client}=setup();const worker=fakeWorker();const client=new Client('/worker.js',{gpu,secure:true,workerFactory:()=>worker});
    const loading=client.load();await tick();
    client.stop();await assert.rejects(loading,/stopped/);
    worker.reply(true);assert.equal(client.ready,false);
    let resolveAdapter,created=0;
    const early=new Client('/worker.js',{secure:true,gpu:{requestAdapter:()=>new Promise(r=>resolveAdapter=r)},workerFactory(){created++;}});
    const pending=early.load();early.stop();resolveAdapter({features:new Set()});
    await assert.rejects(pending,/stopped/);assert.equal(created,0);
});
test('worker failures reset readiness and malformed output never becomes a story',async()=>{
    const {Client}=setup();const worker=fakeWorker();const client=new Client('/worker.js',{gpu,secure:true,workerFactory:()=>worker});
    const first=client.generate([cue('cat')]);await tick();worker.onerror();
    await assert.rejects(first,/could not start/);assert.equal(client.ready,false);
    const second=client.generate([cue('cat')]);await tick();worker.reply(true);await tick();worker.reply('bad json');
    await assert.rejects(second,/unreadable/);client.stop();
});
test('natural explanations do not reject an otherwise correctly ordered story',()=>{
    const {context:c}=setup();
    const plan=c.memoAIParse(reply('{{0}} soaks {{1}}.', 'Imagine apple juice soaking the teddy bear, which drips onto the floor.'),[cue('apple juice'),cue('teddy bear')]);
    assert.match(plan.explanation.map(p=>p.text).join(''),/teddy bear/);
    const repeated=c.memoAIParse(reply('{{0}} soaks {{1}}.', '{{1}} is wet because {{0}} soaked {{1}}.'),[cue('juice'),cue('bear')]);
    assert.deepEqual(Array.from(repeated.explanation.filter(p=>p.kind==='cue'),p=>p.text),['bear','juice','bear']);
    assert.throws(()=>c.memoAIParse(reply('{{0}} soaks {{1}}.', '{{99}} is wet.'),[cue('juice'),cue('bear')]),/invalid placeholders/);
});
test('connector output inserts Shaq and orange juice in order without placeholder decoding',()=>{
    const {context:c}=setup();
    const data={opening:'',links:[' pours a towering glass of '],ending:'.',explanation:'Imagine Shaq pouring orange juice into an enormous glass.'};
    const plan=c.memoAIParse(JSON.stringify(data),[cue('shaq'),cue('orange juice')]);
    assert.equal(plan.parts.map(p=>p.text).join(''),'shaq pours a towering glass of orange juice.');
    assert.deepEqual(Array.from(plan.parts.filter(p=>p.kind==='cue'),p=>p.text),['shaq','orange juice']);
    for(const links of [[],[' one ',' two '],[null]]) assert.throws(()=>c.memoAIParse(JSON.stringify({...data,links}),[cue('shaq'),cue('orange juice')]));
    assert.throws(()=>c.memoAIParse('null',[cue('shaq')]));
});

test('connector cleanup removes duplicate labels and preserves whole words',()=>{
    const {context:c}=setup();
    vm.runInContext(fs.readFileSync('static/memo_lexicon.js','utf8'),c);
    const parse=(data,words)=>c.memoAIParse(JSON.stringify(data),words.map(cue)).parts.map(p=>p.text).join('');
    assert.equal(parse({opening:'Shaquille',links:[' drinks an orange juice '],ending:'orange juice in his hand. ',explanation:'Shaq drinks juice.'},['shaq','orange juice']),'shaq drinks orange juice in his hand.');
    assert.equal(parse({opening:'The cat',links:[' visits a cathedral with '],ending:'.',explanation:'A visit.'},['cat','dog']),'The cat visits a cathedral with dog.');
    assert.equal(parse({opening:'',links:[' carries keyboard (QWerty) beside '],ending:'.',explanation:'A keyboard.'},['keyboard (QWerty)','cat']),'keyboard (QWerty) carries beside cat.');
});
