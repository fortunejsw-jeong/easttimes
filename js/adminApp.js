/**
 * East Times (이스트 타임스) 기자 등급별 관리자 CMS 로직 엔진
 * - 등급별 권한 검증 및 기능 활성화/제한
 * - 리치 위지윅 에디터 & 실시간 신문 지면 라이브 프리뷰
 * - 이미지 드래그 앤 드롭 파일 업로드 & 보도사진 프리셋
 * - 기사 작성, 임시저장, 승인요청, 직접발행
 * - 데스크 전용: 기사 승인/반려, 메인 헤드라인(TOP LEAD) 지정
 * - 편집국장 전용: 기자 등급 조정, 쇼핑몰 주문 현황 관리
 */

let currentUserId = "u_chief"; // 기본 로그인: 편집국장

document.addEventListener('DOMContentLoaded', () => {
  initRoleSwitcher();
  renderAdminProfile();
  renderArticlesTable();
  initArticleWriteForm();
  initRichEditorAndPreview();
  renderShopOrdersTable();
});

/* --- 기자/관리자 역할 전환 --- */
function initRoleSwitcher() {
  const select = document.getElementById('adminRoleSelect');
  const users = window.EAST_TIMES_USERS.accounts;
  if (!select || !users) return;

  select.innerHTML = users.map(u => {
    const roleInfo = window.EAST_TIMES_USERS.roles[u.role];
    return `<option value="${u.id}" ${u.id === currentUserId ? 'selected' : ''}>[${roleInfo.title}] ${u.name} 기자</option>`;
  }).join('');

  select.addEventListener('change', (e) => {
    currentUserId = e.target.value;
    renderAdminProfile();
    renderArticlesTable();
    checkPermissionsUI();
    updateLivePreview();
  });
}

function getCurrentUser() {
  return window.EAST_TIMES_USERS.accounts.find(u => u.id === currentUserId) || window.EAST_TIMES_USERS.accounts[0];
}

function getCurrentRoleInfo() {
  const user = getCurrentUser();
  return window.EAST_TIMES_USERS.roles[user.role];
}

/* --- 관리자 프로필 정보 렌더링 --- */
function renderAdminProfile() {
  const user = getCurrentUser();
  const role = getCurrentRoleInfo();

  document.getElementById('adminUserName').innerText = user.name;
  document.getElementById('adminUserDept').innerText = user.department;
  document.getElementById('adminUserAvatar').src = user.avatar;

  const badgeElem = document.getElementById('adminUserBadge');
  badgeElem.innerText = role.title;
  badgeElem.style.background = role.badgeColor;

  document.getElementById('rolePermDescription').innerHTML = `
    <strong><i class="fas fa-shield-alt"></i> ${role.title} 권한:</strong> ${role.description}
  `;

  checkPermissionsUI();
}

/* --- 등급별 권한에 따른 UI 활성화/비활성화 제어 --- */
function checkPermissionsUI() {
  const role = getCurrentRoleInfo();
  const perms = role.permissions;

  // 1. 직접 발행 버튼 제어 (수습기자는 승인요청만 가능)
  const directPublishBtn = document.getElementById('btnDirectPublish');
  const requestPublishBtn = document.getElementById('btnRequestPublish');

  if (directPublishBtn && requestPublishBtn) {
    if (perms.canDirectPublish) {
      directPublishBtn.style.display = 'inline-flex';
      requestPublishBtn.style.display = 'none';
    } else {
      directPublishBtn.style.display = 'none';
      requestPublishBtn.style.display = 'inline-flex';
    }
  }

  // 2. 편집국장 전용 섹션 (쇼핑몰/정산 관리, 계정 승인)
  const chiefSection = document.getElementById('chiefExclusiveSection');
  if (chiefSection) {
    chiefSection.style.display = perms.canManageShop ? 'block' : 'none';
  }
}

