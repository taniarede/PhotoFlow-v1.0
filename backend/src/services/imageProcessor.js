import sharp from 'sharp';

export const PRESETS={
  thumbnail:{width:300,quality:80},
  web:{width:1200,quality:85},
  full:{width:2400,quality:90}
};

const WATERMARK_FONTS = new Set([
  'Arial',
  'Helvetica',
  'Verdana',
  'Trebuchet MS',
  'Georgia',
  'Times New Roman',
  'Courier New',
  'Impact',
]);

function escapeXml(value){
  return String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
}

function positionFor(position, width, height, margin, overlayWidth, overlayHeight){
  const x = position.endsWith('right') ? width-overlayWidth-margin : position.endsWith('center') ? (width-overlayWidth)/2 : margin;
  const y = position.startsWith('bottom') ? height-overlayHeight-margin : position.startsWith('center') ? (height-overlayHeight)/2 : margin;
  return {x:Math.max(0,Math.round(x)),y:Math.max(0,Math.round(y))};
}

async function getDimensions(input){
  const meta=await sharp(input).metadata();
  return {width:meta.width||1,height:meta.height||1};
}

async function textOverlay(text, canvasWidth, canvasHeight, opacity, position, textSize=3.5, font='Arial'){
  const fontFamily = WATERMARK_FONTS.has(font) ? font : 'Arial';
  const sizePercent=Math.max(1,Math.min(8,Number(textSize)||3.5));
  const fontSize=Math.max(12,Math.round(canvasWidth*(sizePercent/100)));
  const padding=Math.max(12,Math.round(fontSize*0.45));
  const approxWidth=Math.min(canvasWidth-padding*2, Math.max(120, text.length*fontSize*0.55));
  const overlayHeight=fontSize+padding*2;
  const overlayWidth=approxWidth+padding*2;
  const {x,y}=positionFor(position,canvasWidth,canvasHeight,padding,overlayWidth,overlayHeight);
  const svg=`<svg width="${overlayWidth}" height="${overlayHeight}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" rx="${padding}" fill="black" fill-opacity="0.35"/><text x="${overlayWidth/2}" y="${padding+fontSize*0.78}" text-anchor="middle" font-family="${escapeXml(fontFamily)}, sans-serif" font-size="${fontSize}px" font-weight="600" fill="white" fill-opacity="${opacity}">${escapeXml(text)}</text></svg>`;
  return {input:Buffer.from(svg),left:x,top:y};
}

async function imageOverlay(watermarkPath, canvasWidth, canvasHeight, opacity, position){
  const maxWidth=Math.round(canvasWidth*0.25);
  const resized=await sharp(watermarkPath).resize({width:maxWidth,withoutEnlargement:true}).ensureAlpha().png().toBuffer();
  const meta=await sharp(resized).metadata();
  const overlayWidth=meta.width||maxWidth;
  const overlayHeight=meta.height||maxWidth;
  const {x,y}=positionFor(position,canvasWidth,canvasHeight,24,overlayWidth,overlayHeight);
  const input=await sharp(resized).composite([{input:{create:{width:overlayWidth,height:overlayHeight,channels:4,background:{r:255,g:255,b:255,alpha:opacity}}},blend:'dest-in'}]).png().toBuffer();
  return {input,left:x,top:y};
}

export async function processImage(inputPath,outputPath,presetName,watermark={}){
  const preset=PRESETS[presetName];
  if(!preset) throw new Error(`Unknown preset: ${presetName}`);
  const resized=sharp(inputPath).rotate().resize({width:preset.width,withoutEnlargement:true});
  const meta=await resized.metadata();
  // Metadata after resize is not available until rendering, so obtain source ratio/dimensions separately.
  const source=await getDimensions(inputPath);
  const ratio=Math.min(1,preset.width/source.width);
  const canvasWidth=Math.round(source.width*ratio);
  const canvasHeight=Math.round(source.height*ratio);
  const composites=[];
  if (watermark.enabled !== true) watermark = { ...watermark, type: null };
  const opacity=Math.max(0,Math.min(1,Number(watermark.opacity ?? 0.7)));
  const position=watermark.position||'bottom-right';
  if(watermark.type==='text' && watermark.text?.trim()) composites.push(await textOverlay(watermark.text.trim(),canvasWidth,canvasHeight,opacity,position,watermark.textSize, watermark.font));
  if(watermark.type==='image' && watermark.path) composites.push(await imageOverlay(watermark.path,canvasWidth,canvasHeight,opacity,position));
  let pipeline=resized;
  if(composites.length) pipeline=pipeline.composite(composites);
  await pipeline.jpeg({quality:preset.quality}).toFile(outputPath);
}
