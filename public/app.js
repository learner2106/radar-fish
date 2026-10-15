/**
 * RadarFish Frontend Application Logic
 * Integrates TinyFish Search, Fetch, and Agent APIs with real-time UI updates
 */

// Application State
const state = {
  apiKey: localStorage.getItem('radarfish_api_key') || '',
  jobs: [],
  filteredJobs: [],
  savedJobIds: new Set(JSON.parse(localStorage.getItem('radarfish_saved') || '[]')),
  appliedJobIds: new Set(JSON.parse(localStorage.getItem('radarfish_applied') || '[]')),
  keywords: ['Figma', 'UI/UX', 'Wireframing', 'Prototyping', 'Design Systems', 'User Research'],
  activeTab: 'all', // 'all' | 'saved' | 'applied'
  workMode: 'all',
  autoRefreshTimer: null,
  currentInspectEndpoint: 'search'
};

// Social Media Templates
const LINKEDIN_POST = `🚀 Excited to unveil RadarFish — built for the TinyFish × Team Technojam workshop at Galgotias University!

Like many engineers, I spend hours refreshing company careers pages, filtering out outdated posts, and sifting through broken ATS aggregators. So I built the tool I’d actually use every week: an agentic job & internship radar powered by TinyFish.

RadarFish integrates all 3 TinyFish endpoints into a unified 3-stage agentic pipeline (200 pts tier):

1️⃣ TinyFish Search API: Dynamically discovers live, active openings across ATS portals (Greenhouse, Lever, Ashby, Workday) using targeted query operators. No hardcoded stale lists.
2️⃣ TinyFish Fetch API: Renders dynamic, client-side JavaScript SPAs via TinyFish’s headless Chromium fleet, stripping HTML junk and extracting clean markdown.
3️⃣ TinyFish Agent API: Autonomous "AI That Clicks" for complex, interactive company career boards (Stripe, Uber, Google) — handling dropdown filtering and structured JSON schema extraction.

🎯 Key Highlights:
✅ Live preferences: Role, location, seniority, and custom skills
✅ Multi-factor Match Engine: 0-100% scoring with transparent skill match breakdowns
✅ Intelligent Deduplication: Merges cross-posted ATS listings into canonical job cards
✅ Direct Apply Links: Clean, tracking-free links directly to the company portal

Massive thanks to TinyFish and Team TechnoJam for hosting such an inspiring workshop on agentic web automation!

#AIThatClicks #TinyFish #WebScraping #JobScraper #TechnoJam #GalgotiasUniversity #BuildInPublic #AI`;

const X_POST = `Built RadarFish for the @TinyFish × @TeamTechnoJam workshop! ⚡

Tired of refreshing 20+ company career pages every week? RadarFish is an agentic job & internship radar powered by TinyFish’s 3 core endpoints:

🔍 TinyFish Search: Live ATS discovery across Greenhouse, Lever & Ashby
🌐 TinyFish Fetch: Fast Chromium rendering for clean markdown
🤖 TinyFish Agent: "AI That Clicks" to navigate complex career portals

+ Deduplicates cross-portal postings & ranks them 0-100% against your target skills!

Clean results. Real links. Less time refreshing. 🚀

#AIThatClicks #TinyFish #JobRadar #TechnoJam`;

