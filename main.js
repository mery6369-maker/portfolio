import initialProjectDataMap from './projects.json';

let projectDataMap = initialProjectDataMap;
let currentOpenedProjectKey = null;
let openModalByKeyFn = null;
let closeModalFn = null;

function showToast(msg) {
    const toast = document.getElementById('toast-notification');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove('opacity-0', 'translate-y-4');
    toast.classList.add('opacity-100', 'translate-y-0');
    setTimeout(() => {
        toast.classList.remove('opacity-100', 'translate-y-0');
        toast.classList.add('opacity-0', 'translate-y-4');
    }, 2200);
}

document.addEventListener('DOMContentLoaded', () => {
    initCustomCursor();
    initSlideDotsTracker();
    initPortfolioTabsAndModal();
    initCopyEmail();
    initExperimental3DCard();
    initScrollAnimations();
    initDotGlow();
    initSkillVisualization();
    initHeroVideoFallback();
    initRoutingAndDeepLinks();
    initLocalVisualEditor();
});

/**
 * 1. Custom Inverted Follower Cursor
 */
function initCustomCursor() {
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouchDevice) {
        cursor.style.display = 'none';
        return;
    }

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let prevMouseX = 0, prevMouseY = 0;
    
    let currentScale = 1.0;
    let isHovered = false;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;

        const dx = mouseX - prevMouseX;
        const dy = mouseY - prevMouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        prevMouseX = mouseX;
        prevMouseY = mouseY;

        const targetScale = isHovered 
            ? 1.4 
            : Math.max(0.35, 1.0 - (dist / 35.0));

        currentScale += (targetScale - currentScale) * 0.15;

        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        cursor.style.transform = `translate(-50%, -50%) scale(${currentScale.toFixed(3)})`;

        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const interactiveElements = document.querySelectorAll('a, button, .acid-tag, .editorial-item, .slide-dot, .pop-tag');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            isHovered = true;
            cursor.classList.add('active');
        });
        el.addEventListener('mouseleave', () => {
            isHovered = false;
            cursor.classList.remove('active');
        });
    });
}

/**
 * 2. PPT Slide Snap & Navigation Tracker
 */
function initSlideDotsTracker() {
    const dots = document.querySelectorAll('.slide-dot');
    const navBtns = document.querySelectorAll('.top-nav-btn');
    const sections = document.querySelectorAll('.full-page-section');

    const sectionToHash = {
        'section-01': 'main',
        'section-02': 'works',
        'section-03': 'expertise',
        'section-04': 'contact'
    };

    function scrollToSectionId(id, updateHash = true) {
        const targetEl = document.getElementById(id);
        if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
            if (window._revealSection) window._revealSection(targetEl);
            if (updateHash && sectionToHash[id]) {
                history.replaceState(null, '', '#' + sectionToHash[id]);
            }
        }
    }

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const targetId = dot.getAttribute('data-target');
            if (targetId) scrollToSectionId(targetId, true);
        });
    });

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-nav');
            if (targetId) scrollToSectionId(targetId, true);
        });
    });

    const ctaBtn = document.getElementById('cta-explore-btn');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
            scrollToSectionId('section-02', true);
        });
    }

    const observerOptions = {
        root: null,
        threshold: 0.4
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                
                dots.forEach(d => {
                    if (d.getAttribute('data-target') === id) {
                        d.classList.add('active');
                    } else {
                        d.classList.remove('active');
                    }
                });

                navBtns.forEach(btn => {
                    if (btn.getAttribute('data-nav') === id) {
                        btn.classList.add('active');
                    } else {
                        btn.classList.remove('active');
                    }
                });

                const isModalOpen = document.getElementById('project-modal')?.classList.contains('open');
                const currentHash = window.location.hash;
                if (!isModalOpen && !currentHash.startsWith('#project/')) {
                    if (sectionToHash[id]) {
                        history.replaceState(null, '', '#' + sectionToHash[id]);
                    }
                }
            }
        });
    }, observerOptions);

    sections.forEach(sec => observer.observe(sec));
}

/**
 * 3. Portfolio Editorial List, Commercial / AI Lab Tabs & Modal Handling
 */
