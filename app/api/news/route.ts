import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const newsFilePath = path.join(process.cwd(), 'data', 'news.json')

export async function GET() {
  try {
    const data = await fs.readFile(newsFilePath, 'utf8')
    return NextResponse.json(JSON.parse(data))
  } catch (error) {
    console.error('Error reading news data:', error)
    return NextResponse.json({ error: 'Failed to load news data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await fs.readFile(newsFilePath, 'utf8')
    const newsData = JSON.parse(data)
    
    await fs.writeFile(newsFilePath, JSON.stringify(newsData, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving news data:', error)
    return NextResponse.json({ error: 'Failed to save news data' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const newData = await request.json()
    await fs.writeFile(newsFilePath, JSON.stringify(newData, null, 2))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating news data:', error)
    return NextResponse.json({ error: 'Failed to update news data' }, { status: 500 })
  }
}
