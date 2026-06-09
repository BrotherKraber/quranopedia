// Islamic Philosophy Encyclopedia Database & Router
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

let activePage = 'main_page';
let exegesisDatabase = {};
let sourcesDatabase = {};

const GRAPH_DATA = {
    nodes: [
        { id: "aristotle", label: "Aristotle", x: 150, y: 80, type: "greek" },
        { id: "plato", label: "Plato", x: 300, y: 60, type: "greek" },
        { id: "al_kindi", label: "Al-Kindi", x: 200, y: 180, type: "philosopher" },
        { id: "al_farabi", label: "Al-Farabi", x: 350, y: 200, type: "philosopher" },
        { id: "al_razi", label: "Al-Razi", x: 500, y: 150, type: "philosopher" },
        { id: "ibn_sina", label: "Ibn Sina", x: 380, y: 300, type: "philosopher" },
        { id: "al_ghazali", label: "Al-Ghazali", x: 250, y: 400, type: "philosopher" },
        { id: "ibn_tufail", name: "Ibn Tufail", label: "Ibn Tufail", x: 520, y: 320, type: "philosopher" },
        { id: "ibn_rushd", label: "Ibn Rushd", x: 450, y: 450, type: "philosopher" },
        { id: "suhrawardi", label: "Suhrawardi", x: 600, y: 380, type: "philosopher" },
        { id: "ibn_arabi", label: "Ibn Arabi", x: 700, y: 420, type: "philosopher" },
        { id: "ibn_taymiyyah", label: "Ibn Taymiyyah", x: 120, y: 480, type: "philosopher" },
        { id: "mulla_sadra", label: "Mulla Sadra", x: 550, y: 550, type: "philosopher" },
        { id: "thomas_aquinas", label: "Thomas Aquinas", x: 400, y: 560, type: "latin" }
    ],
    links: [
        { source: "aristotle", target: "al_kindi", type: "influence", desc: "Aristotle's logical and metaphysical works were translated under Al-Kindi's direction." },
        { source: "aristotle", target: "al_farabi", type: "influence", desc: "Al-Farabi wrote extensive commentaries organizing Aristotle's logic." },
        { source: "plato", target: "al_razi", type: "influence", desc: "Al-Razi adapted Plato's Timaeus for his cosmology of the Five Eternals." },
        { source: "al_farabi", target: "ibn_sina", type: "influence", desc: "Ibn Sina mastered Aristotle's Metaphysics using Al-Farabi's commentaries." },
        { source: "ibn_sina", target: "al_ghazali", type: "refutation", desc: "Al-Ghazali refuted Ibn Sina's metaphysics in 'The Incoherence of the Philosophers'." },
        { source: "ibn_sina", target: "ibn_tufail", type: "influence", desc: "Ibn Tufail's 'Hayy ibn Yaqzan' was inspired by Avicennian psychology." },
        { source: "ibn_sina", target: "suhrawardi", type: "influence", desc: "Suhrawardi studied Avicennian philosophy before writing his Illuminationist critique." },
        { source: "al_ghazali", target: "ibn_rushd", type: "refutation", desc: "Ibn Rushd refuted Al-Ghazali in 'The Incoherence of the Incoherence'." },
        { source: "ibn_tufail", target: "ibn_rushd", type: "influence", desc: "Ibn Tufail introduced Ibn Rushd to the Almohad court and commissioned his commentaries." },
        { source: "ibn_rushd", target: "thomas_aquinas", type: "influence", desc: "Aquinas used Averroes' commentaries to reconcile Aristotle with Christian theology." },
        { source: "suhrawardi", target: "mulla_sadra", type: "synthesis", desc: "Mulla Sadra integrated Suhrawardi's Illuminationist concepts into his Transcendent Theosophy." },
        { source: "ibn_arabi", target: "mulla_sadra", type: "synthesis", desc: "Mulla Sadra synthesized Ibn Arabi's Wahdat al-Wujud into his metaphysics of existence." },
        { source: "ibn_sina", target: "mulla_sadra", type: "synthesis", desc: "Mulla Sadra built upon Avicennian metaphysics of existence and essence." },
        { source: "ibn_taymiyyah", target: "al_ghazali", type: "influence", desc: "Ibn Taymiyyah drew upon Al-Ghazali's criticisms of Peripatetic metaphysics." },
        { source: "aristotle", target: "ibn_taymiyyah", type: "refutation", desc: "Ibn Taymiyyah wrote a devastating critique of Aristotelian definitions and syllogisms." }
    ]
};

