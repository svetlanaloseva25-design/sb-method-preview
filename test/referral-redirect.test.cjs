'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const source=fs.readFileSync(require.resolve('../assets/referral-redirect.js'),'utf8');
const run=href=>{let target;const fallback={};vm.runInNewContext(source,{URL,location:{href,replace:v=>target=v},document:{getElementById:()=>fallback}});if(target)assert.equal(fallback.href,target);return target?new URL(target):null};
test('previous day links open the agreed landing and preserve referral attribution',()=>{
 for(const ref of ['0123456789abcdef','ABCDEFGHIJKLMNOPQRSTUV']){const result=run('https://sb-method.space/day.html?ref='+ref+'&utm_source=telegram#install');assert.equal(result.origin+result.pathname,'https://app.sb-method.space/pwa-install.html');assert.equal(result.searchParams.get('ref'),ref);assert.equal(result.searchParams.get('utm_source'),'telegram');assert.equal(result.hash,'#install');}
 assert.equal(run('https://sb-method.space/day.html').pathname,'/pwa-install.html');
});
test('home invitations redirect, ordinary home visits stay, arbitrary destinations are ignored',()=>{
 assert.equal(run('https://sb-method.space/'),null);assert.equal(run('https://sb-method.space/?ref=bad'),null);
 const r=run('https://sb-method.space/?invite=abc.def&next=https://example.invalid');assert.equal(r.searchParams.get('invite'),'abc.def');assert.equal(r.origin,'https://app.sb-method.space');assert.equal(r.searchParams.has('next'),false);
});
