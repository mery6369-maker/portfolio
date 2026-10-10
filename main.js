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
    
    // Dynamic scale state
    let currentScale = 1.0;
    let isHovered = false;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        // Smooth position follow (LERP)
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;

        // Calculate instantaneous mouse speed
        const dx = mouseX - prevMouseX;
        const dy = mouseY - prevMouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Update previous mouse position
        prevMouseX = mouseX;
        prevMouseY = mouseY;

        // Determine target scale based on speed:
        // When stopped/slow: scale = 1.0 (2x large default size)
        // When moving fast: scale shrinks down to 0.35 (small dot)
        const targetScale = isHovered 
            ? 1.4 
            : Math.max(0.35, 1.0 - (dist / 35.0));

        // Smoothly interpolate currentScale towards targetScale
        currentScale += (targetScale - currentScale) * 0.15;

        // Apply smooth 2D transform
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

    function scrollToSectionId(id) {
        const targetEl = document.getElementById(id);
        if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth' });
        }
    }

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const targetId = dot.getAttribute('data-target');
            if (targetId) scrollToSectionId(targetId);
        });
    });

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-nav');
            if (targetId) scrollToSectionId(targetId);
        });
    });

    const ctaBtn = document.getElementById('cta-explore-btn');
    if (ctaBtn) {
        ctaBtn.addEventListener('click', () => {
            scrollToSectionId('section-02');
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
            }
        });
    }, observerOptions);

    sections.forEach(sec => observer.observe(sec));
}

/**
 * 3. Portfolio Editorial List, Commercial / AI Lab Tabs & Modal Handling
 */
