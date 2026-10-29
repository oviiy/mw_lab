(()=>{var Gd=0,Oh=1,Vd=2;var Ia=1,Il=2,gr=3,as=0,un=1,qt=2,Kn=0,os=1,sn=2,kh=3,Hh=4,Wd=5;var Rs=100,Xd=101,qd=102,Yd=103,Zd=104,$d=200,Jd=201,Kd=202,jd=203,zh=204,Gh=205,Qd=206,ef=207,tf=208,nf=209,sf=210,rf=211,af=212,of=213,lf=214,Xo=0,qo=1,Yo=2,er=3,Zo=4,$o=5,Jo=6,Ko=7,Vh=0,cf=1,hf=2,li=0,Pa=1,Da=2,La=3,Cs=4,Na=5,Ua=6,Fa=7;var Wh=300,ls=301,Is=302,Pl=303,Dl=304,Ba=306,Es=1e3,gi=1001,jo=1002,en=1003,uf=1004;var Oa=1005;var xn=1006,Ll=1007;var cs=1008;var Un=1009,Xh=1010,qh=1011,xr=1012,Nl=1013,ci=1014,jn=1015,yn=1016,Ul=1017,Fl=1018,yr=1020,Yh=35902,Zh=35899,$h=1021,Jh=1022,Fn=1023,xi=1026,hs=1027,Bl=1028,Ol=1029,us=1030,kl=1031;var Hl=1033,ka=33776,Ha=33777,za=33778,Ga=33779,zl=35840,Gl=35841,Vl=35842,Wl=35843,Xl=36196,ql=37492,Yl=37496,Zl=37488,$l=37489,Va=37490,Jl=37491,Kl=37808,jl=37809,Ql=37810,ec=37811,tc=37812,nc=37813,ic=37814,sc=37815,rc=37816,ac=37817,oc=37818,lc=37819,cc=37820,hc=37821,uc=36492,dc=36494,fc=36495,pc=36283,mc=36284,Wa=36285,gc=36286;var jr=2300,Qo=2301,Vo=2302,Th=2303,wh=2400,Ah=2401,Rh=2402;var df=3200;var Xa=0,ff=1,Ni="",hn="srgb",Qr="srgb-linear",ea="linear",Ct="srgb";var Wo=7680;var pf=519,mf=512,gf=513,xf=514,xc=515,yf=516,_f=517,yc=518,vf=519,Mf=35044;var Kh="300 es",ai=2e3,tr=2001;function pm(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function mm(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function ta(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function bf(){let n=ta("canvas");return n.style.display="block",n}var ad={},nr=null;function jh(...n){let e="THREE."+n.shift();nr?nr("log",e,...n):console.log(e,...n)}function Sf(n){let e=n[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=n[1];t&&t.isStackTrace?n[0]+=" "+t.getLocation():n[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return n}function Je(...n){n=Sf(n);let e="THREE."+n.shift();if(nr)nr("warn",e,...n);else{let t=n[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...n)}}function tt(...n){n=Sf(n);let e="THREE."+n.shift();if(nr)nr("error",e,...n);else{let t=n[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...n)}}function Ss(...n){let e=n.join(" ");e in ad||(ad[e]=!0,Je(...n))}function Ef(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}var Tf={[Xo]:qo,[Yo]:Jo,[Zo]:Ko,[er]:$o,[qo]:Xo,[Jo]:Yo,[Ko]:Zo,[$o]:er},yi=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){let i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){let i=this._listeners;if(i===void 0)return;let s=i[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let i=t[e.type];if(i!==void 0){e.target=this;let s=i.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},Sn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],od=1234567,js=Math.PI/180,ir=180/Math.PI;function Ps(){let n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Sn[n&255]+Sn[n>>8&255]+Sn[n>>16&255]+Sn[n>>24&255]+"-"+Sn[e&255]+Sn[e>>8&255]+"-"+Sn[e>>16&15|64]+Sn[e>>24&255]+"-"+Sn[t&63|128]+Sn[t>>8&255]+"-"+Sn[t>>16&255]+Sn[t>>24&255]+Sn[i&255]+Sn[i>>8&255]+Sn[i>>16&255]+Sn[i>>24&255]).toLowerCase()}function dt(n,e,t){return Math.max(e,Math.min(t,n))}function Qh(n,e){return(n%e+e)%e}function gm(n,e,t,i,s){return i+(n-e)*(s-i)/(t-e)}function xm(n,e,t){return n!==e?(t-n)/(e-n):0}function $r(n,e,t){return(1-t)*n+t*e}function ym(n,e,t,i){return $r(n,e,1-Math.exp(-t*i))}function _m(n,e=1){return e-Math.abs(Qh(n,e*2)-e)}function vm(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function Mm(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function bm(n,e){return n+Math.floor(Math.random()*(e-n+1))}function Sm(n,e){return n+Math.random()*(e-n)}function Em(n){return n*(.5-Math.random())}function Tm(n){n!==void 0&&(od=n);let e=od+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function wm(n){return n*js}function Am(n){return n*ir}function Rm(n){return n>0&&Number.isInteger(n)&&2**Math.round(Math.log2(n))===n}function Cm(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function Im(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function Pm(n,e,t,i,s){let r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+i)/2),h=a((e+i)/2),u=r((e-i)/2),d=a((e-i)/2),f=r((i-e)/2),m=a((i-e)/2);switch(s){case"XYX":n.set(o*h,l*u,l*d,o*c);break;case"YZY":n.set(l*d,o*h,l*u,o*c);break;case"ZXZ":n.set(l*u,l*d,o*h,o*c);break;case"XZX":n.set(o*h,l*m,l*f,o*c);break;case"YXY":n.set(l*f,o*h,l*m,o*c);break;case"ZYZ":n.set(l*m,l*f,o*h,o*c);break;default:Je("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Ks(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:case Uint8ClampedArray:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Cn(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Pn={DEG2RAD:js,RAD2DEG:ir,generateUUID:Ps,clamp:dt,euclideanModulo:Qh,mapLinear:gm,inverseLerp:xm,lerp:$r,damp:ym,pingpong:_m,smoothstep:vm,smootherstep:Mm,randInt:bm,randFloat:Sm,randFloatSpread:Em,seededRandom:Tm,degToRad:wm,radToDeg:Am,isPowerOfTwo:Rm,ceilPowerOfTwo:Cm,floorPowerOfTwo:Im,setQuaternionFromProperEuler:Pm,normalize:Cn,denormalize:Ks},ru=class ru{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=dt(this.x,e.x,t.x),this.y=dt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=dt(this.x,e,t),this.y=dt(this.y,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(dt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(dt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*i-a*s+e.x,this.y=r*s+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};ru.prototype.isVector2=!0;var he=ru,$n=class{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,a,o){let l=i[s+0],c=i[s+1],h=i[s+2],u=i[s+3],d=r[a+0],f=r[a+1],m=r[a+2],M=r[a+3];if(u!==M||l!==d||c!==f||h!==m){let g=l*d+c*f+h*m+u*M;g<0&&(d=-d,f=-f,m=-m,M=-M,g=-g);let p=1-o;if(g<.9995){let b=Math.acos(g),_=Math.sin(b);p=Math.sin(p*b)/_,o=Math.sin(o*b)/_,l=l*p+d*o,c=c*p+f*o,h=h*p+m*o,u=u*p+M*o}else{l=l*p+d*o,c=c*p+f*o,h=h*p+m*o,u=u*p+M*o;let b=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=b,c*=b,h*=b,u*=b}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,i,s,r,a){let o=i[s],l=i[s+1],c=i[s+2],h=i[s+3],u=r[a],d=r[a+1],f=r[a+2],m=r[a+3];return e[t]=o*m+h*u+l*f-c*d,e[t+1]=l*m+h*d+c*u-o*f,e[t+2]=c*m+h*f+o*d-l*u,e[t+3]=h*m-o*u-l*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(i/2),h=o(s/2),u=o(r/2),d=l(i/2),f=l(s/2),m=l(r/2);switch(a){case"XYZ":this._x=d*h*u+c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u-d*f*m;break;case"YXZ":this._x=d*h*u+c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u+d*f*m;break;case"ZXY":this._x=d*h*u-c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u-d*f*m;break;case"ZYX":this._x=d*h*u-c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u+d*f*m;break;case"YZX":this._x=d*h*u+c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u-d*f*m;break;case"XZY":this._x=d*h*u-c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u+d*f*m;break;default:Je("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],u=t[10],d=i+o+u;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(a-s)*f}else if(i>o&&i>u){let f=2*Math.sqrt(1+i-o-u);this._w=(h-l)/f,this._x=.25*f,this._y=(s+a)/f,this._z=(r+c)/f}else if(o>u){let f=2*Math.sqrt(1+o-i-u);this._w=(r-c)/f,this._x=(s+a)/f,this._y=.25*f,this._z=(l+h)/f}else{let f=2*Math.sqrt(1+u-i-o);this._w=(a-s)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(dt(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=i*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-i*c,this._z=r*h+a*c+i*l-s*o,this._w=a*h-i*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let i=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(i=-i,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){let c=Math.acos(o),h=Math.sin(c);l=Math.sin(l*c)/h,t=Math.sin(t*c)/h,this._x=this._x*l+i*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+i*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},au=class au{constructor(e=0,t=0,i=0){this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(ld.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(ld.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,i=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*i),h=2*(o*t-r*s),u=2*(r*i-a*t);return this.x=t+l*c+a*u-o*h,this.y=i+l*h+o*c-r*u,this.z=s+l*u+r*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=dt(this.x,e.x,t.x),this.y=dt(this.y,e.y,t.y),this.z=dt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=dt(this.x,e,t),this.y=dt(this.y,e,t),this.z=dt(this.z,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(dt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-i*l,this.z=i*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Qc.copy(this).projectOnVector(e),this.sub(Qc)}reflect(e){return this.sub(Qc.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(dt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};au.prototype.isVector3=!0;var P=au,Qc=new P,ld=new $n,ou=class ou{constructor(e,t,i,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,a,o,l,c)}set(e,t,i,s,r,a,o,l,c){let h=this.elements;return h[0]=e,h[1]=s,h[2]=o,h[3]=t,h[4]=r,h[5]=l,h[6]=i,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,a=i[0],o=i[3],l=i[6],c=i[1],h=i[4],u=i[7],d=i[2],f=i[5],m=i[8],M=s[0],g=s[3],p=s[6],b=s[1],_=s[4],x=s[7],S=s[2],T=s[5],A=s[8];return r[0]=a*M+o*b+l*S,r[3]=a*g+o*_+l*T,r[6]=a*p+o*x+l*A,r[1]=c*M+h*b+u*S,r[4]=c*g+h*_+u*T,r[7]=c*p+h*x+u*A,r[2]=d*M+f*b+m*S,r[5]=d*g+f*_+m*T,r[8]=d*p+f*x+m*A,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-i*r*h+i*o*l+s*r*c-s*a*l}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=h*a-o*c,d=o*l-h*r,f=c*r-a*l,m=t*u+i*d+s*f;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let M=1/m;return e[0]=u*M,e[1]=(s*c-h*i)*M,e[2]=(o*i-s*a)*M,e[3]=d*M,e[4]=(h*t-s*l)*M,e[5]=(s*r-o*t)*M,e[6]=f*M,e[7]=(i*l-c*t)*M,e[8]=(a*t-i*r)*M,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return Ss("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(eh.makeScale(e,t)),this}rotate(e){return Ss("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(eh.makeRotation(-e)),this}translate(e,t){return Ss("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(eh.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}};ou.prototype.isMatrix3=!0;var at=ou,eh=new at,cd=new at().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),hd=new at().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Dm(){let n={enabled:!0,workingColorSpace:Qr,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===Ct&&(s.r=Pi(s.r),s.g=Pi(s.g),s.b=Pi(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===Ct&&(s.r=Qs(s.r),s.g=Qs(s.g),s.b=Qs(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Ni?ea:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Ss("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Ss("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[Qr]:{primaries:e,whitePoint:i,transfer:ea,toXYZ:cd,fromXYZ:hd,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:hn},outputColorSpaceConfig:{drawingBufferColorSpace:hn}},[hn]:{primaries:e,whitePoint:i,transfer:Ct,toXYZ:cd,fromXYZ:hd,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:hn}}}),n}var yt=Dm();function Pi(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Qs(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var Bs,el=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{Bs===void 0&&(Bs=ta("canvas")),Bs.width=e.width,Bs.height=e.height;let s=Bs.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),i=Bs}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=ta("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Pi(r[a]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(Pi(t[i]/255)*255):t[i]=Pi(t[i]);return{data:t,width:e.width,height:e.height}}else return Je("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Lm=0,sr=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Lm++}),this.uuid=Ps(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(th(s[a].image)):r.push(th(s[a]))}else r=th(s);i.url=r}return t||(e.images[this.uuid]=i),i}};function th(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?el.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(Je("Texture: Unable to serialize Texture."),{})}var Nm=0,nh=new P,In=class n extends yi{constructor(e=n.DEFAULT_IMAGE,t=n.DEFAULT_MAPPING,i=gi,s=gi,r=xn,a=cs,o=Fn,l=Un,c=n.DEFAULT_ANISOTROPY,h=Ni){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Nm++}),this.uuid=Ps(),this.name="",this.source=new sr(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new he(0,0),this.repeat=new he(1,1),this.center=new he(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new at,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(nh).x}get height(){return this.source.getSize(nh).y}get depth(){return this.source.getSize(nh).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let i=e[t];if(i===void 0){Je(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Je(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Wh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Es:e.x=e.x-Math.floor(e.x);break;case gi:e.x=e.x<0?0:1;break;case jo:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Es:e.y=e.y-Math.floor(e.y);break;case gi:e.y=e.y<0?0:1;break;case jo:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};In.DEFAULT_IMAGE=null;In.DEFAULT_MAPPING=Wh;In.DEFAULT_ANISOTROPY=1;var lu=class lu{constructor(e=0,t=0,i=0,s=1){this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*i+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*i+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*i+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*i+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r,l=e.elements,c=l[0],h=l[4],u=l[8],d=l[1],f=l[5],m=l[9],M=l[2],g=l[6],p=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-M)<.01&&Math.abs(m-g)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+M)<.1&&Math.abs(m+g)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let _=(c+1)/2,x=(f+1)/2,S=(p+1)/2,T=(h+d)/4,A=(u+M)/4,y=(m+g)/4;return _>x&&_>S?_<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(_),s=T/i,r=A/i):x>S?x<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(x),i=T/s,r=y/s):S<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(S),i=A/r,s=y/r),this.set(i,s,r,t),this}let b=Math.sqrt((g-m)*(g-m)+(u-M)*(u-M)+(d-h)*(d-h));return Math.abs(b)<.001&&(b=1),this.x=(g-m)/b,this.y=(u-M)/b,this.z=(d-h)/b,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=dt(this.x,e.x,t.x),this.y=dt(this.y,e.y,t.y),this.z=dt(this.z,e.z,t.z),this.w=dt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=dt(this.x,e,t),this.y=dt(this.y,e,t),this.z=dt(this.z,e,t),this.w=dt(this.w,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(dt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};lu.prototype.isVector4=!0;var Xt=lu,tl=class extends yi{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:xn,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new Xt(0,0,e,t),this.scissorTest=!1,this.viewport=new Xt(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:i.depth},r=new In(s),a=i.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:xn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new sr(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},tn=class extends tl{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},na=class extends In{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=en,this.minFilter=en,this.wrapR=gi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var nl=class extends In{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=en,this.minFilter=en,this.wrapR=gi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var Cl=class Cl{constructor(e,t,i,s,r,a,o,l,c,h,u,d,f,m,M,g){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,a,o,l,c,h,u,d,f,m,M,g)}set(e,t,i,s,r,a,o,l,c,h,u,d,f,m,M,g){let p=this.elements;return p[0]=e,p[4]=t,p[8]=i,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=h,p[10]=u,p[14]=d,p[3]=f,p[7]=m,p[11]=M,p[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Cl().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,i=e.elements,s=1/Os.setFromMatrixColumn(e,0).length(),r=1/Os.setFromMatrixColumn(e,1).length(),a=1/Os.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*a,t[9]=i[9]*a,t[10]=i[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,s=e.y,r=e.z,a=Math.cos(i),o=Math.sin(i),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){let d=a*h,f=a*u,m=o*h,M=o*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=f+m*c,t[5]=d-M*c,t[9]=-o*l,t[2]=M-d*c,t[6]=m+f*c,t[10]=a*l}else if(e.order==="YXZ"){let d=l*h,f=l*u,m=c*h,M=c*u;t[0]=d+M*o,t[4]=m*o-f,t[8]=a*c,t[1]=a*u,t[5]=a*h,t[9]=-o,t[2]=f*o-m,t[6]=M+d*o,t[10]=a*l}else if(e.order==="ZXY"){let d=l*h,f=l*u,m=c*h,M=c*u;t[0]=d-M*o,t[4]=-a*u,t[8]=m+f*o,t[1]=f+m*o,t[5]=a*h,t[9]=M-d*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let d=a*h,f=a*u,m=o*h,M=o*u;t[0]=l*h,t[4]=m*c-f,t[8]=d*c+M,t[1]=l*u,t[5]=M*c+d,t[9]=f*c-m,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let d=a*l,f=a*c,m=o*l,M=o*c;t[0]=l*h,t[4]=M-d*u,t[8]=m*u+f,t[1]=u,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=f*u+m,t[10]=d-M*u}else if(e.order==="XZY"){let d=a*l,f=a*c,m=o*l,M=o*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=d*u+M,t[5]=a*h,t[9]=f*u-m,t[2]=m*u-f,t[6]=o*h,t[10]=M*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Um,e,Fm)}lookAt(e,t,i){let s=this.elements;return On.subVectors(e,t),On.lengthSq()===0&&(On.z=1),On.normalize(),$i.crossVectors(i,On),$i.lengthSq()===0&&(Math.abs(i.z)===1?On.x+=1e-4:On.z+=1e-4,On.normalize(),$i.crossVectors(i,On)),$i.normalize(),po.crossVectors(On,$i),s[0]=$i.x,s[4]=po.x,s[8]=On.x,s[1]=$i.y,s[5]=po.y,s[9]=On.y,s[2]=$i.z,s[6]=po.z,s[10]=On.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,a=i[0],o=i[4],l=i[8],c=i[12],h=i[1],u=i[5],d=i[9],f=i[13],m=i[2],M=i[6],g=i[10],p=i[14],b=i[3],_=i[7],x=i[11],S=i[15],T=s[0],A=s[4],y=s[8],w=s[12],R=s[1],L=s[5],F=s[9],z=s[13],I=s[2],U=s[6],G=s[10],W=s[14],K=s[3],X=s[7],$=s[11],ne=s[15];return r[0]=a*T+o*R+l*I+c*K,r[4]=a*A+o*L+l*U+c*X,r[8]=a*y+o*F+l*G+c*$,r[12]=a*w+o*z+l*W+c*ne,r[1]=h*T+u*R+d*I+f*K,r[5]=h*A+u*L+d*U+f*X,r[9]=h*y+u*F+d*G+f*$,r[13]=h*w+u*z+d*W+f*ne,r[2]=m*T+M*R+g*I+p*K,r[6]=m*A+M*L+g*U+p*X,r[10]=m*y+M*F+g*G+p*$,r[14]=m*w+M*z+g*W+p*ne,r[3]=b*T+_*R+x*I+S*K,r[7]=b*A+_*L+x*U+S*X,r[11]=b*y+_*F+x*G+S*$,r[15]=b*w+_*z+x*W+S*ne,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],u=e[6],d=e[10],f=e[14],m=e[3],M=e[7],g=e[11],p=e[15],b=l*f-c*d,_=o*f-c*u,x=o*d-l*u,S=a*f-c*h,T=a*d-l*h,A=a*u-o*h;return t*(M*b-g*_+p*x)-i*(m*b-g*S+p*T)+s*(m*_-M*S+p*A)-r*(m*x-M*T+g*A)}determinantAffine(){let e=this.elements,t=e[0],i=e[4],s=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],h=e[10];return t*(a*h-o*c)-i*(r*h-o*l)+s*(r*c-a*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=e[9],d=e[10],f=e[11],m=e[12],M=e[13],g=e[14],p=e[15],b=t*o-i*a,_=t*l-s*a,x=t*c-r*a,S=i*l-s*o,T=i*c-r*o,A=s*c-r*l,y=h*M-u*m,w=h*g-d*m,R=h*p-f*m,L=u*g-d*M,F=u*p-f*M,z=d*p-f*g,I=b*z-_*F+x*L+S*R-T*w+A*y;if(I===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let U=1/I;return e[0]=(o*z-l*F+c*L)*U,e[1]=(s*F-i*z-r*L)*U,e[2]=(M*A-g*T+p*S)*U,e[3]=(d*T-u*A-f*S)*U,e[4]=(l*R-a*z-c*w)*U,e[5]=(t*z-s*R+r*w)*U,e[6]=(g*x-m*A-p*_)*U,e[7]=(h*A-d*x+f*_)*U,e[8]=(a*F-o*R+c*y)*U,e[9]=(i*R-t*F-r*y)*U,e[10]=(m*T-M*x+p*b)*U,e[11]=(u*x-h*T-f*b)*U,e[12]=(o*w-a*L-l*y)*U,e[13]=(t*L-i*w+s*y)*U,e[14]=(M*_-m*S-g*b)*U,e[15]=(h*S-u*_+d*b)*U,this}scale(e){let t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),s=Math.sin(t),r=1-i,a=e.x,o=e.y,l=e.z,c=r*a,h=r*o;return this.set(c*a+i,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+i,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,a){return this.set(1,i,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){let s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,h=a+a,u=o+o,d=r*c,f=r*h,m=r*u,M=a*h,g=a*u,p=o*u,b=l*c,_=l*h,x=l*u,S=i.x,T=i.y,A=i.z;return s[0]=(1-(M+p))*S,s[1]=(f+x)*S,s[2]=(m-_)*S,s[3]=0,s[4]=(f-x)*T,s[5]=(1-(d+p))*T,s[6]=(g+b)*T,s[7]=0,s[8]=(m+_)*A,s[9]=(g-b)*A,s[10]=(1-(d+M))*A,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return i.set(1,1,1),t.identity(),this;let a=Os.set(s[0],s[1],s[2]).length(),o=Os.set(s[4],s[5],s[6]).length(),l=Os.set(s[8],s[9],s[10]).length();r<0&&(a=-a),ni.copy(this);let c=1/a,h=1/o,u=1/l;return ni.elements[0]*=c,ni.elements[1]*=c,ni.elements[2]*=c,ni.elements[4]*=h,ni.elements[5]*=h,ni.elements[6]*=h,ni.elements[8]*=u,ni.elements[9]*=u,ni.elements[10]*=u,t.setFromRotationMatrix(ni),i.x=a,i.y=o,i.z=l,this}makePerspective(e,t,i,s,r,a,o=ai,l=!1){let c=this.elements,h=2*r/(t-e),u=2*r/(i-s),d=(t+e)/(t-e),f=(i+s)/(i-s),m,M;if(l)m=r/(a-r),M=a*r/(a-r);else if(o===ai)m=-(a+r)/(a-r),M=-2*a*r/(a-r);else if(o===tr)m=-a/(a-r),M=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=m,c[14]=M,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,i,s,r,a,o=ai,l=!1){let c=this.elements,h=2/(t-e),u=2/(i-s),d=-(t+e)/(t-e),f=-(i+s)/(i-s),m,M;if(l)m=1/(a-r),M=a/(a-r);else if(o===ai)m=-2/(a-r),M=-(a+r)/(a-r);else if(o===tr)m=-1/(a-r),M=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=m,c[14]=M,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}};Cl.prototype.isMatrix4=!0;var Mt=Cl,Os=new P,ni=new Mt,Um=new P(0,0,0),Fm=new P(1,1,1),$i=new P,po=new P,On=new P,ud=new Mt,dd=new $n,Di=class n{constructor(e=0,t=0,i=0,s=n.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],u=s[2],d=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(dt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-dt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(dt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-dt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(dt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-dt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Je("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return ud.makeRotationFromQuaternion(e),this.setFromRotationMatrix(ud,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return dd.setFromEuler(this),this.setFromQuaternion(dd,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Di.DEFAULT_ORDER="XYZ";var ia=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Bm=0,fd=new P,ks=new $n,Ti=new Mt,mo=new P,zr=new P,Om=new P,km=new $n,pd=new P(1,0,0),md=new P(0,1,0),gd=new P(0,0,1),xd={type:"added"},Hm={type:"removed"},Hs={type:"childadded",child:null},ih={type:"childremoved",child:null},nn=class n extends yi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Bm++}),this.uuid=Ps(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let e=new P,t=new Di,i=new $n,s=new P(1,1,1);function r(){i.setFromEuler(t,!1)}function a(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Mt},normalMatrix:{value:new at}}),this.matrix=new Mt,this.matrixWorld=new Mt,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ia,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ks.setFromAxisAngle(e,t),this.quaternion.multiply(ks),this}rotateOnWorldAxis(e,t){return ks.setFromAxisAngle(e,t),this.quaternion.premultiply(ks),this}rotateX(e){return this.rotateOnAxis(pd,e)}rotateY(e){return this.rotateOnAxis(md,e)}rotateZ(e){return this.rotateOnAxis(gd,e)}translateOnAxis(e,t){return fd.copy(e).applyQuaternion(this.quaternion),this.position.add(fd.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(pd,e)}translateY(e){return this.translateOnAxis(md,e)}translateZ(e){return this.translateOnAxis(gd,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Ti.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?mo.copy(e):mo.set(e,t,i);let s=this.parent;this.updateWorldMatrix(!0,!1),zr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ti.lookAt(zr,mo,this.up):Ti.lookAt(mo,zr,this.up),this.quaternion.setFromRotationMatrix(Ti),s&&(Ti.extractRotation(s.matrixWorld),ks.setFromRotationMatrix(Ti),this.quaternion.premultiply(ks.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(tt("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(xd),Hs.child=e,this.dispatchEvent(Hs),Hs.child=null):tt("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Hm),ih.child=e,this.dispatchEvent(ih),ih.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Ti.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Ti.multiply(e.parent.matrixWorld)),e.applyMatrix4(Ti),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(xd),Hs.child=e,this.dispatchEvent(Hs),Hs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){let a=this.children[i].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(zr,e,Om),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(zr,km,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,i=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*i-r[8]*s,r[13]+=i-r[1]*t-r[5]*i-r[9]*s,r[14]+=s-r[2]*t-r[6]*i-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t,i=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),t===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,i)}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),u=a(e.shapes),d=a(e.skeletons),f=a(e.animations),m=a(e.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),u.length>0&&(i.shapes=u),d.length>0&&(i.skeletons=d),f.length>0&&(i.animations=f),m.length>0&&(i.nodes=m)}return i.object=s,i;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let s=e.children[i];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};nn.DEFAULT_UP=new P(0,1,0);nn.DEFAULT_MATRIX_AUTO_UPDATE=!0;nn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var ye=class extends nn{constructor(){super(),this.isGroup=!0,this.type="Group"}},zm={type:"move"},rr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ye,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ye,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ye,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(let M of e.hand.values()){let g=t.getJointPose(M,i),p=this._getHandJoint(c,M);g!==null&&(p.matrix.fromArray(g.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=g.radius),p.visible=g!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,m=.005;c.inputState.pinching&&d>f+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=f-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(zm)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new ye;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},wf={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ji={h:0,s:0,l:0},go={h:0,s:0,l:0};function sh(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}var Ue=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=hn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,yt.colorSpaceToWorking(this,t),this}setRGB(e,t,i,s=yt.workingColorSpace){return this.r=e,this.g=t,this.b=i,yt.colorSpaceToWorking(this,s),this}setHSL(e,t,i,s=yt.workingColorSpace){if(e=Qh(e,1),t=dt(t,0,1),i=dt(i,0,1),t===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+t):i+t-i*t,a=2*i-r;this.r=sh(a,r,e+1/3),this.g=sh(a,r,e),this.b=sh(a,r,e-1/3)}return yt.colorSpaceToWorking(this,s),this}setStyle(e,t=hn){function i(r){r!==void 0&&parseFloat(r)<1&&Je("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Je("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Je("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=hn){let i=wf[e.toLowerCase()];return i!==void 0?this.setHex(i,t):Je("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Pi(e.r),this.g=Pi(e.g),this.b=Pi(e.b),this}copyLinearToSRGB(e){return this.r=Qs(e.r),this.g=Qs(e.g),this.b=Qs(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=hn){return yt.workingToColorSpace(En.copy(this),e),Math.round(dt(En.r*255,0,255))*65536+Math.round(dt(En.g*255,0,255))*256+Math.round(dt(En.b*255,0,255))}getHexString(e=hn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=yt.workingColorSpace){yt.workingToColorSpace(En.copy(this),t);let i=En.r,s=En.g,r=En.b,a=Math.max(i,s,r),o=Math.min(i,s,r),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case i:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-i)/u+2;break;case r:l=(i-s)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=yt.workingColorSpace){return yt.workingToColorSpace(En.copy(this),t),e.r=En.r,e.g=En.g,e.b=En.b,e}getStyle(e=hn){yt.workingToColorSpace(En.copy(this),e);let t=En.r,i=En.g,s=En.b;return e!==hn?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(Ji),this.setHSL(Ji.h+e,Ji.s+t,Ji.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Ji),e.getHSL(go);let i=$r(Ji.h,go.h,t),s=$r(Ji.s,go.s,t),r=$r(Ji.l,go.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},En=new Ue;Ue.NAMES=wf;var sa=class n{constructor(e,t=1,i=1e3){this.isFog=!0,this.name="",this.color=new Ue(e),this.near=t,this.far=i}clone(){return new n(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},ra=class extends nn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Di,this.environmentIntensity=1,this.environmentRotation=new Di,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},ii=new P,wi=new P,rh=new P,Ai=new P,zs=new P,Gs=new P,yd=new P,ah=new P,oh=new P,lh=new P,ch=new Xt,hh=new Xt,uh=new Xt,Ii=class n{constructor(e=new P,t=new P,i=new P){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),ii.subVectors(e,t),s.cross(ii);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){ii.subVectors(s,t),wi.subVectors(i,t),rh.subVectors(e,t);let a=ii.dot(ii),o=ii.dot(wi),l=ii.dot(rh),c=wi.dot(wi),h=wi.dot(rh),u=a*c-o*o;if(u===0)return r.set(0,0,0),null;let d=1/u,f=(c*l-o*h)*d,m=(a*h-o*l)*d;return r.set(1-f-m,m,f)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,Ai)===null?!1:Ai.x>=0&&Ai.y>=0&&Ai.x+Ai.y<=1}static getInterpolation(e,t,i,s,r,a,o,l){return this.getBarycoord(e,t,i,s,Ai)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Ai.x),l.addScaledVector(a,Ai.y),l.addScaledVector(o,Ai.z),l)}static getInterpolatedAttribute(e,t,i,s,r,a){return ch.setScalar(0),hh.setScalar(0),uh.setScalar(0),ch.fromBufferAttribute(e,t),hh.fromBufferAttribute(e,i),uh.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(ch,r.x),a.addScaledVector(hh,r.y),a.addScaledVector(uh,r.z),a}static isFrontFacing(e,t,i,s){return ii.subVectors(i,t),wi.subVectors(e,t),ii.cross(wi).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return ii.subVectors(this.c,this.b),wi.subVectors(this.a,this.b),ii.cross(wi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return n.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,s=this.b,r=this.c,a,o;zs.subVectors(s,i),Gs.subVectors(r,i),ah.subVectors(e,i);let l=zs.dot(ah),c=Gs.dot(ah);if(l<=0&&c<=0)return t.copy(i);oh.subVectors(e,s);let h=zs.dot(oh),u=Gs.dot(oh);if(h>=0&&u<=h)return t.copy(s);let d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(i).addScaledVector(zs,a);lh.subVectors(e,r);let f=zs.dot(lh),m=Gs.dot(lh);if(m>=0&&f<=m)return t.copy(r);let M=f*c-l*m;if(M<=0&&c>=0&&m<=0)return o=c/(c-m),t.copy(i).addScaledVector(Gs,o);let g=h*m-f*u;if(g<=0&&u-h>=0&&f-m>=0)return yd.subVectors(r,s),o=(u-h)/(u-h+(f-m)),t.copy(s).addScaledVector(yd,o);let p=1/(g+M+d);return a=M*p,o=d*p,t.copy(i).addScaledVector(zs,a).addScaledVector(Gs,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},_i=class{constructor(e=new P(1/0,1/0,1/0),t=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(si.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(si.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=si.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,si):si.fromBufferAttribute(r,a),si.applyMatrix4(e.matrixWorld),this.expandByPoint(si);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),xo.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),xo.copy(i.boundingBox)),xo.applyMatrix4(e.matrixWorld),this.union(xo)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,si),si.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Gr),yo.subVectors(this.max,Gr),Vs.subVectors(e.a,Gr),Ws.subVectors(e.b,Gr),Xs.subVectors(e.c,Gr),Ki.subVectors(Ws,Vs),ji.subVectors(Xs,Ws),ys.subVectors(Vs,Xs);let t=[0,-Ki.z,Ki.y,0,-ji.z,ji.y,0,-ys.z,ys.y,Ki.z,0,-Ki.x,ji.z,0,-ji.x,ys.z,0,-ys.x,-Ki.y,Ki.x,0,-ji.y,ji.x,0,-ys.y,ys.x,0];return!dh(t,Vs,Ws,Xs,yo)||(t=[1,0,0,0,1,0,0,0,1],!dh(t,Vs,Ws,Xs,yo))?!1:(_o.crossVectors(Ki,ji),t=[_o.x,_o.y,_o.z],dh(t,Vs,Ws,Xs,yo))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,si).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(si).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Ri[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Ri[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Ri[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Ri[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Ri[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Ri[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Ri[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Ri[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Ri),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Ri=[new P,new P,new P,new P,new P,new P,new P,new P],si=new P,xo=new _i,Vs=new P,Ws=new P,Xs=new P,Ki=new P,ji=new P,ys=new P,Gr=new P,yo=new P,_o=new P,_s=new P;function dh(n,e,t,i,s){for(let r=0,a=n.length-3;r<=a;r+=3){_s.fromArray(n,r);let o=s.x*Math.abs(_s.x)+s.y*Math.abs(_s.y)+s.z*Math.abs(_s.z),l=e.dot(_s),c=t.dot(_s),h=i.dot(_s);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var Qt=new P,vo=new he,Gm=0,Ht=class extends yi{constructor(e,t,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Gm++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Mf,this.updateRanges=[],this.gpuType=jn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)vo.fromBufferAttribute(this,t),vo.applyMatrix3(e),this.setXY(t,vo.x,vo.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Qt.fromBufferAttribute(this,t),Qt.applyMatrix3(e),this.setXYZ(t,Qt.x,Qt.y,Qt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Qt.fromBufferAttribute(this,t),Qt.applyMatrix4(e),this.setXYZ(t,Qt.x,Qt.y,Qt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Qt.fromBufferAttribute(this,t),Qt.applyNormalMatrix(e),this.setXYZ(t,Qt.x,Qt.y,Qt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Qt.fromBufferAttribute(this,t),Qt.transformDirection(e),this.setXYZ(t,Qt.x,Qt.y,Qt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=Ks(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=Cn(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Ks(t,this.array)),t}setX(e,t){return this.normalized&&(t=Cn(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Ks(t,this.array)),t}setY(e,t){return this.normalized&&(t=Cn(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Ks(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Cn(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Ks(t,this.array)),t}setW(e,t){return this.normalized&&(t=Cn(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=Cn(t,this.array),i=Cn(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=Cn(t,this.array),i=Cn(i,this.array),s=Cn(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=Cn(t,this.array),i=Cn(i,this.array),s=Cn(s,this.array),r=Cn(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}};var aa=class extends Ht{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var oa=class extends Ht{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var it=class extends Ht{constructor(e,t,i){super(new Float32Array(e),t,i)}},Vm=new _i,Vr=new P,fh=new P,vi=class{constructor(e=new P,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):Vm.setFromPoints(e).getCenter(i);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Vr.subVectors(e,this.center);let t=Vr.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(Vr,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(fh.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Vr.copy(e.center).add(fh)),this.expandByPoint(Vr.copy(e.center).sub(fh))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Wm=0,Zn=new Mt,ph=new nn,qs=new P,kn=new _i,Wr=new _i,pn=new P,Et=class n extends yi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Wm++}),this.uuid=Ps(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(pm(e)?oa:aa)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new at().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Zn.makeRotationFromQuaternion(e),this.applyMatrix4(Zn),this}rotateX(e){return Zn.makeRotationX(e),this.applyMatrix4(Zn),this}rotateY(e){return Zn.makeRotationY(e),this.applyMatrix4(Zn),this}rotateZ(e){return Zn.makeRotationZ(e),this.applyMatrix4(Zn),this}translate(e,t,i){return Zn.makeTranslation(e,t,i),this.applyMatrix4(Zn),this}scale(e,t,i){return Zn.makeScale(e,t,i),this.applyMatrix4(Zn),this}lookAt(e){return ph.lookAt(e),ph.updateMatrix(),this.applyMatrix4(ph.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(qs).negate(),this.translate(qs.x,qs.y,qs.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let i=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new it(i,3))}else{let i=Math.min(e.length,t.count);for(let s=0;s<i;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Je("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new _i);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){tt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){let r=t[i];kn.setFromBufferAttribute(r),this.morphTargetsRelative?(pn.addVectors(this.boundingBox.min,kn.min),this.boundingBox.expandByPoint(pn),pn.addVectors(this.boundingBox.max,kn.max),this.boundingBox.expandByPoint(pn)):(this.boundingBox.expandByPoint(kn.min),this.boundingBox.expandByPoint(kn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&tt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new vi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){tt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new P,1/0);return}if(e){let i=this.boundingSphere.center;if(kn.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];Wr.setFromBufferAttribute(o),this.morphTargetsRelative?(pn.addVectors(kn.min,Wr.min),kn.expandByPoint(pn),pn.addVectors(kn.max,Wr.max),kn.expandByPoint(pn)):(kn.expandByPoint(Wr.min),kn.expandByPoint(Wr.max))}kn.getCenter(i);let s=0;for(let r=0,a=e.count;r<a;r++)pn.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(pn));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)pn.fromBufferAttribute(o,c),l&&(qs.fromBufferAttribute(e,c),pn.add(qs)),s=Math.max(s,i.distanceToSquared(pn))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&tt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){tt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=t.position,s=t.normal,r=t.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==i.count)&&(a=new Ht(new Float32Array(4*i.count),4),this.setAttribute("tangent",a));let o=[],l=[];for(let y=0;y<i.count;y++)o[y]=new P,l[y]=new P;let c=new P,h=new P,u=new P,d=new he,f=new he,m=new he,M=new P,g=new P;function p(y,w,R){c.fromBufferAttribute(i,y),h.fromBufferAttribute(i,w),u.fromBufferAttribute(i,R),d.fromBufferAttribute(r,y),f.fromBufferAttribute(r,w),m.fromBufferAttribute(r,R),h.sub(c),u.sub(c),f.sub(d),m.sub(d);let L=1/(f.x*m.y-m.x*f.y);isFinite(L)&&(M.copy(h).multiplyScalar(m.y).addScaledVector(u,-f.y).multiplyScalar(L),g.copy(u).multiplyScalar(f.x).addScaledVector(h,-m.x).multiplyScalar(L),o[y].add(M),o[w].add(M),o[R].add(M),l[y].add(g),l[w].add(g),l[R].add(g))}let b=this.groups;b.length===0&&(b=[{start:0,count:e.count}]);for(let y=0,w=b.length;y<w;++y){let R=b[y],L=R.start,F=R.count;for(let z=L,I=L+F;z<I;z+=3)p(e.getX(z+0),e.getX(z+1),e.getX(z+2))}let _=new P,x=new P,S=new P,T=new P;function A(y){S.fromBufferAttribute(s,y),T.copy(S);let w=o[y];_.copy(w),_.sub(S.multiplyScalar(S.dot(w))).normalize(),x.crossVectors(T,w);let L=x.dot(l[y])<0?-1:1;a.setXYZW(y,_.x,_.y,_.z,L)}for(let y=0,w=b.length;y<w;++y){let R=b[y],L=R.start,F=R.count;for(let z=L,I=L+F;z<I;z+=3)A(e.getX(z+0)),A(e.getX(z+1)),A(e.getX(z+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==t.count)i=new Ht(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let d=0,f=i.count;d<f;d++)i.setXYZ(d,0,0,0);let s=new P,r=new P,a=new P,o=new P,l=new P,c=new P,h=new P,u=new P;if(e)for(let d=0,f=e.count;d<f;d+=3){let m=e.getX(d+0),M=e.getX(d+1),g=e.getX(d+2);s.fromBufferAttribute(t,m),r.fromBufferAttribute(t,M),a.fromBufferAttribute(t,g),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),o.fromBufferAttribute(i,m),l.fromBufferAttribute(i,M),c.fromBufferAttribute(i,g),o.add(h),l.add(h),c.add(h),i.setXYZ(m,o.x,o.y,o.z),i.setXYZ(M,l.x,l.y,l.z),i.setXYZ(g,c.x,c.y,c.z)}else for(let d=0,f=t.count;d<f;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),i.setXYZ(d+0,h.x,h.y,h.z),i.setXYZ(d+1,h.x,h.y,h.z),i.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)pn.fromBufferAttribute(e,t),pn.normalize(),e.setXYZ(t,pn.x,pn.y,pn.z)}toNonIndexed(){function e(o,l){let c=o.array,h=o.itemSize,u=o.normalized,d=new c.constructor(l.length*h),f=0,m=0;for(let M=0,g=l.length;M<g;M++){o.isInterleavedBufferAttribute?f=l[M]*o.data.stride+o.offset:f=l[M]*h;for(let p=0;p<h;p++)d[m++]=c[f++]}return new Ht(d,h,u)}if(this.index===null)return Je("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new n,i=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=e(l,i);t.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let h=0,u=c.length;h<u;h++){let d=c[h],f=e(d,i);l.push(f)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let l in i){let c=i[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){let f=c[u];h.push(f.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone());let s=e.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(t))}let r=e.morphAttributes;for(let c in r){let h=[],u=r[c];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let c=0,h=a.length;c<h;c++){let u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var mh=new P,Xm=new P,qm=new at,ri=class{constructor(e=new P(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let s=mh.subVectors(i,t).cross(Xm.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,i=!0){let s=e.delta(mh),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/r;return i===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||qm.getNormalMatrix(e),s=this.coplanarPoint(mh).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Ym=0,oi=class extends yi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Ym++}),this.uuid=Ps(),this.name="",this.type="Material",this.blending=os,this.side=as,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=zh,this.blendDst=Gh,this.blendEquation=Rs,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ue(0,0,0),this.blendAlpha=0,this.depthFunc=er,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=pf,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Wo,this.stencilZFail=Wo,this.stencilZPass=Wo,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){Je(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Je(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector2&&i&&i.isVector2||s&&s.isEuler&&i&&i.isEuler||s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(i.textures=r),a.length>0&&(i.images=a)}return i}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ue().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(i=>new ri().fromJSON(i))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new he().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new he().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var Ci=new P,gh=new P,Mo=new P,bo=new P,ar=class{constructor(e=new P,t=new P(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ci)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Ci.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ci.copy(this.origin).addScaledVector(this.direction,t),Ci.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){gh.copy(e).add(t).multiplyScalar(.5),Mo.copy(t).sub(e).normalize(),bo.copy(this.origin).sub(gh);let r=e.distanceTo(t)*.5,a=-this.direction.dot(Mo),o=bo.dot(this.direction),l=-bo.dot(Mo),c=bo.lengthSq(),h=Math.abs(1-a*a),u,d,f,m;if(h>0)if(u=a*l-o,d=a*o-l,m=r*h,u>=0)if(d>=-m)if(d<=m){let M=1/h;u*=M,d*=M,f=u*(u+a*d+2*o)+d*(a*u+d+2*l)+c}else d=r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*l)+c;else d<=-m?(u=Math.max(0,-(-a*r+o)),d=u>0?-r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c):d<=m?(u=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(u=Math.max(0,-(a*r+o)),d=u>0?r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c);else d=a>0?-r:r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(gh).addScaledVector(Mo,d),f}intersectSphere(e,t){if(e.radius<0)return null;Ci.subVectors(e.center,this.origin);let i=Ci.dot(this.direction),s=Ci.dot(Ci)-i*i,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=i-a,l=i+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,a,o,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(i=(e.min.x-d.x)*c,s=(e.max.x-d.x)*c):(i=(e.max.x-d.x)*c,s=(e.min.x-d.x)*c),h>=0?(r=(e.min.y-d.y)*h,a=(e.max.y-d.y)*h):(r=(e.max.y-d.y)*h,a=(e.min.y-d.y)*h),i>a||r>s||((r>i||isNaN(i))&&(i=r),(a<s||isNaN(s))&&(s=a),u>=0?(o=(e.min.z-d.z)*u,l=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,l=(e.min.z-d.z)*u),i>l||o>s)||((o>i||i!==i)&&(i=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,Ci)!==null}intersectTriangle(e,t,i,s,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,h=o.z,u=e.x-a.x,d=e.y-a.y,f=e.z-a.z,m=t.x-a.x,M=t.y-a.y,g=t.z-a.z,p=i.x-a.x,b=i.y-a.y,_=i.z-a.z,x=Math.abs(l),S=Math.abs(c),T=Math.abs(h),A,y,w,R,L,F,z,I,U,G,W,K;if(x>=S&&x>=T?(w=l,F=u,U=m,K=p,l>=0?(A=c,y=h,R=d,L=f,z=M,I=g,G=b,W=_):(A=h,y=c,R=f,L=d,z=g,I=M,G=_,W=b)):S>=T?(w=c,F=d,U=M,K=b,c>=0?(A=h,y=l,R=f,L=u,z=g,I=m,G=_,W=p):(A=l,y=h,R=u,L=f,z=m,I=g,G=p,W=_)):(w=h,F=f,U=g,K=_,h>=0?(A=l,y=c,R=u,L=d,z=m,I=M,G=p,W=b):(A=c,y=l,R=d,L=u,z=M,I=m,G=b,W=p)),w===0)return null;let X=A/w,$=y/w,ne=1/w,Ie=R-X*F,Ce=L-$*F,gt=z-X*U,Ye=I-$*U,ct=G-X*K,ee=W-$*K,ae=ct*Ye-ee*gt,ge=Ie*ee-Ce*ct,$e=gt*Ce-Ye*Ie;if(s){if(ae<0||ge<0||$e<0)return null}else if((ae<0||ge<0||$e<0)&&(ae>0||ge>0||$e>0))return null;let be=ae+ge+$e;if(be===0)return null;let Qe=ne*(ae*F+ge*U+$e*K);return(be>0?Qe<0:Qe>0)?null:this.at(Qe/be,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},It=class extends oi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ue(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Di,this.combine=Vh,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},_d=new Mt,vs=new ar,So=new vi,vd=new P,Eo=new P,To=new P,wo=new P,xh=new P,Ao=new P,Md=new P,Ro=new P,pe=class extends nn{constructor(e=new Et,t=new It){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,a=i.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){Ao.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=o[l],u=r[l];h!==0&&(xh.fromBufferAttribute(u,e),a?Ao.addScaledVector(xh,h):Ao.addScaledVector(xh.sub(t),h))}t.add(Ao)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),So.copy(i.boundingSphere),So.applyMatrix4(r),vs.copy(e.ray).recast(e.near),!(So.containsPoint(vs.origin)===!1&&(vs.intersectSphere(So,vd)===null||vs.origin.distanceToSquared(vd)>(e.far-e.near)**2))&&(_d.copy(r).invert(),vs.copy(e.ray).applyMatrix4(_d),!(i.boundingBox!==null&&vs.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,vs)))}_computeIntersections(e,t,i){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let m=0,M=d.length;m<M;m++){let g=d[m],p=a[g.materialIndex],b=Math.max(g.start,f.start),_=Math.min(o.count,Math.min(g.start+g.count,f.start+f.count));for(let x=b,S=_;x<S;x+=3){let T=o.getX(x),A=o.getX(x+1),y=o.getX(x+2);s=Co(this,p,e,i,c,h,u,T,A,y),s&&(s.faceIndex=Math.floor(x/3),s.face.materialIndex=g.materialIndex,t.push(s))}}else{let m=Math.max(0,f.start),M=Math.min(o.count,f.start+f.count);for(let g=m,p=M;g<p;g+=3){let b=o.getX(g),_=o.getX(g+1),x=o.getX(g+2);s=Co(this,a,e,i,c,h,u,b,_,x),s&&(s.faceIndex=Math.floor(g/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let m=0,M=d.length;m<M;m++){let g=d[m],p=a[g.materialIndex],b=Math.max(g.start,f.start),_=Math.min(l.count,Math.min(g.start+g.count,f.start+f.count));for(let x=b,S=_;x<S;x+=3){let T=x,A=x+1,y=x+2;s=Co(this,p,e,i,c,h,u,T,A,y),s&&(s.faceIndex=Math.floor(x/3),s.face.materialIndex=g.materialIndex,t.push(s))}}else{let m=Math.max(0,f.start),M=Math.min(l.count,f.start+f.count);for(let g=m,p=M;g<p;g+=3){let b=g,_=g+1,x=g+2;s=Co(this,a,e,i,c,h,u,b,_,x),s&&(s.faceIndex=Math.floor(g/3),t.push(s))}}}};function Zm(n,e,t,i,s,r,a,o){let l;if(e.side===un?l=i.intersectTriangle(a,r,s,!0,o):l=i.intersectTriangle(s,r,a,e.side===as,o),l===null)return null;Ro.copy(o),Ro.applyMatrix4(n.matrixWorld);let c=t.ray.origin.distanceTo(Ro);return c<t.near||c>t.far?null:{distance:c,point:Ro.clone(),object:n}}function Co(n,e,t,i,s,r,a,o,l,c){n.getVertexPosition(o,Eo),n.getVertexPosition(l,To),n.getVertexPosition(c,wo);let h=Zm(n,e,t,i,Eo,To,wo,Md);if(h){let u=new P;Ii.getBarycoord(Md,Eo,To,wo,u),s&&(h.uv=Ii.getInterpolatedAttribute(s,o,l,c,u,new he)),r&&(h.uv1=Ii.getInterpolatedAttribute(r,o,l,c,u,new he)),a&&(h.normal=Ii.getInterpolatedAttribute(a,o,l,c,u,new P),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let d={a:o,b:l,c,normal:new P,materialIndex:0};Ii.getNormal(Eo,To,wo,d.normal),h.face=d,h.barycoord=u}return h}var Ts=class extends In{constructor(e=null,t=1,i=1,s,r,a,o,l,c=en,h=en,u,d){super(null,a,o,l,c,h,s,r,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var or=class extends Ht{constructor(e,t,i,s=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Ys=new Mt,bd=new Mt,Io=[],Sd=new _i,$m=new Mt,Xr=new pe,qr=new vi,es=class extends pe{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new or(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<i;s++)this.setMatrixAt(s,$m)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new _i),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,Ys),Sd.copy(e.boundingBox).applyMatrix4(Ys),this.boundingBox.union(Sd)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new vi),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,Ys),qr.copy(e.boundingSphere).applyMatrix4(Ys),this.boundingSphere.union(qr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let i=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=i.length+1,a=e*r+1;for(let o=0;o<i.length;o++)i[o]=s[a+o]}raycast(e,t){let i=this.matrixWorld,s=this.count;if(Xr.geometry=this.geometry,Xr.material=this.material,Xr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),qr.copy(this.boundingSphere),qr.applyMatrix4(i),e.ray.intersectsSphere(qr)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Ys),bd.multiplyMatrices(i,Ys),Xr.matrixWorld=bd,Xr.raycast(e,Io);for(let a=0,o=Io.length;a<o;a++){let l=Io[a];l.instanceId=r,l.object=this,t.push(l)}Io.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new or(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let i=t.morphTargetInfluences,s=i.length+1;this.morphTexture===null&&(this.morphTexture=new Ts(new Float32Array(s*this.count),s,this.count,Bl,jn));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<i.length;c++)a+=i[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=s*e;return r[l]=o,r.set(i,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Ms=new vi,Jm=new he(.5,.5),Po=new P,lr=class{constructor(e=new ri,t=new ri,i=new ri,s=new ri,r=new ri,a=new ri){this.planes=[e,t,i,s,r,a]}set(e,t,i,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(i),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=ai,i=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],u=r[5],d=r[6],f=r[7],m=r[8],M=r[9],g=r[10],p=r[11],b=r[12],_=r[13],x=r[14],S=r[15];if(s[0].setComponents(c-a,f-h,p-m,S-b).normalize(),s[1].setComponents(c+a,f+h,p+m,S+b).normalize(),s[2].setComponents(c+o,f+u,p+M,S+_).normalize(),s[3].setComponents(c-o,f-u,p-M,S-_).normalize(),i)s[4].setComponents(l,d,g,x).normalize(),s[5].setComponents(c-l,f-d,p-g,S-x).normalize();else if(s[4].setComponents(c-l,f-d,p-g,S-x).normalize(),t===ai)s[5].setComponents(c+l,f+d,p+g,S+x).normalize();else if(t===tr)s[5].setComponents(l,d,g,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ms.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ms.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ms)}intersectsSprite(e){Ms.center.set(0,0,0);let t=Jm.distanceTo(e.center);return Ms.radius=.7071067811865476+t,Ms.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ms)}intersectsSphere(e){let t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let s=t[i];if(Po.x=s.normal.x>0?e.max.x:e.min.x,Po.y=s.normal.y>0?e.max.y:e.min.y,Po.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Po)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var cr=class extends oi{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ue(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},il=new P,sl=new P,Ed=new Mt,Yr=new ar,Do=new vi,yh=new P,Td=new P,rl=class extends nn{constructor(e=new Et,t=new cr){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,i=[0];for(let s=1,r=t.count;s<r;s++)il.fromBufferAttribute(t,s-1),sl.fromBufferAttribute(t,s),i[s]=i[s-1],i[s]+=il.distanceTo(sl);e.setAttribute("lineDistance",new it(i,1))}else Je("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let i=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Do.copy(i.boundingSphere),Do.applyMatrix4(s),Do.radius+=r,e.ray.intersectsSphere(Do)===!1)return;Ed.copy(s).invert(),Yr.copy(e.ray).applyMatrix4(Ed);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=i.index,d=i.attributes.position;if(h!==null){let f=Math.max(0,a.start),m=Math.min(h.count,a.start+a.count);for(let M=f,g=m-1;M<g;M+=c){let p=h.getX(M),b=h.getX(M+1),_=Lo(this,e,Yr,l,p,b,M);_&&t.push(_)}if(this.isLineLoop){let M=h.getX(m-1),g=h.getX(f),p=Lo(this,e,Yr,l,M,g,m-1);p&&t.push(p)}}else{let f=Math.max(0,a.start),m=Math.min(d.count,a.start+a.count);for(let M=f,g=m-1;M<g;M+=c){let p=Lo(this,e,Yr,l,M,M+1,M);p&&t.push(p)}if(this.isLineLoop){let M=Lo(this,e,Yr,l,m-1,f,m-1);M&&t.push(M)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Lo(n,e,t,i,s,r,a){let o=n.geometry.attributes.position;if(il.fromBufferAttribute(o,s),sl.fromBufferAttribute(o,r),t.distanceSqToSegment(il,sl,yh,Td)>i)return;yh.applyMatrix4(n.matrixWorld);let c=e.ray.origin.distanceTo(yh);if(!(c<e.near||c>e.far))return{distance:c,point:Td.clone().applyMatrix4(n.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:n}}var wd=new P,Ad=new P,la=class extends rl{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,i=[];for(let s=0,r=t.count;s<r;s+=2)wd.fromBufferAttribute(t,s),Ad.fromBufferAttribute(t,s+1),i[s]=s===0?0:i[s-1],i[s+1]=i[s]+wd.distanceTo(Ad);e.setAttribute("lineDistance",new it(i,1))}else Je("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var al=class extends oi{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ue(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Rd=new Mt,Ch=new ar,No=new vi,Uo=new P,ws=class extends nn{constructor(e=new Et,t=new al){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let i=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),No.copy(i.boundingSphere),No.applyMatrix4(s),No.radius+=r,e.ray.intersectsSphere(No)===!1)return;Rd.copy(s).invert(),Ch.copy(e.ray).applyMatrix4(Rd);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=i.index,u=i.attributes.position;if(c!==null){let d=Math.max(0,a.start),f=Math.min(c.count,a.start+a.count);for(let m=d,M=f;m<M;m++){let g=c.getX(m);Uo.fromBufferAttribute(u,g),Cd(Uo,g,l,s,e,t,this)}}else{let d=Math.max(0,a.start),f=Math.min(u.count,a.start+a.count);for(let m=d,M=f;m<M;m++)Uo.fromBufferAttribute(u,m),Cd(Uo,m,l,s,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Cd(n,e,t,i,s,r,a){let o=Ch.distanceSqToPoint(n);if(o<t){let l=new P;Ch.closestPointToPoint(n,l),l.applyMatrix4(i);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}var ca=class extends In{constructor(e=[],t=ls,i,s,r,a,o,l,c,h){super(e,t,i,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Li=class extends In{constructor(e,t,i,s,r,a,o,l,c){super(e,t,i,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var ts=class extends In{constructor(e,t,i=ci,s,r,a,o=en,l=en,c,h=xi,u=1){if(h!==xi&&h!==hs)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:e,height:t,depth:u};super(d,s,r,a,o,l,h,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new sr(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},ol=class extends ts{constructor(e,t=ci,i=ls,s,r,a=en,o=en,l,c=xi){let h={width:e,height:e,depth:1},u=[h,h,h,h,h,h];super(e,e,t,i,s,r,a,o,l,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},ha=class extends In{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Ze=class n extends Et{constructor(e=1,t=1,i=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],h=[],u=[],d=0,f=0;m("z","y","x",-1,-1,i,t,e,a,r,0),m("z","y","x",1,-1,i,t,-e,a,r,1),m("x","z","y",1,1,e,i,t,s,a,2),m("x","z","y",1,-1,e,i,-t,s,a,3),m("x","y","z",1,-1,e,t,i,s,r,4),m("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(l),this.setAttribute("position",new it(c,3)),this.setAttribute("normal",new it(h,3)),this.setAttribute("uv",new it(u,2));function m(M,g,p,b,_,x,S,T,A,y,w){let R=x/A,L=S/y,F=x/2,z=S/2,I=T/2,U=A+1,G=y+1,W=0,K=0,X=new P;for(let $=0;$<G;$++){let ne=$*L-z;for(let Ie=0;Ie<U;Ie++){let Ce=Ie*R-F;X[M]=Ce*b,X[g]=ne*_,X[p]=I,c.push(X.x,X.y,X.z),X[M]=0,X[g]=0,X[p]=T>0?1:-1,h.push(X.x,X.y,X.z),u.push(Ie/A),u.push(1-$/y),W+=1}}for(let $=0;$<y;$++)for(let ne=0;ne<A;ne++){let Ie=d+ne+U*$,Ce=d+ne+U*($+1),gt=d+(ne+1)+U*($+1),Ye=d+(ne+1)+U*$;l.push(Ie,Ce,Ye),l.push(Ce,gt,Ye),K+=6}o.addGroup(f,K,w),f+=K,d+=W}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}},vt=class n extends Et{constructor(e=1,t=1,i=4,s=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:e,height:t,capSegments:i,radialSegments:s,heightSegments:r},t=Math.max(0,t),i=Math.max(1,Math.floor(i)),s=Math.max(3,Math.floor(s)),r=Math.max(1,Math.floor(r));let a=[],o=[],l=[],c=[],h=t/2,u=Math.PI/2*e,d=t,f=2*u+d,m=i*2+r,M=s+1,g=new P,p=new P;for(let b=0;b<=m;b++){let _=0,x=0,S=0,T=0;if(b<=i){let w=b/i,R=w*Math.PI/2;x=-h-e*Math.cos(R),S=e*Math.sin(R),T=-e*Math.cos(R),_=w*u}else if(b<=i+r){let w=(b-i)/r;x=-h+w*t,S=e,T=0,_=u+w*d}else{let w=(b-i-r)/i,R=w*Math.PI/2;x=h+e*Math.sin(R),S=e*Math.cos(R),T=e*Math.sin(R),_=u+d+w*u}let A=Math.max(0,Math.min(1,_/f)),y=0;b===0?y=.5/s:b===m&&(y=-.5/s);for(let w=0;w<=s;w++){let R=w/s,L=R*Math.PI*2,F=Math.sin(L),z=Math.cos(L);p.x=-S*z,p.y=x,p.z=S*F,o.push(p.x,p.y,p.z),g.set(-S*z,T,S*F),g.normalize(),l.push(g.x,g.y,g.z),c.push(R+y,A)}if(b>0){let w=(b-1)*M;for(let R=0;R<s;R++){let L=w+R,F=w+R+1,z=b*M+R,I=b*M+R+1;a.push(L,F,z),a.push(F,I,z)}}}this.setIndex(a),this.setAttribute("position",new it(o,3)),this.setAttribute("normal",new it(l,3)),this.setAttribute("uv",new it(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.height,e.capSegments,e.radialSegments,e.heightSegments)}},Mi=class n extends Et{constructor(e=1,t=32,i=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:s},t=Math.max(3,t);let r=[],a=[],o=[],l=[],c=new P,h=new he;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let u=0,d=3;u<=t;u++,d+=3){let f=i+u/t*s;c.x=e*Math.cos(f),c.y=e*Math.sin(f),a.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(a[d]/e+1)/2,h.y=(a[d+1]/e+1)/2,l.push(h.x,h.y)}for(let u=1;u<=t;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new it(a,3)),this.setAttribute("normal",new it(o,3)),this.setAttribute("uv",new it(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.segments,e.thetaStart,e.thetaLength)}},Le=class n extends Et{constructor(e=1,t=1,i=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],u=[],d=[],f=[],m=0,M=[],g=i/2,p=0;b(),a===!1&&(e>0&&_(!0),t>0&&_(!1)),this.setIndex(h),this.setAttribute("position",new it(u,3)),this.setAttribute("normal",new it(d,3)),this.setAttribute("uv",new it(f,2));function b(){let x=new P,S=new P,T=0,A=(t-e)/i;for(let y=0;y<=r;y++){let w=[],R=y/r,L=R*(t-e)+e;for(let F=0;F<=s;F++){let z=F/s,I=z*l+o,U=Math.sin(I),G=Math.cos(I);S.x=L*U,S.y=-R*i+g,S.z=L*G,u.push(S.x,S.y,S.z),x.set(U,A,G).normalize(),d.push(x.x,x.y,x.z),f.push(z,1-R),w.push(m++)}M.push(w)}for(let y=0;y<s;y++)for(let w=0;w<r;w++){let R=M[w][y],L=M[w+1][y],F=M[w+1][y+1],z=M[w][y+1];(e>0||w!==0)&&(h.push(R,L,z),T+=3),(t>0||w!==r-1)&&(h.push(L,F,z),T+=3)}c.addGroup(p,T,0),p+=T}function _(x){let S=m,T=new he,A=new P,y=0,w=x===!0?e:t,R=x===!0?1:-1;for(let F=1;F<=s;F++)u.push(0,g*R,0),d.push(0,R,0),f.push(.5,.5),m++;let L=m;for(let F=0;F<=s;F++){let I=F/s*l+o,U=Math.cos(I),G=Math.sin(I);A.x=w*G,A.y=g*R,A.z=w*U,u.push(A.x,A.y,A.z),d.push(0,R,0),T.x=U*.5+.5,T.y=G*.5*R+.5,f.push(T.x,T.y),m++}for(let F=0;F<s;F++){let z=S+F,I=L+F;x===!0?h.push(I,I+1,z):h.push(I+1,I,z),y+=3}c.addGroup(p,y,x===!0?1:2),p+=y}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Zt=class n extends Le{constructor(e=1,t=1,i=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,i,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new n(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},ll=class n extends Et{constructor(e=[],t=[],i=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:s};let r=[],a=[];o(s),c(i),h(),this.setAttribute("position",new it(r,3)),this.setAttribute("normal",new it(r.slice(),3)),this.setAttribute("uv",new it(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(b){let _=new P,x=new P,S=new P;for(let T=0;T<t.length;T+=3)f(t[T+0],_),f(t[T+1],x),f(t[T+2],S),l(_,x,S,b)}function l(b,_,x,S){let T=S+1,A=[];for(let y=0;y<=T;y++){A[y]=[];let w=b.clone().lerp(x,y/T),R=_.clone().lerp(x,y/T),L=T-y;for(let F=0;F<=L;F++)F===0&&y===T?A[y][F]=w:A[y][F]=w.clone().lerp(R,F/L)}for(let y=0;y<T;y++)for(let w=0;w<2*(T-y)-1;w++){let R=Math.floor(w/2);w%2===0?(d(A[y][R+1]),d(A[y+1][R]),d(A[y][R])):(d(A[y][R+1]),d(A[y+1][R+1]),d(A[y+1][R]))}}function c(b){let _=new P;for(let x=0;x<r.length;x+=3)_.x=r[x+0],_.y=r[x+1],_.z=r[x+2],_.normalize().multiplyScalar(b),r[x+0]=_.x,r[x+1]=_.y,r[x+2]=_.z}function h(){let b=new P;for(let _=0;_<r.length;_+=3){b.x=r[_+0],b.y=r[_+1],b.z=r[_+2];let x=g(b)/2/Math.PI+.5,S=p(b)/Math.PI+.5;a.push(x,1-S)}m(),u()}function u(){for(let b=0;b<a.length;b+=6){let _=a[b+0],x=a[b+2],S=a[b+4],T=Math.max(_,x,S),A=Math.min(_,x,S);T>.9&&A<.1&&(_<.2&&(a[b+0]+=1),x<.2&&(a[b+2]+=1),S<.2&&(a[b+4]+=1))}}function d(b){r.push(b.x,b.y,b.z)}function f(b,_){let x=b*3;_.x=e[x+0],_.y=e[x+1],_.z=e[x+2]}function m(){let b=new P,_=new P,x=new P,S=new P,T=new he,A=new he,y=new he;for(let w=0,R=0;w<r.length;w+=9,R+=6){b.set(r[w+0],r[w+1],r[w+2]),_.set(r[w+3],r[w+4],r[w+5]),x.set(r[w+6],r[w+7],r[w+8]),T.set(a[R+0],a[R+1]),A.set(a[R+2],a[R+3]),y.set(a[R+4],a[R+5]),S.copy(b).add(_).add(x).divideScalar(3);let L=g(S);M(T,R+0,b,L),M(A,R+2,_,L),M(y,R+4,x,L)}}function M(b,_,x,S){S<0&&b.x===1&&(a[_]=b.x-1),x.x===0&&x.z===0&&(a[_]=S/2/Math.PI+.5)}function g(b){return Math.atan2(b.z,-b.x)}function p(b){return Math.atan2(-b.y,Math.sqrt(b.x*b.x+b.z*b.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.vertices,e.indices,e.radius,e.detail)}};var Fo=new P,Bo=new P,_h=new P,Oo=new Ii,ua=class extends Et{constructor(e=null,t=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:e,thresholdAngle:t},e!==null){let s=Math.pow(10,4),r=Math.cos(js*t),a=e.getIndex(),o=e.getAttribute("position"),l=a?a.count:o.count,c=[0,0,0],h=["a","b","c"],u=new Array(3),d={},f=[];for(let m=0;m<l;m+=3){a?(c[0]=a.getX(m),c[1]=a.getX(m+1),c[2]=a.getX(m+2)):(c[0]=m,c[1]=m+1,c[2]=m+2);let{a:M,b:g,c:p}=Oo;if(M.fromBufferAttribute(o,c[0]),g.fromBufferAttribute(o,c[1]),p.fromBufferAttribute(o,c[2]),Oo.getNormal(_h),u[0]=`${Math.round(M.x*s)},${Math.round(M.y*s)},${Math.round(M.z*s)}`,u[1]=`${Math.round(g.x*s)},${Math.round(g.y*s)},${Math.round(g.z*s)}`,u[2]=`${Math.round(p.x*s)},${Math.round(p.y*s)},${Math.round(p.z*s)}`,!(u[0]===u[1]||u[1]===u[2]||u[2]===u[0]))for(let b=0;b<3;b++){let _=(b+1)%3,x=u[b],S=u[_],T=Oo[h[b]],A=Oo[h[_]],y=`${x}_${S}`,w=`${S}_${x}`;w in d&&d[w]?(_h.dot(d[w].normal)<=r&&(f.push(T.x,T.y,T.z),f.push(A.x,A.y,A.z)),d[w]=null):y in d||(d[y]={index0:c[b],index1:c[_],normal:_h.clone()})}}for(let m in d)if(d[m]){let{index0:M,index1:g}=d[m];Fo.fromBufferAttribute(o,M),Bo.fromBufferAttribute(o,g),f.push(Fo.x,Fo.y,Fo.z),f.push(Bo.x,Bo.y,Bo.z)}this.setAttribute("position",new it(f,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}},Hn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Je("Curve: .getPoint() not implemented.")}getPointAt(e,t){let i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],i,s=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)i=this.getPoint(a/e),r+=i.distanceTo(s),t.push(r),s=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let i=this.getLengths(),s=0,r=i.length,a;t?a=t:a=e*i[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=i[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,i[s]===a)return s/(r-1);let h=i[s],d=i[s+1]-h,f=(a-h)/d;return(s+f)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),l=t||(a.isVector2?new he:new P);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){let i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t=!1){let i=new P,s=[],r=[],a=[],o=new P,l=new Mt;for(let f=0;f<=e;f++){let m=f/e;s[f]=this.getTangentAt(m,new P)}r[0]=new P,a[0]=new P;let c=Number.MAX_VALUE,h=Math.abs(s[0].x),u=Math.abs(s[0].y),d=Math.abs(s[0].z);h<=c&&(c=h,i.set(1,0,0)),u<=c&&(c=u,i.set(0,1,0)),d<=c&&i.set(0,0,1),o.crossVectors(s[0],i).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(s[f-1],s[f]),o.length()>Number.EPSILON){o.normalize();let m=Math.acos(dt(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(o,m))}a[f].crossVectors(s[f],r[f])}if(t===!0){let f=Math.acos(dt(r[0].dot(r[e]),-1,1));f/=e,s[0].dot(o.crossVectors(r[0],r[e]))>0&&(f=-f);for(let m=1;m<=e;m++)r[m].applyMatrix4(l.makeRotationAxis(s[m],f*m)),a[m].crossVectors(s[m],r[m])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},hr=class extends Hn{constructor(e=0,t=0,i=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t=new he){let i=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+e*r,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*h-f*u+this.aX,c=d*u+f*h+this.aY}return i.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},cl=class extends hr{constructor(e,t,i,s,r,a){super(e,t,i,i,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function eu(){let n=0,e=0,t=0,i=0;function s(r,a,o,l){n=r,e=o,t=-3*r+3*a-2*o-l,i=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,h,u){let d=(a-r)/c-(o-r)/(c+h)+(o-a)/h,f=(o-a)/h-(l-a)/(h+u)+(l-o)/u;d*=h,f*=h,s(a,o,d,f)},calc:function(r){let a=r*r,o=a*r;return n+e*r+t*a+i*o}}}var Id=new P,Pd=new P,vh=new eu,Mh=new eu,bh=new eu,hl=class extends Hn{constructor(e=[],t=!1,i="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=s}getPoint(e,t=new P){let i=t,s=this.points,r=s.length,a=(r-(this.closed?0:1))*e,o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,h;this.closed||o>0?c=s[(o-1)%r]:(Pd.subVectors(s[0],s[1]).add(s[0]),c=Pd);let u=s[o%r],d=s[(o+1)%r];if(this.closed||o+2<r?h=s[(o+2)%r]:(Id.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=Id),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,m=Math.pow(c.distanceToSquared(u),f),M=Math.pow(u.distanceToSquared(d),f),g=Math.pow(d.distanceToSquared(h),f);M<1e-4&&(M=1),m<1e-4&&(m=M),g<1e-4&&(g=M),vh.initNonuniformCatmullRom(c.x,u.x,d.x,h.x,m,M,g),Mh.initNonuniformCatmullRom(c.y,u.y,d.y,h.y,m,M,g),bh.initNonuniformCatmullRom(c.z,u.z,d.z,h.z,m,M,g)}else this.curveType==="catmullrom"&&(vh.initCatmullRom(c.x,u.x,d.x,h.x,this.tension),Mh.initCatmullRom(c.y,u.y,d.y,h.y,this.tension),bh.initCatmullRom(c.z,u.z,d.z,h.z,this.tension));return i.set(vh.calc(l),Mh.calc(l),bh.calc(l)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(new P().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Dd(n,e,t,i,s){let r=(i-e)*.5,a=(s-t)*.5,o=n*n,l=n*o;return(2*t-2*i+r+a)*l+(-3*t+3*i-2*r-a)*o+r*n+t}function Km(n,e){let t=1-n;return t*t*e}function jm(n,e){return 2*(1-n)*n*e}function Qm(n,e){return n*n*e}function Jr(n,e,t,i){return Km(n,e)+jm(n,t)+Qm(n,i)}function e0(n,e){let t=1-n;return t*t*t*e}function t0(n,e){let t=1-n;return 3*t*t*n*e}function n0(n,e){return 3*(1-n)*n*n*e}function i0(n,e){return n*n*n*e}function Kr(n,e,t,i,s){return e0(n,e)+t0(n,t)+n0(n,i)+i0(n,s)}var da=class extends Hn{constructor(e=new he,t=new he,i=new he,s=new he){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new he){let i=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return i.set(Kr(e,s.x,r.x,a.x,o.x),Kr(e,s.y,r.y,a.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},ul=class extends Hn{constructor(e=new P,t=new P,i=new P,s=new P){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new P){let i=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return i.set(Kr(e,s.x,r.x,a.x,o.x),Kr(e,s.y,r.y,a.y,o.y),Kr(e,s.z,r.z,a.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},fa=class extends Hn{constructor(e=new he,t=new he){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new he){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new he){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},dl=class extends Hn{constructor(e=new P,t=new P){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new P){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new P){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},pa=class extends Hn{constructor(e=new he,t=new he,i=new he){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new he){let i=t,s=this.v0,r=this.v1,a=this.v2;return i.set(Jr(e,s.x,r.x,a.x),Jr(e,s.y,r.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},fl=class extends Hn{constructor(e=new P,t=new P,i=new P){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new P){let i=t,s=this.v0,r=this.v1,a=this.v2;return i.set(Jr(e,s.x,r.x,a.x),Jr(e,s.y,r.y,a.y),Jr(e,s.z,r.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ma=class extends Hn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new he){let i=t,s=this.points,r=(s.length-1)*e,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],h=s[a>s.length-2?s.length-1:a+1],u=s[a>s.length-3?s.length-1:a+2];return i.set(Dd(o,l.x,c.x,h.x,u.x),Dd(o,l.y,c.y,h.y,u.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(new he().fromArray(s))}return this}},Ih=Object.freeze({__proto__:null,ArcCurve:cl,CatmullRomCurve3:hl,CubicBezierCurve:da,CubicBezierCurve3:ul,EllipseCurve:hr,LineCurve:fa,LineCurve3:dl,QuadraticBezierCurve:pa,QuadraticBezierCurve3:fl,SplineCurve:ma}),pl=class extends Hn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Ih[i](t,e))}return this}getPoint(e,t){let i=e*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=i){let a=s[r]-i,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let i=0,s=this.curves.length;i<s;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],i;for(let s=0,r=this.curves;s<r.length;s++){let a=r[s],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,l=a.getPoints(o);for(let c=0;c<l.length;c++){let h=l[c];i&&i.equals(h)||(t.push(h),i=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){let s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let s=e.curves[t];this.curves.push(new Ih[s.type]().fromJSON(s))}return this}},ga=class extends pl{constructor(e){super(),this.type="Path",this.currentPoint=new he,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let i=new fa(this.currentPoint.clone(),new he(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,s){let r=new pa(this.currentPoint.clone(),new he(e,t),new he(i,s));return this.curves.push(r),this.currentPoint.set(i,s),this}bezierCurveTo(e,t,i,s,r,a){let o=new da(this.currentPoint.clone(),new he(e,t),new he(i,s),new he(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),i=new ma(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,s,r,a){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+o,t+l,i,s,r,a),this}absarc(e,t,i,s,r,a){return this.absellipse(e,t,i,i,s,r,a),this}ellipse(e,t,i,s,r,a,o,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,i,s,r,a,o,l),this}absellipse(e,t,i,s,r,a,o,l){let c=new hr(e,t,i,s,r,a,o,l);if(this.curves.length>0){let u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},ur=class extends ga{constructor(e){super(e),this.uuid=Ps(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let i=0,s=this.holes.length;i<s;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){let s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let s=e.holes[t];this.holes.push(new ga().fromJSON(s))}return this}};function s0(n,e,t=2){let i=e&&e.length,s=i?e[0]*t:n.length,r=Af(n,0,s,t,!0),a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(i&&(r=c0(n,e,r,t)),n.length>80*t){o=n[0],l=n[1];let h=o,u=l;for(let d=t;d<s;d+=t){let f=n[d],m=n[d+1];f<o&&(o=f),m<l&&(l=m),f>h&&(h=f),m>u&&(u=m)}c=Math.max(h-o,u-l),c=c!==0?32767/c:0}return xa(r,a,t,o,l,c,0),a}function Af(n,e,t,i,s){let r;if(s===v0(n,e,t,i)>0)for(let a=e;a<t;a+=i)r=Ld(a/i|0,n[a],n[a+1],r);else for(let a=t-i;a>=e;a-=i)r=Ld(a/i|0,n[a],n[a+1],r);return r&&dr(r,r.next)&&(_a(r),r=r.next),r}function As(n,e){if(!n)return n;e||(e=n);let t=n,i;do if(i=!1,!t.steiner&&(dr(t,t.next)||Yt(t.prev,t,t.next)===0)){if(_a(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function xa(n,e,t,i,s,r,a){if(!n)return;!a&&r&&p0(n,i,s,r);let o=n;for(;n.prev!==n.next;){let l=n.prev,c=n.next;if(r?a0(n,i,s,r):r0(n)){e.push(l.i,n.i,c.i),_a(n),n=c.next,o=c.next;continue}if(n=c,n===o){a?a===1?(n=o0(As(n),e),xa(n,e,t,i,s,r,2)):a===2&&l0(n,e,t,i,s,r):xa(As(n),e,t,i,s,r,1);break}}}function r0(n){let e=n.prev,t=n,i=n.next;if(Yt(e,t,i)>=0)return!1;let s=e.x,r=t.x,a=i.x,o=e.y,l=t.y,c=i.y,h=Math.min(s,r,a),u=Math.min(o,l,c),d=Math.max(s,r,a),f=Math.max(o,l,c),m=i.next;for(;m!==e;){if(m.x>=h&&m.x<=d&&m.y>=u&&m.y<=f&&Zr(s,o,r,l,a,c,m.x,m.y)&&Yt(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function a0(n,e,t,i){let s=n.prev,r=n,a=n.next;if(Yt(s,r,a)>=0)return!1;let o=s.x,l=r.x,c=a.x,h=s.y,u=r.y,d=a.y,f=Math.min(o,l,c),m=Math.min(h,u,d),M=Math.max(o,l,c),g=Math.max(h,u,d),p=Ph(f,m,e,t,i),b=Ph(M,g,e,t,i),_=n.prevZ,x=n.nextZ;for(;_&&_.z>=p&&x&&x.z<=b;){if(_.x>=f&&_.x<=M&&_.y>=m&&_.y<=g&&_!==s&&_!==a&&Zr(o,h,l,u,c,d,_.x,_.y)&&Yt(_.prev,_,_.next)>=0||(_=_.prevZ,x.x>=f&&x.x<=M&&x.y>=m&&x.y<=g&&x!==s&&x!==a&&Zr(o,h,l,u,c,d,x.x,x.y)&&Yt(x.prev,x,x.next)>=0))return!1;x=x.nextZ}for(;_&&_.z>=p;){if(_.x>=f&&_.x<=M&&_.y>=m&&_.y<=g&&_!==s&&_!==a&&Zr(o,h,l,u,c,d,_.x,_.y)&&Yt(_.prev,_,_.next)>=0)return!1;_=_.prevZ}for(;x&&x.z<=b;){if(x.x>=f&&x.x<=M&&x.y>=m&&x.y<=g&&x!==s&&x!==a&&Zr(o,h,l,u,c,d,x.x,x.y)&&Yt(x.prev,x,x.next)>=0)return!1;x=x.nextZ}return!0}function o0(n,e){let t=n;do{let i=t.prev,s=t.next.next;!dr(i,s)&&Cf(i,t,t.next,s)&&ya(i,s)&&ya(s,i)&&(e.push(i.i,t.i,s.i),_a(t),_a(t.next),t=n=s),t=t.next}while(t!==n);return As(t)}function l0(n,e,t,i,s,r){let a=n;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&x0(a,o)){let l=If(a,o);a=As(a,a.next),l=As(l,l.next),xa(a,e,t,i,s,r,0),xa(l,e,t,i,s,r,0);return}o=o.next}a=a.next}while(a!==n)}function c0(n,e,t,i){let s=[];for(let r=0,a=e.length;r<a;r++){let o=e[r]*i,l=r<a-1?e[r+1]*i:n.length,c=Af(n,o,l,i,!1);c===c.next&&(c.steiner=!0),s.push(g0(c))}s.sort(h0);for(let r=0;r<s.length;r++)t=u0(s[r],t);return t}function h0(n,e){let t=n.x-e.x;if(t===0&&(t=n.y-e.y,t===0)){let i=(n.next.y-n.y)/(n.next.x-n.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=i-s}return t}function u0(n,e){let t=d0(n,e);if(!t)return e;let i=If(t,n);return As(i,i.next),As(t,t.next)}function d0(n,e){let t=e,i=n.x,s=n.y,r=-1/0,a;if(dr(n,t))return t;do{if(dr(n,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){let u=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(u<=i&&u>r&&(r=u,a=t.x<t.next.x?t:t.next,u===i))return a}t=t.next}while(t!==e);if(!a)return null;let o=a,l=a.x,c=a.y,h=1/0;t=a;do{if(i>=t.x&&t.x>=l&&i!==t.x&&Rf(s<c?i:r,s,l,c,s<c?r:i,s,t.x,t.y)){let u=Math.abs(s-t.y)/(i-t.x);ya(t,n)&&(u<h||u===h&&(t.x>a.x||t.x===a.x&&f0(a,t)))&&(a=t,h=u)}t=t.next}while(t!==o);return a}function f0(n,e){return Yt(n.prev,n,e.prev)<0&&Yt(e.next,n,n.next)<0}function p0(n,e,t,i){let s=n;do s.z===0&&(s.z=Ph(s.x,s.y,e,t,i)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==n);s.prevZ.nextZ=null,s.prevZ=null,m0(s)}function m0(n){let e,t=1;do{let i=n,s;n=null;let r=null;for(e=0;i;){e++;let a=i,o=0;for(let c=0;c<t&&(o++,a=a.nextZ,!!a);c++);let l=t;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||i.z<=a.z)?(s=i,i=i.nextZ,o--):(s=a,a=a.nextZ,l--),r?r.nextZ=s:n=s,s.prevZ=r,r=s;i=a}r.nextZ=null,t*=2}while(e>1);return n}function Ph(n,e,t,i,s){return n=(n-t)*s|0,e=(e-i)*s|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,n|e<<1}function g0(n){let e=n,t=n;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==n);return t}function Rf(n,e,t,i,s,r,a,o){return(s-a)*(e-o)>=(n-a)*(r-o)&&(n-a)*(i-o)>=(t-a)*(e-o)&&(t-a)*(r-o)>=(s-a)*(i-o)}function Zr(n,e,t,i,s,r,a,o){return!(n===a&&e===o)&&Rf(n,e,t,i,s,r,a,o)}function x0(n,e){return n.next.i!==e.i&&n.prev.i!==e.i&&!y0(n,e)&&(ya(n,e)&&ya(e,n)&&_0(n,e)&&(Yt(n.prev,n,e.prev)||Yt(n,e.prev,e))||dr(n,e)&&Yt(n.prev,n,n.next)>0&&Yt(e.prev,e,e.next)>0)}function Yt(n,e,t){return(e.y-n.y)*(t.x-e.x)-(e.x-n.x)*(t.y-e.y)}function dr(n,e){return n.x===e.x&&n.y===e.y}function Cf(n,e,t,i){let s=Ho(Yt(n,e,t)),r=Ho(Yt(n,e,i)),a=Ho(Yt(t,i,n)),o=Ho(Yt(t,i,e));return!!(s!==r&&a!==o||s===0&&ko(n,t,e)||r===0&&ko(n,i,e)||a===0&&ko(t,n,i)||o===0&&ko(t,e,i))}function ko(n,e,t){return e.x<=Math.max(n.x,t.x)&&e.x>=Math.min(n.x,t.x)&&e.y<=Math.max(n.y,t.y)&&e.y>=Math.min(n.y,t.y)}function Ho(n){return n>0?1:n<0?-1:0}function y0(n,e){let t=n;do{if(t.i!==n.i&&t.next.i!==n.i&&t.i!==e.i&&t.next.i!==e.i&&Cf(t,t.next,n,e))return!0;t=t.next}while(t!==n);return!1}function ya(n,e){return Yt(n.prev,n,n.next)<0?Yt(n,e,n.next)>=0&&Yt(n,n.prev,e)>=0:Yt(n,e,n.prev)<0||Yt(n,n.next,e)<0}function _0(n,e){let t=n,i=!1,s=(n.x+e.x)/2,r=(n.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==n);return i}function If(n,e){let t=Dh(n.i,n.x,n.y),i=Dh(e.i,e.x,e.y),s=n.next,r=e.prev;return n.next=e,e.prev=n,t.next=s,s.prev=t,i.next=t,t.prev=i,r.next=i,i.prev=r,i}function Ld(n,e,t,i){let s=Dh(n,e,t);return i?(s.next=i.next,s.prev=i,i.next.prev=s,i.next=s):(s.prev=s,s.next=s),s}function _a(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function Dh(n,e,t){return{i:n,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function v0(n,e,t,i){let s=0;for(let r=e,a=t-i;r<t;r+=i)s+=(n[a]-n[r])*(n[r+1]+n[a+1]),a=r;return s}var Lh=class{static triangulate(e,t,i=2){return s0(e,t,i)}},bs=class n{static area(e){let t=e.length,i=0;for(let s=t-1,r=0;r<t;s=r++)i+=e[s].x*e[r].y-e[r].x*e[s].y;return i*.5}static isClockWise(e){return n.area(e)<0}static triangulateShape(e,t){let i=[],s=[],r=[];Nd(e),Ud(i,e);let a=e.length;t.forEach(Nd);for(let l=0;l<t.length;l++)s.push(a),a+=t[l].length,Ud(i,t[l]);let o=Lh.triangulate(i,s);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}};function Nd(n){let e=n.length;e>2&&n[e-1].equals(n[0])&&n.pop()}function Ud(n,e){for(let t=0;t<e.length;t++)n.push(e[t].x),n.push(e[t].y)}var va=class n extends Et{constructor(e=new ur([new he(.5,.5),new he(-.5,.5),new he(-.5,-.5),new he(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let i=this,s=[],r=[];for(let o=0,l=e.length;o<l;o++){let c=e[o];a(c)}this.setAttribute("position",new it(s,3)),this.setAttribute("uv",new it(r,2)),this.computeVertexNormals();function a(o){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,u=t.depth!==void 0?t.depth:1,d=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,m=t.bevelSize!==void 0?t.bevelSize:f-.1,M=t.bevelOffset!==void 0?t.bevelOffset:0,g=t.bevelSegments!==void 0?t.bevelSegments:3,p=t.extrudePath,b=t.UVGenerator!==void 0?t.UVGenerator:M0,_,x=!1,S,T,A,y;if(p){_=p.getSpacedPoints(h),x=!0,d=!1;let oe=p.isCatmullRomCurve3?p.closed:!1;S=p.computeFrenetFrames(h,oe),T=new P,A=new P,y=new P}d||(g=0,f=0,m=0,M=0);let w=o.extractPoints(c),R=w.shape,L=w.holes;if(!bs.isClockWise(R)){R=R.reverse();for(let oe=0,ue=L.length;oe<ue;oe++){let de=L[oe];bs.isClockWise(de)&&(L[oe]=de.reverse())}}function z(oe){let de=10000000000000001e-36,fe=oe[0];for(let Me=1;Me<=oe.length;Me++){let ze=Me%oe.length,Ve=oe[ze],Ke=Ve.x-fe.x,et=Ve.y-fe.y,B=Ke*Ke+et*et,Rt=Math.max(Math.abs(Ve.x),Math.abs(Ve.y),Math.abs(fe.x),Math.abs(fe.y)),rt=de*Rt*Rt;if(B<=rt){oe.splice(ze,1),Me--;continue}fe=Ve}}z(R),L.forEach(z);let I=L.length,U=R;for(let oe=0;oe<I;oe++){let ue=L[oe];R=R.concat(ue)}function G(oe,ue,de){return ue||tt("ExtrudeGeometry: vec does not exist"),oe.clone().addScaledVector(ue,de)}let W=R.length;function K(oe,ue,de){let fe,Me,ze,Ve=oe.x-ue.x,Ke=oe.y-ue.y,et=de.x-oe.x,B=de.y-oe.y,Rt=Ve*Ve+Ke*Ke,rt=Ve*B-Ke*et;if(Math.abs(rt)>Number.EPSILON){let C=Math.sqrt(Rt),v=Math.sqrt(et*et+B*B),V=ue.x-Ke/C,Z=ue.y+Ve/C,te=de.x-B/v,xe=de.y+et/v,ve=((te-V)*B-(xe-Z)*et)/(Ve*B-Ke*et);fe=V+Ve*ve-oe.x,Me=Z+Ke*ve-oe.y;let ie=fe*fe+Me*Me;if(ie<=2)return new he(fe,Me);ze=Math.sqrt(ie/2)}else{let C=!1;Ve>Number.EPSILON?et>Number.EPSILON&&(C=!0):Ve<-Number.EPSILON?et<-Number.EPSILON&&(C=!0):Math.sign(Ke)===Math.sign(B)&&(C=!0),C?(fe=-Ke,Me=Ve,ze=Math.sqrt(Rt)):(fe=Ve,Me=Ke,ze=Math.sqrt(Rt/2))}return new he(fe/ze,Me/ze)}let X=[];for(let oe=0,ue=U.length,de=ue-1,fe=oe+1;oe<ue;oe++,de++,fe++)de===ue&&(de=0),fe===ue&&(fe=0),X[oe]=K(U[oe],U[de],U[fe]);let $=[],ne,Ie=X.concat();for(let oe=0,ue=I;oe<ue;oe++){let de=L[oe];ne=[];for(let fe=0,Me=de.length,ze=Me-1,Ve=fe+1;fe<Me;fe++,ze++,Ve++)ze===Me&&(ze=0),Ve===Me&&(Ve=0),ne[fe]=K(de[fe],de[ze],de[Ve]);$.push(ne),Ie=Ie.concat(ne)}let Ce;if(g===0)Ce=bs.triangulateShape(U,L);else{let oe=[],ue=[];for(let de=0;de<g;de++){let fe=de/g,Me=f*Math.cos(fe*Math.PI/2),ze=m*Math.sin(fe*Math.PI/2)+M;for(let Ve=0,Ke=U.length;Ve<Ke;Ve++){let et=G(U[Ve],X[Ve],ze);ge(et.x,et.y,-Me),fe===0&&oe.push(et)}for(let Ve=0,Ke=I;Ve<Ke;Ve++){let et=L[Ve];ne=$[Ve];let B=[];for(let Rt=0,rt=et.length;Rt<rt;Rt++){let C=G(et[Rt],ne[Rt],ze);ge(C.x,C.y,-Me),fe===0&&B.push(C)}fe===0&&ue.push(B)}}Ce=bs.triangulateShape(oe,ue)}let gt=Ce.length,Ye=m+M;for(let oe=0;oe<W;oe++){let ue=d?G(R[oe],Ie[oe],Ye):R[oe];x?(A.copy(S.normals[0]).multiplyScalar(ue.x),T.copy(S.binormals[0]).multiplyScalar(ue.y),y.copy(_[0]).add(A).add(T),ge(y.x,y.y,y.z)):ge(ue.x,ue.y,0)}for(let oe=1;oe<=h;oe++)for(let ue=0;ue<W;ue++){let de=d?G(R[ue],Ie[ue],Ye):R[ue];x?(A.copy(S.normals[oe]).multiplyScalar(de.x),T.copy(S.binormals[oe]).multiplyScalar(de.y),y.copy(_[oe]).add(A).add(T),ge(y.x,y.y,y.z)):ge(de.x,de.y,u/h*oe)}for(let oe=g-1;oe>=0;oe--){let ue=oe/g,de=f*Math.cos(ue*Math.PI/2),fe=m*Math.sin(ue*Math.PI/2)+M;for(let Me=0,ze=U.length;Me<ze;Me++){let Ve=G(U[Me],X[Me],fe);ge(Ve.x,Ve.y,u+de)}for(let Me=0,ze=L.length;Me<ze;Me++){let Ve=L[Me];ne=$[Me];for(let Ke=0,et=Ve.length;Ke<et;Ke++){let B=G(Ve[Ke],ne[Ke],fe);x?ge(B.x,B.y+_[h-1].y,_[h-1].x+de):ge(B.x,B.y,u+de)}}}ct(),ee();function ct(){let oe=s.length/3;if(d){let ue=0,de=W*ue;for(let fe=0;fe<gt;fe++){let Me=Ce[fe];$e(Me[2]+de,Me[1]+de,Me[0]+de)}ue=h+g*2,de=W*ue;for(let fe=0;fe<gt;fe++){let Me=Ce[fe];$e(Me[0]+de,Me[1]+de,Me[2]+de)}}else{for(let ue=0;ue<gt;ue++){let de=Ce[ue];$e(de[2],de[1],de[0])}for(let ue=0;ue<gt;ue++){let de=Ce[ue];$e(de[0]+W*h,de[1]+W*h,de[2]+W*h)}}i.addGroup(oe,s.length/3-oe,0)}function ee(){let oe=s.length/3,ue=0;ae(U,ue),ue+=U.length;for(let de=0,fe=L.length;de<fe;de++){let Me=L[de];ae(Me,ue),ue+=Me.length}i.addGroup(oe,s.length/3-oe,1)}function ae(oe,ue){let de=oe.length;for(;--de>=0;){let fe=de,Me=de-1;Me<0&&(Me=oe.length-1);for(let ze=0,Ve=h+g*2;ze<Ve;ze++){let Ke=W*ze,et=W*(ze+1),B=ue+fe+Ke,Rt=ue+Me+Ke,rt=ue+Me+et,C=ue+fe+et;be(B,Rt,rt,C)}}}function ge(oe,ue,de){l.push(oe),l.push(ue),l.push(de)}function $e(oe,ue,de){Qe(oe),Qe(ue),Qe(de);let fe=s.length/3,Me=b.generateTopUV(i,s,fe-3,fe-2,fe-1);At(Me[0]),At(Me[1]),At(Me[2])}function be(oe,ue,de,fe){Qe(oe),Qe(ue),Qe(fe),Qe(ue),Qe(de),Qe(fe);let Me=s.length/3,ze=b.generateSideWallUV(i,s,Me-6,Me-3,Me-2,Me-1);At(ze[0]),At(ze[1]),At(ze[3]),At(ze[1]),At(ze[2]),At(ze[3])}function Qe(oe){s.push(l[oe*3+0]),s.push(l[oe*3+1]),s.push(l[oe*3+2])}function At(oe){r.push(oe.x),r.push(oe.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,i=this.parameters.options;return b0(t,i,e)}static fromJSON(e,t){let i=[];for(let r=0,a=e.shapes.length;r<a;r++){let o=t[e.shapes[r]];i.push(o)}let s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new Ih[s.type]().fromJSON(s)),new n(i,e.options)}},M0={generateTopUV:function(n,e,t,i,s){let r=e[t*3],a=e[t*3+1],o=e[i*3],l=e[i*3+1],c=e[s*3],h=e[s*3+1];return[new he(r,a),new he(o,l),new he(c,h)]},generateSideWallUV:function(n,e,t,i,s,r){let a=e[t*3],o=e[t*3+1],l=e[t*3+2],c=e[i*3],h=e[i*3+1],u=e[i*3+2],d=e[s*3],f=e[s*3+1],m=e[s*3+2],M=e[r*3],g=e[r*3+1],p=e[r*3+2];return Math.abs(o-h)<Math.abs(a-c)?[new he(a,1-l),new he(c,1-u),new he(d,1-m),new he(M,1-p)]:[new he(o,1-l),new he(h,1-u),new he(f,1-m),new he(g,1-p)]}};function b0(n,e,t){if(t.shapes=[],Array.isArray(n))for(let i=0,s=n.length;i<s;i++){let r=n[i];t.shapes.push(r.uuid)}else t.shapes.push(n.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var zn=class n extends ll{constructor(e=1,t=0){let i=(1+Math.sqrt(5))/2,s=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new n(e.radius,e.detail)}},Ma=class n extends Et{constructor(e=[new he(0,-.5),new he(.5,0),new he(0,.5)],t=12,i=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:i,phiLength:s},t=Math.floor(t),s=dt(s,0,Math.PI*2);let r=[],a=[],o=[],l=[],c=[],h=1/t,u=new P,d=new he,f=new P,m=new P,M=new P,g=0,p=0;for(let b=0;b<=e.length-1;b++)switch(b){case 0:g=e[b+1].x-e[b].x,p=e[b+1].y-e[b].y,f.x=p*1,f.y=-g,f.z=p*0,M.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case e.length-1:l.push(M.x,M.y,M.z);break;default:g=e[b+1].x-e[b].x,p=e[b+1].y-e[b].y,f.x=p*1,f.y=-g,f.z=p*0,m.copy(f),f.x+=M.x,f.y+=M.y,f.z+=M.z,f.normalize(),l.push(f.x,f.y,f.z),M.copy(m)}for(let b=0;b<=t;b++){let _=i+b*h*s,x=Math.sin(_),S=Math.cos(_);for(let T=0;T<=e.length-1;T++){u.x=e[T].x*x,u.y=e[T].y,u.z=e[T].x*S,a.push(u.x,u.y,u.z),d.x=b/t,d.y=T/(e.length-1),o.push(d.x,d.y);let A=l[3*T+0]*x,y=l[3*T+1],w=l[3*T+0]*S;c.push(A,y,w)}}for(let b=0;b<t;b++)for(let _=0;_<e.length-1;_++){let x=_+b*e.length,S=x,T=x+e.length,A=x+e.length+1,y=x+1;r.push(S,T,y),r.push(A,y,T)}this.setIndex(r),this.setAttribute("position",new it(a,3)),this.setAttribute("uv",new it(o,2)),this.setAttribute("normal",new it(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.points,e.segments,e.phiStart,e.phiLength)}};var mn=class n extends Et{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(i),l=Math.floor(s),c=o+1,h=l+1,u=e/o,d=t/l,f=[],m=[],M=[],g=[];for(let p=0;p<h;p++){let b=p*d-a;for(let _=0;_<c;_++){let x=_*u-r;m.push(x,-b,0),M.push(0,0,1),g.push(_/o),g.push(1-p/l)}}for(let p=0;p<l;p++)for(let b=0;b<o;b++){let _=b+c*p,x=b+c*(p+1),S=b+1+c*(p+1),T=b+1+c*p;f.push(_,x,T),f.push(x,S,T)}this.setIndex(f),this.setAttribute("position",new it(m,3)),this.setAttribute("normal",new it(M,3)),this.setAttribute("uv",new it(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.widthSegments,e.heightSegments)}},Jn=class n extends Et{constructor(e=.5,t=1,i=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:s,thetaStart:r,thetaLength:a},i=Math.max(3,i),s=Math.max(1,s);let o=[],l=[],c=[],h=[],u=e,d=(t-e)/s,f=new P,m=new he;for(let M=0;M<=s;M++){for(let g=0;g<=i;g++){let p=r+g/i*a;f.x=u*Math.cos(p),f.y=u*Math.sin(p),l.push(f.x,f.y,f.z),c.push(0,0,1),m.x=(f.x/t+1)/2,m.y=(f.y/t+1)/2,h.push(m.x,m.y)}u+=d}for(let M=0;M<s;M++){let g=M*(i+1);for(let p=0;p<i;p++){let b=p+g,_=b,x=b+i+1,S=b+i+2,T=b+1;o.push(_,x,T),o.push(x,S,T)}}this.setIndex(o),this.setAttribute("position",new it(l,3)),this.setAttribute("normal",new it(c,3)),this.setAttribute("uv",new it(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}};var ft=class n extends Et{constructor(e=1,t=32,i=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));let l=Math.min(a+o,Math.PI),c=0,h=[],u=new P,d=new P,f=[],m=[],M=[],g=[];for(let p=0;p<=i;p++){let b=[],_=p/i,x=a+_*o,S=e*Math.cos(x),T=Math.sqrt(e*e-S*S),A=0;p===0&&a===0?A=.5/t:p===i&&l===Math.PI&&(A=-.5/t);for(let y=0;y<=t;y++){let w=y/t,R=s+w*r;u.x=-T*Math.cos(R),u.y=S,u.z=T*Math.sin(R),m.push(u.x,u.y,u.z),d.copy(u).normalize(),M.push(d.x,d.y,d.z),g.push(w+A,1-_),b.push(c++)}h.push(b)}for(let p=0;p<i;p++)for(let b=0;b<t;b++){let _=h[p][b+1],x=h[p][b],S=h[p+1][b],T=h[p+1][b+1];(p!==0||a>0)&&f.push(_,x,T),(p!==i-1||l<Math.PI)&&f.push(x,S,T)}this.setIndex(f),this.setAttribute("position",new it(m,3)),this.setAttribute("normal",new it(M,3)),this.setAttribute("uv",new it(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var Tt=class n extends Et{constructor(e=1,t=.4,i=12,s=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:s,arc:r,thetaStart:a,thetaLength:o},i=Math.floor(i),s=Math.floor(s);let l=[],c=[],h=[],u=[],d=new P,f=new P,m=new P;for(let M=0;M<=i;M++){let g=a+M/i*o;for(let p=0;p<=s;p++){let b=p/s*r;f.x=(e+t*Math.cos(g))*Math.cos(b),f.y=(e+t*Math.cos(g))*Math.sin(b),f.z=t*Math.sin(g),c.push(f.x,f.y,f.z),d.x=e*Math.cos(b),d.y=e*Math.sin(b),m.subVectors(f,d).normalize(),h.push(m.x,m.y,m.z),u.push(p/s),u.push(M/i)}}for(let M=1;M<=i;M++)for(let g=1;g<=s;g++){let p=(s+1)*M+g-1,b=(s+1)*(M-1)+g-1,_=(s+1)*(M-1)+g,x=(s+1)*M+g;l.push(p,b,x),l.push(b,_,x)}this.setIndex(l),this.setAttribute("position",new it(c,3)),this.setAttribute("normal",new it(h,3)),this.setAttribute("uv",new it(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc,e.thetaStart,e.thetaLength)}};function Ds(n){let e={};for(let t in n){e[t]={};for(let i in n[t]){let s=n[t][i];if(Fd(s))s.isRenderTargetTexture?(Je("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone();else if(Array.isArray(s))if(Fd(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][i]=r}else e[t][i]=s.slice();else e[t][i]=s}}return e}function Tn(n){let e={};for(let t=0;t<n.length;t++){let i=Ds(n[t]);for(let s in i)e[s]=i[s]}return e}function Fd(n){return n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)}function S0(n){let e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function tu(n){let e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:yt.workingColorSpace}var Ui={clone:Ds,merge:Tn},E0=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,T0=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Bt=class extends oi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=E0,this.fragmentShader=T0,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ds(e.uniforms),this.uniformsGroups=S0(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let i in e.uniforms){let s=e.uniforms[i];switch(this.uniforms[i]={},s.type){case"t":this.uniforms[i].value=t[s.value]||null;break;case"c":this.uniforms[i].value=new Ue().setHex(s.value);break;case"v2":this.uniforms[i].value=new he().fromArray(s.value);break;case"v3":this.uniforms[i].value=new P().fromArray(s.value);break;case"v4":this.uniforms[i].value=new Xt().fromArray(s.value);break;case"m3":this.uniforms[i].value=new at().fromArray(s.value);break;case"m4":this.uniforms[i].value=new Mt().fromArray(s.value);break;default:this.uniforms[i].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},fr=class extends Bt{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Gn=class extends oi{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ue(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ue(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Xa,this.normalScale=new he(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Di,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},pr=class extends Gn{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new he(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return dt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Ue(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ue(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ue(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(e){this._retroreflectivity>0!=e>0&&this.version++,this._retroreflectivity=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.retroreflectivity=e.retroreflectivity,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var ba=class extends oi{constructor(e){super(),this.isMeshToonMaterial=!0,this.defines={TOON:""},this.type="MeshToonMaterial",this.color=new Ue(16777215),this.map=null,this.gradientMap=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ue(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Xa,this.normalScale=new he(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.gradientMap=e.gradientMap,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.alphaMap=e.alphaMap,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var ml=class extends oi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=df,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},gl=class extends oi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Zs(n,e){return!n||n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function Sh(n){return n!==void 0&&n.inTangents!==void 0&&n.outTangents!==void 0}var ns=class{constructor(e,t,i,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,s=t[i],r=t[i-1];n:{e:{let a;t:{i:if(!(e<s)){for(let o=i+2;;){if(s===void 0){if(e<r)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===o)break;if(r=s,s=t[++i],e<s)break e}a=t.length;break t}if(!(e>=r)){let o=t[1];e<o&&(i=2,r=o);for(let l=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(s=r,r=t[--i-1],e>=r)break e}a=i,i=0;break t}break n}for(;i<a;){let o=i+a>>>1;e<t[o]?a=o:i=o+1}if(s=t[i],r=t[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,s)}return this.interpolate_(i,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=i[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},xl=class extends ns{constructor(e,t,i,s){super(e,t,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:wh,endingEnd:wh}}intervalChanged_(e,t,i){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case Ah:r=e,o=2*t-i;break;case Rh:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=i}if(l===void 0)switch(this.getSettings_().endingEnd){case Ah:a=e,l=2*i-t;break;case Rh:a=1,l=i+s[1]-s[0];break;default:a=e-1,l=t}let c=(i-t)*.5,h=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-i),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,m=(i-t)/(s-t),M=m*m,g=M*m,p=-d*g+2*d*M-d*m,b=(1+d)*g+(-1.5-2*d)*M+(-.5+d)*m+1,_=(-1-f)*g+(1.5+f)*M+.5*m,x=f*g-f*M;for(let S=0;S!==o;++S)r[S]=p*a[h+S]+b*a[c+S]+_*a[l+S]+x*a[u+S];return r}},yl=class extends ns{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=(i-t)/(s-t),u=1-h;for(let d=0;d!==o;++d)r[d]=a[c+d]*u+a[l+d]*h;return r}},_l=class extends ns{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e){return this.copySampleValue_(e-1)}},vl=class extends ns{interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this.inTangents,u=this.outTangents;if(!h||!u){let m=(i-t)/(s-t),M=1-m;for(let g=0;g!==o;++g)r[g]=a[c+g]*M+a[l+g]*m;return r}let d=o*2,f=e-1;for(let m=0;m!==o;++m){let M=a[c+m],g=a[l+m],p=f*d+m*2,b=u[p],_=u[p+1],x=e*d+m*2,S=h[x],T=h[x+1],A=A0(i,t,b,S,s);r[m]=Pf(A,M,_,T,g)}return r}};function Pf(n,e,t,i,s){let r=1-n;return r*r*r*e+3*r*r*n*t+3*r*n*n*i+n*n*n*s}function w0(n,e,t,i,s){let r=1-n;return 3*r*r*(t-e)+6*r*n*(i-t)+3*n*n*(s-i)}function A0(n,e,t,i,s){let r=(n-e)/(s-e);for(let a=0;a<8;a++){let o=Pf(r,e,t,i,s)-n;if(Math.abs(o)<1e-10)break;let l=w0(r,e,t,i,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var Vn=class{constructor(e,t,i,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Zs(t,this.TimeBufferType),this.values=Zs(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:Zs(e.times,Array),values:Zs(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(i.interpolation=s),Sh(e.settings)&&(i.settings={inTangents:Zs(e.settings.inTangents,Array),outTangents:Zs(e.settings.outTangents,Array)})}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new _l(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new yl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new xl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new vl(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case jr:t=this.InterpolantFactoryMethodDiscrete;break;case Qo:t=this.InterpolantFactoryMethodLinear;break;case Vo:t=this.InterpolantFactoryMethodSmooth;break;case Th:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return Je("KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return jr;case this.InterpolantFactoryMethodLinear:return Qo;case this.InterpolantFactoryMethodSmooth:return Vo;case this.InterpolantFactoryMethodBezier:return Th}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]*=e;Sh(this.settings)&&(Bd(this.settings.inTangents,e),Bd(this.settings.outTangents,e))}return this}trim(e,t){let i=this.times,s=i.length,r=0,a=s-1;for(;r!==s&&i[r]<e;)++r;for(;a!==-1&&i[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=i.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(tt("KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,s=this.values,r=i.length;r===0&&(tt("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let l=i[o];if(typeof l=="number"&&isNaN(l)){tt("KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){tt("KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(s!==void 0&&mm(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){tt("KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===Vo,r=e.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=e[o],h=e[o+1];if(c!==h&&(o!==1||c!==e[0]))if(s)l=!0;else{let u=o*i,d=u-i,f=u+i;for(let m=0;m!==i;++m){let M=t[u+m];if(M!==t[d+m]||M!==t[f+m]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let u=o*i,d=a*i;for(let f=0;f!==i;++f)t[d+f]=t[u+f]}++a}}if(r>0){e[a]=e[r];for(let o=r*i,l=a*i,c=0;c!==i;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,s=new i(this.name,e,t);return s.createInterpolant=this.createInterpolant,Sh(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function Bd(n,e){for(let t=0,i=n.length;t!==i;t+=2)n[t]*=e}Vn.prototype.ValueTypeName="";Vn.prototype.TimeBufferType=Float32Array;Vn.prototype.ValueBufferType=Float32Array;Vn.prototype.DefaultInterpolation=Qo;var is=class extends Vn{constructor(e,t,i){super(e,t,i)}};is.prototype.ValueTypeName="bool";is.prototype.ValueBufferType=Array;is.prototype.DefaultInterpolation=jr;is.prototype.InterpolantFactoryMethodLinear=void 0;is.prototype.InterpolantFactoryMethodSmooth=void 0;var Ml=class extends Vn{constructor(e,t,i,s){super(e,t,i,s)}};Ml.prototype.ValueTypeName="color";var bl=class extends Vn{constructor(e,t,i,s){super(e,t,i,s)}};bl.prototype.ValueTypeName="number";var Sl=class extends ns{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(i-t)/(s-t),c=e*o;for(let h=c+o;c!==h;c+=4)$n.slerpFlat(r,0,a,c-o,a,c,l);return r}},Sa=class extends Vn{constructor(e,t,i,s){super(e,t,i,s)}InterpolantFactoryMethodLinear(e){return new Sl(this.times,this.values,this.getValueSize(),e)}};Sa.prototype.ValueTypeName="quaternion";Sa.prototype.InterpolantFactoryMethodSmooth=void 0;var ss=class extends Vn{constructor(e,t,i){super(e,t,i)}};ss.prototype.ValueTypeName="string";ss.prototype.ValueBufferType=Array;ss.prototype.DefaultInterpolation=jr;ss.prototype.InterpolantFactoryMethodLinear=void 0;ss.prototype.InterpolantFactoryMethodSmooth=void 0;var El=class extends Vn{constructor(e,t,i,s){super(e,t,i,s)}};El.prototype.ValueTypeName="vector";var Tl=class{constructor(e,t,i){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this._abortController=null,this.itemStart=function(h){o++,r===!1&&s.onStart!==void 0&&s.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,s.onProgress!==void 0&&s.onProgress(h,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){let f=c[u],m=c[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return m}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Df=new Tl,wl=class{constructor(e){this.manager=e!==void 0?e:Df,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let i=this;return new Promise(function(s,r){i.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};wl.DEFAULT_MATERIAL_NAME="__DEFAULT";var mr=class extends nn{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ue(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Ea=class extends mr{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(nn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ue(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Eh=new Mt,Od=new P,kd=new P,Ta=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new he(512,512),this.mapType=Un,this.map=null,this.mapPass=null,this.matrix=new Mt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new lr,this._frameExtents=new he(1,1),this._viewportCount=1,this._viewports=[new Xt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;Od.setFromMatrixPosition(e.matrixWorld),t.position.copy(Od),kd.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(kd),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,i,s){Eh.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),i.setFromProjectionMatrix(Eh,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===tr||e.reversedDepth?t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(Eh)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},zo=new P,Go=new $n,mi=new P,wa=class extends nn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Mt,this.projectionMatrix=new Mt,this.projectionMatrixInverse=new Mt,this.coordinateSystem=ai,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(zo,Go,mi),mi.x===1&&mi.y===1&&mi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(zo,Go,mi.set(1,1,1)).invert()}updateWorldMatrix(e,t,i=!1){super.updateWorldMatrix(e,t,i),this.matrixWorld.decompose(zo,Go,mi),mi.x===1&&mi.y===1&&mi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(zo,Go,mi.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Qi=new P,Hd=new he,zd=new he,gn=class extends wa{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=ir*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(js*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ir*2*Math.atan(Math.tan(js*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Qi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Qi.x,Qi.y).multiplyScalar(-e/Qi.z),Qi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Qi.x,Qi.y).multiplyScalar(-e/Qi.z)}getViewSize(e,t){return this.getViewBounds(e,Hd,zd),t.subVectors(zd,Hd)}setViewOffset(e,t,i,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(js*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*i/c,s*=a.width/l,i*=a.height/c}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var Nh=class extends Ta{constructor(){super(new gn(90,1,.5,500)),this.isPointLightShadow=!0}},Aa=class extends mr{constructor(e,t,i=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=s,this.shadow=new Nh}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},rs=class extends wa{constructor(e=-1,t=1,i=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=i-e,a=i+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Uh=class extends Ta{constructor(){super(new rs(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ra=class extends mr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(nn.DEFAULT_UP),this.updateMatrix(),this.target=new nn,this.shadow=new Uh}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var $s=-90,Js=1,Al=class extends nn{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new gn($s,Js,e,t);s.layers=this.layers,this.add(s);let r=new gn($s,Js,e,t);r.layers=this.layers,this.add(r);let a=new gn($s,Js,e,t);a.layers=this.layers,this.add(a);let o=new gn($s,Js,e,t);o.layers=this.layers,this.add(o);let l=new gn($s,Js,e,t);l.layers=this.layers,this.add(l);let c=new gn($s,Js,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,s,r,a,o,l]=t;for(let c of t)this.remove(c);if(e===ai)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===tr)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,h]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;let M=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let g=!1;e.isWebGLRenderer===!0?g=e.state.buffers.depth.getReversed():g=e.reversedDepthBuffer,e.setRenderTarget(i,0,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(i,1,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(i,2,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(i,3,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(i,4,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),i.texture.generateMipmaps=M,e.setRenderTarget(i,5,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(u,d,f),e.xr.enabled=m,i.texture.needsPMREMUpdate=!0}},Rl=class extends gn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},Ca=class{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(e){this._document=e,e.hidden!==void 0&&(this._pageVisibilityHandler=R0.bind(this),e.addEventListener("visibilitychange",this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener("visibilitychange",this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(e){return this._timescale=e,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(e){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(e!==void 0?e:performance.now())-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}};function R0(){this._document.hidden===!1&&this.reset()}var nu="\\[\\]\\.:\\/",C0=new RegExp("["+nu+"]","g"),iu="[^"+nu+"]",I0="[^"+nu.replace("\\.","")+"]",P0=/((?:WC+[\/:])*)/.source.replace("WC",iu),D0=/(WCOD+)?/.source.replace("WCOD",I0),L0=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",iu),N0=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",iu),U0=new RegExp("^"+P0+D0+L0+N0+"$"),F0=["material","materials","bones","map"],Fh=class{constructor(e,t,i){let s=i||Wt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=i.length;s!==r;++s)i[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},Wt=class n{constructor(e,t,i){this.path=t,this.parsedPath=i||n.parseTrackName(t),this.node=n.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new n.Composite(e,t,i):new n(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(C0,"")}static parseTrackName(e){let t=U0.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=i.nodeName.substring(s+1);F0.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){let i=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let l=i(o.children);if(l)return l}return null},s=i(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)e[t++]=i[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,i=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=n.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Je("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=t.objectIndex;switch(i){case"materials":if(!e.material){tt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){tt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){tt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){tt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){tt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){tt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(c!==void 0){if(e[c]===void 0){tt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let a=e[s];if(a===void 0){let c=t.nodeName;tt("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){tt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){tt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Wt.Composite=Fh;Wt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Wt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Wt.prototype.GetterByBindingType=[Wt.prototype._getValue_direct,Wt.prototype._getValue_array,Wt.prototype._getValue_arrayElement,Wt.prototype._getValue_toArray];Wt.prototype.SetterByBindingTypeAndVersioning=[[Wt.prototype._setValue_direct,Wt.prototype._setValue_direct_setNeedsUpdate,Wt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Wt.prototype._setValue_array,Wt.prototype._setValue_array_setNeedsUpdate,Wt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Wt.prototype._setValue_arrayElement,Wt.prototype._setValue_arrayElement_setNeedsUpdate,Wt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Wt.prototype._setValue_fromArray,Wt.prototype._setValue_fromArray_setNeedsUpdate,Wt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var JM=new Float32Array(1);var cu=class cu{constructor(e,t,i,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,i,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let i=0;i<4;i++)this.elements[i]=e[i+t];return this}set(e,t,i,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=i,r[3]=s,this}};cu.prototype.isMatrix2=!0;var Bh=cu;function su(n,e,t,i){let s=B0(i);switch(t){case $h:return n*e;case Bl:return n*e/s.components*s.byteLength;case Ol:return n*e/s.components*s.byteLength;case us:return n*e*2/s.components*s.byteLength;case kl:return n*e*2/s.components*s.byteLength;case Jh:return n*e*3/s.components*s.byteLength;case Fn:return n*e*4/s.components*s.byteLength;case Hl:return n*e*4/s.components*s.byteLength;case ka:case Ha:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case za:case Ga:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Gl:case Wl:return Math.max(n,16)*Math.max(e,8)/4;case zl:case Vl:return Math.max(n,8)*Math.max(e,8)/2;case Xl:case ql:case Zl:case $l:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Yl:case Va:case Jl:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case Kl:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case jl:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case Ql:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case ec:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case tc:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case nc:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case ic:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case sc:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case rc:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case ac:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case oc:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case lc:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case cc:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case hc:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case uc:case dc:case fc:return Math.ceil(n/4)*Math.ceil(e/4)*16;case pc:case mc:return Math.ceil(n/4)*Math.ceil(e/4)*8;case Wa:case gc:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function B0(n){switch(n){case Un:case Xh:return{byteLength:1,components:1};case xr:case qh:case yn:return{byteLength:2,components:1};case Ul:case Fl:return{byteLength:2,components:4};case ci:case Nl:case jn:return{byteLength:4,components:1};case Yh:case Zh:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Je("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function ep(){let n=null,e=!1,t=null,i=null;function s(r,a){i=n.requestAnimationFrame(s),t(r,a)}return{start:function(){e!==!0&&t!==null&&n!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n!==null&&n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function W0(n){let e=new WeakMap;function t(o,l){let c=o.array,h=o.usage,u=c.byteLength,d=n.createBuffer();n.bindBuffer(l,d),n.bufferData(l,c,h),o.onUploadCallback();let f;if(c instanceof Float32Array)f=n.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=n.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=n.HALF_FLOAT:f=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=n.SHORT;else if(c instanceof Uint32Array)f=n.UNSIGNED_INT;else if(c instanceof Int32Array)f=n.INT;else if(c instanceof Int8Array)f=n.BYTE;else if(c instanceof Uint8Array)f=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function i(o,l,c){let h=l.array,u=l.updateRanges;if(n.bindBuffer(c,o),u.length===0)n.bufferSubData(c,0,h);else{u.sort((f,m)=>f.start-m.start);let d=0;for(let f=1;f<u.length;f++){let m=u[d],M=u[f];M.start<=m.start+m.count+1?m.count=Math.max(m.count,M.start+M.count-m.start):(++d,u[d]=M)}u.length=d+1;for(let f=0,m=u.length;f<m;f++){let M=u[f];n.bufferSubData(c,M.start*h.BYTES_PER_ELEMENT,h,M.start,M.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=e.get(o);l&&(n.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var X0=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,q0=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Y0=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Z0=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,$0=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,J0=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,K0=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,j0=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Q0=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,eg=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,tg=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,ng=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,ig=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,sg=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,rg=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,ag=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,og=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,lg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,cg=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,hg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,ug=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,dg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,fg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,pg=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,mg=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,gg=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,xg=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,yg=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,_g=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,vg=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Mg="gl_FragColor = linearToOutputTexel( gl_FragColor );",bg=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Sg=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Eg=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Tg=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,wg=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Ag=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Rg=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Cg=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Ig=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Pg=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Dg=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Lg=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Ng=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Ug=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Fg=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Bg=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Og=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,kg=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Hg=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,zg=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Gg=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Vg=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Wg=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Xg=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,qg=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Yg=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Zg=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,$g=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Jg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Kg=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,jg=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Qg=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,ex=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,tx=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,nx=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,ix=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,sx=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,rx=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,ax=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,ox=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,lx=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,cx=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,hx=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,ux=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,dx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,fx=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,px=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,mx=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,gx=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,xx=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,yx=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,_x=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,vx=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,Mx=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,bx=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Sx=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Ex=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Tx=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,wx=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Ax=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,Rx=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Cx=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Ix=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Px=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Dx=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Lx=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Nx=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Ux=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Fx=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Bx=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Ox=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,kx=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Hx=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,zx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Gx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Vx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Wx=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Xx=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,qx=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Yx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Zx=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,$x=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Jx=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Kx=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,jx=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Qx=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,ey=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,ty=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,ny=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,iy=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sy=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,ry=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,ay=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,oy=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ly=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,cy=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,hy=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,uy=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,dy=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,fy=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,py=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,my=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,gy=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,xy=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,yy=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,_y=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,vy=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,My=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,by=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Sy=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Ey=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,pt={alphahash_fragment:X0,alphahash_pars_fragment:q0,alphamap_fragment:Y0,alphamap_pars_fragment:Z0,alphatest_fragment:$0,alphatest_pars_fragment:J0,aomap_fragment:K0,aomap_pars_fragment:j0,batching_pars_vertex:Q0,batching_vertex:eg,begin_vertex:tg,beginnormal_vertex:ng,bsdfs:ig,iridescence_fragment:sg,bumpmap_pars_fragment:rg,clipping_planes_fragment:ag,clipping_planes_pars_fragment:og,clipping_planes_pars_vertex:lg,clipping_planes_vertex:cg,color_fragment:hg,color_pars_fragment:ug,color_pars_vertex:dg,color_vertex:fg,common:pg,cube_uv_reflection_fragment:mg,defaultnormal_vertex:gg,displacementmap_pars_vertex:xg,displacementmap_vertex:yg,emissivemap_fragment:_g,emissivemap_pars_fragment:vg,colorspace_fragment:Mg,colorspace_pars_fragment:bg,envmap_fragment:Sg,envmap_common_pars_fragment:Eg,envmap_pars_fragment:Tg,envmap_pars_vertex:wg,envmap_physical_pars_fragment:Bg,envmap_vertex:Ag,fog_vertex:Rg,fog_pars_vertex:Cg,fog_fragment:Ig,fog_pars_fragment:Pg,gradientmap_pars_fragment:Dg,lightmap_pars_fragment:Lg,lights_lambert_fragment:Ng,lights_lambert_pars_fragment:Ug,lights_pars_begin:Fg,lights_toon_fragment:Og,lights_toon_pars_fragment:kg,lights_phong_fragment:Hg,lights_phong_pars_fragment:zg,lights_physical_fragment:Gg,lights_physical_pars_fragment:Vg,lights_fragment_begin:Wg,lights_fragment_maps:Xg,lights_fragment_end:qg,lightprobes_pars_fragment:Yg,logdepthbuf_fragment:Zg,logdepthbuf_pars_fragment:$g,logdepthbuf_pars_vertex:Jg,logdepthbuf_vertex:Kg,map_fragment:jg,map_pars_fragment:Qg,map_particle_fragment:ex,map_particle_pars_fragment:tx,metalnessmap_fragment:nx,metalnessmap_pars_fragment:ix,morphinstance_vertex:sx,morphcolor_vertex:rx,morphnormal_vertex:ax,morphtarget_pars_vertex:ox,morphtarget_vertex:lx,normal_fragment_begin:cx,normal_fragment_maps:hx,normal_pars_fragment:ux,normal_pars_vertex:dx,normal_vertex:fx,normalmap_pars_fragment:px,clearcoat_normal_fragment_begin:mx,clearcoat_normal_fragment_maps:gx,clearcoat_pars_fragment:xx,iridescence_pars_fragment:yx,opaque_fragment:_x,packing:vx,premultiplied_alpha_fragment:Mx,project_vertex:bx,dithering_fragment:Sx,dithering_pars_fragment:Ex,roughnessmap_fragment:Tx,roughnessmap_pars_fragment:wx,shadowmap_pars_fragment:Ax,shadowmap_pars_vertex:Rx,shadowmap_vertex:Cx,shadowmask_pars_fragment:Ix,skinbase_vertex:Px,skinning_pars_vertex:Dx,skinning_vertex:Lx,skinnormal_vertex:Nx,specularmap_fragment:Ux,specularmap_pars_fragment:Fx,tonemapping_fragment:Bx,tonemapping_pars_fragment:Ox,transmission_fragment:kx,transmission_pars_fragment:Hx,uv_pars_fragment:zx,uv_pars_vertex:Gx,uv_vertex:Vx,worldpos_vertex:Wx,background_vert:Xx,background_frag:qx,backgroundCube_vert:Yx,backgroundCube_frag:Zx,cube_vert:$x,cube_frag:Jx,depth_vert:Kx,depth_frag:jx,distance_vert:Qx,distance_frag:ey,equirect_vert:ty,equirect_frag:ny,linedashed_vert:iy,linedashed_frag:sy,meshbasic_vert:ry,meshbasic_frag:ay,meshlambert_vert:oy,meshlambert_frag:ly,meshmatcap_vert:cy,meshmatcap_frag:hy,meshnormal_vert:uy,meshnormal_frag:dy,meshphong_vert:fy,meshphong_frag:py,meshphysical_vert:my,meshphysical_frag:gy,meshtoon_vert:xy,meshtoon_frag:yy,points_vert:_y,points_frag:vy,shadow_vert:My,shadow_frag:by,sprite_vert:Sy,sprite_frag:Ey},Te={common:{diffuse:{value:new Ue(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new at},alphaMap:{value:null},alphaMapTransform:{value:new at},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new at}},envmap:{envMap:{value:null},envMapRotation:{value:new at},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new at}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new at}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new at},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new at},normalScale:{value:new he(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new at},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new at}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new at}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new at}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ue(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new P},probesMax:{value:new P},probesResolution:{value:new P}},points:{diffuse:{value:new Ue(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new at},alphaTest:{value:0},uvTransform:{value:new at}},sprite:{diffuse:{value:new Ue(16777215)},opacity:{value:1},center:{value:new he(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new at},alphaMap:{value:null},alphaMapTransform:{value:new at},alphaTest:{value:0}}},Si={basic:{uniforms:Tn([Te.common,Te.specularmap,Te.envmap,Te.aomap,Te.lightmap,Te.fog]),vertexShader:pt.meshbasic_vert,fragmentShader:pt.meshbasic_frag},lambert:{uniforms:Tn([Te.common,Te.specularmap,Te.envmap,Te.aomap,Te.lightmap,Te.emissivemap,Te.bumpmap,Te.normalmap,Te.displacementmap,Te.fog,Te.lights,{emissive:{value:new Ue(0)},envMapIntensity:{value:1}}]),vertexShader:pt.meshlambert_vert,fragmentShader:pt.meshlambert_frag},phong:{uniforms:Tn([Te.common,Te.specularmap,Te.envmap,Te.aomap,Te.lightmap,Te.emissivemap,Te.bumpmap,Te.normalmap,Te.displacementmap,Te.fog,Te.lights,{emissive:{value:new Ue(0)},specular:{value:new Ue(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:pt.meshphong_vert,fragmentShader:pt.meshphong_frag},standard:{uniforms:Tn([Te.common,Te.envmap,Te.aomap,Te.lightmap,Te.emissivemap,Te.bumpmap,Te.normalmap,Te.displacementmap,Te.roughnessmap,Te.metalnessmap,Te.fog,Te.lights,{emissive:{value:new Ue(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:pt.meshphysical_vert,fragmentShader:pt.meshphysical_frag},toon:{uniforms:Tn([Te.common,Te.aomap,Te.lightmap,Te.emissivemap,Te.bumpmap,Te.normalmap,Te.displacementmap,Te.gradientmap,Te.fog,Te.lights,{emissive:{value:new Ue(0)}}]),vertexShader:pt.meshtoon_vert,fragmentShader:pt.meshtoon_frag},matcap:{uniforms:Tn([Te.common,Te.bumpmap,Te.normalmap,Te.displacementmap,Te.fog,{matcap:{value:null}}]),vertexShader:pt.meshmatcap_vert,fragmentShader:pt.meshmatcap_frag},points:{uniforms:Tn([Te.points,Te.fog]),vertexShader:pt.points_vert,fragmentShader:pt.points_frag},dashed:{uniforms:Tn([Te.common,Te.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:pt.linedashed_vert,fragmentShader:pt.linedashed_frag},depth:{uniforms:Tn([Te.common,Te.displacementmap]),vertexShader:pt.depth_vert,fragmentShader:pt.depth_frag},normal:{uniforms:Tn([Te.common,Te.bumpmap,Te.normalmap,Te.displacementmap,{opacity:{value:1}}]),vertexShader:pt.meshnormal_vert,fragmentShader:pt.meshnormal_frag},sprite:{uniforms:Tn([Te.sprite,Te.fog]),vertexShader:pt.sprite_vert,fragmentShader:pt.sprite_frag},background:{uniforms:{uvTransform:{value:new at},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:pt.background_vert,fragmentShader:pt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new at}},vertexShader:pt.backgroundCube_vert,fragmentShader:pt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:pt.cube_vert,fragmentShader:pt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:pt.equirect_vert,fragmentShader:pt.equirect_frag},distance:{uniforms:Tn([Te.common,Te.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:pt.distance_vert,fragmentShader:pt.distance_frag},shadow:{uniforms:Tn([Te.lights,Te.fog,{color:{value:new Ue(0)},opacity:{value:1}}]),vertexShader:pt.shadow_vert,fragmentShader:pt.shadow_frag}};Si.physical={uniforms:Tn([Si.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new at},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new at},clearcoatNormalScale:{value:new he(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new at},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new at},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new at},sheen:{value:0},sheenColor:{value:new Ue(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new at},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new at},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new at},transmissionSamplerSize:{value:new he},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new at},attenuationDistance:{value:0},attenuationColor:{value:new Ue(0)},specularColor:{value:new Ue(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new at},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new at},anisotropyVector:{value:new he},anisotropyMap:{value:null},anisotropyMapTransform:{value:new at}}]),vertexShader:pt.meshphysical_vert,fragmentShader:pt.meshphysical_frag};var _c={r:0,b:0,g:0},Ty=new Mt,tp=new at;tp.set(-1,0,0,0,1,0,0,0,1);function wy(n,e,t,i,s,r){let a=new Ue(0),o=s===!0?0:1,l,c,h=null,u=0,d=null;function f(b){let _=b.isScene===!0?b.background:null;if(_&&_.isTexture){let x=b.backgroundBlurriness>0;_=e.get(_,x)}return _}function m(b){let _=!1,x=f(b);x===null?g(a,o):x&&x.isColor&&(g(x,1),_=!0);let S=n.xr.getEnvironmentBlendMode();S==="additive"?t.buffers.color.setClear(0,0,0,1,r):S==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(n.autoClear||_)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function M(b,_){let x=f(_);x&&(x.isCubeTexture||x.mapping===Ba)?(c===void 0&&(c=new pe(new Ze(1,1,1),new Bt({name:"BackgroundCubeMaterial",uniforms:Ds(Si.backgroundCube.uniforms),vertexShader:Si.backgroundCube.vertexShader,fragmentShader:Si.backgroundCube.fragmentShader,side:un,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(S,T,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=x,c.material.uniforms.backgroundBlurriness.value=_.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=_.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Ty.makeRotationFromEuler(_.backgroundRotation)).transpose(),x.isCubeTexture&&x.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(tp),c.material.toneMapped=yt.getTransfer(x.colorSpace)!==Ct,(h!==x||u!==x.version||d!==n.toneMapping)&&(c.material.needsUpdate=!0,h=x,u=x.version,d=n.toneMapping),c.layers.enableAll(),b.unshift(c,c.geometry,c.material,0,0,null)):x&&x.isTexture&&(l===void 0&&(l=new pe(new mn(2,2),new Bt({name:"BackgroundMaterial",uniforms:Ds(Si.background.uniforms),vertexShader:Si.background.vertexShader,fragmentShader:Si.background.fragmentShader,side:as,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=x,l.material.uniforms.backgroundIntensity.value=_.backgroundIntensity,l.material.toneMapped=yt.getTransfer(x.colorSpace)!==Ct,x.matrixAutoUpdate===!0&&x.updateMatrix(),l.material.uniforms.uvTransform.value.copy(x.matrix),(h!==x||u!==x.version||d!==n.toneMapping)&&(l.material.needsUpdate=!0,h=x,u=x.version,d=n.toneMapping),l.layers.enableAll(),b.unshift(l,l.geometry,l.material,0,0,null))}function g(b,_){b.getRGB(_c,tu(n)),t.buffers.color.setClear(_c.r,_c.g,_c.b,_,r)}function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(b,_=1){a.set(b),o=_,g(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(b){o=b,g(a,o)},render:m,addToRenderList:M,dispose:p}}function Ay(n,e){let t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=d(null),r=s,a=!1;function o(L,F,z,I,U){let G=!1,W=u(L,I,z,F);r!==W&&(r=W,c(r.object)),G=f(L,I,z,U),G&&m(L,I,z,U),U!==null&&e.update(U,n.ELEMENT_ARRAY_BUFFER),(G||a)&&(a=!1,x(L,F,z,I),U!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(U).buffer))}function l(){return n.createVertexArray()}function c(L){return n.bindVertexArray(L)}function h(L){return n.deleteVertexArray(L)}function u(L,F,z,I){let U=I.wireframe===!0,G=i[F.id];G===void 0&&(G={},i[F.id]=G);let W=L.isInstancedMesh===!0?L.id:0,K=G[W];K===void 0&&(K={},G[W]=K);let X=K[z.id];X===void 0&&(X={},K[z.id]=X);let $=X[U];return $===void 0&&($=d(l()),X[U]=$),$}function d(L){let F=[],z=[],I=[];for(let U=0;U<t;U++)F[U]=0,z[U]=0,I[U]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:F,enabledAttributes:z,attributeDivisors:I,object:L,attributes:{},index:null}}function f(L,F,z,I){let U=r.attributes,G=F.attributes,W=0,K=z.getAttributes();for(let X in K)if(K[X].location>=0){let ne=U[X],Ie=G[X];if(Ie===void 0&&(X==="instanceMatrix"&&L.instanceMatrix&&(Ie=L.instanceMatrix),X==="instanceColor"&&L.instanceColor&&(Ie=L.instanceColor)),ne===void 0||ne.attribute!==Ie||Ie&&ne.data!==Ie.data)return!0;W++}return r.attributesNum!==W||r.index!==I}function m(L,F,z,I){let U={},G=F.attributes,W=0,K=z.getAttributes();for(let X in K)if(K[X].location>=0){let ne=G[X];ne===void 0&&(X==="instanceMatrix"&&L.instanceMatrix&&(ne=L.instanceMatrix),X==="instanceColor"&&L.instanceColor&&(ne=L.instanceColor));let Ie={};Ie.attribute=ne,ne&&ne.data&&(Ie.data=ne.data),U[X]=Ie,W++}r.attributes=U,r.attributesNum=W,r.index=I}function M(){let L=r.newAttributes;for(let F=0,z=L.length;F<z;F++)L[F]=0}function g(L){p(L,0)}function p(L,F){let z=r.newAttributes,I=r.enabledAttributes,U=r.attributeDivisors;z[L]=1,I[L]===0&&(n.enableVertexAttribArray(L),I[L]=1),U[L]!==F&&(n.vertexAttribDivisor(L,F),U[L]=F)}function b(){let L=r.newAttributes,F=r.enabledAttributes;for(let z=0,I=F.length;z<I;z++)F[z]!==L[z]&&(n.disableVertexAttribArray(z),F[z]=0)}function _(L,F,z,I,U,G,W){W===!0?n.vertexAttribIPointer(L,F,z,U,G):n.vertexAttribPointer(L,F,z,I,U,G)}function x(L,F,z,I){M();let U=I.attributes,G=z.getAttributes(),W=F.defaultAttributeValues;for(let K in G){let X=G[K];if(X.location>=0){let $=U[K];if($===void 0&&(K==="instanceMatrix"&&L.instanceMatrix&&($=L.instanceMatrix),K==="instanceColor"&&L.instanceColor&&($=L.instanceColor)),$!==void 0){let ne=$.normalized,Ie=$.itemSize,Ce=e.get($);if(Ce===void 0)continue;let gt=Ce.buffer,Ye=Ce.type,ct=Ce.bytesPerElement,ee=Ye===n.INT||Ye===n.UNSIGNED_INT||$.gpuType===Nl;if($.isInterleavedBufferAttribute){let ae=$.data,ge=ae.stride,$e=$.offset;if(ae.isInstancedInterleavedBuffer){for(let be=0;be<X.locationSize;be++)p(X.location+be,ae.meshPerAttribute);L.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=ae.meshPerAttribute*ae.count)}else for(let be=0;be<X.locationSize;be++)g(X.location+be);n.bindBuffer(n.ARRAY_BUFFER,gt);for(let be=0;be<X.locationSize;be++)_(X.location+be,Ie/X.locationSize,Ye,ne,ge*ct,($e+Ie/X.locationSize*be)*ct,ee)}else{if($.isInstancedBufferAttribute){for(let ae=0;ae<X.locationSize;ae++)p(X.location+ae,$.meshPerAttribute);L.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=$.meshPerAttribute*$.count)}else for(let ae=0;ae<X.locationSize;ae++)g(X.location+ae);n.bindBuffer(n.ARRAY_BUFFER,gt);for(let ae=0;ae<X.locationSize;ae++)_(X.location+ae,Ie/X.locationSize,Ye,ne,Ie*ct,Ie/X.locationSize*ae*ct,ee)}}else if(W!==void 0){let ne=W[K];if(ne!==void 0)switch(ne.length){case 2:n.vertexAttrib2fv(X.location,ne);break;case 3:n.vertexAttrib3fv(X.location,ne);break;case 4:n.vertexAttrib4fv(X.location,ne);break;default:n.vertexAttrib1fv(X.location,ne)}}}}b()}function S(){w();for(let L in i){let F=i[L];for(let z in F){let I=F[z];for(let U in I){let G=I[U];for(let W in G)h(G[W].object),delete G[W];delete I[U]}}delete i[L]}}function T(L){if(i[L.id]===void 0)return;let F=i[L.id];for(let z in F){let I=F[z];for(let U in I){let G=I[U];for(let W in G)h(G[W].object),delete G[W];delete I[U]}}delete i[L.id]}function A(L){for(let F in i){let z=i[F];for(let I in z){let U=z[I];if(U[L.id]===void 0)continue;let G=U[L.id];for(let W in G)h(G[W].object),delete G[W];delete U[L.id]}}}function y(L){for(let F in i){let z=i[F],I=L.isInstancedMesh===!0?L.id:0,U=z[I];if(U!==void 0){for(let G in U){let W=U[G];for(let K in W)h(W[K].object),delete W[K];delete U[G]}delete z[I],Object.keys(z).length===0&&delete i[F]}}}function w(){R(),a=!0,r!==s&&(r=s,c(r.object))}function R(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:w,resetDefaultState:R,dispose:S,releaseStatesOfGeometry:T,releaseStatesOfObject:y,releaseStatesOfProgram:A,initAttributes:M,enableAttribute:g,disableUnusedAttributes:b}}function Ry(n,e,t){let i;function s(l){i=l}function r(l,c){n.drawArrays(i,l,c),t.update(c,i,1)}function a(l,c,h){h!==0&&(n.drawArraysInstanced(i,l,c,h),t.update(c,i,h))}function o(l,c,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,h);let d=0;for(let f=0;f<h;f++)d+=c[f];t.update(d,i,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function Cy(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let A=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(A){return!(A!==Fn&&i.convert(A)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(A){let y=A===yn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==Un&&A!==jn&&!y&&i.convert(A)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE))}function l(A){if(A==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",h=l(c);h!==c&&(Je("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let u=t.logarithmicDepthBuffer===!0,d=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&d===!1&&Je("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),m=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),M=n.getParameter(n.MAX_TEXTURE_SIZE),g=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),p=n.getParameter(n.MAX_VERTEX_ATTRIBS),b=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),_=n.getParameter(n.MAX_VARYING_VECTORS),x=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),S=n.getParameter(n.MAX_SAMPLES),T=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:m,maxTextureSize:M,maxCubemapSize:g,maxAttributes:p,maxVertexUniforms:b,maxVaryings:_,maxFragmentUniforms:x,maxSamples:S,samples:T}}function Iy(n){let e=this,t=null,i=0,s=!1,r=!1,a=new ri,o=new at,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let f=u.length!==0||d||i!==0||s;return s=d,i=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){t=h(u,d,0)},this.setState=function(u,d,f){let m=u.clippingPlanes,M=u.clipIntersection,g=u.clipShadows,p=n.get(u);if(!s||m===null||m.length===0||r&&!g)r?h(null):c();else{let b=r?0:i,_=b*4,x=p.clippingState||null;l.value=x,x=h(m,d,_,f);for(let S=0;S!==_;++S)x[S]=t[S];p.clippingState=x,this.numIntersection=M?this.numPlanes:0,this.numPlanes+=b}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function h(u,d,f,m){let M=u!==null?u.length:0,g=null;if(M!==0){if(g=l.value,m!==!0||g===null){let p=f+M*4,b=d.matrixWorldInverse;o.getNormalMatrix(b),(g===null||g.length<p)&&(g=new Float32Array(p));for(let _=0,x=f;_!==M;++_,x+=4)a.copy(u[_]).applyMatrix4(b,o),a.normal.toArray(g,x),g[x+3]=a.constant}l.value=g,l.needsUpdate=!0}return e.numPlanes=M,e.numIntersection=0,g}}var vr=4,Py=6,Dy=20,Ly=256,qa=new rs,Lf=new Ue,hu=null,uu=0,du=0,fu=!1,Ny=new P,Ls=new P,Mc=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,s=100,r={}){let{size:a=256,position:o=Ny}=r;hu=this._renderer.getRenderTarget(),uu=this._renderer.getActiveCubeFace(),du=this._renderer.getActiveMipmapLevel(),fu=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,i,s,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ff(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Uf(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(hu,uu,du),this._renderer.xr.enabled=fu,e.scissorTest=!1,_r(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ls||e.mapping===Is?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),hu=this._renderer.getRenderTarget(),uu=this._renderer.getActiveCubeFace(),du=this._renderer.getActiveMipmapLevel(),fu=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:xn,minFilter:xn,generateMipmaps:!1,type:yn,format:Fn,colorSpace:Qr,depthBuffer:!1},s=Nf(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Nf(e,t,i);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Uy(r)),this._blurMaterial=By(r,e,t),this._ggxMaterial=Fy(r,e,t)}return s}_compileMaterial(e){let t=new pe(new Et,e);this._renderer.compile(t,qa)}_sceneToCubeUV(e,t,i,s,r){let l=new gn(90,1,t,i),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,f=u.toneMapping;u.getClearColor(Lf),u.toneMapping=li,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(s),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new pe(new Ze,new It({name:"PMREM.Background",side:un,depthWrite:!1,depthTest:!1})));let M=this._backgroundBox,g=M.material,p=!1,b=e.background;b?b.isColor&&(g.color.copy(b),e.background=null,p=!0):(g.color.copy(Lf),p=!0);for(let _=0;_<6;_++){let x=_%3;x===0?(l.up.set(0,c[_],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[_],r.y,r.z)):x===1?(l.up.set(0,0,c[_]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[_],r.z)):(l.up.set(0,c[_],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[_]));let S=this._cubeSize;_r(s,x*S,_>2?S:0,S,S),u.setRenderTarget(s),p&&u.render(M,l),u.render(e,l)}u.toneMapping=f,u.autoClear=d,e.background=b}_textureToCubeUV(e,t){let i=this._renderer,s=e.mapping===ls||e.mapping===Is;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ff()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Uf());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=e;let l=this._cubeSize;_r(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(a,qa)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=i}_applyGGXFilter(e,t,i){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[i];o.material=a;let l=a.uniforms,c=i/(this._lodMeshes.length-1),h=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-h*h),d=c*1.25,f=u*d,{_lodMax:m}=this,M=this._sizeLods[i],g=3*M*(i>m-vr?i-m+vr:0),p=4*(this._cubeSize-M);l.envMap.value=e.texture,l.roughness.value=f,l.mipInt.value=m-t,_r(r,g,p,3*M,2*M),s.setRenderTarget(r),s.render(o,qa),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=m-i,_r(e,g,p,3*M,2*M),s.setRenderTarget(e),s.render(o,qa)}_blur(e,t,i,s){let r=this._pingPongRenderTarget,a=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(e,r,t,i,a),this._blurPass(r,e,i,i,a)}_blurPass(e,t,i,s,r){let a=this._renderer,o=this._blurMaterial,l=this._lodMeshes[s];l.material=o;let c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-i;let h=this._sizeLods[s],u=3*h*(s>this._lodMax-vr?s-this._lodMax+vr:0),d=4*(this._cubeSize-h);_r(t,u,d,3*h,2*h),a.setRenderTarget(t),a.render(l,qa)}};function Uy(n){let e=[],t=[],i=n,s=n-vr+1+Py;for(let r=0;r<s;r++){let a=Math.pow(2,i);e.push(a);let o=1/(a-2),l=-o,c=1+o,h=[l,l,c,l,c,c,l,l,c,c,l,c],u=6,d=6,f=3,m=new Float32Array(f*d*u),M=new Float32Array(f*d*u);for(let p=0;p<u;p++){let b=p%3*2/3-1,_=p>2?0:-1,x=[b,_,0,b+2/3,_,0,b+2/3,_+1,0,b,_,0,b+2/3,_+1,0,b,_+1,0];m.set(x,f*d*p);for(let S=0;S<d;S++){let T=h[S*2]*2-1,A=h[S*2+1]*2-1;p===0?Ls.set(1,A,T):p===1?Ls.set(-T,1,-A):p===2?Ls.set(-T,A,1):p===3?Ls.set(-1,A,-T):p===4?Ls.set(-T,-1,A):Ls.set(T,A,-1),Ls.toArray(M,(p*d+S)*f)}}let g=new Et;g.setAttribute("position",new Ht(m,f)),g.setAttribute("outputDirection",new Ht(M,f)),t.push(new pe(g,null)),i>vr&&i--}return{lodMeshes:t,sizeLods:e}}function Nf(n,e,t){let i=new tn(n,e,t);return i.texture.mapping=Ba,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function _r(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function Fy(n,e,t){return new Bt({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Ly,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Ec(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Kn,depthTest:!1,depthWrite:!1})}function By(n,e,t){return new Bt({name:"SphericalGaussianBlur",defines:{SAMPLES:Dy,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Ec(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:Kn,depthTest:!1,depthWrite:!1})}function Uf(){return new Bt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Ec(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Kn,depthTest:!1,depthWrite:!1})}function Ff(){return new Bt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Ec(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Kn,depthTest:!1,depthWrite:!1})}function Ec(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var bc=class extends tn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new ca(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Ze(5,5,5),r=new Bt({name:"CubemapFromEquirect",uniforms:Ds(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:un,blending:Kn});r.uniforms.tEquirect.value=t;let a=new pe(s,r),o=t.minFilter;return t.minFilter===cs&&(t.minFilter=xn),new Al(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,i=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,i,s);e.setRenderTarget(r)}};function Oy(n){let e=new WeakMap,t=new WeakMap,i=null;function s(d,f=!1){return d==null?null:f?a(d):r(d)}function r(d){if(d&&d.isTexture){let f=d.mapping;if(f===Pl||f===Dl)if(e.has(d)){let m=e.get(d).texture;return o(m,d.mapping)}else{let m=d.image;if(m&&m.height>0){let M=new bc(m.height);return M.fromEquirectangularTexture(n,d),e.set(d,M),d.addEventListener("dispose",c),o(M.texture,d.mapping)}else return null}}return d}function a(d){if(d&&d.isTexture){let f=d.mapping,m=f===Pl||f===Dl,M=f===ls||f===Is;if(m||M){let g=t.get(d),p=g!==void 0?g.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==p)return i===null&&(i=new Mc(n)),g=m?i.fromEquirectangular(d,g):i.fromCubemap(d,g),g.texture.pmremVersion=d.pmremVersion,t.set(d,g),g.texture;if(g!==void 0)return g.texture;{let b=d.image;return m&&b&&b.height>0||M&&b&&l(b)?(i===null&&(i=new Mc(n)),g=m?i.fromEquirectangular(d):i.fromCubemap(d),g.texture.pmremVersion=d.pmremVersion,t.set(d,g),d.addEventListener("dispose",h),g.texture):null}}}return d}function o(d,f){return f===Pl?d.mapping=ls:f===Dl&&(d.mapping=Is),d}function l(d){let f=0,m=6;for(let M=0;M<m;M++)d[M]!==void 0&&f++;return f===m}function c(d){let f=d.target;f.removeEventListener("dispose",c);let m=e.get(f);m!==void 0&&(e.delete(f),m.dispose())}function h(d){let f=d.target;f.removeEventListener("dispose",h);let m=t.get(f);m!==void 0&&(t.delete(f),m.dispose())}function u(){e=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:s,dispose:u}}function ky(n){let e={};function t(i){if(e[i]!==void 0)return e[i];let s=n.getExtension(i);return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let s=t(i);return s===null&&Ss("WebGLRenderer: "+i+" extension not supported."),s}}}function Hy(n,e,t,i){let s={},r=new WeakMap;function a(u){let d=u.target;d.index!==null&&e.remove(d.index);for(let m in d.attributes)e.remove(d.attributes[m]);d.removeEventListener("dispose",a),delete s[d.id];let f=r.get(d);f&&(e.remove(f),r.delete(d)),i.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function o(u,d){return s[d.id]===!0||(d.addEventListener("dispose",a),s[d.id]=!0,t.memory.geometries++),d}function l(u){let d=u.attributes;for(let f in d)e.update(d[f],n.ARRAY_BUFFER)}function c(u){let d=[],f=u.index,m=u.attributes.position,M=0;if(m===void 0)return;if(f!==null){let b=f.array;M=f.version;for(let _=0,x=b.length;_<x;_+=3){let S=b[_+0],T=b[_+1],A=b[_+2];d.push(S,T,T,A,A,S)}}else{let b=m.array;M=m.version;for(let _=0,x=b.length/3-1;_<x;_+=3){let S=_+0,T=_+1,A=_+2;d.push(S,T,T,A,A,S)}}let g=new(m.count>=65535?oa:aa)(d,1);g.version=M;let p=r.get(u);p&&e.remove(p),r.set(u,g)}function h(u){let d=r.get(u);if(d){let f=u.index;f!==null&&d.version<f.version&&c(u)}else c(u);return r.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function zy(n,e,t){let i;function s(u){i=u}let r,a;function o(u){r=u.type,a=u.bytesPerElement}function l(u,d){n.drawElements(i,d,r,u*a),t.update(d,i,1)}function c(u,d,f){f!==0&&(n.drawElementsInstanced(i,d,r,u*a,f),t.update(d,i,f))}function h(u,d,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,d,0,r,u,0,f);let M=0;for(let g=0;g<f;g++)M+=d[g];t.update(M,i,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function Gy(n){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,a,o){switch(t.calls++,a){case n.TRIANGLES:t.triangles+=o*(r/3);break;case n.LINES:t.lines+=o*(r/2);break;case n.LINE_STRIP:t.lines+=o*(r-1);break;case n.LINE_LOOP:t.lines+=o*r;break;case n.POINTS:t.points+=o*r;break;default:tt("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function Vy(n,e,t){let i=new WeakMap,s=new Xt;function r(a,o,l){let c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0,d=i.get(o);if(d===void 0||d.count!==u){let w=function(){A.dispose(),i.delete(o),o.removeEventListener("dispose",w)};d!==void 0&&d.texture.dispose();let f=o.morphAttributes.position!==void 0,m=o.morphAttributes.normal!==void 0,M=o.morphAttributes.color!==void 0,g=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],b=o.morphAttributes.color||[],_=0;f===!0&&(_=1),m===!0&&(_=2),M===!0&&(_=3);let x=o.attributes.position.count*_,S=1;x>e.maxTextureSize&&(S=Math.ceil(x/e.maxTextureSize),x=e.maxTextureSize);let T=new Float32Array(x*S*4*u),A=new na(T,x,S,u);A.type=jn,A.needsUpdate=!0;let y=_*4;for(let R=0;R<u;R++){let L=g[R],F=p[R],z=b[R],I=x*S*4*R;for(let U=0;U<L.count;U++){let G=U*y;f===!0&&(s.fromBufferAttribute(L,U),T[I+G+0]=s.x,T[I+G+1]=s.y,T[I+G+2]=s.z,T[I+G+3]=0),m===!0&&(s.fromBufferAttribute(F,U),T[I+G+4]=s.x,T[I+G+5]=s.y,T[I+G+6]=s.z,T[I+G+7]=0),M===!0&&(s.fromBufferAttribute(z,U),T[I+G+8]=s.x,T[I+G+9]=s.y,T[I+G+10]=s.z,T[I+G+11]=z.itemSize===4?s.w:1)}}d={count:u,texture:A,size:new he(x,S)},i.set(o,d),o.addEventListener("dispose",w)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",a.morphTexture,t);else{let f=0;for(let M=0;M<c.length;M++)f+=c[M];let m=o.morphTargetsRelative?1:1-f;l.getUniforms().setValue(n,"morphTargetBaseInfluence",m),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",d.size)}return{update:r}}function Wy(n,e,t,i,s){let r=new WeakMap;function a(c){let h=s.render.frame,u=c.geometry,d=e.get(c,u);if(r.get(d)!==h&&(e.update(d),r.set(d,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(t.update(c.instanceMatrix,n.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,n.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return d}function o(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),i.releaseStatesOfObject(h),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:a,dispose:o}}var Xy={[Pa]:"LINEAR_TONE_MAPPING",[Da]:"REINHARD_TONE_MAPPING",[La]:"CINEON_TONE_MAPPING",[Cs]:"ACES_FILMIC_TONE_MAPPING",[Ua]:"AGX_TONE_MAPPING",[Fa]:"NEUTRAL_TONE_MAPPING",[Na]:"CUSTOM_TONE_MAPPING"};function qy(n,e,t,i,s,r){let a=new tn(e,t,{type:n,depthBuffer:s,stencilBuffer:r,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new Et;c.setAttribute("position",new it([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new it([0,2,0,0,2,0],2));let h=new fr({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),u=new pe(c,h),d=new rs(-1,1,1,-1,0,1),f=null,m=null,M=!1,g,p=null,b=[],_=!1;this.setSize=function(x,S){a.setSize(x,S),o!==null&&o.setSize(x,S),l!==null&&l.setSize(x,S);for(let T=0;T<b.length;T++){let A=b[T];A.setSize&&A.setSize(x,S)}},this.setEffects=function(x){b=x,_=b.length>0&&b[0].isRenderPass===!0;let S=a.width,T=a.height;b.length>0&&o===null&&(o=new tn(S,T,{type:yn,depthBuffer:!1,stencilBuffer:!1}),l=new tn(S,T,{type:yn,depthBuffer:!1,stencilBuffer:!1}));for(let A=0;A<b.length;A++){let y=b[A];y.setSize&&y.setSize(S,T)}},this.begin=function(x,S){if(M||x.toneMapping===li&&b.length===0)return!1;if(p=S,S!==null){let T=S.width,A=S.height;(a.width!==T||a.height!==A)&&this.setSize(T,A)}return _===!1&&x.setRenderTarget(a),g=x.toneMapping,x.toneMapping=li,!0},this.hasRenderPass=function(){return _},this.end=function(x,S){x.toneMapping=g,M=!0;let T=a,A=o;for(let y=0;y<b.length;y++){let w=b[y];w.enabled!==!1&&(w.render(x,A,T,S),w.needsSwap!==!1&&(T=A,A=A===o?l:o))}if(f!==x.outputColorSpace||m!==x.toneMapping){f=x.outputColorSpace,m=x.toneMapping,h.defines={},yt.getTransfer(f)===Ct&&(h.defines.SRGB_TRANSFER="");let y=Xy[m];y&&(h.defines[y]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=T.texture,x.setRenderTarget(p),x.render(u,d),p=null,M=!1},this.isCompositing=function(){return M},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}var np=new In,gu=new ts(1,1),ip=new na,sp=new nl,rp=new ca,Bf=[],Of=[],kf=new Float32Array(16),Hf=new Float32Array(9),zf=new Float32Array(4);function br(n,e,t){let i=n[0];if(i<=0||i>0)return n;let s=e*t,r=Bf[s];if(r===void 0&&(r=new Float32Array(s),Bf[s]=r),e!==0){i.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,n[a].toArray(r,o)}return r}function dn(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function fn(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function Tc(n,e){let t=Of[e];t===void 0&&(t=new Int32Array(e),Of[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function Yy(n,e){let t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function Zy(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(dn(t,e))return;n.uniform2fv(this.addr,e),fn(t,e)}}function $y(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(dn(t,e))return;n.uniform3fv(this.addr,e),fn(t,e)}}function Jy(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(dn(t,e))return;n.uniform4fv(this.addr,e),fn(t,e)}}function Ky(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(dn(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),fn(t,e)}else{if(dn(t,i))return;zf.set(i),n.uniformMatrix2fv(this.addr,!1,zf),fn(t,i)}}function jy(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(dn(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),fn(t,e)}else{if(dn(t,i))return;Hf.set(i),n.uniformMatrix3fv(this.addr,!1,Hf),fn(t,i)}}function Qy(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(dn(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),fn(t,e)}else{if(dn(t,i))return;kf.set(i),n.uniformMatrix4fv(this.addr,!1,kf),fn(t,i)}}function e_(n,e){let t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function t_(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(dn(t,e))return;n.uniform2iv(this.addr,e),fn(t,e)}}function n_(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(dn(t,e))return;n.uniform3iv(this.addr,e),fn(t,e)}}function i_(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(dn(t,e))return;n.uniform4iv(this.addr,e),fn(t,e)}}function s_(n,e){let t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function r_(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(dn(t,e))return;n.uniform2uiv(this.addr,e),fn(t,e)}}function a_(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(dn(t,e))return;n.uniform3uiv(this.addr,e),fn(t,e)}}function o_(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(dn(t,e))return;n.uniform4uiv(this.addr,e),fn(t,e)}}function l_(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(gu.compareFunction=t.isReversedDepthBuffer()?yc:xc,r=gu):r=np,t.setTexture2D(e||r,s)}function c_(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||sp,s)}function h_(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||rp,s)}function u_(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||ip,s)}function d_(n){switch(n){case 5126:return Yy;case 35664:return Zy;case 35665:return $y;case 35666:return Jy;case 35674:return Ky;case 35675:return jy;case 35676:return Qy;case 5124:case 35670:return e_;case 35667:case 35671:return t_;case 35668:case 35672:return n_;case 35669:case 35673:return i_;case 5125:return s_;case 36294:return r_;case 36295:return a_;case 36296:return o_;case 35678:case 36198:case 36298:case 36306:case 35682:return l_;case 35679:case 36299:case 36307:return c_;case 35680:case 36300:case 36308:case 36293:return h_;case 36289:case 36303:case 36311:case 36292:return u_}}function f_(n,e){n.uniform1fv(this.addr,e)}function p_(n,e){let t=br(e,this.size,2);n.uniform2fv(this.addr,t)}function m_(n,e){let t=br(e,this.size,3);n.uniform3fv(this.addr,t)}function g_(n,e){let t=br(e,this.size,4);n.uniform4fv(this.addr,t)}function x_(n,e){let t=br(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function y_(n,e){let t=br(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function __(n,e){let t=br(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function v_(n,e){n.uniform1iv(this.addr,e)}function M_(n,e){n.uniform2iv(this.addr,e)}function b_(n,e){n.uniform3iv(this.addr,e)}function S_(n,e){n.uniform4iv(this.addr,e)}function E_(n,e){n.uniform1uiv(this.addr,e)}function T_(n,e){n.uniform2uiv(this.addr,e)}function w_(n,e){n.uniform3uiv(this.addr,e)}function A_(n,e){n.uniform4uiv(this.addr,e)}function R_(n,e,t){let i=this.cache,s=e.length,r=Tc(t,s);dn(i,r)||(n.uniform1iv(this.addr,r),fn(i,r));let a;this.type===n.SAMPLER_2D_SHADOW?a=gu:a=np;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function C_(n,e,t){let i=this.cache,s=e.length,r=Tc(t,s);dn(i,r)||(n.uniform1iv(this.addr,r),fn(i,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||sp,r[a])}function I_(n,e,t){let i=this.cache,s=e.length,r=Tc(t,s);dn(i,r)||(n.uniform1iv(this.addr,r),fn(i,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||rp,r[a])}function P_(n,e,t){let i=this.cache,s=e.length,r=Tc(t,s);dn(i,r)||(n.uniform1iv(this.addr,r),fn(i,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||ip,r[a])}function D_(n){switch(n){case 5126:return f_;case 35664:return p_;case 35665:return m_;case 35666:return g_;case 35674:return x_;case 35675:return y_;case 35676:return __;case 5124:case 35670:return v_;case 35667:case 35671:return M_;case 35668:case 35672:return b_;case 35669:case 35673:return S_;case 5125:return E_;case 36294:return T_;case 36295:return w_;case 36296:return A_;case 35678:case 36198:case 36298:case 36306:case 35682:return R_;case 35679:case 36299:case 36307:return C_;case 35680:case 36300:case 36308:case 36293:return I_;case 36289:case 36303:case 36311:case 36292:return P_}}var xu=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=d_(t.type)}},yu=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=D_(t.type)}},_u=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],i)}}},pu=/(\w+)(\])?(\[|\.)?/g;function Gf(n,e){n.seq.push(e),n.map[e.id]=e}function L_(n,e,t){let i=n.name,s=i.length;for(pu.lastIndex=0;;){let r=pu.exec(i),a=pu.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){Gf(t,c===void 0?new xu(o,n,e):new yu(o,n,e));break}else{let u=t.map[o];u===void 0&&(u=new _u(o),Gf(t,u)),t=u}}}var Mr=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){let o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);L_(o,l,this)}let s=[],r=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,i,s){let r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){let s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],l=i[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){let i=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&i.push(a)}return i}};function Vf(n,e,t){let i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}var N_=37297,U_=0;function F_(n,e){let t=n.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;i.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return i.join(`
`)}var Wf=new at;function B_(n){yt._getMatrix(Wf,yt.workingColorSpace,n);let e=`mat3( ${Wf.elements.map(t=>t.toFixed(4))} )`;switch(yt.getTransfer(n)){case ea:return[e,"LinearTransferOETF"];case Ct:return[e,"sRGBTransferOETF"];default:return Je("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function Xf(n,e,t){let i=n.getShaderParameter(e,n.COMPILE_STATUS),r=(n.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+F_(n.getShaderSource(e),o)}else return r}function O_(n,e){let t=B_(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var k_={[Pa]:"Linear",[Da]:"Reinhard",[La]:"Cineon",[Cs]:"ACESFilmic",[Ua]:"AgX",[Fa]:"Neutral",[Na]:"Custom"};function H_(n,e){let t=k_[e];return t===void 0?(Je("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var vc=new P;function z_(){yt.getLuminanceCoefficients(vc);let n=vc.x.toFixed(4),e=vc.y.toFixed(4),t=vc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function G_(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Za).join(`
`)}function V_(n){let e=[];for(let t in n){let i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function W_(n,e){let t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let r=n.getActiveAttrib(e,s),a=r.name,o=1;r.type===n.FLOAT_MAT2&&(o=2),r.type===n.FLOAT_MAT3&&(o=3),r.type===n.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:n.getAttribLocation(e,a),locationSize:o}}return t}function Za(n){return n!==""}function qf(n,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Yf(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var X_=/^[ \t]*#include +<([\w\d./]+)>/gm;function vu(n){return n.replace(X_,Y_)}var q_=new Map;function Y_(n,e){let t=pt[e];if(t===void 0){let i=q_.get(e);if(i!==void 0)t=pt[i],Je('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return vu(t)}var Z_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Zf(n){return n.replace(Z_,$_)}function $_(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function $f(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var J_={[Ia]:"SHADOWMAP_TYPE_PCF",[gr]:"SHADOWMAP_TYPE_VSM"};function K_(n){return J_[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var j_={[ls]:"ENVMAP_TYPE_CUBE",[Is]:"ENVMAP_TYPE_CUBE",[Ba]:"ENVMAP_TYPE_CUBE_UV"};function Q_(n){return n.envMap===!1?"ENVMAP_TYPE_CUBE":j_[n.envMapMode]||"ENVMAP_TYPE_CUBE"}var ev={[Is]:"ENVMAP_MODE_REFRACTION"};function tv(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":ev[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}var nv={[Vh]:"ENVMAP_BLENDING_MULTIPLY",[cf]:"ENVMAP_BLENDING_MIX",[hf]:"ENVMAP_BLENDING_ADD"};function iv(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":nv[n.combine]||"ENVMAP_BLENDING_NONE"}function sv(n){let e=n.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function rv(n,e,t,i){let s=n.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,l=K_(t),c=Q_(t),h=tv(t),u=iv(t),d=sv(t),f=G_(t),m=V_(r),M=s.createProgram(),g,p,b=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(Za).join(`
`),g.length>0&&(g+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(Za).join(`
`),p.length>0&&(p+=`
`)):(g=[$f(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Za).join(`
`),p=[$f(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==li?"#define TONE_MAPPING":"",t.toneMapping!==li?pt.tonemapping_pars_fragment:"",t.toneMapping!==li?H_("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",pt.colorspace_pars_fragment,O_("linearToOutputTexel",t.outputColorSpace),z_(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Za).join(`
`)),a=vu(a),a=qf(a,t),a=Yf(a,t),o=vu(o),o=qf(o,t),o=Yf(o,t),a=Zf(a),o=Zf(o),t.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,g=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,p=["#define varying in",t.glslVersion===Kh?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Kh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let _=b+g+a,x=b+p+o,S=Vf(s,s.VERTEX_SHADER,_),T=Vf(s,s.FRAGMENT_SHADER,x);s.attachShader(M,S),s.attachShader(M,T),t.index0AttributeName!==void 0?s.bindAttribLocation(M,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(M,0,"position"),s.linkProgram(M);function A(L){if(n.debug.checkShaderErrors){let F=s.getProgramInfoLog(M)||"",z=s.getShaderInfoLog(S)||"",I=s.getShaderInfoLog(T)||"",U=F.trim(),G=z.trim(),W=I.trim(),K=!0,X=!0;if(s.getProgramParameter(M,s.LINK_STATUS)===!1)if(K=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,M,S,T);else{let $=Xf(s,S,"vertex"),ne=Xf(s,T,"fragment");tt("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(M,s.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+U+`
`+$+`
`+ne)}else U!==""?Je("WebGLProgram: Program Info Log:",U):(G===""||W==="")&&(X=!1);X&&(L.diagnostics={runnable:K,programLog:U,vertexShader:{log:G,prefix:g},fragmentShader:{log:W,prefix:p}})}s.deleteShader(S),s.deleteShader(T),y=new Mr(s,M),w=W_(s,M)}let y;this.getUniforms=function(){return y===void 0&&A(this),y};let w;this.getAttributes=function(){return w===void 0&&A(this),w};let R=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return R===!1&&(R=s.getProgramParameter(M,N_)),R},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(M),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=U_++,this.cacheKey=e,this.usedTimes=1,this.program=M,this.vertexShader=S,this.fragmentShader=T,this}var av=0,Mu=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,i){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(i)===!1&&(s.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new bu(e),t.set(e,i)),i}},bu=class{constructor(e){this.id=av++,this.code=e,this.usedTimes=0}};function ov(n){return n===us||n===Va||n===Wa}function lv(n,e,t,i,s,r){let a=new ia,o=new Mu,l=new Set,c=[],h=new Map,u=i.logarithmicDepthBuffer,d=i.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(y){return l.add(y),y===0?"uv":`uv${y}`}function M(y,w,R,L,F,z){let I=L.fog,U=F.geometry,G=y.isMeshStandardMaterial||y.isMeshLambertMaterial||y.isMeshPhongMaterial?L.environment:null,W=y.isMeshStandardMaterial||y.isMeshLambertMaterial&&!y.envMap||y.isMeshPhongMaterial&&!y.envMap,K=e.get(y.envMap||G,W),X=K&&K.mapping===Ba?K.image.height:null,$=f[y.type];y.precision!==null&&(d=i.getMaxPrecision(y.precision),d!==y.precision&&Je("WebGLProgram.getParameters:",y.precision,"not supported, using",d,"instead."));let ne=U.morphAttributes.position||U.morphAttributes.normal||U.morphAttributes.color,Ie=ne!==void 0?ne.length:0,Ce=0;U.morphAttributes.position!==void 0&&(Ce=1),U.morphAttributes.normal!==void 0&&(Ce=2),U.morphAttributes.color!==void 0&&(Ce=3);let gt,Ye,ct,ee;if($){let zt=Si[$];gt=zt.vertexShader,Ye=zt.fragmentShader}else{gt=y.vertexShader,Ye=y.fragmentShader;let zt=o.getVertexShaderStage(y),Dt=o.getFragmentShaderStage(y);o.update(y,zt,Dt),ct=zt.id,ee=Dt.id}let ae=n.getRenderTarget(),ge=n.state.buffers.depth.getReversed(),$e=F.isInstancedMesh===!0,be=F.isBatchedMesh===!0,Qe=!!y.map,At=!!y.matcap,oe=!!K,ue=!!y.aoMap,de=!!y.lightMap,fe=!!y.bumpMap&&y.wireframe===!1,Me=!!y.normalMap,ze=!!y.displacementMap,Ve=!!y.emissiveMap,Ke=!!y.metalnessMap,et=!!y.roughnessMap,B=y.anisotropy>0,Rt=y.clearcoat>0,rt=y.dispersion>0,C=y.retroreflectivity>0,v=y.iridescence>0,V=y.sheen>0,Z=y.transmission>0,te=B&&!!y.anisotropyMap,xe=Rt&&!!y.clearcoatMap,ve=Rt&&!!y.clearcoatNormalMap,ie=Rt&&!!y.clearcoatRoughnessMap,re=v&&!!y.iridescenceMap,Se=v&&!!y.iridescenceThicknessMap,Ge=V&&!!y.sheenColorMap,Ee=V&&!!y.sheenRoughnessMap,H=!!y.specularMap,J=!!y.specularColorMap,se=!!y.specularIntensityMap,me=Z&&!!y.transmissionMap,D=Z&&!!y.thicknessMap,ce=!!y.gradientMap,Q=!!y.alphaMap,_e=y.alphaTest>0,we=!!y.alphaHash,le=!!y.extensions,We=li;y.toneMapped&&(ae===null||ae.isXRRenderTarget===!0)&&(We=n.toneMapping);let Oe={shaderID:$,shaderType:y.type,shaderName:y.name,vertexShader:gt,fragmentShader:Ye,defines:y.defines,customVertexShaderID:ct,customFragmentShaderID:ee,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:d,batching:be,batchingColor:be&&F._colorsTexture!==null,instancing:$e,instancingColor:$e&&F.instanceColor!==null,instancingMorph:$e&&F.morphTexture!==null,outputColorSpace:ae===null?n.outputColorSpace:ae.isXRRenderTarget===!0?ae.texture.colorSpace:yt.workingColorSpace,alphaToCoverage:!!y.alphaToCoverage,map:Qe,matcap:At,envMap:oe,envMapMode:oe&&K.mapping,envMapCubeUVHeight:X,aoMap:ue,lightMap:de,bumpMap:fe,normalMap:Me,displacementMap:ze,emissiveMap:Ve,normalMapObjectSpace:Me&&y.normalMapType===ff,normalMapTangentSpace:Me&&y.normalMapType===Xa,packedNormalMap:Me&&y.normalMapType===Xa&&ov(y.normalMap.format),metalnessMap:Ke,roughnessMap:et,anisotropy:B,anisotropyMap:te,clearcoat:Rt,clearcoatMap:xe,clearcoatNormalMap:ve,clearcoatRoughnessMap:ie,dispersion:rt,retroreflection:C,iridescence:v,iridescenceMap:re,iridescenceThicknessMap:Se,sheen:V,sheenColorMap:Ge,sheenRoughnessMap:Ee,specularMap:H,specularColorMap:J,specularIntensityMap:se,transmission:Z,transmissionMap:me,thicknessMap:D,gradientMap:ce,opaque:y.transparent===!1&&y.blending===os&&y.alphaToCoverage===!1,alphaMap:Q,alphaTest:_e,alphaHash:we,combine:y.combine,mapUv:Qe&&m(y.map.channel),aoMapUv:ue&&m(y.aoMap.channel),lightMapUv:de&&m(y.lightMap.channel),bumpMapUv:fe&&m(y.bumpMap.channel),normalMapUv:Me&&m(y.normalMap.channel),displacementMapUv:ze&&m(y.displacementMap.channel),emissiveMapUv:Ve&&m(y.emissiveMap.channel),metalnessMapUv:Ke&&m(y.metalnessMap.channel),roughnessMapUv:et&&m(y.roughnessMap.channel),anisotropyMapUv:te&&m(y.anisotropyMap.channel),clearcoatMapUv:xe&&m(y.clearcoatMap.channel),clearcoatNormalMapUv:ve&&m(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ie&&m(y.clearcoatRoughnessMap.channel),iridescenceMapUv:re&&m(y.iridescenceMap.channel),iridescenceThicknessMapUv:Se&&m(y.iridescenceThicknessMap.channel),sheenColorMapUv:Ge&&m(y.sheenColorMap.channel),sheenRoughnessMapUv:Ee&&m(y.sheenRoughnessMap.channel),specularMapUv:H&&m(y.specularMap.channel),specularColorMapUv:J&&m(y.specularColorMap.channel),specularIntensityMapUv:se&&m(y.specularIntensityMap.channel),transmissionMapUv:me&&m(y.transmissionMap.channel),thicknessMapUv:D&&m(y.thicknessMap.channel),alphaMapUv:Q&&m(y.alphaMap.channel),vertexTangents:!!U.attributes.tangent&&(Me||B),vertexNormals:!!U.attributes.normal,vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!U.attributes.color&&U.attributes.color.itemSize===4,pointsUvs:F.isPoints===!0&&!!U.attributes.uv&&(Qe||Q),fog:!!I,useFog:y.fog===!0,fogExp2:!!I&&I.isFogExp2,flatShading:y.wireframe===!1&&(y.flatShading===!0||U.attributes.normal===void 0&&Me===!1&&(y.isMeshLambertMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isMeshPhysicalMaterial)),sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:ge,skinning:F.isSkinnedMesh===!0,hasPositionAttribute:U.attributes.position!==void 0,morphTargets:U.morphAttributes.position!==void 0,morphNormals:U.morphAttributes.normal!==void 0,morphColors:U.morphAttributes.color!==void 0,morphTargetsCount:Ie,morphTextureStride:Ce,numSunLights:w.sun.length,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numSunLightShadows:w.sunShadowMap.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numLightProbeGrids:z.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:y.dithering,shadowMapEnabled:n.shadowMap.enabled&&R.length>0,shadowMapType:n.shadowMap.type,toneMapping:We,decodeVideoTexture:Qe&&y.map.isVideoTexture===!0&&yt.getTransfer(y.map.colorSpace)===Ct,decodeVideoTextureEmissive:Ve&&y.emissiveMap.isVideoTexture===!0&&yt.getTransfer(y.emissiveMap.colorSpace)===Ct,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===qt,flipSided:y.side===un,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:le&&y.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(le&&y.extensions.multiDraw===!0||be)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return Oe.vertexUv1s=l.has(1),Oe.vertexUv2s=l.has(2),Oe.vertexUv3s=l.has(3),l.clear(),Oe}function g(y){let w=[];if(y.shaderID?w.push(y.shaderID):(w.push(y.customVertexShaderID),w.push(y.customFragmentShaderID)),y.defines!==void 0)for(let R in y.defines)w.push(R),w.push(y.defines[R]);return y.isRawShaderMaterial===!1&&(p(w,y),b(w,y),w.push(n.outputColorSpace)),w.push(y.customProgramCacheKey),w.join()}function p(y,w){y.push(w.precision),y.push(w.outputColorSpace),y.push(w.envMapMode),y.push(w.envMapCubeUVHeight),y.push(w.mapUv),y.push(w.alphaMapUv),y.push(w.lightMapUv),y.push(w.aoMapUv),y.push(w.bumpMapUv),y.push(w.normalMapUv),y.push(w.displacementMapUv),y.push(w.emissiveMapUv),y.push(w.metalnessMapUv),y.push(w.roughnessMapUv),y.push(w.anisotropyMapUv),y.push(w.clearcoatMapUv),y.push(w.clearcoatNormalMapUv),y.push(w.clearcoatRoughnessMapUv),y.push(w.iridescenceMapUv),y.push(w.iridescenceThicknessMapUv),y.push(w.sheenColorMapUv),y.push(w.sheenRoughnessMapUv),y.push(w.specularMapUv),y.push(w.specularColorMapUv),y.push(w.specularIntensityMapUv),y.push(w.transmissionMapUv),y.push(w.thicknessMapUv),y.push(w.combine),y.push(w.fogExp2),y.push(w.sizeAttenuation),y.push(w.morphTargetsCount),y.push(w.morphAttributeCount),y.push(w.numSunLights),y.push(w.numDirLights),y.push(w.numPointLights),y.push(w.numSpotLights),y.push(w.numSpotLightMaps),y.push(w.numHemiLights),y.push(w.numRectAreaLights),y.push(w.numSunLightShadows),y.push(w.numDirLightShadows),y.push(w.numPointLightShadows),y.push(w.numSpotLightShadows),y.push(w.numSpotLightShadowsWithMaps),y.push(w.numLightProbes),y.push(w.shadowMapType),y.push(w.toneMapping),y.push(w.numClippingPlanes),y.push(w.numClipIntersection),y.push(w.depthPacking)}function b(y,w){a.disableAll(),w.instancing&&a.enable(0),w.instancingColor&&a.enable(1),w.instancingMorph&&a.enable(2),w.matcap&&a.enable(3),w.envMap&&a.enable(4),w.normalMapObjectSpace&&a.enable(5),w.normalMapTangentSpace&&a.enable(6),w.clearcoat&&a.enable(7),w.iridescence&&a.enable(8),w.alphaTest&&a.enable(9),w.vertexColors&&a.enable(10),w.vertexAlphas&&a.enable(11),w.vertexUv1s&&a.enable(12),w.vertexUv2s&&a.enable(13),w.vertexUv3s&&a.enable(14),w.vertexTangents&&a.enable(15),w.anisotropy&&a.enable(16),w.alphaHash&&a.enable(17),w.batching&&a.enable(18),w.dispersion&&a.enable(19),w.retroreflection&&a.enable(24),w.batchingColor&&a.enable(20),w.gradientMap&&a.enable(21),w.packedNormalMap&&a.enable(22),w.vertexNormals&&a.enable(23),y.push(a.mask),a.disableAll(),w.fog&&a.enable(0),w.useFog&&a.enable(1),w.flatShading&&a.enable(2),w.logarithmicDepthBuffer&&a.enable(3),w.reversedDepthBuffer&&a.enable(4),w.skinning&&a.enable(5),w.morphTargets&&a.enable(6),w.morphNormals&&a.enable(7),w.morphColors&&a.enable(8),w.premultipliedAlpha&&a.enable(9),w.shadowMapEnabled&&a.enable(10),w.doubleSided&&a.enable(11),w.flipSided&&a.enable(12),w.useDepthPacking&&a.enable(13),w.dithering&&a.enable(14),w.transmission&&a.enable(15),w.sheen&&a.enable(16),w.opaque&&a.enable(17),w.pointsUvs&&a.enable(18),w.decodeVideoTexture&&a.enable(19),w.decodeVideoTextureEmissive&&a.enable(20),w.alphaToCoverage&&a.enable(21),w.numLightProbeGrids>0&&a.enable(22),w.hasPositionAttribute&&a.enable(23),y.push(a.mask)}function _(y){let w=f[y.type],R;if(w){let L=Si[w];R=Ui.clone(L.uniforms)}else R=y.uniforms;return R}function x(y,w){let R=h.get(w);return R!==void 0?++R.usedTimes:(R=new rv(n,w,y,s),c.push(R),h.set(w,R)),R}function S(y){if(--y.usedTimes===0){let w=c.indexOf(y);c[w]=c[c.length-1],c.pop(),h.delete(y.cacheKey),y.destroy()}}function T(y){o.remove(y)}function A(){o.dispose()}return{getParameters:M,getProgramCacheKey:g,getUniforms:_,acquireProgram:x,releaseProgram:S,releaseShaderCache:T,programs:c,dispose:A}}function cv(){let n=new WeakMap;function e(a){return n.has(a)}function t(a){let o=n.get(a);return o===void 0&&(o={},n.set(a,o)),o}function i(a){n.delete(a)}function s(a,o,l){n.get(a)[o]=l}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function hv(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.materialVariant!==e.materialVariant?n.materialVariant-e.materialVariant:n.z!==e.z?n.z-e.z:n.id-e.id}function Jf(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function Kf(){let n=[],e=0,t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function a(d){let f=0;return d.isInstancedMesh&&(f+=2),d.isSkinnedMesh&&(f+=1),f}function o(d,f,m,M,g,p){let b=n[e];return b===void 0?(b={id:d.id,object:d,geometry:f,material:m,materialVariant:a(d),groupOrder:M,renderOrder:d.renderOrder,z:g,group:p},n[e]=b):(b.id=d.id,b.object=d,b.geometry=f,b.material=m,b.materialVariant=a(d),b.groupOrder=M,b.renderOrder=d.renderOrder,b.z=g,b.group=p),e++,b}function l(d,f,m,M,g,p,b){b.reversedDepth===!0&&(g=-g);let _=o(d,f,m,M,g,p);m.transmission>0?i.push(_):m.transparent===!0?s.push(_):t.push(_)}function c(d,f,m,M,g,p){let b=o(d,f,m,M,g,p);m.transmission>0?i.unshift(b):m.transparent===!0?s.unshift(b):t.unshift(b)}function h(d,f){t.length>1&&t.sort(d||hv),i.length>1&&i.sort(f||Jf),s.length>1&&s.sort(f||Jf)}function u(){for(let d=e,f=n.length;d<f;d++){let m=n[d];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:l,unshift:c,finish:u,sort:h}}function uv(){let n=new WeakMap;function e(i,s){let r=n.get(i),a;return r===void 0?(a=new Kf,n.set(i,[a])):s>=r.length?(a=new Kf,r.push(a)):a=r[s],a}function t(){n=new WeakMap}return{get:e,dispose:t}}function dv(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new P,color:new Ue};break;case"SpotLight":t={position:new P,direction:new P,color:new Ue,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new P,color:new Ue,distance:0,decay:0};break;case"HemisphereLight":t={direction:new P,skyColor:new Ue,groundColor:new Ue};break;case"RectAreaLight":t={color:new Ue,position:new P,halfWidth:new P,halfHeight:new P};break}return n[e.id]=t,t}}}function fv(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new he};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new he};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new he,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}var pv=0;function mv(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function gv(n){let e=new dv,t=fv(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new P);let s=new P,r=new Mt,a=new Mt;function o(c){let h=0,u=0,d=0;for(let F=0;F<9;F++)i.probe[F].set(0,0,0);let f=0,m=0,M=0,g=0,p=0,b=0,_=0,x=0,S=0,T=0,A=0,y=0,w=0,R=0;c.sort(mv);for(let F=0,z=c.length;F<z;F++){let I=c[F],U=I.color,G=I.intensity,W=I.distance,K=null;if(I.shadow&&I.shadow.map&&(I.shadow.map.texture.format===us?K=I.shadow.map.texture:K=I.shadow.map.depthTexture||I.shadow.map.texture),I.isAmbientLight)h+=U.r*G,u+=U.g*G,d+=U.b*G;else if(I.isLightProbe){for(let X=0;X<9;X++)i.probe[X].addScaledVector(I.sh.coefficients[X],G);R++}else if(I.isSunLight){let X=e.get(I);if(X.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let $=I.shadow,ne=t.get(I);ne.shadowIntensity=$.intensity,ne.shadowBias=$.bias,ne.shadowNormalBias=$.normalBias,ne.shadowRadius=$.radius,ne.shadowMapSize.copy($.mapSize).multiply($.getFrameExtents()),i.sunShadow[m]=ne,i.sunShadowMap[m]=K;let Ie=$.getViewportCount();for(let Ce=0;Ce<Ie;Ce++)i.sunShadowMatrix[M+Ce]=$.getMatrix(Ce),i.sunShadowCascade[M+Ce]=$._cascadeData[Ce];M+=Ie,m++}i.sun[f]=X,f++}else if(I.isDirectionalLight){let X=e.get(I);if(X.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let $=I.shadow,ne=t.get(I);ne.shadowIntensity=$.intensity,ne.shadowBias=$.bias,ne.shadowNormalBias=$.normalBias,ne.shadowRadius=$.radius,ne.shadowMapSize=$.mapSize,i.directionalShadow[g]=ne,i.directionalShadowMap[g]=K,i.directionalShadowMatrix[g]=I.shadow.matrix,S++}i.directional[g]=X,g++}else if(I.isSpotLight){let X=e.get(I);X.position.setFromMatrixPosition(I.matrixWorld),X.color.copy(U).multiplyScalar(G),X.distance=W,X.coneCos=Math.cos(I.angle),X.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),X.decay=I.decay,i.spot[b]=X;let $=I.shadow;if(I.map&&(i.spotLightMap[y]=I.map,y++,$.updateMatrices(I),I.castShadow&&w++),i.spotLightMatrix[b]=$.matrix,I.castShadow){let ne=t.get(I);ne.shadowIntensity=$.intensity,ne.shadowBias=$.bias,ne.shadowNormalBias=$.normalBias,ne.shadowRadius=$.radius,ne.shadowMapSize=$.mapSize,i.spotShadow[b]=ne,i.spotShadowMap[b]=K,A++}b++}else if(I.isRectAreaLight){let X=e.get(I);X.color.copy(U).multiplyScalar(G),X.halfWidth.set(I.width*.5,0,0),X.halfHeight.set(0,I.height*.5,0),i.rectArea[_]=X,_++}else if(I.isPointLight){let X=e.get(I);if(X.color.copy(I.color).multiplyScalar(I.intensity),X.distance=I.distance,X.decay=I.decay,I.castShadow){let $=I.shadow,ne=t.get(I);ne.shadowIntensity=$.intensity,ne.shadowBias=$.bias,ne.shadowNormalBias=$.normalBias,ne.shadowRadius=$.radius,ne.shadowMapSize=$.mapSize,ne.shadowCameraNear=$.camera.near,ne.shadowCameraFar=$.camera.far,i.pointShadow[p]=ne,i.pointShadowMap[p]=K,i.pointShadowMatrix[p]=I.shadow.matrix,T++}i.point[p]=X,p++}else if(I.isHemisphereLight){let X=e.get(I);X.skyColor.copy(I.color).multiplyScalar(G),X.groundColor.copy(I.groundColor).multiplyScalar(G),i.hemi[x]=X,x++}}_>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=Te.LTC_FLOAT_1,i.rectAreaLTC2=Te.LTC_FLOAT_2):(i.rectAreaLTC1=Te.LTC_HALF_1,i.rectAreaLTC2=Te.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=u,i.ambient[2]=d;let L=i.hash;(L.sunLength!==f||L.directionalLength!==g||L.pointLength!==p||L.spotLength!==b||L.rectAreaLength!==_||L.hemiLength!==x||L.numSunShadows!==m||L.numDirectionalShadows!==S||L.numPointShadows!==T||L.numSpotShadows!==A||L.numSpotMaps!==y||L.numLightProbes!==R)&&(i.sun.length=f,i.directional.length=g,i.spot.length=b,i.rectArea.length=_,i.point.length=p,i.hemi.length=x,i.sunShadow.length=m,i.sunShadowMap.length=m,i.sunShadowMatrix.length=M,i.sunShadowCascade.length=M,i.directionalShadow.length=S,i.directionalShadowMap.length=S,i.directionalShadowMatrix.length=S,i.pointShadow.length=T,i.pointShadowMap.length=T,i.pointShadowMatrix.length=T,i.spotShadow.length=A,i.spotShadowMap.length=A,i.spotLightMatrix.length=A+y-w,i.spotLightMap.length=y,i.numSpotLightShadowsWithMaps=w,i.numLightProbes=R,L.sunLength=f,L.directionalLength=g,L.pointLength=p,L.spotLength=b,L.rectAreaLength=_,L.hemiLength=x,L.numSunShadows=m,L.numDirectionalShadows=S,L.numPointShadows=T,L.numSpotShadows=A,L.numSpotMaps=y,L.numLightProbes=R,i.version=pv++)}function l(c,h){let u=0,d=0,f=0,m=0,M=0,g=0,p=h.matrixWorldInverse;for(let b=0,_=c.length;b<_;b++){let x=c[b];if(x.isSunLight){let S=i.sun[u];S.direction.setFromMatrixPosition(x.matrixWorld),S.direction.transformDirection(p),u++}else if(x.isDirectionalLight){let S=i.directional[d];S.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(p),d++}else if(x.isSpotLight){let S=i.spot[m];S.position.setFromMatrixPosition(x.matrixWorld),S.position.applyMatrix4(p),S.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(p),m++}else if(x.isRectAreaLight){let S=i.rectArea[M];S.position.setFromMatrixPosition(x.matrixWorld),S.position.applyMatrix4(p),a.identity(),r.copy(x.matrixWorld),r.premultiply(p),a.extractRotation(r),S.halfWidth.set(x.width*.5,0,0),S.halfHeight.set(0,x.height*.5,0),S.halfWidth.applyMatrix4(a),S.halfHeight.applyMatrix4(a),M++}else if(x.isPointLight){let S=i.point[f];S.position.setFromMatrixPosition(x.matrixWorld),S.position.applyMatrix4(p),f++}else if(x.isHemisphereLight){let S=i.hemi[g];S.direction.setFromMatrixPosition(x.matrixWorld),S.direction.transformDirection(p),g++}}}return{setup:o,setupView:l,state:i}}function jf(n){let e=new gv(n),t=[],i=[],s=[];function r(d){u.camera=d,t.length=0,i.length=0,s.length=0}function a(d){t.push(d)}function o(d){i.push(d)}function l(d){s.push(d)}function c(){e.setup(t)}function h(d){e.setupView(t,d)}let u={lightsArray:t,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:c,setupLightsView:h,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function xv(n){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new jf(n),e.set(s,[o])):r>=a.length?(o=new jf(n),a.push(o)):o=a[r],o}function i(){e=new WeakMap}return{get:t,dispose:i}}var yv=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,_v=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,vv=[new P(1,0,0),new P(-1,0,0),new P(0,1,0),new P(0,-1,0),new P(0,0,1),new P(0,0,-1)],Mv=[new P(0,-1,0),new P(0,-1,0),new P(0,0,1),new P(0,0,-1),new P(0,-1,0),new P(0,-1,0)],Qf=new Mt,Ya=new P,mu=new P;function bv(n,e,t){let i=new lr,s=new he,r=new he,a=new Xt,o=new ml,l=new gl,c={},h=t.maxTextureSize,u={[as]:un,[un]:as,[qt]:qt},d=new Bt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new he},radius:{value:4}},vertexShader:yv,fragmentShader:_v}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let m=new Et;m.setAttribute("position",new Ht(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let M=new pe(m,d),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ia;let p=this.type;this.render=function(T,A,y){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||T.length===0)return;this.type===Il&&(Je("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Ia);let w=n.getRenderTarget(),R=n.getActiveCubeFace(),L=n.getActiveMipmapLevel(),F=n.state;F.setBlending(Kn),F.buffers.depth.getReversed()===!0?F.buffers.color.setClear(0,0,0,0):F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);let z=p!==this.type;z&&A.traverse(function(I){I.material&&(Array.isArray(I.material)?I.material.forEach(U=>U.needsUpdate=!0):I.material.needsUpdate=!0)});for(let I=0,U=T.length;I<U;I++){let G=T[I],W=G.shadow;if(W===void 0){Je("WebGLShadowMap:",G,"has no shadow.");continue}if(W.autoUpdate===!1&&W.needsUpdate===!1)continue;s.copy(W.mapSize);let K=W.getFrameExtents();s.multiply(K),r.copy(W.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/K.x),s.x=r.x*K.x,W.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/K.y),s.y=r.y*K.y,W.mapSize.y=r.y));let X=n.state.buffers.depth.getReversed();if(W.camera._reversedDepth=X,W.map===null||z===!0){if(W.map!==null&&(W.map.depthTexture!==null&&(W.map.depthTexture.dispose(),W.map.depthTexture=null),W.map.dispose()),this.type===gr){if(G.isPointLight){Je("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}W.map=new tn(s.x,s.y,{format:us,type:yn,minFilter:xn,magFilter:xn,generateMipmaps:!1}),W.map.texture.name=G.name+".shadowMap",W.map.depthTexture=new ts(s.x,s.y,jn),W.map.depthTexture.name=G.name+".shadowMapDepth",W.map.depthTexture.format=xi,W.map.depthTexture.compareFunction=null,W.map.depthTexture.minFilter=en,W.map.depthTexture.magFilter=en}else G.isPointLight?(W.map=new bc(s.x),W.map.depthTexture=new ol(s.x,ci)):(W.map=new tn(s.x,s.y),W.map.depthTexture=new ts(s.x,s.y,ci)),W.map.depthTexture.name=G.name+".shadowMap",W.map.depthTexture.format=xi,this.type===Ia?(W.map.depthTexture.compareFunction=X?yc:xc,W.map.depthTexture.minFilter=xn,W.map.depthTexture.magFilter=xn):(W.map.depthTexture.compareFunction=null,W.map.depthTexture.minFilter=en,W.map.depthTexture.magFilter=en);W.camera.updateProjectionMatrix()}W.map.isWebGLCubeRenderTarget!==!0&&(W.map.width!==s.x||W.map.height!==s.y)&&W.map.setSize(s.x,s.y);let $=W.map.isWebGLCubeRenderTarget?6:W.getViewportCount();G.isPointLight!==!0&&W.updateMatrices(G,y);for(let ne=0;ne<$;ne++){let Ie=W.getCamera(ne);if(G.isPointLight){let Ce=W.camera,gt=W.matrix,Ye=G.distance||Ce.far;Ye!==Ce.far&&(Ce.far=Ye,Ce.updateProjectionMatrix()),Ya.setFromMatrixPosition(G.matrixWorld),Ce.position.copy(Ya),mu.copy(Ce.position),mu.add(vv[ne]),Ce.up.copy(Mv[ne]),Ce.lookAt(mu),Ce.updateMatrixWorld(),gt.makeTranslation(-Ya.x,-Ya.y,-Ya.z),Qf.multiplyMatrices(Ce.projectionMatrix,Ce.matrixWorldInverse),W._frustum.setFromProjectionMatrix(Qf,Ce.coordinateSystem,Ce.reversedDepth)}if(W.map.isWebGLCubeRenderTarget)n.setRenderTarget(W.map,ne),n.clear();else{ne===0&&(n.setRenderTarget(W.map),n.clear());let Ce=W.getViewport(ne);a.set(r.x*Ce.x,r.y*Ce.y,r.x*Ce.z,r.y*Ce.w),F.viewport(a)}i=W.getFrustum(ne),x(A,y,Ie,G,this.type)}W.isPointLightShadow!==!0&&this.type===gr&&b(W,y),W.needsUpdate=!1}p=this.type,g.needsUpdate=!1,n.setRenderTarget(w,R,L)};function b(T,A){let y=e.update(M);d.defines.VSM_SAMPLES!==T.blurSamples&&(d.defines.VSM_SAMPLES=T.blurSamples,f.defines.VSM_SAMPLES=T.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),T.mapPass===null?T.mapPass=new tn(s.x,s.y,{format:us,type:yn}):(T.mapPass.width!==T.map.width||T.mapPass.height!==T.map.height)&&T.mapPass.setSize(T.map.width,T.map.height),d.uniforms.shadow_pass.value=T.map.depthTexture,d.uniforms.resolution.value.set(T.map.width,T.map.height),d.uniforms.radius.value=T.radius,n.setRenderTarget(T.mapPass),n.clear(),n.renderBufferDirect(A,null,y,d,M,null),f.uniforms.shadow_pass.value=T.mapPass.texture,f.uniforms.resolution.value.set(T.map.width,T.map.height),f.uniforms.radius.value=T.radius,n.setRenderTarget(T.map),n.clear(),n.renderBufferDirect(A,null,y,f,M,null)}function _(T,A,y,w){let R=null,L=y.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(L!==void 0)R=L;else if(R=y.isPointLight===!0?l:o,n.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0||A.alphaToCoverage===!0){let F=R.uuid,z=A.uuid,I=c[F];I===void 0&&(I={},c[F]=I);let U=I[z];U===void 0&&(U=R.clone(),I[z]=U,A.addEventListener("dispose",S)),R=U}if(R.visible=A.visible,R.wireframe=A.wireframe,w===gr?R.side=A.shadowSide!==null?A.shadowSide:A.side:R.side=A.shadowSide!==null?A.shadowSide:u[A.side],R.alphaMap=A.alphaMap,R.alphaTest=A.alphaToCoverage===!0?.5:A.alphaTest,R.map=A.map,R.clipShadows=A.clipShadows,R.clippingPlanes=A.clippingPlanes,R.clipIntersection=A.clipIntersection,R.displacementMap=A.displacementMap,R.displacementScale=A.displacementScale,R.displacementBias=A.displacementBias,R.wireframeLinewidth=A.wireframeLinewidth,R.linewidth=A.linewidth,y.isPointLight===!0&&R.isMeshDistanceMaterial===!0){let F=n.properties.get(R);F.light=y}return R}function x(T,A,y,w,R){if(T.visible===!1)return;if(T.layers.test(A.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&R===gr)&&(!T.frustumCulled||T.intersectsFrustum(i))){T.modelViewMatrix.multiplyMatrices(y.matrixWorldInverse,T.matrixWorld);let z=e.update(T),I=T.material;if(Array.isArray(I)){let U=z.groups;for(let G=0,W=U.length;G<W;G++){let K=U[G],X=I[K.materialIndex];if(X&&X.visible){let $=_(T,X,w,R);T.onBeforeShadow(n,T,A,y,z,$,K),n.renderBufferDirect(y,null,z,$,T,K),T.onAfterShadow(n,T,A,y,z,$,K)}}}else if(I.visible){let U=_(T,I,w,R);T.onBeforeShadow(n,T,A,y,z,U,null),n.renderBufferDirect(y,null,z,U,T,null),T.onAfterShadow(n,T,A,y,z,U,null)}}let F=T.children;for(let z=0,I=F.length;z<I;z++)x(F[z],A,y,w,R)}function S(T){T.target.removeEventListener("dispose",S);for(let y in c){let w=c[y],R=T.target.uuid;R in w&&(w[R].dispose(),delete w[R])}}}function Sv(n,e){function t(){let D=!1,ce=new Xt,Q=null,_e=new Xt(0,0,0,0);return{setMask:function(we){Q!==we&&!D&&(n.colorMask(we,we,we,we),Q=we)},setLocked:function(we){D=we},setClear:function(we,le,We,Oe,zt){zt===!0&&(we*=Oe,le*=Oe,We*=Oe),ce.set(we,le,We,Oe),_e.equals(ce)===!1&&(n.clearColor(we,le,We,Oe),_e.copy(ce))},reset:function(){D=!1,Q=null,_e.set(-1,0,0,0)}}}function i(){let D=!1,ce=!1,Q=null,_e=null,we=null;return{setReversed:function(le){if(ce!==le){let We=e.get("EXT_clip_control");le?We.clipControlEXT(We.LOWER_LEFT_EXT,We.ZERO_TO_ONE_EXT):We.clipControlEXT(We.LOWER_LEFT_EXT,We.NEGATIVE_ONE_TO_ONE_EXT),ce=le;let Oe=we;we=null,this.setClear(Oe)}},getReversed:function(){return ce},setTest:function(le){le?ae(n.DEPTH_TEST):ge(n.DEPTH_TEST)},setMask:function(le){Q!==le&&!D&&(n.depthMask(le),Q=le)},setFunc:function(le){if(ce&&(le=Tf[le]),_e!==le){switch(le){case Xo:n.depthFunc(n.NEVER);break;case qo:n.depthFunc(n.ALWAYS);break;case Yo:n.depthFunc(n.LESS);break;case er:n.depthFunc(n.LEQUAL);break;case Zo:n.depthFunc(n.EQUAL);break;case $o:n.depthFunc(n.GEQUAL);break;case Jo:n.depthFunc(n.GREATER);break;case Ko:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}_e=le}},setLocked:function(le){D=le},setClear:function(le){we!==le&&(we=le,ce&&(le=1-le),n.clearDepth(le))},reset:function(){D=!1,Q=null,_e=null,we=null,ce=!1}}}function s(){let D=!1,ce=null,Q=null,_e=null,we=null,le=null,We=null,Oe=null,zt=null;return{setTest:function(Dt){D||(Dt?ae(n.STENCIL_TEST):ge(n.STENCIL_TEST))},setMask:function(Dt){ce!==Dt&&!D&&(n.stencilMask(Dt),ce=Dt)},setFunc:function(Dt,ti,fi){(Q!==Dt||_e!==ti||we!==fi)&&(n.stencilFunc(Dt,ti,fi),Q=Dt,_e=ti,we=fi)},setOp:function(Dt,ti,fi){(le!==Dt||We!==ti||Oe!==fi)&&(n.stencilOp(Dt,ti,fi),le=Dt,We=ti,Oe=fi)},setLocked:function(Dt){D=Dt},setClear:function(Dt){zt!==Dt&&(n.clearStencil(Dt),zt=Dt)},reset:function(){D=!1,ce=null,Q=null,_e=null,we=null,le=null,We=null,Oe=null,zt=null}}}let r=new t,a=new i,o=new s,l=new WeakMap,c=new WeakMap,h={},u={},d={},f=new WeakMap,m=[],M=null,g=!1,p=null,b=null,_=null,x=null,S=null,T=null,A=null,y=new Ue(0,0,0),w=0,R=!1,L=null,F=null,z=null,I=null,U=null,G=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),W=!1,K=0,X=n.getParameter(n.VERSION);X.indexOf("WebGL")!==-1?(K=parseFloat(/^WebGL (\d)/.exec(X)[1]),W=K>=1):X.indexOf("OpenGL ES")!==-1&&(K=parseFloat(/^OpenGL ES (\d)/.exec(X)[1]),W=K>=2);let $=null,ne={},Ie=n.getParameter(n.SCISSOR_BOX),Ce=n.getParameter(n.VIEWPORT),gt=new Xt().fromArray(Ie),Ye=new Xt().fromArray(Ce);function ct(D,ce,Q,_e){let we=new Uint8Array(4),le=n.createTexture();n.bindTexture(D,le),n.texParameteri(D,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(D,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let We=0;We<Q;We++)D===n.TEXTURE_3D||D===n.TEXTURE_2D_ARRAY?n.texImage3D(ce,0,n.RGBA,1,1,_e,0,n.RGBA,n.UNSIGNED_BYTE,we):n.texImage2D(ce+We,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,we);return le}let ee={};ee[n.TEXTURE_2D]=ct(n.TEXTURE_2D,n.TEXTURE_2D,1),ee[n.TEXTURE_CUBE_MAP]=ct(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),ee[n.TEXTURE_2D_ARRAY]=ct(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),ee[n.TEXTURE_3D]=ct(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ae(n.DEPTH_TEST),a.setFunc(er),fe(!1),Me(Oh),ae(n.CULL_FACE),ue(Kn);function ae(D){h[D]!==!0&&(n.enable(D),h[D]=!0)}function ge(D){h[D]!==!1&&(n.disable(D),h[D]=!1)}function $e(D,ce){return d[D]!==ce?(n.bindFramebuffer(D,ce),d[D]=ce,D===n.DRAW_FRAMEBUFFER&&(d[n.FRAMEBUFFER]=ce),D===n.FRAMEBUFFER&&(d[n.DRAW_FRAMEBUFFER]=ce),!0):!1}function be(D,ce){let Q=m,_e=!1;if(D){Q=f.get(ce),Q===void 0&&(Q=[],f.set(ce,Q));let we=D.textures;if(Q.length!==we.length||Q[0]!==n.COLOR_ATTACHMENT0){for(let le=0,We=we.length;le<We;le++)Q[le]=n.COLOR_ATTACHMENT0+le;Q.length=we.length,_e=!0}}else Q[0]!==n.BACK&&(Q[0]=n.BACK,_e=!0);_e&&n.drawBuffers(Q)}function Qe(D){return M!==D?(n.useProgram(D),M=D,!0):!1}let At={[Rs]:n.FUNC_ADD,[Xd]:n.FUNC_SUBTRACT,[qd]:n.FUNC_REVERSE_SUBTRACT};At[Yd]=n.MIN,At[Zd]=n.MAX;let oe={[$d]:n.ZERO,[Jd]:n.ONE,[Kd]:n.SRC_COLOR,[zh]:n.SRC_ALPHA,[sf]:n.SRC_ALPHA_SATURATE,[tf]:n.DST_COLOR,[Qd]:n.DST_ALPHA,[jd]:n.ONE_MINUS_SRC_COLOR,[Gh]:n.ONE_MINUS_SRC_ALPHA,[nf]:n.ONE_MINUS_DST_COLOR,[ef]:n.ONE_MINUS_DST_ALPHA,[rf]:n.CONSTANT_COLOR,[af]:n.ONE_MINUS_CONSTANT_COLOR,[of]:n.CONSTANT_ALPHA,[lf]:n.ONE_MINUS_CONSTANT_ALPHA};function ue(D,ce,Q,_e,we,le,We,Oe,zt,Dt){if(D===Kn){g===!0&&(ge(n.BLEND),g=!1);return}if(g===!1&&(ae(n.BLEND),g=!0),D!==Wd){if(D!==p||Dt!==R){if((b!==Rs||S!==Rs)&&(n.blendEquation(n.FUNC_ADD),b=Rs,S=Rs),Dt)switch(D){case os:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case sn:n.blendFunc(n.ONE,n.ONE);break;case kh:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Hh:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:tt("WebGLState: Invalid blending: ",D);break}else switch(D){case os:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case sn:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case kh:tt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Hh:tt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:tt("WebGLState: Invalid blending: ",D);break}_=null,x=null,T=null,A=null,y.set(0,0,0),w=0,p=D,R=Dt}return}we=we||ce,le=le||Q,We=We||_e,(ce!==b||we!==S)&&(n.blendEquationSeparate(At[ce],At[we]),b=ce,S=we),(Q!==_||_e!==x||le!==T||We!==A)&&(n.blendFuncSeparate(oe[Q],oe[_e],oe[le],oe[We]),_=Q,x=_e,T=le,A=We),(Oe.equals(y)===!1||zt!==w)&&(n.blendColor(Oe.r,Oe.g,Oe.b,zt),y.copy(Oe),w=zt),p=D,R=!1}function de(D,ce){D.side===qt?ge(n.CULL_FACE):ae(n.CULL_FACE);let Q=D.side===un;ce&&(Q=!Q),fe(Q),D.blending===os&&D.transparent===!1?ue(Kn):ue(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),a.setFunc(D.depthFunc),a.setTest(D.depthTest),a.setMask(D.depthWrite),r.setMask(D.colorWrite);let _e=D.stencilWrite;o.setTest(_e),_e&&(o.setMask(D.stencilWriteMask),o.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),o.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),Ve(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?ae(n.SAMPLE_ALPHA_TO_COVERAGE):ge(n.SAMPLE_ALPHA_TO_COVERAGE)}function fe(D){L!==D&&(D?n.frontFace(n.CW):n.frontFace(n.CCW),L=D)}function Me(D){D!==Gd?(ae(n.CULL_FACE),D!==F&&(D===Oh?n.cullFace(n.BACK):D===Vd?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):ge(n.CULL_FACE),F=D}function ze(D){D!==z&&(W&&n.lineWidth(D),z=D)}function Ve(D,ce,Q){D?(ae(n.POLYGON_OFFSET_FILL),(I!==ce||U!==Q)&&(I=ce,U=Q,a.getReversed()&&(ce=-ce),n.polygonOffset(ce,Q))):ge(n.POLYGON_OFFSET_FILL)}function Ke(D){D?ae(n.SCISSOR_TEST):ge(n.SCISSOR_TEST)}function et(D){D===void 0&&(D=n.TEXTURE0+G-1),$!==D&&(n.activeTexture(D),$=D)}function B(D,ce,Q){Q===void 0&&($===null?Q=n.TEXTURE0+G-1:Q=$);let _e=ne[Q];_e===void 0&&(_e={type:void 0,texture:void 0},ne[Q]=_e),(_e.type!==D||_e.texture!==ce)&&($!==Q&&(n.activeTexture(Q),$=Q),n.bindTexture(D,ce||ee[D]),_e.type=D,_e.texture=ce)}function Rt(){let D=ne[$];D!==void 0&&D.type!==void 0&&(n.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function rt(){try{n.compressedTexImage2D(...arguments)}catch(D){tt("WebGLState:",D)}}function C(){try{n.compressedTexImage3D(...arguments)}catch(D){tt("WebGLState:",D)}}function v(){try{n.texSubImage2D(...arguments)}catch(D){tt("WebGLState:",D)}}function V(){try{n.texSubImage3D(...arguments)}catch(D){tt("WebGLState:",D)}}function Z(){try{n.compressedTexSubImage2D(...arguments)}catch(D){tt("WebGLState:",D)}}function te(){try{n.compressedTexSubImage3D(...arguments)}catch(D){tt("WebGLState:",D)}}function xe(){try{n.texStorage2D(...arguments)}catch(D){tt("WebGLState:",D)}}function ve(){try{n.texStorage3D(...arguments)}catch(D){tt("WebGLState:",D)}}function ie(){try{n.texImage2D(...arguments)}catch(D){tt("WebGLState:",D)}}function re(){try{n.texImage3D(...arguments)}catch(D){tt("WebGLState:",D)}}function Se(D){return u[D]!==void 0?u[D]:n.getParameter(D)}function Ge(D,ce){u[D]!==ce&&(n.pixelStorei(D,ce),u[D]=ce)}function Ee(D){gt.equals(D)===!1&&(n.scissor(D.x,D.y,D.z,D.w),gt.copy(D))}function H(D){Ye.equals(D)===!1&&(n.viewport(D.x,D.y,D.z,D.w),Ye.copy(D))}function J(D,ce){let Q=c.get(ce);Q===void 0&&(Q=new WeakMap,c.set(ce,Q));let _e=Q.get(D);_e===void 0&&(_e=n.getUniformBlockIndex(ce,D.name),Q.set(D,_e))}function se(D,ce){let _e=c.get(ce).get(D);l.get(ce)!==_e&&(n.uniformBlockBinding(ce,_e,D.__bindingPointIndex),l.set(ce,_e))}function me(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),a.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),n.pixelStorei(n.PACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!1),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,n.BROWSER_DEFAULT_WEBGL),n.pixelStorei(n.PACK_ROW_LENGTH,0),n.pixelStorei(n.PACK_SKIP_PIXELS,0),n.pixelStorei(n.PACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_ROW_LENGTH,0),n.pixelStorei(n.UNPACK_IMAGE_HEIGHT,0),n.pixelStorei(n.UNPACK_SKIP_PIXELS,0),n.pixelStorei(n.UNPACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_SKIP_IMAGES,0),h={},u={},$=null,ne={},d={},f=new WeakMap,m=[],M=null,g=!1,p=null,b=null,_=null,x=null,S=null,T=null,A=null,y=new Ue(0,0,0),w=0,R=!1,L=null,F=null,z=null,I=null,U=null,gt.set(0,0,n.canvas.width,n.canvas.height),Ye.set(0,0,n.canvas.width,n.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:ae,disable:ge,bindFramebuffer:$e,drawBuffers:be,useProgram:Qe,setBlending:ue,setMaterial:de,setFlipSided:fe,setCullFace:Me,setLineWidth:ze,setPolygonOffset:Ve,setScissorTest:Ke,activeTexture:et,bindTexture:B,unbindTexture:Rt,compressedTexImage2D:rt,compressedTexImage3D:C,texImage2D:ie,texImage3D:re,pixelStorei:Ge,getParameter:Se,updateUBOMapping:J,uniformBlockBinding:se,texStorage2D:xe,texStorage3D:ve,texSubImage2D:v,texSubImage3D:V,compressedTexSubImage2D:Z,compressedTexSubImage3D:te,scissor:Ee,viewport:H,reset:me}}function Ev(n,e,t,i,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new he,h=new WeakMap,u=new Set,d,f=new WeakMap,m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function M(C,v){return m?new OffscreenCanvas(C,v):ta("canvas")}function g(C,v,V){let Z=1,te=rt(C);if((te.width>V||te.height>V)&&(Z=V/Math.max(te.width,te.height)),Z<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){let xe=Math.floor(Z*te.width),ve=Math.floor(Z*te.height);d===void 0&&(d=M(xe,ve));let ie=v?M(xe,ve):d;return ie.width=xe,ie.height=ve,ie.getContext("2d").drawImage(C,0,0,xe,ve),Je("WebGLRenderer: Texture has been resized from ("+te.width+"x"+te.height+") to ("+xe+"x"+ve+")."),ie}else return"data"in C&&Je("WebGLRenderer: Image in DataTexture is too big ("+te.width+"x"+te.height+")."),C;return C}function p(C){return C.generateMipmaps}function b(C){n.generateMipmap(C)}function _(C){return C.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?n.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function x(C,v,V,Z,te,xe=!1){if(C!==null){if(n[C]!==void 0)return n[C];Je("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let ve;Z&&(ve=e.get("EXT_texture_norm16"),ve||Je("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let ie=v;if(v===n.RED&&(V===n.FLOAT&&(ie=n.R32F),V===n.HALF_FLOAT&&(ie=n.R16F),V===n.UNSIGNED_BYTE&&(ie=n.R8),V===n.UNSIGNED_SHORT&&ve&&(ie=ve.R16_EXT),V===n.SHORT&&ve&&(ie=ve.R16_SNORM_EXT)),v===n.RED_INTEGER&&(V===n.UNSIGNED_BYTE&&(ie=n.R8UI),V===n.UNSIGNED_SHORT&&(ie=n.R16UI),V===n.UNSIGNED_INT&&(ie=n.R32UI),V===n.BYTE&&(ie=n.R8I),V===n.SHORT&&(ie=n.R16I),V===n.INT&&(ie=n.R32I)),v===n.RG&&(V===n.FLOAT&&(ie=n.RG32F),V===n.HALF_FLOAT&&(ie=n.RG16F),V===n.UNSIGNED_BYTE&&(ie=n.RG8),V===n.UNSIGNED_SHORT&&ve&&(ie=ve.RG16_EXT),V===n.SHORT&&ve&&(ie=ve.RG16_SNORM_EXT)),v===n.RG_INTEGER&&(V===n.UNSIGNED_BYTE&&(ie=n.RG8UI),V===n.UNSIGNED_SHORT&&(ie=n.RG16UI),V===n.UNSIGNED_INT&&(ie=n.RG32UI),V===n.BYTE&&(ie=n.RG8I),V===n.SHORT&&(ie=n.RG16I),V===n.INT&&(ie=n.RG32I)),v===n.RGB_INTEGER&&(V===n.UNSIGNED_BYTE&&(ie=n.RGB8UI),V===n.UNSIGNED_SHORT&&(ie=n.RGB16UI),V===n.UNSIGNED_INT&&(ie=n.RGB32UI),V===n.BYTE&&(ie=n.RGB8I),V===n.SHORT&&(ie=n.RGB16I),V===n.INT&&(ie=n.RGB32I)),v===n.RGBA_INTEGER&&(V===n.UNSIGNED_BYTE&&(ie=n.RGBA8UI),V===n.UNSIGNED_SHORT&&(ie=n.RGBA16UI),V===n.UNSIGNED_INT&&(ie=n.RGBA32UI),V===n.BYTE&&(ie=n.RGBA8I),V===n.SHORT&&(ie=n.RGBA16I),V===n.INT&&(ie=n.RGBA32I)),v===n.RGB&&(V===n.UNSIGNED_SHORT&&ve&&(ie=ve.RGB16_EXT),V===n.SHORT&&ve&&(ie=ve.RGB16_SNORM_EXT),V===n.UNSIGNED_INT_5_9_9_9_REV&&(ie=n.RGB9_E5),V===n.UNSIGNED_INT_10F_11F_11F_REV&&(ie=n.R11F_G11F_B10F)),v===n.RGBA){let re=xe?ea:yt.getTransfer(te);V===n.FLOAT&&(ie=n.RGBA32F),V===n.HALF_FLOAT&&(ie=n.RGBA16F),V===n.UNSIGNED_BYTE&&(ie=re===Ct?n.SRGB8_ALPHA8:n.RGBA8),V===n.UNSIGNED_SHORT&&ve&&(ie=ve.RGBA16_EXT),V===n.SHORT&&ve&&(ie=ve.RGBA16_SNORM_EXT),V===n.UNSIGNED_SHORT_4_4_4_4&&(ie=n.RGBA4),V===n.UNSIGNED_SHORT_5_5_5_1&&(ie=n.RGB5_A1)}return(ie===n.R16F||ie===n.R32F||ie===n.RG16F||ie===n.RG32F||ie===n.RGBA16F||ie===n.RGBA32F)&&e.get("EXT_color_buffer_float"),ie}function S(C,v){let V;return C?v===null||v===ci||v===yr?V=n.DEPTH24_STENCIL8:v===jn?V=n.DEPTH32F_STENCIL8:v===xr&&(V=n.DEPTH24_STENCIL8,Je("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):v===null||v===ci||v===yr?V=n.DEPTH_COMPONENT24:v===jn?V=n.DEPTH_COMPONENT32F:v===xr&&(V=n.DEPTH_COMPONENT16),V}function T(C,v){return p(C)===!0||C.isFramebufferTexture&&C.minFilter!==en&&C.minFilter!==xn?Math.log2(Math.max(v.width,v.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?v.mipmaps.length:1}function A(C){let v=C.target;v.removeEventListener("dispose",A),w(v),v.isVideoTexture&&h.delete(v),v.isHTMLTexture&&u.delete(v)}function y(C){let v=C.target;v.removeEventListener("dispose",y),L(v)}function w(C){let v=i.get(C);if(v.__webglInit===void 0)return;let V=C.source,Z=f.get(V);if(Z){let te=Z[v.__cacheKey];te.usedTimes--,te.usedTimes===0&&R(C),Object.keys(Z).length===0&&f.delete(V)}i.remove(C)}function R(C){let v=i.get(C);n.deleteTexture(v.__webglTexture);let V=C.source,Z=f.get(V);delete Z[v.__cacheKey],a.memory.textures--}function L(C){let v=i.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),i.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(v.__webglFramebuffer[Z]))for(let te=0;te<v.__webglFramebuffer[Z].length;te++)n.deleteFramebuffer(v.__webglFramebuffer[Z][te]);else n.deleteFramebuffer(v.__webglFramebuffer[Z]);v.__webglDepthbuffer&&n.deleteRenderbuffer(v.__webglDepthbuffer[Z])}else{if(Array.isArray(v.__webglFramebuffer))for(let Z=0;Z<v.__webglFramebuffer.length;Z++)n.deleteFramebuffer(v.__webglFramebuffer[Z]);else n.deleteFramebuffer(v.__webglFramebuffer);if(v.__webglDepthbuffer&&n.deleteRenderbuffer(v.__webglDepthbuffer),v.__webglMultisampledFramebuffer&&n.deleteFramebuffer(v.__webglMultisampledFramebuffer),v.__webglColorRenderbuffer)for(let Z=0;Z<v.__webglColorRenderbuffer.length;Z++)v.__webglColorRenderbuffer[Z]&&n.deleteRenderbuffer(v.__webglColorRenderbuffer[Z]);v.__webglDepthRenderbuffer&&n.deleteRenderbuffer(v.__webglDepthRenderbuffer)}let V=C.textures;for(let Z=0,te=V.length;Z<te;Z++){let xe=i.get(V[Z]);xe.__webglTexture&&(n.deleteTexture(xe.__webglTexture),a.memory.textures--),i.remove(V[Z])}i.remove(C)}let F=0;function z(){F=0}function I(){return F}function U(C){F=C}function G(){let C=F;return C>=s.maxTextures&&Je("WebGLTextures: Trying to use "+(C+1)+" texture units while this GPU supports only "+s.maxTextures),F+=1,C}function W(C){let v=[];return v.push(C.wrapS),v.push(C.wrapT),v.push(C.wrapR||0),v.push(C.magFilter),v.push(C.minFilter),v.push(C.anisotropy),v.push(C.internalFormat),v.push(C.format),v.push(C.type),v.push(C.generateMipmaps),v.push(C.premultiplyAlpha),v.push(C.flipY),v.push(C.unpackAlignment),v.push(C.colorSpace),v.join()}function K(C,v){let V=i.get(C);if(C.isVideoTexture&&B(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&V.__version!==C.version){let Z=C.image;if(Z===null)Je("WebGLRenderer: Texture marked for update but no image data found.");else if(Z.complete===!1)Je("WebGLRenderer: Texture marked for update but image is incomplete");else{ge(V,C,v);return}}else C.isExternalTexture&&(V.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,V.__webglTexture,n.TEXTURE0+v)}function X(C,v){let V=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&V.__version!==C.version){ge(V,C,v);return}else C.isExternalTexture&&(V.__webglTexture=C.sourceTexture?C.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,V.__webglTexture,n.TEXTURE0+v)}function $(C,v){let V=i.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&V.__version!==C.version){ge(V,C,v);return}t.bindTexture(n.TEXTURE_3D,V.__webglTexture,n.TEXTURE0+v)}function ne(C,v){let V=i.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&V.__version!==C.version){$e(V,C,v);return}t.bindTexture(n.TEXTURE_CUBE_MAP,V.__webglTexture,n.TEXTURE0+v)}let Ie={[Es]:n.REPEAT,[gi]:n.CLAMP_TO_EDGE,[jo]:n.MIRRORED_REPEAT},Ce={[en]:n.NEAREST,[uf]:n.NEAREST_MIPMAP_NEAREST,[Oa]:n.NEAREST_MIPMAP_LINEAR,[xn]:n.LINEAR,[Ll]:n.LINEAR_MIPMAP_NEAREST,[cs]:n.LINEAR_MIPMAP_LINEAR},gt={[mf]:n.NEVER,[vf]:n.ALWAYS,[gf]:n.LESS,[xc]:n.LEQUAL,[xf]:n.EQUAL,[yc]:n.GEQUAL,[yf]:n.GREATER,[_f]:n.NOTEQUAL};function Ye(C,v){if(v.type===jn&&e.has("OES_texture_float_linear")===!1&&(v.magFilter===xn||v.magFilter===Ll||v.magFilter===Oa||v.magFilter===cs||v.minFilter===xn||v.minFilter===Ll||v.minFilter===Oa||v.minFilter===cs)&&Je("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(C,n.TEXTURE_WRAP_S,Ie[v.wrapS]),n.texParameteri(C,n.TEXTURE_WRAP_T,Ie[v.wrapT]),(C===n.TEXTURE_3D||C===n.TEXTURE_2D_ARRAY)&&n.texParameteri(C,n.TEXTURE_WRAP_R,Ie[v.wrapR]),n.texParameteri(C,n.TEXTURE_MAG_FILTER,Ce[v.magFilter]),n.texParameteri(C,n.TEXTURE_MIN_FILTER,Ce[v.minFilter]),v.compareFunction&&(n.texParameteri(C,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(C,n.TEXTURE_COMPARE_FUNC,gt[v.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(v.magFilter===en||v.minFilter!==Oa&&v.minFilter!==cs||v.type===jn&&e.has("OES_texture_float_linear")===!1)return;if(v.anisotropy>1||i.get(v).__currentAnisotropy){let V=e.get("EXT_texture_filter_anisotropic");n.texParameterf(C,V.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,s.getMaxAnisotropy())),i.get(v).__currentAnisotropy=v.anisotropy}}}function ct(C,v){let V=!1;C.__webglInit===void 0&&(C.__webglInit=!0,v.addEventListener("dispose",A));let Z=v.source,te=f.get(Z);te===void 0&&(te={},f.set(Z,te));let xe=W(v);if(xe!==C.__cacheKey){te[xe]===void 0&&(te[xe]={texture:n.createTexture(),usedTimes:0},a.memory.textures++,V=!0),te[xe].usedTimes++;let ve=te[C.__cacheKey];ve!==void 0&&(te[C.__cacheKey].usedTimes--,ve.usedTimes===0&&R(v)),C.__cacheKey=xe,C.__webglTexture=te[xe].texture}return V}function ee(C,v,V){return Math.floor(Math.floor(C/V)/v)}function ae(C,v,V,Z){let xe=C.updateRanges;if(xe.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,v.width,v.height,V,Z,v.data);else{xe.sort((Ge,Ee)=>Ge.start-Ee.start);let ve=0;for(let Ge=1;Ge<xe.length;Ge++){let Ee=xe[ve],H=xe[Ge],J=Ee.start+Ee.count,se=ee(H.start,v.width,4),me=ee(Ee.start,v.width,4);H.start<=J+1&&se===me&&ee(H.start+H.count-1,v.width,4)===se?Ee.count=Math.max(Ee.count,H.start+H.count-Ee.start):(++ve,xe[ve]=H)}xe.length=ve+1;let ie=t.getParameter(n.UNPACK_ROW_LENGTH),re=t.getParameter(n.UNPACK_SKIP_PIXELS),Se=t.getParameter(n.UNPACK_SKIP_ROWS);t.pixelStorei(n.UNPACK_ROW_LENGTH,v.width);for(let Ge=0,Ee=xe.length;Ge<Ee;Ge++){let H=xe[Ge],J=Math.floor(H.start/4),se=Math.ceil(H.count/4),me=J%v.width,D=Math.floor(J/v.width),ce=se,Q=1;t.pixelStorei(n.UNPACK_SKIP_PIXELS,me),t.pixelStorei(n.UNPACK_SKIP_ROWS,D),t.texSubImage2D(n.TEXTURE_2D,0,me,D,ce,Q,V,Z,v.data)}C.clearUpdateRanges(),t.pixelStorei(n.UNPACK_ROW_LENGTH,ie),t.pixelStorei(n.UNPACK_SKIP_PIXELS,re),t.pixelStorei(n.UNPACK_SKIP_ROWS,Se)}}function ge(C,v,V){let Z=n.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(Z=n.TEXTURE_2D_ARRAY),v.isData3DTexture&&(Z=n.TEXTURE_3D);let te=ct(C,v),xe=v.source;t.bindTexture(Z,C.__webglTexture,n.TEXTURE0+V);let ve=i.get(xe);if(xe.version!==ve.__version||te===!0){if(t.activeTexture(n.TEXTURE0+V),(typeof ImageBitmap<"u"&&v.image instanceof ImageBitmap)===!1){let Q=yt.getPrimaries(yt.workingColorSpace),_e=v.colorSpace===Ni?null:yt.getPrimaries(v.colorSpace),we=v.colorSpace===Ni||Q===_e?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,v.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,we)}t.pixelStorei(n.UNPACK_ALIGNMENT,v.unpackAlignment);let re=g(v.image,!1,s.maxTextureSize);re=Rt(v,re);let Se=r.convert(v.format,v.colorSpace),Ge=r.convert(v.type),Ee=x(v.internalFormat,Se,Ge,v.normalized,v.colorSpace,v.isVideoTexture);Ye(Z,v);let H,J=v.mipmaps,se=v.isVideoTexture!==!0,me=ve.__version===void 0||te===!0,D=xe.dataReady,ce=T(v,re);if(v.isDepthTexture)Ee=S(v.format===hs,v.type),me&&(se?t.texStorage2D(n.TEXTURE_2D,1,Ee,re.width,re.height):t.texImage2D(n.TEXTURE_2D,0,Ee,re.width,re.height,0,Se,Ge,null));else if(v.isDataTexture)if(J.length>0){se&&me&&t.texStorage2D(n.TEXTURE_2D,ce,Ee,J[0].width,J[0].height);for(let Q=0,_e=J.length;Q<_e;Q++)H=J[Q],se?D&&t.texSubImage2D(n.TEXTURE_2D,Q,0,0,H.width,H.height,Se,Ge,H.data):t.texImage2D(n.TEXTURE_2D,Q,Ee,H.width,H.height,0,Se,Ge,H.data);v.generateMipmaps=!1}else se?(me&&t.texStorage2D(n.TEXTURE_2D,ce,Ee,re.width,re.height),D&&ae(v,re,Se,Ge)):t.texImage2D(n.TEXTURE_2D,0,Ee,re.width,re.height,0,Se,Ge,re.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){se&&me&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ce,Ee,J[0].width,J[0].height,re.depth);for(let Q=0,_e=J.length;Q<_e;Q++)if(H=J[Q],v.format!==Fn)if(Se!==null)if(se){if(D)if(v.layerUpdates.size>0){let we=su(H.width,H.height,v.format,v.type);for(let le of v.layerUpdates){let We=H.data.subarray(le*we/H.data.BYTES_PER_ELEMENT,(le+1)*we/H.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Q,0,0,le,H.width,H.height,1,Se,We)}}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Q,0,0,0,H.width,H.height,re.depth,Se,H.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,Q,Ee,H.width,H.height,re.depth,0,H.data,0,0);else Je("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else se?D&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,Q,0,0,0,H.width,H.height,re.depth,Se,Ge,H.data):t.texImage3D(n.TEXTURE_2D_ARRAY,Q,Ee,H.width,H.height,re.depth,0,Se,Ge,H.data);v.layerUpdates.size>0&&v.clearLayerUpdates()}else{se&&me&&t.texStorage2D(n.TEXTURE_2D,ce,Ee,J[0].width,J[0].height);for(let Q=0,_e=J.length;Q<_e;Q++)H=J[Q],v.format!==Fn?Se!==null?se?D&&t.compressedTexSubImage2D(n.TEXTURE_2D,Q,0,0,H.width,H.height,Se,H.data):t.compressedTexImage2D(n.TEXTURE_2D,Q,Ee,H.width,H.height,0,H.data):Je("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):se?D&&t.texSubImage2D(n.TEXTURE_2D,Q,0,0,H.width,H.height,Se,Ge,H.data):t.texImage2D(n.TEXTURE_2D,Q,Ee,H.width,H.height,0,Se,Ge,H.data)}else if(v.isDataArrayTexture)if(se){if(me&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ce,Ee,re.width,re.height,re.depth),D)if(v.layerUpdates.size>0){let Q=su(re.width,re.height,v.format,v.type);for(let _e of v.layerUpdates){let we=re.data.subarray(_e*Q/re.data.BYTES_PER_ELEMENT,(_e+1)*Q/re.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,_e,re.width,re.height,1,Se,Ge,we)}v.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,re.width,re.height,re.depth,Se,Ge,re.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,Ee,re.width,re.height,re.depth,0,Se,Ge,re.data);else if(v.isData3DTexture)se?(me&&t.texStorage3D(n.TEXTURE_3D,ce,Ee,re.width,re.height,re.depth),D&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,re.width,re.height,re.depth,Se,Ge,re.data)):t.texImage3D(n.TEXTURE_3D,0,Ee,re.width,re.height,re.depth,0,Se,Ge,re.data);else if(v.isFramebufferTexture){if(me)if(se)t.texStorage2D(n.TEXTURE_2D,ce,Ee,re.width,re.height);else{let Q=re.width,_e=re.height;for(let we=0;we<ce;we++)t.texImage2D(n.TEXTURE_2D,we,Ee,Q,_e,0,Se,Ge,null),Q>>=1,_e>>=1}}else if(v.isHTMLTexture){if("texElementImage2D"in n){let Q=n.canvas;if(Q.hasAttribute("layoutsubtree")||Q.setAttribute("layoutsubtree","true"),re.parentNode!==Q){Q.appendChild(re),u.add(v),Q.onpaint=_e=>{let we=_e.changedElements;for(let le of u)we.includes(le.image)&&(le.needsUpdate=!0)},Q.requestPaint();return}if(n.texElementImage2D.length===3)n.texElementImage2D(n.TEXTURE_2D,n.RGBA8,re);else{let we=n.RGBA,le=n.RGBA,We=n.UNSIGNED_BYTE;n.texElementImage2D(n.TEXTURE_2D,0,we,le,We,re)}n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE)}}else if(J.length>0){if(se&&me){let Q=rt(J[0]);t.texStorage2D(n.TEXTURE_2D,ce,Ee,Q.width,Q.height)}for(let Q=0,_e=J.length;Q<_e;Q++)H=J[Q],se?D&&t.texSubImage2D(n.TEXTURE_2D,Q,0,0,Se,Ge,H):t.texImage2D(n.TEXTURE_2D,Q,Ee,Se,Ge,H);v.generateMipmaps=!1}else if(se){if(me){let Q=rt(re);t.texStorage2D(n.TEXTURE_2D,ce,Ee,Q.width,Q.height)}D&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,Se,Ge,re)}else t.texImage2D(n.TEXTURE_2D,0,Ee,Se,Ge,re);p(v)&&b(Z),ve.__version=xe.version,v.onUpdate&&v.onUpdate(v)}C.__version=v.version}function $e(C,v,V){if(v.image.length!==6)return;let Z=ct(C,v),te=v.source;t.bindTexture(n.TEXTURE_CUBE_MAP,C.__webglTexture,n.TEXTURE0+V);let xe=i.get(te);if(te.version!==xe.__version||Z===!0){t.activeTexture(n.TEXTURE0+V);let ve=yt.getPrimaries(yt.workingColorSpace),ie=v.colorSpace===Ni?null:yt.getPrimaries(v.colorSpace),re=v.colorSpace===Ni||ve===ie?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,v.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),t.pixelStorei(n.UNPACK_ALIGNMENT,v.unpackAlignment),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,re);let Se=v.isCompressedTexture||v.image[0].isCompressedTexture,Ge=v.image[0]&&v.image[0].isDataTexture,Ee=[];for(let le=0;le<6;le++)!Se&&!Ge?Ee[le]=g(v.image[le],!0,s.maxCubemapSize):Ee[le]=Ge?v.image[le].image:v.image[le],Ee[le]=Rt(v,Ee[le]);let H=Ee[0],J=r.convert(v.format,v.colorSpace),se=r.convert(v.type),me=x(v.internalFormat,J,se,v.normalized,v.colorSpace),D=v.isVideoTexture!==!0,ce=xe.__version===void 0||Z===!0,Q=te.dataReady,_e=T(v,H);Ye(n.TEXTURE_CUBE_MAP,v);let we;if(Se){D&&ce&&t.texStorage2D(n.TEXTURE_CUBE_MAP,_e,me,H.width,H.height);for(let le=0;le<6;le++){we=Ee[le].mipmaps;for(let We=0;We<we.length;We++){let Oe=we[We];v.format!==Fn?J!==null?D?Q&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,We,0,0,Oe.width,Oe.height,J,Oe.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,We,me,Oe.width,Oe.height,0,Oe.data):Je("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):D?Q&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,We,0,0,Oe.width,Oe.height,J,se,Oe.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,We,me,Oe.width,Oe.height,0,J,se,Oe.data)}}}else{if(we=v.mipmaps,D&&ce){we.length>0&&_e++;let le=rt(Ee[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,_e,me,le.width,le.height)}for(let le=0;le<6;le++)if(Ge){D?Q&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,0,0,0,Ee[le].width,Ee[le].height,J,se,Ee[le].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,0,me,Ee[le].width,Ee[le].height,0,J,se,Ee[le].data);for(let We=0;We<we.length;We++){let zt=we[We].image[le].image;D?Q&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,We+1,0,0,zt.width,zt.height,J,se,zt.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,We+1,me,zt.width,zt.height,0,J,se,zt.data)}}else{D?Q&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,0,0,0,J,se,Ee[le]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,0,me,J,se,Ee[le]);for(let We=0;We<we.length;We++){let Oe=we[We];D?Q&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,We+1,0,0,J,se,Oe.image[le]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,We+1,me,J,se,Oe.image[le])}}}p(v)&&b(n.TEXTURE_CUBE_MAP),xe.__version=te.version,v.onUpdate&&v.onUpdate(v)}C.__version=v.version}function be(C,v,V,Z,te,xe){let ve=r.convert(V.format,V.colorSpace),ie=r.convert(V.type),re=x(V.internalFormat,ve,ie,V.normalized,V.colorSpace),Se=i.get(v),Ge=i.get(V);if(Ge.__renderTarget=v,!Se.__hasExternalTextures){let Ee=Math.max(1,v.width>>xe),H=Math.max(1,v.height>>xe);te===n.TEXTURE_3D||te===n.TEXTURE_2D_ARRAY?t.texImage3D(te,xe,re,Ee,H,v.depth,0,ve,ie,null):t.texImage2D(te,xe,re,Ee,H,0,ve,ie,null)}t.bindFramebuffer(n.FRAMEBUFFER,C),et(v)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,Z,te,Ge.__webglTexture,0,Ke(v)):(te===n.TEXTURE_2D||te>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&te<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,Z,te,Ge.__webglTexture,xe),t.bindFramebuffer(n.FRAMEBUFFER,null)}function Qe(C,v,V){if(n.bindRenderbuffer(n.RENDERBUFFER,C),v.depthBuffer){let Z=v.depthTexture,te=Z&&Z.isDepthTexture?Z.type:null,xe=S(v.stencilBuffer,te),ve=v.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;et(v)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ke(v),xe,v.width,v.height):V?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ke(v),xe,v.width,v.height):n.renderbufferStorage(n.RENDERBUFFER,xe,v.width,v.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,ve,n.RENDERBUFFER,C)}else{let Z=v.textures;for(let te=0;te<Z.length;te++){let xe=Z[te],ve=r.convert(xe.format,xe.colorSpace),ie=r.convert(xe.type),re=x(xe.internalFormat,ve,ie,xe.normalized,xe.colorSpace);et(v)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ke(v),re,v.width,v.height):V?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ke(v),re,v.width,v.height):n.renderbufferStorage(n.RENDERBUFFER,re,v.width,v.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function At(C,v,V){let Z=v.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(n.FRAMEBUFFER,C),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let te=i.get(v.depthTexture);if(te.__renderTarget=v,(!te.__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),Z){if(te.__webglInit===void 0&&(te.__webglInit=!0,v.depthTexture.addEventListener("dispose",A)),te.__webglTexture===void 0){te.__webglTexture=n.createTexture(),t.bindTexture(n.TEXTURE_CUBE_MAP,te.__webglTexture),Ye(n.TEXTURE_CUBE_MAP,v.depthTexture);let Se=r.convert(v.depthTexture.format),Ge=r.convert(v.depthTexture.type),Ee;v.depthTexture.format===xi?Ee=n.DEPTH_COMPONENT24:v.depthTexture.format===hs&&(Ee=n.DEPTH24_STENCIL8);for(let H=0;H<6;H++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+H,0,Ee,v.width,v.height,0,Se,Ge,null)}}else K(v.depthTexture,0);let xe=te.__webglTexture,ve=Ke(v),ie=Z?n.TEXTURE_CUBE_MAP_POSITIVE_X+V:n.TEXTURE_2D,re=v.depthTexture.format===hs?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(v.depthTexture.format===xi)et(v)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,re,ie,xe,0,ve):n.framebufferTexture2D(n.FRAMEBUFFER,re,ie,xe,0);else if(v.depthTexture.format===hs)et(v)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,re,ie,xe,0,ve):n.framebufferTexture2D(n.FRAMEBUFFER,re,ie,xe,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function oe(C){let v=i.get(C),V=C.isWebGLCubeRenderTarget===!0;if(v.__boundDepthTexture!==C.depthTexture){let Z=C.depthTexture;if(v.__depthDisposeCallback&&v.__depthDisposeCallback(),Z){let te=()=>{delete v.__boundDepthTexture,delete v.__depthDisposeCallback,Z.removeEventListener("dispose",te)};Z.addEventListener("dispose",te),v.__depthDisposeCallback=te}v.__boundDepthTexture=Z}if(C.depthTexture&&!v.__autoAllocateDepthBuffer)if(V)for(let Z=0;Z<6;Z++)At(v.__webglFramebuffer[Z],C,Z);else{let Z=C.texture.mipmaps;Z&&Z.length>0?At(v.__webglFramebuffer[0],C,0):At(v.__webglFramebuffer,C,0)}else if(V){v.__webglDepthbuffer=[];for(let Z=0;Z<6;Z++)if(t.bindFramebuffer(n.FRAMEBUFFER,v.__webglFramebuffer[Z]),v.__webglDepthbuffer[Z]===void 0)v.__webglDepthbuffer[Z]=n.createRenderbuffer(),Qe(v.__webglDepthbuffer[Z],C,!1);else{let te=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,xe=v.__webglDepthbuffer[Z];n.bindRenderbuffer(n.RENDERBUFFER,xe),n.framebufferRenderbuffer(n.FRAMEBUFFER,te,n.RENDERBUFFER,xe)}}else{let Z=C.texture.mipmaps;if(Z&&Z.length>0?t.bindFramebuffer(n.FRAMEBUFFER,v.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer===void 0)v.__webglDepthbuffer=n.createRenderbuffer(),Qe(v.__webglDepthbuffer,C,!1);else{let te=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,xe=v.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,xe),n.framebufferRenderbuffer(n.FRAMEBUFFER,te,n.RENDERBUFFER,xe)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function ue(C,v,V){let Z=i.get(C);v!==void 0&&be(Z.__webglFramebuffer,C,C.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),V!==void 0&&oe(C)}function de(C){let v=C.texture,V=i.get(C),Z=i.get(v);C.addEventListener("dispose",y);let te=C.textures,xe=C.isWebGLCubeRenderTarget===!0,ve=te.length>1;if(ve||(Z.__webglTexture===void 0&&(Z.__webglTexture=n.createTexture()),Z.__version=v.version,a.memory.textures++),xe){V.__webglFramebuffer=[];for(let ie=0;ie<6;ie++)if(v.mipmaps&&v.mipmaps.length>0){V.__webglFramebuffer[ie]=[];for(let re=0;re<v.mipmaps.length;re++)V.__webglFramebuffer[ie][re]=n.createFramebuffer()}else V.__webglFramebuffer[ie]=n.createFramebuffer()}else{if(v.mipmaps&&v.mipmaps.length>0){V.__webglFramebuffer=[];for(let ie=0;ie<v.mipmaps.length;ie++)V.__webglFramebuffer[ie]=n.createFramebuffer()}else V.__webglFramebuffer=n.createFramebuffer();if(ve)for(let ie=0,re=te.length;ie<re;ie++){let Se=i.get(te[ie]);Se.__webglTexture===void 0&&(Se.__webglTexture=n.createTexture(),a.memory.textures++)}if(C.samples>0&&et(C)===!1){V.__webglMultisampledFramebuffer=n.createFramebuffer(),V.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,V.__webglMultisampledFramebuffer);for(let ie=0;ie<te.length;ie++){let re=te[ie];V.__webglColorRenderbuffer[ie]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,V.__webglColorRenderbuffer[ie]);let Se=r.convert(re.format,re.colorSpace),Ge=r.convert(re.type),Ee=x(re.internalFormat,Se,Ge,re.normalized,re.colorSpace,C.isXRRenderTarget===!0),H=Ke(C);n.renderbufferStorageMultisample(n.RENDERBUFFER,H,Ee,C.width,C.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ie,n.RENDERBUFFER,V.__webglColorRenderbuffer[ie])}n.bindRenderbuffer(n.RENDERBUFFER,null),C.depthBuffer&&(V.__webglDepthRenderbuffer=n.createRenderbuffer(),Qe(V.__webglDepthRenderbuffer,C,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(xe){t.bindTexture(n.TEXTURE_CUBE_MAP,Z.__webglTexture),Ye(n.TEXTURE_CUBE_MAP,v);for(let ie=0;ie<6;ie++)if(v.mipmaps&&v.mipmaps.length>0)for(let re=0;re<v.mipmaps.length;re++)be(V.__webglFramebuffer[ie][re],C,v,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,re);else be(V.__webglFramebuffer[ie],C,v,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0);p(v)&&b(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ve){for(let ie=0,re=te.length;ie<re;ie++){let Se=te[ie],Ge=i.get(Se),Ee=n.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(Ee=C.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(Ee,Ge.__webglTexture),Ye(Ee,Se),be(V.__webglFramebuffer,C,Se,n.COLOR_ATTACHMENT0+ie,Ee,0),p(Se)&&b(Ee)}t.unbindTexture()}else{let ie=n.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(ie=C.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(ie,Z.__webglTexture),Ye(ie,v),v.mipmaps&&v.mipmaps.length>0)for(let re=0;re<v.mipmaps.length;re++)be(V.__webglFramebuffer[re],C,v,n.COLOR_ATTACHMENT0,ie,re);else be(V.__webglFramebuffer,C,v,n.COLOR_ATTACHMENT0,ie,0);p(v)&&b(ie),t.unbindTexture()}C.depthBuffer&&oe(C)}function fe(C){let v=C.textures;for(let V=0,Z=v.length;V<Z;V++){let te=v[V];if(p(te)){let xe=_(C),ve=i.get(te).__webglTexture;t.bindTexture(xe,ve),b(xe),t.unbindTexture()}}}let Me=[],ze=[];function Ve(C){if(C.samples>0){if(et(C)===!1){let v=C.textures,V=C.width,Z=C.height,te=n.COLOR_BUFFER_BIT,xe=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ve=i.get(C),ie=v.length>1;if(ie)for(let Se=0;Se<v.length;Se++)t.bindFramebuffer(n.FRAMEBUFFER,ve.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Se,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,ve.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Se,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,ve.__webglMultisampledFramebuffer);let re=C.texture.mipmaps;re&&re.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,ve.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,ve.__webglFramebuffer);for(let Se=0;Se<v.length;Se++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(te|=n.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(te|=n.STENCIL_BUFFER_BIT)),ie){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,ve.__webglColorRenderbuffer[Se]);let Ge=i.get(v[Se]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Ge,0)}n.blitFramebuffer(0,0,V,Z,0,0,V,Z,te,n.NEAREST),l===!0&&(Me.length=0,ze.length=0,Me.push(n.COLOR_ATTACHMENT0+Se),C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&(Me.push(xe),ze.push(xe),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,ze)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,Me))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),ie)for(let Se=0;Se<v.length;Se++){t.bindFramebuffer(n.FRAMEBUFFER,ve.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Se,n.RENDERBUFFER,ve.__webglColorRenderbuffer[Se]);let Ge=i.get(v[Se]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,ve.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Se,n.TEXTURE_2D,Ge,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,ve.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&l){let v=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[v])}}}function Ke(C){return Math.min(s.maxSamples,C.samples)}function et(C){let v=i.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function B(C){let v=a.render.frame;h.get(C)!==v&&(h.set(C,v),C.update())}function Rt(C,v){let V=C.colorSpace,Z=C.format,te=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||V!==Qr&&V!==Ni&&(yt.getTransfer(V)===Ct?(Z!==Fn||te!==Un)&&Je("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):tt("WebGLTextures: Unsupported texture color space:",V)),v}function rt(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=G,this.resetTextureUnits=z,this.getTextureUnits=I,this.setTextureUnits=U,this.setTexture2D=K,this.setTexture2DArray=X,this.setTexture3D=$,this.setTextureCube=ne,this.rebindTextures=ue,this.setupRenderTarget=de,this.updateRenderTargetMipmap=fe,this.updateMultisampleRenderTarget=Ve,this.setupDepthRenderbuffer=oe,this.setupFrameBufferTexture=be,this.useMultisampledRTT=et,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function Tv(n,e){function t(i,s=Ni){let r,a=yt.getTransfer(s);if(i===Un)return n.UNSIGNED_BYTE;if(i===Ul)return n.UNSIGNED_SHORT_4_4_4_4;if(i===Fl)return n.UNSIGNED_SHORT_5_5_5_1;if(i===Yh)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===Zh)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===Xh)return n.BYTE;if(i===qh)return n.SHORT;if(i===xr)return n.UNSIGNED_SHORT;if(i===Nl)return n.INT;if(i===ci)return n.UNSIGNED_INT;if(i===jn)return n.FLOAT;if(i===yn)return n.HALF_FLOAT;if(i===$h)return n.ALPHA;if(i===Jh)return n.RGB;if(i===Fn)return n.RGBA;if(i===xi)return n.DEPTH_COMPONENT;if(i===hs)return n.DEPTH_STENCIL;if(i===Bl)return n.RED;if(i===Ol)return n.RED_INTEGER;if(i===us)return n.RG;if(i===kl)return n.RG_INTEGER;if(i===Hl)return n.RGBA_INTEGER;if(i===ka||i===Ha||i===za||i===Ga)if(a===Ct)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===ka)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Ha)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===za)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Ga)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===ka)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Ha)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===za)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Ga)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===zl||i===Gl||i===Vl||i===Wl)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===zl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Gl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Vl)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Wl)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Xl||i===ql||i===Yl||i===Zl||i===$l||i===Va||i===Jl)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Xl||i===ql)return a===Ct?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Yl)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===Zl)return r.COMPRESSED_R11_EAC;if(i===$l)return r.COMPRESSED_SIGNED_R11_EAC;if(i===Va)return r.COMPRESSED_RG11_EAC;if(i===Jl)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Kl||i===jl||i===Ql||i===ec||i===tc||i===nc||i===ic||i===sc||i===rc||i===ac||i===oc||i===lc||i===cc||i===hc)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===Kl)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===jl)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Ql)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===ec)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===tc)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===nc)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===ic)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===sc)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===rc)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===ac)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===oc)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===lc)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===cc)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===hc)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===uc||i===dc||i===fc)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===uc)return a===Ct?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===dc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===fc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===pc||i===mc||i===Wa||i===gc)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===pc)return r.COMPRESSED_RED_RGTC1_EXT;if(i===mc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Wa)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===gc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===yr?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}var wv=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Av=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Su=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let i=new ha(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,i=new Bt({vertexShader:wv,fragmentShader:Av,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new pe(new mn(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Eu=class extends yi{constructor(e,t){super();let i=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,d=null,f=null,m=null,M=typeof XRWebGLBinding<"u",g=new Su,p={},b=t.getContextAttributes(),_=null,x=null,S=[],T=[],A=new he,y=null,w=null,R=new gn;R.viewport=new Xt;let L=new gn;L.viewport=new Xt;let F=[R,L],z=new Rl,I=null,U=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(ee){let ae=S[ee];return ae===void 0&&(ae=new rr,S[ee]=ae),ae.getTargetRaySpace()},this.getControllerGrip=function(ee){let ae=S[ee];return ae===void 0&&(ae=new rr,S[ee]=ae),ae.getGripSpace()},this.getHand=function(ee){let ae=S[ee];return ae===void 0&&(ae=new rr,S[ee]=ae),ae.getHandSpace()};function G(ee){let ae=T.indexOf(ee.inputSource);if(ae===-1)return;let ge=S[ae];ge!==void 0&&(ge.update(ee.inputSource,ee.frame,c||a),ge.dispatchEvent({type:ee.type,data:ee.inputSource}))}function W(){s.removeEventListener("select",G),s.removeEventListener("selectstart",G),s.removeEventListener("selectend",G),s.removeEventListener("squeeze",G),s.removeEventListener("squeezestart",G),s.removeEventListener("squeezeend",G),s.removeEventListener("end",W),s.removeEventListener("inputsourceschange",K);for(let ee=0;ee<S.length;ee++){let ae=T[ee];ae!==null&&(T[ee]=null,S[ee].disconnect(ae))}I=null,U=null,g.reset();for(let ee in p)delete p[ee];if(e.setRenderTarget(_),f=null,d=null,u=null,s=null,x=null,ct.stop(),i.isPresenting=!1,e.setPixelRatio(y),e.setSize(A.width,A.height,!1),w!==null){let ee=w.camera;ee.fov=w.fov,ee.zoom=w.zoom,ee.updateProjectionMatrix(),w=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(ee){r=ee,i.isPresenting===!0&&Je("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(ee){o=ee,i.isPresenting===!0&&Je("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(ee){c=ee},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u===null&&M&&(u=new XRWebGLBinding(s,t)),u},this.getFrame=function(){return m},this.getSession=function(){return s},this.setSession=async function(ee){if(s=ee,s!==null){if(_=e.getRenderTarget(),s.addEventListener("select",G),s.addEventListener("selectstart",G),s.addEventListener("selectend",G),s.addEventListener("squeeze",G),s.addEventListener("squeezestart",G),s.addEventListener("squeezeend",G),s.addEventListener("end",W),s.addEventListener("inputsourceschange",K),b.xrCompatible!==!0&&await t.makeXRCompatible(),y=e.getPixelRatio(),e.getSize(A),M&&"createProjectionLayer"in XRWebGLBinding.prototype){let ge=null,$e=null,be=null;b.depth&&(be=b.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ge=b.stencil?hs:xi,$e=b.stencil?yr:ci);let Qe={colorFormat:t.RGBA8,depthFormat:be,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer(Qe),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),x=new tn(d.textureWidth,d.textureHeight,{format:Fn,type:Un,depthTexture:new ts(d.textureWidth,d.textureHeight,$e,void 0,void 0,void 0,void 0,void 0,void 0,ge),stencilBuffer:b.stencil,colorSpace:e.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let ge={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,ge),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),x=new tn(f.framebufferWidth,f.framebufferHeight,{format:Fn,type:Un,colorSpace:e.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),ct.setContext(s),ct.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function K(ee){for(let ae=0;ae<ee.removed.length;ae++){let ge=ee.removed[ae],$e=T.indexOf(ge);$e>=0&&(T[$e]=null,S[$e].disconnect(ge))}for(let ae=0;ae<ee.added.length;ae++){let ge=ee.added[ae],$e=T.indexOf(ge);if($e===-1){for(let Qe=0;Qe<S.length;Qe++)if(Qe>=T.length){T.push(ge),$e=Qe;break}else if(T[Qe]===null){T[Qe]=ge,$e=Qe;break}if($e===-1)break}let be=S[$e];be&&be.connect(ge)}}let X=new P,$=new P;function ne(ee,ae,ge){X.setFromMatrixPosition(ae.matrixWorld),$.setFromMatrixPosition(ge.matrixWorld);let $e=X.distanceTo($),be=ae.projectionMatrix.elements,Qe=ge.projectionMatrix.elements,At=be[14]/(be[10]-1),oe=be[14]/(be[10]+1),ue=(be[9]+1)/be[5],de=(be[9]-1)/be[5],fe=(be[8]-1)/be[0],Me=(Qe[8]+1)/Qe[0],ze=At*fe,Ve=At*Me,Ke=$e/(-fe+Me),et=Ke*-fe;if(ae.matrixWorld.decompose(ee.position,ee.quaternion,ee.scale),ee.translateX(et),ee.translateZ(Ke),ee.matrixWorld.compose(ee.position,ee.quaternion,ee.scale),ee.matrixWorldInverse.copy(ee.matrixWorld).invert(),be[10]===-1)ee.projectionMatrix.copy(ae.projectionMatrix),ee.projectionMatrixInverse.copy(ae.projectionMatrixInverse);else{let B=At+Ke,Rt=oe+Ke,rt=ze-et,C=Ve+($e-et),v=ue*oe/Rt*B,V=de*oe/Rt*B;ee.projectionMatrix.makePerspective(rt,C,v,V,B,Rt),ee.projectionMatrixInverse.copy(ee.projectionMatrix).invert()}}function Ie(ee,ae){ae===null?ee.matrixWorld.copy(ee.matrix):ee.matrixWorld.multiplyMatrices(ae.matrixWorld,ee.matrix),ee.matrixWorldInverse.copy(ee.matrixWorld).invert()}this.updateCamera=function(ee){if(s===null)return;let ae=ee.near,ge=ee.far;g.texture!==null&&(g.depthNear>0&&(ae=g.depthNear),g.depthFar>0&&(ge=g.depthFar)),z.near=L.near=R.near=ae,z.far=L.far=R.far=ge,(I!==z.near||U!==z.far)&&(s.updateRenderState({depthNear:z.near,depthFar:z.far}),I=z.near,U=z.far),z.layers.mask=ee.layers.mask|6,R.layers.mask=z.layers.mask&-5,L.layers.mask=z.layers.mask&-3;let $e=ee.parent,be=z.cameras;Ie(z,$e);for(let Qe=0;Qe<be.length;Qe++)Ie(be[Qe],$e);be.length===2?ne(z,R,L):z.projectionMatrix.copy(R.projectionMatrix),w===null&&ee.isPerspectiveCamera&&(w={camera:ee,fov:ee.fov,zoom:ee.zoom}),Ce(ee,z,$e)};function Ce(ee,ae,ge){ge===null?ee.matrix.copy(ae.matrixWorld):(ee.matrix.copy(ge.matrixWorld),ee.matrix.invert(),ee.matrix.multiply(ae.matrixWorld)),ee.matrix.decompose(ee.position,ee.quaternion,ee.scale),ee.updateMatrixWorld(!0),ee.projectionMatrix.copy(ae.projectionMatrix),ee.projectionMatrixInverse.copy(ae.projectionMatrixInverse),ee.isPerspectiveCamera&&(ee.fov=ir*2*Math.atan(1/ee.projectionMatrix.elements[5]),ee.zoom=1)}this.getCamera=function(){return z},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(ee){l=ee,d!==null&&(d.fixedFoveation=ee),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=ee)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(z)},this.getCameraTexture=function(ee){return p[ee]};let gt=null;function Ye(ee,ae){if(h=ae.getViewerPose(c||a),m=ae,h!==null){let ge=h.views;f!==null&&(e.setRenderTargetFramebuffer(x,f.framebuffer),e.setRenderTarget(x));let $e=!1;ge.length!==z.cameras.length&&(z.cameras.length=0,$e=!0);for(let oe=0;oe<ge.length;oe++){let ue=ge[oe],de=null;if(f!==null)de=f.getViewport(ue);else{let Me=u.getViewSubImage(d,ue);de=Me.viewport,oe===0&&(e.setRenderTargetTextures(x,Me.colorTexture,Me.depthStencilTexture),e.setRenderTarget(x))}let fe=F[oe];fe===void 0&&(fe=new gn,fe.layers.enable(oe),fe.viewport=new Xt,F[oe]=fe),fe.matrix.fromArray(ue.transform.matrix),fe.matrix.decompose(fe.position,fe.quaternion,fe.scale),fe.projectionMatrix.fromArray(ue.projectionMatrix),fe.projectionMatrixInverse.copy(fe.projectionMatrix).invert(),fe.viewport.set(de.x,de.y,de.width,de.height),oe===0&&(z.matrix.copy(fe.matrix),z.matrix.decompose(z.position,z.quaternion,z.scale)),$e===!0&&z.cameras.push(fe)}let be=s.enabledFeatures;if(be&&be.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&M){u=i.getBinding();let oe=u.getDepthInformation(ge[0]);oe&&oe.isValid&&oe.texture&&g.init(oe,s.renderState)}if(be&&be.includes("camera-access")&&M){e.state.unbindTexture(),u=i.getBinding();for(let oe=0;oe<ge.length;oe++){let ue=ge[oe].camera;if(ue){let de=p[ue];de||(de=new ha,p[ue]=de);let fe=u.getCameraImage(ue);de.sourceTexture=fe}}}}for(let ge=0;ge<S.length;ge++){let $e=T[ge],be=S[ge];$e!==null&&be!==void 0&&be.update($e,ae,c||a)}gt&&gt(ee,ae),ae.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:ae}),m=null}let ct=new ep;ct.setAnimationLoop(Ye),this.setAnimationLoop=function(ee){gt=ee},this.dispose=function(){}}},Rv=new Mt,ap=new at;ap.set(-1,0,0,0,1,0,0,0,1);function Cv(n,e){function t(g,p){g.matrixAutoUpdate===!0&&g.updateMatrix(),p.value.copy(g.matrix)}function i(g,p){p.color.getRGB(g.fogColor.value,tu(n)),p.isFog?(g.fogNear.value=p.near,g.fogFar.value=p.far):p.isFogExp2&&(g.fogDensity.value=p.density)}function s(g,p,b,_,x){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(g,p):p.isMeshLambertMaterial?(r(g,p),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(g,p),u(g,p)):p.isMeshPhongMaterial?(r(g,p),h(g,p),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(g,p),d(g,p),p.isMeshPhysicalMaterial&&f(g,p,x)):p.isMeshMatcapMaterial?(r(g,p),m(g,p)):p.isMeshDepthMaterial?r(g,p):p.isMeshDistanceMaterial?(r(g,p),M(g,p)):p.isMeshNormalMaterial?r(g,p):p.isLineBasicMaterial?(a(g,p),p.isLineDashedMaterial&&o(g,p)):p.isPointsMaterial?l(g,p,b,_):p.isSpriteMaterial?c(g,p):p.isShadowMaterial?(g.color.value.copy(p.color),g.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(g,p){g.opacity.value=p.opacity,p.color&&g.diffuse.value.copy(p.color),p.emissive&&g.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(g.map.value=p.map,t(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.bumpMap&&(g.bumpMap.value=p.bumpMap,t(p.bumpMap,g.bumpMapTransform),g.bumpScale.value=p.bumpScale,p.side===un&&(g.bumpScale.value*=-1)),p.normalMap&&(g.normalMap.value=p.normalMap,t(p.normalMap,g.normalMapTransform),g.normalScale.value.copy(p.normalScale),p.side===un&&g.normalScale.value.negate()),p.displacementMap&&(g.displacementMap.value=p.displacementMap,t(p.displacementMap,g.displacementMapTransform),g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias),p.emissiveMap&&(g.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,g.emissiveMapTransform)),p.specularMap&&(g.specularMap.value=p.specularMap,t(p.specularMap,g.specularMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest);let b=e.get(p),_=b.envMap,x=b.envMapRotation;_&&(g.envMap.value=_,g.envMapRotation.value.setFromMatrix4(Rv.makeRotationFromEuler(x)).transpose(),_.isCubeTexture&&_.isRenderTargetTexture===!1&&g.envMapRotation.value.premultiply(ap),g.reflectivity.value=p.reflectivity,g.ior.value=p.ior,g.refractionRatio.value=p.refractionRatio),p.lightMap&&(g.lightMap.value=p.lightMap,g.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,g.lightMapTransform)),p.aoMap&&(g.aoMap.value=p.aoMap,g.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,g.aoMapTransform))}function a(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,p.map&&(g.map.value=p.map,t(p.map,g.mapTransform))}function o(g,p){g.dashSize.value=p.dashSize,g.totalSize.value=p.dashSize+p.gapSize,g.scale.value=p.scale}function l(g,p,b,_){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.size.value=p.size*b,g.scale.value=_*.5,p.map&&(g.map.value=p.map,t(p.map,g.uvTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function c(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.rotation.value=p.rotation,p.map&&(g.map.value=p.map,t(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function h(g,p){g.specular.value.copy(p.specular),g.shininess.value=Math.max(p.shininess,1e-4)}function u(g,p){p.gradientMap&&(g.gradientMap.value=p.gradientMap)}function d(g,p){g.metalness.value=p.metalness,p.metalnessMap&&(g.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,g.metalnessMapTransform)),g.roughness.value=p.roughness,p.roughnessMap&&(g.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,g.roughnessMapTransform)),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)}function f(g,p,b){g.ior.value=p.ior,p.sheen>0&&(g.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),g.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(g.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,g.sheenColorMapTransform)),p.sheenRoughnessMap&&(g.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,g.sheenRoughnessMapTransform))),p.clearcoat>0&&(g.clearcoat.value=p.clearcoat,g.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(g.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,g.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(g.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===un&&g.clearcoatNormalScale.value.negate())),p.dispersion>0&&(g.dispersion.value=p.dispersion),p.retroreflectivity>0&&(g.retroreflectivity.value=p.retroreflectivity),p.iridescence>0&&(g.iridescence.value=p.iridescence,g.iridescenceIOR.value=p.iridescenceIOR,g.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(g.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,g.iridescenceMapTransform)),p.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),p.transmission>0&&(g.transmission.value=p.transmission,g.transmissionSamplerMap.value=b.texture,g.transmissionSamplerSize.value.set(b.width,b.height),p.transmissionMap&&(g.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,g.transmissionMapTransform)),g.thickness.value=p.thickness,p.thicknessMap&&(g.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=p.attenuationDistance,g.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(g.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(g.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=p.specularIntensity,g.specularColor.value.copy(p.specularColor),p.specularColorMap&&(g.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,g.specularColorMapTransform)),p.specularIntensityMap&&(g.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,g.specularIntensityMapTransform))}function m(g,p){p.matcap&&(g.matcap.value=p.matcap)}function M(g,p){let b=e.get(p).light;g.referencePosition.value.setFromMatrixPosition(b.matrixWorld),g.nearDistance.value=b.shadow.camera.near,g.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function Iv(n,e,t,i){let s={},r={},a=[],o=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(x,S){let T=S.program;i.uniformBlockBinding(x,T)}function c(x,S){let T=s[x.id];T===void 0&&(g(x),T=h(x),s[x.id]=T,x.addEventListener("dispose",b));let A=S.program;i.updateUBOMapping(x,A);let y=e.render.frame;r[x.id]!==y&&(d(x),r[x.id]=y)}function h(x){let S=u();x.__bindingPointIndex=S;let T=n.createBuffer(),A=x.__size,y=x.usage;return n.bindBuffer(n.UNIFORM_BUFFER,T),n.bufferData(n.UNIFORM_BUFFER,A,y),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,S,T),T}function u(){for(let x=0;x<o;x++)if(a.indexOf(x)===-1)return a.push(x),x;return tt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(x){let S=s[x.id],T=x.uniforms,A=x.__cache;n.bindBuffer(n.UNIFORM_BUFFER,S);for(let y=0,w=T.length;y<w;y++){let R=T[y];if(Array.isArray(R))for(let L=0,F=R.length;L<F;L++)f(R[L],y,L,A);else f(R,y,0,A)}n.bindBuffer(n.UNIFORM_BUFFER,null)}function f(x,S,T,A){if(M(x,S,T,A)===!0){let y=x.__offset,w=x.value;if(Array.isArray(w)){let R=0;for(let L=0;L<w.length;L++){let F=w[L],z=p(F);m(F,x.__data,R),typeof F!="number"&&typeof F!="boolean"&&!F.isMatrix3&&!ArrayBuffer.isView(F)&&(R+=z.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(w,x.__data,0);n.bufferSubData(n.UNIFORM_BUFFER,y,x.__data)}}function m(x,S,T){typeof x=="number"||typeof x=="boolean"?S[0]=x:x.isMatrix3?(S[0]=x.elements[0],S[1]=x.elements[1],S[2]=x.elements[2],S[3]=0,S[4]=x.elements[3],S[5]=x.elements[4],S[6]=x.elements[5],S[7]=0,S[8]=x.elements[6],S[9]=x.elements[7],S[10]=x.elements[8],S[11]=0):ArrayBuffer.isView(x)?S.set(new x.constructor(x.buffer,x.byteOffset,S.length)):x.toArray(S,T)}function M(x,S,T,A){let y=x.value,w=S+"_"+T;if(A[w]===void 0)return typeof y=="number"||typeof y=="boolean"?A[w]=y:ArrayBuffer.isView(y)?A[w]=y.slice():A[w]=y.clone(),!0;{let R=A[w];if(typeof y=="number"||typeof y=="boolean"){if(R!==y)return A[w]=y,!0}else{if(ArrayBuffer.isView(y))return!0;if(R.equals(y)===!1)return R.copy(y),!0}}return!1}function g(x){let S=x.uniforms,T=0,A=16;for(let w=0,R=S.length;w<R;w++){let L=Array.isArray(S[w])?S[w]:[S[w]];for(let F=0,z=L.length;F<z;F++){let I=L[F],U=Array.isArray(I.value)?I.value:[I.value];for(let G=0,W=U.length;G<W;G++){let K=U[G],X=p(K),$=T%A,ne=$%X.boundary,Ie=$+ne;T+=ne,Ie!==0&&A-Ie<X.storage&&(T+=A-Ie),I.__data=new Float32Array(X.storage/Float32Array.BYTES_PER_ELEMENT),I.__offset=T,T+=X.storage}}}let y=T%A;return y>0&&(T+=A-y),x.__size=T,x.__cache={},this}function p(x){let S={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(S.boundary=4,S.storage=4):x.isVector2?(S.boundary=8,S.storage=8):x.isVector3||x.isColor?(S.boundary=16,S.storage=12):x.isVector4?(S.boundary=16,S.storage=16):x.isMatrix3?(S.boundary=48,S.storage=48):x.isMatrix4?(S.boundary=64,S.storage=64):x.isTexture?Je("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(x)?(S.boundary=16,S.storage=x.byteLength):Je("WebGLRenderer: Unsupported uniform value type.",x),S}function b(x){let S=x.target;S.removeEventListener("dispose",b);let T=a.indexOf(S.__bindingPointIndex);a.splice(T,1),n.deleteBuffer(s[S.id]),delete s[S.id],delete r[S.id]}function _(){for(let x in s)n.deleteBuffer(s[x]);a=[],s={},r={}}return{bind:l,update:c,dispose:_}}var Pv=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),bi=null;function Dv(){return bi===null&&(bi=new Ts(Pv,16,16,us,yn),bi.name="DFG_LUT",bi.minFilter=xn,bi.magFilter=xn,bi.wrapS=gi,bi.wrapT=gi,bi.generateMipmaps=!1,bi.needsUpdate=!0),bi}var Sc=class{constructor(e={}){let{canvas:t=bf(),context:i=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=Un}=e;this.isWebGLRenderer=!0;let m;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=i.getContextAttributes().alpha}else m=a;let M=f,g=new Set([Hl,kl,Ol]),p=new Set([Un,ci,xr,yr,Ul,Fl]),b=new Uint32Array(4),_=new Int32Array(4),x=new P,S=null,T=null,A=[],y=[],w=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=li,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let R=this,L=!1,F=null,z=null,I=null,U=null;this._outputColorSpace=hn;let G=0,W=0,K=null,X=-1,$=null,ne=new Xt,Ie=new Xt,Ce=null,gt=new Ue(0),Ye=0,ct=t.width,ee=t.height,ae=1,ge=null,$e=null,be=new Xt(0,0,ct,ee),Qe=new Xt(0,0,ct,ee),At=!1,oe=new lr,ue=!1,de=!1,fe=new Mt,Me=new P,ze=new Xt,Ve={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ke=!1;function et(){return K===null?ae:1}let B=i;function Rt(E,k){return t.getContext(E,k)}let rt,C,v,V,Z,te,xe,ve,ie,re,Se,Ge,Ee,H,J,se,me,D,ce,Q,_e,we,le;try{let E={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",zt,!1),t.addEventListener("webglcontextrestored",Dt,!1),t.addEventListener("webglcontextcreationerror",ti,!1),B===null){let k="webgl2";if(B=Rt(k,E),B===null)throw Rt(k)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}We()}catch(E){throw t.removeEventListener("webglcontextlost",zt,!1),t.removeEventListener("webglcontextrestored",Dt,!1),t.removeEventListener("webglcontextcreationerror",ti,!1),tt("WebGLRenderer: "+E.message),E}function We(){rt=new ky(B),rt.init(),_e=new Tv(B,rt),C=new Cy(B,rt,e,_e),v=new Sv(B,rt),C.reversedDepthBuffer&&d&&v.buffers.depth.setReversed(!0),z=B.createFramebuffer(),I=B.createFramebuffer(),U=B.createFramebuffer(),V=new Gy(B),Z=new cv,te=new Ev(B,rt,v,Z,C,_e,V),xe=new Oy(R),ve=new W0(B),we=new Ay(B,ve),ie=new Hy(B,ve,V,we),re=new Wy(B,ie,ve,we,V),D=new Vy(B,C,te),J=new Iy(Z),Se=new lv(R,xe,rt,C,we,J),Ge=new Cv(R,Z),Ee=new uv,H=new xv(rt),me=new wy(R,xe,v,re,m,l),se=new bv(R,re,C),le=new Iv(B,V,C,v),ce=new Ry(B,rt,V),Q=new zy(B,rt,V),V.programs=Se.programs,R.capabilities=C,R.extensions=rt,R.properties=Z,R.renderLists=Ee,R.shadowMap=se,R.state=v,R.info=V}M!==Un&&(w=new qy(M,t.width,t.height,o,s,r));let Oe=new Eu(R,B);this.xr=Oe,this.getContext=function(){return B},this.getContextAttributes=function(){return B.getContextAttributes()},this.forceContextLoss=function(){let E=rt.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){let E=rt.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return ae},this.setPixelRatio=function(E){E!==void 0&&(ae=E,this.setSize(ct,ee,!1))},this.getSize=function(E){return E.set(ct,ee)},this.setSize=function(E,k,j=!0){if(Oe.isPresenting){Je("WebGLRenderer: Can't change size while VR device is presenting.");return}ct=E,ee=k,t.width=Math.floor(E*ae),t.height=Math.floor(k*ae),j===!0&&(t.style.width=E+"px",t.style.height=k+"px"),w!==null&&w.setSize(t.width,t.height),this.setViewport(0,0,E,k)},this.getDrawingBufferSize=function(E){return E.set(ct*ae,ee*ae).floor()},this.setDrawingBufferSize=function(E,k,j){ct=E,ee=k,ae=j,t.width=Math.floor(E*j),t.height=Math.floor(k*j),this.setViewport(0,0,E,k)},this.setEffects=function(E){if(M===Un){tt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(E){for(let k=0;k<E.length;k++)if(E[k].isOutputPass===!0){Je("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}w.setEffects(E||[])},this.getCurrentViewport=function(E){return E.copy(ne)},this.getViewport=function(E){return E.copy(be)},this.setViewport=function(E,k,j,q){E.isVector4?be.set(E.x,E.y,E.z,E.w):be.set(E,k,j,q),v.viewport(ne.copy(be).multiplyScalar(ae).round())},this.getScissor=function(E){return E.copy(Qe)},this.setScissor=function(E,k,j,q){E.isVector4?Qe.set(E.x,E.y,E.z,E.w):Qe.set(E,k,j,q),v.scissor(Ie.copy(Qe).multiplyScalar(ae).round())},this.getScissorTest=function(){return At},this.setScissorTest=function(E){v.setScissorTest(At=E)},this.setOpaqueSort=function(E){ge=E},this.setTransparentSort=function(E){$e=E},this.getClearColor=function(E){return E.copy(me.getClearColor())},this.setClearColor=function(){me.setClearColor(...arguments)},this.getClearAlpha=function(){return me.getClearAlpha()},this.setClearAlpha=function(){me.setClearAlpha(...arguments)},this.clear=function(E=!0,k=!0,j=!0){let q=0;if(E){let Y=!1;if(K!==null){let Re=K.texture.format;Y=g.has(Re)}if(Y){let Re=K.texture.type,Ne=p.has(Re),Ae=me.getClearColor(),Fe=me.getClearAlpha(),He=Ae.r,ut=Ae.g,_t=Ae.b;Ne?(b[0]=He,b[1]=ut,b[2]=_t,b[3]=Fe,B.clearBufferuiv(B.COLOR,0,b)):(_[0]=He,_[1]=ut,_[2]=_t,_[3]=Fe,B.clearBufferiv(B.COLOR,0,_))}else q|=B.COLOR_BUFFER_BIT}k&&(q|=B.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),j&&(q|=B.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),q!==0&&B.clear(q)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(E){E.setRenderer(this),F=E},this.dispose=function(){t.removeEventListener("webglcontextlost",zt,!1),t.removeEventListener("webglcontextrestored",Dt,!1),t.removeEventListener("webglcontextcreationerror",ti,!1),me.dispose(),Ee.dispose(),H.dispose(),Z.dispose(),xe.dispose(),re.dispose(),we.dispose(),le.dispose(),Se.dispose(),Oe.dispose(),Oe.removeEventListener("sessionstart",Ku),Oe.removeEventListener("sessionend",ju),xs.stop()};function zt(E){E.preventDefault(),jh("WebGLRenderer: Context Lost."),L=!0}function Dt(){jh("WebGLRenderer: Context Restored."),L=!1;let E=V.autoReset,k=se.enabled,j=se.autoUpdate,q=se.needsUpdate,Y=se.type;We(),V.autoReset=E,se.enabled=k,se.autoUpdate=j,se.needsUpdate=q,se.type=Y}function ti(E){tt("WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function fi(E){let k=E.target;k.removeEventListener("dispose",fi),om(k)}function om(E){lm(E),Z.remove(E)}function lm(E){let k=Z.get(E).programs;k!==void 0&&(k.forEach(function(j){Se.releaseProgram(j)}),E.isShaderMaterial&&Se.releaseShaderCache(E))}this.renderBufferDirect=function(E,k,j,q,Y,Re){k===null&&(k=Ve);let Ne=Y.isMesh&&Y.matrixWorld.determinantAffine()<0,Ae=um(E,k,j,q,Y);v.setMaterial(q,Ne);let Fe=j.index,He=1;if(q.wireframe===!0){if(Fe=ie.getWireframeAttribute(j),Fe===void 0)return;He=2}let ut=j.drawRange,_t=j.attributes.position,Be=ut.start*He,Lt=(ut.start+ut.count)*He;Re!==null&&(Be=Math.max(Be,Re.start*He),Lt=Math.min(Lt,(Re.start+Re.count)*He)),Fe!==null?(Be=Math.max(Be,0),Lt=Math.min(Lt,Fe.count)):_t!=null&&(Be=Math.max(Be,0),Lt=Math.min(Lt,_t.count));let jt=Lt-Be;if(jt<0||jt===1/0)return;we.setup(Y,q,Ae,j,Fe);let Vt,kt=ce;if(Fe!==null&&(Vt=ve.get(Fe),kt=Q,kt.setIndex(Vt)),Y.isMesh)q.wireframe===!0?(v.setLineWidth(q.wireframeLinewidth*et()),kt.setMode(B.LINES)):kt.setMode(B.TRIANGLES);else if(Y.isLine){let bn=q.linewidth;bn===void 0&&(bn=1),v.setLineWidth(bn*et()),Y.isLineSegments?kt.setMode(B.LINES):Y.isLineLoop?kt.setMode(B.LINE_LOOP):kt.setMode(B.LINE_STRIP)}else Y.isPoints?kt.setMode(B.POINTS):Y.isSprite&&kt.setMode(B.TRIANGLES);if(Y.isBatchedMesh)if(rt.get("WEBGL_multi_draw"))kt.renderMultiDraw(Y._multiDrawStarts,Y._multiDrawCounts,Y._multiDrawCount);else{let bn=Y._multiDrawStarts,De=Y._multiDrawCounts,Rn=Y._multiDrawCount,St=Fe?ve.get(Fe).bytesPerElement:1,Yn=Z.get(q).currentProgram.getUniforms();for(let pi=0;pi<Rn;pi++)Yn.setValue(B,"_gl_DrawID",pi),kt.render(bn[pi]/St,De[pi])}else if(Y.isInstancedMesh)kt.renderInstances(Be,jt,Y.count);else if(j.isInstancedBufferGeometry){let bn=j._maxInstanceCount!==void 0?j._maxInstanceCount:1/0,De=Math.min(j.instanceCount,bn);kt.renderInstances(Be,jt,De)}else kt.render(Be,jt)};function Ju(E,k,j,q){F!==null&&E.isNodeMaterial&&F.setObject(q,E),ue===!0&&J.setState(E,j,!1),E.transparent===!0&&E.side===qt&&E.forceSinglePass===!1?(E.side=un,E.needsUpdate=!0,fo(E,k,q),E.side=as,E.needsUpdate=!0,fo(E,k,q),E.side=qt):fo(E,k,q)}this.compile=function(E,k,j=null){j===null&&(j=E),F!==null&&F.renderStart(E,k,j),T=H.get(j),T.init(k),y.push(T),j.traverseVisible(function(Y){Y.isLight&&Y.layers.test(k.layers)&&(T.pushLight(Y),Y.castShadow&&T.pushShadow(Y))}),E!==j&&E.traverseVisible(function(Y){Y.isLight&&Y.layers.test(k.layers)&&(T.pushLight(Y),Y.castShadow&&T.pushShadow(Y))}),T.setupLights(),F!==null&&F.updateLights(T.state.lightsArray),de=this.localClippingEnabled,ue=J.init(this.clippingPlanes,de),ue===!0&&J.setGlobalState(this.clippingPlanes,k),F!==null&&se.render(T.state.shadowsArray,j,k);let q=new Set;return E.traverse(function(Y){if(!(Y.isMesh||Y.isPoints||Y.isLine||Y.isSprite))return;let Re=Y.material;if(Re)if(Array.isArray(Re))for(let Ne=0;Ne<Re.length;Ne++){let Ae=Re[Ne];Ju(Ae,j,k,Y),q.add(Ae)}else Ju(Re,j,k,Y),q.add(Re)}),T=y.pop(),F!==null&&F.renderEnd(),q},this.compileAsync=function(E,k,j=null){let q=this.compile(E,k,j);return new Promise(Y=>{function Re(){if(q.forEach(function(Ne){let Fe=Z.get(Ne).currentProgram;(Fe===void 0||Fe.isReady())&&q.delete(Ne)}),q.size===0){Y(E);return}setTimeout(Re,10)}rt.get("KHR_parallel_shader_compile")!==null?Re():setTimeout(Re,10)})};let Kc=null;function cm(E){Kc&&Kc(E)}function Ku(){xs.stop()}function ju(){xs.start()}let xs=new ep;xs.setAnimationLoop(cm),typeof self<"u"&&xs.setContext(self),this.setAnimationLoop=function(E){Kc=E,Oe.setAnimationLoop(E),E===null?xs.stop():xs.start()},Oe.addEventListener("sessionstart",Ku),Oe.addEventListener("sessionend",ju),this.render=function(E,k){if(k!==void 0&&k.isCamera!==!0){tt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(L===!0)return;F!==null&&F.renderStart(E,k);let j=Oe.enabled===!0&&Oe.isPresenting===!0,q=w!==null&&(K===null||j)&&w.begin(R,K);if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),k.parent===null&&k.matrixWorldAutoUpdate===!0&&k.updateMatrixWorld(),Oe.enabled===!0&&Oe.isPresenting===!0&&(w===null||w.isCompositing()===!1)&&(Oe.cameraAutoUpdate===!0&&Oe.updateCamera(k),k=Oe.getCamera()),E.isScene===!0&&E.onBeforeRender(R,E,k,K),T=H.get(E,y.length),T.init(k),T.state.textureUnits=te.getTextureUnits(),y.push(T),fe.multiplyMatrices(k.projectionMatrix,k.matrixWorldInverse),oe.setFromProjectionMatrix(fe,ai,k.reversedDepth),de=this.localClippingEnabled,ue=J.init(this.clippingPlanes,de),S=Ee.get(E,A.length),S.init(),A.push(S),Oe.enabled===!0&&Oe.isPresenting===!0){let Ne=R.xr.getDepthSensingMesh();Ne!==null&&jc(Ne,k,-1/0,R.sortObjects)}jc(E,k,0,R.sortObjects),S.finish(),F!==null&&F.updateLights(T.state.lightsArray),R.sortObjects===!0&&S.sort(ge,$e),Ke=Oe.enabled===!1||Oe.isPresenting===!1||Oe.hasDepthSensing()===!1,Ke&&me.addToRenderList(S,E),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),ue===!0&&J.beginShadows();let Y=T.state.shadowsArray;if(se.render(Y,E,k),ue===!0&&J.endShadows(),(q&&w.hasRenderPass())===!1){let Ne=S.opaque,Ae=S.transmissive;if(T.setupLights(),k.isArrayCamera){let Fe=k.cameras;if(Ae.length>0)for(let He=0,ut=Fe.length;He<ut;He++){let _t=Fe[He];ed(Ne,Ae,E,_t)}Ke&&me.render(E);for(let He=0,ut=Fe.length;He<ut;He++){let _t=Fe[He];Qu(S,E,_t,_t.viewport)}}else Ae.length>0&&ed(Ne,Ae,E,k),Ke&&me.render(E),Qu(S,E,k)}K!==null&&W===0&&(te.updateMultisampleRenderTarget(K),te.updateRenderTargetMipmap(K)),q&&w.end(R),E.isScene===!0&&E.onAfterRender(R,E,k),we.resetDefaultState(),X=-1,$=null,y.pop(),y.length>0?(T=y[y.length-1],te.setTextureUnits(T.state.textureUnits),ue===!0&&J.setGlobalState(R.clippingPlanes,T.state.camera)):T=null,A.pop(),A.length>0?S=A[A.length-1]:S=null,F!==null&&F.renderEnd()};function jc(E,k,j,q){if(E.visible===!1)return;if(E.layers.test(k.layers)){if(E.isGroup)j=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(k);else if(E.isLightProbeGrid)T.pushLightProbeGrid(E);else if(E.isLight)T.pushLight(E),E.castShadow&&T.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||E.intersectsFrustum(oe)){q&&ze.setFromMatrixPosition(E.matrixWorld).applyMatrix4(fe);let Ne=re.update(E),Ae=E.material;Ae.visible&&S.push(E,Ne,Ae,j,ze.z,null,k)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||E.intersectsFrustum(oe))){let Ne=re.update(E),Ae=E.material;if(q&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),ze.copy(E.boundingSphere.center)):(Ne.boundingSphere===null&&Ne.computeBoundingSphere(),ze.copy(Ne.boundingSphere.center)),ze.applyMatrix4(E.matrixWorld).applyMatrix4(fe)),Array.isArray(Ae)){let Fe=Ne.groups;for(let He=0,ut=Fe.length;He<ut;He++){let _t=Fe[He],Be=Ae[_t.materialIndex];Be&&Be.visible&&S.push(E,Ne,Be,j,ze.z,_t,k)}}else Ae.visible&&S.push(E,Ne,Ae,j,ze.z,null,k)}}let Re=E.children;for(let Ne=0,Ae=Re.length;Ne<Ae;Ne++)jc(Re[Ne],k,j,q)}function Qu(E,k,j,q){let{opaque:Y,transmissive:Re,transparent:Ne}=E;T.setupLightsView(j),ue===!0&&J.setGlobalState(R.clippingPlanes,j),q&&v.viewport(ne.copy(q)),Y.length>0&&uo(Y,k,j),Re.length>0&&uo(Re,k,j),Ne.length>0&&uo(Ne,k,j),v.buffers.depth.setTest(!0),v.buffers.depth.setMask(!0),v.buffers.color.setMask(!0),v.setPolygonOffset(!1)}function ed(E,k,j,q){if((j.isScene===!0?j.overrideMaterial:null)!==null)return;if(T.state.transmissionRenderTarget[q.id]===void 0){let Be=rt.has("EXT_color_buffer_half_float")||rt.has("EXT_color_buffer_float");T.state.transmissionRenderTarget[q.id]=new tn(1,1,{generateMipmaps:!0,type:Be?yn:Un,minFilter:cs,samples:Math.max(4,C.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:yt.workingColorSpace})}let Re=T.state.transmissionRenderTarget[q.id],Ne=q.viewport||ne;Re.setSize(Ne.z*R.transmissionResolutionScale,Ne.w*R.transmissionResolutionScale);let Ae=R.getRenderTarget(),Fe=R.getActiveCubeFace(),He=R.getActiveMipmapLevel();R.setRenderTarget(Re),R.getClearColor(gt),Ye=R.getClearAlpha(),Ye<1&&R.setClearColor(16777215,.5),R.clear(),Ke&&me.render(j);let ut=R.toneMapping;R.toneMapping=li;let _t=q.viewport;if(q.viewport!==void 0&&(q.viewport=void 0),T.setupLightsView(q),ue===!0&&J.setGlobalState(R.clippingPlanes,q),uo(E,j,q),te.updateMultisampleRenderTarget(Re),te.updateRenderTargetMipmap(Re),rt.has("WEBGL_multisampled_render_to_texture")===!1){let Be=!1;for(let Lt=0,jt=k.length;Lt<jt;Lt++){let Vt=k[Lt],{object:kt,geometry:bn,material:De,group:Rn}=Vt;if(De.side===qt&&kt.layers.test(q.layers)){let St=De.side;De.side=un,De.needsUpdate=!0,td(kt,j,q,bn,De,Rn),De.side=St,De.needsUpdate=!0,Be=!0}}Be===!0&&(te.updateMultisampleRenderTarget(Re),te.updateRenderTargetMipmap(Re))}R.setRenderTarget(Ae,Fe,He),R.setClearColor(gt,Ye),_t!==void 0&&(q.viewport=_t),R.toneMapping=ut}function uo(E,k,j){let q=k.isScene===!0?k.overrideMaterial:null;for(let Y=0,Re=E.length;Y<Re;Y++){let Ne=E[Y],{object:Ae,geometry:Fe,group:He}=Ne,ut=Ne.material;ut.allowOverride===!0&&q!==null&&(ut=q),Ae.layers.test(j.layers)&&td(Ae,k,j,Fe,ut,He)}}function td(E,k,j,q,Y,Re){F!==null&&Y.isNodeMaterial&&F.setObject(E,Y),E.onBeforeRender(R,k,j,q,Y,Re),E.modelViewMatrix.multiplyMatrices(j.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),Y.onBeforeRender(R,k,j,q,E,Re),Y.transparent===!0&&Y.side===qt&&Y.forceSinglePass===!1?(Y.side=un,Y.needsUpdate=!0,R.renderBufferDirect(j,k,q,Y,E,Re),Y.side=as,Y.needsUpdate=!0,R.renderBufferDirect(j,k,q,Y,E,Re),Y.side=qt):R.renderBufferDirect(j,k,q,Y,E,Re),E.onAfterRender(R,k,j,q,Y,Re)}function fo(E,k,j){k.isScene!==!0&&(k=Ve);let q=Z.get(E),Y=T.state.lights,Re=T.state.shadowsArray,Ne=Y.state.version,Ae=Se.getParameters(E,Y.state,Re,k,j,T.state.lightProbeGridArray),Fe=Se.getProgramCacheKey(Ae),He=q.programs;q.environment=E.isMeshStandardMaterial||E.isMeshLambertMaterial||E.isMeshPhongMaterial?k.environment:null,q.fog=k.fog;let ut=E.isMeshStandardMaterial||E.isMeshLambertMaterial&&!E.envMap||E.isMeshPhongMaterial&&!E.envMap;q.envMap=xe.get(E.envMap||q.environment,ut),q.envMapRotation=q.environment!==null&&E.envMap===null?k.environmentRotation:E.envMapRotation,He===void 0&&(E.addEventListener("dispose",fi),He=new Map,q.programs=He);let _t=He.get(Fe);if(_t!==void 0){if(q.currentProgram===_t&&q.lightsStateVersion===Ne)return id(E,Ae),_t}else Ae.uniforms=Se.getUniforms(E),F!==null&&E.isNodeMaterial&&F.build(E,j,Ae),E.onBeforeCompile(Ae,R),_t=Se.acquireProgram(Ae,Fe),He.set(Fe,_t),q.uniforms=Ae.uniforms;let Be=q.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Be.clippingPlanes=J.uniform),id(E,Ae),q.needsLights=fm(E),q.lightsStateVersion=Ne,q.needsLights&&(Be.ambientLightColor.value=Y.state.ambient,Be.lightProbe.value=Y.state.probe,Be.sunLights.value=Y.state.sun,Be.sunLightShadows.value=Y.state.sunShadow,Be.directionalLights.value=Y.state.directional,Be.directionalLightShadows.value=Y.state.directionalShadow,Be.spotLights.value=Y.state.spot,Be.spotLightShadows.value=Y.state.spotShadow,Be.rectAreaLights.value=Y.state.rectArea,Be.ltc_1.value=Y.state.rectAreaLTC1,Be.ltc_2.value=Y.state.rectAreaLTC2,Be.pointLights.value=Y.state.point,Be.pointLightShadows.value=Y.state.pointShadow,Be.hemisphereLights.value=Y.state.hemi,Be.sunShadowMatrix.value=Y.state.sunShadowMatrix,Be.sunShadowCascade.value=Y.state.sunShadowCascade,Be.directionalShadowMatrix.value=Y.state.directionalShadowMatrix,Be.spotLightMatrix.value=Y.state.spotLightMatrix,Be.spotLightMap.value=Y.state.spotLightMap,Be.pointShadowMatrix.value=Y.state.pointShadowMatrix),q.lightProbeGrid=T.state.lightProbeGridArray.length>0,q.currentProgram=_t,q.uniformsList=null,_t}function nd(E){if(E.uniformsList===null){let k=E.currentProgram.getUniforms();E.uniformsList=Mr.seqWithValue(k.seq,E.uniforms)}return E.uniformsList}function id(E,k){let j=Z.get(E);j.outputColorSpace=k.outputColorSpace,j.batching=k.batching,j.batchingColor=k.batchingColor,j.instancing=k.instancing,j.instancingColor=k.instancingColor,j.instancingMorph=k.instancingMorph,j.skinning=k.skinning,j.morphTargets=k.morphTargets,j.morphNormals=k.morphNormals,j.morphColors=k.morphColors,j.morphTargetsCount=k.morphTargetsCount,j.numClippingPlanes=k.numClippingPlanes,j.numIntersection=k.numClipIntersection,j.vertexAlphas=k.vertexAlphas,j.vertexTangents=k.vertexTangents,j.toneMapping=k.toneMapping}function hm(E,k){if(E.length===0)return null;if(E.length===1)return E[0].texture!==null?E[0]:null;x.setFromMatrixPosition(k.matrixWorld);for(let j=0,q=E.length;j<q;j++){let Y=E[j];if(Y.texture!==null&&Y.boundingBox.containsPoint(x))return Y}return null}function um(E,k,j,q,Y){k.isScene!==!0&&(k=Ve),te.resetTextureUnits();let Re=k.fog,Ne=q.isMeshStandardMaterial||q.isMeshLambertMaterial||q.isMeshPhongMaterial?k.environment:null,Ae=K===null?R.outputColorSpace:K.isXRRenderTarget===!0?K.texture.colorSpace:yt.workingColorSpace,Fe=q.isMeshStandardMaterial||q.isMeshLambertMaterial&&!q.envMap||q.isMeshPhongMaterial&&!q.envMap,He=xe.get(q.envMap||Ne,Fe),ut=q.vertexColors===!0&&!!j.attributes.color&&j.attributes.color.itemSize===4,_t=!!j.attributes.tangent&&(!!q.normalMap||q.anisotropy>0),Be=!!j.morphAttributes.position,Lt=!!j.morphAttributes.normal,jt=!!j.morphAttributes.color,Vt=li;q.toneMapped&&(K===null||K.isXRRenderTarget===!0)&&(Vt=R.toneMapping);let kt=j.morphAttributes.position||j.morphAttributes.normal||j.morphAttributes.color,bn=kt!==void 0?kt.length:0,De=Z.get(q),Rn=T.state.lights;if(ue===!0&&(de===!0||E!==$)){let Gt=E===$&&q.id===X;J.setState(q,E,Gt)}let St=!1;q.version===De.__version?(De.needsLights&&De.lightsStateVersion!==Rn.state.version||De.outputColorSpace!==Ae||Y.isBatchedMesh&&De.batching===!1||!Y.isBatchedMesh&&De.batching===!0||Y.isBatchedMesh&&De.batchingColor===!0&&Y._colorsTexture===null||Y.isBatchedMesh&&De.batchingColor===!1&&Y._colorsTexture!==null||Y.isInstancedMesh&&De.instancing===!1||!Y.isInstancedMesh&&De.instancing===!0||Y.isSkinnedMesh&&De.skinning===!1||!Y.isSkinnedMesh&&De.skinning===!0||Y.isInstancedMesh&&De.instancingColor===!0&&Y.instanceColor===null||Y.isInstancedMesh&&De.instancingColor===!1&&Y.instanceColor!==null||Y.isInstancedMesh&&De.instancingMorph===!0&&Y.morphTexture===null||Y.isInstancedMesh&&De.instancingMorph===!1&&Y.morphTexture!==null||De.envMap!==He||q.fog===!0&&De.fog!==Re||De.numClippingPlanes!==void 0&&(De.numClippingPlanes!==J.numPlanes||De.numIntersection!==J.numIntersection)||De.vertexAlphas!==ut||De.vertexTangents!==_t||De.morphTargets!==Be||De.morphNormals!==Lt||De.morphColors!==jt||De.toneMapping!==Vt||De.morphTargetsCount!==bn||!!De.lightProbeGrid!=T.state.lightProbeGridArray.length>0)&&(St=!0):(St=!0,De.__version=q.version);let Yn=De.currentProgram;St===!0&&(Yn=fo(q,k,Y),F&&q.isNodeMaterial&&F.onUpdateProgram(q,Yn,De));let pi=!1,qi=!1,Us=!1,Ft=Yn.getUniforms(),Jt=De.uniforms;if(v.useProgram(Yn.program)&&(pi=!0,qi=!0,Us=!0),q.id!==X&&(X=q.id,qi=!0),De.needsLights){let Gt=hm(T.state.lightProbeGridArray,Y);De.lightProbeGrid!==Gt&&(De.lightProbeGrid=Gt,qi=!0)}if(pi||$!==E){v.buffers.depth.getReversed()&&E.reversedDepth!==!0&&(E._reversedDepth=!0,E.updateProjectionMatrix()),Ft.setValue(B,"projectionMatrix",E.projectionMatrix),Ft.setValue(B,"viewMatrix",E.matrixWorldInverse);let Zi=Ft.map.cameraPosition;Zi!==void 0&&Zi.setValue(B,Me.setFromMatrixPosition(E.matrixWorld)),C.logarithmicDepthBuffer&&Ft.setValue(B,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(q.isMeshPhongMaterial||q.isMeshToonMaterial||q.isMeshLambertMaterial||q.isMeshBasicMaterial||q.isMeshStandardMaterial||q.isShaderMaterial)&&Ft.setValue(B,"isOrthographic",E.isOrthographicCamera===!0),$!==E&&($=E,qi=!0,Us=!0)}if(De.needsLights&&(Rn.state.sunShadowMap.length>0&&Ft.setValue(B,"sunShadowMap",Rn.state.sunShadowMap,te),Rn.state.directionalShadowMap.length>0&&Ft.setValue(B,"directionalShadowMap",Rn.state.directionalShadowMap,te),Rn.state.spotShadowMap.length>0&&Ft.setValue(B,"spotShadowMap",Rn.state.spotShadowMap,te),Rn.state.pointShadowMap.length>0&&Ft.setValue(B,"pointShadowMap",Rn.state.pointShadowMap,te)),Y.isSkinnedMesh){Ft.setOptional(B,Y,"bindMatrix"),Ft.setOptional(B,Y,"bindMatrixInverse");let Gt=Y.skeleton;Gt&&(Gt.boneTexture===null&&Gt.computeBoneTexture(),Ft.setValue(B,"boneTexture",Gt.boneTexture,te))}Y.isBatchedMesh&&(Ft.setOptional(B,Y,"batchingTexture"),Ft.setValue(B,"batchingTexture",Y._matricesTexture,te),Ft.setOptional(B,Y,"batchingIdTexture"),Ft.setValue(B,"batchingIdTexture",Y._indirectTexture,te),Ft.setOptional(B,Y,"batchingColorTexture"),Y._colorsTexture!==null&&Ft.setValue(B,"batchingColorTexture",Y._colorsTexture,te));let Yi=j.morphAttributes;if((Yi.position!==void 0||Yi.normal!==void 0||Yi.color!==void 0)&&D.update(Y,j,Yn),(qi||De.receiveShadow!==Y.receiveShadow)&&(De.receiveShadow=Y.receiveShadow,Ft.setValue(B,"receiveShadow",Y.receiveShadow)),(q.isMeshStandardMaterial||q.isMeshLambertMaterial||q.isMeshPhongMaterial)&&q.envMap===null&&k.environment!==null&&(Jt.envMapIntensity.value=k.environmentIntensity),Jt.dfgLUT!==void 0&&(Jt.dfgLUT.value=Dv()),qi){if(Ft.setValue(B,"toneMappingExposure",R.toneMappingExposure),De.needsLights&&dm(Jt,Us),Re&&q.fog===!0&&Ge.refreshFogUniforms(Jt,Re),Ge.refreshMaterialUniforms(Jt,q,ae,ee,T.state.transmissionRenderTarget[E.id]),De.needsLights&&De.lightProbeGrid){let Gt=De.lightProbeGrid;Jt.probesSH.value=Gt.texture,Jt.probesMin.value.copy(Gt.boundingBox.min),Jt.probesMax.value.copy(Gt.boundingBox.max),Jt.probesResolution.value.copy(Gt.resolution)}Mr.upload(B,nd(De),Jt,te)}if(q.isShaderMaterial&&q.uniformsNeedUpdate===!0&&(Mr.upload(B,nd(De),Jt,te),q.uniformsNeedUpdate=!1),q.isSpriteMaterial&&Ft.setValue(B,"center",Y.center),Ft.setValue(B,"modelViewMatrix",Y.modelViewMatrix),Ft.setValue(B,"normalMatrix",Y.normalMatrix),Ft.setValue(B,"modelMatrix",Y.matrixWorld),q.uniformsGroups!==void 0){let Gt=q.uniformsGroups;for(let Zi=0,Fs=Gt.length;Zi<Fs;Zi++){let rd=Gt[Zi];le.update(rd,Yn),le.bind(rd,Yn)}}return Yn}function dm(E,k){E.ambientLightColor.needsUpdate=k,E.lightProbe.needsUpdate=k,E.sunLights.needsUpdate=k,E.sunLightShadows.needsUpdate=k,E.directionalLights.needsUpdate=k,E.directionalLightShadows.needsUpdate=k,E.pointLights.needsUpdate=k,E.pointLightShadows.needsUpdate=k,E.spotLights.needsUpdate=k,E.spotLightShadows.needsUpdate=k,E.rectAreaLights.needsUpdate=k,E.hemisphereLights.needsUpdate=k}function fm(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return G},this.getActiveMipmapLevel=function(){return W},this.getRenderTarget=function(){return K},this.setRenderTargetTextures=function(E,k,j){let q=Z.get(E);q.__autoAllocateDepthBuffer=E.resolveDepthBuffer===!1,q.__autoAllocateDepthBuffer===!1&&(q.__useRenderToTexture=!1),Z.get(E.texture).__webglTexture=k,Z.get(E.depthTexture).__webglTexture=q.__autoAllocateDepthBuffer?void 0:j,q.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(E,k){let j=Z.get(E);j.__webglFramebuffer=k,j.__useDefaultFramebuffer=k===void 0},this.setRenderTarget=function(E,k=0,j=0){K=E,G=k,W=j;let q=null,Y=!1,Re=!1;if(E){let Ae=Z.get(E);if(Ae.__useDefaultFramebuffer!==void 0){v.bindFramebuffer(B.FRAMEBUFFER,Ae.__webglFramebuffer),ne.copy(E.viewport),Ie.copy(E.scissor),Ce=E.scissorTest,v.viewport(ne),v.scissor(Ie),v.setScissorTest(Ce),X=-1;return}else if(Ae.__webglFramebuffer===void 0)te.setupRenderTarget(E);else if(Ae.__hasExternalTextures)te.rebindTextures(E,Z.get(E.texture).__webglTexture,Z.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){let ut=E.depthTexture;if(Ae.__boundDepthTexture!==ut){if(ut!==null&&Z.has(ut)&&(E.width!==ut.image.width||E.height!==ut.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");te.setupDepthRenderbuffer(E)}}let Fe=E.texture;(Fe.isData3DTexture||Fe.isDataArrayTexture||Fe.isCompressedArrayTexture)&&(Re=!0);let He=Z.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(He[k])?q=He[k][j]:q=He[k],Y=!0):E.samples>0&&te.useMultisampledRTT(E)===!1?q=Z.get(E).__webglMultisampledFramebuffer:Array.isArray(He)?q=He[j]:q=He,ne.copy(E.viewport),Ie.copy(E.scissor),Ce=E.scissorTest}else ne.copy(be).multiplyScalar(ae).floor(),Ie.copy(Qe).multiplyScalar(ae).floor(),Ce=At;if(j!==0&&(q=z),v.bindFramebuffer(B.FRAMEBUFFER,q)&&v.drawBuffers(E,q),v.viewport(ne),v.scissor(Ie),v.setScissorTest(Ce),Y){let Ae=Z.get(E.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_CUBE_MAP_POSITIVE_X+k,Ae.__webglTexture,j)}else if(Re){let Ae=k;for(let Fe=0;Fe<E.textures.length;Fe++){let He=Z.get(E.textures[Fe]);B.framebufferTextureLayer(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0+Fe,He.__webglTexture,j,Ae)}}else if(E!==null&&j!==0){let Ae=Z.get(E.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,Ae.__webglTexture,j)}X=-1};function sd(E){let k=Z.get(E);return(k.__readFormat!==E.format||k.__readType!==E.type)&&(k.__readFormat=E.format,k.__readType=E.type,k.__formatReadable=C.textureFormatReadable(E.format),k.__typeReadable=C.textureTypeReadable(E.type)),k}this.readRenderTargetPixels=function(E,k,j,q,Y,Re,Ne,Ae=0){if(!(E&&E.isWebGLRenderTarget)){tt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Fe=Z.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Ne!==void 0&&(Fe=Fe[Ne]),Fe){v.bindFramebuffer(B.FRAMEBUFFER,Fe);try{let He=E.textures[Ae],ut=He.format,_t=He.type;E.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+Ae);let Be=sd(He);if(Be.__formatReadable===!1){tt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Be.__typeReadable===!1){tt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}k>=0&&k<=E.width-q&&j>=0&&j<=E.height-Y&&B.readPixels(k,j,q,Y,_e.convert(ut),_e.convert(_t),Re)}finally{let He=K!==null?Z.get(K).__webglFramebuffer:null;v.bindFramebuffer(B.FRAMEBUFFER,He)}}},this.readRenderTargetPixelsAsync=async function(E,k,j,q,Y,Re,Ne,Ae=0){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Fe=Z.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Ne!==void 0&&(Fe=Fe[Ne]),Fe)if(k>=0&&k<=E.width-q&&j>=0&&j<=E.height-Y){v.bindFramebuffer(B.FRAMEBUFFER,Fe);let He=E.textures[Ae],ut=He.format,_t=He.type;E.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+Ae);let Be=sd(He);if(Be.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Be.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Lt=B.createBuffer();B.bindBuffer(B.PIXEL_PACK_BUFFER,Lt),B.bufferData(B.PIXEL_PACK_BUFFER,Re.byteLength,B.STREAM_READ),B.readPixels(k,j,q,Y,_e.convert(ut),_e.convert(_t),0),B.bindBuffer(B.PIXEL_PACK_BUFFER,null);let jt=K!==null?Z.get(K).__webglFramebuffer:null;v.bindFramebuffer(B.FRAMEBUFFER,jt);let Vt=B.fenceSync(B.SYNC_GPU_COMMANDS_COMPLETE,0);return B.flush(),await Ef(B,Vt,4),B.bindBuffer(B.PIXEL_PACK_BUFFER,Lt),B.getBufferSubData(B.PIXEL_PACK_BUFFER,0,Re),B.bindBuffer(B.PIXEL_PACK_BUFFER,null),B.deleteBuffer(Lt),B.deleteSync(Vt),Re}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(E,k=null,j=0){let q=Math.pow(2,-j),Y=Math.floor(E.image.width*q),Re=Math.floor(E.image.height*q),Ne=k!==null?k.x:0,Ae=k!==null?k.y:0;te.setTexture2D(E,0),B.copyTexSubImage2D(B.TEXTURE_2D,j,0,0,Ne,Ae,Y,Re),v.unbindTexture()},this.copyTextureToTexture=function(E,k,j=null,q=null,Y=0,Re=0){let Ne,Ae,Fe,He,ut,_t,Be,Lt,jt,Vt=E.isCompressedTexture?E.mipmaps[Re]:E.image;if(j!==null)Ne=j.max.x-j.min.x,Ae=j.max.y-j.min.y,Fe=j.isBox3?j.max.z-j.min.z:1,He=j.min.x,ut=j.min.y,_t=j.isBox3?j.min.z:0;else{let Jt=Math.pow(2,-Y);Ne=Math.floor(Vt.width*Jt),Ae=Math.floor(Vt.height*Jt),E.isDataArrayTexture?Fe=Vt.depth:E.isData3DTexture?Fe=Math.floor(Vt.depth*Jt):Fe=1,He=0,ut=0,_t=0}q!==null?(Be=q.x,Lt=q.y,jt=q.z):(Be=0,Lt=0,jt=0);let kt=_e.convert(k.format),bn=_e.convert(k.type),De;k.isData3DTexture?(te.setTexture3D(k,0),De=B.TEXTURE_3D):k.isDataArrayTexture||k.isCompressedArrayTexture?(te.setTexture2DArray(k,0),De=B.TEXTURE_2D_ARRAY):(te.setTexture2D(k,0),De=B.TEXTURE_2D),v.activeTexture(B.TEXTURE0),v.pixelStorei(B.UNPACK_FLIP_Y_WEBGL,k.flipY),v.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),v.pixelStorei(B.UNPACK_ALIGNMENT,k.unpackAlignment);let Rn=v.getParameter(B.UNPACK_ROW_LENGTH),St=v.getParameter(B.UNPACK_IMAGE_HEIGHT),Yn=v.getParameter(B.UNPACK_SKIP_PIXELS),pi=v.getParameter(B.UNPACK_SKIP_ROWS),qi=v.getParameter(B.UNPACK_SKIP_IMAGES);v.pixelStorei(B.UNPACK_ROW_LENGTH,Vt.width),v.pixelStorei(B.UNPACK_IMAGE_HEIGHT,Vt.height),v.pixelStorei(B.UNPACK_SKIP_PIXELS,He),v.pixelStorei(B.UNPACK_SKIP_ROWS,ut),v.pixelStorei(B.UNPACK_SKIP_IMAGES,_t);let Us=E.isDataArrayTexture||E.isData3DTexture,Ft=k.isDataArrayTexture||k.isData3DTexture;if(E.isDepthTexture){let Jt=Z.get(E),Yi=Z.get(k),Gt=Z.get(Jt.__renderTarget),Zi=Z.get(Yi.__renderTarget);v.bindFramebuffer(B.READ_FRAMEBUFFER,Gt.__webglFramebuffer),v.bindFramebuffer(B.DRAW_FRAMEBUFFER,Zi.__webglFramebuffer);for(let Fs=0;Fs<Fe;Fs++)Us&&(B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,Z.get(E).__webglTexture,Y,_t+Fs),B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,Z.get(k).__webglTexture,Re,jt+Fs)),B.blitFramebuffer(He,ut,Ne,Ae,Be,Lt,Ne,Ae,B.DEPTH_BUFFER_BIT,B.NEAREST);v.bindFramebuffer(B.READ_FRAMEBUFFER,null),v.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else if(Y!==0||E.isRenderTargetTexture||Z.has(E)){let Jt=Z.get(E),Yi=Z.get(k);v.bindFramebuffer(B.READ_FRAMEBUFFER,I),v.bindFramebuffer(B.DRAW_FRAMEBUFFER,U);for(let Gt=0;Gt<Fe;Gt++)Us?B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,Jt.__webglTexture,Y,_t+Gt):B.framebufferTexture2D(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,Jt.__webglTexture,Y),Ft?B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,Yi.__webglTexture,Re,jt+Gt):B.framebufferTexture2D(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,Yi.__webglTexture,Re),Y!==0?B.blitFramebuffer(He,ut,Ne,Ae,Be,Lt,Ne,Ae,B.COLOR_BUFFER_BIT,B.NEAREST):Ft?B.copyTexSubImage3D(De,Re,Be,Lt,jt+Gt,He,ut,Ne,Ae):B.copyTexSubImage2D(De,Re,Be,Lt,He,ut,Ne,Ae);v.bindFramebuffer(B.READ_FRAMEBUFFER,null),v.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else Ft?E.isDataTexture||E.isData3DTexture?B.texSubImage3D(De,Re,Be,Lt,jt,Ne,Ae,Fe,kt,bn,Vt.data):k.isCompressedArrayTexture?B.compressedTexSubImage3D(De,Re,Be,Lt,jt,Ne,Ae,Fe,kt,Vt.data):B.texSubImage3D(De,Re,Be,Lt,jt,Ne,Ae,Fe,kt,bn,Vt):E.isDataTexture?B.texSubImage2D(B.TEXTURE_2D,Re,Be,Lt,Ne,Ae,kt,bn,Vt.data):E.isCompressedTexture?B.compressedTexSubImage2D(B.TEXTURE_2D,Re,Be,Lt,Vt.width,Vt.height,kt,Vt.data):B.texSubImage2D(B.TEXTURE_2D,Re,Be,Lt,Ne,Ae,kt,bn,Vt);v.pixelStorei(B.UNPACK_ROW_LENGTH,Rn),v.pixelStorei(B.UNPACK_IMAGE_HEIGHT,St),v.pixelStorei(B.UNPACK_SKIP_PIXELS,Yn),v.pixelStorei(B.UNPACK_SKIP_ROWS,pi),v.pixelStorei(B.UNPACK_SKIP_IMAGES,qi),Re===0&&k.generateMipmaps&&B.generateMipmap(De),v.unbindTexture()},this.initRenderTarget=function(E){Z.get(E).__webglFramebuffer===void 0&&te.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?te.setTextureCube(E,0):E.isData3DTexture?te.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?te.setTexture2DArray(E,0):te.setTexture2D(E,0),v.unbindTexture()},this.resetState=function(){G=0,W=0,K=null,v.reset(),we.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ai}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=yt._getDrawingBufferColorSpace(e),t.unpackColorSpace=yt._getUnpackColorSpace()}};var Sr={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};var Wn=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},Lv=new rs(-1,1,1,-1,0,1),Tu=class extends Et{constructor(){super(),this.setAttribute("position",new it([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new it([0,2,0,0,2,0],2))}},Nv=new Tu,ds=class{constructor(e){this._mesh=new pe(Nv,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Lv)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}};var Er=class extends Wn{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof Bt?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=Ui.clone(e.uniforms),this.material=new Bt({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new ds(this.material)}render(e,t,i){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=i.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var Ja=class extends Wn{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,i){let s=e.getContext(),r=e.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,a,4294967295),r.buffers.stencil.setClear(o),r.buffers.stencil.setLocked(!0),e.setRenderTarget(i),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}},wc=class extends Wn{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}};var Ac=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let i=e.getSize(new he);this._width=i.width,this._height=i.height,t=new tn(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:yn}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Er(Sr),this.copyPass.material.blending=Kn,this.timer=new Ca}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),i=!1;for(let s=0,r=this.passes.length;s<r;s++){let a=this.passes[s];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),a.render(this.renderer,this.writeBuffer,this.readBuffer,e,i),a.needsSwap){if(i){let o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}Ja!==void 0&&(a instanceof Ja?i=!0:a instanceof wc&&(i=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new he);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let i=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(i,s),this.renderTarget2.setSize(i,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(i,s)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var Rc=class extends Wn{constructor(e,t,i=null,s=null,r=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=i,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new Ue}render(e,t,i){let s=e.autoClear;e.autoClear=!1;let r,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(r=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:i),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=s}};var op={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Ue(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};var Tr=class n extends Wn{constructor(e,t=1,i,s){super(),this.strength=t,this.radius=i,this.threshold=s,this.resolution=e!==void 0?new he(e.x,e.y):new he(256,256),this.clearColor=new Ue(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new tn(r,a,{type:yn,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let h=0;h<this.nMips;h++){let u=new tn(r,a,{type:yn,depthBuffer:!1});u.texture.name="UnrealBloomPass.h"+h,u.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(u);let d=new tn(r,a,{type:yn,depthBuffer:!1});d.texture.name="UnrealBloomPass.v"+h,d.texture.generateMipmaps=!1,this.renderTargetsVertical.push(d),r=Math.round(r/2),a=Math.round(a/2)}let o=op;this.highPassUniforms=Ui.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Bt({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let l=[6,10,14,18,22];r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let h=0;h<this.nMips;h++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[h])),this.separableBlurMaterials[h].uniforms.invSize.value=new he(1/r,1/a),r=Math.round(r/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new P(1,1,1),new P(1,1,1),new P(1,1,1),new P(1,1,1),new P(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=Ui.clone(Sr.uniforms),this.blendMaterial=new Bt({uniforms:this.copyUniforms,vertexShader:Sr.vertexShader,fragmentShader:Sr.fragmentShader,premultipliedAlpha:!0,blending:sn,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new Ue,this._oldClearAlpha=1,this._basic=new It,this._fsQuad=new ds(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let i=Math.round(e/2),s=Math.round(t/2);this.renderTargetBright.setSize(i,s);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(i,s),this.renderTargetsVertical[r].setSize(i,s),this.separableBlurMaterials[r].uniforms.invSize.value=new he(1/i,1/s),i=Math.round(i/2),s=Math.round(s/2)}render(e,t,i,s,r){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();let a=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),r&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=i.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=i.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let o=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[l].uniforms.direction.value=n.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=n.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this._fsQuad.render(e),o=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(i),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=a}_getSeparableBlurMaterial(e){let t=[],i=e/3;for(let a=0;a<e;a++)t.push(.39894*Math.exp(-.5*a*a/(i*i))/i);let s=[],r=[];for(let a=1;a<e;a+=2){let o=t[a],l=a+1<e?t[a+1]:0,c=o+l;s.push((a*o+(a+1)*l)/c),r.push(c)}return new Bt({defines:{KERNEL_PAIRS:s.length},uniforms:{colorTexture:{value:null},invSize:{value:new he(.5,.5)},direction:{value:new he(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:s},gaussianWeights:{value:r}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float centerWeight;
				uniform float gaussianOffsets[KERNEL_PAIRS];
				uniform float gaussianWeights[KERNEL_PAIRS];

				void main() {

					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * centerWeight;

					for ( int i = 0; i < KERNEL_PAIRS; i ++ ) {

						vec2 uvOffset = direction * invSize * gaussianOffsets[ i ];
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * gaussianWeights[ i ];

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new Bt({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}};Tr.BlurDirectionX=new he(1,0);Tr.BlurDirectionY=new he(0,1);var Ka={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};var Cc=class extends Wn{constructor(){super(),this.isOutputPass=!0,this.uniforms=Ui.clone(Ka.uniforms),this.material=new fr({name:Ka.name,uniforms:this.uniforms,vertexShader:Ka.vertexShader,fragmentShader:Ka.fragmentShader}),this._fsQuad=new ds(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,i){this.uniforms.tDiffuse.value=i.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},yt.getTransfer(this._outputColorSpace)===Ct&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Pa?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===Da?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===La?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Cs?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===Ua?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===Fa?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===Na&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var lp="\u5317\u4EAC\u9F9F \xB7 \u80E1\u540C\u5927\u4E71\u6597";var fs={durian:"\u5C0F\u69B4\u83B2",oyster:"\u5F80\u6614\u869D",goat:"\u5F90\u5C71\u7F8A",dingding:"\u4E01\u4E01",orange:"\u6A58\u5B50",ginger:"\u59DC\u997C\u4EBA",caesar:"Caesar",chenwei:"\u9648\u4F1F",jia:"\u7532\u65B9",yi:"\u4E59\u65B9",guo:"\u679C\u54E5",thief:"\u5434\u6D69\u7136",mao:"\u5927\u6BDB",maoqiu:"\u5C0F\u6BDB\u7403",bigmao:"\u5927\u6BDB\uFF08\u8D85\u5927\u53F7\uFF09",judge:"\u6C89\u6BC5\u7F8A\uFF08\u6CD5\u5B98\uFF09"},Dn={jia:["\u8C01\u95EE\u4F60\u4E86","\u8C01\u95EE\u4F60\u4E86\uFF1F","\u8C01\u95EE\u4F60\u4E86\uFF01\uFF01"],yi:["\u554A\u5BF9\u5BF9\u5BF9","\u597D\u597D\u597D","\u4F60\u8BF4\u5F97\u90FD\u5BF9"],guo:["\uFF1F","\uFF1F\uFF1F\uFF1F","\u4F60\u5728\u5E72\u561B"],judge:["\u8083\u9759\uFF01","\u9A73\u56DE\uFF01","\u672C\u5EAD\u5BA3\u5224\uFF1A\u9F9F\u592A\u751C\u4E86\uFF01","\u6CA1\u4EBA\u901A\u77E5\u4F60\uFF1F\u90A3\u662F\u4F60\u7684\u4E8B\uFF01"],thief:["\u563F\u563F\uFF0C\u7CD6\u846B\u82A6\u5F52\u6211\u4E86","\u718A\u6765\u4E86\uFF01","\u6E9C\u4E86\u6E9C\u4E86"],mao:["\u306A\u3093\u3067\u305D\u3093\u306A\u306B\u6163\u308C\u3066\u3093\u3060\u3088\uFF01","\u96EA\u83DC\u2026","\u305B\u3064\u306A\u3063\uFF01","\u5C4A\u304B\u306A\u3044\u604B\u2026","\u53C8\u5230\u4E86\u767D\u8272\u76F8\u7C3F\u7684\u5B63\u8282"],caili:["\u5F69\u793C38.8W\uFF01","\u5F69\u793C38.8W\uFF0C\u5C11\u4E00\u5206\u4E0D\u884C"],goat:["\u814A\u80A0\u653B\u51FB\uFF01"],dingding:["\u9876\u7EA7\u9876\u7EA7\uFF01","\u9876\u7EA7\u9876\u7EA7","\u62B1\u62B1\uFF01","\u4E01\u4E01\uFF01","\u518D\u6765\u4E00\u904D\uFF01"],orange:["\u6A58\u5B50\u6765\u4E86\uFF01","\u6A58\u5B50\u6765\u4E86\uFF01\uFF01"],caesar:["\u6211\u6765\uFF0C\u6211\u89C1\uFF0C\u6211\u5F81\u670D","Veni, vidi, vici","\u7F57\u9A6C\u4E0D\u662F\u4E00\u5929\u5EFA\u6210\u7684"],chenwei:["Fire in the hole!","Enemy spotted","Go go go!","Counter-Terrorists win"],ginger:["\u4F60\u6293\u4E0D\u5230\u6211\uFF01","\u8DD1\u8DD1\u8DD1\uFF0C\u6293\u4E0D\u5230\u6211\uFF5E","\u6211\u662F\u59DC\u997C\u4EBA\uFF01"],oyster:["\u60F3\u5F53\u5E74\u2026\u2026","\u5F80\u6614\u4E0D\u518D"]},Ut={idle:["\u4F60\u7684\u9F9F\u6628\u5929\u665A\u4E0A\u98CE\u597D\u5927","\u6211\u89C9\u5F97\u59C6\u5DF4\u4F69\u6CA1\u6709\u95EE\u9898","\u5F97\u561E\uFF0C\u8D70\u7740\uFF01","\u561B\u5462\u8FD9\u662F\uFF1F","\u59D0\u4EEC\u513F\u4ECA\u513F\u72B6\u6001\u500D\u513F\u597D","\u60A8\u77A7\u597D\u5427\uFF01","\u8FD9\u628A\u6211C","\u9EC4\u623F\u4E0A\u6CA1\u4EBA","\u9F9F\u4ECA\u5929\u624B\u611F\u6765\u4E86\uFF01","\u6392\u597D\u961F\uFF0C\u4E00\u4E2A\u4E00\u4E2A\u6765\uFF01"],afk:["\u521A\u548C\u963F\u59E8\u8BF4\u8BDD\u53BB\u4E86","\u521A\u548C\u963F\u59E8\u8BF4\u8BDD\u53BB\u4E86\uFF0C\u56DE\u6765\u4E86\u56DE\u6765\u4E86"],hit:["\u6211\u7BAD\u4E2D\u4E86\uFF01\u6211\u7BAD\u4E2D\u4E86\uFF01","\u6211\u7BAD\u4E2D\u4E86\uFF01"],multi:["\u6253\u6B7B\u4F60\u4EEC\u8FD9\u4E9B\u5ECA\u574A\u5A03\uFF01","\u4E00\u4E2A\u90FD\u522B\u8DD1\uFF01","\u6765\u4E00\u4E2A\u6211\u6536\u4E00\u4E2A\uFF01","\u90FD\u522B\u8D70\uFF0C\u9F9F\u8FD8\u6CA1\u6253\u591F\u5462\uFF01"],hurt:["\u54CE\u54DF\u5582\uFF01","\u6CA1\u4EBA\u901A\u77E5\u6211\u8FD9\u513F\u6709\u602A\uFF01","\u8C01\u6253\u6211\uFF1F\uFF01","\u563F\uFF0C\u60A8\u8FD9\u5C31\u4E0D\u5730\u9053\u4E86","\u4F60\u4EEC\u662F\u4E0D\u662F\u751F\u6D3B\u4E0D\u5982\u610F\u554A","\u4F60\u4EEC\u518D\u8FD9\u6837\u6211\u9000\u6E38\u4E86"],life:["\u4F60\u4EEC\u662F\u4E0D\u662F\u751F\u6D3B\u4E0D\u5982\u610F\u554A","\u4F60\u4EEC\u662F\u4E0D\u662F\u751F\u6D3B\u4E0D\u5982\u610F\u554A\uFF1F"],spawnNear:["\u6CA1\u4EBA\u901A\u77E5\u6211\u5237\u602A\u4E86\uFF01","\u8FD9\u600E\u4E48\u53C8\u6765\u4E00\u6CE2\uFF0C\u6CA1\u4EBA\u901A\u77E5\u6211\u554A"],sweet:["\u6CA1\u4EBA\u6BD4\u6211\u751C\uFF01"],voice:["\u58F0\u97F3\u6CA1\u6211\u751C\uFF01"],bull:["\u559C\u6B22\u6211\u7684\u767D\u725B\u5417\uFF1F","\u767D\u725B\uFF01\u51B2\uFF01"],bomb:["\u4ED6\u5E94\u8BE5\u4E0D\u4F1A\u4E0B\u5305\u7684","\u4E0B\u5305\u4E86\u4E0B\u5305\u4E86"],hubby:["\u8521\u535A\uFF01\u5FEB\u6765\uFF01","\u961F\u53CB\uFF01\u4E0A\uFF01","\u8521\u535A\uFF0C\u6551\u4E00\u4E0B\uFF01"],wind:["\u4F60\u7684\u9F9F\u6628\u5929\u665A\u4E0A\u98CE\u597D\u5927\u2026\u2026"],shield:["\u4F60\u7684\u9F9F\u51B3\u5B9A\u5173\u7A97\u6237\u7761\u89C9\u4E86"],dodge:["\u6CA1\u6253\u7740\uFF5E","\u901A\u77E5\u5230\u4E86\uFF0C\u8EB2\u5F00\u4E86"],waveStart:["\u5F97\u561E\uFF0C\u4E0B\u4E00\u6CE2\uFF01","\u6765\u5427\u5ECA\u574A\u5A03\u4EEC","\u6211\u89C9\u5F97\u59C6\u5DF4\u4F69\u6CA1\u6709\u95EE\u9898","\u6A58\u5B50\u6765\u4E86\uFF1F","\u6211\u4ECA\u5929\u60F3\u559D\u8840\u4E86","\u8FD9\u4E00\u6CE2\uFF0C\u9F9F\u4EB2\u81EA\u6765\uFF01"],boss:["\u6C89\u6BC5\u7F8A\u6CD5\u5B98\uFF1F\u5F00\u5EAD\u4E86\uFF1F\u6CA1\u4EBA\u901A\u77E5\u6211\uFF01"],bigmao:["\u5927\u6BDB\uFF1F\u4F60\u600E\u4E48\u8FD9\u4E48\u5927\u4E00\u53EA\uFF01","\u600E\u4E48\u4E0B\u96EA\u4E86\uFF1F\u53C8\u5230\u4E86\u767D\u8272\u76F8\u7C3F\u7684\u5B63\u8282"],horse:["\u9A6C\u80CC\u4E0A\u7684\u6C11\u65CF\uFF01"],bike:["\u5317\u4EAC\u9A91\u884C\u592B\u5987\uFF01"],meteor:["\u6D41\u661F\u98CE\u66B4\uFF01"],chief:["\u5973\u914B\u957F\u7684\u795D\u798F\uFF01"],elite:["\u7CBE\u82F1\u602A\uFF1F\u6CA1\u4EBA\u901A\u77E5\u6211\uFF01","\u8FD9\u4E2A\u600E\u4E48\u91D1\u5149\u95EA\u95EA\u7684","\u6765\u4E86\u4E2A\u72E0\u7684"],lowhp:["\u9F9F\u8981\u4E0D\u884C\u4E86\uFF0C\u8521\u535A\u6551\u6211","\u8840\u4E0D\u591A\u4E86\uFF0C\u7A33\u4F4F\u7A33\u4F4F","\u6CA1\u4EBA\u901A\u77E5\u6211\u53EA\u5269\u8FD9\u70B9\u8840"],waveClear:["\u8FD9\u6CE2\u7A33\u4E86","\u5F97\u561E\uFF0C\u6536\u5DE5","\u8FD8\u6709\u8C01\uFF1F"],chest:["\u5927\u7EA2\u5B9D\u7BB1\uFF01","\u5F00\u7BB1\u5F00\u7BB1\uFF01"],tide:["\u6F6E\u6C50\u76D1\u72F1\uFF1F\u6CA1\u4EBA\u901A\u77E5\u6211\u6DA8\u6F6E\uFF01","\u6DA8\u6F6E\u4E86\u6DA8\u6F6E\u4E86","\u6478\u5230\u5927\u7EA2\u5C31\u64A4"],flash:["\u6211\u778E\u4E86\uFF01\u9648\u4F1F\u4F60\u9634\u6211","\u95EA\u5149\uFF01\u6CA1\u4EBA\u901A\u77E5\u6211"],ult:["\u8D85\u7EA7\u8718\u86DB\uFF01\uFF01","\u8D85\u7EA7\u8718\u86DB\uFF0C\u8D70\u4F60\uFF01"],dead:["\u6CA1\u4EBA\u901A\u77E5\u6211\u554A\uFF01\uFF01","\u8FD9\u628A\u4E0D\u7B97\uFF0C\u7F51\u5361\u4E86","\u6CA1\u4EBA\u901A\u77E5\u6211\u56E2\u6218\uFF1F"]},ja=[{id:"douzhi",tier:"silver",icon:"\u{1F964}",name:"\u8C46\u6C41\u513F\u7EED\u547D",desc:"\u6700\u5927\u751F\u547D +3\uFF0C\u5E76\u56DE\u6EE1",apply:n=>{n.maxhp+=3,n.hp=n.maxhp}},{id:"hutong",tier:"silver",icon:"\u{1F3C3}",name:"\u80E1\u540C\u4E32\u5B50",desc:"\u79FB\u52A8\u901F\u5EA6 +12%",apply:n=>{n.speed*=1.12}},{id:"arrow",tier:"silver",icon:"\u{1F3F9}",name:"\u6211\u7BAD\u4E2D\u4E86",desc:"\u4F24\u5BB3 +20%",apply:n=>{n.dmg*=1.2}},{id:"magnet",tier:"silver",icon:"\u{1F9F2}",name:"\u7CD6\u846B\u82A6\u78C1\u94C1",desc:"\u62FE\u53D6\u8303\u56F4 +60%",apply:n=>{n.pickup*=1.6}},{id:"auntie",tier:"silver",icon:"\u{1F49A}",name:"\u521A\u548C\u963F\u59E8\u8BF4\u8BDD\u53BB\u4E86",desc:"\u6BCF 6 \u79D2\u56DE 1 \u70B9\u8840",apply:n=>{n.regen+=1}},{id:"yellow",tier:"silver",icon:"\u{1F3AF}",name:"\u9EC4\u623F\u4E0A\u6CA1\u4EBA",desc:"\u5C04\u7A0B +25%",apply:n=>{n.range*=1.25}},{id:"mbappe",tier:"silver",icon:"\u26BD",name:"\u59C6\u5DF4\u4F69\u6CA1\u6709\u95EE\u9898",desc:"\u653B\u901F +18%",apply:n=>{n.rate*=1.18}},{id:"armor",tier:"silver",icon:"\u{1F6E1}\uFE0F",name:"\u5317\u4EAC\u5927\u599E",desc:"\u53D7\u5230\u4F24\u5BB3 -15%",apply:n=>{n.armor=Math.min(.6,n.armor+.15)}},{id:"multi",tier:"gold",icon:"\u{1F386}",name:"\u6253\u6B7B\u4F60\u4EEC\u8FD9\u4E9B\u5ECA\u574A\u5A03",desc:"\u6BCF\u6B21\u591A\u53D1\u5C04 1 \u679A\u5B50\u5F39",apply:n=>{n.count+=1}},{id:"pierce",tier:"gold",icon:"\u{1FAA1}",name:"\u4E00\u7BAD\u7A7F\u7CD6",desc:"\u5B50\u5F39\u7A7F\u900F +1",apply:n=>{n.pierce+=1}},{id:"voice",tier:"gold",icon:"\u{1F3A4}",name:"\u58F0\u97F3\u6CA1\u6211\u751C",desc:"\u6BCF 5 \u79D2\u751C\u55D3\u4E00\u58F0\uFF0C\u9707\u6655\u5E76\u4F24\u5BB3\u5468\u56F4\u654C\u4EBA",apply:n=>{n.voice+=1}},{id:"bomb",tier:"gold",icon:"\u{1F4A3}",name:"\u4ED6\u5E94\u8BE5\u4E0D\u4F1A\u4E0B\u5305\u7684",desc:"\u6BCF 4 \u79D2\u5728\u811A\u4E0B\u4E0B\u4E2A\u5305\uFF0C\u7206\u70B8\u4F24\u5BB3",apply:n=>{n.bomb+=1}},{id:"hubby",tier:"gold",icon:"\u{1F91D}",name:"\u53EB\u961F\u53CB",desc:"\u6BCF 15 \u79D2\u961F\u53CB\u8521\u535A\u51B2\u8FC7\u6765\u6E05\u4E00\u6392\u602A",apply:n=>{n.hubby+=1}},{id:"window",tier:"gold",icon:"\u{1FA9F}",name:"\u4F60\u7684\u9F9F\u51B3\u5B9A\u5173\u7A97\u6237\u7761\u89C9\u4E86",desc:"\u6BCF 10 \u79D2\u83B7\u5F97\u4E00\u5C42\u62A4\u76FE\uFF0C\u6321\u4E00\u6B21\u4F24\u5BB3",apply:n=>{n.shield+=1}},{id:"sweetest",tier:"gold",icon:"\u{1F36C}",name:"\u6CA1\u4EBA\u6BD4\u6211\u751C",desc:"\u66B4\u51FB\u7387 +20%\uFF0C\u66B4\u51FB\u4F24\u5BB3 \xD72",apply:n=>{n.crit+=.2}},{id:"chief",tier:"gold",icon:"\u{1F451}",name:"\u5973\u914B\u957F\u7684\u795D\u798F",desc:"\u6BCF\u6CE2\u5F00\u59CB\u56DE\u6EE1\u8840\uFF0C\u4F24\u5BB3 +15%",apply:n=>{n.chief+=1,n.dmg*=1.15}},{id:"meteor",tier:"gold",icon:"\u2604\uFE0F",name:"\u7C73\u62C9\u5A1C\u7684\u6D41\u661F\u98CE\u66B4",desc:"\u6BCF 6 \u79D2\u6D41\u661F\u7838\u5411\u9644\u8FD1\u7684\u654C\u4EBA",apply:n=>{n.meteor+=1}},{id:"aegis",tier:"gold",icon:"\u{1F6DF}",name:"\u4E0D\u673D\u76FE",desc:"\u6B7B\u4EA1\u65F6\u539F\u5730\u590D\u6D3B\u4E00\u6B21",apply:n=>{n.aegis+=1}},{id:"bull",tier:"prism",icon:"\u{1F402}",name:"\u559C\u6B22\u6211\u7684\u767D\u725B\u5417",desc:"\u53EC\u5524\u767D\u725B\u4F19\u4F34\uFF0C\u6765\u56DE\u51B2\u649E\u654C\u4EBA",apply:n=>{n.bull+=1}},{id:"tide",tier:"gold",icon:"\u{1F30A}",name:"\u6F6E\u6C50\u76D1\u72F1\u8D8A\u72F1",desc:"\u6BCF 12 \u79D2\u653E\u4E00\u9053\u6F6E\u6C50\uFF0C\u51B2\u8D70\u5E76\u4F24\u5BB3\u4E00\u6574\u6392\u654C\u4EBA",apply:n=>{n.tide+=1}},{id:"bike",tier:"gold",icon:"\u{1F6B2}",name:"\u5317\u4EAC\u9A91\u884C\u592B\u5987",desc:"\u6BCF 12 \u79D2\u548C\u8521\u535A\u9A91\u53CC\u4EBA\u81EA\u884C\u8F66 5 \u79D2\uFF1A\u79FB\u901F \xD71.9\uFF0C\u649E\u98DE\u654C\u4EBA",apply:n=>{n.bike+=1}},{id:"horse",tier:"prism",icon:"\u{1F40E}",name:"\u9A6C\u80CC\u4E0A\u7684\u6C11\u65CF",desc:"\u6BCF 10 \u79D2\u5468\u671F\u51FA\u53D1\u9A91\u9A6C 4 \u79D2\uFF1A\u79FB\u901F \xD71.7\uFF0C\u649E\u98DE\u654C\u4EBA",apply:n=>{n.horse+=1}},{id:"wind",tier:"prism",icon:"\u{1F32A}\uFE0F",name:"\u4F60\u7684\u9F9F\u6628\u5929\u665A\u4E0A\u98CE\u597D\u5927",desc:"\u8EAB\u8FB9\u73AF\u7ED5\u9F99\u5377\u98CE\uFF0C\u6301\u7EED\u7EDE\u788E\u654C\u4EBA",apply:n=>{n.wind+=1}},{id:"ranked",tier:"prism",icon:"\u26A1",name:"\u4F60\u7684\u9F9F\u6253\u6392\u4F4D\u6253\u5F97\u597D\u7D2F",desc:"\u653B\u901F +60%\uFF0C\u4F46\u79FB\u901F -10%",apply:n=>{n.rate*=1.6,n.speed*=.9}},{id:"notified",tier:"prism",icon:"\u{1F514}",name:"\u6CA1\u4EBA\u901A\u77E5\u6211",desc:"25% \u95EA\u907F\uFF0C\u88AB\u6253\u524D\u603B\u4F1A\u6709\u4EBA\u901A\u77E5\u4F60",apply:n=>{n.dodge=Math.min(.6,n.dodge+.25)}},{id:"dahong",tier:"prism",icon:"\u{1F48E}",name:"\u51FA\u5927\u7EA2\u4E86",desc:"\u7ECF\u9A8C +50%\uFF0C3 \u4E2A\u5927\u7EA2\u73AF\u7ED5\u8EAB\u8FB9",apply:n=>{n.xpMul*=1.5,n.orbit+=3}}],cp={silver:"\u767D\u94F6",gold:"\u9EC4\u91D1",prism:"\u68F1\u5F69"},Qa=[{id:"shots",icon:"\u{1F3AF}",name:"\u591A\u4E00\u53D1",desc:"\u6BCF\u6B21\u5C04\u51FB\u989D\u5916\u53D1\u5C04 1 \u679A\u5B50\u5F39",available:n=>n.count<5,apply:n=>{n.count+=1}},{id:"damage",icon:"\u{1F4A5}",name:"\u706B\u529B\u8BAD\u7EC3",desc:"\u5B50\u5F39\u4F24\u5BB3 +15%",apply:n=>{n.dmg*=1.15}},{id:"speed",icon:"\u26A1",name:"\u5FEB\u624B\u8FDE\u5C04",desc:"\u653B\u51FB\u901F\u5EA6 +12%",apply:n=>{n.rate*=1.12}},{id:"health",icon:"\u2764\uFE0F",name:"\u7ED3\u5B9E\u4E00\u70B9",desc:"\u6700\u5927\u751F\u547D +3\uFF0C\u5E76\u56DE\u590D 3 \u70B9\u751F\u547D",apply:n=>{n.maxhp+=3,n.hp=Math.min(n.maxhp,n.hp+3)}},{id:"regen",icon:"\u{1F49A}",name:"\u6162\u6162\u56DE\u8840",desc:"\u6BCF 6 \u79D2\u989D\u5916\u6062\u590D 1 \u70B9\u751F\u547D",available:n=>n.regen<4,apply:n=>{n.regen+=1}},{id:"crit",icon:"\u2728",name:"\u627E\u51C6\u8981\u5BB3",desc:"\u66B4\u51FB\u7387 +6%",available:n=>n.crit<.5,apply:n=>{n.crit+=.06}},{id:"move",icon:"\u{1F3C3}",name:"\u811A\u4E0B\u751F\u98CE",desc:"\u79FB\u52A8\u901F\u5EA6 +8%",apply:n=>{n.speed*=1.08}}],hp=[{text:"\u4F24\u5BB3 +8%",apply:n=>{n.dmg*=1.08}},{text:"\u653B\u901F +7%",apply:n=>{n.rate*=1.07}},{text:"\u79FB\u901F +4%",apply:n=>{n.speed*=1.04}},{text:"\u6700\u5927\u751F\u547D +2",apply:n=>{n.maxhp+=2,n.hp+=2}},{text:"\u62FE\u53D6\u8303\u56F4 +15%",apply:n=>{n.pickup*=1.15}},{text:"\u66B4\u51FB +4%",apply:n=>{n.crit+=.04}},{text:"\u5C04\u7A0B +6%",apply:n=>{n.range*=1.06}}],eo={horse:{name:"\u9A6C\u80CC\u4E0A\u7684\u6C11\u65CF",line:"\u9A6C\u80CC\u4E0A\u7684\u6C11\u65CF\uFF01",w:2},bike:{name:"\u5317\u4EAC\u9A91\u884C\u592B\u5987",line:"\u5317\u4EAC\u9A91\u884C\u592B\u5987\uFF01",w:2},bull:{name:"\u767D\u725B\u51B2\u950B",line:"\u559C\u6B22\u6211\u7684\u767D\u725B\u5417\uFF1F",w:2},meteor:{name:"\u7C73\u62C9\u5A1C\u7684\u6D41\u661F\u98CE\u66B4",line:"\u6D41\u661F\u98CE\u66B4\uFF01",w:2},chief:{name:"\u5973\u914B\u957F\u7684\u795D\u798F",line:"\u5973\u914B\u957F\u7684\u795D\u798F\uFF01",w:1},spider:{name:"\u8718\u86DB\u4E4B\u529B",line:"\u8D85\u7EA7\u8718\u86DB\u5145\u80FD\uFF01",w:1},douzhi:{name:"\u8C46\u6C41\u513F",line:"\u8FD9\u8C46\u6C41\u513F\uFF0C\u5730\u9053\uFF01",w:2},magnet:{name:"\u7CD6\u846B\u82A6\u78C1\u94C1",line:"\u7CD6\u846B\u82A6\u90FD\u8FC7\u6765\uFF01",w:1},chest:{name:"\u5927\u7EA2\u5B9D\u7BB1",line:"\u5927\u7EA2\u5B9D\u7BB1\uFF01",w:0}},wu={frenzy:"\u72C2\u66B4\u7684",tough:"\u575A\u97E7\u7684",split:"\u5206\u88C2\u7684",boom:"\u7206\u70B8\u7684"},Ic=[[10,"\u5927\u6740\u7279\u6740"],[20,"\u4E3B\u5BB0\u6BD4\u8D5B"],[30,"\u6740\u4EBA\u5982\u9EBB"],[45,"\u65E0\u4EBA\u80FD\u6321"],[60,"\u53D8\u6001\u6740\u622E"],[80,"\u5996\u602A\u822C\u7684\u6740\u622E"],[100,"\u5982\u540C\u795E\u4E00\u822C"],[130,"\u8D85\u795E\uFF01"]];var Bi=60,Pe=12.5,nt=12.5,ps=[{x:-6.2,y:5.2,r:1.05,kind:"tree"},{x:6.4,y:-5.6,r:.85,kind:"well"}],to=140,Ln={durian:{r:.45,hp:6,sp:.042,dmg:1,xp:1},orange:{r:.4,hp:6,sp:.1,dmg:1,xp:1},ginger:{r:.42,hp:5,sp:.08,dmg:1,xp:1},caesar:{r:.5,hp:22,sp:.035,dmg:2,xp:3},chenwei:{r:.45,hp:14,sp:.04,dmg:1,xp:3},dingding:{r:.55,hp:18,sp:.034,dmg:2,xp:3},oyster:{r:.62,hp:16,sp:.026,dmg:2,xp:2,spit:210},goat:{r:.5,hp:11,sp:.036,dmg:2,xp:2,charge:!0},jia:{r:.45,hp:9,sp:.04,dmg:1,xp:2,ranged:!0},yi:{r:.45,hp:9,sp:.04,dmg:1,xp:2,ranged:!0},guo:{r:.45,hp:9,sp:.04,dmg:1,xp:2,lob:!0},thief:{r:.55,hp:16,sp:.085,dmg:0,xp:3,thief:!0},mao:{r:.8,hp:40,sp:.032,dmg:2,xp:5,split:4},maoqiu:{r:.32,hp:4,sp:.08,dmg:1,xp:.5},bigmao:{r:1.6,hp:500,sp:.03,dmg:2,xp:40,split:6,boss:!0},judge:{r:1.35,hp:1700,sp:.028,dmg:3,xp:0,boss:!0}},Pc=[null,{durian:4,ginger:3,orange:2},{durian:3,orange:2,goat:2,dingding:1,ginger:5},{durian:3,orange:2,goat:2,dingding:1,ginger:4,jia:1,yi:1,oyster:1,chenwei:1},{durian:3,orange:2,goat:2,dingding:1,ginger:4,jia:1,yi:1,oyster:1,chenwei:1,guo:1,thief:1,mao:1,caesar:1},{durian:3,orange:2,ginger:5,maoqiu:2},{durian:3,orange:2,goat:2,dingding:2,ginger:5,jia:2,yi:2,oyster:2,guo:1,thief:1,mao:1,caesar:2,chenwei:2},{durian:2,orange:3,goat:3,dingding:2,ginger:6,jia:2,yi:2,oyster:2,guo:2,thief:1,mao:2,caesar:2,chenwei:2},{durian:2,orange:3,goat:3,dingding:3,ginger:6,jia:3,yi:3,oyster:2,guo:2,thief:1,mao:2,caesar:2,chenwei:2},{durian:2,orange:3,goat:3,dingding:3,ginger:6,jia:3,yi:3,oyster:3,guo:3,thief:2,mao:3,caesar:2,chenwei:2},{durian:3,orange:2,ginger:5,jia:1,yi:1}],Uv=[0,28,32,36,40,0,44,48,52,56,0],Fv=[0,0,0,1,1,1,2,2,3,4,2],Bv={5:"bigmao",10:"judge"},Xn=(n,e,t)=>Math.max(e,Math.min(t,n)),Fi=(n,e)=>Math.hypot(n.x-e.x,n.y-e.y);function Ov(){return{maxhp:15,hp:15,speed:.115,dmg:5,rate:2,range:7.5,count:1,pierce:0,spread:.12,crit:.05,pickup:2.2,regen:0,armor:0,dodge:0,xpMul:1,voice:0,bomb:0,hubby:0,shield:0,aegis:0,bull:0,wind:0,orbit:0,chief:0,meteor:0,horse:0,tide:0,bike:0}}function xp({rng:n=Math.random}={}){return{rng:n,state:"title",t:0,st:0,events:[],uid:1,wave:0,hero:null,enemies:[],bullets:[],ebullets:[],gems:[],spawns:[],zones:[],bombs:[],picks:0,offer:null}}var bt=n=>n.rng(),mt=(n,e,t)=>e+bt(n)*(t-e),xt=(n,e)=>e[Math.floor(bt(n)*e.length)],lt=(n,e,t={})=>n.events.push({type:e,...t}),ot=(n,e)=>lt(n,"sfx",{name:e}),$t=(n,e,t,i,s="")=>lt(n,"pop",{x:e,y:t,text:i,cls:s}),wn=(n,e,t,i,s=12)=>lt(n,"burst",{x:e,y:t,kind:i,n:s});function Ot(n,e,t=150){let i=n.hero;i&&(i.say=e,i.sayT=t,lt(n,"voice",{text:e}))}function up(n){n.hero={x:0,y:0,r:.5,vx:0,vy:0,face:0,inv:60,s:Ov(),xp:0,lvl:1,cd:30,say:"",sayT:0,idleT:400,afk:0,ult:0,shields:0,bless:0,lowSaid:!1,timers:{voice:0,bomb:0,hubby:0,shield:0,regen:0,meteor:0,horse:0,tide:0,bike:0},augs:[],statUps:[],moving:!1,ride:0,mount:"horse"},n.wave=0,n.kills=0,n.hitsTotal=0,n.shots=0,n.recentKills=[],n.missStreak=0,n.enemies=[],n.bullets=[],n.ebullets=[],n.gems=[],n.spawns=[],n.zones=[],n.bombs=[],n.meteors=[],n.bull=null,n.hubbyRun=null,n.rerolls=2,n.picks=0,n.pickPhase=null,n.offer=null,n.saidBomb=!1,n.saidWind=!1,n.time=0,n.score=0,n.combo=0,n.comboT=0,n.bestCombo=0,n.streakIdx=0,n.pickups=[],n.pickT=420,n.stampede=null,n.tides=[],yp(n)}function Dc(n){return 6+n*4}function yp(n){n.wave++,n.waveT=Uv[n.wave]*Bi,n.bossWave=!n.waveT,n.spawnT=50,n.boss=null;let e=new Set(Pc.slice(1,n.wave).flatMap(r=>Object.keys(r)));n.intro=Object.keys(Pc[n.wave]).filter(r=>!e.has(r)),n.state="play",n.st=0,n.enemies=[],n.ebullets=[],n.zones=[],n.spawns=[],n.pickups=[],n.pickT=360,n.waveClock=0,n.ws={kills:0,dmg:0,best:0},n.tides=[],n.tideT=360,n.tideSaid=!1;let t=n.waveT||60*Bi,i=Fv[n.wave];n.eliteAt=Array.from({length:i},(r,a)=>Math.floor(t*(.18+.62*(i===1?.5:a/(i-1))))),lt(n,"wave",{n:n.wave,boss:n.bossWave});let s=n.hero.s;if(s.chief&&n.wave>1&&(s.hp=s.maxhp,$t(n,n.hero.x,n.hero.y,"\u5973\u914B\u957F\u7684\u795D\u798F","heal"),wn(n,n.hero.x,n.hero.y,"gold",30)),n.bossWave){let r=Bv[n.wave];n.spawns.push({x:0,y:n.hero.y>0?-7:7,type:r,t:110}),Ot(n,xt(n,r==="judge"?Ut.boss:Ut.bigmao),200)}else n.wave>1&&Ot(n,xt(n,Ut.waveStart),120)}function Lc(n,e,t,i,s=null){let r=Ln[e],a=r.boss?1:1+.2*(n.wave-1)+.025*(n.wave-1)**2,o=r.boss?1:1+.03*(n.wave-1),l=r.dmg+(!r.boss&&n.wave>=7?1:0),c={id:n.uid++,type:e,name:fs[e],x:t,y:i,r:r.r,hp:r.hp*a,max:r.hp*a,sp:r.sp*o*mt(n,.9,1.1),dmg:l,xp:r.xp,t:Math.floor(mt(n,0,200)),flash:0,stun:0,web:0,kx:0,ky:0,mode:"walk",modeT:0,carry:0,cd:mt(n,60,160),hitBy:{}};return r.boss&&(n.boss=c,c.cd=140),s&&(c.elite=s,c.name="\u7CBE\u82F1\xB7"+wu[s]+c.name,c.r*=1.35,c.xp*=5,c.dmg+=1,c.hp=c.max=c.max*(s==="tough"?9:5),s==="frenzy"&&(c.sp*=1.6)),c}function dp(n){let e=Pc[n.wave],t=Object.values(e).reduce((s,r)=>s+r,0),i=bt(n)*t;for(let[s,r]of Object.entries(e))if((i-=r)<0)return s;return"durian"}function kv(n){let e=n.hero,t=1+Math.floor(bt(n)*(1+n.wave/2.5)),i,s,r=0;do i=mt(n,-Pe+1.5,Pe-1.5),s=mt(n,-nt+1.5,nt-1.5);while(Math.hypot(i-e.x,s-e.y)<5.5&&++r<20);let a=n.intro&&n.intro.length?n.intro.shift():dp(n);for(let o=0;o<t;o++)n.spawns.push({x:Xn(i+mt(n,-1.2,1.2),-Pe+1,Pe-1),y:Xn(s+mt(n,-1.2,1.2),-nt+1,nt-1),type:bt(n)<.75?a:dp(n),t:55})}var Hv={aegis:2,notified:2,ranked:2,armor:4};function fp(n,e){let t=n.wave,i=t>=3?Math.min(.45,.05*t):0,s=.25+.05*t,r=bt(n),a=e||(r<i?"prism":r<i+s?"gold":"silver"),o=h=>n.hero.augs.filter(u=>u===h).length,l=ja.filter(h=>h.tier===a&&o(h.id)<(Hv[h.id]??99)),c=[];for(;c.length<3&&l.length;)c.push(l.splice(Math.floor(bt(n)*l.length),1)[0]);return n.offer={kind:"hex",tier:a,list:c.map(h=>h.id)},n.offer}function zv(n){if(n.wave===1&&n.hero.statUps.length===0)return n.offer={kind:"stat",list:["shots","damage","health"]},n.offer;let e=Qa.filter(i=>!i.available||i.available(n.hero.s)),t=[];for(;t.length<3&&e.length;)t.push(e.splice(Math.floor(bt(n)*e.length),1)[0]);return n.offer={kind:"stat",list:t.map(i=>i.id)},n.offer}function Gv(n,e){let t=Qa.find(i=>i.id===e);return!t||t.available&&!t.available(n.hero.s)?!1:(t.apply(n.hero.s),n.hero.statUps.push(e),lt(n,"statUp",{text:t.name}),!0)}function Vv(n,e){let t=ja.find(s=>s.id===e),i=n.hero;t.apply(i.s),i.augs.push(e),e==="bull"&&!n.bull&&(n.bull={x:i.x-1,y:i.y,vx:0,vy:0,mode:"follow",t:0,target:null}),lt(n,"augment",{id:e})}function pp(n){let e=n.hero;for(let r of n.gems)_p(n,r.v);n.gems=[];for(let r of n.enemies)wn(n,r.x,r.y,"poof",6);if(n.enemies=[],n.ebullets=[],n.zones=[],n.spawns=[],n.bombs=[],n.meteors=[],n.hubbyRun=null,n.hero.ride=0,n.pickups=[],n.stampede=null,n.hero.bless=0,n.combo=0,n.comboT=0,e.s.hp=Math.min(e.s.maxhp,e.s.hp+2),ot(n,"waveEnd"),n.wave>=10){n.state="win",n.st=0,ot(n,"win");return}n.picks=2,n.pickPhase="stat",n.bossWave&&(n.rerolls+=1);let t=n.ws,i=t.dmg===0?"S":t.dmg<3?"A":t.dmg<6?"B":"C",s={S:600,A:300,B:100,C:0}[i];n.score+=s,i==="S"&&(n.rerolls+=1),n.lastWave={n:n.wave,kills:t.kills,best:t.best,rating:i,bonus:s,reroll:i==="S"},n.state="pick",n.st=0,zv(n),Ot(n,xt(n,Ut.waveClear),120),lt(n,"waveEnd",{...n.lastWave})}function _p(n,e){let t=n.hero;for(t.xp+=e*t.s.xpMul;t.xp>=Dc(t.lvl);){t.xp-=Dc(t.lvl),t.lvl++;let i=xt(n,hp);i.apply(t.s),t.s.hp=Math.min(t.s.maxhp,t.s.hp+2),lt(n,"levelup",{lvl:t.lvl,text:i.text}),ot(n,"levelup")}}function hi(n,e,t,i={}){if(e.dead)return;let s=n.hero,r=!1;if(i.canCrit&&bt(n)<s.s.crit&&(r=!0,t*=2),s.bless>0&&(t*=1.5),e.hp-=t,e.flash=6,i.kx){let a=e.type==="judge"||e.type==="bigmao"?.15:1;e.kx+=i.kx*a,e.ky+=i.ky*a}lt(n,"dmg",{x:e.x,y:e.y,n:Math.round(t),crit:r}),e.hp<=0?Wv(n,e):i.sfx!==!1&&ot(n,"hit")}function Wv(n,e){if(e.dead)return;e.dead=!0;let t=n.hero;n.kills++,n.ws.kills++,t.ult=Math.min(100,t.ult+(Ln[e.type].boss?40:e.elite?25:4)),n.combo++,n.comboT=150,n.combo>n.bestCombo&&(n.bestCombo=n.combo),n.combo>n.ws.best&&(n.ws.best=n.combo);let i=Ln[e.type].boss?2e3:e.elite?250:Math.max(5,Math.round(e.xp*10));for(n.score+=Math.round(i*(1+Math.floor(n.combo/10)*.25));n.streakIdx<Ic.length&&n.combo>=Ic[n.streakIdx][0];)lt(n,"streak",{text:Ic[n.streakIdx][1],n:n.combo,tier:n.streakIdx}),ot(n,"streak"),n.streakIdx++;if(e.elite){if(lt(n,"eliteDown",{x:e.x,y:e.y}),lt(n,"shake",{amt:.6}),lt(n,"hitstop",{frames:6}),n.pickups.push(Sp(n,"chest",e.x,e.y)),e.elite==="split"&&n.enemies.length<to)for(let a=0;a<3;a++){let o=a/3*Math.PI*2,l=Lc(n,e.type==="thief"?"durian":e.type,e.x+Math.cos(o)*.8,e.y+Math.sin(o)*.8);l.kx=Math.cos(o)*.25,l.ky=Math.sin(o)*.25,n.enemies.push(l)}e.elite==="boom"&&n.zones.push({id:n.uid++,x:e.x,y:e.y,r:2.4,t:45,T:45,dmg:2,kind:"boom"})}wn(n,e.x,e.y,e.type==="mao"||e.type==="maoqiu"||e.type==="bigmao"?"fluff":"kill",Ln[e.type].boss?70:14),ot(n,Ln[e.type].boss?"bossdown":"kill");let s=Math.max(0,Math.round(e.xp))+Math.floor(e.carry*1.5);for(let a=0;a<s;a++)n.gems.push({id:n.uid++,x:e.x+mt(n,-.4,.4),y:e.y+mt(n,-.4,.4),v:1,mag:!1,vx:0,vy:0});e.xp<1&&bt(n)<e.xp&&n.gems.push({id:n.uid++,x:e.x,y:e.y,v:1,mag:!1,vx:0,vy:0});let r=Ln[e.type].split;if(r&&n.enemies.length<to){let a=e.type==="bigmao"?"mao":"maoqiu";for(let o=0;o<r;o++){let l=o/r*Math.PI*2,c=Lc(n,a,e.x+Math.cos(l)*e.r,e.y+Math.sin(l)*e.r);c.kx=Math.cos(l)*.2,c.ky=Math.sin(l)*.2,n.enemies.push(c)}}e.type==="thief"&&$t(n,e.x,e.y,"\u5434\u6D69\u7136\uFF1A\u6211\u8FD8\u4F1A\u56DE\u6765\u7684","small"),e===n.boss&&(n.boss=null,lt(n,"shake",{amt:1}),e.type==="judge"?($t(n,e.x,e.y,"\u9000\u5EAD\uFF01","big"),Ot(n,"\u6C89\u6BC5\u7F8A\u6CD5\u5B98\uFF1F\u5C31\u8FD9\uFF1F",200)):($t(n,e.x,e.y,"\u96EA\u83DC\u2026\u2026","big"),Ot(n,"\u5927\u6BDB\uFF0C\u4F60\u8FD8\u633A\u8F6F\u4E4E",160))),n.recentKills.push(n.t),n.recentKills=n.recentKills.filter(a=>n.t-a<80),n.recentKills.length>=6&&t.sayT<40&&(Ot(n,xt(n,Ut.multi),120),n.recentKills=[])}function Au(n,e,t,i){let s=n.hero;if(s.inv>0||s.bless>0||n.state!=="play")return!1;if(bt(n)<s.s.dodge)return s.inv=20,$t(n,s.x,s.y,xt(n,Ut.dodge),"dodge"),ot(n,"dodge"),!1;if(s.shields>0)return s.shields--,s.inv=40,s.sayT<=0&&Ot(n,xt(n,Ut.shield),110),lt(n,"shieldBreak",{}),ot(n,"shield"),!1;s.s.hp-=e*(1-s.s.armor),n.ws.dmg+=e,s.inv=45,s.s.hp>0&&s.s.hp<=s.s.maxhp*.3&&!s.lowSaid&&(s.lowSaid=!0,Ot(n,xt(n,Ut.lowhp),140)),s.s.hp>s.s.maxhp*.5&&(s.lowSaid=!1);let r=Math.hypot(s.x-t,s.y-i)||1;return s.vx+=(s.x-t)/r*.12,s.vy+=(s.y-i)/r*.12,lt(n,"hurt",{}),lt(n,"shake",{amt:.35}),ot(n,"hurt"),s.sayT<=0&&bt(n)<.5&&Ot(n,xt(n,Ut.hurt),100),s.s.hp<=0&&(s.s.aegis>0?(s.s.aegis--,s.s.hp=s.s.maxhp,s.inv=150,Ot(n,"\u4E0D\u673D\u76FE\uFF01\u4E70\u6D3B\u4E86\uFF01",160),wn(n,s.x,s.y,"gold",40),ot(n,"aegis")):(s.s.hp=0,n.state="over",n.st=0,n.overQuote=xt(n,Ut.dead),ot(n,"over"))),!0}function vp(n,e){n.t++;let t=e.pressed||{};if(n.state==="title"){t.start&&up(n);return}if(n.state==="over"||n.state==="win"){++n.st>60&&t.start&&up(n);return}if(n.state==="pause"){(t.pause||t.start)&&(n.state="play");return}if(n.state==="pick"){n.st++,t.reroll&&n.pickPhase==="hex"&&n.rerolls>0&&(n.rerolls--,fp(n,n.offer.tier),ot(n,"reroll")),t.pick!=null&&n.offer&&n.offer.list[t.pick]&&n.st>20&&(n.pickPhase==="stat"?Gv(n,n.offer.list[t.pick]):Vv(n,n.offer.list[t.pick]),n.picks--,n.st=0,n.picks>0?(n.pickPhase="hex",fp(n)):(n.offer=null,n.pickPhase=null,yp(n)));return}if(t.pause){n.state="pause";return}n.time++;let i=n.hero,s=i.s,r=e.mx||0,a=e.my||0,o=Math.hypot(r,a);o>1&&(r/=o,a/=o),i.moving=o>.15;let l=s.speed*(i.ride>0?i.mount==="bike"?1.9:1.7:1);i.vx+=(r*l-i.vx)*.35,i.vy+=(a*l-i.vy)*.35,i.x=Xn(i.x+i.vx,-Pe+i.r,Pe-i.r),i.y=Xn(i.y+i.vy,-nt+i.r,nt-i.r),Mp(i),i.moving&&(i.face=Math.atan2(a,r)),i.inv>0&&i.inv--,i.sayT>0&&i.sayT--,o>.15||t.ult?(i.afk>420&&Ot(n,xt(n,Ut.afk),160),i.afk=0):i.afk++,--i.idleT<=0&&(i.sayT<=0&&Ot(n,xt(n,Ut.idle),150),i.idleT=mt(n,600,900));let c=!1;if(n.bossWave){if(c=!!n.boss||n.spawns.some(h=>Ln[h.type].boss),!c&&n.enemies.length===0&&n.spawns.length===0){pp(n);return}}else{let h=n.waveT===1;if(n.waveT=Math.max(0,n.waveT-1),n.waveT===0&&n.enemies.length===0&&n.spawns.length===0){pp(n);return}h&&lt(n,"cleanup")}for(n.waveClock++;n.eliteAt.length&&n.waveClock>=n.eliteAt[0];)n.eliteAt.shift(),Qv(n);n.comboT>0&&--n.comboT===0&&(n.combo=0,n.streakIdx=0),i.bless>0&&i.bless--,tM(n),iM(n),(n.bossWave?c:n.waveT>0)&&--n.spawnT<=0&&n.enemies.length<to&&(kv(n),n.spawnT=Math.max(14,66-n.wave*6)*(n.bossWave?2.6:1)*mt(n,.8,1.2));for(let h of n.spawns)--h.t>0||(h.done=!0,!(Math.hypot(h.x-i.x,h.y-i.y)<1.2&&!Ln[h.type].boss&&!h.elite)&&(n.enemies.push(Lc(n,h.type,h.x,h.y,h.elite)),h.elite&&(lt(n,"elite",{name:n.enemies[n.enemies.length-1].name}),i.sayT<=0&&Ot(n,xt(n,Ut.elite),120),ot(n,"elite")),wn(n,h.x,h.y,Ln[h.type].boss?"gold":"spawn",Ln[h.type].boss?40:6),Ln[h.type].boss&&(lt(n,"boss",{type:h.type}),lt(n,"shake",{amt:.8}),ot(n,"slam"))));n.spawns=n.spawns.filter(h=>!h.done),Xv(n),qv(n),t.ult&&Yv(n),Zv(n),Jv(n),Kv(n),jv(n),n.enemies=n.enemies.filter(h=>!h.dead)}function Mp(n){for(let e of ps){let t=n.x-e.x,i=n.y-e.y,s=Math.hypot(t,i),r=e.r+n.r;s<r&&s>1e-4&&(n.x=e.x+t/s*r,n.y=e.y+i/s*r)}}function bp(n,e,t,i,s=!1){let r=null,a=i;for(let o of n.enemies){if(o.dead)continue;let l=Math.hypot(o.x-e,o.y-t)-o.r-(s&&(Ln[o.type].boss||o.elite)?2.5:0);l<a&&(a=l,r=o)}return r}function Xv(n){let e=n.hero,t=e.s;if(--e.cd>0)return;let i=bp(n,e.x,e.y,t.range,!0);if(!i){e.cd=4;return}e.cd=Bi/t.rate;let s=Math.atan2(i.y-e.y,i.x-e.x);e.aim=s;for(let r=0;r<t.count;r++){let a=s+(r-(t.count-1)/2)*.16+mt(n,-t.spread,t.spread),o=.32;n.bullets.push({id:n.uid++,x:e.x+Math.cos(a)*.6,y:e.y+Math.sin(a)*.6,vx:Math.cos(a)*o,vy:Math.sin(a)*o,life:t.range/o+4,pierce:t.pierce,hit:new Set})}n.shots++,lt(n,"fire",{a:s}),ot(n,"shoot")}function qv(n){let e=n.hero,t=e.s,i=e.timers,s=t.dmg/5;if(t.regen&&++i.regen>=360&&(i.regen=0,t.hp<t.maxhp&&(t.hp=Math.min(t.maxhp,t.hp+t.regen),$t(n,e.x,e.y,"+"+t.regen+" \u2665","heal"))),t.shield&&e.shields<t.shield&&++i.shield>=600&&(i.shield=0,e.shields++,ot(n,"shieldUp")),t.voice&&++i.voice>=300){i.voice=0;let o=3+.5*t.voice;lt(n,"ring",{x:e.x,y:e.y,r:o,kind:"voice"}),ot(n,"sweet"),e.sayT<=0&&bt(n)<.35&&Ot(n,xt(n,Ut.voice),90);for(let l of n.enemies)Fi(l,e)<o+l.r&&(l.stun=Math.max(l.stun,Ln[l.type].boss?30:90),hi(n,l,6*t.voice*s,{sfx:!1}));n.ebullets=n.ebullets.filter(l=>Math.hypot(l.x-e.x,l.y-e.y)>o)}t.bomb&&++i.bomb>=240&&(i.bomb=0,n.bombs.push({id:n.uid++,x:e.x,y:e.y,t:80,r:2.3+.2*t.bomb,dmg:16*t.bomb*s}),n.saidBomb||(n.saidBomb=!0,Ot(n,Ut.bomb[0],140)),ot(n,"plant"));for(let o of n.bombs)if(!(--o.t>0)){o.done=!0,lt(n,"ring",{x:o.x,y:o.y,r:o.r,kind:"boom"}),lt(n,"shake",{amt:.4}),wn(n,o.x,o.y,"boom",26),ot(n,"boom");for(let l of n.enemies)if(Math.hypot(l.x-o.x,l.y-o.y)<o.r+l.r){let c=Math.hypot(l.x-o.x,l.y-o.y)||1;hi(n,l,o.dmg,{kx:(l.x-o.x)/c*.3,ky:(l.y-o.y)/c*.3,sfx:!1})}}if(n.bombs=n.bombs.filter(o=>!o.done),t.hubby&&++i.hubby>=900){i.hubby=0;let o=e.x>0?-1:1;n.hubbyRun={x:-o*(Pe+2),y:e.y,dir:o,hit:new Set,dmg:40*t.hubby*s},Ot(n,xt(n,Ut.hubby),120),ot(n,"hubby"),lt(n,"hubby",{})}if(n.hubbyRun){let o=n.hubbyRun;o.x+=o.dir*.42;for(let l of n.enemies)!o.hit.has(l.id)&&Math.abs(l.y-o.y)<1.3+l.r&&Math.abs(l.x-o.x)<.9+l.r&&(o.hit.add(l.id),hi(n,l,o.dmg,{kx:o.dir*.4,ky:0,sfx:!1}));Math.abs(o.x)>Pe+3&&(n.hubbyRun=null)}if(t.meteor&&++i.meteor>=Math.max(200,360-50*(t.meteor-1))){i.meteor=0;let o=n.enemies.filter(l=>Fi(l,e)<9).sort((l,c)=>Fi(l,e)-Fi(c,e)).slice(0,2+t.meteor);for(let[l,c]of o.entries()){let h={x:c.x,y:c.y,t:30+l*6,r:1.6,dmg:20*t.meteor*s};n.meteors.push(h),lt(n,"meteor",{x:h.x,y:h.y,t:h.t})}o.length&&e.sayT<=0&&bt(n)<.4&&Ot(n,Ut.meteor[0],90)}for(let o of n.meteors)if(!(--o.t>0)){o.done=!0,lt(n,"ring",{x:o.x,y:o.y,r:o.r,kind:"star"}),wn(n,o.x,o.y,"gold",16),lt(n,"shake",{amt:.15}),ot(n,"star");for(let l of n.enemies)Math.hypot(l.x-o.x,l.y-o.y)<o.r+l.r&&hi(n,l,o.dmg,{sfx:!1})}if(n.meteors=n.meteors.filter(o=>!o.done),t.horse&&e.ride<=0&&++i.horse>=600&&(i.horse=0,Nc(n,"horse",240+30*(t.horse-1))),t.bike&&e.ride<=0&&++i.bike>=720&&(i.bike=0,Nc(n,"bike",300+30*(t.bike-1))),e.ride>0){--e.ride===0&&wn(n,e.x,e.y,"dust",10);for(let o of n.enemies){if(Fi(o,e)>e.r+o.r+.35||(o.hitBy.horse||0)>n.time)continue;o.hitBy.horse=n.time+20;let l=Fi(o,e)||1;hi(n,o,8*Math.max(1,t.horse)*s,{kx:(o.x-e.x)/l*.35,ky:(o.y-e.y)/l*.35,sfx:!1})}}n.orbiters=[];let r=t.wind?t.wind+1:0;for(let o=0;o<r;o++){let l=n.time*.045+o/r*Math.PI*2;n.orbiters.push({kind:"wind",x:e.x+Math.cos(l)*2.6,y:e.y+Math.sin(l)*2.6,r:.75,dmg:3*t.wind*s,tick:15})}for(let o=0;o<t.orbit;o++){let l=-n.time*.07+o/t.orbit*Math.PI*2;n.orbiters.push({kind:"dahong",x:e.x+Math.cos(l)*1.55,y:e.y+Math.sin(l)*1.55,r:.4,dmg:4*s,tick:20})}r&&!n.saidWind&&(n.saidWind=!0,Ot(n,Ut.wind[0],160));for(let o of n.orbiters)for(let l of n.enemies){if(Math.hypot(l.x-o.x,l.y-o.y)>o.r+l.r)continue;let c=o.kind;(l.hitBy[c]||0)>n.time||(l.hitBy[c]=n.time+o.tick,hi(n,l,o.dmg,{sfx:!1}))}let a=n.bull;if(a){if(a.t++,a.mode==="follow"){let o=e.x-Math.cos(e.face)*1.4,l=e.y-Math.sin(e.face)*1.4;if(a.vx+=((o-a.x)*.08-a.vx)*.2,a.vy+=((l-a.y)*.08-a.vy)*.2,a.t>90-t.bull*15){let c=bp(n,e.x,e.y,9);if(c){let h=Math.hypot(c.x-a.x,c.y-a.y)||1;a.vx=(c.x-a.x)/h*.26,a.vy=(c.y-a.y)/h*.26,a.mode="charge",a.t=0,ot(n,"moo"),e.sayT<=0&&bt(n)<.3&&Ot(n,xt(n,Ut.bull),110)}}}else a.t>40&&(a.mode="follow",a.t=0);if(a.x=Xn(a.x+a.vx,-Pe+.6,Pe-.6),a.y=Xn(a.y+a.vy,-nt+.6,nt-.6),a.mode==="charge")for(let o of n.enemies)Math.hypot(o.x-a.x,o.y-a.y)>.8+o.r||(o.hitBy.bull||0)>n.time||(o.hitBy.bull=n.time+30,hi(n,o,12*t.bull*s,{kx:a.vx*1.2,ky:a.vy*1.2,sfx:!1}),wn(n,o.x,o.y,"dust",5))}}function Yv(n){let e=n.hero;if(e.ult<100){e.sayT<=0&&Ot(n,"\u8D85\u7EA7\u8718\u86DB\u8FD8\u6CA1\u5145\u597D",70);return}e.ult=0,Ot(n,xt(n,Ut.ult),150),lt(n,"ult",{x:e.x,y:e.y}),lt(n,"shake",{amt:.7}),ot(n,"ult");for(let t of n.enemies)Fi(t,e)<12&&(t.web=Ln[t.type].boss?100:260);n.ebullets=[]}function Zv(n){let e=n.hero,t=n.enemies;for(let i=0;i<t.length;i++){let s=t[i];for(let r=i+1;r<t.length;r++){let a=t[r],o=a.x-s.x,l=a.y-s.y,c=s.r+a.r;if(Math.abs(o)>c||Math.abs(l)>c)continue;let h=Math.hypot(o,l);if(h>=c||h<1e-4)continue;let u=(c-h)*.25,d=o/h,f=l/h,m=a.r/c,M=s.r/c;s.x-=d*u*m,s.y-=f*u*m,a.x+=d*u*M,a.y+=f*u*M}}for(let i of t){if(i.dead)continue;i.t++,i.flash>0&&i.flash--,i.web>0&&(i.web--,i.web%20===0&&hi(n,i,4*(e.s.dmg/5),{sfx:!1})),i.x+=i.kx,i.y+=i.ky,i.kx*=.82,i.ky*=.82;let s=e.x-i.x,r=e.y-i.y,a=Math.hypot(s,r)||1,o=s/a,l=r/a,c=i.stun>0||i.web>0;i.stun>0&&i.stun--,c||$v(n,i,a,o,l),i.x=Xn(i.x,-Pe+i.r,Pe-i.r),i.y=Xn(i.y,-nt+i.r,nt-i.r),Mp(i),!c&&i.dmg&&a<i.r+e.r&&Au(n,i.dmg,i.x,i.y)}}function $v(n,e,t,i,s){let r=n.hero,a=(o=1)=>{e.x+=i*e.sp*o,e.y+=s*e.sp*o,e.face=Math.atan2(s,i)};switch(e.type){case"goat":e.mode==="walk"?(a(),t<6.5&&--e.cd<=0&&(e.mode="wind",e.modeT=40,e.cx=i,e.cy=s,e.face=Math.atan2(s,i))):e.mode==="wind"?--e.modeT<=0&&(e.mode="dash",e.modeT=24,ot(n,"baa")):e.mode==="dash"&&(e.x+=e.cx*.24,e.y+=e.cy*.24,--e.modeT<=0&&(e.mode="walk",e.cd=mt(n,120,180),n.ebullets.push({id:n.uid++,x:e.x,y:e.y,vx:i*.13,vy:s*.13,r:.2,life:200,dmg:1,kind:"sausage",spin:0}),$t(n,e.x,e.y,xt(n,Dn.goat),"shout"),r.sayT<=0&&t<9&&bt(n)<.6&&Ot(n,xt(n,Ut.life),120),ot(n,"throw")));break;case"jia":case"yi":case"guo":{let o=e.type==="guo"?7:6;t>o+.6?a():t<o-1.5?a(-.8):(e.x+=-s*e.sp*.5*(e.id%2?1:-1),e.y+=i*e.sp*.5*(e.id%2?1:-1),e.face=Math.atan2(s,i)),--e.cd<=0&&t<11&&(e.cd=mt(n,150,210),e.type==="guo"?n.zones.push({id:n.uid++,x:r.x+r.vx*30,y:r.y+r.vy*30,r:1.3,t:70,T:70,dmg:2,kind:"ping"}):n.ebullets.push({id:n.uid++,x:e.x+i*.5,y:e.y+s*.5,vx:i*.11,vy:s*.11,r:.18,life:220,dmg:1,kind:"bolt"}),ot(n,e.type==="guo"?"ping":"eshoot"),bt(n)<.3&&($t(n,e.x,e.y,xt(n,Dn[e.type]),"shout"),bt(n)<.3&&r.sayT<=0&&Ot(n,xt(n,Ut.voice),90)));break}case"orange":{(e.dx==null||--e.cd<=0)&&(e.dx=i,e.dy=s,e.cd=mt(n,150,220),bt(n)<.25&&$t(n,e.x,e.y,xt(n,Dn.orange),"shout")),e.x+=e.dx*e.sp,e.y+=e.dy*e.sp,Math.abs(e.x)>Pe-e.r-.05&&(e.dx=-Math.sign(e.x)*Math.abs(e.dx)),Math.abs(e.y)>nt-e.r-.05&&(e.dy=-Math.sign(e.y)*Math.abs(e.dy));for(let o of ps){let l=e.x-o.x,c=e.y-o.y,h=Math.hypot(l,c);if(h<o.r+e.r+.05){let u=l/h,d=c/h,f=e.dx*u+e.dy*d;f<0&&(e.dx-=2*f*u,e.dy-=2*f*d)}}e.face=Math.atan2(e.dy,e.dx),e.roll=(e.roll||0)+e.sp/e.r;break}case"dingding":if(e.mode==="walk")a(),t<5.5&&--e.cd<=0&&(e.mode="leap",e.modeT=40,e.sx=e.x,e.sy=e.y,e.tx=r.x,e.ty=r.y,n.zones.push({id:n.uid++,x:r.x,y:r.y,r:1.1,t:40,T:40,dmg:2,kind:"slam"}),bt(n)<.5&&$t(n,e.x,e.y,xt(n,Dn.dingding),"shout"));else{let o=1-e.modeT/40;e.x=e.sx+(e.tx-e.sx)*o,e.y=e.sy+(e.ty-e.sy)*o,e.hop=Math.sin(o*Math.PI)*1.6,--e.modeT<=0&&(e.mode="walk",e.hop=0,e.cd=mt(n,140,200),wn(n,e.x,e.y,"dust",10))}break;case"caesar":t>5.5?a():t<3.5?a(-.6):a(.2),--e.cd<=0&&t<9&&(e.cd=mt(n,150,200),e.throwT=18,n.ebullets.push({id:n.uid++,x:e.x+i*.5,y:e.y+s*.5,vx:i*.16,vy:s*.16,r:.18,life:140,dmg:2,kind:"spear"}),bt(n)<.35&&$t(n,e.x,e.y,xt(n,Dn.caesar),"shout"),ot(n,"throw")),e.throwT>0&&e.throwT--;break;case"chenwei":if(e.mode==="walk")t>8.5?a():t<5?a(-.8):(e.x+=-s*e.sp*.4,e.y+=i*e.sp*.4,e.face=Math.atan2(s,i)),--e.cd<=0&&t<12&&(bt(n)<.3?(n.zones.push({id:n.uid++,x:r.x+r.vx*25,y:r.y+r.vy*25,r:3.2,t:55,T:55,dmg:0,kind:"flash"}),$t(n,e.x,e.y,"Fire in the hole!","shout"),e.cd=mt(n,160,220)):(e.mode="aim",e.modeT=50,e.aimX=r.x,e.aimY=r.y));else if(e.mode==="aim")e.aimX+=(r.x-e.aimX)*.05,e.aimY+=(r.y-e.aimY)*.05,e.face=Math.atan2(e.aimY-e.y,e.aimX-e.x),--e.modeT<=0&&(e.mode="burst",e.modeT=18);else if(e.mode==="burst"){if(e.modeT%6===0){let o=Math.atan2(e.aimY-e.y,e.aimX-e.x)+mt(n,-.05,.05);n.ebullets.push({id:n.uid++,x:e.x+Math.cos(o)*.5,y:e.y+Math.sin(o)*.5,vx:Math.cos(o)*.24,vy:Math.sin(o)*.24,r:.12,life:90,dmg:1,kind:"bolt"}),ot(n,"rifle")}--e.modeT<=0&&(e.mode="walk",e.cd=mt(n,130,190),bt(n)<.25&&$t(n,e.x,e.y,xt(n,Dn.chenwei),"shout"))}break;case"ginger":{--e.cd<=0&&(e.side=(e.side||1)*-1,e.cd=mt(n,26,46),bt(n)<.12&&$t(n,e.x,e.y,xt(n,Dn.ginger),"shout"));let o=t<2.2?.2:.85;e.x+=(i+-s*(e.side||1)*o)*e.sp,e.y+=(s+i*(e.side||1)*o)*e.sp,e.face=Math.atan2(s+i*(e.side||1)*o,i-s*(e.side||1)*o);break}case"oyster":if(a(),e.t%400===0&&bt(n)<.3&&$t(n,e.x,e.y,xt(n,Dn.oyster),"shout"),--e.cd<=0&&t<9){e.cd=Ln.oyster.spit,e.open=20;let o=Math.atan2(s,i);for(let l=-1;l<=1;l++)n.ebullets.push({id:n.uid++,x:e.x,y:e.y,vx:Math.cos(o+l*.28)*.09,vy:Math.sin(o+l*.28)*.09,r:.16,life:200,dmg:1,kind:"pearl"});ot(n,"spit")}e.open>0&&e.open--;break;case"thief":{if(e.skill==null&&(e.skill=mt(n,120,200)),t<7.5&&--e.skill<=0){e.skill=mt(n,240,320);let c=Math.atan2(s,i);for(let h=-1;h<=1;h++)n.ebullets.push({id:n.uid++,x:e.x,y:e.y,vx:Math.cos(c+h*.32)*.1,vy:Math.sin(c+h*.32)*.1,r:.2,life:220,dmg:1,kind:"hongbao"});$t(n,e.x,e.y,xt(n,Dn.caili),"shout"),ot(n,"throw")}let o=null,l=1e9;for(let c of n.gems){let h=Math.hypot(c.x-e.x,c.y-e.y);h<l&&(l=h,o=c)}if(t<3.5)a(-1.1),e.t%300===1&&bt(n)<.5&&$t(n,e.x,e.y,xt(n,Dn.thief),"shout");else if(o){let c=o.x-e.x,h=o.y-e.y,u=Math.hypot(c,h)||1;e.x+=c/u*e.sp,e.y+=h/u*e.sp,e.face=Math.atan2(h,c),u<.5&&(o.gone=!0,e.carry++,e.carry===3&&$t(n,e.x,e.y,xt(n,Dn.thief),"shout"))}else a(.6);n.gems=n.gems.filter(c=>!c.gone);break}case"bigmao":if(e.mode==="walk")a(),--e.cd<=0&&($t(n,e.x,e.y,xt(n,Dn.mao),"shout"),e.mode="leap",e.modeT=60,e.tx=r.x,e.ty=r.y,e.sx=e.x,e.sy=e.y,n.zones.push({id:n.uid++,x:r.x,y:r.y,r:2.4,t:60,T:60,dmg:2,kind:"slam"}));else if(e.mode==="leap"){let o=1-e.modeT/60;if(e.x=e.sx+(e.tx-e.sx)*o,e.y=e.sy+(e.ty-e.sy)*o,e.hop=Math.sin(o*Math.PI)*4,--e.modeT<=0&&(e.mode="walk",e.hop=0,e.cd=mt(n,200,260),lt(n,"shake",{amt:.6}),wn(n,e.x,e.y,"fluff",30),ot(n,"slam"),n.enemies.length<to))for(let l=0;l<2;l++)n.enemies.push(Lc(n,"maoqiu",e.x+mt(n,-1,1),e.y+mt(n,-1,1)))}break;case"judge":{let o=e.hp<e.max/2;if(e.mode==="walk"){if(a(o?1.4:1),--e.cd<=0){let l=["slam","papers","gavel"];if(e.mode=l[e.moveIdx=((e.moveIdx??-1)+1)%3],e.modeT=50,bt(n)<.6&&$t(n,e.x,e.y,xt(n,Dn.judge),"shout"),e.mode==="slam"&&n.zones.push({id:n.uid++,x:e.x,y:e.y,r:4,t:50,T:50,dmg:3,kind:"slam",follow:e.id}),e.mode==="gavel")for(let c=0;c<(o?7:5);c++){let h=mt(n,0,Math.PI*2),u=c===0?0:mt(n,1.5,4);n.zones.push({id:n.uid++,x:r.x+Math.cos(h)*u,y:r.y+Math.sin(h)*u,r:1.2,t:55+c*6,T:55+c*6,dmg:2,kind:"gavel"})}}}else if(--e.modeT<=0){if(e.mode==="papers"){let l=o?18:12,c=mt(n,0,1);for(let h=0;h<l;h++){let u=(h+c)/l*Math.PI*2;n.ebullets.push({id:n.uid++,x:e.x,y:e.y,vx:Math.cos(u)*.1,vy:Math.sin(u)*.1,r:.25,life:260,dmg:1,kind:"paper",spin:mt(n,0,6)})}ot(n,"throw")}if(o&&bt(n)<.5&&n.enemies.length<to)for(let l=0;l<2;l++)n.spawns.push({x:Xn(e.x+mt(n,-3,3),-Pe+1,Pe-1),y:Xn(e.y+mt(n,-3,3),-nt+1,nt-1),type:bt(n)<.5?"jia":"yi",t:50});e.mode="walk",e.cd=o?110:160}break}case"mao":case"maoqiu":a(),e.type==="mao"&&e.t%300===0&&bt(n)<.4&&$t(n,e.x,e.y,xt(n,Dn.mao),"shout");break;default:a()}}function Jv(n){let e=n.hero,t=e.s;for(let i of n.bullets){if(i.x+=i.vx,i.y+=i.vy,--i.life<=0||Math.abs(i.x)>Pe||Math.abs(i.y)>nt){i.dead=!0,n.missStreak++;continue}for(let s of n.enemies){if(s.dead||i.hit.has(s.id)||Math.hypot(s.x-i.x,s.y-i.y)>s.r+.15)continue;i.hit.add(s.id),n.hitsTotal++,n.missStreak>=4&&e.sayT<=0&&Ot(n,xt(n,Ut.hit),100),n.missStreak=0;let r=Math.hypot(i.vx,i.vy);if(hi(n,s,t.dmg,{canCrit:!0,kx:i.vx/r*.06,ky:i.vy/r*.06}),wn(n,i.x,i.y,"spark",4),i.pierce--<=0){i.dead=!0;break}}}n.bullets=n.bullets.filter(i=>!i.dead);for(let i of n.ebullets){if(i.x+=i.vx,i.y+=i.vy,--i.life<=0||Math.abs(i.x)>Pe+1||Math.abs(i.y)>nt+1){i.dead=!0;continue}Math.hypot(e.x-i.x,e.y-i.y)<e.r+i.r&&(i.dead=!0,Au(n,i.dmg,i.x,i.y)&&i.kind==="hongbao"&&$t(n,e.x,e.y,"\u5F69\u793C -38.8W","shout"))}n.ebullets=n.ebullets.filter(i=>!i.dead)}function Kv(n){let e=n.hero;for(let t of n.zones){if(t.follow){let i=n.enemies.find(s=>s.id===t.follow);i&&(t.x=i.x,t.y=i.y)}if(!(--t.t>0)){if(t.done=!0,t.kind==="flash"){lt(n,"ring",{x:t.x,y:t.y,r:t.r,kind:"flash"}),ot(n,"flash"),Math.hypot(e.x-t.x,e.y-t.y)<t.r&&(lt(n,"flashbang",{}),e.sayT<=0&&Ot(n,xt(n,Ut.flash),110));continue}lt(n,"ring",{x:t.x,y:t.y,r:t.r,kind:t.kind}),wn(n,t.x,t.y,t.kind==="ping"?"ping":"dust",14),ot(n,t.kind==="ping"?"pingland":"slam"),t.kind!=="ping"&&lt(n,"shake",{amt:.25}),Math.hypot(e.x-t.x,e.y-t.y)<t.r+e.r*.5&&Au(n,t.dmg,t.x,t.y)}}n.zones=n.zones.filter(t=>!t.done)}function jv(n){let e=n.hero,t=e.s.pickup;for(let i of n.gems){let s=e.x-i.x,r=e.y-i.y,a=Math.hypot(s,r);a<t&&(i.mag=!0),i.mag&&(i.vx+=s/(a||1)*.03,i.vy+=r/(a||1)*.03,i.vx*=.9,i.vy*=.9,i.x+=i.vx,i.y+=i.vy,a<.45&&(i.got=!0,_p(n,i.v),ot(n,"gem")))}n.gems=n.gems.filter(i=>!i.got)}function Qv(n){let e=n.hero,t=Object.keys(Pc[n.wave]).filter(l=>l!=="maoqiu"),i=t[Math.floor(bt(n)*t.length)],s=xt(n,Object.keys(wu)),r,a,o=0;do r=mt(n,-Pe+2,Pe-2),a=mt(n,-nt+2,nt-2);while(Math.hypot(r-e.x,a-e.y)<6&&++o<20);n.spawns.push({x:r,y:a,type:i,t:80,elite:s})}function Sp(n,e,t,i){return{id:n.uid++,kind:e,x:Xn(t,-Pe+1,Pe-1),y:Xn(i,-nt+1,nt-1),t:e==="chest"?20*Bi:14*Bi,born:n.t}}function eM(n){let e=Object.entries(eo).filter(([,s])=>s.w>0),t=e.reduce((s,[,r])=>s+r.w,0),i=bt(n)*t;for(let[s,r]of e)if((i-=r.w)<0)return s;return"douzhi"}function tM(n){let e=n.hero;if(--n.pickT<=0){n.pickT=mt(n,540,780);let t=mt(n,0,Math.PI*2),i=mt(n,3,7);n.pickups.push(Sp(n,eM(n),e.x+Math.cos(t)*i,e.y+Math.sin(t)*i)),ot(n,"pickupSpawn")}for(let t of n.pickups){if(--t.t<=0){t.gone=!0;continue}Math.hypot(t.x-e.x,t.y-e.y)<1&&(t.gone=!0,nM(n,t))}if(n.pickups=n.pickups.filter(t=>!t.gone),n.stampede){let t=n.stampede;t.x+=t.dir*.36;for(let i of t.bulls)for(let s of n.enemies)t.hit.has(s.id)||Math.abs(s.y-(t.y+i))>1+s.r||Math.abs(s.x-t.x)>1+s.r||(t.hit.add(s.id),hi(n,s,t.dmg,{kx:t.dir*.5,ky:0,sfx:!1}));Math.abs(t.x)>Pe+4&&(n.stampede=null)}}function mp(n,e,t){let i=n.hero,s=n.enemies.slice().sort((r,a)=>Fi(r,i)-Fi(a,i)).slice(0,e);for(let r=0;r<e;r++){let a=s[r],o=a?{x:a.x,y:a.y}:{x:i.x+mt(n,-6,6),y:i.y+mt(n,-5,5)};Object.assign(o,{t:20+r*5,r:1.8,dmg:t}),n.meteors.push(o),lt(n,"meteor",{x:o.x,y:o.y,t:o.t})}}function gp(n,e,t){let i=n.hero,s=i.x>0?-1:1,r=e===3?[-1.4,0,1.4]:[-2.8,-1.4,0,1.4,2.8];n.stampede={x:-s*(Pe+3),y:i.y,dir:s,bulls:r,hit:new Set,dmg:t},lt(n,"stampede",{}),ot(n,"moo"),ot(n,"gallop")}function nM(n,e){let t=n.hero,i=t.s,s=i.dmg/5,r=eo[e.kind],a=r.name;switch(e.kind){case"horse":Nc(n,"horse",360);break;case"bike":Nc(n,"bike",360);break;case"bull":gp(n,3,30*s);break;case"meteor":mp(n,8,25*s);break;case"chief":t.bless=480,wn(n,t.x,t.y,"gold",40);break;case"spider":t.ult=Math.min(100,t.ult+50);break;case"douzhi":i.hp=Math.min(i.maxhp,i.hp+i.maxhp*.4);break;case"magnet":for(let o of n.gems)o.mag=!0;break;case"chest":{n.score+=500;let o=Math.floor(bt(n)*4);o===0?(mp(n,16,30*s),a="\u5927\u7EA2\u5B9D\u7BB1 \xB7 \u6D41\u661F\u96E8"):o===1?(gp(n,5,40*s),a="\u5927\u7EA2\u5B9D\u7BB1 \xB7 \u767D\u725B\u7FA4"):o===2?(i.hp=i.maxhp,t.shields=Math.max(t.shields,1)+1,a="\u5927\u7EA2\u5B9D\u7BB1 \xB7 \u6EE1\u8840\u52A0\u62A4\u76FE"):(t.ult=100,a="\u5927\u7EA2\u5B9D\u7BB1 \xB7 \u8D85\u7EA7\u8718\u86DB\u5145\u6EE1"),wn(n,e.x,e.y,"gold",50);break}}e.kind!=="horse"&&e.kind!=="bike"&&Ot(n,e.kind==="chest"?xt(n,Ut.chest):r.line,130),lt(n,"pickup",{kind:e.kind,x:e.x,y:e.y,text:a}),ot(n,e.kind==="chest"?"chest":"pickup"),wn(n,e.x,e.y,"sugar",18)}function iM(n){let e=n.hero,t=e.s;if(n.wave>=7&&n.wave<=9&&--n.tideT<=0){n.tideT=mt(n,720,900);let i=bt(n)<.5?1:-1;n.tides.push({id:n.uid++,x:-i*(Pe+2),dir:i,warn:90,friendly:!1,hit:new Set}),lt(n,"tideWarn",{dir:i}),n.tideSaid||(n.tideSaid=!0,Ot(n,xt(n,Ut.tide),160))}if(t.tide&&++e.timers.tide>=Math.max(480,720-90*(t.tide-1))){e.timers.tide=0;let i=e.x>0?-1:1;n.tides.push({id:n.uid++,x:-i*(Pe+2),dir:i,warn:0,friendly:!0,hit:new Set,dmg:15*t.tide*(t.dmg/5)}),ot(n,"tide")}for(let i of n.tides){if(i.warn>0){--i.warn===0&&ot(n,"tide");continue}i.x+=i.dir*.3;let s=r=>Math.abs(r.x-i.x)<1.4;!i.friendly&&s(e)&&(e.vx+=i.dir*.04,e.x=Xn(e.x+i.dir*.12,-Pe+e.r,Pe-e.r));for(let r of n.enemies)s(r)&&(r.kx+=i.dir*(i.friendly?.06:.03),i.friendly&&!i.hit.has(r.id)&&(i.hit.add(r.id),hi(n,r,i.dmg,{sfx:!1})));Math.abs(i.x)>Pe+3&&Math.sign(i.x)===i.dir&&(i.done=!0)}n.tides=n.tides.filter(i=>!i.done)}function Nc(n,e,t){let i=n.hero;i.ride=t,i.mount=e,Ot(n,xt(n,e==="bike"?Ut.bike:Ut.horse),130),lt(n,"horse",{kind:e}),ot(n,e==="bike"?"bell":"gallop")}function Tp(n,e=!1){let t=n[0].index!==null,i=new Set(Object.keys(n[0].attributes)),s=new Set(Object.keys(n[0].morphAttributes)),r={},a={},o=n[0].morphTargetsRelative,l=new Et,c=0;for(let h=0;h<n.length;++h){let u=n[h],d=0;if(t!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let f in u.attributes){if(!i.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;r[f]===void 0&&(r[f]=[]),r[f].push(u.attributes[f]),d++}if(d!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(o!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let f in u.morphAttributes){if(!s.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;a[f]===void 0&&(a[f]=[]),a[f].push(u.morphAttributes[f])}if(e){let f;if(t)f=u.index.count;else if(u.attributes.position!==void 0)f=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,f,h),c+=f}}if(t){let h=0,u=[];for(let d=0;d<n.length;++d){let f=n[d].index;for(let m=0;m<f.count;++m)u.push(f.getX(m)+h);h+=n[d].attributes.position.count}l.setIndex(u)}for(let h in r){let u=Ep(r[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(let h in a){let u=a[h][0].length;if(u!==0){l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let d=0;d<u;++d){let f=[];for(let M=0;M<a[h].length;++M)f.push(a[h][M][d]);let m=Ep(f);if(!m)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(m)}}}return l}function Ep(n){let e,t,i,s=-1,r=0;for(let c=0;c<n.length;++c){let h=n[c];if(e===void 0&&(e=h.array.constructor),e!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=h.itemSize),t!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=h.normalized),i!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=h.gpuType),s!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*t}let a=new e(r),o=new Ht(a,t,i),l=0;for(let c=0;c<n.length;++c){let h=n[c];if(h.isInterleavedBufferAttribute){let u=l/t;for(let d=0,f=h.count;d<f;d++)for(let m=0;m<t;m++){let M=h.getComponent(d,m);o.setComponent(d+u,m,M)}}else a.set(h.array,l);l+=h.count*t}return s!==void 0&&(o.gpuType=s),o}var sM=(()=>{let n=new Uint8Array([70,70,70,255,150,150,150,255,215,215,215,255,255,255,255,255]),e=new Ts(n,4,1,Fn);return e.minFilter=e.magFilter=en,e.needsUpdate=!0,e})(),Oi=new Map,no={color:{value:new Ue("#fff0d8")},k:{value:.4}};function rM(n){return n.onBeforeCompile=e=>{e.uniforms.uRim=no.color,e.uniforms.uRimK=no.k,e.fragmentShader=`uniform vec3 uRim; uniform float uRimK;
`+e.fragmentShader.replace("#include <opaque_fragment>",`float rimF = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 3.0);
outgoingLight += uRim * rimF * uRimK;
#include <opaque_fragment>`)},n.customProgramCacheKey=()=>"rim-toon",n}function N(n,e={}){let t=n+JSON.stringify(e);return Oi.has(t)||Oi.set(t,rM(new ba({color:n,gradientMap:sM,...e}))),Oi.get(t)}function wt(n,e=2){let t="glow"+n+e;return Oi.has(t)||Oi.set(t,new Gn({color:n,emissive:n,emissiveIntensity:e,roughness:.4})),Oi.get(t)}function ui(n,e={}){let t="gl"+n+JSON.stringify(e);return Oi.has(t)||Oi.set(t,new pr({color:n,roughness:.18,clearcoat:1,clearcoatRoughness:.1,...e})),Oi.get(t)}var Cu=new It({color:"#1d1a24",side:un});function O(n,e,t=0,i=0,s=0){let r=new pe(n,e);return r.position.set(t,i,s),r.castShadow=!0,r}var je=(n,e=18)=>new ft(n,e,Math.max(8,e*.7|0));function ms(n,e=.045){let t=[];n.traverse(i=>{i.isMesh&&!i.userData.noInk&&i.material!==Cu&&t.push(i)});for(let i of t){i.geometry.computeBoundingSphere();let s=i.geometry.boundingSphere.radius*Math.max(i.scale.x,i.scale.y,i.scale.z);if(s<.06)continue;let r=new pe(i.geometry,Cu);r.scale.setScalar(1+e/Math.max(s,.12)),r.userData.noInk=!0,i.add(r)}return n}var Iu=new It({color:"#ffffff"});function Qn(n,e,t,i,s=.075,r=1){let a=[];for(let o of[-1,1]){let l=O(je(s,16),N("#ffffff"),e,t,i*o),c=O(je(s*.62,14),N("#1d1a24"),s*.52*r,0,0),h=O(je(s*.24,8),Iu,s*.88,s*.32,-s*.15),u=O(je(s*.11,6),Iu,s*.9,-s*.22,s*.12);c.userData.noInk=h.userData.noInk=u.userData.noInk=!0,l.add(c,h,u),n.add(l),a.push(l)}return a}function wp(){let n=new ye,e=new ye;n.add(e);let t="#3f8f45",i="#79c46c",s="#9edb84",r="#f2dc96",a="#ff6fae",o=O(new ft(.56,28,14,0,Math.PI*2,0,Math.PI/2),N(t));o.scale.set(1,.78,.9),o.position.y=.24,e.add(o);let l=new Le(.15,.16,.05,6),c=new P(0,1,0),h=[[0,0]];for(let w=0;w<6;w++)h.push([.62,w*Math.PI/3]);for(let w=0;w<10;w++)h.push([1.12,w*Math.PI/5+.3]);for(let[w,R]of h){let L=new P(Math.sin(w)*Math.cos(R),Math.cos(w),Math.sin(w)*Math.sin(R)),F=O(l,N(w>1?"#5aa752":i));F.position.set(L.x*.56,L.y*.56*.78+.24,L.z*.56*.9),F.quaternion.setFromUnitVectors(c,new P(L.x,L.y/.78,L.z/.9).normalize()),F.scale.setScalar(w>1?.75:1),F.userData.noInk=!0,e.add(F)}let u=O(new Tt(.53,.07,10,40),N(r),0,.24,0);u.rotation.x=Math.PI/2,u.scale.set(1,.9,1),e.add(u);let d=O(new Le(.5,.44,.14,32),N(r),0,.17,0);d.scale.z=.9,e.add(d);let f=new ye;f.position.set(.6,.42,0),e.add(f),f.add(O(new Le(.11,.13,.26,12).rotateZ(Math.PI/2.6),N(s),-.12,-.08,0));let m=O(je(.27,22),N(s));m.scale.set(1.05,.95,1),f.add(m);let M=Qn(f,.17,.07,.12,.09);for(let[w,R]of M.entries()){let L=w?1:-1;for(let F=0;F<3;F++){let z=O(new Ze(.012,.055,.012),N("#1d1a24"),.03,.09,(F-1)*.03*L+.02*L);z.rotation.x=(F-1)*.35*L,z.rotation.z=-.35,z.userData.noInk=!0,R.add(z)}}for(let w of[-1,1])for(let R=0;R<3;R++){let L=O(je(.012,6),N("#5aa752"),.05+R*.035,.16-R*.02,.17*w);L.userData.noInk=!0,f.add(L)}for(let w of[-1,1]){let R=O(je(.055,10),N("#ff9fbf"),.16,-.06,.19*w);R.scale.set(.5,.6,1),R.userData.noInk=!0,f.add(R)}let g=O(new Tt(.06,.014,6,12,Math.PI),N("#2d5a27"),.255,-.06,0);g.rotation.set(0,Math.PI/2,Math.PI),g.userData.noInk=!0,f.add(g);let p=O(new Tt(.3,.035,8,26,Math.PI).rotateY(Math.PI/2),N(a),-.02,.02,0);f.add(p);for(let w of[-1,1]){let R=O(new Le(.1,.1,.07,18).rotateX(Math.PI/2),N(a),-.02,0,.29*w);R.add(O(new Le(.06,.06,.02,14).rotateX(Math.PI/2),wt("#ffd1e8",1.4),0,0,.045*w)),f.add(R)}let b=O(new Le(.014,.014,.34,6).rotateZ(Math.PI/2.3),N("#2a2a33"),.12,-.12,.27);b.rotation.y=.35,b.userData.noInk=!0,f.add(b),f.add(O(je(.035,8),N("#2a2a33"),.27,-.2,.22));let _=new ye;_.position.set(-.12,.7,0);for(let w of[-1,1]){let R=O(new Zt(.11,.2,4).rotateX(w*Math.PI/2),N(a),0,0,.1*w);R.scale.y=.6,_.add(R)}_.add(O(je(.06,10),N("#ff4f99"))),e.add(_);let x=[];for(let[w,R]of[[.3,.33],[.3,-.33],[-.28,.33],[-.28,-.33]]){let L=new ye;L.position.set(w,.2,R),L.add(O(new vt(.1,.1,4,10),N(s),0,-.08,0));for(let F=-1;F<=1;F++){let z=O(je(.025,6),N("#ff8fbf"),.09,-.19,F*.045);z.userData.noInk=!0,L.add(z)}e.add(L),x.push(L)}e.add(O(new Zt(.07,.22,8).rotateZ(Math.PI/2),N(s),-.62,.18,0));let S=new ye;S.position.set(0,.42,0);let T=new ye;T.position.set(0,0,.52),T.add(O(new Ze(.46,.13,.12),N("#2c2c38"),.12,0,0)),T.add(O(new Ze(.12,.18,.08),N("#2c2c38"),-.02,-.1,0)),T.add(O(new Le(.035,.035,.14,8).rotateZ(Math.PI/2),N("#55556a"),.41,.02,0));let A=O(new Ze(.12,.06,.125),N(a),.14,.02,0);A.userData.noInk=!0,T.add(A);let y=O(je(.12,10),new It({color:"#fff3a8",transparent:!0,opacity:0}),.55,.02,0);return y.userData.noInk=!0,y.userData.noBake=!0,y.castShadow=!1,T.add(y),S.add(T),n.add(S),ms(n),n.userData={body:e,head:f,legs:x,gun:S,barrel:T,flash:y,bow:_,eyes:M},n}function Uc({shirt:n,pants:e="#2b2d3a",skin:t="#f3c79a",hair:i="#2a1e18",h:s=1,headless:r=!1}={}){let a=new ye,o=new ye;a.add(o);let l=[];for(let f of[-1,1]){let m=new ye;m.position.set(0,.5*s,.12*f),m.add(O(new vt(.08,.32*s,4,8),N(e),0,-.24*s,0)),o.add(m),l.push(m)}let c=O(new vt(.2,.3*s,6,14),N(n),0,.82*s,0);c.scale.z=.85,o.add(c);let h=[];for(let f of[-1,1]){let m=new ye;m.position.set(0,.98*s,.27*f),m.add(O(new vt(.065,.3*s,4,8),N(n),0,-.18*s,0)),o.add(m),h.push(m)}let u=new ye;if(u.position.y=1.3*s,o.add(u),a.userData={body:o,legs:l,arms:h,head:u},r)return a;u.add(O(je(.22,18),N(t)));let d=O(new ft(.235,18,10,0,Math.PI*2,0,Math.PI/2),N(i),-.02,.02,0);return u.add(d),Qn(u,.17,.02,.08,.05),o.add(u),a.userData={body:o,legs:l,arms:h,head:u},a}function Pu(){let n=Uc({shirt:"#3a7bd5",pants:"#2b2d3a",hair:"#1c1c22"}),{head:e,body:t}=n.userData;t.add(O(new ft(.2,14,8,0,Math.PI*2,0,Math.PI/2).rotateZ(Math.PI/2),N("#2f63b0"),-.2,1.12,0)),e.add(O(new Tt(.25,.03,6,20,Math.PI).rotateY(Math.PI/2),N("#3ad17a"),0,.02,0));for(let s of[-1,1]){e.add(O(new Le(.08,.08,.06,14).rotateX(Math.PI/2),N("#3ad17a"),0,0,.24*s));let r=O(new Tt(.06,.014,6,16).rotateY(Math.PI/2),N("#1d1a24"),.22,.02,.085*s);r.userData.noInk=!0,e.add(r)}let i=O(new Ze(.5,.04,.18),N("#2a2a33"),.05,.8,.34);return i.rotation.x=.5,i.add(O(new Ze(.44,.02,.12),wt("#7fe3ff",.8),0,.03,0)),t.add(i),ms(n,.035),n}function Ru(n,e,t="#fff"){let i=document.createElement("canvas");i.width=256,i.height=128;let s=i.getContext("2d");s.fillStyle=e,s.fillRect(0,0,256,128),s.strokeStyle="rgba(0,0,0,.35)",s.lineWidth=10,s.strokeRect(5,5,246,118),s.fillStyle=t,s.font='bold 76px "PingFang SC","Microsoft YaHei",sans-serif',s.textAlign="center",s.textBaseline="middle",s.fillText(n,128,70);let r=new Li(i);r.colorSpace=hn;let a=new ye,o=O(new Ze(.62,.32,.04),[N("#8a5a2b"),N("#8a5a2b"),N("#8a5a2b"),N("#8a5a2b"),new It({map:r}),new It({map:r})]);return o.position.y=.32,o.userData.noInk=!0,a.add(o,O(new Le(.02,.02,.4,6),N("#8a5a2b"),0,.05,0)),a}function Ap(n){let e=new ye,t=new ye;e.add(t);let i={body:t};switch(n){case"durian":{let r=O(new zn(.42,1),N("#c9d44c",{flatShading:!0}),0,.48,0);t.add(r);let a=new zn(.42,1).getAttribute("position"),o=new Set,l=new Zt(.07,.2,5),c=new P(0,1,0);for(let h=0;h<a.count;h++){let u=new P().fromBufferAttribute(a,h),d=u.toArray().map(M=>M.toFixed(2)).join();if(o.has(d))continue;o.add(d);let f=O(l,N("#8d9a2e")),m=u.clone().normalize();f.position.copy(m.multiplyScalar(.46)).add(new P(0,.48,0)),f.quaternion.setFromUnitVectors(c,u.clone().normalize()),f.userData.noInk=!0,t.add(f)}Qn(t,.36,.56,.13,.08);for(let h of[-1,1])t.add(O(new vt(.07,.06,4,8),N("#6d5a2e"),0,.08,.18*h));break}case"oyster":{let r="#8d8aa0",a="#b7a9c9",o=O(new ft(.62,24,10,0,Math.PI*2,Math.PI/2,Math.PI/2),N(r),0,.34,0);o.scale.set(1,.45,.85),t.add(o);for(let f=0;f<16;f++){let m=f/16*Math.PI*2,M=O(je(.1,8),N(a),Math.cos(m)*.6,.33,Math.sin(m)*.5);M.scale.y=.5,M.userData.noInk=!0,t.add(M)}let l=O(je(.22,20),ui("#fff7f2",{emissive:"#ffd9ec",emissiveIntensity:.9}),.12,.4,0);t.add(l);let c=new ye;c.position.set(-.5,.34,0);let h=O(new ft(.62,24,10,0,Math.PI*2,0,Math.PI/2),N("#a6a3b8"),.5,0,0);h.scale.set(1,.42,.85),c.add(h);for(let f=-2;f<=2;f++){let m=O(new Tt(.44-Math.abs(f)*.05,.025,4,20,Math.PI),N("#76738a"),.5,.06,f*.13);m.rotation.y=Math.PI/2,m.userData.noInk=!0,c.add(m)}Qn(c,.85,.24,.15,.08);let u=O(new Tt(.1,.015,6,18).rotateY(Math.PI/2),wt("#ffd35a",.6),.93,.24,.15);u.userData.noInk=!0,c.add(u);for(let f of[-1,1]){let m=O(new vt(.035,.16,4,6).rotateX(Math.PI/2),N("#3a2a20"),.98,.1,.1*f);m.rotation.y=f*.5,c.add(m)}let d=new ye;d.position.set(.45,.3,0),d.add(O(new Le(.3,.3,.04,20),N("#1d1a24"))),d.add(O(new ft(.2,16,8,0,Math.PI*2,0,Math.PI/2),N("#1d1a24"),0,.02,0)),d.add(O(new Le(.205,.205,.05,20),N("#8a1d2a"),0,.05,0)),c.add(d),t.add(c),i.hinge=c;break}case"orange":{let r=new ye;r.position.y=.42,r.add(O(new zn(.4,3),N("#ff9a1f")));for(let o=0;o<24;o++){let l=1-o/23*2,c=Math.sqrt(1-l*l),h=o*2.4,u=O(je(.025,6),N("#e9821a"),Math.cos(h)*c*.4,l*.4,Math.sin(h)*c*.4);u.userData.noInk=!0,r.add(u)}t.add(r),t.add(O(new Le(.025,.03,.1,6),N("#5a3a1a"),0,.86,0));let a=O(je(.12,10),N("#4caf50"),.08,.88,.04);a.scale.set(1,.25,.5),a.rotation.y=.6,t.add(a),Qn(t,.34,.5,.13,.08);for(let o of[-1,1]){let l=O(new Ze(.04,.03,.14),N("#1d1a24"),.38,.62,.13*o);l.rotation.x=o*.4,l.userData.noInk=!0,t.add(l)}i.ball=r;break}case"dingding":{let r="#8a4fc7";t.add(O(new vt(.42,.42,8,18),N(r),0,.78,0));let a=new ye;a.position.set(.4,.78,0),a.add(O(new Ze(.06,.32,.38),N("#c9c4d6")));let o=O(new Ze(.02,.24,.3),wt("#bfe6ff",1.6),.03,0,0);o.userData.noInk=!0,a.add(o),t.add(a);let l=new ye;l.position.y=1.5,l.add(O(je(.3,20),N(r)));let c=O(je(.24,18),N("#f4cfae"),.14,-.01,0);c.scale.set(.55,.9,.95),l.add(c),Qn(l,.26,.05,.08,.05);let h=O(new Tt(.06,.014,6,12,Math.PI),N("#7a3a2a"),.28,-.08,0);h.rotation.set(0,Math.PI/2,Math.PI),h.userData.noInk=!0,l.add(h);for(let g of[-1,1])l.add(O(je(.07,10),N(r),0,.02,.3*g));l.add(O(new Le(.025,.025,.22,6),N(r),0,.38,0));let u=O(new Tt(.16,.035,6,3).rotateY(Math.PI/2),N(r),0,.6,0);u.rotation.x=Math.PI/2,l.add(u),t.add(l),i.head=l;let d=[],f=[];for(let g of[-1,1]){let p=new ye;p.position.set(0,.32,.2*g),p.add(O(new vt(.13,.12,4,10),N(r),0,-.14,0)),t.add(p),d.push(p);let b=new ye;b.position.set(0,1,.45*g),b.add(O(new vt(.1,.22,4,10),N(r),0,-.16,0)),t.add(b),f.push(b)}let m=new ye;m.position.set(.05,-.42,0),m.add(O(new Ze(.26,.2,.12),N("#e0242f")));let M=O(new Tt(.08,.015,6,12,Math.PI),N("#e0242f"),0,.1,0);M.userData.noInk=!0,m.add(M),f[1].add(m),i.legs=d,i.arms=f;break}case"goat":case"judge":{let r=n==="judge",a=r?1.9:1;if(r){t.add(O(new Zt(.85,1.9,24),N("#1f1d2a"),0,.95,0)),t.add(O(new Zt(.22,.5,4),N("#ffffff"),.32,1.52,0));let l=new ye;l.position.set(.1,1.55,.62),l.add(O(new vt(.11,.55,4,8),N("#1f1d2a"),0,-.3,0));let c=new ye;c.position.set(0,-.62,0),c.add(O(new Le(.04,.04,.7,8).rotateZ(Math.PI/2),N("#7a4a22"),.32,0,0)),c.add(O(new Le(.13,.13,.36,14),N("#8a5328"),.66,0,0)),l.add(c),t.add(l),i.arm=l}else{let l=O(new vt(.27,.42,6,14).rotateZ(Math.PI/2),N("#f6f3ea"),0,.55,0);t.add(l);for(let h=0;h<7;h++){let u=O(je(.13,10),N("#ffffff"),-.25+h*.09,.78,h%2?.1:-.1);u.userData.noInk=!0,t.add(u)}let c=[];for(let[h,u]of[[.24,.15],[.24,-.15],[-.24,.15],[-.24,-.15]]){let d=new ye;d.position.set(h,.4,u),d.add(O(new Le(.05,.045,.38,8),N("#3b3530"),0,-.18,0)),t.add(d),c.push(d)}i.legs=c}let o=new ye;o.position.set(r?.15:.42,r?2.15:.82,0),o.scale.setScalar(r?1.55:1),o.add(O(new vt(.14,.16,6,12).rotateZ(Math.PI/2.4),N("#f6f3ea"),.06,-.03,0)),Qn(o,.1,.07,.1,.055),o.add(O(new Zt(.05,.16,6).rotateX(Math.PI),N("#e8e4d8"),.16,-.2,0));for(let l of[-1,1]){let c=O(new Tt(.1,.035,6,14,Math.PI*1.3),N("#9a7b4f"),-.06,.13,.1*l);c.rotation.set(0,l>0?.2:-.2,.6),o.add(c);let h=O(new vt(.035,.12,4,6).rotateX(l*1.2),N("#ece6d6"),-.04,.05,.17*l);o.add(h)}if(r){let l=new ye;for(let c=0;c<14;c++){let h=c/14*Math.PI*2,u=O(je(.09,10),N("#eeeae2"),-.04+Math.cos(h)*.05,.12+c%2*.03,Math.sin(h)*.19);l.add(u)}for(let c of[-1,1])for(let h=0;h<3;h++)l.add(O(je(.08,10),N("#eeeae2"),-.08,-.05-h*.12,.2*c));o.add(l)}t.add(o),i.head=o,r&&e.scale.setScalar(1);break}case"guo":{let r="#e3cfa3",a="#9cc95a",o=new ye;o.position.y=.62;let l=g=>{let p=O(new ft(.42,22,14,0,Math.PI),N(r,{side:qt}),0,0,0);return p.scale.set(1,1.25,.8),p.rotation.y=g>0?0:Math.PI,p.rotation.x=g*.08,p.userData.noInk=!0,p};for(let g of[-1,1]){let p=O(new Tt(.42,.025,6,30,Math.PI),N("#b89a62"),-.06,0,0);p.scale.set(1,1.25,1),p.rotation.set(Math.PI/2,0,g*.25+Math.PI/2),p.userData.noInk=!0,o.add(p)}let c=l(-1);c.position.x=-.06,c.rotation.z=.25,o.add(c);let h=l(1);h.position.x=-.06,h.rotation.z=-.25,h.rotation.y=Math.PI,o.add(h);let u=O(je(.33,20),N(a),.08,.02,0);u.scale.set(.85,1.15,.9),o.add(u);for(let g=0;g<6;g++){let p=O(je(.08,8),N("#8a4a6a"),.05+g%2*.1,.2-g*.07,(g%3-1)*.15);p.scale.set(.4,1,1),p.userData.noInk=!0,o.add(p)}Qn(o,.33,.1,.11,.07);let d=O(new Tt(.1,.02,6,14,Math.PI),N("#2d4a1a"),.35,-.08,0);d.rotation.set(0,Math.PI/2,Math.PI),d.userData.noInk=!0,o.add(d);for(let g of[-1,1]){let p=O(je(.04,8),N("#ff9fbf"),.32,-.02,.17*g);p.scale.set(.4,.6,1),p.userData.noInk=!0,o.add(p)}t.add(o);let f=[],m=[];for(let g of[-1,1]){let p=new ye;p.position.set(0,.2,.14*g),p.add(O(new vt(.05,.14,4,8),N("#c9ac78"),0,-.1,0)),t.add(p),f.push(p);let b=new ye;b.position.set(.05,.7,.4*g),b.add(O(new vt(.045,.2,4,8),N("#c9ac78"),0,-.12,0)),t.add(b),m.push(b)}i.legs=f,i.arms=m;let M=Ru("\uFF1F","#ffb000");M.position.set(-.05,1.45,0),M.rotation.y=-Math.PI/2,M.scale.setScalar(1.3),t.add(M),i.sign=M;break}case"jia":case"yi":{let r={jia:{shirt:"#e0563a",pants:"#2b2d3a",hair:"#1c1c22"},yi:{shirt:"#4f8a6b",pants:"#2b2d3a",hair:"#3a2a20"}}[n],a=Uc(r);Object.assign(i,a.userData),t.add(a),a.userData={},t.add(O(new ft(.19,14,8,0,Math.PI*2,0,Math.PI/2).rotateZ(Math.PI/2),N(n==="jia"?"#c8452e":"#3f7458"),-.2,1.12,0)),n==="jia"&&t.add(O(new vt(.06,.42,4,8).rotateX(Math.PI/2),N("#e0563a"),.2,.86,0));let o=Ru({jia:"\u7532\u65B9",yi:"\u4E59\u65B9"}[n],{jia:"#c8102e",yi:"#3a7bd5"}[n]);o.position.set(-.05,1.62,0),o.rotation.y=-Math.PI/2,t.add(o),i.sign=o;break}case"thief":{let r="#6b4226",a="#b08356";t.add(O(new vt(.4,.4,8,16),N(r),0,.82,0));let o=O(je(.3,16),N(a),.22,.75,0);o.scale.set(.5,1,.9),t.add(o);for(let f of[-1,1]){let m=O(new ft(.2,14,8,0,Math.PI*2,0,Math.PI/2),N("#8a8f99"),0,1.12,.36*f);m.rotation.x=f*.5,t.add(m)}t.add(O(new Tt(.4,.05,6,24).rotateX(Math.PI/2),N("#8a1d2a"),0,.62,0));let l=new ye;l.position.set(.08,1.48,0),l.add(O(je(.3,20),N(r)));let c=O(je(.15,14),N(a),.25,-.07,0);c.scale.set(1,.75,1),l.add(c),l.add(O(je(.05,8),N("#111116"),.39,-.03,0)),Qn(l,.22,.08,.12,.05);for(let f of[-1,1]){l.add(O(je(.1,12),N(r),-.05,.25,.2*f)),l.add(O(je(.055,8),N(a),-.02,.25,.2*f));for(let m=0;m<2;m++){let M=O(new Ze(.02,.18,.03),wt("#e0242f",.6),.26,.12-m*.05,(.08+m*.05)*f);M.rotation.x=f*.5,M.userData.noInk=!0,l.add(M)}}t.add(l),i.head=l;let h=[],u=[];for(let f of[-1,1]){let m=new ye;m.position.set(0,.4,.2*f),m.add(O(new vt(.13,.16,4,10),N(r),0,-.18,0)),t.add(m),h.push(m);let M=new ye;M.position.set(.05,1.08,.46*f),M.add(O(new vt(.11,.32,4,10),N(r),0,-.22,0));for(let g=-1;g<=1;g++){let p=O(new Zt(.03,.16,5).rotateZ(-Math.PI/2),ui("#f6f1e4"),.12,-.45,g*.05);p.userData.noInk=!0,M.add(p)}t.add(M),u.push(M)}i.legs=h,i.arms=u;let d=O(je(.3,14),N("#e0242f"),-.42,1,0);d.scale.set(.8,1,.8),d.add(O(new Ze(.02,.2,.2),wt("#ffd35a",.8),.24,0,0)),t.add(d),i.sack=d;break}case"ginger":{let r=N("#c27a3a"),a=N("#fffaf0"),o=new ye;o.position.y=.05,o.rotation.x=-.25;let l=u=>(u.scale(1,1,.42),u);o.add(O(l(new vt(.22,.22,6,16)),r,0,.55,0)),o.add(O(l(new ft(.22,18,12)),r,0,.98,0));for(let u of[-1,1]){let d=O(l(new vt(.08,.2,4,10)),r,.28*u,.68,0);d.rotation.z=u*1.1,o.add(d);let f=O(l(new vt(.09,.18,4,10)),r,.13*u,.22,0);f.rotation.z=u*.25,o.add(f);let m=O(new Tt(.07,.015,6,12),a,.43*u,.6,.02);m.rotation.y=Math.PI/2,m.userData.noInk=!0,o.add(m)}for(let u=0;u<3;u++){let d=O(je(.035,8),N(["#e0242f","#3ad17a","#3a7bd5"][u]),0,.68-u*.12,.1);d.userData.noInk=!0,o.add(d)}for(let u of[-1,1]){let d=O(je(.035,8),a,.07*u,1.02,.09);d.userData.noInk=!0,o.add(d)}let c=O(new Tt(.07,.014,6,12,Math.PI),a,0,.94,.09);c.rotation.z=Math.PI,c.userData.noInk=!0,o.add(c);let h=O(new Tt(.2,.012,4,30),a,0,.98,.07);h.userData.noInk=!0,o.add(h),t.add(o),i.man=o;break}case"caesar":{let r=Uc({shirt:"#b3261e",pants:"#b3261e",hair:"#3a2a20"});Object.assign(i,r.userData),t.add(r);let a=r.userData.head;r.userData={};let o=O(new Le(.24,.3,.62,16,1,!0),N("#f4f0e6",{side:qt}),0,.72,0);o.rotation.z=.12,t.add(o);let l=O(new Tt(.24,.05,6,20),N("#f4f0e6"),0,.92,0);l.rotation.set(Math.PI/2,.6,0),t.add(l);let c=O(new mn(.62,.95,4,6),N("#8a1d2a",{side:qt}),-.24,.62,0);c.rotation.y=Math.PI/2,c.rotation.x=.1,t.add(c);let h=new ye;h.position.y=.1;for(let f=0;f<12;f++){let m=f/12*Math.PI*1.7-Math.PI*.85,M=O(je(.06,8),wt("#d8b04a",.3),Math.cos(m)*.22,.02,Math.sin(m)*.22);M.scale.set(1,.4,.6),M.userData.noInk=!0,h.add(M)}a.add(h);let u=O(new Le(.3,.3,.06,20).rotateX(Math.PI/2),N("#b3261e"),.1,.8,.42);u.add(O(je(.07,10),wt("#e8b84a",.5),0,0,.05)),u.add(O(new Tt(.29,.02,6,24),N("#e8b84a"),0,0,.03)),t.add(u);let d=new ye;d.position.set(.1,1,-.36),d.add(O(new Le(.02,.02,1.3,6).rotateZ(Math.PI/2.2),N("#7a4a22"))),d.add(O(new Zt(.05,.2,6).rotateZ(-Math.PI/2+.1),N("#c9ced6"),.66,.12,0)),t.add(d),i.spear=d;break}case"chenwei":{let r=Uc({shirt:"#2b3448",pants:"#232a38",hair:"#1c1c22"});Object.assign(i,r.userData),t.add(r);let a=r.userData.head;r.userData={},a.add(O(new ft(.25,18,10,0,Math.PI*2,0,Math.PI/2),N("#3a4232"),-.01,.03,0)),a.add(O(new Le(.26,.26,.04,18),N("#3a4232"),0,.03,0));for(let u of[-1,1])a.add(O(new Le(.05,.05,.05,12).rotateZ(Math.PI/2),ui("#3ad1ff",{emissive:"#0a5a7a",emissiveIntensity:.6}),.2,.08,.07*u));a.add(O(new Ze(.06,.12,.3),N("#1d1d24"),.18,-.08,0));let o=O(new Ze(.36,.4,.42),N("#4a5a3a"),.02,.84,0);t.add(o);for(let u=0;u<3;u++)t.add(O(new Ze(.06,.1,.08),N("#3a4a2a"),.22,.78,(u-1)*.12));let l=Ru("CT","#3a7bd5");l.scale.setScalar(.35),l.position.set(-.2,.86,0),l.rotation.y=-Math.PI/2,t.add(l);let c=new ye;c.position.set(.32,.98,.14),c.add(O(new Ze(.55,.09,.07),N("#22252b"))),c.add(O(new Le(.022,.022,.32,8).rotateZ(Math.PI/2),N("#22252b"),.42,.02,0)),c.add(O(new Ze(.06,.16,.05),N("#22252b"),.08,-.11,0)),c.add(O(new Ze(.16,.12,.06),N("#3a3d44"),-.3,-.03,0));let h=O(je(.025,6),wt("#ff2a2a",3),.6,.06,0);h.userData.noInk=!0,c.add(h),t.add(c),i.rifle=c;break}case"mao":case"maoqiu":case"bigmao":{let r=n==="maoqiu"?.32:.8,a=new ye;a.position.y=r*.95,a.add(O(je(r*.86,20),N("#c79a6b")));let o=n==="maoqiu"?14:46,l=je(r*.3,10);for(let f=0;f<o;f++){let m=1-f/(o-1)*2,M=Math.sqrt(1-m*m),g=f*2.399,p=O(l,N(f%3?"#d7ad7e":"#b8875a"),Math.cos(g)*M*r*.86,m*r*.86,Math.sin(g)*M*r*.86);p.userData.noInk=!0,a.add(p)}Qn(a,r*.8,r*.18,r*.3,r*.2);let c=new ye;c.position.set(r*.98,r*.2,0);let h=ui("#15131c",{emissive:"#2a1a3a",emissiveIntensity:.3});for(let f of[-1,1]){let m=O(new Le(r*.26,r*.24,r*.06,20).rotateZ(Math.PI/2),h,0,0,r*.3*f);m.scale.set(1,.82,1.15);let M=O(new Ze(r*.02,r*.06,r*.16),Iu,r*.035,r*.07,-r*.05);M.rotation.x=.6,M.userData.noInk=!0,m.add(M),c.add(m);let g=O(new Ze(r*.5,r*.04,r*.04),N("#e8b84a"),-r*.25,r*.06,r*.52*f);g.rotation.y=f*.35,g.userData.noInk=!0,c.add(g)}let u=O(new Ze(r*.04,r*.04,r*.16),N("#e8b84a"),r*.02,r*.06,0);u.userData.noInk=!0,c.add(u),a.add(c);let d=O(new Tt(r*.12,r*.03,6,12,Math.PI),N("#4a2a14"),r*.92,-r*.18,0);if(d.rotation.set(0,Math.PI/2,Math.PI),d.userData.noInk=!0,a.add(d),n==="bigmao"){let f=new ye;f.position.set(0,r*.95,0),f.add(O(new Le(.32,.36,.22,10,1,!0),wt("#ffcf3a",.6)));for(let m=0;m<5;m++){let M=m/5*Math.PI*2;f.add(O(new Zt(.07,.2,4),wt("#ffcf3a",.6),Math.cos(M)*.32,.18,Math.sin(M)*.32))}a.add(f)}t.add(a),i.fluff=a,n==="bigmao"&&e.scale.setScalar(2);break}}ms(e,n==="judge"?.05:.04);let s=new pe(new zn(n==="judge"?1.5:n==="bigmao"?.9:.6,1),new It({color:"#ffffff",wireframe:!0,transparent:!0,opacity:.75}));return s.position.y=n==="judge"?1.3:.5,s.visible=!1,s.userData.noBake=s.userData.noInk=!0,s.castShadow=!1,e.add(s),i.cocoon=s,e.userData=i,e}function Du(){let n=new ye,e=new ye;n.add(e);let t="#fbfaf6";e.add(O(new vt(.36,.7,6,16).rotateZ(Math.PI/2),N(t),0,.7,0));let i=O(je(.3,14),N(t),.25,.95,0);i.scale.set(1,.6,.9),e.add(i);let s=new ye;s.position.set(.75,.82,0),s.add(O(new Ze(.42,.36,.38),N(t))),s.add(O(new Ze(.16,.24,.32),N("#ffb3c7"),.24,-.06,0));for(let l of[-1,1]){s.add(O(je(.03,6),N("#1d1a24"),.32,-.02,.07*l));let c=O(new Zt(.06,.32,8),ui("#f3e3b8"),-.05,.22,.24*l);c.rotation.x=l*-.9,c.rotation.z=-.3,s.add(c)}Qn(s,.18,.08,.13,.05),e.add(s);let r=[];for(let[l,c]of[[.45,.22],[.45,-.22],[-.45,.22],[-.45,-.22]]){let h=new ye;h.position.set(l,.5,c),h.add(O(new Le(.09,.08,.5,10),N(t),0,-.25,0)),h.add(O(new Le(.09,.09,.07,10),N("#3b3530"),0,-.5,0)),e.add(h),r.push(h)}let a=O(new Le(.02,.02,.5,6),N(t),-.75,.75,0);a.rotation.z=.6,e.add(a);let o=O(new Tt(.24,.06,8,20),N("#e8322b"),.55,.75,0);return o.rotation.y=Math.PI/2,e.add(o),ms(n,.04),n.userData={body:e,legs:r,head:s},n}function Lu(){let n=new ye,e=new ye;n.add(e);let t="#8b5a2b",i="#3a2414";e.add(O(new vt(.32,.8,6,16).rotateZ(Math.PI/2),N(t),0,.85,0));let s=O(new vt(.16,.42,4,10),N(t),.55,1.15,0);s.rotation.z=-.7,e.add(s);let r=new ye;r.position.set(.82,1.38,0),r.add(O(new vt(.13,.3,4,10).rotateZ(Math.PI/2.4),N(t))),r.add(O(je(.1,10),N("#c79a6b"),.2,-.08,0)),Qn(r,.02,.06,.1,.04);for(let c of[-1,1])r.add(O(new Zt(.04,.12,6),N(t),-.1,.17,.06*c));e.add(r);for(let c=0;c<6;c++){let h=O(je(.08,8),N(i),.62-c*.07,1.42-c*.07,0);e.add(h)}let a=O(new vt(.06,.4,4,6),N(i),-.78,.8,0);a.rotation.z=.5,e.add(a);let o=O(new Ze(.5,.08,.56),N("#c8102e"),-.05,1.18,0);o.add(O(new Ze(.52,.03,.58),N("#e8b84a"),0,-.04,0)),e.add(o);let l=[];for(let[c,h]of[[.45,.17],[.45,-.17],[-.45,.17],[-.45,-.17]]){let u=new ye;u.position.set(c,.7,h),u.add(O(new Le(.07,.06,.62,8),N(t),0,-.31,0)),u.add(O(new Le(.075,.08,.08,8),N(i),0,-.64,0)),e.add(u),l.push(u)}return ms(n,.035),n.userData={body:e,legs:l,head:r},n}function Nu(){let n=new ye,e=new ye;n.add(e);let t=N("#2fb59a"),i=N("#1d1a24"),s=ui("#d8dde6"),r=[];for(let c of[.85,-.85]){let h=new ye;h.position.set(c,.36,0),h.add(O(new Tt(.33,.035,8,28),i)),h.add(O(new Tt(.29,.012,4,24),s));for(let u=0;u<8;u++){let d=O(new Le(.006,.006,.58,3),s);d.rotation.z=u/8*Math.PI,d.userData.noInk=!0,h.add(d)}h.add(O(new Le(.04,.04,.08,10).rotateX(Math.PI/2),s)),e.add(h),r.push(h)}let a=(c,h,u=.03,d=t)=>{let f=new P(...c),m=new P(...h),M=O(new Le(u,u,f.distanceTo(m),8),d);M.position.copy(f).lerp(m,.5),M.quaternion.setFromUnitVectors(new P(0,1,0),m.clone().sub(f).normalize()),e.add(M)};a([.85,.36,0],[.7,.95,0]),a([.7,.85,0],[-.75,.8,0]),a([.4,.42,0],[-.85,.36,0]),a([.4,.42,0],[.35,.75,0]),a([-.45,.42,0],[-.45,.8,0]),a([.4,.42,0],[-.45,.42,0]),a([.7,.95,-.2],[.7,.95,.2],.022,s);for(let c of[.32,-.48]){let h=O(new Ze(.24,.06,.16),N("#3a2a20"),c,.82,0);e.add(h)}e.add(O(new Ze(.3,.04,.22),N("#c8102e"),-.95,.62,0));let o=O(je(.045,10),ui("#ffd35a"),.72,.99,.12);o.userData.noInk=!0,e.add(o);let l=O(new Le(.16,.12,.16,10,1,!0),N("#b98a52",{side:qt}),.98,.82,0);l.userData.noInk=!0,e.add(l);for(let c=0;c<3;c++){let h=O(je(.06,8),ui("#d81e2a"),.95+(c-1)*.05,.92,(c-1)*.05);h.userData.noInk=!0,e.add(h)}return ms(n,.025),n.userData={body:e,wheels:r},n}function Rp(){let n=new ye,e=new It({color:"#d8f3ff",transparent:!0,opacity:.45,depthWrite:!1,blending:sn,side:qt}),t=[];for(let r=0;r<6;r++){let a=O(new Tt(.16+r*.09,.03,6,20,Math.PI*1.5),e,0,.15+r*.22,0);a.rotation.x=Math.PI/2,a.castShadow=!1,n.add(a),t.push(a)}let i=N("#7cbf4a"),s=[];for(let r=0;r<5;r++){let a=O(new mn(.12,.08),i);a.material=N("#7cbf4a",{side:qt}),n.add(a),s.push(a)}return n.userData={rings:t,leaves:s},n}function Cp(){let n=new ye,e=O(new Ze(.4,.3,.3),wt("#e0201b",1.2),0,.6,0);return e.add(new la(new ua(e.geometry),new cr({color:"#ffd35a"}))),e.add(O(new Ze(.42,.06,.32),wt("#ffcf3a",1.5))),n.add(e),n.userData={box:e},n}function Ip(){let n=new ye,e=O(je(.26,14),N("#6b4a2e"),0,.24,0);e.scale.set(1,.8,1),n.add(e),n.add(O(new Le(.08,.12,.12,10),N("#4a3220"),0,.45,0));let t=O(je(.06,8),wt("#ff2a2a",3),.18,.32,.12);return t.userData.noInk=!0,n.add(t),ms(n,.03),n.userData={led:t},n}function aM(){let n=new ye;n.add(O(new Le(.02,.02,1.2,6),N("#d8b57a"),0,.6,0));for(let e=0;e<5;e++)n.add(O(je(.13,18),ui("#d81e2a",{emissive:"#5a0008",emissiveIntensity:.6}),0,.62+e*.2,0));return n}var Pp=new ft(.15,14,10),Dp=new pr({color:"#e0212e",emissive:"#8a0a12",emissiveIntensity:.9,roughness:.15,clearcoat:1}),Uu={bike:"#2fb59a",horse:"#ffb347",bull:"#ffffff",meteor:"#9fd8ff",chief:"#ff6fae",spider:"#c58cff",douzhi:"#8dffb0",magnet:"#ff4f5e",chest:"#ffd35a"};function Lp(n){let e=new ye,t=new ye;t.position.y=.75;let i=Uu[n];switch(n){case"horse":{let a=Lu();a.scale.setScalar(.42),a.position.y=-.35,t.add(a);break}case"bull":{let a=Du();a.scale.setScalar(.45),a.position.y=-.38,t.add(a);break}case"bike":{let a=Nu();a.scale.setScalar(.5),a.position.y=-.4,t.add(a);break}case"meteor":{t.add(O(new zn(.2,0),wt("#bfe6ff",3)));for(let a=0;a<6;a++){let o=O(new Zt(.06,.26,5),wt("#9fd8ff",2)),l=new P().setFromSphericalCoords(.22,Math.acos(1-2*(a+.5)/6),a*2.4);o.position.copy(l),o.quaternion.setFromUnitVectors(new P(0,1,0),l.clone().normalize()),t.add(o)}break}case"chief":{t.add(O(new Tt(.2,.05,8,24).rotateX(Math.PI/2),N("#b3261e")));for(let a=0;a<9;a++){let o=a/9*Math.PI-Math.PI/2,l=O(new vt(.04,.3,4,6),N(["#ff6fae","#ffd35a","#3ad1ff"][a%3]),Math.sin(o)*.18,.22,-Math.cos(o)*.05-.05);l.rotation.z=-o*.5,t.add(l)}break}case"spider":{t.add(O(je(.16,14),N("#2a2233"))),t.add(O(je(.1,12),N("#2a2233"),.17,-.02,0));for(let a=0;a<8;a++){let o=a<4?-1:1,l=a%4,c=O(new Le(.015,.015,.34,5),N("#2a2233"),(l-1.5)*.08,-.05,o*.2);c.rotation.x=o*1.1,t.add(c)}for(let a of[-1,1])t.add(O(je(.025,6),wt("#ff4fa0",3),.25,.02,.04*a));break}case"douzhi":{let a=O(new ft(.22,18,8,0,Math.PI*2,Math.PI/2,Math.PI/2),N("#f4f6fb",{side:qt}));t.add(a),t.add(O(new Tt(.215,.02,6,24).rotateX(Math.PI/2),N("#2a6fb5")));let o=O(new Mi(.2,20).rotateX(-Math.PI/2),N("#a9b47e"),0,-.03,0);o.userData.noInk=!0,t.add(o);break}case"magnet":{let a=aM();a.scale.setScalar(.55),a.position.y=-.45,t.add(a);break}case"chest":{t.add(O(new Ze(.56,.32,.4),N("#c8102e")));let a=O(new Le(.2,.2,.56,16,1,!1,0,Math.PI).rotateZ(Math.PI/2),N("#d8232a"),0,.16,0);a.rotation.x=-Math.PI/2,t.add(a);for(let o of[-.2,0,.2])t.add(O(new Ze(.05,.5,.42),wt("#ffcf3a",.8),o,.06,0));t.add(O(new Ze(.1,.12,.05),wt("#ffcf3a",1.2),0,.04,.21));break}}e.add(t),ms(t,.03);let s=new pe(new Jn(.42,.55,40).rotateX(-Math.PI/2),new It({color:i,transparent:!0,opacity:.8,blending:sn,depthWrite:!1}));s.position.y=.04,e.add(s);let r=new pe(new Le(.35,.5,3.2,20,1,!0),new It({color:i,transparent:!0,opacity:.16,blending:sn,depthWrite:!1,side:qt}));r.position.y=1.6,e.add(r);for(let a of[s,r])a.userData.noBake=!0,a.castShadow=!1;return e.userData={icon:t,ring:s,beam:r},e}function Np(n,e){n.updateMatrixWorld(!0);let t=new Mt().copy(n.matrixWorld).invert(),i=new Map,s=new Mt,r=a=>{for(let o of[...a.children]){if(e.has(o)){Np(o,e);continue}if(r(o),o.isMesh&&!o.userData.noBake&&!Array.isArray(o.material)&&!o.isInstancedMesh){let l=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();for(let u of Object.keys(l.attributes))["position","normal","uv"].includes(u)||l.deleteAttribute(u);l.attributes.uv||l.setAttribute("uv",new Ht(new Float32Array(l.attributes.position.count*2),2)),l.applyMatrix4(s.multiplyMatrices(t,o.matrixWorld));let c=i.get(o.material)||[];c.push({geo:l,shadow:o.castShadow}),i.set(o.material,c);let h=o.children.filter(u=>!(u.isMesh&&!u.userData.noBake));for(let u of h)a.add(u),u.applyMatrix4(o.matrix);o.removeFromParent()}else!o.isMesh&&o.children.length===0&&!e.has(o)&&o.removeFromParent()}};r(n);for(let[a,o]of i){let l=new pe(Tp(o.map(c=>c.geo)),a);l.castShadow=a!==Cu&&o.some(c=>c.shadow),l.userData.noBake=!0,n.add(l)}}function ei(n){let e=n.userData;n.userData={};let t={},i=new Set,s=0,r=a=>(a.name="k"+s++,i.add(a),a.name);for(let[a,o]of Object.entries(e))Array.isArray(o)?o.length&&o[0]?.isObject3D&&(t[a]=o.map(r)):o?.isObject3D&&(t[a]=r(o));return Np(n,i),{model:n,map:t}}function qn(n){let e=n.model.clone(),t={};for(let[i,s]of Object.entries(n.map))t[i]=Array.isArray(s)?s.map(r=>e.getObjectByName(r)):e.getObjectByName(s);return e.userData=t,e}function io(n,e,t,i){let s=document.createElement("canvas");s.width=n,s.height=e,t(s.getContext("2d"),n,e);let r=new Li(s);return r.colorSpace=hn,r.anisotropy=8,i&&(r.wrapS=r.wrapT=Es,r.repeat.set(...i)),r}var Up=11,Xe=()=>(Up=Up*16807%2147483647)/2147483647,oM=n=>io(n?1024:2048,n?1024:2048,(e,t,i)=>{e.fillStyle="#6f6b64",e.fillRect(0,0,t,i);let s=n?12:16,r=t/s;for(let a=0;a<s;a++)for(let o=-1;o<s;o++){let l=a%2*r*.5,c=o*r+l+5,h=a*r+5,u=r-10,d=148+Xe()*34|0,f=Xe()*10|0,m=e.createLinearGradient(c,h,c+u,h+u);m.addColorStop(0,`rgb(${d+22+f},${d+18},${d+8})`),m.addColorStop(.5,`rgb(${d+f},${d-3},${d-12})`),m.addColorStop(1,`rgb(${d-26},${d-30},${d-36})`),e.fillStyle=m,e.fillRect(c,h,u,u),e.fillStyle=`rgb(${d+4+f},${d},${d-9})`,e.fillRect(c+7,h+7,u-14,u-14);for(let M=0;M<(n?18:70);M++){e.fillStyle=`rgba(${Xe()<.5?"40,30,20":"255,250,240"},${Xe()*.07})`;let g=1+Xe()*5;e.beginPath(),e.arc(c+Xe()*u,h+Xe()*u,g,0,7),e.fill()}if(Xe()<.18){e.strokeStyle="rgba(40,30,20,.35)",e.lineWidth=2,e.beginPath();let M=c+Xe()*u,g=h+Xe()*u;e.moveTo(M,g);for(let p=0;p<4;p++)M+=(Xe()-.5)*50,g+=(Xe()-.5)*50,e.lineTo(M,g);e.stroke()}}e.save(),e.translate(t/2,i/2),e.scale(2,2);for(let a=150;a>20;a-=30)e.strokeStyle="rgba(70,60,50,.35)",e.lineWidth=6,e.beginPath(),e.arc(0,0,a,0,Math.PI*2),e.stroke();for(let a=0;a<8;a++)e.rotate(Math.PI/4),e.beginPath(),e.moveTo(30,0),e.lineTo(150,0),e.stroke();e.restore();for(let a=0;a<(n?400:1400);a++){let o=Xe()<.5?Xe()*160:t-Xe()*160,[l,c]=Xe()<.5?[o,Xe()*i]:[Xe()*t,o];e.fillStyle=`rgba(80,110,50,${Xe()*.3})`,e.beginPath(),e.arc(l,c,2+Xe()*7,0,7),e.fill()}}),lM=()=>io(512,256,(n,e,t)=>{n.fillStyle="#5f5f66",n.fillRect(0,0,e,t);let i=16,s=48;for(let r=0;r<t/i;r++)for(let a=-1;a<e/s+1;a++){let o=112+Xe()*26|0;n.fillStyle=`rgb(${o},${o+2},${o+8})`,n.fillRect(a*s+r%2*s/2+2,r*i+2,s-4,i-4)}},[4,1]),cM=()=>io(256,256,(n,e,t)=>{n.fillStyle="#3d4049",n.fillRect(0,0,e,t);for(let i=0;i<16;i++){let s=n.createLinearGradient(i*16,0,i*16+16,0);s.addColorStop(0,"#2c2f37"),s.addColorStop(.5,"#5b5f6b"),s.addColorStop(1,"#2c2f37"),n.fillStyle=s,n.fillRect(i*16+2,0,12,t)}},[8,1]),hM=()=>io(1024,256,(n,e,t)=>{n.fillStyle="#b8b2a6",n.fillRect(0,0,e,t);let i=e/4;for(let r=0;r<4;r++){let a=r*i;if(n.fillStyle="#9e2a22",n.fillRect(a,0,18,t),n.fillRect(a+i-18,0,18,t),r%2===0){n.fillStyle="#b3261e",n.fillRect(a+70,70,i-140,t-70),n.strokeStyle="#6e140f",n.lineWidth=4,n.strokeRect(a+70,70,i-140,t-70),n.beginPath(),n.moveTo(a+i/2,70),n.lineTo(a+i/2,t),n.stroke(),n.fillStyle="#e8b84a";for(let o=0;o<4;o++)for(let l=0;l<3;l++)for(let c of[-1,1])n.beginPath(),n.arc(a+i/2+c*(22+l*22),100+o*36,4,0,7),n.fill();n.beginPath(),n.arc(a+i/2-12,160,9,0,7),n.arc(a+i/2+12,160,9,0,7),n.fill(),n.fillStyle="#d8292b",n.fillRect(a+88,82,26,70),n.fillRect(a+i-114,82,26,70),n.fillStyle="#1d1a24",n.font='bold 20px "PingFang SC",sans-serif',n.textAlign="center",n.fillText("\u798F",a+101,124),n.fillText("\u798F",a+i-101,124);for(let[o,l]of[[a+40,"\u9F9F\u5E74\u798F\u5BFF"],[a+i-40,"\u751C\u8FC7\u4F17\u751F"]])n.fillStyle="#d8292b",n.fillRect(o-14,62,28,180),n.fillStyle="#1d1a24",n.font='bold 22px "PingFang SC",sans-serif',[...l].forEach((c,h)=>n.fillText(c,o,92+h*42))}else{n.fillStyle="#6e140f",n.fillRect(a+50,50,i-100,130),n.fillStyle="#f4ead1",n.fillRect(a+58,58,i-116,114),n.strokeStyle="#8b2a1d",n.lineWidth=5;for(let o=1;o<6;o++)n.beginPath(),n.moveTo(a+58+o*(i-116)/6,58),n.lineTo(a+58+o*(i-116)/6,172),n.stroke();for(let o=1;o<4;o++)n.beginPath(),n.moveTo(a+58,58+o*28.5),n.lineTo(a+i-58,58+o*28.5),n.stroke()}}let s=n.createLinearGradient(0,0,0,40);s.addColorStop(0,"#2f6e7a"),s.addColorStop(1,"#1f4d58"),n.fillStyle=s,n.fillRect(0,0,e,40);for(let r=0;r<16;r++)n.fillStyle=r%2?"#d8b04a":"#c23b2e",n.beginPath(),n.arc(r*64+32,20,11,0,7),n.fill()});function Fc(n,e,t,i){let s=new ur,r=e/2;s.moveTo(-r-.25,.12),s.quadraticCurveTo(-r*.35,.05,0,t),s.quadraticCurveTo(r*.35,.05,r+.25,.12),s.lineTo(r+.25,-.05),s.quadraticCurveTo(r*.3,-.08,0,t-.22),s.quadraticCurveTo(-r*.3,-.08,-r-.25,-.05);let a=new va(s,{depth:n,bevelEnabled:!1,curveSegments:10});a.translate(0,0,-n/2),a.rotateY(Math.PI/2);let o=new pe(a,i);o.castShadow=o.receiveShadow=!0;let l=new pe(new Le(.1,.1,n+.4,10).rotateZ(Math.PI/2),N("#2a2c33"));l.position.y=t,o.add(l);for(let c of[-1,1]){let h=new pe(new Zt(.12,.38,6),N("#2a2c33"));h.position.set(c*(n/2+.2),t+.14,0),h.rotation.z=-c*.5,o.add(h)}return o}function Fp(){let n=new ye,e=new pe(new ft(.26,18,12),wt("#ff3b24",1.2));e.scale.y=1.15,n.add(e);for(let s of[-.3,.3])n.add(new pe(new Le(.12,.12,.06,12),N("#e8b84a")).translateY(s));let t=new pe(new Le(.02,.06,.3,6),N("#ffcf3a"));t.position.y=-.48,n.add(t);let i=new pe(new Le(.01,.01,.5,4),N("#2a2c33"));return i.position.y=.55,n.add(i),n.userData.body=e,n}function uM(){let n=new ye,e=N("#6b4a33"),t=new pe(new Le(.28,.42,2.6,10),e);t.position.y=1.3,t.castShadow=!0,n.add(t);for(let[o,l]of[[.6,1.4],[-.7,1.2],[2.2,1.1]]){let c=new pe(new Le(.1,.16,l,7),e);c.position.set(Math.cos(o)*.4,2.5,Math.sin(o)*.4),c.rotation.set(Math.sin(o)*.7,0,-Math.cos(o)*.7),c.castShadow=!0,n.add(c)}let i=new ye;i.position.y=3.3;let s=["#4f8a3c","#5f9c45","#6fae4f","#4a7f38"];for(let o=0;o<16;o++){let l=.7+Xe()*.6,c=new pe(new zn(l,1),N(s[o%4],{flatShading:!0})),h=Xe()*Math.PI*2,u=Xe()*1.6;c.position.set(Math.cos(h)*u,Xe()*1.3-.2,Math.sin(h)*u),c.castShadow=!0,i.add(c)}for(let o=0;o<18;o++){let l=Xe()*Math.PI*2,c=.6+Xe()*1.6,h=new pe(new ft(.13,12,8),wt("#ff8a1f",.25));h.scale.y=.8,h.position.set(Math.cos(l)*c,-.4+Xe()*1.2,Math.sin(l)*c),h.castShadow=!0,i.add(h)}let r=new ye;r.position.set(1.6,2.2,.6);for(let o=0;o<10;o++){let l=o/10*Math.PI*2,c=new pe(new Le(.01,.01,.5,4),N("#8a5a2b"));c.position.set(Math.cos(l)*.18,0,Math.sin(l)*.18),r.add(c)}r.add(new pe(new Zt(.22,.2,12),N("#8a5a2b")).translateY(.34)),r.add(new pe(new Le(.2,.2,.03,12),N("#8a5a2b")).translateY(-.25));let a=new pe(new ft(.07,10,8),N("#ffd35a"));return a.position.y=-.05,r.add(a),r.add(new pe(new Le(.005,.005,.7,3),N("#2a2c33")).translateY(.75)),n.add(r),n.add(i),n.userData.crown=i,n.userData.cage=r,n}function dM(){let n=new ye,e=N("#8a8780"),t=new pe(new Le(.85,.9,.7,16,1,!0),N("#8a8780",{side:qt}));t.position.y=.35,t.castShadow=!0,n.add(t);let i=new pe(new Tt(.85,.1,8,24),e);i.rotation.x=Math.PI/2,i.position.y=.7,n.add(i);let s=new pe(new Mi(.8,24),new Gn({color:"#1f4d58",roughness:.1,metalness:.3}));s.rotation.x=-Math.PI/2,s.position.y=.45,n.add(s);let r=N("#7a5230");for(let l of[-1,1]){let c=new pe(new Ze(.12,1.6,.12),r);c.position.set(0,.8,l*.8),c.castShadow=!0,n.add(c)}let a=new pe(new Le(.07,.07,1.8,8).rotateX(Math.PI/2),r);a.position.y=1.5,n.add(a);let o=new pe(new Le(.16,.12,.22,10),N("#9a6b3c"));return o.position.set(0,.95,0),n.add(o),n}function fM(){let n=new ye,e=N("#f1efe8"),t=new pe(new ft(9,20,10,0,Math.PI*2,0,Math.PI/2),N("#5f7d4a"));t.scale.y=.45,n.add(t);let i=[[0,0],[2.2,0],[2.2,.6],[1.9,.7],[2.1,2.6],[1.6,3.6],[.9,4],[.55,4.2],[.55,4.6],[.35,4.6],[.4,6.6],[.15,6.9],[0,7.4]].map(([a,o])=>new he(a,o)),s=new pe(new Ma(i,28),e);s.position.y=3.9,n.add(s);let r=new pe(new ft(.4,12,8),wt("#d8b04a",.4));return r.position.y=11.4,n.add(r),n}function Bp(n,{lowPower:e=!1}={}){let t=new Sc({canvas:n,antialias:!e,powerPreference:"high-performance"});t.setPixelRatio(e?Math.min(window.devicePixelRatio||1,1.5):Math.min(window.devicePixelRatio||1,2)),t.shadowMap.enabled=!0,t.shadowMap.type=Il,t.toneMapping=Cs,t.toneMappingExposure=1.05;let i=new ra;i.fog=new sa("#e9d8c0",40,120);let s=new gn(38,1,.1,400),r=new Ea("#fff1dc","#5a5048",1.3),a=new Ra("#ffe0b5",2.6);a.castShadow=!0,a.shadow.mapSize.set(e?1024:2048,e?1024:2048),Object.assign(a.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:1,far:80}),a.shadow.bias=-5e-4,a.shadow.normalBias=.03,i.add(r,a,a.target);let o={uTop:{value:new Ue},uHor:{value:new Ue},uGlow:{value:new Ue},uSun:{value:new P(.4,.25,-1).normalize()},uNight:{value:0},uTime:{value:0}},l=new pe(new ft(300,32,16),new Bt({side:un,depthWrite:!1,fog:!1,uniforms:o,vertexShader:"varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",fragmentShader:`
      varying vec3 vDir; uniform vec3 uTop, uHor, uGlow, uSun; uniform float uNight, uTime;
      float hash(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
      void main(){
        float h = max(vDir.y, 0.0);
        vec3 col = mix(uHor, uTop, smoothstep(0.0, 0.5, h));
        float s = max(dot(vDir, uSun), 0.0);
        col += uGlow * pow(s, 6.0) * 0.6 + uGlow * pow(s, 400.0) * 3.0;
        vec3 cell = floor(vDir * 180.0);
        float st = step(0.997, hash(cell)) * smoothstep(0.05, 0.3, h);
        col += vec3(st) * uNight * (0.6 + 0.4 * sin(uTime * 3.0 + hash(cell) * 30.0));
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`}));i.add(l);let c=new ye;i.add(c);let h=new Gn({map:oM(e),roughness:.92}),u=new pe(new mn(Pe*2,nt*2),h);u.rotation.x=-Math.PI/2,u.receiveShadow=!0,c.add(u);let d=new pe(new mn(300,300),new Gn({color:"#6f6a60",roughness:1}));d.rotation.x=-Math.PI/2,d.position.y=-.02,d.receiveShadow=!0,c.add(d);let f=new Gn({map:lM(),roughness:.95}),m=N("#5b5f6b",{map:cM()});function M(H,J,se,me,D){let ce=new ye,Q=new pe(new Ze(se,me,.5),f);Q.position.y=me/2,Q.castShadow=Q.receiveShadow=!0,ce.add(Q);let _e=Fc(se,.9,.35,m);_e.position.y=me,ce.add(_e),ce.position.set(H,0,J),ce.rotation.y=D,c.add(ce)}M(-Pe-.3,0,nt*2+1.2,1.8,Math.PI/2),M(Pe+.3,0,nt*2+1.2,1.8,Math.PI/2),M(0,nt+.3,Pe*2+1.2,.55,0);let g=new ye;g.position.set(0,0,-nt-1.4);let p=new pe(new Ze(Pe*2+1,3.2,2),[f,f,f,f,new Gn({map:hM(),roughness:.85}),f]);p.material[4].map.repeat.set(2,1),p.material[4].map.wrapS=Es,p.position.y=1.6,p.castShadow=p.receiveShadow=!0,g.add(p);let b=new pe(new Ze(Pe*2+1,.3,.8),N("#a8a296"));b.position.set(0,.15,1.3),b.receiveShadow=!0,g.add(b);for(let H=0;H<=8;H++){let J=new pe(new Le(.17,.19,3.2,12),N("#a3261c"));J.position.set(-Pe-.5+H*(Pe*2+1)/8,1.6,1.15),J.castShadow=!0,g.add(J)}let _=Fc(Pe*2+2.4,3.6,1.6,m);_.position.set(0,3.2,.2),g.add(_);let x=new pe(new Ze(2.2,.6,.08),[N("#1d1a24"),N("#1d1a24"),N("#1d1a24"),N("#1d1a24"),new Gn({map:io(512,140,(H,J,se)=>{H.fillStyle="#1d1a24",H.fillRect(0,0,J,se),H.strokeStyle="#e8b84a",H.lineWidth=8,H.strokeRect(8,8,J-16,se-16),H.fillStyle="#e8b84a",H.font='bold 84px "PingFang SC","Songti SC",serif',H.textAlign="center",H.textBaseline="middle",H.fillText("\u9F9F \u82D1",J/2,se/2+4)}),emissive:"#3a2a10",emissiveIntensity:.3}),N("#1d1a24")]);x.position.set(0,2.75,1.05),g.add(x);for(let H of[-Pe-.5+3*(Pe*2+1)/8,-Pe-.5+5*(Pe*2+1)/8])for(let J=0;J<9;J++){let se=new pe(new Le(.045,.045,.16,8),wt("#e0242f",.5));se.position.set(H+(J%2?.07:-.07),2.6-J*.15,1.38),se.rotation.z=J%2?.5:-.5,g.add(se)}c.add(g);for(let H of[-1,1]){let J=new ye,se=N("#9a968c");J.add(new pe(new Ze(.9,.5,.9),N("#7f7b72")).translateY(.25));let me=new pe(new ft(.38,16,12),se);me.scale.set(.9,1.1,.8),me.position.y=.85,J.add(me);let D=new pe(new ft(.3,16,12),se);D.position.set(0,1.35,.12),J.add(D);for(let Q=0;Q<14;Q++){let _e=Q/14*Math.PI*2,we=new pe(new ft(.09,8,6),N("#86827a"));we.position.set(Math.cos(_e)*.3,1.35+Math.sin(_e)*.3,.02),J.add(we)}for(let Q of[-1,1]){let _e=new pe(new ft(.05,8,6),N("#5f5b52"));_e.position.set(Q*.11,1.42,.38),J.add(_e)}let ce=new pe(new ft(.17,12,8),N("#86827a"));ce.position.set(H*-.25,.68,.32),J.add(ce),J.traverse(Q=>{Q.isMesh&&(Q.castShadow=!0)}),J.position.set(H*3.2,0,-nt-.25),J.rotation.y=H*-.25,c.add(J)}let S=new P(-Pe+.2,2.6,-2),T=new P(-6.2,3.4,-4.6),A=new pe(new Le(.012,.012,S.distanceTo(T),4),N("#e8e2d0"));A.position.copy(S).lerp(T,.5),A.quaternion.setFromUnitVectors(new P(0,1,0),T.clone().sub(S).normalize()),c.add(A);let y=[];["#ff6fae","#3a7bd5","#ffd35a","#ffffff","#3ad17a"].forEach((H,J)=>{let se=S.clone().lerp(T,.15+J*.17),me=new pe(J===3?new mn(.5,.6):new mn(.42,.5),N(H,{side:qt}));me.geometry.translate(0,-.27,0),me.position.copy(se),me.rotation.y=Math.atan2(T.x-S.x,T.z-S.z)+Math.PI/2,me.castShadow=!0,c.add(me),y.push(me)});let w={value:0},R=(()=>{let H=[];for(let me=0;me<4;me++){let D=new Zt(.035,.32+me*.05,3);D.translate(0,.16,0),D.rotateZ((me-1.5)*.25),D.rotateY(me*1.6),H.push(D.toNonIndexed())}let J=H.flatMap(me=>[...me.attributes.position.array]),se=new Et;return se.setAttribute("position",new it(J,3)),se.computeVertexNormals(),se})(),F=N("#6f9e43").clone();F.onBeforeCompile=H=>{H.uniforms.uWind=w,H.vertexShader=`uniform float uWind;
`+H.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
vec4 ip = instanceMatrix[3];
transformed.x += sin(uWind * 2.0 + ip.x * 0.7 + ip.z * 0.5) * 0.06 * position.y * 3.0;`)};let z=520,I=new es(R,F,z),U=new Mt,G=new $n,W=new P;for(let H=0;H<z;H++){let J,se;if(H<340){let D=H%4,ce=Xe()*2-1,Q=Pe-Xe()*Xe()*2.2;[J,se]=D===0?[-Q,ce*nt]:D===1?[Q,ce*nt]:D===2?[ce*Pe,-Q]:[ce*Pe,Q]}else if(H<420){let D=Xe()*Math.PI*2,ce=1.1+Xe()*1.4;J=ps[0].x+Math.cos(D)*ce,se=-ps[0].y+Math.sin(D)*ce}else J=(Xe()*2-1)*Pe,se=(Xe()*2-1)*nt;G.setFromAxisAngle(new P(0,1,0),Xe()*6.28);let me=.6+Xe()*.9;U.compose(new P(J,0,se),G,W.set(me,me*(.7+Xe()*.6),me)),I.setMatrixAt(H,U)}I.receiveShadow=!0,c.add(I);let K=new Mi(.11,6).rotateX(-Math.PI/2);K.scale(1.6,1,.8);let X=160,$=new es(K,N("#ffffff"),X),ne=["#c9a43a","#b8722c","#8fae4a","#d88a2a"].map(H=>new Ue(H));for(let H=0;H<X;H++){let J=Xe()*Math.PI*2,se=H<90?1.2+Xe()*4:Xe()*16,me=H<90?ps[0].x+Math.cos(J)*se:(Xe()*2-1)*Pe,D=H<90?-ps[0].y+Math.sin(J)*se:(Xe()*2-1)*nt;G.setFromAxisAngle(new P(0,1,0),Xe()*6.28),U.compose(new P(Pn.clamp(me,-Pe,Pe),.012+H*5e-5,Pn.clamp(D,-nt,nt)),G,W.setScalar(.7+Xe()*.7)),$.setMatrixAt(H,U),$.setColorAt(H,ne[H%4])}$.receiveShadow=!0,c.add($);let Ie=[];for(let H=0;H<6;H++){let J=Fp();J.position.set(-Pe+2+H*(Pe*2-4)/5,2.65,-nt+.15),c.add(J),Ie.push(J)}for(let[H,J]of[[-Pe+.4,-3],[-Pe+.4,6],[Pe-.4,-3],[Pe-.4,6]]){let se=Fp();se.position.set(H,2.1,J),c.add(se),Ie.push(se)}let Ce=[[-7,-nt+1],[7,-nt+1],[-Pe+1,2],[Pe-1,2]].map(([H,J])=>{let se=new Aa("#ff7a3c",0,13,1.6);return se.position.set(H,2.5,J),i.add(se),se}),gt=[];for(let H of ps){let J=H.kind==="tree"?uM():dM();J.position.set(H.x,0,-H.y),c.add(J),gt.push(J)}for(let[H,J]of[[-Pe+1,-nt+1],[Pe-1,-nt+1],[-Pe+1,nt-1.2],[Pe-1,nt-1.2]]){let se=new ye;se.add(new pe(new Le(.45,.32,.6,14),N("#8a3b22")).translateY(.3));let me=new pe(new zn(.55,1),N("#4f8a3c",{flatShading:!0}));me.position.y=1,se.add(me);for(let D=0;D<6;D++){let ce=new pe(new ft(.08,8,6),wt("#ff5a3a",.4)),Q=D*1.1;ce.position.set(Math.cos(Q)*.45,1+Math.sin(D)*.3,Math.sin(Q)*.45),se.add(ce)}se.traverse(D=>{D.isMesh&&(D.castShadow=!0)}),se.position.set(H,0,J),c.add(se)}let Ye=new ye;for(let H of[-1,1]){let J=new pe(new Tt(.35,.04,6,20),N("#1d1a24"));J.position.set(H*.5,.36,0),Ye.add(J)}let ct=new pe(new Ze(1,.06,.06),N("#2c7a6b"));ct.position.y=.6,Ye.add(ct),Ye.position.set(Pe-.7,0,3.5),Ye.rotation.y=Math.PI/2,Ye.rotation.x=.12,c.add(Ye);let ee=new ye;for(let H=0;H<3;H++)for(let J=-6;J<=6;J++){let se=5+Xe()*3,me=2.4+Xe()*.8,D=Fc(se,4,1.3,m);D.position.set(J*7+H%2*3.5+Xe(),me,-nt-7-H*7),ee.add(D);let ce=new pe(new Ze(se-.6,me,3.4),N("#9a9488"));ce.position.set(D.position.x,me/2,D.position.z),ee.add(ce)}for(let H=0;H<18;H++){let J=new pe(new zn(1.4+Xe(),0),N(Xe()<.5?"#557a40":"#4a6d38",{flatShading:!0}));J.position.set(-45+Xe()*90,3.5,-nt-9-Xe()*18),ee.add(J)}for(let H of[-1,1])for(let J=0;J<8;J++){let se=Fc(4,4,1.2,m);se.rotation.y=Math.PI/2,se.position.set(H*(Pe+4+J%2*5),2.6,-nt+J*4),ee.add(se)}let ae=fM();ae.position.set(22,0,-70),ee.add(ae),i.add(ee);let ge=e?null:new Ac(t);ge&&ge.addPass(new Rc(i,s));let $e=ge?new Tr(new he(512,512),.5,.45,.93):null;ge&&(ge.addPass($e),ge.addPass(new Cc));let be={tDiffuse:{value:null},uSat:{value:1.12},uVig:{value:.42},uFlash:{value:0},uHurt:{value:0},uChroma:{value:0},uWarm:{value:.5}},Qe=ge&&new Er({uniforms:be,vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`uniform sampler2D tDiffuse; uniform float uSat, uVig, uFlash, uHurt, uChroma, uWarm; varying vec2 vUv;
      void main(){
        vec2 d = vUv - 0.5; float r = length(d);
        vec3 col = uChroma > 0.001 ? vec3(texture2D(tDiffuse, vUv + d * uChroma * 0.03).r, texture2D(tDiffuse, vUv).g, texture2D(tDiffuse, vUv - d * uChroma * 0.03).b) : texture2D(tDiffuse, vUv).rgb;
        float l = dot(col, vec3(0.299, 0.587, 0.114));
        col = mix(vec3(l), col, uSat);
        col *= mix(vec3(1.0), vec3(1.05, 1.0, 0.93), uWarm);
        col = (col - 0.5) * 1.06 + 0.5;
        col *= 1.0 - uVig * smoothstep(0.42, 0.95, r);
        col = mix(col, vec3(0.85, 0.08, 0.1), uHurt * smoothstep(0.3, 0.8, r) * 0.7);
        col = mix(col, vec3(1.0), uFlash);
        gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
      }`});ge&&ge.addPass(Qe);let At=!e,oe=!e,ue=180,de=new Et,fe=new Float32Array(ue*3),Me=new Float32Array(ue);for(let H=0;H<ue;H++)fe[H*3]=(Xe()*2-1)*Pe,fe[H*3+1]=.5+Xe()*3.5,fe[H*3+2]=(Xe()*2-1)*nt,Me[H]=Xe()*100;de.setAttribute("position",new Ht(fe,3)),de.setAttribute("seed",new Ht(Me,1));let ze={uTime:{value:0},uNight:{value:0},uScale:{value:400},uSnow:{value:0}},Ve=0,Ke=new ws(de,new Bt({uniforms:ze,transparent:!0,depthWrite:!1,blending:sn,vertexShader:`attribute float seed; uniform float uTime, uNight, uScale, uSnow; varying float vA; varying vec3 vC;
      void main(){ vec3 p = position; float t = uTime * 0.3 + seed;
        p.x += sin(t * 0.7) * 1.5 + uTime * 0.25 * (1.0 - uNight) * (1.0 - uSnow); p.z += cos(t * 0.5) * 1.2; p.y += sin(t * 1.3) * 0.4;
        // snow: everything drifts down and loops back to the top
        p.y = mix(p.y, 5.5 - mod(uTime * 0.7 + seed * 3.0, 5.5), uSnow);
        p.x = mod(p.x + 12.5, 25.0) - 12.5;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float blink = uNight > 0.5 ? 0.5 + 0.5 * sin(uTime * 3.0 + seed * 7.0) : 0.7;
        vA = mix(blink, 0.85, uSnow); vC = mix(mix(vec3(1.0, 0.72, 0.82), vec3(0.75, 1.0, 0.45), uNight), vec3(0.75), uSnow);
        gl_PointSize = mix(mix(0.18, 0.13, uNight), 0.22, uSnow) * uScale / -mv.z; gl_Position = projectionMatrix * mv; }`,fragmentShader:"varying float vA; varying vec3 vC; void main(){ float r = length(gl_PointCoord - 0.5); if (r > 0.5) discard; gl_FragColor = vec4(vC * 1.4, pow(1.0 - r * 2.0, 1.5) * vA); }"}));Ke.frustumCulled=!1,i.add(Ke);let et=[{at:0,top:"#7fb2e0",hor:"#f6dcb8",glow:"#ffd09a",sun:"#ffe7c4",sunI:2.7,hemi:1.3,fog:"#ead8bd",elev:.55,lamp:0,exp:1.05},{at:.55,top:"#6f8fc8",hor:"#ffbf8a",glow:"#ff9a5c",sun:"#ffb47a",sunI:2.2,hemi:1.05,fog:"#e7b996",elev:.25,lamp:.4,exp:1.05},{at:.8,top:"#2b3466",hor:"#b86a6a",glow:"#ff7a4a",sun:"#ff9a6a",sunI:1.1,hemi:.75,fog:"#6a5472",elev:.12,lamp:1,exp:1.1},{at:1,top:"#0e1430",hor:"#2c3466",glow:"#6a7ad8",sun:"#9fb2ff",sunI:.75,hemi:.6,fog:"#232a4a",elev:.6,lamp:1.3,exp:1.15}],B=new Ue,Rt=new Ue,rt=(H,J,se,me)=>H.copy(B.set(J)).lerp(Rt.set(se),me),C={f:0,goal:0,lamp:0},v=new P;function V(){let H=0;for(;H<et.length-2&&C.f>et[H+1].at;)H++;let J=et[H],se=et[H+1],me=Pn.clamp((C.f-J.at)/(se.at-J.at),0,1),D=ce=>J[ce]+(se[ce]-J[ce])*me;rt(o.uTop.value,J.top,se.top,me),rt(o.uHor.value,J.hor,se.hor,me),rt(o.uGlow.value,J.glow,se.glow,me),rt(a.color,J.sun,se.sun,me),a.intensity=D("sunI"),r.intensity=D("hemi"),rt(i.fog.color,J.fog,se.fog,me),rt(r.groundColor,"#5a5048","#1c1a2a",C.f),t.toneMappingExposure=D("exp"),C.lamp=D("lamp"),v.set(-.55,D("elev"),.35).normalize(),o.uSun.value.set(-.55,Math.max(.05,D("elev")*.5),-.8).normalize(),o.uNight.value=Pn.clamp((C.f-.7)/.3,0,1),ze.uNight.value=o.uNight.value,rt(no.color.value,"#fff0d8","#8fb4ff",Pn.clamp((C.f-.5)/.5,0,1)),no.k.value=.35+.25*C.f,be.uWarm.value=.6-.6*C.f}V();let Z=new P;function te(H,J){C.goal=Pn.clamp(H,0,1),J&&(C.f=C.goal,V())}function xe(H,J){Math.abs(C.goal-C.f)>5e-4&&(C.f+=(C.goal-C.f)*(1-Math.exp(-J*.8)),V()),o.uTime.value=H,l.position.copy(s.position),a.position.copy(Z).addScaledVector(v,40),a.target.position.copy(Z);for(let[se,me]of Ie.entries())me.rotation.z=Math.sin(H*1.3+se)*.06,me.userData.body.material.emissiveIntensity=.5+C.lamp*2.2;for(let[se,me]of Ce.entries())me.intensity=C.lamp*(9+Math.sin(H*7+se*2)*.6);for(let se of gt)se.userData.crown&&(se.userData.crown.rotation.z=Math.sin(H*.7)*.025,se.userData.crown.rotation.x=Math.sin(H*.53)*.02,se.userData.cage.rotation.z=Math.sin(H*1.1)*.08);w.value=H,ze.uTime.value=H,ze.uSnow.value+=(Ve-ze.uSnow.value)*(1-Math.exp(-J*.8));for(let[se,me]of y.entries())me.rotation.x=Math.sin(H*2+se)*.15;be.uFlash.value*=Math.exp(-J*1.6),be.uHurt.value*=Math.exp(-J*5),be.uChroma.value*=Math.exp(-J*6)}function ve(){let H=window.innerWidth,J=window.innerHeight;t.setSize(H,J,!1),ge&&ge.setSize(H,J),ze.uScale.value=t.domElement.height/(2*Math.tan(Pn.degToRad(s.fov/2))),s.aspect=H/J,s.updateProjectionMatrix()}function ie(){oe&&ge?ge.render():t.render(i,s)}function re(H){At=H>=2&&!!ge,oe=H>=1&&!!ge,$e&&($e.enabled=At),t.setPixelRatio(H>=1?Math.min(window.devicePixelRatio||1,H>=2?2:1.5):H===0&&e?Math.min(window.devicePixelRatio||1,1.5):1);let J=H>=1?2048:1024;a.shadow.mapSize.x!==J&&(a.shadow.mapSize.set(J,J),a.shadow.map?.dispose(),a.shadow.map=null),ve()}return ve(),{renderer:t,scene:i,camera:s,focus:Z,update:xe,resize:ve,render:ie,setDay:te,setQuality:re,flash:H=>{be.uFlash.value=Math.max(be.uFlash.value,H)},hurt:()=>{be.uHurt.value=1,be.uChroma.value=1},setSnow:H=>{Ve=H?1:0},get lamp(){return C.lamp}}}var Op={kill:{cols:["#ffd35a","#ff7a59","#ffffff"],add:!0,sp:.09,up:.08,g:.006,life:40,size:.28},spark:{cols:["#fff3a8","#ffd35a"],add:!0,sp:.07,up:.03,g:.004,life:14,size:.18},fluff:{cols:["#d7ad7e","#c79a6b","#f1d6b0"],add:!1,sp:.06,up:.06,g:.0015,life:70,size:.3,drag:.95},gold:{cols:["#ffd35a","#fff1a8","#ffb000"],add:!0,sp:.08,up:.12,g:.004,life:60,size:.3},sugar:{cols:["#ff3b5c","#ffffff","#ffd1e0"],add:!0,sp:.06,up:.1,g:.005,life:40,size:.22},dust:{cols:["#b9b2a6","#9d968a"],add:!1,sp:.05,up:.03,g:.001,life:34,size:.4,drag:.92},ping:{cols:["#ffd400","#fff3a8"],add:!0,sp:.1,up:.06,g:.005,life:30,size:.3},paper:{cols:["#ffffff","#f1ede4"],add:!1,sp:.06,up:.08,g:.002,life:60,size:.26,drag:.95},boom:{cols:["#ff7a2a","#ffd35a","#ff3b24"],add:!0,sp:.16,up:.1,g:.004,life:32,size:.5},poof:{cols:["#e8e4dc","#c9c4ba"],add:!1,sp:.05,up:.05,g:0,life:30,size:.45,drag:.9},spawn:{cols:["#ff5a5a","#ffb3b3"],add:!0,sp:.05,up:.07,g:.002,life:26,size:.24},heart:{cols:["#ff7ab8","#ffd1e8","#ffffff"],add:!0,sp:.12,up:.04,g:.001,life:40,size:.32},web:{cols:["#ffffff","#e6f3ff"],add:!0,sp:.2,up:.05,g:.002,life:40,size:.2}};function kp(n,e,t){let i=new Et,s=new Float32Array(e*3),r=new Float32Array(e*3),a=new Float32Array(e),o=new Float32Array(e);i.setAttribute("position",new Ht(s,3)),i.setAttribute("color",new Ht(r,3)),i.setAttribute("size",new Ht(a,1)),i.setAttribute("alpha",new Ht(o,1));let l={uScale:{value:500}},c=new Bt({uniforms:l,transparent:!0,depthWrite:!1,blending:t?sn:os,vertexColors:!0,vertexShader:`attribute float size; attribute float alpha; varying vec3 vC; varying float vA; uniform float uScale;
      void main(){ vC = color; vA = alpha; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = size * uScale / -mv.z; gl_Position = projectionMatrix * mv; }`,fragmentShader:`varying vec3 vC; varying float vA;
      void main(){ vec2 d = gl_PointCoord - 0.5; float r = length(d); if (r > 0.5) discard;
        float a = ${t?"pow(1.0 - r * 2.0, 1.6)":"smoothstep(0.5, 0.35, r)"} * vA; gl_FragColor = vec4(vC * ${t?"1.6":"1.0"}, a); }`}),h=new ws(i,c);return h.frustumCulled=!1,n.add(h),{geo:i,pos:s,col:r,size:a,alpha:o,uniforms:l,list:[],max:e}}function pM(){let n=document.createElement("canvas");n.width=n.height=1024;let e=n.getContext("2d");e.translate(512,512),e.strokeStyle="rgba(255,255,255,0.95)",e.shadowColor="#bfe4ff",e.shadowBlur=12;let t=16;e.lineWidth=5;for(let s=0;s<t;s++){let r=s/t*Math.PI*2;e.beginPath(),e.moveTo(0,0),e.lineTo(Math.cos(r)*500,Math.sin(r)*500),e.stroke()}e.lineWidth=3.5;for(let s=40;s<500;s+=34){e.beginPath();for(let r=0;r<=t;r++){let a=r/t*Math.PI*2,o=(r-.5)/t*Math.PI*2,l=Math.cos(a)*s,c=Math.sin(a)*s;r===0?e.moveTo(l,c):e.quadraticCurveTo(Math.cos(o)*s*.9,Math.sin(o)*s*.9,l,c)}e.stroke()}let i=new Li(n);return i.colorSpace=hn,i}function mM(){let n=new ye,e=new pe(new ft(.7,20,14),N("#2a2233"));e.scale.set(1,.85,1.1),n.add(e);let t=new pe(new ft(.42,18,12),N("#2a2233"));t.position.set(0,-.35,.7),n.add(t);for(let[r,a]of[[-.14,-.2],[.14,-.2],[-.26,-.32],[.26,-.32]]){let o=new pe(new ft(.07,8,6),wt("#ff4fa0",3));o.position.set(r,a-.1,1.05),n.add(o)}for(let r of[-1,1]){let a=new pe(new Zt(.22,.4,4).rotateZ(r*Math.PI/2),N("#ff6fae"));a.position.set(r*.22,.65,0),a.scale.y=.6,n.add(a)}let i=[];for(let r=0;r<8;r++){let a=r<4?-1:1,o=r%4,l=new ye;l.position.set(a*.5,0,.45-o*.3);let c=new pe(new Le(.05,.06,1.1,6),N("#2a2233"));c.position.set(a*.45,.25,0),c.rotation.z=a*-1,l.add(c);let h=new pe(new Le(.03,.05,1.2,6),N("#2a2233"));h.position.set(a*1.05,-.2,0),h.rotation.z=a*.5,l.add(h),l.rotation.y=(o-1.5)*.35*a,n.add(l),i.push(l)}let s=new pe(new Le(.02,.02,30,4),new It({color:"#ffffff"}));return s.position.y=15,n.add(s),n.userData.legs=i,n}function Hp(n){let e=kp(n,1600,!0),t=kp(n,900,!1),i=new Ue;function s(A,y,w,R=12,L=.5){let F=Op[A]||Op.kill,z=F.add?e:t;for(let I=0;I<R;I++){z.list.length>=z.max&&z.list.shift();let U=Math.random()*Math.PI*2,G=F.sp*(.4+Math.random());i.set(F.cols[I%F.cols.length]),z.list.push({x:y,y:L+Math.random()*.3,z:-w,vx:Math.cos(U)*G,vy:F.up*(.5+Math.random()),vz:Math.sin(U)*G,life:F.life*(.6+Math.random()*.6),max:0,g:F.g,drag:F.drag||.97,size:F.size*(.6+Math.random()*.8),r:i.r,gg:i.g,b:i.b}),z.list[z.list.length-1].max=z.list[z.list.length-1].life}}function r(A){let y=0,w=[];for(let R of A.list)R.vy-=R.g,R.vx*=R.drag,R.vz*=R.drag,R.x+=R.vx,R.y+=R.vy,R.z+=R.vz,R.y<.03&&(R.y=.03,R.vy*=-.3,R.vx*=.7,R.vz*=.7),!(--R.life<=0)&&(w.push(R),A.pos[y*3]=R.x,A.pos[y*3+1]=R.y,A.pos[y*3+2]=R.z,A.col[y*3]=R.r,A.col[y*3+1]=R.gg,A.col[y*3+2]=R.b,A.size[y]=R.size,A.alpha[y]=Math.min(1,R.life/(R.max*.4)),y++);A.list=w,A.geo.setDrawRange(0,y);for(let R of["position","color","size","alpha"])A.geo.attributes[R].needsUpdate=!0}let a={voice:"#ff7ab8",boom:"#ff8a2a",slam:"#ff3b3b",gavel:"#ff6a3b",ping:"#ffd400",star:"#9fd8ff"},o=new Jn(.86,1,64).rotateX(-Math.PI/2),l=[];function c(A,y,w,R){let L=new pe(o,new It({color:a[R]||"#ffffff",transparent:!0,opacity:.9,blending:sn,depthWrite:!1}));L.position.set(A,.08,-y),n.add(L),l.push({m:L,r:w,t:0,T:R==="voice"?26:20}),R==="voice"&&s("heart",A,y,26,.8)}let h=new It({map:pM(),transparent:!0,depthWrite:!1,opacity:0,blending:sn}),u=new pe(new mn(1,1).rotateX(-Math.PI/2),h);u.position.y=.06,u.visible=!1,n.add(u);let d=mM();d.visible=!1,n.add(d);let f=0;function m(A,y){f=1,u.position.x=A,u.position.z=-y,u.visible=!0,d.position.set(A,18,-y),d.visible=!0,s("web",A,y,60,.3)}let M=new ft(.28,14,10),g=new Zt(.22,2.4,10,1,!0).translate(0,1.2,0),p=wt("#bfe6ff",4),b=new It({color:"#9fd8ff",transparent:!0,opacity:.55,blending:sn,depthWrite:!1}),_=[];function x(A,y,w){let R=new ye;R.add(new pe(M,p),new pe(g,b)),R.rotation.z=-.5,n.add(R),_.push({grp:R,x:A,y,t:0,T:w})}function S(){r(e),r(t);for(let A of _){A.t++;let y=Math.min(1,A.t/A.T);A.grp.position.set(A.x-6*(1-y),.2+12*(1-y),-A.y),A.t>=A.T&&(n.remove(A.grp),A.done=!0)}for(let A=_.length-1;A>=0;A--)_[A].done&&_.splice(A,1);for(let A of l){A.t++;let y=A.t/A.T;A.m.scale.setScalar(Math.max(.01,A.r*(.25+.75*Math.sqrt(y)))),A.m.material.opacity=.9*(1-y),A.t>=A.T&&(n.remove(A.m),A.m.material.dispose(),A.done=!0)}for(let A=l.length-1;A>=0;A--)l[A].done&&l.splice(A,1);if(f>0){f++;let A=Math.min(1,f/30);u.scale.setScalar(26*(1-Math.pow(1-A,3))),u.rotation.y=f*.002,h.opacity=f<200?.75:Math.max(0,.75*(1-(f-200)/60));let y=f<24?18-f/24*15.5:f<120?2.5+Math.sin(f*.1)*.25:2.5+(f-120)*.25;d.position.y=y,d.rotation.y=Math.sin(f*.05)*.3;for(let[w,R]of d.userData.legs.entries())R.rotation.x=Math.sin(f*.3+w)*.25;f>260&&(f=0,u.visible=!1,d.visible=!1)}}function T(A){e.uniforms.uScale.value=t.uniforms.uScale.value=A}return{burst:s,ring:c,superSpider:m,meteor:x,update:S,setScale:T}}var ht=n=>document.getElementById(n),Bu=Object.fromEntries(ja.map(n=>[n.id,n])),xM=Object.fromEntries(Qa.map(n=>[n.id,n]));function zp(n){let e=ht("labels");ht("tagline").textContent=lp;let t=(I,U)=>I.map(G=>`<span class="pill ${U}">${G}</span>`).join(""),i=["durian","ginger","orange","dingding","oyster","goat","caesar","chenwei","jia","yi","guo","thief","mao"].map(I=>fs[I]);ht("cast").innerHTML=`<div class="row"><b>\u4E3B\u89D2</b>${t(["\u9F9F"],"hero")}<b>\u961F\u53CB</b>${t(["\u8521\u535A"],"mate")}</div><div class="row"><b>\u5BF9\u624B</b>${t(i,"foe")}</div><div class="row"><b>Boss</b>${t([fs.bigmao,fs.judge],"boss")}</div>`;let s=new P;function r(I,U,G){return s.set(I,U,-G).project(n),[(s.x*.5+.5)*innerWidth,(-s.y*.5+.5)*innerHeight,s.z<1]}let a=(I,U,G,W)=>{let[K,X,$]=r(U,G,W);I.style.left=K+"px",I.style.top=X+"px",I.style.display=$?"":"none"},o=document.createElement("div");o.className="bubble",o.hidden=!0,e.appendChild(o);let l="",c=[];function h(I,U,G,W,K=1.2,X=100){c.length>60&&c.shift().el.remove();let $=document.createElement("div");$.className=I,$.textContent=U,e.appendChild($),c.push({el:$,x:G+(Math.random()-.5)*.4,y:W,h:K,life:X})}let u=(I,U,G,W)=>h("dmg"+(W?" crit":""),String(G),I,U,1.1,42),d=(I,U,G,W)=>h("pop "+(W||""),G,I,U,W==="ping"?.5:1.8,96),f=new Map;function m(I){for(let K=c.length-1;K>=0;K--){let X=c[K];if(--X.life<=0){X.el.remove(),c.splice(K,1);continue}a(X.el,X.x,X.h,X.y)}let U=I.hero;U&&U.sayT>0&&(I.state==="play"||I.state==="over")?(l!==U.say&&(l=U.say,o.textContent=U.say,o.hidden=!1,o.style.animation="none",o.offsetWidth,o.style.animation=""),a(o,U.x,1.55,U.y)):o.hidden||(o.hidden=!0,l="");let G=new Set,W=I.enemies.length<26;for(let K of I.state==="play"?I.enemies:[]){let X=K.type==="judge"||K.type==="bigmao";if(!X&&!K.elite&&(!W||K.type==="maoqiu"))continue;G.add(K.id);let $=f.get(K.id);$||($=document.createElement("div"),$.className="tag"+(X||K.elite?" boss":""),$.textContent=K.name,e.appendChild($),f.set(K.id,$));let ne=({judge:4.6,bigmao:3.9,mao:1.9,jia:2.4,yi:2.4,guo:2.1,thief:2.1,caesar:1.9,chenwei:1.9,dingding:2.3,ginger:1.45}[K.type]||1.25)*(K.elite?1.35:1);a($,K.x,ne,K.y)}for(let K of I.state==="play"?I.pickups||[]:[]){let X="p"+K.id;G.add(X);let $=f.get(X);$||($=document.createElement("div"),$.className="tag pick",$.textContent=eo[K.kind].name,e.appendChild($),f.set(X,$)),a($,K.x,1.9,K.y)}for(let[K,X]of f)G.has(K)||(X.remove(),f.delete(K))}function M(){for(let I of c)I.el.remove();c.length=0;for(let I of f.values())I.remove();f.clear(),o.hidden=!0}let g=-1;function p(I){let U=I.hero,G=U.s;ht("hpFill").style.width=Math.max(0,G.hp/G.maxhp*100)+"%",ht("hpText").textContent=`${Math.ceil(Math.max(0,G.hp))} / ${G.maxhp}`,ht("xpFill").style.width=Math.min(100,U.xp/Dc(U.lvl)*100)+"%",ht("lvl").textContent="Lv "+U.lvl,ht("shields").innerHTML="<i></i>".repeat(U.shields),ht("waveNum").textContent=`\u7B2C ${I.wave} / ${10} \u6CE2`;let W=ht("waveTime");if(I.bossWave)W.textContent="BOSS",W.classList.remove("low");else if(I.waveT===0)W.textContent=`\u6E05\u573A ${I.enemies.length+I.spawns.length}`,W.classList.remove("low");else{let ne=Math.ceil(I.waveT/60);W.textContent=`${ne/60|0}:${String(ne%60).padStart(2,"0")}`,W.classList.toggle("low",ne<=5)}let K=ht("bossbar");I.boss?(K.hidden=!1,ht("bossName").textContent=I.boss.name,ht("bossFill").style.width=Math.max(0,I.boss.hp/I.boss.max*100)+"%"):K.hidden=!0,ht("kills").textContent="\u51FB\u8D25 "+I.kills,ht("score").firstChild.nodeValue=I.score.toLocaleString();let X=ht("combo");I.combo>=3?(X.hidden=!1,ht("comboN").textContent!==String(I.combo)&&(ht("comboN").textContent=I.combo,X.classList.remove("bump"),X.offsetWidth,X.classList.add("bump")),ht("comboBar").style.width=I.comboT/150*90+"px"):X.hidden=!0;let $=ht("ultBtn");if($.style.setProperty("--p",U.ult),$.classList.toggle("ready",U.ult>=100),U.augs.length!==g){g=U.augs.length;let ne={};for(let Ie of U.augs)ne[Ie]=(ne[Ie]||0)+1;ht("augs").innerHTML=Object.entries(ne).map(([Ie,Ce])=>`<i class="${Bu[Ie].tier}">${Bu[Ie].name}${Ce>1?" \xD7"+Ce:""}</i>`).join("")}}let b=["title","pick","pause","over","win"];function _(I){for(let U of b)ht(U).hidden=U!==I;ht("hud").hidden=!(I==="play"||I==="pause"||I==="pick"),I==="title"&&(g=-1)}function x(I,U,G){let W=ht("banner");ht("bannerTitle").textContent=I,ht("bannerSub").textContent=U||"",W.className="",W.offsetWidth,W.className="show"+(G?" boss":"")}let S="";function T(I,U){let G=I.offer.kind==="stat",W=I.offer.kind+I.offer.list.join()+I.picks+I.rerolls;if(W===S)return;S=W;let K=G?"stat":I.offer.tier,X=ht("pickTier");ht("pickTitle").textContent=G?"\u57FA\u7840\u5347\u7EA7":"\u6D77\u514B\u65AF\u5F3A\u5316",X.textContent=G?"1 / 2":cp[K]+" \xB7 2 / 2",X.className=K,ht("pickSub").textContent=G?`${"\u8521\u535A"}\uFF1A\u5148\u7EC3\u4E00\u9879\u672C\u4E8B\uFF0C\u518D\u9009\u6D77\u514B\u65AF`:`${"\u8521\u535A"}\uFF1A\u518D\u9009\u4E00\u4E2A\u6D77\u514B\u65AF\u5427`;let $=I.lastWave,ne=I.hero.s,Ie=G?`<span>\u5B50\u5F39 ${ne.count} \u53D1</span><span>\u4F24\u5BB3 ${ne.dmg.toFixed(1)}</span><span>\u751F\u547D ${Math.ceil(ne.hp)}/${ne.maxhp}</span><span>\u6062\u590D ${ne.regen}/6 \u79D2</span>`:"";ht("summary").innerHTML=($?`<span class="rate ${$.rating}">${$.rating}</span><span>\u7B2C ${$.n} \u6CE2\u5B8C\u6210</span><span>\u51FB\u8D25 ${$.kills}</span><span>\u6700\u9AD8\u8FDE\u6740 ${$.best}</span>${$.bonus?`<span>\u8BC4\u4EF7\u5956\u52B1 +${$.bonus}</span>`:""}${$.reroll?"<span>\u65E0\u4F24\uFF1A\u6D77\u514B\u65AF\u91CD\u63B7 +1</span>":""}`:"")+Ie;let Ce=Ye=>(G?I.hero.statUps:I.hero.augs).filter(ct=>ct===Ye).length;ht("cards").innerHTML=I.offer.list.map((Ye,ct)=>{let ee=G?xM[Ye]:Bu[Ye];return`<button class="card ${K}" data-i="${ct}"><div class="in"><div class="hex" aria-hidden="true">${ee.icon}</div><div><h3>${ee.name}</h3><p>${ee.desc}</p>${Ce(Ye)?`<div class="own">\u5DF2\u62E5\u6709 \xD7${Ce(Ye)}</div>`:""}</div></div><kbd>${ct+1}</kbd></button>`}).join("");for(let Ye of ht("cards").children)Ye.onclick=()=>U(Number(Ye.dataset.i));let gt=ht("rerollBtn");gt.parentElement.hidden=G,gt.textContent=`\u6362\u4E00\u6279\uFF08\u5269 ${I.rerolls} \u6B21\uFF09`,gt.disabled=I.rerolls<=0,gt.style.opacity=I.rerolls>0?1:.5}let A=()=>{S=""};function y(I){let U=I.hero,G=Math.max(I.score,Number(localStorage.getItem("xo.best")||0));return localStorage.setItem("xo.best",G),[[I.score.toLocaleString(),"\u751C\u5EA6"+(I.score>=G?"\uFF08\u65B0\u7EAA\u5F55\uFF01\uFF09":"")],[G.toLocaleString(),"\u6700\u4F73\u751C\u5EA6"],[I.wave+" / "+10,"\u6CE2\u6B21"],[I.kills,"\u51FB\u8D25"],[I.bestCombo,"\u6700\u9AD8\u8FDE\u6740"],[I.hitsTotal,"\u6211\u7BAD\u4E2D\u4E86\uFF08\u6B21\uFF09"]].map(([K,X])=>`<div><b>${K}</b><small>${X}</small></div>`).join("")}function w(I){ht("overTitle").textContent=I.overQuote,ht("overStats").innerHTML=y(I)}function R(I){ht("winStats").innerHTML=y(I)}function L(I,U="",G){let W=ht("toasts");W.children.length>3&&W.firstChild.remove();let K=document.createElement("div");K.className="toast "+U,K.textContent=I,G&&K.style.setProperty("--c",G),W.appendChild(K),setTimeout(()=>K.remove(),2500)}function F(I,U,G){let W=ht("streak");ht("streakT").textContent=I,ht("streakP").textContent=`${U} \u8FDE\u6740`,W.className="",W.offsetWidth,W.className="show t"+G}function z(){let I=ht("hurtFlash");I.classList.add("on"),setTimeout(()=>I.classList.remove("on"),60)}return{updateLabels:m,clearLabels:M,hud:p,show:_,banner:x,renderPick:T,resetPick:A,renderOver:w,renderWin:R,dmg:u,pop:d,hurtFlash:z,toast:L,streak:F}}var Nt=null,ki=null,Hi=null,Bn=null,Bc=null,Ou=localStorage.getItem("xo.muted")==="1",Oc=()=>Ou;function ku(n){Ou=n,localStorage.setItem("xo.muted",n?"1":"0"),ki&&ki.gain.setTargetAtTime(n?0:.5,Nt.currentTime,.05)}function ro(){if(Nt){Nt.state==="suspended"&&Nt.resume();return}let n=window.AudioContext||window.webkitAudioContext;if(!n)return;Nt=new n,ki=Nt.createGain(),ki.gain.value=Ou?0:.5;let e=Nt.createDynamicsCompressor();e.threshold.value=-16,e.ratio.value=4,ki.connect(e).connect(Nt.destination),Hi=Nt.createGain(),Hi.gain.value=.8,Hi.connect(ki),Bn=Nt.createGain(),Bn.gain.value=.32,Bn.connect(ki),Bc=Nt.createGain(),Bc.gain.value=.5,Bc.connect(ki);let t=Nt.createDelay();t.delayTime.value=.23;let i=Nt.createGain();i.gain.value=.25;let s=Nt.createGain();s.gain.value=.22,Bn.connect(t).connect(i).connect(t),t.connect(s).connect(ki),bM()}var Yp=()=>Nt&&Nt.state==="running",so=null;function yM(){if(so)return so;so=Nt.createBuffer(1,Nt.sampleRate,Nt.sampleRate);let n=so.getChannelData(0);for(let e=0;e<n.length;e++)n[e]=Math.random()*2-1;return so}function qe(n,e,t,{type:i="sine",vol:s=.2,attack:r=.004,bus:a=Hi,glide:o=0,bend:l=0}={}){let c=Nt.createOscillator(),h=Nt.createGain();c.type=i,c.frequency.setValueAtTime(l?n*l:n,e),l&&c.frequency.exponentialRampToValueAtTime(n,e+.04),o&&c.frequency.exponentialRampToValueAtTime(n*o,e+t),h.gain.setValueAtTime(1e-4,e),h.gain.exponentialRampToValueAtTime(s,e+r),h.gain.exponentialRampToValueAtTime(1e-4,e+t),c.connect(h).connect(a),c.start(e),c.stop(e+t+.05)}function rn(n,e,{vol:t=.2,f:i=2e3,q:s=1,type:r="bandpass",bus:a=Hi,sweep:o=0}={}){let l=Nt.createBufferSource();l.buffer=yM();let c=Nt.createBiquadFilter();c.type=r,c.frequency.setValueAtTime(i,n),c.Q.value=s,o&&c.frequency.exponentialRampToValueAtTime(i*o,n+e);let h=Nt.createGain();h.gain.setValueAtTime(t,n),h.gain.exponentialRampToValueAtTime(1e-4,n+e),l.connect(c).connect(h).connect(a),l.start(n,Math.random()*.5),l.stop(n+e+.05)}function Ar(n,e,t=.12,i=Bn){qe(n,e,.9,{type:"triangle",vol:t,bend:1.03,bus:i}),qe(n*2,e,.35,{type:"sine",vol:t*.4,bus:i}),qe(n*3,e,.12,{type:"sine",vol:t*.15,bus:i})}var st={A3:220,C4:261.63,D4:293.66,E4:329.63,G4:392,A4:440,C5:523.25,D5:587.33,E5:659.25,G5:783.99,A5:880,C6:1046.5},_M=["E5","G5","A5","G5","E5","D5","C5","D5","E5","G5","A5","C6","A5","G5","E5","-","D5","E5","G5","E5","D5","C5","A4","C5","D5","E5","D5","C5","A4","G4","A4","-"],vM=["C4","A3","D4","G4"],MM=["A4","C5","D5","E5","D5","C5","A4","-","E5","G5","E5","D5","C5","D5","A4","-"],_n={on:!1,bpm:104,step:0,next:0,boss:!1,calm:!0};function zi({on:n=_n.on,wave:e=1,boss:t=!1,calm:i=!1}={}){_n.on=n,_n.boss=t,_n.calm=i,_n.bpm=t?132:100+e*3}function bM(){_n.next=Nt.currentTime+.1,setInterval(()=>{if(!(!Nt||Nt.state!=="running"))for(;_n.next<Nt.currentTime+.15;)_n.on&&SM(_n.next,_n.step),_n.step++,_n.next+=60/_n.bpm/2},30)}function SM(n,e){let t=e%32;if(_n.boss){let s=MM[e%16];s!=="-"&&Ar(st[s]*(e%32>=16,1),n,.1),e%4===0&&qe(70,n,.25,{vol:.35,glide:.5,bus:Bn}),e%8===4&&rn(n,.12,{vol:.12,f:1800,q:.7,bus:Bn}),e%2===1&&rn(n,.03,{vol:.05,f:7e3,q:1,type:"highpass",bus:Bn}),e%16===0&&qe(st.A3/2,n,1.6,{type:"sawtooth",vol:.04,attack:.05,bus:Bn});return}let i=_M[t];i!=="-"&&!(_n.calm&&e%2)&&Ar(st[i],n,_n.calm?.07:.1),e%8===0&&qe(st[vM[(e/8|0)%4]]/2,n,.9,{type:"sine",vol:.18,bus:Bn}),!_n.calm&&(e%4===0&&qe(90,n,.18,{vol:.22,glide:.5,bus:Bn}),e%4===2&&(qe(1200,n,.05,{type:"square",vol:.025,bus:Bn}),rn(n,.04,{vol:.05,f:2600,q:6,bus:Bn})),e%16===14&&qe(1500,n,.04,{type:"square",vol:.02,bus:Bn}))}var Gp=[587,659,784,880,988,1175],Vp=0;function Zp(n,e=1){if(!Yp())return;let t=Math.max(Nt.currentTime,Vp),i=[...n].filter(s=>!/[\s，。！？、…～!?.,]/.test(s)).slice(0,12);i.forEach((s,r)=>{let a=Gp[(s.charCodeAt(0)+r)%Gp.length]*e;qe(a,t+r*.065,.06,{type:"sine",vol:.06,bus:Bc,glide:1.12})}),Vp=t+i.length*.065}var Wp=0,Xp=0,qp=0;function Hu(n){if(!Yp())return;let e=Nt.currentTime;switch(n){case"shoot":if(e-Wp<.05)return;Wp=e,qe(900,e,.06,{type:"square",vol:.03,glide:.5}),rn(e,.04,{vol:.04,f:4e3});break;case"hit":if(e-Xp<.03)return;Xp=e,qe(320+Math.random()*80,e,.05,{type:"triangle",vol:.05});break;case"kill":qe(520,e,.09,{type:"square",vol:.04,glide:1.6}),rn(e,.1,{vol:.06,f:1500});break;case"bossdown":[0,.12,.24,.36].forEach((t,i)=>Ar([st.C5,st.E5,st.G5,st.C6][i],e+t,.12,Hi)),qe(60,e,1.2,{vol:.4,glide:.5});break;case"gem":if(e-qp<.03)return;qp=e,qe(1400+Math.random()*400,e,.06,{type:"sine",vol:.03});break;case"levelup":[st.C5,st.E5,st.G5,st.C6].forEach((t,i)=>qe(t,e+i*.07,.25,{type:"triangle",vol:.07}));break;case"waveEnd":[st.G4,st.C5,st.E5,st.G5].forEach((t,i)=>Ar(t,e+i*.09,.1,Hi));break;case"win":[st.C5,st.D5,st.E5,st.G5,st.A5,st.C6].forEach((t,i)=>Ar(t,e+i*.12,.12,Hi));break;case"over":[st.A4,st.G4,st.E4,st.D4].forEach((t,i)=>qe(t,e+i*.18,.5,{type:"triangle",vol:.08}));break;case"hurt":qe(200,e,.18,{type:"sawtooth",vol:.07,glide:.5});break;case"dodge":rn(e,.15,{vol:.08,f:3e3,sweep:.3});break;case"shield":qe(1800,e,.2,{vol:.06,glide:.4}),rn(e,.2,{vol:.08,f:5e3});break;case"shieldUp":qe(1200,e,.15,{vol:.04,glide:1.5});break;case"aegis":[st.C5,st.G5,st.C6].forEach((t,i)=>qe(t,e+i*.1,.6,{type:"triangle",vol:.08}));break;case"sweet":qe(900,e,.4,{vol:.07,glide:1.8}),qe(1350,e+.05,.35,{vol:.04,glide:1.6});break;case"plant":qe(300,e,.08,{type:"square",vol:.04}),qe(300,e+.12,.08,{type:"square",vol:.04});break;case"boom":qe(80,e,.5,{vol:.4,glide:.4}),rn(e,.5,{vol:.25,f:900,type:"lowpass",sweep:.2});break;case"hubby":rn(e,.6,{vol:.15,f:600,sweep:4}),qe(440,e,.2,{type:"square",vol:.04}),qe(660,e+.12,.25,{type:"square",vol:.04});break;case"moo":qe(140,e,.6,{type:"sawtooth",vol:.06,glide:.7,attack:.08});break;case"baa":qe(420,e,.3,{type:"sawtooth",vol:.03,glide:.9});break;case"ult":rn(e,1.2,{vol:.2,f:300,sweep:10}),[st.A4,st.C5,st.E5,st.A5].forEach((t,i)=>qe(t,e+i*.06,1,{type:"sawtooth",vol:.035,attack:.02})),qe(55,e,1.2,{vol:.35,glide:.6});break;case"eshoot":qe(260,e,.08,{type:"square",vol:.025,glide:.7});break;case"ping":qe(1600,e,.08,{vol:.04}),qe(1600,e+.11,.08,{vol:.04});break;case"pingland":qe(500,e,.15,{type:"triangle",vol:.06,glide:.5});break;case"spit":qe(700,e,.08,{vol:.04,glide:.5});break;case"throw":rn(e,.2,{vol:.08,f:2500,sweep:.5});break;case"slam":qe(55,e,.45,{vol:.45,glide:.5}),rn(e,.3,{vol:.15,f:400,type:"lowpass"});break;case"reroll":rn(e,.25,{vol:.08,f:1500,sweep:3});break;case"pick":[st.E5,st.A5].forEach((t,i)=>qe(t,e+i*.06,.3,{type:"triangle",vol:.07}));break;case"star":qe(1800,e,.3,{vol:.05,glide:.3}),rn(e,.3,{vol:.1,f:3e3,sweep:.3});break;case"gallop":[0,.12,.3,.42].forEach(t=>qe(180,e+t,.06,{type:"triangle",vol:.08,glide:.6})),qe(520,e,.5,{type:"sawtooth",vol:.03,glide:1.4,attack:.05});break;case"streak":[st.A4,st.E5,st.A5].forEach(t=>qe(t,e,.9,{type:"sawtooth",vol:.035,attack:.02})),qe(st.A3/2,e,.9,{vol:.25,glide:.8}),rn(e,.4,{vol:.08,f:1200,sweep:3});break;case"elite":qe(98,e,1.4,{type:"sawtooth",vol:.06,attack:.05}),qe(147,e,1.4,{type:"sawtooth",vol:.04,attack:.05}),rn(e,1.2,{vol:.06,f:300,type:"lowpass"});break;case"pickup":[st.G5,st.C6,st.E5*2].forEach((t,i)=>qe(t,e+i*.05,.25,{type:"triangle",vol:.06}));break;case"chest":[st.C5,st.E5,st.G5,st.C6,st.E5*2].forEach((t,i)=>Ar(t,e+i*.07,.12,Hi)),qe(65,e,.8,{vol:.3,glide:.6});break;case"pickupSpawn":qe(2200,e,.15,{vol:.025,glide:1.3}),qe(2900,e+.06,.15,{vol:.02});break;case"rifle":rn(e,.06,{vol:.12,f:2500,q:.6}),qe(160,e,.05,{type:"square",vol:.04,glide:.5});break;case"flash":qe(3200,e,1.2,{vol:.03}),rn(e,.15,{vol:.15,f:5e3});break;case"tide":rn(e,1.4,{vol:.18,f:400,type:"lowpass",sweep:3}),rn(e+.3,1.2,{vol:.08,f:3e3,sweep:.4});break;case"bell":qe(2100,e,.5,{vol:.06}),qe(2100,e+.14,.6,{vol:.06}),qe(2650,e,.4,{vol:.02});break;case"click":qe(1e3,e,.04,{type:"triangle",vol:.04});break}}var Or=document.getElementById("scene"),Fr=matchMedia("(pointer: coarse)").matches&&Math.min(screen.width,screen.height)<=820,An=Bp(Or,{lowPower:Fr}),{scene:Pt,camera:Nn,renderer:TM}=An,ln=Hp(Pt),Kt=zp(Nn),ke=xp(),wM=["","\u5C0F\u69B4\u83B2\u3001\u59DC\u997C\u4EBA\u2026\u2026\u6A58\u5B50\u6765\u4E86\uFF01","\u5F90\u5C71\u7F8A\u5F00\u59CB\u51B2\u4E86\uFF0C\u4E01\u4E01\u8981\u62B1\u62B1","\u7532\u65B9\u4E59\u65B9\u5435\u4E0A\u95E8\u4E86\uFF0C\u5F80\u6614\u869D\u5728\u60F3\u5F53\u5E74","\u679C\u54E5\u5728\u95EE\u53F7\uFF0C\u5434\u6D69\u7136\u5728\u5077\u7CD6","\u5927\u6BDB\uFF08\u8D85\u5927\u53F7\uFF09\u6765\u4E86","\u5927\u6BDB\u4E00\u5BB6\u90FD\u6765\u4E86","\u4F60\u7684\u9F9F\u6628\u5929\u665A\u4E0A\u98CE\u597D\u5927","\u4ED6\u5E94\u8BE5\u4E0D\u4F1A\u4E0B\u5305\u7684","\u9EC4\u623F\u4E0A\u6CA1\u4EBA","\u6C89\u6BC5\u7F8A\uFF08\u6CD5\u5B98\uFF09\u5F00\u5EAD\u4E86"],AM=ei(wp()),vn=qn(AM);Pt.add(vn);var Br=new pe(new ft(.9,28,18),new It({color:"#7fd3ff",transparent:!0,opacity:.2,depthWrite:!1,blending:sn}));Br.position.y=.45;vn.add(Br);var ho=new pe(new Jn(.66,.78,40).rotateX(-Math.PI/2),new It({color:"#ff6fae",transparent:!0,opacity:.7,depthWrite:!1}));ho.position.y=.03;Pt.add(ho);var kr=new pe(new Jn(.97,1,64).rotateX(-Math.PI/2),new It({color:"#ffffff",transparent:!0,opacity:.12,depthWrite:!1}));kr.position.y=.025;Pt.add(kr);var zu={},Qp=n=>zu[n]||(zu[n]=ei(Ap(n))),Gi=qn(ei(Pu()));Gi.visible=!1;Pt.add(Gi);var em=ei(Du()),Ei=qn(em);Ei.visible=!1;Pt.add(Ei);var Vi=qn(ei(Lu()));Vi.visible=!1;Pt.add(Vi);var RM=ei(Pu()),gs=qn(ei(Nu())),oo=qn(RM);oo.position.set(-.5,.2,0);gs.userData.body.add(oo);gs.visible=!1;Pt.add(gs);var tm=ei(Rp()),nm=ei(Cp()),CM=ei(Ip()),qu=[],Yu=[];function Zc(n,e,t){for(;n.length<t;){let i=qn(e);Pt.add(i),n.push(i)}n.forEach((i,s)=>{i.visible=s<t})}var an=new nn;function Wi(n,e,t,i=!1){let s=new es(n,e,t);return s.count=0,s.castShadow=i,s.frustumCulled=!1,Pt.add(s),s}var Hc=Wi(new vt(.075,.34,4,8).rotateZ(Math.PI/2),wt("#ff8fcf",3.2),400),zc=Wi(Pp,Dp,900,!0),Rr={bolt:Wi(new ft(.17,12,8),wt("#ff7a2a",2.6),200),pearl:Wi(new ft(.16,14,10),ui("#fff7f2",{emissive:"#ffd9ec",emissiveIntensity:.8}),200),paper:Wi(new Ze(.42,.03,.32),N("#ffffff",{emissive:"#ffffff",emissiveIntensity:.3}),200,!0),hongbao:Wi(new Ze(.36,.05,.24),wt("#e0242f",1.4),200,!0),sausage:Wi(new vt(.1,.32,4,10).rotateZ(Math.PI/2),N("#a8382a"),200,!0),spear:Wi(new Le(.03,.03,1.1,6).rotateZ(Math.PI/2),N("#c9ced6"),100,!0)},Gu={},Ir=new Map,IM=new Jn(.85,1,48).rotateX(-Math.PI/2),PM={frenzy:"#ff3b3b",tough:"#7fd3ff",split:"#7CFC9A",boom:"#ff8a2a"},Pr=new Map,lo=[],DM=new Bt({transparent:!0,depthWrite:!1,side:qt,uniforms:{uTime:{value:0},uCol:{value:new Ue("#2f8fd6")},uA:{value:.6}},vertexShader:"varying vec2 vUv; uniform float uTime; void main(){ vUv = uv; vec3 p = position; p.y += sin(uv.x * 20.0 + uTime * 6.0) * 0.12 * uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }",fragmentShader:"varying vec2 vUv; uniform float uTime; uniform vec3 uCol; uniform float uA; void main(){ float foam = smoothstep(0.75, 1.0, vUv.y + sin(vUv.x * 40.0 + uTime * 8.0) * 0.05); vec3 c = mix(uCol, vec3(0.95, 1.0, 1.0), foam); gl_FragColor = vec4(c, uA * (0.35 + 0.65 * vUv.y)); }"}),Dr=new Map;function LM(n){let e=new ye,t=new pe(new mn(nt*2+2,1.8,60,4).rotateY(Math.PI/2).translate(0,.9,0),DM.clone());t.material.uniforms.uCol.value.set(n?"#3ad1c4":"#2a6fd6");let i=new pe(new mn(2.8,nt*2+2).rotateX(-Math.PI/2),new It({color:n?"#3ad1c4":"#2a6fd6",transparent:!0,opacity:.35,depthWrite:!1}));return i.position.y=.05,e.add(t,i),e.userData={wall:t,floor:i},Pt.add(e),e}var NM=new Le(.02,.02,1,4).rotateZ(Math.PI/2).translate(.5,0,0),UM=new It({color:"#ff2a2a",transparent:!0,opacity:.8,blending:sn,depthWrite:!1}),Gc=[],Vc=Wi((()=>{let n=new Ze(.75,.04,.14).rotateY(Math.PI/4),e=new Ze(.75,.04,.14).rotateY(-Math.PI/4),t=new Et,i=n.toNonIndexed().attributes.position.array,s=e.toNonIndexed().attributes.position.array,r=new Float32Array(i.length+s.length);return r.set(i),r.set(s,i.length),t.setAttribute("position",new Ht(r,3)),t.computeVertexNormals(),t})(),wt("#ff3b3b",2),200),FM={ping:"#ffd400",slam:"#ff3b3b",gavel:"#ff6a3b",flash:"#ffffff",boom:"#ff8a2a"},BM=new Mi(1,48).rotateX(-Math.PI/2),OM=new Jn(.93,1,48).rotateX(-Math.PI/2);function kM(n){let e=new ye,t=FM[n]||"#ff3b3b",i=new pe(BM,new It({color:t,transparent:!0,opacity:.28,depthWrite:!1})),s=new pe(OM,new It({color:t,transparent:!0,opacity:.85,depthWrite:!1}));return i.position.y=.04,s.position.y=.05,e.add(i,s),e.userData={fill:i,edge:s},Pt.add(e),e}var co=new ye;["durian","ginger","orange","dingding","oyster","goat","caesar","chenwei","jia","mao","guo","thief"].forEach((n,e,t)=>{let i=qn(Qp(n)),s=e/t.length*Math.PI*2;i.position.set(Math.cos(s)*4.6,0,Math.sin(s)*4.6),i.rotation.y=Math.atan2(Math.sin(s),-Math.cos(s))+Math.PI,i.userData.phase=e,co.add(i)});Pt.add(co);var Lr=new Map,Nr=new Map,Ur=new Map;function HM(){for(let n of Lr.values())Pt.remove(n);for(let n of Nr.values())Pt.remove(n);for(let n of Ur.values())Pt.remove(n);for(let n of Ir.values())Pt.remove(n);for(let n of Pr.values())Pt.remove(n);for(let n of Dr.values())Pt.remove(n);Lr.clear(),Nr.clear(),Ur.clear(),Ir.clear(),Pr.clear(),Dr.clear(),lo.forEach(n=>{n.visible=!1}),Gc.forEach(n=>{n.visible=!1})}var di=new Set,Wc={},Mn=(n,e=!0)=>{Wc[n]=e};addEventListener("keydown",n=>{ro();let e=n.code;["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e)&&n.preventDefault(),!n.repeat&&(di.add(e),e==="Space"&&Mn(ke.state==="play"?"ult":"start"),e==="Enter"&&Mn("start"),(e==="Escape"||e==="KeyP")&&Mn("pause"),ke.state==="pick"&&((e==="Digit1"||e==="Numpad1")&&Mn("pick",0),(e==="Digit2"||e==="Numpad2")&&Mn("pick",1),(e==="Digit3"||e==="Numpad3")&&Mn("pick",2),e==="KeyR"&&Mn("reroll")))});addEventListener("keyup",n=>di.delete(n.code));addEventListener("blur",()=>{di.clear(),cn.active=!1,Ns.hidden=!0,ke.state==="play"&&Mn("pause")});document.addEventListener("visibilitychange",()=>{document.hidden&&ke.state==="play"&&Mn("pause")});var Ns=document.getElementById("stick"),im=Ns.firstElementChild,cn={active:!1,id:null,ox:0,oy:0,x:0,y:0},Vu=!1;function zM(){Vu||(Vu=!0,requestAnimationFrame(()=>{Vu=!1,cn.active&&(im.style.transform=`translate(${cn.x*56}px, ${-cn.y*56}px)`)}))}Or.addEventListener("pointerdown",n=>{if(ro(),!(ke.state!=="play"||cn.active)){n.preventDefault(),Object.assign(cn,{active:!0,id:n.pointerId,ox:n.clientX,oy:n.clientY,x:0,y:0}),Ns.style.left=n.clientX+"px",Ns.style.top=n.clientY+"px",Ns.hidden=!1,im.style.transform="";try{Or.setPointerCapture(n.pointerId)}catch{}}},{passive:!1});Or.addEventListener("pointermove",n=>{if(!cn.active||n.pointerId!==cn.id)return;n.preventDefault();let e=n.clientX-cn.ox,t=n.clientY-cn.oy,i=Math.hypot(e,t),s=56;i>s&&(e*=s/i,t*=s/i),cn.x=e/s,cn.y=-t/s,zM()},{passive:!1});var sm=n=>{n.pointerId===cn.id&&(cn.active=!1,cn.x=cn.y=0,Ns.hidden=!0)};Or.addEventListener("pointerup",sm);Or.addEventListener("pointercancel",sm);function GM(){let n=0,e=0;return(di.has("KeyA")||di.has("ArrowLeft"))&&(n-=1),(di.has("KeyD")||di.has("ArrowRight"))&&(n+=1),(di.has("KeyW")||di.has("ArrowUp"))&&(e+=1),(di.has("KeyS")||di.has("ArrowDown"))&&(e-=1),cn.active&&(n+=cn.x,e+=cn.y),{mx:n,my:e}}var Hr=n=>document.getElementById(n),Xi=(n,e)=>Hr(n).addEventListener("click",t=>{t.stopPropagation(),ro(),Hu("click"),e()});Xi("startBtn",()=>Mn("start"));Xi("againBtn",()=>Mn("start"));Xi("winAgain",()=>Mn("start"));Xi("pauseBtn",()=>Mn("pause"));Xi("resumeBtn",()=>Mn("pause"));Xi("quitBtn",()=>{ke.state="title"});Xi("rerollBtn",()=>Mn("reroll"));Hr("ultBtn").addEventListener("pointerdown",n=>{n.stopPropagation(),n.preventDefault(),ro(),Mn("ult")});var $u=()=>{let n="\u58F0\u97F3\uFF1A"+(Oc()?"\u5173":"\u5F00");Hr("muteBtn").textContent=n,Hr("pauseMute").textContent=n};Xi("muteBtn",()=>{ku(!Oc()),$u()});Xi("pauseMute",()=>{ku(!Oc()),$u()});$u();var on={x:0,y:0,shake:0,zoom:1},Wu=.82;function VM(n,e){let t=Math.tan(Pn.degToRad(Nn.fov/2)),i=innerWidth,s=innerHeight;if(ke.state==="title"){let M=n*.12,g=s>i;Nn.position.set(Math.sin(M)*11,5.2,Math.cos(M)*11),Nn.lookAt(0,1.1,0),Nn.setViewOffset(i,s,g?0:-i*.2,g?s*.2:0,i,s),An.focus.set(0,0,0);return}Nn.view&&Nn.view.enabled&&Nn.clearViewOffset();let r=ke.hero,a=Pn.clamp(Math.max(5.6/t,4.6/(t*Nn.aspect)),12,26)*on.zoom,o=a*t*Nn.aspect,l=a*t/Math.sin(Wu),c=Pn.clamp(r.x+r.vx*12,-Math.max(0,Pe+1.5-o),Math.max(0,Pe+1.5-o)),h=Pn.clamp(r.y+r.vy*12,-Math.max(0,nt+1-l*.85),Math.max(0,nt+2.5-l*.85)),u=1-Math.exp(-e*6);on.x+=(c-on.x)*u,on.y+=(h-on.y)*u,on.shake*=Math.exp(-e*7);let d=on.shake*.5,f=(Math.random()-.5)*d,m=(Math.random()-.5)*d;Nn.position.set(on.x+f,a*Math.sin(Wu),-on.y+a*Math.cos(Wu)+m),Nn.lookAt(on.x+f*.5,0,-on.y+m*.5),An.focus.set(on.x,0,-on.y)}var Zu=(n,e,t)=>{let i=((e-n+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;return n+i*t},Cr=0,Xc=0;function WM(n){let e=ke.hero,t=vn.userData,i=e.ride>0,s=i&&e.mount==="bike";if(vn.position.set(e.x,i?s?.62:.95:0,-e.y),vn.rotation.y=Zu(vn.rotation.y,e.face,.18),Vi.visible=i&&!s,gs.visible=s,s){gs.position.set(e.x,0,-e.y),gs.rotation.y=vn.rotation.y;let l=Math.hypot(e.vx,e.vy);gs.userData.wheels.forEach(h=>{h.rotation.z-=l*3});let c=n*14;oo.userData.legs.forEach((h,u)=>{h.rotation.z=-1.2+Math.sin(c+u*Math.PI)*.5}),oo.userData.arms.forEach(h=>{h.rotation.z=-1.1}),oo.userData.body.rotation.z=-.15,vn.position.x+=Math.cos(e.face)*.3,vn.position.z-=Math.sin(e.face)*.3,Math.random()<.08&&ln.burst("dust",e.x-Math.cos(e.face)*1.1,e.y-Math.sin(e.face)*1.1,1,.1)}else if(i){Vi.position.set(e.x,0,-e.y),Vi.rotation.y=vn.rotation.y;let l=n*20;Vi.userData.legs.forEach((c,h)=>{c.rotation.z=Math.sin(l+(h<2?0:Math.PI)+h%2*.6)*.8}),Vi.userData.body.position.y=Math.abs(Math.sin(l))*.12,vn.position.y+=Vi.userData.body.position.y,Math.random()<.12&&ln.burst("dust",e.x-Math.cos(e.face)*.9,e.y-Math.sin(e.face)*.8,2,.1)}let r=e.moving?n*15:0;t.legs.forEach((l,c)=>{l.rotation.z=e.moving&&!i?Math.sin(r+(c%2?Math.PI:0)+(c>1?Math.PI:0))*.7:0}),t.body.position.y=e.moving?Math.abs(Math.sin(r))*.06:Math.sin(n*2.2)*.012,t.body.rotation.z=e.moving?-.06:0,t.head.rotation.z=Math.sin(n*2.2)*.04,t.head.rotation.y=e.moving?Math.sin(r*.5)*.08:Math.sin(n*.8)*.25,t.bow.rotation.x=Math.sin(n*3)*.1;let a=n%3.4<.12?.12:1;for(let l of t.eyes)l.scale.y=a;Br.material.color.set(e.bless>0?"#ffd35a":"#7fd3ff");let o=e.aim??e.face;t.gun.rotation.y=o-vn.rotation.y,Cr=Math.max(0,Cr-.12),t.barrel.position.x=-Cr*.12,t.flash.material.opacity=Cr,t.flash.scale.setScalar(.6+Cr),vn.visible=!(Xc>0&&Math.floor(n*24)%2),Xc>0&&Xc--,Br.visible=e.shields>0||e.bless>0,Br.material.opacity=.16+Math.sin(n*4)*.05,ho.position.set(e.x,.03,-e.y),kr.position.set(e.x,.025,-e.y),kr.scale.setScalar(e.s.pickup)}function XM(n,e,t){let i=n.userData,s=e.stun>0||e.web>0,r=s?0:e.t*.22;if(i.body.position.y=s?0:Math.abs(Math.sin(r))*.05,i.body.rotation.z=e.stun>0?Math.sin(t*25)*.15:0,i.legs&&i.legs.forEach((c,h)=>{c.rotation.z=s?0:Math.sin(r*1.6+h%2*Math.PI)*.6}),i.arms&&i.arms.forEach((c,h)=>{c.rotation.z=s?0:Math.sin(r*1.6+(h%2?0:Math.PI))*.5}),i.disc&&(i.disc.rotation.z-=s?0:.12,n.rotation.y=0),i.ball&&(i.ball.rotation.z=-(e.roll||0),i.body.position.y=0),i.man&&(n.rotation.y=0,i.man.rotation.z=s?0:Math.sin(r*1.8)*.22,i.body.position.y=s?0:Math.abs(Math.sin(r*1.8))*.12),i.spear&&(i.spear.position.x=e.throwT>0?.1+e.throwT*.02:.1),i.rifle&&(i.rifle.rotation.z=e.mode==="aim"||e.mode==="burst"?0:-.5),e.type==="dingding"&&i.head&&(i.head.rotation.z=Math.sin(t*3+e.id)*.12),e.type==="thief"&&i.arms&&e.skill!=null&&e.skill<20&&i.arms.forEach(c=>{c.rotation.z=-1.4}),i.hinge&&(i.hinge.rotation.z=e.open>0?.65:.06+Math.sin(t*3+e.id)*.06),i.fluff){let c=e.squash?1:1+Math.sin(r*1.3)*.07;i.fluff.scale.set(1/Math.sqrt(c),c,1/Math.sqrt(c))}if(i.sign&&(i.sign.rotation.z=Math.sin(t*4+e.id)*.12),i.sack&&i.sack.scale.setScalar(.8+Math.min(1.2,e.carry*.12)),e.type==="goat"&&(e.mode==="wind"?i.body.rotation.z=.25+Math.sin(t*40)*.05:e.mode==="dash"&&(i.body.rotation.z=-.2)),e.type==="judge"&&i.arm){let c=e.mode==="slam"||e.mode==="gavel"?1-e.modeT/50:0;i.arm.rotation.z=c?-1.6*c:Math.sin(t*2)*.15}i.cocoon.visible=e.web>0,e.web>0&&(i.cocoon.rotation.y+=.03);let a=Math.min(1,(t-n.userData.born)*4),o=a<1?1-Math.pow(1-a,3)*Math.cos(a*6):1,l=e.flash>0?1+e.flash*.03:1;n.scale.set(o*l,o/l,o*l).multiplyScalar((e.type==="bigmao"?2:1)*(e.elite?1.35:1))}function qM(n){var b;let e=ke.hero,t=new Set;for(let _ of ke.enemies){t.add(_.id);let x=Lr.get(_.id);x||(x=qn(Qp(_.type)),x.userData.born=n,Pt.add(x),Lr.set(_.id,x)),x.position.set(_.x,_.hop||0,-_.y);let S=_.face??Math.atan2(e.y-_.y,e.x-_.x);_.stun>0||_.web>0||(x.rotation.y=Zu(x.rotation.y,S,.15)),XM(x,_,n)}for(let[_,x]of Lr)t.has(_)||(Pt.remove(x),Lr.delete(_));let i=0;for(let _ of ke.bullets)an.position.set(_.x,.5,-_.y),an.rotation.set(0,Math.atan2(_.vy,_.vx),0),an.scale.setScalar(1),an.updateMatrix(),Hc.setMatrixAt(i++,an.matrix);Hc.count=i,Hc.instanceMatrix.needsUpdate=!0;let s={bolt:0,pearl:0,paper:0,hongbao:0,sausage:0,spear:0};for(let _ of ke.ebullets){let x=Rr[_.kind]||Rr.bolt,S=_.kind in s?_.kind:"bolt",T=_.kind==="paper"||_.kind==="hongbao";an.position.set(_.x,T?.6+Math.sin(n*6+_.id)*.1:.5,-_.y),an.rotation.set(T?.4:0,_.kind==="spear"?Math.atan2(_.vy,_.vx):T||_.kind==="sausage"?n*8+(_.spin||0):0,_.kind==="sausage"?n*10:0),an.scale.setScalar(_.kind==="spear"?1:1+Math.sin(n*12+_.id)*.1),an.updateMatrix(),x.setMatrixAt(s[S]++,an.matrix)}for(let _ in Rr)Rr[_].count=s[_],Rr[_].instanceMatrix.needsUpdate=!0;i=0;for(let _ of ke.gems)an.position.set(_.x,.22+Math.sin(n*4+_.id)*.06,-_.y),an.rotation.set(0,n*2+_.id,0),an.scale.setScalar(1),an.updateMatrix(),zc.setMatrixAt(i++,an.matrix);zc.count=Math.min(i,900),zc.instanceMatrix.needsUpdate=!0,i=0;for(let _ of ke.spawns){let x=.7+Math.abs(Math.sin(n*10))*.5;an.position.set(_.x,.05,-_.y),an.rotation.set(0,0,0),an.scale.setScalar(x*(_.type==="judge"||_.type==="bigmao"?3:1)),an.updateMatrix(),Vc.setMatrixAt(i++,an.matrix)}Vc.count=i,Vc.instanceMatrix.needsUpdate=!0;let r=new Set;for(let _ of ke.zones){r.add(_.id);let x=Nr.get(_.id);x||(x=kM(_.kind),Nr.set(_.id,x)),x.position.set(_.x,0,-_.y),x.scale.setScalar(_.r);let S=1-_.t/_.T;x.userData.fill.scale.setScalar(Math.max(.01,S)),x.userData.edge.material.opacity=.5+Math.abs(Math.sin(n*12))*.5}for(let[_,x]of Nr)r.has(_)||(Pt.remove(x),Nr.delete(_));let a=new Set;for(let _ of ke.bombs){a.add(_.id);let x=Ur.get(_.id);x||(x=qn(CM),Pt.add(x),Ur.set(_.id,x)),x.position.set(_.x,0,-_.y),x.userData.led.visible=Math.floor(n*(_.t<30?16:5))%2===0}for(let[_,x]of Ur)a.has(_)||(Pt.remove(x),Ur.delete(_));let o=ke.orbiters||[],l=o.filter(_=>_.kind==="wind"),c=o.filter(_=>_.kind==="dahong");Zc(qu,tm,l.length),l.forEach((_,x)=>{let S=qu[x];S.position.set(_.x,0,-_.y),S.userData.rings.forEach((T,A)=>{T.rotation.z=n*(6+A)*(A%2?1:-1),T.position.x=Math.sin(n*5+A)*.06*A}),S.userData.leaves.forEach((T,A)=>{let y=n*7+A*1.3;T.position.set(Math.cos(y)*(.3+A*.1),.3+A*.25,Math.sin(y)*(.3+A*.1)),T.rotation.set(y,y*2,0)})}),Zc(Yu,nm,c.length),c.forEach((_,x)=>{let S=Yu[x];S.position.set(_.x,0,-_.y),S.userData.box.rotation.set(n*2,n*3,0)});let h=ke.bull;if(Ei.visible=!!h,h){Ei.position.set(h.x,0,-h.y);let _=Math.hypot(h.vx,h.vy);_>.01&&(Ei.rotation.y=Zu(Ei.rotation.y,Math.atan2(h.vy,h.vx),.2));let x=n*(h.mode==="charge"?22:12);Ei.userData.legs.forEach((S,T)=>{S.rotation.z=_>.02?Math.sin(x+(T<2?0:Math.PI)+T%2*.5)*.7:0}),Ei.userData.body.rotation.z=h.mode==="charge"?-.12:0,Ei.userData.body.position.y=_>.02?Math.abs(Math.sin(x))*.1:0}let u=new Set;for(let _ of ke.enemies){if(!_.elite)continue;u.add(_.id);let x=Pr.get(_.id);x||(x=new pe(IM,new It({color:PM[_.elite],transparent:!0,opacity:.9,blending:sn,depthWrite:!1})),Pt.add(x),Pr.set(_.id,x)),x.position.set(_.x,.06+(_.hop||0),-_.y),x.scale.setScalar(_.r*(1.25+Math.sin(n*6)*.08)),x.rotation.y=n*2,Math.random()<.15&&ln.burst(_.elite==="tough"?"web":"gold",_.x,_.y,1,.2)}for(let[_,x]of Pr)u.has(_)||(Pt.remove(x),Pr.delete(_));let d=new Set;for(let _ of ke.pickups){d.add(_.id);let x=Ir.get(_.id);x||(x=qn(Gu[b=_.kind]||(Gu[b]=ei(Lp(_.kind)))),x.userData.born=n,Pt.add(x),Ir.set(_.id,x)),x.position.set(_.x,0,-_.y);let S=Math.min(1,(n-x.userData.born)*3);x.userData.icon.position.y=.75+Math.sin(n*3+_.id)*.12,x.userData.icon.rotation.y=n*1.6,x.userData.icon.scale.setScalar(S),x.userData.beam.material.opacity=.12+Math.sin(n*4)*.05,x.userData.ring.scale.setScalar(1+Math.sin(n*5)*.08),x.visible=_.t>180||Math.floor(n*8)%2===0}for(let[_,x]of Ir)d.has(_)||(Pt.remove(x),Ir.delete(_));let f=ke.stampede,m=f?f.bulls.length:0;for(;lo.length<m;){let _=qn(em);Pt.add(_),lo.push(_)}lo.forEach((_,x)=>{if(_.visible=x<m,x>=m)return;_.position.set(f.x+x%2*.6*-f.dir,0,-(f.y+f.bulls[x])),_.rotation.y=f.dir>0?0:Math.PI;let S=n*22+x;_.userData.legs.forEach((T,A)=>{T.rotation.z=Math.sin(S+(A<2?0:Math.PI))*.8}),_.userData.body.position.y=Math.abs(Math.sin(S))*.12,_.userData.body.rotation.z=-.12,Math.random()<.3&&ln.burst("dust",f.x,f.y+f.bulls[x],2,.1)});let M=new Set;for(let _ of ke.tides){M.add(_.id);let x=Dr.get(_.id);x||(x=LM(_.friendly),Dr.set(_.id,x));let S=_.warn>0;x.position.set(S?-_.dir*(Pe-.6):_.x,0,0),x.userData.wall.visible=!S,x.userData.wall.material.uniforms.uTime.value=n,x.userData.floor.material.opacity=S?.15+Math.abs(Math.sin(n*8))*.3:.35,!S&&Math.random()<.8&&ln.burst("web",_.x,(Math.random()*2-1)*nt,2,.3)}for(let[_,x]of Dr)M.has(_)||(Pt.remove(x),Dr.delete(_));let g=ke.enemies.filter(_=>_.type==="chenwei"&&_.mode==="aim");for(;Gc.length<g.length;){let _=new pe(NM,UM);Pt.add(_),Gc.push(_)}Gc.forEach((_,x)=>{if(_.visible=x<g.length,x>=g.length)return;let S=g[x],T=S.aimX-S.x,A=S.aimY-S.y;_.position.set(S.x,.95,-S.y),_.rotation.y=Math.atan2(A,T),_.scale.set(Math.hypot(T,A)+2,1,1)});let p=ke.hubbyRun;if(Gi.visible=!!p,p){Gi.position.set(p.x,0,-p.y),Gi.rotation.y=p.dir>0?0:Math.PI;let _=n*26;Gi.userData.legs.forEach((x,S)=>{x.rotation.z=Math.sin(_+S*Math.PI)*.9}),Gi.userData.arms.forEach((x,S)=>{x.rotation.z=Math.sin(_+(S?0:Math.PI))*1.1}),Gi.userData.body.rotation.z=-.25,Math.random()<.6&&ln.burst("dust",p.x-p.dir*.4,p.y,2,.1)}}function YM(n){co.visible=!0,vn.position.set(0,0,0),vn.rotation.y=n*.6;let e=vn.userData;e.body.position.y=Math.abs(Math.sin(n*3))*.12,e.legs.forEach((t,i)=>{t.rotation.z=Math.sin(n*6+i%2*Math.PI)*.5}),e.gun.rotation.y=Math.sin(n)*.8,e.head.rotation.y=Math.sin(n*.9)*.4,vn.visible=!0,Br.visible=!1,ho.visible=kr.visible=!1;for(let t of co.children){let i=t.userData.phase;t.userData.body.position.y=Math.abs(Math.sin(n*3+i))*.18,t.userData.legs&&t.userData.legs.forEach((s,r)=>{s.rotation.z=Math.sin(n*6+i+r%2*Math.PI)*.4}),t.userData.arms&&t.userData.arms.forEach((s,r)=>{s.rotation.z=Math.sin(n*5+i+r%2*Math.PI)*.8}),t.userData.hinge&&(t.userData.hinge.rotation.z=.1+Math.abs(Math.sin(n*2))*.4),t.userData.disc&&(t.userData.disc.rotation.z=-n*3),(t.userData.disc||t.userData.man)&&(t.rotation.y=Math.atan2(Nn.position.x-t.position.x,Nn.position.z-t.position.z))}}var qc=null;function rm(n){if(Kt.show(n),cn.active=!1,Ns.hidden=!0,n==="title"){HM(),Kt.clearLabels(),An.setDay(.35,!0),An.setSnow(!1),zi({on:!0,calm:!0}),Ei.visible=Gi.visible=Vi.visible=gs.visible=!1,lo.forEach(e=>{e.visible=!1}),Zc(qu,tm,0),Zc(Yu,nm,0);for(let e of[Hc,zc,Vc,...Object.values(Rr)])e.count=0}else co.visible=!1,ho.visible=kr.visible=!0;n==="pick"&&(Kt.resetPick(),zi({on:!0,calm:!0,wave:ke.wave})),n==="play"&&qc==="pick"&&zi({on:!0,wave:ke.wave,boss:ke.bossWave}),n==="pause"&&zi({on:!1}),n==="play"&&qc==="pause"&&zi({on:!0,wave:ke.wave,boss:ke.bossWave}),n==="over"&&(Kt.renderOver(ke),zi({on:!1})),n==="win"&&(Kt.renderWin(ke),zi({on:!0,calm:!0}),ln.burst("gold",ke.hero.x,ke.hero.y,80)),qc=n}function ZM(){for(let n of ke.events)switch(n.type){case"sfx":Hu(n.name);break;case"voice":Zp(n.text);break;case"pop":Kt.pop(n.x,n.y,n.text,n.cls);break;case"dmg":Kt.dmg(n.x,n.y,n.n,n.crit);break;case"burst":ln.burst(n.kind,n.x,n.y,n.n);break;case"ring":ln.ring(n.x,n.y,n.r,n.kind);break;case"shake":on.shake=Math.max(on.shake,n.amt);break;case"hurt":Kt.hurtFlash(),An.hurt(),Xc=36;break;case"flashbang":An.flash(1),Kt.toast("\u95EA\u5149\u5F39\uFF01","warn");break;case"hitstop":$c=Math.max($c,n.frames);break;case"streak":Kt.streak(n.text,n.n,n.tier),An.flash(.12);break;case"pickup":Kt.toast("\u62FE\u53D6 \xB7 "+n.text,"pickup",Uu[n.kind]),ln.ring(n.x,n.y,2.2,"voice");break;case"elite":Kt.toast(n.name+" \u51FA\u73B0\u4E86\uFF01","elite"),on.zoom=1.1;break;case"eliteDown":ln.burst("gold",n.x,n.y,50),ln.ring(n.x,n.y,3,"boom");break;case"tideWarn":Kt.banner("\u6F6E\u6C50\u6765\u4E86\uFF01",n.dir>0?"\u4ECE\u5DE6\u8FB9\u51B2\u8FC7\u6765 \u2192":"\u2190 \u4ECE\u53F3\u8FB9\u51B2\u8FC7\u6765",!1);break;case"stampede":Kt.toast("\u767D\u725B\u51B2\u950B\uFF01","pickup","#ffffff");break;case"waveEnd":An.flash(.25);break;case"cleanup":Kt.banner("\u6E05\u573A","\u6253\u5B8C\u573A\u4E0A\u7684\u654C\u4EBA\uFF0C\u518D\u9009\u6D77\u514B\u65AF");break;case"fire":Cr=1;break;case"ult":ln.superSpider(n.x,n.y),on.zoom=1.18;break;case"meteor":ln.meteor(n.x,n.y,n.t);break;case"horse":ln.burst("dust",ke.hero.x,ke.hero.y,20);break;case"wave":Kt.banner(n.boss?"BOSS":`\u7B2C ${n.n} \u6CE2`,wM[n.n],n.boss),An.setDay((n.n-1)/9),An.setSnow(n.n===5),zi({on:!0,wave:n.n,boss:n.boss});break;case"levelup":ln.burst("gold",ke.hero.x,ke.hero.y,30),ln.ring(ke.hero.x,ke.hero.y,1.6,"star"),Kt.pop(ke.hero.x,ke.hero.y,"\u5347\u7EA7\uFF01","big"),Kt.toast(`Lv ${n.lvl} \xB7 ${n.text}`,"level");break;case"shieldBreak":ln.burst("web",ke.hero.x,ke.hero.y,20);break;case"boss":on.zoom=1.25;break}ke.events.length=0}var Yc=Fr?0:2,kc=0,Xu=0;function $M(n){ke.state==="play"&&(n>1/40?kc++:n<1/58&&Xu++,!(kc+Xu<120)&&(kc>60&&Yc>(Fr?-1:0)&&(Yc--,An.setQuality(Yc),Jc()),kc=Xu=0))}function Jc(){An.resize(),ln.setScale(TM.domElement.height/(2*Math.tan(Pn.degToRad(Nn.fov/2))))}addEventListener("resize",Jc);Jc();var $p=performance.now(),ao=0,$c=0,Jp=0,Kp=0,jp=0;function am(n){requestAnimationFrame(am);let e=Math.min(.1,(n-$p)/1e3);$p=n;let t=n/1e3;ao+=e;let i=0;for(;ao>=1/Bi&&i<4;){if($c>0){$c--,ao-=1/Bi,i++;continue}let s=GM();vp(ke,{...s,pressed:{...Wc}});for(let r in Wc)delete Wc[r];ao-=1/Bi,i++,ke.state!==qc&&rm(ke.state),ZM()}i===4&&(ao=0),$M(e),on.zoom+=(1-on.zoom)*(1-Math.exp(-e*1.5)),ke.state==="title"?YM(t):ke.hero&&(WM(t),qM(t)),ke.state==="pick"&&ke.offer&&Kt.renderPick(ke,s=>{Mn("pick",s)}),ke.hero&&ke.state!=="title"&&(!Fr||n-Jp>=100)&&(Kt.hud(ke),Jp=n),(!Fr||n-Kp>=33)&&(Kt.updateLabels(ke),Kp=n),ln.update(),An.update(t,e),VM(t,e),(!Fr||n-jp>=33)&&(An.render(),jp=n)}rm("title");Hr("startBtn").disabled=!1;Hr("startBtn").textContent="\u5F00\u59CB";requestAnimationFrame(am);window.__xo={g:ke,ENEMY_NAMES:fs,setQuality:n=>{Yc=n,An.setQuality(n),Jc()}};})();
