// src/app/api/submit/route.ts 전체 코드 (업데이트 로직 적용)

import { NextRequest, NextResponse } from 'next/server';
import { put, del } from '@vercel/blob';
import { kv } from '@vercel/kv';
import type { Application } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // --- 1. 폼 데이터 가져오기 (이전과 동일) ---
    const nickname = formData.get('nickname') as string;
    const currentServerAndAlliance = formData.get('currentServer') as string;
    const heroPower = formData.get('power') as string;
    const mainSquad = formData.get('mainSquad') as string;
    const immigrationGrade = formData.get('immigrationGrade') as string;
    const targetAlliance = formData.get('targetAlliance') as string;
    const note = formData.get('note') as string;
    const file = formData.get('file') as File | null;

    if (!nickname || !currentServerAndAlliance || !heroPower || !mainSquad || !immigrationGrade || !targetAlliance || !note || !file || file.size === 0) {
      return NextResponse.json({ message: '필수 항목이 누락되었습니다.' }, { status: 400 });
    }

    // --- 2. 이미지 업로드 (항상 새로 업로드) ---
    let imageUrl: string | null = null;
    if (file && file.size > 0) {
      const filename = `${Date.now()}_${nickname.replace(/\s+/g, '_')}_${file.name.replace(/\s+/g, '_')}`;
      const blob = await put(filename, file, { access: 'public' });
      imageUrl = blob.url;
    }

    // --- 3. 데이터베이스에서 모든 신청서 가져오기 ---
    const applications = await kv.get<Application[]>('applications') || [];

    // --- 4. 동일 닉네임 찾기 (핵심 로직) ---
    const existingAppIndex = applications.findIndex(app => app.nickname.toLowerCase() === nickname.toLowerCase());

    let successMessage = '';

    if (existingAppIndex > -1) {
      // --- 4-A. 기존 신청자가 있을 경우: 업데이트 ---
      const oldApp = applications[existingAppIndex];

      // 기존 이미지가 있으면 삭제
      if (oldApp.image) {
        await del(oldApp.image);
      }

      // 기존 신청서 내용을 최신 정보로 덮어쓰고, updateCount 1 증가
      applications[existingAppIndex] = {
        ...oldApp, // createdAt 등 이전 값 유지
        currentServerAndAlliance,
        heroPower,
        mainSquad,
        immigrationGrade,
        targetAlliance,
        note,
        image: imageUrl,
        updateCount: (oldApp.updateCount || 0) + 1, // 기존 횟수에 +1
        // 관리자 설정값 초기화
        isConfirmed: false,
        status: '대기중',
      };
      
      successMessage = '신청서가 성공적으로 업데이트되었습니다! / Application updated successfully!';

    } else {
      // --- 4-B. 신규 신청자일 경우: 새로 생성 ---
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
        isConfirmed: false,
        status: '대기중',
        updateCount: 0, // 첫 신청이므로 0
      };
      applications.push(newEntry);

      successMessage = '신청이 성공적으로 제출되었습니다! Thank you! Your application was submitted successfully!';
    }
    
    // --- 5. 변경된 전체 목록을 데이터베이스에 저장 ---
    await kv.set('applications', applications);

    return NextResponse.json({ success: true, message: successMessage });

  } catch (err) {
    console.error('업로드/업데이트 처리 오류:', err);
    const errorMessage = err instanceof Error ? err.message : '서버 오류가 발생했습니다.';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}