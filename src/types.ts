// src/types.ts 전체 코드 (새 항목 추가됨)

export type Application = {
  // --- 기존 항목 이름도 명확하게 변경 및 신규 항목 추가 ---
  nickname: string;
  currentServerAndAlliance: string; // '현재 서버' -> '현재 서버 및 연맹'
  heroPower: string;                // '전투력' -> '총 영웅 전투력'
  mainSquad: string;                // << 신규 >> 주력 군종 및 전투력
  immigrationGrade: string;         // << 신규 >> 이민 등급
  targetAlliance: string;           // << 신규 >> 목표 연맹
  note: string;
  image?: string | null;
  createdAt: string;
};