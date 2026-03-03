(function () {
    'use strict';

    // ─── SVG Icons (stroke-based, viewBox 0 0 24 24) ───
    const ICONS = {
        'trending-up': '<svg viewBox="0 0 24 24"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
        'refresh-cw': '<svg viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
        'sliders': '<svg viewBox="0 0 24 24"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>',
        'sunrise': '<svg viewBox="0 0 24 24"><path d="M17 18a5 5 0 0 0-10 0"/><line x1="12" y1="2" x2="12" y2="9"/><line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/><line x1="1" y1="18" x2="3" y2="18"/><line x1="21" y1="18" x2="23" y2="18"/><line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/><line x1="23" y1="22" x2="1" y2="22"/><polyline points="8 6 12 2 16 6"/></svg>',
        'anchor': '<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>',
        'layers': '<svg viewBox="0 0 24 24"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>',
        'star': '<svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    };

    // ─── State ───
    const BATCH_SIZE = 60;
    let papersData = null;
    let currentPhase = 'all';
    let currentMechanism = 'all';
    let currentYear = null;
    let displayedCount = 0;
    const selectedPapers = new Set();

    // ─── Init ───
    async function init() {
        try {
            const resp = await fetch('papers.json');
            papersData = await resp.json();
        } catch (e) {
            console.error('Failed to load papers.json:', e);
            return;
        }
        renderStats();
        renderPhaseTabs();
        renderMechanismPills();
        renderTimeline();
        renderPapers();
        setupEventListeners();
    }

    // ─── Filtering ───
    function getFilteredPapers() {
        let papers = papersData.papers;
        if (currentPhase !== 'all') {
            papers = papers.filter(function (p) {
                return p.process_phases && p.process_phases.indexOf(currentPhase) !== -1;
            });
        }
        if (currentMechanism !== 'all') {
            papers = papers.filter(function (p) {
                return p.mechanisms && p.mechanisms.indexOf(currentMechanism) !== -1;
            });
        }
        if (currentYear !== null) {
            papers = papers.filter(function (p) { return p.year === currentYear; });
        }
        return papers;
    }

    // Papers filtered by phase + mechanism (but NOT year) — used by timeline
    function getPhaseMechanismFiltered() {
        let papers = papersData.papers;
        if (currentPhase !== 'all') {
            papers = papers.filter(function (p) {
                return p.process_phases && p.process_phases.indexOf(currentPhase) !== -1;
            });
        }
        if (currentMechanism !== 'all') {
            papers = papers.filter(function (p) {
                return p.mechanisms && p.mechanisms.indexOf(currentMechanism) !== -1;
            });
        }
        return papers;
    }

    // ─── Stats ───
    function renderStats() {
        document.getElementById('stat-papers').textContent = papersData.meta.totalPapers;
        const [minY, maxY] = papersData.meta.yearRange;
        const yearStr = minY + '\u2013' + maxY;
        document.getElementById('stat-years').textContent = yearStr;
        document.getElementById('footer-count').textContent = papersData.meta.totalPapers;
        document.getElementById('footer-years').textContent = yearStr;
    }

    // ─── Process Phase Tabs (Layer 1) ───
    function renderPhaseTabs() {
        const container = document.getElementById('phase-tabs');
        const allCount = papersData.papers.length;

        let html = '<button class="tab active" data-phase="all" style="--tab-color: var(--accent)">' +
            '<span class="tab-icon">' + ICONS['star'] + '</span>' +
            '<span class="tab-label">All</span>' +
            '<span class="tab-count">' + allCount + '</span>' +
            '</button>';

        papersData.phaseCategories.forEach(function (cat) {
            html += '<button class="tab" data-phase="' + cat.key + '" style="--tab-color: ' + cat.color + '">' +
                '<span class="tab-icon">' + (ICONS[cat.icon] || ICONS['star']) + '</span>' +
                '<span class="tab-label">' + cat.name + '</span>' +
                '<span class="tab-count">' + cat.count + '</span>' +
                '</button>';
        });

        container.innerHTML = html;
    }

    // ─── Mechanism Pills (Layer 2) ───
    function renderMechanismPills() {
        const container = document.getElementById('mech-filters');

        // Count mechanisms within current phase filter
        let papers = papersData.papers;
        if (currentPhase !== 'all') {
            papers = papers.filter(function (p) {
                return p.process_phases && p.process_phases.indexOf(currentPhase) !== -1;
            });
        }

        const mechCounts = {};
        papers.forEach(function (p) {
            if (p.mechanisms) {
                p.mechanisms.forEach(function (m) {
                    mechCounts[m] = (mechCounts[m] || 0) + 1;
                });
            }
        });

        const allCount = papers.length;
        let html = '<button class="mech-pill' + (currentMechanism === 'all' ? ' active' : '') + '" data-mechanism="all">' +
            'All <span class="pill-count">' + allCount + '</span></button>';

        papersData.mechanismCategories.forEach(function (mc) {
            const count = mechCounts[mc.key] || 0;
            html += '<button class="mech-pill' + (currentMechanism === mc.key ? ' active' : '') + '" data-mechanism="' + mc.key + '"' +
                ' style="--mech-color: ' + mc.color + '">' +
                mc.name + ' <span class="pill-count">' + count + '</span></button>';
        });

        container.innerHTML = html;
    }

    // ─── Timeline ───
    function renderTimeline() {
        const container = document.getElementById('timeline-bars');

        // Get ALL years for the x-axis (full range)
        const allYearCounts = {};
        papersData.papers.forEach(function (p) {
            if (!p.year) return;
            allYearCounts[p.year] = (allYearCounts[p.year] || 0) + 1;
        });
        const allYears = Object.keys(allYearCounts).map(Number).sort(function (a, b) { return a - b; });

        // Get counts for phase+mechanism filtered papers (not year-filtered)
        const filtered = getPhaseMechanismFiltered();
        const yearCounts = {};
        filtered.forEach(function (p) {
            if (!p.year) return;
            yearCounts[p.year] = (yearCounts[p.year] || 0) + 1;
        });

        const vals = Object.values(yearCounts);
        const maxCount = vals.length > 0 ? Math.max.apply(null, vals) : 1;
        const maxBarH = 50;

        let html = '';
        allYears.forEach(function (year) {
            const count = yearCounts[year] || 0;
            const h = count === 0 ? 2 : Math.max(4, (count / maxCount) * maxBarH);
            const opacityStyle = count === 0 ? ';opacity:0.15' : '';
            const activeClass = currentYear === year ? ' active' : '';
            html += '<div class="timeline-bar' + activeClass + '" data-year="' + year + '" title="' + year + ': ' + count + ' papers">' +
                '<div class="bar-fill" style="height:' + h + 'px' + opacityStyle + '"></div>' +
                '<span class="bar-year">' + year + '</span>' +
                '</div>';
        });

        container.innerHTML = html;
    }

    // ─── Papers Grid ───
    function renderPapers() {
        const grid = document.getElementById('papers-grid');
        grid.innerHTML = '';
        displayedCount = 0;
        const filtered = getFilteredPapers();
        updateFilterInfo(filtered.length);
        loadMorePapers(filtered);
    }

    function loadMorePapers(filtered) {
        if (!filtered) filtered = getFilteredPapers();
        const grid = document.getElementById('papers-grid');
        const batch = filtered.slice(displayedCount, displayedCount + BATCH_SIZE);

        batch.forEach(function (paper, i) {
            const card = createPaperCard(paper, displayedCount + i);
            grid.appendChild(card);
        });

        displayedCount += batch.length;

        const btnLoadMore = document.getElementById('btn-load-more');
        const loadMoreCount = document.getElementById('load-more-count');

        if (displayedCount < filtered.length) {
            const remaining = filtered.length - displayedCount;
            loadMoreCount.textContent = remaining;
            btnLoadMore.style.display = '';
        } else {
            btnLoadMore.style.display = 'none';
        }
    }

    function createPaperCard(paper, index) {
        const phaseCat = papersData.phaseCategories.find(function (c) { return c.key === paper.process_phase; });
        const phaseColor = phaseCat ? phaseCat.color : '#6b7280';
        const phaseName = phaseCat ? phaseCat.name : (paper.process_phase || 'Other');
        const phaseIcon = phaseCat ? (ICONS[phaseCat.icon] || '') : '';

        const mechCat = papersData.mechanismCategories.find(function (c) { return c.key === paper.mechanism; });
        const mechColor = mechCat ? mechCat.color : '#4a6e8a';
        const mechName = mechCat ? mechCat.name : (paper.mechanism || 'Other');

        const card = document.createElement('div');
        card.className = 'paper-card' + (selectedPapers.has(paper.id) ? ' selected' : '');
        card.style.setProperty('--card-color', phaseColor);
        card.style.animationDelay = Math.min((index % BATCH_SIZE) * 0.03, 0.5) + 's';
        card.dataset.paperId = paper.id;

        const authorsStr = paper.authors.slice(0, 3).join(', ') +
            (paper.authors.length > 3 ? ' +' + (paper.authors.length - 3) : '');

        const isChecked = selectedPapers.has(paper.id);
        const findingsPreview = paper.key_findings ? escapeHtml(paper.key_findings) : '';

        card.innerHTML =
            '<button class="card-checkbox' + (isChecked ? ' checked' : '') + '" aria-label="Select paper">\u2713</button>' +
            '<div class="card-header">' +
                '<div class="card-badges">' +
                    '<span class="card-phase-badge" style="--card-color:' + phaseColor + '">' + phaseIcon + ' ' + phaseName + '</span>' +
                    '<span class="card-mechanism-badge" style="--mech-color:' + mechColor + '">' + mechName + '</span>' +
                '</div>' +
                '<div class="card-header-right">' +
                    '<span class="card-year">' + paper.year + '</span>' +
                '</div>' +
            '</div>' +
            '<h3 class="card-title">' + escapeHtml(paper.title) + '</h3>' +
            '<p class="card-authors">' + escapeHtml(authorsStr) + '</p>' +
            (findingsPreview ? '<p class="card-findings">' + findingsPreview + '</p>' : '') +
            '<p class="card-journal">' + escapeHtml(paper.journal) + '</p>';

        const checkbox = card.querySelector('.card-checkbox');
        checkbox.addEventListener('click', function (e) {
            e.stopPropagation();
            togglePaperSelection(paper.id, card, checkbox);
        });

        card.addEventListener('click', function () { openModal(paper); });
        return card;
    }

    // ─── Selection ───
    function togglePaperSelection(paperId, card, checkbox) {
        if (selectedPapers.has(paperId)) {
            selectedPapers.delete(paperId);
            card.classList.remove('selected');
            checkbox.classList.remove('checked');
        } else {
            selectedPapers.add(paperId);
            card.classList.add('selected');
            checkbox.classList.add('checked');
        }
        updateSelectionCount();
    }

    function updateSelectionCount() {
        const el = document.getElementById('selection-count');
        if (selectedPapers.size > 0) {
            el.textContent = selectedPapers.size;
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    }

    function selectAllFiltered() {
        const filtered = getFilteredPapers();
        filtered.forEach(function (p) { selectedPapers.add(p.id); });
        document.querySelectorAll('.paper-card').forEach(function (card) {
            card.classList.add('selected');
            var cb = card.querySelector('.card-checkbox');
            if (cb) cb.classList.add('checked');
        });
        updateSelectionCount();
    }

    function clearSelection() {
        selectedPapers.clear();
        document.querySelectorAll('.paper-card').forEach(function (card) {
            card.classList.remove('selected');
            var cb = card.querySelector('.card-checkbox');
            if (cb) cb.classList.remove('checked');
        });
        updateSelectionCount();
    }

    // ─── Modal ───
    function openModal(paper) {
        const modal = document.getElementById('paper-modal');

        // Badges
        const phaseCat = papersData.phaseCategories.find(function (c) { return c.key === paper.process_phase; });
        const phaseColor = phaseCat ? phaseCat.color : '#6b7280';
        const phaseName = phaseCat ? phaseCat.name : (paper.process_phase || 'Other');
        const phaseIcon = phaseCat ? (ICONS[phaseCat.icon] || '') : '';

        const mechCat = papersData.mechanismCategories.find(function (c) { return c.key === paper.mechanism; });
        const mechColor = mechCat ? mechCat.color : '#4a6e8a';
        const mechName = mechCat ? mechCat.name : (paper.mechanism || 'Other');

        const badgesHtml =
            '<span class="modal-phase-badge" style="background:color-mix(in srgb, ' + phaseColor + ' 15%, transparent);color:' + phaseColor + '">' +
                phaseIcon + ' ' + phaseName +
            '</span>' +
            '<span class="modal-mechanism-badge" style="background:color-mix(in srgb, ' + mechColor + ' 12%, transparent);color:' + mechColor + '">' +
                mechName +
            '</span>' +
            '<span class="modal-year">' + paper.year + '</span>';

        document.getElementById('modal-badges').innerHTML = badgesHtml;

        // Title + Authors
        document.getElementById('modal-title').textContent = paper.title;
        document.getElementById('modal-authors').textContent = paper.authors.join(', ');

        // Meta grid
        document.getElementById('modal-journal').textContent = paper.journal || '-';
        document.getElementById('modal-region').textContent = paper.region || '-';
        document.getElementById('modal-study-type').textContent = formatStudyType(paper.study_type) || '-';
        document.getElementById('modal-timescale').textContent = paper.time_scale || '-';

        // Relevance badge
        const relevanceEl = document.getElementById('modal-relevance');
        const rel = (paper.relevance || 'medium').toLowerCase();
        relevanceEl.innerHTML = '<span class="relevance-badge ' + rel + '">' + rel + '</span>';

        // Parameters
        const paramsSection = document.getElementById('modal-params-section');
        const paramsContainer = document.getElementById('modal-params');
        if (paper.parameters && paper.parameters.length > 0) {
            paramsSection.style.display = '';
            paramsContainer.innerHTML = paper.parameters.map(function (p) {
                return '<span class="param-tag">' + escapeHtml(p) + '</span>';
            }).join('');
        } else {
            paramsSection.style.display = 'none';
        }

        // Key Findings
        document.getElementById('modal-findings').textContent = paper.key_findings || 'No findings recorded.';

        // Links
        const doiBtn = document.getElementById('modal-btn-view');
        if (paper.url) {
            doiBtn.href = paper.url;
            doiBtn.style.display = '';
        } else if (paper.doi) {
            doiBtn.href = 'https://doi.org/' + paper.doi;
            doiBtn.style.display = '';
        } else {
            doiBtn.style.display = 'none';
        }

        const scholarBtn = document.getElementById('modal-btn-scholar');
        scholarBtn.href = 'https://scholar.google.com/scholar?q=' + encodeURIComponent(paper.title);

        // Show modal
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        document.getElementById('paper-modal').classList.remove('open');
        document.body.style.overflow = '';
    }

    function formatStudyType(st) {
        if (!st) return '';
        return st.replace(/_/g, ' ').replace(/\b\w/g, function (l) { return l.toUpperCase(); });
    }

    // ─── Filter Info ───
    function updateFilterInfo(count) {
        const infoContainer = document.getElementById('filter-info');
        const filterText = infoContainer.querySelector('.filter-text');
        const clearBtn = document.getElementById('btn-clear-filters');
        const parts = [];

        if (currentPhase !== 'all') {
            const cat = papersData.phaseCategories.find(function (c) { return c.key === currentPhase; });
            parts.push(cat ? cat.name : currentPhase);
        }
        if (currentMechanism !== 'all') {
            const mc = papersData.mechanismCategories.find(function (c) { return c.key === currentMechanism; });
            parts.push(mc ? mc.name : currentMechanism);
        }
        if (currentYear !== null) {
            parts.push(String(currentYear));
        }

        if (parts.length > 0) {
            filterText.innerHTML = 'Showing <strong>' + count + '</strong> papers filtered by: ' + parts.join(' \u00b7 ');
            clearBtn.style.display = '';
            infoContainer.classList.add('visible');
        } else {
            filterText.textContent = 'Showing all ' + count + ' papers';
            clearBtn.style.display = 'none';
            infoContainer.classList.remove('visible');
        }
    }

    // ─── Export ───
    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function exportJSON() {
        const papers = selectedPapers.size > 0
            ? papersData.papers.filter(function (p) { return selectedPapers.has(p.id); })
            : getFilteredPapers();
        const suffix = selectedPapers.size > 0 ? 'selected' : (currentPhase === 'all' ? 'all' : currentPhase);
        const filename = 'post_seismic_' + suffix + '_papers.json';
        downloadFile(JSON.stringify(papers, null, 2), filename, 'application/json');
    }

    function exportCSV() {
        const papers = selectedPapers.size > 0
            ? papersData.papers.filter(function (p) { return selectedPapers.has(p.id); })
            : getFilteredPapers();
        const suffix = selectedPapers.size > 0 ? 'selected' : (currentPhase === 'all' ? 'all' : currentPhase);
        const filename = 'post_seismic_' + suffix + '_papers.csv';

        const headers = ['id', 'title', 'authors', 'year', 'process_phase', 'mechanism', 'study_type', 'journal', 'doi', 'url', 'region', 'parameters', 'time_scale', 'key_findings', 'relevance'];
        const csvRows = [headers.join(',')];

        papers.forEach(function (p) {
            const row = headers.map(function (h) {
                var val = p[h];
                if (h === 'authors' || h === 'parameters') val = (val || []).join('; ');
                if (val === null || val === undefined) val = '';
                val = String(val).replace(/"/g, '""');
                return '"' + val + '"';
            });
            csvRows.push(row.join(','));
        });

        downloadFile(csvRows.join('\n'), filename, 'text/csv');
    }

    // ─── Utility ───
    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ─── Clear All Filters ───
    function clearAllFilters() {
        currentPhase = 'all';
        currentMechanism = 'all';
        currentYear = null;

        // Reset active tab
        document.querySelectorAll('#phase-tabs .tab').forEach(function (t) { t.classList.remove('active'); });
        var allTab = document.querySelector('#phase-tabs .tab[data-phase="all"]');
        if (allTab) allTab.classList.add('active');

        // Rebuild mechanism pills, timeline, papers
        renderMechanismPills();
        renderTimeline();
        renderPapers();
    }

    // ─── Event Listeners ───
    function setupEventListeners() {
        // Phase tabs (Layer 1)
        document.getElementById('phase-tabs').addEventListener('click', function (e) {
            var tab = e.target.closest('.tab');
            if (!tab) return;
            document.querySelectorAll('#phase-tabs .tab').forEach(function (t) { t.classList.remove('active'); });
            tab.classList.add('active');
            currentPhase = tab.dataset.phase;
            currentMechanism = 'all';   // Reset layer 2
            currentYear = null;         // Reset timeline selection
            renderMechanismPills();
            renderTimeline();
            renderPapers();
        });

        // Mechanism pills (Layer 2)
        document.getElementById('mech-filters').addEventListener('click', function (e) {
            var pill = e.target.closest('.mech-pill');
            if (!pill) return;
            document.querySelectorAll('#mech-filters .mech-pill').forEach(function (p) { p.classList.remove('active'); });
            pill.classList.add('active');
            currentMechanism = pill.dataset.mechanism;
            currentYear = null;         // Reset timeline selection
            renderTimeline();
            renderPapers();
        });

        // Timeline toggle (expand/collapse)
        document.getElementById('timeline-toggle').addEventListener('click', function () {
            document.querySelector('.timeline-container').classList.toggle('open');
        });

        // Timeline bar click (year filter)
        document.getElementById('timeline-bars').addEventListener('click', function (e) {
            var bar = e.target.closest('.timeline-bar');
            if (!bar) return;
            var year = parseInt(bar.dataset.year, 10);

            if (currentYear === year) {
                currentYear = null;
                bar.classList.remove('active');
            } else {
                document.querySelectorAll('.timeline-bar').forEach(function (b) { b.classList.remove('active'); });
                bar.classList.add('active');
                currentYear = year;
            }
            renderPapers();
        });

        // Download dropdown toggle
        document.getElementById('download-btn').addEventListener('click', function (e) {
            e.stopPropagation();
            document.querySelector('.download-dropdown').classList.toggle('open');
        });

        // Download menu items
        document.getElementById('btn-select-all').addEventListener('click', function () {
            selectAllFiltered();
            document.querySelector('.download-dropdown').classList.remove('open');
        });

        document.getElementById('btn-clear-selection').addEventListener('click', function () {
            clearSelection();
            document.querySelector('.download-dropdown').classList.remove('open');
        });

        document.getElementById('btn-dl-json').addEventListener('click', function () {
            exportJSON();
            document.querySelector('.download-dropdown').classList.remove('open');
        });

        document.getElementById('btn-dl-csv').addEventListener('click', function () {
            exportCSV();
            document.querySelector('.download-dropdown').classList.remove('open');
        });

        // Close dropdown on outside click
        document.addEventListener('click', function (e) {
            if (!e.target.closest('.download-dropdown')) {
                document.querySelector('.download-dropdown').classList.remove('open');
            }
        });

        // Load more
        document.getElementById('btn-load-more').addEventListener('click', function () {
            loadMorePapers();
        });

        // Clear filters button
        document.getElementById('btn-clear-filters').addEventListener('click', function () {
            clearAllFilters();
        });

        // Modal close
        document.getElementById('btn-close-modal').addEventListener('click', closeModal);

        // Click on backdrop (not modal content) closes modal
        document.getElementById('paper-modal').addEventListener('click', function (e) {
            if (e.target === this) closeModal();
        });

        // Escape key closes modal
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeModal();
        });
    }

    // ─── Boot ───
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
