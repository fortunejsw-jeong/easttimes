/**
 * East Times (이스트타임즈) 개별 기사 페이지 & 독자 반응/댓글 엔진
 */

document.addEventListener('DOMContentLoaded', () => {
  // PWA 서비스 워커 등록
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.log('SW registration note:', err);
    });
  }

  // 실시간 날씨/조석 정보 업데이트
  if (window.EastTimesWeatherService) {
    window.EastTimesWeatherService.updateAllRegions().then(() => {
      renderArticleSidebarWeather();
    });
  }

  initArticlePage();
});

// 현재 활성화된 기사 객체
let currentArticle = null;

function initArticlePage() {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id') || 'art-001';

  const articles = window.EAST_TIMES_DATA ? window.EAST_TIMES_DATA.articles : [];
  currentArticle = articles.find(a => a.id === articleId) || articles[0];

  if (!currentArticle) {
    document.getElementById('articleMainContainer').innerHTML = `
      <div style="text-align:center; padding:5rem 1rem;">
        <h2>요청하신 기사를 찾을 수 없습니다.</h2>
        <p style="margin:1rem 0;"><a href="index.html" class="btn-gold-solid" style="display:inline-block; width:auto; padding:0.6rem 1.5rem;">홈으로 돌아가기</a></p>
      </div>
    `;
    return;
  }

  // 페이지 타이틀 설정
  document.title = `${currentArticle.title} - East Times`;

  // 조회수 카운트 갱신
  currentArticle.views += 1;

  // 기사 콘텐츠 렌더링
  renderArticleDetail(currentArticle);

  // 반응 & 댓글 시스템 렌더링
  initReactions(currentArticle.id);
  initComments(currentArticle.id);

  // 사이드바 인기/관련 기사 렌더링
  renderRelatedArticles(currentArticle);
}

// 기사 본문 렌더링
function renderArticleDetail(art) {
  document.getElementById('artCategoryBadge').textContent = art.categoryName;
  document.getElementById('artRegionBadge').textContent = art.region;
  document.getElementById('artTitle').textContent = art.title;
  document.getElementById('artSubtitle').textContent = art.subtitle;
  
  document.getElementById('artAuthor').textContent = `${art.author} (${art.authorRole})`;
  document.getElementById('artDate').textContent = art.date;
  document.getElementById('artViews').textContent = art.views.toLocaleString();

  const imgEl = document.getElementById('artImage');
  const captionEl = document.getElementById('artCaption');
  if (art.image) {
    imgEl.src = art.image;
    imgEl.alt = art.title;
    captionEl.textContent = `▲ ${art.imageCaption || art.title}`;
  } else {
    imgEl.parentElement.style.display = 'none';
  }

  document.getElementById('artBodyContent').innerHTML = art.content;
}

// 폰트 크기 조절
let currentFontSize = 1.15;
window.changeFontSize = function(delta) {
  const contentEl = document.getElementById('artBodyContent');
  if (!contentEl) return;
  if (delta === 0) {
    currentFontSize = 1.15;
  } else {
    currentFontSize = Math.min(1.6, Math.max(0.95, currentFontSize + delta));
  }
  contentEl.style.fontSize = `${currentFontSize}rem`;
};

