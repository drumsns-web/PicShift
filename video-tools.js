// Local, dependency-free video effects and generated sound effects.
const buffers=new WeakMap();
export function hasLayerEffects(s={}){return !!(s.flipX||s.flipY||s.mask&&s.mask!=='none'||s.chroma||s.temperature||s.vignette);}
export function layerFrame(source,s={},maxSize=1280){
 if(!hasLayerEffects(s))return source;
 const iw=source.videoWidth||source.width,ih=source.videoHeight||source.height;
 if(!iw||!ih)return source;
 const scale=Math.min(1,maxSize/Math.max(iw,ih)),w=Math.max(1,Math.round(iw*scale)),h=Math.max(1,Math.round(ih*scale));
 let b=buffers.get(source);if(!b){b={image:document.createElement('canvas'),mask:document.createElement('canvas')};buffers.set(source,b);}
 const c=b.image;if(c.width!==w||c.height!==h){c.width=w;c.height=h;}
 const ctx=c.getContext('2d',{willReadFrequently:true});ctx.clearRect(0,0,w,h);ctx.save();ctx.translate(s.flipX?w:0,s.flipY?h:0);ctx.scale(s.flipX?-1:1,s.flipY?-1:1);ctx.drawImage(source,0,0,w,h);ctx.restore();
 if(s.chroma){const hex=s.keyColor||'#00ff00',rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)),pixels=ctx.getImageData(0,0,w,h),a=pixels.data,tolerance=(s.keyTolerance??25)*4.42,soft=Math.max(1,(s.keySoftness??10)*2.55);for(let i=0;i<a.length;i+=4){const d=Math.hypot(a[i]-rgb[0],a[i+1]-rgb[1],a[i+2]-rgb[2]);a[i+3]*=Math.max(0,Math.min(1,(d-tolerance)/soft));}ctx.putImageData(pixels,0,0);}
 if(s.temperature){ctx.save();ctx.globalCompositeOperation='source-atop';ctx.globalAlpha=Math.min(.35,Math.abs(s.temperature)/285);ctx.fillStyle=s.temperature>0?'#ff9c45':'#459aff';ctx.fillRect(0,0,w,h);ctx.restore();}
 if(s.vignette){const g=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.2,w/2,h/2,Math.hypot(w,h)/2);g.addColorStop(0,'#0000');g.addColorStop(1,`rgba(0,0,0,${s.vignette/100})`);ctx.save();ctx.globalCompositeOperation='source-atop';ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.restore();}
 if(s.mask&&s.mask!=='none'){const m=b.mask;m.width=w;m.height=h;const mc=m.getContext('2d'),x=w*(s.maskX??50)/100,y=h*(s.maskY??50)/100,mw=w*(s.maskWidth??75)/100,mh=h*(s.maskHeight??75)/100;mc.save();mc.translate(x,y);mc.rotate((s.maskRotation||0)*Math.PI/180);mc.fillStyle='#fff';mc.filter=`blur(${(s.maskFeather||0)*Math.min(w,h)/500}px)`;mc.beginPath();if(s.mask==='circle')mc.ellipse(0,0,mw/2,mh/2,0,0,Math.PI*2);else if(s.mask==='split')mc.rect(-w*2,-h*2,w*4,h*2);else mc.rect(-mw/2,-mh/2,mw,mh);mc.fill();mc.restore();ctx.save();ctx.globalCompositeOperation=s.maskInvert?'destination-out':'destination-in';ctx.drawImage(m,0,0);ctx.restore();}
 return c;
}
export function makeSoundEffect(kind){
 const rate=22050,duration=kind==='whoosh'?.7:kind==='chime'?1.2:kind==='pop'?.18:.35,n=Math.ceil(rate*duration),bytes=new ArrayBuffer(44+n*2),v=new DataView(bytes);const str=(o,s)=>[...s].forEach((c,i)=>v.setUint8(o+i,c.charCodeAt(0)));str(0,'RIFF');v.setUint32(4,36+n*2,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,n*2,true);let noise=0;for(let i=0;i<n;i++){const t=i/rate,p=t/duration;let value;if(kind==='whoosh'){noise=.75*noise+.25*(Math.random()*2-1);value=noise*Math.sin(Math.PI*p)*1.6;}else if(kind==='chime')value=(Math.sin(2*Math.PI*880*t)+.4*Math.sin(2*Math.PI*1320*t))*Math.exp(-5*p)*.38;else if(kind==='pop')value=Math.sin(2*Math.PI*(380*t-500*t*t))*Math.exp(-12*p)*.7;else value=Math.sin(2*Math.PI*660*t)*Math.min(1,t/.008)*Math.exp(-8*p)*.5;v.setInt16(44+i*2,Math.max(-32767,Math.min(32767,Math.round(value*32767))),true);}return new Blob([bytes],{type:'audio/wav'});
}

