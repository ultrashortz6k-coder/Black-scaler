const { createFFmpeg, fetchFile } = FFmpeg;
const input = document.getElementById('videoInput');
const dropzone = document.getElementById('dropzone');
const preview = document.getElementById('preview');
const fileInfo = document.getElementById('fileInfo');
const enhanceBtn = document.getElementById('enhanceBtn');
const statusEl = document.getElementById('status');
const progressWrap = document.getElementById('progressWrap');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const downloadBtn = document.getElementById('downloadBtn');
let selectedFile = null, preset = 'balanced', ffmpeg = null, busy = false, outputUrl = null;

function prettyBytes(bytes){if(bytes<1024*1024)return (bytes/1024).toFixed(0)+' KB';return (bytes/1024/1024).toFixed(1)+' MB';}
function setFile(file){
  if(!file || !file.type.startsWith('video/')){statusEl.textContent='Please choose a valid video file.';return;}
  selectedFile=file; preview.src=URL.createObjectURL(file); preview.hidden=false;
  fileInfo.hidden=false;fileInfo.textContent=`${file.name} · ${prettyBytes(file.size)}`;
  enhanceBtn.disabled=false;statusEl.textContent='Video ready. Choose your settings and enhance.';
  downloadBtn.hidden=true;
}
input.addEventListener('change',e=>setFile(e.target.files[0]));
['dragenter','dragover'].forEach(ev=>dropzone.addEventListener(ev,e=>{e.preventDefault();dropzone.classList.add('drag')}));
['dragleave','drop'].forEach(ev=>dropzone.addEventListener(ev,e=>{e.preventDefault();dropzone.classList.remove('drag')}));
dropzone.addEventListener('drop',e=>setFile(e.dataTransfer.files[0]));
document.querySelectorAll('.preset').forEach(btn=>btn.addEventListener('click',()=>{
  document.querySelectorAll('.preset').forEach(b=>b.classList.remove('active'));btn.classList.add('active');preset=btn.dataset.preset;
  if(preset==='sharp'){document.getElementById('sharpen').checked=true;document.getElementById('denoise').checked=false;}
  if(preset==='clean'){document.getElementById('sharpen').checked=false;document.getElementById('denoise').checked=true;}
  if(preset==='balanced'){document.getElementById('sharpen').checked=false;document.getElementById('denoise').checked=true;}
}));

function getFilters(){
  const filters=[];
  const scale=document.getElementById('scale').value;
  if(scale==='2x') filters.push('scale=iw*2:ih*2:flags=lanczos');
  if(scale==='1080') filters.push("scale='min(1920,iw*min(1920/iw,1080/ih))':'min(1080,ih*min(1920/iw,1080/ih))':force_original_aspect_ratio=decrease:flags=lanczos");
  if(document.getElementById('denoise').checked) filters.push('hqdn3d=1.5:1.5:6:6');
  if(document.getElementById('sharpen').checked || preset==='sharp') filters.push('unsharp=5:5:0.7:3:3:0.3');
  if(document.getElementById('contrast').checked) filters.push('eq=contrast=1.05:saturation=1.04');
  return filters.join(',');
}
async function getEngine(){
  if(ffmpeg && ffmpeg.isLoaded()) return ffmpeg;
  statusEl.textContent='Loading the free video engine…';
  ffmpeg=createFFmpeg({log:false,corePath:'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js'});
  ffmpeg.setProgress(({ratio})=>{const pct=Math.max(0,Math.min(99,Math.round(ratio*100)));progressBar.style.width=pct+'%';progressText.textContent=`Processing video… ${pct}%`;});
  await ffmpeg.load();return ffmpeg;
}
enhanceBtn.addEventListener('click',async()=>{
  if(!selectedFile || busy)return;
  busy=true;enhanceBtn.disabled=true;downloadBtn.hidden=true;progressWrap.hidden=false;progressBar.style.width='0%';
  try{
    const engine=await getEngine();
    statusEl.textContent='Preparing your video…';progressText.textContent='Reading video…';
    const ext=(selectedFile.name.split('.').pop()||'mp4').toLowerCase().replace(/[^a-z0-9]/g,'');
    const inName='input.'+ext, outName='ultra-upscale-enhanced.mp4';
    engine.FS('writeFile',inName,await fetchFile(selectedFile));
    const filters=getFilters();
    const args=['-i',inName];
    if(filters)args.push('-vf',filters);
    args.push('-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-movflags','+faststart',outName);
    statusEl.textContent='Enhancing on this device. Keep this tab open…';
    await engine.run(...args);
    const data=engine.FS('readFile',outName);
    const blob=new Blob([data.buffer],{type:'video/mp4'});
    if(outputUrl)URL.revokeObjectURL(outputUrl);
    outputUrl=URL.createObjectURL(blob);downloadBtn.href=outputUrl;downloadBtn.hidden=false;
    progressBar.style.width='100%';progressText.textContent='Complete!';
    statusEl.textContent='Your enhanced video is ready.';
    try{engine.FS('unlink',inName);engine.FS('unlink',outName);}catch(e){}
  }catch(err){
    console.error(err);statusEl.textContent='Could not process this video. Try a shorter or smaller clip, or use Chrome.';
    progressText.textContent='Processing stopped. Your original video is unchanged.';
  }finally{busy=false;enhanceBtn.disabled=!selectedFile;}
});
