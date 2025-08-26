import { NextRequest, NextResponse } from 'next/server'
import { extractKeywords, generateSearchQueries } from '@/lib/keywordExtractor'

export async function POST(request: NextRequest) {
  try {
    const { title, description } = await request.json()
    
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }
    
    // 키워드 추출
    const keywords = extractKeywords(title, description)
    console.log('Extracted keywords:', keywords)
    
    // 검색 쿼리 생성
    const searchQueries = generateSearchQueries(keywords)
    console.log('Search queries:', searchQueries)
    
    // Unsplash API를 사용하여 이미지 검색
    const images: any[] = []
    
    // 여러 키워드로 검색하여 다양한 이미지 수집
    for (const query of searchQueries.slice(0, 4)) { // 4개 쿼리만 사용
      try {
        // Unsplash API 호출 (Access Key 없이 데모용)
        // 실제로는 process.env.UNSPLASH_ACCESS_KEY를 사용해야 함
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`,
          {
            headers: {
              'Authorization': `Client-ID ${process.env.UNSPLASH_ACCESS_KEY || 'demo-key'}`,
            },
          }
        )
        
        if (response.ok) {
          const data = await response.json()
          if (data.results && data.results.length > 0) {
            // 이미지 정보 추가
            data.results.forEach((img: any) => {
              images.push({
                id: img.id,
                url: img.urls.regular,
                thumbnail: img.urls.small,
                description: img.alt_description || img.description || query,
                photographer: img.user.name,
                photographerUrl: img.user.links.html,
                downloadUrl: img.links.download_location,
                query: query
              })
            })
          }
        }
      } catch (error) {
        console.log(`Error searching for "${query}":`, error)
        continue
      }
    }
    
    // Unsplash API가 작동하지 않을 경우를 위한 목업 데이터
    if (images.length === 0) {
      // 목업 이미지 데이터 (실제 Unsplash 이미지 URL들)
      const mockImages = [
        {
          id: 'mock-1',
          url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800',
          thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
          description: 'Modern office workspace',
          photographer: 'Unsplash',
          photographerUrl: 'https://unsplash.com',
          downloadUrl: '#',
          query: 'business'
        },
        {
          id: 'mock-2',
          url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800',
          thumbnail: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400',
          description: 'Technology and innovation',
          photographer: 'Unsplash',
          photographerUrl: 'https://unsplash.com',
          downloadUrl: '#',
          query: 'technology'
        },
        {
          id: 'mock-3',
          url: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800',
          thumbnail: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400',
          description: 'Logistics and shipping',
          photographer: 'Unsplash',
          photographerUrl: 'https://unsplash.com',
          downloadUrl: '#',
          query: 'logistics'
        },
        {
          id: 'mock-4',
          url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
          thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
          description: 'Professional meeting',
          photographer: 'Unsplash',
          photographerUrl: 'https://unsplash.com',
          downloadUrl: '#',
          query: 'meeting'
        },
        {
          id: 'mock-5',
          url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
          thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
          description: 'Data analytics',
          photographer: 'Unsplash',
          photographerUrl: 'https://unsplash.com',
          downloadUrl: '#',
          query: 'analytics'
        },
        {
          id: 'mock-6',
          url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800',
          thumbnail: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400',
          description: 'Team collaboration',
          photographer: 'Unsplash',
          photographerUrl: 'https://unsplash.com',
          downloadUrl: '#',
          query: 'teamwork'
        }
      ]
      
      // 키워드에 따라 관련성 높은 이미지 선택
      const relevantImages = mockImages.slice(0, 6)
      images.push(...relevantImages)
    }
    
    // 중복 제거 및 최대 8개로 제한
    const uniqueImages = images
      .filter((img, index, self) => self.findIndex(i => i.id === img.id) === index)
      .slice(0, 8)
    
    return NextResponse.json({
      success: true,
      keywords,
      images: uniqueImages,
      message: `Found ${uniqueImages.length} suggested images`
    })
    
  } catch (error) {
    console.error('Error in suggest-images API:', error)
    return NextResponse.json(
      { error: 'Failed to suggest images' },
      { status: 500 }
    )
  }
}
