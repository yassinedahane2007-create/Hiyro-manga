// ============================================================
// HIYRO MANGA - Supabase Client (shared across all pages)
// ضع بيانات مشروعك هنا
// ============================================================
const SUPABASE_URL = "https://nqrkqtpywkzcqfhqsvih.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_qepKQSxycokUKTlknMN_Qw_61QltZG9";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ---------- Session helper ----------
async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  return profile;
}

// ---------- Toast ----------
function showToast(message, type = 'info') {
  const el = document.createElement('div');
  el.className = `hm-toast hm-toast--${type}`;
  el.textContent = message;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

// ---------- Time ago (Arabic) ----------
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  const units = [
    [31536000, 'سنة'], [2592000, 'شهر'], [86400, 'يوم'],
    [3600, 'ساعة'], [60, 'دقيقة']
  ];
  for (const [secs, label] of units) {
    const val = Math.floor(diff / secs);
    if (val >= 1) return `منذ ${val} ${label}${val > 1 && val < 11 ? (label === 'شهر' ? 'ور' : '') : ''}`;
  }
  return 'الآن';
}

// ---------- Log a site visit (once per session) ----------
(async function logVisit() {
  if (sessionStorage.getItem('hm_visit_logged')) return;
  sessionStorage.setItem('hm_visit_logged', '1');
  const today = new Date().toISOString().slice(0, 10);
  try {
    const { data } = await supabase.from('site_statistics').select('*').eq('stat_date', today).maybeSingle();
    if (data) {
      await supabase.from('site_statistics').update({ visits: data.visits + 1 }).eq('stat_date', today);
    } else {
      await supabase.from('site_statistics').insert({ stat_date: today, visits: 1 });
    }
  } catch (e) { /* silent */ }
})();
                                                     
