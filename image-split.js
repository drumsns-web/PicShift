// Split an image layer with an infinite straight line drawn in canvas coordinates.
function inBitmap(layer,point){const angle=-layer.angle*Math.PI/180,dx=(point.x-layer.x)/layer.scale,dy=(point.y-layer.y)/layer.scale,x=dx*Math.cos(angle)-dy*Math.sin(angle),y=dx*Math.sin(angle)+dy*Math.cos(angle);return {x:(x/layer.w+.5)*layer.bitmap.width,y:(y/layer.h+.5)*layer.bitmap.height};}
function clipHalf(points,a,b,sign){const distance=p=>sign*((b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x)),result=[];for(let i=0;i<points.length;i++){const start=points[i],end=points[(i+1)%points.length],d1=distance(start),d2=distance(end),inside1=d1>=0,inside2=d2>=0;if(inside1)result.push(start);if(inside1!==inside2){const k=d1/(d1-d2);result.push({x:start.x+(end.x-start.x)*k,y:start.y+(end.y-start.y)*k});}}return result;}
function hasPixels(canvas){const pixels=canvas.getContext('2d',{willReadFrequently:true}).getImageData(0,0,canvas.width,canvas.height).data;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>0)return true;return false;}

// Keep each cut piece's editable bounds close to its visible pixels.
export async function trimSplitImagePart(bitmap){
 const canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0);
 const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;let left=canvas.width,top=canvas.height,right=-1,bottom=-1;
 for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++)if(pixels[(y*canvas.width+x)*4+3]>0){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
 if(right<left)throw Error('分割後の画像が空になりました。別の位置に線を引いてください。');
 const width=right-left+1,height=bottom-top+1;return {bitmap:await createImageBitmap(canvas,left,top,width,height),left,top,width,height,sourceWidth:canvas.width,sourceHeight:canvas.height};
}

export async function splitImageLayer(layer,from,to){
 if(layer.kind!=='image'||!layer.bitmap||!Number.isFinite(layer.scale)||layer.scale<=0)throw Error('画像を選択してから分割してください。');
 const a=inBitmap(layer,from),b=inBitmap(layer,to),width=layer.bitmap.width,height=layer.bitmap.height;
 if(Math.hypot(a.x-b.x,a.y-b.y)<4)throw Error('線をもう少し長く引いてください。');
 const rectangle=[{x:0,y:0},{x:width,y:0},{x:width,y:height},{x:0,y:height}],parts=[];
 try{for(const sign of [1,-1]){
  const polygon=clipHalf(rectangle,a,b,sign);if(polygon.length<3)throw Error('画像を横切る線を引いてください。');
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.beginPath();ctx.moveTo(polygon[0].x,polygon[0].y);for(const point of polygon.slice(1))ctx.lineTo(point.x,point.y);ctx.closePath();ctx.clip();ctx.drawImage(layer.bitmap,0,0);if(!hasPixels(canvas))throw Error('画像の両側に内容が残る位置で線を引いてください。');parts.push(await createImageBitmap(canvas));
 }}catch(error){for(const bitmap of parts)bitmap.close();throw error;}
 return parts;
}
