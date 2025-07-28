// src/app/api/submit/route.ts 전체 코드

import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { kv } from '@vercel/kv';
import type { Application } from '@/types'; // 공용 타입을 임포트합니다. (@/는 src/ 폴더를 의미)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    // ... (파일 및 폼 데이터 가져오는 부분은 이전과 동일)
    const nickname = formData.get('nickname') as string;
    const currentServer = formData.get('currentServer') as string;
    const targetServer = formData.get('targetServer') as string;
    const power = formData.get('power') as string;
    const note = formData.get('note') as string;
    const file = formData.get('file') as File | null;

    if (!nickname || !currentServer || !targetServer || !power) {
      return NextResponse.json({ message: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    let imageUrl: string | null = null;
    if (file && file.size > 0) {
      const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      const blob = await put(filename, file, { access: 'public' });
      imageUrl = blob.url;
    }

    const newEntry: Application = { // 여기서도 타입을 명시해주는 것이 좋습니다.
      nickname,
      currentServer,
      targetServer,
      power,
      note,
      image: imageUrl,
      createdAt: new Date().toISOString(),
    };

    // --- 여기가 수정된 부분입니다 ---
    // any[] 대신 Application[] 타입을 명확하게 지정합니다.
    const applications = await kv.get<Application[]>('applications') || [];
    // --- 수정 끝 ---
    
    applications.push(newEntry);
    await kv.set('applications', applications);

    return NextResponse.json({ success: true, message: '신청이 성공적으로 제출되었습니다! Thank you! Your application was submitted successfully!' });
  } catch (err) {
    console.error('업로드 처리 오류:', err);
    const errorMessage = err instanceof Error ? err.message : '서버 오류가 발생했습니다. A server error occurred.';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}