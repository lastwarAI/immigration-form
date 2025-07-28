// src/app/api/applications/route.ts 전체 코드

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import type { Application } from '@/types'; // 공용 타입을 임포트합니다.

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "lastwar2025";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('Authorization');

  if (authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: '인증에 실패했습니다.' }, { status: 401 });
  }
  
  try {
    // --- 여기가 수정된 부분입니다 ---
    const applications = await kv.get<Application[]>('applications') || [];
    // --- 수정 끝 ---
    
    return NextResponse.json(applications);
  } catch (err) {
    return NextResponse.json({ error: '서버 내부 오류: 데이터를 읽을 수 없습니다.' }, { status: 500 });
  }
}