function initPortfolioTabsAndModal() {
    // 14 Commercial Projects — only referencing assets that actually exist in /public
    // Projects without local assets have img: '' (user will provide later)
    const projectDataMap = {
        'elypecs-landing': {
            title: 'ELYPECS 랜딩페이지 2D 모션',
            client: 'Olim Planet (인하우스)',
            year: '2023.04 - 2023.11',
            category: '2D Motion Graphics / UI·UX Interaction',
            roles: 'Conti(기획), 2D Design, Motion Design, Edit / Compositing',
            tools: 'After Effects, Illustrator',
            img: '/projects/elypecs_landing_main.png',
            portfolioUrl: 'https://chayein.myportfolio.com/elypecs-com',
            youtubeLinks: [
                { label: '▶ Watch Landing Motion (YouTube)', url: 'https://youtu.be/pS4fH67jQ6k' }
            ],
            desc: '(구)ELYPECS.com 메인 랜딩페이지에 적용된 2D 모션그래픽 기능 소개 영상입니다. 엘리펙스 플랫폼의 핵심 서비스 기능 사용 방법(가상 공간 선택, 스페이스 에디터를 활용한 공간 편집 및 구축, 통계 대시보드 및 데이터 연동 등)을 사용자가 직관적으로 이해할 수 있도록 단계별 UI 인터랙션과 명확한 2D 모션그래픽으로 연출·제작하였습니다.',
            gallery: [
                '/projects/elypecs_landing_main.png',
                '/projects/elypecs_landing_ep1.png',
                '/projects/elypecs_landing_ep2.png',
                '/projects/elypecs_landing_ep3.png'
            ],
            specs: {
          "target": "플랫폼 신규 방문자 및 잠재 고객 대상, 3D 가상공간 구축 SaaS 핵심 기능을 직관적으로 설명",
          "role": "1인 총괄 100% (콘티 기획, 2D UI 일러스트 디자인, 모션 인터랙션 제작, 컴포지팅)",
          "process": "공간 선택 ➔ 에디터 편집 ➔ 통계 대시보드의 3단계 여정 도출 ➔ 단계별 UI 인터랙션을 2D 모션으로 시각화",
          "tools": "After Effects, Illustrator",
          "result": "구 ELYPECS.com 공식 메인 랜딩페이지 상단 기능 소개 영상으로 라이브 적용, 서비스 기능 이해도 대폭 개선"
}
        },
        'elypecs-bs': {
            title: 'ELYPECS 비즈니스센터 인트로',
            client: 'Olim Planet (인하우스)',
            year: '2024.04',
            category: '2D Motion Graphics / Brand Space Intro',
            roles: 'Conti(기획), 2D Design, Motion Design, Color Grading',
            tools: 'After Effects, Illustrator, Premiere Pro',
            img: '/projects/elypecs_bs_thumb_end.png',
            youtubeLinks: [
                { label: '▶ Watch BS Intro Video (YouTube)', url: 'https://youtu.be/xKWao8ZfaZE' }
            ],
            desc: '엘리펙스 비즈니스센터(Brand Space) 브랜드 스페이스 진입을 위한 인트로 2D 모션그래픽 영상입니다. 직관적이고 세련된 타이포그래피와 공간 브랜딩 그래픽 트랜지션을 통해 비즈니스센터의 전문성과 미래지향적 가치를 효과적으로 전달하도록 기획·제작하였습니다.',
            gallery: [
                '/projects/elypecs_bs_thumb_end.png',
                '/projects/elypecs_bs_intro1.png',
                '/projects/elypecs_bs_intro2.png',
                '/projects/elypecs_bs_intro3.png'
            ],
            specs: {
          "target": "기업 고객(B2B) 대상, 가상 브랜드 스페이스 '비즈니스센터' 진입 시 전문성과 신뢰도를 전달하는 브랜드 인트로",
          "role": "1인 총괄 100% (콘티 기획, 2D 그래픽 디자인, 모션그래픽, 컬러 그레이딩)",
          "process": "기업 브랜드 아이덴티티 분석 ➔ 모던한 타이포그래피 애니메이션 설계 ➔ 공간 진입감을 높이는 그래픽 트랜지션 연출",
          "tools": "After Effects, Illustrator, Premiere Pro",
          "result": "엘리펙스 비즈니스센터 공식 진입 인트로 영상으로 적용, 브랜드 인지도 및 사용자 진입 몰입도 향상"
}
        },
        'clock': {
            title: 'Clock Gear Symphony',
            client: 'Personal Project',
            year: '2025',
            category: '3D Motion / Mechanics',
            roles: '개인 R&D',
            tools: 'Blender, After Effects',
            img: '/projects/clock_main.png',
            portfolioUrl: 'https://chayein.myportfolio.com/clock-gear-symphony',
            youtubeLinks: [
                { label: '▶ Watch YouTube Shorts (YouTube)', url: 'https://youtube.com/shorts/2DbJapcvFjs' }
            ],
            desc: '정밀한 시계 톱니바퀴 메커니즘과 정교한 기계적 연동 모션을 3D 렌더링으로 연출한 정밀 모션 스터디 작품입니다.',
            gallery: [
                '/projects/clock_thumb1.jpg',
                '/projects/clock_thumb2.png',
                '/projects/clock_thumb3.png'
            ],
            specs: {
          "target": "3D 모션그래픽스 커뮤니티 및 숏폼 시청자 대상, 정밀 기계 메커니즘의 기구학적 아름다움을 보여주는 기술 스터디",
          "role": "개인 R&D",
          "process": "정밀 시계 무브먼트 부품 구조 분석 ➔ 기어 톱니 간 맞물림 기구학 리깅 ➔ 금속 재질감 라이팅 및 매크로 샷 렌더링",
          "tools": "Blender, After Effects",
          "result": "정교한 3D 역학 제어 및 하이엔드 렌더링 역량 검증, 유튜브 숏폼 포트폴리오 쇼케이스 발행"
}
        },
        'endangered': {
            title: '국립생태원 멸종위기종 Ai 아나몰픽',
            client: '국립생태원',
            year: '2026',
            category: 'AI Anamorphic / 3D Art',
            roles: '1인 총괄 100% (기획, 제작)',
            tools: 'Blender, After Effects, Photoshop, Runway, Veo',
            img: '/projects/endangered_still_main.png',
            portfolioUrl: 'https://chayein.myportfolio.com/endangered-species',
            youtubeLinks: [
                { label: '▶ Watch Anamorphic Video (YouTube)', url: 'https://youtu.be/luq9wjWr4YA' }
            ],
            desc: '국립생태원 멸종위기종을 주제로 한 AI 기반 아나몰픽 미디어아트 프로젝트입니다.',
            gallery: [
                '/projects/endangered_thumb1.png',
                '/projects/endangered_thumb2.png',
                '/projects/endangered_thumb3.png'
            ],
            specs: {
          "target": "국립생태원 방문객 대상, 멸종위기종 보호 메시지를 전달하는 3D 입체 착시 아나몰픽 미디어아트",
          "role": "1인 총괄 100% (기획, 제작)",
          "process": "관람객 시야각(FOV) 착시 궤적 계산 ➔ 동물 선정 및 이미지 제작 ➔ Ai 비디오 생성 ➔ AE 후반 합성",
          "tools": "Blender, After Effects, Photoshop, Runway, Veo",
          "aiScope": "동물의 사실적 털 질감 생성 및 비디오 업스케일링. 3D 카메라 가이드를 결합해 AI 특유의 형태 왜곡 방지",
          "result": "국립생태원 미디어 전광판 공식 송출 완수, 3D+AI 하이브리드 공정으로 기존 3D 단독 대비 제작 리드타임 45% 단축"
}
        },
        'mediacalendar': {
            title: 'Ai MEDIA ART [ MEDIA CALENDAR ]',
            client: 'Personal / Media Art',
            year: '2023',
            category: 'AI Media Art / Motion',
            roles: 'AI Art Direction, Motion Design & Editing',
            tools: 'Midjourney, Runway, Adobe After Effects, Photoshop',
            img: '/projects/mediacalendar_autumn_bloom.gif',
            portfolioUrl: 'https://chayein.myportfolio.com/mediacalendar',
            youtubeLinks: [
                { label: '▶ Watch Full Video (YouTube)', url: 'https://youtu.be/VhjY9sgRTH8' }
            ],
            desc: '구독형 미디어아트 상품 Media Calendar 제작에 참여하였습니다. 57종의 테마 콘텐츠 중 13종의 콘텐츠를 제작하였으며 MidJourney, Runway, Suno, Adobe After Effects를 활용하였습니다.',
            gallery: [
                '/projects/mediacalendar_autumn_bloom.gif',
                '/projects/mediacalendar_reel_1.png',
                '/projects/mediacalendar_reel_2.png'
            ],
            specs: {
          "target": "도심 보행자 및 옥외 전광판 시청자 대상, 계절별 테마를 담은 구독형 옥외 미디어아트 콘텐츠",
          "role": "미디어 디렉팅 및 영상 제작 (전체 57종 테마 중 핵심 13종 콘텐츠 전담 제작 100%)",
          "process": "계절별 감성 키워드 도출 ➔ Midjourney 비주얼 프롬프팅 ➔ Runway 모션 비디오 생성 ➔ AE 타이포그래피 합성",
          "tools": "Adobe After Effects, Photoshop | Midjourney, Runway",
          "aiScope": "초기 비주얼 룩 개발(Midjourney), 생성형 비디오 모션(Runway) 전방위 파이프라인 적용",
          "result": "서울 시내 대형 옥외 전광판 네트워크(MOU) 대규모 도심 송출 성공, 단독 13종 콘텐츠 상용 납기 완수"
}
        },
        'mbc': {
            title: "MBC 'PD가 사라졌다' OUTRO",
            client: 'MBC',
            year: '2024.02',
            category: '3D Motion / CRT Effects',
            roles: 'Conti(기획), 3D Design, 2D Design, VFX, Edit / Compositing / Color Grading',
            tools: 'After Effects, Illustrator, Unreal Engine, Blender',
            img: '/project_mbc.png',
            portfolioUrl: 'https://chayein.myportfolio.com/mbc-pdsgone',
            youtubeLinks: [
                { label: '▶ Watch Outro Video (YouTube)', url: 'https://youtu.be/wKvWNysGSEA' }
            ],
            desc: "MBC의 AI PD 엠파고가 연출하는 예능 프로그램 'PD가 사라졌다'의 방송 아웃트로를 제작하였습니다. 기술과 디스토피아적 분위기를 강조하기 위해 2D&3D 모션 위에 CRT 기법을 활용하여 연출하였습니다.",
            gallery: ['/project_mbc.png', '/mbc_2.png', '/mbc_3.png'],
            specs: {
          "target": "지상파 방송 시청자 대상, 국내 최초 AI PD 예능 프로그램의 디스토피아적 세계관을 각인시키는 방송 아웃트로",
          "role": "1인 총괄 100% (콘티 기획, 3D 디자인, 2D 디자인, VFX, 편집/컴포지팅, 컬러 그레이딩)",
          "process": "AI 알고리즘과 레트로 방송 감성의 충돌 기획 ➔ UE5/Blender 3D 에셋 모델링 ➔ 아날로그 CRT 디스플레이 질감 VFX 합성",
          "tools": "After Effects, Illustrator, Unreal Engine, Blender",
          "result": "MBC 지상파 방송 본편 엔딩 아웃트로로 정규 온에어 송출, 프로그램의 독창적 아이덴티티 구축 기여"
}
        },
        'pepsi': {
            title: 'Pepsi Online Pop-up',
            client: 'LOTTE chilsung',
            year: '2024.07',
            category: '3D VFX / Commercial Intro',
            roles: 'Conti(기획), 3D Design, 2D Design, Motion, Edit / Compositing / Color Grading',
            tools: 'After Effects, Illustrator, Photoshop, Unreal Engine, Blender',
            img: '/projects/pepsi_custom_1.gif',
            portfolioUrl: 'https://chayein.myportfolio.com/pepsionline',
            youtubeLinks: [
                { label: '▶ Watch Promo Video (YouTube)', url: 'https://youtu.be/3RJKS44KnhI' }
            ],
            desc: '펩시의 신제품을 알리기 위해 기획된 온라인 팝업스토어 인트로 영상 제작. 신제품 3종의 매력을 담아내고 펩시 특유의 청량한 브랜드 이미지를 구현했습니다.',
            gallery: [
                '/projects/pepsi_custom_1.gif',
                '/projects/pepsi_custom_2.png',
                '/projects/pepsi_custom_3.png'
            ],
            specs: {
          "target": "MZ세대 펩시 소비자 대상, 펩시 신제품 3종의 청량감과 브랜드 이미지를 극대화하는 가상 팝업 인트로",
          "role": "기획 및 영상 총괄 100% (콘티 기획, 3D 디자인, 2D 키비주얼, 모션그래픽, 사운드 싱크)",
          "process": "펩시 탄산의 폭발적 에너지 연출 ➔ 제품 3D 캔 모델링 및 유체 이펙트 ➔ 다이내믹 카메라 워크 및 모션 템포 조율",
          "tools": "Unreal Engine, Blender, After Effects, Photoshop",
          "result": "롯데칠성 펩시 온라인 팝업스토어 메인 공식 인트로로 정식 릴리즈, 방문자 체류시간 증대 및 브랜드 호감도 향상"
}
        },
        'scube': {
            title: 'SCUBE LAB Online Showroom',
            client: 'Scube Lab',
            year: '2024.07',
            category: 'XR Anamorphic Showroom',
            roles: 'Conti(기획), 3D Design, 2D Design, Motion / Edit / Color Grading',
            tools: 'After Effects, Illustrator, Premiere Pro, Unreal Engine, Blender',
            img: '/projects/scube_main.png',
            portfolioUrl: 'https://chayein.myportfolio.com/scubelab',
            youtubeLinks: [
                { label: '▶ Watch Showroom Video (YouTube)', url: 'https://youtu.be/eKOQdl3o7dM' }
            ],
            desc: '디지털 사이니지 기업 Scube Lab의 디지털 쇼룸 프로젝트입니다. 3가지 테마 공간 연출을 구축하였습니다.',
            gallery: [
                '/projects/scube_thumb1.png',
                '/projects/scube_thumb2.png',
                '/projects/scube_watch.gif',
                '/projects/scube_thumb4.png',
                '/projects/scube_thumb5.png',
                '/projects/scube_thumb6.png'
            ],
            specs: {
          "target": "B2B 고객 및 전시 관람객 대상, 디지털 사이니지 하드웨어의 입체 표출력을 증명하는 3D 가상 쇼룸 영상",
          "role": "1인 총괄 100% (콘티 기획, 3D/2D 디자인, 3개 테마 공간 연출, 모션 편집)",
          "process": "워치/패션 등 3개 테마 공간 기획 ➔ 공간별 하이엔드 오브제 3D 모델링 ➔ 럭셔리 쇼룸 인터랙션 시각화",
          "tools": "Unreal Engine, Blender, After Effects, Illustrator",
          "result": "사이니지 전문 기업 Scube Lab 공식 온라인 쇼룸 메인 쇼케이스 영상으로 채택"
}
        },
        'xr': {
            title: 'XR옥외광고 제휴사업',
            client: 'XR Commercial',
            year: '2024',
            category: 'XR / Spatial Advertising',
            roles: '기획, 3D 모션, 컴포지팅',
            tools: 'Unreal Engine 5, Blender, After Effects',
            img: '/projects/xr_yeoksam_1.gif',
            portfolioUrl: 'https://chayein.myportfolio.com/xradvertise',
            youtubeLinks: [
                { label: '▶ Watch XR Video (YouTube)', url: 'https://youtu.be/3Hd7SorEl0E' }
            ],
            desc: '옥외광고 미디어 사업자와의 제휴로 보급 확산용 XR옥외광고 상품을 광고시장에 확산하고자 하는 목적의 사업입니다.\n위치별 주요 시청자의 특징을 분석하여 가볍게 관심을 갖고 즐길 수 있는 콘텐츠로 기획하였습니다.\nSite : 강남역 G-Vision | 역삼 역삼빌딩 | 홍대 토니모리 전광판',
            gallery: [
                '/projects/xr_yeoksam_1.gif',
                '/projects/xr_yeoksam_2.gif',
                '/projects/xr_gangnam_1.png',
                '/projects/xr_hongdae_1.png',
                '/projects/xr_ooh_1.png',
                '/projects/xr_ooh_2.png',
                '/projects/xr_ooh_3.png'
            ],
            specs: {
          "target": "강남·역삼·홍대 주요 상권 유동인구 대상, 도심 옥외 전광판에 몰입감을 주는 입체 착시 3D 미디어 콘텐츠",
          "role": "기획, 3D 모션, 컴포지팅",
          "process": "상권별 유동인구 시청 특성 분석 ➔ 전광판 곡률/앵글 실측 ➔ UE5 3D 입체 카메라 애니메이션 ➔ 합성 피니싱",
          "tools": "Unreal Engine 5, Blender, After Effects",
          "result": "강남역 G-Vision, 역삼 역삼빌딩, 홍대 토니모리 전광판 3개소 동시 송출, 보행자 시선 집중 및 바이럴 유도"
}
        },
        'raemian': {
            title: 'RAEMIAN 송도역 센트리폴',
            client: 'Samsung C&T Raemian',
            year: '2024',
            category: '3D Architecture / Spatial Film',
            roles: 'Spatial Lighting, Environment Rendering & Texture Mapping',
            tools: 'Unreal Engine 5, Blender, After Effects, Premiere Pro',
            img: '/projects/raemian_still_1.png',
            portfolioUrl: 'https://chayein.myportfolio.com/raemian',
            youtubeLinks: [
                { label: '▶ Watch Video (YouTube)', url: 'https://youtu.be/t0H8tW__Gmw' }
            ],
            desc: '래미안 송도역 센트리폴 주거 공간의 미래 지향적 건축 텍스처와 빛의 조화를 시네마틱 3D 영상으로 연출한 프로젝트입니다.',
            gallery: [
                '/projects/raemian_still_1.png',
                '/projects/raemian_still_2.png',
                '/projects/raemian_still_3.png',
                '/projects/raemian_still_4.png',
                '/projects/raemian_01.gif',
                '/projects/raemian_02.gif',
                '/projects/raemian_03.gif',
                '/projects/raemian_04.gif'
            ],
            specs: {
          "target": "하이엔드 아파트 분양 고객 대상, 래미안 브랜드의 프리미엄 건축 공간감과 미래 라이프스타일 전달",
          "role": "3D 공간 라이팅, 환경 렌더링, 텍스처 매핑 및 시네마틱 카메라 시퀀스 전담",
          "process": "건축 데이터 기반 공간 구축 ➔ 자연광 시간대별 조도 시뮬레이션 ➔ 시네마틱 워크스루 카메라 연출",
          "tools": "Unreal Engine 5, Blender, After Effects, Premiere Pro",
          "result": "삼성물산 래미안 송도역 센트리폴 공식 홍보 채널 상용 릴리즈, 최고 수준의 건축 비주얼 퀄리티 확보"
}
        },
        'sh': {
            title: 'SH형 미래주거모델 특화영상',
            client: '서울주택도시개발공사',
            year: '2026',
            category: 'AI Video / Motion Graphics',
            roles: '스토리보드 기획, AI 비디오 파이프라인 구축, 이미지 및 영상 제작, 인포그래픽 모션 편집',
            tools: 'After Effects, Premiere Pro, Unreal Engine 5 | Magnific, Manus, Gemini',
            img: '/projects/sh_senior_1.png',
            videoSrc: '',
            youtubeLinks: [
                { label: '▶ Watch Video (YouTube)', url: 'https://youtu.be/skt9Fazz45Y' }
            ],
            desc: '고령가구 및 양육가구 미래주거 스마트단지 홍보 특화영상 기획 및 구축. AI 에이전트 협업 콘티 추출과 생성 AI 연계 파이프라인으로 미래 주거 공간의 특화 기능을 연출하였습니다.',
            gallery: [
                '/projects/sh_senior_1.png',
                '/projects/sh_senior_2.png',
                '/projects/sh_senior_3.png',
                '/projects/sh_childcare_1.png',
                '/projects/sh_childcare_2.png',
                '/projects/sh_childcare_3.png'
            ],
            specs: {
          "target": "SH공공주택 입주 예정자(고령·양육가구) 대상, 미래 스마트단지 주거 솔루션 직관적 홍보",
          "role": "스토리보드 기획, AI 비디오 파이프라인 구축, 이미지 및 영상 제작, 인포그래픽 모션 편집",
          "process": "세대별 페르소나 분석 ➔ 콘티 도출 ➔ UE5 아파트 내부 구현 ➔ Ai 이미지/영상 생성 ➔ 인포그래픽 2D 모션 결합",
          "tools": "After Effects, Premiere Pro, Unreal Engine 5 | Magnific, Manus, Gemini",
          "aiScope": "Gemini/Manus를 활용한 씬 콘티 시나리오 추출, Magnific 고해상도 이미지 및 비디오 생성, TTS 생성",
          "result": "실사 세트 촬영 대비 제작 예산 약 80% 절감, 복잡한 스마트 주거 기술을 감성적이고 직관적인 비주얼로 시각화"
}
        },
        'ktg': {
            title: 'KT&G 릴 미니멀리움 마곡 미디어아트',
            client: 'KT&G / Olim Planet',
            year: '2026.01',
            category: 'Media Art / 3D Motion',
            roles: '아트 디렉팅, Ai 생성 및 컴포지팅 (기여도 100%)',
            tools: 'Magnific, After Effects',
            img: '/projects/ktg_custom_1.png',
            youtubeLinks: [
                { label: '▶ Watch Video (YouTube)', url: 'https://youtu.be/8ooxjeFhQjM' }
            ],
            desc: 'Waves of Purification : 유동적인 유리의 곡선을 배경으로, 정제된 미니멀리즘과 부드러운 빛의 산란이 결합된 미디어 아트입니다. 연기처럼 물결치는 곡선형 유리 너머로 유려하게 흐르고 굴절되는 싱그러운 초록의 실루엣을 통해 감각적이고 현대적인 시각적 안식처를 제안합니다.',
            gallery: [
                '/projects/ktg_custom_1.png',
                '/projects/ktg_custom_2.png',
                '/projects/ktg_custom_3.png'
            ],
            specs: {
          "target": "스토어 방문객 대상, 정제된 미니멀리즘과 휴식을 전달하는 공간 몰입형 미디어아트 연출",
          "role": "아트 디렉팅, Ai 생성 및 컴포지팅 (기여도 100%)",
          "process": "'Waves of Purification' 콘셉트 ➔ 물결치는 유리의 곡선과 빛의 굴절 물리 시뮬레이션 ➔ 싱그러운 녹음의 실루엣 연출",
          "tools": "Magnific, After Effects",
          "aiScope": "글래스 굴절 너머의 싱그러운 녹음 이미지 및 영상 제작",
          "result": "KT&G 릴 미니멀리움 마곡 플래그십 스토어 대형 디스플레이에 공식 상설 미디어아트로 상영"
}
        },
        'summerroom': {
            title: 'SUMMER ROOM',
            client: 'Personal Project',
            year: '2024',
            category: '3D Motion / Spatial Film',
            roles: '개인 R&D',
            tools: 'Blender, After Effects',
            img: '/projects/summerroom_thumb_1.jpg',
            portfolioUrl: 'https://chayein.myportfolio.com/summer-room',
            youtubeLinks: [
                { label: '▶ Watch YouTube Shorts (YouTube)', url: 'https://youtube.com/shorts/oqG8wvAXjkk' }
            ],
            desc: '여름의 청량한 조도와 여유로운 공간감을 표현한 3D 시네마틱 룸 렌더링 프로젝트입니다.',
            gallery: [
                '/projects/summerroom_thumb_1.jpg'
            ],
            specs: {
          "target": "공간 비주얼 아티스트 및 시청자 대상, 여름의 청량한 빛과 조도를 3D 공간으로 구현한 시네마틱 필름 스터디",
          "role": "개인 R&D",
          "process": "창가 햇살과 커튼의 부드러운 움직임 기획 ➔ 패브릭 물리 시뮬레이션 및 부드러운 간접광(GI) 렌더링",
          "tools": "Blender, After Effects",
          "result": "감성적 공간 라이팅 연출력 입증, 유튜브 숏폼 포트폴리오 발행"
}
        }
    };

    // Tab Switcher Handler (Commercial Portfolio vs AI Lab & R&D)
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

    // Convert YouTube URL to embed URL (supporting standard, short, and Shorts URLs)
    function toYouTubeEmbed(url) {
        const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/) || url.match(/youtu\.be\/shorts\/([a-zA-Z0-9_-]+)/);
        if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}?autoplay=1&rel=0`;
        const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
        if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?autoplay=1&rel=0`;
        const longMatch = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
        if (longMatch) return `https://www.youtube.com/embed/${longMatch[1]}?autoplay=1&rel=0`;
        return url;
    }

    // Active media state for current opened modal
    let currentEmbedUrl = '';
    let currentLocalVideoSrc = '';

    function openModalByKey(key) {
        const data = projectDataMap[key];
        if (!data || !modal) return;

        // Reset video/iframe player states
        if (modalIframe) {
            modalIframe.src = '';
            modalIframe.classList.add('is-hidden');
        }
        if (modalVideo) {
            modalVideo.pause();
            modalVideo.src = '';
            modalVideo.classList.add('is-hidden');
        }

        // Set thumbnail image
        if (modalImg) {
            if (data.img) {
                modalImg.src = data.img;
                modalImg.style.display = '';
            } else {
                modalImg.src = '';
                modalImg.style.display = 'none';
            }
        }

        // Determine available video sources (YouTube embed priority > Local MP4)
        currentEmbedUrl = '';
        currentLocalVideoSrc = '';

        if (data.youtubeLinks && data.youtubeLinks.length > 0) {
            currentEmbedUrl = toYouTubeEmbed(data.youtubeLinks[0].url);
        } else if (data.videoSrc) {
            currentLocalVideoSrc = data.videoSrc;
        }

        // Show/hide manual PLAY button overlay
        const hasVideo = Boolean(currentEmbedUrl || currentLocalVideoSrc);
        if (modalPlayBtn) {
            if (hasVideo) {
                modalPlayBtn.classList.remove('is-hidden');
            } else {
                modalPlayBtn.classList.add('is-hidden');
            }
        }

        // Clear any external outlink buttons
        if (modalLinksWrapper) {
            modalLinksWrapper.innerHTML = '';
        }

        if (modalTitle) modalTitle.textContent = data.title;
        if (modalClient) modalClient.textContent = `Client: ${data.client}`;
        if (modalYear) modalYear.textContent = `Year: ${data.year}`;
        if (modalRoles) modalRoles.textContent = `Roles: ${data.roles || '-'}`;
        if (modalTools) modalTools.textContent = `Tools: ${data.tools || '-'}`;
        if (modalDesc) modalDesc.textContent = data.desc;

        // Render structured specs breakdown grid (6 Key Core Items)
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
    }

    // Play button click → trigger YouTube embed OR local video play
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

    // Attach Editorial List Item Clicks
    const items = document.querySelectorAll('.editorial-item');
    items.forEach(item => {
        item.addEventListener('click', () => {
            const key = item.getAttribute('data-project');
            openModalByKey(key);
        });
    });

    const closeModal = () => {
        if (!modal) return;
        modal.classList.remove('open');
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
    };

    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
        });
    }

    // Floating Mouse-following Circular Lens Portal Handler
    const floatingPreview = document.getElementById('floating-project-preview');
    const floatingImg = document.getElementById('floating-preview-img');
    const customCursor = document.getElementById('custom-cursor');

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
    updatePreviewPos();

    items.forEach(item => {
        const projKey = item.getAttribute('data-project');
        let previewSrc = item.getAttribute('data-preview');
        
        // Fallback to projectDataMap main image if data-preview is empty
        if (!previewSrc && projKey && projectDataMap[projKey] && projectDataMap[projKey].img) {
            previewSrc = projectDataMap[projKey].img;
            item.setAttribute('data-preview', previewSrc);
        }

        item.addEventListener('mousemove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
            
            if (previewSrc) {
                if (floatingImg && floatingImg.getAttribute('src') !== previewSrc) {
                    floatingImg.src = previewSrc;
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
 * 4. Copy Direct Email
 */
function initCopyEmail() {
    const emailBtns = [document.getElementById('copy-email-btn'), document.getElementById('card-email-btn')].filter(Boolean);
    const toast = document.getElementById('toast-notification');
    
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

                if (toast) {
                    toast.classList.remove('opacity-0', 'translate-y-4');
                    toast.classList.add('opacity-100', 'translate-y-0');
                    setTimeout(() => {
                        toast.classList.remove('opacity-100', 'translate-y-0');
                        toast.classList.add('opacity-0', 'translate-y-4');
                    }, 2000);
                }
            });
        });
    });
}