// Read the video track's MP4/MOV timing table without uploading or decoding the file.
export async function detectSourceFrameRate(file){
 const name=(bytes,at)=>String.fromCharCode(...bytes.subarray(at,at+4));
 const box=(view,at,end)=>{if(at+8>end)return null;let size=view.getUint32(at),head=8;if(size===1){if(at+16>end)return null;const large=view.getBigUint64(at+8);if(large>BigInt(Number.MAX_SAFE_INTEGER))return null;size=Number(large);head=16;}else if(size===0)size=end-at;if(size<head||at+size>end)return null;return {type:name(new Uint8Array(view.buffer,view.byteOffset,view.byteLength),at+4),start:at+head,end:at+size,next:at+size};};
 const child=(view,start,end,type)=>{for(let at=start;at+8<=end;){const item=box(view,at,end);if(!item)return null;if(item.type===type)return item;at=item.next;}return null;};
 try{
  for(let at=0;at+8<=file.size;){const header=new DataView(await file.slice(at,at+16).arrayBuffer());if(header.byteLength<8)break;let size=header.getUint32(0),head=8;const type=name(new Uint8Array(header.buffer),4);if(size===1){if(header.byteLength<16)break;const large=header.getBigUint64(8);if(large>BigInt(Number.MAX_SAFE_INTEGER))break;size=Number(large);head=16;}else if(size===0)size=file.size-at;if(size<head||at+size>file.size)break;
   if(type==='moov'&&size<=32*1024*1024){const view=new DataView(await file.slice(at,at+size).arrayBuffer());const root=box(view,0,view.byteLength);if(!root)return null;
    for(let pos=root.start;pos+8<=root.end;){const trak=box(view,pos,root.end);if(!trak)break;pos=trak.next;if(trak.type!=='trak')continue;
     const mdia=child(view,trak.start,trak.end,'mdia');if(!mdia)continue;const hdlr=child(view,mdia.start,mdia.end,'hdlr'),mdhd=child(view,mdia.start,mdia.end,'mdhd'),minf=child(view,mdia.start,mdia.end,'minf');if(!hdlr||!mdhd||!minf||hdlr.start+12>hdlr.end||name(new Uint8Array(view.buffer),hdlr.start+8)!=='vide')continue;
     const timescaleAt=mdhd.start+(view.getUint8(mdhd.start)===1?20:12);if(timescaleAt+4>mdhd.end)continue;const timescale=view.getUint32(timescaleAt);const stbl=child(view,minf.start,minf.end,'stbl'),stts=stbl&&child(view,stbl.start,stbl.end,'stts');if(!timescale||!stts||stts.start+8>stts.end)continue;
     const entries=view.getUint32(stts.start+4);let samples=0,ticks=0,minDelta=Infinity,maxDelta=0,entryAt=stts.start+8;for(let i=0;i<entries&&entryAt+8<=stts.end;i++,entryAt+=8){const count=view.getUint32(entryAt),delta=view.getUint32(entryAt+4);if(!count||!delta)continue;samples+=count;ticks+=count*delta;minDelta=Math.min(minDelta,delta);maxDelta=Math.max(maxDelta,delta);}const fps=samples*timescale/ticks;if(Number.isFinite(fps)&&fps>=5&&fps<=240)return {fps:Math.round(fps*100)/100,variable:maxDelta/minDelta>1.05};
    }
    return null;
   }
   at+=size;
  }
 }catch{}
 return null;
}
