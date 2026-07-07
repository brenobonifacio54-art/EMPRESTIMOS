// @ts-nocheck
import React, { useState, useEffect } from "react";

const SUPA_URL = "https://qptkhnkvurtxwsovmmzi.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwdGtobmt2dXJ0eHdzb3ZtbXppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNzk1NTQsImV4cCI6MjA5ODk1NTU1NH0.9n9uZpT4lbxA7zUmEtaX6Ws2Hu7cB2HXtp7jLBdRp0U";
const USER_ID = "breno";
const SENHA = "BNnotas123@";

async function sbGet(table) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${table}?user_id=eq.${USER_ID}&order=created_at.asc`, {
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
  });
  return res.json();
}
async function sbInsert(table, data) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({ ...data, user_id: USER_ID }),
  });
  return res.json();
}
async function sbUpdate(table, id, data) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: "PATCH",
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify(data),
  });
  return res.json();
}
async function sbDelete(table, id) {
  await fetch(`${SUPA_URL}/rest/v1/${table}?id=eq.${id}`, {
    method: "DELETE",
    headers: { apikey: SUPA_KEY, Authorization: `Bearer ${SUPA_KEY}` },
  });
}

const BG = "#0d0d1a";
const CC = {
  bom:    { l:"Bom pagador",  c:"#1ec882", bg:"rgba(30,200,130,0.15)", icon:"⭐" },
  neutro: { l:"Neutro",       c:"#aaa",    bg:"rgba(255,255,255,0.08)", icon:"👤" },
  atencao:{ l:"Atenção",      c:"#ffb400", bg:"rgba(255,180,0,0.15)",  icon:"⚠️" },
  mau:    { l:"Mau pagador",  c:"#ff5050", bg:"rgba(220,50,50,0.15)",  icon:"🚫" },
};

function mon(n){ return Number(n||0).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }
function tot(v,j){ const a=parseFloat(v)||0,b=parseFloat(j)||0; return a+a*b/100; }
function expired(dt,st){ return !(!dt||st==="pago") && new Date(dt+"T23:59:59") < new Date(); }
function daysLeft(dt,st){ if(!dt||st==="pago") return null; return Math.ceil((new Date(dt+"T23:59:59")-new Date())/864e5); }
function initials(n){ return (n||"").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase(); }

const inp = { width:"100%", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:8, color:"#fff", padding:"9px 11px", fontSize:16, fontFamily:"inherit", marginBottom:10, outline:"none", boxSizing:"border-box" };

const card = { background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:14, padding:16, marginBottom:10 };

function Btn({ ch, fn, type="def", disabled=false }){
  const styles = {
    def: { background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", color:"#fff", borderRadius:8, padding:"7px 13px", cursor:"pointer", fontFamily:"inherit", fontSize:16 },
    pri: { background:"linear-gradient(135deg,#1ec882,#14a064)", border:"none", color:"#fff", borderRadius:8, padding:"9px 18px", cursor:"pointer", fontFamily:"inherit", fontSize:16, fontWeight:600, opacity:disabled?0.5:1 },
    red: { background:"rgba(220,50,50,0.2)", border:"1px solid rgba(220,80,80,0.4)", color:"#ff8080", borderRadius:8, padding:"7px 11px", cursor:"pointer", fontFamily:"inherit", fontSize:16 },
    grn: { background:"rgba(37,211,102,0.12)", border:"1px solid rgba(37,211,102,0.35)", color:"#64f096", borderRadius:8, padding:"6px 11px", cursor:"pointer", fontFamily:"inherit", fontSize:16 },
  };
  return <button onClick={fn} disabled={disabled} style={styles[type]}>{ch}</button>;
}
function Label({ t }){ return <div style={{fontSize:11,color:"#888",marginBottom:3,textTransform:"uppercase",letterSpacing:"0.05em"}}>{t}</div>; }
function Overlay({ children, onClose }){
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:16}}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#111827",border:"1px solid rgba(255,255,255,0.15)",borderRadius:20,padding:24,width:"100%",maxWidth:440,maxHeight:"90vh",overflowY:"auto",color:"#fff",fontFamily:"inherit"}}>
        {children}
      </div>
    </div>
  );
}
function Spinner(){ return <div style={{textAlign:"center",padding:40,color:"#666"}}>Carregando...</div>; }

function LoginPage({ onLogin }){
  const [p,setP]=useState("");
  const [err,setErr]=useState("");
  function go(){ if(p===SENHA){ onLogin(); } else { setErr("Senha incorreta."); } }
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:BG,fontFamily:"'Inter',sans-serif",padding:20}}>
      <div style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:24,padding:"36px 28px",width:340,maxWidth:"100%",color:"#fff",textAlign:"center"}}>
        <div style={{fontSize:40,marginBottom:12}}>💰</div>
        <h2 style={{margin:"0 0 4px",fontSize:22}}>Emprestimos BN8K</h2>
        <p style={{color:"#666",fontSize:16,margin:"0 0 24px"}}>Acesso privado</p>
        {err&&<div style={{background:"rgba(220,50,50,0.15)",border:"1px solid rgba(220,80,80,0.3)",borderRadius:8,padding:"8px 12px",fontSize:16,color:"#ff8888",marginBottom:12}}>{err}</div>}
        <Label t="Senha de acesso"/>
        <input style={inp} type="password" placeholder="••••••••" value={p} onChange={e=>{setP(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&go()}/>
        <button onClick={go} style={{width:"100%",padding:11,fontSize:14,borderRadius:10,background:"linear-gradient(135deg,#1ec882,#14a064)",border:"none",color:"#fff",fontFamily:"inherit",fontWeight:600,cursor:"pointer"}}>
          Entrar
        </button>
      </div>
    </div>
  );
}

function Emprestimos({ loans, clients, loading, reload }){
  const [show,setShow]=useState(false);
  const [form,setForm]=useState({cliente_id:"",valor:"",juros:"",parcelas:"",vencimento:"",status:"pendente"});
  const [editId,setEditId]=useState(null);
  const [filt,setFilt]=useState("todos");
  const [search,setSearch]=useState("");
  const [showDrop,setShowDrop]=useState(false);
  const [saving,setSaving]=useState(false);

  const gc=id=>clients.find(c=>c.id===id);
  const filtered=loans.filter(l=>filt==="todos"?true:filt==="vencido"?expired(l.vencimento,l.status):l.status===filt);
  const dropList=clients.filter(c=>c.nome.toLowerCase().includes(search.toLowerCase())&&search.length>0&&!form.cliente_id);
  const alertas=loans.filter(l=>{const d=daysLeft(l.vencimento,l.status);return d!==null&&d>=0&&d<=5;});
  const nv=loans.filter(l=>expired(l.vencimento,l.status)).length;
  const selCli=form.cliente_id?gc(form.cliente_id):null;

  function openNew(){ setForm({cliente_id:"",valor:"",juros:"",parcelas:"",vencimento:"",status:"pendente"}); setEditId(null); setSearch(""); setShow(true); }
  function openEdit(l){ setForm({cliente_id:l.cliente_id,valor:l.valor,juros:l.juros,parcelas:l.parcelas,vencimento:l.vencimento,status:l.status}); setEditId(l.id); setSearch(gc(l.cliente_id)?.nome||""); setShow(true); }

  async function save(){
    if(!form.cliente_id||!form.valor||!form.vencimento) return;
    setSaving(true);
    if(editId) await sbUpdate("emprestimos",editId,{cliente_id:form.cliente_id,valor:parseFloat(form.valor),juros:parseFloat(form.juros)||0,parcelas:parseInt(form.parcelas)||1,vencimento:form.vencimento,status:form.status});
    else await sbInsert("emprestimos",{cliente_id:form.cliente_id,valor:parseFloat(form.valor),juros:parseFloat(form.juros)||0,parcelas:parseInt(form.parcelas)||1,vencimento:form.vencimento,status:form.status});
    setSaving(false); setShow(false); reload();
  }
  async function togglePago(l){ await sbUpdate("emprestimos",l.id,{status:l.status==="pago"?"pendente":"pago"}); reload(); }
  async function remove(id){ await sbDelete("emprestimos",id); reload(); }

  const fbSt=(k,red)=>({background:filt===k?(red?"rgba(220,50,50,0.2)":"rgba(30,200,130,0.2)"):"transparent",border:"1px solid "+(filt===k?(red?"rgba(220,80,80,0.5)":"rgba(30,200,130,0.5)"):"rgba(255,255,255,0.15)"),borderRadius:20,color:filt===k?(red?"#ff8888":"#80ffcc"):"#888",padding:"5px 13px",cursor:"pointer",fontSize:16,fontFamily:"inherit"});

  if(loading) return <Spinner/>;
  return (
    <div>
      {alertas.length>0&&<div style={{background:"rgba(255,160,0,0.08)",border:"1px solid rgba(255,160,0,0.3)",borderRadius:12,padding:"12px 14px",marginBottom:16}}>
        <div style={{fontSize:16,fontWeight:600,color:"#ffcc50",marginBottom:8}}>🔔 Vencimentos próximos ({alertas.length})</div>
        {alertas.map(l=>{const cli=gc(l.cliente_id);const d=daysLeft(l.vencimento,l.status);return<div key={l.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderTop:"1px solid rgba(255,255,255,0.05)"}}>
          <span style={{fontSize:16}}>{d===0?"🔴":d<=2?"🟠":"🟡"} {cli?.nome||"—"} — {d===0?"hoje":d===1?"amanhã":d+" dias"}</span>
          <span style={{fontSize:16,fontWeight:600,color:"#ffcc50"}}>{mon(tot(l.valor,l.juros))}</span>
        </div>;})}
      </div>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><div style={{fontSize:18,fontWeight:700}}>Empréstimos</div><div style={{fontSize:16,color:"#666"}}>{loans.length} registro{loans.length!==1?"s":""}</div></div>
        <Btn ch="+ Novo" fn={openNew} type="pri"/>
      </div>
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        {[{k:"todos",l:"Todos"},{k:"pendente",l:"Pendentes"},{k:"pago",l:"Pagos"},{k:"vencido",l:"Vencidos"+(nv>0?" ("+nv+")":"")}].map(x=><button key={x.k} style={fbSt(x.k,x.k==="vencido")} onClick={()=>setFilt(x.k)}>{x.l}</button>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:16}}>
        {[{l:"Emprestado",v:loans.reduce((s,l)=>s+(parseFloat(l.valor)||0),0),c:"#fff"},{l:"A receber",v:loans.filter(l=>l.status==="pendente").reduce((s,l)=>s+tot(l.valor,l.juros),0),c:"#ffcc50"},{l:"Recebido",v:loans.filter(l=>l.status==="pago").reduce((s,l)=>s+tot(l.valor,l.juros),0),c:"#1ec882"}].map(k=>(
          <div key={k.l} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:12,flex:1}}>
            <div style={{fontSize:10,color:"#666",marginBottom:4,textTransform:"uppercase"}}>{k.l}</div>
            <div style={{fontSize:16,fontWeight:700,color:k.c}}>{mon(k.v)}</div>
          </div>
        ))}
      </div>
      {filtered.length===0&&<div style={{textAlign:"center",padding:40,color:"#444"}}>Nenhum empréstimo.</div>}
      {filtered.map(l=>{
        const vc=expired(l.vencimento,l.status);const cli=gc(l.cliente_id);const cfg=CC[cli?.classificacao||"neutro"];const d=daysLeft(l.vencimento,l.status);
        return<div key={l.id} style={{...card,borderColor:vc?"rgba(220,80,80,0.4)":l.status==="pago"?"rgba(30,180,120,0.3)":"rgba(255,255,255,0.1)",background:vc?"rgba(220,50,50,0.08)":l.status==="pago"?"rgba(30,180,120,0.06)":"rgba(255,255,255,0.04)"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:38,height:38,borderRadius:"50%",background:cfg.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{cfg.icon}</div>
              <div><div style={{fontSize:14,fontWeight:700}}>{cli?.nome||"—"}</div><div style={{fontSize:11,color:cfg.c}}>{cfg.l}</div></div>
            </div>
            <span style={{fontSize:11,padding:"3px 9px",borderRadius:20,background:vc?"rgba(220,50,50,0.2)":l.status==="pago"?"rgba(30,180,120,0.2)":"rgba(255,180,0,0.2)",color:vc?"#ff8888":l.status==="pago"?"#80ffcc":"#ffcc50",border:"1px solid "+(vc?"rgba(220,80,80,0.3)":l.status==="pago"?"rgba(30,180,120,0.3)":"rgba(255,180,0,0.3)")}}>{vc?"Vencido":l.status==="pago"?"Pago":"Pendente"}</span>
          </div>
          {cli?.indicado_por&&<div style={{fontSize:11,color:"#88aaff",marginBottom:6}}>🤝 Indicado por: <b>{cli.indicado_por}</b></div>}
          {cli?.observacao&&<div style={{fontSize:11,color:"#ffcc88",background:"rgba(255,180,0,0.07)",borderRadius:6,padding:"4px 8px",marginBottom:6}}>📝 {cli.observacao}</div>}
          <div style={{display:"flex",gap:12,flexWrap:"wrap",fontSize:16,color:"#888",marginBottom:10}}>
            <span>Capital <b style={{color:"#ccc"}}>{mon(l.valor)}</b></span>
            {l.juros?<span>Juros <b style={{color:"#ccc"}}>{l.juros}%</b></span>:null}
            {l.parcelas>1?<span>{l.parcelas}x <b style={{color:"#ccc"}}>{mon(tot(l.valor,l.juros)/l.parcelas)}</b></span>:null}
            {l.vencimento?<span>Venc. <b style={{color:"#ccc"}}>{new Date(l.vencimento+"T12:00:00").toLocaleDateString("pt-BR")}</b></span>:null}
            <span>Total <b style={{color:vc?"#ff8888":"#fff"}}>{mon(tot(l.valor,l.juros))}</b></span>
          </div>
          {d!==null&&d>=0&&d<=5&&<div style={{fontSize:11,color:d===0?"#ff8888":d<=2?"#ffaa50":"#ffcc50",marginBottom:8}}>{d===0?"⏰ Vence hoje":d===1?"⏰ Vence amanhã":"⏰ Vence em "+d+" dias"}</div>}
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            <Btn ch={l.status==="pago"?"↩ Reabrir":"✓ Pago"} fn={()=>togglePago(l)}/>
            <Btn ch="✏" fn={()=>openEdit(l)}/>
            {cli?.telefone&&<Btn type="grn" ch="💬 WhatsApp" fn={()=>{const n=cli.telefone.replace(/\D/g,"");window.open("https://wa.me/"+(n.startsWith("55")?n:"55"+n),"_blank");}}/>}
            <Btn type="red" ch="🗑" fn={()=>remove(l.id)}/>
          </div>
        </div>;
      })}
      {show&&<Overlay onClose={()=>setShow(false)}>
        <div style={{fontSize:16,fontWeight:700,marginBottom:16}}>{editId?"Editar":"Novo empréstimo"}</div>
        <Label t="Cliente *"/>
        <div style={{position:"relative",marginBottom:10}}>
          <input style={{...inp,marginBottom:0,paddingLeft:32}} placeholder="Buscar cliente..." value={search} onChange={e=>{setSearch(e.target.value);setForm(f=>({...f,cliente_id:""}));setShowDrop(true);}} onFocus={()=>search.length>0&&setShowDrop(true)}/>
          <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#666",pointerEvents:"none"}}>🔍</span>
          {showDrop&&dropList.length>0&&<div style={{position:"absolute",width:"100%",zIndex:10,top:"100%",marginTop:4,background:"#1a1a2e",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,overflow:"hidden"}}>
            {dropList.map(c=>{const cfg=CC[c.classificacao||"neutro"];return<div key={c.id} onClick={()=>{setForm(f=>({...f,cliente_id:c.id}));setSearch(c.nome);setShowDrop(false);}} style={{padding:"10px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:8,borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
              <span>{cfg.icon}</span><div><div style={{fontSize:16}}>{c.nome}</div><div style={{fontSize:11,color:cfg.c}}>{cfg.l}</div></div>
            </div>;})}
          </div>}
        </div>
        {selCli?.classificacao==="mau"&&<div style={{background:"rgba(220,50,50,0.12)",border:"1px solid rgba(220,80,80,0.3)",borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:16,color:"#ff8888"}}>🚫 Atenção: Mau pagador!</div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <div><Label t="Valor R$ *"/><input style={inp} type="number" placeholder="0,00" value={form.valor} onChange={e=>setForm(f=>({...f,valor:e.target.value}))}/></div>
          <div><Label t="Juros %"/><input style={inp} type="number" placeholder="0" value={form.juros} onChange={e=>setForm(f=>({...f,juros:e.target.value}))}/></div>
          <div><Label t="Parcelas"/><input style={inp} type="number" placeholder="1" value={form.parcelas} onChange={e=>setForm(f=>({...f,parcelas:e.target.value}))}/></div>
          <div><Label t="Vencimento *"/><input style={inp} type="date" value={form.vencimento} onChange={e=>setForm(f=>({...f,vencimento:e.target.value}))}/></div>
        </div>
        <Label t="Status"/>
        <select style={inp} value={form.status} onChange={e=>setForm(f=>({...f,status:e.target.value}))}><option value="pendente">Pendente</option><option value="pago">Pago</option></select>
        {form.valor&&<div style={{background:"rgba(30,200,130,0.08)",border:"1px solid rgba(30,200,130,0.2)",borderRadius:8,padding:"8px 12px",marginBottom:10,fontSize:16,color:"#aaa"}}>Total: <b style={{color:"#80ffcc"}}>{mon(tot(form.valor,form.juros))}</b></div>}
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
          <Btn ch="Cancelar" fn={()=>setShow(false)}/>
          <Btn ch={saving?"Salvando...":editId?"Salvar":"Cadastrar"} fn={save} type="pri" disabled={saving}/>
        </div>
      </Overlay>}
    </div>
  );
}

function Clientes({ loans, clients, loading, reload }){
  const [show,setShow]=useState(false);
  const [form,setForm]=useState({nome:"",telefone:"",cpf:"",classificacao:"neutro",observacao:"",indicado_por:""});
  const [editId,setEditId]=useState(null);
  const [search,setSearch]=useState("");
  const [saving,setSaving]=useState(false);

  const filtered=clients.filter(c=>c.nome.toLowerCase().includes(search.toLowerCase())||(c.telefone||"").includes(search));
  function openNew(){ setForm({nome:"",telefone:"",cpf:"",classificacao:"neutro",observacao:"",indicado_por:""}); setEditId(null); setShow(true); }
  function openEdit(c){ setForm({nome:c.nome,telefone:c.telefone||"",cpf:c.cpf||"",classificacao:c.classificacao,observacao:c.observacao||"",indicado_por:c.indicado_por||""}); setEditId(c.id); setShow(true); }
  async function save(){ if(!form.nome)return; setSaving(true); if(editId)await sbUpdate("clientes",editId,form); else await sbInsert("clientes",form); setSaving(false); setShow(false); reload(); }
  async function remove(id){ await sbDelete("clientes",id); reload(); }

  if(loading) return <Spinner/>;
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><div style={{fontSize:18,fontWeight:700}}>Clientes</div><div style={{fontSize:16,color:"#666"}}>{clients.length} cadastrado{clients.length!==1?"s":""}</div></div>
        <Btn ch="+ Cadastrar" fn={openNew} type="pri"/>
      </div>
      <div style={{position:"relative",marginBottom:14}}>
        <input style={{...inp,marginBottom:0,paddingLeft:32}} placeholder="Buscar..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",color:"#666",pointerEvents:"none"}}>🔍</span>
      </div>
      <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
        {Object.entries(CC).map(([k,v])=>{const cnt=clients.filter(c=>c.classificacao===k).length;if(!cnt)return null;return<span key={k} style={{background:v.bg,borderRadius:20,padding:"3px 10px",fontSize:11,color:v.c}}>{v.icon} {v.l} ({cnt})</span>;})}
      </div>
      {filtered.length===0&&<div style={{textAlign:"center",padding:40,color:"#444"}}>Nenhum cliente.</div>}
      {filtered.map(c=>{const cfg=CC[c.classificacao||"neutro"];const ec=loans.filter(l=>l.cliente_id===c.id).length;return(
        <div key={c.id} style={{...card,display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:42,height:42,borderRadius:"50%",background:cfg.bg,display:"flex",alignItems:"center",justifyContent:"center",color:cfg.c,fontWeight:700,fontSize:16,flexShrink:0}}>{initials(c.nome)}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div><div style={{fontSize:14,fontWeight:700}}>{c.nome}</div><div style={{fontSize:16,color:"#666"}}>{c.telefone||"—"}{c.cpf?" · "+c.cpf:""}</div></div>
              <span style={{fontSize:11,padding:"3px 9px",borderRadius:20,background:cfg.bg,color:cfg.c,flexShrink:0}}>{cfg.icon} {cfg.l}</span>
            </div>
            {c.indicado_por&&<div style={{fontSize:11,color:"#88aaff",marginTop:4}}>🤝 Indicado por: <b>{c.indicado_por}</b></div>}
            {c.observacao&&<div style={{fontSize:11,color:"#ffcc88",marginTop:4}}>📝 {c.observacao}</div>}
            <div style={{fontSize:11,color:"#555",marginTop:4}}>{ec} empréstimo{ec!==1?"s":""}</div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:6}}>
            <Btn ch="✏" fn={()=>openEdit(c)}/>
            <Btn ch="🗑" fn={()=>remove(c.id)} type="red"/>
          </div>
        </div>
      );})}
      {show&&<Overlay onClose={()=>setShow(false)}>
        <div style={{fontSize:16,fontWeight:700,marginBottom:16}}>{editId?"Editar":"Novo cliente"}</div>
        <Label t="Nome *"/><input style={inp} placeholder="Nome completo" value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))}/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <div><Label t="Telefone"/><input style={inp} placeholder="(00)00000-0000" value={form.telefone} onChange={e=>setForm(f=>({...f,telefone:e.target.value}))}/></div>
          <div><Label t="CPF"/><input style={inp} placeholder="000.000.000-00" value={form.cpf} onChange={e=>setForm(f=>({...f,cpf:e.target.value}))}/></div>
        </div>
        <Label t="Indicado por"/><input style={inp} placeholder="Nome de quem indicou (opcional)" value={form.indicado_por||""} onChange={e=>setForm(f=>({...f,indicado_por:e.target.value}))}/>
        <Label t="Classificação"/>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
          {Object.entries(CC).map(([k,v])=><button key={k} onClick={()=>setForm(f=>({...f,classificacao:k}))} style={{borderRadius:20,padding:"6px 12px",cursor:"pointer",fontSize:16,fontFamily:"inherit",background:form.classificacao===k?v.bg:"rgba(255,255,255,0.05)",border:"1px solid "+(form.classificacao===k?v.c:"rgba(255,255,255,0.1)"),color:form.classificacao===k?v.c:"#666"}}>{v.icon} {v.l}</button>)}
        </div>
        <Label t="Observação"/><textarea style={{...inp,resize:"vertical"}} rows={2} placeholder="Observações..." value={form.observacao} onChange={e=>setForm(f=>({...f,observacao:e.target.value}))}/>
        <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:4}}>
          <Btn ch="Cancelar" fn={()=>setShow(false)}/>
          <Btn ch={saving?"Salvando...":editId?"Salvar":"Cadastrar"} fn={save} type="pri" disabled={saving}/>
        </div>
      </Overlay>}
    </div>
  );
}

function Relatorio({ loans, clients, loading }){
  if(loading) return <Spinner/>;
  const now=new Date();
  const T=loans.reduce((s,l)=>s+(parseFloat(l.valor)||0),0);
  const J=loans.reduce((s,l)=>s+(tot(l.valor,l.juros)-(parseFloat(l.valor)||0)),0);
  const CJ=loans.reduce((s,l)=>s+tot(l.valor,l.juros),0);
  const R=loans.filter(l=>l.status==="pago").reduce((s,l)=>s+tot(l.valor,l.juros),0);
  const AB=loans.filter(l=>l.status==="pendente").reduce((s,l)=>s+tot(l.valor,l.juros),0);
  const VL=loans.filter(l=>expired(l.vencimento,l.status));
  const TV=VL.reduce((s,l)=>s+tot(l.valor,l.juros),0);
  const taxa=CJ>0?((R/CJ)*100).toFixed(1):0;
  const MN=["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  const meses=Array.from({length:6},(_,i)=>{
    const d=new Date(now.getFullYear(),now.getMonth()-(5-i),1);
    const m=d.getMonth(),y=d.getFullYear();
    const em=loans.filter(l=>{if(!l.vencimento)return false;const ld=new Date(l.vencimento);return ld.getMonth()===m&&ld.getFullYear()===y;});
    return{lbl:MN[m]+"/"+String(y).slice(2),emp:em.reduce((s,l)=>s+(parseFloat(l.valor)||0),0),rec:em.filter(l=>l.status==="pago").reduce((s,l)=>s+tot(l.valor,l.juros),0),cnt:em.length};
  });
  const mMax=Math.max(...meses.map(m=>Math.max(m.emp,m.rec)),1);
  const top=clients.map(c=>{const cl=loans.filter(l=>l.cliente_id===c.id);return{...c,tv:cl.reduce((s,l)=>s+tot(l.valor,l.juros),0),cnt:cl.length};}).filter(c=>c.cnt>0).sort((a,b)=>b.tv-a.tv).slice(0,5);
  const sh={fontSize:16,fontWeight:700,color:"#666",textTransform:"uppercase",marginBottom:10};
  const row={display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,0.05)"};
  return (
    <div>
      <div style={{fontSize:18,fontWeight:700,marginBottom:4}}>Relatório</div>
      <div style={{fontSize:16,color:"#666",marginBottom:20}}>{loans.length} empréstimos · {clients.length} clientes</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:24}}>
        {[{l:"Capital",v:mon(T),c:"#fff"},{l:"Juros",v:mon(J),c:"#ffcc50"},{l:"Total",v:mon(CJ),c:"#fff"},{l:"Recebido",v:mon(R),c:"#1ec882"},{l:"Em aberto",v:mon(AB),c:"#ffcc50"},{l:"Em atraso",v:mon(TV),c:TV>0?"#ff6666":"#555"}].map(k=>(
          <div key={k.l} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:12}}>
            <div style={{fontSize:10,color:"#666",marginBottom:4,textTransform:"uppercase"}}>{k.l}</div>
            <div style={{fontSize:14,fontWeight:700,color:k.c}}>{k.v}</div>
          </div>
        ))}
      </div>
      <div style={{marginBottom:24}}>
        <div style={sh}>Taxa de recebimento</div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{flex:1,height:10,background:"rgba(255,255,255,0.07)",borderRadius:10,overflow:"hidden"}}>
            <div style={{height:10,width:taxa+"%",background:"linear-gradient(90deg,#1ec882,#80ffcc)",borderRadius:10}}/>
          </div>
          <span style={{fontSize:16,fontWeight:700,color:"#1ec882",minWidth:44}}>{taxa}%</span>
        </div>
      </div>
      <div style={{marginBottom:24}}>
        <div style={sh}>Últimos 6 meses</div>
        {meses.map(m=>(
          <div key={m.lbl} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"10px 12px",marginBottom:6}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:16,marginBottom:6}}><b>{m.lbl}</b><span style={{color:"#555"}}>{m.cnt} empréstimo{m.cnt!==1?"s":""}</span></div>
            {m.emp>0&&<><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#666",marginBottom:3}}><span>Emprestado</span><span>{mon(m.emp)}</span></div><div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:6,overflow:"hidden",marginBottom:6}}><div style={{height:6,width:(m.emp/mMax*100)+"%",background:"rgba(100,150,255,0.7)",borderRadius:6}}/></div></>}
            {m.rec>0&&<><div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#666",marginBottom:3}}><span>Recebido</span><span style={{color:"#1ec882"}}>{mon(m.rec)}</span></div><div style={{height:6,background:"rgba(255,255,255,0.06)",borderRadius:6,overflow:"hidden"}}><div style={{height:6,width:(m.rec/mMax*100)+"%",background:"rgba(30,200,130,0.7)",borderRadius:6}}/></div></>}
            {m.emp===0&&<div style={{fontSize:11,color:"#444",textAlign:"center"}}>Sem movimentação</div>}
          </div>
        ))}
      </div>
      {VL.length>0&&<div style={{marginBottom:24}}>
        <div style={{...sh,color:"#ff6666"}}>⚠ Inadimplência ({VL.length})</div>
        {VL.map(l=>{const c=clients.find(x=>x.id===l.cliente_id);const dias=Math.floor((new Date()-new Date(l.vencimento+"T23:59:59"))/864e5);return<div key={l.id} style={row}>
          <div><div style={{fontSize:16,fontWeight:600}}>{c?.nome||"—"}</div><div style={{fontSize:11,color:"#ff6666"}}>{dias} dia{dias!==1?"s":""} em atraso</div></div>
          <div style={{textAlign:"right"}}><div style={{fontWeight:700,color:"#ff8888"}}>{mon(tot(l.valor,l.juros))}</div><div style={{fontSize:11,color:"#555"}}>{new Date(l.vencimento+"T12:00:00").toLocaleDateString("pt-BR")}</div></div>
        </div>;})}
      </div>}
      {top.length>0&&<div style={{marginBottom:24}}>
        <div style={sh}>Top clientes</div>
        {top.map((c,i)=>{const cfg=CC[c.classificacao||"neutro"];return<div key={c.id} style={row}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{color:"#444",minWidth:20}}>#{i+1}</span>
            <div style={{width:30,height:30,borderRadius:"50%",background:cfg.bg,display:"flex",alignItems:"center",justifyContent:"center",color:cfg.c,fontSize:11,fontWeight:700}}>{initials(c.nome)}</div>
            <div><div style={{fontSize:16,fontWeight:600}}>{c.nome}</div><div style={{fontSize:11,color:cfg.c}}>{cfg.l}{c.indicado_por?" · via "+c.indicado_por:""}</div></div>
          </div>
          <div style={{textAlign:"right"}}><div style={{fontWeight:700}}>{mon(c.tv)}</div><div style={{fontSize:11,color:"#555"}}>{c.cnt} empréstimo{c.cnt!==1?"s":""}</div></div>
        </div>;})}
      </div>}
      {loans.length===0&&<div style={{textAlign:"center",padding:40,color:"#444"}}>Nenhum dado ainda.</div>}
    </div>
  );
}

export default function App(){
  const [logado,setLogado]=useState(false);
  const [tab,setTab]=useState("emp");
  const [loans,setLoans]=useState([]);
  const [clients,setClients]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    const inputs=document.querySelectorAll('input, select, textarea');
    inputs.forEach(input=>{
      input.addEventListener('blur',()=>{
        window.scrollTo(0,0);
        document.body.scrollTop=0;
      });
    });
  },[logado]);

  async function reload(){
    setLoading(true);
    const [c,l]=await Promise.all([sbGet("clientes"),sbGet("emprestimos")]);
    setClients(Array.isArray(c)?c:[]);
    setLoans(Array.isArray(l)?l:[]);
    setLoading(false);
  }

  useEffect(()=>{ if(logado) reload(); },[logado]);

  const tSt=t=>({background:"transparent",border:"none",color:tab===t?"#fff":"#666",padding:"10px 14px",cursor:"pointer",fontSize:16,fontFamily:"inherit",fontWeight:tab===t?700:400,borderBottom:tab===t?"2px solid #1ec882":"2px solid transparent"});

  if(!logado) return <LoginPage onLogin={()=>setLogado(true)}/>;

  return (
    <div style={{fontFamily:"'Inter',sans-serif",background:BG,minHeight:"100vh",color:"#fff"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 12px 0"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:22}}>💰</span>
          <span style={{fontSize:16,fontWeight:700}}>Emprestimos BN8K</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <button onClick={reload} style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:8,color:"#aaa",padding:"5px 10px",cursor:"pointer",fontFamily:"inherit",fontSize:16}}>↻</button>
          <Btn ch="Sair" fn={()=>setLogado(false)}/>
        </div>
      </div>
      <div style={{display:"flex",padding:"8px 12px 0",borderBottom:"1px solid rgba(255,255,255,0.07)",overflowX:"auto"}}>
        <button style={tSt("emp")} onClick={()=>setTab("emp")}>💰 Empréstimos</button>
        <button style={tSt("cli")} onClick={()=>setTab("cli")}>👥 Clientes{clients.length>0&&<span style={{background:"rgba(255,255,255,0.1)",borderRadius:10,padding:"1px 6px",fontSize:10,marginLeft:4}}>{clients.length}</span>}</button>
        <button style={tSt("rel")} onClick={()=>setTab("rel")}>📊 Relatório</button>
      </div>
      <div style={{padding:"12px 10px"}}>
        {tab==="emp"&&<Emprestimos loans={loans} clients={clients} loading={loading} reload={reload}/>}
        {tab==="cli"&&<Clientes loans={loans} clients={clients} loading={loading} reload={reload}/>}
        {tab==="rel"&&<Relatorio loans={loans} clients={clients} loading={loading}/>}
      </div>
    </div>
  );
}
