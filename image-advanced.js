// Editable, canvas-local effects. Strokes are stored in normalized layer coordinates.
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

function strokePath(context,stroke,width,height){
 const points=stroke.points||[];
 if(!points.length)return;
 context.beginPath();
 context.lineCap=context.lineJoin='round';
 context.lineWidth=Math.max(1,Number(stroke.width||12)*width/Math.max(1,stroke.layerWidth||width));
 const first=points[0];
 if(points.length===1){context.arc(first.x*width,first.y*height,context.lineWidth/2,0,Math.PI*2);context.fill();return;}
 context.moveTo(first.x*width,first.y*height);
 for(const point of points.slice(1))context.lineTo(point.x*width,point.y*height);
 context.stroke();
}

export function applyLayerMask(context,layer,canvas,left,top,drawWidth,drawHeight){
 const strokes=[...(layer.eraseStrokes||[]).map(stroke=>({...stroke,mode:'hide'})),...(layer.maskStrokes||[])];
 if(!strokes.length)return;
 const mask=document.createElement('canvas');mask.width=canvas.width;mask.height=canvas.height;
 const m=mask.getContext('2d');m.fillStyle='#fff';m.fillRect(0,0,mask.width,mask.height);
 m.translate(layer.x-left,layer.y-top);m.rotate(layer.angle*Math.PI/180);m.scale(layer.scale,layer.scale);
 m.translate(-drawWidth/2,-drawHeight/2);
 for(const stroke of strokes){m.globalCompositeOperation=stroke.mode==='reveal'?'source-over':'destination-out';m.fillStyle=m.strokeStyle='#fff';strokePath(m,stroke,drawWidth,drawHeight);}
 context.save();context.setTransform(1,0,0,1,0,0);context.globalCompositeOperation='destination-in';context.drawImage(mask,0,0);context.restore();
}

function paintStrokeMask(stroke,width,height){
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const context=canvas.getContext('2d',{willReadFrequently:true});context.fillStyle=context.strokeStyle='#fff';
 strokePath(context,stroke,width,height);
 return context.getImageData(0,0,width,height).data;
}

function paintSoftStrokeMask(stroke,width,height){
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const context=canvas.getContext('2d',{willReadFrequently:true}),points=stroke.points||[];
 if(!points.length)return context.getImageData(0,0,width,height).data;
 const radius=Math.max(1,Number(stroke.width||12)*width/Math.max(1,stroke.layerWidth||width)/2);
 const stamp=(x,y)=>{const gradient=context.createRadialGradient(x,y,radius*.25,x,y,radius);gradient.addColorStop(0,'rgba(255,255,255,1)');gradient.addColorStop(1,'rgba(255,255,255,0)');context.fillStyle=gradient;context.fillRect(x-radius,y-radius,radius*2,radius*2);};
 stamp(points[0].x*width,points[0].y*height);
 for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=(b.x-a.x)*width,dy=(b.y-a.y)*height,steps=Math.min(80,Math.max(1,Math.ceil(Math.hypot(dx,dy)/Math.max(2,radius*.35))));for(let step=1;step<=steps;step++)stamp(a.x*width+dx*step/steps,a.y*height+dy*step/steps);}
 return context.getImageData(0,0,width,height).data;
}

export function applyPaintedCorrections(image,layer){
 const {data,width,height}=image;
 for(const stroke of layer.localStrokes||[]){
  const mask=paintStrokeMask(stroke,width,height),brightness=Number(stroke.brightness||0)*2.55,temperature=Number(stroke.temperature||0)*1.1;
  for(let i=0;i<data.length;i+=4){const amount=mask[i+3]/255;if(!amount||!data[i+3])continue;
   data[i]=clamp(data[i]+(brightness+temperature)*amount,0,255);
   data[i+1]=clamp(data[i+1]+(brightness+temperature*.12)*amount,0,255);
   data[i+2]=clamp(data[i+2]+(brightness-temperature)*amount,0,255);
  }
 }
 for(const stroke of layer.healStrokes||[]){
  const mask=paintSoftStrokeMask(stroke,width,height),original=new Uint8ClampedArray(data);
  const start=stroke.points?.[0];if(!start)continue;
  const source=stroke.source||{x:clamp(start.x+(stroke.width||12)*1.5/Math.max(1,stroke.layerWidth||width),0,1),y:start.y};
  const offsetX=Math.round((source.x-start.x)*width),offsetY=Math.round((source.y-start.y)*height);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
   const i=(y*width+x)*4,amount=mask[i+3]/255*.92;
   if(!amount)continue;const sx=x+offsetX,sy=y+offsetY;if(sx<0||sy<0||sx>=width||sy>=height)continue;
   const sourceIndex=(sy*width+sx)*4;
   for(let channel=0;channel<4;channel++)data[i+channel]=original[i+channel]* (1-amount)+original[sourceIndex+channel]*amount;
  }
 }
 return image;
}

