// src/app/api/submit/route.ts 전체 코드 (새 항목 처리 로직 추가됨)

import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';
import type { Application } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // --- ▼▼▼ 새로운 폼 데이터 가져오기 (이름도 types.ts와 일치시킴) ▼▼▼ ---
    const nickname = formData.get('nickname') as string;
    const currentServerAndAlliance = formData.get('currentServer') as string; // 이름 변경
    const heroPower = formData.get('power') as string;                      // 이름 변경
    const mainSquad = formData.get('mainSquad') as string;                  // << 신규 >>
    const immigrationGrade = formData.get('immigrationGrade') as string;    // << 신규 >>
    const targetAlliance = formData.get('targetAlliance') as string;        // << 신규 >>
    const note = formData.get('note') as string;
    const file = formData.get('file') as File | null;
    // --- ▲▲▲ 여기까지 ▲▲▲ ---

    // 유효성 검사 항목에 새로운 필수 필드 추가
    if (!nickname || !currentServerAndAlliance || !heroPower || !mainSquad || !immigrationGrade || !targetAlliance || !file || file.size === 0) {
      return NextResponse.json({ message: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    let imageUrl: string | null = null;
    if (file && file.size > 0) {
      const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const blob = await put(filename, file, { access: 'public' });
      imageUrl = blob.url;
    }

    // --- ▼▼▼ 저장할 객체에 새로운 데이터 추가 (types.ts와 일치시킴) ▼▼▼ ---
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