// DOM Elements
const elements = {
  inputRole: document.getElementById('inputRole'),
  inputLocation: document.getElementById('inputLocation'),
  selectSeniority: document.getElementById('selectSeniority'),
  selectPortal: document.getElementById('selectPortal'),
  rangeMinScore: document.getElementById('rangeMinScore'),
  lblMinScore: document.getElementById('lblMinScore'),
  keywordContainer: document.getElementById('keywordTagsContainer'),
  inputAddKeyword: document.getElementById('inputAddKeyword'),
  btnAddKeyword: document.getElementById('btnAddKeyword'),
  btnRunScraper: document.getElementById('btnRunScraper'),
  btnScrapeText: document.getElementById('btnScrapeText'),
  btnScrapeIcon: document.getElementById('btnScrapeIcon'),
  progressStepper: document.getElementById('progressStepper'),
  liveStatusLog: document.getElementById('liveStatusLog'),
  stepCounter: document.getElementById('stepCounter'),
  stepSearch: document.getElementById('stepSearch'),
  stepFetch: document.getElementById('stepFetch'),
  stepAgent: document.getElementById('stepAgent'),
  stepDedup: document.getElementById('stepDedup'),
  listingsContainer: document.getElementById('listingsContainer'),
  emptyState: document.getElementById('emptyState'),
  metricTotalJobs: document.getElementById('metricTotalJobs'),
  metricDuplicates: document.getElementById('metricDuplicates'),
  metricFreshness: document.getElementById('metricFreshness'),
  selectAutoRefresh: document.getElementById('selectAutoRefresh'),
  countAll: document.getElementById('countAll'),
  countSaved: document.getElementById('countSaved'),
  countApplied: document.getElementById('countApplied'),
  selectSort: document.getElementById('selectSort'),
  keyStatusBadge: document.getElementById('keyStatusBadge'),
  toast: document.getElementById('toast'),
  toastMsg: document.getElementById('toastMsg')
};

// Modals
const modals = {
  arch: document.getElementById('modalArch'),
  social: document.getElementById('modalSocial'),
  inspector: document.getElementById('modalInspector'),
  settings: document.getElementById('modalSettings')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  renderKeywordChips();
  setupEventListeners();
  updateKeyBadge();
  loadInitialData();
  setupSocialText();
  renderInspectForm('search');
});

function updateKeyBadge() {
  if (state.apiKey && state.apiKey.length > 5) {
    elements.keyStatusBadge.innerHTML = '🟢 Live Cloud Key';
  } else {
    elements.keyStatusBadge.innerHTML = '⚙️ Demo / Fast Mode';
  }
}

function showToast(msg) {
  elements.toastMsg.textContent = msg;
  elements.toast.classList.remove('hidden');
  setTimeout(() => elements.toast.classList.add('hidden'), 3000);
}

// Keyword Chips Rendering
function renderKeywordChips() {
  elements.keywordContainer.innerHTML = '';
  state.keywords.forEach(kw => {
    const chip = document.createElement('span');
    chip.className = 'inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-cyan-950/90 text-cyan-300 border border-cyan-800/80';
    chip.innerHTML = `
      <span>${escapeHtml(kw)}</span>
      <button class="hover:text-cyan-100 font-bold ml-1 text-[10px]" data-remove="${escapeHtml(kw)}">✕</button>
    `;
    elements.keywordContainer.appendChild(chip);
  });
}

function addKeyword(kw) {
  const clean = kw.trim();
  if (clean && !state.keywords.includes(clean)) {
    state.keywords.push(clean);
    renderKeywordChips();
  }
}

function removeKeyword(kw) {
  state.keywords = state.keywords.filter(k => k !== kw);
  renderKeywordChips();
}

