/**
 * East Times (이스트 타임스) 기자 등급 및 권한 체계 (RBAC)
 */

window.EAST_TIMES_USERS = {
  roles: {
    intern: {
      key: "intern",
      title: "수습기자 (Intern)",
      badgeColor: "#64748b",
      permissions: {
        canWriteDraft: true,
        canRequestPublish: true,
        canDirectPublish: false,
        canAssignLead: false,
        canManageBreaking: false,
        canManageUsers: false,
        canManageShop: false
      },
      description: "기사 초안 작성 및 데스크 승인 요청 가능 (직접 발행 불가)"
    },
    reporter: {
      key: "reporter",
      title: "취재기자 (Staff Reporter)",
      badgeColor: "#0284c7",
      permissions: {
        canWriteDraft: true,
        canRequestPublish: true,
        canDirectPublish: true,
        canAssignLead: false,
        canManageBreaking: false,
        canManageUsers: false,
        canManageShop: false
      },
      description: "기사 작성, 편집 및 직접 단독 발행 가능"
    },
    desk: {
      key: "desk",
      title: "데스크/부장 (Editor/Desk)",
      badgeColor: "#d97706",
      permissions: {
        canWriteDraft: true,
        canRequestPublish: true,
        canDirectPublish: true,
        canAssignLead: true,
        canManageBreaking: true,
        canManageUsers: false,
        canManageShop: false
      },
      description: "수습기자 기사 승인/반려, 메인 헤드라인 배치 지정, 실시간 속보 발령"
    },
    editor_in_chief: {
      key: "editor_in_chief",
      title: "편집국장/최고관리자 (Editor-in-Chief / Admin)",
      badgeColor: "#dc2626",
      permissions: {
        canWriteDraft: true,
        canRequestPublish: true,
        canDirectPublish: true,
        canAssignLead: true,
        canManageBreaking: true,
        canManageUsers: true,
        canManageShop: true
      },
      description: "전체 기사 총괄, 기자 계정 등급 조정, 쇼핑몰 상품/주문 관리, 시민기자 심사"
    }
  },

  // 기본 기자 계정 풀
  accounts: [
    {
      id: "u_chief",
      username: "chief",
      name: "한승우",
      email: "swhan@easttimes.co.kr",
      role: "editor_in_chief",
      department: "편집국 총괄 / 논설위원실",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80"
    },
    {
      id: "u_desk",
      username: "desk",
      name: "김진호",
      email: "jhkim@easttimes.co.kr",
      role: "desk",
      department: "정치·사회부",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
    },
    {
      id: "u_reporter",
      username: "reporter",
      name: "이수진",
      email: "sjlee@easttimes.co.kr",
      role: "reporter",
      department: "해양레저·문화부",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
    },
    {
      id: "u_intern",
      username: "intern",
      name: "정유미",
      email: "ymjung@easttimes.co.kr",
      role: "intern",
      department: "사회부 수습기자",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80"
    }
  ]
};
