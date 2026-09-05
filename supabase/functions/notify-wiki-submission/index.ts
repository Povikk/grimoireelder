import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (request) => {
  const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const authorization = request.headers.get('Authorization') || '';
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
      global: { headers: { Authorization: authorization } },
    });
    const { data: { user } } = await supabase.auth.getUser(authorization.replace('Bearer ', ''));
    if (!user) throw new Error('Non authentifié');
    const { submissionId } = await request.json();
    const { data: item, error } = await supabase.from('wiki_submissions').select('*').eq('id', submissionId).eq('created_by', user.id).is('notified_at', null).single();
    if (error || !item) throw new Error('Proposition introuvable');
    const site = Deno.env.get('SITE_URL') || 'https://povikk.github.io/grimoireelder/';
    const mail = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'api-key': Deno.env.get('BREVO_API_KEY')! },
      body: JSON.stringify({
        sender: { name: 'Le Grimoire des Résonants', email: Deno.env.get('SENDER_EMAIL')! },
        to: [{ email: Deno.env.get('ADMIN_EMAIL')! }],
        subject: `Nouvelle proposition : ${item.title}`,
        htmlContent: `<div style="background:#071a16;color:#edf3eb;padding:32px;font-family:Georgia,serif"><h1 style="color:#dfb757">Une nouvelle page attend ton sceau</h1><p><b>${item.category} · ${item.section}</b></p><h2>${item.title}</h2><p>${item.content.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}</p><p><a style="color:#dfb757" href="${site}?moderation=1">Ouvrir la salle de modération</a></p></div>`,
      }),
    });
    if (!mail.ok) throw new Error(`Brevo ${mail.status}`);
    await supabase.from('wiki_submissions').update({ notified_at: new Date().toISOString() }).eq('id', item.id);
    return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, 'content-type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Erreur' }), { status: 400, headers: { ...cors, 'content-type': 'application/json' } });
  }
});
