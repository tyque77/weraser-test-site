import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: NextRequest) {
  try {
    const { path } = await request.json()
    
    // 특정 경로 재검증
    revalidatePath(path || '/')
    revalidatePath('/news')
    revalidatePath('/news/[slug]', 'page')
    
    return NextResponse.json({ revalidated: true })
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating' }, { status: 500 })
  }
}