/**
 * 5. Experimental 3D Parallax Tilt & Holographic Shine Card
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

        const xPercent = Math.round((x / rect.width) * 100);
        const yPercent = Math.round((y / rect.height) * 100);

        // Normalize coordinates from -1 to 1
        const normX = (x / rect.width) * 2 - 1;
        const normY = (y / rect.height) * 2 - 1;

        // 3D rotation angles
        const rotateY = normX * 16;
        const rotateX = -normY * 16;

        card.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(10px)`;

        if (holoShine) {
            holoShine.style.setProperty('--mouse-x', `${xPercent}%`);
            holoShine.style.setProperty('--mouse-y', `${yPercent}%`);
        }
    });

    wrapper.addEventListener('mouseleave', () => {
        card.style.transform = 'rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });
}

/**
 * 6. Scroll Entry Animations (First-Time Entry Staggered Reveal)
 */
function initScrollAnimations() {
    const sections = document.querySelectorAll('.full-page-section');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -40px 0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Reveal all inner .reveal-item elements inside this section (First-time entry only)
                const items = entry.target.querySelectorAll('.reveal-item');
                items.forEach(item => {
                    item.classList.add('revealed');
                });

                // Unobserve section once revealed
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    sections.forEach(sec => observer.observe(sec));
}

/**
 * 6. Mouse-Reactive Background Dot Glow Canvas
 */
