import React, { useState, useEffect } from "react";

// ── Adaptador localStorage ────────────────────────────────────────────
window.storage = {
  get: (key) =>
    Promise.resolve(
      localStorage.getItem(key) ? { value: localStorage.getItem(key) } : null
    ),
  set: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
  delete: (key) => Promise.resolve(localStorage.removeItem(key)),
};

// ── Constantes ────────────────────────────────────────────────────────
const BG = "#0d0d1a";
const CC = {
  bom: {
    l: "Bom pagador",
    c: "#1ec882",
    bg: "rgba(30,200,130,0.15)",
    icon: "⭐",
  },
  neutro: { l: "Neutro", c: "#aaa", bg: "rgba(255,255,255,0.08)", icon: "👤" },
  atencao: {
    l: "Atenção",
    c: "#ffb400",
    bg: "rgba(255,180,0,0.15)",
    icon: "⚠️",
  },
  mau: {
    l: "Mau pagador",
    c: "#ff5050",
    bg: "rgba(220,50,50,0.15)",
    icon: "🚫",
  },
};
const HINTS = [
  "Nome do seu primeiro pet?",
  "Sua cidade natal?",
  "Nome da sua mãe?",
  "Seu time de futebol?",
];

function mon(n) {
  return Number(n || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
function tot(v, j) {
  const a = parseFloat(v) || 0,
    b = parseFloat(j) || 0;
  return a + (a * b) / 100;
}
function expired(dt, st) {
  return !(!dt || st === "pago") && new Date(dt + "T23:59:59") < new Date();
}
function daysLeft(dt, st) {
  if (!dt || st === "pago") return null;
  return Math.ceil((new Date(dt + "T23:59:59") - new Date()) / 864e5);
}
function initials(n) {
  return (n || "")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return "" + h;
}

const inp = {
  width: "100%",
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.15)",
  borderRadius: 8,
  color: "#fff",
  padding: "9px 11px",
  fontSize: 13,
  fontFamily: "inherit",
  marginBottom: 10,
  outline: "none",
  boxSizing: "border-box",
};
const card = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 14,
  padding: 16,
  marginBottom: 10,
};

function Btn({ ch, fn, type = "def" }) {
  const styles = {
    def: {
      background: "rgba(255,255,255,0.1)",
      border: "1px solid rgba(255,255,255,0.2)",
      color: "#fff",
      borderRadius: 8,
      padding: "7px 13px",
      cursor: "pointer",
      fontFamily: "inherit",
      fontSize: 12,
    },
    pri: {
      background: "linear-gradient(135deg,#1ec882,#14a064)",
      border: "none",
      color: "#fff",
      borderRadius: 8,
      padding: "9px 18px",
      cursor: "pointer",
      fontFamily: "inherit",
      fontSize: 13,
      fontWeight: 600,
    },
    red: {
      background: "rgba(220,50,50,0.2)",
      border: "1px solid rgba(220,80,80,0.4)",
      color: "#ff8080",
      borderRadius: 8,
      padding: "7px 11px",
      cursor: "pointer",
      fontFamily: "inherit",
      fontSize: 12,
    },
    grn: {
      background: "rgba(37,211,102,0.12)",
      border: "1px solid rgba(37,211,102,0.35)",
      color: "#64f096",
      borderRadius: 8,
      padding: "6px 11px",
      cursor: "pointer",
      fontFamily: "inherit",
      fontSize: 12,
    },
  };
  return (
    <button onClick={fn} style={styles[type]}>
      {ch}
    </button>
  );
}

