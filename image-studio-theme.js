const KEY='drum-image-studio-theme-v1';

export function imageStudioTheme(){
 try{const value=localStorage.getItem(KEY);return value==='natural'||value==='original'?value:'electric';}
 catch{return 'electric';}
}

export function setImageStudioTheme(theme){
 const next=theme==='natural'||theme==='original'?theme:'electric';
 try{localStorage.setItem(KEY,next);}catch{}
 window.dispatchEvent(new CustomEvent('image-studio-theme-change',{detail:next}));
 return next;
}

export function applyImageStudioTheme(element,theme=imageStudioTheme()){
 element.classList.toggle('theme-natural',theme==='natural');
 element.classList.toggle('theme-electric',theme==='electric');
 element.classList.toggle('theme-original',theme==='original');
}