// 1. Philosophy Articles Content Database (loaded dynamically)
let PHILOSOPHY_ARTICLES = {};

// 2. Sidebar Metadata List
const PHILOSOPHERS_METADATA = [
    { id: "al_kindi", name: "Al-Kindi", english: "First Philosophy & Science", type: "Peripatetic" },
    { id: "al_farabi", name: "Al-Farabi", english: "Logic & Political Philosophy", type: "Peripatetic" },
    { id: "al_razi", name: "Al-Razi", english: "Platonism & Ethics", type: "Rationalist" },
    { id: "ibn_sina", name: "Ibn Sina", english: "Avicennian Metaphysics", type: "Peripatetic" },
    { id: "al_ghazali", name: "Al-Ghazali", english: "Theology & Sufism", type: "Ash'arite" },
    { id: "ibn_tufail", name: "Ibn Tufail", english: "Philosophical Novel", type: "Peripatetic" },
    { id: "ibn_rushd", name: "Ibn Rushd", english: "Aristotelianism & Law", type: "Peripatetic" },
    { id: "suhrawardi", name: "Suhrawardi", english: "Illuminationist Metaphysics", type: "Illuminationist" },
    { id: "ibn_arabi", name: "Ibn Arabi", english: "Sufi Metaphysics", type: "Sufi" },
    { id: "ibn_taymiyyah", name: "Ibn Taymiyyah", english: "Traditionalist Creed & Logic", type: "Athari" },
    { id: "ibn_khaldun", name: "Ibn Khaldun", english: "Sociology & History", type: "Ash'arite" },
    { id: "mulla_sadra", name: "Mulla Sadra", english: "Transcendent Theosophy", type: "Transcendent" }
];

// Initialize Application
async function initApp() {
    setupTheme();
    
    try {
        const [articlesRes, exegesisRes, sourcesRes] = await Promise.all([
            fetch('philosophy-data.json'),
            fetch('exegesis-data.json'),
            fetch('sources-data.json')
        ]);
        
        if (!articlesRes.ok || !exegesisRes.ok || !sourcesRes.ok) {
            throw new Error("Failed to load one or more database files.");
        }
        
        PHILOSOPHY_ARTICLES = await articlesRes.json();
        exegesisDatabase = await exegesisRes.json();
        sourcesDatabase = await sourcesRes.json();
        
    } catch (error) {
        console.error("Failed to load philosophy databases:", error);
        alert("Error loading encyclopedia databases. Please check your internet connection.");
        return;
    }
    
    populateSidebarPhilosophers();
    setupEventListeners();
    
    // Hash routing initial check
    if (window.location.hash) {
        const hash = window.location.hash.slice(1);
        if (PHILOSOPHY_ARTICLES[hash] || hash === 'influence_graph' || hash === 'source_reader') {
            activePage = hash;
        }
    }
    navigateTo(activePage, false);
}

// Setup Theme
function setupTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    let currentTheme = 'light';
    
    try {
        currentTheme = localStorage.getItem('theme') || 'light';
    } catch(e) {}
    
    if (currentTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.body.classList.contains('dark-mode');
            const newTheme = isDark ? 'light' : 'dark';
            if (newTheme === 'dark') {
                document.body.classList.add('dark-mode');
                document.body.classList.remove('light-mode');
            } else {
                document.body.classList.add('light-mode');
                document.body.classList.remove('dark-mode');
            }
            try {
                localStorage.setItem('theme', newTheme);
            } catch(e) {}
        });
    }
}

// Populate Philosophers in Left Sidebar
function populateSidebarPhilosophers() {
    const list = document.getElementById('sidebar-philosopher-list');
    if (!list) return;

    list.innerHTML = '';
    PHILOSOPHERS_METADATA.forEach(p => {
        const li = document.createElement('li');
        li.innerHTML = `
            <a href="#${p.id}" id="nav-${p.id}">
                <span>${p.name}</span>
                <span class="surah-list-num" style="font-size: 11px; padding: 2px 6px;">${p.type}</span>
            </a>
        `;
        list.appendChild(li);
    });
}

