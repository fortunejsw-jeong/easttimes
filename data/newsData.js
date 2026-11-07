/**
 * East Times (이스트 타임스) 종합 뉴스 데이터 & 지면/날씨/물때 설정
 */

window.EAST_TIMES_DATA = {
  newspaper: {
    name: "East Times",
    nameKr: "이스트 타임스",
    editionNo: "제 1,482호",
    publishDate: "2026년 11월 7일 토요일",
    slogan: "설악과 동해의 오늘을 기록하고 내일을 여는 영동 북부 대표 정론",
    regions: ["속초", "고성", "양양"],
    contact: "033-630-1000",
    email: "press@easttimes.co.kr",
    address: "강원특별자치도 속초시 중앙로 150 이스트타임스 미디어센터"
  },

  // 속보 롤링 티커
  breakingNews: [
    { id: "b1", title: "[속보] 동해북부선 속초~고성 제진 구간 시운전 착수… 2027년 전구간 개통 청신호", time: "10분 전" },
    { id: "b2", title: "[기획] 양양 남대천 연어 회귀 생태관광지구 조성 사업, 국비 150억 확보", time: "35분 전" },
    { id: "b3", title: "[지역] 고성 통일전망대 평화 관광 셔틀 전기버스 본격 운행 시작", time: "1시간 전" },
    { id: "b4", title: "[경제] 속초 수산물 가공단지 친환경 스마트 콜드체인 수출 거점 도약", time: "2시간 전" }
  ],

  // 속초·고성·양양 날씨 & 동해안 바다 물때 위젯 데이터
  weatherTide: {
    sokcho: {
      name: "속초",
      temp: "14°C",
      condition: "맑음 / 동해 연안풍",
      icon: "fa-sun",
      waveHeight: "0.8m",
      waterTemp: "16.2°C",
      tide: "2물 (조석 만조 14:20 / 간조 08:45)"
    },
    goseong: {
      name: "고성",
      temp: "13°C",
      condition: "구름 조금",
      icon: "fa-cloud-sun",
      waveHeight: "1.1m",
      waterTemp: "15.8°C",
      tide: "2물 (만조 14:10 / 간조 08:35)"
    },
    yangyang: {
      name: "양양",
      temp: "15°C",
      condition: "서핑 적합 / 남동풍",
      icon: "fa-water",
      waveHeight: "1.4m",
      waterTemp: "16.5°C",
      tide: "2물 (만조 14:30 / 간조 08:50)"
    }
  },

  // 카테고리 정의
  categories: [
    { key: "all", label: "전체뉴스" },
    { key: "politics", label: "정치·행정" },
    { key: "economy", label: "경제·상권" },
    { key: "society", label: "사회·사건" },
    { key: "culture", label: "문화·관광" },
    { key: "ocean", label: "해양·서핑" },
    { key: "opinion", label: "오피니언·칼럼" }
  ],

  // 초기 기사 데이터베이스
  articles: [
    {
      id: "art-001",
      isLead: true, // 메인 와이드 탑 기사
      isBreaking: true,
      category: "politics",
      categoryName: "정치·행정",
      region: "속초·고성",
      title: "동해북부선 속초~고성 제진 철도 시험운행 첫발… 유라시아 대륙철도 교두보 열린다",
      subtitle: "환동해 관광벨트 완성 및 영동 북부 3개 시군 30분대 단일 생활권 본격화",
      author: "김진호 선임기자",
      authorRole: "데스크 / 정치부장",
      date: "2026.11.07 14:30",
      views: 14205,
      likes: 524,
      image: "https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80",
      imageCaption: "속초역 예정지 인근을 지나는 동해북부선 시험 열차가 푸른 동해를 배경으로 시험 주행하고 있다.",
      summary: "강원특별자치도 속초시와 고성군을 잇는 동해북부선 철도 연결 사업이 마침내 공식 시험 주행에 돌입했다. 영동 북부권 물류와 관광 지형을 완전히 바꿀 이번 개통은 2027년 정식 운행을 목표로 차질 없이 진행 중이다.",
      content: `
        <p><strong>[속초=이스트 타임스] 김진호 선임기자</strong> = 속초와 고성, 그리고 양양을 관통하는 동해북부선 철도 노선이 착공 5년 만에 본격적인 궤도 시험 운행에 들어갔다. 국토교통부와 국가철도공단은 7일 속초 정거장 구내에서 관계자 100여 명이 참석한 가운데 시험 열차 출정식을 열고 본격적인 시설물 검증 시험을 시작했다고 밝혔다.</p>
        
        <p>동해북부선은 강릉에서 속초를 거쳐 고성 제진역까지 111.7km를 연결하는 단선 전철화 사업이다. 이번 시험 운행은 전차선 가압과 신호 제어 체계의 완벽한 상호 연동성을 점검하는 최종 단계로, 2027년 정식 개통 시 서울 수서 및 용산에서 고성까지 KTX-이음으로 1시간 40분대에 주파할 수 있게 된다.</p>

        <h3>◆ 3개 시군 '30분 단일 관광·산업 메가권역' 도약</h3>
        <p>속초시 관계자는 "이번 철도망 완공은 단순한 교통 인프라 확충을 넘어 속초의 해양관광, 고성의 평화·청정 자연, 양양의 스마트 해양레저 산업이 하나로 묶이는 역사적 분기점"이라며 "속초역 복합환승센터 개발과 배후단지 조성을 속도감 있게 추진하겠다"고 강조했다.</p>
      `
    },
    {
      id: "art-002",
      isLead: false,
      isSubLead: true,
      category: "ocean",
      categoryName: "해양·서핑",
      region: "양양",
      title: "사계절 서핑 메카 양양, 친환경 '서프 웨이브 파크' 국비 최종 확정",
      subtitle: "죽도·인구 연계 해양레저 거점 지구 조성… 청년 로컬 크리에이터 200여명 상주",
      author: "이수진 기자",
      authorRole: "취재기자 / 문화레저부",
      date: "2026.11.07 13:10",
      views: 8930,
      likes: 312,
      image: "https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80",
      imageCaption: "양양 죽도해변에서 늦가을 파도를 즐기는 서퍼들과 해양레저 복합센터 전경.",
      summary: "양양군이 대한민국 서핑 1번지를 넘어 세계적인 친환경 해양레포츠 도시로의 도약에 박차를 가한다. 남애항과 죽도해변을 잇는 친환경 서핑 클러스터에 200억 원 규모의 투자가 확정됐다.",
      content: `
        <p><strong>[양양=이스트 타임스] 이수진 기자</strong> = 양양군 남애항 및 죽도해변 일대가 정부의 'K-해양관광 거점 클러스터' 육성 대상지로 최종 선정됐다. 이에 따라 2028년까지 국비와 지방비 등 총 240억 원이 투입되어 사계절 실내외 서프 트레이닝 센터와 청년 창업 인큐베이팅 센터가 들어서게 된다.</p>
        <p>양양군은 기존 여름철 집중 관광 패턴을 벗어나 늦가을과 겨울철 파도를 즐기는 전 세계 서퍼들을 유치하기 위해 첨단 인공파도 파크와 스마트 바다안전 관제센터를 통합 운영할 방침이다.</p>
      `
    },
    {
      id: "art-003",
      isLead: false,
      isSubLead: true,
      category: "economy",
      categoryName: "경제·상권",
      region: "고성",
      title: "고성 해양심층수 바이오 밸리 준공… '글로벌 블루 이코노미' 뜬다",
      subtitle: "청정 수심 605m 취수 기술 기반 화장품·전통주·웰에이징 융복합 단지 가동",
      author: "박상철 기자",
      authorRole: "취재기자 / 경제산업부",
      date: "2026.11.07 11:45",
      views: 6540,
      likes: 180,
      image: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80",
      imageCaption: "고성 거진 연안에 구축된 해양심층수 연구생산 지원센터 시설.",
      summary: "고성군이 천혜의 해양심층수 자원을 고부가가치 미래 산업으로 육성하는 바이오 밸리를 본격 가동했다. 12개 우수 벤처기업이 입주를 확정하며 지역 일자리 300개가 신규 창출된다.",
      content: `
        <p><strong>[고성=이스트 타임스] 박상철 기자</strong> = 고성군 거진읍 송포리 일원에 조성된 '고성 해양심층수 고부가가치 바이오 밸리'가 7일 공식 준공식을 열고 첫 가동에 돌입했다. 수온 2도 이하를 상시 유지하는 고성 해양심층수는 무기질과 영양염류가 풍부하여 프리미엄 식품, 기능성 화장품 및 전통 발효주 제조에 최적의 조건을 지닌 것으로 평가받는다.</p>
      `
    },
    {
      id: "art-004",
      isLead: false,
      isSubLead: false,
      category: "culture",
      categoryName: "문화·관광",
      region: "속초",
      title: "속초 아바이마을 실향민 역사문화축제, 유네스코 인류무형문화유산 잠정목록 등재 추진",
      subtitle: "오징어순대·가자미식해 등 실향 음식문화와 북청사자놀음 연계 세계화",
      author: "정유미 수습기자",
      authorRole: "수습기자",
      date: "2026.11.07 09:20",
      views: 4320,
      likes: 245,
      image: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=800&q=80",
      imageCaption: "아바이마을 갯배 선착장과 청초호의 가을 정취.",
      summary: "속초의 대표적 역사 공간인 아바이마을의 디아스포라 음식 및 놀이 문화가 유네스코 등재를 위한 첫 학술 심포지엄을 가졌다. 실향의 아픔을 화합의 문화로 꽃피운 가치가 높게 평가된다.",
      content: `
        <p><strong>[속초=이스트 타임스] 정유미 수습기자</strong> = 6.25 전쟁 이후 반세기 넘게 고유의 삶과 식문화를 지켜온 속초 청호동 아바이마을의 생활문화 유산이 유네스코 등재 추진의 닻을 올렸다. 속초문화관광재단과 이스트 타임스가 공동 후원한 이번 심포지엄에는 민속학계 및 문화재청 자문위원들이 대거 참석했다.</p>
      `
    },
    {
      id: "art-005",
      isLead: false,
      isSubLead: false,
      category: "society",
      categoryName: "사회·사건",
      region: "고성·속초",
      title: "설악산 첫 단풍 절정기 맞은 울산바위… 스마트 산악구조 시스템 전면 가동",
      subtitle: "드론 열화상 감지 및 5G 조난 비콘 설치로 골든타임 50% 단축",
      author: "최영민 기자",
      authorRole: "취재기자 / 사회안전부",
      date: "2026.11.06 17:50",
      views: 7810,
      likes: 195,
      image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
      imageCaption: "설악산 울산바위 일대의 웅장한 가을 능선 전경.",
      summary: "가을 산행객이 몰리는 설악산 일대에 지자체와 소방당국이 첨단 인공지능 산악 관제 시스템을 투입해 등산객 안전 확보에 총력을 기울이고 있다.",
      content: `
        <p><strong>[속초=이스트 타임스] 최영민 기자</strong> = 설악산 국립공원 내 대표 명소인 울산바위와 비선대 구간에 인공지능 기반 스마트 조난 수색 드론이 실전 배치됐다. 산악 지형 특성상 통신 음영 지대가 많았던 미시령 고개와 화암사 인근에도 5G 비상 비콘이 20곳 확충됐다.</p>
      `
    },
    {
      id: "art-006",
      isLead: false,
      isSubLead: false,
      category: "opinion",
      categoryName: "오피니언·칼럼",
      region: "영동북부",
      title: "[이스트 칼럼] 설악과 동해의 경계를 허무는 로컬 르네상스의 조건",
      subtitle: "속초의 속도, 고성의 생태, 양양의 힙함이 빚어낼 황금 삼각 벨트",
      author: "한승우 논설주간",
      authorRole: "논설주간 / 편집국장",
      date: "2026.11.06 14:00",
      views: 5120,
      likes: 420,
      image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80",
      imageCaption: "이스트 타임스 사옥 미디어룸 집무실.",
      summary: "지방소멸의 위기 속에서도 영동 북부 3개 시군은 고유의 매력과 문화 자본으로 인구 유입을 만들어내고 있다. 통합 행정과 로컬 미디어의 정체성 확립이 중요한 시점이다.",
      content: `
        <p><strong>[이스트 타임스 칼럼]</strong> 동해안을 따라 달리는 7번 국도를 바라보며 우리는 늘 지역의 경계를 생각한다. 속초의 번화한 관광 상권, 고성의 드넓은 DMZ 평화 생태계, 양양의 파도 위에서 춤추는 청년 문화는 각기 다른 색깔이지만 하나의 거대한 숨결로 엮여 있다...</p>
      `
    }
  ],

  // PDF 신문 지면 발행호 목록
  paperEditions: [
    {
      no: "1482",
      date: "2026.11.07",
      title: "제 1482호 종합판 (1면 탑: 동해북부선 시험운행)",
      thumb: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80",
      pdfUrl: "#"
    },
    {
      no: "1481",
      date: "2026.11.06",
      title: "제 1481호 문화기획특집 (양양 서핑 클러스터 & 남대천 르네상스)",
      thumb: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80",
      pdfUrl: "#"
    },
    {
      no: "1480",
      date: "2026.11.05",
      title: "제 1480호 경제산업판 (고성 해양심층수 바이오 밸리 준공)",
      thumb: "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?auto=format&fit=crop&w=600&q=80",
      pdfUrl: "#"
    }
  ]
};
