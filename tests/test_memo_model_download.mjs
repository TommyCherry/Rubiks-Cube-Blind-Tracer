import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createModelFetch} from '../static/memo_model_download.mjs';
const url='https://huggingface.co/mlc-ai/example/resolve/main/params_shard_0.bin';
test('retries interrupted bodies with a fresh redirect and returns only complete bytes', async()=>{
    const calls=[], notices=[];
    const fetch=createModelFetch(async (target,options)=>{
        calls.push({target,options});
        if(calls.length===1) return {ok:true,status:200,arrayBuffer:async()=>{throw new TypeError('network error');}};
        return new Response(new Uint8Array([1,2,3]));
    },{sleep:async()=>{},now:()=>123,onRetry:(...args)=>notices.push(args)});
    const result=await fetch(url);
    assert.deepEqual([...new Uint8Array(await result.arrayBuffer())],[1,2,3]);
    assert.equal(calls.length,2);
    assert.match(calls[1].target,/memo_retry=123-1/);
    assert.equal(calls[1].options.cache,'no-store');
    assert.equal(notices.length,1);
});
test('bounded retries reject partial responses and stop on permanent errors',async()=>{
    let calls=0;
    const fetch=createModelFetch(async()=>{calls++;return new Response('partial',{status:206});},{sleep:async()=>{}});
    await assert.rejects(fetch(url),/206/);assert.equal(calls,3);
    calls=0;
    const missing=createModelFetch(async()=>{calls++;return new Response('missing',{status:404});},{sleep:async()=>{}});
    await assert.rejects(missing(url),/404/);assert.equal(calls,1);
});
test('other traffic and explicit range requests are untouched',async()=>{
    const options={headers:{Range:'bytes=0-10'}};let last;
    const fetch=createModelFetch(async (...args)=>{last=args;return new Response('ok');});
    await fetch(url,options);assert.equal(last[0],url);assert.equal(last[1],options);
    await fetch('https://example.com/data');assert.equal(last[0],'https://example.com/data');
});
test('limits concurrent asset requests and releases slots after failures',async()=>{
    let active=0,peak=0;
    const fetch=createModelFetch(async()=>{
        active++;peak=Math.max(peak,active);
        await new Promise(resolve=>setTimeout(resolve,5));active--;
        return new Response('ok');
    });
    await Promise.all(Array.from({length:6},(_,i)=>fetch(url+'?part='+i)));
    assert.equal(peak,2);
});
test('generation errors distinguish response limits from GPU failures without blaming word count',async()=>{
    const {memoGenerationError,memoStorySchema}=await import('../static/memo_ai_format.mjs');
    const limit=memoGenerationError(Object.assign(new Error('length'),{code:'response_limit'}));
    assert.equal(limit.code,'response_limit');
    assert.match(limit.text,/not a word-count error/);
    assert.equal(memoGenerationError(new Error('GPU device lost')).code,'gpu_failure');
    assert.doesNotMatch(memoGenerationError(new Error('internal')).text,/fewer images/);
    assert.equal(memoStorySchema(1).properties.links.maxItems,0);
    assert.throws(()=>memoStorySchema(13));
});