function initPortfolioTabsAndModal() {
    const tabBtns = document.querySelectorAll('.portfolio-tab-btn');
    const tabCommercial = document.getElementById('portfolio-grid-commercial');
    const tabAiLab = document.getElementById('portfolio-grid-ailab');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const target = btn.getAttribute('data-tab');
            if (target === 'commercial') {
                if (tabCommercial) tabCommercial.classList.remove('is-hidden');
                if (tabAiLab) tabAiLab.classList.add('is-hidden');
            } else {
                if (tabCommercial) tabCommercial.classList.add('is-hidden');
                if (tabAiLab) tabAiLab.classList.remove('is-hidden');
            }
        });
    });

    const modal = document.getElementById('project-modal');
    const modalClose = document.getElementById('modal-close-btn');
    const modalCopyLink = document.getElementById('modal-copy-link-btn');
    const modalImg = document.getElementById('modal-img');
    const modalVideo = document.getElementById('modal-video');
    const modalIframe = document.getElementById('modal-iframe');
    const modalPlayBtn = document.getElementById('modal-play-btn');
    const modalTitle = document.getElementById('modal-title');
    const modalClient = document.getElementById('modal-client');
    const modalYear = document.getElementById('modal-year');
    const modalRoles = document.getElementById('modal-roles');
    const modalTools = document.getElementById('modal-tools');
    const modalDesc = document.getElementById('modal-desc');
    const modalGalleryGrid = document.getElementById('modal-gallery-grid');
    const modalLinksWrapper = document.getElementById('modal-youtube-links-wrapper');
    const modalSpecsWrapper = document.getElementById('modal-specs-wrapper');
    const modalSpecsGrid = document.getElementById('modal-specs-grid');

    function toYouTubeEmbed(url) {
        const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/) || url.match(/youtu\.be\/shorts\/([a-zA-Z0-9_-]+)/);
        if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}?autoplay=1&rel=0`;
        const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
        if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1&rel=0`;
        const longMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
        if (longMatch) return `https://www.youtube.com/embed/${longMatch[1]}?autoplay=1&rel=0`;
        return url;
    }

    let currentEmbedUrl = '';
    let currentLocalVideoSrc = '';

    function openModalByKey(key, updateUrl = true) {
        const data = projectDataMap[key];
        if (!data || !modal) return;
        currentOpenedProjectKey = key;

        // Ensure appropriate tab is selected (Commercial vs AI Lab)
        const aiLabItem = document.querySelector(`#portfolio-grid-ailab [data-project="${key}"]`);
        if (aiLabItem && tabAiLab && tabCommercial) {
            tabCommercial.classList.add('is-hidden');
            tabAiLab.classList.remove('is-hidden');
            tabBtns.forEach(b => {
                if (b.getAttribute('data-tab') === 'ailab') b.classList.add('active');
                else b.classList.remove('active');
            });
        } else if (tabCommercial && tabAiLab) {
            tabCommercial.classList.remove('is-hidden');
            tabAiLab.classList.add('is-hidden');
            tabBtns.forEach(b => {
                if (b.getAttribute('data-tab') === 'commercial') b.classList.add('active');
                else b.classList.remove('active');
            });
        }

        if (modalIframe) {
            modalIframe.src = '';
            modalIframe.classList.add('is-hidden');
        }
        if (modalVideo) {
            modalVideo.pause();
            modalVideo.src = '';
            modalVideo.classList.add('is-hidden');
        }

        if (modalImg) {
            if (data.img) {
                modalImg.src = data.img;
                modalImg.style.display = '';
            } else {
                modalImg.src = '';
                modalImg.style.display = 'none';
            }
        }

        currentEmbedUrl = '';
        currentLocalVideoSrc = '';

        if (data.youtubeLinks && data.youtubeLinks.length > 0) {
            currentEmbedUrl = toYouTubeEmbed(data.youtubeLinks[0].url);
        } else if (data.videoSrc) {
            currentLocalVideoSrc = data.videoSrc;
        }

        const hasVideo = Boolean(currentEmbedUrl || currentLocalVideoSrc);
        if (modalPlayBtn) {
            if (hasVideo) {
                modalPlayBtn.classList.remove('is-hidden');
            } else {
                modalPlayBtn.classList.add('is-hidden');
            }
        }

        if (modalLinksWrapper) {
            modalLinksWrapper.innerHTML = '';
        }

        if (modalTitle) modalTitle.textContent = data.title;
        if (modalClient) modalClient.textContent = `Client: ${data.client}`;
        if (modalYear) modalYear.textContent = `Year: ${data.year}`;
        if (modalRoles) modalRoles.textContent = `Roles: ${data.roles || '-'}`;
        if (modalTools) modalTools.textContent = `Tools: ${data.tools || '-'}`;
        if (modalDesc) modalDesc.textContent = data.desc;

        if (modalSpecsGrid && modalSpecsWrapper) {
            modalSpecsGrid.innerHTML = '';
            if (data.specs) {
                modalSpecsWrapper.classList.remove('is-hidden');
                const specConfig = [
                    { key: 'target', icon: '🎯', label: '목적 & 타깃' },
                    { key: 'role', icon: '👤', label: '역할 & 기여도' },
                    { key: 'process', icon: '💡', label: '기획 & 제작 과정' },
                    { key: 'tools', icon: '🛠️', label: '제작 Tool & AI Tool' },
                    { key: 'aiScope', icon: '🤖', label: 'AI 활용 방식 & 범위' },
                    { key: 'result', icon: '📈', label: '게시 성과 및 결과' }
                ];

                specConfig.forEach(cfg => {
                    const val = data.specs[cfg.key];
                    if (val && typeof val === 'string' && val.trim() !== '') {
                        const card = document.createElement('div');
                        card.className = 'bg-surface-1 border border-hairline rounded-lg p-3 space-y-1 hover:border-white/30 transition-colors';
                        card.innerHTML = `
                            <div class="flex items-center gap-1.5 font-mono text-[11px] font-bold text-white">
                                <span class="text-xs">${cfg.icon}</span>
                                <span>${cfg.label}</span>
                            </div>
                            <p class="text-xs text-ink-muted leading-relaxed font-light pl-4">${val}</p>
                        `;
                        modalSpecsGrid.appendChild(card);
                    }
                });
            } else {
                modalSpecsWrapper.classList.add('is-hidden');
            }
        }

        if (modalGalleryGrid) {
            modalGalleryGrid.innerHTML = '';
            if (data.gallery && data.gallery.length > 0) {
                data.gallery.forEach(mediaSrc => {
                    const mediaDiv = document.createElement('div');
                    mediaDiv.className = 'w-full aspect-[16/10] bg-black border border-hairline rounded overflow-hidden group/still relative';
                    
                    if (mediaSrc.endsWith('.mp4') || mediaSrc.endsWith('.webm')) {
                        mediaDiv.innerHTML = `<video src="${mediaSrc}" autoplay loop muted playsinline class="w-full h-full object-cover group-hover/still:scale-105 transition-transform duration-300"></video><div class="absolute bottom-2 right-2 bg-black/70 text-white/90 text-[11px] font-mono px-2 py-0.5 rounded border border-white/20 backdrop-blur-sm pointer-events-none">▶ Play Video</div>`;
                        mediaDiv.classList.add('cursor-pointer');
                        mediaDiv.addEventListener('click', () => {
                            if (modalVideo) {
                                if (modalIframe) {
                                    modalIframe.src = '';
                                    modalIframe.classList.add('is-hidden');
                                }
                                modalVideo.src = mediaSrc;
                                modalVideo.classList.remove('is-hidden');
                                if (modalPlayBtn) modalPlayBtn.classList.add('is-hidden');
                                modalVideo.play().catch(() => {});
                                modalVideo.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                        });
                    } else {
                        mediaDiv.innerHTML = `<img src="${mediaSrc}" class="w-full h-full object-cover group-hover/still:scale-105 transition-transform duration-300">`;
                    }
                    modalGalleryGrid.appendChild(mediaDiv);
                });
            }
        }

        modal.classList.add('open');
        if (updateUrl) {
            history.pushState({ project: key }, '', `#project/${key}`);
        }

        // Notify Local Visual Editor if active
        if (window._syncEditorWithProject) {
            window._syncEditorWithProject(key);
        }
    }

    if (modalPlayBtn) {
        modalPlayBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentEmbedUrl && modalIframe) {
                modalIframe.src = currentEmbedUrl;
                modalIframe.classList.remove('is-hidden');
                modalPlayBtn.classList.add('is-hidden');
            } else if (currentLocalVideoSrc && modalVideo) {
                modalVideo.src = currentLocalVideoSrc;
                modalVideo.classList.remove('is-hidden');
                modalPlayBtn.classList.add('is-hidden');
                modalVideo.play().catch(() => {});
            }
        });
    }

    const items = document.querySelectorAll('.editorial-item');
    items.forEach(item => {
        item.addEventListener('click', () => {
            const key = item.getAttribute('data-project');
            openModalByKey(key, true);
        });
    });

    const closeModal = (updateUrl = true) => {
        if (!modal) return;
        modal.classList.remove('open');
        currentOpenedProjectKey = null;
        if (modalIframe) {
            modalIframe.src = '';
            modalIframe.classList.add('is-hidden');
        }
        if (modalVideo) {
            modalVideo.pause();
            modalVideo.src = '';
            modalVideo.classList.add('is-hidden');
        }
        if (modalPlayBtn) {
            modalPlayBtn.classList.add('is-hidden');
        }
        currentEmbedUrl = '';
        currentLocalVideoSrc = '';
        if (updateUrl) {
            history.pushState(null, '', '#works');
        }
    };

    if (modalClose) {
        modalClose.addEventListener('click', () => closeModal(true));
    }

    if (modalCopyLink) {
        modalCopyLink.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!currentOpenedProjectKey) return;
            const fullUrl = `${window.location.origin}${window.location.pathname}#project/${currentOpenedProjectKey}`;
            navigator.clipboard.writeText(fullUrl).then(() => {
                showToast(`COPIED PROJECT LINK: /#project/${currentOpenedProjectKey}`);
            }).catch(() => {
                showToast(`LINK: ${fullUrl}`);
            });
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(true);
        });
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('open')) closeModal(true);
        });
    }

    openModalByKeyFn = openModalByKey;
    closeModalFn = closeModal;

    // Floating Mouse-following Circular Lens Portal Handler
    const floatingPreview = document.getElementById('floating-project-preview');
    const floatingImg = document.getElementById('floating-preview-img');

    let previewX = 0, previewY = 0;
    let targetX = 0, targetY = 0;

    function updatePreviewPos() {
        previewX += (targetX - previewX) * 0.3;
        previewY += (targetY - previewY) * 0.3;
        if (floatingPreview) {
            floatingPreview.style.left = previewX + 'px';
            floatingPreview.style.top = previewY + 'px';
        }
        requestAnimationFrame(updatePreviewPos);
    }
    requestAnimationFrame(updatePreviewPos);

    window.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
    });

    items.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const key = item.getAttribute('data-project');
            const data = projectDataMap[key];
            if (data && data.img) {
                if (floatingImg) {
                    floatingImg.src = data.img;
                }
                if (floatingPreview) {
                    floatingPreview.classList.add('active');
                }
            } else {
                if (floatingPreview) {
                    floatingPreview.classList.remove('active');
                }
            }
        });

        item.addEventListener('mouseleave', () => {
            if (floatingPreview) {
                floatingPreview.classList.remove('active');
            }
        });
    });
}