function Label({ t }) {
  return (
    <div
      style={{
        fontSize: 11,
        color: "#888",
        marginBottom: 3,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      {t}
    </div>
  );
}

function Overlay({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#111827",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 20,
          padding: 24,
          width: "100%",
          maxWidth: 440,
          maxHeight: "90vh",
          overflowY: "auto",
          color: "#fff",
          fontFamily: "inherit",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── LOGIN ─────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [p2, setP2] = useState("");
  const [mode, setMode] = useState("login");
  const [hint, setHint] = useState("");
  const [ha, setHa] = useState("");
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  async function gDB() {
    try {
      const r = await window.storage.get("__users");
      return r?.value ? JSON.parse(r.value) : {};
    } catch {
      return {};
    }
  }
  async function sDB(db) {
    await window.storage.set("__users", JSON.stringify(db));
  }

  async function go() {
    setErr("");
    setOk("");
    const db = await gDB(),
      un = u.trim().toLowerCase();
    if (mode === "login") {
      if (!u || !p) {
        setErr("Preencha usuário e senha.");
        return;
      }
      if (!db[un]) {
        setErr("Usuário não encontrado.");
        return;
      }
      if (db[un].p !== hashStr(p)) {
        setErr("Senha incorreta.");
        return;
      }
      onLogin({ username: un, name: db[un].name });
    } else if (mode === "register") {
      if (!u || !p || !p2 || !hint || !ha) {
        setErr("Preencha todos os campos.");
        return;
      }
      if (p !== p2) {
        setErr("Senhas não coincidem.");
        return;
      }
      if (p.length < 4) {
        setErr("Senha muito curta (mín. 4).");
        return;
      }
      if (db[un]) {
        setErr("Usuário já existe.");
        return;
      }
      db[un] = {
        p: hashStr(p),
        name: u.trim(),
        hint,
        ha: ha.trim().toLowerCase(),
      };
      await sDB(db);
      onLogin({ username: un, name: u.trim() });
    } else if (mode === "rec1") {
      if (!u) {
        setErr("Informe o usuário.");
        return;
      }
      if (!db[un]) {
        setErr("Usuário não encontrado.");
        return;
      }
      setHint(db[un].hint || "");
      setMode("rec2");
    } else {
      if (!ha || !p || !p2) {
        setErr("Preencha todos os campos.");
        return;
      }
      if (p !== p2) {
        setErr("Senhas não coincidem.");
        return;
      }
      if (ha.trim().toLowerCase() !== db[un].ha) {
        setErr("Resposta incorreta.");
        return;
      }
      db[un].p = hashStr(p);
      await sDB(db);
      setOk("Senha redefinida!");
      setMode("login");
      setP("");
      setP2("");
      setHa("");
    }
  }

  const isL = mode === "login",
    isR = mode === "register",
    isR1 = mode === "rec1",
    isR2 = mode === "rec2";
  const lnk = (txt, m) => (
    <button
      onClick={() => {
        setMode(m);
        setErr("");
        setOk("");
      }}
      style={{
        background: "none",
        border: "none",
        color: "#1ec882",
        cursor: "pointer",
        fontSize: 12,
        fontFamily: "inherit",
        textDecoration: "underline",
      }}
    >
      {txt}
    </button>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BG,
        fontFamily: "'Inter',sans-serif",
        padding: 20,
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 24,
          padding: "36px 28px",
          width: 360,
          maxWidth: "100%",
          color: "#fff",
        }}
      >
        <div style={{ fontSize: 32, textAlign: "center", marginBottom: 12 }}>
          💰
        </div>
        <h2 style={{ textAlign: "center", margin: "0 0 4px", fontSize: 20 }}>
          EmpréstimoPro
        </h2>
        <p
          style={{
            textAlign: "center",
            color: "#666",
            fontSize: 12,
            margin: "0 0 20px",
          }}
        >
          {isL
            ? "Entre na sua conta"
            : isR
            ? "Criar conta"
            : isR1
            ? "Recuperar senha"
            : "Nova senha"}
        </p>
        {err && (
          <div
            style={{
              background: "rgba(220,50,50,0.15)",
              border: "1px solid rgba(220,80,80,0.3)",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 12,
              color: "#ff8888",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            {err}
          </div>
        )}
        {ok && (
          <div
            style={{
              background: "rgba(30,200,130,0.1)",
              border: "1px solid rgba(30,200,130,0.3)",
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 12,
              color: "#80ffcc",
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            {ok}
          </div>
        )}
        {!isR2 && (
          <>
            <Label t="Usuário" />
            <input
              style={inp}
              placeholder="usuario"
              value={u}
              onChange={(e) => {
                setU(e.target.value);
                setErr("");
              }}
            />
          </>
        )}
        {isR2 && (
          <>
            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                borderRadius: 8,
                padding: "10px 12px",
                marginBottom: 10,
              }}
            >
              <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>
                PERGUNTA
              </div>
              <div style={{ fontSize: 13 }}>{hint}</div>
            </div>
            <Label t="Resposta" />
            <input
              style={inp}
              placeholder="Sua resposta"
              value={ha}
              onChange={(e) => {
                setHa(e.target.value);
                setErr("");
              }}
            />
          </>
        )}
        {(isL || isR) && (
          <>
            <Label t="Senha" />
            <input
              style={inp}
              type="password"
              placeholder="••••••"
              value={p}
              onChange={(e) => {
                setP(e.target.value);
                setErr("");
              }}
              onKeyDown={(e) => e.key === "Enter" && go()}
            />
          </>
        )}
        {isR2 && (
          <>
            <Label t="Nova senha" />
            <input
              style={inp}
              type="password"
              placeholder="••••••"
              value={p}
              onChange={(e) => {
                setP(e.target.value);
                setErr("");
              }}
            />
          </>
        )}
        {(isR || isR2) && (
          <>
            <Label t="Confirmar senha" />
            <input
              style={inp}
              type="password"
              placeholder="••••••"
              value={p2}
              onChange={(e) => {
                setP2(e.target.value);
                setErr("");
              }}
            />
          </>
        )}
        {isR && (
          <>
            <Label t="Pergunta de segurança" />
            <select
              style={inp}
              value={hint}
              onChange={(e) => setHint(e.target.value)}
            >
              <option value="">Selecione...</option>
              {HINTS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            {hint && (
              <>
                <Label t="Resposta secreta" />
                <input
                  style={inp}
                  placeholder="Resposta"
                  value={ha}
                  onChange={(e) => setHa(e.target.value)}
                />
              </>
            )}
          </>
        )}
        <button
          onClick={go}
          style={{
            width: "100%",
            padding: 10,
            fontSize: 14,
            borderRadius: 10,
            background: "linear-gradient(135deg,#1ec882,#14a064)",
            border: "none",
            color: "#fff",
            fontFamily: "inherit",
            fontWeight: 600,
            cursor: "pointer",
            marginTop: 4,
          }}
        >
          {isL
            ? "Entrar"
            : isR
            ? "Criar conta"
            : isR1
            ? "Continuar"
            : "Redefinir senha"}
        </button>
        <div
          style={{
            textAlign: "center",
            marginTop: 14,
            fontSize: 12,
            color: "#666",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {isL && (
            <>
              <span>Sem conta? {lnk("Cadastre-se", "register")}</span>
              <span>Esqueceu? {lnk("Recuperar", "rec1")}</span>
            </>
          )}
          {(isR || isR1 || isR2) && <span>{lnk("← Voltar", "login")}</span>}
        </div>
      </div>
    </div>
  );
}

// ── EMPRÉSTIMOS ───────────────────────────────────────────────────────
function Emprestimos({ loans, clients, onLoans }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    clienteId: "",
    valor: "",
    juros: "",
    parcelas: "",
    vencimento: "",
    status: "pendente",
  });
  const [editId, setEditId] = useState(null);
  const [filt, setFilt] = useState("todos");
  const [search, setSearch] = useState("");
  const [showDrop, setShowDrop] = useState(false);

  const gc = (id) => clients.find((c) => c.id === id);
  const filtered = loans.filter((l) =>
    filt === "todos"
      ? true
      : filt === "vencido"
      ? expired(l.vencimento, l.status)
      : l.status === filt
  );
  const dropList = clients.filter(
    (c) =>
      c.nome.toLowerCase().includes(search.toLowerCase()) &&
      search.length > 0 &&
      !form.clienteId
  );
  const alertas = loans.filter((l) => {
    const d = daysLeft(l.vencimento, l.status);
    return d !== null && d >= 0 && d <= 5;
  });
  const nv = loans.filter((l) => expired(l.vencimento, l.status)).length;
  const selCli = form.clienteId ? gc(form.clienteId) : null;

  function openNew() {
    setForm({
      clienteId: "",
      valor: "",
      juros: "",
      parcelas: "",
      vencimento: "",
      status: "pendente",
    });
    setEditId(null);
    setSearch("");
    setShow(true);
  }
  function openEdit(l) {
    setForm({ ...l });
    setEditId(l.id);
    setSearch(gc(l.clienteId)?.nome || "");
    setShow(true);
  }
  function save() {
    if (!form.clienteId || !form.valor || !form.vencimento) return;
    if (editId)
      onLoans(
        loans.map((l) => (l.id === editId ? { ...form, id: editId } : l))
      );
    else onLoans([...loans, { ...form, id: Date.now() }]);
    setShow(false);
  }

  const fbSt = (k, red) => ({
    background:
      filt === k
        ? red
          ? "rgba(220,50,50,0.2)"
          : "rgba(30,200,130,0.2)"
        : "transparent",
    border:
      "1px solid " +
      (filt === k
        ? red
          ? "rgba(220,80,80,0.5)"
          : "rgba(30,200,130,0.5)"
        : "rgba(255,255,255,0.15)"),
    borderRadius: 20,
    color: filt === k ? (red ? "#ff8888" : "#80ffcc") : "#888",
    padding: "5px 13px",
    cursor: "pointer",
    fontSize: 12,
    fontFamily: "inherit",
  });

  return (
    <div>
      {alertas.length > 0 && (
        <div
          style={{
            background: "rgba(255,160,0,0.08)",
            border: "1px solid rgba(255,160,0,0.3)",
            borderRadius: 12,
            padding: "12px 14px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#ffcc50",
              marginBottom: 8,
            }}
          >
            🔔 Vencimentos próximos ({alertas.length})
          </div>
          {alertas.map((l) => {
            const cli = gc(l.clienteId);
            const d = daysLeft(l.vencimento, l.status);
            return (
              <div
                key={l.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "5px 0",
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                <span style={{ fontSize: 12 }}>
                  {d === 0 ? "🔴" : d <= 2 ? "🟠" : "🟡"} {cli?.nome || "—"} —{" "}
                  {d === 0 ? "hoje" : d === 1 ? "amanhã" : d + " dias"}
                </span>
                <span
                  style={{ fontSize: 12, fontWeight: 600, color: "#ffcc50" }}
                >
                  {mon(tot(l.valor, l.juros))}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Empréstimos</div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {loans.length} registro{loans.length !== 1 ? "s" : ""}
          </div>
        </div>
        <Btn ch="+ Novo" fn={openNew} type="pri" />
      </div>

      <div
        style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}
      >
        {[
          { k: "todos", l: "Todos" },
          { k: "pendente", l: "Pendentes" },
          { k: "pago", l: "Pagos" },
          { k: "vencido", l: "Vencidos" + (nv > 0 ? " (" + nv + ")" : "") },
        ].map((x) => (
          <button
            key={x.k}
            style={fbSt(x.k, x.k === "vencido")}
            onClick={() => setFilt(x.k)}
          >
            {x.l}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[
          {
            l: "Emprestado",
            v: loans.reduce((s, l) => s + (parseFloat(l.valor) || 0), 0),
            c: "#fff",
          },
          {
            l: "A receber",
            v: loans
              .filter((l) => l.status === "pendente")
              .reduce((s, l) => s + tot(l.valor, l.juros), 0),
            c: "#ffcc50",
          },
          {
            l: "Recebido",
            v: loans
              .filter((l) => l.status === "pago")
              .reduce((s, l) => s + tot(l.valor, l.juros), 0),
            c: "#1ec882",
          },
        ].map((k) => (
          <div
            key={k.l}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              padding: 12,
              flex: 1,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#666",
                marginBottom: 4,
                textTransform: "uppercase",
              }}
            >
              {k.l}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: k.c }}>
              {mon(k.v)}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "#444" }}>
          Nenhum empréstimo.
        </div>
      )}
      {filtered.map((l) => {
        const vc = expired(l.vencimento, l.status);
        const cli = gc(l.clienteId);
        const cfg = CC[cli?.classificacao || "neutro"];
        const d = daysLeft(l.vencimento, l.status);
        return (
          <div
            key={l.id}
            style={{
              ...card,
              borderColor: vc
                ? "rgba(220,80,80,0.4)"
                : l.status === "pago"
                ? "rgba(30,180,120,0.3)"
                : "rgba(255,255,255,0.1)",
              background: vc
                ? "rgba(220,50,50,0.08)"
                : l.status === "pago"
                ? "rgba(30,180,120,0.06)"
                : "rgba(255,255,255,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: cfg.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    flexShrink: 0,
                  }}
                >
                  {cfg.icon}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>
                    {cli?.nome || "Cliente removido"}
                  </div>
                  <div style={{ fontSize: 11, color: cfg.c }}>{cfg.l}</div>
                </div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  padding: "3px 9px",
                  borderRadius: 20,
                  background: vc
                    ? "rgba(220,50,50,0.2)"
                    : l.status === "pago"
                    ? "rgba(30,180,120,0.2)"
                    : "rgba(255,180,0,0.2)",
                  color: vc
                    ? "#ff8888"
                    : l.status === "pago"
                    ? "#80ffcc"
                    : "#ffcc50",
                  border:
                    "1px solid " +
                    (vc
                      ? "rgba(220,80,80,0.3)"
                      : l.status === "pago"
                      ? "rgba(30,180,120,0.3)"
                      : "rgba(255,180,0,0.3)"),
                }}
              >
                {vc ? "Vencido" : l.status === "pago" ? "Pago" : "Pendente"}
              </span>
            </div>
            {cli?.indicadoPor && (
              <div style={{ fontSize: 11, color: "#88aaff", marginBottom: 6 }}>
                🤝 Indicado por: <b>{cli.indicadoPor}</b>
              </div>
            )}
            {cli?.observacao && (
              <div
                style={{
                  fontSize: 11,
                  color: "#ffcc88",
                  background: "rgba(255,180,0,0.07)",
                  borderRadius: 6,
                  padding: "4px 8px",
                  marginBottom: 6,
                }}
              >
                📝 {cli.observacao}
              </div>
            )}
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                fontSize: 12,
                color: "#888",
                marginBottom: 10,
              }}
            >
              <span>
                Capital <b style={{ color: "#ccc" }}>{mon(l.valor)}</b>
              </span>
              {l.juros ? (
                <span>
                  Juros <b style={{ color: "#ccc" }}>{l.juros}%</b>
                </span>
              ) : null}
              {l.parcelas ? (
                <span>
                  {l.parcelas}x{" "}
                  <b style={{ color: "#ccc" }}>
                    {mon(tot(l.valor, l.juros) / (parseInt(l.parcelas) || 1))}
                  </b>
                </span>
              ) : null}
              {l.vencimento ? (
                <span>
                  Venc.{" "}
                  <b style={{ color: "#ccc" }}>
                    {new Date(l.vencimento + "T12:00:00").toLocaleDateString(
                      "pt-BR"
                    )}
                  </b>
                </span>
              ) : null}
              <span>
                Total{" "}
                <b style={{ color: vc ? "#ff8888" : "#fff" }}>
                  {mon(tot(l.valor, l.juros))}
                </b>
              </span>
            </div>
            {d !== null && d >= 0 && d <= 5 && (
              <div
                style={{
                  fontSize: 11,
                  color: d === 0 ? "#ff8888" : d <= 2 ? "#ffaa50" : "#ffcc50",
                  marginBottom: 8,
                }}
              >
                {d === 0
                  ? "⏰ Vence hoje"
                  : d === 1
                  ? "⏰ Vence amanhã"
                  : "⏰ Vence em " + d + " dias"}
              </div>
            )}
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <Btn
                ch={l.status === "pago" ? "↩ Reabrir" : "✓ Pago"}
                fn={() =>
                  onLoans(
                    loans.map((x) =>
                      x.id === l.id
                        ? {
                            ...x,
                            status: x.status === "pago" ? "pendente" : "pago",
                          }
                        : x
                    )
                  )
                }
              />
              <Btn ch="✏" fn={() => openEdit(l)} />
              {cli?.telefone && (
                <Btn
                  type="grn"
                  ch="💬 WhatsApp"
                  fn={() => {
                    const n = cli.telefone.replace(/\D/g, "");
                    window.open(
                      "https://wa.me/" + (n.startsWith("55") ? n : "55" + n),
                      "_blank"
                    );
                  }}
                />
              )}
              <Btn
                type="red"
                ch="🗑"
                fn={() => onLoans(loans.filter((x) => x.id !== l.id))}
              />
            </div>
          </div>
        );
      })}

      {show && (
        <Overlay onClose={() => setShow(false)}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
            {editId ? "Editar" : "Novo empréstimo"}
          </div>
          <Label t="Cliente *" />
          <div style={{ position: "relative", marginBottom: 10 }}>
            <input
              style={{ ...inp, marginBottom: 0, paddingLeft: 32 }}
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setForm((f) => ({ ...f, clienteId: "" }));
                setShowDrop(true);
              }}
              onFocus={() => search.length > 0 && setShowDrop(true)}
            />
            <span
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#666",
                pointerEvents: "none",
              }}
            >
              🔍
            </span>
            {showDrop && dropList.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  width: "100%",
                  zIndex: 10,
                  top: "100%",
                  marginTop: 4,
                  background: "#1a1a2e",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                {dropList.map((c) => {
                  const cfg = CC[c.classificacao || "neutro"];
                  return (
                    <div
                      key={c.id}
                      onClick={() => {
                        setForm((f) => ({ ...f, clienteId: c.id }));
                        setSearch(c.nome);
                        setShowDrop(false);
                      }}
                      style={{
                        padding: "10px 12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <span>{cfg.icon}</span>
                      <div>
                        <div style={{ fontSize: 13 }}>{c.nome}</div>
                        <div style={{ fontSize: 11, color: cfg.c }}>
                          {cfg.l}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {selCli?.classificacao === "mau" && (
            <div
              style={{
                background: "rgba(220,50,50,0.12)",
                border: "1px solid rgba(220,80,80,0.3)",
                borderRadius: 8,
                padding: "8px 12px",
                marginBottom: 10,
                fontSize: 12,
                color: "#ff8888",
              }}
            >
              🚫 Atenção: Mau pagador!
            </div>
          )}
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <div>
              <Label t="Valor R$ *" />
              <input
                style={inp}
                type="number"
                placeholder="0,00"
                value={form.valor}
                onChange={(e) =>
                  setForm((f) => ({ ...f, valor: e.target.value }))
                }
              />
            </div>
            <div>
              <Label t="Juros %" />
              <input
                style={inp}
                type="number"
                placeholder="0"
                value={form.juros}
                onChange={(e) =>
                  setForm((f) => ({ ...f, juros: e.target.value }))
                }
              />
            </div>
            <div>
              <Label t="Parcelas" />
              <input
                style={inp}
                type="number"
                placeholder="1"
                value={form.parcelas}
                onChange={(e) =>
                  setForm((f) => ({ ...f, parcelas: e.target.value }))
                }
              />
            </div>
            <div>
              <Label t="Vencimento *" />
              <input
                style={inp}
                type="date"
                value={form.vencimento}
                onChange={(e) =>
                  setForm((f) => ({ ...f, vencimento: e.target.value }))
                }
              />
            </div>
          </div>
          <Label t="Status" />
          <select
            style={inp}
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
          >
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
          </select>
          {form.valor && (
            <div
              style={{
                background: "rgba(30,200,130,0.08)",
                border: "1px solid rgba(30,200,130,0.2)",
                borderRadius: 8,
                padding: "8px 12px",
                marginBottom: 10,
                fontSize: 12,
                color: "#aaa",
              }}
            >
              Total:{" "}
              <b style={{ color: "#80ffcc" }}>
                {mon(tot(form.valor, form.juros))}
              </b>
            </div>
          )}
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: 4,
            }}
          >
            <Btn ch="Cancelar" fn={() => setShow(false)} />
            <Btn ch={editId ? "Salvar" : "Cadastrar"} fn={save} type="pri" />
          </div>
        </Overlay>
      )}
    </div>
  );
}

// ── CLIENTES ──────────────────────────────────────────────────────────
function Clientes({ loans, clients, onClients }) {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    telefone: "",
    cpf: "",
    classificacao: "neutro",
    observacao: "",
    indicadoPor: "",
  });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = clients.filter(
    (c) =>
      c.nome.toLowerCase().includes(search.toLowerCase()) ||
      (c.telefone || "").includes(search)
  );

  function openNew() {
    setForm({
      nome: "",
      telefone: "",
      cpf: "",
      classificacao: "neutro",
      observacao: "",
      indicadoPor: "",
    });
    setEditId(null);
    setShow(true);
  }
  function openEdit(c) {
    setForm({ ...c });
    setEditId(c.id);
    setShow(true);
  }
  function save() {
    if (!form.nome) return;
    if (editId)
      onClients(
        clients.map((c) => (c.id === editId ? { ...form, id: editId } : c))
      );
    else onClients([...clients, { ...form, id: Date.now() }]);
    setShow(false);
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Clientes</div>
          <div style={{ fontSize: 12, color: "#666" }}>
            {clients.length} cadastrado{clients.length !== 1 ? "s" : ""}
          </div>
        </div>
        <Btn ch="+ Cadastrar" fn={openNew} type="pri" />
      </div>
      <div style={{ position: "relative", marginBottom: 14 }}>
        <input
          style={{ ...inp, marginBottom: 0, paddingLeft: 32 }}
          placeholder="Buscar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: "#666",
            pointerEvents: "none",
          }}
        >
          🔍
        </span>
      </div>
      <div
        style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}
      >
        {Object.entries(CC).map(([k, v]) => {
          const cnt = clients.filter((c) => c.classificacao === k).length;
          if (!cnt) return null;
          return (
            <span
              key={k}
              style={{
                background: v.bg,
                borderRadius: 20,
                padding: "3px 10px",
                fontSize: 11,
                color: v.c,
              }}
            >
              {v.icon} {v.l} ({cnt})
            </span>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "#444" }}>
          Nenhum cliente.
        </div>
      )}
      {filtered.map((c) => {
        const cfg = CC[c.classificacao || "neutro"];
        const ec = loans.filter((l) => l.clienteId === c.id).length;
        return (
          <div
            key={c.id}
            style={{ ...card, display: "flex", alignItems: "center", gap: 12 }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                background: cfg.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: cfg.c,
                fontWeight: 700,
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              {initials(c.nome)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{c.nome}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {c.telefone || "—"}
                    {c.cpf ? " · " + c.cpf : ""}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    padding: "3px 9px",
                    borderRadius: 20,
                    background: cfg.bg,
                    color: cfg.c,
                    flexShrink: 0,
                  }}
                >
                  {cfg.icon} {cfg.l}
                </span>
              </div>
              {c.indicadoPor && (
                <div style={{ fontSize: 11, color: "#88aaff", marginTop: 4 }}>
                  🤝 Indicado por: <b>{c.indicadoPor}</b>
                </div>
              )}
              {c.observacao && (
                <div style={{ fontSize: 11, color: "#ffcc88", marginTop: 4 }}>
                  📝 {c.observacao}
                </div>
              )}
              <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}>
                {ec} empréstimo{ec !== 1 ? "s" : ""}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Btn ch="✏" fn={() => openEdit(c)} />
              <Btn
                ch="🗑"
                fn={() => onClients(clients.filter((x) => x.id !== c.id))}
                type="red"
              />
            </div>
          </div>
        );
      })}
      {show && (
        <Overlay onClose={() => setShow(false)}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
            {editId ? "Editar" : "Novo cliente"}
          </div>
          <Label t="Nome *" />
          <input
            style={inp}
            placeholder="Nome completo"
            value={form.nome}
            onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
          />
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            <div>
              <Label t="Telefone" />
              <input
                style={inp}
                placeholder="(00)00000-0000"
                value={form.telefone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, telefone: e.target.value }))
                }
              />
            </div>
            <div>
              <Label t="CPF" />
              <input
                style={inp}
                placeholder="000.000.000-00"
                value={form.cpf}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cpf: e.target.value }))
                }
              />
            </div>
          </div>
          <Label t="Indicado por" />
          <input
            style={inp}
            placeholder="Nome de quem indicou (opcional)"
            value={form.indicadoPor || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, indicadoPor: e.target.value }))
            }
          />
          <Label t="Classificação" />
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              marginBottom: 12,
            }}
          >
            {Object.entries(CC).map(([k, v]) => (
              <button
                key={k}
                onClick={() => setForm((f) => ({ ...f, classificacao: k }))}
                style={{
                  borderRadius: 20,
                  padding: "6px 12px",
                  cursor: "pointer",
                  fontSize: 12,
                  fontFamily: "inherit",
                  background:
                    form.classificacao === k ? v.bg : "rgba(255,255,255,0.05)",
                  border:
                    "1px solid " +
                    (form.classificacao === k ? v.c : "rgba(255,255,255,0.1)"),
                  color: form.classificacao === k ? v.c : "#666",
                }}
              >
                {v.icon} {v.l}
              </button>
            ))}
          </div>
          <Label t="Observação" />
          <textarea
            style={{ ...inp, resize: "vertical" }}
            rows={2}
            placeholder="Observações..."
            value={form.observacao}
            onChange={(e) =>
              setForm((f) => ({ ...f, observacao: e.target.value }))
            }
          />
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "flex-end",
              marginTop: 4,
            }}
          >
            <Btn ch="Cancelar" fn={() => setShow(false)} />
            <Btn ch={editId ? "Salvar" : "Cadastrar"} fn={save} type="pri" />
          </div>
        </Overlay>
      )}
    </div>
  );
}