// Setup Event Listeners
function setupEventListeners() {
  // Add Keyword Button & Enter Key
  elements.btnAddKeyword.addEventListener('click', () => {
    addKeyword(elements.inputAddKeyword.value);
    elements.inputAddKeyword.value = '';
  });
  elements.inputAddKeyword.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword(elements.inputAddKeyword.value);
      elements.inputAddKeyword.value = '';
    }
  });

  // Remove Keyword Delegation
  elements.keywordContainer.addEventListener('click', (e) => {
    if (e.target.dataset.remove) {
      removeKeyword(e.target.dataset.remove);
    }
  });

  // Role Chips
  document.querySelectorAll('.role-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      elements.inputRole.value = btn.textContent.trim();
    });
  });

  // Location Chips
  document.querySelectorAll('.loc-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      elements.inputLocation.value = btn.textContent.trim();
    });
  });

  // Work Mode Buttons
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => {
        b.className = 'mode-btn px-2 py-0.5 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60';
      });
      btn.className = 'mode-btn px-2 py-0.5 text-[11px] rounded bg-cyan-900/80 text-cyan-200 border border-cyan-700/60 font-medium';
      state.workMode = btn.dataset.mode;
    });
  });

  // Min Score Range
  elements.rangeMinScore.addEventListener('input', (e) => {
    elements.lblMinScore.textContent = `${e.target.value}%`;
    filterAndRenderJobs();
  });

  // Run Scraper CTA
  elements.btnRunScraper.addEventListener('click', runScraper);

  // Tabs Filter
  document.getElementById('tabAll').addEventListener('click', () => switchTab('all'));
  document.getElementById('tabSaved').addEventListener('click', () => switchTab('saved'));
  document.getElementById('tabApplied').addEventListener('click', () => switchTab('applied'));

  // Sort dropdown
  elements.selectSort.addEventListener('change', () => filterAndRenderJobs());

  // Auto Refresh Interval
  elements.selectAutoRefresh.addEventListener('change', (e) => {
    const seconds = parseInt(e.target.value, 10);
    clearInterval(state.autoRefreshTimer);
    if (seconds > 0) {
      state.autoRefreshTimer = setInterval(() => {
        runScraper(true);
      }, seconds * 1000);
      showToast(`Auto-refresh enabled (${seconds / 60}m)`);
    } else {
      showToast('Auto-refresh disabled');
    }
  });

  // Reset Filters Button
  document.getElementById('btnResetFilters')?.addEventListener('click', () => {
    elements.rangeMinScore.value = 0;
    elements.lblMinScore.textContent = '0%';
    elements.inputRole.value = 'UI/UX Designer';
    elements.inputLocation.value = 'Delhi, India';
    elements.selectPortal.value = 'all';
    elements.selectSeniority.value = 'all';
    filterAndRenderJobs();
  });

  // Modal Openers
  document.getElementById('btnArchModal').addEventListener('click', () => openModal(modals.arch));
  document.getElementById('btnSocialModal').addEventListener('click', () => openModal(modals.social));
  document.getElementById('btnInspectorModal').addEventListener('click', () => openModal(modals.inspector));
  document.getElementById('btnSettingsModal').addEventListener('click', () => {
    document.getElementById('inputApiKey').value = state.apiKey;
    openModal(modals.settings);
  });

  // Modal Closers
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => closeAllModals());
  });

  // Click Outside Modal to Close
  window.addEventListener('click', (e) => {
    Object.values(modals).forEach(m => {
      if (e.target === m) m.classList.add('hidden');
    });
  });

  // Social Modal Tabs & Copy
  document.getElementById('tabPostLinkedIn').addEventListener('click', () => {
    document.getElementById('contentLinkedIn').classList.remove('hidden');
    document.getElementById('contentX').classList.add('hidden');
    document.getElementById('tabPostLinkedIn').className = 'px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600/30 text-blue-300 border border-blue-500/50';
    document.getElementById('tabPostX').className = 'px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800';
  });

  document.getElementById('tabPostX').addEventListener('click', () => {
    document.getElementById('contentX').classList.remove('hidden');
    document.getElementById('contentLinkedIn').classList.add('hidden');
    document.getElementById('tabPostX').className = 'px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600/30 text-blue-300 border border-blue-500/50';
    document.getElementById('tabPostLinkedIn').className = 'px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800';
  });

  document.getElementById('btnCopyLinkedIn').addEventListener('click', () => {
    navigator.clipboard.writeText(LINKEDIN_POST);
    showToast('LinkedIn post copied to clipboard!');
  });

  document.getElementById('btnCopyX').addEventListener('click', () => {
    navigator.clipboard.writeText(X_POST);
    showToast('X (Twitter) post copied to clipboard!');
  });

  // Settings Save Key
  document.getElementById('btnSaveKey').addEventListener('click', () => {
    const key = document.getElementById('inputApiKey').value.trim();
    state.apiKey = key;
    localStorage.setItem('radarfish_api_key', key);
    updateKeyBadge();
    closeAllModals();
    showToast('Settings saved successfully!');
  });

  // Settings Test Key
  document.getElementById('btnTestKey').addEventListener('click', async () => {
    const key = document.getElementById('inputApiKey').value.trim();
    const lbl = document.getElementById('testKeyResult');
    lbl.textContent = 'Testing connectivity...';
    try {
      const res = await fetch('/api/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key })
      });
      const data = await res.json();
      if (data.ok) {
        lbl.className = 'text-xs font-mono text-emerald-400';
        lbl.textContent = '✓ Valid TinyFish API Key!';
      } else {
        lbl.className = 'text-xs font-mono text-rose-400';
        lbl.textContent = `✗ ${data.error || 'Connection failed'}`;
      }
    } catch (e) {
      lbl.className = 'text-xs font-mono text-rose-400';
      lbl.textContent = `✗ ${e.message}`;
    }
  });

  // API Inspector Endpoint Buttons
  document.querySelectorAll('.inspect-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.inspect-btn').forEach(b => {
        b.className = 'inspect-btn p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-left text-xs font-semibold text-slate-300';
      });
      btn.className = 'inspect-btn p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-800/80 text-left text-xs font-semibold text-cyan-300';
      state.currentInspectEndpoint = btn.dataset.inspect;
      renderInspectForm(btn.dataset.inspect);
    });
  });

  // Execute Inspector
  document.getElementById('btnExecuteInspect').addEventListener('click', executeInspectEndpoint);
}