// Setup Interactive Listeners
function setupEventListeners() {
    // Mobile Sidebar Toggle
    const sidebarToggle = document.getElementById('sidebar-toggle-btn');
    const sidebar = document.getElementById('wiki-sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                sidebar.classList.toggle('active');
                sidebar.classList.remove('collapsed');
            } else {
                sidebar.classList.toggle('collapsed');
                sidebar.classList.remove('active');
            }
        });
    }

    // Hash change routing
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.slice(1) || 'main_page';
        if (PHILOSOPHY_ARTICLES[hash] || hash === 'influence_graph' || hash === 'source_reader') {
            navigateTo(hash, false);
        }
    });

    // Sidebar search filtering
    const filterInput = document.getElementById('philosopher-filter');
    if (filterInput) {
        filterInput.addEventListener('input', (e) => {
            filterSidebarPhilosophers(e.target.value);
        });
    }

    // Search bar functionality
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            showSearchSuggestions(e.target.value);
        });
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                executeSearch(searchInput.value);
            }
        });
    }
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            executeSearch(searchInput.value);
        });
    }

    // Hide search suggestions on click outside
    document.addEventListener('click', (e) => {
        const suggestionsBox = document.getElementById('search-suggestions');
        if (suggestionsBox && !e.target.closest('.search-container')) {
            suggestionsBox.style.display = 'none';
        }
    });

    // TOC Show/Hide Toggle
    const tocToggle = document.getElementById('toc-toggle');
    const tocList = document.getElementById('toc-list');
    if (tocToggle && tocList) {
        tocToggle.addEventListener('click', () => {
            const isHidden = tocList.style.display === 'none';
            tocList.style.display = isHidden ? 'block' : 'none';
            tocToggle.innerText = isHidden ? '[hide]' : '[show]';
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Focus search with '/' key, but not when inside input/textarea
        if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
            e.preventDefault();
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
            }
        }
        // Escape key to close drawer
        if (e.key === 'Escape') {
            closeExegesisDrawer();
        }
    });

    // Close drawer buttons
    const closeDrawerBtn = document.getElementById('close-drawer-btn');
    const drawerOverlay = document.getElementById('drawer-overlay');
    if (closeDrawerBtn) {
        closeDrawerBtn.addEventListener('click', closeExegesisDrawer);
    }
    if (drawerOverlay) {
        drawerOverlay.addEventListener('click', closeExegesisDrawer);
    }
}

