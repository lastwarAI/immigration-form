// src/types.ts 전체 코드 (isConfirmed와 status 추가됨)

export type Application = {
  nickname: string;
  currentServerAndAlliance: string; 
  heroPower: string;                
  mainSquad: string;                
  immigrationGrade: string;         
  targetAlliance: string;           
  note: string;
  image?: string | null;
  createdAt: string;

  // --- ▼▼▼ 신규 항목 2개 추가 ▼▼▼ ---
  isConfirmed: boolean; // 1번 기능: 확인 여부 (체크박스)
  status: '대기중' | '승인' | '거절'; // 2번 기능: 신청 상태 (드롭다운)
  // --- ▲▲▲ 여기까지 ▲▲▲ ---
};