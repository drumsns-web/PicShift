// Alignment uses the rotated layer box, in canvas coordinates.
export function layerBounds(layer,width,height){
 const angle=layer.angle*Math.PI/180,c=Math.abs(Math.cos(angle)),s=Math.abs(Math.sin(angle));
 const halfWidth=(width*c+height*s)*layer.scale/2,halfHeight=(width*s+height*c)*layer.scale/2;
 return {left:layer.x-halfWidth,centerX:layer.x,right:layer.x+halfWidth,top:layer.y-halfHeight,centerY:layer.y,bottom:layer.y+halfHeight};
}

function snapAxis(anchors,targets,held,tolerance){
 // Always compare with the unsnapped pointer position. Moving another 8 screen
 // pixels releases the hold, including when pointer events arrive in tiny steps.
 let best=null,distance=tolerance;
 for(let anchor=0;anchor<anchors.length;anchor++)for(const target of targets){
  const d=Math.abs(target-anchors[anchor]);
  if(d<=tolerance&&(!best||d<distance)){best={anchor,target};distance=d;}
 }
 // Nearby edges must not hold the layer away from a closer center/edge.
 if(held){const previousDistance=Math.abs(held.target-anchors[held.anchor]);if(previousDistance<=tolerance*8/5&&(!best||previousDistance<=distance+tolerance*.2))return held;}
 return best;
}

export function snapBounds(bounds,references,width,height,tolerance,held={}){
 const axes={x:['centerX','left','right'],y:['centerY','top','bottom']},result={dx:0,dy:0,held:{},guides:[]};
 for(const axis of ['x','y']){
  const keys=axes[axis],size=axis==='x'?width:height;
  const anchors=keys.map(key=>bounds[key]);
  const targets=[...new Set([size/2,0,size,...references.flatMap(box=>keys.map(key=>box[key]))])];
  const match=snapAxis(anchors,targets,held[axis],tolerance[axis]);
  if(match){result['d'+axis]=match.target-anchors[match.anchor];result.held[axis]=match;result.guides.push({axis,value:match.target});}
 }
 return result;
}
