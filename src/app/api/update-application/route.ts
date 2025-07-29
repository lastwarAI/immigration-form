// src/app/api/update-application/route.ts 전체 코드

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import type { Application } from '@/types';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "lastwar2025";

// 부분 업데이트를 위해 PATCH 메소드 사용
export async function PATCH(req: NextRequest) {
  // 1. 관리자 인증 확인
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return NextResponse.json({ message: '인증에 실패했습니다.' }, { status: 401 });
  }

  try {
    // 2. 프론트엔드에서 보낸 업데이트할 정보 받기
    // { id: '...', updates: { isConfirmed: true } } 또는
    // { id: '...', updates: { status: '승인' } } 형태
    const { id, updates } = await req.json();

    if (!id || !updates || typeof updates !== 'object') {
      return NextResponse.json({ message: '잘못된 요청입니다.' }, { status: 400 });
    }

    // 3. KV에서 모든 신청서 데이터 가져오기
    const applications = await kv.get<Application[]>('applications') || [];

    // 4. 업데이트할 신청서의 인덱스 찾기
    const appIndex = applications.findIndex(app => app.createdAt === id);

    if (appIndex === -1) {
      return NextResponse.json({ message: '해당 신청서를 찾을 수 없습니다.' }, { status: 404 });
    }
    
    // 5. 기존 데이터에 새로운 변경사항 덮어쓰기
    // 예: { ...기존데이터, isConfirmed: true }
    applications[appIndex] = { ...applications[appIndex], ...updates };
    
    // 6. 업데이트된 전체 목록을 KV에 다시 저장
    await kv.set('applications', applications);

    return NextResponse.json({ success: true, application: applications[appIndex] });

  } catch (err) {
    console.error('업데이트 처리 오류:', err);
    const errorMessage = err instanceof Error ? err.message : '서버 오류가 발생했습니다.';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}