const DEFAULT_CORNERS=[[-1,-1],[1,-1],[1,1],[-1,1]];
export function perspectiveCorners(layer){return Array.isArray(layer.perspectiveCorners)&&layer.perspectiveCorners.length===4?layer.perspectiveCorners:DEFAULT_CORNERS;}
export function isValidPerspective(corners){
 if(!Array.isArray(corners)||corners.length!==4||corners.some(point=>!Array.isArray(point)||point.length!==2||point.some(value=>!Number.isFinite(value)||Math.abs(value)>4)))return false;
 let sign=0;for(let i=0;i<4;i++){const a=corners[i],b=corners[(i+1)%4],c=corners[(i+2)%4],cross=(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);if(Math.abs(cross)<.02)return false;if(sign&&Math.sign(cross)!==sign)return false;sign=Math.sign(cross);}return true;
}
export function pointInPerspective(x,y,width,height,layer){const corners=perspectiveCorners(layer);let sign=0;for(let i=0;i<4;i++){const a=corners[i],b=corners[(i+1)%4],cross=(b[0]-a[0])*(2*y/height-a[1])-(b[1]-a[1])*(2*x/width-a[0]);if(Math.abs(cross)<.01)continue;if(sign&&Math.sign(cross)!==sign)return false;sign=Math.sign(cross);}return true;}

function bilinear(corners,u,v,width,height){const [a,b,c,d]=corners,top=1-v,bottom=v,left=1-u,right=u;return {x:(a[0]*left*top+b[0]*right*top+c[0]*right*bottom+d[0]*left*bottom)*width/2,y:(a[1]*left*top+b[1]*right*top+c[1]*right*bottom+d[1]*left*bottom)*height/2};}
function triangle(context,image,vertices,uv){
 const [p,q,r]=vertices,[a,b,c]=uv,det=(b.u-a.u)*(c.v-a.v)-(c.u-a.u)*(b.v-a.v);
 if(Math.abs(det)<1e-8)return;
 const A=((q.x-p.x)*(c.v-a.v)-(r.x-p.x)*(b.v-a.v))/det;
 const C=((r.x-p.x)*(b.u-a.u)-(q.x-p.x)*(c.u-a.u))/det;
 const B=((q.y-p.y)*(c.v-a.v)-(r.y-p.y)*(b.v-a.v))/det;
 const D=((r.y-p.y)*(b.u-a.u)-(q.y-p.y)*(c.u-a.u))/det;
 context.save();context.beginPath();context.moveTo(p.x,p.y);context.lineTo(q.x,q.y);context.lineTo(r.x,r.y);context.closePath();context.clip();
 context.transform(A,B,C,D,p.x-A*a.u-C*a.v,p.y-B*a.u-D*a.v);
 const u0=Math.min(a.u,b.u,c.u),v0=Math.min(a.v,b.v,c.v),u1=Math.max(a.u,b.u,c.u),v1=Math.max(a.v,b.v,c.v);
 context.drawImage(image,u0*image.width,v0*image.height,(u1-u0)*image.width,(v1-v0)*image.height,u0,v0,u1-u0,v1-v0);context.restore();
}
export function drawPerspectiveImage(context,image,width,height,layer){
 const corners=perspectiveCorners(layer),steps=12;
 for(let y=0;y<steps;y++)for(let x=0;x<steps;x++){
  const u=x/steps,v=y/steps,u1=(x+1)/steps,v1=(y+1)/steps;
  const a={u,v},b={u:u1,v},c={u:u1,v:v1},d={u,v:v1};
  const pa=bilinear(corners,u,v,width,height),pb=bilinear(corners,u1,v,width,height),pc=bilinear(corners,u1,v1,width,height),pd=bilinear(corners,u,v1,width,height);
  triangle(context,image,[pa,pb,pc],[a,b,c]);triangle(context,image,[pa,pc,pd],[a,c,d]);
 }
}
