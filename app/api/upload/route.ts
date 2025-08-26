import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData()
    const file: File | null = data.get('file') as unknown as File

    if (!file) {
      return NextResponse.json({ error: '파일이 업로드되지 않았습니다.' }, { status: 400 })
    }

    // 파일 확장자 검증
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: '지원하지 않는 파일 형식입니다.' }, { status: 400 })
    }

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: '파일 크기는 5MB를 초과할 수 없습니다.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // uploads 디렉토리 생성
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // 디렉토리가 이미 존재하는 경우 무시
    }

    // 파일명 생성 (타임스탬프 + 원본 파일명)
    const timestamp = Date.now()
    const fileExtension = path.extname(file.name)
    const fileName = `${timestamp}${fileExtension}`
    const filePath = path.join(uploadsDir, fileName)

    // 파일 저장
    await writeFile(filePath, buffer)

    // 클라이언트에게 반환할 URL
    const fileUrl = `/uploads/${fileName}`

    return NextResponse.json({ 
      success: true, 
      url: fileUrl,
      message: '파일이 성공적으로 업로드되었습니다.'
    })

  } catch (error) {
    console.error('파일 업로드 에러:', error)
    return NextResponse.json({ error: '파일 업로드 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
