// Built-in material sheets are shared with every editor user.
// Sheet coordinates use a common 1824 x 1368 preview grid unless size is specified.
export const materialSheets={
  selectedBubbles:{group:'吹き出し',filename:'selected-bubbles-13-22.jpg',asset:'assets/selected-bubbles-13-22.jpg',size:[1824,1361]},
  inkBrush:{group:'墨ブラシ',filename:'ink-strokes-950536.png',asset:'assets/ink-strokes-950536.png',size:[1601,1201]},
  outline:{group:'吹き出し',filename:'27682106.png',asset:'assets/speech-bubbles-outline-27682106.png'},
  shadow:{group:'影つき',filename:'27682272.png',asset:'assets/speech-bubbles-shadow-27682272.png'},
  comic:{group:'まんが',filename:'23365763.png',asset:'assets/speech-bubbles-23365763.png'},
  handdrawn:{group:'手描き',filename:'handdrawn-bubbles-clean.png',asset:'assets/handdrawn-bubbles-clean.png',size:[1374,1145]},
  ink:{group:'墨の質感',filename:'23097143.png',asset:'assets/ink-painting-23097143.png'},
  sounds:{group:'オノマトペ',filename:'IMG_6685.jpg',asset:'assets/onomatopoeia-6685.jpg',size:[1290,715],whiteToAlpha:true},
  soundEffects:{group:'効果つき',filename:'IMG_6684.JPG',asset:'assets/onomatopoeia-effects-6684.jpg',size:[640,358],whiteToAlpha:true},
  speedSix:{group:'集中線',filename:'IMG_6686.JPG',asset:'assets/speed-lines-six-6686.jpg',size:[640,358],whiteToAlpha:true},
  speedTwenty:{group:'集中線・追加',filename:'IMG_6687.JPG',asset:'assets/speed-lines-twenty-6687.jpg',size:[640,358],whiteToAlpha:true}
};
const item=(id,label,group,sheet,x,y,w,h)=>({id,label,group,sheet,rect:[x,y,w,h]});
const inkBrushRects=[
  [33,77,422,83],[536,80,302,99],[918,73,315,123],[1295,47,258,128],
  [37,241,414,77],[532,239,311,103],[918,300,315,107],[1304,290,240,136],
  [22,399,444,86],[525,401,325,120],[929,512,294,91],[1288,541,271,166],
  [29,565,430,91],[526,580,322,124],[930,716,320,85],[1303,822,242,118],
  [29,737,429,78],[497,764,380,102],[927,897,329,91],[1299,1055,250,126],
  [23,896,442,99],[503,926,369,92],[928,1076,326,101],
  [25,1076,438,97],[486,1077,403,86]
];
// Some letters and decorative marks cross the original row guides. Keep each crop
// clear of the adjacent word while preserving the complete intended glyph.
const soundCropBounds={
  '3-4':[210,287],'3-5':[210,290],
  '4-3':[308,376],'4-4':[308,375],'4-5':[298,374],
  '5-4':[389,456],'5-5':[389,455],
  '6-4':[470,539],'6-5':[470,539],
  '7-2':[556,626],'7-3':[556,627],'7-4':[547,625],'7-6':[556,625],
  '8-2':[635,713],'8-3':[636,713],'8-4':[631,713],'8-6':[637,713]
};
const legacyMaterials=[
  ...inkBrushRects.map(([x,y,w,h],index)=>item('ink-brush-'+(index+1),'筆跡 '+String(index+1).padStart(2,'0'),'墨ブラシ','inkBrush',x,y,w,h)),
  item('outline-cloud','もくもく','吹き出し','outline',80,60,404,264),
  item('outline-thought','考えごと','吹き出し','outline',500,52,393,257),
  item('outline-box','四角・下しっぽ','吹き出し','outline',930,57,409,244),
  item('outline-side','四角・横しっぽ','吹き出し','outline',1352,60,425,240),
  item('outline-circles','丸い考えごと・左','吹き出し','outline',68,336,212,248),
  item('outline-circles-right','丸い考えごと・右','吹き出し','outline',286,336,232,248),
  item('outline-cloud-tail','雲・下しっぽ','吹き出し','outline',540,305,410,305),
  item('outline-box-thought','四角い考えごと','吹き出し','outline',980,330,407,268),
  item('outline-pill','横長の丸','吹き出し','outline',1408,352,400,220),
  item('outline-oval','楕円','吹き出し','outline',54,583,395,247),
  item('outline-oval-right','右上の楕円','吹き出し','outline',1392,570,405,250),
  item('outline-round','丸','吹き出し','outline',36,828,220,240),
  item('outline-round-right','右向きの丸','吹き出し','outline',272,830,220,242),
  item('outline-rectangle','角丸の四角','吹き出し','outline',536,824,396,220),
  item('outline-burst','ギザギザ','吹き出し','outline',956,752,344,344),
  item('outline-exclaim','強調','吹き出し','outline',1308,828,460,284),
  item('outline-small-box','小さな四角','吹き出し','outline',1020,1095,300,265),
  item('shadow-cloud','影つき・雲','影つき','shadow',64,60,412,280),
  item('shadow-thought','影つき・考えごと','影つき','shadow',496,44,408,300),
  item('shadow-box','影つき・四角','影つき','shadow',927,50,423,262),
  item('shadow-side','影つき・横しっぽ','影つき','shadow',1358,50,436,252),
  item('shadow-pill','影つき・横長','影つき','shadow',48,344,420,249),
  item('shadow-box-thought','影つき・四角い考え','影つき','shadow',476,348,404,264),
  item('shadow-cloud-low','影つき・ふわふわ','影つき','shadow',900,305,430,320),
  item('shadow-round','影つき・丸2個組','影つき','shadow',1320,328,483,261),
  item('shadow-round-left','影つき・左の丸','影つき','shadow',1310,332,260,260),
  item('shadow-round-right','影つき・右の丸','影つき','shadow',1540,332,260,255),
  item('shadow-oval','影つき・楕円','影つき','shadow',56,584,352,252),
  item('shadow-oval-right','影つき・右向き楕円','影つき','shadow',1410,585,390,255),
  item('shadow-bottom-left','影つき・左下の丸','影つき','shadow',38,835,230,250),
  item('shadow-bottom-right','影つき・右下の丸','影つき','shadow',265,835,240,250),
  item('shadow-bottom-box','影つき・下の四角','影つき','shadow',537,833,410,224),
  item('shadow-burst','影つき・ギザギザ','影つき','shadow',980,756,352,348),
  item('shadow-wave','影つき・波形','影つき','shadow',1360,835,445,272),
  item('shadow-small-box','影つき・小さな四角','影つき','shadow',1030,1110,285,240),
  item('comic-cloud','まんが・雲','まんが','comic',40,48,270,220),
  item('comic-soft','まんが・やわらか','まんが','comic',340,52,260,220),
  item('comic-big','まんが・大きな丸','まんが','comic',648,52,528,456),
  item('comic-thought','まんが・考えごと','まんが','comic',1200,44,292,228),
  item('comic-cloud-right','まんが・ふわふわ','まんが','comic',1480,40,310,238),
  item('comic-box','まんが・四角','まんが','comic',53,315,226,205),
  item('comic-round','まんが・丸','まんが','comic',348,304,252,196),
  item('comic-pill','まんが・横長','まんが','comic',1224,320,368,148),
  item('comic-vertical','まんが・縦長','まんが','comic',1620,290,173,385),
  item('comic-box-low','まんが・四角下','まんが','comic',48,548,245,207),
  item('comic-thought-round','まんが・丸い考え','まんが','comic',335,525,260,250),
  item('comic-octagon','まんが・八角','まんが','comic',646,540,270,225),
  item('comic-zigzag','まんが・稲妻','まんが','comic',925,525,293,253),
  item('comic-box-wide','まんが・幅広四角','まんが','comic',1220,488,375,172),
  item('comic-trapezoid','まんが・台形','まんが','comic',45,798,250,210),
  item('comic-star','まんが・トゲ','まんが','comic',344,796,244,216),
  item('comic-hex','まんが・六角','まんが','comic',940,804,272,236),
  item('comic-flower','まんが・花びら','まんが','comic',656,800,248,236),
  item('comic-pill-hearts','まんが・ハートつき','まんが','comic',1218,672,380,154),
  item('comic-wave','まんが・波形','まんが','comic',1218,855,380,161),
  item('comic-tall-oval','まんが・縦長丸','まんが','comic',1600,675,196,360),
  item('comic-tall-box','まんが・縦長四角','まんが','comic',58,1030,245,307),
  item('comic-bottom-oval','まんが・下段の楕円','まんが','comic',325,1022,252,315),
  item('comic-burst','まんが・集中','まんが','comic',590,1050,340,290),
  item('comic-bottom-round','まんが・下段の丸','まんが','comic',940,1045,275,290),
  item('comic-lightning-box','まんが・斜め四角','まんが','comic',1205,1040,290,300),
  item('comic-step','まんが・段つき','まんが','comic',1450,1030,345,300),
  item('handdrawn-round','手描き・丸','手描き','handdrawn',220,20,300,215),
  item('handdrawn-heart','手描き・ハート','手描き','handdrawn',535,20,315,215),
  item('handdrawn-burst','手描き・ギザギザ','手描き','handdrawn',870,15,295,220),
  item('handdrawn-box','手描き・四角','手描き','handdrawn',220,235,300,215),
  item('handdrawn-cloud','手描き・雲','手描き','handdrawn',535,235,315,215),
  item('handdrawn-box-right','手描き・右しっぽ','手描き','handdrawn',870,235,295,215),
  item('handdrawn-cloud-tail','手描き・雲しっぽ','手描き','handdrawn',220,450,300,225),
  item('handdrawn-thought','手描き・考えごと','手描き','handdrawn',535,450,315,225),
  item('handdrawn-pointed','手描き・先のとがった丸','手描き','handdrawn',870,450,295,225),
  item('handdrawn-slant','手描き・斜め楕円','手描き','handdrawn',220,675,300,220),
  item('handdrawn-soft','手描き・やわらか','手描き','handdrawn',535,675,315,220),
  item('handdrawn-small','手描き・小さな丸','手描き','handdrawn',870,675,295,220),
  item('handdrawn-loop','手描き・ループ','手描き','handdrawn',220,895,300,250),
  item('handdrawn-loop-cloud','手描き・丸いループ','手描き','handdrawn',535,895,315,250),
  item('handdrawn-loop-oval','手描き・楕円ループ','手描き','handdrawn',870,895,295,250),
  item('ink-circle','丸い墨','墨の質感','ink',62,254,280,300),
  item('ink-grain','かすれた丸','墨の質感','ink',397,243,300,313),
  item('ink-wide','横に広がる墨','墨の質感','ink',747,248,350,300),
  item('ink-soft','にじむ墨','墨の質感','ink',1110,245,325,310),
  item('ink-dry','かすれた墨','墨の質感','ink',512,544,376,176),
  item('ink-sweep','横に払う墨','墨の質感','ink',1292,568,468,124),
  item('ink-rough','重ねた墨','墨の質感','ink',388,776,364,124),
  ...[
    [8,122,[8,240,445,681,850,1078,1285],['ゴゴゴ…','バキッ！','ドンッ!!','ドサッ','ザザザ','シャアア']],
    [123,208,[8,228,487,655,882,1100,1285],['カッカッ','ババババ','ビリッ','パチパチ','シーン…','ゾワッ']],
    [209,297,[8,194,362,606,825,1096,1285],['カチャ','フワッ','ズキューン','ドカンッ！','ガシャーン','パシッ']],
    [298,387,[8,268,510,846,1098,1285],['ズドーン','ズドゥン','バァァァン','バァァン','ドスッ']],
    [388,468,[8,219,421,576,776,939,1127,1285],['カサササ','パリンッ','シュッ','ボソボソ','ゾクッ','ドタバタ','グサッ']],
    [469,554,[8,188,391,558,750,924,1105,1285],['ピカッ','ドキドキ','ズズズ','ドロドロ','ギラッ','フフフ…','フフフ… 2']],
    [555,638,[8,190,391,564,767,935,1105,1285],['ワハハ','ザワザワ','パラパラ','ドォン','ガタガタ','コソコソ','ブルブル']],
    [639,713,[8,196,399,590,775,925,1115,1285],['スッ','カチン','カチャッ','ガバッ','フッ','ドクドク','バササ']]
  ].flatMap(([top,bottom,xs,labels],row)=>labels.map((label,col)=>{const [cropTop,cropBottom]=soundCropBounds[`${row+1}-${col+1}`]||[top+1,bottom-1];return item(`sound-${row+1}-${col+1}`,label,'オノマトペ','sounds',xs[col]+2,cropTop,xs[col+1]-xs[col]-4,cropBottom-cropTop);})),
  ...[
    [['ゴゴゴ…','バキッ！','ドンッ!!'],[0,230,440,640]],
    [['ザザザッ','シャアア','ドサッ'],[0,210,468,640]],
    [['カッカッ','ババババ','ビリッ','パチパチ'],[0,185,355,482,640]],
    [['シーン…','ゾワッ','カチャ','フワッ'],[0,216,386,511,640]]
  ].flatMap(([labels,xs],row)=>labels.map((label,col)=>item(`sound-effect-${row+1}-${col+1}`,label,'効果つき','soundEffects',xs[col]+2,row*89+2,xs[col+1]-xs[col]-4,85))),
  ...Array.from({length:6},(_,index)=>item(`speed-six-${index+1}`,`集中線 ${String(index+1).padStart(2,'0')}`,'集中線','speedSix',10+(index%3)*210,9+Math.floor(index/3)*176,198,165)),
  ...Array.from({length:20},(_,index)=>item(`speed-twenty-${index+1}`,`集中線 ${String(index+7).padStart(2,'0')}`,'集中線・追加','speedTwenty',10+(index%5)*126,9+Math.floor(index/5)*88,115,77))
];

