// src/app/api/submit/route.ts 의 전체 코드

import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { kv } from '@vercel/kv'; // Vercel KV 임포트

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

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

    const newEntry = {
      nickname,
      currentServer,
      targetServer,
      power,
      note,
      image: imageUrl,
      createdAt: new Date().toISOString(),
    };

    // --- 여기가 바뀝니다: JSON 파일 대신 Vercel KV 사용 ---
    
    // 1. 'applications' 라는 키로 저장된 기존 신청서 목록을 가져옵니다.
    const applications = await kv.get<any[]>('applications') || [];

    // 2. 새로운 신청서를 목록에 추가합니다.
    applications.push(newEntry);

    // 3. 'applications' 키에 업데이트된 전체 목록을 다시 저장합니다.
    await kv.set('applications', applications);
    
    // --- 변경 끝 ---

    return NextResponse.json({ success: true, message: '신청이 성공적으로 제출되었습니다!' });

  } catch (err) {
    console.error('업로드 처리 오류:', err);
    const errorMessage = err instanceof Error ? err.message : '서버 오류가 발생했습니다.';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}