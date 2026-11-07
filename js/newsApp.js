/**
 * East Times (이스트 타임스) 프론트엔드 포털 상호작용 엔진
 * - 속보 티커 자동 롤링
 * - 동해안 바다물때 & 날씨 스위칭 탭
 * - 기사 카테고리 실시간 필터링
 * - 기사 상세 모달 뷰어 & 좋아요
 * - PDF 지면 신문 뷰어
 * - 독자 제보 & 시민기자 접수 처리
 * - 실시간 기사 통합 검색
 */

document.addEventListener('DOMContentLoaded', () => {
  initPwa();
  initBreakingNewsTicker();
  initWeatherTideWidget();
  renderLeadAndBentoNews();
  initCategoryTabs();
  initModals();
  initSearch();
  initReportingAndCitizenForms();
});

/* --- 0. PWA 설치 및 서비스 워커 등록 --- */
let deferredPrompt = null;
function initPwa() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('[PWA] Service Worker registered with scope:', reg.scope))
      .catch(err => console.log('[PWA] Service Worker registration note:', err));
  }

  const installBtn = document.getElementById('btnPwaInstall');
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) {
      installBtn.style.display = 'inline-flex';
      installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('[PWA] User response to install:', outcome);
        deferredPrompt = null;
        installBtn.style.display = 'none';
      });
    }
  });
}

/* --- 1. 실시간 속보 롤링 티커 --- */
function initBreakingNewsTicker() {
  const tickerContainer = document.getElementById('tickerSlideBox');
  const items = window.EAST_TIMES_DATA.breakingNews;
  if (!tickerContainer || !items || items.length === 0) return;

  let currentIndex = 0;
  function updateTicker() {
    const item = items[currentIndex];
    tickerContainer.innerHTML = `
      <span class="ticker-text" onclick="openArticleModal('${item.id || 'art-001'}')">
        ${item.title} <span style="font-size:0.75rem; color:#94a3b8; margin-left:0.5rem;">(${item.time})</span>
      </span>
    `;
    currentIndex = (currentIndex + 1) % items.length;
  }

  updateTicker();
  setInterval(updateTicker, 4000);
}