function initDotGlow() {
    const canvas = document.getElementById('dot-glow-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let mouseX = -1000, mouseY = -1000;
    const GRID = 24;
    const RADIUS = 180;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cols = Math.ceil(canvas.width / GRID) + 1;
        const rows = Math.ceil(canvas.height / GRID) + 1;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const x = c * GRID;
                const y = r * GRID;
                const dist = Math.sqrt((x - mouseX) ** 2 + (y - mouseY) ** 2);

                if (dist < RADIUS) {
                    const brightness = 1 - (dist / RADIUS);
                    const alpha = brightness * 0.45;
                    ctx.beginPath();
                    ctx.arc(x, y, 1.5, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                    ctx.fill();
                }
            }
        }
        requestAnimationFrame(draw);
    }
    draw();
}

/**
 * 7. Section 03 — Responsive Node Constellation Graph + Tool Tag Grid + Typing Direction
 */
function initSkillVisualization() {
    const section03 = document.getElementById('section-03');
    if (!section03) return;

    let hasAnimated = false;

    const canvas = document.getElementById('node-constellation');
    const tooltip = document.getElementById('node-tooltip');
    const tooltipLabel = document.getElementById('node-tooltip-label');
    const tooltipDesc = document.getElementById('node-tooltip-desc');

    const nodeData = [
        { label: 'Artistic Dir', desc: '정통 미술적 안목 (충남예고/한양대 ERICA), 비주얼 톤앤매너 통제 & 최종 Quality Control(QC)', x: 0, y: 0, size: 9 },
        { label: 'Pipeline R&D', desc: 'ComfyUI 커스텀 노드 설계, Agentic AX, 비주얼 일관성(Consistency) 확보 & 공정 혁신', x: 0, y: 0, size: 9 },
        { label: 'Spatial 3D', desc: 'Unreal Engine 5 라이팅 캘리브레이션, 3D 시네마틱, OOH 실감 미디어 구현력', x: 0, y: 0, size: 9 },
        { label: 'Synergy Loop', desc: 'Input(Direction) ➔ Process(Architecture) ➔ Output(Realization) ➔ Feedback 선순환', x: 0, y: 0, size: 9 }
    ];

    const centerNode = { label: 'Visual AI Architect', x: 0, y: 0, size: 42 };

    const crossLinks = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3]];

    let animProgress = 0;
    const animDuration = 1400;
    let animStart = null;

    function layoutNodes(w, h) {
        const cx = w / 2;
        const cy = h / 2;
        centerNode.x = cx;
        centerNode.y = cy;

        const outerR = Math.min(w, h) * 0.32;
        const startAngle = -Math.PI / 2;
        const angleStep = (Math.PI * 2) / nodeData.length;

        nodeData.forEach((node, i) => {
            const angle = startAngle + i * angleStep;
            node.x = cx + Math.cos(angle) * outerR;
            node.y = cy + Math.sin(angle) * outerR;
        });
    }

    function drawNodes(progress) {
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;
        
        const rect = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : { width: 380, height: 280 };
        const w = rect.width || 380;
        const h = Math.max(260, rect.height || 280);

        canvas.width = w * dpr;
        canvas.height = h * dpr;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);

        layoutNodes(w, h);

        const eased = 1 - Math.pow(1 - progress, 3);

        crossLinks.forEach(([a, b]) => {
            const na = nodeData[a];
            const nb = nodeData[b];
            const ax = centerNode.x + (na.x - centerNode.x) * eased;
            const ay = centerNode.y + (na.y - centerNode.y) * eased;
            const bx = centerNode.x + (nb.x - centerNode.x) * eased;
            const by = centerNode.y + (nb.y - centerNode.y) * eased;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.05 * eased})`;
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 6]);
            ctx.stroke();
            ctx.setLineDash([]);
        });

        nodeData.forEach((node) => {
            const nx = centerNode.x + (node.x - centerNode.x) * eased;
            const ny = centerNode.y + (node.y - centerNode.y) * eased;

            ctx.beginPath();
            ctx.moveTo(centerNode.x, centerNode.y);
            ctx.lineTo(nx, ny);
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.25 * eased})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();

            const pulsePos = (Date.now() % 2800) / 2800;
            const px = centerNode.x + (nx - centerNode.x) * pulsePos;
            const py = centerNode.y + (ny - centerNode.y) * pulsePos;
            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * eased})`;
            ctx.fill();
        });

        nodeData.forEach((node) => {
            const nx = centerNode.x + (node.x - centerNode.x) * eased;
            const ny = centerNode.y + (node.y - centerNode.y) * eased;
            const s = node.size * eased;

            ctx.beginPath();
            ctx.arc(nx, ny, s + 4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${0.06 * eased})`;
            ctx.fill();

            ctx.beginPath();
            ctx.arc(nx, ny, s, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;
            ctx.stroke();

            const labelOffsetY = (ny < centerNode.y) ? -12 : 16;
            ctx.font = `700 ${Math.max(9, 11 * eased)}px "Futura PT", "Jost", sans-serif`;
            ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * eased})`;
            ctx.textAlign = 'center';
            ctx.textBaseline = (ny < centerNode.y) ? 'bottom' : 'top';
            ctx.fillText(node.label, nx, ny + labelOffsetY);
        });

        const cs = centerNode.size * eased;

        const gradient = ctx.createRadialGradient(centerNode.x, centerNode.y, cs * 0.4, centerNode.x, centerNode.y, cs * 1.6);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${0.12 * eased})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.beginPath();
        ctx.arc(centerNode.x, centerNode.y, cs * 1.6, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(centerNode.x, centerNode.y, cs, 0, Math.PI * 2);
        ctx.fillStyle = '#121212';
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.85 * eased})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = `800 ${Math.max(9, 12 * eased)}px "Futura PT", "Jost", sans-serif`;
        ctx.fillStyle = `rgba(255, 255, 255, ${eased})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(centerNode.label, centerNode.x, centerNode.y);

        canvas._nodePositions = nodeData.map((n) => {
            const nx = centerNode.x + (n.x - centerNode.x) * eased;
            const ny = centerNode.y + (n.y - centerNode.y) * eased;
            return {
                x: nx,
                y: ny,
                size: 20,
                label: n.label,
                desc: n.desc
            };
        });
    }

    function animateNodes(timestamp) {
        if (!animStart) animStart = timestamp;
        const elapsed = timestamp - animStart;
        animProgress = Math.min(elapsed / animDuration, 1);
        drawNodes(animProgress);
        if (animProgress < 1) {
            requestAnimationFrame(animateNodes);
        } else {
            function continueDraw() {
                drawNodes(1);
                requestAnimationFrame(continueDraw);
            }
            continueDraw();
        }
    }

    if (canvas) {
        canvas.addEventListener('mousemove', (e) => {
            if (!canvas._nodePositions) return;
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / (rect.width * (window.devicePixelRatio || 1));
            const scaleY = canvas.height / (rect.height * (window.devicePixelRatio || 1));
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
 * 8. Hero Video Fallback
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