// ── RELATÓRIO ─────────────────────────────────────────────────────────
function Relatorio({ loans, clients }) {
  const now = new Date();
  const T = loans.reduce((s, l) => s + (parseFloat(l.valor) || 0), 0);
  const J = loans.reduce(
    (s, l) => s + (tot(l.valor, l.juros) - (parseFloat(l.valor) || 0)),
    0
  );
  const CJ = loans.reduce((s, l) => s + tot(l.valor, l.juros), 0);
  const R = loans
    .filter((l) => l.status === "pago")
    .reduce((s, l) => s + tot(l.valor, l.juros), 0);
  const AB = loans
    .filter((l) => l.status === "pendente")
    .reduce((s, l) => s + tot(l.valor, l.juros), 0);
  const VL = loans.filter((l) => expired(l.vencimento, l.status));
  const TV = VL.reduce((s, l) => s + tot(l.valor, l.juros), 0);
  const taxa = CJ > 0 ? ((R / CJ) * 100).toFixed(1) : 0;
  const MN = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  const meses = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const m = d.getMonth(),
      y = d.getFullYear();
    const em = loans.filter((l) => {
      if (!l.vencimento) return false;
      const ld = new Date(l.vencimento);
      return ld.getMonth() === m && ld.getFullYear() === y;
    });
    return {
      lbl: MN[m] + "/" + String(y).slice(2),
      emp: em.reduce((s, l) => s + (parseFloat(l.valor) || 0), 0),
      rec: em
        .filter((l) => l.status === "pago")
        .reduce((s, l) => s + tot(l.valor, l.juros), 0),
      cnt: em.length,
    };
  });
  const mMax = Math.max(...meses.map((m) => Math.max(m.emp, m.rec)), 1);
  const top = clients
    .map((c) => {
      const cl = loans.filter((l) => l.clienteId === c.id);
      return {
        ...c,
        tv: cl.reduce((s, l) => s + tot(l.valor, l.juros), 0),
        cnt: cl.length,
      };
    })
    .filter((c) => c.cnt > 0)
    .sort((a, b) => b.tv - a.tv)
    .slice(0, 5);
  const sh = {
    fontSize: 12,
    fontWeight: 700,
    color: "#666",
    textTransform: "uppercase",
    marginBottom: 10,
  };
  const row = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "9px 0",
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  };

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
        Relatório
      </div>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 20 }}>
        {loans.length} empréstimos · {clients.length} clientes
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 24,
        }}
      >
        {[
          { l: "Capital", v: mon(T), c: "#fff" },
          { l: "Juros", v: mon(J), c: "#ffcc50" },
          { l: "Total", v: mon(CJ), c: "#fff" },
          { l: "Recebido", v: mon(R), c: "#1ec882" },
          { l: "Em aberto", v: mon(AB), c: "#ffcc50" },
          { l: "Em atraso", v: mon(TV), c: TV > 0 ? "#ff6666" : "#555" },
        ].map((k) => (
          <div
            key={k.l}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: 12,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "#666",
                marginBottom: 4,
                textTransform: "uppercase",
              }}
            >
              {k.l}
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, color: k.c }}>
              {k.v}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 24 }}>
        <div style={sh}>Taxa de recebimento</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              flex: 1,
              height: 10,
              background: "rgba(255,255,255,0.07)",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: 10,
                width: taxa + "%",
                background: "linear-gradient(90deg,#1ec882,#80ffcc)",
                borderRadius: 10,
              }}
            />
          </div>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#1ec882",
              minWidth: 44,
            }}
          >
            {taxa}%
          </span>
        </div>
      </div>
      <div style={{ marginBottom: 24 }}>
        <div style={sh}>Últimos 6 meses</div>
        {meses.map((m) => (
          <div
            key={m.lbl}
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10,
              padding: "10px 12px",
              marginBottom: 6,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
                marginBottom: 6,
              }}
            >
              <b>{m.lbl}</b>
              <span style={{ color: "#555" }}>
                {m.cnt} empréstimo{m.cnt !== 1 ? "s" : ""}
              </span>
            </div>
            {m.emp > 0 && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    color: "#666",
                    marginBottom: 3,
                  }}
                >
                  <span>Emprestado</span>
                  <span>{mon(m.emp)}</span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: 6,
                    overflow: "hidden",
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      height: 6,
                      width: (m.emp / mMax) * 100 + "%",
                      background: "rgba(100,150,255,0.7)",
                      borderRadius: 6,
                    }}
                  />
                </div>
              </>
            )}
            {m.rec > 0 && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 11,
                    color: "#666",
                    marginBottom: 3,
                  }}
                >
                  <span>Recebido</span>
                  <span style={{ color: "#1ec882" }}>{mon(m.rec)}</span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: "rgba(255,255,255,0.06)",
                    borderRadius: 6,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: 6,
                      width: (m.rec / mMax) * 100 + "%",
                      background: "rgba(30,200,130,0.7)",
                      borderRadius: 6,
                    }}
                  />
                </div>
              </>
            )}
            {m.emp === 0 && (
              <div style={{ fontSize: 11, color: "#444", textAlign: "center" }}>
                Sem movimentação
              </div>
            )}
          </div>
        ))}
      </div>
      {VL.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={{ ...sh, color: "#ff6666" }}>
            ⚠ Inadimplência ({VL.length})
          </div>
          {VL.map((l) => {
            const c = clients.find((x) => x.id === l.clienteId);
            const dias = Math.floor(
              (new Date() - new Date(l.vencimento + "T23:59:59")) / 864e5
            );
            return (
              <div key={l.id} style={row}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    {c?.nome || "—"}
                  </div>
                  <div style={{ fontSize: 11, color: "#ff6666" }}>
                    {dias} dia{dias !== 1 ? "s" : ""} em atraso
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, color: "#ff8888" }}>
                    {mon(tot(l.valor, l.juros))}
                  </div>
                  <div style={{ fontSize: 11, color: "#555" }}>
                    {new Date(l.vencimento + "T12:00:00").toLocaleDateString(
                      "pt-BR"
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {top.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <div style={sh}>Top clientes</div>
          {top.map((c, i) => {
            const cfg = CC[c.classificacao || "neutro"];
            return (
              <div key={c.id} style={row}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#444", minWidth: 20 }}>#{i + 1}</span>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: cfg.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: cfg.c,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {initials(c.nome)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>
                      {c.nome}
                    </div>
                    <div style={{ fontSize: 11, color: cfg.c }}>
                      {cfg.l}
                      {c.indicadoPor ? " · via " + c.indicadoPor : ""}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700 }}>{mon(c.tv)}</div>
                  <div style={{ fontSize: 11, color: "#555" }}>
                    {c.cnt} empréstimo{c.cnt !== 1 ? "s" : ""}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {loans.length === 0 && (
        <div style={{ textAlign: "center", padding: 40, color: "#444" }}>
          Nenhum dado ainda.
        </div>
      )}
    </div>
  );
}

// ── APP PRINCIPAL ─────────────────────────────────────────────────────
export default function App() {
  const [sess, setSess] = useState(null);
  const [rdy, setRdy] = useState(false);
  const [tab, setTab] = useState("emp");
  const [loans, setLoans] = useState([]);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    window.storage
      .get("__sess")
      .then((r) => {
        if (r?.value) setSess(JSON.parse(r.value));
      })
      .catch(() => {})
      .finally(() => setRdy(true));
  }, []);

  useEffect(() => {
    if (!sess) return;
    Promise.all([
      window.storage.get("loans_" + sess.username).catch(() => null),
      window.storage.get("clients_" + sess.username).catch(() => null),
    ]).then(([lr, cr]) => {
      setLoans(lr?.value ? JSON.parse(lr.value) : []);
      setClients(cr?.value ? JSON.parse(cr.value) : []);
    });
  }, [sess]);

  function saveLoans(d) {
    setLoans(d);
    window.storage.set("loans_" + sess.username, JSON.stringify(d));
  }
  function saveClients(d) {
    setClients(d);
    window.storage.set("clients_" + sess.username, JSON.stringify(d));
  }
  function login(s) {
    setSess(s);
    window.storage.set("__sess", JSON.stringify(s));
  }
  function logout() {
    window.storage.delete("__sess");
    setSess(null);
    setLoans([]);
    setClients([]);
  }

  if (!rdy)
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BG,
          color: "#fff",
        }}
      >
        Carregando...
      </div>
    );
  if (!sess) return <LoginPage onLogin={login} />;

  const tSt = (t) => ({
    background: "transparent",
    border: "none",
    color: tab === t ? "#fff" : "#666",
    padding: "10px 14px",
    cursor: "pointer",
    fontSize: 12,
    fontFamily: "inherit",
    fontWeight: tab === t ? 700 : 400,
    borderBottom: tab === t ? "2px solid #1ec882" : "2px solid transparent",
  });

  return (
    <div
      style={{
        fontFamily: "'Inter',sans-serif",
        background: BG,
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 18px 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 22 }}>💰</span>
          <span style={{ fontSize: 13, fontWeight: 700 }}>EmpréstimoPro</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 12, color: "#888" }}>{sess.name}</span>
          <Btn ch="Sair" fn={logout} />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          padding: "16px 18px 0",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <button style={tSt("emp")} onClick={() => setTab("emp")}>
          💰 Empréstimos
        </button>
        <button style={tSt("cli")} onClick={() => setTab("cli")}>
          👥 Clientes
          {clients.length > 0 && (
            <span
              style={{
                background: "rgba(255,255,255,0.1)",
                borderRadius: 10,
                padding: "1px 6px",
                fontSize: 10,
                marginLeft: 4,
              }}
            >
              {clients.length}
            </span>
          )}
        </button>
        <button style={tSt("rel")} onClick={() => setTab("rel")}>
          📊 Relatório
        </button>
      </div>
      <div style={{ padding: 18 }}>
        {tab === "emp" && (
          <Emprestimos loans={loans} clients={clients} onLoans={saveLoans} />
        )}
        {tab === "cli" && (
          <Clientes loans={loans} clients={clients} onClients={saveClients} />
        )}
        {tab === "rel" && <Relatorio loans={loans} clients={clients} />}
      </div>
    </div>
  );
}
