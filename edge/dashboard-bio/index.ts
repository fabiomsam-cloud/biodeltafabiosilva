import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js@2";

// Funil do LINK DA BIO (@deltafabiosilva) — bio_events × bio_leads × Hubla × régua blindado (BIO-*)
// Mesmo token k do painel. Consumido pela rota #/bio de dashboard-tv/painel.
const DASHBOARD_TOKEN = "2e16f3c3a9713d5ecb6bcceeb63a5696fe0494bbe783aa74";
const PAGE = 1000, MAX_PAGES = 20;

async function fetchAll(sb: SupabaseClient, view: string, orderCol?: string, filter?: (q: any) => any) {
  const all: unknown[] = [];
  for (let p = 0; p < MAX_PAGES; p++) {
    let q: any = sb.from(view).select("*").range(p * PAGE, (p + 1) * PAGE - 1);
    if (filter) q = filter(q);
    if (orderCol) q = q.order(orderCol);
    const { data, error } = await q;
    if (error) return { data: null, error };
    all.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return { data: all, error: null };
}
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const J = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json", "Cache-Control": "no-store" } });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const url = new URL(req.url);
  if ((url.searchParams.get("k") ?? "") !== DASHBOARD_TOKEN) return J({ error: "unauthorized" }, 401);
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const desde = new Date(Date.now() - 120 * 864e5).toISOString();

  const [funil, leads, matriculas, eventos, produtos, campanhas, disparos] = await Promise.all([
    fetchAll(sb, "vw_bio_funil_diario", "dia"),
    fetchAll(sb, "bio_leads", "created_at", (q) => q.gte("created_at", desde)),
    fetchAll(sb, "vw_bio_matriculas", "paid_at"),
    fetchAll(sb, "bio_events", "created_at", (q) => q.gte("created_at", desde).in("event", ["view", "quiz_start", "gate_view", "lead", "click", "reco_view"])),
    fetchAll(sb, "bio_produtos", "code"),
    fetchAll(sb, "campanhas_blindado", "nome", (q) => q.like("nome", "BIO-%")),
    sb.from("campanha_blindado_disparos").select("campanha_id, phone_norm, product_code, status, sent_at, converted_at, valor_convertido, toque")
      .gte("sent_at", desde).order("sent_at").limit(5000),
  ]);
  for (const r of [funil, leads, matriculas, eventos, produtos, campanhas]) {
    if (r.error) return J({ error: (r.error as { message?: string }).message ?? String(r.error) }, 500);
  }
  const campIds = new Set((campanhas.data as any[]).map((c) => c.id));
  const disp = (disparos.data ?? []).filter((d: any) => campIds.has(d.campanha_id));

  // agregação por Reel (utm_content) — visitas (sessões únicas), quiz, leads, matrículas
  const reel = new Map<string, any>();
  const key = (u: any) => (u.utm_content || "(sem utm_content)") + "|" + (u.utm_medium || "");
  const get = (u: any) => { const k = key(u); if (!reel.has(k)) reel.set(k, { utm_content: u.utm_content || "(sem utm_content)", utm_medium: u.utm_medium || "", visitas: new Set(), quiz: new Set(), leads: 0, matriculas: 0, liquido: 0 }); return reel.get(k); };
  for (const e of eventos.data as any[]) { const r = get(e); if (e.event === "view") r.visitas.add(e.session_id); if (e.event === "quiz_start") r.quiz.add(e.session_id); }
  for (const l of leads.data as any[]) get(l).leads++;
  for (const m of matriculas.data as any[]) { const r = get(m); r.matriculas++; r.liquido += +(m.net_value || 0); }
  const por_reel = [...reel.values()].map((r) => ({ ...r, visitas: r.visitas.size, quiz: r.quiz.size })).sort((a, b) => b.leads - a.leads || b.visitas - a.visitas);

  // leads sem telefone exposto por inteiro no painel (só DDD + últimos 4)
  const leadsOut = (leads.data as any[]).map((l) => ({
    id: l.id, created_at: l.created_at, nome: l.nome, fone: l.phone ? l.phone.slice(0, 2) + "•••••" + l.phone.slice(-4) : null,
    phone_norm: l.phone_norm, produto_code: l.produto_code, destino: l.destino, respostas: l.respostas,
    utm_source: l.utm_source, utm_medium: l.utm_medium, utm_content: l.utm_content,
  }));

  return J({
    funil_diario: funil.data, leads: leadsOut, matriculas: matriculas.data, por_reel,
    produtos: produtos.data, campanhas: (campanhas.data as any[]).map((c) => ({ id: c.id, nome: c.nome, ativa: c.ativa, agent_slug: c.agent_slug, template_name: c.template_name, delay_min: c.delay_min })),
    disparos: disp, generated_at: new Date().toISOString(),
  });
});