// Filter Sidebar List
function filterSidebarPhilosophers(query) {
    const q = query.toLowerCase().trim();
    PHILOSOPHERS_METADATA.forEach(p => {
        const linkEl = document.getElementById(`nav-${p.id}`);
        if (!linkEl) return;
        const el = linkEl.parentElement;
        if (!el) return;

        const matchesName = p.name.toLowerCase().includes(q) || p.english.toLowerCase().includes(q);
        const matchesType = p.type.toLowerCase().includes(q);
        if (matchesName || matchesType) {
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    });
}

// Router NavigateTo
function navigateTo(pageId, updateHistory = true) {
    if (pageId !== 'influence_graph' && pageId !== 'source_reader' && !PHILOSOPHY_ARTICLES[pageId]) return;

    activePage = pageId;

    // Reset highlights
    document.querySelectorAll('.wiki-sidebar a').forEach(a => {
        a.classList.remove('active');
    });

    // Highlight active link
    const activeLink = document.getElementById(`nav-${pageId}`);
    if (activeLink) {
        activeLink.classList.add('active');
    }

    const titleEl = document.getElementById('article-title');
    const bodyEl = document.getElementById('article-body');
    const infoboxContainer = document.querySelector('.wiki-infobox-container');
    const tocBox = document.getElementById('toc-box');

    // Clear search suggestions
    const suggestionsBox = document.getElementById('search-suggestions');
    if (suggestionsBox) suggestionsBox.style.display = 'none';

    if (pageId === 'influence_graph') {
        if (titleEl) titleEl.innerText = "Interactive Influence Graph";
        if (infoboxContainer) infoboxContainer.style.display = 'none';
        if (tocBox) tocBox.style.display = 'none';
        
        renderInfluenceGraph();
    } else if (pageId === 'source_reader') {
        if (titleEl) titleEl.innerText = "Primary Sources & Commentary";
        if (infoboxContainer) infoboxContainer.style.display = 'block';
        if (tocBox) tocBox.style.display = 'none';
        
        renderSourceReader();
    } else {
        // Render normal Article content
        const article = PHILOSOPHY_ARTICLES[pageId];
        if (titleEl) titleEl.innerText = article.title;
        if (bodyEl) {
            bodyEl.innerHTML = article.content;
            parseVerseLinks(bodyEl);
        }
        if (infoboxContainer) infoboxContainer.style.display = 'block';
        renderInfobox(article.infobox);
        generateTOC();
    }

    // Scroll main body to top
    const contentEl = document.querySelector('.wiki-content');
    if (contentEl) {
        contentEl.scrollTop = 0;
    }

    // Close mobile sidebar
    const sidebarEl = document.getElementById('wiki-sidebar');
    if (sidebarEl) {
        sidebarEl.classList.remove('active');
    }

    // Update URL hash
    if (updateHistory) {
        window.location.hash = pageId;
    }
}

// Render Infobox
function renderInfobox(info) {
    const box = document.getElementById('wiki-infobox');
    const container = document.querySelector('.wiki-infobox-container');
    
    if (!box || !container) return;

    if (!info) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    box.innerHTML = `
        <div class="wiki-infobox-header">${info.title}</div>
        <div class="wiki-infobox-image">${info.image}</div>
        <table class="wiki-infobox-table">
            <tr>
                <td class="wiki-infobox-label">Era / Life</td>
                <td class="wiki-infobox-value">${info.number}</td>
            </tr>
            <tr>
                <td class="wiki-infobox-label">Primary Field</td>
                <td class="wiki-infobox-value">${info.meaning}</td>
            </tr>
            <tr>
                <td class="wiki-infobox-label">Origin / Region</td>
                <td class="wiki-infobox-value">${info.revelation_period}</td>
            </tr>
            <tr>
                <td class="wiki-infobox-label">Notable Concept</td>
                <td class="wiki-infobox-value">${info.verses}</td>
            </tr>
            <tr>
                <td class="wiki-infobox-label">Key Works / Names</td>
                <td class="wiki-infobox-value" style="font-style: italic; font-size: 11px;">${info.aliases}</td>
            </tr>
        </table>
    `;
}

// Dynamic Table of Contents (TOC)
function generateTOC() {
    const tocBox = document.getElementById('toc-box');
    const tocList = document.getElementById('toc-list');
    const bodyEl = document.getElementById('article-body');
    
    if (!tocBox || !tocList || !bodyEl) return;

    const headers = bodyEl.querySelectorAll('h2, h3');
    if (headers.length === 0) {
        tocBox.style.display = 'none';
        return;
    }

    tocBox.style.display = 'block';
    tocList.innerHTML = '';

    headers.forEach((h, idx) => {
        const id = `section-${idx}`;
        h.id = id;

        const li = document.createElement('li');
        li.className = h.tagName.toLowerCase() === 'h3' ? 'toc-h3' : 'toc-h2';
        
        const a = document.createElement('a');
        a.href = `#${activePage}`;
        a.innerText = h.innerText;
        a.addEventListener('click', (e) => {
            e.preventDefault();
            h.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        
        li.appendChild(a);
        tocList.appendChild(li);
    });
}

// Search Auto-complete Suggestions
function showSearchSuggestions(query) {
    const q = query.toLowerCase().trim();
    const suggestionsBox = document.getElementById('search-suggestions');
    if (!suggestionsBox) return;

    if (!q) {
        suggestionsBox.style.display = 'none';
        return;
    }

    const suggestions = [];

    // Search Articles
    Object.keys(PHILOSOPHY_ARTICLES).forEach(key => {
        const article = PHILOSOPHY_ARTICLES[key];
        if (article.title.toLowerCase().includes(q)) {
            suggestions.push({
                type: 'article',
                id: key,
                title: article.title,
                meta: 'Philosophy Article'
            });
        }
    });

    // Search Philosophers Metadata
    PHILOSOPHERS_METADATA.forEach(p => {
        if (p.name.toLowerCase().includes(q) || p.english.toLowerCase().includes(q)) {
            suggestions.push({
                type: 'philosopher',
                id: p.id,
                title: p.name,
                meta: `Philosopher — ${p.type}`
            });
        }
    });

    if (suggestions.length === 0) {
        suggestionsBox.style.display = 'none';
        return;
    }

    suggestionsBox.innerHTML = '';
    suggestions.slice(0, 5).forEach(s => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = `
            <div class="suggestion-title">${s.title}</div>
            <div class="suggestion-meta">${s.meta}</div>
        `;
        div.addEventListener('click', () => {
            navigateTo(s.id);
            const searchInput = document.getElementById('search-input');
            if (searchInput) searchInput.value = '';
            suggestionsBox.style.display = 'none';
        });
        suggestionsBox.appendChild(div);
    });
    suggestionsBox.style.display = 'block';
}

// Execute Full Search
function executeSearch(query) {
    const q = query.toLowerCase().trim();
    if (!q) return;

    // Direct Match Article Key
    if (PHILOSOPHY_ARTICLES[q]) {
        navigateTo(q);
        return;
    }

    // Match Philosopher Metadata
    const found = PHILOSOPHERS_METADATA.find(p => p.name.toLowerCase() === q || p.id === q);
    if (found) {
        navigateTo(found.id);
        return;
    }

    // Match suggestions
    const matches = [];
    Object.keys(PHILOSOPHY_ARTICLES).forEach(key => {
        const article = PHILOSOPHY_ARTICLES[key];
        if (article.title.toLowerCase().includes(q) || article.content.toLowerCase().includes(q)) {
            matches.push(key);
        }
    });

    if (matches.length === 1) {
        navigateTo(matches[0]);
    } else if (matches.length > 1) {
        let msg = `Multiple articles matched your search:\n`;
        matches.forEach(key => {
            msg += `  - ${PHILOSOPHY_ARTICLES[key].title}\n`;
        });
        alert(msg + `\nPlease click one of the search suggestions or search specifically by name.`);
    } else {
        alert(`No results found for "${query}". Try searching for 'Ibn Sina', 'Kalam', or 'Al-Ghazali'.`);
    }
}


// Parse Quranic verse references and convert them to interactive links
function parseVerseLinks(container) {
    if (!container) return;
    const text = container.innerHTML;
    
    // Matches patterns like "Surah An-Nur (24:35)", "Surah Ali 'Imran 3:190-191", "Surah Ash-Shura 42:11"
    const regex = /Surah\s+([A-Za-z\s'\-]+)\s*\(?(\d+):(\d+)(-\d+)?\)?/g;
    
    container.innerHTML = text.replace(regex, (match, surahName, chapter, startVerse, endVerse) => {
        const verseKey = `${chapter}:${startVerse}`;
        return `<a href="#" class="verse-link" data-verse="${verseKey}" data-surah="${surahName.trim()}">${match}</a>`;
    });
    
    // Add event listeners to the verse links
    container.querySelectorAll('.verse-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const verse = link.getAttribute('data-verse');
            const surah = link.getAttribute('data-surah');
            openExegesisDrawer(surah, verse);
        });
    });
}

// Open Scriptural Exegesis Side Drawer
function openExegesisDrawer(surahName, verseKey) {
    const drawer = document.getElementById('exegesis-drawer');
    const overlay = document.getElementById('drawer-overlay');
    const content = document.getElementById('exegesis-drawer-content');
    
    if (!drawer || !overlay || !content) return;

    const data = exegesisDatabase[verseKey];
    
    if (data) {
        content.innerHTML = `
            <div class="exegesis-header">${data.surah}</div>
            <div class="exegesis-ref">Chapter ${data.verse}</div>
            <div class="exegesis-arabic">${data.arabic}</div>
            <div class="exegesis-translation">"${data.translation}"</div>
            <div class="exegesis-commentary">
                <h4>Philosophical Commentary</h4>
                <p>${data.commentary}</p>
            </div>
        `;
    } else {
        content.innerHTML = `
            <div class="exegesis-header">${surahName}</div>
            <div class="exegesis-ref">Verse ${verseKey}</div>
            <p style="margin-top: 20px; color: var(--text-muted); font-style: italic;">Detailed exegesis content for this verse is coming soon.</p>
        `;
    }

    drawer.classList.add('active');
    overlay.classList.add('active');
}

// Close Scriptural Exegesis Side Drawer
function closeExegesisDrawer() {
    const drawer = document.getElementById('exegesis-drawer');
    const overlay = document.getElementById('drawer-overlay');
    if (drawer) drawer.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
}

// Render Interactive Influence Graph
function renderInfluenceGraph() {
    const bodyEl = document.getElementById('article-body');
    if (!bodyEl) return;

    bodyEl.innerHTML = `
        <div class="influence-graph-container">
            <p>This dynamic graph maps the transmission, synthesis, and refutation of concepts in classical Islamic philosophy across nine centuries. Hover over nodes to highlight connections, and click on nodes or lines to study the interaction details.</p>
            
            <svg class="influence-svg" id="influence-svg" viewBox="0 0 800 600" width="100%">
                <defs>
                    <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--text-muted)"></path>
                    </marker>
                </defs>
                <!-- Links (Lines) -->
                <g id="links-group"></g>
                <!-- Nodes (Circles) -->
                <g id="nodes-group"></g>
            </svg>

            <div class="graph-legend">
                <div class="legend-item"><span class="legend-color" style="background-color: #ff7b72;"></span><span>Classical Greek Roots</span></div>
                <div class="legend-item"><span class="legend-color" style="background-color: #58a6ff;"></span><span>Islamic Thinkers</span></div>
                <div class="legend-item"><span class="legend-color" style="background-color: #d33682;"></span><span>Western Scholastics</span></div>
                <div class="legend-item"><span class="legend-line" style="background-color: #58a6ff;"></span><span>Direct Influence / Commentary</span></div>
                <div class="legend-item"><span class="legend-line" style="border-top: 2px dashed #ff7b72;"></span><span>Critique / Refutation</span></div>
                <div class="legend-item"><span class="legend-line" style="border-top: 2px dotted #d33682;"></span><span>Metaphysical Synthesis</span></div>
            </div>

            <div class="graph-info-panel" id="graph-info-panel">
                <h4 id="info-title">Interactive Graph Panel</h4>
                <p id="info-desc">Click any node or link in the graph above to read details about their historical and philosophical interactions.</p>
            </div>
        </div>
    `;

    const svg = document.getElementById('influence-svg');
    const linksGroup = document.getElementById('links-group');
    const nodesGroup = document.getElementById('nodes-group');
    const infoTitle = document.getElementById('info-title');
    const infoDesc = document.getElementById('info-desc');

    if (!svg || !linksGroup || !nodesGroup) return;

    // Draw links
    GRAPH_DATA.links.forEach((link, idx) => {
        const sourceNode = GRAPH_DATA.nodes.find(n => n.id === link.source);
        const targetNode = GRAPH_DATA.nodes.find(n => n.id === link.target);

        if (sourceNode && targetNode) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const dx = targetNode.x - sourceNode.x;
            const dy = targetNode.y - sourceNode.y;
            const dr = Math.sqrt(dx * dx + dy * dy);
            
            // Curve slightly
            const d = `M${sourceNode.x},${sourceNode.y}A${dr},${dr} 0 0,1 ${targetNode.x},${targetNode.y}`;
            line.setAttribute('d', d);
            line.setAttribute('class', `link-line ${link.type}`);
            line.setAttribute('id', `link-${idx}`);
            line.setAttribute('marker-end', 'url(#arrow)');
            
            line.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.link-line, .node-circle').forEach(el => el.classList.remove('active'));
                line.classList.add('active');
                
                const srcName = sourceNode.label;
                const tgtName = targetNode.label;
                infoTitle.innerText = `${srcName} ➔ ${tgtName} (${link.type.toUpperCase()})`;
                infoDesc.innerHTML = `${link.desc}`;
            });

            linksGroup.appendChild(line);
        }
    });

    // Draw nodes
    GRAPH_DATA.nodes.forEach(node => {
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', node.x);
        circle.setAttribute('cy', node.y);
        circle.setAttribute('r', 12);
        circle.setAttribute('class', `node-circle ${node.type}`);
        circle.setAttribute('id', `node-${node.id}`);

        circle.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.link-line, .node-circle').forEach(el => el.classList.remove('active'));
            circle.classList.add('active');
            
            document.querySelectorAll('.link-line').forEach(line => {
                line.classList.remove('active');
            });
            
            GRAPH_DATA.links.forEach((l, idx) => {
                if (l.source === node.id || l.target === node.id) {
                    document.getElementById(`link-${idx}`).classList.add('active');
                }
            });

            infoTitle.innerText = node.label;
            
            let description = '';
            if (node.type === 'greek') {
                description = `Classical Greek philosopher whose texts served as the primary source material translated during the Abbasid Translation Movement.`;
            } else if (node.type === 'latin') {
                description = `European Scholastic theologian heavily influenced by the Latin translations of Ibn Rushd (Averroes) and Ibn Sina (Avicenna).`;
            } else {
                const article = PHILOSOPHY_ARTICLES[node.id];
                description = article ? article.meta : `Distinguished Islamic scholar.`;
            }

            infoDesc.innerHTML = `
                <p>${description}</p>
                ${node.type === 'philosopher' ? `<a href="#${node.id}" style="color: var(--accent-color); font-weight: 600; text-decoration: none;">View Full Biography & Work ➔</a>` : ''}
            `;
        });

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', node.x);
        text.setAttribute('y', node.y - 18);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('class', 'node-label');
        text.textContent = node.label;

        g.appendChild(circle);
        g.appendChild(text);
        nodesGroup.appendChild(g);
    });

    svg.addEventListener('click', () => {
        document.querySelectorAll('.link-line, .node-circle').forEach(el => el.classList.remove('active'));
        infoTitle.innerText = "Interactive Graph Panel";
        infoDesc.innerText = "Click any node or link in the graph above to read details about their historical and philosophical interactions.";
    });
}