function openModal(modal) {
  modal.classList.remove('hidden');
}

function closeAllModals() {
  Object.values(modals).forEach(m => m.classList.add('hidden'));
}

function setupSocialText() {
  document.getElementById('textLinkedIn').value = LINKEDIN_POST;
  document.getElementById('textX').value = X_POST;
}

// Initial Data Load
async function loadInitialData() {
  try {
    const res = await fetch('/api/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tinyfish-api-key': state.apiKey
      },
      body: JSON.stringify({
        role: elements.inputRole.value,
        location: elements.inputLocation.value,
        keywords: state.keywords,
        seniority: elements.selectSeniority.value,
        portal: elements.selectPortal.value,
        workMode: state.workMode,
        minScore: elements.rangeMinScore.value
      })
    });
    const data = await res.json();
    if (data.success) {
      state.jobs = data.listings || [];
      updateMetrics(data.stats, data.lastScraped);
      filterAndRenderJobs();
    }
  } catch (err) {
    console.error('Failed to load initial data:', err);
  }
}

// Run 3-Tier Scraper with Animated Progress
async function runScraper(isSilent = false) {
  if (!isSilent) {
    elements.progressStepper.classList.remove('hidden');
    elements.btnScrapeText.textContent = 'Scraping Live Web...';
    elements.btnScrapeIcon.textContent = '⏳';
    elements.btnRunScraper.disabled = true;

    // Simulate animated step progression
    animateStepper(1, '1. TinyFish Search: Discovering live listings on Greenhouse, Lever, Ashby...');
    await delay(450);
    animateStepper(2, '2. TinyFish Fetch: Rendering dynamic JavaScript pages via Chromium fleet...');
    await delay(450);
    animateStepper(3, '3. TinyFish Agent: Navigating interactive corporate career portals...');
    await delay(450);
    animateStepper(4, '4. Deduplication & AI Matching: Filtering duplicates & ranking 0-100%...');
  }

  try {
    const payload = {
      role: elements.inputRole.value,
      location: elements.inputLocation.value,
      keywords: state.keywords,
      seniority: elements.selectSeniority.value,
      portal: elements.selectPortal.value,
      workMode: state.workMode,
      minScore: elements.rangeMinScore.value
    };

    const res = await fetch('/api/scrape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tinyfish-api-key': state.apiKey
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success) {
      state.jobs = data.listings || [];
      updateMetrics(data.stats, data.lastScraped);
      filterAndRenderJobs();
      if (!isSilent) {
        showToast(`Found ${data.listings.length} verified openings!`);
      }
    } else {
      showToast(`Scrape Error: ${data.error}`);
    }
  } catch (err) {
    showToast(`Failed to scrape: ${err.message}`);
  } finally {
    if (!isSilent) {
      setTimeout(() => {
        elements.progressStepper.classList.add('hidden');
        elements.btnScrapeText.textContent = 'Run TinyFish 3-Tier Scraper';
        elements.btnScrapeIcon.textContent = '⚡';
        elements.btnRunScraper.disabled = false;
      }, 600);
    }
  }
}

