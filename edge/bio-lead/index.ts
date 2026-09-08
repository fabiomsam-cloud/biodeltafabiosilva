import { createClient } from "jsr:@supabase/supabase-js@2";

// bio-lead — ingestão do link da bio do @deltafabiosilva (SOU Data Core)
//   POST {action:'event', session_id, event, step?, produto_code?, utm_*}            → bio_events
//   POST {action:'lead',  session_id, nome, phone, respostas, produto_code, utm_*, origin_url}
//        → leads (upsert por telefone) + lead_interests + bio_leads
//        → campaign_events event_type='bio_lead' SÓ quando bio_produtos.destino='anne'
//          (a régua ANNE · Checkout Blindado lê esse evento pelas campanhas BIO · *)
// Catálogo do lado servidor = tabela bio_produtos (novo produto = 1 linha lá + 1 entrada no catalog.js).

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const s = (v: unknown, max = 200) => (v == null ? null : String(v).trim().slice(0, max) || null);
const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;
const FARDA_CONTEST: Record<string, string> = { PRF: "PRF", PC: "PCIVIL", PF: "policia_federal" };

function phoneParts(raw: unknown) {
  let d = String(raw ?? "").replace(/\D/g, "");
  if (d.length > 11 && d.startsWith("55")) d = d.slice(2);
  if (d.length < 10 || d.length > 11) return null;
  return { phone: d, ddd: d.slice(0, 2), last8: d.slice(-8), phone_norm: d.slice(0, 2) + d.slice(-8) };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return json({ error: "json" }, 400); }

  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const utm: Record<string, string | null> = {};
  for (const k of UTM) utm[k] = s(b[k], 120);
  const session_id = s(b.session_id, 64);

  if (b.action === "event") {
    const event = s(b.event, 32);
    if (!event) return json({ error: "event" }, 400);
    const { error } = await sb.from("bio_events").insert({
      session_id, event, step: s(b.step, 64), produto_code: s(b.produto_code, 40), ...utm,
    });
    return error ? json({ error: error.message }, 500) : json({ ok: true });
  }

  if (b.action !== "lead") return json({ error: "action" }, 400);

  const nome = s(b.nome, 80);
  const pp = phoneParts(b.phone);
  const produto_code = s(b.produto_code, 40);
  if (!nome || !pp || !produto_code) return json({ error: "campos" }, 400);
  const respostas = (b.respostas && typeof b.respostas === "object") ? b.respostas as Record<string, unknown> : {};
  const origin_url = s(b.origin_url, 500);
  const user_agent = s(req.headers.get("user-agent"), 300);

  const { data: bp } = await sb.from("bio_produtos").select("*").eq("code", produto_code).maybeSingle();
  if (!bp) return json({ error: "produto" }, 400);

  // ---- leads (Data Core): mesmo padrão do CHECKOUT · Blindado (telefone sem 55)
  // leads.phone no Data Core aparece como +5592..., 5592..., 92... e até sem o 9º dígito (bug Sendflow):
  // casa pelo sufixo DDD+9+8dígitos ou DDD+8dígitos
  // fn_bio_find_lead usa o índice ix_leads_phone_norm (fn_phone_norm) — sem ele, LIKE em 444k leads estourava o statement_timeout (8s) do PostgREST
  const rpc = await sb.rpc("fn_bio_find_lead", { p_ddd: pp.ddd, p_last8: pp.last8 });
  if (b.debug) return json({ debug: true, rpc_data: rpc.data, rpc_error: rpc.error, pp });
  let lead_id: string | null = (rpc.data as string | null) ?? null;
  const ORIG = "bio_deltafabiosilva";
  if (!lead_id) {
    const { data: ins, error } = await sb.from("leads").insert({
      name: nome, phone: pp.phone, first_origin: ORIG, last_origin: ORIG, consent: true,
      first_utm_source: utm.utm_source, first_utm_medium: utm.utm_medium, first_utm_campaign: utm.utm_campaign,
      first_utm_content: utm.utm_content, first_utm_term: utm.utm_term,
      last_utm_source: utm.utm_source, last_utm_medium: utm.utm_medium, last_utm_campaign: utm.utm_campaign,
      last_utm_content: utm.utm_content, last_utm_term: utm.utm_term,
      raw_payload: { ...b, user_agent },
    }).select("id").single();
    if (error) return json({ error: error.message }, 500);
    lead_id = ins.id;
  } else {
    await sb.from("leads").update({
      last_origin: ORIG, updated_at: new Date().toISOString(),
      ...(utm.utm_source ? { last_utm_source: utm.utm_source } : {}),
      ...(utm.utm_medium ? { last_utm_medium: utm.utm_medium } : {}),
      ...(utm.utm_campaign ? { last_utm_campaign: utm.utm_campaign } : {}),
      ...(utm.utm_content ? { last_utm_content: utm.utm_content } : {}),
      ...(utm.utm_term ? { last_utm_term: utm.utm_term } : {}),
    }).eq("id", lead_id);
  }

  // ---- interesse por concurso (farda) — PF/PC/PM sem produto viram lista de espera
  const farda = String(respostas.farda ?? "").toUpperCase();
  const contestCode = FARDA_CONTEST[farda];
  let contest_id: string | null = null;
  if (contestCode) {
    const { data: c } = await sb.from("contests").select("id").eq("code", contestCode).maybeSingle();
    contest_id = c?.id ?? null;
    if (contest_id) {
      const { data: li } = await sb.from("lead_interests").select("id").eq("lead_id", lead_id).eq("contest_id", contest_id).limit(1);
      if (!li?.length) await sb.from("lead_interests").insert({ lead_id, contest_id, interest_level: "alto", source: ORIG });
    }
  }

  // ---- só Elites (destino=anne) geram o evento que a régua blindado consome
  let campaign_event_id: string | null = null;
  if (bp.destino === "anne" && bp.product_code) {
    const { data: prod } = await sb.from("products").select("id, contest_id").eq("code", bp.product_code).maybeSingle();
    if (prod) {
      const { data: ce } = await sb.from("campaign_events").insert({
        lead_id, contest_id: prod.contest_id, product_id: prod.id, platform: "instagram", ...utm,
        event_type: "bio_lead", landing_page_url: origin_url, raw_payload: { ...b, user_agent },
      }).select("id").single();
      campaign_event_id = ce?.id ?? null;
    }
  }

  const { data: bl, error: e2 } = await sb.from("bio_leads").insert({
    lead_id, session_id, nome, phone: pp.phone, phone_norm: pp.phone_norm, respostas,
    produto_code, destino: bp.destino, ...utm, origin_url, user_agent,
  }).select("id").single();
  if (e2) return json({ error: e2.message }, 500);
  await sb.from("bio_events").insert({ session_id, event: "lead", produto_code, ...utm });

  return json({ ok: true, bio_lead_id: bl.id, lead_id, destino: bp.destino, campaign_event_id });
});
