import {applyImageStudioTheme} from './image-studio-theme.js';

const PRESETS=[
 ['square','正方形 1080 × 1080',1080,1080],
 ['portrait','縦長 1080 × 1350',1080,1350],
 ['landscape','横長 1350 × 1080',1350,1080],
 ['story','スマホ縦 1080 × 1920',1080,1920],
 ['wide','ワイド 1920 × 1080',1920,1080],
 ['a4-portrait','A4 縦・印刷向け 2480 × 3508',2480,3508],
 ['a4-landscape','A4 横・印刷向け 3508 × 2480',3508,2480],
 ['custom','幅・高さを指定',1080,1080]
];

export async function makeBlankCanvas(width,height,color='#ffffff'){
 width=Number(width);height=Number(height);
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width>8192||height>8192||width*height>32000000)throw Error('幅・高さは1～8,192px、合計3,200万画素以内にしてください。');
 if(!/^#[0-9a-f]{6}$/i.test(color))throw Error('背景色を正しく指定してください。');
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const context=canvas.getContext('2d');context.fillStyle=color;context.fillRect(0,0,width,height);
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('キャンバスを作成できませんでした。');
 return {blob,width,height,color:color.toLowerCase()};
}

export function chooseBlankCanvas(){
 return new Promise(resolve=>{
  const dialog=document.createElement('dialog');dialog.className='blank-canvas-dialog';applyImageStudioTheme(dialog);
  dialog.innerHTML='<form><h2>白紙キャンバスを作る</h2><p>写真を選ばずに文字・図形・手書きで作れます。背景色は編集画面でも変更できます。</p><label>キャンバスサイズ<select name="preset"></select></label><div class="blank-canvas-dimensions"><label>幅（px）<input name="width" type="number" min="1" max="8192" step="1" inputmode="numeric" value="1080" required></label><label>高さ（px）<input name="height" type="number" min="1" max="8192" step="1" inputmode="numeric" value="1080" required></label></div><label>背景色<div class="blank-canvas-color"><input name="color" type="color" value="#ffffff"><input name="hex" type="text" value="#FFFFFF" maxlength="7" spellcheck="false" aria-label="背景色のカラーコード"></div></label><p class="blank-canvas-error" role="alert" hidden></p><div class="blank-canvas-actions"><button type="button" data-blank="cancel">やめる</button><button type="submit" class="primary">このサイズで作る</button></div></form>';
  const form=dialog.querySelector('form'),preset=form.elements.preset,width=form.elements.width,height=form.elements.height,color=form.elements.color,hex=form.elements.hex,error=dialog.querySelector('.blank-canvas-error');
  for(const [key,label] of PRESETS){const option=document.createElement('option');option.value=key;option.textContent=label;preset.append(option);}
  function finish(value){if(dialog.open)dialog.close();dialog.remove();resolve(value);}
  preset.onchange=()=>{const row=PRESETS.find(item=>item[0]===preset.value);if(row&&preset.value!=='custom'){width.value=row[2];height.value=row[3];}};
  for(const input of [width,height])input.oninput=()=>{preset.value='custom';};
  color.oninput=()=>{hex.value=color.value.toUpperCase();};
  hex.oninput=()=>{if(/^#[0-9a-f]{6}$/i.test(hex.value))color.value=hex.value;};
  dialog.querySelector('[data-blank="cancel"]').onclick=()=>finish(null);
  dialog.oncancel=event=>{event.preventDefault();finish(null);};
  form.onsubmit=async event=>{event.preventDefault();error.hidden=true;const submit=form.querySelector('[type="submit"]');submit.disabled=true;try{finish(await makeBlankCanvas(width.value,height.value,hex.value));}catch(exception){error.textContent=exception.message;error.hidden=false;submit.disabled=false;}};
  document.body.append(dialog);dialog.showModal();
 });
}