/* --- 기사 관리 목록 렌더링 --- */
function renderArticlesTable() {
  const tbody = document.getElementById('adminArticleTbody');
  const articles = window.EAST_TIMES_DATA.articles;
  const role = getCurrentRoleInfo();
  const perms = role.permissions;
  if (!tbody || !articles) return;

  tbody.innerHTML = articles.map((art, idx) => {
    const isTopLeadBadge = art.isLead 
      ? '<span style="background:#ef4444; color:#fff; font-size:0.75rem; padding:0.2rem 0.5rem; border-radius:4px; font-weight:800;">메인 1면 탑</span>'
      : '<span style="background:#f1f5f9; color:#64748b; font-size:0.75rem; padding:0.2rem 0.5rem; border-radius:4px;">일반기사</span>';

    return `
      <tr>
        <td style="font-weight:700;">#${idx + 1}</td>
        <td>
          <span style="font-size:0.75rem; background:#e0f2fe; color:#0369a1; padding:0.15rem 0.4rem; border-radius:4px; font-weight:700;">${art.categoryName}</span>
          <span style="font-size:0.75rem; background:#f8fafc; border:1px solid #cbd5e1; padding:0.15rem 0.4rem; border-radius:4px;">${art.region}</span>
        </td>
        <td>
          <div style="font-weight:700; color:#0f172a; margin-bottom:0.2rem;">${art.title}</div>
          <div style="font-size:0.78rem; color:#64748b;">
            ${art.date} · 조회수 ${art.views.toLocaleString()}
            <a href="article.html?id=${art.id}" target="_blank" style="color:#0284c7; margin-left:8px; text-decoration:none;"><i class="fas fa-external-link-alt"></i> 지면확인</a>
          </div>
        </td>
        <td style="font-weight:600;">${art.author}</td>
        <td>${isTopLeadBadge}</td>
        <td>
          <div style="display:flex; gap:0.4rem;">
            ${perms.canAssignLead ? `
              <button class="btn-sm" onclick="setAsLeadStory('${art.id}')" style="background:#fef3c7; color:#b45309; padding:0.3rem 0.6rem; border-radius:4px; font-size:0.75rem; font-weight:700;">
                ${art.isLead ? '탑 해제' : '1면 탑 지정'}
              </button>
            ` : ''}
            <button class="btn-sm" onclick="deleteArticle('${art.id}')" style="background:#fee2e2; color:#dc2626; padding:0.3rem 0.6rem; border-radius:4px; font-size:0.75rem; font-weight:700;">
              삭제
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/* --- 메인 헤드라인 1면 탑 지정 (데스크 이상 전용 권한) --- */
window.setAsLeadStory = function(articleId) {
  const role = getCurrentRoleInfo();
  if (!role.permissions.canAssignLead) {
    alert('권한이 부족합니다. 메인 헤드라인 배치는 [데스크/부장] 이상만 가능합니다.');
    return;
  }

  const articles = window.EAST_TIMES_DATA.articles;
  articles.forEach(a => {
    if (a.id === articleId) {
      a.isLead = !a.isLead;
    } else {
      a.isLead = false; // 단일 1면 탑 원칙
    }
  });

  renderArticlesTable();
  alert('메인 1면 탑 기사 배치가 즉시 반영되었습니다!');
};

/* --- 기사 삭제 --- */
window.deleteArticle = function(articleId) {
  const role = getCurrentRoleInfo();
  if (!role.permissions.canDirectPublish) {
    alert('수습기자는 기사 삭제 권한이 없습니다.');
    return;
  }

  if (confirm('해당 기사를 영구 삭제하시겠습니까?')) {
    const idx = window.EAST_TIMES_DATA.articles.findIndex(a => a.id === articleId);
    if (idx !== -1) {
      window.EAST_TIMES_DATA.articles.splice(idx, 1);
      renderArticlesTable();
      alert('기사가 성공적으로 삭제되었습니다.');
    }
  }
};

/* --- 리치 에디터 명령어 및 서식 포맷 --- */
window.execEditorCmd = function(command) {
  document.execCommand(command, false, null);
  updateLivePreview();
};

window.execEditorFormat = function(tag) {
  document.execCommand('formatBlock', false, tag);
  updateLivePreview();
};

/* --- 보도사진 추천 프리셋 --- */
const PHOTO_PRESETS = {
  sokcho: {
    url: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80",
    caption: "속초역 일대를 지나는 동해북부선 시험 주행 열차"
  },
  yangyang: {
    url: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=1000&q=80",
    caption: "양양 죽도해변에서 가을 파도를 즐기는 서핑 인파"
  },
  goseong: {
    url: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1000&q=80",
    caption: "고성 거진 연안 해양심층수 바이오 밸리 연구시설 전경"
  },
  seoraksan: {
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=80",
    caption: "설악산 공룡능선에 깃든 늦가을 운해와 단풍"
  }
};

window.setPresetImage = function(key) {
  const item = PHOTO_PRESETS[key];
  if (!item) return;

  document.getElementById('artWriteImage').value = item.url;
  document.getElementById('artWriteCaption').value = item.caption;
  updateLivePreview();
};

/* --- 리치 에디터 및 실시간 라이브 프리뷰 연동 --- */
function initRichEditorAndPreview() {
  const titleInput = document.getElementById('artWriteTitle');
  const subInput = document.getElementById('artWriteSubtitle');
  const catSelect = document.getElementById('artWriteCategory');
  const regSelect = document.getElementById('artWriteRegion');
  const imgInput = document.getElementById('artWriteImage');
  const captionInput = document.getElementById('artWriteCaption');
  const richEditor = document.getElementById('artRichEditor');

  // 입력 이벤트 바인딩
  [titleInput, subInput, catSelect, regSelect, imgInput, captionInput].forEach(el => {
    if (el) el.addEventListener('input', updateLivePreview);
    if (el) el.addEventListener('change', updateLivePreview);
  });

  if (richEditor) {
    richEditor.addEventListener('input', updateLivePreview);
  }

  // 이미지 파일 업로드 드롭존
  const dropZone = document.getElementById('imageDropZone');
  const fileInput = document.getElementById('imageFileInput');

  if (dropZone && fileInput) {
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processUploadedImage(e.dataTransfer.files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        processUploadedImage(e.target.files[0]);
      }
    });
  }

  updateLivePreview();
}

function processUploadedImage(file) {
  if (!file.type.startsWith('image/')) {
    alert('이미지 파일(JPG, PNG, WebP 등)만 업로드할 수 있습니다.');
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64Url = e.target.result;
    document.getElementById('artWriteImage').value = base64Url;
    document.getElementById('artWriteCaption').value = `[현장 사진] ${file.name}`;
    updateLivePreview();
    alert(`보도사진 '${file.name}'이 첨부되었습니다.`);
  };
  reader.readAsDataURL(file);
}

// 우측 신문 지면 실시간 프리뷰 업데이트
function updateLivePreview() {
  const title = document.getElementById('artWriteTitle')?.value || "기사 제목이 이곳에 실시간으로 표시됩니다";
  const subtitle = document.getElementById('artWriteSubtitle')?.value || "부제목 요약문이 여기에 표시됩니다.";
  const cat = document.getElementById('artWriteCategory')?.value || "politics";
  const reg = document.getElementById('artWriteRegion')?.value || "속초";
  const imgUrl = document.getElementById('artWriteImage')?.value;
  const caption = document.getElementById('artWriteCaption')?.value || "";
  const richHtml = document.getElementById('artRichEditor')?.innerHTML || "";

  const user = getCurrentUser();
  const catObj = window.EAST_TIMES_DATA?.categories.find(c => c.key === cat) || { label: "종합" };

  const badgeEl = document.getElementById('previewBadge');
  const titleEl = document.getElementById('previewTitle');
  const subEl = document.getElementById('previewSubtitle');
  const bylineEl = document.getElementById('previewByline');
  const imgEl = document.getElementById('previewImg');
  const bodyEl = document.getElementById('previewBody');

  if (badgeEl) badgeEl.textContent = `${catObj.label} · ${reg}`;
  if (titleEl) titleEl.textContent = title;
  if (subEl) subEl.textContent = subtitle;
  if (bylineEl) bylineEl.textContent = `${user.name} 기자 · 2026.11.07 · 조회수 1회`;

  if (imgEl) {
    if (imgUrl) {
      imgEl.src = imgUrl;
      imgEl.style.display = 'block';
    } else {
      imgEl.style.display = 'none';
    }
  }

  if (bodyEl) {
    if (richHtml && richHtml.trim() !== '<p></p>' && richHtml.trim() !== '<br>') {
      bodyEl.innerHTML = richHtml;
    } else {
      bodyEl.innerHTML = `<span style="color:#94a3b8; font-style:italic;">본문 내용을 작성하시면 실제 신문 사이트에 배포될 모습이 실시간으로 렌더링됩니다.</span>`;
    }
  }
}

// 임시 저장
window.saveDraftArticle = function() {
  const title = document.getElementById('artWriteTitle').value;
  const richHtml = document.getElementById('artRichEditor').innerHTML;
  
  if (!title) {
    alert('기사 제목을 먼저 입력해 주세요.');
    return;
  }

  localStorage.setItem('easttimes_article_draft', JSON.stringify({
    title,
    subtitle: document.getElementById('artWriteSubtitle').value,
    category: document.getElementById('artWriteCategory').value,
    region: document.getElementById('artWriteRegion').value,
    image: document.getElementById('artWriteImage').value,
    caption: document.getElementById('artWriteCaption').value,
    content: richHtml,
    savedAt: new Date().toLocaleString()
  }));

  alert('기사 초안이 브라우저 로컬 저장소에 성공적으로 임시저장되었습니다.');
};

/* --- 새 기사 작성 폼 제출 --- */
function initArticleWriteForm() {
  const form = document.getElementById('newArticleForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    const role = getCurrentRoleInfo();

    const title = document.getElementById('artWriteTitle').value;
    const subtitle = document.getElementById('artWriteSubtitle').value;
    const category = document.getElementById('artWriteCategory').value;
    const region = document.getElementById('artWriteRegion').value;
    const caption = document.getElementById('artWriteCaption').value || `${region} 일대 취재 현장`;
    const richContent = document.getElementById('artRichEditor').innerHTML;
    const imgUrl = document.getElementById('artWriteImage').value || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80';

    if (!richContent || richContent.trim() === '<p></p>' || richContent.trim() === '<br>') {
      alert('기사 본문 내용을 작성해 주세요.');
      document.getElementById('artRichEditor').focus();
      return;
    }

    const catObj = window.EAST_TIMES_DATA.categories.find(c => c.key === category) || { label: "종합" };

    const newArt = {
      id: "art-" + Date.now(),
      isLead: false,
      isBreaking: false,
      category: category,
      categoryName: catObj.label,
      region: region,
      title: title,
      subtitle: subtitle,
      author: `${user.name} 기자`,
      authorRole: role.title,
      date: new Date().toISOString().slice(0, 16).replace('T', ' '),
      views: 1,
      likes: 0,
      image: imgUrl,
      imageCaption: caption,
      summary: (document.getElementById('artRichEditor').innerText || '').substring(0, 120) + "...",
      content: `<p><strong>[${region}=이스트 타임스] ${user.name} 기자</strong> =</p>` + richContent
    };

    if (role.permissions.canDirectPublish) {
      window.EAST_TIMES_DATA.articles.unshift(newArt);
      alert(`[직접 발행 완료] '${title}' 기사가 포털 메인 및 지면에 실시간 발행되었습니다!`);
    } else {
      // 수습기자 승인 요청
      alert(`[데스크 승인 요청 접수] 수습기자 원고가 데스크(부장) 검토 대기열에 등록되었습니다.`);
      window.EAST_TIMES_DATA.articles.push(newArt);
    }

    form.reset();
    document.getElementById('artRichEditor').innerHTML = "";
    renderArticlesTable();
    updateLivePreview();
  });
}

/* --- 쇼핑몰 주문 현황 테이블 (편집국장 전용) --- */
function renderShopOrdersTable() {
  const tbody = document.getElementById('adminOrdersTbody');
  if (!tbody) return;

  const mockOrders = [
    { orderNo: "ET-20261107-1042", buyer: "박지훈", item: "양양 자연산 1등급 송이버섯 세트 (1개)", amount: "185,000원", status: "배송준비중", date: "2026-11-07 16:42" },
    { orderNo: "ET-20261107-0982", buyer: "김민서", item: "속초 아바이 수제 오징어순대 3미 (2개)", amount: "49,800원", status: "결제완료", date: "2026-11-07 15:10" },
    { orderNo: "ET-20261107-0812", buyer: "이원택", item: "고성 해양심층수 생 막걸리 4병 (1세트)", amount: "19,800원", status: "배송중", date: "2026-11-07 11:20" }
  ];

  tbody.innerHTML = mockOrders.map(ord => `
    <tr>
      <td style="font-family:monospace; font-weight:700;">${ord.orderNo}</td>
      <td><strong>${ord.buyer}</strong></td>
      <td>${ord.item}</td>
      <td style="font-weight:800; color:#ef4444;">${ord.amount}</td>
      <td>
        <span style="background:#dcfce7; color:#15803d; font-size:0.75rem; padding:0.2rem 0.5rem; border-radius:4px; font-weight:700;">${ord.status}</span>
      </td>
      <td style="font-size:0.8rem; color:#64748b;">${ord.date}</td>
    </tr>
  `).join('');
}
