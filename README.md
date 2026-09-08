# biodeltafabiosilva — link da bio do @deltafabiosilva

Link da bio com concierge (Anne), catálogo e captura de leads → SOU Data Core.

- **Página**: `index.html` + `styles.css` + `app.js` (motor genérico) + `catalog.js` (**dados**).
- **Ingestão**: edge function `bio-lead` no SOU Data Core (`edge/bio-lead/index.ts`).
- **Follow-up**: só produtos `tipo: "anne"` geram `campaign_events.event_type='bio_lead'`, consumido pela régua **ANNE · Checkout Blindado** (campanhas `BIO-ELITE-PRF` / `BIO-ELITE-PRF-ADM`, `event_type='bio_lead'`).
- **Painel**: rota `#/bio` no painel (dashboard-tv/painel) via edge `dashboard-bio`.

## Incluir um produto novo (sem mexer em código)
1. `catalog.js` → adicionar item em `produtos` (code único) e, se o quiz deve recomendá-lo, uma regra em `regras`.
2. SOU Data Core → `insert into bio_produtos (code, nome, destino, product_code, buy_patterns)`:
   - `destino='anne'` + `product_code` (products.code) para Elites que vão pra Anne; senão `destino='externo'`/`'data_core'`.
   - `buy_patterns` = padrões ILIKE do `product_name` na Hubla (atribuição de matrícula no `#/bio`).
3. Se for Elite com régua própria: linha em `campanhas_blindado` com `event_type='bio_lead'` + template Meta aprovado.

## Deploy
GitHub Pages (branch `main`, raiz). `git push` publica.

## Notas de engenharia (08/09/2026)
- `leads` tem ~444k linhas; lookup por telefone usa `fn_phone_norm(phone)` + índice `ix_leads_phone_norm` (migration `bio_phone_norm_index`). LIKE com curinga à esquerda estoura o `statement_timeout` de 8s do PostgREST.
- `campanhas_blindado.event_type`: `checkout_blindado` (site) × `bio_lead` (bio). Régua e métricas redeployadas via `_gen_anne_blindado.py` / `_gen_anne_blindado_metricas.py`.
- Templates Meta aprovados: `bio_delta_elite_prf_1/2`, `bio_delta_elite_prf_adm_1/2` (só {{1}} nome, {{2}} Anne).