/* --- 2. 동해안 바다 물때 & 날씨 위젯 --- */
function initWeatherTideWidget() {
  const weatherBadge = document.getElementById('tideWeatherQuickBadge');
  const detailContainer = document.getElementById('tideDetailWidgetBox');

  function renderWidgetData() {
    const data = window.EAST_TIMES_DATA.weatherTide;
    if (!data) return;

    // 상단 퀵 뱃지 (속초 기준 기본)
    if (weatherBadge && data.sokcho) {
      const liveDot = data.sokcho.isLive ? '<span style="color:#22c55e; font-size:0.65rem; margin-right:4px;">● 실시간</span>' : '';
      weatherBadge.innerHTML = `
        <i class="fas fa-water" style="color:var(--c-gold)"></i>
        <span>${liveDot}속초 <strong>${data.sokcho.temp}</strong> (파고 ${data.sokcho.waveHeight} / 수온 ${data.sokcho.waterTemp})</span>
        <i class="fas fa-chevron-down" style="font-size:0.65rem; opacity:0.7;"></i>
      `;
    }

    // 사이드바 바다물때 카드 리스트 렌더링
    if (detailContainer) {
      const regions = ['sokcho', 'goseong', 'yangyang'];
      detailContainer.innerHTML = regions.map(key => {
        const item = data[key];
        if (!item) return '';
        const liveTag = item.isLive ? '<span style="font-size:0.68rem; background:#dcfce7; color:#15803d; padding:0.1rem 0.4rem; border-radius:3px; margin-left:6px; font-weight:700;">실시간 API</span>' : '';
        return `
          <div class="tide-card">
            <div class="tide-region-header">
              <span><i class="fas ${item.icon}"></i> ${item.name} (${item.condition}) ${liveTag}</span>
              <span>${item.temp}</span>
            </div>
            <div class="tide-grid-data">
              <div class="tide-data-item">연안 파고:<strong>${item.waveHeight}</strong></div>
              <div class="tide-data-item">표층 수온:<strong>${item.waterTemp}</strong></div>
              <div class="tide-data-item" style="grid-column:span 2; color:var(--c-gold);">물때: <strong>${item.tide}</strong></div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // 1차 즉시 렌더링
  renderWidgetData();

  if (weatherBadge) {
    weatherBadge.addEventListener('click', () => {
      openModal('tideModal');
    });
  }

  // 2차: 공공 / Open-Meteo 실시간 API 데이터 수신 후 자동 갱신
  if (window.EastTimesWeatherService) {
    window.EastTimesWeatherService.updateAllRegions().then(() => {
      renderWidgetData();
    });
  }
}

/* --- 3. 와이드 메인 헤드라인 & 벤토 그리드 기사 렌더링 --- */
function renderLeadAndBentoNews() {
  const leadCardBox = document.getElementById('heroLeadCard');
  const subColumn = document.getElementById('bentoSubColumn');
  const articles = window.EAST_TIMES_DATA.articles;
  if (!leadCardBox || !articles) return;

  const lead = articles.find(a => a.isLead) || articles[0];
  const subs = articles.filter(a => a.id !== lead.id).slice(0, 2);

  // 메인 와이드 탑 기사
  leadCardBox.innerHTML = `
    <div class="hero-img-box" onclick="openArticleModal('${lead.id}')" style="cursor:pointer;">
      <img src="${lead.image}" alt="${lead.title}" />
      <span class="hero-badge-floating">TOP HEADLINE · ${lead.region}</span>
    </div>
    <div class="hero-content-body">
      <div>
        <div class="meta-row">
          <span class="cat-pill">${lead.categoryName}</span>
          <span><i class="far fa-clock"></i> ${lead.date}</span>
          <span><i class="far fa-eye"></i> ${lead.views.toLocaleString()}</span>
        </div>
        <h2 class="hero-title-text" onclick="openArticleModal('${lead.id}')">${lead.title}</h2>
        <div class="hero-subtitle-text">${lead.subtitle}</div>
        <p class="hero-excerpt-text">${lead.summary}</p>
      </div>
      <div class="byline-row">
        <span class="author-info"><i class="fas fa-feather-alt"></i> ${lead.author} (${lead.authorRole})</span>
        <button class="btn-read-more" onclick="openArticleModal('${lead.id}')" style="color:var(--c-accent-blue); font-weight:700;">기사 전문 읽기 <i class="fas fa-arrow-right"></i></button>
      </div>
    </div>
  `;

  // 벤토 중간 서브 기사 컬럼
  if (subColumn) {
    subColumn.innerHTML = subs.map(sub => `
      <article class="card-news-sub" onclick="openArticleModal('${sub.id}')" style="cursor:pointer;">
        <div class="sub-img-box">
          <img src="${sub.image}" alt="${sub.title}" />
          <span style="position:absolute; bottom:8px; left:8px; background:rgba(0,0,0,0.7); color:#fff; font-size:0.7rem; padding:0.2rem 0.5rem; border-radius:4px;">${sub.region}</span>
        </div>
        <div class="sub-content-box">
          <div>
            <div class="meta-row">
              <span class="cat-pill">${sub.categoryName}</span>
              <span>${sub.date.split(' ')[0]}</span>
            </div>
            <h4 class="sub-title">${sub.title}</h4>
            <p class="sub-excerpt">${sub.summary}</p>
          </div>
          <div style="font-size:0.78rem; color:#64748b; margin-top:0.8rem; display:flex; justify-content:space-between;">
            <span>${sub.author}</span>
            <span><i class="far fa-eye"></i> ${sub.views.toLocaleString()}</span>
          </div>
        </div>
      </article>
    `).join('');
  }
}

/* --- 4. 카테고리 탭 & 뉴스 리스트 렌더링 --- */
function initCategoryTabs() {
  const tabsContainer = document.getElementById('categoryTabButtons');
  const newsGrid = document.getElementById('categoryNewsGrid');
  const cats = window.EAST_TIMES_DATA.categories;
  const articles = window.EAST_TIMES_DATA.articles;

  if (tabsContainer) {
    tabsContainer.innerHTML = cats.map((cat, idx) => `
      <button class="cat-tab-btn ${idx === 0 ? 'active' : ''}" data-cat="${cat.key}">
        ${cat.label}
      </button>
    `).join('');

    tabsContainer.querySelectorAll('.cat-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        tabsContainer.querySelectorAll('.cat-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const catKey = btn.getAttribute('data-cat');
        renderCategoryArticles(catKey);
      });
    });
  }

  renderCategoryArticles('all');
}

function renderCategoryArticles(catKey) {
  const newsGrid = document.getElementById('categoryNewsGrid');
  const articles = window.EAST_TIMES_DATA.articles;
  if (!newsGrid || !articles) return;

  const filtered = catKey === 'all' ? articles : articles.filter(a => a.category === catKey);

  if (filtered.length === 0) {
    newsGrid.innerHTML = `
      <div style="grid-column: span 3; text-align: center; padding: 3rem; color: #94a3b8;">
        <i class="far fa-newspaper" style="font-size: 2.5rem; margin-bottom: 0.8rem;"></i>
        <p>해당 분야에 등록된 기사가 준비 중입니다.</p>
      </div>
    `;
    return;
  }

  newsGrid.innerHTML = filtered.map(art => `
    <article class="card-news-sub" onclick="openArticleModal('${art.id}')" style="cursor:pointer; background:#fff;">
      <div class="sub-img-box" style="height:200px;">
        <img src="${art.image}" alt="${art.title}" />
        <span style="position:absolute; top:10px; right:10px; background:rgba(15,23,42,0.85); color:#fff; font-size:0.75rem; padding:0.2rem 0.6rem; border-radius:4px;">${art.region}</span>
      </div>
      <div class="sub-content-box">
        <div>
          <div class="meta-row">
            <span class="cat-pill">${art.categoryName}</span>
            <span><i class="far fa-clock"></i> ${art.date}</span>
          </div>
          <h4 class="sub-title" style="font-size:1.2rem;">${art.title}</h4>
          <p class="sub-excerpt">${art.summary}</p>
        </div>
        <div class="byline-row" style="margin-top:1rem; padding-top:0.8rem;">
          <span style="font-size:0.82rem; font-weight:600;">${art.author}</span>
          <span style="font-size:0.82rem; color:#64748b;"><i class="far fa-thumbs-up"></i> ${art.likes} · <i class="far fa-eye"></i> ${art.views}</span>
        </div>
      </div>
    </article>
  `).join('');
}

/* --- 5. 기사 상세 모달 열기 --- */
window.openArticleModal = function(articleId) {
  const art = window.EAST_TIMES_DATA.articles.find(a => a.id === articleId) || window.EAST_TIMES_DATA.articles[0];
  const modal = document.getElementById('articleDetailModal');
  const modalBody = document.getElementById('articleModalBody');
  if (!modal || !modalBody) return;

  art.views += 1; // 조회수 증가 반영

  // 반응 데이터 로드
  const storageReactKey = `easttimes_reactions_${art.id}`;
  let reactData = JSON.parse(localStorage.getItem(storageReactKey) || 'null');
  if (!reactData) {
    reactData = {
      like: { count: 35, userVoted: false },
      heart: { count: 12, userVoted: false },
      cheer: { count: 19, userVoted: false },
      surprised: { count: 7, userVoted: false },
      angry: { count: 2, userVoted: false }
    };
    localStorage.setItem(storageReactKey, JSON.stringify(reactData));
  }

  // 댓글 데이터 로드
  const storageCommentKey = `easttimes_comments_${art.id}`;
  let comments = JSON.parse(localStorage.getItem(storageCommentKey) || '[]');
  if (comments.length === 0) {
    comments = [
      { id: 'c-1', author: '영동군민', date: '2026.11.07 15:10', content: '현장 소식을 빠르게 전달해 주셔서 고맙습니다.' }
    ];
    localStorage.setItem(storageCommentKey, JSON.stringify(comments));
  }

  modalBody.innerHTML = `
    <div style="border-bottom:1px solid #e2e8f0; padding-bottom:1.2rem; margin-bottom:1.5rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem;">
        <div class="meta-row">
          <span class="cat-pill" style="font-size:0.85rem;">${art.categoryName}</span>
          <span style="background:#f1f5f9; padding:0.2rem 0.5rem; border-radius:4px; font-weight:700;">${art.region}</span>
          <span>${art.date}</span>
        </div>
        <a href="article.html?id=${art.id}" class="btn-nav-action" style="font-size:0.8rem; background:var(--c-deep-navy); color:var(--c-gold); padding:0.35rem 0.8rem; text-decoration:none;" target="_blank">
          <i class="fas fa-external-link-alt"></i> 전용 페이지 보기
        </a>
      </div>

      <h2 style="font-family:var(--font-serif); font-size:1.85rem; line-height:1.35; color:var(--c-deep-navy); margin-bottom:0.8rem;">${art.title}</h2>
      <div style="font-size:1.1rem; color:#475569; font-weight:600; line-height:1.5;">${art.subtitle}</div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1.2rem; font-size:0.85rem; color:#64748b;">
        <span><strong>${art.author}</strong> (${art.authorRole})</span>
        <span>조회수 ${art.views.toLocaleString()}회</span>
      </div>
    </div>

    <div style="margin-bottom:1.8rem;">
      <img src="${art.image}" alt="${art.title}" style="width:100%; border-radius:8px; margin-bottom:0.5rem;" />
      <p style="font-size:0.82rem; color:#64748b; font-style:italic;">▲ ${art.imageCaption}</p>
    </div>

    <div style="font-size:1.05rem; line-height:1.85; color:#1e293b; margin-bottom:2rem;">
      ${art.content}
    </div>

    <!-- 공유 및 바로가기 바 -->
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.8rem; padding:1rem; background:#f8fafc; border-radius:8px; margin-bottom:1.5rem;">
      <div style="display:flex; gap:0.5rem;">
        <button class="btn-nav-action" onclick="navigator.clipboard.writeText(window.location.origin + window.location.pathname.replace('index.html','') + 'article.html?id=${art.id}'); alert('기사 링크가 복사되었습니다!');" style="background:#fff; border:1px solid #cbd5e1; font-size:0.82rem;">
          <i class="fas fa-link"></i> 기사 링크 복사
        </button>
        <a href="article.html?id=${art.id}" class="btn-nav-action" style="background:#0284c7; color:#fff; font-size:0.82rem; text-decoration:none;">
          <i class="fas fa-file-alt"></i> 기사 상세 전용 뷰로 이동
        </a>
      </div>
    </div>

    <!-- 독자 감정 반응 (Reactions) -->
    <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:1.2rem; margin-bottom:1.5rem; text-align:center;">
      <div style="font-size:0.9rem; font-weight:800; color:var(--c-deep-navy); margin-bottom:0.8rem;">이 기사에 공감하셨나요?</div>
      <div style="display:flex; justify-content:center; gap:0.6rem; flex-wrap:wrap;">
        <button class="btn-reaction ${reactData.like.userVoted ? 'active' : ''}" onclick="toggleModalReaction('${art.id}', 'like')" style="padding:0.5rem 0.8rem;">
          <span style="font-size:1.2rem;">👍</span> <span style="font-size:0.75rem;">추천</span> <strong style="font-size:0.8rem;">${reactData.like.count}</strong>
        </button>
        <button class="btn-reaction ${reactData.heart.userVoted ? 'active' : ''}" onclick="toggleModalReaction('${art.id}', 'heart')" style="padding:0.5rem 0.8rem;">
          <span style="font-size:1.2rem;">💖</span> <span style="font-size:0.75rem;">감동</span> <strong style="font-size:0.8rem;">${reactData.heart.count}</strong>
        </button>
        <button class="btn-reaction ${reactData.cheer.userVoted ? 'active' : ''}" onclick="toggleModalReaction('${art.id}', 'cheer')" style="padding:0.5rem 0.8rem;">
          <span style="font-size:1.2rem;">👏</span> <span style="font-size:0.75rem;">응원</span> <strong style="font-size:0.8rem;">${reactData.cheer.count}</strong>
        </button>
        <button class="btn-reaction ${reactData.surprised.userVoted ? 'active' : ''}" onclick="toggleModalReaction('${art.id}', 'surprised')" style="padding:0.5rem 0.8rem;">
          <span style="font-size:1.2rem;">😲</span> <span style="font-size:0.75rem;">놀라움</span> <strong style="font-size:0.8rem;">${reactData.surprised.count}</strong>
        </button>
        <button class="btn-reaction ${reactData.angry.userVoted ? 'active' : ''}" onclick="toggleModalReaction('${art.id}', 'angry')" style="padding:0.5rem 0.8rem;">
          <span style="font-size:1.2rem;">😡</span> <span style="font-size:0.75rem;">화나요</span> <strong style="font-size:0.8rem;">${reactData.angry.count}</strong>
        </button>
      </div>
    </div>

    <!-- 간이 댓글 섹션 -->
    <div style="border-top:1px solid #e2e8f0; padding-top:1.2rem;">
      <h4 style="font-size:1rem; font-weight:800; margin-bottom:0.8rem;"><i class="far fa-comments"></i> 독자 의견 (${comments.length})</h4>
      <div style="display:flex; gap:0.6rem; margin-bottom:0.8rem;">
        <input type="text" id="modalCommentAuthor" placeholder="작성자" style="width:120px; padding:0.4rem 0.6rem; border:1px solid #cbd5e1; border-radius:4px; font-size:0.82rem;" />
        <input type="text" id="modalCommentContent" placeholder="댓글을 입력하세요..." style="flex:1; padding:0.4rem 0.6rem; border:1px solid #cbd5e1; border-radius:4px; font-size:0.82rem;" />
        <button onclick="submitModalComment('${art.id}')" class="btn-gold-solid" style="padding:0.4rem 1rem; width:auto; font-size:0.82rem;">등록</button>
      </div>
      <div id="modalCommentList" style="max-height:180px; overflow-y:auto;">
        ${comments.map(c => `
          <div style="background:#f8fafc; padding:0.5rem 0.8rem; border-radius:6px; margin-bottom:0.4rem; font-size:0.82rem;">
            <div style="display:flex; justify-content:space-between; color:#64748b; font-size:0.75rem; margin-bottom:0.2rem;">
              <strong>${c.author}</strong> <span>${c.date}</span>
            </div>
            <div>${c.content}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  openModal('articleDetailModal');
};

window.toggleModalReaction = function(articleId, key) {
  const storageKey = `easttimes_reactions_${articleId}`;
  let data = JSON.parse(localStorage.getItem(storageKey) || '{}');
  if (data[key]) {
    if (data[key].userVoted) {
      data[key].count = Math.max(0, data[key].count - 1);
      data[key].userVoted = false;
    } else {
      data[key].count += 1;
      data[key].userVoted = true;
    }
    localStorage.setItem(storageKey, JSON.stringify(data));
    openArticleModal(articleId);
  }
};

window.submitModalComment = function(articleId) {
  const author = (document.getElementById('modalCommentAuthor').value || '').trim() || '독자';
  const content = (document.getElementById('modalCommentContent').value || '').trim();
  if (!content) return alert('댓글 내용을 입력하세요.');

  const storageKey = `easttimes_comments_${articleId}`;
  let comments = JSON.parse(localStorage.getItem(storageKey) || '[]');
  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  
  comments.unshift({ id: `c-${Date.now()}`, author, date: dateStr, content });
  localStorage.setItem(storageKey, JSON.stringify(comments));
  openArticleModal(articleId);
};

/* --- 6. PDF 지면 신문 뷰어 모달 --- */
window.openPdfViewer = function() {
  const modal = document.getElementById('pdfViewerModal');
  const editionContainer = document.getElementById('pdfEditionsList');
  const editions = window.EAST_TIMES_DATA.paperEditions;

  if (editionContainer && editions) {
    editionContainer.innerHTML = editions.map(ed => `
      <div style="border:1px solid #e2e8f0; border-radius:8px; padding:1rem; display:flex; gap:1.2rem; align-items:center; margin-bottom:1rem; background:#f8fafc;">
        <img src="${ed.thumb}" style="width:80px; height:105px; object-fit:cover; border-radius:4px; box-shadow:0 2px 8px rgba(0,0,0,0.15);" />
        <div style="flex:1;">
          <span style="font-size:0.75rem; background:var(--c-deep-navy); color:var(--c-gold); padding:0.15rem 0.5rem; border-radius:4px; font-weight:700;">발행일 ${ed.date}</span>
          <h4 style="font-size:1.05rem; margin:0.4rem 0 0.6rem 0; color:#0f172a;">${ed.title}</h4>
          <div style="display:flex; gap:0.6rem;">
            <button class="btn-gold-solid" style="padding:0.4rem 0.9rem; font-size:0.78rem; width:auto;" onclick="alert('지면 뷰어 가상 PDF 렌더링 화면을 불러왔습니다.')">
              <i class="fas fa-book-open"></i> 전면 지면보기
            </button>
            <button class="btn-nav-action" style="padding:0.4rem 0.9rem; font-size:0.78rem; background:#fff; border:1px solid #cbd5e1;" onclick="alert('PDF 다운로드를 시작합니다.')">
              <i class="fas fa-download"></i> PDF 다운로드
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  openModal('pdfViewerModal');
};

/* --- 7. 모달 공통 관리 --- */
function initModals() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay || e.target.closest('.modal-close-btn')) {
        overlay.classList.remove('active');
      }
    });
  });
}

