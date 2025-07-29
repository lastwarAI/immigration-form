// src/app/api/submit/route.ts 전체 코드 (isConfirmed와 status 초기값 추가됨)

import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';
import type { Application } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // 폼 데이터 가져오기 (이전과 동일)
    const nickname = formData.get('nickname') as string;
    const currentServerAndAlliance = formData.get('currentServer') as string;
    const heroPower = formData.get('power') as string;
    const mainSquad = formData.get('mainSquad') as string;
    const immigrationGrade = formData.get('immigrationGrade') as string;
    const targetAlliance = formData.get('targetAlliance') as string;
    const note = formData.get('note') as string;
    const file = formData.get('file') as File | null;

    if (!nickname || !currentServerAndAlliance || !heroPower || !mainSquad || !immigrationGrade || !targetAlliance || !file || file.size === 0) {
      return NextResponse.json({ message: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    let imageUrl: string | null = null;
    if (file && file.size > 0) {
      const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const blob = await put(filename, file, { access: 'public' });
      imageUrl = blob.url;
    }

    // --- ▼▼▼ 여기가 수정된 부분입니다 ▼▼▼ ---
    const newEntry: Application = {
      nickname,
      currentServerAndAlliance,
      heroPower,
      mainSquad,
      immigrationGrade,
      targetAlliance,
      note,
      image: imageUrl,
      createdAt: new Date().toISOString(),
      isConfirmed: false,   // << 신규 >> 확인 여부 기본값 false
      status: '대기중',     // << 신규 >> 상태 기본값 '대기중'
    };
    // --- ▲▲▲ 여기까지 ▲▲▲ ---
    
    const applications = await kv.get<Application[]>('applications') || [];
    
    applications.push(newEntry);
    await kv.set('applications', applications);

    return NextResponse.json({ success: true, message: '신청이 성공적으로 제출되었습니다! Thank you! Your application was submitted successfully!' });
  } catch (err) {
    console.error('업로드 처리 오류:', err);
    const errorMessage = err instanceof Error ? err.message : '서버 오류가 발생했습니다. A server error occurred.';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}