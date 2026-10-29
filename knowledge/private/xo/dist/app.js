(()=>{var Jd=0,Gh=1,Kd=2;var Ua=1,Ul=2,vr=3,os=0,un=1,qt=2,jn=0,ls=1,sn=2,Vh=3,Wh=4,jd=5;var Cs=100,Qd=101,ef=102,tf=103,nf=104,sf=200,rf=201,af=202,of=203,Xh=204,qh=205,lf=206,cf=207,hf=208,uf=209,df=210,ff=211,pf=212,mf=213,gf=214,$o=0,Jo=1,Ko=2,sr=3,jo=4,Qo=5,el=6,tl=7,Yh=0,xf=1,yf=2,hi=0,Na=1,Fa=2,Ba=3,Is=4,Oa=5,ka=6,Ha=7;var Zh=300,cs=301,Ps=302,Nl=303,Fl=304,za=306,Ts=1e3,yi=1001,nl=1002,en=1003,_f=1004;var Ga=1005;var xn=1006,Bl=1007;var hs=1008;var Nn=1009,$h=1010,Jh=1011,Mr=1012,Ol=1013,ui=1014,Qn=1015,yn=1016,kl=1017,Hl=1018,br=1020,Kh=35902,jh=35899,Qh=1021,eu=1022,Fn=1023,_i=1026,us=1027,zl=1028,Gl=1029,ds=1030,Vl=1031;var Wl=1033,Va=33776,Wa=33777,Xa=33778,qa=33779,Xl=35840,ql=35841,Yl=35842,Zl=35843,$l=36196,Jl=37492,Kl=37496,jl=37488,Ql=37489,Ya=37490,ec=37491,tc=37808,nc=37809,ic=37810,sc=37811,rc=37812,ac=37813,oc=37814,lc=37815,cc=37816,hc=37817,uc=37818,dc=37819,fc=37820,pc=37821,mc=36492,gc=36494,xc=36495,yc=36283,_c=36284,Za=36285,vc=36286;var na=2300,il=2301,Yo=2302,Ch=2303,Ih=2400,Ph=2401,Dh=2402;var vf=3200;var $a=0,Mf=1,Bi="",hn="srgb",ia="srgb-linear",sa="linear",Ct="srgb";var Zo=7680;var bf=519,Sf=512,Ef=513,Tf=514,Mc=515,wf=516,Af=517,bc=518,Rf=519,Cf=35044;var tu="300 es",li=2e3,rr=2001;function Rm(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function Cm(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function ra(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function If(){let n=ra("canvas");return n.style.display="block",n}var pd={},ar=null;function nu(...n){let e="THREE."+n.shift();ar?ar("log",e,...n):console.log(e,...n)}function Pf(n){let e=n[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=n[1];t&&t.isStackTrace?n[0]+=" "+t.getLocation():n[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return n}function Je(...n){n=Pf(n);let e="THREE."+n.shift();if(ar)ar("warn",e,...n);else{let t=n[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...n)}}function tt(...n){n=Pf(n);let e="THREE."+n.shift();if(ar)ar("error",e,...n);else{let t=n[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...n)}}function Es(...n){let e=n.join(" ");e in pd||(pd[e]=!0,Je(...n))}function Df(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}var Lf={[$o]:Jo,[Ko]:el,[jo]:tl,[sr]:Qo,[Jo]:$o,[el]:Ko,[tl]:jo,[Qo]:sr},vi=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){let i=this._listeners;return i===void 0?!1:i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){let i=this._listeners;if(i===void 0)return;let s=i[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let i=t[e.type];if(i!==void 0){e.target=this;let s=i.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},Sn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],md=1234567,nr=Math.PI/180,or=180/Math.PI;function Ds(){let n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Sn[n&255]+Sn[n>>8&255]+Sn[n>>16&255]+Sn[n>>24&255]+"-"+Sn[e&255]+Sn[e>>8&255]+"-"+Sn[e>>16&15|64]+Sn[e>>24&255]+"-"+Sn[t&63|128]+Sn[t>>8&255]+"-"+Sn[t>>16&255]+Sn[t>>24&255]+Sn[i&255]+Sn[i>>8&255]+Sn[i>>16&255]+Sn[i>>24&255]).toLowerCase()}function dt(n,e,t){return Math.max(e,Math.min(t,n))}function iu(n,e){return(n%e+e)%e}function Im(n,e,t,i,s){return i+(n-e)*(s-i)/(t-e)}function Pm(n,e,t){return n!==e?(t-n)/(e-n):0}function Qr(n,e,t){return(1-t)*n+t*e}function Dm(n,e,t,i){return Qr(n,e,1-Math.exp(-t*i))}function Lm(n,e=1){return e-Math.abs(iu(n,e*2)-e)}function Um(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function Nm(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function Fm(n,e){return n+Math.floor(Math.random()*(e-n+1))}function Bm(n,e){return n+Math.random()*(e-n)}function Om(n){return n*(.5-Math.random())}function km(n){n!==void 0&&(md=n);let e=md+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Hm(n){return n*nr}function zm(n){return n*or}function Gm(n){return n>0&&Number.isInteger(n)&&2**Math.round(Math.log2(n))===n}function Vm(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function Wm(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function Xm(n,e,t,i,s){let r=Math.cos,a=Math.sin,o=r(t/2),l=a(t/2),c=r((e+i)/2),h=a((e+i)/2),u=r((e-i)/2),d=a((e-i)/2),f=r((i-e)/2),m=a((i-e)/2);switch(s){case"XYX":n.set(o*h,l*u,l*d,o*c);break;case"YZY":n.set(l*d,o*h,l*u,o*c);break;case"ZXZ":n.set(l*u,l*d,o*h,o*c);break;case"XZX":n.set(o*h,l*m,l*f,o*c);break;case"YXY":n.set(l*f,o*h,l*m,o*c);break;case"ZYZ":n.set(l*m,l*f,o*h,o*c);break;default:Je("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function tr(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:case Uint8ClampedArray:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function In(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Dn={DEG2RAD:nr,RAD2DEG:or,generateUUID:Ds,clamp:dt,euclideanModulo:iu,mapLinear:Im,inverseLerp:Pm,lerp:Qr,damp:Dm,pingpong:Lm,smoothstep:Um,smootherstep:Nm,randInt:Fm,randFloat:Bm,randFloatSpread:Om,seededRandom:km,degToRad:Hm,radToDeg:zm,isPowerOfTwo:Gm,ceilPowerOfTwo:Vm,floorPowerOfTwo:Wm,setQuaternionFromProperEuler:Xm,normalize:In,denormalize:tr},cu=class cu{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=dt(this.x,e.x,t.x),this.y=dt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=dt(this.x,e,t),this.y=dt(this.y,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(dt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(dt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*i-a*s+e.x,this.y=r*s+a*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};cu.prototype.isVector2=!0;var he=cu,Jn=class{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,a,o){let l=i[s+0],c=i[s+1],h=i[s+2],u=i[s+3],d=r[a+0],f=r[a+1],m=r[a+2],v=r[a+3];if(u!==v||l!==d||c!==f||h!==m){let x=l*d+c*f+h*m+u*v;x<0&&(d=-d,f=-f,m=-m,v=-v,x=-x);let p=1-o;if(x<.9995){let S=Math.acos(x),A=Math.sin(S);p=Math.sin(p*S)/A,o=Math.sin(o*S)/A,l=l*p+d*o,c=c*p+f*o,h=h*p+m*o,u=u*p+v*o}else{l=l*p+d*o,c=c*p+f*o,h=h*p+m*o,u=u*p+v*o;let S=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=S,c*=S,h*=S,u*=S}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,i,s,r,a){let o=i[s],l=i[s+1],c=i[s+2],h=i[s+3],u=r[a],d=r[a+1],f=r[a+2],m=r[a+3];return e[t]=o*m+h*u+l*f-c*d,e[t+1]=l*m+h*d+c*u-o*f,e[t+2]=c*m+h*f+o*d-l*u,e[t+3]=h*m-o*u-l*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let i=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(i/2),h=o(s/2),u=o(r/2),d=l(i/2),f=l(s/2),m=l(r/2);switch(a){case"XYZ":this._x=d*h*u+c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u-d*f*m;break;case"YXZ":this._x=d*h*u+c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u+d*f*m;break;case"ZXY":this._x=d*h*u-c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u-d*f*m;break;case"ZYX":this._x=d*h*u-c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u+d*f*m;break;case"YZX":this._x=d*h*u+c*f*m,this._y=c*f*u+d*h*m,this._z=c*h*m-d*f*u,this._w=c*h*u-d*f*m;break;case"XZY":this._x=d*h*u-c*f*m,this._y=c*f*u-d*h*m,this._z=c*h*m+d*f*u,this._w=c*h*u+d*f*m;break;default:Je("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,i=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],h=t[6],u=t[10],d=i+o+u;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(a-s)*f}else if(i>o&&i>u){let f=2*Math.sqrt(1+i-o-u);this._w=(h-l)/f,this._x=.25*f,this._y=(s+a)/f,this._z=(r+c)/f}else if(o>u){let f=2*Math.sqrt(1+o-i-u);this._w=(r-c)/f,this._x=(s+a)/f,this._y=.25*f,this._z=(l+h)/f}else{let f=2*Math.sqrt(1+u-i-o);this._w=(a-s)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<1e-8?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(dt(this.dot(e),-1,1)))}rotateTowards(e,t){let i=this.angleTo(e);if(i===0)return this;let s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let i=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,h=t._w;return this._x=i*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-i*c,this._z=r*h+a*c+i*l-s*o,this._w=a*h-i*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let i=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(i=-i,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){let c=Math.acos(o),h=Math.sin(c);l=Math.sin(l*c)/h,t=Math.sin(t*c)/h,this._x=this._x*l+i*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+i*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},hu=class hu{constructor(e=0,t=0,i=0){this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(gd.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(gd.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,i=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*i),h=2*(o*t-r*s),u=2*(r*i-a*t);return this.x=t+l*c+a*u-o*h,this.y=i+l*h+o*c-r*u,this.z=s+l*u+r*h-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=dt(this.x,e.x,t.x),this.y=dt(this.y,e.y,t.y),this.z=dt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=dt(this.x,e,t),this.y=dt(this.y,e,t),this.z=dt(this.z,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(dt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let i=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-i*l,this.z=i*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return ih.copy(this).projectOnVector(e),this.sub(ih)}reflect(e){return this.sub(ih.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let i=this.dot(e)/t;return Math.acos(dt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){let s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};hu.prototype.isVector3=!0;var D=hu,ih=new D,gd=new Jn,uu=class uu{constructor(e,t,i,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,a,o,l,c)}set(e,t,i,s,r,a,o,l,c){let h=this.elements;return h[0]=e,h[1]=s,h[2]=o,h[3]=t,h[4]=r,h[5]=l,h[6]=i,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,a=i[0],o=i[3],l=i[6],c=i[1],h=i[4],u=i[7],d=i[2],f=i[5],m=i[8],v=s[0],x=s[3],p=s[6],S=s[1],A=s[4],g=s[7],M=s[2],b=s[5],I=s[8];return r[0]=a*v+o*S+l*M,r[3]=a*x+o*A+l*b,r[6]=a*p+o*g+l*I,r[1]=c*v+h*S+u*M,r[4]=c*x+h*A+u*b,r[7]=c*p+h*g+u*I,r[2]=d*v+f*S+m*M,r[5]=d*x+f*A+m*b,r[8]=d*p+f*g+m*I,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8];return t*a*h-t*o*c-i*r*h+i*o*l+s*r*c-s*a*l}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=h*a-o*c,d=o*l-h*r,f=c*r-a*l,m=t*u+i*d+s*f;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let v=1/m;return e[0]=u*v,e[1]=(s*c-h*i)*v,e[2]=(o*i-s*a)*v,e[3]=d*v,e[4]=(h*t-s*l)*v,e[5]=(s*r-o*t)*v,e[6]=f*v,e[7]=(i*l-c*t)*v,e[8]=(a*t-i*r)*v,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return Es("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(sh.makeScale(e,t)),this}rotate(e){return Es("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(sh.makeRotation(-e)),this}translate(e,t){return Es("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(sh.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}};uu.prototype.isMatrix3=!0;var ot=uu,sh=new ot,xd=new ot().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),yd=new ot().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function qm(){let n={enabled:!0,workingColorSpace:ia,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===Ct&&(s.r=Ui(s.r),s.g=Ui(s.g),s.b=Ui(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===Ct&&(s.r=ir(s.r),s.g=ir(s.g),s.b=ir(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Bi?sa:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Es("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Es("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[ia]:{primaries:e,whitePoint:i,transfer:sa,toXYZ:xd,fromXYZ:yd,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:hn},outputColorSpaceConfig:{drawingBufferColorSpace:hn}},[hn]:{primaries:e,whitePoint:i,transfer:Ct,toXYZ:xd,fromXYZ:yd,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:hn}}}),n}var yt=qm();function Ui(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function ir(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var zs,sl=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let i;if(e instanceof HTMLCanvasElement)i=e;else{zs===void 0&&(zs=ra("canvas")),zs.width=e.width,zs.height=e.height;let s=zs.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),i=zs}return i.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=ra("canvas");t.width=e.width,t.height=e.height;let i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);let s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Ui(r[a]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(Ui(t[i]/255)*255):t[i]=Ui(t[i]);return{data:t,width:e.width,height:e.height}}else return Je("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Ym=0,lr=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Ym++}),this.uuid=Ds(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(rh(s[a].image)):r.push(rh(s[a]))}else r=rh(s);i.url=r}return t||(e.images[this.uuid]=i),i}};function rh(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?sl.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(Je("Texture: Unable to serialize Texture."),{})}var Zm=0,ah=new D,Pn=class n extends vi{constructor(e=n.DEFAULT_IMAGE,t=n.DEFAULT_MAPPING,i=yi,s=yi,r=xn,a=hs,o=Fn,l=Nn,c=n.DEFAULT_ANISOTROPY,h=Bi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Zm++}),this.uuid=Ds(),this.name="",this.source=new lr(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new he(0,0),this.repeat=new he(1,1),this.center=new he(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ot,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(ah).x}get height(){return this.source.getSize(ah).y}get depth(){return this.source.getSize(ah).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let i=e[t];if(i===void 0){Je(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Je(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Zh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ts:e.x=e.x-Math.floor(e.x);break;case yi:e.x=e.x<0?0:1;break;case nl:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Ts:e.y=e.y-Math.floor(e.y);break;case yi:e.y=e.y<0?0:1;break;case nl:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Pn.DEFAULT_IMAGE=null;Pn.DEFAULT_MAPPING=Zh;Pn.DEFAULT_ANISOTROPY=1;var du=class du{constructor(e=0,t=0,i=0,s=1){this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,i=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*i+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*i+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*i+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*i+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r,l=e.elements,c=l[0],h=l[4],u=l[8],d=l[1],f=l[5],m=l[9],v=l[2],x=l[6],p=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-v)<.01&&Math.abs(m-x)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+v)<.1&&Math.abs(m+x)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let A=(c+1)/2,g=(f+1)/2,M=(p+1)/2,b=(h+d)/4,I=(u+v)/4,y=(m+x)/4;return A>g&&A>M?A<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(A),s=b/i,r=I/i):g>M?g<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(g),i=b/s,r=y/s):M<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(M),i=I/r,s=y/r),this.set(i,s,r,t),this}let S=Math.sqrt((x-m)*(x-m)+(u-v)*(u-v)+(d-h)*(d-h));return Math.abs(S)<.001&&(S=1),this.x=(x-m)/S,this.y=(u-v)/S,this.z=(d-h)/S,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=dt(this.x,e.x,t.x),this.y=dt(this.y,e.y,t.y),this.z=dt(this.z,e.z,t.z),this.w=dt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=dt(this.x,e,t),this.y=dt(this.y,e,t),this.z=dt(this.z,e,t),this.w=dt(this.w,e,t),this}clampLength(e,t){let i=this.length();return this.divideScalar(i||1).multiplyScalar(dt(i,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};du.prototype.isVector4=!0;var Xt=du,rl=class extends vi{constructor(e=1,t=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:xn,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=i.depth,this.scissor=new Xt(0,0,e,t),this.scissorTest=!1,this.viewport=new Xt(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:i.depth},r=new Pn(s),a=i.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:xn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,i=e.textures.length;t<i;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new lr(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},tn=class extends rl{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}},aa=class extends Pn{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=en,this.minFilter=en,this.wrapR=yi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var al=class extends Pn{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=en,this.minFilter=en,this.wrapR=yi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var Ll=class Ll{constructor(e,t,i,s,r,a,o,l,c,h,u,d,f,m,v,x){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,a,o,l,c,h,u,d,f,m,v,x)}set(e,t,i,s,r,a,o,l,c,h,u,d,f,m,v,x){let p=this.elements;return p[0]=e,p[4]=t,p[8]=i,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=h,p[10]=u,p[14]=d,p[3]=f,p[7]=m,p[11]=v,p[15]=x,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ll().fromArray(this.elements)}copy(e){let t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){let t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),i.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,i=e.elements,s=1/Gs.setFromMatrixColumn(e,0).length(),r=1/Gs.setFromMatrixColumn(e,1).length(),a=1/Gs.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*a,t[9]=i[9]*a,t[10]=i[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,i=e.x,s=e.y,r=e.z,a=Math.cos(i),o=Math.sin(i),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){let d=a*h,f=a*u,m=o*h,v=o*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=f+m*c,t[5]=d-v*c,t[9]=-o*l,t[2]=v-d*c,t[6]=m+f*c,t[10]=a*l}else if(e.order==="YXZ"){let d=l*h,f=l*u,m=c*h,v=c*u;t[0]=d+v*o,t[4]=m*o-f,t[8]=a*c,t[1]=a*u,t[5]=a*h,t[9]=-o,t[2]=f*o-m,t[6]=v+d*o,t[10]=a*l}else if(e.order==="ZXY"){let d=l*h,f=l*u,m=c*h,v=c*u;t[0]=d-v*o,t[4]=-a*u,t[8]=m+f*o,t[1]=f+m*o,t[5]=a*h,t[9]=v-d*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let d=a*h,f=a*u,m=o*h,v=o*u;t[0]=l*h,t[4]=m*c-f,t[8]=d*c+v,t[1]=l*u,t[5]=v*c+d,t[9]=f*c-m,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let d=a*l,f=a*c,m=o*l,v=o*c;t[0]=l*h,t[4]=v-d*u,t[8]=m*u+f,t[1]=u,t[5]=a*h,t[9]=-o*h,t[2]=-c*h,t[6]=f*u+m,t[10]=d-v*u}else if(e.order==="XZY"){let d=a*l,f=a*c,m=o*l,v=o*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=d*u+v,t[5]=a*h,t[9]=f*u-m,t[2]=m*u-f,t[6]=o*h,t[10]=v*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose($m,e,Jm)}lookAt(e,t,i){let s=this.elements;return kn.subVectors(e,t),kn.lengthSq()===0&&(kn.z=1),kn.normalize(),Ji.crossVectors(i,kn),Ji.lengthSq()===0&&(Math.abs(i.z)===1?kn.x+=1e-4:kn.z+=1e-4,kn.normalize(),Ji.crossVectors(i,kn)),Ji.normalize(),yo.crossVectors(kn,Ji),s[0]=Ji.x,s[4]=yo.x,s[8]=kn.x,s[1]=Ji.y,s[5]=yo.y,s[9]=kn.y,s[2]=Ji.z,s[6]=yo.z,s[10]=kn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let i=e.elements,s=t.elements,r=this.elements,a=i[0],o=i[4],l=i[8],c=i[12],h=i[1],u=i[5],d=i[9],f=i[13],m=i[2],v=i[6],x=i[10],p=i[14],S=i[3],A=i[7],g=i[11],M=i[15],b=s[0],I=s[4],y=s[8],E=s[12],C=s[1],P=s[5],B=s[9],z=s[13],w=s[2],N=s[6],G=s[10],V=s[14],K=s[3],X=s[7],q=s[11],ne=s[15];return r[0]=a*b+o*C+l*w+c*K,r[4]=a*I+o*P+l*N+c*X,r[8]=a*y+o*B+l*G+c*q,r[12]=a*E+o*z+l*V+c*ne,r[1]=h*b+u*C+d*w+f*K,r[5]=h*I+u*P+d*N+f*X,r[9]=h*y+u*B+d*G+f*q,r[13]=h*E+u*z+d*V+f*ne,r[2]=m*b+v*C+x*w+p*K,r[6]=m*I+v*P+x*N+p*X,r[10]=m*y+v*B+x*G+p*q,r[14]=m*E+v*z+x*V+p*ne,r[3]=S*b+A*C+g*w+M*K,r[7]=S*I+A*P+g*N+M*X,r[11]=S*y+A*B+g*G+M*q,r[15]=S*E+A*z+g*V+M*ne,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],h=e[2],u=e[6],d=e[10],f=e[14],m=e[3],v=e[7],x=e[11],p=e[15],S=l*f-c*d,A=o*f-c*u,g=o*d-l*u,M=a*f-c*h,b=a*d-l*h,I=a*u-o*h;return t*(v*S-x*A+p*g)-i*(m*S-x*M+p*b)+s*(m*A-v*M+p*I)-r*(m*g-v*b+x*I)}determinantAffine(){let e=this.elements,t=e[0],i=e[4],s=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],h=e[10];return t*(a*h-o*c)-i*(r*h-o*l)+s*(r*c-a*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){let e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],h=e[8],u=e[9],d=e[10],f=e[11],m=e[12],v=e[13],x=e[14],p=e[15],S=t*o-i*a,A=t*l-s*a,g=t*c-r*a,M=i*l-s*o,b=i*c-r*o,I=s*c-r*l,y=h*v-u*m,E=h*x-d*m,C=h*p-f*m,P=u*x-d*v,B=u*p-f*v,z=d*p-f*x,w=S*z-A*B+g*P+M*C-b*E+I*y;if(w===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let N=1/w;return e[0]=(o*z-l*B+c*P)*N,e[1]=(s*B-i*z-r*P)*N,e[2]=(v*I-x*b+p*M)*N,e[3]=(d*b-u*I-f*M)*N,e[4]=(l*C-a*z-c*E)*N,e[5]=(t*z-s*C+r*E)*N,e[6]=(x*g-m*I-p*A)*N,e[7]=(h*I-d*g+f*A)*N,e[8]=(a*B-o*C+c*y)*N,e[9]=(i*C-t*B-r*y)*N,e[10]=(m*b-v*g+p*S)*N,e[11]=(u*g-h*b-f*S)*N,e[12]=(o*E-a*P-l*y)*N,e[13]=(t*P-i*E+s*y)*N,e[14]=(v*A-m*M-x*S)*N,e[15]=(h*M-u*A+d*S)*N,this}scale(e){let t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let i=Math.cos(t),s=Math.sin(t),r=1-i,a=e.x,o=e.y,l=e.z,c=r*a,h=r*o;return this.set(c*a+i,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+i,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,a){return this.set(1,i,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){let s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,h=a+a,u=o+o,d=r*c,f=r*h,m=r*u,v=a*h,x=a*u,p=o*u,S=l*c,A=l*h,g=l*u,M=i.x,b=i.y,I=i.z;return s[0]=(1-(v+p))*M,s[1]=(f+g)*M,s[2]=(m-A)*M,s[3]=0,s[4]=(f-g)*b,s[5]=(1-(d+p))*b,s[6]=(x+S)*b,s[7]=0,s[8]=(m+A)*I,s[9]=(x-S)*I,s[10]=(1-(d+v))*I,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return i.set(1,1,1),t.identity(),this;let a=Gs.set(s[0],s[1],s[2]).length(),o=Gs.set(s[4],s[5],s[6]).length(),l=Gs.set(s[8],s[9],s[10]).length();r<0&&(a=-a),si.copy(this);let c=1/a,h=1/o,u=1/l;return si.elements[0]*=c,si.elements[1]*=c,si.elements[2]*=c,si.elements[4]*=h,si.elements[5]*=h,si.elements[6]*=h,si.elements[8]*=u,si.elements[9]*=u,si.elements[10]*=u,t.setFromRotationMatrix(si),i.x=a,i.y=o,i.z=l,this}makePerspective(e,t,i,s,r,a,o=li,l=!1){let c=this.elements,h=2*r/(t-e),u=2*r/(i-s),d=(t+e)/(t-e),f=(i+s)/(i-s),m,v;if(l)m=r/(a-r),v=a*r/(a-r);else if(o===li)m=-(a+r)/(a-r),v=-2*a*r/(a-r);else if(o===rr)m=-a/(a-r),v=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=m,c[14]=v,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,i,s,r,a,o=li,l=!1){let c=this.elements,h=2/(t-e),u=2/(i-s),d=-(t+e)/(t-e),f=-(i+s)/(i-s),m,v;if(l)m=1/(a-r),v=a/(a-r);else if(o===li)m=-2/(a-r),v=-(a+r)/(a-r);else if(o===rr)m=-1/(a-r),v=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=m,c[14]=v,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){let i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}};Ll.prototype.isMatrix4=!0;var bt=Ll,Gs=new D,si=new bt,$m=new D(0,0,0),Jm=new D(1,1,1),Ji=new D,yo=new D,kn=new D,_d=new bt,vd=new Jn,Ni=class n{constructor(e=0,t=0,i=0,s=n.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],u=s[2],d=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(dt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-dt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(dt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-dt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(dt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-dt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Je("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return _d.makeRotationFromQuaternion(e),this.setFromRotationMatrix(_d,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return vd.setFromEuler(this),this.setFromQuaternion(vd,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Ni.DEFAULT_ORDER="XYZ";var oa=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},Km=0,Md=new D,Vs=new Jn,Ri=new bt,_o=new D,Xr=new D,jm=new D,Qm=new Jn,bd=new D(1,0,0),Sd=new D(0,1,0),Ed=new D(0,0,1),Td={type:"added"},e0={type:"removed"},Ws={type:"childadded",child:null},oh={type:"childremoved",child:null},nn=class n extends vi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Km++}),this.uuid=Ds(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let e=new D,t=new Ni,i=new Jn,s=new D(1,1,1);function r(){i.setFromEuler(t,!1)}function a(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new bt},normalMatrix:{value:new ot}}),this.matrix=new bt,this.matrixWorld=new bt,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new oa,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Vs.setFromAxisAngle(e,t),this.quaternion.multiply(Vs),this}rotateOnWorldAxis(e,t){return Vs.setFromAxisAngle(e,t),this.quaternion.premultiply(Vs),this}rotateX(e){return this.rotateOnAxis(bd,e)}rotateY(e){return this.rotateOnAxis(Sd,e)}rotateZ(e){return this.rotateOnAxis(Ed,e)}translateOnAxis(e,t){return Md.copy(e).applyQuaternion(this.quaternion),this.position.add(Md.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(bd,e)}translateY(e){return this.translateOnAxis(Sd,e)}translateZ(e){return this.translateOnAxis(Ed,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Ri.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?_o.copy(e):_o.set(e,t,i);let s=this.parent;this.updateWorldMatrix(!0,!1),Xr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ri.lookAt(Xr,_o,this.up):Ri.lookAt(_o,Xr,this.up),this.quaternion.setFromRotationMatrix(Ri),s&&(Ri.extractRotation(s.matrixWorld),Vs.setFromRotationMatrix(Ri),this.quaternion.premultiply(Vs.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(tt("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Td),Ws.child=e,this.dispatchEvent(Ws),Ws.child=null):tt("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(e0),oh.child=e,this.dispatchEvent(oh),oh.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Ri.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Ri.multiply(e.parent.matrixWorld)),e.applyMatrix4(Ri),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Td),Ws.child=e,this.dispatchEvent(Ws),Ws.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){let a=this.children[i].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Xr,e,jm),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Xr,Qm,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,i=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*i-r[8]*s,r[13]+=i-r[1]*t-r[5]*i-r[9]*s,r[14]+=s-r[2]*t-r[6]*i-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t,i=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),t===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,i)}}toJSON(e){let t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),h=a(e.images),u=a(e.shapes),d=a(e.skeletons),f=a(e.animations),m=a(e.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),u.length>0&&(i.shapes=u),d.length>0&&(i.skeletons=d),f.length>0&&(i.animations=f),m.length>0&&(i.nodes=m)}return i.object=s,i;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){let s=e.children[i];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};nn.DEFAULT_UP=new D(0,1,0);nn.DEFAULT_MATRIX_AUTO_UPDATE=!0;nn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var ye=class extends nn{constructor(){super(),this.isGroup=!0,this.type="Group"}},t0={type:"move"},cr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new ye,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new ye,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new D,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new D),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new ye,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new D,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new D,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(let v of e.hand.values()){let x=t.getJointPose(v,i),p=this._getHandJoint(c,v);x!==null&&(p.matrix.fromArray(x.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=x.radius),p.visible=x!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,m=.005;c.inputState.pinching&&d>f+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=f-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(t0)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let i=new ye;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}},Uf={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ki={h:0,s:0,l:0},vo={h:0,s:0,l:0};function lh(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}var Fe=class{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=hn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,yt.colorSpaceToWorking(this,t),this}setRGB(e,t,i,s=yt.workingColorSpace){return this.r=e,this.g=t,this.b=i,yt.colorSpaceToWorking(this,s),this}setHSL(e,t,i,s=yt.workingColorSpace){if(e=iu(e,1),t=dt(t,0,1),i=dt(i,0,1),t===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+t):i+t-i*t,a=2*i-r;this.r=lh(a,r,e+1/3),this.g=lh(a,r,e),this.b=lh(a,r,e-1/3)}return yt.colorSpaceToWorking(this,s),this}setStyle(e,t=hn){function i(r){r!==void 0&&parseFloat(r)<1&&Je("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Je("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Je("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=hn){let i=Uf[e.toLowerCase()];return i!==void 0?this.setHex(i,t):Je("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ui(e.r),this.g=Ui(e.g),this.b=Ui(e.b),this}copyLinearToSRGB(e){return this.r=ir(e.r),this.g=ir(e.g),this.b=ir(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=hn){return yt.workingToColorSpace(En.copy(this),e),Math.round(dt(En.r*255,0,255))*65536+Math.round(dt(En.g*255,0,255))*256+Math.round(dt(En.b*255,0,255))}getHexString(e=hn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=yt.workingColorSpace){yt.workingToColorSpace(En.copy(this),t);let i=En.r,s=En.g,r=En.b,a=Math.max(i,s,r),o=Math.min(i,s,r),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let u=a-o;switch(c=h<=.5?u/(a+o):u/(2-a-o),a){case i:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-i)/u+2;break;case r:l=(i-s)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=yt.workingColorSpace){return yt.workingToColorSpace(En.copy(this),t),e.r=En.r,e.g=En.g,e.b=En.b,e}getStyle(e=hn){yt.workingToColorSpace(En.copy(this),e);let t=En.r,i=En.g,s=En.b;return e!==hn?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(Ki),this.setHSL(Ki.h+e,Ki.s+t,Ki.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Ki),e.getHSL(vo);let i=Qr(Ki.h,vo.h,t),s=Qr(Ki.s,vo.s,t),r=Qr(Ki.l,vo.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},En=new Fe;Fe.NAMES=Uf;var la=class n{constructor(e,t=1,i=1e3){this.isFog=!0,this.name="",this.color=new Fe(e),this.near=t,this.far=i}clone(){return new n(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},ca=class extends nn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ni,this.environmentIntensity=1,this.environmentRotation=new Ni,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},ri=new D,Ci=new D,ch=new D,Ii=new D,Xs=new D,qs=new D,wd=new D,hh=new D,uh=new D,dh=new D,fh=new Xt,ph=new Xt,mh=new Xt,Li=class n{constructor(e=new D,t=new D,i=new D){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),ri.subVectors(e,t),s.cross(ri);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){ri.subVectors(s,t),Ci.subVectors(i,t),ch.subVectors(e,t);let a=ri.dot(ri),o=ri.dot(Ci),l=ri.dot(ch),c=Ci.dot(Ci),h=Ci.dot(ch),u=a*c-o*o;if(u===0)return r.set(0,0,0),null;let d=1/u,f=(c*l-o*h)*d,m=(a*h-o*l)*d;return r.set(1-f-m,m,f)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,Ii)===null?!1:Ii.x>=0&&Ii.y>=0&&Ii.x+Ii.y<=1}static getInterpolation(e,t,i,s,r,a,o,l){return this.getBarycoord(e,t,i,s,Ii)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Ii.x),l.addScaledVector(a,Ii.y),l.addScaledVector(o,Ii.z),l)}static getInterpolatedAttribute(e,t,i,s,r,a){return fh.setScalar(0),ph.setScalar(0),mh.setScalar(0),fh.fromBufferAttribute(e,t),ph.fromBufferAttribute(e,i),mh.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(fh,r.x),a.addScaledVector(ph,r.y),a.addScaledVector(mh,r.z),a}static isFrontFacing(e,t,i,s){return ri.subVectors(i,t),Ci.subVectors(e,t),ri.cross(Ci).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return ri.subVectors(this.c,this.b),Ci.subVectors(this.a,this.b),ri.cross(Ci).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return n.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return n.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return n.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return n.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return n.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let i=this.a,s=this.b,r=this.c,a,o;Xs.subVectors(s,i),qs.subVectors(r,i),hh.subVectors(e,i);let l=Xs.dot(hh),c=qs.dot(hh);if(l<=0&&c<=0)return t.copy(i);uh.subVectors(e,s);let h=Xs.dot(uh),u=qs.dot(uh);if(h>=0&&u<=h)return t.copy(s);let d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return a=l/(l-h),t.copy(i).addScaledVector(Xs,a);dh.subVectors(e,r);let f=Xs.dot(dh),m=qs.dot(dh);if(m>=0&&f<=m)return t.copy(r);let v=f*c-l*m;if(v<=0&&c>=0&&m<=0)return o=c/(c-m),t.copy(i).addScaledVector(qs,o);let x=h*m-f*u;if(x<=0&&u-h>=0&&f-m>=0)return wd.subVectors(r,s),o=(u-h)/(u-h+(f-m)),t.copy(s).addScaledVector(wd,o);let p=1/(x+v+d);return a=v*p,o=d*p,t.copy(i).addScaledVector(Xs,a).addScaledVector(qs,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Mi=class{constructor(e=new D(1/0,1/0,1/0),t=new D(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(ai.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(ai.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let i=ai.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let i=e.geometry;if(i!==void 0){let r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,ai):ai.fromBufferAttribute(r,a),ai.applyMatrix4(e.matrixWorld),this.expandByPoint(ai);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Mo.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Mo.copy(i.boundingBox)),Mo.applyMatrix4(e.matrixWorld),this.union(Mo)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,ai),ai.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(qr),bo.subVectors(this.max,qr),Ys.subVectors(e.a,qr),Zs.subVectors(e.b,qr),$s.subVectors(e.c,qr),ji.subVectors(Zs,Ys),Qi.subVectors($s,Zs),_s.subVectors(Ys,$s);let t=[0,-ji.z,ji.y,0,-Qi.z,Qi.y,0,-_s.z,_s.y,ji.z,0,-ji.x,Qi.z,0,-Qi.x,_s.z,0,-_s.x,-ji.y,ji.x,0,-Qi.y,Qi.x,0,-_s.y,_s.x,0];return!gh(t,Ys,Zs,$s,bo)||(t=[1,0,0,0,1,0,0,0,1],!gh(t,Ys,Zs,$s,bo))?!1:(So.crossVectors(ji,Qi),t=[So.x,So.y,So.z],gh(t,Ys,Zs,$s,bo))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,ai).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(ai).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Pi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Pi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Pi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Pi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Pi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Pi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Pi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Pi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Pi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Pi=[new D,new D,new D,new D,new D,new D,new D,new D],ai=new D,Mo=new Mi,Ys=new D,Zs=new D,$s=new D,ji=new D,Qi=new D,_s=new D,qr=new D,bo=new D,So=new D,vs=new D;function gh(n,e,t,i,s){for(let r=0,a=n.length-3;r<=a;r+=3){vs.fromArray(n,r);let o=s.x*Math.abs(vs.x)+s.y*Math.abs(vs.y)+s.z*Math.abs(vs.z),l=e.dot(vs),c=t.dot(vs),h=i.dot(vs);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var Qt=new D,Eo=new he,n0=0,Ht=class extends vi{constructor(e,t,i=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:n0++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=Cf,this.updateRanges=[],this.gpuType=Qn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Eo.fromBufferAttribute(this,t),Eo.applyMatrix3(e),this.setXY(t,Eo.x,Eo.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)Qt.fromBufferAttribute(this,t),Qt.applyMatrix3(e),this.setXYZ(t,Qt.x,Qt.y,Qt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)Qt.fromBufferAttribute(this,t),Qt.applyMatrix4(e),this.setXYZ(t,Qt.x,Qt.y,Qt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Qt.fromBufferAttribute(this,t),Qt.applyNormalMatrix(e),this.setXYZ(t,Qt.x,Qt.y,Qt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Qt.fromBufferAttribute(this,t),Qt.transformDirection(e),this.setXYZ(t,Qt.x,Qt.y,Qt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=tr(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=In(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=tr(t,this.array)),t}setX(e,t){return this.normalized&&(t=In(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=tr(t,this.array)),t}setY(e,t){return this.normalized&&(t=In(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=tr(t,this.array)),t}setZ(e,t){return this.normalized&&(t=In(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=tr(t,this.array)),t}setW(e,t){return this.normalized&&(t=In(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=In(t,this.array),i=In(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=In(t,this.array),i=In(i,this.array),s=In(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=In(t,this.array),i=In(i,this.array),s=In(s,this.array),r=In(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}};var ha=class extends Ht{constructor(e,t,i){super(new Uint16Array(e),t,i)}};var ua=class extends Ht{constructor(e,t,i){super(new Uint32Array(e),t,i)}};var it=class extends Ht{constructor(e,t,i){super(new Float32Array(e),t,i)}},i0=new Mi,Yr=new D,xh=new D,bi=class{constructor(e=new D,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let i=this.center;t!==void 0?i.copy(t):i0.setFromPoints(e).getCenter(i);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Yr.subVectors(e,this.center);let t=Yr.lengthSq();if(t>this.radius*this.radius){let i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(Yr,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(xh.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Yr.copy(e.center).add(xh)),this.expandByPoint(Yr.copy(e.center).sub(xh))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},s0=0,$n=new bt,yh=new nn,Js=new D,Hn=new Mi,Zr=new Mi,pn=new D,Et=class n extends vi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:s0++}),this.uuid=Ds(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Rm(e)?ua:ha)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new ot().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return $n.makeRotationFromQuaternion(e),this.applyMatrix4($n),this}rotateX(e){return $n.makeRotationX(e),this.applyMatrix4($n),this}rotateY(e){return $n.makeRotationY(e),this.applyMatrix4($n),this}rotateZ(e){return $n.makeRotationZ(e),this.applyMatrix4($n),this}translate(e,t,i){return $n.makeTranslation(e,t,i),this.applyMatrix4($n),this}scale(e,t,i){return $n.makeScale(e,t,i),this.applyMatrix4($n),this}lookAt(e){return yh.lookAt(e),yh.updateMatrix(),this.applyMatrix4(yh.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Js).negate(),this.translate(Js.x,Js.y,Js.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let i=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new it(i,3))}else{let i=Math.min(e.length,t.count);for(let s=0;s<i;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Je("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Mi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){tt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new D(-1/0,-1/0,-1/0),new D(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){let r=t[i];Hn.setFromBufferAttribute(r),this.morphTargetsRelative?(pn.addVectors(this.boundingBox.min,Hn.min),this.boundingBox.expandByPoint(pn),pn.addVectors(this.boundingBox.max,Hn.max),this.boundingBox.expandByPoint(pn)):(this.boundingBox.expandByPoint(Hn.min),this.boundingBox.expandByPoint(Hn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&tt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new bi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){tt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new D,1/0);return}if(e){let i=this.boundingSphere.center;if(Hn.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];Zr.setFromBufferAttribute(o),this.morphTargetsRelative?(pn.addVectors(Hn.min,Zr.min),Hn.expandByPoint(pn),pn.addVectors(Hn.max,Zr.max),Hn.expandByPoint(pn)):(Hn.expandByPoint(Zr.min),Hn.expandByPoint(Zr.max))}Hn.getCenter(i);let s=0;for(let r=0,a=e.count;r<a;r++)pn.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(pn));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)pn.fromBufferAttribute(o,c),l&&(Js.fromBufferAttribute(e,c),pn.add(Js)),s=Math.max(s,i.distanceToSquared(pn))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&tt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){tt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=t.position,s=t.normal,r=t.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==i.count)&&(a=new Ht(new Float32Array(4*i.count),4),this.setAttribute("tangent",a));let o=[],l=[];for(let y=0;y<i.count;y++)o[y]=new D,l[y]=new D;let c=new D,h=new D,u=new D,d=new he,f=new he,m=new he,v=new D,x=new D;function p(y,E,C){c.fromBufferAttribute(i,y),h.fromBufferAttribute(i,E),u.fromBufferAttribute(i,C),d.fromBufferAttribute(r,y),f.fromBufferAttribute(r,E),m.fromBufferAttribute(r,C),h.sub(c),u.sub(c),f.sub(d),m.sub(d);let P=1/(f.x*m.y-m.x*f.y);isFinite(P)&&(v.copy(h).multiplyScalar(m.y).addScaledVector(u,-f.y).multiplyScalar(P),x.copy(u).multiplyScalar(f.x).addScaledVector(h,-m.x).multiplyScalar(P),o[y].add(v),o[E].add(v),o[C].add(v),l[y].add(x),l[E].add(x),l[C].add(x))}let S=this.groups;S.length===0&&(S=[{start:0,count:e.count}]);for(let y=0,E=S.length;y<E;++y){let C=S[y],P=C.start,B=C.count;for(let z=P,w=P+B;z<w;z+=3)p(e.getX(z+0),e.getX(z+1),e.getX(z+2))}let A=new D,g=new D,M=new D,b=new D;function I(y){M.fromBufferAttribute(s,y),b.copy(M);let E=o[y];A.copy(E),A.sub(M.multiplyScalar(M.dot(E))).normalize(),g.crossVectors(b,E);let P=g.dot(l[y])<0?-1:1;a.setXYZW(y,A.x,A.y,A.z,P)}for(let y=0,E=S.length;y<E;++y){let C=S[y],P=C.start,B=C.count;for(let z=P,w=P+B;z<w;z+=3)I(e.getX(z+0)),I(e.getX(z+1)),I(e.getX(z+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==t.count)i=new Ht(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let d=0,f=i.count;d<f;d++)i.setXYZ(d,0,0,0);let s=new D,r=new D,a=new D,o=new D,l=new D,c=new D,h=new D,u=new D;if(e)for(let d=0,f=e.count;d<f;d+=3){let m=e.getX(d+0),v=e.getX(d+1),x=e.getX(d+2);s.fromBufferAttribute(t,m),r.fromBufferAttribute(t,v),a.fromBufferAttribute(t,x),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),o.fromBufferAttribute(i,m),l.fromBufferAttribute(i,v),c.fromBufferAttribute(i,x),o.add(h),l.add(h),c.add(h),i.setXYZ(m,o.x,o.y,o.z),i.setXYZ(v,l.x,l.y,l.z),i.setXYZ(x,c.x,c.y,c.z)}else for(let d=0,f=t.count;d<f;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),a.fromBufferAttribute(t,d+2),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),i.setXYZ(d+0,h.x,h.y,h.z),i.setXYZ(d+1,h.x,h.y,h.z),i.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)pn.fromBufferAttribute(e,t),pn.normalize(),e.setXYZ(t,pn.x,pn.y,pn.z)}toNonIndexed(){function e(o,l){let c=o.array,h=o.itemSize,u=o.normalized,d=new c.constructor(l.length*h),f=0,m=0;for(let v=0,x=l.length;v<x;v++){o.isInterleavedBufferAttribute?f=l[v]*o.data.stride+o.offset:f=l[v]*h;for(let p=0;p<h;p++)d[m++]=c[f++]}return new Ht(d,h,u)}if(this.index===null)return Je("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new n,i=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=e(l,i);t.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let h=0,u=c.length;h<u;h++){let d=c[h],f=e(d,i);l.push(f)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let i=this.attributes;for(let l in i){let c=i[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){let f=c[u];h.push(f.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let i=e.index;i!==null&&this.setIndex(i.clone());let s=e.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(t))}let r=e.morphAttributes;for(let c in r){let h=[],u=r[c];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let c=0,h=a.length;c<h;c++){let u=a[c];this.addGroup(u.start,u.count,u.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var _h=new D,r0=new D,a0=new ot,oi=class{constructor(e=new D(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){let s=_h.subVectors(i,t).cross(r0.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,i=!0){let s=e.delta(_h),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/r;return i===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let i=t||a0.getNormalMatrix(e),s=this.coplanarPoint(_h).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},o0=0,ci=class extends vi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:o0++}),this.uuid=Ds(),this.name="",this.type="Material",this.blending=ls,this.side=os,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Xh,this.blendDst=qh,this.blendEquation=Cs,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Fe(0,0,0),this.blendAlpha=0,this.depthFunc=sr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=bf,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Zo,this.stencilZFail=Zo,this.stencilZPass=Zo,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let i=e[t];if(i===void 0){Je(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Je(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector2&&i&&i.isVector2||s&&s.isEuler&&i&&i.isEuler||s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(i.textures=r),a.length>0&&(i.images=a)}return i}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Fe().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(i=>new oi().fromJSON(i))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let i=e.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new he().fromArray(i)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new he().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,i=null;if(t!==null){let s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var Di=new D,vh=new D,To=new D,wo=new D,hr=class{constructor(e=new D,t=new D(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Di)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Di.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Di.copy(this.origin).addScaledVector(this.direction,t),Di.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){vh.copy(e).add(t).multiplyScalar(.5),To.copy(t).sub(e).normalize(),wo.copy(this.origin).sub(vh);let r=e.distanceTo(t)*.5,a=-this.direction.dot(To),o=wo.dot(this.direction),l=-wo.dot(To),c=wo.lengthSq(),h=Math.abs(1-a*a),u,d,f,m;if(h>0)if(u=a*l-o,d=a*o-l,m=r*h,u>=0)if(d>=-m)if(d<=m){let v=1/h;u*=v,d*=v,f=u*(u+a*d+2*o)+d*(a*u+d+2*l)+c}else d=r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*l)+c;else d<=-m?(u=Math.max(0,-(-a*r+o)),d=u>0?-r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c):d<=m?(u=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(u=Math.max(0,-(a*r+o)),d=u>0?r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c);else d=a>0?-r:r,u=Math.max(0,-(a*d+o)),f=-u*u+d*(d+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(vh).addScaledVector(To,d),f}intersectSphere(e,t){if(e.radius<0)return null;Di.subVectors(e.center,this.origin);let i=Di.dot(this.direction),s=Di.dot(Di)-i*i,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=i-a,l=i+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){let i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,a,o,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(i=(e.min.x-d.x)*c,s=(e.max.x-d.x)*c):(i=(e.max.x-d.x)*c,s=(e.min.x-d.x)*c),h>=0?(r=(e.min.y-d.y)*h,a=(e.max.y-d.y)*h):(r=(e.max.y-d.y)*h,a=(e.min.y-d.y)*h),i>a||r>s||((r>i||isNaN(i))&&(i=r),(a<s||isNaN(s))&&(s=a),u>=0?(o=(e.min.z-d.z)*u,l=(e.max.z-d.z)*u):(o=(e.max.z-d.z)*u,l=(e.min.z-d.z)*u),i>l||o>s)||((o>i||i!==i)&&(i=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,Di)!==null}intersectTriangle(e,t,i,s,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,h=o.z,u=e.x-a.x,d=e.y-a.y,f=e.z-a.z,m=t.x-a.x,v=t.y-a.y,x=t.z-a.z,p=i.x-a.x,S=i.y-a.y,A=i.z-a.z,g=Math.abs(l),M=Math.abs(c),b=Math.abs(h),I,y,E,C,P,B,z,w,N,G,V,K;if(g>=M&&g>=b?(E=l,B=u,N=m,K=p,l>=0?(I=c,y=h,C=d,P=f,z=v,w=x,G=S,V=A):(I=h,y=c,C=f,P=d,z=x,w=v,G=A,V=S)):M>=b?(E=c,B=d,N=v,K=S,c>=0?(I=h,y=l,C=f,P=u,z=x,w=m,G=A,V=p):(I=l,y=h,C=u,P=f,z=m,w=x,G=p,V=A)):(E=h,B=f,N=x,K=A,h>=0?(I=l,y=c,C=u,P=d,z=m,w=v,G=p,V=S):(I=c,y=l,C=d,P=u,z=v,w=m,G=S,V=p)),E===0)return null;let X=I/E,q=y/E,ne=1/E,Ie=C-X*B,Ce=P-q*B,gt=z-X*N,Ye=w-q*N,ct=G-X*K,ee=V-q*K,ae=ct*Ye-ee*gt,ge=Ie*ee-Ce*ct,$e=gt*Ce-Ye*Ie;if(s){if(ae<0||ge<0||$e<0)return null}else if((ae<0||ge<0||$e<0)&&(ae>0||ge>0||$e>0))return null;let be=ae+ge+$e;if(be===0)return null;let Qe=ne*(ae*B+ge*N+$e*K);return(be>0?Qe<0:Qe>0)?null:this.at(Qe/be,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},It=class extends ci{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Fe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ni,this.combine=Yh,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Ad=new bt,Ms=new hr,Ao=new bi,Rd=new D,Ro=new D,Co=new D,Io=new D,Mh=new D,Po=new D,Cd=new D,Do=new D,pe=class extends nn{constructor(e=new Et,t=new It){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,a=i.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){Po.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=o[l],u=r[l];h!==0&&(Mh.fromBufferAttribute(u,e),a?Po.addScaledVector(Mh,h):Po.addScaledVector(Mh.sub(t),h))}t.add(Po)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Ao.copy(i.boundingSphere),Ao.applyMatrix4(r),Ms.copy(e.ray).recast(e.near),!(Ao.containsPoint(Ms.origin)===!1&&(Ms.intersectSphere(Ao,Rd)===null||Ms.origin.distanceToSquared(Rd)>(e.far-e.near)**2))&&(Ad.copy(r).invert(),Ms.copy(e.ray).applyMatrix4(Ad),!(i.boundingBox!==null&&Ms.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,Ms)))}_computeIntersections(e,t,i){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let m=0,v=d.length;m<v;m++){let x=d[m],p=a[x.materialIndex],S=Math.max(x.start,f.start),A=Math.min(o.count,Math.min(x.start+x.count,f.start+f.count));for(let g=S,M=A;g<M;g+=3){let b=o.getX(g),I=o.getX(g+1),y=o.getX(g+2);s=Lo(this,p,e,i,c,h,u,b,I,y),s&&(s.faceIndex=Math.floor(g/3),s.face.materialIndex=x.materialIndex,t.push(s))}}else{let m=Math.max(0,f.start),v=Math.min(o.count,f.start+f.count);for(let x=m,p=v;x<p;x+=3){let S=o.getX(x),A=o.getX(x+1),g=o.getX(x+2);s=Lo(this,a,e,i,c,h,u,S,A,g),s&&(s.faceIndex=Math.floor(x/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let m=0,v=d.length;m<v;m++){let x=d[m],p=a[x.materialIndex],S=Math.max(x.start,f.start),A=Math.min(l.count,Math.min(x.start+x.count,f.start+f.count));for(let g=S,M=A;g<M;g+=3){let b=g,I=g+1,y=g+2;s=Lo(this,p,e,i,c,h,u,b,I,y),s&&(s.faceIndex=Math.floor(g/3),s.face.materialIndex=x.materialIndex,t.push(s))}}else{let m=Math.max(0,f.start),v=Math.min(l.count,f.start+f.count);for(let x=m,p=v;x<p;x+=3){let S=x,A=x+1,g=x+2;s=Lo(this,a,e,i,c,h,u,S,A,g),s&&(s.faceIndex=Math.floor(x/3),t.push(s))}}}};function l0(n,e,t,i,s,r,a,o){let l;if(e.side===un?l=i.intersectTriangle(a,r,s,!0,o):l=i.intersectTriangle(s,r,a,e.side===os,o),l===null)return null;Do.copy(o),Do.applyMatrix4(n.matrixWorld);let c=t.ray.origin.distanceTo(Do);return c<t.near||c>t.far?null:{distance:c,point:Do.clone(),object:n}}function Lo(n,e,t,i,s,r,a,o,l,c){n.getVertexPosition(o,Ro),n.getVertexPosition(l,Co),n.getVertexPosition(c,Io);let h=l0(n,e,t,i,Ro,Co,Io,Cd);if(h){let u=new D;Li.getBarycoord(Cd,Ro,Co,Io,u),s&&(h.uv=Li.getInterpolatedAttribute(s,o,l,c,u,new he)),r&&(h.uv1=Li.getInterpolatedAttribute(r,o,l,c,u,new he)),a&&(h.normal=Li.getInterpolatedAttribute(a,o,l,c,u,new D),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let d={a:o,b:l,c,normal:new D,materialIndex:0};Li.getNormal(Ro,Co,Io,d.normal),h.face=d,h.barycoord=u}return h}var ws=class extends Pn{constructor(e=null,t=1,i=1,s,r,a,o,l,c=en,h=en,u,d){super(null,a,o,l,c,h,s,r,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var ur=class extends Ht{constructor(e,t,i,s=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},Ks=new bt,Id=new bt,Uo=[],Pd=new Mi,c0=new bt,$r=new pe,Jr=new bi,ts=class extends pe{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new ur(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<i;s++)this.setMatrixAt(s,c0)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Mi),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,Ks),Pd.copy(e.boundingBox).applyMatrix4(Ks),this.boundingBox.union(Pd)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new bi),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,Ks),Jr.copy(e.boundingSphere).applyMatrix4(Ks),this.boundingSphere.union(Jr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let i=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=i.length+1,a=e*r+1;for(let o=0;o<i.length;o++)i[o]=s[a+o]}raycast(e,t){let i=this.matrixWorld,s=this.count;if($r.geometry=this.geometry,$r.material=this.material,$r.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Jr.copy(this.boundingSphere),Jr.applyMatrix4(i),e.ray.intersectsSphere(Jr)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Ks),Id.multiplyMatrices(i,Ks),$r.matrixWorld=Id,$r.raycast(e,Uo);for(let a=0,o=Uo.length;a<o;a++){let l=Uo[a];l.instanceId=r,l.object=this,t.push(l)}Uo.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new ur(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let i=t.morphTargetInfluences,s=i.length+1;this.morphTexture===null&&(this.morphTexture=new ws(new Float32Array(s*this.count),s,this.count,zl,Qn));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<i.length;c++)a+=i[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=s*e;return r[l]=o,r.set(i,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},bs=new bi,h0=new he(.5,.5),No=new D,dr=class{constructor(e=new oi,t=new oi,i=new oi,s=new oi,r=new oi,a=new oi){this.planes=[e,t,i,s,r,a]}set(e,t,i,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(i),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=li,i=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],u=r[5],d=r[6],f=r[7],m=r[8],v=r[9],x=r[10],p=r[11],S=r[12],A=r[13],g=r[14],M=r[15];if(s[0].setComponents(c-a,f-h,p-m,M-S).normalize(),s[1].setComponents(c+a,f+h,p+m,M+S).normalize(),s[2].setComponents(c+o,f+u,p+v,M+A).normalize(),s[3].setComponents(c-o,f-u,p-v,M-A).normalize(),i)s[4].setComponents(l,d,x,g).normalize(),s[5].setComponents(c-l,f-d,p-x,M-g).normalize();else if(s[4].setComponents(c-l,f-d,p-x,M-g).normalize(),t===li)s[5].setComponents(c+l,f+d,p+x,M+g).normalize();else if(t===rr)s[5].setComponents(l,d,x,g).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),bs.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),bs.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(bs)}intersectsSprite(e){bs.center.set(0,0,0);let t=h0.distanceTo(e.center);return bs.radius=.7071067811865476+t,bs.applyMatrix4(e.matrixWorld),this.intersectsSphere(bs)}intersectsSphere(e){let t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let i=0;i<6;i++){let s=t[i];if(No.x=s.normal.x>0?e.max.x:e.min.x,No.y=s.normal.y>0?e.max.y:e.min.y,No.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(No)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var fr=class extends ci{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Fe(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},ol=new D,ll=new D,Dd=new bt,Kr=new hr,Fo=new bi,bh=new D,Ld=new D,cl=class extends nn{constructor(e=new Et,t=new fr){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,i=[0];for(let s=1,r=t.count;s<r;s++)ol.fromBufferAttribute(t,s-1),ll.fromBufferAttribute(t,s),i[s]=i[s-1],i[s]+=ol.distanceTo(ll);e.setAttribute("lineDistance",new it(i,1))}else Je("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let i=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Fo.copy(i.boundingSphere),Fo.applyMatrix4(s),Fo.radius+=r,e.ray.intersectsSphere(Fo)===!1)return;Dd.copy(s).invert(),Kr.copy(e.ray).applyMatrix4(Dd);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,h=i.index,d=i.attributes.position;if(h!==null){let f=Math.max(0,a.start),m=Math.min(h.count,a.start+a.count);for(let v=f,x=m-1;v<x;v+=c){let p=h.getX(v),S=h.getX(v+1),A=Bo(this,e,Kr,l,p,S,v);A&&t.push(A)}if(this.isLineLoop){let v=h.getX(m-1),x=h.getX(f),p=Bo(this,e,Kr,l,v,x,m-1);p&&t.push(p)}}else{let f=Math.max(0,a.start),m=Math.min(d.count,a.start+a.count);for(let v=f,x=m-1;v<x;v+=c){let p=Bo(this,e,Kr,l,v,v+1,v);p&&t.push(p)}if(this.isLineLoop){let v=Bo(this,e,Kr,l,m-1,f,m-1);v&&t.push(v)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Bo(n,e,t,i,s,r,a){let o=n.geometry.attributes.position;if(ol.fromBufferAttribute(o,s),ll.fromBufferAttribute(o,r),t.distanceSqToSegment(ol,ll,bh,Ld)>i)return;bh.applyMatrix4(n.matrixWorld);let c=e.ray.origin.distanceTo(bh);if(!(c<e.near||c>e.far))return{distance:c,point:Ld.clone().applyMatrix4(n.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:n}}var Ud=new D,Nd=new D,da=class extends cl{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,i=[];for(let s=0,r=t.count;s<r;s+=2)Ud.fromBufferAttribute(t,s),Nd.fromBufferAttribute(t,s+1),i[s]=s===0?0:i[s-1],i[s+1]=i[s]+Ud.distanceTo(Nd);e.setAttribute("lineDistance",new it(i,1))}else Je("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var hl=class extends ci{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Fe(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Fd=new bt,Lh=new hr,Oo=new bi,ko=new D,As=class extends nn{constructor(e=new Et,t=new hl){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let i=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Oo.copy(i.boundingSphere),Oo.applyMatrix4(s),Oo.radius+=r,e.ray.intersectsSphere(Oo)===!1)return;Fd.copy(s).invert(),Lh.copy(e.ray).applyMatrix4(Fd);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=i.index,u=i.attributes.position;if(c!==null){let d=Math.max(0,a.start),f=Math.min(c.count,a.start+a.count);for(let m=d,v=f;m<v;m++){let x=c.getX(m);ko.fromBufferAttribute(u,x),Bd(ko,x,l,s,e,t,this)}}else{let d=Math.max(0,a.start),f=Math.min(u.count,a.start+a.count);for(let m=d,v=f;m<v;m++)ko.fromBufferAttribute(u,m),Bd(ko,m,l,s,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){let s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Bd(n,e,t,i,s,r,a){let o=Lh.distanceSqToPoint(n);if(o<t){let l=new D;Lh.closestPointToPoint(n,l),l.applyMatrix4(i);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}var fa=class extends Pn{constructor(e=[],t=cs,i,s,r,a,o,l,c,h){super(e,t,i,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Fi=class extends Pn{constructor(e,t,i,s,r,a,o,l,c){super(e,t,i,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var ns=class extends Pn{constructor(e,t,i=ui,s,r,a,o=en,l=en,c,h=_i,u=1){if(h!==_i&&h!==us)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:e,height:t,depth:u};super(d,s,r,a,o,l,h,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new lr(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},ul=class extends ns{constructor(e,t=ui,i=cs,s,r,a=en,o=en,l,c=_i){let h={width:e,height:e,depth:1},u=[h,h,h,h,h,h];super(e,e,t,i,s,r,a,o,l,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},pa=class extends Pn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Ze=class n extends Et{constructor(e=1,t=1,i=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],h=[],u=[],d=0,f=0;m("z","y","x",-1,-1,i,t,e,a,r,0),m("z","y","x",1,-1,i,t,-e,a,r,1),m("x","z","y",1,1,e,i,t,s,a,2),m("x","z","y",1,-1,e,i,-t,s,a,3),m("x","y","z",1,-1,e,t,i,s,r,4),m("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(l),this.setAttribute("position",new it(c,3)),this.setAttribute("normal",new it(h,3)),this.setAttribute("uv",new it(u,2));function m(v,x,p,S,A,g,M,b,I,y,E){let C=g/I,P=M/y,B=g/2,z=M/2,w=b/2,N=I+1,G=y+1,V=0,K=0,X=new D;for(let q=0;q<G;q++){let ne=q*P-z;for(let Ie=0;Ie<N;Ie++){let Ce=Ie*C-B;X[v]=Ce*S,X[x]=ne*A,X[p]=w,c.push(X.x,X.y,X.z),X[v]=0,X[x]=0,X[p]=b>0?1:-1,h.push(X.x,X.y,X.z),u.push(Ie/I),u.push(1-q/y),V+=1}}for(let q=0;q<y;q++)for(let ne=0;ne<I;ne++){let Ie=d+ne+N*q,Ce=d+ne+N*(q+1),gt=d+(ne+1)+N*(q+1),Ye=d+(ne+1)+N*q;l.push(Ie,Ce,Ye),l.push(Ce,gt,Ye),K+=6}o.addGroup(f,K,E),f+=K,d+=V}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}},vt=class n extends Et{constructor(e=1,t=1,i=4,s=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:e,height:t,capSegments:i,radialSegments:s,heightSegments:r},t=Math.max(0,t),i=Math.max(1,Math.floor(i)),s=Math.max(3,Math.floor(s)),r=Math.max(1,Math.floor(r));let a=[],o=[],l=[],c=[],h=t/2,u=Math.PI/2*e,d=t,f=2*u+d,m=i*2+r,v=s+1,x=new D,p=new D;for(let S=0;S<=m;S++){let A=0,g=0,M=0,b=0;if(S<=i){let E=S/i,C=E*Math.PI/2;g=-h-e*Math.cos(C),M=e*Math.sin(C),b=-e*Math.cos(C),A=E*u}else if(S<=i+r){let E=(S-i)/r;g=-h+E*t,M=e,b=0,A=u+E*d}else{let E=(S-i-r)/i,C=E*Math.PI/2;g=h+e*Math.sin(C),M=e*Math.cos(C),b=e*Math.sin(C),A=u+d+E*u}let I=Math.max(0,Math.min(1,A/f)),y=0;S===0?y=.5/s:S===m&&(y=-.5/s);for(let E=0;E<=s;E++){let C=E/s,P=C*Math.PI*2,B=Math.sin(P),z=Math.cos(P);p.x=-M*z,p.y=g,p.z=M*B,o.push(p.x,p.y,p.z),x.set(-M*z,b,M*B),x.normalize(),l.push(x.x,x.y,x.z),c.push(C+y,I)}if(S>0){let E=(S-1)*v;for(let C=0;C<s;C++){let P=E+C,B=E+C+1,z=S*v+C,w=S*v+C+1;a.push(P,B,z),a.push(B,w,z)}}}this.setIndex(a),this.setAttribute("position",new it(o,3)),this.setAttribute("normal",new it(l,3)),this.setAttribute("uv",new it(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.height,e.capSegments,e.radialSegments,e.heightSegments)}},Si=class n extends Et{constructor(e=1,t=32,i=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:s},t=Math.max(3,t);let r=[],a=[],o=[],l=[],c=new D,h=new he;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let u=0,d=3;u<=t;u++,d+=3){let f=i+u/t*s;c.x=e*Math.cos(f),c.y=e*Math.sin(f),a.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(a[d]/e+1)/2,h.y=(a[d+1]/e+1)/2,l.push(h.x,h.y)}for(let u=1;u<=t;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new it(a,3)),this.setAttribute("normal",new it(o,3)),this.setAttribute("uv",new it(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.segments,e.thetaStart,e.thetaLength)}},Ue=class n extends Et{constructor(e=1,t=1,i=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],u=[],d=[],f=[],m=0,v=[],x=i/2,p=0;S(),a===!1&&(e>0&&A(!0),t>0&&A(!1)),this.setIndex(h),this.setAttribute("position",new it(u,3)),this.setAttribute("normal",new it(d,3)),this.setAttribute("uv",new it(f,2));function S(){let g=new D,M=new D,b=0,I=(t-e)/i;for(let y=0;y<=r;y++){let E=[],C=y/r,P=C*(t-e)+e;for(let B=0;B<=s;B++){let z=B/s,w=z*l+o,N=Math.sin(w),G=Math.cos(w);M.x=P*N,M.y=-C*i+x,M.z=P*G,u.push(M.x,M.y,M.z),g.set(N,I,G).normalize(),d.push(g.x,g.y,g.z),f.push(z,1-C),E.push(m++)}v.push(E)}for(let y=0;y<s;y++)for(let E=0;E<r;E++){let C=v[E][y],P=v[E+1][y],B=v[E+1][y+1],z=v[E][y+1];(e>0||E!==0)&&(h.push(C,P,z),b+=3),(t>0||E!==r-1)&&(h.push(P,B,z),b+=3)}c.addGroup(p,b,0),p+=b}function A(g){let M=m,b=new he,I=new D,y=0,E=g===!0?e:t,C=g===!0?1:-1;for(let B=1;B<=s;B++)u.push(0,x*C,0),d.push(0,C,0),f.push(.5,.5),m++;let P=m;for(let B=0;B<=s;B++){let w=B/s*l+o,N=Math.cos(w),G=Math.sin(w);I.x=E*G,I.y=x*C,I.z=E*N,u.push(I.x,I.y,I.z),d.push(0,C,0),b.x=N*.5+.5,b.y=G*.5*C+.5,f.push(b.x,b.y),m++}for(let B=0;B<s;B++){let z=M+B,w=P+B;g===!0?h.push(w,w+1,z):h.push(w+1,w,z),y+=3}c.addGroup(p,y,g===!0?1:2),p+=y}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},$t=class n extends Ue{constructor(e=1,t=1,i=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,i,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new n(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},dl=class n extends Et{constructor(e=[],t=[],i=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:s};let r=[],a=[];o(s),c(i),h(),this.setAttribute("position",new it(r,3)),this.setAttribute("normal",new it(r.slice(),3)),this.setAttribute("uv",new it(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(S){let A=new D,g=new D,M=new D;for(let b=0;b<t.length;b+=3)f(t[b+0],A),f(t[b+1],g),f(t[b+2],M),l(A,g,M,S)}function l(S,A,g,M){let b=M+1,I=[];for(let y=0;y<=b;y++){I[y]=[];let E=S.clone().lerp(g,y/b),C=A.clone().lerp(g,y/b),P=b-y;for(let B=0;B<=P;B++)B===0&&y===b?I[y][B]=E:I[y][B]=E.clone().lerp(C,B/P)}for(let y=0;y<b;y++)for(let E=0;E<2*(b-y)-1;E++){let C=Math.floor(E/2);E%2===0?(d(I[y][C+1]),d(I[y+1][C]),d(I[y][C])):(d(I[y][C+1]),d(I[y+1][C+1]),d(I[y+1][C]))}}function c(S){let A=new D;for(let g=0;g<r.length;g+=3)A.x=r[g+0],A.y=r[g+1],A.z=r[g+2],A.normalize().multiplyScalar(S),r[g+0]=A.x,r[g+1]=A.y,r[g+2]=A.z}function h(){let S=new D;for(let A=0;A<r.length;A+=3){S.x=r[A+0],S.y=r[A+1],S.z=r[A+2];let g=x(S)/2/Math.PI+.5,M=p(S)/Math.PI+.5;a.push(g,1-M)}m(),u()}function u(){for(let S=0;S<a.length;S+=6){let A=a[S+0],g=a[S+2],M=a[S+4],b=Math.max(A,g,M),I=Math.min(A,g,M);b>.9&&I<.1&&(A<.2&&(a[S+0]+=1),g<.2&&(a[S+2]+=1),M<.2&&(a[S+4]+=1))}}function d(S){r.push(S.x,S.y,S.z)}function f(S,A){let g=S*3;A.x=e[g+0],A.y=e[g+1],A.z=e[g+2]}function m(){let S=new D,A=new D,g=new D,M=new D,b=new he,I=new he,y=new he;for(let E=0,C=0;E<r.length;E+=9,C+=6){S.set(r[E+0],r[E+1],r[E+2]),A.set(r[E+3],r[E+4],r[E+5]),g.set(r[E+6],r[E+7],r[E+8]),b.set(a[C+0],a[C+1]),I.set(a[C+2],a[C+3]),y.set(a[C+4],a[C+5]),M.copy(S).add(A).add(g).divideScalar(3);let P=x(M);v(b,C+0,S,P),v(I,C+2,A,P),v(y,C+4,g,P)}}function v(S,A,g,M){M<0&&S.x===1&&(a[A]=S.x-1),g.x===0&&g.z===0&&(a[A]=M/2/Math.PI+.5)}function x(S){return Math.atan2(S.z,-S.x)}function p(S){return Math.atan2(-S.y,Math.sqrt(S.x*S.x+S.z*S.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.vertices,e.indices,e.radius,e.detail)}};var Ho=new D,zo=new D,Sh=new D,Go=new Li,ma=class extends Et{constructor(e=null,t=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:e,thresholdAngle:t},e!==null){let s=Math.pow(10,4),r=Math.cos(nr*t),a=e.getIndex(),o=e.getAttribute("position"),l=a?a.count:o.count,c=[0,0,0],h=["a","b","c"],u=new Array(3),d={},f=[];for(let m=0;m<l;m+=3){a?(c[0]=a.getX(m),c[1]=a.getX(m+1),c[2]=a.getX(m+2)):(c[0]=m,c[1]=m+1,c[2]=m+2);let{a:v,b:x,c:p}=Go;if(v.fromBufferAttribute(o,c[0]),x.fromBufferAttribute(o,c[1]),p.fromBufferAttribute(o,c[2]),Go.getNormal(Sh),u[0]=`${Math.round(v.x*s)},${Math.round(v.y*s)},${Math.round(v.z*s)}`,u[1]=`${Math.round(x.x*s)},${Math.round(x.y*s)},${Math.round(x.z*s)}`,u[2]=`${Math.round(p.x*s)},${Math.round(p.y*s)},${Math.round(p.z*s)}`,!(u[0]===u[1]||u[1]===u[2]||u[2]===u[0]))for(let S=0;S<3;S++){let A=(S+1)%3,g=u[S],M=u[A],b=Go[h[S]],I=Go[h[A]],y=`${g}_${M}`,E=`${M}_${g}`;E in d&&d[E]?(Sh.dot(d[E].normal)<=r&&(f.push(b.x,b.y,b.z),f.push(I.x,I.y,I.z)),d[E]=null):y in d||(d[y]={index0:c[S],index1:c[A],normal:Sh.clone()})}}for(let m in d)if(d[m]){let{index0:v,index1:x}=d[m];Ho.fromBufferAttribute(o,v),zo.fromBufferAttribute(o,x),f.push(Ho.x,Ho.y,Ho.z),f.push(zo.x,zo.y,zo.z)}this.setAttribute("position",new it(f,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}},zn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Je("Curve: .getPoint() not implemented.")}getPointAt(e,t){let i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){let t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],i,s=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)i=this.getPoint(a/e),r+=i.distanceTo(s),t.push(r),s=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let i=this.getLengths(),s=0,r=i.length,a;t?a=t:a=e*i[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=i[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,i[s]===a)return s/(r-1);let h=i[s],d=i[s+1]-h,f=(a-h)/d;return(s+f)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),l=t||(a.isVector2?new he:new D);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){let i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t=!1){let i=new D,s=[],r=[],a=[],o=new D,l=new bt;for(let f=0;f<=e;f++){let m=f/e;s[f]=this.getTangentAt(m,new D)}r[0]=new D,a[0]=new D;let c=Number.MAX_VALUE,h=Math.abs(s[0].x),u=Math.abs(s[0].y),d=Math.abs(s[0].z);h<=c&&(c=h,i.set(1,0,0)),u<=c&&(c=u,i.set(0,1,0)),d<=c&&i.set(0,0,1),o.crossVectors(s[0],i).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(s[f-1],s[f]),o.length()>Number.EPSILON){o.normalize();let m=Math.acos(dt(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(o,m))}a[f].crossVectors(s[f],r[f])}if(t===!0){let f=Math.acos(dt(r[0].dot(r[e]),-1,1));f/=e,s[0].dot(o.crossVectors(r[0],r[e]))>0&&(f=-f);for(let m=1;m<=e;m++)r[m].applyMatrix4(l.makeRotationAxis(s[m],f*m)),a[m].crossVectors(s[m],r[m])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},pr=class extends zn{constructor(e=0,t=0,i=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t=new he){let i=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+e*r,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*h-f*u+this.aX,c=d*u+f*h+this.aY}return i.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},fl=class extends pr{constructor(e,t,i,s,r,a){super(e,t,i,i,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function su(){let n=0,e=0,t=0,i=0;function s(r,a,o,l){n=r,e=o,t=-3*r+3*a-2*o-l,i=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,h,u){let d=(a-r)/c-(o-r)/(c+h)+(o-a)/h,f=(o-a)/h-(l-a)/(h+u)+(l-o)/u;d*=h,f*=h,s(a,o,d,f)},calc:function(r){let a=r*r,o=a*r;return n+e*r+t*a+i*o}}}var Od=new D,kd=new D,Eh=new su,Th=new su,wh=new su,pl=class extends zn{constructor(e=[],t=!1,i="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=s}getPoint(e,t=new D){let i=t,s=this.points,r=s.length,a=(r-(this.closed?0:1))*e,o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,h;this.closed||o>0?c=s[(o-1)%r]:(kd.subVectors(s[0],s[1]).add(s[0]),c=kd);let u=s[o%r],d=s[(o+1)%r];if(this.closed||o+2<r?h=s[(o+2)%r]:(Od.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=Od),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,m=Math.pow(c.distanceToSquared(u),f),v=Math.pow(u.distanceToSquared(d),f),x=Math.pow(d.distanceToSquared(h),f);v<1e-4&&(v=1),m<1e-4&&(m=v),x<1e-4&&(x=v),Eh.initNonuniformCatmullRom(c.x,u.x,d.x,h.x,m,v,x),Th.initNonuniformCatmullRom(c.y,u.y,d.y,h.y,m,v,x),wh.initNonuniformCatmullRom(c.z,u.z,d.z,h.z,m,v,x)}else this.curveType==="catmullrom"&&(Eh.initCatmullRom(c.x,u.x,d.x,h.x,this.tension),Th.initCatmullRom(c.y,u.y,d.y,h.y,this.tension),wh.initCatmullRom(c.z,u.z,d.z,h.z,this.tension));return i.set(Eh.calc(l),Th.calc(l),wh.calc(l)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(new D().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Hd(n,e,t,i,s){let r=(i-e)*.5,a=(s-t)*.5,o=n*n,l=n*o;return(2*t-2*i+r+a)*l+(-3*t+3*i-2*r-a)*o+r*n+t}function u0(n,e){let t=1-n;return t*t*e}function d0(n,e){return 2*(1-n)*n*e}function f0(n,e){return n*n*e}function ea(n,e,t,i){return u0(n,e)+d0(n,t)+f0(n,i)}function p0(n,e){let t=1-n;return t*t*t*e}function m0(n,e){let t=1-n;return 3*t*t*n*e}function g0(n,e){return 3*(1-n)*n*n*e}function x0(n,e){return n*n*n*e}function ta(n,e,t,i,s){return p0(n,e)+m0(n,t)+g0(n,i)+x0(n,s)}var ga=class extends zn{constructor(e=new he,t=new he,i=new he,s=new he){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new he){let i=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return i.set(ta(e,s.x,r.x,a.x,o.x),ta(e,s.y,r.y,a.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},ml=class extends zn{constructor(e=new D,t=new D,i=new D,s=new D){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new D){let i=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return i.set(ta(e,s.x,r.x,a.x,o.x),ta(e,s.y,r.y,a.y,o.y),ta(e,s.z,r.z,a.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},xa=class extends zn{constructor(e=new he,t=new he){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new he){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new he){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},gl=class extends zn{constructor(e=new D,t=new D){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new D){let i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new D){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ya=class extends zn{constructor(e=new he,t=new he,i=new he){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new he){let i=t,s=this.v0,r=this.v1,a=this.v2;return i.set(ea(e,s.x,r.x,a.x),ea(e,s.y,r.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},xl=class extends zn{constructor(e=new D,t=new D,i=new D){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new D){let i=t,s=this.v0,r=this.v1,a=this.v2;return i.set(ea(e,s.x,r.x,a.x),ea(e,s.y,r.y,a.y),ea(e,s.z,r.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},_a=class extends zn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new he){let i=t,s=this.points,r=(s.length-1)*e,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],h=s[a>s.length-2?s.length-1:a+1],u=s[a>s.length-3?s.length-1:a+2];return i.set(Hd(o,l.x,c.x,h.x,u.x),Hd(o,l.y,c.y,h.y,u.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){let s=e.points[t];this.points.push(new he().fromArray(s))}return this}},Uh=Object.freeze({__proto__:null,ArcCurve:fl,CatmullRomCurve3:pl,CubicBezierCurve:ga,CubicBezierCurve3:ml,EllipseCurve:pr,LineCurve:xa,LineCurve3:gl,QuadraticBezierCurve:ya,QuadraticBezierCurve3:xl,SplineCurve:_a}),yl=class extends zn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Uh[i](t,e))}return this}getPoint(e,t){let i=e*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=i){let a=s[r]-i,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let i=0,s=this.curves.length;i<s;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],i;for(let s=0,r=this.curves;s<r.length;s++){let a=r[s],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,l=a.getPoints(o);for(let c=0;c<l.length;c++){let h=l[c];i&&i.equals(h)||(t.push(h),i=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){let s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){let s=e.curves[t];this.curves.push(new Uh[s.type]().fromJSON(s))}return this}},va=class extends yl{constructor(e){super(),this.type="Path",this.currentPoint=new he,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let i=new xa(this.currentPoint.clone(),new he(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,s){let r=new ya(this.currentPoint.clone(),new he(e,t),new he(i,s));return this.curves.push(r),this.currentPoint.set(i,s),this}bezierCurveTo(e,t,i,s,r,a){let o=new ga(this.currentPoint.clone(),new he(e,t),new he(i,s),new he(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),i=new _a(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,s,r,a){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+o,t+l,i,s,r,a),this}absarc(e,t,i,s,r,a){return this.absellipse(e,t,i,i,s,r,a),this}ellipse(e,t,i,s,r,a,o,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,i,s,r,a,o,l),this}absellipse(e,t,i,s,r,a,o,l){let c=new pr(e,t,i,s,r,a,o,l);if(this.curves.length>0){let u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},mr=class extends va{constructor(e){super(e),this.uuid=Ds(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let i=0,s=this.holes.length;i<s;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){let s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){let s=e.holes[t];this.holes.push(new va().fromJSON(s))}return this}};function y0(n,e,t=2){let i=e&&e.length,s=i?e[0]*t:n.length,r=Nf(n,0,s,t,!0),a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(i&&(r=S0(n,e,r,t)),n.length>80*t){o=n[0],l=n[1];let h=o,u=l;for(let d=t;d<s;d+=t){let f=n[d],m=n[d+1];f<o&&(o=f),m<l&&(l=m),f>h&&(h=f),m>u&&(u=m)}c=Math.max(h-o,u-l),c=c!==0?32767/c:0}return Ma(r,a,t,o,l,c,0),a}function Nf(n,e,t,i,s){let r;if(s===U0(n,e,t,i)>0)for(let a=e;a<t;a+=i)r=zd(a/i|0,n[a],n[a+1],r);else for(let a=t-i;a>=e;a-=i)r=zd(a/i|0,n[a],n[a+1],r);return r&&gr(r,r.next)&&(Sa(r),r=r.next),r}function Rs(n,e){if(!n)return n;e||(e=n);let t=n,i;do if(i=!1,!t.steiner&&(gr(t,t.next)||Zt(t.prev,t,t.next)===0)){if(Sa(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function Ma(n,e,t,i,s,r,a){if(!n)return;!a&&r&&R0(n,i,s,r);let o=n;for(;n.prev!==n.next;){let l=n.prev,c=n.next;if(r?v0(n,i,s,r):_0(n)){e.push(l.i,n.i,c.i),Sa(n),n=c.next,o=c.next;continue}if(n=c,n===o){a?a===1?(n=M0(Rs(n),e),Ma(n,e,t,i,s,r,2)):a===2&&b0(n,e,t,i,s,r):Ma(Rs(n),e,t,i,s,r,1);break}}}function _0(n){let e=n.prev,t=n,i=n.next;if(Zt(e,t,i)>=0)return!1;let s=e.x,r=t.x,a=i.x,o=e.y,l=t.y,c=i.y,h=Math.min(s,r,a),u=Math.min(o,l,c),d=Math.max(s,r,a),f=Math.max(o,l,c),m=i.next;for(;m!==e;){if(m.x>=h&&m.x<=d&&m.y>=u&&m.y<=f&&jr(s,o,r,l,a,c,m.x,m.y)&&Zt(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function v0(n,e,t,i){let s=n.prev,r=n,a=n.next;if(Zt(s,r,a)>=0)return!1;let o=s.x,l=r.x,c=a.x,h=s.y,u=r.y,d=a.y,f=Math.min(o,l,c),m=Math.min(h,u,d),v=Math.max(o,l,c),x=Math.max(h,u,d),p=Nh(f,m,e,t,i),S=Nh(v,x,e,t,i),A=n.prevZ,g=n.nextZ;for(;A&&A.z>=p&&g&&g.z<=S;){if(A.x>=f&&A.x<=v&&A.y>=m&&A.y<=x&&A!==s&&A!==a&&jr(o,h,l,u,c,d,A.x,A.y)&&Zt(A.prev,A,A.next)>=0||(A=A.prevZ,g.x>=f&&g.x<=v&&g.y>=m&&g.y<=x&&g!==s&&g!==a&&jr(o,h,l,u,c,d,g.x,g.y)&&Zt(g.prev,g,g.next)>=0))return!1;g=g.nextZ}for(;A&&A.z>=p;){if(A.x>=f&&A.x<=v&&A.y>=m&&A.y<=x&&A!==s&&A!==a&&jr(o,h,l,u,c,d,A.x,A.y)&&Zt(A.prev,A,A.next)>=0)return!1;A=A.prevZ}for(;g&&g.z<=S;){if(g.x>=f&&g.x<=v&&g.y>=m&&g.y<=x&&g!==s&&g!==a&&jr(o,h,l,u,c,d,g.x,g.y)&&Zt(g.prev,g,g.next)>=0)return!1;g=g.nextZ}return!0}function M0(n,e){let t=n;do{let i=t.prev,s=t.next.next;!gr(i,s)&&Bf(i,t,t.next,s)&&ba(i,s)&&ba(s,i)&&(e.push(i.i,t.i,s.i),Sa(t),Sa(t.next),t=n=s),t=t.next}while(t!==n);return Rs(t)}function b0(n,e,t,i,s,r){let a=n;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&P0(a,o)){let l=Of(a,o);a=Rs(a,a.next),l=Rs(l,l.next),Ma(a,e,t,i,s,r,0),Ma(l,e,t,i,s,r,0);return}o=o.next}a=a.next}while(a!==n)}function S0(n,e,t,i){let s=[];for(let r=0,a=e.length;r<a;r++){let o=e[r]*i,l=r<a-1?e[r+1]*i:n.length,c=Nf(n,o,l,i,!1);c===c.next&&(c.steiner=!0),s.push(I0(c))}s.sort(E0);for(let r=0;r<s.length;r++)t=T0(s[r],t);return t}function E0(n,e){let t=n.x-e.x;if(t===0&&(t=n.y-e.y,t===0)){let i=(n.next.y-n.y)/(n.next.x-n.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=i-s}return t}function T0(n,e){let t=w0(n,e);if(!t)return e;let i=Of(t,n);return Rs(i,i.next),Rs(t,t.next)}function w0(n,e){let t=e,i=n.x,s=n.y,r=-1/0,a;if(gr(n,t))return t;do{if(gr(n,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){let u=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(u<=i&&u>r&&(r=u,a=t.x<t.next.x?t:t.next,u===i))return a}t=t.next}while(t!==e);if(!a)return null;let o=a,l=a.x,c=a.y,h=1/0;t=a;do{if(i>=t.x&&t.x>=l&&i!==t.x&&Ff(s<c?i:r,s,l,c,s<c?r:i,s,t.x,t.y)){let u=Math.abs(s-t.y)/(i-t.x);ba(t,n)&&(u<h||u===h&&(t.x>a.x||t.x===a.x&&A0(a,t)))&&(a=t,h=u)}t=t.next}while(t!==o);return a}function A0(n,e){return Zt(n.prev,n,e.prev)<0&&Zt(e.next,n,n.next)<0}function R0(n,e,t,i){let s=n;do s.z===0&&(s.z=Nh(s.x,s.y,e,t,i)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==n);s.prevZ.nextZ=null,s.prevZ=null,C0(s)}function C0(n){let e,t=1;do{let i=n,s;n=null;let r=null;for(e=0;i;){e++;let a=i,o=0;for(let c=0;c<t&&(o++,a=a.nextZ,!!a);c++);let l=t;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||i.z<=a.z)?(s=i,i=i.nextZ,o--):(s=a,a=a.nextZ,l--),r?r.nextZ=s:n=s,s.prevZ=r,r=s;i=a}r.nextZ=null,t*=2}while(e>1);return n}function Nh(n,e,t,i,s){return n=(n-t)*s|0,e=(e-i)*s|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,n|e<<1}function I0(n){let e=n,t=n;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==n);return t}function Ff(n,e,t,i,s,r,a,o){return(s-a)*(e-o)>=(n-a)*(r-o)&&(n-a)*(i-o)>=(t-a)*(e-o)&&(t-a)*(r-o)>=(s-a)*(i-o)}function jr(n,e,t,i,s,r,a,o){return!(n===a&&e===o)&&Ff(n,e,t,i,s,r,a,o)}function P0(n,e){return n.next.i!==e.i&&n.prev.i!==e.i&&!D0(n,e)&&(ba(n,e)&&ba(e,n)&&L0(n,e)&&(Zt(n.prev,n,e.prev)||Zt(n,e.prev,e))||gr(n,e)&&Zt(n.prev,n,n.next)>0&&Zt(e.prev,e,e.next)>0)}function Zt(n,e,t){return(e.y-n.y)*(t.x-e.x)-(e.x-n.x)*(t.y-e.y)}function gr(n,e){return n.x===e.x&&n.y===e.y}function Bf(n,e,t,i){let s=Wo(Zt(n,e,t)),r=Wo(Zt(n,e,i)),a=Wo(Zt(t,i,n)),o=Wo(Zt(t,i,e));return!!(s!==r&&a!==o||s===0&&Vo(n,t,e)||r===0&&Vo(n,i,e)||a===0&&Vo(t,n,i)||o===0&&Vo(t,e,i))}function Vo(n,e,t){return e.x<=Math.max(n.x,t.x)&&e.x>=Math.min(n.x,t.x)&&e.y<=Math.max(n.y,t.y)&&e.y>=Math.min(n.y,t.y)}function Wo(n){return n>0?1:n<0?-1:0}function D0(n,e){let t=n;do{if(t.i!==n.i&&t.next.i!==n.i&&t.i!==e.i&&t.next.i!==e.i&&Bf(t,t.next,n,e))return!0;t=t.next}while(t!==n);return!1}function ba(n,e){return Zt(n.prev,n,n.next)<0?Zt(n,e,n.next)>=0&&Zt(n,n.prev,e)>=0:Zt(n,e,n.prev)<0||Zt(n,n.next,e)<0}function L0(n,e){let t=n,i=!1,s=(n.x+e.x)/2,r=(n.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==n);return i}function Of(n,e){let t=Fh(n.i,n.x,n.y),i=Fh(e.i,e.x,e.y),s=n.next,r=e.prev;return n.next=e,e.prev=n,t.next=s,s.prev=t,i.next=t,t.prev=i,r.next=i,i.prev=r,i}function zd(n,e,t,i){let s=Fh(n,e,t);return i?(s.next=i.next,s.prev=i,i.next.prev=s,i.next=s):(s.prev=s,s.next=s),s}function Sa(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function Fh(n,e,t){return{i:n,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function U0(n,e,t,i){let s=0;for(let r=e,a=t-i;r<t;r+=i)s+=(n[a]-n[r])*(n[r+1]+n[a+1]),a=r;return s}var Bh=class{static triangulate(e,t,i=2){return y0(e,t,i)}},Ss=class n{static area(e){let t=e.length,i=0;for(let s=t-1,r=0;r<t;s=r++)i+=e[s].x*e[r].y-e[r].x*e[s].y;return i*.5}static isClockWise(e){return n.area(e)<0}static triangulateShape(e,t){let i=[],s=[],r=[];Gd(e),Vd(i,e);let a=e.length;t.forEach(Gd);for(let l=0;l<t.length;l++)s.push(a),a+=t[l].length,Vd(i,t[l]);let o=Bh.triangulate(i,s);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}};function Gd(n){let e=n.length;e>2&&n[e-1].equals(n[0])&&n.pop()}function Vd(n,e){for(let t=0;t<e.length;t++)n.push(e[t].x),n.push(e[t].y)}var Ea=class n extends Et{constructor(e=new mr([new he(.5,.5),new he(-.5,.5),new he(-.5,-.5),new he(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];let i=this,s=[],r=[];for(let o=0,l=e.length;o<l;o++){let c=e[o];a(c)}this.setAttribute("position",new it(s,3)),this.setAttribute("uv",new it(r,2)),this.computeVertexNormals();function a(o){let l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,u=t.depth!==void 0?t.depth:1,d=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,m=t.bevelSize!==void 0?t.bevelSize:f-.1,v=t.bevelOffset!==void 0?t.bevelOffset:0,x=t.bevelSegments!==void 0?t.bevelSegments:3,p=t.extrudePath,S=t.UVGenerator!==void 0?t.UVGenerator:N0,A,g=!1,M,b,I,y;if(p){A=p.getSpacedPoints(h),g=!0,d=!1;let oe=p.isCatmullRomCurve3?p.closed:!1;M=p.computeFrenetFrames(h,oe),b=new D,I=new D,y=new D}d||(x=0,f=0,m=0,v=0);let E=o.extractPoints(c),C=E.shape,P=E.holes;if(!Ss.isClockWise(C)){C=C.reverse();for(let oe=0,ue=P.length;oe<ue;oe++){let de=P[oe];Ss.isClockWise(de)&&(P[oe]=de.reverse())}}function z(oe){let de=10000000000000001e-36,fe=oe[0];for(let Me=1;Me<=oe.length;Me++){let ze=Me%oe.length,Ve=oe[ze],Ke=Ve.x-fe.x,et=Ve.y-fe.y,F=Ke*Ke+et*et,Rt=Math.max(Math.abs(Ve.x),Math.abs(Ve.y),Math.abs(fe.x),Math.abs(fe.y)),at=de*Rt*Rt;if(F<=at){oe.splice(ze,1),Me--;continue}fe=Ve}}z(C),P.forEach(z);let w=P.length,N=C;for(let oe=0;oe<w;oe++){let ue=P[oe];C=C.concat(ue)}function G(oe,ue,de){return ue||tt("ExtrudeGeometry: vec does not exist"),oe.clone().addScaledVector(ue,de)}let V=C.length;function K(oe,ue,de){let fe,Me,ze,Ve=oe.x-ue.x,Ke=oe.y-ue.y,et=de.x-oe.x,F=de.y-oe.y,Rt=Ve*Ve+Ke*Ke,at=Ve*F-Ke*et;if(Math.abs(at)>Number.EPSILON){let R=Math.sqrt(Rt),_=Math.sqrt(et*et+F*F),W=ue.x-Ke/R,$=ue.y+Ve/R,te=de.x-F/_,xe=de.y+et/_,ve=((te-W)*F-(xe-$)*et)/(Ve*F-Ke*et);fe=W+Ve*ve-oe.x,Me=$+Ke*ve-oe.y;let ie=fe*fe+Me*Me;if(ie<=2)return new he(fe,Me);ze=Math.sqrt(ie/2)}else{let R=!1;Ve>Number.EPSILON?et>Number.EPSILON&&(R=!0):Ve<-Number.EPSILON?et<-Number.EPSILON&&(R=!0):Math.sign(Ke)===Math.sign(F)&&(R=!0),R?(fe=-Ke,Me=Ve,ze=Math.sqrt(Rt)):(fe=Ve,Me=Ke,ze=Math.sqrt(Rt/2))}return new he(fe/ze,Me/ze)}let X=[];for(let oe=0,ue=N.length,de=ue-1,fe=oe+1;oe<ue;oe++,de++,fe++)de===ue&&(de=0),fe===ue&&(fe=0),X[oe]=K(N[oe],N[de],N[fe]);let q=[],ne,Ie=X.concat();for(let oe=0,ue=w;oe<ue;oe++){let de=P[oe];ne=[];for(let fe=0,Me=de.length,ze=Me-1,Ve=fe+1;fe<Me;fe++,ze++,Ve++)ze===Me&&(ze=0),Ve===Me&&(Ve=0),ne[fe]=K(de[fe],de[ze],de[Ve]);q.push(ne),Ie=Ie.concat(ne)}let Ce;if(x===0)Ce=Ss.triangulateShape(N,P);else{let oe=[],ue=[];for(let de=0;de<x;de++){let fe=de/x,Me=f*Math.cos(fe*Math.PI/2),ze=m*Math.sin(fe*Math.PI/2)+v;for(let Ve=0,Ke=N.length;Ve<Ke;Ve++){let et=G(N[Ve],X[Ve],ze);ge(et.x,et.y,-Me),fe===0&&oe.push(et)}for(let Ve=0,Ke=w;Ve<Ke;Ve++){let et=P[Ve];ne=q[Ve];let F=[];for(let Rt=0,at=et.length;Rt<at;Rt++){let R=G(et[Rt],ne[Rt],ze);ge(R.x,R.y,-Me),fe===0&&F.push(R)}fe===0&&ue.push(F)}}Ce=Ss.triangulateShape(oe,ue)}let gt=Ce.length,Ye=m+v;for(let oe=0;oe<V;oe++){let ue=d?G(C[oe],Ie[oe],Ye):C[oe];g?(I.copy(M.normals[0]).multiplyScalar(ue.x),b.copy(M.binormals[0]).multiplyScalar(ue.y),y.copy(A[0]).add(I).add(b),ge(y.x,y.y,y.z)):ge(ue.x,ue.y,0)}for(let oe=1;oe<=h;oe++)for(let ue=0;ue<V;ue++){let de=d?G(C[ue],Ie[ue],Ye):C[ue];g?(I.copy(M.normals[oe]).multiplyScalar(de.x),b.copy(M.binormals[oe]).multiplyScalar(de.y),y.copy(A[oe]).add(I).add(b),ge(y.x,y.y,y.z)):ge(de.x,de.y,u/h*oe)}for(let oe=x-1;oe>=0;oe--){let ue=oe/x,de=f*Math.cos(ue*Math.PI/2),fe=m*Math.sin(ue*Math.PI/2)+v;for(let Me=0,ze=N.length;Me<ze;Me++){let Ve=G(N[Me],X[Me],fe);ge(Ve.x,Ve.y,u+de)}for(let Me=0,ze=P.length;Me<ze;Me++){let Ve=P[Me];ne=q[Me];for(let Ke=0,et=Ve.length;Ke<et;Ke++){let F=G(Ve[Ke],ne[Ke],fe);g?ge(F.x,F.y+A[h-1].y,A[h-1].x+de):ge(F.x,F.y,u+de)}}}ct(),ee();function ct(){let oe=s.length/3;if(d){let ue=0,de=V*ue;for(let fe=0;fe<gt;fe++){let Me=Ce[fe];$e(Me[2]+de,Me[1]+de,Me[0]+de)}ue=h+x*2,de=V*ue;for(let fe=0;fe<gt;fe++){let Me=Ce[fe];$e(Me[0]+de,Me[1]+de,Me[2]+de)}}else{for(let ue=0;ue<gt;ue++){let de=Ce[ue];$e(de[2],de[1],de[0])}for(let ue=0;ue<gt;ue++){let de=Ce[ue];$e(de[0]+V*h,de[1]+V*h,de[2]+V*h)}}i.addGroup(oe,s.length/3-oe,0)}function ee(){let oe=s.length/3,ue=0;ae(N,ue),ue+=N.length;for(let de=0,fe=P.length;de<fe;de++){let Me=P[de];ae(Me,ue),ue+=Me.length}i.addGroup(oe,s.length/3-oe,1)}function ae(oe,ue){let de=oe.length;for(;--de>=0;){let fe=de,Me=de-1;Me<0&&(Me=oe.length-1);for(let ze=0,Ve=h+x*2;ze<Ve;ze++){let Ke=V*ze,et=V*(ze+1),F=ue+fe+Ke,Rt=ue+Me+Ke,at=ue+Me+et,R=ue+fe+et;be(F,Rt,at,R)}}}function ge(oe,ue,de){l.push(oe),l.push(ue),l.push(de)}function $e(oe,ue,de){Qe(oe),Qe(ue),Qe(de);let fe=s.length/3,Me=S.generateTopUV(i,s,fe-3,fe-2,fe-1);At(Me[0]),At(Me[1]),At(Me[2])}function be(oe,ue,de,fe){Qe(oe),Qe(ue),Qe(fe),Qe(ue),Qe(de),Qe(fe);let Me=s.length/3,ze=S.generateSideWallUV(i,s,Me-6,Me-3,Me-2,Me-1);At(ze[0]),At(ze[1]),At(ze[3]),At(ze[1]),At(ze[2]),At(ze[3])}function Qe(oe){s.push(l[oe*3+0]),s.push(l[oe*3+1]),s.push(l[oe*3+2])}function At(oe){r.push(oe.x),r.push(oe.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes,i=this.parameters.options;return F0(t,i,e)}static fromJSON(e,t){let i=[];for(let r=0,a=e.shapes.length;r<a;r++){let o=t[e.shapes[r]];i.push(o)}let s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new Uh[s.type]().fromJSON(s)),new n(i,e.options)}},N0={generateTopUV:function(n,e,t,i,s){let r=e[t*3],a=e[t*3+1],o=e[i*3],l=e[i*3+1],c=e[s*3],h=e[s*3+1];return[new he(r,a),new he(o,l),new he(c,h)]},generateSideWallUV:function(n,e,t,i,s,r){let a=e[t*3],o=e[t*3+1],l=e[t*3+2],c=e[i*3],h=e[i*3+1],u=e[i*3+2],d=e[s*3],f=e[s*3+1],m=e[s*3+2],v=e[r*3],x=e[r*3+1],p=e[r*3+2];return Math.abs(o-h)<Math.abs(a-c)?[new he(a,1-l),new he(c,1-u),new he(d,1-m),new he(v,1-p)]:[new he(o,1-l),new he(h,1-u),new he(f,1-m),new he(x,1-p)]}};function F0(n,e,t){if(t.shapes=[],Array.isArray(n))for(let i=0,s=n.length;i<s;i++){let r=n[i];t.shapes.push(r.uuid)}else t.shapes.push(n.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}var Gn=class n extends dl{constructor(e=1,t=0){let i=(1+Math.sqrt(5))/2,s=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new n(e.radius,e.detail)}},Ta=class n extends Et{constructor(e=[new he(0,-.5),new he(.5,0),new he(0,.5)],t=12,i=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:i,phiLength:s},t=Math.floor(t),s=dt(s,0,Math.PI*2);let r=[],a=[],o=[],l=[],c=[],h=1/t,u=new D,d=new he,f=new D,m=new D,v=new D,x=0,p=0;for(let S=0;S<=e.length-1;S++)switch(S){case 0:x=e[S+1].x-e[S].x,p=e[S+1].y-e[S].y,f.x=p*1,f.y=-x,f.z=p*0,v.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case e.length-1:l.push(v.x,v.y,v.z);break;default:x=e[S+1].x-e[S].x,p=e[S+1].y-e[S].y,f.x=p*1,f.y=-x,f.z=p*0,m.copy(f),f.x+=v.x,f.y+=v.y,f.z+=v.z,f.normalize(),l.push(f.x,f.y,f.z),v.copy(m)}for(let S=0;S<=t;S++){let A=i+S*h*s,g=Math.sin(A),M=Math.cos(A);for(let b=0;b<=e.length-1;b++){u.x=e[b].x*g,u.y=e[b].y,u.z=e[b].x*M,a.push(u.x,u.y,u.z),d.x=S/t,d.y=b/(e.length-1),o.push(d.x,d.y);let I=l[3*b+0]*g,y=l[3*b+1],E=l[3*b+0]*M;c.push(I,y,E)}}for(let S=0;S<t;S++)for(let A=0;A<e.length-1;A++){let g=A+S*e.length,M=g,b=g+e.length,I=g+e.length+1,y=g+1;r.push(M,b,y),r.push(I,y,b)}this.setIndex(r),this.setAttribute("position",new it(a,3)),this.setAttribute("uv",new it(o,2)),this.setAttribute("normal",new it(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.points,e.segments,e.phiStart,e.phiLength)}};var mn=class n extends Et{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(i),l=Math.floor(s),c=o+1,h=l+1,u=e/o,d=t/l,f=[],m=[],v=[],x=[];for(let p=0;p<h;p++){let S=p*d-a;for(let A=0;A<c;A++){let g=A*u-r;m.push(g,-S,0),v.push(0,0,1),x.push(A/o),x.push(1-p/l)}}for(let p=0;p<l;p++)for(let S=0;S<o;S++){let A=S+c*p,g=S+c*(p+1),M=S+1+c*(p+1),b=S+1+c*p;f.push(A,g,b),f.push(g,M,b)}this.setIndex(f),this.setAttribute("position",new it(m,3)),this.setAttribute("normal",new it(v,3)),this.setAttribute("uv",new it(x,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.width,e.height,e.widthSegments,e.heightSegments)}},Kn=class n extends Et{constructor(e=.5,t=1,i=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:s,thetaStart:r,thetaLength:a},i=Math.max(3,i),s=Math.max(1,s);let o=[],l=[],c=[],h=[],u=e,d=(t-e)/s,f=new D,m=new he;for(let v=0;v<=s;v++){for(let x=0;x<=i;x++){let p=r+x/i*a;f.x=u*Math.cos(p),f.y=u*Math.sin(p),l.push(f.x,f.y,f.z),c.push(0,0,1),m.x=(f.x/t+1)/2,m.y=(f.y/t+1)/2,h.push(m.x,m.y)}u+=d}for(let v=0;v<s;v++){let x=v*(i+1);for(let p=0;p<i;p++){let S=p+x,A=S,g=S+i+1,M=S+i+2,b=S+1;o.push(A,g,b),o.push(g,M,b)}}this.setIndex(o),this.setAttribute("position",new it(l,3)),this.setAttribute("normal",new it(c,3)),this.setAttribute("uv",new it(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}};var ft=class n extends Et{constructor(e=1,t=32,i=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));let l=Math.min(a+o,Math.PI),c=0,h=[],u=new D,d=new D,f=[],m=[],v=[],x=[];for(let p=0;p<=i;p++){let S=[],A=p/i,g=a+A*o,M=e*Math.cos(g),b=Math.sqrt(e*e-M*M),I=0;p===0&&a===0?I=.5/t:p===i&&l===Math.PI&&(I=-.5/t);for(let y=0;y<=t;y++){let E=y/t,C=s+E*r;u.x=-b*Math.cos(C),u.y=M,u.z=b*Math.sin(C),m.push(u.x,u.y,u.z),d.copy(u).normalize(),v.push(d.x,d.y,d.z),x.push(E+I,1-A),S.push(c++)}h.push(S)}for(let p=0;p<i;p++)for(let S=0;S<t;S++){let A=h[p][S+1],g=h[p][S],M=h[p+1][S],b=h[p+1][S+1];(p!==0||a>0)&&f.push(A,g,b),(p!==i-1||l<Math.PI)&&f.push(g,M,b)}this.setIndex(f),this.setAttribute("position",new it(m,3)),this.setAttribute("normal",new it(v,3)),this.setAttribute("uv",new it(x,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var Tt=class n extends Et{constructor(e=1,t=.4,i=12,s=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:s,arc:r,thetaStart:a,thetaLength:o},i=Math.floor(i),s=Math.floor(s);let l=[],c=[],h=[],u=[],d=new D,f=new D,m=new D;for(let v=0;v<=i;v++){let x=a+v/i*o;for(let p=0;p<=s;p++){let S=p/s*r;f.x=(e+t*Math.cos(x))*Math.cos(S),f.y=(e+t*Math.cos(x))*Math.sin(S),f.z=t*Math.sin(x),c.push(f.x,f.y,f.z),d.x=e*Math.cos(S),d.y=e*Math.sin(S),m.subVectors(f,d).normalize(),h.push(m.x,m.y,m.z),u.push(p/s),u.push(v/i)}}for(let v=1;v<=i;v++)for(let x=1;x<=s;x++){let p=(s+1)*v+x-1,S=(s+1)*(v-1)+x-1,A=(s+1)*(v-1)+x,g=(s+1)*v+x;l.push(p,S,g),l.push(S,A,g)}this.setIndex(l),this.setAttribute("position",new it(c,3)),this.setAttribute("normal",new it(h,3)),this.setAttribute("uv",new it(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new n(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc,e.thetaStart,e.thetaLength)}};function Ls(n){let e={};for(let t in n){e[t]={};for(let i in n[t]){let s=n[t][i];if(Wd(s))s.isRenderTargetTexture?(Je("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone();else if(Array.isArray(s))if(Wd(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][i]=r}else e[t][i]=s.slice();else e[t][i]=s}}return e}function Tn(n){let e={};for(let t=0;t<n.length;t++){let i=Ls(n[t]);for(let s in i)e[s]=i[s]}return e}function Wd(n){return n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)}function B0(n){let e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function ru(n){let e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:yt.workingColorSpace}var Oi={clone:Ls,merge:Tn},O0=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,k0=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Bt=class extends ci{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=O0,this.fragmentShader=k0,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ls(e.uniforms),this.uniformsGroups=B0(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let i in e.uniforms){let s=e.uniforms[i];switch(this.uniforms[i]={},s.type){case"t":this.uniforms[i].value=t[s.value]||null;break;case"c":this.uniforms[i].value=new Fe().setHex(s.value);break;case"v2":this.uniforms[i].value=new he().fromArray(s.value);break;case"v3":this.uniforms[i].value=new D().fromArray(s.value);break;case"v4":this.uniforms[i].value=new Xt().fromArray(s.value);break;case"m3":this.uniforms[i].value=new ot().fromArray(s.value);break;case"m4":this.uniforms[i].value=new bt().fromArray(s.value);break;default:this.uniforms[i].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let i in e.extensions)this.extensions[i]=e.extensions[i];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},xr=class extends Bt{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Vn=class extends ci{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Fe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Fe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=$a,this.normalScale=new he(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ni,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},yr=class extends Vn{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new he(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return dt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Fe(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Fe(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Fe(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(e){this._retroreflectivity>0!=e>0&&this.version++,this._retroreflectivity=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.retroreflectivity=e.retroreflectivity,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var wa=class extends ci{constructor(e){super(),this.isMeshToonMaterial=!0,this.defines={TOON:""},this.type="MeshToonMaterial",this.color=new Fe(16777215),this.map=null,this.gradientMap=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Fe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=$a,this.normalScale=new he(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.gradientMap=e.gradientMap,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.alphaMap=e.alphaMap,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var _l=class extends ci{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=vf,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},vl=class extends ci{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function js(n,e){return!n||n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function Ah(n){return n!==void 0&&n.inTangents!==void 0&&n.outTangents!==void 0}var is=class{constructor(e,t,i,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,i=this._cachedIndex,s=t[i],r=t[i-1];n:{e:{let a;t:{i:if(!(e<s)){for(let o=i+2;;){if(s===void 0){if(e<r)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===o)break;if(r=s,s=t[++i],e<s)break e}a=t.length;break t}if(!(e>=r)){let o=t[1];e<o&&(i=2,r=o);for(let l=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(s=r,r=t[--i-1],e>=r)break e}a=i,i=0;break t}break n}for(;i<a;){let o=i+a>>>1;e<t[o]?a=o:i=o+1}if(s=t[i],r=t[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,s)}return this.interpolate_(i,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=i[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Ml=class extends is{constructor(e,t,i,s){super(e,t,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ih,endingEnd:Ih}}intervalChanged_(e,t,i){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case Ph:r=e,o=2*t-i;break;case Dh:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=i}if(l===void 0)switch(this.getSettings_().endingEnd){case Ph:a=e,l=2*i-t;break;case Dh:a=1,l=i+s[1]-s[0];break;default:a=e-1,l=t}let c=(i-t)*.5,h=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-i),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,m=(i-t)/(s-t),v=m*m,x=v*m,p=-d*x+2*d*v-d*m,S=(1+d)*x+(-1.5-2*d)*v+(-.5+d)*m+1,A=(-1-f)*x+(1.5+f)*v+.5*m,g=f*x-f*v;for(let M=0;M!==o;++M)r[M]=p*a[h+M]+S*a[c+M]+A*a[l+M]+g*a[u+M];return r}},bl=class extends is{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=(i-t)/(s-t),u=1-h;for(let d=0;d!==o;++d)r[d]=a[c+d]*u+a[l+d]*h;return r}},Sl=class extends is{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e){return this.copySampleValue_(e-1)}},El=class extends is{interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,h=this.inTangents,u=this.outTangents;if(!h||!u){let m=(i-t)/(s-t),v=1-m;for(let x=0;x!==o;++x)r[x]=a[c+x]*v+a[l+x]*m;return r}let d=o*2,f=e-1;for(let m=0;m!==o;++m){let v=a[c+m],x=a[l+m],p=f*d+m*2,S=u[p],A=u[p+1],g=e*d+m*2,M=h[g],b=h[g+1],I=z0(i,t,S,M,s);r[m]=kf(I,v,A,b,x)}return r}};function kf(n,e,t,i,s){let r=1-n;return r*r*r*e+3*r*r*n*t+3*r*n*n*i+n*n*n*s}function H0(n,e,t,i,s){let r=1-n;return 3*r*r*(t-e)+6*r*n*(i-t)+3*n*n*(s-i)}function z0(n,e,t,i,s){let r=(n-e)/(s-e);for(let a=0;a<8;a++){let o=kf(r,e,t,i,s)-n;if(Math.abs(o)<1e-10)break;let l=H0(r,e,t,i,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var Wn=class{constructor(e,t,i,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=js(t,this.TimeBufferType),this.values=js(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:js(e.times,Array),values:js(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(i.interpolation=s),Ah(e.settings)&&(i.settings={inTangents:js(e.settings.inTangents,Array),outTangents:js(e.settings.outTangents,Array)})}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new Sl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new bl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Ml(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new El(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case na:t=this.InterpolantFactoryMethodDiscrete;break;case il:t=this.InterpolantFactoryMethodLinear;break;case Yo:t=this.InterpolantFactoryMethodSmooth;break;case Ch:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return Je("KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return na;case this.InterpolantFactoryMethodLinear:return il;case this.InterpolantFactoryMethodSmooth:return Yo;case this.InterpolantFactoryMethodBezier:return Ch}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]*=e;Ah(this.settings)&&(Xd(this.settings.inTangents,e),Xd(this.settings.outTangents,e))}return this}trim(e,t){let i=this.times,s=i.length,r=0,a=s-1;for(;r!==s&&i[r]<e;)++r;for(;a!==-1&&i[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=i.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(tt("KeyframeTrack: Invalid value size in track.",this),e=!1);let i=this.times,s=this.values,r=i.length;r===0&&(tt("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let l=i[o];if(typeof l=="number"&&isNaN(l)){tt("KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){tt("KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(s!==void 0&&Cm(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){tt("KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===Yo,r=e.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=e[o],h=e[o+1];if(c!==h&&(o!==1||c!==e[0]))if(s)l=!0;else{let u=o*i,d=u-i,f=u+i;for(let m=0;m!==i;++m){let v=t[u+m];if(v!==t[d+m]||v!==t[f+m]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let u=o*i,d=a*i;for(let f=0;f!==i;++f)t[d+f]=t[u+f]}++a}}if(r>0){e[a]=e[r];for(let o=r*i,l=a*i,c=0;c!==i;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*i)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),i=this.constructor,s=new i(this.name,e,t);return s.createInterpolant=this.createInterpolant,Ah(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function Xd(n,e){for(let t=0,i=n.length;t!==i;t+=2)n[t]*=e}Wn.prototype.ValueTypeName="";Wn.prototype.TimeBufferType=Float32Array;Wn.prototype.ValueBufferType=Float32Array;Wn.prototype.DefaultInterpolation=il;var ss=class extends Wn{constructor(e,t,i){super(e,t,i)}};ss.prototype.ValueTypeName="bool";ss.prototype.ValueBufferType=Array;ss.prototype.DefaultInterpolation=na;ss.prototype.InterpolantFactoryMethodLinear=void 0;ss.prototype.InterpolantFactoryMethodSmooth=void 0;var Tl=class extends Wn{constructor(e,t,i,s){super(e,t,i,s)}};Tl.prototype.ValueTypeName="color";var wl=class extends Wn{constructor(e,t,i,s){super(e,t,i,s)}};wl.prototype.ValueTypeName="number";var Al=class extends is{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(i-t)/(s-t),c=e*o;for(let h=c+o;c!==h;c+=4)Jn.slerpFlat(r,0,a,c-o,a,c,l);return r}},Aa=class extends Wn{constructor(e,t,i,s){super(e,t,i,s)}InterpolantFactoryMethodLinear(e){return new Al(this.times,this.values,this.getValueSize(),e)}};Aa.prototype.ValueTypeName="quaternion";Aa.prototype.InterpolantFactoryMethodSmooth=void 0;var rs=class extends Wn{constructor(e,t,i){super(e,t,i)}};rs.prototype.ValueTypeName="string";rs.prototype.ValueBufferType=Array;rs.prototype.DefaultInterpolation=na;rs.prototype.InterpolantFactoryMethodLinear=void 0;rs.prototype.InterpolantFactoryMethodSmooth=void 0;var Rl=class extends Wn{constructor(e,t,i,s){super(e,t,i,s)}};Rl.prototype.ValueTypeName="vector";var Cl=class{constructor(e,t,i){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this._abortController=null,this.itemStart=function(h){o++,r===!1&&s.onStart!==void 0&&s.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,s.onProgress!==void 0&&s.onProgress(h,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){let f=c[u],m=c[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return m}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Hf=new Cl,Il=class{constructor(e){this.manager=e!==void 0?e:Hf,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let i=this;return new Promise(function(s,r){i.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};Il.DEFAULT_MATERIAL_NAME="__DEFAULT";var _r=class extends nn{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Fe(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Ra=class extends _r{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(nn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Fe(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Rh=new bt,qd=new D,Yd=new D,Ca=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new he(512,512),this.mapType=Nn,this.map=null,this.mapPass=null,this.matrix=new bt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new dr,this._frameExtents=new he(1,1),this._viewportCount=1,this._viewports=[new Xt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;qd.setFromMatrixPosition(e.matrixWorld),t.position.copy(qd),Yd.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Yd),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,i,s){Rh.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),i.setFromProjectionMatrix(Rh,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===rr||e.reversedDepth?t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(Rh)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Xo=new D,qo=new Jn,xi=new D,Ia=class extends nn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new bt,this.projectionMatrix=new bt,this.projectionMatrixInverse=new bt,this.coordinateSystem=li,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Xo,qo,xi),xi.x===1&&xi.y===1&&xi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Xo,qo,xi.set(1,1,1)).invert()}updateWorldMatrix(e,t,i=!1){super.updateWorldMatrix(e,t,i),this.matrixWorld.decompose(Xo,qo,xi),xi.x===1&&xi.y===1&&xi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Xo,qo,xi.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},es=new D,Zd=new he,$d=new he,gn=class extends Ia{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=or*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(nr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return or*2*Math.atan(Math.tan(nr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){es.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(es.x,es.y).multiplyScalar(-e/es.z),es.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(es.x,es.y).multiplyScalar(-e/es.z)}getViewSize(e,t){return this.getViewBounds(e,Zd,$d),t.subVectors($d,Zd)}setViewOffset(e,t,i,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(nr*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*i/c,s*=a.width/l,i*=a.height/c}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var Oh=class extends Ca{constructor(){super(new gn(90,1,.5,500)),this.isPointLightShadow=!0}},Pa=class extends _r{constructor(e,t,i=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=s,this.shadow=new Oh}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},as=class extends Ia{constructor(e=-1,t=1,i=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=i-e,a=i+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},kh=class extends Ca{constructor(){super(new as(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Da=class extends _r{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(nn.DEFAULT_UP),this.updateMatrix(),this.target=new nn,this.shadow=new kh}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var Qs=-90,er=1,Pl=class extends nn{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new gn(Qs,er,e,t);s.layers=this.layers,this.add(s);let r=new gn(Qs,er,e,t);r.layers=this.layers,this.add(r);let a=new gn(Qs,er,e,t);a.layers=this.layers,this.add(a);let o=new gn(Qs,er,e,t);o.layers=this.layers,this.add(o);let l=new gn(Qs,er,e,t);l.layers=this.layers,this.add(l);let c=new gn(Qs,er,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[i,s,r,a,o,l]=t;for(let c of t)this.remove(c);if(e===li)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===rr)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,h]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),m=e.xr.enabled;e.xr.enabled=!1;let v=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let x=!1;e.isWebGLRenderer===!0?x=e.state.buffers.depth.getReversed():x=e.reversedDepthBuffer,e.setRenderTarget(i,0,s),x&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(i,1,s),x&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(i,2,s),x&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(i,3,s),x&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(i,4,s),x&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),i.texture.generateMipmaps=v,e.setRenderTarget(i,5,s),x&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(u,d,f),e.xr.enabled=m,i.texture.needsPMREMUpdate=!0}},Dl=class extends gn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}},La=class{constructor(){this._previousTime=0,this._currentTime=0,this._startTime=performance.now(),this._delta=0,this._elapsed=0,this._timescale=1,this._document=null,this._pageVisibilityHandler=null}connect(e){this._document=e,e.hidden!==void 0&&(this._pageVisibilityHandler=G0.bind(this),e.addEventListener("visibilitychange",this._pageVisibilityHandler,!1))}disconnect(){this._pageVisibilityHandler!==null&&(this._document.removeEventListener("visibilitychange",this._pageVisibilityHandler),this._pageVisibilityHandler=null),this._document=null}getDelta(){return this._delta/1e3}getElapsed(){return this._elapsed/1e3}getTimescale(){return this._timescale}setTimescale(e){return this._timescale=e,this}reset(){return this._currentTime=performance.now()-this._startTime,this}dispose(){this.disconnect()}update(e){return this._pageVisibilityHandler!==null&&this._document.hidden===!0?this._delta=0:(this._previousTime=this._currentTime,this._currentTime=(e!==void 0?e:performance.now())-this._startTime,this._delta=(this._currentTime-this._previousTime)*this._timescale,this._elapsed+=this._delta),this}};function G0(){this._document.hidden===!1&&this.reset()}var au="\\[\\]\\.:\\/",V0=new RegExp("["+au+"]","g"),ou="[^"+au+"]",W0="[^"+au.replace("\\.","")+"]",X0=/((?:WC+[\/:])*)/.source.replace("WC",ou),q0=/(WCOD+)?/.source.replace("WCOD",W0),Y0=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",ou),Z0=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",ou),$0=new RegExp("^"+X0+q0+Y0+Z0+"$"),J0=["material","materials","bones","map"],Hh=class{constructor(e,t,i){let s=i||Wt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(e,t)}setValue(e,t){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=i.length;s!==r;++s)i[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}},Wt=class n{constructor(e,t,i){this.path=t,this.parsedPath=i||n.parseTrackName(t),this.node=n.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new n.Composite(e,t,i):new n(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(V0,"")}static parseTrackName(e){let t=$0.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=i.nodeName.substring(s+1);J0.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){let i=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let l=i(o.children);if(l)return l}return null},s=i(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)e[t++]=i[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,i=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=n.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Je("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=t.objectIndex;switch(i){case"materials":if(!e.material){tt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){tt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){tt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){tt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){tt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){tt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(c!==void 0){if(e[c]===void 0){tt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let a=e[s];if(a===void 0){let c=t.nodeName;tt("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){tt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){tt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Wt.Composite=Hh;Wt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Wt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Wt.prototype.GetterByBindingType=[Wt.prototype._getValue_direct,Wt.prototype._getValue_array,Wt.prototype._getValue_arrayElement,Wt.prototype._getValue_toArray];Wt.prototype.SetterByBindingTypeAndVersioning=[[Wt.prototype._setValue_direct,Wt.prototype._setValue_direct_setNeedsUpdate,Wt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Wt.prototype._setValue_array,Wt.prototype._setValue_array_setNeedsUpdate,Wt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Wt.prototype._setValue_arrayElement,Wt.prototype._setValue_arrayElement_setNeedsUpdate,Wt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Wt.prototype._setValue_fromArray,Wt.prototype._setValue_fromArray_setNeedsUpdate,Wt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var hb=new Float32Array(1);var fu=class fu{constructor(e,t,i,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,i,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let i=0;i<4;i++)this.elements[i]=e[i+t];return this}set(e,t,i,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=i,r[3]=s,this}};fu.prototype.isMatrix2=!0;var zh=fu;function lu(n,e,t,i){let s=K0(i);switch(t){case Qh:return n*e;case zl:return n*e/s.components*s.byteLength;case Gl:return n*e/s.components*s.byteLength;case ds:return n*e*2/s.components*s.byteLength;case Vl:return n*e*2/s.components*s.byteLength;case eu:return n*e*3/s.components*s.byteLength;case Fn:return n*e*4/s.components*s.byteLength;case Wl:return n*e*4/s.components*s.byteLength;case Va:case Wa:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Xa:case qa:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case ql:case Zl:return Math.max(n,16)*Math.max(e,8)/4;case Xl:case Yl:return Math.max(n,8)*Math.max(e,8)/2;case $l:case Jl:case jl:case Ql:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case Kl:case Ya:case ec:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case tc:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case nc:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case ic:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case sc:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case rc:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case ac:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case oc:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case lc:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case cc:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case hc:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case uc:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case dc:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case fc:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case pc:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case mc:case gc:case xc:return Math.ceil(n/4)*Math.ceil(e/4)*16;case yc:case _c:return Math.ceil(n/4)*Math.ceil(e/4)*8;case Za:case vc:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function K0(n){switch(n){case Nn:case $h:return{byteLength:1,components:1};case Mr:case Jh:case yn:return{byteLength:2,components:1};case kl:case Hl:return{byteLength:2,components:4};case ui:case Ol:case Qn:return{byteLength:4,components:1};case Kh:case jh:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Je("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function lp(){let n=null,e=!1,t=null,i=null;function s(r,a){i=n.requestAnimationFrame(s),t(r,a)}return{start:function(){e!==!0&&t!==null&&n!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n!==null&&n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function sg(n){let e=new WeakMap;function t(o,l){let c=o.array,h=o.usage,u=c.byteLength,d=n.createBuffer();n.bindBuffer(l,d),n.bufferData(l,c,h),o.onUploadCallback();let f;if(c instanceof Float32Array)f=n.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=n.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=n.HALF_FLOAT:f=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=n.SHORT;else if(c instanceof Uint32Array)f=n.UNSIGNED_INT;else if(c instanceof Int32Array)f=n.INT;else if(c instanceof Int8Array)f=n.BYTE;else if(c instanceof Uint8Array)f=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:u}}function i(o,l,c){let h=l.array,u=l.updateRanges;if(n.bindBuffer(c,o),u.length===0)n.bufferSubData(c,0,h);else{u.sort((f,m)=>f.start-m.start);let d=0;for(let f=1;f<u.length;f++){let m=u[d],v=u[f];v.start<=m.start+m.count+1?m.count=Math.max(m.count,v.start+v.count-m.start):(++d,u[d]=v)}u.length=d+1;for(let f=0,m=u.length;f<m;f++){let v=u[f];n.bufferSubData(c,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=e.get(o);l&&(n.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=e.get(o);(!h||h.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var rg=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,ag=`#ifdef USE_ALPHAHASH
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
#endif`,og=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,lg=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,cg=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,hg=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,ug=`#ifdef USE_AOMAP
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
#endif`,dg=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,fg=`#ifdef USE_BATCHING
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
#endif`,pg=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,mg=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,gg=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,xg=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,yg=`#ifdef USE_IRIDESCENCE
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
#endif`,_g=`#ifdef USE_BUMPMAP
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
#endif`,vg=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Mg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,bg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Sg=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Eg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Tg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,wg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Ag=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,Rg=`#define PI 3.141592653589793
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
} // validated`,Cg=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Ig=`vec3 transformedNormal = objectNormal;
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
#endif`,Pg=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Dg=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Lg=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Ug=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Ng="gl_FragColor = linearToOutputTexel( gl_FragColor );",Fg=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Bg=`#ifdef USE_ENVMAP
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
#endif`,Og=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,kg=`#ifdef USE_ENVMAP
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
#endif`,Hg=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,zg=`#ifdef USE_ENVMAP
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
#endif`,Gg=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Vg=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Wg=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Xg=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,qg=`#ifdef USE_GRADIENTMAP
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
}`,Yg=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Zg=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,$g=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Jg=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,Kg=`#ifdef USE_ENVMAP
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
#endif`,jg=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Qg=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,ex=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,tx=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,nx=`PhysicalMaterial material;
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
#endif`,ix=`uniform sampler2D dfgLUT;
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
}`,sx=`
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
#endif`,rx=`#if defined( RE_IndirectDiffuse )
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
#endif`,ax=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,ox=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,lx=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,cx=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,hx=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ux=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,dx=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,fx=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,px=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,mx=`#if defined( USE_POINTS_UV )
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
#endif`,gx=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,xx=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,yx=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,_x=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,vx=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Mx=`#ifdef USE_MORPHTARGETS
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
#endif`,bx=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Sx=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Ex=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Tx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,wx=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ax=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Rx=`#ifdef USE_NORMALMAP
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
#endif`,Cx=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Ix=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Px=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Dx=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Lx=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Ux=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Nx=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Fx=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Bx=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Ox=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,kx=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Hx=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,zx=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Gx=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Vx=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Wx=`float getShadowMask() {
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
}`,Xx=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,qx=`#ifdef USE_SKINNING
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
#endif`,Yx=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Zx=`#ifdef USE_SKINNING
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
#endif`,$x=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Jx=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Kx=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,jx=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Qx=`#ifdef USE_TRANSMISSION
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
#endif`,ey=`#ifdef USE_TRANSMISSION
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
#endif`,ty=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,ny=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,iy=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,sy=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,ry=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,ay=`uniform sampler2D t2D;
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
}`,oy=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ly=`#ifdef ENVMAP_TYPE_CUBE
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
}`,cy=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,hy=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,uy=`#include <common>
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
}`,dy=`#if DEPTH_PACKING == 3200
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
}`,fy=`#define DISTANCE
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
}`,py=`#define DISTANCE
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
}`,my=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,gy=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,xy=`uniform float scale;
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
}`,yy=`uniform vec3 diffuse;
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
}`,_y=`#include <common>
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
}`,vy=`uniform vec3 diffuse;
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
}`,My=`#define LAMBERT
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
}`,by=`#define LAMBERT
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
}`,Sy=`#define MATCAP
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
}`,Ey=`#define MATCAP
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
}`,Ty=`#define NORMAL
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
}`,wy=`#define NORMAL
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
}`,Ay=`#define PHONG
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
}`,Ry=`#define PHONG
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
}`,Cy=`#define STANDARD
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
}`,Iy=`#define STANDARD
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
}`,Py=`#define TOON
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
}`,Dy=`#define TOON
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
}`,Ly=`uniform float size;
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
}`,Uy=`uniform vec3 diffuse;
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
}`,Ny=`#include <common>
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
}`,Fy=`uniform vec3 color;
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
}`,By=`uniform float rotation;
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
}`,Oy=`uniform vec3 diffuse;
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
}`,pt={alphahash_fragment:rg,alphahash_pars_fragment:ag,alphamap_fragment:og,alphamap_pars_fragment:lg,alphatest_fragment:cg,alphatest_pars_fragment:hg,aomap_fragment:ug,aomap_pars_fragment:dg,batching_pars_vertex:fg,batching_vertex:pg,begin_vertex:mg,beginnormal_vertex:gg,bsdfs:xg,iridescence_fragment:yg,bumpmap_pars_fragment:_g,clipping_planes_fragment:vg,clipping_planes_pars_fragment:Mg,clipping_planes_pars_vertex:bg,clipping_planes_vertex:Sg,color_fragment:Eg,color_pars_fragment:Tg,color_pars_vertex:wg,color_vertex:Ag,common:Rg,cube_uv_reflection_fragment:Cg,defaultnormal_vertex:Ig,displacementmap_pars_vertex:Pg,displacementmap_vertex:Dg,emissivemap_fragment:Lg,emissivemap_pars_fragment:Ug,colorspace_fragment:Ng,colorspace_pars_fragment:Fg,envmap_fragment:Bg,envmap_common_pars_fragment:Og,envmap_pars_fragment:kg,envmap_pars_vertex:Hg,envmap_physical_pars_fragment:Kg,envmap_vertex:zg,fog_vertex:Gg,fog_pars_vertex:Vg,fog_fragment:Wg,fog_pars_fragment:Xg,gradientmap_pars_fragment:qg,lightmap_pars_fragment:Yg,lights_lambert_fragment:Zg,lights_lambert_pars_fragment:$g,lights_pars_begin:Jg,lights_toon_fragment:jg,lights_toon_pars_fragment:Qg,lights_phong_fragment:ex,lights_phong_pars_fragment:tx,lights_physical_fragment:nx,lights_physical_pars_fragment:ix,lights_fragment_begin:sx,lights_fragment_maps:rx,lights_fragment_end:ax,lightprobes_pars_fragment:ox,logdepthbuf_fragment:lx,logdepthbuf_pars_fragment:cx,logdepthbuf_pars_vertex:hx,logdepthbuf_vertex:ux,map_fragment:dx,map_pars_fragment:fx,map_particle_fragment:px,map_particle_pars_fragment:mx,metalnessmap_fragment:gx,metalnessmap_pars_fragment:xx,morphinstance_vertex:yx,morphcolor_vertex:_x,morphnormal_vertex:vx,morphtarget_pars_vertex:Mx,morphtarget_vertex:bx,normal_fragment_begin:Sx,normal_fragment_maps:Ex,normal_pars_fragment:Tx,normal_pars_vertex:wx,normal_vertex:Ax,normalmap_pars_fragment:Rx,clearcoat_normal_fragment_begin:Cx,clearcoat_normal_fragment_maps:Ix,clearcoat_pars_fragment:Px,iridescence_pars_fragment:Dx,opaque_fragment:Lx,packing:Ux,premultiplied_alpha_fragment:Nx,project_vertex:Fx,dithering_fragment:Bx,dithering_pars_fragment:Ox,roughnessmap_fragment:kx,roughnessmap_pars_fragment:Hx,shadowmap_pars_fragment:zx,shadowmap_pars_vertex:Gx,shadowmap_vertex:Vx,shadowmask_pars_fragment:Wx,skinbase_vertex:Xx,skinning_pars_vertex:qx,skinning_vertex:Yx,skinnormal_vertex:Zx,specularmap_fragment:$x,specularmap_pars_fragment:Jx,tonemapping_fragment:Kx,tonemapping_pars_fragment:jx,transmission_fragment:Qx,transmission_pars_fragment:ey,uv_pars_fragment:ty,uv_pars_vertex:ny,uv_vertex:iy,worldpos_vertex:sy,background_vert:ry,background_frag:ay,backgroundCube_vert:oy,backgroundCube_frag:ly,cube_vert:cy,cube_frag:hy,depth_vert:uy,depth_frag:dy,distance_vert:fy,distance_frag:py,equirect_vert:my,equirect_frag:gy,linedashed_vert:xy,linedashed_frag:yy,meshbasic_vert:_y,meshbasic_frag:vy,meshlambert_vert:My,meshlambert_frag:by,meshmatcap_vert:Sy,meshmatcap_frag:Ey,meshnormal_vert:Ty,meshnormal_frag:wy,meshphong_vert:Ay,meshphong_frag:Ry,meshphysical_vert:Cy,meshphysical_frag:Iy,meshtoon_vert:Py,meshtoon_frag:Dy,points_vert:Ly,points_frag:Uy,shadow_vert:Ny,shadow_frag:Fy,sprite_vert:By,sprite_frag:Oy},Te={common:{diffuse:{value:new Fe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ot},alphaMap:{value:null},alphaMapTransform:{value:new ot},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ot}},envmap:{envMap:{value:null},envMapRotation:{value:new ot},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ot}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ot}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ot},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ot},normalScale:{value:new he(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ot},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ot}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ot}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ot}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Fe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new D},probesMax:{value:new D},probesResolution:{value:new D}},points:{diffuse:{value:new Fe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ot},alphaTest:{value:0},uvTransform:{value:new ot}},sprite:{diffuse:{value:new Fe(16777215)},opacity:{value:1},center:{value:new he(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ot},alphaMap:{value:null},alphaMapTransform:{value:new ot},alphaTest:{value:0}}},Ti={basic:{uniforms:Tn([Te.common,Te.specularmap,Te.envmap,Te.aomap,Te.lightmap,Te.fog]),vertexShader:pt.meshbasic_vert,fragmentShader:pt.meshbasic_frag},lambert:{uniforms:Tn([Te.common,Te.specularmap,Te.envmap,Te.aomap,Te.lightmap,Te.emissivemap,Te.bumpmap,Te.normalmap,Te.displacementmap,Te.fog,Te.lights,{emissive:{value:new Fe(0)},envMapIntensity:{value:1}}]),vertexShader:pt.meshlambert_vert,fragmentShader:pt.meshlambert_frag},phong:{uniforms:Tn([Te.common,Te.specularmap,Te.envmap,Te.aomap,Te.lightmap,Te.emissivemap,Te.bumpmap,Te.normalmap,Te.displacementmap,Te.fog,Te.lights,{emissive:{value:new Fe(0)},specular:{value:new Fe(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:pt.meshphong_vert,fragmentShader:pt.meshphong_frag},standard:{uniforms:Tn([Te.common,Te.envmap,Te.aomap,Te.lightmap,Te.emissivemap,Te.bumpmap,Te.normalmap,Te.displacementmap,Te.roughnessmap,Te.metalnessmap,Te.fog,Te.lights,{emissive:{value:new Fe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:pt.meshphysical_vert,fragmentShader:pt.meshphysical_frag},toon:{uniforms:Tn([Te.common,Te.aomap,Te.lightmap,Te.emissivemap,Te.bumpmap,Te.normalmap,Te.displacementmap,Te.gradientmap,Te.fog,Te.lights,{emissive:{value:new Fe(0)}}]),vertexShader:pt.meshtoon_vert,fragmentShader:pt.meshtoon_frag},matcap:{uniforms:Tn([Te.common,Te.bumpmap,Te.normalmap,Te.displacementmap,Te.fog,{matcap:{value:null}}]),vertexShader:pt.meshmatcap_vert,fragmentShader:pt.meshmatcap_frag},points:{uniforms:Tn([Te.points,Te.fog]),vertexShader:pt.points_vert,fragmentShader:pt.points_frag},dashed:{uniforms:Tn([Te.common,Te.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:pt.linedashed_vert,fragmentShader:pt.linedashed_frag},depth:{uniforms:Tn([Te.common,Te.displacementmap]),vertexShader:pt.depth_vert,fragmentShader:pt.depth_frag},normal:{uniforms:Tn([Te.common,Te.bumpmap,Te.normalmap,Te.displacementmap,{opacity:{value:1}}]),vertexShader:pt.meshnormal_vert,fragmentShader:pt.meshnormal_frag},sprite:{uniforms:Tn([Te.sprite,Te.fog]),vertexShader:pt.sprite_vert,fragmentShader:pt.sprite_frag},background:{uniforms:{uvTransform:{value:new ot},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:pt.background_vert,fragmentShader:pt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ot}},vertexShader:pt.backgroundCube_vert,fragmentShader:pt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:pt.cube_vert,fragmentShader:pt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:pt.equirect_vert,fragmentShader:pt.equirect_frag},distance:{uniforms:Tn([Te.common,Te.displacementmap,{referencePosition:{value:new D},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:pt.distance_vert,fragmentShader:pt.distance_frag},shadow:{uniforms:Tn([Te.lights,Te.fog,{color:{value:new Fe(0)},opacity:{value:1}}]),vertexShader:pt.shadow_vert,fragmentShader:pt.shadow_frag}};Ti.physical={uniforms:Tn([Ti.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ot},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ot},clearcoatNormalScale:{value:new he(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ot},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ot},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ot},sheen:{value:0},sheenColor:{value:new Fe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ot},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ot},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ot},transmissionSamplerSize:{value:new he},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ot},attenuationDistance:{value:0},attenuationColor:{value:new Fe(0)},specularColor:{value:new Fe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ot},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ot},anisotropyVector:{value:new he},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ot}}]),vertexShader:pt.meshphysical_vert,fragmentShader:pt.meshphysical_frag};var Sc={r:0,b:0,g:0},ky=new bt,cp=new ot;cp.set(-1,0,0,0,1,0,0,0,1);function Hy(n,e,t,i,s,r){let a=new Fe(0),o=s===!0?0:1,l,c,h=null,u=0,d=null;function f(S){let A=S.isScene===!0?S.background:null;if(A&&A.isTexture){let g=S.backgroundBlurriness>0;A=e.get(A,g)}return A}function m(S){let A=!1,g=f(S);g===null?x(a,o):g&&g.isColor&&(x(g,1),A=!0);let M=n.xr.getEnvironmentBlendMode();M==="additive"?t.buffers.color.setClear(0,0,0,1,r):M==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(n.autoClear||A)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function v(S,A){let g=f(A);g&&(g.isCubeTexture||g.mapping===za)?(c===void 0&&(c=new pe(new Ze(1,1,1),new Bt({name:"BackgroundCubeMaterial",uniforms:Ls(Ti.backgroundCube.uniforms),vertexShader:Ti.backgroundCube.vertexShader,fragmentShader:Ti.backgroundCube.fragmentShader,side:un,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(M,b,I){this.matrixWorld.copyPosition(I.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=g,c.material.uniforms.backgroundBlurriness.value=A.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(ky.makeRotationFromEuler(A.backgroundRotation)).transpose(),g.isCubeTexture&&g.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(cp),c.material.toneMapped=yt.getTransfer(g.colorSpace)!==Ct,(h!==g||u!==g.version||d!==n.toneMapping)&&(c.material.needsUpdate=!0,h=g,u=g.version,d=n.toneMapping),c.layers.enableAll(),S.unshift(c,c.geometry,c.material,0,0,null)):g&&g.isTexture&&(l===void 0&&(l=new pe(new mn(2,2),new Bt({name:"BackgroundMaterial",uniforms:Ls(Ti.background.uniforms),vertexShader:Ti.background.vertexShader,fragmentShader:Ti.background.fragmentShader,side:os,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=g,l.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,l.material.toneMapped=yt.getTransfer(g.colorSpace)!==Ct,g.matrixAutoUpdate===!0&&g.updateMatrix(),l.material.uniforms.uvTransform.value.copy(g.matrix),(h!==g||u!==g.version||d!==n.toneMapping)&&(l.material.needsUpdate=!0,h=g,u=g.version,d=n.toneMapping),l.layers.enableAll(),S.unshift(l,l.geometry,l.material,0,0,null))}function x(S,A){S.getRGB(Sc,ru(n)),t.buffers.color.setClear(Sc.r,Sc.g,Sc.b,A,r)}function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(S,A=1){a.set(S),o=A,x(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(S){o=S,x(a,o)},render:m,addToRenderList:v,dispose:p}}function zy(n,e){let t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=d(null),r=s,a=!1;function o(P,B,z,w,N){let G=!1,V=u(P,w,z,B);r!==V&&(r=V,c(r.object)),G=f(P,w,z,N),G&&m(P,w,z,N),N!==null&&e.update(N,n.ELEMENT_ARRAY_BUFFER),(G||a)&&(a=!1,g(P,B,z,w),N!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(N).buffer))}function l(){return n.createVertexArray()}function c(P){return n.bindVertexArray(P)}function h(P){return n.deleteVertexArray(P)}function u(P,B,z,w){let N=w.wireframe===!0,G=i[B.id];G===void 0&&(G={},i[B.id]=G);let V=P.isInstancedMesh===!0?P.id:0,K=G[V];K===void 0&&(K={},G[V]=K);let X=K[z.id];X===void 0&&(X={},K[z.id]=X);let q=X[N];return q===void 0&&(q=d(l()),X[N]=q),q}function d(P){let B=[],z=[],w=[];for(let N=0;N<t;N++)B[N]=0,z[N]=0,w[N]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:B,enabledAttributes:z,attributeDivisors:w,object:P,attributes:{},index:null}}function f(P,B,z,w){let N=r.attributes,G=B.attributes,V=0,K=z.getAttributes();for(let X in K)if(K[X].location>=0){let ne=N[X],Ie=G[X];if(Ie===void 0&&(X==="instanceMatrix"&&P.instanceMatrix&&(Ie=P.instanceMatrix),X==="instanceColor"&&P.instanceColor&&(Ie=P.instanceColor)),ne===void 0||ne.attribute!==Ie||Ie&&ne.data!==Ie.data)return!0;V++}return r.attributesNum!==V||r.index!==w}function m(P,B,z,w){let N={},G=B.attributes,V=0,K=z.getAttributes();for(let X in K)if(K[X].location>=0){let ne=G[X];ne===void 0&&(X==="instanceMatrix"&&P.instanceMatrix&&(ne=P.instanceMatrix),X==="instanceColor"&&P.instanceColor&&(ne=P.instanceColor));let Ie={};Ie.attribute=ne,ne&&ne.data&&(Ie.data=ne.data),N[X]=Ie,V++}r.attributes=N,r.attributesNum=V,r.index=w}function v(){let P=r.newAttributes;for(let B=0,z=P.length;B<z;B++)P[B]=0}function x(P){p(P,0)}function p(P,B){let z=r.newAttributes,w=r.enabledAttributes,N=r.attributeDivisors;z[P]=1,w[P]===0&&(n.enableVertexAttribArray(P),w[P]=1),N[P]!==B&&(n.vertexAttribDivisor(P,B),N[P]=B)}function S(){let P=r.newAttributes,B=r.enabledAttributes;for(let z=0,w=B.length;z<w;z++)B[z]!==P[z]&&(n.disableVertexAttribArray(z),B[z]=0)}function A(P,B,z,w,N,G,V){V===!0?n.vertexAttribIPointer(P,B,z,N,G):n.vertexAttribPointer(P,B,z,w,N,G)}function g(P,B,z,w){v();let N=w.attributes,G=z.getAttributes(),V=B.defaultAttributeValues;for(let K in G){let X=G[K];if(X.location>=0){let q=N[K];if(q===void 0&&(K==="instanceMatrix"&&P.instanceMatrix&&(q=P.instanceMatrix),K==="instanceColor"&&P.instanceColor&&(q=P.instanceColor)),q!==void 0){let ne=q.normalized,Ie=q.itemSize,Ce=e.get(q);if(Ce===void 0)continue;let gt=Ce.buffer,Ye=Ce.type,ct=Ce.bytesPerElement,ee=Ye===n.INT||Ye===n.UNSIGNED_INT||q.gpuType===Ol;if(q.isInterleavedBufferAttribute){let ae=q.data,ge=ae.stride,$e=q.offset;if(ae.isInstancedInterleavedBuffer){for(let be=0;be<X.locationSize;be++)p(X.location+be,ae.meshPerAttribute);P.isInstancedMesh!==!0&&w._maxInstanceCount===void 0&&(w._maxInstanceCount=ae.meshPerAttribute*ae.count)}else for(let be=0;be<X.locationSize;be++)x(X.location+be);n.bindBuffer(n.ARRAY_BUFFER,gt);for(let be=0;be<X.locationSize;be++)A(X.location+be,Ie/X.locationSize,Ye,ne,ge*ct,($e+Ie/X.locationSize*be)*ct,ee)}else{if(q.isInstancedBufferAttribute){for(let ae=0;ae<X.locationSize;ae++)p(X.location+ae,q.meshPerAttribute);P.isInstancedMesh!==!0&&w._maxInstanceCount===void 0&&(w._maxInstanceCount=q.meshPerAttribute*q.count)}else for(let ae=0;ae<X.locationSize;ae++)x(X.location+ae);n.bindBuffer(n.ARRAY_BUFFER,gt);for(let ae=0;ae<X.locationSize;ae++)A(X.location+ae,Ie/X.locationSize,Ye,ne,Ie*ct,Ie/X.locationSize*ae*ct,ee)}}else if(V!==void 0){let ne=V[K];if(ne!==void 0)switch(ne.length){case 2:n.vertexAttrib2fv(X.location,ne);break;case 3:n.vertexAttrib3fv(X.location,ne);break;case 4:n.vertexAttrib4fv(X.location,ne);break;default:n.vertexAttrib1fv(X.location,ne)}}}}S()}function M(){E();for(let P in i){let B=i[P];for(let z in B){let w=B[z];for(let N in w){let G=w[N];for(let V in G)h(G[V].object),delete G[V];delete w[N]}}delete i[P]}}function b(P){if(i[P.id]===void 0)return;let B=i[P.id];for(let z in B){let w=B[z];for(let N in w){let G=w[N];for(let V in G)h(G[V].object),delete G[V];delete w[N]}}delete i[P.id]}function I(P){for(let B in i){let z=i[B];for(let w in z){let N=z[w];if(N[P.id]===void 0)continue;let G=N[P.id];for(let V in G)h(G[V].object),delete G[V];delete N[P.id]}}}function y(P){for(let B in i){let z=i[B],w=P.isInstancedMesh===!0?P.id:0,N=z[w];if(N!==void 0){for(let G in N){let V=N[G];for(let K in V)h(V[K].object),delete V[K];delete N[G]}delete z[w],Object.keys(z).length===0&&delete i[B]}}}function E(){C(),a=!0,r!==s&&(r=s,c(r.object))}function C(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:E,resetDefaultState:C,dispose:M,releaseStatesOfGeometry:b,releaseStatesOfObject:y,releaseStatesOfProgram:I,initAttributes:v,enableAttribute:x,disableUnusedAttributes:S}}function Gy(n,e,t){let i;function s(l){i=l}function r(l,c){n.drawArrays(i,l,c),t.update(c,i,1)}function a(l,c,h){h!==0&&(n.drawArraysInstanced(i,l,c,h),t.update(c,i,h))}function o(l,c,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,h);let d=0;for(let f=0;f<h;f++)d+=c[f];t.update(d,i,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function Vy(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let I=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(I.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(I){return!(I!==Fn&&i.convert(I)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(I){let y=I===yn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(I!==Nn&&I!==Qn&&!y&&i.convert(I)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE))}function l(I){if(I==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";I="mediump"}return I==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",h=l(c);h!==c&&(Je("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let u=t.logarithmicDepthBuffer===!0,d=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&d===!1&&Je("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),m=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=n.getParameter(n.MAX_TEXTURE_SIZE),x=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),p=n.getParameter(n.MAX_VERTEX_ATTRIBS),S=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),A=n.getParameter(n.MAX_VARYING_VECTORS),g=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),M=n.getParameter(n.MAX_SAMPLES),b=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:m,maxTextureSize:v,maxCubemapSize:x,maxAttributes:p,maxVertexUniforms:S,maxVaryings:A,maxFragmentUniforms:g,maxSamples:M,samples:b}}function Wy(n){let e=this,t=null,i=0,s=!1,r=!1,a=new oi,o=new ot,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let f=u.length!==0||d||i!==0||s;return s=d,i=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){t=h(u,d,0)},this.setState=function(u,d,f){let m=u.clippingPlanes,v=u.clipIntersection,x=u.clipShadows,p=n.get(u);if(!s||m===null||m.length===0||r&&!x)r?h(null):c();else{let S=r?0:i,A=S*4,g=p.clippingState||null;l.value=g,g=h(m,d,A,f);for(let M=0;M!==A;++M)g[M]=t[M];p.clippingState=g,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=S}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function h(u,d,f,m){let v=u!==null?u.length:0,x=null;if(v!==0){if(x=l.value,m!==!0||x===null){let p=f+v*4,S=d.matrixWorldInverse;o.getNormalMatrix(S),(x===null||x.length<p)&&(x=new Float32Array(p));for(let A=0,g=f;A!==v;++A,g+=4)a.copy(u[A]).applyMatrix4(S,o),a.normal.toArray(x,g),x[g+3]=a.constant}l.value=x,l.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,x}}var Er=4,Xy=6,qy=20,Yy=256,Ja=new as,zf=new Fe,pu=null,mu=0,gu=0,xu=!1,Zy=new D,Us=new D,Tc=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,i=.1,s=100,r={}){let{size:a=256,position:o=Zy}=r;pu=this._renderer.getRenderTarget(),mu=this._renderer.getActiveCubeFace(),gu=this._renderer.getActiveMipmapLevel(),xu=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,i,s,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Wf(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Vf(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(pu,mu,gu),this._renderer.xr.enabled=xu,e.scissorTest=!1,Sr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===cs||e.mapping===Ps?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),pu=this._renderer.getRenderTarget(),mu=this._renderer.getActiveCubeFace(),gu=this._renderer.getActiveMipmapLevel(),xu=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:xn,minFilter:xn,generateMipmaps:!1,type:yn,format:Fn,colorSpace:ia,depthBuffer:!1},s=Gf(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Gf(e,t,i);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=$y(r)),this._blurMaterial=Ky(r,e,t),this._ggxMaterial=Jy(r,e,t)}return s}_compileMaterial(e){let t=new pe(new Et,e);this._renderer.compile(t,Ja)}_sceneToCubeUV(e,t,i,s,r){let l=new gn(90,1,t,i),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,f=u.toneMapping;u.getClearColor(zf),u.toneMapping=hi,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(s),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new pe(new Ze,new It({name:"PMREM.Background",side:un,depthWrite:!1,depthTest:!1})));let v=this._backgroundBox,x=v.material,p=!1,S=e.background;S?S.isColor&&(x.color.copy(S),e.background=null,p=!0):(x.color.copy(zf),p=!0);for(let A=0;A<6;A++){let g=A%3;g===0?(l.up.set(0,c[A],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[A],r.y,r.z)):g===1?(l.up.set(0,0,c[A]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[A],r.z)):(l.up.set(0,c[A],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[A]));let M=this._cubeSize;Sr(s,g*M,A>2?M:0,M,M),u.setRenderTarget(s),p&&u.render(v,l),u.render(e,l)}u.toneMapping=f,u.autoClear=d,e.background=S}_textureToCubeUV(e,t){let i=this._renderer,s=e.mapping===cs||e.mapping===Ps;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Wf()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Vf());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=e;let l=this._cubeSize;Sr(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(a,Ja)}_applyPMREM(e){let t=this._renderer,i=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=i}_applyGGXFilter(e,t,i){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[i];o.material=a;let l=a.uniforms,c=i/(this._lodMeshes.length-1),h=t/(this._lodMeshes.length-1),u=Math.sqrt(c*c-h*h),d=c*1.25,f=u*d,{_lodMax:m}=this,v=this._sizeLods[i],x=3*v*(i>m-Er?i-m+Er:0),p=4*(this._cubeSize-v);l.envMap.value=e.texture,l.roughness.value=f,l.mipInt.value=m-t,Sr(r,x,p,3*v,2*v),s.setRenderTarget(r),s.render(o,Ja),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=m-i,Sr(e,x,p,3*v,2*v),s.setRenderTarget(e),s.render(o,Ja)}_blur(e,t,i,s){let r=this._pingPongRenderTarget,a=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(e,r,t,i,a),this._blurPass(r,e,i,i,a)}_blurPass(e,t,i,s,r){let a=this._renderer,o=this._blurMaterial,l=this._lodMeshes[s];l.material=o;let c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-i;let h=this._sizeLods[s],u=3*h*(s>this._lodMax-Er?s-this._lodMax+Er:0),d=4*(this._cubeSize-h);Sr(t,u,d,3*h,2*h),a.setRenderTarget(t),a.render(l,Ja)}};function $y(n){let e=[],t=[],i=n,s=n-Er+1+Xy;for(let r=0;r<s;r++){let a=Math.pow(2,i);e.push(a);let o=1/(a-2),l=-o,c=1+o,h=[l,l,c,l,c,c,l,l,c,c,l,c],u=6,d=6,f=3,m=new Float32Array(f*d*u),v=new Float32Array(f*d*u);for(let p=0;p<u;p++){let S=p%3*2/3-1,A=p>2?0:-1,g=[S,A,0,S+2/3,A,0,S+2/3,A+1,0,S,A,0,S+2/3,A+1,0,S,A+1,0];m.set(g,f*d*p);for(let M=0;M<d;M++){let b=h[M*2]*2-1,I=h[M*2+1]*2-1;p===0?Us.set(1,I,b):p===1?Us.set(-b,1,-I):p===2?Us.set(-b,I,1):p===3?Us.set(-1,I,-b):p===4?Us.set(-b,-1,I):Us.set(b,I,-1),Us.toArray(v,(p*d+M)*f)}}let x=new Et;x.setAttribute("position",new Ht(m,f)),x.setAttribute("outputDirection",new Ht(v,f)),t.push(new pe(x,null)),i>Er&&i--}return{lodMeshes:t,sizeLods:e}}function Gf(n,e,t){let i=new tn(n,e,t);return i.texture.mapping=za,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Sr(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function Jy(n,e,t){return new Bt({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Yy,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Rc(),fragmentShader:`

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
		`,blending:jn,depthTest:!1,depthWrite:!1})}function Ky(n,e,t){return new Bt({name:"SphericalGaussianBlur",defines:{SAMPLES:qy,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Rc(),fragmentShader:`

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
		`,blending:jn,depthTest:!1,depthWrite:!1})}function Vf(){return new Bt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Rc(),fragmentShader:`

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
		`,blending:jn,depthTest:!1,depthWrite:!1})}function Wf(){return new Bt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Rc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:jn,depthTest:!1,depthWrite:!1})}function Rc(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var wc=class extends tn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new fa(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new Ze(5,5,5),r=new Bt({name:"CubemapFromEquirect",uniforms:Ls(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:un,blending:jn});r.uniforms.tEquirect.value=t;let a=new pe(s,r),o=t.minFilter;return t.minFilter===hs&&(t.minFilter=xn),new Pl(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,i=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,i,s);e.setRenderTarget(r)}};function jy(n){let e=new WeakMap,t=new WeakMap,i=null;function s(d,f=!1){return d==null?null:f?a(d):r(d)}function r(d){if(d&&d.isTexture){let f=d.mapping;if(f===Nl||f===Fl)if(e.has(d)){let m=e.get(d).texture;return o(m,d.mapping)}else{let m=d.image;if(m&&m.height>0){let v=new wc(m.height);return v.fromEquirectangularTexture(n,d),e.set(d,v),d.addEventListener("dispose",c),o(v.texture,d.mapping)}else return null}}return d}function a(d){if(d&&d.isTexture){let f=d.mapping,m=f===Nl||f===Fl,v=f===cs||f===Ps;if(m||v){let x=t.get(d),p=x!==void 0?x.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==p)return i===null&&(i=new Tc(n)),x=m?i.fromEquirectangular(d,x):i.fromCubemap(d,x),x.texture.pmremVersion=d.pmremVersion,t.set(d,x),x.texture;if(x!==void 0)return x.texture;{let S=d.image;return m&&S&&S.height>0||v&&S&&l(S)?(i===null&&(i=new Tc(n)),x=m?i.fromEquirectangular(d):i.fromCubemap(d),x.texture.pmremVersion=d.pmremVersion,t.set(d,x),d.addEventListener("dispose",h),x.texture):null}}}return d}function o(d,f){return f===Nl?d.mapping=cs:f===Fl&&(d.mapping=Ps),d}function l(d){let f=0,m=6;for(let v=0;v<m;v++)d[v]!==void 0&&f++;return f===m}function c(d){let f=d.target;f.removeEventListener("dispose",c);let m=e.get(f);m!==void 0&&(e.delete(f),m.dispose())}function h(d){let f=d.target;f.removeEventListener("dispose",h);let m=t.get(f);m!==void 0&&(t.delete(f),m.dispose())}function u(){e=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:s,dispose:u}}function Qy(n){let e={};function t(i){if(e[i]!==void 0)return e[i];let s=n.getExtension(i);return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){let s=t(i);return s===null&&Es("WebGLRenderer: "+i+" extension not supported."),s}}}function e_(n,e,t,i){let s={},r=new WeakMap;function a(u){let d=u.target;d.index!==null&&e.remove(d.index);for(let m in d.attributes)e.remove(d.attributes[m]);d.removeEventListener("dispose",a),delete s[d.id];let f=r.get(d);f&&(e.remove(f),r.delete(d)),i.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function o(u,d){return s[d.id]===!0||(d.addEventListener("dispose",a),s[d.id]=!0,t.memory.geometries++),d}function l(u){let d=u.attributes;for(let f in d)e.update(d[f],n.ARRAY_BUFFER)}function c(u){let d=[],f=u.index,m=u.attributes.position,v=0;if(m===void 0)return;if(f!==null){let S=f.array;v=f.version;for(let A=0,g=S.length;A<g;A+=3){let M=S[A+0],b=S[A+1],I=S[A+2];d.push(M,b,b,I,I,M)}}else{let S=m.array;v=m.version;for(let A=0,g=S.length/3-1;A<g;A+=3){let M=A+0,b=A+1,I=A+2;d.push(M,b,b,I,I,M)}}let x=new(m.count>=65535?ua:ha)(d,1);x.version=v;let p=r.get(u);p&&e.remove(p),r.set(u,x)}function h(u){let d=r.get(u);if(d){let f=u.index;f!==null&&d.version<f.version&&c(u)}else c(u);return r.get(u)}return{get:o,update:l,getWireframeAttribute:h}}function t_(n,e,t){let i;function s(u){i=u}let r,a;function o(u){r=u.type,a=u.bytesPerElement}function l(u,d){n.drawElements(i,d,r,u*a),t.update(d,i,1)}function c(u,d,f){f!==0&&(n.drawElementsInstanced(i,d,r,u*a,f),t.update(d,i,f))}function h(u,d,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,d,0,r,u,0,f);let v=0;for(let x=0;x<f;x++)v+=d[x];t.update(v,i,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function n_(n){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,a,o){switch(t.calls++,a){case n.TRIANGLES:t.triangles+=o*(r/3);break;case n.LINES:t.lines+=o*(r/2);break;case n.LINE_STRIP:t.lines+=o*(r-1);break;case n.LINE_LOOP:t.lines+=o*r;break;case n.POINTS:t.points+=o*r;break;default:tt("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function i_(n,e,t){let i=new WeakMap,s=new Xt;function r(a,o,l){let c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0,d=i.get(o);if(d===void 0||d.count!==u){let E=function(){I.dispose(),i.delete(o),o.removeEventListener("dispose",E)};d!==void 0&&d.texture.dispose();let f=o.morphAttributes.position!==void 0,m=o.morphAttributes.normal!==void 0,v=o.morphAttributes.color!==void 0,x=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],S=o.morphAttributes.color||[],A=0;f===!0&&(A=1),m===!0&&(A=2),v===!0&&(A=3);let g=o.attributes.position.count*A,M=1;g>e.maxTextureSize&&(M=Math.ceil(g/e.maxTextureSize),g=e.maxTextureSize);let b=new Float32Array(g*M*4*u),I=new aa(b,g,M,u);I.type=Qn,I.needsUpdate=!0;let y=A*4;for(let C=0;C<u;C++){let P=x[C],B=p[C],z=S[C],w=g*M*4*C;for(let N=0;N<P.count;N++){let G=N*y;f===!0&&(s.fromBufferAttribute(P,N),b[w+G+0]=s.x,b[w+G+1]=s.y,b[w+G+2]=s.z,b[w+G+3]=0),m===!0&&(s.fromBufferAttribute(B,N),b[w+G+4]=s.x,b[w+G+5]=s.y,b[w+G+6]=s.z,b[w+G+7]=0),v===!0&&(s.fromBufferAttribute(z,N),b[w+G+8]=s.x,b[w+G+9]=s.y,b[w+G+10]=s.z,b[w+G+11]=z.itemSize===4?s.w:1)}}d={count:u,texture:I,size:new he(g,M)},i.set(o,d),o.addEventListener("dispose",E)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",a.morphTexture,t);else{let f=0;for(let v=0;v<c.length;v++)f+=c[v];let m=o.morphTargetsRelative?1:1-f;l.getUniforms().setValue(n,"morphTargetBaseInfluence",m),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",d.size)}return{update:r}}function s_(n,e,t,i,s){let r=new WeakMap;function a(c){let h=s.render.frame,u=c.geometry,d=e.get(c,u);if(r.get(d)!==h&&(e.update(d),r.set(d,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(t.update(c.instanceMatrix,n.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,n.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return d}function o(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),i.releaseStatesOfObject(h),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:a,dispose:o}}var r_={[Na]:"LINEAR_TONE_MAPPING",[Fa]:"REINHARD_TONE_MAPPING",[Ba]:"CINEON_TONE_MAPPING",[Is]:"ACES_FILMIC_TONE_MAPPING",[ka]:"AGX_TONE_MAPPING",[Ha]:"NEUTRAL_TONE_MAPPING",[Oa]:"CUSTOM_TONE_MAPPING"};function a_(n,e,t,i,s,r){let a=new tn(e,t,{type:n,depthBuffer:s,stencilBuffer:r,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new Et;c.setAttribute("position",new it([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new it([0,2,0,0,2,0],2));let h=new xr({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),u=new pe(c,h),d=new as(-1,1,1,-1,0,1),f=null,m=null,v=!1,x,p=null,S=[],A=!1;this.setSize=function(g,M){a.setSize(g,M),o!==null&&o.setSize(g,M),l!==null&&l.setSize(g,M);for(let b=0;b<S.length;b++){let I=S[b];I.setSize&&I.setSize(g,M)}},this.setEffects=function(g){S=g,A=S.length>0&&S[0].isRenderPass===!0;let M=a.width,b=a.height;S.length>0&&o===null&&(o=new tn(M,b,{type:yn,depthBuffer:!1,stencilBuffer:!1}),l=new tn(M,b,{type:yn,depthBuffer:!1,stencilBuffer:!1}));for(let I=0;I<S.length;I++){let y=S[I];y.setSize&&y.setSize(M,b)}},this.begin=function(g,M){if(v||g.toneMapping===hi&&S.length===0)return!1;if(p=M,M!==null){let b=M.width,I=M.height;(a.width!==b||a.height!==I)&&this.setSize(b,I)}return A===!1&&g.setRenderTarget(a),x=g.toneMapping,g.toneMapping=hi,!0},this.hasRenderPass=function(){return A},this.end=function(g,M){g.toneMapping=x,v=!0;let b=a,I=o;for(let y=0;y<S.length;y++){let E=S[y];E.enabled!==!1&&(E.render(g,I,b,M),E.needsSwap!==!1&&(b=I,I=I===o?l:o))}if(f!==g.outputColorSpace||m!==g.toneMapping){f=g.outputColorSpace,m=g.toneMapping,h.defines={},yt.getTransfer(f)===Ct&&(h.defines.SRGB_TRANSFER="");let y=r_[m];y&&(h.defines[y]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=b.texture,g.setRenderTarget(p),g.render(u,d),p=null,v=!1},this.isCompositing=function(){return v},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}var hp=new Pn,vu=new ns(1,1),up=new aa,dp=new al,fp=new fa,Xf=[],qf=[],Yf=new Float32Array(16),Zf=new Float32Array(9),$f=new Float32Array(4);function wr(n,e,t){let i=n[0];if(i<=0||i>0)return n;let s=e*t,r=Xf[s];if(r===void 0&&(r=new Float32Array(s),Xf[s]=r),e!==0){i.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,n[a].toArray(r,o)}return r}function dn(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function fn(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function Cc(n,e){let t=qf[e];t===void 0&&(t=new Int32Array(e),qf[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function o_(n,e){let t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function l_(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(dn(t,e))return;n.uniform2fv(this.addr,e),fn(t,e)}}function c_(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(dn(t,e))return;n.uniform3fv(this.addr,e),fn(t,e)}}function h_(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(dn(t,e))return;n.uniform4fv(this.addr,e),fn(t,e)}}function u_(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(dn(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),fn(t,e)}else{if(dn(t,i))return;$f.set(i),n.uniformMatrix2fv(this.addr,!1,$f),fn(t,i)}}function d_(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(dn(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),fn(t,e)}else{if(dn(t,i))return;Zf.set(i),n.uniformMatrix3fv(this.addr,!1,Zf),fn(t,i)}}function f_(n,e){let t=this.cache,i=e.elements;if(i===void 0){if(dn(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),fn(t,e)}else{if(dn(t,i))return;Yf.set(i),n.uniformMatrix4fv(this.addr,!1,Yf),fn(t,i)}}function p_(n,e){let t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function m_(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(dn(t,e))return;n.uniform2iv(this.addr,e),fn(t,e)}}function g_(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(dn(t,e))return;n.uniform3iv(this.addr,e),fn(t,e)}}function x_(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(dn(t,e))return;n.uniform4iv(this.addr,e),fn(t,e)}}function y_(n,e){let t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function __(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(dn(t,e))return;n.uniform2uiv(this.addr,e),fn(t,e)}}function v_(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(dn(t,e))return;n.uniform3uiv(this.addr,e),fn(t,e)}}function M_(n,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(dn(t,e))return;n.uniform4uiv(this.addr,e),fn(t,e)}}function b_(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(vu.compareFunction=t.isReversedDepthBuffer()?bc:Mc,r=vu):r=hp,t.setTexture2D(e||r,s)}function S_(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||dp,s)}function E_(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||fp,s)}function T_(n,e,t){let i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||up,s)}function w_(n){switch(n){case 5126:return o_;case 35664:return l_;case 35665:return c_;case 35666:return h_;case 35674:return u_;case 35675:return d_;case 35676:return f_;case 5124:case 35670:return p_;case 35667:case 35671:return m_;case 35668:case 35672:return g_;case 35669:case 35673:return x_;case 5125:return y_;case 36294:return __;case 36295:return v_;case 36296:return M_;case 35678:case 36198:case 36298:case 36306:case 35682:return b_;case 35679:case 36299:case 36307:return S_;case 35680:case 36300:case 36308:case 36293:return E_;case 36289:case 36303:case 36311:case 36292:return T_}}function A_(n,e){n.uniform1fv(this.addr,e)}function R_(n,e){let t=wr(e,this.size,2);n.uniform2fv(this.addr,t)}function C_(n,e){let t=wr(e,this.size,3);n.uniform3fv(this.addr,t)}function I_(n,e){let t=wr(e,this.size,4);n.uniform4fv(this.addr,t)}function P_(n,e){let t=wr(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function D_(n,e){let t=wr(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function L_(n,e){let t=wr(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function U_(n,e){n.uniform1iv(this.addr,e)}function N_(n,e){n.uniform2iv(this.addr,e)}function F_(n,e){n.uniform3iv(this.addr,e)}function B_(n,e){n.uniform4iv(this.addr,e)}function O_(n,e){n.uniform1uiv(this.addr,e)}function k_(n,e){n.uniform2uiv(this.addr,e)}function H_(n,e){n.uniform3uiv(this.addr,e)}function z_(n,e){n.uniform4uiv(this.addr,e)}function G_(n,e,t){let i=this.cache,s=e.length,r=Cc(t,s);dn(i,r)||(n.uniform1iv(this.addr,r),fn(i,r));let a;this.type===n.SAMPLER_2D_SHADOW?a=vu:a=hp;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function V_(n,e,t){let i=this.cache,s=e.length,r=Cc(t,s);dn(i,r)||(n.uniform1iv(this.addr,r),fn(i,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||dp,r[a])}function W_(n,e,t){let i=this.cache,s=e.length,r=Cc(t,s);dn(i,r)||(n.uniform1iv(this.addr,r),fn(i,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||fp,r[a])}function X_(n,e,t){let i=this.cache,s=e.length,r=Cc(t,s);dn(i,r)||(n.uniform1iv(this.addr,r),fn(i,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||up,r[a])}function q_(n){switch(n){case 5126:return A_;case 35664:return R_;case 35665:return C_;case 35666:return I_;case 35674:return P_;case 35675:return D_;case 35676:return L_;case 5124:case 35670:return U_;case 35667:case 35671:return N_;case 35668:case 35672:return F_;case 35669:case 35673:return B_;case 5125:return O_;case 36294:return k_;case 36295:return H_;case 36296:return z_;case 35678:case 36198:case 36298:case 36306:case 35682:return G_;case 35679:case 36299:case 36307:return V_;case 35680:case 36300:case 36308:case 36293:return W_;case 36289:case 36303:case 36311:case 36292:return X_}}var Mu=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=w_(t.type)}},bu=class{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=q_(t.type)}},Su=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],i)}}},yu=/(\w+)(\])?(\[|\.)?/g;function Jf(n,e){n.seq.push(e),n.map[e.id]=e}function Y_(n,e,t){let i=n.name,s=i.length;for(yu.lastIndex=0;;){let r=yu.exec(i),a=yu.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){Jf(t,c===void 0?new Mu(o,n,e):new bu(o,n,e));break}else{let u=t.map[o];u===void 0&&(u=new Su(o),Jf(t,u)),t=u}}}var Tr=class{constructor(e,t){this.seq=[],this.map={};let i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){let o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);Y_(o,l,this)}let s=[],r=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,i,s){let r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){let s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],l=i[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){let i=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&i.push(a)}return i}};function Kf(n,e,t){let i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}var Z_=37297,$_=0;function J_(n,e){let t=n.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;i.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return i.join(`
`)}var jf=new ot;function K_(n){yt._getMatrix(jf,yt.workingColorSpace,n);let e=`mat3( ${jf.elements.map(t=>t.toFixed(4))} )`;switch(yt.getTransfer(n)){case sa:return[e,"LinearTransferOETF"];case Ct:return[e,"sRGBTransferOETF"];default:return Je("WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function Qf(n,e,t){let i=n.getShaderParameter(e,n.COMPILE_STATUS),r=(n.getShaderInfoLog(e)||"").trim();if(i&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+J_(n.getShaderSource(e),o)}else return r}function j_(n,e){let t=K_(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var Q_={[Na]:"Linear",[Fa]:"Reinhard",[Ba]:"Cineon",[Is]:"ACESFilmic",[ka]:"AgX",[Ha]:"Neutral",[Oa]:"Custom"};function ev(n,e){let t=Q_[e];return t===void 0?(Je("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Ec=new D;function tv(){yt.getLuminanceCoefficients(Ec);let n=Ec.x.toFixed(4),e=Ec.y.toFixed(4),t=Ec.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function nv(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ja).join(`
`)}function iv(n){let e=[];for(let t in n){let i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function sv(n,e){let t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let r=n.getActiveAttrib(e,s),a=r.name,o=1;r.type===n.FLOAT_MAT2&&(o=2),r.type===n.FLOAT_MAT3&&(o=3),r.type===n.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:n.getAttribLocation(e,a),locationSize:o}}return t}function ja(n){return n!==""}function ep(n,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function tp(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var rv=/^[ \t]*#include +<([\w\d./]+)>/gm;function Eu(n){return n.replace(rv,ov)}var av=new Map;function ov(n,e){let t=pt[e];if(t===void 0){let i=av.get(e);if(i!==void 0)t=pt[i],Je('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return Eu(t)}var lv=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function np(n){return n.replace(lv,cv)}function cv(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function ip(n){let e=`precision ${n.precision} float;
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
#define LOW_PRECISION`),e}var hv={[Ua]:"SHADOWMAP_TYPE_PCF",[vr]:"SHADOWMAP_TYPE_VSM"};function uv(n){return hv[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var dv={[cs]:"ENVMAP_TYPE_CUBE",[Ps]:"ENVMAP_TYPE_CUBE",[za]:"ENVMAP_TYPE_CUBE_UV"};function fv(n){return n.envMap===!1?"ENVMAP_TYPE_CUBE":dv[n.envMapMode]||"ENVMAP_TYPE_CUBE"}var pv={[Ps]:"ENVMAP_MODE_REFRACTION"};function mv(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":pv[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}var gv={[Yh]:"ENVMAP_BLENDING_MULTIPLY",[xf]:"ENVMAP_BLENDING_MIX",[yf]:"ENVMAP_BLENDING_ADD"};function xv(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":gv[n.combine]||"ENVMAP_BLENDING_NONE"}function yv(n){let e=n.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function _v(n,e,t,i){let s=n.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,l=uv(t),c=fv(t),h=mv(t),u=xv(t),d=yv(t),f=nv(t),m=iv(r),v=s.createProgram(),x,p,S=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(x=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(ja).join(`
`),x.length>0&&(x+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m].filter(ja).join(`
`),p.length>0&&(p+=`
`)):(x=[ip(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ja).join(`
`),p=[ip(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,m,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==hi?"#define TONE_MAPPING":"",t.toneMapping!==hi?pt.tonemapping_pars_fragment:"",t.toneMapping!==hi?ev("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",pt.colorspace_pars_fragment,j_("linearToOutputTexel",t.outputColorSpace),tv(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(ja).join(`
`)),a=Eu(a),a=ep(a,t),a=tp(a,t),o=Eu(o),o=ep(o,t),o=tp(o,t),a=np(a),o=np(o),t.isRawShaderMaterial!==!0&&(S=`#version 300 es
`,x=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+x,p=["#define varying in",t.glslVersion===tu?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===tu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let A=S+x+a,g=S+p+o,M=Kf(s,s.VERTEX_SHADER,A),b=Kf(s,s.FRAGMENT_SHADER,g);s.attachShader(v,M),s.attachShader(v,b),t.index0AttributeName!==void 0?s.bindAttribLocation(v,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function I(P){if(n.debug.checkShaderErrors){let B=s.getProgramInfoLog(v)||"",z=s.getShaderInfoLog(M)||"",w=s.getShaderInfoLog(b)||"",N=B.trim(),G=z.trim(),V=w.trim(),K=!0,X=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if(K=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,v,M,b);else{let q=Qf(s,M,"vertex"),ne=Qf(s,b,"fragment");tt("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+N+`
`+q+`
`+ne)}else N!==""?Je("WebGLProgram: Program Info Log:",N):(G===""||V==="")&&(X=!1);X&&(P.diagnostics={runnable:K,programLog:N,vertexShader:{log:G,prefix:x},fragmentShader:{log:V,prefix:p}})}s.deleteShader(M),s.deleteShader(b),y=new Tr(s,v),E=sv(s,v)}let y;this.getUniforms=function(){return y===void 0&&I(this),y};let E;this.getAttributes=function(){return E===void 0&&I(this),E};let C=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=s.getProgramParameter(v,Z_)),C},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=$_++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=M,this.fragmentShader=b,this}var vv=0,Tu=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,i){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(i)===!1&&(s.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){let t=this.shaderCache,i=t.get(e);return i===void 0&&(i=new wu(e),t.set(e,i)),i}},wu=class{constructor(e){this.id=vv++,this.code=e,this.usedTimes=0}};function Mv(n){return n===ds||n===Ya||n===Za}function bv(n,e,t,i,s,r){let a=new oa,o=new Tu,l=new Set,c=[],h=new Map,u=i.logarithmicDepthBuffer,d=i.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(y){return l.add(y),y===0?"uv":`uv${y}`}function v(y,E,C,P,B,z){let w=P.fog,N=B.geometry,G=y.isMeshStandardMaterial||y.isMeshLambertMaterial||y.isMeshPhongMaterial?P.environment:null,V=y.isMeshStandardMaterial||y.isMeshLambertMaterial&&!y.envMap||y.isMeshPhongMaterial&&!y.envMap,K=e.get(y.envMap||G,V),X=K&&K.mapping===za?K.image.height:null,q=f[y.type];y.precision!==null&&(d=i.getMaxPrecision(y.precision),d!==y.precision&&Je("WebGLProgram.getParameters:",y.precision,"not supported, using",d,"instead."));let ne=N.morphAttributes.position||N.morphAttributes.normal||N.morphAttributes.color,Ie=ne!==void 0?ne.length:0,Ce=0;N.morphAttributes.position!==void 0&&(Ce=1),N.morphAttributes.normal!==void 0&&(Ce=2),N.morphAttributes.color!==void 0&&(Ce=3);let gt,Ye,ct,ee;if(q){let zt=Ti[q];gt=zt.vertexShader,Ye=zt.fragmentShader}else{gt=y.vertexShader,Ye=y.fragmentShader;let zt=o.getVertexShaderStage(y),Dt=o.getFragmentShaderStage(y);o.update(y,zt,Dt),ct=zt.id,ee=Dt.id}let ae=n.getRenderTarget(),ge=n.state.buffers.depth.getReversed(),$e=B.isInstancedMesh===!0,be=B.isBatchedMesh===!0,Qe=!!y.map,At=!!y.matcap,oe=!!K,ue=!!y.aoMap,de=!!y.lightMap,fe=!!y.bumpMap&&y.wireframe===!1,Me=!!y.normalMap,ze=!!y.displacementMap,Ve=!!y.emissiveMap,Ke=!!y.metalnessMap,et=!!y.roughnessMap,F=y.anisotropy>0,Rt=y.clearcoat>0,at=y.dispersion>0,R=y.retroreflectivity>0,_=y.iridescence>0,W=y.sheen>0,$=y.transmission>0,te=F&&!!y.anisotropyMap,xe=Rt&&!!y.clearcoatMap,ve=Rt&&!!y.clearcoatNormalMap,ie=Rt&&!!y.clearcoatRoughnessMap,re=_&&!!y.iridescenceMap,Se=_&&!!y.iridescenceThicknessMap,Ge=W&&!!y.sheenColorMap,Ee=W&&!!y.sheenRoughnessMap,H=!!y.specularMap,J=!!y.specularColorMap,se=!!y.specularIntensityMap,me=$&&!!y.transmissionMap,L=$&&!!y.thicknessMap,ce=!!y.gradientMap,Q=!!y.alphaMap,_e=y.alphaTest>0,we=!!y.alphaHash,le=!!y.extensions,We=hi;y.toneMapped&&(ae===null||ae.isXRRenderTarget===!0)&&(We=n.toneMapping);let ke={shaderID:q,shaderType:y.type,shaderName:y.name,vertexShader:gt,fragmentShader:Ye,defines:y.defines,customVertexShaderID:ct,customFragmentShaderID:ee,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:d,batching:be,batchingColor:be&&B._colorsTexture!==null,instancing:$e,instancingColor:$e&&B.instanceColor!==null,instancingMorph:$e&&B.morphTexture!==null,outputColorSpace:ae===null?n.outputColorSpace:ae.isXRRenderTarget===!0?ae.texture.colorSpace:yt.workingColorSpace,alphaToCoverage:!!y.alphaToCoverage,map:Qe,matcap:At,envMap:oe,envMapMode:oe&&K.mapping,envMapCubeUVHeight:X,aoMap:ue,lightMap:de,bumpMap:fe,normalMap:Me,displacementMap:ze,emissiveMap:Ve,normalMapObjectSpace:Me&&y.normalMapType===Mf,normalMapTangentSpace:Me&&y.normalMapType===$a,packedNormalMap:Me&&y.normalMapType===$a&&Mv(y.normalMap.format),metalnessMap:Ke,roughnessMap:et,anisotropy:F,anisotropyMap:te,clearcoat:Rt,clearcoatMap:xe,clearcoatNormalMap:ve,clearcoatRoughnessMap:ie,dispersion:at,retroreflection:R,iridescence:_,iridescenceMap:re,iridescenceThicknessMap:Se,sheen:W,sheenColorMap:Ge,sheenRoughnessMap:Ee,specularMap:H,specularColorMap:J,specularIntensityMap:se,transmission:$,transmissionMap:me,thicknessMap:L,gradientMap:ce,opaque:y.transparent===!1&&y.blending===ls&&y.alphaToCoverage===!1,alphaMap:Q,alphaTest:_e,alphaHash:we,combine:y.combine,mapUv:Qe&&m(y.map.channel),aoMapUv:ue&&m(y.aoMap.channel),lightMapUv:de&&m(y.lightMap.channel),bumpMapUv:fe&&m(y.bumpMap.channel),normalMapUv:Me&&m(y.normalMap.channel),displacementMapUv:ze&&m(y.displacementMap.channel),emissiveMapUv:Ve&&m(y.emissiveMap.channel),metalnessMapUv:Ke&&m(y.metalnessMap.channel),roughnessMapUv:et&&m(y.roughnessMap.channel),anisotropyMapUv:te&&m(y.anisotropyMap.channel),clearcoatMapUv:xe&&m(y.clearcoatMap.channel),clearcoatNormalMapUv:ve&&m(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ie&&m(y.clearcoatRoughnessMap.channel),iridescenceMapUv:re&&m(y.iridescenceMap.channel),iridescenceThicknessMapUv:Se&&m(y.iridescenceThicknessMap.channel),sheenColorMapUv:Ge&&m(y.sheenColorMap.channel),sheenRoughnessMapUv:Ee&&m(y.sheenRoughnessMap.channel),specularMapUv:H&&m(y.specularMap.channel),specularColorMapUv:J&&m(y.specularColorMap.channel),specularIntensityMapUv:se&&m(y.specularIntensityMap.channel),transmissionMapUv:me&&m(y.transmissionMap.channel),thicknessMapUv:L&&m(y.thicknessMap.channel),alphaMapUv:Q&&m(y.alphaMap.channel),vertexTangents:!!N.attributes.tangent&&(Me||F),vertexNormals:!!N.attributes.normal,vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!N.attributes.color&&N.attributes.color.itemSize===4,pointsUvs:B.isPoints===!0&&!!N.attributes.uv&&(Qe||Q),fog:!!w,useFog:y.fog===!0,fogExp2:!!w&&w.isFogExp2,flatShading:y.wireframe===!1&&(y.flatShading===!0||N.attributes.normal===void 0&&Me===!1&&(y.isMeshLambertMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isMeshPhysicalMaterial)),sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:ge,skinning:B.isSkinnedMesh===!0,hasPositionAttribute:N.attributes.position!==void 0,morphTargets:N.morphAttributes.position!==void 0,morphNormals:N.morphAttributes.normal!==void 0,morphColors:N.morphAttributes.color!==void 0,morphTargetsCount:Ie,morphTextureStride:Ce,numSunLights:E.sun.length,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numSunLightShadows:E.sunShadowMap.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numLightProbeGrids:z.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:y.dithering,shadowMapEnabled:n.shadowMap.enabled&&C.length>0,shadowMapType:n.shadowMap.type,toneMapping:We,decodeVideoTexture:Qe&&y.map.isVideoTexture===!0&&yt.getTransfer(y.map.colorSpace)===Ct,decodeVideoTextureEmissive:Ve&&y.emissiveMap.isVideoTexture===!0&&yt.getTransfer(y.emissiveMap.colorSpace)===Ct,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===qt,flipSided:y.side===un,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:le&&y.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(le&&y.extensions.multiDraw===!0||be)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return ke.vertexUv1s=l.has(1),ke.vertexUv2s=l.has(2),ke.vertexUv3s=l.has(3),l.clear(),ke}function x(y){let E=[];if(y.shaderID?E.push(y.shaderID):(E.push(y.customVertexShaderID),E.push(y.customFragmentShaderID)),y.defines!==void 0)for(let C in y.defines)E.push(C),E.push(y.defines[C]);return y.isRawShaderMaterial===!1&&(p(E,y),S(E,y),E.push(n.outputColorSpace)),E.push(y.customProgramCacheKey),E.join()}function p(y,E){y.push(E.precision),y.push(E.outputColorSpace),y.push(E.envMapMode),y.push(E.envMapCubeUVHeight),y.push(E.mapUv),y.push(E.alphaMapUv),y.push(E.lightMapUv),y.push(E.aoMapUv),y.push(E.bumpMapUv),y.push(E.normalMapUv),y.push(E.displacementMapUv),y.push(E.emissiveMapUv),y.push(E.metalnessMapUv),y.push(E.roughnessMapUv),y.push(E.anisotropyMapUv),y.push(E.clearcoatMapUv),y.push(E.clearcoatNormalMapUv),y.push(E.clearcoatRoughnessMapUv),y.push(E.iridescenceMapUv),y.push(E.iridescenceThicknessMapUv),y.push(E.sheenColorMapUv),y.push(E.sheenRoughnessMapUv),y.push(E.specularMapUv),y.push(E.specularColorMapUv),y.push(E.specularIntensityMapUv),y.push(E.transmissionMapUv),y.push(E.thicknessMapUv),y.push(E.combine),y.push(E.fogExp2),y.push(E.sizeAttenuation),y.push(E.morphTargetsCount),y.push(E.morphAttributeCount),y.push(E.numSunLights),y.push(E.numDirLights),y.push(E.numPointLights),y.push(E.numSpotLights),y.push(E.numSpotLightMaps),y.push(E.numHemiLights),y.push(E.numRectAreaLights),y.push(E.numSunLightShadows),y.push(E.numDirLightShadows),y.push(E.numPointLightShadows),y.push(E.numSpotLightShadows),y.push(E.numSpotLightShadowsWithMaps),y.push(E.numLightProbes),y.push(E.shadowMapType),y.push(E.toneMapping),y.push(E.numClippingPlanes),y.push(E.numClipIntersection),y.push(E.depthPacking)}function S(y,E){a.disableAll(),E.instancing&&a.enable(0),E.instancingColor&&a.enable(1),E.instancingMorph&&a.enable(2),E.matcap&&a.enable(3),E.envMap&&a.enable(4),E.normalMapObjectSpace&&a.enable(5),E.normalMapTangentSpace&&a.enable(6),E.clearcoat&&a.enable(7),E.iridescence&&a.enable(8),E.alphaTest&&a.enable(9),E.vertexColors&&a.enable(10),E.vertexAlphas&&a.enable(11),E.vertexUv1s&&a.enable(12),E.vertexUv2s&&a.enable(13),E.vertexUv3s&&a.enable(14),E.vertexTangents&&a.enable(15),E.anisotropy&&a.enable(16),E.alphaHash&&a.enable(17),E.batching&&a.enable(18),E.dispersion&&a.enable(19),E.retroreflection&&a.enable(24),E.batchingColor&&a.enable(20),E.gradientMap&&a.enable(21),E.packedNormalMap&&a.enable(22),E.vertexNormals&&a.enable(23),y.push(a.mask),a.disableAll(),E.fog&&a.enable(0),E.useFog&&a.enable(1),E.flatShading&&a.enable(2),E.logarithmicDepthBuffer&&a.enable(3),E.reversedDepthBuffer&&a.enable(4),E.skinning&&a.enable(5),E.morphTargets&&a.enable(6),E.morphNormals&&a.enable(7),E.morphColors&&a.enable(8),E.premultipliedAlpha&&a.enable(9),E.shadowMapEnabled&&a.enable(10),E.doubleSided&&a.enable(11),E.flipSided&&a.enable(12),E.useDepthPacking&&a.enable(13),E.dithering&&a.enable(14),E.transmission&&a.enable(15),E.sheen&&a.enable(16),E.opaque&&a.enable(17),E.pointsUvs&&a.enable(18),E.decodeVideoTexture&&a.enable(19),E.decodeVideoTextureEmissive&&a.enable(20),E.alphaToCoverage&&a.enable(21),E.numLightProbeGrids>0&&a.enable(22),E.hasPositionAttribute&&a.enable(23),y.push(a.mask)}function A(y){let E=f[y.type],C;if(E){let P=Ti[E];C=Oi.clone(P.uniforms)}else C=y.uniforms;return C}function g(y,E){let C=h.get(E);return C!==void 0?++C.usedTimes:(C=new _v(n,E,y,s),c.push(C),h.set(E,C)),C}function M(y){if(--y.usedTimes===0){let E=c.indexOf(y);c[E]=c[c.length-1],c.pop(),h.delete(y.cacheKey),y.destroy()}}function b(y){o.remove(y)}function I(){o.dispose()}return{getParameters:v,getProgramCacheKey:x,getUniforms:A,acquireProgram:g,releaseProgram:M,releaseShaderCache:b,programs:c,dispose:I}}function Sv(){let n=new WeakMap;function e(a){return n.has(a)}function t(a){let o=n.get(a);return o===void 0&&(o={},n.set(a,o)),o}function i(a){n.delete(a)}function s(a,o,l){n.get(a)[o]=l}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function Ev(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.materialVariant!==e.materialVariant?n.materialVariant-e.materialVariant:n.z!==e.z?n.z-e.z:n.id-e.id}function sp(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function rp(){let n=[],e=0,t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function a(d){let f=0;return d.isInstancedMesh&&(f+=2),d.isSkinnedMesh&&(f+=1),f}function o(d,f,m,v,x,p){let S=n[e];return S===void 0?(S={id:d.id,object:d,geometry:f,material:m,materialVariant:a(d),groupOrder:v,renderOrder:d.renderOrder,z:x,group:p},n[e]=S):(S.id=d.id,S.object=d,S.geometry=f,S.material=m,S.materialVariant=a(d),S.groupOrder=v,S.renderOrder=d.renderOrder,S.z=x,S.group=p),e++,S}function l(d,f,m,v,x,p,S){S.reversedDepth===!0&&(x=-x);let A=o(d,f,m,v,x,p);m.transmission>0?i.push(A):m.transparent===!0?s.push(A):t.push(A)}function c(d,f,m,v,x,p){let S=o(d,f,m,v,x,p);m.transmission>0?i.unshift(S):m.transparent===!0?s.unshift(S):t.unshift(S)}function h(d,f){t.length>1&&t.sort(d||Ev),i.length>1&&i.sort(f||sp),s.length>1&&s.sort(f||sp)}function u(){for(let d=e,f=n.length;d<f;d++){let m=n[d];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:l,unshift:c,finish:u,sort:h}}function Tv(){let n=new WeakMap;function e(i,s){let r=n.get(i),a;return r===void 0?(a=new rp,n.set(i,[a])):s>=r.length?(a=new rp,r.push(a)):a=r[s],a}function t(){n=new WeakMap}return{get:e,dispose:t}}function wv(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new D,color:new Fe};break;case"SpotLight":t={position:new D,direction:new D,color:new Fe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new D,color:new Fe,distance:0,decay:0};break;case"HemisphereLight":t={direction:new D,skyColor:new Fe,groundColor:new Fe};break;case"RectAreaLight":t={color:new Fe,position:new D,halfWidth:new D,halfHeight:new D};break}return n[e.id]=t,t}}}function Av(){let n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new he};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new he};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new he,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}var Rv=0;function Cv(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function Iv(n){let e=new wv,t=Av(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new D);let s=new D,r=new bt,a=new bt;function o(c){let h=0,u=0,d=0;for(let B=0;B<9;B++)i.probe[B].set(0,0,0);let f=0,m=0,v=0,x=0,p=0,S=0,A=0,g=0,M=0,b=0,I=0,y=0,E=0,C=0;c.sort(Cv);for(let B=0,z=c.length;B<z;B++){let w=c[B],N=w.color,G=w.intensity,V=w.distance,K=null;if(w.shadow&&w.shadow.map&&(w.shadow.map.texture.format===ds?K=w.shadow.map.texture:K=w.shadow.map.depthTexture||w.shadow.map.texture),w.isAmbientLight)h+=N.r*G,u+=N.g*G,d+=N.b*G;else if(w.isLightProbe){for(let X=0;X<9;X++)i.probe[X].addScaledVector(w.sh.coefficients[X],G);C++}else if(w.isSunLight){let X=e.get(w);if(X.color.copy(w.color).multiplyScalar(w.intensity),w.castShadow){let q=w.shadow,ne=t.get(w);ne.shadowIntensity=q.intensity,ne.shadowBias=q.bias,ne.shadowNormalBias=q.normalBias,ne.shadowRadius=q.radius,ne.shadowMapSize.copy(q.mapSize).multiply(q.getFrameExtents()),i.sunShadow[m]=ne,i.sunShadowMap[m]=K;let Ie=q.getViewportCount();for(let Ce=0;Ce<Ie;Ce++)i.sunShadowMatrix[v+Ce]=q.getMatrix(Ce),i.sunShadowCascade[v+Ce]=q._cascadeData[Ce];v+=Ie,m++}i.sun[f]=X,f++}else if(w.isDirectionalLight){let X=e.get(w);if(X.color.copy(w.color).multiplyScalar(w.intensity),w.castShadow){let q=w.shadow,ne=t.get(w);ne.shadowIntensity=q.intensity,ne.shadowBias=q.bias,ne.shadowNormalBias=q.normalBias,ne.shadowRadius=q.radius,ne.shadowMapSize=q.mapSize,i.directionalShadow[x]=ne,i.directionalShadowMap[x]=K,i.directionalShadowMatrix[x]=w.shadow.matrix,M++}i.directional[x]=X,x++}else if(w.isSpotLight){let X=e.get(w);X.position.setFromMatrixPosition(w.matrixWorld),X.color.copy(N).multiplyScalar(G),X.distance=V,X.coneCos=Math.cos(w.angle),X.penumbraCos=Math.cos(w.angle*(1-w.penumbra)),X.decay=w.decay,i.spot[S]=X;let q=w.shadow;if(w.map&&(i.spotLightMap[y]=w.map,y++,q.updateMatrices(w),w.castShadow&&E++),i.spotLightMatrix[S]=q.matrix,w.castShadow){let ne=t.get(w);ne.shadowIntensity=q.intensity,ne.shadowBias=q.bias,ne.shadowNormalBias=q.normalBias,ne.shadowRadius=q.radius,ne.shadowMapSize=q.mapSize,i.spotShadow[S]=ne,i.spotShadowMap[S]=K,I++}S++}else if(w.isRectAreaLight){let X=e.get(w);X.color.copy(N).multiplyScalar(G),X.halfWidth.set(w.width*.5,0,0),X.halfHeight.set(0,w.height*.5,0),i.rectArea[A]=X,A++}else if(w.isPointLight){let X=e.get(w);if(X.color.copy(w.color).multiplyScalar(w.intensity),X.distance=w.distance,X.decay=w.decay,w.castShadow){let q=w.shadow,ne=t.get(w);ne.shadowIntensity=q.intensity,ne.shadowBias=q.bias,ne.shadowNormalBias=q.normalBias,ne.shadowRadius=q.radius,ne.shadowMapSize=q.mapSize,ne.shadowCameraNear=q.camera.near,ne.shadowCameraFar=q.camera.far,i.pointShadow[p]=ne,i.pointShadowMap[p]=K,i.pointShadowMatrix[p]=w.shadow.matrix,b++}i.point[p]=X,p++}else if(w.isHemisphereLight){let X=e.get(w);X.skyColor.copy(w.color).multiplyScalar(G),X.groundColor.copy(w.groundColor).multiplyScalar(G),i.hemi[g]=X,g++}}A>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=Te.LTC_FLOAT_1,i.rectAreaLTC2=Te.LTC_FLOAT_2):(i.rectAreaLTC1=Te.LTC_HALF_1,i.rectAreaLTC2=Te.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=u,i.ambient[2]=d;let P=i.hash;(P.sunLength!==f||P.directionalLength!==x||P.pointLength!==p||P.spotLength!==S||P.rectAreaLength!==A||P.hemiLength!==g||P.numSunShadows!==m||P.numDirectionalShadows!==M||P.numPointShadows!==b||P.numSpotShadows!==I||P.numSpotMaps!==y||P.numLightProbes!==C)&&(i.sun.length=f,i.directional.length=x,i.spot.length=S,i.rectArea.length=A,i.point.length=p,i.hemi.length=g,i.sunShadow.length=m,i.sunShadowMap.length=m,i.sunShadowMatrix.length=v,i.sunShadowCascade.length=v,i.directionalShadow.length=M,i.directionalShadowMap.length=M,i.directionalShadowMatrix.length=M,i.pointShadow.length=b,i.pointShadowMap.length=b,i.pointShadowMatrix.length=b,i.spotShadow.length=I,i.spotShadowMap.length=I,i.spotLightMatrix.length=I+y-E,i.spotLightMap.length=y,i.numSpotLightShadowsWithMaps=E,i.numLightProbes=C,P.sunLength=f,P.directionalLength=x,P.pointLength=p,P.spotLength=S,P.rectAreaLength=A,P.hemiLength=g,P.numSunShadows=m,P.numDirectionalShadows=M,P.numPointShadows=b,P.numSpotShadows=I,P.numSpotMaps=y,P.numLightProbes=C,i.version=Rv++)}function l(c,h){let u=0,d=0,f=0,m=0,v=0,x=0,p=h.matrixWorldInverse;for(let S=0,A=c.length;S<A;S++){let g=c[S];if(g.isSunLight){let M=i.sun[u];M.direction.setFromMatrixPosition(g.matrixWorld),M.direction.transformDirection(p),u++}else if(g.isDirectionalLight){let M=i.directional[d];M.direction.setFromMatrixPosition(g.matrixWorld),s.setFromMatrixPosition(g.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(p),d++}else if(g.isSpotLight){let M=i.spot[m];M.position.setFromMatrixPosition(g.matrixWorld),M.position.applyMatrix4(p),M.direction.setFromMatrixPosition(g.matrixWorld),s.setFromMatrixPosition(g.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(p),m++}else if(g.isRectAreaLight){let M=i.rectArea[v];M.position.setFromMatrixPosition(g.matrixWorld),M.position.applyMatrix4(p),a.identity(),r.copy(g.matrixWorld),r.premultiply(p),a.extractRotation(r),M.halfWidth.set(g.width*.5,0,0),M.halfHeight.set(0,g.height*.5,0),M.halfWidth.applyMatrix4(a),M.halfHeight.applyMatrix4(a),v++}else if(g.isPointLight){let M=i.point[f];M.position.setFromMatrixPosition(g.matrixWorld),M.position.applyMatrix4(p),f++}else if(g.isHemisphereLight){let M=i.hemi[x];M.direction.setFromMatrixPosition(g.matrixWorld),M.direction.transformDirection(p),x++}}}return{setup:o,setupView:l,state:i}}function ap(n){let e=new Iv(n),t=[],i=[],s=[];function r(d){u.camera=d,t.length=0,i.length=0,s.length=0}function a(d){t.push(d)}function o(d){i.push(d)}function l(d){s.push(d)}function c(){e.setup(t)}function h(d){e.setupView(t,d)}let u={lightsArray:t,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:c,setupLightsView:h,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function Pv(n){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new ap(n),e.set(s,[o])):r>=a.length?(o=new ap(n),a.push(o)):o=a[r],o}function i(){e=new WeakMap}return{get:t,dispose:i}}var Dv=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Lv=`uniform sampler2D shadow_pass;
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
}`,Uv=[new D(1,0,0),new D(-1,0,0),new D(0,1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1)],Nv=[new D(0,-1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1),new D(0,-1,0),new D(0,-1,0)],op=new bt,Ka=new D,_u=new D;function Fv(n,e,t){let i=new dr,s=new he,r=new he,a=new Xt,o=new _l,l=new vl,c={},h=t.maxTextureSize,u={[os]:un,[un]:os,[qt]:qt},d=new Bt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new he},radius:{value:4}},vertexShader:Dv,fragmentShader:Lv}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let m=new Et;m.setAttribute("position",new Ht(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let v=new pe(m,d),x=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ua;let p=this.type;this.render=function(b,I,y){if(x.enabled===!1||x.autoUpdate===!1&&x.needsUpdate===!1||b.length===0)return;this.type===Ul&&(Je("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Ua);let E=n.getRenderTarget(),C=n.getActiveCubeFace(),P=n.getActiveMipmapLevel(),B=n.state;B.setBlending(jn),B.buffers.depth.getReversed()===!0?B.buffers.color.setClear(0,0,0,0):B.buffers.color.setClear(1,1,1,1),B.buffers.depth.setTest(!0),B.setScissorTest(!1);let z=p!==this.type;z&&I.traverse(function(w){w.material&&(Array.isArray(w.material)?w.material.forEach(N=>N.needsUpdate=!0):w.material.needsUpdate=!0)});for(let w=0,N=b.length;w<N;w++){let G=b[w],V=G.shadow;if(V===void 0){Je("WebGLShadowMap:",G,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;s.copy(V.mapSize);let K=V.getFrameExtents();s.multiply(K),r.copy(V.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/K.x),s.x=r.x*K.x,V.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/K.y),s.y=r.y*K.y,V.mapSize.y=r.y));let X=n.state.buffers.depth.getReversed();if(V.camera._reversedDepth=X,V.map===null||z===!0){if(V.map!==null&&(V.map.depthTexture!==null&&(V.map.depthTexture.dispose(),V.map.depthTexture=null),V.map.dispose()),this.type===vr){if(G.isPointLight){Je("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}V.map=new tn(s.x,s.y,{format:ds,type:yn,minFilter:xn,magFilter:xn,generateMipmaps:!1}),V.map.texture.name=G.name+".shadowMap",V.map.depthTexture=new ns(s.x,s.y,Qn),V.map.depthTexture.name=G.name+".shadowMapDepth",V.map.depthTexture.format=_i,V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=en,V.map.depthTexture.magFilter=en}else G.isPointLight?(V.map=new wc(s.x),V.map.depthTexture=new ul(s.x,ui)):(V.map=new tn(s.x,s.y),V.map.depthTexture=new ns(s.x,s.y,ui)),V.map.depthTexture.name=G.name+".shadowMap",V.map.depthTexture.format=_i,this.type===Ua?(V.map.depthTexture.compareFunction=X?bc:Mc,V.map.depthTexture.minFilter=xn,V.map.depthTexture.magFilter=xn):(V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=en,V.map.depthTexture.magFilter=en);V.camera.updateProjectionMatrix()}V.map.isWebGLCubeRenderTarget!==!0&&(V.map.width!==s.x||V.map.height!==s.y)&&V.map.setSize(s.x,s.y);let q=V.map.isWebGLCubeRenderTarget?6:V.getViewportCount();G.isPointLight!==!0&&V.updateMatrices(G,y);for(let ne=0;ne<q;ne++){let Ie=V.getCamera(ne);if(G.isPointLight){let Ce=V.camera,gt=V.matrix,Ye=G.distance||Ce.far;Ye!==Ce.far&&(Ce.far=Ye,Ce.updateProjectionMatrix()),Ka.setFromMatrixPosition(G.matrixWorld),Ce.position.copy(Ka),_u.copy(Ce.position),_u.add(Uv[ne]),Ce.up.copy(Nv[ne]),Ce.lookAt(_u),Ce.updateMatrixWorld(),gt.makeTranslation(-Ka.x,-Ka.y,-Ka.z),op.multiplyMatrices(Ce.projectionMatrix,Ce.matrixWorldInverse),V._frustum.setFromProjectionMatrix(op,Ce.coordinateSystem,Ce.reversedDepth)}if(V.map.isWebGLCubeRenderTarget)n.setRenderTarget(V.map,ne),n.clear();else{ne===0&&(n.setRenderTarget(V.map),n.clear());let Ce=V.getViewport(ne);a.set(r.x*Ce.x,r.y*Ce.y,r.x*Ce.z,r.y*Ce.w),B.viewport(a)}i=V.getFrustum(ne),g(I,y,Ie,G,this.type)}V.isPointLightShadow!==!0&&this.type===vr&&S(V,y),V.needsUpdate=!1}p=this.type,x.needsUpdate=!1,n.setRenderTarget(E,C,P)};function S(b,I){let y=e.update(v);d.defines.VSM_SAMPLES!==b.blurSamples&&(d.defines.VSM_SAMPLES=b.blurSamples,f.defines.VSM_SAMPLES=b.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),b.mapPass===null?b.mapPass=new tn(s.x,s.y,{format:ds,type:yn}):(b.mapPass.width!==b.map.width||b.mapPass.height!==b.map.height)&&b.mapPass.setSize(b.map.width,b.map.height),d.uniforms.shadow_pass.value=b.map.depthTexture,d.uniforms.resolution.value.set(b.map.width,b.map.height),d.uniforms.radius.value=b.radius,n.setRenderTarget(b.mapPass),n.clear(),n.renderBufferDirect(I,null,y,d,v,null),f.uniforms.shadow_pass.value=b.mapPass.texture,f.uniforms.resolution.value.set(b.map.width,b.map.height),f.uniforms.radius.value=b.radius,n.setRenderTarget(b.map),n.clear(),n.renderBufferDirect(I,null,y,f,v,null)}function A(b,I,y,E){let C=null,P=y.isPointLight===!0?b.customDistanceMaterial:b.customDepthMaterial;if(P!==void 0)C=P;else if(C=y.isPointLight===!0?l:o,n.localClippingEnabled&&I.clipShadows===!0&&Array.isArray(I.clippingPlanes)&&I.clippingPlanes.length!==0||I.displacementMap&&I.displacementScale!==0||I.alphaMap&&I.alphaTest>0||I.map&&I.alphaTest>0||I.alphaToCoverage===!0){let B=C.uuid,z=I.uuid,w=c[B];w===void 0&&(w={},c[B]=w);let N=w[z];N===void 0&&(N=C.clone(),w[z]=N,I.addEventListener("dispose",M)),C=N}if(C.visible=I.visible,C.wireframe=I.wireframe,E===vr?C.side=I.shadowSide!==null?I.shadowSide:I.side:C.side=I.shadowSide!==null?I.shadowSide:u[I.side],C.alphaMap=I.alphaMap,C.alphaTest=I.alphaToCoverage===!0?.5:I.alphaTest,C.map=I.map,C.clipShadows=I.clipShadows,C.clippingPlanes=I.clippingPlanes,C.clipIntersection=I.clipIntersection,C.displacementMap=I.displacementMap,C.displacementScale=I.displacementScale,C.displacementBias=I.displacementBias,C.wireframeLinewidth=I.wireframeLinewidth,C.linewidth=I.linewidth,y.isPointLight===!0&&C.isMeshDistanceMaterial===!0){let B=n.properties.get(C);B.light=y}return C}function g(b,I,y,E,C){if(b.visible===!1)return;if(b.layers.test(I.layers)&&(b.isMesh||b.isLine||b.isPoints)&&(b.castShadow||b.receiveShadow&&C===vr)&&(!b.frustumCulled||b.intersectsFrustum(i))){b.modelViewMatrix.multiplyMatrices(y.matrixWorldInverse,b.matrixWorld);let z=e.update(b),w=b.material;if(Array.isArray(w)){let N=z.groups;for(let G=0,V=N.length;G<V;G++){let K=N[G],X=w[K.materialIndex];if(X&&X.visible){let q=A(b,X,E,C);b.onBeforeShadow(n,b,I,y,z,q,K),n.renderBufferDirect(y,null,z,q,b,K),b.onAfterShadow(n,b,I,y,z,q,K)}}}else if(w.visible){let N=A(b,w,E,C);b.onBeforeShadow(n,b,I,y,z,N,null),n.renderBufferDirect(y,null,z,N,b,null),b.onAfterShadow(n,b,I,y,z,N,null)}}let B=b.children;for(let z=0,w=B.length;z<w;z++)g(B[z],I,y,E,C)}function M(b){b.target.removeEventListener("dispose",M);for(let y in c){let E=c[y],C=b.target.uuid;C in E&&(E[C].dispose(),delete E[C])}}}function Bv(n,e){function t(){let L=!1,ce=new Xt,Q=null,_e=new Xt(0,0,0,0);return{setMask:function(we){Q!==we&&!L&&(n.colorMask(we,we,we,we),Q=we)},setLocked:function(we){L=we},setClear:function(we,le,We,ke,zt){zt===!0&&(we*=ke,le*=ke,We*=ke),ce.set(we,le,We,ke),_e.equals(ce)===!1&&(n.clearColor(we,le,We,ke),_e.copy(ce))},reset:function(){L=!1,Q=null,_e.set(-1,0,0,0)}}}function i(){let L=!1,ce=!1,Q=null,_e=null,we=null;return{setReversed:function(le){if(ce!==le){let We=e.get("EXT_clip_control");le?We.clipControlEXT(We.LOWER_LEFT_EXT,We.ZERO_TO_ONE_EXT):We.clipControlEXT(We.LOWER_LEFT_EXT,We.NEGATIVE_ONE_TO_ONE_EXT),ce=le;let ke=we;we=null,this.setClear(ke)}},getReversed:function(){return ce},setTest:function(le){le?ae(n.DEPTH_TEST):ge(n.DEPTH_TEST)},setMask:function(le){Q!==le&&!L&&(n.depthMask(le),Q=le)},setFunc:function(le){if(ce&&(le=Lf[le]),_e!==le){switch(le){case $o:n.depthFunc(n.NEVER);break;case Jo:n.depthFunc(n.ALWAYS);break;case Ko:n.depthFunc(n.LESS);break;case sr:n.depthFunc(n.LEQUAL);break;case jo:n.depthFunc(n.EQUAL);break;case Qo:n.depthFunc(n.GEQUAL);break;case el:n.depthFunc(n.GREATER);break;case tl:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}_e=le}},setLocked:function(le){L=le},setClear:function(le){we!==le&&(we=le,ce&&(le=1-le),n.clearDepth(le))},reset:function(){L=!1,Q=null,_e=null,we=null,ce=!1}}}function s(){let L=!1,ce=null,Q=null,_e=null,we=null,le=null,We=null,ke=null,zt=null;return{setTest:function(Dt){L||(Dt?ae(n.STENCIL_TEST):ge(n.STENCIL_TEST))},setMask:function(Dt){ce!==Dt&&!L&&(n.stencilMask(Dt),ce=Dt)},setFunc:function(Dt,ii,mi){(Q!==Dt||_e!==ii||we!==mi)&&(n.stencilFunc(Dt,ii,mi),Q=Dt,_e=ii,we=mi)},setOp:function(Dt,ii,mi){(le!==Dt||We!==ii||ke!==mi)&&(n.stencilOp(Dt,ii,mi),le=Dt,We=ii,ke=mi)},setLocked:function(Dt){L=Dt},setClear:function(Dt){zt!==Dt&&(n.clearStencil(Dt),zt=Dt)},reset:function(){L=!1,ce=null,Q=null,_e=null,we=null,le=null,We=null,ke=null,zt=null}}}let r=new t,a=new i,o=new s,l=new WeakMap,c=new WeakMap,h={},u={},d={},f=new WeakMap,m=[],v=null,x=!1,p=null,S=null,A=null,g=null,M=null,b=null,I=null,y=new Fe(0,0,0),E=0,C=!1,P=null,B=null,z=null,w=null,N=null,G=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),V=!1,K=0,X=n.getParameter(n.VERSION);X.indexOf("WebGL")!==-1?(K=parseFloat(/^WebGL (\d)/.exec(X)[1]),V=K>=1):X.indexOf("OpenGL ES")!==-1&&(K=parseFloat(/^OpenGL ES (\d)/.exec(X)[1]),V=K>=2);let q=null,ne={},Ie=n.getParameter(n.SCISSOR_BOX),Ce=n.getParameter(n.VIEWPORT),gt=new Xt().fromArray(Ie),Ye=new Xt().fromArray(Ce);function ct(L,ce,Q,_e){let we=new Uint8Array(4),le=n.createTexture();n.bindTexture(L,le),n.texParameteri(L,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(L,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let We=0;We<Q;We++)L===n.TEXTURE_3D||L===n.TEXTURE_2D_ARRAY?n.texImage3D(ce,0,n.RGBA,1,1,_e,0,n.RGBA,n.UNSIGNED_BYTE,we):n.texImage2D(ce+We,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,we);return le}let ee={};ee[n.TEXTURE_2D]=ct(n.TEXTURE_2D,n.TEXTURE_2D,1),ee[n.TEXTURE_CUBE_MAP]=ct(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),ee[n.TEXTURE_2D_ARRAY]=ct(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),ee[n.TEXTURE_3D]=ct(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ae(n.DEPTH_TEST),a.setFunc(sr),fe(!1),Me(Gh),ae(n.CULL_FACE),ue(jn);function ae(L){h[L]!==!0&&(n.enable(L),h[L]=!0)}function ge(L){h[L]!==!1&&(n.disable(L),h[L]=!1)}function $e(L,ce){return d[L]!==ce?(n.bindFramebuffer(L,ce),d[L]=ce,L===n.DRAW_FRAMEBUFFER&&(d[n.FRAMEBUFFER]=ce),L===n.FRAMEBUFFER&&(d[n.DRAW_FRAMEBUFFER]=ce),!0):!1}function be(L,ce){let Q=m,_e=!1;if(L){Q=f.get(ce),Q===void 0&&(Q=[],f.set(ce,Q));let we=L.textures;if(Q.length!==we.length||Q[0]!==n.COLOR_ATTACHMENT0){for(let le=0,We=we.length;le<We;le++)Q[le]=n.COLOR_ATTACHMENT0+le;Q.length=we.length,_e=!0}}else Q[0]!==n.BACK&&(Q[0]=n.BACK,_e=!0);_e&&n.drawBuffers(Q)}function Qe(L){return v!==L?(n.useProgram(L),v=L,!0):!1}let At={[Cs]:n.FUNC_ADD,[Qd]:n.FUNC_SUBTRACT,[ef]:n.FUNC_REVERSE_SUBTRACT};At[tf]=n.MIN,At[nf]=n.MAX;let oe={[sf]:n.ZERO,[rf]:n.ONE,[af]:n.SRC_COLOR,[Xh]:n.SRC_ALPHA,[df]:n.SRC_ALPHA_SATURATE,[hf]:n.DST_COLOR,[lf]:n.DST_ALPHA,[of]:n.ONE_MINUS_SRC_COLOR,[qh]:n.ONE_MINUS_SRC_ALPHA,[uf]:n.ONE_MINUS_DST_COLOR,[cf]:n.ONE_MINUS_DST_ALPHA,[ff]:n.CONSTANT_COLOR,[pf]:n.ONE_MINUS_CONSTANT_COLOR,[mf]:n.CONSTANT_ALPHA,[gf]:n.ONE_MINUS_CONSTANT_ALPHA};function ue(L,ce,Q,_e,we,le,We,ke,zt,Dt){if(L===jn){x===!0&&(ge(n.BLEND),x=!1);return}if(x===!1&&(ae(n.BLEND),x=!0),L!==jd){if(L!==p||Dt!==C){if((S!==Cs||M!==Cs)&&(n.blendEquation(n.FUNC_ADD),S=Cs,M=Cs),Dt)switch(L){case ls:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case sn:n.blendFunc(n.ONE,n.ONE);break;case Vh:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Wh:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:tt("WebGLState: Invalid blending: ",L);break}else switch(L){case ls:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case sn:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case Vh:tt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Wh:tt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:tt("WebGLState: Invalid blending: ",L);break}A=null,g=null,b=null,I=null,y.set(0,0,0),E=0,p=L,C=Dt}return}we=we||ce,le=le||Q,We=We||_e,(ce!==S||we!==M)&&(n.blendEquationSeparate(At[ce],At[we]),S=ce,M=we),(Q!==A||_e!==g||le!==b||We!==I)&&(n.blendFuncSeparate(oe[Q],oe[_e],oe[le],oe[We]),A=Q,g=_e,b=le,I=We),(ke.equals(y)===!1||zt!==E)&&(n.blendColor(ke.r,ke.g,ke.b,zt),y.copy(ke),E=zt),p=L,C=!1}function de(L,ce){L.side===qt?ge(n.CULL_FACE):ae(n.CULL_FACE);let Q=L.side===un;ce&&(Q=!Q),fe(Q),L.blending===ls&&L.transparent===!1?ue(jn):ue(L.blending,L.blendEquation,L.blendSrc,L.blendDst,L.blendEquationAlpha,L.blendSrcAlpha,L.blendDstAlpha,L.blendColor,L.blendAlpha,L.premultipliedAlpha),a.setFunc(L.depthFunc),a.setTest(L.depthTest),a.setMask(L.depthWrite),r.setMask(L.colorWrite);let _e=L.stencilWrite;o.setTest(_e),_e&&(o.setMask(L.stencilWriteMask),o.setFunc(L.stencilFunc,L.stencilRef,L.stencilFuncMask),o.setOp(L.stencilFail,L.stencilZFail,L.stencilZPass)),Ve(L.polygonOffset,L.polygonOffsetFactor,L.polygonOffsetUnits),L.alphaToCoverage===!0?ae(n.SAMPLE_ALPHA_TO_COVERAGE):ge(n.SAMPLE_ALPHA_TO_COVERAGE)}function fe(L){P!==L&&(L?n.frontFace(n.CW):n.frontFace(n.CCW),P=L)}function Me(L){L!==Jd?(ae(n.CULL_FACE),L!==B&&(L===Gh?n.cullFace(n.BACK):L===Kd?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):ge(n.CULL_FACE),B=L}function ze(L){L!==z&&(V&&n.lineWidth(L),z=L)}function Ve(L,ce,Q){L?(ae(n.POLYGON_OFFSET_FILL),(w!==ce||N!==Q)&&(w=ce,N=Q,a.getReversed()&&(ce=-ce),n.polygonOffset(ce,Q))):ge(n.POLYGON_OFFSET_FILL)}function Ke(L){L?ae(n.SCISSOR_TEST):ge(n.SCISSOR_TEST)}function et(L){L===void 0&&(L=n.TEXTURE0+G-1),q!==L&&(n.activeTexture(L),q=L)}function F(L,ce,Q){Q===void 0&&(q===null?Q=n.TEXTURE0+G-1:Q=q);let _e=ne[Q];_e===void 0&&(_e={type:void 0,texture:void 0},ne[Q]=_e),(_e.type!==L||_e.texture!==ce)&&(q!==Q&&(n.activeTexture(Q),q=Q),n.bindTexture(L,ce||ee[L]),_e.type=L,_e.texture=ce)}function Rt(){let L=ne[q];L!==void 0&&L.type!==void 0&&(n.bindTexture(L.type,null),L.type=void 0,L.texture=void 0)}function at(){try{n.compressedTexImage2D(...arguments)}catch(L){tt("WebGLState:",L)}}function R(){try{n.compressedTexImage3D(...arguments)}catch(L){tt("WebGLState:",L)}}function _(){try{n.texSubImage2D(...arguments)}catch(L){tt("WebGLState:",L)}}function W(){try{n.texSubImage3D(...arguments)}catch(L){tt("WebGLState:",L)}}function $(){try{n.compressedTexSubImage2D(...arguments)}catch(L){tt("WebGLState:",L)}}function te(){try{n.compressedTexSubImage3D(...arguments)}catch(L){tt("WebGLState:",L)}}function xe(){try{n.texStorage2D(...arguments)}catch(L){tt("WebGLState:",L)}}function ve(){try{n.texStorage3D(...arguments)}catch(L){tt("WebGLState:",L)}}function ie(){try{n.texImage2D(...arguments)}catch(L){tt("WebGLState:",L)}}function re(){try{n.texImage3D(...arguments)}catch(L){tt("WebGLState:",L)}}function Se(L){return u[L]!==void 0?u[L]:n.getParameter(L)}function Ge(L,ce){u[L]!==ce&&(n.pixelStorei(L,ce),u[L]=ce)}function Ee(L){gt.equals(L)===!1&&(n.scissor(L.x,L.y,L.z,L.w),gt.copy(L))}function H(L){Ye.equals(L)===!1&&(n.viewport(L.x,L.y,L.z,L.w),Ye.copy(L))}function J(L,ce){let Q=c.get(ce);Q===void 0&&(Q=new WeakMap,c.set(ce,Q));let _e=Q.get(L);_e===void 0&&(_e=n.getUniformBlockIndex(ce,L.name),Q.set(L,_e))}function se(L,ce){let _e=c.get(ce).get(L);l.get(ce)!==_e&&(n.uniformBlockBinding(ce,_e,L.__bindingPointIndex),l.set(ce,_e))}function me(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),a.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),n.pixelStorei(n.PACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!1),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,n.BROWSER_DEFAULT_WEBGL),n.pixelStorei(n.PACK_ROW_LENGTH,0),n.pixelStorei(n.PACK_SKIP_PIXELS,0),n.pixelStorei(n.PACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_ROW_LENGTH,0),n.pixelStorei(n.UNPACK_IMAGE_HEIGHT,0),n.pixelStorei(n.UNPACK_SKIP_PIXELS,0),n.pixelStorei(n.UNPACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_SKIP_IMAGES,0),h={},u={},q=null,ne={},d={},f=new WeakMap,m=[],v=null,x=!1,p=null,S=null,A=null,g=null,M=null,b=null,I=null,y=new Fe(0,0,0),E=0,C=!1,P=null,B=null,z=null,w=null,N=null,gt.set(0,0,n.canvas.width,n.canvas.height),Ye.set(0,0,n.canvas.width,n.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:ae,disable:ge,bindFramebuffer:$e,drawBuffers:be,useProgram:Qe,setBlending:ue,setMaterial:de,setFlipSided:fe,setCullFace:Me,setLineWidth:ze,setPolygonOffset:Ve,setScissorTest:Ke,activeTexture:et,bindTexture:F,unbindTexture:Rt,compressedTexImage2D:at,compressedTexImage3D:R,texImage2D:ie,texImage3D:re,pixelStorei:Ge,getParameter:Se,updateUBOMapping:J,uniformBlockBinding:se,texStorage2D:xe,texStorage3D:ve,texSubImage2D:_,texSubImage3D:W,compressedTexSubImage2D:$,compressedTexSubImage3D:te,scissor:Ee,viewport:H,reset:me}}function Ov(n,e,t,i,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new he,h=new WeakMap,u=new Set,d,f=new WeakMap,m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(R,_){return m?new OffscreenCanvas(R,_):ra("canvas")}function x(R,_,W){let $=1,te=at(R);if((te.width>W||te.height>W)&&($=W/Math.max(te.width,te.height)),$<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){let xe=Math.floor($*te.width),ve=Math.floor($*te.height);d===void 0&&(d=v(xe,ve));let ie=_?v(xe,ve):d;return ie.width=xe,ie.height=ve,ie.getContext("2d").drawImage(R,0,0,xe,ve),Je("WebGLRenderer: Texture has been resized from ("+te.width+"x"+te.height+") to ("+xe+"x"+ve+")."),ie}else return"data"in R&&Je("WebGLRenderer: Image in DataTexture is too big ("+te.width+"x"+te.height+")."),R;return R}function p(R){return R.generateMipmaps}function S(R){n.generateMipmap(R)}function A(R){return R.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?n.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function g(R,_,W,$,te,xe=!1){if(R!==null){if(n[R]!==void 0)return n[R];Je("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let ve;$&&(ve=e.get("EXT_texture_norm16"),ve||Je("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let ie=_;if(_===n.RED&&(W===n.FLOAT&&(ie=n.R32F),W===n.HALF_FLOAT&&(ie=n.R16F),W===n.UNSIGNED_BYTE&&(ie=n.R8),W===n.UNSIGNED_SHORT&&ve&&(ie=ve.R16_EXT),W===n.SHORT&&ve&&(ie=ve.R16_SNORM_EXT)),_===n.RED_INTEGER&&(W===n.UNSIGNED_BYTE&&(ie=n.R8UI),W===n.UNSIGNED_SHORT&&(ie=n.R16UI),W===n.UNSIGNED_INT&&(ie=n.R32UI),W===n.BYTE&&(ie=n.R8I),W===n.SHORT&&(ie=n.R16I),W===n.INT&&(ie=n.R32I)),_===n.RG&&(W===n.FLOAT&&(ie=n.RG32F),W===n.HALF_FLOAT&&(ie=n.RG16F),W===n.UNSIGNED_BYTE&&(ie=n.RG8),W===n.UNSIGNED_SHORT&&ve&&(ie=ve.RG16_EXT),W===n.SHORT&&ve&&(ie=ve.RG16_SNORM_EXT)),_===n.RG_INTEGER&&(W===n.UNSIGNED_BYTE&&(ie=n.RG8UI),W===n.UNSIGNED_SHORT&&(ie=n.RG16UI),W===n.UNSIGNED_INT&&(ie=n.RG32UI),W===n.BYTE&&(ie=n.RG8I),W===n.SHORT&&(ie=n.RG16I),W===n.INT&&(ie=n.RG32I)),_===n.RGB_INTEGER&&(W===n.UNSIGNED_BYTE&&(ie=n.RGB8UI),W===n.UNSIGNED_SHORT&&(ie=n.RGB16UI),W===n.UNSIGNED_INT&&(ie=n.RGB32UI),W===n.BYTE&&(ie=n.RGB8I),W===n.SHORT&&(ie=n.RGB16I),W===n.INT&&(ie=n.RGB32I)),_===n.RGBA_INTEGER&&(W===n.UNSIGNED_BYTE&&(ie=n.RGBA8UI),W===n.UNSIGNED_SHORT&&(ie=n.RGBA16UI),W===n.UNSIGNED_INT&&(ie=n.RGBA32UI),W===n.BYTE&&(ie=n.RGBA8I),W===n.SHORT&&(ie=n.RGBA16I),W===n.INT&&(ie=n.RGBA32I)),_===n.RGB&&(W===n.UNSIGNED_SHORT&&ve&&(ie=ve.RGB16_EXT),W===n.SHORT&&ve&&(ie=ve.RGB16_SNORM_EXT),W===n.UNSIGNED_INT_5_9_9_9_REV&&(ie=n.RGB9_E5),W===n.UNSIGNED_INT_10F_11F_11F_REV&&(ie=n.R11F_G11F_B10F)),_===n.RGBA){let re=xe?sa:yt.getTransfer(te);W===n.FLOAT&&(ie=n.RGBA32F),W===n.HALF_FLOAT&&(ie=n.RGBA16F),W===n.UNSIGNED_BYTE&&(ie=re===Ct?n.SRGB8_ALPHA8:n.RGBA8),W===n.UNSIGNED_SHORT&&ve&&(ie=ve.RGBA16_EXT),W===n.SHORT&&ve&&(ie=ve.RGBA16_SNORM_EXT),W===n.UNSIGNED_SHORT_4_4_4_4&&(ie=n.RGBA4),W===n.UNSIGNED_SHORT_5_5_5_1&&(ie=n.RGB5_A1)}return(ie===n.R16F||ie===n.R32F||ie===n.RG16F||ie===n.RG32F||ie===n.RGBA16F||ie===n.RGBA32F)&&e.get("EXT_color_buffer_float"),ie}function M(R,_){let W;return R?_===null||_===ui||_===br?W=n.DEPTH24_STENCIL8:_===Qn?W=n.DEPTH32F_STENCIL8:_===Mr&&(W=n.DEPTH24_STENCIL8,Je("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===ui||_===br?W=n.DEPTH_COMPONENT24:_===Qn?W=n.DEPTH_COMPONENT32F:_===Mr&&(W=n.DEPTH_COMPONENT16),W}function b(R,_){return p(R)===!0||R.isFramebufferTexture&&R.minFilter!==en&&R.minFilter!==xn?Math.log2(Math.max(_.width,_.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?_.mipmaps.length:1}function I(R){let _=R.target;_.removeEventListener("dispose",I),E(_),_.isVideoTexture&&h.delete(_),_.isHTMLTexture&&u.delete(_)}function y(R){let _=R.target;_.removeEventListener("dispose",y),P(_)}function E(R){let _=i.get(R);if(_.__webglInit===void 0)return;let W=R.source,$=f.get(W);if($){let te=$[_.__cacheKey];te.usedTimes--,te.usedTimes===0&&C(R),Object.keys($).length===0&&f.delete(W)}i.remove(R)}function C(R){let _=i.get(R);n.deleteTexture(_.__webglTexture);let W=R.source,$=f.get(W);delete $[_.__cacheKey],a.memory.textures--}function P(R){let _=i.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),i.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let $=0;$<6;$++){if(Array.isArray(_.__webglFramebuffer[$]))for(let te=0;te<_.__webglFramebuffer[$].length;te++)n.deleteFramebuffer(_.__webglFramebuffer[$][te]);else n.deleteFramebuffer(_.__webglFramebuffer[$]);_.__webglDepthbuffer&&n.deleteRenderbuffer(_.__webglDepthbuffer[$])}else{if(Array.isArray(_.__webglFramebuffer))for(let $=0;$<_.__webglFramebuffer.length;$++)n.deleteFramebuffer(_.__webglFramebuffer[$]);else n.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&n.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&n.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let $=0;$<_.__webglColorRenderbuffer.length;$++)_.__webglColorRenderbuffer[$]&&n.deleteRenderbuffer(_.__webglColorRenderbuffer[$]);_.__webglDepthRenderbuffer&&n.deleteRenderbuffer(_.__webglDepthRenderbuffer)}let W=R.textures;for(let $=0,te=W.length;$<te;$++){let xe=i.get(W[$]);xe.__webglTexture&&(n.deleteTexture(xe.__webglTexture),a.memory.textures--),i.remove(W[$])}i.remove(R)}let B=0;function z(){B=0}function w(){return B}function N(R){B=R}function G(){let R=B;return R>=s.maxTextures&&Je("WebGLTextures: Trying to use "+(R+1)+" texture units while this GPU supports only "+s.maxTextures),B+=1,R}function V(R){let _=[];return _.push(R.wrapS),_.push(R.wrapT),_.push(R.wrapR||0),_.push(R.magFilter),_.push(R.minFilter),_.push(R.anisotropy),_.push(R.internalFormat),_.push(R.format),_.push(R.type),_.push(R.generateMipmaps),_.push(R.premultiplyAlpha),_.push(R.flipY),_.push(R.unpackAlignment),_.push(R.colorSpace),_.join()}function K(R,_){let W=i.get(R);if(R.isVideoTexture&&F(R),R.isRenderTargetTexture===!1&&R.isExternalTexture!==!0&&R.version>0&&W.__version!==R.version){let $=R.image;if($===null)Je("WebGLRenderer: Texture marked for update but no image data found.");else if($.complete===!1)Je("WebGLRenderer: Texture marked for update but image is incomplete");else{ge(W,R,_);return}}else R.isExternalTexture&&(W.__webglTexture=R.sourceTexture?R.sourceTexture:null);t.bindTexture(n.TEXTURE_2D,W.__webglTexture,n.TEXTURE0+_)}function X(R,_){let W=i.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&W.__version!==R.version){ge(W,R,_);return}else R.isExternalTexture&&(W.__webglTexture=R.sourceTexture?R.sourceTexture:null);t.bindTexture(n.TEXTURE_2D_ARRAY,W.__webglTexture,n.TEXTURE0+_)}function q(R,_){let W=i.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&W.__version!==R.version){ge(W,R,_);return}t.bindTexture(n.TEXTURE_3D,W.__webglTexture,n.TEXTURE0+_)}function ne(R,_){let W=i.get(R);if(R.isCubeDepthTexture!==!0&&R.version>0&&W.__version!==R.version){$e(W,R,_);return}t.bindTexture(n.TEXTURE_CUBE_MAP,W.__webglTexture,n.TEXTURE0+_)}let Ie={[Ts]:n.REPEAT,[yi]:n.CLAMP_TO_EDGE,[nl]:n.MIRRORED_REPEAT},Ce={[en]:n.NEAREST,[_f]:n.NEAREST_MIPMAP_NEAREST,[Ga]:n.NEAREST_MIPMAP_LINEAR,[xn]:n.LINEAR,[Bl]:n.LINEAR_MIPMAP_NEAREST,[hs]:n.LINEAR_MIPMAP_LINEAR},gt={[Sf]:n.NEVER,[Rf]:n.ALWAYS,[Ef]:n.LESS,[Mc]:n.LEQUAL,[Tf]:n.EQUAL,[bc]:n.GEQUAL,[wf]:n.GREATER,[Af]:n.NOTEQUAL};function Ye(R,_){if(_.type===Qn&&e.has("OES_texture_float_linear")===!1&&(_.magFilter===xn||_.magFilter===Bl||_.magFilter===Ga||_.magFilter===hs||_.minFilter===xn||_.minFilter===Bl||_.minFilter===Ga||_.minFilter===hs)&&Je("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(R,n.TEXTURE_WRAP_S,Ie[_.wrapS]),n.texParameteri(R,n.TEXTURE_WRAP_T,Ie[_.wrapT]),(R===n.TEXTURE_3D||R===n.TEXTURE_2D_ARRAY)&&n.texParameteri(R,n.TEXTURE_WRAP_R,Ie[_.wrapR]),n.texParameteri(R,n.TEXTURE_MAG_FILTER,Ce[_.magFilter]),n.texParameteri(R,n.TEXTURE_MIN_FILTER,Ce[_.minFilter]),_.compareFunction&&(n.texParameteri(R,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(R,n.TEXTURE_COMPARE_FUNC,gt[_.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===en||_.minFilter!==Ga&&_.minFilter!==hs||_.type===Qn&&e.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||i.get(_).__currentAnisotropy){let W=e.get("EXT_texture_filter_anisotropic");n.texParameterf(R,W.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),i.get(_).__currentAnisotropy=_.anisotropy}}}function ct(R,_){let W=!1;R.__webglInit===void 0&&(R.__webglInit=!0,_.addEventListener("dispose",I));let $=_.source,te=f.get($);te===void 0&&(te={},f.set($,te));let xe=V(_);if(xe!==R.__cacheKey){te[xe]===void 0&&(te[xe]={texture:n.createTexture(),usedTimes:0},a.memory.textures++,W=!0),te[xe].usedTimes++;let ve=te[R.__cacheKey];ve!==void 0&&(te[R.__cacheKey].usedTimes--,ve.usedTimes===0&&C(_)),R.__cacheKey=xe,R.__webglTexture=te[xe].texture}return W}function ee(R,_,W){return Math.floor(Math.floor(R/W)/_)}function ae(R,_,W,$){let xe=R.updateRanges;if(xe.length===0)t.texSubImage2D(n.TEXTURE_2D,0,0,0,_.width,_.height,W,$,_.data);else{xe.sort((Ge,Ee)=>Ge.start-Ee.start);let ve=0;for(let Ge=1;Ge<xe.length;Ge++){let Ee=xe[ve],H=xe[Ge],J=Ee.start+Ee.count,se=ee(H.start,_.width,4),me=ee(Ee.start,_.width,4);H.start<=J+1&&se===me&&ee(H.start+H.count-1,_.width,4)===se?Ee.count=Math.max(Ee.count,H.start+H.count-Ee.start):(++ve,xe[ve]=H)}xe.length=ve+1;let ie=t.getParameter(n.UNPACK_ROW_LENGTH),re=t.getParameter(n.UNPACK_SKIP_PIXELS),Se=t.getParameter(n.UNPACK_SKIP_ROWS);t.pixelStorei(n.UNPACK_ROW_LENGTH,_.width);for(let Ge=0,Ee=xe.length;Ge<Ee;Ge++){let H=xe[Ge],J=Math.floor(H.start/4),se=Math.ceil(H.count/4),me=J%_.width,L=Math.floor(J/_.width),ce=se,Q=1;t.pixelStorei(n.UNPACK_SKIP_PIXELS,me),t.pixelStorei(n.UNPACK_SKIP_ROWS,L),t.texSubImage2D(n.TEXTURE_2D,0,me,L,ce,Q,W,$,_.data)}R.clearUpdateRanges(),t.pixelStorei(n.UNPACK_ROW_LENGTH,ie),t.pixelStorei(n.UNPACK_SKIP_PIXELS,re),t.pixelStorei(n.UNPACK_SKIP_ROWS,Se)}}function ge(R,_,W){let $=n.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&($=n.TEXTURE_2D_ARRAY),_.isData3DTexture&&($=n.TEXTURE_3D);let te=ct(R,_),xe=_.source;t.bindTexture($,R.__webglTexture,n.TEXTURE0+W);let ve=i.get(xe);if(xe.version!==ve.__version||te===!0){if(t.activeTexture(n.TEXTURE0+W),(typeof ImageBitmap<"u"&&_.image instanceof ImageBitmap)===!1){let Q=yt.getPrimaries(yt.workingColorSpace),_e=_.colorSpace===Bi?null:yt.getPrimaries(_.colorSpace),we=_.colorSpace===Bi||Q===_e?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,_.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,we)}t.pixelStorei(n.UNPACK_ALIGNMENT,_.unpackAlignment);let re=x(_.image,!1,s.maxTextureSize);re=Rt(_,re);let Se=r.convert(_.format,_.colorSpace),Ge=r.convert(_.type),Ee=g(_.internalFormat,Se,Ge,_.normalized,_.colorSpace,_.isVideoTexture);Ye($,_);let H,J=_.mipmaps,se=_.isVideoTexture!==!0,me=ve.__version===void 0||te===!0,L=xe.dataReady,ce=b(_,re);if(_.isDepthTexture)Ee=M(_.format===us,_.type),me&&(se?t.texStorage2D(n.TEXTURE_2D,1,Ee,re.width,re.height):t.texImage2D(n.TEXTURE_2D,0,Ee,re.width,re.height,0,Se,Ge,null));else if(_.isDataTexture)if(J.length>0){se&&me&&t.texStorage2D(n.TEXTURE_2D,ce,Ee,J[0].width,J[0].height);for(let Q=0,_e=J.length;Q<_e;Q++)H=J[Q],se?L&&t.texSubImage2D(n.TEXTURE_2D,Q,0,0,H.width,H.height,Se,Ge,H.data):t.texImage2D(n.TEXTURE_2D,Q,Ee,H.width,H.height,0,Se,Ge,H.data);_.generateMipmaps=!1}else se?(me&&t.texStorage2D(n.TEXTURE_2D,ce,Ee,re.width,re.height),L&&ae(_,re,Se,Ge)):t.texImage2D(n.TEXTURE_2D,0,Ee,re.width,re.height,0,Se,Ge,re.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){se&&me&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ce,Ee,J[0].width,J[0].height,re.depth);for(let Q=0,_e=J.length;Q<_e;Q++)if(H=J[Q],_.format!==Fn)if(Se!==null)if(se){if(L)if(_.layerUpdates.size>0){let we=lu(H.width,H.height,_.format,_.type);for(let le of _.layerUpdates){let We=H.data.subarray(le*we/H.data.BYTES_PER_ELEMENT,(le+1)*we/H.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Q,0,0,le,H.width,H.height,1,Se,We)}}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Q,0,0,0,H.width,H.height,re.depth,Se,H.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,Q,Ee,H.width,H.height,re.depth,0,H.data,0,0);else Je("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else se?L&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,Q,0,0,0,H.width,H.height,re.depth,Se,Ge,H.data):t.texImage3D(n.TEXTURE_2D_ARRAY,Q,Ee,H.width,H.height,re.depth,0,Se,Ge,H.data);_.layerUpdates.size>0&&_.clearLayerUpdates()}else{se&&me&&t.texStorage2D(n.TEXTURE_2D,ce,Ee,J[0].width,J[0].height);for(let Q=0,_e=J.length;Q<_e;Q++)H=J[Q],_.format!==Fn?Se!==null?se?L&&t.compressedTexSubImage2D(n.TEXTURE_2D,Q,0,0,H.width,H.height,Se,H.data):t.compressedTexImage2D(n.TEXTURE_2D,Q,Ee,H.width,H.height,0,H.data):Je("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):se?L&&t.texSubImage2D(n.TEXTURE_2D,Q,0,0,H.width,H.height,Se,Ge,H.data):t.texImage2D(n.TEXTURE_2D,Q,Ee,H.width,H.height,0,Se,Ge,H.data)}else if(_.isDataArrayTexture)if(se){if(me&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ce,Ee,re.width,re.height,re.depth),L)if(_.layerUpdates.size>0){let Q=lu(re.width,re.height,_.format,_.type);for(let _e of _.layerUpdates){let we=re.data.subarray(_e*Q/re.data.BYTES_PER_ELEMENT,(_e+1)*Q/re.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,_e,re.width,re.height,1,Se,Ge,we)}_.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,re.width,re.height,re.depth,Se,Ge,re.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,Ee,re.width,re.height,re.depth,0,Se,Ge,re.data);else if(_.isData3DTexture)se?(me&&t.texStorage3D(n.TEXTURE_3D,ce,Ee,re.width,re.height,re.depth),L&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,re.width,re.height,re.depth,Se,Ge,re.data)):t.texImage3D(n.TEXTURE_3D,0,Ee,re.width,re.height,re.depth,0,Se,Ge,re.data);else if(_.isFramebufferTexture){if(me)if(se)t.texStorage2D(n.TEXTURE_2D,ce,Ee,re.width,re.height);else{let Q=re.width,_e=re.height;for(let we=0;we<ce;we++)t.texImage2D(n.TEXTURE_2D,we,Ee,Q,_e,0,Se,Ge,null),Q>>=1,_e>>=1}}else if(_.isHTMLTexture){if("texElementImage2D"in n){let Q=n.canvas;if(Q.hasAttribute("layoutsubtree")||Q.setAttribute("layoutsubtree","true"),re.parentNode!==Q){Q.appendChild(re),u.add(_),Q.onpaint=_e=>{let we=_e.changedElements;for(let le of u)we.includes(le.image)&&(le.needsUpdate=!0)},Q.requestPaint();return}if(n.texElementImage2D.length===3)n.texElementImage2D(n.TEXTURE_2D,n.RGBA8,re);else{let we=n.RGBA,le=n.RGBA,We=n.UNSIGNED_BYTE;n.texElementImage2D(n.TEXTURE_2D,0,we,le,We,re)}n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE)}}else if(J.length>0){if(se&&me){let Q=at(J[0]);t.texStorage2D(n.TEXTURE_2D,ce,Ee,Q.width,Q.height)}for(let Q=0,_e=J.length;Q<_e;Q++)H=J[Q],se?L&&t.texSubImage2D(n.TEXTURE_2D,Q,0,0,Se,Ge,H):t.texImage2D(n.TEXTURE_2D,Q,Ee,Se,Ge,H);_.generateMipmaps=!1}else if(se){if(me){let Q=at(re);t.texStorage2D(n.TEXTURE_2D,ce,Ee,Q.width,Q.height)}L&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,Se,Ge,re)}else t.texImage2D(n.TEXTURE_2D,0,Ee,Se,Ge,re);p(_)&&S($),ve.__version=xe.version,_.onUpdate&&_.onUpdate(_)}R.__version=_.version}function $e(R,_,W){if(_.image.length!==6)return;let $=ct(R,_),te=_.source;t.bindTexture(n.TEXTURE_CUBE_MAP,R.__webglTexture,n.TEXTURE0+W);let xe=i.get(te);if(te.version!==xe.__version||$===!0){t.activeTexture(n.TEXTURE0+W);let ve=yt.getPrimaries(yt.workingColorSpace),ie=_.colorSpace===Bi?null:yt.getPrimaries(_.colorSpace),re=_.colorSpace===Bi||ve===ie?n.NONE:n.BROWSER_DEFAULT_WEBGL;t.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,_.flipY),t.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),t.pixelStorei(n.UNPACK_ALIGNMENT,_.unpackAlignment),t.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,re);let Se=_.isCompressedTexture||_.image[0].isCompressedTexture,Ge=_.image[0]&&_.image[0].isDataTexture,Ee=[];for(let le=0;le<6;le++)!Se&&!Ge?Ee[le]=x(_.image[le],!0,s.maxCubemapSize):Ee[le]=Ge?_.image[le].image:_.image[le],Ee[le]=Rt(_,Ee[le]);let H=Ee[0],J=r.convert(_.format,_.colorSpace),se=r.convert(_.type),me=g(_.internalFormat,J,se,_.normalized,_.colorSpace),L=_.isVideoTexture!==!0,ce=xe.__version===void 0||$===!0,Q=te.dataReady,_e=b(_,H);Ye(n.TEXTURE_CUBE_MAP,_);let we;if(Se){L&&ce&&t.texStorage2D(n.TEXTURE_CUBE_MAP,_e,me,H.width,H.height);for(let le=0;le<6;le++){we=Ee[le].mipmaps;for(let We=0;We<we.length;We++){let ke=we[We];_.format!==Fn?J!==null?L?Q&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,We,0,0,ke.width,ke.height,J,ke.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,We,me,ke.width,ke.height,0,ke.data):Je("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):L?Q&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,We,0,0,ke.width,ke.height,J,se,ke.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,We,me,ke.width,ke.height,0,J,se,ke.data)}}}else{if(we=_.mipmaps,L&&ce){we.length>0&&_e++;let le=at(Ee[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,_e,me,le.width,le.height)}for(let le=0;le<6;le++)if(Ge){L?Q&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,0,0,0,Ee[le].width,Ee[le].height,J,se,Ee[le].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,0,me,Ee[le].width,Ee[le].height,0,J,se,Ee[le].data);for(let We=0;We<we.length;We++){let zt=we[We].image[le].image;L?Q&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,We+1,0,0,zt.width,zt.height,J,se,zt.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,We+1,me,zt.width,zt.height,0,J,se,zt.data)}}else{L?Q&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,0,0,0,J,se,Ee[le]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,0,me,J,se,Ee[le]);for(let We=0;We<we.length;We++){let ke=we[We];L?Q&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,We+1,0,0,J,se,ke.image[le]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+le,We+1,me,J,se,ke.image[le])}}}p(_)&&S(n.TEXTURE_CUBE_MAP),xe.__version=te.version,_.onUpdate&&_.onUpdate(_)}R.__version=_.version}function be(R,_,W,$,te,xe){let ve=r.convert(W.format,W.colorSpace),ie=r.convert(W.type),re=g(W.internalFormat,ve,ie,W.normalized,W.colorSpace),Se=i.get(_),Ge=i.get(W);if(Ge.__renderTarget=_,!Se.__hasExternalTextures){let Ee=Math.max(1,_.width>>xe),H=Math.max(1,_.height>>xe);te===n.TEXTURE_3D||te===n.TEXTURE_2D_ARRAY?t.texImage3D(te,xe,re,Ee,H,_.depth,0,ve,ie,null):t.texImage2D(te,xe,re,Ee,H,0,ve,ie,null)}t.bindFramebuffer(n.FRAMEBUFFER,R),et(_)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,$,te,Ge.__webglTexture,0,Ke(_)):(te===n.TEXTURE_2D||te>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&te<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,$,te,Ge.__webglTexture,xe),t.bindFramebuffer(n.FRAMEBUFFER,null)}function Qe(R,_,W){if(n.bindRenderbuffer(n.RENDERBUFFER,R),_.depthBuffer){let $=_.depthTexture,te=$&&$.isDepthTexture?$.type:null,xe=M(_.stencilBuffer,te),ve=_.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;et(_)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ke(_),xe,_.width,_.height):W?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ke(_),xe,_.width,_.height):n.renderbufferStorage(n.RENDERBUFFER,xe,_.width,_.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,ve,n.RENDERBUFFER,R)}else{let $=_.textures;for(let te=0;te<$.length;te++){let xe=$[te],ve=r.convert(xe.format,xe.colorSpace),ie=r.convert(xe.type),re=g(xe.internalFormat,ve,ie,xe.normalized,xe.colorSpace);et(_)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ke(_),re,_.width,_.height):W?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ke(_),re,_.width,_.height):n.renderbufferStorage(n.RENDERBUFFER,re,_.width,_.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function At(R,_,W){let $=_.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(n.FRAMEBUFFER,R),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let te=i.get(_.depthTexture);if(te.__renderTarget=_,(!te.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),$){if(te.__webglInit===void 0&&(te.__webglInit=!0,_.depthTexture.addEventListener("dispose",I)),te.__webglTexture===void 0){te.__webglTexture=n.createTexture(),t.bindTexture(n.TEXTURE_CUBE_MAP,te.__webglTexture),Ye(n.TEXTURE_CUBE_MAP,_.depthTexture);let Se=r.convert(_.depthTexture.format),Ge=r.convert(_.depthTexture.type),Ee;_.depthTexture.format===_i?Ee=n.DEPTH_COMPONENT24:_.depthTexture.format===us&&(Ee=n.DEPTH24_STENCIL8);for(let H=0;H<6;H++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+H,0,Ee,_.width,_.height,0,Se,Ge,null)}}else K(_.depthTexture,0);let xe=te.__webglTexture,ve=Ke(_),ie=$?n.TEXTURE_CUBE_MAP_POSITIVE_X+W:n.TEXTURE_2D,re=_.depthTexture.format===us?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(_.depthTexture.format===_i)et(_)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,re,ie,xe,0,ve):n.framebufferTexture2D(n.FRAMEBUFFER,re,ie,xe,0);else if(_.depthTexture.format===us)et(_)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,re,ie,xe,0,ve):n.framebufferTexture2D(n.FRAMEBUFFER,re,ie,xe,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function oe(R){let _=i.get(R),W=R.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==R.depthTexture){let $=R.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),$){let te=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,$.removeEventListener("dispose",te)};$.addEventListener("dispose",te),_.__depthDisposeCallback=te}_.__boundDepthTexture=$}if(R.depthTexture&&!_.__autoAllocateDepthBuffer)if(W)for(let $=0;$<6;$++)At(_.__webglFramebuffer[$],R,$);else{let $=R.texture.mipmaps;$&&$.length>0?At(_.__webglFramebuffer[0],R,0):At(_.__webglFramebuffer,R,0)}else if(W){_.__webglDepthbuffer=[];for(let $=0;$<6;$++)if(t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer[$]),_.__webglDepthbuffer[$]===void 0)_.__webglDepthbuffer[$]=n.createRenderbuffer(),Qe(_.__webglDepthbuffer[$],R,!1);else{let te=R.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,xe=_.__webglDepthbuffer[$];n.bindRenderbuffer(n.RENDERBUFFER,xe),n.framebufferRenderbuffer(n.FRAMEBUFFER,te,n.RENDERBUFFER,xe)}}else{let $=R.texture.mipmaps;if($&&$.length>0?t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer[0]):t.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=n.createRenderbuffer(),Qe(_.__webglDepthbuffer,R,!1);else{let te=R.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,xe=_.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,xe),n.framebufferRenderbuffer(n.FRAMEBUFFER,te,n.RENDERBUFFER,xe)}}t.bindFramebuffer(n.FRAMEBUFFER,null)}function ue(R,_,W){let $=i.get(R);_!==void 0&&be($.__webglFramebuffer,R,R.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),W!==void 0&&oe(R)}function de(R){let _=R.texture,W=i.get(R),$=i.get(_);R.addEventListener("dispose",y);let te=R.textures,xe=R.isWebGLCubeRenderTarget===!0,ve=te.length>1;if(ve||($.__webglTexture===void 0&&($.__webglTexture=n.createTexture()),$.__version=_.version,a.memory.textures++),xe){W.__webglFramebuffer=[];for(let ie=0;ie<6;ie++)if(_.mipmaps&&_.mipmaps.length>0){W.__webglFramebuffer[ie]=[];for(let re=0;re<_.mipmaps.length;re++)W.__webglFramebuffer[ie][re]=n.createFramebuffer()}else W.__webglFramebuffer[ie]=n.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){W.__webglFramebuffer=[];for(let ie=0;ie<_.mipmaps.length;ie++)W.__webglFramebuffer[ie]=n.createFramebuffer()}else W.__webglFramebuffer=n.createFramebuffer();if(ve)for(let ie=0,re=te.length;ie<re;ie++){let Se=i.get(te[ie]);Se.__webglTexture===void 0&&(Se.__webglTexture=n.createTexture(),a.memory.textures++)}if(R.samples>0&&et(R)===!1){W.__webglMultisampledFramebuffer=n.createFramebuffer(),W.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,W.__webglMultisampledFramebuffer);for(let ie=0;ie<te.length;ie++){let re=te[ie];W.__webglColorRenderbuffer[ie]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,W.__webglColorRenderbuffer[ie]);let Se=r.convert(re.format,re.colorSpace),Ge=r.convert(re.type),Ee=g(re.internalFormat,Se,Ge,re.normalized,re.colorSpace,R.isXRRenderTarget===!0),H=Ke(R);n.renderbufferStorageMultisample(n.RENDERBUFFER,H,Ee,R.width,R.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ie,n.RENDERBUFFER,W.__webglColorRenderbuffer[ie])}n.bindRenderbuffer(n.RENDERBUFFER,null),R.depthBuffer&&(W.__webglDepthRenderbuffer=n.createRenderbuffer(),Qe(W.__webglDepthRenderbuffer,R,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(xe){t.bindTexture(n.TEXTURE_CUBE_MAP,$.__webglTexture),Ye(n.TEXTURE_CUBE_MAP,_);for(let ie=0;ie<6;ie++)if(_.mipmaps&&_.mipmaps.length>0)for(let re=0;re<_.mipmaps.length;re++)be(W.__webglFramebuffer[ie][re],R,_,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,re);else be(W.__webglFramebuffer[ie],R,_,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ie,0);p(_)&&S(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ve){for(let ie=0,re=te.length;ie<re;ie++){let Se=te[ie],Ge=i.get(Se),Ee=n.TEXTURE_2D;(R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(Ee=R.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(Ee,Ge.__webglTexture),Ye(Ee,Se),be(W.__webglFramebuffer,R,Se,n.COLOR_ATTACHMENT0+ie,Ee,0),p(Se)&&S(Ee)}t.unbindTexture()}else{let ie=n.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(ie=R.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(ie,$.__webglTexture),Ye(ie,_),_.mipmaps&&_.mipmaps.length>0)for(let re=0;re<_.mipmaps.length;re++)be(W.__webglFramebuffer[re],R,_,n.COLOR_ATTACHMENT0,ie,re);else be(W.__webglFramebuffer,R,_,n.COLOR_ATTACHMENT0,ie,0);p(_)&&S(ie),t.unbindTexture()}R.depthBuffer&&oe(R)}function fe(R){let _=R.textures;for(let W=0,$=_.length;W<$;W++){let te=_[W];if(p(te)){let xe=A(R),ve=i.get(te).__webglTexture;t.bindTexture(xe,ve),S(xe),t.unbindTexture()}}}let Me=[],ze=[];function Ve(R){if(R.samples>0){if(et(R)===!1){let _=R.textures,W=R.width,$=R.height,te=n.COLOR_BUFFER_BIT,xe=R.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ve=i.get(R),ie=_.length>1;if(ie)for(let Se=0;Se<_.length;Se++)t.bindFramebuffer(n.FRAMEBUFFER,ve.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Se,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,ve.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Se,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,ve.__webglMultisampledFramebuffer);let re=R.texture.mipmaps;re&&re.length>0?t.bindFramebuffer(n.DRAW_FRAMEBUFFER,ve.__webglFramebuffer[0]):t.bindFramebuffer(n.DRAW_FRAMEBUFFER,ve.__webglFramebuffer);for(let Se=0;Se<_.length;Se++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(te|=n.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(te|=n.STENCIL_BUFFER_BIT)),ie){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,ve.__webglColorRenderbuffer[Se]);let Ge=i.get(_[Se]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Ge,0)}n.blitFramebuffer(0,0,W,$,0,0,W,$,te,n.NEAREST),l===!0&&(Me.length=0,ze.length=0,Me.push(n.COLOR_ATTACHMENT0+Se),R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&(Me.push(xe),ze.push(xe),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,ze)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,Me))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),ie)for(let Se=0;Se<_.length;Se++){t.bindFramebuffer(n.FRAMEBUFFER,ve.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Se,n.RENDERBUFFER,ve.__webglColorRenderbuffer[Se]);let Ge=i.get(_[Se]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,ve.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Se,n.TEXTURE_2D,Ge,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,ve.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&l){let _=R.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[_])}}}function Ke(R){return Math.min(s.maxSamples,R.samples)}function et(R){let _=i.get(R);return R.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function F(R){let _=a.render.frame;h.get(R)!==_&&(h.set(R,_),R.update())}function Rt(R,_){let W=R.colorSpace,$=R.format,te=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||W!==ia&&W!==Bi&&(yt.getTransfer(W)===Ct?($!==Fn||te!==Nn)&&Je("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):tt("WebGLTextures: Unsupported texture color space:",W)),_}function at(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(c.width=R.naturalWidth||R.width,c.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(c.width=R.displayWidth,c.height=R.displayHeight):(c.width=R.width,c.height=R.height),c}this.allocateTextureUnit=G,this.resetTextureUnits=z,this.getTextureUnits=w,this.setTextureUnits=N,this.setTexture2D=K,this.setTexture2DArray=X,this.setTexture3D=q,this.setTextureCube=ne,this.rebindTextures=ue,this.setupRenderTarget=de,this.updateRenderTargetMipmap=fe,this.updateMultisampleRenderTarget=Ve,this.setupDepthRenderbuffer=oe,this.setupFrameBufferTexture=be,this.useMultisampledRTT=et,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function kv(n,e){function t(i,s=Bi){let r,a=yt.getTransfer(s);if(i===Nn)return n.UNSIGNED_BYTE;if(i===kl)return n.UNSIGNED_SHORT_4_4_4_4;if(i===Hl)return n.UNSIGNED_SHORT_5_5_5_1;if(i===Kh)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===jh)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===$h)return n.BYTE;if(i===Jh)return n.SHORT;if(i===Mr)return n.UNSIGNED_SHORT;if(i===Ol)return n.INT;if(i===ui)return n.UNSIGNED_INT;if(i===Qn)return n.FLOAT;if(i===yn)return n.HALF_FLOAT;if(i===Qh)return n.ALPHA;if(i===eu)return n.RGB;if(i===Fn)return n.RGBA;if(i===_i)return n.DEPTH_COMPONENT;if(i===us)return n.DEPTH_STENCIL;if(i===zl)return n.RED;if(i===Gl)return n.RED_INTEGER;if(i===ds)return n.RG;if(i===Vl)return n.RG_INTEGER;if(i===Wl)return n.RGBA_INTEGER;if(i===Va||i===Wa||i===Xa||i===qa)if(a===Ct)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===Va)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Wa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Xa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===qa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===Va)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Wa)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Xa)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===qa)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Xl||i===ql||i===Yl||i===Zl)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Xl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===ql)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Yl)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Zl)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===$l||i===Jl||i===Kl||i===jl||i===Ql||i===Ya||i===ec)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===$l||i===Jl)return a===Ct?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Kl)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===jl)return r.COMPRESSED_R11_EAC;if(i===Ql)return r.COMPRESSED_SIGNED_R11_EAC;if(i===Ya)return r.COMPRESSED_RG11_EAC;if(i===ec)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===tc||i===nc||i===ic||i===sc||i===rc||i===ac||i===oc||i===lc||i===cc||i===hc||i===uc||i===dc||i===fc||i===pc)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===tc)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===nc)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===ic)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===sc)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===rc)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===ac)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===oc)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===lc)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===cc)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===hc)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===uc)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===dc)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===fc)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===pc)return a===Ct?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===mc||i===gc||i===xc)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===mc)return a===Ct?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===gc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===xc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===yc||i===_c||i===Za||i===vc)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===yc)return r.COMPRESSED_RED_RGTC1_EXT;if(i===_c)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Za)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===vc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===br?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}var Hv=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,zv=`
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

}`,Au=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let i=new pa(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,i=new Bt({vertexShader:Hv,fragmentShader:zv,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new pe(new mn(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Ru=class extends vi{constructor(e,t){super();let i=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,u=null,d=null,f=null,m=null,v=typeof XRWebGLBinding<"u",x=new Au,p={},S=t.getContextAttributes(),A=null,g=null,M=[],b=[],I=new he,y=null,E=null,C=new gn;C.viewport=new Xt;let P=new gn;P.viewport=new Xt;let B=[C,P],z=new Dl,w=null,N=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(ee){let ae=M[ee];return ae===void 0&&(ae=new cr,M[ee]=ae),ae.getTargetRaySpace()},this.getControllerGrip=function(ee){let ae=M[ee];return ae===void 0&&(ae=new cr,M[ee]=ae),ae.getGripSpace()},this.getHand=function(ee){let ae=M[ee];return ae===void 0&&(ae=new cr,M[ee]=ae),ae.getHandSpace()};function G(ee){let ae=b.indexOf(ee.inputSource);if(ae===-1)return;let ge=M[ae];ge!==void 0&&(ge.update(ee.inputSource,ee.frame,c||a),ge.dispatchEvent({type:ee.type,data:ee.inputSource}))}function V(){s.removeEventListener("select",G),s.removeEventListener("selectstart",G),s.removeEventListener("selectend",G),s.removeEventListener("squeeze",G),s.removeEventListener("squeezestart",G),s.removeEventListener("squeezeend",G),s.removeEventListener("end",V),s.removeEventListener("inputsourceschange",K);for(let ee=0;ee<M.length;ee++){let ae=b[ee];ae!==null&&(b[ee]=null,M[ee].disconnect(ae))}w=null,N=null,x.reset();for(let ee in p)delete p[ee];if(e.setRenderTarget(A),f=null,d=null,u=null,s=null,g=null,ct.stop(),i.isPresenting=!1,e.setPixelRatio(y),e.setSize(I.width,I.height,!1),E!==null){let ee=E.camera;ee.fov=E.fov,ee.zoom=E.zoom,ee.updateProjectionMatrix(),E=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(ee){r=ee,i.isPresenting===!0&&Je("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(ee){o=ee,i.isPresenting===!0&&Je("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(ee){c=ee},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u===null&&v&&(u=new XRWebGLBinding(s,t)),u},this.getFrame=function(){return m},this.getSession=function(){return s},this.setSession=async function(ee){if(s=ee,s!==null){if(A=e.getRenderTarget(),s.addEventListener("select",G),s.addEventListener("selectstart",G),s.addEventListener("selectend",G),s.addEventListener("squeeze",G),s.addEventListener("squeezestart",G),s.addEventListener("squeezeend",G),s.addEventListener("end",V),s.addEventListener("inputsourceschange",K),S.xrCompatible!==!0&&await t.makeXRCompatible(),y=e.getPixelRatio(),e.getSize(I),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let ge=null,$e=null,be=null;S.depth&&(be=S.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ge=S.stencil?us:_i,$e=S.stencil?br:ui);let Qe={colorFormat:t.RGBA8,depthFormat:be,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer(Qe),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),g=new tn(d.textureWidth,d.textureHeight,{format:Fn,type:Nn,depthTexture:new ns(d.textureWidth,d.textureHeight,$e,void 0,void 0,void 0,void 0,void 0,void 0,ge),stencilBuffer:S.stencil,colorSpace:e.outputColorSpace,samples:S.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let ge={antialias:S.antialias,alpha:!0,depth:S.depth,stencil:S.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,ge),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),g=new tn(f.framebufferWidth,f.framebufferHeight,{format:Fn,type:Nn,colorSpace:e.outputColorSpace,stencilBuffer:S.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}g.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),ct.setContext(s),ct.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return x.getDepthTexture()};function K(ee){for(let ae=0;ae<ee.removed.length;ae++){let ge=ee.removed[ae],$e=b.indexOf(ge);$e>=0&&(b[$e]=null,M[$e].disconnect(ge))}for(let ae=0;ae<ee.added.length;ae++){let ge=ee.added[ae],$e=b.indexOf(ge);if($e===-1){for(let Qe=0;Qe<M.length;Qe++)if(Qe>=b.length){b.push(ge),$e=Qe;break}else if(b[Qe]===null){b[Qe]=ge,$e=Qe;break}if($e===-1)break}let be=M[$e];be&&be.connect(ge)}}let X=new D,q=new D;function ne(ee,ae,ge){X.setFromMatrixPosition(ae.matrixWorld),q.setFromMatrixPosition(ge.matrixWorld);let $e=X.distanceTo(q),be=ae.projectionMatrix.elements,Qe=ge.projectionMatrix.elements,At=be[14]/(be[10]-1),oe=be[14]/(be[10]+1),ue=(be[9]+1)/be[5],de=(be[9]-1)/be[5],fe=(be[8]-1)/be[0],Me=(Qe[8]+1)/Qe[0],ze=At*fe,Ve=At*Me,Ke=$e/(-fe+Me),et=Ke*-fe;if(ae.matrixWorld.decompose(ee.position,ee.quaternion,ee.scale),ee.translateX(et),ee.translateZ(Ke),ee.matrixWorld.compose(ee.position,ee.quaternion,ee.scale),ee.matrixWorldInverse.copy(ee.matrixWorld).invert(),be[10]===-1)ee.projectionMatrix.copy(ae.projectionMatrix),ee.projectionMatrixInverse.copy(ae.projectionMatrixInverse);else{let F=At+Ke,Rt=oe+Ke,at=ze-et,R=Ve+($e-et),_=ue*oe/Rt*F,W=de*oe/Rt*F;ee.projectionMatrix.makePerspective(at,R,_,W,F,Rt),ee.projectionMatrixInverse.copy(ee.projectionMatrix).invert()}}function Ie(ee,ae){ae===null?ee.matrixWorld.copy(ee.matrix):ee.matrixWorld.multiplyMatrices(ae.matrixWorld,ee.matrix),ee.matrixWorldInverse.copy(ee.matrixWorld).invert()}this.updateCamera=function(ee){if(s===null)return;let ae=ee.near,ge=ee.far;x.texture!==null&&(x.depthNear>0&&(ae=x.depthNear),x.depthFar>0&&(ge=x.depthFar)),z.near=P.near=C.near=ae,z.far=P.far=C.far=ge,(w!==z.near||N!==z.far)&&(s.updateRenderState({depthNear:z.near,depthFar:z.far}),w=z.near,N=z.far),z.layers.mask=ee.layers.mask|6,C.layers.mask=z.layers.mask&-5,P.layers.mask=z.layers.mask&-3;let $e=ee.parent,be=z.cameras;Ie(z,$e);for(let Qe=0;Qe<be.length;Qe++)Ie(be[Qe],$e);be.length===2?ne(z,C,P):z.projectionMatrix.copy(C.projectionMatrix),E===null&&ee.isPerspectiveCamera&&(E={camera:ee,fov:ee.fov,zoom:ee.zoom}),Ce(ee,z,$e)};function Ce(ee,ae,ge){ge===null?ee.matrix.copy(ae.matrixWorld):(ee.matrix.copy(ge.matrixWorld),ee.matrix.invert(),ee.matrix.multiply(ae.matrixWorld)),ee.matrix.decompose(ee.position,ee.quaternion,ee.scale),ee.updateMatrixWorld(!0),ee.projectionMatrix.copy(ae.projectionMatrix),ee.projectionMatrixInverse.copy(ae.projectionMatrixInverse),ee.isPerspectiveCamera&&(ee.fov=or*2*Math.atan(1/ee.projectionMatrix.elements[5]),ee.zoom=1)}this.getCamera=function(){return z},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(ee){l=ee,d!==null&&(d.fixedFoveation=ee),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=ee)},this.hasDepthSensing=function(){return x.texture!==null},this.getDepthSensingMesh=function(){return x.getMesh(z)},this.getCameraTexture=function(ee){return p[ee]};let gt=null;function Ye(ee,ae){if(h=ae.getViewerPose(c||a),m=ae,h!==null){let ge=h.views;f!==null&&(e.setRenderTargetFramebuffer(g,f.framebuffer),e.setRenderTarget(g));let $e=!1;ge.length!==z.cameras.length&&(z.cameras.length=0,$e=!0);for(let oe=0;oe<ge.length;oe++){let ue=ge[oe],de=null;if(f!==null)de=f.getViewport(ue);else{let Me=u.getViewSubImage(d,ue);de=Me.viewport,oe===0&&(e.setRenderTargetTextures(g,Me.colorTexture,Me.depthStencilTexture),e.setRenderTarget(g))}let fe=B[oe];fe===void 0&&(fe=new gn,fe.layers.enable(oe),fe.viewport=new Xt,B[oe]=fe),fe.matrix.fromArray(ue.transform.matrix),fe.matrix.decompose(fe.position,fe.quaternion,fe.scale),fe.projectionMatrix.fromArray(ue.projectionMatrix),fe.projectionMatrixInverse.copy(fe.projectionMatrix).invert(),fe.viewport.set(de.x,de.y,de.width,de.height),oe===0&&(z.matrix.copy(fe.matrix),z.matrix.decompose(z.position,z.quaternion,z.scale)),$e===!0&&z.cameras.push(fe)}let be=s.enabledFeatures;if(be&&be.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&v){u=i.getBinding();let oe=u.getDepthInformation(ge[0]);oe&&oe.isValid&&oe.texture&&x.init(oe,s.renderState)}if(be&&be.includes("camera-access")&&v){e.state.unbindTexture(),u=i.getBinding();for(let oe=0;oe<ge.length;oe++){let ue=ge[oe].camera;if(ue){let de=p[ue];de||(de=new pa,p[ue]=de);let fe=u.getCameraImage(ue);de.sourceTexture=fe}}}}for(let ge=0;ge<M.length;ge++){let $e=b[ge],be=M[ge];$e!==null&&be!==void 0&&be.update($e,ae,c||a)}gt&&gt(ee,ae),ae.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:ae}),m=null}let ct=new lp;ct.setAnimationLoop(Ye),this.setAnimationLoop=function(ee){gt=ee},this.dispose=function(){}}},Gv=new bt,pp=new ot;pp.set(-1,0,0,0,1,0,0,0,1);function Vv(n,e){function t(x,p){x.matrixAutoUpdate===!0&&x.updateMatrix(),p.value.copy(x.matrix)}function i(x,p){p.color.getRGB(x.fogColor.value,ru(n)),p.isFog?(x.fogNear.value=p.near,x.fogFar.value=p.far):p.isFogExp2&&(x.fogDensity.value=p.density)}function s(x,p,S,A,g){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(x,p):p.isMeshLambertMaterial?(r(x,p),p.envMap&&(x.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(x,p),u(x,p)):p.isMeshPhongMaterial?(r(x,p),h(x,p),p.envMap&&(x.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(x,p),d(x,p),p.isMeshPhysicalMaterial&&f(x,p,g)):p.isMeshMatcapMaterial?(r(x,p),m(x,p)):p.isMeshDepthMaterial?r(x,p):p.isMeshDistanceMaterial?(r(x,p),v(x,p)):p.isMeshNormalMaterial?r(x,p):p.isLineBasicMaterial?(a(x,p),p.isLineDashedMaterial&&o(x,p)):p.isPointsMaterial?l(x,p,S,A):p.isSpriteMaterial?c(x,p):p.isShadowMaterial?(x.color.value.copy(p.color),x.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(x,p){x.opacity.value=p.opacity,p.color&&x.diffuse.value.copy(p.color),p.emissive&&x.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(x.map.value=p.map,t(p.map,x.mapTransform)),p.alphaMap&&(x.alphaMap.value=p.alphaMap,t(p.alphaMap,x.alphaMapTransform)),p.bumpMap&&(x.bumpMap.value=p.bumpMap,t(p.bumpMap,x.bumpMapTransform),x.bumpScale.value=p.bumpScale,p.side===un&&(x.bumpScale.value*=-1)),p.normalMap&&(x.normalMap.value=p.normalMap,t(p.normalMap,x.normalMapTransform),x.normalScale.value.copy(p.normalScale),p.side===un&&x.normalScale.value.negate()),p.displacementMap&&(x.displacementMap.value=p.displacementMap,t(p.displacementMap,x.displacementMapTransform),x.displacementScale.value=p.displacementScale,x.displacementBias.value=p.displacementBias),p.emissiveMap&&(x.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,x.emissiveMapTransform)),p.specularMap&&(x.specularMap.value=p.specularMap,t(p.specularMap,x.specularMapTransform)),p.alphaTest>0&&(x.alphaTest.value=p.alphaTest);let S=e.get(p),A=S.envMap,g=S.envMapRotation;A&&(x.envMap.value=A,x.envMapRotation.value.setFromMatrix4(Gv.makeRotationFromEuler(g)).transpose(),A.isCubeTexture&&A.isRenderTargetTexture===!1&&x.envMapRotation.value.premultiply(pp),x.reflectivity.value=p.reflectivity,x.ior.value=p.ior,x.refractionRatio.value=p.refractionRatio),p.lightMap&&(x.lightMap.value=p.lightMap,x.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,x.lightMapTransform)),p.aoMap&&(x.aoMap.value=p.aoMap,x.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,x.aoMapTransform))}function a(x,p){x.diffuse.value.copy(p.color),x.opacity.value=p.opacity,p.map&&(x.map.value=p.map,t(p.map,x.mapTransform))}function o(x,p){x.dashSize.value=p.dashSize,x.totalSize.value=p.dashSize+p.gapSize,x.scale.value=p.scale}function l(x,p,S,A){x.diffuse.value.copy(p.color),x.opacity.value=p.opacity,x.size.value=p.size*S,x.scale.value=A*.5,p.map&&(x.map.value=p.map,t(p.map,x.uvTransform)),p.alphaMap&&(x.alphaMap.value=p.alphaMap,t(p.alphaMap,x.alphaMapTransform)),p.alphaTest>0&&(x.alphaTest.value=p.alphaTest)}function c(x,p){x.diffuse.value.copy(p.color),x.opacity.value=p.opacity,x.rotation.value=p.rotation,p.map&&(x.map.value=p.map,t(p.map,x.mapTransform)),p.alphaMap&&(x.alphaMap.value=p.alphaMap,t(p.alphaMap,x.alphaMapTransform)),p.alphaTest>0&&(x.alphaTest.value=p.alphaTest)}function h(x,p){x.specular.value.copy(p.specular),x.shininess.value=Math.max(p.shininess,1e-4)}function u(x,p){p.gradientMap&&(x.gradientMap.value=p.gradientMap)}function d(x,p){x.metalness.value=p.metalness,p.metalnessMap&&(x.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,x.metalnessMapTransform)),x.roughness.value=p.roughness,p.roughnessMap&&(x.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,x.roughnessMapTransform)),p.envMap&&(x.envMapIntensity.value=p.envMapIntensity)}function f(x,p,S){x.ior.value=p.ior,p.sheen>0&&(x.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),x.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(x.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,x.sheenColorMapTransform)),p.sheenRoughnessMap&&(x.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,x.sheenRoughnessMapTransform))),p.clearcoat>0&&(x.clearcoat.value=p.clearcoat,x.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(x.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,x.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(x.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,x.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(x.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,x.clearcoatNormalMapTransform),x.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===un&&x.clearcoatNormalScale.value.negate())),p.dispersion>0&&(x.dispersion.value=p.dispersion),p.retroreflectivity>0&&(x.retroreflectivity.value=p.retroreflectivity),p.iridescence>0&&(x.iridescence.value=p.iridescence,x.iridescenceIOR.value=p.iridescenceIOR,x.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],x.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(x.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,x.iridescenceMapTransform)),p.iridescenceThicknessMap&&(x.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,x.iridescenceThicknessMapTransform))),p.transmission>0&&(x.transmission.value=p.transmission,x.transmissionSamplerMap.value=S.texture,x.transmissionSamplerSize.value.set(S.width,S.height),p.transmissionMap&&(x.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,x.transmissionMapTransform)),x.thickness.value=p.thickness,p.thicknessMap&&(x.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,x.thicknessMapTransform)),x.attenuationDistance.value=p.attenuationDistance,x.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(x.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(x.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,x.anisotropyMapTransform))),x.specularIntensity.value=p.specularIntensity,x.specularColor.value.copy(p.specularColor),p.specularColorMap&&(x.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,x.specularColorMapTransform)),p.specularIntensityMap&&(x.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,x.specularIntensityMapTransform))}function m(x,p){p.matcap&&(x.matcap.value=p.matcap)}function v(x,p){let S=e.get(p).light;x.referencePosition.value.setFromMatrixPosition(S.matrixWorld),x.nearDistance.value=S.shadow.camera.near,x.farDistance.value=S.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function Wv(n,e,t,i){let s={},r={},a=[],o=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(g,M){let b=M.program;i.uniformBlockBinding(g,b)}function c(g,M){let b=s[g.id];b===void 0&&(x(g),b=h(g),s[g.id]=b,g.addEventListener("dispose",S));let I=M.program;i.updateUBOMapping(g,I);let y=e.render.frame;r[g.id]!==y&&(d(g),r[g.id]=y)}function h(g){let M=u();g.__bindingPointIndex=M;let b=n.createBuffer(),I=g.__size,y=g.usage;return n.bindBuffer(n.UNIFORM_BUFFER,b),n.bufferData(n.UNIFORM_BUFFER,I,y),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,M,b),b}function u(){for(let g=0;g<o;g++)if(a.indexOf(g)===-1)return a.push(g),g;return tt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(g){let M=s[g.id],b=g.uniforms,I=g.__cache;n.bindBuffer(n.UNIFORM_BUFFER,M);for(let y=0,E=b.length;y<E;y++){let C=b[y];if(Array.isArray(C))for(let P=0,B=C.length;P<B;P++)f(C[P],y,P,I);else f(C,y,0,I)}n.bindBuffer(n.UNIFORM_BUFFER,null)}function f(g,M,b,I){if(v(g,M,b,I)===!0){let y=g.__offset,E=g.value;if(Array.isArray(E)){let C=0;for(let P=0;P<E.length;P++){let B=E[P],z=p(B);m(B,g.__data,C),typeof B!="number"&&typeof B!="boolean"&&!B.isMatrix3&&!ArrayBuffer.isView(B)&&(C+=z.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(E,g.__data,0);n.bufferSubData(n.UNIFORM_BUFFER,y,g.__data)}}function m(g,M,b){typeof g=="number"||typeof g=="boolean"?M[0]=g:g.isMatrix3?(M[0]=g.elements[0],M[1]=g.elements[1],M[2]=g.elements[2],M[3]=0,M[4]=g.elements[3],M[5]=g.elements[4],M[6]=g.elements[5],M[7]=0,M[8]=g.elements[6],M[9]=g.elements[7],M[10]=g.elements[8],M[11]=0):ArrayBuffer.isView(g)?M.set(new g.constructor(g.buffer,g.byteOffset,M.length)):g.toArray(M,b)}function v(g,M,b,I){let y=g.value,E=M+"_"+b;if(I[E]===void 0)return typeof y=="number"||typeof y=="boolean"?I[E]=y:ArrayBuffer.isView(y)?I[E]=y.slice():I[E]=y.clone(),!0;{let C=I[E];if(typeof y=="number"||typeof y=="boolean"){if(C!==y)return I[E]=y,!0}else{if(ArrayBuffer.isView(y))return!0;if(C.equals(y)===!1)return C.copy(y),!0}}return!1}function x(g){let M=g.uniforms,b=0,I=16;for(let E=0,C=M.length;E<C;E++){let P=Array.isArray(M[E])?M[E]:[M[E]];for(let B=0,z=P.length;B<z;B++){let w=P[B],N=Array.isArray(w.value)?w.value:[w.value];for(let G=0,V=N.length;G<V;G++){let K=N[G],X=p(K),q=b%I,ne=q%X.boundary,Ie=q+ne;b+=ne,Ie!==0&&I-Ie<X.storage&&(b+=I-Ie),w.__data=new Float32Array(X.storage/Float32Array.BYTES_PER_ELEMENT),w.__offset=b,b+=X.storage}}}let y=b%I;return y>0&&(b+=I-y),g.__size=b,g.__cache={},this}function p(g){let M={boundary:0,storage:0};return typeof g=="number"||typeof g=="boolean"?(M.boundary=4,M.storage=4):g.isVector2?(M.boundary=8,M.storage=8):g.isVector3||g.isColor?(M.boundary=16,M.storage=12):g.isVector4?(M.boundary=16,M.storage=16):g.isMatrix3?(M.boundary=48,M.storage=48):g.isMatrix4?(M.boundary=64,M.storage=64):g.isTexture?Je("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(g)?(M.boundary=16,M.storage=g.byteLength):Je("WebGLRenderer: Unsupported uniform value type.",g),M}function S(g){let M=g.target;M.removeEventListener("dispose",S);let b=a.indexOf(M.__bindingPointIndex);a.splice(b,1),n.deleteBuffer(s[M.id]),delete s[M.id],delete r[M.id]}function A(){for(let g in s)n.deleteBuffer(s[g]);a=[],s={},r={}}return{bind:l,update:c,dispose:A}}var Xv=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Ei=null;function qv(){return Ei===null&&(Ei=new ws(Xv,16,16,ds,yn),Ei.name="DFG_LUT",Ei.minFilter=xn,Ei.magFilter=xn,Ei.wrapS=yi,Ei.wrapT=yi,Ei.generateMipmaps=!1,Ei.needsUpdate=!0),Ei}var Ac=class{constructor(e={}){let{canvas:t=If(),context:i=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=Nn}=e;this.isWebGLRenderer=!0;let m;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=i.getContextAttributes().alpha}else m=a;let v=f,x=new Set([Wl,Vl,Gl]),p=new Set([Nn,ui,Mr,br,kl,Hl]),S=new Uint32Array(4),A=new Int32Array(4),g=new D,M=null,b=null,I=[],y=[],E=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=hi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let C=this,P=!1,B=null,z=null,w=null,N=null;this._outputColorSpace=hn;let G=0,V=0,K=null,X=-1,q=null,ne=new Xt,Ie=new Xt,Ce=null,gt=new Fe(0),Ye=0,ct=t.width,ee=t.height,ae=1,ge=null,$e=null,be=new Xt(0,0,ct,ee),Qe=new Xt(0,0,ct,ee),At=!1,oe=new dr,ue=!1,de=!1,fe=new bt,Me=new D,ze=new Xt,Ve={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ke=!1;function et(){return K===null?ae:1}let F=i;function Rt(T,k){return t.getContext(T,k)}let at,R,_,W,$,te,xe,ve,ie,re,Se,Ge,Ee,H,J,se,me,L,ce,Q,_e,we,le;try{let T={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",zt,!1),t.addEventListener("webglcontextrestored",Dt,!1),t.addEventListener("webglcontextcreationerror",ii,!1),F===null){let k="webgl2";if(F=Rt(k,T),F===null)throw Rt(k)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}We()}catch(T){throw t.removeEventListener("webglcontextlost",zt,!1),t.removeEventListener("webglcontextrestored",Dt,!1),t.removeEventListener("webglcontextcreationerror",ii,!1),tt("WebGLRenderer: "+T.message),T}function We(){at=new Qy(F),at.init(),_e=new kv(F,at),R=new Vy(F,at,e,_e),_=new Bv(F,at),R.reversedDepthBuffer&&d&&_.buffers.depth.setReversed(!0),z=F.createFramebuffer(),w=F.createFramebuffer(),N=F.createFramebuffer(),W=new n_(F),$=new Sv,te=new Ov(F,at,_,$,R,_e,W),xe=new jy(C),ve=new sg(F),we=new zy(F,ve),ie=new e_(F,ve,W,we),re=new s_(F,ie,ve,we,W),L=new i_(F,R,te),J=new Wy($),Se=new bv(C,xe,at,R,we,J),Ge=new Vv(C,$),Ee=new Tv,H=new Pv(at),me=new Hy(C,xe,_,re,m,l),se=new Fv(C,re,R),le=new Wv(F,W,R,_),ce=new Gy(F,at,W),Q=new t_(F,at,W),W.programs=Se.programs,C.capabilities=R,C.extensions=at,C.properties=$,C.renderLists=Ee,C.shadowMap=se,C.state=_,C.info=W}v!==Nn&&(E=new a_(v,t.width,t.height,o,s,r));let ke=new Ru(C,F);this.xr=ke,this.getContext=function(){return F},this.getContextAttributes=function(){return F.getContextAttributes()},this.forceContextLoss=function(){let T=at.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){let T=at.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return ae},this.setPixelRatio=function(T){T!==void 0&&(ae=T,this.setSize(ct,ee,!1))},this.getSize=function(T){return T.set(ct,ee)},this.setSize=function(T,k,j=!0){if(ke.isPresenting){Je("WebGLRenderer: Can't change size while VR device is presenting.");return}ct=T,ee=k,t.width=Math.floor(T*ae),t.height=Math.floor(k*ae),j===!0&&(t.style.width=T+"px",t.style.height=k+"px"),E!==null&&E.setSize(t.width,t.height),this.setViewport(0,0,T,k)},this.getDrawingBufferSize=function(T){return T.set(ct*ae,ee*ae).floor()},this.setDrawingBufferSize=function(T,k,j){ct=T,ee=k,ae=j,t.width=Math.floor(T*j),t.height=Math.floor(k*j),this.setViewport(0,0,T,k)},this.setEffects=function(T){if(v===Nn){tt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(T){for(let k=0;k<T.length;k++)if(T[k].isOutputPass===!0){Je("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}E.setEffects(T||[])},this.getCurrentViewport=function(T){return T.copy(ne)},this.getViewport=function(T){return T.copy(be)},this.setViewport=function(T,k,j,Y){T.isVector4?be.set(T.x,T.y,T.z,T.w):be.set(T,k,j,Y),_.viewport(ne.copy(be).multiplyScalar(ae).round())},this.getScissor=function(T){return T.copy(Qe)},this.setScissor=function(T,k,j,Y){T.isVector4?Qe.set(T.x,T.y,T.z,T.w):Qe.set(T,k,j,Y),_.scissor(Ie.copy(Qe).multiplyScalar(ae).round())},this.getScissorTest=function(){return At},this.setScissorTest=function(T){_.setScissorTest(At=T)},this.setOpaqueSort=function(T){ge=T},this.setTransparentSort=function(T){$e=T},this.getClearColor=function(T){return T.copy(me.getClearColor())},this.setClearColor=function(){me.setClearColor(...arguments)},this.getClearAlpha=function(){return me.getClearAlpha()},this.setClearAlpha=function(){me.setClearAlpha(...arguments)},this.clear=function(T=!0,k=!0,j=!0){let Y=0;if(T){let Z=!1;if(K!==null){let Re=K.texture.format;Z=x.has(Re)}if(Z){let Re=K.texture.type,Ne=p.has(Re),Ae=me.getClearColor(),Be=me.getClearAlpha(),He=Ae.r,ut=Ae.g,_t=Ae.b;Ne?(S[0]=He,S[1]=ut,S[2]=_t,S[3]=Be,F.clearBufferuiv(F.COLOR,0,S)):(A[0]=He,A[1]=ut,A[2]=_t,A[3]=Be,F.clearBufferiv(F.COLOR,0,A))}else Y|=F.COLOR_BUFFER_BIT}k&&(Y|=F.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),j&&(Y|=F.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),Y!==0&&F.clear(Y)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(T){T.setRenderer(this),B=T},this.dispose=function(){t.removeEventListener("webglcontextlost",zt,!1),t.removeEventListener("webglcontextrestored",Dt,!1),t.removeEventListener("webglcontextcreationerror",ii,!1),me.dispose(),Ee.dispose(),H.dispose(),$.dispose(),xe.dispose(),re.dispose(),we.dispose(),le.dispose(),Se.dispose(),ke.dispose(),ke.removeEventListener("sessionstart",rd),ke.removeEventListener("sessionend",ad),ys.stop()};function zt(T){T.preventDefault(),nu("WebGLRenderer: Context Lost."),P=!0}function Dt(){nu("WebGLRenderer: Context Restored."),P=!1;let T=W.autoReset,k=se.enabled,j=se.autoUpdate,Y=se.needsUpdate,Z=se.type;We(),W.autoReset=T,se.enabled=k,se.autoUpdate=j,se.needsUpdate=Y,se.type=Z}function ii(T){tt("WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function mi(T){let k=T.target;k.removeEventListener("dispose",mi),Mm(k)}function Mm(T){bm(T),$.remove(T)}function bm(T){let k=$.get(T).programs;k!==void 0&&(k.forEach(function(j){Se.releaseProgram(j)}),T.isShaderMaterial&&Se.releaseShaderCache(T))}this.renderBufferDirect=function(T,k,j,Y,Z,Re){k===null&&(k=Ve);let Ne=Z.isMesh&&Z.matrixWorld.determinantAffine()<0,Ae=Tm(T,k,j,Y,Z);_.setMaterial(Y,Ne);let Be=j.index,He=1;if(Y.wireframe===!0){if(Be=ie.getWireframeAttribute(j),Be===void 0)return;He=2}let ut=j.drawRange,_t=j.attributes.position,Oe=ut.start*He,Lt=(ut.start+ut.count)*He;Re!==null&&(Oe=Math.max(Oe,Re.start*He),Lt=Math.min(Lt,(Re.start+Re.count)*He)),Be!==null?(Oe=Math.max(Oe,0),Lt=Math.min(Lt,Be.count)):_t!=null&&(Oe=Math.max(Oe,0),Lt=Math.min(Lt,_t.count));let jt=Lt-Oe;if(jt<0||jt===1/0)return;we.setup(Z,Y,Ae,j,Be);let Vt,kt=ce;if(Be!==null&&(Vt=ve.get(Be),kt=Q,kt.setIndex(Vt)),Z.isMesh)Y.wireframe===!0?(_.setLineWidth(Y.wireframeLinewidth*et()),kt.setMode(F.LINES)):kt.setMode(F.TRIANGLES);else if(Z.isLine){let bn=Y.linewidth;bn===void 0&&(bn=1),_.setLineWidth(bn*et()),Z.isLineSegments?kt.setMode(F.LINES):Z.isLineLoop?kt.setMode(F.LINE_LOOP):kt.setMode(F.LINE_STRIP)}else Z.isPoints?kt.setMode(F.POINTS):Z.isSprite&&kt.setMode(F.TRIANGLES);if(Z.isBatchedMesh)if(at.get("WEBGL_multi_draw"))kt.renderMultiDraw(Z._multiDrawStarts,Z._multiDrawCounts,Z._multiDrawCount);else{let bn=Z._multiDrawStarts,Le=Z._multiDrawCounts,Cn=Z._multiDrawCount,St=Be?ve.get(Be).bytesPerElement:1,Zn=$.get(Y).currentProgram.getUniforms();for(let gi=0;gi<Cn;gi++)Zn.setValue(F,"_gl_DrawID",gi),kt.render(bn[gi]/St,Le[gi])}else if(Z.isInstancedMesh)kt.renderInstances(Oe,jt,Z.count);else if(j.isInstancedBufferGeometry){let bn=j._maxInstanceCount!==void 0?j._maxInstanceCount:1/0,Le=Math.min(j.instanceCount,bn);kt.renderInstances(Oe,jt,Le)}else kt.render(Oe,jt)};function sd(T,k,j,Y){B!==null&&T.isNodeMaterial&&B.setObject(Y,T),ue===!0&&J.setState(T,j,!1),T.transparent===!0&&T.side===qt&&T.forceSinglePass===!1?(T.side=un,T.needsUpdate=!0,xo(T,k,Y),T.side=os,T.needsUpdate=!0,xo(T,k,Y),T.side=qt):xo(T,k,Y)}this.compile=function(T,k,j=null){j===null&&(j=T),B!==null&&B.renderStart(T,k,j),b=H.get(j),b.init(k),y.push(b),j.traverseVisible(function(Z){Z.isLight&&Z.layers.test(k.layers)&&(b.pushLight(Z),Z.castShadow&&b.pushShadow(Z))}),T!==j&&T.traverseVisible(function(Z){Z.isLight&&Z.layers.test(k.layers)&&(b.pushLight(Z),Z.castShadow&&b.pushShadow(Z))}),b.setupLights(),B!==null&&B.updateLights(b.state.lightsArray),de=this.localClippingEnabled,ue=J.init(this.clippingPlanes,de),ue===!0&&J.setGlobalState(this.clippingPlanes,k),B!==null&&se.render(b.state.shadowsArray,j,k);let Y=new Set;return T.traverse(function(Z){if(!(Z.isMesh||Z.isPoints||Z.isLine||Z.isSprite))return;let Re=Z.material;if(Re)if(Array.isArray(Re))for(let Ne=0;Ne<Re.length;Ne++){let Ae=Re[Ne];sd(Ae,j,k,Z),Y.add(Ae)}else sd(Re,j,k,Z),Y.add(Re)}),b=y.pop(),B!==null&&B.renderEnd(),Y},this.compileAsync=function(T,k,j=null){let Y=this.compile(T,k,j);return new Promise(Z=>{function Re(){if(Y.forEach(function(Ne){let Be=$.get(Ne).currentProgram;(Be===void 0||Be.isReady())&&Y.delete(Ne)}),Y.size===0){Z(T);return}setTimeout(Re,10)}at.get("KHR_parallel_shader_compile")!==null?Re():setTimeout(Re,10)})};let th=null;function Sm(T){th&&th(T)}function rd(){ys.stop()}function ad(){ys.start()}let ys=new lp;ys.setAnimationLoop(Sm),typeof self<"u"&&ys.setContext(self),this.setAnimationLoop=function(T){th=T,ke.setAnimationLoop(T),T===null?ys.stop():ys.start()},ke.addEventListener("sessionstart",rd),ke.addEventListener("sessionend",ad),this.render=function(T,k){if(k!==void 0&&k.isCamera!==!0){tt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(P===!0)return;B!==null&&B.renderStart(T,k);let j=ke.enabled===!0&&ke.isPresenting===!0,Y=E!==null&&(K===null||j)&&E.begin(C,K);if(T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),k.parent===null&&k.matrixWorldAutoUpdate===!0&&k.updateMatrixWorld(),ke.enabled===!0&&ke.isPresenting===!0&&(E===null||E.isCompositing()===!1)&&(ke.cameraAutoUpdate===!0&&ke.updateCamera(k),k=ke.getCamera()),T.isScene===!0&&T.onBeforeRender(C,T,k,K),b=H.get(T,y.length),b.init(k),b.state.textureUnits=te.getTextureUnits(),y.push(b),fe.multiplyMatrices(k.projectionMatrix,k.matrixWorldInverse),oe.setFromProjectionMatrix(fe,li,k.reversedDepth),de=this.localClippingEnabled,ue=J.init(this.clippingPlanes,de),M=Ee.get(T,I.length),M.init(),I.push(M),ke.enabled===!0&&ke.isPresenting===!0){let Ne=C.xr.getDepthSensingMesh();Ne!==null&&nh(Ne,k,-1/0,C.sortObjects)}nh(T,k,0,C.sortObjects),M.finish(),B!==null&&B.updateLights(b.state.lightsArray),C.sortObjects===!0&&M.sort(ge,$e),Ke=ke.enabled===!1||ke.isPresenting===!1||ke.hasDepthSensing()===!1,Ke&&me.addToRenderList(M,T),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),ue===!0&&J.beginShadows();let Z=b.state.shadowsArray;if(se.render(Z,T,k),ue===!0&&J.endShadows(),(Y&&E.hasRenderPass())===!1){let Ne=M.opaque,Ae=M.transmissive;if(b.setupLights(),k.isArrayCamera){let Be=k.cameras;if(Ae.length>0)for(let He=0,ut=Be.length;He<ut;He++){let _t=Be[He];ld(Ne,Ae,T,_t)}Ke&&me.render(T);for(let He=0,ut=Be.length;He<ut;He++){let _t=Be[He];od(M,T,_t,_t.viewport)}}else Ae.length>0&&ld(Ne,Ae,T,k),Ke&&me.render(T),od(M,T,k)}K!==null&&V===0&&(te.updateMultisampleRenderTarget(K),te.updateRenderTargetMipmap(K)),Y&&E.end(C),T.isScene===!0&&T.onAfterRender(C,T,k),we.resetDefaultState(),X=-1,q=null,y.pop(),y.length>0?(b=y[y.length-1],te.setTextureUnits(b.state.textureUnits),ue===!0&&J.setGlobalState(C.clippingPlanes,b.state.camera)):b=null,I.pop(),I.length>0?M=I[I.length-1]:M=null,B!==null&&B.renderEnd()};function nh(T,k,j,Y){if(T.visible===!1)return;if(T.layers.test(k.layers)){if(T.isGroup)j=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(k);else if(T.isLightProbeGrid)b.pushLightProbeGrid(T);else if(T.isLight)b.pushLight(T),T.castShadow&&b.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||T.intersectsFrustum(oe)){Y&&ze.setFromMatrixPosition(T.matrixWorld).applyMatrix4(fe);let Ne=re.update(T),Ae=T.material;Ae.visible&&M.push(T,Ne,Ae,j,ze.z,null,k)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||T.intersectsFrustum(oe))){let Ne=re.update(T),Ae=T.material;if(Y&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),ze.copy(T.boundingSphere.center)):(Ne.boundingSphere===null&&Ne.computeBoundingSphere(),ze.copy(Ne.boundingSphere.center)),ze.applyMatrix4(T.matrixWorld).applyMatrix4(fe)),Array.isArray(Ae)){let Be=Ne.groups;for(let He=0,ut=Be.length;He<ut;He++){let _t=Be[He],Oe=Ae[_t.materialIndex];Oe&&Oe.visible&&M.push(T,Ne,Oe,j,ze.z,_t,k)}}else Ae.visible&&M.push(T,Ne,Ae,j,ze.z,null,k)}}let Re=T.children;for(let Ne=0,Ae=Re.length;Ne<Ae;Ne++)nh(Re[Ne],k,j,Y)}function od(T,k,j,Y){let{opaque:Z,transmissive:Re,transparent:Ne}=T;b.setupLightsView(j),ue===!0&&J.setGlobalState(C.clippingPlanes,j),Y&&_.viewport(ne.copy(Y)),Z.length>0&&go(Z,k,j),Re.length>0&&go(Re,k,j),Ne.length>0&&go(Ne,k,j),_.buffers.depth.setTest(!0),_.buffers.depth.setMask(!0),_.buffers.color.setMask(!0),_.setPolygonOffset(!1)}function ld(T,k,j,Y){if((j.isScene===!0?j.overrideMaterial:null)!==null)return;if(b.state.transmissionRenderTarget[Y.id]===void 0){let Oe=at.has("EXT_color_buffer_half_float")||at.has("EXT_color_buffer_float");b.state.transmissionRenderTarget[Y.id]=new tn(1,1,{generateMipmaps:!0,type:Oe?yn:Nn,minFilter:hs,samples:Math.max(4,R.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:yt.workingColorSpace})}let Re=b.state.transmissionRenderTarget[Y.id],Ne=Y.viewport||ne;Re.setSize(Ne.z*C.transmissionResolutionScale,Ne.w*C.transmissionResolutionScale);let Ae=C.getRenderTarget(),Be=C.getActiveCubeFace(),He=C.getActiveMipmapLevel();C.setRenderTarget(Re),C.getClearColor(gt),Ye=C.getClearAlpha(),Ye<1&&C.setClearColor(16777215,.5),C.clear(),Ke&&me.render(j);let ut=C.toneMapping;C.toneMapping=hi;let _t=Y.viewport;if(Y.viewport!==void 0&&(Y.viewport=void 0),b.setupLightsView(Y),ue===!0&&J.setGlobalState(C.clippingPlanes,Y),go(T,j,Y),te.updateMultisampleRenderTarget(Re),te.updateRenderTargetMipmap(Re),at.has("WEBGL_multisampled_render_to_texture")===!1){let Oe=!1;for(let Lt=0,jt=k.length;Lt<jt;Lt++){let Vt=k[Lt],{object:kt,geometry:bn,material:Le,group:Cn}=Vt;if(Le.side===qt&&kt.layers.test(Y.layers)){let St=Le.side;Le.side=un,Le.needsUpdate=!0,cd(kt,j,Y,bn,Le,Cn),Le.side=St,Le.needsUpdate=!0,Oe=!0}}Oe===!0&&(te.updateMultisampleRenderTarget(Re),te.updateRenderTargetMipmap(Re))}C.setRenderTarget(Ae,Be,He),C.setClearColor(gt,Ye),_t!==void 0&&(Y.viewport=_t),C.toneMapping=ut}function go(T,k,j){let Y=k.isScene===!0?k.overrideMaterial:null;for(let Z=0,Re=T.length;Z<Re;Z++){let Ne=T[Z],{object:Ae,geometry:Be,group:He}=Ne,ut=Ne.material;ut.allowOverride===!0&&Y!==null&&(ut=Y),Ae.layers.test(j.layers)&&cd(Ae,k,j,Be,ut,He)}}function cd(T,k,j,Y,Z,Re){B!==null&&Z.isNodeMaterial&&B.setObject(T,Z),T.onBeforeRender(C,k,j,Y,Z,Re),T.modelViewMatrix.multiplyMatrices(j.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),Z.onBeforeRender(C,k,j,Y,T,Re),Z.transparent===!0&&Z.side===qt&&Z.forceSinglePass===!1?(Z.side=un,Z.needsUpdate=!0,C.renderBufferDirect(j,k,Y,Z,T,Re),Z.side=os,Z.needsUpdate=!0,C.renderBufferDirect(j,k,Y,Z,T,Re),Z.side=qt):C.renderBufferDirect(j,k,Y,Z,T,Re),T.onAfterRender(C,k,j,Y,Z,Re)}function xo(T,k,j){k.isScene!==!0&&(k=Ve);let Y=$.get(T),Z=b.state.lights,Re=b.state.shadowsArray,Ne=Z.state.version,Ae=Se.getParameters(T,Z.state,Re,k,j,b.state.lightProbeGridArray),Be=Se.getProgramCacheKey(Ae),He=Y.programs;Y.environment=T.isMeshStandardMaterial||T.isMeshLambertMaterial||T.isMeshPhongMaterial?k.environment:null,Y.fog=k.fog;let ut=T.isMeshStandardMaterial||T.isMeshLambertMaterial&&!T.envMap||T.isMeshPhongMaterial&&!T.envMap;Y.envMap=xe.get(T.envMap||Y.environment,ut),Y.envMapRotation=Y.environment!==null&&T.envMap===null?k.environmentRotation:T.envMapRotation,He===void 0&&(T.addEventListener("dispose",mi),He=new Map,Y.programs=He);let _t=He.get(Be);if(_t!==void 0){if(Y.currentProgram===_t&&Y.lightsStateVersion===Ne)return ud(T,Ae),_t}else Ae.uniforms=Se.getUniforms(T),B!==null&&T.isNodeMaterial&&B.build(T,j,Ae),T.onBeforeCompile(Ae,C),_t=Se.acquireProgram(Ae,Be),He.set(Be,_t),Y.uniforms=Ae.uniforms;let Oe=Y.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(Oe.clippingPlanes=J.uniform),ud(T,Ae),Y.needsLights=Am(T),Y.lightsStateVersion=Ne,Y.needsLights&&(Oe.ambientLightColor.value=Z.state.ambient,Oe.lightProbe.value=Z.state.probe,Oe.sunLights.value=Z.state.sun,Oe.sunLightShadows.value=Z.state.sunShadow,Oe.directionalLights.value=Z.state.directional,Oe.directionalLightShadows.value=Z.state.directionalShadow,Oe.spotLights.value=Z.state.spot,Oe.spotLightShadows.value=Z.state.spotShadow,Oe.rectAreaLights.value=Z.state.rectArea,Oe.ltc_1.value=Z.state.rectAreaLTC1,Oe.ltc_2.value=Z.state.rectAreaLTC2,Oe.pointLights.value=Z.state.point,Oe.pointLightShadows.value=Z.state.pointShadow,Oe.hemisphereLights.value=Z.state.hemi,Oe.sunShadowMatrix.value=Z.state.sunShadowMatrix,Oe.sunShadowCascade.value=Z.state.sunShadowCascade,Oe.directionalShadowMatrix.value=Z.state.directionalShadowMatrix,Oe.spotLightMatrix.value=Z.state.spotLightMatrix,Oe.spotLightMap.value=Z.state.spotLightMap,Oe.pointShadowMatrix.value=Z.state.pointShadowMatrix),Y.lightProbeGrid=b.state.lightProbeGridArray.length>0,Y.currentProgram=_t,Y.uniformsList=null,_t}function hd(T){if(T.uniformsList===null){let k=T.currentProgram.getUniforms();T.uniformsList=Tr.seqWithValue(k.seq,T.uniforms)}return T.uniformsList}function ud(T,k){let j=$.get(T);j.outputColorSpace=k.outputColorSpace,j.batching=k.batching,j.batchingColor=k.batchingColor,j.instancing=k.instancing,j.instancingColor=k.instancingColor,j.instancingMorph=k.instancingMorph,j.skinning=k.skinning,j.morphTargets=k.morphTargets,j.morphNormals=k.morphNormals,j.morphColors=k.morphColors,j.morphTargetsCount=k.morphTargetsCount,j.numClippingPlanes=k.numClippingPlanes,j.numIntersection=k.numClipIntersection,j.vertexAlphas=k.vertexAlphas,j.vertexTangents=k.vertexTangents,j.toneMapping=k.toneMapping}function Em(T,k){if(T.length===0)return null;if(T.length===1)return T[0].texture!==null?T[0]:null;g.setFromMatrixPosition(k.matrixWorld);for(let j=0,Y=T.length;j<Y;j++){let Z=T[j];if(Z.texture!==null&&Z.boundingBox.containsPoint(g))return Z}return null}function Tm(T,k,j,Y,Z){k.isScene!==!0&&(k=Ve),te.resetTextureUnits();let Re=k.fog,Ne=Y.isMeshStandardMaterial||Y.isMeshLambertMaterial||Y.isMeshPhongMaterial?k.environment:null,Ae=K===null?C.outputColorSpace:K.isXRRenderTarget===!0?K.texture.colorSpace:yt.workingColorSpace,Be=Y.isMeshStandardMaterial||Y.isMeshLambertMaterial&&!Y.envMap||Y.isMeshPhongMaterial&&!Y.envMap,He=xe.get(Y.envMap||Ne,Be),ut=Y.vertexColors===!0&&!!j.attributes.color&&j.attributes.color.itemSize===4,_t=!!j.attributes.tangent&&(!!Y.normalMap||Y.anisotropy>0),Oe=!!j.morphAttributes.position,Lt=!!j.morphAttributes.normal,jt=!!j.morphAttributes.color,Vt=hi;Y.toneMapped&&(K===null||K.isXRRenderTarget===!0)&&(Vt=C.toneMapping);let kt=j.morphAttributes.position||j.morphAttributes.normal||j.morphAttributes.color,bn=kt!==void 0?kt.length:0,Le=$.get(Y),Cn=b.state.lights;if(ue===!0&&(de===!0||T!==q)){let Gt=T===q&&Y.id===X;J.setState(Y,T,Gt)}let St=!1;Y.version===Le.__version?(Le.needsLights&&Le.lightsStateVersion!==Cn.state.version||Le.outputColorSpace!==Ae||Z.isBatchedMesh&&Le.batching===!1||!Z.isBatchedMesh&&Le.batching===!0||Z.isBatchedMesh&&Le.batchingColor===!0&&Z._colorsTexture===null||Z.isBatchedMesh&&Le.batchingColor===!1&&Z._colorsTexture!==null||Z.isInstancedMesh&&Le.instancing===!1||!Z.isInstancedMesh&&Le.instancing===!0||Z.isSkinnedMesh&&Le.skinning===!1||!Z.isSkinnedMesh&&Le.skinning===!0||Z.isInstancedMesh&&Le.instancingColor===!0&&Z.instanceColor===null||Z.isInstancedMesh&&Le.instancingColor===!1&&Z.instanceColor!==null||Z.isInstancedMesh&&Le.instancingMorph===!0&&Z.morphTexture===null||Z.isInstancedMesh&&Le.instancingMorph===!1&&Z.morphTexture!==null||Le.envMap!==He||Y.fog===!0&&Le.fog!==Re||Le.numClippingPlanes!==void 0&&(Le.numClippingPlanes!==J.numPlanes||Le.numIntersection!==J.numIntersection)||Le.vertexAlphas!==ut||Le.vertexTangents!==_t||Le.morphTargets!==Oe||Le.morphNormals!==Lt||Le.morphColors!==jt||Le.toneMapping!==Vt||Le.morphTargetsCount!==bn||!!Le.lightProbeGrid!=b.state.lightProbeGridArray.length>0)&&(St=!0):(St=!0,Le.__version=Y.version);let Zn=Le.currentProgram;St===!0&&(Zn=xo(Y,k,Z),B&&Y.isNodeMaterial&&B.onUpdateProgram(Y,Zn,Le));let gi=!1,Yi=!1,ks=!1,Ft=Zn.getUniforms(),Kt=Le.uniforms;if(_.useProgram(Zn.program)&&(gi=!0,Yi=!0,ks=!0),Y.id!==X&&(X=Y.id,Yi=!0),Le.needsLights){let Gt=Em(b.state.lightProbeGridArray,Z);Le.lightProbeGrid!==Gt&&(Le.lightProbeGrid=Gt,Yi=!0)}if(gi||q!==T){_.buffers.depth.getReversed()&&T.reversedDepth!==!0&&(T._reversedDepth=!0,T.updateProjectionMatrix()),Ft.setValue(F,"projectionMatrix",T.projectionMatrix),Ft.setValue(F,"viewMatrix",T.matrixWorldInverse);let $i=Ft.map.cameraPosition;$i!==void 0&&$i.setValue(F,Me.setFromMatrixPosition(T.matrixWorld)),R.logarithmicDepthBuffer&&Ft.setValue(F,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(Y.isMeshPhongMaterial||Y.isMeshToonMaterial||Y.isMeshLambertMaterial||Y.isMeshBasicMaterial||Y.isMeshStandardMaterial||Y.isShaderMaterial)&&Ft.setValue(F,"isOrthographic",T.isOrthographicCamera===!0),q!==T&&(q=T,Yi=!0,ks=!0)}if(Le.needsLights&&(Cn.state.sunShadowMap.length>0&&Ft.setValue(F,"sunShadowMap",Cn.state.sunShadowMap,te),Cn.state.directionalShadowMap.length>0&&Ft.setValue(F,"directionalShadowMap",Cn.state.directionalShadowMap,te),Cn.state.spotShadowMap.length>0&&Ft.setValue(F,"spotShadowMap",Cn.state.spotShadowMap,te),Cn.state.pointShadowMap.length>0&&Ft.setValue(F,"pointShadowMap",Cn.state.pointShadowMap,te)),Z.isSkinnedMesh){Ft.setOptional(F,Z,"bindMatrix"),Ft.setOptional(F,Z,"bindMatrixInverse");let Gt=Z.skeleton;Gt&&(Gt.boneTexture===null&&Gt.computeBoneTexture(),Ft.setValue(F,"boneTexture",Gt.boneTexture,te))}Z.isBatchedMesh&&(Ft.setOptional(F,Z,"batchingTexture"),Ft.setValue(F,"batchingTexture",Z._matricesTexture,te),Ft.setOptional(F,Z,"batchingIdTexture"),Ft.setValue(F,"batchingIdTexture",Z._indirectTexture,te),Ft.setOptional(F,Z,"batchingColorTexture"),Z._colorsTexture!==null&&Ft.setValue(F,"batchingColorTexture",Z._colorsTexture,te));let Zi=j.morphAttributes;if((Zi.position!==void 0||Zi.normal!==void 0||Zi.color!==void 0)&&L.update(Z,j,Zn),(Yi||Le.receiveShadow!==Z.receiveShadow)&&(Le.receiveShadow=Z.receiveShadow,Ft.setValue(F,"receiveShadow",Z.receiveShadow)),(Y.isMeshStandardMaterial||Y.isMeshLambertMaterial||Y.isMeshPhongMaterial)&&Y.envMap===null&&k.environment!==null&&(Kt.envMapIntensity.value=k.environmentIntensity),Kt.dfgLUT!==void 0&&(Kt.dfgLUT.value=qv()),Yi){if(Ft.setValue(F,"toneMappingExposure",C.toneMappingExposure),Le.needsLights&&wm(Kt,ks),Re&&Y.fog===!0&&Ge.refreshFogUniforms(Kt,Re),Ge.refreshMaterialUniforms(Kt,Y,ae,ee,b.state.transmissionRenderTarget[T.id]),Le.needsLights&&Le.lightProbeGrid){let Gt=Le.lightProbeGrid;Kt.probesSH.value=Gt.texture,Kt.probesMin.value.copy(Gt.boundingBox.min),Kt.probesMax.value.copy(Gt.boundingBox.max),Kt.probesResolution.value.copy(Gt.resolution)}Tr.upload(F,hd(Le),Kt,te)}if(Y.isShaderMaterial&&Y.uniformsNeedUpdate===!0&&(Tr.upload(F,hd(Le),Kt,te),Y.uniformsNeedUpdate=!1),Y.isSpriteMaterial&&Ft.setValue(F,"center",Z.center),Ft.setValue(F,"modelViewMatrix",Z.modelViewMatrix),Ft.setValue(F,"normalMatrix",Z.normalMatrix),Ft.setValue(F,"modelMatrix",Z.matrixWorld),Y.uniformsGroups!==void 0){let Gt=Y.uniformsGroups;for(let $i=0,Hs=Gt.length;$i<Hs;$i++){let fd=Gt[$i];le.update(fd,Zn),le.bind(fd,Zn)}}return Zn}function wm(T,k){T.ambientLightColor.needsUpdate=k,T.lightProbe.needsUpdate=k,T.sunLights.needsUpdate=k,T.sunLightShadows.needsUpdate=k,T.directionalLights.needsUpdate=k,T.directionalLightShadows.needsUpdate=k,T.pointLights.needsUpdate=k,T.pointLightShadows.needsUpdate=k,T.spotLights.needsUpdate=k,T.spotLightShadows.needsUpdate=k,T.rectAreaLights.needsUpdate=k,T.hemisphereLights.needsUpdate=k}function Am(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return G},this.getActiveMipmapLevel=function(){return V},this.getRenderTarget=function(){return K},this.setRenderTargetTextures=function(T,k,j){let Y=$.get(T);Y.__autoAllocateDepthBuffer=T.resolveDepthBuffer===!1,Y.__autoAllocateDepthBuffer===!1&&(Y.__useRenderToTexture=!1),$.get(T.texture).__webglTexture=k,$.get(T.depthTexture).__webglTexture=Y.__autoAllocateDepthBuffer?void 0:j,Y.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(T,k){let j=$.get(T);j.__webglFramebuffer=k,j.__useDefaultFramebuffer=k===void 0},this.setRenderTarget=function(T,k=0,j=0){K=T,G=k,V=j;let Y=null,Z=!1,Re=!1;if(T){let Ae=$.get(T);if(Ae.__useDefaultFramebuffer!==void 0){_.bindFramebuffer(F.FRAMEBUFFER,Ae.__webglFramebuffer),ne.copy(T.viewport),Ie.copy(T.scissor),Ce=T.scissorTest,_.viewport(ne),_.scissor(Ie),_.setScissorTest(Ce),X=-1;return}else if(Ae.__webglFramebuffer===void 0)te.setupRenderTarget(T);else if(Ae.__hasExternalTextures)te.rebindTextures(T,$.get(T.texture).__webglTexture,$.get(T.depthTexture).__webglTexture);else if(T.depthBuffer){let ut=T.depthTexture;if(Ae.__boundDepthTexture!==ut){if(ut!==null&&$.has(ut)&&(T.width!==ut.image.width||T.height!==ut.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");te.setupDepthRenderbuffer(T)}}let Be=T.texture;(Be.isData3DTexture||Be.isDataArrayTexture||Be.isCompressedArrayTexture)&&(Re=!0);let He=$.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(He[k])?Y=He[k][j]:Y=He[k],Z=!0):T.samples>0&&te.useMultisampledRTT(T)===!1?Y=$.get(T).__webglMultisampledFramebuffer:Array.isArray(He)?Y=He[j]:Y=He,ne.copy(T.viewport),Ie.copy(T.scissor),Ce=T.scissorTest}else ne.copy(be).multiplyScalar(ae).floor(),Ie.copy(Qe).multiplyScalar(ae).floor(),Ce=At;if(j!==0&&(Y=z),_.bindFramebuffer(F.FRAMEBUFFER,Y)&&_.drawBuffers(T,Y),_.viewport(ne),_.scissor(Ie),_.setScissorTest(Ce),Z){let Ae=$.get(T.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_CUBE_MAP_POSITIVE_X+k,Ae.__webglTexture,j)}else if(Re){let Ae=k;for(let Be=0;Be<T.textures.length;Be++){let He=$.get(T.textures[Be]);F.framebufferTextureLayer(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0+Be,He.__webglTexture,j,Ae)}}else if(T!==null&&j!==0){let Ae=$.get(T.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,Ae.__webglTexture,j)}X=-1};function dd(T){let k=$.get(T);return(k.__readFormat!==T.format||k.__readType!==T.type)&&(k.__readFormat=T.format,k.__readType=T.type,k.__formatReadable=R.textureFormatReadable(T.format),k.__typeReadable=R.textureTypeReadable(T.type)),k}this.readRenderTargetPixels=function(T,k,j,Y,Z,Re,Ne,Ae=0){if(!(T&&T.isWebGLRenderTarget)){tt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Be=$.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Ne!==void 0&&(Be=Be[Ne]),Be){_.bindFramebuffer(F.FRAMEBUFFER,Be);try{let He=T.textures[Ae],ut=He.format,_t=He.type;T.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+Ae);let Oe=dd(He);if(Oe.__formatReadable===!1){tt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Oe.__typeReadable===!1){tt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}k>=0&&k<=T.width-Y&&j>=0&&j<=T.height-Z&&F.readPixels(k,j,Y,Z,_e.convert(ut),_e.convert(_t),Re)}finally{let He=K!==null?$.get(K).__webglFramebuffer:null;_.bindFramebuffer(F.FRAMEBUFFER,He)}}},this.readRenderTargetPixelsAsync=async function(T,k,j,Y,Z,Re,Ne,Ae=0){if(!(T&&T.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Be=$.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Ne!==void 0&&(Be=Be[Ne]),Be)if(k>=0&&k<=T.width-Y&&j>=0&&j<=T.height-Z){_.bindFramebuffer(F.FRAMEBUFFER,Be);let He=T.textures[Ae],ut=He.format,_t=He.type;T.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+Ae);let Oe=dd(He);if(Oe.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Oe.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Lt=F.createBuffer();F.bindBuffer(F.PIXEL_PACK_BUFFER,Lt),F.bufferData(F.PIXEL_PACK_BUFFER,Re.byteLength,F.STREAM_READ),F.readPixels(k,j,Y,Z,_e.convert(ut),_e.convert(_t),0),F.bindBuffer(F.PIXEL_PACK_BUFFER,null);let jt=K!==null?$.get(K).__webglFramebuffer:null;_.bindFramebuffer(F.FRAMEBUFFER,jt);let Vt=F.fenceSync(F.SYNC_GPU_COMMANDS_COMPLETE,0);return F.flush(),await Df(F,Vt,4),F.bindBuffer(F.PIXEL_PACK_BUFFER,Lt),F.getBufferSubData(F.PIXEL_PACK_BUFFER,0,Re),F.bindBuffer(F.PIXEL_PACK_BUFFER,null),F.deleteBuffer(Lt),F.deleteSync(Vt),Re}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(T,k=null,j=0){let Y=Math.pow(2,-j),Z=Math.floor(T.image.width*Y),Re=Math.floor(T.image.height*Y),Ne=k!==null?k.x:0,Ae=k!==null?k.y:0;te.setTexture2D(T,0),F.copyTexSubImage2D(F.TEXTURE_2D,j,0,0,Ne,Ae,Z,Re),_.unbindTexture()},this.copyTextureToTexture=function(T,k,j=null,Y=null,Z=0,Re=0){let Ne,Ae,Be,He,ut,_t,Oe,Lt,jt,Vt=T.isCompressedTexture?T.mipmaps[Re]:T.image;if(j!==null)Ne=j.max.x-j.min.x,Ae=j.max.y-j.min.y,Be=j.isBox3?j.max.z-j.min.z:1,He=j.min.x,ut=j.min.y,_t=j.isBox3?j.min.z:0;else{let Kt=Math.pow(2,-Z);Ne=Math.floor(Vt.width*Kt),Ae=Math.floor(Vt.height*Kt),T.isDataArrayTexture?Be=Vt.depth:T.isData3DTexture?Be=Math.floor(Vt.depth*Kt):Be=1,He=0,ut=0,_t=0}Y!==null?(Oe=Y.x,Lt=Y.y,jt=Y.z):(Oe=0,Lt=0,jt=0);let kt=_e.convert(k.format),bn=_e.convert(k.type),Le;k.isData3DTexture?(te.setTexture3D(k,0),Le=F.TEXTURE_3D):k.isDataArrayTexture||k.isCompressedArrayTexture?(te.setTexture2DArray(k,0),Le=F.TEXTURE_2D_ARRAY):(te.setTexture2D(k,0),Le=F.TEXTURE_2D),_.activeTexture(F.TEXTURE0),_.pixelStorei(F.UNPACK_FLIP_Y_WEBGL,k.flipY),_.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),_.pixelStorei(F.UNPACK_ALIGNMENT,k.unpackAlignment);let Cn=_.getParameter(F.UNPACK_ROW_LENGTH),St=_.getParameter(F.UNPACK_IMAGE_HEIGHT),Zn=_.getParameter(F.UNPACK_SKIP_PIXELS),gi=_.getParameter(F.UNPACK_SKIP_ROWS),Yi=_.getParameter(F.UNPACK_SKIP_IMAGES);_.pixelStorei(F.UNPACK_ROW_LENGTH,Vt.width),_.pixelStorei(F.UNPACK_IMAGE_HEIGHT,Vt.height),_.pixelStorei(F.UNPACK_SKIP_PIXELS,He),_.pixelStorei(F.UNPACK_SKIP_ROWS,ut),_.pixelStorei(F.UNPACK_SKIP_IMAGES,_t);let ks=T.isDataArrayTexture||T.isData3DTexture,Ft=k.isDataArrayTexture||k.isData3DTexture;if(T.isDepthTexture){let Kt=$.get(T),Zi=$.get(k),Gt=$.get(Kt.__renderTarget),$i=$.get(Zi.__renderTarget);_.bindFramebuffer(F.READ_FRAMEBUFFER,Gt.__webglFramebuffer),_.bindFramebuffer(F.DRAW_FRAMEBUFFER,$i.__webglFramebuffer);for(let Hs=0;Hs<Be;Hs++)ks&&(F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,$.get(T).__webglTexture,Z,_t+Hs),F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,$.get(k).__webglTexture,Re,jt+Hs)),F.blitFramebuffer(He,ut,Ne,Ae,Oe,Lt,Ne,Ae,F.DEPTH_BUFFER_BIT,F.NEAREST);_.bindFramebuffer(F.READ_FRAMEBUFFER,null),_.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else if(Z!==0||T.isRenderTargetTexture||$.has(T)){let Kt=$.get(T),Zi=$.get(k);_.bindFramebuffer(F.READ_FRAMEBUFFER,w),_.bindFramebuffer(F.DRAW_FRAMEBUFFER,N);for(let Gt=0;Gt<Be;Gt++)ks?F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,Kt.__webglTexture,Z,_t+Gt):F.framebufferTexture2D(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,Kt.__webglTexture,Z),Ft?F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,Zi.__webglTexture,Re,jt+Gt):F.framebufferTexture2D(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,Zi.__webglTexture,Re),Z!==0?F.blitFramebuffer(He,ut,Ne,Ae,Oe,Lt,Ne,Ae,F.COLOR_BUFFER_BIT,F.NEAREST):Ft?F.copyTexSubImage3D(Le,Re,Oe,Lt,jt+Gt,He,ut,Ne,Ae):F.copyTexSubImage2D(Le,Re,Oe,Lt,He,ut,Ne,Ae);_.bindFramebuffer(F.READ_FRAMEBUFFER,null),_.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else Ft?T.isDataTexture||T.isData3DTexture?F.texSubImage3D(Le,Re,Oe,Lt,jt,Ne,Ae,Be,kt,bn,Vt.data):k.isCompressedArrayTexture?F.compressedTexSubImage3D(Le,Re,Oe,Lt,jt,Ne,Ae,Be,kt,Vt.data):F.texSubImage3D(Le,Re,Oe,Lt,jt,Ne,Ae,Be,kt,bn,Vt):T.isDataTexture?F.texSubImage2D(F.TEXTURE_2D,Re,Oe,Lt,Ne,Ae,kt,bn,Vt.data):T.isCompressedTexture?F.compressedTexSubImage2D(F.TEXTURE_2D,Re,Oe,Lt,Vt.width,Vt.height,kt,Vt.data):F.texSubImage2D(F.TEXTURE_2D,Re,Oe,Lt,Ne,Ae,kt,bn,Vt);_.pixelStorei(F.UNPACK_ROW_LENGTH,Cn),_.pixelStorei(F.UNPACK_IMAGE_HEIGHT,St),_.pixelStorei(F.UNPACK_SKIP_PIXELS,Zn),_.pixelStorei(F.UNPACK_SKIP_ROWS,gi),_.pixelStorei(F.UNPACK_SKIP_IMAGES,Yi),Re===0&&k.generateMipmaps&&F.generateMipmap(Le),_.unbindTexture()},this.initRenderTarget=function(T){$.get(T).__webglFramebuffer===void 0&&te.setupRenderTarget(T)},this.initTexture=function(T){T.isCubeTexture?te.setTextureCube(T,0):T.isData3DTexture?te.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?te.setTexture2DArray(T,0):te.setTexture2D(T,0),_.unbindTexture()},this.resetState=function(){G=0,V=0,K=null,_.reset(),we.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return li}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=yt._getDrawingBufferColorSpace(e),t.unpackColorSpace=yt._getUnpackColorSpace()}};var Ar={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

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


		}`};var Xn=class{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}},Yv=new as(-1,1,1,-1,0,1),Cu=class extends Et{constructor(){super(),this.setAttribute("position",new it([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new it([0,2,0,0,2,0],2))}},Zv=new Cu,fs=class{constructor(e){this._mesh=new pe(Zv,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,Yv)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}};var Rr=class extends Xn{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof Bt?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=Oi.clone(e.uniforms),this.material=new Bt({name:e.name!==void 0?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new fs(this.material)}render(e,t,i){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=i.texture),this._fsQuad.material=this.material,this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var eo=class extends Xn{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,i){let s=e.getContext(),r=e.state;r.buffers.color.setMask(!1),r.buffers.depth.setMask(!1),r.buffers.color.setLocked(!0),r.buffers.depth.setLocked(!0);let a,o;this.inverse?(a=0,o=1):(a=1,o=0),r.buffers.stencil.setTest(!0),r.buffers.stencil.setOp(s.REPLACE,s.REPLACE,s.REPLACE),r.buffers.stencil.setFunc(s.ALWAYS,a,4294967295),r.buffers.stencil.setClear(o),r.buffers.stencil.setLocked(!0),e.setRenderTarget(i),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),r.buffers.color.setLocked(!1),r.buffers.depth.setLocked(!1),r.buffers.color.setMask(!0),r.buffers.depth.setMask(!0),r.buffers.stencil.setLocked(!1),r.buffers.stencil.setFunc(s.EQUAL,1,4294967295),r.buffers.stencil.setOp(s.KEEP,s.KEEP,s.KEEP),r.buffers.stencil.setLocked(!0)}},Ic=class extends Xn{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}};var Pc=class{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),t===void 0){let i=e.getSize(new he);this._width=i.width,this._height=i.height,t=new tn(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:yn}),t.texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new Rr(Ar),this.copyPass.material.blending=jn,this.timer=new La}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);t!==-1&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),e===void 0&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),i=!1;for(let s=0,r=this.passes.length;s<r;s++){let a=this.passes[s];if(a.enabled!==!1){if(a.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(s),a.render(this.renderer,this.writeBuffer,this.readBuffer,e,i),a.needsSwap){if(i){let o=this.renderer.getContext(),l=this.renderer.state.buffers.stencil;l.setFunc(o.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),l.setFunc(o.EQUAL,1,4294967295)}this.swapBuffers()}eo!==void 0&&(a instanceof eo?i=!0:a instanceof Ic&&(i=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(e===void 0){let t=this.renderer.getSize(new he);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,e=this.renderTarget1.clone(),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let i=this._width*this._pixelRatio,s=this._height*this._pixelRatio;this.renderTarget1.setSize(i,s),this.renderTarget2.setSize(i,s);for(let r=0;r<this.passes.length;r++)this.passes[r].setSize(i,s)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}};var Dc=class extends Xn{constructor(e,t,i=null,s=null,r=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=i,this.clearColor=s,this.clearAlpha=r,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new Fe}render(e,t,i){let s=e.autoClear;e.autoClear=!1;let r,a;this.overrideMaterial!==null&&(a=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),this.clearAlpha!==null&&(r=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:i),this.clear===!0&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),this.clearColor!==null&&e.setClearColor(this._oldClearColor),this.clearAlpha!==null&&e.setClearAlpha(r),this.overrideMaterial!==null&&(this.scene.overrideMaterial=a),e.autoClear=s}};var mp={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new Fe(0)},defaultOpacity:{value:0}},vertexShader:`

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

		}`};var Cr=class n extends Xn{constructor(e,t=1,i,s){super(),this.strength=t,this.radius=i,this.threshold=s,this.resolution=e!==void 0?new he(e.x,e.y):new he(256,256),this.clearColor=new Fe(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);this.renderTargetBright=new tn(r,a,{type:yn,depthBuffer:!1}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let h=0;h<this.nMips;h++){let u=new tn(r,a,{type:yn,depthBuffer:!1});u.texture.name="UnrealBloomPass.h"+h,u.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(u);let d=new tn(r,a,{type:yn,depthBuffer:!1});d.texture.name="UnrealBloomPass.v"+h,d.texture.generateMipmaps=!1,this.renderTargetsVertical.push(d),r=Math.round(r/2),a=Math.round(a/2)}let o=mp;this.highPassUniforms=Oi.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=s,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new Bt({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let l=[6,10,14,18,22];r=Math.round(this.resolution.x/2),a=Math.round(this.resolution.y/2);for(let h=0;h<this.nMips;h++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(l[h])),this.separableBlurMaterials[h].uniforms.invSize.value=new he(1/r,1/a),r=Math.round(r/2),a=Math.round(a/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1;let c=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=c,this.bloomTintColors=[new D(1,1,1),new D(1,1,1),new D(1,1,1),new D(1,1,1),new D(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=Oi.clone(Ar.uniforms),this.blendMaterial=new Bt({uniforms:this.copyUniforms,vertexShader:Ar.vertexShader,fragmentShader:Ar.fragmentShader,premultipliedAlpha:!0,blending:sn,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new Fe,this._oldClearAlpha=1,this._basic=new It,this._fsQuad=new fs(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let i=Math.round(e/2),s=Math.round(t/2);this.renderTargetBright.setSize(i,s);for(let r=0;r<this.nMips;r++)this.renderTargetsHorizontal[r].setSize(i,s),this.renderTargetsVertical[r].setSize(i,s),this.separableBlurMaterials[r].uniforms.invSize.value=new he(1/i,1/s),i=Math.round(i/2),s=Math.round(s/2)}render(e,t,i,s,r){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();let a=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),r&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=i.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=i.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let o=this.renderTargetBright;for(let l=0;l<this.nMips;l++)this._fsQuad.material=this.separableBlurMaterials[l],this.separableBlurMaterials[l].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[l].uniforms.direction.value=n.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[l]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[l].uniforms.colorTexture.value=this.renderTargetsHorizontal[l].texture,this.separableBlurMaterials[l].uniforms.direction.value=n.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[l]),e.clear(),this._fsQuad.render(e),o=this.renderTargetsVertical[l];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,r&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(i),this._fsQuad.render(e)),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=a}_getSeparableBlurMaterial(e){let t=[],i=e/3;for(let a=0;a<e;a++)t.push(.39894*Math.exp(-.5*a*a/(i*i))/i);let s=[],r=[];for(let a=1;a<e;a+=2){let o=t[a],l=a+1<e?t[a+1]:0,c=o+l;s.push((a*o+(a+1)*l)/c),r.push(c)}return new Bt({defines:{KERNEL_PAIRS:s.length},uniforms:{colorTexture:{value:null},invSize:{value:new he(.5,.5)},direction:{value:new he(.5,.5)},centerWeight:{value:t[0]},gaussianOffsets:{value:s},gaussianWeights:{value:r}},vertexShader:`

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

				}`})}};Cr.BlurDirectionX=new he(1,0);Cr.BlurDirectionY=new he(0,1);var to={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		}`};var Lc=class extends Xn{constructor(){super(),this.isOutputPass=!0,this.uniforms=Oi.clone(to.uniforms),this.material=new xr({name:to.name,uniforms:this.uniforms,vertexShader:to.vertexShader,fragmentShader:to.fragmentShader}),this._fsQuad=new fs(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,i){this.uniforms.tDiffuse.value=i.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},yt.getTransfer(this._outputColorSpace)===Ct&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===Na?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===Fa?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===Ba?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===Is?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===ka?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===Ha?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===Oa&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(e.setRenderTarget(null),this._fsQuad.render(e)):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),this._fsQuad.render(e))}dispose(){this.material.dispose(),this._fsQuad.dispose()}};var xp="\u5317\u4EAC\u9F9F \xB7 \u80E1\u540C\u5927\u4E71\u6597";var ps={durian:"\u5C0F\u69B4\u83B2",oyster:"\u5F80\u6614\u869D",goat:"\u5F90\u5C71\u7F8A",dingding:"\u4E01\u4E01",orange:"\u6A58\u5B50",ginger:"\u59DC\u997C\u4EBA",caesar:"Caesar",chenwei:"\u9648\u4F1F",jia:"\u7532\u65B9",yi:"\u4E59\u65B9",guo:"\u679C\u54E5",thief:"\u5434\u6D69\u7136",mao:"\u5927\u6BDB",maoqiu:"\u5C0F\u6BDB\u7403",bigmao:"\u5927\u6BDB\uFF08\u8D85\u5927\u53F7\uFF09",judge:"\u6C89\u6BC5\u7F8A\uFF08\u6CD5\u5B98\uFF09",finaljudge:"\u6C89\u6BC5\u7F8A\uFF08\u7EC8\u5BA1\uFF09"},Ln={jia:["\u8C01\u95EE\u4F60\u4E86","\u8C01\u95EE\u4F60\u4E86\uFF1F","\u8C01\u95EE\u4F60\u4E86\uFF01\uFF01"],yi:["\u554A\u5BF9\u5BF9\u5BF9","\u597D\u597D\u597D","\u4F60\u8BF4\u5F97\u90FD\u5BF9"],guo:["\uFF1F","\uFF1F\uFF1F\uFF1F","\u4F60\u5728\u5E72\u561B"],judge:["\u8083\u9759\uFF01","\u9A73\u56DE\uFF01","\u672C\u5EAD\u5BA3\u5224\uFF1A\u9F9F\u592A\u751C\u4E86\uFF01","\u6CA1\u4EBA\u901A\u77E5\u4F60\uFF1F\u90A3\u662F\u4F60\u7684\u4E8B\uFF01"],thief:["\u563F\u563F\uFF0C\u7CD6\u846B\u82A6\u5F52\u6211\u4E86","\u718A\u6765\u4E86\uFF01","\u6E9C\u4E86\u6E9C\u4E86"],mao:["\u306A\u3093\u3067\u305D\u3093\u306A\u306B\u6163\u308C\u3066\u3093\u3060\u3088\uFF01","\u96EA\u83DC\u2026","\u305B\u3064\u306A\u3063\uFF01","\u5C4A\u304B\u306A\u3044\u604B\u2026","\u53C8\u5230\u4E86\u767D\u8272\u76F8\u7C3F\u7684\u5B63\u8282"],caili:["\u5F69\u793C38.8W\uFF01","\u5F69\u793C38.8W\uFF0C\u5C11\u4E00\u5206\u4E0D\u884C"],goat:["\u814A\u80A0\u653B\u51FB\uFF01"],dingding:["\u9876\u7EA7\u9876\u7EA7\uFF01","\u9876\u7EA7\u9876\u7EA7","\u62B1\u62B1\uFF01","\u4E01\u4E01\uFF01","\u518D\u6765\u4E00\u904D\uFF01"],orange:["\u6A58\u5B50\u6765\u4E86\uFF01","\u6A58\u5B50\u6765\u4E86\uFF01\uFF01"],caesar:["\u6211\u6765\uFF0C\u6211\u89C1\uFF0C\u6211\u5F81\u670D","Veni, vidi, vici","\u7F57\u9A6C\u4E0D\u662F\u4E00\u5929\u5EFA\u6210\u7684"],chenwei:["Fire in the hole!","Enemy spotted","Go go go!","Counter-Terrorists win"],ginger:["\u4F60\u6293\u4E0D\u5230\u6211\uFF01","\u8DD1\u8DD1\u8DD1\uFF0C\u6293\u4E0D\u5230\u6211\uFF5E","\u6211\u662F\u59DC\u997C\u4EBA\uFF01"],oyster:["\u60F3\u5F53\u5E74\u2026\u2026","\u5F80\u6614\u4E0D\u518D"]},Nt={idle:["\u4F60\u7684\u9F9F\u6628\u5929\u665A\u4E0A\u98CE\u597D\u5927","\u6211\u89C9\u5F97\u59C6\u5DF4\u4F69\u6CA1\u6709\u95EE\u9898","\u5F97\u561E\uFF0C\u8D70\u7740\uFF01","\u561B\u5462\u8FD9\u662F\uFF1F","\u59D0\u4EEC\u513F\u4ECA\u513F\u72B6\u6001\u500D\u513F\u597D","\u60A8\u77A7\u597D\u5427\uFF01","\u8FD9\u628A\u6211C","\u9EC4\u623F\u4E0A\u6CA1\u4EBA","\u9F9F\u4ECA\u5929\u624B\u611F\u6765\u4E86\uFF01","\u6392\u597D\u961F\uFF0C\u4E00\u4E2A\u4E00\u4E2A\u6765\uFF01"],afk:["\u521A\u548C\u963F\u59E8\u8BF4\u8BDD\u53BB\u4E86","\u521A\u548C\u963F\u59E8\u8BF4\u8BDD\u53BB\u4E86\uFF0C\u56DE\u6765\u4E86\u56DE\u6765\u4E86"],hit:["\u6211\u7BAD\u4E2D\u4E86\uFF01\u6211\u7BAD\u4E2D\u4E86\uFF01","\u6211\u7BAD\u4E2D\u4E86\uFF01"],multi:["\u6253\u6B7B\u4F60\u4EEC\u8FD9\u4E9B\u5ECA\u574A\u5A03\uFF01","\u4E00\u4E2A\u90FD\u522B\u8DD1\uFF01","\u6765\u4E00\u4E2A\u6211\u6536\u4E00\u4E2A\uFF01","\u90FD\u522B\u8D70\uFF0C\u9F9F\u8FD8\u6CA1\u6253\u591F\u5462\uFF01"],hurt:["\u54CE\u54DF\u5582\uFF01","\u6CA1\u4EBA\u901A\u77E5\u6211\u8FD9\u513F\u6709\u602A\uFF01","\u8C01\u6253\u6211\uFF1F\uFF01","\u563F\uFF0C\u60A8\u8FD9\u5C31\u4E0D\u5730\u9053\u4E86","\u4F60\u4EEC\u662F\u4E0D\u662F\u751F\u6D3B\u4E0D\u5982\u610F\u554A","\u4F60\u4EEC\u518D\u8FD9\u6837\u6211\u9000\u6E38\u4E86"],life:["\u4F60\u4EEC\u662F\u4E0D\u662F\u751F\u6D3B\u4E0D\u5982\u610F\u554A","\u4F60\u4EEC\u662F\u4E0D\u662F\u751F\u6D3B\u4E0D\u5982\u610F\u554A\uFF1F"],spawnNear:["\u6CA1\u4EBA\u901A\u77E5\u6211\u5237\u602A\u4E86\uFF01","\u8FD9\u600E\u4E48\u53C8\u6765\u4E00\u6CE2\uFF0C\u6CA1\u4EBA\u901A\u77E5\u6211\u554A"],sweet:["\u6CA1\u4EBA\u6BD4\u6211\u751C\uFF01"],voice:["\u58F0\u97F3\u6CA1\u6211\u751C\uFF01"],bull:["\u559C\u6B22\u6211\u7684\u767D\u725B\u5417\uFF1F","\u767D\u725B\uFF01\u51B2\uFF01"],bomb:["\u4ED6\u5E94\u8BE5\u4E0D\u4F1A\u4E0B\u5305\u7684","\u4E0B\u5305\u4E86\u4E0B\u5305\u4E86"],hubby:["\u8521\u535A\uFF01\u5FEB\u6765\uFF01","\u961F\u53CB\uFF01\u4E0A\uFF01","\u8521\u535A\uFF0C\u6551\u4E00\u4E0B\uFF01"],wind:["\u4F60\u7684\u9F9F\u6628\u5929\u665A\u4E0A\u98CE\u597D\u5927\u2026\u2026"],shield:["\u4F60\u7684\u9F9F\u51B3\u5B9A\u5173\u7A97\u6237\u7761\u89C9\u4E86"],dodge:["\u6CA1\u6253\u7740\uFF5E","\u901A\u77E5\u5230\u4E86\uFF0C\u8EB2\u5F00\u4E86"],waveStart:["\u5F97\u561E\uFF0C\u4E0B\u4E00\u6CE2\uFF01","\u6765\u5427\u5ECA\u574A\u5A03\u4EEC","\u6211\u89C9\u5F97\u59C6\u5DF4\u4F69\u6CA1\u6709\u95EE\u9898","\u6A58\u5B50\u6765\u4E86\uFF1F","\u6211\u4ECA\u5929\u60F3\u559D\u8840\u4E86","\u8FD9\u4E00\u6CE2\uFF0C\u9F9F\u4EB2\u81EA\u6765\uFF01"],boss:["\u6C89\u6BC5\u7F8A\u6CD5\u5B98\uFF1F\u5F00\u5EAD\u4E86\uFF1F\u6CA1\u4EBA\u901A\u77E5\u6211\uFF01"],bigmao:["\u5927\u6BDB\uFF1F\u4F60\u600E\u4E48\u8FD9\u4E48\u5927\u4E00\u53EA\uFF01","\u600E\u4E48\u4E0B\u96EA\u4E86\uFF1F\u53C8\u5230\u4E86\u767D\u8272\u76F8\u7C3F\u7684\u5B63\u8282"],horse:["\u9A6C\u80CC\u4E0A\u7684\u6C11\u65CF\uFF01"],bike:["\u5317\u4EAC\u9A91\u884C\u592B\u5987\uFF01"],meteor:["\u6D41\u661F\u98CE\u66B4\uFF01"],chief:["\u5973\u914B\u957F\u7684\u795D\u798F\uFF01"],elite:["\u7CBE\u82F1\u602A\uFF1F\u6CA1\u4EBA\u901A\u77E5\u6211\uFF01","\u8FD9\u4E2A\u600E\u4E48\u91D1\u5149\u95EA\u95EA\u7684","\u6765\u4E86\u4E2A\u72E0\u7684"],lowhp:["\u9F9F\u8981\u4E0D\u884C\u4E86\uFF0C\u8521\u535A\u6551\u6211","\u8840\u4E0D\u591A\u4E86\uFF0C\u7A33\u4F4F\u7A33\u4F4F","\u6CA1\u4EBA\u901A\u77E5\u6211\u53EA\u5269\u8FD9\u70B9\u8840"],waveClear:["\u8FD9\u6CE2\u7A33\u4E86","\u5F97\u561E\uFF0C\u6536\u5DE5","\u8FD8\u6709\u8C01\uFF1F"],chest:["\u5927\u7EA2\u5B9D\u7BB1\uFF01","\u5F00\u7BB1\u5F00\u7BB1\uFF01"],tide:["\u6F6E\u6C50\u76D1\u72F1\uFF1F\u6CA1\u4EBA\u901A\u77E5\u6211\u6DA8\u6F6E\uFF01","\u6DA8\u6F6E\u4E86\u6DA8\u6F6E\u4E86","\u6478\u5230\u5927\u7EA2\u5C31\u64A4"],flash:["\u6211\u778E\u4E86\uFF01\u9648\u4F1F\u4F60\u9634\u6211","\u95EA\u5149\uFF01\u6CA1\u4EBA\u901A\u77E5\u6211"],ult:["\u8D85\u7EA7\u8718\u86DB\uFF01\uFF01","\u8D85\u7EA7\u8718\u86DB\uFF0C\u8D70\u4F60\uFF01"],dead:["\u6CA1\u4EBA\u901A\u77E5\u6211\u554A\uFF01\uFF01","\u8FD9\u628A\u4E0D\u7B97\uFF0C\u7F51\u5361\u4E86","\u6CA1\u4EBA\u901A\u77E5\u6211\u56E2\u6218\uFF1F"]},Ns=[{id:"douzhi",tier:"silver",icon:"\u{1F964}",name:"\u8C46\u6C41\u513F\u7EED\u547D",desc:"\u6700\u5927\u751F\u547D +3\uFF0C\u5E76\u56DE\u6EE1",apply:n=>{n.maxhp+=3,n.hp=n.maxhp}},{id:"hutong",tier:"silver",icon:"\u{1F3C3}",name:"\u80E1\u540C\u4E32\u5B50",desc:"\u79FB\u52A8\u901F\u5EA6 +12%",apply:n=>{n.speed*=1.12}},{id:"arrow",tier:"silver",icon:"\u{1F3F9}",name:"\u6211\u7BAD\u4E2D\u4E86",desc:"\u4F24\u5BB3 +20%",apply:n=>{n.dmg*=1.2}},{id:"magnet",tier:"silver",icon:"\u{1F9F2}",name:"\u7CD6\u846B\u82A6\u78C1\u94C1",desc:"\u62FE\u53D6\u8303\u56F4 +60%",apply:n=>{n.pickup*=1.6}},{id:"auntie",tier:"silver",icon:"\u{1F49A}",name:"\u521A\u548C\u963F\u59E8\u8BF4\u8BDD\u53BB\u4E86",desc:"\u6BCF 6 \u79D2\u56DE 1 \u70B9\u8840",apply:n=>{n.regen+=1}},{id:"yellow",tier:"silver",icon:"\u{1F3AF}",name:"\u9EC4\u623F\u4E0A\u6CA1\u4EBA",desc:"\u5C04\u7A0B +25%",apply:n=>{n.range*=1.25}},{id:"mbappe",tier:"silver",icon:"\u26BD",name:"\u59C6\u5DF4\u4F69\u6CA1\u6709\u95EE\u9898",desc:"\u653B\u901F +18%",apply:n=>{n.rate*=1.18}},{id:"armor",tier:"silver",icon:"\u{1F6E1}\uFE0F",name:"\u5317\u4EAC\u5927\u599E",desc:"\u53D7\u5230\u4F24\u5BB3 -15%",apply:n=>{n.armor=Math.min(.6,n.armor+.15)}},{id:"multi",tier:"gold",icon:"\u{1F386}",name:"\u6253\u6B7B\u4F60\u4EEC\u8FD9\u4E9B\u5ECA\u574A\u5A03",desc:"\u6BCF\u6B21\u591A\u53D1\u5C04 1 \u679A\u5B50\u5F39",apply:n=>{n.count+=1}},{id:"pierce",tier:"gold",icon:"\u{1FAA1}",name:"\u4E00\u7BAD\u7A7F\u7CD6",desc:"\u5B50\u5F39\u7A7F\u900F +1",apply:n=>{n.pierce+=1}},{id:"voice",tier:"gold",icon:"\u{1F3A4}",name:"\u58F0\u97F3\u6CA1\u6211\u751C",desc:"\u6BCF 5 \u79D2\u751C\u55D3\u4E00\u58F0\uFF0C\u9707\u6655\u5E76\u4F24\u5BB3\u5468\u56F4\u654C\u4EBA",apply:n=>{n.voice+=1}},{id:"bomb",tier:"gold",icon:"\u{1F4A3}",name:"\u4ED6\u5E94\u8BE5\u4E0D\u4F1A\u4E0B\u5305\u7684",desc:"\u6BCF 4 \u79D2\u5728\u811A\u4E0B\u4E0B\u4E2A\u5305\uFF0C\u7206\u70B8\u4F24\u5BB3",apply:n=>{n.bomb+=1}},{id:"hubby",tier:"gold",icon:"\u{1F91D}",name:"\u53EB\u961F\u53CB",desc:"\u6BCF 15 \u79D2\u961F\u53CB\u8521\u535A\u51B2\u8FC7\u6765\u6E05\u4E00\u6392\u602A",apply:n=>{n.hubby+=1}},{id:"window",tier:"gold",icon:"\u{1FA9F}",name:"\u4F60\u7684\u9F9F\u51B3\u5B9A\u5173\u7A97\u6237\u7761\u89C9\u4E86",desc:"\u6BCF 10 \u79D2\u83B7\u5F97\u4E00\u5C42\u62A4\u76FE\uFF0C\u6321\u4E00\u6B21\u4F24\u5BB3",apply:n=>{n.shield+=1}},{id:"sweetest",tier:"gold",icon:"\u{1F36C}",name:"\u6CA1\u4EBA\u6BD4\u6211\u751C",desc:"\u66B4\u51FB\u7387 +20%\uFF0C\u66B4\u51FB\u4F24\u5BB3 \xD72",apply:n=>{n.crit+=.2}},{id:"chief",tier:"gold",icon:"\u{1F451}",name:"\u5973\u914B\u957F\u7684\u795D\u798F",desc:"\u6BCF\u6CE2\u5F00\u59CB\u56DE\u6EE1\u8840\uFF0C\u4F24\u5BB3 +15%",apply:n=>{n.chief+=1,n.dmg*=1.15}},{id:"meteor",tier:"gold",icon:"\u2604\uFE0F",name:"\u7C73\u62C9\u5A1C\u7684\u6D41\u661F\u98CE\u66B4",desc:"\u6BCF 6 \u79D2\u6D41\u661F\u7838\u5411\u9644\u8FD1\u7684\u654C\u4EBA",apply:n=>{n.meteor+=1}},{id:"aegis",tier:"gold",icon:"\u{1F6DF}",name:"\u4E0D\u673D\u76FE",desc:"\u6B7B\u4EA1\u65F6\u539F\u5730\u590D\u6D3B\u4E00\u6B21",apply:n=>{n.aegis+=1}},{id:"bull",tier:"prism",icon:"\u{1F402}",name:"\u559C\u6B22\u6211\u7684\u767D\u725B\u5417",desc:"\u53EC\u5524\u767D\u725B\u4F19\u4F34\uFF0C\u6765\u56DE\u51B2\u649E\u654C\u4EBA",apply:n=>{n.bull+=1}},{id:"tide",tier:"gold",icon:"\u{1F30A}",name:"\u6F6E\u6C50\u76D1\u72F1\u8D8A\u72F1",desc:"\u6BCF 12 \u79D2\u653E\u4E00\u9053\u6F6E\u6C50\uFF0C\u51B2\u8D70\u5E76\u4F24\u5BB3\u4E00\u6574\u6392\u654C\u4EBA",apply:n=>{n.tide+=1}},{id:"bike",tier:"gold",icon:"\u{1F6B2}",name:"\u5317\u4EAC\u9A91\u884C\u592B\u5987",desc:"\u6BCF 12 \u79D2\u548C\u8521\u535A\u9A91\u53CC\u4EBA\u81EA\u884C\u8F66 5 \u79D2\uFF1A\u79FB\u901F \xD71.9\uFF0C\u649E\u98DE\u654C\u4EBA",apply:n=>{n.bike+=1}},{id:"horse",tier:"prism",icon:"\u{1F40E}",name:"\u9A6C\u80CC\u4E0A\u7684\u6C11\u65CF",desc:"\u6BCF 10 \u79D2\u5468\u671F\u51FA\u53D1\u9A91\u9A6C 4 \u79D2\uFF1A\u79FB\u901F \xD71.7\uFF0C\u649E\u98DE\u654C\u4EBA",apply:n=>{n.horse+=1}},{id:"wind",tier:"prism",icon:"\u{1F32A}\uFE0F",name:"\u4F60\u7684\u9F9F\u6628\u5929\u665A\u4E0A\u98CE\u597D\u5927",desc:"\u8EAB\u8FB9\u73AF\u7ED5\u9F99\u5377\u98CE\uFF0C\u6301\u7EED\u7EDE\u788E\u654C\u4EBA",apply:n=>{n.wind+=1}},{id:"ranked",tier:"prism",icon:"\u26A1",name:"\u4F60\u7684\u9F9F\u6253\u6392\u4F4D\u6253\u5F97\u597D\u7D2F",desc:"\u653B\u901F +60%\uFF0C\u4F46\u79FB\u901F -10%",apply:n=>{n.rate*=1.6,n.speed*=.9}},{id:"notified",tier:"prism",icon:"\u{1F514}",name:"\u6CA1\u4EBA\u901A\u77E5\u6211",desc:"25% \u95EA\u907F\uFF0C\u88AB\u6253\u524D\u603B\u4F1A\u6709\u4EBA\u901A\u77E5\u4F60",apply:n=>{n.dodge=Math.min(.6,n.dodge+.25)}},{id:"dahong",tier:"prism",icon:"\u{1F48E}",name:"\u51FA\u5927\u7EA2\u4E86",desc:"\u7ECF\u9A8C +50%\uFF0C3 \u4E2A\u5927\u7EA2\u73AF\u7ED5\u8EAB\u8FB9",apply:n=>{n.xpMul*=1.5,n.orbit+=3}}],yp={silver:"\u767D\u94F6",gold:"\u9EC4\u91D1",prism:"\u68F1\u5F69"},Fs={spider:"\u8D85\u7EA7\u8718\u86DB",bullet:"\u5B50\u5F39\u706B\u529B",turtle:"\u73AF\u7ED5\u9F9F",hubby:"\u8521\u535A\u652F\u63F4"},Ir=[{id:"health",name:"\u7ED3\u5B9E\u5F00\u5C40",desc:"\u521D\u59CB\u6700\u5927\u751F\u547D +2",cost:20,max:5,apply:n=>{n.maxhp+=2,n.hp+=2}},{id:"damage",name:"\u7EC3\u4E60\u5C04\u51FB",desc:"\u521D\u59CB\u4F24\u5BB3 +5%",cost:25,max:5,apply:n=>{n.dmg*=1.05}},{id:"rate",name:"\u63D0\u524D\u70ED\u624B",desc:"\u521D\u59CB\u653B\u901F +4%",cost:25,max:5,apply:n=>{n.rate*=1.04}},{id:"spider",name:"\u8718\u86DB\u9884\u70ED",desc:"\u5F00\u5C40\u5927\u62DB\u5145\u80FD +10",cost:30,max:5,apply:()=>{}}],gp={arrow:"bullet",multi:"bullet",pierce:"bullet",ranked:"bullet",mbappe:"bullet",wind:"turtle",dahong:"turtle",hubby:"hubby",bike:"hubby"};for(let n of Ns)gp[n.id]&&(n.path=gp[n.id]);Ns.push({id:"webReach",path:"spider",tier:"silver",icon:"\u{1F578}\uFE0F",name:"\u8718\u86DB\u6492\u7F51",desc:"\u8D85\u7EA7\u8718\u86DB\u8303\u56F4 +25%",apply:n=>{n.ultRange*=1.25}},{id:"webCharge",path:"spider",tier:"gold",icon:"\u{1F577}\uFE0F",name:"\u86DB\u4E1D\u84C4\u529B",desc:"\u666E\u901A\u51FB\u6740\u7684\u8718\u86DB\u5145\u80FD +50%",apply:n=>{n.ultCharge*=1.5}},{id:"webPower",path:"spider",tier:"prism",icon:"\u{1F49C}",name:"\u6BD2\u86DB\u5973\u738B",desc:"\u86DB\u7F51\u6301\u7EED\u4F24\u5BB3 +80%",apply:n=>{n.ultDamage*=1.8}},{id:"webEcho",path:"spider",tier:"gold",icon:"\u{1FA84}",name:"\u86DB\u7F51\u4F59\u54CD",desc:"\u6BCF\u6B21\u8718\u86DB\u65BD\u653E\u540E\uFF0C\u86DB\u7F51\u51FB\u6740\u6700\u591A\u8FD4\u8FD8 20 \u5145\u80FD",apply:n=>{n.ultEcho=!0}},{id:"bulletPower",path:"bullet",tier:"gold",icon:"\u{1F525}",name:"\u7A7F\u7532\u706B\u529B",desc:"\u5B50\u5F39\u4F24\u5BB3 +30%\uFF0C\u7A7F\u900F +1",apply:n=>{n.dmg*=1.3,n.pierce+=1}},{id:"bulletStorm",path:"bullet",tier:"prism",icon:"\u{1F320}",name:"\u5F39\u5E55\u65F6\u95F4",desc:"\u989D\u5916 2 \u679A\u5B50\u5F39\uFF0C\u653B\u901F +20%",apply:n=>{n.count+=2,n.rate*=1.2}},{id:"turtleGuard",path:"turtle",tier:"silver",icon:"\u{1F422}",name:"\u5C0F\u9F9F\u62A4\u536B",desc:"\u53EC\u5524 1 \u53EA\u73AF\u7ED5\u5C0F\u9F9F",apply:n=>{n.turtles+=1}},{id:"turtleSquad",path:"turtle",tier:"gold",icon:"\u{1F422}",name:"\u9F9F\u9F9F\u5C0F\u961F",desc:"\u518D\u53EC\u5524 2 \u53EA\u73AF\u7ED5\u5C0F\u9F9F",apply:n=>{n.turtles+=2}},{id:"turtlePower",path:"turtle",tier:"prism",icon:"\u{1F6E1}\uFE0F",name:"\u9F9F\u7532\u65CB\u98CE",desc:"\u73AF\u7ED5\u5C0F\u9F9F\u4F24\u5BB3\u7FFB\u500D",apply:n=>{n.turtlePower*=2}},{id:"hubbyQuick",path:"hubby",tier:"silver",icon:"\u26A1",name:"\u8521\u535A\u5FEB\u6765",desc:"\u8521\u535A\u652F\u63F4\u51B7\u5374\u7F29\u77ED 25%",apply:n=>{n.hubby=Math.max(1,n.hubby),n.hubbyCooldown*=.75}},{id:"hubbyPower",path:"hubby",tier:"gold",icon:"\u{1F91C}",name:"\u8521\u535A\u8BA4\u771F\u4E86",desc:"\u8521\u535A\u51B2\u950B\u4F24\u5BB3\u7FFB\u500D",apply:n=>{n.hubby=Math.max(1,n.hubby),n.hubbyPower*=2}},{id:"hubbyStorm",path:"hubby",tier:"prism",icon:"\u{1F91D}",name:"\u6700\u4F73\u642D\u6863",desc:"\u8521\u535A\u652F\u63F4\u66F4\u5FEB\u3001\u51B2\u950B\u4F24\u5BB3 +50%",apply:n=>{n.hubby=Math.max(1,n.hubby),n.hubbyCooldown*=.65,n.hubbyPower*=1.5}});var no=[{id:"shots",icon:"\u{1F3AF}",name:"\u591A\u4E00\u53D1",desc:"\u6BCF\u6B21\u5C04\u51FB\u989D\u5916\u53D1\u5C04 1 \u679A\u5B50\u5F39",available:n=>n.count<5,apply:n=>{n.count+=1}},{id:"damage",icon:"\u{1F4A5}",name:"\u706B\u529B\u8BAD\u7EC3",desc:"\u5B50\u5F39\u4F24\u5BB3 +15%",apply:n=>{n.dmg*=1.15}},{id:"speed",icon:"\u26A1",name:"\u5FEB\u624B\u8FDE\u5C04",desc:"\u653B\u51FB\u901F\u5EA6 +12%",apply:n=>{n.rate*=1.12}},{id:"health",icon:"\u2764\uFE0F",name:"\u7ED3\u5B9E\u4E00\u70B9",desc:"\u6700\u5927\u751F\u547D +3\uFF0C\u5E76\u56DE\u590D 3 \u70B9\u751F\u547D",apply:n=>{n.maxhp+=3,n.hp=Math.min(n.maxhp,n.hp+3)}},{id:"regen",icon:"\u{1F49A}",name:"\u6162\u6162\u56DE\u8840",desc:"\u6BCF 6 \u79D2\u989D\u5916\u6062\u590D 1 \u70B9\u751F\u547D",available:n=>n.regen<4,apply:n=>{n.regen+=1}},{id:"crit",icon:"\u2728",name:"\u627E\u51C6\u8981\u5BB3",desc:"\u66B4\u51FB\u7387 +6%",available:n=>n.crit<.5,apply:n=>{n.crit+=.06}},{id:"move",icon:"\u{1F3C3}",name:"\u811A\u4E0B\u751F\u98CE",desc:"\u79FB\u52A8\u901F\u5EA6 +8%",apply:n=>{n.speed*=1.08}}],_p=[{text:"\u4F24\u5BB3 +8%",lateText:"\u4F24\u5BB3 +3%",apply:(n,e)=>{n.dmg*=e?1.03:1.08}},{text:"\u653B\u901F +7%",lateText:"\u653B\u901F +3%",apply:(n,e)=>{n.rate*=e?1.03:1.07}},{text:"\u79FB\u901F +4%",lateText:"\u79FB\u901F +2%",apply:(n,e)=>{n.speed*=e?1.02:1.04}},{text:"\u6700\u5927\u751F\u547D +2",lateText:"\u6700\u5927\u751F\u547D +1",apply:(n,e)=>{let t=e?1:2;n.maxhp+=t,n.hp+=t}},{text:"\u62FE\u53D6\u8303\u56F4 +15%",lateText:"\u62FE\u53D6\u8303\u56F4 +8%",apply:(n,e)=>{n.pickup*=e?1.08:1.15}},{text:"\u66B4\u51FB +4%",lateText:"\u66B4\u51FB +2%",apply:(n,e)=>{n.crit+=e?.02:.04}},{text:"\u5C04\u7A0B +6%",lateText:"\u5C04\u7A0B +3%",apply:(n,e)=>{n.range*=e?1.03:1.06}}],io={horse:{name:"\u9A6C\u80CC\u4E0A\u7684\u6C11\u65CF",line:"\u9A6C\u80CC\u4E0A\u7684\u6C11\u65CF\uFF01",w:2},bike:{name:"\u5317\u4EAC\u9A91\u884C\u592B\u5987",line:"\u5317\u4EAC\u9A91\u884C\u592B\u5987\uFF01",w:2},bull:{name:"\u767D\u725B\u51B2\u950B",line:"\u559C\u6B22\u6211\u7684\u767D\u725B\u5417\uFF1F",w:2},meteor:{name:"\u7C73\u62C9\u5A1C\u7684\u6D41\u661F\u98CE\u66B4",line:"\u6D41\u661F\u98CE\u66B4\uFF01",w:2},chief:{name:"\u5973\u914B\u957F\u7684\u795D\u798F",line:"\u5973\u914B\u957F\u7684\u795D\u798F\uFF01",w:1},spider:{name:"\u8718\u86DB\u4E4B\u529B",line:"\u8D85\u7EA7\u8718\u86DB\u5145\u80FD\uFF01",w:1},douzhi:{name:"\u8C46\u6C41\u513F",line:"\u8FD9\u8C46\u6C41\u513F\uFF0C\u5730\u9053\uFF01",w:2},magnet:{name:"\u7CD6\u846B\u82A6\u78C1\u94C1",line:"\u7CD6\u846B\u82A6\u90FD\u8FC7\u6765\uFF01",w:1},chest:{name:"\u5927\u7EA2\u5B9D\u7BB1",line:"\u5927\u7EA2\u5B9D\u7BB1\uFF01",w:0}},Iu={frenzy:"\u72C2\u66B4\u7684",tough:"\u575A\u97E7\u7684",split:"\u5206\u88C2\u7684",boom:"\u7206\u70B8\u7684"},Uc=[[10,"\u5927\u6740\u7279\u6740"],[20,"\u4E3B\u5BB0\u6BD4\u8D5B"],[30,"\u6740\u4EBA\u5982\u9EBB"],[45,"\u65E0\u4EBA\u80FD\u6321"],[60,"\u53D8\u6001\u6740\u622E"],[80,"\u5996\u602A\u822C\u7684\u6740\u622E"],[100,"\u5982\u540C\u795E\u4E00\u822C"],[130,"\u8D85\u795E\uFF01"]];var wi=60,Pe=12.5,nt=12.5,ms=[{x:-6.2,y:5.2,r:1.05,kind:"tree"},{x:6.4,y:-5.6,r:.85,kind:"well"}],so=140,wn={durian:{r:.45,hp:6,sp:.042,dmg:1,xp:1},orange:{r:.4,hp:6,sp:.1,dmg:1,xp:1},ginger:{r:.42,hp:5,sp:.08,dmg:1,xp:1},caesar:{r:.5,hp:22,sp:.035,dmg:2,xp:3},chenwei:{r:.45,hp:14,sp:.04,dmg:1,xp:3},dingding:{r:.55,hp:18,sp:.034,dmg:2,xp:3},oyster:{r:.62,hp:16,sp:.026,dmg:2,xp:2,spit:210},goat:{r:.5,hp:11,sp:.036,dmg:2,xp:2,charge:!0},jia:{r:.45,hp:9,sp:.04,dmg:1,xp:2,ranged:!0},yi:{r:.45,hp:9,sp:.04,dmg:1,xp:2,ranged:!0},guo:{r:.45,hp:9,sp:.04,dmg:1,xp:2,lob:!0},thief:{r:.55,hp:16,sp:.085,dmg:0,xp:3,thief:!0},mao:{r:.8,hp:40,sp:.032,dmg:2,xp:5,split:4},maoqiu:{r:.32,hp:4,sp:.08,dmg:1,xp:.5},bigmao:{r:1.6,hp:800,sp:.036,dmg:3,xp:40,split:6,boss:!0},judge:{r:1.35,hp:2800,sp:.034,dmg:3,xp:0,boss:!0},finaljudge:{r:1.5,hp:8500,sp:.038,dmg:4,xp:0,boss:!0}},Nc=[null,{durian:4,ginger:3,orange:2},{durian:3,orange:2,goat:2,dingding:1,ginger:5},{durian:3,orange:2,goat:2,dingding:1,ginger:4,jia:1,yi:1,oyster:1,chenwei:1},{durian:3,orange:2,goat:2,dingding:1,ginger:4,jia:1,yi:1,oyster:1,chenwei:1,guo:1,thief:1,mao:1,caesar:1},{durian:3,orange:2,ginger:5,maoqiu:2},{durian:3,orange:2,goat:2,dingding:2,ginger:5,jia:2,yi:2,oyster:2,guo:1,thief:1,mao:1,caesar:2,chenwei:2},{durian:2,orange:3,goat:3,dingding:2,ginger:6,jia:2,yi:2,oyster:2,guo:2,thief:1,mao:2,caesar:2,chenwei:2},{durian:2,orange:3,goat:3,dingding:3,ginger:6,jia:3,yi:3,oyster:2,guo:2,thief:1,mao:2,caesar:2,chenwei:2},{durian:2,orange:3,goat:3,dingding:3,ginger:6,jia:3,yi:3,oyster:3,guo:3,thief:2,mao:3,caesar:2,chenwei:2},{durian:3,orange:2,ginger:5,jia:1,yi:1},{durian:2,ginger:4,goat:4,chenwei:3,caesar:3,mao:2},{orange:4,ginger:3,jia:4,yi:4,guo:4,thief:2,oyster:3},{goat:4,dingding:4,mao:3,chenwei:4,caesar:4,guo:2},{ginger:4,jia:2,yi:2,maoqiu:3}],$v=[0,28,32,36,0,42,44,48,0,50,52,54,56,58,0],Jv=[0,0,0,1,1,2,2,3,2,3,4,4,5,3,2],Kv={4:"bigmao",8:"judge",14:"finaljudge"},Bn=(n,e,t)=>Math.max(e,Math.min(t,n)),ki=(n,e)=>Math.hypot(n.x-e.x,n.y-e.y);function jv(){return{maxhp:15,hp:15,speed:.115,dmg:5,rate:2,range:7.5,count:1,pierce:0,spread:.12,crit:.05,pickup:2.2,regen:0,armor:0,dodge:0,xpMul:1,voice:0,bomb:0,hubby:0,hubbyCooldown:1,hubbyPower:1,shield:0,aegis:0,bull:0,wind:0,orbit:0,turtles:0,turtlePower:1,ultRange:12,ultDamage:1,ultCharge:1,ultEcho:!1,chief:0,meteor:0,horse:0,tide:0,bike:0}}function wp({rng:n=Math.random,meta:e={}}={}){e=e&&typeof e=="object"?e:{};let t=Object.fromEntries(Ir.map(s=>[s.id,Bn(Math.floor(Number(e.levels?.[s.id])||0),0,s.max)])),i=Number(e.points);return{rng:n,meta:{points:Number.isFinite(i)?Math.max(0,Math.floor(i)):0,levels:t,focus:Fs[e.focus]?e.focus:"spider"},state:"title",t:0,st:0,events:[],uid:1,wave:0,hero:null,enemies:[],bullets:[],ebullets:[],gems:[],spawns:[],zones:[],bombs:[],picks:0,offer:null}}function Ap(n,e){if(n.state!=="title")return!1;let t=Ir.find(s=>s.id===e),i=n.meta.levels[e];return!t||i>=t.max||n.meta.points<t.cost?!1:(n.meta.points-=t.cost,n.meta.levels[e]++,!0)}function Rp(n,e){return n.state!=="title"||!Fs[e]?!1:(n.meta.focus=e,!0)}function Cp(n,e){n.runAwarded||(n.runAwarded=!0,n.earned=5+n.wave*3+Math.floor(n.kills/15)+(e?25:0),n.meta.points+=n.earned,st(n,"runReward",{amount:n.earned}))}var Mt=n=>n.rng(),mt=(n,e,t)=>e+Mt(n)*(t-e),xt=(n,e)=>e[Math.floor(Mt(n)*e.length)],st=(n,e,t={})=>n.events.push({type:e,...t}),lt=(n,e)=>st(n,"sfx",{name:e}),Jt=(n,e,t,i,s="")=>st(n,"pop",{x:e,y:t,text:i,cls:s}),An=(n,e,t,i,s=12)=>st(n,"burst",{x:e,y:t,kind:i,n:s});function Ot(n,e,t=150){let i=n.hero;i&&(i.say=e,i.sayT=t,st(n,"voice",{text:e}))}function vp(n){let e=jv();for(let t of Ir)for(let i=0;i<n.meta.levels[t.id];i++)t.apply(e);n.hero={x:0,y:0,r:.5,vx:0,vy:0,face:0,inv:60,s:e,xp:0,lvl:1,cd:30,say:"",sayT:0,idleT:400,afk:0,ult:n.meta.levels.spider*10,shields:0,bless:0,lowSaid:!1,timers:{voice:0,bomb:0,hubby:0,shield:0,regen:0,meteor:0,horse:0,tide:0,bike:0},augs:[],statUps:[],moving:!1,ride:0,mount:"horse"},n.runAwarded=!1,n.earned=0,n.webEchoLeft=0,n.wave=0,n.kills=0,n.hitsTotal=0,n.shots=0,n.recentKills=[],n.missStreak=0,n.enemies=[],n.bullets=[],n.ebullets=[],n.gems=[],n.spawns=[],n.zones=[],n.bombs=[],n.meteors=[],n.bull=null,n.hubbyRun=null,n.rerolls=2,n.picks=0,n.pickPhase=null,n.offer=null,n.saidBomb=!1,n.saidWind=!1,n.time=0,n.score=0,n.combo=0,n.comboT=0,n.bestCombo=0,n.streakIdx=0,n.pickups=[],n.pickT=420,n.stampede=null,n.tides=[],n.pendingSupplies=[],Ip(n)}function Fc(n){return 6+n*4+Math.max(0,n-8)**2*2}function Ip(n){n.wave++,n.waveT=$v[n.wave]*wi,n.bossWave=!n.waveT,n.spawnT=50,n.boss=null;let e=new Set(Nc.slice(1,n.wave).flatMap(r=>Object.keys(r)));n.intro=Object.keys(Nc[n.wave]).filter(r=>!e.has(r)),n.state="play",n.st=0,n.enemies=[],n.ebullets=[],n.zones=[],n.spawns=[],n.pickups=[],n.pickT=360,n.waveClock=0,n.ws={kills:0,dmg:0,best:0},n.tides=[],n.tideT=360,n.tideSaid=!1;let t=n.waveT||60*wi,i=Jv[n.wave];n.eliteAt=Array.from({length:i},(r,a)=>Math.floor(t*(.18+.62*(i===1?.5:a/(i-1))))),st(n,"wave",{n:n.wave,boss:n.bossWave});let s=n.hero.s;if(s.chief&&n.wave>1&&(s.hp=s.maxhp,Jt(n,n.hero.x,n.hero.y,"\u5973\u914B\u957F\u7684\u795D\u798F","heal"),An(n,n.hero.x,n.hero.y,"gold",30)),n.bossWave){let r=Kv[n.wave];n.spawns.push({x:0,y:n.hero.y>0?-7:7,type:r,t:110}),Ot(n,xt(n,r==="bigmao"?Nt.bigmao:Nt.boss),200)}else n.wave>1&&Ot(n,xt(n,Nt.waveStart),120)}function Bc(n,e,t,i,s=null){let r=wn[e],a=Math.max(0,n.wave-7),o=r.boss?1:1+.2*(n.wave-1)+.025*(n.wave-1)**2+.09*a**2,l=r.boss?1:1+.03*(n.wave-1)+.015*a,c=r.dmg+(!r.boss&&n.wave>=7?1:0)+(!r.boss&&n.wave>=11?1:0),h={id:n.uid++,type:e,name:ps[e],x:t,y:i,r:r.r,hp:r.hp*o,max:r.hp*o,sp:r.sp*l*mt(n,.9,1.1),dmg:c,xp:r.xp,t:Math.floor(mt(n,0,200)),flash:0,stun:0,web:0,kx:0,ky:0,mode:"walk",modeT:0,carry:0,cd:mt(n,60,160),hitBy:{}};return r.boss&&(n.boss=h,h.cd=e==="finaljudge"?30:100,e==="finaljudge"&&(h.phase=0)),s&&(h.elite=s,h.name="\u7CBE\u82F1\xB7"+Iu[s]+h.name,h.r*=1.35,h.xp*=5,h.dmg+=1,h.hp=h.max=h.max*(s==="tough"?9:5),s==="frenzy"&&(h.sp*=1.6)),h}function Mp(n){let e=Nc[n.wave],t=Object.values(e).reduce((s,r)=>s+r,0),i=Mt(n)*t;for(let[s,r]of Object.entries(e))if((i-=r)<0)return s;return"durian"}function Qv(n){let e=n.hero,t=1+Math.floor(Mt(n)*(1+n.wave/2.5)),i,s,r=0;do i=mt(n,-Pe+1.5,Pe-1.5),s=mt(n,-nt+1.5,nt-1.5);while(Math.hypot(i-e.x,s-e.y)<5.5&&++r<20);let a=n.intro&&n.intro.length?n.intro.shift():Mp(n);for(let o=0;o<t;o++)n.spawns.push({x:Bn(i+mt(n,-1.2,1.2),-Pe+1,Pe-1),y:Bn(s+mt(n,-1.2,1.2),-nt+1,nt-1),type:Mt(n)<.75?a:Mp(n),t:55})}var eM={aegis:2,notified:2,ranked:2,armor:4,arrow:3,mbappe:3,multi:3,sweetest:2,chief:1,auntie:2,douzhi:3,window:2,wind:2,dahong:1,bulletStorm:2,bulletPower:3,webReach:3,webCharge:3,webPower:2,webEcho:1,turtleGuard:3,turtleSquad:2,turtlePower:2,hubbyQuick:3,hubbyPower:2,hubbyStorm:2},Pp={shots:4,damage:4,speed:4,health:5,regen:3,crit:4,move:4};function bp(n,e){let t=n.wave,i=t>=3?Math.min(.45,.05*t):0,s=.25+.05*t,r=Mt(n),a=e||(r<i?"prism":r<i+s?"gold":"silver"),o=u=>n.hero.augs.filter(d=>d===u).length,l=Ns.filter(u=>u.tier===a&&o(u.id)<(eM[u.id]??99)),c=[],h=l.filter(u=>u.path===n.meta.focus);if(h.length){let u=h[Math.floor(Mt(n)*h.length)];c.push(u),l.splice(l.indexOf(u),1)}for(;c.length<3&&l.length;)c.push(l.splice(Math.floor(Mt(n)*l.length),1)[0]);return n.offer={kind:"hex",tier:a,list:c.map(u=>u.id)},n.offer}function tM(n){if(n.wave===1&&n.hero.statUps.length===0)return n.offer={kind:"stat",list:["shots","damage","health"]},n.offer;let e=no.filter(i=>(!i.available||i.available(n.hero.s))&&n.hero.statUps.filter(s=>s===i.id).length<(Pp[i.id]??99)),t=[];for(;t.length<3&&e.length;)t.push(e.splice(Math.floor(Mt(n)*e.length),1)[0]);return n.offer={kind:"stat",list:t.map(i=>i.id)},n.offer}function nM(n,e){let t=no.find(i=>i.id===e);return!t||t.available&&!t.available(n.hero.s)||n.hero.statUps.filter(i=>i===e).length>=(Pp[e]??99)?!1:(t.apply(n.hero.s),n.hero.statUps.push(e),st(n,"statUp",{text:t.name}),!0)}function iM(n,e){let t=Ns.find(s=>s.id===e),i=n.hero;t.apply(i.s),i.augs.push(e),e==="bull"&&!n.bull&&(n.bull={x:i.x-1,y:i.y,vx:0,vy:0,mode:"follow",t:0,target:null}),st(n,"augment",{id:e})}function Sp(n){let e=n.hero,t=n.gems.length,i=n.pickups.length;for(let o of n.gems)Pu(n,o.v);n.gems=[];for(let o of n.pickups)gM(n,o);(t||i)&&st(n,"lootSweep",{gems:t,supplies:i});for(let o of n.enemies)An(n,o.x,o.y,"poof",6);if(n.enemies=[],n.ebullets=[],n.zones=[],n.spawns=[],n.bombs=[],n.meteors=[],n.hubbyRun=null,n.hero.ride=0,n.pickups=[],n.stampede=null,n.hero.bless=0,n.combo=0,n.comboT=0,e.s.hp=Math.min(e.s.maxhp,e.s.hp+2),lt(n,"waveEnd"),n.wave>=14){n.state="win",n.st=0,Cp(n,!0),lt(n,"win");return}n.picks=2,n.pickPhase="stat",n.bossWave&&(n.rerolls+=1);let s=n.ws,r=s.dmg===0?"S":s.dmg<3?"A":s.dmg<6?"B":"C",a={S:600,A:300,B:100,C:0}[r];n.score+=a,r==="S"&&(n.rerolls+=1),n.lastWave={n:n.wave,kills:s.kills,best:s.best,rating:r,bonus:a,reroll:r==="S",gems:t,supplies:i},n.state="pick",n.st=0,tM(n),Ot(n,xt(n,Nt.waveClear),120),st(n,"waveEnd",{...n.lastWave})}function Pu(n,e){let t=n.hero;for(t.xp+=e*t.s.xpMul;t.xp>=Fc(t.lvl);){t.xp-=Fc(t.lvl),t.lvl++;let i=xt(n,_p),s=t.lvl>12;i.apply(t.s,s),t.s.hp=Math.min(t.s.maxhp,t.s.hp+(s?1:2)),st(n,"levelup",{lvl:t.lvl,text:s?i.lateText:i.text}),lt(n,"levelup")}}function di(n,e,t,i={}){if(e.dead||e.invulnerable>0)return;let s=n.hero,r=!1;if(i.canCrit&&Mt(n)<s.s.crit&&(r=!0,t*=2),s.bless>0&&(t*=1.5),e.type==="bigmao"&&(t*=.85),e.type==="judge"&&(t*=.75),e.type==="finaljudge"&&(t*=.65),e.hp-=t,e.flash=6,i.kx){let a=wn[e.type].boss?.15:1;e.kx+=i.kx*a,e.ky+=i.ky*a}if(st(n,"dmg",{x:e.x,y:e.y,n:Math.round(t),crit:r}),e.type==="finaljudge"&&e.hp<=e.max*(2-e.phase)/3&&e.phase<2){if(e.phase++,e.hp=Math.max(e.hp,e.max*(3-e.phase)/3),e.invulnerable=150,e.cd=1,e.mode=e.phase===1?"slam":"gavel",e.modeT=70,e.mode==="slam")n.zones.push({id:n.uid++,x:e.x,y:e.y,r:5,t:70,T:70,dmg:3,kind:"slam",follow:e.id});else for(let a=0;a<7;a++){let o=a/7*Math.PI*2;n.zones.push({id:n.uid++,x:n.hero.x+Math.cos(o)*(a?3:0),y:n.hero.y+Math.sin(o)*(a?3:0),r:1.2,t:75+a*6,T:75+a*6,dmg:2,kind:"gavel"})}st(n,"bossTell",{move:e.mode}),st(n,"bossPhase",{n:e.phase})}e.hp<=0?sM(n,e,i):i.sfx!==!1&&lt(n,"hit")}function sM(n,e,t={}){if(e.dead)return;e.dead=!0;let i=n.hero;n.kills++,n.ws.kills++;let s=wn[e.type].boss?40:e.elite?25:4;if(t.fromWeb){if(i.s.ultEcho&&n.webEchoLeft>0){let l=Math.min(s,n.webEchoLeft);i.ult=Math.min(100,i.ult+l),n.webEchoLeft-=l}}else i.ult=Math.min(100,i.ult+Math.round(s*i.s.ultCharge));n.combo++,n.comboT=150,n.combo>n.bestCombo&&(n.bestCombo=n.combo),n.combo>n.ws.best&&(n.ws.best=n.combo);let r=wn[e.type].boss?2e3:e.elite?250:Math.max(5,Math.round(e.xp*10));for(n.score+=Math.round(r*(1+Math.floor(n.combo/10)*.25));n.streakIdx<Uc.length&&n.combo>=Uc[n.streakIdx][0];)st(n,"streak",{text:Uc[n.streakIdx][1],n:n.combo,tier:n.streakIdx}),lt(n,"streak"),n.streakIdx++;if(e.elite){if(st(n,"eliteDown",{x:e.x,y:e.y}),st(n,"shake",{amt:.6}),st(n,"hitstop",{frames:6}),n.pickups.push(Np(n,"chest",e.x,e.y)),e.elite==="split"&&n.enemies.length<so)for(let l=0;l<3;l++){let c=l/3*Math.PI*2,h=Bc(n,e.type==="thief"?"durian":e.type,e.x+Math.cos(c)*.8,e.y+Math.sin(c)*.8);h.kx=Math.cos(c)*.25,h.ky=Math.sin(c)*.25,n.enemies.push(h)}e.elite==="boom"&&n.zones.push({id:n.uid++,x:e.x,y:e.y,r:2.4,t:45,T:45,dmg:2,kind:"boom"})}An(n,e.x,e.y,e.type==="mao"||e.type==="maoqiu"||e.type==="bigmao"?"fluff":"kill",wn[e.type].boss?70:14),lt(n,wn[e.type].boss?"bossdown":"kill");let a=Math.max(0,Math.round(e.xp))+Math.floor(e.carry*1.5);for(let l=0;l<a;l++)n.gems.push({id:n.uid++,x:e.x+mt(n,-.4,.4),y:e.y+mt(n,-.4,.4),v:1,mag:!1,vx:0,vy:0});e.xp<1&&Mt(n)<e.xp&&n.gems.push({id:n.uid++,x:e.x,y:e.y,v:1,mag:!1,vx:0,vy:0});let o=wn[e.type].split;if(o&&n.enemies.length<so){let l=e.type==="bigmao"?"mao":"maoqiu";for(let c=0;c<o;c++){let h=c/o*Math.PI*2,u=Bc(n,l,e.x+Math.cos(h)*e.r,e.y+Math.sin(h)*e.r);u.kx=Math.cos(h)*.2,u.ky=Math.sin(h)*.2,n.enemies.push(u)}}e.type==="thief"&&Jt(n,e.x,e.y,"\u5434\u6D69\u7136\uFF1A\u6211\u8FD8\u4F1A\u56DE\u6765\u7684","small"),e===n.boss&&(n.boss=null,st(n,"shake",{amt:1}),e.type==="judge"?(Jt(n,e.x,e.y,"\u9000\u5EAD\uFF01","big"),Ot(n,"\u6C89\u6BC5\u7F8A\u6CD5\u5B98\uFF1F\u5C31\u8FD9\uFF1F",200)):(Jt(n,e.x,e.y,"\u96EA\u83DC\u2026\u2026","big"),Ot(n,"\u5927\u6BDB\uFF0C\u4F60\u8FD8\u633A\u8F6F\u4E4E",160))),n.recentKills.push(n.t),n.recentKills=n.recentKills.filter(l=>n.t-l<80),n.recentKills.length>=6&&i.sayT<40&&(Ot(n,xt(n,Nt.multi),120),n.recentKills=[])}function Du(n,e,t,i){let s=n.hero;if(s.inv>0||s.bless>0||n.state!=="play")return!1;if(Mt(n)<s.s.dodge)return s.inv=20,Jt(n,s.x,s.y,xt(n,Nt.dodge),"dodge"),lt(n,"dodge"),!1;if(s.shields>0)return s.shields--,s.inv=40,s.sayT<=0&&Ot(n,xt(n,Nt.shield),110),st(n,"shieldBreak",{}),lt(n,"shield"),!1;s.s.hp-=e*(1-s.s.armor),n.ws.dmg+=e,s.inv=45,s.s.hp>0&&s.s.hp<=s.s.maxhp*.3&&!s.lowSaid&&(s.lowSaid=!0,Ot(n,xt(n,Nt.lowhp),140)),s.s.hp>s.s.maxhp*.5&&(s.lowSaid=!1);let r=Math.hypot(s.x-t,s.y-i)||1;return s.vx+=(s.x-t)/r*.12,s.vy+=(s.y-i)/r*.12,st(n,"hurt",{}),st(n,"shake",{amt:.35}),lt(n,"hurt"),s.sayT<=0&&Mt(n)<.5&&Ot(n,xt(n,Nt.hurt),100),s.s.hp<=0&&(s.s.aegis>0?(s.s.aegis--,s.s.hp=s.s.maxhp,s.inv=150,Ot(n,"\u4E0D\u673D\u76FE\uFF01\u4E70\u6D3B\u4E86\uFF01",160),An(n,s.x,s.y,"gold",40),lt(n,"aegis")):(s.s.hp=0,n.state="over",n.st=0,n.overQuote=xt(n,Nt.dead),Cp(n,!1),lt(n,"over"))),!0}function Dp(n,e){n.t++;let t=e.pressed||{};if(n.state==="title"){t.start&&vp(n);return}if(n.state==="over"||n.state==="win"){n.st++,t.start&&vp(n);return}if(n.state==="pause"){(t.pause||t.start)&&(n.state="play");return}if(n.state==="pick"){n.st++,t.reroll&&n.pickPhase==="hex"&&n.rerolls>0&&(n.rerolls--,bp(n,n.offer.tier),lt(n,"reroll")),t.pick!=null&&n.offer&&n.offer.list[t.pick]&&n.st>20&&(n.pickPhase==="stat"?nM(n,n.offer.list[t.pick]):iM(n,n.offer.list[t.pick]),n.picks--,n.st=0,n.picks>0?(n.pickPhase="hex",bp(n)):(n.offer=null,n.pickPhase=null,Ip(n)));return}if(t.pause){n.state="pause";return}n.time++;let i=n.hero,s=i.s,r=e.mx||0,a=e.my||0,o=Math.hypot(r,a);o>1&&(r/=o,a/=o),i.moving=o>.15;let l=s.speed*(i.ride>0?i.mount==="bike"?1.9:1.7:1);i.vx+=(r*l-i.vx)*.35,i.vy+=(a*l-i.vy)*.35,i.x=Bn(i.x+i.vx,-Pe+i.r,Pe-i.r),i.y=Bn(i.y+i.vy,-nt+i.r,nt-i.r),Lp(i),i.moving&&(i.face=Math.atan2(a,r)),i.inv>0&&i.inv--,i.sayT>0&&i.sayT--,o>.15||t.ult?(i.afk>420&&Ot(n,xt(n,Nt.afk),160),i.afk=0):i.afk++,--i.idleT<=0&&(i.sayT<=0&&Ot(n,xt(n,Nt.idle),150),i.idleT=mt(n,600,900));let c=!1;if(n.bossWave){if(c=!!n.boss||n.spawns.some(h=>wn[h.type].boss),!c&&n.enemies.length===0&&n.spawns.length===0){Sp(n);return}}else{let h=n.waveT===1;if(n.waveT=Math.max(0,n.waveT-1),n.waveT===0&&n.enemies.length===0&&n.spawns.length===0){Sp(n);return}h&&st(n,"cleanup")}for(n.waveClock++;n.eliteAt.length&&n.waveClock>=n.eliteAt[0];)n.eliteAt.shift(),fM(n);n.comboT>0&&--n.comboT===0&&(n.combo=0,n.streakIdx=0),i.bless>0&&i.bless--,mM(n),xM(n),(n.bossWave?c:n.waveT>0)&&--n.spawnT<=0&&n.enemies.length<so&&(Qv(n),n.spawnT=Math.max(14,66-n.wave*6)*(n.bossWave?2.6:1)*mt(n,.8,1.2));for(let h of n.spawns)--h.t>0||(h.done=!0,!(Math.hypot(h.x-i.x,h.y-i.y)<1.2&&!wn[h.type].boss&&!h.elite)&&(n.enemies.push(Bc(n,h.type,h.x,h.y,h.elite)),h.elite&&(st(n,"elite",{name:n.enemies[n.enemies.length-1].name}),i.sayT<=0&&Ot(n,xt(n,Nt.elite),120),lt(n,"elite")),An(n,h.x,h.y,wn[h.type].boss?"gold":"spawn",wn[h.type].boss?40:6),wn[h.type].boss&&(st(n,"boss",{type:h.type}),st(n,"shake",{amt:.8}),lt(n,"slam"))));if(n.spawns=n.spawns.filter(h=>!h.done),n.pendingSupplies.length&&(n.boss||n.enemies.length>=4||n.waveClock>=3*wi&&n.enemies.length)){for(let h of n.pendingSupplies)Fp(n,{kind:h,x:i.x,y:i.y});n.pendingSupplies=[]}rM(n),aM(n),t.ult&&oM(n),lM(n),hM(n),uM(n),dM(n),n.enemies=n.enemies.filter(h=>!h.dead)}function Lp(n){for(let e of ms){let t=n.x-e.x,i=n.y-e.y,s=Math.hypot(t,i),r=e.r+n.r;s<r&&s>1e-4&&(n.x=e.x+t/s*r,n.y=e.y+i/s*r)}}function Up(n,e,t,i,s=!1){let r=null,a=i;for(let o of n.enemies){if(o.dead)continue;let l=Math.hypot(o.x-e,o.y-t)-o.r-(s&&(wn[o.type].boss||o.elite)?2.5:0);l<a&&(a=l,r=o)}return r}function rM(n){let e=n.hero,t=e.s;if(--e.cd>0)return;let i=Up(n,e.x,e.y,t.range,!0);if(!i){e.cd=4;return}e.cd=wi/t.rate;let s=Math.atan2(i.y-e.y,i.x-e.x);e.aim=s;for(let r=0;r<t.count;r++){let a=s+(r-(t.count-1)/2)*.16+mt(n,-t.spread,t.spread),o=.32;n.bullets.push({id:n.uid++,x:e.x+Math.cos(a)*.6,y:e.y+Math.sin(a)*.6,vx:Math.cos(a)*o,vy:Math.sin(a)*o,life:t.range/o+4,pierce:t.pierce,hit:new Set})}n.shots++,st(n,"fire",{a:s}),lt(n,"shoot")}function aM(n){let e=n.hero,t=e.s,i=e.timers,s=t.dmg/5;if(t.regen&&++i.regen>=360&&(i.regen=0,t.hp<t.maxhp&&(t.hp=Math.min(t.maxhp,t.hp+t.regen),Jt(n,e.x,e.y,"+"+t.regen+" \u2665","heal"))),t.shield&&e.shields<t.shield&&++i.shield>=600&&(i.shield=0,e.shields++,lt(n,"shieldUp")),t.voice&&++i.voice>=300){i.voice=0;let o=3+.5*t.voice;st(n,"ring",{x:e.x,y:e.y,r:o,kind:"voice"}),lt(n,"sweet"),e.sayT<=0&&Mt(n)<.35&&Ot(n,xt(n,Nt.voice),90);for(let l of n.enemies)ki(l,e)<o+l.r&&(l.stun=Math.max(l.stun,wn[l.type].boss?30:90),di(n,l,6*t.voice*s,{sfx:!1}));n.ebullets=n.ebullets.filter(l=>Math.hypot(l.x-e.x,l.y-e.y)>o)}t.bomb&&++i.bomb>=240&&(i.bomb=0,n.bombs.push({id:n.uid++,x:e.x,y:e.y,t:80,r:2.3+.2*t.bomb,dmg:16*t.bomb*s}),n.saidBomb||(n.saidBomb=!0,Ot(n,Nt.bomb[0],140)),lt(n,"plant"));for(let o of n.bombs)if(!(--o.t>0)){o.done=!0,st(n,"ring",{x:o.x,y:o.y,r:o.r,kind:"boom"}),st(n,"shake",{amt:.4}),An(n,o.x,o.y,"boom",26),lt(n,"boom");for(let l of n.enemies)if(Math.hypot(l.x-o.x,l.y-o.y)<o.r+l.r){let c=Math.hypot(l.x-o.x,l.y-o.y)||1;di(n,l,o.dmg,{kx:(l.x-o.x)/c*.3,ky:(l.y-o.y)/c*.3,sfx:!1})}}if(n.bombs=n.bombs.filter(o=>!o.done),t.hubby&&++i.hubby>=Math.max(300,900*t.hubbyCooldown)){i.hubby=0;let o=e.x>0?-1:1;n.hubbyRun={x:-o*(Pe+2),y:e.y,dir:o,hit:new Set,dmg:40*t.hubby*t.hubbyPower*s},Ot(n,xt(n,Nt.hubby),120),lt(n,"hubby"),st(n,"hubby",{})}if(n.hubbyRun){let o=n.hubbyRun;o.x+=o.dir*.42;for(let l of n.enemies)!o.hit.has(l.id)&&Math.abs(l.y-o.y)<1.3+l.r&&Math.abs(l.x-o.x)<.9+l.r&&(o.hit.add(l.id),di(n,l,o.dmg,{kx:o.dir*.4,ky:0,sfx:!1}));Math.abs(o.x)>Pe+3&&(n.hubbyRun=null)}if(t.meteor&&++i.meteor>=Math.max(200,360-50*(t.meteor-1))){i.meteor=0;let o=n.enemies.filter(l=>ki(l,e)<9).sort((l,c)=>ki(l,e)-ki(c,e)).slice(0,2+t.meteor);for(let[l,c]of o.entries()){let h={x:c.x,y:c.y,t:30+l*6,r:1.6,dmg:20*t.meteor*s};n.meteors.push(h),st(n,"meteor",{x:h.x,y:h.y,t:h.t})}o.length&&e.sayT<=0&&Mt(n)<.4&&Ot(n,Nt.meteor[0],90)}for(let o of n.meteors)if(!(--o.t>0)){o.done=!0,st(n,"ring",{x:o.x,y:o.y,r:o.r,kind:"star"}),An(n,o.x,o.y,"gold",16),st(n,"shake",{amt:.15}),lt(n,"star");for(let l of n.enemies)Math.hypot(l.x-o.x,l.y-o.y)<o.r+l.r&&di(n,l,o.dmg,{sfx:!1})}if(n.meteors=n.meteors.filter(o=>!o.done),t.horse&&e.ride<=0&&++i.horse>=600&&(i.horse=0,Oc(n,"horse",240+30*(t.horse-1))),t.bike&&e.ride<=0&&++i.bike>=720&&(i.bike=0,Oc(n,"bike",300+30*(t.bike-1))),e.ride>0){--e.ride===0&&An(n,e.x,e.y,"dust",10);for(let o of n.enemies){if(ki(o,e)>e.r+o.r+.35||(o.hitBy.horse||0)>n.time)continue;o.hitBy.horse=n.time+20;let l=ki(o,e)||1;di(n,o,8*Math.max(1,t.horse)*s,{kx:(o.x-e.x)/l*.35,ky:(o.y-e.y)/l*.35,sfx:!1})}}n.orbiters=[];let r=t.wind?t.wind+1:0;for(let o=0;o<r;o++){let l=n.time*.045+o/r*Math.PI*2;n.orbiters.push({kind:"wind",x:e.x+Math.cos(l)*2.6,y:e.y+Math.sin(l)*2.6,r:.75,dmg:3*t.wind*s,tick:15})}for(let o=0;o<t.orbit;o++){let l=-n.time*.07+o/t.orbit*Math.PI*2;n.orbiters.push({kind:"dahong",x:e.x+Math.cos(l)*1.55,y:e.y+Math.sin(l)*1.55,r:.4,dmg:4*s,tick:20})}for(let o=0;o<t.turtles;o++){let l=n.time*.055+o/t.turtles*Math.PI*2;n.orbiters.push({kind:"turtle"+o,visual:"turtle",x:e.x+Math.cos(l)*1.9,y:e.y+Math.sin(l)*1.9,r:.55,dmg:5*t.turtlePower*s,tick:22})}r&&!n.saidWind&&(n.saidWind=!0,Ot(n,Nt.wind[0],160));for(let o of n.orbiters)for(let l of n.enemies){if(Math.hypot(l.x-o.x,l.y-o.y)>o.r+l.r)continue;let c=o.kind;(l.hitBy[c]||0)>n.time||(l.hitBy[c]=n.time+o.tick,di(n,l,o.dmg,{sfx:!1}))}let a=n.bull;if(a){if(a.t++,a.mode==="follow"){let o=e.x-Math.cos(e.face)*1.4,l=e.y-Math.sin(e.face)*1.4;if(a.vx+=((o-a.x)*.08-a.vx)*.2,a.vy+=((l-a.y)*.08-a.vy)*.2,a.t>90-t.bull*15){let c=Up(n,e.x,e.y,9);if(c){let h=Math.hypot(c.x-a.x,c.y-a.y)||1;a.vx=(c.x-a.x)/h*.26,a.vy=(c.y-a.y)/h*.26,a.mode="charge",a.t=0,lt(n,"moo"),e.sayT<=0&&Mt(n)<.3&&Ot(n,xt(n,Nt.bull),110)}}}else a.t>40&&(a.mode="follow",a.t=0);if(a.x=Bn(a.x+a.vx,-Pe+.6,Pe-.6),a.y=Bn(a.y+a.vy,-nt+.6,nt-.6),a.mode==="charge")for(let o of n.enemies)Math.hypot(o.x-a.x,o.y-a.y)>.8+o.r||(o.hitBy.bull||0)>n.time||(o.hitBy.bull=n.time+30,di(n,o,12*t.bull*s,{kx:a.vx*1.2,ky:a.vy*1.2,sfx:!1}),An(n,o.x,o.y,"dust",5))}}function oM(n){let e=n.hero;if(e.ult<100){e.sayT<=0&&Ot(n,"\u8D85\u7EA7\u8718\u86DB\u8FD8\u6CA1\u5145\u597D",70);return}e.ult=0,n.webEchoLeft=e.s.ultEcho?20:0,Ot(n,xt(n,Nt.ult),150),st(n,"ult",{x:e.x,y:e.y,range:e.s.ultRange}),st(n,"shake",{amt:.7}),lt(n,"ult");for(let t of n.enemies)ki(t,e)<e.s.ultRange&&(t.web=wn[t.type].boss?100:260);n.ebullets=[]}function lM(n){let e=n.hero,t=n.enemies;for(let i=0;i<t.length;i++){let s=t[i];for(let r=i+1;r<t.length;r++){let a=t[r],o=a.x-s.x,l=a.y-s.y,c=s.r+a.r;if(Math.abs(o)>c||Math.abs(l)>c)continue;let h=Math.hypot(o,l);if(h>=c||h<1e-4)continue;let u=(c-h)*.25,d=o/h,f=l/h,m=a.r/c,v=s.r/c;s.x-=d*u*m,s.y-=f*u*m,a.x+=d*u*v,a.y+=f*u*v}}for(let i of t){if(i.dead)continue;i.t++,i.invulnerable>0&&i.invulnerable--,i.flash>0&&i.flash--,i.web>0&&(i.web--,i.web%20===0&&di(n,i,4*e.s.ultDamage*(e.s.dmg/5),{sfx:!1,fromWeb:!0})),i.x+=i.kx,i.y+=i.ky,i.kx*=.82,i.ky*=.82;let s=e.x-i.x,r=e.y-i.y,a=Math.hypot(s,r)||1,o=s/a,l=r/a,c=i.stun>0||i.web>0;i.stun>0&&i.stun--,c||cM(n,i,a,o,l),i.x=Bn(i.x,-Pe+i.r,Pe-i.r),i.y=Bn(i.y,-nt+i.r,nt-i.r),Lp(i),!c&&i.dmg&&a<i.r+e.r&&Du(n,i.dmg,i.x,i.y)}}function cM(n,e,t,i,s){let r=n.hero,a=(o=1)=>{e.x+=i*e.sp*o,e.y+=s*e.sp*o,e.face=Math.atan2(s,i)};switch(e.type){case"goat":e.mode==="walk"?(a(),t<6.5&&--e.cd<=0&&(e.mode="wind",e.modeT=40,e.cx=i,e.cy=s,e.face=Math.atan2(s,i))):e.mode==="wind"?--e.modeT<=0&&(e.mode="dash",e.modeT=24,lt(n,"baa")):e.mode==="dash"&&(e.x+=e.cx*.24,e.y+=e.cy*.24,--e.modeT<=0&&(e.mode="walk",e.cd=mt(n,120,180),n.ebullets.push({id:n.uid++,x:e.x,y:e.y,vx:i*.13,vy:s*.13,r:.2,life:200,dmg:1,kind:"sausage",spin:0}),Jt(n,e.x,e.y,xt(n,Ln.goat),"shout"),r.sayT<=0&&t<9&&Mt(n)<.6&&Ot(n,xt(n,Nt.life),120),lt(n,"throw")));break;case"jia":case"yi":case"guo":{let o=e.type==="guo"?7:6;t>o+.6?a():t<o-1.5?a(-.8):(e.x+=-s*e.sp*.5*(e.id%2?1:-1),e.y+=i*e.sp*.5*(e.id%2?1:-1),e.face=Math.atan2(s,i)),--e.cd<=0&&t<11&&(e.cd=mt(n,150,210),e.type==="guo"?n.zones.push({id:n.uid++,x:r.x+r.vx*30,y:r.y+r.vy*30,r:1.3,t:70,T:70,dmg:2,kind:"ping"}):n.ebullets.push({id:n.uid++,x:e.x+i*.5,y:e.y+s*.5,vx:i*.11,vy:s*.11,r:.18,life:220,dmg:1,kind:"bolt"}),lt(n,e.type==="guo"?"ping":"eshoot"),Mt(n)<.3&&(Jt(n,e.x,e.y,xt(n,Ln[e.type]),"shout"),Mt(n)<.3&&r.sayT<=0&&Ot(n,xt(n,Nt.voice),90)));break}case"orange":{(e.dx==null||--e.cd<=0)&&(e.dx=i,e.dy=s,e.cd=mt(n,150,220),Mt(n)<.25&&Jt(n,e.x,e.y,xt(n,Ln.orange),"shout")),e.x+=e.dx*e.sp,e.y+=e.dy*e.sp,Math.abs(e.x)>Pe-e.r-.05&&(e.dx=-Math.sign(e.x)*Math.abs(e.dx)),Math.abs(e.y)>nt-e.r-.05&&(e.dy=-Math.sign(e.y)*Math.abs(e.dy));for(let o of ms){let l=e.x-o.x,c=e.y-o.y,h=Math.hypot(l,c);if(h<o.r+e.r+.05){let u=l/h,d=c/h,f=e.dx*u+e.dy*d;f<0&&(e.dx-=2*f*u,e.dy-=2*f*d)}}e.face=Math.atan2(e.dy,e.dx),e.roll=(e.roll||0)+e.sp/e.r;break}case"dingding":if(e.mode==="walk")a(),t<5.5&&--e.cd<=0&&(e.mode="leap",e.modeT=40,e.sx=e.x,e.sy=e.y,e.tx=r.x,e.ty=r.y,n.zones.push({id:n.uid++,x:r.x,y:r.y,r:1.1,t:40,T:40,dmg:2,kind:"slam"}),Mt(n)<.5&&Jt(n,e.x,e.y,xt(n,Ln.dingding),"shout"));else{let o=1-e.modeT/40;e.x=e.sx+(e.tx-e.sx)*o,e.y=e.sy+(e.ty-e.sy)*o,e.hop=Math.sin(o*Math.PI)*1.6,--e.modeT<=0&&(e.mode="walk",e.hop=0,e.cd=mt(n,140,200),An(n,e.x,e.y,"dust",10))}break;case"caesar":t>5.5?a():t<3.5?a(-.6):a(.2),--e.cd<=0&&t<9&&(e.cd=mt(n,150,200),e.throwT=18,n.ebullets.push({id:n.uid++,x:e.x+i*.5,y:e.y+s*.5,vx:i*.16,vy:s*.16,r:.18,life:140,dmg:2,kind:"spear"}),Mt(n)<.35&&Jt(n,e.x,e.y,xt(n,Ln.caesar),"shout"),lt(n,"throw")),e.throwT>0&&e.throwT--;break;case"chenwei":if(e.mode==="walk")t>8.5?a():t<5?a(-.8):(e.x+=-s*e.sp*.4,e.y+=i*e.sp*.4,e.face=Math.atan2(s,i)),--e.cd<=0&&t<12&&(Mt(n)<.3?(n.zones.push({id:n.uid++,x:r.x+r.vx*25,y:r.y+r.vy*25,r:3.2,t:55,T:55,dmg:0,kind:"flash"}),Jt(n,e.x,e.y,"Fire in the hole!","shout"),e.cd=mt(n,160,220)):(e.mode="aim",e.modeT=50,e.aimX=r.x,e.aimY=r.y));else if(e.mode==="aim")e.aimX+=(r.x-e.aimX)*.05,e.aimY+=(r.y-e.aimY)*.05,e.face=Math.atan2(e.aimY-e.y,e.aimX-e.x),--e.modeT<=0&&(e.mode="burst",e.modeT=18);else if(e.mode==="burst"){if(e.modeT%6===0){let o=Math.atan2(e.aimY-e.y,e.aimX-e.x)+mt(n,-.05,.05);n.ebullets.push({id:n.uid++,x:e.x+Math.cos(o)*.5,y:e.y+Math.sin(o)*.5,vx:Math.cos(o)*.24,vy:Math.sin(o)*.24,r:.12,life:90,dmg:1,kind:"bolt"}),lt(n,"rifle")}--e.modeT<=0&&(e.mode="walk",e.cd=mt(n,130,190),Mt(n)<.25&&Jt(n,e.x,e.y,xt(n,Ln.chenwei),"shout"))}break;case"ginger":{--e.cd<=0&&(e.side=(e.side||1)*-1,e.cd=mt(n,26,46),Mt(n)<.12&&Jt(n,e.x,e.y,xt(n,Ln.ginger),"shout"));let o=t<2.2?.2:.85;e.x+=(i+-s*(e.side||1)*o)*e.sp,e.y+=(s+i*(e.side||1)*o)*e.sp,e.face=Math.atan2(s+i*(e.side||1)*o,i-s*(e.side||1)*o);break}case"oyster":if(a(),e.t%400===0&&Mt(n)<.3&&Jt(n,e.x,e.y,xt(n,Ln.oyster),"shout"),--e.cd<=0&&t<9){e.cd=wn.oyster.spit,e.open=20;let o=Math.atan2(s,i);for(let l=-1;l<=1;l++)n.ebullets.push({id:n.uid++,x:e.x,y:e.y,vx:Math.cos(o+l*.28)*.09,vy:Math.sin(o+l*.28)*.09,r:.16,life:200,dmg:1,kind:"pearl"});lt(n,"spit")}e.open>0&&e.open--;break;case"thief":{if(e.skill==null&&(e.skill=mt(n,120,200)),t<7.5&&--e.skill<=0){e.skill=mt(n,240,320);let c=Math.atan2(s,i);for(let h=-1;h<=1;h++)n.ebullets.push({id:n.uid++,x:e.x,y:e.y,vx:Math.cos(c+h*.32)*.1,vy:Math.sin(c+h*.32)*.1,r:.2,life:220,dmg:1,kind:"hongbao"});Jt(n,e.x,e.y,xt(n,Ln.caili),"shout"),lt(n,"throw")}let o=null,l=1e9;for(let c of n.gems){let h=Math.hypot(c.x-e.x,c.y-e.y);h<l&&(l=h,o=c)}if(t<3.5)a(-1.1),e.t%300===1&&Mt(n)<.5&&Jt(n,e.x,e.y,xt(n,Ln.thief),"shout");else if(o){let c=o.x-e.x,h=o.y-e.y,u=Math.hypot(c,h)||1;e.x+=c/u*e.sp,e.y+=h/u*e.sp,e.face=Math.atan2(h,c),u<.5&&(o.gone=!0,e.carry++,e.carry===3&&Jt(n,e.x,e.y,xt(n,Ln.thief),"shout"))}else a(.6);n.gems=n.gems.filter(c=>!c.gone);break}case"bigmao":if(e.mode==="walk")a(),--e.cd<=0&&(Jt(n,e.x,e.y,xt(n,Ln.mao),"shout"),e.mode="leap",e.modeT=55,e.tx=r.x,e.ty=r.y,e.sx=e.x,e.sy=e.y,n.zones.push({id:n.uid++,x:r.x,y:r.y,r:2.7,t:55,T:55,dmg:3,kind:"slam"}));else if(e.mode==="leap"){let o=1-e.modeT/55;if(e.x=e.sx+(e.tx-e.sx)*o,e.y=e.sy+(e.ty-e.sy)*o,e.hop=Math.sin(o*Math.PI)*4,--e.modeT<=0&&(e.mode="walk",e.hop=0,e.cd=mt(n,135,170),st(n,"shake",{amt:.6}),An(n,e.x,e.y,"fluff",30),lt(n,"slam"),n.enemies.length<so))for(let l=0;l<3;l++)n.enemies.push(Bc(n,"maoqiu",e.x+mt(n,-1,1),e.y+mt(n,-1,1)))}break;case"judge":case"finaljudge":{let o=e.type==="finaljudge",l=e.hp<e.max/2;if(e.mode==="walk"){if(a(l?1.4:1),--e.cd<=0){let c=["slam","papers","gavel"];if(e.mode=c[e.moveIdx=((e.moveIdx??-1)+1)%3],e.modeT=o?70:50,o&&st(n,"bossTell",{move:e.mode}),Mt(n)<.6&&Jt(n,e.x,e.y,xt(n,Ln.judge),"shout"),e.mode==="slam"&&n.zones.push({id:n.uid++,x:e.x,y:e.y,r:o?5:4,t:e.modeT,T:e.modeT,dmg:3,kind:"slam",follow:e.id}),e.mode==="gavel")for(let h=0;h<(l||o?7:5);h++){let u=mt(n,0,Math.PI*2),d=h===0?0:mt(n,1.5,o?5:4);n.zones.push({id:n.uid++,x:r.x+Math.cos(u)*d,y:r.y+Math.sin(u)*d,r:1.2,t:(o?75:55)+h*6,T:(o?75:55)+h*6,dmg:2,kind:"gavel"})}}}else if(--e.modeT<=0){if(e.mode==="papers"){let c=o?24:l?18:12,h=mt(n,0,1);for(let u=0;u<c;u++){let d=(u+h)/c*Math.PI*2;n.ebullets.push({id:n.uid++,x:e.x,y:e.y,vx:Math.cos(d)*(o?.125:.1),vy:Math.sin(d)*(o?.125:.1),r:.25,life:260,dmg:o?2:1,kind:"paper",spin:mt(n,0,6)})}lt(n,"throw")}if((o?e.phase>=1:l&&Mt(n)<.5)&&n.enemies.length<so)for(let c=0;c<2;c++)n.spawns.push({x:Bn(e.x+mt(n,-3,3),-Pe+1,Pe-1),y:Bn(e.y+mt(n,-3,3),-nt+1,nt-1),type:Mt(n)<.5?"jia":"yi",t:50});e.mode="walk",e.cd=o?l?55:75:l?85:115}break}case"mao":case"maoqiu":a(),e.type==="mao"&&e.t%300===0&&Mt(n)<.4&&Jt(n,e.x,e.y,xt(n,Ln.mao),"shout");break;default:a()}}function hM(n){let e=n.hero,t=e.s;for(let i of n.bullets){if(i.x+=i.vx,i.y+=i.vy,--i.life<=0||Math.abs(i.x)>Pe||Math.abs(i.y)>nt){i.dead=!0,n.missStreak++;continue}for(let s of n.enemies){if(s.dead||i.hit.has(s.id)||Math.hypot(s.x-i.x,s.y-i.y)>s.r+.15)continue;i.hit.add(s.id),n.hitsTotal++,n.missStreak>=4&&e.sayT<=0&&Ot(n,xt(n,Nt.hit),100),n.missStreak=0;let r=Math.hypot(i.vx,i.vy);if(di(n,s,t.dmg,{canCrit:!0,kx:i.vx/r*.06,ky:i.vy/r*.06}),An(n,i.x,i.y,"spark",4),i.pierce--<=0){i.dead=!0;break}}}n.bullets=n.bullets.filter(i=>!i.dead);for(let i of n.ebullets){if(i.x+=i.vx,i.y+=i.vy,--i.life<=0||Math.abs(i.x)>Pe+1||Math.abs(i.y)>nt+1){i.dead=!0;continue}Math.hypot(e.x-i.x,e.y-i.y)<e.r+i.r&&(i.dead=!0,Du(n,i.dmg,i.x,i.y)&&i.kind==="hongbao"&&Jt(n,e.x,e.y,"\u5F69\u793C -38.8W","shout"))}n.ebullets=n.ebullets.filter(i=>!i.dead)}function uM(n){let e=n.hero;for(let t of n.zones){if(t.follow){let i=n.enemies.find(s=>s.id===t.follow);i&&(t.x=i.x,t.y=i.y)}if(!(--t.t>0)){if(t.done=!0,t.kind==="flash"){st(n,"ring",{x:t.x,y:t.y,r:t.r,kind:"flash"}),lt(n,"flash"),Math.hypot(e.x-t.x,e.y-t.y)<t.r&&(st(n,"flashbang",{}),e.sayT<=0&&Ot(n,xt(n,Nt.flash),110));continue}st(n,"ring",{x:t.x,y:t.y,r:t.r,kind:t.kind}),An(n,t.x,t.y,t.kind==="ping"?"ping":"dust",14),lt(n,t.kind==="ping"?"pingland":"slam"),t.kind!=="ping"&&st(n,"shake",{amt:.25}),Math.hypot(e.x-t.x,e.y-t.y)<t.r+e.r*.5&&Du(n,t.dmg,t.x,t.y)}}n.zones=n.zones.filter(t=>!t.done)}function dM(n){let e=n.hero,t=e.s.pickup;for(let i of n.gems){let s=e.x-i.x,r=e.y-i.y,a=Math.hypot(s,r);a<t&&(i.mag=!0),i.mag&&(i.vx+=s/(a||1)*.03,i.vy+=r/(a||1)*.03,i.vx*=.9,i.vy*=.9,i.x+=i.vx,i.y+=i.vy,a<.45&&(i.got=!0,Pu(n,i.v),lt(n,"gem")))}n.gems=n.gems.filter(i=>!i.got)}function fM(n){let e=n.hero,t=Object.keys(Nc[n.wave]).filter(l=>l!=="maoqiu"),i=t[Math.floor(Mt(n)*t.length)],s=xt(n,Object.keys(Iu)),r,a,o=0;do r=mt(n,-Pe+2,Pe-2),a=mt(n,-nt+2,nt-2);while(Math.hypot(r-e.x,a-e.y)<6&&++o<20);n.spawns.push({x:r,y:a,type:i,t:80,elite:s})}function Np(n,e,t,i){return{id:n.uid++,kind:e,x:Bn(t,-Pe+1,Pe-1),y:Bn(i,-nt+1,nt-1),t:e==="chest"?20*wi:14*wi,born:n.t}}function pM(n){let e=Object.entries(io).filter(([,s])=>s.w>0),t=e.reduce((s,[,r])=>s+r.w,0),i=Mt(n)*t;for(let[s,r]of e)if((i-=r.w)<0)return s;return"douzhi"}function mM(n){let e=n.hero;if(--n.pickT<=0){n.pickT=mt(n,540,780);let t=mt(n,0,Math.PI*2),i=mt(n,3,7);n.pickups.push(Np(n,pM(n),e.x+Math.cos(t)*i,e.y+Math.sin(t)*i)),lt(n,"pickupSpawn")}for(let t of n.pickups){if(--t.t<=0){t.gone=!0;continue}Math.hypot(t.x-e.x,t.y-e.y)<1&&(t.gone=!0,Fp(n,t))}if(n.pickups=n.pickups.filter(t=>!t.gone),n.stampede){let t=n.stampede;t.x+=t.dir*.36;for(let i of t.bulls)for(let s of n.enemies)t.hit.has(s.id)||Math.abs(s.y-(t.y+i))>1+s.r||Math.abs(s.x-t.x)>1+s.r||(t.hit.add(s.id),di(n,s,t.dmg,{kx:t.dir*.5,ky:0,sfx:!1}));Math.abs(t.x)>Pe+4&&(n.stampede=null)}}function Ep(n,e,t){let i=n.hero,s=n.enemies.slice().sort((r,a)=>ki(r,i)-ki(a,i)).slice(0,e);for(let r=0;r<e;r++){let a=s[r],o=a?{x:a.x,y:a.y}:{x:i.x+mt(n,-6,6),y:i.y+mt(n,-5,5)};Object.assign(o,{t:20+r*5,r:1.8,dmg:t}),n.meteors.push(o),st(n,"meteor",{x:o.x,y:o.y,t:o.t})}}function Tp(n,e,t){let i=n.hero,s=i.x>0?-1:1,r=e===3?[-1.4,0,1.4]:[-2.8,-1.4,0,1.4,2.8];n.stampede={x:-s*(Pe+3),y:i.y,dir:s,bulls:r,hit:new Set,dmg:t},st(n,"stampede",{}),lt(n,"moo"),lt(n,"gallop")}function Fp(n,e){let t=n.hero,i=t.s,s=i.dmg/5,r=io[e.kind],a=r.name;switch(e.kind){case"horse":Oc(n,"horse",360);break;case"bike":Oc(n,"bike",360);break;case"bull":Tp(n,3,30*s);break;case"meteor":Ep(n,8,25*s);break;case"chief":t.bless=480,An(n,t.x,t.y,"gold",40);break;case"spider":t.ult=Math.min(100,t.ult+50);break;case"douzhi":i.hp=Math.min(i.maxhp,i.hp+i.maxhp*.4);break;case"magnet":for(let o of n.gems)o.mag=!0;break;case"chest":{n.score+=500;let o=Math.floor(Mt(n)*4);o===0?(Ep(n,16,30*s),a="\u5927\u7EA2\u5B9D\u7BB1 \xB7 \u6D41\u661F\u96E8"):o===1?(Tp(n,5,40*s),a="\u5927\u7EA2\u5B9D\u7BB1 \xB7 \u767D\u725B\u7FA4"):o===2?(i.hp=i.maxhp,t.shields=Math.max(t.shields,1)+1,a="\u5927\u7EA2\u5B9D\u7BB1 \xB7 \u6EE1\u8840\u52A0\u62A4\u76FE"):(t.ult=100,a="\u5927\u7EA2\u5B9D\u7BB1 \xB7 \u8D85\u7EA7\u8718\u86DB\u5145\u6EE1"),An(n,e.x,e.y,"gold",50);break}}e.kind!=="horse"&&e.kind!=="bike"&&Ot(n,e.kind==="chest"?xt(n,Nt.chest):r.line,130),st(n,"pickup",{kind:e.kind,x:e.x,y:e.y,text:a}),lt(n,e.kind==="chest"?"chest":"pickup"),An(n,e.x,e.y,"sugar",18)}function gM(n,e){let t=n.hero,i=t.s;e.kind==="douzhi"?i.hp=Math.min(i.maxhp,i.hp+i.maxhp*.4):e.kind==="spider"?t.ult=Math.min(100,t.ult+50):e.kind==="magnet"||n.wave>=14?(Pu(n,2),n.score+=75):n.pendingSupplies.push(e.kind)}function xM(n){let e=n.hero,t=e.s;if(n.wave>=7&&n.wave<=9&&--n.tideT<=0){n.tideT=mt(n,720,900);let i=Mt(n)<.5?1:-1;n.tides.push({id:n.uid++,x:-i*(Pe+2),dir:i,warn:90,friendly:!1,hit:new Set}),st(n,"tideWarn",{dir:i}),n.tideSaid||(n.tideSaid=!0,Ot(n,xt(n,Nt.tide),160))}if(t.tide&&++e.timers.tide>=Math.max(480,720-90*(t.tide-1))){e.timers.tide=0;let i=e.x>0?-1:1;n.tides.push({id:n.uid++,x:-i*(Pe+2),dir:i,warn:0,friendly:!0,hit:new Set,dmg:15*t.tide*(t.dmg/5)}),lt(n,"tide")}for(let i of n.tides){if(i.warn>0){--i.warn===0&&lt(n,"tide");continue}i.x+=i.dir*.3;let s=r=>Math.abs(r.x-i.x)<1.4;!i.friendly&&s(e)&&(e.vx+=i.dir*.04,e.x=Bn(e.x+i.dir*.12,-Pe+e.r,Pe-e.r));for(let r of n.enemies)s(r)&&(r.kx+=i.dir*(i.friendly?.06:.03),i.friendly&&!i.hit.has(r.id)&&(i.hit.add(r.id),di(n,r,i.dmg,{sfx:!1})));Math.abs(i.x)>Pe+3&&Math.sign(i.x)===i.dir&&(i.done=!0)}n.tides=n.tides.filter(i=>!i.done)}function Oc(n,e,t){let i=n.hero;i.ride=t,i.mount=e,Ot(n,xt(n,e==="bike"?Nt.bike:Nt.horse),130),st(n,"horse",{kind:e}),lt(n,e==="bike"?"bell":"gallop")}function Op(n,e=!1){let t=n[0].index!==null,i=new Set(Object.keys(n[0].attributes)),s=new Set(Object.keys(n[0].morphAttributes)),r={},a={},o=n[0].morphTargetsRelative,l=new Et,c=0;for(let h=0;h<n.length;++h){let u=n[h],d=0;if(t!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let f in u.attributes){if(!i.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;r[f]===void 0&&(r[f]=[]),r[f].push(u.attributes[f]),d++}if(d!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(o!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let f in u.morphAttributes){if(!s.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;a[f]===void 0&&(a[f]=[]),a[f].push(u.morphAttributes[f])}if(e){let f;if(t)f=u.index.count;else if(u.attributes.position!==void 0)f=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,f,h),c+=f}}if(t){let h=0,u=[];for(let d=0;d<n.length;++d){let f=n[d].index;for(let m=0;m<f.count;++m)u.push(f.getX(m)+h);h+=n[d].attributes.position.count}l.setIndex(u)}for(let h in r){let u=Bp(r[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(let h in a){let u=a[h][0].length;if(u!==0){l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let d=0;d<u;++d){let f=[];for(let v=0;v<a[h].length;++v)f.push(a[h][v][d]);let m=Bp(f);if(!m)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(m)}}}return l}function Bp(n){let e,t,i,s=-1,r=0;for(let c=0;c<n.length;++c){let h=n[c];if(e===void 0&&(e=h.array.constructor),e!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=h.itemSize),t!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=h.normalized),i!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=h.gpuType),s!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*t}let a=new e(r),o=new Ht(a,t,i),l=0;for(let c=0;c<n.length;++c){let h=n[c];if(h.isInterleavedBufferAttribute){let u=l/t;for(let d=0,f=h.count;d<f;d++)for(let m=0;m<t;m++){let v=h.getComponent(d,m);o.setComponent(d+u,m,v)}}else a.set(h.array,l);l+=h.count*t}return s!==void 0&&(o.gpuType=s),o}var yM=(()=>{let n=new Uint8Array([70,70,70,255,150,150,150,255,215,215,215,255,255,255,255,255]),e=new ws(n,4,1,Fn);return e.minFilter=e.magFilter=en,e.needsUpdate=!0,e})(),Hi=new Map,ro={color:{value:new Fe("#fff0d8")},k:{value:.4}};function _M(n){return n.onBeforeCompile=e=>{e.uniforms.uRim=ro.color,e.uniforms.uRimK=ro.k,e.fragmentShader=`uniform vec3 uRim; uniform float uRimK;
`+e.fragmentShader.replace("#include <opaque_fragment>",`float rimF = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 3.0);
outgoingLight += uRim * rimF * uRimK;
#include <opaque_fragment>`)},n.customProgramCacheKey=()=>"rim-toon",n}function U(n,e={}){let t=n+JSON.stringify(e);return Hi.has(t)||Hi.set(t,_M(new wa({color:n,gradientMap:yM,...e}))),Hi.get(t)}function wt(n,e=2){let t="glow"+n+e;return Hi.has(t)||Hi.set(t,new Vn({color:n,emissive:n,emissiveIntensity:e,roughness:.4})),Hi.get(t)}function fi(n,e={}){let t="gl"+n+JSON.stringify(e);return Hi.has(t)||Hi.set(t,new yr({color:n,roughness:.18,clearcoat:1,clearcoatRoughness:.1,...e})),Hi.get(t)}var Uu=new It({color:"#1d1a24",side:un});function O(n,e,t=0,i=0,s=0){let r=new pe(n,e);return r.position.set(t,i,s),r.castShadow=!0,r}var je=(n,e=18)=>new ft(n,e,Math.max(8,e*.7|0));function gs(n,e=.045){let t=[];n.traverse(i=>{i.isMesh&&!i.userData.noInk&&i.material!==Uu&&t.push(i)});for(let i of t){i.geometry.computeBoundingSphere();let s=i.geometry.boundingSphere.radius*Math.max(i.scale.x,i.scale.y,i.scale.z);if(s<.06)continue;let r=new pe(i.geometry,Uu);r.scale.setScalar(1+e/Math.max(s,.12)),r.userData.noInk=!0,i.add(r)}return n}var Nu=new It({color:"#ffffff"});function ei(n,e,t,i,s=.075,r=1){let a=[];for(let o of[-1,1]){let l=O(je(s,16),U("#ffffff"),e,t,i*o),c=O(je(s*.62,14),U("#1d1a24"),s*.52*r,0,0),h=O(je(s*.24,8),Nu,s*.88,s*.32,-s*.15),u=O(je(s*.11,6),Nu,s*.9,-s*.22,s*.12);c.userData.noInk=h.userData.noInk=u.userData.noInk=!0,l.add(c,h,u),n.add(l),a.push(l)}return a}function kp(){let n=new ye,e=new ye;n.add(e);let t="#3f8f45",i="#79c46c",s="#9edb84",r="#f2dc96",a="#ff6fae",o=O(new ft(.56,28,14,0,Math.PI*2,0,Math.PI/2),U(t));o.scale.set(1,.78,.9),o.position.y=.24,e.add(o);let l=new Ue(.15,.16,.05,6),c=new D(0,1,0),h=[[0,0]];for(let E=0;E<6;E++)h.push([.62,E*Math.PI/3]);for(let E=0;E<10;E++)h.push([1.12,E*Math.PI/5+.3]);for(let[E,C]of h){let P=new D(Math.sin(E)*Math.cos(C),Math.cos(E),Math.sin(E)*Math.sin(C)),B=O(l,U(E>1?"#5aa752":i));B.position.set(P.x*.56,P.y*.56*.78+.24,P.z*.56*.9),B.quaternion.setFromUnitVectors(c,new D(P.x,P.y/.78,P.z/.9).normalize()),B.scale.setScalar(E>1?.75:1),B.userData.noInk=!0,e.add(B)}let u=O(new Tt(.53,.07,10,40),U(r),0,.24,0);u.rotation.x=Math.PI/2,u.scale.set(1,.9,1),e.add(u);let d=O(new Ue(.5,.44,.14,32),U(r),0,.17,0);d.scale.z=.9,e.add(d);let f=new ye;f.position.set(.6,.42,0),e.add(f),f.add(O(new Ue(.11,.13,.26,12).rotateZ(Math.PI/2.6),U(s),-.12,-.08,0));let m=O(je(.27,22),U(s));m.scale.set(1.05,.95,1),f.add(m);let v=ei(f,.17,.07,.12,.09);for(let[E,C]of v.entries()){let P=E?1:-1;for(let B=0;B<3;B++){let z=O(new Ze(.012,.055,.012),U("#1d1a24"),.03,.09,(B-1)*.03*P+.02*P);z.rotation.x=(B-1)*.35*P,z.rotation.z=-.35,z.userData.noInk=!0,C.add(z)}}for(let E of[-1,1])for(let C=0;C<3;C++){let P=O(je(.012,6),U("#5aa752"),.05+C*.035,.16-C*.02,.17*E);P.userData.noInk=!0,f.add(P)}for(let E of[-1,1]){let C=O(je(.055,10),U("#ff9fbf"),.16,-.06,.19*E);C.scale.set(.5,.6,1),C.userData.noInk=!0,f.add(C)}let x=O(new Tt(.06,.014,6,12,Math.PI),U("#2d5a27"),.255,-.06,0);x.rotation.set(0,Math.PI/2,Math.PI),x.userData.noInk=!0,f.add(x);let p=O(new Tt(.3,.035,8,26,Math.PI).rotateY(Math.PI/2),U(a),-.02,.02,0);f.add(p);for(let E of[-1,1]){let C=O(new Ue(.1,.1,.07,18).rotateX(Math.PI/2),U(a),-.02,0,.29*E);C.add(O(new Ue(.06,.06,.02,14).rotateX(Math.PI/2),wt("#ffd1e8",1.4),0,0,.045*E)),f.add(C)}let S=O(new Ue(.014,.014,.34,6).rotateZ(Math.PI/2.3),U("#2a2a33"),.12,-.12,.27);S.rotation.y=.35,S.userData.noInk=!0,f.add(S),f.add(O(je(.035,8),U("#2a2a33"),.27,-.2,.22));let A=new ye;A.position.set(-.12,.7,0);for(let E of[-1,1]){let C=O(new $t(.11,.2,4).rotateX(E*Math.PI/2),U(a),0,0,.1*E);C.scale.y=.6,A.add(C)}A.add(O(je(.06,10),U("#ff4f99"))),e.add(A);let g=[];for(let[E,C]of[[.3,.33],[.3,-.33],[-.28,.33],[-.28,-.33]]){let P=new ye;P.position.set(E,.2,C),P.add(O(new vt(.1,.1,4,10),U(s),0,-.08,0));for(let B=-1;B<=1;B++){let z=O(je(.025,6),U("#ff8fbf"),.09,-.19,B*.045);z.userData.noInk=!0,P.add(z)}e.add(P),g.push(P)}e.add(O(new $t(.07,.22,8).rotateZ(Math.PI/2),U(s),-.62,.18,0));let M=new ye;M.position.set(0,.42,0);let b=new ye;b.position.set(0,0,.52),b.add(O(new Ze(.46,.13,.12),U("#2c2c38"),.12,0,0)),b.add(O(new Ze(.12,.18,.08),U("#2c2c38"),-.02,-.1,0)),b.add(O(new Ue(.035,.035,.14,8).rotateZ(Math.PI/2),U("#55556a"),.41,.02,0));let I=O(new Ze(.12,.06,.125),U(a),.14,.02,0);I.userData.noInk=!0,b.add(I);let y=O(je(.12,10),new It({color:"#fff3a8",transparent:!0,opacity:0}),.55,.02,0);return y.userData.noInk=!0,y.userData.noBake=!0,y.castShadow=!1,b.add(y),M.add(b),e.add(M),gs(n),n.userData={body:e,head:f,legs:g,gun:M,barrel:b,flash:y,bow:A,eyes:v},n}function kc({shirt:n,pants:e="#2b2d3a",skin:t="#f3c79a",hair:i="#2a1e18",h:s=1,headless:r=!1}={}){let a=new ye,o=new ye;a.add(o);let l=[];for(let f of[-1,1]){let m=new ye;m.position.set(0,.5*s,.12*f),m.add(O(new vt(.08,.32*s,4,8),U(e),0,-.24*s,0)),o.add(m),l.push(m)}let c=O(new vt(.2,.3*s,6,14),U(n),0,.82*s,0);c.scale.z=.85,o.add(c);let h=[];for(let f of[-1,1]){let m=new ye;m.position.set(0,.98*s,.27*f),m.add(O(new vt(.065,.3*s,4,8),U(n),0,-.18*s,0)),o.add(m),h.push(m)}let u=new ye;if(u.position.y=1.3*s,o.add(u),a.userData={body:o,legs:l,arms:h,head:u},r)return a;u.add(O(je(.22,18),U(t)));let d=O(new ft(.235,18,10,0,Math.PI*2,0,Math.PI/2),U(i),-.02,.02,0);return u.add(d),ei(u,.17,.02,.08,.05),o.add(u),a.userData={body:o,legs:l,arms:h,head:u},a}function Fu(){let n=kc({shirt:"#3a7bd5",pants:"#2b2d3a",hair:"#1c1c22"}),{head:e,body:t}=n.userData;t.add(O(new ft(.2,14,8,0,Math.PI*2,0,Math.PI/2).rotateZ(Math.PI/2),U("#2f63b0"),-.2,1.12,0)),e.add(O(new Tt(.25,.03,6,20,Math.PI).rotateY(Math.PI/2),U("#3ad17a"),0,.02,0));for(let s of[-1,1]){e.add(O(new Ue(.08,.08,.06,14).rotateX(Math.PI/2),U("#3ad17a"),0,0,.24*s));let r=O(new Tt(.06,.014,6,16).rotateY(Math.PI/2),U("#1d1a24"),.22,.02,.085*s);r.userData.noInk=!0,e.add(r)}let i=O(new Ze(.5,.04,.18),U("#2a2a33"),.05,.8,.34);return i.rotation.x=.5,i.add(O(new Ze(.44,.02,.12),wt("#7fe3ff",.8),0,.03,0)),t.add(i),gs(n,.035),n}function Lu(n,e,t="#fff"){let i=document.createElement("canvas");i.width=256,i.height=128;let s=i.getContext("2d");s.fillStyle=e,s.fillRect(0,0,256,128),s.strokeStyle="rgba(0,0,0,.35)",s.lineWidth=10,s.strokeRect(5,5,246,118),s.fillStyle=t,s.font='bold 76px "PingFang SC","Microsoft YaHei",sans-serif',s.textAlign="center",s.textBaseline="middle",s.fillText(n,128,70);let r=new Fi(i);r.colorSpace=hn;let a=new ye,o=O(new Ze(.62,.32,.04),[U("#8a5a2b"),U("#8a5a2b"),U("#8a5a2b"),U("#8a5a2b"),new It({map:r}),new It({map:r})]);return o.position.y=.32,o.userData.noInk=!0,a.add(o,O(new Ue(.02,.02,.4,6),U("#8a5a2b"),0,.05,0)),a}function Hp(n){let e=new ye,t=new ye;e.add(t);let i={body:t};switch(n){case"durian":{let r=O(new Gn(.42,1),U("#c9d44c",{flatShading:!0}),0,.48,0);t.add(r);let a=new Gn(.42,1).getAttribute("position"),o=new Set,l=new $t(.07,.2,5),c=new D(0,1,0);for(let h=0;h<a.count;h++){let u=new D().fromBufferAttribute(a,h),d=u.toArray().map(v=>v.toFixed(2)).join();if(o.has(d))continue;o.add(d);let f=O(l,U("#8d9a2e")),m=u.clone().normalize();f.position.copy(m.multiplyScalar(.46)).add(new D(0,.48,0)),f.quaternion.setFromUnitVectors(c,u.clone().normalize()),f.userData.noInk=!0,t.add(f)}ei(t,.36,.56,.13,.08);for(let h of[-1,1])t.add(O(new vt(.07,.06,4,8),U("#6d5a2e"),0,.08,.18*h));break}case"oyster":{let r="#8d8aa0",a="#b7a9c9",o=O(new ft(.62,24,10,0,Math.PI*2,Math.PI/2,Math.PI/2),U(r),0,.34,0);o.scale.set(1,.45,.85),t.add(o);for(let f=0;f<16;f++){let m=f/16*Math.PI*2,v=O(je(.1,8),U(a),Math.cos(m)*.6,.33,Math.sin(m)*.5);v.scale.y=.5,v.userData.noInk=!0,t.add(v)}let l=O(je(.22,20),fi("#fff7f2",{emissive:"#ffd9ec",emissiveIntensity:.9}),.12,.4,0);t.add(l);let c=new ye;c.position.set(-.5,.34,0);let h=O(new ft(.62,24,10,0,Math.PI*2,0,Math.PI/2),U("#a6a3b8"),.5,0,0);h.scale.set(1,.42,.85),c.add(h);for(let f=-2;f<=2;f++){let m=O(new Tt(.44-Math.abs(f)*.05,.025,4,20,Math.PI),U("#76738a"),.5,.06,f*.13);m.rotation.y=Math.PI/2,m.userData.noInk=!0,c.add(m)}ei(c,.85,.24,.15,.08);let u=O(new Tt(.1,.015,6,18).rotateY(Math.PI/2),wt("#ffd35a",.6),.93,.24,.15);u.userData.noInk=!0,c.add(u);for(let f of[-1,1]){let m=O(new vt(.035,.16,4,6).rotateX(Math.PI/2),U("#3a2a20"),.98,.1,.1*f);m.rotation.y=f*.5,c.add(m)}let d=new ye;d.position.set(.45,.3,0),d.add(O(new Ue(.3,.3,.04,20),U("#1d1a24"))),d.add(O(new ft(.2,16,8,0,Math.PI*2,0,Math.PI/2),U("#1d1a24"),0,.02,0)),d.add(O(new Ue(.205,.205,.05,20),U("#8a1d2a"),0,.05,0)),c.add(d),t.add(c),i.hinge=c;break}case"orange":{let r=new ye;r.position.y=.42,r.add(O(new Gn(.4,3),U("#ff9a1f")));for(let o=0;o<24;o++){let l=1-o/23*2,c=Math.sqrt(1-l*l),h=o*2.4,u=O(je(.025,6),U("#e9821a"),Math.cos(h)*c*.4,l*.4,Math.sin(h)*c*.4);u.userData.noInk=!0,r.add(u)}t.add(r),t.add(O(new Ue(.025,.03,.1,6),U("#5a3a1a"),0,.86,0));let a=O(je(.12,10),U("#4caf50"),.08,.88,.04);a.scale.set(1,.25,.5),a.rotation.y=.6,t.add(a),ei(t,.34,.5,.13,.08);for(let o of[-1,1]){let l=O(new Ze(.04,.03,.14),U("#1d1a24"),.38,.62,.13*o);l.rotation.x=o*.4,l.userData.noInk=!0,t.add(l)}i.ball=r;break}case"dingding":{let r="#8a4fc7";t.add(O(new vt(.42,.42,8,18),U(r),0,.78,0));let a=new ye;a.position.set(.4,.78,0),a.add(O(new Ze(.06,.32,.38),U("#c9c4d6")));let o=O(new Ze(.02,.24,.3),wt("#bfe6ff",1.6),.03,0,0);o.userData.noInk=!0,a.add(o),t.add(a);let l=new ye;l.position.y=1.5,l.add(O(je(.3,20),U(r)));let c=O(je(.24,18),U("#f4cfae"),.14,-.01,0);c.scale.set(.55,.9,.95),l.add(c),ei(l,.26,.05,.08,.05);let h=O(new Tt(.06,.014,6,12,Math.PI),U("#7a3a2a"),.28,-.08,0);h.rotation.set(0,Math.PI/2,Math.PI),h.userData.noInk=!0,l.add(h);for(let x of[-1,1])l.add(O(je(.07,10),U(r),0,.02,.3*x));l.add(O(new Ue(.025,.025,.22,6),U(r),0,.38,0));let u=O(new Tt(.16,.035,6,3).rotateY(Math.PI/2),U(r),0,.6,0);u.rotation.x=Math.PI/2,l.add(u),t.add(l),i.head=l;let d=[],f=[];for(let x of[-1,1]){let p=new ye;p.position.set(0,.32,.2*x),p.add(O(new vt(.13,.12,4,10),U(r),0,-.14,0)),t.add(p),d.push(p);let S=new ye;S.position.set(0,1,.45*x),S.add(O(new vt(.1,.22,4,10),U(r),0,-.16,0)),t.add(S),f.push(S)}let m=new ye;m.position.set(.05,-.42,0),m.add(O(new Ze(.26,.2,.12),U("#e0242f")));let v=O(new Tt(.08,.015,6,12,Math.PI),U("#e0242f"),0,.1,0);v.userData.noInk=!0,m.add(v),f[1].add(m),i.legs=d,i.arms=f;break}case"goat":case"judge":{let r=n==="judge",a=r?1.9:1;if(r){t.add(O(new $t(.85,1.9,24),U("#1f1d2a"),0,.95,0)),t.add(O(new $t(.22,.5,4),U("#ffffff"),.32,1.52,0));let l=new ye;l.position.set(.1,1.55,.62),l.add(O(new vt(.11,.55,4,8),U("#1f1d2a"),0,-.3,0));let c=new ye;c.position.set(0,-.62,0),c.add(O(new Ue(.04,.04,.7,8).rotateZ(Math.PI/2),U("#7a4a22"),.32,0,0)),c.add(O(new Ue(.13,.13,.36,14),U("#8a5328"),.66,0,0)),l.add(c),t.add(l),i.arm=l}else{let l=O(new vt(.27,.42,6,14).rotateZ(Math.PI/2),U("#f6f3ea"),0,.55,0);t.add(l);for(let h=0;h<7;h++){let u=O(je(.13,10),U("#ffffff"),-.25+h*.09,.78,h%2?.1:-.1);u.userData.noInk=!0,t.add(u)}let c=[];for(let[h,u]of[[.24,.15],[.24,-.15],[-.24,.15],[-.24,-.15]]){let d=new ye;d.position.set(h,.4,u),d.add(O(new Ue(.05,.045,.38,8),U("#3b3530"),0,-.18,0)),t.add(d),c.push(d)}i.legs=c}let o=new ye;o.position.set(r?.15:.42,r?2.15:.82,0),o.scale.setScalar(r?1.55:1),o.add(O(new vt(.14,.16,6,12).rotateZ(Math.PI/2.4),U("#f6f3ea"),.06,-.03,0)),ei(o,.1,.07,.1,.055),o.add(O(new $t(.05,.16,6).rotateX(Math.PI),U("#e8e4d8"),.16,-.2,0));for(let l of[-1,1]){let c=O(new Tt(.1,.035,6,14,Math.PI*1.3),U("#9a7b4f"),-.06,.13,.1*l);c.rotation.set(0,l>0?.2:-.2,.6),o.add(c);let h=O(new vt(.035,.12,4,6).rotateX(l*1.2),U("#ece6d6"),-.04,.05,.17*l);o.add(h)}if(r){let l=new ye;for(let c=0;c<14;c++){let h=c/14*Math.PI*2,u=O(je(.09,10),U("#eeeae2"),-.04+Math.cos(h)*.05,.12+c%2*.03,Math.sin(h)*.19);l.add(u)}for(let c of[-1,1])for(let h=0;h<3;h++)l.add(O(je(.08,10),U("#eeeae2"),-.08,-.05-h*.12,.2*c));o.add(l)}t.add(o),i.head=o,r&&e.scale.setScalar(1);break}case"guo":{let r="#e3cfa3",a="#9cc95a",o=new ye;o.position.y=.62;let l=x=>{let p=O(new ft(.42,22,14,0,Math.PI),U(r,{side:qt}),0,0,0);return p.scale.set(1,1.25,.8),p.rotation.y=x>0?0:Math.PI,p.rotation.x=x*.08,p.userData.noInk=!0,p};for(let x of[-1,1]){let p=O(new Tt(.42,.025,6,30,Math.PI),U("#b89a62"),-.06,0,0);p.scale.set(1,1.25,1),p.rotation.set(Math.PI/2,0,x*.25+Math.PI/2),p.userData.noInk=!0,o.add(p)}let c=l(-1);c.position.x=-.06,c.rotation.z=.25,o.add(c);let h=l(1);h.position.x=-.06,h.rotation.z=-.25,h.rotation.y=Math.PI,o.add(h);let u=O(je(.33,20),U(a),.08,.02,0);u.scale.set(.85,1.15,.9),o.add(u);for(let x=0;x<6;x++){let p=O(je(.08,8),U("#8a4a6a"),.05+x%2*.1,.2-x*.07,(x%3-1)*.15);p.scale.set(.4,1,1),p.userData.noInk=!0,o.add(p)}ei(o,.33,.1,.11,.07);let d=O(new Tt(.1,.02,6,14,Math.PI),U("#2d4a1a"),.35,-.08,0);d.rotation.set(0,Math.PI/2,Math.PI),d.userData.noInk=!0,o.add(d);for(let x of[-1,1]){let p=O(je(.04,8),U("#ff9fbf"),.32,-.02,.17*x);p.scale.set(.4,.6,1),p.userData.noInk=!0,o.add(p)}t.add(o);let f=[],m=[];for(let x of[-1,1]){let p=new ye;p.position.set(0,.2,.14*x),p.add(O(new vt(.05,.14,4,8),U("#c9ac78"),0,-.1,0)),t.add(p),f.push(p);let S=new ye;S.position.set(.05,.7,.4*x),S.add(O(new vt(.045,.2,4,8),U("#c9ac78"),0,-.12,0)),t.add(S),m.push(S)}i.legs=f,i.arms=m;let v=Lu("\uFF1F","#ffb000");v.position.set(-.05,1.45,0),v.rotation.y=-Math.PI/2,v.scale.setScalar(1.3),t.add(v),i.sign=v;break}case"jia":case"yi":{let r={jia:{shirt:"#e0563a",pants:"#2b2d3a",hair:"#1c1c22"},yi:{shirt:"#4f8a6b",pants:"#2b2d3a",hair:"#3a2a20"}}[n],a=kc(r);Object.assign(i,a.userData),i.body=t,t.add(a),a.userData={},t.add(O(new ft(.19,14,8,0,Math.PI*2,0,Math.PI/2).rotateZ(Math.PI/2),U(n==="jia"?"#c8452e":"#3f7458"),-.2,1.12,0)),n==="jia"&&t.add(O(new vt(.06,.42,4,8).rotateX(Math.PI/2),U("#e0563a"),.2,.86,0));let o=Lu({jia:"\u7532\u65B9",yi:"\u4E59\u65B9"}[n],{jia:"#c8102e",yi:"#3a7bd5"}[n]);o.position.set(-.05,1.62,0),o.rotation.y=-Math.PI/2,t.add(o),i.sign=o;break}case"thief":{let r="#6b4226",a="#b08356";t.add(O(new vt(.4,.4,8,16),U(r),0,.82,0));let o=O(je(.3,16),U(a),.22,.75,0);o.scale.set(.5,1,.9),t.add(o);for(let f of[-1,1]){let m=O(new ft(.2,14,8,0,Math.PI*2,0,Math.PI/2),U("#8a8f99"),0,1.12,.36*f);m.rotation.x=f*.5,t.add(m)}t.add(O(new Tt(.4,.05,6,24).rotateX(Math.PI/2),U("#8a1d2a"),0,.62,0));let l=new ye;l.position.set(.08,1.48,0),l.add(O(je(.3,20),U(r)));let c=O(je(.15,14),U(a),.25,-.07,0);c.scale.set(1,.75,1),l.add(c),l.add(O(je(.05,8),U("#111116"),.39,-.03,0)),ei(l,.22,.08,.12,.05);for(let f of[-1,1]){l.add(O(je(.1,12),U(r),-.05,.25,.2*f)),l.add(O(je(.055,8),U(a),-.02,.25,.2*f));for(let m=0;m<2;m++){let v=O(new Ze(.02,.18,.03),wt("#e0242f",.6),.26,.12-m*.05,(.08+m*.05)*f);v.rotation.x=f*.5,v.userData.noInk=!0,l.add(v)}}t.add(l),i.head=l;let h=[],u=[];for(let f of[-1,1]){let m=new ye;m.position.set(0,.4,.2*f),m.add(O(new vt(.13,.16,4,10),U(r),0,-.18,0)),t.add(m),h.push(m);let v=new ye;v.position.set(.05,1.08,.46*f),v.add(O(new vt(.11,.32,4,10),U(r),0,-.22,0));for(let x=-1;x<=1;x++){let p=O(new $t(.03,.16,5).rotateZ(-Math.PI/2),fi("#f6f1e4"),.12,-.45,x*.05);p.userData.noInk=!0,v.add(p)}t.add(v),u.push(v)}i.legs=h,i.arms=u;let d=O(je(.3,14),U("#e0242f"),-.42,1,0);d.scale.set(.8,1,.8),d.add(O(new Ze(.02,.2,.2),wt("#ffd35a",.8),.24,0,0)),t.add(d),i.sack=d;break}case"ginger":{let r=U("#c27a3a"),a=U("#fffaf0"),o=new ye;o.position.y=.05,o.rotation.x=-.25;let l=u=>(u.scale(1,1,.42),u);o.add(O(l(new vt(.22,.22,6,16)),r,0,.55,0)),o.add(O(l(new ft(.22,18,12)),r,0,.98,0));for(let u of[-1,1]){let d=O(l(new vt(.08,.2,4,10)),r,.28*u,.68,0);d.rotation.z=u*1.1,o.add(d);let f=O(l(new vt(.09,.18,4,10)),r,.13*u,.22,0);f.rotation.z=u*.25,o.add(f);let m=O(new Tt(.07,.015,6,12),a,.43*u,.6,.02);m.rotation.y=Math.PI/2,m.userData.noInk=!0,o.add(m)}for(let u=0;u<3;u++){let d=O(je(.035,8),U(["#e0242f","#3ad17a","#3a7bd5"][u]),0,.68-u*.12,.1);d.userData.noInk=!0,o.add(d)}for(let u of[-1,1]){let d=O(je(.035,8),a,.07*u,1.02,.09);d.userData.noInk=!0,o.add(d)}let c=O(new Tt(.07,.014,6,12,Math.PI),a,0,.94,.09);c.rotation.z=Math.PI,c.userData.noInk=!0,o.add(c);let h=O(new Tt(.2,.012,4,30),a,0,.98,.07);h.userData.noInk=!0,o.add(h),t.add(o),i.man=o;break}case"caesar":{let r=kc({shirt:"#b3261e",pants:"#b3261e",hair:"#3a2a20"});Object.assign(i,r.userData),i.body=t,t.add(r);let a=r.userData.head;r.userData={};let o=O(new Ue(.24,.3,.62,16,1,!0),U("#f4f0e6",{side:qt}),0,.72,0);o.rotation.z=.12,t.add(o);let l=O(new Tt(.24,.05,6,20),U("#f4f0e6"),0,.92,0);l.rotation.set(Math.PI/2,.6,0),t.add(l);let c=O(new mn(.62,.95,4,6),U("#8a1d2a",{side:qt}),-.24,.62,0);c.rotation.y=Math.PI/2,c.rotation.x=.1,t.add(c);let h=new ye;h.position.y=.1;for(let f=0;f<12;f++){let m=f/12*Math.PI*1.7-Math.PI*.85,v=O(je(.06,8),wt("#d8b04a",.3),Math.cos(m)*.22,.02,Math.sin(m)*.22);v.scale.set(1,.4,.6),v.userData.noInk=!0,h.add(v)}a.add(h);let u=O(new Ue(.3,.3,.06,20).rotateX(Math.PI/2),U("#b3261e"),.1,.8,.42);u.add(O(je(.07,10),wt("#e8b84a",.5),0,0,.05)),u.add(O(new Tt(.29,.02,6,24),U("#e8b84a"),0,0,.03)),t.add(u);let d=new ye;d.position.set(.1,1,-.36),d.add(O(new Ue(.02,.02,1.3,6).rotateZ(Math.PI/2.2),U("#7a4a22"))),d.add(O(new $t(.05,.2,6).rotateZ(-Math.PI/2+.1),U("#c9ced6"),.66,.12,0)),t.add(d),i.spear=d;break}case"chenwei":{let r=kc({shirt:"#2b3448",pants:"#232a38",hair:"#1c1c22"});Object.assign(i,r.userData),i.body=t,t.add(r);let a=r.userData.head;r.userData={},a.add(O(new ft(.25,18,10,0,Math.PI*2,0,Math.PI/2),U("#3a4232"),-.01,.03,0)),a.add(O(new Ue(.26,.26,.04,18),U("#3a4232"),0,.03,0));for(let u of[-1,1])a.add(O(new Ue(.05,.05,.05,12).rotateZ(Math.PI/2),fi("#3ad1ff",{emissive:"#0a5a7a",emissiveIntensity:.6}),.2,.08,.07*u));a.add(O(new Ze(.06,.12,.3),U("#1d1d24"),.18,-.08,0));let o=O(new Ze(.36,.4,.42),U("#4a5a3a"),.02,.84,0);t.add(o);for(let u=0;u<3;u++)t.add(O(new Ze(.06,.1,.08),U("#3a4a2a"),.22,.78,(u-1)*.12));let l=Lu("CT","#3a7bd5");l.scale.setScalar(.35),l.position.set(-.2,.86,0),l.rotation.y=-Math.PI/2,t.add(l);let c=new ye;c.position.set(.32,.98,.14),c.add(O(new Ze(.55,.09,.07),U("#22252b"))),c.add(O(new Ue(.022,.022,.32,8).rotateZ(Math.PI/2),U("#22252b"),.42,.02,0)),c.add(O(new Ze(.06,.16,.05),U("#22252b"),.08,-.11,0)),c.add(O(new Ze(.16,.12,.06),U("#3a3d44"),-.3,-.03,0));let h=O(je(.025,6),wt("#ff2a2a",3),.6,.06,0);h.userData.noInk=!0,c.add(h),t.add(c),i.rifle=c;break}case"mao":case"maoqiu":case"bigmao":{let r=n==="maoqiu"?.32:.8,a=new ye;a.position.y=r*.95,a.add(O(je(r*.86,20),U("#c79a6b")));let o=n==="maoqiu"?14:46,l=je(r*.3,10);for(let f=0;f<o;f++){let m=1-f/(o-1)*2,v=Math.sqrt(1-m*m),x=f*2.399,p=O(l,U(f%3?"#d7ad7e":"#b8875a"),Math.cos(x)*v*r*.86,m*r*.86,Math.sin(x)*v*r*.86);p.userData.noInk=!0,a.add(p)}ei(a,r*.8,r*.18,r*.3,r*.2);let c=new ye;c.position.set(r*.98,r*.2,0);let h=fi("#15131c",{emissive:"#2a1a3a",emissiveIntensity:.3});for(let f of[-1,1]){let m=O(new Ue(r*.26,r*.24,r*.06,20).rotateZ(Math.PI/2),h,0,0,r*.3*f);m.scale.set(1,.82,1.15);let v=O(new Ze(r*.02,r*.06,r*.16),Nu,r*.035,r*.07,-r*.05);v.rotation.x=.6,v.userData.noInk=!0,m.add(v),c.add(m);let x=O(new Ze(r*.5,r*.04,r*.04),U("#e8b84a"),-r*.25,r*.06,r*.52*f);x.rotation.y=f*.35,x.userData.noInk=!0,c.add(x)}let u=O(new Ze(r*.04,r*.04,r*.16),U("#e8b84a"),r*.02,r*.06,0);u.userData.noInk=!0,c.add(u),a.add(c);let d=O(new Tt(r*.12,r*.03,6,12,Math.PI),U("#4a2a14"),r*.92,-r*.18,0);if(d.rotation.set(0,Math.PI/2,Math.PI),d.userData.noInk=!0,a.add(d),n==="bigmao"){let f=new ye;f.position.set(0,r*.95,0),f.add(O(new Ue(.32,.36,.22,10,1,!0),wt("#ffcf3a",.6)));for(let m=0;m<5;m++){let v=m/5*Math.PI*2;f.add(O(new $t(.07,.2,4),wt("#ffcf3a",.6),Math.cos(v)*.32,.18,Math.sin(v)*.32))}a.add(f)}t.add(a),i.fluff=a,n==="bigmao"&&e.scale.setScalar(2);break}}gs(e,n==="judge"?.05:.04);let s=new pe(new Gn(n==="judge"?1.5:n==="bigmao"?.9:.6,1),new It({color:"#ffffff",wireframe:!0,transparent:!0,opacity:.75}));return s.position.y=n==="judge"?1.3:.5,s.visible=!1,s.userData.noBake=s.userData.noInk=!0,s.castShadow=!1,e.add(s),i.cocoon=s,e.userData=i,e}function Bu(){let n=new ye,e=new ye;n.add(e);let t="#fbfaf6";e.add(O(new vt(.36,.7,6,16).rotateZ(Math.PI/2),U(t),0,.7,0));let i=O(je(.3,14),U(t),.25,.95,0);i.scale.set(1,.6,.9),e.add(i);let s=new ye;s.position.set(.75,.82,0),s.add(O(new Ze(.42,.36,.38),U(t))),s.add(O(new Ze(.16,.24,.32),U("#ffb3c7"),.24,-.06,0));for(let l of[-1,1]){s.add(O(je(.03,6),U("#1d1a24"),.32,-.02,.07*l));let c=O(new $t(.06,.32,8),fi("#f3e3b8"),-.05,.22,.24*l);c.rotation.x=l*-.9,c.rotation.z=-.3,s.add(c)}ei(s,.18,.08,.13,.05),e.add(s);let r=[];for(let[l,c]of[[.45,.22],[.45,-.22],[-.45,.22],[-.45,-.22]]){let h=new ye;h.position.set(l,.5,c),h.add(O(new Ue(.09,.08,.5,10),U(t),0,-.25,0)),h.add(O(new Ue(.09,.09,.07,10),U("#3b3530"),0,-.5,0)),e.add(h),r.push(h)}let a=O(new Ue(.02,.02,.5,6),U(t),-.75,.75,0);a.rotation.z=.6,e.add(a);let o=O(new Tt(.24,.06,8,20),U("#e8322b"),.55,.75,0);return o.rotation.y=Math.PI/2,e.add(o),gs(n,.04),n.userData={body:e,legs:r,head:s},n}function Ou(){let n=new ye,e=new ye;n.add(e);let t="#8b5a2b",i="#3a2414";e.add(O(new vt(.32,.8,6,16).rotateZ(Math.PI/2),U(t),0,.85,0));let s=O(new vt(.16,.42,4,10),U(t),.55,1.15,0);s.rotation.z=-.7,e.add(s);let r=new ye;r.position.set(.82,1.38,0),r.add(O(new vt(.13,.3,4,10).rotateZ(Math.PI/2.4),U(t))),r.add(O(je(.1,10),U("#c79a6b"),.2,-.08,0)),ei(r,.02,.06,.1,.04);for(let c of[-1,1])r.add(O(new $t(.04,.12,6),U(t),-.1,.17,.06*c));e.add(r);for(let c=0;c<6;c++){let h=O(je(.08,8),U(i),.62-c*.07,1.42-c*.07,0);e.add(h)}let a=O(new vt(.06,.4,4,6),U(i),-.78,.8,0);a.rotation.z=.5,e.add(a);let o=O(new Ze(.5,.08,.56),U("#c8102e"),-.05,1.18,0);o.add(O(new Ze(.52,.03,.58),U("#e8b84a"),0,-.04,0)),e.add(o);let l=[];for(let[c,h]of[[.45,.17],[.45,-.17],[-.45,.17],[-.45,-.17]]){let u=new ye;u.position.set(c,.7,h),u.add(O(new Ue(.07,.06,.62,8),U(t),0,-.31,0)),u.add(O(new Ue(.075,.08,.08,8),U(i),0,-.64,0)),e.add(u),l.push(u)}return gs(n,.035),n.userData={body:e,legs:l,head:r},n}function ku(){let n=new ye,e=new ye;n.add(e);let t=U("#2fb59a"),i=U("#1d1a24"),s=fi("#d8dde6"),r=[];for(let c of[.85,-.85]){let h=new ye;h.position.set(c,.36,0),h.add(O(new Tt(.33,.035,8,28),i)),h.add(O(new Tt(.29,.012,4,24),s));for(let u=0;u<8;u++){let d=O(new Ue(.006,.006,.58,3),s);d.rotation.z=u/8*Math.PI,d.userData.noInk=!0,h.add(d)}h.add(O(new Ue(.04,.04,.08,10).rotateX(Math.PI/2),s)),e.add(h),r.push(h)}let a=(c,h,u=.03,d=t)=>{let f=new D(...c),m=new D(...h),v=O(new Ue(u,u,f.distanceTo(m),8),d);v.position.copy(f).lerp(m,.5),v.quaternion.setFromUnitVectors(new D(0,1,0),m.clone().sub(f).normalize()),e.add(v)};a([.85,.36,0],[.7,.95,0]),a([.7,.85,0],[-.75,.8,0]),a([.4,.42,0],[-.85,.36,0]),a([.4,.42,0],[.35,.75,0]),a([-.45,.42,0],[-.45,.8,0]),a([.4,.42,0],[-.45,.42,0]),a([.7,.95,-.2],[.7,.95,.2],.022,s);for(let c of[.32,-.48]){let h=O(new Ze(.24,.06,.16),U("#3a2a20"),c,.82,0);e.add(h)}e.add(O(new Ze(.3,.04,.22),U("#c8102e"),-.95,.62,0));let o=O(je(.045,10),fi("#ffd35a"),.72,.99,.12);o.userData.noInk=!0,e.add(o);let l=O(new Ue(.16,.12,.16,10,1,!0),U("#b98a52",{side:qt}),.98,.82,0);l.userData.noInk=!0,e.add(l);for(let c=0;c<3;c++){let h=O(je(.06,8),fi("#d81e2a"),.95+(c-1)*.05,.92,(c-1)*.05);h.userData.noInk=!0,e.add(h)}return gs(n,.025),n.userData={body:e,wheels:r},n}function zp(){let n=new ye,e=new It({color:"#d8f3ff",transparent:!0,opacity:.45,depthWrite:!1,blending:sn,side:qt}),t=[];for(let r=0;r<6;r++){let a=O(new Tt(.16+r*.09,.03,6,20,Math.PI*1.5),e,0,.15+r*.22,0);a.rotation.x=Math.PI/2,a.castShadow=!1,n.add(a),t.push(a)}let i=U("#7cbf4a"),s=[];for(let r=0;r<5;r++){let a=O(new mn(.12,.08),i);a.material=U("#7cbf4a",{side:qt}),n.add(a),s.push(a)}return n.userData={rings:t,leaves:s},n}function Gp(){let n=new ye,e=O(new Ze(.4,.3,.3),wt("#e0201b",1.2),0,.6,0);return e.add(new da(new ma(e.geometry),new fr({color:"#ffd35a"}))),e.add(O(new Ze(.42,.06,.32),wt("#ffcf3a",1.5))),n.add(e),n.userData={box:e},n}function Vp(){let n=new ye,e=O(je(.26,14),U("#6b4a2e"),0,.24,0);e.scale.set(1,.8,1),n.add(e),n.add(O(new Ue(.08,.12,.12,10),U("#4a3220"),0,.45,0));let t=O(je(.06,8),wt("#ff2a2a",3),.18,.32,.12);return t.userData.noInk=!0,n.add(t),gs(n,.03),n.userData={led:t},n}function vM(){let n=new ye;n.add(O(new Ue(.02,.02,1.2,6),U("#d8b57a"),0,.6,0));for(let e=0;e<5;e++)n.add(O(je(.13,18),fi("#d81e2a",{emissive:"#5a0008",emissiveIntensity:.6}),0,.62+e*.2,0));return n}var Wp=new ft(.15,14,10),Xp=new yr({color:"#e0212e",emissive:"#8a0a12",emissiveIntensity:.9,roughness:.15,clearcoat:1}),Hu={bike:"#2fb59a",horse:"#ffb347",bull:"#ffffff",meteor:"#9fd8ff",chief:"#ff6fae",spider:"#c58cff",douzhi:"#8dffb0",magnet:"#ff4f5e",chest:"#ffd35a"};function qp(n){let e=new ye,t=new ye;t.position.y=.75;let i=Hu[n];switch(n){case"horse":{let a=Ou();a.scale.setScalar(.42),a.position.y=-.35,t.add(a);break}case"bull":{let a=Bu();a.scale.setScalar(.45),a.position.y=-.38,t.add(a);break}case"bike":{let a=ku();a.scale.setScalar(.5),a.position.y=-.4,t.add(a);break}case"meteor":{t.add(O(new Gn(.2,0),wt("#bfe6ff",3)));for(let a=0;a<6;a++){let o=O(new $t(.06,.26,5),wt("#9fd8ff",2)),l=new D().setFromSphericalCoords(.22,Math.acos(1-2*(a+.5)/6),a*2.4);o.position.copy(l),o.quaternion.setFromUnitVectors(new D(0,1,0),l.clone().normalize()),t.add(o)}break}case"chief":{t.add(O(new Tt(.2,.05,8,24).rotateX(Math.PI/2),U("#b3261e")));for(let a=0;a<9;a++){let o=a/9*Math.PI-Math.PI/2,l=O(new vt(.04,.3,4,6),U(["#ff6fae","#ffd35a","#3ad1ff"][a%3]),Math.sin(o)*.18,.22,-Math.cos(o)*.05-.05);l.rotation.z=-o*.5,t.add(l)}break}case"spider":{t.add(O(je(.16,14),U("#2a2233"))),t.add(O(je(.1,12),U("#2a2233"),.17,-.02,0));for(let a=0;a<8;a++){let o=a<4?-1:1,l=a%4,c=O(new Ue(.015,.015,.34,5),U("#2a2233"),(l-1.5)*.08,-.05,o*.2);c.rotation.x=o*1.1,t.add(c)}for(let a of[-1,1])t.add(O(je(.025,6),wt("#ff4fa0",3),.25,.02,.04*a));break}case"douzhi":{let a=O(new ft(.22,18,8,0,Math.PI*2,Math.PI/2,Math.PI/2),U("#f4f6fb",{side:qt}));t.add(a),t.add(O(new Tt(.215,.02,6,24).rotateX(Math.PI/2),U("#2a6fb5")));let o=O(new Si(.2,20).rotateX(-Math.PI/2),U("#a9b47e"),0,-.03,0);o.userData.noInk=!0,t.add(o);break}case"magnet":{let a=vM();a.scale.setScalar(.55),a.position.y=-.45,t.add(a);break}case"chest":{t.add(O(new Ze(.56,.32,.4),U("#c8102e")));let a=O(new Ue(.2,.2,.56,16,1,!1,0,Math.PI).rotateZ(Math.PI/2),U("#d8232a"),0,.16,0);a.rotation.x=-Math.PI/2,t.add(a);for(let o of[-.2,0,.2])t.add(O(new Ze(.05,.5,.42),wt("#ffcf3a",.8),o,.06,0));t.add(O(new Ze(.1,.12,.05),wt("#ffcf3a",1.2),0,.04,.21));break}}e.add(t),gs(t,.03);let s=new pe(new Kn(.42,.55,40).rotateX(-Math.PI/2),new It({color:i,transparent:!0,opacity:.8,blending:sn,depthWrite:!1}));s.position.y=.04,e.add(s);let r=new pe(new Ue(.35,.5,3.2,20,1,!0),new It({color:i,transparent:!0,opacity:.16,blending:sn,depthWrite:!1,side:qt}));r.position.y=1.6,e.add(r);for(let a of[s,r])a.userData.noBake=!0,a.castShadow=!1;return e.userData={icon:t,ring:s,beam:r},e}function Yp(n,e){n.updateMatrixWorld(!0);let t=new bt().copy(n.matrixWorld).invert(),i=new Map,s=new bt,r=a=>{for(let o of[...a.children]){if(e.has(o)){Yp(o,e);continue}if(r(o),o.isMesh&&!o.userData.noBake&&!Array.isArray(o.material)&&!o.isInstancedMesh){let l=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();for(let u of Object.keys(l.attributes))["position","normal","uv"].includes(u)||l.deleteAttribute(u);l.attributes.uv||l.setAttribute("uv",new Ht(new Float32Array(l.attributes.position.count*2),2)),l.applyMatrix4(s.multiplyMatrices(t,o.matrixWorld));let c=i.get(o.material)||[];c.push({geo:l,shadow:o.castShadow}),i.set(o.material,c);let h=o.children.filter(u=>!(u.isMesh&&!u.userData.noBake));for(let u of h)a.add(u),u.applyMatrix4(o.matrix);o.removeFromParent()}else!o.isMesh&&o.children.length===0&&!e.has(o)&&o.removeFromParent()}};r(n);for(let[a,o]of i){let l=new pe(Op(o.map(c=>c.geo)),a);l.castShadow=a!==Uu&&o.some(c=>c.shadow),l.userData.noBake=!0,n.add(l)}}function ti(n){let e=n.userData;n.userData={};let t={},i=new Set,s=0,r=a=>(a.name="k"+s++,i.add(a),a.name);for(let[a,o]of Object.entries(e))Array.isArray(o)?o.length&&o[0]?.isObject3D&&(t[a]=o.map(r)):o?.isObject3D&&(t[a]=r(o));return Yp(n,i),{model:n,map:t}}function qn(n){let e=n.model.clone(),t={};for(let[i,s]of Object.entries(n.map))t[i]=Array.isArray(s)?s.map(r=>e.getObjectByName(r)):e.getObjectByName(s);return e.userData=t,e}function ao(n,e,t,i){let s=document.createElement("canvas");s.width=n,s.height=e,t(s.getContext("2d"),n,e);let r=new Fi(s);return r.colorSpace=hn,r.anisotropy=8,i&&(r.wrapS=r.wrapT=Ts,r.repeat.set(...i)),r}var Zp=11,Xe=()=>(Zp=Zp*16807%2147483647)/2147483647,MM=n=>ao(n?1024:2048,n?1024:2048,(e,t,i)=>{e.fillStyle="#6f6b64",e.fillRect(0,0,t,i);let s=n?12:16,r=t/s;for(let a=0;a<s;a++)for(let o=-1;o<s;o++){let l=a%2*r*.5,c=o*r+l+5,h=a*r+5,u=r-10,d=148+Xe()*34|0,f=Xe()*10|0,m=e.createLinearGradient(c,h,c+u,h+u);m.addColorStop(0,`rgb(${d+22+f},${d+18},${d+8})`),m.addColorStop(.5,`rgb(${d+f},${d-3},${d-12})`),m.addColorStop(1,`rgb(${d-26},${d-30},${d-36})`),e.fillStyle=m,e.fillRect(c,h,u,u),e.fillStyle=`rgb(${d+4+f},${d},${d-9})`,e.fillRect(c+7,h+7,u-14,u-14);for(let v=0;v<(n?18:70);v++){e.fillStyle=`rgba(${Xe()<.5?"40,30,20":"255,250,240"},${Xe()*.07})`;let x=1+Xe()*5;e.beginPath(),e.arc(c+Xe()*u,h+Xe()*u,x,0,7),e.fill()}if(Xe()<.18){e.strokeStyle="rgba(40,30,20,.35)",e.lineWidth=2,e.beginPath();let v=c+Xe()*u,x=h+Xe()*u;e.moveTo(v,x);for(let p=0;p<4;p++)v+=(Xe()-.5)*50,x+=(Xe()-.5)*50,e.lineTo(v,x);e.stroke()}}e.save(),e.translate(t/2,i/2),e.scale(2,2);for(let a=150;a>20;a-=30)e.strokeStyle="rgba(70,60,50,.35)",e.lineWidth=6,e.beginPath(),e.arc(0,0,a,0,Math.PI*2),e.stroke();for(let a=0;a<8;a++)e.rotate(Math.PI/4),e.beginPath(),e.moveTo(30,0),e.lineTo(150,0),e.stroke();e.restore();for(let a=0;a<(n?400:1400);a++){let o=Xe()<.5?Xe()*160:t-Xe()*160,[l,c]=Xe()<.5?[o,Xe()*i]:[Xe()*t,o];e.fillStyle=`rgba(80,110,50,${Xe()*.3})`,e.beginPath(),e.arc(l,c,2+Xe()*7,0,7),e.fill()}}),bM=()=>ao(512,256,(n,e,t)=>{n.fillStyle="#5f5f66",n.fillRect(0,0,e,t);let i=16,s=48;for(let r=0;r<t/i;r++)for(let a=-1;a<e/s+1;a++){let o=112+Xe()*26|0;n.fillStyle=`rgb(${o},${o+2},${o+8})`,n.fillRect(a*s+r%2*s/2+2,r*i+2,s-4,i-4)}},[4,1]),SM=()=>ao(256,256,(n,e,t)=>{n.fillStyle="#3d4049",n.fillRect(0,0,e,t);for(let i=0;i<16;i++){let s=n.createLinearGradient(i*16,0,i*16+16,0);s.addColorStop(0,"#2c2f37"),s.addColorStop(.5,"#5b5f6b"),s.addColorStop(1,"#2c2f37"),n.fillStyle=s,n.fillRect(i*16+2,0,12,t)}},[8,1]),EM=()=>ao(1024,256,(n,e,t)=>{n.fillStyle="#b8b2a6",n.fillRect(0,0,e,t);let i=e/4;for(let r=0;r<4;r++){let a=r*i;if(n.fillStyle="#9e2a22",n.fillRect(a,0,18,t),n.fillRect(a+i-18,0,18,t),r%2===0){n.fillStyle="#b3261e",n.fillRect(a+70,70,i-140,t-70),n.strokeStyle="#6e140f",n.lineWidth=4,n.strokeRect(a+70,70,i-140,t-70),n.beginPath(),n.moveTo(a+i/2,70),n.lineTo(a+i/2,t),n.stroke(),n.fillStyle="#e8b84a";for(let o=0;o<4;o++)for(let l=0;l<3;l++)for(let c of[-1,1])n.beginPath(),n.arc(a+i/2+c*(22+l*22),100+o*36,4,0,7),n.fill();n.beginPath(),n.arc(a+i/2-12,160,9,0,7),n.arc(a+i/2+12,160,9,0,7),n.fill(),n.fillStyle="#d8292b",n.fillRect(a+88,82,26,70),n.fillRect(a+i-114,82,26,70),n.fillStyle="#1d1a24",n.font='bold 20px "PingFang SC",sans-serif',n.textAlign="center",n.fillText("\u798F",a+101,124),n.fillText("\u798F",a+i-101,124);for(let[o,l]of[[a+40,"\u9F9F\u5E74\u798F\u5BFF"],[a+i-40,"\u751C\u8FC7\u4F17\u751F"]])n.fillStyle="#d8292b",n.fillRect(o-14,62,28,180),n.fillStyle="#1d1a24",n.font='bold 22px "PingFang SC",sans-serif',[...l].forEach((c,h)=>n.fillText(c,o,92+h*42))}else{n.fillStyle="#6e140f",n.fillRect(a+50,50,i-100,130),n.fillStyle="#f4ead1",n.fillRect(a+58,58,i-116,114),n.strokeStyle="#8b2a1d",n.lineWidth=5;for(let o=1;o<6;o++)n.beginPath(),n.moveTo(a+58+o*(i-116)/6,58),n.lineTo(a+58+o*(i-116)/6,172),n.stroke();for(let o=1;o<4;o++)n.beginPath(),n.moveTo(a+58,58+o*28.5),n.lineTo(a+i-58,58+o*28.5),n.stroke()}}let s=n.createLinearGradient(0,0,0,40);s.addColorStop(0,"#2f6e7a"),s.addColorStop(1,"#1f4d58"),n.fillStyle=s,n.fillRect(0,0,e,40);for(let r=0;r<16;r++)n.fillStyle=r%2?"#d8b04a":"#c23b2e",n.beginPath(),n.arc(r*64+32,20,11,0,7),n.fill()});function Hc(n,e,t,i){let s=new mr,r=e/2;s.moveTo(-r-.25,.12),s.quadraticCurveTo(-r*.35,.05,0,t),s.quadraticCurveTo(r*.35,.05,r+.25,.12),s.lineTo(r+.25,-.05),s.quadraticCurveTo(r*.3,-.08,0,t-.22),s.quadraticCurveTo(-r*.3,-.08,-r-.25,-.05);let a=new Ea(s,{depth:n,bevelEnabled:!1,curveSegments:10});a.translate(0,0,-n/2),a.rotateY(Math.PI/2);let o=new pe(a,i);o.castShadow=o.receiveShadow=!0;let l=new pe(new Ue(.1,.1,n+.4,10).rotateZ(Math.PI/2),U("#2a2c33"));l.position.y=t,o.add(l);for(let c of[-1,1]){let h=new pe(new $t(.12,.38,6),U("#2a2c33"));h.position.set(c*(n/2+.2),t+.14,0),h.rotation.z=-c*.5,o.add(h)}return o}function $p(){let n=new ye,e=new pe(new ft(.26,18,12),wt("#ff3b24",1.2));e.scale.y=1.15,n.add(e);for(let s of[-.3,.3])n.add(new pe(new Ue(.12,.12,.06,12),U("#e8b84a")).translateY(s));let t=new pe(new Ue(.02,.06,.3,6),U("#ffcf3a"));t.position.y=-.48,n.add(t);let i=new pe(new Ue(.01,.01,.5,4),U("#2a2c33"));return i.position.y=.55,n.add(i),n.userData.body=e,n}function TM(){let n=new ye,e=U("#6b4a33"),t=new pe(new Ue(.28,.42,2.6,10),e);t.position.y=1.3,t.castShadow=!0,n.add(t);for(let[o,l]of[[.6,1.4],[-.7,1.2],[2.2,1.1]]){let c=new pe(new Ue(.1,.16,l,7),e);c.position.set(Math.cos(o)*.4,2.5,Math.sin(o)*.4),c.rotation.set(Math.sin(o)*.7,0,-Math.cos(o)*.7),c.castShadow=!0,n.add(c)}let i=new ye;i.position.y=3.3;let s=["#4f8a3c","#5f9c45","#6fae4f","#4a7f38"];for(let o=0;o<16;o++){let l=.7+Xe()*.6,c=new pe(new Gn(l,1),U(s[o%4],{flatShading:!0})),h=Xe()*Math.PI*2,u=Xe()*1.6;c.position.set(Math.cos(h)*u,Xe()*1.3-.2,Math.sin(h)*u),c.castShadow=!0,i.add(c)}for(let o=0;o<18;o++){let l=Xe()*Math.PI*2,c=.6+Xe()*1.6,h=new pe(new ft(.13,12,8),wt("#ff8a1f",.25));h.scale.y=.8,h.position.set(Math.cos(l)*c,-.4+Xe()*1.2,Math.sin(l)*c),h.castShadow=!0,i.add(h)}let r=new ye;r.position.set(1.6,2.2,.6);for(let o=0;o<10;o++){let l=o/10*Math.PI*2,c=new pe(new Ue(.01,.01,.5,4),U("#8a5a2b"));c.position.set(Math.cos(l)*.18,0,Math.sin(l)*.18),r.add(c)}r.add(new pe(new $t(.22,.2,12),U("#8a5a2b")).translateY(.34)),r.add(new pe(new Ue(.2,.2,.03,12),U("#8a5a2b")).translateY(-.25));let a=new pe(new ft(.07,10,8),U("#ffd35a"));return a.position.y=-.05,r.add(a),r.add(new pe(new Ue(.005,.005,.7,3),U("#2a2c33")).translateY(.75)),n.add(r),n.add(i),n.userData.crown=i,n.userData.cage=r,n}function wM(){let n=new ye,e=U("#8a8780"),t=new pe(new Ue(.85,.9,.7,16,1,!0),U("#8a8780",{side:qt}));t.position.y=.35,t.castShadow=!0,n.add(t);let i=new pe(new Tt(.85,.1,8,24),e);i.rotation.x=Math.PI/2,i.position.y=.7,n.add(i);let s=new pe(new Si(.8,24),new Vn({color:"#1f4d58",roughness:.1,metalness:.3}));s.rotation.x=-Math.PI/2,s.position.y=.45,n.add(s);let r=U("#7a5230");for(let l of[-1,1]){let c=new pe(new Ze(.12,1.6,.12),r);c.position.set(0,.8,l*.8),c.castShadow=!0,n.add(c)}let a=new pe(new Ue(.07,.07,1.8,8).rotateX(Math.PI/2),r);a.position.y=1.5,n.add(a);let o=new pe(new Ue(.16,.12,.22,10),U("#9a6b3c"));return o.position.set(0,.95,0),n.add(o),n}function AM(){let n=new ye,e=U("#f1efe8"),t=new pe(new ft(9,20,10,0,Math.PI*2,0,Math.PI/2),U("#5f7d4a"));t.scale.y=.45,n.add(t);let i=[[0,0],[2.2,0],[2.2,.6],[1.9,.7],[2.1,2.6],[1.6,3.6],[.9,4],[.55,4.2],[.55,4.6],[.35,4.6],[.4,6.6],[.15,6.9],[0,7.4]].map(([a,o])=>new he(a,o)),s=new pe(new Ta(i,28),e);s.position.y=3.9,n.add(s);let r=new pe(new ft(.4,12,8),wt("#d8b04a",.4));return r.position.y=11.4,n.add(r),n}function Jp(n,{lowPower:e=!1}={}){let t=new Ac({canvas:n,antialias:!e,powerPreference:"high-performance"});t.setPixelRatio(e?Math.min(window.devicePixelRatio||1,1.5):Math.min(window.devicePixelRatio||1,2)),t.shadowMap.enabled=!0,t.shadowMap.type=Ul,t.toneMapping=Is,t.toneMappingExposure=1.05;let i=new ca;i.fog=new la("#e9d8c0",40,120);let s=new gn(38,1,.1,400),r=new Ra("#fff1dc","#5a5048",1.3),a=new Da("#ffe0b5",2.6);a.castShadow=!0,a.shadow.mapSize.set(e?1024:2048,e?1024:2048),Object.assign(a.shadow.camera,{left:-18,right:18,top:18,bottom:-18,near:1,far:80}),a.shadow.bias=-5e-4,a.shadow.normalBias=.03,i.add(r,a,a.target);let o={uTop:{value:new Fe},uHor:{value:new Fe},uGlow:{value:new Fe},uSun:{value:new D(.4,.25,-1).normalize()},uNight:{value:0},uTime:{value:0}},l=new pe(new ft(300,32,16),new Bt({side:un,depthWrite:!1,fog:!1,uniforms:o,vertexShader:"varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",fragmentShader:`
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
      }`}));i.add(l);let c=new ye;i.add(c);let h=new Vn({map:MM(e),roughness:.92}),u=new pe(new mn(Pe*2,nt*2),h);u.rotation.x=-Math.PI/2,u.receiveShadow=!0,c.add(u);let d=new pe(new mn(300,300),new Vn({color:"#6f6a60",roughness:1}));d.rotation.x=-Math.PI/2,d.position.y=-.02,d.receiveShadow=!0,c.add(d);let f=new Vn({map:bM(),roughness:.95}),m=U("#5b5f6b",{map:SM()});function v(H,J,se,me,L){let ce=new ye,Q=new pe(new Ze(se,me,.5),f);Q.position.y=me/2,Q.castShadow=Q.receiveShadow=!0,ce.add(Q);let _e=Hc(se,.9,.35,m);_e.position.y=me,ce.add(_e),ce.position.set(H,0,J),ce.rotation.y=L,c.add(ce)}v(-Pe-.3,0,nt*2+1.2,1.8,Math.PI/2),v(Pe+.3,0,nt*2+1.2,1.8,Math.PI/2),v(0,nt+.3,Pe*2+1.2,.55,0);let x=new ye;x.position.set(0,0,-nt-1.4);let p=new pe(new Ze(Pe*2+1,3.2,2),[f,f,f,f,new Vn({map:EM(),roughness:.85}),f]);p.material[4].map.repeat.set(2,1),p.material[4].map.wrapS=Ts,p.position.y=1.6,p.castShadow=p.receiveShadow=!0,x.add(p);let S=new pe(new Ze(Pe*2+1,.3,.8),U("#a8a296"));S.position.set(0,.15,1.3),S.receiveShadow=!0,x.add(S);for(let H=0;H<=8;H++){let J=new pe(new Ue(.17,.19,3.2,12),U("#a3261c"));J.position.set(-Pe-.5+H*(Pe*2+1)/8,1.6,1.15),J.castShadow=!0,x.add(J)}let A=Hc(Pe*2+2.4,3.6,1.6,m);A.position.set(0,3.2,.2),x.add(A);let g=new pe(new Ze(2.2,.6,.08),[U("#1d1a24"),U("#1d1a24"),U("#1d1a24"),U("#1d1a24"),new Vn({map:ao(512,140,(H,J,se)=>{H.fillStyle="#1d1a24",H.fillRect(0,0,J,se),H.strokeStyle="#e8b84a",H.lineWidth=8,H.strokeRect(8,8,J-16,se-16),H.fillStyle="#e8b84a",H.font='bold 84px "PingFang SC","Songti SC",serif',H.textAlign="center",H.textBaseline="middle",H.fillText("\u9F9F \u82D1",J/2,se/2+4)}),emissive:"#3a2a10",emissiveIntensity:.3}),U("#1d1a24")]);g.position.set(0,2.75,1.05),x.add(g);for(let H of[-Pe-.5+3*(Pe*2+1)/8,-Pe-.5+5*(Pe*2+1)/8])for(let J=0;J<9;J++){let se=new pe(new Ue(.045,.045,.16,8),wt("#e0242f",.5));se.position.set(H+(J%2?.07:-.07),2.6-J*.15,1.38),se.rotation.z=J%2?.5:-.5,x.add(se)}c.add(x);for(let H of[-1,1]){let J=new ye,se=U("#9a968c");J.add(new pe(new Ze(.9,.5,.9),U("#7f7b72")).translateY(.25));let me=new pe(new ft(.38,16,12),se);me.scale.set(.9,1.1,.8),me.position.y=.85,J.add(me);let L=new pe(new ft(.3,16,12),se);L.position.set(0,1.35,.12),J.add(L);for(let Q=0;Q<14;Q++){let _e=Q/14*Math.PI*2,we=new pe(new ft(.09,8,6),U("#86827a"));we.position.set(Math.cos(_e)*.3,1.35+Math.sin(_e)*.3,.02),J.add(we)}for(let Q of[-1,1]){let _e=new pe(new ft(.05,8,6),U("#5f5b52"));_e.position.set(Q*.11,1.42,.38),J.add(_e)}let ce=new pe(new ft(.17,12,8),U("#86827a"));ce.position.set(H*-.25,.68,.32),J.add(ce),J.traverse(Q=>{Q.isMesh&&(Q.castShadow=!0)}),J.position.set(H*3.2,0,-nt-.25),J.rotation.y=H*-.25,c.add(J)}let M=new D(-Pe+.2,2.6,-2),b=new D(-6.2,3.4,-4.6),I=new pe(new Ue(.012,.012,M.distanceTo(b),4),U("#e8e2d0"));I.position.copy(M).lerp(b,.5),I.quaternion.setFromUnitVectors(new D(0,1,0),b.clone().sub(M).normalize()),c.add(I);let y=[];["#ff6fae","#3a7bd5","#ffd35a","#ffffff","#3ad17a"].forEach((H,J)=>{let se=M.clone().lerp(b,.15+J*.17),me=new pe(J===3?new mn(.5,.6):new mn(.42,.5),U(H,{side:qt}));me.geometry.translate(0,-.27,0),me.position.copy(se),me.rotation.y=Math.atan2(b.x-M.x,b.z-M.z)+Math.PI/2,me.castShadow=!0,c.add(me),y.push(me)});let E={value:0},C=(()=>{let H=[];for(let me=0;me<4;me++){let L=new $t(.035,.32+me*.05,3);L.translate(0,.16,0),L.rotateZ((me-1.5)*.25),L.rotateY(me*1.6),H.push(L.toNonIndexed())}let J=H.flatMap(me=>[...me.attributes.position.array]),se=new Et;return se.setAttribute("position",new it(J,3)),se.computeVertexNormals(),se})(),B=U("#6f9e43").clone();B.onBeforeCompile=H=>{H.uniforms.uWind=E,H.vertexShader=`uniform float uWind;
`+H.vertexShader.replace("#include <begin_vertex>",`#include <begin_vertex>
vec4 ip = instanceMatrix[3];
transformed.x += sin(uWind * 2.0 + ip.x * 0.7 + ip.z * 0.5) * 0.06 * position.y * 3.0;`)};let z=520,w=new ts(C,B,z),N=new bt,G=new Jn,V=new D;for(let H=0;H<z;H++){let J,se;if(H<340){let L=H%4,ce=Xe()*2-1,Q=Pe-Xe()*Xe()*2.2;[J,se]=L===0?[-Q,ce*nt]:L===1?[Q,ce*nt]:L===2?[ce*Pe,-Q]:[ce*Pe,Q]}else if(H<420){let L=Xe()*Math.PI*2,ce=1.1+Xe()*1.4;J=ms[0].x+Math.cos(L)*ce,se=-ms[0].y+Math.sin(L)*ce}else J=(Xe()*2-1)*Pe,se=(Xe()*2-1)*nt;G.setFromAxisAngle(new D(0,1,0),Xe()*6.28);let me=.6+Xe()*.9;N.compose(new D(J,0,se),G,V.set(me,me*(.7+Xe()*.6),me)),w.setMatrixAt(H,N)}w.receiveShadow=!0,c.add(w);let K=new Si(.11,6).rotateX(-Math.PI/2);K.scale(1.6,1,.8);let X=160,q=new ts(K,U("#ffffff"),X),ne=["#c9a43a","#b8722c","#8fae4a","#d88a2a"].map(H=>new Fe(H));for(let H=0;H<X;H++){let J=Xe()*Math.PI*2,se=H<90?1.2+Xe()*4:Xe()*16,me=H<90?ms[0].x+Math.cos(J)*se:(Xe()*2-1)*Pe,L=H<90?-ms[0].y+Math.sin(J)*se:(Xe()*2-1)*nt;G.setFromAxisAngle(new D(0,1,0),Xe()*6.28),N.compose(new D(Dn.clamp(me,-Pe,Pe),.012+H*5e-5,Dn.clamp(L,-nt,nt)),G,V.setScalar(.7+Xe()*.7)),q.setMatrixAt(H,N),q.setColorAt(H,ne[H%4])}q.receiveShadow=!0,c.add(q);let Ie=[];for(let H=0;H<6;H++){let J=$p();J.position.set(-Pe+2+H*(Pe*2-4)/5,2.65,-nt+.15),c.add(J),Ie.push(J)}for(let[H,J]of[[-Pe+.4,-3],[-Pe+.4,6],[Pe-.4,-3],[Pe-.4,6]]){let se=$p();se.position.set(H,2.1,J),c.add(se),Ie.push(se)}let Ce=[[-7,-nt+1],[7,-nt+1],[-Pe+1,2],[Pe-1,2]].map(([H,J])=>{let se=new Pa("#ff7a3c",0,13,1.6);return se.position.set(H,2.5,J),i.add(se),se}),gt=[];for(let H of ms){let J=H.kind==="tree"?TM():wM();J.position.set(H.x,0,-H.y),c.add(J),gt.push(J)}for(let[H,J]of[[-Pe+1,-nt+1],[Pe-1,-nt+1],[-Pe+1,nt-1.2],[Pe-1,nt-1.2]]){let se=new ye;se.add(new pe(new Ue(.45,.32,.6,14),U("#8a3b22")).translateY(.3));let me=new pe(new Gn(.55,1),U("#4f8a3c",{flatShading:!0}));me.position.y=1,se.add(me);for(let L=0;L<6;L++){let ce=new pe(new ft(.08,8,6),wt("#ff5a3a",.4)),Q=L*1.1;ce.position.set(Math.cos(Q)*.45,1+Math.sin(L)*.3,Math.sin(Q)*.45),se.add(ce)}se.traverse(L=>{L.isMesh&&(L.castShadow=!0)}),se.position.set(H,0,J),c.add(se)}let Ye=new ye;for(let H of[-1,1]){let J=new pe(new Tt(.35,.04,6,20),U("#1d1a24"));J.position.set(H*.5,.36,0),Ye.add(J)}let ct=new pe(new Ze(1,.06,.06),U("#2c7a6b"));ct.position.y=.6,Ye.add(ct),Ye.position.set(Pe-.7,0,3.5),Ye.rotation.y=Math.PI/2,Ye.rotation.x=.12,c.add(Ye);let ee=new ye;for(let H=0;H<3;H++)for(let J=-6;J<=6;J++){let se=5+Xe()*3,me=2.4+Xe()*.8,L=Hc(se,4,1.3,m);L.position.set(J*7+H%2*3.5+Xe(),me,-nt-7-H*7),ee.add(L);let ce=new pe(new Ze(se-.6,me,3.4),U("#9a9488"));ce.position.set(L.position.x,me/2,L.position.z),ee.add(ce)}for(let H=0;H<18;H++){let J=new pe(new Gn(1.4+Xe(),0),U(Xe()<.5?"#557a40":"#4a6d38",{flatShading:!0}));J.position.set(-45+Xe()*90,3.5,-nt-9-Xe()*18),ee.add(J)}for(let H of[-1,1])for(let J=0;J<8;J++){let se=Hc(4,4,1.2,m);se.rotation.y=Math.PI/2,se.position.set(H*(Pe+4+J%2*5),2.6,-nt+J*4),ee.add(se)}let ae=AM();ae.position.set(22,0,-70),ee.add(ae),i.add(ee);let ge=e?null:new Pc(t);ge&&ge.addPass(new Dc(i,s));let $e=ge?new Cr(new he(512,512),.5,.45,.93):null;ge&&(ge.addPass($e),ge.addPass(new Lc));let be={tDiffuse:{value:null},uSat:{value:1.12},uVig:{value:.42},uFlash:{value:0},uHurt:{value:0},uChroma:{value:0},uWarm:{value:.5}},Qe=ge&&new Rr({uniforms:be,vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`uniform sampler2D tDiffuse; uniform float uSat, uVig, uFlash, uHurt, uChroma, uWarm; varying vec2 vUv;
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
      }`});ge&&ge.addPass(Qe);let At=!e,oe=!e,ue=180,de=new Et,fe=new Float32Array(ue*3),Me=new Float32Array(ue);for(let H=0;H<ue;H++)fe[H*3]=(Xe()*2-1)*Pe,fe[H*3+1]=.5+Xe()*3.5,fe[H*3+2]=(Xe()*2-1)*nt,Me[H]=Xe()*100;de.setAttribute("position",new Ht(fe,3)),de.setAttribute("seed",new Ht(Me,1));let ze={uTime:{value:0},uNight:{value:0},uScale:{value:400},uSnow:{value:0}},Ve=0,Ke=new As(de,new Bt({uniforms:ze,transparent:!0,depthWrite:!1,blending:sn,vertexShader:`attribute float seed; uniform float uTime, uNight, uScale, uSnow; varying float vA; varying vec3 vC;
      void main(){ vec3 p = position; float t = uTime * 0.3 + seed;
        p.x += sin(t * 0.7) * 1.5 + uTime * 0.25 * (1.0 - uNight) * (1.0 - uSnow); p.z += cos(t * 0.5) * 1.2; p.y += sin(t * 1.3) * 0.4;
        // snow: everything drifts down and loops back to the top
        p.y = mix(p.y, 5.5 - mod(uTime * 0.7 + seed * 3.0, 5.5), uSnow);
        p.x = mod(p.x + 12.5, 25.0) - 12.5;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float blink = uNight > 0.5 ? 0.5 + 0.5 * sin(uTime * 3.0 + seed * 7.0) : 0.7;
        vA = mix(blink, 0.85, uSnow); vC = mix(mix(vec3(1.0, 0.72, 0.82), vec3(0.75, 1.0, 0.45), uNight), vec3(0.75), uSnow);
        gl_PointSize = mix(mix(0.18, 0.13, uNight), 0.22, uSnow) * uScale / -mv.z; gl_Position = projectionMatrix * mv; }`,fragmentShader:"varying float vA; varying vec3 vC; void main(){ float r = length(gl_PointCoord - 0.5); if (r > 0.5) discard; gl_FragColor = vec4(vC * 1.4, pow(1.0 - r * 2.0, 1.5) * vA); }"}));Ke.frustumCulled=!1,i.add(Ke);let et=[{at:0,top:"#7fb2e0",hor:"#f6dcb8",glow:"#ffd09a",sun:"#ffe7c4",sunI:2.7,hemi:1.3,fog:"#ead8bd",elev:.55,lamp:0,exp:1.05},{at:.55,top:"#6f8fc8",hor:"#ffbf8a",glow:"#ff9a5c",sun:"#ffb47a",sunI:2.2,hemi:1.05,fog:"#e7b996",elev:.25,lamp:.4,exp:1.05},{at:.8,top:"#2b3466",hor:"#b86a6a",glow:"#ff7a4a",sun:"#ff9a6a",sunI:1.1,hemi:.75,fog:"#6a5472",elev:.12,lamp:1,exp:1.1},{at:1,top:"#0e1430",hor:"#2c3466",glow:"#6a7ad8",sun:"#9fb2ff",sunI:.75,hemi:.6,fog:"#232a4a",elev:.6,lamp:1.3,exp:1.15}],F=new Fe,Rt=new Fe,at=(H,J,se,me)=>H.copy(F.set(J)).lerp(Rt.set(se),me),R={f:0,goal:0,lamp:0},_=new D;function W(){let H=0;for(;H<et.length-2&&R.f>et[H+1].at;)H++;let J=et[H],se=et[H+1],me=Dn.clamp((R.f-J.at)/(se.at-J.at),0,1),L=ce=>J[ce]+(se[ce]-J[ce])*me;at(o.uTop.value,J.top,se.top,me),at(o.uHor.value,J.hor,se.hor,me),at(o.uGlow.value,J.glow,se.glow,me),at(a.color,J.sun,se.sun,me),a.intensity=L("sunI"),r.intensity=L("hemi"),at(i.fog.color,J.fog,se.fog,me),at(r.groundColor,"#5a5048","#1c1a2a",R.f),t.toneMappingExposure=L("exp"),R.lamp=L("lamp"),_.set(-.55,L("elev"),.35).normalize(),o.uSun.value.set(-.55,Math.max(.05,L("elev")*.5),-.8).normalize(),o.uNight.value=Dn.clamp((R.f-.7)/.3,0,1),ze.uNight.value=o.uNight.value,at(ro.color.value,"#fff0d8","#8fb4ff",Dn.clamp((R.f-.5)/.5,0,1)),ro.k.value=.35+.25*R.f,be.uWarm.value=.6-.6*R.f}W();let $=new D;function te(H,J){R.goal=Dn.clamp(H,0,1),J&&(R.f=R.goal,W())}function xe(H,J){Math.abs(R.goal-R.f)>5e-4&&(R.f+=(R.goal-R.f)*(1-Math.exp(-J*.8)),W()),o.uTime.value=H,l.position.copy(s.position),a.position.copy($).addScaledVector(_,40),a.target.position.copy($);for(let[se,me]of Ie.entries())me.rotation.z=Math.sin(H*1.3+se)*.06,me.userData.body.material.emissiveIntensity=.5+R.lamp*2.2;for(let[se,me]of Ce.entries())me.intensity=R.lamp*(9+Math.sin(H*7+se*2)*.6);for(let se of gt)se.userData.crown&&(se.userData.crown.rotation.z=Math.sin(H*.7)*.025,se.userData.crown.rotation.x=Math.sin(H*.53)*.02,se.userData.cage.rotation.z=Math.sin(H*1.1)*.08);E.value=H,ze.uTime.value=H,ze.uSnow.value+=(Ve-ze.uSnow.value)*(1-Math.exp(-J*.8));for(let[se,me]of y.entries())me.rotation.x=Math.sin(H*2+se)*.15;be.uFlash.value*=Math.exp(-J*1.6),be.uHurt.value*=Math.exp(-J*5),be.uChroma.value*=Math.exp(-J*6)}function ve(){let H=window.innerWidth,J=window.innerHeight;t.setSize(H,J,!1),ge&&ge.setSize(H,J),ze.uScale.value=t.domElement.height/(2*Math.tan(Dn.degToRad(s.fov/2))),s.aspect=H/J,s.updateProjectionMatrix()}function ie(){oe&&ge?ge.render():t.render(i,s)}function re(H){At=H>=2&&!!ge,oe=H>=1&&!!ge,$e&&($e.enabled=At),t.setPixelRatio(H>=1?Math.min(window.devicePixelRatio||1,H>=2?2:1.5):H===0&&e?Math.min(window.devicePixelRatio||1,1.5):1);let J=H>=1?2048:1024;a.shadow.mapSize.x!==J&&(a.shadow.mapSize.set(J,J),a.shadow.map?.dispose(),a.shadow.map=null),ve()}return ve(),{renderer:t,scene:i,camera:s,focus:$,update:xe,resize:ve,render:ie,setDay:te,setQuality:re,flash:H=>{be.uFlash.value=Math.max(be.uFlash.value,H)},hurt:()=>{be.uHurt.value=1,be.uChroma.value=1},setSnow:H=>{Ve=H?1:0},get lamp(){return R.lamp}}}var Kp={kill:{cols:["#ffd35a","#ff7a59","#ffffff"],add:!0,sp:.09,up:.08,g:.006,life:40,size:.28},spark:{cols:["#fff3a8","#ffd35a"],add:!0,sp:.07,up:.03,g:.004,life:14,size:.18},fluff:{cols:["#d7ad7e","#c79a6b","#f1d6b0"],add:!1,sp:.06,up:.06,g:.0015,life:70,size:.3,drag:.95},gold:{cols:["#ffd35a","#fff1a8","#ffb000"],add:!0,sp:.08,up:.12,g:.004,life:60,size:.3},sugar:{cols:["#ff3b5c","#ffffff","#ffd1e0"],add:!0,sp:.06,up:.1,g:.005,life:40,size:.22},dust:{cols:["#b9b2a6","#9d968a"],add:!1,sp:.05,up:.03,g:.001,life:34,size:.4,drag:.92},ping:{cols:["#ffd400","#fff3a8"],add:!0,sp:.1,up:.06,g:.005,life:30,size:.3},paper:{cols:["#ffffff","#f1ede4"],add:!1,sp:.06,up:.08,g:.002,life:60,size:.26,drag:.95},boom:{cols:["#ff7a2a","#ffd35a","#ff3b24"],add:!0,sp:.16,up:.1,g:.004,life:32,size:.5},poof:{cols:["#e8e4dc","#c9c4ba"],add:!1,sp:.05,up:.05,g:0,life:30,size:.45,drag:.9},spawn:{cols:["#ff5a5a","#ffb3b3"],add:!0,sp:.05,up:.07,g:.002,life:26,size:.24},heart:{cols:["#ff7ab8","#ffd1e8","#ffffff"],add:!0,sp:.12,up:.04,g:.001,life:40,size:.32},web:{cols:["#ffffff","#e6f3ff"],add:!0,sp:.2,up:.05,g:.002,life:40,size:.2}};function jp(n,e,t){let i=new Et,s=new Float32Array(e*3),r=new Float32Array(e*3),a=new Float32Array(e),o=new Float32Array(e);i.setAttribute("position",new Ht(s,3)),i.setAttribute("color",new Ht(r,3)),i.setAttribute("size",new Ht(a,1)),i.setAttribute("alpha",new Ht(o,1));let l={uScale:{value:500}},c=new Bt({uniforms:l,transparent:!0,depthWrite:!1,blending:t?sn:ls,vertexColors:!0,vertexShader:`attribute float size; attribute float alpha; varying vec3 vC; varying float vA; uniform float uScale;
      void main(){ vC = color; vA = alpha; vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = size * uScale / -mv.z; gl_Position = projectionMatrix * mv; }`,fragmentShader:`varying vec3 vC; varying float vA;
      void main(){ vec2 d = gl_PointCoord - 0.5; float r = length(d); if (r > 0.5) discard;
        float a = ${t?"pow(1.0 - r * 2.0, 1.6)":"smoothstep(0.5, 0.35, r)"} * vA; gl_FragColor = vec4(vC * ${t?"1.6":"1.0"}, a); }`}),h=new As(i,c);return h.frustumCulled=!1,n.add(h),{geo:i,pos:s,col:r,size:a,alpha:o,uniforms:l,list:[],max:e}}function RM(){let n=document.createElement("canvas");n.width=n.height=1024;let e=n.getContext("2d");e.translate(512,512),e.strokeStyle="rgba(255,255,255,0.95)",e.shadowColor="#bfe4ff",e.shadowBlur=12;let t=16;e.lineWidth=5;for(let s=0;s<t;s++){let r=s/t*Math.PI*2;e.beginPath(),e.moveTo(0,0),e.lineTo(Math.cos(r)*500,Math.sin(r)*500),e.stroke()}e.lineWidth=3.5;for(let s=40;s<500;s+=34){e.beginPath();for(let r=0;r<=t;r++){let a=r/t*Math.PI*2,o=(r-.5)/t*Math.PI*2,l=Math.cos(a)*s,c=Math.sin(a)*s;r===0?e.moveTo(l,c):e.quadraticCurveTo(Math.cos(o)*s*.9,Math.sin(o)*s*.9,l,c)}e.stroke()}let i=new Fi(n);return i.colorSpace=hn,i}function CM(){let n=new ye,e=new pe(new ft(.7,20,14),U("#2a2233"));e.scale.set(1,.85,1.1),n.add(e);let t=new pe(new ft(.42,18,12),U("#2a2233"));t.position.set(0,-.35,.7),n.add(t);for(let[r,a]of[[-.14,-.2],[.14,-.2],[-.26,-.32],[.26,-.32]]){let o=new pe(new ft(.07,8,6),wt("#ff4fa0",3));o.position.set(r,a-.1,1.05),n.add(o)}for(let r of[-1,1]){let a=new pe(new $t(.22,.4,4).rotateZ(r*Math.PI/2),U("#ff6fae"));a.position.set(r*.22,.65,0),a.scale.y=.6,n.add(a)}let i=[];for(let r=0;r<8;r++){let a=r<4?-1:1,o=r%4,l=new ye;l.position.set(a*.5,0,.45-o*.3);let c=new pe(new Ue(.05,.06,1.1,6),U("#2a2233"));c.position.set(a*.45,.25,0),c.rotation.z=a*-1,l.add(c);let h=new pe(new Ue(.03,.05,1.2,6),U("#2a2233"));h.position.set(a*1.05,-.2,0),h.rotation.z=a*.5,l.add(h),l.rotation.y=(o-1.5)*.35*a,n.add(l),i.push(l)}let s=new pe(new Ue(.02,.02,30,4),new It({color:"#ffffff"}));return s.position.y=15,n.add(s),n.userData.legs=i,n}function Qp(n){let e=jp(n,1600,!0),t=jp(n,900,!1),i=new Fe;function s(y,E,C,P=12,B=.5){let z=Kp[y]||Kp.kill,w=z.add?e:t;for(let N=0;N<P;N++){w.list.length>=w.max&&w.list.shift();let G=Math.random()*Math.PI*2,V=z.sp*(.4+Math.random());i.set(z.cols[N%z.cols.length]),w.list.push({x:E,y:B+Math.random()*.3,z:-C,vx:Math.cos(G)*V,vy:z.up*(.5+Math.random()),vz:Math.sin(G)*V,life:z.life*(.6+Math.random()*.6),max:0,g:z.g,drag:z.drag||.97,size:z.size*(.6+Math.random()*.8),r:i.r,gg:i.g,b:i.b}),w.list[w.list.length-1].max=w.list[w.list.length-1].life}}function r(y){let E=0,C=[];for(let P of y.list)P.vy-=P.g,P.vx*=P.drag,P.vz*=P.drag,P.x+=P.vx,P.y+=P.vy,P.z+=P.vz,P.y<.03&&(P.y=.03,P.vy*=-.3,P.vx*=.7,P.vz*=.7),!(--P.life<=0)&&(C.push(P),y.pos[E*3]=P.x,y.pos[E*3+1]=P.y,y.pos[E*3+2]=P.z,y.col[E*3]=P.r,y.col[E*3+1]=P.gg,y.col[E*3+2]=P.b,y.size[E]=P.size,y.alpha[E]=Math.min(1,P.life/(P.max*.4)),E++);y.list=C,y.geo.setDrawRange(0,E);for(let P of["position","color","size","alpha"])y.geo.attributes[P].needsUpdate=!0}let a={voice:"#ff7ab8",boom:"#ff8a2a",slam:"#ff3b3b",gavel:"#ff6a3b",ping:"#ffd400",star:"#9fd8ff"},o=new Kn(.86,1,64).rotateX(-Math.PI/2),l=[];function c(y,E,C,P){let B=new pe(o,new It({color:a[P]||"#ffffff",transparent:!0,opacity:.9,blending:sn,depthWrite:!1}));B.position.set(y,.08,-E),n.add(B),l.push({m:B,r:C,t:0,T:P==="voice"?26:20}),P==="voice"&&s("heart",y,E,26,.8)}let h=new It({map:RM(),transparent:!0,depthWrite:!1,opacity:0,blending:sn}),u=new pe(new mn(1,1).rotateX(-Math.PI/2),h);u.position.y=.06,u.visible=!1,n.add(u);let d=CM();d.visible=!1,n.add(d);let f=0,m=26;function v(y,E,C=12){f=1,m=C*(26/12),u.position.x=y,u.position.z=-E,u.visible=!0,d.position.set(y,18,-E),d.visible=!0,s("web",y,E,60,.3)}let x=new ft(.28,14,10),p=new $t(.22,2.4,10,1,!0).translate(0,1.2,0),S=wt("#bfe6ff",4),A=new It({color:"#9fd8ff",transparent:!0,opacity:.55,blending:sn,depthWrite:!1}),g=[];function M(y,E,C){let P=new ye;P.add(new pe(x,S),new pe(p,A)),P.rotation.z=-.5,n.add(P),g.push({grp:P,x:y,y:E,t:0,T:C})}function b(){r(e),r(t);for(let y of g){y.t++;let E=Math.min(1,y.t/y.T);y.grp.position.set(y.x-6*(1-E),.2+12*(1-E),-y.y),y.t>=y.T&&(n.remove(y.grp),y.done=!0)}for(let y=g.length-1;y>=0;y--)g[y].done&&g.splice(y,1);for(let y of l){y.t++;let E=y.t/y.T;y.m.scale.setScalar(Math.max(.01,y.r*(.25+.75*Math.sqrt(E)))),y.m.material.opacity=.9*(1-E),y.t>=y.T&&(n.remove(y.m),y.m.material.dispose(),y.done=!0)}for(let y=l.length-1;y>=0;y--)l[y].done&&l.splice(y,1);if(f>0){f++;let y=Math.min(1,f/30);u.scale.setScalar(m*(1-Math.pow(1-y,3))),u.rotation.y=f*.002,h.opacity=f<200?.75:Math.max(0,.75*(1-(f-200)/60));let E=f<24?18-f/24*15.5:f<120?2.5+Math.sin(f*.1)*.25:2.5+(f-120)*.25;d.position.y=E,d.rotation.y=Math.sin(f*.05)*.3;for(let[C,P]of d.userData.legs.entries())P.rotation.x=Math.sin(f*.3+C)*.25;f>260&&(f=0,u.visible=!1,d.visible=!1)}}function I(y){e.uniforms.uScale.value=t.uniforms.uScale.value=y}return{burst:s,ring:c,superSpider:v,meteor:M,update:b,setScale:I}}var ht=n=>document.getElementById(n),Gu=Object.fromEntries(Ns.map(n=>[n.id,n])),PM=Object.fromEntries(no.map(n=>[n.id,n]));function em(n){let e=ht("labels");ht("tagline").textContent=xp;let t=(w,N)=>w.map(G=>`<span class="pill ${N}">${G}</span>`).join(""),i=["durian","ginger","orange","dingding","oyster","goat","caesar","chenwei","jia","yi","guo","thief","mao"].map(w=>ps[w]);ht("cast").innerHTML=`<div class="row"><b>\u4E3B\u89D2</b>${t(["\u9F9F"],"hero")}<b>\u961F\u53CB</b>${t(["\u8521\u535A"],"mate")}</div><div class="row"><b>\u5BF9\u624B</b>${t(i,"foe")}</div><div class="row"><b>Boss</b>${t([ps.bigmao,ps.judge],"boss")}</div>`;let s=new D;function r(w,N,G){return s.set(w,N,-G).project(n),[(s.x*.5+.5)*innerWidth,(-s.y*.5+.5)*innerHeight,s.z<1]}let a=(w,N,G,V)=>{let[K,X,q]=r(N,G,V);w.style.left=K+"px",w.style.top=X+"px",w.style.display=q?"":"none"},o=document.createElement("div");o.className="bubble",o.hidden=!0,e.appendChild(o);let l="",c=[];function h(w,N,G,V,K=1.2,X=100){c.length>60&&c.shift().el.remove();let q=document.createElement("div");q.className=w,q.textContent=N,e.appendChild(q),c.push({el:q,x:G+(Math.random()-.5)*.4,y:V,h:K,life:X})}let u=(w,N,G,V)=>h("dmg"+(V?" crit":""),String(G),w,N,1.1,42),d=(w,N,G,V)=>h("pop "+(V||""),G,w,N,V==="ping"?.5:1.8,96),f=new Map;function m(w){for(let K=c.length-1;K>=0;K--){let X=c[K];if(--X.life<=0){X.el.remove(),c.splice(K,1);continue}a(X.el,X.x,X.h,X.y)}let N=w.hero;N&&N.sayT>0&&(w.state==="play"||w.state==="over")?(l!==N.say&&(l=N.say,o.textContent=N.say,o.hidden=!1,o.style.animation="none",o.offsetWidth,o.style.animation=""),a(o,N.x,1.55,N.y)):o.hidden||(o.hidden=!0,l="");let G=new Set,V=w.enemies.length<26;for(let K of w.state==="play"?w.enemies:[]){let X=K.type==="judge"||K.type==="bigmao";if(!X&&!K.elite&&(!V||K.type==="maoqiu"))continue;G.add(K.id);let q=f.get(K.id);q||(q=document.createElement("div"),q.className="tag"+(X||K.elite?" boss":""),q.textContent=K.name,e.appendChild(q),f.set(K.id,q));let ne=({judge:4.6,bigmao:3.9,mao:1.9,jia:2.4,yi:2.4,guo:2.1,thief:2.1,caesar:1.9,chenwei:1.9,dingding:2.3,ginger:1.45}[K.type]||1.25)*(K.elite?1.35:1);a(q,K.x,ne,K.y)}for(let K of w.state==="play"?w.pickups||[]:[]){let X="p"+K.id;G.add(X);let q=f.get(X);q||(q=document.createElement("div"),q.className="tag pick",q.textContent=io[K.kind].name,e.appendChild(q),f.set(X,q)),a(q,K.x,1.9,K.y)}for(let[K,X]of f)G.has(K)||(X.remove(),f.delete(K))}function v(){for(let w of c)w.el.remove();c.length=0;for(let w of f.values())w.remove();f.clear(),o.hidden=!0}let x=-1;function p(w){let N=w.hero,G=N.s;ht("hpFill").style.width=Math.max(0,G.hp/G.maxhp*100)+"%",ht("hpText").textContent=`${Math.ceil(Math.max(0,G.hp))} / ${G.maxhp}`,ht("xpFill").style.width=Math.min(100,N.xp/Fc(N.lvl)*100)+"%",ht("lvl").textContent="Lv "+N.lvl,ht("shields").innerHTML="<i></i>".repeat(N.shields),ht("waveNum").textContent=`\u7B2C ${w.wave} / ${14} \u6CE2`;let V=ht("waveTime");if(w.bossWave)V.textContent="BOSS",V.classList.remove("low");else if(w.waveT===0)V.textContent=`\u6E05\u573A ${w.enemies.length+w.spawns.length}`,V.classList.remove("low");else{let ne=Math.ceil(w.waveT/60);V.textContent=`${ne/60|0}:${String(ne%60).padStart(2,"0")}`,V.classList.toggle("low",ne<=5)}let K=ht("bossbar");w.boss?(K.hidden=!1,ht("bossName").textContent=w.boss.name+(w.boss.invulnerable>0?" \xB7 \u62DB\u5F0F\u4E2D":""),ht("bossFill").style.width=Math.max(0,w.boss.hp/w.boss.max*100)+"%"):K.hidden=!0,ht("kills").textContent="\u51FB\u8D25 "+w.kills,ht("score").firstChild.nodeValue=w.score.toLocaleString();let X=ht("combo");w.combo>=3?(X.hidden=!1,ht("comboN").textContent!==String(w.combo)&&(ht("comboN").textContent=w.combo,X.classList.remove("bump"),X.offsetWidth,X.classList.add("bump")),ht("comboBar").style.width=w.comboT/150*90+"px"):X.hidden=!0;let q=ht("ultBtn");if(q.style.setProperty("--p",N.ult),q.classList.toggle("ready",N.ult>=100),N.augs.length!==x){x=N.augs.length;let ne={};for(let Ie of N.augs)ne[Ie]=(ne[Ie]||0)+1;ht("augs").innerHTML=Object.entries(ne).map(([Ie,Ce])=>`<i class="${Gu[Ie].tier}">${Gu[Ie].name}${Ce>1?" \xD7"+Ce:""}</i>`).join("")}}let S=["title","pick","pause","over","win"];function A(w){for(let N of S)ht(N).hidden=N!==w;ht("hud").hidden=!(w==="play"||w==="pause"||w==="pick"),w==="title"&&(x=-1)}function g(w,N,G){let V=ht("banner");ht("bannerTitle").textContent=w,ht("bannerSub").textContent=N||"",V.className="",V.offsetWidth,V.className="show"+(G?" boss":"")}let M="";function b(w,N){let G=w.offer.kind==="stat",V=w.offer.kind+w.offer.list.join()+w.picks+w.rerolls;if(V===M)return;M=V;let K=G?"stat":w.offer.tier,X=ht("pickTier");ht("pickTitle").textContent=G?"\u57FA\u7840\u5347\u7EA7":"\u6D77\u514B\u65AF\u5F3A\u5316",X.textContent=G?"1 / 2":yp[K]+" \xB7 2 / 2",X.className=K,ht("pickSub").textContent=G?`${"\u8521\u535A"}\uFF1A\u5148\u7EC3\u4E00\u9879\u672C\u4E8B\uFF0C\u518D\u9009\u6D77\u514B\u65AF`:`${"\u8521\u535A"}\uFF1A\u518D\u9009\u4E00\u4E2A\u6D77\u514B\u65AF\u5427 \xB7 \u672C\u5C40\u503E\u5411 ${Fs[w.meta.focus]}`;let q=w.lastWave,ne=w.hero.s,Ie=G?`<span>\u5B50\u5F39 ${ne.count} \u53D1</span><span>\u4F24\u5BB3 ${ne.dmg.toFixed(1)}</span><span>\u751F\u547D ${Math.ceil(ne.hp)}/${ne.maxhp}</span><span>\u6062\u590D ${ne.regen}/6 \u79D2</span>`:"";ht("summary").innerHTML=(q?`<span class="rate ${q.rating}">${q.rating}</span><span>\u7B2C ${q.n} \u6CE2\u5B8C\u6210</span><span>\u51FB\u8D25 ${q.kills}</span><span>\u6700\u9AD8\u8FDE\u6740 ${q.best}</span><span>\u81EA\u52A8\u62FE\u53D6 ${q.gems} \u7CD6\u679C \xB7 ${q.supplies} \u8865\u7ED9</span>${q.bonus?`<span>\u8BC4\u4EF7\u5956\u52B1 +${q.bonus}</span>`:""}${q.reroll?"<span>\u65E0\u4F24\uFF1A\u6D77\u514B\u65AF\u91CD\u63B7 +1</span>":""}`:"")+Ie;let Ce=Ye=>(G?w.hero.statUps:w.hero.augs).filter(ct=>ct===Ye).length;ht("cards").innerHTML=w.offer.list.map((Ye,ct)=>{let ee=G?PM[Ye]:Gu[Ye];return`<button class="card ${K}" data-i="${ct}"><div class="in"><div class="hex" aria-hidden="true">${ee.icon}</div><div><h3>${ee.name}</h3><p>${ee.desc}</p>${Ce(Ye)?`<div class="own">\u5DF2\u62E5\u6709 \xD7${Ce(Ye)}</div>`:""}</div></div><kbd>${ct+1}</kbd></button>`}).join("");for(let Ye of ht("cards").children)Ye.onclick=()=>N(Number(Ye.dataset.i));let gt=ht("rerollBtn");gt.parentElement.hidden=G,gt.textContent=`\u6362\u4E00\u6279\uFF08\u5269 ${w.rerolls} \u6B21\uFF09`,gt.disabled=w.rerolls<=0,gt.style.opacity=w.rerolls>0?1:.5}let I=()=>{M=""};function y(w){let N=w.hero,G=0;try{G=Number(localStorage.getItem("xo.best")||0)}catch{}let V=Math.max(w.score,G);try{localStorage.setItem("xo.best",V)}catch{}return[[w.score.toLocaleString(),"\u751C\u5EA6"+(w.score>G?"\uFF08\u65B0\u7EAA\u5F55\uFF01\uFF09":"")],[V.toLocaleString(),"\u6700\u4F73\u751C\u5EA6"],["+"+w.earned,"\u672C\u5C40\u7CD6\u7968"],[w.meta.points,"\u6301\u6709\u7CD6\u7968"],[w.wave+" / "+14,"\u6CE2\u6B21"],[w.kills,"\u51FB\u8D25"],[w.bestCombo,"\u6700\u9AD8\u8FDE\u6740"],[w.hitsTotal,"\u6211\u7BAD\u4E2D\u4E86\uFF08\u6B21\uFF09"]].map(([X,q])=>`<div><b>${X}</b><small>${q}</small></div>`).join("")}function E(w){ht("overTitle").textContent=w.overQuote,ht("overStats").innerHTML=y(w)}function C(w){ht("winStats").innerHTML=y(w)}function P(w,N="",G){let V=ht("toasts");V.children.length>3&&V.firstChild.remove();let K=document.createElement("div");K.className="toast "+N,K.textContent=w,G&&K.style.setProperty("--c",G),V.appendChild(K),setTimeout(()=>K.remove(),2500)}function B(w,N,G){let V=ht("streak");ht("streakT").textContent=w,ht("streakP").textContent=`${N} \u8FDE\u6740`,V.className="",V.offsetWidth,V.className="show t"+G}function z(){let w=ht("hurtFlash");w.classList.add("on"),setTimeout(()=>w.classList.remove("on"),60)}return{updateLabels:m,clearLabels:v,hud:p,show:A,banner:g,renderPick:b,resetPick:I,renderOver:E,renderWin:C,dmg:u,pop:d,hurtFlash:z,toast:P,streak:B}}var Ut=null,zi=null,Gi=null,On=null,zc=null,Vu=localStorage.getItem("xo.muted")==="1",Gc=()=>Vu;function Wu(n){Vu=n,localStorage.setItem("xo.muted",n?"1":"0"),zi&&zi.gain.setTargetAtTime(n?0:.5,Ut.currentTime,.05)}function lo(){if(Ut){Ut.state==="suspended"&&Ut.resume();return}let n=window.AudioContext||window.webkitAudioContext;if(!n)return;Ut=new n,zi=Ut.createGain(),zi.gain.value=Vu?0:.5;let e=Ut.createDynamicsCompressor();e.threshold.value=-16,e.ratio.value=4,zi.connect(e).connect(Ut.destination),Gi=Ut.createGain(),Gi.gain.value=.8,Gi.connect(zi),On=Ut.createGain(),On.gain.value=.32,On.connect(zi),zc=Ut.createGain(),zc.gain.value=.5,zc.connect(zi);let t=Ut.createDelay();t.delayTime.value=.23;let i=Ut.createGain();i.gain.value=.25;let s=Ut.createGain();s.gain.value=.22,On.connect(t).connect(i).connect(t),t.connect(s).connect(zi),FM()}var am=()=>Ut&&Ut.state==="running",oo=null;function DM(){if(oo)return oo;oo=Ut.createBuffer(1,Ut.sampleRate,Ut.sampleRate);let n=oo.getChannelData(0);for(let e=0;e<n.length;e++)n[e]=Math.random()*2-1;return oo}function qe(n,e,t,{type:i="sine",vol:s=.2,attack:r=.004,bus:a=Gi,glide:o=0,bend:l=0}={}){let c=Ut.createOscillator(),h=Ut.createGain();c.type=i,c.frequency.setValueAtTime(l?n*l:n,e),l&&c.frequency.exponentialRampToValueAtTime(n,e+.04),o&&c.frequency.exponentialRampToValueAtTime(n*o,e+t),h.gain.setValueAtTime(1e-4,e),h.gain.exponentialRampToValueAtTime(s,e+r),h.gain.exponentialRampToValueAtTime(1e-4,e+t),c.connect(h).connect(a),c.start(e),c.stop(e+t+.05)}function rn(n,e,{vol:t=.2,f:i=2e3,q:s=1,type:r="bandpass",bus:a=Gi,sweep:o=0}={}){let l=Ut.createBufferSource();l.buffer=DM();let c=Ut.createBiquadFilter();c.type=r,c.frequency.setValueAtTime(i,n),c.Q.value=s,o&&c.frequency.exponentialRampToValueAtTime(i*o,n+e);let h=Ut.createGain();h.gain.setValueAtTime(t,n),h.gain.exponentialRampToValueAtTime(1e-4,n+e),l.connect(c).connect(h).connect(a),l.start(n,Math.random()*.5),l.stop(n+e+.05)}function Pr(n,e,t=.12,i=On){qe(n,e,.9,{type:"triangle",vol:t,bend:1.03,bus:i}),qe(n*2,e,.35,{type:"sine",vol:t*.4,bus:i}),qe(n*3,e,.12,{type:"sine",vol:t*.15,bus:i})}var rt={A3:220,C4:261.63,D4:293.66,E4:329.63,G4:392,A4:440,C5:523.25,D5:587.33,E5:659.25,G5:783.99,A5:880,C6:1046.5},LM=["E5","G5","A5","G5","E5","D5","C5","D5","E5","G5","A5","C6","A5","G5","E5","-","D5","E5","G5","E5","D5","C5","A4","C5","D5","E5","D5","C5","A4","G4","A4","-"],UM=["C4","A3","D4","G4"],NM=["A4","C5","D5","E5","D5","C5","A4","-","E5","G5","E5","D5","C5","D5","A4","-"],_n={on:!1,bpm:104,step:0,next:0,boss:!1,calm:!0};function Vi({on:n=_n.on,wave:e=1,boss:t=!1,calm:i=!1}={}){_n.on=n,_n.boss=t,_n.calm=i,_n.bpm=t?132:100+e*3}function FM(){_n.next=Ut.currentTime+.1,setInterval(()=>{if(!(!Ut||Ut.state!=="running"))for(;_n.next<Ut.currentTime+.15;)_n.on&&BM(_n.next,_n.step),_n.step++,_n.next+=60/_n.bpm/2},30)}function BM(n,e){let t=e%32;if(_n.boss){let s=NM[e%16];s!=="-"&&Pr(rt[s]*(e%32>=16,1),n,.1),e%4===0&&qe(70,n,.25,{vol:.35,glide:.5,bus:On}),e%8===4&&rn(n,.12,{vol:.12,f:1800,q:.7,bus:On}),e%2===1&&rn(n,.03,{vol:.05,f:7e3,q:1,type:"highpass",bus:On}),e%16===0&&qe(rt.A3/2,n,1.6,{type:"sawtooth",vol:.04,attack:.05,bus:On});return}let i=LM[t];i!=="-"&&!(_n.calm&&e%2)&&Pr(rt[i],n,_n.calm?.07:.1),e%8===0&&qe(rt[UM[(e/8|0)%4]]/2,n,.9,{type:"sine",vol:.18,bus:On}),!_n.calm&&(e%4===0&&qe(90,n,.18,{vol:.22,glide:.5,bus:On}),e%4===2&&(qe(1200,n,.05,{type:"square",vol:.025,bus:On}),rn(n,.04,{vol:.05,f:2600,q:6,bus:On})),e%16===14&&qe(1500,n,.04,{type:"square",vol:.02,bus:On}))}var tm=[587,659,784,880,988,1175],nm=0;function om(n,e=1){if(!am())return;let t=Math.max(Ut.currentTime,nm),i=[...n].filter(s=>!/[\s，。！？、…～!?.,]/.test(s)).slice(0,12);i.forEach((s,r)=>{let a=tm[(s.charCodeAt(0)+r)%tm.length]*e;qe(a,t+r*.065,.06,{type:"sine",vol:.06,bus:zc,glide:1.12})}),nm=t+i.length*.065}var im=0,sm=0,rm=0;function Xu(n){if(!am())return;let e=Ut.currentTime;switch(n){case"shoot":if(e-im<.05)return;im=e,qe(900,e,.06,{type:"square",vol:.03,glide:.5}),rn(e,.04,{vol:.04,f:4e3});break;case"hit":if(e-sm<.03)return;sm=e,qe(320+Math.random()*80,e,.05,{type:"triangle",vol:.05});break;case"kill":qe(520,e,.09,{type:"square",vol:.04,glide:1.6}),rn(e,.1,{vol:.06,f:1500});break;case"bossdown":[0,.12,.24,.36].forEach((t,i)=>Pr([rt.C5,rt.E5,rt.G5,rt.C6][i],e+t,.12,Gi)),qe(60,e,1.2,{vol:.4,glide:.5});break;case"gem":if(e-rm<.03)return;rm=e,qe(1400+Math.random()*400,e,.06,{type:"sine",vol:.03});break;case"levelup":[rt.C5,rt.E5,rt.G5,rt.C6].forEach((t,i)=>qe(t,e+i*.07,.25,{type:"triangle",vol:.07}));break;case"waveEnd":[rt.G4,rt.C5,rt.E5,rt.G5].forEach((t,i)=>Pr(t,e+i*.09,.1,Gi));break;case"win":[rt.C5,rt.D5,rt.E5,rt.G5,rt.A5,rt.C6].forEach((t,i)=>Pr(t,e+i*.12,.12,Gi));break;case"over":[rt.A4,rt.G4,rt.E4,rt.D4].forEach((t,i)=>qe(t,e+i*.18,.5,{type:"triangle",vol:.08}));break;case"hurt":qe(200,e,.18,{type:"sawtooth",vol:.07,glide:.5});break;case"dodge":rn(e,.15,{vol:.08,f:3e3,sweep:.3});break;case"shield":qe(1800,e,.2,{vol:.06,glide:.4}),rn(e,.2,{vol:.08,f:5e3});break;case"shieldUp":qe(1200,e,.15,{vol:.04,glide:1.5});break;case"aegis":[rt.C5,rt.G5,rt.C6].forEach((t,i)=>qe(t,e+i*.1,.6,{type:"triangle",vol:.08}));break;case"sweet":qe(900,e,.4,{vol:.07,glide:1.8}),qe(1350,e+.05,.35,{vol:.04,glide:1.6});break;case"plant":qe(300,e,.08,{type:"square",vol:.04}),qe(300,e+.12,.08,{type:"square",vol:.04});break;case"boom":qe(80,e,.5,{vol:.4,glide:.4}),rn(e,.5,{vol:.25,f:900,type:"lowpass",sweep:.2});break;case"hubby":rn(e,.6,{vol:.15,f:600,sweep:4}),qe(440,e,.2,{type:"square",vol:.04}),qe(660,e+.12,.25,{type:"square",vol:.04});break;case"moo":qe(140,e,.6,{type:"sawtooth",vol:.06,glide:.7,attack:.08});break;case"baa":qe(420,e,.3,{type:"sawtooth",vol:.03,glide:.9});break;case"ult":rn(e,1.2,{vol:.2,f:300,sweep:10}),[rt.A4,rt.C5,rt.E5,rt.A5].forEach((t,i)=>qe(t,e+i*.06,1,{type:"sawtooth",vol:.035,attack:.02})),qe(55,e,1.2,{vol:.35,glide:.6});break;case"eshoot":qe(260,e,.08,{type:"square",vol:.025,glide:.7});break;case"ping":qe(1600,e,.08,{vol:.04}),qe(1600,e+.11,.08,{vol:.04});break;case"pingland":qe(500,e,.15,{type:"triangle",vol:.06,glide:.5});break;case"spit":qe(700,e,.08,{vol:.04,glide:.5});break;case"throw":rn(e,.2,{vol:.08,f:2500,sweep:.5});break;case"slam":qe(55,e,.45,{vol:.45,glide:.5}),rn(e,.3,{vol:.15,f:400,type:"lowpass"});break;case"reroll":rn(e,.25,{vol:.08,f:1500,sweep:3});break;case"pick":[rt.E5,rt.A5].forEach((t,i)=>qe(t,e+i*.06,.3,{type:"triangle",vol:.07}));break;case"star":qe(1800,e,.3,{vol:.05,glide:.3}),rn(e,.3,{vol:.1,f:3e3,sweep:.3});break;case"gallop":[0,.12,.3,.42].forEach(t=>qe(180,e+t,.06,{type:"triangle",vol:.08,glide:.6})),qe(520,e,.5,{type:"sawtooth",vol:.03,glide:1.4,attack:.05});break;case"streak":[rt.A4,rt.E5,rt.A5].forEach(t=>qe(t,e,.9,{type:"sawtooth",vol:.035,attack:.02})),qe(rt.A3/2,e,.9,{vol:.25,glide:.8}),rn(e,.4,{vol:.08,f:1200,sweep:3});break;case"elite":qe(98,e,1.4,{type:"sawtooth",vol:.06,attack:.05}),qe(147,e,1.4,{type:"sawtooth",vol:.04,attack:.05}),rn(e,1.2,{vol:.06,f:300,type:"lowpass"});break;case"pickup":[rt.G5,rt.C6,rt.E5*2].forEach((t,i)=>qe(t,e+i*.05,.25,{type:"triangle",vol:.06}));break;case"chest":[rt.C5,rt.E5,rt.G5,rt.C6,rt.E5*2].forEach((t,i)=>Pr(t,e+i*.07,.12,Gi)),qe(65,e,.8,{vol:.3,glide:.6});break;case"pickupSpawn":qe(2200,e,.15,{vol:.025,glide:1.3}),qe(2900,e+.06,.15,{vol:.02});break;case"rifle":rn(e,.06,{vol:.12,f:2500,q:.6}),qe(160,e,.05,{type:"square",vol:.04,glide:.5});break;case"flash":qe(3200,e,1.2,{vol:.03}),rn(e,.15,{vol:.15,f:5e3});break;case"tide":rn(e,1.4,{vol:.18,f:400,type:"lowpass",sweep:3}),rn(e+.3,1.2,{vol:.08,f:3e3,sweep:.4});break;case"bell":qe(2100,e,.5,{vol:.06}),qe(2100,e+.14,.6,{vol:.06}),qe(2650,e,.4,{vol:.02});break;case"click":qe(1e3,e,.04,{type:"triangle",vol:.04});break}}var Vr=document.getElementById("scene"),Hr=matchMedia("(pointer: coarse)").matches&&Math.min(screen.width,screen.height)<=820,Rn=Jp(Vr,{lowPower:Hr}),{scene:Pt,camera:Un,renderer:kM}=Rn,ln=Qp(Pt),Yt=em(Un),dm="xo.progress.v1",HM=()=>{try{return JSON.parse(localStorage.getItem(dm)||"{}")}catch{return{}}},De=wp({meta:HM()}),jc=()=>{try{localStorage.setItem(dm,JSON.stringify(De.meta))}catch{}},zM=["","\u5C0F\u69B4\u83B2\u3001\u59DC\u997C\u4EBA\u2026\u2026\u6A58\u5B50\u6765\u4E86\uFF01","\u5F90\u5C71\u7F8A\u5F00\u59CB\u51B2\u4E86\uFF0C\u4E01\u4E01\u8981\u62B1\u62B1","\u7532\u65B9\u4E59\u65B9\u5435\u4E0A\u95E8\u4E86\uFF0C\u5F80\u6614\u869D\u5728\u60F3\u5F53\u5E74","\u5927\u6BDB\uFF08\u8D85\u5927\u53F7\uFF09\u6765\u4E86","\u5927\u6BDB\u4E00\u5BB6\u90FD\u6765\u4E86","\u679C\u54E5\u5728\u95EE\u53F7\uFF0C\u5434\u6D69\u7136\u5728\u5077\u7CD6","\u4F60\u7684\u9F9F\u6628\u5929\u665A\u4E0A\u98CE\u597D\u5927","\u6C89\u6BC5\u7F8A\uFF08\u6CD5\u5B98\uFF09\u5F00\u5EAD\u4E86","\u4ED6\u5E94\u8BE5\u4E0D\u4F1A\u4E0B\u5305\u7684","\u9EC4\u623F\u4E0A\u6CA1\u4EBA","\u80E1\u540C\u53CC\u7EBF\u7A81\u56F4","\u7532\u4E59\u53CC\u65B9\u4E00\u8D77\u4E0A","\u7CBE\u82F1\u5934\u76EE\u4E71\u6597","\u6C89\u6BC5\u7F8A\u7EC8\u5BA1\u5F00\u5EAD\uFF1A\u5C0F\u5FC3\u6280\u80FD\u9884\u8B66"],nd=ti(kp()),vn=qn(nd);Pt.add(vn);var zr=new pe(new ft(.9,28,18),new It({color:"#7fd3ff",transparent:!0,opacity:.2,depthWrite:!1,blending:sn}));zr.position.y=.45;vn.add(zr);var po=new pe(new Kn(.66,.78,40).rotateX(-Math.PI/2),new It({color:"#ff6fae",transparent:!0,opacity:.7,depthWrite:!1}));po.position.y=.03;Pt.add(po);var Wr=new pe(new Kn(.97,1,64).rotateX(-Math.PI/2),new It({color:"#ffffff",transparent:!0,opacity:.12,depthWrite:!1}));Wr.position.y=.025;Pt.add(Wr);var qu={},fm=n=>qu[n]||(qu[n]=ti(Hp(n==="finaljudge"?"judge":n))),Wi=qn(ti(Fu()));Wi.visible=!1;Pt.add(Wi);var pm=ti(Bu()),Ai=qn(pm);Ai.visible=!1;Pt.add(Ai);var Xi=qn(ti(Ou()));Xi.visible=!1;Pt.add(Xi);var GM=ti(Fu()),xs=qn(ti(ku())),ho=qn(GM);ho.position.set(-.5,.2,0);xs.userData.body.add(ho);xs.visible=!1;Pt.add(xs);var mm=ti(zp()),gm=ti(Gp()),VM=ti(Vp()),Ku=[],ju=[],Qu=[];function Gr(n,e,t){for(;n.length<t;){let i=qn(e);Pt.add(i),n.push(i)}n.forEach((i,s)=>{i.visible=s<t})}var an=new nn;function qi(n,e,t,i=!1){let s=new ts(n,e,t);return s.count=0,s.castShadow=i,s.frustumCulled=!1,Pt.add(s),s}var Wc=qi(new vt(.075,.34,4,8).rotateZ(Math.PI/2),wt("#ff8fcf",3.2),400),Xc=qi(Wp,Xp,900,!0),Dr={bolt:qi(new ft(.17,12,8),wt("#ff7a2a",2.6),200),pearl:qi(new ft(.16,14,10),fi("#fff7f2",{emissive:"#ffd9ec",emissiveIntensity:.8}),200),paper:qi(new Ze(.42,.03,.32),U("#ffffff",{emissive:"#ffffff",emissiveIntensity:.3}),200,!0),hongbao:qi(new Ze(.36,.05,.24),wt("#e0242f",1.4),200,!0),sausage:qi(new vt(.1,.32,4,10).rotateZ(Math.PI/2),U("#a8382a"),200,!0),spear:qi(new Ue(.03,.03,1.1,6).rotateZ(Math.PI/2),U("#c9ced6"),100,!0)},Yu={},Ur=new Map,WM=new Kn(.85,1,48).rotateX(-Math.PI/2),XM={frenzy:"#ff3b3b",tough:"#7fd3ff",split:"#7CFC9A",boom:"#ff8a2a"},Nr=new Map,uo=[],qM=new Bt({transparent:!0,depthWrite:!1,side:qt,uniforms:{uTime:{value:0},uCol:{value:new Fe("#2f8fd6")},uA:{value:.6}},vertexShader:"varying vec2 vUv; uniform float uTime; void main(){ vUv = uv; vec3 p = position; p.y += sin(uv.x * 20.0 + uTime * 6.0) * 0.12 * uv.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0); }",fragmentShader:"varying vec2 vUv; uniform float uTime; uniform vec3 uCol; uniform float uA; void main(){ float foam = smoothstep(0.75, 1.0, vUv.y + sin(vUv.x * 40.0 + uTime * 8.0) * 0.05); vec3 c = mix(uCol, vec3(0.95, 1.0, 1.0), foam); gl_FragColor = vec4(c, uA * (0.35 + 0.65 * vUv.y)); }"}),Fr=new Map;function YM(n){let e=new ye,t=new pe(new mn(nt*2+2,1.8,60,4).rotateY(Math.PI/2).translate(0,.9,0),qM.clone());t.material.uniforms.uCol.value.set(n?"#3ad1c4":"#2a6fd6");let i=new pe(new mn(2.8,nt*2+2).rotateX(-Math.PI/2),new It({color:n?"#3ad1c4":"#2a6fd6",transparent:!0,opacity:.35,depthWrite:!1}));return i.position.y=.05,e.add(t,i),e.userData={wall:t,floor:i},Pt.add(e),e}var ZM=new Ue(.02,.02,1,4).rotateZ(Math.PI/2).translate(.5,0,0),$M=new It({color:"#ff2a2a",transparent:!0,opacity:.8,blending:sn,depthWrite:!1}),qc=[],Yc=qi((()=>{let n=new Ze(.75,.04,.14).rotateY(Math.PI/4),e=new Ze(.75,.04,.14).rotateY(-Math.PI/4),t=new Et,i=n.toNonIndexed().attributes.position.array,s=e.toNonIndexed().attributes.position.array,r=new Float32Array(i.length+s.length);return r.set(i),r.set(s,i.length),t.setAttribute("position",new Ht(r,3)),t.computeVertexNormals(),t})(),wt("#ff3b3b",2),200),JM={ping:"#ffd400",slam:"#ff3b3b",gavel:"#ff6a3b",flash:"#ffffff",boom:"#ff8a2a"},KM=new Si(1,48).rotateX(-Math.PI/2),jM=new Kn(.93,1,48).rotateX(-Math.PI/2);function QM(n){let e=new ye,t=JM[n]||"#ff3b3b",i=new pe(KM,new It({color:t,transparent:!0,opacity:.28,depthWrite:!1})),s=new pe(jM,new It({color:t,transparent:!0,opacity:.85,depthWrite:!1}));return i.position.y=.04,s.position.y=.05,e.add(i,s),e.userData={fill:i,edge:s},Pt.add(e),e}var fo=new ye;["durian","ginger","orange","dingding","oyster","goat","caesar","chenwei","jia","mao","guo","thief"].forEach((n,e,t)=>{let i=qn(fm(n)),s=e/t.length*Math.PI*2;i.position.set(Math.cos(s)*4.6,0,Math.sin(s)*4.6),i.rotation.y=Math.atan2(Math.sin(s),-Math.cos(s))+Math.PI,i.userData.phase=e,fo.add(i)});Pt.add(fo);var Br=new Map,Or=new Map,kr=new Map;function eb(){for(let n of Br.values())Pt.remove(n);for(let n of Or.values())Pt.remove(n);for(let n of kr.values())Pt.remove(n);for(let n of Ur.values())Pt.remove(n);for(let n of Nr.values())Pt.remove(n);for(let n of Fr.values())Pt.remove(n);Br.clear(),Or.clear(),kr.clear(),Ur.clear(),Nr.clear(),Fr.clear(),uo.forEach(n=>{n.visible=!1}),qc.forEach(n=>{n.visible=!1})}var pi=new Set,Zc={},Mn=(n,e=!0)=>{Zc[n]=e};addEventListener("keydown",n=>{lo();let e=n.code;["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e)&&n.preventDefault(),!n.repeat&&(pi.add(e),e==="Space"&&Mn(De.state==="play"?"ult":"start"),e==="Enter"&&Mn("start"),(e==="Escape"||e==="KeyP")&&Mn("pause"),De.state==="pick"&&((e==="Digit1"||e==="Numpad1")&&Mn("pick",0),(e==="Digit2"||e==="Numpad2")&&Mn("pick",1),(e==="Digit3"||e==="Numpad3")&&Mn("pick",2),e==="KeyR"&&Mn("reroll")))});addEventListener("keyup",n=>pi.delete(n.code));addEventListener("blur",()=>{pi.clear(),cn.active=!1,Os.hidden=!0,De.state==="play"&&Mn("pause")});document.addEventListener("visibilitychange",()=>{document.hidden&&De.state==="play"&&Mn("pause")});var Os=document.getElementById("stick"),xm=Os.firstElementChild,cn={active:!1,id:null,ox:0,oy:0,x:0,y:0},Zu=!1;function tb(){Zu||(Zu=!0,requestAnimationFrame(()=>{Zu=!1,cn.active&&(xm.style.transform=`translate(${cn.x*56}px, ${-cn.y*56}px)`)}))}Vr.addEventListener("pointerdown",n=>{if(lo(),!(De.state!=="play"||cn.active)){n.preventDefault(),Object.assign(cn,{active:!0,id:n.pointerId,ox:n.clientX,oy:n.clientY,x:0,y:0}),Os.style.left=n.clientX+"px",Os.style.top=n.clientY+"px",Os.hidden=!1,xm.style.transform="";try{Vr.setPointerCapture(n.pointerId)}catch{}}},{passive:!1});Vr.addEventListener("pointermove",n=>{if(!cn.active||n.pointerId!==cn.id)return;n.preventDefault();let e=n.clientX-cn.ox,t=n.clientY-cn.oy,i=Math.hypot(e,t),s=56;i>s&&(e*=s/i,t*=s/i),cn.x=e/s,cn.y=-t/s,tb()},{passive:!1});var ym=n=>{n.pointerId===cn.id&&(cn.active=!1,cn.x=cn.y=0,Os.hidden=!0)};Vr.addEventListener("pointerup",ym);Vr.addEventListener("pointercancel",ym);function nb(){let n=0,e=0;return(pi.has("KeyA")||pi.has("ArrowLeft"))&&(n-=1),(pi.has("KeyD")||pi.has("ArrowRight"))&&(n+=1),(pi.has("KeyW")||pi.has("ArrowUp"))&&(e+=1),(pi.has("KeyS")||pi.has("ArrowDown"))&&(e-=1),cn.active&&(n+=cn.x,e+=cn.y),{mx:n,my:e}}var ni=n=>document.getElementById(n),Yn=(n,e)=>ni(n).addEventListener("click",t=>{t.stopPropagation(),lo(),Xu("click"),e()});Yn("startBtn",()=>Mn("start"));var mo=ni("shop");function ed(){ni("shopPoints").textContent=De.meta.points,ni("shopFocus").innerHTML=Object.entries(Fs).map(([n,e])=>`<button class="btn ${De.meta.focus===n?"primary":"ghost"}" data-focus="${n}">${e}</button>`).join(""),ni("shopItems").innerHTML=Ir.map(n=>{let e=De.meta.levels[n.id];return`<button class="shopitem" data-buy="${n.id}" ${e>=n.max||De.meta.points<n.cost?"disabled":""}><b>${n.name} \xB7 ${e}/${n.max}</b><small>${n.desc}</small><em>${e>=n.max?"\u5DF2\u6EE1\u7EA7":n.cost+" \u7CD6\u7968"}</em></button>`}).join("");for(let n of ni("shopFocus").children)n.onclick=()=>{Rp(De,n.dataset.focus),jc(),ed()};for(let n of ni("shopItems").children)n.onclick=()=>{Ap(De,n.dataset.buy)&&(jc(),ed())}}Yn("shopBtn",()=>{ed(),mo.hidden=!1});Yn("shopClose",()=>{mo.hidden=!0});Yn("againBtn",()=>Mn("start"));Yn("winAgain",()=>Mn("start"));Yn("overShopBtn",()=>{De.state="title",mo.hidden=!0});Yn("winShopBtn",()=>{De.state="title",mo.hidden=!0});Yn("pauseBtn",()=>Mn("pause"));Yn("resumeBtn",()=>Mn("pause"));Yn("quitBtn",()=>{De.state="title"});Yn("rerollBtn",()=>Mn("reroll"));ni("ultBtn").addEventListener("pointerdown",n=>{n.stopPropagation(),n.preventDefault(),lo(),Mn("ult")});var id=()=>{let n="\u58F0\u97F3\uFF1A"+(Gc()?"\u5173":"\u5F00");ni("muteBtn").textContent=n,ni("pauseMute").textContent=n};Yn("muteBtn",()=>{Wu(!Gc()),id()});Yn("pauseMute",()=>{Wu(!Gc()),id()});id();var on={x:0,y:0,shake:0,zoom:1},$u=.82;function ib(n,e){let t=Math.tan(Dn.degToRad(Un.fov/2)),i=innerWidth,s=innerHeight;if(De.state==="title"){let v=n*.12,x=s>i;Un.position.set(Math.sin(v)*11,5.2,Math.cos(v)*11),Un.lookAt(0,1.1,0),Un.setViewOffset(i,s,x?0:-i*.2,x?s*.2:0,i,s),Rn.focus.set(0,0,0);return}Un.view&&Un.view.enabled&&Un.clearViewOffset();let r=De.hero,a=Dn.clamp(Math.max(5.6/t,4.6/(t*Un.aspect)),12,26)*on.zoom,o=a*t*Un.aspect,l=a*t/Math.sin($u),c=Dn.clamp(r.x+r.vx*12,-Math.max(0,Pe+1.5-o),Math.max(0,Pe+1.5-o)),h=Dn.clamp(r.y+r.vy*12,-Math.max(0,nt+1-l*.85),Math.max(0,nt+2.5-l*.85)),u=1-Math.exp(-e*6);on.x+=(c-on.x)*u,on.y+=(h-on.y)*u,on.shake*=Math.exp(-e*7);let d=on.shake*.5,f=(Math.random()-.5)*d,m=(Math.random()-.5)*d;Un.position.set(on.x+f,a*Math.sin($u),-on.y+a*Math.cos($u)+m),Un.lookAt(on.x+f*.5,0,-on.y+m*.5),Rn.focus.set(on.x,0,-on.y)}var td=(n,e,t)=>{let i=((e-n+Math.PI)%(Math.PI*2)+Math.PI*2)%(Math.PI*2)-Math.PI;return n+i*t},Lr=0,$c=0;function sb(n){let e=De.hero,t=vn.userData,i=e.ride>0,s=i&&e.mount==="bike";if(vn.position.set(e.x,i?s?.62:.95:0,-e.y),vn.rotation.y=td(vn.rotation.y,e.face,.18),Xi.visible=i&&!s,xs.visible=s,s){xs.position.set(e.x,0,-e.y),xs.rotation.y=vn.rotation.y;let l=Math.hypot(e.vx,e.vy);xs.userData.wheels.forEach(h=>{h.rotation.z-=l*3});let c=n*14;ho.userData.legs.forEach((h,u)=>{h.rotation.z=-1.2+Math.sin(c+u*Math.PI)*.5}),ho.userData.arms.forEach(h=>{h.rotation.z=-1.1}),ho.userData.body.rotation.z=-.15,vn.position.x+=Math.cos(e.face)*.3,vn.position.z-=Math.sin(e.face)*.3,Math.random()<.08&&ln.burst("dust",e.x-Math.cos(e.face)*1.1,e.y-Math.sin(e.face)*1.1,1,.1)}else if(i){Xi.position.set(e.x,0,-e.y),Xi.rotation.y=vn.rotation.y;let l=n*20;Xi.userData.legs.forEach((c,h)=>{c.rotation.z=Math.sin(l+(h<2?0:Math.PI)+h%2*.6)*.8}),Xi.userData.body.position.y=Math.abs(Math.sin(l))*.12,vn.position.y+=Xi.userData.body.position.y,Math.random()<.12&&ln.burst("dust",e.x-Math.cos(e.face)*.9,e.y-Math.sin(e.face)*.8,2,.1)}let r=e.moving?n*15:0;t.legs.forEach((l,c)=>{l.rotation.z=e.moving&&!i?Math.sin(r+(c%2?Math.PI:0)+(c>1?Math.PI:0))*.7:0}),t.body.position.y=e.moving?Math.abs(Math.sin(r))*.06:Math.sin(n*2.2)*.012,t.body.rotation.z=e.moving?-.06:0,t.head.rotation.z=Math.sin(n*2.2)*.04,t.head.rotation.y=e.moving?Math.sin(r*.5)*.08:Math.sin(n*.8)*.25,t.bow.rotation.x=Math.sin(n*3)*.1;let a=n%3.4<.12?.12:1;for(let l of t.eyes)l.scale.y=a;zr.material.color.set(e.bless>0?"#ffd35a":"#7fd3ff");let o=e.aim??e.face;t.gun.rotation.y=o-vn.rotation.y,Lr=Math.max(0,Lr-.12),t.barrel.position.x=-Lr*.12,t.flash.material.opacity=Lr,t.flash.scale.setScalar(.6+Lr),vn.visible=!($c>0&&Math.floor(n*24)%2),$c>0&&$c--,zr.visible=e.shields>0||e.bless>0,zr.material.opacity=.16+Math.sin(n*4)*.05,po.position.set(e.x,.03,-e.y),Wr.position.set(e.x,.025,-e.y),Wr.scale.setScalar(e.s.pickup)}function rb(n,e,t){let i=n.userData,s=e.stun>0||e.web>0,r=s?0:e.t*.22;if(i.body.position.y=s?0:Math.abs(Math.sin(r))*.05,i.body.rotation.z=e.stun>0?Math.sin(t*25)*.15:0,i.legs&&i.legs.forEach((c,h)=>{c.rotation.z=s?0:Math.sin(r*1.6+h%2*Math.PI)*.6}),i.arms&&i.arms.forEach((c,h)=>{c.rotation.z=s?0:Math.sin(r*1.6+(h%2?0:Math.PI))*.5}),i.disc&&(i.disc.rotation.z-=s?0:.12,n.rotation.y=0),i.ball&&(i.ball.rotation.z=-(e.roll||0),i.body.position.y=0),i.man&&(n.rotation.y=0,i.man.rotation.z=s?0:Math.sin(r*1.8)*.22,i.body.position.y=s?0:Math.abs(Math.sin(r*1.8))*.12),i.spear&&(i.spear.position.x=e.throwT>0?.1+e.throwT*.02:.1),i.rifle&&(i.rifle.rotation.z=e.mode==="aim"||e.mode==="burst"?0:-.5),e.type==="dingding"&&i.head&&(i.head.rotation.z=Math.sin(t*3+e.id)*.12),e.type==="thief"&&i.arms&&e.skill!=null&&e.skill<20&&i.arms.forEach(c=>{c.rotation.z=-1.4}),i.hinge&&(i.hinge.rotation.z=e.open>0?.65:.06+Math.sin(t*3+e.id)*.06),i.fluff){let c=e.squash?1:1+Math.sin(r*1.3)*.07;i.fluff.scale.set(1/Math.sqrt(c),c,1/Math.sqrt(c))}if(i.sign&&(i.sign.rotation.z=Math.sin(t*4+e.id)*.12),i.sack&&i.sack.scale.setScalar(.8+Math.min(1.2,e.carry*.12)),e.type==="goat"&&(e.mode==="wind"?i.body.rotation.z=.25+Math.sin(t*40)*.05:e.mode==="dash"&&(i.body.rotation.z=-.2)),(e.type==="judge"||e.type==="finaljudge")&&i.arm){let c=e.mode==="slam"||e.mode==="gavel"?1-e.modeT/(e.type==="finaljudge"?70:50):0;i.arm.rotation.z=c?-1.6*c:Math.sin(t*2)*.15}i.cocoon.visible=e.web>0,e.web>0&&(i.cocoon.rotation.y+=.03);let a=Math.min(1,(t-n.userData.born)*4),o=a<1?1-Math.pow(1-a,3)*Math.cos(a*6):1,l=e.flash>0?1+e.flash*.03:1;n.scale.set(o*l,o/l,o*l).multiplyScalar((e.type==="bigmao"?2:e.type==="finaljudge"?1.35:1)*(e.elite?1.35:1))}function ab(n){var A;let e=De.hero,t=new Set;for(let g of De.enemies){t.add(g.id);let M=Br.get(g.id);M||(M=qn(fm(g.type)),M.userData.born=n,Pt.add(M),Br.set(g.id,M)),M.position.set(g.x,g.hop||0,-g.y);let b=g.face??Math.atan2(e.y-g.y,e.x-g.x);g.stun>0||g.web>0||(M.rotation.y=td(M.rotation.y,b,.15)),rb(M,g,n)}for(let[g,M]of Br)t.has(g)||(Pt.remove(M),Br.delete(g));let i=0;for(let g of De.bullets)an.position.set(g.x,.5,-g.y),an.rotation.set(0,Math.atan2(g.vy,g.vx),0),an.scale.setScalar(1),an.updateMatrix(),Wc.setMatrixAt(i++,an.matrix);Wc.count=i,Wc.instanceMatrix.needsUpdate=!0;let s={bolt:0,pearl:0,paper:0,hongbao:0,sausage:0,spear:0};for(let g of De.ebullets){let M=Dr[g.kind]||Dr.bolt,b=g.kind in s?g.kind:"bolt",I=g.kind==="paper"||g.kind==="hongbao";an.position.set(g.x,I?.6+Math.sin(n*6+g.id)*.1:.5,-g.y),an.rotation.set(I?.4:0,g.kind==="spear"?Math.atan2(g.vy,g.vx):I||g.kind==="sausage"?n*8+(g.spin||0):0,g.kind==="sausage"?n*10:0),an.scale.setScalar(g.kind==="spear"?1:1+Math.sin(n*12+g.id)*.1),an.updateMatrix(),M.setMatrixAt(s[b]++,an.matrix)}for(let g in Dr)Dr[g].count=s[g],Dr[g].instanceMatrix.needsUpdate=!0;i=0;for(let g of De.gems)an.position.set(g.x,.22+Math.sin(n*4+g.id)*.06,-g.y),an.rotation.set(0,n*2+g.id,0),an.scale.setScalar(1),an.updateMatrix(),Xc.setMatrixAt(i++,an.matrix);Xc.count=Math.min(i,900),Xc.instanceMatrix.needsUpdate=!0,i=0;for(let g of De.spawns){let M=.7+Math.abs(Math.sin(n*10))*.5;an.position.set(g.x,.05,-g.y),an.rotation.set(0,0,0),an.scale.setScalar(M*(g.type==="judge"||g.type==="bigmao"?3:1)),an.updateMatrix(),Yc.setMatrixAt(i++,an.matrix)}Yc.count=i,Yc.instanceMatrix.needsUpdate=!0;let r=new Set;for(let g of De.zones){r.add(g.id);let M=Or.get(g.id);M||(M=QM(g.kind),Or.set(g.id,M)),M.position.set(g.x,0,-g.y),M.scale.setScalar(g.r);let b=1-g.t/g.T;M.userData.fill.scale.setScalar(Math.max(.01,b)),M.userData.edge.material.opacity=.5+Math.abs(Math.sin(n*12))*.5}for(let[g,M]of Or)r.has(g)||(Pt.remove(M),Or.delete(g));let a=new Set;for(let g of De.bombs){a.add(g.id);let M=kr.get(g.id);M||(M=qn(VM),Pt.add(M),kr.set(g.id,M)),M.position.set(g.x,0,-g.y),M.userData.led.visible=Math.floor(n*(g.t<30?16:5))%2===0}for(let[g,M]of kr)a.has(g)||(Pt.remove(M),kr.delete(g));let o=De.orbiters||[],l=o.filter(g=>g.kind==="wind"),c=o.filter(g=>g.kind==="dahong");Gr(Ku,mm,l.length),l.forEach((g,M)=>{let b=Ku[M];b.position.set(g.x,0,-g.y),b.userData.rings.forEach((I,y)=>{I.rotation.z=n*(6+y)*(y%2?1:-1),I.position.x=Math.sin(n*5+y)*.06*y}),b.userData.leaves.forEach((I,y)=>{let E=n*7+y*1.3;I.position.set(Math.cos(E)*(.3+y*.1),.3+y*.25,Math.sin(E)*(.3+y*.1)),I.rotation.set(E,E*2,0)})}),Gr(ju,gm,c.length),c.forEach((g,M)=>{let b=ju[M];b.position.set(g.x,0,-g.y),b.userData.box.rotation.set(n*2,n*3,0)});let h=o.filter(g=>g.visual==="turtle");Gr(Qu,nd,h.length),h.forEach((g,M)=>{let b=Qu[M];b.position.set(g.x,0,-g.y),b.rotation.y=n*2,b.scale.setScalar(.5)});let u=De.bull;if(Ai.visible=!!u,u){Ai.position.set(u.x,0,-u.y);let g=Math.hypot(u.vx,u.vy);g>.01&&(Ai.rotation.y=td(Ai.rotation.y,Math.atan2(u.vy,u.vx),.2));let M=n*(u.mode==="charge"?22:12);Ai.userData.legs.forEach((b,I)=>{b.rotation.z=g>.02?Math.sin(M+(I<2?0:Math.PI)+I%2*.5)*.7:0}),Ai.userData.body.rotation.z=u.mode==="charge"?-.12:0,Ai.userData.body.position.y=g>.02?Math.abs(Math.sin(M))*.1:0}let d=new Set;for(let g of De.enemies){if(!g.elite)continue;d.add(g.id);let M=Nr.get(g.id);M||(M=new pe(WM,new It({color:XM[g.elite],transparent:!0,opacity:.9,blending:sn,depthWrite:!1})),Pt.add(M),Nr.set(g.id,M)),M.position.set(g.x,.06+(g.hop||0),-g.y),M.scale.setScalar(g.r*(1.25+Math.sin(n*6)*.08)),M.rotation.y=n*2,Math.random()<.15&&ln.burst(g.elite==="tough"?"web":"gold",g.x,g.y,1,.2)}for(let[g,M]of Nr)d.has(g)||(Pt.remove(M),Nr.delete(g));let f=new Set;for(let g of De.pickups){f.add(g.id);let M=Ur.get(g.id);M||(M=qn(Yu[A=g.kind]||(Yu[A]=ti(qp(g.kind)))),M.userData.born=n,Pt.add(M),Ur.set(g.id,M)),M.position.set(g.x,0,-g.y);let b=Math.min(1,(n-M.userData.born)*3);M.userData.icon.position.y=.75+Math.sin(n*3+g.id)*.12,M.userData.icon.rotation.y=n*1.6,M.userData.icon.scale.setScalar(b),M.userData.beam.material.opacity=.12+Math.sin(n*4)*.05,M.userData.ring.scale.setScalar(1+Math.sin(n*5)*.08),M.visible=g.t>180||Math.floor(n*8)%2===0}for(let[g,M]of Ur)f.has(g)||(Pt.remove(M),Ur.delete(g));let m=De.stampede,v=m?m.bulls.length:0;for(;uo.length<v;){let g=qn(pm);Pt.add(g),uo.push(g)}uo.forEach((g,M)=>{if(g.visible=M<v,M>=v)return;g.position.set(m.x+M%2*.6*-m.dir,0,-(m.y+m.bulls[M])),g.rotation.y=m.dir>0?0:Math.PI;let b=n*22+M;g.userData.legs.forEach((I,y)=>{I.rotation.z=Math.sin(b+(y<2?0:Math.PI))*.8}),g.userData.body.position.y=Math.abs(Math.sin(b))*.12,g.userData.body.rotation.z=-.12,Math.random()<.3&&ln.burst("dust",m.x,m.y+m.bulls[M],2,.1)});let x=new Set;for(let g of De.tides){x.add(g.id);let M=Fr.get(g.id);M||(M=YM(g.friendly),Fr.set(g.id,M));let b=g.warn>0;M.position.set(b?-g.dir*(Pe-.6):g.x,0,0),M.userData.wall.visible=!b,M.userData.wall.material.uniforms.uTime.value=n,M.userData.floor.material.opacity=b?.15+Math.abs(Math.sin(n*8))*.3:.35,!b&&Math.random()<.8&&ln.burst("web",g.x,(Math.random()*2-1)*nt,2,.3)}for(let[g,M]of Fr)x.has(g)||(Pt.remove(M),Fr.delete(g));let p=De.enemies.filter(g=>g.type==="chenwei"&&g.mode==="aim");for(;qc.length<p.length;){let g=new pe(ZM,$M);Pt.add(g),qc.push(g)}qc.forEach((g,M)=>{if(g.visible=M<p.length,M>=p.length)return;let b=p[M],I=b.aimX-b.x,y=b.aimY-b.y;g.position.set(b.x,.95,-b.y),g.rotation.y=Math.atan2(y,I),g.scale.set(Math.hypot(I,y)+2,1,1)});let S=De.hubbyRun;if(Wi.visible=!!S,S){Wi.position.set(S.x,0,-S.y),Wi.rotation.y=S.dir>0?0:Math.PI;let g=n*26;Wi.userData.legs.forEach((M,b)=>{M.rotation.z=Math.sin(g+b*Math.PI)*.9}),Wi.userData.arms.forEach((M,b)=>{M.rotation.z=Math.sin(g+(b?0:Math.PI))*1.1}),Wi.userData.body.rotation.z=-.25,Math.random()<.6&&ln.burst("dust",S.x-S.dir*.4,S.y,2,.1)}}function ob(n){fo.visible=!0,vn.position.set(0,0,0),vn.rotation.y=n*.6;let e=vn.userData;e.body.position.y=Math.abs(Math.sin(n*3))*.12,e.legs.forEach((t,i)=>{t.rotation.z=Math.sin(n*6+i%2*Math.PI)*.5}),e.gun.rotation.y=Math.sin(n)*.8,e.head.rotation.y=Math.sin(n*.9)*.4,vn.visible=!0,zr.visible=!1,po.visible=Wr.visible=!1;for(let t of fo.children){let i=t.userData.phase;t.userData.body.position.y=Math.abs(Math.sin(n*3+i))*.18,t.userData.legs&&t.userData.legs.forEach((s,r)=>{s.rotation.z=Math.sin(n*6+i+r%2*Math.PI)*.4}),t.userData.arms&&t.userData.arms.forEach((s,r)=>{s.rotation.z=Math.sin(n*5+i+r%2*Math.PI)*.8}),t.userData.hinge&&(t.userData.hinge.rotation.z=.1+Math.abs(Math.sin(n*2))*.4),t.userData.disc&&(t.userData.disc.rotation.z=-n*3),(t.userData.disc||t.userData.man)&&(t.rotation.y=Math.atan2(Un.position.x-t.position.x,Un.position.z-t.position.z))}}var Jc=null;function _m(n){if(Yt.show(n),n!=="title"&&(mo.hidden=!0),cn.active=!1,Os.hidden=!0,n==="title"){eb(),Yt.clearLabels(),Rn.setDay(.35,!0),Rn.setSnow(!1),Vi({on:!0,calm:!0}),Ai.visible=Wi.visible=Xi.visible=xs.visible=!1,uo.forEach(e=>{e.visible=!1}),Gr(Ku,mm,0),Gr(ju,gm,0),Gr(Qu,nd,0);for(let e of[Wc,Xc,Yc,...Object.values(Dr)])e.count=0}else fo.visible=!1,po.visible=Wr.visible=!0;n==="pick"&&(Yt.resetPick(),Vi({on:!0,calm:!0,wave:De.wave})),n==="play"&&Jc==="pick"&&Vi({on:!0,wave:De.wave,boss:De.bossWave}),n==="pause"&&Vi({on:!1}),n==="play"&&Jc==="pause"&&Vi({on:!0,wave:De.wave,boss:De.bossWave}),n==="over"&&(jc(),Yt.renderOver(De),Vi({on:!1})),n==="win"&&(jc(),Yt.renderWin(De),Vi({on:!0,calm:!0}),ln.burst("gold",De.hero.x,De.hero.y,80)),Jc=n}function lb(){for(let n of De.events)switch(n.type){case"sfx":Xu(n.name);break;case"voice":om(n.text);break;case"pop":Yt.pop(n.x,n.y,n.text,n.cls);break;case"dmg":Yt.dmg(n.x,n.y,n.n,n.crit);break;case"burst":ln.burst(n.kind,n.x,n.y,n.n);break;case"ring":ln.ring(n.x,n.y,n.r,n.kind);break;case"shake":on.shake=Math.max(on.shake,n.amt);break;case"hurt":Yt.hurtFlash(),Rn.hurt(),$c=36;break;case"flashbang":Rn.flash(1),Yt.toast("\u95EA\u5149\u5F39\uFF01","warn");break;case"hitstop":Qc=Math.max(Qc,n.frames);break;case"streak":Yt.streak(n.text,n.n,n.tier),Rn.flash(.12);break;case"pickup":Yt.toast("\u62FE\u53D6 \xB7 "+n.text,"pickup",Hu[n.kind]),ln.ring(n.x,n.y,2.2,"voice");break;case"elite":Yt.toast(n.name+" \u51FA\u73B0\u4E86\uFF01","elite"),on.zoom=1.1;break;case"eliteDown":ln.burst("gold",n.x,n.y,50),ln.ring(n.x,n.y,3,"boom");break;case"tideWarn":Yt.banner("\u6F6E\u6C50\u6765\u4E86\uFF01",n.dir>0?"\u4ECE\u5DE6\u8FB9\u51B2\u8FC7\u6765 \u2192":"\u2190 \u4ECE\u53F3\u8FB9\u51B2\u8FC7\u6765",!1);break;case"stampede":Yt.toast("\u767D\u725B\u51B2\u950B\uFF01","pickup","#ffffff");break;case"waveEnd":Rn.flash(.25);break;case"lootSweep":Yt.toast(`\u81EA\u52A8\u62FE\u53D6 ${n.gems} \u9897\u7CD6\u679C${n.supplies?` \xB7 ${n.supplies} \u4E2A\u8865\u7ED9`:""}`,"pickup");break;case"cleanup":Yt.banner("\u6E05\u573A","\u6253\u5B8C\u573A\u4E0A\u7684\u654C\u4EBA\uFF0C\u518D\u9009\u6D77\u514B\u65AF");break;case"fire":Lr=1;break;case"ult":ln.superSpider(n.x,n.y,n.range),on.zoom=1.18;break;case"bossPhase":Yt.banner("\u7EC8\u5BA1 \xB7 \u7B2C "+(n.n+1)+" \u9636\u6BB5","\u8EB2\u5F00\u9884\u8B66\uFF0C\u6293\u4F4F\u7A7A\u9699\u53CD\u51FB",!0);break;case"bossTell":Yt.toast({slam:"\u91CD\u9524\u843D\u5730\uFF01\u79BB\u5F00\u7EA2\u5708",papers:"\u5224\u51B3\u4E66\u5F39\u5E55\uFF01\u627E\u7A7A\u9699",gavel:"\u6CD5\u69CC\u8FDE\u51FB\uFF01\u6301\u7EED\u79FB\u52A8"}[n.move],"boss");break;case"meteor":ln.meteor(n.x,n.y,n.t);break;case"horse":ln.burst("dust",De.hero.x,De.hero.y,20);break;case"wave":Yt.banner(n.boss?"BOSS":`\u7B2C ${n.n} \u6CE2`,zM[n.n],n.boss),Rn.setDay((n.n-1)/13),Rn.setSnow(n.n===5),Vi({on:!0,wave:n.n,boss:n.boss});break;case"levelup":ln.burst("gold",De.hero.x,De.hero.y,30),ln.ring(De.hero.x,De.hero.y,1.6,"star"),Yt.pop(De.hero.x,De.hero.y,"\u5347\u7EA7\uFF01","big"),Yt.toast(`Lv ${n.lvl} \xB7 ${n.text}`,"level");break;case"shieldBreak":ln.burst("web",De.hero.x,De.hero.y,20);break;case"boss":on.zoom=1.25;break}De.events.length=0}var Kc=Hr?0:2,Vc=0,Ju=0;function cb(n){De.state==="play"&&(n>1/40?Vc++:n<1/58&&Ju++,!(Vc+Ju<120)&&(Vc>60&&Kc>(Hr?-1:0)&&(Kc--,Rn.setQuality(Kc),eh()),Vc=Ju=0))}function eh(){Rn.resize(),ln.setScale(kM.domElement.height/(2*Math.tan(Dn.degToRad(Un.fov/2))))}addEventListener("resize",eh);eh();var lm=performance.now(),co=0,Qc=0,cm=0,hm=0,um=0;function vm(n){requestAnimationFrame(vm);let e=Math.min(.1,(n-lm)/1e3);lm=n;let t=n/1e3;co+=e;let i=0;for(;co>=1/wi&&i<4;){if(Qc>0){Qc--,co-=1/wi,i++;continue}let s=nb();Dp(De,{...s,pressed:{...Zc}});for(let r in Zc)delete Zc[r];co-=1/wi,i++,De.state!==Jc&&_m(De.state),lb()}i===4&&(co=0),cb(e),on.zoom+=(1-on.zoom)*(1-Math.exp(-e*1.5)),De.state==="title"?ob(t):De.hero&&(sb(t),ab(t)),De.state==="pick"&&De.offer&&Yt.renderPick(De,s=>{Mn("pick",s)}),De.hero&&De.state!=="title"&&(!Hr||n-cm>=100)&&(Yt.hud(De),cm=n),(!Hr||n-hm>=33)&&(Yt.updateLabels(De),hm=n),ln.update(),Rn.update(t,e),ib(t,e),(!Hr||n-um>=33)&&(Rn.render(),um=n)}_m("title");ni("startBtn").disabled=!1;ni("startBtn").textContent="\u5F00\u59CB";requestAnimationFrame(vm);window.__xo={g:De,ENEMY_NAMES:ps,setQuality:n=>{Kc=n,Rn.setQuality(n),eh()}};})();
