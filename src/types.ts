// src/types.ts 전체 코드 (applicantId 추가됨)

export type Application = {
  // --- ▼▼▼ 신규 항목 ▼▼▼ ---
  applicantId: string; // 각 신청자를 구분하는 고유 ID

  // --- ▼▼▼ 기존 항목 순서 정리 ▼▼▼ ---
  nickname: string;
  isConfirmed: boolean;
  status: '대기중' | '승인' | '거절';
  currentServerAndAlliance: string; 
  heroPower: string;                
  mainSquad: string;                
  immigrationGrade: string;         
  targetAlliance: string;           
  note: string;
  image?: string | null;
  createdAt: string; // 각 '버전'이 생성된 시간
};

// updateCount는 더 이상 사용하지 않으므로 제거합니다.