/**
 * 4. URL Deep Linking & Route Dispatcher
 */
function initRoutingAndDeepLinks() {
    function handleRoute() {
        const hash = window.location.hash;
        if (!hash || hash === '#' || hash === '#main') {
            if (closeModalFn) closeModalFn(false);
            const sec = document.getElementById('section-01');
            if (sec) {
                if (window._revealSection) window._revealSection(sec);
                sec.scrollIntoView({ behavior: 'smooth' });
            }
            return;
        }

        if (hash === '#works') {
            if (closeModalFn) closeModalFn(false);
            const sec = document.getElementById('section-02');
            if (sec) {
                if (window._revealSection) window._revealSection(sec);
                sec.scrollIntoView({ behavior: 'smooth' });
            }
            return;
        }

        if (hash === '#expertise') {
            if (closeModalFn) closeModalFn(false);
            const sec = document.getElementById('section-03');
            if (sec) {
                if (window._revealSection) window._revealSection(sec);
                sec.scrollIntoView({ behavior: 'smooth' });
            }
            return;
        }

        if (hash === '#contact') {
            if (closeModalFn) closeModalFn(false);
            const sec = document.getElementById('section-04');
            if (sec) {
                if (window._revealSection) window._revealSection(sec);
                sec.scrollIntoView({ behavior: 'smooth' });
            }
            return;
        }

        // Project route matching: #project/xxx, #project-xxx, #work/xxx, or #xxx
        const match = hash.match(/^#(?:project|work)[\/-]([a-zA-Z0-9_-]+)$/) || hash.match(/^#([a-zA-Z0-9_-]+)$/);
        if (match) {
            const key = match[1];
            if (projectDataMap[key] && openModalByKeyFn) {
                const sec = document.getElementById('section-02');
                if (sec) {
                    if (window._revealSection) window._revealSection(sec);
                    sec.scrollIntoView({ behavior: 'smooth' });
                }
                openModalByKeyFn(key, false);
                return;
            }
        }
    }

    window.addEventListener('popstate', handleRoute);

    setTimeout(() => {
        if (window.location.hash) {
            handleRoute();
        }
    }, 120);
}

/**
 * 5. Local-Only Visual Editor (Active ONLY on localhost / 127.0.0.1)
 */
function initLocalVisualEditor() {
    const isLocalDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (!isLocalDev) {
        return; // Zero leak to production!
    }

    console.info('[Local Visual Editor] Running on local dev environment. Initializing editor toolbar.');

    // Create Floating Dev Pill Trigger
    const trigger = document.createElement('div');
    trigger.id = 'local-editor-trigger-wrap';
    trigger.className = 'fixed bottom-4 left-4 z-[999] font-mono text-xs';
    trigger.innerHTML = `
        <button id="local-editor-open-btn" class="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3.5 py-2 rounded-lg shadow-2xl flex items-center gap-2 cursor-pointer border border-blue-400 transition-transform hover:scale-105">
            <span>✏️ LOCAL EDITOR</span>
            <span class="text-[10px] bg-blue-900 px-1.5 py-0.5 rounded text-blue-200">DEV ONLY</span>
        </button>
    `;
    document.body.appendChild(trigger);

    // Create Drawer / Modal Modal Panel
    const drawer = document.createElement('div');
    drawer.id = 'local-editor-drawer';
    drawer.className = 'fixed bottom-16 left-4 w-[420px] max-w-[calc(100vw-32px)] max-h-[80vh] bg-[#121212] border border-blue-500/50 rounded-xl shadow-2xl z-[999] overflow-hidden flex flex-col font-mono text-xs text-white hidden';
    drawer.innerHTML = `
        <div class="p-3 bg-surface-2 border-b border-hairline flex items-center justify-between">
            <div class="flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span class="font-bold text-white text-[11px]">LOCAL VISUAL EDITOR</span>
            </div>
            <button id="local-editor-close-btn" class="text-ink-muted hover:text-white cursor-pointer px-1.5 py-0.5 rounded border border-hairline">[ESC]</button>
        </div>

        <div class="p-3.5 overflow-y-auto space-y-3 flex-1 text-[11px]">
            <div>
                <label class="block text-ink-muted mb-1 text-[10px] uppercase font-bold">1. 편집할 작품 선택</label>
                <select id="editor-project-select" class="w-full bg-[#1e1e1e] border border-hairline rounded p-2 text-white outline-none focus:border-blue-500">
                </select>
            </div>

            <div class="space-y-2 pt-1 border-t border-hairline">
                <div>
                    <label class="block text-ink-muted mb-0.5 text-[10px]">Title (작품명)</label>
                    <input id="ed-title" type="text" class="w-full bg-[#1a1a1a] border border-hairline rounded px-2 py-1.5 text-white">
                </div>
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-ink-muted mb-0.5 text-[10px]">Client (고객사)</label>
                        <input id="ed-client" type="text" class="w-full bg-[#1a1a1a] border border-hairline rounded px-2 py-1.5 text-white">
                    </div>
                    <div>
                        <label class="block text-ink-muted mb-0.5 text-[10px]">Year (제작년도)</label>
                        <input id="ed-year" type="text" class="w-full bg-[#1a1a1a] border border-hairline rounded px-2 py-1.5 text-white">
                    </div>
                </div>
                <div>
                    <label class="block text-ink-muted mb-0.5 text-[10px]">Roles (역할)</label>
                    <input id="ed-roles" type="text" class="w-full bg-[#1a1a1a] border border-hairline rounded px-2 py-1.5 text-white">
                </div>
                <div>
                    <label class="block text-ink-muted mb-0.5 text-[10px]">Tools (제작 툴)</label>
                    <input id="ed-tools" type="text" class="w-full bg-[#1a1a1a] border border-hairline rounded px-2 py-1.5 text-white">
                </div>
                <div>
                    <label class="block text-ink-muted mb-0.5 text-[10px]">Description (상세 설명)</label>
                    <textarea id="ed-desc" rows="3" class="w-full bg-[#1a1a1a] border border-hairline rounded px-2 py-1.5 text-white leading-relaxed"></textarea>
                </div>
            </div>

            <div class="space-y-2 pt-2 border-t border-hairline">
                <span class="block text-blue-400 text-[10px] uppercase font-bold">2. 6대 핵심 스펙 (Specs Grid)</span>
                <div>
                    <label class="block text-ink-muted mb-0.5 text-[10px]">🎯 목적 & 타깃 (target)</label>
                    <textarea id="ed-spec-target" rows="2" class="w-full bg-[#1a1a1a] border border-hairline rounded px-2 py-1 text-white"></textarea>
                </div>
                <div>
                    <label class="block text-ink-muted mb-0.5 text-[10px]">👤 역할 & 기여도 (role)</label>
                    <textarea id="ed-spec-role" rows="2" class="w-full bg-[#1a1a1a] border border-hairline rounded px-2 py-1 text-white"></textarea>
                </div>
                <div>
                    <label class="block text-ink-muted mb-0.5 text-[10px]">💡 기획 & 제작 과정 (process)</label>
                    <textarea id="ed-spec-process" rows="2" class="w-full bg-[#1a1a1a] border border-hairline rounded px-2 py-1 text-white"></textarea>
                </div>
                <div>
                    <label class="block text-ink-muted mb-0.5 text-[10px]">🛠️ 제작 Tool & AI Tool (tools)</label>
                    <textarea id="ed-spec-tools" rows="2" class="w-full bg-[#1a1a1a] border border-hairline rounded px-2 py-1 text-white"></textarea>
                </div>
                <div>
                    <label class="block text-ink-muted mb-0.5 text-[10px]">🤖 AI 활용 방식 & 범위 (aiScope)</label>
                    <textarea id="ed-spec-aiscope" rows="2" class="w-full bg-[#1a1a1a] border border-hairline rounded px-2 py-1 text-white"></textarea>
                </div>
                <div>
                    <label class="block text-ink-muted mb-0.5 text-[10px]">📈 게시 성과 및 결과 (result)</label>
                    <textarea id="ed-spec-result" rows="2" class="w-full bg-[#1a1a1a] border border-hairline rounded px-2 py-1 text-white"></textarea>
                </div>
            </div>
        </div>

        <div class="p-3 bg-surface-1 border-t border-hairline space-y-2">
            <div class="flex items-center gap-2">
                <button id="ed-save-file-btn" class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded text-[11px] cursor-pointer transition-colors flex items-center justify-center gap-1.5">
                    <span>💾 로컬 파일 저장</span>
                </button>
                <button id="ed-deploy-vercel-btn" class="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded text-[11px] cursor-pointer transition-colors flex items-center justify-center gap-1.5">
                    <span>🚀 Vercel 실서버 배포</span>
                </button>
            </div>
            <button id="ed-copy-prompt-btn" class="w-full bg-surface-2 hover:bg-white hover:text-black text-ink-muted py-1.5 rounded text-[10px] cursor-pointer border border-hairline transition-colors">
                📋 AI 수정 요청 프롬프트 복사
            </button>
        </div>
    `;
    document.body.appendChild(drawer);

    const openBtn = document.getElementById('local-editor-open-btn');
    const closeBtn = document.getElementById('local-editor-close-btn');
    const projectSelect = document.getElementById('editor-project-select');

    // Populate project select
    Object.keys(projectDataMap).forEach(k => {
        const opt = document.createElement('option');
        opt.value = k;
        opt.textContent = `${projectDataMap[k].title} (${k})`;
        projectSelect.appendChild(opt);
    });

    function loadProjectIntoEditor(key) {
        const p = projectDataMap[key];
        if (!p) return;
        projectSelect.value = key;
        document.getElementById('ed-title').value = p.title || '';
        document.getElementById('ed-client').value = p.client || '';
        document.getElementById('ed-year').value = p.year || '';
        document.getElementById('ed-roles').value = p.roles || '';
        document.getElementById('ed-tools').value = p.tools || '';
        document.getElementById('ed-desc').value = p.desc || '';

        const specs = p.specs || {};
        document.getElementById('ed-spec-target').value = specs.target || '';
        document.getElementById('ed-spec-role').value = specs.role || '';
        document.getElementById('ed-spec-process').value = specs.process || '';
        document.getElementById('ed-spec-tools').value = specs.tools || '';
        document.getElementById('ed-spec-aiscope').value = specs.aiScope || '';
        document.getElementById('ed-spec-result').value = specs.result || '';
    }

    function syncEditorToMemory(key) {
        if (!projectDataMap[key]) return;
        const p = projectDataMap[key];
        p.title = document.getElementById('ed-title').value.trim();
        p.client = document.getElementById('ed-client').value.trim();
        p.year = document.getElementById('ed-year').value.trim();
        p.roles = document.getElementById('ed-roles').value.trim();
        p.tools = document.getElementById('ed-tools').value.trim();
        p.desc = document.getElementById('ed-desc').value.trim();

        if (!p.specs) p.specs = {};
        p.specs.target = document.getElementById('ed-spec-target').value.trim();
        p.specs.role = document.getElementById('ed-spec-role').value.trim();
        p.specs.process = document.getElementById('ed-spec-process').value.trim();
        p.specs.tools = document.getElementById('ed-spec-tools').value.trim();
        p.specs.aiScope = document.getElementById('ed-spec-aiscope').value.trim();
        p.specs.result = document.getElementById('ed-spec-result').value.trim();
    }

    projectSelect.addEventListener('change', () => {
        const k = projectSelect.value;
        loadProjectIntoEditor(k);
        if (openModalByKeyFn) openModalByKeyFn(k, false);
    });

    window._syncEditorWithProject = (k) => {
        loadProjectIntoEditor(k);
    };

    openBtn.addEventListener('click', () => {
        const isHidden = drawer.classList.contains('hidden');
        if (isHidden) {
            drawer.classList.remove('hidden');
            const targetKey = currentOpenedProjectKey || Object.keys(projectDataMap)[0];
            loadProjectIntoEditor(targetKey);
        } else {
            drawer.classList.add('hidden');
        }
    });

    closeBtn.addEventListener('click', () => {
        drawer.classList.add('hidden');
    });

    // Save File Button (POST /api/save-projects)
    document.getElementById('ed-save-file-btn').addEventListener('click', async () => {
        const k = projectSelect.value;
        syncEditorToMemory(k);

        try {
            const res = await fetch('/api/save-projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectDataMap)
            });
            const data = await res.json();
            if (data.success) {
                showToast('✅ 로컬 파일 (projects.json)에 저장 완료!');
                if (openModalByKeyFn && currentOpenedProjectKey === k) {
                    openModalByKeyFn(k, false);
                }
            } else {
                alert('저장 실패: ' + (data.error || '오류 발생'));
            }
        } catch (err) {
            alert('저장 요청 중 통신 오류: ' + err.message);
        }
    });

    // Deploy Vercel Button (POST /api/deploy-vercel)
    document.getElementById('ed-deploy-vercel-btn').addEventListener('click', async () => {
        const k = projectSelect.value;
        syncEditorToMemory(k);

        const ok = confirm(`현재 수정한 [${projectDataMap[k].title}] 및 변경사항을 Git에 커밋하고 Vercel에 배포하시겠습니까?`);
        if (!ok) return;

        showToast('🚀 Git 커밋 및 Vercel 배포 진행 중...');

        try {
            // First save to file
            await fetch('/api/save-projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(projectDataMap)
            });

            // Trigger deploy
            const res = await fetch('/api/deploy-vercel', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                showToast('🎉 Vercel 자동 배포 트리거 완료! (약 30초 소요)');
            } else {
                alert('배포 실패: ' + (data.error || data.stderr || '오류'));
            }
        } catch (err) {
            alert('배포 요청 중 통신 오류: ' + err.message);
        }
    });

    // Copy Prompt Button
    document.getElementById('ed-copy-prompt-btn').addEventListener('click', () => {
        const k = projectSelect.value;
        syncEditorToMemory(k);
        const p = projectDataMap[k];
        const promptText = `[포트폴리오 수정 요청: ${p.title} (${k})]\n- 역할: ${p.roles}\n- 툴: ${p.tools}\n- 상세 설명: ${p.desc}\n- 스펙: ${JSON.stringify(p.specs, null, 2)}`;
        navigator.clipboard.writeText(promptText).then(() => {
            showToast('📋 AI 프롬프트가 클립보드에 복사되었습니다!');
        });
    });

    // Load initial project
    loadProjectIntoEditor(Object.keys(projectDataMap)[0]);
}

