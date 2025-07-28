import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import { del } from '@vercel/blob';
import type { Application } from '@/types';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "lastwar2025";

// "전체 초기화" 요청을 처리하는 함수
export async function DELETE(req: NextRequest) {
  // 1. 관리자 인증 확인
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: '인증에 실패했습니다.' }, { status: 401 });
  }

  try {
    // 2. Vercel KV에서 모든 신청서 데이터 가져오기
    const applications = await kv.get<Application[]>('applications') || [];

    // 3. 삭제할 이미지 URL 목록 만들기
    const imageUrlsToDelete = applications
      .map(app => app.image) // 각 신청서에서 image URL만 추출
      .filter((url): url is string => !!url); // null이나 undefined가 아닌 유효한 URL만 필터링

    // 4. Vercel Blob에서 모든 이미지 파일 일괄 삭제
    if (imageUrlsToDelete.length > 0) {
      await del(imageUrlsToDelete);
    }

    // 5. Vercel KV에서 'applications' 키 자체를 삭제하여 모든 데이터 제거
    await kv.del('applications');
    
    return NextResponse.json({ success: true, message: '모든 데이터가 성공적으로 초기화되었습니다.' });

  } catch (err) {
    console.error('리셋 처리 오류:', err);
    const errorMessage = err instanceof Error ? err.message : '서버 오류가 발생했습니다.';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}