export const imageMaterials=[...Array.from({length:10},(_,i)=>{const xs=[0,475,945,1410,1824],ys=[0,465,890,1361],col=i%4,row=Math.floor(i/4),names=['ギザギザ','強調','ゆらぎ・考えごと','角丸・右しっぽ','もくもく・左しっぽ','雲・考えごと','ハート','花・考えごと','丸・左しっぽ','多角形'];return item('selected-bubble-'+(i+13),'吹き出し '+(i+13)+'・'+names[i],'吹き出し','selectedBubbles',xs[col],ys[row],xs[col+1]-xs[col],ys[row+1]-ys[row]);}),...legacyMaterials.filter(m=>!['outline','shadow','comic','handdrawn'].includes(m.sheet))];
let loadedSheet=null,loadedName='',pendingSheet=null,databasePromise;
const previewCache=new Map();
function materialDatabase(){
  if(!databasePromise)databasePromise=new Promise((resolve,reject)=>{const request=indexedDB.open('drum-staff-image-materials-v1',1);request.onupgradeneeded=()=>request.result.createObjectStore('sheets');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error||Error('端末内の素材保存を開けませんでした。'));});
  return databasePromise;
}
async function storedSheet(name){const database=await materialDatabase();return new Promise((resolve,reject)=>{const request=database.transaction('sheets','readonly').objectStore('sheets').get(name);request.onsuccess=()=>resolve(request.result||null);request.onerror=()=>reject(request.error);});}
export async function hasMaterialSheet(name){return !!(materialSheets[name]&&(materialSheets[name].asset||await storedSheet(name)));}
export async function saveMaterialSheet(name,file){
  if(!materialSheets[name]||materialSheets[name].asset)throw Error('この素材は入れ替えできません。');
  if(file.type!=='image/png'||file.size>12000000)throw Error('12MB以下のPNG画像を選んでください。');
  const bitmap=await createImageBitmap(file);try{if(bitmap.width<500||bitmap.height<500)throw Error('素材シート全体のPNG画像を選んでください。');}finally{bitmap.close();}
  const database=await materialDatabase();await new Promise((resolve,reject)=>{const tx=database.transaction('sheets','readwrite');tx.objectStore('sheets').put(file,name);tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});
  if(loadedName===name){loadedSheet=null;loadedName='';}
}
async function sheetImage(name){
  if(!materialSheets[name])throw Error('素材を見つけられませんでした。');
  if(loadedSheet&&loadedName===name)return loadedSheet;
  if(pendingSheet?.name===name)return pendingSheet.promise;
  const promise=(async()=>{const entry=materialSheets[name],source=entry.asset?null:await storedSheet(name);if(!entry.asset&&!source)throw Error('先にこの端末から素材シートを読み込んでください。');const image=new Image(),url=source?URL.createObjectURL(source):null;try{image.src=url||new URL(entry.asset,import.meta.url).href;await image.decode();}finally{if(url)URL.revokeObjectURL(url);}loadedSheet=image;loadedName=name;return image;})();
  pendingSheet={name,promise};try{return await promise;}finally{if(pendingSheet?.promise===promise)pendingSheet=null;}
}
function cropCanvas(image,material,maxSize=0){
  const [x,y,w,h]=material.rect,[referenceWidth,referenceHeight]=materialSheets[material.sheet].size||[1824,1368],sourceX=Math.round(x*image.naturalWidth/referenceWidth),sourceY=Math.round(y*image.naturalHeight/referenceHeight),sourceW=Math.min(image.naturalWidth-sourceX,Math.round(w*image.naturalWidth/referenceWidth)),sourceH=Math.min(image.naturalHeight-sourceY,Math.round(h*image.naturalHeight/referenceHeight));
  if(sourceW<1||sourceH<1)throw Error('素材の範囲が正しくありません。');
  const scale=maxSize?Math.min(1,maxSize/Math.max(sourceW,sourceH)):1;
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(sourceW*scale));canvas.height=Math.max(1,Math.round(sourceH*scale));
  const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,sourceX,sourceY,sourceW,sourceH,0,0,canvas.width,canvas.height);
  if(material.sheet==='selectedBubbles')clearBubblePaper(canvas);
  if(materialSheets[material.sheet].whiteToAlpha){const pixels=context.getImageData(0,0,canvas.width,canvas.height);for(let i=0;i<pixels.data.length;i+=4){const darkness=255-Math.min(pixels.data[i],pixels.data[i+1],pixels.data[i+2]);pixels.data[i+3]=Math.max(0,Math.min(255,Math.round((darkness-9)*1.35)));}context.putImageData(pixels,0,0);}
  if(['outline','shadow','comic','handdrawn'].includes(material.sheet))removeNeighborFragments(canvas,material.sheet==='comic'&&!material.id.includes('thought'));
  return canvas;
}