// Render Primary Source Reader
function renderSourceReader() {
    const bodyEl = document.getElementById('article-body');
    const infobox = document.getElementById('wiki-infobox');
    
    if (!bodyEl || !infobox) return;

    let selectorOptions = '';
    Object.keys(sourcesDatabase).forEach(key => {
        const src = sourcesDatabase[key];
        selectorOptions += `<option value="${key}">${src.title} (by ${src.author})</option>`;
    });

    bodyEl.innerHTML = `
        <div class="source-reader-container">
            <p>Explore classical Islamic philosophical works side-by-side with modern commentary. Hover or click on the highlighted terms in the text below to view their explanation in the right context area.</p>
            
            <div class="source-selector-bar">
                <label for="source-select-dropdown">Select Treatise Excerpt:</label>
                <select id="source-select-dropdown" class="source-select">
                    ${selectorOptions}
                </select>
            </div>

            <div class="annotated-text-panel" id="annotated-text-panel">
                <!-- Loaded dynamically -->
            </div>
        </div>
    `;

    const dropdown = document.getElementById('source-select-dropdown');
    
    function loadSource(key) {
        const src = sourcesDatabase[key];
        if (!src) return;

        const textPanel = document.getElementById('annotated-text-panel');
        if (textPanel) {
            textPanel.innerHTML = `
                <h3 style="font-family: 'Outfit', sans-serif; margin-bottom: 5px;">${src.title}</h3>
                <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 20px; font-style: italic;">
                    Source: ${src.source}
                </div>
                <div class="source-body-text">
                    ${src.content}
                </div>
            `;

            textPanel.querySelectorAll('.annotated-term').forEach(termEl => {
                termEl.addEventListener('click', (e) => {
                    const term = termEl.getAttribute('data-term');
                    const definition = src.annotations[term];
                    if (definition) {
                        renderAnnotationCard(termEl.innerText, definition);
                    }
                });
            });
        }

        infobox.innerHTML = `
            <div class="wiki-infobox-header">SOURCE DETAILS</div>
            <div class="wiki-infobox-image">📖</div>
            <div style="padding: 15px; font-size: 12.5px;">
                <p><b>Author:</b> ${src.author}</p>
                <p style="margin-top: 8px;"><b>Treatise:</b> ${src.source.split('—')[0].trim()}</p>
                <div class="annotation-detail-card" style="margin-top: 15px;">
                    <div class="annotation-detail-title">INSTRUCTIONS</div>
                    <p class="annotation-detail-text">Click any highlighted, underlined term in the text to see its classical meaning and significance in this box.</p>
                </div>
            </div>
        `;
    }

    function renderAnnotationCard(termName, definition) {
        infobox.innerHTML = `
            <div class="wiki-infobox-header">TERM GLOSSARY</div>
            <div class="wiki-infobox-image">💡</div>
            <div style="padding: 15px; font-size: 12.5px;">
                <h3 style="font-family: 'Outfit', sans-serif; font-size: 14px; margin-bottom: 10px; color: var(--accent-color);">${termName}</h3>
                <p>${definition}</p>
                <div style="margin-top: 20px; border-top: 1px solid var(--border-light); padding-top: 10px; font-size: 11px; color: var(--text-muted);">
                    Click another highlighted word in the text to view its description.
                </div>
            </div>
        `;
    }

    dropdown.addEventListener('change', (e) => {
        loadSource(e.target.value);
    });

    if (dropdown.value) {
        loadSource(dropdown.value);
    }
}