function animateStepper(step, text) {
  elements.stepCounter.textContent = `Step ${step} of 4`;
  elements.liveStatusLog.textContent = text;
  
  const stepBoxes = [elements.stepSearch, elements.stepFetch, elements.stepAgent, elements.stepDedup];
  stepBoxes.forEach((box, i) => {
    if (i < step) {
      box.className = 'p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-700/80 flex items-center space-x-2 text-cyan-200';
    } else {
      box.className = 'p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center space-x-2 text-slate-400';
    }
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function updateMetrics(stats, lastScraped) {
  if (stats) {
    elements.metricTotalJobs.textContent = stats.matchesReturned ?? state.jobs.length;
    elements.metricDuplicates.textContent = `${stats.mergedDuplicates ?? 0} Merged`;
  }
  if (lastScraped) {
    const timeStr = new Date(lastScraped).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    elements.metricFreshness.textContent = `Today at ${timeStr}`;
  }
}

// Tab Switching
function switchTab(tab) {
  state.activeTab = tab;
  const tabAll = document.getElementById('tabAll');
  const tabSaved = document.getElementById('tabSaved');
  const tabApplied = document.getElementById('tabApplied');

  tabAll.className = 'filter-tab px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800 transition';
  tabSaved.className = 'filter-tab px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800 transition flex items-center space-x-1';
  tabApplied.className = 'filter-tab px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-900/90 text-slate-400 hover:text-slate-200 border border-slate-800 transition flex items-center space-x-1';

  if (tab === 'all') {
    tabAll.className = 'filter-tab px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800/80 transition';
  } else if (tab === 'saved') {
    tabSaved.className = 'filter-tab px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800/80 transition flex items-center space-x-1';
  } else if (tab === 'applied') {
    tabApplied.className = 'filter-tab px-3 py-1.5 text-xs font-semibold rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-800/80 transition flex items-center space-x-1';
  }

  filterAndRenderJobs();
}

// Filter, Sort, and Render Jobs
function filterAndRenderJobs() {
  const minScore = parseInt(elements.rangeMinScore.value, 10);
  const sortBy = elements.selectSort.value;

  // Filter
  let filtered = state.jobs.filter(job => {
    if (job.matchScore < minScore) return false;
    if (state.activeTab === 'saved' && !state.savedJobIds.has(job.id)) return false;
    if (state.activeTab === 'applied' && !state.appliedJobIds.has(job.id)) return false;
    return true;
  });

  // Sort
  if (sortBy === 'match') {
    filtered.sort((a, b) => b.matchScore - a.matchScore);
  } else if (sortBy === 'recent') {
    filtered.sort((a, b) => (a.postedDaysAgo || 0) - (b.postedDaysAgo || 0));
  } else if (sortBy === 'company') {
    filtered.sort((a, b) => a.company.localeCompare(b.company));
  }

  state.filteredJobs = filtered;

  // Counts
  elements.countAll.textContent = state.jobs.length;
  elements.countSaved.textContent = state.savedJobIds.size;
  elements.countApplied.textContent = state.appliedJobIds.size;

  if (filtered.length === 0) {
    elements.listingsContainer.innerHTML = '';
    elements.emptyState.classList.remove('hidden');
  } else {
    elements.emptyState.classList.add('hidden');
    renderListings(filtered);
  }
}

// Render Job Cards
function renderListings(jobs) {
  elements.listingsContainer.innerHTML = '';

  jobs.forEach(job => {
    const isSaved = state.savedJobIds.has(job.id);
    const isApplied = state.appliedJobIds.has(job.id);

    // Score coloring
    let scoreClass = 'score-amber';
    if (job.matchScore >= 80) scoreClass = 'score-emerald';
    else if (job.matchScore >= 60) scoreClass = 'score-blue';

    const card = document.createElement('div');
    card.className = 'glass-card rounded-2xl p-5 border border-slate-800 space-y-4';
    card.id = `job-${job.id}`;

    // Portal source badge
    const portalName = job.portalSource || 'Careers';
    const portalBadgeColor = getPortalBadgeColor(portalName);

    // Render Matched Skills
    const matchedSkillsHtml = (job.matchedSkills || [])
      .map(s => `<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">✓ ${escapeHtml(s)}</span>`)
      .join(' ');

    const missingSkillsHtml = (job.missingSkills || []).slice(0, 3)
      .map(s => `<span class="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-slate-400 border border-slate-800">${escapeHtml(s)}</span>`)
      .join(' ');

    // Requirements preview
    const reqsListHtml = (job.requirements || []).slice(0, 3)
      .map(r => `<li class="flex items-start space-x-1.5"><span class="text-cyan-400 text-xs">•</span><span>${escapeHtml(r)}</span></li>`)
      .join('');

    card.innerHTML = `
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        
        <!-- Left: Company & Role Details -->
        <div class="flex items-start space-x-3.5">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-950 to-blue-950 border border-cyan-800/60 flex items-center justify-center shrink-0 font-bold text-cyan-300 font-mono text-base shadow-sm">
            <span>${escapeHtml(job.company.slice(0,2).toUpperCase())}</span>
          </div>

          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h4 class="font-bold text-white text-base hover:text-cyan-400 transition cursor-pointer">${escapeHtml(job.title)}</h4>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${portalBadgeColor}">${escapeHtml(portalName)}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">${escapeHtml(job.seniority || 'Internship')}</span>
            </div>

            <div class="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
              <span class="font-semibold text-slate-200">${escapeHtml(job.company)}</span>
              <span>•</span>
              <span class="flex items-center gap-1">📍 ${escapeHtml(job.location || 'Remote')}</span>
              <span>•</span>
              <span class="flex items-center gap-1">💼 ${escapeHtml(job.workMode || 'Hybrid')}</span>
              <span>•</span>
              <span class="flex items-center gap-1">⏱️ ${escapeHtml(job.postedDate || 'Recent')}</span>
              ${job.salaryStipend ? `<span>•</span><span class="text-emerald-400 font-semibold font-mono">💵 ${escapeHtml(job.salaryStipend)}</span>` : ''}
            </div>
          </div>
        </div>

        <!-- Right: Match Score Gauge -->
        <div class="flex items-center space-x-3 self-end sm:self-center shrink-0">
          <div class="text-right hidden sm:block">
            <div class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">AI Match</div>
            <div class="text-[11px] text-slate-300">${job.matchScore >= 80 ? 'Exceptional Fit' : (job.matchScore >= 60 ? 'Strong Match' : 'Potential Fit')}</div>
          </div>
          <div class="score-circle ${scoreClass}">
            <span class="text-sm font-extrabold font-mono">${job.matchScore}%</span>
          </div>
        </div>

      </div>

      <!-- Description Snippet -->
      <p class="text-xs text-slate-300 line-clamp-2 leading-relaxed">
        ${escapeHtml(job.description || '')}
      </p>

      <!-- Requirements & Matched Skills Section -->
      <div class="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2">
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-900 pb-2">
          <div class="text-xs text-slate-400 flex items-center gap-1.5">
            <span class="font-semibold text-slate-200">Skill Alignment:</span>
            ${matchedSkillsHtml || '<span class="text-[11px] text-slate-500">None directly specified</span>'}
            ${missingSkillsHtml}
          </div>
          <div class="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
            <span>TinyFish Pipeline:</span>
            <span>${(job.tinyfishPipeline || ['Search', 'Fetch']).join(' → ')}</span>
          </div>
        </div>

        <!-- Requirements bullet list -->
        ${reqsListHtml ? `
          <ul class="text-[11px] text-slate-300 space-y-1">
            ${reqsListHtml}
          </ul>
        ` : ''}

        <!-- Expandable match reasoning -->
        ${(job.matchReasons || []).length > 0 ? `
          <div class="pt-1 text-[11px] text-cyan-300/90 flex flex-wrap gap-x-3 gap-y-1">
            <span class="text-slate-400 font-medium">Why it matched:</span>
            ${job.matchReasons.map(r => `<span>• ${escapeHtml(r)}</span>`).join('')}
          </div>
        ` : ''}
      </div>

      <!-- Bottom Card Action Toolbar -->
      <div class="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div class="flex items-center space-x-2">
          <!-- Save / Bookmark Button -->
          <button data-action="toggle-save" data-id="${job.id}" class="px-3 py-1.5 text-xs font-semibold rounded-lg ${isSaved ? 'bg-amber-950/80 text-amber-300 border border-amber-800' : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 border border-slate-700'} transition flex items-center space-x-1">
            <span>${isSaved ? '★' : '☆'}</span>
            <span>${isSaved ? 'Saved' : 'Save'}</span>
          </button>

          <!-- Mark as Applied Button -->
          <button data-action="toggle-applied" data-id="${job.id}" class="px-3 py-1.5 text-xs font-semibold rounded-lg ${isApplied ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' : 'bg-slate-800/90 text-slate-300 hover:bg-slate-700 border border-slate-700'} transition flex items-center space-x-1">
            <span>${isApplied ? '✓' : '○'}</span>
            <span>${isApplied ? 'Applied' : 'Mark Applied'}</span>
          </button>

          <!-- Inspect Pipeline Button -->
          <button data-action="inspect-card" data-id="${job.id}" class="px-2.5 py-1.5 text-xs rounded-lg text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 transition">
            🔍 Audit
          </button>
        </div>

        <!-- Apply Now CTA -->
        <a href="${job.applyUrl}" target="_blank" rel="noopener noreferrer" class="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 transition flex items-center space-x-1.5">
          <span>Apply on ${escapeHtml(portalName)}</span>
          <span class="text-xs">↗</span>
        </a>
      </div>
    `;

    // Event listeners inside card
    card.querySelector('[data-action="toggle-save"]').addEventListener('click', () => toggleSave(job.id));
    card.querySelector('[data-action="toggle-applied"]').addEventListener('click', () => toggleApplied(job.id));
    card.querySelector('[data-action="inspect-card"]').addEventListener('click', () => inspectJobCard(job));

    elements.listingsContainer.appendChild(card);
  });
}

function getPortalBadgeColor(portal) {
  const p = (portal || '').toLowerCase();
  if (p.includes('greenhouse')) return 'bg-emerald-950 text-emerald-300 border border-emerald-800/70';
  if (p.includes('lever')) return 'bg-blue-950 text-blue-300 border border-blue-800/70';
  if (p.includes('ashby')) return 'bg-purple-950 text-purple-300 border border-purple-800/70';
  if (p.includes('workday')) return 'bg-amber-950 text-amber-300 border border-amber-800/70';
  return 'bg-indigo-950 text-indigo-300 border border-indigo-800/70';
}

function toggleSave(id) {
  if (state.savedJobIds.has(id)) {
    state.savedJobIds.delete(id);
    showToast('Removed from saved');
  } else {
    state.savedJobIds.add(id);
    showToast('Saved to your bookmarks! ⭐');
  }
  localStorage.setItem('radarfish_saved', JSON.stringify(Array.from(state.savedJobIds)));
  filterAndRenderJobs();
}

function toggleApplied(id) {
  if (state.appliedJobIds.has(id)) {
    state.appliedJobIds.delete(id);
    showToast('Unmarked applied');
  } else {
    state.appliedJobIds.add(id);
    showToast('Marked as Applied! 🚀');
  }
  localStorage.setItem('radarfish_applied', JSON.stringify(Array.from(state.appliedJobIds)));
  filterAndRenderJobs();
}

function inspectJobCard(job) {
  const out = document.getElementById('inspectOutput');
  out.textContent = JSON.stringify(job, null, 2);
  document.getElementById('inspectStatus').textContent = 'Audit Data';
  openModal(modals.inspector);
}

// API Inspector Form Generator
function renderInspectForm(endpoint) {
  const form = document.getElementById('inspectForm');
  if (endpoint === 'search') {
    form.innerHTML = `
      <div class="space-y-1">
        <label class="text-xs font-semibold text-slate-300">Search Query / ATS Dork</label>
        <input type="text" id="inspectQuery" value="site:boards.greenhouse.io 'software engineer' intern" 
          class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none">
      </div>
      <div class="text-[11px] text-slate-400">Endpoint: <code>GET https://api.search.tinyfish.ai?query=...</code></div>
    `;
  } else if (endpoint === 'fetch') {
    form.innerHTML = `
      <div class="space-y-1">
        <label class="text-xs font-semibold text-slate-300">Target URL to Render in Chromium</label>
        <input type="text" id="inspectUrl" value="https://boards.greenhouse.io/figma/jobs/4891023" 
          class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none">
      </div>
      <div class="text-[11px] text-slate-400">Endpoint: <code>POST https://api.fetch.tinyfish.ai</code> with <code>{ "urls": [...] }</code></div>
    `;
  } else if (endpoint === 'agent') {
    form.innerHTML = `
      <div class="space-y-2">
        <div>
          <label class="text-xs font-semibold text-slate-300">Target Career Portal URL</label>
          <input type="text" id="inspectAgentUrl" value="https://stripe.com/jobs/search?q=intern" 
            class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:outline-none">
        </div>
        <div>
          <label class="text-xs font-semibold text-slate-300">Goal Prompt for TinyFish Autonomous Agent ("AI That Clicks")</label>
          <textarea id="inspectAgentGoal" rows="2" class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none">Navigate to the engineering jobs section, filter for India or Remote, click on matching internship openings, and extract title, location, requirements, and direct apply link.</textarea>
        </div>
      </div>
      <div class="text-[11px] text-slate-400">Endpoint: <code>POST https://agent.tinyfish.ai/v1/automation/run</code></div>
    `;
  }
}

async function executeInspectEndpoint() {
  const endpoint = state.currentInspectEndpoint;
  const out = document.getElementById('inspectOutput');
  const statusLbl = document.getElementById('inspectStatus');
  out.textContent = 'Sending request to TinyFish endpoint...';
  statusLbl.textContent = 'Executing...';

  try {
    let payload = { endpoint };
    if (endpoint === 'search') {
      payload.query = document.getElementById('inspectQuery')?.value || '';
    } else if (endpoint === 'fetch') {
      payload.urls = [document.getElementById('inspectUrl')?.value || ''];
    } else if (endpoint === 'agent') {
      payload.targetUrl = document.getElementById('inspectAgentUrl')?.value || '';
      payload.goal = document.getElementById('inspectAgentGoal')?.value || '';
    }

    const res = await fetch('/api/test-endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tinyfish-api-key': state.apiKey
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    statusLbl.textContent = res.status === 200 ? '200 OK' : `${res.status} Error`;
    out.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    statusLbl.textContent = 'Error';
    out.textContent = `Execution failed: ${err.message}`;
  }
}

// Utility: HTML Escaper
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