// Remove only edge-connected paper; enclosed bubble interiors remain opaque.
function clearBubblePaper(canvas){
 const ctx=canvas.getContext('2d',{willReadFrequently:true}),im=ctx.getImageData(0,0,canvas.width,canvas.height),d=im.data,w=canvas.width,h=canvas.height,n=w*h,seen=new Uint8Array(n),q=new Uint32Array(n);let head=0,tail=0;
 const visit=p=>{if(seen[p]||Math.min(d[p*4],d[p*4+1],d[p*4+2])<170)return;seen[p]=1;q[tail++]=p;};
 for(let x=0;x<w;x++){visit(x);visit((h-1)*w+x);}for(let y=0;y<h;y++){visit(y*w);visit(y*w+w-1);}
 while(head<tail){const p=q[head++],x=p%w; if(x)visit(p-1);if(x<w-1)visit(p+1);if(p>=w)visit(p-w);if(p<n-w)visit(p+w);}
 for(let p=0;p<n;p++){const i=p*4;if(seen[p])d[i+3]=0;else {const value=Math.min(d[i],d[i+1],d[i+2]);d[i]=d[i+1]=d[i+2]=value>235?255:Math.max(0,Math.round((value-20)*255/215));}}
 ctx.putImageData(im,0,0);
}

