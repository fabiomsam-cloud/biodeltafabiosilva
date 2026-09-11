/* biodeltafabiosilva — motor genérico. Lê window.BIO (catalog.js). Não precisa mudar para incluir produto. */
(function () {
  const B = window.BIO;
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fill = (t, d) => String(t || "").replace(/\{(\w+)\}/g, (_, k) => d[k] ?? "");
  const prod = (code) => B.produtos.find((p) => p.code === code);

  /* ---------- sessão + UTM ---------- */
  const qs = new URLSearchParams(location.search);
  const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  let utm = {};
  try { utm = JSON.parse(sessionStorage.getItem("bio_utm") || "{}"); } catch (_) {}
  UTM_KEYS.forEach((k) => { if (qs.get(k)) utm[k] = qs.get(k); });
  if (!utm.utm_source) utm.utm_source = "instagram";
  if (!utm.utm_medium) utm.utm_medium = "bio";
  if (!utm.utm_campaign) utm.utm_campaign = B.origem;
  try { sessionStorage.setItem("bio_utm", JSON.stringify(utm)); } catch (_) {}
  let sid;
  try { sid = sessionStorage.getItem("bio_sid"); } catch (_) {}
  if (!sid) { sid = Date.now().toString(36) + Math.random().toString(36).slice(2, 10); try { sessionStorage.setItem("bio_sid", sid); } catch (_) {} }

  const post = (body) => fetch(B.api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), keepalive: true })
    .then((r) => r.json()).catch(() => ({ error: "rede" }));
  const track = (event, extra = {}) => post({ action: "event", session_id: sid, event, ...utm, ...extra });
  const outUrl = (url, extra = {}) => {
    try {
      const u = new URL(url);
      UTM_KEYS.forEach((k) => { if (utm[k]) u.searchParams.set(k, utm[k]); });
      Object.entries(extra).forEach(([k, v]) => { if (v) u.searchParams.set(k, v); });
      return u.toString();
    } catch (_) { return url; }
  };
  const phoneDigits = (v) => { let d = String(v || "").replace(/\D/g, ""); if (d.length > 11 && d.startsWith("55")) d = d.slice(2); return d; };
  const phoneOk = (d) => d.length === 10 || d.length === 11;

  /* ---------- render do perfil ---------- */
  const P = B.perfil;
  $("#foto").src = P.foto;
  $("#foto").onerror = function () { this.onerror = null; this.src = P.fotoFallback; };
  $("#cargo").textContent = P.cargo;
  { const w = P.nome.split(" "); $("#nome").innerHTML = esc(w[0]) + "<br>" + esc(w.slice(1).join(" ")); }
  $("#handle").textContent = P.handle;
  $("#tagline").innerHTML = esc(P.tagline[0]) + "<br><b>" + esc(P.tagline[1]) + "</b>";

  const ICONS = {
    instagram: '<svg viewBox="0 0 24 24"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2m0 2.1c-3.1 0-3.5 0-4.8.1-1.1.1-1.5.2-1.8.3-.4.2-.7.3-.9.6-.3.3-.5.5-.6.9-.1.3-.3.7-.3 1.8-.1 1.2-.1 1.6-.1 4.8s0 3.5.1 4.8c.1 1.1.2 1.5.3 1.8.2.4.3.7.6.9.3.3.5.5.9.6.3.1.7.3 1.8.3 1.2.1 1.6.1 4.8.1s3.5 0 4.8-.1c1.1-.1 1.5-.2 1.8-.3.4-.2.7-.3.9-.6.3-.3.5-.5.6-.9.1-.3.3-.7.3-1.8.1-1.2.1-1.6.1-4.8s0-3.5-.1-4.8c-.1-1.1-.2-1.5-.3-1.8-.2-.4-.3-.7-.6-.9-.3-.3-.5-.5-.9-.6-.3-.1-.7-.3-1.8-.3-1.2-.1-1.6-.1-4.8-.1zm0 3.5a5.2 5.2 0 1 1 0 10.4 5.2 5.2 0 0 1 0-10.4zm0 2.1a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2zm5.4-3.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z"/></svg>',
    youtube: '<svg viewBox="0 0 24 24"><path d="M23 7.2s-.2-1.6-.9-2.3c-.9-.9-1.9-.9-2.3-1C16.6 3.6 12 3.6 12 3.6s-4.6 0-7.8.3c-.4.1-1.4.1-2.3 1-.7.7-.9 2.3-.9 2.3S.8 9.1.8 11v1.8c0 1.9.2 3.8.2 3.8s.2 1.6.9 2.3c.9.9 2 .9 2.5 1 1.8.2 7.6.3 7.6.3s4.6 0 7.8-.3c.4-.1 1.4-.1 2.3-1 .7-.7.9-2.3.9-2.3s.2-1.9.2-3.8V11c0-1.9-.2-3.8-.2-3.8zM9.7 15.1V8.6l6.1 3.3-6.1 3.2z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24"><path d="M19.6 6.7a4.8 4.8 0 0 1-3.5-1.6 4.8 4.8 0 0 1-1.2-3.2h-3.2v13c0 1.5-1.2 2.8-2.8 2.8a2.8 2.8 0 0 1 0-5.6c.3 0 .6 0 .8.1V8.9a6 6 0 0 0-.8-.1 6 6 0 1 0 6 6V9.8a8 8 0 0 0 4.7 1.5V8.1v-1.4z"/></svg>',
    spotify: '<svg viewBox="0 0 24 24"><path d="M12 1.6A10.4 10.4 0 1 0 22.4 12 10.4 10.4 0 0 0 12 1.6zm4.8 15a.6.6 0 0 1-.9.2 9.4 9.4 0 0 0-7.5-1c-.3.1-.7-.1-.8-.4s.1-.7.4-.8a10.7 10.7 0 0 1 8.5 1.2c.3.1.4.5.3.8zm1.3-2.9a.8.8 0 0 1-1.1.3 11.8 11.8 0 0 0-9-1.2.8.8 0 0 1-1-.5.8.8 0 0 1 .6-1 13.4 13.4 0 0 1 10.2 1.4c.4.2.5.7.3 1zm.1-3a14.2 14.2 0 0 0-10.4-1.3 1 1 0 0 1-1.1-.7 1 1 0 0 1 .7-1.1 16.2 16.2 0 0 1 11.8 1.5 1 1 0 0 1 .3 1.3 1 1 0 0 1-1.3.3z"/></svg>',
  };
  const WA = '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3.1.8.8-3-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8.9-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4 0-.5.1-.7l.4-.5c.1-.2.1-.3 0-.5-.1-.1-.5-1.3-.7-1.8-.2-.5-.4-.4-.5-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s.9 2.5 1.1 2.7c.1.2 1.8 2.8 4.4 3.9 2.6 1.1 2.6.8 3.1.7.5 0 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>';
  $("#socials").innerHTML = B.redes.filter((r) => r.url).map((r) =>
    `<a href="${esc(r.url)}" target="_blank" rel="noopener" title="${esc(r.label)}" data-click="rede:${r.id}">${ICONS[r.id] || ""}</a>`).join("");

  /* ---------- catálogo ---------- */
  const tile = (p, big) => `<div class="tile tema-${p.tema || "grafite"}${big ? " big" : ""}">${p.capa ? `<img src="${esc(p.capa)}" alt="" loading="lazy" onerror="this.remove()">` : ""}<span>${esc(p.sigla || p.nome.slice(0, 3))}</span></div>`;
  $("#produtos").innerHTML = B.produtos.map((p) => `
    <button class="prod" data-prod="${p.code}" aria-label="${esc(p.nome)}">
      ${tile(p)}
      <div class="pinfo">
        <div class="ey">${esc(p.eyebrow)}</div>
        <h3>${esc(p.nome)}</h3>
        <p>${esc(p.resumo)}</p>
        <div class="price">${esc(p.preco)}${p.precoNota ? ` <small>${esc(p.precoNota)}</small>` : ""}</div>
      </div>
      <span class="chev">›</span>
    </button>`).join("");
  document.querySelectorAll(".prod").forEach((el) => el.addEventListener("click", () => openProd(el.dataset.prod)));

  $("#whats").innerHTML = B.whatsapp.filter((w) => w.numero).map((w) => `
    <a class="rowlink" href="https://wa.me/${esc(w.numero.replace(/\D/g, ""))}?text=${encodeURIComponent(w.msg)}" target="_blank" rel="noopener" data-click="whatsapp">
      <span class="ic">${WA}</span><span><b>${esc(w.titulo)}</b><span>${esc(w.sub)}</span></span><span class="arr">→</span></a>`).join("");
  if (!B.whatsapp.some((w) => w.numero)) $("#whats-sec").hidden = true;

  document.querySelectorAll("[data-click]").forEach((a) => a.addEventListener("click", () => track("click", { step: a.dataset.click })));

  /* ---------- modal de produto (mini-gate para tipo anne) ---------- */
  const pm = $("#pmodal");
  function openProd(code) {
    const p = prod(code); if (!p) return;
    track("click", { step: "card", produto_code: code });
    const gate = p.tipo === "anne";
    $("#pm").innerHTML = `
      <div class="x"><button aria-label="Fechar" onclick="document.getElementById('pmodal').classList.remove('open')">✕</button></div>
      <div class="phead">${tile(p, true)}<div><div class="ey">${esc(p.eyebrow)}</div><h3>${esc(p.nome)}</h3></div></div>
      <div class="price">${esc(p.preco)}${p.precoNota ? `<small>${esc(p.precoNota)}</small>` : ""}</div>
      <p>${esc(p.desc)}</p>
      <div class="mini">
        ${gate ? `<input id="mn" placeholder="Seu nome" autocomplete="name"><input id="mp" placeholder="Seu WhatsApp com DDD" inputmode="tel" autocomplete="tel">` : ""}
        <button class="main" id="mgo">${esc(p.cta)} →</button>
        ${gate ? `<div class="hint">Você vai direto para a matrícula. A Anne te acompanha pelo WhatsApp.</div>` : ""}
      </div>`;
    pm.classList.add("open");
    $("#mgo").onclick = async () => {
      if (!gate) { track("click", { step: "cta", produto_code: code }); window.open(outUrl(p.url), "_blank", "noopener"); return; }
      const n = $("#mn").value.trim(), d = phoneDigits($("#mp").value);
      $("#mn").classList.toggle("err", !n); $("#mp").classList.toggle("err", !phoneOk(d));
      if (!n || !phoneOk(d)) return;
      const btn = $("#mgo"); btn.disabled = true; btn.textContent = "Um instante…";
      await post({ action: "lead", session_id: sid, nome: n, phone: d, produto_code: code, respostas: { origem_gate: "card" }, ...utm, origin_url: location.href });
      track("click", { step: "cta", produto_code: code });
      location.href = outUrl(p.url, { name: n, phone: "55" + d });
    };
  }
  pm.addEventListener("click", (e) => { if (e.target === pm) pm.classList.remove("open"); });

  /* ---------- concierge (Anne) ---------- */
  const Q = B.quiz, body = $("#cbody"), dock = $("#cdock");
  const S = { started: false, resp: {}, nome: "" };
  const scroll = () => { body.scrollTop = body.scrollHeight; };
  const userMsg = (t) => { const m = document.createElement("div"); m.className = "msg user"; m.innerHTML = `<div class="bubble">${esc(t)}</div>`; body.appendChild(m); scroll(); };
  function botMsg(text, after) {
    const m = document.createElement("div"); m.className = "msg bot";
    m.innerHTML = `<div class="bubble typing"><i></i><i></i><i></i></div>`; body.appendChild(m); scroll();
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => {
      const b = m.querySelector(".bubble"); b.classList.remove("typing"); b.textContent = "";
      if (reduce) { b.textContent = text; scroll(); after && after(); return; }
      const w = text.split(" "); let i = 0;
      const iv = setInterval(() => { b.textContent += (i ? " " : "") + w[i++]; scroll(); if (i >= w.length) { clearInterval(iv); after && after(); } }, 38);
    }, reduce ? 50 : 550 + Math.random() * 350);
  }
  function choices(list, cb) {
    const c = document.createElement("div"); c.className = "choices"; c.innerHTML = `<div class="hint">ESCOLHA UMA OPÇÃO 👇</div>`;
    list.forEach((o) => { const b = document.createElement("button"); b.textContent = o.t; b.onclick = () => { c.remove(); userMsg(o.t); cb(o); }; c.appendChild(b); });
    body.appendChild(c); scroll();
  }
  function textInput(ph, cb) {
    dock.innerHTML = `<form class="cinput"><input id="ti" placeholder="${esc(ph)}" autocomplete="given-name" maxlength="60"><button type="submit" aria-label="Enviar">➤</button></form>`;
    const f = dock.querySelector("form"), i = dock.querySelector("#ti");
    f.onsubmit = (e) => { e.preventDefault(); const v = i.value.trim(); if (!v) return; dock.innerHTML = ""; userMsg(v); cb(v); };
    i.focus();
  }
  const d = () => ({ nome: S.nome });

  function ask(idx) {
    const q = Q.perguntas[idx];
    if (!q) return gate();
    track("quiz_step", { step: q.chave });
    if (q.tipo === "texto") {
      botMsg(fill(q.texto, d()), () => textInput(q.placeholder, (v) => { S.nome = v.split(/\s+/)[0]; S.nome = S.nome[0].toUpperCase() + S.nome.slice(1); S.resp.nome = v; ask(idx + 1); }));
    } else {
      botMsg(fill(q.texto, d()), () => choices(q.opcoes, (o) => { S.resp[q.chave] = o.v; S.resp[q.chave + "_txt"] = o.t; ask(idx + 1); }));
    }
  }
  function recomendar() {
    for (const r of B.regras) {
      if (!r.when) return r.produto;
      if (Object.entries(r.when).every(([k, vals]) => vals.includes(S.resp[k]))) return r.produto;
    }
    return B.produtos[0].code;
  }
  function gate() {
    const code = recomendar(), p = prod(code);
    botMsg(fill(Q.fechamento, d()), () => {
      track("gate_view", { produto_code: code });
      dock.innerHTML = `<div class="gate"><h4>${esc(Q.gate.titulo)}</h4><p>${esc(Q.gate.sub)}</p>
        <input id="gn" placeholder="Seu nome" autocomplete="name"><input id="gp" placeholder="Seu WhatsApp com DDD" inputmode="tel" autocomplete="tel">
        <button id="gg">${esc(Q.gate.botao)}</button></div>`;
      $("#gn").value = S.resp.nome || "";
      $("#gg").onclick = async () => {
        const n = $("#gn").value.trim(), dg = phoneDigits($("#gp").value);
        $("#gn").classList.toggle("err", !n); $("#gp").classList.toggle("err", !phoneOk(dg));
        if (!n || !phoneOk(dg)) return;
        const btn = $("#gg"); btn.disabled = true; btn.textContent = "Preparando…";
        const r = await post({ action: "lead", session_id: sid, nome: n, phone: dg, produto_code: code, respostas: S.resp, ...utm, origin_url: location.href });
        dock.innerHTML = "";
        S.lead = { nome: n, phone: dg, ok: !r.error };
        revelar(p);
      };
    });
  }
  function revelar(p) {
    track("reco_view", { produto_code: p.code });
    const nu = (B.nuances || {}).momento?.[S.resp.momento];
    const intro = (nu ? nu + " " : "") + fill(p.pitch, d());
    botMsg(intro, () => {
      const url = p.tipo === "anne" && S.lead ? outUrl(p.url, { name: S.lead.nome, phone: "55" + S.lead.phone }) : outUrl(p.url);
      const c = document.createElement("div"); c.className = "reco";
      c.innerHTML = `<div class="tag">RECOMENDADO PARA VOCÊ</div><h4>${esc(p.nome)}</h4><p>${esc(p.desc)}</p>
        <div class="pr">${esc(p.preco)}${p.precoNota ? `<small>${esc(p.precoNota)}</small>` : ""}</div>
        <div class="acts"><a class="main" href="${esc(url)}" target="_blank" rel="noopener" data-cta="${p.code}">${esc(p.cta)} →</a>
        <button class="alt" id="ver-outros">Ver os outros produtos</button></div>`;
      body.appendChild(c); scroll();
      c.querySelector("[data-cta]").addEventListener("click", () => track("click", { step: "cta_reco", produto_code: p.code }));
      $("#ver-outros").onclick = () => { closeChat(); $("#produtos").scrollIntoView({ behavior: "smooth" }); };
      botMsg(fill(Q.despedida, d()));
    });
  }
  window.openChat = () => {
    $("#overlay").classList.add("open");
    if (S.started) return;
    S.started = true; track("quiz_start");
    botMsg(Q.abertura, () => choices([{ v: "go", t: Q.inicio }], () => ask(0)));
  };
  window.closeChat = () => $("#overlay").classList.remove("open");
  $("#concierge").addEventListener("click", openChat);
  $("#cclose").addEventListener("click", closeChat);

  track("view");
})();
