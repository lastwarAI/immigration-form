// src/types.ts 전체 코드 (updateCount 추가됨)

export type Application = {
  nickname: string;
  updateCount: number; // << 신규 >> 업데이트 횟수
  isConfirmed: boolean;
  status: '대기중' | '승인' | '거절';
  currentServerAndAlliance: string; 
  heroPower: string;                
  mainSquad: string;                
  immigrationGrade: string;         
  targetAlliance: string;           
  note: string;
  image?: string | null;
  createdAt: string;
};