import assert from 'node:assert/strict';
import {analyticsEnabled, initGoogleAnalytics} from '../assets/analytics.js';

const disabled={provider:'google_analytics_4',measurementId:'',enabledHosts:['www.ravenlong.com']};
const active={...disabled,measurementId:'G-ABC123XYZ9'};
assert.equal(analyticsEnabled(disabled,'www.ravenlong.com'),false);
assert.equal(analyticsEnabled({...active,measurementId:'G-INVALID!"'},'www.ravenlong.com'),false);
assert.equal(analyticsEnabled(active,'yolong.bournelong511.workers.dev'),false);
assert.equal(analyticsEnabled(active,'www.ravenlong.com'),true);

const scripts=[],listeners={};
globalThis.window={
  location:{hostname:'www.ravenlong.com',pathname:'/about/zh/',origin:'https://www.ravenlong.com',
    href:'https://www.ravenlong.com/about/zh/'},
  dataLayer:[]
};
globalThis.document={
  title:'关于我 · RAVEN',
  createElement:()=>({}),
  head:{appendChild:node=>scripts.push(node)},
  addEventListener:(name,callback)=>{listeners[name]=callback}
};
assert.equal(initGoogleAnalytics(disabled,{lang:'zh',section:'about'}),false);
assert.equal(scripts.length,0,'No third-party script without a real Measurement ID');
assert.equal(initGoogleAnalytics(active,{lang:'zh',section:'about'}),true);
assert.equal(scripts.length,1);
assert.match(scripts[0].src,/googletagmanager\.com\/gtag\/js\?id=G-ABC123XYZ9/);
assert.equal(window.dataLayer.length,3);
assert.equal(window.dataLayer[2][0],'event');
assert.equal(window.dataLayer[2][1],'page_view');
assert.equal(window.dataLayer[2][2].page_path,'/about/zh/');
assert.equal(window.dataLayer[2][2].language,'zh');
assert.equal(initGoogleAnalytics(active,{lang:'zh'}),true);
assert.equal(scripts.length,1,'No duplicate Google script on rerender');
listeners.click({target:{closest:selector=>selector==='a[href]'?{
  getAttribute:()=>'/about/en/',
  closest:selector=>selector==='.switch'?true:false
}:null}});
assert.equal(window.dataLayer[3][1],'language_switch');
assert.equal(window.dataLayer[3][2].target_language,'en');
console.log('GA4 integration validated: no-ID disabled, production only, one page view, no duplicate tag, language event.');
