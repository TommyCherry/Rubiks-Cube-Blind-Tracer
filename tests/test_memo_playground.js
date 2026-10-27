const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = ['memo_lexicon.js','memo_actions.js','memo_story.js','memo_playground.js']
    .map(file => fs.readFileSync(`static/${file}`, 'utf8')).join('\n');
function element() {
    const handlers = {};
    let ownText='';
    return {value:'', hidden:true, children:[],
        get textContent(){return ownText+this.children.map(c=>c.textContent).join('');},
        set textContent(value){ownText=value;this.children=[];},
        addEventListener(type,fn){handlers[type]=fn;},
        fire(type){handlers[type]?.({preventDefault(){}});},
        replaceChildren(){this.children=[];ownText='';},
        appendChild(child){this.children.push(child);}, focus(){this.focused=true;}};
}
function fixture() {
    const elements={};
    const ids=['story-playground-form','story-input','story-density','story-playground-status',
        'story-playground-result','story-playground-sentence','story-playground-meaning',
        'story-density-value','story-example','story-clear'];
    ids.forEach(id=>elements[id]=element());
    elements['story-density'].value='2';
    let ready;
    const context={document:{getElementById:id=>elements[id],createElement:element,
        addEventListener:(_,fn)=>ready=fn}, fetch(){throw new Error('Network should not be used');}};
    vm.runInNewContext(source,context);ready();
    return {context,e:elements};
}
test('parses phrases and annotations without losing order and validates limits',()=>{
    const {context}=fixture();
    const cues=context.parsePlaygroundWords(' apple juice, teddy bear\nkeyboard (qwerty)\r\n[Q] ');
    assert.deepEqual(Array.from(cues,c=>c.text),['apple juice','teddy bear','keyboard (qwerty)','[Q]']);
    assert.equal(cues[3].image,false);
    for(const text of ['',', \n', 'x'.repeat(121), Array(61).fill('cat').join(','),'x'.repeat(7201)])
        assert.throws(()=>context.parsePlaygroundWords(text));
});
test('example generates locally, slider updates output, clear removes results',()=>{
    const {e}=fixture();
    e['story-example'].fire('click');
    assert.equal(e['story-playground-result'].hidden,false);
    assert.match(e['story-playground-sentence'].textContent,/soaks/);
    assert.match(e['story-playground-meaning'].textContent,/still wet/);
    e['story-density'].value='0';e['story-density'].fire('input');
    assert.equal(e['story-playground-sentence'].textContent,'apple juice → teddy bear → keyboard (qwerty) → cog.');
    assert.match(e['story-playground-meaning'].textContent,/still wet/);
    e['story-clear'].fire('click');
    assert.equal(e['story-input'].value,'');
    assert.equal(e['story-playground-result'].hidden,true);
    assert.equal(e['story-playground-meaning'].textContent,'');
    assert.equal(e['story-input'].focused,true);
});
test('submit displays literal user text safely, keeps markers and explains errors',()=>{
    const {e,context}=fixture();
    e['story-input'].value='<img src=x onerror=alert(1)>, boy, [Q]';
    e['story-playground-form'].fire('submit');
    assert.match(e['story-playground-sentence'].textContent,/<img src=x onerror=alert\(1\)>/);
    assert.match(e['story-playground-sentence'].textContent,/\[Q\]$/);
    assert.equal(e['story-playground-meaning'].children.length,0);
    e['story-input'].value='x'.repeat(121);e['story-playground-form'].fire('submit');
    assert.match(e['story-playground-status'].textContent,/120 characters/);
    assert.equal(e['story-playground-result'].hidden,true);
    e['story-input'].value='boy, head';e['story-playground-form'].fire('submit');
    assert.equal(e['story-playground-result'].hidden,false);
    context.memoStoryPlan=()=>{throw new Error('internal diagnostic');};
    e['story-playground-form'].fire('submit');
    assert.equal(e['story-playground-status'].textContent,'Story generation failed. Try changing the words.');
});
