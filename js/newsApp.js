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
  initBreakingNewsTicker();
  initWeatherTideWidget();
  renderLeadAndBentoNews();
  initCategoryTabs();
  initModals();
  initSearch();
  initReportingAndCitizenForms();
});

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
  const data = window.EAST_TIMES_DATA.weatherTide;
  if (!data) return;

  // 상단 퀵 뱃지 (속초 기준 기본)
  if (weatherBadge) {
    weatherBadge.innerHTML = `
      <i class="fas fa-water" style="color:var(--c-gold)"></i>
      <span>속초 <strong>${data.sokcho.temp}</strong> (파고 ${data.sokcho.waveHeight} / 수온 ${data.sokcho.waterTemp})</span>
      <i class="fas fa-chevron-down" style="font-size:0.65rem; opacity:0.7;"></i>
    `;
    weatherBadge.addEventListener('click', () => {
      openModal('tideModal');
    });
  }

  // 사이드바 바다물때 카드 리스트 렌더링
  if (detailContainer) {
    const regions = ['sokcho', 'goseong', 'yangyang'];
    detailContainer.innerHTML = regions.map(key => {
      const item = data[key];
      return `
        <div class="tide-card">
          <div class="tide-region-header">
            <span><i class="fas ${item.icon}"></i> ${item.name} (${item.condition})</span>
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

  modalBody.innerHTML = `
    <div style="border-bottom:1px solid #e2e8f0; padding-bottom:1.2rem; margin-bottom:1.5rem;">
      <div class="meta-row" style="margin-bottom:0.8rem;">
        <span class="cat-pill" style="font-size:0.85rem;">${art.categoryName}</span>
        <span style="background:#f1f5f9; padding:0.2rem 0.5rem; border-radius:4px; font-weight:700;">${art.region}</span>
        <span>${art.date}</span>
      </div>
      <h2 style="font-family:var(--font-serif); font-size:1.85rem; line-height:1.35; color:var(--c-deep-navy); margin-bottom:0.8rem;">${art.title}</h2>
      <div style="font-size:1.1rem; color:#475569; font-weight:600; line-height:1.5;">${art.subtitle}</div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:1.2rem; font-size:0.85rem; color:#64748b;">
        <span><strong>${art.author}</strong> (${art.authorRole})</span>
        <span>조회수 ${art.views.toLocaleString()}회 · 추천 ${art.likes}</span>
      </div>
    </div>

    <div style="margin-bottom:1.8rem;">
      <img src="${art.image}" alt="${art.title}" style="width:100%; border-radius:8px; margin-bottom:0.5rem;" />
      <p style="font-size:0.82rem; color:#64748b; font-style:italic;">▲ ${art.imageCaption}</p>
    </div>

    <div style="font-size:1.05rem; line-height:1.85; color:#1e293b; margin-bottom:2rem;">
      ${art.content}
    </div>

    <div style="display:flex; justify-content:center; gap:1rem; padding-top:1.5rem; border-top:1px solid #e2e8f0;">
      <button class="btn-nav-action btn-shop-pill" onclick="alert('기사를 추천하였습니다!')" style="padding:0.6rem 1.5rem;">
        <i class="far fa-thumbs-up"></i> 기사 추천 (${art.likes})
      </button>
      <button class="btn-nav-action" onclick="navigator.clipboard.writeText(window.location.href); alert('기사 링크가 복사되었습니다!');" style="background:#f1f5f9; color:#334155;">
        <i class="fas fa-share-alt"></i> 기사 공유
      </button>
    </div>
  `;

  openModal('articleDetailModal');
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
