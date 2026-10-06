export interface WidgetTemplate {
  id: string
  title: string
  desc: string
  html: string
}

const BASE = "font-family:system-ui,sans-serif;padding:16px;color:#e2e8f0;background:#0f172a;border-radius:12px"
const BTN = "background:#2dd4bf;border:0;border-radius:8px;padding:8px 12px;color:#042f2e;font-weight:700;cursor:pointer"
const CARD = "background:#1e293b;border:1px solid #334155;border-radius:10px;padding:12px;margin-top:10px"

export const WIDGET_TEMPLATES: WidgetTemplate[] = [
  {
    id: "flashflip",
    title: "Flashcard Flip",
    desc: "3 kartu bolak-balik, klik untuk buka.",
    html: `<div style="${BASE}"><h3>Flashcard Kilat</h3><div id="c" style="${CARD};min-height:90px;cursor:pointer">Klik untuk mulai</div><div style="margin-top:10px;display:flex;gap:8px"><button style="${BTN}" onclick="next()">Lanjut</button><button style="${BTN}" onclick="flip()">Balik</button></div><script>
const D=[["Fotosintesis","CO2 + air -> glukosa + oksigen di kloroplas"],["Mitokondria","Pembangkit ATP via respirasi seluler"],["Sudut H2O","104.5 derajat karena pasangan elektron bebas"]];
let i=0,open=false;
function render(){document.getElementById("c").innerHTML="<b>"+D[i][open?1:0]+"</b><br><small>"+(open?"jawaban":"pertanyaan")+" "+(i+1)+"/"+D.length+"</small>"}
function flip(){open=!open;render()} function next(){i=(i+1)%D.length;open=false;render()} render();
</scr` + `ipt></div>`,
  },
  {
    id: "quickquiz",
    title: "Kuis Kilat",
    desc: "3 soal pilihan ganda + skor.",
    html: `<div style="${BASE}"><h3>Kuis Kilat</h3><div id="q" style="${CARD}"></div><div id="opts" style="margin-top:10px;display:grid;gap:8px"></div><p id="s">Skor: 0</p><script>
const Q=[{q:"Tempat fotosintesis?",o:["Mitokondria","Kloroplas","Nukleus"],a:1},{q:"Sudut ikatan H2O?",o:["90","104.5","180"],a:1},{q:"T = 2phi akar(l/g) adalah?",o:["Bandul","Proyektil","Sel"],a:0}];
let i=0,sc=0;
function render(){const z=Q[i];document.getElementById("q").innerHTML="<b>"+z.q+"</b>";const w=document.getElementById("opts");w.innerHTML="";z.o.forEach((t,k)=>{const b=document.createElement("button");b.textContent=t;b.style.cssText="${BTN}";b.onclick=()=>{if(k===z.a){sc++;document.getElementById("s").textContent="Skor: "+sc}i=(i+1)%Q.length;render()};w.appendChild(b)})} render();
</scr` + `ipt></div>`,
  },
  {
    id: "steps",
    title: "Tangga Langkah",
    desc: "Checklist 4 langkah belajar.",
    html: `<div style="${BASE}"><h3>Tangga Langkah</h3><div id="L"></div><p id="p"></p><script>
const S=["Baca ringkasan 10 menit","Kerjakan 5 soal","Uji ingatan tanpa contekan","Ajarkan ke teman (oral)"];
let done=[];
function render(){const w=document.getElementById("L");w.innerHTML="";S.forEach((t,k)=>{const b=document.createElement("button");const on=done.includes(k);b.textContent=(on?"[x] ":"[ ] ")+t;b.style.cssText="display:block;width:100%;text-align:left;margin-top:6px;background:"+(on?"#134e4a":"#1e293b")+";color:#e2e8f0;border:1px solid #334155;border-radius:8px;padding:8px;cursor:pointer";b.onclick=()=>{done=done.includes(k)?done.filter(x=>x!==k):[...done,k];render()};w.appendChild(b)});document.getElementById("p").textContent="Progres: "+done.length+"/"+S.length} render();
</scr` + `ipt></div>`,
  },
]