function removeNeighborFragments(canvas,mainOnly=false){
  const {width,height}=canvas,context=canvas.getContext('2d',{willReadFrequently:true}),image=context.getImageData(0,0,width,height),data=image.data,size=width*height,labels=new Uint32Array(size),queue=new Uint32Array(size),components=[null];
  let largest=0;
  for(let start=0;start<size;start++){
    if(labels[start]||data[start*4+3]<=5)continue;
    const label=components.length,component={count:0,left:width,top:height,right:0,bottom:0};components.push(component);let head=0,tail=1;queue[0]=start;labels[start]=label;
    while(head<tail){const pos=queue[head++],x=pos%width,y=(pos/width)|0;component.count++;if(x<component.left)component.left=x;if(x>component.right)component.right=x;if(y<component.top)component.top=y;if(y>component.bottom)component.bottom=y;
      for(let ny=Math.max(0,y-1);ny<=Math.min(height-1,y+1);ny++)for(let nx=Math.max(0,x-1);nx<=Math.min(width-1,x+1);nx++){const next=ny*width+nx;if(!labels[next]&&data[next*4+3]>5){labels[next]=label;queue[tail++]=next;}}
    }
    if(!largest||component.count>components[largest].count)largest=label;
  }
  const remove=new Uint8Array(components.length);for(let i=1;i<components.length;i++){if(i===largest)continue;const c=components[i];if(mainOnly||c.left<=2||c.top<=2||c.right>=width-3||c.bottom>=height-3)remove[i]=1;}
  if(!remove.some(Boolean))return;
  for(let pos=0;pos<size;pos++)if(remove[labels[pos]])data[pos*4+3]=0;
  context.putImageData(image,0,0);
}
function trimTransparent(canvas){
  const {width,height}=canvas,data=canvas.getContext('2d',{willReadFrequently:true}).getImageData(0,0,canvas.width,canvas.height),pixels=data.data;
  let left=width,top=height,right=-1,bottom=-1;
  for(let y=0;y<height;y++)for(let x=0;x<width;x++)if(pixels[(y*width+x)*4+3]>5){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
  if(right<left)throw Error('この素材の絵柄が見つかりませんでした。');
  const margin=Math.max(2,Math.ceil(Math.max(width,height)*.01));left=Math.max(0,left-margin);top=Math.max(0,top-margin);right=Math.min(width-1,right+margin);bottom=Math.min(height-1,bottom+margin);
  const trimmed=document.createElement('canvas');trimmed.width=right-left+1;trimmed.height=bottom-top+1;trimmed.getContext('2d').drawImage(canvas,left,top,trimmed.width,trimmed.height,0,0,trimmed.width,trimmed.height);return trimmed;
}
export async function materialPreview(material,canvas){
  if(previewCache.has(material.id)){canvas.getContext('2d').drawImage(previewCache.get(material.id),0,0,canvas.width,canvas.height);return;}
  const crop=trimTransparent(cropCanvas(await sheetImage(material.sheet),material,240));
  const context=canvas.getContext('2d');context.clearRect(0,0,canvas.width,canvas.height);
  const scale=Math.min((canvas.width-12)/crop.width,(canvas.height-12)/crop.height);
  context.drawImage(crop,(canvas.width-crop.width*scale)/2,(canvas.height-crop.height*scale)/2,crop.width*scale,crop.height*scale);
  const preview=document.createElement('canvas');preview.width=canvas.width;preview.height=canvas.height;preview.getContext('2d').drawImage(canvas,0,0);previewCache.set(material.id,preview);
}
export async function materialBitmap(material){
  const crop=trimTransparent(cropCanvas(await sheetImage(material.sheet),material,1800));
  return createImageBitmap(crop);
}