/**
 * 6. Copy Direct Email
 */
function initCopyEmail() {
    const emailBtns = [document.getElementById('copy-email-btn'), document.getElementById('card-email-btn')].filter(Boolean);
    
    emailBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const email = 'mery6369@gmail.com';
            navigator.clipboard.writeText(email).then(() => {
                const cardEmailText = document.getElementById('card-email-text');
                if (cardEmailText) {
                    const originalText = cardEmailText.textContent;
                    cardEmailText.textContent = 'COPIED TO CLIPBOARD!';
                    setTimeout(() => { cardEmailText.textContent = originalText; }, 2000);
                }
                showToast(`COPIED TO CLIPBOARD: ${email}`);
            });
        });
    });
}

/**
 * 7. Experimental 3D Parallax Tilt & Holographic Shine Card
 */
function initExperimental3DCard() {
    const wrapper = document.getElementById('experimental-card-wrapper');
    const card = document.getElementById('experimental-card');
    const holoShine = document.getElementById('card-holo-shine');

    if (!wrapper || !card) return;

    wrapper.addEventListener('mousemove', (e) => {
        const rect = wrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -12;
        const rotateY = ((x - centerX) / centerX) * 12;

        card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

        if (holoShine) {
            const px = (x / rect.width) * 100;
            const py = (y / rect.height) * 100;
            holoShine.style.background = `radial-gradient(circle at ${px}% ${py}%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 40%, transparent 70%)`;
        }
    });

    wrapper.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        if (holoShine) {
            holoShine.style.background = 'transparent';
        }
    });
}

