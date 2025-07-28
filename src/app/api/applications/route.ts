// src/app/api/applications/route.ts 의 전체 코드

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv'; // Vercel KV 임포트

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "lastwar2025";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');

  if (authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: '인증에 실패했습니다.' }, { status: 401 });
  }
  
  try {
    // --- 여기가 바뀝니다: JSON 파일 대신 Vercel KV 사용 ---

    // 'applications' 키로 저장된 데이터를 가져옵니다. 데이터가 없으면 빈 배열([])을 반환합니다.
    const applications = await kv.get('applications') || [];
    
    // --- 변경 끝 ---
    
    return NextResponse.json(applications);
  } catch (err) {
    return NextResponse.json({ error: '서버 내부 오류: 데이터를 읽을 수 없습니다.' }, { status: 500 });
  }
}