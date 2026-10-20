import {uploadedFonts} from './uploaded-fonts.js';
export const personalFonts={
 default:{label:'標準（ゴシック）',family:'system-ui, -apple-system, "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif'},
 serif:{label:'明朝',family:'"Hiragino Mincho ProN", "Yu Mincho", "Noto Serif CJK JP", serif'},
 rounded:{label:'丸ゴシック',family:'"Hiragino Maru Gothic ProN", "BIZ UDGothic", "Yu Gothic", sans-serif'},
 mono:{label:'等幅',family:'"MS Gothic", "Osaka-Mono", monospace'},
 gothic:{label:'太めゴシック',family:'"Arial Black", "Hiragino Kaku Gothic ProN", "Yu Gothic", sans-serif'},
 hand:{label:'手書き風',family:'"Comic Sans MS", "Hiragino Maru Gothic ProN", cursive'},
 slab:{label:'見出し風',family:'Rockwell, "Arial Black", sans-serif'},
 narrow:{label:'細めゴシック',family:'"Arial Narrow", "Yu Gothic", sans-serif'},
 playful:{label:'やわらか丸文字',family:'"Trebuchet MS", "Hiragino Maru Gothic ProN", sans-serif'},
 typewriter:{label:'タイプライター風',family:'"Courier New", "MS Gothic", monospace'},
 ...uploadedFonts
};
// Register faces without downloading. The browser fetches only the selected font.
for(const font of Object.values(uploadedFonts))for(const face of font.faces){
 document.fonts.add(new FontFace(font.alias,`url("${new URL(face.file,import.meta.url).href}")`,{weight:face.weight,style:'normal',display:'swap'}));
}
export async function loadPersonalFont(key,weight=400){
 const font=uploadedFonts[key];if(!font)return;
 let timer;try{await Promise.race([document.fonts.load(`${weight} 32px "${font.alias}"`,'日本語Aa'),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('書体を読み込めませんでした。通信状態とフォントのアップロードを確認してください。')),30000);})]);}finally{clearTimeout(timer);}
 return true;
}
