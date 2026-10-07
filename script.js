const defaultSoftware = [
  {name:"Photoshop", icon:"🎨"},
  {name:"Illustrator", icon:"🖌️"},
  {name:"CLIP STUDIO PAINT", icon:"✏️"},
  {name:"Canva", icon:"🖼️"},
  {name:"Figma", icon:"🧩"},
  {name:"Excel", icon:"📊"},
  {name:"Word", icon:"📝"},
  {name:"HTML/CSS", icon:"💻"},
  {name:"JavaScript", icon:"⚙️"},
  {name:"なし", icon:"➖"}
];

let data = JSON.parse(localStorage.getItem("levelUpApp") || "null") || {
  selected: defaultSoftware.map(x=>x.name),
  skills: {},
  history: []
};

function save(){localStorage.setItem("levelUpApp",JSON.stringify(data))}
function ensureSkills(){
  data.selected.forEach(name=>{if(!data.skills[name]) data.skills[name]={exp:0,uses:0,minutes:0}})
}
function levelInfo(exp){
  let level=1, need=100;
  while(exp>=need){exp-=need; level++; need=Math.round(need*1.35)}
  return {level,current:exp,need};
}
function totalExp(){return Object.values(data.skills).reduce((a,b)=>a+b.exp,0)}

function renderSoftware(){
  const list=document.getElementById("softwareList");
  list.innerHTML=data.selected.map(name=>{
    const s=data.skills[name]||{exp:0};
    const l=levelInfo(s.exp);
    const item=defaultSoftware.find(x=>x.name===name);
    return `<div class="software selected" data-name="${escapeHtml(name)}">
      <div class="name">${item?.icon||"🛠️"} ${escapeHtml(name)}</div>
      <div class="lv">Lv.${l.level}　${s.exp} EXP</div>
    </div>`;
  }).join("");
  document.getElementById("software").innerHTML=data.selected.map(x=>`<option>${escapeHtml(x)}</option>`).join("");
}
function renderSkills(){
  const el=document.getElementById("skillList");
  ensureSkills();
  el.innerHTML=data.selected.map(name=>{
    const s=data.skills[name], l=levelInfo(s.exp), pct=Math.min(100,l.current/l.need*100);
    return `<div class="skill">
      <div class="skill-top"><span class="skill-name">${escapeHtml(name)}　Lv.${l.level}</span><span class="skill-exp">${l.current} / ${l.need} EXP</span></div>
      <div class="mini-bar"><span style="width:${pct}%"></span></div>
      <small>使用 ${s.uses}回・作業時間 ${s.minutes}分</small>
    </div>`;
  }).join("");
}
function renderAchievements(){
  const total=totalExp();
  const workCount=data.history.length;
  const minutes=data.history.reduce((a,x)=>a+(x.minutes||0),0);
  const achievements=[
    ["🌱 はじめの一歩","最初の作業を記録",workCount>=1],
    ["⭐ 10回達成","作業を10回記録",workCount>=10],
    ["🔥 50回達成","作業を50回記録",workCount>=50],
    ["💎 100回達成","作業を100回記録",workCount>=100],
    ["✨ 100 EXP","合計100 EXPを獲得",total>=100],
    ["🏆 500 EXP","合計500 EXPを獲得",total>=500],
    ["👑 1000 EXP","合計1000 EXPを獲得",total>=1000],
    ["⏱️ 10時間","累計10時間作業",minutes>=600]
  ];
  document.getElementById("achievementList").innerHTML=achievements.map(a=>
    `<div class="achievement ${a[2]?"":"locked"}"><strong>${a[0]}</strong><small>${a[1]} ${a[2]?"✓":"🔒"}</small></div>`
  ).join("");
}
function drawGrowthChart(){
  const c=document.getElementById("growthChart"),ctx=c.getContext("2d");
  const dpr=window.devicePixelRatio||1,w=c.clientWidth||600,h=180;
  c.width=w*dpr;c.height=h*dpr;ctx.scale(dpr,dpr);ctx.clearRect(0,0,w,h);
  const records=data.history.slice(-20);
  if(!records.length){ctx.font="14px sans-serif";ctx.fillText("作業を記録すると成長グラフが表示されます。",10,30);return;}
  let sum=0;const vals=records.map(x=>sum+=x.exp),max=Math.max(...vals,100);
  ctx.strokeStyle="#d8d5cc";ctx.lineWidth=1;
  for(let i=0;i<4;i++){const y=20+i*(h-45)/3;ctx.beginPath();ctx.moveTo(35,y);ctx.lineTo(w-10,y);ctx.stroke();}
  ctx.strokeStyle="#4f6f52";ctx.lineWidth=3;ctx.beginPath();
  vals.forEach((v,i)=>{const x=35+i*(w-50)/Math.max(1,vals.length-1),y=20+(h-45)*(1-v/max);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});
  ctx.stroke();
  ctx.fillStyle="#39423d";ctx.font="12px sans-serif";ctx.fillText(`直近${records.length}件の累計EXP`,10,170);
}
function render(){
  ensureSkills();
  const total=totalExp(), l=levelInfo(total), pct=l.current/l.need*100;
  document.getElementById("totalLevel").textContent=`Lv.${l.level}`;
  document.getElementById("totalExp").textContent=`${total} EXP`;
  document.getElementById("totalBar").style.width=`${pct}%`;
  document.getElementById("totalNext").textContent=`次のレベルまで ${l.need-l.current} EXP`;
  const minutes=data.history.reduce((a,x)=>a+(x.minutes||0),0);
  document.getElementById("workCount").textContent=data.history.length;
  document.getElementById("totalMinutes").textContent=minutes>=60?`${Math.floor(minutes/60)}時間${minutes%60}分`:`${minutes}分`;
  document.getElementById("earnedExp").textContent=total;
  document.getElementById("history").innerHTML=data.history.slice().reverse().map(x=>
    `<div class="history-item"><div><b>${escapeHtml(x.name)}</b><br><small>${escapeHtml(x.category)}・${escapeHtml(x.software)}・${x.date}</small></div><span class="exp">+${x.exp} EXP</span></div>`
  ).join("") || "<p>まだ記録がありません。</p>";
  renderSoftware();renderSkills();renderAchievements();drawGrowthChart();
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

document.getElementById("workForm").addEventListener("submit",e=>{
  e.preventDefault();
  const software=document.getElementById("software").value;
  const category=document.getElementById("category").value;
  const name=document.getElementById("workName").value.trim();
  const minutes=Number(document.getElementById("minutes").value)||0;
  const difficulty=Number(document.getElementById("difficulty").value);
  const exp=10+difficulty*10+Math.min(30,Math.floor(minutes/30)*5);
  ensureSkills();
  data.skills[software].exp+=exp;
  data.skills[software].uses++;
  data.skills[software].minutes+=minutes;
  data.history.push({name,category,software,minutes,exp,date:new Date().toLocaleString("ja-JP")});
  save(); e.target.reset(); render();
  alert(`記録しました！ +${exp} EXP`);
});
document.getElementById("addSoftwareBtn").addEventListener("click",()=>{
  const name=prompt("追加するソフト名を入力してください");
  if(!name)return;
  if(!data.selected.includes(name)){data.selected.push(name);ensureSkills();save();render();}
});
document.getElementById("resetBtn").addEventListener("click",()=>{
  if(confirm("すべての記録を削除して初期化しますか？")){
    localStorage.removeItem("levelUpApp"); location.reload();
  }
});
render();

window.addEventListener("resize",drawGrowthChart);
