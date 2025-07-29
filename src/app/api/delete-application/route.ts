// src/app/api/delete-application/route.ts 전체 코드

import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { del } from '@vercel/blob';
import type { Application } from '@/types';

// 보안을 위한 관리자 비밀번호
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "lastwar2025";

export async function DELETE(req: NextRequest) {
  // 1. 관리자 인증 확인
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return NextResponse.json({ message: '인증에 실패했습니다.' }, { status: 401 });
  }

  try {
    // 2. 프론트엔드에서 보낸 삭제할 ID 값 받기
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ message: '삭제할 항목의 ID가 필요합니다.' }, { status: 400 });
    }

    // 3. KV에서 모든 신청서 데이터 가져오기
    const applications = await kv.get<Application[]>('applications') || [];

    // 4. 삭제할 신청서 데이터 찾기
    const applicationToDelete = applications.find(app => app.createdAt === id);

    // 5. 만약 신청서에 연결된 이미지가 있다면, Vercel Blob에서 해당 이미지 파일 삭제
    if (applicationToDelete && applicationToDelete.image) {
      await del(applicationToDelete.image);
    }

    // 6. 전체 신청서 목록에서 삭제할 항목을 제외한 새 목록 만들기
    const updatedApplications = applications.filter(app => app.createdAt !== id);

    // 7. 새로 만들어진 목록을 KV에 다시 저장 (덮어쓰기)
    await kv.set('applications', updatedApplications);

    return NextResponse.json({ success: true, message: '성공적으로 삭제되었습니다.' });

  } catch (err) {
    console.error('개별 삭제 처리 오류:', err);
    const errorMessage = err instanceof Error ? err.message : '서버 오류가 발생했습니다.';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}