window.openModal = function(modalId) {
  const target = document.getElementById(modalId);
  if (target) target.classList.add('active');
};

window.closeModal = function(modalId) {
  const target = document.getElementById(modalId);
  if (target) target.classList.remove('active');
};

/* --- 8. 기사 실시간 검색 기능 --- */
function initSearch() {
  const searchInput = document.getElementById('globalSearchInput');
  const searchResults = document.getElementById('searchResultsBox');
  if (!searchInput || !searchResults) return;

  searchInput.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) {
      searchResults.innerHTML = '<p style="color:#94a3b8; text-align:center; padding:2rem;">검색어를 입력해 주세요.</p>';
      return;
    }

    const matched = window.EAST_TIMES_DATA.articles.filter(a => 
      a.title.toLowerCase().includes(q) || 
      a.summary.toLowerCase().includes(q) || 
      a.author.toLowerCase().includes(q) ||
      a.region.toLowerCase().includes(q)
    );

    if (matched.length === 0) {
      searchResults.innerHTML = `<p style="color:#ef4444; text-align:center; padding:2rem;">'${q}'에 대한 검색 결과가 없습니다.</p>`;
    } else {
      searchResults.innerHTML = matched.map(m => `
        <div style="padding:0.9rem; border-bottom:1px solid #e2e8f0; cursor:pointer;" onclick="closeModal('searchModal'); openArticleModal('${m.id}')">
          <span style="font-size:0.75rem; background:#e0f2fe; color:#0369a1; padding:0.1rem 0.4rem; border-radius:4px; font-weight:700;">${m.categoryName} · ${m.region}</span>
          <h5 style="font-size:1.05rem; margin:0.3rem 0; color:#0f172a;">${m.title}</h5>
          <p style="font-size:0.85rem; color:#64748b;">${m.summary.substring(0, 80)}...</p>
        </div>
      `).join('');
    }
  });
}

/* --- 9. 독자 기사 제보 & 시민기자 접수 폼 핸들러 --- */
function initReportingAndCitizenForms() {
  const reportForm = document.getElementById('readerReportForm');
  if (reportForm) {
    reportForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('독자 제보가 안전하게 편집국에 접수되었습니다.\n중요 제보는 취재기자 배정 후 개별 연락드립니다.');
      reportForm.reset();
      closeModal('reportModal');
    });
  }

  const citizenForm = document.getElementById('citizenReporterForm');
  if (citizenForm) {
    citizenForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('이스트 타임스 제 4기 시민기자 지원이 성공적으로 접수되었습니다!\n서류 심사 후 합격자분께 개별 안내 문자를 드립니다.');
      citizenForm.reset();
      closeModal('citizenModal');
    });
  }
}
