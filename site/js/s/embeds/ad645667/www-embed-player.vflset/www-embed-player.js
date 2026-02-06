(function(){'use strict';var n,aa=typeof Object.create=="function"?Object.create:function(a){function b(){}
b.prototype=a;return new b},ba=typeof Object.defineProperties=="function"?Object.defineProperty:function(a,b,c){if(a==Array.prototype||a==Object.prototype)return a;
a[b]=c.value;return a};
function ca(a){a=["object"==typeof globalThis&&globalThis,a,"object"==typeof window&&window,"object"==typeof self&&self,"object"==typeof global&&global];for(var b=0;b<a.length;++b){var c=a[b];if(c&&c.Math==Math)return c}throw Error("Cannot find global object");}
var da=ca(this);function u(a,b){if(b)a:{var c=da;a=a.split(".");for(var d=0;d<a.length-1;d++){var e=a[d];if(!(e in c))break a;c=c[e]}a=a[a.length-1];d=c[a];b=b(d);b!=d&&b!=null&&ba(c,a,{configurable:!0,writable:!0,value:b})}}
var ea=function(){function a(){function c(){}
new c;Reflect.construct(c,[],function(){});
return new c instanceof c}
if(typeof Reflect!="undefined"&&Reflect.construct){if(a())return Reflect.construct;var b=Reflect.construct;return function(c,d,e){c=b(c,d);e&&Reflect.setPrototypeOf(c,e.prototype);return c}}return function(c,d,e){e===void 0&&(e=c);
e=aa(e.prototype||Object.prototype);return Function.prototype.apply.call(c,e,d)||e}}(),fa;
if(typeof Object.setPrototypeOf=="function")fa=Object.setPrototypeOf;else{var ha;a:{var ia={a:!0},ka={};try{ka.__proto__=ia;ha=ka.a;break a}catch(a){}ha=!1}fa=ha?function(a,b){a.__proto__=b;if(a.__proto__!==b)throw new TypeError(a+" is not extensible");return a}:null}var la=fa;
function v(a,b){a.prototype=aa(b.prototype);a.prototype.constructor=a;if(la)la(a,b);else for(var c in b)if(c!="prototype")if(Object.defineProperties){var d=Object.getOwnPropertyDescriptor(b,c);d&&Object.defineProperty(a,c,d)}else a[c]=b[c];a.Ga=b.prototype}
function oa(a){var b=0;return function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}}}
function z(a){var b=typeof Symbol!="undefined"&&Symbol.iterator&&a[Symbol.iterator];if(b)return b.call(a);if(typeof a.length=="number")return{next:oa(a)};throw Error(String(a)+" is not an iterable or ArrayLike");}
function A(a){if(!(a instanceof Array)){a=z(a);for(var b,c=[];!(b=a.next()).done;)c.push(b.value);a=c}return a}
function pa(a){return qa(a,a)}
function qa(a,b){a.raw=b;Object.freeze&&(Object.freeze(a),Object.freeze(b));return a}
function ra(a,b){return Object.prototype.hasOwnProperty.call(a,b)}
var sa=typeof Object.assign=="function"?Object.assign:function(a,b){if(a==null)throw new TypeError("No nullish arg");a=Object(a);for(var c=1;c<arguments.length;c++){var d=arguments[c];if(d)for(var e in d)ra(d,e)&&(a[e]=d[e])}return a};
u("Object.assign",function(a){return a||sa});
function ta(a){if(!(a instanceof Object))throw new TypeError("Iterator result "+a+" is not an object");}
function B(){this.X=!1;this.I=null;this.i=void 0;this.h=1;this.G=this.M=0;this.na=this.H=null}
function ua(a){if(a.X)throw new TypeError("Generator is already running");a.X=!0}
B.prototype.ja=function(a){this.i=a};
function va(a,b){a.H={exception:b,be:!0};a.h=a.M||a.G}
B.prototype.getNextAddressJsc=function(){return this.h};
B.prototype.getYieldResultJsc=function(){return this.i};
B.prototype.return=function(a){this.H={return:a};this.h=this.G};
B.prototype["return"]=B.prototype.return;B.prototype.Ka=function(a){this.H={v:a};this.h=this.G};
B.prototype.jumpThroughFinallyBlocks=B.prototype.Ka;B.prototype.yield=function(a,b){this.h=b;return{value:a}};
B.prototype.yield=B.prototype.yield;B.prototype.Ra=function(a,b){a=z(a);var c=a.next();ta(c);if(c.done)this.i=c.value,this.h=b;else return this.I=a,this.yield(c.value,b)};
B.prototype.yieldAll=B.prototype.Ra;B.prototype.v=function(a){this.h=a};
B.prototype.jumpTo=B.prototype.v;B.prototype.o=function(){this.h=0};
B.prototype.jumpToEnd=B.prototype.o;B.prototype.u=function(a,b){this.M=a;b!=void 0&&(this.G=b)};
B.prototype.setCatchFinallyBlocks=B.prototype.u;B.prototype.La=function(a){this.M=0;this.G=a||0};
B.prototype.setFinallyBlock=B.prototype.La;B.prototype.B=function(a,b){this.h=a;this.M=b||0};
B.prototype.leaveTryBlock=B.prototype.B;B.prototype.j=function(a){this.M=a||0;a=this.H.exception;this.H=null;return a};
B.prototype.enterCatchBlock=B.prototype.j;B.prototype.Z=function(a,b,c){c?this.na[c]=this.H:this.na=[this.H];this.M=a||0;this.G=b||0};
B.prototype.enterFinallyBlock=B.prototype.Z;B.prototype.fa=function(a,b){b=this.na.splice(b||0)[0];(b=this.H=this.H||b)?b.be?this.h=this.M||this.G:b.v!=void 0&&this.G<b.v?(this.h=b.v,this.H=null):this.h=this.G:this.h=a};
B.prototype.leaveFinallyBlock=B.prototype.fa;B.prototype.Da=function(a){return new wa(a)};
B.prototype.forIn=B.prototype.Da;function wa(a){this.j=a;this.h=[];for(var b in a)this.h.push(b);this.h.reverse()}
wa.prototype.i=function(){for(;this.h.length>0;){var a=this.h.pop();if(a in this.j)return a}return null};
wa.prototype.getNext=wa.prototype.i;function xa(a){this.h=new B;this.i=a}
function ya(a,b){ua(a.h);var c=a.h.I;if(c)return za(a,"return"in c?c["return"]:function(d){return{value:d,done:!0}},b,a.h.return);
a.h.return(b);return Aa(a)}
function za(a,b,c,d){try{var e=b.call(a.h.I,c);ta(e);if(!e.done)return a.h.X=!1,e;var f=e.value}catch(g){return a.h.I=null,va(a.h,g),Aa(a)}a.h.I=null;d.call(a.h,f);return Aa(a)}
function Aa(a){for(;a.h.h;)try{var b=a.i(a.h);if(b)return a.h.X=!1,{value:b.value,done:!1}}catch(c){a.h.i=void 0,va(a.h,c)}a.h.X=!1;if(a.h.H){b=a.h.H;a.h.H=null;if(b.be)throw b.exception;return{value:b.return,done:!0}}return{value:void 0,done:!0}}
function Ba(a){this.next=function(b){ua(a.h);a.h.I?b=za(a,a.h.I.next,b,a.h.ja):(a.h.ja(b),b=Aa(a));return b};
this.throw=function(b){ua(a.h);a.h.I?b=za(a,a.h.I["throw"],b,a.h.ja):(va(a.h,b),b=Aa(a));return b};
this.return=function(b){return ya(a,b)};
this[Symbol.iterator]=function(){return this}}
function Ca(a){function b(d){return a.next(d)}
function c(d){return a.throw(d)}
return new Promise(function(d,e){function f(g){g.done?d(g.value):Promise.resolve(g.value).then(b,c).then(f,e)}
f(a.next())})}
function C(a){return Ca(new Ba(new xa(a)))}
function D(){for(var a=Number(this),b=[],c=a;c<arguments.length;c++)b[c-a]=arguments[c];return b}
u("globalThis",function(a){return a||da});
u("Reflect",function(a){return a?a:{}});
u("Reflect.construct",function(){return ea});
u("Reflect.setPrototypeOf",function(a){return a?a:la?function(b,c){try{return la(b,c),!0}catch(d){return!1}}:null});
u("Symbol",function(a){function b(f){if(this instanceof b)throw new TypeError("Symbol is not a constructor");return new c(d+(f||"")+"_"+e++,f)}
function c(f,g){this.h=f;ba(this,"description",{configurable:!0,writable:!0,value:g})}
if(a)return a;c.prototype.toString=function(){return this.h};
var d="jscomp_symbol_"+(Math.random()*1E9>>>0)+"_",e=0;return b});
u("Symbol.iterator",function(a){if(a)return a;a=Symbol("Symbol.iterator");ba(Array.prototype,a,{configurable:!0,writable:!0,value:function(){return Da(oa(this))}});
return a});
function Da(a){a={next:a};a[Symbol.iterator]=function(){return this};
return a}
u("Promise",function(a){function b(g){this.ea=0;this.lb=void 0;this.h=[];this.u=!1;var h=this.i();try{g(h.resolve,h.reject)}catch(k){h.reject(k)}}
function c(){this.h=null}
function d(g){return g instanceof b?g:new b(function(h){h(g)})}
if(a)return a;c.prototype.i=function(g){if(this.h==null){this.h=[];var h=this;this.j(function(){h.u()})}this.h.push(g)};
var e=da.setTimeout;c.prototype.j=function(g){e(g,0)};
c.prototype.u=function(){for(;this.h&&this.h.length;){var g=this.h;this.h=[];for(var h=0;h<g.length;++h){var k=g[h];g[h]=null;try{k()}catch(l){this.o(l)}}}this.h=null};
c.prototype.o=function(g){this.j(function(){throw g;})};
b.prototype.i=function(){function g(l){return function(m){k||(k=!0,l.call(h,m))}}
var h=this,k=!1;return{resolve:g(this.M),reject:g(this.j)}};
b.prototype.M=function(g){if(g===this)this.j(new TypeError("A Promise cannot resolve to itself"));else if(g instanceof b)this.Z(g);else{a:switch(typeof g){case "object":var h=g!=null;break a;case "function":h=!0;break a;default:h=!1}h?this.I(g):this.o(g)}};
b.prototype.I=function(g){var h=void 0;try{h=g.then}catch(k){this.j(k);return}typeof h=="function"?this.fa(h,g):this.o(g)};
b.prototype.j=function(g){this.H(2,g)};
b.prototype.o=function(g){this.H(1,g)};
b.prototype.H=function(g,h){if(this.ea!=0)throw Error("Cannot settle("+g+", "+h+"): Promise already settled in state"+this.ea);this.ea=g;this.lb=h;this.ea===2&&this.X();this.B()};
b.prototype.X=function(){var g=this;e(function(){if(g.G()){var h=da.console;typeof h!=="undefined"&&h.error(g.lb)}},1)};
b.prototype.G=function(){if(this.u)return!1;var g=da.CustomEvent,h=da.Event,k=da.dispatchEvent;if(typeof k==="undefined")return!0;typeof g==="function"?g=new g("unhandledrejection",{cancelable:!0}):typeof h==="function"?g=new h("unhandledrejection",{cancelable:!0}):(g=da.document.createEvent("CustomEvent"),g.initCustomEvent("unhandledrejection",!1,!0,g));g.promise=this;g.reason=this.lb;return k(g)};
b.prototype.B=function(){if(this.h!=null){for(var g=0;g<this.h.length;++g)f.i(this.h[g]);this.h=null}};
var f=new c;b.prototype.Z=function(g){var h=this.i();g.Dc(h.resolve,h.reject)};
b.prototype.fa=function(g,h){var k=this.i();try{g.call(h,k.resolve,k.reject)}catch(l){k.reject(l)}};
b.prototype.then=function(g,h){function k(r,t){return typeof r=="function"?function(w){try{l(r(w))}catch(y){m(y)}}:t}
var l,m,p=new b(function(r,t){l=r;m=t});
this.Dc(k(g,l),k(h,m));return p};
b.prototype.catch=function(g){return this.then(void 0,g)};
b.prototype.Dc=function(g,h){function k(){switch(l.ea){case 1:g(l.lb);break;case 2:h(l.lb);break;default:throw Error("Unexpected state: "+l.ea);}}
var l=this;this.h==null?f.i(k):this.h.push(k);this.u=!0};
b.resolve=d;b.reject=function(g){return new b(function(h,k){k(g)})};
b.race=function(g){return new b(function(h,k){for(var l=z(g),m=l.next();!m.done;m=l.next())d(m.value).Dc(h,k)})};
b.all=function(g){var h=z(g),k=h.next();return k.done?d([]):new b(function(l,m){function p(w){return function(y){r[w]=y;t--;t==0&&l(r)}}
var r=[],t=0;do r.push(void 0),t++,d(k.value).Dc(p(r.length-1),m),k=h.next();while(!k.done)})};
return b});
u("Object.setPrototypeOf",function(a){return a||la});
u("Symbol.dispose",function(a){return a?a:Symbol("Symbol.dispose")});
u("SuppressedError",function(a){function b(c,d,e){if(!(this instanceof b))return new b(c,d,e);e=Error(e);"stack"in e&&(this.stack=e.stack);this.message=e.message;this.error=c;this.suppressed=d}
if(a)return a;v(b,Error);b.prototype.name="SuppressedError";return b});
u("WeakMap",function(a){function b(k){this.h=(h+=Math.random()+1).toString();if(k){k=z(k);for(var l;!(l=k.next()).done;)l=l.value,this.set(l[0],l[1])}}
function c(){}
function d(k){var l=typeof k;return l==="object"&&k!==null||l==="function"}
function e(k){if(!ra(k,g)){var l=new c;ba(k,g,{value:l})}}
function f(k){var l=Object[k];l&&(Object[k]=function(m){if(m instanceof c)return m;Object.isExtensible(m)&&e(m);return l(m)})}
if(function(){if(!a||!Object.seal)return!1;try{var k=Object.seal({}),l=Object.seal({}),m=new a([[k,2],[l,3]]);if(m.get(k)!=2||m.get(l)!=3)return!1;m.delete(k);m.set(l,4);return!m.has(k)&&m.get(l)==4}catch(p){return!1}}())return a;
var g="$jscomp_hidden_"+Math.random();f("freeze");f("preventExtensions");f("seal");var h=0;b.prototype.set=function(k,l){if(!d(k))throw Error("Invalid WeakMap key");e(k);if(!ra(k,g))throw Error("WeakMap key fail: "+k);k[g][this.h]=l;return this};
b.prototype.get=function(k){return d(k)&&ra(k,g)?k[g][this.h]:void 0};
b.prototype.has=function(k){return d(k)&&ra(k,g)&&ra(k[g],this.h)};
b.prototype.delete=function(k){return d(k)&&ra(k,g)&&ra(k[g],this.h)?delete k[g][this.h]:!1};
return b});
u("Map",function(a){function b(){var h={};return h.previous=h.next=h.head=h}
function c(h,k){var l=h[1];return Da(function(){if(l){for(;l.head!=h[1];)l=l.previous;for(;l.next!=l.head;)return l=l.next,{done:!1,value:k(l)};l=null}return{done:!0,value:void 0}})}
function d(h,k){var l=k&&typeof k;l=="object"||l=="function"?f.has(k)?l=f.get(k):(l=""+ ++g,f.set(k,l)):l="p_"+k;var m=h[0][l];if(m&&ra(h[0],l))for(h=0;h<m.length;h++){var p=m[h];if(k!==k&&p.key!==p.key||k===p.key)return{id:l,list:m,index:h,entry:p}}return{id:l,list:m,index:-1,entry:void 0}}
function e(h){this[0]={};this[1]=b();this.size=0;if(h){h=z(h);for(var k;!(k=h.next()).done;)k=k.value,this.set(k[0],k[1])}}
if(function(){if(!a||typeof a!="function"||!a.prototype.entries||typeof Object.seal!="function")return!1;try{var h=Object.seal({x:4}),k=new a(z([[h,"s"]]));if(k.get(h)!="s"||k.size!=1||k.get({x:4})||k.set({x:4},"t")!=k||k.size!=2)return!1;var l=k.entries(),m=l.next();if(m.done||m.value[0]!=h||m.value[1]!="s")return!1;m=l.next();return m.done||m.value[0].x!=4||m.value[1]!="t"||!l.next().done?!1:!0}catch(p){return!1}}())return a;
var f=new WeakMap;e.prototype.set=function(h,k){h=h===0?0:h;var l=d(this,h);l.list||(l.list=this[0][l.id]=[]);l.entry?l.entry.value=k:(l.entry={next:this[1],previous:this[1].previous,head:this[1],key:h,value:k},l.list.push(l.entry),this[1].previous.next=l.entry,this[1].previous=l.entry,this.size++);return this};
e.prototype.delete=function(h){h=d(this,h);return h.entry&&h.list?(h.list.splice(h.index,1),h.list.length||delete this[0][h.id],h.entry.previous.next=h.entry.next,h.entry.next.previous=h.entry.previous,h.entry.head=null,this.size--,!0):!1};
e.prototype.clear=function(){this[0]={};this[1]=this[1].previous=b();this.size=0};
e.prototype.has=function(h){return!!d(this,h).entry};
e.prototype.get=function(h){return(h=d(this,h).entry)&&h.value};
e.prototype.entries=function(){return c(this,function(h){return[h.key,h.value]})};
e.prototype.keys=function(){return c(this,function(h){return h.key})};
e.prototype.values=function(){return c(this,function(h){return h.value})};
e.prototype.forEach=function(h,k){for(var l=this.entries(),m;!(m=l.next()).done;)m=m.value,h.call(k,m[1],m[0],this)};
e.prototype[Symbol.iterator]=e.prototype.entries;var g=0;return e});
u("Set",function(a){function b(c){this.h=new Map;if(c){c=z(c);for(var d;!(d=c.next()).done;)this.add(d.value)}this.size=this.h.size}
if(function(){if(!a||typeof a!="function"||!a.prototype.entries||typeof Object.seal!="function")return!1;try{var c=Object.seal({x:4}),d=new a(z([c]));if(!d.has(c)||d.size!=1||d.add(c)!=d||d.size!=1||d.add({x:4})!=d||d.size!=2)return!1;var e=d.entries(),f=e.next();if(f.done||f.value[0]!=c||f.value[1]!=c)return!1;f=e.next();return f.done||f.value[0]==c||f.value[0].x!=4||f.value[1]!=f.value[0]?!1:e.next().done}catch(g){return!1}}())return a;
b.prototype.add=function(c){c=c===0?0:c;this.h.set(c,c);this.size=this.h.size;return this};
b.prototype.delete=function(c){c=this.h.delete(c);this.size=this.h.size;return c};
b.prototype.clear=function(){this.h.clear();this.size=0};
b.prototype.has=function(c){return this.h.has(c)};
b.prototype.entries=function(){return this.h.entries()};
b.prototype.values=function(){return this.h.values()};
b.prototype.keys=b.prototype.values;b.prototype[Symbol.iterator]=b.prototype.values;b.prototype.forEach=function(c,d){var e=this;this.h.forEach(function(f){return c.call(d,f,f,e)})};
return b});
function Fa(a,b){a instanceof String&&(a+="");var c=0,d=!1,e={next:function(){if(!d&&c<a.length){var f=c++;return{value:b(f,a[f]),done:!1}}d=!0;return{done:!0,value:void 0}}};
e[Symbol.iterator]=function(){return e};
return e}
u("Array.prototype.entries",function(a){return a?a:function(){return Fa(this,function(b,c){return[b,c]})}});
u("Array.prototype.keys",function(a){return a?a:function(){return Fa(this,function(b){return b})}});
function Ga(a,b,c){if(a==null)throw new TypeError("The 'this' value for String.prototype."+c+" must not be null or undefined");if(b instanceof RegExp)throw new TypeError("First argument to String.prototype."+c+" must not be a regular expression");return a+""}
u("String.prototype.startsWith",function(a){return a?a:function(b,c){var d=Ga(this,b,"startsWith");b+="";var e=d.length,f=b.length;c=Math.max(0,Math.min(c|0,d.length));for(var g=0;g<f&&c<e;)if(d[c++]!=b[g++])return!1;return g>=f}});
u("String.prototype.endsWith",function(a){return a?a:function(b,c){var d=Ga(this,b,"endsWith");b+="";c===void 0&&(c=d.length);c=Math.max(0,Math.min(c|0,d.length));for(var e=b.length;e>0&&c>0;)if(d[--c]!=b[--e])return!1;return e<=0}});
u("Number.isFinite",function(a){return a?a:function(b){return typeof b!=="number"?!1:!isNaN(b)&&b!==Infinity&&b!==-Infinity}});
u("Array.prototype.find",function(a){return a?a:function(b,c){a:{var d=this;d instanceof String&&(d=String(d));for(var e=d.length,f=0;f<e;f++){var g=d[f];if(b.call(c,g,f,d)){b=g;break a}}b=void 0}return b}});
u("Object.values",function(a){return a?a:function(b){var c=[],d;for(d in b)ra(b,d)&&c.push(b[d]);return c}});
u("Object.is",function(a){return a?a:function(b,c){return b===c?b!==0||1/b===1/c:b!==b&&c!==c}});
u("Array.prototype.includes",function(a){return a?a:function(b,c){var d=this;d instanceof String&&(d=String(d));var e=d.length;c=c||0;for(c<0&&(c=Math.max(c+e,0));c<e;c++){var f=d[c];if(f===b||Object.is(f,b))return!0}return!1}});
u("String.prototype.includes",function(a){return a?a:function(b,c){return Ga(this,b,"includes").indexOf(b,c||0)!==-1}});
u("Array.from",function(a){return a?a:function(b,c,d){c=c!=null?c:function(h){return h};
var e=[],f=typeof Symbol!="undefined"&&Symbol.iterator&&b[Symbol.iterator];if(typeof f=="function"){b=f.call(b);for(var g=0;!(f=b.next()).done;)e.push(c.call(d,f.value,g++))}else for(f=b.length,g=0;g<f;g++)e.push(c.call(d,b[g],g));return e}});
u("Object.entries",function(a){return a?a:function(b){var c=[],d;for(d in b)ra(b,d)&&c.push([d,b[d]]);return c}});
u("Number.MAX_SAFE_INTEGER",function(){return 9007199254740991});
u("Number.MIN_SAFE_INTEGER",function(){return-9007199254740991});
u("Number.isInteger",function(a){return a?a:function(b){return Number.isFinite(b)?b===Math.floor(b):!1}});
u("Number.isSafeInteger",function(a){return a?a:function(b){return Number.isInteger(b)&&Math.abs(b)<=Number.MAX_SAFE_INTEGER}});
u("Math.trunc",function(a){return a?a:function(b){b=Number(b);if(isNaN(b)||b===Infinity||b===-Infinity||b===0)return b;var c=Math.floor(Math.abs(b));return b<0?-c:c}});
u("Number.isNaN",function(a){return a?a:function(b){return typeof b==="number"&&isNaN(b)}});
u("Array.prototype.values",function(a){return a?a:function(){return Fa(this,function(b,c){return c})}});
u("Promise.prototype.finally",function(a){return a?a:function(b){return this.then(function(c){return Promise.resolve(b()).then(function(){return c})},function(c){return Promise.resolve(b()).then(function(){throw c;
})})}});
u("Math.imul",function(a){return a?a:function(b,c){b=Number(b);c=Number(c);var d=b&65535,e=c&65535;return d*e+((b>>>16&65535)*e+d*(c>>>16&65535)<<16>>>0)|0}});/*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
var Ha=Ha||{},E=this||self;function G(a,b,c){a=a.split(".");c=c||E;for(var d;a.length&&(d=a.shift());)a.length||b===void 0?c[d]&&c[d]!==Object.prototype[d]?c=c[d]:c=c[d]={}:c[d]=b}
function Ia(a,b){var c=I("CLOSURE_FLAGS");a=c&&c[a];return a!=null?a:b}
function I(a,b){a=a.split(".");b=b||E;for(var c=0;c<a.length;c++)if(b=b[a[c]],b==null)return null;return b}
function Ja(a){var b=typeof a;return b!="object"?b:a?Array.isArray(a)?"array":b:"null"}
function Ka(a){var b=Ja(a);return b=="array"||b=="object"&&typeof a.length=="number"}
function La(a){var b=typeof a;return b=="object"&&a!=null||b=="function"}
function Ma(a){return Object.prototype.hasOwnProperty.call(a,Na)&&a[Na]||(a[Na]=++Oa)}
var Na="closure_uid_"+(Math.random()*1E9>>>0),Oa=0;function Ra(a,b,c){return a.call.apply(a.bind,arguments)}
function Sa(a,b,c){if(!a)throw Error();if(arguments.length>2){var d=Array.prototype.slice.call(arguments,2);return function(){var e=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(e,d);return a.apply(b,e)}}return function(){return a.apply(b,arguments)}}
function Ta(a,b,c){Ta=Function.prototype.bind&&Function.prototype.bind.toString().indexOf("native code")!=-1?Ra:Sa;return Ta.apply(null,arguments)}
function Ua(a,b){var c=Array.prototype.slice.call(arguments,1);return function(){var d=c.slice();d.push.apply(d,arguments);return a.apply(this,d)}}
function Va(){return Date.now()}
function Wa(a){return a}
function Xa(a,b){function c(){}
c.prototype=b.prototype;a.Ga=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.base=function(d,e,f){for(var g=Array(arguments.length-2),h=2;h<arguments.length;h++)g[h-2]=arguments[h];return b.prototype[e].apply(d,g)}}
;function Ya(a){var b=D.apply(1,arguments).filter(Boolean).join("&");if(!b)return a;var c=a.match(/[?&]adurl=/);return c?a.slice(0,c.index+1)+b+"&"+a.slice(c.index+1):a+(a.indexOf("?")<0?"?":"&")+b}
function Za(a,b){return b?"&"+a+"="+encodeURIComponent(b):""}
function $a(a){var b=a.url;a=a.Nj;this.i=b;this.o=a;this.j=(new Date).getTime()-17040672E5;this.h={};for(var c=/[?&]([^&=]+)=([^&]*)/g;a=c.exec(b);)this.h[a[1]]=a[2]}
function ab(a){a=a.o;if(!a)return"";var b=Za("uap",a.platform)+Za("uapv",a.platformVersion)+Za("uafv",a.uaFullVersion)+Za("uaa",a.architecture)+Za("uam",a.model)+Za("uab",a.bitness);a.fullVersionList&&(b+="&uafvl="+encodeURIComponent(a.fullVersionList.map(function(c){return encodeURIComponent(c.brand)+";"+encodeURIComponent(c.version)}).join("|")));
a.wow64!=null&&(b+="&uaw="+Number(a.wow64));return b.slice(1)}
;function bb(a,b){if(b!==null&&b!==void 0){if(typeof b!=="object"&&typeof b!=="function")throw new TypeError("Object expected.");if(c===void 0){if(!Symbol.dispose)throw new TypeError("Symbol.dispose is not defined.");var c=b[Symbol.dispose]}if(typeof c!=="function")throw new TypeError("Object not disposable.");a.stack.push({value:b,dispose:c,async:!1})}return b}
function cb(a){function b(f){a.error=a.pb?new SuppressedError(f,a.error,"An error was suppressed during disposal."):f;a.pb=!0}
function c(){for(;d=a.stack.pop();)try{if(!d.async&&e===1)return e=0,a.stack.push(d),Promise.resolve().then(c);if(d.dispose){var f=d.dispose.call(d.value);if(d.async)return e|=2,Promise.resolve(f).then(c,function(g){b(g);return c()})}else e|=1}catch(g){b(g)}if(e===1)return a.pb?Promise.reject(a.error):Promise.resolve();
if(a.pb)throw a.error;}
var d,e=0;c()}
;function db(a,b){if(Error.captureStackTrace)Error.captureStackTrace(this,db);else{var c=Error().stack;c&&(this.stack=c)}a&&(this.message=String(a));b!==void 0&&(this.cause=b)}
Xa(db,Error);db.prototype.name="CustomError";var eb=String.prototype.trim?function(a){return a.trim()}:function(a){return/^[\s\xa0]*([\s\S]*?)[\s\xa0]*$/.exec(a)[1]};/*

 Copyright Google LLC
 SPDX-License-Identifier: Apache-2.0
*/
var fb=globalThis.trustedTypes,hb;function ib(){var a=null;if(!fb)return a;try{var b=function(c){return c};
a=fb.createPolicy("goog#html",{createHTML:b,createScript:b,createScriptURL:b})}catch(c){}return a}
function jb(){hb===void 0&&(hb=ib());return hb}
;function kb(a){this.h=a}
kb.prototype.toString=function(){return this.h+""};
function lb(a){var b=jb();a=b?b.createScriptURL(a):a;return new kb(a)}
function mb(a){if(a instanceof kb)return a.h;throw Error("");}
;var nb=pa([""]),ob=qa(["\x00"],["\\0"]),pb=qa(["\n"],["\\n"]),qb=qa(["\x00"],["\\u0000"]);function rb(a){return a.toString().indexOf("`")===-1}
rb(function(a){return a(nb)})||rb(function(a){return a(ob)})||rb(function(a){return a(pb)})||rb(function(a){return a(qb)});function sb(a){this.h=a}
sb.prototype.toString=function(){return this.h};
var tb=new sb("about:invalid#zClosurez");function ub(a){this.Kf=a}
function vb(a){return new ub(function(b){return b.substr(0,a.length+1).toLowerCase()===a+":"})}
var wb=[vb("data"),vb("http"),vb("https"),vb("mailto"),vb("ftp"),new ub(function(a){return/^[^:]*([/?#]|$)/.test(a)})],xb=/^\s*(?!javascript:)(?:[\w+.-]+:|[^:/?#]*(?:[/?#]|$))/i;
function yb(a){if(a instanceof sb)if(a instanceof sb)a=a.h;else throw Error("");else a=xb.test(a)?a:void 0;return a}
;function zb(a,b){b=yb(b);b!==void 0&&(a.href=b)}
;function Ab(a,b){throw Error(b===void 0?"unexpected value "+a+"!":b);}
;function Bb(a){this.h=a}
Bb.prototype.toString=function(){return this.h+""};function Cb(a){a=a===void 0?document:a;var b,c;a=(c=(b=a).querySelector)==null?void 0:c.call(b,"script[nonce]");return a==null?"":a.nonce||a.getAttribute("nonce")||""}
;function Db(a){this.h=a}
Db.prototype.toString=function(){return this.h+""};
function Eb(a){var b=jb();a=b?b.createScript(a):a;return new Db(a)}
function Fb(a){if(a instanceof Db)return a.h;throw Error("");}
;function Gb(a){var b=Cb(a.ownerDocument);b&&a.setAttribute("nonce",b)}
function Hb(a,b){a.src=mb(b);Gb(a)}
;function Ib(){this.h=Jb[0].toLowerCase()}
Ib.prototype.toString=function(){return this.h};function Lb(a){var b="true".toString(),c=[new Ib];if(c.length===0)throw Error("");if(c.map(function(d){if(d instanceof Ib)d=d.h;else throw Error("");return d}).every(function(d){return"data-loaded".indexOf(d)!==0}))throw Error('Attribute "data-loaded" does not match any of the allowed prefixes.');
a.setAttribute("data-loaded",b)}
;var Mb="alternate author bookmark canonical cite help icon license modulepreload next prefetch dns-prefetch prerender preconnect preload prev search subresource".split(" ");function Nb(a,b){if(b instanceof kb)a.href=mb(b).toString(),a.rel="stylesheet";else{if(Mb.indexOf("stylesheet")===-1)throw Error('TrustedResourceUrl href attribute required with rel="stylesheet"');b=yb(b);b!==void 0&&(a.href=b,a.rel="stylesheet")}}
;var Ob=Array.prototype.indexOf?function(a,b){return Array.prototype.indexOf.call(a,b,void 0)}:function(a,b){if(typeof a==="string")return typeof b!=="string"||b.length!=1?-1:a.indexOf(b,0);
for(var c=0;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1},Pb=Array.prototype.forEach?function(a,b){Array.prototype.forEach.call(a,b,void 0)}:function(a,b){for(var c=a.length,d=typeof a==="string"?a.split(""):a,e=0;e<c;e++)e in d&&b.call(void 0,d[e],e,a)},Qb=Array.prototype.filter?function(a,b){return Array.prototype.filter.call(a,b,void 0)}:function(a,b){for(var c=a.length,d=[],e=0,f=typeof a==="string"?a.split(""):a,g=0;g<c;g++)if(g in f){var h=f[g];
b.call(void 0,h,g,a)&&(d[e++]=h)}return d},Rb=Array.prototype.map?function(a,b){return Array.prototype.map.call(a,b,void 0)}:function(a,b){for(var c=a.length,d=Array(c),e=typeof a==="string"?a.split(""):a,f=0;f<c;f++)f in e&&(d[f]=b.call(void 0,e[f],f,a));
return d},Sb=Array.prototype.reduce?function(a,b,c){return Array.prototype.reduce.call(a,b,c)}:function(a,b,c){var d=c;
Pb(a,function(e,f){d=b.call(void 0,d,e,f,a)});
return d};
function Tb(a,b){a:{for(var c=a.length,d=typeof a==="string"?a.split(""):a,e=0;e<c;e++)if(e in d&&b.call(void 0,d[e],e,a)){b=e;break a}b=-1}return b<0?null:typeof a==="string"?a.charAt(b):a[b]}
function Ub(a,b){b=Ob(a,b);var c;(c=b>=0)&&Array.prototype.splice.call(a,b,1);return c}
function Vb(a){var b=a.length;if(b>0){for(var c=Array(b),d=0;d<b;d++)c[d]=a[d];return c}return[]}
function Wb(a,b){for(var c=1;c<arguments.length;c++){var d=arguments[c];if(Ka(d)){var e=a.length||0,f=d.length||0;a.length=e+f;for(var g=0;g<f;g++)a[e+g]=d[g]}else a.push(d)}}
function Xb(a,b){return a>b?1:a<b?-1:0}
;function Yb(a,b){a.__closure__error__context__984382||(a.__closure__error__context__984382={});a.__closure__error__context__984382.severity=b}
;function Zb(a){var b=I("window.location.href");a==null&&(a='Unknown Error of type "null/undefined"');if(typeof a==="string")return{message:a,name:"Unknown error",lineNumber:"Not available",fileName:b,stack:"Not available"};var c=!1;try{var d=a.lineNumber||a.line||"Not available"}catch(g){d="Not available",c=!0}try{var e=a.fileName||a.filename||a.sourceURL||E.$googDebugFname||b}catch(g){e="Not available",c=!0}b=$b(a);if(!(!c&&a.lineNumber&&a.fileName&&a.stack&&a.message&&a.name)){c=a.message;if(c==
null){if(a.constructor&&a.constructor instanceof Function){if(a.constructor.name)c=a.constructor.name;else if(c=a.constructor,ac[c])c=ac[c];else{c=String(c);if(!ac[c]){var f=/function\s+([^\(]+)/m.exec(c);ac[c]=f?f[1]:"[Anonymous]"}c=ac[c]}c='Unknown Error of type "'+c+'"'}else c="Unknown Error of unknown type";typeof a.toString==="function"&&Object.prototype.toString!==a.toString&&(c+=": "+a.toString())}return{message:c,name:a.name||"UnknownError",lineNumber:d,fileName:e,stack:b||"Not available"}}return{message:a.message,
name:a.name,lineNumber:a.lineNumber,fileName:a.fileName,stack:b}}
function $b(a,b){b||(b={});b[bc(a)]=!0;var c=a.stack||"",d=a.cause;d&&!b[bc(d)]&&(c+="\nCaused by: ",d.stack&&d.stack.indexOf(d.toString())==0||(c+=typeof d==="string"?d:d.message+"\n"),c+=$b(d,b));a=a.errors;if(Array.isArray(a)){d=1;var e;for(e=0;e<a.length&&!(d>4);e++)b[bc(a[e])]||(c+="\nInner error "+d++ +": ",a[e].stack&&a[e].stack.indexOf(a[e].toString())==0||(c+=typeof a[e]==="string"?a[e]:a[e].message+"\n"),c+=$b(a[e],b));e<a.length&&(c+="\n... "+(a.length-e)+" more inner errors")}return c}
function bc(a){var b="";typeof a.toString==="function"&&(b=""+a);return b+a.stack}
var ac={};function cc(a){return decodeURIComponent(a.replace(/\+/g," "))}
function dc(a){for(var b=0,c=0;c<a.length;++c)b=31*b+a.charCodeAt(c)>>>0;return b}
;var ec=RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");function fc(a){return a?decodeURI(a):a}
function hc(a){return fc(a.match(ec)[3]||null)}
function ic(a){return fc(a.match(ec)[5]||null)}
function jc(a){var b=a.match(ec);a=b[5];var c=b[6];b=b[7];var d="";a&&(d+=a);c&&(d+="?"+c);b&&(d+="#"+b);return d}
function kc(a){var b=a.indexOf("#");return b<0?a:a.slice(0,b)}
function lc(a,b){if(a){a=a.split("&");for(var c=0;c<a.length;c++){var d=a[c].indexOf("="),e=null;if(d>=0){var f=a[c].substring(0,d);e=a[c].substring(d+1)}else f=a[c];b(f,e?cc(e):"")}}}
function mc(a,b,c){if(Array.isArray(b))for(var d=0;d<b.length;d++)mc(a,String(b[d]),c);else b!=null&&c.push(a+(b===""?"":"="+encodeURIComponent(String(b))))}
function nc(a){var b=[],c;for(c in a)mc(c,a[c],b);return b.join("&")}
function oc(a,b){b=nc(b);if(b){var c=a.indexOf("#");c<0&&(c=a.length);var d=a.indexOf("?");if(d<0||d>c){d=c;var e=""}else e=a.substring(d+1,c);a=[a.slice(0,d),e,a.slice(c)];c=a[1];a[1]=b?c?c+"&"+b:b:c;b=a[0]+(a[1]?"?"+a[1]:"")+a[2]}else b=a;return b}
function pc(a,b,c,d){for(var e=c.length;(b=a.indexOf(c,b))>=0&&b<d;){var f=a.charCodeAt(b-1);if(f==38||f==63)if(f=a.charCodeAt(b+e),!f||f==61||f==38||f==35)return b;b+=e+1}return-1}
var qc=/#|$/,rc=/[?&]($|#)/;function sc(a,b){for(var c=a.search(qc),d=0,e,f=[];(e=pc(a,d,b,c))>=0;)f.push(a.substring(d,e)),d=Math.min(a.indexOf("&",e)+1||c,c);f.push(a.slice(d));return f.join("").replace(rc,"$1")}
;function tc(){try{var a,b;return!!((a=window)==null?0:(b=a.top)==null?0:b.location.href)&&!1}catch(c){return!0}}
;function J(a,b,c){c=c===void 0?Error():c;var d=Error.call(this);this.message=d.message;"stack"in d&&(this.stack=d.stack);this.code=a;b+=":";c instanceof Error?(this.message=b+c.message,this.stack=c.stack||""):(this.message=b+String(c),this.stack="");Object.setPrototypeOf(this,this.constructor.prototype)}
v(J,Error);function uc(a){a&&typeof a.dispose=="function"&&a.dispose()}
;function vc(a){for(var b=0,c=arguments.length;b<c;++b){var d=arguments[b];Ka(d)?vc.apply(null,d):uc(d)}}
;function K(){this.J=this.J;this.H=this.H}
K.prototype.J=!1;K.prototype.dispose=function(){this.J||(this.J=!0,this.ba())};
K.prototype[Symbol.dispose]=function(){this.dispose()};
function wc(a,b){a.addOnDisposeCallback(Ua(uc,b))}
K.prototype.addOnDisposeCallback=function(a,b){this.J?b!==void 0?a.call(b):a():(this.H||(this.H=[]),b&&(a=a.bind(b)),this.H.push(a))};
K.prototype.ba=function(){if(this.H)for(;this.H.length;)this.H.shift()()};function xc(){var a=yc();a=a===void 0?"bevasrsg":a;return new Promise(function(b){var c=window===window.top?window:tc()?window:window.top,d=c[a],e;((e=d)==null?0:e.bevasrs)?b(new zc(d.bevasrs)):(d||(d={},d=(d.nqfbel=[],d),c[a]=d),d.nqfbel.push(function(f){b(new zc(f))}))})}
function zc(a){K.call(this);var b=this;this.vm=a;this.i="keydown keypress keyup input focusin focusout select copy cut paste change click dblclick auxclick pointerover pointerdown pointerup pointermove pointerout dragenter dragleave drag dragend mouseover mousedown mouseup mousemove mouseout touchstart touchend touchmove wheel".split(" ");this.h=void 0;this.Tb=this.vm.p;this.j=this.nc.bind(this);this.addOnDisposeCallback(function(){return void Ac(b)})}
v(zc,K);zc.prototype.snapshot=function(a){return this.vm.s(Object.assign({},a.Ma&&{c:a.Ma},a.cd&&{s:a.cd},a.Gd!==void 0&&{p:a.Gd}))};
zc.prototype.nc=function(a){this.vm.e(a)};
zc.prototype.Ec=function(a,b){return this.vm.c(a,b,!1)};
function Ac(a){a.h!==void 0&&(a.i.forEach(function(b){var c;(c=a.h)==null||c.removeEventListener(b,a.j)}),a.h=void 0)}
zc.prototype.vc=function(){return this.vm.l()};function Bc(a){var b,c,d={Ma:a.c,nd:a.e,Tf:(b=a.mc)!=null?b:!1,Uf:(c=a.me)!=null?c:!1};a.co&&(d.Bc={Qd:a.co.c,Re:a.co.a,Bg:a.co.s});return d}
function Cc(a){return function(){var b;return C(function(c){if(c.h==1)return c.yield(a(),2);b=c.i;return c.return({f:function(){return b.Sb.promise},
c:function(d){if(d>150)var e=!1;else try{b.cache=new Dc(d,b.logger),e=!0}catch(f){Ec(b,new J(22,"GBJ:init",f)),e=!1}return e},
m:function(d){return b.jb(Bc(d))},
mws:function(d){return b.Qc(Bc(d))}})})}}
function Fc(a,b){var c=yc();c=c===void 0?"bevasrsg":c;b={s:function(f){var g;return a.snapshot(Object.assign({},f.c&&{Ma:f.c},f.s&&{cd:f.s},{Jj:(g=f.p)!=null?g:!0}))},
e:function(f){var g;return void((g=a.nc)==null?void 0:g.call(a,f))},
c:function(f,g){return a.Ec(f,g)},
p:a.Tb,l:function(){return a.vc()},
wpc:b?Cc(b):void 0};var d=window===window.top?window:tc()?window:window.top,e=d[c];if(e){e.bevasrs=b;if(e.nqfbel!==void 0)for(c=z(e.nqfbel),d=c.next();!d.done;d=c.next())d=d.value,d(b);e.nqfbel=void 0}else e={},e=(e.bevasrs=b,e.nqfbel=void 0,e),d[c]=e}
;function Gc(a){var b=b===void 0?53:b;var c=[];Hc(a,Ic,6).forEach(function(d){Jc(d,2)<=b&&c.push(Jc(d,1))});
return c}
function Kc(a){var b=b===void 0?53:b;var c=[];Hc(a,Ic,6).forEach(function(d){Jc(d,2)>b&&c.push(Jc(d,1))});
return c}
;function Lc(a){a.then(function(){},function(){})}
function Mc(){K.apply(this,arguments);this.i=1}
v(Mc,K);Mc.prototype.share=function(){if(this.J)throw Error("E:AD");this.i++;return this};
Mc.prototype.dispose=function(){--this.i||K.prototype.dispose.call(this)};function Nc(a){return{fieldType:2,fieldName:a}}
function Oc(a){return{fieldType:3,fieldName:a}}
;function Pc(a){this.h=a;a.kd("/client_streamz/bg/frs",Oc("mk"))}
Pc.prototype.record=function(a,b){this.h.record("/client_streamz/bg/frs",a,b)};
function Qc(a){this.h=a;a.kd("/client_streamz/bg/wrl",Oc("mn"),Nc("ac"),Nc("sc"),Oc("rk"),Oc("mk"))}
Qc.prototype.record=function(a,b,c,d,e,f){this.h.record("/client_streamz/bg/wrl",a,b,c,d,e,f)};
function Rc(a){this.h=a;a.Cb("/client_streamz/bg/ec",Oc("en"),Oc("mk"))}
Rc.prototype.la=function(a,b){this.h.zb("/client_streamz/bg/ec",a,b)};
function Sc(a){this.h=a;a.kd("/client_streamz/bg/el",Oc("en"),Oc("mk"))}
Sc.prototype.record=function(a,b,c){this.h.record("/client_streamz/bg/el",a,b,c)};
function Tc(a){this.h=a;a.Cb("/client_streamz/bg/cec",Nc("ec"),Oc("mk"))}
Tc.prototype.la=function(a,b){this.h.zb("/client_streamz/bg/cec",a,b)};
function Uc(a){this.h=a;a.Cb("/client_streamz/bg/po/csc",Nc("cs"),Oc("mk"))}
Uc.prototype.la=function(a,b){this.h.zb("/client_streamz/bg/po/csc",a,b)};
function Vc(a){this.h=a;a.Cb("/client_streamz/bg/po/ctav",Oc("av"),Oc("mk"))}
Vc.prototype.la=function(a,b){this.h.zb("/client_streamz/bg/po/ctav",a,b)};
function Wc(a){this.h=a;a.Cb("/client_streamz/bg/po/cwsc",Oc("su"),Oc("mk"))}
Wc.prototype.la=function(a,b){this.h.zb("/client_streamz/bg/po/cwsc",a,b)};var Xc,Yc=typeof String.prototype.isWellFormed==="function",Zc=typeof TextEncoder!=="undefined";
function $c(a){var b=!1;b=b===void 0?!1:b;if(Zc){if(b&&(Yc?!a.isWellFormed():/(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])/.test(a)))throw Error("Found an unpaired surrogate");a=(Xc||(Xc=new TextEncoder)).encode(a)}else{for(var c=0,d=new Uint8Array(3*a.length),e=0;e<a.length;e++){var f=a.charCodeAt(e);if(f<128)d[c++]=f;else{if(f<2048)d[c++]=f>>6|192;else{if(f>=55296&&f<=57343){if(f<=56319&&e<a.length){var g=a.charCodeAt(++e);if(g>=56320&&g<=57343){f=(f-55296)*1024+g-56320+
65536;d[c++]=f>>18|240;d[c++]=f>>12&63|128;d[c++]=f>>6&63|128;d[c++]=f&63|128;continue}else e--}if(b)throw Error("Found an unpaired surrogate");f=65533}d[c++]=f>>12|224;d[c++]=f>>6&63|128}d[c++]=f&63|128}}a=c===d.length?d:d.subarray(0,c)}return a}
;function ad(a){E.setTimeout(function(){throw a;},0)}
;function bd(a){for(var b=[],c=0,d=0;d<a.length;d++){var e=a.charCodeAt(d);e<128?b[c++]=e:(e<2048?b[c++]=e>>6|192:((e&64512)==55296&&d+1<a.length&&(a.charCodeAt(d+1)&64512)==56320?(e=65536+((e&1023)<<10)+(a.charCodeAt(++d)&1023),b[c++]=e>>18|240,b[c++]=e>>12&63|128):b[c++]=e>>12|224,b[c++]=e>>6&63|128),b[c++]=e&63|128)}return b}
;var cd=Ia(610401301,!1),dd=Ia(748402147,!0),ed=Ia(824656860,Ia(1,!0));function fd(){var a=E.navigator;return a&&(a=a.userAgent)?a:""}
var gd,hd=E.navigator;gd=hd?hd.userAgentData||null:null;function id(a){if(!cd||!gd)return!1;for(var b=0;b<gd.brands.length;b++){var c=gd.brands[b].brand;if(c&&c.indexOf(a)!=-1)return!0}return!1}
function L(a){return fd().indexOf(a)!=-1}
;function jd(){return cd?!!gd&&gd.brands.length>0:!1}
function kd(){return jd()?!1:L("Opera")}
function ld(){return L("Firefox")||L("FxiOS")}
function md(){return jd()?id("Chromium"):(L("Chrome")||L("CriOS"))&&!(jd()?0:L("Edge"))||L("Silk")}
;function nd(){return cd?!!gd&&!!gd.platform:!1}
function od(){return L("iPhone")&&!L("iPod")&&!L("iPad")}
;function pd(a){pd[" "](a);return a}
pd[" "]=function(){};var qd=kd(),rd=jd()?!1:L("Trident")||L("MSIE"),sd=L("Edge"),td=L("Gecko")&&!(fd().toLowerCase().indexOf("webkit")!=-1&&!L("Edge"))&&!(L("Trident")||L("MSIE"))&&!L("Edge"),ud=fd().toLowerCase().indexOf("webkit")!=-1&&!L("Edge");ud&&L("Mobile");nd()||L("Macintosh");nd()||L("Windows");(nd()?gd.platform==="Linux":L("Linux"))||nd()||L("CrOS");var vd=nd()?gd.platform==="Android":L("Android");od();L("iPad");L("iPod");od()||L("iPad")||L("iPod");fd().toLowerCase().indexOf("kaios");ld();var wd=od()||L("iPod"),xd=L("iPad");!L("Android")||md()||ld()||kd()||L("Silk");md();var yd=L("Safari")&&!(md()||(jd()?0:L("Coast"))||kd()||(jd()?0:L("Edge"))||(jd()?id("Microsoft Edge"):L("Edg/"))||(jd()?id("Opera"):L("OPR"))||ld()||L("Silk")||L("Android"))&&!(od()||L("iPad")||L("iPod"));var zd={},Ad=null;function Bd(a,b){Ka(a);b===void 0&&(b=0);Cd();b=zd[b];for(var c=Array(Math.floor(a.length/3)),d=b[64]||"",e=0,f=0;e<a.length-2;e+=3){var g=a[e],h=a[e+1],k=a[e+2],l=b[g>>2];g=b[(g&3)<<4|h>>4];h=b[(h&15)<<2|k>>6];k=b[k&63];c[f++]=""+l+g+h+k}l=0;k=d;switch(a.length-e){case 2:l=a[e+1],k=b[(l&15)<<2]||d;case 1:a=a[e],c[f]=""+b[a>>2]+b[(a&3)<<4|l>>4]+k+d}return c.join("")}
function Dd(a){var b=a.length,c=b*3/4;c%3?c=Math.floor(c):"=.".indexOf(a[b-1])!=-1&&(c="=.".indexOf(a[b-2])!=-1?c-2:c-1);var d=new Uint8Array(c),e=0;Ed(a,function(f){d[e++]=f});
return e!==c?d.subarray(0,e):d}
function Ed(a,b){function c(k){for(;d<a.length;){var l=a.charAt(d++),m=Ad[l];if(m!=null)return m;if(!/^[\s\xa0]*$/.test(l))throw Error("Unknown base64 encoding at char: "+l);}return k}
Cd();for(var d=0;;){var e=c(-1),f=c(0),g=c(64),h=c(64);if(h===64&&e===-1)break;b(e<<2|f>>4);g!=64&&(b(f<<4&240|g>>2),h!=64&&b(g<<6&192|h))}}
function Cd(){if(!Ad){Ad={};for(var a="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split(""),b=["+/=","+/","-_=","-_.","-_"],c=0;c<5;c++){var d=a.concat(b[c].split(""));zd[c]=d;for(var e=0;e<d.length;e++){var f=d[e];Ad[f]===void 0&&(Ad[f]=e)}}}}
;var Fd=typeof Uint8Array!=="undefined",Gd=!rd&&typeof btoa==="function",Hd=/[-_.]/g,Id={"-":"+",_:"/",".":"="};function Jd(a){return Id[a]||""}
var Kd={};function Ld(a,b){Md(b);this.h=a;if(a!=null&&a.length===0)throw Error("ByteString should be constructed with non-empty values");}
function Nd(){return Pd||(Pd=new Ld(null,Kd))}
function Qd(a){return new Uint8Array(Rd(a)||0)}
Ld.prototype.sizeBytes=function(){var a=Rd(this);return a?a.length:0};
function Rd(a){Md(Kd);var b=a.h;if(!(b==null||Fd&&b!=null&&b instanceof Uint8Array))if(typeof b==="string")if(Gd){b=Hd.test(b)?b.replace(Hd,Jd):b;b=atob(b);for(var c=new Uint8Array(b.length),d=0;d<b.length;d++)c[d]=b.charCodeAt(d);b=c}else b=Dd(b);else Ja(b),b=null;return b==null?b:a.h=b}
var Pd;function Md(a){if(a!==Kd)throw Error("illegal external caller");}
;var Sd=void 0;function Td(a){a=Error(a);Yb(a,"warning");return a}
function Ud(a,b){if(a!=null){var c;var d=(c=Sd)!=null?c:Sd={};c=d[a]||0;c>=b||(d[a]=c+1,a=Error(),Yb(a,"incident"),ad(a))}}
;function Vd(){return typeof BigInt==="function"}
;var Wd=typeof Symbol==="function"&&typeof Symbol()==="symbol";function Xd(a,b,c){return typeof Symbol==="function"&&typeof Symbol()==="symbol"?(c===void 0?0:c)&&Symbol.for&&a?Symbol.for(a):a!=null?Symbol(a):Symbol():b}
var Yd=Xd("jas",void 0,!0),Zd=Xd(void 0,"1oa"),$d=Xd(void 0,Symbol()),ae=Xd(void 0,"0ub"),be=Xd(void 0,"0ubs"),ce=Xd(void 0,"0ubsb"),de=Xd(void 0,"0actk"),ee=Xd("m_m","sj",!0),fe=Xd(void 0,"vps"),ge=Xd();Math.max.apply(Math,A(Object.values({Oi:1,Ni:2,Mi:4,Si:8,Ui:16,Qi:32,Xg:64,Ki:128,dh:256,Ti:512,eh:1024,Li:2048,Ri:4096,Pi:8192})));var he={If:{value:0,configurable:!0,writable:!0,enumerable:!1}},ie=Object.defineProperties,M=Wd?Yd:"If",je,ke=[];le(ke,7);je=Object.freeze(ke);function me(a,b){Wd||M in a||ie(a,he);a[M]|=b}
function le(a,b){Wd||M in a||ie(a,he);a[M]=b}
;var ne={};function oe(a,b){return b===void 0?a.h!==pe&&!!(2&(a.D[M]|0)):!!(2&b)&&a.h!==pe}
var pe={};function qe(a,b){if(a!=null)if(typeof a==="string")a=a?new Ld(a,Kd):Nd();else if(a.constructor!==Ld)if(Fd&&a!=null&&a instanceof Uint8Array)a instanceof Uint8Array||Array.isArray(a),a=a.length?new Ld(new Uint8Array(a),Kd):Nd();else{if(!b)throw Error();a=void 0}return a}
var re=Object.freeze({});function se(a,b,c){var d=b&128?0:-1,e=a.length,f;if(f=!!e)f=a[e-1],f=f!=null&&typeof f==="object"&&f.constructor===Object;var g=e+(f?-1:0);for(b=b&128?1:0;b<g;b++)c(b-d,a[b]);if(f){a=a[e-1];for(var h in a)!isNaN(h)&&c(+h,a[h])}}
var te={};function ue(a){a.kj=!0;return a}
;var ve=ue(function(a){return typeof a==="number"}),we=ue(function(a){return typeof a==="string"}),xe=ue(function(a){return typeof a==="boolean"});
function ye(){var a=ze;return ue(function(b){for(var c in a)if(b===a[c]&&!/^[0-9]+$/.test(c))return!0;return!1})}
var Ae=ue(function(a){return a!=null&&typeof a==="object"&&typeof a.then==="function"}),Be=ue(function(a){return!!a&&(typeof a==="object"||typeof a==="function")});var Ce=typeof E.BigInt==="function"&&typeof E.BigInt(0)==="bigint";function De(a){var b=a;if(we(b)){if(!/^\s*(?:-?[1-9]\d*|0)?\s*$/.test(b))throw Error(String(b));}else if(ve(b)&&!Number.isSafeInteger(b))throw Error(String(b));return Ce?BigInt(a):a=xe(a)?a?"1":"0":we(a)?a.trim()||"0":String(a)}
var Je=ue(function(a){return Ce?a>=Ee&&a<=Fe:a[0]==="-"?Ge(a,He):Ge(a,Ie)}),He=Number.MIN_SAFE_INTEGER.toString(),Ee=Ce?BigInt(Number.MIN_SAFE_INTEGER):void 0,Ie=Number.MAX_SAFE_INTEGER.toString(),Fe=Ce?BigInt(Number.MAX_SAFE_INTEGER):void 0;
function Ge(a,b){if(a.length>b.length)return!1;if(a.length<b.length||a===b)return!0;for(var c=0;c<a.length;c++){var d=a[c],e=b[c];if(d>e)return!1;if(d<e)return!0}}
;var Ke=0,Le=0,Me;function Ne(a){var b=a>>>0;Ke=b;Le=(a-b)/4294967296>>>0}
function Oe(a){if(a<0){Ne(0-a);var b=z(Pe(Ke,Le));a=b.next().value;b=b.next().value;Ke=a>>>0;Le=b>>>0}else Ne(a)}
function Qe(a,b){var c=b*4294967296+(a>>>0);return Number.isSafeInteger(c)?c:Re(a,b)}
function Re(a,b){b>>>=0;a>>>=0;if(b<=2097151)var c=""+(4294967296*b+a);else Vd()?c=""+(BigInt(b)<<BigInt(32)|BigInt(a)):(c=(a>>>24|b<<8)&16777215,b=b>>16&65535,a=(a&16777215)+c*6777216+b*6710656,c+=b*8147497,b*=2,a>=1E7&&(c+=a/1E7>>>0,a%=1E7),c>=1E7&&(b+=c/1E7>>>0,c%=1E7),c=b+Se(c)+Se(a));return c}
function Se(a){a=String(a);return"0000000".slice(a.length)+a}
function Te(){var a=Ke,b=Le;b&2147483648?Vd()?a=""+(BigInt(b|0)<<BigInt(32)|BigInt(a>>>0)):(b=z(Pe(a,b)),a=b.next().value,b=b.next().value,a="-"+Re(a,b)):a=Re(a,b);return a}
function Ue(a){if(a.length<16)Oe(Number(a));else if(Vd())a=BigInt(a),Ke=Number(a&BigInt(4294967295))>>>0,Le=Number(a>>BigInt(32)&BigInt(4294967295));else{var b=+(a[0]==="-");Le=Ke=0;for(var c=a.length,d=0+b,e=(c-b)%6+b;e<=c;d=e,e+=6)d=Number(a.slice(d,e)),Le*=1E6,Ke=Ke*1E6+d,Ke>=4294967296&&(Le+=Math.trunc(Ke/4294967296),Le>>>=0,Ke>>>=0);b&&(b=z(Pe(Ke,Le)),a=b.next().value,b=b.next().value,Ke=a,Le=b)}}
function Pe(a,b){b=~b;a?a=~a+1:b+=1;return[a,b]}
;function Ve(a){return Array.prototype.slice.call(a)}
;var We=typeof BigInt==="function"?BigInt.asIntN:void 0,Xe=typeof BigInt==="function"?BigInt.asUintN:void 0,Ye=Number.isSafeInteger,Ze=Number.isFinite,$e=Math.trunc;function af(a){return a.displayName||a.name||"unknown type name"}
function bf(a){if(a!=null&&typeof a!=="boolean")throw Error("Expected boolean but got "+Ja(a)+": "+a);return a}
var cf=/^-?([1-9][0-9]*|0)(\.[0-9]+)?$/;function df(a){switch(typeof a){case "bigint":return!0;case "number":return Ze(a);case "string":return cf.test(a);default:return!1}}
function ef(a){if(typeof a!=="number")throw Td("int32");if(!Ze(a))throw Td("int32");return a|0}
function ff(a){return a==null?a:ef(a)}
function gf(a){if(a==null)return a;if(typeof a==="string"&&a)a=+a;else if(typeof a!=="number")return;return Ze(a)?a|0:void 0}
function hf(a){if(a==null)return a;if(typeof a==="string"&&a)a=+a;else if(typeof a!=="number")return;return Ze(a)?a>>>0:void 0}
function jf(a){var b=void 0;b!=null||(b=ed?1024:0);if(!df(a))throw Td("int64");var c=typeof a;switch(b){case 512:switch(c){case "string":return kf(a);case "bigint":return String(We(64,a));default:return lf(a)}case 1024:switch(c){case "string":return mf(a);case "bigint":return De(We(64,a));default:return nf(a)}case 0:switch(c){case "string":return kf(a);case "bigint":return De(We(64,a));default:return of(a)}default:return Ab(b,"Unknown format requested type for int64")}}
function pf(a){return a==null?a:jf(a)}
function qf(a){a.indexOf(".");var b=a.length;if(a[0]==="-"?b<20||b===20&&a<="-9223372036854775808":b<19||b===19&&a<="9223372036854775807")return a;Ue(a);return Te()}
function of(a){df(a);a=$e(a);if(!Ye(a)){Oe(a);var b=Ke,c=Le;if(a=c&2147483648)b=~b+1>>>0,c=~c>>>0,b==0&&(c=c+1>>>0);b=Qe(b,c);a=typeof b==="number"?a?-b:b:a?"-"+b:b}return a}
function lf(a){df(a);a=$e(a);Ye(a)?a=String(a):(Oe(a),a=Te());return a}
function kf(a){df(a);var b=$e(Number(a));if(Ye(b))return String(b);b=a.indexOf(".");b!==-1&&(a=a.substring(0,b));return qf(a)}
function mf(a){var b=$e(Number(a));if(Ye(b))return De(b);b=a.indexOf(".");b!==-1&&(a=a.substring(0,b));return Vd()?De(We(64,BigInt(a))):De(qf(a))}
function nf(a){return Ye(a)?De(of(a)):De(lf(a))}
function rf(a){if(a==null)return a;if(typeof a==="bigint")return Je(a)?a=Number(a):(a=We(64,a),a=Je(a)?Number(a):String(a)),a;if(df(a))return typeof a==="number"?of(a):kf(a)}
function sf(a){var b=typeof a;if(a==null)return a;if(b==="bigint")return De(We(64,a));if(df(a))return b==="string"?mf(a):nf(a)}
function tf(a){if(a==null)return a;var b=typeof a;if(b==="bigint")return String(We(64,a));if(df(a)){if(b==="string")return kf(a);if(b==="number")return of(a)}}
function uf(a){if(a==null)return a;var b=typeof a;if(b==="bigint")return String(Xe(64,a));if(df(a)){if(b==="string")return df(a),b=$e(Number(a)),Ye(b)&&b>=0?a=String(b):(b=a.indexOf("."),b!==-1&&(a=a.substring(0,b)),a.indexOf("."),a[0]==="-"?b=!1:(b=a.length,b=b<20?!0:b===20&&a<="18446744073709551615"),b||(Ue(a),a=Re(Ke,Le))),a;if(b==="number")return df(a),a=$e(a),a>=0&&Ye(a)||(Oe(a),a=Qe(Ke,Le)),a}}
function vf(a){if(typeof a!=="string")throw Error();return a}
function wf(a){if(a!=null&&typeof a!=="string")throw Error();return a}
function xf(a){return a==null||typeof a==="string"?a:void 0}
function yf(a,b){if(!(a instanceof b))throw Error("Expected instanceof "+af(b)+" but got "+(a&&af(a.constructor)));}
function zf(a,b,c){if(a!=null&&a[ee]===ne)return a;if(Array.isArray(a)){var d=a[M]|0;c=d|c&32|c&2;c!==d&&le(a,c);return new b(a)}}
;var Af={};function Bf(a){return a}
;function Cf(a){var b=Wa($d);return b?a[b]:void 0}
var Df={Bj:!0};function Ef(a,b){b<100||Ud(be,1)}
;function Ff(a,b,c,d){var e=d!==void 0;d=!!d;var f=Wa($d),g;!e&&Wd&&f&&(g=a[f])&&g.wf(Ef);f=[];var h=a.length;g=4294967295;var k=!1,l=!!(b&64),m=l?b&128?0:-1:void 0;if(!(b&1)){var p=h&&a[h-1];p!=null&&typeof p==="object"&&p.constructor===Object?(h--,g=h):p=void 0;if(l&&!(b&128)&&!e){k=!0;var r;g=((r=Gf)!=null?r:Bf)(g-m,m,a,p,void 0)+m}}b=void 0;for(r=0;r<h;r++){var t=a[r];if(t!=null&&(t=c(t,d))!=null)if(l&&r>=g){var w=r-m,y=void 0;((y=b)!=null?y:b={})[w]=t}else f[r]=t}if(p)for(var x in p)h=p[x],h!=
null&&(h=c(h,d))!=null&&(r=+x,t=void 0,l&&!Number.isNaN(r)&&(t=r+m)<g?f[t]=h:(r=void 0,((r=b)!=null?r:b={})[x]=h));b&&(k?f.push(b):f[g]=b);e&&Wa($d)&&Cf(a);return f}
function Hf(a){switch(typeof a){case "number":return Number.isFinite(a)?a:""+a;case "bigint":return Je(a)?Number(a):""+a;case "boolean":return a?1:0;case "object":if(Array.isArray(a)){var b=a[M]|0;return a.length===0&&b&1?void 0:Ff(a,b,Hf)}if(a!=null&&a[ee]===ne)return If(a);if(a instanceof Ld){b=a.h;if(b==null)a="";else if(typeof b==="string")a=b;else{if(Gd){for(var c="",d=0,e=b.length-10240;d<e;)c+=String.fromCharCode.apply(null,b.subarray(d,d+=10240));c+=String.fromCharCode.apply(null,d?b.subarray(d):
b);b=btoa(c)}else b=Bd(b);a=a.h=b}return a}return}return a}
var Gf;function Jf(a,b){if(b){Gf=b==null||b===Bf||b[fe]!==Af?Bf:b;try{return If(a)}finally{Gf=void 0}}return If(a)}
function If(a){a=a.D;return Ff(a,a[M]|0,Hf)}
;var Kf,Lf;function Mf(a){switch(typeof a){case "boolean":return Kf||(Kf=[0,void 0,!0]);case "number":return a>0?void 0:a===0?Lf||(Lf=[0,void 0]):[-a,void 0];case "string":return[0,a];case "object":return a}}
function N(a,b,c){return Nf(a,b,c,2048)}
function Nf(a,b,c,d){d=d===void 0?0:d;if(a==null){var e=32;c?(a=[c],e|=128):a=[];b&&(e=e&-16760833|(b&1023)<<14)}else{if(!Array.isArray(a))throw Error("narr");e=a[M]|0;if(dd&&1&e)throw Error("rfarr");2048&e&&!(2&e)&&Of();if(e&256)throw Error("farr");if(e&64)return(e|d)!==e&&le(a,e|d),a;if(c&&(e|=128,c!==a[0]))throw Error("mid");a:{c=a;e|=64;var f=c.length;if(f){var g=f-1,h=c[g];if(h!=null&&typeof h==="object"&&h.constructor===Object){b=e&128?0:-1;g-=b;if(g>=1024)throw Error("pvtlmt");for(var k in h)f=
+k,f<g&&(c[f+b]=h[k],delete h[k]);e=e&-16760833|(g&1023)<<14;break a}}if(b){k=Math.max(b,f-(e&128?0:-1));if(k>1024)throw Error("spvt");e=e&-16760833|(k&1023)<<14}}}le(a,e|64|d);return a}
function Of(){if(dd)throw Error("carr");Ud(de,5)}
;function Pf(a,b){if(typeof a!=="object")return a;if(Array.isArray(a)){var c=a[M]|0;a.length===0&&c&1?a=void 0:c&2||(!b||4096&c||16&c?a=Qf(a,c,!1,b&&!(c&16)):(me(a,34),c&4&&Object.freeze(a)));return a}if(a!=null&&a[ee]===ne)return b=a.D,c=b[M]|0,oe(a,c)?a:Rf(a,b,c)?Sf(a,b):Qf(b,c);if(a instanceof Ld)return a}
function Sf(a,b,c){a=new a.constructor(b);c&&(a.h=pe);a.i=pe;return a}
function Qf(a,b,c,d){d!=null||(d=!!(34&b));a=Ff(a,b,Pf,d);d=32;c&&(d|=2);b=b&16769217|d;le(a,b);return a}
function Tf(a){var b=a.D,c=b[M]|0;return oe(a,c)?Rf(a,b,c)?Sf(a,b,!0):new a.constructor(Qf(b,c,!1)):a}
function Uf(a){if(a.h!==pe)return!1;var b=a.D;b=Qf(b,b[M]|0);me(b,2048);a.D=b;a.h=void 0;a.i=void 0;return!0}
function Vf(a){if(!Uf(a)&&oe(a,a.D[M]|0))throw Error();}
function Wf(a,b){b===void 0&&(b=a[M]|0);b&32&&!(b&4096)&&le(a,b|4096)}
function Rf(a,b,c){return c&2?!0:c&32&&!(c&4096)?(le(b,c|2),a.h=pe,!0):!1}
;var Xf=De(0),Yf={};function Zf(a,b,c,d,e){Object.isExtensible(a);b=$f(a.D,b,c,e);if(b!==null||d&&a.i!==pe)return b}
function $f(a,b,c,d){if(b===-1)return null;var e=b+(c?0:-1),f=a.length-1;if(!(f<1+(c?0:-1))){if(e>=f){var g=a[f];if(g!=null&&typeof g==="object"&&g.constructor===Object){c=g[b];var h=!0}else if(e===f)c=g;else return}else c=a[e];if(d&&c!=null){d=d(c);if(d==null)return d;if(!Object.is(d,c))return h?g[b]=d:a[e]=d,d}return c}}
function ag(a,b,c,d){Vf(a);var e=a.D;bg(e,e[M]|0,b,c,d);return a}
function bg(a,b,c,d,e){var f=c+(e?0:-1),g=a.length-1;if(g>=1+(e?0:-1)&&f>=g){var h=a[g];if(h!=null&&typeof h==="object"&&h.constructor===Object)return h[c]=d,b}if(f<=g)return a[f]=d,b;if(d!==void 0){var k;g=((k=b)!=null?k:b=a[M]|0)>>14&1023||536870912;c>=g?d!=null&&(f={},a[g+(e?0:-1)]=(f[c]=d,f)):a[f]=d}return b}
function cg(a){return!!(2&a)&&!!(4&a)||!!(256&a)}
function dg(a){return qe(a,!0)}
function eg(a){a=Zf(a,1,void 0,void 0,dg);return a==null?Nd():a}
function fg(a,b,c){Vf(a);var d=a.D,e=d[M]|0;if(b==null)return bg(d,e,3),a;if(!Array.isArray(b))throw Td();var f=b===je?7:b[M]|0,g=f,h=cg(f),k=h||Object.isFrozen(b);h||(f=0);k||(b=Ve(b),g=0,f=gg(f,e),k=!1);f|=5;h=4&f?512&f?512:1024&f?1024:0:void 0;h=h!=null?h:ed?1024:0;f|=h;for(var l=0;l<b.length;l++){var m=b[l],p=c(m,h);Object.is(m,p)||(k&&(b=Ve(b),g=0,f=gg(f,e),k=!1),b[l]=p)}f!==g&&(k&&(b=Ve(b),f=gg(f,e)),le(b,f));bg(d,e,3,b);return a}
function hg(a,b,c,d){Vf(a);var e=a.D;bg(e,e[M]|0,b,c===""?void 0:c,d);return a}
function ig(a,b,c,d){Vf(a);a=a.D;var e=a[M]|0;if(d==null){var f=jg(a);if(kg(f,a,e,c)===b)f.set(c,0);else return}else{b===0||c.includes(b);f=jg(a);var g=kg(f,a,e,c);g!==b&&(g&&(e=bg(a,e,g)),f.set(c,b))}bg(a,e,b,d)}
function jg(a){if(Wd){var b;return(b=a[Zd])!=null?b:a[Zd]=new Map}if(Zd in a)return a[Zd];b=new Map;Object.defineProperty(a,Zd,{value:b});return b}
function kg(a,b,c,d){var e=a.get(d);if(e!=null)return e;for(var f=e=0;f<d.length;f++){var g=d[f];$f(b,g)!=null&&(e!==0&&(c=bg(b,c,e)),e=g)}a.set(d,e);return e}
function lg(a,b,c,d,e){var f=!1;d=$f(a,d,e,function(g){var h=zf(g,c,b);f=h!==g&&h!=null;return h});
if(d!=null)return f&&!oe(d)&&Wf(a,b),d}
function mg(a,b,c,d){var e=a.D,f=e[M]|0;b=lg(e,f,b,c,d);if(b==null)return b;f=e[M]|0;if(!oe(a,f)){var g=Tf(b);g!==b&&(Uf(a)&&(e=a.D,f=e[M]|0),b=g,f=bg(e,f,c,b,d),Wf(e,f))}return b}
function Hc(a,b,c){var d=void 0===re?2:4;var e=a.D,f=e,g=e[M]|0,h=oe(a,g);e=h?1:d;d=e===3;var k=!h;(e===2||k)&&Uf(a)&&(f=a.D,g=f[M]|0);a=$f(f,c);h=Array.isArray(a)?a:je;var l=h===je?7:h[M]|0;a=l;2&g&&(a|=2);var m=a|1;if(a=!(4&m)){var p=h,r=g,t=!!(2&m);t&&(r|=2);for(var w=!t,y=!0,x=0,H=0;x<p.length;x++){var F=zf(p[x],b,r);if(F instanceof b){if(!t){var W=oe(F);w&&(w=!W);y&&(y=W)}p[H++]=F}}H<x&&(p.length=H);m|=4;m=y?m&-4097:m|4096;m=w?m|8:m&-9}m!==l&&(le(h,m),2&m&&Object.freeze(h));if(k&&!(8&m||!h.length&&
(e===1||(e!==4?0:2&m||!(16&m)&&32&g)))){cg(m)&&(h=Ve(h),m=gg(m,g),g=bg(f,g,c,h));b=h;k=m;for(l=0;l<b.length;l++)p=b[l],m=Tf(p),p!==m&&(b[l]=m);k|=8;m=k=b.length?k|4096:k&-4097;le(h,m)}b=h;k=h=m;e===1||(e!==4?0:2&h||!(16&h)&&32&g)?cg(h)||(h|=!b.length||a&&!(4096&h)||32&g&&!(4096&h||16&h)?2:256,h!==k&&le(b,h),Object.freeze(b)):(e===2&&cg(h)&&(b=Ve(b),k=0,h=gg(h,g),g=bg(f,g,c,b)),cg(h)||(d||(h|=16),h!==k&&le(b,h)));2&h||!(4096&h||16&h)||Wf(f,g);return b}
function ng(a,b){a!=null?yf(a,b):a=void 0;return a}
function og(a,b,c,d,e){d=ng(d,b);ag(a,c,d,e);d&&!oe(d)&&Wf(a.D);return a}
function pg(a,b,c,d){Vf(a);var e=a.D,f=e[M]|0;if(d==null)return bg(e,f,c),a;if(!Array.isArray(d))throw Td();for(var g=d===je?7:d[M]|0,h=g,k=cg(g),l=k||Object.isFrozen(d),m=!0,p=!0,r=0;r<d.length;r++){var t=d[r];yf(t,b);k||(t=oe(t),m&&(m=!t),p&&(p=t))}k||(g=m?13:5,g=p?g&-4097:g|4096);l&&g===h||(d=Ve(d),h=0,g=gg(g,f));g!==h&&le(d,g);f=bg(e,f,c,d);2&g||!(4096&g||16&g)||Wf(e,f);return a}
function gg(a,b){return a=(2&b?a|2:a&-3)&-273}
function Jc(a,b,c){c=c===void 0?0:c;a=gf(Zf(a,b));return a!=null?a:c}
function qg(a,b){var c=c===void 0?0:c;a=hf(Zf(a,b));return a!=null?a:c}
function rg(a,b,c){c=c===void 0?Xf:c;a=ed?Zf(a,b,void 0,void 0,sf):sf(Zf(a,b));return a!=null?a:c}
function sg(a,b,c,d){c=c===void 0?"":c;var e;return(e=xf(Zf(a,b,d)))!=null?e:c}
function tg(a){var b=b===void 0?0:b;a=Zf(a,1);a=a==null?a:Ze(a)?a|0:void 0;return a!=null?a:b}
function ug(a,b,c){return ag(a,b,wf(c))}
function vg(a,b,c){if(c!=null){if(!Ze(c))throw Td("enum");c|=0}return ag(a,b,c)}
;function wg(a,b){this.i=a>>>0;this.h=b>>>0}
function xg(a){if(!a)return yg||(yg=new wg(0,0));if(!/^\d+$/.test(a))return null;Ue(a);return new wg(Ke,Le)}
var yg;function zg(a,b){this.i=a>>>0;this.h=b>>>0}
function Ag(a){if(!a)return Bg||(Bg=new zg(0,0));if(!/^-?\d+$/.test(a))return null;Ue(a);return new zg(Ke,Le)}
var Bg;function Cg(){this.h=[]}
Cg.prototype.length=function(){return this.h.length};
Cg.prototype.end=function(){var a=this.h;this.h=[];return a};
function Dg(a,b,c){for(;c>0||b>127;)a.h.push(b&127|128),b=(b>>>7|c<<25)>>>0,c>>>=7;a.h.push(b)}
function Eg(a,b){for(;b>127;)a.h.push(b&127|128),b>>>=7;a.h.push(b)}
Cg.prototype.writeUint8=function(a){this.h.push(a>>>0&255)};
function Fg(a,b){a.h.push(b>>>0&255);a.h.push(b>>>8&255);a.h.push(b>>>16&255);a.h.push(b>>>24&255)}
Cg.prototype.writeInt8=function(a){this.h.push(a>>>0&255)};function Gg(){this.j=[];this.i=0;this.h=new Cg}
function Hg(a,b){b.length!==0&&(a.j.push(b),a.i+=b.length)}
function Ig(a,b){Eg(a.h,b*8+2);b=a.h.end();Hg(a,b);b.push(a.i);return b}
function Jg(a,b){var c=b.pop();for(c=a.i+a.h.length()-c;c>127;)b.push(c&127|128),c>>>=7,a.i++;b.push(c);a.i++}
function Kg(a,b,c){if(c!=null){switch(typeof c){case "string":xg(c)}Eg(a.h,b*8+1);switch(typeof c){case "number":a=a.h;Ne(c);Fg(a,Ke);Fg(a,Le);break;case "bigint":c=BigInt.asUintN(64,c);c=new wg(Number(c&BigInt(4294967295)),Number(c>>BigInt(32)));a=a.h;b=c.h;Fg(a,c.i);Fg(a,b);break;default:c=xg(c),a=a.h,b=c.h,Fg(a,c.i),Fg(a,b)}}}
function Lg(a,b,c){Eg(a.h,b*8+2);Eg(a.h,c.length);Hg(a,a.h.end());Hg(a,c)}
;function Mg(){function a(){throw Error();}
Object.setPrototypeOf(a,a.prototype);return a}
var Ng=Mg(),Og=Mg(),Pg=Mg(),Qg=Mg(),Rg=Mg(),Sg=Mg(),Tg=Mg();function O(a,b,c){this.D=N(a,b,c)}
O.prototype.toJSON=function(){return Jf(this)};
O.prototype.serialize=function(a){return JSON.stringify(Jf(this,a))};
function Ug(a,b){if(b==null||b=="")return new a;b=JSON.parse(b);if(!Array.isArray(b))throw Error("dnarr");me(b,32);return new a(b)}
O.prototype.clone=function(){var a=this.D,b=a[M]|0;return Rf(this,a,b)?Sf(this,a,!0):new this.constructor(Qf(a,b,!1))};
O.prototype[ee]=ne;O.prototype.toString=function(){return this.D.toString()};function Vg(a,b){this.hd=a;a=Wa(Ng);this.h=!!a&&b===a||!1}
function Wg(a){var b=b===void 0?Ng:b;return new Vg(a,b)}
function Xg(a,b,c,d,e){b=Yg(b,d);b!=null&&(c=Ig(a,c),e(b,a),Jg(a,c))}
var Zg=Wg(Xg),$g=Wg(Xg),ah=Symbol(),bh=Symbol(),ch,dh;
function eh(a){var b=fh,c=gh,d=a[ah];if(d)return d;d={};d.Xi=a;d.de=Mf(a[0]);var e=a[1],f=1;e&&e.constructor===Object&&(d.extensions=e,e=a[++f],typeof e==="function"&&(d.Jf=!0,ch!=null||(ch=e),dh!=null||(dh=a[f+1]),e=a[f+=2]));for(var g={};e&&hh(e);){for(var h=0;h<e.length;h++)g[e[h]]=e;e=a[++f]}for(h=1;e!==void 0;){typeof e==="number"&&(h+=e,e=a[++f]);var k=void 0;if(e instanceof Vg)var l=e;else l=Zg,f--;e=void 0;if((e=l)==null?0:e.h){e=a[++f];k=a;var m=f;typeof e==="function"&&(e=e(),k[m]=e);k=
e}e=a[++f];m=h+1;typeof e==="number"&&e<0&&(m-=e,e=a[++f]);for(;h<m;h++){var p=g[h];k?c(d,h,l,k,p):b(d,h,l,p)}}return a[ah]=d}
function hh(a){return Array.isArray(a)&&!!a.length&&typeof a[0]==="number"&&a[0]>0}
function Yg(a,b){if(a instanceof O)return a.D;if(Array.isArray(a))return Nf(a,b[0],b[1])}
;function fh(a,b,c){a[b]=c.hd}
function gh(a,b,c,d){var e,f,g=c.hd;a[b]=function(h,k,l){return g(h,k,l,f||(f=eh(d).de),e||(e=ih(d)))}}
function ih(a){var b=a[bh];if(!b){var c=eh(a);b=function(d,e){return jh(d,e,c)};
a[bh]=b}return b}
function jh(a,b,c){se(a,a[M]|0,function(d,e){if(e!=null){var f=kh(c,d);f?f(b,e,d):d<500||Ud(ce,3)}});
(a=Cf(a))&&a.wf(function(d,e,f){Hg(b,b.h.end());for(d=0;d<f.length;d++)Hg(b,Rd(f[d])||new Uint8Array(0))})}
function kh(a,b){var c=a[b];if(c)return c;if(c=a.extensions)if(c=c[b]){c=Array.isArray(c)?c[0]instanceof Vg?c:[$g,c]:[c,void 0];var d=c[0].hd;if(c=c[1]){var e=ih(c),f=eh(c).de;c=a.Jf?dh(f,e):function(g,h,k){return d(g,h,k,f,e)}}else c=d;
return a[b]=c}}
;function lh(a,b,c){if(Array.isArray(b)){var d=b[M]|0;if(d&4)return b;for(var e=0,f=0;e<b.length;e++){var g=a(b[e]);g!=null&&(b[f++]=g)}f<e&&(b.length=f);a=d|1;c&&(a=(a|4)&-1537);a!==d&&le(b,a);c&&a&2&&Object.freeze(b);return b}}
function mh(a,b,c){b=b==null||typeof b==="number"?b:b==="NaN"||b==="Infinity"||b==="-Infinity"?Number(b):void 0;b!=null&&(Eg(a.h,c*8+1),a=a.h,c=Me||(Me=new DataView(new ArrayBuffer(8))),c.setFloat64(0,+b,!0),Ke=c.getUint32(0,!0),Le=c.getUint32(4,!0),Fg(a,Ke),Fg(a,Le))}
function nh(a,b,c){b=tf(b);if(b!=null){switch(typeof b){case "string":Ag(b)}if(b!=null)switch(Eg(a.h,c*8),typeof b){case "number":a=a.h;Oe(b);Dg(a,Ke,Le);break;case "bigint":c=BigInt.asUintN(64,b);c=new zg(Number(c&BigInt(4294967295)),Number(c>>BigInt(32)));Dg(a.h,c.i,c.h);break;default:c=Ag(b),Dg(a.h,c.i,c.h)}}}
function oh(a,b,c){b=gf(b);if(b!=null&&b!=null)if(Eg(a.h,c*8),a=a.h,c=b,c>=0)Eg(a,c);else{for(b=0;b<9;b++)a.h.push(c&127|128),c>>=7;a.h.push(1)}}
function ph(a,b,c){b=b==null||typeof b==="boolean"?b:typeof b==="number"?!!b:void 0;b!=null&&(Eg(a.h,c*8),a.h.h.push(b?1:0))}
function qh(a,b,c){b=xf(b);b!=null&&Lg(a,c,$c(b))}
function rh(a,b,c,d,e){b=Yg(b,d);b!=null&&(c=Ig(a,c),e(b,a),Jg(a,c))}
var sh=new Vg(mh,Tg),th=new Vg(mh,Tg),uh=new Vg(nh,Rg),vh=new Vg(nh,Rg),wh=new Vg(oh,Qg),xh=new Vg(oh,Qg),yh;yh=new Vg(function(a,b,c){Kg(a,c,uf(b))},Sg);
var zh;zh=new Vg(function(a,b,c){b=lh(uf,b,!1);if(b!=null)for(var d=0;d<b.length;d++)Kg(a,c,b[d])},Sg);
var Ah=new Vg(ph,Og),Bh=new Vg(ph,Og),Ch=new Vg(qh,Pg),Dh;Dh=new Vg(function(a,b,c){b=lh(xf,b,!0);if(b!=null)for(var d=0;d<b.length;d++){var e=a,f=c,g=b[d];g!=null&&Lg(e,f,$c(g))}},Pg);
var Eh=new Vg(qh,Pg),Fh,Gh=void 0;Gh=Gh===void 0?Ng:Gh;Fh=new Vg(function(a,b,c,d,e){if(Array.isArray(b)){for(var f=0;f<b.length;f++)rh(a,b[f],c,d,e);a=b[M]|0;a&1||le(b,a|1)}},Gh);
var Hh=Wg(rh);function Ih(){var a=Jh;this.ctor=Kh;this.isRepeated=0;this.h=mg;this.defaultValue=void 0;this.i=a.Rf!=null?te:void 0}
Ih.prototype.register=function(){pd(this)};function Lh(a){return function(b){return Ug(a,b)}}
;function Mh(a){this.D=N(a)}
v(Mh,O);function Nh(a,b){return fg(a,b,ef)}
;function Oh(a){this.D=N(a)}
v(Oh,O);var Ph=[1,2,3];var Qh=[0,Ph,Eh,xh,Bh];var Rh=[0,Fh,[0,sh,uh]];function Sh(a){this.D=N(a)}
v(Sh,O);var Th=[1,2,3];var Uh=[0,Th,vh,th,Hh,Rh];function Vh(a){this.D=N(a)}
v(Vh,O);var Wh=[0,Fh,Qh,Uh];var Xh=[0,Ch];function Yh(a){this.D=N(a)}
v(Yh,O);var Zh=[0,Ch,-1,Ah];var $h=[0,Ch,-1,wh,Ah];function ai(a){this.D=N(a)}
v(ai,O);var bi=[1,2,3];var ci=[0,bi,Hh,Zh,Hh,$h,Hh,Xh];function di(a){this.D=N(a)}
v(di,O);di.prototype.j=function(a){return function(){var b=new Gg;jh(this.D,b,eh(a));Hg(b,b.h.end());for(var c=new Uint8Array(b.i),d=b.j,e=d.length,f=0,g=0;g<e;g++){var h=d[g];c.set(h,f);f+=h.length}b.j=[c];return c}}([0,
Ch,ci,Dh,Fh,Wh,yh,zh]);function ei(a){this.D=N(a)}
v(ei,O);function fi(a){var b=new di;b=ug(b,1,a.i);var c=gi(a);b=fg(b,c,vf);c=[];for(var d=[],e=z(a.h.keys()),f=e.next();!f.done;f=e.next())d.push(f.value.split(","));for(e=0;e<d.length;e++){f=d[e];for(var g=a.o,h=a.qd(f)||[],k=[],l=0;l<h.length;l++){var m=h[l],p=m&&m.h;m=new Sh;switch(g){case 3:p=Number(p);Number.isFinite(p)&&ig(m,1,Th,pf(p));break;case 2:p=Number(p);if(p!=null&&typeof p!=="number")throw Error("Value of float/double field must be a number, found "+typeof p+": "+p);ig(m,2,Th,p)}k.push(m)}g=
k;for(h=0;h<g.length;h++){k=g[h];l=new Vh;k=og(l,Sh,2,k);l=[];m=hi(a);for(p=0;p<m.length;p++){var r=m[p],t=f[p],w=new Oh;switch(r){case 3:ig(w,1,Ph,wf(String(t)));break;case 2:r=Number(t);Number.isFinite(r)&&ig(w,2,Ph,ff(r));break;case 1:ig(w,3,Ph,bf(t==="true"))}l.push(w)}pg(k,Oh,1,l);c.push(k)}}pg(b,Vh,4,c);return b}
;function ii(a){if(!a)return"";if(/^about:(?:blank|srcdoc)$/.test(a))return window.origin||"";a.indexOf("blob:")===0&&(a=a.substring(5));a=a.split("#")[0].split("?")[0];a=a.toLowerCase();a.indexOf("//")==0&&(a=window.location.protocol+a);/^[\w\-]*:\/\//.test(a)||(a=window.location.href);var b=a.substring(a.indexOf("://")+3),c=b.indexOf("/");c!=-1&&(b=b.substring(0,c));c=a.substring(0,a.indexOf("://"));if(!c)throw Error("URI is missing protocol: "+a);if(c!=="http"&&c!=="https"&&c!=="chrome-extension"&&
c!=="moz-extension"&&c!=="file"&&c!=="android-app"&&c!=="chrome-search"&&c!=="chrome-untrusted"&&c!=="chrome"&&c!=="app"&&c!=="devtools")throw Error("Invalid URI scheme in origin: "+c);a="";var d=b.indexOf(":");if(d!=-1){var e=b.substring(d+1);b=b.substring(0,d);if(c==="http"&&e!=="80"||c==="https"&&e!=="443")a=":"+e}return c+"://"+b+a}
;function ji(){function a(){e[0]=1732584193;e[1]=4023233417;e[2]=2562383102;e[3]=271733878;e[4]=3285377520;m=l=0}
function b(p){for(var r=g,t=0;t<64;t+=4)r[t/4]=p[t]<<24|p[t+1]<<16|p[t+2]<<8|p[t+3];for(t=16;t<80;t++)p=r[t-3]^r[t-8]^r[t-14]^r[t-16],r[t]=(p<<1|p>>>31)&4294967295;p=e[0];var w=e[1],y=e[2],x=e[3],H=e[4];for(t=0;t<80;t++){if(t<40)if(t<20){var F=x^w&(y^x);var W=1518500249}else F=w^y^x,W=1859775393;else t<60?(F=w&y|x&(w|y),W=2400959708):(F=w^y^x,W=3395469782);F=((p<<5|p>>>27)&4294967295)+F+H+W+r[t]&4294967295;H=x;x=y;y=(w<<30|w>>>2)&4294967295;w=p;p=F}e[0]=e[0]+p&4294967295;e[1]=e[1]+w&4294967295;e[2]=
e[2]+y&4294967295;e[3]=e[3]+x&4294967295;e[4]=e[4]+H&4294967295}
function c(p,r){if(typeof p==="string"){p=unescape(encodeURIComponent(p));for(var t=[],w=0,y=p.length;w<y;++w)t.push(p.charCodeAt(w));p=t}r||(r=p.length);t=0;if(l==0)for(;t+64<r;)b(p.slice(t,t+64)),t+=64,m+=64;for(;t<r;)if(f[l++]=p[t++],m++,l==64)for(l=0,b(f);t+64<r;)b(p.slice(t,t+64)),t+=64,m+=64}
function d(){var p=[],r=m*8;l<56?c(h,56-l):c(h,64-(l-56));for(var t=63;t>=56;t--)f[t]=r&255,r>>>=8;b(f);for(t=r=0;t<5;t++)for(var w=24;w>=0;w-=8)p[r++]=e[t]>>w&255;return p}
for(var e=[],f=[],g=[],h=[128],k=1;k<64;++k)h[k]=0;var l,m;a();return{reset:a,update:c,digest:d,bf:function(){for(var p=d(),r="",t=0;t<p.length;t++)r+="0123456789ABCDEF".charAt(Math.floor(p[t]/16))+"0123456789ABCDEF".charAt(p[t]%16);return r}}}
;function ki(a,b,c){var d=String(E.location.href);return d&&a&&b?[b,li(ii(d),a,c||null)].join(" "):null}
function li(a,b,c){var d=[],e=[];if((Array.isArray(c)?2:1)==1)return e=[b,a],Pb(d,function(h){e.push(h)}),mi(e.join(" "));
var f=[],g=[];Pb(c,function(h){g.push(h.key);f.push(h.value)});
c=Math.floor((new Date).getTime()/1E3);e=f.length==0?[c,b,a]:[f.join(":"),c,b,a];Pb(d,function(h){e.push(h)});
a=mi(e.join(" "));a=[c,a];g.length==0||a.push(g.join(""));return a.join("_")}
function mi(a){var b=ji();b.update(a);return b.bf().toLowerCase()}
;function ni(a){this.h=a||{cookie:""}}
n=ni.prototype;n.isEnabled=function(){if(!E.navigator.cookieEnabled)return!1;if(this.h.cookie)return!0;this.set("TESTCOOKIESENABLED","1",{Pc:60});if(this.get("TESTCOOKIESENABLED")!=="1")return!1;this.remove("TESTCOOKIESENABLED");return!0};
n.set=function(a,b,c){var d=!1;if(typeof c==="object"){var e=c.sameSite;d=c.secure||!1;var f=c.domain||void 0;var g=c.path||void 0;var h=c.Pc}if(/[;=\s]/.test(a))throw Error('Invalid cookie name "'+a+'"');if(/[;\r\n]/.test(b))throw Error('Invalid cookie value "'+b+'"');h===void 0&&(h=-1);c=f?";domain="+f:"";g=g?";path="+g:"";d=d?";secure":"";h=h<0?"":h==0?";expires="+(new Date(1970,1,1)).toUTCString():";expires="+(new Date(Date.now()+h*1E3)).toUTCString();this.h.cookie=a+"="+b+c+g+h+d+(e!=null?";samesite="+
e:"")};
n.get=function(a,b){for(var c=a+"=",d=(this.h.cookie||"").split(";"),e=0,f;e<d.length;e++){f=eb(d[e]);if(f.lastIndexOf(c,0)==0)return f.slice(c.length);if(f==a)return""}return b};
n.remove=function(a,b,c){var d=this.get(a)!==void 0;this.set(a,"",{Pc:0,path:b,domain:c});return d};
n.hc=function(){return oi(this).keys};
n.fb=function(){return oi(this).values};
n.clear=function(){for(var a=oi(this).keys,b=a.length-1;b>=0;b--)this.remove(a[b])};
function oi(a){a=(a.h.cookie||"").split(";");for(var b=[],c=[],d,e,f=0;f<a.length;f++)e=eb(a[f]),d=e.indexOf("="),d==-1?(b.push(""),c.push(e)):(b.push(e.substring(0,d)),c.push(e.substring(d+1)));return{keys:b,values:c}}
var pi=new ni(typeof document=="undefined"?null:document);function qi(){var a=E.__SAPISID||E.__APISID||E.__3PSAPISID||E.__1PSAPISID||E.__OVERRIDE_SID;if(a)return!0;typeof document!=="undefined"&&(a=new ni(document),a=a.get("SAPISID")||a.get("APISID")||a.get("__Secure-3PAPISID")||a.get("__Secure-1PAPISID"));return!!a}
function ri(a,b,c,d){(a=E[a])||typeof document==="undefined"||(a=(new ni(document)).get(b));return a?ki(a,c,d):null}
function si(a){var b=ii(E==null?void 0:E.location.href),c=[];if(qi()){b=b.indexOf("https:")==0||b.indexOf("chrome-extension:")==0||b.indexOf("chrome-untrusted://new-tab-page")==0||b.indexOf("moz-extension:")==0;var d=b?E.__SAPISID:E.__APISID;d||typeof document==="undefined"||(d=new ni(document),d=d.get(b?"SAPISID":"APISID")||d.get("__Secure-3PAPISID"));(d=d?ki(d,b?"SAPISIDHASH":"APISIDHASH",a):null)&&c.push(d);b&&((b=ri("__1PSAPISID","__Secure-1PAPISID","SAPISID1PHASH",a))&&c.push(b),(a=ri("__3PSAPISID",
"__Secure-3PAPISID","SAPISID3PHASH",a))&&c.push(a))}return c.length==0?null:c.join(" ")}
;function ti(){}
ti.prototype.compress=function(a){var b,c,d,e;return C(function(f){switch(f.h){case 1:return b=new CompressionStream("gzip"),c=(new Response(b.readable)).arrayBuffer(),d=b.writable.getWriter(),f.yield(d.write((new TextEncoder).encode(a)),2);case 2:return f.yield(d.close(),3);case 3:return e=Uint8Array,f.yield(c,4);case 4:return f.return(new e(f.i))}})};
ti.prototype.isSupported=function(a){return a<1024?!1:typeof CompressionStream!=="undefined"};function ui(a){this.D=N(a)}
v(ui,O);function vi(a,b){this.intervalMs=a;this.callback=b;this.enabled=!1;this.h=function(){return Va()};
this.i=this.h()}
vi.prototype.setInterval=function(a){this.intervalMs=a;this.timer&&this.enabled?(this.stop(),this.start()):this.timer&&this.stop()};
vi.prototype.start=function(){var a=this;this.enabled=!0;this.timer||(this.timer=setTimeout(function(){a.tick()},this.intervalMs),this.i=this.h())};
vi.prototype.stop=function(){this.enabled=!1;this.timer&&(clearTimeout(this.timer),this.timer=void 0)};
vi.prototype.tick=function(){var a=this;if(this.enabled){var b=Math.max(this.h()-this.i,0);b<this.intervalMs*.8?this.timer=setTimeout(function(){a.tick()},this.intervalMs-b):(this.timer&&(clearTimeout(this.timer),this.timer=void 0),this.callback(),this.enabled&&(this.stop(),this.start()))}else this.timer=void 0};function wi(a){this.D=N(a)}
v(wi,O);function xi(a){this.D=N(a)}
v(xi,O);function yi(a,b){this.x=a!==void 0?a:0;this.y=b!==void 0?b:0}
n=yi.prototype;n.clone=function(){return new yi(this.x,this.y)};
n.equals=function(a){return a instanceof yi&&(this==a?!0:this&&a?this.x==a.x&&this.y==a.y:!1)};
n.ceil=function(){this.x=Math.ceil(this.x);this.y=Math.ceil(this.y);return this};
n.floor=function(){this.x=Math.floor(this.x);this.y=Math.floor(this.y);return this};
n.round=function(){this.x=Math.round(this.x);this.y=Math.round(this.y);return this};
n.scale=function(a,b){this.x*=a;this.y*=typeof b==="number"?b:a;return this};function zi(a,b){this.width=a;this.height=b}
n=zi.prototype;n.clone=function(){return new zi(this.width,this.height)};
n.aspectRatio=function(){return this.width/this.height};
n.ceil=function(){this.width=Math.ceil(this.width);this.height=Math.ceil(this.height);return this};
n.floor=function(){this.width=Math.floor(this.width);this.height=Math.floor(this.height);return this};
n.round=function(){this.width=Math.round(this.width);this.height=Math.round(this.height);return this};
n.scale=function(a,b){this.width*=a;this.height*=typeof b==="number"?b:a;return this};function Ai(a,b){for(var c in a)b.call(void 0,a[c],c,a)}
function Bi(a){var b=[],c=0,d;for(d in a)b[c++]=a[d];return b}
function Ci(a){var b=Di,c;for(c in b)if(a.call(void 0,b[c],c,b))return c}
function Ei(a){for(var b in a)return!1;return!0}
function Fi(a,b){if(a!==null&&b in a)throw Error('The object already contains the key "'+b+'"');a[b]=!0}
function Gi(a){return a!==null&&"privembed"in a?a.privembed:!1}
function Hi(a,b){for(var c in a)if(!(c in b)||a[c]!==b[c])return!1;for(var d in b)if(!(d in a))return!1;return!0}
function Ii(a){var b={},c;for(c in a)b[c]=a[c];return b}
function Ji(a){if(!a||typeof a!=="object")return a;if(typeof a.clone==="function")return a.clone();if(typeof Map!=="undefined"&&a instanceof Map)return new Map(a);if(typeof Set!=="undefined"&&a instanceof Set)return new Set(a);if(a instanceof Date)return new Date(a.getTime());var b=Array.isArray(a)?[]:typeof ArrayBuffer!=="function"||typeof ArrayBuffer.isView!=="function"||!ArrayBuffer.isView(a)||a instanceof DataView?{}:new a.constructor(a.length),c;for(c in a)b[c]=Ji(a[c]);return b}
var Ki="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");function Li(a,b){for(var c,d,e=1;e<arguments.length;e++){d=arguments[e];for(c in d)a[c]=d[c];for(var f=0;f<Ki.length;f++)c=Ki[f],Object.prototype.hasOwnProperty.call(d,c)&&(a[c]=d[c])}}
;function Mi(a,b){this.h=a===Ni&&b||""}
Mi.prototype.toString=function(){return this.h};
var Ni={};new Mi(Ni,"");"ARTICLE SECTION NAV ASIDE H1 H2 H3 H4 H5 H6 HEADER FOOTER ADDRESS P HR PRE BLOCKQUOTE OL UL LH LI DL DT DD FIGURE FIGCAPTION MAIN DIV EM STRONG SMALL S CITE Q DFN ABBR RUBY RB RT RTC RP DATA TIME CODE VAR SAMP KBD SUB SUP I B U MARK BDI BDO SPAN BR WBR NOBR INS DEL PICTURE PARAM TRACK MAP TABLE CAPTION COLGROUP COL TBODY THEAD TFOOT TR TD TH SELECT DATALIST OPTGROUP OPTION OUTPUT PROGRESS METER FIELDSET LEGEND DETAILS SUMMARY MENU DIALOG SLOT CANVAS FONT CENTER ACRONYM BASEFONT BIG DIR HGROUP STRIKE TT".split(" ").concat(["BUTTON",
"INPUT"]);function Oi(a){var b=document;return typeof a==="string"?b.getElementById(a):a}
function Pi(a){var b=document;a=String(a);b.contentType==="application/xhtml+xml"&&(a=a.toLowerCase());return b.createElement(a)}
function Qi(a){for(var b;b=a.firstChild;)a.removeChild(b)}
function Ri(a){a&&a.parentNode&&a.parentNode.removeChild(a)}
function Si(a,b){for(var c=0;a;){if(b(a))return a;a=a.parentNode;c++}return null}
;function Ti(a){this.D=N(a)}
v(Ti,O);Ti.prototype.Ic=function(){return tg(this)};function Ui(a){this.D=N(a)}
v(Ui,O);function Vi(a){this.D=N(a)}
v(Vi,O);function Wi(a){pg(Xi,Ui,1,a)}
var Yi=Lh(Vi);function Zi(a){this.D=N(a)}
v(Zi,O);var $i=["platform","platformVersion","architecture","model","uaFullVersion"],Xi=new Vi,aj=null;function bj(a,b){b=b===void 0?$i:b;if(!aj){var c;a=(c=a.navigator)==null?void 0:c.userAgentData;if(!a||typeof a.getHighEntropyValues!=="function"||a.brands&&typeof a.brands.map!=="function")return Promise.reject(Error("UACH unavailable"));Wi((a.brands||[]).map(function(e){var f=new Ui;f=ug(f,1,e.brand);return ug(f,2,e.version)}));
typeof a.mobile==="boolean"&&ag(Xi,2,bf(a.mobile));aj=a.getHighEntropyValues(b)}var d=new Set(b);return aj.then(function(e){var f=Xi.clone();d.has("platform")&&ug(f,3,e.platform);d.has("platformVersion")&&ug(f,4,e.platformVersion);d.has("architecture")&&ug(f,5,e.architecture);d.has("model")&&ug(f,6,e.model);d.has("uaFullVersion")&&ug(f,7,e.uaFullVersion);return f.serialize()}).catch(function(){return Xi.serialize()})}
;function cj(a){this.D=N(a)}
v(cj,O);function dj(a){return vg(a,1,1)}
;function ej(a){this.D=N(a,4)}
v(ej,O);function fj(a){this.D=N(a,36)}
v(fj,O);function gj(a){this.D=N(a,19)}
v(gj,O);gj.prototype.uc=function(a){return vg(this,2,a)};function hj(a,b){this.Xa=b=b===void 0?!1:b;this.j=this.locale=null;this.i=0;this.isFinal=!1;this.h=new gj;Number.isInteger(a)&&this.h.uc(a);b||(this.locale=document.documentElement.getAttribute("lang"));ij(this,new cj)}
hj.prototype.uc=function(a){this.h.uc(a);return this};
function ij(a,b){og(a.h,cj,1,b);tg(b)||dj(b);a.Xa||(b=jj(a),sg(b,5)||ug(b,5,a.locale));a.j&&(b=jj(a),mg(b,Vi,9)||og(b,Vi,9,a.j))}
function kj(a,b){a.i=b}
function lj(a){var b=b===void 0?$i:b;var c=a.Xa?void 0:window;c?bj(c,b).then(function(d){a.j=Yi(d!=null?d:"[]");d=jj(a);og(d,Vi,9,a.j);return!0}).catch(function(){return!1}):Promise.resolve(!1)}
function jj(a){var b=mg(a.h,cj,1);b||(b=new cj,ij(a,b));a=b;b=mg(a,Zi,11);b||(b=new Zi,og(a,Zi,11,b));return b}
function mj(a,b,c,d,e,f,g){c=c===void 0?0:c;d=d===void 0?0:d;e=e===void 0?null:e;f=f===void 0?0:f;g=g===void 0?0:g;if(!a.Xa){var h=jj(a);var k=new Ti;k=vg(k,1,a.i);k=ag(k,2,bf(a.isFinal));d=ag(k,3,ff(d>0?d:void 0));d=ag(d,4,ff(f>0?f:void 0));d=ag(d,5,ff(g>0?g:void 0));f=d.D;g=f[M]|0;d=oe(d,g)?d:Rf(d,f,g)?Sf(d,f):new d.constructor(Qf(f,g,!0));og(h,Ti,10,d)}a=a.h.clone();h=Date.now().toString();a=ag(a,4,pf(h));b=b.slice();b=pg(a,fj,3,b);e&&(a=new wi,e=ag(a,13,ff(e)),a=new xi,e=og(a,wi,2,e),a=new ej,
e=og(a,xi,1,e),e=vg(e,2,9),og(b,ej,18,e));c&&ag(b,14,pf(c));return b}
;var nj=function(){if(!E.addEventListener||!Object.defineProperty)return!1;var a=!1,b=Object.defineProperty({},"passive",{get:function(){a=!0}});
try{var c=function(){};
E.addEventListener("test",c,b);E.removeEventListener("test",c,b)}catch(d){}return a}();function oj(a,b,c,d){this.o=a;this.u=b;this.h=this.j=a;this.H=c||0;this.B=d||2}
oj.prototype.i=0;oj.prototype.reset=function(){this.h=this.j=this.o;this.i=0};
oj.prototype.getValue=function(){return this.j};
function pj(a){a.h=Math.min(a.u,a.h*a.B);a.j=Math.min(a.u,a.h+(a.H?Math.round(a.H*(Math.random()-.5)*2*a.h):0));a.i++}
;function Jh(a){this.D=N(a,8)}
v(Jh,O);var qj=Lh(Jh);function Kh(a){this.D=N(a)}
v(Kh,O);var rj;rj=new Ih;function sj(a){K.call(this);var b=this;this.componentId="";this.h=[];this.La="";this.pageId=null;this.Ra=this.ja=-1;this.G=this.experimentIds=null;this.B=this.o=0;this.M=null;this.Z=this.fa=0;this.Xb=1;this.timeoutMillis=0;this.na=!1;this.logSource=a.logSource;this.Ib=a.Ib||function(){};
this.j=new hj(a.logSource,a.Xa);this.network=a.network||null;this.wb=a.wb||null;this.bufferSize=1E3;this.I=a.Ig||null;this.sessionIndex=a.sessionIndex||null;this.ec=a.ec||!1;this.logger=null;this.withCredentials=!a.md;this.Xa=a.Xa||!1;this.X=!this.Xa&&!!window&&!!window.navigator&&window.navigator.sendBeacon!==void 0;this.Ka=typeof URLSearchParams!=="undefined"&&!!(new URL(tj())).searchParams&&!!(new URL(tj())).searchParams.set;var c=dj(new cj);ij(this.j,c);this.u=new oj(1E4,3E5,.1);a=uj(this,a.Nd);
this.i=new vi(this.u.getValue(),a);this.Da=new vi(6E5,a);this.ec||this.Da.start();this.Xa||(document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden"){vj(b);var d;(d=b.M)==null||d.flush()}}),document.addEventListener("pagehide",function(){vj(b);
var d;(d=b.M)==null||d.flush()}))}
v(sj,K);function uj(a,b){function c(){a.flush()}
return a.Ka?b?function(){b().then(c)}:c:function(){}}
sj.prototype.ba=function(){vj(this);this.i.stop();this.Da.stop();K.prototype.ba.call(this)};
function wj(a){a.I||(a.I=tj());try{return(new URL(a.I)).toString()}catch(b){return(new URL(a.I,window.location.origin)).toString()}}
function xj(a,b,c){a.M&&a.M.la(b,c)}
sj.prototype.log=function(a){xj(this,2,1);if(this.Ka){a=a.clone();var b=this.Xb++;a=ag(a,21,pf(b));this.componentId&&ug(a,26,this.componentId);b=a;var c=Zf(b,1);var d=d===void 0?!1:d;var e=typeof c;d=c==null?c:e==="bigint"?String(We(64,c)):df(c)?e==="string"?kf(c):d?lf(c):of(c):void 0;d==null&&(d=Date.now(),d=Number.isFinite(d)?d.toString():"0",ag(b,1,pf(d)));(ed?rf(Zf(b,15,void 0,void 0,sf)):rf(Zf(b,15)))==null&&ag(b,15,pf((new Date).getTimezoneOffset()*60));this.experimentIds&&(d=this.experimentIds.clone(),
og(b,ui,16,d));xj(this,1,1);b=this.h.length-this.bufferSize+1;b>0&&(this.h.splice(0,b),this.o+=b,xj(this,3,b));this.h.push(a);this.ec||this.i.enabled||this.i.start()}};
sj.prototype.flush=function(a,b){var c=this;if(this.h.length===0)a&&a();else if(this.na&&this.X)this.j.i=3,yj(this);else{var d=Date.now();if(this.Ra>d&&this.ja<d)b&&b("throttled");else{this.network&&(typeof this.network.Ic==="function"?kj(this.j,this.network.Ic()):this.j.i=0);var e=this.h.length,f=mj(this.j,this.h,this.o,this.B,this.wb,this.fa,this.Z),g=this.Ib();if(g&&this.La===g)b&&b("stale-auth-token");else{this.h=[];this.i.enabled&&this.i.stop();this.o=0;d=f.serialize();var h;this.G&&this.G.isSupported(d.length)&&
(h=this.G.compress(d));var k=zj(this,d,g),l=function(r){c.u.reset();c.i.setInterval(c.u.getValue());if(r){var t=null;try{var w=JSON.stringify(JSON.parse(r.replace(")]}'\n","")));t=qj(w)}catch(H){}if(t){r=Number(rg(t,1,De("-1")));r>0&&(c.ja=Date.now(),c.Ra=c.ja+r);r=Wa($d);var y;Wd&&r&&((y=t.D[r])==null?void 0:y[175237375])!=null&&Ud(ae,3);a:{var x=x===void 0?!1:x;if(Wa(ge)&&Wa($d)&&void 0===ge){y=t.D;r=y[$d];if(!r)break a;if(r=r.Cj)try{r(y,175237375,Df);break a}catch(H){ad(H)}}x&&(x=t.D,(y=Wa($d))&&
y in x&&(x=x[y])&&delete x[175237375])}x=rj.ctor?rj.h(t,rj.ctor,175237375,rj.i):rj.h(t,175237375,null,rj.i);if(x=x===null?void 0:x)x=Jc(x,1,-1),x!==-1&&(c.u=new oj(x<1?1:x,3E5,.1),c.i.setInterval(c.u.getValue()))}}a&&a();c.B=0},m=function(r,t){var w=Hc(f,fj,3);
var y=Number(rg(f,14));pj(c.u);c.i.setInterval(c.u.getValue());r===401&&g&&(c.La=g);y&&(c.o+=y);t===void 0&&(t=c.isRetryable(r));t&&(c.h=w.concat(c.h),c.ec||c.i.enabled||c.i.start());xj(c,7,1);b&&b("net-send-failed",r);++c.B},p=function(){c.network&&c.network.send(k,l,m)};
h?h.then(function(r){xj(c,5,e);k.Yc["Content-Encoding"]="gzip";k.Yc["Content-Type"]="application/binary";k.body=r;k.Te=2;p()},function(){xj(c,6,e);
p()}):p()}}}};
function zj(a,b,c){c=c===void 0?null:c;var d=d===void 0?a.withCredentials:d;var e={},f=new URL(wj(a));c&&(e.Authorization=c);a.sessionIndex&&(e["X-Goog-AuthUser"]=a.sessionIndex,f.searchParams.set("authuser",a.sessionIndex));a.pageId&&(Object.defineProperty(e,"X-Goog-PageId",{value:a.pageId}),f.searchParams.set("pageId",a.pageId));return{url:f.toString(),body:b,Te:1,Yc:e,requestType:"POST",withCredentials:d,timeoutMillis:a.timeoutMillis}}
function vj(a){a.j.isFinal=!0;a.flush();a.j.isFinal=!1}
function yj(a){Aj(a,function(b,c){b=new URL(b);b.searchParams.set("format","json");var d=!1;try{d=window.navigator.sendBeacon(b.toString(),c.serialize())}catch(e){}d||(a.X=!1);return d})}
function Aj(a,b){if(a.h.length!==0){var c=new URL(wj(a));c.searchParams.delete("format");var d=a.Ib();d&&c.searchParams.set("auth",d);c.searchParams.set("authuser",a.sessionIndex||"0");for(d=0;d<10&&a.h.length;++d){var e=a.h.slice(0,32),f=mj(a.j,e,a.o,a.B,a.wb,a.fa,a.Z);if(!b(c.toString(),f)){++a.B;break}a.o=0;a.B=0;a.fa=0;a.Z=0;a.h=a.h.slice(e.length)}a.i.enabled&&a.i.stop()}}
sj.prototype.isRetryable=function(a){return 500<=a&&a<600||a===401||a===0};
function tj(){return"https://play.google.com/log?format=json&hasfast=true"}
;function Bj(){this.Me=typeof AbortController!=="undefined"}
Bj.prototype.send=function(a,b,c){var d=this,e,f,g,h,k,l,m,p,r,t;return C(function(w){switch(w.h){case 1:return f=(e=d.Me?new AbortController:void 0)?setTimeout(function(){e.abort()},a.timeoutMillis):void 0,w.u(2,3),g=Object.assign({},{method:a.requestType,
headers:Object.assign({},a.Yc)},a.body&&{body:a.body},a.withCredentials&&{credentials:"include"},{signal:a.timeoutMillis&&e?e.signal:null}),w.yield(fetch(a.url,g),5);case 5:h=w.i;if(h.status!==200){(k=c)==null||k(h.status);w.v(3);break}if((l=b)==null){w.v(7);break}return w.yield(h.text(),8);case 8:l(w.i);case 7:case 3:w.Z();clearTimeout(f);w.fa(0);break;case 2:m=w.j();switch((p=m)==null?void 0:p.name){case "AbortError":(r=c)==null||r(408);break;default:(t=c)==null||t(400)}w.v(3)}})};
Bj.prototype.Ic=function(){return 4};function Cj(a,b){b=b===void 0?"0":b;K.call(this);this.logSource=a;this.sessionIndex=b;this.eb="https://play.google.com/log?format=json&hasfast=true";this.buildLabel=null;this.j=!1;this.network=null;this.componentId="";this.h=this.wb=null;this.i=!1;this.pageId=null;this.bufferSize=void 0}
v(Cj,K);function Dj(a,b){a.buildLabel=b;return a}
function Ej(a,b){a.network=b;return a}
function Fj(a,b){a.h=b}
function Gj(a){a.i=!0;return a}
Cj.prototype.md=function(){this.o=!0;return this};
function Hj(a){a.network||(a.network=new Bj);var b=new sj({logSource:a.logSource,Ib:a.Ib?a.Ib:si,sessionIndex:a.sessionIndex,Ig:a.eb,Xa:a.j,ec:!1,md:a.o,Nd:a.Nd,network:a.network});wc(a,b);if(a.buildLabel){var c=a.buildLabel,d=jj(b.j);ug(d,7,c)}b.G=new ti;a.componentId&&(b.componentId=a.componentId);a.wb&&(b.wb=a.wb);a.pageId&&(b.pageId=a.pageId);a.h&&((d=a.h)?(b.experimentIds||(b.experimentIds=new ui),c=b.experimentIds,d=d.serialize(),ug(c,4,d)):b.experimentIds&&ag(b.experimentIds,4));a.i&&(b.na=
b.X);lj(b.j);a.bufferSize&&(b.bufferSize=a.bufferSize);a.network.uc&&a.network.uc(a.logSource);a.network.vg&&a.network.vg(b);return b}
;function Ij(a,b,c,d,e,f,g){a=a===void 0?-1:a;b=b===void 0?"":b;c=c===void 0?"":c;d=d===void 0?!1:d;e=e===void 0?"":e;K.call(this);this.logSource=a;this.componentId=b;f?b=f:(a=new Cj(a,"0"),a.componentId=b,wc(this,a),c!==""&&(a.eb=c),d&&(a.j=!0),e&&Dj(a,e),g&&Ej(a,g),b=Hj(a));this.h=b}
v(Ij,K);Ij.prototype.flush=function(a){var b=a||[];if(b.length){a=new ei;for(var c=[],d=0;d<b.length;d++){var e=b[d],f=fi(e);c.push(f);e.clear()}pg(a,di,1,c);b=this.h;if(a instanceof fj)b.log(a);else try{var g=new fj,h=a.serialize();var k=ug(g,8,h);b.log(k)}catch(l){xj(b,4,1)}this.h.flush()}};function Jj(a){this.h=a}
;function Kj(a,b,c){this.i=a;this.o=b;this.fields=c||[];this.h=new Map}
function hi(a){return a.fields.map(function(b){return b.fieldType})}
function gi(a){return a.fields.map(function(b){return b.fieldName})}
n=Kj.prototype;n.Ne=function(a){var b=D.apply(1,arguments),c=this.qd(b);c?c.push(new Jj(a)):this.se(a,b)};
n.se=function(a){var b=this.Md(D.apply(1,arguments));this.h.set(b,[new Jj(a)])};
n.qd=function(){var a=this.Md(D.apply(0,arguments));return this.h.has(a)?this.h.get(a):void 0};
n.yf=function(){var a=this.qd(D.apply(0,arguments));return a&&a.length?a[0]:void 0};
n.clear=function(){this.h.clear()};
n.Md=function(){var a=D.apply(0,arguments);return a?a.join(","):"key"};function Lj(a,b){Kj.call(this,a,3,b)}
v(Lj,Kj);Lj.prototype.j=function(a){var b=D.apply(1,arguments),c=0,d=this.yf(b);d&&(c=d.h);this.se(c+a,b)};function Mj(a,b){Kj.call(this,a,2,b)}
v(Mj,Kj);Mj.prototype.record=function(a){this.Ne(a,D.apply(1,arguments))};function Nj(a,b){this.type=a;this.h=this.target=b;this.defaultPrevented=this.j=!1}
Nj.prototype.stopPropagation=function(){this.j=!0};
Nj.prototype.preventDefault=function(){this.defaultPrevented=!0};function Oj(a,b){Nj.call(this,a?a.type:"");this.relatedTarget=this.h=this.target=null;this.button=this.screenY=this.screenX=this.clientY=this.clientX=0;this.key="";this.charCode=this.keyCode=0;this.metaKey=this.shiftKey=this.altKey=this.ctrlKey=!1;this.state=null;this.pointerId=0;this.pointerType="";this.i=null;a&&this.init(a,b)}
Xa(Oj,Nj);
Oj.prototype.init=function(a,b){var c=this.type=a.type,d=a.changedTouches&&a.changedTouches.length?a.changedTouches[0]:null;this.target=a.target||a.srcElement;this.h=b;b=a.relatedTarget;b||(c=="mouseover"?b=a.fromElement:c=="mouseout"&&(b=a.toElement));this.relatedTarget=b;d?(this.clientX=d.clientX!==void 0?d.clientX:d.pageX,this.clientY=d.clientY!==void 0?d.clientY:d.pageY,this.screenX=d.screenX||0,this.screenY=d.screenY||0):(this.clientX=a.clientX!==void 0?a.clientX:a.pageX,this.clientY=a.clientY!==
void 0?a.clientY:a.pageY,this.screenX=a.screenX||0,this.screenY=a.screenY||0);this.button=a.button;this.keyCode=a.keyCode||0;this.key=a.key||"";this.charCode=a.charCode||(c=="keypress"?a.keyCode:0);this.ctrlKey=a.ctrlKey;this.altKey=a.altKey;this.shiftKey=a.shiftKey;this.metaKey=a.metaKey;this.pointerId=a.pointerId||0;this.pointerType=a.pointerType;this.state=a.state;this.i=a;a.defaultPrevented&&Oj.Ga.preventDefault.call(this)};
Oj.prototype.stopPropagation=function(){Oj.Ga.stopPropagation.call(this);this.i.stopPropagation?this.i.stopPropagation():this.i.cancelBubble=!0};
Oj.prototype.preventDefault=function(){Oj.Ga.preventDefault.call(this);var a=this.i;a.preventDefault?a.preventDefault():a.returnValue=!1};var Pj="closure_listenable_"+(Math.random()*1E6|0);var Qj=0;function Rj(a,b,c,d,e){this.listener=a;this.proxy=null;this.src=b;this.type=c;this.capture=!!d;this.handler=e;this.key=++Qj;this.sc=this.Cc=!1}
function Sj(a){a.sc=!0;a.listener=null;a.proxy=null;a.src=null;a.handler=null}
;function Tj(a){this.src=a;this.listeners={};this.h=0}
Tj.prototype.add=function(a,b,c,d,e){var f=a.toString();a=this.listeners[f];a||(a=this.listeners[f]=[],this.h++);var g=Uj(a,b,d,e);g>-1?(b=a[g],c||(b.Cc=!1)):(b=new Rj(b,this.src,f,!!d,e),b.Cc=c,a.push(b));return b};
Tj.prototype.remove=function(a,b,c,d){a=a.toString();if(!(a in this.listeners))return!1;var e=this.listeners[a];b=Uj(e,b,c,d);return b>-1?(Sj(e[b]),Array.prototype.splice.call(e,b,1),e.length==0&&(delete this.listeners[a],this.h--),!0):!1};
function Vj(a,b){var c=b.type;c in a.listeners&&Ub(a.listeners[c],b)&&(Sj(b),a.listeners[c].length==0&&(delete a.listeners[c],a.h--))}
function Uj(a,b,c,d){for(var e=0;e<a.length;++e){var f=a[e];if(!f.sc&&f.listener==b&&f.capture==!!c&&f.handler==d)return e}return-1}
;var Wj="closure_lm_"+(Math.random()*1E6|0),Xj={},Yj=0;function Zj(a,b,c,d,e){if(d&&d.once)ak(a,b,c,d,e);else if(Array.isArray(b))for(var f=0;f<b.length;f++)Zj(a,b[f],c,d,e);else c=bk(c),a&&a[Pj]?a.listen(b,c,La(d)?!!d.capture:!!d,e):ck(a,b,c,!1,d,e)}
function ck(a,b,c,d,e,f){if(!b)throw Error("Invalid event type");var g=La(e)?!!e.capture:!!e,h=dk(a);h||(a[Wj]=h=new Tj(a));c=h.add(b,c,d,g,f);if(!c.proxy){d=ek();c.proxy=d;d.src=a;d.listener=c;if(a.addEventListener)nj||(e=g),e===void 0&&(e=!1),a.addEventListener(b.toString(),d,e);else if(a.attachEvent)a.attachEvent(fk(b.toString()),d);else if(a.addListener&&a.removeListener)a.addListener(d);else throw Error("addEventListener and attachEvent are unavailable.");Yj++}}
function ek(){function a(c){return b.call(a.src,a.listener,c)}
var b=gk;return a}
function ak(a,b,c,d,e){if(Array.isArray(b))for(var f=0;f<b.length;f++)ak(a,b[f],c,d,e);else c=bk(c),a&&a[Pj]?hk(a,b,c,La(d)?!!d.capture:!!d,e):ck(a,b,c,!0,d,e)}
function ik(a,b,c,d,e){if(Array.isArray(b))for(var f=0;f<b.length;f++)ik(a,b[f],c,d,e);else(d=La(d)?!!d.capture:!!d,c=bk(c),a&&a[Pj])?a.i.remove(String(b),c,d,e):a&&(a=dk(a))&&(b=a.listeners[b.toString()],a=-1,b&&(a=Uj(b,c,d,e)),(c=a>-1?b[a]:null)&&jk(c))}
function jk(a){if(typeof a!=="number"&&a&&!a.sc){var b=a.src;if(b&&b[Pj])Vj(b.i,a);else{var c=a.type,d=a.proxy;b.removeEventListener?b.removeEventListener(c,d,a.capture):b.detachEvent?b.detachEvent(fk(c),d):b.addListener&&b.removeListener&&b.removeListener(d);Yj--;(c=dk(b))?(Vj(c,a),c.h==0&&(c.src=null,b[Wj]=null)):Sj(a)}}}
function fk(a){return a in Xj?Xj[a]:Xj[a]="on"+a}
function gk(a,b){if(a.sc)a=!0;else{b=new Oj(b,this);var c=a.listener,d=a.handler||a.src;a.Cc&&jk(a);a=c.call(d,b)}return a}
function dk(a){a=a[Wj];return a instanceof Tj?a:null}
var kk="__closure_events_fn_"+(Math.random()*1E9>>>0);function bk(a){if(typeof a==="function")return a;a[kk]||(a[kk]=function(b){return a.handleEvent(b)});
return a[kk]}
;function lk(){K.call(this);this.i=new Tj(this);this.na=this;this.Z=null}
Xa(lk,K);lk.prototype[Pj]=!0;n=lk.prototype;n.addEventListener=function(a,b,c,d){Zj(this,a,b,c,d)};
n.removeEventListener=function(a,b,c,d){ik(this,a,b,c,d)};
function mk(a,b){var c=a.Z;if(c){var d=[];for(var e=1;c;c=c.Z)d.push(c),++e}a=a.na;c=b.type||b;typeof b==="string"?b=new Nj(b,a):b instanceof Nj?b.target=b.target||a:(e=b,b=new Nj(c,a),Li(b,e));e=!0;var f;if(d)for(f=d.length-1;!b.j&&f>=0;f--){var g=b.h=d[f];e=nk(g,c,!0,b)&&e}b.j||(g=b.h=a,e=nk(g,c,!0,b)&&e,b.j||(e=nk(g,c,!1,b)&&e));if(d)for(f=0;!b.j&&f<d.length;f++)g=b.h=d[f],e=nk(g,c,!1,b)&&e}
n.ba=function(){lk.Ga.ba.call(this);this.removeAllListeners();this.Z=null};
n.listen=function(a,b,c,d){return this.i.add(String(a),b,!1,c,d)};
function hk(a,b,c,d,e){a.i.add(String(b),c,!0,d,e)}
n.removeAllListeners=function(a){if(this.i){var b=this.i;a=a&&a.toString();var c=0,d;for(d in b.listeners)if(!a||d==a){for(var e=b.listeners[d],f=0;f<e.length;f++)++c,Sj(e[f]);delete b.listeners[d];b.h--}b=c}else b=0;return b};
function nk(a,b,c,d){b=a.i.listeners[String(b)];if(!b)return!0;b=b.concat();for(var e=!0,f=0;f<b.length;++f){var g=b[f];if(g&&!g.sc&&g.capture==c){var h=g.listener,k=g.handler||g.src;g.Cc&&Vj(a.i,g);e=h.call(k,d)!==!1&&e}}return e&&!d.defaultPrevented}
;var ok=typeof AsyncContext!=="undefined"&&typeof AsyncContext.Snapshot==="function"?function(a){return a&&AsyncContext.Snapshot.wrap(a)}:function(a){return a};function pk(a,b){this.j=a;this.o=b;this.i=0;this.h=null}
pk.prototype.get=function(){if(this.i>0){this.i--;var a=this.h;this.h=a.next;a.next=null}else a=this.j();return a};
function qk(a,b){a.o(b);a.i<100&&(a.i++,b.next=a.h,a.h=b)}
;function rk(){this.i=this.h=null}
rk.prototype.add=function(a,b){var c=sk.get();c.set(a,b);this.i?this.i.next=c:this.h=c;this.i=c};
rk.prototype.remove=function(){var a=null;this.h&&(a=this.h,this.h=this.h.next,this.h||(this.i=null),a.next=null);return a};
var sk=new pk(function(){return new tk},function(a){return a.reset()});
function tk(){this.next=this.scope=this.h=null}
tk.prototype.set=function(a,b){this.h=a;this.scope=b;this.next=null};
tk.prototype.reset=function(){this.next=this.scope=this.h=null};var uk,vk=!1,wk=new rk;function xk(a,b){uk||yk();vk||(uk(),vk=!0);wk.add(a,b)}
function yk(){var a=Promise.resolve(void 0);uk=function(){a.then(zk)}}
function zk(){for(var a;a=wk.remove();){try{a.h.call(a.scope)}catch(b){ad(b)}qk(sk,a)}vk=!1}
;function Ak(){}
function Bk(a){var b=!1,c;return function(){b||(c=a(),b=!0);return c}}
;function Ck(a){this.ea=0;this.lb=void 0;this.Eb=this.bb=this.parent_=null;this.Jc=this.od=!1;if(a!=Ak)try{var b=this;a.call(void 0,function(c){Dk(b,2,c)},function(c){Dk(b,3,c)})}catch(c){Dk(this,3,c)}}
function Ek(){this.next=this.context=this.h=this.i=this.child=null;this.j=!1}
Ek.prototype.reset=function(){this.context=this.h=this.i=this.child=null;this.j=!1};
var Fk=new pk(function(){return new Ek},function(a){a.reset()});
function Gk(a,b,c){var d=Fk.get();d.i=a;d.h=b;d.context=c;return d}
function Hk(a){return new Ck(function(b,c){c(a)})}
Ck.prototype.then=function(a,b,c){return Ik(this,ok(typeof a==="function"?a:null),ok(typeof b==="function"?b:null),c)};
Ck.prototype.$goog_Thenable=!0;function Jk(a,b,c,d){Kk(a,Gk(b||Ak,c||null,d))}
n=Ck.prototype;n.finally=function(a){var b=this;a=ok(a);return new Ck(function(c,d){Jk(b,function(e){a();c(e)},function(e){a();
d(e)})})};
n.ed=function(a,b){return Ik(this,null,ok(a),b)};
n.catch=Ck.prototype.ed;n.cancel=function(a){if(this.ea==0){var b=new Lk(a);xk(function(){Mk(this,b)},this)}};
function Mk(a,b){if(a.ea==0)if(a.parent_){var c=a.parent_;if(c.bb){for(var d=0,e=null,f=null,g=c.bb;g&&(g.j||(d++,g.child==a&&(e=g),!(e&&d>1)));g=g.next)e||(f=g);e&&(c.ea==0&&d==1?Mk(c,b):(f?(d=f,d.next==c.Eb&&(c.Eb=d),d.next=d.next.next):Nk(c),Ok(c,e,3,b)))}a.parent_=null}else Dk(a,3,b)}
function Kk(a,b){a.bb||a.ea!=2&&a.ea!=3||Pk(a);a.Eb?a.Eb.next=b:a.bb=b;a.Eb=b}
function Ik(a,b,c,d){var e=Gk(null,null,null);e.child=new Ck(function(f,g){e.i=b?function(h){try{var k=b.call(d,h);f(k)}catch(l){g(l)}}:f;
e.h=c?function(h){try{var k=c.call(d,h);k===void 0&&h instanceof Lk?g(h):f(k)}catch(l){g(l)}}:g});
e.child.parent_=a;Kk(a,e);return e.child}
n.Gg=function(a){this.ea=0;Dk(this,2,a)};
n.Hg=function(a){this.ea=0;Dk(this,3,a)};
function Dk(a,b,c){if(a.ea==0){a===c&&(b=3,c=new TypeError("Promise cannot resolve to itself"));a.ea=1;a:{var d=c,e=a.Gg,f=a.Hg;if(d instanceof Ck){Jk(d,e,f,a);var g=!0}else{if(d)try{var h=!!d.$goog_Thenable}catch(l){h=!1}else h=!1;if(h)d.then(e,f,a),g=!0;else{if(La(d))try{var k=d.then;if(typeof k==="function"){Qk(d,k,e,f,a);g=!0;break a}}catch(l){f.call(a,l);g=!0;break a}g=!1}}}g||(a.lb=c,a.ea=b,a.parent_=null,Pk(a),b!=3||c instanceof Lk||Rk(a,c))}}
function Qk(a,b,c,d,e){function f(k){h||(h=!0,d.call(e,k))}
function g(k){h||(h=!0,c.call(e,k))}
var h=!1;try{b.call(a,g,f)}catch(k){f(k)}}
function Pk(a){a.od||(a.od=!0,xk(a.nf,a))}
function Nk(a){var b=null;a.bb&&(b=a.bb,a.bb=b.next,b.next=null);a.bb||(a.Eb=null);return b}
n.nf=function(){for(var a;a=Nk(this);)Ok(this,a,this.ea,this.lb);this.od=!1};
function Ok(a,b,c,d){if(c==3&&b.h&&!b.j)for(;a&&a.Jc;a=a.parent_)a.Jc=!1;if(b.child)b.child.parent_=null,Sk(b,c,d);else try{b.j?b.i.call(b.context):Sk(b,c,d)}catch(e){Tk.call(null,e)}qk(Fk,b)}
function Sk(a,b,c){b==2?a.i.call(a.context,c):a.h&&a.h.call(a.context,c)}
function Rk(a,b){a.Jc=!0;xk(function(){a.Jc&&Tk.call(null,b)})}
var Tk=ad;function Lk(a){db.call(this,a)}
Xa(Lk,db);Lk.prototype.name="cancel";function Uk(a,b){lk.call(this);this.j=a||1;this.h=b||E;this.o=Ta(this.Dg,this);this.u=Va()}
Xa(Uk,lk);n=Uk.prototype;n.enabled=!1;n.Ja=null;n.setInterval=function(a){this.j=a;this.Ja&&this.enabled?(this.stop(),this.start()):this.Ja&&this.stop()};
n.Dg=function(){if(this.enabled){var a=Va()-this.u;a>0&&a<this.j*.8?this.Ja=this.h.setTimeout(this.o,this.j-a):(this.Ja&&(this.h.clearTimeout(this.Ja),this.Ja=null),mk(this,"tick"),this.enabled&&(this.stop(),this.start()))}};
n.start=function(){this.enabled=!0;this.Ja||(this.Ja=this.h.setTimeout(this.o,this.j),this.u=Va())};
n.stop=function(){this.enabled=!1;this.Ja&&(this.h.clearTimeout(this.Ja),this.Ja=null)};
n.ba=function(){Uk.Ga.ba.call(this);this.stop();delete this.h};function Vk(a){K.call(this);this.G=a;this.o=0;this.j=100;this.u=!1;this.i=new Map;this.B=new Set;this.flushInterval=3E4;this.h=new Uk(this.flushInterval);this.h.listen("tick",this.dd,!1,this);wc(this,this.h)}
v(Vk,K);n=Vk.prototype;n.sendIsolatedPayload=function(a){this.u=a;this.j=1};
function Wk(a){a.h.enabled||a.h.start();a.o++;a.o>=a.j&&a.dd()}
n.dd=function(){var a=this.i.values();a=[].concat(A(a)).filter(function(b){return b.h.size});
a.length&&this.G.flush(a,this.u);Xk(a);this.o=0;this.h.enabled&&this.h.stop()};
n.Cb=function(a){var b=D.apply(1,arguments);this.i.has(a)||this.i.set(a,new Lj(a,b))};
n.kd=function(a){var b=D.apply(1,arguments);this.i.has(a)||this.i.set(a,new Mj(a,b))};
function Yk(a,b){return a.B.has(b)?void 0:a.i.get(b)}
n.zb=function(a){this.Le(a,1,D.apply(1,arguments))};
n.Le=function(a,b){var c=D.apply(2,arguments),d=Yk(this,a);d&&d instanceof Lj&&(d.j(b,c),Wk(this))};
n.record=function(a,b){var c=D.apply(2,arguments),d=Yk(this,a);d&&d instanceof Mj&&(d.record(b,c),Wk(this))};
function Xk(a){for(var b=0;b<a.length;b++)a[b].clear()}
;function Zk(a){switch(a){case 200:return 0;case 400:return 3;case 401:return 16;case 403:return 7;case 404:return 5;case 409:return 10;case 412:return 9;case 429:return 8;case 499:return 1;case 500:return 2;case 501:return 12;case 503:return 14;case 504:return 4;default:return 2}}
function $k(a){switch(a){case 0:return"OK";case 1:return"CANCELLED";case 2:return"UNKNOWN";case 3:return"INVALID_ARGUMENT";case 4:return"DEADLINE_EXCEEDED";case 5:return"NOT_FOUND";case 6:return"ALREADY_EXISTS";case 7:return"PERMISSION_DENIED";case 16:return"UNAUTHENTICATED";case 8:return"RESOURCE_EXHAUSTED";case 9:return"FAILED_PRECONDITION";case 10:return"ABORTED";case 11:return"OUT_OF_RANGE";case 12:return"UNIMPLEMENTED";case 13:return"INTERNAL";case 14:return"UNAVAILABLE";case 15:return"DATA_LOSS";
default:return""}}
;function al(a,b,c){c=c===void 0?{}:c;b=Error.call(this,b);this.message=b.message;"stack"in b&&(this.stack=b.stack);this.code=a;this.metadata=c;this.name="RpcError";Object.setPrototypeOf(this,this.constructor.prototype)}
v(al,Error);al.prototype.toString=function(){var a="RpcError("+($k(this.code)||String(this.code))+")";this.message&&(a+=": "+this.message);return a};function bl(){}
bl.prototype.serialize=function(a){var b=[];cl(this,a,b);return b.join("")};
function cl(a,b,c){if(b==null)c.push("null");else{if(typeof b=="object"){if(Array.isArray(b)){var d=b;b=d.length;c.push("[");for(var e="",f=0;f<b;f++)c.push(e),cl(a,d[f],c),e=",";c.push("]");return}if(b instanceof String||b instanceof Number||b instanceof Boolean)b=b.valueOf();else{c.push("{");e="";for(d in b)Object.prototype.hasOwnProperty.call(b,d)&&(f=b[d],typeof f!="function"&&(c.push(e),dl(d,c),c.push(":"),cl(a,f,c),e=","));c.push("}");return}}switch(typeof b){case "string":dl(b,c);break;case "number":c.push(isFinite(b)&&
!isNaN(b)?String(b):"null");break;case "boolean":c.push(String(b));break;case "function":c.push("null");break;default:throw Error("Unknown type: "+typeof b);}}}
var el={'"':'\\"',"\\":"\\\\","/":"\\/","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\v":"\\u000b"},fl=/\uffff/.test("\uffff")?/[\\"\x00-\x1f\x7f-\uffff]/g:/[\\"\x00-\x1f\x7f-\xff]/g;function dl(a,b){b.push('"',a.replace(fl,function(c){var d=el[c];d||(d="\\u"+(c.charCodeAt(0)|65536).toString(16).slice(1),el[c]=d);return d}),'"')}
;function gl(){lk.call(this);this.headers=new Map;this.h=!1;this.S=null;this.o=this.X="";this.j=this.M=this.B=this.I=!1;this.G=0;this.u=null;this.ja="";this.fa=!1}
Xa(gl,lk);var hl=/^https?$/i,il=["POST","PUT"],jl=[];function kl(a,b,c,d,e,f,g){var h=new gl;jl.push(h);b&&h.listen("complete",b);hk(h,"ready",h.Xe);f&&(h.G=Math.max(0,f));g&&(h.fa=g);h.send(a,c,d,e)}
n=gl.prototype;n.Xe=function(){this.dispose();Ub(jl,this)};
n.send=function(a,b,c,d){if(this.S)throw Error("[goog.net.XhrIo] Object is active with another request="+this.X+"; newUri="+a);b=b?b.toUpperCase():"GET";this.X=a;this.o="";this.I=!1;this.h=!0;this.S=new XMLHttpRequest;this.S.onreadystatechange=ok(Ta(this.ge,this));try{this.getStatus(),this.M=!0,this.S.open(b,String(a),!0),this.M=!1}catch(g){this.getStatus();ll(this,g);return}a=c||"";c=new Map(this.headers);if(d)if(Object.getPrototypeOf(d)===Object.prototype)for(var e in d)c.set(e,d[e]);else if(typeof d.keys===
"function"&&typeof d.get==="function"){e=z(d.keys());for(var f=e.next();!f.done;f=e.next())f=f.value,c.set(f,d.get(f))}else throw Error("Unknown input type for opt_headers: "+String(d));d=Array.from(c.keys()).find(function(g){return"content-type"==g.toLowerCase()});
e=E.FormData&&a instanceof E.FormData;!(Ob(il,b)>=0)||d||e||c.set("Content-Type","application/x-www-form-urlencoded;charset=utf-8");b=z(c);for(d=b.next();!d.done;d=b.next())c=z(d.value),d=c.next().value,c=c.next().value,this.S.setRequestHeader(d,c);this.ja&&(this.S.responseType=this.ja);"withCredentials"in this.S&&this.S.withCredentials!==this.fa&&(this.S.withCredentials=this.fa);try{this.u&&(clearTimeout(this.u),this.u=null),this.G>0&&(this.getStatus(),this.u=setTimeout(this.Fg.bind(this),this.G)),
this.getStatus(),this.B=!0,this.S.send(a),this.B=!1}catch(g){this.getStatus(),ll(this,g)}};
n.Fg=function(){typeof Ha!="undefined"&&this.S&&(this.o="Timed out after "+this.G+"ms, aborting",this.getStatus(),mk(this,"timeout"),this.abort(8))};
function ll(a,b){a.h=!1;a.S&&(a.j=!0,a.S.abort(),a.j=!1);a.o=b;ml(a);nl(a)}
function ml(a){a.I||(a.I=!0,mk(a,"complete"),mk(a,"error"))}
n.abort=function(){this.S&&this.h&&(this.getStatus(),this.h=!1,this.j=!0,this.S.abort(),this.j=!1,mk(this,"complete"),mk(this,"abort"),nl(this))};
n.ba=function(){this.S&&(this.h&&(this.h=!1,this.j=!0,this.S.abort(),this.j=!1),nl(this,!0));gl.Ga.ba.call(this)};
n.ge=function(){this.J||(this.M||this.B||this.j?ol(this):this.Wf())};
n.Wf=function(){ol(this)};
function ol(a){if(a.h&&typeof Ha!="undefined")if(a.B&&(a.S?a.S.readyState:0)==4)setTimeout(a.ge.bind(a),0);else if(mk(a,"readystatechange"),a.isComplete()){a.getStatus();a.h=!1;try{if(pl(a))mk(a,"complete"),mk(a,"success");else{try{var b=(a.S?a.S.readyState:0)>2?a.S.statusText:""}catch(c){b=""}a.o=b+" ["+a.getStatus()+"]";ml(a)}}finally{nl(a)}}}
function nl(a,b){if(a.S){a.u&&(clearTimeout(a.u),a.u=null);var c=a.S;a.S=null;b||mk(a,"ready");try{c.onreadystatechange=null}catch(d){}}}
n.isActive=function(){return!!this.S};
n.isComplete=function(){return(this.S?this.S.readyState:0)==4};
function pl(a){var b=a.getStatus();a:switch(b){case 200:case 201:case 202:case 204:case 206:case 304:case 1223:var c=!0;break a;default:c=!1}if(!c){if(b=b===0)a=String(a.X).match(ec)[1]||null,!a&&E.self&&E.self.location&&(a=E.self.location.protocol.slice(0,-1)),b=!hl.test(a?a.toLowerCase():"");c=b}return c}
n.getStatus=function(){try{return(this.S?this.S.readyState:0)>2?this.S.status:-1}catch(a){return-1}};
n.getLastError=function(){return typeof this.o==="string"?this.o:String(this.o)};function ql(){}
ql.prototype.send=function(a,b,c){b=b===void 0?function(){}:b;
c=c===void 0?function(){}:c;
kl(a.url,function(d){d=d.target;if(pl(d)){try{var e=d.S?d.S.responseText:""}catch(f){e=""}b(e)}else c(d.getStatus())},a.requestType,a.body,a.Yc,a.timeoutMillis,a.withCredentials)};
ql.prototype.Ic=function(){return 1};function rl(a,b){this.logger=a;this.event=b;this.startTime=sl()}
rl.prototype.done=function(){this.logger.rb(this.event,sl()-this.startTime)};
function tl(){Mc.apply(this,arguments)}
v(tl,Mc);function ul(a,b,c){var d=sl();b=b();a.rb(c,sl()-d);return b}
function vl(){tl.apply(this,arguments)}
v(vl,tl);n=vl.prototype;n.lc=function(){};
n.Oa=function(){};
n.rb=function(){};
n.Aa=function(){};
n.Za=function(){};
n.Oc=function(){};
n.Mc=function(){};
n.Nc=function(){};
function wl(a){tl.call(this);var b=this;this.logger=a;this.addOnDisposeCallback(function(){return void b.logger.dispose()})}
v(wl,tl);n=wl.prototype;n.update=function(a){this.logger.dispose();this.logger=a};
n.Oa=function(a){this.logger.Oa(a)};
n.rb=function(a,b){this.logger.rb(a,b)};
n.Aa=function(a){this.logger.Aa(a)};
n.Za=function(){this.logger.Za()};
n.Oc=function(a){this.logger.Oc(a)};
n.Mc=function(a){this.logger.Mc(a)};
n.Nc=function(a){this.logger.Nc(a)};
n.lc=function(a){this.logger.lc(a)};
function xl(a,b,c,d){a=Gj(Ej(Dj(new Cj(1828,"0"),a),new ql)).md();b.length&&Fj(a,Nh(new Mh,b));d!==void 0&&(a.eb=d);var e=new Ij(1828,"","",!1,"",Hj(a));wc(e,a);var f=new Vk({flush:function(g){try{e.flush(g)}catch(h){c(h)}}});
f.addOnDisposeCallback(function(){setTimeout(function(){try{f.dd()}finally{e.dispose()}})});
f.j=1E5;f.flushInterval=3E4;f.h.setInterval(3E4);return f}
function yl(a,b){K.call(this);var c=this;this.callback=a;this.i=b;this.h=-b;this.addOnDisposeCallback(function(){return void clearTimeout(c.timer)})}
v(yl,K);function zl(a){if(a.timer===void 0){var b=Math.max(0,a.h+a.i-sl());a.timer=setTimeout(function(){try{a.callback()}finally{a.h=sl(),a.timer=void 0}},b)}}
function Al(a,b){tl.call(this);this.metrics=a;this.va=b}
v(Al,tl);n=Al.prototype;n.lc=function(a){this.metrics.zg.record(a,this.va)};
n.Oa=function(a){this.metrics.eventCount.la(a,this.va)};
n.rb=function(a,b){this.metrics.mf.record(b,a,this.va)};
n.Aa=function(a){this.metrics.errorCount.la(a,this.va)};
n.Oc=function(a){this.metrics.Lg.la(a,this.va)};
n.Mc=function(a){this.metrics.Ue.la(a,this.va)};
n.Nc=function(a){this.metrics.Kg.la(a,this.va)};
function Bl(a,b){b=b===void 0?[]:b;var c={va:a.va||"_",pd:a.pd||[],ud:a.ud|0,eb:a.eb,Sc:a.Sc||function(){},
Vb:a.Vb||function(f,g){return xl(f,g,c.Sc,c.eb)}},d=c.Vb("53",c.pd.concat(b));
Al.call(this,{zg:new Pc(d),errorCount:new Tc(d),eventCount:new Rc(d),mf:new Sc(d),Oj:new Qc(d),Lg:new Uc(d),Ue:new Vc(d),Kg:new Wc(d)},c.va);var e=this;this.options=c;this.service=d;this.j=!a.Vb;this.h=new yl(function(){return void e.service.dd()},c.ud);
this.addOnDisposeCallback(function(){e.h.dispose();e.j&&e.service.dispose()});
b.slice().sort(Xb)}
v(Bl,Al);Bl.prototype.Za=function(){zl(this.h)};
function sl(){var a,b,c;return(c=(a=globalThis.performance)==null?void 0:(b=a.now)==null?void 0:b.call(a))!=null?c:Date.now()}
;function Cl(a){this.D=N(a)}
v(Cl,O);function Dl(a){this.D=N(a)}
v(Dl,O);function El(a){this.D=N(a,0,"bfkj")}
v(El,O);var Fl=function(a){return ue(function(b){return b instanceof a&&!oe(b)})}(El);
El.Rf="bfkj";function Ic(a){this.D=N(a)}
v(Ic,O);function Gl(a){this.D=N(a)}
v(Gl,O);var Hl=Lh(Gl);function Il(){var a=this;this.promise=new Promise(function(b,c){a.resolve=b;a.reject=c})}
;function Jl(a,b){if(a.disable)return new vl;b=b?Gc(b):[];a={va:a.va,pd:a.qf,ud:a.Sf,eb:a.eb,Sc:a.Sc,Vb:a.Vb};b=b===void 0?[]:b;return new Bl(a,b)}
function Kl(a){function b(w,y,x,H){Promise.resolve().then(function(){k.done();h.Za();h.dispose();g.resolve({Pe:w,yg:y,ag:x,Ve:H})})}
function c(w,y,x,H){if(!d.logger.J){var F="k";y?F="h":x&&(F="u");F!=="k"?H!==0&&(d.logger.Oa(F),d.logger.rb(F,w)):d.j<=0?(d.logger.Oa(F),d.logger.rb(F,w),d.j=Math.floor(Math.random()*200)):d.j--}}
K.call(this);var d=this;this.j=Math.floor(Math.random()*200);this.h=new Gl;if("challenge"in a&&Fl(a.challenge)){var e=sg(a.challenge,4,void 0,te);var f=sg(a.challenge,5,void 0,te);sg(a.challenge,7,void 0,te)&&(this.h=Hl(sg(a.challenge,7,void 0,te)))}else e=a.program,f=a.globalName;this.addOnDisposeCallback(function(){var w,y,x;return C(function(H){if(H.h==1)return H.yield(d.i,2);w=H.i;y=w.yg;(x=y)==null||x();H.o()})});
this.logger=Jl(a.Pb||{},this.h);wc(this,this.logger);var g=new Il;this.i=g.promise;this.logger.Oa("t");var h=this.logger.share(),k=new rl(h,"t");if(!E[f])throw this.logger.Aa(25),Error("EGOU");if(!E[f].a)throw this.logger.Aa(26),Error("ELIU");try{var l=E[f].a;f=[];for(var m=[],p=Gc(this.h),r=0;r<p.length;r++)f.push(p[r]),m.push(1);var t=Kc(this.h);for(p=0;p<t.length;p++)f.push(t[p]),m.push(2);this.o=z(l(e,b,!0,a.Ce,c,[f,m],sg(this.h,5),!1)).next().value;this.Tb=g.promise.then(function(){})}catch(w){throw this.logger.Aa(28),
w;
}}
v(Kl,K);n=Kl.prototype;n.snapshot=function(a){if(this.J)throw Error("Already disposed");this.logger.Oa("n");var b=this.logger.share();return this.i.then(function(c){var d=c.Pe;return new Promise(function(e){var f=new rl(b,"n");d(function(g){f.done();b.lc(g.length);b.Za();b.dispose();e(g)},[a.Ma,
a.cd,a.Ge,a.Gd])})})};
n.ue=function(a){var b=this;if(this.J)throw Error("Already disposed");this.logger.Oa("n");var c=ul(this.logger,function(){return b.o([a.Ma,a.cd,a.Ge,a.Gd])},"n");
this.logger.lc(c.length);this.logger.Za();return c};
n.nc=function(a){this.i.then(function(b){var c;(c=b.ag)==null||c(a)})};
n.Ec=function(a,b){return this.i.then(function(c){var d;return(d=c.Ve)==null?void 0:d(a,b,!1)})};
n.vc=function(){return this.logger.share()};function Ll(a){if(!a)return null;a=xf(Zf(a,4,void 0,Yf));return a===null||a===void 0?null:lb(a)}
;function Ml(){this.promises={};this.h=null}
function Nl(){Ml.instance||(Ml.instance=new Ml);return Ml.instance}
function Ol(a,b){return Pl(a,mg(b,Cl,1,te),mg(b,Dl,2,te),sg(b,3,void 0,te))}
function Pl(a,b,c,d){if(!b&&!c)return Promise.resolve();if(!d)return Ql(b,c);var e;(e=a.promises)[d]||(e[d]=new Promise(function(f,g){Ql(b,c).then(function(){a.h=d;f()},function(h){delete a.promises[d];
g(h)})}));
return a.promises[d]}
function Ql(a,b){return b?Rl(b):a?Sl(a):Promise.resolve()}
function Rl(a){return new Promise(function(b,c){var d=Pi("SCRIPT"),e=Ll(a);Hb(d,e);d.onload=function(){Ri(d);b()};
d.onerror=function(){Ri(d);c(Error("EWLS"))};
(document.getElementsByTagName("HEAD")[0]||document.documentElement).appendChild(d)})}
function Sl(a){return new Promise(function(b){var c=Pi("SCRIPT");if(a){var d=xf(Zf(a,6,void 0,Yf));d=d===null||d===void 0?null:Eb(d)}else d=null;c.textContent=Fb(d);Gb(c);(document.getElementsByTagName("HEAD")[0]||document.documentElement).appendChild(c);Ri(c);b()})}
;function Tl(a){this.D=N(a)}
v(Tl,O);function Ul(a,b){return hg(a,1,wf(b))}
function Vl(a,b){return hg(a,2,wf(b))}
;function Wl(a){K.call(this);var b=this;this.options=a;this.B=new Il;this.Tb=this.B.promise;this.u=new Il;this.I=1;this.j=new Il;this.o=[];this.isPaused=!1;this.Tc=a.Tc||function(){};
this.logger=new wl(Jl(a.Pb||{}));Xl(this,a.Ta,a.Cf,a.Dj,a.Fj,Object.assign({},Yl,a.Wb||{}));this.addOnDisposeCallback(function(){return void Zl(b)})}
v(Wl,K);n=Wl.prototype;n.snapshot=function(a){var b=this;return C(function(c){switch(c.h){case 1:if(b.J)throw Error("Already disposed");if(b.i||b.G){c.v(2);break}return c.yield(b.u.promise,2);case 2:if(!b.i){c.v(4);break}return c.yield(b.i.snapshot(a),5);case 5:return c.return(c.i);case 4:throw b.G;}})};
n.pause=function(){this.J||this.isPaused||(this.isPaused=!0,this.h&&this.h.pause())};
n.resume=function(){!this.J&&this.isPaused&&(this.isPaused=!1,this.h&&this.h.resume())};
n.checkForRefresh=function(){var a=this;return C(function(b){if(a.J)throw Error("Already disposed");var c;if(c=a.h)c=a.h,c.isExpired()?($l(c),c.Zc(0),c=!0):c=!1,c=!c;return c?b.v(0):b.yield(a.j.promise,0)})};
function am(a){var b;return C(function(c){if(a.J)throw Error("Already disposed");(b=a.h)==null||bm(b);return c.yield(a.j.promise,0)})}
function Zl(a){a.G=Error("Cancelled by dispose");a.u.resolve();Lc(a.B.promise);a.B.reject(Error("Cancelled by dispose"));a.logger.dispose();Promise.all(a.o).then(function(){var c;return C(function(d){(c=a.i)==null||c.dispose();a.i=void 0;d.o()})});
a.o=[];var b;(b=a.h)==null||bm(b);Lc(a.j.promise);a.j.reject(Error("Cancelled by dispose"))}
n.nc=function(a){var b,c;(b=this.i)==null||(c=b.nc)==null||c.call(b,a)};
n.Ec=function(a,b){var c,d,e;return(e=(c=this.i)==null?void 0:(d=c.Ec)==null?void 0:d.call(c,a,b))!=null?e:Promise.resolve()};
function cm(a,b){var c=a.Tc;a.Tc=function(){c();b()}}
function dm(a,b){a.J||(a.i=b,a.logger.update(b.vc()),a.u.resolve(),a.B.resolve(void 0),a.Tc())}
n.handleError=function(a){if(!this.J){this.G=a;this.u.resolve();var b,c;(c=(b=this.options).Rc)==null||c.call(b,a)}};
function em(a,b){b&&(Promise.all(a.o).then(function(){return void b.dispose()}),a.o=[])}
function fm(a,b){a.I=b;var c,d;(d=(c=a.options).wj)==null||d.call(c,b)}
function gm(a){a.J||(a.j.resolve(),a.j=new Il)}
function Xl(a,b,c,d,e,f){d=d===void 0?Nl():d;e=e===void 0?Promise.resolve(void 0):e;var g,h,k,l,m,p,r,t,w,y,x,H;C(function(F){switch(F.h){case 1:return F.yield(0,3);case 3:h=null;if(!g){F.v(6);break}fm(a,7);F.u(7);return F.yield(hm(g.snapshot({}),f.af,function(){return Promise.resolve("E:CTO")}),9);
case 9:h=F.i;F.B(6);break;case 7:F.j(),h="E:UCE";case 6:k=void 0,l=g?f.hf:f.jf,m=new oj(l,f.kf,f.lf,f.gf),p=1;case 10:if(!(p<=f.maxAttempts)){F.v(12);break}if(p===1){F.v(13);break}fm(a,0);a.h=new im(m.getValue(),f.gd,f.ze);return F.yield(a.h.promise,14);case 14:r=F.i,a.h=void 0,r===1?(p=1,m.reset()):pj(m);case 13:F.u(15);t=void 0;if(c){t=c;F.v(17);break}fm(a,5);w=d.h;return F.yield(hm(jm(b,w,h),f.tf,function(){return Promise.reject(Error("RGF:Fetch timed out"))}),18);
case 18:t=F.i;case 17:return fm(a,3),F.yield(hm(Ol(d,t),f.Mf,function(){return Promise.reject(Error("DTZ:Script timed out"))}),19);
case 19:return fm(a,8),F.yield(e,20);case 20:return y=new Kl({challenge:t,Pb:a.options.Pb,Ce:a.options.Ce}),F.yield(hm(y.Tb,f.xg,function(){return Promise.reject(Error("QEG:Setup timed out"))}),21);
case 21:k=y;F.v(12);break;case 15:x=F.j(),a.handleError(x),gm(a);case 11:p++;F.v(10);break;case 12:if(a.J){F.v(5);break}k&&(c=void 0,em(a,g),g=k,dm(a,k),gm(a));fm(a,2);a.h=new im(f.ne,f.gd,f.ze);a.isPaused&&a.h.pause();return F.yield(a.h.promise,22);case 22:a.h=void 0;if(a.J){F.v(5);break}F.v(3);break;case 5:(H=g)==null||H.dispose(),F.o()}})}
n.vc=function(){return this.logger.share()};
var Yl={ne:432E5,gd:3E5,ze:10,af:1E4,tf:3E4,Mf:3E4,xg:6E4,jf:1E3,hf:6E4,kf:6E5,lf:.25,gf:2,maxAttempts:10};function hm(a,b,c){var d,e=new Promise(function(f){d=setTimeout(f,b)});
return Promise.race([a.finally(function(){return void clearTimeout(d)}),
e.then(c)])}
function im(a,b,c){var d=this;this.endTimeMs=0;this.h=null;this.isPaused=!1;this.tick=function(){if(!d.isPaused){var e=d.endTimeMs-Date.now();e<=d.i?(d.h=null,d.Zc(0)):d.h=setTimeout(d.tick,Math.min(e,d.gd))}};
this.gd=b;this.i=c;this.promise=new Promise(function(e){d.Zc=e});
km(this,a)}
function km(a,b){a.endTimeMs=Date.now()+b;a.tick()}
im.prototype.pause=function(){this.isPaused||(this.isPaused=!0,$l(this))};
im.prototype.resume=function(){this.isPaused&&(this.isPaused=!1,this.tick())};
function bm(a){$l(a);a.endTimeMs=0;a.isPaused=!1;a.Zc(1)}
function $l(a){a.h&&(clearTimeout(a.h),a.h=null)}
im.prototype.isExpired=function(){return Date.now()>this.endTimeMs};function lm(a,b){try{return globalThis.sessionStorage.setItem(a,b),!0}catch(c){return!1}}
var mm,nm=(mm=Math.imul)!=null?mm:function(a,b){return a*b|0};
function om(a,b,c,d){b=b===void 0?0:b;c=c===void 0?a.length:c;var e=0;for(d&&(e=om(d));b<c;b++)d=typeof a==="string"?a.charCodeAt(b):a[b],e=nm(31,e)+d|0;return e}
function pm(a,b){return[om(a,0,a.length>>1,b),om(a,a.length>>1)]}
var qm=[196,200,224,18];function rm(a){var b=z(pm(a,qm));a=b.next().value;b=b.next().value;return a.toString(16)+b.toString(16)}
function sm(a,b){var c=pm(b);a=new Uint32Array(a.buffer);b=a[0];var d=z(c);c=d.next().value;d=d.next().value;for(var e=1;e<a.length;e+=2){for(var f=b,g=e,h=c,k=d,l=0;l<22;l++)g=g>>>8|g<<24,g+=f|0,g^=h+38293,f=f<<3|f>>>29,f^=g,k=k>>>8|k<<24,k+=h|0,k^=l+38293,h=h<<3|h>>>29,h^=k;f=[f,g];a[e]^=f[0];e+1<a.length&&(a[e+1]^=f[1])}}
function tm(a,b,c,d,e){var f=(4-(qm.length+c.length)%4)%4,g=new Uint8Array(4+f+qm.length+4+c.length),h=new DataView(g.buffer),k=0;h.setUint32(k,Math.random()*4294967295);k=k+4+f;g.set(qm,k);k+=qm.length;h.setUint32(k,e);g.set(c,k+4);sm(g,d);return a.qa(b,function(l){return void globalThis.sessionStorage.removeItem(l)})?lm(b,Bd(g))?"s":"t":"i"}
function um(a,b){var c=globalThis.sessionStorage.getItem(a);if(!c)return["m"];try{var d=Dd(c);sm(d,b)}catch(e){return globalThis.sessionStorage.removeItem(a),["c"]}for(b=4;b<7&&d[b]===0;)b++;for(c=0;c<qm.length;c++)if(d[b++]!==qm[c])return globalThis.sessionStorage.removeItem(a),["d"];c=(new DataView(d.buffer)).getUint32(b);return Math.floor(Date.now()/1E3)>=c?(globalThis.sessionStorage.removeItem(a),["e"]):["a",new Uint8Array(d.buffer,b+4)]}
function wm(a,b,c){c=c===void 0?[]:c;this.maxItems=a;this.h=b===void 0?0:b;this.i=c}
function xm(a){var b=globalThis.sessionStorage.getItem("iU5q-!O9@$");if(!b)return new wm(a);var c=b.split(",");if(c.length<2)return globalThis.sessionStorage.removeItem("iU5q-!O9@$"),new wm(a);b=c.slice(1);b.length===1&&b[0]===""&&(b=[]);c=Number(c[0]);return isNaN(c)||c<0||c>b.length?(globalThis.sessionStorage.removeItem("iU5q-!O9@$"),new wm(a)):new wm(a,c,b)}
wm.prototype.serialize=function(){return String(this.h)+","+this.i.join()};
wm.prototype.qa=function(a,b){var c=void 0;if(this.i[this.h]!==a){var d=this.i.indexOf(a);d!==-1?(this.i.splice(d,1),d<this.h&&this.h--,this.i.splice(this.h,0,a)):(c=this.i[this.h],this.i[this.h]=a)}this.h=(this.h+1)%this.maxItems;a=lm("iU5q-!O9@$",this.serialize());c&&a&&b(c);return a};
function Dc(a,b){this.logger=b;try{var c=globalThis.sessionStorage&&!!globalThis.sessionStorage.getItem&&!!globalThis.sessionStorage.setItem&&!!globalThis.sessionStorage.removeItem}catch(d){c=!1}c&&(this.index=xm(a))}
function ym(a,b,c,d,e){var f=a.index?ul(a.logger,function(){return tm(a.index,rm(b),c,d,e)},"W"):"u";
a.logger.Nc(f)}
function zm(a,b,c){var d=z(a.index?ul(a.logger,function(){return um(rm(b),c)},"R"):["u"]),e=d.next().value;
d=d.next().value;a.logger.Mc(e);return d}
;var Am={toString:function(a){var b=[],c=0;a-=-2147483648;b[c++]="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(a%52);for(a=Math.floor(a/52);a>0;)b[c++]="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".charAt(a%62),a=Math.floor(a/62);return b.join("")}};function Bm(a){function b(){c-=d;c-=e;c^=e>>>13;d-=e;d-=c;d^=c<<8;e-=c;e-=d;e^=d>>>13;c-=d;c-=e;c^=e>>>12;d-=e;d-=c;d^=c<<16;e-=c;e-=d;e^=d>>>5;c-=d;c-=e;c^=e>>>3;d-=e;d-=c;d^=c<<10;e-=c;e-=d;e^=d>>>15}
a=Cm(a);for(var c=2654435769,d=2654435769,e=314159265,f=a.length,g=f,h=0;g>=12;g-=12,h+=12)c+=Dm(a,h),d+=Dm(a,h+4),e+=Dm(a,h+8),b();e+=f;switch(g){case 11:e+=a[h+10]<<24;case 10:e+=a[h+9]<<16;case 9:e+=a[h+8]<<8;case 8:d+=a[h+7]<<24;case 7:d+=a[h+6]<<16;case 6:d+=a[h+5]<<8;case 5:d+=a[h+4];case 4:c+=a[h+3]<<24;case 3:c+=a[h+2]<<16;case 2:c+=a[h+1]<<8;case 1:c+=a[h+0]}b();return Am.toString(e)}
function Cm(a){for(var b=[],c=0;c<a.length;c++)b.push(a.charCodeAt(c));return b}
function Dm(a,b){return a[b+0]+(a[b+1]<<8)+(a[b+2]<<16)+(a[b+3]<<24)}
;function Em(a){K.call(this);this.logger=a;this.j=new Il}
v(Em,K);function Fm(a,b){var c=setTimeout(function(){a.j.resolve()},b);
a.addOnDisposeCallback(function(){return void clearTimeout(c)})}
Em.prototype.Qc=function(a,b){var c=this.jb(a);b==null||b(c);return ul(this.logger,function(){return Bd(c,2)},this.i)};
function Gm(a,b,c,d){return ul(a.logger,function(){return c?a.Qc(b,d):a.jb(b,d)},a.h)}
function Hm(a,b,c,d){Em.call(this,a);this.o=b;this.B=c;this.h="m";this.i="x";this.u=0;Fm(this,d)}
v(Hm,Em);Hm.prototype.jb=function(a,b){var c=this;this.logger.Oa(this.h);++this.u>=this.B&&this.j.resolve();var d=a();a=ul(this.logger,function(){return c.o(d)},"C");
if(a===void 0)throw new J(17,"YNJ:Undefined");if(!(a instanceof Uint8Array))throw new J(18,"ODM:Invalid");b==null||b(a);return a};
function Im(a,b,c){Em.call(this,a);this.o=b;this.h="f";this.i="z";Fm(this,c)}
v(Im,Em);Im.prototype.jb=function(){return this.o};
function Jm(a,b,c){Em.call(this,a);this.o=b;this.h="w";this.i="z";Fm(this,c)}
v(Jm,Em);Jm.prototype.jb=function(){var a=this;return ul(this.logger,function(){return Dd(a.o)},"d")};
Jm.prototype.Qc=function(){return this.o};
function Km(a,b){Em.call(this,a);this.error=b;this.h="e";this.i="y"}
v(Km,Em);function Lm(a,b){var c=(b(a.error.message)+":"+b(a.error.stack)).substring(0,2048);b=c.length+1;c=Mm(c);var d=new Uint8Array(4+c.length);d.set([42,b&127|128,b>>7,a.error.code]);d.set(c,4);return d}
Km.prototype.jb=function(){if(this.o)return this.o;this.o=Lm(this,function(a){return"_"+Bm(a)});
return Lm(this,function(a){return a})};
function Nm(a,b,c){Em.call(this,a);this.o=b;this.clientState=c;this.h="S";this.i="q"}
v(Nm,Em);Nm.prototype.jb=function(){var a=Math.floor(Date.now()/1E3),b=[Math.random()*255,Math.random()*255],c=b.concat([this.o&255,this.clientState],[a>>24&255,a>>16&255,a>>8&255,a&255]);a=new Uint8Array(2+c.length);a[0]=34;a[1]=c.length;a.set(c,2);c=a.subarray(2);for(var d=b=b.length;d<c.length;++d)c[d]^=c[d%b];this.logger.Oc(this.clientState);return a};
function Mm(a){return globalThis.TextEncoder?(new TextEncoder).encode(a):bd(a)}
;var Om={uf:3E4,Ag:2E4};function Pm(a){K.call(this);var b=this;this.Sb=new Il;this.j=0;this.i=void 0;this.state=2;this.vm=a.vm;this.Ta=a.Ta;this.Wb=Object.assign({},Om,a.Wb||{});this.logger=a.vm.vc();var c;this.onError=(c=a.onError)!=null?c:function(){};
this.Ld=a.Ld||!1;if(Qm(a)){var d=this.vm;this.o=function(){return am(d).catch(function(g){g=Ec(b,new J(b.h?20:32,"TRG:Disposed",g));b.i=g;var h;(h=b.h)==null||h.dispose();b.h=void 0;b.Sb.reject(g)})};
cm(d,function(){return void Rm(b)});
d.I===2&&Rm(this)}else this.o=a.vj,Rm(this);var e=this.logger.share();e.Oa("o");var f=new rl(e,"o");this.Sb.promise.then(function(){f.done();e.Za();e.dispose()},function(){return void e.dispose()});
this.addOnDisposeCallback(function(){b.h?(b.h.dispose(),b.h=void 0):b.i?b.logger.Za():(b.i=Ec(b,new J(32,"TNP:Disposed")),b.logger.Za(),b.Sb.reject(b.i))});
wc(this,this.logger)}
v(Pm,K);function Sm(a,b){if(!(b instanceof J))if(b instanceof al){var c=Error(b.toString());c.stack=b.stack;b=new J(11,"EBH:Error",c)}else b=new J(12,"BSO:Unknown",b);return Ec(a,b)}
function Rm(a){var b,c,d,e,f,g,h,k,l,m,p,r,t,w,y;return C(function(x){switch(x.h){case 1:b=void 0;a.j++;c=new Il;a.vm instanceof Wl&&a.vm.o.push(c.promise);if(!a.Ld){x.v(2);break}d=new Il;setTimeout(function(){return void d.resolve()});
return x.yield(d.promise,2);case 2:return e=a.logger.share(),x.u(4,5),a.state=5,f={},g=[],x.yield(hm(a.vm.snapshot({Ma:f,Ge:g}),a.Wb.Ag,function(){return Promise.reject(new J(15,"MDA:Timeout"))}),7);
case 7:h=x.i;if(a.J)throw new J(a.h?20:32,"MDA:Disposed");k=g[0];a.state=6;return x.yield(hm(Tm(a.Ta,h),a.Wb.uf,function(){return Promise.reject(new J(10,"BWB:Timeout"))}),8);
case 8:l=x.i;if(a.J)throw new J(a.h?20:32,"BWB:Disposed");a.state=7;b=ul(e,function(){var F=Um(a,l,c,k);F.j.promise.then(function(){return void a.o()});
return F},"i");
case 5:x.Z();e.dispose();x.fa(6);break;case 4:m=x.j();(p=b)==null||p.dispose();if(!a.i){r=Sm(a,m);c.resolve();var H;if(H=a.vm instanceof Wl&&a.j<2)a:if(m instanceof J)H=m.code!==32&&m.code!==20&&m.code!==10;else{if(m instanceof al)switch(m.code){case 2:case 13:case 14:case 4:break;default:H=!1;break a}H=!0}if(H)return t=(1+Math.random()*.25)*(a.h?6E4:1E3),w=setTimeout(function(){return void a.o()},t),a.addOnDisposeCallback(function(){return void clearTimeout(w)}),x.return();
a.i=r}e.Aa(a.h?13:14);a.Sb.reject(a.i);return x.return();case 6:a.state=8,a.j=0,(y=a.h)==null||y.dispose(),a.h=b,a.Sb.resolve(),x.o()}})}
function Um(a,b,c,d){var e=qg(b,2)*1E3;if(e<=0)throw new J(31,"TTM:Invalid");if(sg(b,4))return new Jm(a.logger,sg(b,4),e);if(!qg(b,3))return new Im(a.logger,Qd(eg(b)),e);if(!d)throw new J(4,"PMD:Undefined");d=d(Qd(eg(b)));if(typeof d!=="function")throw new J(16,"APF:Failed");a.u=Math.floor((Date.now()+e)/1E3);a=new Hm(a.logger,d,qg(b,3),e);a.addOnDisposeCallback(function(){return void c.resolve()});
return a}
Pm.prototype.jb=function(a){return Vm(this,Object.assign({},a),!1)};
Pm.prototype.Qc=function(a){return Vm(this,Object.assign({},a),!0)};
function Ec(a,b){a.logger.Aa(b.code);a.onError(b);return b}
function Wm(a,b){b=b instanceof J?b:new J(5,"TVD:error",b);return Ec(a,b)}
function Vm(a,b,c){try{if(a.J)throw new J(21,"BNT:disposed");if(!a.h&&a.i)throw a.i;var d,e;return(e=(d=Xm(a,b,c))!=null?d:Ym(a,b,c))!=null?e:Zm(a,b,c)}catch(f){if(!b.Uf)throw Wm(a,f);return $m(a,c,f)}}
function Xm(a,b,c){var d;return(d=a.h)==null?void 0:Gm(d,function(){return an(a,b)},c,function(e){var f;
if(a.h instanceof Hm&&((f=b.Bc)==null?0:f.Bg))try{var g;(g=a.cache)==null||ym(g,an(a,b),e,b.Bc.Qd,a.u-120)}catch(h){Ec(a,new J(24,"ELX:write",h))}})}
function Ym(a,b,c){var d;if((d=b.Bc)!=null&&d.Re)try{var e,f=(e=a.cache)==null?void 0:zm(e,an(a,b),b.Bc.Qd);return f?c?ul(a.logger,function(){return Bd(f,2)},"a"):f:void 0}catch(g){Ec(a,new J(23,"RXO:read",g))}}
function Zm(a,b,c){var d={stack:[],error:void 0,pb:!1};try{if(!b.Tf)throw new J(29,"SDF:notready");return Gm(bb(d,new Nm(a.logger,0,a.state)),function(){return an(a,b)},c)}catch(e){d.error=e,d.pb=!0}finally{cb(d)}}
function $m(a,b,c){var d={stack:[],error:void 0,pb:!1};try{var e=Wm(a,c);return Gm(bb(d,new Km(a.logger,e)),function(){return[]},b)}catch(f){d.error=f,d.pb=!0}finally{cb(d)}}
function an(a,b){return b.nd?b.nd:b.Ma?ul(a.logger,function(){return b.nd=Mm(b.Ma)},"c"):[]}
var Qm=function(a){return ue(function(b){if(!Be(b))return!1;for(var c=z(Object.entries(a)),d=c.next();!d.done;d=c.next()){var e=z(d.value);d=e.next().value;e=e.next().value;if(!(d in b)){if(e.lj===!0)continue;return!1}if(!e(b[d]))return!1}return!0})}({vm:function(a){return ue(function(b){return b instanceof a})}(Wl)},"");function bn(){if(!cn){cn=new Vk(new dn);var a=en("client_streamz_web_flush_count",-1);a!==-1&&(cn.j=a)}this.h=a=cn;a.Cb("/client_streamz/youtube/aba/gac",Nc("type"),Nc("sequence"))}
bn.prototype.la=function(a,b){this.h.zb("/client_streamz/youtube/aba/gac",a,b)};var fn=window;function gn(a){var b=hn;if(b)for(var c in b)Object.prototype.hasOwnProperty.call(b,c)&&a(b[c],c,b)}
function jn(){var a=[];gn(function(b){a.push(b)});
return a}
;var hn={Mg:"allow-forms",Ng:"allow-modals",Og:"allow-orientation-lock",Pg:"allow-pointer-lock",Qg:"allow-popups",Rg:"allow-popups-to-escape-sandbox",Sg:"allow-presentation",Tg:"allow-same-origin",Ug:"allow-scripts",Vg:"allow-top-navigation",Wg:"allow-top-navigation-by-user-activation"},kn=Bk(function(){return jn()});
function ln(){var a=mn(),b={};Pb(kn(),function(c){a.sandbox&&a.sandbox.supports&&a.sandbox.supports(c)&&(b[c]=!0)});
return b}
function mn(){var a=a===void 0?document:a;return a.createElement("iframe")}
;function nn(a){typeof a=="number"&&(a=Math.round(a)+"px");return a}
;var on=(new Date).getTime();function pn(a){this.D=N(a)}
v(pn,O);var qn=Lh(pn);function rn(a){lk.call(this);var b=this;this.B=this.j=0;this.Ia=a!=null?a:{wa:function(e,f){return setTimeout(e,f)},
xa:function(e){clearTimeout(e)}};
var c,d;this.h=(d=(c=window.navigator)==null?void 0:c.onLine)!=null?d:!0;this.o=function(){return C(function(e){return e.yield(sn(b),0)})};
window.addEventListener("offline",this.o);window.addEventListener("online",this.o);this.B||tn(this)}
v(rn,lk);function un(){var a=vn;rn.instance||(rn.instance=new rn(a));return rn.instance}
rn.prototype.dispose=function(){window.removeEventListener("offline",this.o);window.removeEventListener("online",this.o);this.Ia.xa(this.B);delete rn.instance};
rn.prototype.za=function(){return this.h};
function tn(a){a.B=a.Ia.wa(function(){var b;return C(function(c){if(c.h==1)return a.h?((b=window.navigator)==null?0:b.onLine)?c.v(3):c.yield(sn(a),3):c.yield(sn(a),3);tn(a);c.o()})},3E4)}
function sn(a,b){return a.u?a.u:a.u=new Promise(function(c){var d,e,f,g;return C(function(h){switch(h.h){case 1:return d=window.AbortController?new window.AbortController:void 0,f=(e=d)==null?void 0:e.signal,g=!1,h.u(2,3),d&&(a.j=a.Ia.wa(function(){d.abort()},b||2E4)),h.yield(fetch("/generate_204",{method:"HEAD",
signal:f}),5);case 5:g=!0;case 3:h.Z();a.u=void 0;a.j&&(a.Ia.xa(a.j),a.j=0);g!==a.h&&(a.h=g,a.h?mk(a,"networkstatus-online"):mk(a,"networkstatus-offline"));c(g);h.fa(0);break;case 2:h.j(),g=!1,h.v(3)}})})}
;function wn(){this.data=[];this.h=-1}
wn.prototype.set=function(a,b){b=b===void 0?!0:b;0<=a&&a<52&&Number.isInteger(a)&&this.data[a]!==b&&(this.data[a]=b,this.h=-1)};
wn.prototype.get=function(a){return!!this.data[a]};
function xn(a){a.h===-1&&(a.h=a.data.reduce(function(b,c,d){return b+(c?Math.pow(2,d):0)},0));
return a.h}
;function yn(){this.blockSize=-1}
;function zn(){this.blockSize=-1;this.blockSize=64;this.h=[];this.u=[];this.H=[];this.j=[];this.j[0]=128;for(var a=1;a<this.blockSize;++a)this.j[a]=0;this.o=this.i=0;this.reset()}
v(zn,yn);zn.prototype.reset=function(){this.h[0]=1732584193;this.h[1]=4023233417;this.h[2]=2562383102;this.h[3]=271733878;this.h[4]=3285377520;this.o=this.i=0};
function An(a,b,c){c||(c=0);var d=a.H;if(typeof b==="string")for(var e=0;e<16;e++)d[e]=b.charCodeAt(c)<<24|b.charCodeAt(c+1)<<16|b.charCodeAt(c+2)<<8|b.charCodeAt(c+3),c+=4;else for(e=0;e<16;e++)d[e]=b[c]<<24|b[c+1]<<16|b[c+2]<<8|b[c+3],c+=4;for(b=16;b<80;b++)c=d[b-3]^d[b-8]^d[b-14]^d[b-16],d[b]=(c<<1|c>>>31)&4294967295;b=a.h[0];c=a.h[1];e=a.h[2];for(var f=a.h[3],g=a.h[4],h,k,l=0;l<80;l++)l<40?l<20?(h=f^c&(e^f),k=1518500249):(h=c^e^f,k=1859775393):l<60?(h=c&e|f&(c|e),k=2400959708):(h=c^e^f,k=3395469782),
h=(b<<5|b>>>27)+h+g+k+d[l]&4294967295,g=f,f=e,e=(c<<30|c>>>2)&4294967295,c=b,b=h;a.h[0]=a.h[0]+b&4294967295;a.h[1]=a.h[1]+c&4294967295;a.h[2]=a.h[2]+e&4294967295;a.h[3]=a.h[3]+f&4294967295;a.h[4]=a.h[4]+g&4294967295}
zn.prototype.update=function(a,b){if(a!=null){b===void 0&&(b=a.length);for(var c=b-this.blockSize,d=0,e=this.u,f=this.i;d<b;){if(f==0)for(;d<=c;)An(this,a,d),d+=this.blockSize;if(typeof a==="string")for(;d<b;){if(e[f]=a.charCodeAt(d),++f,++d,f==this.blockSize){An(this,e);f=0;break}}else for(;d<b;)if(e[f]=a[d],++f,++d,f==this.blockSize){An(this,e);f=0;break}}this.i=f;this.o+=b}};
zn.prototype.digest=function(){var a=[],b=this.o*8;this.i<56?this.update(this.j,56-this.i):this.update(this.j,this.blockSize-(this.i-56));for(var c=this.blockSize-1;c>=56;c--)this.u[c]=b&255,b/=256;An(this,this.u);for(c=b=0;c<5;c++)for(var d=24;d>=0;d-=8)a[b]=this.h[c]>>d&255,++b;return a};function Bn(a){return typeof a.className=="string"?a.className:a.getAttribute&&a.getAttribute("class")||""}
function Cn(a,b){typeof a.className=="string"?a.className=b:a.setAttribute&&a.setAttribute("class",b)}
function Dn(a,b){a.classList?b=a.classList.contains(b):(a=a.classList?a.classList:Bn(a).match(/\S+/g)||[],b=Ob(a,b)>=0);return b}
function En(){var a=document.body;a.classList?a.classList.remove("inverted-hdpi"):Dn(a,"inverted-hdpi")&&Cn(a,Array.prototype.filter.call(a.classList?a.classList:Bn(a).match(/\S+/g)||[],function(b){return b!="inverted-hdpi"}).join(" "))}
;function Fn(){}
Fn.prototype.next=function(){return Gn};
var Gn={done:!0,value:void 0};Fn.prototype.Bb=function(){return this};function Hn(a){if(a instanceof In||a instanceof Jn||a instanceof Kn)return a;if(typeof a.next=="function")return new In(function(){return a});
if(typeof a[Symbol.iterator]=="function")return new In(function(){return a[Symbol.iterator]()});
if(typeof a.Bb=="function")return new In(function(){return a.Bb()});
throw Error("Not an iterator or iterable.");}
function In(a){this.h=a}
In.prototype.Bb=function(){return new Jn(this.h())};
In.prototype[Symbol.iterator]=function(){return new Kn(this.h())};
In.prototype.i=function(){return new Kn(this.h())};
function Jn(a){this.h=a}
v(Jn,Fn);Jn.prototype.next=function(){return this.h.next()};
Jn.prototype[Symbol.iterator]=function(){return new Kn(this.h)};
Jn.prototype.i=function(){return new Kn(this.h)};
function Kn(a){In.call(this,function(){return a});
this.j=a}
v(Kn,In);Kn.prototype.next=function(){return this.j.next()};function Ln(a){K.call(this);this.u=1;this.j=[];this.o=0;this.h=[];this.i={};this.B=!!a}
Xa(Ln,K);n=Ln.prototype;n.subscribe=function(a,b,c){var d=this.i[a];d||(d=this.i[a]=[]);var e=this.u;this.h[e]=a;this.h[e+1]=b;this.h[e+2]=c;this.u=e+3;d.push(e);return e};
n.unsubscribe=function(a,b,c){if(a=this.i[a]){var d=this.h;if(a=a.find(function(e){return d[e+1]==b&&d[e+2]==c}))return this.yc(a)}return!1};
n.yc=function(a){var b=this.h[a];if(b){var c=this.i[b];this.o!=0?(this.j.push(a),this.h[a+1]=function(){}):(c&&Ub(c,a),delete this.h[a],delete this.h[a+1],delete this.h[a+2])}return!!b};
n.Ab=function(a,b){var c=this.i[a];if(c){var d=Array(arguments.length-1),e=arguments.length,f;for(f=1;f<e;f++)d[f-1]=arguments[f];if(this.B)for(f=0;f<c.length;f++)e=c[f],Mn(this.h[e+1],this.h[e+2],d);else{this.o++;try{for(f=0,e=c.length;f<e&&!this.J;f++){var g=c[f];this.h[g+1].apply(this.h[g+2],d)}}finally{if(this.o--,this.j.length>0&&this.o==0)for(;c=this.j.pop();)this.yc(c)}}return f!=0}return!1};
function Mn(a,b,c){xk(function(){a.apply(b,c)})}
n.clear=function(a){if(a){var b=this.i[a];b&&(b.forEach(this.yc,this),delete this.i[a])}else this.h.length=0,this.i={}};
n.ba=function(){Ln.Ga.ba.call(this);this.clear();this.j.length=0};function Nn(a){this.h=a}
Nn.prototype.set=function(a,b){b===void 0?this.h.remove(a):this.h.set(a,(new bl).serialize(b))};
Nn.prototype.get=function(a){try{var b=this.h.get(a)}catch(c){return}if(b!==null)try{return JSON.parse(b)}catch(c){throw"Storage: Invalid value was encountered";}};
Nn.prototype.remove=function(a){this.h.remove(a)};function On(a){this.h=a}
Xa(On,Nn);function Pn(a){this.data=a}
function Qn(a){return a===void 0||a instanceof Pn?a:new Pn(a)}
On.prototype.set=function(a,b){On.Ga.set.call(this,a,Qn(b))};
On.prototype.i=function(a){a=On.Ga.get.call(this,a);if(a===void 0||a instanceof Object)return a;throw"Storage: Invalid value was encountered";};
On.prototype.get=function(a){if(a=this.i(a)){if(a=a.data,a===void 0)throw"Storage: Invalid value was encountered";}else a=void 0;return a};function Rn(a){this.h=a}
Xa(Rn,On);Rn.prototype.set=function(a,b,c){if(b=Qn(b)){if(c){if(c<Va()){Rn.prototype.remove.call(this,a);return}b.expiration=c}b.creation=Va()}Rn.Ga.set.call(this,a,b)};
Rn.prototype.i=function(a){var b=Rn.Ga.i.call(this,a);if(b){var c=b.creation,d=b.expiration;if(d&&d<Va()||c&&c>Va())Rn.prototype.remove.call(this,a);else return b}};function Sn(){}
;function Tn(){}
Xa(Tn,Sn);Tn.prototype[Symbol.iterator]=function(){return Hn(this.Bb(!0)).i()};
Tn.prototype.clear=function(){var a=Array.from(this);a=z(a);for(var b=a.next();!b.done;b=a.next())this.remove(b.value)};function Un(a){this.h=a;this.i=null}
Xa(Un,Tn);n=Un.prototype;n.isAvailable=function(){if(this.i===null){var a=this.h;if(a)try{a.setItem("__sak","1");a.removeItem("__sak");var b=!0}catch(c){b=c instanceof DOMException&&(c.name==="QuotaExceededError"||c.code===22||c.code===1014||c.name==="NS_ERROR_DOM_QUOTA_REACHED")&&a&&a.length!==0}else b=!1;this.i=b}return this.i};
n.set=function(a,b){Vn(this);try{this.h.setItem(a,b)}catch(c){if(this.h.length==0)throw"Storage mechanism: Storage disabled";throw"Storage mechanism: Quota exceeded";}};
n.get=function(a){Vn(this);a=this.h.getItem(a);if(typeof a!=="string"&&a!==null)throw"Storage mechanism: Invalid value was encountered";return a};
n.remove=function(a){Vn(this);this.h.removeItem(a)};
n.Bb=function(a){Vn(this);var b=0,c=this.h,d=new Fn;d.next=function(){if(b>=c.length)return Gn;var e=c.key(b++);if(a)return{value:e,done:!1};e=c.getItem(e);if(typeof e!=="string")throw"Storage mechanism: Invalid value was encountered";return{value:e,done:!1}};
return d};
n.clear=function(){Vn(this);this.h.clear()};
n.key=function(a){Vn(this);return this.h.key(a)};
function Vn(a){if(a.h==null)throw Error("Storage mechanism: Storage unavailable");a.isAvailable()||ad(Error("Storage mechanism: Storage unavailable"))}
;function Wn(){var a=null;try{a=E.localStorage||null}catch(b){}Un.call(this,a)}
Xa(Wn,Un);function Xn(a,b){this.i=a;this.h=b+"::"}
Xa(Xn,Tn);Xn.prototype.set=function(a,b){this.i.set(this.h+a,b)};
Xn.prototype.get=function(a){return this.i.get(this.h+a)};
Xn.prototype.remove=function(a){this.i.remove(this.h+a)};
Xn.prototype.Bb=function(a){var b=this.i[Symbol.iterator](),c=this,d=new Fn;d.next=function(){var e=b.next();if(e.done)return e;for(e=e.value;e.slice(0,c.h.length)!=c.h;){e=b.next();if(e.done)return e;e=e.value}return{value:a?e.slice(c.h.length):c.i.get(e),done:!1}};
return d};function Yn(a){if(a.fb&&typeof a.fb=="function")return a.fb();if(typeof Map!=="undefined"&&a instanceof Map||typeof Set!=="undefined"&&a instanceof Set)return Array.from(a.values());if(typeof a==="string")return a.split("");if(Ka(a)){for(var b=[],c=a.length,d=0;d<c;d++)b.push(a[d]);return b}return Bi(a)}
function Zn(a){if(a.hc&&typeof a.hc=="function")return a.hc();if(!a.fb||typeof a.fb!="function"){if(typeof Map!=="undefined"&&a instanceof Map)return Array.from(a.keys());if(!(typeof Set!=="undefined"&&a instanceof Set)){if(Ka(a)||typeof a==="string"){var b=[];a=a.length;for(var c=0;c<a;c++)b.push(c);return b}b=[];c=0;for(var d in a)b[c++]=d;return b}}}
function $n(a,b,c){if(a.forEach&&typeof a.forEach=="function")a.forEach(b,c);else if(Ka(a)||typeof a==="string")Array.prototype.forEach.call(a,b,c);else for(var d=Zn(a),e=Yn(a),f=e.length,g=0;g<f;g++)b.call(c,e[g],d&&d[g],a)}
;function ao(a){this.i=this.B=this.j="";this.G=null;this.u=this.h="";this.o=!1;var b;a instanceof ao?(this.o=a.o,bo(this,a.j),this.B=a.B,this.i=a.i,co(this,a.G),this.h=a.h,eo(this,a.H.clone()),this.u=a.u):a&&(b=String(a).match(ec))?(this.o=!1,bo(this,b[1]||"",!0),this.B=fo(b[2]||""),this.i=fo(b[3]||"",!0),co(this,b[4]),this.h=fo(b[5]||"",!0),eo(this,b[6]||"",!0),this.u=fo(b[7]||"")):(this.o=!1,this.H=new go(null,this.o))}
ao.prototype.toString=function(){var a=[],b=this.j;b&&a.push(ho(b,io,!0),":");var c=this.i;if(c||b=="file")a.push("//"),(b=this.B)&&a.push(ho(b,io,!0),"@"),a.push(encodeURIComponent(String(c)).replace(/%25([0-9a-fA-F]{2})/g,"%$1")),c=this.G,c!=null&&a.push(":",String(c));if(c=this.h)this.i&&c.charAt(0)!="/"&&a.push("/"),a.push(ho(c,c.charAt(0)=="/"?jo:ko,!0));(c=this.H.toString())&&a.push("?",c);(c=this.u)&&a.push("#",ho(c,lo));return a.join("")};
ao.prototype.resolve=function(a){var b=this.clone(),c=!!a.j;c?bo(b,a.j):c=!!a.B;c?b.B=a.B:c=!!a.i;c?b.i=a.i:c=a.G!=null;var d=a.h;if(c)co(b,a.G);else if(c=!!a.h){if(d.charAt(0)!="/")if(this.i&&!this.h)d="/"+d;else{var e=b.h.lastIndexOf("/");e!=-1&&(d=b.h.slice(0,e+1)+d)}e=d;if(e==".."||e==".")d="";else if(e.indexOf("./")!=-1||e.indexOf("/.")!=-1){d=e.lastIndexOf("/",0)==0;e=e.split("/");for(var f=[],g=0;g<e.length;){var h=e[g++];h=="."?d&&g==e.length&&f.push(""):h==".."?((f.length>1||f.length==1&&
f[0]!="")&&f.pop(),d&&g==e.length&&f.push("")):(f.push(h),d=!0)}d=f.join("/")}else d=e}c?b.h=d:c=a.H.toString()!=="";c?eo(b,a.H.clone()):c=!!a.u;c&&(b.u=a.u);return b};
ao.prototype.clone=function(){return new ao(this)};
function bo(a,b,c){a.j=c?fo(b,!0):b;a.j&&(a.j=a.j.replace(/:$/,""))}
function co(a,b){if(b){b=Number(b);if(isNaN(b)||b<0)throw Error("Bad port number "+b);a.G=b}else a.G=null}
function eo(a,b,c){b instanceof go?(a.H=b,mo(a.H,a.o)):(c||(b=ho(b,no)),a.H=new go(b,a.o))}
function fo(a,b){return a?b?decodeURI(a.replace(/%25/g,"%2525")):decodeURIComponent(a):""}
function ho(a,b,c){return typeof a==="string"?(a=encodeURI(a).replace(b,oo),c&&(a=a.replace(/%25([0-9a-fA-F]{2})/g,"%$1")),a):null}
function oo(a){a=a.charCodeAt(0);return"%"+(a>>4&15).toString(16)+(a&15).toString(16)}
var io=/[#\/\?@]/g,ko=/[#\?:]/g,jo=/[#\?]/g,no=/[#\?@]/g,lo=/#/g;function go(a,b){this.i=this.h=null;this.j=a||null;this.o=!!b}
function po(a){a.h||(a.h=new Map,a.i=0,a.j&&lc(a.j,function(b,c){a.add(cc(b),c)}))}
n=go.prototype;n.add=function(a,b){po(this);this.j=null;a=qo(this,a);var c=this.h.get(a);c||this.h.set(a,c=[]);c.push(b);this.i=this.i+1;return this};
n.remove=function(a){po(this);a=qo(this,a);return this.h.has(a)?(this.j=null,this.i=this.i-this.h.get(a).length,this.h.delete(a)):!1};
n.clear=function(){this.h=this.j=null;this.i=0};
function ro(a,b){po(a);b=qo(a,b);return a.h.has(b)}
n.forEach=function(a,b){po(this);this.h.forEach(function(c,d){c.forEach(function(e){a.call(b,e,d,this)},this)},this)};
n.hc=function(){po(this);for(var a=Array.from(this.h.values()),b=Array.from(this.h.keys()),c=[],d=0;d<b.length;d++)for(var e=a[d],f=0;f<e.length;f++)c.push(b[d]);return c};
n.fb=function(a){po(this);var b=[];if(typeof a==="string")ro(this,a)&&(b=b.concat(this.h.get(qo(this,a))));else{a=Array.from(this.h.values());for(var c=0;c<a.length;c++)b=b.concat(a[c])}return b};
n.set=function(a,b){po(this);this.j=null;a=qo(this,a);ro(this,a)&&(this.i=this.i-this.h.get(a).length);this.h.set(a,[b]);this.i=this.i+1;return this};
n.get=function(a,b){if(!a)return b;a=this.fb(a);return a.length>0?String(a[0]):b};
n.toString=function(){if(this.j)return this.j;if(!this.h)return"";for(var a=[],b=Array.from(this.h.keys()),c=0;c<b.length;c++){var d=b[c],e=encodeURIComponent(String(d));d=this.fb(d);for(var f=0;f<d.length;f++){var g=e;d[f]!==""&&(g+="="+encodeURIComponent(String(d[f])));a.push(g)}}return this.j=a.join("&")};
n.clone=function(){var a=new go;a.j=this.j;this.h&&(a.h=new Map(this.h),a.i=this.i);return a};
function qo(a,b){b=String(b);a.o&&(b=b.toLowerCase());return b}
function mo(a,b){b&&!a.o&&(po(a),a.j=null,a.h.forEach(function(c,d){var e=d.toLowerCase();d!=e&&(this.remove(d),this.remove(e),c.length>0&&(this.j=null,this.h.set(qo(this,e),Vb(c)),this.i=this.i+c.length))},a));
a.o=b}
n.extend=function(a){for(var b=0;b<arguments.length;b++)$n(arguments[b],function(c,d){this.add(d,c)},this)};/*

 (The MIT License)

 Copyright (C) 2014 by Vitaly Puzrin

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.

 -----------------------------------------------------------------------------
 Ported from zlib, which is under the following license
 https://github.com/madler/zlib/blob/master/zlib.h

 zlib.h -- interface of the 'zlib' general purpose compression library
   version 1.2.8, April 28th, 2013
   Copyright (C) 1995-2013 Jean-loup Gailly and Mark Adler
   This software is provided 'as-is', without any express or implied
   warranty.  In no event will the authors be held liable for any damages
   arising from the use of this software.
   Permission is granted to anyone to use this software for any purpose,
   including commercial applications, and to alter it and redistribute it
   freely, subject to the following restrictions:
   1. The origin of this software must not be misrepresented; you must not
      claim that you wrote the original software. If you use this software
      in a product, an acknowledgment in the product documentation would be
      appreciated but is not required.
   2. Altered source versions must be plainly marked as such, and must not be
      misrepresented as being the original software.
   3. This notice may not be removed or altered from any source distribution.
   Jean-loup Gailly        Mark Adler
   jloup@gzip.org          madler@alumni.caltech.edu
   The data format used by the zlib library is described by RFCs (Request for
   Comments) 1950 to 1952 in the files http://tools.ietf.org/html/rfc1950
   (zlib format), rfc1951 (deflate format) and rfc1952 (gzip format).
*/
var P={},so=typeof Uint8Array!=="undefined"&&typeof Uint16Array!=="undefined"&&typeof Int32Array!=="undefined";P.assign=function(a){for(var b=Array.prototype.slice.call(arguments,1);b.length;){var c=b.shift();if(c){if(typeof c!=="object")throw new TypeError(c+"must be non-object");for(var d in c)Object.prototype.hasOwnProperty.call(c,d)&&(a[d]=c[d])}}return a};
P.Fd=function(a,b){if(a.length===b)return a;if(a.subarray)return a.subarray(0,b);a.length=b;return a};
var to={Db:function(a,b,c,d,e){if(b.subarray&&a.subarray)a.set(b.subarray(c,c+d),e);else for(var f=0;f<d;f++)a[e+f]=b[c+f]},
Ud:function(a){var b,c;var d=c=0;for(b=a.length;d<b;d++)c+=a[d].length;var e=new Uint8Array(c);d=c=0;for(b=a.length;d<b;d++){var f=a[d];e.set(f,c);c+=f.length}return e}},uo={Db:function(a,b,c,d,e){for(var f=0;f<d;f++)a[e+f]=b[c+f]},
Ud:function(a){return[].concat.apply([],a)}};
P.wg=function(){so?(P.yb=Uint8Array,P.Qa=Uint16Array,P.Ke=Int32Array,P.assign(P,to)):(P.yb=Array,P.Qa=Array,P.Ke=Array,P.assign(P,uo))};
P.wg();var vo=!0;try{new Uint8Array(1)}catch(a){vo=!1}
function wo(a){var b,c,d=a.length,e=0;for(b=0;b<d;b++){var f=a.charCodeAt(b);if((f&64512)===55296&&b+1<d){var g=a.charCodeAt(b+1);(g&64512)===56320&&(f=65536+(f-55296<<10)+(g-56320),b++)}e+=f<128?1:f<2048?2:f<65536?3:4}var h=new P.yb(e);for(b=c=0;c<e;b++)f=a.charCodeAt(b),(f&64512)===55296&&b+1<d&&(g=a.charCodeAt(b+1),(g&64512)===56320&&(f=65536+(f-55296<<10)+(g-56320),b++)),f<128?h[c++]=f:(f<2048?h[c++]=192|f>>>6:(f<65536?h[c++]=224|f>>>12:(h[c++]=240|f>>>18,h[c++]=128|f>>>12&63),h[c++]=128|f>>>
6&63),h[c++]=128|f&63);return h}
;var xo={};xo=function(a,b,c,d){var e=a&65535|0;a=a>>>16&65535|0;for(var f;c!==0;){f=c>2E3?2E3:c;c-=f;do e=e+b[d++]|0,a=a+e|0;while(--f);e%=65521;a%=65521}return e|a<<16|0};for(var yo={},zo,Ao=[],Bo=0;Bo<256;Bo++){zo=Bo;for(var Co=0;Co<8;Co++)zo=zo&1?3988292384^zo>>>1:zo>>>1;Ao[Bo]=zo}yo=function(a,b,c,d){c=d+c;for(a^=-1;d<c;d++)a=a>>>8^Ao[(a^b[d])&255];return a^-1};var Do={};Do={2:"need dictionary",1:"stream end",0:"","-1":"file error","-2":"stream error","-3":"data error","-4":"insufficient memory","-5":"buffer error","-6":"incompatible version"};function Eo(a){for(var b=a.length;--b>=0;)a[b]=0}
var Fo=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],Go=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],Ho=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],Io=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],Jo=Array(576);Eo(Jo);var Ko=Array(60);Eo(Ko);var Lo=Array(512);Eo(Lo);var Mo=Array(256);Eo(Mo);var No=Array(29);Eo(No);var Oo=Array(30);Eo(Oo);function Po(a,b,c,d,e){this.we=a;this.sf=b;this.rf=c;this.df=d;this.Qf=e;this.Xd=a&&a.length}
var Qo,Ro,So;function To(a,b){this.Td=a;this.Ob=0;this.mb=b}
function Uo(a,b){a.ga[a.pending++]=b&255;a.ga[a.pending++]=b>>>8&255}
function Vo(a,b,c){a.ma>16-c?(a.ta|=b<<a.ma&65535,Uo(a,a.ta),a.ta=b>>16-a.ma,a.ma+=c-16):(a.ta|=b<<a.ma&65535,a.ma+=c)}
function Wo(a,b,c){Vo(a,c[b*2],c[b*2+1])}
function Xo(a,b){var c=0;do c|=a&1,a>>>=1,c<<=1;while(--b>0);return c>>>1}
function Yo(a,b,c){var d=Array(16),e=0,f;for(f=1;f<=15;f++)d[f]=e=e+c[f-1]<<1;for(c=0;c<=b;c++)e=a[c*2+1],e!==0&&(a[c*2]=Xo(d[e]++,e))}
function Zo(a){var b;for(b=0;b<286;b++)a.ya[b*2]=0;for(b=0;b<30;b++)a.ob[b*2]=0;for(b=0;b<19;b++)a.oa[b*2]=0;a.ya[512]=1;a.Ya=a.Ub=0;a.Ea=a.matches=0}
function $o(a){a.ma>8?Uo(a,a.ta):a.ma>0&&(a.ga[a.pending++]=a.ta);a.ta=0;a.ma=0}
function ap(a,b,c){$o(a);Uo(a,c);Uo(a,~c);P.Db(a.ga,a.window,b,c,a.pending);a.pending+=c}
function bp(a,b,c,d){var e=b*2,f=c*2;return a[e]<a[f]||a[e]===a[f]&&d[b]<=d[c]}
function cp(a,b,c){for(var d=a.ha[c],e=c<<1;e<=a.Wa;){e<a.Wa&&bp(b,a.ha[e+1],a.ha[e],a.depth)&&e++;if(bp(b,d,a.ha[e],a.depth))break;a.ha[c]=a.ha[e];c=e;e<<=1}a.ha[c]=d}
function dp(a,b,c){var d=0;if(a.Ea!==0){do{var e=a.ga[a.dc+d*2]<<8|a.ga[a.dc+d*2+1];var f=a.ga[a.td+d];d++;if(e===0)Wo(a,f,b);else{var g=Mo[f];Wo(a,g+256+1,b);var h=Fo[g];h!==0&&(f-=No[g],Vo(a,f,h));e--;g=e<256?Lo[e]:Lo[256+(e>>>7)];Wo(a,g,c);h=Go[g];h!==0&&(e-=Oo[g],Vo(a,e,h))}}while(d<a.Ea)}Wo(a,256,b)}
function ep(a,b){var c=b.Td,d=b.mb.we,e=b.mb.Xd,f=b.mb.df,g,h=-1;a.Wa=0;a.Kb=573;for(g=0;g<f;g++)c[g*2]!==0?(a.ha[++a.Wa]=h=g,a.depth[g]=0):c[g*2+1]=0;for(;a.Wa<2;){var k=a.ha[++a.Wa]=h<2?++h:0;c[k*2]=1;a.depth[k]=0;a.Ya--;e&&(a.Ub-=d[k*2+1])}b.Ob=h;for(g=a.Wa>>1;g>=1;g--)cp(a,c,g);k=f;do g=a.ha[1],a.ha[1]=a.ha[a.Wa--],cp(a,c,1),d=a.ha[1],a.ha[--a.Kb]=g,a.ha[--a.Kb]=d,c[k*2]=c[g*2]+c[d*2],a.depth[k]=(a.depth[g]>=a.depth[d]?a.depth[g]:a.depth[d])+1,c[g*2+1]=c[d*2+1]=k,a.ha[1]=k++,cp(a,c,1);while(a.Wa>=
2);a.ha[--a.Kb]=a.ha[1];g=b.Td;k=b.Ob;d=b.mb.we;e=b.mb.Xd;f=b.mb.sf;var l=b.mb.rf,m=b.mb.Qf,p,r=0;for(p=0;p<=15;p++)a.Sa[p]=0;g[a.ha[a.Kb]*2+1]=0;for(b=a.Kb+1;b<573;b++){var t=a.ha[b];p=g[g[t*2+1]*2+1]+1;p>m&&(p=m,r++);g[t*2+1]=p;if(!(t>k)){a.Sa[p]++;var w=0;t>=l&&(w=f[t-l]);var y=g[t*2];a.Ya+=y*(p+w);e&&(a.Ub+=y*(d[t*2+1]+w))}}if(r!==0){do{for(p=m-1;a.Sa[p]===0;)p--;a.Sa[p]--;a.Sa[p+1]+=2;a.Sa[m]--;r-=2}while(r>0);for(p=m;p!==0;p--)for(t=a.Sa[p];t!==0;)d=a.ha[--b],d>k||(g[d*2+1]!==p&&(a.Ya+=(p-g[d*
2+1])*g[d*2],g[d*2+1]=p),t--)}Yo(c,h,a.Sa)}
function fp(a,b,c){var d,e=-1,f=b[1],g=0,h=7,k=4;f===0&&(h=138,k=3);b[(c+1)*2+1]=65535;for(d=0;d<=c;d++){var l=f;f=b[(d+1)*2+1];++g<h&&l===f||(g<k?a.oa[l*2]+=g:l!==0?(l!==e&&a.oa[l*2]++,a.oa[32]++):g<=10?a.oa[34]++:a.oa[36]++,g=0,e=l,f===0?(h=138,k=3):l===f?(h=6,k=3):(h=7,k=4))}}
function gp(a,b,c){var d,e=-1,f=b[1],g=0,h=7,k=4;f===0&&(h=138,k=3);for(d=0;d<=c;d++){var l=f;f=b[(d+1)*2+1];if(!(++g<h&&l===f)){if(g<k){do Wo(a,l,a.oa);while(--g!==0)}else l!==0?(l!==e&&(Wo(a,l,a.oa),g--),Wo(a,16,a.oa),Vo(a,g-3,2)):g<=10?(Wo(a,17,a.oa),Vo(a,g-3,3)):(Wo(a,18,a.oa),Vo(a,g-11,7));g=0;e=l;f===0?(h=138,k=3):l===f?(h=6,k=3):(h=7,k=4)}}}
function hp(a){var b=4093624447,c;for(c=0;c<=31;c++,b>>>=1)if(b&1&&a.ya[c*2]!==0)return 0;if(a.ya[18]!==0||a.ya[20]!==0||a.ya[26]!==0)return 1;for(c=32;c<256;c++)if(a.ya[c*2]!==0)return 1;return 0}
var ip=!1;function jp(a,b,c){a.ga[a.dc+a.Ea*2]=b>>>8&255;a.ga[a.dc+a.Ea*2+1]=b&255;a.ga[a.td+a.Ea]=c&255;a.Ea++;b===0?a.ya[c*2]++:(a.matches++,b--,a.ya[(Mo[c]+256+1)*2]++,a.ob[(b<256?Lo[b]:Lo[256+(b>>>7)])*2]++);return a.Ea===a.kc-1}
;function kp(a,b){a.msg=Do[b];return b}
function lp(a){for(var b=a.length;--b>=0;)a[b]=0}
function mp(a){var b=a.state,c=b.pending;c>a.W&&(c=a.W);c!==0&&(P.Db(a.output,b.ga,b.oc,c,a.Qb),a.Qb+=c,b.oc+=c,a.Hd+=c,a.W-=c,b.pending-=c,b.pending===0&&(b.oc=0))}
function np(a,b){var c=a.Ba>=0?a.Ba:-1,d=a.A-a.Ba,e=0;if(a.level>0){a.U.ld===2&&(a.U.ld=hp(a));ep(a,a.Lc);ep(a,a.Gc);fp(a,a.ya,a.Lc.Ob);fp(a,a.ob,a.Gc.Ob);ep(a,a.Pd);for(e=18;e>=3&&a.oa[Io[e]*2+1]===0;e--);a.Ya+=3*(e+1)+5+5+4;var f=a.Ya+3+7>>>3;var g=a.Ub+3+7>>>3;g<=f&&(f=g)}else f=g=d+5;if(d+4<=f&&c!==-1)Vo(a,b?1:0,3),ap(a,c,d);else if(a.strategy===4||g===f)Vo(a,2+(b?1:0),3),dp(a,Jo,Ko);else{Vo(a,4+(b?1:0),3);c=a.Lc.Ob+1;d=a.Gc.Ob+1;e+=1;Vo(a,c-257,5);Vo(a,d-1,5);Vo(a,e-4,4);for(f=0;f<e;f++)Vo(a,
a.oa[Io[f]*2+1],3);gp(a,a.ya,c-1);gp(a,a.ob,d-1);dp(a,a.ya,a.ob)}Zo(a);b&&$o(a);a.Ba=a.A;mp(a.U)}
function R(a,b){a.ga[a.pending++]=b}
function op(a,b){a.ga[a.pending++]=b>>>8&255;a.ga[a.pending++]=b&255}
function pp(a,b){var c=a.ce,d=a.A,e=a.Ca,f=a.ee,g=a.A>a.ra-262?a.A-(a.ra-262):0,h=a.window,k=a.nb,l=a.Pa,m=a.A+258,p=h[d+e-1],r=h[d+e];a.Ca>=a.Wd&&(c>>=2);f>a.F&&(f=a.F);do{var t=b;if(h[t+e]===r&&h[t+e-1]===p&&h[t]===h[d]&&h[++t]===h[d+1]){d+=2;for(t++;h[++d]===h[++t]&&h[++d]===h[++t]&&h[++d]===h[++t]&&h[++d]===h[++t]&&h[++d]===h[++t]&&h[++d]===h[++t]&&h[++d]===h[++t]&&h[++d]===h[++t]&&d<m;);t=258-(m-d);d=m-258;if(t>e){a.Nb=b;e=t;if(t>=f)break;p=h[d+e-1];r=h[d+e]}}}while((b=l[b&k])>g&&--c!==0);return e<=
a.F?e:a.F}
function qp(a){var b=a.ra,c;do{var d=a.Ie-a.F-a.A;if(a.A>=b+(b-262)){P.Db(a.window,a.window,b,b,0);a.Nb-=b;a.A-=b;a.Ba-=b;var e=c=a.Kc;do{var f=a.head[--e];a.head[e]=f>=b?f-b:0}while(--c);e=c=b;do f=a.Pa[--e],a.Pa[e]=f>=b?f-b:0;while(--c);d+=b}if(a.U.sa===0)break;e=a.U;c=a.window;f=a.A+a.F;var g=e.sa;g>d&&(g=d);g===0?c=0:(e.sa-=g,P.Db(c,e.input,e.ub,g,f),e.state.wrap===1?e.P=xo(e.P,c,g,f):e.state.wrap===2&&(e.P=yo(e.P,c,g,f)),e.ub+=g,e.xb+=g,c=g);a.F+=c;if(a.F+a.qa>=3)for(d=a.A-a.qa,a.V=a.window[d],
a.V=(a.V<<a.Va^a.window[d+1])&a.Ua;a.qa&&!(a.V=(a.V<<a.Va^a.window[d+3-1])&a.Ua,a.Pa[d&a.nb]=a.head[a.V],a.head[a.V]=d,d++,a.qa--,a.F+a.qa<3););}while(a.F<262&&a.U.sa!==0)}
function rp(a,b){for(var c;;){if(a.F<262){qp(a);if(a.F<262&&b===0)return 1;if(a.F===0)break}c=0;a.F>=3&&(a.V=(a.V<<a.Va^a.window[a.A+3-1])&a.Ua,c=a.Pa[a.A&a.nb]=a.head[a.V],a.head[a.V]=a.A);c!==0&&a.A-c<=a.ra-262&&(a.Y=pp(a,c));if(a.Y>=3)if(c=jp(a,a.A-a.Nb,a.Y-3),a.F-=a.Y,a.Y<=a.vd&&a.F>=3){a.Y--;do a.A++,a.V=(a.V<<a.Va^a.window[a.A+3-1])&a.Ua,a.Pa[a.A&a.nb]=a.head[a.V],a.head[a.V]=a.A;while(--a.Y!==0);a.A++}else a.A+=a.Y,a.Y=0,a.V=a.window[a.A],a.V=(a.V<<a.Va^a.window[a.A+1])&a.Ua;else c=jp(a,0,
a.window[a.A]),a.F--,a.A++;if(c&&(np(a,!1),a.U.W===0))return 1}a.qa=a.A<2?a.A:2;return b===4?(np(a,!0),a.U.W===0?3:4):a.Ea&&(np(a,!1),a.U.W===0)?1:2}
function sp(a,b){for(var c,d;;){if(a.F<262){qp(a);if(a.F<262&&b===0)return 1;if(a.F===0)break}c=0;a.F>=3&&(a.V=(a.V<<a.Va^a.window[a.A+3-1])&a.Ua,c=a.Pa[a.A&a.nb]=a.head[a.V],a.head[a.V]=a.A);a.Ca=a.Y;a.je=a.Nb;a.Y=2;c!==0&&a.Ca<a.vd&&a.A-c<=a.ra-262&&(a.Y=pp(a,c),a.Y<=5&&(a.strategy===1||a.Y===3&&a.A-a.Nb>4096)&&(a.Y=2));if(a.Ca>=3&&a.Y<=a.Ca){d=a.A+a.F-3;c=jp(a,a.A-1-a.je,a.Ca-3);a.F-=a.Ca-1;a.Ca-=2;do++a.A<=d&&(a.V=(a.V<<a.Va^a.window[a.A+3-1])&a.Ua,a.Pa[a.A&a.nb]=a.head[a.V],a.head[a.V]=a.A);
while(--a.Ca!==0);a.sb=0;a.Y=2;a.A++;if(c&&(np(a,!1),a.U.W===0))return 1}else if(a.sb){if((c=jp(a,0,a.window[a.A-1]))&&np(a,!1),a.A++,a.F--,a.U.W===0)return 1}else a.sb=1,a.A++,a.F--}a.sb&&(jp(a,0,a.window[a.A-1]),a.sb=0);a.qa=a.A<2?a.A:2;return b===4?(np(a,!0),a.U.W===0?3:4):a.Ea&&(np(a,!1),a.U.W===0)?1:2}
function tp(a,b){for(var c,d,e,f=a.window;;){if(a.F<=258){qp(a);if(a.F<=258&&b===0)return 1;if(a.F===0)break}a.Y=0;if(a.F>=3&&a.A>0&&(d=a.A-1,c=f[d],c===f[++d]&&c===f[++d]&&c===f[++d])){for(e=a.A+258;c===f[++d]&&c===f[++d]&&c===f[++d]&&c===f[++d]&&c===f[++d]&&c===f[++d]&&c===f[++d]&&c===f[++d]&&d<e;);a.Y=258-(e-d);a.Y>a.F&&(a.Y=a.F)}a.Y>=3?(c=jp(a,1,a.Y-3),a.F-=a.Y,a.A+=a.Y,a.Y=0):(c=jp(a,0,a.window[a.A]),a.F--,a.A++);if(c&&(np(a,!1),a.U.W===0))return 1}a.qa=0;return b===4?(np(a,!0),a.U.W===0?3:4):
a.Ea&&(np(a,!1),a.U.W===0)?1:2}
function up(a,b){for(var c;;){if(a.F===0&&(qp(a),a.F===0)){if(b===0)return 1;break}a.Y=0;c=jp(a,0,a.window[a.A]);a.F--;a.A++;if(c&&(np(a,!1),a.U.W===0))return 1}a.qa=0;return b===4?(np(a,!0),a.U.W===0?3:4):a.Ea&&(np(a,!1),a.U.W===0)?1:2}
function vp(a,b,c,d,e){this.Af=a;this.Pf=b;this.Vf=c;this.Of=d;this.xf=e}
var wp;wp=[new vp(0,0,0,0,function(a,b){var c=65535;for(c>a.Fa-5&&(c=a.Fa-5);;){if(a.F<=1){qp(a);if(a.F===0&&b===0)return 1;if(a.F===0)break}a.A+=a.F;a.F=0;var d=a.Ba+c;if(a.A===0||a.A>=d)if(a.F=a.A-d,a.A=d,np(a,!1),a.U.W===0)return 1;if(a.A-a.Ba>=a.ra-262&&(np(a,!1),a.U.W===0))return 1}a.qa=0;if(b===4)return np(a,!0),a.U.W===0?3:4;a.A>a.Ba&&np(a,!1);return 1}),
new vp(4,4,8,4,rp),new vp(4,5,16,8,rp),new vp(4,6,32,32,rp),new vp(4,4,16,16,sp),new vp(8,16,32,32,sp),new vp(8,16,128,128,sp),new vp(8,32,128,256,sp),new vp(32,128,258,1024,sp),new vp(32,258,258,4096,sp)];
function xp(){this.U=null;this.status=0;this.ga=null;this.wrap=this.pending=this.oc=this.Fa=0;this.K=null;this.Ha=0;this.method=8;this.Mb=-1;this.nb=this.Kd=this.ra=0;this.window=null;this.Ie=0;this.head=this.Pa=null;this.ee=this.Wd=this.strategy=this.level=this.vd=this.ce=this.Ca=this.F=this.Nb=this.A=this.sb=this.je=this.Y=this.Ba=this.Va=this.Ua=this.rd=this.Kc=this.V=0;this.ya=new P.Qa(1146);this.ob=new P.Qa(122);this.oa=new P.Qa(78);lp(this.ya);lp(this.ob);lp(this.oa);this.Pd=this.Gc=this.Lc=
null;this.Sa=new P.Qa(16);this.ha=new P.Qa(573);lp(this.ha);this.Kb=this.Wa=0;this.depth=new P.Qa(573);lp(this.depth);this.ma=this.ta=this.qa=this.matches=this.Ub=this.Ya=this.dc=this.Ea=this.kc=this.td=0}
function yp(a,b){if(!a||!a.state||b>5||b<0)return a?kp(a,-2):-2;var c=a.state;if(!a.output||!a.input&&a.sa!==0||c.status===666&&b!==4)return kp(a,a.W===0?-5:-2);c.U=a;var d=c.Mb;c.Mb=b;if(c.status===42)if(c.wrap===2)a.P=0,R(c,31),R(c,139),R(c,8),c.K?(R(c,(c.K.text?1:0)+(c.K.gb?2:0)+(c.K.extra?4:0)+(c.K.name?8:0)+(c.K.comment?16:0)),R(c,c.K.time&255),R(c,c.K.time>>8&255),R(c,c.K.time>>16&255),R(c,c.K.time>>24&255),R(c,c.level===9?2:c.strategy>=2||c.level<2?4:0),R(c,c.K.os&255),c.K.extra&&c.K.extra.length&&
(R(c,c.K.extra.length&255),R(c,c.K.extra.length>>8&255)),c.K.gb&&(a.P=yo(a.P,c.ga,c.pending,0)),c.Ha=0,c.status=69):(R(c,0),R(c,0),R(c,0),R(c,0),R(c,0),R(c,c.level===9?2:c.strategy>=2||c.level<2?4:0),R(c,3),c.status=113);else{var e=8+(c.Kd-8<<4)<<8;e|=(c.strategy>=2||c.level<2?0:c.level<6?1:c.level===6?2:3)<<6;c.A!==0&&(e|=32);c.status=113;op(c,e+(31-e%31));c.A!==0&&(op(c,a.P>>>16),op(c,a.P&65535));a.P=1}if(c.status===69)if(c.K.extra){for(e=c.pending;c.Ha<(c.K.extra.length&65535)&&(c.pending!==c.Fa||
(c.K.gb&&c.pending>e&&(a.P=yo(a.P,c.ga,c.pending-e,e)),mp(a),e=c.pending,c.pending!==c.Fa));)R(c,c.K.extra[c.Ha]&255),c.Ha++;c.K.gb&&c.pending>e&&(a.P=yo(a.P,c.ga,c.pending-e,e));c.Ha===c.K.extra.length&&(c.Ha=0,c.status=73)}else c.status=73;if(c.status===73)if(c.K.name){e=c.pending;do{if(c.pending===c.Fa&&(c.K.gb&&c.pending>e&&(a.P=yo(a.P,c.ga,c.pending-e,e)),mp(a),e=c.pending,c.pending===c.Fa)){var f=1;break}f=c.Ha<c.K.name.length?c.K.name.charCodeAt(c.Ha++)&255:0;R(c,f)}while(f!==0);c.K.gb&&c.pending>
e&&(a.P=yo(a.P,c.ga,c.pending-e,e));f===0&&(c.Ha=0,c.status=91)}else c.status=91;if(c.status===91)if(c.K.comment){e=c.pending;do{if(c.pending===c.Fa&&(c.K.gb&&c.pending>e&&(a.P=yo(a.P,c.ga,c.pending-e,e)),mp(a),e=c.pending,c.pending===c.Fa)){f=1;break}f=c.Ha<c.K.comment.length?c.K.comment.charCodeAt(c.Ha++)&255:0;R(c,f)}while(f!==0);c.K.gb&&c.pending>e&&(a.P=yo(a.P,c.ga,c.pending-e,e));f===0&&(c.status=103)}else c.status=103;c.status===103&&(c.K.gb?(c.pending+2>c.Fa&&mp(a),c.pending+2<=c.Fa&&(R(c,
a.P&255),R(c,a.P>>8&255),a.P=0,c.status=113)):c.status=113);if(c.pending!==0){if(mp(a),a.W===0)return c.Mb=-1,0}else if(a.sa===0&&(b<<1)-(b>4?9:0)<=(d<<1)-(d>4?9:0)&&b!==4)return kp(a,-5);if(c.status===666&&a.sa!==0)return kp(a,-5);if(a.sa!==0||c.F!==0||b!==0&&c.status!==666){d=c.strategy===2?up(c,b):c.strategy===3?tp(c,b):wp[c.level].xf(c,b);if(d===3||d===4)c.status=666;if(d===1||d===3)return a.W===0&&(c.Mb=-1),0;if(d===2&&(b===1?(Vo(c,2,3),Wo(c,256,Jo),c.ma===16?(Uo(c,c.ta),c.ta=0,c.ma=0):c.ma>=
8&&(c.ga[c.pending++]=c.ta&255,c.ta>>=8,c.ma-=8)):b!==5&&(Vo(c,0,3),ap(c,0,0),b===3&&(lp(c.head),c.F===0&&(c.A=0,c.Ba=0,c.qa=0))),mp(a),a.W===0))return c.Mb=-1,0}if(b!==4)return 0;if(c.wrap<=0)return 1;c.wrap===2?(R(c,a.P&255),R(c,a.P>>8&255),R(c,a.P>>16&255),R(c,a.P>>24&255),R(c,a.xb&255),R(c,a.xb>>8&255),R(c,a.xb>>16&255),R(c,a.xb>>24&255)):(op(c,a.P>>>16),op(c,a.P&65535));mp(a);c.wrap>0&&(c.wrap=-c.wrap);return c.pending!==0?0:1}
;var zp={};zp=function(){this.input=null;this.xb=this.sa=this.ub=0;this.output=null;this.Hd=this.W=this.Qb=0;this.msg="";this.state=null;this.ld=2;this.P=0};var Ap=Object.prototype.toString;
function Bp(a){if(!(this instanceof Bp))return new Bp(a);a=this.options=P.assign({level:-1,method:8,chunkSize:16384,windowBits:15,memLevel:8,strategy:0,to:""},a||{});a.raw&&a.windowBits>0?a.windowBits=-a.windowBits:a.gzip&&a.windowBits>0&&a.windowBits<16&&(a.windowBits+=16);this.err=0;this.msg="";this.ended=!1;this.chunks=[];this.U=new zp;this.U.W=0;var b=this.U;var c=a.level,d=a.method,e=a.windowBits,f=a.memLevel,g=a.strategy;if(b){var h=1;c===-1&&(c=6);e<0?(h=0,e=-e):e>15&&(h=2,e-=16);if(f<1||f>
9||d!==8||e<8||e>15||c<0||c>9||g<0||g>4)b=kp(b,-2);else{e===8&&(e=9);var k=new xp;b.state=k;k.U=b;k.wrap=h;k.K=null;k.Kd=e;k.ra=1<<k.Kd;k.nb=k.ra-1;k.rd=f+7;k.Kc=1<<k.rd;k.Ua=k.Kc-1;k.Va=~~((k.rd+3-1)/3);k.window=new P.yb(k.ra*2);k.head=new P.Qa(k.Kc);k.Pa=new P.Qa(k.ra);k.kc=1<<f+6;k.Fa=k.kc*4;k.ga=new P.yb(k.Fa);k.dc=1*k.kc;k.td=3*k.kc;k.level=c;k.strategy=g;k.method=d;if(b&&b.state){b.xb=b.Hd=0;b.ld=2;c=b.state;c.pending=0;c.oc=0;c.wrap<0&&(c.wrap=-c.wrap);c.status=c.wrap?42:113;b.P=c.wrap===2?
0:1;c.Mb=0;if(!ip){d=Array(16);for(f=g=0;f<28;f++)for(No[f]=g,e=0;e<1<<Fo[f];e++)Mo[g++]=f;Mo[g-1]=f;for(f=g=0;f<16;f++)for(Oo[f]=g,e=0;e<1<<Go[f];e++)Lo[g++]=f;for(g>>=7;f<30;f++)for(Oo[f]=g<<7,e=0;e<1<<Go[f]-7;e++)Lo[256+g++]=f;for(e=0;e<=15;e++)d[e]=0;for(e=0;e<=143;)Jo[e*2+1]=8,e++,d[8]++;for(;e<=255;)Jo[e*2+1]=9,e++,d[9]++;for(;e<=279;)Jo[e*2+1]=7,e++,d[7]++;for(;e<=287;)Jo[e*2+1]=8,e++,d[8]++;Yo(Jo,287,d);for(e=0;e<30;e++)Ko[e*2+1]=5,Ko[e*2]=Xo(e,5);Qo=new Po(Jo,Fo,257,286,15);Ro=new Po(Ko,
Go,0,30,15);So=new Po([],Ho,0,19,7);ip=!0}c.Lc=new To(c.ya,Qo);c.Gc=new To(c.ob,Ro);c.Pd=new To(c.oa,So);c.ta=0;c.ma=0;Zo(c);c=0}else c=kp(b,-2);c===0&&(b=b.state,b.Ie=2*b.ra,lp(b.head),b.vd=wp[b.level].Pf,b.Wd=wp[b.level].Af,b.ee=wp[b.level].Vf,b.ce=wp[b.level].Of,b.A=0,b.Ba=0,b.F=0,b.qa=0,b.Y=b.Ca=2,b.sb=0,b.V=0);b=c}}else b=-2;if(b!==0)throw Error(Do[b]);a.header&&(b=this.U)&&b.state&&b.state.wrap===2&&(b.state.K=a.header);if(a.dictionary){var l;typeof a.dictionary==="string"?l=wo(a.dictionary):
Ap.call(a.dictionary)==="[object ArrayBuffer]"?l=new Uint8Array(a.dictionary):l=a.dictionary;a=this.U;f=l;g=f.length;if(a&&a.state)if(l=a.state,b=l.wrap,b===2||b===1&&l.status!==42||l.F)b=-2;else{b===1&&(a.P=xo(a.P,f,g,0));l.wrap=0;g>=l.ra&&(b===0&&(lp(l.head),l.A=0,l.Ba=0,l.qa=0),c=new P.yb(l.ra),P.Db(c,f,g-l.ra,l.ra,0),f=c,g=l.ra);c=a.sa;d=a.ub;e=a.input;a.sa=g;a.ub=0;a.input=f;for(qp(l);l.F>=3;){f=l.A;g=l.F-2;do l.V=(l.V<<l.Va^l.window[f+3-1])&l.Ua,l.Pa[f&l.nb]=l.head[l.V],l.head[l.V]=f,f++;while(--g);
l.A=f;l.F=2;qp(l)}l.A+=l.F;l.Ba=l.A;l.qa=l.F;l.F=0;l.Y=l.Ca=2;l.sb=0;a.ub=d;a.input=e;a.sa=c;l.wrap=b;b=0}else b=-2;if(b!==0)throw Error(Do[b]);this.Vi=!0}}
Bp.prototype.push=function(a,b){var c=this.U,d=this.options.chunkSize;if(this.ended)return!1;var e=b===~~b?b:b===!0?4:0;typeof a==="string"?c.input=wo(a):Ap.call(a)==="[object ArrayBuffer]"?c.input=new Uint8Array(a):c.input=a;c.ub=0;c.sa=c.input.length;do{c.W===0&&(c.output=new P.yb(d),c.Qb=0,c.W=d);a=yp(c,e);if(a!==1&&a!==0)return Cp(this,a),this.ended=!0,!1;if(c.W===0||c.sa===0&&(e===4||e===2))if(this.options.to==="string"){var f=P.Fd(c.output,c.Qb);b=f;f=f.length;if(f<65537&&(b.subarray&&vo||!b.subarray))b=
String.fromCharCode.apply(null,P.Fd(b,f));else{for(var g="",h=0;h<f;h++)g+=String.fromCharCode(b[h]);b=g}this.chunks.push(b)}else b=P.Fd(c.output,c.Qb),this.chunks.push(b)}while((c.sa>0||c.W===0)&&a!==1);if(e===4)return(c=this.U)&&c.state?(d=c.state.status,d!==42&&d!==69&&d!==73&&d!==91&&d!==103&&d!==113&&d!==666?a=kp(c,-2):(c.state=null,a=d===113?kp(c,-3):0)):a=-2,Cp(this,a),this.ended=!0,a===0;e===2&&(Cp(this,0),c.W=0);return!0};
function Cp(a,b){b===0&&(a.result=a.options.to==="string"?a.chunks.join(""):P.Ud(a.chunks));a.chunks=[];a.err=b;a.msg=a.U.msg}
function Dp(a,b){b=b||{};b.gzip=!0;b=new Bp(b);b.push(a,!0);if(b.err)throw b.msg||Do[b.err];return b.result}
;function Ep(a){return a?(a=a.privateDoNotAccessOrElseSafeScriptWrappedValue)?Eb(a):null:null}
function Fp(a){return a?(a=a.privateDoNotAccessOrElseTrustedResourceUrlWrappedValue)?lb(a):null:null}
;function Gp(a){return lb(a===null?"null":a===void 0?"undefined":a)}
;function Hp(a){this.name=a}
;var Ip=new Hp("rawColdConfigGroup");var Jp=new Hp("rawHotConfigGroup");function Kp(a){this.D=N(a)}
v(Kp,O);function Lp(a){this.D=N(a)}
v(Lp,O);Lp.prototype.setTrackingParams=function(a){return ag(this,1,qe(a,!1))};var Mp=new Hp("continuationCommand");var Np=new Hp("webCommandMetadata");var Op=new Hp("signalServiceEndpoint");var Pp={bh:"EMBEDDED_PLAYER_MODE_UNKNOWN",Yg:"EMBEDDED_PLAYER_MODE_DEFAULT",ah:"EMBEDDED_PLAYER_MODE_PFP",Zg:"EMBEDDED_PLAYER_MODE_PFL"};var Qp=new Hp("feedbackEndpoint");var ze={xi:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_UNKNOWN",Bh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_FOR_TESTING",Zh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_RESUME_TO_HOME_TTL",ki:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_START_TO_SHORTS_ANALYSIS_SLICE",oh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_DEVICE_LAYER_SLICE",wi:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_UNIFIED_LAYER_SLICE",zi:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_VISITOR_LAYER_SLICE",ii:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_SHOW_SHEET_COMMAND_HANDLER_BLOCK",
Ci:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_WIZ_NEXT_MIGRATED_COMPONENT",Bi:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_WIZ_NEXT_CHANNEL_NAME_TOOLTIP",di:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_ROTATION_LOCK_SUPPORTED",ni:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_THEATER_MODE_ENABLED",Hi:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_WOULD_SHOW_PIN_SUGGESTION",Gi:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_WOULD_SHOW_LONG_PRESS_EDU_TOAST",Fi:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_WOULD_SHOW_AMBIENT",oi:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_TIME_WATCHED_PANEL",
gi:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_SEARCH_FROM_SEARCH_BAR_OVERLAY",Ii:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_WOULD_SHOW_VOICE_SEARCH_EDU_TOAST",mi:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_SUGGESTED_LANGUAGE_SELECTED",Ji:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_WOULD_TRIGGER_SHORTS_PIP",Ih:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_IN_ZP_VOICE_CRASHY_SET",Vh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_REEL_FAST_SWIPE_SUPPRESSED",Uh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_REEL_FAST_SWIPE_ALLOWED",Xh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_REEL_PULL_TO_REFRESH_ATTEMPT",
Di:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_WOULD_BLOCK_KABUKI",Yh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_REEL_TALL_SCREEN",Wh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_REEL_NORMAL_SCREEN",gh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_ACCESSIBILITY_MODE_ENABLED",fh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_ACCESSIBILITY_MODE_DISABLED",hh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_AUTOPLAY_ENABLED",ih:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_CAST_MATCH_OCCURRED",th:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_EMC3DS_ELIGIBLE",xh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_ENDSCREEN_TRIGGERED",
Th:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_POSTPLAY_TRIGGERED",Sh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_POSTPLAY_LACT_THRESHOLD_EXCEEDED",Ch:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_IDENTITIES_STATE_MATCHED_ON_REMOTE_CONNECTION",Eh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_IDENTITIES_STATE_SWITCHABLE_ON_REMOTE_CONNECTION",Dh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_IDENTITIES_STATE_MISATTRIBUTED_ON_REMOTE_CONNECTION",Hh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_IDENTITIES_TV_IS_SIGNED_IN_ON_REMOTE_CONNECTION",si:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_TV_START_TYPE_COLD_ON_REMOTE_CONNECTION",
ti:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_TV_START_TYPE_NON_COLD_ON_REMOTE_CONNECTION",Oh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_ON_REMOTE_CONNECTION",nh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_COBALT_PERSISTENT_SETTINGS_TEST_VALID",kh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_COBALT_PERSISTENT_SETTINGS_TEST_INVALID",mh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_COBALT_PERSISTENT_SETTINGS_TEST_UNDEFINED",jh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_COBALT_PERSISTENT_SETTINGS_TEST_DEFINED",Jh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_LACT_THRESHOLD_EXCEEDED",
fi:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_ROUND_TRIP_HANDLING_ON_REMOTE_CONNECTION",Gh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_IDENTITIES_STATE_SWITCHED_ON_REMOTE_CONNECTION_BEFORE_APP_RELOAD",Fh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_IDENTITIES_STATE_SWITCHED_ON_REMOTE_CONNECTION_AFTER_APP_RELOAD",uh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_EMC3DS_INELIGIBLE",ri:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_TVHTML5_MID_ROLL_THRESHOLD_REACHED",zh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_EXP_COBALT_HTTP3_CONFIG_PENDING",
yh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_EXP_COBALT_HTTP3_CONFIG_ACTIVATED",wh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_EMC3DS_M2_ELIGIBLE",bi:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_ROTATE_DEVICE_TO_LANDSCAPE",ci:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_ROTATE_DEVICE_TO_PORTRAIT",sh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_EMBEDS_FACEOFF_UI_EVENT",Ah:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_EXP_COBALT_HTTP3_CONFIG_RECEIVED",rh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_ELIGIBLE_TO_SUPPRESS_TRANSPORT_CONTROLS_BUTTONS",
yi:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_USER_HAS_THEATER_MODE_COOKIE_ENABLED",qh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_DOCUMENT_PICTURE_IN_PICTURE_SUPPORTED",hi:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_SHORTS_NON_DEFAULT_ASPECT_RATIO",Rh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_PLAYER_IN_SQUEEZEBACK",Kh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_LIVE_CREATOR_AR_GIFT_RECEIVED",ai:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_RETURNED_TO_VIDEO_AFTER_FAILED_ATTEMPT_TO_BACKGROUND",Ei:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_WOULD_ENTER_AUTO_ZOOM",
Ph:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_PASSIVE_IN_CONTROL",Qh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_PASSIVE_IN_TREATMENT",ph:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_DISABLE_PLAYER_OPEN_ON_FULLSCREEN",Nh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_MDX_RECONNECT_WITH_RETRY",ji:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_SINGLE_COLUMN_GRID_TRIGGERED",Mh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_MDX_CONNECTION_TIMEOUT",Lh:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_LIVE_GHOST_LOADING_ELIGIBLE",li:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_STREAMED_GET_WATCH_SUPPORTED",
Ai:"GENERIC_CLIENT_EXPERIMENT_EVENT_TYPE_WEBVIEW_CONTAINER"};var Rp=new Hp("shareEndpoint"),Sp=new Hp("shareEntityEndpoint"),Tp=new Hp("shareEntityServiceEndpoint"),Up=new Hp("webPlayerShareEntityServiceEndpoint");var Vp=new Hp("playlistEditEndpoint");var Wp=new Hp("modifyChannelNotificationPreferenceEndpoint");var Xp=new Hp("undoFeedbackEndpoint");var Yp=new Hp("unsubscribeEndpoint");var Zp=new Hp("subscribeEndpoint");function $p(){var a=aq;I("yt.ads.biscotti.getId_")||G("yt.ads.biscotti.getId_",a)}
function bq(a){G("yt.ads.biscotti.lastId_",a)}
;function cq(a,b){b.length>1?a[b[0]]=b[1]:b.length===1&&Object.assign(a,b[0])}
;var dq=E.window,eq,fq,gq=(dq==null?void 0:(eq=dq.yt)==null?void 0:eq.config_)||(dq==null?void 0:(fq=dq.ytcfg)==null?void 0:fq.data_)||{};G("yt.config_",gq);function hq(){cq(gq,arguments)}
function S(a,b){return a in gq?gq[a]:b}
function iq(a){var b=gq.EXPERIMENT_FLAGS;return b?b[a]:void 0}
;var jq=[];function kq(a){jq.forEach(function(b){return b(a)})}
function lq(a){return a&&window.yterr?function(){try{return a.apply(this,arguments)}catch(b){mq(b)}}:a}
function mq(a){var b=I("yt.logging.errors.log");b?b(a,"ERROR",void 0,void 0,void 0,void 0,void 0):(b=S("ERRORS",[]),b.push([a,"ERROR",void 0,void 0,void 0,void 0,void 0]),hq("ERRORS",b));kq(a)}
function nq(a,b,c,d,e){var f=I("yt.logging.errors.log");f?f(a,"WARNING",b,c,d,void 0,e):(f=S("ERRORS",[]),f.push([a,"WARNING",b,c,d,void 0,e]),hq("ERRORS",f))}
;var oq=/^[\w.]*$/,pq={q:!0,search_query:!0};function qq(a,b){b=a.split(b);for(var c={},d=0,e=b.length;d<e;d++){var f=b[d].split("=");if(f.length===1&&f[0]||f.length===2)try{var g=rq(f[0]||""),h=rq(f[1]||"");if(g in c){var k=c[g];Array.isArray(k)?Wb(k,h):c[g]=[k,h]}else c[g]=h}catch(r){var l=r,m=f[0],p=String(qq);l.args=[{key:m,value:f[1],query:a,method:sq===p?"unchanged":p}];pq.hasOwnProperty(m)||nq(l)}}return c}
var sq=String(qq);function tq(a){var b=[];Ai(a,function(c,d){var e=encodeURIComponent(String(d));c=Array.isArray(c)?c:[c];Pb(c,function(f){f==""?b.push(e):b.push(e+"="+encodeURIComponent(String(f)))})});
return b.join("&")}
function uq(a){a.charAt(0)==="?"&&(a=a.substring(1));return qq(a,"&")}
function vq(a){return a.indexOf("?")!==-1?(a=(a||"").split("#")[0],a=a.split("?",2),uq(a.length>1?a[1]:a[0])):{}}
function wq(a,b){return xq(a,b||{},!0)}
function xq(a,b,c){var d=a.split("#",2);a=d[0];d=d.length>1?"#"+d[1]:"";var e=a.split("?",2);a=e[0];e=uq(e[1]||"");for(var f in b)!c&&e!==null&&f in e||(e[f]=b[f]);return oc(a,e)+d}
function yq(a){if(!b)var b=window.location.href;var c=a.match(ec)[1]||null,d=hc(a);c&&d?(a=a.match(ec),b=b.match(ec),a=a[3]==b[3]&&a[1]==b[1]&&a[4]==b[4]):a=d?hc(b)===d&&(Number(b.match(ec)[4]||null)||null)===(Number(a.match(ec)[4]||null)||null):!0;return a}
function rq(a){return a&&a.match(oq)?a:cc(a)}
;function zq(a){var b=Aq;a=a===void 0?I("yt.ads.biscotti.lastId_")||"":a;var c=Object,d=c.assign,e={};e.dt=on;e.flash="0";a:{try{var f=b.h.top.location.href}catch(Pa){f=2;break a}f=f?f===b.i.location.href?0:1:2}e=(e.frm=f,e);try{e.u_tz=-(new Date).getTimezoneOffset();try{var g=fn.history.length}catch(Pa){g=0}e.u_his=g;var h;e.u_h=(h=fn.screen)==null?void 0:h.height;var k;e.u_w=(k=fn.screen)==null?void 0:k.width;var l;e.u_ah=(l=fn.screen)==null?void 0:l.availHeight;var m;e.u_aw=(m=fn.screen)==null?
void 0:m.availWidth;var p;e.u_cd=(p=fn.screen)==null?void 0:p.colorDepth}catch(Pa){}var r;g=b.h;try{var t=g.screenX;var w=g.screenY}catch(Pa){}try{var y=g.outerWidth;var x=g.outerHeight}catch(Pa){}try{var H=g.innerWidth;var F=g.innerHeight}catch(Pa){}try{var W=g.screenLeft;var ma=g.screenTop}catch(Pa){}try{H=g.innerWidth,F=g.innerHeight}catch(Pa){}try{var ja=g.screen.availWidth;var Od=g.screen.availTop}catch(Pa){}t=[W,ma,t,w,ja,Od,y,x,H,F];try{var Kb=(b.h.top||window).document,gb=Kb.compatMode=="CSS1Compat"?
Kb.documentElement:Kb.body;var Qa=(new zi(gb.clientWidth,gb.clientHeight)).round()}catch(Pa){Qa=new zi(-12245933,-12245933)}Kb=Qa;Qa={};var Ea=Ea===void 0?E:Ea;gb=new wn;"SVGElement"in Ea&&"createElementNS"in Ea.document&&gb.set(0);w=ln();w["allow-top-navigation-by-user-activation"]&&gb.set(1);w["allow-popups-to-escape-sandbox"]&&gb.set(2);Ea.crypto&&Ea.crypto.subtle&&gb.set(3);"TextDecoder"in Ea&&"TextEncoder"in Ea&&gb.set(4);Ea=xn(gb);Qa.bc=Ea;Qa.bih=Kb.height;Qa.biw=Kb.width;Qa.brdim=t.join();
b=b.i;b=b.prerendering?3:(r={visible:1,hidden:2,prerender:3,preview:4,unloaded:5,"":0}[b.visibilityState||b.webkitVisibilityState||b.mozVisibilityState||""])!=null?r:0;r=(Qa.vis=b,Qa.wgl=!!fn.WebGLRenderingContext,Qa);c=d.call(c,e,r);c.ca_type="image";a&&(c.bid=a);return c}
var Aq=new function(){var a=window.document;this.h=window;this.i=a};
G("yt.ads_.signals_.getAdSignalsString",function(a){return tq(zq(a))});Va();navigator.userAgent.indexOf(" (CrKey ");var Bq="XMLHttpRequest"in E?function(){return new XMLHttpRequest}:null;
function Cq(){if(!Bq)return null;var a=Bq();return"open"in a?a:null}
function Dq(a){switch(Eq(a)){case 200:case 201:case 202:case 203:case 204:case 205:case 206:case 304:return!0;default:return!1}}
function Eq(a){return a&&"status"in a?a.status:-1}
;function Fq(a,b){typeof a==="function"&&(a=lq(a));return window.setTimeout(a,b)}
;var Gq="client_dev_domain client_dev_expflag client_dev_regex_map client_dev_root_url client_rollout_override expflag forcedCapability jsfeat jsmode mods theme".split(" ");[].concat(A(Gq),["client_dev_set_cookie"]);function T(a){a=Hq(a);return typeof a==="string"&&a==="false"?!1:!!a}
function en(a,b){a=Hq(a);return a===void 0&&b!==void 0?b:Number(a||0)}
function Iq(){var a=Hq("html5_web_po_experiment_ids");return Array.isArray(a)?Rb(a,function(b){return Number(b||0)}):[Number(a||0)]}
function Jq(a){a=Hq(a);return a!==void 0?String(a):""}
function Hq(a){return S("EXPERIMENT_FLAGS",{})[a]}
function Kq(){for(var a=[],b=S("EXPERIMENTS_FORCED_FLAGS",{}),c=z(Object.keys(b)),d=c.next();!d.done;d=c.next())d=d.value,a.push({key:d,value:String(b[d])});c=S("EXPERIMENT_FLAGS",{});d=z(Object.keys(c));for(var e=d.next();!e.done;e=d.next())e=e.value,e.startsWith("force_")&&b[e]===void 0&&a.push({key:e,value:String(c[e])});return a}
;var Lq={Authorization:"AUTHORIZATION","X-Goog-EOM-Visitor-Id":"EOM_VISITOR_DATA","X-Goog-Visitor-Id":"SANDBOXED_VISITOR_ID","X-Youtube-Domain-Admin-State":"DOMAIN_ADMIN_STATE","X-Youtube-Chrome-Connected":"CHROME_CONNECTED_HEADER","X-YouTube-Client-Name":"INNERTUBE_CONTEXT_CLIENT_NAME","X-YouTube-Client-Version":"INNERTUBE_CONTEXT_CLIENT_VERSION","X-YouTube-Delegation-Context":"INNERTUBE_CONTEXT_SERIALIZED_DELEGATION_CONTEXT","X-YouTube-Device":"DEVICE","X-Youtube-Identity-Token":"ID_TOKEN","X-YouTube-Page-CL":"PAGE_CL",
"X-YouTube-Page-Label":"PAGE_BUILD_LABEL","X-Goog-AuthUser":"SESSION_INDEX","X-Goog-PageId":"DELEGATED_SESSION_ID"},Mq="app debugcss debugjs expflag force_ad_params force_ad_encrypted force_viral_ad_response_params forced_experiments innertube_snapshots innertube_goldens internalcountrycode internalipoverride absolute_experiments conditional_experiments sbb sr_bns_address".split(" ").concat(A(Gq)),Nq=!1;function Oq(a,b,c,d,e,f,g,h,k){function l(){(m&&"readyState"in m?m.readyState:0)===4&&b&&lq(b)(m)}
c=c===void 0?"GET":c;d=d===void 0?"":d;h=h===void 0?!1:h;var m=Cq();if(!m)return null;"onloadend"in m?m.addEventListener("loadend",l,!1):m.onreadystatechange=l;T("debug_forward_web_query_parameters")&&(a=Pq(a));m.open(c,a,!0);f&&(m.responseType=f);g&&(m.withCredentials=!0);c=c==="POST"&&(window.FormData===void 0||!(d instanceof FormData));if(e=Qq(a,e))for(var p in e)m.setRequestHeader(p,e[p]),"content-type"===p.toLowerCase()&&(c=!1);c&&m.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
k&&"onprogress"in m&&(m.onprogress=function(){k(m.responseText)});
if(h&&"setAttributionReporting"in XMLHttpRequest.prototype){a={eventSourceEligible:!0,triggerEligible:!1};try{m.setAttributionReporting(a)}catch(r){nq(r)}}m.send(d);return m}
function Qq(a,b){b=b===void 0?{}:b;var c=yq(a),d=S("INNERTUBE_CLIENT_NAME"),e=T("web_ajax_ignore_global_headers_if_set"),f;for(f in Lq){var g=S(Lq[f]),h=f==="X-Goog-AuthUser"||f==="X-Goog-PageId";f!=="X-Goog-Visitor-Id"||g||(g=S("VISITOR_DATA"));var k;if(!(k=!g)){if(!(k=c||(hc(a)?!1:!0))){k=a;var l;if(l=T("add_auth_headers_to_remarketing_google_dot_com_ping")&&f==="Authorization"&&(d==="TVHTML5"||d==="TVHTML5_UNPLUGGED"||d==="TVHTML5_SIMPLY"))l=hc(k),l=l!==null?l.split(".").reverse():null,l=l===null?
!1:l[1]==="google"?!0:l[2]==="google"?l[0]==="au"&&l[1]==="com"?!0:l[0]==="uk"&&l[1]==="co"?!0:!1:!1;l&&(k=ic(k)||"",k=k.split("/"),k="/"+(k.length>1?k[1]:""),l=k==="/pagead");k=l?!0:!1}k=!k}k||e&&b[f]!==void 0||d==="TVHTML5_UNPLUGGED"&&h||(b[f]=g)}"X-Goog-EOM-Visitor-Id"in b&&"X-Goog-Visitor-Id"in b&&delete b["X-Goog-Visitor-Id"];if(c||!hc(a))b["X-YouTube-Utc-Offset"]=String(-(new Date).getTimezoneOffset());if(c||!hc(a)){try{var m=(new Intl.DateTimeFormat).resolvedOptions().timeZone}catch(p){}m&&
(b["X-YouTube-Time-Zone"]=m)}document.location.hostname.endsWith("youtubeeducation.com")||!c&&hc(a)||(b["X-YouTube-Ad-Signals"]=tq(zq()));return b}
function Rq(a,b){b.method="POST";b.postParams||(b.postParams={});return Sq(a,b)}
function Sq(a,b){var c=b.format||"JSON";a=Tq(a,b);var d=Uq(a,b),e=!1,f=Vq(a,function(k){if(!e){e=!0;h&&window.clearTimeout(h);var l=Dq(k),m=null,p=400<=k.status&&k.status<500,r=500<=k.status&&k.status<600;if(l||p||r)m=Wq(a,c,k,b.convertToSafeHtml);l&&(l=Xq(c,k,m));m=m||{};p=b.context||E;l?b.onSuccess&&b.onSuccess.call(p,k,m):b.onError&&b.onError.call(p,k,m);b.onFinish&&b.onFinish.call(p,k,m)}},b.method,d,b.headers,b.responseType,b.withCredentials,!1,b.onProgress);
d=b.timeout||0;if(b.onTimeout&&d>0){var g=b.onTimeout;var h=Fq(function(){e||(e=!0,f.abort(),window.clearTimeout(h),g.call(b.context||E,f))},d)}return f}
function Tq(a,b){b.includeDomain&&(a=document.location.protocol+"//"+document.location.hostname+(document.location.port?":"+document.location.port:"")+a);var c=S("XSRF_FIELD_NAME");if(b=b.urlParams)b[c]&&delete b[c],a=wq(a,b);return a}
function Uq(a,b){var c=S("XSRF_FIELD_NAME"),d=S("XSRF_TOKEN"),e=b.postBody||"",f=b.postParams,g=S("XSRF_FIELD_NAME"),h;b.headers&&(h=b.headers["Content-Type"]);b.excludeXsrf||hc(a)&&!b.withCredentials&&hc(a)!==document.location.hostname||b.method!=="POST"||h&&h!=="application/x-www-form-urlencoded"||b.postParams&&b.postParams[g]||(f||(f={}),f[c]=d);(T("ajax_parse_query_data_only_when_filled")&&f&&Object.keys(f).length>0||f)&&typeof e==="string"&&(e=uq(e),Li(e,f),e=b.postBodyFormat&&b.postBodyFormat===
"JSON"?JSON.stringify(e):nc(e));f=e||f&&!Ei(f);!Nq&&f&&b.method!=="POST"&&(Nq=!0,mq(Error("AJAX request with postData should use POST")));return e}
function Wq(a,b,c,d){var e=null;switch(b){case "JSON":try{var f=c.responseText}catch(g){throw d=Error("Error reading responseText"),d.params=a,nq(d),g;}a=c.getResponseHeader("Content-Type")||"";f&&a.indexOf("json")>=0&&(f.substring(0,5)===")]}'\n"&&(f=f.substring(5)),e=JSON.parse(f));break;case "XML":if(a=(a=c.responseXML)?Yq(a):null)e={},Pb(a.getElementsByTagName("*"),function(g){e[g.tagName]=Zq(g)})}d&&$q(e);
return e}
function $q(a){if(La(a))for(var b in a){var c;(c=b==="html_content")||(c=b.length-5,c=c>=0&&b.indexOf("_html",c)==c);if(c){c=a[b];var d=jb();c=d?d.createHTML(c):c;a[b]=new Bb(c)}else $q(a[b])}}
function Xq(a,b,c){if(b&&b.status===204)return!0;switch(a){case "JSON":return!!c;case "XML":return Number(c&&c.return_code)===0;case "RAW":return!0;default:return!!c}}
function Yq(a){return a?(a=("responseXML"in a?a.responseXML:a).getElementsByTagName("root"))&&a.length>0?a[0]:null:null}
function Zq(a){var b="";Pb(a.childNodes,function(c){b+=c.nodeValue});
return b}
function Pq(a){var b=window.location.search,c=hc(a);T("debug_handle_relative_url_for_query_forward_killswitch")||!c&&yq(a)&&(c=document.location.hostname);var d=ic(a);d=(c=c&&(c.endsWith("youtube.com")||c.endsWith("youtube-nocookie.com")))&&d&&d.startsWith("/api/");if(!c||d)return a;var e=uq(b),f={};Pb(Mq,function(g){e[g]&&(f[g]=e[g])});
return xq(a,f||{},!1)}
var Vq=Oq;var ar=[{wd:function(a){return"Cannot read property '"+a.key+"'"},
Uc:{Error:[{regexp:/(Permission denied) to access property "([^']+)"/,groups:["reason","key"]}],TypeError:[{regexp:/Cannot read property '([^']+)' of (null|undefined)/,groups:["key","value"]},{regexp:/\u65e0\u6cd5\u83b7\u53d6\u672a\u5b9a\u4e49\u6216 (null|undefined) \u5f15\u7528\u7684\u5c5e\u6027\u201c([^\u201d]+)\u201d/,groups:["value","key"]},{regexp:/\uc815\uc758\ub418\uc9c0 \uc54a\uc74c \ub610\ub294 (null|undefined) \ucc38\uc870\uc778 '([^']+)' \uc18d\uc131\uc744 \uac00\uc838\uc62c \uc218 \uc5c6\uc2b5\ub2c8\ub2e4./,
groups:["value","key"]},{regexp:/No se puede obtener la propiedad '([^']+)' de referencia nula o sin definir/,groups:["key"]},{regexp:/Unable to get property '([^']+)' of (undefined or null) reference/,groups:["key","value"]},{regexp:/(null) is not an object \(evaluating '(?:([^.]+)\.)?([^']+)'\)/,groups:["value","base","key"]}]}},{wd:function(a){return"Cannot call '"+a.key+"'"},
Uc:{TypeError:[{regexp:/(?:([^ ]+)?\.)?([^ ]+) is not a function/,groups:["base","key"]},{regexp:/([^ ]+) called on (null or undefined)/,groups:["key","value"]},{regexp:/Object (.*) has no method '([^ ]+)'/,groups:["base","key"]},{regexp:/Object doesn't support property or method '([^ ]+)'/,groups:["key"]},{regexp:/\u30aa\u30d6\u30b8\u30a7\u30af\u30c8\u306f '([^']+)' \u30d7\u30ed\u30d1\u30c6\u30a3\u307e\u305f\u306f\u30e1\u30bd\u30c3\u30c9\u3092\u30b5\u30dd\u30fc\u30c8\u3057\u3066\u3044\u307e\u305b\u3093/,
groups:["key"]},{regexp:/\uac1c\uccb4\uac00 '([^']+)' \uc18d\uc131\uc774\ub098 \uba54\uc11c\ub4dc\ub97c \uc9c0\uc6d0\ud558\uc9c0 \uc54a\uc2b5\ub2c8\ub2e4./,groups:["key"]}]}},{wd:function(a){return a.key+" is not defined"},
Uc:{ReferenceError:[{regexp:/(.*) is not defined/,groups:["key"]},{regexp:/Can't find variable: (.*)/,groups:["key"]}]}}];var dr={ib:[],cb:[{callback:br,weight:500},{callback:cr,weight:500}]};function br(a){if(a.name==="JavaException")return!0;a=a.stack;return a.includes("chrome://")||a.includes("-extension://")||a.includes("webkit-masked-url://")}
function cr(a){if(!a.stack)return!0;var b=!a.stack.includes("\n");return b&&a.stack.includes("ErrorType: ")||b&&a.stack.includes("Anonymous function (Unknown script")||a.stack.toLowerCase()==="not available"||a.fileName==="user-script"||a.fileName.startsWith("user-script:")?!0:!1}
;function er(){this.cb=[];this.ib=[]}
var fr;function gr(){if(!fr){var a=fr=new er;a.ib.length=0;a.cb.length=0;hr(a,dr)}return fr}
function hr(a,b){b.ib&&a.ib.unshift.apply(a.ib,b.ib);b.cb&&a.cb.unshift.apply(a.cb,b.cb)}
;var ir=new Ln;function jr(a){function b(){return a.charCodeAt(d++)}
var c=a.length,d=0;do{var e=kr(b);if(e===Infinity)break;var f=e>>3;switch(e&7){case 0:e=kr(b);if(f===2)return e;break;case 1:if(f===2)return;d+=8;break;case 2:e=kr(b);if(f===2)return a.substr(d,e);d+=e;break;case 5:if(f===2)return;d+=4;break;default:return}}while(d<c)}
function kr(a){var b=a(),c=b&127;if(b<128)return c;b=a();c|=(b&127)<<7;if(b<128)return c;b=a();c|=(b&127)<<14;if(b<128)return c;b=a();return b<128?c|(b&127)<<21:Infinity}
;function lr(a,b,c,d){if(a)if(Array.isArray(a)){var e=d;for(d=0;d<a.length&&!(a[d]&&(e+=mr(d,a[d],b,c),e>500));d++);d=e}else if(typeof a==="object")for(e in a){if(a[e]){var f=e;var g=a[e],h=b,k=c;f=typeof g!=="string"||f!=="clickTrackingParams"&&f!=="trackingParams"?0:(g=jr(atob(g.replace(/-/g,"+").replace(/_/g,"/"))))?mr(f+".ve",g,h,k):0;d+=f;d+=mr(e,a[e],b,c);if(d>500)break}}else c[b]=nr(a),d+=c[b].length;else c[b]=nr(a),d+=c[b].length;return d}
function mr(a,b,c,d){c+="."+a;a=nr(b);d[c]=a;return c.length+a.length}
function nr(a){try{return(typeof a==="string"?a:String(JSON.stringify(a))).substr(0,500)}catch(b){return"unable to serialize "+typeof a+" ("+b.message+")"}}
;function or(a){var b=this;this.i=void 0;this.h=!1;a.addEventListener("beforeinstallprompt",function(c){c.preventDefault();b.i=c});
a.addEventListener("appinstalled",function(){b.h=!0},{once:!0})}
function pr(){if(!E.matchMedia)return"WEB_DISPLAY_MODE_UNKNOWN";try{return E.matchMedia("(display-mode: standalone)").matches?"WEB_DISPLAY_MODE_STANDALONE":E.matchMedia("(display-mode: minimal-ui)").matches?"WEB_DISPLAY_MODE_MINIMAL_UI":E.matchMedia("(display-mode: fullscreen)").matches?"WEB_DISPLAY_MODE_FULLSCREEN":E.matchMedia("(display-mode: browser)").matches?"WEB_DISPLAY_MODE_BROWSER":"WEB_DISPLAY_MODE_UNKNOWN"}catch(a){return"WEB_DISPLAY_MODE_UNKNOWN"}}
;function qr(){this.xe=!0}
function rr(a){var b={},c=[];"USER_SESSION_ID"in gq&&c.push({key:"u",value:S("USER_SESSION_ID")});if(c=si(c))b.Authorization=c,c=a=a==null?void 0:a.sessionIndex,c===void 0&&(c=Number(S("SESSION_INDEX",0)),c=isNaN(c)?0:c),T("voice_search_auth_header_removal")||(b["X-Goog-AuthUser"]=c.toString()),"INNERTUBE_HOST_OVERRIDE"in gq||(b["X-Origin"]=window.location.origin),a===void 0&&"DELEGATED_SESSION_ID"in gq&&(b["X-Goog-PageId"]=S("DELEGATED_SESSION_ID"));return b}
;var sr={identityType:"UNAUTHENTICATED_IDENTITY_TYPE_UNKNOWN"};function tr(a,b,c,d,e){pi.set(""+a,b,{Pc:c,path:"/",domain:d===void 0?"youtube.com":d,secure:e===void 0?!1:e})}
function ur(a){return pi.get(""+a,void 0)}
function vr(a,b,c){pi.remove(""+a,b===void 0?"/":b,c===void 0?"youtube.com":c)}
function wr(){if(!pi.isEnabled())return!1;if(pi.h.cookie)return!0;pi.set("TESTCOOKIESENABLED","1",{Pc:60});if(pi.get("TESTCOOKIESENABLED")!=="1")return!1;pi.remove("TESTCOOKIESENABLED");return!0}
;var xr=I("ytglobal.prefsUserPrefsPrefs_")||{};G("ytglobal.prefsUserPrefsPrefs_",xr);function yr(){this.h=S("ALT_PREF_COOKIE_NAME","PREF");this.i=S("ALT_PREF_COOKIE_DOMAIN","youtube.com");var a=ur(this.h);a&&this.parse(a)}
var zr;function Ar(){zr||(zr=new yr);return zr}
n=yr.prototype;n.get=function(a,b){Br(a);Cr(a);a=xr[a]!==void 0?xr[a].toString():null;return a!=null?a:b?b:""};
n.set=function(a,b){Br(a);Cr(a);if(b==null)throw Error("ExpectedNotNull");xr[a]=b.toString()};
function Dr(a){return!!((Er("f"+(Math.floor(a/31)+1))||0)&1<<a%31)}
n.remove=function(a){Br(a);Cr(a);delete xr[a]};
n.clear=function(){for(var a in xr)delete xr[a]};
function Cr(a){if(/^f([1-9][0-9]*)$/.test(a))throw Error("ExpectedRegexMatch: "+a);}
function Br(a){if(!/^\w+$/.test(a))throw Error("ExpectedRegexMismatch: "+a);}
function Er(a){a=xr[a]!==void 0?xr[a].toString():null;return a!=null&&/^[A-Fa-f0-9]+$/.test(a)?parseInt(a,16):null}
n.parse=function(a){a=decodeURIComponent(a).split("&");for(var b=0;b<a.length;b++){var c=a[b].split("="),d=c[0];(c=c[1])&&(xr[d]=c.toString())}};var Fr={bluetooth:"CONN_DISCO",cellular:"CONN_CELLULAR_UNKNOWN",ethernet:"CONN_WIFI",none:"CONN_NONE",wifi:"CONN_WIFI",wimax:"CONN_CELLULAR_4G",other:"CONN_UNKNOWN",unknown:"CONN_UNKNOWN","slow-2g":"CONN_CELLULAR_2G","2g":"CONN_CELLULAR_2G","3g":"CONN_CELLULAR_3G","4g":"CONN_CELLULAR_4G"},Gr={"slow-2g":"EFFECTIVE_CONNECTION_TYPE_SLOW_2G","2g":"EFFECTIVE_CONNECTION_TYPE_2G","3g":"EFFECTIVE_CONNECTION_TYPE_3G","4g":"EFFECTIVE_CONNECTION_TYPE_4G"};
function Hr(){var a=E.navigator;return a?a.connection:void 0}
function Ir(){var a=Hr();if(a){var b=Fr[a.type||"unknown"]||"CONN_UNKNOWN";a=Fr[a.effectiveType||"unknown"]||"CONN_UNKNOWN";b==="CONN_CELLULAR_UNKNOWN"&&a!=="CONN_UNKNOWN"&&(b=a);if(b!=="CONN_UNKNOWN")return b;if(a!=="CONN_UNKNOWN")return a}}
function Jr(){var a=Hr();if(a!=null&&a.effectiveType)return Gr.hasOwnProperty(a.effectiveType)?Gr[a.effectiveType]:"EFFECTIVE_CONNECTION_TYPE_UNKNOWN"}
;function U(a){var b=D.apply(1,arguments);var c=Error.call(this,a);this.message=c.message;"stack"in c&&(this.stack=c.stack);this.args=[].concat(A(b));Object.setPrototypeOf(this,this.constructor.prototype)}
v(U,Error);function Kr(){try{return Lr(),!0}catch(a){return!1}}
function Lr(a){if(S("DATASYNC_ID")!==void 0)return S("DATASYNC_ID");throw new U("Datasync ID not set",a===void 0?"unknown":a);}
;function Mr(){}
function Nr(a,b){return vn.ab(a,0,b)}
Mr.prototype.wa=function(a,b){return this.ab(a,1,b)};
function Or(a,b){vn.ab(a,2,b)}
Mr.prototype.Yb=function(a){var b=I("yt.scheduler.instance.addImmediateJob");b?b(a):a()};var Pr=en("web_emulated_idle_callback_delay",300),Qr=1E3/60-3,Rr=[8,5,4,3,2,1,0];
function Sr(a){a=a===void 0?{}:a;K.call(this);this.i=[];this.j={};this.Z=this.h=0;this.X=this.u=!1;this.I=[];this.M=this.fa=!1;for(var b=z(Rr),c=b.next();!c.done;c=b.next())this.i[c.value]=[];this.o=0;this.jd=a.timeout||1;this.G=Qr;this.B=0;this.Da=this.Xf.bind(this);this.Xb=this.Eg.bind(this);this.Ka=this.Oe.bind(this);this.La=this.Bf.bind(this);this.Ra=this.fg.bind(this);this.na=!!window.requestIdleCallback&&!!window.cancelIdleCallback&&!T("disable_scheduler_requestIdleCallback");(this.ja=a.useRaf!==
!1&&!!window.requestAnimationFrame)&&document.addEventListener("visibilitychange",this.Da)}
v(Sr,K);n=Sr.prototype;n.Yb=function(a){var b=Va();Tr(this,a);a=Va()-b;this.u||(this.G-=a)};
n.ab=function(a,b,c){++this.Z;if(b===10)return this.Yb(a),this.Z;var d=this.Z;this.j[d]=a;this.u&&!c?this.I.push({id:d,priority:b}):(this.i[b].push(d),this.X||this.u||(this.h!==0&&Ur(this)!==this.B&&this.stop(),this.start()));return d};
n.xa=function(a){delete this.j[a]};
function Vr(a){a.I.length=0;for(var b=5;b>=0;b--)a.i[b].length=0;a.i[8].length=0;a.j={};a.stop()}
n.isHidden=function(){return!!document.hidden||!1};
function Wr(a){return!a.isHidden()&&a.ja}
function Ur(a){if(a.i[8].length){if(a.M)return 4;if(Wr(a))return 3}for(var b=5;b>=a.o;b--)if(a.i[b].length>0)return b>0?Wr(a)?3:2:1;return 0}
n.Aa=function(a){var b=I("yt.logging.errors.log");b&&b(a)};
function Tr(a,b){try{b()}catch(c){a.Aa(c)}}
function Xr(a){for(var b=z(Rr),c=b.next();!c.done;c=b.next())if(a.i[c.value].length)return!0;return!1}
n.Bf=function(a){var b=void 0;a&&(b=a.timeRemaining());this.fa=!0;Yr(this,b);this.fa=!1};
n.Eg=function(){Yr(this)};
n.Oe=function(){Zr(this)};
n.fg=function(a){this.M=!0;var b=Ur(this);b===4&&b!==this.B&&(this.stop(),this.start());Yr(this,void 0,a);this.M=!1};
n.Xf=function(){this.isHidden()||Zr(this);this.h&&(this.stop(),this.start())};
function Zr(a){a.stop();a.u=!0;for(var b=Va(),c=a.i[8];c.length;){var d=c.shift(),e=a.j[d];delete a.j[d];e&&Tr(a,e)}$r(a);a.u=!1;Xr(a)&&a.start();b=Va()-b;a.G-=b}
function $r(a){for(var b=0,c=a.I.length;b<c;b++){var d=a.I[b];a.i[d.priority].push(d.id)}a.I.length=0}
function Yr(a,b,c){a.M&&a.B===4&&a.h||a.stop();a.u=!0;b=Va()+(b||a.G);for(var d=a.i[5];d.length;){var e=d.shift(),f=a.j[e];delete a.j[e];if(f){e=a;try{f(c)}catch(l){e.Aa(l)}}}for(d=a.i[4];d.length;)c=d.shift(),f=a.j[c],delete a.j[c],f&&Tr(a,f);d=a.fa?0:1;d=a.o>d?a.o:d;if(!(Va()>=b)){do{a:{c=a;f=d;for(e=3;e>=f;e--)for(var g=c.i[e];g.length;){var h=g.shift(),k=c.j[h];delete c.j[h];if(k){c=k;break a}}c=null}c&&Tr(a,c)}while(c&&Va()<b)}a.u=!1;$r(a);a.G=Qr;Xr(a)&&a.start()}
n.start=function(){this.X=!1;if(this.h===0)switch(this.B=Ur(this),this.B){case 1:var a=this.La;this.h=this.na?window.requestIdleCallback(a,{timeout:3E3}):window.setTimeout(a,Pr);break;case 2:this.h=window.setTimeout(this.Xb,this.jd);break;case 3:this.h=window.requestAnimationFrame(this.Ra);break;case 4:this.h=window.setTimeout(this.Ka,0)}};
n.pause=function(){this.stop();this.X=!0};
n.stop=function(){if(this.h){switch(this.B){case 1:var a=this.h;this.na?window.cancelIdleCallback(a):window.clearTimeout(a);break;case 2:case 4:window.clearTimeout(this.h);break;case 3:window.cancelAnimationFrame(this.h)}this.h=0}};
n.ba=function(){Vr(this);this.stop();this.ja&&document.removeEventListener("visibilitychange",this.Da);K.prototype.ba.call(this)};var as=I("yt.scheduler.instance.timerIdMap_")||{},bs=en("kevlar_tuner_scheduler_soft_state_timer_ms",800),cs=0,ds=0;function es(){var a=I("ytglobal.schedulerInstanceInstance_");if(!a||a.J)a=new Sr(S("scheduler")||{}),G("ytglobal.schedulerInstanceInstance_",a);return a}
function gs(){hs();var a=I("ytglobal.schedulerInstanceInstance_");a&&(uc(a),G("ytglobal.schedulerInstanceInstance_",null))}
function hs(){Vr(es());for(var a in as)as.hasOwnProperty(a)&&delete as[Number(a)]}
function is(a,b,c){if(!c)return c=c===void 0,-es().ab(a,b,c);var d=window.setTimeout(function(){var e=es().ab(a,b);as[d]=e},c);
return d}
function js(a){es().Yb(a)}
function ks(a){var b=es();if(a<0)b.xa(-a);else{var c=as[a];c?(b.xa(c),delete as[a]):window.clearTimeout(a)}}
function ls(){ms()}
function ms(){window.clearTimeout(cs);es().start()}
function ns(){es().pause();window.clearTimeout(cs);cs=window.setTimeout(ls,bs)}
function ps(){window.clearTimeout(ds);ds=window.setTimeout(function(){qs(0)},bs)}
function qs(a){ps();var b=es();b.o=a;b.start()}
function rs(a){ps();var b=es();b.o>a&&(b.o=a,b.start())}
function ss(){window.clearTimeout(ds);var a=es();a.o=0;a.start()}
;function ts(){Mr.apply(this,arguments)}
v(ts,Mr);function us(){ts.instance||(ts.instance=new ts);return ts.instance}
ts.prototype.ab=function(a,b,c){c!==void 0&&Number.isNaN(Number(c))&&(c=void 0);var d=I("yt.scheduler.instance.addJob");return d?d(a,b,c):c===void 0?(a(),NaN):Fq(a,c||0)};
ts.prototype.xa=function(a){if(a===void 0||!Number.isNaN(Number(a))){var b=I("yt.scheduler.instance.cancelJob");b?b(a):window.clearTimeout(a)}};
ts.prototype.start=function(){var a=I("yt.scheduler.instance.start");a&&a()};
ts.prototype.pause=function(){var a=I("yt.scheduler.instance.pause");a&&a()};
var vn=us();
I("yt.scheduler.initialized")||(G("yt.scheduler.instance.dispose",gs),G("yt.scheduler.instance.addJob",is),G("yt.scheduler.instance.addImmediateJob",js),G("yt.scheduler.instance.cancelJob",ks),G("yt.scheduler.instance.cancelAllJobs",hs),G("yt.scheduler.instance.start",ms),G("yt.scheduler.instance.pause",ns),G("yt.scheduler.instance.setPriorityThreshold",qs),G("yt.scheduler.instance.enablePriorityThreshold",rs),G("yt.scheduler.instance.clearPriorityThreshold",ss),G("yt.scheduler.initialized",!0));function vs(a){var b=new Wn;this.h=(a=b.isAvailable()?a?new Xn(b,a):b:null)?new Rn(a):null;this.i=document.domain||window.location.hostname}
vs.prototype.set=function(a,b,c,d){c=c||31104E3;this.remove(a);if(this.h)try{this.h.set(a,b,Date.now()+c*1E3);return}catch(f){}var e="";if(d)try{e=escape((new bl).serialize(b))}catch(f){return}else e=escape(b);tr(a,e,c,this.i)};
vs.prototype.get=function(a,b){var c=void 0,d=!this.h;if(!d)try{c=this.h.get(a)}catch(e){d=!0}if(d&&(c=ur(a))&&(c=unescape(c),b))try{c=JSON.parse(c)}catch(e){this.remove(a),c=void 0}return c};
vs.prototype.remove=function(a){this.h&&this.h.remove(a);vr(a,"/",this.i)};var ws=function(){var a;return function(){a||(a=new vs("ytidb"));return a}}();
function xs(){var a;return(a=ws())==null?void 0:a.get("LAST_RESULT_ENTRY_KEY",!0)}
;var ys=[],zs,As=!1;function Bs(){var a={};for(zs=new Cs(a.handleError===void 0?Ds:a.handleError,a.logEvent===void 0?Es:a.logEvent);ys.length>0;)switch(a=ys.shift(),a.type){case "ERROR":zs.Aa(a.payload);break;case "EVENT":zs.logEvent(a.eventType,a.payload)}}
function Fs(a){As||(zs?zs.Aa(a):(ys.push({type:"ERROR",payload:a}),ys.length>10&&ys.shift()))}
function Gs(a,b){As||(zs?zs.logEvent(a,b):(ys.push({type:"EVENT",eventType:a,payload:b}),ys.length>10&&ys.shift()))}
;function Hs(a){if(a.indexOf(":")>=0)throw Error("Database name cannot contain ':'");}
function Is(a){return a.substr(0,a.indexOf(":"))||a}
;var Js=wd||xd;function Ks(a){var b=fd();return b?b.toLowerCase().indexOf(a)>=0:!1}
;var Ls={},Ms=(Ls.AUTH_INVALID="No user identifier specified.",Ls.EXPLICIT_ABORT="Transaction was explicitly aborted.",Ls.IDB_NOT_SUPPORTED="IndexedDB is not supported.",Ls.MISSING_INDEX="Index not created.",Ls.MISSING_OBJECT_STORES="Object stores not created.",Ls.DB_DELETED_BY_MISSING_OBJECT_STORES="Database is deleted because expected object stores were not created.",Ls.DB_REOPENED_BY_MISSING_OBJECT_STORES="Database is reopened because expected object stores were not created.",Ls.UNKNOWN_ABORT="Transaction was aborted for unknown reasons.",
Ls.QUOTA_EXCEEDED="The current transaction exceeded its quota limitations.",Ls.QUOTA_MAYBE_EXCEEDED="The current transaction may have failed because of exceeding quota limitations.",Ls.EXECUTE_TRANSACTION_ON_CLOSED_DB="Can't start a transaction on a closed database",Ls.INCOMPATIBLE_DB_VERSION="The binary is incompatible with the database version",Ls),Ns={},Os=(Ns.AUTH_INVALID="ERROR",Ns.EXECUTE_TRANSACTION_ON_CLOSED_DB="WARNING",Ns.EXPLICIT_ABORT="IGNORED",Ns.IDB_NOT_SUPPORTED="ERROR",Ns.MISSING_INDEX=
"WARNING",Ns.MISSING_OBJECT_STORES="ERROR",Ns.DB_DELETED_BY_MISSING_OBJECT_STORES="WARNING",Ns.DB_REOPENED_BY_MISSING_OBJECT_STORES="WARNING",Ns.QUOTA_EXCEEDED="WARNING",Ns.QUOTA_MAYBE_EXCEEDED="WARNING",Ns.UNKNOWN_ABORT="WARNING",Ns.INCOMPATIBLE_DB_VERSION="WARNING",Ns),Ps={},Qs=(Ps.AUTH_INVALID=!1,Ps.EXECUTE_TRANSACTION_ON_CLOSED_DB=!1,Ps.EXPLICIT_ABORT=!1,Ps.IDB_NOT_SUPPORTED=!1,Ps.MISSING_INDEX=!1,Ps.MISSING_OBJECT_STORES=!1,Ps.DB_DELETED_BY_MISSING_OBJECT_STORES=!1,Ps.DB_REOPENED_BY_MISSING_OBJECT_STORES=
!1,Ps.QUOTA_EXCEEDED=!1,Ps.QUOTA_MAYBE_EXCEEDED=!0,Ps.UNKNOWN_ABORT=!0,Ps.INCOMPATIBLE_DB_VERSION=!1,Ps);function Rs(a,b,c,d,e){b=b===void 0?{}:b;c=c===void 0?Ms[a]:c;d=d===void 0?Os[a]:d;e=e===void 0?Qs[a]:e;U.call(this,c,Object.assign({},{name:"YtIdbKnownError",isSw:self.document===void 0,isIframe:self!==self.top,type:a},b));this.type=a;this.message=c;this.level=d;this.h=e;Object.setPrototypeOf(this,Rs.prototype)}
v(Rs,U);function Ss(a,b){Rs.call(this,"MISSING_OBJECT_STORES",{expectedObjectStores:b,foundObjectStores:a},Ms.MISSING_OBJECT_STORES);Object.setPrototypeOf(this,Ss.prototype)}
v(Ss,Rs);function Ts(a,b){var c=Error.call(this);this.message=c.message;"stack"in c&&(this.stack=c.stack);this.index=a;this.objectStore=b;Object.setPrototypeOf(this,Ts.prototype)}
v(Ts,Error);var Us=["The database connection is closing","Can't start a transaction on a closed database","A mutation operation was attempted on a database that did not allow mutations"];
function Vs(a,b,c,d){b=Is(b);var e=a instanceof Error?a:Error("Unexpected error: "+a);if(e instanceof Rs)return e;a={objectStoreNames:c,dbName:b,dbVersion:d};if(e.name==="QuotaExceededError")return new Rs("QUOTA_EXCEEDED",a);if(yd&&e.name==="UnknownError")return new Rs("QUOTA_MAYBE_EXCEEDED",a);if(e instanceof Ts)return new Rs("MISSING_INDEX",Object.assign({},a,{objectStore:e.objectStore,index:e.index}));if(e.name==="InvalidStateError"&&Us.some(function(f){return e.message.includes(f)}))return new Rs("EXECUTE_TRANSACTION_ON_CLOSED_DB",
a);
if(e.name==="AbortError")return new Rs("UNKNOWN_ABORT",a,e.message);e.args=[Object.assign({},a,{name:"IdbError",he:e.name})];e.level="WARNING";return e}
function Ws(a,b,c){var d=xs();return new Rs("IDB_NOT_SUPPORTED",{context:{caller:a,publicName:b,version:c,hasSucceededOnce:d==null?void 0:d.hasSucceededOnce}})}
;function Xs(a){if(!a)throw Error();throw a;}
function Ys(a){return a}
function Zs(a){this.h=a}
function $s(a){function b(e){if(d.state.status==="PENDING"){d.state={status:"REJECTED",reason:e};e=z(d.i);for(var f=e.next();!f.done;f=e.next())f=f.value,f()}}
function c(e){if(d.state.status==="PENDING"){d.state={status:"FULFILLED",value:e};e=z(d.h);for(var f=e.next();!f.done;f=e.next())f=f.value,f()}}
var d=this;this.state={status:"PENDING"};this.h=[];this.i=[];a=a.h;try{a(c,b)}catch(e){b(e)}}
$s.all=function(a){return new $s(new Zs(function(b,c){var d=[],e=a.length;e===0&&b(d);for(var f={Lb:0};f.Lb<a.length;f={Lb:f.Lb},++f.Lb)$s.resolve(a[f.Lb]).then(function(g){return function(h){d[g.Lb]=h;e--;e===0&&b(d)}}(f)).catch(function(g){c(g)})}))};
$s.resolve=function(a){return new $s(new Zs(function(b,c){a instanceof $s?a.then(b,c):b(a)}))};
$s.reject=function(a){return new $s(new Zs(function(b,c){c(a)}))};
$s.prototype.then=function(a,b){var c=this,d=a!=null?a:Ys,e=b!=null?b:Xs;return new $s(new Zs(function(f,g){c.state.status==="PENDING"?(c.h.push(function(){at(c,c,d,f,g)}),c.i.push(function(){bt(c,c,e,f,g)})):c.state.status==="FULFILLED"?at(c,c,d,f,g):c.state.status==="REJECTED"&&bt(c,c,e,f,g)}))};
$s.prototype.catch=function(a){return this.then(void 0,a)};
function at(a,b,c,d,e){try{if(a.state.status!=="FULFILLED")throw Error("calling handleResolve before the promise is fulfilled.");var f=c(a.state.value);f instanceof $s?ct(a,b,f,d,e):d(f)}catch(g){e(g)}}
function bt(a,b,c,d,e){try{if(a.state.status!=="REJECTED")throw Error("calling handleReject before the promise is rejected.");var f=c(a.state.reason);f instanceof $s?ct(a,b,f,d,e):d(f)}catch(g){e(g)}}
function ct(a,b,c,d,e){b===c?e(new TypeError("Circular promise chain detected.")):c.then(function(f){f instanceof $s?ct(a,b,f,d,e):d(f)},function(f){e(f)})}
;function dt(a,b,c){function d(){c(a.error);f()}
function e(){b(a.result);f()}
function f(){try{a.removeEventListener("success",e),a.removeEventListener("error",d)}catch(g){}}
a.addEventListener("success",e);a.addEventListener("error",d)}
function et(a){return new Promise(function(b,c){dt(a,b,c)})}
function ft(a){return new $s(new Zs(function(b,c){dt(a,b,c)}))}
;function gt(a,b){return new $s(new Zs(function(c,d){function e(){var f=a?b(a):null;f?f.then(function(g){a=g;e()},d):c()}
e()}))}
;var ht=window,V=ht.ytcsi&&ht.ytcsi.now?ht.ytcsi.now:ht.performance&&ht.performance.timing&&ht.performance.now&&ht.performance.timing.navigationStart?function(){return ht.performance.timing.navigationStart+ht.performance.now()}:function(){return(new Date).getTime()};function jt(a,b){this.h=a;this.options=b;this.transactionCount=0;this.j=Math.round(V());this.i=!1}
function kt(){return T("idb_immediate_commit")}
n=jt.prototype;n.add=function(a,b,c){return lt(this,[a],{mode:"readwrite",pa:!0,commit:kt()},function(d){return d.objectStore(a).add(b,c)})};
n.clear=function(a){return lt(this,[a],{mode:"readwrite",pa:!0},function(b){return b.objectStore(a).clear()})};
n.close=function(){this.h.close();var a;((a=this.options)==null?0:a.closed)&&this.options.closed()};
n.count=function(a,b){return lt(this,[a],{mode:"readonly",pa:!0,commit:kt()},function(c){return c.objectStore(a).count(b)})};
function mt(a,b,c){a=a.h.createObjectStore(b,c);return new nt(a)}
n.delete=function(a,b){return lt(this,[a],{mode:"readwrite",pa:!0,commit:kt()&&!(b instanceof IDBKeyRange)},function(c){return c.objectStore(a).delete(b)})};
n.get=function(a,b){return lt(this,[a],{mode:"readonly",pa:!0,commit:kt()},function(c){return c.objectStore(a).get(b)})};
function ot(a,b,c){return lt(a,[b],{mode:"readwrite",pa:!0,commit:kt()},function(d){d=d.objectStore(b);return ft(d.h.put(c,void 0))})}
n.objectStoreNames=function(){return Array.from(this.h.objectStoreNames)};
function lt(a,b,c,d){var e,f,g,h,k,l,m,p,r,t,w,y;return C(function(x){switch(x.h){case 1:var H={mode:"readonly",pa:!1,tag:"IDB_TRANSACTION_TAG_UNKNOWN"};typeof c==="string"?H.mode=c:Object.assign(H,c);e=H;a.transactionCount++;f=e.pa?3:1;g=0;case 2:if(h){x.v(4);break}g++;k=Math.round(V());x.u(5);l=a.h.transaction(b,e.mode);H=x.yield;var F=!!e.commit;var W=new pt(l);F=qt(W,d,F);return H.call(x,F,7);case 7:return m=x.i,p=Math.round(V()),rt(a,k,p,g,void 0,b.join(),e),x.return(m);case 5:r=x.j();t=Math.round(V());
w=Vs(r,a.h.name,b.join(),a.h.version);if((y=w instanceof Rs&&!w.h)||g>=f)rt(a,k,t,g,w,b.join(),e),h=w;x.v(2);break;case 4:return x.return(Promise.reject(h))}})}
function rt(a,b,c,d,e,f,g){b=c-b;e?(e instanceof Rs&&(e.type==="QUOTA_EXCEEDED"||e.type==="QUOTA_MAYBE_EXCEEDED")&&Gs("QUOTA_EXCEEDED",{dbName:Is(a.h.name),objectStoreNames:f,transactionCount:a.transactionCount,transactionMode:g.mode}),e instanceof Rs&&e.type==="UNKNOWN_ABORT"&&(c-=a.j,c<0&&c>=2147483648&&(c=0),Gs("TRANSACTION_UNEXPECTEDLY_ABORTED",{objectStoreNames:f,transactionDuration:b,transactionCount:a.transactionCount,dbDuration:c}),a.i=!0),st(a,!1,d,f,b,g.tag),Fs(e)):st(a,!0,d,f,b,g.tag)}
function st(a,b,c,d,e,f){Gs("TRANSACTION_ENDED",{objectStoreNames:d,connectionHasUnknownAbortedTransaction:a.i,duration:e,isSuccessful:b,tryCount:c,tag:f===void 0?"IDB_TRANSACTION_TAG_UNKNOWN":f})}
n.getName=function(){return this.h.name};
function nt(a){this.h=a}
n=nt.prototype;n.add=function(a,b){return ft(this.h.add(a,b))};
n.autoIncrement=function(){return this.h.autoIncrement};
n.clear=function(){return ft(this.h.clear()).then(function(){})};
function tt(a,b,c){a.h.createIndex(b,c,{unique:!1})}
n.count=function(a){return ft(this.h.count(a))};
function ut(a,b){return vt(a,{query:b},function(c){return c.delete().then(function(){return wt(c)})}).then(function(){})}
n.delete=function(a){return a instanceof IDBKeyRange?ut(this,a):ft(this.h.delete(a))};
n.get=function(a){return ft(this.h.get(a))};
n.index=function(a){try{return new xt(this.h.index(a))}catch(b){if(b instanceof Error&&b.name==="NotFoundError")throw new Ts(a,this.h.name);throw b;}};
n.getName=function(){return this.h.name};
n.keyPath=function(){return this.h.keyPath};
function vt(a,b,c){a=a.h.openCursor(b.query,b.direction);return zt(a).then(function(d){return gt(d,c)})}
function pt(a){var b=this;this.h=a;this.i=new Map;this.aborted=!1;this.done=new Promise(function(c,d){b.h.addEventListener("complete",function(){c()});
b.h.addEventListener("error",function(e){e.currentTarget===e.target&&d(b.h.error)});
b.h.addEventListener("abort",function(){var e=b.h.error;if(e)d(e);else if(!b.aborted){e=Rs;for(var f=b.h.objectStoreNames,g=[],h=0;h<f.length;h++){var k=f.item(h);if(k===null)throw Error("Invariant: item in DOMStringList is null");g.push(k)}e=new e("UNKNOWN_ABORT",{objectStoreNames:g.join(),dbName:b.h.db.name,mode:b.h.mode});d(e)}})})}
function qt(a,b,c){var d=new Promise(function(e,f){try{var g=b(a);c&&a.commit();g.then(function(h){e(h)}).catch(f)}catch(h){f(h),a.abort()}});
return Promise.all([d,a.done]).then(function(e){return z(e).next().value})}
pt.prototype.abort=function(){this.h.abort();this.aborted=!0;throw new Rs("EXPLICIT_ABORT");};
pt.prototype.commit=function(){if(!this.aborted){var a,b;(b=(a=this.h).commit)==null||b.call(a)}};
pt.prototype.objectStore=function(a){a=this.h.objectStore(a);var b=this.i.get(a);b||(b=new nt(a),this.i.set(a,b));return b};
function xt(a){this.h=a}
n=xt.prototype;n.count=function(a){return ft(this.h.count(a))};
n.delete=function(a){return At(this,{query:a},function(b){return b.delete().then(function(){return wt(b)})})};
n.get=function(a){return ft(this.h.get(a))};
n.keyPath=function(){return this.h.keyPath};
n.unique=function(){return this.h.unique};
function At(a,b,c){a=a.h.openCursor(b.query===void 0?null:b.query,b.direction===void 0?"next":b.direction);return zt(a).then(function(d){return gt(d,c)})}
function Bt(a,b){this.request=a;this.cursor=b}
function zt(a){return ft(a).then(function(b){return b?new Bt(a,b):null})}
function wt(a){a.cursor.continue(void 0);return zt(a.request)}
Bt.prototype.delete=function(){return ft(this.cursor.delete()).then(function(){})};
Bt.prototype.getValue=function(){return this.cursor.value};
Bt.prototype.update=function(a){return ft(this.cursor.update(a))};function Ct(a,b,c){return new Promise(function(d,e){function f(){r||(r=new jt(g.result,{closed:p}));return r}
var g=b!==void 0?self.indexedDB.open(a,b):self.indexedDB.open(a);var h=c.Se,k=c.blocking,l=c.Cg,m=c.upgrade,p=c.closed,r;g.addEventListener("upgradeneeded",function(t){try{if(t.newVersion===null)throw Error("Invariant: newVersion on IDbVersionChangeEvent is null");if(g.transaction===null)throw Error("Invariant: transaction on IDbOpenDbRequest is null");t.dataLoss&&t.dataLoss!=="none"&&Gs("IDB_DATA_CORRUPTED",{reason:t.dataLossMessage||"unknown reason",dbName:Is(a)});var w=f(),y=new pt(g.transaction);
m&&m(w,function(x){return t.oldVersion<x&&t.newVersion>=x},y);
y.done.catch(function(x){e(x)})}catch(x){e(x)}});
g.addEventListener("success",function(){var t=g.result;k&&t.addEventListener("versionchange",function(){k(f())});
t.addEventListener("close",function(){Gs("IDB_UNEXPECTEDLY_CLOSED",{dbName:Is(a),dbVersion:t.version});l&&l()});
d(f())});
g.addEventListener("error",function(){e(g.error)});
h&&g.addEventListener("blocked",function(){h()})})}
function Dt(a,b,c){c=c===void 0?{}:c;return Ct(a,b,c)}
function Et(a,b){b=b===void 0?{}:b;var c,d,e,f;return C(function(g){if(g.h==1)return g.u(2),c=self.indexedDB.deleteDatabase(a),d=b,(e=d.Se)&&c.addEventListener("blocked",function(){e()}),g.yield(et(c),4);
if(g.h!=2)return g.B(0);f=g.j();throw Vs(f,a,"",-1);})}
;function Ft(a,b){this.name=a;this.options=b;this.j=!0;this.u=this.o=0}
Ft.prototype.i=function(a,b,c){c=c===void 0?{}:c;return Dt(a,b,c)};
Ft.prototype.delete=function(a){a=a===void 0?{}:a;return Et(this.name,a)};
function Gt(a,b){return new Rs("INCOMPATIBLE_DB_VERSION",{dbName:a.name,oldVersion:a.options.version,newVersion:b})}
function Ht(a,b){if(!b)throw Ws("openWithToken",Is(a.name));return a.open()}
Ft.prototype.open=function(){function a(){var f,g,h,k,l,m,p,r,t,w;return C(function(y){switch(y.h){case 1:return g=(f=Error().stack)!=null?f:"",y.u(2),y.yield(c.i(c.name,c.options.version,e),4);case 4:for(var x=h=y.i,H=c.options,F=[],W=z(Object.keys(H.Rb)),ma=W.next();!ma.done;ma=W.next()){ma=ma.value;var ja=H.Rb[ma],Od=ja.gg===void 0?Number.MAX_VALUE:ja.gg;!(x.h.version>=ja.Zb)||x.h.version>=Od||x.h.objectStoreNames.contains(ma)||F.push(ma)}k=F;if(k.length===0){y.v(5);break}l=Object.keys(c.options.Rb);
m=h.objectStoreNames();if(c.u<en("ytidb_reopen_db_retries",0))return c.u++,h.close(),Fs(new Rs("DB_REOPENED_BY_MISSING_OBJECT_STORES",{dbName:c.name,expectedObjectStores:l,foundObjectStores:m})),y.return(a());if(!(c.o<en("ytidb_remake_db_retries",1))){y.v(6);break}c.o++;return y.yield(c.delete(),7);case 7:return Fs(new Rs("DB_DELETED_BY_MISSING_OBJECT_STORES",{dbName:c.name,expectedObjectStores:l,foundObjectStores:m})),y.return(a());case 6:throw new Ss(m,l);case 5:return y.return(h);case 2:p=y.j();
if(p instanceof DOMException?p.name!=="VersionError":"DOMError"in self&&p instanceof DOMError?p.name!=="VersionError":!(p instanceof Object&&"message"in p)||p.message!=="An attempt was made to open a database using a lower version than the existing version."){y.v(8);break}return y.yield(c.i(c.name,void 0,Object.assign({},e,{upgrade:void 0})),9);case 9:r=y.i;t=r.h.version;if(c.options.version!==void 0&&t>c.options.version+1)throw r.close(),c.j=!1,Gt(c,t);return y.return(r);case 8:throw b(),p instanceof
Error&&!T("ytidb_async_stack_killswitch")&&(p.stack=p.stack+"\n"+g.substring(g.indexOf("\n")+1)),Vs(p,c.name,"",(w=c.options.version)!=null?w:-1);}})}
function b(){c.h===d&&(c.h=void 0)}
var c=this;if(!this.j)throw Gt(this);if(this.h)return this.h;var d,e={blocking:function(f){f.close()},
closed:b,Cg:b,upgrade:this.options.upgrade};return this.h=d=a()};var It=new Ft("YtIdbMeta",{Rb:{databases:{Zb:1}},upgrade:function(a,b){b(1)&&mt(a,"databases",{keyPath:"actualName"})}});
function Jt(a,b){var c;return C(function(d){if(d.h==1)return d.yield(Ht(It,b),2);c=d.i;return d.return(lt(c,["databases"],{pa:!0,mode:"readwrite"},function(e){var f=e.objectStore("databases");return f.get(a.actualName).then(function(g){if(g?a.actualName!==g.actualName||a.publicName!==g.publicName||a.userIdentifier!==g.userIdentifier:1)return ft(f.h.put(a,void 0)).then(function(){})})}))})}
function Kt(a,b){var c;return C(function(d){if(d.h==1)return a?d.yield(Ht(It,b),2):d.return();c=d.i;return d.return(c.delete("databases",a))})}
function Lt(a,b){var c,d;return C(function(e){return e.h==1?(c=[],e.yield(Ht(It,b),2)):e.h!=3?(d=e.i,e.yield(lt(d,["databases"],{pa:!0,mode:"readonly"},function(f){c.length=0;return vt(f.objectStore("databases"),{},function(g){a(g.getValue())&&c.push(g.getValue());return wt(g)})}),3)):e.return(c)})}
function Mt(a){return Lt(function(b){return b.publicName==="LogsDatabaseV2"&&b.userIdentifier!==void 0},a)}
function Nt(a,b,c){return Lt(function(d){return c?d.userIdentifier!==void 0&&!a.includes(d.userIdentifier)&&c.includes(d.publicName):d.userIdentifier!==void 0&&!a.includes(d.userIdentifier)},b)}
function Ot(a){var b,c;return C(function(d){if(d.h==1)return b=Lr("YtIdbMeta hasAnyMeta other"),d.yield(Lt(function(e){return e.userIdentifier!==void 0&&e.userIdentifier!==b},a),2);
c=d.i;return d.return(c.length>0)})}
;var Pt,Qt=new function(){}(new function(){});
function Rt(){var a,b,c;return C(function(d){switch(d.h){case 1:a=xs();if((b=a)==null?0:b.hasSucceededOnce)return d.return(!0);var e;if(e=Js)e=/WebKit\/([0-9]+)/.exec(fd()),e=!!(e&&parseInt(e[1],10)>=600);e&&(e=/WebKit\/([0-9]+)/.exec(fd()),e=!(e&&parseInt(e[1],10)>=602));if(!(e=e||sd)){try{e=self;var f=!!(e.indexedDB&&e.IDBIndex&&e.IDBKeyRange&&e.IDBObjectStore)}catch(g){f=!1}e=!f}if(e||!("IDBTransaction"in self&&"objectStoreNames"in IDBTransaction.prototype))return d.return(!1);d.u(2);c={actualName:"yt-idb-test-do-not-use",
publicName:"yt-idb-test-do-not-use",userIdentifier:void 0};return d.yield(Jt(c,Qt),4);case 4:return d.yield(Kt("yt-idb-test-do-not-use",Qt),5);case 5:return d.return(!0);case 2:return d.j(),d.return(!1)}})}
function St(){if(Pt!==void 0)return Pt;As=!0;return Pt=Rt().then(function(a){As=!1;var b;if((b=ws())!=null&&b.h){var c;b={hasSucceededOnce:((c=xs())==null?void 0:c.hasSucceededOnce)||a};var d;(d=ws())==null||d.set("LAST_RESULT_ENTRY_KEY",b,2592E3,!0)}return a})}
function Tt(){return I("ytglobal.idbToken_")||void 0}
function Ut(){var a=Tt();return a?Promise.resolve(a):St().then(function(b){b?(G("ytglobal.idbToken_",Qt),b=Qt):b=void 0;return b})}
;var Vt=0;function Wt(a,b){Vt||(Vt=vn.wa(function(){var c,d,e,f,g;return C(function(h){switch(h.h){case 1:return h.yield(Ut(),2);case 2:c=h.i;if(!c)return h.return();d=!0;h.u(3);return h.yield(Nt(a,c,b),5);case 5:e=h.i;if(!e.length){d=!1;h.v(6);break}f=e[0];return h.yield(Et(f.actualName),7);case 7:return h.yield(Kt(f.actualName,c),6);case 6:h.B(4);break;case 3:g=h.j(),Fs(g),d=!1;case 4:vn.xa(Vt),Vt=0,d&&Wt(a,b),h.o()}})}))}
function Xt(){var a;return C(function(b){return b.h==1?b.yield(Ut(),2):(a=b.i)?b.return(Ot(a)):b.return(!1)})}
new Il;function Yt(a){if(!Kr())throw a=new Rs("AUTH_INVALID",{dbName:a}),Fs(a),a;var b=Lr();return{actualName:a+":"+b,publicName:a,userIdentifier:b}}
function Zt(a,b,c,d){var e,f,g,h,k,l;return C(function(m){switch(m.h){case 1:return f=(e=Error().stack)!=null?e:"",m.yield(Ut(),2);case 2:g=m.i;if(!g)throw h=Ws("openDbImpl",a,b),T("ytidb_async_stack_killswitch")||(h.stack=h.stack+"\n"+f.substring(f.indexOf("\n")+1)),Fs(h),h;Hs(a);k=c?{actualName:a,publicName:a,userIdentifier:void 0}:Yt(a);m.u(3);return m.yield(Jt(k,g),5);case 5:return m.yield(Dt(k.actualName,b,d),6);case 6:return m.return(m.i);case 3:return l=m.j(),m.u(7),m.yield(Kt(k.actualName,
g),9);case 9:m.B(8);break;case 7:m.j();case 8:throw l;}})}
function $t(a,b,c){c=c===void 0?{}:c;return Zt(a,b,!1,c)}
function au(a,b,c){c=c===void 0?{}:c;return Zt(a,b,!0,c)}
function bu(a,b){b=b===void 0?{}:b;var c,d;return C(function(e){if(e.h==1)return e.yield(Ut(),2);if(e.h!=3){c=e.i;if(!c)return e.return();Hs(a);d=Yt(a);return e.yield(Et(d.actualName,b),3)}return e.yield(Kt(d.actualName,c),0)})}
function cu(a,b,c){a=a.map(function(d){return C(function(e){return e.h==1?e.yield(Et(d.actualName,b),2):e.yield(Kt(d.actualName,c),0)})});
return Promise.all(a).then(function(){})}
function du(){var a=a===void 0?{}:a;var b,c;return C(function(d){if(d.h==1)return d.yield(Ut(),2);if(d.h!=3){b=d.i;if(!b)return d.return();Hs("LogsDatabaseV2");return d.yield(Mt(b),3)}c=d.i;return d.yield(cu(c,a,b),0)})}
function eu(a,b){b=b===void 0?{}:b;var c;return C(function(d){if(d.h==1)return d.yield(Ut(),2);if(d.h!=3){c=d.i;if(!c)return d.return();Hs(a);return d.yield(Et(a,b),3)}return d.yield(Kt(a,c),0)})}
;function fu(a,b){Ft.call(this,a,b);this.options=b;Hs(a)}
v(fu,Ft);function gu(a,b){var c;return function(){c||(c=new fu(a,b));return c}}
fu.prototype.i=function(a,b,c){c=c===void 0?{}:c;return(this.options.shared?au:$t)(a,b,Object.assign({},c))};
fu.prototype.delete=function(a){a=a===void 0?{}:a;return(this.options.shared?eu:bu)(this.name,a)};
function hu(a,b){return gu(a,b)}
;var iu={},ju=hu("ytGcfConfig",{Rb:(iu.coldConfigStore={Zb:1},iu.hotConfigStore={Zb:1},iu),shared:!1,upgrade:function(a,b){b(1)&&(tt(mt(a,"hotConfigStore",{keyPath:"key",autoIncrement:!0}),"hotTimestampIndex","timestamp"),tt(mt(a,"coldConfigStore",{keyPath:"key",autoIncrement:!0}),"coldTimestampIndex","timestamp"))},
version:1});function ku(a){return Ht(ju(),a)}
function lu(a,b,c){var d,e,f;return C(function(g){switch(g.h){case 1:return d={config:a,hashData:b,timestamp:V()},g.yield(ku(c),2);case 2:return e=g.i,g.yield(e.clear("hotConfigStore"),3);case 3:return g.yield(ot(e,"hotConfigStore",d),4);case 4:return f=g.i,g.return(f)}})}
function mu(a,b,c,d){var e,f,g;return C(function(h){switch(h.h){case 1:return e={config:a,hashData:b,configData:c,timestamp:V()},h.yield(ku(d),2);case 2:return f=h.i,h.yield(f.clear("coldConfigStore"),3);case 3:return h.yield(ot(f,"coldConfigStore",e),4);case 4:return g=h.i,h.return(g)}})}
function nu(a){var b,c;return C(function(d){return d.h==1?d.yield(ku(a),2):d.h!=3?(b=d.i,c=void 0,d.yield(lt(b,["coldConfigStore"],{mode:"readwrite",pa:!0},function(e){return At(e.objectStore("coldConfigStore").index("coldTimestampIndex"),{direction:"prev"},function(f){c=f.getValue()})}),3)):d.return(c)})}
function ou(a){var b,c;return C(function(d){return d.h==1?d.yield(ku(a),2):d.h!=3?(b=d.i,c=void 0,d.yield(lt(b,["hotConfigStore"],{mode:"readwrite",pa:!0},function(e){return At(e.objectStore("hotConfigStore").index("hotTimestampIndex"),{direction:"prev"},function(f){c=f.getValue()})}),3)):d.return(c)})}
;function pu(){K.call(this);this.i=[];this.h=[];var a=I("yt.gcf.config.hotUpdateCallbacks");a?(this.i=[].concat(A(a)),this.h=a):(this.h=[],G("yt.gcf.config.hotUpdateCallbacks",this.h))}
v(pu,K);pu.prototype.ba=function(){for(var a=z(this.i),b=a.next();!b.done;b=a.next()){var c=this.h;b=c.indexOf(b.value);b>=0&&c.splice(b,1)}this.i.length=0;K.prototype.ba.call(this)};function qu(){this.h=0;this.i=new pu}
function ru(){var a;return(a=I("yt.gcf.config.hotConfigGroup"))!=null?a:S("RAW_HOT_CONFIG_GROUP")}
function su(a,b,c){var d,e,f;return C(function(g){switch(g.h){case 1:if(!T("start_client_gcf")){g.v(0);break}c&&(a.j=c,G("yt.gcf.config.hotConfigGroup",a.j||null));a.o(b);d=Tt();if(!d){g.v(3);break}if(c){g.v(4);break}return g.yield(ou(d),5);case 5:e=g.i,c=(f=e)==null?void 0:f.config;case 4:return g.yield(lu(c,b,d),3);case 3:if(c)for(var h=c,k=z(a.i.h),l=k.next();!l.done;l=k.next())l=l.value,l(h);g.o()}})}
function tu(a,b,c){var d,e,f,g;return C(function(h){if(h.h==1){if(!T("start_client_gcf"))return h.v(0);a.coldHashData=b;G("yt.gcf.config.coldHashData",a.coldHashData||null);return(d=Tt())?c?h.v(4):h.yield(nu(d),5):h.v(0)}h.h!=4&&(e=h.i,c=(f=e)==null?void 0:f.config);if(!c)return h.v(0);g=c.configData;return h.yield(mu(c,b,g,d),0)})}
function uu(){if(!qu.instance){var a=new qu;qu.instance=a}a=qu.instance;var b=V()-a.h;if(!(a.h!==0&&b<en("send_config_hash_timer"))){b=I("yt.gcf.config.coldConfigData");var c=I("yt.gcf.config.hotHashData"),d=I("yt.gcf.config.coldHashData");b&&c&&d&&(a.h=V());return{coldConfigData:b,hotHashData:c,coldHashData:d}}}
qu.prototype.o=function(a){this.hotHashData=a;G("yt.gcf.config.hotHashData",this.hotHashData||null)};function vu(){return"INNERTUBE_API_KEY"in gq&&"INNERTUBE_API_VERSION"in gq}
function wu(){return{innertubeApiKey:S("INNERTUBE_API_KEY"),innertubeApiVersion:S("INNERTUBE_API_VERSION"),Df:S("INNERTUBE_CONTEXT_CLIENT_CONFIG_INFO"),Zd:S("INNERTUBE_CONTEXT_CLIENT_NAME","WEB"),ij:S("INNERTUBE_CONTEXT_CLIENT_NAME",1),innertubeContextClientVersion:S("INNERTUBE_CONTEXT_CLIENT_VERSION"),Ff:S("INNERTUBE_CONTEXT_HL"),Ef:S("INNERTUBE_CONTEXT_GL"),Gf:S("INNERTUBE_HOST_OVERRIDE")||"",Hf:!!S("INNERTUBE_USE_THIRD_PARTY_AUTH",!1),jj:!!S("INNERTUBE_OMIT_API_KEY_WHEN_AUTH_HEADER_IS_PRESENT",
!1),appInstallData:S("SERIALIZED_CLIENT_CONFIG_DATA")}}
function xu(a){var b={client:{hl:a.Ff,gl:a.Ef,clientName:a.Zd,clientVersion:a.innertubeContextClientVersion,configInfo:a.Df}};navigator.userAgent&&(b.client.userAgent=String(navigator.userAgent));var c=E.devicePixelRatio;c&&c!=1&&(b.client.screenDensityFloat=String(c));c=S("EXPERIMENTS_TOKEN","");c!==""&&(b.client.experimentsToken=c);c=Kq();c.length>0&&(b.request={internalExperimentFlags:c});c=a.Zd;if((c==="WEB"||c==="MWEB"||c===1||c===2)&&b){var d;b.client.mainAppWebInfo=(d=b.client.mainAppWebInfo)!=
null?d:{};b.client.mainAppWebInfo.webDisplayMode=pr()}(d=I("yt.embedded_player.embed_url"))&&b&&(b.thirdParty={embedUrl:d});var e;if(T("web_log_memory_total_kbytes")&&((e=E.navigator)==null?0:e.deviceMemory)){var f;e=(f=E.navigator)==null?void 0:f.deviceMemory;b&&(b.client.memoryTotalKbytes=""+e*1E6)}a.appInstallData&&b&&(b.client.configInfo=b.client.configInfo||{},b.client.configInfo.appInstallData=a.appInstallData);(a=Ir())&&b&&(b.client.connectionType=a);T("web_log_effective_connection_type")&&
(a=Jr())&&b&&(b.client.effectiveConnectionType=a);T("start_client_gcf")&&(e=uu())&&(a=e.coldConfigData,f=e.coldHashData,e=e.hotHashData,b&&(b.client.configInfo=b.client.configInfo||{},a&&(b.client.configInfo.coldConfigData=a),f&&(b.client.configInfo.coldHashData=f),e&&(b.client.configInfo.hotHashData=e)));S("DELEGATED_SESSION_ID")&&!T("pageid_as_header_web")&&(b.user={onBehalfOfUser:S("DELEGATED_SESSION_ID")});!T("fill_delegate_context_in_gel_killswitch")&&(a=S("INNERTUBE_CONTEXT_SERIALIZED_DELEGATION_CONTEXT"))&&
(b.user=Object.assign({},b.user,{serializedDelegationContext:a}));a=S("INNERTUBE_CONTEXT");var g;if(T("enable_persistent_device_token")&&(a==null?0:(g=a.client)==null?0:g.rolloutToken)){var h;b.client.rolloutToken=a==null?void 0:(h=a.client)==null?void 0:h.rolloutToken}g=Object;h=g.assign;a=b.client;f={};e=z(Object.entries(uq(S("DEVICE",""))));for(d=e.next();!d.done;d=e.next())c=z(d.value),d=c.next().value,c=c.next().value,d==="cbrand"?f.deviceMake=c:d==="cmodel"?f.deviceModel=c:d==="cbr"?f.browserName=
c:d==="cbrver"?f.browserVersion=c:d==="cos"?f.osName=c:d==="cosver"?f.osVersion=c:d==="cplatform"&&(f.platform=c);b.client=h.call(g,a,f);return b}
function yu(a,b,c){c=c===void 0?{}:c;var d={};S("EOM_VISITOR_DATA")?d={"X-Goog-EOM-Visitor-Id":S("EOM_VISITOR_DATA")}:d={"X-Goog-Visitor-Id":c.visitorData||S("VISITOR_DATA","")};if(b&&b.includes("www.youtube-nocookie.com"))return d;b=c.authorization||S("AUTHORIZATION");b||(a?b="Bearer "+I("gapi.auth.getToken")().Wi:(qr.instance||(qr.instance=new qr),a=rr(),T("pageid_as_header_web")||delete a["X-Goog-PageId"],d=Object.assign({},d,a)));b&&(d.Authorization=b);return d}
;var zu=typeof TextEncoder!=="undefined"?new TextEncoder:null,Au=zu?function(a){return zu.encode(a)}:function(a){a=bd(a);
for(var b=new Uint8Array(a.length),c=0;c<b.length;c++)b[c]=a[c];return b};var Bu={next:"wn_s",browse:"br_s",search:"sr_s",reel:"r_wrs",player:"ps_s"},Cu={next:"wn_r",browse:"br_r",search:"sr_r",reel:"r_wrr",player:"ps_r"};function Du(a,b){this.version=a;this.args=b}
Du.prototype.serialize=function(){return{version:this.version,args:this.args}};function Eu(a,b){this.topic=a;this.h=b}
Eu.prototype.toString=function(){return this.topic};var Fu=I("ytPubsub2Pubsub2Instance")||new Ln;Ln.prototype.subscribe=Ln.prototype.subscribe;Ln.prototype.unsubscribeByKey=Ln.prototype.yc;Ln.prototype.publish=Ln.prototype.Ab;Ln.prototype.clear=Ln.prototype.clear;G("ytPubsub2Pubsub2Instance",Fu);var Gu=I("ytPubsub2Pubsub2SubscribedKeys")||{};G("ytPubsub2Pubsub2SubscribedKeys",Gu);var Hu=I("ytPubsub2Pubsub2TopicToKeys")||{};G("ytPubsub2Pubsub2TopicToKeys",Hu);var Iu=I("ytPubsub2Pubsub2IsAsync")||{};G("ytPubsub2Pubsub2IsAsync",Iu);
G("ytPubsub2Pubsub2SkipSubKey",null);function Ju(a,b){var c=Ku();c&&c.publish.call(c,a.toString(),a,b)}
function Lu(a){var b=Mu,c=Ku();if(!c)return 0;var d=c.subscribe(b.toString(),function(e,f){var g=I("ytPubsub2Pubsub2SkipSubKey");g&&g==d||(g=function(){if(Gu[d])try{if(f&&b instanceof Eu&&b!=e)try{var h=b.h,k=f;if(!k.args||!k.version)throw Error("yt.pubsub2.Data.deserialize(): serializedData is incomplete.");try{if(!h.De){var l=new h;h.De=l.version}var m=h.De}catch(p){}if(!m||k.version!=m)throw Error("yt.pubsub2.Data.deserialize(): serializedData version is incompatible.");try{f=Reflect.construct(h,
Vb(k.args))}catch(p){throw p.message="yt.pubsub2.Data.deserialize(): "+p.message,p;}}catch(p){throw p.message="yt.pubsub2.pubsub2 cross-binary conversion error for "+b.toString()+": "+p.message,p;}a.call(window,f)}catch(p){mq(p)}},Iu[b.toString()]?I("yt.scheduler.instance")?vn.wa(g):Fq(g,0):g())});
Gu[d]=!0;Hu[b.toString()]||(Hu[b.toString()]=[]);Hu[b.toString()].push(d);return d}
function Nu(){var a=Ou,b=Lu(function(c){a.apply(void 0,arguments);Pu(b)});
return b}
function Pu(a){var b=Ku();b&&(typeof a==="number"&&(a=[a]),Pb(a,function(c){b.unsubscribeByKey(c);delete Gu[c]}))}
function Ku(){return I("ytPubsub2Pubsub2Instance")}
;function Qu(a,b,c){c=c===void 0?{sampleRate:.1}:c;Math.random()<Math.min(.02,c.sampleRate/100)&&Ju("meta_logging_csi_event",{timerName:a,Mj:b})}
;var Ru=void 0,Su=void 0;function Tu(){Su||(Su=Fp(S("WORKER_SERIALIZATION_URL")));return Su||void 0}
function Uu(){var a=Tu();Ru||a===void 0||(Ru=new Worker(mb(a),void 0));return Ru}
;var Vu=en("max_body_size_to_compress",5E5),Wu=en("min_body_size_to_compress",500),Xu=!0,Yu=0,Zu=0,$u=en("compression_performance_threshold_lr",250),av=en("slow_compressions_before_abandon_count",4),bv=!1,cv=new Map,dv=1;function ev(){if(typeof Worker==="function"&&Tu()&&!bv){var a=function(c){c=c.data;if(c.op==="gzippedGelBatch"){var d=cv.get(c.key);d&&(fv(c.gzippedBatch,d.latencyPayload,d.url,d.options,d.sendFn),cv.delete(c.key))}},b=Uu();
b&&(b.addEventListener("message",a),b.onerror=function(){cv.clear()},bv=!0)}}
function gv(a,b,c,d,e){e=e===void 0?!1:e;var f={startTime:V(),ticks:{},infos:{}};if(Xu)try{var g=hv(b);if(g!=null&&(g>Vu||g<Wu))d(a,c);else{if(T("gzip_gel_with_worker")){bv||ev();var h=Uu();if(h&&!e){cv.set(dv,{latencyPayload:f,url:a,options:c,sendFn:d});h.postMessage({op:"gelBatchToGzip",serializedBatch:b,key:dv});dv++;return}}var k=Dp(Au(b));fv(k,f,a,c,d)}}catch(l){nq(l),d(a,c)}else d(a,c)}
function fv(a,b,c,d,e){var f=V();b.ticks.gelc=f;Zu++;T("disable_compression_due_to_performance_degredation")&&f-b.startTime>=$u&&(Yu++,Xu=!1);iv(b);d.headers||(d.headers={});d.headers["Content-Encoding"]="gzip";d.postBody=a;d.postParams=void 0;e(c,d)}
function jv(a){var b=b===void 0?!1:b;var c=c===void 0?!1:c;var d=V(),e={startTime:d,ticks:{},infos:{}},f=b?I("yt.logging.gzipForFetch",!1):!0;if(Xu&&f){if(!a.body)return a;try{var g=c?a.body:typeof a.body==="string"?a.body:JSON.stringify(a.body);f=g;if(!c&&typeof g==="string"){var h=hv(g);if(h!=null&&(h>Vu||h<Wu))return a;c=b?{level:1}:void 0;f=Dp(Au(g),c);var k=V();e.ticks.gelc=k;if(b){Zu++;if((T("disable_compression_due_to_performance_degredation")||T("disable_compression_due_to_performance_degradation_lr"))&&
k-d>=$u)if(Yu++,T("abandon_compression_after_N_slow_zips_lr")){b=Yu/Zu;var l=av/en("compression_disable_point");Zu>0&&Zu%en("compression_disable_point")===0&&b>=l&&(Xu=!1)}else Xu=!1;iv(e)}}a.headers=Object.assign({},{"Content-Encoding":"gzip"},a.headers||{});a.body=f;return a}catch(m){return nq(m),a}}else return a}
function hv(a){try{return(new Blob(a.split(""))).size}catch(b){return nq(b),null}}
function iv(a){T("gel_compression_csi_killswitch")||!T("log_gel_compression_latency")&&!T("log_gel_compression_latency_lr")||Qu("gel_compression",a,{sampleRate:.1})}
;function kv(a){a=Object.assign({},a);delete a.Authorization;var b=si();if(b){var c=new zn;c.update(S("INNERTUBE_API_KEY"));c.update(b);a.hash=Bd(c.digest(),3)}return a}
;var lv;function mv(){lv||(lv=new vs("yt.innertube"));return lv}
function nv(a,b,c,d){if(d)return null;d=mv().get("nextId",!0)||1;var e=mv().get("requests",!0)||{};e[d]={method:a,request:b,authState:kv(c),requestTime:Math.round(V())};mv().set("nextId",d+1,86400,!0);mv().set("requests",e,86400,!0);return d}
function ov(a){var b=mv().get("requests",!0)||{};delete b[a];mv().set("requests",b,86400,!0)}
function pv(a){var b=mv().get("requests",!0);if(b){for(var c in b){var d=b[c];if(!(Math.round(V())-d.requestTime<6E4)){var e=d.authState,f=kv(yu(!1));Hi(e,f)&&(e=d.request,"requestTimeMs"in e&&(e.requestTimeMs=Math.round(V())),qv(a,d.method,e,{}));delete b[c]}}mv().set("requests",b,86400,!0)}}
;function rv(a){this.Ac=this.h=!1;this.potentialEsfErrorCounter=this.i=0;this.handleError=function(){};
this.Jb=function(){};
this.now=Date.now;this.fc=!1;var b;this.ye=(b=a.ye)!=null?b:100;var c;this.re=(c=a.re)!=null?c:1;var d;this.pe=(d=a.pe)!=null?d:2592E6;var e;this.ke=(e=a.ke)!=null?e:12E4;var f;this.qe=(f=a.qe)!=null?f:5E3;var g;this.aa=(g=a.aa)!=null?g:void 0;this.Hc=!!a.Hc;var h;this.Fc=(h=a.Fc)!=null?h:.1;var k;this.Wc=(k=a.Wc)!=null?k:10;a.handleError&&(this.handleError=a.handleError);a.Jb&&(this.Jb=a.Jb);a.fc&&(this.fc=a.fc);a.Ac&&(this.Ac=a.Ac);this.da=a.da;this.Ia=a.Ia;this.ka=a.ka;this.ia=a.ia;this.sendFn=
a.sendFn;this.Cd=a.Cd;this.zd=a.zd;sv(this)&&(!this.da||this.da("networkless_logging"))&&tv(this)}
function tv(a){sv(a)&&!a.fc&&(a.h=!0,a.Hc&&Math.random()<=a.Fc&&a.ka.We(a.aa),uv(a),a.ia.za()&&a.xc(),a.ia.listen(a.Cd,a.xc.bind(a)),a.ia.listen(a.zd,a.Rd.bind(a)))}
n=rv.prototype;n.writeThenSend=function(a,b){var c=this;b=b===void 0?{}:b;if(sv(this)&&this.h){var d={url:a,options:b,timestamp:this.now(),status:"NEW",sendCount:0};this.ka.set(d,this.aa).then(function(e){d.id=e;c.ia.za()&&vv(c,d)}).catch(function(e){vv(c,d);
wv(c,e)})}else this.sendFn(a,b)};
n.sendThenWrite=function(a,b,c){var d=this;b=b===void 0?{}:b;if(sv(this)&&this.h){var e={url:a,options:b,timestamp:this.now(),status:"NEW",sendCount:0};this.da&&this.da("nwl_skip_retry")&&(e.skipRetry=c);if(this.ia.za()||this.da&&this.da("nwl_aggressive_send_then_write")&&!e.skipRetry){if(!e.skipRetry){var f=b.onError?b.onError:function(){};
b.onError=function(g,h){return C(function(k){if(k.h==1)return k.yield(d.ka.set(e,d.aa).catch(function(l){wv(d,l)}),2);
f(g,h);k.o()})}}this.sendFn(a,b,e.skipRetry)}else this.ka.set(e,this.aa).catch(function(g){d.sendFn(a,b,e.skipRetry);
wv(d,g)})}else this.sendFn(a,b,this.da&&this.da("nwl_skip_retry")&&c)};
n.sendAndWrite=function(a,b){var c=this;b=b===void 0?{}:b;if(sv(this)&&this.h){var d={url:a,options:b,timestamp:this.now(),status:"NEW",sendCount:0},e=!1,f=b.onSuccess?b.onSuccess:function(){};
d.options.onSuccess=function(g,h){d.id!==void 0?c.ka.Gb(d.id,c.aa):e=!0;c.ia.tb&&c.da&&c.da("vss_network_hint")&&c.ia.tb(!0);f(g,h)};
this.sendFn(d.url,d.options,void 0,!0);this.ka.set(d,this.aa).then(function(g){d.id=g;e&&c.ka.Gb(d.id,c.aa)}).catch(function(g){wv(c,g)})}else this.sendFn(a,b,void 0,!0)};
n.xc=function(){var a=this;if(!sv(this))throw Error("IndexedDB is not supported: throttleSend");this.i||(this.i=this.Ia.wa(function(){var b;return C(function(c){if(c.h==1)return c.yield(a.ka.Vd("NEW",a.aa),2);if(c.h!=3)return b=c.i,b?c.yield(vv(a,b),3):(a.Rd(),c.return());a.i&&(a.i=0,a.xc());c.o()})},this.ye))};
n.Rd=function(){this.Ia.xa(this.i);this.i=0};
function vv(a,b){var c;return C(function(d){switch(d.h){case 1:if(!sv(a))throw Error("IndexedDB is not supported: immediateSend");if(b.id===void 0){d.v(2);break}return d.yield(a.ka.Nf(b.id,a.aa),3);case 3:(c=d.i)||a.Jb(Error("The request cannot be found in the database."));case 2:if(xv(a,b,a.pe)){d.v(4);break}a.Jb(Error("Networkless Logging: Stored logs request expired age limit"));if(b.id===void 0){d.v(5);break}return d.yield(a.ka.Gb(b.id,a.aa),5);case 5:return d.return();case 4:b.skipRetry||(b=
yv(a,b));if(!b){d.v(0);break}if(!b.skipRetry||b.id===void 0){d.v(8);break}return d.yield(a.ka.Gb(b.id,a.aa),8);case 8:a.sendFn(b.url,b.options,!!b.skipRetry),d.o()}})}
function yv(a,b){if(!sv(a))throw Error("IndexedDB is not supported: updateRequestHandlers");var c=b.options.onError?b.options.onError:function(){};
b.options.onError=function(e,f){var g,h,k,l;return C(function(m){switch(m.h){case 1:g=zv(f);(h=Av(f))&&a.da&&a.da("web_enable_error_204")&&a.handleError(Error("Request failed due to compression"),b.url,f);if(!(a.da&&a.da("nwl_consider_error_code")&&g||a.da&&!a.da("nwl_consider_error_code")&&a.potentialEsfErrorCounter<=a.Wc)){m.v(2);break}if(!a.ia.bd){m.v(3);break}return m.yield(a.ia.bd(),3);case 3:if(a.ia.za()){m.v(2);break}c(e,f);if(!a.da||!a.da("nwl_consider_error_code")||((k=b)==null?void 0:k.id)===
void 0){m.v(6);break}return m.yield(a.ka.Dd(b.id,a.aa,!1),6);case 6:return m.return();case 2:if(a.da&&a.da("nwl_consider_error_code")&&!g&&a.potentialEsfErrorCounter>a.Wc)return m.return();a.potentialEsfErrorCounter++;if(((l=b)==null?void 0:l.id)===void 0){m.v(8);break}return b.sendCount<a.re?m.yield(a.ka.Dd(b.id,a.aa,!0,h?!1:void 0),12):m.yield(a.ka.Gb(b.id,a.aa),8);case 12:a.Ia.wa(function(){a.ia.za()&&a.xc()},a.qe);
case 8:c(e,f),m.o()}})};
var d=b.options.onSuccess?b.options.onSuccess:function(){};
b.options.onSuccess=function(e,f){var g;return C(function(h){if(h.h==1)return((g=b)==null?void 0:g.id)===void 0?h.v(2):h.yield(a.ka.Gb(b.id,a.aa),2);a.ia.tb&&a.da&&a.da("vss_network_hint")&&a.ia.tb(!0);d(e,f);h.o()})};
return b}
function xv(a,b,c){b=b.timestamp;return a.now()-b>=c?!1:!0}
function uv(a){if(!sv(a))throw Error("IndexedDB is not supported: retryQueuedRequests");a.ka.Vd("QUEUED",a.aa).then(function(b){b&&!xv(a,b,a.ke)?a.Ia.wa(function(){return C(function(c){if(c.h==1)return b.id===void 0?c.v(2):c.yield(a.ka.Dd(b.id,a.aa),2);uv(a);c.o()})}):a.ia.za()&&a.xc()})}
function wv(a,b){a.Je&&!a.ia.za()?a.Je(b):a.handleError(b)}
function sv(a){return!!a.aa||a.Ac}
function zv(a){var b;return(a=a==null?void 0:(b=a.error)==null?void 0:b.code)&&a>=400&&a<=599?!1:!0}
function Av(a){var b;a=a==null?void 0:(b=a.error)==null?void 0:b.code;return!(a!==400&&a!==415)}
;var Fv;
function Gv(){if(Fv)return Fv();var a={};Fv=hu("LogsDatabaseV2",{Rb:(a.LogsRequestsStore={Zb:2},a),shared:!1,upgrade:function(b,c,d){c(2)&&mt(b,"LogsRequestsStore",{keyPath:"id",autoIncrement:!0});c(3);c(5)&&(d=d.objectStore("LogsRequestsStore"),d.h.indexNames.contains("newRequest")&&d.h.deleteIndex("newRequest"),tt(d,"newRequestV2",["status","interface","timestamp"]));c(7)&&b.h.objectStoreNames.contains("sapisid")&&b.h.deleteObjectStore("sapisid");c(9)&&b.h.objectStoreNames.contains("SWHealthLog")&&b.h.deleteObjectStore("SWHealthLog")},
version:9});return Fv()}
;function Hv(a){return Ht(Gv(),a)}
function Iv(a,b){var c,d,e,f;return C(function(g){if(g.h==1)return c={startTime:V(),infos:{transactionType:"YT_IDB_TRANSACTION_TYPE_WRITE"},ticks:{}},g.yield(Hv(b),2);if(g.h!=3)return d=g.i,e=Object.assign({},a,{options:JSON.parse(JSON.stringify(a.options)),interface:S("INNERTUBE_CONTEXT_CLIENT_NAME",0)}),g.yield(ot(d,"LogsRequestsStore",e),3);f=g.i;c.ticks.tc=V();Jv(c);return g.return(f)})}
function Kv(a,b){var c,d,e,f,g,h,k,l,m;return C(function(p){if(p.h==1)return c={startTime:V(),infos:{transactionType:"YT_IDB_TRANSACTION_TYPE_READ"},ticks:{}},p.yield(Hv(b),2);if(p.h!=3)return d=p.i,e=S("INNERTUBE_CONTEXT_CLIENT_NAME",0),f=[a,e,0],g=[a,e,V()],h=IDBKeyRange.bound(f,g),k="prev",T("use_fifo_for_networkless")&&(k="next"),l=void 0,m=a==="NEW"?"readwrite":"readonly",T("use_readonly_for_get_most_recent_by_status_killswitch")&&(m="readwrite"),p.yield(lt(d,["LogsRequestsStore"],{mode:m,pa:!0},
function(r){return At(r.objectStore("LogsRequestsStore").index("newRequestV2"),{query:h,direction:k},function(t){t.getValue()&&(l=t.getValue(),a==="NEW"&&(l.status="QUEUED",t.update(l)))})}),3);
c.ticks.tc=V();Jv(c);return p.return(l)})}
function Lv(a,b){var c;return C(function(d){if(d.h==1)return d.yield(Hv(b),2);c=d.i;return d.return(lt(c,["LogsRequestsStore"],{mode:"readwrite",pa:!0},function(e){var f=e.objectStore("LogsRequestsStore");return f.get(a).then(function(g){if(g)return g.status="QUEUED",ft(f.h.put(g,void 0)).then(function(){return g})})}))})}
function Mv(a,b,c,d){c=c===void 0?!0:c;var e;return C(function(f){if(f.h==1)return f.yield(Hv(b),2);e=f.i;return f.return(lt(e,["LogsRequestsStore"],{mode:"readwrite",pa:!0},function(g){var h=g.objectStore("LogsRequestsStore");return h.get(a).then(function(k){return k?(k.status="NEW",c&&(k.sendCount+=1),d!==void 0&&(k.options.compress=d),ft(h.h.put(k,void 0)).then(function(){return k})):$s.resolve(void 0)})}))})}
function Nv(a,b){var c;return C(function(d){if(d.h==1)return d.yield(Hv(b),2);c=d.i;return d.return(c.delete("LogsRequestsStore",a))})}
function Ov(a){var b,c;return C(function(d){if(d.h==1)return d.yield(Hv(a),2);b=d.i;c=V()-2592E6;return d.yield(lt(b,["LogsRequestsStore"],{mode:"readwrite",pa:!0},function(e){return vt(e.objectStore("LogsRequestsStore"),{},function(f){if(f.getValue().timestamp<=c)return f.delete().then(function(){return wt(f)})})}),0)})}
function Pv(){C(function(a){return a.yield(du(),0)})}
function Jv(a){T("nwl_csi_killswitch")||Qu("networkless_performance",a,{sampleRate:1})}
;var Qv={accountStateChangeSignedIn:23,accountStateChangeSignedOut:24,delayedEventMetricCaptured:11,latencyActionBaselined:6,latencyActionInfo:7,latencyActionTicked:5,offlineTransferStatusChanged:2,offlineImageDownload:335,playbackStartStateChanged:9,systemHealthCaptured:3,mangoOnboardingCompleted:10,mangoPushNotificationReceived:230,mangoUnforkDbMigrationError:121,mangoUnforkDbMigrationSummary:122,mangoUnforkDbMigrationPreunforkDbVersionNumber:133,mangoUnforkDbMigrationPhoneMetadata:134,mangoUnforkDbMigrationPhoneStorage:135,
mangoUnforkDbMigrationStep:142,mangoAsyncApiMigrationEvent:223,mangoDownloadVideoResult:224,mangoHomepageVideoCount:279,mangoHomeV3State:295,mangoImageClientCacheHitEvent:273,sdCardStatusChanged:98,framesDropped:12,thumbnailHovered:13,deviceRetentionInfoCaptured:14,thumbnailLoaded:15,backToAppEvent:318,streamingStatsCaptured:17,offlineVideoShared:19,appCrashed:20,youThere:21,offlineStateSnapshot:22,mdxSessionStarted:25,mdxSessionConnected:26,mdxSessionDisconnected:27,bedrockResourceConsumptionSnapshot:28,
nextGenWatchWatchSwiped:29,kidsAccountsSnapshot:30,zeroStepChannelCreated:31,tvhtml5SearchCompleted:32,offlineSharePairing:34,offlineShareUnlock:35,mdxRouteDistributionSnapshot:36,bedrockRepetitiveActionTimed:37,unpluggedDegradationInfo:229,uploadMp4HeaderMoved:38,uploadVideoTranscoded:39,uploadProcessorStarted:46,uploadProcessorEnded:47,uploadProcessorReady:94,uploadProcessorRequirementPending:95,uploadProcessorInterrupted:96,uploadFrontendEvent:241,assetPackDownloadStarted:41,assetPackDownloaded:42,
assetPackApplied:43,assetPackDeleted:44,appInstallAttributionEvent:459,playbackSessionStopped:45,adBlockerMessagingShown:48,distributionChannelCaptured:49,dataPlanCpidRequested:51,detailedNetworkTypeCaptured:52,sendStateUpdated:53,receiveStateUpdated:54,sendDebugStateUpdated:55,receiveDebugStateUpdated:56,kidsErrored:57,mdxMsnSessionStatsFinished:58,appSettingsCaptured:59,mdxWebSocketServerHttpError:60,mdxWebSocketServer:61,startupCrashesDetected:62,coldStartInfo:435,offlinePlaybackStarted:63,liveChatMessageSent:225,
liveChatUserPresent:434,liveChatBeingModerated:457,liveCreationCameraUpdated:64,liveCreationEncodingCaptured:65,liveCreationError:66,liveCreationHealthUpdated:67,liveCreationVideoEffectsCaptured:68,liveCreationStageOccured:75,liveCreationBroadcastScheduled:123,liveCreationArchiveReplacement:149,liveCreationCostreamingConnection:421,liveCreationPlayablesMetrics:533,liveCreationStreamWebrtcStats:288,liveCreationWebrtcError:526,mdxSessionRecoveryStarted:69,mdxSessionRecoveryCompleted:70,mdxSessionRecoveryStopped:71,
visualElementShown:72,visualElementHidden:73,visualElementGestured:78,visualElementStateChanged:208,screenCreated:156,playbackAssociated:202,visualElementAttached:215,playbackContextEvent:214,cloudCastingPlaybackStarted:74,webPlayerApiCalled:76,tvhtml5AccountDialogOpened:79,foregroundHeartbeat:80,foregroundHeartbeatScreenAssociated:111,kidsOfflineSnapshot:81,mdxEncryptionSessionStatsFinished:82,playerRequestCompleted:83,liteSchedulerStatistics:84,mdxSignIn:85,spacecastMetadataLookupRequested:86,spacecastBatchLookupRequested:87,
spacecastSummaryRequested:88,spacecastPlayback:89,spacecastDiscovery:90,tvhtml5LaunchUrlComponentChanged:91,mdxBackgroundPlaybackRequestCompleted:92,mdxBrokenAdditionalDataDeviceDetected:93,tvhtml5LocalStorage:97,tvhtml5DeviceStorageStatus:147,autoCaptionsAvailable:99,playbackScrubbingEvent:339,flexyState:100,interfaceOrientationCaptured:101,mainAppBrowseFragmentCache:102,offlineCacheVerificationFailure:103,offlinePlaybackExceptionDigest:217,vrCopresenceStats:104,vrCopresenceSyncStats:130,vrCopresenceCommsStats:137,
vrCopresencePartyStats:153,vrCopresenceEmojiStats:213,vrCopresenceEvent:141,vrCopresenceFlowTransitEvent:160,vrCowatchPartyEvent:492,vrCowatchUserStartOrJoinEvent:504,vrPlaybackEvent:345,kidsAgeGateTracking:105,offlineDelayAllowedTracking:106,mainAppAutoOfflineState:107,videoAsThumbnailDownload:108,videoAsThumbnailPlayback:109,liteShowMore:110,renderingError:118,kidsProfilePinGateTracking:119,abrTrajectory:124,scrollEvent:125,streamzIncremented:126,kidsProfileSwitcherTracking:127,kidsProfileCreationTracking:129,
buyFlowStarted:136,mbsConnectionInitiated:138,mbsPlaybackInitiated:139,mbsLoadChildren:140,liteProfileFetcher:144,mdxRemoteTransaction:146,reelPlaybackError:148,reachabilityDetectionEvent:150,mobilePlaybackEvent:151,courtsidePlayerStateChanged:152,musicPersistentCacheChecked:154,musicPersistentCacheCleared:155,playbackInterrupted:157,playbackInterruptionResolved:158,fixFopFlow:159,anrDetection:161,backstagePostCreationFlowEnded:162,clientError:163,gamingAccountLinkStatusChanged:164,liteHousewarming:165,
buyFlowEvent:167,kidsParentalGateTracking:168,kidsSignedOutSettingsStatus:437,kidsSignedOutPauseHistoryFixStatus:438,tvhtml5WatchdogViolation:444,ypcUpgradeFlow:169,yongleStudy:170,ypcUpdateFlowStarted:171,ypcUpdateFlowCancelled:172,ypcUpdateFlowSucceeded:173,ypcUpdateFlowFailed:174,liteGrowthkitPromo:175,paymentFlowStarted:341,transactionFlowShowPaymentDialog:405,transactionFlowStarted:176,transactionFlowSecondaryDeviceStarted:222,transactionFlowSecondaryDeviceSignedOutStarted:383,transactionFlowCancelled:177,
transactionFlowPaymentCallBackReceived:387,transactionFlowPaymentSubmitted:460,transactionFlowPaymentSucceeded:329,transactionFlowSucceeded:178,transactionFlowFailed:179,transactionFlowPlayBillingConnectionStartEvent:428,transactionFlowSecondaryDeviceSuccess:458,transactionFlowErrorEvent:411,liteVideoQualityChanged:180,watchBreakEnablementSettingEvent:181,watchBreakFrequencySettingEvent:182,videoEffectsCameraPerformanceMetrics:183,adNotify:184,startupTelemetry:185,playbackOfflineFallbackUsed:186,
outOfMemory:187,ypcPauseFlowStarted:188,ypcPauseFlowCancelled:189,ypcPauseFlowSucceeded:190,ypcPauseFlowFailed:191,uploadFileSelected:192,ypcResumeFlowStarted:193,ypcResumeFlowCancelled:194,ypcResumeFlowSucceeded:195,ypcResumeFlowFailed:196,adsClientStateChange:197,ypcCancelFlowStarted:198,ypcCancelFlowCancelled:199,ypcCancelFlowSucceeded:200,ypcCancelFlowFailed:201,ypcCancelFlowGoToPaymentProcessor:402,ypcDeactivateFlowStarted:320,ypcRedeemFlowStarted:203,ypcRedeemFlowCancelled:204,ypcRedeemFlowSucceeded:205,
ypcRedeemFlowFailed:206,ypcFamilyCreateFlowStarted:258,ypcFamilyCreateFlowCancelled:259,ypcFamilyCreateFlowSucceeded:260,ypcFamilyCreateFlowFailed:261,ypcFamilyManageFlowStarted:262,ypcFamilyManageFlowCancelled:263,ypcFamilyManageFlowSucceeded:264,ypcFamilyManageFlowFailed:265,restoreContextEvent:207,embedsAdEvent:327,autoplayTriggered:209,clientDataErrorEvent:210,experimentalVssValidation:211,tvhtml5TriggeredEvent:212,tvhtml5FrameworksFieldTrialResult:216,tvhtml5FrameworksFieldTrialStart:220,musicOfflinePreferences:218,
watchTimeSegment:219,appWidthLayoutError:221,accountRegistryChange:226,userMentionAutoCompleteBoxEvent:227,downloadRecommendationEnablementSettingEvent:228,musicPlaybackContentModeChangeEvent:231,offlineDbOpenCompleted:232,kidsFlowEvent:233,kidsFlowCorpusSelectedEvent:234,videoEffectsEvent:235,unpluggedOpsEogAnalyticsEvent:236,playbackAudioRouteEvent:237,interactionLoggingDebugModeError:238,offlineYtbRefreshed:239,kidsFlowError:240,musicAutoplayOnLaunchAttempted:242,deviceContextActivityEvent:243,
deviceContextEvent:244,templateResolutionException:245,musicSideloadedPlaylistServiceCalled:246,embedsStorageAccessNotChecked:247,embedsHasStorageAccessResult:248,embedsItpPlayedOnReload:249,embedsRequestStorageAccessResult:250,embedsShouldRequestStorageAccessResult:251,embedsRequestStorageAccessState:256,embedsRequestStorageAccessFailedState:257,embedsItpWatchLaterResult:266,searchSuggestDecodingPayloadFailure:252,siriShortcutActivated:253,tvhtml5KeyboardPerformance:254,latencyActionSpan:255,elementsLog:267,
ytbFileOpened:268,tfliteModelError:269,apiTest:270,yongleUsbSetup:271,touStrikeInterstitialEvent:272,liteStreamToSave:274,appBundleClientEvent:275,ytbFileCreationFailed:276,adNotifyFailure:278,ytbTransferFailed:280,blockingRequestFailed:281,liteAccountSelector:282,liteAccountUiCallbacks:283,dummyPayload:284,browseResponseValidationEvent:285,entitiesError:286,musicIosBackgroundFetch:287,mdxNotificationEvent:289,layersValidationError:290,musicPwaInstalled:291,liteAccountCleanup:292,html5PlayerHealthEvent:293,
watchRestoreAttempt:294,liteAccountSignIn:296,notaireEvent:298,kidsVoiceSearchEvent:299,adNotifyFilled:300,delayedEventDropped:301,analyticsSearchEvent:302,systemDarkThemeOptOutEvent:303,flowEvent:304,networkConnectivityBaselineEvent:305,ytbFileImported:306,downloadStreamUrlExpired:307,directSignInEvent:308,lyricImpressionEvent:309,accessibilityStateEvent:310,tokenRefreshEvent:311,genericAttestationExecution:312,tvhtml5VideoSeek:313,unpluggedAutoPause:314,scrubbingEvent:315,bedtimeReminderEvent:317,
tvhtml5UnexpectedRestart:319,tvhtml5DeviceStorageStats:535,tvhtml5StabilityTraceEvent:478,tvhtml5OperationHealth:467,tvhtml5WatchKeyEvent:321,voiceLanguageChanged:322,tvhtml5LiveChatStatus:323,parentToolsCorpusSelectedEvent:324,offerAdsEnrollmentInitiated:325,networkQualityIntervalEvent:326,deviceStartupMetrics:328,heartbeatActionPlayerTransitioned:330,tvhtml5Lifecycle:331,heartbeatActionPlayerHalted:332,adaptiveInlineMutedSettingEvent:333,mainAppLibraryLoadingState:334,thirdPartyLogMonitoringEvent:336,
appShellAssetLoadReport:337,tvhtml5AndroidAttestation:338,tvhtml5StartupSoundEvent:340,iosBackgroundRefreshTask:342,iosBackgroundProcessingTask:343,sliEventBatch:344,postImpressionEvent:346,musicSideloadedPlaylistExport:347,idbUnexpectedlyClosed:348,voiceSearchEvent:349,mdxSessionCastEvent:350,idbQuotaExceeded:351,idbTransactionEnded:352,idbTransactionAborted:353,tvhtml5KeyboardLogging:354,idbIsSupportedCompleted:355,creatorStudioMobileEvent:356,idbDataCorrupted:357,parentToolsAppChosenEvent:358,
webViewBottomSheetResized:359,activeStateControllerScrollPerformanceSummary:360,navigatorValidation:361,mdxSessionHeartbeat:362,clientHintsPolyfillDiagnostics:363,clientHintsPolyfillEvent:364,proofOfOriginTokenError:365,kidsAddedAccountSummary:366,musicWearableDevice:367,ypcRefundFlowEvent:368,tvhtml5PlaybackMeasurementEvent:369,tvhtml5WatermarkMeasurementEvent:370,clientExpGcfPropagationEvent:371,mainAppReferrerIntent:372,leaderLockEnded:373,leaderLockAcquired:374,googleHatsEvent:375,persistentLensLaunchEvent:376,
parentToolsChildWelcomeChosenEvent:378,browseThumbnailPreloadEvent:379,finalPayload:380,mdxDialAdditionalDataUpdateEvent:381,webOrchestrationTaskLifecycleRecord:382,startupSignalEvent:384,accountError:385,gmsDeviceCheckEvent:386,accountSelectorEvent:388,accountUiCallbacks:389,mdxDialAdditionalDataProbeEvent:390,downloadsSearchIcingApiStats:391,downloadsSearchIndexUpdatedEvent:397,downloadsSearchIndexSnapshot:398,dataPushClientEvent:392,kidsCategorySelectedEvent:393,mdxDeviceManagementSnapshotEvent:394,
prefetchRequested:395,prefetchableCommandExecuted:396,gelDebuggingEvent:399,webLinkTtsPlayEnd:400,clipViewInvalid:401,persistentStorageStateChecked:403,cacheWipeoutEvent:404,playerEvent:410,sfvEffectPipelineStartedEvent:412,sfvEffectPipelinePausedEvent:429,sfvEffectPipelineEndedEvent:413,sfvEffectChosenEvent:414,sfvEffectLoadedEvent:415,sfvEffectUserInteractionEvent:465,sfvEffectFirstFrameProcessedLatencyEvent:416,sfvEffectAggregatedFramesProcessedLatencyEvent:417,sfvEffectAggregatedFramesDroppedEvent:418,
sfvEffectPipelineErrorEvent:430,sfvEffectGraphFrozenEvent:419,sfvEffectGlThreadBlockedEvent:420,mdeQosEvent:510,mdeVideoChangedEvent:442,mdePlayerPerformanceMetrics:472,mdeExporterEvent:497,genericClientExperimentEvent:423,homePreloadTaskScheduled:424,homePreloadTaskExecuted:425,homePreloadCacheHit:426,polymerPropertyChangedInObserver:427,applicationStarted:431,networkCronetRttBatch:432,networkCronetRttSummary:433,repeatChapterLoopEvent:436,seekCancellationEvent:462,lockModeTimeoutEvent:483,externalVideoShareToYoutubeAttempt:501,
parentCodeEvent:502,offlineTransferStarted:4,musicOfflineMixtapePreferencesChanged:16,mangoDailyNewVideosNotificationAttempt:40,mangoDailyNewVideosNotificationError:77,dtwsPlaybackStarted:112,dtwsTileFetchStarted:113,dtwsTileFetchCompleted:114,dtwsTileFetchStatusChanged:145,dtwsKeyframeDecoderBufferSent:115,dtwsTileUnderflowedOnNonkeyframe:116,dtwsBackfillFetchStatusChanged:143,dtwsBackfillUnderflowed:117,dtwsAdaptiveLevelChanged:128,blockingVisitorIdTimeout:277,liteSocial:18,mobileJsInvocation:297,
biscottiBasedDetection:439,coWatchStateChange:440,embedsVideoDataDidChange:441,shortsFirst:443,cruiseControlEvent:445,qoeClientLoggingContext:446,atvRecommendationJobExecuted:447,tvhtml5UserFeedback:448,producerProjectCreated:449,producerProjectOpened:450,producerProjectDeleted:451,producerProjectElementAdded:453,producerProjectElementRemoved:454,producerAppStateChange:509,producerProjectDiskInsufficientExportFailure:516,producerMediaServicesResetDetails:522,tvhtml5ShowClockEvent:455,deviceCapabilityCheckMetrics:456,
youtubeClearcutEvent:461,offlineBrowseFallbackEvent:463,getCtvTokenEvent:464,startupDroppedFramesSummary:466,screenshotEvent:468,miniAppPlayEvent:469,elementsDebugCounters:470,fontLoadEvent:471,webKillswitchReceived:473,webKillswitchExecuted:474,cameraOpenEvent:475,manualSmoothnessMeasurement:476,tvhtml5AppQualityEvent:477,polymerPropertyAccessEvent:479,miniAppSdkUsage:480,cobaltTelemetryEvent:481,crossDevicePlayback:482,channelCreatedWithObakeImage:484,channelEditedWithObakeImage:485,offlineDeleteEvent:486,
crossDeviceNotificationTransfer:487,androidIntentEvent:488,unpluggedAmbientInterludesCounterfactualEvent:489,keyPlaysPlayback:490,shortsCreationFallbackEvent:493,vssData:491,castMatch:494,miniAppPerformanceMetrics:495,userFeedbackEvent:496,kidsGuestSessionMismatch:498,musicSideloadedPlaylistMigrationEvent:499,sleepTimerSessionFinishEvent:500,watchEpPromoConflict:503,innertubeResponseCacheMetrics:505,miniAppAdEvent:506,dataPlanUpsellEvent:507,producerProjectRenamed:508,producerMediaSelectionEvent:511,
embedsAutoplayStatusChanged:512,remoteConnectEvent:513,connectedSessionMisattributionEvent:514,producerProjectElementModified:515,adsSeenClientLogging:517,producerEvent:518,tvhtml5CleanStart:519,deviceAccountMetricsEvent:520,derpLogEvent:521,playablesPortalEvent:523,ipValidationStarted:524,ipValidationReceived:525,reelsSequenceMutationEvent:527,watchZoomStateChange:528,metadataEditorEvent:529,kidsPrismaDeeplinksEvent:530,creationOrchestrationEvent:531,coordinatedSamplingTriggered:532,dnaRecapScreenshotEvent:534,
mdxLocalNetworkPermissionRequestEvent:536,mdxLocalNetworkPermissionResponseEvent:537,sessionReplayEvent:538,sessionReplayStatusEvent:539,loggingReliabilityProbe:540,keyValueStoreStatsEvent:541,deviceLocationPermissionEvent:542,remoteControlStarted:543,remoteControlCompleted:544};var Rv={},Sv=hu("ServiceWorkerLogsDatabase",{Rb:(Rv.SWHealthLog={Zb:1},Rv),shared:!0,upgrade:function(a,b){b(1)&&tt(mt(a,"SWHealthLog",{keyPath:"id",autoIncrement:!0}),"swHealthNewRequest",["interface","timestamp"])},
version:1});function Tv(a){return Ht(Sv(),a)}
function Uv(a){var b,c;C(function(d){if(d.h==1)return d.yield(Tv(a),2);b=d.i;c=V()-2592E6;return d.yield(lt(b,["SWHealthLog"],{mode:"readwrite",pa:!0},function(e){return vt(e.objectStore("SWHealthLog"),{},function(f){if(f.getValue().timestamp<=c)return f.delete().then(function(){return wt(f)})})}),0)})}
function Vv(a){var b;return C(function(c){if(c.h==1)return c.yield(Tv(a),2);b=c.i;return c.yield(b.clear("SWHealthLog"),0)})}
;var Wv={},Xv=0;function Yv(a){var b=b===void 0?{}:b;var c=new Image,d=""+Xv++;Wv[d]=c;c.onload=c.onerror=function(){delete Wv[d]};
b.Ej&&(c.referrerPolicy="no-referrer");c.src=a}
;var Zv;function $v(){Zv||(Zv=new vs("yt.offline"));return Zv}
function aw(a){if(T("offline_error_handling")){var b=$v().get("errors",!0)||{};b[a.message]={name:a.name,stack:a.stack};a.level&&(b[a.message].level=a.level);$v().set("errors",b,2592E3,!0)}}
;function bw(){this.h=new Map;this.i=!1}
function cw(){if(!bw.instance){var a=I("yt.networkRequestMonitor.instance")||new bw;G("yt.networkRequestMonitor.instance",a);bw.instance=a}return bw.instance}
bw.prototype.requestComplete=function(a,b){b&&(this.i=!0);a=this.removeParams(a);this.h.get(a)||this.h.set(a,b)};
bw.prototype.isEndpointCFR=function(a){a=this.removeParams(a);return(a=this.h.get(a))?!1:a===!1&&this.i?!0:null};
bw.prototype.removeParams=function(a){return a.split("?")[0]};
bw.prototype.removeParams=bw.prototype.removeParams;bw.prototype.isEndpointCFR=bw.prototype.isEndpointCFR;bw.prototype.requestComplete=bw.prototype.requestComplete;bw.getInstance=cw;function dw(){lk.call(this);var a=this;this.j=!1;this.h=un();this.h.listen("networkstatus-online",function(){if(a.j&&T("offline_error_handling")){var b=$v().get("errors",!0);if(b){for(var c in b)if(b[c]){var d=new U(c,"sent via offline_errors");d.name=b[c].name;d.stack=b[c].stack;d.level=b[c].level;mq(d)}$v().set("errors",{},2592E3,!0)}}})}
v(dw,lk);function ew(){if(!dw.instance){var a=I("yt.networkStatusManager.instance")||new dw;G("yt.networkStatusManager.instance",a);dw.instance=a}return dw.instance}
n=dw.prototype;n.za=function(){return this.h.za()};
n.tb=function(a){this.h.h=a};
n.zf=function(){var a=window.navigator.onLine;return a===void 0?!0:a};
n.ef=function(){this.j=!0};
n.listen=function(a,b){return this.h.listen(a,b)};
n.bd=function(a){return sn(this.h,a)};
dw.prototype.sendNetworkCheckRequest=dw.prototype.bd;dw.prototype.listen=dw.prototype.listen;dw.prototype.enableErrorFlushing=dw.prototype.ef;dw.prototype.getWindowStatus=dw.prototype.zf;dw.prototype.networkStatusHint=dw.prototype.tb;dw.prototype.isNetworkAvailable=dw.prototype.za;dw.getInstance=ew;function fw(a){a=a===void 0?{}:a;lk.call(this);var b=this;this.h=this.u=0;this.j=ew();var c=I("yt.networkStatusManager.instance.listen").bind(this.j);c&&(a.rateLimit?(this.rateLimit=a.rateLimit,c("networkstatus-online",function(){gw(b,"publicytnetworkstatus-online")}),c("networkstatus-offline",function(){gw(b,"publicytnetworkstatus-offline")})):(c("networkstatus-online",function(){mk(b,"publicytnetworkstatus-online")}),c("networkstatus-offline",function(){mk(b,"publicytnetworkstatus-offline")})))}
v(fw,lk);fw.prototype.za=function(){var a=I("yt.networkStatusManager.instance.isNetworkAvailable");return a?a.bind(this.j)():!0};
fw.prototype.tb=function(a){var b=I("yt.networkStatusManager.instance.networkStatusHint").bind(this.j);b&&b(a)};
fw.prototype.bd=function(a){var b=this,c;return C(function(d){c=I("yt.networkStatusManager.instance.sendNetworkCheckRequest").bind(b.j);return T("skip_network_check_if_cfr")&&cw().isEndpointCFR("generate_204")?d.return(new Promise(function(e){var f;b.tb(((f=window.navigator)==null?void 0:f.onLine)||!0);e(b.za())})):c?d.return(c(a)):d.return(!0)})};
function gw(a,b){a.rateLimit?a.h?(vn.xa(a.u),a.u=vn.wa(function(){a.o!==b&&(mk(a,b),a.o=b,a.h=V())},a.rateLimit-(V()-a.h))):(mk(a,b),a.o=b,a.h=V()):mk(a,b)}
;var hw;function iw(){var a=rv.call;hw||(hw=new fw({pj:!0,ej:!0}));a.call(rv,this,{ka:{We:Ov,Gb:Nv,Vd:Kv,Nf:Lv,Dd:Mv,set:Iv},ia:hw,handleError:function(b,c,d){var e,f=d==null?void 0:(e=d.error)==null?void 0:e.code;if(f===400||f===415){var g;b=new U(b.message,c,d==null?void 0:(g=d.error)==null?void 0:g.code);nq(b,void 0,void 0,void 0,!0)}else mq(b)},
Jb:nq,sendFn:jw,now:V,Je:aw,Ia:us(),Cd:"publicytnetworkstatus-online",zd:"publicytnetworkstatus-offline",Hc:!0,Fc:.1,Wc:en("potential_esf_error_limit",10),da:T,fc:!(Kr()&&kw())});this.j=new Il;T("networkless_immediately_drop_all_requests")&&Pv();eu("LogsDatabaseV2")}
v(iw,rv);function lw(){var a=I("yt.networklessRequestController.instance");a||(a=new iw,G("yt.networklessRequestController.instance",a),T("networkless_logging")&&Ut().then(function(b){a.aa=b;tv(a);a.j.resolve();a.Hc&&Math.random()<=a.Fc&&a.aa&&Uv(a.aa);T("networkless_immediately_drop_sw_health_store")&&mw(a)}));
return a}
iw.prototype.writeThenSend=function(a,b){b||(b={});b=nw(a,b);Kr()||(this.h=!1);rv.prototype.writeThenSend.call(this,a,b)};
iw.prototype.sendThenWrite=function(a,b,c){b||(b={});b=nw(a,b);Kr()||(this.h=!1);rv.prototype.sendThenWrite.call(this,a,b,c)};
iw.prototype.sendAndWrite=function(a,b){b||(b={});b=nw(a,b);Kr()||(this.h=!1);rv.prototype.sendAndWrite.call(this,a,b)};
iw.prototype.awaitInitialization=function(){return this.j.promise};
function mw(a){var b;C(function(c){if(!a.aa)throw b=Ws("clearSWHealthLogsDb"),b;return c.return(Vv(a.aa).catch(function(d){a.handleError(d)}))})}
function jw(a,b,c,d){d=d===void 0?!1:d;b=T("web_fp_via_jspb")?Object.assign({},b):b;if(T("use_request_time_ms_header"))b.headers&&yq(a)&&(b.headers["X-Goog-Request-Time"]=JSON.stringify(Math.round(V())));else{var e;if((e=b.postParams)==null?0:e.requestTimeMs)b.postParams.requestTimeMs=Math.round(V())}if(c&&Object.keys(b).length===0){var f=f===void 0?"":f;var g=g===void 0?!1:g;var h=h===void 0?!1:h;if(a)if(f)Oq(a,void 0,"POST",f,void 0);else if(S("USE_NET_AJAX_FOR_PING_TRANSPORT",!1)||h)Oq(a,void 0,
"GET","",void 0,void 0,g,h);else{b:{try{c:{var k=new $a({url:a});if(k.h.dsh==="1")var l=null;else{var m=k.h.ae;if(m==="1"){var p=k.h.adurl;if(p)try{l={version:3,cf:decodeURIComponent(p),Qe:Ya(k.i,"act=1","ri=1",ab(k))};break c}catch(ma){}}l=m==="2"?{version:4,cf:Ya(k.i,"dct=1","suid="+k.j,"ri=1"),Qe:Ya(k.i,"act=1","ri=1","suid="+k.j)}:null}}if(l){var r=ic(a),t;if(!(t=!r||!r.endsWith("/aclk"))){var w=a.search(qc),y=pc(a,0,"ri",w);if(y<0)var x=null;else{var H=a.indexOf("&",y);if(H<0||H>w)H=w;x=cc(a.slice(y+
3,H!==-1?H:0))}t=x!=="1"}var F=!t;break b}}catch(ma){}F=!1}if(F){b:{try{if(window.navigator&&window.navigator.sendBeacon&&window.navigator.sendBeacon(a,"")){var W=!0;break b}}catch(ma){}W=!1}c=W?!0:!1}else c=!1;c||Yv(a)}}else b.compress?b.postBody?(typeof b.postBody!=="string"&&(b.postBody=JSON.stringify(b.postBody)),gv(a,b.postBody,b,Sq,d)):gv(a,JSON.stringify(b.postParams),b,Rq,d):Sq(a,b)}
function nw(a,b){T("use_event_time_ms_header")&&yq(a)&&(b.headers||(b.headers={}),b.headers["X-Goog-Event-Time"]=JSON.stringify(Math.round(V())));return b}
function kw(){return hc(document.location.toString())!=="www.youtube-nocookie.com"}
;var ow=!1,pw=E.ytNetworklessLoggingInitializationOptions||{isNwlInitialized:ow};G("ytNetworklessLoggingInitializationOptions",pw);function qw(){var a;C(function(b){if(b.h==1)return b.yield(Ut(),2);a=b.i;if(!a||!Kr()&&!T("nwl_init_require_datasync_id_killswitch")||!kw())return b.v(0);ow=!0;pw.isNwlInitialized=ow;return b.yield(lw().awaitInitialization(),0)})}
;function rw(a){var b=this;this.config_=null;a?this.config_=a:vu()&&(this.config_=wu());Nr(function(){pv(b)},5E3)}
rw.prototype.isReady=function(){!this.config_&&vu()&&(this.config_=wu());return!!this.config_};
function qv(a,b,c,d){function e(p){p=p===void 0?!1:p;var r;if(d.retry&&h!="www.youtube-nocookie.com"&&(p||T("skip_ls_gel_retry")||g.headers["Content-Type"]!=="application/json"||(r=nv(b,c,l,k)),r)){var t=g.onSuccess,w=g.onFetchSuccess;g.onSuccess=function(H,F){ov(r);t(H,F)};
c.onFetchSuccess=function(H,F){ov(r);w(H,F)}}try{if(p&&d.retry&&!d.networklessOptions.bypassNetworkless)g.method="POST",d.networklessOptions.writeThenSend?lw().writeThenSend(m,g):lw().sendAndWrite(m,g);
else if(d.compress){var y=!d.networklessOptions.writeThenSend;if(g.postBody){var x=g.postBody;typeof x!=="string"&&(x=JSON.stringify(g.postBody));gv(m,x,g,Sq,y)}else gv(m,JSON.stringify(g.postParams),g,Rq,y)}else Rq(m,g)}catch(H){if(H.name==="InvalidAccessError")r&&(ov(r),r=0),nq(Error("An extension is blocking network request."));else throw H;}r&&Nr(function(){pv(a)},5E3)}
!S("VISITOR_DATA")&&b!=="visitor_id"&&Math.random()<.01&&nq(new U("Missing VISITOR_DATA when sending innertube request.",b,c,d));if(!a.isReady()){var f=new U("innertube xhrclient not ready",b,c,d);mq(f);throw f;}var g={headers:d.headers||{},method:"POST",postParams:c,postBody:d.postBody,postBodyFormat:d.postBodyFormat||"JSON",onTimeout:function(){d.onTimeout()},
onFetchTimeout:d.onTimeout,onSuccess:function(p,r){if(d.onSuccess)d.onSuccess(r)},
onFetchSuccess:function(p){if(d.onSuccess)d.onSuccess(p)},
onProgress:function(p){if(d.onProgress)d.onProgress(p)},
onError:function(p,r){if(d.onError)d.onError(r)},
onFetchError:function(p){if(d.onError)d.onError(p)},
timeout:d.timeout,withCredentials:!0,compress:d.compress};g.headers["Content-Type"]||(g.headers["Content-Type"]="application/json");var h="";(f=a.config_.Gf)&&(h=f);var k=a.config_.Hf||!1,l=yu(k,h,d);Object.assign(g.headers,l);g.headers.Authorization&&!h&&k&&(g.headers["x-origin"]=window.location.origin);var m=wq(""+h+("/youtubei/"+a.config_.innertubeApiVersion+"/"+b),{alt:"json"});(I("ytNetworklessLoggingInitializationOptions")?pw.isNwlInitialized:ow)?St().then(function(p){e(p)}):e(!1)}
;var sw=0,tw=ud?"webkit":td?"moz":rd?"ms":qd?"o":"";G("ytDomDomGetNextId",I("ytDomDomGetNextId")||function(){return++sw});var uw={stopImmediatePropagation:1,stopPropagation:1,preventMouseEvent:1,preventManipulation:1,preventDefault:1,layerX:1,layerY:1,screenX:1,screenY:1,scale:1,rotation:1,webkitMovementX:1,webkitMovementY:1};
function vw(a){this.type="";this.state=this.source=this.data=this.currentTarget=this.relatedTarget=this.target=null;this.charCode=this.keyCode=0;this.metaKey=this.shiftKey=this.ctrlKey=this.altKey=!1;this.rotation=this.clientY=this.clientX=0;this.scale=1;this.changedTouches=this.touches=null;try{if(a=a||window.event){this.event=a;for(var b in a)b in uw||(this[b]=a[b]);this.scale=a.scale;this.rotation=a.rotation;var c=a.target||a.srcElement;c&&c.nodeType==3&&(c=c.parentNode);this.target=c;var d=a.relatedTarget;
if(d)try{d=d.nodeName?d:null}catch(e){d=null}else this.type=="mouseover"?d=a.fromElement:this.type=="mouseout"&&(d=a.toElement);this.relatedTarget=d;this.clientX=a.clientX!=void 0?a.clientX:a.pageX;this.clientY=a.clientY!=void 0?a.clientY:a.pageY;this.keyCode=a.keyCode?a.keyCode:a.which;this.charCode=a.charCode||(this.type=="keypress"?this.keyCode:0);this.altKey=a.altKey;this.ctrlKey=a.ctrlKey;this.shiftKey=a.shiftKey;this.metaKey=a.metaKey;this.h=a.pageX;this.i=a.pageY}}catch(e){}}
function ww(a){if(document.body&&document.documentElement){var b=document.body.scrollTop+document.documentElement.scrollTop;a.h=a.clientX+(document.body.scrollLeft+document.documentElement.scrollLeft);a.i=a.clientY+b}}
vw.prototype.preventDefault=function(){this.event&&(this.event.returnValue=!1,this.event.preventDefault&&this.event.preventDefault())};
vw.prototype.stopPropagation=function(){this.event&&(this.event.cancelBubble=!0,this.event.stopPropagation&&this.event.stopPropagation())};
vw.prototype.stopImmediatePropagation=function(){this.event&&(this.event.cancelBubble=!0,this.event.stopImmediatePropagation&&this.event.stopImmediatePropagation())};var Di=E.ytEventsEventsListeners||{};G("ytEventsEventsListeners",Di);var xw=E.ytEventsEventsCounter||{count:0};G("ytEventsEventsCounter",xw);
function yw(a,b,c,d){d=d===void 0?{}:d;a.addEventListener&&(b!="mouseenter"||"onmouseenter"in document?b!="mouseleave"||"onmouseenter"in document?b=="mousewheel"&&"MozBoxSizing"in document.documentElement.style&&(b="MozMousePixelScroll"):b="mouseout":b="mouseover");return Ci(function(e){var f=typeof e[4]==="boolean"&&e[4]==!!d,g=La(e[4])&&La(d)&&Hi(e[4],d);return!!e.length&&e[0]==a&&e[1]==b&&e[2]==c&&(f||g)})}
function zw(a,b,c,d){d=d===void 0?{}:d;if(!a||!a.addEventListener&&!a.attachEvent)return"";var e=yw(a,b,c,d);if(e)return e;e=++xw.count+"";var f=!(b!="mouseenter"&&b!="mouseleave"||!a.addEventListener||"onmouseenter"in document);var g=f?function(h){h=new vw(h);if(!Si(h.relatedTarget,function(k){return k==a}))return h.currentTarget=a,h.type=b,c.call(a,h)}:function(h){h=new vw(h);
h.currentTarget=a;return c.call(a,h)};
g=lq(g);a.addEventListener?(b=="mouseenter"&&f?b="mouseover":b=="mouseleave"&&f?b="mouseout":b=="mousewheel"&&"MozBoxSizing"in document.documentElement.style&&(b="MozMousePixelScroll"),Aw()||typeof d==="boolean"?a.addEventListener(b,g,d):a.addEventListener(b,g,!!d.capture)):a.attachEvent("on"+b,g);Di[e]=[a,b,c,g,d];return e}
function Bw(a){a&&(typeof a=="string"&&(a=[a]),Pb(a,function(b){if(b in Di){var c=Di[b],d=c[0],e=c[1],f=c[3];c=c[4];d.removeEventListener?Aw()||typeof c==="boolean"?d.removeEventListener(e,f,c):d.removeEventListener(e,f,!!c.capture):d.detachEvent&&d.detachEvent("on"+e,f);delete Di[b]}}))}
var Aw=Bk(function(){var a=!1;try{var b=Object.defineProperty({},"capture",{get:function(){a=!0}});
window.addEventListener("test",null,b)}catch(c){}return a});function Cw(a){this.G=a;this.h=null;this.o=0;this.B=null;this.u=0;this.i=[];for(a=0;a<4;a++)this.i.push(0);this.j=0;this.M=zw(window,"mousemove",Ta(this.X,this));a=Ta(this.I,this);typeof a==="function"&&(a=lq(a));this.Z=window.setInterval(a,25)}
Xa(Cw,K);Cw.prototype.X=function(a){a.h===void 0&&ww(a);var b=a.h;a.i===void 0&&ww(a);this.h=new yi(b,a.i)};
Cw.prototype.I=function(){if(this.h){var a=V();if(this.o!=0){var b=this.B,c=this.h,d=b.x-c.x;b=b.y-c.y;d=Math.sqrt(d*d+b*b)/(a-this.o);this.i[this.j]=Math.abs((d-this.u)/this.u)>.5?1:0;for(c=b=0;c<4;c++)b+=this.i[c]||0;b>=3&&this.G();this.u=d}this.o=a;this.B=this.h;this.j=(this.j+1)%4}};
Cw.prototype.ba=function(){window.clearInterval(this.Z);Bw(this.M)};var Dw={};function Ew(a){var b=a===void 0?{}:a;a=b.dg===void 0?!1:b.dg;b=b.ff===void 0?!0:b.ff;if(I("_lact",window)==null){var c=parseInt(S("LACT"),10);c=isFinite(c)?Date.now()-Math.max(c,0):-1;G("_lact",c,window);G("_fact",c,window);c==-1&&Fw();Gw(a,b);new Cw(function(){Hw("mouse",100)})}}
function Gw(a,b){var c=window;a=a===void 0?!1:a;b=b===void 0?!0:b;zw(c.document,"keydown",Fw);zw(c.document,"keyup",Fw);zw(c.document,"mousedown",Fw);zw(c.document,"mouseup",Fw);a?zw(c,"touchmove",function(){Hw("touchmove",200)},{passive:!0}):(zw(c,"resize",function(){Hw("resize",200)}),b&&zw(c,"scroll",function(){Hw("scroll",200)}));
zw(c.document,"touchstart",Fw,{passive:!0});zw(c.document,"touchend",Fw,{passive:!0})}
function Hw(a,b){Dw[a]||(Dw[a]=!0,vn.wa(function(){Fw();Dw[a]=!1},b))}
function Fw(){I("_lact",window)==null&&Ew();var a=Date.now();G("_lact",a,window);I("_fact",window)==-1&&G("_fact",a,window);(a=I("ytglobal.ytUtilActivityCallback_"))&&a()}
function Iw(){var a=I("_lact",window);return a==null?-1:Math.max(Date.now()-a,0)}
;var Jw=E.ytPubsubPubsubInstance||new Ln,Kw=E.ytPubsubPubsubSubscribedKeys||{},Lw=E.ytPubsubPubsubTopicToKeys||{},Mw=E.ytPubsubPubsubIsSynchronous||{};function Nw(a,b){var c=Ow();if(c&&b){var d=c.subscribe(a,function(){function e(){Kw[d]&&b.apply&&typeof b.apply=="function"&&b.apply(window,f)}
var f=arguments;try{Mw[a]?e():Fq(e,0)}catch(g){mq(g)}},void 0);
Kw[d]=!0;Lw[a]||(Lw[a]=[]);Lw[a].push(d);return d}return 0}
function Pw(a){var b=Ow();b&&(typeof a==="number"?a=[a]:typeof a==="string"&&(a=[parseInt(a,10)]),Pb(a,function(c){b.unsubscribeByKey(c);delete Kw[c]}))}
function Qw(a,b){var c=Ow();c&&c.publish.apply(c,arguments)}
function Rw(a){var b=Ow();if(b)if(b.clear(a),a)Sw(a);else for(var c in Lw)Sw(c)}
function Ow(){return E.ytPubsubPubsubInstance}
function Sw(a){Lw[a]&&(a=Lw[a],Pb(a,function(b){Kw[b]&&delete Kw[b]}),a.length=0)}
Ln.prototype.subscribe=Ln.prototype.subscribe;Ln.prototype.unsubscribeByKey=Ln.prototype.yc;Ln.prototype.publish=Ln.prototype.Ab;Ln.prototype.clear=Ln.prototype.clear;G("ytPubsubPubsubInstance",Jw);G("ytPubsubPubsubTopicToKeys",Lw);G("ytPubsubPubsubIsSynchronous",Mw);G("ytPubsubPubsubSubscribedKeys",Kw);var Tw=Symbol("injectionDeps");function Uw(a){this.name=a}
Uw.prototype.toString=function(){return"InjectionToken("+this.name+")"};
function Vw(a){this.key=a}
function Ww(){this.i=new Map;this.j=new Map;this.h=new Map}
function Xw(a,b){a.i.set(b.qc,b);var c=a.j.get(b.qc);if(c)try{c.Zc(a.resolve(b.qc))}catch(d){c.Aj(d)}}
Ww.prototype.resolve=function(a){return a instanceof Vw?Yw(this,a.key,[],!0):Yw(this,a,[])};
function Yw(a,b,c,d){d=d===void 0?!1:d;if(c.indexOf(b)>-1)throw Error("Deps cycle for: "+b);if(a.h.has(b))return a.h.get(b);if(!a.i.has(b)){if(d)return;throw Error("No provider for: "+b);}d=a.i.get(b);c.push(b);if(d.Be!==void 0)var e=d.Be;else if(d.Jg)e=d[Tw]?Zw(a,d[Tw],c):[],e=d.Jg.apply(d,A(e));else if(d.Id){e=d.Id;var f=e[Tw]?Zw(a,e[Tw],c):[];e=new (Function.prototype.bind.apply(e,[null].concat(A(f))))}else throw Error("Could not resolve providers for: "+b);c.pop();d.Ij||a.h.set(b,e);return e}
function Zw(a,b,c){return b?b.map(function(d){return d instanceof Vw?Yw(a,d.key,c,!0):Yw(a,d,c)}):[]}
;var $w;function ax(){$w||($w=new Ww);return $w}
;var bx=window;function cx(){var a,b;return"h5vcc"in bx&&((a=bx.h5vcc.traceEvent)==null?0:a.traceBegin)&&((b=bx.h5vcc.traceEvent)==null?0:b.traceEnd)?1:"performance"in bx&&bx.performance.mark&&bx.performance.measure?2:0}
function dx(a){var b=cx();switch(b){case 1:bx.h5vcc.traceEvent.traceBegin("YTLR",a);break;case 2:bx.performance.mark(a+"-start");break;case 0:break;default:Ab(b,"unknown trace type")}}
function ex(a){var b=cx();switch(b){case 1:bx.h5vcc.traceEvent.traceEnd("YTLR",a);break;case 2:b=a+"-start";var c=a+"-end";bx.performance.mark(c);bx.performance.measure(a,b,c);break;case 0:break;default:Ab(b,"unknown trace type")}}
;var fx=T("web_enable_lifecycle_monitoring")&&cx()!==0,gx=T("web_enable_lifecycle_monitoring");function hx(a){var b,c;(c=(b=window).onerror)==null||c.call(b,a.message,"",0,0,a)}
;function ix(a){var b=this;var c=c===void 0?0:c;var d=d===void 0?us():d;this.j=c;this.scheduler=d;this.i=new Il;this.h=a;for(a={qb:0};a.qb<this.h.length;a={Vc:void 0,qb:a.qb},a.qb++)a.Vc=this.h[a.qb],c=function(e){return function(){e.Vc.sd();b.h[e.qb].Xc=!0;b.h.every(function(f){return f.Xc===!0})&&b.i.resolve()}}(a),d=this.getPriority(a.Vc),d=this.scheduler.ab(c,d),this.h[a.qb]=Object.assign({},a.Vc,{sd:c,
jobId:d})}
function jx(a){var b=Array.from(a.h.keys()).sort(function(d,e){return a.getPriority(a.h[e])-a.getPriority(a.h[d])});
b=z(b);for(var c=b.next();!c.done;c=b.next())c=a.h[c.value],c.jobId===void 0||c.Xc||(a.scheduler.xa(c.jobId),a.scheduler.ab(c.sd,10))}
ix.prototype.cancel=function(){for(var a=z(this.h),b=a.next();!b.done;b=a.next())b=b.value,b.jobId===void 0||b.Xc||this.scheduler.xa(b.jobId),b.Xc=!0;this.i.resolve()};
ix.prototype.getPriority=function(a){var b;return(b=a.priority)!=null?b:this.j};function kx(a){this.state=a;this.plugins=[];this.o=void 0;this.B={};fx&&dx(this.state)}
n=kx.prototype;n.install=function(a){this.plugins.push(a);return this};
n.uninstall=function(){var a=this;D.apply(0,arguments).forEach(function(b){b=a.plugins.indexOf(b);b>-1&&a.plugins.splice(b,1)})};
n.transition=function(a,b){var c=this;fx&&ex(this.state);var d=this.transitions.find(function(f){return Array.isArray(f.from)?f.from.find(function(g){return g===c.state&&f.to===a}):f.from===c.state&&f.to===a});
if(d){this.j&&(jx(this.j),this.j=void 0);lx(this,a,b);this.state=a;fx&&dx(this.state);d=d.action.bind(this);var e=this.plugins.filter(function(f){return f[a]}).map(function(f){return f[a]});
d(mx(this,e),b)}else throw Error("no transition specified from "+this.state+" to "+a);};
function mx(a,b){var c=b.filter(function(e){return nx(a,e)===10}),d=b.filter(function(e){return nx(a,e)!==10});
return a.B.Hj?function(){var e=D.apply(0,arguments);return C(function(f){if(f.h==1)return f.yield(a.jg.apply(a,[c].concat(A(e))),2);a.te.apply(a,[d].concat(A(e)));f.o()})}:function(){var e=D.apply(0,arguments);
a.kg.apply(a,[c].concat(A(e)));a.te.apply(a,[d].concat(A(e)))}}
n.kg=function(a){for(var b=D.apply(1,arguments),c=us(),d=z(a),e=d.next(),f={};!e.done;f={jc:void 0},e=d.next())f.jc=e.value,c.Yb(function(g){return function(){ox(g.jc.name);px(function(){return g.jc.callback.apply(g.jc,A(b))});
qx(g.jc.name)}}(f))};
n.jg=function(a){var b=D.apply(1,arguments),c,d,e,f,g;return C(function(h){h.h==1&&(c=us(),d=z(a),e=d.next(),f={});if(h.h!=3){if(e.done)return h.v(0);f.hb=e.value;f.zc=void 0;g=function(k){return function(){ox(k.hb.name);var l=px(function(){return k.hb.callback.apply(k.hb,A(b))});
Ae(l)?k.zc=T("web_lifecycle_error_handling_killswitch")?l.then(function(){qx(k.hb.name)}):l.then(function(){qx(k.hb.name)},function(m){hx(m);
qx(k.hb.name)}):qx(k.hb.name)}}(f);
c.Yb(g);return f.zc?h.yield(f.zc,3):h.v(3)}f={hb:void 0,zc:void 0};e=d.next();return h.v(2)})};
n.te=function(a){var b=D.apply(1,arguments),c=this,d=a.map(function(e){return{sd:function(){ox(e.name);px(function(){return e.callback.apply(e,A(b))});
qx(e.name)},
priority:nx(c,e)}});
d.length&&(this.j=new ix(d))};
function nx(a,b){var c,d;return(d=(c=a.o)!=null?c:b.priority)!=null?d:0}
function ox(a){fx&&a&&dx(a)}
function qx(a){fx&&a&&ex(a)}
function lx(a,b,c){gx&&console.groupCollapsed&&console.groupEnd&&(console.groupCollapsed("["+a.constructor.name+"] '"+a.state+"' to '"+b+"'"),console.log("with message: ",c),console.groupEnd())}
da.Object.defineProperties(kx.prototype,{currentState:{configurable:!0,enumerable:!0,get:function(){return this.state}}});
function px(a){if(T("web_lifecycle_error_handling_killswitch"))return a();try{return a()}catch(b){hx(b)}}
;function rx(a){kx.call(this,a===void 0?"none":a);this.h=null;this.o=10;this.transitions=[{from:"none",to:"application_navigating",action:this.i},{from:"application_navigating",to:"none",action:this.u},{from:"application_navigating",to:"application_navigating",action:function(){}},
{from:"none",to:"none",action:function(){}}]}
var sx;v(rx,kx);rx.prototype.i=function(a,b){var c=this;this.h=Nr(function(){c.currentState==="application_navigating"&&c.transition("none")},5E3);
a(b==null?void 0:b.event)};
rx.prototype.u=function(a,b){this.h&&(vn.xa(this.h),this.h=null);a(b==null?void 0:b.event)};
function tx(){sx||(sx=new rx);return sx}
;var ux=[];G("yt.logging.transport.getScrapedGelPayloads",function(){return ux});function vx(){this.store={};this.h={}}
vx.prototype.storePayload=function(a,b){a=wx(a);this.store[a]?this.store[a].push(b):(this.h={},this.store[a]=[b]);T("more_accurate_gel_parser")&&(b=new CustomEvent("TRANSPORTING_NEW_EVENT"),window.dispatchEvent(b));return a};
vx.prototype.smartExtractMatchingEntries=function(a){if(!a.keys.length)return[];for(var b=xx(this,a.keys.splice(0,1)[0]),c=[],d=0;d<b.length;d++)this.store[b[d]]&&a.sizeLimit&&(this.store[b[d]].length<=a.sizeLimit?(c.push.apply(c,A(this.store[b[d]])),delete this.store[b[d]]):c.push.apply(c,A(this.store[b[d]].splice(0,a.sizeLimit))));(a==null?0:a.sizeLimit)&&c.length<(a==null?void 0:a.sizeLimit)&&(a.sizeLimit-=c.length,c.push.apply(c,A(this.smartExtractMatchingEntries(a))));return c};
vx.prototype.extractMatchingEntries=function(a){a=xx(this,a);for(var b=[],c=0;c<a.length;c++)this.store[a[c]]&&(b.push.apply(b,A(this.store[a[c]])),delete this.store[a[c]]);return b};
vx.prototype.getSequenceCount=function(a){a=xx(this,a);for(var b=0,c=0;c<a.length;c++){var d=void 0;b+=((d=this.store[a[c]])==null?void 0:d.length)||0}return b};
function xx(a,b){var c=wx(b);if(a.h[c])return a.h[c];var d=Object.keys(a.store)||[];if(d.length<=1&&wx(b)===d[0])return d;for(var e=[],f=0;f<d.length;f++){var g=d[f].split("/");if(yx(b.auth,g[0])){var h=b.isJspb;yx(h===void 0?"undefined":h?"true":"false",g[1])&&yx(b.cttAuthInfo,g[2])&&(h=b.tier,h=h===void 0?"undefined":JSON.stringify(h),yx(h,g[3])&&e.push(d[f]))}}return a.h[c]=e}
function yx(a,b){return a===void 0||a==="undefined"?!0:a===b}
vx.prototype.getSequenceCount=vx.prototype.getSequenceCount;vx.prototype.extractMatchingEntries=vx.prototype.extractMatchingEntries;vx.prototype.smartExtractMatchingEntries=vx.prototype.smartExtractMatchingEntries;vx.prototype.storePayload=vx.prototype.storePayload;function wx(a){return[a.auth===void 0?"undefined":a.auth,a.isJspb===void 0?"undefined":a.isJspb,a.cttAuthInfo===void 0?"undefined":a.cttAuthInfo,a.tier===void 0?"undefined":a.tier].join("/")}
;function zx(a,b){if(a)return a[b.name]}
;var Ax=new Uw("FinchConfigManagerService");var Bx=en("initial_gel_batch_timeout",2E3),Cx=en("gel_queue_timeout_max_ms",6E4),Dx=en("gel_min_batch_size",5),Ex=void 0;function Fx(){this.o=this.h=this.i=0;this.j=!1}
var Gx=new Fx,Hx=new Fx,Ix=new Fx,Jx=new Fx,Kx,Lx=!0,Mx=E.ytLoggingTransportTokensToCttTargetIds_||{};G("ytLoggingTransportTokensToCttTargetIds_",Mx);var Nx={};function Ox(){var a=I("yt.logging.ims");a||(a=new vx,G("yt.logging.ims",a));return a}
function Px(a,b){if(a.endpoint==="log_event"){Qx(a);var c=Rx(a),d=Sx(a.payload)||"";a:{if(T("enable_web_tiered_gel")){var e=Qv[d||""];var f,g,h,k=ax().resolve(new Vw(qu))==null?void 0:(f=ru())==null?void 0:(g=f.loggingHotConfig)==null?void 0:(h=g.eventLoggingConfig)==null?void 0:h.payloadPolicies;if(k)for(f=0;f<k.length;f++)if(k[f].payloadNumber===e){e=k[f];break a}}e=void 0}k=200;if(e){if(e.enabled===!1&&!T("web_payload_policy_disabled_killswitch"))return;k=Tx(e.tier);if(k===400){Ux(a,b);return}}Nx[c]=
!0;c={cttAuthInfo:c,isJspb:!1,tier:k};Ox().storePayload(c,a.payload);Vx(b,c,d==="gelDebuggingEvent")}}
function Vx(a,b,c){function d(){Wx({writeThenSend:!0},void 0,e,b.tier)}
var e=!1;e=e===void 0?!1:e;c=c===void 0?!1:c;a&&(Ex=new a);a=en("tvhtml5_logging_max_batch_ads_fork")||en("tvhtml5_logging_max_batch")||en("web_logging_max_batch")||100;var f=V(),g=Xx(e,b.tier),h=g.o;c&&(g.j=!0);c=0;b&&(c=Ox().getSequenceCount(b));c>=1E3?d():c>=a?Kx||(Kx=Yx(function(){d();Kx=void 0},0)):f-h>=10&&(Zx(e,b.tier),g.o=f)}
function Ux(a,b){if(a.endpoint==="log_event"){T("more_accurate_gel_parser")&&Ox().storePayload({isJspb:!1},a.payload);Qx(a);var c=Rx(a),d=new Map;d.set(c,[a.payload]);var e=Sx(a.payload)||"";b&&(Ex=new b);return new Ck(function(f,g){Ex&&Ex.isReady()?$x(d,Ex,f,g,{bypassNetworkless:!0},!0,e==="gelDebuggingEvent"):f()})}}
function Rx(a){var b="";if(a.dangerousLogToVisitorSession)b="visitorOnlyApprovedKey";else if(a.cttAuthInfo){b=a.cttAuthInfo;var c={};b.videoId?c.videoId=b.videoId:b.playlistId&&(c.playlistId=b.playlistId);Mx[a.cttAuthInfo.token]=c;b=a.cttAuthInfo.token}return b}
function Wx(a,b,c,d){a=a===void 0?{}:a;c=c===void 0?!1:c;new Ck(function(e,f){var g=Xx(c,d),h=g.j;g.j=!1;ay(g.i);ay(g.h);g.h=0;Ex&&Ex.isReady()?d===void 0&&T("enable_web_tiered_gel")?by(e,f,a,b,c,300,h):by(e,f,a,b,c,d,h):(Zx(c,d),e())})}
function by(a,b,c,d,e,f,g){var h=Ex;c=c===void 0?{}:c;e=e===void 0?!1:e;f=f===void 0?200:f;g=g===void 0?!1:g;var k=new Map,l={isJspb:e,cttAuthInfo:d,tier:f};e={isJspb:e,cttAuthInfo:d};if(d!==void 0)f=T("enable_web_tiered_gel")?Ox().smartExtractMatchingEntries({keys:[l,e],sizeLimit:1E3}):Ox().extractMatchingEntries(e),k.set(d,f);else for(d=z(Object.keys(Nx)),l=d.next();!l.done;l=d.next())l=l.value,e=T("enable_web_tiered_gel")?Ox().smartExtractMatchingEntries({keys:[{isJspb:!1,cttAuthInfo:l,tier:f},
{isJspb:!1,cttAuthInfo:l}],sizeLimit:1E3}):Ox().extractMatchingEntries({isJspb:!1,cttAuthInfo:l}),e.length>0&&k.set(l,e),(T("web_fp_via_jspb_and_json")&&c.writeThenSend||!T("web_fp_via_jspb_and_json"))&&delete Nx[l];$x(k,h,a,b,c,!1,g)}
function Zx(a,b){function c(){Wx({writeThenSend:!0},void 0,a,b)}
a=a===void 0?!1:a;b=b===void 0?200:b;var d=Xx(a,b),e=d===Jx||d===Ix?5E3:Cx;T("web_gel_timeout_cap")&&!d.h&&(e=Yx(function(){c()},e),d.h=e);
ay(d.i);e=S("LOGGING_BATCH_TIMEOUT",en("web_gel_debounce_ms",1E4));T("shorten_initial_gel_batch_timeout")&&Lx&&(e=Bx);e=Yx(function(){en("gel_min_batch_size")>0?Ox().getSequenceCount({cttAuthInfo:void 0,isJspb:a,tier:b})>=Dx&&c():c()},e);
d.i=e}
function $x(a,b,c,d,e,f,g){e=e===void 0?{}:e;var h=Math.round(V()),k=a.size,l=(g===void 0?0:g)&&T("vss_through_gel_video_stats")?"video_stats":"log_event";a=z(a);var m=a.next();for(g={};!m.done;g={xd:void 0,batchRequest:void 0,dangerousLogToVisitorSession:void 0,Bd:void 0,Ad:void 0},m=a.next()){var p=z(m.value);m=p.next().value;p=p.next().value;g.batchRequest=Ji({context:xu(b.config_||wu())});if(!Ka(p)&&!T("throw_err_when_logevent_malformed_killswitch")){d();break}g.batchRequest.events=p;(p=Mx[m])&&
cy(g.batchRequest,m,p);delete Mx[m];g.dangerousLogToVisitorSession=m==="visitorOnlyApprovedKey";dy(g.batchRequest,h,g.dangerousLogToVisitorSession);T("always_send_and_write")&&(e.writeThenSend=!1);g.Bd=function(r){T("start_client_gcf")&&vn.wa(function(){return C(function(t){return t.yield(ey(r),0)})});
k--;k||c()};
g.xd=0;g.Ad=function(r){return function(){r.xd++;if(e.bypassNetworkless&&r.xd===1)try{qv(b,l,r.batchRequest,fy({writeThenSend:!0},r.dangerousLogToVisitorSession,r.Bd,r.Ad,f)),Lx=!1}catch(t){mq(t),d()}k--;k||c()}}(g);
try{qv(b,l,g.batchRequest,fy(e,g.dangerousLogToVisitorSession,g.Bd,g.Ad,f)),Lx=!1}catch(r){mq(r),d()}}}
function fy(a,b,c,d,e){a={retry:!0,onSuccess:c,onError:d,networklessOptions:a,dangerousLogToVisitorSession:b,Yi:!!e,headers:{},postBodyFormat:"",postBody:"",compress:T("compress_gel")||T("compress_gel_lr")};gy()&&(a.headers["X-Goog-Request-Time"]=JSON.stringify(Math.round(V())));return a}
function dy(a,b,c){gy()||(a.requestTimeMs=String(b));T("unsplit_gel_payloads_in_logs")&&(a.unsplitGelPayloadsInLogs=!0);!c&&(b=S("EVENT_ID"))&&((c=S("BATCH_CLIENT_COUNTER")||0)||(c=Math.floor(Math.random()*65535/2)),c++,c>65535&&(c=1),hq("BATCH_CLIENT_COUNTER",c),a.serializedClientEventId={serializedEventId:b,clientCounter:String(c)})}
function cy(a,b,c){if(c.videoId)var d="VIDEO";else if(c.playlistId)d="PLAYLIST";else return;a.credentialTransferTokenTargetId=c;a.context=a.context||{};a.context.user=a.context.user||{};a.context.user.credentialTransferTokens=[{token:b,scope:d}]}
function Qx(a){var b=Jq("il_payload_scraping")==="enable_il_payload_scraping";if(!I("yt.logging.transport.enableScrapingForTest"))if(b)ux=[],G("yt.logging.transport.enableScrapingForTest",!0),G("yt.logging.transport.scrapedPayloadsForTesting",ux),G("yt.logging.transport.payloadToScrape","visualElementShown visualElementHidden visualElementAttached screenCreated visualElementGestured visualElementStateChanged".split(" ")),G("yt.logging.transport.getScrapedPayloadFromClientEventsFunction"),G("yt.logging.transport.scrapeClientEvent",
!0);else return;b=I("yt.logging.transport.scrapedPayloadsForTesting");var c=I("yt.logging.transport.payloadToScrape"),d=I("yt.logging.transport.scrapeClientEvent");if(c&&c.length>=1)for(var e=0;e<c.length;e++)if(a&&a.payload[c[e]])if(d)b.push(a.payload);else{var f=void 0;b.push(((f=a)==null?void 0:f.payload)[c[e]])}G("yt.logging.transport.scrapedPayloadsForTesting",b)}
function gy(){return T("use_request_time_ms_header")||T("lr_use_request_time_ms_header")}
function Yx(a,b){return T("transport_use_scheduler")===!1?Fq(a,b):T("logging_avoid_blocking_during_navigation")||T("lr_logging_avoid_blocking_during_navigation")?Nr(function(){if(tx().currentState==="none")a();else{var c={};tx().install((c.none={callback:a},c))}},b):Nr(a,b)}
function ay(a){T("transport_use_scheduler")?vn.xa(a):window.clearTimeout(a)}
function ey(a){var b,c,d,e,f,g,h,k,l,m,p,r,t,w,y;return C(function(x){if(x.h==1)return d=(b=a)==null?void 0:(c=b.responseContext)==null?void 0:c.globalConfigGroup,e=zx(d,Jp),g=(f=d)==null?void 0:f.hotHashData,h=zx(d,Ip),l=(k=d)==null?void 0:k.coldHashData,(m=ax().resolve(new Vw(qu)))?g?e?x.yield(su(m,g,e),3):x.yield(su(m,g),3):x.v(3):x.v(2);if(x.h!=2)return l?h?x.yield(tu(m,l,h),2):x.yield(tu(m,l),2):x.v(2);r=(p=d)==null?void 0:p.rawFinchStaticConfigGroup;w=(t=d)==null?void 0:t.finchStaticHashData;
if(!w)return r&&nq(new U("Finch config data is present, but hash is missing.")),x.return();y=ax().resolve(new Vw(Ax));return y?x.yield(y.xj({config:r||{},aj:w||""}),0):((r||w)&&nq(new U("FinchConfigManagerService is not present, but Finch config data is present.")),x.v(0))})}
function Xx(a,b){b=b===void 0?200:b;return a?b===300?Jx:Hx:b===300?Ix:Gx}
function Sx(a){a=Object.keys(a);a=z(a);for(var b=a.next();!b.done;b=a.next())if(b=b.value,Qv[b])return b}
function Tx(a){switch(a){case "DELAYED_EVENT_TIER_UNSPECIFIED":return 0;case "DELAYED_EVENT_TIER_DEFAULT":return 100;case "DELAYED_EVENT_TIER_DISPATCH_TO_EMPTY":return 200;case "DELAYED_EVENT_TIER_FAST":return 300;case "DELAYED_EVENT_TIER_IMMEDIATE":return 400;default:return 200}}
;var hy=E.ytLoggingGelSequenceIdObj_||{};G("ytLoggingGelSequenceIdObj_",hy);
function iy(a,b,c,d){d=d===void 0?{}:d;var e={},f=Math.round(d.timestamp||V());e.eventTimeMs=f<Number.MAX_SAFE_INTEGER?f:0;e[a]=b;a=Iw();e.context={lastActivityMs:String(d.timestamp||!isFinite(a)?-1:a)};d.sequenceGroup&&!T("web_gel_sequence_info_killswitch")&&(a=e.context,b=d.sequenceGroup,hy[b]=b in hy?hy[b]+1:0,a.sequence={index:hy[b],groupKey:b},d.endOfSequence&&delete hy[d.sequenceGroup]);T("web_tag_automated_log_events")&&(e.context.automatedLogEventSource=d.automatedLogEventSource);(d.sendIsolatedPayload?
Ux:Px)({endpoint:"log_event",payload:e,cttAuthInfo:d.cttAuthInfo,dangerousLogToVisitorSession:d.dangerousLogToVisitorSession},c)}
;function Es(a,b,c){c=c===void 0?{}:c;var d=rw;S("ytLoggingEventsDefaultDisabled",!1)&&rw===rw&&(d=null);iy(a,b,d,c)}
;var jy=new Set,ky=0,ly=0,my=0,ny=[],oy=[],py=["PhantomJS","Googlebot","TO STOP THIS SECURITY SCAN go/scan"];function qy(){Pb(S("ERRORS")||[],function(a){ry.apply(null,a)});
hq("ERRORS",[])}
function Ds(a){ry(a)}
function sy(a){ry(a,"WARNING")}
function ty(a){a instanceof Error?ry(a):(a=La(a)?JSON.stringify(a):String(a),a=new U(a),a.name="RejectedPromiseError",sy(a))}
function uy(a,b,c,d,e,f){b=b===void 0?"Unknown file":b;c=c===void 0?0:c;var g=!1,h=iq("log_window_onerror_fraction");if(h&&Math.random()<h)g=!0;else{h=document.getElementsByTagName("script");for(var k=0,l=h.length;k<l;k++)if(h[k].src.indexOf("/debug-")>0){g=!0;break}}if(g){g=!1;e?g=!0:(typeof a==="string"?h=a:ErrorEvent&&a instanceof ErrorEvent?(g=!0,h=a.message,b=a.filename,c=a.lineno,d=a.colno):(h="Unknown error",b="Unknown file",c=0),e=new U(h),e.name="UnhandledWindowError",e.message=h,e.fileName=
b,e.lineNumber=c,isNaN(d)?delete e.columnNumber:e.columnNumber=d);if(!T("wiz_enable_component_stack_propagation_killswitch")){a=e;var m;if((m=f)==null||!m.componentStack)if(m=a.Ye)f||(f={}),f.componentStack=m}f&&vy(e,f);g?ry(e):sy(e)}}
function ry(a,b,c,d,e,f,g,h){f=f===void 0?{}:f;f.name=c||S("INNERTUBE_CONTEXT_CLIENT_NAME",1);f.version=d||S("INNERTUBE_CONTEXT_CLIENT_VERSION");c=f;b=b===void 0?"ERROR":b;g=g===void 0?!1:g;b=b===void 0?"ERROR":b;g=g===void 0?!1:g;if(a){a.hasOwnProperty("level")&&a.level&&(b=a.level);if(T("console_log_js_exceptions")||["test","dev","autopush","staging"].includes(S("SERVER_VERSION")))d=[],d.push("Name: "+a.name),d.push("Message: "+a.message),a.hasOwnProperty("params")&&d.push("Error Params: "+JSON.stringify(a.params)),
a.hasOwnProperty("args")&&d.push("Error args: "+JSON.stringify(a.args)),d.push("File name: "+a.fileName),d.push("Stacktrace: "+a.stack),d=d.join("\n"),window.console.log(d,a);if(!(ky>=5)){d=[];e=z(oy);for(f=e.next();!f.done;f=e.next()){f=f.value;try{f()&&d.push(f())}catch(x){}}d=[].concat(A(ny),A(d));var k=Zb(a);e=k.message||"Unknown Error";f=k.name||"UnknownError";var l=k.stack||a.i||"Not available";if(l.startsWith(f+": "+e)){var m=l.split("\n");m.shift();l=m.join("\n")}m=k.lineNumber||"Not available";
k=k.fileName||"Not available";var p=0;if(a.hasOwnProperty("args")&&a.args&&a.args.length)for(var r=0;r<a.args.length&&!(p=lr(a.args[r],"params."+r,c,p),p>=500);r++);else if(a.hasOwnProperty("params")&&a.params){var t=a.params;if(typeof a.params==="object")for(r in t){if(t[r]){var w="params."+r,y=nr(t[r]);c[w]=y;p+=w.length+y.length;if(p>500)break}}else c.params=nr(t)}if(d.length)for(r=0;r<d.length&&!(p=lr(d[r],"params.context."+r,c,p),p>=500);r++);navigator.vendor&&!c.hasOwnProperty("vendor")&&(c["device.vendor"]=
navigator.vendor);r={message:e,name:f,lineNumber:m,fileName:k,stack:l,params:c,sampleWeight:1};c=Number(a.columnNumber);isNaN(c)||(r.lineNumber=r.lineNumber+":"+c);if(a.level==="IGNORED")a=0;else a:{a=gr();c=z(a.ib);for(d=c.next();!d.done;d=c.next())if(d=d.value,r.message&&r.message.match(d.tj)){a=d.weight;break a}a=z(a.cb);for(c=a.next();!c.done;c=a.next())if(c=c.value,c.callback(r)){a=c.weight;break a}a=1}r.sampleWeight=a;a=z(ar);for(c=a.next();!c.done;c=a.next())if(c=c.value,c.Uc[r.name])for(e=
z(c.Uc[r.name]),d=e.next();!d.done;d=e.next())if(f=d.value,d=r.message.match(f.regexp)){r.params["params.error.original"]=d[0];e=f.groups;f={};for(m=0;m<e.length;m++)f[e[m]]=d[m+1],r.params["params.error."+e[m]]=d[m+1];r.message=c.wd(f);break}r.params||(r.params={});a=gr();r.params["params.errorServiceSignature"]="msg="+a.ib.length+"&cb="+a.cb.length;r.params["params.serviceWorker"]="false";E.document&&E.document.querySelectorAll&&(r.params["params.fscripts"]=String(document.querySelectorAll("script:not([nonce])").length));
(new Mi(Ni,"sample")).constructor!==Mi&&(r.params["params.fconst"]="true");window.yterr&&typeof window.yterr==="function"&&window.yterr(r);if(r.sampleWeight!==0&&!jy.has(r.message)){if(g)wy(b===void 0?"ERROR":b,r);else{b=b===void 0?"ERROR":b;b==="ERROR"?(ir.Ab("handleError",r),T("record_app_crashed_web")&&my===0&&r.sampleWeight===1&&(my++,g={appCrashType:"APP_CRASH_TYPE_BREAKPAD"},T("report_client_error_with_app_crash_ks")||(g.systemHealth={crashData:{clientError:{logMessage:{message:r.message}}}}),
Es("appCrashed",g)),ly++):b==="WARNING"&&ir.Ab("handleWarning",r);if(T("kevlar_gel_error_routing")){g=b;h=h===void 0?{}:h;b:{a=z(py);for(c=a.next();!c.done;c=a.next())if(Ks(c.value.toLowerCase())){a=!0;break b}a=!1}if(a)h=void 0;else{c={stackTrace:r.stack};r.fileName&&(c.filename=r.fileName);a=r.lineNumber&&r.lineNumber.split?r.lineNumber.split(":"):[];a.length!==0&&(a.length!==1||isNaN(Number(a[0]))?a.length!==2||isNaN(Number(a[0]))||isNaN(Number(a[1]))||(c.lineNumber=Number(a[0]),c.columnNumber=
Number(a[1])):c.lineNumber=Number(a[0]));a={level:"ERROR_LEVEL_UNKNOWN",message:r.message,errorClassName:r.name,sampleWeight:r.sampleWeight};g==="ERROR"?a.level="ERROR_LEVEL_ERROR":g==="WARNING"&&(a.level="ERROR_LEVEL_WARNNING");c={isObfuscated:!0,browserStackInfo:c};h.pageUrl=window.location.href;h.kvPairs=[];S("FEXP_EXPERIMENTS")&&(h.experimentIds=S("FEXP_EXPERIMENTS"));d=S("LATEST_ECATCHER_SERVICE_TRACKING_PARAMS");if(!iq("web_disable_gel_stp_ecatcher_killswitch")&&d)for(e=z(Object.keys(d)),f=
e.next();!f.done;f=e.next())f=f.value,h.kvPairs.push({key:f,value:String(d[f])});if(d=r.params)for(e=z(Object.keys(d)),f=e.next();!f.done;f=e.next())f=f.value,h.kvPairs.push({key:"client."+f,value:String(d[f])});d=S("SERVER_NAME");e=S("SERVER_VERSION");d&&e&&(h.kvPairs.push({key:"server.name",value:d}),h.kvPairs.push({key:"server.version",value:e}));(d=S("PLAYER_CLIENT_VERSION"))&&h.kvPairs.push({key:"client.player.version",value:d});h={errorMetadata:h,stackTrace:c,logMessage:a}}h&&(Es("clientError",
h),(g==="ERROR"||T("errors_flush_gel_always_killswitch"))&&Wx(void 0,void 0,!1))}T("suppress_error_204_logging")||wy(b,r)}try{jy.add(r.message)}catch(x){}ky++}}}}
function wy(a,b){var c=b.params||{};a={urlParams:{a:"logerror",t:"jserror",type:b.name,msg:b.message.substr(0,250),line:b.lineNumber,level:a,"client.name":c.name},postParams:{url:S("PAGE_NAME",window.location.href),file:b.fileName},method:"POST"};c.version&&(a["client.version"]=c.version);if(a.postParams){b.stack&&(a.postParams.stack=b.stack);b=z(Object.keys(c));for(var d=b.next();!d.done;d=b.next())d=d.value,a.postParams["client."+d]=c[d];if(c=S("LATEST_ECATCHER_SERVICE_TRACKING_PARAMS"))for(b=z(Object.keys(c)),
d=b.next();!d.done;d=b.next())d=d.value,a.postParams[d]=c[d];(c=S("LAVA_VERSION"))&&(a.postParams["lava.version"]=c);c=S("SERVER_NAME");b=S("SERVER_VERSION");c&&b&&(a.postParams["server.name"]=c,a.postParams["server.version"]=b);(c=S("PLAYER_CLIENT_VERSION"))&&(a.postParams["client.player.version"]=c)}Sq(S("ECATCHER_REPORT_HOST","")+"/error_204",a)}
function vy(a){var b=D.apply(1,arguments);a.args||(a.args=[]);Array.isArray(a.args)&&a.args.push.apply(a.args,A(b))}
;function xy(){this.register=new Map}
function yy(a){a=z(a.register.values());for(var b=a.next();!b.done;b=a.next())b.value.le("ABORTED")}
xy.prototype.clear=function(){yy(this);this.register.clear()};
var zy=new xy;var Ay=Date.now().toString();
function By(){a:{if(window.crypto&&window.crypto.getRandomValues)try{var a=Array(16),b=new Uint8Array(16);window.crypto.getRandomValues(b);for(var c=0;c<a.length;c++)a[c]=b[c];var d=a;break a}catch(e){}d=Array(16);for(a=0;a<16;a++){b=Date.now();for(c=0;c<b%23;c++)d[a]=Math.random();d[a]=Math.floor(Math.random()*256)}if(Ay)for(a=1,b=0;b<Ay.length;b++)d[a%16]^=d[(a-1)%16]/4^Ay.charCodeAt(b),a++}a=[];for(b=0;b<d.length;b++)a.push("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_".charAt(d[b]&63));
return a.join("")}
;var Cy,Dy=E.ytLoggingDocDocumentNonce_;Dy||(Dy=By(),G("ytLoggingDocDocumentNonce_",Dy));Cy=Dy;function Ey(a){this.h=a}
n=Ey.prototype;n.getAsJson=function(){var a={};this.h.trackingParams!==void 0?a.trackingParams=this.h.trackingParams:(a.veType=this.h.veType,this.h.veCounter!==void 0&&(a.veCounter=this.h.veCounter),this.h.elementIndex!==void 0&&(a.elementIndex=this.h.elementIndex));this.h.dataElement!==void 0&&(a.dataElement=this.h.dataElement.getAsJson());this.h.youtubeData!==void 0&&(a.youtubeData=this.h.youtubeData);this.h.isCounterfactual&&(a.isCounterfactual=!0);return a};
n.getAsJspb=function(){var a=new Lp;this.h.trackingParams!==void 0?a.setTrackingParams(this.h.trackingParams):(this.h.veType!==void 0&&ag(a,2,ff(this.h.veType)),this.h.veCounter!==void 0&&ag(a,6,ff(this.h.veCounter)),this.h.elementIndex!==void 0&&ag(a,3,ff(this.h.elementIndex)),this.h.isCounterfactual&&ag(a,5,bf(!0)));if(this.h.dataElement!==void 0){var b=this.h.dataElement.getAsJspb();og(a,Lp,7,b)}this.h.youtubeData!==void 0&&og(a,Kp,8,this.h.jspbYoutubeData);return a};
n.toString=function(){return JSON.stringify(this.getAsJson())};
n.isClientVe=function(){return!this.h.trackingParams&&!!this.h.veType};
n.getLoggingDirectives=function(){return this.h.loggingDirectives};function Fy(a){return S("client-screen-nonce-store",{})[a===void 0?0:a]}
function Gy(a,b){b=b===void 0?0:b;var c=S("client-screen-nonce-store");c||(c={},hq("client-screen-nonce-store",c));c[b]=a}
function Hy(a){a=a===void 0?0:a;return a===0?"ROOT_VE_TYPE":"ROOT_VE_TYPE."+a}
function Iy(a){return S(Hy(a===void 0?0:a))}
G("yt_logging_screen.getRootVeType",Iy);function Jy(){var a=S("csn-to-ctt-auth-info");a||(a={},hq("csn-to-ctt-auth-info",a));return a}
function Ky(){return Object.values(S("client-screen-nonce-store",{})).filter(function(a){return a!==void 0})}
function Ly(a){a=Fy(a===void 0?0:a);if(!a&&!S("USE_CSN_FALLBACK",!0))return null;a||(a="UNDEFINED_CSN");return a?a:null}
G("yt_logging_screen.getCurrentCsn",Ly);function My(a,b,c){var d=Jy();(c=Ly(c))&&delete d[c];b&&(d[a]=b)}
function Ny(a){return Jy()[a]}
G("yt_logging_screen.getCttAuthInfo",Ny);G("yt_logging_screen.setCurrentScreen",function(a,b,c,d){c=c===void 0?0:c;if(a!==Fy(c)||b!==S(Hy(c)))if(My(a,d,c),Gy(a,c),hq(Hy(c),b),b=function(){setTimeout(function(){a&&Es("foregroundHeartbeatScreenAssociated",{clientDocumentNonce:Cy,clientScreenNonce:a})},0)},"requestAnimationFrame"in window)try{window.requestAnimationFrame(b)}catch(e){b()}else b()});function Oy(){var a=Ii(Py),b;return(new Ck(function(c,d){a.onSuccess=function(e){Dq(e)?c(new Qy(e)):d(new Ry("Request failed, status="+Eq(e),"net.badstatus",e))};
a.onError=function(e){d(new Ry("Unknown request error","net.unknown",e))};
a.onTimeout=function(e){d(new Ry("Request timed out","net.timeout",e))};
b=Sq("//googleads.g.doubleclick.net/pagead/id",a)})).ed(function(c){if(c instanceof Lk){var d;
(d=b)==null||d.abort()}return Hk(c)})}
function Ry(a,b,c){db.call(this,a+", errorCode="+b);this.errorCode=b;this.xhr=c;this.name="PromiseAjaxError"}
v(Ry,db);function Qy(a){this.xhr=a}
;function Sy(){this.ea=0;this.h=null}
Sy.prototype.then=function(a,b,c){return this.ea===1&&a?(a=a.call(c,this.h))&&typeof a.then==="function"?a:Ty(a):this.ea===2&&b?(a=b.call(c,this.h))&&typeof a.then==="function"?a:Uy(a):this};
Sy.prototype.getValue=function(){return this.h};
Sy.prototype.isRejected=function(){return this.ea==2};
Sy.prototype.$goog_Thenable=!0;function Uy(a){var b=new Sy;a=a===void 0?null:a;b.ea=2;b.h=a===void 0?null:a;return b}
function Ty(a){var b=new Sy;a=a===void 0?null:a;b.ea=1;b.h=a===void 0?null:a;return b}
;function Vy(a){var b=S("INNERTUBE_HOST_OVERRIDE");b&&(a=String(b)+String(jc(a)));return a}
function Wy(a){var b={};T("json_condensed_response")&&(b.prettyPrint="false");return a=xq(a,b||{},!1)}
function Xy(a,b){var c=c===void 0?{}:c;a={method:b===void 0?"POST":b,mode:yq(a)?"same-origin":"cors",credentials:yq(a)?"same-origin":"include"};b={};for(var d=z(Object.keys(c)),e=d.next();!e.done;e=d.next())e=e.value,c[e]&&(b[e]=c[e]);Object.keys(b).length>0&&(a.headers=b);return a}
;function Yy(){return qi()||(wd||xd)&&Ks("applewebkit")&&!Ks("version")&&(!Ks("safari")||Ks("gsa/"))||vd&&Ks("version/")?!0:S("EOM_VISITOR_DATA")?!1:!0}
;function Zy(a){var b=a.docid||a.video_id||a.videoId||a.id;if(b)return b;b=a.raw_player_response;b||(a=a.player_response)&&(b=JSON.parse(a));return b&&b.videoDetails&&b.videoDetails.videoId||null}
;function $y(a){a:{var b="EMBEDDED_PLAYER_MODE_UNKNOWN";window.location.hostname.includes("youtubeeducation.com")&&(b="EMBEDDED_PLAYER_MODE_PFL");var c=a.raw_embedded_player_response;if(!c&&(a=a.embedded_player_response))try{c=JSON.parse(a)}catch(e){break a}if(c)b:for(var d in Pp)if(Pp[d]==c.embeddedPlayerMode){b=Pp[d];break b}}return b==="EMBEDDED_PLAYER_MODE_PFL"}
;function az(a){db.call(this,a.message||a.description||a.name);this.isMissing=a instanceof bz;this.isTimeout=a instanceof Ry&&a.errorCode=="net.timeout";this.isCanceled=a instanceof Lk}
v(az,db);az.prototype.name="BiscottiError";function bz(){db.call(this,"Biscotti ID is missing from server")}
v(bz,db);bz.prototype.name="BiscottiMissingError";var Py={format:"RAW",method:"GET",timeout:5E3,withCredentials:!0},cz=null;function dz(){if(T("disable_biscotti_fetch_entirely_for_all_web_clients"))return Error("Biscotti id fetching has been disabled entirely.");if(!Yy())return Error("User has not consented - not fetching biscotti id.");var a=S("PLAYER_VARS",{});if(Gi(a)=="1")return Error("Biscotti ID is not available in private embed mode");if($y(a))return Error("Biscotti id fetching has been disabled for pfl.")}
function aq(){var a=dz();if(a!==void 0)return Hk(a);cz||(cz=Oy().then(ez).ed(function(b){return fz(2,b)}));
return cz}
function ez(a){a=a.xhr.responseText;if(a.lastIndexOf(")]}'",0)!=0)throw new bz;a=JSON.parse(a.substr(4));if((a.type||1)>1)throw new bz;a=a.id;bq(a);cz=Ty(a);gz(18E5,2);return a}
function fz(a,b){b=new az(b);bq("");cz=Uy(b);a>0&&gz(12E4,a-1);throw b;}
function gz(a,b){Fq(function(){Oy().then(ez,function(c){return fz(b,c)}).ed(Ak)},a)}
function hz(){try{var a=I("yt.ads.biscotti.getId_");return a?a():aq()}catch(b){return Hk(b)}}
;var Jb=pa(["data-"]);function iz(a){a&&(a.dataset?a.dataset[jz()]="true":Lb(a))}
function kz(a){return a?a.dataset?a.dataset[jz()]:a.getAttribute("data-loaded"):null}
var lz={};function jz(){return lz.loaded||(lz.loaded="loaded".replace(/\-([a-z])/g,function(a,b){return b.toUpperCase()}))}
;function mz(a){a=a||{};var b={},c={};this.url=a.url||"";this.args=a.args||Ii(b);this.assets=a.assets||{};this.attrs=a.attrs||Ii(c);this.fallback=a.fallback||null;this.fallbackMessage=a.fallbackMessage||null;this.html5=!!a.html5;this.disable=a.disable||{};this.loaded=!!a.loaded;this.messages=a.messages||{}}
mz.prototype.clone=function(){var a=new mz,b;for(b in this)if(this.hasOwnProperty(b)){var c=this[b];Ja(c)=="object"?a[b]=Ii(c):a[b]=c}return a};var nz=["att/get"],oz=["share/get_share_panel"],pz=["share/get_web_player_share_panel"],qz=["feedback"],rz=["notification/modify_channel_preference"],sz=["browse/edit_playlist"],tz=["subscription/subscribe"],uz=["subscription/unsubscribe"];var vz=window.yt&&window.yt.msgs_||window.ytcfg&&window.ytcfg.msgs||{};G("yt.msgs_",vz);function wz(a){cq(vz,arguments)}
;function xz(a,b,c){yz(a,b,c===void 0?null:c)}
function zz(a){a=Az(a);var b=document.getElementById(a);b&&(Rw(a),b.parentNode.removeChild(b))}
function Bz(a,b){a&&b&&(a=""+Ma(b),(a=Cz[a])&&Pw(a))}
function yz(a,b,c){c=c===void 0?null:c;var d=Az(typeof a==="string"?a:a.toString()),e=document.getElementById(d),f=e&&kz(e),g=e&&!f;f?b&&b():(b&&(f=Nw(d,b),b=""+Ma(b),Cz[b]=f),g||(e=Dz(a,d,function(){kz(e)||(iz(e),Qw(d),Fq(function(){Rw(d)},0))},c)))}
function Dz(a,b,c,d){d=d===void 0?null:d;var e=Pi("SCRIPT");e.id=b;e.onload=function(){c&&setTimeout(c,0)};
e.onreadystatechange=function(){switch(e.readyState){case "loaded":case "complete":e.onload()}};
d&&e.setAttribute("nonce",d);Hb(e,typeof a==="string"?Gp(a):a);a=document.getElementsByTagName("head")[0]||document.body;a.insertBefore(e,a.firstChild);return e}
function Az(a){var b=document.createElement("a");zb(b,a);a=b.href.replace(/^[a-zA-Z]+:\/\//,"//");return"js-"+dc(a)}
var Cz={};function Ez(a){var b=Fz(a),c=document.getElementById(b),d=c&&kz(c);d||c&&!d||(c=Gz(a,b,function(){if(!kz(c)){iz(c);Qw(b);var e=Ua(Rw,b);Fq(e,0)}}))}
function Gz(a,b,c){var d=document.createElement("link");d.id=b;d.onload=function(){c&&setTimeout(c,0)};
a=Gp(a);Nb(d,a);(document.getElementsByTagName("head")[0]||document.body).appendChild(d);return d}
function Fz(a){var b=Pi("A");zb(b,new sb(a));a=b.href.replace(/^[a-zA-Z]+:\/\//,"//");return"css-"+dc(a)}
;function Hz(a){var b=D.apply(1,arguments);if(!Iz(a)||b.some(function(d){return!Iz(d)}))throw Error("Only objects may be merged.");
b=z(b);for(var c=b.next();!c.done;c=b.next())Jz(a,c.value)}
function Jz(a,b){for(var c in b)if(Iz(b[c])){if(c in a&&!Iz(a[c]))throw Error("Cannot merge an object into a non-object.");c in a||(a[c]={});Jz(a[c],b[c])}else if(Kz(b[c])){if(c in a&&!Kz(a[c]))throw Error("Cannot merge an array into a non-array.");c in a||(a[c]=[]);Lz(a[c],b[c])}else a[c]=b[c];return a}
function Lz(a,b){b=z(b);for(var c=b.next();!c.done;c=b.next())c=c.value,Iz(c)?a.push(Jz({},c)):Kz(c)?a.push(Lz([],c)):a.push(c);return a}
function Iz(a){return typeof a==="object"&&!Array.isArray(a)}
function Kz(a){return typeof a==="object"&&Array.isArray(a)}
;var Mz="absolute_experiments app conditional_experiments debugcss debugjs expflag forced_experiments pbj pbjreload sbb spf spfreload sr_bns_address sttick".split(" ");
function Nz(a,b){var c=c===void 0?!0:c;var d=S("VALID_SESSION_TEMPDATA_DOMAINS",[]),e=hc(window.location.href);e&&d.push(e);e=hc(a);if(Ob(d,e)>=0||!e&&a.lastIndexOf("/",0)==0)if(d=document.createElement("a"),zb(d,a),a=d.href)if(a=jc(a),a=kc(a))if(c&&!b.csn&&(b.itct||b.ved)&&(b=Object.assign({csn:Ly()},b)),f){var f=parseInt(f,10);isFinite(f)&&f>0&&Oz(a,b,f)}else Oz(a,b)}
function Oz(a,b,c){a=Pz(a);b=b?nc(b):"";c=c||5;Yy()&&tr(a,b,c)}
function Pz(a){for(var b=z(Mz),c=b.next();!c.done;c=b.next())a=sc(a,c.value);return"ST-"+dc(a).toString(36)}
;Date.now();function Qz(a){for(var b=0,c=0;c<a.length;c++)b=b*31+a.charCodeAt(c),c<a.length-1&&(b%=0x800000000000);return b%1E5}
;function Rz(a){Du.call(this,1,arguments);this.csn=a}
v(Rz,Du);var Mu=new Eu("screen-created",Rz),Sz=[],Tz=0,Uz=new Map,Vz=new Map,Wz=new Map;
function Xz(a,b,c,d,e,f){e=e===void 0?!1:e;f=f===void 0?{}:f;Object.assign(f,Yz({cttAuthInfo:Ny(b)||void 0},b));for(var g=z(d),h=g.next();!h.done;h=g.next()){h=h.value;var k=h.getAsJson();(Ei(k)||!k.trackingParams&&!k.veType)&&sy(Error("Child VE logged with no data"));if(T("no_client_ve_attach_unless_shown")){var l=Zz(h,b);if(k.veType&&!Vz.has(l)&&!Wz.has(l)&&!e){if(!T("il_attach_cache_limit")||Uz.size<1E3){Uz.set(l,[a,b,c,h]);return}T("il_attach_cache_limit")&&Uz.size>1E3&&sy(new U("IL Attach cache exceeded limit"))}h=
Zz(c,b);Uz.has(h)?$z(c,b):Wz.set(h,!0)}}d=d.filter(function(m){m.csn!==b?(m.csn=b,m=!0):m=!1;return m});
c={csn:b,parentVe:c.getAsJson(),childVes:Rb(d,function(m){return m.getAsJson()})};
b==="UNDEFINED_CSN"?aA("visualElementAttached",f,c):a?iy("visualElementAttached",c,a,f):Es("visualElementAttached",c,f)}
function aA(a,b,c){Sz.push({cg:a,payload:c,mj:void 0,options:b});Tz||(Tz=Nu())}
function Ou(a){if(Sz){for(var b=z(Sz),c=b.next();!c.done;c=b.next())c=c.value,c.payload&&(c.payload.csn=a.csn,Es(c.cg,c.payload,c.options));Sz.length=0}Tz=0}
function Zz(a,b){return""+a.getAsJson().veType+a.getAsJson().veCounter+b}
function $z(a,b){a=Zz(a,b);if(Uz.has(a)){b=Uz.get(a)||[];var c=c===void 0?{}:c;Xz(b[0],b[1],b[2],[b[3]],!0,c);Uz.delete(a)}}
function Yz(a,b){T("log_sequence_info_on_gel_web")&&(a.sequenceGroup=b);return a}
;function bA(){}
bA.prototype.flush=function(a,b){a=a===void 0?[]:a;b=b===void 0?!1:b;if(T("enable_client_streamz_web")){a=z(a);for(var c=a.next();!c.done;c=a.next())c=fi(c.value),this.h&&og(c,ai,2,this.h),c={serializedIncrementBatch:Bd(c.j())},Es("streamzIncremented",c,{sendIsolatedPayload:b})}};
function dn(){}
v(dn,bA);function cA(a){var b=new ai;var c=new Yh;c=ug(c,1,"botguard");a=ug(c,2,a);a=ng(a,Yh);ig(b,1,bi,a);a&&!oe(a)&&Wf(b.D);this.h=b}
v(cA,bA);var cn,dA=new Map;function eA(){try{return!!self.localStorage}catch(a){return!1}}
;function fA(a){a=a.match(/(.*)::.*::.*/);if(a!==null)return a[1]}
function gA(a){if(eA()){var b=Object.keys(window.localStorage);b=z(b);for(var c=b.next();!c.done;c=b.next()){c=c.value;var d=fA(c);d===void 0||a.includes(d)||self.localStorage.removeItem(c)}}}
function hA(){if(!eA())return!1;var a=Lr(),b=Object.keys(window.localStorage);b=z(b);for(var c=b.next();!c.done;c=b.next())if(c=fA(c.value),c!==void 0&&c!==a)return!0;return!1}
;function iA(){var a=!1;try{a=!!window.sessionStorage.getItem("session_logininfo")}catch(b){a=!0}return(S("INNERTUBE_CLIENT_NAME")==="WEB"||S("INNERTUBE_CLIENT_NAME")==="WEB_CREATOR")&&a}
function jA(){var a=a===void 0?!0:a;try{window.sessionStorage.removeItem("stickiness_reload");window.sessionStorage.removeItem("session_logininfo");hq("LOGIN_INFO","");a&&window.sessionStorage.setItem("from_switch_account","1");a=!0;a=a===void 0?!1:a;var b,c=kA;c||(c=document.querySelector("#persist_identity"));if(b=c){var d=b.src?(new URL(b.src)).origin:"*";if(a){var e;(e=b.contentWindow)==null||e.postMessage({action:"clear"},d)}else if(!(Number(window.sessionStorage.getItem("stickiness_reload"))>=
2)){var f=window.sessionStorage.getItem("session_logininfo");if(f){var g;(g=b.contentWindow)==null||g.postMessage({loginInfo:f},d)}}}}catch(h){}}
function lA(a){if(a)if(a.startsWith("https://accounts.google.com/AddSession"))jA();else if(a.startsWith("https://accounts.google.com/ServiceLogin"))jA();else{var b;if(b=a.startsWith("https://myaccount.google.com"))b=(a instanceof ao?a.clone():new ao(a)).h.endsWith("/youtubeoptions");b&&jA()}if(S("LOGGED_IN",!0)&&iA()){b=S("VALID_SESSION_TEMPDATA_DOMAINS",[]);var c=hc(window.location.href);c&&b.push(c);c=hc(a);Ob(b,c)>=0||!c&&a.lastIndexOf("/",0)==0?(b=jc(a),(b=kc(b))?(b=Pz(b),b=(b=ur(b)||null)?uq(b):
{}):b=null):b=null;b==null&&(b={});c=b;var d=void 0;iA()?(d||(d=S("LOGIN_INFO")),d?(c.session_logininfo=d,c=!0):c=!1):c=!1;c&&Nz(a,b)}}
var kA=null;function mA(a,b,c){b=b===void 0?{}:b;c=c===void 0?!1:c;var d=S("EVENT_ID");d&&(b.ei||(b.ei=d));b&&Nz(a,b);if(c)return!1;lA(a);var e=e===void 0?{}:e;var f=f===void 0?"":f;var g=g===void 0?window:g;b=oc(a,e);lA(b);a=void 0;a=a===void 0?wb:a;a:if(f=b+f,a=a===void 0?wb:a,!(f instanceof sb)){for(b=0;b<a.length;++b)if(c=a[b],c instanceof ub&&c.Kf(f)){f=new sb(f);break a}f=void 0}g=g.location;f=yb(f||tb);f!==void 0&&(g.href=f);return!0}
;function nA(a){if(Gi(S("PLAYER_VARS",{}))!="1"){a&&$p();try{hz().then(function(){},function(){}),Fq(nA,18E5)}catch(b){mq(b)}}}
;function oA(){this.h={}}
n=oA.prototype;n.contains=function(a){return Object.prototype.hasOwnProperty.call(this.h,a)};
n.get=function(a){if(this.contains(a))return this.h[a]};
n.set=function(a,b){this.h[a]=b};
n.hc=function(){return Object.keys(this.h)};
n.remove=function(a){delete this.h[a]};function pA(){this.mappings=new oA}
pA.prototype.getModuleId=function(a){return a.serviceId.getModuleId()};
pA.prototype.get=function(a){a:{var b=this.mappings.get(a.toString());switch(b.type){case "mapping":a=b.value;break a;case "factory":b=b.value();this.mappings.set(a.toString(),{type:"mapping",value:b});a=b;break a;default:a=Ab(b)}}return a};
new pA;var qA=new Map([["dark","USER_INTERFACE_THEME_DARK"],["light","USER_INTERFACE_THEME_LIGHT"]]);function rA(){var a=a===void 0?window.location.href:a;if(T("kevlar_disable_theme_param"))return null;var b=ic(a);if(T("enable_dark_theme_only_on_shorts")&&b!=null&&b.startsWith("/shorts/"))return"USER_INTERFACE_THEME_DARK";try{var c=vq(a).theme;return qA.get(c)||null}catch(d){}return null}
;function sA(a){var b=new El;if(a.interpreterJavascript){var c=Ep(a.interpreterJavascript);c=Fb(c).toString();var d=new Cl;ug(d,6,c);og(b,Cl,1,d,te)}else a.interpreterUrl&&(c=Fp(a.interpreterUrl),c=mb(c).toString(),d=new Dl,ug(d,4,c),og(b,Dl,2,d,te));a.interpreterHash&&hg(b,3,wf(a.interpreterHash),te);a.program&&hg(b,4,wf(a.program),te);a.globalName&&hg(b,5,wf(a.globalName),te);a.clientExperimentsStateBlob&&hg(b,7,wf(a.clientExperimentsStateBlob),te);return b}
function tA(a){var b={};a=z(a.split("&"));for(var c=a.next();!c.done;c=a.next())c=c.value.split("="),c.length===2&&(b[c[0]]=c[1]);return b}
function uA(a){return Number(a.t)||7200}
;function vA(){var a=a===void 0?window:a;var b,c;return C(function(d){if(d.h==1)return d.yield(xc(),2);b=a;c=b.bgevmc;if(!c)throw Error("BGE Controls not exposed");return d.return({pause:function(){c.p()},
resume:function(){c.r()},
checkForRefresh:function(){return c.cr()}})})}
function yc(){if(T("bg_st_hr"))return"havuokmhhs-0";var a,b=((a=globalThis.performance)==null?void 0:a.timeOrigin)||0;return"havuokmhhs-"+Math.floor(b)}
function wA(a){window.bgens=a}
function xA(a){this.h=a}
xA.prototype.bindInnertubeChallengeFetcher=function(a){this.h.bicf(a)};
xA.prototype.registerChallengeFetchedCallback=function(a){this.h.bcr(a)};
xA.prototype.getLatestChallengeResponse=function(){return this.h.blc()};
function yA(){return new Promise(function(a){var b=window;b.ntpevasrs!==void 0?a(new xA(b.ntpevasrs)):(b.ntpqfbel===void 0&&(b.ntpqfbel=[]),b.ntpqfbel.push(function(c){a(new xA(c))}))})}
;var zA=pa(["https://static.doubleclick.net/instream/ad_status.js"]),AA=[],BA=function(a){var b=D.apply(1,arguments);if(b.length===0)return lb(a[0]);for(var c=a[0],d=0;d<b.length;d++)c+=encodeURIComponent(b[d])+a[d+1];return lb(c)}(zA),CA=!1;
function DA(){if(Yy()){var a=S("PLAYER_VARS",{});if(Gi(a)!="1"&&!$y(a)){var b=function(){CA=!0;"google_ad_status"in window?hq("DCLKSTAT",1):hq("DCLKSTAT",2)};
try{var c=Cb(document);xz(BA,b,c)}catch(d){}AA.push(vn.wa(function(){if(!(CA||"google_ad_status"in window)){try{Bz(BA.toString(),b)}catch(d){}CA=!0;hq("DCLKSTAT",3)}},5E3))}}}
function EA(){var a=Number(S("DCLKSTAT",0));return isNaN(a)?0:a}
;function X(a){this.h=a}
[new X("b.f_"),new X("j.s_"),new X("r.s_"),new X("e.h_"),new X("i.s_"),new X("s.t_"),new X("p.h_"),new X("s.i_"),new X("f.i_"),new X("a.b_"),new X("a.o_"),new X("g.o_"),new X("p.i_"),new X("p.m_"),new X("n.k_"),new X("i.f_"),new X("a.s_"),new X("m.c_"),new X("n.h_"),new X("o.p_"),new X("m.p_"),new X("o.a_"),new X("d.p_"),new X("e.i_")].reduce(function(a,b){a[b.h]=b;return a},{});function FA(a){return I("ytcsi."+(a||"")+"data_")||GA(a)}
function HA(){var a=FA();a.info||(a.info={});return a.info}
function IA(a){a=FA(a);a.metadata||(a.metadata={});return a.metadata}
function JA(a){a=FA(a);a.tick||(a.tick={});return a.tick}
function KA(a){a=FA(a);if(a.gel){var b=a.gel;b.gelInfos||(b.gelInfos={});b.gelTicks||(b.gelTicks={})}else a.gel={gelTicks:{},gelInfos:{}};return a.gel}
function LA(a){a=KA(a);a.gelInfos||(a.gelInfos={});return a.gelInfos}
function MA(a){var b=FA(a).nonce;b||(b=By(),FA(a).nonce=b);return b}
function GA(a){var b={tick:{},info:{}};G("ytcsi."+(a||"")+"data_",b);return b}
;function NA(){var a=I("ytcsi.debug");a||(a=[],G("ytcsi.debug",a),G("ytcsi.reference",{}));return a}
function OA(a){a=a||"";var b=PA();if(b[a])return b[a];var c=NA(),d={timerName:a,info:{},tick:{},span:{},jspbInfo:[]};c.push(d);return b[a]=d}
function PA(){var a=I("ytcsi.reference");if(a)return a;NA();return I("ytcsi.reference")}
;var Y={},QA=(Y.auto_search="LATENCY_ACTION_AUTO_SEARCH",Y.ad_to_ad="LATENCY_ACTION_AD_TO_AD",Y.ad_to_video="LATENCY_ACTION_AD_TO_VIDEO",Y.app_startup="LATENCY_ACTION_APP_STARTUP",Y.browse="LATENCY_ACTION_BROWSE",Y.cast_splash="LATENCY_ACTION_CAST_SPLASH",Y.channel_activity="LATENCY_ACTION_FAMILY_CENTER_CHANNEL_ACTIVITY",Y.channels="LATENCY_ACTION_CHANNELS",Y.chips="LATENCY_ACTION_CHIPS",Y.commerce_transaction="LATENCY_ACTION_COMMERCE_TRANSACTION",Y.direct_playback="LATENCY_ACTION_DIRECT_PLAYBACK",
Y.editor="LATENCY_ACTION_EDITOR",Y.embed="LATENCY_ACTION_EMBED",Y.embed_no_video="LATENCY_ACTION_EMBED_NO_VIDEO",Y.entity_key_serialization_perf="LATENCY_ACTION_ENTITY_KEY_SERIALIZATION_PERF",Y.entity_key_deserialization_perf="LATENCY_ACTION_ENTITY_KEY_DESERIALIZATION_PERF",Y.explore="LATENCY_ACTION_EXPLORE",Y.favorites="LATENCY_ACTION_FAVORITES",Y.home="LATENCY_ACTION_HOME",Y.inboarding="LATENCY_ACTION_INBOARDING",Y.landing="LATENCY_ACTION_LANDING",Y.learning="LATENCY_ACTION_LEARNING",Y.learning_journey_browse=
"LATENCY_ACTION_LEARNING_JOURNEY_BROWSE",Y.learning_journey_watch="LATENCY_ACTION_LEARNING_JOURNEY_WATCH",Y.library="LATENCY_ACTION_LIBRARY",Y.live="LATENCY_ACTION_LIVE",Y.live_pagination="LATENCY_ACTION_LIVE_PAGINATION",Y.management="LATENCY_ACTION_MANAGEMENT",Y.mini_app="LATENCY_ACTION_MINI_APP_PLAY",Y.notification_settings="LATENCY_ACTION_FAMILY_CENTER_NOTIFICATION_SETTINGS",Y.onboarding="LATENCY_ACTION_ONBOARDING",Y.parent_profile_settings="LATENCY_ACTION_KIDS_PARENT_PROFILE_SETTINGS",Y.parent_tools_collection=
"LATENCY_ACTION_PARENT_TOOLS_COLLECTION",Y.parent_tools_dashboard="LATENCY_ACTION_PARENT_TOOLS_DASHBOARD",Y.player_att="LATENCY_ACTION_PLAYER_ATTESTATION",Y.prebuffer="LATENCY_ACTION_PREBUFFER",Y.prefetch="LATENCY_ACTION_PREFETCH",Y.profile_settings="LATENCY_ACTION_KIDS_PROFILE_SETTINGS",Y.profile_switcher="LATENCY_ACTION_LOGIN",Y.projects="LATENCY_ACTION_PROJECTS",Y.reel_watch="LATENCY_ACTION_REEL_WATCH",Y.results="LATENCY_ACTION_RESULTS",Y.red="LATENCY_ACTION_PREMIUM_PAGE_GET_BROWSE",Y.premium=
"LATENCY_ACTION_PREMIUM_PAGE_GET_BROWSE",Y.privacy_policy="LATENCY_ACTION_FAMILY_CENTER_PRIVACY_POLICY",Y.review="LATENCY_ACTION_REVIEW",Y.search_overview_answer="LATENCY_ACTION_SEARCH_OVERVIEW_ANSWER",Y.search_ui="LATENCY_ACTION_SEARCH_UI",Y.search_suggest="LATENCY_ACTION_SUGGEST",Y.search_zero_state="LATENCY_ACTION_SEARCH_ZERO_STATE",Y.secret_code="LATENCY_ACTION_KIDS_SECRET_CODE",Y.switchplan="LATENCY_ACTION_UNPLUGGED_SWITCH_PLAN",Y.seek="LATENCY_ACTION_PLAYER_SEEK",Y.settings="LATENCY_ACTION_SETTINGS",
Y.store="LATENCY_ACTION_STORE",Y.supervision_dashboard="LATENCY_ACTION_FAMILY_CENTER_SUPERVISION_DASHBOARD",Y.bedtime_reminder_settings="LATENCY_ACTION_FAMILY_CENTER_BEDTIME_REMINDER_SETTINGS",Y.break_reminder_settings="LATENCY_ACTION_FAMILY_CENTER_BREAK_REMINDER_SETTINGS",Y.supervision_settings_dashboard="LATENCY_ACTION_FAMILY_CENTER_SUPERVISION_SETTINGS_DASHBOARD",Y.time_management="LATENCY_ACTION_FAMILY_CENTER_TIME_MANAGEMENT",Y.update_profile="LATENCY_ACTION_FAMILY_CENTER_UPDATE_PROFILE",Y.viewing_permissions=
"LATENCY_ACTION_FAMILY_CENTER_VIEWING_PERMISSIONS",Y.shorts_settings="LATENCY_ACTION_FAMILY_CENTER_SHORTS_SETTINGS",Y.privacy_settings="LATENCY_ACTION_FAMILY_CENTER_PRIVACY_SETTINGS",Y.tenx="LATENCY_ACTION_TENX",Y.video_preview="LATENCY_ACTION_VIDEO_PREVIEW",Y.video_to_ad="LATENCY_ACTION_VIDEO_TO_AD",Y.watch="LATENCY_ACTION_WATCH",Y.watch_it_again="LATENCY_ACTION_KIDS_WATCH_IT_AGAIN",Y["watch,watch7"]="LATENCY_ACTION_WATCH",Y["watch,watch7_html5"]="LATENCY_ACTION_WATCH",Y["watch,watch7ad"]="LATENCY_ACTION_WATCH",
Y["watch,watch7ad_html5"]="LATENCY_ACTION_WATCH",Y.wn_comments="LATENCY_ACTION_LOAD_COMMENTS",Y.ww_rqs="LATENCY_ACTION_WHO_IS_WATCHING",Y.voice_assistant="LATENCY_ACTION_VOICE_ASSISTANT",Y.cast_load_by_entity_to_watch="LATENCY_ACTION_CAST_LOAD_BY_ENTITY_TO_WATCH",Y.networkless_performance="LATENCY_ACTION_NETWORKLESS_PERFORMANCE",Y.gel_compression="LATENCY_ACTION_GEL_COMPRESSION",Y.gel_jspb_serialize="LATENCY_ACTION_GEL_JSPB_SERIALIZE",Y.attestation_challenge_fetch="LATENCY_ACTION_ATTESTATION_CHALLENGE_FETCH",
Y);function RA(a){return QA[a]||"LATENCY_ACTION_UNKNOWN"}
;function SA(a,b){Du.call(this,1,arguments);this.timer=b}
v(SA,Du);var TA=new Eu("aft-recorded",SA);G("ytLoggingGelSequenceIdObj_",E.ytLoggingGelSequenceIdObj_||{});var UA=E.ytLoggingLatencyUsageStats_||{};G("ytLoggingLatencyUsageStats_",UA);function VA(){this.h=0}
function WA(){VA.instance||(VA.instance=new VA);return VA.instance}
VA.prototype.tick=function(a,b,c,d){XA(this,"tick_"+a+"_"+b)||Es("latencyActionTicked",{tickName:a,clientActionNonce:b},{timestamp:c,cttAuthInfo:d})};
VA.prototype.info=function(a,b,c){var d=Object.keys(a).join("");XA(this,"info_"+d+"_"+b)||(a=Object.assign({},a),a.clientActionNonce=b,Es("latencyActionInfo",a,{cttAuthInfo:c}))};
VA.prototype.jspbInfo=function(){};
VA.prototype.span=function(a,b,c){var d=Object.keys(a).join("");XA(this,"span_"+d+"_"+b)||(a.clientActionNonce=b,Es("latencyActionSpan",a,{cttAuthInfo:c}))};
function XA(a,b){UA[b]=UA[b]||{count:0};var c=UA[b];c.count++;c.time=V();a.h||(a.h=Nr(function(){var d=V(),e;for(e in UA)UA[e]&&d-UA[e].time>6E4&&delete UA[e];a&&(a.h=0)},5E3));
return c.count>5?(c.count===6&&Math.random()*1E5<1&&(c=new U("CSI data exceeded logging limit with key",b.split("_")),b.indexOf("plev")>=0||sy(c)),!0):!1}
;var YA=window;function ZA(){this.timing={};this.clearResourceTimings=function(){};
this.webkitClearResourceTimings=function(){};
this.mozClearResourceTimings=function(){};
this.msClearResourceTimings=function(){};
this.oClearResourceTimings=function(){}}
function $A(){var a;if(T("csi_use_performance_navigation_timing")){var b,c,d,e=Z==null?void 0:(a=Z.getEntriesByType)==null?void 0:(b=a.call(Z,"navigation"))==null?void 0:(c=b[0])==null?void 0:(d=c.toJSON)==null?void 0:d.call(c);e?(e.requestStart=aB(e.requestStart),e.responseEnd=aB(e.responseEnd),e.redirectStart=aB(e.redirectStart),e.redirectEnd=aB(e.redirectEnd),e.domainLookupEnd=aB(e.domainLookupEnd),e.connectStart=aB(e.connectStart),e.connectEnd=aB(e.connectEnd),e.responseStart=aB(e.responseStart),
e.secureConnectionStart=aB(e.secureConnectionStart),e.domainLookupStart=aB(e.domainLookupStart),e.isPerformanceNavigationTiming=!0,a=e):a=Z.timing}else a=T("csi_performance_timing_to_object")?JSON.parse(JSON.stringify(Z.timing)):Z.timing;return a}
function aB(a){return Math.round(bB()+a)}
function bB(){return(T("csi_use_time_origin")||T("csi_use_time_origin_tvhtml5"))&&Z.timeOrigin?Math.floor(Z.timeOrigin):Z.timing.navigationStart}
var Z=YA.performance||YA.mozPerformance||YA.msPerformance||YA.webkitPerformance||new ZA;var cB=!1,dB=!1,eB={'script[name="scheduler/scheduler"]':"sj",'script[name="player/base"]':"pj",'link[rel="preload"][name="player/embed"]':"pej",'link[rel="stylesheet"][name="www-player"]':"pc",'link[rel="stylesheet"][name="player/www-player"]':"pc",'script[name="desktop_polymer/desktop_polymer"]':"dpj",'link[rel="import"][name="desktop_polymer"]':"dph",'script[name="mobile-c3"]':"mcj",'link[rel="stylesheet"][name="mobile-c3"]':"mcc",'script[name="player-plasma-ias-phone/base"]':"mcppj",'script[name="player-plasma-ias-tablet/base"]':"mcptj",
'link[rel="stylesheet"][name="mobile-polymer-player-ias"]':"mcpc",'link[rel="stylesheet"][name="mobile-polymer-player-svg-ias"]':"mcpsc",'script[name="mobile_blazer_core_mod"]':"mbcj",'link[rel="stylesheet"][name="mobile_blazer_css"]':"mbc",'script[name="mobile_blazer_logged_in_users_mod"]':"mbliuj",'script[name="mobile_blazer_logged_out_users_mod"]':"mblouj",'script[name="mobile_blazer_noncore_mod"]':"mbnj","#player_css":"mbpc",'script[name="mobile_blazer_desktopplayer_mod"]':"mbpj",'link[rel="stylesheet"][name="mobile_blazer_tablet_css"]':"mbtc",
'script[name="mobile_blazer_watch_mod"]':"mbwj",'script[name="embed_client"]':"ecj",'link[rel="stylesheet"][name="embed-ui"]':"ecc"},fB=Ta(Z.clearResourceTimings||Z.webkitClearResourceTimings||Z.mozClearResourceTimings||Z.msClearResourceTimings||Z.oClearResourceTimings||Ak,Z);function gB(a,b){hB("_start",a,b)}
function iB(a,b){if(!T("web_csi_action_sampling_enabled")||!FA(b).actionDisabled){var c=OA(b||"");Hz(c.info,a);a.loadType&&(c=a.loadType,IA(b).loadType=c);Hz(LA(b),a);c=MA(b);b=FA(b).cttAuthInfo;WA().info(a,c,b)}}
function jB(){var a,b,c,d;return((d=ax().resolve(new Vw(qu))==null?void 0:(a=ru())==null?void 0:(b=a.loggingHotConfig)==null?void 0:(c=b.csiConfig)==null?void 0:c.debugTicks)!=null?d:[]).map(function(e){return Object.values(e)[0]})}
function hB(a,b,c){if(!T("web_csi_action_sampling_enabled")||!FA(c).actionDisabled){var d=MA(c),e;if(e=T("web_csi_debug_sample_enabled")&&d){(ax().resolve(new Vw(qu))==null?0:ru())&&!dB&&(dB=!0,hB("gcfl",V(),c));var f,g,h;e=(ax().resolve(new Vw(qu))==null?void 0:(f=ru())==null?void 0:(g=f.loggingHotConfig)==null?void 0:(h=g.csiConfig)==null?void 0:h.debugSampleWeight)||0;if(f=e!==0)b:{f=jB();if(f.length>0)for(g=0;g<f.length;g++)if(a===f[g]){f=!0;break b}f=!1}f?(e=Qz(d)%e!==0,FA(c).debugTicksExcludedLogged||
(f={},f.debugTicksExcluded=e,iB(f,c)),FA(c).debugTicksExcludedLogged=!0):e=!1}if(!e){if(a[0]!=="_"&&(e=a,f=b,Z.mark))if(e.startsWith("mark_")||(e="mark_"+e),c&&(e+=" ("+c+")"),f===void 0||T("web_csi_disable_alt_time_performance_mark"))Z.mark(e);else{f=T("csi_use_performance_navigation_timing")?f-Z.timeOrigin:f-(Z.timeOrigin||Z.timing.navigationStart);try{Z.mark(e,{startTime:f})}catch(k){}}e=OA(c||"");e.tick[a]=b||V();if(e.callback&&e.callback[a])for(e=z(e.callback[a]),f=e.next();!f.done;f=e.next())f=
f.value,f();e=KA(c);e.gelTicks&&(e.gelTicks[a]=!0);f=JA(c);e=b||V();f[a]=e;f=FA(c).cttAuthInfo;a==="_start"?(a=WA(),XA(a,"baseline_"+d)||Es("latencyActionBaselined",{clientActionNonce:d},{timestamp:b,cttAuthInfo:f})):WA().tick(a,d,b,f);kB(c);return e}}}
function lB(){var a,b=(a=Z.getEntriesByType)==null?void 0:a.call(Z,"mark");b&&b.forEach(function(c){if(c.name.startsWith("mark_")){var d;(d=Z.clearMarks)==null||d.call(Z,c.name)}})}
function mB(){var a=document;if("visibilityState"in a)a=a.visibilityState;else{var b=tw+"VisibilityState";a=b in a?a[b]:void 0}switch(a){case "hidden":return 0;case "visible":return 1;case "prerender":return 2;case "unloaded":return 3;default:return-1}}
function nB(){function a(f,g,h){g=g.match("_rid")?g.split("_rid")[0]:g;typeof h==="number"&&(h=JSON.stringify(h));f.requestIds?f.requestIds.push({endpoint:g,id:h}):f.requestIds=[{endpoint:g,id:h}]}
for(var b={},c=z(Object.entries(S("TIMING_INFO",{}))),d=c.next();!d.done;d=c.next()){var e=z(d.value);d=e.next().value;e=e.next().value;switch(d){case "GetBrowse_rid":a(b,d,e);break;case "GetGuide_rid":a(b,d,e);break;case "GetHome_rid":a(b,d,e);break;case "GetPlayer_rid":a(b,d,e);break;case "GetSearch_rid":a(b,d,e);break;case "GetSettings_rid":a(b,d,e);break;case "GetTrending_rid":a(b,d,e);break;case "GetWatchNext_rid":a(b,d,e);break;case "yt_red":b.isRedSubscriber=!!e;break;case "yt_ad":b.isMonetized=
!!e}}return b}
function oB(a,b){a=document.querySelector(a);if(!a)return!1;var c="",d=a.nodeName;d==="SCRIPT"?(c=a.src,c||(c=a.getAttribute("data-timing-href"))&&(c=window.location.protocol+c)):d==="LINK"&&(c=a.href);Cb(document)&&a.setAttribute("nonce",Cb(document));return c?(a=Z.getEntriesByName(c))&&a[0]&&(a=a[0],c=bB(),hB("rsf_"+b,c+Math.round(a.fetchStart)),hB("rse_"+b,c+Math.round(a.responseEnd)),a.transferSize!==void 0&&a.transferSize===0)?!0:!1:!1}
function pB(){var a=window.location.protocol,b=Z.getEntriesByType("resource");b=Qb(b,function(c){return c.name.indexOf(a+"//fonts.gstatic.com/s/")===0});
(b=Sb(b,function(c,d){return d.duration>c.duration?d:c},{duration:0}))&&b.startTime>0&&b.responseEnd>0&&(hB("wffs",aB(b.startTime)),hB("wffe",aB(b.responseEnd)))}
function qB(a){var b=rB("aft",a);if(b)return b;b=S((a||"")+"TIMING_AFT_KEYS",["ol"]);for(var c=b.length,d=0;d<c;d++){var e=rB(b[d],a);if(e)return e}return NaN}
function sB(a){G("ytglobal.timing"+(a||"")+"ready_",!0)}
function rB(a,b){if(a=JA(b)[a])return typeof a==="number"?a:a[a.length-1]}
function kB(a){var b=rB("_start",a),c=qB(a),d=!cB;b&&c&&d&&(Ju(TA,new SA(Math.round(c-b),a)),cB=!0)}
function tB(){if(Z.getEntriesByType){var a=Z.getEntriesByType("paint");if(a=Tb(a,function(c){return c.name==="first-paint"}))return aB(a.startTime)}var b;
T("csi_use_performance_navigation_timing")?b=Z.getEntriesByType("first-paint")[0].startTime:b=Z.timing.uj;return b?Math.max(0,b):0}
;function uB(a,b){lq(function(){OA("").info.actionType=a;b&&hq("TIMING_AFT_KEYS",b);hq("TIMING_ACTION",a);var c=nB();Object.keys(c).length>0&&iB(c);c={isNavigation:!0,actionType:RA(S("TIMING_ACTION"))};var d=S("PREVIOUS_ACTION");d&&(c.previousAction=RA(d));if(d=S("CLIENT_PROTOCOL"))c.httpProtocol=d;if(d=S("CLIENT_TRANSPORT"))c.transportProtocol=d;(d=Ly())&&d!=="UNDEFINED_CSN"&&(c.clientScreenNonce=d);d=mB();if(d===1||d===-1)c.isVisible=!0;IA();HA();c.loadType="cold";d=HA();var e=$A(),f=bB(),g=S("CSI_START_TIMESTAMP_MILLIS",
0);g>0&&!T("embeds_web_enable_csi_start_override_killswitch")&&(f=g);f&&(hB("srt",e.responseStart),d.prerender!==1&&gB(f));d=tB();d>0&&hB("fpt",d);d=$A();d.isPerformanceNavigationTiming&&iB({performanceNavigationTiming:!0},void 0);hB("nreqs",d.requestStart,void 0);hB("nress",d.responseStart,void 0);hB("nrese",d.responseEnd,void 0);d.redirectEnd-d.redirectStart>0&&(hB("nrs",d.redirectStart,void 0),hB("nre",d.redirectEnd,void 0));d.domainLookupEnd-d.domainLookupStart>0&&(hB("ndnss",d.domainLookupStart,
void 0),hB("ndnse",d.domainLookupEnd,void 0));d.connectEnd-d.connectStart>0&&(hB("ntcps",d.connectStart,void 0),hB("ntcpe",d.connectEnd,void 0));d.secureConnectionStart>=bB()&&d.connectEnd-d.secureConnectionStart>0&&(hB("nstcps",d.secureConnectionStart,void 0),hB("ntcpe",d.connectEnd,void 0));Z&&"getEntriesByType"in Z&&pB();d=[];if(document.querySelector&&Z&&Z.getEntriesByName)for(var h in eB)eB.hasOwnProperty(h)&&(e=eB[h],oB(h,e)&&d.push(e));if(d.length>0)for(c.resourceInfo=[],h=z(d),d=h.next();!d.done;d=
h.next())c.resourceInfo.push({resourceCache:d.value});iB(c);c=KA();c.preLoggedGelInfos||(c.preLoggedGelInfos=[]);h=c.preLoggedGelInfos;c=LA();d=void 0;for(e=0;e<h.length;e++)if(f=h[e],f.loadType){d=f.loadType;break}if(IA().loadType==="cold"&&(c.loadType==="cold"||d==="cold")){d=JA();e=KA();e=e.gelTicks?e.gelTicks:e.gelTicks={};for(var k in d)k in e||typeof d[k]==="number"&&hB(k,rB(k));k={};d=!1;h=z(h);for(e=h.next();!e.done;e=h.next())d=e.value,Hz(c,d),Hz(k,d),d=!0;d&&iB(k)}sB();k=S("TIMING_ACTION");
I("ytglobal.timingready_")&&k&&vB()&&qB()&&kB()})()}
function wB(){var a=a===void 0?{}:a;lq(function(){xB();var b=a.sampleRate;if(!T("web_csi_action_sampling_enabled")||b===void 0||b<=1)b=!1;else{var c=MA("attestation_challenge_fetch");b=Qz(c)%b!==0}b&&(FA("attestation_challenge_fetch").actionDisabled=!0);OA("attestation_challenge_fetch").info.actionType="attestation_challenge_fetch";a.cttAuthInfo&&(FA("attestation_challenge_fetch").cttAuthInfo=a.cttAuthInfo);hq("attestation_challenge_fetchTIMING_ACTION","attestation_challenge_fetch");lq(gB)(a.startTime,
"attestation_challenge_fetch");b={actionType:RA("attestation_challenge_fetch")};a.qj&&(b.previousAction=RA(S("TIMING_ACTION")));(c=Ly())&&c!=="UNDEFINED_CSN"&&(b.clientScreenNonce=c);yB(b,"attestation_challenge_fetch");sB("attestation_challenge_fetch")})()}
function xB(){lq(function(){vB("attestation_challenge_fetch")&&zB("aa",void 0,"attestation_challenge_fetch");var a=PA();a.attestation_challenge_fetch&&delete a.attestation_challenge_fetch;var b={timerName:"attestation_challenge_fetch",info:{},tick:{},span:{},jspbInfo:[]};NA().push(b);a.attestation_challenge_fetch=b;GA("attestation_challenge_fetch");fB();lB()})()}
function vB(a){return lq(function(){return AB("_start",a)})()}
function yB(a,b,c){lq(iB)(a,b,c===void 0?!1:c)}
function zB(a,b,c){return lq(hB)(a,b,c)}
function AB(a,b){return lq(function(){var c=JA(b);return a in c})()}
function BB(a){if(!T("universal_csi_network_ticks"))return"";a=ic(a)||"";for(var b=Object.keys(Bu),c=0;c<b.length;c++){var d=b[c];if(a.includes(d))return d}return""}
function CB(a){if(!T("universal_csi_network_ticks"))return function(){};
var b=Bu[a];return b?(DB(b),function(){var c=T("universal_csi_network_ticks")?(c=Cu[a])?DB(c):!1:!1;return c}):function(){}}
function DB(a){return lq(function(){if(AB(a))return!1;zB(a,void 0,void 0);return!0})()}
function EB(a){lq(function(){if(!vB("attestation_challenge_fetch")||AB(a,"attestation_challenge_fetch"))return!1;zB(a,void 0,"attestation_challenge_fetch");return!0})()}
function FB(){lq(function(){var a=MA();requestAnimationFrame(function(){setTimeout(function(){a===MA()&&zB("ol",void 0,void 0)},0)})})()}
var GB=window;GB.ytcsi&&(GB.ytcsi.infoGel=yB,GB.ytcsi.tick=zB);function HB(a,b,c){var d=this;this.network=a;this.options=b;this.H=c;this.j=0;this.h=null;this.i=new bn;b.Ae?IB(this,JB(this)):b.preload&&IB(this,new Promise(function(e){Nr(function(){e(KB(d))},0)}))}
function JB(a){var b,c,d,e,f,g,h,k,l,m,p,r;return C(function(t){switch(t.h){case 1:b=E;if(!b.ytAtP||T("ytatp_ks")){b.ytAtRC?(d=en("att_init_delay",0),Or(function(){var w,y;return C(function(x){if(x.h==1){c=b.ytAtT;delete b.ytAtT;if(!b.ytAtRC)return a.i.la(6,a.j++),x.return();a.i.la(2,a.j++);w=LB(c,null);return x.yield(a.Hb(w),2)}y=x.i;b.ytAtRC&&b.ytAtRC(JSON.stringify(y));x.o()})},d)):(c=b.ytAtT,delete b.ytAtT,a.i.la(1,a.j++));
t.v(2);break}return t.yield(b.ytAtP,3);case 3:e=t.i;delete b.ytAtP;g=(f=e)==null?void 0:f.R;c=(h=e)==null?void 0:h.T;if(g){a.i.la(1,a.j++);t.v(4);break}a.i.la(2,a.j++);return t.yield(a.Hb(LB(c,null)),5);case 5:k=t.i,g=JSON.stringify(k);case 4:b.ytAtRC?b.ytAtRC(g):sy(Error("ytAtRC not defined for ytAtP."));case 2:return t.yield(yA(),6);case 6:return l=t.i,l.bindInnertubeChallengeFetcher(function(w){a.i.la(3,a.j++);return a.Hb(LB(c,w))}),l.registerChallengeFetchedCallback(function(w){w=w.challenge;
if(!w)throw Error("BGE_MACR");w={challenge:w,Fb:tA(w),vm:m,bgChallenge:new El};w=Promise.resolve(w);a.h=w}),t.yield(xc(),7);
case 7:m=t.i;p=l.getLatestChallengeResponse();r=p.challenge;if(!r)throw Error("BGE_MACIL");return t.return({challenge:r,Fb:tA(r),vm:m,bgChallenge:new El})}})}
HB.prototype.u=function(){var a=this;return C(function(b){return b.h==1?b.yield(Promise.race([a.h,null]),2):b.return(!!b.i)})};
HB.prototype.o=function(a,b,c){var d=this,e,f,g;return C(function(h){d.h===null&&IB(d,KB(d));e=!1;f={};g=function(){var k,l,m,p,r;return C(function(t){switch(t.h){case 1:if(!d.options.fj||!d.options.Ae){t.v(2);break}return t.yield(vA(),3);case 3:return k=t.i,t.yield((l=k)==null?void 0:l.checkForRefresh(),2);case 2:return t.yield(d.h,5);case 5:m=t.i;f.challenge=m.challenge;if(!m.vm){"c1a"in m.Fb&&(f.error="ATTESTATION_ERROR_VM_NOT_INITIALIZED");t.v(6);break}p=Object.assign({},{c:m.challenge,e:a},b);
t.u(7);e=!0;return t.yield(m.vm.snapshot({Ma:p}),9);case 9:(r=t.i)?f.webResponse=r:f.error="ATTESTATION_ERROR_VM_NO_RESPONSE";t.B(6);break;case 7:t.j(),f.error="ATTESTATION_ERROR_VM_INTERNAL_ERROR";case 6:if(a==="ENGAGEMENT_TYPE_PLAYBACK"){var w=m.Fb,y={};w.c6a&&(y.reportingStatus=String(Number(w.c)^EA()));w.c6b&&(y.broadSpectrumDetectionResult=String(Number(w.c)^Number(S("CATSTAT",0))));f.adblockReporting=y}return t.return(f)}})};
return h.return(Promise.race([g(),MB(c,function(){var k=Object.assign({},f);e&&(k.error="ATTESTATION_ERROR_VM_TIMEOUT");return k})]))})};
function KB(a){var b,c,d,e,f,g,h,k,l;return C(function(m){switch(m.h){case 1:return b=LB(void 0,Nl().h),m.u(2),m.yield(NB(a,b),4);case 4:c=m.i;m.B(3);break;case 2:return m.j(),sy(Error("Failed to fetch attestation challenge after 5 attempts; not retrying for 24h.")),OB(a,864E5),m.return({challenge:"",Fb:{},vm:void 0,bgChallenge:void 0});case 3:d=c.Yf;e=c.Zf;f=uA(e);OB(a,f*1E3);g=void 0;if(!("c1a"in e&&c.bgChallenge)){m.v(5);break}h=sA(c.bgChallenge);m.u(6);return m.yield(Ol(Nl(),h),8);case 8:m.B(7);
break;case 6:return k=m.j(),sy(k),m.return({challenge:d,Fb:e,vm:g,bgChallenge:h});case 7:return m.u(9),g=new Kl({challenge:h,Pb:{va:"aGIf"}}),m.yield(g.Tb,11);case 11:m.B(5);break;case 9:l=m.j(),sy(l),g=void 0;case 5:return m.return({challenge:d,Fb:e,vm:g,bgChallenge:h})}})}
function PB(a,b){var c;return C(function(d){if(d.h==1)return wA(2),d.u(2),d.yield(a.network.Hb(b),4);if(d.h!=2)return(c=d.i)?c.challenge&&!c.bgChallenge?wA(1):wA(4):wA(3),d.return(c);d.j();wA(3);return d.return(void 0)})}
HB.prototype.Hb=function(a){var b=this,c;return C(function(d){c=b.H;if(!c||c.za())return d.return(PB(b,a));EB("att_pna");return d.return(new Promise(function(e){hk(c,"publicytnetworkstatus-online",function(){PB(b,a).then(e)})}))})};
function QB(a){if(!a)throw Error("Fetching Attestation challenge returned falsy");if(!a.challenge)throw Error("Missing Attestation challenge");var b=a.challenge,c=tA(b);if("c1a"in c&&(!a.bgChallenge||!a.bgChallenge.program))throw Error("Expected bg challenge but missing.");return Object.assign({},a,{Yf:b,Zf:c})}
function NB(a,b){var c,d,e,f,g;return C(function(h){switch(h.h){case 1:c=void 0,d=0,e={};case 2:if(!(d<5)){h.v(4);break}if(!(d>0)){h.v(5);break}e.Od=1E3*Math.pow(2,d-1)+Math.random()*1E3;return h.yield(new Promise(function(k){return function(l){Nr(function(){l(void 0)},k.Od)}}(e)),5);
case 5:return h.u(7),a.i.la(4,a.j++),h.yield(a.Hb(b),9);case 9:return f=h.i,h.return(QB(f));case 7:c=g=h.j(),g instanceof Error&&sy(g);case 8:d++;e={Od:void 0};h.v(2);break;case 4:throw c;}})}
function IB(a,b){a.h=b}
function RB(a){var b,c,d;return C(function(e){if(e.h==1)return e.yield(Promise.race([a.h,null]),2);b=e.i;var f=KB(a);a.h=f;(c=b)==null||(d=c.vm)==null||d.dispose();e.o()})}
function OB(a,b){function c(){var e;return C(function(f){e=d-Date.now();return e<1E3?f.yield(RB(a),0):(Nr(c,Math.min(e,6E4)),f.v(0))})}
var d=Date.now()+b;c()}
function MB(a,b){return new Promise(function(c){Nr(function(){c(b())},a)})}
function LB(a,b){var c={engagementType:"ENGAGEMENT_TYPE_UNBOUND"};a&&(c.eacrToken=a);b&&(c.interpreterHash=b);return c}
;var SB={},TB=(SB.WEB_UNPLUGGED="^unplugged/",SB.WEB_UNPLUGGED_ONBOARDING="^unplugged/",SB.WEB_UNPLUGGED_OPS="^unplugged/",SB.WEB_UNPLUGGED_PUBLIC="^unplugged/",SB.WEB_CREATOR="^creator/",SB.WEB_KIDS="^kids/",SB.WEB_EXPERIMENTS="^experiments/",SB.WEB_MUSIC="^music/",SB.WEB_REMIX="^music/",SB.WEB_MUSIC_EMBEDDED_PLAYER="^music/",SB.WEB_MUSIC_EMBEDDED_PLAYER="^main_app/|^sfv/",SB);
function UB(a){var b=b===void 0?"UNKNOWN_INTERFACE":b;if(a.length===1)return a[0];var c=TB[b];if(c){c=new RegExp(c);for(var d=z(a),e=d.next();!e.done;e=d.next())if(e=e.value,c.exec(e))return e}var f=[];Object.entries(TB).forEach(function(g){var h=z(g);g=h.next().value;h=h.next().value;b!==g&&f.push(h)});
c=new RegExp(f.join("|"));a.sort(function(g,h){return g.length-h.length});
d=z(a);for(e=d.next();!e.done;e=d.next())if(e=e.value,!c.exec(e))return e;return a[0]}
;function VB(){this.h=WB.instance}
VB.prototype.Hb=function(a){EB("att_fsr");return XB(this.h,a).then(function(b){EB("att_frr");return b})};var YB=new Uw("INNERTUBE_TRANSPORT_TOKEN");function ZB(){var a,b,c;return C(function(d){if(d.h==1)return a=ax().resolve(YB),a?d.yield($B(a),2):(sy(Error("InnertubeTransportService unavailable in fetchDatasyncIds")),d.return(void 0));if(b=d.i){if(b.errorMetadata)return sy(Error("Datasync IDs fetch responded with "+b.errorMetadata.status+": "+b.error)),d.return(void 0);c=b.bj;return d.return(c)}sy(Error("Network request to get Datasync IDs failed."));return d.return(void 0)})}
;function aC(){this.h={};if(this.i=wr()){var a=ur("CONSISTENCY");a&&bC(this,{encryptedTokenJarContents:a})}}
aC.prototype.handleResponse=function(a,b){if(!b)throw Error("request needs to be passed into ConsistencyService");var c,d;b=((c=b.Na.context)==null?void 0:(d=c.request)==null?void 0:d.consistencyTokenJars)||[];var e;if(a=(e=a.responseContext)==null?void 0:e.consistencyTokenJar){e=z(b);for(c=e.next();!c.done;c=e.next())delete this.h[c.value.encryptedTokenJarContents];bC(this,a)}};
function bC(a,b){if(b.encryptedTokenJarContents&&(a.h[b.encryptedTokenJarContents]=b,typeof b.expirationSeconds==="string")){var c=Number(b.expirationSeconds);setTimeout(function(){delete a.h[b.encryptedTokenJarContents]},c*1E3);
a.i&&tr("CONSISTENCY",b.encryptedTokenJarContents,c,void 0,!0)}}
;var cC=window.location.hostname.split(".").slice(-2).join(".");function dC(){this.i=-1;var a=S("LOCATION_PLAYABILITY_TOKEN");S("INNERTUBE_CLIENT_NAME")==="TVHTML5"&&(this.localStorage=eC(this))&&(a=this.localStorage.get("yt-location-playability-token"));a&&(this.locationPlayabilityToken=a,this.h=void 0)}
var fC;function gC(){fC=I("yt.clientLocationService.instance");fC||(fC=new dC,G("yt.clientLocationService.instance",fC));return fC}
n=dC.prototype;
n.setLocationOnInnerTubeContext=function(a){a.client||(a.client={});if(this.h)a.client.locationInfo||(a.client.locationInfo={}),a.client.locationInfo.latitudeE7=Math.floor(this.h.coords.latitude*1E7),a.client.locationInfo.longitudeE7=Math.floor(this.h.coords.longitude*1E7),a.client.locationInfo.horizontalAccuracyMeters=Math.round(this.h.coords.accuracy),a.client.locationInfo.forceLocationPlayabilityTokenRefresh=!0;else if(this.j||this.locationPlayabilityToken)a.client.locationPlayabilityToken=this.j||
this.locationPlayabilityToken};
n.handleResponse=function(a){var b;a=(b=a.responseContext)==null?void 0:b.locationPlayabilityToken;a!==void 0&&(this.locationPlayabilityToken=a,this.h=void 0,S("INNERTUBE_CLIENT_NAME")==="TVHTML5"?(this.localStorage=eC(this))&&this.localStorage.set("yt-location-playability-token",a,15552E3):tr("YT_CL",JSON.stringify({loctok:a}),15552E3,cC,!0))};
function eC(a){return a.localStorage===void 0?new vs("yt-client-location"):a.localStorage}
n.clearLocationPlayabilityToken=function(a){a==="TVHTML5"?(this.localStorage=eC(this))&&this.localStorage.remove("yt-location-playability-token"):vr("YT_CL");this.j=void 0;this.i!==-1&&(clearTimeout(this.i),this.i=-1)};
n.getCurrentPositionFromGeolocation=function(){var a=this;if(!(navigator&&navigator.geolocation&&navigator.geolocation.getCurrentPosition))return Promise.reject(Error("Geolocation unsupported"));var b=!1,c=1E4;S("INNERTUBE_CLIENT_NAME")==="MWEB"&&(b=!0,c=15E3);return new Promise(function(d,e){navigator.geolocation.getCurrentPosition(function(f){a.h=f;d(f)},function(f){e(f)},{enableHighAccuracy:b,
maximumAge:0,timeout:c})})};
n.createUnpluggedLocationInfo=function(a){var b={};a=a.coords;if(a==null?0:a.latitude)b.latitudeE7=Math.floor(a.latitude*1E7);if(a==null?0:a.longitude)b.longitudeE7=Math.floor(a.longitude*1E7);if(a==null?0:a.accuracy)b.locationRadiusMeters=Math.round(a.accuracy);return b};
n.createLocationInfo=function(a){var b={};a=a.coords;if(a==null?0:a.latitude)b.latitudeE7=Math.floor(a.latitude*1E7);if(a==null?0:a.longitude)b.longitudeE7=Math.floor(a.longitude*1E7);return b};function hC(a,b,c){b=b===void 0?!1:b;c=c===void 0?!1:c;var d=S("INNERTUBE_CONTEXT");if(!d)return ry(Error("Error: No InnerTubeContext shell provided in ytconfig.")),{};d=Ji(d);T("web_no_tracking_params_in_shell_killswitch")||delete d.clickTracking;d.client||(d.client={});var e=d.client;e.clientName==="MWEB"&&e.clientFormFactor!=="AUTOMOTIVE_FORM_FACTOR"&&(e.clientFormFactor=S("IS_TABLET")?"LARGE_FORM_FACTOR":"SMALL_FORM_FACTOR");e.screenWidthPoints=window.innerWidth;e.screenHeightPoints=window.innerHeight;
e.screenPixelDensity=Math.round(window.devicePixelRatio||1);e.screenDensityFloat=window.devicePixelRatio||1;e.utcOffsetMinutes=-Math.floor((new Date).getTimezoneOffset());var f=f===void 0?!1:f;Ar();var g="USER_INTERFACE_THEME_LIGHT";Dr(165)?g="USER_INTERFACE_THEME_DARK":Dr(174)?g="USER_INTERFACE_THEME_LIGHT":!T("kevlar_legacy_browsers")&&window.matchMedia&&window.matchMedia("(prefers-color-scheme)").matches&&window.matchMedia("(prefers-color-scheme: dark)").matches&&(g="USER_INTERFACE_THEME_DARK");
f=f?g:rA()||g;e.userInterfaceTheme=f;if(!b){if(f=Ir())e.connectionType=f;T("web_log_effective_connection_type")&&(f=Jr())&&(d.client.effectiveConnectionType=f)}var h;if(T("web_log_memory_total_kbytes")&&((h=E.navigator)==null?0:h.deviceMemory)){var k;h=(k=E.navigator)==null?void 0:k.deviceMemory;d.client.memoryTotalKbytes=""+h*1E6}T("web_gcf_hashes_innertube")&&(f=uu())&&(k=f.coldConfigData,h=f.coldHashData,f=f.hotHashData,d.client.configInfo=d.client.configInfo||{},k&&(d.client.configInfo.coldConfigData=
k),h&&(d.client.configInfo.coldHashData=h),f&&(d.client.configInfo.hotHashData=f));k=vq(E.location.href);!T("web_populate_internal_geo_killswitch")&&k.internalcountrycode&&(e.internalGeo=k.internalcountrycode);e.clientName==="MWEB"||e.clientName==="WEB"?(e.mainAppWebInfo||(e.mainAppWebInfo={}),e.mainAppWebInfo.graftUrl=E.location.href,T("kevlar_woffle")&&or.instance&&(k=or.instance,e.mainAppWebInfo.pwaInstallabilityStatus=!k.h&&k.i?"PWA_INSTALLABILITY_STATUS_CAN_BE_INSTALLED":"PWA_INSTALLABILITY_STATUS_UNKNOWN"),
e.mainAppWebInfo.webDisplayMode=pr(),e.mainAppWebInfo.isWebNativeShareAvailable=navigator&&navigator.share!==void 0):e.clientName==="TVHTML5"&&(!T("web_lr_app_quality_killswitch")&&(k=S("LIVING_ROOM_APP_QUALITY"))&&(e.tvAppInfo=Object.assign(e.tvAppInfo||{},{appQuality:k})),k=S("LIVING_ROOM_CERTIFICATION_SCOPE"))&&(e.tvAppInfo=Object.assign(e.tvAppInfo||{},{certificationScope:k}));if(!T("web_populate_time_zone_itc_killswitch")){a:{if(typeof Intl!=="undefined")try{var l=(new Intl.DateTimeFormat).resolvedOptions().timeZone;
break a}catch(ma){}l=void 0}l&&(e.timeZone=l)}(l=S("EXPERIMENTS_TOKEN",""))?e.experimentsToken=l:delete e.experimentsToken;l=Kq();aC.instance||(aC.instance=new aC);d.request=Object.assign({},d.request,{internalExperimentFlags:l,consistencyTokenJars:Bi(aC.instance.h)});!T("web_prequest_context_killswitch")&&(l=S("INNERTUBE_CONTEXT_PREQUEST_CONTEXT"))&&(d.request.externalPrequestContext=l);e=Ar();l=Dr(58);e=e.get("gsml","");d.user=Object.assign({},d.user);l&&(d.user.enableSafetyMode=l);e&&(d.user.lockedSafetyMode=
!0);T("warm_op_csn_cleanup")?c&&(b=Ly())&&(d.clientScreenNonce=b):!b&&(b=Ly())&&(d.clientScreenNonce=b);a&&(d.clickTracking={clickTrackingParams:a});if(a=I("yt.mdx.remote.remoteClient_"))d.remoteClient=a;gC().setLocationOnInnerTubeContext(d);try{var m=zq(),p=m.bid;delete m.bid;d.adSignalsInfo={params:[],bid:p};for(var r=z(Object.entries(m)),t=r.next();!t.done;t=r.next()){var w=z(t.value),y=w.next().value,x=w.next().value;m=y;p=x;a=void 0;(a=d.adSignalsInfo.params)==null||a.push({key:m,value:""+p})}var H,
F;if(((H=d.client)==null?void 0:H.clientName)==="TVHTML5"||((F=d.client)==null?void 0:F.clientName)==="TVHTML5_UNPLUGGED"){var W=S("INNERTUBE_CONTEXT");W.adSignalsInfo&&(d.adSignalsInfo.advertisingId=W.adSignalsInfo.advertisingId,d.adSignalsInfo.advertisingIdSignalType="DEVICE_ID_TYPE_CONNECTED_TV_IFA",d.adSignalsInfo.limitAdTracking=W.adSignalsInfo.limitAdTracking)}}catch(ma){ry(ma)}return d}
;function iC(a){var b={"Content-Type":"application/json"};S("EOM_VISITOR_DATA")?b["X-Goog-EOM-Visitor-Id"]=S("EOM_VISITOR_DATA"):S("VISITOR_DATA")&&(b["X-Goog-Visitor-Id"]=S("VISITOR_DATA"));b["X-Youtube-Bootstrap-Logged-In"]=S("LOGGED_IN",!1);S("DEBUG_SETTINGS_METADATA")&&(b["X-Debug-Settings-Metadata"]=S("DEBUG_SETTINGS_METADATA"));a!=="cors"&&((a=S("INNERTUBE_CONTEXT_CLIENT_NAME"))&&(b["X-Youtube-Client-Name"]=a),(a=S("INNERTUBE_CONTEXT_CLIENT_VERSION"))&&(b["X-Youtube-Client-Version"]=a),(a=S("CHROME_CONNECTED_HEADER"))&&
(b["X-Youtube-Chrome-Connected"]=a),(a=S("DOMAIN_ADMIN_STATE"))&&(b["X-Youtube-Domain-Admin-State"]=a));(a=S("SERIALIZED_LAVA_DEVICE_CONTEXT"))&&(b["X-YouTube-Lava-Device-Context"]=a);return b}
;function jC(a){return function(){return new a}}
;function kC(){}
kC.prototype.u=function(a,b,c){b=b===void 0?{}:b;c=c===void 0?sr:c;var d={context:hC(a.clickTrackingParams,!1,this.o)};var e=this.i(a);if(e){this.h(d,e,b);var f;b="/youtubei/v1/"+UB(this.j());(e=(f=zx(a.commandMetadata,Np))==null?void 0:f.apiUrl)&&(b=e);f=Wy(Vy(b));a=Object.assign({},{command:a},void 0);d={input:f,kb:Xy(f),Na:d,config:a};d.config.ac?d.config.ac.identity=c:d.config.ac={identity:c};return d}c=new U("Error: Failed to create Request from Command.",a);ry(c)};
da.Object.defineProperties(kC.prototype,{o:{configurable:!0,enumerable:!0,get:function(){return!1}}});
function lC(){}
v(lC,kC);function mC(){}
v(mC,lC);mC.prototype.u=function(){return{input:"/getDatasyncIdsEndpoint",kb:Xy("/getDatasyncIdsEndpoint","GET"),Na:{}}};
mC.prototype.j=function(){return[]};
mC.prototype.i=function(){};
mC.prototype.h=function(){};var nC={},oC=(nC.GET_DATASYNC_IDS=jC(mC),nC);var pC="tokens consistency service_params mss client_location entities adblock_detection response_received_commands store manifest player_preload shorts_prefetch".split(" "),qC=["type.googleapis.com/youtube.api.pfiinnertube.YoutubeApiInnertube.BrowseResponse","type.googleapis.com/youtube.api.pfiinnertube.YoutubeApiInnertube.PlayerResponse","type.googleapis.com/youtube.api.pfiinnertube.YoutubeApiInnertube.PanelResponse"];
function WB(a,b,c,d){this.u=a;this.ia=b;this.j=c;this.o=d;this.i=void 0;this.h=new Map;a.wc||(a.wc={});a.wc=Object.assign({},oC,a.wc)}
function rC(a,b,c){var d=sC;if(WB.instance!==void 0){if(c=WB.instance,a=[d!==c.u,a!==c.ia,b!==c.j,!1,!1,!1,void 0!==c.i],a.some(function(e){return e}))throw new U("InnerTubeTransportService is already initialized",a);
}else WB.instance=new WB(d,a,b,c)}
function $B(a){var b={signalServiceEndpoint:{signal:"GET_DATASYNC_IDS"}};var c=c===void 0?sr:c;var d=tC(a,b);return d?new Ck(function(e,f){var g,h,k,l,m;return C(function(p){switch(p.h){case 1:return p.yield(d,2);case 2:g=p.i;h=g.u(b,void 0,c);if(!h){f(new U("Error: Failed to build request for command.",b));p.v(0);break}lA(h.input);l=((k=h.kb)==null?void 0:k.mode)==="cors"?"cors":void 0;if(a.j.xe){m=uC(h.config,l);p.v(4);break}return p.yield(vC(h.config,l),5);case 5:m=p.i;case 4:e(wC(a,h,m)),p.o()}})}):
Hk(new U("Error: No request builder found for command.",b))}
function XB(a,b){function c(){}
var d="/youtubei/v1/"+UB(nz);var e=e===void 0?{ac:{identity:sr}}:e;var f=f===void 0?!0:f;c=CB(BB(d));b.context||(b.context=hC(void 0,f));return new Ck(function(g){var h,k,l,m,p;return C(function(r){if(r.h==1)return h=Vy(d),k=yq(h)?"same-origin":"cors",a.j.xe?(l=uC(e,k),r.v(2)):r.yield(vC(e,k),3);r.h!=2&&(l=r.i);m=Wy(Vy(d));p={input:m,kb:Xy(m),Na:b,config:e};g(wC(a,p,l,c));r.o()})})}
function xC(a){var b,c,d,e,f,g;return C(function(h){switch(h.h){case 1:if(!((b=a)==null?0:(c=b.Na)==null?0:c.context)){h.v(0);break}d=a.Na.context;h.v(3);break;case 3:e=z([]),f=e.next();case 6:if(f.done){h.v(0);break}g=f.value;return h.yield(g.yj(d),7);case 7:f=e.next(),h.v(6)}})}
function yC(a,b,c){var d;if(b&&!(b==null?0:(d=b.sequenceMetaData)==null?0:d.skipProcessing)&&a.o){d=z(pC);for(var e=d.next();!e.done;e=d.next())e=e.value,a.o[e]&&a.o[e].handleResponse(b,c)}}
function wC(a,b,c,d){d=d===void 0?function(){}:d;
var e,f,g,h,k,l,m,p,r,t,w,y,x,H,F,W,ma,ja,Od,Kb,gb,Qa,Ea,Pa,Bv,Cv,Dv,Ev;return C(function(na){switch(na.h){case 1:g=(e=b.config)==null?void 0:(f=e.Lj)==null?void 0:f.Kj;na.v(2);break;case 3:h=na.i;if(!h||h.isExpired()){na.v(2);break}k=h.h();if(!T("web_process_response_store_responses")||h.isProcessed()){na.v(5);break}yC(a,k,b);return na.yield((void 0).rj(g),5);case 5:return na.return(Promise.resolve(k));case 2:if((l=a.i)==null||!l.Gj(b.input,b.Na)){na.v(7);break}return na.yield(a.i.oj(b.input,b.Na),
8);case 8:return m=na.i,yC(a,m,b),na.return(m);case 7:return na.yield(xC(b),9);case 9:return(t=(r=b.config)==null?void 0:r.requestKey)&&a.h.has(t)?p=a.h.get(t):(w=JSON.stringify(b.Na),H=(x=(y=b.kb)==null?void 0:y.headers)!=null?x:{},b.kb=Object.assign({},b.kb,{headers:Object.assign({},H,c)}),F=Object.assign({},b.kb),b.kb.method==="POST"&&(F=Object.assign({},F,{body:w})),((W=b.config)==null?0:W.hg)&&zB(b.config.hg),ma=function(){return a.ia.fetch(b.input,F,b.config)},p=ma(),t&&a.h.set(t,p)),na.yield(p,
10);
case 10:(ja=na.i)&&T("web_streaming_player")&&Array.isArray(ja)&&(ja=ja[0].playerResponse);if(ja&&"error"in ja&&((Od=ja)==null?0:(Kb=Od.error)==null?0:Kb.details))for(gb=ja.error.details,Qa=z(gb),Ea=Qa.next();!Ea.done;Ea=Qa.next())Pa=Ea.value,(Bv=Pa["@type"])&&qC.indexOf(Bv)>-1&&(delete Pa["@type"],ja=Pa);t&&a.h.has(t)&&a.h.delete(t);((Cv=b.config)==null?0:Cv.ig)&&zB(b.config.ig);if(ja||(Dv=a.i)==null||!Dv.Zi(b.input,b.Na)){na.v(11);break}return na.yield(a.i.nj(b.input,b.Na),12);case 12:ja=na.i;case 11:return yC(a,
ja,b),((Ev=b.config)==null?0:Ev.eg)&&zB(b.config.eg),d(),na.return(ja||void 0)}})}
function tC(a,b){a:{a=a.u;var c,d=(c=zx(b,Op))==null?void 0:c.signal;if(d&&a.wc&&(c=a.wc[d])){var e=c();break a}var f;if((c=(f=zx(b,Mp))==null?void 0:f.request)&&a.Ze&&(f=a.Ze[c])){e=f();break a}for(e in b)if(a.Sd[e]&&(b=a.Sd[e])){e=b();break a}e=void 0}if(e!==void 0)return Promise.resolve(e)}
function vC(a,b){var c,d,e,f;return C(function(g){if(g.h==1){e=(c=a)==null?void 0:(d=c.ac)==null?void 0:d.sessionIndex;var h=g.yield;var k=rr({sessionIndex:e});if(!(k instanceof Ck)){var l=new Ck(Ak);Dk(l,2,k);k=l}return h.call(g,k,2)}f=g.i;return g.return(Promise.resolve(Object.assign({},iC(b),f)))})}
function uC(a,b){var c;a=a==null?void 0:(c=a.ac)==null?void 0:c.sessionIndex;c=rr({sessionIndex:a});return Object.assign({},iC(b),c)}
;function zC(){}
v(zC,lC);zC.prototype.j=function(){return tz};
zC.prototype.i=function(a){return zx(a,Zp)||void 0};
zC.prototype.h=function(a,b,c){c=c===void 0?{}:c;b.channelIds&&(a.channelIds=b.channelIds);b.siloName&&(a.siloName=b.siloName);b.params&&(a.params=b.params);c.botguardResponse&&(a.botguardResponse=c.botguardResponse);c.feature&&(a.clientFeature=c.feature)};
da.Object.defineProperties(zC.prototype,{o:{configurable:!0,enumerable:!0,get:function(){return!0}}});function AC(){}
v(AC,lC);AC.prototype.j=function(){return uz};
AC.prototype.i=function(a){return zx(a,Yp)||void 0};
AC.prototype.h=function(a,b){b.channelIds&&(a.channelIds=b.channelIds);b.siloName&&(a.siloName=b.siloName);b.params&&(a.params=b.params)};
da.Object.defineProperties(AC.prototype,{o:{configurable:!0,enumerable:!0,get:function(){return!0}}});var BC=new Uw("SHARE_CLIENT_PARAMS_PROVIDER_TOKEN");function CC(a){this.H=a}
v(CC,lC);CC.prototype.j=function(){return oz};
CC.prototype.i=function(a){return zx(a,Sp)||zx(a,Tp)||zx(a,Rp)};
CC.prototype.h=function(a,b){b.serializedShareEntity&&(a.serializedSharedEntity=b.serializedShareEntity);if(b.clientParamIdentifier){var c;if((c=this.H)==null?0:c.h(b.clientParamIdentifier))a.clientParams=this.H.i(b.clientParamIdentifier)}};
CC[Tw]=[BC];function DC(){}
v(DC,lC);DC.prototype.j=function(){return qz};
DC.prototype.i=function(a){return zx(a,Qp)||void 0};
DC.prototype.h=function(a,b,c){a.feedbackTokens=[];b.feedbackToken&&a.feedbackTokens.push(b.feedbackToken);if(b=b.cpn||c.cpn)a.feedbackContext={cpn:b};a.isFeedbackTokenUnencrypted=!!c.is_feedback_token_unencrypted;a.shouldMerge=!1;c.extra_feedback_tokens&&(a.shouldMerge=!0,a.feedbackTokens=a.feedbackTokens.concat(c.extra_feedback_tokens))};
da.Object.defineProperties(DC.prototype,{o:{configurable:!0,enumerable:!0,get:function(){return!0}}});function EC(){}
v(EC,lC);EC.prototype.j=function(){return qz};
EC.prototype.i=function(a){return zx(a,Xp)};
EC.prototype.h=function(a,b){b.undoToken&&(a.feedbackTokens=[b.undoToken]);b.isUndoTokenUnencrypted&&(a.isFeedbackTokenUnencrypted=b.isUndoTokenUnencrypted)};
da.Object.defineProperties(EC.prototype,{o:{configurable:!0,enumerable:!0,get:function(){return!0}}});function FC(){}
v(FC,lC);FC.prototype.j=function(){return rz};
FC.prototype.i=function(a){return zx(a,Wp)||void 0};
FC.prototype.h=function(a,b){b.params&&(a.params=b.params);b.secondaryParams&&(a.secondaryParams=b.secondaryParams)};function GC(){}
v(GC,lC);GC.prototype.j=function(){return sz};
GC.prototype.i=function(a){return zx(a,Vp)||void 0};
GC.prototype.h=function(a,b){b.actions&&(a.actions=b.actions);b.params&&(a.params=b.params);b.playlistId&&(a.playlistId=b.playlistId)};function HC(){}
v(HC,lC);HC.prototype.j=function(){return pz};
HC.prototype.i=function(a){return zx(a,Up)};
HC.prototype.h=function(a,b,c){c=c===void 0?{}:c;b.serializedShareEntity&&(a.serializedSharedEntity=b.serializedShareEntity);c.includeListId&&(a.includeListId=!0)};function IC(){var a;return(a=S("WEB_PLAYER_CONTEXT_CONFIGS"))==null?void 0:a.WEB_PLAYER_CONTEXT_CONFIG_ID_EMBEDDED_PLAYER}
;var JC=E.caches,KC;function LC(a){var b=a.indexOf(":");return b===-1?{he:a}:{he:a.substring(0,b),datasyncId:a.substring(b+1)}}
function MC(){return C(function(a){if(KC!==void 0)return a.return(KC);KC=new Promise(function(b){var c;return C(function(d){switch(d.h){case 1:return d.u(2),d.yield(JC.open("test-only"),4);case 4:return d.yield(JC.delete("test-only"),5);case 5:d.B(3);break;case 2:if(c=d.j(),c instanceof Error&&c.name==="SecurityError")return b(!1),d.return();case 3:b("caches"in window),d.o()}})});
return a.return(KC)})}
function NC(a){var b,c,d,e,f,g,h;C(function(k){if(k.h==1)return k.yield(MC(),2);if(k.h!=3){if(!k.i)return k.return(!1);b=[];return k.yield(JC.keys(),3)}c=k.i;d=z(c);for(e=d.next();!e.done;e=d.next())f=e.value,g=LC(f),h=g.datasyncId,!h||a.includes(h)||b.push(JC.delete(f));return k.return(Promise.all(b).then(function(l){return l.some(function(m){return m})}))})}
function OC(){var a,b,c,d,e,f,g;return C(function(h){if(h.h==1)return h.yield(MC(),2);if(h.h!=3){if(!h.i)return h.return(!1);a=Lr("cache contains other");return h.yield(JC.keys(),3)}b=h.i;c=z(b);for(d=c.next();!d.done;d=c.next())if(e=d.value,f=LC(e),(g=f.datasyncId)&&g!==a)return h.return(!0);return h.return(!1)})}
;function PC(){try{return!!self.sessionStorage}catch(a){return!1}}
;function QC(a){a=a.match(/(.*)::.*::.*/);if(a!==null)return a[1]}
function RC(a){if(PC()){var b=Object.keys(window.sessionStorage);b=z(b);for(var c=b.next();!c.done;c=b.next()){c=c.value;var d=QC(c);d===void 0||a.includes(d)||self.sessionStorage.removeItem(c)}}}
function SC(){if(!PC())return!1;var a=Lr(),b=Object.keys(window.sessionStorage);b=z(b);for(var c=b.next();!c.done;c=b.next())if(c=QC(c.value),c!==void 0&&c!==a)return!0;return!1}
;function TC(){ZB().then(function(a){a&&(Wt(a),NC(a),gA(a),RC(a))})}
function UC(){var a=new fw;vn.wa(function(){var b,c,d,e,f;return C(function(g){switch(g.h){case 1:if(T("ytidb_clear_optimizations_killswitch")){g.v(2);break}b=Lr("clear");if(b.startsWith("V")&&b.endsWith("||")){var h=[b];Wt(h);NC(h);gA(h);RC(h);return g.return()}c=hA();d=SC();return g.yield(OC(),3);case 3:return e=g.i,g.yield(Xt(),4);case 4:if(f=g.i,!(c||d||e||f))return g.return();case 2:a.za()?TC():hk(a,"publicytnetworkstatus-online",TC),g.o()}})})}
;function VC(a){return new Promise(function(b){window.setTimeout(b,a)})}
function WC(a,b,c){this.requestKey=a;this.o=b;this.i=c;this.u=function(){return new XMLHttpRequest};
this.h=void 0;this.j=[]}
WC.prototype.getLatestChallengeResponse=function(){return this.i};
function jm(a,b,c){var d,e,f,g;return C(function(h){if(h.h==1){wB();zB("att_fs",void 0,"attestation_challenge_fetch");if(!a.h)throw new al(9,"Missing fetcher");return h.yield(a.h(b,c),2)}d=h.i;f=(e=d)==null?void 0:e.bgChallenge;if(!f)throw new al(15,"Missing field");a.i=d;a.j.forEach(function(k){k(d)});
g=sA(f);zB("att_fc",void 0,"attestation_challenge_fetch");xB();return h.return(g)})}
function Tm(a,b){var c,d,e,f,g;return C(function(h){switch(h.h){case 1:c=new oj(100,3E5,.25,2),d=void 0;case 2:if(!(c.i<10)){h.v(4);break}h.u(5);if(!(c.i>0)){h.v(7);break}return h.yield(VC(c.getValue()),7);case 7:return h.yield(XC(a,b),9);case 9:return e=h.i,h.return(e);case 5:f=h.j();f instanceof al?d=f:(g=f instanceof Error?f.message:"Unknown",d=new al(9,g));pj(c);h.v(2);break;case 4:if(d)throw d;throw new al(9,"Unknown error");}})}
function XC(a,b){b=Ul(Vl(new Tl,b),a.requestKey);var c=new Il,d=a.u();d.open("POST",a.o);d.setRequestHeader("X-Goog-Api-Key","AIzaSyDyT5W0Jh49F30Pqqtyfdf7pDLFKLJoAnw");d.setRequestHeader("Content-Type","application/json+protobuf");d.onload=function(){if(Dq(d)){var e=qn(d.responseText);c.resolve(e)}else c.reject(new al(Zk(Eq(d)),d.statusText))};
d.onerror=function(){c.reject(new al(Zk(Eq(d)),d.statusText))};
d.send(b.serialize());return c.promise}
function YC(a){var b={bicf:function(f){a.h=f},
blc:function(){return a.getLatestChallengeResponse()},
bcr:function(f){a.j.push(f)}},c=window;
c.ntpevasrs=b;if(c.ntpqfbel!==void 0)for(var d=z(c.ntpqfbel),e=d.next();!e.done;e=d.next())e=e.value,e(b);c.ntpqfbel=void 0}
;function ZC(a){var b,c;(b=a.ytcsi)==null||(c=b.tick)==null||c.call(b,"pot_ist")}
function $C(a){if(a instanceof Error){var b=I("yt.logging.errors.log");b&&b(a,"WARNING")}}
;function aD(a,b){var c=this;this.h=0;var d;this.cc=(d=b==null?void 0:b.cc)!=null?d:window;this.yd=b==null?void 0:b.yd;var e;this.requestKey=(e=b==null?void 0:b.requestKey)!=null?e:Jq("par_bir_key")||"O43z0dpjhgX20SCx4KAo";var f;this.Ee=(f=b==null?void 0:b.Ee)!=null?f:function(k){return new Wl(k)};
var g;d=(g=b==null?void 0:b.hj)!=null?g:function(k,l,m){return new WC(k,l,m)};
this.bgChallenge=sA(a.bgChallenge);this.ttlSeconds=uA(tA(a.challenge||""));this.Ta=d(this.requestKey,T("par_at_ep")?["www.youtube.com","m.youtube.com"].includes(E.location.hostname)?"/api/jnn/v1/GenerateIT":"https://jnn-pa.googleapis.com/$rpc/google.internal.waa.v1.Waa/GenerateIT":"https://jnn-pa.googleapis.com/$rpc/google.internal.waa.v1.Waa/GenerateIT",a);this.He=b==null?void 0:b.He;YC(this.Ta);var h;this.oe=(h=b==null?void 0:b.oe)!=null?h:function(k){Zj(c.cc.document,"visibilitychange",function(){c.cc.document.visibilityState===
"visible"&&k()})}}
function bD(a){if(!a.vm){var b={maxAttempts:5,ne:a.ttlSeconds*1E3};ZC(a.cc);a.vm=a.Ee({Ta:a.Ta,Pb:{disable:T("html5_web_po_disable_remote_logging"),va:"aGIf",qf:Iq(),Sf:T("wpo_dis_lfdms")?0:1E3,Vb:function(d){var e=dA.get(d);e||(e=new cA(d),e=new Vk(e),dA.set(d,e));return e}},
Wb:b,Cf:a.bgChallenge,Rc:$C});a.h=Date.now();cm(a.vm,function(){a.h=Date.now()});
a.cc.bgevmc={p:function(){var d;(d=a.vm)==null||d.pause()},
r:function(){var d;(d=a.vm)==null||d.resume()},
cr:function(){var d,e;return(e=(d=a.vm)==null?void 0:d.checkForRefresh())!=null?e:Promise.resolve()}};
Fc(a.vm,function(){return C(function(d){return d.return(cD(a))})});
var c=a.j.bind(a);a.yd&&a.ttlSeconds>0&&a.yd.then(function(d){d.listen("publicytnetworkstatus-online",c)});
a.oe(c)}}
aD.prototype.j=function(){if(Date.now()>this.h+this.ttlSeconds*1E3){var a;(a=this.vm)==null||am(a)}};
function cD(a){if(a.i)return a.i;if(!a.vm)throw Error("VMNI");a.i=new Pm({vm:a.vm,Ta:a.Ta,Ld:!0,onError:$C,Wb:a.He});return a.i}
function dD(a,b){a=new aD(a,b);bD(a);(b==null?0:b.dj)||cD(a)}
function eD(a){try{var b=JSON.parse(a);if(b.bgChallenge)return b}catch(c){}}
function fD(){var a=window,b={};a=a===void 0?window:a;var c=a.ytAtR,d;b==null||(d=b.Yd)==null||d.zj();if(c){if(c=eD(c)){var e;b==null||(e=b.Yd)==null||e.le("SUCCESS");dD(c,b)}a.ytAtR=void 0}else a.ytAtRC=function(f){if(f=eD(f)){var g;b==null||(g=b.Yd)==null||g.le("SUCCESS");dD(f,b);a.ytAtRC=void 0}}}
;var gD=["www.youtube-nocookie.com","www.youtubeeducation.com","youtube.googleapis.com"];function hD(){this.state=1;this.vm=null;this.h=void 0}
n=hD.prototype;n.initialize=function(a,b,c,d){this.h=d;if(a.program){var e;d=(e=a.interpreterUrl)!=null?e:null;if(a.interpreterSafeScript)e=Ep(a.interpreterSafeScript);else{var f;e=(f=a.interpreterScript)!=null?f:null}a.interpreterSafeUrl&&(d=Fp(a.interpreterSafeUrl).toString());iD(this,e,d,a.program,b,c)}else sy(Error("BL:CIP"))};
function iD(a,b,c,d,e,f){var g=g===void 0?"trayride":g;c?(a.state=2,xz(Gp(c),function(){window[g]?jD(a,d,g,e):(a.state=3,zz(c),sy(new U("BL:ULB",""+c)))},f)):b?(f=Pi("SCRIPT"),b instanceof Db?(f.textContent=Fb(b),Gb(f)):f.textContent=b,f.nonce=Cb(document),document.head.appendChild(f),document.head.removeChild(f),window[g]?jD(a,d,g,e):(a.state=4,sy(new U("BL:ULBJ")))):sy(new U("BL:ULV"))}
n.isLoading=function(){return this.state===2};
function jD(a,b,c,d){a.state=5;var e=!!a.h&&gD.includes(hc(a.h)||"");try{var f=new Kl({program:b,globalName:c,Pb:{disable:!T("att_web_record_metrics")||!T("att_skip_metrics_for_cookieless_domains_ks")&&e,va:"aGIf"}});f.Tb.then(function(){a.state=6;d&&d(b)});
a.Ed(f)}catch(g){a.state=7,g instanceof Error&&sy(g)}}
n.invoke=function(a){a=a===void 0?{}:a;return this.Jd()?this.Fe({Ma:a}):null};
n.dispose=function(){this.Ed(null);this.state=8};
n.Jd=function(){return!!this.vm};
n.Fe=function(a){return this.vm.ue(a)};
n.Ed=function(a){uc(this.vm);this.vm=a};function kD(){var a=I("yt.abuse.playerAttLoader");return a&&["bgvma","bgvmb","bgvmc"].every(function(b){return b in a})?a:null}
;function lD(){hD.apply(this,arguments)}
v(lD,hD);lD.prototype.Ed=function(a){var b;(b=kD())==null||b.bgvma();a?(b={bgvma:a.dispose.bind(a),bgvmb:a.snapshot.bind(a),bgvmc:a.ue.bind(a)},G("yt.abuse.playerAttLoader",b),G("yt.abuse.playerAttLoaderRun",function(c){return a.snapshot(c)})):(G("yt.abuse.playerAttLoader",null),G("yt.abuse.playerAttLoaderRun",null))};
lD.prototype.Jd=function(){return!!kD()};
lD.prototype.Fe=function(a){return kD().bgvmc(a)};var mD=new Uw("AUTH_SERVICE_TOKEN");function nD(a){kx.call(this,a===void 0?"document_active":a);var b=this;this.o=10;this.h=new Map;this.transitions=[{from:"document_active",to:"document_disposed_preventable",action:this.G},{from:"document_active",to:"document_disposed",action:this.u},{from:"document_disposed_preventable",to:"document_disposed",action:this.u},{from:"document_disposed_preventable",to:"flush_logs",action:this.H},{from:"document_disposed_preventable",to:"document_active",action:this.i},{from:"document_disposed",to:"flush_logs",
action:this.H},{from:"document_disposed",to:"document_active",action:this.i},{from:"document_disposed",to:"document_disposed",action:function(){}},
{from:"flush_logs",to:"document_active",action:this.i}];window.addEventListener("pagehide",function(c){b.transition("document_disposed",{event:c});T("web_disable_unload_listener")&&c.persisted===!1&&(b.h=new Map)});
window.addEventListener("beforeunload",function(c){b.transition("document_disposed_preventable",{event:c})})}
v(nD,kx);nD.prototype.G=function(a,b){if(!this.h.get("document_disposed_preventable")){a(b==null?void 0:b.event);var c,d;if((b==null?0:(c=b.event)==null?0:c.defaultPrevented)||(b==null?0:(d=b.event)==null?0:d.returnValue)){b.event.returnValue||(b.event.returnValue=!0);b.event.defaultPrevented||b.event.preventDefault();this.h=new Map;this.transition("document_active");return}}this.h.set("document_disposed_preventable",!0);this.h.get("document_disposed")?this.transition("flush_logs"):this.transition("document_disposed")};
nD.prototype.u=function(a,b){this.h.get("document_disposed")?this.transition("document_active"):(a(b==null?void 0:b.event),this.h.set("document_disposed",!0),this.transition("flush_logs"))};
nD.prototype.H=function(a,b){a(b==null?void 0:b.event);this.transition("document_active")};
nD.prototype.i=function(){this.h=new Map};function oD(a){kx.call(this,a===void 0?"document_visibility_unknown":a);var b=this;this.transitions=[{from:"document_visibility_unknown",to:"document_visible",action:this.i},{from:"document_visibility_unknown",to:"document_hidden",action:this.h},{from:"document_visibility_unknown",to:"document_foregrounded",action:this.H},{from:"document_visibility_unknown",to:"document_backgrounded",action:this.u},{from:"document_visible",to:"document_hidden",action:this.h},{from:"document_visible",to:"document_foregrounded",
action:this.H},{from:"document_visible",to:"document_visible",action:this.i},{from:"document_foregrounded",to:"document_visible",action:this.i},{from:"document_foregrounded",to:"document_hidden",action:this.h},{from:"document_foregrounded",to:"document_foregrounded",action:this.H},{from:"document_hidden",to:"document_visible",action:this.i},{from:"document_hidden",to:"document_backgrounded",action:this.u},{from:"document_hidden",to:"document_hidden",action:this.h},{from:"document_backgrounded",to:"document_hidden",
action:this.h},{from:"document_backgrounded",to:"document_backgrounded",action:this.u},{from:"document_backgrounded",to:"document_visible",action:this.i}];document.addEventListener("visibilitychange",function(c){document.visibilityState==="visible"?b.transition("document_visible",{event:c}):b.transition("document_hidden",{event:c})});
T("visibility_lifecycles_dynamic_backgrounding")&&(window.addEventListener("blur",function(c){b.transition("document_backgrounded",{event:c})}),window.addEventListener("focus",function(c){b.transition("document_foregrounded",{event:c})}))}
v(oD,kx);oD.prototype.i=function(a,b){a(b==null?void 0:b.event);T("visibility_lifecycles_dynamic_backgrounding")&&this.transition("document_foregrounded")};
oD.prototype.h=function(a,b){a(b==null?void 0:b.event);T("visibility_lifecycles_dynamic_backgrounding")&&this.transition("document_backgrounded")};
oD.prototype.u=function(a,b){a(b==null?void 0:b.event)};
oD.prototype.H=function(a,b){a(b==null?void 0:b.event)};function pD(){this.o=new nD;this.u=new oD}
pD.prototype.install=function(){var a=D.apply(0,arguments),b=this;a.forEach(function(c){b.o.install(c)});
a.forEach(function(c){b.u.install(c)})};function qD(){this.o=[];this.i=new Map;this.h=new Map;this.j=new Set}
qD.prototype.clickCommand=function(a,b,c){var d=a.clickTrackingParams;c=c===void 0?0:c;if(d)if(c=Ly(c===void 0?0:c)){a=this.client;d=new Ey({trackingParams:d});var e=void 0;if(T("no_client_ve_attach_unless_shown")){var f=Zz(d,c);Vz.set(f,!0);$z(d,c)}e=e||"INTERACTION_LOGGING_GESTURE_TYPE_GENERIC_CLICK";f=Yz({cttAuthInfo:Ny(c)||void 0,automatedLogEventSource:void 0},c);d={csn:c,ve:d.getAsJson(),gestureType:e};b&&(d.clientData=b);c==="UNDEFINED_CSN"?aA("visualElementGestured",f,d):a?iy("visualElementGestured",
d,a,f):Es("visualElementGestured",d,f);b=!0}else b=!1;else b=!1;return b};
qD.prototype.stateChanged=function(a,b,c){this.visualElementStateChanged(new Ey({trackingParams:a}),b,c===void 0?0:c)};
qD.prototype.visualElementStateChanged=function(a,b,c){c=c===void 0?0:c;if(c===0&&this.j.has(c))this.o.push([a,b]);else{var d=c;d=d===void 0?0:d;c=Ly(d);a||(a=(a=Iy(d===void 0?0:d))?new Ey({veType:a,youtubeData:void 0,jspbYoutubeData:void 0}):null);var e=a;c&&e&&(a=this.client,d=Yz({cttAuthInfo:Ny(c)||void 0},c),b={csn:c,ve:e.getAsJson(),clientData:b},c==="UNDEFINED_CSN"?aA("visualElementStateChanged",d,b):a?iy("visualElementStateChanged",b,a,d):Es("visualElementStateChanged",b,d))}};
function rD(a,b){if(b===void 0)for(var c=Ky(),d=0;d<c.length;d++)c[d]!==void 0&&rD(a,c[d]);else a.i.forEach(function(e,f){(f=a.h.get(f))&&Xz(a.client,b,f,e)}),a.i.clear(),a.h.clear()}
;function sD(){pD.call(this);var a={};this.install((a.document_disposed={callback:this.h},a));T("combine_ve_grafts")&&(a={},this.install((a.document_disposed={callback:this.i},a)));a={};this.install((a.flush_logs={callback:this.j},a));T("web_log_cfg_cee_ks")||Nr(tD)}
v(sD,pD);sD.prototype.j=function(){Es("finalPayload",{csn:Ly()})};
sD.prototype.h=function(){yy(zy)};
sD.prototype.i=function(){var a=rD;qD.instance||(qD.instance=new qD);a(qD.instance)};
function tD(){var a=S("CLIENT_EXPERIMENT_EVENTS");if(a){var b=ye();a=z(a);for(var c=a.next();!c.done;c=a.next())c=c.value,b(c)&&Es("genericClientExperimentEvent",{eventType:c});delete gq.CLIENT_EXPERIMENT_EVENTS}}
;function uD(a,b){var c=D.apply(2,arguments);a=a===void 0?0:a;U.call(this,b,c);this.errorType=a;Object.setPrototypeOf(this,this.constructor.prototype)}
v(uD,U);var vD=new Uw("NETWORK_SLI_TOKEN");function wD(a){this.h=a}
wD.prototype.fetch=function(a,b,c){var d=this,e;return C(function(f){e=xD(d,a,b);return f.return(fetch(e).then(function(g){return d.handleResponse(g,c)}).catch(function(g){sy(g);
if((c==null?0:c.pf)&&g instanceof uD&&g.errorType===1)return Promise.reject(g)}))})};
function xD(a,b,c){if(a.h){var d=ic(sc(b,"key"))||"/UNKNOWN_PATH";a.h.start(d)}a=c;T("wug_networking_gzip_request")&&(a=jv(c));return new window.Request(b,a)}
wD.prototype.handleResponse=function(a,b){var c=a.text().then(function(d){if((b==null?0:b.Lf)&&a.ok)return Ug(b.Lf,d);d=d.replace(")]}'","");if((b==null?0:b.pf)&&d)try{var e=JSON.parse(d)}catch(g){throw new uD(1,"JSON parsing failed after fetch");}var f;return(f=e)!=null?f:JSON.parse(d)});
a.redirected||a.ok?this.h&&this.h.success():(this.h&&this.h.gj(),c=c.then(function(d){sy(new U("Error: API fetch failed",a.status,a.url,d));return Object.assign({},d,{errorMetadata:{status:a.status}})}));
return c};
wD[Tw]=[new Vw(vD)];var yD=new Uw("NETWORK_MANAGER_TOKEN");function zD(){}
function AD(){var a=I("ytglobal.storage_");a||(a=new zD,G("ytglobal.storage_",a));return a}
zD.prototype.estimate=function(){var a,b,c;return C(function(d){a=navigator;return((b=a.storage)==null?0:b.estimate)?d.return(a.storage.estimate()):((c=a.webkitTemporaryStorage)==null?0:c.queryUsageAndQuota)?d.return(BD()):d.return()})};
function BD(){var a=navigator;return new Promise(function(b,c){var d;(d=a.webkitTemporaryStorage)!=null&&d.queryUsageAndQuota?a.webkitTemporaryStorage.queryUsageAndQuota(function(e,f){b({usage:e,quota:f})},function(e){c(e)}):c(Error("webkitTemporaryStorage is not supported."))})}
G("ytglobal.storageClass_",zD);function Cs(a,b){var c=this;this.handleError=a;this.h=b;this.i=!1;self.document===void 0||self.addEventListener("beforeunload",function(){c.i=!0});
this.j=Math.random()<=.2}
Cs.prototype.Aa=function(a){this.handleError(a)};
Cs.prototype.logEvent=function(a,b){switch(a){case "IDB_DATA_CORRUPTED":T("idb_data_corrupted_killswitch")||this.h("idbDataCorrupted",b);break;case "IDB_UNEXPECTEDLY_CLOSED":this.h("idbUnexpectedlyClosed",b);break;case "IS_SUPPORTED_COMPLETED":T("idb_is_supported_completed_killswitch")||this.h("idbIsSupportedCompleted",b);break;case "QUOTA_EXCEEDED":CD(this,b);break;case "TRANSACTION_ENDED":this.j&&Math.random()<=.1&&this.h("idbTransactionEnded",b);break;case "TRANSACTION_UNEXPECTEDLY_ABORTED":a=
Object.assign({},b,{hasWindowUnloaded:this.i}),this.h("idbTransactionAborted",a)}};
function CD(a,b){AD().estimate().then(function(c){c=Object.assign({},b,{isSw:self.document===void 0,isIframe:self!==self.top,deviceStorageUsageMbytes:DD(c==null?void 0:c.usage),deviceStorageQuotaMbytes:DD(c==null?void 0:c.quota)});a.h("idbQuotaExceeded",c)})}
function DD(a){return typeof a==="undefined"?"-1":String(Math.ceil(a/1048576))}
;var sC={Sd:{feedbackEndpoint:jC(DC),modifyChannelNotificationPreferenceEndpoint:jC(FC),playlistEditEndpoint:jC(GC),shareEntityEndpoint:jC(CC),subscribeEndpoint:jC(zC),undoFeedbackEndpoint:jC(EC),unsubscribeEndpoint:jC(AC),webPlayerShareEntityServiceEndpoint:jC(HC)}};function ED(){var a=ax();Xw(a,{qc:yD,Id:wD});Xw(a,{qc:mD,Id:qr});var b=gC(),c=a.resolve(mD),d=a.resolve(yD),e={};b&&(e.client_location=b);rC(d,c,e);Xw(a,{qc:YB,Be:WB.instance})}
;var FD=new Map;function GD(a,b,c,d,e){b=new HD(a,b,c,d===void 0?function(){}:d,e===void 0?null:e);
FD.set(a,b)}
function ID(a){if(!a.onReadyPatchApplied){var b=a.addEventListener;a.addEventListener=function(c,d){c==="onReady"?Promise.resolve().then(function(){d(a)}):b.call(a,c,d)};
a.onReadyPatchApplied=!0}}
function HD(a,b,c,d,e){K.call(this);this.container=a;this.webPlayerContextConfig=b;this.h=c;this.Rc=d;this.playerVars=e;JD(this)}
v(HD,K);function JD(a){if(I("yt.player.Application.create"))Promise.resolve().then(function(){KD(a)});
else{LD(Fp(a.webPlayerContextConfig.trustedJsUrl),function(){KD(a)},function(){a.J||a.Rc()});
var b=a.webPlayerContextConfig.trustedCssUrl;b&&MD(Fp(b))}}
function KD(a){if(!a.J){var b=I("yt.player.Application.create");try{a.api=b(a.container,{args:a.playerVars},a.webPlayerContextConfig,void 0).getInternalApi(),ID(a.api),a.api.isReady=function(){return!0},a.h(a.api)}catch(c){throw a.Rc(),c;
}}}
HD.prototype.ba=function(){this.api&&this.api.destroy();Qi(this.container);K.prototype.ba.call(this)};
function MD(a){var b="ytp-"+a.toString();if(!document.getElementById(b)){var c=document.createElement("link");c.id=b;Nb(c,a);(document.getElementsByTagName("head")[0]||document.body).appendChild(c)}}
function LD(a,b,c){var d="ytp-"+a.toString(),e=document.getElementById(d);if(e)e.dataset.failed?c():e.dataset.loaded?b():(e.addEventListener("error",function(){c()}),e.addEventListener("load",function(){b()}));
else{var f=document.createElement("script");f.id=d;f.addEventListener("error",function(){f.dataset.failed="true";c()});
f.addEventListener("load",function(){f.dataset.loaded="true";b()});
Hb(f,a);a=document.getElementsByTagName("head")[0]||document.body;a.insertBefore(f,a.firstChild)}}
;function ND(a){S("ENABLE_WEBVIEW_API")&&window.ytwebviewplayer&&(window.addEventListener("message",function(b){try{var c=JSON.parse(b.data),d=c.methodName,e=c.args||[];a:{for(var f=z(e),g=f.next();!g.done;g=f.next())if(String(g.value).includes("javascript:")){var h=!0;break a}h=!1}if(h)throw Error('Dangerous call to "'+d+'" with ['+e+"].");if(d&&typeof a[d]==="function")a[d].apply(a,A(e));else throw Error('Unknown API method: "'+d+'".');}catch(k){ry(k)}}),a.addEventListener("onReady",function(){window.ytwebviewplayer.postMessage(JSON.stringify({type:"onPlayerReady"}))}),
a.addEventListener("onStateChange",function(b){window.ytwebviewplayer.postMessage(JSON.stringify({type:"onStateChange",
state:b}))}),a.addEventListener("onError",function(b){window.ytwebviewplayer.postMessage(JSON.stringify({type:"onError",
errorCode:b}))}))}
;var OD={},PD=(OD["api.invalidparam"]=2,OD.auth=150,OD["drm.auth"]=150,OD["heartbeat.net"]=150,OD["heartbeat.servererror"]=150,OD["heartbeat.stop"]=150,OD["html5.unsupportedads"]=5,OD["fmt.noneavailable"]=5,OD["fmt.decode"]=5,OD["fmt.unplayable"]=5,OD["html5.missingapi"]=5,OD["html5.unsupportedlive"]=5,OD["drm.unavailable"]=5,OD["mrm.blocked"]=151,OD["embedder.identity.denied"]=152,OD["embedder.identity.missing.referrer"]=153,OD);var QD=new Set("endSeconds startSeconds mediaContentUrl suggestedQuality videoId rct rctn playmuted muted_autoplay_duration_mode".split(" "));function RD(a){return(a.search("cue")===0||a.search("load")===0)&&a!=="loadModule"}
function SD(a,b,c){if(typeof a==="string")return{videoId:a,startSeconds:b,suggestedQuality:c};b={};c=z(QD);for(var d=c.next();!d.done;d=c.next())d=d.value,a[d]&&(b[d]=a[d]);if(a=a.embedConfig||a.embed_config)if(typeof a==="string")b.embed_config=a;else if(La(a))try{var e=JSON.stringify(a);b.embed_config=e}catch(f){console.error("Invalid embedConfig JSON",f)}return b}
function TD(a,b,c,d){if(La(a)&&!Array.isArray(a)){b="playlist list listType index startSeconds suggestedQuality".split(" ");c={};for(d=0;d<b.length;d++){var e=b[d];a[e]&&(c[e]=a[e])}return c}b={index:b,startSeconds:c,suggestedQuality:d};typeof a==="string"&&a.length===16?b.list="PL"+a:b.playlist=a;return b}
;function UD(a,b){K.call(this);var c=this;this.api=a;this.j=this.G=!1;this.I=[];this.M={};this.o=[];this.i=[];this.Z=!1;this.sessionId=this.h=null;this.targetOrigin="*";this.X=T("web_player_split_event_bus_iframe");this.B=S("POST_MESSAGE_ORIGIN")||document.location.protocol+"//"+document.location.hostname;this.u=function(d){c.onMessage(d)};
VD.addEventListener("message",this.u);if(a=S("WIDGET_ID"))this.sessionId=a;b&&this.u(b);WD(this,"onReady",function(){c.G=!0;var d=c.api.getVideoData();if(!d.isPlayable){c.Z=!0;d=d.errorCode;var e=e===void 0?5:e;c.errorCode=d?PD[d]||e:e;c.sendMessage("onError",Number(c.errorCode))}XD(c);c.h||c.j||window.parent===window||!c.sessionId||YD(c,{event:"readyToListen"},window.parent)});
WD(this,"onVideoProgress",this.sg.bind(this));WD(this,"onVolumeChange",this.tg.bind(this));WD(this,"onApiChange",this.lg.bind(this));WD(this,"onPlaybackQualityChange",this.pg.bind(this));WD(this,"onPlaybackRateChange",this.qg.bind(this));WD(this,"onStateChange",this.rg.bind(this));WD(this,"onWebglSettingsChanged",this.ug.bind(this));WD(this,"onCaptionsTrackListChanged",this.mg.bind(this));WD(this,"captionssettingschanged",this.ng.bind(this))}
v(UD,K);function XD(a){if(a.h)if(a.j)a.sendMessage("alreadyInitialized");else if(a.G){a.j=!0;a.G=!1;a.sendMessage("initialDelivery",ZD(a));a.sendMessage("onReady");zB("ep_init_ar");for(var b=z(a.I),c=b.next();!c.done;c=b.next())YD(a,c.value);a.I=[]}}
function $D(a,b){a.sendMessage("infoDelivery",b)}
n=UD.prototype;n.sendMessage=function(a,b){a={event:a,info:b===void 0?null:b};this.j?YD(this,a):this.I.push(a)};
function aE(a,b,c){return function(d){b==="onError"?a.api.logApiCall(b+" invocation",c,d):a.api.logApiCall(b+" invocation",c);a.sendMessage(b,d)}}
function WD(a,b,c){a.o.push({eventType:b,listener:c});a.api.addEventListener(b,c)}
function ZD(a){if(!a.api)return null;var b=a.api.getApiInterface();Ub(b,"getVideoData");for(var c={apiInterface:b},d=0,e=b.length;d<e;d++){var f=b[d];if(f.search("get")===0||f.search("is")===0){var g=0;f.search("get")===0?g=3:f.search("is")===0&&(g=2);g=f.charAt(g).toLowerCase()+f.substring(g+1);try{var h=a.api[f]();c[g]=h}catch(k){}}}c.videoData=a.api.getVideoData();c.currentTimeLastUpdated_=Date.now()/1E3;return c}
n.rg=function(a){a={playerState:a,currentTime:this.api.getCurrentTime(),duration:this.api.getDuration(),videoData:this.api.getVideoData(),videoStartBytes:0,videoBytesTotal:this.api.getVideoBytesTotal(),videoLoadedFraction:this.api.getVideoLoadedFraction(),playbackQuality:this.api.getPlaybackQuality(),availableQualityLevels:this.api.getAvailableQualityLevels(),currentTimeLastUpdated_:Date.now()/1E3,playbackRate:this.api.getPlaybackRate(),mediaReferenceTime:this.api.getMediaReferenceTime()};this.api.getVideoUrl&&
(a.videoUrl=this.api.getVideoUrl());this.api.getVideoContentRect&&(a.videoContentRect=this.api.getVideoContentRect());this.api.getProgressState&&(a.progressState=this.api.getProgressState());this.api.getPlaylist&&(a.playlist=this.api.getPlaylist());this.api.getPlaylistIndex&&(a.playlistIndex=this.api.getPlaylistIndex());$D(this,a)};
n.pg=function(a){a={playbackQuality:a};this.api.getAvailableQualityLevels&&(a.availableQualityLevels=this.api.getAvailableQualityLevels());this.api.getPreferredQuality&&(a.preferredQuality=this.api.getPreferredQuality());$D(this,a)};
n.qg=function(a){$D(this,{playbackRate:a})};
n.lg=function(){for(var a=this.api.getOptions(),b={namespaces:a},c=0,d=a.length;c<d;c++){var e=a[c],f=this.api.getOptions(e);a.join(", ");b[e]={options:f};for(var g=0,h=f.length;g<h;g++){var k=f[g],l=this.api.getOption(e,k);b[e][k]=l}}this.sendMessage("apiInfoDelivery",b)};
n.tg=function(){$D(this,{muted:this.api.isMuted(),volume:this.api.getVolume()})};
n.sg=function(a){a={currentTime:a,videoBytesLoaded:this.api.getVideoBytesLoaded(),videoLoadedFraction:this.api.getVideoLoadedFraction(),currentTimeLastUpdated_:Date.now()/1E3,playbackRate:this.api.getPlaybackRate(),mediaReferenceTime:this.api.getMediaReferenceTime()};this.api.getProgressState&&(a.progressState=this.api.getProgressState());$D(this,a)};
n.ug=function(){$D(this,{sphericalProperties:this.api.getSphericalProperties()})};
n.mg=function(){if(this.api.getCaptionTracks){var a={captionTracks:this.api.getCaptionTracks()};$D(this,a)}};
n.ng=function(){if(this.api.getSubtitlesUserSettings){var a={subtitlesUserSettings:this.api.getSubtitlesUserSettings()};$D(this,a)}};
n.onMessage=function(a){if(!(this.B!=="*"&&a.origin!==this.B||this.h&&a.source!==this.h||typeof a.data!=="string")){try{var b=JSON.parse(a.data)}catch(f){return}if(b)switch(b.event){case "listening":var c=a.source;a=a.origin;b=b.id;a!=="null"&&(this.B=this.targetOrigin=a);this.h=c;this.sessionId=b;XD(this);break;case "command":if(c=b.func,b=b.args,c==="addEventListener"&&b)c=b[0],b=a.origin,c==="onReady"?this.api.logApiCall(c+" invocation",b):c==="onError"&&this.Z&&(this.api.logApiCall(c+" invocation",
b,this.errorCode),this.errorCode=void 0),this.api.logApiCall(c+" registration",b),this.M[c]||c==="onReady"||(a=aE(this,c,b),this.i.push({eventType:c,listener:a,origin:b}),this.X?this.api.handleExternalCall("addEventListener",[c,a],b):this.api.addEventListener(c,a),this.M[c]=!0);else if(a=a.origin,this.api.isExternalMethodAvailable(c,a)){b=b||[];if(b.length>0&&RD(c)){var d=b;if(La(d[0])&&!Array.isArray(d[0]))var e=d[0];else switch(e={},c){case "loadVideoById":case "cueVideoById":e=SD(d[0],d[1]!==void 0?
Number(d[1]):void 0,d[2]);break;case "loadVideoByUrl":case "cueVideoByUrl":e=d[0];typeof e==="string"&&(e={mediaContentUrl:e,startSeconds:d[1]!==void 0?Number(d[1]):void 0,suggestedQuality:d[2]});b:{if((d=e.mediaContentUrl)&&(d=/\/([ve]|embed)\/([^#?]+)/.exec(d))&&d[2]){d=d[2];break b}d=null}e.videoId=d;e=SD(e);break;case "loadPlaylist":case "cuePlaylist":e=TD(d[0],d[1],d[2],d[3])}b.length=1;b[0]=e}this.api.handleExternalCall(c,b,a);RD(c)&&$D(this,ZD(this))}}}};
function YD(a,b,c){if(c=c===void 0?a.h:c){b.channel="widget";a.sessionId&&(b.id=a.sessionId);try{var d=JSON.stringify(b);c.postMessage(d,a.targetOrigin)}catch(e){sy(e)}}}
n.ba=function(){K.prototype.ba.call(this);VD.removeEventListener("message",this.u);for(var a=0;a<this.o.length;a++){var b=this.o[a];this.api.removeEventListener(b.eventType,b.listener)}this.o=[];for(a=0;a<this.i.length;a++)b=this.i[a],this.X?this.api.handleExternalCall("removeEventListener",[b.eventType,b.listener],b.origin):this.api.removeEventListener(b.eventType,b.listener);this.i=[]};
var VD=window;function bE(a,b,c){K.call(this);var d=this;this.api=a;this.id=b;this.origin=c;this.h={};this.j=T("web_player_split_event_bus_iframe");this.i=function(e){d.onMessage(e)};
cE.addEventListener("message",this.i);dE(this,"RECEIVING")}
v(bE,K);n=bE.prototype;n.addListener=function(a,b){if(!(a in this.h)){var c=this.og.bind(this,a);this.h[a]=c;this.addEventListener(a,c,b)}};
n.og=function(a,b){this.J||dE(this,a,eE(a,b))};
n.removeListener=function(a,b){a in this.h&&(this.removeEventListener(a,this.h[a],b),delete this.h[a])};
n.addEventListener=function(a,b,c){this.j?a==="onReady"?this.api.addEventListener(a,b):this.api.handleExternalCall("addEventListener",[a,b],c||null):this.api.addEventListener(a,b)};
n.removeEventListener=function(a,b,c){this.j?a==="onReady"?this.api.removeEventListener(a,b):this.api.handleExternalCall("removeEventListener",[a,b],c||null):this.api.removeEventListener(a,b)};
function fE(a,b){switch(a){case "loadVideoById":return[SD(b)];case "cueVideoById":return[SD(b)];case "loadVideoByPlayerVars":return[b];case "cueVideoByPlayerVars":return[b];case "loadPlaylist":return[TD(b)];case "cuePlaylist":return[TD(b)];case "seekTo":return[b.seconds,b.allowSeekAhead];case "playVideoAt":return[b.index];case "setVolume":return[b.volume];case "setPlaybackQuality":return[b.suggestedQuality];case "setPlaybackRate":return[b.suggestedRate];case "setLoop":return[b.loopPlaylists];case "setShuffle":return[b.shufflePlaylist];
case "getOptions":return[b.module];case "getOption":return[b.module,b.option];case "setOption":return[b.module,b.option,b.value];case "handleGlobalKeyDown":return[b.keyCode,b.shiftKey,b.ctrlKey,b.altKey,b.metaKey,b.key,b.code]}return[]}
function gE(a,b){switch(a){case "isMuted":return{muted:b};case "getVolume":return{volume:b};case "getPlaybackRate":return{playbackRate:b};case "getAvailablePlaybackRates":return{availablePlaybackRates:b};case "getVideoLoadedFraction":return{videoLoadedFraction:b};case "getPlayerState":return{playerState:b};case "getCurrentTime":return{currentTime:b};case "getPlaybackQuality":return{playbackQuality:b};case "getAvailableQualityLevels":return{availableQualityLevels:b};case "getDuration":return{duration:b};
case "getVideoUrl":return{videoUrl:b};case "getVideoEmbedCode":return{videoEmbedCode:b};case "getPlaylist":return{playlist:b};case "getPlaylistIndex":return{playlistIndex:b};case "getOptions":return{options:b};case "getOption":return{option:b}}}
function eE(a,b){switch(a){case "onReady":return;case "onStateChange":return{playerState:b};case "onPlaybackQualityChange":return{playbackQuality:b};case "onPlaybackRateChange":return{playbackRate:b};case "onError":return{errorCode:b}}if(b!=null)return{value:b}}
function dE(a,b,c){a.J||(b={id:a.id,command:b},c&&(b.data=c),hE.postMessage(JSON.stringify(b),a.origin))}
n.onMessage=function(a){if(a.origin===this.origin){var b=a.data;if(typeof b==="string"){try{b=JSON.parse(b)}catch(e){return}if(b.command){var c=b.command;b=b.data;a=a.origin;if(!this.J){var d=b||{};switch(c){case "addEventListener":typeof d.event==="string"&&this.addListener(d.event,a);break;case "removeEventListener":typeof d.event==="string"&&this.removeListener(d.event,a);break;default:this.api.isReady()&&this.api.isExternalMethodAvailable(c,a||null)&&(b=fE(c,b||{}),b=this.api.handleExternalCall(c,
b,a||null),(b=gE(c,b))&&dE(this,c,b))}}}}}};
n.ba=function(){cE.removeEventListener("message",this.i);for(var a in this.h)this.h.hasOwnProperty(a)&&this.removeListener(a);K.prototype.ba.call(this)};
var cE=window,hE=window.parent;var iE=new lD;function jE(){return iE.Jd()}
function kE(a){a=a===void 0?{}:a;return iE.invoke(a)}
;function lE(a,b,c,d,e){K.call(this);var f=this;this.B=b;this.webPlayerContextConfig=d;this.Xb=e;this.Ka=!1;this.api={};this.ja=this.u=null;this.M=new Ln;this.h={};this.Z=this.na=this.elementId=this.La=this.config=null;this.X=!1;this.j=this.G=null;this.Da={};this.jd=["onReady"];this.lastError=null;this.Ra=NaN;this.I={};this.fa=0;this.i=this.o=a;wc(this,this.M);mE(this);c?this.fa=setTimeout(function(){f.loadNewVideoConfig(c)},0):d&&(nE(this),oE(this))}
v(lE,K);n=lE.prototype;n.getId=function(){return this.B};
n.loadNewVideoConfig=function(a){if(!this.J){this.fa&&(clearTimeout(this.fa),this.fa=0);var b=a||{};b instanceof mz||(b=new mz(b));this.config=b;this.setConfig(a);oE(this);this.isReady()&&pE(this)}};
function nE(a){var b;a.webPlayerContextConfig?b=a.webPlayerContextConfig.rootElementId:b=a.config.attrs.id;a.elementId=b||a.elementId;a.elementId==="video-player"&&(a.elementId=a.B,a.webPlayerContextConfig?a.webPlayerContextConfig.rootElementId=a.B:a.config.attrs.id=a.B);var c;((c=a.i)==null?void 0:c.id)===a.elementId&&(a.elementId+="-player",a.webPlayerContextConfig?a.webPlayerContextConfig.rootElementId=a.elementId:a.config.attrs.id=a.elementId)}
n.setConfig=function(a){this.La=a;this.config=qE(a);nE(this);if(!this.na){var b;this.na=rE(this,((b=this.config.args)==null?void 0:b.jsapicallback)||"onYouTubePlayerReady")}this.config.args?this.config.args.jsapicallback=null:this.config.args={jsapicallback:null};var c;if((c=this.config)==null?0:c.attrs)a=this.config.attrs,(b=a.width)&&this.i&&(this.i.style.width=nn(Number(b)||b)),(a=a.height)&&this.i&&(this.i.style.height=nn(Number(a)||a))};
function pE(a){if(a.config&&a.config.loaded!==!0)if(a.config.loaded=!0,!a.config.args||a.config.args.autoplay!=="0"&&a.config.args.autoplay!==0&&a.config.args.autoplay!==!1){var b;a.api.loadVideoByPlayerVars((b=a.config.args)!=null?b:null)}else a.api.cueVideoByPlayerVars(a.config.args)}
function sE(a){var b=!0,c=tE(a);c&&a.config&&(b=c.dataset.version===uE(a));return b&&!!I("yt.player.Application.create")}
function oE(a){if(!a.J&&!a.X){var b=sE(a);if(b&&(tE(a)?"html5":null)==="html5")a.Z="html5",a.isReady()||vE(a);else if(wE(a),a.Z="html5",b&&a.j&&a.o)a.o.appendChild(a.j),vE(a);else{a.config&&(a.config.loaded=!0);var c=!1;a.G=function(){c=!0;var d=xE(a,"player_bootstrap_method")?I("yt.player.Application.createAlternate")||I("yt.player.Application.create"):I("yt.player.Application.create");var e=a.config?qE(a.config):void 0;d&&d(a.o,e,a.webPlayerContextConfig,a.Xb);vE(a)};
a.X=!0;b?a.G():(xz(uE(a),a.G),(b=yE(a))&&Ez(b||""),zE(a)&&!c&&G("yt.player.Application.create",null))}}}
function tE(a){var b=Oi(a.elementId);!b&&a.i&&a.i.querySelector&&(b=a.i.querySelector("#"+a.elementId));return b}
function vE(a){if(!a.J){var b=tE(a),c=!1;b&&b.getApiInterface&&b.getApiInterface()&&(c=!0);if(c){a.X=!1;if(!xE(a,"html5_remove_not_servable_check_killswitch")){var d;if((b==null?0:b.isNotServable)&&a.config&&(b==null?0:b.isNotServable((d=a.config.args)==null?void 0:d.video_id)))return}AE(a)}else a.Ra=setTimeout(function(){vE(a)},50)}}
function AE(a){mE(a);a.Ka=!0;var b=tE(a);if(b){a.u=BE(a,b,"addEventListener");a.ja=BE(a,b,"removeEventListener");var c=b.getApiInterface();c=c.concat(b.getInternalApiInterface());for(var d=a.api,e=0;e<c.length;e++){var f=c[e];d[f]||(d[f]=BE(a,b,f))}}for(var g in a.h)a.h.hasOwnProperty(g)&&a.u&&a.u(g,a.h[g]);pE(a);a.na&&a.na(a.api);a.M.Ab("onReady",a.api)}
function BE(a,b,c){var d=b[c];return function(){var e=D.apply(0,arguments);try{return a.lastError=null,d.apply(b,e)}catch(f){if(c!=="sendAbandonmentPing")throw f.params=c,a.lastError=f,e=new U("PlayerProxy error in method call",{error:f,method:c,playerId:a.B}),e.level="WARNING",e;}}}
function mE(a){a.Ka=!1;if(a.ja)for(var b in a.h)a.h.hasOwnProperty(b)&&a.ja(b,a.h[b]);for(var c in a.I)a.I.hasOwnProperty(c)&&clearTimeout(Number(c));a.I={};a.u=null;a.ja=null;b=a.api;for(var d in b)b.hasOwnProperty(d)&&(b[d]=null);b.addEventListener=function(e,f){a.addEventListener(e,f)};
b.removeEventListener=function(e,f){a.removeEventListener(e,f)};
b.destroy=function(){a.dispose()};
b.getLastError=function(){return a.getLastError()};
b.getPlayerType=function(){return a.getPlayerType()};
b.getCurrentVideoConfig=function(){return a.La};
b.loadNewVideoConfig=function(e){a.loadNewVideoConfig(e)};
b.isReady=function(){return a.isReady()}}
n.isReady=function(){return this.Ka};
n.addEventListener=function(a,b){var c=this,d=rE(this,b);d&&(Ob(this.jd,a)>=0||this.h[a]||(b=CE(this,a),this.u&&this.u(a,b)),this.M.subscribe(a,d),a==="onReady"&&this.isReady()&&setTimeout(function(){d(c.api)},0))};
n.removeEventListener=function(a,b){this.J||(b=rE(this,b))&&this.M.unsubscribe(a,b)};
function rE(a,b){var c=b;if(typeof b==="string"){if(a.Da[b])return a.Da[b];c=function(){var d=D.apply(0,arguments),e=I(b);if(e)try{e.apply(E,d)}catch(f){throw d=new U("PlayerProxy error when executing callback",{error:f}),d.level="ERROR",d;}};
a.Da[b]=c}return c?c:null}
function CE(a,b){function c(d){function e(){if(!a.J)try{a.M.Ab(b,d!=null?d:void 0)}catch(h){var g=new U("PlayerProxy error when creating global callback",{error:h.message,event:b,playerId:a.B,data:d,originalStack:h.stack,componentStack:h.Ye});g.level="WARNING";throw g;}}
if(xE(a,"web_player_publish_events_immediately"))e();else{var f=setTimeout(function(){e();var g=a.I,h=String(f);h in g&&delete g[h]},0);
Fi(a.I,String(f))}}
return a.h[b]=c}
n.getPlayerType=function(){return this.Z||(tE(this)?"html5":null)};
n.getLastError=function(){return this.lastError};
function wE(a){a.cancel();mE(a);a.Z=null;a.config&&(a.config.loaded=!1);var b=tE(a);b&&(sE(a)||!zE(a)?a.j=b:(b&&b.destroy&&b.destroy(),a.j=null));a.o&&Qi(a.o)}
n.cancel=function(){this.G&&Bz(uE(this),this.G);clearTimeout(this.Ra);this.X=!1};
n.ba=function(){wE(this);if(this.j&&this.config&&this.j.destroy)try{this.j.destroy()}catch(b){var a=new U("PlayerProxy error during disposal",{error:b});a.level="ERROR";throw a;}this.Da=null;for(a in this.h)this.h.hasOwnProperty(a)&&delete this.h[a];this.La=this.config=this.api=null;delete this.o;delete this.i;K.prototype.ba.call(this)};
function zE(a){var b,c;a=(b=a.config)==null?void 0:(c=b.args)==null?void 0:c.fflags;return!!a&&a.indexOf("player_destroy_old_version=true")!==-1}
function uE(a){return a.webPlayerContextConfig?a.webPlayerContextConfig.jsUrl:(a=a.config.assets)?a.js:""}
function yE(a){return a.webPlayerContextConfig?a.webPlayerContextConfig.cssUrl:(a=a.config.assets)?a.css:""}
function xE(a,b){if(a.webPlayerContextConfig)var c=a.webPlayerContextConfig.serializedExperimentFlags;else{var d;if((d=a.config)==null?0:d.args)c=a.config.args.fflags}return(c||"").split("&").includes(b+"=true")}
function qE(a){for(var b={},c=z(Object.keys(a)),d=c.next();!d.done;d=c.next()){d=d.value;var e=a[d];b[d]=typeof e==="object"?Ii(e):e}return b}
;var DE={},EE="player_uid_"+(Math.random()*1E9>>>0);function FE(a,b){var c="player",d=!1;d=d===void 0?!0:d;c=typeof c==="string"?Oi(c):c;var e=EE+"_"+Ma(c),f=DE[e];if(f&&d)return GE(a,b)?f.api.loadVideoByPlayerVars(a.args||null):f.loadNewVideoConfig(a),f.api;f=new lE(c,e,a,b,void 0);DE[e]=f;f.addOnDisposeCallback(function(){delete DE[f.getId()]});
return f.api}
function GE(a,b){return b&&b.serializedExperimentFlags?b.serializedExperimentFlags.includes("web_player_remove_playerproxy=true"):a&&a.args&&a.args.fflags?a.args.fflags.includes("web_player_remove_playerproxy=true"):!1}
;var HE=null,IE=null,JE;function KE(a){HE=a;HE.addEventListener("onVideoDataChange",LE);HE.addEventListener("onReady",ME);a=S("POST_MESSAGE_ID","player");var b=S("POST_MESSAGE_ORIGIN");S("ENABLE_JS_API")?IE=new UD(HE,JE):S("ENABLE_POST_API")&&typeof a==="string"&&typeof b==="string"&&(IE=new bE(HE,a,b));JE=void 0}
function NE(){DA();T("ytidb_create_logger_embed_killswitch")||Bs();var a={};sD.h||(sD.h=new sD);sD.h.install((a.flush_logs={callback:function(){Wx()}},a));
Js||qw();ED();vn.wa(function(){UC()});
a=en("att_init_delay",200);T("enable_rta_manager")&&setTimeout(function(){T("attmusi")&&fD();var b=new VB;var c={preload:!T("enable_rta_npi"),Ae:T("attmusi")},d;c=(d=c)!=null?d:{preload:!0};d=c.cj?void 0:new fw;HB.instance=new HB(b,c,d);b=HB.instance;if(T("attmusi")&&T("attmusi_ue")){b={s:b.o.bind(b),ir:b.u.bind(b)};c=window;c.attmp=b;if(c.attmq!==void 0){d=z(c.attmq);for(var e=d.next();!e.done;e=d.next())e=e.value,e(b)}c.attmq=void 0}else c=b.o.bind(b),G("yt.aba.att",c),b=b.u.bind(b),G("yt.aba.att2",
b)},a);
Nr(function(){if(T("enable_zw_ping")){var b=S("INNERTUBE_CLIENT_NAME","UNKNOWN_INTERFACE"),c="/establish_zw";b==="WEB_EMBEDDED_PLAYER"?c="/embed/establish_zw":b==="TVHTML5"&&(c="https://www.youtube.com/tv/establish_zw");S("COOKIELESS",!1)&&b==="WEB_EMBEDDED_PLAYER"?(b=new Headers,b.set("X-Goog-Visitor-Id",S("VISITOR_DATA")),fetch(c,{method:"GET",mode:"no-cors",headers:b})):fetch(c,{method:"GET",mode:"no-cors",credentials:"include"})}})}
function OE(){FB();var a=Ar(),b=Dr(119),c=window.devicePixelRatio>1;if(document.body&&Dn(document.body,"exp-invert-logo"))if(c&&!Dn(document.body,"inverted-hdpi")){var d=document.body;if(d.classList)d.classList.add("inverted-hdpi");else if(!Dn(d,"inverted-hdpi")){var e=Bn(d);Cn(d,e+(e.length>0?" inverted-hdpi":"inverted-hdpi"))}}else!c&&Dn(document.body,"inverted-hdpi")&&En();if(b!=c){b="f"+(Math.floor(119/31)+1);d=Er(b)||0;d=c?d|67108864:d&-67108865;d===0?delete xr[b]:(c=d.toString(16),xr[b]=c.toString());
c=!0;T("web_secure_pref_cookie_killswitch")&&(c=!1);b=a.h;d=[];for(f in xr)xr.hasOwnProperty(f)&&d.push(f+"="+encodeURIComponent(String(xr[f])));var f=d.join("&");tr(b,f,63072E3,a.i,c)}}
function LE(){PE()}
function ME(){zB("ep_init_pr");PE()}
function PE(){var a=HE.getVideoData(1);a=a.title?a.title+" - YouTube":"YouTube";document.title!==a&&(document.title=a)}
function QE(){HE&&HE.sendAbandonmentPing&&HE.sendAbandonmentPing();S("PL_ATT")&&iE.dispose();for(var a=vn,b=0,c=AA.length;b<c;b++)a.xa(AA[b]);AA.length=0;zz(BA.toString());CA=!1;hq("DCLKSTAT",0);vc(IE);HE&&(HE.removeEventListener("onVideoDataChange",LE),HE.destroy(),HE=null)}
;zB("ep_init_eps");G("yt.setConfig",hq);G("yt.config.set",hq);G("yt.setMsg",wz);G("yt.msgs.set",wz);G("yt.logging.errors.log",ry);
G("writeEmbed",function(){zB("ep_init_wes");var a=S("PLAYER_CONFIG");if(!a){var b=S("PLAYER_VARS");b&&(a={args:b})}nA(!0);a.args.ps==="gvn"&&(document.body.style.backgroundColor="transparent");a.attrs||(a.attrs={width:"100%",height:"100%",id:"video-player"});b=document.referrer;window!==window.top&&b&&b!==document.URL&&(a.args.loaderUrl=b);b=IC();if(!b.serializedForcedExperimentIds){var c=vq(window.location.href);c.forced_experiments&&(b.serializedForcedExperimentIds=c.forced_experiments)}var d;((d=
a.args)==null?0:d.autoplay)?uB("watch",["pbs","pbu","pbp"]):a.args&&Zy(a.args)?uB("video_preview",["ol"]):uB("embed_no_video",["ep_init_ar"]);T("embeds_use_player_instances_library")||S("ENABLE_WEBVIEW_API")?(GD(document.getElementById("player"),b,function(e){S("ENABLE_WEBVIEW_API")?(e=e.getTrustedApi(),ID(e),ND(e)):KE(e)},function(){throw Error("Unable to load player JS");
},a.args),S("ENABLE_WEBVIEW_API")||NE()):(a=FE(a,b),KE(a),NE());
zB("ep_init_wee")});
G("yt.abuse.player.botguardInitialized",I("yt.abuse.player.botguardInitialized")||jE);G("yt.abuse.player.invokeBotguard",I("yt.abuse.player.invokeBotguard")||kE);G("yt.abuse.dclkstatus.checkDclkStatus",I("yt.abuse.dclkstatus.checkDclkStatus")||EA);G("yt.player.exports.navigate",I("yt.player.exports.navigate")||mA);G("yt.util.activity.init",I("yt.util.activity.init")||Ew);G("yt.util.activity.getTimeSinceActive",I("yt.util.activity.getTimeSinceActive")||Iw);
G("yt.util.activity.setTimestamp",I("yt.util.activity.setTimestamp")||Fw);window.addEventListener("load",lq(function(){OE()}));
window.addEventListener("pageshow",lq(function(a){a.persisted||OE()}));
window.addEventListener("pagehide",lq(function(a){T("embeds_web_enable_dispose_player_if_page_not_cached_killswitch")?QE():a.persisted||QE()}));
(function(){var a=a===void 0?uy:a;var b=b===void 0?{}:b;G("yt.logging.errors.log",ry);qy();hr(gr(),b);window.onerror=a;Tk=ty;window.addEventListener("unhandledrejection",function(c){if(c.reason instanceof Error){var d=c.reason;vy(d,{source:"unhandledrejection"});d.name==="AbortError"&&(d.level="WARNING")}ty(c.reason);c.preventDefault()})})();
(function(){if(S("ENABLE_JS_API")){var a=function(b){JE=b;window.removeEventListener("message",a)};
window.addEventListener("message",a)}})();
zB("ep_init_epe");}).call(this);
