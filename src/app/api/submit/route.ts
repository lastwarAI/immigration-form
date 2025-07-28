import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile } from 'fs/promises';
import path from 'path';
import { put } from '@vercel/blob'; // Vercel Blob의 put 함수 임포트

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

    let imageUrl: string | null = null; // 이미지의 'URL'을 저장할 변수

    // 파일이 있고, 크기가 0보다 큰 경우에만 업로드 로직 실행
    if (file && file.size > 0) {
      // 파일명을 고유하게 만들기 위해 타임스탬프와 원본 파일명 조합
      const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

      // Vercel Blob에 파일 업로드
      const blob = await put(filename, file, {
        access: 'public', // 생성된 URL로 누구나 파일에 접근할 수 있도록 설정
      });

      // 업로드 후 Vercel Blob이 반환해준 고유하고 영구적인 URL을 변수에 저장
      imageUrl = blob.url;
    }

    const newEntry = {
      nickname,
      currentServer,
      targetServer,
      power,
      note,
      image: imageUrl, // JSON 파일에는 이제 파일명이 아닌 '전체 URL'이 저장됨
      createdAt: new Date().toISOString(),
    };
    
    // JSON 파일을 읽고 쓰는 로직은 이전과 동일
    const dataDir = path.join(process.cwd(), 'src', 'app', 'data');
    await mkdir(dataDir, { recursive: true });
    const dataFilePath = path.join(dataDir, 'applications.json');
    
    let applications = [];
    try {
      const fileContent = await readFile(dataFilePath, 'utf-8');
      applications = JSON.parse(fileContent);
    } catch (e) {
      if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
    }

    applications.push(newEntry);
    await writeFile(dataFilePath, JSON.stringify(applications, null, 2));

    return NextResponse.json({ success: true, message: '신청이 성공적으로 제출되었습니다!' });

  } catch (err) {
    console.error('업로드 처리 오류:', err);
    // Vercel Blob 관련 에러도 여기서 잡힘
    const errorMessage = err instanceof Error ? err.message : '서버 오류가 발생했습니다.';
    return NextResponse.json({ success: false, message: errorMessage }, { status: 500 });
  }
}