/**
 * 8. Scroll-triggered Reveal Animations
 */
function initScrollAnimations() {
    const reveals = document.querySelectorAll('.animate-on-scroll');
    if (!reveals.length) return;

    function revealSection(sec) {
        if (!sec) return;
        sec.classList.add('visible');
        const items = sec.querySelectorAll('.reveal-item');
        items.forEach(item => item.classList.add('revealed'));
    }

    // Immediately reveal sections already on or near screen
    reveals.forEach(sec => {
        const rect = sec.getBoundingClientRect();
        if (rect.top < window.innerHeight + 100 && rect.bottom > -100) {
            revealSection(sec);
        }
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                revealSection(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach(el => observer.observe(el));
    window._revealSection = revealSection;
}

/**
 * 9. Mouse-reactive Dot Glow Canvas
 */
function initDotGlow() {
    const canvas = document.getElementById('dot-glow-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;

    let mouseX = -9999;
    let mouseY = -9999;
    let targetMouseX = -9999;
    let targetMouseY = -9999;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', (e) => {
        targetMouseX = e.clientX;
        targetMouseY = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        targetMouseX = -9999;
        targetMouseY = -9999;
    });

    const SPACING = 32;
    const RADIUS = 140;

    function render() {
        ctx.clearRect(0, 0, width, height);

        mouseX += (targetMouseX - mouseX) * 0.15;
        mouseY += (targetMouseY - mouseY) * 0.15;

        if (mouseX > -100 && mouseX < width + 100 && mouseY > -100 && mouseY < height + 100) {
            const startX = Math.max(0, Math.floor((mouseX - RADIUS) / SPACING) * SPACING);
            const endX = Math.min(width, Math.ceil((mouseX + RADIUS) / SPACING) * SPACING);
            const startY = Math.max(0, Math.floor((mouseY - RADIUS) / SPACING) * SPACING);
            const endY = Math.min(height, Math.ceil((mouseY + RADIUS) / SPACING) * SPACING);

            for (let x = startX; x <= endX; x += SPACING) {
                for (let y = startY; y <= endY; y += SPACING) {
                    const dx = x - mouseX;
                    const dy = y - mouseY;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < RADIUS) {
                        const intensity = 1 - (dist / RADIUS);
                        const dotRadius = 0.5 + intensity * 1.5;
                        const alpha = intensity * 0.45;

                        ctx.beginPath();
                        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(255, 255, 255, ${alpha.toFixed(3)})`;
                        ctx.fill();
                    }
                }
            }
        }

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

/**
 * 10. Interactive Skill Node Network Canvas (Expertise Section)
 */
function initSkillVisualization() {
    const canvas = document.getElementById('skill-network-canvas');
    const section03 = document.getElementById('section-03');
    if (!canvas || !section03) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let hasAnimated = false;

    const nodes = [
        { id: 'comfyui', label: 'ComfyUI Pipeline', x: 0.18, y: 0.35, size: 7, color: '#ffffff', desc: 'Custom Node Workflow, SDXL/Flux ControlNet, LoRA 파이프라인' },
        { id: 'ue5', label: 'Unreal Engine 5', x: 0.50, y: 0.22, size: 8, color: '#ffffff', desc: 'Lumen Global Illumination, Nanite, 공간 연출 & 버추얼 프로덕션' },
        { id: 'blender', label: 'Blender 3D', x: 0.82, y: 0.35, size: 7, color: '#ffffff', desc: 'Hard-surface 정밀 모델링, 지오메트리 노드, 카메라 리그' },
        { id: 'ae', label: 'After Effects', x: 0.30, y: 0.72, size: 7, color: '#ffffff', desc: 'CRT 모니터 아날로그 텍스처 합성, 키네틱 타이포, 2D/3D 컴포지팅' },
        { id: 'genai', label: 'Generative Video AI', x: 0.70, y: 0.72, size: 8, color: '#ffffff', desc: 'Runway Gen-3, Luma Dream Machine, Kling, Veo 비디오 생성' }
    ];

    const connections = [
        { from: 'comfyui', to: 'ue5', progress: 0 },
        { from: 'ue5', to: 'blender', progress: 0 },
        { from: 'comfyui', to: 'ae', progress: 0 },
        { from: 'ue5', to: 'genai', progress: 0 },
        { from: 'blender', to: 'genai', progress: 0 },
        { from: 'ae', to: 'genai', progress: 0 }
    ];

    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
        ctx.scale(dpr, dpr);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function drawNodes(lineProgress) {
        const dpr = window.devicePixelRatio || 1;
        const w = canvas.width / dpr;
        const h = canvas.height / dpr;

        ctx.clearRect(0, 0, w, h);

        connections.forEach(conn => {
            const fromNode = nodes.find(n => n.id === conn.from);
            const toNode = nodes.find(n => n.id === conn.to);
            if (!fromNode || !toNode) return;

            const x1 = fromNode.x * w;
            const y1 = fromNode.y * h;
            const x2 = toNode.x * w;
            const y2 = toNode.y * h;

            const curX = x1 + (x2 - x1) * lineProgress;
            const curY = y1 + (y2 - y1) * lineProgress;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(curX, curY);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();

            if (lineProgress > 0.5) {
                const dashOffset = (Date.now() * 0.02) % 20;
                ctx.save();
                ctx.setLineDash([4, 6]);
                ctx.lineDashOffset = -dashOffset;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.restore();
            }
        });

        canvas._nodePositions = [];

        nodes.forEach(node => {
            const nx = node.x * w;
            const ny = node.y * h;

            canvas._nodePositions.push({ x: nx, y: ny, size: node.size, id: node.id, label: node.label, desc: node.desc });

            ctx.beginPath();
            ctx.arc(nx, ny, node.size + 4, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(nx, ny, node.size, 0, Math.PI * 2);
            ctx.fillStyle = node.color;
            ctx.fill();

            ctx.font = '500 11px Pretendard, sans-serif';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.textAlign = 'center';
            ctx.fillText(node.label, nx, ny + node.size + 14);
        });
    }

    let progress = 0;
    function animateNodes() {
        if (progress < 1) {
            progress = Math.min(1, progress + 0.025);
            drawNodes(progress);
            requestAnimationFrame(animateNodes);
        } else {
            function loopPulse() {
                drawNodes(1);
                requestAnimationFrame(loopPulse);
            }
            loopPulse();
            setupInteractivity();
        }
    }

    function setupInteractivity() {
        const tooltip = document.getElementById('network-tooltip');
        const tooltipLabel = document.getElementById('tooltip-label');
        const tooltipDesc = document.getElementById('tooltip-desc');

        canvas.addEventListener('mousemove', (e) => {
            if (!canvas._nodePositions) return;
            const rect = canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            const scaleX = (canvas.width / dpr) / rect.width;
            const scaleY = (canvas.height / dpr) / rect.height;
            const mx = (e.clientX - rect.left) * scaleX;
            const my = (e.clientY - rect.top) * scaleY;

            let found = false;
            canvas._nodePositions.forEach((pos) => {
                const dist = Math.sqrt((mx - pos.x) ** 2 + (my - pos.y) ** 2);
                if (dist < pos.size + 10) {
                    found = true;
                    if (tooltip && tooltipLabel && tooltipDesc) {
                        tooltipLabel.textContent = pos.label;
                        tooltipDesc.textContent = pos.desc;
                        const tipX = (pos.x / (canvas.width / (window.devicePixelRatio || 1))) * rect.width;
                        const tipY = (pos.y / (canvas.height / (window.devicePixelRatio || 1))) * rect.height;
                        tooltip.style.left = tipX + 'px';
                        tooltip.style.top = (tipY - 60) + 'px';
                        tooltip.classList.remove('hidden');
                        tooltip.classList.add('visible');
                    }
                }
            });
            if (!found && tooltip) {
                tooltip.classList.add('hidden');
                tooltip.classList.remove('visible');
            }
        });

        canvas.addEventListener('mouseleave', () => {
            if (tooltip) {
                tooltip.classList.add('hidden');
                tooltip.classList.remove('visible');
            }
        });
    }

    function animateTagGrid() {
        const cards = document.querySelectorAll('.tool-tag-card');
        cards.forEach((card, i) => {
            const delay = parseInt(card.getAttribute('data-delay'), 10) || i;
            setTimeout(() => {
                card.classList.add('visible');
            }, delay * 80);
        });
    }

    function startTypingDirection() {
        const el = document.getElementById('direction-typing');
        if (!el) return;
        const fullText = 'Direction(심미안) ➔ Architecture(노드 파이프라인) ➔ Realization(3D 미디어) ➔ Flywheel Feedback 선순환';
        let charIndex = 0;

        el.innerHTML = '<span class="typing-cursor">|</span>';

        const typeInterval = setInterval(() => {
            charIndex++;
            el.innerHTML = fullText.slice(0, charIndex) + '<span class="typing-cursor">|</span>';
            if (charIndex >= fullText.length) {
                clearInterval(typeInterval);
                setTimeout(() => {
                    el.innerHTML = fullText;
                }, 1500);
            }
        }, 40);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasAnimated) {
                hasAnimated = true;
                requestAnimationFrame(animateNodes);
                animateTagGrid();
                setTimeout(startTypingDirection, 800);
                observer.unobserve(section03);
            }
        });
    }, { threshold: 0.3 });

    observer.observe(section03);
    drawNodes(0);
}

/**
 * 11. Hero Video Fallback
 */
function initHeroVideoFallback() {
    const video = document.getElementById('hero-video');
    if (!video) return;

    video.addEventListener('error', () => {
        video.style.display = 'none';
        const container = video.parentElement;
        if (container) {
            const poster = video.getAttribute('poster');
            if (poster) {
                const img = document.createElement('img');
                img.src = poster;
                img.alt = 'Hero Visual';
                img.className = 'w-full h-full object-cover';
                container.insertBefore(img, container.firstChild);
            }
        }
    });
}