// 기사 공유 기능
window.shareArticle = function(type) {
  const pageUrl = window.location.href;
  const pageTitle = currentArticle ? currentArticle.title : document.title;

  if (type === 'copy') {
    navigator.clipboard.writeText(pageUrl).then(() => {
      alert('기사 주소가 클립보드에 복사되었습니다.\n원하는 곳에 붙여넣기(Ctrl+V) 하세요.');
    }).catch(() => {
      prompt('기사 주소를 복사하세요:', pageUrl);
    });
  } else if (type === 'print') {
    window.print();
  } else if (type === 'facebook') {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, '_blank');
  } else if (type === 'twitter') {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(pageTitle)}&url=${encodeURIComponent(pageUrl)}`, '_blank');
  } else if (type === 'kakao') {
    alert('카카오톡 공유 링크가 생성되었습니다.\n' + pageUrl);
  }
};

/* --- 5대 감정 반응(Reactions) 엔진 --- */
const REACTION_TYPES = [
  { key: 'like', label: '추천해요', emoji: '👍', defaultCount: 42 },
  { key: 'heart', label: '감동이에요', emoji: '💖', defaultCount: 18 },
  { key: 'cheer', label: '응원해요', emoji: '👏', defaultCount: 25 },
  { key: 'surprised', label: '놀라워요', emoji: '😲', defaultCount: 9 },
  { key: 'angry', label: '화나요', emoji: '😡', defaultCount: 4 }
];

function initReactions(articleId, containerId = 'reactionsContainer') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const storageKey = `easttimes_reactions_${articleId}`;
  let data = JSON.parse(localStorage.getItem(storageKey) || 'null');
  
  if (!data) {
    data = {};
    REACTION_TYPES.forEach(r => {
      data[r.key] = { count: r.defaultCount, userVoted: false };
    });
    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  renderReactionsUI(container, articleId, data);
}

function renderReactionsUI(container, articleId, data) {
  container.innerHTML = `
    <div class="reactions-title"><i class="fas fa-heart" style="color:var(--c-gold)"></i> 이 기사에 대해 어떻게 생각하시나요?</div>
    <div class="reactions-grid">
      ${REACTION_TYPES.map(r => {
        const item = data[r.key] || { count: r.defaultCount, userVoted: false };
        return `
          <button class="btn-reaction ${item.userVoted ? 'active' : ''}" onclick="toggleReaction('${articleId}', '${r.key}')">
            <span class="reaction-emoji">${r.emoji}</span>
            <span class="reaction-label">${r.label}</span>
            <span class="reaction-count" id="react-count-${r.key}">${item.count}</span>
          </button>
        `;
      }).join('')}
    </div>
  `;
}

window.toggleReaction = function(articleId, reactionKey) {
  const storageKey = `easttimes_reactions_${articleId}`;
  let data = JSON.parse(localStorage.getItem(storageKey) || '{}');
  if (!data[reactionKey]) {
    data[reactionKey] = { count: 10, userVoted: false };
  }

  if (data[reactionKey].userVoted) {
    data[reactionKey].count = Math.max(0, data[reactionKey].count - 1);
    data[reactionKey].userVoted = false;
  } else {
    data[reactionKey].count += 1;
    data[reactionKey].userVoted = true;
  }

  localStorage.setItem(storageKey, JSON.stringify(data));
  const container = document.getElementById('reactionsContainer');
  if (container) renderReactionsUI(container, articleId, data);
};

/* --- 독자 댓글(Comments) 엔진 --- */
function initComments(articleId, containerId = 'commentsContainer') {
  const container = document.getElementById(containerId);
  if (!container) return;

  renderCommentsUI(container, articleId);
}

function getArticleComments(articleId) {
  const storageKey = `easttimes_comments_${articleId}`;
  const saved = localStorage.getItem(storageKey);
  if (saved) return JSON.parse(saved);

  // 기본 시뮬레이션 초기 댓글
  const defaultComments = [
    {
      id: 'c-1',
      author: '설악바람',
      date: '2026.11.07 15:40',
      content: '동해북부선 전구간 개통되면 속초에서 서울까지 출퇴근도 가능해지겠네요! 영동 북부 발전이 기대됩니다.'
    },
    {
      id: 'c-2',
      author: '양양파도타기',
      date: '2026.11.07 16:15',
      content: '지역 경제와 환경이 상생하는 지속 가능한 교통망이 되었으면 좋겠습니다. 현장 취재 기사 잘 읽었습니다.'
    }
  ];
  localStorage.setItem(storageKey, JSON.stringify(defaultComments));
  return defaultComments;
}

function renderCommentsUI(container, articleId) {
  const comments = getArticleComments(articleId);

  container.innerHTML = `
    <div class="comments-header">
      <h3>독자 의견 및 토론 <span class="comments-count-badge">${comments.length}</span></h3>
      <span style="font-size:0.8rem; color:#64748b;">건전하고 따뜻한 인터넷 문화를 지켜주세요.</span>
    </div>

    <!-- 댓글 작성 폼 -->
    <div class="comment-form">
      <div class="comment-form-inputs">
        <input type="text" id="commentAuthor" class="comment-input-field" placeholder="닉네임 (작성자)" maxlength="12" style="width:160px;" />
        <input type="password" id="commentPassword" class="comment-input-field" placeholder="비밀번호(삭제용)" maxlength="8" style="width:140px;" />
      </div>
      <textarea id="commentContent" class="comment-textarea" placeholder="타인을 존중하는 소중한 의견을 남겨주세요 (최대 500자)"></textarea>
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.75rem; color:#94a3b8;">* 명예훼손, 음란물 등은 사전 통보 없이 삭제될 수 있습니다.</span>
        <button class="btn-gold-solid" onclick="submitComment('${articleId}')" style="width:auto; padding:0.6rem 1.6rem; font-size:0.9rem;">
          <i class="fas fa-paper-plane"></i> 댓글 등록
        </button>
      </div>
    </div>

    <!-- 댓글 리스트 -->
    <div class="comment-list" id="commentList">
      ${comments.length === 0 ? `
        <div style="text-align:center; padding:2rem; color:#94a3b8;">
          첫 번째 댓글의 주인공이 되어보세요!
        </div>
      ` : comments.map(c => `
        <div class="comment-item" id="comment-${c.id}">
          <div class="comment-author-row">
            <div>
              <span class="comment-author-name"><i class="fas fa-user-circle" style="color:#64748b; margin-right:4px;"></i> ${c.author}</span>
              <span class="comment-date" style="margin-left:0.6rem;">${c.date}</span>
            </div>
            <button class="btn-comment-delete" onclick="deleteComment('${articleId}', '${c.id}')">
              <i class="far fa-trash-alt"></i> 삭제
            </button>
          </div>
          <div class="comment-content">${escapeHtml(c.content)}</div>
        </div>
      `).join('')}
    </div>
  `;
}

window.submitComment = function(articleId) {
  const authorInput = document.getElementById('commentAuthor');
  const pwInput = document.getElementById('commentPassword');
  const contentInput = document.getElementById('commentContent');

  const author = authorInput.value.trim() || '동해독자';
  const content = contentInput.value.trim();

  if (!content) {
    alert('댓글 내용을 입력해 주세요.');
    contentInput.focus();
    return;
  }

  const storageKey = `easttimes_comments_${articleId}`;
  const comments = getArticleComments(articleId);

  const now = new Date();
  const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

  const newComment = {
    id: `c-${Date.now()}`,
    author: author,
    date: dateStr,
    content: content
  };

  comments.unshift(newComment);
  localStorage.setItem(storageKey, JSON.stringify(comments));

  // 재렌더링
  const container = document.getElementById('commentsContainer');
  if (container) renderCommentsUI(container, articleId);
};

window.deleteComment = function(articleId, commentId) {
  if (!confirm('이 댓글을 삭제하시겠습니까?')) return;

  const storageKey = `easttimes_comments_${articleId}`;
  let comments = getArticleComments(articleId);
  comments = comments.filter(c => c.id !== commentId);
  localStorage.setItem(storageKey, JSON.stringify(comments));

  const container = document.getElementById('commentsContainer');
  if (container) renderCommentsUI(container, articleId);
};

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// 사이드바 관련 기사
function renderRelatedArticles(currentArt) {
  const container = document.getElementById('relatedArticlesList');
  if (!container || !window.EAST_TIMES_DATA) return;

  const list = window.EAST_TIMES_DATA.articles.filter(a => a.id !== currentArt.id).slice(0, 5);
  container.innerHTML = list.map(art => `
    <a href="article.html?id=${art.id}" class="related-article-item">
      <img src="${art.image}" alt="${art.title}" />
      <div style="flex:1;">
        <span style="font-size:0.7rem; background:#f1f5f9; padding:0.1rem 0.4rem; border-radius:3px; color:#475569;">${art.region}</span>
        <div class="related-title">${art.title}</div>
        <div style="font-size:0.75rem; color:#94a3b8;">${art.date.split(' ')[0]} · 조회 ${art.views}</div>
      </div>
    </a>
  `).join('');
}

// 사이드바 날씨 위젯
function renderArticleSidebarWeather() {
  const box = document.getElementById('articleSidebarWeatherBox');
  if (!box || !window.EAST_TIMES_DATA) return;
  const w = window.EAST_TIMES_DATA.weatherTide;
  if (!w) return;

  box.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:0.6rem;">
      ${['sokcho', 'goseong', 'yangyang'].map(key => {
        const item = w[key];
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:0.6rem 0.8rem; border-radius:6px; font-size:0.85rem;">
            <span><i class="fas ${item.icon}"></i> <strong>${item.name}</strong> (${item.condition})</span>
            <span style="font-weight:800; color:var(--c-deep-navy);">${item.temp}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
